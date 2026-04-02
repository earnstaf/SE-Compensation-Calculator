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
