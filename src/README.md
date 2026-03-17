# Software Update Management System

A comprehensive full-stack application for managing software updates through a structured CRF (Change Request Form) workflow with role-based access control, automated deployments, and real-time monitoring.

## 🎯 Project Overview

This system manages the complete lifecycle of client software updates with:
- **CRF Workflow Management** - Customizable approval workflows
- **Version Control** - Track all software versions and release notes
- **Client Management** - Monitor which clients are on which versions
- **Automated Deployments** - API-driven deployment and rollback automation
- **Real-time Monitoring** - System health, deployment status, and error tracking
- **Comprehensive Reporting** - Analytics, compliance reports, and audit trails
- **Role-Based Access** - DevOps, Delivery Team, and Client user roles

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Deployment](#deployment)

## ✨ Features

### Phase 1-3: Core Foundation
- ✅ User authentication and authorization (JWT-based)
- ✅ Role-based access control (DevOps, Delivery, Client)
- ✅ Version management with release notes
- ✅ Client lifecycle management
- ✅ CRF creation and workflow management
- ✅ Customizable approval workflows
- ✅ Client-CRF associations

### Phase 4: Deployment & API Management
- ✅ API configuration management
- ✅ Sequential deployment execution
- ✅ Automated rollback procedures
- ✅ Manual deployment interface
- ✅ Deployment queue management
- ✅ Error notification system
- ✅ API execution logging

### Phase 5: Dashboard & Analytics
- ✅ Real-time dashboard with KPIs
- ✅ CRF workflow analytics
- ✅ Deployment success metrics
- ✅ Client version distribution charts
- ✅ Activity feed
- ✅ Scheduled deployment tracking

### Phase 6: Notifications & Monitoring
- ✅ Real-time notification system
- ✅ Priority-based notifications (Low, Medium, High, Urgent)
- ✅ Audit logging for compliance
- ✅ User activity tracking
- ✅ System health monitoring
- ✅ API performance metrics

### Phase 7: Advanced Features
- ✅ Bulk CRF creation
- ✅ Bulk client operations
- ✅ Advanced search across all entities
- ✅ CRF templates for reusability
- ✅ Bulk deployment operations
- ✅ Scheduled reports

### Phase 8: Production Readiness
- ✅ Comprehensive loading states
- ✅ Empty state components
- ✅ Error boundary for graceful error handling
- ✅ Pagination components
- ✅ Keyboard shortcuts
- ✅ Onboarding tour
- ✅ Offline detection
- ✅ System status indicator
- ✅ Accessibility improvements (WCAG 2.1)

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** React Router v7 (Data Mode)
- **Styling:** Tailwind CSS v4.0
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Charts:** Recharts
- **Animations:** Motion (Framer Motion)
- **Forms:** React Hook Form + Zod
- **State Management:** React Context API
- **HTTP Client:** Fetch API with custom service layer

### Backend
- **Framework:** ASP.NET Core 8.0
- **Language:** C# 12
- **Authentication:** JWT Bearer Tokens
- **ORM:** Dapper (micro-ORM)
- **Architecture:** Repository Pattern
- **API Documentation:** Swagger/OpenAPI

### Database
- **Database:** Microsoft SQL Server
- **Stored Procedures:** Full CRUD operations
- **Migrations:** SQL Scripts (18 migration files)
- **Indexing:** Optimized for performance
- **Audit Trail:** Complete history tracking

## 🏗 Architecture

### Frontend Architecture
```
/components
  /ui               # shadcn/ui components
  *.tsx             # Feature components
/hooks              # Custom React hooks
/services           # API client services
/utils              # Context providers, routes
/styles             # Global styles
```

### Backend Architecture
```
/Backend
  /Controllers      # API endpoints
  /DTOs             # Data Transfer Objects
  /Models           # Domain models
  /Repositories     # Data access layer
  /Services         # Business logic
```

### Database Architecture
```
/Database
  01_CreateTables.sql                      # Users, Roles, Sessions
  02_StoredProcedures_Users.sql           # User management
  03_CreateTables_Phase2.sql              # Versions, Clients
  04_StoredProcedures_Versions.sql        # Version management
  05_StoredProcedures_Clients.sql         # Client management
  06_CreateTables_Phase3.sql              # CRF, Workflows
  07_StoredProcedures_CRF.sql             # CRF operations
  08_StoredProcedures_Workflow.sql        # Workflow management
  09_CreateTables_Phase4.sql              # API, Deployments, Errors
  10_StoredProcedures_APIConfiguration.sql # API config
  11_StoredProcedures_ErrorNotifications.sql # Error handling
  12_StoredProcedures_DeploymentQueue.sql # Deployment queue
  13_CreateTables_Phase5-8.sql            # Advanced features
  14_StoredProcedures_Notifications.sql   # Notifications
  15_StoredProcedures_AuditLog.sql        # Audit logging
  16_StoredProcedures_BulkOperations.sql  # Bulk operations
  17_StoredProcedures_CRFTemplates_AdvancedSearch.sql # Templates & search
  18_StoredProcedures_SystemHealth_Reporting.sql # Monitoring & reports
```

## 📊 Database Schema

### Core Tables
- **Users** - User accounts with authentication
- **Roles** - DevOps, Delivery, Client roles
- **UserSessions** - Active user sessions (JWT)
- **SoftwareVersions** - Software version tracking
- **Clients** - Client information and version assignments
- **ClientVersions** - Version history for clients

### Workflow Tables
- **WorkflowSteps** - Customizable approval steps
- **CRFs** - Change Request Forms
- **CRFClients** - CRF-Client associations
- **CRFApprovals** - Approval workflow tracking
- **DeploymentLogs** - Deployment history

### Deployment & Monitoring Tables
- **APIConfigurations** - Deployment/Rollback API configs
- **APIExecutionLogs** - API call execution history
- **ErrorNotifications** - System error tracking
- **DeploymentQueue** - Queued deployments

### Advanced Feature Tables
- **Notifications** - User notifications
- **AuditLogs** - Complete audit trail
- **BulkOperations** - Bulk operation tracking
- **CRFTemplates** - Reusable CRF templates
- **SystemHealthMetrics** - System monitoring data
- **ReportSchedules** - Scheduled report configurations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- .NET 8.0 SDK
- SQL Server 2019+ or Azure SQL Database
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Database Setup
1. Create database:
```sql
CREATE DATABASE SoftwareUpdateManagement;
```

2. Execute SQL scripts in order:
```bash
# Execute scripts 01-18 in sequence
sqlcmd -S localhost -d SoftwareUpdateManagement -i Database/01_CreateTables.sql
sqlcmd -S localhost -d SoftwareUpdateManagement -i Database/02_StoredProcedures_Users.sql
# ... continue through 18_StoredProcedures_SystemHealth_Reporting.sql
```

3. Seed initial data (optional):
```sql
-- Create default roles
INSERT INTO Roles (RoleName, Description) VALUES 
('DevOps', 'Full system access'),
('Delivery', 'Limited access for delivery team'),
('Client', 'Client-only access');

-- Create default admin user
EXEC sp_CreateUser 
  @Username = 'admin',
  @Email = 'admin@example.com',
  @PasswordHash = '<hashed_password>',
  @FirstName = 'System',
  @LastName = 'Administrator',
  @RoleId = 1;
```

### Backend Setup
1. Update connection string in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SoftwareUpdateManagement;Trusted_Connection=True;"
  },
  "Jwt": {
    "Key": "<your-secret-key>",
    "Issuer": "SoftwareUpdateManagement",
    "Audience": "SoftwareUpdateManagement",
    "ExpirationMinutes": 1440
  }
}
```

2. Build and run:
```bash
cd Backend
dotnet restore
dotnet build
dotnet run
```

API will be available at `https://localhost:5001`

### Frontend Setup
1. Install dependencies:
```bash
npm install
```

2. Update API endpoint in `/services/api.ts` if needed:
```typescript
const API_BASE_URL = 'https://localhost:5001/api';
```

3. Start development server:
```bash
npm run dev
```

Application will be available at `http://localhost:5173`

## 📖 API Documentation

Once the backend is running, access the Swagger UI at:
```
https://localhost:5001/swagger
```

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

#### CRF Management
- `GET /api/crf` - Get all CRFs
- `POST /api/crf` - Create CRF
- `PUT /api/crf/{id}` - Update CRF
- `POST /api/crf/{id}/approve` - Approve CRF step
- `POST /api/crf/{id}/reject` - Reject CRF

#### Client Management
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/{id}/version` - Update client version
- `GET /api/clients/{id}/history` - Get version history

#### Deployments
- `GET /api/deployment-queue` - Get deployment queue
- `POST /api/deployment-queue` - Queue deployment
- `POST /api/deployment-queue/{id}/execute` - Execute deployment
- `POST /api/deployment-queue/{id}/rollback` - Rollback deployment

#### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Unread count
- `PUT /api/notifications/{id}/mark-read` - Mark as read

#### Bulk Operations
- `POST /api/bulk-operations/crfs` - Bulk create CRFs
- `POST /api/bulk-operations/clients/update` - Bulk update clients
- `GET /api/bulk-operations/statistics` - Get statistics

## 👥 User Roles

### DevOps (Full Access)
- All features and functionalities
- API configuration management
- Workflow customization
- User management
- Bulk operations
- System settings
- Audit log access

### Delivery Team (Limited Access)
- View dashboard
- View versions
- CRF workflow (review/approve)
- View clients
- View history
- View reports
- Create CRFs
- View notifications

### Client (Minimal Access)
- View available versions
- View own update history
- View notifications
- No administrative functions

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing (bcrypt)
- Role-based authorization
- Session management
- CORS protection
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF token support
- Audit logging for all actions
- IP address tracking

## 📱 Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Reduced motion support
- High contrast mode support
- Skip to main content link
- Proper ARIA labels

## 🎨 UI/UX Features

- Responsive design (mobile, tablet, desktop)
- Dark mode ready (theme system in place)
- Loading skeletons for all async operations
- Empty state components
- Error boundaries
- Toast notifications
- Confirmation dialogs
- Keyboard shortcuts (⌘/Ctrl + K, ⌘/Ctrl + 1-9)
- Onboarding tour for new users
- Offline detection
- System status indicator

## 📦 Production Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to hosting (Vercel, Netlify, etc.)
# Upload /dist folder
```

### Backend Deployment
```bash
# Publish for production
dotnet publish -c Release -o ./publish

# Deploy to IIS, Azure App Service, or Docker
```

### Database Deployment
- Execute all SQL scripts in order (01-18)
- Configure backup schedule
- Set up monitoring and alerts
- Configure index maintenance jobs

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
dotnet test

# E2E tests
npm run test:e2e
```

## 📄 License

This project is proprietary software. All rights reserved.

## 👨‍💻 Development Team

- **Project Type:** Full-Stack Software Update Management System
- **Development Period:** Phases 1-8 Complete
- **Status:** Production Ready ✅

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check documentation in `/guidelines/Guidelines.md`

---

**Version:** 1.0.0  
**Last Updated:** 2025  
**Status:** ✅ Production Ready - All 8 Phases Complete
