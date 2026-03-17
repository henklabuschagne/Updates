import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User } from 'lucide-react';
import { useUser, demoUsers } from '../utils/userContext';
import { Badge } from './ui/badge';

export function RoleSwitcher() {
  const { currentUser, setCurrentUser } = useUser();

  const roleBadgeStyle = (role: string) => {
    switch (role) {
      case 'devops': return 'bg-brand-primary-light text-brand-primary border-0';
      case 'delivery': return 'bg-brand-warning-light text-brand-warning border-0';
      case 'client': return 'bg-brand-success-light text-brand-success border-0';
      default: return '';
    }
  };

  return (
    <div className="px-4 py-3 border-b border-border">
      <div className="flex items-center gap-2 mb-2">
        <User className="size-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Role</span>
      </div>
      <Select 
        value={currentUser.id} 
        onValueChange={(userId) => {
          const user = demoUsers.find(u => u.id === userId);
          if (user) setCurrentUser(user);
        }}
      >
        <SelectTrigger className="w-full text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {demoUsers.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center gap-2">
                <span>{user.name}</span>
                <Badge className={`text-xs ${roleBadgeStyle(user.role)}`}>
                  {user.role}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}