<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BmiController extends Controller
{
    public function calculate(Request $request)
    {
        $data = $request->validate([
            'height_cm' => 'required|numeric|min:50|max:250',
            'weight_kg' => 'required|numeric|min:10|max:500',
        ]);

        $meters = $data['height_cm'] / 100;
        $bmi = round($data['weight_kg'] / ($meters * $meters), 1);

        $category = match (true) {
            $bmi < 18.5 => 'underweight',
            $bmi < 25 => 'normal',
            $bmi < 30 => 'overweight',
            default => 'obese',
        };

        return response()->json([
            'bmi' => $bmi,
            'category' => $category,
        ]);
    }
}
