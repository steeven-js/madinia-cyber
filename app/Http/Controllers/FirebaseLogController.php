<?php

namespace App\Http\Controllers;

use App\Services\FirebaseLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FirebaseLogController extends Controller
{
    /**
     * Display Firebase logs
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $days = $request->input('days', 7);
        $logs = FirebaseLogService::getLogs($days);

        return Inertia::render('FirebaseLogs', [
            'logs' => $logs,
            'days' => $days,
            'totalLogs' => count($logs)
        ]);
    }

    /**
     * Log a test message to Firebase logs
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function testLog()
    {
        FirebaseLogService::log('Test log message from Firebase Log Controller', [
            'source' => 'FirebaseLogController',
            'action' => 'testLog',
            'timestamp' => now()->timestamp
        ]);

        return redirect()->route('firebase.logs')->with('success', 'Test log message added successfully');
    }
}
