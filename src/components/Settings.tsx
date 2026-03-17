import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Settings as SettingsIcon } from 'lucide-react';
import { WorkflowManager } from './WorkflowManager';
import { APIConfigurationManagement } from './APIConfigurationManagement';
import { useUser } from '../utils/userContext';

export function Settings() {
  const { currentUser } = useUser();

  // Only DevOps can access settings
  const canEdit = currentUser.role === 'devops';

  if (!canEdit) {
    return (
      <div className="p-8">
        <div className="bg-brand-warning-light border border-brand-warning-mid rounded-lg p-6">
          <p className="text-foreground">You don't have permission to access settings.</p>
          <p className="text-muted-foreground mt-2">Only DevOps team members can configure system settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="size-8 text-brand-primary" />
          <h1 className="text-foreground">Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Configure deployment workflows and API integrations
        </p>
      </div>

      <Tabs defaultValue="apis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="apis">API Configuration</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="apis">
          <APIConfigurationManagement />
        </TabsContent>

        <TabsContent value="workflow">
          <WorkflowManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}