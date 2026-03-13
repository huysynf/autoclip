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
      description: 'MediumLoginBilibili Account in the browser',
      content: (
        <div>
          <Alert
            message="Step 1: Log in to Bilibili"
            description="Please make sure you have logged in to Bilibili Account in your browser MediumSuccessLogin"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Card size="small">
            <Paragraph>1. Open browser, visit<Text code>https://www.bilibili.com</Text>
            </Paragraph>
            <Paragraph>2. Click the "Login" Button in the upper right corner</Paragraph>
            <Paragraph>3. Use your Bilibili AccountLogin</Paragraph>
            <Paragraph>4. After ConfirmLogged in successfully, you should see your Username displayed in the upper right corner</Paragraph>
          </Card>
        </div>
      )
    },
    {
      title: 'Open developer tools',
      description: 'Press F12Open browserOn Developer Tools',
      content: (
        <div>
          <Alert
            message="Step 2: Open developer tools"
            description="Use shortcut key Open browser's On-developer tool"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Card size="small">
            <Paragraph>
              <Text strong>Windows/Linux:</Text>According to<Text code>F12</Text>Key</Paragraph>
            <Paragraph>
              <Text strong>Mac:</Text>According to<Text code>Command + Option + I</Text>
            </Paragraph>
            <Paragraph>Or right-click the white space of PageEmpty and select "Inspect" or "Inspect"</Paragraph>
            <Divider />
            <Paragraph type="secondary">The developer tool will turn On on the bottom or right side of the Page, Contains multiple Tags page</Paragraph>
          </Card>
        </div>
      )
    },
    {
      title: 'Switch to NetworkTags',
      description: 'Find the Network (Network) Tags page',
      content: (
        <div>
          <Alert
            message="Step 3: Switch to NetworkTags"
            description="Find the NetworkTags page on Developer Tools Medium"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Card size="small">
            <Paragraph>{/* AddClip modal box */}</Paragraph>
            <Paragraph>2. Click<Text code>Network</Text> Tags
            </Paragraph>
            <Paragraph>Heartbeat pong response received</Paragraph>
            <Divider />
            <Paragraph type="secondary">The NetworkTags page is used to monitor Network requests of web pages, including CookieInfo</Paragraph>
          </Card>
        </div>
      )
    },
    {
      title: 'Refresh Page',
      description: 'RefreshB station Page to capture the request',
      content: (
        <div>
          <Alert
            message="Step 4: Refresh Page"
            description="RefreshB station Page to capture Network requests"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Card size="small">
            <Paragraph>1. Make sure the NetworkTags page is turned On</Paragraph>
            <Paragraph>2. Press<Text code>F5</Text>Or click the browser's RefreshButton</Paragraph>
            <Paragraph>3. Observe the request list that appears in the Network panel Medium</Paragraph>
            <Divider />
            <Paragraph type="secondary">After Refresh, the Network panel will display the AllNetwork request of Medium during the Page loading process.</Paragraph>
          </Card>
        </div>
      )
    },
    {
      title: 'Find Cookie',
      description: 'Find CookieInfo in the request header Medium',
      content: (
        <div>
          <Alert
            message="Step 5: Find CookieInfo"
            description="Find the Cookie field in any request Medium"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Card size="small">
            <Paragraph>1. Find any request in the Network panel Medium (usually Select first)</Paragraph>
            <Paragraph>2. Click on the request and find it in Medium on the right panel<Text code>Headers</Text> Tags
            </Paragraph>
            <Paragraph>3. in<Text code>Request Headers</Text>Generate TitleFailed:<Text code>Cookie</Text>Field</Paragraph>
            <Paragraph>4. The value of the Cookie field is Yes and the complete Cookiechars string you need.</Paragraph>
            <Divider />
            <Paragraph type="secondary">Cookiechars strings are usually very long. Contains multiple key-value pairs, separated by semicolons.</Paragraph>
          </Card>
        </div>
      )
    },
    {
      title: 'CopyCookie',
      description: 'Copy the complete Cookiechars string',
      content: (
        <div>
          <Alert
            message="Step 6: CopyCookie"
            description="Copy the complete string of Cookiechars to the clipboard"
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Card size="small">
            <Paragraph>1. Right-click the value of the Cookie field</Paragraph>
            <Paragraph>2. Select "Copy value" or "Copy value"</Paragraph>
            <Paragraph>3. Or double-click to select Medium to adjust the cookie value, and then press<Text code>Ctrl+C</Text> Copy
            </Paragraph>
            <Divider />
            <Paragraph type="secondary">Copy's Cookiechars string can be pasted directly into AutoClip's CookieInputMedium</Paragraph>
            <Alert
              message="ImportantPrompt"
              description="CookieContains your LoginInfo, please keep it safe and do not share it with others"
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
          <span>CookieGet Guide</span>
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
        >{copied ? 'Copy' : 'Copy example'}</Button>
      ]}
      width={700}
    >
      <div style={{ marginBottom: 16 }}>
        <Alert
          message="CookieImportYes the safest way to log in"
          description="Compared with scanning the QR code to log in, CookieImport will not trigger the risk control mechanism of site B. Yes is the most recommended login method."
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

      <Card size="small" title="CookieFormat example">
        <Paragraph code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
          SESSDATA=your_sessdata_here; bili_jct=your_bili_jct_here; DedeUserID=your_dedeuserid_here; buvid3=your_buvid3_here
        </Paragraph>
        <Paragraph type="secondary" style={{ fontSize: '12px' }}>Note: The actual cookie value will be much longer than this example, the ContainsMore field</Paragraph>
      </Card>
    </Modal>
  )
}

export default CookieHelper

