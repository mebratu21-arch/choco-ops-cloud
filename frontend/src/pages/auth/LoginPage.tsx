import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Factory } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      
      if (!response || !response.user) {
        throw new Error('Login failed: No user data received');
      }

      const { user } = response;
      // authService automatically stores tokens and user in authStore
      
      // Role-Based Redirects
      const role = user.role.toUpperCase();
      switch (role) {
        case 'ADMIN':
        case 'MANAGER':
          navigate('/manager/dashboard');
          break;
        case 'MECHANIC':
          navigate('/mechanic/dashboard');
          break;
        case 'PRODUCTION':
        case 'OPERATOR':
        case 'PRODUCTION_WORKER':
          navigate('/production/dashboard');
          break;
        case 'QC':
        case 'QUALITY_CONTROLLER':
          navigate('/qc/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <div className="h-12 w-12 bg-amber-500 rounded-full flex items-center justify-center text-white">
                <Factory className="h-6 w-6" />
             </div>
          </div>
          <CardTitle>ChocoOps Cloud</CardTitle>
          <CardDescription>Enter your credentials to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@chocoops.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button className="w-full bg-amber-600 hover:bg-amber-700" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>Demo Credentials:</p>
            <p>admin@chocoops.com / password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
