#!/bin/bash
cd backend
pip install -r requirements.txt
python manage.py migrate
gunicorn tacnique_backend.wsgi
