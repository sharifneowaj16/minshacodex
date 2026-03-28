import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_PERMISSIONS,
  getAuthenticatedAdminFromRequest,
  hasAdminPermission,
} from '@/lib/auth/adminAuth';
import { 
  createProductIndex, 
  indexAllProducts, 
  reindexAllProducts,
  indexProduct,
  updateProduct,
  deleteProduct
} from '@/lib/elasticsearch/indexing';
import { testConnection, indexExists, PRODUCT_INDEX } from '@/lib/elasticsearch';
import prisma from '@/lib/prisma';

// GET - Check Elasticsearch status
export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.SETTINGS_VIEW)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const action = request.nextUrl.searchParams.get('action');

    if (action === 'status') {
      const connected = await testConnection();
      const exists = await indexExists(PRODUCT_INDEX);
      
      // Get document count if index exists
      let documentCount = 0;
      if (exists) {
        const { esClient } = await import('@/lib/elasticsearch');
        const countResponse = await esClient.count({ index: PRODUCT_INDEX });
        documentCount = countResponse.count;
      }
      
      const dbProductCount = await prisma.product.count({
        where: { isActive: true }
      });

      return NextResponse.json({
        success: true,
        status: {
          connected,
          indexExists: exists,
          documentsIndexed: documentCount,
          productsInDatabase: dbProductCount,
          synced: documentCount === dbProductCount,
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use ?action=status'
    }, { status: 400 });

  } catch (error: any) {
    console.error('❌ Admin index GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Perform indexing operations
export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.SETTINGS_EDIT)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { action, productId, updates } = body;

    switch (action) {
      case 'create-index':
        const created = await createProductIndex();
        return NextResponse.json({
          success: created,
          message: created ? 'Index created successfully' : 'Failed to create index'
        });

      case 'index-all':
        const indexed = await indexAllProducts();
        return NextResponse.json({
          success: indexed,
          message: indexed ? 'All products indexed successfully' : 'Failed to index products'
        });

      case 'reindex-all':
        const reindexed = await reindexAllProducts();
        return NextResponse.json({
          success: reindexed,
          message: reindexed ? 'Reindex completed successfully' : 'Failed to reindex'
        });

      case 'index-product':
        if (!productId) {
          return NextResponse.json(
            { success: false, error: 'Product ID required' },
            { status: 400 }
          );
        }

        const product = await prisma.product.findUnique({
          where: { id: productId }
        });

        if (!product) {
          return NextResponse.json(
            { success: false, error: 'Product not found' },
            { status: 404 }
          );
        }

        const productIndexed = await indexProduct(product);
        return NextResponse.json({
          success: productIndexed,
          message: productIndexed ? 'Product indexed successfully' : 'Failed to index product'
        });

      case 'update-product':
        if (!productId || !updates) {
          return NextResponse.json(
            { success: false, error: 'Product ID and updates required' },
            { status: 400 }
          );
        }

        const updated = await updateProduct(productId, updates);
        return NextResponse.json({
          success: updated,
          message: updated ? 'Product updated successfully' : 'Failed to update product'
        });

      case 'delete-product':
        if (!productId) {
          return NextResponse.json(
            { success: false, error: 'Product ID required' },
            { status: 400 }
          );
        }

        const deleted = await deleteProduct(productId);
        return NextResponse.json({
          success: deleted,
          message: deleted ? 'Product deleted from index' : 'Failed to delete product'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('❌ Admin index POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
