<?php

if (isset($_POST['cityName'])) {
    $cityName = urlencode($_POST['cityName']); 

    $apiUrl = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro&explaintext&titles={$cityName}&pithumbsize=100&redirects=1";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_USERAGENT, 'MyAppName/1.0 (http://Mydomain.com/)');

    $response = curl_exec($ch);
    curl_close($ch);

    echo $response;
} else {
    echo json_encode(["error" => "No city name provided"]);
}
