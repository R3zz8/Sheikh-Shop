import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAccess } from '@/lib/checkAccess';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
      return NextResponse.json({ error: 'You are not authorized to perform this action.' }, { status: 403 });
    }

    const { id } = await context.params;
    await prisma.video.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
