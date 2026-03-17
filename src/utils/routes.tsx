import { createBrowserRouter } from "react-router";
import { RootProviders } from "../components/RootProviders";
import { Layout } from "../components/Layout";
import { Dashboard } from "../components/Dashboard";
import { VersionManagementEnhanced } from "../components/VersionManagementEnhanced";
import { CRFForm } from "../components/CRFForm";
import { CRFWorkflow } from "../components/CRFWorkflow";
import { UpdateHistory } from "../components/UpdateHistory";
import { ClientManagement } from "../components/ClientManagement";
import { ManualDeployment } from "../components/ManualDeployment";
import { EnhancedReporting } from "../components/EnhancedReporting";
import { RollbackManagement } from "../components/RollbackManagement";
import { Settings } from "../components/Settings";
import { ClientHistory } from "../components/ClientHistory";
import { Login } from "../components/Login";
import { APIConfigurationManagement } from "../components/APIConfigurationManagement";
import { ErrorNotificationManagement } from "../components/ErrorNotificationManagement";
import { DeploymentQueueManagement } from "../components/DeploymentQueueManagement";
import { AuditLog } from "../components/AuditLog";
import { SystemHealth } from "../components/SystemHealth";
import { NotificationCenter } from "../components/NotificationCenter";
import { BulkOperations } from "../components/BulkOperations";
import { AdvancedSearch } from "../components/AdvancedSearch";
import { CRFTemplates } from "../components/CRFTemplates";
import { DeploymentLogs } from "../components/DeploymentLogs";
import { CRFApprovalHistory } from "../components/CRFApprovalHistory";

export const router = createBrowserRouter([
  {
    Component: RootProviders,
    children: [
      {
        path: "/login",
        Component: Login,
      },
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "versions", Component: VersionManagementEnhanced },
          { path: "crf/new", Component: CRFForm },
          { path: "crf/workflow", Component: CRFWorkflow },
          { path: "crf/approval-history", Component: CRFApprovalHistory },
          { path: "history", Component: UpdateHistory },
          { path: "clients", Component: ClientManagement },
          { path: "deployment-queue", Component: DeploymentQueueManagement },
          { path: "deployment-logs", Component: DeploymentLogs },
          { path: "error-notifications", Component: ErrorNotificationManagement },
          { path: "api-config", Component: APIConfigurationManagement },
          { path: "deploy", Component: ManualDeployment },
          { path: "reporting", Component: EnhancedReporting },
          { path: "rollback", Component: RollbackManagement },
          { path: "settings", Component: Settings },
          { path: "my-history", Component: ClientHistory },
          { path: "audit-log", Component: AuditLog },
          { path: "system-health", Component: SystemHealth },
          { path: "notifications", Component: NotificationCenter },
          { path: "bulk-operations", Component: BulkOperations },
          { path: "advanced-search", Component: AdvancedSearch },
          { path: "crf-templates", Component: CRFTemplates },
        ],
      },
    ],
  },
]);