<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Request $request)
    {
        $query = Comment::whereNull('parent_id')
            ->with(['user:id,name,email', 'exercise:id,name', 'replies.user:id,name'])
            ->latest();

        if ($request->boolean('unanswered')) {
            $query->doesntHave('replies');
        }

        return $query->get();
    }

    public function reply(Request $request, Comment $comment)
    {
        if ($comment->parent_id !== null) {
            return response()->json(['message' => 'به پاسخ نمی‌شه پاسخ داد.'], 422);
        }

        $data = $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $reply = Comment::create([
            'user_id' => $request->user()->id,
            'exercise_id' => $comment->exercise_id,
            'parent_id' => $comment->id,
            'body' => $data['body'],
        ]);

        return response()->json($reply->load('user:id,name'), 201);
    }

    public function destroy(Comment $comment)
    {
        $comment->delete();

        return response()->json(['message' => 'نظر حذف شد.']);
    }
}
