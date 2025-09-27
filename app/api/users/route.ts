import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { User, CreateUserRequest, UserFilters, UsersResponse, UserResponse } from '~~/types/user';

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

// Helper function to read users from JSON file
async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

// Helper function to write users to JSON file
async function writeUsers(users: User[]): Promise<void> {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing users file:', error);
    throw error;
  }
}

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

    let users = await readUsers();

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      users = users.filter(user =>
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.walletAddress.toLowerCase().includes(searchLower) ||
        user.location?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      users = users.filter(user => user.status === filters.status);
    }

    if (filters.role) {
      users = users.filter(user => user.role === filters.role);
    }

    if (filters.kycStatus) {
      users = users.filter(user => user.kycStatus === filters.kycStatus);
    }

    const total = users.length;

    // Apply pagination
    if (filters.offset) {
      users = users.slice(filters.offset);
    }
    if (filters.limit) {
      users = users.slice(0, filters.limit);
    }

    return NextResponse.json({
      success: true,
      data: users,
      total
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

    const users = await readUsers();

    // Check if wallet address already exists
    const existingUser = users.find(user =>
      user.walletAddress.toLowerCase() === body.walletAddress.toLowerCase()
    );

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this wallet address already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const now = new Date().toISOString();
    const newUser: User = {
      id: generateUserId(),
      walletAddress: body.walletAddress.toLowerCase(),
      email: body.email,
      displayName: body.displayName || 'Unknown User',
      status: 'pending',
      role: body.role || 'user',
      totalInvestments: '0.0',
      propertiesOwned: 0,
      joinDate: now,
      kycStatus: 'pending',
      bio: body.bio,
      location: body.location,
      investmentPreferences: body.investmentPreferences || [],
      socialLinks: {
        twitter: '',
        linkedin: '',
        website: '',
        discord: ''
      },
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      createdAt: now,
      updatedAt: now
    };

    users.push(newUser);
    await writeUsers(users);

    return NextResponse.json({ success: true, data: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}