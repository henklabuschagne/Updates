import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Lock, User, Database, Shield, Truck, Building2 } from 'lucide-react';
import { useAuth } from '../utils/authContext';
import { useMockMode } from '../utils/mockModeContext';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isMockMode } = useMockMode();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (mockUsername: string) => {
    setUsername(mockUsername);
    setPassword('any_password');
    setIsLoading(true);
    
    try {
      await login(mockUsername, 'any_password');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsLoading(false);
    }
  };

  const roleCards = [
    {
      username: 'devops_admin',
      title: 'DevOps Admin',
      description: 'Full system management and deployment control',
      icon: Shield,
      permissions: [
        'Manage all CRFs and deployments',
        'Configure API endpoints',
        'Access audit logs & system health',
        'Bulk operations & rollbacks',
      ],
    },
    {
      username: 'delivery_lead',
      title: 'Delivery Lead',
      description: 'Oversee client delivery and change requests',
      icon: Truck,
      permissions: [
        'View dashboard & reporting',
        'Manage CRF workflow',
        'Track deployment logs',
        'Client version monitoring',
      ],
    },
    {
      username: 'client_acme',
      title: 'Acme Corporation',
      description: 'Client portal for version tracking',
      icon: Building2,
      permissions: [
        'View assigned versions',
        'Track update history',
        'Receive notifications',
        'Read-only access',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-primary-light to-brand-secondary-light p-4">
      <div className="w-full max-w-5xl space-y-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl text-brand-main mb-2">Software Update Management</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        {/* Mock Mode — Role Selection Cards */}
        {isMockMode ? (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              {roleCards.map((role) => {
                const Icon = role.icon;
                return (
                  <Card
                    key={role.username}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-brand-primary"
                    onClick={() => !isLoading && handleQuickLogin(role.username)}
                  >
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 w-16 h-16 bg-brand-primary-light rounded-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-brand-primary" />
                      </div>
                      <CardTitle>{role.title}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        {role.permissions.map((perm, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-brand-success mt-0.5">*</span>
                            {perm}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-6" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : `Login as ${role.title}`}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {error && (
              <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          /* Standard Login Form */
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-brand-main mb-2">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="p-4 bg-brand-primary-light rounded-lg border border-brand-secondary">
                  <p className="text-sm font-medium text-brand-main mb-2">Demo Accounts:</p>
                  <div className="text-xs text-brand-primary space-y-1">
                    <p><strong>DevOps:</strong> sarah.devops / Admin@123</p>
                    <p><strong>Delivery:</strong> mike.delivery / Admin@123</p>
                    <p><strong>Client:</strong> acme.client / Admin@123</p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}