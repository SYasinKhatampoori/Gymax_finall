<?php

namespace App\Http\Controllers;

use App\Models\Sport;

class SportController extends Controller
{
    public function index()
    {
        return Sport::orderBy('name')->get();
    }

    public function show(Sport $sport)
    {
        return $sport->load('exercises:id,sport_id,name,xp');
    }
}
