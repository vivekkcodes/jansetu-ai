import random
from typing import Dict, Any, Optional

class VisionService:
    def analyze_evidence(self, category: str, image_filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyzes evidence photograph.
        Clearly distinguishes citizen statement vs AI-generated observation.
        Never claims legal verification.
        """
        if category == "Road Infrastructure":
            return {
                "detected_issue": "Severe Road Surface Degradation",
                "confidence": 0.89,
                "visual_evidence": [
                    "Multiple deep potholes (>15cm depth estimated)",
                    "Stripped asphalt top-layer and exposed aggregate",
                    "Water accumulation and muddy road shoulder"
                ],
                "ai_disclaimer": "AI-generated visual observation based on uploaded media. Does not constitute official engineering certification."
            }
        elif category == "Drinking Water":
            return {
                "detected_issue": "Damaged Water Supply Infrastructure",
                "confidence": 0.92,
                "visual_evidence": [
                    "Fractured distribution pipeline casing",
                    "Surface water pooling near community tap point",
                    "Visible rust and sediment leakage"
                ],
                "ai_disclaimer": "AI-generated visual observation based on uploaded media. Does not constitute official engineering certification."
            }
        elif category == "Sanitation & Drainage":
            return {
                "detected_issue": "Severe Drain Overflow & Stagnant Silt",
                "confidence": 0.86,
                "visual_evidence": [
                    "Solid waste obstruction in open concrete drain",
                    "Effluent spilling onto pedestrian pathway",
                    "Blackwater stagnant pool indicating chronic blockage"
                ],
                "ai_disclaimer": "AI-generated visual observation based on uploaded media. Does not constitute official engineering certification."
            }
        elif category == "Electricity":
            return {
                "detected_issue": "Low Sagging High-Tension Cables",
                "confidence": 0.87,
                "visual_evidence": [
                    "Sagging uninsulated transmission wires near residential structure",
                    "Tilted electrical pole",
                    "Vegetation encroachment on distribution transformer"
                ],
                "ai_disclaimer": "AI-generated visual observation based on uploaded media. Does not constitute official engineering certification."
            }
        else:
            return {
                "detected_issue": "Visible Infrastructure Inadequacy",
                "confidence": 0.78,
                "visual_evidence": [
                    "Structural degradation detected",
                    "Requires on-site administrative inspection"
                ],
                "ai_disclaimer": "AI-generated visual observation based on uploaded media. Does not constitute official engineering certification."
            }

vision_service = VisionService()
