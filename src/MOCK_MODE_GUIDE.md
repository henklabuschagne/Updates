# Mock Mode Documentation

## Overview

The Software Update Management application now includes a comprehensive **Mock Mode** that allows you to use the entire system without connecting to a backend server. This is perfect for:

- **Demonstrations** - Show the full system functionality without infrastructure setup
- **Development** - Frontend development without backend dependencies
- **Testing** - Test workflows and UI interactions with realistic data
- **Training** - Allow users to explore the system safely with mock data

## Features

### Complete Mock Data

Mock mode includes realistic data for:
- ✅ **8 Users** (DevOps, Delivery, and Client roles)
- ✅ **3 Roles** with proper permissions
- ✅ **5 Versions** with release notes and history
- ✅ **8 Clients** with version assignments and customization flags
- ✅ **6 CRFs** in various states (Pending, Approved, Completed, Failed)
- ✅ **5 Workflow Steps** including custom approval stages
- ✅ **7 API Configurations** for deployment and rollback
- ✅ **5 Deployment Queue Items** at different stages
- ✅ **4 Error Notifications** (resolved and unresolved)
- ✅ **5 Notifications** per user
- ✅ **7 Audit Logs** tracking system changes
- ✅ **3 Bulk Operations** with success/failure tracking
- ✅ **3 CRF Templates** for quick CRF creation
- ✅ **8 API Execution Logs** with performance data
- ✅ **Dashboard Statistics** with realistic metrics
- ✅ **Reporting Data** for all report types

### Full CRUD Operations

All Create, Read, Update, and Delete operations work in mock mode:
- Create new CRFs, clients, versions, workflows, etc.
- Update existing records
- Delete items (they are removed from the mock data store)
- All changes persist in memory during your session

### Realistic Business Logic

Mock mode implements the same business rules as the real API:
- ✅ **Customization Checks** - Clients with `hasCustomizations: true` cannot receive auto-updates
- ✅ **Workflow Approvals** - CRF status updates based on approval progression
- ✅ **Version History** - Client version changes are tracked in history
- ✅ **Audit Logging** - All data modifications are logged automatically
- ✅ **Role-Based Access** - Only DevOps can access certain features
- ✅ **Data Validation** - Proper error handling for invalid operations

## How to Use Mock Mode

### 1. Enabling Mock Mode

Mock mode is **enabled by default** when you first load the application. You'll see:
- A **"Mock Mode"** badge in the system status indicator (top right)
- A toggle switch on the login page

To toggle mock mode:
1. On the login page, use the toggle switch at the top
2. Or click the system status indicator to see mock mode status

### 2. Quick Login (Mock Mode Only)

When mock mode is enabled, the login page shows quick login buttons for:

**DevOps Admin** (`devops_admin`)
- Full system access
- Can configure APIs, manage workflows, deploy updates
- Has access to all features

**Delivery Lead** (`delivery_lead`)
- Limited access to dashboard, versions, workflow, clients, history, reporting
- Cannot configure APIs or system settings
- Focused on deployment and client management

**Acme Corporation Client** (`client_acme`)
- Client role with minimal access
- Can only view versions and their own update history
- Represents a typical client user

### 3. Exploring the Data

After logging in, you can explore:

**Dashboard** - View system overview with live statistics
- Active CRFs, pending approvals, deployment metrics
- Recent activities from audit log
- Upcoming deployments and critical alerts
- Version adoption rates

**Versions** - Manage software versions
- 5 pre-configured versions from 3.0.8 to 3.2.1
- Create new versions, edit existing ones
- View client count per version

**CRF Workflow** - Manage change requests
- 6 sample CRFs in different states
- Approve/reject CRFs through workflow steps
- View deployment status per client

**Clients** - Manage client information
- 8 clients with various version states
- Some marked with customizations (cannot auto-update)
- Update client versions manually

**API Configuration** - Configure deployment APIs (DevOps only)
- 7 pre-configured APIs (4 deployment, 3 rollback)
- Sequential execution order
- Mock execution logs

### 4. Testing Workflows

Try these common workflows in mock mode:

**Create a New CRF:**
1. Go to CRF Workflow
2. Click "New CRF"
3. Select a version and clients
4. Submit the CRF
5. Watch it appear in the pending state

**Approve a CRF:**
1. Find a pending CRF
2. Click to view details
3. Click "Approve" at the current workflow step
4. See the status progress through workflow

**Update Client Version:**
1. Go to Clients
2. Select a client
3. Click "Update Version"
4. Choose a new version
5. View updated version in client list and history

**View Reports:**
1. Go to Reporting
2. Select a report type (Deployment, CRF, Client, System Performance)
3. Set date range
4. View generated report with mock data

### 5. Data Persistence

**During Session:**
- All changes you make are stored in memory
- Data persists as long as the browser tab is open
- Refresh the page to keep your changes

**Resetting Data:**
- Close the browser tab/window
- Or toggle mock mode off and on
- This will reload the original mock data

### 6. Testing with Different Roles

To test role-based access:
1. Log out from the current account
2. Log in as a different user (use quick login buttons)
3. Notice how the available menu items change
4. Try accessing different features based on role

## Mock Users Reference

| Username | Role | Password | Access Level |
|----------|------|----------|--------------|
| `devops_admin` | DevOps | any | Full access to everything |
| `devops_engineer` | DevOps | any | Full access to everything |
| `delivery_lead` | Delivery | any | Dashboard, versions, workflow, clients, history, reporting |
| `delivery_tech` | Delivery | any | Dashboard, versions, workflow, clients, history, reporting |
| `client_acme` | Client | any | Versions and own history only |
| `client_global` | Client | any | Versions and own history only |
| `client_innovate` | Client | any | Versions and own history only |

**Note:** In mock mode, any password will work. The password is only validated in real API mode.

## Switching Between Mock and Real API

### To Switch to Real API Mode:
1. Click the toggle on the login page
2. Or access Settings → Mock Mode Toggle (if available)
3. Application will reload and connect to backend server
4. You'll need valid credentials for real accounts

### To Switch Back to Mock Mode:
1. Click the toggle again
2. Application will reload with mock data
3. Use quick login buttons for instant access

## Technical Details

### Architecture

Mock mode is implemented through:
1. **Mock Data Provider** (`/utils/mockDataProvider.ts`) - Contains all mock data entities
2. **Mock API Client** (`/services/mockApi.ts`) - Mimics real API methods
3. **Mock Mode Context** (`/utils/mockModeContext.tsx`) - Manages mock mode state
4. **API Factory** (`/services/api.ts`) - Conditionally returns mock or real API client

### Data Structure

The mock data store maintains:
- In-memory arrays for each entity type
- Helper methods for ID generation
- Automatic audit logging
- Relationship management (e.g., CRF → Clients)

### Simulated Delays

To provide a realistic experience, mock API calls include:
- **300ms delay** for standard operations (get, create, update, delete)
- **500ms delay** for bulk operations
- **200-500ms delay** for reports and analytics

This simulates network latency and helps identify UI loading states.

## Limitations

While mock mode provides comprehensive functionality, be aware of:

1. **No Server Persistence** - Data only exists in browser memory
2. **No Background Jobs** - Scheduled deployments won't auto-execute
3. **No Real API Calls** - External API configurations won't actually execute
4. **No Email Notifications** - Notification emails are simulated
5. **Single User Session** - Multiple users logged in different tabs share the same data store

## Best Practices

1. **Use Mock Mode for Demos** - No infrastructure setup required
2. **Test UI Flows** - Verify user interactions and workflows
3. **Role Testing** - Quickly switch between users to test permissions
4. **Data Exploration** - Understand data relationships and structures
5. **Frontend Development** - Build UI without backend dependencies

## Troubleshooting

**Q: Changes aren't persisting after refresh**
A: This is expected. Mock data resets on page reload. To keep changes longer, they would need to be saved to localStorage (future enhancement).

**Q: Can't switch to real API mode**
A: Ensure backend server is running and accessible. Check console for connection errors.

**Q: Mock data looks outdated**
A: Toggle mock mode off and on to reload fresh data, or refresh the browser.

**Q: Quick login buttons not showing**
A: Quick login is only available in mock mode. Toggle mock mode on from the login page.

## Summary

Mock mode provides a complete, production-ready demo environment with:
- ✅ Full CRUD operations
- ✅ Realistic business logic
- ✅ Role-based access control
- ✅ Comprehensive data coverage
- ✅ No backend required
- ✅ Instant access via quick login

Perfect for demonstrations, development, testing, and training!
