import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAccess } from '@/lib/checkAccess';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Only SUPERADMIN can change roles
  const ok = await checkAccess(req, ['SUPERADMIN']);
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const { role } = await req.json();
  if (!role) return NextResponse.json({ error: 'Missing role' }, { status: 400 });
  // Prevent self-demotion: re-fetch current user from session/header
  const headerUserId = req.headers.get('x-user-id');
  if (id === headerUserId) {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
  }
  const updated = await prisma.user.update({ where: { id }, data: { role } });
  await prisma.auditLog.create({
    data: {
      userId: headerUserId || 'unknown',
      action: 'ROLE_CHANGE',
      metadata: { targetUserId: id, newRole: role },
    },
  });
  return NextResponse.json({ success: true, user: updated });
}
