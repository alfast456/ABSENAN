<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Employee extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'employee_code',
        'name',
        'email',
        'password',
        'department_id',
        'shift_group_id',
        'status',
        'base_salary',
    ];

    protected $hidden = [
        'password',
    ];

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }
}
