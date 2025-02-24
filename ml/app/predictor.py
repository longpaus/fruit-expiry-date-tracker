import torch
import torch.nn.functional as F
from PIL import Image
from typing import Dict

from app.models import get_decoder, load_model, resnet50_transform

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

apple_model= load_model("apple", device)
banana_model= load_model("banana", device)
strawberry_model= load_model("strawberry", device)
mango_model= load_model("mango", device)
orange_model= load_model("orange", device)

apple_decoder = get_decoder('apple')
banana_decoder = get_decoder('banana')
mango_decoder = get_decoder('mango')
orange_decoder = get_decoder('orange')
strawberry_decoder = get_decoder('strawberry')

# Predict shelf life based on detected fruit class
def predict_fruit_shelf_life(cropped_image: Image.Image, fruit_class: int) -> Dict[str, str | float]:
    if fruit_class == 0:
        return predict_shelf_life(cropped_image, apple_model, resnet50_transform, apple_decoder, "apple")
    if fruit_class == 1:
        return predict_shelf_life(cropped_image, banana_model, resnet50_transform, banana_decoder, "banana")
    if fruit_class == 2:
        return predict_shelf_life(cropped_image,mango_model, resnet50_transform, mango_decoder, "mango")
    if fruit_class == 3:
        return predict_shelf_life(cropped_image, orange_model, resnet50_transform, orange_decoder, "orange")
    if fruit_class == 4:
        return predict_shelf_life(cropped_image, strawberry_model, resnet50_transform, strawberry_decoder, "strawberry")
    return {"fruit": "unknown", "prediction": "N/A", "confidence": 0}

# General function to make a prediction using a specified model and transformations
def predict_shelf_life(
    image: Image.Image,
    model: torch.nn.Module,
    transform,
    decoder: Dict[int, str],
    fruit_type: str
) -> Dict[str, str | float]:
    """
    General function to make a prediction
    """
    # Transform the image
    img_tensor = transform(image).unsqueeze(0)

    img_tensor = img_tensor.to(device)
    model = model.to(device)

    model.eval()

    # Run prediction without gradient tracking
    with torch.no_grad():
        output = model(img_tensor)
        probabilities = F.softmax(output, dim=1)
        top_prob, top_idx = torch.max(probabilities, dim=1)
        predicted_class = int(top_idx.item())
        confidence_score = top_prob.item()

    # Return structured prediction data
    return {
        "fruit": fruit_type,
        "prediction": decoder[predicted_class],
        "confidence": confidence_score
    }
