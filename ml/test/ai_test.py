import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.detector import detect_fruit
from app.predictor import predict_fruit_shelf_life

# Fixture to create a test client
@pytest.fixture
def client():
    client = TestClient(app)
    yield client

# Test the root endpoint
def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


# Test detector and best before classification
@patch("app.predictor.predict_fruit_shelf_life")
@patch("app.detector.detect_fruit")
def test_predict(mock_detect_fruit, mock_predict_fruit_shelf_life, client):
    mock_detect_fruit.return_value = [
        (MagicMock(), "apple")
    ]

    mock_predict_fruit_shelf_life.side_effect = lambda img, cls: {
        "fruit": cls,
        "confidence": 0.48,
        "prediction": "6-10 days" if cls == "apple" else "3 days"
    }

    # Test the /predict endpoint with a sample image
    with open("test/api_dataset/1.jpg", "rb") as image_file:
        files = {'file': image_file}
        response = client.post("/predict", files=files)

    assert response.status_code == 200
    assert response.json() == {
        "results": [
            {"fruit": "apple", "confidence": 0.48834073543548584, "prediction": "6-10 days"}
        ]
    }