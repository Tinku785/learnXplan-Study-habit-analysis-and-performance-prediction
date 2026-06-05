# backend/app/services/llm_service.py
import google.generativeai as genai
from app.config import settings

class LLMService:
    def __init__(self):
        self.api_configured = False
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key-here":
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.api_configured = True
                print("Gemini AI API configured successfully.")
            except Exception as e:
                print(f"Error initializing Gemini API: {e}. Fallback active.")
        else:
            print("Gemini API Key missing or default placeholder. Using rules-engine coach advice.")

    def generate_coach_response(self, prompt: str, student_profile: dict = None, prediction: dict = None) -> str:
        """
        Generates personalized guidance from an AI Educational Coach.
        Fuses predictions, SHAP attributes, and user questions.
        """
        if self.api_configured:
            try:
                # Structure detailed prompt containing current performance matrices
                system_context = (
                    "You are 'LearnXPlan AI Coach', a professional academic advisor and counselor.\n"
                    "You provide motivational, scientific, and realistic study advice.\n"
                )
                
                if student_profile and prediction:
                    recs_str = ", ".join([
                        f"improve {r.get('feature').replace('_', ' ')} from {r.get('current')} to {r.get('recommended')} (+{r.get('impact')} marks predicted)"
                        for r in prediction.get("recommendations", [])
                    ])
                    system_context += (
                        f"Student Current Metrics:\n"
                        f"- Predicted Exam Grade: {prediction.get('predicted_score')}/100\n"
                        f"- Confidence Interval: {prediction.get('confidence_score') * 100}%\n"
                        f"- Class Risk Level: {prediction.get('risk_level')}\n"
                        f"- Study Hours: {student_profile.get('study_hours_per_week')} hrs/week\n"
                        f"- Class Attendance: {student_profile.get('attendance_rate')}%\n"
                        f"- Sleep Duration: {student_profile.get('sleep_hours_per_day')} hrs/day\n"
                        f"- Key Recommendations: {recs_str}\n"
                    )
                
                model = genai.GenerativeModel('gemini-2.5-flash')
                full_prompt = (
                    f"{system_context}\n"
                    f"Student Query: '{prompt}'\n"
                    f"Formulate a friendly, encouraging, and detailed response offering clear action points:"
                )
                
                response = model.generate_content(full_prompt)
                return response.text
            except Exception as e:
                print(f"Gemini API execution error: {e}. Defaulting to rule fallback advice.")

        # Heuristic rules-engine coach
        score = prediction.get("predicted_score", 75.0) if prediction else 75.0
        risk = prediction.get("risk_level", "Medium") if prediction else "Medium"
        recs = prediction.get("recommendations", []) if prediction else []

        recs_html_list = []
        for r in recs:
            feat = r['feature'].replace('_', ' ').capitalize()
            recs_html_list.append(f"- **{feat}**: Adjust from {r['current']} to {r['recommended']} (Estimated gain: **+{r['impact']} marks**)")

        recs_str = "\n".join(recs_html_list) if recs_html_list else "- Adjust your weekly study hours and sleep patterns to maintain peak performance."

        return (
            f"Hello! I am your LearnXPlan AI Coach. (Currently running in offline demo mode).\n\n"
            f"Based on your profile, your predicted exam score is **{score}/100** ({risk} Risk Category).\n\n"
            f"Here are the most impactful adjustments you can make to your schedule right now to raise your expected marks:\n"
            f"{recs_str}\n\n"
            f"Implementing these changes will increase your study efficiency. Would you like me to create a customized study timetable for you?"
        )

llm_service = LLMService()
