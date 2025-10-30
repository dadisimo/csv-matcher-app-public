# Jenkins Script Guide

## Overview

The CSV Service Matcher includes a helper script to fetch deployment links from Jenkins API. This script bypasses browser CORS restrictions by running directly on your machine via Terminal.

## Why This Solution?

Browsers block direct API calls to Jenkins due to CORS (Cross-Origin Resource Sharing) security policies. However, command-line tools like `curl` don't have these restrictions. This script provides a simple way to fetch the deployment links you need.

## How to Use

### 1. Download the Script

1. Open the application in your browser
2. Click the **⚙️ Settings** button
3. Scroll down to the blue section titled "Need to fetch links from Jenkins API?"
4. Click **📥 Download Script**
5. The script will be saved to your Downloads folder as `get_jenkins_requests.sh`

### 2. Set Up (One-time)

Open Terminal and run:

```bash
cd ~/Downloads
chmod +x get_jenkins_requests.sh
```

**Note:** The script requires `jq` (a JSON processor). Install it with:

```bash
brew install jq
```

### 3. Run the Script

Run the script with your Jenkins API URL and credentials:

```bash
./get_jenkins_requests.sh 'YOUR_JENKINS_URL' 'your_username' 'your_password_or_token'
```

**Example:**

```bash
./get_jenkins_requests.sh \
  'https://maker.catonet.works/user/YOUR_USER_ID/my-views/view/Data%20Automation%20Responsibility%20Jobs/api/json' \
  '8b16e08b-d3cd-480b-bdbb-683a6237249b' \
  '11ad3b80f1005ac854d9b73e68ff6183bb'
```

### 4. Copy the Output

The script will output a list of URLs, one per line:

```
🚀 Attempting to fetch job URLs from: https://...
   (Using authentication for user: 8b16e08b-...)
✅ Request successful (HTTP 200). Extracting URLs...
https://maker.catonet.works/job/deploy-service-1/
https://maker.catonet.works/job/deploy-service-2/
https://maker.catonet.works/job/deploy-service-3/
```

### 5. Paste into Settings

1. Select and copy all the URLs from the Terminal output
2. Go back to the application
3. Open **⚙️ Settings**
4. Paste the URLs into the "Jenkins Deployment Links" textarea
5. Click **← Back** to save

## Security Notes

- ⚠️ **Never commit the script with hardcoded credentials** to version control
- ⚠️ Use Jenkins API tokens instead of passwords when possible
- ⚠️ The script runs locally on your machine - credentials are never sent to the web application

## Troubleshooting

### "jq: command not found"

Install `jq`:

```bash
brew install jq
```

### "Permission denied"

Make the script executable:

```bash
chmod +x get_jenkins_requests.sh
```

### HTTP Error (401, 403, etc.)

- Check that your Jenkins URL is correct
- Verify your username and password/token are valid
- Ensure your account has permission to access the Jenkins API

### No URLs in Output

- Verify the JSON response contains a `jobs` array with `url` fields
- Check the Jenkins API endpoint returns the expected format
- You can view the raw JSON by running: `curl -u "username:password" "YOUR_JENKINS_URL"`

## Alternative: Manual Entry

If you prefer not to use the script, you can always manually enter deployment links in the Settings modal, one per line.
