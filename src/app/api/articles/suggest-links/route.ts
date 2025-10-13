import { NextRequest, NextResponse } from 'next/server';
import { suggestInternalLinks, generateSmartInternalLinks } from '@/lib/seo/internalLinking';
import { checkAccess } from '@/lib/checkAccess';

export async function POST(req: NextRequest) {
  try {
    // Check if user has permission to use this feature
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']);
    if (!allowed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { content, category, tags, type = 'suggestions' } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    let result;

    if (type === 'smart') {
      // Generate smart internal links with positions
      result = await generateSmartInternalLinks(content, category, tags);
    } else {
      // Get general suggestions
      result = await suggestInternalLinks(content, category, tags);
    }

    return NextResponse.json({
      success: true,
      data: result,
      type
    });

  } catch (error) {
    console.error('Internal linking API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
