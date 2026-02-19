# Calculator Redesign Plan

## Goals
1. **Multiple court types per project** — Users can add multiple court entries (e.g., 2 Tennis + 3 Pickleball + 1 Basketball) in a single calculation
2. **Consolidated material totals** — Keep separate sections (Resurfacer, Color Coating, Striping, ProCushion) but consolidate quantities within each section instead of showing per-zone breakdowns

## Shared vs Per-Court Settings
- **Shared globally:** Surface type, Packaging size, Mix type, Product option
- **Per court entry:** Court type, Dimensions (width/length/sqft/etc.), Number of courts, Zone colors

---

## UI Changes (`index.html`)

### Step 1-2 Redesign: Court Entries
Replace the current single "Court Dimensions" + "Court Type" sections with a **dynamic court list**:

- A "Courts" section with an **"Add Court"** button
- Each court entry is a card/row containing:
  - Court Type dropdown
  - Input Mode dropdown (Width x Length, sqft, sqyd, sqm)
  - Dimension inputs (value1, value2)
  - Number of Courts input
  - Zone Color dropdowns (dynamically generated based on court type)
  - A **Remove** button (if more than one court entry exists)
- Default: start with 1 court entry pre-populated

### Steps 3-4: Stay the Same (Global)
- Surface type, Packaging, Mix type, Product option remain as global settings shared across all courts

### Output Tables: Consolidate
- **Summary**: Show total area across all courts, list of court types/quantities
- **Zone Area Breakdown**: Show all zones from all court entries (labeled by court entry)
- **Total Area Materials (Resurfacer)**: One consolidated table — sum gallons for each product across all courts, recalculate packaging from total gallons
- **Court Zone Product Options**: Instead of per-zone rows, consolidate by product name — sum total gallons, recalculate total packaging. Group by color if needed so users know which ColorPlus to order.
- **ProCushion**: Consolidated totals across all courts
- **Striping**: Consolidated totals across all courts

---

## Calculation Changes (`app.js`)

### New Data Flow
1. Collect an **array of court entries** from the UI, each with: `{ courtType, inputMode, value1, value2, numCourts, zoneColors }`
2. Plus global settings: `{ surfaceType, packaging, mixType, productOption }`
3. For each court entry, run the existing zone area computation and per-zone product calculation
4. **Aggregate results** across all court entries:
   - **Total Area Materials**: Sum gallons per product (Adhesion Promoter, Resurfacer, Sand), then recalculate packaging from summed gallons
   - **Zone Products**: Sum gallons per product name (e.g., all "Neutral Concentrate w/ Sand" gallons across all zones), recalculate packaging. For ColorPlus, group by color name and sum.
   - **ProCushion**: Sum gallons per product across all courts, recalculate packaging
   - **Striping**: Sum across all courts (each court type contributes its own striping needs)

### Key Function Changes
- `calculate()` → accepts array of court entries + global settings, returns consolidated results
- `computeZoneAreas()` → stays the same, called per court entry
- New `aggregateResults()` function to merge per-court results into consolidated totals
- `getInputs()` → reads multiple court entries from the DOM
- `render()` → renders consolidated results

### Consolidation Logic
For each section, group by product name, sum gallons, then:
- `totalPackages = Math.ceil(totalGallons / pkgSize)`
- `packaging = totalPackages + ' x ' + pkgSize + ' Gal'`

For ColorPlus: group by color name, sum quantities, show one row per color.

---

## Implementation Steps

1. **Update `index.html`**: Replace Steps 1-2 with dynamic court entry list, add "Add Court" button
2. **Update `styles.css`**: Style the court entry cards, add/remove buttons
3. **Update `app.js` — UI functions**:
   - New `addCourtEntry()` / `removeCourtEntry()` functions
   - Update `getInputs()` to collect array of court entries
   - Update `updateZoneColorSelectors()` to work per court entry
   - Update `render()` and `renderResults()` for consolidated output
4. **Update `app.js` — Calculation**:
   - Modify `calculate()` to loop over court entries
   - Add `aggregateResults()` consolidation logic
   - Update striping/cushion calculations for multi-court
5. **Test**: Verify calculations match expected totals, test add/remove courts, test edge cases
