import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../lib/stores/authStore';
import DashboardLayout from './DashboardLayout';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AccountSettings = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const { user, changePassword } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const newPassword = watch('new_password');

  const onPasswordSubmit = async (data) => {
    setIsChangingPassword(true);
    try {
      await changePassword({
        current_password: data.current_password,
        password: data.new_password,
        password_confirmation: data.confirm_password
      });
      toast.success('Password changed successfully');
      reset();
    } catch (error) {
      console.error('Password change failed:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account security and preferences</p>
        </div>

        {/* Password Change Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <KeyIcon className="h-6 w-6 text-rose-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          </div>

          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  {...register('current_password', { required: 'Current password is required' })}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-red-500 text-sm mt-1">{errors.current_password.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  {...register('new_password', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.new_password && (
                <p className="text-red-500 text-sm mt-1">{errors.new_password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password', {
                    required: 'Please confirm your password',
                    validate: value => value === newPassword || 'Passwords do not match'
                  })}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-500 text-sm mt-1">{errors.confirm_password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full sm:w-auto px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating Password...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>

        {/* Email Notifications */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <BellIcon className="h-6 w-6 text-rose-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Order Updates</p>
                <p className="text-sm text-gray-600">Receive email notifications about your orders</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                defaultChecked
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Promotional Emails</p>
                <p className="text-sm text-gray-600">Receive offers and product updates</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                defaultChecked
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Newsletter</p>
                <p className="text-sm text-gray-600">Weekly beauty tips and trends</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
            </label>
          </div>

          <button className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Save Preferences
          </button>
        </div>

        {/* Account Security */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <ShieldCheckIcon className="h-6 w-6 text-rose-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Account Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <button className="text-rose-600 hover:text-rose-700 font-medium text-sm">
                Enable
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Login History</p>
                <p className="text-sm text-gray-600">View recent login activity</p>
              </div>
              <button className="text-rose-600 hover:text-rose-700 font-medium text-sm">
                View
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Delete Account</p>
                <p className="text-sm text-gray-600">Permanently delete your account and data</p>
              </div>
              <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
