/**
 * Utility functions for CSV Service Matcher
 */

/**
 * Displays a status message to the user.
 * @param {string} message - The message to display.
 * @param {string} type - The type of message ('success', 'error', 'info').
 */
export const setStatus = (message, type = 'info') => {
    const statusContainer = document.getElementById('status-container');
    if (!statusContainer) return;
    
    statusContainer.textContent = message;
    statusContainer.className = type ? `status-${type}` : '';
    statusContainer.style.display = message ? 'block' : 'none';
};

/**
 * Sleep utility for delays.
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Debounce function to limit how often a function can run.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The delay in milliseconds.
 * @returns {Function} Debounced function.
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Extracts service name from a deployment link.
 * @param {string} link - The deployment link URL.
 * @returns {string} The extracted service name.
 */
export const extractServiceNameFromLink = (link) => {
    if (!link) return '';
    
    // Look for deploy_ pattern in the URL
    const match = link.match(/\/deploy_([^\/]+)\/?$/);
    if (match && match[1]) {
        return match[1];
    }
    
    return '';
};

/**
 * Parses CSV text into an array of objects.
 * It intelligently finds the header row by looking for a key column.
 * @param {string} text - The CSV content as a string.
 * @param {string} keyColumn - A column name that is expected to be in the header.
 * @returns {Array<Object>} An array of objects representing rows.
 */
export const parseCSV = (text, keyColumn) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return [];

    let headerLineIndex = -1;
    let header = [];

    // Search for the header row in the first 10 lines of the file
    const searchLimit = Math.min(lines.length, 10);
    for (let i = 0; i < searchLimit; i++) {
        // Clean up potential header values
        const potentialHeader = lines[i].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        if (potentialHeader.includes(keyColumn)) {
            headerLineIndex = i;
            header = potentialHeader;
            break;
        }
    }

    // If no header is found, we can't process the file
    if (headerLineIndex === -1) {
        return [];
    }

    const rows = lines
        .slice(headerLineIndex + 1)
        .map(line => {
            // Ignore empty lines which might be present in the CSV
            if (line.trim() === '') return null;

            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
            const rowObject = {};
            header.forEach((col, index) => {
                // Create object properties, skipping columns with no header name
                if (col) {
                   rowObject[col] = values[index];
                }
            });
            return rowObject;
        })
        .filter(row => row !== null); // Remove the empty lines we marked as null

    return rows;
};

/**
 * Reads a file and returns its content as text.
 * @param {File} file - The file to read.
 * @returns {Promise<string>} A promise that resolves with the file content.
 */
export const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

/**
 * Parses and validates a versions JSON file.
 * @param {File} file - The JSON file to parse.
 * @returns {Promise<Object>} A promise that resolves with the parsed JSON data.
 */
export const parseVersionsJSON = async (file) => {
    try {
        const content = await readFileAsText(file);
        const jsonData = JSON.parse(content);
        
        // Validate the JSON structure
        if (!jsonData.service_versions || !Array.isArray(jsonData.service_versions)) {
            throw new Error('JSON file must contain a "service_versions" array');
        }
        
        if (jsonData.service_versions.length === 0) {
            throw new Error('service_versions array cannot be empty');
        }
        
        // Validate that each service object has the required structure
        const firstService = jsonData.service_versions[0];
        if (!firstService.service) {
            throw new Error('Each service object must have a "service" key');
        }
        
        return jsonData;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('Invalid JSON format: ' + error.message);
        }
        throw error;
    }
};

/**
 * Parses HTML content to extract links and text separately.
 * @param {string} content - The HTML content to parse.
 * @returns {Object} Object with extracted links and text.
 */
export const parseHtmlContent = (content) => {
    if (!content || typeof content !== 'string') return { text: content || '', links: [] };
    
    // Create a temporary element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const links = [];
    const anchors = tempDiv.querySelectorAll('a[href]');
    
    anchors.forEach((anchor, index) => {
        links.push({
            url: anchor.href,
            text: anchor.textContent || anchor.href
        });
    });
    
    // Get text content without the links
    let textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    return { text: textContent.trim(), links };
};

/**
 * Checks if a column header is a version column.
 * Version columns are formatted as PREFIX_version_fieldname where PREFIX comes from the JSON filename.
 * Legacy format 'version_fieldname' is also supported.
 * @param {string} columnName - The column header name.
 * @param {Array<string>} versionsFileNames - Array of version file names.
 * @returns {boolean} True if this is a version column.
 */
export const isVersionColumn = (columnName, versionsFileNames = []) => {
    if (!columnName) return false;
    
    // Check for "Version {env}" pattern (from "Get Build Versions" feature)
    // Environment names can contain letters, numbers, hyphens, dots, and underscores
    if (/^Version\s+[\w.-]+$/i.test(columnName)) return true;
    
    // Check for legacy 'version_' prefix
    if (columnName.startsWith('version_')) return true;
    
    // Check if it matches any of the current versions file prefix patterns (PREFIX_version_)
    if (versionsFileNames.length > 0) {
        for (const fileName of versionsFileNames) {
            const baseName = fileName.replace(/\.json$/i, '');
            const underscoreIndex = baseName.indexOf('_');
            if (underscoreIndex > 0) {
                const prefix = baseName.substring(0, underscoreIndex);
                if (columnName.startsWith(prefix + '_version_')) {
                    return true;
                }
            } else {
                // If no underscore, check for basename_version_ pattern
                if (columnName.startsWith(baseName + '_version_')) {
                    return true;
                }
            }
        }
    }
    
    // Also check for any PREFIX_version_ pattern where PREFIX doesn't contain underscores
    // This handles cases where we're looking at data from a previous run
    const versionIndex = columnName.indexOf('_version_');
    if (versionIndex > 0) {
        // Check if there's a prefix before _version_
        const beforeVersion = columnName.substring(0, versionIndex);
        // If the part before _version_ doesn't have underscores, it's likely a file prefix
        if (!beforeVersion.includes('_')) {
            return true;
        }
    }
    
    return false;
};

/**
 * Checks if a column name is a Bundle column (like "Bundle prod", "Bundle staging").
 * @param {string} columnName - The column name to check.
 * @returns {boolean} True if it's a Bundle column.
 */
export const isBundleColumn = (columnName) => {
    if (!columnName) return false;
    
    // Check for "Bundle {env}" pattern (from "Get Build Versions" feature)
    // Environment names can contain letters, numbers, hyphens, dots, and underscores
    return /^Bundle\s+[\w.-]+$/i.test(columnName);
};

/**
 * Compares two version strings, ignoring build numbers (last segment after underscore).
 * @param {string} version1 - First version to compare.
 * @param {string} version2 - Second version to compare.
 * @returns {boolean} True if versions match (ignoring build numbers).
 */
export const areVersionsEqual = (version1, version2) => {
    if (!version1 || !version2) return false;
    
    const v1Lower = version1.toLowerCase().trim();
    const v2Lower = version2.toLowerCase().trim();
    
    // Split by underscore to get parts
    const v1Parts = v1Lower.split('_');
    const v2Parts = v2Lower.split('_');
    
    // If one version has more parts (e.g., includes build number), compare without the last part
    // Example: production_w42_20251013_123 should match production_w42_20251013
    if (v1Parts.length === v2Parts.length) {
        // Same number of parts, direct comparison
        return v1Lower === v2Lower;
    } else if (v1Parts.length > v2Parts.length) {
        // v1 has more parts (likely has build number), compare v1 without last part to v2
        const v1WithoutBuild = v1Parts.slice(0, v2Parts.length).join('_');
        return v1WithoutBuild === v2Lower;
    } else {
        // v2 has more parts (likely has build number), compare v2 without last part to v1
        const v2WithoutBuild = v2Parts.slice(0, v1Parts.length).join('_');
        return v2WithoutBuild === v1Lower;
    }
};

/**
 * Sorts data by a specific column.
 * @param {Array<Object>} data - The data to sort.
 * @param {string} column - The column to sort by.
 * @param {string} direction - 'asc' or 'desc'.
 * @returns {Array<Object>} The sorted data.
 */
export const sortData = (data, column, direction) => {
    if (!column) return data;
    
    return [...data].sort((a, b) => {
        const aVal = a[column] || '';
        const bVal = b[column] || '';
        
        // Try to parse as numbers first
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Otherwise sort as strings
        const comparison = aVal.toString().localeCompare(bVal.toString());
        return direction === 'asc' ? comparison : -comparison;
    });
};

/**
 * Expands columns that contain multiple links into separate columns.
 * @param {Array<Object>} data - The data to process.
 * @returns {Object} Object with expanded data and new headers.
 */
export const expandLinksIntoColumns = (data) => {
    if (data.length === 0) return { expandedData: data, newHeaders: [] };
    
    const expandedData = [];
    const additionalHeaders = new Set();
    
    data.forEach(row => {
        const newRow = {};
        
        Object.keys(row).forEach(column => {
            const content = row[column] || '';
            const parsed = parseHtmlContent(content);
            
            if (parsed.links.length > 0) {
                // If there's text content, keep the original column for text
                if (parsed.text) {
                    newRow[column] = parsed.text;
                } else {
                    newRow[column] = '';
                }
                
                // Create separate columns for each link
                parsed.links.forEach((link, index) => {
                    const linkColumnName = parsed.links.length === 1 
                        ? `${column}_Link` 
                        : `${column}_Link_${index + 1}`;
                    newRow[linkColumnName] = link.url;
                    additionalHeaders.add(linkColumnName);
                });
            } else {
                // No links, keep original content
                newRow[column] = content;
            }
        });
        
        expandedData.push(newRow);
    });
    
    return { expandedData, newHeaders: Array.from(additionalHeaders) };
};
