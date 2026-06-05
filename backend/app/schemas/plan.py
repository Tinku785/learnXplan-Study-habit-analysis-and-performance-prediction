# backend/app/schemas/plan.py
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class PlanCreate(BaseModel):
    plan_content: str

class PlanOut(BaseModel):
    id: UUID
    user_id: UUID
    plan_content: str
    created_at: datetime

    class Config:
        from_attributes = True
