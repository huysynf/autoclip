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
            message="Configuration说明"
            description="请Configuration通义千问API密钥以EnableAIAutoClip功能。您可以在阿里云控制台Get API密钥。"
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
              >
                Test连接
              </Button>
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
                  label="文本分块Size"
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
                  label="LowestScore阈值"
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
                  label="每CollectionMaxClip数"
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
                <InfoCircleOutlined /> 1. Get API密钥
              </Title>
              <Paragraph className="instruction-text">
                访问阿里云控制台 → 人工智能 → 通义千问 → API密钥Manage，Create新的API密钥
              </Paragraph>
            </div>
            
            <div className="instruction-item">
              <Title level={5} className="instruction-title">
                <InfoCircleOutlined /> 2. Configuration Parameters
              </Title>
              <Paragraph className="instruction-text">
                • <Text strong>文本分块Size</Text>：影响ProcessingSpeed和精度，建议5000chars<br />
                • <Text strong>Score阈值</Text>：只有High于此分数的clips才会被保留<br />
                • <Text strong>CollectionClip数</Text>：控制每themed collectionsContains的clipsCount
              </Paragraph>
            </div>
            
            <div className="instruction-item">
              <Title level={5} className="instruction-title">
                <InfoCircleOutlined /> 3. Test连接
              </Title>
              <Paragraph className="instruction-text">
                Save前建议先TestAPI密钥YesNoValid，确保服务Normal运行
              </Paragraph>
            </div>
          </Space>
        </Card>
      </div>
    </Content>
  )
}

export default SettingsPageTest 