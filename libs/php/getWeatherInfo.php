<?php

// Remove for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (isset($_POST['lat']) && isset($_POST['lon'])) {
    $executionStartTime = microtime(true);
    $lat = $_POST['lat'];
    $lon = $_POST['lon'];
    $apiKey = '9c99df96443e47479a564004242207'; 
    $url = 'http://api.weatherapi.com/v1/current.json?key=' . $apiKey . '&q=' . $lat . ',' . $lon;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);
    curl_close($ch);

    $decode = json_decode($result, true);

    if ($decode) {
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
        $output['data'] = $decode;
    } else {
        $output['status']['code'] = "500";
        $output['status']['name'] = "error";
        $output['status']['description'] = "No data found for the given coordinates";
    }

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
} else {
    echo json_encode([
        'status' => [
            'code' => '400',
            'name' => 'failed',
            'description' => 'Coordinates not provided'
        ]
    ]);
}

?>
