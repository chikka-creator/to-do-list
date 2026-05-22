<?php

// Handle CORS for Vercel Serverless
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept");

// If it's an OPTIONS preflight request, exit immediately with 200 OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require __DIR__ . '/../public/index.php';
