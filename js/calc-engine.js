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
    acceleratedPcr,
    iarr,
    renewedArr,
    carr,
    newModuleArr,
    newLogoDeal,
    multiYearDeal,
    dealInL3
  } = inputs;

  const salary = ote * 0.80;
  const otv = ote * 0.20;
  const l3Pcr = l3NarrQuota > 0 ? (otv * 0.80) / l3NarrQuota : 0;
  const l2Pcr = l2NarrQuota > 0 ? (otv * 0.20) / l2NarrQuota : 0;

  const day1Arr = renewedArr + newModuleArr;
  const narrQuotaRetirement = day1Arr - iarr;
  const dealNarr = narrQuotaRetirement;

  const l2 = calculateMeasureCommission(
    dealNarr, l2Pcr, l2NewLogoUplift, l2MultiYearUplift, acceleratedPcr,
    l2NarrQuota, l2NarrQuotaCredit, newLogoDeal, multiYearDeal
  );

  let l3 = null;
  if (dealInL3) {
    l3 = calculateMeasureCommission(
      dealNarr, l3Pcr, l3NewLogoUplift, l3MultiYearUplift, acceleratedPcr,
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
  if (latamMode && renewedArr > 0 && rarrRate > 0) {
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
    latamMode
  };
}
