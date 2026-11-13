import { Language } from '../types';

export interface TranslationDictionary {
  // Brand & Header
  switchLanguage: string;
  exportFlightReport: string;
  simulationMode: string;
  simulatedMissionTelemetry: string;
  osdrStudiesReady: string;
  osdrStudiesSyncing: string;
  osdrStudiesCached: string;
  illustrativeModel: string;
  simulatedScenarioNote: string;

  // Astronaut Selector
  crewRoster: string;
  daysInSpace: string;
  statusBadge: {
    nominal: string;
    moderate: string;
    elevated: string;
    critical: string;
  };

  // Vitals & Risk HUD
  radiationExposure: string;
  safeLimitNasa: string;
  boneMassDegradation: string;
  tScoreVariance: string;
  dnaDamageScore: string;
  dsbRisk: string;
  cellularRepairCapacity: string;
  atpEfficiency: string;
  dnaScannerTitle: string;
  dnaScannerSubtitle: string;

  // Bone Density Scanner
  boneScannerTitle: string;
  boneScannerSubtitle: string;
  earthBaseline1G: string;
  microgravityDegradation: string;
  trabecularVolumeFraction: string;
  osteoblastActivity: string;
  osteoclastActivity: string;
  resorptionRate: string;

  // Radiation Telemetry
  radiationTelemetryTitle: string;
  radiationTelemetrySubtitle: string;
  doseRateMsvPerDay: string;

  // NASA OSDR study data
  geneTableTitle: string;
  geneTableSubtitle: string;
  viewOsdrStudy: string;
  searchPlaceholder: string;
  studyId: string;
  studyMission: string;
  organism: string;
  tissue: string;
  assay: string;
  studyContrast: string;
  geneSymbol: string;
  geneName: string;
  adjustedPValue: string;
  significance: string;
  significant: string;
  notSignificant: string;
  noOsdrStudies: string;
  noGeneRecords: string;
  osdrSpeciesNote: string;
  referenceStudies: string;

  // Bio-Rescue Protocol
  protocolTitle: string;
  protocolSubtitle: string;
  protocolPriority: string;
  supplementPillar: string;
  exercisePillar: string;
  environmentPillar: string;
  doseNotInferred: string;
  supplementCaution: string;
  exerciseGuidance: string;
  environmentGuidance: string;
  studyEvidenceOnly: string;
  notMedicalAdvice: string;

  // Simulator Drawer
  simDrawerTitle: string;
  simDrawerSubtitle: string;
  simSpaceDaysSlider: string;
  simRadiationSlider: string;
  simProjectedBoneLoss: string;
  simProjectedDnaDamage: string;
  simProjectedRepair: string;
  resetToCohort: string;

  // Flight Report Modal
  flightDossierTitle: string;
  printDossier: string;
  close: string;

  // Digital Twin
  digitalTwinTab: string;
  digitalTwinTitle: string;
  digitalTwinSubtitle: string;
  digitalTwinSelectHotspot: string;
  twinVitalsTitle: string;
  twinVitalsSubtitle: string;
  twinVitalsNote: string;
  twinSimulatedTag: string;
  twinSpaceDays: string;
  twinRadiationMsv: string;
  twinBoneLossIndex: string;
  twinDnaDamageIndex: string;
  twinDetailsTitle: string;
  twinStudyIds: string;
  twinLog2fc: string;
  twinPValue: string;
  twinUpRegulated: string;
  twinDownRegulated: string;
  twinGuidanceSkeletal: string;
  twinGuidanceDna: string;
  twinGuidanceExposure: string;
  twinExposureStudies: string;
  twinExposureSimulatedLabel: string;
  twinStrongestResponse: string;
  twinAwaitingSync: string;
  twinProvenanceLabel: string;
  twinProvenance: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    switchLanguage: 'العربية',
    exportFlightReport: 'Export Simulation Summary',
    simulationMode: 'Risk Simulation Engine',
    simulatedMissionTelemetry: 'Simulated Mission Telemetry',
    osdrStudiesReady: 'OSDR study references ready',
    osdrStudiesSyncing: 'Loading cached OSDR studies…',
    osdrStudiesCached: 'Showing available cached OSDR studies',
    illustrativeModel: 'Illustrative scenario model',
    simulatedScenarioNote: 'Scenario math uses simulated mission inputs; NASA OSDR measurements are not used to predict human outcomes.',

    crewRoster: 'Astronaut Roster',
    daysInSpace: 'Days in Microgravity',
    statusBadge: {
      nominal: 'Optimal Baseline',
      moderate: 'Compensating',
      elevated: 'Elevated Risk',
      critical: 'Severe Intervention Required',
    },

    radiationExposure: 'Cosmic Radiation Accumulated',
    safeLimitNasa: 'NASA Deep Space Limit: 600 mSv',
    boneMassDegradation: 'Simulated Bone Loss Index',
    tScoreVariance: 'BMD T-Score Shift vs Earth Pre-flight',
    dnaDamageScore: 'Simulated DNA Damage Index',
    dsbRisk: 'Double-Strand Break Saturation',
    cellularRepairCapacity: 'Cellular Excision Repair',
    atpEfficiency: 'Mitochondrial Redox Efficiency',
    dnaScannerTitle: 'NASA OSDR Gene Expression Records',
    dnaScannerSubtitle: 'Browse NASA OSDR differential-expression records by study; values are not individual astronaut mutations',

    boneScannerTitle: 'Bone Trabecular Micro-Architecture Scanner',
    boneScannerSubtitle: 'Illustrative visual indices from simulated mission telemetry, not a measured clinical scan',
    earthBaseline1G: 'Illustrative 1G Reference',
    microgravityDegradation: 'Simulated Mission Scenario',
    trabecularVolumeFraction: 'Trabecular Bone Volume (BV/TV)',
    osteoblastActivity: 'Illustrative Osteoblast Index',
    osteoclastActivity: 'Illustrative Osteoclast Index',
    resorptionRate: 'Illustrative index; not a measured monthly rate',
    radiationTelemetryTitle: 'Cosmic Radiation & Genomic Stress Telemetry',
    radiationTelemetrySubtitle: 'Illustrative scenario from simulated mission inputs; not measured astronaut dosimetry',
    doseRateMsvPerDay: 'Illustrative mean dose rate',

    geneTableTitle: 'NASA OSDR Study Data',
    geneTableSubtitle: 'Study-level metadata and gene-expression statistics from public NASA OSDR records',
    viewOsdrStudy: 'NASA OSDR Access',
    searchPlaceholder: 'Search by gene symbol (e.g., RUNX2, COL1A1, CDKN1A, SOD2)...',
    studyId: 'Study',
    studyMission: 'Spaceflight mission',
    organism: 'Organism',
    tissue: 'Tissue / material',
    assay: 'Assay type',
    studyContrast: 'Reported contrast',
    geneSymbol: 'OSDR gene symbol',
    geneName: 'Gene name',
    adjustedPValue: 'Adjusted p-value',
    significance: 'Adjusted significance',
    significant: 'Significant (adjusted p < 0.05)',
    notSignificant: 'Not significant',
    noOsdrStudies: 'No OSDR studies are currently available.',
    noGeneRecords: 'No gene records match this search.',
    osdrSpeciesNote: 'These are study-level biological measurements, including animal tissues where indicated. They are references, not human astronaut blood tests or individual telemetry.',
    referenceStudies: 'Reference NASA OSDR studies',

    protocolTitle: 'Bio-Rescue Protocol',
    protocolSubtitle: 'Risk-prioritized planning view based on simulated mission telemetry; not a clinical prescription',
    protocolPriority: 'Scenario priority',
    supplementPillar: 'Precision epigenetic supplements',
    exercisePillar: 'Targeted biomechanical exercise load',
    environmentPillar: 'Cabin micro-environment tuning',
    doseNotInferred: 'No dose inferred',
    supplementCaution: 'OSDR mouse gene-expression results cannot establish safe or effective human supplement doses. Review diet, labs, interactions, and dosing with qualified flight-medicine staff.',
    exerciseGuidance: 'Use the simulated bone-risk index to prioritize review of a validated resistive and aerobic countermeasure plan. This model does not set exercise duration, force, or frequency.',
    environmentGuidance: 'Review oxygen partial pressure, circadian lighting, and sleep schedule against mission environmental standards. These study records do not determine cabin setpoints.',
    studyEvidenceOnly: 'Reference studies provide biological context only; they do not generate these intervention recommendations.',
    notMedicalAdvice: 'Planning illustration only. Not medical advice or an operational flight protocol.',

    simDrawerTitle: 'Interactive Spaceflight Risk Simulator',
    simDrawerSubtitle: 'Illustrative exposure scenario using simulated inputs; not an OSDR-validated human prediction',
    simSpaceDaysSlider: 'Mission Elapsed Microgravity (Days)',
    simRadiationSlider: 'Cumulative Ionizing Radiation (mSv)',
    simProjectedBoneLoss: 'Illustrative Trabecular Bone-Loss Index',
    simProjectedDnaDamage: 'Illustrative Genomic Response Index',
    simProjectedRepair: 'Illustrative Cellular Repair Index',
    resetToCohort: 'Reset Baseline',

    flightDossierTitle: 'Simulated Mission Health Summary',
    printDossier: 'Print / Save Summary',
    close: 'Close',

    digitalTwinTab: 'Digital Twin',
    digitalTwinTitle: 'Digital Twin - Translational Body Systems Map',
    digitalTwinSubtitle:
      'Interactive holographic mapping of verified NASA OSDR reference expression onto the selected astronaut simulated mission profile. Select a hotspot to inspect the underlying real study records.',
    digitalTwinSelectHotspot:
      'Select a hotspot node on the hologram to load its real NASA OSDR record set.',
    twinVitalsTitle: 'Selected Astronaut Simulated Mission Vitals',
    twinVitalsSubtitle: 'Simulated mission telemetry',
    twinVitalsNote:
      'Crew values are simulated mission telemetry from the AstroHealth AI scenario model. They are not measured astronaut dosimetry or clinical results.',
    twinSimulatedTag: 'Simulated',
    twinSpaceDays: 'Space days',
    twinRadiationMsv: 'Cumulative radiation (mSv)',
    twinBoneLossIndex: 'Bone loss index (%)',
    twinDnaDamageIndex: 'DNA damage index',
    twinDetailsTitle: 'Active System Hotspot Details',
    twinStudyIds: 'Real NASA OSDR studies',
    twinLog2fc: 'log2FC',
    twinPValue: 'p',
    twinUpRegulated: 'Up-regulated',
    twinDownRegulated: 'Down-regulated',
    twinGuidanceSkeletal:
      'Preventive guidance: use the simulated bone-loss index to prioritise review of a validated resistive and aerobic countermeasure plan with flight-medicine staff. The OSDR rodent values below are reference measurements; they do not set exercise loads or supplement doses for an individual crew member.',
    twinGuidanceDna:
      'Preventive guidance: use the simulated DNA damage index to prioritise review of radiation shielding, sleep and circadian scheduling, and cellular repair support with flight-medicine staff. The OSDR rodent values below are reference measurements, not individual astronaut blood results.',
    twinGuidanceExposure:
      'Preventive guidance: use the simulated space-day and cumulative radiation exposure to prioritise mission-limit and shielding reviews. The NASA OSDR studies listed below are real rodent spaceflight exposure records used as biological reference context only.',
    twinExposureStudies: 'Real NASA OSDR spaceflight exposure studies',
    twinExposureSimulatedLabel: 'Selected astronaut simulated exposure',
    twinStrongestResponse:
      'Each entry shows the strongest measured response (largest absolute log2FC) in that real OSDR study. Values are study-level mouse measurements, not human astronaut outcomes.',
    twinAwaitingSync:
      'Awaiting NASA OSDR study sync. No biological values are displayed until verified study records are loaded.',
    twinProvenanceLabel: 'Scientific provenance',
    twinProvenance:
      'Translational Simulation Model: Maps real reference gene expression from NASA OSDR (Mus musculus) studies onto simulated human astronaut telemetry for preventive risk visualization.',
  },
  ar: {
    switchLanguage: 'English',
    exportFlightReport: 'تصدير ملخص المحاكاة',
    simulationMode: 'محرك محاكاة المخاطر الفضائية',
    simulatedMissionTelemetry: 'قياسات مهمة فضائية محاكاة',
    osdrStudiesReady: 'مراجع دراسات OSDR جاهزة',
    osdrStudiesSyncing: 'جارٍ تحميل دراسات OSDR المخزنة…',
    osdrStudiesCached: 'عرض دراسات OSDR المخزنة المتاحة',
    illustrativeModel: 'نموذج سيناريو توضيحي',
    simulatedScenarioNote: 'تعتمد حسابات السيناريو على مدخلات مهمة محاكاة؛ ولا تستخدم قياسات OSDR للتنبؤ بنتائج بشرية.',

    crewRoster: 'قائمة طاقم رواد الفضاء',
    daysInSpace: 'أيام انعدام الجاذبية',
    statusBadge: {
      nominal: 'مستوى أساسي مثالي',
      moderate: 'استجابة تعويضية',
      elevated: 'خطر مرتفع يتطلب متابعة',
      critical: 'تدخل علاجي عاجل مطلوب',
    },

    radiationExposure: 'الإشعاع الكوني التراكمي',
    safeLimitNasa: 'حد الأمان الأقصى لناسا: 600 mSv',
    boneMassDegradation: 'مؤشر محاكاة فقدان العظم',
    tScoreVariance: 'انحراف كثافة العظام (T-Score) عن الأرض',
    dnaDamageScore: 'مؤشر محاكاة استجابة الحمض النووي',
    dsbRisk: 'تشبع كسور الشريط المزدوج',
    cellularRepairCapacity: 'كفاءة الاستئصال والترميم الخلوي',
    atpEfficiency: 'كفاءة توازن الأكسدة الميتوكوندرية',
    dnaScannerTitle: 'سجلات التعبير الجيني لناسا OSDR',
    dnaScannerSubtitle: 'استعراض بيانات التعبير الجيني من دراسات ناسا OSDR؛ القيم ليست طفرات فردية لدى رواد الفضاء',

    boneScannerTitle: 'ماسح البنية العظمية الإسفنجية المجهرية',
    boneScannerSubtitle: 'مؤشرات مرئية توضيحية من قياسات مهمة محاكاة، وليست فحصاً سريرياً مقاساً',
    earthBaseline1G: 'مرجع توضيحي عند 1G',
    microgravityDegradation: 'سيناريو مهمة محاكاة',
    trabecularVolumeFraction: 'حجم النسيج العظمي الإسفنجي (BV/TV)',
    osteoblastActivity: 'مؤشر توضيحي للخلايا البانية للعظم',
    osteoclastActivity: 'مؤشر توضيحي للخلايا الهادمة للعظم',
    resorptionRate: 'مؤشر توضيحي، وليس معدل فقد شهرياً مقاساً',
    radiationTelemetryTitle: 'قياسات الإشعاع الكوني والإجهاد الجيني',
    radiationTelemetrySubtitle: 'سيناريو توضيحي من مدخلات مهمة محاكاة، وليس قياساً إشعاعياً حقيقياً لرائد فضاء',
    doseRateMsvPerDay: 'متوسط معدل الجرعة التوضيحي',

    geneTableTitle: 'بيانات دراسات ناسا OSDR',
    geneTableSubtitle: 'بيانات الدراسات ومستويات التعبير الجيني من السجلات العامة لناسا OSDR',
    viewOsdrStudy: 'الوصول لدراسة ناسا OSDR',
    searchPlaceholder: 'ابحث برمز الجين (مثل RUNX2, COL1A1, CDKN1A, SOD2)...',
    studyId: 'الدراسة',
    studyMission: 'مهمة الرحلة الفضائية',
    organism: 'الكائن الحي',
    tissue: 'النسيج / المادة',
    assay: 'نوع الفحص',
    studyContrast: 'المقارنة المنشورة',
    geneSymbol: 'رمز الجين في OSDR',
    geneName: 'اسم الجين',
    adjustedPValue: 'القيمة الاحتمالية المعدلة',
    significance: 'الدلالة بعد التعديل',
    significant: 'دال إحصائياً (p المعدلة < 0.05)',
    notSignificant: 'غير دال إحصائياً',
    noOsdrStudies: 'لا تتوفر حالياً دراسات OSDR.',
    noGeneRecords: 'لا توجد سجلات جينية تطابق البحث.',
    osdrSpeciesNote: 'هذه قياسات حيوية على مستوى الدراسة، وتشمل أنسجة حيوانية عند توضيح ذلك. وهي مراجع بحثية وليست فحوص دم لرواد فضاء أو قياسات فردية.',
    referenceStudies: 'دراسات ناسا OSDR المرجعية',

    protocolTitle: 'بروتوكول الإنقاذ الحيوي',
    protocolSubtitle: 'عرض تخطيطي لترتيب الأولويات وفق قياسات مهمة محاكاة، وليس وصفة سريرية',
    protocolPriority: 'أولوية السيناريو',
    supplementPillar: 'مكملات فوق جينية دقيقة',
    exercisePillar: 'حمل التمارين الميكانيكية الحيوية المستهدف',
    environmentPillar: 'ضبط البيئة الدقيقة للمقصورة',
    doseNotInferred: 'لا يمكن استنتاج جرعة',
    supplementCaution: 'لا تحدد نتائج التعبير الجيني لدى الفئران جرعات مكملات آمنة أو فعالة للبشر. يجب مراجعة الغذاء والتحاليل والتداخلات والجرعات مع فريق طب طيران مؤهل.',
    exerciseGuidance: 'استخدم مؤشر مخاطر العظام المحاكى لترتيب مراجعة خطة مقاومة وتمارين هوائية معتمدة. لا يحدد هذا النموذج مدة التمرين أو قوته أو تكراره.',
    environmentGuidance: 'راجع الضغط الجزئي للأكسجين وإضاءة الساعة الحيوية وجدول النوم وفق معايير المهمة. لا تحدد هذه الدراسات إعدادات المقصورة.',
    studyEvidenceOnly: 'توفر الدراسات المرجعية سياقاً حيوياً فقط، ولا تنتج توصيات التدخل هذه.',
    notMedicalAdvice: 'عرض تخطيطي فقط، وليس نصيحة طبية أو بروتوكولاً تشغيلياً للرحلات.',

    simDrawerTitle: 'محاكي مخاطر الرحلات الفضائية التفاعلي',
    simDrawerSubtitle: 'سيناريو تعرض توضيحي بمدخلات محاكاة، وليس تنبؤاً بشرياً معتمداً من OSDR',
    simSpaceDaysSlider: 'مدة البقاء في انعدام الجاذبية (أيام)',
    simRadiationSlider: 'الإشعاع المؤين التراكمي (mSv)',
    simProjectedBoneLoss: 'مؤشر توضيحي لفقدان العظم الإسفنجي',
    simProjectedDnaDamage: 'مؤشر توضيحي للاستجابة الجينية',
    simProjectedRepair: 'مؤشر توضيحي لترميم الخلايا',
    resetToCohort: 'إعادة تعيين المستوى الأساسي',

    flightDossierTitle: 'ملخص صحي لمهمة فضائية محاكاة',
    printDossier: 'طباعة / حفظ الملخص',
    close: 'إغلاق',

    digitalTwinTab: 'التوأم الرقمي',
    digitalTwinTitle: 'التوأم الرقمي - خريطة ترجمية لأجهزة الجسم',
    digitalTwinSubtitle:
      'عرض تفاعلي هولوغرافي لتعبير الجينات المرجعي الموثق من ناسا OSDR على ملف مهمة رائد الفضاء المحدد (محاكاة). اختر نقطة اتصال لعرض سجلات الدراسات الحقيقية المرتبطة بها.',
    digitalTwinSelectHotspot:
      'اختر نقطة اتصال على الصورة الهولوغرافية لعرض سجلات دراسات ناسا OSDR الحقيقية.',
    twinVitalsTitle: 'قياسات مهمة رائد الفضاء المحدد (محاكاة)',
    twinVitalsSubtitle: 'قياسات مهمة فضائية محاكاة',
    twinVitalsNote:
      'قيم الطاقم هي قياسات مهمة محاكاة من نموذج سيناريو AstroHealth AI، وليست قياسات إشعاعية مقاسة لرواد الفضاء أو نتائج سريرية.',
    twinSimulatedTag: 'محاكاة',
    twinSpaceDays: 'أيام في الفضاء',
    twinRadiationMsv: 'الإشعاع التراكمي (mSv)',
    twinBoneLossIndex: 'مؤشر فقدان العظم (%)',
    twinDnaDamageIndex: 'مؤشر تلف الحمض النووي',
    twinDetailsTitle: 'تفاصيل نقطة النظام النشط',
    twinStudyIds: 'دراسات ناسا OSDR الحقيقية',
    twinLog2fc: 'log2FC',
    twinPValue: 'p',
    twinUpRegulated: 'مرتفع التنظيم',
    twinDownRegulated: 'منخفض التنظيم',
    twinGuidanceSkeletal:
      'إرشاد وقائي: استخدم مؤشر فقدان العظم المحاكى لترتيب مراجعة خطة معتمدة للتمارين المقاومة والهوائية مع فريق طب الطيران. قيم OSDR للفئران أدناه قياسات مرجعية، وهي لا تحدد أحمال التمارين أو جرعات المكملات لفرد من الطاقم.',
    twinGuidanceDna:
      'إرشاد وقائي: استخدم مؤشر تلف الحمض النووي المحاكى لترتيب مراجعة درع الإشعاع وجداول النوم والسير اليوماوي ودعم ترميم الخلايا مع فريق طب الطيران. قيم OSDR للفئران أدناه قياسات مرجعية، وليست نتائج دم فردية لرائد فضاء.',
    twinGuidanceExposure:
      'إرشاد وقائي: استخدم أيام الفضاء والإشعاع التراكمي المحاكى لترتيب مراجعة حدود المهمة والدرع الإشعاعي. دراسات ناسا OSDR المدرجة أدناه سجلات حقيقية لتعرض الفئران في بيئات انعدام الجاذبية، تُستخدم كسياق بيولوجي مرجعي فقط.',
    twinExposureStudies: 'دراسات ناسا OSDR الحقيقية لتعرض انعدام الجاذبية',
    twinExposureSimulatedLabel: 'تعرض رائد الفضاء المحدد (محاكاة)',
    twinStrongestResponse:
      'يعرض كل مدخل أقوى استجابة مقاسة (أكبر قيمة مطلقة لـ log2FC) في تلك الدراسة الحقيقية. القيم قياسات على مستوى الدراسة في الفئران، وليست نتائج بشرية.',
    twinAwaitingSync:
      'بانتظار مزامنة دراسات ناسا OSDR. لا تُعرض أي قيم حيوية قبل تحميل سجلات الدراسات الموثقة.',
    twinProvenanceLabel: 'المصدر العلمي',
    twinProvenance:
      'نموذج المحاكاة الترجمي: يربط تعبير الجينات المرجعي الحقيقي من دراسات ناسا OSDR (Mus musculus) بقياسات رواد الفضاء البشريين المحاكاة لتصور المخاطر الوقائي.',
  },
};
