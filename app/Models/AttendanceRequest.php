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
        'start_date',
        'end_date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    protected static function booted()
    {
        static::updated(function ($request) {
            // Jika status berubah menjadi approved dan tipe request adalah leave (cuti tahunan)
            if ($request->isDirty('status') && $request->status === 'approved' && $request->request_type === 'leave') {
                if ($request->start_date && $request->end_date) {
                    $days = \Carbon\Carbon::parse($request->start_date)->diffInDays(\Carbon\Carbon::parse($request->end_date)) + 1;
                    $employee = \App\Models\Employee::find($request->employee_id);
                    if ($employee) {
                        $employee->annual_leave_quota -= $days;
                        $employee->save();
                    }
                }
            }
        });
    }
}
