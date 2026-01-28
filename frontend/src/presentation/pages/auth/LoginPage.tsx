import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import api from '../../../data/infrastructure/httpClient';
import axios from 'axios';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Factory } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { user, accessToken, refreshToken } = response.data.data;
      
      // Update global store and local storage
      storeLogin(user, accessToken, refreshToken);
      localStorage.setItem('token', accessToken);

      navigate('/');
    } catch (err: unknown) {
      let msg = 'Login failed. Please check your credentials.';
      if (axios.isAxiosError(err) && err.response?.data?.error?.message) {
        msg = err.response.data.error.message;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white" dir="rtl">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-secondary-100">
        <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
               <Factory className="h-7 w-7 text-white" />
            </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-cocoa">ChocoOps</h1>
        <p className="text-center text-secondary-500 mb-8">מערכת ניהול ייצור</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-right block">אימייל</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="manager@chocoops.com"
              required
              className="text-right"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-right block">סיסמה</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="text-right"
              dir="ltr"
            />
          </div>

          <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 h-10" disabled={loading}>
            {loading ? 'מתחבר...' : 'התחבר'}
          </Button>
        </form>
      </div>
      <div className="absolute bottom-4 text-center w-full text-xs text-secondary-400">
        &copy; 2026 ChocoOps Cloud. All rights reserved.
      </div>
    </div>
  );
}
