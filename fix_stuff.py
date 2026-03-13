import re

f1 = '/Users/huysynf/Downloads/autoclip/frontend/src/hooks/useTaskStatus.ts'
with open(f1, 'r') as file:
    content = file.read()
content = content.replace('returnTask.get(taskId);', 'return tasks.get(taskId);')
with open(f1, 'w') as file:
    file.write(content)

f2 = '/Users/huysynf/Downloads/autoclip/frontend/src/pages/SimpleProgressDemo.tsx'
with open(f2, 'r') as file:
    content = file.read()
content = re.sub(r"import\s*\{[^}]*\}\s*from\s*['\"]antd['\"];?", 
                 "import { Layout, Table, Card, Space, Divider, Typography, Button, Tag } from 'antd';", 
                 content)
with open(f2, 'w') as file:
    file.write(content)

f3 = '/Users/huysynf/Downloads/autoclip/frontend/src/pages/SettingsPage.tsx'
with open(f3, 'r') as file:
    content = file.read()
content = content.replace('(option?.children as string)?.toLowerCase()',
                          '(option?.children as unknown as string)?.toLowerCase()')
with open(f3, 'w') as file:
    file.write(content)

print("Done")
