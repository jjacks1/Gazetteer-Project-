<?php
// Remove for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (isset($_POST['countryCode'])) {
    $executionStartTime = microtime(true);
    $countryCode = $_POST['countryCode'];
    $apiKey = 'fXnq3-3lc3hB1ngwOwx6-rARq-mGFYed6zJZSL1w3a-FR58k'; 

    $url = 'https://api.currentsapi.services/v1/latest-news?country=' . $countryCode . '&apiKey=' . $apiKey;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result, true);


    if ($decode && isset($decode['news']) && count($decode['news']) > 0) {
        $news = $decode['news'];
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
        $output['data'] = $news;
    } else {
        $output['status']['code'] = "500";
        $output['status']['name'] = "error";
        $output['status']['description'] = isset($decode['message']) ? $decode['message'] : "No news found for the given country";
        $output['data'] = $decode; 
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
