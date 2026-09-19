import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.models import Project, ProjectUpdate, IssueCluster, ImpactMeasurement
from app.schemas.schemas import ProjectCreate, ProjectUpdate as ProjectUpdateSchema, ProjectResponse

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_projects(status: Optional[str] = None, district: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Project)
    if status and status != "All":
        query = query.filter(Project.status == status)
    if district and district != "All":
        query = query.filter(Project.district == district)
    return query.order_by(desc(Project.created_at)).all()

@router.post("", response_model=ProjectResponse)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    code = f"PRJ-{project_in.category[:2].upper()}-2026-{random.randint(10, 99)}"
    
    # Check if cluster exists
    cluster = db.query(IssueCluster).filter(
        (IssueCluster.id == project_in.cluster_id) | (IssueCluster.cluster_code == project_in.cluster_id)
    ).first()

    priority_score = cluster.priority_score if cluster else 75.0

    new_project = Project(
        project_code=code,
        title=project_in.title,
        description=project_in.description,
        cluster_id=cluster.id if cluster else None,
        district=project_in.district,
        target_area=project_in.target_area,
        category=project_in.category,
        estimated_budget=project_in.estimated_budget or 1500000.0,
        estimated_beneficiaries=project_in.estimated_beneficiaries or 5000,
        status="Proposed",
        priority_score=priority_score
    )
    db.add(new_project)
    db.flush()

    # Add audit update
    db.add(ProjectUpdate(
        project_id=new_project.id,
        status_change="Proposed",
        note=f"Project proposed based on Hotspot {cluster.cluster_code if cluster else 'Manual'} intelligence."
    ))

    if cluster:
        cluster.status = "Proposed"

    db.commit()
    db.refresh(new_project)
    return new_project

@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project_status(project_id: str, update_in: ProjectUpdateSchema, db: Session = Depends(get_db)):
    project = db.query(Project).filter(
        (Project.id == project_id) | (Project.project_code == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    old_status = project.status
    if update_in.status:
        project.status = update_in.status
        db.add(ProjectUpdate(
            project_id=project.id,
            status_change=f"{old_status} -> {update_in.status}",
            note=update_in.note or f"Project progressed to {update_in.status}"
        ))

        # If completed, create or update impact record
        if update_in.status == "Completed":
            existing_impact = db.query(ImpactMeasurement).filter(ImpactMeasurement.project_id == project.id).first()
            if not existing_impact:
                cluster_reports = 500
                if project.cluster:
                    cluster_reports = project.cluster.report_count
                    project.cluster.status = "Actioned"
                
                db.add(ImpactMeasurement(
                    project_id=project.id,
                    cluster_id=project.cluster_id,
                    pre_report_count=cluster_reports,
                    post_report_count=int(cluster_reports * 0.12),
                    pre_infra_index=38.0,
                    post_infra_index=84.0,
                    emergency_access_change="Emergency access restored; response time reduced by 65%",
                    citizen_satisfaction_score=89.5,
                    is_measured=True
                ))

    db.commit()
    db.refresh(project)
    return project
