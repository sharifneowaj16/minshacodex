import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ADMIN_PERMISSIONS,
  getAuthenticatedAdminFromRequest,
  hasAdminPermission,
} from '@/lib/auth/adminAuth';
import { uploadFile, validateImageUpload, ensureBucketInitialized } from '@/lib/storage/minio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await ensureBucketInitialized();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate image
    const validation = validateImageUpload({ size: file.size, type: file.type });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile(buffer, file.name, folder, file.type);

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed', detail: message }, { status: 500 });
  }
}
