# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app.models.user import User
from app.models.plan import StudyPlan
from app.config import settings
from app.api import auth_router, questionnaire_router, analytics_router, coach_router

# Bind metadata to create PostgreSQL tables in Neon on application start
Base.metadata.create_all(bind=engine)

# Initialize FastAPI application
app = FastAPI(
    title="LearnXPlan AI Platform API",
    description="AI-powered Educational Success Forecasting and Explanations Backend",
    version="2.0.0"
)

# Set up CORS middleware to support connections from React/Next.js frontend
origins = []
if isinstance(settings.CORS_ORIGINS, list):
    origins = [str(origin) for origin in settings.CORS_ORIGINS]
else:
    origins = [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all endpoint routers
app.include_router(auth_router, prefix="/api")
app.include_router(questionnaire_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(coach_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "success", 
        "message": "Welcome to the LearnXPlan AI Platform API",
        "documentation": "/docs"
    }

# Test Connection Route (Preserved from user changes)
@app.post("/test-db-connection")
def test_db(name: str, email: str, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            return {
                "message": "User already exists!", 
                "user": {"name": existing_user.name, "email": existing_user.email}
            }
        
        # Test insertions into PostgreSQL
        new_user = User(name=name, email=email, role="student", hashed_password="test-password-hash")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {
            "database_status": "connected successfully",
            "inserted_user": {
                "id": str(new_user.id),
                "name": new_user.name,
                "email": new_user.email
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")