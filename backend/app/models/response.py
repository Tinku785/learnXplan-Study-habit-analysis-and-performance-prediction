# backend/app/models/response.py
import uuid
from sqlalchemy import Column, Float, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class QuestionnaireResponse(Base):
    __tablename__ = "questionnaire_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Numeric habits & behavior features
    study_hours_per_week = Column(Float, nullable=False)
    attendance_rate = Column(Float, nullable=False)
    sleep_hours_per_day = Column(Float, nullable=False)
    screen_time_per_day = Column(Float, nullable=False)
    physical_activity_hours_per_week = Column(Float, nullable=False)
    study_consistency = Column(Float, nullable=False)  # Scale from 0.0 to 1.0 (e.g. daily vs cramming)
    
    # Categorical background features
    parental_involvement = Column(String(50), nullable=False)  # 'Low', 'Medium', 'High'
    access_to_resources = Column(String(50), nullable=False)   # 'Low', 'Medium', 'High'
    family_income = Column(String(50), nullable=False)         # 'Low', 'Medium', 'High'
    motivation_level = Column(String(50), nullable=False)      # 'Low', 'Medium', 'High'
    
    # Boolean features
    internet_access = Column(Boolean, nullable=False)
    extracurricular = Column(Boolean, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
