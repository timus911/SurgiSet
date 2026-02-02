/**
 * Catalog Service - Simple static imports
 * For React Native compatibility
 */

import catalogData from '../data/catalog.json';

export interface CatalogItem {
    id: string;
    name: string;
    description: string;
    image: string;
    source?: {
        catalogue: string;
        page: number;
    };
}

// Type assertion and filtering for the catalog
const fullCatalog = (catalogData as any[]).map(item => ({
    id: item.id,
    name: item.name,
    description: item.category || '', // Map old category to description
    image: item.image,
    source: item.source
})).filter(item => {
    // Filter out obvious category placeholders
    const name = item.name.trim();
    const nameLower = name.toLowerCase();

    // 1. Specific blocklist for common category headers found in scrape
    const genericBlocklist = [
        "Thumb Forceps",
        "Dissectors & Elevators",
        "Nasal Speculums",
        "Nasal Forceps - Rongeurs",
        "Endoscopic Face & Forehead Lift",
        "Micro Vascular Clamps",
        "Ring Forceps - Clamps",
        "Mallets & Cartilage Instruments",
        "Measuring & Marking Instruments",
        "Skin Graft Instruments",
        "Chisels - Osteotomes - Gouges"
    ];
    if (genericBlocklist.includes(name)) return false;

    // 2. Contains " - " usually indicates a category range or group header
    if (nameLower.includes(' - ')) return false;

    // 3. Generic plural names or very short headers
    const genericTerms = ['forceps', 'scissors', 'cannulas', 'instruments', 'speculums', 'clamps', 'elevators', 'dissectors'];
    if (genericTerms.includes(nameLower)) return false;

    // 4. Very generic "Instruments" headers
    if (nameLower.endsWith(' instruments')) return false;

    // 5. If the name is exactly the same as the description, it's often a header
    if (nameLower === item.description.toLowerCase()) return false;

    return true;
});

/**
 * Search catalog
 */
export function searchCatalog(query: string, limit: number = 50): CatalogItem[] {
    if (!query || query.trim().length === 0) {
        // Return first items for empty search
        return fullCatalog.slice(0, limit);
    }

    const searchTerm = query.toLowerCase().trim();
    const results: CatalogItem[] = [];

    // Search through catalog
    for (const item of fullCatalog) {
        if (results.length >= limit) break;

        if (
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            (item.source && item.source.catalogue.toLowerCase().includes(searchTerm))
        ) {
            results.push(item);
        }
    }

    return results;
}

/**
 * Get all (now mapped) categories/descriptions
 */
export function getDescriptions(): string[] {
    const descriptions = new Set<string>();
    for (const item of fullCatalog) {
        descriptions.add(item.description);
    }
    return Array.from(descriptions).sort();
}

/**
 * Get instruments by description (formerly category)
 */
export function getInstrumentsByDescription(
    description: string,
    offset: number = 0,
    limit: number = 50
): CatalogItem[] {
    const filtered = fullCatalog.filter(item => item.description === description);
    return filtered.slice(offset, offset + limit);
}

/**
 * Get catalog statistics
 */
export function getCatalogStats() {
    const stats = {
        totalInstruments: fullCatalog.length,
        descriptions: {} as Record<string, number>,
    };

    for (const item of fullCatalog) {
        stats.descriptions[item.description] = (stats.descriptions[item.description] || 0) + 1;
    }

    return stats;
}

/**
 * Get instrument by ID
 */
export function getInstrumentById(id: string): CatalogItem | undefined {
    return fullCatalog.find(item => item.id === id);
}
