import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export const AuthController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ status: 'error', message: 'Email and password are required' });
      }

      const result = await AuthService.login(email, password);
      
      res.json({
        status: 'success',
        data: result
      });
    } catch (error: any) {
      console.error('[AUTH ERROR]', error.message);
      
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
      }
      
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
