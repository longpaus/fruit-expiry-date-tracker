import torch
from torch import nn
from torchvision import models, transforms
from app.cbam import add_cbam_into_resnet_bottlenecks


apple_decoder = {0:'expired',1:'1-5 days',2:'6-10 days', 3:'11-15 days', 4:'16-20 days'}
banana_decoder = {0:'expired',1:'1-2 days',2:'3-4 days',3:'5-7 days', 4:'8-10 days'}
strawberry_decoder = {0:'expired',1:'1-2 days',2:'3-4 days',3:'5-7 days', 4:'8-10 days'}
mango_decoder = {0:'expired', 1:'1-2 days', 2:'3-6 days', 3:'7-10 days'}
orange_decoder = {0:'expired', 1:'0-1 days', 2:'2-5 days', 3:'6-9 days', 4:'10-14 days' }

apple_encoder = {'expired': 0, '1-5': 1, '6-10': 2, '11-15': 3, '16-20': 4}
banana_encoder = {'expired': 0, '1-2': 1, '3-4': 2, '5-7': 3, '8-10': 4}
strawberry_encoder = {'expired': 0, '1-2': 1, '3-4': 2, '5-7': 3, '8-10': 4}
mango_encoder = {'expired': 0, '1-2': 1, '3-6': 2, '7-10': 3}
orange_encoder = {'expired': 0, '0-1': 1, '2-5': 2, '6-9': 3, '10-14': 4}

model_info = {
    "apple": {"path": "app/models/apple_model.pth", "decoder": apple_decoder, "encoder": apple_encoder},
    "banana": {"path": "app/models/banana_model.pth", "decoder": banana_decoder,"encoder": banana_encoder},
    "orange": {"path": "app/models/orange_model.pth", "decoder": orange_decoder,"encoder": orange_encoder},
    "strawberry": {"path": "app/models/strawberry_model.pth", "decoder": strawberry_decoder,"encoder": strawberry_encoder},
    "mango": {"path": "app/models/mango_model.pth", "decoder": mango_decoder,"encoder": mango_encoder}
}

# Image transformations (shared across all models)
resnet50_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Create ResNet50 with a modified final layer
def create_resnet50_model(num_classes=5, seed=42):
    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    torch.manual_seed(seed)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(in_features=in_features,out_features=num_classes,bias=True)
    )
    return model

# General model setup and loading function
def load_model(fruit_type:str, device:torch.device) -> nn.Module:
    """
    Parameters:
    -----------
    fruit_type : str
        The type of fruit for which to load the model (e.g., 'apple', 'banana', etc.).
        This must match one of the keys in `model_info`
    
    device : torch.device
        The device on which to load the model (e.g., `torch.device('cpu')` or 
        `torch.device('cuda')` for GPU).

    Returns:
    --------
    model : torch.nn.Module
        The ResNet50 model configured with the specified number of output classes 
        (based on the length of the decoder) and loaded with weights from the specified 
        file path. The model is set to evaluation mode.
    """
    model_path = model_info[fruit_type]["path"]
    decoder = model_info[fruit_type]["decoder"]
    model = create_resnet50_model(num_classes=len(decoder))
    model = add_cbam_into_resnet_bottlenecks(model, [1,2,3,4])
    model.load_state_dict(
        torch.load(model_path, map_location=device, weights_only=True)
    )
    model.to(device)
    model.eval()  # Set the model to evaluation mode
    return model

def get_decoder(fruit_type:str):
    """
    Parameters:
    -----------
    fruit_type : str
        The type of fruit for which to load the model (e.g., 'apple', 'banana', etc.).
        This must match one of the keys in `model_info`
    Returns:
    -----------
    decoder: Dict[str, int]
        A dictionary that maps model output indices to human-readable labels (e.g., 
        ripeness stages). This dictionary is used to interpret model predictions.
    """
    return model_info[fruit_type]["decoder"]
def get_encoder(fruit_type:str):
    return model_info[fruit_type]["encoder"]

