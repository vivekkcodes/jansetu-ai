from typing import Dict, Any

class DPGDataAdapter:
    """
    Digital Public Good (DPG) Data Adapter Layer.
    Normalizes heterogeneous district/state public datasets (Census, PMGSY, JJM, NHM)
    into standardized JanSetu AI demographic and infrastructure indices.
    """
    @staticmethod
    def normalize_census_record(raw: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "district": raw.get("District_Name") or raw.get("district", "Unknown"),
            "subdistrict": raw.get("Tehsil_Name") or raw.get("subdistrict", ""),
            "village_name": raw.get("Village_Name") or raw.get("village", "Unnamed Area"),
            "total_population": int(raw.get("TOT_P") or raw.get("total_population", 2500)),
            "households": int(raw.get("No_HH") or raw.get("households", 450)),
            "schools_count": int(raw.get("Schools") or raw.get("schools_count", 2)),
            "healthcare_facilities_count": int(raw.get("PHC_CHC") or raw.get("healthcare_facilities_count", 1)),
            "vulnerable_pct": float(raw.get("Vulnerable_Pct") or raw.get("vulnerable_pct", 28.0))
        }

    @staticmethod
    def normalize_infrastructure_record(raw: Dict[str, Any]) -> Dict[str, Any]:
        existing_index = float(raw.get("Index_Score") or raw.get("existing_infra_index", 50.0))
        return {
            "district": raw.get("District") or raw.get("district", "Unknown"),
            "category": raw.get("Sector") or raw.get("category", "General"),
            "existing_infra_index": existing_index,
            "access_index": float(raw.get("Access_Score") or raw.get("access_index", 50.0)),
            "reliability_index": float(raw.get("Reliability_Score") or raw.get("reliability_index", 50.0)),
            "gap_score": max(0.0, min(100.0, 100.0 - existing_index))
        }

dpg_adapter = DPGDataAdapter()
