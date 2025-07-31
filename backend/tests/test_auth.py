import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_coach():
    response = client.post("/auth/register", json={
        "nombre": "Test Coach",
        "email": "test@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 200
    assert "coach_id" in response.json()

def test_login_coach():
    # Primero registrar
    client.post("/auth/register", json={
        "nombre": "Test Coach 2",
        "email": "test2@example.com",
        "password": "testpassword"
    })
    
    # Luego hacer login
    response = client.post("/auth/login", json={
        "email": "test2@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"