<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Exercise;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Exercise $exercise)
    {
        return Comment::where('exercise_id', $exercise->id)
            ->whereNull('parent_id')
            ->with(['user:id,name', 'replies.user:id,name,role'])
            ->latest()
            ->get();
    }

    public function store(Request $request, Exercise $exercise)
    {
        $data = $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'exercise_id' => $exercise->id,
            'body' => $data['body'],
        ]);

        return response()->json($comment->load('user:id,name'), 201);
    }
}
