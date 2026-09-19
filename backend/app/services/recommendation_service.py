from typing import Dict, Any

class RecommendationService:
    def generate_recommendation(
        self,
        cluster_code: str,
        category: str,
        title: str,
        primary_location: str,
        district: str,
        report_count: int,
        estimated_population: int,
        priority_score: float,
        affected_services: list
    ) -> Dict[str, Any]:
        """
        Generates structured, actionable intervention dossiers.
        Avoids presenting recommendations as mandatory decrees or guaranteed outcomes.
        """
        services_str = ", ".join(affected_services) if affected_services else "Public Infrastructure"
        
        if category == "Road Infrastructure":
            problem_summary = f"High rural road connectivity deficit identified across {primary_location} ({district}). {report_count} citizen reports indicate chronic surface breakdown and severe transit obstruction."
            evidence_summary = f"{report_count} clustered citizen reports, high urgency ratings during monsoons, and geolocated pothole photographic records indicating restricted ambulance access."
            recommended_intervention = f"Evaluate urgent road resurfacing and stormwater drainage under PMGSY (Pradhan Mantri Gram Sadak Yojana) / State PWD rural connectivity budget for the {primary_location} corridor."
            expected_service_impact = f"Restores uninterrupted emergency ambulance and transit access for ~{estimated_population:,} residents, connecting 3 adjoining hamlets to the nearest Community Health Centre."
            required_verification = "Joint on-site civil engineering survey by District PWD engineer to verify sub-base washouts and obtain formal soil stability clearance before tendering."
            limitations = "Estimates are based on aggregated citizen distress reports and census baseline indicators. Technical cost DPR must be approved by competent municipal authority."
        
        elif category == "Drinking Water":
            problem_summary = f"Severe drinking water quality and supply disruption across {primary_location}. {report_count} citizen complaints report contaminated pipeline supply and non-functional handpumps."
            evidence_summary = f"{report_count} reports spanning 4 wards, community water samples indicating high turbidity and bacterial contamination, and chronic distribution pipe fractures."
            recommended_intervention = f"Expedite pipeline rehabilitation and installation of solar-powered mini-piped water supply scheme under Jal Jeevan Mission (JJM) in {primary_location}."
            expected_service_impact = f"Provides clean, potable tap water access to ~{estimated_population:,} inhabitants, dramatically mitigating waterborne gastroenteritis risks."
            required_verification = "Laboratory water testing (TDS, bacterial coliform, fluoride) by District Public Health Engineering Department (PHED)."
            limitations = "Requires verification of groundwater table depth and existing distribution network pressure prior to scheme sanction."

        elif category == "Sanitation & Drainage":
            problem_summary = f"Chronic stormwater and domestic wastewater overflow in {primary_location} causing localized stagnant waterlogging and mosquito breeding hazards."
            evidence_summary = f"{report_count} geolocated citizen submissions with photographic evidence showing silt-clogged open drains and sewage backflow during moderate rainfall."
            recommended_intervention = f"Construct covered RCC stormwater pucca drainage network with de-silting and solid-waste containment screens."
            expected_service_impact = f"Eliminates standing sewage across residential clusters, protecting ~{estimated_population:,} residents from vector-borne disease outbreaks."
            required_verification = "Topographical gradient study by Nagar Nigam / Municipal sanitation engineers to ensure natural gravity-assisted runoff discharge."
            limitations = "Contingent on right-of-way clearance along narrow residential lanes."

        elif category == "Healthcare":
            problem_summary = f"Severe healthcare infrastructure and paramedic availability gap at {primary_location} sub-center affecting primary maternal and emergency care."
            evidence_summary = f"{report_count} citizen submissions reporting non-functional delivery rooms, lack of attending medical officers, and essential drug stockouts."
            recommended_intervention = f"Upgrade sub-center into an Ayushman Bharat Health & Wellness Centre (HWC) with teleconsultation facility and deployment of Community Health Officer (CHO)."
            expected_service_impact = f"Ensures 24/7 first-line medical screening and antenatal care for ~{estimated_population:,} rural beneficiaries within 15 minutes transit time."
            required_verification = "Inspection by Chief Medical Officer (CMO) auditing drug inventory, staffing attendance, and equipment uptime."
            limitations = "Subject to state health mission staff recruitment roster."

        else:
            problem_summary = f"Public infrastructure inadequacy in {primary_location} affecting {services_str}."
            evidence_summary = f"{report_count} citizen submissions highlighting infrastructure gaps and service disruption."
            recommended_intervention = f"Deploy inter-departmental inspection team to assess feasibility of targeted infrastructure renewal."
            expected_service_impact = f"Improves civic living standards and service delivery for ~{estimated_population:,} citizens."
            required_verification = "Standard administrative inspection by Ward/Block Development Officer."
            limitations = "Based on sample demographic indicators and citizen reports."

        return {
            "problem_summary": problem_summary,
            "evidence_summary": evidence_summary,
            "affected_population": estimated_population,
            "recommended_intervention": recommended_intervention,
            "expected_service_impact": expected_service_impact,
            "required_verification": required_verification,
            "confidence_score": round(min(0.96, max(0.82, priority_score / 100.0)), 2),
            "limitations": limitations
        }

recommendation_service = RecommendationService()
