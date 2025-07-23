export interface SupabaseUserMetadata {
  address: string;
  birthDay: string;
  email: string;
  email_verified: boolean;
  fullName: string;
  phoneNumber: string;
  phone_verified: boolean;
  sub: string;
}

export interface SupabaseIdentity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: SupabaseUserMetadata;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface SupabaseUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmation_sent_at: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: SupabaseUserMetadata;
  identities: SupabaseIdentity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface SupabaseSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: SupabaseUser;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  error: any;
  profile: any;
  loading: boolean;
}
