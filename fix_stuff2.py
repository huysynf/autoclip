import re

f2 = '/Users/huysynf/Downloads/autoclip/frontend/src/pages/SimpleProgressDemo.tsx'
with open(f2, 'r') as file:
    content = file.read()
content = re.sub(r"import\s*\{\s*Layout,\s*Table,\s*Card,\s*Space,\s*Divider,\s*Typography,\s*Button,\s*Tag\s*\}\s*from\s*['\"]antd['\"];?", 
                 "import { Layout, Table, Card, Space, Divider, Typography, Button, Tag, Row, Col, Input, message, Select } from 'antd';", 
                 content)
with open(f2, 'w') as file:
    file.write(content)

print("Done")
