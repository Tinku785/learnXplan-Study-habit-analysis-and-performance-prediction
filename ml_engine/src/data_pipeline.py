# ml_engine/src/data_pipeline.py
import os
import pandas as pd
import joblib
from sklearn.preprocessing import OrdinalEncoder

import numpy as np

def preprocess_pipeline(raw_data_path: str, output_dir: str = "data/processed", save_encoder_path: str = "models/baseline_encoder.joblib"):
    """
    Loads raw TSV, maps columns to expected schema, generates missing features, 
    fits OrdinalEncoder on categorical features, and exports processed data.
    """
    # Use sep='\t' since the new data is tab-separated
    df = pd.read_csv(raw_data_path, sep="\t")
    
    # Rename columns to match expected schema
    df.rename(columns={
        "Hours_Studied": "study_hours_per_week",
        "Attendance": "attendance_rate",
        "Sleep_Hours": "sleep_hours_per_day",
        "Physical_Activity": "physical_activity_hours_per_week",
        "Parental_Involvement": "parental_involvement",
        "Access_to_Resources": "access_to_resources",
        "Family_Income": "family_income",
        "Motivation_Level": "motivation_level",
        "Internet_Access": "internet_access",
        "Extracurricular_Activities": "extracurricular",
        "Exam_Score": "exam_score"
    }, inplace=True)
    
    # Generate missing required features using random reasonable distributions
    np.random.seed(42)
    df['screen_time_per_day'] = np.random.uniform(1.0, 6.0, len(df))
    df['study_consistency'] = np.random.uniform(0.3, 0.9, len(df))
    
    # Convert Yes/No string to boolean 1/0
    df["internet_access"] = df["internet_access"].map({"Yes": 1, "No": 0}).fillna(0).astype(int)
    df["extracurricular"] = df["extracurricular"].map({"Yes": 1, "No": 0}).fillna(0).astype(int)
    
    # Select only required columns in a specific order
    expected_cols = [
        "study_hours_per_week", "attendance_rate", "sleep_hours_per_day", 
        "screen_time_per_day", "physical_activity_hours_per_week", "study_consistency",
        "parental_involvement", "access_to_resources", "family_income", 
        "motivation_level", "internet_access", "extracurricular", "exam_score"
    ]
    df = df[expected_cols]
    
    # Categorical fields
    categorical_cols = ["parental_involvement", "access_to_resources", "family_income", "motivation_level"]
    categories = [
        ["Low", "Medium", "High"],
        ["Low", "Medium", "High"],
        ["Low", "Medium", "High"],
        ["Low", "Medium", "High"]
    ]
    
    # Initialize and fit OrdinalEncoder
    encoder = OrdinalEncoder(categories=categories)
    df[categorical_cols] = encoder.fit_transform(df[categorical_cols])
    
    # Save the processed output
    os.makedirs(output_dir, exist_ok=True)
    processed_path = os.path.join(output_dir, "processed_features.csv")
    df.to_csv(processed_path, index=False)
    
    # Ensure models directory exists
    os.makedirs(os.path.dirname(save_encoder_path), exist_ok=True)
    joblib.dump(encoder, save_encoder_path)
    
    print(f"Preprocessed features saved to: {processed_path}")
    print(f"Fitted encoder saved to: {save_encoder_path}")
    
    return df, encoder

if __name__ == "__main__":
    raw_path = "data/raw/synthetic_students.csv"
    if os.path.exists(raw_path):
        preprocess_pipeline(raw_path)
    else:
        print(f"Raw data file not found at {raw_path}. Run generate_synthetic_data.py first.")
