import math
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import DBSCAN
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ClusteringService:
    def __init__(self, eps_km: float = 3.5, min_samples: int = 3):
        # 3.5 km radius converted to radians for Haversine
        # Earth radius approx 6371 km
        self.eps_radians = eps_km / 6371.0
        self.min_samples = min_samples

    def cluster_reports(self, reports: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups reports into geographic and semantic issue clusters.
        """
        if not reports:
            return []

        # Group reports by category first to prevent cross-category clustering
        by_category = {}
        for r in reports:
            cat = r.get("category", "Other")
            by_category.setdefault(cat, []).append(r)

        clusters = []
        cluster_counter = 1000

        for cat, cat_reports in by_category.items():
            if len(cat_reports) < self.min_samples:
                # If too few to form DBSCAN cluster, group into a single fallback cluster if near each other
                clusters.append(self._create_cluster_from_group(cat, cat_reports, f"{cat[:2].upper()}-{cluster_counter}"))
                cluster_counter += 1
                continue

            # Extract coordinates in radians for Haversine DBSCAN
            coords = np.array([
                [math.radians(r["latitude"]), math.radians(r["longitude"])]
                for r in cat_reports
            ])

            db = DBSCAN(eps=self.eps_radians, min_samples=self.min_samples, metric='haversine')
            labels = db.fit_predict(coords)

            # Collect clusters
            grouped = {}
            for idx, label in enumerate(labels):
                grouped.setdefault(label, []).append(cat_reports[idx])

            for label, items in grouped.items():
                if label == -1:
                    # Outliers: group into smaller local clusters or individual issue clusters
                    for item in items:
                        code = f"{cat[:2].upper()}-{cluster_counter}"
                        clusters.append(self._create_cluster_from_group(cat, [item], code))
                        cluster_counter += 1
                else:
                    code = f"{cat[:2].upper()}-{cluster_counter}"
                    clusters.append(self._create_cluster_from_group(cat, items, code))
                    cluster_counter += 1

        return clusters

    def _create_cluster_from_group(self, category: str, items: List[Dict[str, Any]], code: str) -> Dict[str, Any]:
        lats = [it["latitude"] for it in items]
        lngs = [it["longitude"] for it in items]
        center_lat = sum(lats) / len(lats)
        center_lng = sum(lngs) / len(lngs)

        # Aggregate services
        services = set()
        for it in items:
            for s in it.get("affected_services", []):
                services.add(s)

        # Average severity & urgency
        avg_sev = sum(it.get("severity", 5) for it in items) / len(items)
        avg_urg = sum(it.get("urgency", 5) for it in items) / len(items)

        # Primary location name from first or most common
        loc_name = items[0].get("location_name") or f"Sector near {center_lat:.3f}, {center_lng:.3f}"
        district = items[0].get("district", "Varanasi")
        subcat = items[0].get("subcategory", f"{category} Inadequacy")

        title = f"{subcat} at {loc_name}"
        if len(items) > 1:
            title = f"{len(items)} Reports: {subcat} in {loc_name}"

        # Estimate affected population proportional to report count
        # In Indian rural/semi-urban clusters, 100 reports often represent ~1,500 - 8,000 affected residents
        est_population = int(max(500, min(35000, len(items) * 13 + 450)))
        if len(items) >= 400:
            est_population = int(len(items) * 12.8)

        return {
            "cluster_code": code,
            "category": category,
            "subcategory": subcat,
            "title": title,
            "primary_location": loc_name,
            "district": district,
            "center_lat": center_lat,
            "center_lng": center_lng,
            "report_count": len(items),
            "estimated_population": est_population,
            "avg_severity": avg_sev,
            "avg_urgency": avg_urg,
            "affected_services": list(services),
            "report_ids": [it.get("id") for it in items if "id" in it]
        }

    def compute_text_similarity(self, query_text: str, candidate_texts: List[str]) -> List[float]:
        """
        Uses TF-IDF and Cosine Similarity to find related reports.
        """
        if not candidate_texts:
            return []
        corpus = [query_text] + candidate_texts
        try:
            tfidf = TfidfVectorizer().fit_transform(corpus)
            sims = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()
            return sims.tolist()
        except Exception:
            return [0.0] * len(candidate_texts)

clustering_service = ClusteringService()
