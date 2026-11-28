import { UserGroup, AQICategoryLevel, AdviceReport, AdviceAction } from '../api/types';
import { getAQICategory } from './aqi';

export const USER_GROUPS: { id: UserGroup; label: string; icon: string; description: string }[] = [
  {
    id: 'general',
    label: 'General Public',
    icon: '👥',
    description: 'Healthy adults with no diagnosed chronic pulmonary conditions.',
  },
  {
    id: 'children',
    label: 'Children & Teens',
    icon: '🧒',
    description: 'Developing lungs with higher respiratory rates relative to body mass.',
  },
  {
    id: 'elderly',
    label: 'Older Adults',
    icon: '👵',
    description: 'Seniors aged 65+ and individuals with reduced cardiac reserve.',
  },
  {
    id: 'respiratory',
    label: 'Asthma & Respiratory',
    icon: '🫁',
    description: 'Diagnosed with asthma, COPD, bronchitis, or active allergies.',
  },
  {
    id: 'athletes',
    label: 'Outdoor Athletes',
    icon: '🏃',
    description: 'Runners, cyclists, and outdoor workers breathing high air volumes.',
  },
];

interface AdviceMatrixEntry {
  headline: string;
  overview: string;
  activityAction: { title: string; text: string; severity: AdviceAction['severity'] };
  maskAction: { title: string; text: string; severity: AdviceAction['severity'] };
  ventilationAction: { title: string; text: string; severity: AdviceAction['severity'] };
  purifierAction: { title: string; text: string; severity: AdviceAction['severity'] };
  specialAction: { title: string; text: string; severity: AdviceAction['severity'] };
  dos: string[];
  donts: string[];
}

const ADVICE_MATRIX: Record<AQICategoryLevel, Record<UserGroup, AdviceMatrixEntry>> = {
  good: {
    general: {
      headline: 'Ideal conditions for all outdoor activities',
      overview:
        'Air quality is pristine. Breathe freely and enjoy open-air activities without concern.',
      activityAction: {
        title: 'Outdoor Exercise',
        text: 'No limitations. Great day for long runs, cycling, or outdoor recreation.',
        severity: 'safe',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'No mask is required for air quality protection.',
        severity: 'safe',
      },
      ventilationAction: {
        title: 'Home Ventilation',
        text: 'Open windows to air out your residence and replenish indoor air freshness.',
        severity: 'safe',
      },
      purifierAction: {
        title: 'Air Purifier',
        text: 'Optional. Normal HVAC circulation is sufficient.',
        severity: 'safe',
      },
      specialAction: {
        title: 'Daily Well-being',
        text: 'Take advantage of clean air to ventilate rooms and spend time outside.',
        severity: 'safe',
      },
      dos: [
        'Air out living and work spaces',
        'Schedule strenuous outdoor workouts',
        'Enjoy parks and nature walks',
      ],
      donts: ['Keep home sealed unnecessarily', 'Worry about pollution exposure today'],
    },
    children: {
      headline: 'Wonderful day for outdoor play and sports',
      overview: 'Air is clean and poses zero respiratory distress for growing lungs.',
      activityAction: {
        title: 'Play & Recess',
        text: 'Encourage active outdoor recess, sports practices, and playground time.',
        severity: 'safe',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'No mask needed outdoors.',
        severity: 'safe',
      },
      ventilationAction: {
        title: 'Classroom & Nursery',
        text: 'Open windows for cross-ventilation to disperse indoor viral aerosols.',
        severity: 'safe',
      },
      purifierAction: {
        title: 'Indoor Air',
        text: 'Standard ventilation is ample; purifiers can run on eco/low mode.',
        severity: 'safe',
      },
      specialAction: {
        title: 'Physical Growth',
        text: 'Physical exertion in clean air supports cardiovascular and lung development.',
        severity: 'safe',
      },
      dos: ['Plan outdoor family trips and sports', 'Ventilate bedrooms with fresh air'],
      donts: ['Restrict active outdoor recreation'],
    },
    elderly: {
      headline: 'Safe and refreshing conditions for seniors',
      overview: 'Minimal ambient particulates make today welcoming for senior walks and gardening.',
      activityAction: {
        title: 'Daily Routine',
        text: 'Enjoy morning walks, gardening, or errands without respiratory caution.',
        severity: 'safe',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'No mask required for ambient pollution.',
        severity: 'safe',
      },
      ventilationAction: {
        title: 'Window Ventilation',
        text: 'Keep windows open to maintain pleasant cross-breezes and clear stale air.',
        severity: 'safe',
      },
      purifierAction: {
        title: 'Air Filtration',
        text: 'Natural airflow is healthy today; standard fan settings are fine.',
        severity: 'safe',
      },
      specialAction: {
        title: 'Circulation',
        text: 'Gentle outdoor mobility promotes circulation and joint health in clean air.',
        severity: 'safe',
      },
      dos: ['Enjoy outdoor community activities', 'Open bedroom windows for fresh air'],
      donts: ['Remain cooped up indoors without fresh airflow'],
    },
    respiratory: {
      headline: 'Clear airways: low environmental trigger risk',
      overview: 'Particulate and gas levels are well below typical bronchospasm triggers.',
      activityAction: {
        title: 'Physical Activity',
        text: 'Outdoor exercise is safe. Regular warm-ups remain recommended.',
        severity: 'safe',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'Pollution masks are unnecessary today.',
        severity: 'safe',
      },
      ventilationAction: {
        title: 'Home Ventilation',
        text: 'Safe to open windows unless you have severe pollen allergies in blooming season.',
        severity: 'safe',
      },
      purifierAction: {
        title: 'Air Purifier',
        text: 'Keep on standard setting to maintain indoor dust control.',
        severity: 'safe',
      },
      specialAction: {
        title: 'Inhaler / Medication',
        text: 'Maintain prescribed baseline maintenance medicines as usual.',
        severity: 'safe',
      },
      dos: ['Take regular outdoor strolls', 'Keep maintenance inhaler on hand as routine practice'],
      donts: ['Skip prescribed preventive asthma medications'],
    },
    athletes: {
      headline: 'Prime peak performance training conditions',
      overview:
        'Deep breathing during intense aerobic workouts will not pull harmful toxins into alveoli.',
      activityAction: {
        title: 'Endurance Training',
        text: 'Full green light for VO2 max sessions, interval training, and long distance efforts.',
        severity: 'safe',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'Do not wear restrictive filtration masks during hard workouts.',
        severity: 'safe',
      },
      ventilationAction: {
        title: 'Indoor Gyms',
        text: 'Gyms and studios can safely pull fresh outside air.',
        severity: 'safe',
      },
      purifierAction: {
        title: 'Recovery Environment',
        text: 'Standard clean recovery room setting.',
        severity: 'safe',
      },
      specialAction: {
        title: 'Hydration & Nutrition',
        text: 'Focus on conventional hydration and training goals.',
        severity: 'safe',
      },
      dos: ['Hit outdoor PRs and interval goals', 'Perform morning or afternoon track workouts'],
      donts: ['Hold back training intensity due to air concerns'],
    },
  },

  moderate: {
    general: {
      headline: 'Air quality is acceptable for most people',
      overview:
        'Most people will experience no problems. A few unusually sensitive people may notice slight throat dryness.',
      activityAction: {
        title: 'Outdoor Exercise',
        text: 'Normal outdoor activities are perfectly fine.',
        severity: 'safe',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'No mask is required for the general public.',
        severity: 'safe',
      },
      ventilationAction: {
        title: 'Home Ventilation',
        text: 'Windows can be open during the day; close if living next to heavy traffic highways.',
        severity: 'safe',
      },
      purifierAction: {
        title: 'Air Purifier',
        text: 'Run on auto or standard filtration if indoors for prolonged periods.',
        severity: 'safe',
      },
      specialAction: {
        title: 'General Wellness',
        text: 'Stay hydrated and monitor if symptoms like coughing develop.',
        severity: 'safe',
      },
      dos: ['Carry on with planned outdoor plans', 'Maintain normal work commutes'],
      donts: ['Unnecessarily cancel outdoor community events'],
    },
    children: {
      headline: 'Generally safe outdoor play; observe sensitive kids',
      overview:
        'Healthy children can play freely outside. Children with known wheezing should be monitored.',
      activityAction: {
        title: 'Play & Sports',
        text: 'School sports and playground sessions can proceed normally.',
        severity: 'safe',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'Not required for healthy kids.',
        severity: 'safe',
      },
      ventilationAction: {
        title: 'Ventilation',
        text: 'Moderate window airing is fine. Avoid rush-hour street exhaust.',
        severity: 'safe',
      },
      purifierAction: {
        title: 'Bedrooms',
        text: 'Running a HEPA filter in bedrooms overnight helps restful sleep.',
        severity: 'safe',
      },
      specialAction: {
        title: 'Symptom Watch',
        text: 'Watch for complaints of scratchy eyes or post-nasal drip.',
        severity: 'caution',
      },
      dos: ['Encourage regular outdoor recreation', 'Keep water bottles handy for hydration'],
      donts: ['Ignore persistent dry coughing during active games'],
    },
    elderly: {
      headline: 'Acceptable air; take routine pacing breaks',
      overview: 'Air is largely fine, but prolonged heavy exertion may induce mild fatigue.',
      activityAction: {
        title: 'Outdoor Strolls',
        text: 'Gentle walks and errands are good. Take brief rest pauses if feeling winded.',
        severity: 'safe',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'Mask optional; consider a light mask only if walking in traffic jams.',
        severity: 'safe',
      },
      ventilationAction: {
        title: 'Home Windows',
        text: 'Ventilate for an hour in early morning when traffic is lighter.',
        severity: 'safe',
      },
      purifierAction: {
        title: 'Air Purifier',
        text: 'Keep living areas filtered, especially if living near major roads.',
        severity: 'safe',
      },
      specialAction: {
        title: 'Heart & Lungs',
        text: 'Drink water regularly to keep mucous membranes moist.',
        severity: 'safe',
      },
      dos: ['Take pleasant walks during morning hours', 'Keep daily activity steady with rests'],
      donts: ['Overexert during hot midday peak ozone hours'],
    },
    respiratory: {
      headline: 'Mild caution: sensitive airways may react',
      overview:
        'People with asthma or reactive airway disease might feel slight tightness during hard exertion.',
      activityAction: {
        title: 'Exercise Pacing',
        text: 'Light-to-moderate outdoor workouts are fine. Avoid sprint intervals near busy corridors.',
        severity: 'caution',
      },
      maskAction: {
        title: 'Mask Consideration',
        text: 'A well-fitted mask is helpful if you know you are unusually sensitive to particulate matter.',
        severity: 'caution',
      },
      ventilationAction: {
        title: 'Window Management',
        text: 'Keep windows slightly cracked for freshness, but close during peak vehicle congestion.',
        severity: 'caution',
      },
      purifierAction: {
        title: 'Air Purifier',
        text: 'Keep HEPA filter running in your main sleeping room.',
        severity: 'caution',
      },
      specialAction: {
        title: 'Quick-Relief Inhaler',
        text: 'Have your rescue bronchodilator accessible in your bag or pocket.',
        severity: 'caution',
      },
      dos: ['Carry quick-relief rescue inhaler', 'Do a gradual 10-minute cardiovascular warm-up'],
      donts: ['Exercise directly along multilane expressways', 'Ignore early chest tightness'],
    },
    athletes: {
      headline: 'Good training window; avoid rush-hour arteries',
      overview:
        'Air quality is fine for endurance, but avoid heavy exhaust plumes from busy boulevards.',
      activityAction: {
        title: 'Route Selection',
        text: 'Train in parks, greenways, or quiet residential grids rather than traffic corridors.',
        severity: 'safe',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'No mask recommended during aerobic training.',
        severity: 'safe',
      },
      ventilationAction: {
        title: 'Gym Facilities',
        text: 'Indoor gyms should maintain clean filtration filters.',
        severity: 'safe',
      },
      purifierAction: {
        title: 'Sleep Recovery',
        text: 'Ensure bedroom air is well-filtered for cellular recovery.',
        severity: 'safe',
      },
      specialAction: {
        title: 'Ozone Watch',
        text: 'In summer, shift strenuous long sessions to morning before solar ozone builds.',
        severity: 'caution',
      },
      dos: ['Select park routes away from tailpipes', 'Hydrate prior to and during long sessions'],
      donts: ['Run during afternoon rush hour right next to diesel trucks'],
    },
  },

  'unhealthy-sensitive': {
    general: {
      headline: 'Noticeable haze: sensitive people affected',
      overview: 'Healthy adults can still be outside, but high-intensity exertion should be paced.',
      activityAction: {
        title: 'Outdoor Activity',
        text: 'Safe for moderate walks and errands. Take more rest breaks during sports.',
        severity: 'caution',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'Not required for healthy adults, but comfortable masks reduce road dust.',
        severity: 'safe',
      },
      ventilationAction: {
        title: 'Windows',
        text: 'Keep windows closed during afternoon peaks; open briefly only in early dawn.',
        severity: 'caution',
      },
      purifierAction: {
        title: 'Purifier',
        text: 'Turn indoor purifiers up to medium speed.',
        severity: 'caution',
      },
      specialAction: {
        title: 'Hydration',
        text: 'Increase fluid intake to help mucous membranes clear particle deposition.',
        severity: 'safe',
      },
      dos: ['Take periodic rests during outdoor tasks', 'Rinse eyes with saline if feeling gritty'],
      donts: ['Burn firewood or barbecue outdoors today'],
    },
    children: {
      headline: 'Reduce prolonged outdoor exertion for youth',
      overview:
        'Kids breathe 50% more air per pound than adults. Reduce long strenuous playground sessions.',
      activityAction: {
        title: 'Play & Recess',
        text: 'Limit intense physical education drills to under 30 minutes; swap to indoor games.',
        severity: 'warning',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'Consider a child-sized particulate mask for outdoor commutes.',
        severity: 'caution',
      },
      ventilationAction: {
        title: 'Windows',
        text: 'Keep classroom and playroom windows shut. Use indoor AC/fans.',
        severity: 'warning',
      },
      purifierAction: {
        title: 'Filtration',
        text: 'Run HEPA air cleaners in study and sleep rooms.',
        severity: 'caution',
      },
      specialAction: {
        title: 'Asthma in Kids',
        text: 'Ensure school nurse or teacher has action plan and inhaler.',
        severity: 'warning',
      },
      dos: [
        'Substitute tag or sprint games with lower-intensity indoor activities',
        'Drink water frequently',
      ],
      donts: ['Permit multi-hour outdoor soccer or endurance matches in heavy haze'],
    },
    elderly: {
      headline: 'Seniors should limit strenuous outdoor chores',
      overview:
        'Particulates can trigger cardiac strain in older adults. Keep physical exertion light.',
      activityAction: {
        title: 'Daily Activities',
        text: 'Curtail heavy garden digging or brisk walks. Prefer indoor morning strolls.',
        severity: 'warning',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'Wear a well-fitting mask if spending more than 20 minutes outside.',
        severity: 'caution',
      },
      ventilationAction: {
        title: 'Windows',
        text: 'Keep windows closed to block fine particulates from entering living quarters.',
        severity: 'warning',
      },
      purifierAction: {
        title: 'Air Purifier',
        text: 'Run room air purifiers continuously on medium setting.',
        severity: 'caution',
      },
      specialAction: {
        title: 'Cardiovascular Care',
        text: 'Monitor blood pressure and report unexpected shortness of breath.',
        severity: 'warning',
      },
      dos: [
        'Stay in air-filtered indoor environments',
        'Take prescribed blood pressure/heart meds on schedule',
      ],
      donts: ['Do heavy yard work, raking, or leaf blowing today'],
    },
    respiratory: {
      headline: 'Elevated trigger risk: keep rescue inhaler ready',
      overview:
        'Microscopic soot will irritate bronchial pathways. Noticeable risk of coughing and wheezing.',
      activityAction: {
        title: 'Outdoor Exercise',
        text: 'Move workouts indoors. Avoid outdoor jogging or cycling completely.',
        severity: 'warning',
      },
      maskAction: {
        title: 'Mask Protection',
        text: 'Wear an N95 or KN95 respirator whenever walking outside.',
        severity: 'warning',
      },
      ventilationAction: {
        title: 'Windows',
        text: 'Strictly close all exterior windows and doors.',
        severity: 'warning',
      },
      purifierAction: {
        title: 'Purifier',
        text: 'Activate true HEPA filtration in your primary rooms.',
        severity: 'warning',
      },
      specialAction: {
        title: 'Emergency Inhaler',
        text: 'Verify your rescue albuterol has remaining doses and keep it at your side.',
        severity: 'warning',
      },
      dos: [
        'Keep rescue inhaler in pocket',
        'Use indoor elliptical or treadmill instead of outdoor routes',
      ],
      donts: [
        'Walk outside along congested roads without a particulate mask',
        'Ignore chest tightness',
      ],
    },
    athletes: {
      headline: 'Move high-volume cardiovascular workouts indoors',
      overview: 'Heavy minute-ventilation draws 10x more particulates deep into bronchioles.',
      activityAction: {
        title: 'Workout Venue',
        text: 'Move training to an air-conditioned indoor facility or gym. Reduce workout duration.',
        severity: 'warning',
      },
      maskAction: {
        title: 'Mask Advice',
        text: 'Respirators restrict peak oxygen intake during max efforts; better to move indoors.',
        severity: 'caution',
      },
      ventilationAction: {
        title: 'Ventilation',
        text: 'Do not train in garages with open street bays.',
        severity: 'caution',
      },
      purifierAction: {
        title: 'Recovery',
        text: 'Ensure training club or home workout room has active HEPA filtration.',
        severity: 'caution',
      },
      specialAction: {
        title: 'Lung Strain',
        text: 'Look out for post-exercise bronchospasm or throat burning sensations.',
        severity: 'warning',
      },
      dos: [
        'Choose indoor treadmill, spin bike, or pool',
        'Shift heavy mileage to later when AQI drops',
      ],
      donts: ['Perform 20-mile outdoor runs or time-trials in compromised air'],
    },
  },

  unhealthy: {
    general: {
      headline: 'Unhealthy air: everyone should reduce outdoor exertion',
      overview:
        'Everyone may begin to feel throat scratchiness, irritated eyes, or fatigue. Avoid heavy outdoor tasks.',
      activityAction: {
        title: 'Outdoor Exertion',
        text: 'Curtail prolonged or heavy outdoor work. Take frequent breaks inside.',
        severity: 'warning',
      },
      maskAction: {
        title: 'Mask Protection',
        text: 'Wear a well-fitted N95 or KN95 particulate respirator when stepping out.',
        severity: 'warning',
      },
      ventilationAction: {
        title: 'Windows',
        text: 'Keep windows and doors securely closed. Set HVAC to re-circulate mode.',
        severity: 'warning',
      },
      purifierAction: {
        title: 'Purifier',
        text: 'Run HEPA purifiers on medium-high in living spaces.',
        severity: 'warning',
      },
      specialAction: {
        title: 'Indoor Air Quality',
        text: 'Avoid frying foods, burning candles, or vacuuming without HEPA exhaust.',
        severity: 'caution',
      },
      dos: ['Wear an N95 mask outdoors', 'Keep home sealed and recirculate clean air'],
      donts: [
        'Go for outdoor jogs or manual yard labor',
        'Allow smoke or vehicle idle near windows',
      ],
    },
    children: {
      headline: 'Keep children indoors; suspend outdoor sports',
      overview: 'Developing lungs are prone to inflammatory damage at this pollution tier.',
      activityAction: {
        title: 'Recess & Sports',
        text: 'Cancel outdoor physical education, soccer matches, and prolonged playground time.',
        severity: 'danger',
      },
      maskAction: {
        title: 'Mask Protection',
        text: 'Equip youth with well-fitting high-filtration masks for travel to/from school.',
        severity: 'warning',
      },
      ventilationAction: {
        title: 'School & Home',
        text: 'Close all school and home windows; tape loose drafty sills if needed.',
        severity: 'warning',
      },
      purifierAction: {
        title: 'HEPA Units',
        text: 'Run HEPA air cleaners on high in play areas and children bedrooms.',
        severity: 'warning',
      },
      specialAction: {
        title: 'Watch Kids Closely',
        text: 'Check for shallow breathing, rubbing eyes, or unusual fatigue.',
        severity: 'danger',
      },
      dos: [
        'Organize indoor board games, reading, and crafts',
        'Monitor children with reactive airway history',
      ],
      donts: ['Allow children to play tag or run around outdoors today'],
    },
    elderly: {
      headline: 'High health risk for older adults: remain indoors',
      overview:
        'Elevated particle concentrations significantly increase cardiac arrhythmia and stroke risk.',
      activityAction: {
        title: 'Outdoor Activity',
        text: 'Stay indoors as much as possible. Reschedule routine outdoor errands.',
        severity: 'danger',
      },
      maskAction: {
        title: 'Mask Protection',
        text: 'Wear an N95 mask if you must step outside even for 5 minutes.',
        severity: 'warning',
      },
      ventilationAction: {
        title: 'Home Sealing',
        text: 'Keep home tightly closed. Set central cooling/heating to recirculate.',
        severity: 'warning',
      },
      purifierAction: {
        title: 'Purifier',
        text: 'Operate HEPA purifiers in bedrooms and main sitting areas continuously.',
        severity: 'warning',
      },
      specialAction: {
        title: 'Medical Alert',
        text: 'Have emergency contacts ready. Seek medical attention if experiencing chest pain or wheezing.',
        severity: 'danger',
      },
      dos: ['Stay inside clean filtered rooms', 'Keep medications and phone within reach'],
      donts: ['Walk outside for recreation or grocery hauling today'],
    },
    respiratory: {
      headline: 'Severe trigger conditions: stay inside protected clean air',
      overview:
        'Dangerous levels for asthma and COPD. Inhalation of particulate matter triggers acute bronchoconstriction.',
      activityAction: {
        title: 'Outdoor Activity',
        text: 'Do not go outdoors. Cancel non-urgent outdoor travel entirely.',
        severity: 'danger',
      },
      maskAction: {
        title: 'Respirator',
        text: 'Strict N95/FFP2 respirator requirement if stepping outside is unavoidable.',
        severity: 'danger',
      },
      ventilationAction: {
        title: 'Windows',
        text: 'Strictly sealed. Place damp towels along door drafts if smoke enters.',
        severity: 'danger',
      },
      purifierAction: {
        title: 'HEPA Unit',
        text: 'Run air purifiers at high speed. Create a dedicated clean-room.',
        severity: 'danger',
      },
      specialAction: {
        title: 'Medication Protocol',
        text: 'Follow your asthma action plan. Keep rescue inhaler in hand.',
        severity: 'danger',
      },
      dos: [
        'Create a sealed "clean room" with a running HEPA unit',
        'Take baseline medications without omission',
      ],
      donts: [
        'Step outside without an N95 mask',
        'Wait to use rescue inhaler if chest feels constricted',
      ],
    },
    athletes: {
      headline: 'Cancel all outdoor workouts; severe lung stress',
      overview:
        'Athletic respiratory intake will deposit millions of toxic micro-particles into deep alveolar spaces.',
      activityAction: {
        title: 'Training Suspension',
        text: 'Zero outdoor training. Complete all training on indoor rollers or gyms.',
        severity: 'danger',
      },
      maskAction: {
        title: 'Mask Guidance',
        text: 'Wear an N95 for normal outdoor transit.',
        severity: 'warning',
      },
      ventilationAction: {
        title: 'Gym Assessment',
        text: 'Check if your gym has commercial HEPA / MERV 13+ filtration.',
        severity: 'warning',
      },
      purifierAction: {
        title: 'Recovery',
        text: 'Prioritize antioxidant recovery and sleep in heavily filtered rooms.',
        severity: 'warning',
      },
      specialAction: {
        title: 'Health Risk',
        text: 'Exercising in this air can cause acute bronchitis and lung tissue micro-scarring.',
        severity: 'danger',
      },
      dos: [
        'Train on an indoor treadmill or stationary bike in clean air',
        'Hydrate and rest adequately',
      ],
      donts: ['Compete in outdoor races, marathons, or cycle rallies'],
    },
  },

  'very-unhealthy': {
    general: {
      headline: 'Health alert: serious risk of harmful exposure for everyone',
      overview:
        'The entire public will experience adverse effects. Micro-particles penetrate deep into tissues.',
      activityAction: {
        title: 'Outdoor Activity',
        text: 'Avoid all physical outdoor exertion. Keep outdoor transit to an absolute minimum.',
        severity: 'danger',
      },
      maskAction: {
        title: 'N95 / FFP2 Required',
        text: 'Do not step outside without a certified tight-fitting N95/FFP2/KN95 respirator.',
        severity: 'danger',
      },
      ventilationAction: {
        title: 'Seal Living Spaces',
        text: 'Keep windows and exterior dampers closed. Use wet towels to block draft gaps.',
        severity: 'danger',
      },
      purifierAction: {
        title: 'Max Purifier Setting',
        text: 'Run HEPA air purifiers at maximum turbo speed continuously.',
        severity: 'danger',
      },
      specialAction: {
        title: 'Reduce Indoor Sources',
        text: 'Do not cook with gas high heat, fry foods, or use chemical sprays.',
        severity: 'warning',
      },
      dos: [
        'Stay inside sealed buildings with filtered ventilation',
        'Wear sealed N95 respirator outdoors',
      ],
      donts: ['Engage in outdoor activities', 'Open windows even for a few minutes'],
    },
    children: {
      headline: 'Keep all children strictly indoors in clean filtered spaces',
      overview:
        'High hazard level for juvenile lung epithelium. Prolonged exposure causes cellular injury.',
      activityAction: {
        title: 'Outdoor Play',
        text: 'Zero outdoor play. Schools should implement full indoor lockdown protocols.',
        severity: 'danger',
      },
      maskAction: {
        title: 'Child Respirators',
        text: 'Fit children with vetted pediatric particulate respirators for transit.',
        severity: 'danger',
      },
      ventilationAction: {
        title: 'Building Seal',
        text: 'Seal windows and door sweeps. Keep interior recirculated air running.',
        severity: 'danger',
      },
      purifierAction: {
        title: 'HEPA Clean Room',
        text: 'Confine children to the cleanest central room with continuous HEPA filtration.',
        severity: 'danger',
      },
      specialAction: {
        title: 'Emergency Vigilance',
        text: 'Watch for flaring nostrils, persistent coughing, or lethargy.',
        severity: 'danger',
      },
      dos: [
        'Keep children calm indoors with creative entertainment',
        'Maintain continuous room air purification',
      ],
      donts: ['Allow children outdoors under any circumstance without protection'],
    },
    elderly: {
      headline: 'Severe cardiovascular warning: remain inside clean air',
      overview:
        'High incidence of cardiovascular events and respiratory collapse triggered at these concentrations.',
      activityAction: {
        title: 'Outdoor Confinement',
        text: 'Do not go outside. Request family or neighbors to handle essential supplies.',
        severity: 'danger',
      },
      maskAction: {
        title: 'Respirators',
        text: 'N95 respirator mandatory if evacuation or transit is needed.',
        severity: 'danger',
      },
      ventilationAction: {
        title: 'Hermetic Sealing',
        text: 'Close all storm windows and shut ventilation flues tightly.',
        severity: 'danger',
      },
      purifierAction: {
        title: 'Air Purifiers',
        text: 'Maintain high filtration in living and sleeping quarters.',
        severity: 'danger',
      },
      specialAction: {
        title: 'Medical Monitoring',
        text: 'Check pulse oximeter if available. Keep doctor emergency numbers in quick dial.',
        severity: 'danger',
      },
      dos: [
        'Remain strictly indoors in a purified room',
        'Stay hydrated and take cardiovascular prescriptions',
      ],
      donts: ['Step outside for mail or waste disposal', 'Ignore dizziness or chest pressure'],
    },
    respiratory: {
      headline: 'Critical respiratory danger: prepare clean room protocol',
      overview:
        'Acute asthma attacks and COPD exacerbations are extremely frequent under these conditions.',
      activityAction: {
        title: 'Shelter in Place',
        text: 'Strictly remain inside your clean-air room. Absolutely no outdoor exposure.',
        severity: 'danger',
      },
      maskAction: {
        title: 'Respirators',
        text: 'Certified N95/P100 respirator required for any emergency transit.',
        severity: 'danger',
      },
      ventilationAction: {
        title: 'Total Seal',
        text: 'Tape window edges and door thresholds with painter tape or damp towels.',
        severity: 'danger',
      },
      purifierAction: {
        title: 'HEPA Units',
        text: 'Run multiple HEPA units if available; position filter near your head when sleeping.',
        severity: 'danger',
      },
      specialAction: {
        title: 'Nebulizer / Inhaler',
        text: 'Ensure nebulizer or rescue inhaler is ready with full supplies. Review urgent care plan.',
        severity: 'danger',
      },
      dos: [
        'Establish a sealed clean room',
        'Have full supply of bronchodilators and anti-inflammatories ready',
      ],
      donts: [
        'Expose airways to unfiltered outdoor air',
        'Hesitate to call emergency services if distressed',
      ],
    },
    athletes: {
      headline: 'Severe pulmonary toxicity risk: all workouts strictly cancelled',
      overview:
        'Exercising in this air induces immediate oxidative distress, tissue injury, and systemic inflammation.',
      activityAction: {
        title: 'Workouts Cancelled',
        text: 'Cancel all training sessions. High cardiac stroke volume pumps toxins into internal organs.',
        severity: 'danger',
      },
      maskAction: {
        title: 'Respirators',
        text: 'N95/FFP2 respirator must be worn for all necessary outdoor movement.',
        severity: 'danger',
      },
      ventilationAction: {
        title: 'Indoor Air',
        text: 'Ensure indoor training facility is equipped with industrial HEPA filtration.',
        severity: 'warning',
      },
      purifierAction: {
        title: 'Purifier',
        text: 'Run HEPA filters at max capacity in living quarters.',
        severity: 'danger',
      },
      specialAction: {
        title: 'Recovery Protocol',
        text: 'Prioritize antioxidant-rich nutrition, deep hydration, and passive recovery.',
        severity: 'warning',
      },
      dos: [
        'Shift focus to passive rest, mobility, and video analysis',
        'Protect lungs from acute particulate load',
      ],
      donts: ['Attempt high-effort cardiovascular exercise indoors without verified HEPA air'],
    },
  },

  hazardous: {
    general: {
      headline: 'Emergency warning: entire population at severe risk',
      overview:
        'Extreme pollution levels. Even healthy individuals are likely to experience severe symptoms and reduced lung capacity.',
      activityAction: {
        title: 'Total Confinement',
        text: 'Avoid all outdoor exposure. Stay indoors with sealed doors and windows.',
        severity: 'danger',
      },
      maskAction: {
        title: 'N95 / FFP3 Mandatory',
        text: 'Strict N95/FFP3 respirator fit is required for any unavoidable exterior exposure.',
        severity: 'danger',
      },
      ventilationAction: {
        title: 'Total Seal',
        text: 'Keep all windows, doors, and vents completely sealed. Do not run exhaust fans.',
        severity: 'danger',
      },
      purifierAction: {
        title: 'Maximum Purification',
        text: 'Run all air purifiers on maximum speed. Create a central clean-room bunker.',
        severity: 'danger',
      },
      specialAction: {
        title: 'Emergency Advice',
        text: 'Follow local civil defense and public health authority evacuation announcements.',
        severity: 'danger',
      },
      dos: [
        'Shelter in place inside a sealed room',
        'Check on vulnerable family members and neighbors',
      ],
      donts: ['Open exterior doors unless evacuating', 'Perform any physical exertion'],
    },
    children: {
      headline: 'Emergency conditions: protect children in hermetic clean room',
      overview:
        'Extremely hazardous toxic particulate density. Urgent prevention of air intake needed.',
      activityAction: {
        title: 'Full Shelter in Place',
        text: 'Keep children inside sealed interior rooms away from outside walls.',
        severity: 'danger',
      },
      maskAction: {
        title: 'Respirators',
        text: 'High-efficiency particulate respirator must be fitted if moving between shelters.',
        severity: 'danger',
      },
      ventilationAction: {
        title: 'Seal Room',
        text: 'Tape all seams around window frames and under door thresholds.',
        severity: 'danger',
      },
      purifierAction: {
        title: 'HEPA Units',
        text: 'Keep HEPA filters operating on maximum adjacent to childrens play and sleep zones.',
        severity: 'danger',
      },
      specialAction: {
        title: 'Clinical Watch',
        text: 'Seek immediate pediatric urgent care if child shows lethargy or labored breathing.',
        severity: 'danger',
      },
      dos: [
        'Keep children calm and occupied indoors',
        'Monitor respiration and skin color closely',
      ],
      donts: ['Allow children near outside doors or drafty windows'],
    },
    elderly: {
      headline: 'Critical emergency for older adults: strict shelter in place',
      overview:
        'Catastrophic risk to cardiac and pulmonary stability. Highest risk group for acute mortality.',
      activityAction: {
        title: 'Zero Outdoor Contact',
        text: 'Do not open exterior doors. Remain inside a purified central room.',
        severity: 'danger',
      },
      maskAction: {
        title: 'Respirators',
        text: 'Hospital-grade N95 respirator fitted snugly if evacuation is ordered.',
        severity: 'danger',
      },
      ventilationAction: {
        title: 'Airtight Living',
        text: 'Seal room doors with wet towels or duct tape. Close fireplace dampers.',
        severity: 'danger',
      },
      purifierAction: {
        title: 'HEPA Protection',
        text: 'Continuous maximum filtration. Keep bedroom air as clean as an operating suite.',
        severity: 'danger',
      },
      specialAction: {
        title: 'Urgent Care Line',
        text: 'Have emergency ambulance and medical lines pre-programmed.',
        severity: 'danger',
      },
      dos: [
        'Stay in bed or comfortable seating in a clean room',
        'Take cardiac medications on exact schedule',
      ],
      donts: ['Venture outside for any reason', 'Ignore chest tightness or irregular heartbeat'],
    },
    respiratory: {
      headline: 'Code red respiratory crisis: immediate shelter in clean room',
      overview:
        'Air contains emergency-level concentrations of corrosive and particulate toxins. High risk of status asthmaticus.',
      activityAction: {
        title: 'Emergency Clean Room',
        text: 'Stay strictly in a sealed room with HEPA filtration. Avoid any movement.',
        severity: 'danger',
      },
      maskAction: {
        title: 'Tight-fitting N95/P100',
        text: 'Do not remove respirator if outdoor exposure is required during emergency transit.',
        severity: 'danger',
      },
      ventilationAction: {
        title: 'Total Isolation',
        text: 'Seal room borders with painters tape or damp towels. Block air returns if unmanaged.',
        severity: 'danger',
      },
      purifierAction: {
        title: 'Dual HEPA Operation',
        text: 'Run HEPA units right next to bedside. Ensure replacement filters are installed.',
        severity: 'danger',
      },
      specialAction: {
        title: 'Emergency Medical Plan',
        text: 'Call emergency services immediately if rescue inhaler does not relieve bronchospasm.',
        severity: 'danger',
      },
      dos: [
        'Keep nebulizer, oxygen, and emergency inhalers within arms reach',
        'Call emergency services at early distress',
      ],
      donts: ['Wait until peak distress to seek medical intervention', 'Turn off air purifiers'],
    },
    athletes: {
      headline: 'Severe biological hazard: all athletic activity forbidden',
      overview: 'Breathing hazardous air causes permanent alveolar scarring and acute toxicity.',
      activityAction: {
        title: 'Complete Rest',
        text: 'Zero workouts of any kind. Complete physical rest and indoor sheltering.',
        severity: 'danger',
      },
      maskAction: {
        title: 'Respirator',
        text: 'Wear N95 whenever transitioning between buildings.',
        severity: 'danger',
      },
      ventilationAction: {
        title: 'Sealed Facilities',
        text: 'Sports complexes and gyms must seal intakes unless certified hospital-grade filtration.',
        severity: 'danger',
      },
      purifierAction: {
        title: 'HEPA Filter',
        text: 'Keep purifiers on turbo in all residential rooms.',
        severity: 'danger',
      },
      specialAction: {
        title: 'Toxin Elimination',
        text: 'Focus on rest, hydration, and following local public health alerts.',
        severity: 'danger',
      },
      dos: [
        'Prioritize personal safety over training schedules',
        'Remain in clean filtered indoor rooms',
      ],
      donts: ['Attempt any physical training until emergency air quality notices are lifted'],
    },
  },
};

/**
 * Generates deterministic rule-based advice for a specific AQI value and user group.
 */
export function generateAdvice(aqi: number, group: UserGroup): AdviceReport {
  const categoryLevel = getAQICategory(aqi);
  const matrix = ADVICE_MATRIX[categoryLevel][group];

  const actions: AdviceAction[] = [
    {
      id: 'activity',
      category: 'activity',
      title: matrix.activityAction.title,
      recommendation: matrix.activityAction.text,
      severity: matrix.activityAction.severity,
      icon: '🏃',
    },
    {
      id: 'mask',
      category: 'mask',
      title: matrix.maskAction.title,
      recommendation: matrix.maskAction.text,
      severity: matrix.maskAction.severity,
      icon: '😷',
    },
    {
      id: 'ventilation',
      category: 'ventilation',
      title: matrix.ventilationAction.title,
      recommendation: matrix.ventilationAction.text,
      severity: matrix.ventilationAction.severity,
      icon: '🪟',
    },
    {
      id: 'purifier',
      category: 'purifier',
      title: matrix.purifierAction.title,
      recommendation: matrix.purifierAction.text,
      severity: matrix.purifierAction.severity,
      icon: '💨',
    },
    {
      id: 'special',
      category: 'special',
      title: matrix.specialAction.title,
      recommendation: matrix.specialAction.text,
      severity: matrix.specialAction.severity,
      icon: '🩺',
    },
  ];

  return {
    userGroup: group,
    aqiLevel: categoryLevel,
    aqiValue: Math.round(aqi),
    headline: matrix.headline,
    overview: matrix.overview,
    actions,
    dos: matrix.dos,
    donts: matrix.donts,
    disclaimer:
      'AirWise advice is informational and intended for guidance only. It does not substitute for personalized medical diagnosis or doctor recommendations.',
  };
}
