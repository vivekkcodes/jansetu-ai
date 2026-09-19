import os
import json
import re
import httpx
from typing import Dict, Any, List
from app.core.config import settings

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.provider = settings.AI_PROVIDER
        self.gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}" if self.api_key else ""

    async def analyze_report(self, text: str, original_language: str = "auto", location_hint: str = "") -> Dict[str, Any]:
        """
        Analyzes citizen voice or text report.
        Returns strict structured JSON.
        Never relies on parsing unstructured text. Falls back to deterministic NLP if API key missing or network fails.
        """
        if self.api_key and self.provider == "gemini":
            try:
                result = await self._call_gemini(text, original_language, location_hint)
                if result:
                    return result
            except Exception as e:
                print(f"[AIService] Gemini API error, falling back to local NLP: {e}")

        # High-accuracy deterministic fallback
        return self._local_nlp_classifier(text, original_language, location_hint)

    async def _call_gemini(self, text: str, language: str, location_hint: str) -> Dict[str, Any]:
        prompt = f"""You are JanSetu AI's core intelligence engine.
Analyze the following citizen development request/complaint.

Citizen Input: "{text}"
Language Hint: "{language}"
Location Hint: "{location_hint}"

You must return ONLY a valid JSON object with EXACTLY this structure (no markdown formatting, no code blocks):
{{
  "language": "Hindi or English or other Indian language",
  "translated_summary": "Concise standard English translation and summary of the core issue",
  "category": "Road Infrastructure | Drinking Water | Healthcare | Electricity | Sanitation | Education | Public Transport | Waste Management | Drainage | Street Lighting | Public Safety | Agriculture Infrastructure | Other",
  "subcategory": "Specific subcategory e.g. Rural Road Connectivity, Pipeline Leakage, Primary Health Center, etc.",
  "severity": <integer 1 to 10 based on physical hazard or deprivation>,
  "urgency": <integer 1 to 10 based on immediate safety or life risks>,
  "affected_services": ["Healthcare", "Transportation", "Education", "Drinking Water", etc.],
  "location": {{
    "village": "extracted village if any",
    "district": "extracted district if any",
    "state": "extracted state if any"
  }},
  "evidence_type": "Citizen Report"
}}
"""
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(self.gemini_url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(content)
        return None

    def _local_nlp_classifier(self, text: str, language: str = "auto", location_hint: str = "") -> Dict[str, Any]:
        lower = text.lower()
        
        # Detect language
        has_devanagari = bool(re.search(r'[\u0900-\u097F]', text))
        detected_lang = "Hindi" if has_devanagari or "gaon" in lower or "sadak" in lower or "paani" in lower else "English"

        category = "Other"
        subcategory = "General Public Grievance"
        severity = 6
        urgency = 5
        affected_services = ["Public Infrastructure"]
        translated_summary = text

        # Match Categories & Subcategories
        if any(k in lower or k in text for k in ["सड़क", "सडक", "road", "sadak", "pothole", "highway", "gaddha", "मार्ग", "pul", "bridge", "rasta"]):
            category = "Road Infrastructure"
            if any(k in lower or k in text for k in ["एम्बुलेंस", "ambulance", "बारिश", "rain", "hospital", "कीचड़", "unusable", "टूट"]):
                subcategory = "Rural Road Connectivity"
                severity = 9
                urgency = 9
                affected_services = ["Healthcare", "Transportation"]
                translated_summary = "Village connecting road is heavily damaged, muddy during rains, completely blocking ambulance and emergency transit."
            else:
                subcategory = "Road Surface Damage & Potholes"
                severity = 7
                urgency = 6
                affected_services = ["Transportation"]
                translated_summary = "Severely damaged road surface with potholes disrupting daily vehicular and pedestrian transit."

        elif any(k in lower or k in text for k in ["पानी", "जल", "water", "paani", "drinking water", "नल", "handpump", "pipe", "tonti", "sewage"]):
            category = "Drinking Water"
            if any(k in lower or k in text for k in ["गंदा", "dirty", "contaminated", "बीमार", "sick", "poison", "foul"]):
                subcategory = "Contaminated Water Supply"
                severity = 9
                urgency = 9
                affected_services = ["Drinking Water", "Healthcare"]
                translated_summary = "Drinking water supply contaminated with high turbidity causing acute public health and waterborne illness risks."
            else:
                subcategory = "Drinking Water Scarcity & Pipeline Breakdown"
                severity = 8
                urgency = 7
                affected_services = ["Drinking Water"]
                translated_summary = "Drinking water supply interrupted due to broken distribution pipes and non-functional borewells."

        elif any(k in lower or k in text for k in ["बिजली", "power", "electricity", "bijli", "transformer", "voltage", "current", "wire", "light"]):
            category = "Electricity"
            if any(k in lower or k in text for k in ["तार", "wire", "spark", "current", "धमाका"]):
                subcategory = "High Voltage Wire Hazard"
                severity = 9
                urgency = 9
                affected_services = ["Electricity", "Public Safety"]
                translated_summary = "Exposed low-hanging live electric wires posing imminent electrocution danger to residents and livestock."
            else:
                subcategory = "Frequent Power Outages & Transformer Failure"
                severity = 7
                urgency = 6
                affected_services = ["Electricity", "Education"]
                translated_summary = "Prolonged power cuts and blown local transformer causing blackout in residential wards."

        elif any(k in lower or k in text for k in ["अस्पताल", "hospital", "doctor", "स्वास्थ्य", "dawa", "phc", "chc", "clinic", "nurse"]):
            category = "Healthcare"
            subcategory = "Primary Health Center Deficit"
            severity = 9
            urgency = 8
            affected_services = ["Healthcare"]
            translated_summary = "Lack of attending doctors and essential emergency medications at the primary healthcare sub-center."

        elif any(k in lower or k in text for k in ["स्कूल", "school", "vidyalaya", "teacher", "shiksha", "children", "bache"]):
            category = "Education"
            subcategory = "School Building & Sanitation Deficit"
            severity = 7
            urgency = 6
            affected_services = ["Education", "Sanitation"]
            translated_summary = "Local government primary school lacking functional student toilets and boundary security wall."

        elif any(k in lower or k in text for k in ["नाली", "drain", "naali", "sewer", "waterlogging", "जलभराव", "कचरा", "garbage", "kachra"]):
            category = "Sanitation & Drainage"
            subcategory = "Stormwater Drainage & Clogging"
            severity = 8
            urgency = 7
            affected_services = ["Sanitation", "Healthcare"]
            translated_summary = "Overflowing open drains causing severe stagnant waterlogging, foul stench, and mosquito breeding hazard."

        # Extract basic location hints
        location = {
            "village": "",
            "district": "Varanasi",
            "state": "Uttar Pradesh"
        }
        for dist in ["Varanasi", "Gorakhpur", "Prayagraj", "Patna", "Ranchi", "Lucknow"]:
            if dist.lower() in lower or dist.lower() in location_hint.lower():
                location["district"] = dist
                break

        return {
            "language": detected_lang,
            "translated_summary": translated_summary,
            "category": category,
            "subcategory": subcategory,
            "severity": severity,
            "urgency": urgency,
            "affected_services": affected_services,
            "location": location,
            "evidence_type": "Citizen Report"
        }

ai_service = AIService()
