import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth/jwt';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('session-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyJwtToken(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const { role } = await req.json();
  if (!role) return NextResponse.json({ error: 'Missing role' }, { status: 400 });
  // Prevent superadmin from demoting themselves
  if (id === dbUser.id) {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
  }
  const updated = await prisma.user.update({ where: { id }, data: { role } });
  await prisma.auditLog.create({
    data: {
      userId: dbUser.id,
      action: 'ROLE_CHANGE',
      metadata: { targetUserId: id, newRole: role },
    },
  });
  return NextResponse.json({ success: true, user: updated });
}
