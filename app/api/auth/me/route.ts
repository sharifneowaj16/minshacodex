import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/auth/appAuth';
import { createLogger } from '@/lib/logger';

const logger = createLogger('auth:me');

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    logger.error('Error fetching user profile', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
