export interface SoftwareVersion {
  id: string;
  version: string;
  releaseDate: string;
  changes: string[];
  criticalFixes: string[];
  knownIssues: string[];
}

export interface Client {
  id: string;
  name: string;
  currentVersion: string;
  environment: 'Production' | 'Staging' | 'Development';
  lastUpdated: string;
  status: 'Up to date' | 'Update pending' | 'Update available';
}

export interface CRFDocument {
  id: string;
  crfNumber: string;
  requestedBy: string;
  clientId: string;
  clientName: string;
  fromVersion: string;
  toVersion: string;
  scheduledDate: string;
  status: 'Draft' | 'Pending App Owner' | 'Pending IT' | 'Approved' | 'Rejected' | 'Completed';
  currentApprover?: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  approvalHistory: ApprovalStep[];
}

export interface ApprovalStep {
  approver: string;
  role: string;
  action: 'Submitted' | 'Approved' | 'Rejected';
  timestamp: string;
  comments: string;
}

export interface UpdateRecord {
  id: string;
  crfNumber: string;
  clientName: string;
  fromVersion: string;
  toVersion: string;
  deployedDate: string;
  deployedBy: string;
  status: 'Success' | 'Failed' | 'Rolled Back' | 'In Progress';
  duration: string;
  errorLog?: string;
}

export interface ErrorReport {
  id: string;
  updateId: string;
  crfNumber: string;
  clientName: string;
  version: string;
  errorType: string;
  errorMessage: string;
  timestamp: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  resolved: boolean;
  rollbackInitiated: boolean;
}

export interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers: Record<string, string>;
  body?: string;
  order: number;
  enabled: boolean;
}

export interface APIConfiguration {
  deploymentAPIs: APIEndpoint[];
  rollbackAPIs: APIEndpoint[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  approverRole: string;
  approverName?: string;
  order: number;
  required: boolean;
  enabled: boolean;
  requiresComment: boolean;
  allowParallelApproval: boolean;
}

export interface WorkflowConfiguration {
  steps: WorkflowStep[];
}

export const softwareVersions: SoftwareVersion[] = [
  {
    id: 'v1',
    version: '3.2.1',
    releaseDate: '2024-11-20',
    changes: [
      'Enhanced security protocols for data encryption',
      'Improved user authentication flow',
      'New dashboard analytics widgets',
      'Performance optimization for large datasets',
      'Updated API endpoints with versioning'
    ],
    criticalFixes: [
      'Fixed memory leak in background sync process',
      'Resolved SQL injection vulnerability in search module'
    ],
    knownIssues: [
      'Minor UI rendering issue on Safari 15.x',
      'Delayed notification delivery in offline mode'
    ]
  },
  {
    id: 'v2',
    version: '3.2.0',
    releaseDate: '2024-10-15',
    changes: [
      'New reporting module with custom templates',
      'Multi-language support (ES, FR, DE)',
      'Integration with third-party CRM systems',
      'Batch processing for bulk operations'
    ],
    criticalFixes: [
      'Fixed data corruption issue in export function'
    ],
    knownIssues: []
  },
  {
    id: 'v3',
    version: '3.1.5',
    releaseDate: '2024-09-10',
    changes: [
      'UI/UX improvements based on user feedback',
      'New email notification templates',
      'Advanced search filters'
    ],
    criticalFixes: [
      'Fixed session timeout issue',
      'Resolved file upload size limitation bug'
    ],
    knownIssues: []
  },
  {
    id: 'v4',
    version: '3.1.0',
    releaseDate: '2024-08-05',
    changes: [
      'Initial release of version 3.1 series',
      'Redesigned admin panel',
      'New user role management system'
    ],
    criticalFixes: [],
    knownIssues: []
  }
];

export const workflowConfiguration: WorkflowConfiguration = {
  steps: [
    {
      id: 'step-1',
      name: 'Request Submission',
      description: 'Initial CRF submission by requestor',
      approverRole: 'Requestor',
      order: 1,
      required: true,
      enabled: true,
      requiresComment: true,
      allowParallelApproval: false
    },
    {
      id: 'step-2',
      name: 'Application Owner Review',
      description: 'Review by application owner for technical feasibility',
      approverRole: 'Application Owner',
      approverName: 'Sarah Johnson',
      order: 2,
      required: true,
      enabled: true,
      requiresComment: false,
      allowParallelApproval: false
    },
    {
      id: 'step-3',
      name: 'Security Review',
      description: 'Security team reviews update for vulnerabilities',
      approverRole: 'Security Team',
      approverName: 'David Park',
      order: 3,
      required: false,
      enabled: true,
      requiresComment: false,
      allowParallelApproval: true
    },
    {
      id: 'step-4',
      name: 'Change Advisory Board',
      description: 'CAB approval for production changes',
      approverRole: 'CAB Chair',
      approverName: 'Lisa Martinez',
      order: 4,
      required: false,
      enabled: false,
      requiresComment: true,
      allowParallelApproval: false
    },
    {
      id: 'step-5',
      name: 'IT Department Sign-off',
      description: 'Final approval from client IT department',
      approverRole: 'IT Manager',
      approverName: 'Mike Chen',
      order: 5,
      required: true,
      enabled: true,
      requiresComment: false,
      allowParallelApproval: false
    }
  ]
};

export const clients: Client[] = [
  {
    id: 'c1',
    name: 'Acme Corporation',
    currentVersion: '3.1.5',
    environment: 'Production',
    lastUpdated: '2024-09-15',
    status: 'Update available'
  },
  {
    id: 'c2',
    name: 'Global Tech Industries',
    currentVersion: '3.2.1',
    environment: 'Production',
    lastUpdated: '2024-11-22',
    status: 'Up to date'
  },
  {
    id: 'c3',
    name: 'Innovate Solutions',
    currentVersion: '3.2.0',
    environment: 'Production',
    lastUpdated: '2024-10-20',
    status: 'Update pending'
  },
  {
    id: 'c4',
    name: 'Enterprise Systems LLC',
    currentVersion: '3.1.0',
    environment: 'Production',
    lastUpdated: '2024-08-10',
    status: 'Update available'
  },
  {
    id: 'c5',
    name: 'Digital Dynamics',
    currentVersion: '3.2.1',
    environment: 'Staging',
    lastUpdated: '2024-11-18',
    status: 'Up to date'
  }
];

export const crfDocuments: CRFDocument[] = [
  {
    id: 'crf1',
    crfNumber: 'CRF-2024-001',
    requestedBy: 'John Smith',
    clientId: 'c1',
    clientName: 'Acme Corporation',
    fromVersion: '3.1.5',
    toVersion: '3.2.1',
    scheduledDate: '2024-12-01',
    status: 'Pending App Owner',
    currentApprover: 'Sarah Johnson (App Owner)',
    createdAt: '2024-11-23',
    updatedAt: '2024-11-23',
    notes: 'Client requested security updates and new dashboard features',
    approvalHistory: [
      {
        approver: 'John Smith',
        role: 'Requestor',
        action: 'Submitted',
        timestamp: '2024-11-23 10:30:00',
        comments: 'Urgent security update needed'
      }
    ]
  },
  {
    id: 'crf2',
    crfNumber: 'CRF-2024-002',
    requestedBy: 'Emily Davis',
    clientId: 'c3',
    clientName: 'Innovate Solutions',
    fromVersion: '3.2.0',
    toVersion: '3.2.1',
    scheduledDate: '2024-11-28',
    status: 'Pending IT',
    currentApprover: 'Mike Chen (IT Manager)',
    createdAt: '2024-11-20',
    updatedAt: '2024-11-22',
    notes: 'Minor version upgrade for bug fixes',
    approvalHistory: [
      {
        approver: 'Emily Davis',
        role: 'Requestor',
        action: 'Submitted',
        timestamp: '2024-11-20 14:20:00',
        comments: 'Client experiencing minor issues'
      },
      {
        approver: 'Sarah Johnson',
        role: 'Application Owner',
        action: 'Approved',
        timestamp: '2024-11-22 09:15:00',
        comments: 'Approved - standard update'
      }
    ]
  },
  {
    id: 'crf3',
    crfNumber: 'CRF-2024-003',
    requestedBy: 'Robert Wilson',
    clientId: 'c4',
    clientName: 'Enterprise Systems LLC',
    fromVersion: '3.1.0',
    toVersion: '3.2.1',
    scheduledDate: '2024-12-10',
    status: 'Approved',
    createdAt: '2024-11-18',
    updatedAt: '2024-11-23',
    notes: 'Major version upgrade - requires extended maintenance window',
    approvalHistory: [
      {
        approver: 'Robert Wilson',
        role: 'Requestor',
        action: 'Submitted',
        timestamp: '2024-11-18 11:00:00',
        comments: 'Client requesting major upgrade'
      },
      {
        approver: 'Sarah Johnson',
        role: 'Application Owner',
        action: 'Approved',
        timestamp: '2024-11-19 10:30:00',
        comments: 'Approved - coordinated with client'
      },
      {
        approver: 'Mike Chen',
        role: 'IT Manager',
        action: 'Approved',
        timestamp: '2024-11-23 08:45:00',
        comments: 'IT resources allocated for deployment'
      }
    ]
  }
];

export const updateHistory: UpdateRecord[] = [
  {
    id: 'u1',
    crfNumber: 'CRF-2024-000',
    clientName: 'Global Tech Industries',
    fromVersion: '3.2.0',
    toVersion: '3.2.1',
    deployedDate: '2024-11-22',
    deployedBy: 'Tech Team',
    status: 'Success',
    duration: '45 minutes'
  },
  {
    id: 'u2',
    crfNumber: 'CRF-2023-098',
    clientName: 'Digital Dynamics',
    fromVersion: '3.1.5',
    toVersion: '3.2.0',
    deployedDate: '2024-11-18',
    deployedBy: 'Alex Martinez',
    status: 'Failed',
    duration: '1 hour 20 minutes',
    errorLog: 'Database migration failed: Timeout error on table user_preferences'
  },
  {
    id: 'u3',
    crfNumber: 'CRF-2023-099',
    clientName: 'Digital Dynamics',
    fromVersion: '3.1.5',
    toVersion: '3.2.0',
    deployedDate: '2024-11-19',
    deployedBy: 'Alex Martinez',
    status: 'Success',
    duration: '55 minutes'
  },
  {
    id: 'u4',
    crfNumber: 'CRF-2023-097',
    clientName: 'Innovate Solutions',
    fromVersion: '3.1.5',
    toVersion: '3.2.0',
    deployedDate: '2024-10-20',
    deployedBy: 'Tech Team',
    status: 'Success',
    duration: '40 minutes'
  },
  {
    id: 'u5',
    crfNumber: 'CRF-2023-095',
    clientName: 'Acme Corporation',
    fromVersion: '3.1.0',
    toVersion: '3.1.5',
    deployedDate: '2024-09-15',
    deployedBy: 'Sarah Chen',
    status: 'Success',
    duration: '50 minutes'
  }
];

export const errorReports: ErrorReport[] = [
  {
    id: 'e1',
    updateId: 'u2',
    crfNumber: 'CRF-2023-098',
    clientName: 'Digital Dynamics',
    version: '3.2.0',
    errorType: 'Database Migration Error',
    errorMessage: 'Timeout error on table user_preferences during migration. Connection to database lost after 60 seconds.',
    timestamp: '2024-11-18 22:35:00',
    severity: 'Critical',
    resolved: true,
    rollbackInitiated: true
  },
  {
    id: 'e2',
    updateId: 'u1',
    crfNumber: 'CRF-2024-000',
    clientName: 'Global Tech Industries',
    version: '3.2.1',
    errorType: 'Warning',
    errorMessage: 'Minor UI rendering delay detected during initial load. Self-resolved after cache clear.',
    timestamp: '2024-11-22 15:10:00',
    severity: 'Low',
    resolved: true,
    rollbackInitiated: false
  }
];

export const apiConfiguration: APIConfiguration = {
  deploymentAPIs: [
    {
      id: 'deploy-1',
      name: 'Pre-deployment Health Check',
      url: 'https://api.example.com/v1/health/check',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      },
      order: 1,
      enabled: true
    },
    {
      id: 'deploy-2',
      name: 'Create Database Backup',
      url: 'https://api.example.com/v1/database/backup',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: '{{CLIENT_ID}}',
        backupType: 'full'
      }, null, 2),
      order: 2,
      enabled: true
    },
    {
      id: 'deploy-3',
      name: 'Stop Application Services',
      url: 'https://api.example.com/v1/services/stop',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: '{{CLIENT_ID}}',
        gracefulShutdown: true
      }, null, 2),
      order: 3,
      enabled: true
    },
    {
      id: 'deploy-4',
      name: 'Deploy New Version',
      url: 'https://api.example.com/v1/deploy',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: '{{CLIENT_ID}}',
        version: '{{VERSION}}',
        environment: '{{ENVIRONMENT}}'
      }, null, 2),
      order: 4,
      enabled: true
    },
    {
      id: 'deploy-5',
      name: 'Run Database Migrations',
      url: 'https://api.example.com/v1/database/migrate',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: '{{CLIENT_ID}}',
        targetVersion: '{{VERSION}}'
      }, null, 2),
      order: 5,
      enabled: true
    },
    {
      id: 'deploy-6',
      name: 'Start Application Services',
      url: 'https://api.example.com/v1/services/start',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: '{{CLIENT_ID}}'
      }, null, 2),
      order: 6,
      enabled: true
    },
    {
      id: 'deploy-7',
      name: 'Post-deployment Verification',
      url: 'https://api.example.com/v1/verify/deployment',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: '{{CLIENT_ID}}',
        version: '{{VERSION}}',
        runTests: true
      }, null, 2),
      order: 7,
      enabled: true
    }
  ],
  rollbackAPIs: [
    {
      id: 'rollback-1',
      name: 'Stop Application Services',
      url: 'https://api.example.com/v1/services/stop',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: '{{CLIENT_ID}}',
        gracefulShutdown: true
      }, null, 2),
      order: 1,
      enabled: true
    },
    {
      id: 'rollback-2',
      name: 'Restore Database Backup',
      url: 'https://api.example.com/v1/database/restore',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: '{{CLIENT_ID}}',
        backupId: '{{BACKUP_ID}}'
      }, null, 2),
      order: 2,
      enabled: true
    },
    {
      id: 'rollback-3',
      name: 'Revert to Previous Version',
      url: 'https://api.example.com/v1/rollback',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: '{{CLIENT_ID}}',
        targetVersion: '{{PREVIOUS_VERSION}}'
      }, null, 2),
      order: 3,
      enabled: true
    },
    {
      id: 'rollback-4',
      name: 'Start Application Services',
      url: 'https://api.example.com/v1/services/start',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: '{{CLIENT_ID}}'
      }, null, 2),
      order: 4,
      enabled: true
    },
    {
      id: 'rollback-5',
      name: 'Verify System Health',
      url: 'https://api.example.com/v1/verify/health',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      },
      order: 5,
      enabled: true
    }
  ]
};