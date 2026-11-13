<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlanRequest;
use Illuminate\Http\Request;

class PlanRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = PlanRequest::with('user:id,name,email')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $query->get();
    }

    public function show(PlanRequest $planRequest)
    {
        return $planRequest->load(['user:id,name,email', 'plan.items.exercise:id,name,xp']);
    }
}
