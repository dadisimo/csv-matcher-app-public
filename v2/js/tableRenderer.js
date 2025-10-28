/**
 * Table Rendering Module for CSV Service Matcher
 * Handles all table display, filtering, sorting, and interaction logic
 */

import { isVersionColumn, isBundleColumn, areVersionsEqual, sortData } from './utils.js';
import { setStatus } from './utils.js';

// State variables
let mergedData = [];
let mergedHeaders = [];
let visibleHeaders = [];
let sortColumn = '';
let sortDirection = 'asc';
let showUnhealthyOnly = false;
let showUnequalVersionsOnly = false;
let showUnequalBundlesOnly = false;
let showOnlyChngs = false;
let customFilters = {};
let deletedRows = [];
let versionsFileNames = [];

/**
 * Extracts build number from HTML link or plain text.
 * @param {string} buildValue - The build_images value (could be HTML or text)
 * @returns {string} The build number or empty string
 */
function extractBuildNumber(buildValue) {
    if (!buildValue || buildValue.toLowerCase() === 'error' || buildValue.toLowerCase().includes('build not found')) {
        return '';
    }
    
    // If it's an HTML link, extract the text content
    if (buildValue.includes('<a')) {
        const match = buildValue.match(/>(\d+)<\/a>/);
        return match ? match[1] : '';
    }
    
    // If it's plain text, return it if it's a number
    const trimmed = buildValue.trim();
    return /^\d+$/.test(trimmed) ? trimmed : '';
}

/**
 * Initializes the table data.
 * @param {Array<Object>} data - The data to display.
 * @param {Array<string>} headers - The column headers.
 * @param {Array<string>} versionFiles - Version file names.
 */
export function initializeTableData(data, headers, versionFiles = []) {
    mergedData = data;
    
    // Preserve currently visible headers when updating
    const previousVisibleHeaders = [...visibleHeaders];
    const previousAllHeaders = [...mergedHeaders];
    mergedHeaders = headers;
    
    // Only preserve visibility settings, don't automatically show new columns
    if (previousVisibleHeaders.length > 0) {
        // Start with headers that were previously visible and still exist
        visibleHeaders = previousVisibleHeaders.filter(h => headers.includes(h));
        
        // For new headers: only add them if this is adding Version/Bundle/Health columns or build columns
        // (we want those visible by default, but not other columns)
        // Important: check against ALL previous headers, not just visible ones,
        // to avoid re-showing previously hidden columns
        const newHeaders = headers.filter(h => !previousAllHeaders.includes(h));
        const newVersionOrBundleOrHealthHeaders = newHeaders.filter(h => 
            /^Version\s+[\w.-]+$/i.test(h) || 
            /^Bundle\s+[\w.-]+$/i.test(h) ||
            /\s+Health$/i.test(h) ||
            h === 'build_bundle' ||
            h === 'build_images'
        );
        visibleHeaders = [...visibleHeaders, ...newVersionOrBundleOrHealthHeaders];
    } else {
        // First initialization - show all headers
        visibleHeaders = [...headers];
    }
    
    versionsFileNames = versionFiles;
    
    // Update column filter UI with new headers
    createColumnFilter(mergedHeaders, visibleHeaders);
}

/**
 * Gets the current merged data.
 * @returns {Array<Object>} Current data.
 */
export function getMergedData() {
    return mergedData;
}

/**
 * Gets the current headers.
 * @returns {Array<string>} Current headers.
 */
export function getMergedHeaders() {
    return mergedHeaders;
}

/**
 * Gets the visible headers.
 * @returns {Array<string>} Visible headers.
 */
export function getVisibleHeaders() {
    return visibleHeaders;
}

/**
 * Sets deleted rows.
 * @param {Array<Object>} rows - Deleted rows.
 */
export function setDeletedRows(rows) {
    deletedRows = rows;
}

/**
 * Gets deleted rows.
 * @returns {Array<Object>} Deleted rows.
 */
export function getDeletedRows() {
    return deletedRows;
}

/**
 * Applies environment filter regex to environment value.
 * @param {string} env - The environment string.
 * @returns {string} Filtered environment.
 */
function applyEnvFilter(env) {
    const filterEnvRegexInput = document.getElementById('filter-env-regex');
    if (!filterEnvRegexInput) return env;
    
    const regexPattern = filterEnvRegexInput.value.trim();
    if (!regexPattern) return env;
    
    try {
        const regex = new RegExp(regexPattern);
        const match = env.match(regex);
        return match && match[1] ? match[1] : env;
    } catch (e) {
        return env;
    }
}

/**
 * Filters out columns that are empty for all rows.
 * @param {Array<Object>} data - The data to check.
 * @param {Array<string>} headers - The headers to filter.
 * @returns {Array<string>} Filtered headers.
 */
function filterEmptyColumns(data, headers) {
    const ignoreEmptyColumnsToggle = document.getElementById('ignore-empty-columns');
    if (!ignoreEmptyColumnsToggle || !ignoreEmptyColumnsToggle.checked) {
        return headers;
    }
    
    return headers.filter(header => {
        return data.some(row => {
            const value = row[header];
            return value !== null && value !== undefined && value !== '';
        });
    });
}

/**
 * Displays the table with data and headers.
 * @param {Array<Object>} data - The data to display.
 * @param {Array<string>} headers - The headers to display.
 */
function displayTable(data, headers) {
    const resultsTable = document.getElementById('results-table');
    if (!resultsTable) return;
    
    resultsTable.innerHTML = ''; // Clear previous results
    
    // Create table head
    const thead = document.createElement('thead');
    thead.className = "text-xs text-slate-700 uppercase bg-slate-50 sticky top-0";
    const headerRow = document.createElement('tr');
    
    // Add checkbox column header
    const checkboxHeader = document.createElement('th');
    checkboxHeader.scope = 'col';
    checkboxHeader.className = 'px-6 py-3 w-16';
    const selectAllCheckbox = document.createElement('input');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.id = 'select-all';
    selectAllCheckbox.className = 'rounded border-gray-300';
    selectAllCheckbox.onchange = toggleSelectAll;
    checkboxHeader.appendChild(selectAllCheckbox);
    headerRow.appendChild(checkboxHeader);
    
    headers.forEach((headerText, index) => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.className = 'px-6 py-3 sort-header';
        th.setAttribute('data-column', headerText);
        th.setAttribute('data-column-index', index);
        th.setAttribute('draggable', 'true');
        th.style.cursor = 'move';
        
        // Add drag event listeners
        th.addEventListener('dragstart', handleColumnDragStart);
        th.addEventListener('dragover', handleColumnDragOver);
        th.addEventListener('drop', handleColumnDrop);
        th.addEventListener('dragend', handleColumnDragEnd);
        
        // Add header text and sort indicator
        const headerContent = document.createElement('div');
        headerContent.className = 'flex items-center justify-between';
        headerContent.innerHTML = `
            <span>${headerText}</span>
            <span class="sort-indicator ${sortColumn === headerText ? 'active' : ''}">${
                sortColumn === headerText 
                    ? (sortDirection === 'asc' ? '↑' : '↓')
                    : '↕'
            }</span>
        `;
        th.appendChild(headerContent);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    resultsTable.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        tr.className = rowIndex % 2 === 0 ? 'bg-white border-b' : 'bg-slate-50 border-b';
        tr.setAttribute('data-row-index', rowIndex);
        
        // Add checkbox cell
        const checkboxCell = document.createElement('td');
        checkboxCell.className = 'px-6 py-4';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'row-checkbox rounded border-gray-300';
        checkbox.setAttribute('data-row-index', rowIndex);
        checkbox.onchange = updateDeleteButtonState;
        checkboxCell.appendChild(checkbox);
        tr.appendChild(checkboxCell);
        
        headers.forEach(header => {
            // Skip if header is undefined or null
            if (!header) return;
            
            const td = document.createElement('td');
            td.className = 'px-6 py-4 editable-cell';
            let cellValue = row[header];
            
            // Ensure cellValue is a string
            if (cellValue === null || cellValue === undefined) {
                cellValue = '';
            } else {
                cellValue = String(cellValue);
            }
            
            // Apply environment filter if this is the Environment column
            if (header === 'Environment' && cellValue) {
                cellValue = applyEnvFilter(cellValue);
            }
            
            // Check if this is a Jenkins Link or build column and contains HTML
            if ((header === 'Jenkins Link' || header === 'build_images' || header === 'build_bundle') && cellValue.includes('<a href=')) {
                td.innerHTML = cellValue; // Render HTML for links
                // Keep editable-cell class so it can be edited
                td.setAttribute('data-has-link', 'true'); // Mark that this cell has a link
            } else if (header.toUpperCase().endsWith(' HEALTH')) {
                // Handle Health columns
                const env = header.replace(/\s+Health$/i, '').trim(); // Extract environment name
                const service = row['Service0'] || '';
                
                if (cellValue.toLowerCase() === 'not found') {
                    // "Not found" links to k8s dashboard
                    if (service) {
                        const url = `https://k8s-dashboard.${env}.catonet.works/#/search?namespace=_all&q=${encodeURIComponent(service)}`;
                        td.innerHTML = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline">Not found</a>`;
                        td.setAttribute('data-has-link', 'true'); // Mark that this cell has a link
                    } else {
                        td.textContent = cellValue; // No service name, just show text
                    }
                } else if (cellValue && cellValue.toUpperCase() !== 'FULL_SERVICE') {
                    // Values other than FULL_SERVICE link to backoffice
                    if (service) {
                        const url = `https://backoffice.${env}.catonet.works/automation/applications/${encodeURIComponent(service)}`;
                        td.innerHTML = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline">${cellValue}</a>`;
                        td.setAttribute('data-has-link', 'true'); // Mark that this cell has a link
                    } else {
                        td.textContent = cellValue; // No service name, just show text
                    }
                } else {
                    td.textContent = cellValue; // FULL_SERVICE or empty - just show text
                }
            } else {
                td.textContent = cellValue; // Use text content for regular cells
            }
            
            // Check if this is a version column and if it doesn't match the third word from Summary
            // Only check if the column is visible
            if (visibleHeaders.includes(header) && isVersionColumn(header, versionsFileNames) && cellValue && cellValue !== 'Not found' && cellValue !== 'Error') {
                const summary = (row['Summary0'] || row['Summary'] || '').trim();
                const words = summary.split(/\s+/);
                const thirdWord = words.length >= 3 ? words[2] : '';
                
                console.log(`Checking version column "${header}":`, {
                    cellValue,
                    summary,
                    thirdWord,
                    isVersionCol: isVersionColumn(header, versionsFileNames)
                });
                
                // Get build_images value if it exists and is not "Error"
                const buildImages = (row['build_images'] || '').trim();
                const buildImageNumber = extractBuildNumber(buildImages);
                
                // Check version match with build number
                let isHealthy = true;
                let versionMatchesBuildDiffers = false;
                
                if (thirdWord) {
                    if (buildImageNumber) {
                        // Compare with build number suffix
                        const expectedVersion = `${thirdWord}_${buildImageNumber}`;
                        isHealthy = areVersionsEqual(cellValue, expectedVersion);
                        console.log(`  Comparing with build number: "${cellValue}" vs "${expectedVersion}" = ${isHealthy}`);
                        
                        // Check if version matches but build differs
                        if (!isHealthy && areVersionsEqual(cellValue, thirdWord)) {
                            versionMatchesBuildDiffers = true;
                            console.log(`  ⚠️ Version matches but build differs`);
                        }
                    } else {
                        // Compare without build number (original behavior)
                        isHealthy = areVersionsEqual(cellValue, thirdWord);
                        console.log(`  Comparing without build number: "${cellValue}" vs "${thirdWord}" = ${isHealthy}`);
                    }
                    
                    if (!isHealthy) {
                        if (versionMatchesBuildDiffers) {
                            // Only color the build part (last segment after underscore)
                            const parts = cellValue.split('_');
                            if (parts.length > 1) {
                                const buildPart = parts[parts.length - 1];
                                const versionPart = parts.slice(0, -1).join('_');
                                td.innerHTML = `${versionPart}_<span style="color: red; font-weight: bold;">${buildPart}</span>`;
                                console.log(`  ⚠️ PAINTED BUILD PART RED: build "${buildPart}" differs`);
                            } else {
                                // Fallback: color entire cell if no underscore found
                                td.style.color = 'red';
                                td.style.fontWeight = 'bold';
                                console.log(`  ❌ PAINTED RED: "${cellValue}" != "${thirdWord}"`);
                            }
                        } else {
                            // Entire version differs - color the whole cell
                            td.style.color = 'red';
                            td.style.fontWeight = 'bold';
                            console.log(`  ❌ PAINTED RED: "${cellValue}" != "${thirdWord}"`);
                        }
                    } else {
                        console.log(`  ✅ Versions match`);
                    }
                }
            }
            
            // Check if this is a Bundle column and compare with Summary's third word
            // Only check if the column is visible
            if (visibleHeaders.includes(header) && isBundleColumn(header) && cellValue && cellValue !== 'Not found' && cellValue !== 'Error') {
                const summary = (row['Summary0'] || row['Summary'] || '').trim();
                const words = summary.split(/\s+/);
                const thirdWord = words.length >= 3 ? words[2] : '';
                
                console.log(`Checking bundle column "${header}":`, {
                    cellValue,
                    summary,
                    thirdWord,
                    isBundleCol: isBundleColumn(header)
                });
                
                // Get build_bundle value if it exists and is not "Error"
                const buildBundle = (row['build_bundle'] || '').trim();
                const buildBundleNumber = extractBuildNumber(buildBundle);
                
                // Check bundle match with build number
                let isHealthy = true;
                let bundleMatchesBuildDiffers = false;
                
                if (thirdWord) {
                    if (buildBundleNumber) {
                        // Compare with build number suffix
                        const expectedBundle = `${thirdWord}_${buildBundleNumber}`;
                        isHealthy = areVersionsEqual(cellValue, expectedBundle);
                        console.log(`  Comparing with build number: "${cellValue}" vs "${expectedBundle}" = ${isHealthy}`);
                        
                        // Check if bundle matches but build differs
                        if (!isHealthy && areVersionsEqual(cellValue, thirdWord)) {
                            bundleMatchesBuildDiffers = true;
                            console.log(`  ⚠️ Bundle matches but build differs`);
                        }
                    } else {
                        // Compare without build number (original behavior)
                        isHealthy = areVersionsEqual(cellValue, thirdWord);
                        console.log(`  Comparing without build number: "${cellValue}" vs "${thirdWord}" = ${isHealthy}`);
                    }
                    
                    if (!isHealthy) {
                        if (bundleMatchesBuildDiffers) {
                            // Only color the build part (last segment after underscore)
                            const parts = cellValue.split('_');
                            if (parts.length > 1) {
                                const buildPart = parts[parts.length - 1];
                                const bundlePart = parts.slice(0, -1).join('_');
                                td.innerHTML = `${bundlePart}_<span style="color: red; font-weight: bold;">${buildPart}</span>`;
                                console.log(`  ⚠️ PAINTED BUILD PART RED: build "${buildPart}" differs`);
                            } else {
                                // Fallback: color entire cell if no underscore found
                                td.style.color = 'red';
                                td.style.fontWeight = 'bold';
                                console.log(`  ❌ PAINTED RED: "${cellValue}" != "${thirdWord}"`);
                            }
                        } else {
                            // Entire bundle differs - color the whole cell
                            td.style.color = 'red';
                            td.style.fontWeight = 'bold';
                            console.log(`  ❌ PAINTED RED: "${cellValue}" != "${thirdWord}"`);
                        }
                    } else {
                        console.log(`  ✅ Bundles match`);
                    }
                }
            }
            
            td.setAttribute('data-row', rowIndex);
            td.setAttribute('data-column', header);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    resultsTable.appendChild(tbody);
}

/**
 * Gets the currently filtered/visible data based on active filters.
 * This applies the same filtering logic as refreshTable but returns the data.
 * @returns {Array<Object>} The filtered data
 */
export function getFilteredData() {
    let dataToShow = [...mergedData];
    
    // Apply unhealthy filter if enabled
    if (showUnhealthyOnly) {
        dataToShow = dataToShow.filter(row => {
            const hasStatus0 = 'Status0' in row && row['Status0'];
            const status0 = hasStatus0 ? (row['Status0'] || '').toUpperCase() : '';
            const isNotFullService = hasStatus0 ? !status0.includes('FULL_SERVICE') : false;
            
            const healthColumns = Object.keys(row).filter(key => 
                visibleHeaders.includes(key) && key.toUpperCase().endsWith(' HEALTH')
            );
            let hasUnhealthyService = false;
            
            if (healthColumns.length > 0) {
                for (const key of healthColumns) {
                    const healthStatus = (row[key] || '').toUpperCase().trim();
                    if (healthStatus && healthStatus !== 'FULL_SERVICE') {
                        hasUnhealthyService = true;
                        break;
                    }
                }
            }
            
            const versionColumns = Object.keys(row).filter(key => 
                visibleHeaders.includes(key) && isVersionColumn(key, versionsFileNames)
            );
            let hasVersionMismatch = false;
            
            if (versionColumns.length > 0) {
                const summary = (row['Summary0'] || row['Summary'] || '').trim();
                const words = summary.split(/\s+/);
                const thirdWord = words.length >= 3 ? words[2] : '';
                
                if (thirdWord) {
                    for (const key of versionColumns) {
                        const versionValue = (row[key] || '').toString();
                        if (versionValue && versionValue !== 'Not found' && versionValue !== 'Error') {
                            if (!areVersionsEqual(versionValue, thirdWord)) {
                                hasVersionMismatch = true;
                                break;
                            }
                        }
                    }
                }
            }
            
            return isNotFullService || hasUnhealthyService || hasVersionMismatch;
        });
    }
    
    // Apply unequal versions filter if enabled
    if (showUnequalVersionsOnly) {
        dataToShow = dataToShow.filter(row => {
            const summary = (row['Summary0'] || row['Summary'] || '').trim();
            const words = summary.split(/\s+/);
            const thirdWord = words.length >= 3 ? words[2] : '';
            
            if (!thirdWord) return false;
            
            const buildImages = (row['build_images'] || '').trim();
            const buildImageNumber = extractBuildNumber(buildImages);
            
            let hasUnequalVersion = false;
            Object.keys(row).forEach(key => {
                if (visibleHeaders.includes(key) && isVersionColumn(key, versionsFileNames)) {
                    const versionValue = (row[key] || '').toString();
                    if (versionValue && versionValue !== 'Not found' && versionValue !== 'Error') {
                        const expectedVersion = buildImageNumber ? `${thirdWord}_${buildImageNumber}` : thirdWord;
                        if (!areVersionsEqual(versionValue, expectedVersion)) {
                            hasUnequalVersion = true;
                        }
                    }
                }
            });
            
            return hasUnequalVersion;
        });
    }
    
    // Apply show unequal bundles only filter if enabled
    if (showUnequalBundlesOnly) {
        dataToShow = dataToShow.filter(row => {
            const summary = (row['Summary0'] || row['Summary'] || '').trim();
            const words = summary.split(/\s+/);
            const thirdWord = words.length >= 3 ? words[2] : '';
            
            if (!thirdWord) return false;
            
            const buildBundle = (row['build_bundle'] || '').trim();
            const buildBundleNumber = extractBuildNumber(buildBundle);
            
            let hasUnequalBundle = false;
            Object.keys(row).forEach(key => {
                if (visibleHeaders.includes(key) && isBundleColumn(key)) {
                    const bundleValue = (row[key] || '').toString();
                    if (bundleValue && bundleValue !== 'Not found' && bundleValue !== 'Error') {
                        const expectedBundle = buildBundleNumber ? `${thirdWord}_${buildBundleNumber}` : thirdWord;
                        if (!areVersionsEqual(bundleValue, expectedBundle)) {
                            hasUnequalBundle = true;
                        }
                    }
                }
            });
            
            return hasUnequalBundle;
        });
    }
    
    // Apply show only CHNGS filter if enabled
    if (showOnlyChngs) {
        dataToShow = dataToShow.filter(row => {
            const summary = (row['Summary'] || '').trim();
            return summary !== '';
        });
    }
    
    // Apply custom filters
    Object.keys(customFilters).forEach(column => {
        const filterValue = customFilters[column].toLowerCase();
        if (filterValue) {
            dataToShow = dataToShow.filter(row => {
                const cellValue = (row[column] || '').toString().toLowerCase();
                return cellValue.includes(filterValue);
            });
        }
    });
    
    return dataToShow;
}

/**
 * Refreshes the table with current sort and filter settings.
 */
export function refreshTable() {
    console.log('=== refreshTable called ===');
    console.log('showUnhealthyOnly:', showUnhealthyOnly);
    console.log('mergedData length:', mergedData.length);
    
    // Get filtered data using the shared function
    const dataToShow = getFilteredData();
    
    const sortedData = sortData(dataToShow, sortColumn, sortDirection);
    
    // Use the current visible headers or fallback to mergedHeaders
    let headersToUse = visibleHeaders.length > 0 ? visibleHeaders : mergedHeaders;
    
    // Filter out empty columns if the toggle is enabled
    headersToUse = filterEmptyColumns(dataToShow, headersToUse);
    
    displayTable(sortedData, headersToUse);
    
    // Update button states after table refresh
    setTimeout(() => {
        updateDeleteButtonState();
    }, 100); // Small delay to ensure DOM is updated
}

/**
 * Initializes the sort column dropdown.
 * @param {Array<string>} headers - Available column headers.
 */
export function initializeSortOptions(headers) {
    const sortColumnSelect = document.getElementById('sort-column');
    if (!sortColumnSelect) return;
    
    sortColumnSelect.innerHTML = '<option value="">Select column...</option>';
    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        sortColumnSelect.appendChild(option);
    });
}

/**
 * Creates column filter chips.
 * @param {Array<string>} headers - All available headers.
 * @param {Array<string>} visible - Currently visible headers (optional).
 */
export function createColumnFilter(headers, visible = null) {
    const columnFilter = document.getElementById('column-filter');
    if (!columnFilter) return;
    
    columnFilter.innerHTML = '';
    if (visible === null) {
        visibleHeaders = [...headers]; // Initialize all columns as visible only if not provided
    } else {
        visibleHeaders = visible;
    }
    
    headers.forEach((header, index) => {
        const isVisible = visibleHeaders.includes(header);
        const chip = document.createElement('span');
        chip.className = isVisible ? 'column-chip column-chip-visible' : 'column-chip column-chip-hidden';
        chip.setAttribute('draggable', 'true');
        chip.setAttribute('data-column', header);
        chip.setAttribute('data-column-index', index);
        chip.style.cursor = 'move';
        chip.title = isVisible ? 'Click to hide column' : 'Click to show column';
        
        // Add click event to toggle visibility
        chip.addEventListener('click', (e) => {
            // Don't toggle if clicking on draggable area during drag
            if (e.target === chip || e.target.tagName === 'SPAN') {
                toggleColumnVisibility(header);
            }
        });
        
        // Add drag event listeners
        chip.addEventListener('dragstart', handleChipDragStart);
        chip.addEventListener('dragover', handleChipDragOver);
        chip.addEventListener('drop', handleChipDrop);
        chip.addEventListener('dragend', handleChipDragEnd);
        
        chip.textContent = header;
        columnFilter.appendChild(chip);
    });
}

/**
 * Toggles the visibility of a column.
 * @param {string} columnName - The column to toggle.
 */
export function toggleColumnVisibility(columnName) {
    if (visibleHeaders.includes(columnName)) {
        // Hide the column
        visibleHeaders = visibleHeaders.filter(h => h !== columnName);
    } else {
        // Show the column
        visibleHeaders.push(columnName);
    }
    createColumnFilter(mergedHeaders, visibleHeaders);
    refreshTable();
}

/**
 * Removes a column from the visible headers and updates the display.
 * @param {string} columnToRemove - The column to hide.
 */
export function removeColumn(columnToRemove) {
    visibleHeaders = visibleHeaders.filter(h => h !== columnToRemove);
    createColumnFilter(mergedHeaders, visibleHeaders);
    refreshTable();
}

/**
 * Shows all columns again.
 */
export function showAllColumns() {
    visibleHeaders = [...mergedHeaders];
    createColumnFilter(mergedHeaders, visibleHeaders);
    refreshTable();
}

/**
 * Toggles selection of all rows.
 */
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('select-all');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateDeleteButtonState();
}

/**
 * Updates the state of the delete button and selection info.
 */
function updateDeleteButtonState() {
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    const totalRows = document.querySelectorAll('.row-checkbox').length;
    const selectedCount = selectedCheckboxes.length;
    
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const restoreRowsBtn = document.getElementById('restore-rows-btn');
    const selectionInfo = document.getElementById('selection-info');
    
    // Update delete button state
    if (deleteSelectedBtn) deleteSelectedBtn.disabled = selectedCount === 0;
    
    // Update restore button state
    if (restoreRowsBtn) restoreRowsBtn.disabled = deletedRows.length === 0;
    
    // Update selection info
    if (selectionInfo) {
        if (selectedCount === 0) {
            selectionInfo.textContent = `${totalRows} rows total`;
        } else {
            selectionInfo.textContent = `${selectedCount} of ${totalRows} rows selected`;
        }
    }
    
    // Update select all checkbox state
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        if (selectedCount === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (selectedCount === totalRows) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }
}

/**
 * Deletes selected rows from the table.
 */
export function deleteSelectedRows() {
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('No rows selected for deletion.');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedCheckboxes.length} selected row(s)?`)) {
        // Get the current filtered data to find the correct rows
        let dataToShow = [...mergedData];
        
        // Apply filters to match what's currently displayed
        if (showUnhealthyOnly) {
            dataToShow = dataToShow.filter(row => {
                // Check Status0 only if it exists in the row
                const hasStatus0 = 'Status0' in row && row['Status0'];
                const status0 = hasStatus0 ? (row['Status0'] || '').toUpperCase() : '';
                const isNotFullService = hasStatus0 ? !status0.includes('FULL_SERVICE') : false;
                
                // Check all Health columns - filter out row if ALL are FULL_SERVICE
                // Match columns ending with " Health" or " HEALTH" (case-insensitive)
                const healthColumns = Object.keys(row).filter(key => 
                    key.toUpperCase().endsWith(' HEALTH')
                );
                let hasUnhealthyService = false;
                
                if (healthColumns.length > 0) {
                    // If health columns exist, check if any are unhealthy (not FULL_SERVICE)
                    for (const key of healthColumns) {
                        const healthStatus = (row[key] || '').toUpperCase().trim();
                        // If the health column has a value and it's not FULL_SERVICE, it's unhealthy
                        if (healthStatus && healthStatus !== 'FULL_SERVICE') {
                            hasUnhealthyService = true;
                            break;
                        }
                    }
                }
                
                // Also check for version mismatches with build number
                const summary = (row['Summary'] || '').trim();
                const words = summary.split(/\s+/);
                const thirdWord = words.length >= 3 ? words[2] : '';
                const buildImages = (row['build_images'] || '').trim();
                const buildImageNumber = extractBuildNumber(buildImages);
                
                let hasVersionMismatch = false;
                if (thirdWord && buildImageNumber) {
                    const expectedVersion = `${thirdWord}_${buildImageNumber}`;
                    Object.keys(row).forEach(key => {
                        if (isVersionColumn(key, versionsFileNames)) {
                            const versionValue = (row[key] || '').toString();
                            if (versionValue && !areVersionsEqual(versionValue, expectedVersion)) {
                                hasVersionMismatch = true;
                            }
                        }
                    });
                }
                
                return isNotFullService || hasUnhealthyService || hasVersionMismatch;
            });
        }
        
        if (showUnequalVersionsOnly) {
            dataToShow = dataToShow.filter(row => {
                const summary = (row['Summary'] || '').trim();
                const words = summary.split(/\s+/);
                const thirdWord = words.length >= 3 ? words[2] : '';
                
                if (!thirdWord) return false;
                
                // Get build_images value if it exists
                const buildImages = (row['build_images'] || '').trim();
                const buildImageNumber = extractBuildNumber(buildImages);
                
                let hasUnequalVersion = false;
                Object.keys(row).forEach(key => {
                    if (isVersionColumn(key, versionsFileNames)) {
                        const versionValue = (row[key] || '').toString();
                        if (versionValue) {
                            if (buildImageNumber) {
                                // Compare with build number suffix
                                const expectedVersion = `${thirdWord}_${buildImageNumber}`;
                                if (!areVersionsEqual(versionValue, expectedVersion)) {
                                    hasUnequalVersion = true;
                                }
                            } else {
                                // Compare without build number (original behavior)
                                if (!areVersionsEqual(versionValue, thirdWord)) {
                                    hasUnequalVersion = true;
                                }
                            }
                        }
                    }
                });
                
                return hasUnequalVersion;
            });
        }
        
        // Apply custom filters
        Object.keys(customFilters).forEach(column => {
            const filterValue = customFilters[column].toLowerCase();
            if (filterValue) {
                dataToShow = dataToShow.filter(row => {
                    const cellValue = (row[column] || '').toString().toLowerCase();
                    return cellValue.includes(filterValue);
                });
            }
        });
        
        // Collect rows to delete
        const rowsToDelete = [];
        selectedCheckboxes.forEach(checkbox => {
            const rowIndex = parseInt(checkbox.getAttribute('data-row-index'));
            const rowToDelete = dataToShow[rowIndex];
            if (rowToDelete) {
                rowsToDelete.push(rowToDelete);
            }
        });
        
        // Move rows to deleted array and remove from mergedData
        rowsToDelete.forEach(rowToDelete => {
            const originalIndex = mergedData.findIndex(row => 
                JSON.stringify(row) === JSON.stringify(rowToDelete)
            );
            
            if (originalIndex !== -1) {
                deletedRows.push(mergedData[originalIndex]);
                mergedData.splice(originalIndex, 1);
            }
        });
        
        refreshTable(); // Refresh the table display
        setStatus(`${rowsToDelete.length} row(s) deleted. ${mergedData.length} rows remaining.`, 'success');
    }
}

/**
 * Restores all deleted rows.
 */
export function restoreDeletedRows() {
    if (deletedRows.length === 0) {
        alert('No deleted rows to restore.');
        return;
    }
    
    if (confirm(`Are you sure you want to restore ${deletedRows.length} deleted row(s)?`)) {
        // Add all deleted rows back to mergedData
        mergedData = mergedData.concat(deletedRows);
        const restoredCount = deletedRows.length;
        deletedRows = []; // Clear deleted rows array
        
        refreshTable(); // Refresh the table display
        setStatus(`${restoredCount} row(s) restored. ${mergedData.length} rows total.`, 'success');
    }
}

/**
 * Sets the sort column and direction.
 * @param {string} column - Column name.
 * @param {string} direction - 'asc' or 'desc'.
 */
export function setSortSettings(column, direction) {
    sortColumn = column;
    sortDirection = direction;
}

// Drag and drop state
let draggedColumnIndex = null;
let draggedColumnName = null;
let draggedChipIndex = null;

/**
 * Handles column drag start.
 */
function handleColumnDragStart(e) {
    draggedColumnIndex = parseInt(e.target.getAttribute('data-column-index'));
    draggedColumnName = e.target.getAttribute('data-column');
    e.target.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

/**
 * Handles column drag over.
 */
function handleColumnDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

/**
 * Handles column drop.
 */
function handleColumnDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    const targetTh = e.target.closest('th');
    if (!targetTh) return false;
    
    const targetIndex = parseInt(targetTh.getAttribute('data-column-index'));
    
    if (draggedColumnIndex !== null && draggedColumnIndex !== targetIndex && !isNaN(targetIndex)) {
        // Reorder the headers arrays
        const reorderArray = (arr) => {
            // Filter out any undefined/null values first
            const cleanArr = arr.filter(item => item !== null && item !== undefined);
            const newArr = [...cleanArr];
            
            // Make sure indices are valid
            if (draggedColumnIndex >= newArr.length || targetIndex >= newArr.length) {
                console.warn('Invalid drag indices:', draggedColumnIndex, targetIndex, newArr.length);
                return cleanArr;
            }
            
            const [removed] = newArr.splice(draggedColumnIndex, 1);
            if (removed) {
                newArr.splice(targetIndex, 0, removed);
            }
            return newArr;
        };
        
        mergedHeaders = reorderArray(mergedHeaders);
        visibleHeaders = reorderArray(visibleHeaders);
        
        // Refresh the table with new column order
        refreshTable();
    }
    
    return false;
}

/**
 * Handles column drag end.
 */
function handleColumnDragEnd(e) {
    e.target.style.opacity = '1';
    draggedColumnIndex = null;
    draggedColumnName = null;
}

/**
 * Handles chip drag start.
 */
function handleChipDragStart(e) {
    // Prevent dragging the remove button
    if (e.target.classList.contains('column-chip-remove')) {
        e.preventDefault();
        return;
    }
    
    draggedChipIndex = parseInt(e.currentTarget.getAttribute('data-column-index'));
    e.currentTarget.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

/**
 * Handles chip drag over.
 */
function handleChipDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

/**
 * Handles chip drop.
 */
function handleChipDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    const targetChip = e.target.closest('.column-chip');
    if (!targetChip) return false;
    
    const targetIndex = parseInt(targetChip.getAttribute('data-column-index'));
    
    if (draggedChipIndex !== null && draggedChipIndex !== targetIndex && !isNaN(targetIndex)) {
        // Reorder the headers arrays
        const reorderArray = (arr) => {
            // Filter out any undefined/null values first
            const cleanArr = arr.filter(item => item !== null && item !== undefined);
            const newArr = [...cleanArr];
            
            // Make sure indices are valid
            if (draggedChipIndex >= newArr.length || targetIndex >= newArr.length) {
                console.warn('Invalid drag indices:', draggedChipIndex, targetIndex, newArr.length);
                return cleanArr;
            }
            
            const [removed] = newArr.splice(draggedChipIndex, 1);
            if (removed) {
                newArr.splice(targetIndex, 0, removed);
            }
            return newArr;
        };
        
        mergedHeaders = reorderArray(mergedHeaders);
        visibleHeaders = reorderArray(visibleHeaders);
        
        // Refresh the table and column filter with new order
        createColumnFilter(mergedHeaders, visibleHeaders);
        refreshTable();
    }
    
    return false;
}

/**
 * Handles chip drag end.
 */
function handleChipDragEnd(e) {
    e.currentTarget.style.opacity = '1';
    draggedChipIndex = null;
}

/**
 * Gets current sort settings.
 * @returns {Object} Current sort column and direction.
 */
export function getSortSettings() {
    return { sortColumn, sortDirection };
}

/**
 * Sets filter states.
 * @param {Object} filters - Filter configuration.
 */
export function setFilterStates(filters) {
    console.log('=== setFilterStates called ===', filters);
    if (filters.showUnhealthyOnly !== undefined) showUnhealthyOnly = filters.showUnhealthyOnly;
    console.log('showUnhealthyOnly is now:', showUnhealthyOnly);
    if (filters.showUnequalVersionsOnly !== undefined) showUnequalVersionsOnly = filters.showUnequalVersionsOnly;
    if (filters.showUnequalBundlesOnly !== undefined) showUnequalBundlesOnly = filters.showUnequalBundlesOnly;
    if (filters.showOnlyChngs !== undefined) showOnlyChngs = filters.showOnlyChngs;
    if (filters.customFilters !== undefined) customFilters = filters.customFilters;
}

/**
 * Gets current filter states.
 * @returns {Object} Current filter configuration.
 */
export function getFilterStates() {
    return {
        showUnhealthyOnly,
        showUnequalVersionsOnly,
        showUnequalBundlesOnly,
        showOnlyChngs,
        customFilters
    };
}
