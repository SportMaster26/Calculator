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
  'Forest Green ColorPlus': '#228B22',
  'Light Green ColorPlus': '#7CCD7C',
  'Dark Green ColorPlus': '#006400',
  'Beige ColorPlus': '#D2B48C',
  'Red ColorPlus': '#CC0000',
  'Maroon ColorPlus': '#800000',
  'Tournament Purple ColorPlus': '#6A0DAD',
  'Gray ColorPlus': '#808080',
  'Blue ColorPlus': '#1A5CBA',
  'Light Blue ColorPlus': '#87CEEB',
  'Dove Gray ColorPlus': '#B0B0B0',
  'Ice Blue ColorPlus': '#B0D4E8',
  'Sandstone ColorPlus': '#C2B280',
  'Orange ColorPlus': '#FF8C00',
  'Yellow ColorPlus': '#FFD700',
  'Brite Red ColorPlus': '#FF2020',
  'Black Dispersion ColorPlus': '#222222'
};

// ── Crack filler reference ──
const crackFillers = [
  { product: 'Acrylic Crack Patch', rate: '75 - 150 feet of Cracks', width: 'For Cracks up to 1" wide' },
  { product: 'CrackMagic', rate: '75 - 150 feet of Cracks', width: 'For Cracks up to 1/2" wide' },
  { product: 'CourtFlex', rate: '150 - 200 feet of Cracks', width: 'For Cracks up to 1/2" wide' }
];

// ── Court type zone definitions ──
const courtDefs = {
  tennis: {
    label: 'Tennis Court',
    defaultWidth: 36, defaultLength: 78,
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

// ── Products per zone per court type (Ready mix) ──
function getZoneProductsReady(courtType, zoneName) {
  if (courtType === 'tennis') {
    return [
      ['Neutral Concentrate w/ Sand', 2],
      ['Ready Mix', 2]
    ];
  }
  if (courtType === 'pickleball') {
    return [
      ['Neutral Concentrate w/ Sand', 2],
      ['PickleMaster', 2],
      ['PickleMaster RTU', 2]
    ];
  }
  if (courtType === 'basketballFull' || courtType === 'basketballHalf') {
    return [
      ['Neutral Concentrate w/ Sand', 2],
      ['Ready Mix', 2]
    ];
  }
  return [
    ['Neutral Concentrate w/ Sand', 2],
    ['Ready Mix', 2]
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
  const table = mixType === 'ready' ? coverageReady : coverageConc;
  const rates = table[productName];
  if (!rates) return 0;
  const idx = { concrete: 0, asphalt: 1, existingConcrete: 2, existingAsphalt: 3 }[surfaceType];
  return rates[idx] || 0;
}

function getItemNumber(productName, packaging, mixType) {
  const table = mixType === 'ready' ? itemNumbersReady : itemNumbersConc;
  const base = table[productName];
  if (!base) return '';
  if (base.endsWith('P')) return base;
  const suffix = { 5: 'P', 30: 'K', 55: 'D' }[packaging] || '';
  return base + suffix;
}

function getPackageSize(packaging) {
  return parseInt(packaging, 10);
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

// ColorPlus quantity per package
function getColorPlusCount(packages, packaging, productName) {
  // Ready Mix: 1 jar per 5-gal pail
  if (productName === 'Ready Mix' || productName === 'PickleMaster RTU') {
    return packages * 1;
  }
  const mult = { 5: 2, 30: 2, 55: 4 }[packaging] || 0;
  return packages * mult;
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
  const totalSqFt = entry.width * entry.length;
  const totalSqYd = totalSqFt / SQFT_PER_SQYD;
  const pkgSize = getPackageSize(packaging);
  const zoneAreas = computeZoneAreas(entry.courtType, totalSqFt, entry.numCourts);

  const zones = [];
  zoneAreas.forEach((zone, zi) => {
    if (zone.sqft <= 0) return;
    const zoneResult = { name: zone.name, sqft: zone.sqft, sqyd: zone.sqyd, products: [] };
    const colorName = entry.zoneColors[zi] || 'Not Selected';
    const prods = mixType === 'ready'
      ? getZoneProductsReady(entry.courtType, zone.name)
      : getZoneProductsConc(entry.courtType, zone.name);

    for (const [prodName, coats] of prods) {
      const rate = getCoverageRate(prodName, surfaceType, mixType);
      const gallons = calcGallons(rate, zone.sqyd, coats);
      const packages = calcPackages(gallons, pkgSize);

      const effectivePkg = (prodName === 'PickleMaster RTU' || prodName === 'Ready Mix') ? 5 : pkgSize;
      const effectivePackages = (prodName === 'PickleMaster RTU' || prodName === 'Ready Mix')
        ? calcPackages(gallons, 5) : packages;

      zoneResult.products.push({
        product: prodName, coats, gallons,
        packaging: effectivePackages + ' x ' + effectivePkg + ' Gal',
        item: getItemNumber(prodName, packaging, mixType)
      });

      if (mixType === 'concentrate' && prodName === 'Neutral Concentrate') {
        const sandLbs = getColorSandLbs(packages, packaging);
        const sandBags = Math.ceil(sandLbs / 50);
        zoneResult.products.push({
          product: 'Color Sand (80-90 Mesh)', coats: '', gallons: sandLbs + ' lbs',
          packaging: sandBags + ' - 50 lbs. Bags', item: 'R1010'
        });
      }

      if (colorName !== 'Not Selected') {
        const cpCount = getColorPlusCount(effectivePackages, packaging, prodName);
        const cpUnit = getColorPlusUnit(packaging, prodName);
        const cpItem = getColorPlusItemNumber(colorName, packaging, prodName);
        if (cpCount > 0) {
          zoneResult.products.push({
            product: colorName, coats: '', gallons: '',
            packaging: cpCount + ' - ' + cpUnit, item: cpItem
          });
        }
      }
    }
    zones.push(zoneResult);
  });

  // Striping
  const striping = [];
  const def = courtDefs[entry.courtType];
  if (def.stripingPerNCourts > 0) {
    const stripingQty = Math.ceil(entry.numCourts / def.stripingPerNCourts);
    striping.push(
      { product: 'Stripe Rite', coats: 1, gallons: stripingQty, packaging: stripingQty, item: 'C1610G' },
      { product: 'White Line Paint', coats: 1, gallons: stripingQty, packaging: stripingQty, item: 'C1620G' }
    );
    const tapeRolls = Math.ceil(def.masktapePerCourt * entry.numCourts);
    if (tapeRolls > 0) {
      striping.push({ product: 'Masking Tape (Standard Roll)', coats: '', gallons: '', packaging: tapeRolls + ' Rolls', item: '' });
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
    totalArea.push({
      product: 'Acrylic Adhesion Promoter', coats: '', gallons: '', packaging: '',
      item: getItemNumber('Acrylic Adhesion Promoter', packaging, mixType),
      note: 'Recommended for concrete surfaces'
    });
  }

  if (mixType === 'ready') {
    const name = 'Acrylic Resurfacer w/ Sand';
    const rate = getCoverageRate(name, surfaceType, 'ready');
    const coats = surfaceType === 'asphalt' ? 2 : 1;
    const gallons = calcGallons(rate, totalSqYd, coats);
    const packages = calcPackages(gallons, pkgSize);
    totalArea.push({
      product: name, coats, gallons,
      packaging: packages + ' x ' + pkgSize + ' Gal',
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
      packaging: packages + ' x ' + pkgSize + ' Gal',
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
        packaging: packages + ' x ' + pkgSize + ' Gal',
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
    width: def.defaultWidth,
    length: def.defaultLength,
    zoneColors: def.zones.map((z, i) => i === 0 ? 'Light Blue ColorPlus' : 'Blue ColorPlus')
  };
}

function readEntryFromDOM(entry) {
  const el = document.querySelector(`[data-entry-id="${entry.id}"]`);
  if (!el) return entry;
  entry.courtType = el.querySelector('.entry-court-type').value;
  entry.numCourts = Math.max(1, parseInt(el.querySelector('.entry-num-courts').value, 10) || 1);
  entry.width = parseFloat(el.querySelector('.entry-width').value) || 0;
  entry.length = parseFloat(el.querySelector('.entry-length').value) || 0;
  const colorSels = el.querySelectorAll('.entry-zone-color');
  entry.zoneColors = Array.from(colorSels).map(s => s.value);
  return entry;
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
          </div>
          <div class="form-row">
            <label>
              <span>Width (Feet)</span>
              <input class="entry-width input-highlight" type="number" min="0" step="0.1" value="${entry.width}" />
            </label>
            <label>
              <span>Length (Feet)</span>
              <input class="entry-length input-highlight" type="number" min="0" step="0.1" value="${entry.length}" />
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
      if (!el.classList.contains('entry-court-type')) {
        el.addEventListener('input', onFieldChange);
        el.addEventListener('change', onFieldChange);
      }
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
  const packaging = $('packaging').value;
  const mixType = $('mixType').value;

  // Calculate per-entry
  const entryResults = courtEntries.map(entry => calculateEntry(entry, surfaceType, packaging, mixType));

  // Combined total area
  const totalCombinedSqFt = entryResults.reduce((sum, r) => sum + r.totalSqFt, 0);
  const totalCombinedSqYd = totalCombinedSqFt / SQFT_PER_SQYD;
  const totalCombinedSqM = totalCombinedSqFt / SQFT_PER_SQM;

  // Global products (resurfacer, cushion)
  const global = calculateGlobalProducts(totalCombinedSqFt, surfaceType, packaging, mixType);

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
    <article class="summary-item"><span class="label">Mix Type</span><span class="value">${mixType === 'ready' ? 'Ready-to-Use' : 'Concentrate'}</span></article>
    <article class="summary-item"><span class="label">Packaging</span><span class="value">${getPackageSize(packaging)} Gallon</span></article>
  `;

  // Zone area breakdown
  let zoneAreaHtml = '';
  entryResults.forEach(r => {
    r.zoneAreas.forEach(z => {
      zoneAreaHtml += `<tr><td>${r.label}</td><td>${z.name}</td><td>${fmt(z.sqft)}</td><td>${fmt(z.sqyd)}</td></tr>`;
    });
  });
  $('zoneAreasBody').innerHTML = zoneAreaHtml || '<tr><td colspan="4">Add courts above</td></tr>';

  // Total area materials
  $('totalAreaBody').innerHTML = global.totalArea.map(r => `
    <tr><td>${r.product}</td><td>${r.coats}</td><td>${r.gallons}</td><td>${r.packaging}</td><td>${r.item}</td></tr>
  `).join('');

  // Per-entry zone products
  let zoneHtml = '';
  entryResults.forEach(r => {
    zoneHtml += `<tr class="zone-header"><td colspan="5">${r.label} (${r.numCourts}) &mdash; ${fmt(r.totalSqFt)} sq ft</td></tr>`;
    for (const zone of r.zones) {
      if (zone.products.length === 0) continue;
      zoneHtml += `<tr class="zone-subheader"><td colspan="5">${zone.name} (${fmt(zone.sqft)} sq ft)</td></tr>`;
      for (const p of zone.products) {
        zoneHtml += `<tr><td>${p.product}</td><td>${p.coats}</td><td>${p.gallons}</td><td>${p.packaging}</td><td>${p.item}</td></tr>`;
      }
    }
  });
  $('zoneProductsBody').innerHTML = zoneHtml || '<tr><td colspan="5">No zone products</td></tr>';

  // ProCushion
  let cushionHtml = '';
  for (const sys of global.cushion) {
    cushionHtml += `<tr class="zone-header"><td colspan="5">${sys.system}</td></tr>`;
    for (const item of sys.items) {
      cushionHtml += `<tr><td>${item.product}</td><td>${item.coats}</td><td>${item.gallons}</td><td>${item.packaging}</td><td>${item.item}</td></tr>`;
    }
  }
  $('cushionBody').innerHTML = cushionHtml;

  // Striping (aggregated from all entries)
  let allStriping = [];
  entryResults.forEach(r => {
    r.striping.forEach(s => allStriping.push({ ...s, court: r.label }));
  });
  if (allStriping.length > 0) {
    $('stripingBody').innerHTML = allStriping.map(r =>
      `<tr><td>${r.product}</td><td>${r.coats}</td><td>${r.gallons}</td><td>${r.packaging}</td><td>${r.item}</td></tr>`
    ).join('');
  } else {
    $('stripingBody').innerHTML = '<tr><td colspan="5">N/A for this court type</td></tr>';
  }
}

function renderCrackFillers() {
  $('crackBody').innerHTML = crackFillers.map(f => `
    <tr><td>${f.product}</td><td>${f.rate}</td><td>${f.width}</td></tr>
  `).join('');
}

// ── Initialize ──
function init() {
  // Start with one tennis court entry
  courtEntries.push(createEntry('tennis'));
  renderCourtEntries();
  renderCrackFillers();
  $('noteText').textContent = 'Make sure to check Industry Standard Courts for proper dimensions and follow ASBA for Overrun requirements.';
  renderResults();

  // Add Court button
  $('addCourtBtn').addEventListener('click', () => {
    courtEntries.push(createEntry('tennis'));
    renderCourtEntries();
    renderResults();
  });

  // Global settings change → recalculate
  for (const id of ['surfaceType', 'packaging', 'mixType']) {
    $(id).addEventListener('change', renderResults);
  }
}

init();
