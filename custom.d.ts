// custom.d.ts

declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

export type userTypes = null | {
  api: {
    _sameOrigin?: boolean | undefined;
    apiURL: string;
    defaultHeaders: {
      [header: string]: string | string[] | undefined;
    };
  };
  app_metadata: {
    provider: string;
    roles: string[];
  };
  aud: string;
  audience?: any;
  confirmed_at: string;
  created_at: string;
  updated_at: string;
  invited_at: string;
  recovery_sent_at: string;
  email: string;
  id: string;
  role: string;
  token?:
    | {
        access_token: string;
        expires_at: string | number;
        expires_in: string | number;
        refresh_token: string;
        token_type: string;
      }
    | undefined;
  url: string;
  user_metadata: {
    avatar_url?: string;
    full_name?: string;
  } | null;
};