from fastapi import APIRouter, UploadFile
from PIL import Image
import io

from app.detector import detect_fruit
from app.predictor import predict_fruit_shelf_life

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile):
    # Read and open image
    image = Image.open(io.BytesIO(await file.read()))
    if image.mode != 'RGB':
        image = image.convert('RGB')

    # Detect fruits in the image
    detections = detect_fruit(image)
    results = []

    # Process each detected fruit
    for cropped_image, fruit_class in detections:
        shelf_life_prediction = predict_fruit_shelf_life(cropped_image, fruit_class)
        results.append(shelf_life_prediction)

    # Return results for all detected fruits
    return {"results": results}
