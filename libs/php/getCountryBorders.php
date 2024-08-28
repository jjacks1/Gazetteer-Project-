<?php

// Remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (isset($_POST['countryCode'])) {
    $executionStartTime = microtime(true);
    $countryCode = $_POST['countryCode'];
    $jsonFilePath = '../json/countryBorders.geo.json';

    if (!file_exists($jsonFilePath)) {
        echo json_encode([
            'status' => [
                'code' => '500',
                'name' => 'error',
                'description' => 'File not found: ' . $jsonFilePath
            ]
        ]);
        exit;
    }

    $jsonString = file_get_contents($jsonFilePath);

    if ($jsonString === false || json_decode($jsonString, true) === null) {
        echo json_encode([
            'status' => [
                'code' => '500',
                'name' => 'error',
                'description' => 'Invalid JSON content in file: ' . $jsonFilePath
            ]
        ]);
        exit;
    }

    $jsonData = json_decode($jsonString, true);
    $borders = [];

    foreach ($jsonData['features'] as $feature) {
        if ($feature['properties']['iso_a2'] === $countryCode) {
            $borders = $feature['geometry']['coordinates'];
            break;
        }
    }

    if (!empty($borders)) {
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
        $output['data'] = $borders; 
    } else {
        $output['status']['code'] = "500";
        $output['status']['name'] = "error";
        $output['status']['description'] = "No borders found for country code: " . $countryCode;
    }

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
} else {
    echo json_encode([
        'status' => [
            'code' => '400',
            'name' => 'failed',
            'description' => 'Country code not provided'
        ]
    ]);
}

?> 
