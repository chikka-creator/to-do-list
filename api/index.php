<?php

// ===== CORS headers (must be first, before anything else) =====
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept");

// Handle OPTIONS preflight immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ===== Force environment variables for Vercel =====
// Vercel may not pass env vars through $_SERVER or $_ENV reliably.
// We force the critical ones here via putenv so Laravel's env() helper can read them.
$isVercel = isset($_SERVER['VERCEL']) || isset($_ENV['VERCEL']) || getenv('VERCEL');

if ($isVercel) {
    // Suppress any PHP warnings/notices that could corrupt JSON output
    error_reporting(0);
    ini_set('display_errors', '0');

    // Force critical env vars if not already set
    if (!getenv('DB_CONNECTION')) {
        putenv('DB_CONNECTION=pgsql');
    }
    if (!getenv('SESSION_DRIVER')) {
        putenv('SESSION_DRIVER=array');
    }
    if (!getenv('CACHE_STORE')) {
        putenv('CACHE_STORE=array');
    }
    if (!getenv('LOG_CHANNEL')) {
        putenv('LOG_CHANNEL=stderr');
    }
    if (!getenv('APP_ENV')) {
        putenv('APP_ENV=production');
    }
    if (!getenv('APP_DEBUG')) {
        putenv('APP_DEBUG=false');
    }

    // Pre-create /tmp/storage directories BEFORE Laravel boots
    $storageDirs = [
        '/tmp/storage/app',
        '/tmp/storage/framework/cache/data',
        '/tmp/storage/framework/sessions',
        '/tmp/storage/framework/testing',
        '/tmp/storage/framework/views',
        '/tmp/storage/logs',
    ];
    foreach ($storageDirs as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0777, true);
        }
    }
}

// ===== Boot Laravel inside try-catch to capture ALL errors =====
try {
    require __DIR__ . '/../public/index.php';
} catch (\Throwable $e) {
    // If Laravel crashes fatally, return a JSON error instead of Vercel's generic 500 HTML
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ]);
    exit(1);
}
