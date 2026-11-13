<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;

class PaymentController extends Controller
{
    public function index()
    {
        return Payment::with('user:id,name,email')->latest()->limit(200)->get();
    }
}
