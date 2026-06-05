# ml_engine/generate_synthetic_data.py
import os
import numpy as np
import pandas as pd

def generate_data(num_samples: int = 500, seed: int = 42):
    np.random.seed(seed)
    
    # Generate numerical features
    attendance = np.random.normal(loc=83.0, scale=10.0, size=num_samples)
    attendance = np.clip(attendance, 40.0, 100.0)
    
    study_hours = np.random.gamma(shape=3.0, scale=4.0, size=num_samples) # Mean ~12 hrs
    study_hours = np.clip(study_hours, 1.0, 40.0)
    
    sleep_hours = np.random.normal(loc=7.0, scale=1.0, size=num_samples)
    sleep_hours = np.clip(sleep_hours, 4.0, 10.0)
    
    screen_time = np.random.normal(loc=4.0, scale=1.8, size=num_samples)
    screen_time = np.clip(screen_time, 0.5, 12.0)
    
    physical_activity = np.random.gamma(shape=2.0, scale=2.5, size=num_samples) # Mean ~5 hrs
    physical_activity = np.clip(physical_activity, 0.0, 20.0)
    
    study_consistency = np.random.beta(a=5, b=3, size=num_samples) # Mostly high-medium (0.0 to 1.0)
    
    # Generate categorical features
    categories_3 = ["Low", "Medium", "High"]
    
    parental_involvement = np.random.choice(categories_3, size=num_samples, p=[0.20, 0.55, 0.25])
    access_to_resources = np.random.choice(categories_3, size=num_samples, p=[0.15, 0.60, 0.25])
    family_income = np.random.choice(categories_3, size=num_samples, p=[0.25, 0.50, 0.25])
    motivation_level = np.random.choice(categories_3, size=num_samples, p=[0.15, 0.55, 0.30])
    
    # Generate boolean features
    internet_access = np.random.choice([False, True], size=num_samples, p=[0.12, 0.88])
    extracurricular = np.random.choice([False, True], size=num_samples, p=[0.45, 0.55])
    
    # Combine into DataFrame
    df = pd.DataFrame({
        "study_hours_per_week": study_hours,
        "attendance_rate": attendance,
        "sleep_hours_per_day": sleep_hours,
        "screen_time_per_day": screen_time,
        "physical_activity_hours_per_week": physical_activity,
        "study_consistency": study_consistency,
        "parental_involvement": parental_involvement,
        "access_to_resources": access_to_resources,
        "family_income": family_income,
        "motivation_level": motivation_level,
        "internet_access": internet_access,
        "extracurricular": extracurricular
    })
    
    # Heuristic target: continuous exam score (30 - 100)
    # Define custom scores based on variables
    base_score = 55.0
    
    # Continuous impacts
    score = (
        base_score +
        (df["attendance_rate"] - 80.0) * 0.4 +               # Max +8, Min -16
        (df["study_hours_per_week"] - 12.0) * 0.6 +          # Max +16.8, Min -6.6
        (df["sleep_hours_per_day"] - 7.0) * 1.5 +            # Max +4.5, Min -4.5
        (4.0 - df["screen_time_per_day"]) * 1.0 +            # Max +3.5, Min -8.0
        (df["physical_activity_hours_per_week"] - 5.0) * 0.3 + # Max +4.5, Min -1.5
        (df["study_consistency"] - 0.6) * 10.0               # Max +4.0, Min -6.0
    )
    
    # Categorical impacts
    score += df["parental_involvement"].map({"High": 4.5, "Medium": 0.0, "Low": -4.5})
    score += df["access_to_resources"].map({"High": 5.0, "Medium": 0.0, "Low": -5.0})
    score += df["family_income"].map({"High": 3.0, "Medium": 0.0, "Low": -3.0})
    score += df["motivation_level"].map({"High": 5.0, "Medium": 0.0, "Low": -5.0})
    
    # Boolean impacts
    score += df["internet_access"].astype(int) * 3.5
    score += df["extracurricular"].astype(int) * 1.5
    
    # Apply noise
    noise = np.random.normal(loc=0.0, scale=3.5, size=num_samples)
    final_score = score + noise
    
    # Clip exam score to a valid percentage range (30 to 100)
    df["exam_score"] = np.clip(final_score, 30.0, 100.0)
    
    # Write output
    os.makedirs("data/raw", exist_ok=True)
    output_path = "data/raw/synthetic_students.csv"
    df.to_csv(output_path, index=False)
    print(f"Generated {num_samples} expanded samples at: {output_path}")

if __name__ == "__main__":
    generate_data()
