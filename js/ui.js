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
    newModuleArr: $('new-module-arr')
  };

  const teamSelect = $('team-select');
  const rarrRateField = $('rarr-rate-field');
  const multiYearField = $('multi-year-field');
  const psaPendingNote = $('psa-pending-note');

  const newLogoToggle = $('new-logo-toggle');
  const newLogoLabel = $('new-logo-label');
  const multiYearToggle = $('multi-year-toggle');
  const multiYearLabel = $('multi-year-label');
  const resultsEl = $('results');

  let currentTeam = 'custom';
  let multiYearDisabled = false;

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

    newLogoUpliftTooltip.textContent = teamKey === 'psa-msp' ? mspNlTooltip : defaultNlTooltip;
  }

  function checkTeamModified() {
    if (currentTeam === 'custom') return;
    const preset = TEAM_PRESETS[currentTeam];
    if (!preset) return;
    const nl = parseRate(fields.newLogoUplift.value);
    const my = parseRate(fields.multiYearUplift.value);
    const ap = parseRate(fields.acceleratedPcr.value);
    if (nl !== preset.newLogoUplift || my !== preset.multiYearUplift || ap !== preset.acceleratedPcr) {
      currentTeam = 'custom';
      teamSelect.value = 'custom';
    }
  }

  function isLatamMode() {
    const preset = TEAM_PRESETS[currentTeam];
    return preset && preset.latamMode;
  }

  function getInputs() {
    return {
      ote: parseCurrency(fields.ote.value),
      narrQuota: parseCurrency(fields.narrQuota.value),
      narrQuotaCredit: parseCurrency(fields.narrQuotaCredit.value),
      newLogoUplift: parseRate(fields.newLogoUplift.value),
      multiYearUplift: parseRate(fields.multiYearUplift.value),
      acceleratedPcr: parseRate(fields.acceleratedPcr.value),
      rarrRate: parseRate(fields.rarrRate.value),
      iarr: parseCurrency(fields.iarr.value),
      renewedArr: parseCurrency(fields.renewedArr.value),
      carr: parseCurrency(fields.carr.value),
      newModuleArr: parseCurrency(fields.newModuleArr.value),
      newLogoDeal: newLogoToggle.classList.contains('active'),
      multiYearDeal: !multiYearDisabled && multiYearToggle.classList.contains('active'),
      latamMode: isLatamMode()
    };
  }

  function recalculate() {
    const inputs = getInputs();
    const r = calculateCompensation(inputs);

    setCurrencyDisplay(fields.salary, r.salary);
    setCurrencyDisplay(fields.otv, r.otv);
    fields.pcr.value = inputs.narrQuota > 0 ? formatRate(r.pcr) : '';
    fields.narrAttainment.value = inputs.narrQuota > 0
      ? (r.narrQuotaAttainment * 100).toFixed(2)
      : '';

    renderResults(r, inputs);
  }

  function buildRateLabel(r, inputs) {
    let parts = ['PCR'];
    if (r.newLogoDeal) parts.push('New Logo');
    if (r.multiYearDeal) parts.push('Multi-Year');
    return parts.join(' + ');
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

  // Event: currency fields
  document.querySelectorAll('[data-currency]').forEach(input => {
    input.addEventListener('input', handleCurrencyInput);
    input.addEventListener('focus', function () {
      const val = parseCurrency(this.value);
      if (val === 0 && this.value === '0') {
        this.select();
      }
    });
  });

  // Event: rate fields
  [fields.newLogoUplift, fields.multiYearUplift, fields.acceleratedPcr, fields.rarrRate].forEach(input => {
    input.addEventListener('input', function () {
      checkTeamModified();
      recalculate();
    });
  });

  // Event: OTE
  fields.ote.addEventListener('input', handleCurrencyInput);

  // Event: team selector
  teamSelect.addEventListener('change', function () {
    applyTeamPreset(this.value);
    recalculate();
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

  // Event: scenarios
  document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const scenario = SCENARIOS[this.dataset.scenario];
      if (!scenario) return;
      const v = scenario.values;

      if (v.team) {
        applyTeamPreset(v.team);
      }

      setCurrencyDisplay(fields.ote, v.ote);
      setCurrencyDisplay(fields.narrQuota, v.narrQuota);
      setCurrencyDisplay(fields.narrQuotaCredit, v.narrQuotaCredit);
      fields.newLogoUplift.value = v.newLogoUplift;
      fields.multiYearUplift.value = v.multiYearUplift;
      fields.acceleratedPcr.value = v.acceleratedPcr;
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

  recalculate();
})();
