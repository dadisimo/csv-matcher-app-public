# CSV Service Matcher

A web-based tool for matching and merging CSV service data with JIRA information and version data.

## Project Structure

```
/Users/fadi.zreik/projects/personal/
├── index.html          # Main HTML file (simplified)
├── styles.css          # All CSS styles
├── config.json         # Global configuration
└── js/
    └── config.js       # Configuration constants
```

## Features

- **Multiple File Support**: Process multiple Services CSV files, JIRA CSV, and Versions JSON files
- **JSON-only Mode**: Process version JSON files without Services CSV using deployment links
- **Version Comparison**: Intelligent version matching with build number tolerance
- **Deployment Links**: Configurable deployment link filtering
- **Environment Filtering**: Regex-based environment name extraction
- **Data Manipulation**: Edit cells, delete rows, sort columns, filter data
- **Export Options**: Download as CSV or copy table as image
- **Persistent Settings**: LocalStorage-based configuration

## File Descriptions

### index.html
Main application file containing:
- HTML structure and UI elements
- JavaScript logic (to be modularized)
- Integration with external CSS and config files

### styles.css
All custom CSS including:
- Loading animations
- Table styling and scrollbars
- Sorting indicators
- Column filter chips
- Editable cell styles

### config.json
Global configuration file for deployment links and environment regex patterns.

### js/config.js
JavaScript configuration module exporting:
- DEFAULT_DEPLOYMENT_LINKS
- DEFAULT_ENV_REGEX
- globalConfig state

## Usage

1. Open `index.html` in a web browser
2. Configure deployment links in Settings (⚙️ icon)
3. Upload CSV/JSON files
4. Process and manipulate data
5. Export results

## Best Practices Implemented

✅ Separated CSS into external stylesheet
✅ Created configuration module for constants
✅ Added comprehensive documentation
✅ Modular file structure for future expansion

## Future Improvements

- [ ] Split JavaScript into modules (utils, data-processing, ui, etc.)
- [ ] Add TypeScript for type safety
- [ ] Implement unit tests
- [ ] Add build process (webpack/vite)
- [ ] Create npm package structure

## Technologies

- Vanilla JavaScript (ES6+)
- TailwindCSS (CDN)
- HTML2Canvas for image export
- LocalStorage for persistence
- GitHub API (optional) for shared config
