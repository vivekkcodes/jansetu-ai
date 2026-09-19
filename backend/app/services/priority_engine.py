from typing import Dict, Any, List, Tuple
from app.core.config import settings

class PriorityEngine:
    def __init__(self):
        self.weights = dict(settings.DEFAULT_WEIGHTS)

    def get_weights(self) -> Dict[str, float]:
        return dict(self.weights)

    def update_weights(self, new_weights: Dict[str, float]) -> Dict[str, float]:
        total = sum(new_weights.values())
        if total <= 0:
            raise ValueError("Total weights sum must be greater than zero")
        # Normalize weights so they sum to 1.0
        normalized = {k: v / total for k, v in new_weights.items()}
        self.weights = normalized
        return self.weights

    def calculate_cluster_priority(
        self,
        report_count: int,
        estimated_population: int,
        infra_existing_index: float,
        avg_severity: float,
        affected_services: List[str],
        avg_urgency: float,
        cluster_radius_km: float = 2.0
    ) -> Tuple[float, Dict[str, float], List[str]]:
        """
        Calculates transparent priority score (0-100) and explainability checklist.
        """
        # 1. Citizen Demand (0-100)
        # 1 report -> ~15, 100 reports -> ~65, 500+ reports -> 90-100
        import math
        demand_score = min(100.0, max(10.0, 20.0 * math.log10(max(1, report_count)) + 35.0))
        if report_count >= 500:
            demand_score = min(100.0, 90.0 + (report_count - 500) * 0.02)

        # 2. Population Impact (0-100)
        # Based on local demographic estimates (e.g. 500 to 20,000 people)
        pop_score = min(100.0, max(15.0, (estimated_population / 10000.0) * 100.0))

        # 3. Infrastructure Gap (0-100)
        # Gap = 100 - Existing Infrastructure Index
        infra_gap_score = max(0.0, min(100.0, 100.0 - infra_existing_index))

        # 4. Severity (0-100)
        # Scaled from 1-10 to 0-100
        severity_score = min(100.0, max(0.0, avg_severity * 10.0))

        # 5. Critical Service Impact (0-100)
        # Multiplier if Healthcare, Drinking Water, or Education are affected
        critical_multiplier = 40.0
        if "Healthcare" in affected_services:
            critical_multiplier += 35.0
        if "Drinking Water" in affected_services:
            critical_multiplier += 20.0
        if "Education" in affected_services:
            critical_multiplier += 15.0
        critical_service_score = min(100.0, critical_multiplier)

        # 6. Urgency (0-100)
        urgency_score = min(100.0, max(0.0, avg_urgency * 10.0))

        w = self.weights
        final_score = (
            w.get("citizen_demand", 0.30) * demand_score +
            w.get("population_impact", 0.20) * pop_score +
            w.get("infrastructure_gap", 0.20) * infra_gap_score +
            w.get("severity", 0.15) * severity_score +
            w.get("critical_service", 0.10) * critical_service_score +
            w.get("urgency", 0.05) * urgency_score
        )
        final_score = round(min(100.0, max(0.0, final_score)), 1)

        breakdown = {
            "citizen_demand_score": round(demand_score, 1),
            "population_impact_score": round(pop_score, 1),
            "infrastructure_gap_score": round(infra_gap_score, 1),
            "severity_score": round(severity_score, 1),
            "critical_service_score": round(critical_service_score, 1),
            "urgency_score": round(urgency_score, 1),
            "final_score": final_score
        }

        # Generate Explainability Checklist ("Why this is prioritized")
        why_list = []
        if report_count >= 50:
            why_list.append(f"{report_count} aggregated citizen reports indicate widespread community distress")
        elif report_count >= 10:
            why_list.append(f"{report_count} clustered citizen reports confirm a localized chronic issue")
        else:
            why_list.append(f"{report_count} preliminary verified reports")

        if severity_score >= 80:
            why_list.append("High physical hazard and severe infrastructure degradation")
        if pop_score >= 70:
            why_list.append(f"Large estimated beneficiary population (~{estimated_population:,} residents)")
        if "Healthcare" in affected_services:
            why_list.append("Emergency healthcare access and ambulance transit directly compromised")
        if "Drinking Water" in affected_services:
            why_list.append("Critical drinking water quality and supply continuity at risk")
        if infra_gap_score >= 60:
            why_list.append(f"Severe infrastructure gap index ({infra_gap_score:.0f}/100) compared to district standard")
        if cluster_radius_km <= 3.0:
            why_list.append("High geographic density hotspot detected via spatial clustering")

        return final_score, breakdown, why_list

priority_engine = PriorityEngine()
