// Simple types for demo purposes
export interface SimpleUser {
  id: string;
  email: string;
  name: string;
}

export interface SimpleSession {
  access_token: string;
  user: SimpleUser;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: SimpleUser | null;
  session: SimpleSession | null;
  error: string | null;
  profile: any;
  loading: boolean;
}

export default AuthState;
