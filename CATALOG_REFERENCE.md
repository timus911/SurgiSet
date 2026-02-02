# Quick Reference: Instrument Catalog Usage

## For Developers

### Importing the Catalog
```typescript
import catalogData from '../../src/data/catalog.json';
```

### Catalog Entry Structure
```typescript
interface CatalogItem {
  id: string;              // e.g., "HTI_2_1"
  name: string;            // e.g., "TITANIUM IMPLANTER FORCEP 12CM"
  category: string;        // e.g., "Implanter"
  image: string;           // e.g., "HAIR TRANSPLANT INSTRUMENT_p2_img1.png"
  source: {
    catalogue: string;     // e.g., "HAIR TRANSPLANT INSTRUMENT"
    page: number;          // e.g., 2
  }
}
```

### Displaying Images
```typescript
// In React Native components
<Image 
  source={{ uri: `/assets/images/${item.image}` }} 
  style={styles.image}
  resizeMode="contain"
/>
```

### Searching the Catalog
```typescript
const searchResults = catalogData.filter(item =>
  item.name.toLowerCase().includes(query.toLowerCase()) ||
  item.category.toLowerCase().includes(query.toLowerCase())
);
```

### Filtering by Category
```typescript
const forceps = catalogData.filter(item => item.category === "Forceps");
const scissors = catalogData.filter(item => item.category === "Scissors");
```

### Getting Unique Categories
```typescript
const categories = [...new Set(catalogData.map(item => item.category))];
// Returns: ["Forceps", "Scissors", "Retractor", ...]
```

## Statistics

- **Total Instruments**: 992
- **Total Categories**: 19
- **Largest Category**: Forceps (212 items)
- **Image Format**: PNG
- **Image Location**: `assets/images/`

## Categories Available

1. Forceps (212)
2. Scissors (183)
3. Retractor (156)
4. General Instruments (104)
5. Scalpel (76)
6. Elevator (53)
7. Chisel (46)
8. Needle Holder (34)
9. Clamp (29)
10. Cannula (23)
11. Mallet (13)
12. Rongeur (12)
13. Speculum (11)
14. Probe (11)
15. Implanter (10)
16. Dissector (9)
17. Curette (5)
18. Punch (4)
19. Spatula (1)

## Example Usage in Components

### Search Screen
```typescript
// Already implemented in app/(tabs)/search.tsx
const filtered = catalogData.filter(i =>
  i.name.toLowerCase().includes(query.toLowerCase()) ||
  i.category.toLowerCase().includes(query.toLowerCase())
);
```

### Adding to Inventory
```typescript
// From search.tsx
addInstrument({
  name: item.name,
  category: item.category,
  quantity: 1,
  image: item.image ? `/assets/images/${item.image}` : undefined
});
```

### Category Browser (Future Enhancement)
```typescript
const CategoryBrowser = () => {
  const categories = [...new Set(catalogData.map(i => i.category))];
  
  return (
    <FlatList
      data={categories}
      renderItem={({ item: category }) => {
        const items = catalogData.filter(i => i.category === category);
        return (
          <CategorySection 
            category={category} 
            count={items.length}
            items={items}
          />
        );
      }}
    />
  );
};
```

## File Paths

### Catalog Data
```
surgiset-app/src/data/catalog.json
```

### Images
```
surgiset-app/assets/images/
```

### Source Catalogues
```
Catalogues/
├── HAIR TRANSPLANT INSTRUMENT.pdf
├── LIPO CATLAGOUE.pdf
├── MICRO INSTRUMENT CATLOG.pdf
└── Wilson & W. Wilson Catalagoue.pdf
```

## Updating the Catalog

See [scripts/README.md](file:///d:/CLOUD/OneDrive/Work/SSG%20Aesthetics/SurgInstru/scripts/README.md) for detailed instructions on:
- Adding new catalogues
- Extracting images
- Running the extraction script
- Manual refinement

## Performance Tips

### Lazy Loading Images
```typescript
// Use React Native's Image component which handles lazy loading
<Image source={{ uri: imageUri }} />
```

### Pagination for Large Lists
```typescript
// Use FlatList with pagination
<FlatList
  data={catalogData}
  initialNumToRender={20}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### Memoization
```typescript
const filteredData = useMemo(() => 
  catalogData.filter(i => i.category === selectedCategory),
  [selectedCategory]
);
```

## Common Queries

### Get all instruments from a specific catalogue
```typescript
const hairTransplantInstruments = catalogData.filter(
  item => item.source.catalogue === "HAIR TRANSPLANT INSTRUMENT"
);
```

### Get instruments by page
```typescript
const page5Instruments = catalogData.filter(
  item => item.source.page === 5
);
```

### Search with multiple criteria
```typescript
const results = catalogData.filter(item =>
  item.category === "Forceps" &&
  item.name.toLowerCase().includes("titanium")
);
```

## Troubleshooting

### Images not displaying
1. Check image path: `/assets/images/${item.image}`
2. Verify image exists in assets/images/
3. Check console for 404 errors

### Slow search performance
1. Use debouncing for search input
2. Implement pagination
3. Use memoization for filtered results

### Category not found
1. Check exact spelling (case-sensitive)
2. Use `catalogData.map(i => i.category)` to see all categories
3. Verify catalog.json is up to date
