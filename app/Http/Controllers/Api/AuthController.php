<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'employee_code' => 'required',
            'password' => 'required',
        ]);

        $employee = Employee::where('employee_code', $request->employee_code)->first();

        if (!$employee || !Hash::check($request->password, $employee->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $employee->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'employee' => $employee
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function registerFace(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:5120', // Max 5MB
        ]);

        $photo = $request->file('photo');

        // Call FastAPI Service
        $faceServiceUrl = config('services.face_service.base_url') . '/register';
        
        $response = \Illuminate\Support\Facades\Http::attach(
            'photo', file_get_contents($photo->getPathname()), $photo->getClientOriginalName()
        )->post($faceServiceUrl);

        if (!$response->successful()) {
            $errorMessage = $response->json('detail') ?? 'Failed to register face with AI Service';
            return response()->json(['message' => $errorMessage], $response->status());
        }

        $embedding = $response->json('embedding');

        // Save to Database
        $employee = $request->user();
        
        $path = $photo->store('faces', 'public');

        \App\Models\FaceTemplate::updateOrCreate(
            ['employee_id' => $employee->id],
            [
                'embedding_vector' => json_encode($embedding),
                'photo_path' => $path,
            ]
        );

        return response()->json([
            'message' => 'Face registered successfully',
        ]);
    }
}
