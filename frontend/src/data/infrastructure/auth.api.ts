import api from './httpClient';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('אימייל לא תקין'),
  password: z.string().min(6, 'סיסמה קצרה מדי'),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export const login = async (credentials: LoginCredentials) => {
  const validated = loginSchema.parse(credentials);
  const res = await api.post('/auth/login', validated);
  return res.data.data; // { user, accessToken, refreshToken }
};

export const register = async (data: {
  email: string;
  name: string;
  password: string;
  role: string;
}) => {
  const res = await api.post('/auth/register', data);
  return res.data.data;
};
