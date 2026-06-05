# backend/app/schemas/prediction.py
from uuid import UUID
from datetime import datetime
from typing import Dict, List, Any
from pydantic import BaseModel

class RecommendationDetail(BaseModel):
    feature: str
    current: Any
    recommended: Any
    impact: float

class PredictionOut(BaseModel):
    id: UUID
    user_id: UUID
    response_id: UUID
    predicted_score: float
    confidence_score: float
    risk_level: str
    feature_importance: Dict[str, float]
    recommendations: List[RecommendationDetail]
    created_at: datetime

    class Config:
        from_attributes = True

class WhatIfRequest(BaseModel):
    study_hours_per_week: float
    attendance_rate: float
    sleep_hours_per_day: float
    screen_time_per_day: float
    physical_activity_hours_per_week: float
    study_consistency: float
    parental_involvement: str
    access_to_resources: str
    family_income: str
    motivation_level: str
    internet_access: bool
    extracurricular: bool
