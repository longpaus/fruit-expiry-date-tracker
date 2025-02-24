from ultralytics import YOLO
import numpy as np
import os
import yaml

# Load your model once to save time
model = YOLO("app/models/fruit_detection.pt")

# Test configuration
dataset = "test/detection_dataset"
confidence_threshold = 0.5
accuracy_threshold = 0.8

# Set up data.yaml file
current_directory = os.getcwd()
with open(f"{dataset}/data.yaml", "r") as file:
    data = yaml.safe_load(file)

data['val'] = os.path.join(current_directory, 'test/detection_dataset/valid/images')
data['test'] = os.path.join(current_directory, 'test/detection_dataset/test/images')

with open(f"{dataset}/data.yaml", "w") as file:
    yaml.dump(data, file)

def test_basic():
    """Test the model prediction on a sample image."""
    image_path = f"{dataset}/test/images/1.jpg"

    # Run prediction on a single image
    result = model.predict(source=image_path, conf=confidence_threshold)

    # Validate that at least one detection was made
    for pred in result:
        confidences = pred.boxes.conf.cpu().numpy()
        assert len(confidences) > 0, "No detections found"

        # Validate that the highest confidence detection meets the threshold
        max_confidence = np.max(confidences)
        assert max_confidence >= confidence_threshold, (
            f"Top class confidence {max_confidence:.2f} is below threshold {confidence_threshold}"
        )

def test_model_accuracy():
    """Test that the model's mAP on the test set meets the specified threshold."""
    # Run validation on the test dataset
    metrics = model.val(data=f"{dataset}/data.yaml")

    # Check if the mAP (mean Average Precision) meets the threshold
    mAP = metrics.box.map50
    assert mAP >= accuracy_threshold, (
        f"Model mAP@0.5 ({mAP:.2f}) is below the threshold ({accuracy_threshold})"
    )
