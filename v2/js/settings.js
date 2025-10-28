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
    
    // Load regex (localStorage or defaults)
    if (savedRegex) {
        filterEnvRegexInput.value = savedRegex;
    } else {
        filterEnvRegexInput.value = DEFAULT_ENV_REGEX;
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
export async function showLastSuccessfulBuilds(mergedData, mergedHeaders, filteredServiceNames = null) {
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
    const updateProgress = () => {
        processedServices++;
        const percentage = Math.round((processedServices / servicesToProcess) * 100);
        setStatus(`Fetching production builds: ${processedServices}/${servicesToProcess} (${percentage}%)`, 'info');
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
                    setStatus(`Fetching production builds: ${processedServices}/${servicesToProcess} - Checking build ${current}/${total}`, 'info');
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
                    setStatus(`Fetching production builds: ${processedServices}/${servicesToProcess} - Checking build ${current}/${total}`, 'info');
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
        updateProgress(); // Update progress once per row/service
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
async function getBuildVersions(data, headers) {
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

export { getBuildVersions };
