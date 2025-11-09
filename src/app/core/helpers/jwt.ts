export type DecodedJwt = { [k: string]: any } & {
  exp?: number;
  iat?: number;
};

export const decodeJwt = (token: string): DecodedJwt | null => {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
};

