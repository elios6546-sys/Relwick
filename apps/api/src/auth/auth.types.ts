export interface JwtAccessPayload {
  sub: string;
  email: string;
  type: 'access';
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  lastLoginAt: string | null;
}
