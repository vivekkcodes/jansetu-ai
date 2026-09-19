.PHONY: run dev backend frontend test

run:
	@echo "Starting JanSetu AI full stack..."
	powershell -ExecutionPolicy Bypass -File .\start.ps1

backend:
	cd backend && python -m uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

test:
	python scripts/run_e2e_tests.py
