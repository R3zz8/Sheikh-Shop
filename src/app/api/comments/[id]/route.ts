import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import { z } from 'zod';

// Validation schemas
const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long').optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

// Security: RBAC function to check user permissions for comment moderation
async function checkCommentModerationPermissions(allowedRoles: string[] = ['SUPERADMIN', 'ADMIN', 'EDITOR', 'MODERATOR']) {
  try {
    const userId = await getCurrentUserId();
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new Error(`Insufficient permissions. Required roles: ${allowedRoles.join(', ')}. Your role: ${user.role}`);
    }

    return user;
  } catch (error) {
    if (error instanceof Error && error.message.includes('No authentication token found')) {
      throw new Error('Authentication required. Please log in.');
    }
    throw error;
  }
}

// Check if user can modify specific comment (ownership or admin privileges)
async function canModifyComment(commentId: string, userId: string, userRole: string): Promise<boolean> {
  if (['SUPERADMIN', 'ADMIN', 'EDITOR', 'MODERATOR'].includes(userRole)) {
    return true; // Admins, editors, and moderators can modify any comment
  }
  
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });
  
  return comment?.authorId === userId; // Users can only modify their own comments
}

// GET /api/comments/[id] - Get specific comment
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        article: {
          select: {
            id: true,
            title: true,
            status: true,
            authorId: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user can view this comment
    if (comment.status === 'PENDING' || comment.status === 'REJECTED') {
      try {
        const user = await checkCommentModerationPermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'MODERATOR', 'AUTHOR']);
        
        // Authors can only view comments on their own articles
        if (user.role === 'AUTHOR' && comment.article.authorId !== user.id) {
          return NextResponse.json(
            { error: 'Comment not found' },
            { status: 404 }
          );
        }
      } catch {
        // If not authenticated or no permission, return 404 for pending/rejected comments
        return NextResponse.json(
          { error: 'Comment not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comment' },
      { status: 500 }
    );
  }
}

// PATCH /api/comments/[id] - Update comment (moderation or edit)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedFields = updateCommentSchema.parse(body);

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      select: { id: true, authorId: true, status: true },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Determine if this is a moderation action (status change) or content edit
    const isModerationAction = validatedFields.status !== undefined;
    
    if (isModerationAction) {
      // Status changes require moderation permissions
      const user = await checkCommentModerationPermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'MODERATOR']);
      
      const comment = await prisma.comment.update({
        where: { id },
        data: { status: validatedFields.status },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          article: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: comment,
      });
    } else {
      // Content edits require ownership or moderation permissions
      const user = await checkCommentModerationPermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'MODERATOR', 'AUTHOR']);
      
      const canModify = await canModifyComment(id, user.id, user.role);
      if (!canModify) {
        return NextResponse.json(
          { error: 'You can only edit your own comments' },
          { status: 403 }
        );
      }

      const comment = await prisma.comment.update({
        where: { id },
        data: { content: validatedFields.content },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          article: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: comment,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[id] - Delete comment
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await checkCommentModerationPermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'MODERATOR', 'AUTHOR']);
    
    // Check if user can modify this specific comment
    const canModify = await canModifyComment(id, user.id, user.role);
    if (!canModify) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}



