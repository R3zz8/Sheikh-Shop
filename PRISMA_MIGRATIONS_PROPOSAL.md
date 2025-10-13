# Prisma Migration Proposal: Add Missing Analytics Fields

## 📋 **Overview**

This document proposes adding missing fields to the Article model in Prisma schema to support the analytics functionality that the codebase expects.

## 🎯 **Problem Statement**

The current Article model in `prisma/schema.prisma` is missing several fields that the application code expects:

- `views: Int?` - Article view count tracking
- `likes: Int?` - Article like count tracking
- `shares: Int?` - Article share count tracking
- `analytics: Json?` - Analytics data object
- `language: String?` - Article language
- `version: Int?` - Article version number

Additionally, missing models:

- `UserLike` - User like tracking model
- `ArticleVersion` - Article versioning model

## 🔧 **Proposed Migration**

### **Migration SQL**

```sql
-- Add analytics fields to Article table
ALTER TABLE "Article" ADD COLUMN "views" INTEGER DEFAULT 0;
ALTER TABLE "Article" ADD COLUMN "likes" INTEGER DEFAULT 0;
ALTER TABLE "Article" ADD COLUMN "shares" INTEGER DEFAULT 0;
ALTER TABLE "Article" ADD COLUMN "analytics" JSONB;
ALTER TABLE "Article" ADD COLUMN "language" TEXT DEFAULT 'en';
ALTER TABLE "Article" ADD COLUMN "version" INTEGER DEFAULT 1;

-- Create UserLike table for like tracking
CREATE TABLE "UserLike" (
    "id" TEXT NOT NULL DEFAULT (cuid()),
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserLike_pkey" PRIMARY KEY ("id")
);

-- Create ArticleVersion table for versioning
CREATE TABLE "ArticleVersion" (
    "id" TEXT NOT NULL DEFAULT (cuid()),
    "articleId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keywords" TEXT[],
    "createdBy" TEXT NOT NULL,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleVersion_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "UserLike_userId_articleId_idx" ON "UserLike"("userId", "articleId");
CREATE INDEX "ArticleVersion_articleId_version_idx" ON "ArticleVersion"("articleId", "version");
```

### **Updated Prisma Schema**

```prisma
model Article {
  id              String        @id @default(uuid())
  title           String        @db.VarChar(255)
  slug            String        @unique @db.VarChar(255)
  imageUrl        String?       @db.VarChar(500)
  summary         String        @db.VarChar(500)
  content         String
  status          ArticleStatus @default(DRAFT)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  authorId        String
  category        String?       @db.VarChar(100)
  tags            String[]      @default([])
  excerpt         String?       @db.VarChar(300)
  externalLinks   String[]      @default([])
  internalLinks   String[]      @default([])
  keywords        String[]      @default([])
  metaDescription String?       @db.VarChar(155)
  metaTitle       String?       @db.VarChar(60)
  publishedAt     DateTime?
  readTime        Int?
  schemaMarkup    Json?

  // NEW FIELDS
  views           Int?          @default(0)
  likes           Int?          @default(0)
  shares          Int?          @default(0)
  analytics       Json?
  language        String?       @default("en")
  version         Int?          @default(1)

  author          User          @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments        Comment[]
  userLikes       UserLike[]    // NEW RELATION
  versions        ArticleVersion[] // NEW RELATION

  @@index([slug])
  @@index([authorId])
  @@index([createdAt])
  @@index([publishedAt])
  @@index([title])
  @@index([status])
  @@index([category])
  @@index([metaTitle])
  @@index([keywords])
  @@index([views])      // NEW INDEX
  @@index([likes])      // NEW INDEX
  @@index([language])   // NEW INDEX
}

model UserLike {
  id        String   @id @default(cuid())
  userId    String
  articleId String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
  @@index([userId, articleId])
  @@index([createdAt])
}

model ArticleVersion {
  id              String   @id @default(cuid())
  articleId       String
  version         Int
  content         String
  metaTitle       String?
  metaDescription String?
  title           String
  summary         String
  keywords        String[]
  createdBy       String
  changes         Json?
  createdAt       DateTime @default(now())

  article         Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  author          User     @relation(fields: [createdBy], references: [id])

  @@unique([articleId, version])
  @@index([articleId, version])
  @@index([createdAt])
}

// Update User model to include new relations
model User {
  // ... existing fields ...

  // NEW RELATIONS
  userLikes       UserLike[]
  articleVersions ArticleVersion[]
}
```

## ⚠️ **Risk Assessment**

### **Low Risk**

- Adding nullable fields with defaults is safe
- No data loss risk
- Backward compatible

### **Medium Risk**

- New tables require proper indexing
- Performance impact on large datasets
- Migration time for large Article tables

### **Mitigation Strategies**

- Test migration on staging environment first
- Use database backup before applying
- Monitor query performance after migration
- Consider batch processing for large datasets

## 🚀 **Migration Commands**

### **Development Environment**

```bash
# Create migration
pnpm exec prisma migrate dev --name add_article_analytics_fields

# Generate client
pnpm exec prisma generate

# Test build
pnpm build
```

### **Production Environment**

```bash
# Deploy migration
pnpm exec prisma migrate deploy

# Generate client
pnpm exec prisma generate

# Restart application
```

## 📊 **Expected Benefits**

1. **Full Analytics Support**: Native tracking of views, likes, shares
2. **Version Control**: Proper article versioning system
3. **Performance**: Optimized queries with proper indexes
4. **Data Integrity**: Relational constraints for like tracking
5. **Type Safety**: Full TypeScript support for all fields

## 🔄 **Rollback Plan**

If issues occur, rollback can be performed by:

```sql
-- Remove new fields (WARNING: This will lose data)
ALTER TABLE "Article" DROP COLUMN IF EXISTS "views";
ALTER TABLE "Article" DROP COLUMN IF EXISTS "likes";
ALTER TABLE "Article" DROP COLUMN IF EXISTS "shares";
ALTER TABLE "Article" DROP COLUMN IF EXISTS "analytics";
ALTER TABLE "Article" DROP COLUMN IF EXISTS "language";
ALTER TABLE "Article" DROP COLUMN IF EXISTS "version";

-- Drop new tables
DROP TABLE IF EXISTS "UserLike";
DROP TABLE IF EXISTS "ArticleVersion";
```

## ✅ **Approval Required**

This migration requires explicit approval via `APPROVE_MIGRATIONS` token before execution.

**Status**: ⏳ **PENDING APPROVAL**

---

_Generated on: $(date)_
_Branch: fix/build-errors-TS-prisma_
_Commit: 9e26bf5_
