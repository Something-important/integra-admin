import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { User, UpdateUserRequest, UserResponse } from '~~/types/user';

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

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<UserResponse>> {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a specific user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<UserResponse>> {
  try {
    const body: UpdateUserRequest = await request.json();
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === params.id);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user with provided fields
    const updatedUser: User = {
      ...users[userIndex],
      ...body,
      notifications: body.notifications ? {
        ...users[userIndex].notifications,
        ...body.notifications
      } : users[userIndex].notifications,
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    await writeUsers(users);

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a specific user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === params.id);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove user from array
    users.splice(userIndex, 1);
    await writeUsers(users);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}