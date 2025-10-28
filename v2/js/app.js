/**
 * Main Application Controller for CSV Service Matcher
 * Coordinates all modules and handles event listeners
 */

import { parseCSV, readFileAsText, parseVersionsJSON, setStatus, isVersionColumn, sortData } from './utils.js';
import { 
    createBaseDataFromDeploymentLinks, 
    enrichWithJiraData, 
    enrichWithServicesData, 
    enrichWithVersionsData,
    organizeHeaders,
    addAllServicesFromDeploymentLinks,
    getDeploymentLinks
} from './dataProcessor.js';
import { 
    initializeTableData, 
    refreshTable, 
    initializeSortOptions, 
    createColumnFilter,
    removeColumn,
    showAllColumns,
    deleteSelectedRows,
    restoreDeletedRows,
    setSortSettings,
    getSortSettings,
    setFilterStates,
    getMergedData,
    getMergedHeaders,
    getVisibleHeaders,
    getFilteredData
} from './tableRenderer.js';
import { convertToCSV, downloadFile, copyTableAsImage } from './exporter.js';
import { 
    openSettingsModal, 
    closeSettingsModal, 
    downloadJenkinsScript,
    refreshBuildLinks,
    refreshBuildLinks2,
    updateRefreshButtonState,
    updateRefreshButton2State,
    showLastSuccessfulBuilds,
    loadJiraDeploymentLinks,
    saveJiraDeploymentLinks,
    showServiceHealth,
    getBuildVersions
} from './settings.js';

// Global state
let servicesFileNames = [];
let versionsData = [];
let versionsFileNames = [];

/**
 * Initializes the application and sets up all event listeners.
 */
export function initializeApp() {
    // Load settings on startup to ensure credentials are available
    loadJiraDeploymentLinks();
    saveJiraDeploymentLinks();
    
    setupEventListeners();
    updateProcessButtonState(); // Check if deployment links exist
    setStatus('Ready. Upload files or configure settings to get started.');
}

/**
 * Sets up all event listeners for the application.
 */
function setupEventListeners() {
    console.log('=== setupEventListeners called ===');
    // File inputs
    const jiraFileInput = document.getElementById('jira-file');
    const servicesFileInput = document.getElementById('services-file');
    const versionsFileInput = document.getElementById('versions-file');
    
    // Buttons
    const processBtn = document.getElementById('process-btn');
    const resetBtn = document.getElementById('reset-btn');
    const downloadBtn = document.getElementById('download-btn');
    const copySlackBtn = document.getElementById('copy-slack-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsBackBtn = document.getElementById('settings-back-btn');
    const downloadScriptBtn = document.getElementById('download-script-btn');
    const addJiraLinksBtn = document.getElementById('add-jira-links-btn');
    const showBuildsBtn = document.getElementById('show-builds-btn');
    const showHealthBtn = document.getElementById('show-health-btn');
    const getBuildVersionsBtn = document.getElementById('get-build-versions-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const restoreRowsBtn = document.getElementById('restore-rows-btn');
    const showAllColumnsBtn = document.getElementById('show-all-columns');
    
    // Table controls
    const sortColumnSelect = document.getElementById('sort-column');
    const sortDirectionBtn = document.getElementById('sort-direction');
    const showUnhealthyOnlyToggle = document.getElementById('show-unhealthy-only');
    const showUnequalVersionsOnlyToggle = document.getElementById('show-unequal-versions-only');
    const showUnequalBundlesOnlyToggle = document.getElementById('show-unequal-bundles-only');
    const ignoreEmptyColumnsToggle = document.getElementById('ignore-empty-columns');
    const showOnlyChngsToggle = document.getElementById('show-only-chngs');
    const showBundleVersionsToggle = document.getElementById('show-bundle-versions');
    const columnFilter = document.getElementById('column-filter');
    const resultsTable = document.getElementById('results-table');
    
    // Main actions
    if (processBtn) processBtn.addEventListener('click', handleProcess);
    if (resetBtn) resetBtn.addEventListener('click', handleReset);
    if (downloadBtn) downloadBtn.addEventListener('click', handleDownload);
    if (copySlackBtn) copySlackBtn.addEventListener('click', handleCopyAsImage);
    
    // Settings
    if (settingsBtn) settingsBtn.addEventListener('click', openSettingsModal);
    if (settingsBackBtn) settingsBackBtn.addEventListener('click', () => {
        closeSettingsModal(() => {
            updateProcessButtonState(); // Update button state when settings close
            const mergedData = getMergedData();
            if (mergedData.length > 0) {
                refreshTable();
            }
        });
    });
    if (downloadScriptBtn) downloadScriptBtn.addEventListener('click', downloadJenkinsScript);
    
    // Jenkins configuration (Deployment Links)
    const toggleJenkinsConfigBtn = document.getElementById('toggle-jenkins-config-btn');
    const refreshBuildLinksBtn = document.getElementById('refresh-build-links-btn');
    const jenkinsConfigSection = document.getElementById('jenkins-config-section');
    const jenkinsDeploysUrlInput = document.getElementById('jenkins-deploys-url');
    const jenkinsApiUsernameInput = document.getElementById('jenkins-api-username');
    const jenkinsApiPassInput = document.getElementById('jenkins-api-pass');
    
    if (toggleJenkinsConfigBtn) {
        toggleJenkinsConfigBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (jenkinsConfigSection) {
                jenkinsConfigSection.classList.toggle('hidden');
            }
        }, false);
    }
    
    if (refreshBuildLinksBtn) {
        refreshBuildLinksBtn.addEventListener('click', function(e) {
            e.preventDefault();
            refreshBuildLinks();
        }, false);
    }
    
    // Update refresh button state on input changes
    if (jenkinsDeploysUrlInput && jenkinsApiUsernameInput && jenkinsApiPassInput) {
        [jenkinsDeploysUrlInput, jenkinsApiUsernameInput, jenkinsApiPassInput].forEach(input => {
            input.addEventListener('input', updateRefreshButtonState);
        });
    }
    
    // Jenkins configuration 2 (Build Links)
    const toggleJenkinsConfig2Btn = document.getElementById('toggle-jenkins-config-2-btn');
    const refreshBuildLinks2Btn = document.getElementById('refresh-build-links-2-btn');
    const jenkinsConfig2Section = document.getElementById('jenkins-config-2-section');
    const jenkinsBuildsUrlInput = document.getElementById('jenkins-builds-url');
    const jenkinsBuildsUsernameInput = document.getElementById('jenkins-builds-username');
    const jenkinsBuildsPassInput = document.getElementById('jenkins-builds-pass');
    
    if (toggleJenkinsConfig2Btn) {
        toggleJenkinsConfig2Btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (jenkinsConfig2Section) {
                jenkinsConfig2Section.classList.toggle('hidden');
            }
        }, false);
    }
    
    if (refreshBuildLinks2Btn) {
        refreshBuildLinks2Btn.addEventListener('click', function(e) {
            e.preventDefault();
            refreshBuildLinks2();
        }, false);
    }
    
    // Update refresh button 2 state on input changes
    if (jenkinsBuildsUrlInput && jenkinsBuildsUsernameInput && jenkinsBuildsPassInput) {
        [jenkinsBuildsUrlInput, jenkinsBuildsUsernameInput, jenkinsBuildsPassInput].forEach(input => {
            input.addEventListener('input', updateRefreshButton2State);
        });
    }
    
    // Row actions
    if (addJiraLinksBtn) addJiraLinksBtn.addEventListener('click', handleAddJiraLinks);
    if (showBuildsBtn) showBuildsBtn.addEventListener('click', handleShowBuilds);
    if (showHealthBtn) showHealthBtn.addEventListener('click', handleShowHealth);
    if (getBuildVersionsBtn) getBuildVersionsBtn.addEventListener('click', handleGetBuildVersions);
    if (deleteSelectedBtn) deleteSelectedBtn.addEventListener('click', deleteSelectedRows);
    if (restoreRowsBtn) restoreRowsBtn.addEventListener('click', restoreDeletedRows);
    
    // Column controls
    if (showAllColumnsBtn) showAllColumnsBtn.addEventListener('click', showAllColumns);
    
    // Filter toggles
    console.log('Setting up filter toggles...');
    console.log('showUnhealthyOnlyToggle element:', showUnhealthyOnlyToggle);
    if (showUnhealthyOnlyToggle) {
        showUnhealthyOnlyToggle.addEventListener('change', () => {
            console.log('*** CHECKBOX CHANGED ***', showUnhealthyOnlyToggle.checked);
            setFilterStates({ showUnhealthyOnly: showUnhealthyOnlyToggle.checked });
            refreshTable();
        });
        console.log('Event listener attached to showUnhealthyOnlyToggle');
    } else {
        console.error('showUnhealthyOnlyToggle element NOT FOUND!');
    }
    
    if (showUnequalVersionsOnlyToggle) {
        showUnequalVersionsOnlyToggle.addEventListener('change', () => {
            setFilterStates({ showUnequalVersionsOnly: showUnequalVersionsOnlyToggle.checked });
            refreshTable();
        });
    }
    
    if (showUnequalBundlesOnlyToggle) {
        showUnequalBundlesOnlyToggle.addEventListener('change', () => {
            setFilterStates({ showUnequalBundlesOnly: showUnequalBundlesOnlyToggle.checked });
            refreshTable();
        });
    }
    
    if (ignoreEmptyColumnsToggle) {
        ignoreEmptyColumnsToggle.addEventListener('change', refreshTable);
    }
    
    if (showOnlyChngsToggle) {
        showOnlyChngsToggle.addEventListener('change', () => {
            setFilterStates({ showOnlyChngs: showOnlyChngsToggle.checked });
            refreshTable();
        });
    }
    
    // Show/hide bundle version columns
    if (showBundleVersionsToggle) {
        showBundleVersionsToggle.addEventListener('change', () => {
            toggleBundleColumns(showBundleVersionsToggle.checked);
        });
    }
    
    // Table header sorting
    if (resultsTable) {
        resultsTable.addEventListener('click', (e) => {
            const header = e.target.closest('.sort-header');
            if (header) {
                const column = header.getAttribute('data-column');
                // Get current sort state from tableRenderer
                const { sortColumn: currentColumn, sortDirection: currentDirection } = getSortSettings();
                
                // Toggle direction if clicking same column, otherwise use 'asc'
                const newDirection = (currentColumn === column && currentDirection === 'asc') ? 'desc' : 'asc';
                
                setSortSettings(column, newDirection);
                refreshTable();
            }
            
            // Handle cell editing
            const editableCell = e.target.closest('.editable-cell');
            if (editableCell && !e.target.closest('a')) {
                makeEditable(editableCell);
            }
        });
    }
    
    // Settings modal - close on outside click
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                closeSettingsModal(() => {
                    const mergedData = getMergedData();
                    if (mergedData.length > 0) {
                        refreshTable();
                    }
                });
            }
        });
    }
    
    // File input changes - trigger reprocess
    if (versionsFileInput) {
        versionsFileInput.addEventListener('change', async () => {
            const mergedData = getMergedData();
            if (mergedData.length > 0) {
                await reprocessData();
            }
        });
    }
}

/**
 * Makes a table cell editable.
 * @param {HTMLElement} cell - The cell to make editable.
 */
function makeEditable(cell) {
    const rowIndex = parseInt(cell.getAttribute('data-row'));
    const columnName = cell.getAttribute('data-column');
    const hasLink = cell.getAttribute('data-has-link') === 'true';
    
    // Extract the current value
    let currentValue;
    let originalHTML;
    
    if (hasLink) {
        // Save the original HTML to restore link structure if needed
        originalHTML = cell.innerHTML;
        // Extract text content from links
        currentValue = cell.textContent;
    } else {
        currentValue = cell.textContent;
    }
    
    // Check if already being edited
    if (cell.querySelector('.cell-editor')) {
        return;
    }
    
    // Create input element
    const input = document.createElement('textarea');
    input.className = 'cell-editor';
    input.value = currentValue;
    
    // Clear cell content and append input
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();
    
    // Save on Enter or blur
    const saveEdit = () => {
        const newValue = input.value;
        
        // Update the data first
        const mergedData = getMergedData();
        if (mergedData[rowIndex]) {
            mergedData[rowIndex][columnName] = newValue;
        }
        
        // If the cell had a link and the value didn't change significantly, restore the link
        if (hasLink && newValue.trim() === currentValue.trim()) {
            cell.innerHTML = originalHTML;
        } else {
            // Otherwise just set text content
            cell.textContent = newValue;
            // If it was a link cell but value changed, remove the link marker
            if (hasLink) {
                cell.removeAttribute('data-has-link');
            }
        }
    };
    
    // Cancel on Escape
    const cancelEdit = () => {
        if (hasLink) {
            cell.innerHTML = originalHTML;
        } else {
            cell.textContent = currentValue;
        }
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    });
}

/**
 * Updates the Process Files button state based on deployment links.
 */
function updateProcessButtonState() {
    const processBtn = document.getElementById('process-btn');
    if (!processBtn) return;
    
    const deploymentLinks = getDeploymentLinks();
    
    if (deploymentLinks.length === 0) {
        processBtn.disabled = true;
        processBtn.title = 'Please configure Jenkins Deployment Links in Settings first';
    } else {
        processBtn.disabled = false;
        processBtn.title = 'Process uploaded files with configured deployment links';
    }
}

/**
 * Toggles visibility of Bundle columns.
 * @param {boolean} show - Whether to show or hide bundle columns
 */
function toggleBundleColumns(show) {
    const allHeaders = getMergedHeaders();
    const currentVisible = getVisibleHeaders();
    
    // Find all Bundle columns
    const bundleColumns = allHeaders.filter(h => /^Bundle\s+[\w.-]+$/i.test(h));
    
    let newVisibleHeaders;
    if (show) {
        // Add bundle columns to visible headers (avoid duplicates)
        newVisibleHeaders = [...new Set([...currentVisible, ...bundleColumns])];
    } else {
        // Remove bundle columns from visible headers
        newVisibleHeaders = currentVisible.filter(h => !bundleColumns.includes(h));
    }
    
    // Update the table with new visible headers
    createColumnFilter(allHeaders, newVisibleHeaders);
    refreshTable();
}

/**
 * Resets the page to its initial state.
 */
function handleReset() {
    location.reload();
}

/**
 * Handles the main file processing.
 */
async function handleProcess() {
    const jiraFileInput = document.getElementById('jira-file');
    const servicesFileInput = document.getElementById('services-file');
    const versionsFileInput = document.getElementById('versions-file');
    const processBtn = document.getElementById('process-btn');
    const resultsContainer = document.getElementById('results-container');
    const tableControls = document.getElementById('table-controls');
    const summaryText = document.getElementById('summary-text');
    
    const jiraFile = jiraFileInput?.files[0];
    const servicesFiles = servicesFileInput ? Array.from(servicesFileInput.files) : [];
    const versionsFiles = versionsFileInput ? Array.from(versionsFileInput.files) : [];

    // Validation - deployment links are now REQUIRED (they are the base)
    const deploymentLinks = getDeploymentLinks();
    
    if (deploymentLinks.length === 0) {
        setStatus('Deployment links are required! Please configure them in Settings first. Deployment links define the base services that will be enriched with data from uploaded files.');
        return;
    }
    
    setStatus('Processing files...', 'loading');
    if (processBtn) processBtn.disabled = true;
    if (resultsContainer) resultsContainer.classList.add('hidden');
    if (tableControls) tableControls.classList.add('hidden');

    try {
        // Store services file names
        servicesFileNames = servicesFiles.map(file => file.name.replace('.csv', ''));
        
        // Parse versions JSON files if provided
        if (versionsFiles.length > 0) {
            try {
                versionsData = [];
                versionsFileNames = [];
                for (const file of versionsFiles) {
                    const data = await parseVersionsJSON(file);
                    versionsData.push({ data, fileName: file.name });
                    versionsFileNames.push(file.name);
                }
                setStatus('Processing files and versions...', 'loading');
            } catch (error) {
                throw new Error(`Versions JSON error: ${error.message}`);
            }
        } else {
            versionsData = [];
            versionsFileNames = [];
        }
        
        let jiraData = null;
        let allServicesData = [];
        
        // Check if Services CSV files are provided
        if (servicesFiles.length > 0) {
            const servicesTexts = await Promise.all(servicesFiles.map(file => readFileAsText(file)));
            allServicesData = servicesTexts.map(text => parseCSV(text, 'Service0'));
            
            for (let i = 0; i < allServicesData.length; i++) {
                if (allServicesData[i].length === 0) {
                    throw new Error(`Services CSV "${servicesFiles[i].name}" is missing data or the "Service0" column could not be found.`);
                }
            }
        }
        
        // Check if JIRA file is provided
        if (jiraFile) {
            const jiraText = await readFileAsText(jiraFile);
            jiraData = parseCSV(jiraText, 'Summary');
            
            if (jiraData.length === 0) {
                throw new Error('JIRA CSV is missing data or the "Summary" column could not be found.');
            }
            
            // Automatically check "Show only CHNGS" when Jira CSV is imported
            const showOnlyChngsToggle = document.getElementById('show-only-chngs');
            if (showOnlyChngsToggle) {
                showOnlyChngsToggle.checked = true;
            }
        }
        
        // Store original data globally for reprocessing
        window.originalJiraData = jiraData;
        window.originalAllServicesData = allServicesData;
        window.originalServicesFileNames = servicesFileNames;
        
        // NEW APPROACH: Always start with deployment links as the base
        let baseData = createBaseDataFromDeploymentLinks();
        const matchesFound = baseData.length;
        
        if (baseData.length > 0) {
            // Step 1: Enrich with Services CSV data
            if (servicesFiles.length > 0 && allServicesData.length > 0) {
                baseData = enrichWithServicesData(baseData, allServicesData, servicesFileNames);
            }
            
            // Step 2: Enrich with JIRA information
            if (jiraData && jiraData.length > 0) {
                baseData = enrichWithJiraData(baseData, jiraData);
            }
            
            // Step 3: Enrich with Versions JSON data
            if (versionsFiles.length > 0 && versionsData.length > 0) {
                baseData = enrichWithVersionsData(baseData, versionsData);
            }
        }
        
        // Build headers from the processed data
        const allHeaders = new Set();
        baseData.forEach(row => {
            Object.keys(row).forEach(key => allHeaders.add(key));
        });
        
        const mergedHeaders = organizeHeaders(allHeaders, jiraData, versionsFileNames);
        const visibleHeaders = [...mergedHeaders];
        
        // Initialize table data
        initializeTableData(baseData, mergedHeaders, versionsFileNames);
        
        // Update summary text
        const filesProvided = [];
        if (jiraData) filesProvided.push('JIRA');
        if (allServicesData.length > 0) {
            filesProvided.push(`${servicesFileNames.length} Services CSV`);
        }
        if (versionsFiles.length > 0) filesProvided.push(`${versionsFiles.length} Versions JSON`);
        
        if (summaryText) {
            if (filesProvided.length === 0) {
                summaryText.textContent = `Displaying ${matchesFound} service(s) from deployment links.`;
            } else {
                summaryText.textContent = `Processing complete. Displaying ${matchesFound} service(s) from deployment links, enriched with: ${filesProvided.join(', ')}.`;
            }
        }
        
        // Update UI
        initializeSortOptions(mergedHeaders);
        createColumnFilter(mergedHeaders, visibleHeaders);
        
        // Apply "Show only CHNGS" filter if it was checked (automatically when Jira CSV is imported)
        const showOnlyChngsToggle = document.getElementById('show-only-chngs');
        if (showOnlyChngsToggle?.checked) {
            setFilterStates({ showOnlyChngs: true });
        }
        
        refreshTable();
        
        // Show results
        if (resultsContainer) resultsContainer.classList.remove('hidden');
        if (tableControls) tableControls.classList.remove('hidden');
        
        // Show reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) resetBtn.classList.remove('hidden');
        
        setStatus('');
        
    } catch (error) {
        setStatus(error.message, 'error');
    } finally {
        if (processBtn) processBtn.disabled = false;
    }
}

/**
 * Reprocesses data when version files change.
 */
async function reprocessData() {
    const mergedData = getMergedData();
    if (mergedData.length === 0) return;
    
    const versionsFileInput = document.getElementById('versions-file');
    const summaryText = document.getElementById('summary-text');
    
    // Handle versions files if present
    const versionsFiles = versionsFileInput ? Array.from(versionsFileInput.files) : [];
    if (versionsFiles.length > 0) {
        try {
            versionsData = [];
            versionsFileNames = [];
            for (const file of versionsFiles) {
                const data = await parseVersionsJSON(file);
                versionsData.push({ data, fileName: file.name });
                versionsFileNames.push(file.name);
            }
        } catch (error) {
            setStatus(`Versions JSON error: ${error.message}`, 'error');
            return;
        }
    } else {
        versionsData = [];
        versionsFileNames = [];
    }
    
    // USE THE SAME NEW ENRICHMENT APPROACH AS handleProcess
    let baseData = createBaseDataFromDeploymentLinks();
    const matchesFound = baseData.length;
    
    if (baseData.length > 0) {
        // Step 1: Enrich with Services CSV data
        if (window.originalAllServicesData && window.originalAllServicesData.length > 0) {
            baseData = enrichWithServicesData(baseData, window.originalAllServicesData, window.originalServicesFileNames);
        }
        
        // Step 2: Enrich with JIRA information
        if (window.originalJiraData && window.originalJiraData.length > 0) {
            baseData = enrichWithJiraData(baseData, window.originalJiraData);
        }
        
        // Step 3: Enrich with Versions JSON data
        if (versionsFiles.length > 0 && versionsData.length > 0) {
            baseData = enrichWithVersionsData(baseData, versionsData);
        }
    }
    
    // Build headers
    const allHeaders = new Set();
    baseData.forEach(row => {
        Object.keys(row).forEach(key => allHeaders.add(key));
    });
    
    const mergedHeaders = organizeHeaders(allHeaders, window.originalJiraData, versionsFileNames);
    const visibleHeaders = [...mergedHeaders];
    
    // Update table data
    initializeTableData(baseData, mergedHeaders, versionsFileNames);
    
    // Update summary
    const filesProvided = [];
    if (window.originalJiraData) filesProvided.push('JIRA');
    if (window.originalAllServicesData && window.originalAllServicesData.length > 0) {
        filesProvided.push(`${window.originalServicesFileNames.length} Services CSV`);
    }
    if (versionsFiles.length > 0) filesProvided.push(`${versionsFiles.length} Versions JSON`);
    
    if (summaryText) {
        if (filesProvided.length === 0) {
            summaryText.textContent = `Displaying ${matchesFound} service(s) from deployment links.`;
        } else {
            summaryText.textContent = `Processing complete. Displaying ${matchesFound} service(s) from deployment links, enriched with: ${filesProvided.join(', ')}.`;
        }
    }
    
    // Update UI
    initializeSortOptions(mergedHeaders);
    createColumnFilter(mergedHeaders, visibleHeaders);
    refreshTable();
}

/**
 * Handles CSV download.
 */
function handleDownload() {
    const mergedData = getMergedData();
    const visibleHeaders = getVisibleHeaders();
    
    if (mergedData.length === 0) {
        setStatus('No data available to download.');
        return;
    }
    
    // Apply same filters and sorting as displayed
    let dataToDownload = [...mergedData];
    
    // Get filter states and apply them
    const showUnhealthyOnlyToggle = document.getElementById('show-unhealthy-only');
    const showUnequalVersionsOnlyToggle = document.getElementById('show-unequal-versions-only');
    const showOnlyChngsToggle = document.getElementById('show-only-chngs');
    const sortColumnSelect = document.getElementById('sort-column');
    const sortDirectionBtn = document.getElementById('sort-direction');
    
    if (showUnhealthyOnlyToggle?.checked) {
        dataToDownload = dataToDownload.filter(row => {
            const status0 = (row['Status0'] || '').toUpperCase();
            return !status0.includes('FULL_SERVICE');
        });
    }
    
    if (showUnequalVersionsOnlyToggle?.checked) {
        dataToDownload = dataToDownload.filter(row => {
            const summary = (row['Summary'] || '').trim();
            const words = summary.split(/\s+/);
            const thirdWord = words.length >= 3 ? words[2] : '';
            
            if (!thirdWord) return false;
            
            let hasUnequalVersion = false;
            Object.keys(row).forEach(key => {
                if (isVersionColumn(key, versionsFileNames)) {
                    const versionValue = (row[key] || '').toString();
                    if (versionValue) {
                        hasUnequalVersion = true;
                    }
                }
            });
            
            return hasUnequalVersion;
        });
    }
    
    if (showOnlyChngsToggle?.checked) {
        dataToDownload = dataToDownload.filter(row => {
            const summary = (row['Summary'] || '').trim();
            return summary !== '';
        });
    }
    
    // Apply sorting
    const sortColumn = sortColumnSelect?.value || '';
    const sortDirection = sortDirectionBtn?.textContent.includes('ASC') ? 'asc' : 'desc';
    const sortedData = sortData(dataToDownload, sortColumn, sortDirection);
    
    // Convert and download
    const csvContent = convertToCSV(sortedData, visibleHeaders);
    downloadFile(csvContent, 'merged_jira_data.csv', 'text/csv;charset=utf-8;');
}

/**
 * Handles copying table as image.
 */
function handleCopyAsImage() {
    const mergedData = getMergedData();
    
    if (mergedData.length === 0) {
        setStatus('No data available to copy.');
        return;
    }
    
    copyTableAsImage();
}

/**
 * Handles adding Jenkins links to data.
 */
function handleAddJiraLinks() {
    const mergedData = getMergedData();
    const mergedHeaders = getMergedHeaders();
    
    const result = addAllServicesFromDeploymentLinks(mergedData, mergedHeaders);
    
    if (result.servicesAdded > 0) {
        // Add new rows to merged data
        initializeTableData([...mergedData, ...result.newRows], mergedHeaders, versionsFileNames);
        refreshTable();
        setStatus(`Added ${result.servicesAdded} services from deployment links!`, 'success');
    } else {
        setStatus('All services from deployment links are already in the table.');
    }
}

/**
 * Handles showing last successful builds.
 */
async function handleShowBuilds() {
    const mergedData = getMergedData();
    const mergedHeaders = getMergedHeaders();
    
    if (mergedData.length === 0) {
        alert('No data to process. Please upload and process files first.');
        return;
    }
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    
    setStatus('Fetching last successful builds...', 'info');
    
    try {
        // Get filtered data to determine which services to process
        const filteredData = getFilteredData();
        const filteredServiceNames = new Set(filteredData.map(row => row['Service0']).filter(Boolean));
        
        // Pass full data but function will only process filtered services
        const result = await showLastSuccessfulBuilds(mergedData, mergedHeaders, filteredServiceNames);
        
        // Update table with new data and headers (this preserves currently visible headers)
        initializeTableData(result.updatedData, result.updatedHeaders, versionsFileNames);
        
        // Hide "Bundle {env}" columns by default (unless the checkbox is checked)
        // But keep build_bundle and build_images visible
        const showBundleVersionsToggle = document.getElementById('show-bundle-versions');
        if (!showBundleVersionsToggle?.checked) {
            const bundleEnvColumns = result.updatedHeaders.filter(h => /^Bundle\s+[\w.-]+$/i.test(h));
            // Get current visible headers from tableRenderer
            const currentVisible = getVisibleHeaders();
            // Only hide "Bundle {env}" columns, not build_bundle or build_images
            const newVisibleHeaders = currentVisible.filter(h => !bundleEnvColumns.includes(h));
            // Only update if we actually removed some bundle env columns
            if (newVisibleHeaders.length !== currentVisible.length) {
                createColumnFilter(result.updatedHeaders, newVisibleHeaders);
            }
        }
        
        refreshTable();
        
        setStatus('Successfully fetched last successful builds!', 'success');
        setTimeout(() => setStatus(''), 3000);
    } catch (error) {
        console.error('Error fetching builds:', error);
        setStatus('Failed to fetch builds. Check console for details.', 'error');
        setTimeout(() => setStatus(''), 3000);
    } finally {
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
}

/**
 * Handles showing service health data.
 */
async function handleShowHealth() {
    const mergedData = getMergedData();
    const mergedHeaders = getMergedHeaders();
    
    if (mergedData.length === 0) {
        alert('No data to process. Please upload and process files first.');
        return;
    }
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    
    setStatus('Fetching service health data...', 'info');
    
    try {
        const result = await showServiceHealth(mergedData, mergedHeaders);
        
        // Update table with new data and headers (this preserves currently visible headers)
        initializeTableData(result.updatedData, result.updatedHeaders, versionsFileNames);
        
        // Hide "Bundle {env}" columns by default (unless the checkbox is checked)
        // But keep build_bundle and build_images visible
        const showBundleVersionsToggle = document.getElementById('show-bundle-versions');
        if (!showBundleVersionsToggle?.checked) {
            const bundleEnvColumns = result.updatedHeaders.filter(h => /^Bundle\s+[\w.-]+$/i.test(h));
            // Get current visible headers from tableRenderer
            const currentVisible = getVisibleHeaders();
            // Only hide "Bundle {env}" columns, not build_bundle or build_images
            const newVisibleHeaders = currentVisible.filter(h => !bundleEnvColumns.includes(h));
            // Only update if we actually removed some bundle env columns
            if (newVisibleHeaders.length !== currentVisible.length) {
                createColumnFilter(result.updatedHeaders, newVisibleHeaders);
            }
        }
        
        refreshTable();
        
        
        setStatus('Successfully fetched service health data!', 'success');
        setTimeout(() => setStatus(''), 3000);
    } catch (error) {
        console.error('Error fetching service health:', error);
        setStatus('Failed to fetch service health. Check console for details.', 'error');
        setTimeout(() => setStatus(''), 3000);
    } finally {
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
}

/**
 * Handles fetching build versions for all services.
 */
async function handleGetBuildVersions() {
    const mergedData = getMergedData();
    const mergedHeaders = getMergedHeaders();
    
    if (mergedData.length === 0) {
        alert('No data to process. Please upload and process files first.');
        return;
    }
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    
    setStatus('Fetching build versions...', 'info');
    
    try {
        const result = await getBuildVersions(mergedData, mergedHeaders);
        
        // Update table with new data and headers (this preserves currently visible headers)
        initializeTableData(result.updatedData, result.updatedHeaders, versionsFileNames);
        
        // Hide bundle columns by default (unless the checkbox is already checked)
        // But only for newly added bundle columns, not those already managed by the user
        const showBundleVersionsToggle = document.getElementById('show-bundle-versions');
        if (!showBundleVersionsToggle?.checked) {
            const bundleColumns = result.updatedHeaders.filter(h => /^Bundle\s+[\w.-]+$/i.test(h));
            // Get current visible headers from tableRenderer
            const currentVisible = getVisibleHeaders();
            // Only hide bundle columns that are currently visible (newly added ones)
            const newVisibleHeaders = currentVisible.filter(h => !bundleColumns.includes(h));
            // Only update if we actually removed some bundle columns
            if (newVisibleHeaders.length !== currentVisible.length) {
                createColumnFilter(result.updatedHeaders, newVisibleHeaders);
            }
        }
        
        refreshTable();
        
        setStatus('Successfully fetched build versions!', 'success');
        setTimeout(() => setStatus(''), 3000);
    } catch (error) {
        console.error('Error fetching build versions:', error);
        setStatus('Failed to fetch build versions. Check console for details.', 'error');
        setTimeout(() => setStatus(''), 3000);
    } finally {
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

