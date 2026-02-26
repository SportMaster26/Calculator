/* ──────────────────────────────────────────────
   SportMaster Product Calculator – Web Version
   Faithfully replicates the Excel/VBA calculator
   ────────────────────────────────────────────── */

// ── Unit conversion constants ──
const SQFT_PER_SQYD = 9;
const SQFT_PER_SQM = 10.7639;

// ── Coverage rate tables (from "55 GALLONS READY" / "55 GALLONS CONC" sheets) ──
// Columns: [Concrete, Asphalt, Existing Concrete, Existing Asphalt]
const coverageReady = {
  'Acrylic Adhesion Promoter':       [0.04, null, 0.04, null],
  'Acrylic Resurfacer w/ Sand':      [0.11, 0.13, 0.11, 0.11],
  'CushionMaster I (Fine Rubber)':   [0.10, 0.10, 0.10, 0.10],
  'CushionMaster II (Coarse Rubber)':[0.15, 0.15, 0.15, 0.15],
  'Neutral Concentrate w/ Sand':     [0.07, 0.09, 0.07, 0.07],
  'PickleMaster':                    [0.07, 0.09, 0.07, 0.07],
  'Ready Mix':                        [0.09, 0.11, 0.09, 0.09],
  'PickleMaster RTU':                [0.09, 0.11, 0.09, 0.09]
};

const coverageConc = {
  'Acrylic Adhesion Promoter':       [0.04, null, 0.04, null],
  'Acrylic Resurfacer':              [0.07, 0.09, 0.07, 0.07],
  'Flexible Acrylic Resurfacer':     [0.07, 0.09, 0.07, 0.07],
  'CushionMaster I (Fine Rubber)':   [0.10, 0.10, 0.10, 0.10],
  'CushionMaster II (Coarse Rubber)':[0.15, 0.15, 0.15, 0.15],
  'Neutral Concentrate':             [0.05, 0.07, 0.05, 0.05],
  'Flexible Concentrate':            [0.05, 0.07, 0.05, 0.05],
  'PickleMaster':                    [0.07, 0.09, 0.07, 0.07]
};

// ── Item number lookup (base numbers from catalog) ──
const itemNumbersReady = {
  'Acrylic Adhesion Promoter': 'C1650',
  'Acrylic Resurfacer w/ Sand': 'C1330',
  'CushionMaster I (Fine Rubber)': 'C1450',
  'CushionMaster II (Coarse Rubber)': 'C1460',
  'Neutral Concentrate w/ Sand': 'C1365',
  'PickleMaster': 'C1298',
  'Ready Mix': 'C1285P',
  'PickleMaster RTU': 'C1299P'
};

const itemNumbersConc = {
  'Acrylic Adhesion Promoter': 'C1650',
  'Acrylic Resurfacer': 'C1300',
  'CushionMaster I (Fine Rubber)': 'C1450',
  'CushionMaster II (Coarse Rubber)': 'C1460',
  'Neutral Concentrate': 'C1360',
  'PickleMaster': 'C1298'
};

// ── ColorPlus options (from "1 GALLON" sheet) ──
const colorOptions = [
  { name: 'Not Selected', itemG: '', itemJ: '' },
  { name: 'Forest Green ColorPlus', itemG: 'C1374G', itemJ: 'C1374J' },
  { name: 'Light Green ColorPlus', itemG: 'C1372G', itemJ: 'C1372J' },
  { name: 'Dark Green ColorPlus', itemG: 'C1373G', itemJ: 'C1373J' },
  { name: 'Beige ColorPlus', itemG: 'C1378G', itemJ: 'C1378J' },
  { name: 'Red ColorPlus', itemG: 'C1370G', itemJ: 'C1370J' },
  { name: 'Maroon ColorPlus', itemG: 'C1386G', itemJ: 'C1386J' },
  { name: 'Tournament Purple ColorPlus', itemG: 'C1388G', itemJ: 'C1388J' },
  { name: 'Gray ColorPlus', itemG: 'C1380G', itemJ: 'C1380J' },
  { name: 'Blue ColorPlus', itemG: 'C1384G', itemJ: 'C1384J' },
  { name: 'Light Blue ColorPlus', itemG: 'C1385G', itemJ: 'C1385J' },
  { name: 'Dove Gray ColorPlus', itemG: 'C1399G', itemJ: 'C1399J' },
  { name: 'Ice Blue ColorPlus', itemG: 'C1383G', itemJ: 'C1383J' },
  { name: 'Sandstone ColorPlus', itemG: 'C1389G', itemJ: 'C1389J' },
  { name: 'Orange ColorPlus', itemG: 'C1379G', itemJ: 'C1379J' },
  { name: 'Yellow ColorPlus', itemG: 'C1390G', itemJ: 'C1390J' },
  { name: 'Brite Red ColorPlus', itemG: 'C1392G', itemJ: 'C1392J' },
  { name: 'Black Dispersion ColorPlus', itemG: 'C1660G', itemJ: 'C1660J' }
];

// ── Color hex map for SVG previews ──
const colorHexMap = {
  'Not Selected': '#d5d5d5',
  'Forest Green ColorPlus': '#48543A',
  'Light Green ColorPlus': '#445E34',
  'Dark Green ColorPlus': '#3B4133',
  'Beige ColorPlus': '#806D59',
  'Red ColorPlus': '#6B3736',
  'Maroon ColorPlus': '#5A3A3A',
  'Tournament Purple ColorPlus': '#403A5F',
  'Gray ColorPlus': '#6D6D74',
  'Blue ColorPlus': '#2D3B5B',
  'Light Blue ColorPlus': '#486186',
  'Dove Gray ColorPlus': '#969696',
  'Ice Blue ColorPlus': '#7FB3D1',
  'Sandstone ColorPlus': '#B7A26E',
  'Orange ColorPlus': '#DD5D36',
  'Yellow ColorPlus': '#E4BD43',
  'Brite Red ColorPlus': '#C3332A',
  'Black Dispersion ColorPlus': '#111111',
  'Brown ColorPlus': '#42312D',
  'Bright Red ColorPlus': '#C3332A'
};

// ── Crack filler reference ──
const crackFillers = [
  { product: 'Acrylic Crack Patch', rateLabel: '75 - 150 feet of Cracks', rateMin: 75, rateMax: 150, width: 'For Cracks up to 1" wide', item: 'C1520G' },
  { product: 'CrackMagic', rateLabel: '75 - 150 feet of Cracks', rateMin: 75, rateMax: 150, width: 'For Cracks up to 1/2" wide', item: 'C1590G' },
  { product: 'CourtFlex', rateLabel: '150 - 200 feet of Cracks', rateMin: 150, rateMax: 200, width: 'For Cracks up to 1/2" wide', item: 'C1560G' }
];

// ── Court type zone definitions ──
const courtDefs = {
  tennis: {
    label: 'Tennis Court',
    defaultWidth: 60, defaultLength: 120,
    zones: [
      { name: 'Outside Area', sqftPerCourt: null },
      { name: 'Playing Area', sqftPerCourt: 2808 }
    ],
    masktapePerCourt: 8,
    stripingPerNCourts: 2
  },
  pickleball: {
    label: 'Pickleball Court',
    defaultWidth: 30, defaultLength: 60,
    zones: [
      { name: 'Total Area', sqftPerCourt: null },
      { name: 'Service Area', sqftPerCourt: 600 },
      { name: 'Kitchen Area', sqftPerCourt: 280 }
    ],
    masktapePerCourt: 4,
    stripingPerNCourts: 2
  },
  basketballFull: {
    label: 'Basketball Full Court',
    defaultWidth: 50, defaultLength: 84,
    zones: [
      { name: 'Court', sqftPerCourt: 4200 },
      { name: 'Border', sqftPerCourt: null },
      { name: 'Three Point Area', sqftPerCourt: 1224 },
      { name: 'Key', sqftPerCourt: 456 },
      { name: 'Free Throw Circle', sqftPerCourt: 113 },
      { name: 'Center Court Circle', sqftPerCourt: 113 }
    ],
    masktapePerCourt: 8,
    stripingPerNCourts: 2
  },
  basketballHalf: {
    label: 'Basketball Half Court',
    defaultWidth: 50, defaultLength: 47,
    zones: [
      { name: 'Court', sqftPerCourt: 2100 },
      { name: 'Border', sqftPerCourt: null },
      { name: 'Three Point Area', sqftPerCourt: 612 },
      { name: 'Key', sqftPerCourt: 228 },
      { name: 'Free Throw Circle', sqftPerCourt: 57 }
    ],
    masktapePerCourt: 4,
    stripingPerNCourts: 2
  },
  totalArea: {
    label: 'Total Area (Custom)',
    defaultWidth: 50, defaultLength: 64,
    zones: [
      { name: 'Total Area', sqftPerCourt: null }
    ],
    masktapePerCourt: 0,
    stripingPerNCourts: 0
  }
};

// ── Products per zone per court type (Ready-to-Use — RTU only) ──
function getZoneProductsRTU(courtType, zoneName) {
  if (courtType === 'pickleball') {
    return [
      ['PickleMaster RTU', 2]
    ];
  }
  return [
    ['Ready Mix', 2]
  ];
}

// ── Products per zone per court type (Concentrate w/ Sand) ──
function getZoneProductsConcWithSand(courtType, zoneName) {
  if (courtType === 'pickleball') {
    return [
      ['PickleMaster', 2]
    ];
  }
  return [
    ['Neutral Concentrate w/ Sand', 2]
  ];
}

// ── Products per zone per court type (Concentrate) ──
function getZoneProductsConc(courtType, zoneName) {
  if (courtType === 'pickleball') {
    return [
      ['Neutral Concentrate', 2],
      ['PickleMaster', 2]
    ];
  }
  return [
    ['Neutral Concentrate', 2]
  ];
}

// ────────────────────────────────────────────────────────
// CALCULATION ENGINE
// ────────────────────────────────────────────────────────

function getCoverageRate(productName, surfaceType, mixType) {
  const table = (mixType === 'ready' || mixType === 'concWithSand') ? coverageReady : coverageConc;
  const rates = table[productName];
  if (!rates) return 0;
  const idx = { concrete: 0, asphalt: 1, existingConcrete: 2, existingAsphalt: 3 }[surfaceType];
  return rates[idx] || 0;
}

function getItemNumber(productName, packaging, mixType) {
  const table = (mixType === 'ready' || mixType === 'concWithSand') ? itemNumbersReady : itemNumbersConc;
  const base = table[productName];
  if (!base) return '';
  if (base.endsWith('P')) return base;
  const suffix = { 5: 'P', 30: 'K', 55: 'D' }[packaging] || '';
  return base + suffix;
}

function getPackageSize(packaging) {
  return parseInt(packaging, 10);
}

function getPackageLabel(packaging) {
  const size = getPackageSize(packaging);
  if (size === 55) return '55 Gallon Drum(s)';
  if (size === 30) return '30 Gallon Keg(s)';
  return '5 Gallon Pail(s)';
}

function fmtPkg(count, packaging) {
  return count + ' - ' + getPackageLabel(packaging);
}

function calcGallons(coverageRate, areaSqYd, coats) {
  if (!coverageRate || !areaSqYd || !coats) return 0;
  return Math.ceil(coverageRate * areaSqYd * coats);
}

function calcPackages(gallons, packageSize) {
  if (!gallons || !packageSize) return 0;
  return Math.ceil(gallons / packageSize);
}

function getResurfacerSandLbs(packages, packaging) {
  const mult = { 5: 70, 30: 400, 55: 750 }[packaging] || 0;
  return packages * mult;
}

function getColorSandLbs(packages, packaging) {
  const mult = { 5: 35, 30: 200, 55: 400 }[packaging] || 0;
  return packages * mult;
}

// ColorPlus quantity based on zone gallons and packaging split logic
// 5-gal pails:  2 jars per pail  (Ready Mix / RTU: 1 jar per pail)
// 30-gal kegs:  split into 2 × 15 gal — 1 gallon ColorPlus per split
// 55-gal drums: split into 2 × 27.5 gal — 2 gallons ColorPlus per split
function getColorPlusForZone(zoneGallons, packaging, productName) {
  if (!zoneGallons || zoneGallons <= 0) return 0;
  const pkg = parseInt(packaging);
  if (productName === 'Ready Mix' || productName === 'PickleMaster RTU') {
    // Pails only: 1 jar per pail
    return Math.ceil(zoneGallons / 5);
  }
  if (pkg === 5) {
    // 2 jars per 5-gal pail
    const pails = Math.ceil(zoneGallons / 5);
    return pails * 2;
  }
  if (pkg === 30) {
    // 1 gallon ColorPlus per 15-gal split
    const splits = Math.ceil(zoneGallons / 15);
    return splits;
  }
  if (pkg === 55) {
    // 2 gallons ColorPlus per 27.5-gal split
    const splits = Math.ceil(zoneGallons / 27.5);
    return splits * 2;
  }
  return 0;
}

function getColorPlusUnit(packaging, productName) {
  if (parseInt(packaging) === 5 && (productName === 'Ready Mix' || productName === 'PickleMaster RTU')) {
    return '24 OZ Jar(s)';
  }
  if (parseInt(packaging) === 5) {
    return '24 OZ Jar(s)';
  }
  return '1 Gallon Pail(s)';
}

function getColorPlusItemNumber(colorName, packaging, productName) {
  const color = colorOptions.find(c => c.name === colorName);
  if (!color || !color.itemG) return '';
  const usesJars = parseInt(packaging) === 5;
  return usesJars ? color.itemJ : color.itemG;
}

// ── Compute zone areas ──
function computeZoneAreas(courtType, totalSqFt, numCourts) {
  const def = courtDefs[courtType];
  const zones = [];
  for (const zone of def.zones) {
    let areaSqFt;
    if (zone.sqftPerCourt !== null) {
      areaSqFt = Math.ceil(zone.sqftPerCourt * numCourts);
    } else {
      if (courtType === 'tennis') {
        const playingArea = 2808 * numCourts;
        areaSqFt = Math.max(0, totalSqFt - playingArea);
      } else if (courtType === 'basketballFull') {
        const courtArea = 4200 * numCourts;
        areaSqFt = Math.max(0, totalSqFt - courtArea);
      } else if (courtType === 'basketballHalf') {
        const courtArea = 2100 * numCourts;
        areaSqFt = Math.max(0, totalSqFt - courtArea);
      } else {
        areaSqFt = totalSqFt;
      }
    }
    zones.push({ name: zone.name, sqft: areaSqFt, sqyd: areaSqFt / SQFT_PER_SQYD });
  }
  return zones;
}

// ── Per-court-entry calculation ──
function calculateEntry(entry, surfaceType, packaging, mixType) {
  const totalSqFt = getEntrySqFt(entry);
  const totalSqYd = totalSqFt / SQFT_PER_SQYD;
  const pkgSize = getPackageSize(packaging);
  const zoneAreas = computeZoneAreas(entry.courtType, totalSqFt, entry.numCourts);

  // ── First pass: compute raw gallons per zone per product and aggregate totals ──
  const zoneRawData = [];
  const productTotalGallons = {}; // prodName → total gallons across all zones

  zoneAreas.forEach((zone, zi) => {
    if (zone.sqft <= 0) return;
    const colorName = entry.zoneColors[zi] || 'Not Selected';
    const prods = mixType === 'ready'
      ? getZoneProductsRTU(entry.courtType, zone.name)
      : mixType === 'concWithSand'
        ? getZoneProductsConcWithSand(entry.courtType, zone.name)
        : getZoneProductsConc(entry.courtType, zone.name);

    const rawProducts = [];
    for (const [prodName, coats] of prods) {
      if ((prodName === 'Ready Mix' || prodName === 'PickleMaster RTU') && packaging !== '5') continue;
      const rate = getCoverageRate(prodName, surfaceType, mixType);
      const gallons = calcGallons(rate, zone.sqyd, coats);
      rawProducts.push({ prodName, coats, gallons });
      productTotalGallons[prodName] = (productTotalGallons[prodName] || 0) + gallons;
    }
    zoneRawData.push({ zone, zi, colorName, rawProducts });
  });

  // ── Compute total packages per product from aggregated gallons ──
  const productTotalPkgs = {};
  for (const prodName of Object.keys(productTotalGallons)) {
    productTotalPkgs[prodName] = calcPackages(productTotalGallons[prodName], pkgSize);
  }

  const showPerZone = packaging === '5'; // pails: show per-zone; kegs/drums: show totals

  // ── Second pass: build zone results ──
  const zones = [];
  zoneRawData.forEach(({ zone, zi, colorName, rawProducts }) => {
    const zoneResult = { name: zone.name, sqft: zone.sqft, sqyd: zone.sqyd, products: [] };

    for (const { prodName, coats, gallons } of rawProducts) {
      if (showPerZone) {
        // Pails: show packaging + ColorPlus per zone with each zone's own color
        const zonePackages = calcPackages(gallons, pkgSize);
        zoneResult.products.push({
          product: prodName, coats, gallons,
          packaging: fmtPkg(zonePackages, packaging),
          item: getItemNumber(prodName, packaging, mixType)
        });
        if (colorName !== 'Not Selected') {
          const cpCount = getColorPlusForZone(gallons, packaging, prodName);
          const cpUnit = getColorPlusUnit(packaging, prodName);
          const cpItem = getColorPlusItemNumber(colorName, packaging, prodName);
          if (cpCount > 0) {
            zoneResult.products.push({
              product: colorName, coats: '', gallons: '',
              packaging: cpCount + ' - ' + cpUnit, item: cpItem
            });
          }
        }
      } else {
        // Kegs/Drums: show gallons per zone, packaging in total row
        zoneResult.products.push({
          product: prodName, coats, gallons,
          packaging: '',
          item: getItemNumber(prodName, packaging, mixType)
        });
      }
    }
    zones.push(zoneResult);
  });

  // ── Build total packaging summary (only for kegs/drums) ──
  const zoneTotalPackaging = [];
  if (!showPerZone) {
    for (const [prodName, totalGal] of Object.entries(productTotalGallons)) {
      const totalPkgs = productTotalPkgs[prodName];
      zoneTotalPackaging.push({
        product: prodName,
        gallons: totalGal,
        packaging: fmtPkg(totalPkgs, packaging),
        item: getItemNumber(prodName, packaging, mixType)
      });
      // ColorPlus per zone — based on split logic (how many splits each zone fills)
      for (const { zone, colorName, rawProducts } of zoneRawData) {
        if (colorName === 'Not Selected') continue;
        for (const { prodName: pn, gallons } of rawProducts) {
          if (pn !== prodName) continue;
          const cpCount = getColorPlusForZone(gallons, packaging, pn);
          const cpUnit = getColorPlusUnit(packaging, pn);
          const cpItem = getColorPlusItemNumber(colorName, packaging, pn);
          if (cpCount > 0) {
            zoneTotalPackaging.push({
              product: colorName + ' (' + zone.name + ')',
              coats: '', gallons: '',
              packaging: cpCount + ' - ' + cpUnit, item: cpItem
            });
          }
        }
      }
      // Sand for concentrate — aggregated at total level
      if (mixType === 'concentrate' && prodName === 'Neutral Concentrate') {
        const sandLbs = getColorSandLbs(totalPkgs, packaging);
        const sandBags = Math.ceil(sandLbs / 50);
        zoneTotalPackaging.push({
          product: 'Color Sand (80-90 Mesh)',
          gallons: sandLbs + ' lbs',
          packaging: sandBags + ' - 50 lbs. Bags',
          item: 'R1010'
        });
      }
    }
  }

  // Striping
  const striping = [];
  const def = courtDefs[entry.courtType];
  if (def.stripingPerNCourts > 0) {
    const stripingQty = Math.ceil(entry.numCourts / def.stripingPerNCourts);
    striping.push(
      { product: 'Stripe Rite', gallons: stripingQty, packaging: stripingQty + '- 1 Gallon Jug(s)', item: 'C1610G' },
      { product: 'White Line Paint', gallons: stripingQty, packaging: stripingQty + '- 1 Gallon Jug(s)', item: 'C1620G' }
    );
    const tapeRolls = Math.ceil(def.masktapePerCourt * entry.numCourts);
    if (tapeRolls > 0) {
      striping.push({ product: 'Masking Tape (Standard Roll)', gallons: '', packaging: tapeRolls + ' Roll(s)', item: '' });
    }
  }

  return {
    label: def.label,
    courtType: entry.courtType,
    numCourts: entry.numCourts,
    totalSqFt,
    totalSqYd,
    zoneAreas,
    zones,
    zoneTotalPackaging,
    striping
  };
}

// ── Global products (resurfacer + cushion over combined total area) ──
function calculateGlobalProducts(totalCombinedSqFt, surfaceType, packaging, mixType) {
  const totalSqYd = totalCombinedSqFt / SQFT_PER_SQYD;
  const pkgSize = getPackageSize(packaging);

  const totalArea = [];
  const showAdhesion = surfaceType === 'concrete' || surfaceType === 'existingConcrete';
  if (showAdhesion) {
    const adhRate = getCoverageRate('Acrylic Adhesion Promoter', surfaceType, mixType);
    const adhGallons = calcGallons(adhRate, totalSqYd, 1);
    const adhPkgSize = getPackageSize('5');
    const adhPackages = calcPackages(adhGallons, adhPkgSize);
    totalArea.push({
      product: 'Acrylic Adhesion Promoter', coats: 1, gallons: adhGallons,
      packaging: fmtPkg(adhPackages, '5'),
      item: 'C1650P'
    });
  }

  if (mixType === 'ready' || mixType === 'concWithSand') {
    const name = 'Acrylic Resurfacer w/ Sand';
    const rate = getCoverageRate(name, surfaceType, 'ready');
    const coats = surfaceType === 'asphalt' ? 2 : 1;
    const gallons = calcGallons(rate, totalSqYd, coats);
    const packages = calcPackages(gallons, pkgSize);
    totalArea.push({
      product: name, coats, gallons,
      packaging: fmtPkg(packages, packaging),
      item: getItemNumber(name, packaging, 'ready')
    });
  } else {
    const name = 'Acrylic Resurfacer';
    const rate = getCoverageRate(name, surfaceType, 'concentrate');
    const coats = surfaceType === 'asphalt' ? 2 : 1;
    const gallons = calcGallons(rate, totalSqYd, coats);
    const packages = calcPackages(gallons, pkgSize);
    totalArea.push({
      product: name, coats, gallons,
      packaging: fmtPkg(packages, packaging),
      item: getItemNumber(name, packaging, 'concentrate')
    });
    const sandLbs = getResurfacerSandLbs(packages, packaging);
    const sandBags = Math.ceil(sandLbs / 50);
    totalArea.push({
      product: 'Resurfacer Sand (50-60 Mesh)', coats: '', gallons: sandLbs + ' lbs',
      packaging: sandBags + ' - 50 lbs. Bags', item: 'R1020'
    });
  }

  // Cushion
  const cushion = [];
  const cushionProducts = [
    { system: 'Standard System', items: [
      { product: 'CushionMaster II (Coarse Rubber)', coats: 3 },
      { product: 'CushionMaster I (Fine Rubber)', coats: 2 }
    ]},
    { system: 'Premium System', items: [
      { product: 'CushionMaster II (Coarse Rubber)', coats: 5 },
      { product: 'CushionMaster I (Fine Rubber)', coats: 2 }
    ]}
  ];
  for (const sys of cushionProducts) {
    const sysResult = { system: sys.system, items: [] };
    for (const item of sys.items) {
      const rate = getCoverageRate(item.product, surfaceType, mixType);
      const gallons = calcGallons(rate, totalSqYd, item.coats);
      const packages = calcPackages(gallons, pkgSize);
      sysResult.items.push({
        product: item.product, coats: item.coats, gallons,
        packaging: fmtPkg(packages, packaging),
        item: getItemNumber(item.product, packaging, mixType)
      });
    }
    cushion.push(sysResult);
  }

  return { totalArea, cushion };
}


// ────────────────────────────────────────────────────────
// SVG COURT PREVIEWS
// ────────────────────────────────────────────────────────

function getColorHex(colorName) {
  return colorHexMap[colorName] || '#d5d5d5';
}

function renderCourtPreview(courtType, zoneColors) {
  const colors = zoneColors.map(c => getColorHex(c));
  switch (courtType) {
    case 'tennis': return renderTennisPreview(colors);
    case 'pickleball': return renderPickleballPreview(colors);
    case 'basketballFull': return renderBasketballFullPreview(colors);
    case 'basketballHalf': return renderBasketballHalfPreview(colors);
    default: return renderTotalAreaPreview(colors);
  }
}

function renderTennisPreview(c) {
  // c[0] = Outside Area, c[1] = Playing Area
  // Standard: 120x60 total (21ft run-back + 12ft run-side), 78x36 playing surface
  const out = c[0] || '#d5d5d5';
  const play = c[1] || '#d5d5d5';
  return `<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" class="court-svg">
    <rect x="0" y="0" width="300" height="150" fill="${out}" rx="3"/>
    <rect x="52.5" y="30" width="195" height="90" fill="${play}"/>
    <rect x="52.5" y="30" width="195" height="90" fill="none" stroke="#fff" stroke-width="2"/>
    <line x1="52.5" y1="41" x2="247.5" y2="41" stroke="#fff" stroke-width="1"/>
    <line x1="52.5" y1="109" x2="247.5" y2="109" stroke="#fff" stroke-width="1"/>
    <line x1="150" y1="27" x2="150" y2="123" stroke="#fff" stroke-width="1.5" stroke-dasharray="4,3"/>
    <line x1="97.5" y1="41" x2="97.5" y2="109" stroke="#fff" stroke-width="1.5"/>
    <line x1="202.5" y1="41" x2="202.5" y2="109" stroke="#fff" stroke-width="1.5"/>
    <line x1="97.5" y1="75" x2="202.5" y2="75" stroke="#fff" stroke-width="1.5"/>
    <line x1="52.5" y1="75" x2="56" y2="75" stroke="#fff" stroke-width="1.5"/>
    <line x1="244" y1="75" x2="247.5" y2="75" stroke="#fff" stroke-width="1.5"/>
  </svg>`;
}

function renderPickleballPreview(c) {
  // c[0] = Total Area, c[1] = Service Area, c[2] = Kitchen Area
  // Real proportions: 44ft long x 20ft wide (15+7+7+15), horizontal orientation
  const total = c[0] || '#d5d5d5';
  const service = c[1] || '#d5d5d5';
  const kitchen = c[2] || '#d5d5d5';
  return `<svg viewBox="0 0 300 160" xmlns="http://www.w3.org/2000/svg" class="court-svg">
    <rect x="0" y="0" width="300" height="160" fill="${total}" rx="3"/>
    <rect x="30" y="25" width="82" height="110" fill="${service}"/>
    <rect x="188" y="25" width="82" height="110" fill="${service}"/>
    <rect x="112" y="25" width="76" height="110" fill="${kitchen}"/>
    <rect x="30" y="25" width="240" height="110" fill="none" stroke="#fff" stroke-width="2"/>
    <line x1="112" y1="25" x2="112" y2="135" stroke="#fff" stroke-width="1.5"/>
    <line x1="188" y1="25" x2="188" y2="135" stroke="#fff" stroke-width="1.5"/>
    <line x1="150" y1="25" x2="150" y2="135" stroke="#fff" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="30" y1="80" x2="112" y2="80" stroke="#fff" stroke-width="1.5"/>
    <line x1="188" y1="80" x2="270" y2="80" stroke="#fff" stroke-width="1.5"/>
  </svg>`;
}

function renderBasketballFullPreview(c) {
  // c[0]=Court, c[1]=Border, c[2]=Three Point, c[3]=Key, c[4]=FT Circle, c[5]=Center Circle
  const court  = c[0] || '#d5d5d5';
  const border = c[1] || '#d5d5d5';
  const three  = c[2] || '#d5d5d5';
  const key    = c[3] || '#d5d5d5';
  const ft     = c[4] || '#d5d5d5';
  const center = c[5] || '#d5d5d5';
  return `<svg viewBox="0 0 340 200" xmlns="http://www.w3.org/2000/svg" class="court-svg">
    <rect x="0" y="0" width="340" height="200" fill="${border}" rx="3"/>
    <rect x="25" y="15" width="290" height="170" fill="${court}"/>
    <rect x="25" y="15" width="290" height="170" fill="none" stroke="#fff" stroke-width="2"/>
    <line x1="170" y1="15" x2="170" y2="185" stroke="#fff" stroke-width="1.5"/>
    <path d="M 25,30 L 58,30 A 58,70 0 0,1 58,170 L 25,170 Z" fill="${three}" stroke="#fff" stroke-width="1.5"/>
    <path d="M 315,30 L 282,30 A 58,70 0 0,0 282,170 L 315,170 Z" fill="${three}" stroke="#fff" stroke-width="1.5"/>
    <rect x="25" y="62" width="55" height="76" fill="${key}" stroke="#fff" stroke-width="1.5"/>
    <rect x="260" y="62" width="55" height="76" fill="${key}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="80" cy="100" r="18" fill="${ft}" stroke="#fff" stroke-width="1.5"/>
    <line x1="80" y1="62" x2="80" y2="138" stroke="#fff" stroke-width="1.5"/>
    <circle cx="260" cy="100" r="18" fill="${ft}" stroke="#fff" stroke-width="1.5"/>
    <line x1="260" y1="62" x2="260" y2="138" stroke="#fff" stroke-width="1.5"/>
    <circle cx="170" cy="100" r="18" fill="${center}" stroke="#fff" stroke-width="1.5"/>
    <line x1="33" y1="92" x2="33" y2="108" stroke="#fff" stroke-width="2"/>
    <circle cx="38" cy="100" r="4" fill="none" stroke="#fff" stroke-width="1.2"/>
    <line x1="307" y1="92" x2="307" y2="108" stroke="#fff" stroke-width="2"/>
    <circle cx="302" cy="100" r="4" fill="none" stroke="#fff" stroke-width="1.2"/>
  </svg>`;
}

function renderBasketballHalfPreview(c) {
  // c[0]=Court, c[1]=Border, c[2]=Three Point, c[3]=Key, c[4]=FT Circle
  const court  = c[0] || '#d5d5d5';
  const border = c[1] || '#d5d5d5';
  const three  = c[2] || '#d5d5d5';
  const key    = c[3] || '#d5d5d5';
  const ft     = c[4] || '#d5d5d5';
  return `<svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg" class="court-svg">
    <rect x="0" y="0" width="220" height="200" fill="${border}" rx="3"/>
    <rect x="15" y="15" width="190" height="170" fill="${court}"/>
    <rect x="15" y="15" width="190" height="170" fill="none" stroke="#fff" stroke-width="2"/>
    <path d="M 15,30 L 48,30 A 58,70 0 0,1 48,170 L 15,170 Z" fill="${three}" stroke="#fff" stroke-width="1.5"/>
    <rect x="15" y="62" width="55" height="76" fill="${key}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="70" cy="100" r="18" fill="${ft}" stroke="#fff" stroke-width="1.5"/>
    <line x1="70" y1="62" x2="70" y2="138" stroke="#fff" stroke-width="1.5"/>
    <line x1="205" y1="15" x2="205" y2="185" stroke="#fff" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="23" y1="92" x2="23" y2="108" stroke="#fff" stroke-width="2"/>
    <circle cx="28" cy="100" r="4" fill="none" stroke="#fff" stroke-width="1.2"/>
  </svg>`;
}

function renderTotalAreaPreview(c) {
  const total = c[0] || '#d5d5d5';
  return `<svg viewBox="0 0 260 180" xmlns="http://www.w3.org/2000/svg" class="court-svg">
    <rect x="0" y="0" width="260" height="180" fill="${total}" rx="3"/>
    <rect x="10" y="10" width="240" height="160" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6,4"/>
  </svg>`;
}


// ────────────────────────────────────────────────────────
// UI STATE & RENDERING
// ────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

let courtEntries = [];
let nextEntryId = 1;

function createEntry(courtType) {
  courtType = courtType || 'tennis';
  const def = courtDefs[courtType];
  return {
    id: nextEntryId++,
    courtType,
    numCourts: 1,
    areaInputMode: 'wxl',    // 'wxl' | 'sqft' | 'sqyd' | 'sqm'
    width: def.defaultWidth,
    length: def.defaultLength,
    areaValue: def.defaultWidth * def.defaultLength,  // direct-entry area (in chosen unit)
    packaging: '5',
    mixType: 'ready',
    cushionSystem: 'none',
    crackFiller: false,
    crackFillerType: 'Acrylic Crack Patch',
    crackLinearFeet: 0,
    zoneColors: def.zones.map((z, i) => i === 0 ? 'Light Blue ColorPlus' : 'Blue ColorPlus')
  };
}

function readEntryFromDOM(entry) {
  const el = document.querySelector(`[data-entry-id="${entry.id}"]`);
  if (!el) return entry;
  entry.courtType = el.querySelector('.entry-court-type').value;
  entry.numCourts = Math.max(1, parseInt(el.querySelector('.entry-num-courts').value, 10) || 1);
  entry.areaInputMode = el.querySelector('.entry-area-mode').value;
  if (entry.areaInputMode === 'wxl') {
    entry.width = parseFloat(el.querySelector('.entry-width').value) || 0;
    entry.length = parseFloat(el.querySelector('.entry-length').value) || 0;
  } else {
    entry.areaValue = parseFloat(el.querySelector('.entry-area-value').value) || 0;
  }
  entry.packaging = el.querySelector('.entry-packaging').value;
  entry.mixType = el.querySelector('.entry-mix-type').value;
  entry.cushionSystem = el.querySelector('.entry-cushion').value;
  entry.crackFiller = el.querySelector('.entry-crack-filler').checked;
  entry.crackLinearFeet = parseFloat(el.querySelector('.entry-crack-feet').value) || 0;
  const colorSels = el.querySelectorAll('.entry-zone-color');
  entry.zoneColors = Array.from(colorSels).map(s => s.value);
  return entry;
}

// Convert entry dimensions to total square feet regardless of input mode
function getEntrySqFt(entry) {
  if (entry.areaInputMode === 'wxl') {
    return entry.width * entry.length;
  } else if (entry.areaInputMode === 'sqft') {
    return entry.areaValue;
  } else if (entry.areaInputMode === 'sqyd') {
    return entry.areaValue * SQFT_PER_SQYD;
  } else if (entry.areaInputMode === 'sqm') {
    return entry.areaValue * SQFT_PER_SQM;
  }
  return 0;
}

// Return total area in the user's selected unit for display
function getEntryDisplayArea(entry) {
  const sqft = getEntrySqFt(entry);
  if (entry.areaInputMode === 'sqyd') return sqft / SQFT_PER_SQYD;
  if (entry.areaInputMode === 'sqm') return sqft / SQFT_PER_SQM;
  return sqft; // wxl and sqft both display as sq ft
}

function fmt(n) {
  if (typeof n !== 'number' || isNaN(n)) return n;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);
}

function buildColorOptions(selectedValue) {
  return colorOptions.map(c =>
    `<option value="${c.name}"${c.name === selectedValue ? ' selected' : ''}>${c.name}</option>`
  ).join('');
}

function buildCourtTypeOptions(selectedValue) {
  return Object.entries(courtDefs).map(([key, def]) =>
    `<option value="${key}"${key === selectedValue ? ' selected' : ''}>${def.label}</option>`
  ).join('');
}

// ── Render all court entry cards ──
function renderCourtEntries() {
  const container = $('courtEntriesContainer');
  container.innerHTML = '';

  courtEntries.forEach(entry => {
    const def = courtDefs[entry.courtType];
    const card = document.createElement('div');
    card.className = 'court-entry-card';
    card.dataset.entryId = entry.id;

    const showCourtsField = entry.courtType !== 'totalArea';

    let zoneColorsHtml = def.zones.map((zone, i) => {
      const val = entry.zoneColors[i] || 'Not Selected';
      return `<label>
        <span>${zone.name} Color</span>
        <select class="entry-zone-color" data-zone="${i}">${buildColorOptions(val)}</select>
      </label>`;
    }).join('');

    card.innerHTML = `
      <div class="entry-header">
        <h3>${def.label}</h3>
        ${courtEntries.length > 1 ? `<button class="btn-remove" data-remove="${entry.id}">Remove</button>` : ''}
      </div>
      <div class="entry-body">
        <div class="entry-fields">
          <div class="form-row">
            <label>
              <span>Court Type</span>
              <select class="entry-court-type">${buildCourtTypeOptions(entry.courtType)}</select>
            </label>
            <label ${showCourtsField ? '' : 'class="hidden"'}>
              <span>Number of Courts</span>
              <input class="entry-num-courts input-highlight" type="number" min="1" step="1" value="${entry.numCourts}" />
            </label>
            <label>
              <span>Packaging</span>
              <select class="entry-packaging"${entry.mixType === 'ready' ? ' disabled' : ''}>
                <option value="55"${entry.packaging === '55' ? ' selected' : ''}>55 Gallon Drums</option>
                <option value="30"${entry.packaging === '30' ? ' selected' : ''}>30 Gallon Kegs</option>
                <option value="5"${entry.packaging === '5' ? ' selected' : ''}>5 Gallon Pails</option>
              </select>
            </label>
            <label>
              <span>Mix Type</span>
              <select class="entry-mix-type">
                <option value="ready"${entry.mixType === 'ready' ? ' selected' : ''}>Ready-to-Use</option>
                <option value="concWithSand"${entry.mixType === 'concWithSand' ? ' selected' : ''}>Concentrate w/ Sand</option>
                <option value="concentrate"${entry.mixType === 'concentrate' ? ' selected' : ''}>Concentrate</option>
              </select>
            </label>
            <label>
              <span>ProCushion</span>
              <select class="entry-cushion">
                <option value="none"${entry.cushionSystem === 'none' ? ' selected' : ''}>None</option>
                <option value="standard"${entry.cushionSystem === 'standard' ? ' selected' : ''}>Standard System</option>
                <option value="premium"${entry.cushionSystem === 'premium' ? ' selected' : ''}>Premium System</option>
              </select>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" class="entry-crack-filler"${entry.crackFiller ? ' checked' : ''}>
              <span>Crack Filler</span>
            </label>
          </div>
          <div class="form-row entry-crack-section${entry.crackFiller ? '' : ' hidden'}">
            <label>
              <span>Linear Feet of Cracks</span>
              <input class="entry-crack-feet" type="number" min="0" step="1" value="${entry.crackLinearFeet}" />
            </label>
          </div>
          <div class="form-row">
            <label>
              <span>Area Input</span>
              <select class="entry-area-mode">
                <option value="wxl"${entry.areaInputMode === 'wxl' ? ' selected' : ''}>Width x Length (ft)</option>
                <option value="sqft"${entry.areaInputMode === 'sqft' ? ' selected' : ''}>Square Feet</option>
                <option value="sqyd"${entry.areaInputMode === 'sqyd' ? ' selected' : ''}>Square Yards</option>
                <option value="sqm"${entry.areaInputMode === 'sqm' ? ' selected' : ''}>Square Meters</option>
              </select>
            </label>
            <label class="entry-wxl-field${entry.areaInputMode !== 'wxl' ? ' hidden' : ''}">
              <span>Width (Feet)</span>
              <input class="entry-width input-highlight" type="number" min="0" step="0.1" value="${entry.width}" />
            </label>
            <label class="entry-wxl-field${entry.areaInputMode !== 'wxl' ? ' hidden' : ''}">
              <span>Length (Feet)</span>
              <input class="entry-length input-highlight" type="number" min="0" step="0.1" value="${entry.length}" />
            </label>
            <label class="entry-direct-field${entry.areaInputMode === 'wxl' ? ' hidden' : ''}">
              <span>${{sqft:'Square Feet',sqyd:'Square Yards',sqm:'Square Meters'}[entry.areaInputMode] || 'Area'}</span>
              <input class="entry-area-value input-highlight" type="number" min="0" step="0.1" value="${entry.areaValue}" />
            </label>
          </div>
          <div class="form-row">${zoneColorsHtml}</div>
        </div>
        <div class="entry-preview">
          <div class="preview-label">Color Preview</div>
          <div class="preview-svg">${renderCourtPreview(entry.courtType, entry.zoneColors)}</div>
          <div class="preview-legend">${renderLegend(def.zones, entry.zoneColors)}</div>
        </div>
      </div>
    `;

    container.appendChild(card);

    // Event: court type change → update entry defaults + re-render
    card.querySelector('.entry-court-type').addEventListener('change', (e) => {
      const newType = e.target.value;
      const newDef = courtDefs[newType];
      entry.courtType = newType;
      entry.width = newDef.defaultWidth;
      entry.length = newDef.defaultLength;
      entry.areaValue = newDef.defaultWidth * newDef.defaultLength;
      entry.numCourts = newType === 'totalArea' ? 1 : entry.numCourts;
      entry.zoneColors = newDef.zones.map((z, i) => i === 0 ? 'Light Blue ColorPlus' : 'Blue ColorPlus');
      renderCourtEntries();
      renderResults();
    });

    // Event: remove button
    const removeBtn = card.querySelector('.btn-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        courtEntries = courtEntries.filter(e => e.id !== entry.id);
        renderCourtEntries();
        renderResults();
      });
    }

    // Events: field changes → update preview + results
    const onFieldChange = () => {
      readEntryFromDOM(entry);
      // Update preview inline (fast)
      const previewDiv = card.querySelector('.preview-svg');
      const legendDiv = card.querySelector('.preview-legend');
      const currentDef = courtDefs[entry.courtType];
      previewDiv.innerHTML = renderCourtPreview(entry.courtType, entry.zoneColors);
      legendDiv.innerHTML = renderLegend(currentDef.zones, entry.zoneColors);
      renderResults();
    };

    card.querySelectorAll('input, select').forEach(el => {
      if (!el.classList.contains('entry-court-type') && !el.classList.contains('entry-area-mode')) {
        el.addEventListener('input', onFieldChange);
        el.addEventListener('change', onFieldChange);
      }
    });

    // Event: area input mode change → show/hide W×L vs direct area fields
    card.querySelector('.entry-area-mode').addEventListener('change', () => {
      entry.areaInputMode = card.querySelector('.entry-area-mode').value;
      // When switching modes, convert current area to new unit as default
      const currentSqFt = getEntrySqFt(entry);
      if (entry.areaInputMode === 'wxl') {
        // Keep existing width/length or approximate from area
        if (!entry.width || !entry.length) {
          entry.width = Math.round(Math.sqrt(currentSqFt));
          entry.length = entry.width > 0 ? Math.round(currentSqFt / entry.width) : 0;
        }
      } else if (entry.areaInputMode === 'sqft') {
        entry.areaValue = Math.round(currentSqFt * 100) / 100;
      } else if (entry.areaInputMode === 'sqyd') {
        entry.areaValue = Math.round((currentSqFt / SQFT_PER_SQYD) * 100) / 100;
      } else if (entry.areaInputMode === 'sqm') {
        entry.areaValue = Math.round((currentSqFt / SQFT_PER_SQM) * 100) / 100;
      }
      renderCourtEntries();
      renderResults();
    });

    // Event: mix type change → lock/unlock packaging
    card.querySelector('.entry-mix-type').addEventListener('change', () => {
      const pkgSel = card.querySelector('.entry-packaging');
      if (entry.mixType === 'ready') {
        pkgSel.value = '5';
        pkgSel.disabled = true;
        entry.packaging = '5';
      } else {
        pkgSel.disabled = false;
      }
      renderResults();
    });

    // Event: crack filler checkbox → show/hide linear feet input
    card.querySelector('.entry-crack-filler').addEventListener('change', () => {
      card.querySelector('.entry-crack-section').classList.toggle('hidden', !entry.crackFiller);
      renderResults();
    });
  });
}

function renderLegend(zones, zoneColors) {
  return zones.map((zone, i) => {
    const colorName = zoneColors[i] || 'Not Selected';
    const hex = getColorHex(colorName);
    return `<span class="legend-item"><i class="legend-swatch" style="background:${hex}"></i>${zone.name}</span>`;
  }).join('');
}

// ── Render calculation results ──
function renderResults() {
  // Read global settings
  const surfaceType = $('surfaceType').value;

  // Calculate per-entry (each entry carries its own packaging + mixType)
  const entryResults = courtEntries.map(entry => {
    const result = calculateEntry(entry, surfaceType, entry.packaging, entry.mixType);
    result.packaging = entry.packaging;
    result.mixType = entry.mixType;
    result.cushionSystem = entry.cushionSystem;
    result.crackFiller = entry.crackFiller;
    result.crackFillerType = entry.crackFillerType;
    result.crackLinearFeet = entry.crackLinearFeet;
    return result;
  });

  // Combined total area
  const totalCombinedSqFt = entryResults.reduce((sum, r) => sum + r.totalSqFt, 0);
  const totalCombinedSqYd = totalCombinedSqFt / SQFT_PER_SQYD;
  const totalCombinedSqM = totalCombinedSqFt / SQFT_PER_SQM;

  // Global products (resurfacer, cushion) — calculated per entry with its own mixType
  const allTotalArea = [];
  const allCushion = [];
  entryResults.forEach((r, ri) => {
    const g = calculateGlobalProducts(r.totalSqFt, surfaceType, r.packaging, r.mixType);
    const courtLabel = entryResults.length > 1 ? (r.label + ' (Court ' + (ri + 1) + ')') : r.label;
    allTotalArea.push({ label: courtLabel, items: g.totalArea });
    allCushion.push({ label: courtLabel, cushionSystem: r.cushionSystem, cushion: g.cushion });
  });

  // Summary
  const courtSummary = courtEntries.map(e => {
    const def = courtDefs[e.courtType];
    return e.numCourts + ' ' + def.label + (e.numCourts > 1 ? 's' : '');
  }).join(', ');

  $('summaryGrid').innerHTML = `
    <article class="summary-item"><span class="label">Courts</span><span class="value">${courtSummary}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq ft)</span><span class="value">${fmt(totalCombinedSqFt)}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq yd)</span><span class="value">${fmt(totalCombinedSqYd)}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq m)</span><span class="value">${fmt(totalCombinedSqM)}</span></article>
  `;

  // Zone area breakdown
  let zoneAreaHtml = '';
  entryResults.forEach((r, ri) => {
    const courtLabel = entryResults.length > 1 ? (r.label + ' (Court ' + (ri + 1) + ')') : r.label;
    r.zoneAreas.forEach(z => {
      zoneAreaHtml += `<tr><td>${courtLabel}</td><td>${z.name}</td><td>${fmt(z.sqft)}</td><td>${fmt(z.sqyd)}</td></tr>`;
    });
  });
  $('zoneAreasBody').innerHTML = zoneAreaHtml || '<tr><td colspan="4">Add courts above</td></tr>';

  // Total area materials (per entry)
  let totalAreaHtml = '';
  allTotalArea.forEach(g => {
    if (allTotalArea.length > 1) {
      totalAreaHtml += `<tr class="zone-header"><td colspan="5">${g.label}</td></tr>`;
    }
    for (const r of g.items) {
      totalAreaHtml += `<tr><td>${r.product}</td><td>${r.coats}</td><td>${r.gallons}</td><td>${r.packaging}</td><td>${r.item}</td></tr>`;
    }
  });
  $('totalAreaBody').innerHTML = totalAreaHtml;

  // Per-entry zone products (individual per court)
  let zoneHtml = '';
  entryResults.forEach((r, ri) => {
    const courtLabel = entryResults.length > 1
      ? (r.label + ' (Court ' + (ri + 1) + ') &mdash; ' + r.numCourts + ' court' + (r.numCourts > 1 ? 's' : '') + ' &mdash; ' + fmt(r.totalSqFt) + ' sq ft')
      : (r.label + ' (' + r.numCourts + ') &mdash; ' + fmt(r.totalSqFt) + ' sq ft');
    zoneHtml += `<tr class="zone-header"><td colspan="5">${courtLabel}</td></tr>`;
    for (const zone of r.zones) {
      if (zone.products.length === 0) continue;
      zoneHtml += `<tr class="zone-subheader"><td colspan="5">${zone.name} (${fmt(zone.sqft)} sq ft)</td></tr>`;
      for (const p of zone.products) {
        zoneHtml += `<tr><td>${p.product}</td><td>${p.coats}</td><td>${typeof p.gallons === 'number' ? fmt(p.gallons) : p.gallons}</td><td>${p.packaging}</td><td>${p.item}</td></tr>`;
      }
    }
    // Total packaging row — aggregated across all zones for this court
    if (r.zoneTotalPackaging && r.zoneTotalPackaging.length > 0) {
      zoneHtml += `<tr class="total-packaging-header"><td colspan="5">Total Packaging Needed</td></tr>`;
      for (const t of r.zoneTotalPackaging) {
        zoneHtml += `<tr><td>${t.product}</td><td></td><td>${typeof t.gallons === 'number' ? fmt(t.gallons) : t.gallons}</td><td>${t.packaging}</td><td>${t.item}</td></tr>`;
      }
    }
  });
  $('zoneProductsBody').innerHTML = zoneHtml || '<tr><td colspan="5">No zone products</td></tr>';

  // ProCushion — per entry cushion system
  let cushionHtml = '';
  let anyCushion = false;
  allCushion.forEach(g => {
    if (g.cushionSystem === 'none') return;
    anyCushion = true;
    const selectedLabel = g.cushionSystem === 'standard' ? 'Standard System' : 'Premium System';
    const selected = g.cushion.find(s => s.system === selectedLabel);
    if (selected) {
      cushionHtml += `<tr class="zone-header"><td colspan="5">${g.label} — ${selectedLabel}</td></tr>`;
      for (const item of selected.items) {
        cushionHtml += `<tr><td>${item.product}</td><td>${item.coats}</td><td>${item.gallons}</td><td>${item.packaging}</td><td>${item.item}</td></tr>`;
      }
    }
  });
  $('cushionBody').innerHTML = cushionHtml;
  $('proCushionSection').classList.toggle('hidden', !anyCushion);

  // Striping (grouped by court entry)
  let stripingHtml = '';
  let anyStriping = false;
  entryResults.forEach((r, ri) => {
    if (r.striping.length === 0) return;
    anyStriping = true;
    const courtLabel = entryResults.length > 1 ? (r.label + ' (Court ' + (ri + 1) + ')') : r.label;
    stripingHtml += `<tr class="zone-header"><td colspan="4">${courtLabel}</td></tr>`;
    for (const s of r.striping) {
      stripingHtml += `<tr><td>${s.product}</td><td>${s.gallons}</td><td>${s.packaging}</td><td>${s.item}</td></tr>`;
    }
  });
  if (anyStriping) {
    $('stripingBody').innerHTML = stripingHtml;
  } else {
    $('stripingBody').innerHTML = '<tr><td colspan="4">N/A for this court type</td></tr>';
  }

  // Crack filler estimates
  renderCrackFillers(entryResults);
}

function renderCrackFillers(entryResults) {
  const crackEntries = entryResults.filter(r => r.crackFiller && r.crackLinearFeet > 0);
  const anyCrack = crackEntries.length > 0;
  $('crackFillerSection').classList.toggle('hidden', !anyCrack);
  if (!anyCrack) { $('crackBody').innerHTML = ''; return; }

  let html = '';
  crackEntries.forEach((r, ri) => {
    const radioName = 'crackSelect_' + ri;
    const selected = r.crackFillerType || crackFillers[0].product;
    crackFillers.forEach((f, fi) => {
      const gallons = Math.ceil(r.crackLinearFeet / f.rateMin);
      const estimate = gallons + ' gallon' + (gallons !== 1 ? 's' : '');
      const packaging = gallons + '- 1 Gallon Jug(s)';
      const checked = f.product === selected ? ' checked' : '';
      html += `<tr>`;
      html += `<td><input type="radio" name="${radioName}" value="${f.product}" data-entry-idx="${ri}"${checked}></td>`;
      html += fi === 0 ? `<td rowspan="${crackFillers.length}">${r.label}<br><small>${r.crackLinearFeet} linear ft</small></td>` : '';
      html += `<td>${f.product}</td><td>${f.rateLabel}</td><td>${f.width}</td><td>${estimate}</td><td>${packaging}</td><td>${f.item}</td></tr>`;
    });
  });
  $('crackBody').innerHTML = html;

  // Wire up radio button changes
  const crackIndexMap = {};
  let idx = 0;
  courtEntries.forEach(e => {
    if (e.crackFiller && e.crackLinearFeet > 0) {
      crackIndexMap[idx] = e;
      idx++;
    }
  });
  $('crackBody').querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const entryIdx = parseInt(radio.dataset.entryIdx, 10);
      const entry = crackIndexMap[entryIdx];
      if (entry) entry.crackFillerType = radio.value;
    });
  });
}

// ── Initialize ──
function init() {
  // Start with one tennis court entry
  courtEntries.push(createEntry('tennis'));
  renderCourtEntries();
  $('noteText').textContent = 'Make sure to check Industry Standard Courts for proper dimensions and follow ASBA for Overrun requirements.';
  renderResults();

  // Add Court button
  $('addCourtBtn').addEventListener('click', () => {
    courtEntries.push(createEntry('tennis'));
    renderCourtEntries();
    renderResults();
  });

  // Global settings change → recalculate
  $('surfaceType').addEventListener('change', renderResults);
}

// ────────────────────────────────────────────────────────
// PRINT / DOWNLOAD PDF — consolidated materials list
// ────────────────────────────────────────────────────────

function collectAllMaterials() {
  const surfaceType = $('surfaceType').value;
  const materials = {};  // key: product name → { product, coats, gallons, packaging, item }

  function addMaterial(product, coats, gallons, packaging, item) {
    // Skip empty or header-only rows
    if (!product) return;
    const key = product + '||' + item;
    if (materials[key]) {
      if (typeof gallons === 'number' && typeof materials[key].gallons === 'number') {
        materials[key].gallons += gallons;
      }
    } else {
      materials[key] = { product, coats, gallons, packaging, item };
    }
  }

  const entryResults = courtEntries.map(entry => {
    const result = calculateEntry(entry, surfaceType, entry.packaging, entry.mixType);
    result.packaging = entry.packaging;
    result.mixType = entry.mixType;
    result.cushionSystem = entry.cushionSystem;
    result.crackFiller = entry.crackFiller;
    result.crackFillerType = entry.crackFillerType;
    result.crackLinearFeet = entry.crackLinearFeet;
    return result;
  });

  // Total area materials (resurfacer)
  entryResults.forEach(r => {
    const g = calculateGlobalProducts(r.totalSqFt, surfaceType, r.packaging, r.mixType);
    for (const item of g.totalArea) {
      addMaterial(item.product, item.coats, item.gallons, item.packaging, item.item);
    }
    // Cushion
    if (r.cushionSystem !== 'none') {
      const selectedLabel = r.cushionSystem === 'standard' ? 'Standard System' : 'Premium System';
      const selected = g.cushion.find(s => s.system === selectedLabel);
      if (selected) {
        for (const item of selected.items) {
          addMaterial(item.product, item.coats, item.gallons, item.packaging, item.item);
        }
      }
    }
  });

  // Zone products — use aggregated total packaging for base products, per-zone for ColorPlus
  entryResults.forEach(r => {
    // Add per-zone ColorPlus (non-base products with packaging)
    for (const zone of r.zones) {
      for (const p of zone.products) {
        if (p.packaging) {
          addMaterial(p.product, p.coats, p.gallons, p.packaging, p.item);
        }
      }
    }
    // Add aggregated base product totals
    if (r.zoneTotalPackaging) {
      for (const t of r.zoneTotalPackaging) {
        addMaterial(t.product, '', t.gallons, t.packaging, t.item);
      }
    }
  });

  // Striping
  entryResults.forEach(r => {
    for (const s of r.striping) {
      addMaterial(s.product, '', s.gallons, s.packaging, s.item);
    }
  });

  // Crack filler — only the selected product
  entryResults.forEach(r => {
    if (r.crackFiller && r.crackLinearFeet > 0) {
      const f = crackFillers.find(cf => cf.product === r.crackFillerType) || crackFillers[0];
      const gallons = Math.ceil(r.crackLinearFeet / f.rateMin);
      addMaterial(f.product, '', gallons, gallons + '- 1 Gallon Jug(s)', f.item);
    }
  });

  return { materials: Object.values(materials), entryResults };
}

function printMaterialsList() {
  const surfaceType = $('surfaceType').value;
  const surfaceLabel = { concrete: 'New Concrete', asphalt: 'New Asphalt', existingConcrete: 'Existing Concrete', existingAsphalt: 'Existing Asphalt' }[surfaceType];
  const { materials, entryResults } = collectAllMaterials();

  const totalSqFt = entryResults.reduce((sum, r) => sum + r.totalSqFt, 0);
  const courtSummary = courtEntries.map(e => {
    const def = courtDefs[e.courtType];
    return e.numCourts + ' ' + def.label + (e.numCourts > 1 ? 's' : '');
  }).join(', ');

  let tableRows = '';
  materials.forEach(m => {
    tableRows += '<tr>';
    tableRows += '<td>' + m.product + '</td>';
    tableRows += '<td>' + (m.coats || '') + '</td>';
    tableRows += '<td>' + (typeof m.gallons === 'number' ? fmt(m.gallons) : (m.gallons || '')) + '</td>';
    tableRows += '<td>' + (m.packaging || '') + '</td>';
    tableRows += '<td>' + (m.item || '') + '</td>';
    tableRows += '</tr>';
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SportMaster Materials List</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #2c3e50; padding: 32px; }
    h1 { font-size: 1.4rem; color: #1a5276; margin-bottom: 4px; }
    .subtitle { font-size: 0.9rem; color: #5d6d7e; margin-bottom: 20px; }
    .info { font-size: 0.85rem; color: #2c3e50; margin-bottom: 16px; }
    .info strong { color: #1a5276; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 12px; }
    th { background: #1a5276; color: #fff; padding: 8px 10px; text-align: left; font-size: 0.78rem; text-transform: uppercase; }
    td { padding: 7px 10px; border-bottom: 1px solid #d5dbdb; }
    tr:nth-child(even) { background: #f7f9fb; }
    .footer { margin-top: 24px; font-size: 0.75rem; color: #5d6d7e; border-top: 1px solid #d5dbdb; padding-top: 12px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>SportMaster — Total Materials Needed</h1>
  <p class="subtitle">Generated ${new Date().toLocaleDateString()}</p>
  <p class="info"><strong>Courts:</strong> ${courtSummary} &nbsp;|&nbsp; <strong>Surface:</strong> ${surfaceLabel} &nbsp;|&nbsp; <strong>Total Area:</strong> ${fmt(totalSqFt)} sq ft</p>
  <table>
    <thead><tr><th>Material</th><th>Coats</th><th>Gallons Needed</th><th>Packaging</th><th>Item Number</th></tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">SportMaster Product Calculator — Coverage rates may vary. Consult ASBA standards for overrun requirements.</div>
  <script>window.onload = function() { window.print(); };<\/script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
}

init();

// Bind print button
$('printMaterialsBtn').addEventListener('click', printMaterialsList);
