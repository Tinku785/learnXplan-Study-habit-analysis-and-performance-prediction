# backend/app/api/analytics.py
import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.prediction import WhatIfRequest
from app.services.ml_service import ml_service

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.post("/what-if")
def simulate_what_if(
    request: WhatIfRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Simulates model prediction outputs in real-time.
    Does not write to the database.
    """
    input_data = request.dict()
    prediction_result = ml_service.predict(input_data)
    return prediction_result

@router.get("/model-comparison")
def get_model_benchmarks(
    current_user: User = Depends(get_current_user)
):
    """
    Returns comparative evaluation metrics (R2, MAE, RMSE) 
    for Linear Regression, Random Forest, XGBoost, and LightGBM.
    """
    return ml_service.get_comparison_metrics()

@router.get("/aggregate", response_model=List[Dict[str, Any]])
def get_teacher_aggregate_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Aggregates student records for the teacher overview.
    Restricted to user with role 'teacher'.
    """
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Instructor permissions required."
        )
    
    # Query predictions join with users
    results = (
        db.query(Prediction, User.email, User.name)
        .join(User, Prediction.user_id == User.id)
        .order_by(Prediction.created_at.desc())
        .all()
    )
    
    response_list = []
    for pred, email, name in results:
        try:
            feat_imp = json.loads(pred.feature_importance)
        except Exception:
            feat_imp = {}
            
        try:
            recs = json.loads(pred.recommendations)
        except Exception:
            recs = []
            
        response_list.append({
            "id": pred.id,
            "user_id": pred.user_id,
            "email": email,
            "full_name": name,
            "predicted_score": pred.predicted_score,
            "confidence_score": pred.confidence_score,
            "risk_level": pred.risk_level,
            "feature_importance": feat_imp,
            "recommendations": recs,
            "created_at": pred.created_at
        })
        
    return response_list
