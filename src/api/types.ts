export type UserGroup = 'general' | 'children' | 'elderly' | 'respiratory' | 'athletes';

export type AQICategoryLevel =
  'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export interface GeoLocation {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export interface PollutantInfo {
  key: string;
  name: string;
  formula: string;
  value: number;
  unit: string;
  standard: string;
  description: string;
  healthImpact: string;
  status: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
}

export interface HourlyForecastPoint {
  time: string; // ISO string
  timestamp: number;
  formattedTime: string;
  dayLabel: string;
  usAqi: number;
  pm2_5: number;
  category: AQICategoryLevel;
}

export interface ForecastAnalysis {
  points: HourlyForecastPoint[];
  minAqiPoint: HourlyForecastPoint;
  maxAqiPoint: HourlyForecastPoint;
  averageAqi: number;
  trend: 'improving' | 'worsening' | 'stable';
  bestWindowText: string;
  timezone?: string;
}

export interface CurrentAirQuality {
  time: string;
  usAqi: number;
  categoryLevel: AQICategoryLevel;
  categoryName: string;
  categoryColor: string;
  categoryBgColor: string;
  categoryTextColor: string;
  categoryPattern: string;
  categoryIcon: string;
  summary: string;
  pollutants: {
    pm2_5: PollutantInfo;
    pm10: PollutantInfo;
    nitrogen_dioxide: PollutantInfo;
    ozone: PollutantInfo;
    carbon_monoxide: PollutantInfo;
    sulphur_dioxide: PollutantInfo;
  };
}

export interface AirQualityData {
  location: GeoLocation;
  current: CurrentAirQuality;
  forecast: ForecastAnalysis;
  lastUpdated: string;
  isCached?: boolean;
  timezone?: string;
}

export interface AdviceAction {
  id: string;
  category: 'activity' | 'mask' | 'ventilation' | 'purifier' | 'special';
  title: string;
  recommendation: string;
  severity: 'safe' | 'caution' | 'warning' | 'danger';
  icon: string;
}

export interface AdviceReport {
  userGroup: UserGroup;
  aqiLevel: AQICategoryLevel;
  aqiValue: number;
  headline: string;
  overview: string;
  actions: AdviceAction[];
  dos: string[];
  donts: string[];
  disclaimer: string;
}
