<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('month', 7); // e.g. '2026-05'
            $table->decimal('base_salary', 12, 2);
            $table->decimal('overtime_pay', 12, 2)->default(0.00);
            $table->decimal('late_deduction', 12, 2)->default(0.00);
            $table->decimal('net_salary', 12, 2);
            $table->enum('payment_status', ['pending', 'paid'])->default('pending');
            $table->timestamp('calculated_at');
            $table->timestamps();

            // Ensure one payroll record per employee per month
            $table->unique(['employee_id', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
