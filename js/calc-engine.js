function calculateMeasureCommission(dealNarr, pcr, newLogoUplift, multiYearUplift, acceleratedPcr, narrQuota, narrQuotaCredit, newLogoDeal, multiYearDeal) {
  const narrQuotaAttainment = narrQuota > 0 ? narrQuotaCredit / narrQuota : 0;

  let baseRate = pcr;
  if (newLogoDeal) baseRate += newLogoUplift;
  if (multiYearDeal) baseRate += multiYearUplift;

  const acceleratedRate = baseRate + acceleratedPcr;

  let narrBelow = 0;
  let narrAbove = 0;
  let commissionBelow = 0;
  let commissionAbove = 0;
  let commission = 0;
  let straddlesThreshold = false;

  if (dealNarr <= 0) {
    commission = 0;
  } else if (narrQuotaCredit >= narrQuota) {
    narrAbove = dealNarr;
    commissionAbove = narrAbove * acceleratedRate;
    commission = commissionAbove;
    straddlesThreshold = true;
  } else {
    const narrRemainingTo100 = Math.max(0, narrQuota - narrQuotaCredit);
    if (dealNarr <= narrRemainingTo100) {
      narrBelow = dealNarr;
      commissionBelow = narrBelow * baseRate;
      commission = commissionBelow;
    } else {
      narrBelow = narrRemainingTo100;
      narrAbove = dealNarr - narrRemainingTo100;
      commissionBelow = narrBelow * baseRate;
      commissionAbove = narrAbove * acceleratedRate;
      commission = commissionBelow + commissionAbove;
      straddlesThreshold = true;
    }
  }

  const postDealAttainment = narrQuota > 0 ? (narrQuotaCredit + dealNarr) / narrQuota : 0;

  return {
    pcr,
    narrQuotaAttainment,
    postDealAttainment,
    baseRate,
    acceleratedRate,
    narrBelow,
    narrAbove,
    commissionBelow,
    commissionAbove,
    commission,
    straddlesThreshold
  };
}

function calculateDualMeasureCompensation(inputs) {
  const {
    ote,
    l3NarrQuota,
    l2NarrQuota,
    l3NarrQuotaCredit,
    l2NarrQuotaCredit,
    l3NewLogoUplift,
    l3MultiYearUplift,
    l2NewLogoUplift,
    l2MultiYearUplift,
    l3AcceleratedPcr,
    l2AcceleratedPcr,
    iarr,
    renewedArr,
    carr,
    newModuleArr,
    newLogoDeal,
    multiYearDeal,
    dealInL3,
    primarySplit = 0.80,
    secondarySplit = 0.20
  } = inputs;

  const salary = ote * 0.80;
  const otv = ote * 0.20;
  const l3Pcr = l3NarrQuota > 0 ? (otv * primarySplit) / l3NarrQuota : 0;
  const l2Pcr = l2NarrQuota > 0 ? (otv * secondarySplit) / l2NarrQuota : 0;

  const day1Arr = renewedArr + newModuleArr;
  const narrQuotaRetirement = day1Arr - iarr;
  const dealNarr = narrQuotaRetirement;

  const l2 = calculateMeasureCommission(
    dealNarr, l2Pcr, l2NewLogoUplift, l2MultiYearUplift, l2AcceleratedPcr,
    l2NarrQuota, l2NarrQuotaCredit, newLogoDeal, multiYearDeal
  );

  let l3 = null;
  if (dealInL3) {
    l3 = calculateMeasureCommission(
      dealNarr, l3Pcr, l3NewLogoUplift, l3MultiYearUplift, l3AcceleratedPcr,
      l3NarrQuota, l3NarrQuotaCredit, newLogoDeal, multiYearDeal
    );
  }

  const l3Commission = l3 ? l3.commission : 0;
  const totalCommission = l3Commission + l2.commission;
  const otvAttainment = otv > 0 ? totalCommission / otv : 0;

  return {
    salary,
    otv,
    l3Pcr,
    l2Pcr,
    day1Arr,
    narrQuotaRetirement,
    carr,
    l3: l3,
    l2: l2,
    totalCommission,
    otvAttainment,
    newLogoDeal,
    multiYearDeal,
    dealInL3
  };
}

function calculateCompensation(inputs) {
  const {
    ote,
    narrQuota,
    narrQuotaCredit,
    newLogoUplift,
    multiYearUplift,
    acceleratedPcr,
    iarr,
    renewedArr,
    carr,
    newModuleArr,
    newLogoDeal,
    multiYearDeal,
    rarrRate,
    latamMode
  } = inputs;

  const salary = ote * 0.80;
  const otv = ote * 0.20;
  const pcr = narrQuota > 0 ? otv / narrQuota : 0;
  const narrQuotaAttainment = narrQuota > 0 ? narrQuotaCredit / narrQuota : 0;

  const day1Arr = renewedArr + newModuleArr;
  const narrQuotaRetirement = day1Arr - iarr;

  const postDealAttainment = narrQuota > 0
    ? (narrQuotaCredit + narrQuotaRetirement) / narrQuota
    : 0;

  let baseRate = pcr;
  if (newLogoDeal) baseRate += newLogoUplift;
  if (multiYearDeal) baseRate += multiYearUplift;

  const acceleratedRate = baseRate + acceleratedPcr;

  let narrBelow = 0;
  let narrAbove = 0;
  let commissionBelow = 0;
  let commissionAbove = 0;
  let narrCommission = 0;
  let straddlesThreshold = false;

  if (narrQuotaRetirement <= 0) {
    narrCommission = 0;
  } else if (narrQuotaCredit >= narrQuota) {
    narrAbove = narrQuotaRetirement;
    commissionAbove = narrAbove * acceleratedRate;
    narrCommission = commissionAbove;
    straddlesThreshold = true;
  } else {
    const narrRemainingTo100 = Math.max(0, narrQuota - narrQuotaCredit);
    if (narrQuotaRetirement <= narrRemainingTo100) {
      narrBelow = narrQuotaRetirement;
      commissionBelow = narrBelow * baseRate;
      narrCommission = commissionBelow;
    } else {
      narrBelow = narrRemainingTo100;
      narrAbove = narrQuotaRetirement - narrRemainingTo100;
      commissionBelow = narrBelow * baseRate;
      commissionAbove = narrAbove * acceleratedRate;
      narrCommission = commissionBelow + commissionAbove;
      straddlesThreshold = true;
    }
  }

  let rarrCommission = 0;
  if ((latamMode || inputs.rarrMode) && renewedArr > 0 && rarrRate > 0) {
    rarrCommission = renewedArr * rarrRate;
  }

  const totalCommission = narrCommission + rarrCommission;
  const otvAttainment = otv > 0 ? totalCommission / otv : 0;

  return {
    salary,
    otv,
    pcr,
    narrQuotaAttainment,
    day1Arr,
    narrQuotaRetirement,
    carr,
    postDealAttainment,
    baseRate,
    acceleratedRate,
    narrBelow,
    narrAbove,
    commissionBelow,
    commissionAbove,
    narrCommission,
    rarrCommission,
    totalCommission,
    otvAttainment,
    straddlesThreshold,
    newLogoDeal,
    multiYearDeal,
    latamMode,
    rarrMode: inputs.rarrMode || false
  };
}

function calculateAnnualCompensation(inputs) {
  const {
    narrQuota,
    targetAttainment,
    pcr,
    newLogoUplift,
    multiYearUplift,
    acceleratedPcr,
    newLogoPct,
    multiYearPct,
    rarrRate = 0,
    totalRenewedArr = 0
  } = inputs;

  const totalNarr = narrQuota * targetAttainment;

  // Split NARR into 4 buckets using inclusion-exclusion for overlap
  // Round to 10 decimal places to eliminate floating-point noise (e.g. 1e-16 → 0)
  const overlap = Math.max(0, +(newLogoPct + multiYearPct - 1).toFixed(10));
  const nlOnlyPct = +(newLogoPct - overlap).toFixed(10);
  const myOnlyPct = +(multiYearPct - overlap).toFixed(10);
  const bothPct = +overlap.toFixed(10);
  const plainPct = Math.max(0, +(1 - newLogoPct - multiYearPct + overlap).toFixed(10));

  // Commission rates per bucket
  const rates = [
    { label: 'Plain NARR', pct: plainPct, baseRate: pcr, accelRate: pcr + acceleratedPcr },
    { label: 'New Logo NARR', pct: nlOnlyPct, baseRate: pcr + newLogoUplift, accelRate: pcr + newLogoUplift + acceleratedPcr },
    { label: 'Multi-Year NARR', pct: myOnlyPct, baseRate: pcr + multiYearUplift, accelRate: pcr + multiYearUplift + acceleratedPcr },
    { label: 'New Logo + Multi-Year NARR', pct: bothPct, baseRate: pcr + newLogoUplift + multiYearUplift, accelRate: pcr + newLogoUplift + multiYearUplift + acceleratedPcr }
  ];

  // Split at 100% attainment threshold
  const narrBelow = Math.min(totalNarr, narrQuota);
  const narrAbove = Math.max(0, totalNarr - narrQuota);

  let commissionBelow = 0;
  let commissionAbove = 0;
  const breakdown = [];

  for (const bucket of rates) {
    if (bucket.pct <= 0) continue;
    const bucketNarrBelow = narrBelow * bucket.pct;
    const bucketNarrAbove = narrAbove * bucket.pct;
    const bucketCommBelow = bucketNarrBelow * bucket.baseRate;
    const bucketCommAbove = bucketNarrAbove * bucket.accelRate;
    commissionBelow += bucketCommBelow;
    commissionAbove += bucketCommAbove;
    breakdown.push({
      label: bucket.label,
      pct: bucket.pct,
      narrBelow: bucketNarrBelow,
      narrAbove: bucketNarrAbove,
      baseRate: bucket.baseRate,
      accelRate: bucket.accelRate,
      commissionBelow: bucketCommBelow,
      commissionAbove: bucketCommAbove,
      totalCommission: bucketCommBelow + bucketCommAbove
    });
  }

  const narrCommission = commissionBelow + commissionAbove;

  let rarrCommission = 0;
  if (rarrRate > 0 && totalRenewedArr > 0) {
    rarrCommission = totalRenewedArr * rarrRate;
  }

  const totalVariable = narrCommission + rarrCommission;

  return {
    totalNarr,
    totalVariable,
    commissionBelow,
    commissionAbove,
    narrCommission,
    rarrCommission,
    narrBelow,
    narrAbove,
    breakdown,
    targetAttainment
  };
}

function calculateDualMeasureAnnualCompensation(inputs) {
  const {
    ote,
    l3NarrQuota,
    l2NarrQuota,
    l3TargetAttainment,
    l2TargetAttainment,
    l3NewLogoUplift,
    l3MultiYearUplift,
    l3AcceleratedPcr,
    l2NewLogoUplift,
    l2MultiYearUplift,
    l2AcceleratedPcr,
    newLogoPct,
    multiYearPct,
    primarySplit = 0.80,
    secondarySplit = 0.20,
    rarrRate = 0,
    totalRenewedArr = 0
  } = inputs;

  const salary = ote * 0.80;
  const otv = ote * 0.20;
  const l3Pcr = l3NarrQuota > 0 ? (otv * primarySplit) / l3NarrQuota : 0;
  const l2Pcr = l2NarrQuota > 0 ? (otv * secondarySplit) / l2NarrQuota : 0;

  const l3 = calculateAnnualCompensation({
    narrQuota: l3NarrQuota,
    targetAttainment: l3TargetAttainment,
    pcr: l3Pcr,
    newLogoUplift: l3NewLogoUplift,
    multiYearUplift: l3MultiYearUplift,
    acceleratedPcr: l3AcceleratedPcr,
    newLogoPct,
    multiYearPct,
    rarrRate: 0,
    totalRenewedArr: 0
  });

  const l2 = calculateAnnualCompensation({
    narrQuota: l2NarrQuota,
    targetAttainment: l2TargetAttainment,
    pcr: l2Pcr,
    newLogoUplift: l2NewLogoUplift,
    multiYearUplift: l2MultiYearUplift,
    acceleratedPcr: l2AcceleratedPcr,
    newLogoPct,
    multiYearPct,
    rarrRate: 0,
    totalRenewedArr: 0
  });

  let rarrCommission = 0;
  if (rarrRate > 0 && totalRenewedArr > 0) {
    rarrCommission = totalRenewedArr * rarrRate;
  }

  const totalVariable = l3.totalVariable + l2.totalVariable + rarrCommission;
  const otvAttainment = otv > 0 ? totalVariable / otv : 0;

  return {
    salary,
    otv,
    l3Pcr,
    l2Pcr,
    l3,
    l2,
    totalVariable,
    otvAttainment,
    rarrCommission
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateCompensation, calculateDualMeasureCompensation, calculateAnnualCompensation, calculateDualMeasureAnnualCompensation, calculateMeasureCommission };
}
