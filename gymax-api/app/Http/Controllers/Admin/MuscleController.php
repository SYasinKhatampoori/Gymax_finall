<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Muscle;
use Illuminate\Http\Request;

class MuscleController extends Controller
{
    public function index()
    {
        return Muscle::orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:muscles,name',
        ]);

        return response()->json(Muscle::create($data), 201);
    }
}
