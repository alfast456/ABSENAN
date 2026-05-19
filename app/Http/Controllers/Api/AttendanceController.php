<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\GeolocationService;

class AttendanceController extends Controller
{
    public function checkin(Request $request, GeolocationService $geoService)
    {
        return $this->processAttendance($request, $geoService, 'checkin');
    }

    public function checkout(Request $request, GeolocationService $geoService)
    {
        return $this->processAttendance($request, $geoService, 'checkout');
    }

    private function processAttendance(Request $request, GeolocationService $geoService, $type)
    {
        $request->validate([
            'photo' => 'required|image|max:5120',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $employee = $request->user();
        
        // 1. Validate Face Template exists
        $faceTemplate = \App\Models\FaceTemplate::where('employee_id', $employee->id)->first();
        if (!$faceTemplate) {
            return response()->json(['message' => 'Face template not found. Please register first.'], 400);
        }

        // 2. Validate GPS Location
        $office = \App\Models\OfficeLocation::first(); // Assuming 1 main office for MVP
        if (!$office) {
            return response()->json(['message' => 'Office location not configured.'], 500);
        }

        $distance = $geoService->calculateDistanceInMeters(
            $request->latitude,
            $request->longitude,
            $office->latitude,
            $office->longitude
        );

        if ($distance > $office->radius_meter) {
            return response()->json(['message' => "Out of range. You are {$distance}m away (max {$office->radius_meter}m)."], 403);
        }

        // 3. Call FastAPI for Face Verification
        $photo = $request->file('photo');
        $faceServiceUrl = config('services.face_service.base_url') . '/verify';

        $response = \Illuminate\Support\Facades\Http::attach(
            'photo', file_get_contents($photo->getPathname()), $photo->getClientOriginalName()
        )->post($faceServiceUrl, [
            'stored_embedding' => $faceTemplate->embedding_vector,
        ]);

        if (!$response->successful()) {
            $errorMessage = $response->json('detail') ?? 'AI Service Error';
            return response()->json(['message' => $errorMessage], $response->status());
        }

        $result = $response->json();
        
        // Anti-Spoofing check
        if (isset($result['is_live']) && !$result['is_live']) {
            $score = number_format($result['liveness_score'] ?? 0.0, 1);
            return response()->json([
                'message' => "Anti-Spoofing: Liveness check failed (score: {$score} < 100.0). Ensure photo is sharp and not a printout/screen."
            ], 403);
        }

        if (!$result['is_match']) {
            return response()->json(['message' => 'Face does not match.'], 401);
        }

        // 4. Save Attendance Log
        $path = $photo->store('attendance', 'public');
        
        $log = \App\Models\AttendanceLog::create([
            'employee_id' => $employee->id,
            'attendance_type' => $type,
            'scan_time' => now(),
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'distance' => $distance,
            'face_confidence' => 1 - $result['distance'], // approximate confidence
            'photo_path' => $path,
            'status' => 'valid',
        ]);

        // 5. Broadcast Event for Realtime Monitoring
        event(new \App\Events\AttendanceLogged($log));

        return response()->json([
            'message' => ucfirst($type) . ' successful!',
            'data' => $log
        ]);
    }

    public function history(Request $request)
    {
        $employee = $request->user();
        $logs = \App\Models\AttendanceLog::where('employee_id', $employee->id)
            ->orderBy('scan_time', 'desc')
            ->take(30)
            ->get();
        return response()->json(['data' => $logs]);
    }

    public function submitRequest(Request $request)
    {
        $request->validate([
            'request_type' => 'required|in:leave,sick,permission',
            'description' => 'required|string',
        ]);

        $attendanceRequest = \App\Models\AttendanceRequest::create([
            'employee_id' => $request->user()->id,
            'request_type' => $request->request_type,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Request submitted successfully',
            'data' => $attendanceRequest
        ]);
    }

    public function requests(Request $request)
    {
        $employee = $request->user();
        $requests = \App\Models\AttendanceRequest::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $requests
        ]);
    }

    public function payroll(Request $request)
    {
        $employee = $request->user();
        $payrolls = \App\Models\Payroll::where('employee_id', $employee->id)
            ->orderBy('month', 'desc')
            ->get();

        return response()->json([
            'data' => $payrolls
        ]);
    }
}
