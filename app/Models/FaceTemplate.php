<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FaceTemplate extends Model
{
    protected $fillable = [
        'employee_id',
        'embedding_vector',
        'photo_path',
    ];
}
