import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FuturisticCard } from '../../components/ui/FuturisticCard';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { Factory, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Role-to-Route Mapping
  const getDashboardRoute = (role = '') => {
    switch (role.toUpperCase()) {
      case 'WAREHOUSE': return '/inventory';
      case 'PRODUCTION': return '/production';
      case 'QC': return '/qc/dashboard';
      case 'MECHANIC': return '/mechanic/dashboard';
      case 'MANAGER': return '/manager/dashboard';
      case 'ADMIN': return '/ai-dashboard';
      case 'CONTROLLER': return '/manager/dashboard';
      default: return '/';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      // Redirect based on role from the user object in response
      if (response?.user) {
        const redirectPath = getDashboardRoute(response.user.role);
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    setEmail(`${role.toLowerCase()}@chocoops.com`);
    setPassword('password123');
  };

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <FuturisticCard glowColor="gold" intensity="high" className="w-full max-w-md p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative h-16 w-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-2xl">
                  <Factory className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-2">
              ChocoOps Cloud
            </h1>
            <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Next-Gen Chocolate Factory Management
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your.email@chocoops.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-amber-500/40 hover:scale-[1.02]" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Quick Login */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400 text-center mb-3">Quick Demo Login:</p>
            <div className="grid grid-cols-2 gap-2">
              {['Manager', 'Production', 'QC', 'Warehouse'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => quickLogin(role)}
                  className="px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all duration-200 hover:border-amber-500/30"
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 text-center mt-3">Password: password123</p>
          </div>
        </FuturisticCard>
      </div>
    </AnimatedBackground>
  );
};

export default LoginPage;
