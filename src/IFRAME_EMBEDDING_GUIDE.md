# Iframe Embedding Configuration

This document explains how the Software Update Management application is configured to support iframe embedding for integration into other internal applications.

## Configuration Summary

The application is **fully configured to allow iframe embedding** with the following settings:

### Backend Configuration

**File**: `/Backend/Program.cs`

The backend middleware explicitly allows iframe embedding by:

1. **Removing X-Frame-Options Header**: The deprecated X-Frame-Options header is removed to prevent blocking
2. **Setting Content-Security-Policy**: The `frame-ancestors *` directive allows embedding from any origin

```csharp
// Allow iframe embedding - remove restrictive frame options
app.Use(async (context, next) =>
{
    // Remove X-Frame-Options to allow iframe embedding
    context.Response.Headers.Remove("X-Frame-Options");
    
    // Set Content-Security-Policy to allow iframe embedding from any origin
    context.Response.Headers.Append("Content-Security-Policy", "frame-ancestors *");
    
    await next();
});
```

### Frontend Configuration

**Component**: `/components/IframeDetector.tsx`

A development-mode detector has been added to help debug iframe integration. This component:
- Detects when the app is running inside an iframe
- Shows a small indicator in development mode (bottom-right corner)
- Logs iframe status to the console
- **Does not interfere with production usage**

The detector is automatically included in the main App.tsx and only shows in development mode.

## Security Considerations

### Current Configuration: Allow All Origins (`frame-ancestors *`)

The current configuration allows embedding from **any origin**. This is suitable for:
- Internal applications within your network
- Development and testing
- Scenarios where the parent application origin is dynamic or unknown

### Recommended for Production: Restrict to Specific Origins

For production environments, consider restricting `frame-ancestors` to specific trusted domains:

```csharp
// Example: Only allow embedding from specific internal domains
context.Response.Headers.Append(
    "Content-Security-Policy", 
    "frame-ancestors https://internal-portal.yourcompany.com https://dashboard.yourcompany.com"
);
```

### Security Best Practices

1. **Restrict Origins**: In production, specify exact origins in `frame-ancestors`
2. **Use HTTPS**: Always use HTTPS for both parent and embedded applications
3. **Authentication**: The app maintains its own authentication even when embedded
4. **Session Management**: User sessions are isolated and secure within the iframe
5. **CORS Configuration**: The backend CORS policy should also include the parent application's origin

## Embedding Instructions

### Basic HTML Embed

To embed this application in your internal app, use a standard iframe:

```html
<iframe 
  src="https://your-update-management-app.com"
  width="100%"
  height="800px"
  frameborder="0"
  allow="clipboard-write; clipboard-read"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
  title="Software Update Management"
>
</iframe>
```

### React Integration

```jsx
import React from 'react';

function ParentApp() {
  return (
    <div className="app-container">
      <h1>Internal Dashboard</h1>
      
      <iframe
        src="https://your-update-management-app.com"
        width="100%"
        height="800px"
        frameBorder="0"
        allow="clipboard-write; clipboard-read"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        title="Software Update Management"
        style={{ border: 'none' }}
      />
    </div>
  );
}
```

### Angular Integration

```typescript
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-embedded-update-manager',
  template: `
    <iframe 
      [src]="iframeUrl"
      width="100%"
      height="800px"
      frameborder="0"
      [attr.allow]="'clipboard-write; clipboard-read'"
      [attr.sandbox]="'allow-scripts allow-same-origin allow-forms allow-popups allow-modals'"
      title="Software Update Management"
    >
    </iframe>
  `
})
export class EmbeddedUpdateManagerComponent {
  iframeUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://your-update-management-app.com'
    );
  }
}
```

## iframe Attributes Explained

### `sandbox` Attribute
The sandbox attribute provides security restrictions. The values allow:
- `allow-scripts`: Required for React to function
- `allow-same-origin`: Allows the iframe to maintain its origin for storage/cookies
- `allow-forms`: Enables form submission (login, CRF creation, etc.)
- `allow-popups`: Allows modal dialogs and popups
- `allow-modals`: Enables alert/confirm dialogs

### `allow` Attribute
Specifies which browser features are permitted:
- `clipboard-write; clipboard-read`: Enables copy/paste functionality

## Communication Between Parent and Iframe

### postMessage API

For advanced integration, you can use the postMessage API to communicate between the parent app and the embedded iframe:

**In the iframe (Software Update Management app)**:
```javascript
// Send message to parent
window.parent.postMessage({
  type: 'CRF_APPROVED',
  crfId: '12345',
  timestamp: new Date().toISOString()
}, '*'); // In production, specify exact parent origin instead of '*'

// Listen for messages from parent
window.addEventListener('message', (event) => {
  // Verify origin in production
  // if (event.origin !== 'https://trusted-parent.com') return;
  
  if (event.data.type === 'NAVIGATE_TO_CRF') {
    // Navigate to specific CRF
    router.navigate(`/crf/${event.data.crfId}`);
  }
});
```

**In the parent application**:
```javascript
// Get reference to iframe
const iframe = document.getElementById('update-management-iframe');

// Send message to iframe
iframe.contentWindow.postMessage({
  type: 'NAVIGATE_TO_CRF',
  crfId: '12345'
}, 'https://your-update-management-app.com');

// Listen for messages from iframe
window.addEventListener('message', (event) => {
  // Verify origin in production
  if (event.origin !== 'https://your-update-management-app.com') return;
  
  if (event.data.type === 'CRF_APPROVED') {
    console.log('CRF approved:', event.data.crfId);
    // Update parent UI accordingly
  }
});
```

## Testing Iframe Integration

### Local Development

1. Start the Software Update Management app:
   ```bash
   npm run dev
   ```

2. Create a test HTML file (`test-iframe.html`):
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <title>Iframe Test</title>
   </head>
   <body>
     <h1>Testing Iframe Embedding</h1>
     <iframe 
       src="http://localhost:5173"
       width="100%"
       height="800px"
       frameborder="0"
     ></iframe>
   </body>
   </html>
   ```

3. Open `test-iframe.html` in your browser (use a local web server to avoid CORS issues)

### Development Indicators

When running in development mode, you'll see:
- A small blue indicator in the bottom-right corner showing "🖼️ Iframe Mode"
- Console logs indicating iframe detection
- Parent origin information (if available)

These indicators automatically disappear in production builds.

## Troubleshooting

### Issue: Blank iframe or "Refused to display" error

**Solutions**:
1. Check that the backend middleware is correctly configured in `Program.cs`
2. Verify no other middleware is setting restrictive headers
3. Check browser console for CSP or frame-options errors
4. Ensure you're using HTTPS in production

### Issue: Authentication not working in iframe

**Solutions**:
1. Check that cookies are set with `SameSite=None; Secure` in production
2. Verify the iframe has `sandbox="allow-same-origin"` attribute
3. Ensure the parent domain is included in CORS configuration

### Issue: Popups or modals not working

**Solutions**:
1. Add `allow-popups` and `allow-modals` to the `sandbox` attribute
2. Check that JavaScript is enabled (`allow-scripts`)

### Issue: Copy/paste not working

**Solutions**:
1. Add `allow="clipboard-write; clipboard-read"` to the iframe
2. Some browsers may require user interaction first

## Deployment Checklist

Before deploying to production:

- [ ] Update `frame-ancestors` in `Program.cs` to restrict to specific domains
- [ ] Configure CORS to include parent application domain
- [ ] Test authentication flow within iframe
- [ ] Verify all modals and popups work correctly
- [ ] Test copy/paste functionality
- [ ] Verify postMessage communication (if implemented)
- [ ] Check mobile responsiveness within iframe
- [ ] Test in all target browsers (Chrome, Firefox, Safari, Edge)
- [ ] Ensure HTTPS is used for both parent and embedded app
- [ ] Review and test CSP headers
- [ ] Document any specific URL parameters or routing requirements

## Additional Resources

- [MDN: iframe element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN: postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [OWASP: Clickjacking Defense](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html)

## Support

For issues or questions about iframe embedding:
1. Check this documentation first
2. Review browser console for error messages
3. Verify backend configuration in `Program.cs`
4. Test with the included IframeDetector component in development mode
