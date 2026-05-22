<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

// Fix for Vercel Serverless read-only filesystem
if (isset($_SERVER['VERCEL']) || isset($_ENV['VERCEL'])) {
    ini_set('display_errors', '0'); // Prevent warnings from corrupting JSON
    $storagePath = '/tmp/storage';
    $app->useStoragePath($storagePath);
    
    // Ensure all required storage directories exist
    $directories = [
        $storagePath . '/app',
        $storagePath . '/framework/cache/data',
        $storagePath . '/framework/sessions',
        $storagePath . '/framework/testing',
        $storagePath . '/framework/views',
        $storagePath . '/logs',
    ];
    
    foreach ($directories as $directory) {
        if (!is_dir($directory)) {
            @mkdir($directory, 0777, true);
        }
    }
}

$app->handleRequest(Request::capture());
