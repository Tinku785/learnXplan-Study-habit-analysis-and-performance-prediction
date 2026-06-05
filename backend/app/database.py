# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Create engine. Neon requires SSL. Set pool recycle & pre-ping to prevent connection drops.
engine = create_engine(
    settings.DATABASE_URL,
    pool_recycle=300,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to yield a database session per API request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()