"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { User, UserFilters } from "~~/types/user";
import {
  UserIcon,
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

const UserManagement: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedKycStatus, setSelectedKycStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      } else {
        setError(result.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to users
  const applyFilters = () => {
    let filtered = users;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.walletAddress.toLowerCase().includes(searchLower) ||
        user.location?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (selectedKycStatus !== "all") {
      filtered = filtered.filter(user => user.kycStatus === selectedKycStatus);
    }

    setFilteredUsers(filtered);
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        await fetchUsers();
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, selectedStatus, selectedRole, selectedKycStatus]);

  if (!connectedAddress) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-base-content mb-4">Connect Your Wallet</h2>
          <p className="text-base-content/60">Please connect your wallet to access user management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-base-content mb-2 flex items-center gap-3">
                <UsersIcon className="h-10 w-10 text-primary" />
                User Management
              </h1>
              <p className="text-base-content/70">Manage platform users and their permissions</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <PlusIcon className="h-5 w-5" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="card bg-base-100 shadow-lg border border-base-300 mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Search Users</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, or address..."
                    className="input input-bordered w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-base-content/40" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Role Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="investor">Investor</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* KYC Status Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">KYC Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedKycStatus}
                  onChange={(e) => setSelectedKycStatus(e.target.value)}
                >
                  <option value="all">All KYC Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="not_required">Not Required</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <ExclamationTriangleIcon className="h-6 w-6" />
            <span>{error}</span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setError(null)}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Users Table */}
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Role</th>
                      <th>KYC</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12">
                          <div className="text-base-content/60">
                            <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No users found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar placeholder">
                                <div className="bg-neutral text-neutral-content rounded-full w-8">
                                  <span className="text-xs">
                                    {user.displayName?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="font-bold">{user.displayName || 'Unknown User'}</div>
                                <div className="text-sm opacity-50">
                                  <Address address={user.walletAddress} size="xs" />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{user.email || 'N/A'}</td>
                          <td>
                            <div className={`badge ${
                              user.status === 'active' ? 'badge-success' :
                              user.status === 'pending' ? 'badge-warning' :
                              'badge-error'
                            }`}>
                              {user.status}
                            </div>
                          </td>
                          <td>
                            <div className={`badge ${
                              user.role === 'admin' ? 'badge-primary' :
                              user.role === 'investor' ? 'badge-secondary' :
                              'badge-ghost'
                            }`}>
                              {user.role}
                            </div>
                          </td>
                          <td>
                            <div className={`badge badge-sm ${
                              user.kycStatus === 'verified' ? 'badge-success' :
                              user.kycStatus === 'pending' ? 'badge-warning' :
                              user.kycStatus === 'rejected' ? 'badge-error' :
                              'badge-ghost'
                            }`}>
                              {user.kycStatus}
                            </div>
                          </td>
                          <td>
                            {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => setEditingUser(user)}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => setEditingUser(user)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => deleteUser(user.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="stat bg-base-100 shadow border border-base-300 rounded-lg">
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-primary">{users.length}</div>
          </div>
          <div className="stat bg-base-100 shadow border border-base-300 rounded-lg">
            <div className="stat-title">Active Users</div>
            <div className="stat-value text-success">
              {users.filter(u => u.status === 'active').length}
            </div>
          </div>
          <div className="stat bg-base-100 shadow border border-base-300 rounded-lg">
            <div className="stat-title">Pending Users</div>
            <div className="stat-value text-warning">
              {users.filter(u => u.status === 'pending').length}
            </div>
          </div>
          <div className="stat bg-base-100 shadow border border-base-300 rounded-lg">
            <div className="stat-title">KYC Verified</div>
            <div className="stat-value text-info">
              {users.filter(u => u.kycStatus === 'verified').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;