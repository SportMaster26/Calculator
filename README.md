# SportMaster Product Calculator (Web)

A web-based calculator that replicates the SportMaster Excel product calculator. Calculates material quantities, packaging, and item numbers for court surfacing projects.

## Features

- **5 Court Types**: Tennis, Pickleball, Basketball Full Court, Basketball Half Court, Total Area (Custom)
- **4 Input Modes**: Width x Length (ft), Square Footage, Square Yardage, Square Meters
- **4 Surface Types**: New Concrete, New Asphalt, Existing Concrete, Existing Asphalt
- **3 Packaging Options**: 55 Gallon Drums, 30 Gallon Kegs, 5 Gallon Pails
- **2 Mix Types**: Ready-to-Use (pre-mixed with sand) or Concentrate (add sand & water)
- **17 ColorPlus Colors** per zone
- **Per-zone breakdowns**: Resurfacer, Neutral Concentrate, Color Sand, ColorPlus tinting
- **ProCushion layers**: Standard and Premium systems
- **Striping**: Stripe Rite, White Line Paint, Masking Tape
- **Crack Filler guidance** reference table

## How It Works

The calculator mirrors the Excel workbook logic:

1. **Total area** is converted to square yards
2. **Coverage rates** (gal/sq yd/coat) are looked up per product and surface type
3. **Gallons** = `ceil(coverageRate × areaSqYd × coats)`
4. **Packages** = `ceil(gallons / packageSize)`
5. **Sand, ColorPlus, and item numbers** are derived from the package count and packaging type

Coverage rate tables come from the `55 GALLONS READY` and `55 GALLONS CONC` sheets in the original Excel workbook.

## Run Locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`

## Deploy

Upload these three files to any web host or embed in a CMS (WordPress, Webflow, Wix, Squarespace, etc.):

- `index.html`
- `styles.css`
- `app.js`
