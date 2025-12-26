# Tacnique Quiz (minimal scaffold)

Backend (Django + DRF): c:/Users/Shubham/tacnique/backend

Frontend (React minimal): c:/Users/Shubham/tacnique/frontend

Quick start (backend):

Windows (PowerShell):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # optional - for admin
python manage.py runserver
```

Quick start (frontend):

```bash
cd frontend
npm install
npm start
```

Notes:
- The backend exposes APIs at `/api/quizzes/` and `/api/quizzes/<id>/submit/`.
- The admin panel is at `/admin/` for creating quizzes/questions/choices.
