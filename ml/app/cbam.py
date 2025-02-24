import torch
from torch import nn
import torchvision


class ChannelAttentionModule(nn.Module):
    """
    Channel Attention Module used in CBAM.

    This module applies channel-wise attention by learning which channels to focus on based on the 
    input feature map.
    
    Attributes:
    -----------
    num_channels : int
        Number of input channels.
    reduction_ratio : int
        Reduction ratio for the intermediate layer in the MLP (default is 16).

    Methods:
    --------
    forward(x: torch.Tensor) -> torch.Tensor
        Forward pass of the channel attention module. Returns a channel attention map.

    """

    def __init__(self, num_channels:int, reduction_ratio:int=16):
        super().__init__()
        self.avg_pool = nn.AdaptiveAvgPool2d(1)  # produce output of shape (num_channels,1,1)
        self.max_pool = nn.AdaptiveMaxPool2d(1)  # produce output of shape (num_channels,1,1)
        self.mlp = nn.Sequential(
            nn.Linear(num_channels, num_channels // reduction_ratio, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(num_channels // reduction_ratio, num_channels, bias=False)

        )
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        # Apply average pooling and max pooling
        avg_pool = self.avg_pool(x).squeeze(-1).squeeze(-1)
        max_pool = self.max_pool(x).squeeze(-1).squeeze(-1)

        avg_attention_map = self.mlp(avg_pool)
        max_attention_map = self.mlp(max_pool)

        attention_map = self.sigmoid(avg_attention_map + max_attention_map).unsqueeze(-1).unsqueeze(-1)

        return attention_map


class SpatialAttentionModule(nn.Module):
    """
    Spatial Attention Module used in CBAM.

    This module applies spatial attention by focusing on regions of interest in the feature map.
    
    Attributes:
    -----------
    kernel_size : int
        Size of the convolutional kernel (default is 7).

    Methods:
    --------
    forward(x: torch.Tensor) -> torch.Tensor
        Forward pass of the spatial attention module. Returns a spatial attention map.
    """

    def __init__(self, kernel_size=7):
        super().__init__()
        self.conv = nn.Conv2d(in_channels=2, out_channels=1, kernel_size=kernel_size, padding=(kernel_size - 1) // 2, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg_pool = torch.mean(x, dim=1, keepdim=True)
        max_pool, _ = torch.max(x, dim=1, keepdim=True)
        concat_conv = self.conv(torch.cat([avg_pool, max_pool], dim=1))
        return self.sigmoid(concat_conv)


class CBAM(nn.Module):
    """
    Convolutional Block Attention Module (CBAM).


    Attributes:
    -----------
    num_channels : int
        Number of input channels.
    kernel_size : int
        Kernel size for the spatial attention module (default is 7).
    reduction_ratio : int
        Reduction ratio for the channel attention module (default is 16).

    Methods:
    --------
    forward(x: torch.Tensor) -> torch.Tensor
        Forward pass of the CBAM, applying channel and spatial attention to the input feature x.

    """

    def __init__(self, num_channels, kernel_size=7, reduction_ratio=16):
        super(CBAM, self).__init__()
        self.channel_attention = ChannelAttentionModule(num_channels, reduction_ratio)
        self.spatial_attention = SpatialAttentionModule(kernel_size)

    def forward(self, x):
        out = x * self.channel_attention(x)
        # Spatial attention
        out = out * self.spatial_attention(out)
        return out


def add_cbam_into_resnet_bottlenecks(model, replace_layers):
    """
    Integrates CBAM modules into specified bottleneck layers of a ResNet model.

    This function inserts a CBAM module into each specified bottleneck layer in the given ResNet 
    model, enhancing feature representation through attention mechanisms. Only layers specified 
    by the `replace_layers` parameter are modified.

    Parameters:
    -----------
    model : nn.Module
        A ResNet model.
    replace_layers : list[int]
        List of layer indices (e.g., [1, 2, 3, 4]) indicating which ResNet layers to augment with CBAM.

    Returns:
    --------
    model : nn.Module
        Modified ResNet model with CBAM modules added to specified bottleneck layers.
    
    """
    for layer_idx in replace_layers:
        layer = getattr(model, f'layer{layer_idx}')
        if isinstance(layer, nn.Sequential):
            for i, bottleneck in enumerate(layer):
                if isinstance(bottleneck, torchvision.models.resnet.Bottleneck):
                    num_channels = bottleneck.conv3.out_channels
                    bottleneck.cbam = CBAM(num_channels)
    return model
