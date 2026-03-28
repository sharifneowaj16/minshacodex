import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { listAllObjects, deleteFile, uploadMediaFile, validateImageUpload } from '@/lib/storage/minio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/media - List all files in MinIO
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';

    const files = await listAllObjects(folder);

    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const images = files.filter((f) =>
      /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name)
    );

    return NextResponse.json({
      success: true,
      files,
      stats: {
        total: files.length,
        images: images.length,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Media list error:', error);
    return NextResponse.json({ error: 'Failed to list media files' }, { status: 500 });
  }
}

// POST /api/media - Upload a file to the media folder
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validation = validateImageUpload({ size: file.size, type: file.type });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadMediaFile(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
    });
  } catch (error) {
    console.error('Media upload error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Upload failed', detail: message }, { status: 500 });
  }
}

// DELETE /api/media - Delete a file from MinIO
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'File key is required' }, { status: 400 });
    }

    await deleteFile(key);

    return NextResponse.json({ success: true, message: 'File deleted' });
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
