(function () {
  const $ = (id) => document.getElementById(id);

  const fields = {
    ote: $('ote'),
    salary: $('salary'),
    otv: $('otv'),
    narrQuota: $('narr-quota'),
    pcr: $('pcr'),
    narrQuotaCredit: $('narr-quota-credit'),
    narrAttainment: $('narr-attainment'),
    newLogoUplift: $('new-logo-uplift'),
    multiYearUplift: $('multi-year-uplift'),
    acceleratedPcr: $('accelerated-pcr'),
    rarrRate: $('rarr-rate'),
    iarr: $('iarr'),
    renewedArr: $('renewed-arr'),
    carr: $('carr'),
    newModuleArr: $('new-module-arr'),
    // Dual-measure fields
    l3NarrQuota: $('l3-narr-quota'),
    l3NarrQuotaCredit: $('l3-narr-quota-credit'),
    l3Attainment: $('l3-attainment'),
    l3Pcr: $('l3-pcr'),
    l2NarrQuota: $('l2-narr-quota'),
    l2NarrQuotaCredit: $('l2-narr-quota-credit'),
    l2Attainment: $('l2-attainment'),
    l2Pcr: $('l2-pcr'),
    l3NewLogoUplift: $('l3-new-logo-uplift'),
    l3MultiYearUplift: $('l3-multi-year-uplift'),
    l2NewLogoUplift: $('l2-new-logo-uplift'),
    l2MultiYearUplift: $('l2-multi-year-uplift'),
    l3AcceleratedPcr: $('l3-accelerated-pcr'),
    l2AcceleratedPcr: $('l2-accelerated-pcr')
  };

  const teamSelect = $('team-select');
  const rarrRateField = $('rarr-rate-field');
  const multiYearField = $('multi-year-field');
  const psaPendingNote = $('psa-pending-note');
  const dualMeasureToggleField = $('dual-measure-toggle-field');

  const newLogoToggle = $('new-logo-toggle');
  const newLogoLabel = $('new-logo-label');
  const multiYearToggle = $('multi-year-toggle');
  const multiYearLabel = $('multi-year-label');
  const dualMeasureToggle = $('dual-measure-toggle');
  const dualMeasureLabel = $('dual-measure-label');
  const l3RegionToggle = $('l3-region-toggle');
  const l3RegionLabel = $('l3-region-label');
  const resultsEl = $('results');
  const appEl = document.querySelector('.app');
  const inputPanels = document.querySelector('.input-panels');

  let currentTeam = 'custom';
  let multiYearDisabled = false;
  let dualMeasureActive = false;
  let dualMeasureLocked = false;
  let settingsLoaded = false;

  function saveSettings() {
    if (!settingsLoaded || !window.appSettings) return;
    const data = {
      team: currentTeam,
      ote: fields.ote.value,
      narrQuota: fields.narrQuota.value,
      narrQuotaCredit: fields.narrQuotaCredit.value
    };
    if (dualMeasureActive) {
      data.l3NarrQuota = fields.l3NarrQuota.value;
      data.l2NarrQuota = fields.l2NarrQuota.value;
      data.l3NarrQuotaCredit = fields.l3NarrQuotaCredit.value;
      data.l2NarrQuotaCredit = fields.l2NarrQuotaCredit.value;
    }
    window.appSettings.save(data);
  }

  async function loadSettings() {
    if (!window.appSettings) { settingsLoaded = true; return; }
    try {
      const s = await window.appSettings.load();
      if (s.team && s.team !== 'custom') {
        applyTeamPreset(s.team);
      }
      if (s.ote) { fields.ote.value = s.ote; }
      if (s.narrQuota) { fields.narrQuota.value = s.narrQuota; }
      if (s.narrQuotaCredit) { fields.narrQuotaCredit.value = s.narrQuotaCredit; }
      if (s.l3NarrQuota) { fields.l3NarrQuota.value = s.l3NarrQuota; }
      if (s.l2NarrQuota) { fields.l2NarrQuota.value = s.l2NarrQuota; }
      if (s.l3NarrQuotaCredit) { fields.l3NarrQuotaCredit.value = s.l3NarrQuotaCredit; }
      if (s.l2NarrQuotaCredit) { fields.l2NarrQuotaCredit.value = s.l2NarrQuotaCredit; }
      settingsLoaded = true;
      recalculate();
    } catch (e) {
      settingsLoaded = true;
    }
  }

  const newLogoUpliftTooltip = fields.newLogoUplift.closest('.field').querySelector('.tooltip-content');
  const defaultNlTooltip = 'Additive modifier applied when the deal is a new logo (no existing contract). Only applies when New Logo toggle is on.';
  const mspNlTooltip = 'For PSA-MSP, "New Logo Uplift" corresponds to the "MSP NARR" accelerator in the comp plan. Only applies when New Logo toggle is on.';

  function parseCurrency(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/[^0-9.\-]/g, '')) || 0;
  }

  function parseRate(str) {
    if (!str) return 0;
    return parseFloat(str) || 0;
  }

  function formatCurrency(val) {
    if (val === 0) return '0';
    const abs = Math.abs(val);
    if (abs >= 1) {
      return val.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
    }
    return val.toString();
  }

  function formatDollars(val) {
    if (val < 0) return '-$' + formatCurrency(Math.abs(val));
    return '$' + formatCurrency(val);
  }

  function formatPercent(val) {
    return (val * 100).toFixed(2) + '%';
  }

  function formatRate(val) {
    return val.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  }

  function formatRateAsPercent(val) {
    return (val * 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + '%';
  }

  function setCurrencyDisplay(input, val) {
    input.value = formatCurrency(val);
  }

  function handleCurrencyInput(e) {
    const input = e.target;
    const raw = input.value.replace(/[^0-9.\-]/g, '');
    const pos = input.selectionStart;
    const oldLen = input.value.length;

    if (raw === '' || raw === '-' || raw === '.') {
      recalculate();
      return;
    }

    const num = parseFloat(raw);
    if (isNaN(num)) return;

    input.value = formatCurrency(num);
    const newLen = input.value.length;
    const newPos = Math.max(0, pos + (newLen - oldLen));
    input.setSelectionRange(newPos, newPos);

    recalculate();
  }

  function setDualMeasureMode(active) {
    dualMeasureActive = active;
    if (active) {
      inputPanels.classList.add('dual-measure-active');
    } else {
      inputPanels.classList.remove('dual-measure-active');
    }
  }

  function applyTeamPreset(teamKey) {
    const preset = TEAM_PRESETS[teamKey];
    if (!preset) return;

    currentTeam = teamKey;
    teamSelect.value = teamKey;
    fields.newLogoUplift.value = preset.newLogoUplift;
    fields.multiYearUplift.value = preset.multiYearUplift;
    fields.acceleratedPcr.value = preset.acceleratedPcr;

    multiYearDisabled = preset.disableMultiYear;
    if (multiYearDisabled) {
      multiYearToggle.classList.remove('active');
      multiYearToggle.setAttribute('aria-checked', 'false');
      multiYearLabel.textContent = 'N/A';
      multiYearToggle.classList.add('disabled');
      multiYearField.classList.add('field-disabled');
    } else {
      multiYearToggle.classList.remove('disabled');
      multiYearField.classList.remove('field-disabled');
      if (!multiYearToggle.classList.contains('active')) {
        multiYearLabel.textContent = 'No';
      }
    }

    if (preset.latamMode) {
      rarrRateField.classList.remove('field-hidden');
      fields.rarrRate.value = preset.rarrRate || 0.001;
    } else {
      rarrRateField.classList.add('field-hidden');
    }

    if (preset.psaPending) {
      psaPendingNote.classList.remove('field-hidden');
    } else {
      psaPendingNote.classList.add('field-hidden');
    }

    // Dual-measure handling
    if (preset.dualMeasure) {
      setDualMeasureMode(true);
      dualMeasureLocked = true;
      dualMeasureToggle.classList.add('active');
      dualMeasureToggle.setAttribute('aria-checked', 'true');
      dualMeasureToggle.classList.add('disabled');
      dualMeasureLabel.textContent = 'On';
      dualMeasureToggleField.classList.remove('field-hidden');

      fields.l3NewLogoUplift.value = preset.l3NewLogoUplift;
      fields.l3MultiYearUplift.value = preset.l3MultiYearUplift;
      fields.l2NewLogoUplift.value = preset.l2NewLogoUplift;
      fields.l2MultiYearUplift.value = preset.l2MultiYearUplift;
      fields.l3AcceleratedPcr.value = preset.l3AcceleratedPcr;
      fields.l2AcceleratedPcr.value = preset.l2AcceleratedPcr;
    } else if (teamKey === 'custom') {
      // Custom: show toggle, let user control it
      dualMeasureLocked = false;
      dualMeasureToggle.classList.remove('disabled');
      dualMeasureToggleField.classList.remove('field-hidden');
      // Don't change the active state — let it persist
    } else {
      // Single-measure preset: force off and hide toggle
      setDualMeasureMode(false);
      dualMeasureLocked = true;
      dualMeasureToggle.classList.remove('active');
      dualMeasureToggle.setAttribute('aria-checked', 'false');
      dualMeasureToggle.classList.add('disabled');
      dualMeasureLabel.textContent = 'Off';
      dualMeasureToggleField.classList.add('field-hidden');
    }

    newLogoUpliftTooltip.textContent = teamKey === 'psa-msp' ? mspNlTooltip : defaultNlTooltip;
  }

  function checkTeamModified() {
    if (currentTeam === 'custom') return;
    const preset = TEAM_PRESETS[currentTeam];
    if (!preset) return;

    if (dualMeasureActive && preset.dualMeasure) {
      const l3nl = parseRate(fields.l3NewLogoUplift.value);
      const l3my = parseRate(fields.l3MultiYearUplift.value);
      const l3ap = parseRate(fields.l3AcceleratedPcr.value);
      const l2nl = parseRate(fields.l2NewLogoUplift.value);
      const l2my = parseRate(fields.l2MultiYearUplift.value);
      const l2ap = parseRate(fields.l2AcceleratedPcr.value);
      if (l3nl !== preset.l3NewLogoUplift || l3my !== preset.l3MultiYearUplift ||
          l3ap !== preset.l3AcceleratedPcr ||
          l2nl !== preset.l2NewLogoUplift || l2my !== preset.l2MultiYearUplift ||
          l2ap !== preset.l2AcceleratedPcr) {
        switchToCustom();
      }
    } else {
      const nl = parseRate(fields.newLogoUplift.value);
      const my = parseRate(fields.multiYearUplift.value);
      const ap = parseRate(fields.acceleratedPcr.value);
      if (nl !== preset.newLogoUplift || my !== preset.multiYearUplift || ap !== preset.acceleratedPcr) {
        switchToCustom();
      }
    }
  }

  function switchToCustom() {
    currentTeam = 'custom';
    teamSelect.value = 'custom';
    dualMeasureLocked = false;
    dualMeasureToggle.classList.remove('disabled');
    dualMeasureToggleField.classList.remove('field-hidden');
  }

  function isLatamMode() {
    const preset = TEAM_PRESETS[currentTeam];
    return preset && preset.latamMode;
  }

  function getInputs() {
    const base = {
      ote: parseCurrency(fields.ote.value),
      iarr: parseCurrency(fields.iarr.value),
      renewedArr: parseCurrency(fields.renewedArr.value),
      carr: parseCurrency(fields.carr.value),
      newModuleArr: parseCurrency(fields.newModuleArr.value),
      newLogoDeal: newLogoToggle.classList.contains('active'),
      multiYearDeal: !multiYearDisabled && multiYearToggle.classList.contains('active')
    };

    if (dualMeasureActive) {
      return Object.assign(base, {
        dualMeasure: true,
        l3NarrQuota: parseCurrency(fields.l3NarrQuota.value),
        l2NarrQuota: parseCurrency(fields.l2NarrQuota.value),
        l3NarrQuotaCredit: parseCurrency(fields.l3NarrQuotaCredit.value),
        l2NarrQuotaCredit: parseCurrency(fields.l2NarrQuotaCredit.value),
        l3NewLogoUplift: parseRate(fields.l3NewLogoUplift.value),
        l3MultiYearUplift: parseRate(fields.l3MultiYearUplift.value),
        l2NewLogoUplift: parseRate(fields.l2NewLogoUplift.value),
        l2MultiYearUplift: parseRate(fields.l2MultiYearUplift.value),
        l3AcceleratedPcr: parseRate(fields.l3AcceleratedPcr.value),
        l2AcceleratedPcr: parseRate(fields.l2AcceleratedPcr.value),
        dealInL3: l3RegionToggle.classList.contains('active')
      });
    }

    return Object.assign(base, {
      dualMeasure: false,
      narrQuota: parseCurrency(fields.narrQuota.value),
      narrQuotaCredit: parseCurrency(fields.narrQuotaCredit.value),
      newLogoUplift: parseRate(fields.newLogoUplift.value),
      multiYearUplift: parseRate(fields.multiYearUplift.value),
      acceleratedPcr: parseRate(fields.acceleratedPcr.value),
      rarrRate: parseRate(fields.rarrRate.value),
      latamMode: isLatamMode()
    });
  }

  function recalculate() {
    const inputs = getInputs();

    if (inputs.dualMeasure) {
      recalculateDualMeasure(inputs);
    } else {
      recalculateSingleMeasure(inputs);
    }
  }

  function recalculateSingleMeasure(inputs) {
    const r = calculateCompensation(inputs);

    setCurrencyDisplay(fields.salary, r.salary);
    setCurrencyDisplay(fields.otv, r.otv);
    fields.pcr.value = inputs.narrQuota > 0 ? formatRate(r.pcr) : '';
    fields.narrAttainment.value = inputs.narrQuota > 0
      ? (r.narrQuotaAttainment * 100).toFixed(2)
      : '';

    renderResults(r, inputs);
  }

  function recalculateDualMeasure(inputs) {
    const r = calculateDualMeasureCompensation(inputs);

    setCurrencyDisplay(fields.salary, r.salary);
    setCurrencyDisplay(fields.otv, r.otv);
    fields.l3Pcr.value = inputs.l3NarrQuota > 0 ? formatRate(r.l3Pcr) : '';
    fields.l2Pcr.value = inputs.l2NarrQuota > 0 ? formatRate(r.l2Pcr) : '';
    fields.l3Attainment.value = inputs.l3NarrQuota > 0
      ? (r.l2 ? (inputs.l3NarrQuotaCredit / inputs.l3NarrQuota * 100).toFixed(2) : '')
      : '';
    fields.l2Attainment.value = inputs.l2NarrQuota > 0
      ? (inputs.l2NarrQuotaCredit / inputs.l2NarrQuota * 100).toFixed(2)
      : '';

    // Use l3 attainment value from inputs directly
    if (inputs.l3NarrQuota > 0) {
      fields.l3Attainment.value = (inputs.l3NarrQuotaCredit / inputs.l3NarrQuota * 100).toFixed(2);
    } else {
      fields.l3Attainment.value = '';
    }

    renderDualMeasureResults(r, inputs);
  }

  function buildRateLabel(r, inputs) {
    let parts = ['PCR'];
    if (r.newLogoDeal) parts.push('New Logo');
    if (r.multiYearDeal) parts.push('Multi-Year');
    return parts.join(' + ');
  }

  function buildMeasureRateLabel(prefix, newLogoDeal, multiYearDeal) {
    let parts = [prefix + ' PCR'];
    if (newLogoDeal) parts.push(prefix + ' New Logo');
    if (multiYearDeal) parts.push(prefix + ' Multi-Year');
    return parts.join(' + ');
  }

  function renderMeasureSection(measure, label, sublabel, inputs, dealNarr) {
    if (!measure) return '';
    let html = '';

    html += `<div class="result-measure-section">`;
    html += `<div class="result-measure-title">${label} (${sublabel})</div>`;

    html += resultRow('Pre-Deal Attainment', formatPercent(measure.narrQuotaAttainment));
    html += resultRow('Post-Deal Attainment', formatPercent(measure.postDealAttainment));

    const rateLabel = buildMeasureRateLabel(label, inputs.newLogoDeal, inputs.multiYearDeal);

    html += resultRow('Base Rate', formatRateAsPercent(measure.baseRate));
    html += `<div class="rate-breakdown">${rateLabel}</div>`;

    if (measure.straddlesThreshold) {
      const accelLabel = rateLabel + ' + ' + label + ' Accelerated PCR';
      html += resultRow('Accelerated Rate', formatRateAsPercent(measure.acceleratedRate));
      html += `<div class="rate-breakdown">${accelLabel}</div>`;
    }

    if (dealNarr <= 0) {
      html += resultRow('Commission', '$0.00', 'zero');
    } else if (measure.straddlesThreshold) {
      if (measure.narrBelow > 0) {
        html += resultRow('NARR Below 100%', formatDollars(measure.narrBelow));
        html += resultRow('Commission Below 100%', formatDollars(measure.commissionBelow));
        html += `<div class="rate-breakdown">${formatDollars(measure.narrBelow)} × ${formatRateAsPercent(measure.baseRate)}</div>`;
      }
      html += resultRow('NARR Above 100%', formatDollars(measure.narrAbove));
      html += resultRow('Accelerated Commission', formatDollars(measure.commissionAbove));
      html += `<div class="rate-breakdown">${formatDollars(measure.narrAbove)} × ${formatRateAsPercent(measure.acceleratedRate)}</div>`;
      html += `<div class="result-divider"></div>`;
      html += resultRow('Commission', formatDollars(measure.commission), 'positive');
    } else {
      html += resultRow('NARR at Base Rate', formatDollars(measure.narrBelow));
      html += resultRow('Commission', formatDollars(measure.commissionBelow));
      html += `<div class="rate-breakdown">${formatDollars(measure.narrBelow)} × ${formatRateAsPercent(measure.baseRate)}</div>`;
    }

    html += `</div>`;
    return html;
  }

  function renderDualMeasureResults(r, inputs) {
    const hasQuota = inputs.l3NarrQuota > 0 || inputs.l2NarrQuota > 0;
    if (!inputs.ote || !hasQuota) {
      resultsEl.innerHTML = '<div class="results-empty">Enter OTE, L3/L2 NARR Quotas, and deal details to see results.</div>';
      return;
    }

    const dealNarr = r.narrQuotaRetirement;
    let html = '';

    // Deal Metrics
    html += `<div class="result-group">`;
    html += `<div class="result-group-title">Deal Metrics</div>`;
    html += resultRow('Day 1 ARR', formatDollars(r.day1Arr));
    html += resultRow('NARR Quota Retirement', formatDollars(r.narrQuotaRetirement), r.narrQuotaRetirement < 0 ? 'negative' : '');
    if (inputs.carr > 0) {
      html += resultRow('CARR (informational)', formatDollars(r.carr), 'zero');
      html += `<div class="result-note">CARR is displayed for context only and is not used in the NARR calculation.</div>`;
    }
    html += `</div>`;

    // L3 section (only if deal is within L3)
    if (r.dealInL3 && r.l3) {
      html += renderMeasureSection(r.l3, 'L3', 'Regional', inputs, dealNarr);
    }

    // L2 section (always)
    html += renderMeasureSection(r.l2, 'L2', 'Geo', inputs, dealNarr);

    // Total
    if (r.totalCommission > 0) {
      html += `<div class="result-group">`;
      html += `<div class="result-group-title">Total</div>`;
      if (r.dealInL3 && r.l3) {
        html += resultRow('L3 Commission', formatDollars(r.l3.commission));
        html += resultRow('L2 Commission', formatDollars(r.l2.commission));
        html += `<div class="result-divider"></div>`;
      }
      html += resultRow('Total Deal Commission', formatDollars(r.totalCommission), 'positive', true);
      html += `</div>`;
    } else if (dealNarr <= 0) {
      html += `<div class="result-group">`;
      html += `<div class="result-group-title">Total</div>`;
      html += resultRow('Total Deal Commission', '$0.00', 'zero');
      if (dealNarr < 0) {
        html += `<div class="result-note">Negative NARR — no commission earned on this deal.</div>`;
      } else {
        html += `<div class="result-note">No NARR on this deal — no commission earned.</div>`;
      }
      html += `</div>`;
    }

    // OTV Impact
    if (r.totalCommission > 0) {
      html += `<div class="result-group">`;
      html += `<div class="result-group-title">OTV Impact</div>`;
      html += resultRow('OTV Attainment from Deal', formatPercent(r.otvAttainment));
      html += `</div>`;
    }

    resultsEl.innerHTML = html;
  }

  function renderResults(r, inputs) {
    if (!inputs.ote || !inputs.narrQuota) {
      resultsEl.innerHTML = '<div class="results-empty">Enter OTE, NARR Quota, and deal details to see results.</div>';
      return;
    }

    const hasNarr = r.narrQuotaRetirement > 0;
    const rateLabel = buildRateLabel(r, inputs);

    let html = '';

    // Deal Metrics
    html += `<div class="result-group">`;
    html += `<div class="result-group-title">Deal Metrics</div>`;
    html += resultRow('Day 1 ARR', formatDollars(r.day1Arr));
    html += resultRow('NARR Quota Retirement', formatDollars(r.narrQuotaRetirement), r.narrQuotaRetirement < 0 ? 'negative' : '');
    if (inputs.carr > 0) {
      html += resultRow('CARR (informational)', formatDollars(r.carr), 'zero');
      html += `<div class="result-note">CARR is displayed for context only and is not used in the NARR calculation.</div>`;
    }
    html += `</div>`;

    // Attainment
    html += `<div class="result-group">`;
    html += `<div class="result-group-title">Quota Attainment</div>`;
    html += resultRow('Pre-Deal Attainment', formatPercent(r.narrQuotaAttainment));
    html += resultRow('Post-Deal Attainment', formatPercent(r.postDealAttainment));
    html += `</div>`;

    // Commission Rates
    html += `<div class="result-group">`;
    html += `<div class="result-group-title">Commission Rates</div>`;
    html += resultRow('Base Rate', formatRateAsPercent(r.baseRate));
    html += `<div class="rate-breakdown">${rateLabel}</div>`;
    if (r.straddlesThreshold) {
      let accelLabel = rateLabel + ' + Accelerated PCR';
      html += resultRow('Accelerated Rate', formatRateAsPercent(r.acceleratedRate));
      html += `<div class="rate-breakdown">${accelLabel}</div>`;
    }
    html += `</div>`;

    // Commission Calculation
    html += `<div class="result-group">`;
    html += `<div class="result-group-title">Commission Calculation</div>`;

    if (!hasNarr) {
      html += resultRow('NARR Commission', '$0.00', 'zero');
      if (r.narrQuotaRetirement < 0) {
        html += `<div class="result-note">Negative NARR — no commission earned on this deal.</div>`;
      } else {
        html += `<div class="result-note">No NARR on this deal — no commission earned.</div>`;
      }
    } else if (r.straddlesThreshold) {
      if (r.narrBelow > 0) {
        html += resultRow('NARR Below 100%', formatDollars(r.narrBelow));
        html += resultRow('Commission Below 100%', formatDollars(r.commissionBelow));
        html += `<div class="rate-breakdown">${formatDollars(r.narrBelow)} × ${formatRateAsPercent(r.baseRate)}</div>`;
      }
      html += resultRow('NARR Above 100%', formatDollars(r.narrAbove));
      html += resultRow('Accelerated Commission', formatDollars(r.commissionAbove));
      html += `<div class="rate-breakdown">${formatDollars(r.narrAbove)} × ${formatRateAsPercent(r.acceleratedRate)}</div>`;
      html += `<div class="result-divider"></div>`;
      html += resultRow('NARR Commission', formatDollars(r.narrCommission), 'positive');
    } else {
      html += resultRow('NARR at Base Rate', formatDollars(r.narrBelow));
      html += resultRow('Commission', formatDollars(r.commissionBelow));
      html += `<div class="rate-breakdown">${formatDollars(r.narrBelow)} × ${formatRateAsPercent(r.baseRate)}</div>`;
    }

    // LaTam RARR commission
    if (r.latamMode && inputs.renewedArr > 0) {
      html += `<div class="result-divider"></div>`;
      html += resultRow('RARR Commission', formatDollars(r.rarrCommission), r.rarrCommission > 0 ? 'positive' : '');
      html += `<div class="rate-breakdown">${formatDollars(inputs.renewedArr)} × ${formatRateAsPercent(inputs.rarrRate)}</div>`;
    }

    // Total
    if (hasNarr || (r.latamMode && r.rarrCommission > 0)) {
      html += `<div class="result-divider"></div>`;
      html += resultRow('Total Deal Commission', formatDollars(r.totalCommission), 'positive', true);
    }

    html += `</div>`;

    // OTV Impact
    if (r.totalCommission > 0) {
      html += `<div class="result-group">`;
      html += `<div class="result-group-title">OTV Impact</div>`;
      html += resultRow('OTV Attainment from Deal', formatPercent(r.otvAttainment));
      html += `</div>`;
    }

    resultsEl.innerHTML = html;
  }

  function resultRow(label, value, valueClass, highlight) {
    const cls = highlight ? ' highlight' : '';
    const vCls = valueClass ? ` ${valueClass}` : '';
    return `<div class="result-row${cls}">
      <span class="result-label">${label}</span>
      <span class="result-value${vCls}">${value}</span>
    </div>`;
  }

  const dmPersistedFields = new Set([
    fields.l3NarrQuota, fields.l2NarrQuota,
    fields.l3NarrQuotaCredit, fields.l2NarrQuotaCredit
  ]);
  const persistedFields = new Set([fields.ote, fields.narrQuota, fields.narrQuotaCredit]);

  // Event: currency fields
  document.querySelectorAll('[data-currency]').forEach(input => {
    input.addEventListener('input', function (e) {
      handleCurrencyInput(e);
      if (persistedFields.has(this) || dmPersistedFields.has(this)) saveSettings();
    });
    input.addEventListener('focus', function () {
      const val = parseCurrency(this.value);
      if (val === 0 && this.value === '0') {
        this.select();
      }
    });
  });

  // Event: single-measure rate fields
  [fields.newLogoUplift, fields.multiYearUplift, fields.acceleratedPcr, fields.rarrRate].forEach(input => {
    input.addEventListener('input', function () {
      checkTeamModified();
      recalculate();
      saveSettings();
    });
  });

  // Event: dual-measure rate fields
  [fields.l3NewLogoUplift, fields.l3MultiYearUplift, fields.l3AcceleratedPcr, fields.l2NewLogoUplift, fields.l2MultiYearUplift, fields.l2AcceleratedPcr].forEach(input => {
    input.addEventListener('input', function () {
      checkTeamModified();
      recalculate();
      saveSettings();
    });
  });

  // Event: OTE
  fields.ote.addEventListener('input', function (e) {
    handleCurrencyInput(e);
    saveSettings();
  });

  // Event: team selector
  teamSelect.addEventListener('change', function () {
    applyTeamPreset(this.value);
    recalculate();
    saveSettings();
  });

  // Toggle helper
  function setupToggle(toggleEl, labelEl, onChange) {
    toggleEl.addEventListener('click', function () {
      if (this.classList.contains('disabled')) return;
      const active = !this.classList.contains('active');
      this.classList.toggle('active', active);
      this.setAttribute('aria-checked', active);
      labelEl.textContent = active ? 'Yes' : 'No';
      if (onChange) onChange(active);
      recalculate();
    });
    toggleEl.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.click();
      }
    });
  }

  setupToggle(newLogoToggle, newLogoLabel);
  setupToggle(multiYearToggle, multiYearLabel);
  setupToggle(l3RegionToggle, l3RegionLabel);

  // Dual-measure toggle
  dualMeasureToggle.addEventListener('click', function () {
    if (this.classList.contains('disabled')) return;
    const active = !this.classList.contains('active');
    this.classList.toggle('active', active);
    this.setAttribute('aria-checked', active);
    dualMeasureLabel.textContent = active ? 'On' : 'Off';
    setDualMeasureMode(active);
    recalculate();
    saveSettings();
  });
  dualMeasureToggle.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.click();
    }
  });

  // Event: scenarios
  document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const scenario = SCENARIOS[this.dataset.scenario];
      if (!scenario) return;
      const v = scenario.values;

      if (!dualMeasureActive) {
        setCurrencyDisplay(fields.ote, v.ote);
        setCurrencyDisplay(fields.narrQuota, v.narrQuota);
        setCurrencyDisplay(fields.narrQuotaCredit, v.narrQuotaCredit);
      } else {
        setCurrencyDisplay(fields.ote, v.ote);
      }
      setCurrencyDisplay(fields.iarr, v.iarr);
      setCurrencyDisplay(fields.renewedArr, v.renewedArr);
      setCurrencyDisplay(fields.carr, v.carr);
      setCurrencyDisplay(fields.newModuleArr, v.newModuleArr);

      newLogoToggle.classList.toggle('active', v.newLogoDeal);
      newLogoToggle.setAttribute('aria-checked', v.newLogoDeal);
      newLogoLabel.textContent = v.newLogoDeal ? 'Yes' : 'No';

      if (!multiYearDisabled) {
        multiYearToggle.classList.toggle('active', v.multiYearDeal);
        multiYearToggle.setAttribute('aria-checked', v.multiYearDeal);
        multiYearLabel.textContent = v.multiYearDeal ? 'Yes' : 'No';
      }

      recalculate();
    });
  });

  // Event: reset
  $('btn-reset').addEventListener('click', function () {
    currentTeam = 'custom';
    teamSelect.value = 'custom';
    multiYearDisabled = false;
    multiYearToggle.classList.remove('disabled');
    multiYearField.classList.remove('field-disabled');
    rarrRateField.classList.add('field-hidden');
    psaPendingNote.classList.add('field-hidden');

    // Disable dual-measure
    setDualMeasureMode(false);
    dualMeasureLocked = false;
    dualMeasureToggle.classList.remove('active', 'disabled');
    dualMeasureToggle.setAttribute('aria-checked', 'false');
    dualMeasureLabel.textContent = 'Off';
    dualMeasureToggleField.classList.remove('field-hidden');

    fields.ote.value = '';
    fields.narrQuota.value = '';
    fields.narrQuotaCredit.value = '';
    fields.newLogoUplift.value = '0.0005';
    fields.multiYearUplift.value = '0.0005';
    fields.acceleratedPcr.value = '0.0025';
    fields.rarrRate.value = '0.001';
    fields.iarr.value = '0';
    fields.renewedArr.value = '0';
    fields.carr.value = '0';
    fields.newModuleArr.value = '';

    // Reset dual-measure fields
    fields.l3NarrQuota.value = '';
    fields.l2NarrQuota.value = '';
    fields.l3NarrQuotaCredit.value = '';
    fields.l2NarrQuotaCredit.value = '';
    fields.l3Attainment.value = '';
    fields.l2Attainment.value = '';
    fields.l3Pcr.value = '';
    fields.l2Pcr.value = '';
    fields.l3NewLogoUplift.value = '0.00045';
    fields.l3MultiYearUplift.value = '0.00045';
    fields.l2NewLogoUplift.value = '0.00005';
    fields.l2MultiYearUplift.value = '0.00005';
    fields.l3AcceleratedPcr.value = '0.002';
    fields.l2AcceleratedPcr.value = '0.0005';

    // Reset L3 region toggle to default (on)
    l3RegionToggle.classList.add('active');
    l3RegionToggle.setAttribute('aria-checked', 'true');
    l3RegionLabel.textContent = 'Yes';

    newLogoToggle.classList.remove('active');
    newLogoToggle.setAttribute('aria-checked', false);
    newLogoLabel.textContent = 'No';

    multiYearToggle.classList.remove('active');
    multiYearToggle.setAttribute('aria-checked', false);
    multiYearLabel.textContent = 'No';

    fields.salary.value = '';
    fields.otv.value = '';
    fields.pcr.value = '';
    fields.narrAttainment.value = '';

    resultsEl.innerHTML = '<div class="results-empty">Enter OTE, NARR Quota, and deal details to see results.</div>';
  });

  // Tooltips: position with fixed so they escape overflow containers
  document.querySelectorAll('.tooltip-trigger').forEach(trigger => {
    const tip = trigger.querySelector('.tooltip-content');
    if (!tip) return;

    trigger.addEventListener('mouseenter', function () {
      const rect = this.getBoundingClientRect();
      const tipWidth = 240;
      const gap = 8;

      tip.style.display = 'block';
      tip.classList.remove('arrow-down', 'arrow-up');

      let left = rect.left + rect.width / 2 - tipWidth / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - tipWidth - 8));
      tip.style.left = left + 'px';

      const tipHeight = tip.offsetHeight;
      if (rect.top - tipHeight - gap >= 0) {
        tip.style.top = (rect.top - tipHeight - gap) + 'px';
        tip.classList.add('arrow-down');
      } else {
        tip.style.top = (rect.bottom + gap) + 'px';
        tip.classList.add('arrow-up');
      }
    });

    trigger.addEventListener('mouseleave', function () {
      tip.style.display = 'none';
    });
  });

  loadSettings();
})();
