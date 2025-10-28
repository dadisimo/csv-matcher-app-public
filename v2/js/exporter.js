/**
 * Export and Download Module for CSV Service Matcher
 * Handles CSV downloads, image capture, and clipboard operations
 */

import { setStatus } from './utils.js';

/**
 * Converts an array of objects to a CSV string.
 * @param {Array<Object>} data - The data to convert.
 * @param {Array<string>} headers - The headers for the CSV.
 * @returns {string} The CSV content as a string.
 */
export function convertToCSV(data, headers) {
    const headerRow = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');
    const bodyRows = data.map(row => {
        return headers.map(header => {
            const value = row[header] === undefined || row[header] === null ? '' : String(row[header]);
            return `"${value.replace(/"/g, '""')}"`;
        }).join(',');
    });
    return [headerRow, ...bodyRows].join('\n');
}

/**
 * Triggers a file download.
 * @param {string} content - The content of the file.
 * @param {string} fileName - The name of the file to download.
 * @param {string} contentType - The MIME type of the file.
 */
export function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}

/**
 * Copies the table as an image to clipboard.
 */
export async function copyTableAsImage() {
    const tableContainer = document.querySelector('.table-container');
    
    if (!tableContainer) {
        setStatus('Table not found for image capture.');
        return;
    }

    setStatus('Capturing table image...', 'loading');

    try {
        // Store original styles
        const originalStyles = {
            maxHeight: tableContainer.style.maxHeight,
            overflow: tableContainer.style.overflow,
            height: tableContainer.style.height
        };

        // Temporarily remove height constraints to show full table
        tableContainer.style.maxHeight = 'none';
        tableContainer.style.overflow = 'visible';
        tableContainer.style.height = 'auto';

        // Wait a bit for the layout to adjust
        await new Promise(resolve => setTimeout(resolve, 100));

        // Configure html2canvas options for better quality
        const canvas = await html2canvas(tableContainer, {
            backgroundColor: '#ffffff',
            scale: 2, // Higher resolution
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0,
            width: tableContainer.scrollWidth,
            height: tableContainer.scrollHeight,
            windowWidth: tableContainer.scrollWidth,
            windowHeight: tableContainer.scrollHeight
        });

        // Restore original styles
        tableContainer.style.maxHeight = originalStyles.maxHeight;
        tableContainer.style.overflow = originalStyles.overflow;
        tableContainer.style.height = originalStyles.height;

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            try {
                // Use the Clipboard API to copy the image
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob
                    })
                ]);
                
                setStatus('Table image copied to clipboard!', 'success');
                setTimeout(() => setStatus(''), 2000);
            } catch (clipboardError) {
                console.error('Clipboard API failed:', clipboardError);
                
                // Fallback: create a download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'table-image.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                setStatus('Image saved as download (clipboard not supported)', 'success');
                setTimeout(() => setStatus(''), 3000);
            }
        }, 'image/png');

    } catch (error) {
        console.error('Failed to capture table as image:', error);
        setStatus('Failed to capture table image. Please try again.');
        
        // Make sure to restore styles even if there's an error
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            tableContainer.style.maxHeight = '50vh';
            tableContainer.style.overflow = 'auto';
            tableContainer.style.height = '';
        }
    }
}
