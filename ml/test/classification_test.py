from typing import List, Dict, Tuple
import os
from PIL import Image
import torch
from torch.utils.data import DataLoader
from torch import nn
import pytest
from sklearn.metrics import top_k_accuracy_score, mean_absolute_error
from app.models import get_encoder, load_model, resnet50_transform

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
SUPPORTED_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif')

class Dataset(torch.utils.data.Dataset):
    """
    Custom pytorch dataset for testing the classification model
    """
    def __init__(self, dataset_path:str, encoder:Dict[str, int], transform=None):
        self.dataset_path = dataset_path
        self.encoder = encoder
        self.transform = transform
        self.dataset: List[Tuple[str, str]] = [] # list of pairs, each pair contains (image path, label name)

        for folder in os.listdir(dataset_path):
            # the if statement is to deal with hidden files
            if not folder.startswith("."): 
                folder_path = os.path.join(dataset_path, folder)
                images = os.listdir(folder_path)
                for image in images:
                    if image.endswith(SUPPORTED_EXTENSIONS):
                        self.dataset.append((os.path.join(folder_path,image),folder))

    def __len__(self):
        return len(self.dataset)
    def __getitem__(self, idx):
        image_path = self.dataset[idx][0]
        label = self.dataset[idx][1]
        image =  Image.open(image_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, self.encoder[label]



def evaluate_model(model:nn.Module, test_loader):
    """
    Evaluates the model's performance on a test dataset using accuracy and loss.

    Parameters:
    -----------
    model : nn.Module
        The PyTorch model to evaluate.
    test_loader : DataLoader
        DataLoader object for the test dataset, assumed to return outputs in indices (not one-hot encoded).
    threshold: float
        The minimum accuracy threshold required.
    margin: float
         The acceptable deviation below the threshold within which the model’s accuracy 
    Returns:
    --------
    None

    Raises:
    -------
    AssertionError:
        If the model accuracy falls below the specified margin_accuracy.
    """
    correct_pred = 0
    all_logits = []
    all_outputs = []
    all_preds = []
    with torch.no_grad():
        for inputs, outputs in test_loader:
            inputs, outputs = inputs.to(device), outputs.to(device)

            # Get model predictions
            logits = model(inputs)
            preds = torch.argmax(logits, dim=1)  # Get indices of the predictions
            all_preds.extend(preds.cpu().numpy())
            all_logits.extend(logits.cpu().numpy())
            all_outputs.extend(outputs.cpu().numpy())

            # Calculate metrics
            correct_pred += (preds == outputs).sum().item()

    # Calculate accuracy
    accuracy = 100 * correct_pred / len(all_outputs)
    top_2_accuracy = top_k_accuracy_score(all_outputs, all_logits, k=2) * 100
    mae = mean_absolute_error(all_outputs, all_preds)
    print(f"Test Loss: {mae:.4f}, Accuracy: {accuracy:.2f}%, Top 2 accuracy: {top_2_accuracy:.2f}%")

    return accuracy, top_2_accuracy, mae

@pytest.mark.parametrize("fruit_type, dataset_path,accuracy_threshold, top_2_accuracy_threshold, mae_threshold", [
    ("banana", "test/classification_dataset/banana",0.8, 0.97,0.2),
    ("apple", "test/classification_dataset/apple", 0.8,0.95,0.2),
    ("orange", "test/classification_dataset/orange", 0.85,0.98,0.16),
    ("mango", "test/classification_dataset/mango", 0.92,0.98,0.16),
    ("strawberry", "test/classification_dataset/strawberry", 0.88,0.97,0.1)
 ])
def test_models(fruit_type:str,dataset_path:str, accuracy_threshold:float,top_2_accuracy_threshold:float,mae_threshold:float):
    model = load_model(fruit_type,device)
    encoder = get_encoder(fruit_type)
    dataset = Dataset(dataset_path,encoder, resnet50_transform)
    loader = DataLoader(dataset, batch_size=32)
    print(f'Testing {fruit_type}')
    accuracy, top_2_accuracy,mae = evaluate_model(model, loader)

    assert accuracy >= 100*(accuracy_threshold- 0.03), (
            f"Model accuracy {accuracy:.2f}% is below the threshold of {(accuracy_threshold- 0.03)* 100}%"
    )
    assert top_2_accuracy >= 100*(top_2_accuracy_threshold - 0.01), (
            f"Model accuracy {top_2_accuracy:.2f}% is below the threshold of {(top_2_accuracy_threshold- 0.01)* 100}%"
    )
    assert mae <= mae_threshold, (
            f"mean squared error of {mae} is larger than threshold of {mae_threshold}"
    )
