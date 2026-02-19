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

// ── Crack filler data ──
// minRate = conservative (fewer feet per gallon = more gallons needed)
const crackFillers = [
  { product: 'Acrylic Crack Patch', rateLabel: '75 - 150 ft / gal', width: 'For Cracks up to 1" wide', minRate: 75 },
  { product: 'CrackMagic', rateLabel: '75 - 150 ft / gal', width: 'For Cracks up to 1/2" wide', minRate: 75 },
  { product: 'CourtFlex', rateLabel: '150 - 200 ft / gal', width: 'For Cracks up to 1/2" wide', minRate: 150 }
];

// ── Product option definitions per court type and mix type ──
const productOptionDefs = {
  tennis: {
    ready: [
      { value: 'neutralSand', label: 'Neutral Concentrate w/ Sand' },
      { value: 'readyMix', label: 'Ready-Mix Color' }
    ],
    concentrate: [
      { value: 'neutralConc', label: 'Neutral Concentrate' }
    ]
  },
  pickleball: {
    ready: [
      { value: 'neutralSand', label: 'Neutral Concentrate w/ Sand' },
      { value: 'pickleMaster', label: 'PickleMaster' },
      { value: 'pickleMasterRTU', label: 'PickleMaster RTU' }
    ],
    concentrate: [
      { value: 'neutralConc', label: 'Neutral Concentrate' },
      { value: 'pickleMaster', label: 'PickleMaster' }
    ]
  },
  basketballFull: {
    ready: [
      { value: 'neutralSand', label: 'Neutral Concentrate w/ Sand' },
      { value: 'readyMix', label: 'Ready-Mix Color' }
    ],
    concentrate: [
      { value: 'neutralConc', label: 'Neutral Concentrate' }
    ]
  },
  basketballHalf: {
    ready: [
      { value: 'neutralSand', label: 'Neutral Concentrate w/ Sand' },
      { value: 'readyMix', label: 'Ready-Mix Color' }
    ],
    concentrate: [
      { value: 'neutralConc', label: 'Neutral Concentrate' }
    ]
  },
  totalArea: {
    ready: [
      { value: 'neutralSand', label: 'Neutral Concentrate w/ Sand' },
      { value: 'readyMix', label: 'Ready-Mix Color' }
    ],
    concentrate: [
      { value: 'neutralConc', label: 'Neutral Concentrate' }
    ]
  }
};

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
    stripingPerNCourts: 1
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
    stripingPerNCourts: 1
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
    stripingPerNCourts: 1
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

// ── Get the selected zone product based on the product option ──
function getSelectedZoneProduct(productOption, mixType) {
  if (mixType === 'ready') {
    switch (productOption) {
      case 'neutralSand':      return ['Neutral Concentrate w/ Sand', 2];
      case 'readyMix':         return ['Ready-Mix Color', 2];
      case 'pickleMaster':     return ['PickleMaster', 2];
      case 'pickleMasterRTU':  return ['PickleMaster RTU', 2];
      default:                 return ['Neutral Concentrate w/ Sand', 2];
    }
  } else {
    switch (productOption) {
      case 'neutralConc':      return ['Neutral Concentrate', 2];
      case 'pickleMaster':     return ['PickleMaster', 2];
      default:                 return ['Neutral Concentrate', 2];
    }
  }
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

function getColorPlusCount(packages, packaging) {
  const mult = { 5: 2, 30: 2, 55: 4 }[packaging] || 0;
  return packages * mult;
}

function getColorPlusUnit(packaging) {
  if (parseInt(packaging) === 5) {
    return '24 OZ Jar(s)';
  }
  return '1 Gallon Pail(s)';
}

function getColorPlusItemNumber(colorName, packaging) {
  const color = colorOptions.find(c => c.name === colorName);
  if (!color || !color.itemG) return '';
  const usesJars = parseInt(packaging) === 5;
  return usesJars ? color.itemJ : color.itemG;
}

// ── Compute zone areas for a single court entry ──
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

// ── Main calculation — processes ALL court entries and returns consolidated results ──
function calculate(inputs) {
  const { courtEntries, surfaceType, packaging, mixType, productOption, cushionSystem } = inputs;
  const pkgSize = getPackageSize(packaging);

  // Accumulators for consolidation
  let grandTotalSqFt = 0;
  const allZoneAreas = [];          // for zone area breakdown display
  const totalAreaGallons = {};      // product -> total gallons (resurfacer section)
  const zoneDetailRows = [];        // per-zone detail rows for color coating
  const zoneProductGallons = {};    // product -> total gallons (color coating totals)
  const colorPlusTotals = {};       // colorName -> total count
  let totalSandLbs = 0;            // resurfacer sand (concentrate)
  let totalColorSandLbs = 0;       // color sand (concentrate)
  let totalStripingGal = 0;
  let totalTapeRolls = 0;
  const cushionGallons = {};        // product -> { standard: gal, premium: gal }
  const courtSummaryParts = [];     // for summary display

  // Track resurfacer coats (for display — may differ per entry but we show max)
  let resurfacerCoatsMax = 0;

  for (const entry of courtEntries) {
    // Calculate total sqft for this entry
    let entrySqFt = 0;
    if (entry.inputMode === 'widthLength') {
      entrySqFt = (entry.value1 || 0) * (entry.value2 || 0);
    } else if (entry.inputMode === 'sqft') {
      entrySqFt = entry.value1 || 0;
    } else if (entry.inputMode === 'sqyd') {
      entrySqFt = (entry.value1 || 0) * SQFT_PER_SQYD;
    } else if (entry.inputMode === 'sqm') {
      entrySqFt = (entry.value1 || 0) * SQFT_PER_SQM;
    }
    const entrySqYd = entrySqFt / SQFT_PER_SQYD;
    grandTotalSqFt += entrySqFt;

    const courtLabel = courtDefs[entry.courtType].label;
    courtSummaryParts.push(entry.numCourts + 'x ' + courtLabel);

    // Zone areas for this entry
    const zoneAreas = computeZoneAreas(entry.courtType, entrySqFt, entry.numCourts);
    for (const z of zoneAreas) {
      allZoneAreas.push({ name: z.name + ' (' + courtLabel + ')', sqft: z.sqft, sqyd: z.sqyd });
    }

    // ── Total Area products (Adhesion Promoter + Resurfacer) ──
    const showAdhesion = surfaceType === 'concrete' || surfaceType === 'existingConcrete';
    if (showAdhesion) {
      const adhesionRate = getCoverageRate('Acrylic Adhesion Promoter', surfaceType, mixType);
      const adhesionGallons = calcGallons(adhesionRate, entrySqYd, 1);
      totalAreaGallons['Acrylic Adhesion Promoter'] = (totalAreaGallons['Acrylic Adhesion Promoter'] || 0) + adhesionGallons;
    }

    const resurfacerCoats = surfaceType === 'concrete' ? 1 : 2;
    if (resurfacerCoats > resurfacerCoatsMax) resurfacerCoatsMax = resurfacerCoats;

    if (mixType === 'ready') {
      const resurfacerName = 'Acrylic Resurfacer w/ Sand';
      const rate = getCoverageRate(resurfacerName, surfaceType, 'ready');
      const gallons = calcGallons(rate, entrySqYd, resurfacerCoats);
      totalAreaGallons[resurfacerName] = (totalAreaGallons[resurfacerName] || 0) + gallons;
    } else {
      const resurfacerName = 'Acrylic Resurfacer';
      const rate = getCoverageRate(resurfacerName, surfaceType, 'concentrate');
      const gallons = calcGallons(rate, entrySqYd, resurfacerCoats);
      totalAreaGallons[resurfacerName] = (totalAreaGallons[resurfacerName] || 0) + gallons;
    }

    // ── Per-zone products (color coating) ──
    const [selectedProd, selectedCoats] = getSelectedZoneProduct(productOption, mixType);

    zoneAreas.forEach((zone, zi) => {
      if (zone.sqft <= 0) return;
      const rate = getCoverageRate(selectedProd, surfaceType, mixType);
      const gallons = calcGallons(rate, zone.sqyd, selectedCoats);
      zoneProductGallons[selectedProd] = (zoneProductGallons[selectedProd] || 0) + gallons;

      // Per-zone detail row
      const colorName = (entry.zoneColors && entry.zoneColors[zi]) || 'Not Selected';
      zoneDetailRows.push({
        zoneName: zone.name + ' (' + courtLabel + ')',
        product: selectedProd,
        coats: selectedCoats,
        gallons: gallons,
        color: colorName
      });

      // Concentrate color sand
      if (mixType === 'concentrate' && selectedProd === 'Neutral Concentrate') {
        const packages = calcPackages(gallons, pkgSize);
        totalColorSandLbs += getColorSandLbs(packages, packaging);
      }

      // ColorPlus
      if (colorName !== 'Not Selected') {
        const effectivePkg = (selectedProd === 'PickleMaster RTU' || selectedProd === 'Ready-Mix Color') ? 5 : pkgSize;
        const effectivePackages = (selectedProd === 'PickleMaster RTU' || selectedProd === 'Ready-Mix Color')
          ? calcPackages(gallons, 5)
          : calcPackages(gallons, pkgSize);
        const cpCount = getColorPlusCount(effectivePackages, effectivePkg);
        colorPlusTotals[colorName] = (colorPlusTotals[colorName] || 0) + cpCount;
      }
    });

    // ── ProCushion (only if selected) ──
    if (cushionSystem !== 'none') {
      const cushionItems = [
        { product: 'CushionMaster II (Coarse Rubber)', standardCoats: 3, premiumCoats: 5 },
        { product: 'CushionMaster I (Fine Rubber)', standardCoats: 2, premiumCoats: 2 }
      ];
      for (const item of cushionItems) {
        const coats = cushionSystem === 'premium' ? item.premiumCoats : item.standardCoats;
        const rate = getCoverageRate(item.product, surfaceType, mixType);
        const gal = calcGallons(rate, entrySqYd, coats);
        if (!cushionGallons[item.product]) {
          cushionGallons[item.product] = 0;
        }
        cushionGallons[item.product] += gal;
      }
    }

    // ── Striping ──
    const def = courtDefs[entry.courtType];
    if (def.stripingPerNCourts > 0) {
      totalStripingGal += Math.ceil(entry.numCourts / def.stripingPerNCourts);
      totalTapeRolls += Math.ceil(def.masktapePerCourt * entry.numCourts);
    }
  }

  // ── Build consolidated results ──
  const results = { totalArea: [], zoneDetails: [], zoneTotals: [], cushion: [], striping: [], summary: {} };
  const grandTotalSqYd = grandTotalSqFt / SQFT_PER_SQYD;

  results.summary = {
    totalSqFt: grandTotalSqFt,
    totalSqYd: grandTotalSqYd,
    totalSqM: grandTotalSqFt / SQFT_PER_SQM,
    courts: courtSummaryParts.join(', '),
    mixType: mixType === 'ready' ? 'Ready-to-Use' : 'Concentrate',
    surfaceType,
    packaging: pkgSize + ' Gallon'
  };

  // Zone area breakdown (for display)
  results.zoneAreas = allZoneAreas;

  // ── Consolidated Total Area Materials ──
  if (totalAreaGallons['Acrylic Adhesion Promoter']) {
    const gal = totalAreaGallons['Acrylic Adhesion Promoter'];
    const pkg = calcPackages(gal, pkgSize);
    results.totalArea.push({
      product: 'Acrylic Adhesion Promoter',
      coats: 1,
      gallons: gal,
      packaging: pkg + ' x ' + pkgSize + ' Gal',
      item: getItemNumber('Acrylic Adhesion Promoter', packaging, mixType)
    });
  }

  const resurfacerName = mixType === 'ready' ? 'Acrylic Resurfacer w/ Sand' : 'Acrylic Resurfacer';
  if (totalAreaGallons[resurfacerName]) {
    const gal = totalAreaGallons[resurfacerName];
    const pkg = calcPackages(gal, pkgSize);
    results.totalArea.push({
      product: resurfacerName,
      coats: resurfacerCoatsMax,
      gallons: gal,
      packaging: pkg + ' x ' + pkgSize + ' Gal',
      item: getItemNumber(resurfacerName, packaging, mixType)
    });

    // Concentrate: resurfacer sand
    if (mixType === 'concentrate') {
      const sandLbs = getResurfacerSandLbs(pkg, packaging);
      const sandBags = Math.ceil(sandLbs / 50);
      results.totalArea.push({
        product: 'Resurfacer Sand (50-60 Mesh)',
        coats: '',
        gallons: sandLbs + ' lbs',
        packaging: sandBags + ' - 50 lbs. Bags',
        item: 'R1020'
      });
    }
  }

  // ── Per-zone detail rows ──
  results.zoneDetails = zoneDetailRows;

  // ── Consolidated Zone Totals (Color Coating) ──
  const [selectedProd, selectedCoats] = getSelectedZoneProduct(productOption, mixType);

  for (const [prodName, totalGal] of Object.entries(zoneProductGallons)) {
    const effectivePkg = (prodName === 'PickleMaster RTU' || prodName === 'Ready-Mix Color') ? 5 : pkgSize;
    const effectivePackages = calcPackages(totalGal, effectivePkg);
    results.zoneTotals.push({
      product: prodName,
      coats: selectedCoats,
      gallons: totalGal,
      packaging: effectivePackages + ' x ' + effectivePkg + ' Gal',
      item: getItemNumber(prodName, packaging, mixType)
    });
  }

  // Concentrate: color sand total
  if (mixType === 'concentrate' && totalColorSandLbs > 0) {
    const sandBags = Math.ceil(totalColorSandLbs / 50);
    results.zoneTotals.push({
      product: 'Color Sand (80-90 Mesh)',
      coats: '',
      gallons: totalColorSandLbs + ' lbs',
      packaging: sandBags + ' - 50 lbs. Bags',
      item: 'R1010'
    });
  }

  // ColorPlus totals
  const cpUnit = getColorPlusUnit((selectedProd === 'PickleMaster RTU' || selectedProd === 'Ready-Mix Color') ? 5 : pkgSize);
  for (const [colorName, count] of Object.entries(colorPlusTotals)) {
    if (count > 0) {
      const effectivePkg = (selectedProd === 'PickleMaster RTU' || selectedProd === 'Ready-Mix Color') ? 5 : pkgSize;
      results.zoneTotals.push({
        product: colorName,
        coats: '',
        gallons: '',
        packaging: count + ' - ' + cpUnit,
        item: getColorPlusItemNumber(colorName, effectivePkg)
      });
    }
  }

  // ── Consolidated ProCushion (only selected system) ──
  if (cushionSystem !== 'none') {
    const cushionOrder = ['CushionMaster II (Coarse Rubber)', 'CushionMaster I (Fine Rubber)'];
    for (const prod of cushionOrder) {
      if (cushionGallons[prod]) {
        const gal = cushionGallons[prod];
        const pkg = calcPackages(gal, pkgSize);
        const coats = cushionSystem === 'premium'
          ? (prod.includes('Coarse') ? 5 : 2)
          : (prod.includes('Coarse') ? 3 : 2);
        results.cushion.push({
          product: prod, coats, gallons: gal,
          packaging: pkg + ' x ' + pkgSize + ' Gal',
          item: getItemNumber(prod, packaging, mixType)
        });
      }
    }
  }

  // ── Consolidated Striping ──
  if (totalStripingGal > 0) {
    results.striping.push(
      { product: 'Stripe Rite', coats: 1, gallons: totalStripingGal, packaging: totalStripingGal, item: 'C1610G' },
      { product: 'White Line Paint', coats: 1, gallons: totalStripingGal, packaging: totalStripingGal, item: 'C1620G' }
    );
    if (totalTapeRolls > 0) {
      results.striping.push(
        { product: 'Masking Tape (Standard Roll)', coats: '', gallons: '', packaging: totalTapeRolls + ' Rolls', item: '' }
      );
    }
  }

  return results;
}

// ────────────────────────────────────────────────────────
// UI RENDERING
// ────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

// ── Court entries state ──
let courtEntryId = 0;
let courtEntries = []; // array of { id, el }

function createCourtEntry() {
  const id = courtEntryId++;
  const defaultCourt = 'tennis';
  const def = courtDefs[defaultCourt];

  const div = document.createElement('div');
  div.className = 'court-entry';
  div.dataset.entryId = id;

  div.innerHTML = `
    <div class="court-entry-header">
      <h3>Court #${courtEntries.length + 1}</h3>
      <button type="button" class="btn btn-remove" data-remove="${id}">Remove</button>
    </div>
    <div class="form-row">
      <label>
        <span>Court Type</span>
        <select class="ce-courtType">
          ${Object.entries(courtDefs).map(([key, d]) =>
            `<option value="${key}">${d.label}</option>`
          ).join('')}
        </select>
      </label>
      <label>
        <span>Input Mode</span>
        <select class="ce-inputMode">
          <option value="widthLength">Width x Length (Feet)</option>
          <option value="sqft">Square Footage</option>
          <option value="sqyd">Square Yardage</option>
          <option value="sqm">Square Meters</option>
        </select>
      </label>
      <label class="ce-value1-label">
        <span class="ce-value1-text">Width (Feet)</span>
        <input class="ce-value1 input-highlight" type="number" min="0" step="0.1" value="${def.defaultWidth}" />
      </label>
      <label class="ce-value2-row">
        <span>Length (Feet)</span>
        <input class="ce-value2 input-highlight" type="number" min="0" step="0.1" value="${def.defaultLength}" />
      </label>
      <label class="ce-numCourts-row">
        <span>Number of Courts</span>
        <input class="ce-numCourts input-highlight" type="number" min="1" step="1" value="1" />
      </label>
    </div>
    <div class="zone-colors-row form-row"></div>
  `;

  // Event listeners
  const courtTypeSelect = div.querySelector('.ce-courtType');
  const inputModeSelect = div.querySelector('.ce-inputMode');
  const removeBtn = div.querySelector('.btn-remove');

  courtTypeSelect.addEventListener('change', () => {
    updateCourtEntryDefaults(div);
    updateCourtEntryDimensionFields(div);
    updateCourtEntryZoneColors(div);
    updateCourtEntryNumCourtsVisibility(div);
    updateProductOptions();
    render();
  });

  inputModeSelect.addEventListener('change', () => {
    updateCourtEntryDimensionFields(div);
    render();
  });

  removeBtn.addEventListener('click', () => {
    removeCourtEntry(id);
  });

  // Listen on value inputs
  for (const cls of ['.ce-value1', '.ce-value2', '.ce-numCourts']) {
    const el = div.querySelector(cls);
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  }

  $('courtEntriesContainer').appendChild(div);
  courtEntries.push({ id, el: div });

  updateCourtEntryZoneColors(div);
  updateCourtEntryNumCourtsVisibility(div);
  renumberCourtEntries();
  updateProductOptions();
  render();
}

function removeCourtEntry(id) {
  const idx = courtEntries.findIndex(e => e.id === id);
  if (idx === -1) return;
  courtEntries[idx].el.remove();
  courtEntries.splice(idx, 1);
  if (courtEntries.length === 0) {
    createCourtEntry();
    return;
  }
  renumberCourtEntries();
  updateProductOptions();
  render();
}

function renumberCourtEntries() {
  courtEntries.forEach((entry, i) => {
    entry.el.querySelector('h3').textContent = 'Court #' + (i + 1);
  });
  // Hide remove button if only one entry
  courtEntries.forEach(entry => {
    const btn = entry.el.querySelector('.btn-remove');
    btn.style.display = courtEntries.length === 1 ? 'none' : '';
  });
}

function updateCourtEntryDefaults(entryDiv) {
  const courtType = entryDiv.querySelector('.ce-courtType').value;
  const def = courtDefs[courtType];
  const inputMode = entryDiv.querySelector('.ce-inputMode').value;
  if (inputMode === 'widthLength') {
    entryDiv.querySelector('.ce-value1').value = def.defaultWidth;
    entryDiv.querySelector('.ce-value2').value = def.defaultLength;
  }
}

function updateCourtEntryDimensionFields(entryDiv) {
  const mode = entryDiv.querySelector('.ce-inputMode').value;
  const v1Text = entryDiv.querySelector('.ce-value1-text');
  const v2Row = entryDiv.querySelector('.ce-value2-row');

  if (mode === 'widthLength') {
    v1Text.textContent = 'Width (Feet)';
    v2Row.classList.remove('hidden');
  } else {
    v2Row.classList.add('hidden');
    const labels = { sqft: 'Square Footage', sqyd: 'Square Yardage', sqm: 'Square Meters' };
    v1Text.textContent = labels[mode] || 'Value';
  }
}

function updateCourtEntryNumCourtsVisibility(entryDiv) {
  const courtType = entryDiv.querySelector('.ce-courtType').value;
  const numCourtsRow = entryDiv.querySelector('.ce-numCourts-row');
  if (courtType === 'totalArea') {
    numCourtsRow.classList.add('hidden');
    entryDiv.querySelector('.ce-numCourts').value = 1;
  } else {
    numCourtsRow.classList.remove('hidden');
  }
}

function updateCourtEntryZoneColors(entryDiv) {
  const courtType = entryDiv.querySelector('.ce-courtType').value;
  const def = courtDefs[courtType];
  const container = entryDiv.querySelector('.zone-colors-row');
  container.innerHTML = '';

  def.zones.forEach((zone, i) => {
    const wrapper = document.createElement('label');
    wrapper.innerHTML = `<span>${zone.name} Color</span>`;
    const sel = document.createElement('select');
    sel.className = 'zone-color-select';
    sel.dataset.zoneIndex = i;
    populateColorOptions(sel);
    if (i === 0) sel.value = 'Light Blue ColorPlus';
    else sel.value = 'Blue ColorPlus';
    sel.addEventListener('change', render);
    wrapper.appendChild(sel);
    container.appendChild(wrapper);
  });
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

// ── Populate product option dropdown ──
// Now considers ALL court entries to build a union of available options
function updateProductOptions() {
  const mixType = $('mixType').value;
  const sel = $('productOption');
  const currentVal = sel.value;

  // Collect all court types in use
  const courtTypesInUse = new Set();
  for (const entry of courtEntries) {
    courtTypesInUse.add(entry.el.querySelector('.ce-courtType').value);
  }

  // Find intersection of product options across all court types
  const mixKey = mixType === 'ready' ? 'ready' : 'concentrate';
  let commonOptions = null;
  for (const ct of courtTypesInUse) {
    const opts = productOptionDefs[ct][mixKey];
    if (commonOptions === null) {
      commonOptions = opts.map(o => ({ ...o }));
    } else {
      // Keep only options that exist in both
      commonOptions = commonOptions.filter(co =>
        opts.some(o => o.value === co.value)
      );
    }
  }
  if (!commonOptions || commonOptions.length === 0) {
    // Fallback: use first court type's options
    const firstCt = courtEntries.length > 0
      ? courtEntries[0].el.querySelector('.ce-courtType').value
      : 'tennis';
    commonOptions = productOptionDefs[firstCt][mixKey];
  }

  sel.innerHTML = '';
  for (const opt of commonOptions) {
    const el = document.createElement('option');
    el.value = opt.value;
    el.textContent = opt.label;
    sel.appendChild(el);
  }

  const stillExists = commonOptions.some(o => o.value === currentVal);
  if (stillExists) {
    sel.value = currentVal;
  }
}

function getInputs() {
  const surfaceType = $('surfaceType').value;
  const packaging = $('packaging').value;
  const mixType = $('mixType').value;
  const productOption = $('productOption').value;
  const cushionSystem = $('cushionSystem').value;

  const entries = courtEntries.map(entry => {
    const el = entry.el;
    const courtType = el.querySelector('.ce-courtType').value;
    const inputMode = el.querySelector('.ce-inputMode').value;
    const value1 = parseFloat(el.querySelector('.ce-value1').value) || 0;
    const value2 = parseFloat(el.querySelector('.ce-value2').value) || 0;
    const numCourts = Math.max(1, parseInt(el.querySelector('.ce-numCourts').value, 10) || 1);
    const colorSelects = el.querySelectorAll('.zone-color-select');
    const zoneColors = Array.from(colorSelects).map(s => s.value);
    return { courtType, inputMode, value1, value2, numCourts, zoneColors };
  });

  return { courtEntries: entries, surfaceType, packaging, mixType, productOption, cushionSystem };
}

function fmt(n) {
  if (typeof n !== 'number' || isNaN(n)) return n;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);
}

function renderCrackFillers() {
  const linearFeet = parseFloat($('crackLinearFeet').value) || 0;
  $('crackBody').innerHTML = crackFillers.map(f => {
    const estGallons = linearFeet > 0 ? Math.ceil(linearFeet / f.minRate) : 0;
    return `
      <tr>
        <td>${f.product}</td>
        <td>${f.rateLabel}</td>
        <td>${f.width}</td>
        <td>${estGallons > 0 ? estGallons + ' Gallon(s)' : '—'}</td>
      </tr>`;
  }).join('');
}

function updateCrackFillerVisibility() {
  const surfaceType = $('surfaceType').value;
  const section = $('crackFillerSection');
  if (surfaceType === 'asphalt') {
    section.classList.add('hidden');
  } else {
    section.classList.remove('hidden');
  }
}

function renderResults(results) {
  // Summary cards
  $('summaryGrid').innerHTML = `
    <article class="summary-item"><span class="label">Courts</span><span class="value">${results.summary.courts}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq ft)</span><span class="value">${fmt(results.summary.totalSqFt)}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq yd)</span><span class="value">${fmt(results.summary.totalSqYd)}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq m)</span><span class="value">${fmt(results.summary.totalSqM)}</span></article>
    <article class="summary-item"><span class="label">Mix Type</span><span class="value">${results.summary.mixType}</span></article>
    <article class="summary-item"><span class="label">Packaging</span><span class="value">${results.summary.packaging}</span></article>
  `;

  // Zone area breakdown
  const zoneAreaRows = results.zoneAreas.map(z => `
    <tr><td>${z.name}</td><td>${fmt(z.sqft)}</td><td>${fmt(z.sqyd)}</td></tr>
  `).join('');
  $('zoneAreasBody').innerHTML = zoneAreaRows || '<tr><td colspan="3">Enter dimensions above</td></tr>';

  // Total Area materials (consolidated)
  $('totalAreaBody').innerHTML = results.totalArea.map(r => `
    <tr>
      <td>${r.product}</td>
      <td>${r.coats}</td>
      <td>${r.gallons}</td>
      <td>${r.packaging}</td>
      <td>${r.item}</td>
    </tr>
  `).join('');

  // Zone products — per-zone breakdown + totals
  let zoneHtml = '';
  if (results.zoneDetails.length > 0) {
    for (const row of results.zoneDetails) {
      zoneHtml += `
        <tr>
          <td>${row.zoneName}</td>
          <td>${row.product}</td>
          <td>${row.coats}</td>
          <td>${row.gallons}</td>
          <td>${row.color !== 'Not Selected' ? row.color : ''}</td>
        </tr>`;
    }
    // Total row
    zoneHtml += `<tr class="zone-header"><td colspan="5">Totals — Packaging Required</td></tr>`;
    for (const t of results.zoneTotals) {
      zoneHtml += `
        <tr>
          <td>${t.product}</td>
          <td colspan="2">${typeof t.gallons === 'number' ? t.gallons + ' Gallons' : t.gallons}</td>
          <td>${t.packaging}</td>
          <td>${t.item}</td>
        </tr>`;
    }
  }
  $('zoneProductsBody').innerHTML = zoneHtml || '<tr><td colspan="5">No zone products</td></tr>';

  // ProCushion — show/hide based on selection
  const cushionSection = $('cushionSection');
  if (results.cushion.length > 0) {
    cushionSection.classList.remove('hidden');
    $('cushionTitle').textContent = 'ProCushion Layers (' + ($('cushionSystem').value === 'premium' ? 'Premium' : 'Standard') + ' System)';
    $('cushionBody').innerHTML = results.cushion.map(item => `
      <tr>
        <td>${item.product}</td>
        <td>${item.coats}</td>
        <td>${item.gallons}</td>
        <td>${item.packaging}</td>
        <td>${item.item}</td>
      </tr>`).join('');
  } else {
    cushionSection.classList.add('hidden');
  }

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
  renderCrackFillers();
  updateCrackFillerVisibility();
}

function renderNote() {
  $('noteText').textContent = 'Make sure to check Industry Standard Courts for proper dimensions and follow ASBA for Overrun requirements.';
}

// ── Initialize ──
function init() {
  renderNote();

  // Create the first court entry
  createCourtEntry();

  // Global setting listeners
  $('mixType').addEventListener('change', () => {
    updateProductOptions();
    render();
  });
  $('productOption').addEventListener('change', render);
  $('cushionSystem').addEventListener('change', render);

  for (const id of ['surfaceType', 'packaging']) {
    $(id).addEventListener('input', render);
    $(id).addEventListener('change', render);
  }

  // Crack filler linear feet input
  $('crackLinearFeet').addEventListener('input', renderCrackFillers);
  $('crackLinearFeet').addEventListener('change', renderCrackFillers);

  // Add Court button
  $('addCourtBtn').addEventListener('click', () => {
    createCourtEntry();
  });
}

init();
