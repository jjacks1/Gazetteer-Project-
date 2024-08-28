<?php

// Remove for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

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

$countryList = [];

foreach ($jsonData['features'] as $feature) {
    $countryList[] = [
        'name' => $feature['properties']['name'],
        'iso_a2' => $feature['properties']['iso_a2']
    ];
}

usort($countryList, function($a, $b) {
    return strcmp($a['name'], $b['name']);
});

header('Content-Type: application/json');
echo json_encode($countryList);

?>
