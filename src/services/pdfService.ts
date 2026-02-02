import { Instrument, Set as InventorySet } from '../store/useInstrumentStore';
import { printAsync } from 'expo-print';
import { Platform } from 'react-native';

/**
 * PDF Service for generating instrument audits.
 */

// Helper to generate empty cells for handwriting
const generateCheckboxes = (count: number) => {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `<td class="checkbox-cell"></td>`;
    }
    return html;
};

// Helper to generate the ddmmyy header placeholder with shrunken digits
const generateDateHeader = () => {
    return `
    <div class="date-header-label">
        <span class="digit">dd</span>/<span class="digit">mm</span>/<span class="digit">yy</span>
    </div>`;
};

// Helper to format set name correctly
const formatSetName = (name: string) => {
    const trimmed = name.trim();
    const hasSet = trimmed.toLowerCase().endsWith('set');
    return hasSet ? trimmed : `${trimmed} Set`;
};

// Helper to generate filename: SurgSet_Audit_yymmddhhmmss
const getAuditFilename = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    // yymmddhhmmss
    const timestamp =
        now.getFullYear().toString().slice(-2) +
        pad(now.getMonth() + 1) +
        pad(now.getDate()) +
        pad(now.getHours()) +
        pad(now.getMinutes()) +
        pad(now.getSeconds());

    return `SurgSet_Audit_${timestamp}`;
};

export const generateCatalogPDF = async (inventory: Instrument[], sets: InventorySet[]) => {
    try {
        if (!inventory || !sets) {
            throw new Error("Inventory or Sets data is missing");
        }

        const filename = getAuditFilename();
        console.log(`Generating refined PDF Audit: ${filename}`);

        // 1. Identify "Miscellaneous" (Purchased but NOT in any set)
        const usedInstrumentIds = new Set<string>();
        sets.forEach(s => {
            if (s.instruments) {
                s.instruments.forEach(si => usedInstrumentIds.add(si.instrumentId));
            }
        });

        const miscInstruments = inventory.filter(i => !usedInstrumentIds.has(i.id) && i.quantity > 0);

        let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${filename}</title>
    <style>
        @page { size: auto; margin: 15mm; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            padding: 0; margin: 0; color: #1F2937; line-height: 1.2; background: white;
        }
        .header-section { 
            margin-bottom: 25px; border-bottom: 2.5px solid #4a90e2; padding-bottom: 12px; 
        }
        h1 { font-size: 24px; margin: 0; color: #111827; font-weight: 800; letter-spacing: -0.5px; }
        
        .set-page { page-break-after: always; padding-top: 5px; }
        .set-page:last-child { page-break-after: auto; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 15px; table-layout: fixed; }
        th { 
            background-color: #F9FAFB !important; -webkit-print-color-adjust: exact;
            text-align: left; padding: 8px; border: 1px solid #E5E7EB; 
            font-size: 10px; font-weight: bold; color: #4B5563; 
        }
        td { 
            padding: 8px 10px; border: 1px solid #E5E7EB; color: #374151; font-size: 12px; 
            vertical-align: middle; word-wrap: break-word;
        }
        .inst-name { font-weight: 600; color: #111827; display: block; font-size: 13px; }
        .inst-desc { font-size: 10px; color: #6B7280; display: block; margin-top: 1px; }
        
        .checkbox-cell { width: 60px; height: 35px; border: 1px solid #E5E7EB; }
        
        .date-header { 
            text-align: center !important; padding: 6px 2px !important; width: 60px; 
        }
        .date-header-label { 
            font-size: 14px; /* Slashes size */
            font-weight: 700; color: black; white-space: nowrap;
            padding: 0 2px;
        }
        .digit { 
            font-size: 9px; /* Shrunken dd mm yy */
            opacity: 0.2; color: black; vertical-align: middle;
        }

        .qty-cell { width: 35px; text-align: center; font-weight: bold; }
        .wishlist { background-color: #FDF2F8 !important; -webkit-print-color-adjust: exact; }
        .wishlist-tag { 
            font-size: 8px; background: #FCE7F3 !important; padding: 1px 3px; border-radius: 2px; 
            color: #BE185D; font-weight: bold; margin-left: 4px; -webkit-print-color-adjust: exact;
        }
        .footer { 
            margin-top: 40px; font-size: 9px; color: #9CA3AF; text-align: center; 
            border-top: 1px solid #F3F4F6; padding-top: 12px; 
        }
    </style>
</head>
<body>
`;

        for (const set of sets) {
            if (!set.instruments || set.instruments.length === 0) continue;
            htmlContent += `
            <div class="set-page">
                <div class="header-section"><h1>${formatSetName(set.name)}</h1></div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 45%;">Instrument</th>
                            <th class="qty-cell" style="width: 8%;">Qty</th>
                            ${Array.from({ length: 5 }).map(() => `<th class="date-header">${generateDateHeader()}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
            `;
            const sortedSetInstruments = set.instruments;
            for (const setInst of sortedSetInstruments) {
                const inst = inventory.find(i => i.id === setInst.instrumentId);
                if (!inst) continue;
                for (let q = 0; q < setInst.quantity; q++) {
                    const isWishlist = inst.isWishlist;
                    htmlContent += `
                    <tr class="${isWishlist ? 'wishlist' : ''}">
                        <td>
                            <span class="inst-name">${inst.name}${isWishlist ? '<span class="wishlist-tag">WISHLIST</span>' : ''}</span>
                            <span class="inst-desc">${inst.description || ''}</span>
                        </td>
                        <td class="qty-cell">1</td>
                        ${generateCheckboxes(5)}
                    </tr>`;
                }
            }
            htmlContent += `</tbody></table></div>`;
        }

        if (miscInstruments.length > 0) {
            htmlContent += `
            <div class="set-page">
                <div class="header-section"><h1>Miscellaneous Instruments</h1></div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 45%;">Instrument</th>
                            <th class="qty-cell" style="width: 8%;">Qty</th>
                            ${Array.from({ length: 5 }).map(() => `<th class="date-header">${generateDateHeader()}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
            `;
            const sortedMisc = [...miscInstruments].sort((a, b) => a.name.localeCompare(b.name));
            for (const inst of sortedMisc) {
                for (let q = 0; q < inst.quantity; q++) {
                    const isWishlist = inst.isWishlist;
                    htmlContent += `
                    <tr class="${isWishlist ? 'wishlist' : ''}">
                        <td>
                            <span class="inst-name">${inst.name}${isWishlist ? '<span class="wishlist-tag">WISHLIST</span>' : ''}</span>
                            <span class="inst-desc">${inst.description || ''}</span>
                        </td>
                        <td class="qty-cell">1</td>
                        ${generateCheckboxes(5)}
                    </tr>`;
                }
            }
            htmlContent += `</tbody></table></div>`;
        }

        htmlContent += `<div class="footer">Generated by SurgiSet Portfolio • Audit Report • ${new Date().toLocaleDateString()}</div></body></html>`;

        if (Platform.OS === 'web') {
            console.log(`Web platform. Temporarily hijacking main title for: ${filename}`);

            // 1. Save original main title
            const originalTitle = document.title;

            // 2. Set main title to the desired filename
            document.title = filename;

            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0';
            iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0';
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow?.document || iframe.contentDocument;
            if (doc) {
                doc.open();
                doc.write(htmlContent);
                // Also explicitly set the window title of the iframe
                doc.title = filename;
                doc.close();

                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();

                    // 3. Restore original title after a slight delay (enough for dialog to snap name)
                    setTimeout(() => {
                        document.title = originalTitle;
                        document.body.removeChild(iframe);
                    }, 1000);
                }, 500);
            }
        } else {
            // Mobile (iOS/Android) 
            await printAsync({ html: htmlContent });
        }

    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        if (Platform.OS === 'web') window.alert("Export Error: " + error.message);
    }
};
