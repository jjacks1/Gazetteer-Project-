<?php

// Remove for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (isset($_POST['countryCode'])) {
    $executionStartTime = microtime(true);
    $countryCode = $_POST['countryCode'];
    //$apiKey = 'fVG46miNLj6TMyDLZm06udtLjEzWzdZn';
    $apiKey = 'TVEeMWcJd768PsRaw4p4JctoLgoE3yOS';
    $year = '2024';
    $url = 'https://calendarific.com/api/v2/holidays?api_key=' . $apiKey . '&country=' . $countryCode . '&year=' . $year . '&type=national';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);
    curl_close($ch);

    $decode = json_decode($result, true);

    if ($decode && isset($decode['response']['holidays'])) {
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
        $output['data'] = $decode['response']['holidays'];
    } else {
        $output['status']['code'] = "500";
        $output['status']['name'] = "error";
        $output['status']['description'] = "No data found for the given country code";
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
