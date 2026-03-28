'use client';

import { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Bell,
  ShieldCheck,
  Camera,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import type { User } from '@/types/user';

interface SettingsClientProps {
  initialUser: User;
}

export function SettingsClient({ initialUser }: SettingsClientProps) {
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form data
  const [profileData, setProfileData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user.gender || ''
  });

  const [preferences, setPreferences] = useState(user.preferences);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'preferences', name: 'Preferences', icon: Bell },
    { id: 'security', name: 'Security', icon: ShieldCheck }
  ];

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode: 'profile',
          ...profileData
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update profile. Please try again.');
      }

      const updatedUser = payload?.user;
      setUser(prev => ({
        ...prev,
        firstName: updatedUser?.firstName || profileData.firstName,
        lastName: updatedUser?.lastName || profileData.lastName,
        phone: updatedUser?.phone ?? profileData.phone,
        dateOfBirth: updatedUser?.dateOfBirth ? new Date(updatedUser.dateOfBirth) : undefined,
        gender: (updatedUser?.gender || profileData.gender || undefined) as 'male' | 'female' | 'other' | undefined,
        preferences: updatedUser?.preferences || prev.preferences
      }));

      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode: 'preferences',
          preferences
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update preferences. Please try again.');
      }

      const updatedUser = payload?.user;
      setUser(prev => ({
        ...prev,
        preferences: updatedUser?.preferences || preferences
      }));

      if (updatedUser?.preferences) {
        setPreferences(updatedUser.preferences);
      }

      showSuccess('Preferences updated successfully!');
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Failed to update preferences. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showError('Password must be at least 8 characters long');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Current password is incorrect');
      }

      showSuccess('Password changed successfully!');
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Current password is incorrect'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server
      console.log('Uploading avatar:', file.name);
      // For now, just simulate the upload
      setTimeout(() => {
        setSuccessMessage('Avatar updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {errorMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

              {/* Avatar Section */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user.firstName} {user.lastName}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.emailVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value as any }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Communication Preferences</h2>

              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.newsletter}
                      onChange={(e) => setPreferences(prev => ({ ...prev, newsletter: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-3 text-gray-700">
                      Newsletter and product updates
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.promotions}
                      onChange={(e) => setPreferences(prev => ({ ...prev, promotions: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-3 text-gray-700">
                      Promotions and special offers
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.newProducts}
                      onChange={(e) => setPreferences(prev => ({ ...prev, newProducts: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-3 text-gray-700">
                      New product announcements
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.orderUpdates}
                      onChange={(e) => setPreferences(prev => ({ ...prev, orderUpdates: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-3 text-gray-700">
                      Order status updates
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications}
                      onChange={(e) => setPreferences(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-3 text-gray-700">
                      SMS notifications for order updates
                    </span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

              <div className="space-y-8">
                {/* Password Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                    </div>
                    {!showPasswordForm && (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </button>
                    )}
                  </div>

                  {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                            minLength={8}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                            minLength={8}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Two-Factor Authentication */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-800 font-medium">Not Enabled</p>
                        <p className="text-yellow-700 text-sm mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>

                {/* Login History */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Login Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">Current Session</p>
                          <p className="text-sm text-gray-600">New York, NY • Chrome on Windows</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">Now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
