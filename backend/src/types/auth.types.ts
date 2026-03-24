// Shared types between backend and frontend
export interface IUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'WAREHOUSE' | 'PRODUCTION' | 'QC' | 'MECHANIC' | 'CONTROLLER' | 'MANAGER' | 'ADMIN';
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface IJwtPayload {
  id: string;
  email: string;
  role: IUser['role'];
  iat?: number;
  exp?: number;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest extends ILoginRequest {
  name: string;
  role: IUser['role'];
}

export interface IAuthResponse {
  user: Omit<IUser, 'password_hash'>;
  access_token: string;
  refresh_token?: string;
}
