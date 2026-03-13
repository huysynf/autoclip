import React, { useState, useEffect } from 'react'
import { Layout, Card, Form, Input, Button, Typography, Space, Alert, Divider, Row, Col, Tabs, message, Select, Tag } from 'antd'
import { KeyOutlined, SaveOutlined, ApiOutlined, SettingOutlined, InfoCircleOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons'
import { settingsApi } from '../services/api'
import BilibiliManager from '../components/BilibiliManager'
import './SettingsPage.css'

const { Content } = Layout
const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [showBilibiliManager, setShowBilibiliManager] = useState(false)
  const [availableModels, setAvailableModels] = useState<any>({})
  const [currentProvider, setCurrentProvider] = useState<any>({})
  const [selectedProvider, setSelectedProvider] = useState('dashscope')

  // Provider Configuration
  const providerConfig = {
    dashscope: {
      name: 'Alibaba Qwen',
      icon: <RobotOutlined />,
      color: '#1890ff',
      description: 'Alibaba Cloud Qwen LLM service',
      apiKeyField: 'dashscope_api_key',
      placeholder: 'Enter Qwen API key'
    },
    openai: {
      name: 'OpenAI',
      icon: <RobotOutlined />,
      color: '#52c41a',
      description: 'OpenAI GPT series models',
      apiKeyField: 'openai_api_key',
      placeholder: 'Enter OpenAI API key'
    },
    gemini: {
      name: 'Google Gemini',
      icon: <RobotOutlined />,
      color: '#faad14',
      description: 'Google Gemini large language model',
      apiKeyField: 'gemini_api_key',
      placeholder: 'Enter Gemini API key'
    },
    siliconflow: {
      name: 'SiliconFlow',
      icon: <RobotOutlined />,
      color: '#722ed1',
      description: 'Error occurred while generating thumbnails:',
      apiKeyField: 'siliconflow_api_key',
      placeholder: 'Please enter SiliconFlowAPI key'
    }
  }

  // Load Data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [settings, models, provider] = await Promise.all([
        settingsApi.getSettings(),
        settingsApi.getAvailableModels(),
        settingsApi.getCurrentProvider()
      ])
      
      setAvailableModels(models)
      setCurrentProvider(provider)
      setSelectedProvider(settings.llm_provider || 'dashscope')
      
      // Settings form initial value
      form.setFieldsValue(settings)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  // SaveConfiguration
  const handleSave = async (values: any) => {
    try {
      setLoading(true)
      await settingsApi.updateSettings(values)
      message.success('ConfigurationSaveSuccess！')
      await loadData() // Reload Data
    } catch (error: any) {
      message.error('SaveFailed: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  // TestAPI key
  const handleTestApiKey = async () => {
    const apiKey = form.getFieldValue(providerConfig[selectedProvider as keyof typeof providerConfig].apiKeyField)
    const modelName = form.getFieldValue('model_name')
    
    if (!apiKey) {
      message.error('Please enter an API key first')
      return
    }

    if (!modelName) {
      message.error('Please select a model first')
      return
    }

    try {
      setLoading(true)
      const result = await settingsApi.testApiKey(selectedProvider, apiKey, modelName)
      if (result.success) {
        message.success('API KeyTestSuccess!')
      } else {
        message.error('API KeyTestFailed:' + (result.error || 'Unknown error'))
      }
    } catch (error: any) {
      message.error('TestFailed: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  // Switch Provider
  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    form.setFieldsValue({ llm_provider: provider })
  }

  return (
    <Content className="settings-page">
      <div className="settings-container">
        <Title level={2} className="settings-title">
          <SettingOutlined />System Settings</Title>
        
        <Tabs defaultActiveKey="api" className="settings-tabs">
          <TabPane tab="AI Model Configuration" key="api">
            <Card title="AI Model Configuration" className="settings-card">
              <Alert
                message="Multi-provider AI support"
                description="The system supports multiple AI model providers. Select the provider and model that best suits your needs."
                type="info"
                showIcon
                className="settings-alert"
              />
              
              <Form
                form={form}
                layout="vertical"
                className="settings-form"
                onFinish={handleSave}
                initialValues={{
                  llm_provider: 'dashscope',
                  model_name: 'qwen-plus',
                  chunk_size: 5000,
                  min_score_threshold: 0.7,
                  max_clips_per_collection: 5
                }}
              >
                {/* CurrentproviderStatus */}
                {currentProvider.available && (
                  <Alert
                    message={`Currently using: ${currentProvider.display_name} - ${currentProvider.model}`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                )}

                {/* ProviderSelect */}
                <Form.Item
                  label="AI Model Provider"
                  name="llm_provider"
                  className="form-item"
                  rules={[{ required: true, message: 'Please AI Model Provider' }]}
                >
                  <Select
                    value={selectedProvider}
                    onChange={handleProviderChange}
                    className="settings-input"
                    placeholder="Please AI Model Provider"
                  >
                    {Object.entries(providerConfig).map(([key, config]) => (
                      <Select.Option key={key} value={key}>
                        <Space>
                          <span style={{ color: config.color }}>{config.icon}</span>
                          <span>{config.name}</span>
                          <Tag color={config.color}>{config.description}</Tag>
                        </Space>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>{/* Dynamic API key input */}<Form.Item
                  label={`${providerConfig[selectedProvider as keyof typeof providerConfig].name} API Key`}
                  name={providerConfig[selectedProvider as keyof typeof providerConfig].apiKeyField}
                  className="form-item"
                  rules={[
                    { required: true, message: 'Please enter an API key' },
                    { min: 10, message: 'API key must be at least 10 characters' }
                  ]}
                >
                  <Input.Password
                    placeholder={providerConfig[selectedProvider as keyof typeof providerConfig].placeholder}
                    prefix={<KeyOutlined />}
                    className="settings-input"
                  />
                </Form.Item>

                {/* ModelSelect */}
                <Form.Item
                  label="Model"
                  name="model_name"
                  className="form-item"
                  rules={[{ required: true, message: 'Please Model' }]}
                >
                  <Select
                    className="settings-input"
                    placeholder="Please Model"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {availableModels[selectedProvider]?.map((model: any) => (
                      <Select.Option key={model.name} value={model.name}>
                        <Space>
                          <span>{model.display_name}</span>
                          <Tag>Max{model.max_tokens} tokens</Tag>
                        </Space>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item className="form-item">
                  <Space>
                    <Button
                      type="default"
                      icon={<ApiOutlined />}
                      className="test-button"
                      onClick={handleTestApiKey}
                      loading={loading}
                    >Test connection</Button>
                  </Space>
                </Form.Item>

                <Divider className="settings-divider" />

                <Title level={4} className="section-title">Model Configuration</Title>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="ModelName"
                      name="model_name"
                      className="form-item"
                    >
                      <Input placeholder="qwen-plus" className="settings-input" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Text block size"
                      name="chunk_size"
                      className="form-item"
                    >
                      <Input 
                        type="number" 
                        placeholder="5000" 
                        addonAfter="chars" 
                        className="settings-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="LowestScore threshold"
                      name="min_score_threshold"
                      className="form-item"
                    >
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="1" 
                        placeholder="0.7" 
                        className="settings-input"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Number of MaxClips per Collection"
                      name="max_clips_per_collection"
                      className="form-item"
                    >
                      <Input 
                        type="number" 
                        placeholder="5" 
                        addonAfter="" 
                        className="settings-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item className="form-item">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    size="large"
                    className="save-button"
                    loading={loading}
                  >
                    SaveConfiguration
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            <Card title="Instructions" className="settings-card">
              <Space direction="vertical" size="large" className="instructions-space">
                <div className="instruction-item">
                  <Title level={5} className="instruction-title">
                    <InfoCircleOutlined /> 1. AI Model Provider
                  </Title>
                  <Paragraph className="instruction-text">The system supports multiple AIModel providers:<br />• <Text strong>Alibaba Qwen</Text>：Get API key from Alibaba Cloud console
                    <br />• <Text strong>OpenAI</Text>：Get API key from platform.openai.com
                    <br />• <Text strong>Google Gemini</Text>：Get API key from ai.google.dev
                    <br />• <Text strong>SiliconFlow</Text>：Get API key from docs.siliconflow.cn
                  </Paragraph>
                </div>
                
                <div className="instruction-item">
                  <Title level={5} className="instruction-title">
                    <InfoCircleOutlined /> 2. Configuration Parameters
                  </Title>
                  <Paragraph className="instruction-text">
                    • <Text strong>Text block size</Text>: Affects ProcessingSpeed ​​and accuracy, 5000chars is recommended<br />
                    • <Text strong>Score threshold</Text>: Only clips with a score higher than this will be retained.<br />
                    • <Text strong>Number of CollectionClips</Text>: Control the clipsCount of each themed collectionsContains</Paragraph>
                </div>
                
                <div className="instruction-item">
                  <Title level={5} className="instruction-title">
                    <InfoCircleOutlined />3. Test connection</Title>
                  <Paragraph className="instruction-text">It is recommended to Test the API key YesNoValid before saving to ensure that the service is running Normally.</Paragraph>
                </div>
              </Space>
            </Card>
          </TabPane>

          <TabPane tab="Bilibili Management" key="bilibili">
            <Card title="Bilibili Account Management" className="settings-card">
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <UserOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                  <Title level={3} style={{ color: '#ffffff', margin: '0 0 8px 0' }}>
                    Bilibili Account Management
                  </Title>
                  <Text type="secondary" style={{ color: '#b0b0b0', fontSize: '16px' }}>
                    Manage your Bilibili accounts with multi-account support and quick uploads
                  </Text>
                </div>
                
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    icon={<UserOutlined />}
                    onClick={() => message.info('Coming soon', 3)}
                    style={{
                      borderRadius: '8px',
                      background: 'linear-gradient(45deg, #1890ff, #36cfc9)',
                      border: 'none',
                      fontWeight: 500,
                      height: '48px',
                      padding: '0 32px',
                      fontSize: '16px'
                    }}
                  >
                    Manage Bilibili Accounts
                  </Button>
                </Space>
                
                <div style={{ marginTop: '32px', textAlign: 'left', maxWidth: '600px', margin: '32px auto 0' }}>
                  <Title level={4} style={{ color: '#ffffff', marginBottom: '16px' }}>
                    Features
                  </Title>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div style={{ 
                      padding: '16px', 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '8px',
                      border: '1px solid #404040'
                    }}>
                      <Text strong style={{ color: '#1890ff' }}>Multi-account Support</Text>
                      <br />
                      <Text type="secondary" style={{ color: '#b0b0b0' }}>Supports Add multiple Bilibili Accounts for easy management and switching</Text>
                    </div>
                    <div style={{ 
                      padding: '16px', 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '8px',
                      border: '1px solid #404040'
                    }}>
                      <Text strong style={{ color: '#52c41a' }}>Secure Login</Text>
                      <br />
                      <Text type="secondary" style={{ color: '#b0b0b0' }}>
                        Cookie-based import avoids risk control, safe and reliable
                      </Text>
                    </div>
                    <div style={{ 
                      padding: '16px', 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '8px',
                      border: '1px solid #404040'
                    }}>
                      <Text strong style={{ color: '#faad14' }}>Quick Upload</Text>
                      <br />
                      <Text type="secondary" style={{ color: '#b0b0b0' }}>Select AccountUpload directly on the ClipDetails page, and the action is simple</Text>
                    </div>
                    <div style={{ 
                      padding: '16px', 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '8px',
                      border: '1px solid #404040'
                    }}>
                      <Text strong style={{ color: '#722ed1' }}>Batch Management</Text>
                      <br />
                      <Text type="secondary" style={{ color: '#b0b0b0' }}>Support Batch upload multiple Clips to improve efficiency</Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabPane>
        </Tabs>{/* Bilibili Management pop-up window */}<BilibiliManager
          visible={showBilibiliManager}
          onClose={() => setShowBilibiliManager(false)}
          onUploadSuccess={() => {
            message.success('Operation successful')
          }}
        />
      </div>
    </Content>
  )
}

export default SettingsPage