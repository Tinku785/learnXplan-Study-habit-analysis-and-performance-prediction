# backend/app/api/questionnaire.py
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.response import QuestionnaireResponse
from app.models.prediction import Prediction
from app.schemas.response import ResponseCreate, ResponseOut
from app.schemas.prediction import PredictionOut
from app.services.ml_service import ml_service

router = APIRouter(prefix="/questionnaire", tags=["questionnaire"])

@router.post("/submit", response_model=PredictionOut)
def submit_response(
    response_in: ResponseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Save the expanded questionnaire response to PostgreSQL
    db_response = QuestionnaireResponse(
        user_id=current_user.id,
        study_hours_per_week=response_in.study_hours_per_week,
        attendance_rate=response_in.attendance_rate,
        sleep_hours_per_day=response_in.sleep_hours_per_day,
        screen_time_per_day=response_in.screen_time_per_day,
        physical_activity_hours_per_week=response_in.physical_activity_hours_per_week,
        study_consistency=response_in.study_consistency,
        parental_involvement=response_in.parental_involvement,
        access_to_resources=response_in.access_to_resources,
        family_income=response_in.family_income,
        motivation_level=response_in.motivation_level,
        internet_access=response_in.internet_access,
        extracurricular=response_in.extracurricular
    )
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    
    # Run predictions and explainability analyses using ml_service
    prediction_input = response_in.dict()
    prediction_result = ml_service.predict(prediction_input)
    
    # Serialize SHAP and Recommendations lists to JSON strings
    feature_importance_json = json.dumps(prediction_result["feature_importance"])
    recommendations_json = json.dumps(prediction_result["recommendations"])
    
    # Save prediction audit log
    db_prediction = Prediction(
        user_id=current_user.id,
        response_id=db_response.id,
        predicted_score=prediction_result["predicted_score"],
        confidence_score=prediction_result["confidence_score"],
        risk_level=prediction_result["risk_level"],
        feature_importance=feature_importance_json,
        recommendations=recommendations_json
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    
    # Unpack for returning schema output
    return PredictionOut(
        id=db_prediction.id,
        user_id=db_prediction.user_id,
        response_id=db_prediction.response_id,
        predicted_score=db_prediction.predicted_score,
        confidence_score=db_prediction.confidence_score,
        risk_level=db_prediction.risk_level,
        feature_importance=prediction_result["feature_importance"],
        recommendations=prediction_result["recommendations"],
        created_at=db_prediction.created_at
    )

@router.get("/latest", response_model=ResponseOut)
def get_latest_response(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    response = (
        db.query(QuestionnaireResponse)
        .filter(QuestionnaireResponse.user_id == current_user.id)
        .order_by(QuestionnaireResponse.created_at.desc())
        .first()
    )
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No questionnaire responses found for this student."
        )
    return response
