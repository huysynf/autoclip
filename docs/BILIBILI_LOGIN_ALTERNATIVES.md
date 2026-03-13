# Bilibili Login Alternatives Guide

## Background

QR-code login tends to trigger Bilibili’s risk-control mechanisms, which can cause login failures or account restrictions. To mitigate this, AutoClip provides multiple alternative login methods.

## Supported login methods

### 1. Cookie import login ⭐⭐⭐⭐⭐ (recommended)

**Pros:**

- Does not trigger Bilibili risk control.
- High success rate.
- Simple to operate.
- Good security (encrypted storage locally).

**Cons:**

- Requires manual cookie acquisition.
- Cookies expire and must be refreshed periodically.

**Best for:**

- Daily use.
- Managing multiple accounts.
- Scenarios where avoiding risk control is crucial.

**How to use:**

1. Log into Bilibili in your browser.
2. Press F12 to open DevTools.
3. Switch to the Network tab.
4. Refresh the page and select any request.
5. Copy the `Cookie` header value.
6. Paste it into AutoClip’s cookie input field.

### 2. Username/password login ⭐⭐⭐

**Pros:**

- Straightforward to use.
- No extra tools required.

**Cons:**

- CAPTCHA handling is often required.
- Higher chance of triggering risk control.
- Involves entering sensitive credentials.

**Best for:**

- First-time login for new users.
- Cases where cookie acquisition is difficult.

**How to use:**

1. Enter Bilibili username/phone.
2. Enter password.
3. Set a display nickname (if needed).
4. Click login.

### 3. QR-code login ⭐⭐

**Pros:**

- Simple interaction.
- No password entry.

**Cons:**

- Very likely to trigger Bilibili risk control.
- Lower success rate.
- Requires the Bilibili mobile app.

**Best for:**

- Temporary testing.
- When other methods are not available.

**How to use:**

1. Click “Start QR login”.
2. Scan the QR code with the Bilibili app.
3. Confirm login in the app.

### 4. Third-party login ⭐⭐

**Pros:**

- No need to enter Bilibili username/password.
- Relatively safe.

**Cons:**

- Requires third-party accounts (WeChat/QQ, etc.).
- More complex flow.
- Limited support depending on configuration.

**Best for:**

- Users with WeChat/QQ accounts.
- Users who prefer not to enter Bilibili credentials.

## Recommended strategies

### For everyday use

1. **Primary: Cookie import**
   - Most stable and reliable.
   - Does not trigger risk control.
   - Cookies should be refreshed regularly.

2. **Fallback: Username/password**
   - Use when cookies expire.
   - Be prepared for CAPTCHA challenges.

### For managing many accounts

- Standardize on cookie import for all accounts.
- Create a cookie-refresh process.
- Periodically check account health.

### For onboarding new users

1. Provide a detailed cookie acquisition tutorial.
2. Offer visual, step-by-step guides.
3. Provide one-click copy for instructions/snippets.

## Security notes

### Cookie security

- Cookies are login credentials; keep them secret.
- Never share cookies with others.
- Rotate/refresh cookies regularly.
- Clear cookies when no longer needed.

### Account security

- Avoid logging in on public/shared devices.
- Periodically review account activity.
- Act quickly if you notice anything suspicious.

## Technical implementation

### Backend APIs

```python
# Cookie validation
async def validate_bilibili_cookies(cookies: dict) -> dict:
    """Validate Bilibili cookies via user-info APIs."""
    # Call Bilibili user APIs, return validation result + user info

# Username/password login
async def bilibili_password_login(username: str, password: str) -> dict:
    """Bilibili username/password login."""
    # Handle CAPTCHA + login flow, then return result
```

### Frontend components

```typescript
// Supported login methods
const loginMethods = [
  { id: 'cookie',  name: 'Cookie Import',   recommended: true  },
  { id: 'password',name: 'Username/Password', recommended: true  },
  { id: 'qr',      name: 'QR Login',       recommended: false },
  { id: 'wechat',  name: 'WeChat Login',   recommended: false },
  { id: 'qq',      name: 'QQ Login',       recommended: false }
];
```

## Troubleshooting

### Common issues

1. **Cookie is invalid**
   - Check if the cookie has expired.
   - Ensure cookie format is complete and not truncated.
   - Acquire a fresh cookie from the browser.

2. **Username/password login fails**
   - Verify username and password.
   - Check whether CAPTCHA is required.
   - Prefer cookie import where possible.

3. **QR login times out**
   - Check network connectivity.
   - Ensure your Bilibili app is up to date.
   - Try another login method.

### Debugging tips

1. Check browser console for errors.
2. Inspect network requests and responses.
3. Review backend logs.
4. Use DevTools to inspect payloads and headers.

## Changelog

### v1.0.0

- Added cookie-import login.
- Added username/password login.
- Improved QR-login flow.
- Added login-method selection UI.

### Future work

- Add automatic cookie refresh.
- Support more third-party providers.
- Refine UX flows.
- Strengthen security checks.

## Related docs

- `COOKIE_GETTING_GUIDE.md` – detailed cookie acquisition guide.
- `BILIBILI_API_DOCS.md` – Bilibili API reference.
- `SECURITY_BEST_PRACTICES.md` – security guidelines.

