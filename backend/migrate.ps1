$env:POSTGRES_DB = "neondb"
$env:POSTGRES_USER = "neondb_owner"
$env:POSTGRES_PASSWORD = "npg_3WSIF1CbTwxM"
$env:POSTGRES_HOST = "ep-holy-wind-ahhl3ei2-pooler.c-3.us-east-1.aws.neon.tech"
$env:POSTGRES_PORT = "5432"

python manage.py makemigrations quiz
python manage.py migrate
python manage.py showmigrations
