import os
import sys
import random
import uuid
from datetime import datetime, timedelta

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.core.database import SessionLocal, engine, Base
from app.models.models import (
    Location, CitizenReport, IssueCluster, PriorityScore,
    PopulationData, InfrastructureData, Recommendation,
    Project, ProjectUpdate, ImpactMeasurement
)
from app.services.priority_engine import priority_engine
from app.services.recommendation_service import recommendation_service

def seed_database():
    print('[Seed] Initializing database schema...')
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print('[Seed] Creating districts, demographics, and infrastructure benchmarks...')
        
        districts_info = [
            {
                'name': 'Varanasi',
                'state': 'Uttar Pradesh',
                'lat': 25.3176,
                'lng': 82.9739,
                'villages': ['Cholapur', 'Pindra', 'Harahua', 'Sewapuri', 'Arajiline', 'Kashi Cantt', 'Rajnatalab']
            },
            {
                'name': 'Gorakhpur',
                'state': 'Uttar Pradesh',
                'lat': 26.7606,
                'lng': 83.3732,
                'villages': ['Pipraich', 'Sahjanwa', 'Campierganj', 'Bansgaon', 'Gola', 'Khorabar']
            },
            {
                'name': 'Prayagraj',
                'state': 'Uttar Pradesh',
                'lat': 25.4358,
                'lng': 81.8463,
                'villages': ['Karchhana', 'Phulpur', 'Soraon', 'Mauaima', 'Meja', 'Shankargarh']
            },
            {
                'name': 'Patna',
                'state': 'Bihar',
                'lat': 25.5941,
                'lng': 85.1376,
                'villages': ['Danapur', 'Phulwari Sharif', 'Fatuha', 'Bakhtiarpur', 'Bihta', 'Maner']
            },
            {
                'name': 'Ranchi',
                'state': 'Jharkhand',
                'lat': 23.3441,
                'lng': 85.3096,
                'villages': ['Kanke', 'Ratu', 'Namkum', 'Ormanjhi', 'Nagri', 'Bero']
            }
        ]

        # Seed Demographics & Infrastructure Baselines
        for dist in districts_info:
            for v in dist['villages']:
                pop = random.randint(3500, 14000)
                db.add(PopulationData(
                    district=dist['name'],
                    subdistrict=f"{v} Tehsil",
                    village_name=v,
                    total_population=pop,
                    households=int(pop / 5.2),
                    schools_count=random.randint(2, 6),
                    healthcare_facilities_count=random.randint(1, 3),
                    vulnerable_pct=round(random.uniform(22.0, 38.0), 1)
                ))

            # Infrastructure benchmarks
            db.add(InfrastructureData(district=dist['name'], category='Road Infrastructure', existing_infra_index=42.0, access_index=45.0, reliability_index=40.0, gap_score=58.0))
            db.add(InfrastructureData(district=dist['name'], category='Drinking Water', existing_infra_index=38.0, access_index=36.0, reliability_index=41.0, gap_score=62.0))
            db.add(InfrastructureData(district=dist['name'], category='Healthcare', existing_infra_index=44.0, access_index=42.0, reliability_index=45.0, gap_score=56.0))
            db.add(InfrastructureData(district=dist['name'], category='Sanitation & Drainage', existing_infra_index=35.0, access_index=33.0, reliability_index=38.0, gap_score=65.0))
            db.add(InfrastructureData(district=dist['name'], category='Electricity', existing_infra_index=65.0, access_index=68.0, reliability_index=62.0, gap_score=35.0))

        db.commit()

        print('[Seed] Creating core development hotspots & clusters...')

        # Flagship Hotspot 1: RD-2048 (Road Infrastructure in Varanasi East / Cholapur)
        c1 = IssueCluster(
            cluster_code='RD-2048',
            category='Road Infrastructure',
            subcategory='Rural Road Connectivity',
            title='Rural Road Connectivity & Emergency Access Gap in Cholapur Corridor',
            primary_location='Cholapur-Harahua Rural Corridor',
            district='Varanasi',
            state='Uttar Pradesh',
            center_lat=25.3850,
            center_lng=83.0210,
            report_count=647,
            estimated_population=8420,
            severity_score=91.0,
            priority_score=92.4,
            priority_level='CRITICAL',
            status='Active',
            affected_services=['Healthcare', 'Transportation'],
            why_prioritized=[
                '647 related citizen reports indicate acute community distress',
                'High physical hazard: ambulance and emergency transit blocked during monsoons',
                'Large affected rural population (~8,420 residents across 4 hamlets)',
                'Emergency healthcare access and PHC connectivity severely impaired',
                'Significant infrastructure gap (58.0/100) vs PMGSY all-weather road target',
                'Geographic concentration: dense spatial hotspot verified along 4.2 km corridor'
            ]
        )
        db.add(c1)
        db.flush()

        ps1 = PriorityScore(
            cluster_id=c1.id,
            citizen_demand_score=94.2,
            population_impact_score=87.5,
            infrastructure_gap_score=91.0,
            severity_score=91.0,
            critical_service_score=95.0,
            urgency_score=92.0,
            final_score=92.4,
            formula_version='v1.0 (Prototype Prioritization Model)',
            weights_snapshot=priority_engine.get_weights()
        )
        db.add(ps1)

        rec1_data = recommendation_service.generate_recommendation(
            cluster_code=c1.cluster_code,
            category=c1.category,
            title=c1.title,
            primary_location=c1.primary_location,
            district=c1.district,
            report_count=c1.report_count,
            estimated_population=c1.estimated_population,
            priority_score=c1.priority_score,
            affected_services=c1.affected_services
        )
        rec1 = Recommendation(cluster_id=c1.id, **rec1_data)
        db.add(rec1)

        # Flagship Hotspot 2: WT-1102 (Drinking Water Contamination in Gorakhpur Pipraich)
        c2 = IssueCluster(
            cluster_code='WT-1102',
            category='Drinking Water',
            subcategory='Contaminated Pipeline Supply',
            title='Arsenic & Sewage Infiltration in Pipraich Drinking Water Line',
            primary_location='Pipraich Ward 3 & 4',
            district='Gorakhpur',
            state='Uttar Pradesh',
            center_lat=26.8310,
            center_lng=83.5240,
            report_count=423,
            estimated_population=6150,
            severity_score=89.0,
            priority_score=87.8,
            priority_level='CRITICAL',
            status='Under Review',
            affected_services=['Drinking Water', 'Healthcare'],
            why_prioritized=[
                '423 clustered citizen complaints reporting contaminated brown tap water',
                'High health hazard: elevated incidences of waterborne gastroenteritis among children',
                'Severe drinking water gap index (62.0/100)',
                'Over 6,100 vulnerable residents dependent on single breached distribution line'
            ]
        )
        db.add(c2)
        db.flush()

        ps2 = PriorityScore(
            cluster_id=c2.id,
            citizen_demand_score=88.5,
            population_impact_score=82.0,
            infrastructure_gap_score=92.0,
            severity_score=89.0,
            critical_service_score=95.0,
            urgency_score=86.0,
            final_score=87.8,
            formula_version='v1.0 (Prototype Prioritization Model)',
            weights_snapshot=priority_engine.get_weights()
        )
        db.add(ps2)
        rec2_data = recommendation_service.generate_recommendation(
            cluster_code=c2.cluster_code, category=c2.category, title=c2.title,
            primary_location=c2.primary_location, district=c2.district,
            report_count=c2.report_count, estimated_population=c2.estimated_population,
            priority_score=c2.priority_score, affected_services=c2.affected_services
        )
        db.add(Recommendation(cluster_id=c2.id, **rec2_data))

        # Flagship Hotspot 3: HC-3015 (Healthcare Deficit in Prayagraj Karchhana)
        c3 = IssueCluster(
            cluster_code='HC-3015',
            category='Healthcare',
            subcategory='Primary Health Center Deficit',
            title='Sub-Center Maternal & Emergency Staffing Deficit in Karchhana',
            primary_location='Karchhana Primary Health Center',
            district='Prayagraj',
            state='Uttar Pradesh',
            center_lat=25.3210,
            center_lng=81.9120,
            report_count=298,
            estimated_population=12400,
            severity_score=85.0,
            priority_score=81.6,
            priority_level='HIGH',
            status='Active',
            affected_services=['Healthcare'],
            why_prioritized=[
                '298 citizen reports confirming absence of 24/7 delivery room and doctors',
                'High population dependency (~12,400 residents in a 12km radius)',
                'Critical maternal health and emergency stabilization deficit'
            ]
        )
        db.add(c3)
        db.flush()
        ps3 = PriorityScore(
            cluster_id=c3.id,
            citizen_demand_score=82.0, population_impact_score=94.0, infrastructure_gap_score=78.0,
            severity_score=85.0, critical_service_score=90.0, urgency_score=80.0, final_score=81.6,
            formula_version='v1.0', weights_snapshot=priority_engine.get_weights()
        )
        db.add(ps3)
        rec3_data = recommendation_service.generate_recommendation(
            cluster_code=c3.cluster_code, category=c3.category, title=c3.title,
            primary_location=c3.primary_location, district=c3.district,
            report_count=c3.report_count, estimated_population=c3.estimated_population,
            priority_score=c3.priority_score, affected_services=c3.affected_services
        )
        db.add(Recommendation(cluster_id=c3.id, **rec3_data))

        # Flagship Hotspot 4: SN-4050 (Sanitation & Drainage in Patna Danapur)
        c4 = IssueCluster(
            cluster_code='SN-4050',
            category='Sanitation & Drainage',
            subcategory='Stormwater Drainage & Clogging',
            title='Chronic Drain Overflow & Stagnant Waterlogging in Danapur Cantt Border',
            primary_location='Danapur Ward 12 Main Drain',
            district='Patna',
            state='Bihar',
            center_lat=25.6320,
            center_lng=85.0420,
            report_count=310,
            estimated_population=7800,
            severity_score=84.0,
            priority_score=84.2,
            priority_level='HIGH',
            status='Active',
            affected_services=['Sanitation', 'Healthcare'],
            why_prioritized=[
                '310 citizen submissions with photo evidence of clogged stormwater drains',
                'Vector-borne disease outbreak risk and pedestrian access blocked',
                'Chronic monsoon drainage deficit (65.0/100 gap score)'
            ]
        )
        db.add(c4)
        db.flush()
        ps4 = PriorityScore(
            cluster_id=c4.id,
            citizen_demand_score=83.0, population_impact_score=85.0, infrastructure_gap_score=88.0,
            severity_score=84.0, critical_service_score=85.0, urgency_score=82.0, final_score=84.2,
            formula_version='v1.0', weights_snapshot=priority_engine.get_weights()
        )
        db.add(ps4)
        rec4_data = recommendation_service.generate_recommendation(
            cluster_code=c4.cluster_code, category=c4.category, title=c4.title,
            primary_location=c4.primary_location, district=c4.district,
            report_count=c4.report_count, estimated_population=c4.estimated_population,
            priority_score=c4.priority_score, affected_services=c4.affected_services
        )
        db.add(Recommendation(cluster_id=c4.id, **rec4_data))

        # Hotspot 5: EL-5021 (Electricity in Ranchi Ormanjhi)
        c5 = IssueCluster(
            cluster_code='EL-5021',
            category='Electricity',
            subcategory='Frequent Power Outages & Transformer Failure',
            title='Frequent Low-Voltage Fluctuation & Overloaded Transformer in Ormanjhi',
            primary_location='Ormanjhi Rural Market Cluster',
            district='Ranchi',
            state='Jharkhand',
            center_lat=23.4810,
            center_lng=85.4520,
            report_count=185,
            estimated_population=4200,
            severity_score=72.0,
            priority_score=71.5,
            priority_level='HIGH',
            status='Active',
            affected_services=['Electricity', 'Education'],
            why_prioritized=[
                '185 citizen reports regarding blown 100kVA transformer and weekly blackouts',
                'Agricultural irrigation pump motors and student studies interrupted',
                'Uninsulated wiring near rural marketplace'
            ]
        )
        db.add(c5)
        db.flush()
        ps5 = PriorityScore(
            cluster_id=c5.id,
            citizen_demand_score=72.0, population_impact_score=70.0, infrastructure_gap_score=68.0,
            severity_score=72.0, critical_service_score=65.0, urgency_score=74.0, final_score=71.5,
            formula_version='v1.0', weights_snapshot=priority_engine.get_weights()
        )
        db.add(ps5)
        rec5_data = recommendation_service.generate_recommendation(
            cluster_code=c5.cluster_code, category=c5.category, title=c5.title,
            primary_location=c5.primary_location, district=c5.district,
            report_count=c5.report_count, estimated_population=c5.estimated_population,
            priority_score=c5.priority_score, affected_services=c5.affected_services
        )
        db.add(Recommendation(cluster_id=c5.id, **rec5_data))

        # Hotspot 6: Resolved Project Demo Cluster (RD-9010 in Varanasi Pindra)
        c6 = IssueCluster(
            cluster_code='RD-9010',
            category='Road Infrastructure',
            subcategory='Rural Road Connectivity',
            title='Pindra-Harahua Bypass Rural Connectivity Project',
            primary_location='Pindra Market Link Road',
            district='Varanasi',
            state='Uttar Pradesh',
            center_lat=25.4620,
            center_lng=82.8420,
            report_count=520,
            estimated_population=7200,
            severity_score=86.0,
            priority_score=88.0,
            priority_level='CRITICAL',
            status='Resolved',
            affected_services=['Healthcare', 'Transportation'],
            why_prioritized=[
                'Resolved high-priority issue under PMGSY Batch 2',
                'Previous chronic ambulance delays resolved'
            ]
        )
        db.add(c6)
        db.flush()

        # Seed Development Projects
        p1 = Project(
            project_code='PRJ-RD-2025-04',
            title='Pindra-Harahua 5.4km Bituminous Pavement & Drainage Overhaul',
            description='Upgradation of 5.4km rural connector to all-weather bituminous standard with concrete side drains connecting Pindra market to Primary Health Centre.',
            cluster_id=c6.id,
            district='Varanasi',
            target_area='Pindra Market Link Road',
            category='Road Infrastructure',
            estimated_budget=3850000.0,
            estimated_beneficiaries=7200,
            status='Completed',
            priority_score=88.0,
            created_at=datetime.utcnow() - timedelta(days=90),
            updated_at=datetime.utcnow() - timedelta(days=5)
        )
        db.add(p1)
        db.flush()

        db.add(ImpactMeasurement(
            project_id=p1.id,
            cluster_id=c6.id,
            pre_report_count=520,
            post_report_count=48,
            pre_infra_index=36.0,
            post_infra_index=84.5,
            emergency_access_change='Ambulance transit response time reduced from 48 mins to 14 mins (-70.8%)',
            citizen_satisfaction_score=91.2,
            is_measured=True
        ))

        p2 = Project(
            project_code='PRJ-WT-2026-08',
            title='Pipraich Solar Piped Drinking Water & Pipe Replacement',
            description='Replacement of fractured 150mm cast iron main water line and installation of 25kL overhead reservoir under Jal Jeevan Mission.',
            cluster_id=c2.id,
            district='Gorakhpur',
            target_area='Pipraich Ward 3 & 4',
            category='Drinking Water',
            estimated_budget=2450000.0,
            estimated_beneficiaries=6150,
            status='In Progress',
            priority_score=87.8,
            created_at=datetime.utcnow() - timedelta(days=25),
            updated_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(p2)

        p3 = Project(
            project_code='PRJ-RD-2026-12',
            title='Cholapur-Harahua Emergency Rural Road Overhaul',
            description='Comprehensive re-engineering and all-weather blacktopping of the 4.2km Cholapur-Harahua rural corridor directly feeding Community Health Centre.',
            cluster_id=c1.id,
            district='Varanasi',
            target_area='Cholapur-Harahua Rural Corridor',
            category='Road Infrastructure',
            estimated_budget=4200000.0,
            estimated_beneficiaries=8420,
            status='Proposed',
            priority_score=92.4,
            created_at=datetime.utcnow() - timedelta(days=10),
            updated_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add(p3)

        db.commit()

        print('[Seed] Synthesizing constituent citizen reports database (~5,000+ reports)...')

        road_hindi = [
            '????? ???? ?? ???? ????? ??? ???? ??? ???? ?? ???? ?? ?? ????????? ???? ????? ?????',
            '??????? ???? ?? ????-???? ????? ???, ?? ??? ???? ?????? ?? ?? ???? ??????? ???? ????? ?????',
            '????? ?? ??????? ???? ???? ????? ???? ??? ??? ???? ??, ????? ??? 2 ??? ???? ?? ???? ???',
            '???? ?? ????? ???? ?? ?????? ?? ???? ???, ?????? ?? ????? ??? ????? ??? ??? ???? ???',
            '???? ???? ????? ?? ?? ??? ??? ??? ???? ???? ? ????, ????? ????? ????? ?? ??? ?? ?? ???? ????? ???'
        ]
        road_eng = [
            'Connecting road from Cholapur corridor has completely collapsed after monsoon rains, blocking hospital transport.',
            'Deep potholes everywhere on the rural stretch. Emergency ambulances refuse to enter our village.',
            'School children and daily commuters stranded due to knee-deep mud on the main link road.',
            'Severe road erosion near the canal bridge posing extreme danger to two-wheelers and tractors.'
        ]

        water_phrases = [
            '???? ?? ???? ?? ???? ?? ??????? ???? ? ??? ??, ????? ?????? ?? ??? ???? ?? ????? ?? ??? ????',
            '?? ???? ???? ?? ???????? ???? ??? ??, ????? 2 ?????? ?? ???? ?? ???? ?? ???? ?????? ???',
            'Municipal tap water contaminated with mud and drain leakage. Urgent chlorination required.',
            'Water supply pipeline ruptured near main square, thousands left without clean drinking water.'
        ]

        health_phrases = [
            '???????? ????????? ?????? ?? ?????? ?????? ???? ????, ??????? ?? ??? 25 ???? ??? ???? ????? ???',
            '??????? ??? ? ?? ?????? ??????? ??? ?? ? ?? ??? ??? ??? ?????, ????????? ?? ??? ?? ???? ??????',
            'No attending medical officer or anti-venom injection at sub-center. Highly critical situation.',
            'Primary health center closed on weekdays, rural patients forced to travel to district hospital.'
        ]

        drain_phrases = [
            '??????? ???? ??? ??? ???, ???? ???? ???? ?? ??? ?? ??? ?? ?? ????? ?? ???? ??? ??? ???',
            '????? ???? ?? ???? ?????? ?? ???? ???, ????? ???? ?? ???? ???? ?? ???? ?? ???? ???? ???? ???',
            'Open drainage overflowing with toxic effluent, creating unbearable foul smell and disease hazard.',
            'Stormwater drain choked with garbage, streets waterlogged with knee-deep blackwater.'
        ]

        power_phrases = [
            '???? ?? ???????????? 10 ??? ?? ??? ??? ??, ??? ??? ?????? ???? ?? ?? ????? ????? ???? ??? ????',
            '??? ??????? ?? ???? ????? ???? ??? ??? ???, ??? ?? ???? ????? ?? ???? ???',
            'Frequent low voltage and 14-hour load shedding disrupting irrigation tubewells and exams.',
            'Exposed low-hanging electric cable sparking violently during winds. Life hazard.'
        ]

        report_objects = []
        now = datetime.utcnow()

        # 647 constituent reports for RD-2048
        for i in range(647):
            is_hindi = (i % 3 != 0)
            text = random.choice(road_hindi) if is_hindi else random.choice(road_eng)
            lat = 25.3850 + random.uniform(-0.015, 0.015)
            lng = 83.0210 + random.uniform(-0.015, 0.015)
            days_ago = random.randint(0, 45)
            created_time = now - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
            
            report_objects.append(CitizenReport(
                tracking_id=f'JNS-VNS-{10000 + i}',
                original_language='Hindi' if is_hindi else 'English',
                original_text=text,
                translated_summary='Village road becomes unusable during rain and ambulance access is affected.' if is_hindi else text,
                category='Road Infrastructure',
                subcategory='Rural Road Connectivity',
                severity=random.randint(8, 10),
                urgency=random.randint(8, 10),
                affected_services=['Healthcare', 'Transportation'],
                latitude=lat,
                longitude=lng,
                location_name='Cholapur-Harahua Rural Corridor',
                evidence_type='Image' if (i % 4 == 0) else 'None',
                evidence_url='https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600' if (i % 4 == 0) else None,
                ai_observation={'detected_issue': 'Road damage', 'confidence': 0.91, 'visual_evidence': ['Large potholes', 'Broken road surface', 'Water accumulation']} if (i % 4 == 0) else None,
                cluster_id=c1.id,
                status='clustered',
                created_at=created_time
            ))

        # 423 reports for WT-1102
        for i in range(423):
            is_hindi = (i % 2 == 0)
            text = random.choice(water_phrases)
            lat = 26.8310 + random.uniform(-0.012, 0.012)
            lng = 83.5240 + random.uniform(-0.012, 0.012)
            days_ago = random.randint(0, 30)

            report_objects.append(CitizenReport(
                tracking_id=f'JNS-GKP-{20000 + i}',
                original_language='Hindi' if is_hindi else 'English',
                original_text=text,
                translated_summary='Contaminated drinking water supply posing severe gastrointestinal health risks.' if is_hindi else text,
                category='Drinking Water',
                subcategory='Contaminated Pipeline Supply',
                severity=random.randint(8, 10),
                urgency=random.randint(8, 10),
                affected_services=['Drinking Water', 'Healthcare'],
                latitude=lat,
                longitude=lng,
                location_name='Pipraich Ward 3 & 4',
                evidence_type='Image' if (i % 5 == 0) else 'None',
                cluster_id=c2.id,
                status='clustered',
                created_at=now - timedelta(days=days_ago, hours=random.randint(0, 23))
            ))

        # 298 reports for HC-3015
        for i in range(298):
            is_hindi = (i % 2 != 0)
            text = random.choice(health_phrases)
            lat = 25.3210 + random.uniform(-0.010, 0.010)
            lng = 81.9120 + random.uniform(-0.010, 0.010)

            report_objects.append(CitizenReport(
                tracking_id=f'JNS-PRG-{30000 + i}',
                original_language='Hindi' if is_hindi else 'English',
                original_text=text,
                translated_summary='Lack of attending doctors and emergency medicines at Primary Health Center.' if is_hindi else text,
                category='Healthcare',
                subcategory='Primary Health Center Deficit',
                severity=random.randint(8, 10),
                urgency=random.randint(7, 9),
                affected_services=['Healthcare'],
                latitude=lat,
                longitude=lng,
                location_name='Karchhana Primary Health Center',
                evidence_type='None',
                cluster_id=c3.id,
                status='clustered',
                created_at=now - timedelta(days=random.randint(0, 40), hours=random.randint(0, 23))
            ))

        # 310 reports for SN-4050
        for i in range(310):
            text = random.choice(drain_phrases)
            lat = 25.6320 + random.uniform(-0.012, 0.012)
            lng = 85.0420 + random.uniform(-0.012, 0.012)
            report_objects.append(CitizenReport(
                tracking_id=f'JNS-PAT-{40000 + i}',
                original_language='Hindi' if '????' in text or '????' in text else 'English',
                original_text=text,
                translated_summary='Blocked stormwater drain causing blackwater stagnation and flood hazard.',
                category='Sanitation & Drainage',
                subcategory='Stormwater Drainage & Clogging',
                severity=random.randint(7, 9),
                urgency=random.randint(7, 9),
                affected_services=['Sanitation', 'Healthcare'],
                latitude=lat,
                longitude=lng,
                location_name='Danapur Ward 12 Main Drain',
                evidence_type='None',
                cluster_id=c4.id,
                status='clustered',
                created_at=now - timedelta(days=random.randint(0, 35))
            ))

        # 185 reports for EL-5021
        for i in range(185):
            text = random.choice(power_phrases)
            lat = 23.4810 + random.uniform(-0.015, 0.015)
            lng = 85.4520 + random.uniform(-0.015, 0.015)
            report_objects.append(CitizenReport(
                tracking_id=f'JNS-RNC-{50000 + i}',
                original_language='Hindi' if '?????' in text or '????' in text else 'English',
                original_text=text,
                translated_summary='Frequent power cuts, blown transformer and sagging overhead electric wire.',
                category='Electricity',
                subcategory='Frequent Power Outages & Transformer Failure',
                severity=random.randint(6, 8),
                urgency=random.randint(6, 9),
                affected_services=['Electricity', 'Education'],
                latitude=lat,
                longitude=lng,
                location_name='Ormanjhi Rural Market Cluster',
                evidence_type='None',
                cluster_id=c5.id,
                status='clustered',
                created_at=now - timedelta(days=random.randint(0, 20))
            ))

        # 520 reports for resolved cluster c6 (RD-9010)
        for i in range(520):
            lat = 25.4620 + random.uniform(-0.012, 0.012)
            lng = 82.8420 + random.uniform(-0.012, 0.012)
            report_objects.append(CitizenReport(
                tracking_id=f'JNS-VNS-RES-{i+1}',
                original_language='Hindi',
                original_text='?????? ?? ????? ???? ??? ???? ???? ??, ????????? ???? ? ?????',
                translated_summary='Pindra-Harahua link road broken, blocking emergency vehicles.',
                category='Road Infrastructure',
                subcategory='Rural Road Connectivity',
                severity=8,
                urgency=8,
                affected_services=['Healthcare', 'Transportation'],
                latitude=lat,
                longitude=lng,
                location_name='Pindra Market Link Road',
                evidence_type='None',
                cluster_id=c6.id,
                status='resolved',
                created_at=now - timedelta(days=random.randint(90, 180))
            ))

        # General distributed reports across all districts to reach 5,280 reports
        current_count = len(report_objects)
        needed = 5280 - current_count
        print(f'[Seed] Populating {needed} general distributed reports across all districts...')

        categories_pool = [
            ('Road Infrastructure', road_hindi + road_eng, ['Transportation']),
            ('Drinking Water', water_phrases, ['Drinking Water']),
            ('Healthcare', health_phrases, ['Healthcare']),
            ('Sanitation & Drainage', drain_phrases, ['Sanitation']),
            ('Electricity', power_phrases, ['Electricity'])
        ]

        for i in range(needed):
            d = random.choice(districts_info)
            v = random.choice(d['villages'])
            cat, phrases, services = random.choice(categories_pool)
            txt = random.choice(phrases)
            is_hin = '????' in txt or '????' in txt or '????' in txt or '????' in txt or '?????' in txt or '???????' in txt
            lat = d['lat'] + random.uniform(-0.08, 0.08)
            lng = d['lng'] + random.uniform(-0.08, 0.08)

            report_objects.append(CitizenReport(
                tracking_id=f'JNS-GEN-{100000 + i}',
                original_language='Hindi' if is_hin else 'English',
                original_text=txt,
                translated_summary='Citizen reported localized public infrastructure gap requiring attention.',
                category=cat,
                subcategory=f'{cat} Inadequacy',
                severity=random.randint(5, 8),
                urgency=random.randint(4, 8),
                affected_services=services,
                latitude=lat,
                longitude=lng,
                location_name=f"{v}, {d['name']}",
                evidence_type='None',
                cluster_id=None,
                status='received',
                created_at=now - timedelta(days=random.randint(0, 60), hours=random.randint(0, 23))
            ))

        print(f'[Seed] Bulk saving {len(report_objects)} reports...')
        db.bulk_save_objects(report_objects)
        db.commit()

        total_reports = db.query(CitizenReport).count()
        total_clusters = db.query(IssueCluster).count()
        total_projects = db.query(Project).count()
        print(f'[Seed] Complete! Seeded {total_reports:,} reports, {total_clusters} clusters, and {total_projects} projects.')

    except Exception as e:
        print(f'[Seed] Error during seeding: {e}')
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == '__main__':
    seed_database()
