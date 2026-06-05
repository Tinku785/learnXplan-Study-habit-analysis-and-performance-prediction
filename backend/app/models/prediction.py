# backend/app/models/prediction.py
import uuid
from sqlalchemy import Column, Float, String, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    response_id = Column(UUID(as_uuid=True), ForeignKey("questionnaire_responses.id", ondelete="CASCADE"), nullable=False)
    
    predicted_score = Column(Float, nullable=False)  # predicted exam score (e.g. 84.5)
    confidence_score = Column(Float, nullable=False) # confidence interval/percentage (e.g. 0.89)
    risk_level = Column(String(20), nullable=False)   # 'Low', 'Medium', 'High'
    
    # Store SHAP / Feature importances as a serialized JSON string
    feature_importance = Column(String, nullable=False)  
    
    # Store counterfactual actionable advice list as serialized JSON
    recommendations = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
