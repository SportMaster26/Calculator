const SQFT_PER_SQYD = 9;
const SQFT_PER_SQM = 10.7639;

const projectTypes = {
  tennis: {
    name: 'Tennis Court',
    dimensions: { width: 36, length: 78 },
    zones: [
      { name: 'Court', ratio: 1, products: ['neutral-concentrate', 'picklemaster-rtu'] },
      { name: 'Service Boxes', ratio: 1200 / 3200, products: ['neutral-concentrate', 'picklemaster'] },
      { name: 'Kitchen Area', ratio: 560 / 3200, products: ['neutral-concentrate', 'picklemaster'] }
    ]
  },
  pickleball: {
    name: 'Pickleball Court',
    dimensions: { width: 30, length: 60 },
    zones: [
      { name: 'Total Area', ratio: 1, products: ['neutral-concentrate', 'picklemaster'] },
      { name: 'Kitchen Area', ratio: 0.22, products: ['picklemaster-rtu', 'blue-colorplus'] }
    ]
  },
  basketball: {
    name: 'Basketball Half Court',
    dimensions: { width: 50, length: 47 },
    zones: [
      { name: 'Court', ratio: 1, products: ['neutral-concentrate', 'picklemaster'] },
      { name: 'Key + Free Throw', ratio: 0.18, products: ['blue-colorplus', 'lightblue-colorplus'] }
    ]
  }
};

const productCatalog = {
  'neutral-concentrate': {
    label: 'Neutral Concentrate w/ Sand',
    item: 'C1365D',
    coveragePerGallon: 100,
    supportsReadyMix: false
  },
  'picklemaster': {
    label: 'PickleMaster',
    item: 'C1298D',
    coveragePerGallon: 100,
    supportsReadyMix: false
  },
  'picklemaster-rtu': {
    label: 'PickleMaster RTU',
    item: 'C1299P',
    coveragePerGallon: 80,
    supportsReadyMix: true
  },
  'blue-colorplus': {
    label: 'Blue ColorPlus',
    item: 'C1384G',
    coveragePerGallon: 400,
    supportsReadyMix: true
  },
  'lightblue-colorplus': {
    label: 'Light Blue ColorPlus',
    item: 'C1385G',
    coveragePerGallon: 400,
    supportsReadyMix: true
  }
};

const crackFillers = [
  {
    product: 'Acrylic Crack Patch',
    linearFeetPerGallon: '75 - 150 ft of cracks',
    width: 'For cracks up to 1\" wide',
    disclaimer: 'Coverage varies depending on crack depth and profile.'
  },
  {
    product: 'CrackMagic',
    linearFeetPerGallon: '75 - 150 ft of cracks',
    width: 'For cracks up to 1/2\" wide',
    disclaimer: 'Coverage varies depending on crack depth and profile.'
  },
  {
    product: 'CourtFlex',
    linearFeetPerGallon: '150 - 200 ft of cracks',
    width: 'For cracks up to 1/2\" wide',
    disclaimer: 'Coverage varies depending on crack depth and profile.'
  }
];

const refs = {
  projectType: document.getElementById('projectType'),
  measurementMode: document.getElementById('measurementMode'),
  areaInputs: document.getElementById('areaInputs'),
  dimensionInputs: document.getElementById('dimensionInputs'),
  areaValue: document.getElementById('areaValue'),
  areaUnit: document.getElementById('areaUnit'),
  widthValue: document.getElementById('widthValue'),
  lengthValue: document.getElementById('lengthValue'),
  dimensionUnit: document.getElementById('dimensionUnit'),
  coats: document.getElementById('coats'),
  packagingType: document.getElementById('packagingType'),
  mixType: document.getElementById('mixType'),
  summary: document.getElementById('summary'),
  resultsBody: document.getElementById('resultsBody'),
  crackBody: document.getElementById('crackBody')
};

function toSqFtFromArea(value, unit) {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (unit === 'sqyd') return value * SQFT_PER_SQYD;
  if (unit === 'sqm') return value * SQFT_PER_SQM;
  return value;
}

function toSqFtFromDimensions(width, length, unit) {
  if (!Number.isFinite(width) || !Number.isFinite(length) || width < 0 || length < 0) return 0;
  const area = width * length;
  if (unit === 'yd') return area * SQFT_PER_SQYD;
  if (unit === 'm') return area * SQFT_PER_SQM;
  return area;
}

function fromSqFt(areaSqFt) {
  return {
    sqft: areaSqFt,
    sqyd: areaSqFt / SQFT_PER_SQYD,
    sqm: areaSqFt / SQFT_PER_SQM
  };
}

function formatNumber(value, max = 2) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: max }).format(value);
}

function computeRows(project, totalSqFt, coats, mixType, packageSize) {
  const rows = [];
  for (const zone of project.zones) {
    const zoneArea = totalSqFt * zone.ratio;
    for (const key of zone.products) {
      const product = productCatalog[key];
      if (!product) continue;
      if (mixType === 'ready' && !product.supportsReadyMix) continue;

      const gallons = (zoneArea * coats) / product.coveragePerGallon;
      const packageCount = Math.ceil(gallons / packageSize);
      rows.push({
        zone: zone.name,
        product: product.label,
        coats,
        coverage: product.coveragePerGallon,
        gallons,
        packageCount,
        packageSize,
        item: product.item
      });
    }
  }
  return rows;
}

function renderCrackFillers() {
  refs.crackBody.innerHTML = crackFillers
    .map(
      (item) => `
        <tr>
          <td>${item.product}</td>
          <td>${item.linearFeetPerGallon}</td>
          <td>${item.width}</td>
          <td>${item.disclaimer}</td>
        </tr>`
    )
    .join('');
}

function render() {
  const project = projectTypes[refs.projectType.value];
  const coats = Math.max(1, parseInt(refs.coats.value, 10) || 1);
  const packageSize = parseInt(refs.packagingType.value, 10);
  const mixType = refs.mixType.value;

  let areaSqFt = 0;
  if (refs.measurementMode.value === 'dimensions') {
    areaSqFt = toSqFtFromDimensions(
      parseFloat(refs.widthValue.value),
      parseFloat(refs.lengthValue.value),
      refs.dimensionUnit.value
    );
  } else {
    areaSqFt = toSqFtFromArea(parseFloat(refs.areaValue.value), refs.areaUnit.value);
  }

  const converted = fromSqFt(areaSqFt);
  const rows = computeRows(project, areaSqFt, coats, mixType, packageSize);

  refs.summary.innerHTML = `
    <article class="summary-item"><span class="label">Project Type</span><span class="value">${project.name}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq ft)</span><span class="value">${formatNumber(converted.sqft)}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq yd)</span><span class="value">${formatNumber(converted.sqyd)}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq m)</span><span class="value">${formatNumber(converted.sqm)}</span></article>
    <article class="summary-item"><span class="label">Number of Coats</span><span class="value">${coats}</span></article>
    <article class="summary-item"><span class="label">Mix Type</span><span class="value">${mixType === 'ready' ? 'Ready Mix' : 'Concentrate'}</span></article>
  `;

  refs.resultsBody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.zone}: ${row.product}</td>
          <td>${row.coats}</td>
          <td>${formatNumber(row.coverage)}</td>
          <td>${formatNumber(row.gallons)}</td>
          <td>${row.packageCount} × ${row.packageSize} gal</td>
          <td>${row.item}</td>
        </tr>`
    )
    .join('');
}

function toggleMode() {
  const isDimensions = refs.measurementMode.value === 'dimensions';
  refs.dimensionInputs.classList.toggle('hidden', !isDimensions);
  refs.areaInputs.classList.toggle('hidden', isDimensions);
  render();
}

function hydrateProjectOptions() {
  refs.projectType.innerHTML = Object.entries(projectTypes)
    .map(([key, project]) => `<option value="${key}">${project.name}</option>`)
    .join('');
}

function hydrateDefaults(projectKey = 'tennis') {
  const selectedProject = projectTypes[projectKey];
  refs.widthValue.value = selectedProject.dimensions.width;
  refs.lengthValue.value = selectedProject.dimensions.length;
}

hydrateProjectOptions();
hydrateDefaults();
renderCrackFillers();
render();

[
  refs.projectType,
  refs.measurementMode,
  refs.areaValue,
  refs.areaUnit,
  refs.widthValue,
  refs.lengthValue,
  refs.dimensionUnit,
  refs.coats,
  refs.packagingType,
  refs.mixType
].forEach((el) => {
  el.addEventListener('input', render);
  el.addEventListener('change', render);
});

refs.measurementMode.addEventListener('change', toggleMode);
refs.projectType.addEventListener('change', () => {
  hydrateDefaults(refs.projectType.value);
  render();
});
