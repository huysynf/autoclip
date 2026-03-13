import React, { useState } from 'react'
import { Modal, Steps, Card, Typography, Alert, Button, Space, Divider, Image } from 'antd'
import { QuestionCircleOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const { Step } = Steps

interface CookieHelperProps {
  visible: boolean
  onClose: () => void
}

const CookieHelper: React.FC<CookieHelperProps> = ({ visible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [copied, setCopied] = useState(false)

  const steps = [
    {
      title: 'Log in to Bilibili',
      description: '在浏览器MediumLoginBilibili Account',
      content: (
        <div>
          <Alert
            message="第一步：Log in to Bilibili"
            description="请确保您已经在浏览器MediumSuccessLogin了Bilibili Account"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Card size="small">
            <Paragraph>
              1. Open browser，访问 <Text code>https://www.bilibili.com</Text>
            </Paragraph>
            <Paragraph>
              2. 点击右上角的"Login"Button
            </Paragraph>
            <Paragraph>
              3. Use 您的Bilibili AccountLogin
            </Paragraph>
            <Paragraph>
              4. ConfirmLogged in successfully后，您应该能看到您的Username显示在右上角
            </Paragraph>
          </Card>
        </div>
      )
    },
    {
      title: 'Open developer tools',
      description: '按F12Open browserOn发者工具',
      content: (
        <div>
          <Alert
            message="第二步：Open developer tools"
            description="Use 快捷键Open browser的On发者工具"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Card size="small">
            <Paragraph>
              <Text strong>Windows/Linux:</Text> 按 <Text code>F12</Text> 键
            </Paragraph>
            <Paragraph>
              <Text strong>Mac:</Text> 按 <Text code>Command + Option + I</Text>
            </Paragraph>
            <Paragraph>
              或者右键点击PageEmpty白处，Select"检查"或"Inspect"
            </Paragraph>
            <Divider />
            <Paragraph type="secondary">
              On发者工具会在Page底部或右侧打On，Contains多Tags页
            </Paragraph>
          </Card>
        </div>
      )
    },
    {
      title: '切换到NetworkTags',
      description: '找到Network（Network）Tags页',
      content: (
        <div>
          <Alert
            message="第三步：切换到NetworkTags"
            description="在On发者工具Medium找到NetworkTags页"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Card size="small">
            <Paragraph>
              1. 在On发者工具顶部找到Tags页
            </Paragraph>
            <Paragraph>
              2. 点击 <Text code>Network</Text> Tags
            </Paragraph>
            <Paragraph>
              3. 确保Network面板YesEmpty的（如果有Content，点击清除Button）
            </Paragraph>
            <Divider />
            <Paragraph type="secondary">
              NetworkTags页用于监控网页的Network请求，包括CookieInfo
            </Paragraph>
          </Card>
        </div>
      )
    },
    {
      title: 'Refresh Page',
      description: 'RefreshB站Page以捕获请求',
      content: (
        <div>
          <Alert
            message="第四步：Refresh Page"
            description="RefreshB站Page以捕获Network请求"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Card size="small">
            <Paragraph>
              1. 确保NetworkTags页已打On
            </Paragraph>
            <Paragraph>
              2. 按 <Text code>F5</Text> 或点击浏览器的RefreshButton
            </Paragraph>
            <Paragraph>
              3. 观察Network面板Medium出现的请求List
            </Paragraph>
            <Divider />
            <Paragraph type="secondary">
              Refresh后，Network面板会显示Page加载过程Medium的AllNetwork请求
            </Paragraph>
          </Card>
        </div>
      )
    },
    {
      title: '找到Cookie',
      description: '在请求头Medium找到CookieInfo',
      content: (
        <div>
          <Alert
            message="第五步：找到CookieInfo"
            description="在任意请求Medium找到Cookie字段"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Card size="small">
            <Paragraph>
              1. 在Network面板Medium找到任意一请求（通常Select第一）
            </Paragraph>
            <Paragraph>
              2. 点击该请求，在右侧面板Medium找到 <Text code>Headers</Text> Tags
            </Paragraph>
            <Paragraph>
              3. 在 <Text code>Request Headers</Text> 部分找到 <Text code>Cookie</Text> 字段
            </Paragraph>
            <Paragraph>
              4. Cookie字段的值就Yes您需要的完整Cookiechars串
            </Paragraph>
            <Divider />
            <Paragraph type="secondary">
              Cookiechars串通常很长，Contains多键值对，用分号分隔
            </Paragraph>
          </Card>
        </div>
      )
    },
    {
      title: 'CopyCookie',
      description: 'Copy完整的Cookiechars串',
      content: (
        <div>
          <Alert
            message="第六步：CopyCookie"
            description="Copy完整的Cookiechars串到剪贴板"
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Card size="small">
            <Paragraph>
              1. 右键点击Cookie字段的值
            </Paragraph>
            <Paragraph>
              2. Select"Copy值"或"Copy value"
            </Paragraph>
            <Paragraph>
              3. 或者双击选Medium整Cookie值，然后按 <Text code>Ctrl+C</Text> Copy
            </Paragraph>
            <Divider />
            <Paragraph type="secondary">
              Copy的Cookiechars串可以直接粘贴到AutoClip的CookieInputMedium
            </Paragraph>
            <Alert
              message="重要Prompt"
              description="CookieContains您的LoginInfo，请妥善保管，不要分享给他人"
              type="warning"
              showIcon
            />
          </Card>
        </div>
      )
    }
  ]

  const handleCopy = () => {
    const cookieExample = "SESSDATA=your_sessdata_here; bili_jct=your_bili_jct_here; DedeUserID=your_dedeuserid_here"
    navigator.clipboard.writeText(cookieExample).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Modal
      title={
        <Space>
          <QuestionCircleOutlined />
          <span>CookieGet 指南</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="copy"
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
        >
          {copied ? '已Copy' : 'Copy示例'}
        </Button>
      ]}
      width={700}
    >
      <div style={{ marginBottom: 16 }}>
        <Alert
          message="CookieImportYes最安全的Login方式"
          description="相比扫码Login，CookieImport不会触发B站的风控机制，Yes最推荐的Login方式。"
          type="success"
          showIcon
        />
      </div>

      <Steps current={currentStep} onChange={setCurrentStep} direction="vertical" size="small">
        {steps.map((step, index) => (
          <Step key={index} title={step.title} description={step.description} />
        ))}
      </Steps>

      <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        {steps[currentStep].content}
      </div>

      <Divider />

      <Card size="small" title="CookieFormat示例">
        <Paragraph code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
          SESSDATA=your_sessdata_here; bili_jct=your_bili_jct_here; DedeUserID=your_dedeuserid_here; buvid3=your_buvid3_here
        </Paragraph>
        <Paragraph type="secondary" style={{ fontSize: '12px' }}>
          注意：实际的Cookie值会比这示例长很多，ContainsMore的字段
        </Paragraph>
      </Card>
    </Modal>
  )
}

export default CookieHelper

