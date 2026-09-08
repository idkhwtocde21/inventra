<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifications = request()->user()
            ->notifications()
            ->latest()
            ->take(50)
            ->get();

        return response()->json([
            'data' => $notifications,
            'unread_count' => request()->user()
                ->unreadNotifications()
                ->count(),
        ]);
    }

    public function markAsRead(DatabaseNotification $notification): JsonResponse
    {
        if ($notification->notifiable_id === request()->user()->id) {
            $notification->markAsRead();
        }

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(): JsonResponse
    {
        request()->user()->unreadNotifications->each->markAsRead();

        return response()->json(['message' => 'All notifications marked as read']);
    }
}