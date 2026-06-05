# backend/app/api/coach.py
import json
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.response import QuestionnaireResponse
from app.models.prediction import Prediction
from app.models.plan import StudyPlan
from app.schemas.plan import PlanCreate, PlanOut
from app.services.llm_service import llm_service
from typing import List

router = APIRouter(prefix="/coach", tags=["coach"])

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat_with_coach(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exposes conversational advice loops. Queries student's latest records
    and passes them to the LLM generator for custom schedules.
    """
    # Query latest response
    db_response = (
        db.query(QuestionnaireResponse)
        .filter(QuestionnaireResponse.user_id == current_user.id)
        .order_by(QuestionnaireResponse.created_at.desc())
        .first()
    )
    
    # Query latest prediction
    db_prediction = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .first()
    )

    student_profile = None
    prediction_info = None

    if db_response:
        # Construct plain dictionary from SQLAlchemy object
        student_profile = {
            "study_hours_per_week": db_response.study_hours_per_week,
            "attendance_rate": db_response.attendance_rate,
            "sleep_hours_per_day": db_response.sleep_hours_per_day,
            "screen_time_per_day": db_response.screen_time_per_day,
            "physical_activity_hours_per_week": db_response.physical_activity_hours_per_week,
            "study_consistency": db_response.study_consistency,
            "parental_involvement": db_response.parental_involvement,
            "access_to_resources": db_response.access_to_resources,
            "family_income": db_response.family_income,
            "motivation_level": db_response.motivation_level,
            "internet_access": db_response.internet_access,
            "extracurricular": db_response.extracurricular
        }
        
    if db_prediction:
        try:
            feat_imp = json.loads(db_prediction.feature_importance)
        except Exception:
            feat_imp = {}
            
        try:
            recs = json.loads(db_prediction.recommendations)
        except Exception:
            recs = []
            
        prediction_info = {
            "predicted_score": db_prediction.predicted_score,
            "confidence_score": db_prediction.confidence_score,
            "risk_level": db_prediction.risk_level,
            "feature_importance": feat_imp,
            "recommendations": recs
        }

    # Query LLM advice
    advice = llm_service.generate_coach_response(
        prompt=request.message,
        student_profile=student_profile,
        prediction=prediction_info
    )

    return {"response": advice}

@router.post("/plans", response_model=PlanOut)
def save_plan(
    plan_in: PlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Saves an AI-generated study plan to the dashboard for the student.
    """
    new_plan = StudyPlan(
        user_id=current_user.id,
        plan_content=plan_in.plan_content
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan

@router.get("/plans", response_model=List[PlanOut])
def get_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves all saved study plans for the authenticated user.
    """
    plans = (
        db.query(StudyPlan)
        .filter(StudyPlan.user_id == current_user.id)
        .order_by(StudyPlan.created_at.desc())
        .all()
    )
    return plans
