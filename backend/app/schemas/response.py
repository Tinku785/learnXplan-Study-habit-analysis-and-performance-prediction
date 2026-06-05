# backend/app/schemas/response.py
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class ResponseBase(BaseModel):
    study_hours_per_week: float = Field(..., ge=0, le=168)
    attendance_rate: float = Field(..., ge=0.0, le=100.0)
    sleep_hours_per_day: float = Field(..., ge=0, le=24)
    screen_time_per_day: float = Field(..., ge=0, le=24)
    physical_activity_hours_per_week: float = Field(..., ge=0, le=168)
    study_consistency: float = Field(..., ge=0.0, le=1.0) # 0 cramming, 1 consistent daily
    
    parental_involvement: str  # 'Low', 'Medium', 'High'
    access_to_resources: str  # 'Low', 'Medium', 'High'
    family_income: str        # 'Low', 'Medium', 'High'
    motivation_level: str     # 'Low', 'Medium', 'High'
    
    internet_access: bool
    extracurricular: bool

class ResponseCreate(ResponseBase):
    pass

class ResponseOut(ResponseBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
