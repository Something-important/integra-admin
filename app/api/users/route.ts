import { NextRequest, NextResponse } from 'next/server';
import { User, CreateUserRequest, UserFilters, UsersResponse, UserResponse } from '~~/types/user';
import supabase from '~~/utils/supabase';

// Helper function to generate unique ID for new users
function generateUserId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Helper function to get wallet address from request headers
function getWalletAddress(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer 0x')) {
    return authHeader.substring(7);
  }
  const walletHeader = request.headers.get('x-wallet-address');
  if (walletHeader && walletHeader.startsWith('0x')) {
    return walletHeader;
  }
  return null;
}

// GET /api/users - Get all users with optional filters
export async function GET(request: NextRequest): Promise<NextResponse<UsersResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    const filters: UserFilters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as any || undefined,
      role: searchParams.get('role') as any || undefined,
      kycStatus: searchParams.get('kycStatus') as any || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    // Build Supabase query options
    const queryOptions: any = {
      select: '*',
      count: true
    };

    // Add where conditions for exact matches
    const whereConditions: any = {};
    if (filters.status) {
      whereConditions.status = filters.status;
    }
    if (filters.role) {
      whereConditions.role = filters.role;
    }
    if (filters.kycStatus) {
      whereConditions.kyc_status = filters.kycStatus;
    }

    if (Object.keys(whereConditions).length > 0) {
      queryOptions.where = whereConditions;
    }

    // Add pagination
    if (filters.limit) {
      queryOptions.limit = filters.limit;
    }
    if (filters.offset) {
      queryOptions.offset = filters.offset;
    }

    // Add ordering
    queryOptions.order = 'created_at.desc';

    const result = await supabase.select<User>('integra_users', queryOptions);

    if (result.error) {
      console.error('Error fetching users from Supabase:', result.error);
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      );
    }

    let users = result.data || [];

    // Apply search filter (text search needs to be done client-side for now)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      users = users.filter(user =>
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.walletAddress.toLowerCase().includes(searchLower) ||
        user.location?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: users,
      total: result.count || users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest): Promise<NextResponse<UserResponse>> {
  try {
    const body: CreateUserRequest = await request.json();

    // Validate required fields
    if (!body.walletAddress || !body.walletAddress.startsWith('0x')) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address is required' },
        { status: 400 }
      );
    }

    // Check if wallet address already exists
    const existingUserResult = await supabase.select<User>('integra_users', {
      where: { wallet_address: body.walletAddress.toLowerCase() },
      limit: 1
    });

    if (existingUserResult.error) {
      console.error('Error checking existing user:', existingUserResult.error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    if (existingUserResult.data && existingUserResult.data.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User with this wallet address already exists' },
        { status: 409 }
      );
    }

    // Prepare new user data for database (using snake_case for column names)
    const now = new Date().toISOString();
    const newUserData = {
      id: generateUserId(),
      wallet_address: body.walletAddress.toLowerCase(),
      email: body.email,
      display_name: body.displayName || 'Unknown User',
      status: 'pending',
      role: body.role || 'user',
      total_investments: '0.0',
      properties_owned: 0,
      join_date: now,
      kyc_status: 'pending',
      bio: body.bio,
      location: body.location,
      investment_preferences: body.investmentPreferences || [],
      social_links: {
        twitter: '',
        linkedin: '',
        website: '',
        discord: ''
      },
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    };

    const result = await supabase.insert<User>('integra_users', newUserData);

    if (result.error) {
      console.error('Error creating user in Supabase:', result.error);
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      );
    }

    // Convert database response back to camelCase for API response
    const createdUser = result.data as any;
    if (createdUser && Array.isArray(createdUser) && createdUser.length > 0) {
      const user = createdUser[0];
      const responseUser: User = {
        id: user.id,
        walletAddress: user.wallet_address,
        email: user.email,
        displayName: user.display_name,
        status: user.status,
        role: user.role,
        totalInvestments: user.total_investments,
        propertiesOwned: user.properties_owned,
        joinDate: user.join_date,
        lastActive: user.last_active,
        kycStatus: user.kyc_status,
        profileImage: user.profile_image,
        bio: user.bio,
        location: user.location,
        investmentPreferences: user.investment_preferences,
        socialLinks: user.social_links,
        notifications: user.notifications,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };

      return NextResponse.json({ success: true, data: responseUser });
    }

    return NextResponse.json(
      { success: false, error: 'User creation failed' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}