import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-pg-secret-token-key-2026-nobles';

export function signToken(payload: object, expiresIn: any = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
