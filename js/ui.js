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
  const customLabelsRow = $('custom-labels-row');
  const primaryLabelInput = $('primary-label-input');
  const secondaryLabelInput = $('secondary-label-input');
  const primarySplitInput = $('primary-split-input');
  const secondarySplitInput = $('secondary-split-input');
  const l3RegionToggleLabelEl = $('l3-region-toggle-label');
  const l3RegionTooltip = $('l3-region-tooltip');
  const newLogoFieldLabel = document.querySelector('#new-logo-toggle').closest('.field').querySelector('.field-label');

  const btnCopy = $('btn-copy');
  const btnExportPdf = $('btn-export-pdf');
  const copyToast = $('copy-toast');
  const obfuscateToggle = $('obfuscate-toggle');

  // Deal B fields (comparison mode)
  const dealBSection = $('deal-b-section');
  const dealBFields = {
    iarr: $('b-iarr'),
    renewedArr: $('b-renewed-arr'),
    carr: $('b-carr'),
    newModuleArr: $('b-new-module-arr')
  };
  const bNewLogoToggle = $('b-new-logo-toggle');
  const bNewLogoLabel = $('b-new-logo-label');
  const bMultiYearToggle = $('b-multi-year-toggle');
  const bMultiYearLabel = $('b-multi-year-label');
  const bMultiYearField = $('b-multi-year-field');
  const bL3RegionToggle = $('b-l3-region-toggle');
  const bL3RegionLabel = $('b-l3-region-label');
  const bL3RegionToggleLabelEl = $('b-l3-region-toggle-label');
  const btnCompare = $('btn-compare');
  const dealASection = document.querySelectorAll('.input-panels > .section')[2]; // Deal Details section

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
  let appVersion = '';
  let comparisonMode = false;
  let annualMode = false;
  let pipelineMode = false;
  let deals = [];
  let nextDealId = 2;
  let currentPrimaryLabel = 'L3';
  let currentSecondaryLabel = 'L2';
  let currentPrimarySplit = 0.80;
  let currentSecondarySplit = 0.20;

  // Annual mode elements
  const annualAttainmentSlider = $('annual-attainment-slider');
  const annualAttainmentInput = $('annual-attainment-input');
  const annualTotalNarr = $('annual-total-narr');
  const annualL3AttainmentSlider = $('annual-l3-attainment-slider');
  const annualL3AttainmentInput = $('annual-l3-attainment-input');
  const annualL2AttainmentSlider = $('annual-l2-attainment-slider');
  const annualL2AttainmentInput = $('annual-l2-attainment-input');
  const annualL3TotalNarr = $('annual-l3-total-narr');
  const annualL2TotalNarr = $('annual-l2-total-narr');
  const annualNlPctSlider = $('annual-nl-pct-slider');
  const annualNlPctInput = $('annual-nl-pct-input');
  const annualMyPctSlider = $('annual-my-pct-slider');
  const annualMyPctInput = $('annual-my-pct-input');
  const annualMyPctField = $('annual-my-pct-field');
  const annualRenewedArrField = $('annual-renewed-arr-field');
  const annualRenewedArr = $('annual-renewed-arr');

  function saveSettings() {
    if (!settingsLoaded) return;
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
      data.l3TargetAttainment = annualL3AttainmentInput.value;
      data.l2TargetAttainment = annualL2AttainmentInput.value;
    }
    // Annual mode fields (always save regardless of mode)
    data.targetAttainment = annualAttainmentInput.value;
    data.newLogoPct = annualNlPctInput.value;
    data.multiYearPct = annualMyPctInput.value;
    data.totalRenewedArr = annualRenewedArr.value;
    WebSettings.save(data);
  }

  function loadSettings() {
    try {
      const s = WebSettings.load();
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
      // Annual mode fields
      if (s.targetAttainment) { annualAttainmentInput.value = s.targetAttainment; annualAttainmentSlider.value = s.targetAttainment; }
      if (s.newLogoPct) { annualNlPctInput.value = s.newLogoPct; annualNlPctSlider.value = s.newLogoPct; }
      if (s.multiYearPct) { annualMyPctInput.value = s.multiYearPct; annualMyPctSlider.value = s.multiYearPct; }
      if (s.totalRenewedArr) { annualRenewedArr.value = s.totalRenewedArr; }
      if (s.l3TargetAttainment) { annualL3AttainmentInput.value = s.l3TargetAttainment; annualL3AttainmentSlider.value = s.l3TargetAttainment; }
      if (s.l2TargetAttainment) { annualL2AttainmentInput.value = s.l2TargetAttainment; annualL2AttainmentSlider.value = s.l2TargetAttainment; }
      settingsLoaded = true;
      recalculate();
    } catch (e) {
      settingsLoaded = true;
    }
  }

  const newLogoUpliftTooltip = fields.newLogoUplift.closest('.field').querySelector('.tooltip-content');
  const newLogoUpliftLabel = fields.newLogoUplift.closest('.field').querySelector('.field-label');
  const defaultNlTooltip = 'Additive modifier applied when the deal is a new logo (no existing contract). Only applies when New Logo toggle is on.';
  const mspNlTooltip = 'For PSA-MSP, "MSP NARR Uplift" corresponds to the "MSP NARR" accelerator in the comp plan. Only applies when MSP NARR toggle is on.';
  const defaultNlLabel = 'New Logo Uplift';
  const mspNlLabel = 'MSP NARR Uplift';

  // Store the original New Logo toggle label element for relabeling
  const newLogoToggleFieldLabel = newLogoToggle.closest('.field').querySelector('.field-label');
  const newLogoToggleLabelSpan = newLogoToggleFieldLabel.childNodes[0]; // text node

  function updateDualMeasureLabels(primary, secondary) {
    currentPrimaryLabel = primary;
    currentSecondaryLabel = secondary;
    document.querySelectorAll('.dm-primary-label').forEach(el => el.textContent = primary);
    document.querySelectorAll('.dm-secondary-label').forEach(el => el.textContent = secondary);

    // Update the deal-level toggle labels
    l3RegionToggleLabelEl.textContent = 'Deal is within ' + primary;
    if (bL3RegionToggleLabelEl) bL3RegionToggleLabelEl.textContent = 'Deal is within ' + primary;

    // Update tooltips
    document.querySelectorAll('.dm-primary-tooltip').forEach(el => {
      el.textContent = primary + ' measure NARR quota target. ' + primary + ' PCR = (OTV × ' + Math.round(currentPrimarySplit * 100) + '%) / ' + primary + ' NARR Quota.';
    });
    document.querySelectorAll('.dm-secondary-tooltip').forEach(el => {
      el.textContent = secondary + ' measure NARR quota target. ' + secondary + ' PCR = (OTV × ' + Math.round(currentSecondarySplit * 100) + '%) / ' + secondary + ' NARR Quota.';
    });
  }

  function updateNewLogoLabel(isMsp) {
    if (isMsp) {
      // Change "New Logo Uplift" to "MSP NARR Uplift" in single-measure uplift
      newLogoUpliftLabel.innerHTML = 'MSP NARR Uplift <span class="tooltip-trigger">&#9432;<span class="tooltip-content">' + mspNlTooltip + '</span></span>';
      // Change the deal toggle label
      newLogoToggleFieldLabel.innerHTML = 'MSP NARR <span class="tooltip-trigger">&#9432;<span class="tooltip-content">Toggle on for MSP NARR deals. When enabled, MSP NARR Uplift is added to the commission rate.</span></span>';
    } else {
      newLogoUpliftLabel.innerHTML = defaultNlLabel + ' <span class="tooltip-trigger">&#9432;<span class="tooltip-content">' + defaultNlTooltip + '</span></span>';
      newLogoToggleFieldLabel.innerHTML = 'New Logo <span class="tooltip-trigger">&#9432;<span class="tooltip-content">Toggle on if this is a new logo deal (no existing contract). When enabled, New Logo Uplift is added to the commission rate.</span></span>';
    }
    // Re-bind tooltips for newly created elements
    rebindTooltips(newLogoUpliftLabel);
    rebindTooltips(newLogoToggleFieldLabel);
  }

  function rebindTooltips(container) {
    container.querySelectorAll('.tooltip-trigger').forEach(trigger => {
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
  }

  function parseCurrency(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/[^0-9.\-]/g, '')) || 0;
  }

  function parseRate(str) {
    if (!str) return 0;
    str = str.trim();
    if (str.endsWith('%')) {
      return (parseFloat(str) || 0) / 100;
    }
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
      // Show custom labels row only for Custom team
      if (currentTeam === 'custom') {
        customLabelsRow.classList.remove('field-hidden');
      }
    } else {
      inputPanels.classList.remove('dual-measure-active');
      customLabelsRow.classList.add('field-hidden');
    }
  }

  function applyTeamPreset(teamKey) {
    const preset = TEAM_PRESETS[teamKey];
    if (!preset) return;

    currentTeam = teamKey;
    teamSelect.value = teamKey;
    fields.newLogoUplift.value = formatRateAsPercent(preset.newLogoUplift);
    fields.multiYearUplift.value = formatRateAsPercent(preset.multiYearUplift);
    fields.acceleratedPcr.value = formatRateAsPercent(preset.acceleratedPcr);

    multiYearDisabled = preset.disableMultiYear;
    if (multiYearDisabled) {
      multiYearToggle.classList.remove('active');
      multiYearToggle.setAttribute('aria-checked', 'false');
      multiYearLabel.textContent = 'N/A';
      multiYearToggle.classList.add('disabled');
      multiYearField.classList.add('field-disabled');
      // Also disable Deal B multi-year
      bMultiYearToggle.classList.remove('active');
      bMultiYearToggle.setAttribute('aria-checked', 'false');
      bMultiYearLabel.textContent = 'N/A';
      bMultiYearToggle.classList.add('disabled');
      bMultiYearField.classList.add('field-disabled');
    } else {
      multiYearToggle.classList.remove('disabled');
      multiYearField.classList.remove('field-disabled');
      bMultiYearToggle.classList.remove('disabled');
      bMultiYearField.classList.remove('field-disabled');
      if (!multiYearToggle.classList.contains('active')) {
        multiYearLabel.textContent = 'No';
      }
      if (!bMultiYearToggle.classList.contains('active')) {
        bMultiYearLabel.textContent = 'No';
      }
    }

    // RARR mode: LATAM or PSA-MSP
    if (preset.latamMode || preset.rarrMode) {
      rarrRateField.classList.remove('field-hidden');
      fields.rarrRate.value = formatRateAsPercent(preset.rarrRate || 0.001);
    } else {
      rarrRateField.classList.add('field-hidden');
    }

    // PSA pending note removed — all PSA teams now have confirmed values
    psaPendingNote.classList.add('field-hidden');

    // PSA-MSP: relabel New Logo to MSP NARR
    updateNewLogoLabel(preset.mspMode || false);

    // Dual-measure handling
    if (preset.dualMeasure) {
      setDualMeasureMode(true);
      dualMeasureLocked = true;
      dualMeasureToggle.classList.add('active');
      dualMeasureToggle.setAttribute('aria-checked', 'true');
      dualMeasureToggle.classList.add('disabled');
      dualMeasureLabel.textContent = 'On';
      dualMeasureToggleField.classList.remove('field-hidden');

      // Set split ratio
      const split = preset.dualMeasureSplit || [0.80, 0.20];
      currentPrimarySplit = split[0];
      currentSecondarySplit = split[1];
      primarySplitInput.value = Math.round(split[0] * 100);
      secondarySplitInput.value = Math.round(split[1] * 100);

      // Set labels
      const pLabel = preset.primaryLabel || 'L3';
      const sLabel = preset.secondaryLabel || 'L2';
      primaryLabelInput.value = pLabel;
      secondaryLabelInput.value = sLabel;
      updateDualMeasureLabels(pLabel, sLabel);

      // Hide custom label/split fields for preset teams
      customLabelsRow.classList.add('field-hidden');

      fields.l3NewLogoUplift.value = formatRateAsPercent(preset.l3NewLogoUplift);
      fields.l3MultiYearUplift.value = formatRateAsPercent(preset.l3MultiYearUplift);
      fields.l2NewLogoUplift.value = formatRateAsPercent(preset.l2NewLogoUplift);
      fields.l2MultiYearUplift.value = formatRateAsPercent(preset.l2MultiYearUplift);
      fields.l3AcceleratedPcr.value = formatRateAsPercent(preset.l3AcceleratedPcr);
      fields.l2AcceleratedPcr.value = formatRateAsPercent(preset.l2AcceleratedPcr);
    } else if (teamKey === 'custom') {
      // Custom: show toggle, let user control it
      dualMeasureLocked = false;
      dualMeasureToggle.classList.remove('disabled');
      dualMeasureToggleField.classList.remove('field-hidden');
      // Show custom label/split fields when dual-measure is active
      if (dualMeasureActive) {
        customLabelsRow.classList.remove('field-hidden');
      }
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
      customLabelsRow.classList.add('field-hidden');
    }
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

  function isRarrMode() {
    const preset = TEAM_PRESETS[currentTeam];
    return preset && (preset.rarrMode || preset.latamMode);
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
        dealInL3: l3RegionToggle.classList.contains('active'),
        primarySplit: currentPrimarySplit,
        secondarySplit: currentSecondarySplit
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
      latamMode: isLatamMode(),
      rarrMode: isRarrMode()
    });
  }

  function recalculate() {
    if (annualMode) {
      recalculateAnnual();
      return;
    }
    if (pipelineMode) {
      recalculatePipeline();
      return;
    }
    if (comparisonMode) {
      recalculateComparison();
      return;
    }

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
    fields.pcr.value = inputs.narrQuota > 0 ? formatRateAsPercent(r.pcr) : '';
    fields.narrAttainment.value = inputs.narrQuota > 0
      ? (r.narrQuotaAttainment * 100).toFixed(2)
      : '';

    renderResults(r, inputs);
  }

  function recalculateDualMeasure(inputs) {
    const r = calculateDualMeasureCompensation(inputs);

    setCurrencyDisplay(fields.salary, r.salary);
    setCurrencyDisplay(fields.otv, r.otv);
    fields.l3Pcr.value = inputs.l3NarrQuota > 0 ? formatRateAsPercent(r.l3Pcr) : '';
    fields.l2Pcr.value = inputs.l2NarrQuota > 0 ? formatRateAsPercent(r.l2Pcr) : '';
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

  function buildDualMeasureHtml(r, inputs) {
    const dealNarr = r.narrQuotaRetirement;
    let html = '';

    html += `<div class="result-group">`;
    html += `<div class="result-group-title">Deal Metrics</div>`;
    html += resultRow('Day 1 ARR', formatDollars(r.day1Arr));
    html += resultRow('NARR Quota Retirement', formatDollars(r.narrQuotaRetirement), r.narrQuotaRetirement < 0 ? 'negative' : '');
    if (inputs.carr > 0) {
      html += resultRow('CARR (informational)', formatDollars(r.carr), 'zero');
      html += `<div class="result-note">CARR is displayed for context only and is not used in the NARR calculation.</div>`;
    }
    html += `</div>`;

    const pLabel = currentPrimaryLabel;
    const sLabel = currentSecondaryLabel;

    if (r.dealInL3 && r.l3) {
      html += buildDealAttainmentBar({ segments: buildMeasureBarSegments(r.l3), title: pLabel + ' Attainment' });
    }
    html += buildDealAttainmentBar({ segments: buildMeasureBarSegments(r.l2), title: sLabel + ' Attainment' });

    if (r.dealInL3 && r.l3) {
      html += renderMeasureSection(r.l3, pLabel, 'Primary', inputs, dealNarr);
    }
    html += renderMeasureSection(r.l2, sLabel, 'Secondary', inputs, dealNarr);

    if (r.totalCommission > 0) {
      html += `<div class="result-group">`;
      html += `<div class="result-group-title">Total</div>`;
      if (r.dealInL3 && r.l3) {
        html += resultRow(pLabel + ' Commission', formatDollars(r.l3.commission));
        html += resultRow(sLabel + ' Commission', formatDollars(r.l2.commission));
        html += `<div class="result-divider"></div>`;
      }
      html += resultRow('Total Deal Commission', formatDollars(r.totalCommission), 'positive', true);
      html += `</div>`;
    } else if (dealNarr <= 0) {
      html += `<div class="result-group">`;
      html += `<div class="result-group-title">Total</div>`;
      html += resultRow('Total Deal Commission', '$0.00', 'zero');
      html += `<div class="result-note">${dealNarr < 0 ? 'Negative NARR — no commission earned on this deal.' : 'No NARR on this deal — no commission earned.'}</div>`;
      html += `</div>`;
    }

    if (r.totalCommission > 0) {
      html += `<div class="result-group">`;
      html += `<div class="result-group-title">OTV Impact</div>`;
      html += resultRow('OTV Attainment from Deal', formatPercent(r.otvAttainment));
      html += `</div>`;
    }

    return html;
  }

  function renderDualMeasureResults(r, inputs) {
    const hasQuota = inputs.l3NarrQuota > 0 || inputs.l2NarrQuota > 0;
    if (!inputs.ote || !hasQuota) {
      resultsEl.innerHTML = '<div class="results-empty">Enter OTE, NARR Quotas, and deal details to see results.</div>';
      updateActionButtons();
      return;
    }
    resultsEl.innerHTML = buildDualMeasureHtml(r, inputs);
    updateActionButtons();
  }

  function buildSingleMeasureHtml(r, inputs) {
    const hasNarr = r.narrQuotaRetirement > 0;
    const rateLabel = buildRateLabel(r, inputs);
    let html = '';

    html += `<div class="result-group">`;
    html += `<div class="result-group-title">Deal Metrics</div>`;
    html += resultRow('Day 1 ARR', formatDollars(r.day1Arr));
    html += resultRow('NARR Quota Retirement', formatDollars(r.narrQuotaRetirement), r.narrQuotaRetirement < 0 ? 'negative' : '');
    if (inputs.carr > 0) {
      html += resultRow('CARR (informational)', formatDollars(r.carr), 'zero');
      html += `<div class="result-note">CARR is displayed for context only and is not used in the NARR calculation.</div>`;
    }
    html += `</div>`;

    html += `<div class="result-group">`;
    html += `<div class="result-group-title">Quota Attainment</div>`;
    html += resultRow('Pre-Deal Attainment', formatPercent(r.narrQuotaAttainment));
    html += resultRow('Post-Deal Attainment', formatPercent(r.postDealAttainment));
    html += `</div>`;

    html += buildDealAttainmentBar({ segments: buildSingleDealSegments(r), title: 'NARR Quota Attainment' });

    html += `<div class="result-group">`;
    html += `<div class="result-group-title">Commission Rates</div>`;
    html += resultRow('Base Rate', formatRateAsPercent(r.baseRate));
    html += `<div class="rate-breakdown">${rateLabel}</div>`;
    if (r.straddlesThreshold) {
      html += resultRow('Accelerated Rate', formatRateAsPercent(r.acceleratedRate));
      html += `<div class="rate-breakdown">${rateLabel} + Accelerated PCR</div>`;
    }
    html += `</div>`;

    html += `<div class="result-group">`;
    html += `<div class="result-group-title">Commission Calculation</div>`;

    if (!hasNarr) {
      html += resultRow('NARR Commission', '$0.00', 'zero');
      html += `<div class="result-note">${r.narrQuotaRetirement < 0 ? 'Negative NARR — no commission earned on this deal.' : 'No NARR on this deal — no commission earned.'}</div>`;
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

    if ((r.latamMode || r.rarrMode) && inputs.renewedArr > 0) {
      html += `<div class="result-divider"></div>`;
      html += resultRow('RARR Commission', formatDollars(r.rarrCommission), r.rarrCommission > 0 ? 'positive' : '');
      html += `<div class="rate-breakdown">${formatDollars(inputs.renewedArr)} × ${formatRateAsPercent(inputs.rarrRate)}</div>`;
    }

    if (hasNarr || ((r.latamMode || r.rarrMode) && r.rarrCommission > 0)) {
      html += `<div class="result-divider"></div>`;
      html += resultRow('Total Deal Commission', formatDollars(r.totalCommission), 'positive', true);
    }

    html += `</div>`;

    if (r.totalCommission > 0) {
      html += `<div class="result-group">`;
      html += `<div class="result-group-title">OTV Impact</div>`;
      html += resultRow('OTV Attainment from Deal', formatPercent(r.otvAttainment));
      html += `</div>`;
    }

    return html;
  }

  function renderResults(r, inputs) {
    if (!inputs.ote || !inputs.narrQuota) {
      resultsEl.innerHTML = '<div class="results-empty">Enter OTE, NARR Quota, and deal details to see results.</div>';
      updateActionButtons();
      return;
    }
    resultsEl.innerHTML = buildSingleMeasureHtml(r, inputs);
    updateActionButtons();
  }

  function resultRow(label, value, valueClass, highlight) {
    const cls = highlight ? ' highlight' : '';
    const vCls = valueClass ? ` ${valueClass}` : '';
    return `<div class="result-row${cls}">
      <span class="result-label">${label}</span>
      <span class="result-value${vCls}">${value}</span>
    </div>`;
  }

  function updateActionButtons() {
    const hasResults = !resultsEl.querySelector('.results-empty');
    btnCopy.disabled = !hasResults;
    btnExportPdf.disabled = !hasResults;
  }

  function showCopyToast() {
    copyToast.classList.add('visible');
    setTimeout(() => {
      copyToast.classList.remove('visible');
    }, 1500);
  }

  // === Annual Projections Mode ===

  function getAnnualInputs() {
    const baseInputs = getInputs();
    if (baseInputs.dualMeasure) {
      return Object.assign(baseInputs, {
        l3TargetAttainment: (parseFloat(annualL3AttainmentInput.value) || 0) / 100,
        l2TargetAttainment: (parseFloat(annualL2AttainmentInput.value) || 0) / 100,
        newLogoPct: (parseFloat(annualNlPctInput.value) || 0) / 100,
        multiYearPct: (parseFloat(annualMyPctInput.value) || 0) / 100,
        totalRenewedArr: parseCurrency(annualRenewedArr.value)
      });
    }
    return Object.assign(baseInputs, {
      targetAttainment: (parseFloat(annualAttainmentInput.value) || 0) / 100,
      newLogoPct: (parseFloat(annualNlPctInput.value) || 0) / 100,
      multiYearPct: (parseFloat(annualMyPctInput.value) || 0) / 100,
      totalRenewedArr: parseCurrency(annualRenewedArr.value)
    });
  }

  function recalculateAnnual() {
    const inputs = getAnnualInputs();

    // Update computed profile fields
    setCurrencyDisplay(fields.salary, inputs.ote * 0.80);
    setCurrencyDisplay(fields.otv, inputs.ote * 0.20);

    if (inputs.dualMeasure) {
      const otv = inputs.ote * 0.20;
      const l3Pcr = inputs.l3NarrQuota > 0 ? (otv * currentPrimarySplit) / inputs.l3NarrQuota : 0;
      const l2Pcr = inputs.l2NarrQuota > 0 ? (otv * currentSecondarySplit) / inputs.l2NarrQuota : 0;
      fields.l3Pcr.value = inputs.l3NarrQuota > 0 ? formatRateAsPercent(l3Pcr) : '';
      fields.l2Pcr.value = inputs.l2NarrQuota > 0 ? formatRateAsPercent(l2Pcr) : '';

      // Update total NARR displays
      const l3TotalNarr = inputs.l3NarrQuota * inputs.l3TargetAttainment;
      const l2TotalNarr = inputs.l2NarrQuota * inputs.l2TargetAttainment;
      setCurrencyDisplay({ value: '' }, l3TotalNarr);
      annualL3TotalNarr.value = formatCurrency(l3TotalNarr);
      annualL2TotalNarr.value = formatCurrency(l2TotalNarr);

      const r = calculateDualMeasureAnnualCompensation(inputs);
      renderAnnualResults(r, inputs);
    } else {
      const otv = inputs.ote * 0.20;
      const pcr = inputs.narrQuota > 0 ? otv / inputs.narrQuota : 0;
      fields.pcr.value = inputs.narrQuota > 0 ? formatRateAsPercent(pcr) : '';

      // Update total NARR display
      const totalNarr = inputs.narrQuota * inputs.targetAttainment;
      annualTotalNarr.value = formatCurrency(totalNarr);

      const r = calculateAnnualCompensation({
        narrQuota: inputs.narrQuota,
        targetAttainment: inputs.targetAttainment,
        pcr: pcr,
        newLogoUplift: inputs.newLogoUplift || parseRate(fields.newLogoUplift.value),
        multiYearUplift: inputs.multiYearUplift || parseRate(fields.multiYearUplift.value),
        acceleratedPcr: inputs.acceleratedPcr || parseRate(fields.acceleratedPcr.value),
        newLogoPct: inputs.newLogoPct,
        multiYearPct: inputs.multiYearPct,
        rarrRate: (isLatamMode() || isRarrMode()) ? parseRate(fields.rarrRate.value) : 0,
        totalRenewedArr: (isLatamMode() || isRarrMode()) ? inputs.totalRenewedArr : 0
      });

      const salary = inputs.ote * 0.80;
      renderAnnualResults({ salary: salary, otv: otv, totalVariable: r.totalVariable, otvAttainment: otv > 0 ? r.totalVariable / otv : 0, single: r, rarrCommission: r.rarrCommission }, inputs);
    }

    if (settingsLoaded) saveSettings();
  }

  function renderAnnualResults(r, inputs) {
    const hasQuota = inputs.dualMeasure
      ? (inputs.l3NarrQuota > 0 || inputs.l2NarrQuota > 0)
      : (inputs.narrQuota > 0);

    if (!inputs.ote || !hasQuota) {
      resultsEl.innerHTML = '<div class="results-empty">Enter OTE and NARR Quota to see annual projections.</div>';
      updateActionButtons();
      return;
    }

    let html = '';

    // Attainment bar
    if (inputs.dualMeasure) {
      html += buildDealAttainmentBar({
        segments: [{ startPct: 0, endPct: inputs.l3TargetAttainment * 100, color: BAR_COLORS.accent, label: currentPrimaryLabel + ' (' + (inputs.l3TargetAttainment * 100).toFixed(0) + '%)' }],
        title: currentPrimaryLabel + ' Attainment'
      });
      html += buildDealAttainmentBar({
        segments: [{ startPct: 0, endPct: inputs.l2TargetAttainment * 100, color: BAR_COLORS.accent, label: currentSecondaryLabel + ' (' + (inputs.l2TargetAttainment * 100).toFixed(0) + '%)' }],
        title: currentSecondaryLabel + ' Attainment'
      });
    } else {
      html += buildDealAttainmentBar({
        segments: [{ startPct: 0, endPct: inputs.targetAttainment * 100, color: BAR_COLORS.accent, label: 'Target (' + (inputs.targetAttainment * 100).toFixed(0) + '%)' }],
        title: 'NARR Quota Attainment'
      });
    }

    // Summary
    const totalComp = r.salary + r.totalVariable;
    html += `<div class="result-group">`;
    html += `<div class="result-group-title">Annual Compensation Summary</div>`;
    html += `<div class="result-row annual-total-row">
      <span class="result-label">Total Annual Compensation</span>
      <span class="result-value">${formatDollars(totalComp)}</span>
    </div>`;
    html += resultRow('Salary', formatDollars(r.salary));
    html += resultRow('Total Variable Compensation', formatDollars(r.totalVariable), r.totalVariable > 0 ? 'positive' : '');
    html += resultRow('OTV Attainment', formatPercent(r.otvAttainment));
    html += `</div>`;

    // Breakdown
    if (inputs.dualMeasure) {
      html += buildAnnualMeasureBreakdown(r.l3, currentPrimaryLabel, 'Primary');
      html += buildAnnualMeasureBreakdown(r.l2, currentSecondaryLabel, 'Secondary');
      if (r.rarrCommission > 0) {
        html += `<div class="result-group">`;
        html += `<div class="result-group-title">RARR Bonus</div>`;
        html += resultRow('Renewed ARR', formatDollars(inputs.totalRenewedArr));
        html += resultRow('RARR Commission', formatDollars(r.rarrCommission), 'positive');
        html += `</div>`;
      }
    } else {
      html += buildAnnualSingleBreakdown(r.single, inputs);
    }

    // Sensitivity table
    html += buildSensitivityTable(inputs);

    resultsEl.innerHTML = html;
    updateActionButtons();
  }

  const BAR_COLORS = {
    preDeal: '#3a4a8a',
    accent: '#751323',
    accel: '#66bb6a'
  };

  function buildDealAttainmentBar(opts) {
    const segments = opts.segments || [];
    const title = opts.title || '';
    const maxEnd = segments.reduce((m, s) => Math.max(m, s.endPct), 0);
    const maxPct = Math.max(150, Math.ceil(maxEnd / 25) * 25);
    const toLeft = pct => Math.max(0, Math.min(100, (pct / maxPct) * 100));

    const milestones = [50, 75, 100, 125, 150].filter(m => m <= maxPct);

    let html = `<div class="deal-attainment-bar">`;
    if (title) html += `<div class="deal-bar-title">${title}</div>`;

    // Track with segments, tick lines, threshold, and labels
    html += `<div class="deal-bar-track-wrap">`;
    html += `<div class="deal-bar-track">`;
    for (const seg of segments) {
      const left = toLeft(seg.startPct);
      const width = toLeft(seg.endPct) - left;
      if (width > 0) {
        html += `<div class="deal-bar-segment" style="left:${left}%;width:${width}%;background-color:${seg.color}" title="${seg.label || ''}"></div>`;
      }
    }
    html += `<div class="deal-bar-threshold" style="left:${toLeft(100)}%"></div>`;
    for (const m of milestones) {
      const opacity = m === 100 ? '0.6' : '0.2';
      html += `<div class="deal-bar-tick" style="left:${toLeft(m)}%;opacity:${opacity}"></div>`;
    }
    html += `</div>`;

    // Labels below the track
    html += `<div class="deal-bar-label-row">`;
    for (const m of milestones) {
      const cls = m === 100 ? ' deal-bar-label-100' : '';
      html += `<span class="deal-bar-label${cls}" style="left:${toLeft(m)}%">${m}%</span>`;
    }
    html += `</div>`;
    html += `</div>`;

    // Legend
    const legendItems = segments.filter(s => s.label && (s.endPct - s.startPct) > 0);
    if (legendItems.length > 0) {
      html += `<div class="deal-bar-legend">`;
      for (const seg of legendItems) {
        html += `<span class="deal-bar-legend-item"><span class="deal-bar-swatch" style="background:${seg.color}"></span>${seg.label}</span>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
    return html;
  }

  const BAR_COLORS_MUTED = {
    belowQuota: '#4a2030',
    aboveQuota: '#2d5a3a'
  };

  function buildAttainmentSegments(prePct, postPct, hasDealNarr) {
    const segments = [];

    if (prePct > 0) {
      const preColor = prePct >= 100 ? BAR_COLORS_MUTED.aboveQuota : BAR_COLORS_MUTED.belowQuota;
      segments.push({ startPct: 0, endPct: prePct, color: preColor, label: 'Pre-deal (' + prePct.toFixed(1) + '%)' });
    }

    if (hasDealNarr && postPct > prePct) {
      if (prePct >= 100) {
        segments.push({ startPct: prePct, endPct: postPct, color: BAR_COLORS.accel, label: 'Deal (accelerated)' });
      } else if (postPct <= 100) {
        segments.push({ startPct: prePct, endPct: postPct, color: BAR_COLORS.accent, label: 'Deal' });
      } else {
        segments.push({ startPct: prePct, endPct: 100, color: BAR_COLORS.accent, label: 'Deal (base)' });
        segments.push({ startPct: 100, endPct: postPct, color: BAR_COLORS.accel, label: 'Deal (accelerated)' });
      }
    }

    return segments;
  }

  function buildSingleDealSegments(r) {
    return buildAttainmentSegments(
      r.narrQuotaAttainment * 100,
      r.postDealAttainment * 100,
      r.narrQuotaRetirement > 0
    );
  }

  function buildMeasureBarSegments(measure) {
    return buildAttainmentSegments(
      measure.narrQuotaAttainment * 100,
      measure.postDealAttainment * 100,
      measure.commission > 0
    );
  }

  // === Pipeline Stacking ===

  const pipelineContainer = $('pipeline-container');
  const btnAddDeal = $('btn-add-deal');
  const btnClearPipeline = $('btn-clear-pipeline');

  const DEAL_COLORS = ['#e53935', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#e91e63', '#8bc34a', '#ff5722'];

  function createDealBoxHtml(dealId, dealNumber) {
    const myDisabled = multiYearDisabled ? ' disabled' : '';
    const myFieldCls = multiYearDisabled ? ' field-disabled' : '';
    const l3Section = dualMeasureActive ? `
          <div class="field toggle-field dual-measure-only">
            <label class="field-label" id="deal-${dealId}-l3-region-toggle-label">
              Deal is within my ${currentPrimaryLabel} region
            </label>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="toggle active" id="deal-${dealId}-l3-region-toggle" data-deal-id="${dealId}" data-deal-toggle="l3Region" role="switch" aria-checked="true" tabindex="0"></div>
              <span class="toggle-label" id="deal-${dealId}-l3-region-label">Yes</span>
            </div>
          </div>` : '';

    return `<div class="deal-box" data-deal-id="${dealId}" id="deal-box-${dealId}">
      <div class="deal-box-header">
        <span class="deal-box-number">Deal ${dealNumber}</span>
        <input type="text" class="deal-box-name" id="deal-${dealId}-name" value="Deal ${dealNumber}" data-deal-id="${dealId}" data-deal-field="name">
        <div class="deal-box-actions">
          <button class="deal-box-btn deal-box-move-up" data-deal-id="${dealId}" title="Move up">&#9650;</button>
          <button class="deal-box-btn deal-box-move-down" data-deal-id="${dealId}" title="Move down">&#9660;</button>
          <button class="deal-box-btn deal-box-duplicate" data-deal-id="${dealId}" title="Duplicate">&#10697;</button>
          <button class="deal-box-btn deal-box-remove" data-deal-id="${dealId}" title="Remove">&#10005;</button>
        </div>
      </div>
      <div class="field-grid">
        <div class="field">
          <label class="field-label">IARR</label>
          <div class="input-wrap"><span class="input-prefix">$</span><input type="text" id="deal-${dealId}-iarr" value="0" data-currency data-deal-id="${dealId}" data-deal-field="iarr"></div>
        </div>
        <div class="field">
          <label class="field-label">Renewed ARR</label>
          <div class="input-wrap"><span class="input-prefix">$</span><input type="text" id="deal-${dealId}-renewed-arr" value="0" data-currency data-deal-id="${dealId}" data-deal-field="renewedArr"></div>
        </div>
        <div class="field">
          <label class="field-label">CARR</label>
          <div class="input-wrap"><span class="input-prefix">$</span><input type="text" id="deal-${dealId}-carr" value="0" data-currency data-deal-id="${dealId}" data-deal-field="carr"></div>
        </div>
        <div class="field">
          <label class="field-label">NARR</label>
          <div class="input-wrap"><span class="input-prefix">$</span><input type="text" id="deal-${dealId}-new-module-arr" data-currency data-deal-id="${dealId}" data-deal-field="newModuleArr"></div>
        </div>
        <div class="field toggle-field">
          <label class="field-label" id="deal-${dealId}-new-logo-field-label">${TEAM_PRESETS[currentTeam] && TEAM_PRESETS[currentTeam].mspMode ? 'MSP NARR' : 'New Logo'}</label>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="toggle" id="deal-${dealId}-new-logo-toggle" data-deal-id="${dealId}" data-deal-toggle="newLogo" role="switch" aria-checked="false" tabindex="0"></div>
            <span class="toggle-label" id="deal-${dealId}-new-logo-label">No</span>
          </div>
        </div>
        <div class="field toggle-field${myFieldCls}">
          <label class="field-label">Multi-Year</label>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="toggle${myDisabled}" id="deal-${dealId}-multi-year-toggle" data-deal-id="${dealId}" data-deal-toggle="multiYear" role="switch" aria-checked="false" tabindex="0"></div>
            <span class="toggle-label" id="deal-${dealId}-multi-year-label">No</span>
          </div>
        </div>
        ${l3Section}
      </div>
      <div class="deal-inline-results" id="deal-${dealId}-inline-results"></div>
    </div>`;
  }

  function getDealInputs(dealId) {
    return {
      iarr: parseCurrency($('deal-' + dealId + '-iarr').value),
      renewedArr: parseCurrency($('deal-' + dealId + '-renewed-arr').value),
      carr: parseCurrency($('deal-' + dealId + '-carr').value),
      newModuleArr: parseCurrency($('deal-' + dealId + '-new-module-arr').value),
      newLogoDeal: $('deal-' + dealId + '-new-logo-toggle').classList.contains('active'),
      multiYearDeal: !multiYearDisabled && $('deal-' + dealId + '-multi-year-toggle').classList.contains('active'),
      dealInL3: dualMeasureActive ? $('deal-' + dealId + '-l3-region-toggle').classList.contains('active') : true
    };
  }

  function addDeal(sourceValues) {
    const dealId = nextDealId++;
    const dealNumber = deals.length + 2; // Deal 1 is the base
    const deal = { id: dealId, name: 'Deal ' + dealNumber };
    deals.push(deal);

    pipelineContainer.insertAdjacentHTML('beforeend', createDealBoxHtml(dealId, dealNumber));

    if (sourceValues) {
      setCurrencyDisplay($('deal-' + dealId + '-iarr'), sourceValues.iarr);
      setCurrencyDisplay($('deal-' + dealId + '-renewed-arr'), sourceValues.renewedArr);
      setCurrencyDisplay($('deal-' + dealId + '-carr'), sourceValues.carr);
      setCurrencyDisplay($('deal-' + dealId + '-new-module-arr'), sourceValues.newModuleArr);
      const nlToggle = $('deal-' + dealId + '-new-logo-toggle');
      nlToggle.classList.toggle('active', sourceValues.newLogoDeal);
      nlToggle.setAttribute('aria-checked', sourceValues.newLogoDeal);
      $('deal-' + dealId + '-new-logo-label').textContent = sourceValues.newLogoDeal ? 'Yes' : 'No';
      if (!multiYearDisabled) {
        const myToggle = $('deal-' + dealId + '-multi-year-toggle');
        myToggle.classList.toggle('active', sourceValues.multiYearDeal);
        myToggle.setAttribute('aria-checked', sourceValues.multiYearDeal);
        $('deal-' + dealId + '-multi-year-label').textContent = sourceValues.multiYearDeal ? 'Yes' : 'No';
      }
      if (dualMeasureActive && sourceValues.dealInL3 !== undefined) {
        const l3Toggle = $('deal-' + dealId + '-l3-region-toggle');
        l3Toggle.classList.toggle('active', sourceValues.dealInL3);
        l3Toggle.setAttribute('aria-checked', sourceValues.dealInL3);
        $('deal-' + dealId + '-l3-region-label').textContent = sourceValues.dealInL3 ? 'Yes' : 'No';
      }
      if (sourceValues.name) {
        $('deal-' + dealId + '-name').value = sourceValues.name;
      }
    }

    if (!pipelineMode) enterPipelineMode();
    updatePipelineButtons();
    recalculate();
  }

  function removeDeal(dealId) {
    const idx = deals.findIndex(d => d.id === dealId);
    if (idx === -1) return;
    deals.splice(idx, 1);
    const el = $('deal-box-' + dealId);
    if (el) el.remove();
    if (deals.length === 0) exitPipelineMode();
    updateDealNumbers();
    updatePipelineButtons();
    recalculate();
  }

  function moveDeal(dealId, direction) {
    const idx = deals.findIndex(d => d.id === dealId);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= deals.length) return;
    const temp = deals[idx];
    deals[idx] = deals[newIdx];
    deals[newIdx] = temp;
    // Reorder DOM
    const container = pipelineContainer;
    const children = Array.from(container.querySelectorAll('.deal-box'));
    children.sort((a, b) => {
      const aIdx = deals.findIndex(d => d.id === parseInt(a.dataset.dealId));
      const bIdx = deals.findIndex(d => d.id === parseInt(b.dataset.dealId));
      return aIdx - bIdx;
    });
    children.forEach(child => container.appendChild(child));
    updateDealNumbers();
    updatePipelineButtons();
    recalculate();
  }

  function duplicateDeal(dealId) {
    const vals = getDealInputs(dealId);
    const nameEl = $('deal-' + dealId + '-name');
    vals.name = nameEl ? nameEl.value + ' (copy)' : undefined;
    addDeal(vals);
  }

  function updateDealNumbers() {
    deals.forEach((deal, idx) => {
      const num = idx + 2;
      const box = $('deal-box-' + deal.id);
      if (!box) return;
      box.querySelector('.deal-box-number').textContent = 'Deal ' + num;
    });
  }

  function updatePipelineButtons() {
    deals.forEach((deal, idx) => {
      const box = $('deal-box-' + deal.id);
      if (!box) return;
      const upBtn = box.querySelector('.deal-box-move-up');
      const downBtn = box.querySelector('.deal-box-move-down');
      if (upBtn) upBtn.disabled = (idx === 0);
      if (downBtn) downBtn.disabled = (idx === deals.length - 1);
    });
    btnClearPipeline.classList.toggle('field-hidden', deals.length === 0);
  }

  function enterPipelineMode() {
    pipelineMode = true;
    btnCompare.classList.add('field-hidden');
    if (dealASection) {
      dealASection.querySelector('.section-title').textContent = 'Deal 1';
    }
    document.querySelector('.results-title').textContent = 'Pipeline Breakdown';
    recalculate();
  }

  function exitPipelineMode() {
    pipelineMode = false;
    btnCompare.classList.remove('field-hidden');
    if (dealASection) {
      dealASection.querySelector('.section-title').textContent = 'Deal Details';
    }
    document.querySelector('.results-title').textContent = 'Commission Breakdown';
    btnClearPipeline.classList.add('field-hidden');
    recalculate();
  }

  function clearAllDeals() {
    deals.forEach(deal => {
      const el = $('deal-box-' + deal.id);
      if (el) el.remove();
    });
    deals = [];
    nextDealId = 2;
    exitPipelineMode();
    // Reset Deal 1 inputs
    setCurrencyDisplay(fields.iarr, 0);
    setCurrencyDisplay(fields.renewedArr, 0);
    setCurrencyDisplay(fields.carr, 0);
    fields.newModuleArr.value = '';
    newLogoToggle.classList.remove('active');
    newLogoToggle.setAttribute('aria-checked', 'false');
    newLogoLabel.textContent = 'No';
    multiYearToggle.classList.remove('active');
    multiYearToggle.setAttribute('aria-checked', 'false');
    multiYearLabel.textContent = 'No';
    if (l3RegionToggle) {
      l3RegionToggle.classList.add('active');
      l3RegionToggle.setAttribute('aria-checked', 'true');
      l3RegionLabel.textContent = 'Yes';
    }
    recalculate();
  }

  function renderDealInlineResults(dealId, result, preAtt, postAtt) {
    const el = $('deal-' + dealId + '-inline-results');
    if (!el) return;
    const narrRet = result.narrQuotaRetirement;
    const comm = result.totalCommission;
    el.innerHTML = `<span class="deal-inline-stat"><span class="deal-inline-label">NARR Retired:</span><span class="deal-inline-value">${formatDollars(narrRet)}</span></span>`
      + `<span class="deal-inline-stat"><span class="deal-inline-label">Commission:</span><span class="deal-inline-value positive">${formatDollars(comm)}</span></span>`
      + `<span class="deal-inline-stat"><span class="deal-inline-label">Attainment:</span><span class="deal-inline-value">${(preAtt * 100).toFixed(2)}% → ${(postAtt * 100).toFixed(2)}%</span></span>`;
    el.classList.add('has-results');
  }

  function recalculatePipeline() {
    const baseInputs = getInputs();
    if (!baseInputs.ote || (baseInputs.dualMeasure ? (!baseInputs.l3NarrQuota && !baseInputs.l2NarrQuota) : !baseInputs.narrQuota)) {
      resultsEl.innerHTML = '<div class="results-empty">Enter OTE, NARR Quota, and deal details to see results.</div>';
      updateActionButtons();
      return;
    }

    // Update derived profile fields (salary, OTV, PCR display)
    if (baseInputs.dualMeasure) {
      const rProfile = calculateDualMeasureCompensation(baseInputs);
      setCurrencyDisplay(fields.salary, rProfile.salary);
      setCurrencyDisplay(fields.otv, rProfile.otv);
      fields.l3Pcr.value = baseInputs.l3NarrQuota > 0 ? formatRateAsPercent(rProfile.l3Pcr) : '';
      fields.l2Pcr.value = baseInputs.l2NarrQuota > 0 ? formatRateAsPercent(rProfile.l2Pcr) : '';
      fields.l3Attainment.value = baseInputs.l3NarrQuota > 0 ? (baseInputs.l3NarrQuotaCredit / baseInputs.l3NarrQuota * 100).toFixed(2) : '';
      fields.l2Attainment.value = baseInputs.l2NarrQuota > 0 ? (baseInputs.l2NarrQuotaCredit / baseInputs.l2NarrQuota * 100).toFixed(2) : '';
    } else {
      const rProfile = calculateCompensation(baseInputs);
      setCurrencyDisplay(fields.salary, rProfile.salary);
      setCurrencyDisplay(fields.otv, rProfile.otv);
      fields.pcr.value = baseInputs.narrQuota > 0 ? formatRateAsPercent(rProfile.pcr) : '';
      fields.narrAttainment.value = baseInputs.narrQuota > 0 ? (rProfile.narrQuotaAttainment * 100).toFixed(2) : '';
    }

    const allResults = [];
    const narrQuota = baseInputs.dualMeasure ? 0 : baseInputs.narrQuota;
    const l3Quota = baseInputs.dualMeasure ? baseInputs.l3NarrQuota : 0;
    const l2Quota = baseInputs.dualMeasure ? baseInputs.l2NarrQuota : 0;

    let runningCredit = baseInputs.dualMeasure ? 0 : baseInputs.narrQuotaCredit;
    let runningL3Credit = baseInputs.dualMeasure ? baseInputs.l3NarrQuotaCredit : 0;
    let runningL2Credit = baseInputs.dualMeasure ? baseInputs.l2NarrQuotaCredit : 0;

    // Build list of all deals: Deal 1 (base) + dynamic deals
    const allDeals = [{ id: 0, name: 'Deal 1', isBase: true }].concat(deals);

    for (let i = 0; i < allDeals.length; i++) {
      const d = allDeals[i];
      let dealInputOverrides;

      if (d.isBase) {
        dealInputOverrides = {};
      } else {
        dealInputOverrides = getDealInputs(d.id);
      }

      let inputs, result, preAtt, postAtt;

      if (baseInputs.dualMeasure) {
        inputs = Object.assign({}, baseInputs, dealInputOverrides, {
          l3NarrQuotaCredit: runningL3Credit,
          l2NarrQuotaCredit: runningL2Credit
        });
        result = calculateDualMeasureCompensation(inputs);
        preAtt = l3Quota > 0 ? runningL3Credit / l3Quota : (l2Quota > 0 ? runningL2Credit / l2Quota : 0);
        const newL3 = runningL3Credit + result.narrQuotaRetirement;
        const newL2 = runningL2Credit + result.narrQuotaRetirement;
        postAtt = l3Quota > 0 ? newL3 / l3Quota : (l2Quota > 0 ? newL2 / l2Quota : 0);
        runningL3Credit += result.narrQuotaRetirement;
        runningL2Credit += result.narrQuotaRetirement;
      } else {
        inputs = Object.assign({}, baseInputs, dealInputOverrides, { narrQuotaCredit: runningCredit });
        result = calculateCompensation(inputs);
        preAtt = narrQuota > 0 ? runningCredit / narrQuota : 0;
        postAtt = narrQuota > 0 ? (runningCredit + result.narrQuotaRetirement) / narrQuota : 0;
        runningCredit += result.narrQuotaRetirement;
      }

      const nameEl = d.isBase ? null : $('deal-' + d.id + '-name');
      const name = d.isBase ? getDeal1Name() : (nameEl ? nameEl.value || ('Deal ' + (i + 1)) : ('Deal ' + (i + 1)));

      allResults.push({ deal: d, name: name, inputs: inputs, result: result, preAtt: preAtt, postAtt: postAtt, dealNumber: i + 1 });

      // Render inline results for dynamic deals
      if (!d.isBase) {
        renderDealInlineResults(d.id, result, preAtt, postAtt);
      }
    }

    renderPipelineResults(allResults, baseInputs);
  }

  function getDeal1Name() {
    if (dealASection) {
      const title = dealASection.querySelector('.section-title');
      return title ? title.textContent : 'Deal 1';
    }
    return 'Deal 1';
  }

  function buildRateLabelForResult(r, inputs) {
    const parts = ['PCR'];
    if (inputs.newLogoDeal) parts.push(TEAM_PRESETS[currentTeam] && TEAM_PRESETS[currentTeam].mspMode ? 'MSP NARR' : 'New Logo');
    if (inputs.multiYearDeal) parts.push('Multi-Year');
    return parts.join(' + ');
  }

  function renderPipelineResults(allResults, baseInputs) {
    let html = '';
    const quota = baseInputs.dualMeasure ? baseInputs.l3NarrQuota : baseInputs.narrQuota;

    // Cumulative attainment bar
    const segments = buildPipelineSegments(allResults, baseInputs);
    html += buildDealAttainmentBar({ segments: segments, title: baseInputs.dualMeasure ? currentPrimaryLabel + ' Pipeline Attainment' : 'Pipeline Attainment' });

    if (baseInputs.dualMeasure) {
      const l2Segments = buildPipelineSegmentsL2(allResults, baseInputs);
      html += buildDealAttainmentBar({ segments: l2Segments, title: currentSecondaryLabel + ' Pipeline Attainment' });
    }

    // Pipeline summary table
    let totalNarr = 0, totalComm = 0;
    html += `<div class="result-group"><div class="result-group-title">Pipeline Summary</div>`;
    html += `<table class="pipeline-summary-table"><thead><tr><th>#</th><th>Deal</th><th>NARR Retired</th><th>Commission</th><th>Attainment</th></tr></thead><tbody>`;
    for (const dr of allResults) {
      const r = dr.result;
      const crossesThreshold = dr.preAtt < 1.0 && dr.postAtt > 1.0;
      const rowCls = crossesThreshold ? ' class="pipeline-accel-row"' : '';
      html += `<tr${rowCls}>`;
      html += `<td>${dr.dealNumber}</td>`;
      html += `<td>${dr.name}</td>`;
      html += `<td>${formatDollars(r.narrQuotaRetirement)}</td>`;
      html += `<td>${formatDollars(r.totalCommission)}</td>`;
      html += `<td>${(dr.preAtt * 100).toFixed(2)}% → ${(dr.postAtt * 100).toFixed(2)}%</td>`;
      html += `</tr>`;
      totalNarr += r.narrQuotaRetirement;
      totalComm += r.totalCommission;
    }

    const startAtt = allResults[0].preAtt;
    const endAtt = allResults[allResults.length - 1].postAtt;
    html += `<tr class="pipeline-total-row"><td></td><td>Total</td><td>${formatDollars(totalNarr)}</td><td>${formatDollars(totalComm)}</td><td>${(startAtt * 100).toFixed(2)}% → ${(endAtt * 100).toFixed(2)}%</td></tr>`;
    html += `</tbody></table></div>`;

    // Per-deal detailed breakdown (collapsed by default for multi-deal)
    if (allResults.length <= 3) {
      for (const dr of allResults) {
        html += `<div class="result-group"><div class="result-group-title">${dr.name} — Detail</div>`;
        if (baseInputs.dualMeasure) {
          html += buildDualMeasureHtml(dr.result, dr.inputs);
        } else {
          html += buildSingleMeasureHtml(dr.result, dr.inputs);
        }
        html += `</div>`;
      }
    }

    // OTV impact
    const otv = baseInputs.ote * 0.20;
    if (totalComm > 0 && otv > 0) {
      html += `<div class="result-group"><div class="result-group-title">Pipeline OTV Impact</div>`;
      html += resultRow('Total Pipeline Commission', formatDollars(totalComm), 'positive', true);
      html += resultRow('OTV Attainment from Pipeline', formatPercent(totalComm / otv));
      html += `</div>`;
    }

    resultsEl.innerHTML = html;
    updateActionButtons();
  }

  function buildPipelineSegments(allResults, baseInputs) {
    const segments = [];
    const startAtt = allResults[0].preAtt * 100;
    if (startAtt > 0) {
      segments.push({ startPct: 0, endPct: startAtt, color: BAR_COLORS.preDeal, label: 'Pre-pipeline (' + startAtt.toFixed(1) + '%)' });
    }
    for (let i = 0; i < allResults.length; i++) {
      const dr = allResults[i];
      const pre = dr.preAtt * 100;
      const post = dr.postAtt * 100;
      if (post <= pre) continue;
      const color = DEAL_COLORS[i % DEAL_COLORS.length];
      if (pre >= 100) {
        segments.push({ startPct: pre, endPct: post, color: color, label: dr.name });
      } else if (post <= 100) {
        segments.push({ startPct: pre, endPct: post, color: color, label: dr.name });
      } else {
        segments.push({ startPct: pre, endPct: 100, color: color, label: dr.name + ' (base)' });
        segments.push({ startPct: 100, endPct: post, color: color, label: dr.name + ' (accel)' });
      }
    }
    return segments;
  }

  function buildPipelineSegmentsL2(allResults, baseInputs) {
    const segments = [];
    const l2Quota = baseInputs.l2NarrQuota;
    if (!l2Quota) return segments;
    let running = baseInputs.l2NarrQuotaCredit;
    const startPct = (running / l2Quota) * 100;
    if (startPct > 0) {
      segments.push({ startPct: 0, endPct: startPct, color: BAR_COLORS.preDeal, label: 'Pre-pipeline (' + startPct.toFixed(1) + '%)' });
    }
    for (let i = 0; i < allResults.length; i++) {
      const r = allResults[i].result;
      const pre = (running / l2Quota) * 100;
      const post = ((running + r.narrQuotaRetirement) / l2Quota) * 100;
      running += r.narrQuotaRetirement;
      if (post <= pre) continue;
      const color = DEAL_COLORS[i % DEAL_COLORS.length];
      if (pre >= 100) {
        segments.push({ startPct: pre, endPct: post, color: color, label: allResults[i].name });
      } else if (post <= 100) {
        segments.push({ startPct: pre, endPct: post, color: color, label: allResults[i].name });
      } else {
        segments.push({ startPct: pre, endPct: 100, color: color, label: allResults[i].name + ' (base)' });
        segments.push({ startPct: 100, endPct: post, color: color, label: allResults[i].name + ' (accel)' });
      }
    }
    return segments;
  }

  // Pipeline export functions
  function getPipelineData(exportOpts) {
    const baseInputs = getInputs();
    const narrQuota = baseInputs.dualMeasure ? 0 : baseInputs.narrQuota;
    const l3Quota = baseInputs.dualMeasure ? baseInputs.l3NarrQuota : 0;
    const l2Quota = baseInputs.dualMeasure ? baseInputs.l2NarrQuota : 0;
    let runningCredit = baseInputs.dualMeasure ? 0 : baseInputs.narrQuotaCredit;
    let runningL3Credit = baseInputs.dualMeasure ? baseInputs.l3NarrQuotaCredit : 0;
    let runningL2Credit = baseInputs.dualMeasure ? baseInputs.l2NarrQuotaCredit : 0;

    const allDeals = [{ id: 0, name: 'Deal 1', isBase: true }].concat(deals);
    const results = [];

    for (let i = 0; i < allDeals.length; i++) {
      const d = allDeals[i];
      const overrides = d.isBase ? {} : getDealInputs(d.id);
      let inputs, result, preAtt, postAtt;

      if (baseInputs.dualMeasure) {
        inputs = Object.assign({}, baseInputs, overrides, { l3NarrQuotaCredit: runningL3Credit, l2NarrQuotaCredit: runningL2Credit });
        result = calculateDualMeasureCompensation(inputs);
        preAtt = l3Quota > 0 ? runningL3Credit / l3Quota : 0;
        postAtt = l3Quota > 0 ? (runningL3Credit + result.narrQuotaRetirement) / l3Quota : 0;
        runningL3Credit += result.narrQuotaRetirement;
        runningL2Credit += result.narrQuotaRetirement;
      } else {
        inputs = Object.assign({}, baseInputs, overrides, { narrQuotaCredit: runningCredit });
        result = calculateCompensation(inputs);
        preAtt = narrQuota > 0 ? runningCredit / narrQuota : 0;
        postAtt = narrQuota > 0 ? (runningCredit + result.narrQuotaRetirement) / narrQuota : 0;
        runningCredit += result.narrQuotaRetirement;
      }

      const nameEl = d.isBase ? null : $('deal-' + d.id + '-name');
      const name = d.isBase ? 'Deal 1' : (nameEl ? nameEl.value || ('Deal ' + (i + 1)) : ('Deal ' + (i + 1)));
      results.push({ name, inputs, result, preAtt, postAtt });
    }

    return { baseInputs, results, exportOpts };
  }

  function formatPipelinePlainText(exportOpts) {
    const { baseInputs, results } = getPipelineData(exportOpts);
    const obfuscate = exportOpts.obfuscate;
    const h = '[hidden]';
    let lines = [];
    lines.push('Pre-Sales Compensation Calculator — Pipeline');
    lines.push('Team: ' + exportOpts.teamLabel);
    lines.push('Date: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    lines.push('');

    // Profile
    lines.push('--- User Profile ---');
    lines.push('OTE: ' + (obfuscate ? h : formatDollars(baseInputs.ote)));
    lines.push('Salary: ' + (obfuscate ? h : formatDollars(baseInputs.ote * 0.80)));
    lines.push('OTV: ' + (obfuscate ? h : formatDollars(baseInputs.ote * 0.20)));
    if (baseInputs.dualMeasure) {
      lines.push(currentPrimaryLabel + ' NARR Quota: ' + (obfuscate ? h : formatDollars(baseInputs.l3NarrQuota)));
      lines.push(currentSecondaryLabel + ' NARR Quota: ' + (obfuscate ? h : formatDollars(baseInputs.l2NarrQuota)));
    } else {
      lines.push('NARR Quota: ' + (obfuscate ? h : formatDollars(baseInputs.narrQuota)));
      lines.push('Starting Quota Credit: ' + formatDollars(baseInputs.narrQuotaCredit));
    }
    lines.push('');

    // Per-deal
    let totalNarr = 0, totalComm = 0;
    for (let i = 0; i < results.length; i++) {
      const dr = results[i];
      const r = dr.result;
      lines.push('--- ' + dr.name + ' ---');
      lines.push('  IARR: ' + formatDollars(dr.inputs.iarr) + '  |  Renewed ARR: ' + formatDollars(dr.inputs.renewedArr) + '  |  NARR: ' + formatDollars(dr.inputs.newModuleArr));
      lines.push('  New Logo: ' + (dr.inputs.newLogoDeal ? 'Yes' : 'No') + '  |  Multi-Year: ' + (dr.inputs.multiYearDeal ? 'Yes' : 'No'));
      lines.push('  NARR Retired: ' + formatDollars(r.narrQuotaRetirement) + '  |  Commission: ' + formatDollars(r.totalCommission));
      lines.push('  Attainment: ' + (obfuscate ? h : (dr.preAtt * 100).toFixed(2) + '% → ' + (dr.postAtt * 100).toFixed(2) + '%'));
      lines.push('');
      totalNarr += r.narrQuotaRetirement;
      totalComm += r.totalCommission;
    }

    lines.push('--- Pipeline Totals ---');
    lines.push('Total NARR Retired: ' + formatDollars(totalNarr));
    lines.push('Total Commission: ' + formatDollars(totalComm));
    const startAtt = results[0].preAtt;
    const endAtt = results[results.length - 1].postAtt;
    lines.push('Starting Attainment: ' + (obfuscate ? h : (startAtt * 100).toFixed(2) + '%'));
    lines.push('Ending Attainment: ' + (obfuscate ? h : (endAtt * 100).toFixed(2) + '%'));
    lines.push('Deals: ' + results.length);

    return lines.join('\n');
  }

  function buildPipelinePdfHtml(exportOpts) {
    const { baseInputs, results } = getPipelineData(exportOpts);
    const obfuscate = exportOpts.obfuscate;
    const h = '[hidden]';

    let profileRows = '';
    profileRows += buildPdfRow('OTE', obfuscate ? h : formatDollars(baseInputs.ote));
    profileRows += buildPdfRow('Salary', obfuscate ? h : formatDollars(baseInputs.ote * 0.80));
    profileRows += buildPdfRow('OTV', obfuscate ? h : formatDollars(baseInputs.ote * 0.20));
    if (baseInputs.dualMeasure) {
      profileRows += buildPdfRow(currentPrimaryLabel + ' NARR Quota', obfuscate ? h : formatDollars(baseInputs.l3NarrQuota));
      profileRows += buildPdfRow(currentSecondaryLabel + ' NARR Quota', obfuscate ? h : formatDollars(baseInputs.l2NarrQuota));
    } else {
      profileRows += buildPdfRow('NARR Quota', obfuscate ? h : formatDollars(baseInputs.narrQuota));
      profileRows += buildPdfRow('Starting Quota Credit', formatDollars(baseInputs.narrQuotaCredit));
    }

    let dealSections = '';
    let totalNarr = 0, totalComm = 0;
    for (const dr of results) {
      const r = dr.result;
      let rows = '';
      rows += buildPdfRow('IARR', formatDollars(dr.inputs.iarr));
      rows += buildPdfRow('Renewed ARR', formatDollars(dr.inputs.renewedArr));
      rows += buildPdfRow('NARR', formatDollars(dr.inputs.newModuleArr));
      rows += buildPdfRow('New Logo', dr.inputs.newLogoDeal ? 'Yes' : 'No');
      rows += buildPdfRow('Multi-Year', dr.inputs.multiYearDeal ? 'Yes' : 'No');
      rows += buildPdfRow('NARR Retired', formatDollars(r.narrQuotaRetirement));
      rows += buildPdfRow('Commission', formatDollars(r.totalCommission));
      rows += buildPdfRow('Attainment', obfuscate ? h : (dr.preAtt * 100).toFixed(2) + '% → ' + (dr.postAtt * 100).toFixed(2) + '%');
      dealSections += buildPdfSection(dr.name, rows);
      totalNarr += r.narrQuotaRetirement;
      totalComm += r.totalCommission;
    }

    const startAtt = results[0].preAtt;
    const endAtt = results[results.length - 1].postAtt;
    let totalRows = '';
    totalRows += buildPdfRow('Total NARR Retired', formatDollars(totalNarr));
    totalRows += buildPdfRow('Total Commission', formatDollars(totalComm));
    totalRows += buildPdfRow('Starting Attainment', obfuscate ? h : (startAtt * 100).toFixed(2) + '%');
    totalRows += buildPdfRow('Ending Attainment', obfuscate ? h : (endAtt * 100).toFixed(2) + '%');
    totalRows += buildPdfRow('Deals', '' + results.length);

    return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background:#0c0f24;color:#e8e8f0;padding:30px 40px;font-size:12px;margin:0">'
      + '<div style="border-bottom:2px solid #751323;padding-bottom:10px;margin-bottom:16px">'
      + '<div style="font-size:16px;font-weight:700;color:#e8e8f0">Pipeline Breakdown</div>'
      + '<div style="font-size:11px;color:#a0a8c8;margin-top:2px">Team: ' + exportOpts.teamLabel + '  |  ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + '</div>'
      + '</div>'
      + buildPdfSection('User Profile', profileRows)
      + dealSections
      + buildPdfSection('Pipeline Totals', totalRows)
      + '<div style="margin-top:20px;padding-top:8px;border-top:1px solid #2a3368;font-size:9px;color:#6070a0;text-align:center">Generated by Pre-Sales Compensation Calculator' + (appVersion ? ' v' + appVersion : '') + '</div>'
      + '</body></html>';
  }

  function buildAnnualMeasureBreakdown(measureResult, label, sublabel) {
    if (!measureResult) return '';
    let html = `<div class="result-measure-section">`;
    html += `<div class="result-measure-title">${label} (${sublabel})</div>`;
    html += `<div class="result-group">`;
    html += resultRow('Total NARR', formatDollars(measureResult.totalNarr));
    html += resultRow('Target Attainment', formatPercent(measureResult.targetAttainment));
    html += `</div>`;

    html += buildBucketBreakdown(measureResult);

    html += resultRow('Measure Commission', formatDollars(measureResult.totalVariable), 'positive');
    html += `</div>`;
    return html;
  }

  function buildAnnualSingleBreakdown(r, inputs) {
    let html = `<div class="result-group">`;
    html += `<div class="result-group-title">Commission Breakdown</div>`;
    html += resultRow('Total NARR', formatDollars(r.totalNarr));

    html += buildBucketBreakdown(r);

    if (r.rarrCommission > 0) {
      html += `<div class="result-divider"></div>`;
      html += resultRow('RARR Commission', formatDollars(r.rarrCommission), 'positive');
      html += `<div class="rate-breakdown">${formatDollars(inputs.totalRenewedArr)} × ${formatRateAsPercent((isLatamMode() || isRarrMode()) ? parseRate(fields.rarrRate.value) : 0)}</div>`;
    }

    html += `</div>`;
    return html;
  }

  function buildBucketBreakdown(r) {
    let html = '';

    // Below 100%
    if (r.commissionBelow > 0) {
      html += `<div class="result-group-title" style="margin-top:8px">Below 100% Attainment</div>`;
      for (const b of r.breakdown) {
        if (b.narrBelow <= 0) continue;
        html += resultRow(b.label, formatDollars(b.commissionBelow));
        html += `<div class="rate-breakdown">${formatDollars(b.narrBelow)} × ${formatRateAsPercent(b.baseRate)}</div>`;
      }
      html += resultRow('Subtotal', formatDollars(r.commissionBelow));
    }

    // Above 100%
    if (r.commissionAbove > 0) {
      html += `<div class="result-divider"></div>`;
      html += `<div class="result-group-title">Above 100% Attainment (Accelerated)</div>`;
      for (const b of r.breakdown) {
        if (b.narrAbove <= 0) continue;
        html += resultRow(b.label, formatDollars(b.commissionAbove));
        html += `<div class="rate-breakdown">${formatDollars(b.narrAbove)} × ${formatRateAsPercent(b.accelRate)}</div>`;
      }
      html += resultRow('Subtotal', formatDollars(r.commissionAbove));
    }

    return html;
  }

  function buildSensitivityTable(inputs) {
    const levels = [0.50, 0.75, 1.00, 1.10, 1.20, 1.50];
    const currentTarget = inputs.dualMeasure
      ? ((inputs.l3TargetAttainment + inputs.l2TargetAttainment) / 2)
      : inputs.targetAttainment;
    const salary = inputs.ote * 0.80;
    const otv = inputs.ote * 0.20;

    // Find the single closest level to user's target
    let closestLevel = levels[0];
    let closestDiff = Infinity;
    for (var i = 0; i < levels.length; i++) {
      var diff = Math.abs(levels[i] - currentTarget);
      if (diff < closestDiff) { closestDiff = diff; closestLevel = levels[i]; }
    }

    let rows = '';
    for (const level of levels) {
      let totalVariable;
      if (inputs.dualMeasure) {
        const r = calculateDualMeasureAnnualCompensation(Object.assign({}, inputs, {
          l3TargetAttainment: level,
          l2TargetAttainment: level
        }));
        totalVariable = r.totalVariable;
      } else {
        const pcr = inputs.narrQuota > 0 ? otv / inputs.narrQuota : 0;
        const r = calculateAnnualCompensation({
          narrQuota: inputs.narrQuota,
          targetAttainment: level,
          pcr: pcr,
          newLogoUplift: parseRate(fields.newLogoUplift.value),
          multiYearUplift: parseRate(fields.multiYearUplift.value),
          acceleratedPcr: parseRate(fields.acceleratedPcr.value),
          newLogoPct: inputs.newLogoPct,
          multiYearPct: inputs.multiYearPct,
          rarrRate: (isLatamMode() || isRarrMode()) ? parseRate(fields.rarrRate.value) : 0,
          totalRenewedArr: (isLatamMode() || isRarrMode()) ? inputs.totalRenewedArr : 0
        });
        totalVariable = r.totalVariable;
      }

      const totalNarr = inputs.dualMeasure
        ? (inputs.l3NarrQuota * level + inputs.l2NarrQuota * level)
        : (inputs.narrQuota * level);
      const totalComp = salary + totalVariable;
      const otvAtt = otv > 0 ? totalVariable / otv : 0;

      const cls = level === closestLevel ? ' class="sensitivity-active"' : '';
      rows += `<tr${cls}>
        <td>${(level * 100).toFixed(0)}%</td>
        <td>${formatDollars(totalNarr)}</td>
        <td>${formatDollars(totalVariable)}</td>
        <td>${formatDollars(totalComp)}</td>
        <td>${formatPercent(otvAtt)}</td>
      </tr>`;
    }

    return `<div class="sensitivity-table-wrap">
      <div class="sensitivity-table-title">Sensitivity Analysis</div>
      <table class="sensitivity-table">
        <thead>
          <tr>
            <th>Attainment</th>
            <th>Total NARR</th>
            <th>Variable Comp</th>
            <th>Total Comp</th>
            <th>OTV Attainment</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  function extractDisplayData(results, inputs, options) {
    const obfuscate = options.obfuscate || false;
    const data = {
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      teamLabel: options.teamLabel,
      dualMeasure: options.dualMeasure,
      primaryLabel: options.primaryLabel || 'L3',
      secondaryLabel: options.secondaryLabel || 'L2'
    };

    const h = '[hidden]';
    if (options.dualMeasure) {
      data.profile = {
        ote: obfuscate ? h : formatDollars(inputs.ote),
        salary: obfuscate ? h : formatDollars(results.salary),
        otv: obfuscate ? h : formatDollars(results.otv),
        l3NarrQuota: obfuscate ? h : formatDollars(inputs.l3NarrQuota),
        l2NarrQuota: obfuscate ? h : formatDollars(inputs.l2NarrQuota),
        l3Pcr: obfuscate ? h : formatRateAsPercent(results.l3Pcr),
        l2Pcr: obfuscate ? h : formatRateAsPercent(results.l2Pcr),
        l3NarrQuotaCredit: formatDollars(inputs.l3NarrQuotaCredit),
        l2NarrQuotaCredit: formatDollars(inputs.l2NarrQuotaCredit),
        l3Attainment: obfuscate ? h : (inputs.l3NarrQuota > 0 ? (inputs.l3NarrQuotaCredit / inputs.l3NarrQuota * 100).toFixed(2) + '%' : 'N/A'),
        l2Attainment: obfuscate ? h : (inputs.l2NarrQuota > 0 ? (inputs.l2NarrQuotaCredit / inputs.l2NarrQuota * 100).toFixed(2) + '%' : 'N/A'),
        splitLabel: Math.round(inputs.primarySplit * 100) + '/' + Math.round(inputs.secondarySplit * 100)
      };
    } else {
      data.profile = {
        ote: obfuscate ? h : formatDollars(inputs.ote),
        salary: obfuscate ? h : formatDollars(results.salary),
        otv: obfuscate ? h : formatDollars(results.otv),
        narrQuota: obfuscate ? h : formatDollars(inputs.narrQuota),
        pcr: obfuscate ? h : formatRateAsPercent(results.pcr),
        narrQuotaCredit: formatDollars(inputs.narrQuotaCredit),
        attainment: obfuscate ? h : formatPercent(results.narrQuotaAttainment)
      };
    }

    data.deal = {
      iarr: formatDollars(inputs.iarr),
      renewedArr: formatDollars(inputs.renewedArr),
      carr: formatDollars(inputs.carr),
      narr: formatDollars(inputs.newModuleArr),
      newLogo: inputs.newLogoDeal ? 'Yes' : 'No',
      multiYear: inputs.multiYearDeal ? 'Yes' : 'No'
    };

    data.results = {
      day1Arr: formatDollars(results.day1Arr),
      narrQuotaRetirement: formatDollars(results.narrQuotaRetirement),
      totalCommission: formatDollars(results.totalCommission),
      otvAttainment: obfuscate ? h : (results.totalCommission > 0 ? formatPercent(results.otvAttainment) : 'N/A')
    };

    if (options.dualMeasure) {
      if (results.dealInL3 && results.l3) {
        data.results.l3 = extractMeasureData(results.l3, data.primaryLabel, inputs, obfuscate);
      }
      data.results.l2 = extractMeasureData(results.l2, data.secondaryLabel, inputs, obfuscate);
      data.results.dealInL3 = results.dealInL3;
    } else {
      data.results.preDealAttainment = obfuscate ? h : formatPercent(results.narrQuotaAttainment);
      data.results.postDealAttainment = obfuscate ? h : formatPercent(results.postDealAttainment);
      data.results.baseRate = obfuscate ? '[hidden]' : formatRateAsPercent(results.baseRate);
      data.results.baseRateLabel = buildRateLabel(results, inputs);
      data.results.straddlesThreshold = results.straddlesThreshold;
      if (results.straddlesThreshold) {
        data.results.acceleratedRate = obfuscate ? '[hidden]' : formatRateAsPercent(results.acceleratedRate);
        data.results.narrBelow = formatDollars(results.narrBelow);
        data.results.commissionBelow = formatDollars(results.commissionBelow);
        data.results.narrAbove = formatDollars(results.narrAbove);
        data.results.commissionAbove = formatDollars(results.commissionAbove);
      }
      data.results.narrCommission = formatDollars(results.narrCommission);
      if ((results.latamMode || results.rarrMode) && inputs.renewedArr > 0) {
        data.results.rarrCommission = formatDollars(results.rarrCommission);
        data.results.rarrRate = formatRateAsPercent(inputs.rarrRate);
      }
    }

    return data;
  }

  function extractMeasureData(measure, label, inputs, obfuscate) {
    const rateLabel = buildMeasureRateLabel(label, inputs.newLogoDeal, inputs.multiYearDeal);
    const d = {
      label: label,
      preDealAttainment: obfuscate ? '[hidden]' : formatPercent(measure.narrQuotaAttainment),
      postDealAttainment: obfuscate ? '[hidden]' : formatPercent(measure.postDealAttainment),
      baseRate: obfuscate ? '[hidden]' : formatRateAsPercent(measure.baseRate),
      baseRateLabel: rateLabel,
      pcr: obfuscate ? '[hidden]' : formatRateAsPercent(measure.pcr),
      commission: formatDollars(measure.commission),
      straddlesThreshold: measure.straddlesThreshold
    };
    if (measure.straddlesThreshold) {
      d.acceleratedRate = obfuscate ? '[hidden]' : formatRateAsPercent(measure.acceleratedRate);
      d.narrBelow = formatDollars(measure.narrBelow);
      d.commissionBelow = formatDollars(measure.commissionBelow);
      d.narrAbove = formatDollars(measure.narrAbove);
      d.commissionAbove = formatDollars(measure.commissionAbove);
    }
    return d;
  }

  function formatMeasurePlainText(m, indent) {
    indent = indent || '';
    let lines = [];
    lines.push(indent + 'Pre-Deal Attainment: ' + m.preDealAttainment);
    lines.push(indent + 'Post-Deal Attainment: ' + m.postDealAttainment);
    lines.push(indent + 'Base Rate: ' + m.baseRate + ' (' + m.baseRateLabel + ')');
    if (m.straddlesThreshold) {
      lines.push(indent + 'Accelerated Rate: ' + m.acceleratedRate);
      if (m.narrBelow) lines.push(indent + 'NARR Below 100%: ' + m.narrBelow + ' → Commission: ' + m.commissionBelow);
      lines.push(indent + 'NARR Above 100%: ' + m.narrAbove + ' → Commission: ' + m.commissionAbove);
    }
    lines.push(indent + 'Commission: ' + m.commission);
    return lines.join('\n');
  }

  function formatPlainTextSummary(data) {
    let lines = [];
    lines.push('Pre-Sales Compensation Calculator');
    lines.push('Team: ' + data.teamLabel);
    lines.push('Date: ' + data.date);
    lines.push('');

    lines.push('--- User Profile ---');
    lines.push('OTE: ' + data.profile.ote);
    lines.push('Salary: ' + data.profile.salary);
    lines.push('OTV: ' + data.profile.otv);

    if (data.dualMeasure) {
      lines.push('OTV Split: ' + data.profile.splitLabel);
      lines.push(data.primaryLabel + ' NARR Quota: ' + data.profile.l3NarrQuota);
      lines.push(data.primaryLabel + ' PCR: ' + data.profile.l3Pcr);
      lines.push(data.primaryLabel + ' Quota Credit: ' + data.profile.l3NarrQuotaCredit);
      lines.push(data.primaryLabel + ' Attainment: ' + data.profile.l3Attainment);
      lines.push(data.secondaryLabel + ' NARR Quota: ' + data.profile.l2NarrQuota);
      lines.push(data.secondaryLabel + ' PCR: ' + data.profile.l2Pcr);
      lines.push(data.secondaryLabel + ' Quota Credit: ' + data.profile.l2NarrQuotaCredit);
      lines.push(data.secondaryLabel + ' Attainment: ' + data.profile.l2Attainment);
    } else {
      lines.push('NARR Quota: ' + data.profile.narrQuota);
      lines.push('PCR: ' + data.profile.pcr);
      lines.push('NARR Quota Credit: ' + data.profile.narrQuotaCredit);
      lines.push('Quota Attainment: ' + data.profile.attainment);
    }

    lines.push('');
    lines.push('--- Deal Details ---');
    lines.push('IARR: ' + data.deal.iarr);
    lines.push('Renewed ARR: ' + data.deal.renewedArr);
    lines.push('CARR: ' + data.deal.carr + ' (informational only)');
    lines.push('NARR: ' + data.deal.narr);
    lines.push('New Logo: ' + data.deal.newLogo);
    lines.push('Multi-Year: ' + data.deal.multiYear);

    lines.push('');
    lines.push('--- Results ---');
    lines.push('Day 1 ARR: ' + data.results.day1Arr);
    lines.push('NARR Quota Retirement: ' + data.results.narrQuotaRetirement);

    if (data.dualMeasure) {
      if (data.results.dealInL3 && data.results.l3) {
        lines.push('');
        lines.push('  ' + data.primaryLabel + ' Commission:');
        lines.push(formatMeasurePlainText(data.results.l3, '  '));
      }
      if (data.results.l2) {
        lines.push('');
        lines.push('  ' + data.secondaryLabel + ' Commission:');
        lines.push(formatMeasurePlainText(data.results.l2, '  '));
      }
      lines.push('');
      lines.push('Total Deal Commission: ' + data.results.totalCommission);
    } else {
      lines.push('Pre-Deal Attainment: ' + data.results.preDealAttainment);
      lines.push('Post-Deal Attainment: ' + data.results.postDealAttainment);
      lines.push('Base Rate: ' + data.results.baseRate + ' (' + data.results.baseRateLabel + ')');
      if (data.results.straddlesThreshold) {
        lines.push('Accelerated Rate: ' + data.results.acceleratedRate);
        if (data.results.narrBelow) lines.push('NARR Below 100%: ' + data.results.narrBelow + ' → Commission: ' + data.results.commissionBelow);
        lines.push('NARR Above 100%: ' + data.results.narrAbove + ' → Commission: ' + data.results.commissionAbove);
      }
      if (data.results.rarrCommission) {
        lines.push('NARR Commission: ' + data.results.narrCommission);
        lines.push('RARR Commission: ' + data.results.rarrCommission + ' (' + data.results.rarrRate + ' of Renewed ARR)');
      }
      lines.push('Total Deal Commission: ' + data.results.totalCommission);
    }

    if (data.results.otvAttainment !== 'N/A') {
      lines.push('OTV Attainment from Deal: ' + data.results.otvAttainment);
    }

    return lines.join('\n');
  }

  function buildPdfRow(label, value) {
    return '<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(42,51,104,0.4)"><span style="font-size:11px;color:#a0a8c8">' + label + '</span><span style="font-family:\'Consolas\',monospace;font-size:12px;font-weight:600;color:#e8e8f0">' + value + '</span></div>';
  }

  function buildPdfSection(title, rows) {
    return '<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6070a0;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #2a3368">' + title + '</div>' + rows + '</div>';
  }

  function buildPdfMeasureSection(m, label) {
    let rows = '';
    rows += buildPdfRow('Pre-Deal Attainment', m.preDealAttainment);
    rows += buildPdfRow('Post-Deal Attainment', m.postDealAttainment);
    rows += buildPdfRow('Base Rate', m.baseRate);
    if (m.straddlesThreshold) {
      rows += buildPdfRow('Accelerated Rate', m.acceleratedRate);
      if (m.narrBelow) rows += buildPdfRow('NARR Below 100%', m.narrBelow + ' → ' + m.commissionBelow);
      rows += buildPdfRow('NARR Above 100%', m.narrAbove + ' → ' + m.commissionAbove);
    }
    rows += buildPdfRow('Commission', m.commission);
    return '<div style="margin-bottom:12px;padding:10px;background:rgba(16,24,66,0.5);border:1px solid #2a3368;border-radius:6px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#751323;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #2a3368">' + label + '</div>' + rows + '</div>';
  }

  function buildPdfHtml(data, options) {
    const version = options.appVersion || '';
    let profileRows = '';
    profileRows += buildPdfRow('OTE', data.profile.ote);
    profileRows += buildPdfRow('Salary', data.profile.salary);
    profileRows += buildPdfRow('OTV', data.profile.otv);

    if (data.dualMeasure) {
      profileRows += buildPdfRow('OTV Split', data.profile.splitLabel);
      profileRows += buildPdfRow(data.primaryLabel + ' NARR Quota', data.profile.l3NarrQuota);
      profileRows += buildPdfRow(data.primaryLabel + ' PCR', data.profile.l3Pcr);
      profileRows += buildPdfRow(data.primaryLabel + ' Quota Credit', data.profile.l3NarrQuotaCredit);
      profileRows += buildPdfRow(data.primaryLabel + ' Attainment', data.profile.l3Attainment);
      profileRows += buildPdfRow(data.secondaryLabel + ' NARR Quota', data.profile.l2NarrQuota);
      profileRows += buildPdfRow(data.secondaryLabel + ' PCR', data.profile.l2Pcr);
      profileRows += buildPdfRow(data.secondaryLabel + ' Quota Credit', data.profile.l2NarrQuotaCredit);
      profileRows += buildPdfRow(data.secondaryLabel + ' Attainment', data.profile.l2Attainment);
    } else {
      profileRows += buildPdfRow('NARR Quota', data.profile.narrQuota);
      profileRows += buildPdfRow('PCR', data.profile.pcr);
      profileRows += buildPdfRow('NARR Quota Credit', data.profile.narrQuotaCredit);
      profileRows += buildPdfRow('Quota Attainment', data.profile.attainment);
    }

    let dealRows = '';
    dealRows += buildPdfRow('IARR', data.deal.iarr);
    dealRows += buildPdfRow('Renewed ARR', data.deal.renewedArr);
    dealRows += buildPdfRow('CARR (informational)', data.deal.carr);
    dealRows += buildPdfRow('NARR', data.deal.narr);
    dealRows += buildPdfRow('New Logo', data.deal.newLogo);
    dealRows += buildPdfRow('Multi-Year', data.deal.multiYear);

    let resultsContent = '';
    resultsContent += buildPdfRow('Day 1 ARR', data.results.day1Arr);
    resultsContent += buildPdfRow('NARR Quota Retirement', data.results.narrQuotaRetirement);

    let measuresHtml = '';
    if (data.dualMeasure) {
      if (data.results.dealInL3 && data.results.l3) {
        measuresHtml += buildPdfMeasureSection(data.results.l3, data.primaryLabel + ' Commission');
      }
      if (data.results.l2) {
        measuresHtml += buildPdfMeasureSection(data.results.l2, data.secondaryLabel + ' Commission');
      }
      resultsContent += measuresHtml;
      resultsContent += buildPdfRow('Total Deal Commission', data.results.totalCommission);
    } else {
      resultsContent += buildPdfRow('Pre-Deal Attainment', data.results.preDealAttainment);
      resultsContent += buildPdfRow('Post-Deal Attainment', data.results.postDealAttainment);
      resultsContent += buildPdfRow('Base Rate', data.results.baseRate + ' (' + data.results.baseRateLabel + ')');
      if (data.results.straddlesThreshold) {
        resultsContent += buildPdfRow('Accelerated Rate', data.results.acceleratedRate);
        if (data.results.narrBelow) resultsContent += buildPdfRow('NARR Below 100%', data.results.narrBelow + ' → ' + data.results.commissionBelow);
        resultsContent += buildPdfRow('NARR Above 100%', data.results.narrAbove + ' → ' + data.results.commissionAbove);
      }
      if (data.results.rarrCommission) {
        resultsContent += buildPdfRow('NARR Commission', data.results.narrCommission);
        resultsContent += buildPdfRow('RARR Commission', data.results.rarrCommission);
      }
      resultsContent += buildPdfRow('Total Deal Commission', data.results.totalCommission);
    }
    if (data.results.otvAttainment !== 'N/A') {
      resultsContent += buildPdfRow('OTV Attainment from Deal', data.results.otvAttainment);
    }

    return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background:#0c0f24;color:#e8e8f0;padding:30px 40px;font-size:12px;margin:0">'
      + '<div style="border-bottom:2px solid #751323;padding-bottom:10px;margin-bottom:16px">'
      + '<div style="font-size:16px;font-weight:700;color:#e8e8f0">Commission Breakdown</div>'
      + '<div style="font-size:11px;color:#a0a8c8;margin-top:2px">Team: ' + data.teamLabel + '  |  ' + data.date + '</div>'
      + '</div>'
      + buildPdfSection('User Profile', profileRows)
      + buildPdfSection('Deal Details', dealRows)
      + buildPdfSection('Results', resultsContent)
      + '<div style="margin-top:20px;padding-top:8px;border-top:1px solid #2a3368;font-size:9px;color:#6070a0;text-align:center">Generated by Pre-Sales Compensation Calculator' + (version ? ' v' + version : '') + '</div>'
      + '</body></html>';
  }

  function getComparisonData(exportOpts) {
    const inputsA = getInputs();
    const dealB = getDealBInputs();
    const inputsB = Object.assign({}, inputsA, {
      iarr: dealB.iarr, renewedArr: dealB.renewedArr,
      carr: dealB.carr, newModuleArr: dealB.newModuleArr,
      newLogoDeal: dealB.newLogoDeal, multiYearDeal: dealB.multiYearDeal
    });
    if (inputsA.dualMeasure) inputsB.dealInL3 = dealB.dealInL3;
    const rA = inputsA.dualMeasure ? calculateDualMeasureCompensation(inputsA) : calculateCompensation(inputsA);
    const rB = inputsB.dualMeasure ? calculateDualMeasureCompensation(inputsB) : calculateCompensation(inputsB);
    const dataA = extractDisplayData(rA, inputsA, exportOpts);
    const dataB = extractDisplayData(rB, inputsB, exportOpts);
    return { dataA, dataB, rA, rB };
  }

  function formatComparisonDelta(rA, rB) {
    const commDelta = rA.totalCommission - rB.totalCommission;
    const narrDelta = rA.narrQuotaRetirement - rB.narrQuotaRetirement;
    function fmtDelta(val, fmt) {
      if (val === 0) return 'Even';
      return (val > 0 ? 'Deal A +' : 'Deal B +') + fmt(Math.abs(val));
    }
    let lines = [];
    lines.push('--- Comparison ---');
    lines.push('Commission Delta: ' + fmtDelta(commDelta, formatDollars));
    lines.push('NARR Retirement Delta: ' + fmtDelta(narrDelta, formatDollars));
    return lines.join('\n');
  }

  function formatComparisonPlainText(exportOpts) {
    const { dataA, dataB, rA, rB } = getComparisonData(exportOpts);
    let lines = [];
    lines.push('Pre-Sales Compensation Calculator — Deal Comparison');
    lines.push('Team: ' + exportOpts.teamLabel);
    lines.push('Date: ' + dataA.date);
    lines.push('');

    // Profile (shared)
    lines.push('--- User Profile ---');
    lines.push('OTE: ' + dataA.profile.ote);
    lines.push('Salary: ' + dataA.profile.salary);
    lines.push('OTV: ' + dataA.profile.otv);
    if (dataA.dualMeasure) {
      lines.push(dataA.primaryLabel + ' NARR Quota: ' + dataA.profile.l3NarrQuota);
      lines.push(dataA.secondaryLabel + ' NARR Quota: ' + dataA.profile.l2NarrQuota);
    } else {
      lines.push('NARR Quota: ' + dataA.profile.narrQuota);
      lines.push('PCR: ' + dataA.profile.pcr);
    }
    lines.push('');

    // Deal A
    lines.push('--- Deal A ---');
    lines.push('IARR: ' + dataA.deal.iarr + '  |  Renewed ARR: ' + dataA.deal.renewedArr + '  |  NARR: ' + dataA.deal.narr);
    lines.push('New Logo: ' + dataA.deal.newLogo + '  |  Multi-Year: ' + dataA.deal.multiYear);
    lines.push('Day 1 ARR: ' + dataA.results.day1Arr + '  |  NARR Retirement: ' + dataA.results.narrQuotaRetirement);
    lines.push('Total Commission: ' + dataA.results.totalCommission);
    lines.push('');

    // Deal B
    lines.push('--- Deal B ---');
    lines.push('IARR: ' + dataB.deal.iarr + '  |  Renewed ARR: ' + dataB.deal.renewedArr + '  |  NARR: ' + dataB.deal.narr);
    lines.push('New Logo: ' + dataB.deal.newLogo + '  |  Multi-Year: ' + dataB.deal.multiYear);
    lines.push('Day 1 ARR: ' + dataB.results.day1Arr + '  |  NARR Retirement: ' + dataB.results.narrQuotaRetirement);
    lines.push('Total Commission: ' + dataB.results.totalCommission);
    lines.push('');

    lines.push(formatComparisonDelta(rA, rB));
    return lines.join('\n');
  }

  function buildComparisonPdfHtml(exportOpts) {
    const { dataA, dataB, rA, rB } = getComparisonData(exportOpts);
    const commDelta = rA.totalCommission - rB.totalCommission;
    const narrDelta = rA.narrQuotaRetirement - rB.narrQuotaRetirement;
    function deltaColor(val) { return val > 0 ? '#4caf50' : val < 0 ? '#ef5350' : '#6070a0'; }
    function fmtDelta(val, fmt) { return val === 0 ? 'Even' : (val > 0 ? 'Deal A +' : 'Deal B +') + fmt(Math.abs(val)); }

    function dealCol(data, label) {
      let h = '<div style="flex:1;padding:0 8px">';
      h += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#751323;border-bottom:2px solid #751323;padding-bottom:4px;margin-bottom:8px">' + label + '</div>';
      h += buildPdfRow('IARR', data.deal.iarr);
      h += buildPdfRow('Renewed ARR', data.deal.renewedArr);
      h += buildPdfRow('NARR', data.deal.narr);
      h += buildPdfRow('New Logo', data.deal.newLogo);
      h += buildPdfRow('Multi-Year', data.deal.multiYear);
      h += '<div style="margin-top:8px"></div>';
      h += buildPdfRow('Day 1 ARR', data.results.day1Arr);
      h += buildPdfRow('NARR Retirement', data.results.narrQuotaRetirement);
      h += buildPdfRow('Total Commission', data.results.totalCommission);
      if (data.results.otvAttainment !== 'N/A') h += buildPdfRow('OTV Attainment', data.results.otvAttainment);
      h += '</div>';
      return h;
    }

    let profileRows = '';
    profileRows += buildPdfRow('OTE', dataA.profile.ote);
    profileRows += buildPdfRow('Salary', dataA.profile.salary);
    profileRows += buildPdfRow('OTV', dataA.profile.otv);
    if (dataA.dualMeasure) {
      profileRows += buildPdfRow(dataA.primaryLabel + ' NARR Quota', dataA.profile.l3NarrQuota);
      profileRows += buildPdfRow(dataA.secondaryLabel + ' NARR Quota', dataA.profile.l2NarrQuota);
    } else {
      profileRows += buildPdfRow('NARR Quota', dataA.profile.narrQuota);
      profileRows += buildPdfRow('PCR', dataA.profile.pcr);
    }

    let compRow = '';
    compRow += '<div style="display:flex;justify-content:space-between;padding:3px 0"><span style="font-size:11px;color:#a0a8c8">Commission Delta</span><span style="font-family:Consolas,monospace;font-size:12px;font-weight:600;color:' + deltaColor(commDelta) + '">' + fmtDelta(commDelta, formatDollars) + '</span></div>';
    compRow += '<div style="display:flex;justify-content:space-between;padding:3px 0"><span style="font-size:11px;color:#a0a8c8">NARR Retirement Delta</span><span style="font-family:Consolas,monospace;font-size:12px;font-weight:600;color:' + deltaColor(narrDelta) + '">' + fmtDelta(narrDelta, formatDollars) + '</span></div>';

    const version = appVersion;
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0c0f24;color:#e8e8f0;padding:30px 40px;font-size:12px;margin:0">'
      + '<div style="border-bottom:2px solid #751323;padding-bottom:10px;margin-bottom:16px">'
      + '<div style="font-size:16px;font-weight:700">Commission Comparison</div>'
      + '<div style="font-size:11px;color:#a0a8c8;margin-top:2px">Team: ' + exportOpts.teamLabel + '  |  ' + dataA.date + '</div>'
      + '</div>'
      + buildPdfSection('User Profile', profileRows)
      + '<div style="display:flex;gap:16px;margin-bottom:14px">'
      + dealCol(dataA, 'Deal A')
      + dealCol(dataB, 'Deal B')
      + '</div>'
      + buildPdfSection('Comparison', compRow)
      + '<div style="margin-top:20px;padding-top:8px;border-top:1px solid #2a3368;font-size:9px;color:#6070a0;text-align:center">Generated by Pre-Sales Compensation Calculator' + (version ? ' v' + version : '') + '</div>'
      + '</body></html>';
  }

  function getDealBInputs() {
    return {
      iarr: parseCurrency(dealBFields.iarr.value),
      renewedArr: parseCurrency(dealBFields.renewedArr.value),
      carr: parseCurrency(dealBFields.carr.value),
      newModuleArr: parseCurrency(dealBFields.newModuleArr.value),
      newLogoDeal: bNewLogoToggle.classList.contains('active'),
      multiYearDeal: !multiYearDisabled && bMultiYearToggle.classList.contains('active'),
      dealInL3: bL3RegionToggle.classList.contains('active')
    };
  }

  function buildComparisonSummary(rA, rB) {
    const commDelta = rA.totalCommission - rB.totalCommission;
    const narrDelta = rA.narrQuotaRetirement - rB.narrQuotaRetirement;

    let attDeltaA, attDeltaB;
    if (rA.postDealAttainment !== undefined) {
      attDeltaA = rA.postDealAttainment;
      attDeltaB = rB.postDealAttainment;
    } else {
      attDeltaA = rA.otvAttainment;
      attDeltaB = rB.otvAttainment;
    }
    const attDelta = attDeltaA - attDeltaB;

    function deltaClass(val) {
      if (val > 0) return 'delta-positive';
      if (val < 0) return 'delta-negative';
      return 'delta-even';
    }

    function deltaLabel(val, formatter, label) {
      if (val === 0) return 'Even';
      const abs = Math.abs(val);
      const prefix = val > 0 ? 'Deal A +' : 'Deal B +';
      return prefix + formatter(abs);
    }

    let html = '<div class="comparison-summary">';
    html += '<div class="result-group-title">Comparison</div>';
    html += resultRow('Commission Delta', deltaLabel(commDelta, formatDollars, ''), deltaClass(commDelta));
    html += resultRow('NARR Retirement Delta', deltaLabel(narrDelta, formatDollars, ''), deltaClass(narrDelta));
    html += resultRow('Post-Deal Attainment Delta', deltaLabel(attDelta, formatPercent, ''), deltaClass(attDelta));
    html += '</div>';
    return html;
  }

  function renderComparisonResults(rA, inputsA, rB, inputsB) {
    const builderA = inputsA.dualMeasure ? buildDualMeasureHtml : buildSingleMeasureHtml;
    const builderB = inputsB.dualMeasure ? buildDualMeasureHtml : buildSingleMeasureHtml;

    let html = '<div class="comparison-grid">';
    html += '<div class="comparison-col">';
    html += '<div class="comparison-col-title">Deal A</div>';
    html += builderA(rA, inputsA);
    html += '</div>';
    html += '<div class="comparison-col">';
    html += '<div class="comparison-col-title">Deal B</div>';
    html += builderB(rB, inputsB);
    html += '</div>';
    html += '</div>';

    html += buildComparisonSummary(rA, rB);

    resultsEl.innerHTML = html;
    updateActionButtons();
  }

  function recalculateComparison() {
    const inputsA = getInputs();
    const dealB = getDealBInputs();

    // Merge profile from A with deal fields from B
    const inputsB = Object.assign({}, inputsA, {
      iarr: dealB.iarr,
      renewedArr: dealB.renewedArr,
      carr: dealB.carr,
      newModuleArr: dealB.newModuleArr,
      newLogoDeal: dealB.newLogoDeal,
      multiYearDeal: dealB.multiYearDeal
    });
    if (inputsA.dualMeasure) {
      inputsB.dealInL3 = dealB.dealInL3;
    }

    const rA = inputsA.dualMeasure
      ? calculateDualMeasureCompensation(inputsA)
      : calculateCompensation(inputsA);
    const rB = inputsB.dualMeasure
      ? calculateDualMeasureCompensation(inputsB)
      : calculateCompensation(inputsB);

    // Update profile computed fields from Deal A
    if (inputsA.dualMeasure) {
      setCurrencyDisplay(fields.salary, rA.salary);
      setCurrencyDisplay(fields.otv, rA.otv);
      fields.l3Pcr.value = inputsA.l3NarrQuota > 0 ? formatRateAsPercent(rA.l3Pcr) : '';
      fields.l2Pcr.value = inputsA.l2NarrQuota > 0 ? formatRateAsPercent(rA.l2Pcr) : '';
      if (inputsA.l3NarrQuota > 0) {
        fields.l3Attainment.value = (inputsA.l3NarrQuotaCredit / inputsA.l3NarrQuota * 100).toFixed(2);
      }
      if (inputsA.l2NarrQuota > 0) {
        fields.l2Attainment.value = (inputsA.l2NarrQuotaCredit / inputsA.l2NarrQuota * 100).toFixed(2);
      }
    } else {
      setCurrencyDisplay(fields.salary, rA.salary);
      setCurrencyDisplay(fields.otv, rA.otv);
      fields.pcr.value = inputsA.narrQuota > 0 ? formatRateAsPercent(rA.pcr) : '';
      fields.narrAttainment.value = inputsA.narrQuota > 0
        ? (rA.narrQuotaAttainment * 100).toFixed(2) : '';
    }

    renderComparisonResults(rA, inputsA, rB, inputsB);
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

  // Event: custom measure label inputs
  primaryLabelInput.addEventListener('input', function () {
    updateDualMeasureLabels(this.value || 'Primary', secondaryLabelInput.value || 'Secondary');
    recalculate();
  });
  secondaryLabelInput.addEventListener('input', function () {
    updateDualMeasureLabels(primaryLabelInput.value || 'Primary', this.value || 'Secondary');
    recalculate();
  });

  // Event: split ratio inputs
  primarySplitInput.addEventListener('input', function () {
    const val = parseFloat(this.value) || 0;
    currentPrimarySplit = val / 100;
    currentSecondarySplit = 1 - currentPrimarySplit;
    secondarySplitInput.value = Math.round(currentSecondarySplit * 100);
    recalculate();
  });
  secondarySplitInput.addEventListener('input', function () {
    const val = parseFloat(this.value) || 0;
    currentSecondarySplit = val / 100;
    currentPrimarySplit = 1 - currentSecondarySplit;
    primarySplitInput.value = Math.round(currentPrimarySplit * 100);
    recalculate();
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

  // Compare mode toggle
  btnCompare.addEventListener('click', function () {
    if (pipelineMode) return;
    comparisonMode = !comparisonMode;
    this.classList.toggle('active', comparisonMode);
    this.textContent = comparisonMode ? 'Exit Compare' : 'Compare Deals';
    dealBSection.classList.toggle('field-hidden', !comparisonMode);
    $('pipeline-actions').classList.toggle('field-hidden', comparisonMode);

    // Relabel Deal A section
    if (dealASection) {
      const titleEl = dealASection.querySelector('.section-title');
      titleEl.textContent = comparisonMode ? 'Deal A' : 'Deal Details';
    }
    recalculate();
  });

  // Deal B toggles
  setupToggle(bNewLogoToggle, bNewLogoLabel);
  setupToggle(bMultiYearToggle, bMultiYearLabel);
  setupToggle(bL3RegionToggle, bL3RegionLabel);

  // Event: scenarios
  document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const scenario = SCENARIOS[this.dataset.scenario];
      if (!scenario) return;
      const v = scenario.values;

      // In pipeline mode, populate the last dynamic deal if any
      if (pipelineMode && deals.length > 0) {
        const lastDeal = deals[deals.length - 1];
        const id = lastDeal.id;
        setCurrencyDisplay($('deal-' + id + '-iarr'), v.iarr);
        setCurrencyDisplay($('deal-' + id + '-renewed-arr'), v.renewedArr);
        setCurrencyDisplay($('deal-' + id + '-carr'), v.carr);
        setCurrencyDisplay($('deal-' + id + '-new-module-arr'), v.newModuleArr);
        const nlToggle = $('deal-' + id + '-new-logo-toggle');
        nlToggle.classList.toggle('active', v.newLogoDeal);
        nlToggle.setAttribute('aria-checked', v.newLogoDeal);
        $('deal-' + id + '-new-logo-label').textContent = v.newLogoDeal ? 'Yes' : 'No';
        if (!multiYearDisabled) {
          const myToggle = $('deal-' + id + '-multi-year-toggle');
          myToggle.classList.toggle('active', v.multiYearDeal);
          myToggle.setAttribute('aria-checked', v.multiYearDeal);
          $('deal-' + id + '-multi-year-label').textContent = v.multiYearDeal ? 'Yes' : 'No';
        }
        recalculate();
        return;
      }

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

    // Exit pipeline mode
    if (pipelineMode) {
      deals.forEach(function (deal) { var el = $('deal-box-' + deal.id); if (el) el.remove(); });
      deals = [];
      nextDealId = 2;
      pipelineMode = false;
      btnCompare.classList.remove('field-hidden');
      btnClearPipeline.classList.add('field-hidden');
    }

    // Exit comparison mode
    comparisonMode = false;
    btnCompare.classList.remove('active');
    btnCompare.textContent = 'Compare Deals';
    dealBSection.classList.add('field-hidden');
    $('pipeline-actions').classList.remove('field-hidden');
    if (dealASection) {
      dealASection.querySelector('.section-title').textContent = 'Deal Details';
    }
    dealBFields.iarr.value = '0';
    dealBFields.renewedArr.value = '0';
    dealBFields.carr.value = '0';
    dealBFields.newModuleArr.value = '';
    bNewLogoToggle.classList.remove('active');
    bNewLogoToggle.setAttribute('aria-checked', 'false');
    bNewLogoLabel.textContent = 'No';
    bMultiYearToggle.classList.remove('active');
    bMultiYearToggle.setAttribute('aria-checked', 'false');
    bMultiYearLabel.textContent = 'No';
    bL3RegionToggle.classList.add('active');
    bL3RegionToggle.setAttribute('aria-checked', 'true');
    bL3RegionLabel.textContent = 'Yes';

    // Disable dual-measure
    setDualMeasureMode(false);
    dualMeasureLocked = false;
    dualMeasureToggle.classList.remove('active', 'disabled');
    dualMeasureToggle.setAttribute('aria-checked', 'false');
    dualMeasureLabel.textContent = 'Off';
    dualMeasureToggleField.classList.remove('field-hidden');
    customLabelsRow.classList.add('field-hidden');
    primaryLabelInput.value = 'Primary';
    secondaryLabelInput.value = 'Secondary';
    primarySplitInput.value = '80';
    secondarySplitInput.value = '20';
    currentPrimarySplit = 0.80;
    currentSecondarySplit = 0.20;
    currentPrimaryLabel = 'L3';
    currentSecondaryLabel = 'L2';
    updateDualMeasureLabels('L3', 'L2');
    updateNewLogoLabel(false);

    fields.ote.value = '';
    fields.narrQuota.value = '';
    fields.narrQuotaCredit.value = '';
    fields.newLogoUplift.value = '0.05%';
    fields.multiYearUplift.value = '0.05%';
    fields.acceleratedPcr.value = '0.25%';
    fields.rarrRate.value = '0.1%';
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
    fields.l3NewLogoUplift.value = '0.045%';
    fields.l3MultiYearUplift.value = '0.045%';
    fields.l2NewLogoUplift.value = '0.005%';
    fields.l2MultiYearUplift.value = '0.005%';
    fields.l3AcceleratedPcr.value = '0.2%';
    fields.l2AcceleratedPcr.value = '0.05%';

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

    // Reset annual fields
    annualAttainmentSlider.value = 100;
    annualAttainmentInput.value = '100';
    annualL3AttainmentSlider.value = 100;
    annualL3AttainmentInput.value = '100';
    annualL2AttainmentSlider.value = 100;
    annualL2AttainmentInput.value = '100';
    annualNlPctSlider.value = 30;
    annualNlPctInput.value = '30';
    annualMyPctSlider.value = 20;
    annualMyPctInput.value = '20';
    annualRenewedArr.value = '0';
    annualTotalNarr.value = '';
    annualL3TotalNarr.value = '';
    annualL2TotalNarr.value = '';

    // Exit annual mode
    if (annualMode) {
      annualMode = false;
      document.querySelectorAll('.mode-tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.mode === 'deal');
      });
      appEl.classList.remove('annual-mode');
      appEl.classList.add('deal-mode');
      document.querySelector('.results-title').textContent = 'Commission Breakdown';
    }

    resultsEl.innerHTML = '<div class="results-empty">Enter OTE, NARR Quota, and deal details to see results.</div>';
    updateActionButtons();
  });

  // === Annual Export Functions ===

  function getAnnualExportData(exportOpts) {
    const inputs = getAnnualInputs();
    const obfuscate = exportOpts.obfuscate;
    const h = '[hidden]';
    const salary = inputs.ote * 0.80;
    const otv = inputs.ote * 0.20;

    const data = {
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      teamLabel: exportOpts.teamLabel,
      dualMeasure: exportOpts.dualMeasure,
      primaryLabel: exportOpts.primaryLabel || 'L3',
      secondaryLabel: exportOpts.secondaryLabel || 'L2'
    };

    data.profile = {
      ote: obfuscate ? h : formatDollars(inputs.ote),
      salary: obfuscate ? h : formatDollars(salary),
      otv: obfuscate ? h : formatDollars(otv)
    };

    if (inputs.dualMeasure) {
      data.profile.l3NarrQuota = obfuscate ? h : formatDollars(inputs.l3NarrQuota);
      data.profile.l2NarrQuota = obfuscate ? h : formatDollars(inputs.l2NarrQuota);
      data.assumptions = {
        l3Attainment: (inputs.l3TargetAttainment * 100).toFixed(0) + '%',
        l2Attainment: (inputs.l2TargetAttainment * 100).toFixed(0) + '%',
        l3TotalNarr: formatDollars(inputs.l3NarrQuota * inputs.l3TargetAttainment),
        l2TotalNarr: formatDollars(inputs.l2NarrQuota * inputs.l2TargetAttainment),
        newLogoPct: (inputs.newLogoPct * 100).toFixed(0) + '%',
        multiYearPct: (inputs.multiYearPct * 100).toFixed(0) + '%'
      };
      var r = calculateDualMeasureAnnualCompensation(inputs);
      data.projection = {
        totalVariable: obfuscate ? h : formatDollars(r.totalVariable),
        otvAttainment: obfuscate ? h : formatPercent(r.otvAttainment),
        totalComp: obfuscate ? h : formatDollars(salary + r.totalVariable)
      };
      data.result = r;
    } else {
      data.profile.narrQuota = obfuscate ? h : formatDollars(inputs.narrQuota);
      var pcr = inputs.narrQuota > 0 ? otv / inputs.narrQuota : 0;
      data.assumptions = {
        attainment: (inputs.targetAttainment * 100).toFixed(0) + '%',
        totalNarr: formatDollars(inputs.narrQuota * inputs.targetAttainment),
        newLogoPct: (inputs.newLogoPct * 100).toFixed(0) + '%',
        multiYearPct: (inputs.multiYearPct * 100).toFixed(0) + '%'
      };
      var r = calculateAnnualCompensation({
        narrQuota: inputs.narrQuota,
        targetAttainment: inputs.targetAttainment,
        pcr: pcr,
        newLogoUplift: parseRate(fields.newLogoUplift.value),
        multiYearUplift: parseRate(fields.multiYearUplift.value),
        acceleratedPcr: parseRate(fields.acceleratedPcr.value),
        newLogoPct: inputs.newLogoPct,
        multiYearPct: inputs.multiYearPct,
        rarrRate: (isLatamMode() || isRarrMode()) ? parseRate(fields.rarrRate.value) : 0,
        totalRenewedArr: (isLatamMode() || isRarrMode()) ? inputs.totalRenewedArr : 0
      });
      data.projection = {
        totalVariable: obfuscate ? h : formatDollars(r.totalVariable),
        otvAttainment: obfuscate ? h : formatPercent(otv > 0 ? r.totalVariable / otv : 0),
        totalComp: obfuscate ? h : formatDollars(salary + r.totalVariable)
      };
      data.result = r;
    }

    // Sensitivity table data
    data.sensitivity = buildSensitivityExportRows(inputs, obfuscate);

    return data;
  }

  function buildSensitivityExportRows(inputs, obfuscate) {
    const levels = [0.50, 0.75, 1.00, 1.10, 1.20, 1.50];
    const h = '[hidden]';
    const salary = inputs.ote * 0.80;
    const otv = inputs.ote * 0.20;
    var rows = [];

    for (var i = 0; i < levels.length; i++) {
      var level = levels[i];
      var totalVariable, totalNarr;
      if (inputs.dualMeasure) {
        var r = calculateDualMeasureAnnualCompensation(Object.assign({}, inputs, {
          l3TargetAttainment: level, l2TargetAttainment: level
        }));
        totalVariable = r.totalVariable;
        totalNarr = inputs.l3NarrQuota * level + inputs.l2NarrQuota * level;
      } else {
        var pcr = inputs.narrQuota > 0 ? otv / inputs.narrQuota : 0;
        var r = calculateAnnualCompensation({
          narrQuota: inputs.narrQuota, targetAttainment: level, pcr: pcr,
          newLogoUplift: parseRate(fields.newLogoUplift.value),
          multiYearUplift: parseRate(fields.multiYearUplift.value),
          acceleratedPcr: parseRate(fields.acceleratedPcr.value),
          newLogoPct: inputs.newLogoPct, multiYearPct: inputs.multiYearPct,
          rarrRate: (isLatamMode() || isRarrMode()) ? parseRate(fields.rarrRate.value) : 0,
          totalRenewedArr: (isLatamMode() || isRarrMode()) ? inputs.totalRenewedArr : 0
        });
        totalVariable = r.totalVariable;
        totalNarr = inputs.narrQuota * level;
      }
      rows.push({
        attainment: (level * 100).toFixed(0) + '%',
        totalNarr: formatDollars(totalNarr),
        variable: obfuscate ? h : formatDollars(totalVariable),
        totalComp: obfuscate ? h : formatDollars(salary + totalVariable),
        otvAtt: obfuscate ? h : formatPercent(otv > 0 ? totalVariable / otv : 0)
      });
    }
    return rows;
  }

  function formatAnnualPlainText(exportOpts) {
    var data = getAnnualExportData(exportOpts);
    var lines = [];
    lines.push('Pre-Sales Compensation Calculator - Annual Projection');
    lines.push('Team: ' + data.teamLabel);
    lines.push('Date: ' + data.date);
    lines.push('');
    lines.push('--- User Profile ---');
    lines.push('OTE: ' + data.profile.ote);
    lines.push('Salary: ' + data.profile.salary);
    lines.push('OTV: ' + data.profile.otv);
    if (data.dualMeasure) {
      lines.push(data.primaryLabel + ' NARR Quota: ' + data.profile.l3NarrQuota);
      lines.push(data.secondaryLabel + ' NARR Quota: ' + data.profile.l2NarrQuota);
    } else {
      lines.push('NARR Quota: ' + data.profile.narrQuota);
    }
    lines.push('');
    lines.push('--- Assumptions ---');
    if (data.dualMeasure) {
      lines.push(data.primaryLabel + ' Target Attainment: ' + data.assumptions.l3Attainment);
      lines.push(data.primaryLabel + ' Total NARR: ' + data.assumptions.l3TotalNarr);
      lines.push(data.secondaryLabel + ' Target Attainment: ' + data.assumptions.l2Attainment);
      lines.push(data.secondaryLabel + ' Total NARR: ' + data.assumptions.l2TotalNarr);
    } else {
      lines.push('Target Attainment: ' + data.assumptions.attainment);
      lines.push('Total NARR: ' + data.assumptions.totalNarr);
    }
    lines.push('New Logo Mix: ' + data.assumptions.newLogoPct);
    lines.push('Multi-Year Mix: ' + data.assumptions.multiYearPct);
    lines.push('');
    lines.push('--- Projection ---');
    lines.push('Variable Compensation: ' + data.projection.totalVariable);
    lines.push('OTV Attainment: ' + data.projection.otvAttainment);
    lines.push('Total Annual Compensation: ' + data.projection.totalComp);
    lines.push('');
    lines.push('--- Sensitivity ---');
    lines.push('Attainment\tTotal NARR\tVariable Comp\tTotal Comp\tOTV Attainment');
    for (var i = 0; i < data.sensitivity.length; i++) {
      var row = data.sensitivity[i];
      lines.push(row.attainment + '\t' + row.totalNarr + '\t' + row.variable + '\t' + row.totalComp + '\t' + row.otvAtt);
    }
    return lines.join('\n');
  }

  function buildAnnualPdfHtml(exportOpts) {
    var data = getAnnualExportData(exportOpts);
    var profileRows = '';
    profileRows += buildPdfRow('OTE', data.profile.ote);
    profileRows += buildPdfRow('Salary', data.profile.salary);
    profileRows += buildPdfRow('OTV', data.profile.otv);
    if (data.dualMeasure) {
      profileRows += buildPdfRow(data.primaryLabel + ' NARR Quota', data.profile.l3NarrQuota);
      profileRows += buildPdfRow(data.secondaryLabel + ' NARR Quota', data.profile.l2NarrQuota);
    } else {
      profileRows += buildPdfRow('NARR Quota', data.profile.narrQuota);
    }

    var assumptionRows = '';
    if (data.dualMeasure) {
      assumptionRows += buildPdfRow(data.primaryLabel + ' Target Attainment', data.assumptions.l3Attainment);
      assumptionRows += buildPdfRow(data.primaryLabel + ' Total NARR', data.assumptions.l3TotalNarr);
      assumptionRows += buildPdfRow(data.secondaryLabel + ' Target Attainment', data.assumptions.l2Attainment);
      assumptionRows += buildPdfRow(data.secondaryLabel + ' Total NARR', data.assumptions.l2TotalNarr);
    } else {
      assumptionRows += buildPdfRow('Target Attainment', data.assumptions.attainment);
      assumptionRows += buildPdfRow('Total NARR', data.assumptions.totalNarr);
    }
    assumptionRows += buildPdfRow('New Logo Mix', data.assumptions.newLogoPct);
    assumptionRows += buildPdfRow('Multi-Year Mix', data.assumptions.multiYearPct);

    var projectionRows = '';
    projectionRows += buildPdfRow('Variable Compensation', data.projection.totalVariable);
    projectionRows += buildPdfRow('OTV Attainment', data.projection.otvAttainment);
    projectionRows += buildPdfRow('Total Annual Compensation', data.projection.totalComp);

    // Sensitivity table
    var sensHtml = '<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:10px">';
    sensHtml += '<tr style="border-bottom:1px solid #2a3368">';
    sensHtml += '<th style="text-align:left;padding:4px 6px;color:#6070a0;font-size:9px;text-transform:uppercase">Attainment</th>';
    sensHtml += '<th style="text-align:right;padding:4px 6px;color:#6070a0;font-size:9px;text-transform:uppercase">Total NARR</th>';
    sensHtml += '<th style="text-align:right;padding:4px 6px;color:#6070a0;font-size:9px;text-transform:uppercase">Variable</th>';
    sensHtml += '<th style="text-align:right;padding:4px 6px;color:#6070a0;font-size:9px;text-transform:uppercase">Total Comp</th>';
    sensHtml += '<th style="text-align:right;padding:4px 6px;color:#6070a0;font-size:9px;text-transform:uppercase">OTV Att.</th>';
    sensHtml += '</tr>';
    for (var i = 0; i < data.sensitivity.length; i++) {
      var row = data.sensitivity[i];
      sensHtml += '<tr style="border-bottom:1px solid rgba(42,51,104,0.3)">';
      sensHtml += '<td style="padding:3px 6px;color:#a0a8c8">' + row.attainment + '</td>';
      sensHtml += '<td style="text-align:right;padding:3px 6px;font-family:monospace">' + row.totalNarr + '</td>';
      sensHtml += '<td style="text-align:right;padding:3px 6px;font-family:monospace">' + row.variable + '</td>';
      sensHtml += '<td style="text-align:right;padding:3px 6px;font-family:monospace">' + row.totalComp + '</td>';
      sensHtml += '<td style="text-align:right;padding:3px 6px;font-family:monospace">' + row.otvAtt + '</td>';
      sensHtml += '</tr>';
    }
    sensHtml += '</table>';

    return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background:#0c0f24;color:#e8e8f0;padding:30px 40px;font-size:12px;margin:0">'
      + '<div style="border-bottom:2px solid #751323;padding-bottom:10px;margin-bottom:16px">'
      + '<div style="font-size:16px;font-weight:700;color:#e8e8f0">Annual Projection</div>'
      + '<div style="font-size:11px;color:#a0a8c8;margin-top:2px">Team: ' + data.teamLabel + '  |  ' + data.date + '</div>'
      + '</div>'
      + buildPdfSection('User Profile', profileRows)
      + buildPdfSection('Assumptions', assumptionRows)
      + buildPdfSection('Projection', projectionRows)
      + buildPdfSection('Sensitivity Analysis', sensHtml)
      + '<div style="margin-top:20px;padding-top:8px;border-top:1px solid #2a3368;font-size:9px;color:#6070a0;text-align:center">Generated by Pre-Sales Compensation Calculator' + (appVersion ? ' v' + appVersion : '') + '</div>'
      + '</body></html>';
  }

  // Copy button handler
  btnCopy.addEventListener('click', async function () {
    if (this.disabled) return;
    const teamLabel = TEAM_PRESETS[currentTeam] ? TEAM_PRESETS[currentTeam].label : 'Custom';
    const exportOpts = {
      teamLabel: teamLabel,
      dualMeasure: dualMeasureActive,
      primaryLabel: currentPrimaryLabel,
      secondaryLabel: currentSecondaryLabel,
      obfuscate: obfuscateToggle.checked
    };
    let text;
    if (annualMode) {
      text = formatAnnualPlainText(exportOpts);
    } else if (pipelineMode) {
      text = formatPipelinePlainText(exportOpts);
    } else if (comparisonMode) {
      text = formatComparisonPlainText(exportOpts);
    } else {
      const inputs = getInputs();
      const results = inputs.dualMeasure
        ? calculateDualMeasureCompensation(inputs)
        : calculateCompensation(inputs);
      const data = extractDisplayData(results, inputs, exportOpts);
      text = formatPlainTextSummary(data);
    }
    try {
      await navigator.clipboard.writeText(text);
      showCopyToast();
    } catch (e) {
      console.error('Copy failed:', e);
    }
  });

  // PDF export handler
  btnExportPdf.addEventListener('click', async function () {
    if (this.disabled) return;
    const teamLabel = TEAM_PRESETS[currentTeam] ? TEAM_PRESETS[currentTeam].label : 'Custom';
    const exportOpts = {
      teamLabel: teamLabel,
      dualMeasure: dualMeasureActive,
      primaryLabel: currentPrimaryLabel,
      secondaryLabel: currentSecondaryLabel,
      obfuscate: obfuscateToggle.checked
    };
    let html, prefix;
    if (annualMode) {
      html = buildAnnualPdfHtml(exportOpts);
      prefix = 'Annual-Projection';
    } else if (pipelineMode) {
      html = buildPipelinePdfHtml(exportOpts);
      prefix = 'Pipeline-Breakdown';
    } else if (comparisonMode) {
      html = buildComparisonPdfHtml(exportOpts);
    } else {
      const inputs = getInputs();
      const results = inputs.dualMeasure
        ? calculateDualMeasureCompensation(inputs)
        : calculateCompensation(inputs);
      const data = extractDisplayData(results, inputs, exportOpts);
      html = buildPdfHtml(data, { appVersion: appVersion });
    }
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = (prefix || 'Commission-Breakdown') + '-' + dateStr + '.pdf';
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    try {
      await html2pdf().set({ margin: [0.5, 0.5, 0.5, 0.5], filename: filename, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }).from(container).save();
    } catch (e) { console.error('PDF export failed:', e); }
    document.body.removeChild(container);
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

  // Mode toggle handler
  document.querySelectorAll('.mode-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var mode = this.dataset.mode;
      if ((mode === 'annual') === annualMode) return;

      annualMode = (mode === 'annual');
      document.querySelectorAll('.mode-tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.mode === mode);
      });
      appEl.classList.toggle('annual-mode', annualMode);
      appEl.classList.toggle('deal-mode', !annualMode);

      // Exit comparison mode when switching to annual
      if (annualMode && comparisonMode) {
        btnCompare.click();
      }

      // Exit pipeline mode when switching to annual
      if (annualMode && pipelineMode) {
        deals.forEach(function (deal) { var el = $('deal-box-' + deal.id); if (el) el.remove(); });
        deals = [];
        nextDealId = 2;
        pipelineMode = false;
        btnCompare.classList.remove('field-hidden');
        btnClearPipeline.classList.add('field-hidden');
        if (dealASection) dealASection.querySelector('.section-title').textContent = 'Deal Details';
      }

      // Show/hide RARR field for annual mode
      if (annualMode && (isLatamMode() || isRarrMode())) {
        annualRenewedArrField.classList.remove('field-hidden');
      } else {
        annualRenewedArrField.classList.add('field-hidden');
      }

      // Disable multi-year slider if team disables it
      if (annualMode && multiYearDisabled) {
        annualMyPctField.classList.add('field-disabled');
        annualMyPctSlider.disabled = true;
        annualMyPctInput.disabled = true;
        annualMyPctSlider.value = 0;
        annualMyPctInput.value = '0';
      }

      // Update results title
      document.querySelector('.results-title').textContent = annualMode ? 'Annual Projection' : 'Commission Breakdown';

      recalculate();
    });
  });

  // Annual slider bindings
  var annualSliderPairs = [
    [annualAttainmentSlider, annualAttainmentInput],
    [annualL3AttainmentSlider, annualL3AttainmentInput],
    [annualL2AttainmentSlider, annualL2AttainmentInput],
    [annualNlPctSlider, annualNlPctInput],
    [annualMyPctSlider, annualMyPctInput]
  ];

  annualSliderPairs.forEach(function (pair) {
    var slider = pair[0];
    var input = pair[1];
    if (!slider || !input) return;
    slider.addEventListener('input', function () {
      input.value = slider.value;
      if (annualMode) recalculate();
    });
    input.addEventListener('input', function () {
      var val = parseFloat(input.value) || 0;
      slider.value = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), val));
      if (annualMode) recalculate();
    });
    input.addEventListener('change', function () {
      if (annualMode && settingsLoaded) saveSettings();
    });
  });

  // Annual renewed ARR recalculate on input (currency formatting handled by [data-currency] loop)
  if (annualRenewedArr) {
    annualRenewedArr.addEventListener('input', function () {
      if (annualMode) recalculate();
    });
  }

  // Pipeline: Add Deal button
  btnAddDeal.addEventListener('click', function () {
    addDeal();
  });

  // Pipeline: Clear All button
  btnClearPipeline.addEventListener('click', function () {
    clearAllDeals();
  });

  // Pipeline: Event delegation on container
  pipelineContainer.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-deal-id]');
    if (!btn) return;
    const dealId = parseInt(btn.dataset.dealId);

    if (btn.classList.contains('deal-box-remove')) {
      removeDeal(dealId);
    } else if (btn.classList.contains('deal-box-move-up')) {
      moveDeal(dealId, -1);
    } else if (btn.classList.contains('deal-box-move-down')) {
      moveDeal(dealId, 1);
    } else if (btn.classList.contains('deal-box-duplicate')) {
      duplicateDeal(dealId);
    } else if (btn.dataset.dealToggle) {
      if (btn.classList.contains('disabled')) return;
      const active = !btn.classList.contains('active');
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', active);
      const labelEl = btn.nextElementSibling;
      if (labelEl) labelEl.textContent = active ? 'Yes' : 'No';
      recalculate();
    }
  });

  pipelineContainer.addEventListener('input', function (e) {
    const input = e.target;
    if (!input.dataset.dealId) return;
    if (input.hasAttribute('data-currency')) {
      handleCurrencyInput(e);
    } else {
      recalculate();
    }
  });

  pipelineContainer.addEventListener('keydown', function (e) {
    if (e.target.dataset.dealToggle && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      e.target.click();
    }
  });

  loadSettings();
})();
