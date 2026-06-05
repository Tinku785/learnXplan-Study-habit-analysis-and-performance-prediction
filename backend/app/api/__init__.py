# backend/app/api/__init__.py
from app.api.auth import router as auth_router
from app.api.questionnaire import router as questionnaire_router
from app.api.analytics import router as analytics_router
from app.api.coach import router as coach_router

__all__ = ["auth_router", "questionnaire_router", "analytics_router", "coach_router"]
