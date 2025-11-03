/**
 * Settings Module for CSV Service Matcher
 * Handles settings modal, localStorage operations, and configuration management
 */

import { DEFAULT_DEPLOYMENT_LINKS, DEFAULT_ENV_REGEX } from './config.js';
import { setStatus } from './utils.js';

/**
 * Loads Jenkins deployment links from localStorage.
 */
export function loadJiraDeploymentLinks() {
    const jiraDeploymentLinksInput = document.getElementById('jira-deployment-links');
    const jiraBuildLinksInput = document.getElementById('jira-build-links');
    const filterEnvRegexInput = document.getElementById('filter-env-regex');
    const jenkinsDeploysUrlInput = document.getElementById('jenkins-deploys-url');
    const jenkinsApiUsernameInput = document.getElementById('jenkins-api-username');
    const jenkinsApiPassInput = document.getElementById('jenkins-api-pass');
    const jenkinsBuildsUrlInput = document.getElementById('jenkins-builds-url');
    const jenkinsBuildsUsernameInput = document.getElementById('jenkins-builds-username');
    const jenkinsBuildsPassInput = document.getElementById('jenkins-builds-pass');
    const jenkinsBuildApiUsernameInput = document.getElementById('jenkins-build-api-username');
    const jenkinsBuildApiPasswordInput = document.getElementById('jenkins-build-api-password');
    const healthEnvironmentsInput = document.getElementById('health-environments');
    const healthApiUsernameInput = document.getElementById('health-api-username');
    const healthApiPasswordInput = document.getElementById('health-api-password');
    const bitbucketApiUrlInput = document.getElementById('bitbucket-api-url');
    const bitbucketApiUsernameInput = document.getElementById('bitbucket-api-username');
    const bitbucketApiPasswordInput = document.getElementById('bitbucket-api-password');
    
    if (!jiraDeploymentLinksInput || !filterEnvRegexInput) return;
    
    // Check if user has local overrides
    const savedLinks = localStorage.getItem('jiraDeploymentLinks');
    const savedBuildLinks = localStorage.getItem('jiraBuildLinks');
    const savedRegex = localStorage.getItem('filterEnvRegex');
    const savedJenkinsUrl = localStorage.getItem('jenkinsDeploysUrl');
    const savedJenkinsUsername = localStorage.getItem('jenkinsApiUsername');
    const savedJenkinsPass = localStorage.getItem('jenkinsApiPass');
    const savedJenkinsBuildsUrl = localStorage.getItem('jenkinsBuildsUrl');
    const savedJenkinsBuildsUsername = localStorage.getItem('jenkinsBuildsUsername');
    const savedJenkinsBuildsPass = localStorage.getItem('jenkinsBuildsPass');
    const savedBuildApiUsername = localStorage.getItem('jenkinsBuildApiUsername');
    const savedBuildApiPassword = localStorage.getItem('jenkinsBuildApiPassword');
    const savedHealthEnvironments = localStorage.getItem('healthEnvironments');
    const savedHealthApiUsername = localStorage.getItem('healthApiUsername');
    const savedHealthApiPassword = localStorage.getItem('healthApiPassword');
    const savedBitbucketApiUrl = localStorage.getItem('bitbucketApiUrl');
    const savedBitbucketApiUsername = localStorage.getItem('bitbucketApiUsername');
    const savedBitbucketApiPassword = localStorage.getItem('bitbucketApiPassword');
    
    // Load deployment links (localStorage or defaults)
    if (savedLinks) {
        jiraDeploymentLinksInput.value = savedLinks;
    } else {
        jiraDeploymentLinksInput.value = DEFAULT_DEPLOYMENT_LINKS;
    }
    
    // Load build links (localStorage or empty)
    if (savedBuildLinks && jiraBuildLinksInput) {
        jiraBuildLinksInput.value = savedBuildLinks;
    } else if (jiraBuildLinksInput) {
        jiraBuildLinksInput.value = '';
    }
    
    // Load Jenkins configuration (localStorage or empty)
    if (savedJenkinsUrl && jenkinsDeploysUrlInput) {
        jenkinsDeploysUrlInput.value = savedJenkinsUrl;
    } else if (jenkinsDeploysUrlInput) {
        jenkinsDeploysUrlInput.value = '';
    }
    
    if (savedJenkinsUsername && jenkinsApiUsernameInput) {
        jenkinsApiUsernameInput.value = savedJenkinsUsername;
    } else if (jenkinsApiUsernameInput) {
        jenkinsApiUsernameInput.value = '';
    }
    
    if (savedJenkinsPass && jenkinsApiPassInput) {
        jenkinsApiPassInput.value = savedJenkinsPass;
    } else if (jenkinsApiPassInput) {
        jenkinsApiPassInput.value = '';
    }
    
    // Load Jenkins Build Links configuration
    // Only auto-populate username/password from deployment config, NOT the URL
    const buildsUrl = savedJenkinsBuildsUrl || '';  // URL is independent
    const buildsUsername = savedJenkinsBuildsUsername || savedJenkinsUsername || '';  // Share username
    const buildsPass = savedJenkinsBuildsPass || savedJenkinsPass || '';  // Share password
    
    if (jenkinsBuildsUrlInput) jenkinsBuildsUrlInput.value = buildsUrl;
    if (jenkinsBuildsUsernameInput) jenkinsBuildsUsernameInput.value = buildsUsername;
    if (jenkinsBuildsPassInput) jenkinsBuildsPassInput.value = buildsPass;
    
    // Load Jenkins Build API credentials - auto-populate from deployment config if not set
    const buildApiUsername = savedBuildApiUsername || savedJenkinsUsername || '';  // Share from deployment
    const buildApiPassword = savedBuildApiPassword || savedJenkinsPass || '';  // Share from deployment
    
    if (jenkinsBuildApiUsernameInput) {
        jenkinsBuildApiUsernameInput.value = buildApiUsername;
    }
    
    if (jenkinsBuildApiPasswordInput) {
        jenkinsBuildApiPasswordInput.value = buildApiPassword;
    }
    
    // Load Service Health configuration
    if (healthEnvironmentsInput) {
        healthEnvironmentsInput.value = savedHealthEnvironments || '';
    }
    
    if (healthApiUsernameInput) {
        healthApiUsernameInput.value = savedHealthApiUsername || '';
    }
    
    if (healthApiPasswordInput) {
        healthApiPasswordInput.value = savedHealthApiPassword || '';
    }
    
    // Load Bitbucket API configuration
    if (bitbucketApiUrlInput) {
        bitbucketApiUrlInput.value = savedBitbucketApiUrl || '';
    }
    
    if (bitbucketApiUsernameInput) {
        bitbucketApiUsernameInput.value = savedBitbucketApiUsername || '';
    }
    
    if (bitbucketApiPasswordInput) {
        bitbucketApiPasswordInput.value = savedBitbucketApiPassword || '';
    }
    
    // Load regex (localStorage or defaults)
    if (savedRegex) {
        filterEnvRegexInput.value = savedRegex;
    } else {
        filterEnvRegexInput.value = DEFAULT_ENV_REGEX;
    }
    
    // Load Bitbucket ignore directories
    loadBitbucketIgnoreDirs();
    
    // Add event listener for "Add Pattern" button
    const addBitbucketIgnoreDirBtn = document.getElementById('add-bitbucket-ignore-dir-btn');
    if (addBitbucketIgnoreDirBtn) {
        // Remove any existing listeners
        const newBtn = addBitbucketIgnoreDirBtn.cloneNode(true);
        addBitbucketIgnoreDirBtn.parentNode.replaceChild(newBtn, addBitbucketIgnoreDirBtn);
        
        // Add new listener
        newBtn.addEventListener('click', () => {
            addBitbucketIgnoreDirUI();
            saveBitbucketIgnoreDirs();
        });
    }
    
    // Load Bitbucket service mappings
    loadBitbucketServiceMappings();
    
    // Add event listener for "Add Mapping" button
    const addBitbucketServiceMappingBtn = document.getElementById('add-bitbucket-service-mapping-btn');
    if (addBitbucketServiceMappingBtn) {
        // Remove any existing listeners
        const newMappingBtn = addBitbucketServiceMappingBtn.cloneNode(true);
        addBitbucketServiceMappingBtn.parentNode.replaceChild(newMappingBtn, addBitbucketServiceMappingBtn);
        
        // Add new listener
        newMappingBtn.addEventListener('click', () => {
            addBitbucketServiceMappingUI();
            saveBitbucketServiceMappings();
        });
    }
    
    // Load Bitbucket ignore committers
    loadBitbucketIgnoreCommitters();
    
    // Add event listener for "Add Committer" button
    const addBitbucketIgnoreCommitterBtn = document.getElementById('add-bitbucket-ignore-committer-btn');
    if (addBitbucketIgnoreCommitterBtn) {
        // Remove any existing listeners
        const newCommitterBtn = addBitbucketIgnoreCommitterBtn.cloneNode(true);
        addBitbucketIgnoreCommitterBtn.parentNode.replaceChild(newCommitterBtn, addBitbucketIgnoreCommitterBtn);
        
        // Add new listener
        newCommitterBtn.addEventListener('click', () => {
            addBitbucketIgnoreCommitterUI();
            saveBitbucketIgnoreCommitters();
        });
    }
    
    // Load Bitbucket directories
    loadBitbucketDirectories();
    
    // Add event listener for "Add Directory" button
    const addBitbucketDirBtn = document.getElementById('add-bitbucket-directory-btn');
    if (addBitbucketDirBtn) {
        // Remove any existing listeners
        const newDirBtn = addBitbucketDirBtn.cloneNode(true);
        addBitbucketDirBtn.parentNode.replaceChild(newDirBtn, addBitbucketDirBtn);
        
        // Add new listener
        newDirBtn.addEventListener('click', () => {
            addBitbucketDirectoryUI();
            saveBitbucketDirectories();
        });
    }
    
    // Update refresh button states
    updateRefreshButtonState();
    updateRefreshButton2State();
}

/**
 * Saves Jenkins deployment links to localStorage.
 */
export function saveJiraDeploymentLinks() {
    const jiraDeploymentLinksInput = document.getElementById('jira-deployment-links');
    const jiraBuildLinksInput = document.getElementById('jira-build-links');
    const filterEnvRegexInput = document.getElementById('filter-env-regex');
    const jenkinsDeploysUrlInput = document.getElementById('jenkins-deploys-url');
    const jenkinsApiUsernameInput = document.getElementById('jenkins-api-username');
    const jenkinsApiPassInput = document.getElementById('jenkins-api-pass');
    
    if (!jiraDeploymentLinksInput || !filterEnvRegexInput) return;
    
    const links = jiraDeploymentLinksInput.value;
    localStorage.setItem('jiraDeploymentLinks', links);
    
    const buildLinks = jiraBuildLinksInput ? jiraBuildLinksInput.value : '';
    localStorage.setItem('jiraBuildLinks', buildLinks);
    
    const regex = filterEnvRegexInput.value;
    localStorage.setItem('filterEnvRegex', regex);
    
    // Save Jenkins deployment configuration
    const jenkinsUrl = jenkinsDeploysUrlInput ? jenkinsDeploysUrlInput.value : '';
    localStorage.setItem('jenkinsDeploysUrl', jenkinsUrl);
    
    const jenkinsUsername = jenkinsApiUsernameInput ? jenkinsApiUsernameInput.value : '';
    localStorage.setItem('jenkinsApiUsername', jenkinsUsername);
    
    const jenkinsPass = jenkinsApiPassInput ? jenkinsApiPassInput.value : '';
    localStorage.setItem('jenkinsApiPass', jenkinsPass);
    
    // Save Jenkins build links configuration
    const jenkinsBuildsUrlInput = document.getElementById('jenkins-builds-url');
    const jenkinsBuildsUsernameInput = document.getElementById('jenkins-builds-username');
    const jenkinsBuildsPassInput = document.getElementById('jenkins-builds-pass');
    
    const jenkinsBuildsUrl = jenkinsBuildsUrlInput ? jenkinsBuildsUrlInput.value : '';
    localStorage.setItem('jenkinsBuildsUrl', jenkinsBuildsUrl);
    
    const jenkinsBuildsUsername = jenkinsBuildsUsernameInput ? jenkinsBuildsUsernameInput.value : '';
    localStorage.setItem('jenkinsBuildsUsername', jenkinsBuildsUsername);
    
    const jenkinsBuildsPass = jenkinsBuildsPassInput ? jenkinsBuildsPassInput.value : '';
    localStorage.setItem('jenkinsBuildsPass', jenkinsBuildsPass);
    
    // Save Jenkins Build API credentials
    const jenkinsBuildApiUsernameInput = document.getElementById('jenkins-build-api-username');
    const jenkinsBuildApiPasswordInput = document.getElementById('jenkins-build-api-password');
    
    const buildApiUsername = jenkinsBuildApiUsernameInput ? jenkinsBuildApiUsernameInput.value : '';
    localStorage.setItem('jenkinsBuildApiUsername', buildApiUsername);
    
    const buildApiPassword = jenkinsBuildApiPasswordInput ? jenkinsBuildApiPasswordInput.value : '';
    localStorage.setItem('jenkinsBuildApiPassword', buildApiPassword);
    
    // Save Service Health configuration
    const healthEnvironmentsInput = document.getElementById('health-environments');
    const healthApiUsernameInput = document.getElementById('health-api-username');
    const healthApiPasswordInput = document.getElementById('health-api-password');
    
    const healthEnvironments = healthEnvironmentsInput ? healthEnvironmentsInput.value : '';
    localStorage.setItem('healthEnvironments', healthEnvironments);
    
    const healthApiUsername = healthApiUsernameInput ? healthApiUsernameInput.value : '';
    localStorage.setItem('healthApiUsername', healthApiUsername);
    
    const healthApiPassword = healthApiPasswordInput ? healthApiPasswordInput.value : '';
    localStorage.setItem('healthApiPassword', healthApiPassword);
    
    // Save Bitbucket API configuration
    const bitbucketApiUrlInput = document.getElementById('bitbucket-api-url');
    const bitbucketApiUsernameInput = document.getElementById('bitbucket-api-username');
    const bitbucketApiPasswordInput = document.getElementById('bitbucket-api-password');
    
    const bitbucketApiUrl = bitbucketApiUrlInput ? bitbucketApiUrlInput.value : '';
    localStorage.setItem('bitbucketApiUrl', bitbucketApiUrl);
    
    const bitbucketApiUsername = bitbucketApiUsernameInput ? bitbucketApiUsernameInput.value : '';
    localStorage.setItem('bitbucketApiUsername', bitbucketApiUsername);
    
    const bitbucketApiPassword = bitbucketApiPasswordInput ? bitbucketApiPasswordInput.value : '';
    localStorage.setItem('bitbucketApiPassword', bitbucketApiPassword);
    
    setStatus('Settings saved successfully!', 'success');
    setTimeout(() => setStatus(''), 2000);
}

/**
 * Opens the settings modal.
 */
export function openSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    const jiraDeploymentLinksInput = document.getElementById('jira-deployment-links');
    
    if (!settingsModal) return;
    
    loadJiraDeploymentLinks();
    settingsModal.classList.remove('hidden');
    
    // Focus on the textarea for better UX
    setTimeout(() => {
        if (jiraDeploymentLinksInput) jiraDeploymentLinksInput.focus();
    }, 100);
}

/**
 * Closes the settings modal and saves the data.
 * @param {Function} refreshCallback - Optional callback to refresh table after closing.
 */
export function closeSettingsModal(refreshCallback) {
    const settingsModal = document.getElementById('settings-modal');
    if (!settingsModal) return;
    
    saveJiraDeploymentLinks();
    settingsModal.classList.add('hidden');
    
    // Call refresh callback if provided
    if (refreshCallback && typeof refreshCallback === 'function') {
        refreshCallback();
    }
}

/**
 * Exports all settings to a JSON file
 */
export function exportSettings() {
    // Helper function to safely parse JSON strings
    const parseJsonSafe = (jsonString) => {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return jsonString; // Return as-is if not valid JSON
        }
    };
    
    // Gather all settings from localStorage
    const settings = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        settings: {
            // Jenkins Deployment Links
            jiraDeploymentLinks: localStorage.getItem('jiraDeploymentLinks') || '',
            jiraBuildLinks: localStorage.getItem('jiraBuildLinks') || '',
            filterEnvRegex: localStorage.getItem('filterEnvRegex') || '',
            
            // Jenkins API Configuration
            jenkinsDeploysUrl: localStorage.getItem('jenkinsDeploysUrl') || '',
            jenkinsApiUsername: localStorage.getItem('jenkinsApiUsername') || '',
            jenkinsApiPass: localStorage.getItem('jenkinsApiPass') || '',
            
            // Jenkins Build Links Configuration
            jenkinsBuildsUrl: localStorage.getItem('jenkinsBuildsUrl') || '',
            jenkinsBuildsUsername: localStorage.getItem('jenkinsBuildsUsername') || '',
            jenkinsBuildsPass: localStorage.getItem('jenkinsBuildsPass') || '',
            
            // Jenkins Build API
            jenkinsBuildApiUsername: localStorage.getItem('jenkinsBuildApiUsername') || '',
            jenkinsBuildApiPassword: localStorage.getItem('jenkinsBuildApiPassword') || '',
            
            // Service Health Configuration
            healthEnvironments: localStorage.getItem('healthEnvironments') || '',
            healthApiUsername: localStorage.getItem('healthApiUsername') || '',
            healthApiPassword: localStorage.getItem('healthApiPassword') || '',
            
            // Bitbucket API Configuration
            bitbucketApiUrl: localStorage.getItem('bitbucketApiUrl') || '',
            bitbucketApiUsername: localStorage.getItem('bitbucketApiUsername') || '',
            bitbucketApiPassword: localStorage.getItem('bitbucketApiPassword') || '',
            
            // Bitbucket Arrays (parse JSON strings to actual arrays/objects)
            bitbucketIgnoreDirs: parseJsonSafe(localStorage.getItem('bitbucketIgnoreDirs') || '[]'),
            bitbucketServiceMappings: parseJsonSafe(localStorage.getItem('bitbucketServiceMappings') || '[]'),
            bitbucketIgnoreCommitters: parseJsonSafe(localStorage.getItem('bitbucketIgnoreCommitters') || '[]'),
            bitbucketDirectories: parseJsonSafe(localStorage.getItem('bitbucketDirectories') || '[]')
        }
    };
    
    // Convert to JSON string with pretty printing
    const jsonString = JSON.stringify(settings, null, 2);
    
    // Create a Blob with the JSON content
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `csv-matcher-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setStatus('Settings exported successfully!', 'success');
    setTimeout(() => setStatus(''), 3000);
}

/**
 * Imports settings from a JSON file
 */
export function importSettings() {
    const fileInput = document.getElementById('import-settings-file');
    if (!fileInput) return;
    
    // Trigger file selection
    fileInput.click();
    
    // Handle file selection
    fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate the structure
                if (!importedData.settings) {
                    throw new Error('Invalid settings file format');
                }
                
                const settings = importedData.settings;
                
                // Helper function to ensure value is stringified if it's an array/object
                const ensureString = (value) => {
                    if (typeof value === 'string') {
                        return value;
                    } else if (Array.isArray(value) || typeof value === 'object') {
                        return JSON.stringify(value);
                    }
                    return String(value);
                };
                
                // Import all settings to localStorage
                // Simple string values
                if (settings.jiraDeploymentLinks !== undefined) localStorage.setItem('jiraDeploymentLinks', settings.jiraDeploymentLinks);
                if (settings.jiraBuildLinks !== undefined) localStorage.setItem('jiraBuildLinks', settings.jiraBuildLinks);
                if (settings.filterEnvRegex !== undefined) localStorage.setItem('filterEnvRegex', settings.filterEnvRegex);
                
                if (settings.jenkinsDeploysUrl !== undefined) localStorage.setItem('jenkinsDeploysUrl', settings.jenkinsDeploysUrl);
                if (settings.jenkinsApiUsername !== undefined) localStorage.setItem('jenkinsApiUsername', settings.jenkinsApiUsername);
                if (settings.jenkinsApiPass !== undefined) localStorage.setItem('jenkinsApiPass', settings.jenkinsApiPass);
                
                if (settings.jenkinsBuildsUrl !== undefined) localStorage.setItem('jenkinsBuildsUrl', settings.jenkinsBuildsUrl);
                if (settings.jenkinsBuildsUsername !== undefined) localStorage.setItem('jenkinsBuildsUsername', settings.jenkinsBuildsUsername);
                if (settings.jenkinsBuildsPass !== undefined) localStorage.setItem('jenkinsBuildsPass', settings.jenkinsBuildsPass);
                
                if (settings.jenkinsBuildApiUsername !== undefined) localStorage.setItem('jenkinsBuildApiUsername', settings.jenkinsBuildApiUsername);
                if (settings.jenkinsBuildApiPassword !== undefined) localStorage.setItem('jenkinsBuildApiPassword', settings.jenkinsBuildApiPassword);
                
                if (settings.healthEnvironments !== undefined) localStorage.setItem('healthEnvironments', settings.healthEnvironments);
                if (settings.healthApiUsername !== undefined) localStorage.setItem('healthApiUsername', settings.healthApiUsername);
                if (settings.healthApiPassword !== undefined) localStorage.setItem('healthApiPassword', settings.healthApiPassword);
                
                if (settings.bitbucketApiUrl !== undefined) localStorage.setItem('bitbucketApiUrl', settings.bitbucketApiUrl);
                if (settings.bitbucketApiUsername !== undefined) localStorage.setItem('bitbucketApiUsername', settings.bitbucketApiUsername);
                if (settings.bitbucketApiPassword !== undefined) localStorage.setItem('bitbucketApiPassword', settings.bitbucketApiPassword);
                
                // Arrays/Objects - ensure they're stored as JSON strings
                if (settings.bitbucketIgnoreDirs !== undefined) {
                    localStorage.setItem('bitbucketIgnoreDirs', ensureString(settings.bitbucketIgnoreDirs));
                }
                if (settings.bitbucketServiceMappings !== undefined) {
                    localStorage.setItem('bitbucketServiceMappings', ensureString(settings.bitbucketServiceMappings));
                }
                if (settings.bitbucketIgnoreCommitters !== undefined) {
                    localStorage.setItem('bitbucketIgnoreCommitters', ensureString(settings.bitbucketIgnoreCommitters));
                }
                if (settings.bitbucketDirectories !== undefined) {
                    localStorage.setItem('bitbucketDirectories', ensureString(settings.bitbucketDirectories));
                }
                
                // Reload the settings UI to reflect imported values
                loadJiraDeploymentLinks();
                
                setStatus('Settings imported successfully!', 'success');
                setTimeout(() => setStatus(''), 3000);
                
                // Reset file input
                fileInput.value = '';
            } catch (error) {
                console.error('Error importing settings:', error);
                alert(`Failed to import settings: ${error.message}\n\nPlease ensure the file is a valid CSV Matcher settings export.`);
                setStatus('Failed to import settings', 'error');
                setTimeout(() => setStatus(''), 3000);
            }
        };
        
        reader.readAsText(file);
    };
}

/**
 * Loads ignore rules from localStorage and renders them
 */
/**
 * Loads Bitbucket ignore directory patterns from localStorage and renders the UI.
 */
export function loadBitbucketIgnoreDirs() {
    const container = document.getElementById('bitbucket-ignore-dirs-container');
    if (!container) return;
    
    const savedPatterns = localStorage.getItem('bitbucketIgnoreDirs');
    let patterns = [];
    
    if (savedPatterns) {
        try {
            patterns = JSON.parse(savedPatterns);
        } catch (e) {
            console.error('Failed to parse Bitbucket ignore patterns:', e);
            patterns = [];
        }
    } else {
        // Default patterns - only ignore git directories
        patterns = ['*.git*'];
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Render each pattern
    patterns.forEach((pattern, index) => {
        addBitbucketIgnoreDirUI(pattern, index);
    });
}

/**
 * Adds a new Bitbucket ignore directory pattern UI element
 */
function addBitbucketIgnoreDirUI(pattern = '', index = null) {
    const container = document.getElementById('bitbucket-ignore-dirs-container');
    if (!container) return;
    
    const patternDiv = document.createElement('div');
    patternDiv.className = 'flex items-center gap-2 p-2 bg-white border border-yellow-200 rounded';
    
    if (index === null) {
        index = container.children.length;
    }
    
    patternDiv.innerHTML = `
        <input 
            type="text" 
            data-index="${index}"
            class="bitbucket-ignore-pattern flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono"
            placeholder="Directory pattern (e.g., *pipeline*, *.git*)"
            value="${pattern || ''}"
        />
        <button 
            type="button"
            data-index="${index}"
            class="remove-bitbucket-ignore-pattern px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
            title="Remove this pattern"
        >
            ✕
        </button>
    `;
    
    container.appendChild(patternDiv);
    
    // Add event listeners
    const input = patternDiv.querySelector('input');
    input.addEventListener('change', saveBitbucketIgnoreDirs);
    
    const removeBtn = patternDiv.querySelector('.remove-bitbucket-ignore-pattern');
    removeBtn.addEventListener('click', () => {
        patternDiv.remove();
        saveBitbucketIgnoreDirs();
        // Re-index remaining patterns
        reindexBitbucketIgnorePatterns();
    });
}

/**
 * Re-indexes Bitbucket ignore patterns after removal
 */
function reindexBitbucketIgnorePatterns() {
    const container = document.getElementById('bitbucket-ignore-dirs-container');
    if (!container) return;
    
    const patterns = container.querySelectorAll('[data-index]');
    patterns.forEach((element, index) => {
        element.setAttribute('data-index', index);
    });
}

/**
 * Saves Bitbucket ignore directory patterns to localStorage
 */
function saveBitbucketIgnoreDirs() {
    const container = document.getElementById('bitbucket-ignore-dirs-container');
    if (!container) return;
    
    const patterns = [];
    const patternElements = container.children;
    
    for (let i = 0; i < patternElements.length; i++) {
        const patternDiv = patternElements[i];
        const input = patternDiv.querySelector('.bitbucket-ignore-pattern');
        
        if (input && input.value.trim()) {
            patterns.push(input.value.trim());
        }
    }
    
    localStorage.setItem('bitbucketIgnoreDirs', JSON.stringify(patterns));
}

/**
 * Checks if a Bitbucket directory should be ignored based on configured patterns
 * @param {string} path - The directory path to check
 * @returns {boolean} - True if the directory should be ignored
 */
export function shouldIgnoreBitbucketDir(path) {
    const savedPatterns = localStorage.getItem('bitbucketIgnoreDirs');
    if (!savedPatterns) return false;
    
    let patterns = [];
    try {
        patterns = JSON.parse(savedPatterns);
    } catch (e) {
        console.error('Failed to parse Bitbucket ignore patterns:', e);
        return false;
    }
    
    for (const pattern of patterns) {
        if (!pattern) continue;
        
        // Convert wildcard to regex
        const regexPattern = pattern.replace(/\*/g, '.*');
        try {
            const regex = new RegExp(regexPattern, 'i'); // case-insensitive
            if (regex.test(path)) {
                console.log(`[Ignored Bitbucket Directory] ${path} matches pattern: ${pattern}`);
                return true;
            }
        } catch (e) {
            // If regex fails, try simple string matching
            if (path.toLowerCase().includes(pattern.toLowerCase())) {
                console.log(`[Ignored Bitbucket Directory] ${path} contains: ${pattern}`);
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Loads Bitbucket service name mappings from localStorage and renders the UI.
 */
export function loadBitbucketServiceMappings() {
    const container = document.getElementById('bitbucket-service-mappings-container');
    if (!container) return;
    
    const savedMappings = localStorage.getItem('bitbucketServiceMappings');
    let mappings = [];
    
    if (savedMappings) {
        try {
            mappings = JSON.parse(savedMappings);
        } catch (e) {
            console.error('Failed to parse Bitbucket service mappings:', e);
            mappings = [];
        }
    } else {
        // Default mappings
        mappings = [
            { serviceName: 'data-infra-appstats', bitbucketPath: 'pipeline/appstats' },
            { serviceName: 'data-infra-connstats', bitbucketPath: 'pipeline/connstats' }
        ];
        // Save default mappings to localStorage immediately
        localStorage.setItem('bitbucketServiceMappings', JSON.stringify(mappings));
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Render each mapping
    mappings.forEach((mapping, index) => {
        addBitbucketServiceMappingUI(mapping, index);
    });
}

/**
 * Adds a new Bitbucket service mapping UI element
 */
function addBitbucketServiceMappingUI(mapping = { serviceName: '', bitbucketPath: '' }, index = null) {
    const container = document.getElementById('bitbucket-service-mappings-container');
    if (!container) return;
    
    const mappingDiv = document.createElement('div');
    mappingDiv.className = 'flex items-center gap-2 p-2 bg-white border border-yellow-200 rounded';
    
    if (index === null) {
        index = container.children.length;
    }
    
    mappingDiv.innerHTML = `
        <input 
            type="text" 
            data-index="${index}"
            data-field="serviceName"
            class="bitbucket-mapping-service flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono"
            placeholder="Service name (e.g., data-infra-appstats)"
            value="${mapping.serviceName || ''}"
        />
        <span class="text-gray-500 text-xs">→</span>
        <input 
            type="text" 
            data-index="${index}"
            data-field="bitbucketPath"
            class="bitbucket-mapping-path flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono"
            placeholder="Bitbucket path (e.g., pipeline/appstats)"
            value="${mapping.bitbucketPath || ''}"
        />
        <button 
            type="button"
            data-index="${index}"
            class="remove-bitbucket-mapping px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
            title="Remove this mapping"
        >
            ✕
        </button>
    `;
    
    container.appendChild(mappingDiv);
    
    // Add event listeners
    const inputs = mappingDiv.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', saveBitbucketServiceMappings);
    });
    
    const removeBtn = mappingDiv.querySelector('.remove-bitbucket-mapping');
    removeBtn.addEventListener('click', () => {
        mappingDiv.remove();
        saveBitbucketServiceMappings();
        // Re-index remaining mappings
        reindexBitbucketServiceMappings();
    });
}

/**
 * Re-indexes Bitbucket service mappings after removal
 */
function reindexBitbucketServiceMappings() {
    const container = document.getElementById('bitbucket-service-mappings-container');
    if (!container) return;
    
    const mappings = container.querySelectorAll('[data-index]');
    mappings.forEach((element, index) => {
        element.setAttribute('data-index', index);
    });
}

/**
 * Saves Bitbucket service mappings to localStorage
 */
function saveBitbucketServiceMappings() {
    const container = document.getElementById('bitbucket-service-mappings-container');
    if (!container) return;
    
    const mappings = [];
    const mappingElements = container.children;
    
    for (let i = 0; i < mappingElements.length; i++) {
        const mappingDiv = mappingElements[i];
        const serviceInput = mappingDiv.querySelector('.bitbucket-mapping-service');
        const pathInput = mappingDiv.querySelector('.bitbucket-mapping-path');
        
        if (serviceInput && pathInput && serviceInput.value.trim() && pathInput.value.trim()) {
            mappings.push({
                serviceName: serviceInput.value.trim(),
                bitbucketPath: pathInput.value.trim()
            });
        }
    }
    
    localStorage.setItem('bitbucketServiceMappings', JSON.stringify(mappings));
}

/**
 * Gets the Bitbucket path for a service name, applying mappings if configured
 * @param {string} serviceName - The service name from the table
 * @returns {string} - The mapped Bitbucket path or original service name
 */
export function getBitbucketPathForService(serviceName) {
    const savedMappings = localStorage.getItem('bitbucketServiceMappings');
    console.log(`[Service Mapping] Retrieving mapping for service: ${serviceName} in mappings: ${savedMappings}`);
    if (!savedMappings) return serviceName;
    
    let mappings = [];
    try {
        mappings = JSON.parse(savedMappings);
    } catch (e) {
        console.error('Failed to parse Bitbucket service mappings:', e);
        return serviceName;
    }
    
    // Find exact match first
    const mapping = mappings.find(m => m.serviceName.toLowerCase() === serviceName.toLowerCase());
    console.log(`[Service Mapping] Looking up mapping for service: ${serviceName}`);
    if (mapping) {
        console.log(`[Service Mapping] ${serviceName} → ${mapping.bitbucketPath}`);
        return mapping.bitbucketPath;
    }
    
    return serviceName;
}

/**
 * Loads Bitbucket ignore committers from localStorage and renders the UI.
 */
export function loadBitbucketIgnoreCommitters() {
    const container = document.getElementById('bitbucket-ignore-committers-container');
    if (!container) return;
    
    const savedCommitters = localStorage.getItem('bitbucketIgnoreCommitters');
    let committers = [];
    
    if (savedCommitters) {
        try {
            committers = JSON.parse(savedCommitters);
        } catch (e) {
            console.error('Failed to parse Bitbucket ignore committers:', e);
            committers = [];
        }
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Render each committer
    committers.forEach((committer, index) => {
        addBitbucketIgnoreCommitterUI(committer, index);
    });
}

/**
 * Adds a new Bitbucket ignore committer UI element
 */
function addBitbucketIgnoreCommitterUI(committer = '', index = null) {
    const container = document.getElementById('bitbucket-ignore-committers-container');
    if (!container) return;
    
    const committerDiv = document.createElement('div');
    committerDiv.className = 'flex items-center gap-2 p-2 bg-white border border-yellow-200 rounded';
    
    if (index === null) {
        index = container.children.length;
    }
    
    committerDiv.innerHTML = `
        <input 
            type="text" 
            data-index="${index}"
            class="bitbucket-ignore-committer flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono"
            placeholder="Committer name (e.g., Jenkins, CI Bot)"
            value="${committer || ''}"
        />
        <button 
            type="button"
            data-index="${index}"
            class="remove-bitbucket-ignore-committer px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
            title="Remove this committer"
        >
            ✕
        </button>
    `;
    
    container.appendChild(committerDiv);
    
    // Add event listeners
    const input = committerDiv.querySelector('input');
    input.addEventListener('change', saveBitbucketIgnoreCommitters);
    
    const removeBtn = committerDiv.querySelector('.remove-bitbucket-ignore-committer');
    removeBtn.addEventListener('click', () => {
        committerDiv.remove();
        saveBitbucketIgnoreCommitters();
        // Re-index remaining committers
        reindexBitbucketIgnoreCommitters();
    });
}

/**
 * Re-indexes Bitbucket ignore committers after removal
 */
function reindexBitbucketIgnoreCommitters() {
    const container = document.getElementById('bitbucket-ignore-committers-container');
    if (!container) return;
    
    const committers = container.querySelectorAll('[data-index]');
    committers.forEach((element, index) => {
        element.setAttribute('data-index', index);
    });
}

/**
 * Saves Bitbucket ignore committers to localStorage
 */
function saveBitbucketIgnoreCommitters() {
    const container = document.getElementById('bitbucket-ignore-committers-container');
    if (!container) return;
    
    const committers = [];
    const committerElements = container.children;
    
    for (let i = 0; i < committerElements.length; i++) {
        const committerDiv = committerElements[i];
        const input = committerDiv.querySelector('.bitbucket-ignore-committer');
        
        if (input && input.value.trim()) {
            committers.push(input.value.trim());
        }
    }
    
    localStorage.setItem('bitbucketIgnoreCommitters', JSON.stringify(committers));
}

/**
 * Checks if a committer should be ignored based on configured list
 * @param {string} committerName - The committer display name to check
 * @returns {boolean} - True if the committer should be ignored
 */
export function shouldIgnoreCommitter(committerName) {
    const savedCommitters = localStorage.getItem('bitbucketIgnoreCommitters');
    if (!savedCommitters) return false;
    
    let committers = [];
    try {
        committers = JSON.parse(savedCommitters);
    } catch (e) {
        console.error('Failed to parse Bitbucket ignore committers:', e);
        return false;
    }
    
    // Check if committer name matches any in the ignore list (case-insensitive)
    for (const ignoreCommitter of committers) {
        if (!ignoreCommitter) continue;
        
        if (committerName.toLowerCase() === ignoreCommitter.toLowerCase()) {
            console.log(`[Ignored Committer] ${committerName} matches: ${ignoreCommitter}`);
            return true;
        }
    }
    
    return false;
}

/**
 * Loads Bitbucket directories from localStorage and renders them
 */
export function loadBitbucketDirectories() {
    const container = document.getElementById('bitbucket-directories-container');
    if (!container) return;
    
    const savedDirs = localStorage.getItem('bitbucketDirectories');
    let directories = [];
    
    if (savedDirs) {
        try {
            directories = JSON.parse(savedDirs);
        } catch (e) {
            console.error('Failed to parse Bitbucket directories:', e);
            directories = [];
        }
    } else {
        // Default directory
        directories = [{
            path: 'data-infra',
            maxDepth: 3,
            repository: '',
            branch: ''
        }];
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Render each directory
    directories.forEach((dir, index) => {
        addBitbucketDirectoryUI(dir, index);
    });
}

/**
 * Adds a new Bitbucket directory UI element
 */
function addBitbucketDirectoryUI(dir = { path: '', maxDepth: 3, repository: '', branch: '' }, index = null) {
    const container = document.getElementById('bitbucket-directories-container');
    if (!container) return;
    
    const dirDiv = document.createElement('div');
    dirDiv.className = 'flex flex-col gap-2 p-3 bg-white border border-yellow-200 rounded';
    
    if (index === null) {
        index = container.children.length;
    }
    
    dirDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <div class="flex-1">
                <label class="block text-xs text-gray-600 mb-1">Directory Path</label>
                <input 
                    type="text" 
                    data-index="${index}"
                    data-field="path"
                    class="bitbucket-dir-path w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono"
                    placeholder="e.g., data-infra"
                    value="${dir.path || ''}"
                />
            </div>
            <div class="flex items-center gap-1">
                <div>
                    <label class="block text-xs text-gray-600 mb-1 whitespace-nowrap">Max Depth</label>
                    <input 
                        type="number" 
                        data-index="${index}"
                        data-field="maxDepth"
                        class="bitbucket-dir-depth w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500 text-center"
                        placeholder="3"
                        min="1"
                        max="10"
                        value="${dir.maxDepth || 3}"
                    />
                </div>
            </div>
            <button 
                type="button"
                data-index="${index}"
                class="remove-bitbucket-dir px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors self-end"
                title="Remove this directory"
            >
                ✕
            </button>
        </div>
        <div class="flex items-center gap-2">
            <div class="flex-1">
                <label class="block text-xs text-gray-600 mb-1">Repository <span class="text-red-500">*</span></label>
                <input 
                    type="text" 
                    data-index="${index}"
                    data-field="repository"
                    class="bitbucket-dir-repository w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono"
                    placeholder="e.g., workspace/repo-name (required)"
                    value="${dir.repository || ''}"
                />
            </div>
            <div class="flex-1">
                <label class="block text-xs text-gray-600 mb-1">Branch Override <span class="text-gray-400">(optional)</span></label>
                <input 
                    type="text" 
                    data-index="${index}"
                    data-field="branch"
                    class="bitbucket-dir-branch w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono"
                    placeholder="Leave empty to use Summary column"
                    value="${dir.branch || ''}"
                />
            </div>
        </div>
    `;
    
    container.appendChild(dirDiv);
    
    // Add event listeners
    const inputs = dirDiv.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', saveBitbucketDirectories);
    });
    
    const removeBtn = dirDiv.querySelector('.remove-bitbucket-dir');
    removeBtn.addEventListener('click', () => {
        dirDiv.remove();
        saveBitbucketDirectories();
        // Re-index remaining directories
        reindexBitbucketDirectories();
    });
}

/**
 * Re-indexes Bitbucket directories after removal
 */
function reindexBitbucketDirectories() {
    const container = document.getElementById('bitbucket-directories-container');
    if (!container) return;
    
    const elements = container.querySelectorAll('[data-index]');
    elements.forEach((element, index) => {
        element.setAttribute('data-index', index);
    });
}

/**
 * Saves Bitbucket directories to localStorage
 */
function saveBitbucketDirectories() {
    const container = document.getElementById('bitbucket-directories-container');
    if (!container) return;
    
    const directories = [];
    const dirElements = container.children;
    
    for (let i = 0; i < dirElements.length; i++) {
        const dirDiv = dirElements[i];
        const pathInput = dirDiv.querySelector('.bitbucket-dir-path');
        const depthInput = dirDiv.querySelector('.bitbucket-dir-depth');
        const repositoryInput = dirDiv.querySelector('.bitbucket-dir-repository');
        const branchInput = dirDiv.querySelector('.bitbucket-dir-branch');
        
        if (pathInput && depthInput && repositoryInput) {
            const path = pathInput.value.trim();
            const maxDepth = parseInt(depthInput.value) || 3;
            const repository = repositoryInput.value.trim();
            const branch = branchInput ? branchInput.value.trim() : '';
            
            if (path) {
                directories.push({
                    path: path,
                    maxDepth: Math.max(1, Math.min(10, maxDepth)), // Clamp between 1 and 10
                    repository: repository,
                    branch: branch
                });
            }
        }
    }
    
    localStorage.setItem('bitbucketDirectories', JSON.stringify(directories));
}

/**
 * Gets Bitbucket directories from localStorage
 * @returns {Array} Array of directory objects with path, maxDepth, repository, and branch
 */
export function getBitbucketDirectories() {
    const savedDirs = localStorage.getItem('bitbucketDirectories');
    if (!savedDirs) {
        return [{ path: 'data-infra', maxDepth: 3, repository: '', branch: '' }]; // Default
    }
    
    try {
        return JSON.parse(savedDirs);
    } catch (e) {
        console.error('Failed to parse Bitbucket directories:', e);
        return [{ path: 'data-infra', maxDepth: 3, repository: '', branch: '' }]; // Default
    }
}

/**
 * Downloads the Jenkins request script and shows instructions.
 */
export function downloadJenkinsScript() {
    const scriptContent = `#!/bin/bash

# --- Shell Script to Extract Job URLs from Jenkins API ---

# 1. Check for required arguments
if [ -z "$1" ]; then
    echo "❌ Error: Missing URL." >&2
    echo ""
    echo "Usage: $0 <url> [username] [password]" >&2
    echo ""
    echo "Example (Authenticated):" >&2
    echo "$0 'https://jenkins.example.com/view/api/json' 'jenkins_user' 'token'" >&2
    echo ""
    echo "Example (Unauthenticated):" >&2
    echo "$0 'https://some.public.api/data.json'" >&2
    exit 1
fi

# Assign arguments to meaningful variables
JENKINS_URL="$1"
AUTH_USERNAME="$2"
AUTH_PASSWORD="$3"

# 2. Check for 'jq' dependency
if ! command -v jq &> /dev/null
then
    echo "❌ Error: 'jq' command is not found." >&2
    echo " 'jq' is required to parse the JSON response." >&2
    echo " On macOS, install with: 'brew install jq'" >&2
    exit 1
fi

echo "🚀 Attempting to fetch job URLs from: \${JENKINS_URL}"

# 3. Construct the curl command based on provided credentials
# Use an array to safely handle optional arguments and spaces in values
CURL_OPTS=("-s")

# Add authentication if a username is provided
if [ ! -z "$AUTH_USERNAME" ]; then
    CURL_OPTS+=("-u" "\${AUTH_USERNAME}:\${AUTH_PASSWORD}")
    echo "   (Using authentication for user: \${AUTH_USERNAME})"
else
    echo "   (No username/password provided; attempting unauthenticated access)"
fi

# 4. Perform Request and Status Check
# We pipe the result of a fetch to jq only if the status check passes.

HTTP_CODE=$(curl "\${CURL_OPTS[@]}" -o /dev/null -w "%{http_code}" "$JENKINS_URL")

if [ "$HTTP_CODE" -ne 200 ]; then
    echo "❌ HTTP Error: Received status code \${HTTP_CODE}." >&2
    echo " Check your URL, and ensure credentials (if provided) are valid and have permissions." >&2
    exit 1
fi

echo "✅ Request successful (HTTP \${HTTP_CODE}). Extracting URLs..."

# 5. Fetch data and pipe to jq for extraction
# .jobs: selects the 'jobs' array
# .[]: iterates over the array elements
# .url: extracts the 'url' field from each element
# -r: outputs raw strings (no quotes)

curl "\${CURL_OPTS[@]}" "$JENKINS_URL" | jq -r '.jobs | .[] | .url'
`;

    // Create a Blob with the script content
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'get_jenkins_requests.sh';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show instructions
    const instructions = document.getElementById('script-instructions');
    if (instructions) {
        instructions.classList.remove('hidden');
    }
    
    setStatus('Script downloaded! Check your Downloads folder.', 'success');
    setTimeout(() => setStatus(''), 3000);
}

/**
 * Syncs credentials from first config to second config and Jenkins API config.
 */
function syncCredentialsToOtherConfigs(username, password) {
    // Sync to second Jenkins Build Links config
    const jenkinsBuildsUsernameInput = document.getElementById('jenkins-builds-username');
    const jenkinsBuildsPassInput = document.getElementById('jenkins-builds-pass');
    
    if (jenkinsBuildsUsernameInput) {
        jenkinsBuildsUsernameInput.value = username;
    }
    if (jenkinsBuildsPassInput) {
        jenkinsBuildsPassInput.value = password;
    }
    
    // Sync to Jenkins API Configuration (for Show Last Successful Builds)
    const buildApiUsernameInput = document.getElementById('jenkins-build-api-username');
    const buildApiPasswordInput = document.getElementById('jenkins-build-api-password');
    
    if (buildApiUsernameInput) {
        buildApiUsernameInput.value = username;
    }
    if (buildApiPasswordInput) {
        buildApiPasswordInput.value = password;
    }
    
    // Update button states after syncing
    updateRefreshButton2State();
}

/**
 * Updates the refresh button state based on Jenkins configuration.
 */
export function updateRefreshButtonState() {
    const jenkinsDeploysUrlInput = document.getElementById('jenkins-deploys-url');
    const jenkinsApiUsernameInput = document.getElementById('jenkins-api-username');
    const jenkinsApiPassInput = document.getElementById('jenkins-api-pass');
    const refreshBuildLinksBtn = document.getElementById('refresh-build-links-btn');
    
    if (!jenkinsDeploysUrlInput || !jenkinsApiUsernameInput || !jenkinsApiPassInput || !refreshBuildLinksBtn) return;
    
    const url = jenkinsDeploysUrlInput.value.trim();
    const username = jenkinsApiUsernameInput.value.trim();
    const pass = jenkinsApiPassInput.value.trim();
    
    // Enable button only if all three parameters are provided
    if (url && username && pass) {
        refreshBuildLinksBtn.disabled = false;
        refreshBuildLinksBtn.title = 'Fetch build links from Jenkins API';
    } else {
        refreshBuildLinksBtn.disabled = true;
        refreshBuildLinksBtn.title = 'Configure Jenkins API credentials to enable';
    }
}

/**
 * Updates the second refresh button state based on Jenkins configuration.
 */
export function updateRefreshButton2State() {
    const jenkinsBuildsUrlInput = document.getElementById('jenkins-builds-url');
    const jenkinsBuildsUsernameInput = document.getElementById('jenkins-builds-username');
    const jenkinsBuildsPassInput = document.getElementById('jenkins-builds-pass');
    const refreshBuildLinks2Btn = document.getElementById('refresh-build-links-2-btn');
    
    if (!jenkinsBuildsUrlInput || !jenkinsBuildsUsernameInput || !jenkinsBuildsPassInput || !refreshBuildLinks2Btn) return;
    
    const url = jenkinsBuildsUrlInput.value.trim();
    const username = jenkinsBuildsUsernameInput.value.trim();
    const pass = jenkinsBuildsPassInput.value.trim();
    
    // Enable button only if all three parameters are provided
    if (url && username && pass) {
        refreshBuildLinks2Btn.disabled = false;
        refreshBuildLinks2Btn.title = 'Fetch build links from Jenkins API';
    } else {
        refreshBuildLinks2Btn.disabled = true;
        refreshBuildLinks2Btn.title = 'Configure Jenkins API credentials to enable';
    }
}

/**
 * Updates Jenkins configuration section visibility.
 * Shows it only on explicit user action or error.
 */
export function updateJenkinsConfigVisibility() {
    // This function is now only called on errors
    // Config section stays closed by default
}

/**
 * Fetches build links from Jenkins API and populates the textarea.
 */
export async function refreshBuildLinks() {
    const jenkinsDeploysUrlInput = document.getElementById('jenkins-deploys-url');
    const jenkinsApiUsernameInput = document.getElementById('jenkins-api-username');
    const jenkinsApiPassInput = document.getElementById('jenkins-api-pass');
    const jiraDeploymentLinksInput = document.getElementById('jira-deployment-links');
    const refreshBuildLinksBtn = document.getElementById('refresh-build-links-btn');
    const jenkinsConfigSection = document.getElementById('jenkins-config-section');
    
    if (!jenkinsDeploysUrlInput || !jenkinsApiUsernameInput || !jenkinsApiPassInput || !jiraDeploymentLinksInput || !refreshBuildLinksBtn) return;
    
    const url = jenkinsDeploysUrlInput.value.trim();
    const username = jenkinsApiUsernameInput.value.trim();
    const pass = jenkinsApiPassInput.value.trim();
    
    if (!url || !username || !pass) {
        alert('Please configure Jenkins API credentials first.');
        if (jenkinsConfigSection) jenkinsConfigSection.classList.remove('hidden');
        return;
    }
    
    try {
        // Show loading state
        refreshBuildLinksBtn.disabled = true;
        refreshBuildLinksBtn.innerHTML = `
            <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Loading...
        `;
        
        // Create Basic Auth header
        const authHeader = 'Basic ' + btoa(username + ':' + pass);
        
        // Fetch data from Jenkins API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract URLs from jobs array
        if (data.jobs && Array.isArray(data.jobs)) {
            const urls = data.jobs.map(job => job.url).filter(url => url);
            
            // Clear previous values and set new ones in Jenkins Deployment Links
            jiraDeploymentLinksInput.value = urls.join('\n');
            
            // Auto-sync credentials to other configs
            syncCredentialsToOtherConfigs(username, pass);
            
            setStatus(`Successfully fetched ${urls.length} deployment links from Jenkins!`, 'success');
            setTimeout(() => setStatus(''), 3000);
        } else {
            throw new Error('Invalid response format: "jobs" array not found');
        }
        
    } catch (error) {
        console.error('Error fetching Jenkins build links:', error);
        alert(`Failed to fetch build links: ${error.message}\n\nPlease check your Jenkins URL and credentials.`);
        
        // Show config section on error
        if (jenkinsConfigSection) jenkinsConfigSection.classList.remove('hidden');
        
        setStatus('Failed to fetch build links from Jenkins', 'error');
        setTimeout(() => setStatus(''), 3000);
    } finally {
        // Restore button state
        refreshBuildLinksBtn.innerHTML = `
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
        `;
        updateRefreshButtonState();
    }
}

/**
 * Fetches build links from Jenkins API for the second section and populates the textarea.
 */
export async function refreshBuildLinks2() {
    const jenkinsBuildsUrlInput = document.getElementById('jenkins-builds-url');
    const jenkinsBuildsUsernameInput = document.getElementById('jenkins-builds-username');
    const jenkinsBuildsPassInput = document.getElementById('jenkins-builds-pass');
    const jiraBuildLinksInput = document.getElementById('jira-build-links');
    const refreshBuildLinks2Btn = document.getElementById('refresh-build-links-2-btn');
    const jenkinsConfig2Section = document.getElementById('jenkins-config-2-section');
    
    if (!jenkinsBuildsUrlInput || !jenkinsBuildsUsernameInput || !jenkinsBuildsPassInput || !jiraBuildLinksInput || !refreshBuildLinks2Btn) return;
    
    const url = jenkinsBuildsUrlInput.value.trim();
    const username = jenkinsBuildsUsernameInput.value.trim();
    const pass = jenkinsBuildsPassInput.value.trim();
    
    if (!url || !username || !pass) {
        alert('Please configure Jenkins API credentials first.');
        if (jenkinsConfig2Section) jenkinsConfig2Section.classList.remove('hidden');
        return;
    }
    
    try {
        // Show loading state
        refreshBuildLinks2Btn.disabled = true;
        refreshBuildLinks2Btn.innerHTML = `
            <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Loading...
        `;
        
        // Create Basic Auth header
        const authHeader = 'Basic ' + btoa(username + ':' + pass);
        
        // Fetch data from Jenkins API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract URLs from jobs array
        if (data.jobs && Array.isArray(data.jobs)) {
            const urls = data.jobs.map(job => job.url).filter(url => url);
            
            // Clear previous values and set new ones in Jenkins Build Links
            jiraBuildLinksInput.value = urls.join('\n');
            
            setStatus(`Successfully fetched ${urls.length} build links from Jenkins!`, 'success');
            setTimeout(() => setStatus(''), 3000);
        } else {
            throw new Error('Invalid response format: "jobs" array not found');
        }
        
    } catch (error) {
        console.error('Error fetching Jenkins build links:', error);
        alert(`Failed to fetch build links: ${error.message}\n\nPlease check your Jenkins URL and credentials.`);
        
        // Show config section on error
        if (jenkinsConfig2Section) jenkinsConfig2Section.classList.remove('hidden');
        
        setStatus('Failed to fetch build links from Jenkins', 'error');
        setTimeout(() => setStatus(''), 3000);
    } finally {
        // Restore button state
        refreshBuildLinks2Btn.innerHTML = `
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
        `;
        updateRefreshButton2State();
    }
}

/**
 * Fetches the production build from Jenkins job by searching through builds
 * @param {string} baseUrl - The base Jenkins job URL
 * @param {string} username - Jenkins username
 * @param {string} password - Jenkins password/token
 * @param {Function} onProgress - Optional callback for progress updates (current, total)
 * @returns {Promise<{id: string, url: string}>} Build info with id and url
 */
async function fetchProductionBuild(baseUrl, username, password, onProgress = null) {
    // First, get the job info with all builds
    const jobUrl = `${baseUrl}/api/json`;
    const authHeader = 'Basic ' + btoa(username + ':' + password);
    
    const jobResponse = await fetch(jobUrl, {
        method: 'GET',
        headers: {
            'Authorization': authHeader,
            'Accept': 'application/json'
        }
    });
    
    if (!jobResponse.ok) {
        throw new Error(`HTTP error! status: ${jobResponse.status}`);
    }
    
    const jobData = await jobResponse.json();
    
    // Check if builds array exists
    if (!jobData.builds || !Array.isArray(jobData.builds)) {
        return { id: '', url: baseUrl };
    }
    
    // Limit to first 20 builds to avoid taking too long
    const MAX_BUILDS_TO_CHECK = 20;
    const buildsToCheck = jobData.builds.slice(0, MAX_BUILDS_TO_CHECK);
    const totalBuilds = buildsToCheck.length;
    
    // Search through builds to find one with "production" in displayName
    for (let i = 0; i < buildsToCheck.length; i++) {
        const build = buildsToCheck[i];
        
        // Report progress if callback provided
        if (onProgress) {
            onProgress(i + 1, totalBuilds);
        }
        
        if (!build.url) continue;
        
        try {
            const buildUrl = `${build.url}api/json`;
            const buildResponse = await fetch(buildUrl, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Accept': 'application/json'
                }
            });
            
            if (!buildResponse.ok) continue;
            
            const buildData = await buildResponse.json();
            
            // Check if displayName contains "production" (case-insensitive)
            if (buildData.displayName && buildData.displayName.toLowerCase().includes('production')) {
                return {
                    id: buildData.id ? String(buildData.id) : String(buildData.number || ''),
                    url: baseUrl
                };
            }
        } catch (error) {
            console.error(`Error fetching build ${build.url}:`, error);
            continue;
        }
    }
    
    // If no production build found, return empty
    return { id: '', url: baseUrl };
}

/**
 * Fetches last completed build info from Jenkins
 * @param {string} baseUrl - The Jenkins job URL
 * @param {string} username - Jenkins username
 * @param {string} password - Jenkins password/token
 * @returns {Promise<{id: string, url: string}>}
 */
async function fetchLastCompletedBuild(baseUrl, username, password) {
    const url = `${baseUrl}/lastCompletedBuild/api/json`;
    const authHeader = 'Basic ' + btoa(username + ':' + password);
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': authHeader,
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
        id: data.id ? String(data.id) : '',
        url: baseUrl
    };
}

/**
 * Shows last successful builds for all services
 * @param {Array<Object>} mergedData - The current merged data
 * @param {Array<string>} mergedHeaders - The current headers
 * @param {Set<string>} filteredServiceNames - Optional set of service names to process (if provided, only these will be fetched)
 * @returns {Promise<{updatedData: Array<Object>, updatedHeaders: Array<string>}>}
 */
export async function showLastSuccessfulBuilds(mergedData, mergedHeaders, filteredServiceNames = null, onProgress = null) {
    // Get build links from settings
    const jiraBuildLinksInput = document.getElementById('jira-build-links');
    if (!jiraBuildLinksInput || !jiraBuildLinksInput.value.trim()) {
        alert('Please configure Jenkins Build Links in Settings first.');
        return { updatedData: mergedData, updatedHeaders: mergedHeaders };
    }
    
    // Get credentials
    const username = localStorage.getItem('jenkinsBuildApiUsername') || '';
    const password = localStorage.getItem('jenkinsBuildApiPassword') || '';
    
    if (!username || !password) {
        alert('Please configure Jenkins Build API credentials in Settings first.');
        return { updatedData: mergedData, updatedHeaders: mergedHeaders };
    }
    
    const allBuildLinks = jiraBuildLinksInput.value
        .split('\n')
        .map(link => link.trim())
        .filter(link => link.length > 0);
    
    if (allBuildLinks.length === 0) {
        alert('No build links found in Jenkins Build Links.');
        return { updatedData: mergedData, updatedHeaders: mergedHeaders };
    }
    
    // Get all unique service names from the table (remove -headless suffix)
    // If filteredServiceNames is provided, use only those services
    const serviceNamesInTable = new Set();
    mergedData.forEach(row => {
        const serviceName = row['Service0'] || '';
        if (serviceName) {
            // If filtering, skip services not in the filter
            if (filteredServiceNames && !filteredServiceNames.has(serviceName)) {
                return;
            }
            // Remove -headless suffix for matching
            const cleanName = serviceName.replace(/-headless$/i, '');
            serviceNamesInTable.add(cleanName.toLowerCase());
        }
    });
    
    // Filter build links to only those matching services in the table
    const buildLinks = allBuildLinks.filter(link => {
        const linkLower = link.toLowerCase();
        // Check if any service name from the table is in this link
        for (const serviceName of serviceNamesInTable) {
            if (linkLower.includes(serviceName)) {
                return true;
            }
        }
        return false;
    });
    
    console.log(`Filtered ${allBuildLinks.length} build links down to ${buildLinks.length} that match services in table`);
    
    if (buildLinks.length === 0) {
        alert('No build links match the services in your table.');
        return { updatedData: mergedData, updatedHeaders: mergedHeaders };
    }
    
    // Add new columns if they don't exist
    const newHeaders = [...mergedHeaders];
    if (!newHeaders.includes('build_images')) {
        newHeaders.push('build_images');
    }
    if (!newHeaders.includes('build_bundle')) {
        newHeaders.push('build_bundle');
    }
    
    // Create progress tracking based on number of services to process (filtered or all)
    const servicesToProcess = filteredServiceNames 
        ? mergedData.filter(row => row['Service0'] && filteredServiceNames.has(row['Service0'])).length
        : mergedData.filter(row => row['Service0']).length;
    let processedServices = 0;
    
    // Update progress function
    const updateProgress = (message = '') => {
        processedServices++;
        const displayMessage = message || `Processing service ${processedServices}/${servicesToProcess}`;
        if (onProgress) {
            onProgress(processedServices, servicesToProcess, displayMessage);
        }
    };
    
    // Process each row sequentially to show progress
    const updatedData = [];
    for (const row of mergedData) {
        const serviceName = row['Service0'] || '';
        if (!serviceName) {
            updatedData.push(row);
            continue;
        }
        
        // If filtering by specific services, skip services not in the filter
        if (filteredServiceNames && !filteredServiceNames.has(serviceName)) {
            // Skip fetching builds for this service, just copy the row as-is
            updatedData.push(row);
            continue;
        }
        
        const newRow = { ...row };
        
        // Remove -headless suffix for matching
        const serviceNameClean = serviceName.replace(/-headless$/i, '');
        
        // Find matching build links for this service (using cleaned name)
        const imagesLink = buildLinks.find(link => 
            link.toLowerCase().includes(serviceNameClean.toLowerCase()) && 
            link.toLowerCase().includes('images')
        );
        
        const bundleLink = buildLinks.find(link => 
            link.toLowerCase().includes(serviceNameClean.toLowerCase()) && 
            link.toLowerCase().includes('bundle')
        );
        
        // Fetch and set build_images
        if (imagesLink) {
            try {
                const buildInfo = await fetchProductionBuild(imagesLink, username, password, (current, total) => {
                    if (onProgress) {
                        onProgress(processedServices, servicesToProcess, `Checking images build ${current}/${total} for ${serviceName}`);
                    }
                });
                if (buildInfo.id) {
                    newRow['build_images'] = `<a href="${imagesLink}" target="_blank" rel="noopener noreferrer">${buildInfo.id}</a>`;
                } else {
                    newRow['build_images'] = 'Build not found';
                }
            } catch (error) {
                console.error(`Failed to fetch images build for ${serviceName}:`, error);
                newRow['build_images'] = 'Error';
            }
        } else {
            // No matching link found for this service
            newRow['build_images'] = 'Build not found';
        }
        
        // Fetch and set build_bundle
        if (bundleLink) {
            try {
                const buildInfo = await fetchProductionBuild(bundleLink, username, password, (current, total) => {
                    if (onProgress) {
                        onProgress(processedServices, servicesToProcess, `Checking bundle build ${current}/${total} for ${serviceName}`);
                    }
                });
                if (buildInfo.id) {
                    newRow['build_bundle'] = `<a href="${bundleLink}" target="_blank" rel="noopener noreferrer">${buildInfo.id}</a>`;
                } else {
                    newRow['build_bundle'] = 'Build not found';
                }
            } catch (error) {
                console.error(`Failed to fetch bundle build for ${serviceName}:`, error);
                newRow['build_bundle'] = 'Error';
            }
        } else {
            // No matching link found for this service
            newRow['build_bundle'] = 'Build not found';
        }
        
        updatedData.push(newRow);
        updateProgress(`Completed fetching builds for ${serviceName}`); // Update progress once per row/service
    }
    
    return { updatedData, updatedHeaders: newHeaders };
}

/**
 * Fetches service health status from multiple environments.
 * @param {Array} mergedData - The current merged data
 * @param {Array} mergedHeaders - The current headers
 * @returns {Object} Updated data and headers with health columns
 */
export async function showServiceHealth(mergedData, mergedHeaders) {
    // Get environments from settings
    const healthEnvironmentsInput = document.getElementById('health-environments');
    if (!healthEnvironmentsInput || !healthEnvironmentsInput.value.trim()) {
        alert('Please configure Environments in Settings first.');
        return { updatedData: mergedData, updatedHeaders: mergedHeaders };
    }
    
    // Get credentials
    const username = localStorage.getItem('healthApiUsername') || '';
    const password = localStorage.getItem('healthApiPassword') || '';
    
    if (!username || !password) {
        alert('Please configure Service Health API credentials in Settings first.');
        return { updatedData: mergedData, updatedHeaders: mergedHeaders };
    }
    
    const environments = healthEnvironmentsInput.value
        .split('\n')
        .map(env => env.trim())
        .filter(env => env.length > 0);
    
    if (environments.length === 0) {
        alert('No environments found in configuration.');
        return { updatedData: mergedData, updatedHeaders: mergedHeaders };
    }
    
    // Create column names for each environment
    const healthColumns = environments.map(env => `${env} Health`);
    
    // Add health columns to headers if not already present
    const newHeaders = [...mergedHeaders];
    healthColumns.forEach(col => {
        if (!newHeaders.includes(col)) {
            newHeaders.push(col);
        }
    });
    
    // Fetch health data for each environment
    const healthDataByEnv = {};
    
    for (const env of environments) {
        const url = `https://backoffice.${env}.catonet.works/automation/applications/`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.error(`Failed to fetch health data for ${env}: ${response.status}`);
                healthDataByEnv[env] = [];
                continue;
            }
            
            const data = await response.json();
            healthDataByEnv[env] = Array.isArray(data) ? data : [];
            
        } catch (error) {
            console.error(`Error fetching health data for ${env}:`, error);
            healthDataByEnv[env] = [];
        }
    }
    
    // Update merged data with health status
    const updatedData = mergedData.map(row => {
        const newRow = { ...row };
        // Normalize Service0: remove -headless suffix and any standalone "headless" word
        const service0Raw = (row['Service0'] || '').trim();
        const service0 = service0Raw
            .replace(/-headless$/gi, '')  // Remove -headless at the end
            .replace(/headless/gi, '')     // Remove any remaining "headless" word
            .replace(/\s+/g, ' ')          // Normalize whitespace
            .replace(/-+/g, '-')           // Normalize multiple hyphens
            .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
            .trim();
        
        if (!service0) {
            // If no Service0, set all health columns to empty
            healthColumns.forEach(col => {
                newRow[col] = '';
            });
            return newRow;
        }
        
        // Match service name with health data for each environment
        environments.forEach((env, index) => {
            const columnName = healthColumns[index];
            const healthData = healthDataByEnv[env] || [];
            
            // Find matching service (ignore "headless" in comparison)
            const matchingService = healthData.find(service => {
                const serviceNameRaw = (service.name || '').trim();
                // Normalize service name: remove -headless suffix and any standalone "headless" word
                const serviceName = serviceNameRaw
                    .replace(/-headless$/gi, '')  // Remove -headless at the end
                    .replace(/headless/gi, '')     // Remove any remaining "headless" word
                    .replace(/\s+/g, ' ')          // Normalize whitespace
                    .replace(/-+/g, '-')           // Normalize multiple hyphens
                    .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
                    .trim();
                return serviceName.toLowerCase() === service0.toLowerCase();
            });
            
            if (matchingService && matchingService.status) {
                newRow[columnName] = matchingService.status;
            } else {
                newRow[columnName] = 'Not found';
            }
        });
        
        return newRow;
    });
    
    return { updatedData, updatedHeaders: newHeaders };
}

// Get build versions from Health API
export async function getBuildVersions(data, headers) {
    const environmentsInput = document.getElementById('health-environments');
    if (!environmentsInput || !environmentsInput.value.trim()) {
        alert('Please configure environments in Settings (e.g., staging, prod1)');
        return { updatedData: data, updatedHeaders: headers };
    }

    // Get credentials from localStorage
    const username = localStorage.getItem('healthApiUsername') || '';
    const password = localStorage.getItem('healthApiPassword') || '';
    
    if (!username || !password) {
        alert('Please configure Service Health API credentials in Settings first.');
        return { updatedData: data, updatedHeaders: headers };
    }

    const environments = environmentsInput.value
        .split('\n')
        .map(env => env.trim())
        .filter(env => env.length > 0);
        
    if (environments.length === 0) {
        alert('No valid environments configured');
        return { updatedData: data, updatedHeaders: headers };
    }

    // Find Service0 column
    const serviceNameIndex = headers.findIndex(h => h === 'Service0');
    if (serviceNameIndex === -1) {
        alert('Service0 column not found');
        return { updatedData: data, updatedHeaders: headers };
    }

    // Create new headers with Version and Bundle columns
    const versionHeaders = environments.map(env => `Version ${env}`);
    const bundleHeaders = environments.map(env => `Bundle ${env}`);
    const newHeaders = [...headers, ...versionHeaders, ...bundleHeaders];

    // Create maps to store version and bundle data for each service and environment
    const versionDataMap = new Map();
    const bundleDataMap = new Map();

    // Fetch version data for all services from all environments
    const authHeader = 'Basic ' + btoa(`${username}:${password}`);
    
    const fetchPromises = environments.map(async env => {
        const apiUrl = `https://backoffice.${env}.catonet.works/automation/applications/`;
        
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error(`Failed to fetch from ${env}: ${response.status}`);
                return;
            }

            const responseData = await response.json();
            
            // Store version for each service
            if (Array.isArray(responseData)) {
                responseData.forEach(app => {
                    if (app && app.name) {
                        // Normalize the service name from API: remove -headless and headless word
                        let normalizedName = app.name
                            .replace(/-headless$/gi, '')     // Remove -headless suffix
                            .replace(/headless/gi, '')        // Remove any remaining "headless" word
                            .replace(/\s+/g, ' ')             // Normalize whitespace
                            .replace(/-+/g, ' ')              // Replace hyphens with spaces
                            .replace(/^-|-$/g, '')            // Remove leading/trailing hyphens
                            .trim()
                            .toLowerCase();
                        
                        // Only extract version and bundle if we have a valid service object
                        let version = 'Not found';
                        let bundle = 'Not found';
                        
                        if (app.instances && 
                            Array.isArray(app.instances) && 
                            app.instances.length > 0 && 
                            app.instances[0].registration) {
                            
                            // Extract version
                            if (app.instances[0].registration.metadata &&
                                app.instances[0].registration.metadata['app.kubernetes.io/version']) {
                                version = app.instances[0].registration.metadata['app.kubernetes.io/version'];
                            }
                            
                            // Extract bundle version
                            if (app.instances[0].registration.metadata['catonetworks.com/config-bundle-version']) {
                                bundle = app.instances[0].registration.metadata['catonetworks.com/config-bundle-version'];
                            }
                        }
                        
                        // Store version and bundle in maps
                        if (!versionDataMap.has(normalizedName)) {
                            versionDataMap.set(normalizedName, {});
                        }
                        versionDataMap.get(normalizedName)[env] = version;
                        
                        if (!bundleDataMap.has(normalizedName)) {
                            bundleDataMap.set(normalizedName, {});
                        }
                        bundleDataMap.get(normalizedName)[env] = bundle;
                    }
                });
            }
        } catch (error) {
            console.error(`Error fetching version from ${env}:`, error);
        }
    });

    await Promise.all(fetchPromises);

    // Add version data to each row
    const updatedData = data.map(row => {
        const newRow = { ...row };
        const serviceName = row[headers[serviceNameIndex]];
        
        if (!serviceName) {
            // No service name, add "Not found" for all environments
            environments.forEach(env => {
                newRow[`Version ${env}`] = 'Not found';
                newRow[`Bundle ${env}`] = 'Not found';
            });
            return newRow;
        }
        
        // Normalize service name from CSV to match API response normalization
        let normalizedServiceName = serviceName
            .replace(/-headless$/gi, '')     // Remove -headless suffix
            .replace(/headless/gi, '')        // Remove any remaining "headless" word
            .replace(/\s+/g, ' ')             // Normalize whitespace
            .replace(/-+/g, ' ')              // Replace hyphens with spaces
            .replace(/^-|-$/g, '')            // Remove leading/trailing hyphens
            .trim()
            .toLowerCase();
        
        environments.forEach(env => {
            const versionHeader = `Version ${env}`;
            const bundleHeader = `Bundle ${env}`;
            
            // Check if we have version data for this service and environment
            const serviceVersionData = versionDataMap.get(normalizedServiceName);
            if (serviceVersionData && serviceVersionData[env]) {
                newRow[versionHeader] = serviceVersionData[env];
            } else {
                newRow[versionHeader] = 'Not found';
            }
            
            // Check if we have bundle data for this service and environment
            const serviceBundleData = bundleDataMap.get(normalizedServiceName);
            if (serviceBundleData && serviceBundleData[env]) {
                newRow[bundleHeader] = serviceBundleData[env];
            } else {
                newRow[bundleHeader] = 'Not found';
            }
        });
        
        return newRow;
    });
    
    return { updatedData, updatedHeaders: newHeaders };
}

/**
 * Fetches directories recursively from Bitbucket API
 * @param {string} url - The API URL to fetch from
 * @param {number} depth - Current depth
 * @param {Array} allDirectories - Accumulated list of directories
 * @param {string} authHeader - Basic auth header
 * @param {Set} visitedUrls - Set of already visited URLs to prevent loops
 * @param {Object} requestCounter - Counter object to track total requests
 * @param {number} maxDepth - Maximum depth to search (defaults to 3)
 * @returns {Promise<Array>} - List of all directories found
 */
async function fetchDirectoriesRecursive(url, depth = 0, allDirectories = [], authHeader = null, visitedUrls = new Set(), requestCounter = { count: 0 }, maxDepth = 3) {
    const MAX_REQUESTS = 500; // Maximum number of API requests to prevent infinite loops
    
    // Check limits
    if (depth >= maxDepth) {
        console.log(`Max depth ${maxDepth} reached, stopping recursion`);
        return allDirectories;
    }
    
    if (requestCounter.count >= MAX_REQUESTS) {
        console.warn(`Max requests limit (${MAX_REQUESTS}) reached, stopping recursion`);
        return allDirectories;
    }
    
    // Check if URL already visited to prevent loops
    if (visitedUrls.has(url)) {
        console.log(`URL already visited, skipping: ${url}`);
        return allDirectories;
    }
    
    visitedUrls.add(url);
    requestCounter.count++;
    
    console.log(`Fetching (${requestCounter.count}/${MAX_REQUESTS}) depth ${depth}: ${url}`);
    
    try {
        const headers = {};
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }
        
        // Add pagelen=100 to URL if not already present
        let fetchUrl = url;
        if (!fetchUrl.includes('pagelen=')) {
            fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + 'pagelen=100';
        }
        
        const response = await fetch(fetchUrl, { headers });
        if (!response.ok) {
            console.error(`Failed to fetch from ${url}: ${response.status}`);
            return allDirectories;
        }
        
        const data = await response.json();
        // Filter directories and exclude those starting with a dot (e.g., .git, .github)
        // Also exclude directories matching ignore patterns
        const directories = (data.values || []).filter(item => {
            if (item.type !== 'commit_directory') return false;
            const pathParts = item.path ? item.path.split('/') : [];
            const dirName = pathParts[pathParts.length - 1] || '';
            
            // Exclude directories starting with a dot
            if (dirName.startsWith('.')) return false;
            
            // Exclude directories matching ignore patterns (check both full path and directory name)
            if (shouldIgnoreBitbucketDir(item.path) || shouldIgnoreBitbucketDir(dirName)) {
                return false;
            }
            
            return true;
        });
        
        console.log(`Found ${directories.length} directories at depth ${depth}`);
        
        // Add found directories to the list
        allDirectories.push(...directories);
        
        // Recursively fetch subdirectories (increase depth)
        for (const dir of directories) {
            const subUrl = dir.links?.self?.href;
            if (subUrl && !visitedUrls.has(subUrl)) {
                await fetchDirectoriesRecursive(subUrl, depth + 1, allDirectories, authHeader, visitedUrls, requestCounter, maxDepth);
            }
        }
        
        // Handle pagination if exists (keep same depth, it's just the next page)
        if (data.next && !visitedUrls.has(data.next)) {
            await fetchDirectoriesRecursive(data.next, depth, allDirectories, authHeader, visitedUrls, requestCounter, maxDepth);
        }
        
        return allDirectories;
    } catch (error) {
        console.error(`Error fetching directories from ${url}:`, error);
        return allDirectories;
    }
}

/**
 * Fetches last committer information for all services
 * @param {Array} mergedData - Current table data
 * @param {Array} mergedHeaders - Current table headers
 * @param {Function} onProgress - Callback function for progress updates (current, total, message)
 * @returns {Promise<Object>} - Updated data and headers
 */
export async function getLastCommitter(mergedData, mergedHeaders, onProgress = null) {
    console.log('Starting Last Committer fetch...');
    
    // Get Bitbucket API configuration
    const bitbucketApiUrl = localStorage.getItem('bitbucketApiUrl') || '';
    const bitbucketUsername = localStorage.getItem('bitbucketApiUsername') || '';
    const bitbucketPassword = localStorage.getItem('bitbucketApiPassword') || '';
    
    if (!bitbucketApiUrl || !bitbucketUsername || !bitbucketPassword) {
        alert('Please configure Bitbucket API credentials in Settings first.');
        return { updatedData: mergedData, updatedHeaders: mergedHeaders };
    }
    
    // Add new header if it doesn't exist
    const newHeaders = [...mergedHeaders];
    if (!newHeaders.includes('Last Committer')) {
        newHeaders.push('Last Committer');
    }
    
    // Get unique branches from Summary column (third word)
    const branchesNeeded = new Set();
    mergedData.forEach(row => {
        const summary = (row['Summary0'] || row['Summary'] || '').trim();
        const thirdWord = summary.split(/\s+/)[2];
        if (thirdWord) {
            branchesNeeded.add(thirdWord);
        } else {
            branchesNeeded.add('master'); // Default branch
        }
    });
    
    console.log('Branches to fetch:', Array.from(branchesNeeded));
    
    // Create auth header
    const authHeader = 'Basic ' + btoa(`${bitbucketUsername}:${bitbucketPassword}`);
    
    // Get configured directories to search
    const searchDirectories = getBitbucketDirectories();
    console.log('Search directories:', searchDirectories);
    
    // Fetch directories for each branch and build a global directory map
    // Maps "repository:branch:serviceName" to directory object for accurate matching
    const directoryMap = new Map();
    
    const totalSteps = branchesNeeded.size * searchDirectories.length;
    let stepIndex = 0;
    
    for (const branch of branchesNeeded) {
        for (const searchDir of searchDirectories) {
            stepIndex++;
            
            // Use repository from searchDir (required field)
            const repository = searchDir.repository;
            if (!repository) {
                console.warn(`No repository configured for directory ${searchDir.path}, skipping...`);
                continue;
            }
            
            // Use branch override if specified, otherwise use current branch from loop
            const effectiveBranch = searchDir.branch || branch;
            
            if (onProgress) {
                onProgress(stepIndex, totalSteps + 1, `Fetching from ${searchDir.path} (repo: ${repository}, branch: ${effectiveBranch}, depth: ${searchDir.maxDepth})`);
            }
            
            // Build API URL using the base URL from settings and repository from directory config
            // bitbucketApiUrl should be like: https://api.bitbucket.org/2.0/repositories/workspace
            const repoBaseUrl = `${bitbucketApiUrl}/${repository}`;
            const baseUrl = `${repoBaseUrl}/src/${effectiveBranch}/${searchDir.path}?pagelen=100`;
            console.log(`Fetching directories - repo: ${repository}, branch: ${effectiveBranch}, path: ${searchDir.path}, maxDepth: ${searchDir.maxDepth}`);
            
            try {
                const directories = await fetchDirectoriesRecursive(baseUrl, 0, [], authHeader, new Set(), { count: 0 }, searchDir.maxDepth);
                console.log(`Found ${directories.length} directories in ${searchDir.path} for branch ${effectiveBranch}`);
                
                // Index directories by "repository:branch:serviceName" for accurate matching
                directories.forEach(dir => {
                    const path = dir.path || '';
                    const pathParts = path.split('/').filter(part => part.length > 0); // Remove empty parts
                    
                    // Get the last non-empty segment as the service name
                    const serviceName = pathParts[pathParts.length - 1];
                    
                    if (serviceName) {
                        // Store with repository, effective branch, and service name
                        const key = `${repository}:${effectiveBranch}:${serviceName}`;
                        const commitHash = dir.commit?.hash || 'no-hash';
                        console.log(`Storing: ${key} -> commit: ${commitHash} (path: ${path})`);
                        // Store directory with metadata about which repo/branch it came from
                        directoryMap.set(key, {
                            ...dir,
                            _repository: repository,
                            _branch: effectiveBranch,
                            _repoBaseUrl: repoBaseUrl
                        });
                    }
                });
            } catch (error) {
                console.error(`Error fetching directories for repo ${repository}, branch ${effectiveBranch}, path ${searchDir.path}:`, error);
            }
        }
    }
    
    console.log(`Total unique services in directory map: ${directoryMap.size}`);
    
    if (onProgress) {
        onProgress(totalSteps + 1, totalSteps + 1, `Processing ${mergedData.length} services...`);
    }
    
    // Process each row to find matching directory and fetch committer
    let processedCount = 0;
    const updatedData = await Promise.all(mergedData.map(async (row, index) => {
        const newRow = { ...row };
        const serviceName = row['Service0'] || '';
        
        if (!serviceName) {
            newRow['Last Committer'] = '';
            processedCount++;
            return newRow;
        }
        
        // Get branch from Summary column (third word)
        const summary = (row['Summary0'] || row['Summary'] || '').trim();
        const thirdWord = summary.split(/\s+/)[2];
        const branch = thirdWord || 'master';
        
        // Clean service name (remove -headless suffix if present)
        const cleanServiceName = serviceName.replace(/-headless$/i, '');
        
        // Apply service name mapping if configured
        const mappedServiceName = getBitbucketPathForService(cleanServiceName);
        
        // Try to find matching directory
        let matchedDir = null;
        
        // If mapping contains "/", we need to match the entire path ending with the mapped value
        if (mappedServiceName.includes('/')) {
            console.log(`Looking for path ending with: ${mappedServiceName}`);
            
            // Search through all directories that end with the mapped path
            for (const [key, dir] of directoryMap.entries()) {
                // Key format: "repository:branch:serviceName"
                const [repo, branchInKey, serviceInKey] = key.split(':');
                
                // Check if branch matches (from Summary or default)
                if (branchInKey === branch) {
                    const dirPath = dir.path || '';
                    if (dirPath.endsWith(mappedServiceName)) {
                        matchedDir = dir;
                        console.log(`Path match found for ${serviceName} (mapped to ${mappedServiceName}) in repo ${repo}`);
                        break;
                    }
                }
            }
        } else {
            // Try exact match with repository:branch:serviceName
            // Try all repositories in the directory map
            for (const [key, dir] of directoryMap.entries()) {
                const [repo, branchInKey, serviceInKey] = key.split(':');
                
                // Check if branch and service name match
                if (branchInKey === branch && serviceInKey === mappedServiceName) {
                    matchedDir = dir;
                    console.log(`Exact match found for ${serviceName}${mappedServiceName !== cleanServiceName ? ' (mapped to ' + mappedServiceName + ')' : ''} in repo ${repo}`);
                    break;
                }
            }
        }
        
        if (!matchedDir) {
            console.log(`No directory match found for service: ${serviceName} on branch: ${branch}`);
            newRow['Last Committer'] = 'Not found';
            return newRow;
        }
        
        // Fetch commit information using path-based query with the repository from matched directory
        const commitPath = matchedDir.path;
        const repoBaseUrl = matchedDir._repoBaseUrl || bitbucketApiUrl;
        const commitUrl = `${repoBaseUrl}/commits?path=/${commitPath}`;
        const commitHtmlUrl = matchedDir.commit?.links?.html?.href;
        
        console.log(`Fetching commit for ${serviceName}: ${commitUrl}`);
        
        if (!commitPath) {
            console.log(`No commit path found for service: ${serviceName}`);
            newRow['Last Committer'] = 'Not found';
            return newRow;
        }
        
        try {
            const commitResponse = await fetch(commitUrl, {
                headers: {
                    'Authorization': authHeader
                }
            });
            if (!commitResponse.ok) {
                console.error(`Failed to fetch commit for ${serviceName}: ${commitResponse.status}`);
                newRow['Last Committer'] = 'Error';
                return newRow;
            }
            
            const commitData = await commitResponse.json();
            
            // The /commits endpoint returns an array of commits in the 'values' property
            const commits = commitData.values || [];
            if (commits.length === 0) {
                console.log(`No commits found for ${serviceName}`);
                newRow['Last Committer'] = 'Not found';
                return newRow;
            }
            
            // Find the first commit from a non-ignored committer
            let selectedCommit = null;
            for (const commit of commits) {
                const displayName = commit.author?.user?.display_name || 
                                   commit.author?.raw || 
                                   'Unknown';
                
                // Skip if this committer should be ignored
                if (shouldIgnoreCommitter(displayName)) {
                    console.log(`[Skipping Ignored Committer] ${serviceName}: ${displayName}`);
                    continue;
                }
                
                // Found a commit from a non-ignored committer
                selectedCommit = commit;
                break;
            }
            
            // If no non-ignored commit found, show "Not found"
            if (!selectedCommit) {
                console.log(`No commits from non-ignored users found for ${serviceName}`);
                newRow['Last Committer'] = 'Not found';
                return newRow;
            }
            
            const displayName = selectedCommit.author?.user?.display_name || 
                               selectedCommit.author?.raw || 
                               'Unknown';
            const commitHtmlLink = selectedCommit.links?.html?.href || commitHtmlUrl;
            
            // Create link with author name as text and commit URL as href
            if (commitHtmlLink) {
                newRow['Last Committer'] = `<a href="${commitHtmlLink}" target="_blank" rel="noopener noreferrer">${displayName}</a>`;
            } else {
                newRow['Last Committer'] = displayName;
            }
            
            console.log(`Found committer for ${serviceName}: ${displayName}`);
        } catch (error) {
            console.error(`Error fetching commit for ${serviceName}:`, error);
            newRow['Last Committer'] = 'Error';
        }
        
        return newRow;
    }));
    
    console.log('Last Committer fetch complete!');
    return { updatedData, updatedHeaders: newHeaders };
}
