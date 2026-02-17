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
  'Ready-Mix Color':                 [0.09, 0.11, 0.09, 0.09],
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
  'Ready-Mix Color': 'C1285P',
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

// ── Crack filler reference ──
const crackFillers = [
  { product: 'Acrylic Crack Patch', rate: '75 - 150 feet of Cracks', width: 'For Cracks up to 1" wide' },
  { product: 'CrackMagic', rate: '75 - 150 feet of Cracks', width: 'For Cracks up to 1/2" wide' },
  { product: 'CourtFlex', rate: '150 - 200 feet of Cracks', width: 'For Cracks up to 1/2" wide' }
];

// ── Court type zone definitions ──
// Each zone has: name, fixedSqFtPerCourt (null = computed), areaRef (which area variable to use)
const courtDefs = {
  tennis: {
    label: 'Tennis Court',
    defaultWidth: 36, defaultLength: 78,
    zones: [
      { name: 'Outside Area', sqftPerCourt: null },   // = MAX(0, total - playing)
      { name: 'Playing Area', sqftPerCourt: 2808 }    // 78*36
    ],
    masktapePerCourt: 8,
    stripingPerNCourts: 2  // every 2 courts
  },
  pickleball: {
    label: 'Pickleball Court',
    defaultWidth: 30, defaultLength: 60,
    zones: [
      { name: 'Total Area', sqftPerCourt: null },      // = total entered area
      { name: 'Service Area', sqftPerCourt: 600 },      // 15*20*2
      { name: 'Kitchen Area', sqftPerCourt: 280 }       // 14*20
    ],
    masktapePerCourt: 4,
    stripingPerNCourts: 2
  },
  basketballFull: {
    label: 'Basketball Full Court',
    defaultWidth: 50, defaultLength: 84,
    zones: [
      { name: 'Court', sqftPerCourt: 4200 },
      { name: 'Border', sqftPerCourt: null },           // = MAX(0, total - court)
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
      { name: 'Border', sqftPerCourt: null },           // = MAX(0, total - court)
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
      { name: 'Total Area', sqftPerCourt: null }       // = total entered area
    ],
    masktapePerCourt: 0,
    stripingPerNCourts: 0
  }
};

// ── Products per zone per court type (Ready mix) ──
// Each entry: [productName, fixedCoats]
// ColorPlus entries are added dynamically
function getZoneProductsReady(courtType, zoneName) {
  if (courtType === 'tennis') {
    return [
      ['Neutral Concentrate w/ Sand', 2],
      ['Ready-Mix Color', 2]
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
      ['Ready-Mix Color', 2]
    ];
  }
  // totalArea
  return [
    ['Neutral Concentrate w/ Sand', 2],
    ['Ready-Mix Color', 2]
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
  // tennis, basketball, totalArea
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
  // Products that already have a fixed suffix (like C1285P, C1299P)
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

// Sand amounts per package (Concentrate only)
function getResurfacerSandLbs(packages, packaging) {
  const mult = { 5: 70, 30: 400, 55: 750 }[packaging] || 0;
  return packages * mult;
}

function getColorSandLbs(packages, packaging) {
  const mult = { 5: 35, 30: 200, 55: 400 }[packaging] || 0;
  return packages * mult;
}

// ColorPlus quantity per package
function getColorPlusCount(packages, packaging) {
  const mult = { 5: 2, 30: 2, 55: 4 }[packaging] || 0;
  return packages * mult;
}

function getColorPlusUnit(packaging, productName) {
  // Ready-Mix Color and PickleMaster RTU with 5-gal pails use 24 OZ Jars
  if (parseInt(packaging) === 5 && (productName === 'Ready-Mix Color' || productName === 'PickleMaster RTU')) {
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
      // Computed zones
      if (courtType === 'tennis') {
        // Outside Area = MAX(0, total - playing)
        const playingArea = 2808 * numCourts;
        areaSqFt = Math.max(0, totalSqFt - playingArea);
      } else if (courtType === 'basketballFull') {
        // Border = MAX(0, total - court)
        const courtArea = 4200 * numCourts;
        areaSqFt = Math.max(0, totalSqFt - courtArea);
      } else if (courtType === 'basketballHalf') {
        // Border = MAX(0, total - court)
        const courtArea = 2100 * numCourts;
        areaSqFt = Math.max(0, totalSqFt - courtArea);
      } else {
        // Total Area / Pickleball Total Area = entered total
        areaSqFt = totalSqFt;
      }
    }
    zones.push({ name: zone.name, sqft: areaSqFt, sqyd: areaSqFt / SQFT_PER_SQYD });
  }
  return zones;
}

// ── Main calculation ──
function calculate(inputs) {
  const {
    courtType, inputMode, value1, value2,
    numCourts, surfaceType, packaging, mixType, zoneColors
  } = inputs;

  // 1) Total area in sqft
  let totalSqFt = 0;
  if (inputMode === 'widthLength') {
    totalSqFt = (value1 || 0) * (value2 || 0);
  } else if (inputMode === 'sqft') {
    totalSqFt = value1 || 0;
  } else if (inputMode === 'sqyd') {
    totalSqFt = (value1 || 0) * SQFT_PER_SQYD;
  } else if (inputMode === 'sqm') {
    totalSqFt = (value1 || 0) * SQFT_PER_SQM;
  }
  const totalSqYd = totalSqFt / SQFT_PER_SQYD;
  const pkgSize = getPackageSize(packaging);

  // 2) Zone areas
  const zoneAreas = computeZoneAreas(courtType, totalSqFt, numCourts);

  // 3) Build results
  const results = { totalArea: [], zones: [], cushion: [], striping: [], summary: {} };

  results.summary = {
    totalSqFt,
    totalSqYd,
    totalSqM: totalSqFt / SQFT_PER_SQM,
    numCourts,
    courtType: courtDefs[courtType].label,
    mixType: mixType === 'ready' ? 'Ready-to-Use' : 'Concentrate',
    surfaceType,
    packaging: pkgSize + ' Gallon'
  };

  // ── Total Area products (Adhesion Promoter + Resurfacer) ──
  // Adhesion Promoter: only for concrete/existing concrete surfaces
  const showAdhesion = surfaceType === 'concrete' || surfaceType === 'existingConcrete';
  if (showAdhesion) {
    results.totalArea.push({
      product: 'Acrylic Adhesion Promoter',
      coats: '',
      gallons: '',
      packaging: '',
      item: getItemNumber('Acrylic Adhesion Promoter', packaging, mixType),
      note: 'Recommended for concrete surfaces'
    });
  }

  // Resurfacer
  if (mixType === 'ready') {
    const resurfacerName = 'Acrylic Resurfacer w/ Sand';
    const rate = getCoverageRate(resurfacerName, surfaceType, 'ready');
    const coats = surfaceType === 'asphalt' ? 2 : 1;
    const gallons = calcGallons(rate, totalSqYd, coats);
    const packages = calcPackages(gallons, pkgSize);
    results.totalArea.push({
      product: resurfacerName,
      coats,
      gallons,
      packaging: packages + ' x ' + pkgSize + ' Gal',
      item: getItemNumber(resurfacerName, packaging, 'ready')
    });
  } else {
    const resurfacerName = 'Acrylic Resurfacer';
    const rate = getCoverageRate(resurfacerName, surfaceType, 'concentrate');
    const coats = surfaceType === 'asphalt' ? 2 : 1;
    const gallons = calcGallons(rate, totalSqYd, coats);
    const packages = calcPackages(gallons, pkgSize);
    results.totalArea.push({
      product: resurfacerName,
      coats,
      gallons,
      packaging: packages + ' x ' + pkgSize + ' Gal',
      item: getItemNumber(resurfacerName, packaging, 'concentrate')
    });
    // Resurfacer Sand
    const sandLbs = getResurfacerSandLbs(packages, packaging);
    const sandBags = Math.ceil(sandLbs / 50);
    results.totalArea.push({
      product: 'Resurfacer Sand (50-60 Mesh)',
      coats: '',
      gallons: sandLbs + ' lbs',
      packaging: sandBags + ' - 50 lbs. Bags',
      item: 'R1020'
    });
  }

  // ── Per-zone products ──
  zoneAreas.forEach((zone, zi) => {
    if (zone.sqft <= 0) return;

    const zoneResult = { name: zone.name, sqft: zone.sqft, sqyd: zone.sqyd, products: [] };
    const colorName = (zoneColors && zoneColors[zi]) || 'Not Selected';
    const prods = mixType === 'ready'
      ? getZoneProductsReady(courtType, zone.name)
      : getZoneProductsConc(courtType, zone.name);

    for (const [prodName, coats] of prods) {
      const rate = getCoverageRate(prodName, surfaceType, mixType);
      const gallons = calcGallons(rate, zone.sqyd, coats);
      const packages = calcPackages(gallons, pkgSize);

      // For PickleMaster RTU and Ready-Mix Color, packaging is always 5-gal pails
      const effectivePkg = (prodName === 'PickleMaster RTU' || prodName === 'Ready-Mix Color') ? 5 : pkgSize;
      const effectivePackages = (prodName === 'PickleMaster RTU' || prodName === 'Ready-Mix Color')
        ? calcPackages(gallons, 5)
        : packages;

      zoneResult.products.push({
        product: prodName,
        coats,
        gallons,
        packaging: effectivePackages + ' x ' + effectivePkg + ' Gal',
        item: getItemNumber(prodName, packaging, mixType)
      });

      // Concentrate: Color Sand after Neutral Concentrate
      if (mixType === 'concentrate' && prodName === 'Neutral Concentrate') {
        const sandLbs = getColorSandLbs(packages, packaging);
        const sandBags = Math.ceil(sandLbs / 50);
        zoneResult.products.push({
          product: 'Color Sand (80-90 Mesh)',
          coats: '',
          gallons: sandLbs + ' lbs',
          packaging: sandBags + ' - 50 lbs. Bags',
          item: 'R1010'
        });
      }

      // ColorPlus tinting
      if (colorName !== 'Not Selected') {
        const cpCount = getColorPlusCount(effectivePackages, packaging);
        const cpUnit = getColorPlusUnit(packaging, prodName);
        const cpItem = getColorPlusItemNumber(colorName, packaging, prodName);
        if (cpCount > 0) {
          zoneResult.products.push({
            product: colorName,
            coats: '',
            gallons: '',
            packaging: cpCount + ' - ' + cpUnit,
            item: cpItem
          });
        }
      }
    }

    results.zones.push(zoneResult);
  });

  // ── ProCushion Layers ──
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
        product: item.product,
        coats: item.coats,
        gallons,
        packaging: packages + ' x ' + pkgSize + ' Gal',
        item: getItemNumber(item.product, packaging, mixType)
      });
    }
    results.cushion.push(sysResult);
  }

  // ── Striping ──
  const def = courtDefs[courtType];
  if (def.stripingPerNCourts > 0) {
    const stripingQty = Math.ceil(numCourts / def.stripingPerNCourts);
    results.striping.push(
      { product: 'Stripe Rite', coats: 1, gallons: stripingQty, packaging: stripingQty, item: 'C1610G' },
      { product: 'White Line Paint', coats: 1, gallons: stripingQty, packaging: stripingQty, item: 'C1620G' }
    );
    const tapeRolls = Math.ceil(def.masktapePerCourt * numCourts);
    if (tapeRolls > 0) {
      results.striping.push(
        { product: 'Masking Tape (Standard Roll)', coats: '', gallons: '', packaging: tapeRolls + ' Rolls', item: '' }
      );
    }
  }

  return results;
}

// ────────────────────────────────────────────────────────
// UI RENDERING
// ────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

function getInputs() {
  const courtType = $('courtType').value;
  const inputMode = $('inputMode').value;
  const value1 = parseFloat($('value1').value) || 0;
  const value2 = parseFloat($('value2').value) || 0;
  const numCourts = Math.max(1, parseInt($('numCourts').value, 10) || 1);
  const surfaceType = $('surfaceType').value;
  const packaging = $('packaging').value;
  const mixType = $('mixType').value;

  // Gather zone colors
  const colorSelects = document.querySelectorAll('.zone-color-select');
  const zoneColors = Array.from(colorSelects).map(s => s.value);

  return { courtType, inputMode, value1, value2, numCourts, surfaceType, packaging, mixType, zoneColors };
}

function fmt(n) {
  if (typeof n !== 'number' || isNaN(n)) return n;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);
}

function populateCourtTypes() {
  const sel = $('courtType');
  sel.innerHTML = '';
  for (const [key, def] of Object.entries(courtDefs)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = def.label;
    sel.appendChild(opt);
  }
}

function populateColorOptions(selectEl) {
  selectEl.innerHTML = '';
  for (const c of colorOptions) {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    selectEl.appendChild(opt);
  }
}

function updateDimensionFields() {
  const mode = $('inputMode').value;
  const v1Label = $('value1Label');
  const v2Row = $('value2Row');

  if (mode === 'widthLength') {
    v1Label.textContent = 'Width (Feet)';
    v2Row.classList.remove('hidden');
  } else {
    v2Row.classList.add('hidden');
    const labels = { sqft: 'Square Footage', sqyd: 'Square Yardage', sqm: 'Square Meters' };
    v1Label.textContent = labels[mode] || 'Value';
  }
}

function updateDefaultDimensions() {
  const courtType = $('courtType').value;
  const def = courtDefs[courtType];
  if ($('inputMode').value === 'widthLength') {
    $('value1').value = def.defaultWidth;
    $('value2').value = def.defaultLength;
  }
}

function updateZoneColorSelectors() {
  const courtType = $('courtType').value;
  const def = courtDefs[courtType];
  const container = $('zoneColorsContainer');
  container.innerHTML = '';

  // Determine visible zones based on court type (matching Excel VBA visibility logic)
  const visibleZones = def.zones;

  visibleZones.forEach((zone, i) => {
    const wrapper = document.createElement('label');
    wrapper.innerHTML = `<span>${zone.name} Color</span>`;
    const sel = document.createElement('select');
    sel.className = 'zone-color-select';
    sel.dataset.zoneIndex = i;
    populateColorOptions(sel);
    // Set sensible defaults
    if (i === 0) sel.value = 'Light Blue ColorPlus';
    else sel.value = 'Blue ColorPlus';
    sel.addEventListener('change', render);
    wrapper.appendChild(sel);
    container.appendChild(wrapper);
  });
}

function updateCourtsVisibility() {
  const courtType = $('courtType').value;
  const courtsRow = $('courtsRow');
  // Total Area doesn't use number of courts
  if (courtType === 'totalArea') {
    courtsRow.classList.add('hidden');
    $('numCourts').value = 1;
  } else {
    courtsRow.classList.remove('hidden');
  }
}

function renderCrackFillers() {
  $('crackBody').innerHTML = crackFillers.map(f => `
    <tr>
      <td>${f.product}</td>
      <td>${f.rate}</td>
      <td>${f.width}</td>
    </tr>
  `).join('');
}

function renderResults(results) {
  // Summary cards
  $('summaryGrid').innerHTML = `
    <article class="summary-item"><span class="label">Project Type</span><span class="value">${results.summary.courtType}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq ft)</span><span class="value">${fmt(results.summary.totalSqFt)}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq yd)</span><span class="value">${fmt(results.summary.totalSqYd)}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq m)</span><span class="value">${fmt(results.summary.totalSqM)}</span></article>
    <article class="summary-item"><span class="label">Number of Courts</span><span class="value">${results.summary.numCourts}</span></article>
    <article class="summary-item"><span class="label">Mix Type</span><span class="value">${results.summary.mixType}</span></article>
  `;

  // Zone area breakdown
  const zoneAreaRows = results.zones.map(z => `
    <tr><td>${z.name}</td><td>${fmt(z.sqft)}</td><td>${fmt(z.sqyd)}</td></tr>
  `).join('');
  $('zoneAreasBody').innerHTML = zoneAreaRows || '<tr><td colspan="3">Enter dimensions above</td></tr>';

  // Total Area materials
  $('totalAreaBody').innerHTML = results.totalArea.map(r => `
    <tr>
      <td>${r.product}</td>
      <td>${r.coats}</td>
      <td>${r.gallons}</td>
      <td>${r.packaging}</td>
      <td>${r.item}</td>
    </tr>
  `).join('');

  // Per-zone materials
  let zoneHtml = '';
  for (const zone of results.zones) {
    if (zone.products.length === 0) continue;
    zoneHtml += `<tr class="zone-header"><td colspan="5">${zone.name} (${fmt(zone.sqft)} sq ft)</td></tr>`;
    for (const p of zone.products) {
      zoneHtml += `
        <tr>
          <td>${p.product}</td>
          <td>${p.coats}</td>
          <td>${p.gallons}</td>
          <td>${p.packaging}</td>
          <td>${p.item}</td>
        </tr>`;
    }
  }
  $('zoneProductsBody').innerHTML = zoneHtml || '<tr><td colspan="5">No zone products</td></tr>';

  // ProCushion
  let cushionHtml = '';
  for (const sys of results.cushion) {
    cushionHtml += `<tr class="zone-header"><td colspan="5">${sys.system}</td></tr>`;
    for (const item of sys.items) {
      cushionHtml += `
        <tr>
          <td>${item.product}</td>
          <td>${item.coats}</td>
          <td>${item.gallons}</td>
          <td>${item.packaging}</td>
          <td>${item.item}</td>
        </tr>`;
    }
  }
  $('cushionBody').innerHTML = cushionHtml;

  // Striping
  $('stripingBody').innerHTML = results.striping.map(r => `
    <tr>
      <td>${r.product}</td>
      <td>${r.coats}</td>
      <td>${r.gallons}</td>
      <td>${r.packaging}</td>
      <td>${r.item}</td>
    </tr>
  `).join('') || '<tr><td colspan="5">N/A for this court type</td></tr>';
}

function render() {
  const inputs = getInputs();
  const results = calculate(inputs);
  renderResults(results);
}

// ── Note text (matches Excel instructions) ──
function renderNote() {
  $('noteText').textContent = 'Make sure to check Industry Standard Courts for proper dimensions and follow ASBA for Overrun requirements.';
}

// ── Initialize ──
function init() {
  populateCourtTypes();
  updateDimensionFields();
  updateDefaultDimensions();
  updateZoneColorSelectors();
  updateCourtsVisibility();
  renderCrackFillers();
  renderNote();
  render();

  // Event listeners
  $('courtType').addEventListener('change', () => {
    updateDefaultDimensions();
    updateZoneColorSelectors();
    updateCourtsVisibility();
    render();
  });
  $('inputMode').addEventListener('change', () => {
    updateDimensionFields();
    render();
  });

  for (const id of ['value1', 'value2', 'numCourts', 'surfaceType', 'packaging', 'mixType']) {
    $(id).addEventListener('input', render);
    $(id).addEventListener('change', render);
  }
}

init();
