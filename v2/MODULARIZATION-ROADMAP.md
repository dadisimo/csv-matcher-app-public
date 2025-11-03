# JavaScript Modularization Roadmap

This document outlines how to fully modularize the JavaScript code (currently ~2400 lines inline).

## Module Structure Plan

```
js/
├── config.js              ✅ DONE - Constants and configuration
├── state.js               📋 State management (mergedData, headers, etc.)
├── dom-refs.js            📋 All DOM element references
├── utils/
│   ├── csv-parser.js      📋 CSV parsing functions
│   ├── json-parser.js     📋 JSON parsing functions
│   ├── version-utils.js   📋 Version comparison utilities
│   ├── filters.js         📋 Data filtering functions
│   └── export.js          📋 CSV/Image export utilities
├── processors/
│   ├── services.js        📋 Services data processing
│   ├── jira.js            📋 JIRA data processing
│   ├── versions.js        📋 Version data processing
│   └── merge.js           📋 Data merging logic
├── ui/
│   ├── table.js           📋 Table rendering and manipulation
│   ├── sort.js            📋 Sorting functionality
│   ├── column-filter.js   📋 Column filtering UI
│   ├── status.js          📋 Status message handling
│   └── modal.js           📋 Modal dialogs
├── features/
│   ├── settings.js        📋 Settings management
│   ├── jira-links.js      📋 JIRA links functionality
│   ├── row-operations.js  📋 Delete/restore rows
│   └── cell-editing.js    📋 Inline cell editing
├── storage/
│   └── local-storage.js   📋 LocalStorage utilities
└── main.js                📋 Application entry point and initialization
```

## Benefits of Full Modularization

1. **Testability**: Each module can be unit tested independently
2. **Reusability**: Functions can be imported where needed
3. **Maintainability**: Clear separation of concerns
4. **Collaboration**: Multiple developers can work on different modules
5. **Tree Shaking**: Unused code can be eliminated in production builds
6. **Type Safety**: Easier to add TypeScript

## Implementation Steps

### Step 1: Set Up Module System
```html
<!-- In index.html -->
<script type="module" src="js/main.js"></script>
```

### Step 2: Extract State Management (state.js)
```javascript
// js/state.js
export let mergedData = [];
export let mergedHeaders = [];
export let visibleHeaders = [];
export let deletedRows = [];
export let sortColumn = '';
export let sortDirection = 'asc';

export function updateMergedData(data) {
    mergedData = data;
}

// ... more state setters/getters
```

### Step 3: Extract DOM References (dom-refs.js)
```javascript
// js/dom-refs.js
export const elements = {
    jiraFileInput: document.getElementById('jira-file'),
    servicesFileInput: document.getElementById('services-file'),
    versionsFileInput: document.getElementById('versions-file'),
    processBtn: document.getElementById('process-btn'),
    // ... all other elements
};
```

### Step 4: Extract Utilities (utils/)
```javascript
// js/utils/csv-parser.js
export function parseCSV(text, keyColumn) {
    // Parsing logic
}

export function convertToCSV(data, headers) {
    // CSV conversion logic
}
```

### Step 5: Extract Processors (processors/)
```javascript
// js/processors/merge.js
import { parseCSV } from '../utils/csv-parser.js';

export function processMultipleServicesData(jiraData, allServicesData, fileNames) {
    // Processing logic
}
```

### Step 6: Extract UI Components (ui/)
```javascript
// js/ui/table.js
import { elements } from '../dom-refs.js';
import { mergedData } from '../state.js';

export function displayTable(data, headers) {
    // Table rendering logic
}

export function refreshTable() {
    // Refresh logic
}
```

### Step 7: Main Application (main.js)
```javascript
// js/main.js
import { elements } from './dom-refs.js';
import { handleProcess } from './processors/merge.js';
import { displayTable, refreshTable } from './ui/table.js';
import { initializeSettings } from './features/settings.js';

// Initialize application
function init() {
    // Set up event listeners
    elements.processBtn.addEventListener('click', handleProcess);
    
    // Initialize features
    initializeSettings();
    
    // ... more initialization
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
```

## Migration Strategy

### Approach A: Big Bang (Not Recommended)
- Refactor everything at once
- High risk of breaking things
- Difficult to test incrementally

### Approach B: Gradual Migration (Recommended) ✅
1. **Week 1**: Extract utilities (csv-parser, version-utils)
2. **Week 2**: Extract processors (services, jira, versions)
3. **Week 3**: Extract UI components (table, sort, filters)
4. **Week 4**: Extract features (settings, jira-links, row-operations)
5. **Week 5**: Testing and refinement

## Tools Needed

### Option 1: No Build Tool (Simple)
```html
<!-- Use import maps for module resolution -->
<script type="importmap">
{
  "imports": {
    "config": "./js/config.js",
    "state": "./js/state.js"
  }
}
</script>
<script type="module" src="js/main.js"></script>
```

### Option 2: With Vite (Recommended)
```bash
npm init vite@latest
npm install
npm run dev
```

Benefits:
- Hot module replacement
- Optimized production builds
- Automatic dependency resolution
- TypeScript support (optional)

### Option 3: With Webpack
More configuration required but maximum flexibility.

## Code Example: Before & After

### Before (Inline)
```javascript
// All in index.html <script> tag
const processBtn = document.getElementById('process-btn');
let mergedData = [];

function parseCSV(text, keyColumn) { /*...*/ }
function displayTable(data, headers) { /*...*/ }

processBtn.addEventListener('click', async () => {
    // 100+ lines of processing logic
});
```

### After (Modular)
```javascript
// js/main.js
import { elements } from './dom-refs.js';
import { handleProcess } from './processors/merge.js';

elements.processBtn.addEventListener('click', handleProcess);
```

```javascript
// js/processors/merge.js
import { parseCSV } from '../utils/csv-parser.js';
import { displayTable } from '../ui/table.js';
import { updateMergedData } from '../state.js';

export async function handleProcess() {
    // Processing logic
    const data = parseCSV(text, 'Service0');
    updateMergedData(data);
    displayTable(data, headers);
}
```

## Testing Strategy

Once modularized, add tests:

```javascript
// tests/utils/csv-parser.test.js
import { parseCSV } from '../../js/utils/csv-parser.js';
import { describe, it, expect } from 'vitest';

describe('parseCSV', () => {
    it('should parse valid CSV', () => {
        const csv = 'Service0,Status0\ntest,OK';
        const result = parseCSV(csv, 'Service0');
        expect(result).toHaveLength(1);
        expect(result[0].Service0).toBe('test');
    });
});
```

## Timeline Estimate

- **Quick wins** (CSS extraction): ✅ Done (2 hours)
- **Basic modules** (utils, config): 1 week
- **Core refactoring** (processors, UI): 2-3 weeks
- **Testing & refinement**: 1 week
- **Total**: 4-5 weeks for full modularization

## Decision: When to Modularize?

### Do it now if:
- ✅ You're adding many new features
- ✅ Multiple developers will work on the code
- ✅ You want to add unit tests
- ✅ The codebase will grow significantly

### Wait if:
- ✅ The current code is stable and working well (your case!)
- ✅ You're the only developer
- ✅ No major new features planned
- ✅ Time is limited

## Conclusion

For your current situation, the CSS extraction provides good-enough modularization. Full JavaScript modularization can be done later when:
- You have more time
- The codebase becomes harder to maintain
- You need to add complex features
- You want to implement automated testing

**Current status: Phase 1 complete! ✅**
