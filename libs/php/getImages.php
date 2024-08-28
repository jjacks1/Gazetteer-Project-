<?php
// Remove for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (isset($_POST['capitalLat']) && isset($_POST['capitalLon'])) {
    $executionStartTime = microtime(true);
    $capitalLat = $_POST['capitalLat'];
    $capitalLon = $_POST['capitalLon'];
    $apiKey = 'AIzaSyAHU0gX6wBG6piyhBu-5b37ZL7IgjJ5QOY';
    $query = urlencode('landmarks or popular places');

    $url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' . $capitalLat . ',' . $capitalLon . '&radius=50000&type=tourist_attraction&keyword=' . $query . '&key=' . $apiKey;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);
    curl_close($ch);

    $decode = json_decode($result, true);

    if ($decode && isset($decode['results'])) {
        $places = $decode['results'];
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
        $output['data'] = $places;
    } else {
        $output['status']['code'] = "500";
        $output['status']['name'] = "error";
        $output['status']['description'] = "No data found for the given location";
    }

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
} else {
    echo json_encode([
        'status' => [
            'code' => '400',
            'name' => 'failed',
            'description' => 'Latitude and longitude not provided'
        ]
    ]);
}
?>
