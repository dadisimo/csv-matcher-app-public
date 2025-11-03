/**
 * Data Processing Module for CSV Service Matcher
 * Handles all data enrichment and processing logic
 */

import { DEFAULT_DEPLOYMENT_LINKS, DEFAULT_ENV_REGEX } from './config.js';
import { extractServiceNameFromLink, isVersionColumn } from './utils.js';

/**
 * Gets deployment links from localStorage or defaults.
 * @returns {Array<string>} Array of deployment link URLs.
 */
export const getDeploymentLinks = () => {
    const saved = localStorage.getItem('jiraDeploymentLinks');
    if (saved) {
        return saved.split('\n').map(link => link.trim()).filter(link => link);
    }
    return DEFAULT_DEPLOYMENT_LINKS.split('\n').map(link => link.trim()).filter(link => link);
};

/**
 * Creates base data from deployment links.
 * Each service gets Service0 and Jenkins Link columns.
 * @returns {Array<Object>} Base data array.
 */
export const createBaseDataFromDeploymentLinks = () => {
    const deploymentLinks = getDeploymentLinks();
    const baseData = [];
    const processedServices = new Set();
    
    deploymentLinks.forEach(link => {
        const serviceName = extractServiceNameFromLink(link);
        if (serviceName && !processedServices.has(serviceName.toLowerCase())) {
            baseData.push({
                'Service0': serviceName,
                'Jenkins Link': `<a href="${link}" target="_blank" rel="noopener noreferrer">Jenkins Link</a>`
            });
            processedServices.add(serviceName.toLowerCase());
        }
    });
    
    return baseData;
};

/**
 * Enriches base data with JIRA information by matching service names.
 * @param {Array<Object>} baseData - The base data from deployment links.
 * @param {Array<Object>} jiraData - Parsed JIRA CSV data.
 * @returns {Array<Object>} Enriched data with JIRA columns added.
 */
export const enrichWithJiraData = (baseData, jiraData) => {
    if (!jiraData || jiraData.length === 0) return baseData;
    
    return baseData.map(row => {
        const serviceName = (row['Service0'] || '').toLowerCase();
        // Remove headless suffix for comparison
        const serviceToCheck = serviceName.replace(/-headless$/, '');
        
        // Find matching JIRA row by checking if Summary contains the service name
        const matchingJiraRow = jiraData.find(jiraRow => {
            const summary = (jiraRow['Summary'] || '').toLowerCase();
            // Check if service name appears in the summary
            const serviceNameRegex = new RegExp('(?:^|\\s|-)' + serviceToCheck.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/-/g, '[-_]') + '(?:\\s|$|-|_)', 'i');
            return serviceNameRegex.test(summary);
        });
        
        if (matchingJiraRow) {
            // Add JIRA columns to the row, but PRESERVE existing columns (don't overwrite)
            const enrichedRow = { ...row };
            Object.keys(matchingJiraRow).forEach(key => {
                // Only add the column if it doesn't already exist in the base row
                if (!(key in enrichedRow)) {
                    enrichedRow[key] = matchingJiraRow[key];
                }
            });
            return enrichedRow;
        }
        
        return row;
    });
};

/**
 * Enriches base data with Services CSV information by matching Service0.
 * @param {Array<Object>} baseData - The base data to enrich.
 * @param {Array<Array<Object>>} allServicesData - Array of parsed Services CSV data arrays.
 * @param {Array<string>} fileNames - Array of service file names.
 * @returns {Array<Object>} Enriched data with Services columns added.
 */
export const enrichWithServicesData = (baseData, allServicesData, fileNames) => {
    if (!allServicesData || allServicesData.length === 0) return baseData;
    
    const enrichedData = [];
    const servicesWithMatches = new Set();
    
    // For each base service, find matching rows in each services file
    baseData.forEach(baseRow => {
        const baseServiceName = (baseRow['Service0'] || '').toLowerCase();
        // Remove headless suffix for comparison
        const baseToCheck = baseServiceName.replace(/-headless$/, '');
        let foundMatch = false;
        
        // Check each services file
        allServicesData.forEach((servicesData, fileIndex) => {
            const fileName = fileNames[fileIndex];
            
            // Find matching service in this file
            const matchingService = servicesData.find(serviceRow => {
                const serviceName = (serviceRow['Service0'] || '').toLowerCase();
                // Remove headless suffix for comparison
                const serviceToCheck = serviceName.replace(/-headless$/, '');
                return serviceToCheck === baseToCheck || serviceToCheck.replace(/-/g, '_') === baseToCheck.replace(/-/g, '_');
            });
            
            if (matchingService) {
                // Create enriched row - PRESERVE base data, only ADD new columns
                const enrichedRow = { ...baseRow };
                Object.keys(matchingService).forEach(key => {
                    // Only add columns that don't already exist
                    if (!(key in enrichedRow)) {
                        enrichedRow[key] = matchingService[key];
                    }
                });
                // Always add Environment column (it's unique per file)
                enrichedRow['Environment'] = fileName;
                enrichedData.push(enrichedRow);
                foundMatch = true;
                servicesWithMatches.add(baseServiceName);
            }
        });
        
        // If no match found in any Services CSV file, keep the base row
        if (!foundMatch) {
            enrichedData.push(baseRow);
        }
    });
    
    return enrichedData;
};

/**
 * Enriches base data with versions from JSON files.
 * @param {Array<Object>} baseData - The base data to enrich.
 * @param {Array<Object>} versionsDataArray - Array of version data objects.
 * @returns {Array<Object>} Enriched data with version columns added.
 */
export const enrichWithVersionsData = (baseData, versionsDataArray) => {
    if (!versionsDataArray || versionsDataArray.length === 0) return baseData;
    
    return baseData.map(row => {
        const serviceName = (row['Service0'] || '').toLowerCase();
        const enrichedRow = { ...row };
        
        // Process each JSON file
        versionsDataArray.forEach(versionInfo => {
            const { data: versionsJson, fileName } = versionInfo;
            
            if (!versionsJson || !versionsJson.service_versions) return;
            
            // Find matching service in this JSON file
            const matchingService = versionsJson.service_versions.find(serviceObj => {
                const jsonServiceName = (serviceObj.service || '').toLowerCase();
                const serviceToCheck = jsonServiceName.replace(/-headless$/, '');
                const baseToCheck = serviceName.replace(/-headless$/, '');
                return serviceToCheck === baseToCheck || serviceToCheck.replace(/-/g, '_') === baseToCheck.replace(/-/g, '_');
            });
            
            if (matchingService) {
                // Extract prefix from filename
                const baseName = fileName.replace(/\.json$/i, '');
                const underscoreIndex = baseName.indexOf('_');
                let columnPrefix = 'version';
                if (underscoreIndex > 0) {
                    columnPrefix = `${baseName.substring(0, underscoreIndex)}_version`;
                } else {
                    columnPrefix = `${baseName}_version`;
                }
                
                // Add version columns with prefix (only if not already present)
                Object.keys(matchingService).forEach(key => {
                    if (key !== 'service') {
                        const columnName = `${columnPrefix}_${key}`;
                        // Only add if column doesn't already exist
                        if (!(columnName in enrichedRow)) {
                            enrichedRow[columnName] = matchingService[key] || '';
                        }
                    }
                });
            }
        });
        
        return enrichedRow;
    });
};

/**
 * Creates rows for all services found in deployment links.
 * Can be called even without any files uploaded.
 * @returns {Object} Information about services added and their names.
 */
export const addAllServicesFromDeploymentLinks = (mergedData, mergedHeaders) => {
    const deploymentLinks = getDeploymentLinks();
    
    if (deploymentLinks.length === 0) {
        return { servicesAdded: 0, serviceNames: [], newRows: [] };
    }

    const extractedServices = new Map(); // service name -> deployment link
    
    // Extract all service names from deployment links
    deploymentLinks.forEach(link => {
        const serviceName = extractServiceNameFromLink(link);
        if (serviceName && !extractedServices.has(serviceName)) {
            extractedServices.set(serviceName, link);
        }
    });
    
    // If we have existing data, add the services that don't already exist
    if (mergedData.length > 0) {
        const existingServices = new Set(
            mergedData.map(row => (row['Service0'] || '').trim().toLowerCase().replace(/-headless$/, ''))
        );
        
        let servicesAdded = 0;
        const newRows = [];
        extractedServices.forEach((link, serviceName) => {
            // Remove headless suffix for comparison
            const serviceToCheck = serviceName.toLowerCase().replace(/-headless$/, '');
            if (!existingServices.has(serviceToCheck)) {
                // Create a new row with the service name and Jenkins link
                const newRow = {
                    'Service0': serviceName,
                    'Jenkins Link': `<a href="${link}" target="_blank" rel="noopener noreferrer">Jenkins Link</a>`
                };
                
                // Add empty values for other columns that might exist
                mergedHeaders.forEach(header => {
                    if (!(header in newRow)) {
                        newRow[header] = '';
                    }
                });
                
                newRows.push(newRow);
                servicesAdded++;
            }
        });
        
        return { servicesAdded, serviceNames: Array.from(extractedServices.keys()), newRows };
    } else {
        // No existing data, create initial rows for all services
        const newRows = [];
        extractedServices.forEach((link, serviceName) => {
            newRows.push({
                'Service0': serviceName,
                'Jenkins Link': `<a href="${link}" target="_blank" rel="noopener noreferrer">Jenkins Link</a>`
            });
        });
        
        return { 
            servicesAdded: newRows.length, 
            serviceNames: Array.from(extractedServices.keys()),
            newRows 
        };
    }
};

/**
 * Organizes headers in a logical order.
 * @param {Set<string>} allHeaders - All available headers.
 * @param {Object} originalJiraData - Original JIRA data for header extraction.
 * @param {Array<string>} versionsFileNames - Version file names for column detection.
 * @returns {Array<string>} Organized headers array.
 */
export const organizeHeaders = (allHeaders, originalJiraData, versionsFileNames) => {
    // 1. Service0 (always first)
    // 2. Jenkins Link
    // 3. Environment (if exists from Services CSV)
    // 4. JIRA columns
    // 5. Services CSV columns
    // 6. Version columns
    const orderedHeaders = ['Service0', 'Jenkins Link'];
    
    // Add Environment if it exists
    if (allHeaders.has('Environment')) {
        orderedHeaders.push('Environment');
    }
    
    // Add JIRA columns (if JIRA file was provided)
    if (originalJiraData && originalJiraData.length > 0) {
        const jiraHeaders = Object.keys(originalJiraData[0]).filter(h => 
            h !== 'Service0' && 
            !orderedHeaders.includes(h) &&
            !isVersionColumn(h, versionsFileNames)
        );
        orderedHeaders.push(...jiraHeaders);
    }
    
    // Add other columns (Services CSV columns, link columns, etc.)
    const versionHeaders = [];
    const otherHeaders = [];
    allHeaders.forEach(header => {
        if (!orderedHeaders.includes(header)) {
            if (isVersionColumn(header, versionsFileNames)) {
                versionHeaders.push(header);
            } else {
                otherHeaders.push(header);
            }
        }
    });
    
    return [...orderedHeaders, ...otherHeaders, ...versionHeaders];
};
