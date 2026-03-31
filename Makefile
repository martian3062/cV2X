.PHONY: build up down restart logs clean migrations migrate shell

# --- Docker Management ---
build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

# --- Django Management ---
migrations:
	docker-compose exec backend_gateway python manage.py makemigrations

migrate:
	docker-compose exec backend_gateway python manage.py migrate

createsuperuser:
	docker-compose exec backend_gateway python manage.py createsuperuser

# --- Cleanup ---
clean:
	docker-compose down -v
	rm -rf frontend/.next
	rm -rf ai_service/__pycache__
	rm -rf backend/__pycache__
