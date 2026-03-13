# Multi-Model Provider Integration Guide

## 🎯 Feature Overview

The system now supports multiple AI model providers, allowing users to choose different service providers and models based on their needs, enabling more flexible AI auto-clipping functionality.

## 🏗️ Architecture Design

### Supported Providers

| Provider | Display Name | Main Models | Features |
|----------|--------------|-------------|----------|
| `dashscope` | Alibaba Tongyi Qianwen | qwen-plus, qwen-max, qwen-turbo | Stable domestic access, good Chinese understanding |
| `openai` | OpenAI | gpt-3.5-turbo, gpt-4, gpt-4-turbo | Global leader, powerful features |
| `gemini` | Google Gemini | gemini-2.5-flash, gemini-1.5-pro | Multimodal support, long context |
| `siliconflow` | SiliconFlow | Qwen2.5 series, DeepSeek-V2.5 | Cost-effective, domestically produced |

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Settings Page                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Provider    │  │ API Key     │  │  Model      │         │
│  │ Selection   │  │ Input       │  │  Selection  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API Service                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Settings    │  │ Connection  │  │ Model Query │         │
│  │ Management  │  │ Test API    │  │ API         │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   LLM Manager                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Provider    │  │ Unified     │  │ Config      │         │
│  │ Factory     │  │ Interface   │  │ Management  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Specific Provider Implementation          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ DashScope   │  │   OpenAI    │  │   Gemini    │         │
│  │  Provider   │  │  Provider   │  │  Provider   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐                                           │
│  │SiliconFlow  │                                           │
│  │  Provider   │                                           │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Run dependency installation script
python install_llm_dependencies.py

# Or install manually
pip install openai>=1.0.0 google-generativeai>=0.3.0 requests>=2.25.0 dashscope>=1.10.0
```

### 2. Start System

```bash
# Start backend service
python backend/main.py

# Start frontend service
cd frontend && npm run dev
```

### 3. Configure API Keys

1. Access system settings page
2. Select AI model provider
3. Enter corresponding API key
4. Select model
5. Test connection
6. Save configuration

## 📋 Detailed Configuration Instructions

### Alibaba Tongyi Qianwen (DashScope)

**Get API Key:**
1. Visit [Alibaba Cloud Console](https://dashscope.console.aliyun.com/)
2. Enable Tongyi Qianwen service
3. Create API key

**Supported Models:**
- `qwen-plus`: Tongyi Qianwen Plus (Recommended)
- `qwen-max`: Tongyi Qianwen Max (Best performance)
- `qwen-turbo`: Tongyi Qianwen Turbo (Fast response)

### OpenAI

**Get API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Register account and add credits
3. Create API key

**Supported Models:**
- `gpt-3.5-turbo`: GPT-3.5 Turbo (Cost-effective)
- `gpt-4`: GPT-4 (High quality)
- `gpt-4-turbo`: GPT-4 Turbo (Latest and strongest)

### Google Gemini

**Get API Key:**
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Login with Google account
3. Create API key

**Supported Models:**
- `gemini-2.5-flash`: Gemini 2.5 Flash (Fast)
- `gemini-1.5-pro`: Gemini 1.5 Pro (High quality)
- `gemini-1.5-flash`: Gemini 1.5 Flash (Balanced)

### SiliconFlow

**Get API Key:**
1. Visit [SiliconFlow Console](https://cloud.siliconflow.cn/)
2. Register account
3. Create API key

**Supported Models:**
- `Qwen/Qwen2.5-7B-Instruct`: Qwen2.5-7B
- `Qwen/Qwen2.5-14B-Instruct`: Qwen2.5-14B
- `Qwen/Qwen2.5-32B-Instruct`: Qwen2.5-32B
- `deepseek-ai/DeepSeek-V2.5`: DeepSeek-V2.5

## 🔧 Technical Implementation

### Core Components

#### 1. LLMProvider Abstract Base Class

```python
class LLMProvider(ABC):
    @abstractmethod
    def call(self, prompt: str, input_data: Any = None, **kwargs) -> LLMResponse:
        """Call model API"""
        pass
    
    @abstractmethod
    def test_connection(self) -> bool:
        """Test API connection"""
        pass
    
    @abstractmethod
    def get_available_models(self) -> List[ModelInfo]:
        """Get available model list"""
        pass
```

#### 2. Provider Factory

```python
class LLMProviderFactory:
    _providers = {
        ProviderType.DASHSCOPE: DashScopeProvider,
        ProviderType.OPENAI: OpenAIProvider,
        ProviderType.GEMINI: GeminiProvider,
        ProviderType.SILICONFLOW: SiliconFlowProvider,
    }
    
    @classmethod
    def create_provider(cls, provider_type: ProviderType, api_key: str, model_name: str, **kwargs) -> LLMProvider:
        """Create provider instance"""
        pass
```

#### 3. LLM Manager

```python
class LLMManager:
    def __init__(self, settings_file: Optional[Path] = None):
        """Initialize manager"""
        pass
    
    def set_provider(self, provider_type: ProviderType, api_key: str, model_name: str):
        """Set provider"""
        pass
    
    def call(self, prompt: str, input_data: Any = None, **kwargs) -> str:
        """Call LLM"""
        pass
```

### API Interfaces

#### Settings Management

```http
GET /api/v1/settings
POST /api/v1/settings
```

#### Connection Testing

```http
POST /api/v1/settings/test-api-key
```

#### Model Query

```http
GET /api/v1/settings/available-models
GET /api/v1/settings/current-provider
```

## 🎨 Frontend Interface

### Settings Page Features

1. **Provider Selection**: Dropdown to select AI model provider
2. **API Key Input**: Dynamic display of corresponding provider's key input field
3. **Model Selection**: Show available models based on selected provider
4. **Connection Test**: Test if API key and model are available
5. **Status Display**: Show currently used provider and model

### Interface Features

- Responsive design, supports different screen sizes
- Dark theme, matches overall system style
- Real-time status feedback, immediate display of operation results
- Detailed usage instructions and help information

## 🔍 Troubleshooting

### Common Issues

#### 1. Invalid API Key

**Symptoms**: Connection test fails, shows "Invalid API Key"

**Solutions**:
- Check if API key is correctly copied
- Confirm if API key is activated
- Check if account balance is sufficient

#### 2. Network Connection Issues

**Symptoms**: Connection timeout or network errors

**Solutions**:
- Check network connection
- Confirm firewall settings
- Try using proxy (if needed)

#### 3. Model Unavailable

**Symptoms**: Selected model cannot be used

**Solutions**:
- Check if model name is correct
- Confirm if account has permission to use the model
- Try switching to other available models

#### 4. Dependency Package Issues

**Symptoms**: Import errors or functional abnormalities

**Solutions**:
```bash
# Reinstall dependencies
python install_llm_dependencies.py

# Or install manually
pip install --upgrade openai google-generativeai requests dashscope
```

### Log Viewing

The system records detailed logs in the following locations:

- Backend logs: `logs/backend.log`
- Frontend logs: Browser developer tools console

## 🚀 Extension Development

### Adding New Providers

1. **Create Provider Class**:
```python
class NewProvider(LLMProvider):
    def __init__(self, api_key: str, model_name: str, **kwargs):
        super().__init__(api_key, model_name, **kwargs)
    
    def call(self, prompt: str, input_data: Any = None, **kwargs) -> LLMResponse:
        # Implement API call logic
        pass
    
    def test_connection(self) -> bool:
        # Implement connection test logic
        pass
    
    def get_available_models(self) -> List[ModelInfo]:
        # Return available model list
        pass
```

2. **Register to Factory**:
```python
# Add in llm_providers.py
class LLMProviderFactory:
    _providers = {
        # ... existing providers
        ProviderType.NEW_PROVIDER: NewProvider,
    }
```

3. **Update Frontend Configuration**:
```typescript
// Add in SettingsPage.tsx
const providerConfig = {
  // ... existing configuration
  new_provider: {
    name: 'New Provider',
    icon: <RobotOutlined />,
    color: '#ff4d4f',
    description: 'New provider description',
    apiKeyField: 'new_provider_api_key',
    placeholder: 'Please enter new provider API key'
  }
}
```

## 📊 Performance Comparison

| Provider | Response Speed | Chinese Understanding | Cost | Stability | Recommended Scenario |
|----------|----------------|----------------------|------|-----------|---------------------|
| Alibaba Tongyi Qianwen | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Chinese content processing |
| OpenAI | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | High quality requirements |
| Google Gemini | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Multimodal needs |
| SiliconFlow | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Cost-effectiveness priority |

## 🎯 Best Practices

1. **Choose Appropriate Provider**: Select the most suitable provider based on specific needs
2. **Regular Connection Testing**: Ensure API keys and models are always available
3. **Monitor Usage**: Avoid exceeding quota limits
4. **Backup Configuration**: Regularly backup API keys and configuration information
5. **Secure Storage**: Do not hardcode API keys in code

## 📞 Technical Support

If you encounter problems during use, you can get help through the following methods:

1. Check system log files
2. Review API provider official documentation
3. Contact technical support team

---

**Note**: Please keep your API keys safe and do not expose them in public places or insecure environments. It is recommended to rotate API keys regularly to ensure security.
