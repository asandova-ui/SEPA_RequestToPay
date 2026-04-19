# SEPA Request-to-Pay vs Direct Debit — Bachelor’s Thesis Prototype (2025)

This repository contains the implementation and the thesis deliverables for my **Bachelor’s Final Degree Project / Capstone (TFG)** on **SEPA Request-to-Pay (SRTP)** as a modern alternative to **SEPA Direct Debit (SDD)**.

The work explains SRTP at a technical/operational level and provides a **working prototype** that simulates the full SRTP life cycle: **creation → presentation → decision → execution → closure**, with a **real-time web UI** and an **event-driven backend**.

- **Thesis title (ES)**: *Request To Pay frente a la domiciliación bancaria: propuesta de mejora e implementación de un prototipo*
- **Date**: June 2025
- **Grade / distinction**: **Highest mark (10/10) + “Matrícula de Honor” (Highest Honors)**

## Repository structure

- `MemoriaTFG/`
  - `MemoriaTFG.pdf`: final thesis document
  - `main.tex` + assets: LaTeX sources and figures
- `backend/`: Flask API + persistence + Socket.IO events
- `frontend/`: static HTML/CSS/JS client (real-time updates via Socket.IO)

## What the prototype does

- **Actors**: beneficiary, payer, beneficiary PSP, payer PSP
- **Backend**:
  - REST endpoints to drive each SRTP step (create, validate, route, decide)
  - State machine and business rules (including rejection paths, e.g. insufficient funds)
  - Persistence via SQLAlchemy (SQLite in this prototype)
  - Real-time notifications via Socket.IO rooms per actor/role
- **Frontend**:
  - Single-page style UI for logging in as different actors
  - Live updates when an SRTP request changes state

## Quick start (local)

### Backend (Flask)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The server opens `http://127.0.0.1:5000/` automatically.

### Demo users (pre-seeded)

The prototype seeds four actors on startup (see `backend/app.py`):

- **Beneficiary**: username `e`, password `1`
- **PSP (beneficiary)**: username `pm`, password `1`
- **PSP (payer)**: username `pa`, password `1`
- **Payer**: username `a`, password `1`

## Notes / limitations (prototype)

- **Demo-only credentials**: simple plaintext credentials are used for convenience.
- **Database lifecycle**: the current setup recreates the schema on startup (prototype behavior).
- **Not production-ready**: no banking integration, no ISO 20022 messaging exchange with real PSPs; this is a functional simulation aimed at explaining the SRTP flow end-to-end.

## License

All rights reserved unless stated otherwise.

