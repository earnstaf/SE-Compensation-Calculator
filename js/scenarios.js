const TEAM_PRESETS = {
  'custom': {
    label: 'Custom',
    newLogoUplift: 0.0005,
    multiYearUplift: 0.0005,
    acceleratedPcr: 0.0025,
    disableMultiYear: false,
    latamMode: false
  },
  'mm-commercial': {
    label: 'MM/Commercial',
    newLogoUplift: 0.0005,
    multiYearUplift: 0.0005,
    acceleratedPcr: 0.0025,
    disableMultiYear: false,
    latamMode: false
  },
  'japan': {
    label: 'Japan',
    newLogoUplift: 0.0005,
    multiYearUplift: 0.0005,
    acceleratedPcr: 0.0025,
    disableMultiYear: false,
    latamMode: false
  },
  'apac': {
    label: 'APAC',
    newLogoUplift: 0.0005,
    multiYearUplift: 0.0005,
    acceleratedPcr: 0.0025,
    disableMultiYear: false,
    latamMode: false
  },
  'us-canada': {
    label: 'US & Canada (excl Fed)',
    newLogoUplift: 0.00045,
    multiYearUplift: 0.00045,
    acceleratedPcr: 0.002,
    disableMultiYear: false,
    latamMode: false,
    dualMeasure: true,
    l3NewLogoUplift: 0.00045,
    l3MultiYearUplift: 0.00045,
    l3AcceleratedPcr: 0.002,
    l2NewLogoUplift: 0.00005,
    l2MultiYearUplift: 0.00005,
    l2AcceleratedPcr: 0.0005
  },
  'emea': {
    label: 'EMEA',
    newLogoUplift: 0.00045,
    multiYearUplift: 0.00045,
    acceleratedPcr: 0.002,
    disableMultiYear: false,
    latamMode: false,
    dualMeasure: true,
    l3NewLogoUplift: 0.00045,
    l3MultiYearUplift: 0.00045,
    l3AcceleratedPcr: 0.002,
    l2NewLogoUplift: 0.00005,
    l2MultiYearUplift: 0.00005,
    l2AcceleratedPcr: 0.0005
  },
  'us-pubsec': {
    label: 'US PubSec',
    newLogoUplift: 0.001,
    multiYearUplift: 0,
    acceleratedPcr: 0.0025,
    disableMultiYear: true,
    latamMode: false
  },
  'latam': {
    label: 'LATAM',
    newLogoUplift: 0.0005,
    multiYearUplift: 0.0005,
    acceleratedPcr: 0.0025,
    disableMultiYear: false,
    latamMode: true,
    rarrRate: 0.001
  },
  'ise-mm-commercial': {
    label: 'ISE - MM/Commercial',
    newLogoUplift: 0.00025,
    multiYearUplift: 0.00025,
    acceleratedPcr: 0.00075,
    disableMultiYear: false,
    latamMode: false
  },
  'ise-emea': {
    label: 'ISE - EMEA',
    newLogoUplift: 0.000225,
    multiYearUplift: 0.000225,
    acceleratedPcr: 0.000725,
    disableMultiYear: false,
    latamMode: false,
    dualMeasure: true,
    l3NewLogoUplift: 0.000225,
    l3MultiYearUplift: 0.000225,
    l3AcceleratedPcr: 0.000725,
    l2NewLogoUplift: 0.000025,
    l2MultiYearUplift: 0.000025,
    l2AcceleratedPcr: 0.000025
  },
  'ise-pubsec': {
    label: 'ISE - PubSec',
    newLogoUplift: 0.0005,
    multiYearUplift: 0,
    acceleratedPcr: 0.00075,
    disableMultiYear: true,
    latamMode: false
  },
  'gee-ve': {
    label: 'GEE-VE Strategists',
    newLogoUplift: 0.00025,
    multiYearUplift: 0.00025,
    acceleratedPcr: 0.0015,
    disableMultiYear: false,
    latamMode: false
  },
  'psa-gsi-spa': {
    label: 'PSA - GSI & SPA',
    newLogoUplift: 0,
    multiYearUplift: 0,
    acceleratedPcr: 0,
    disableMultiYear: false,
    latamMode: false,
    psaPending: true
  },
  'psa-msp': {
    label: 'PSA - MSP',
    newLogoUplift: 0,
    multiYearUplift: 0,
    acceleratedPcr: 0,
    disableMultiYear: false,
    latamMode: false,
    psaPending: true
  },
  'psa-hybrid': {
    label: 'PSA - Hybrid',
    newLogoUplift: 0,
    multiYearUplift: 0,
    acceleratedPcr: 0,
    disableMultiYear: false,
    latamMode: false,
    psaPending: true
  }
};

const SCENARIOS = {
  'upsell-existing': {
    label: 'Upsell Existing',
    description: 'Upsell to existing customer, no churn, below 100% attainment.',
    values: {
      ote: 100000,
      narrQuota: 10000000,
      narrQuotaCredit: 2000000,
      iarr: 1000000,
      renewedArr: 1000000,
      carr: 0,
      newModuleArr: 125000,
      newLogoDeal: false,
      multiYearDeal: false
    }
  },
  'upsell-churn': {
    label: 'Upsell with Churn',
    description: 'Upsell where the customer churns a module. CARR shown for context only.',
    values: {
      ote: 100000,
      narrQuota: 10000000,
      narrQuotaCredit: 2000000,
      iarr: 1000000,
      renewedArr: 900000,
      carr: 100000,
      newModuleArr: 125000,
      newLogoDeal: false,
      multiYearDeal: false
    }
  },
  'new-logo-overachieve': {
    label: 'New Logo + Multi-Year',
    description: 'New logo multi-year deal that pushes past 100% attainment, triggering accelerated PCR.',
    values: {
      ote: 100000,
      narrQuota: 10000000,
      narrQuotaCredit: 9500000,
      iarr: 0,
      renewedArr: 0,
      carr: 0,
      newModuleArr: 1000000,
      newLogoDeal: true,
      multiYearDeal: true
    }
  },
  'new-logo': {
    label: 'New Logo Only',
    description: 'New logo deal, below 100% attainment. New Logo Uplift applies.',
    values: {
      ote: 100000,
      narrQuota: 10000000,
      narrQuotaCredit: 2000000,
      iarr: 0,
      renewedArr: 0,
      carr: 0,
      newModuleArr: 1000000,
      newLogoDeal: true,
      multiYearDeal: false
    }
  }
};
