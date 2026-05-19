<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceRequest extends Model
{
    protected $fillable = [
        'employee_id',
        'request_type',
        'description',
        'status',
        'approved_by',
    ];
}
