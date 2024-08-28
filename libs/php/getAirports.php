<?php
// Remove for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (isset($_POST['countryCode'])) {
    $executionStartTime = microtime(true);
    $countryCode = $_POST['countryCode'];

    $url = 'http://api.geonames.org/searchJSON?formatted=true&q=airport&country=' . $countryCode . '&maxRows=15&lang=es&username=jjacks1_&style=full';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);
    curl_close($ch);

    $decode = json_decode($result, true);

    if (isset($decode['geonames'])) {
        
        usort($decode['geonames'], function($a, $b) {
            return $b['score'] <=> $a['score'];
        });
        $topAirports = array_slice($decode['geonames'], 0, 4);

        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
        $output['data'] = $topAirports;
    } else {
        $output['status']['code'] = "500";
        $output['status']['name'] = "error";
        $output['status']['description'] = "No data found for country code: " . $countryCode;
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
