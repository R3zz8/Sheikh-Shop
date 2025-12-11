// src/lib/auth/withRole.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { getUserFromRequest } from './utils';
import { JWTPayload } from './jwt';

type AuthenticatedHandler = (req: NextRequest, user: JWTPayload) => Promise<NextResponse>;

export function withRole(requiredRole: UserRole) {
  return (handler: AuthenticatedHandler): ((req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest): Promise<NextResponse> => {
      const user = await getUserFromRequest(req);

      if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      const hasPermission = user.role === requiredRole || user.role === UserRole.SUPERADMIN;

      if (!hasPermission) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      return handler(req, user);
    };
  };
}
