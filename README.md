# Material Coverage Calculator (Web)

A lightweight front-end app that converts your spreadsheet-style material estimator into a website-ready calculator.

## What it does

- Accepts project area as either:
  - **Total area** (sq ft / sq yd / sq m), or
  - **Width × Length** (ft / yd / m)
- Supports multiple project templates (tennis, pickleball, basketball)
- Applies coats, mix style, and packaging selections
- Calculates gallons needed and number of packages required
- Displays crack filler guidance table

## Run locally

Because this is a static site, you can host it with any web server.

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173`

## Adapting this to your exact spreadsheet

Most business logic is in `app.js`:

- `projectTypes`: zones and area ratios for each project type
- `productCatalog`: item numbers, coverage rates, mix availability
- `computeRows()`: where gallons and package counts are calculated

Replace those values with the exact values from your workbook tabs.

## Deploy to your website

Upload these files to your web hosting or include them in your existing site:

- `index.html`
- `styles.css`
- `app.js`

If your site uses WordPress, Webflow, Wix, Squarespace, etc., this calculator can be embedded in a custom HTML block.
