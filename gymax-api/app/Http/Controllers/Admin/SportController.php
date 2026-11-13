<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sport;
use Illuminate\Http\Request;

class SportController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:sports,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:255',
        ]);

        return response()->json(Sport::create($data), 201);
    }

    public function update(Request $request, Sport $sport)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:sports,slug,' . $sport->id,
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:255',
        ]);

        $sport->update($data);

        return response()->json($sport);
    }

    public function destroy(Sport $sport)
    {
        $sport->delete();

        return response()->json(['message' => 'ورزش حذف شد.']);
    }
}
