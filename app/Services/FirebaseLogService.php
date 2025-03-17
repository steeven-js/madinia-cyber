<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Carbon;

class FirebaseLogService
{
    /**
     * Log a Firebase event
     *
     * @param string $message
     * @param array $context
     * @return void
     */
    public static function log(string $message, array $context = [])
    {
        Log::channel('firebase')->info($message, $context);
    }

    /**
     * Get Firebase logs
     *
     * @param int $days Number of days to look back
     * @return array
     */
    public static function getLogs(int $days = 7): array
    {
        $logs = [];
        $logPath = storage_path('logs');
        $pattern = '/firebase-(\d{4}-\d{2}-\d{2})\.log/';

        // Get all firebase log files
        $files = File::glob($logPath . '/firebase*.log');

        // Sort files by date (newest first)
        usort($files, function ($a, $b) {
            return filemtime($b) - filemtime($a);
        });

        // Calculate the date limit
        $dateLimit = Carbon::now()->subDays($days)->startOfDay();

        foreach ($files as $file) {
            // Extract date from filename
            if (preg_match($pattern, basename($file), $matches)) {
                $fileDate = Carbon::createFromFormat('Y-m-d', $matches[1])->startOfDay();

                // Skip if file is older than the limit
                if ($fileDate->lt($dateLimit)) {
                    continue;
                }
            } else {
                // For the main firebase.log file without date
                $fileDate = Carbon::createFromTimestamp(filemtime($file))->startOfDay();
                if ($fileDate->lt($dateLimit)) {
                    continue;
                }
            }

            // Read file content
            $content = File::get($file);

            // Parse log entries
            $entries = self::parseLogContent($content, $fileDate->format('Y-m-d'));

            $logs = array_merge($logs, $entries);
        }

        // Sort all logs by timestamp (newest first)
        usort($logs, function ($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        return $logs;
    }

    /**
     * Parse log content into structured data
     *
     * @param string $content
     * @param string $date
     * @return array
     */
    private static function parseLogContent(string $content, string $date): array
    {
        $entries = [];
        $lines = explode("\n", $content);

        foreach ($lines as $line) {
            if (empty(trim($line))) {
                continue;
            }

            // Parse log line
            // Format: [YYYY-MM-DD HH:MM:SS] production.INFO: Message {"context":"data"}
            if (preg_match('/\[(.*?)\] .*?\.(\w+): (.*?) (\{.*\})?/', $line, $matches)) {
                $timestamp = $matches[1];
                $level = $matches[2] ?? 'INFO';
                $message = $matches[3] ?? '';
                $context = $matches[4] ?? '{}';

                try {
                    $contextData = json_decode($context, true) ?? [];
                } catch (\Exception $e) {
                    $contextData = [];
                }

                $entries[] = [
                    'timestamp' => Carbon::parse($timestamp)->timestamp,
                    'datetime' => $timestamp,
                    'level' => strtolower($level),
                    'message' => $message,
                    'context' => $contextData,
                    'date' => $date,
                    'raw' => $line
                ];
            }
        }

        return $entries;
    }
}
