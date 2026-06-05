export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "teacher";
}

export interface QuestionnaireResponse {
  id?: string;
  user_id?: string;
  study_hours_per_week: number;
  attendance_rate: number;
  sleep_hours_per_day: number;
  screen_time_per_day: number;
  physical_activity_hours_per_week: number;
  study_consistency: number;
  parental_involvement: "Low" | "Medium" | "High" | string;
  access_to_resources: "Low" | "Medium" | "High" | string;
  family_income: "Low" | "Medium" | "High" | string;
  motivation_level: "Low" | "Medium" | "High" | string;
  internet_access: boolean;
  extracurricular: boolean;
  created_at?: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  response_id: string;
  predicted_score: number;
  confidence_score: number;
  risk_level: "Low" | "Medium" | "High" | string;
  feature_importance: Record<string, number>;
  recommendations: Array<{
    feature: string;
    current: any;
    recommended: any;
    impact: number;
  }>;
  created_at: string;
}
