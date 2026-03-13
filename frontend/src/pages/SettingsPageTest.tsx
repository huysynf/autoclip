import React from 'react'
import { Layout, Card, Form, Input, Button, Typography, Space, Alert, Divider, Row, Col } from 'antd'
import { KeyOutlined, SaveOutlined, ApiOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons'
import './SettingsPage.css'

const { Content } = Layout
const { Title, Text, Paragraph } = Typography

const SettingsPageTest: React.FC = () => {
  const [form] = Form.useForm()

  return (
    <Content className="settings-page">
      <div className="settings-container">
        <Title level={2} className="settings-title">
          <SettingOutlined /> System ConfigurationTest
        </Title>
        
        <Card title="API Configuration" className="settings-card">
          <Alert
            message="Configuration description"
            description="Please configure the Tongyi Qianwen API key to EnableAIAutoClip function. You can get the API key in the Alibaba Cloud console."
            type="info"
            showIcon
            className="settings-alert"
          />
          
          <Form
            form={form}
            layout="vertical"
            className="settings-form"
            initialValues={{
              model_name: 'qwen-plus',
              chunk_size: 5000,
              min_score_threshold: 0.7,
              max_clips_per_collection: 5
            }}
          >
            <Form.Item
              label="DashScope API Key"
              name="dashscope_api_key"
              className="form-item"
              rules={[
                { required: true, message: 'Please enter an API key' },
                { min: 10, message: 'API key must be at least 10 characters' }
              ]}
            >
              <Input.Password
                placeholder="Enter Qwen API key"
                prefix={<KeyOutlined />}
                className="settings-input"
              />
            </Form.Item>

            <Form.Item className="form-item">
              <Button
                type="default"
                icon={<ApiOutlined />}
                className="test-button"
              >Test connection</Button>
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
                <InfoCircleOutlined />1. Get API key</Title>
              <Paragraph className="instruction-text">Visit Alibaba Cloud Console → Artificial Intelligence → Tongyi Qianwen → API Key Manage, Create a new API key</Paragraph>
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
      </div>
    </Content>
  )
}

export default SettingsPageTest 