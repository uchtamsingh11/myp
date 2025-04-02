'use client';

import React from 'react';
import AdminUserData from '../../../../components/dashboard/admin/UserDataComponent';

export default function AdminUsersPage() {
  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Admin User Management</h1>
      <AdminUserData />
    </div>
  );
}
