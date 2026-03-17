import { Outlet, Link, useLocation, Navigate } from 'react-router';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  GitBranch, 
  History, 
  Users, 
  Wrench, 
  AlertTriangle,
  RotateCcw,
  Settings as SettingsIcon,
  LogOut,
  Server,
  Bell,
  ListChecks,
  Activity,
  Shield,
  Monitor,
  BarChart3,
  Search,
  CheckSquare,
  FileStack,
  Database
} from 'lucide-react';
import { useUser } from '../utils/userContext';
import { useAuth } from '../utils/authContext';
import { useMockMode } from '../utils/mockModeContext';
import { RoleSwitcher } from './RoleSwitcher';
import { Button } from './ui/button';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { ErrorBoundary } from './ErrorBoundary';
import { SystemStatusIndicator } from './SystemStatusIndicator';
import { Badge } from './ui/badge';
import { DevApiPanel } from './DevApiPanel';

export function Layout() {
  const location = useLocation();
  const { currentUser } = useUser();
  const { isAuthenticated, logout, isLoading } = useAuth();
  const { isMockMode } = useMockMode();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Define navigation items with role restrictions and sections
  const navSections = [
    {
      label: 'Overview',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['devops', 'delivery'] },
        { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['devops', 'delivery', 'client'] },
        { path: '/advanced-search', label: 'Advanced Search', icon: Search, roles: ['devops', 'delivery'] },
      ],
    },
    {
      label: 'Change Management',
      items: [
        { path: '/versions', label: 'Versions', icon: Package, roles: ['devops', 'delivery', 'client'] },
        { path: '/crf/workflow', label: 'CRF Workflow', icon: GitBranch, roles: ['devops', 'delivery'] },
        { path: '/crf-templates', label: 'CRF Templates', icon: FileStack, roles: ['devops', 'delivery'] },
        { path: '/bulk-operations', label: 'Bulk Operations', icon: CheckSquare, roles: ['devops'] },
        { path: '/clients', label: 'Clients', icon: Users, roles: ['devops', 'delivery'] },
      ],
    },
    {
      label: 'Deployments',
      items: [
        { path: '/deployment-queue', label: 'Deployment Queue', icon: ListChecks, roles: ['devops'] },
        { path: '/deployment-logs', label: 'Deployment Logs', icon: FileText, roles: ['devops', 'delivery'] },
        { path: '/error-notifications', label: 'Errors', icon: AlertTriangle, roles: ['devops', 'delivery'] },
        { path: '/history', label: 'History', icon: History, roles: ['devops', 'delivery'] },
        { path: '/my-history', label: 'My History', icon: History, roles: ['client'] },
        { path: '/deploy', label: 'Deploy', icon: Wrench, roles: ['devops'] },
        { path: '/rollback', label: 'Rollback', icon: RotateCcw, roles: ['devops'] },
      ],
    },
    {
      label: 'Administration',
      items: [
        { path: '/reporting', label: 'Reporting', icon: BarChart3, roles: ['devops', 'delivery'] },
        { path: '/system-health', label: 'System Health', icon: Monitor, roles: ['devops'] },
        { path: '/audit-log', label: 'Audit Log', icon: Shield, roles: ['devops'] },
        { path: '/api-config', label: 'API Config', icon: Server, roles: ['devops'] },
        { path: '/settings', label: 'Settings', icon: SettingsIcon, roles: ['devops'] },
      ],
    },
  ];

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background">
        {/* Sidebar — white bg with right border, matching reference image */}
        <aside className="w-64 bg-white border-r border-border flex flex-col h-screen">
          {/* Brand Header */}
          <div className="p-6 border-b border-border">
            <h1 className="text-brand-main font-semibold text-xl">Update Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">{currentUser.name}</p>
          </div>

          {/* Role Switcher */}
          <RoleSwitcher />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navSections.map((section, sIdx) => {
              const visibleItems = section.items.filter(item => item.roles.includes(currentUser.role));
              if (visibleItems.length === 0) return null;
              return (
                <div key={section.label}>
                  {/* Section separator (except before the first section) */}
                  {sIdx > 0 && <div className="my-4 border-t border-border" />}
                  <p className="text-xs text-brand-primary px-4 py-2 uppercase tracking-wider font-medium">
                    {section.label}
                  </p>
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                          active
                            ? 'bg-brand-primary-light text-brand-primary font-medium'
                            : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`}
                        id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Icon className={`size-5 ${active ? 'text-brand-primary' : 'text-muted-foreground'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => logout()}
            >
              <LogOut className="size-5 text-muted-foreground" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
        </main>

        {/* Global Features */}
        <div className="fixed top-4 right-4 z-40">
          <SystemStatusIndicator />
        </div>
        <KeyboardShortcuts />
        <DevApiPanel />
      </div>
    </ErrorBoundary>
  );
}