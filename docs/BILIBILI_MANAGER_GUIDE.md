# Bilibili Manager User Guide

## 📋 Feature Overview

The new Bilibili management feature is designed for novice users, providing the simplest and most intuitive account management and submission experience.

## 🎯 Core Features

### 1. Account Management
- **Add Account**: Supports Cookie import method, safe and reliable
- **Multi-account Support**: Can add multiple Bilibili accounts
- **Account Status**: Real-time display of account health status
- **Quick Delete**: One-click deletion of unwanted accounts

### 2. Submission Upload
- **Clip Submission**: Direct submission from clip details page
- **Batch Submission**: Support simultaneous upload of multiple clips
- **Account Selection**: Flexible selection of submission account
- **Category Settings**: Support for all Bilibili categories

## 🚀 Usage Flow

### Step 1: Add Bilibili Account

1. **Enter Settings Page**
   - Click "Settings" in the left navigation bar
   - Select "Bilibili Account Management" tab

2. **Add Account**
   - Click "Manage Bilibili Account" button
   - Select "Account Management" tab
   - Click "Add Account" button

3. **Get Cookie**
   - Open Bilibili website and log in
   - Press F12 to open developer tools
   - Click Network tab
   - Refresh the page
   - Find any request and click to view
   - Find Cookie field in Request Headers
   - Copy Cookie value (excluding "Cookie: " prefix)

4. **Import Account**
   - Enter account nickname (for identification)
   - Paste Cookie content
   - Click "Add Account"

### Step 2: Submit Clips

1. **Select Clip**
   - Enter project details page
   - Find the clip to submit
   - Click "Submit" button on clip card

2. **Configure Submission Information**
   - Select Bilibili account to use
   - Select video category
   - Enter video title
   - Add description and tags (optional)

3. **Start Submission**
   - Click "Start Submission" button
   - System will process submission in background
   - Success notification will appear when submission is complete

## 💡 Usage Tips

### Cookie Acquisition Tips
- **Recommended Browsers**: Chrome, Edge, Firefox
- **Acquisition Location**: Developer Tools → Network → Any Request → Request Headers
- **Format Requirements**: Complete Cookie string, separated by semicolons
- **Validity Period**: Cookies typically valid for 7-30 days, need to re-acquire after expiration

### Account Management Tips
- **Nickname Setting**: Use meaningful nicknames like "Main Account", "Backup Account"
- **Regular Checks**: Recommend regularly checking account status and updating expired Cookies
- **Multi-account Strategy**: Can set up accounts for different purposes like "Test Account", "Official Account"

### Submission Optimization Tips
- **Title Optimization**: Use attractive titles, avoid being too long
- **Category Selection**: Choose appropriate category to improve recommendation effectiveness
- **Tag Settings**: Add relevant tags to increase exposure
- **Batch Submission**: For multiple related clips, can submit in batches

## ⚠️ Precautions

### Security Reminders
- **Cookie Security**: Cookies contain login information, please keep them safe
- **Account Security**: Do not log in on public devices
- **Regular Updates**: Recommend regularly updating Cookies to avoid expiration

### Usage Limitations
- **Upload Restrictions**: Follow Bilibili upload rules and restrictions
- **Content Standards**: Ensure content complies with Bilibili community standards
- **Frequency Control**: Avoid frequent submissions to prevent triggering risk control

### Troubleshooting
- **Invalid Cookie**: Check Cookie format and validity period
- **Upload Failure**: Check network connection and account status
- **Category Error**: Confirm if category ID is correct

## 🔧 Technical Description

### Supported Login Methods
- **Cookie Import** (Recommended): Safest, won't trigger risk control
- **Username/Password Login**: Traditional method, may have verification code
- **QR Code Login**: Requires Bilibili APP, may trigger risk control

### Upload Mechanism
- **Direct API Calls**: Uses official Bilibili API, stable and reliable
- **Chunked Upload**: Supports large file chunked upload
- **Retry Mechanism**: Automatically retries failed uploads
- **Progress Tracking**: Real-time display of upload progress

## 📞 Technical Support

If you encounter problems, you can:
1. Check system logs for detailed error information
2. Check network connection and account status
3. Re-acquire Cookie and update account
4. Contact technical support for assistance

---

*Last Updated: December 2024*
