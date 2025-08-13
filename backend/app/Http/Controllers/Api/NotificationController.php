<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get user's notifications
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $perPage = $request->get('per_page', 15);
            $type = $request->get('type');
            $priority = $request->get('priority');
            $unreadOnly = $request->get('unread_only', false);

            $query = Notification::where('user_id', $user->id);

            if ($type) {
                $query->where('type', $type);
            }

            if ($priority) {
                $query->where('priority', $priority);
            }

            if ($unreadOnly) {
                $query->where('is_read', false);
            }

            $notifications = $query->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $notifications,
                'message' => 'Notifications retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve notifications',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get unread notification count
     */
    public function unreadCount(): JsonResponse
    {
        try {
            $user = Auth::user();
            $count = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            return response()->json([
                'success' => true,
                'data' => ['count' => $count],
                'message' => 'Unread count retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve unread count',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $notification = Notification::where('user_id', $user->id)
                ->findOrFail($id);

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread(int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $notification = Notification::where('user_id', $user->id)
                ->findOrFail($id);

            $notification->markAsUnread();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as unread',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as unread',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a notification
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $notification = Notification::where('user_id', $user->id)
                ->findOrFail($id);

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear all read notifications
     */
    public function clearRead(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $deleted = Notification::where('user_id', $user->id)
                ->where('is_read', true)
                ->delete();

            return response()->json([
                'success' => true,
                'data' => ['deleted_count' => $deleted],
                'message' => 'Read notifications cleared successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear read notifications',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get notification preferences
     */
    public function preferences(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Get user's notification preferences from user settings
            $preferences = [
                'email_notifications' => $user->email_notifications ?? true,
                'push_notifications' => $user->push_notifications ?? true,
                'order_updates' => $user->order_updates ?? true,
                'promotions' => $user->promotions ?? true,
                'newsletter' => $user->newsletter ?? true,
            ];

            return response()->json([
                'success' => true,
                'data' => $preferences,
                'message' => 'Notification preferences retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve notification preferences',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update notification preferences
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email_notifications' => 'boolean',
                'push_notifications' => 'boolean',
                'order_updates' => 'boolean',
                'promotions' => 'boolean',
                'newsletter' => 'boolean',
            ]);

            $user = Auth::user();
            
            $user->update($request->only([
                'email_notifications',
                'push_notifications',
                'order_updates',
                'promotions',
                'newsletter',
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Notification preferences updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update notification preferences',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
