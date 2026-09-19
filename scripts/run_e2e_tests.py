import sys
import json
import urllib.request
import urllib.error
import time

try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_API = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:5173"

test_results = []

def record_test(name, passed, details=""):
    status = "PASS" if passed else "FAIL"
    test_results.append({"name": name, "status": status, "details": details})
    symbol = "[OK]" if passed else "[XX]"
    print(f"{symbol} [{status}] {name}")
    if details and not passed:
        print(f"    Error: {details}")

def http_get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "E2E-Tester"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def http_get_raw(url):
    req = urllib.request.Request(url, headers={"User-Agent": "E2E-Tester"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, resp.read().decode("utf-8")

def http_post(url, data):
    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "E2E-Tester"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def http_patch(url, data):
    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "E2E-Tester"},
        method="PATCH"
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def run_all_tests():
    print("==================================================================")
    print("      JANSETU AI: COMPREHENSIVE END-TO-END SYSTEM TEST SUITE      ")
    print("==================================================================")

    # 1. Frontend Server Connectivity
    try:
        status, html = http_get_raw(FRONTEND_URL)
        passed = (status == 200 and "<html" in html.lower())
        record_test("Frontend UI Server (Port 5173)", passed, f"Status: {status}")
    except Exception as e:
        record_test("Frontend UI Server (Port 5173)", False, str(e))

    # 2. Backend Health Check Endpoint
    try:
        status, data = http_get(f"{BASE_API}/health")
        passed = (status == 200 and data.get("status") == "healthy")
        record_test("Backend API Health Check (/api/health)", passed, f"Data: {data}")
    except Exception as e:
        record_test("Backend API Health Check (/api/health)", False, str(e))

    # 3. Database Connectivity & Seed Integrity
    try:
        status, data = http_get(f"{BASE_API}/analytics/overview")
        total_reports = data.get("total_reports", 0)
        active_hotspots = data.get("active_hotspots", 0)
        passed = (status == 200 and total_reports >= 5000 and active_hotspots >= 4)
        record_test("Database Connectivity & Seed Records (>5000 reports)", passed, f"Reports: {total_reports}, Hotspots: {active_hotspots}")
    except Exception as e:
        record_test("Database Connectivity & Seed Records", False, str(e))

    # 4. AI Preview Endpoint & Vision Inspection
    try:
        preview_payload = {
            "text": "सड़क पर भारी जलभराव और गहरे गड्ढे हैं जिससे एम्बुलेंस नहीं आ सकती।",
            "has_image": True
        }
        status, preview_data = http_post(f"{BASE_API}/reports/preview", preview_payload)
        passed = (
            status == 200 and
            preview_data.get("category") == "Road Infrastructure" and
            preview_data.get("ai_observation") is not None and
            "pothole" in str(preview_data.get("ai_observation", {})).lower()
        )
        record_test("AI Classification & Vision Inspection Preview", passed, f"Category: {preview_data.get('category')}")
    except Exception as e:
        record_test("AI Classification & Vision Inspection Preview", False, str(e))

    # 5. Citizen Report Submission (Hindi)
    hindi_report_id = None
    try:
        hindi_payload = {
            "original_text": "हमारे गांव की सड़क बारिश में पूरी तरह खराब हो जाती है और एम्बुलेंस नहीं पहुंच पाती।",
            "original_language": "Hindi",
            "latitude": 25.3850,
            "longitude": 83.0210,
            "location_name": "Cholapur-Harahua Rural Corridor",
            "evidence_type": "Image",
            "contact_name": "राम सेवक",
            "contact_phone": "+91 9876543210"
        }
        status, rep_h = http_post(f"{BASE_API}/reports", hindi_payload)
        hindi_report_id = rep_h.get("id")
        passed = (
            status == 200 and
            rep_h.get("category") == "Road Infrastructure" and
            rep_h.get("severity") >= 8 and
            rep_h.get("urgency") >= 8 and
            "Healthcare" in rep_h.get("affected_services", []) and
            rep_h.get("tracking_id", "").startswith("JNS-")
        )
        record_test("Citizen Report Submission (Hindi) & Service Impact", passed, f"Category: {rep_h.get('category')}, Tracking: {rep_h.get('tracking_id')}")
    except Exception as e:
        record_test("Citizen Report Submission (Hindi)", False, str(e))

    # 6. Citizen Report Submission (English)
    try:
        eng_payload = {
            "original_text": "Main drinking water pipeline has burst near the school, contaminated yellow water is causing children to fall sick with diarrhea.",
            "original_language": "English",
            "latitude": 26.8310,
            "longitude": 83.5240,
            "location_name": "Pipraich Ward 3",
            "evidence_type": "None"
        }
        status, rep_e = http_post(f"{BASE_API}/reports", eng_payload)
        passed = (
            status == 200 and
            rep_e.get("category") == "Drinking Water" and
            rep_e.get("severity") >= 8 and
            "Drinking Water" in rep_e.get("affected_services", [])
        )
        record_test("Citizen Report Submission (English) & Service Impact", passed, f"Category: {rep_e.get('category')}")
    except Exception as e:
        record_test("Citizen Report Submission (English)", False, str(e))

    # 7. Location Handling & Anonymization
    try:
        status, rep = http_get(f"{BASE_API}/reports/{hindi_report_id}")
        passed = (
            status == 200 and
            rep.get("location_name") is not None and
            abs(rep.get("latitude") - 25.3850) < 0.001 and
            abs(rep.get("longitude") - 83.0210) < 0.001
        )
        record_test("Location Handling & Coordinate Integrity", passed)
    except Exception as e:
        record_test("Location Handling & Coordinate Integrity", False, str(e))

    # 8. Related-Report Detection & Hotspot Association
    try:
        status, rep = http_get(f"{BASE_API}/reports/{hindi_report_id}")
        cluster_id = rep.get("cluster_id")
        passed = (status == 200 and cluster_id is not None and rep.get("status") == "clustered")
        record_test("Related-Report Clustering & Hotspot Linkage", passed, f"Cluster ID: {cluster_id}")
    except Exception as e:
        record_test("Related-Report Clustering & Hotspot Linkage", False, str(e))

    # 9. Hotspot Generation & Spatial DBSCAN Clustering
    top_cluster = None
    try:
        status, hotspots = http_get(f"{BASE_API}/hotspots")
        top_cluster = hotspots[0] if hotspots else None
        rd_2048 = next((h for h in hotspots if h.get("cluster_code") == "RD-2048"), None)
        passed = (
            status == 200 and
            len(hotspots) >= 4 and
            rd_2048 is not None and
            rd_2048.get("report_count") >= 647 and
            rd_2048.get("estimated_population") >= 5000 and
            rd_2048.get("priority_level") in ["CRITICAL", "HIGH"]
        )
        record_test("Spatial Hotspot Clustering & Demographics", passed, f"Total Hotspots: {len(hotspots)}, Top: {rd_2048.get('cluster_code') if rd_2048 else 'None'}")
    except Exception as e:
        record_test("Spatial Hotspot Clustering & Demographics", False, str(e))

    # 10. Transparent Priority Engine & Explainability ("Why Prioritized")
    try:
        status, cluster_detail = http_get(f"{BASE_API}/hotspots/RD-2048")
        score = cluster_detail.get("priority_score", 0)
        why_list = cluster_detail.get("why_prioritized", [])
        passed = (
            status == 200 and
            score >= 80.0 and
            len(why_list) >= 3 and
            any("report" in w.lower() for w in why_list)
        )
        record_test("Priority Engine & Explainability Checklist", passed, f"Score: {score}/100, Reasons: {len(why_list)}")
    except Exception as e:
        record_test("Priority Engine & Explainability Checklist", False, str(e))

    # 11. Configurable Priority Weights API
    try:
        status, weights_res = http_get(f"{BASE_API}/priority/weights")
        orig_weights = weights_res.get("weights", {})
        
        # Test update
        new_w = dict(orig_weights)
        new_w["citizen_demand"] = 0.35
        new_w["urgency"] = 0.05
        status_up, update_res = http_post(f"{BASE_API}/priority/weights", new_w)
        passed = (status_up == 200 and update_res.get("clusters_updated", 0) >= 4)
        record_test("Configurable Priority Weights & Dynamic Recalculation", passed, f"Updated clusters: {update_res.get('clusters_updated')}")
    except Exception as e:
        record_test("Configurable Priority Weights & Dynamic Recalculation", False, str(e))

    # 12. Public Infrastructure Gap Matrix
    try:
        status, gaps = http_get(f"{BASE_API}/analytics/gaps")
        passed = (status == 200 and len(gaps) >= 5 and all("gap_score" in g for g in gaps))
        record_test("Infrastructure Gap Analysis Matrix", passed, f"Gaps entries: {len(gaps)}")
    except Exception as e:
        record_test("Infrastructure Gap Analysis Matrix", False, str(e))

    # 13. AI Recommendation & Actionable Dossiers
    try:
        status, recs = http_get(f"{BASE_API}/recommendations")
        passed = (
            status == 200 and
            len(recs) >= 3 and
            all(r.get("recommended_intervention") and r.get("required_verification") for r in recs)
        )
        record_test("AI Intervention Dossiers & Civil Engineering Steps", passed, f"Recommendations: {len(recs)}")
    except Exception as e:
        record_test("AI Intervention Dossiers & Civil Engineering Steps", False, str(e))

    # 14. Development Project Creation from Hotspot
    created_project_id = None
    try:
        proj_payload = {
            "cluster_id": "RD-2048",
            "title": "Cholapur-Harahua Emergency Rural Road Overhaul",
            "description": "Bituminous pavement restoration to restore emergency ambulance access.",
            "district": "Varanasi",
            "target_area": "Cholapur Corridor",
            "category": "Road Infrastructure",
            "estimated_budget": 4200000.0,
            "estimated_beneficiaries": 8420
        }
        status, proj = http_post(f"{BASE_API}/projects", proj_payload)
        created_project_id = proj.get("id")
        passed = (
            status == 200 and
            proj.get("project_code", "").startswith("PRJ-") and
            proj.get("status") == "Proposed" and
            proj.get("estimated_beneficiaries") == 8420
        )
        record_test("Project Creation & Sanctioning Workflow", passed, f"Project Code: {proj.get('project_code')}")
    except Exception as e:
        record_test("Project Creation & Sanctioning Workflow", False, str(e))

    # 15. Project Pipeline Lifecycle & Status Advancement
    try:
        # Advance Proposed -> In Progress -> Completed
        s1, p1 = http_patch(f"{BASE_API}/projects/{created_project_id}", {"status": "In Progress", "note": "Tendering finalized"})
        s2, p2 = http_patch(f"{BASE_API}/projects/{created_project_id}", {"status": "Completed", "note": "Pavement completed"})
        passed = (s1 == 200 and s2 == 200 and p2.get("status") == "Completed")
        record_test("Project Status Pipeline (Proposed -> Completed)", passed)
    except Exception as e:
        record_test("Project Status Pipeline", False, str(e))

    # 16. Closed-Loop Impact Measurement (Before vs After)
    try:
        status, impacts = http_get(f"{BASE_API}/impact")
        passed = (
            status == 200 and
            len(impacts) >= 1 and
            all(i.get("pre_report_count") > i.get("post_report_count") for i in impacts)
        )
        first_impact = impacts[0] if impacts else {}
        reduction_pct = 0
        if first_impact:
            reduction_pct = round(((first_impact['pre_report_count'] - first_impact['post_report_count']) / first_impact['pre_report_count']) * 100)
        record_test("Closed-Loop Impact Measurement (Before vs After)", passed, f"Complaint Reduction: -{reduction_pct}%")
    except Exception as e:
        record_test("Closed-Loop Impact Measurement (Before vs After)", False, str(e))

    # 17. Grounded AI Assistant (Zero Hallucination)
    try:
        q_payload = {"query": "Which development issue should the district administration investigate first?"}
        status, ans_data = http_post(f"{BASE_API}/assistant", q_payload)
        ans_text = ans_data.get("answer", "")
        citations = ans_data.get("citations", [])
        passed = (
            status == 200 and
            len(ans_text) > 50 and
            len(citations) > 0 and
            ("priority" in ans_text.lower() or "hotspot" in ans_text.lower())
        )
        record_test("JanSetu AI Assistant (Grounded Querying & Citations)", passed, f"Citations count: {len(citations)}")
    except Exception as e:
        record_test("JanSetu AI Assistant (Grounded Querying)", False, str(e))

    # 18. Live Simulation Trigger (Hackathon Demonstration)
    try:
        status, sim_data = http_post(f"{BASE_API}/simulation/trigger?count=3", {})
        passed = (
            status == 200 and
            sim_data.get("status") == "success" and
            sim_data.get("is_simulation") is True and
            len(sim_data.get("ingested_reports", [])) == 3 and
            "new_report_count" in sim_data.get("affected_cluster", {})
        )
        record_test("Live Report Burst Simulation & Real-Time Rescoring", passed, f"Cluster: {sim_data.get('affected_cluster', {}).get('cluster_code')}")
    except Exception as e:
        record_test("Live Report Burst Simulation", False, str(e))

    print("\n==================================================================")
    print("                      TEST EXECUTION SUMMARY                      ")
    print("==================================================================")
    pass_count = sum(1 for t in test_results if t["status"] == "PASS")
    fail_count = sum(1 for t in test_results if t["status"] == "FAIL")
    total = len(test_results)
    rate = (pass_count / total) * 100

    for r in test_results:
        s = "PASS" if r["status"] == "PASS" else "FAIL"
        print(f"{r['status']:4} | {r['name']}")

    print("------------------------------------------------------------------")
    print(f"Total: {total} | Passed: {pass_count} | Failed: {fail_count} | Success Rate: {rate:.1f}%")
    print("==================================================================")

    if fail_count > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    run_all_tests()
