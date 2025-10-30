#!/bin/bash

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

echo "🚀 Attempting to fetch job URLs from: ${JENKINS_URL}"

# 3. Construct the curl command based on provided credentials
# Use an array to safely handle optional arguments and spaces in values
CURL_OPTS=("-s")

# Add authentication if a username is provided
if [ ! -z "$AUTH_USERNAME" ]; then
    CURL_OPTS+=("-u" "${AUTH_USERNAME}:${AUTH_PASSWORD}")
    echo "   (Using authentication for user: ${AUTH_USERNAME})"
else
    echo "   (No username/password provided; attempting unauthenticated access)"
fi

# 4. Perform Request and Status Check
# We pipe the result of a fetch to jq only if the status check passes.

HTTP_CODE=$(curl "${CURL_OPTS[@]}" -o /dev/null -w "%{http_code}" "$JENKINS_URL")

if [ "$HTTP_CODE" -ne 200 ]; then
    echo "❌ HTTP Error: Received status code ${HTTP_CODE}." >&2
    echo " Check your URL, and ensure credentials (if provided) are valid and have permissions." >&2
    exit 1
fi

echo "✅ Request successful (HTTP ${HTTP_CODE}). Extracting URLs..."

# 5. Fetch data and pipe to jq for extraction
# .jobs: selects the 'jobs' array
# .[]: iterates over the array elements
# .url: extracts the 'url' field from each element
# -r: outputs raw strings (no quotes)

curl "${CURL_OPTS[@]}" "$JENKINS_URL" | jq -r '.jobs | .[] | .url'