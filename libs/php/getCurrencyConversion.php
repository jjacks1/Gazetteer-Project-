<?php

// Remove for production
/*ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (isset($_POST['baseCurrency'])) {
    $executionStartTime = microtime(true);
    $baseCurrency = $_POST['baseCurrency'];
    $apiKey = '00f0c43b87477e2bee4f66ff';
    $url = 'https://v6.exchangerate-api.com/v6/' . $apiKey . '/pair/' . $baseCurrency . '/GBP';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);
    curl_close($ch);

    $decode = json_decode($result, true);

    if (isset($decode['conversion_rate'])) {
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
        $output['data'] = $decode; 
    } else {
        $output['status']['code'] = "500";
        $output['status']['name'] = "error";
        $output['status']['description'] = "No data found for currency: " . $baseCurrency;
    }

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
} else {
    echo json_encode([
        'status' => [
            'code' => '400',
            'name' => 'failed',
            'description' => 'Base currency not provided'
        ]
    ]);
}

?>
