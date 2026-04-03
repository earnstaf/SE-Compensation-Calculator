const {
  calculateCompensation,
  calculateDualMeasureCompensation,
  calculateAnnualCompensation,
  calculateDualMeasureAnnualCompensation,
  calculateMeasureCommission
} = require('../js/calc-engine');

// Default single-measure inputs (APAC/MM/Commercial-style: 0.05% NL, 0.05% MY, 0.25% Accel)
function baseInputs(overrides = {}) {
  return Object.assign({
    ote: 100000,
    narrQuota: 10000000,
    narrQuotaCredit: 2000000,
    newLogoUplift: 0.0005,
    multiYearUplift: 0.0005,
    acceleratedPcr: 0.0025,
    iarr: 0,
    renewedArr: 0,
    carr: 0,
    newModuleArr: 0,
    newLogoDeal: false,
    multiYearDeal: false,
    rarrRate: 0,
    latamMode: false
  }, overrides);
}

// --- CLAUDE.md Validation Test Cases ---

describe('calculateCompensation — CLAUDE.md validation cases', () => {
  test('Test 1: Upsell below 100%, no uplifts → $250', () => {
    const r = calculateCompensation(baseInputs({
      iarr: 1000000, renewedArr: 1000000, newModuleArr: 125000
    }));
    expect(r.narrQuotaRetirement).toBe(125000);
    expect(r.totalCommission).toBeCloseTo(250, 2);
    expect(r.pcr).toBeCloseTo(0.002, 6);
    expect(r.straddlesThreshold).toBe(false);
  });

  test('Test 2: Upsell with churn — CARR not subtracted → $50', () => {
    const r = calculateCompensation(baseInputs({
      iarr: 1000000, renewedArr: 900000, carr: 100000, newModuleArr: 125000
    }));
    expect(r.day1Arr).toBe(1025000);
    expect(r.narrQuotaRetirement).toBe(25000);
    expect(r.totalCommission).toBeCloseTo(50, 2);
  });

  test('Test 3: New Logo + Multi-Year straddles 100% → $4,250', () => {
    const r = calculateCompensation(baseInputs({
      narrQuotaCredit: 9500000, newModuleArr: 1000000,
      newLogoDeal: true, multiYearDeal: true
    }));
    expect(r.narrQuotaRetirement).toBe(1000000);
    expect(r.narrBelow).toBe(500000);
    expect(r.narrAbove).toBe(500000);
    expect(r.commissionBelow).toBeCloseTo(1500, 2);  // 500k × 0.30%
    expect(r.commissionAbove).toBeCloseTo(2750, 2);   // 500k × 0.55%
    expect(r.totalCommission).toBeCloseTo(4250, 2);
    expect(r.straddlesThreshold).toBe(true);
  });

  test('Test 4: New Logo only, below 100% → $2,500', () => {
    const r = calculateCompensation(baseInputs({
      newModuleArr: 1000000, newLogoDeal: true
    }));
    expect(r.narrQuotaRetirement).toBe(1000000);
    expect(r.baseRate).toBeCloseTo(0.0025, 6);  // PCR + NL
    expect(r.totalCommission).toBeCloseTo(2500, 2);
    expect(r.straddlesThreshold).toBe(false);
  });

  test('Test 5: Already over 100% → entire deal at accelerated rate → $2,750', () => {
    const r = calculateCompensation(baseInputs({
      narrQuotaCredit: 11000000, newModuleArr: 500000,
      newLogoDeal: true, multiYearDeal: true
    }));
    expect(r.narrAbove).toBe(500000);
    expect(r.narrBelow).toBe(0);
    expect(r.totalCommission).toBeCloseTo(2750, 2);  // 500k × 0.55%
    expect(r.straddlesThreshold).toBe(true);
  });

  test('Test 6: Negative NARR → $0 commission', () => {
    const r = calculateCompensation(baseInputs({
      iarr: 1000000, renewedArr: 800000, newModuleArr: 100000
    }));
    expect(r.day1Arr).toBe(900000);
    expect(r.narrQuotaRetirement).toBe(-100000);
    expect(r.totalCommission).toBe(0);
  });
});

// --- OTE splits ---

describe('calculateCompensation — OTE splits', () => {
  test('salary is 80% of OTE, OTV is 20%', () => {
    const r = calculateCompensation(baseInputs());
    expect(r.salary).toBe(80000);
    expect(r.otv).toBe(20000);
  });

  test('PCR = OTV / NARR Quota', () => {
    const r = calculateCompensation(baseInputs());
    expect(r.pcr).toBe(20000 / 10000000);
  });
});

// --- Edge cases ---

describe('calculateCompensation — edge cases', () => {
  test('zero OTE → no division errors', () => {
    const r = calculateCompensation(baseInputs({ ote: 0 }));
    expect(r.salary).toBe(0);
    expect(r.otv).toBe(0);
    expect(r.pcr).toBe(0);
    expect(r.totalCommission).toBe(0);
    expect(r.otvAttainment).toBe(0);
  });

  test('zero quota → no division errors', () => {
    const r = calculateCompensation(baseInputs({ narrQuota: 0 }));
    expect(r.pcr).toBe(0);
    expect(r.narrQuotaAttainment).toBe(0);
    expect(r.postDealAttainment).toBe(0);
  });

  test('RARR commission for LATAM team', () => {
    const r = calculateCompensation(baseInputs({
      renewedArr: 1000000, rarrRate: 0.001, latamMode: true
    }));
    expect(r.rarrCommission).toBe(1000);
    expect(r.totalCommission).toBe(r.narrCommission + 1000);
  });

  test('RARR commission for PSA-MSP (rarrMode)', () => {
    const r = calculateCompensation(baseInputs({
      renewedArr: 2000000, rarrRate: 0.0005, rarrMode: true
    }));
    expect(r.rarrCommission).toBe(1000);
  });
});

// --- Dual-measure ---

describe('calculateDualMeasureCompensation', () => {
  function dualInputs(overrides = {}) {
    return Object.assign({
      ote: 200000,
      l3NarrQuota: 21309600,
      l2NarrQuota: 67680000,
      l3NarrQuotaCredit: 2130960,   // 10% attainment
      l2NarrQuotaCredit: 6768000,   // 10% attainment
      l3NewLogoUplift: 0.00045,
      l3MultiYearUplift: 0.00045,
      l3AcceleratedPcr: 0.002,
      l2NewLogoUplift: 0.00005,
      l2MultiYearUplift: 0.00005,
      l2AcceleratedPcr: 0.0005,
      iarr: 0,
      renewedArr: 0,
      carr: 0,
      newModuleArr: 0,
      newLogoDeal: false,
      multiYearDeal: false,
      dealInL3: true,
      primarySplit: 0.80,
      secondarySplit: 0.20
    }, overrides);
  }

  test('L3 deal earns both L3 and L2 commission', () => {
    const r = calculateDualMeasureCompensation(dualInputs({ newModuleArr: 1000000 }));
    expect(r.l3).not.toBeNull();
    expect(r.l2).not.toBeNull();
    expect(r.l3.commission).toBeGreaterThan(0);
    expect(r.l2.commission).toBeGreaterThan(0);
    expect(r.totalCommission).toBeCloseTo(r.l3.commission + r.l2.commission, 2);
  });

  test('L2-only deal (dealInL3=false) → no L3 commission', () => {
    const r = calculateDualMeasureCompensation(dualInputs({
      newModuleArr: 1000000, dealInL3: false
    }));
    expect(r.l3).toBeNull();
    expect(r.l2.commission).toBeGreaterThan(0);
    expect(r.totalCommission).toBe(r.l2.commission);
    expect(r.dealInL3).toBe(false);
  });

  test('PCR derivation: L3 PCR = (OTV × primarySplit) / L3 Quota', () => {
    const r = calculateDualMeasureCompensation(dualInputs());
    const otv = 200000 * 0.20;
    expect(r.l3Pcr).toBeCloseTo((otv * 0.80) / 21309600, 10);
    expect(r.l2Pcr).toBeCloseTo((otv * 0.20) / 67680000, 10);
  });

  test('salary and OTV split correctly', () => {
    const r = calculateDualMeasureCompensation(dualInputs());
    expect(r.salary).toBe(160000);
    expect(r.otv).toBe(40000);
  });
});

// --- Annual projections ---

describe('calculateAnnualCompensation', () => {
  function annualInputs(overrides = {}) {
    return Object.assign({
      narrQuota: 10000000,
      targetAttainment: 1.0,
      pcr: 0.002,
      newLogoUplift: 0.0005,
      multiYearUplift: 0.0005,
      acceleratedPcr: 0.0025,
      newLogoPct: 0,
      multiYearPct: 0
    }, overrides);
  }

  test('100% attainment, 0% deal mix → variable comp equals OTV equivalent', () => {
    // With 0% NL and 0% MY, all NARR is "plain" at PCR only
    // Total NARR = 10M × 1.0 = 10M, all below 100%, rate = PCR = 0.002
    // Commission = 10M × 0.002 = 20,000
    const r = calculateAnnualCompensation(annualInputs());
    expect(r.totalVariable).toBeCloseTo(20000, 2);
    expect(r.narrCommission).toBeCloseTo(20000, 2);
  });

  test('120% attainment → above-100% buckets with accelerated rates', () => {
    const r = calculateAnnualCompensation(annualInputs({ targetAttainment: 1.2 }));
    // Total NARR = 12M. Below 100% = 10M at PCR, Above 100% = 2M at PCR + Accel
    // Below: 10M × 0.002 = 20,000. Above: 2M × 0.0045 = 9,000. Total = 29,000
    expect(r.totalVariable).toBeCloseTo(29000, 2);
    expect(r.commissionAbove).toBeGreaterThan(0);
  });

  test('deal mix overlap: NL 60% + MY 60% → 20% overlap bucket', () => {
    const r = calculateAnnualCompensation(annualInputs({
      newLogoPct: 0.6, multiYearPct: 0.6
    }));
    // Overlap = max(0, 0.6 + 0.6 - 1) = 0.2
    // Buckets: plain=0% (skipped), NL-only=40%, MY-only=40%, both=20%
    expect(r.breakdown).toHaveLength(3); // plain bucket skipped (pct=0)
    const bothBucket = r.breakdown.find(b => b.label === 'New Logo + Multi-Year NARR');
    expect(bothBucket.pct).toBeCloseTo(0.2, 10);
  });

  test('bucket percentages sum to 1.0 (no floating-point leakage)', () => {
    const r = calculateAnnualCompensation(annualInputs({
      newLogoPct: 0.3, multiYearPct: 0.2
    }));
    const sum = r.breakdown.reduce((acc, b) => acc + b.pct, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });

  test('RARR bonus added for LATAM-style teams', () => {
    const r = calculateAnnualCompensation(annualInputs({
      rarrRate: 0.001, totalRenewedArr: 5000000
    }));
    expect(r.rarrCommission).toBe(5000);
    expect(r.totalVariable).toBe(r.narrCommission + 5000);
  });
});

// --- calculateMeasureCommission (unit-level) ---

describe('calculateMeasureCommission', () => {
  test('below quota — base rate only', () => {
    const r = calculateMeasureCommission(
      500000, 0.002, 0, 0, 0.0025, 10000000, 2000000, false, false
    );
    expect(r.commission).toBeCloseTo(1000, 2);  // 500k × 0.002
    expect(r.narrBelow).toBe(500000);
    expect(r.narrAbove).toBe(0);
    expect(r.straddlesThreshold).toBe(false);
  });

  test('straddles 100% — split at threshold', () => {
    const r = calculateMeasureCommission(
      2000000, 0.002, 0, 0, 0.0025, 10000000, 9000000, false, false
    );
    expect(r.narrBelow).toBe(1000000);
    expect(r.narrAbove).toBe(1000000);
    expect(r.commissionBelow).toBeCloseTo(2000, 2);  // 1M × 0.002
    expect(r.commissionAbove).toBeCloseTo(4500, 2);   // 1M × 0.0045
    expect(r.straddlesThreshold).toBe(true);
  });

  test('already over quota — all at accelerated', () => {
    const r = calculateMeasureCommission(
      500000, 0.002, 0, 0, 0.0025, 10000000, 10000000, false, false
    );
    expect(r.narrBelow).toBe(0);
    expect(r.narrAbove).toBe(500000);
    expect(r.commission).toBeCloseTo(2250, 2);  // 500k × 0.0045
    expect(r.straddlesThreshold).toBe(true);
  });

  test('negative NARR → zero commission', () => {
    const r = calculateMeasureCommission(
      -100000, 0.002, 0, 0, 0.0025, 10000000, 2000000, false, false
    );
    expect(r.commission).toBe(0);
  });

  test('uplifts added correctly', () => {
    const r = calculateMeasureCommission(
      1000000, 0.002, 0.0005, 0.0005, 0.0025, 10000000, 2000000, true, true
    );
    expect(r.baseRate).toBeCloseTo(0.003, 6);      // PCR + NL + MY
    expect(r.acceleratedRate).toBeCloseTo(0.0055, 6); // base + accel
  });

  test('post-deal attainment calculated correctly', () => {
    const r = calculateMeasureCommission(
      3000000, 0.002, 0, 0, 0.0025, 10000000, 5000000, false, false
    );
    expect(r.narrQuotaAttainment).toBeCloseTo(0.5, 6);
    expect(r.postDealAttainment).toBeCloseTo(0.8, 6);
  });
});
