<?php

	$executionStartTime = microtime(true);

	$result = file_get_contents('../js/json/countryBorders.geo.json');
    
	$decode = json_decode($result, true);	

	$countries = $decode['features'];

	foreach ($countries as &$country) {

		if ($country['properties']['name'] == 'Kosovo') {
			$country['properties']["iso_a2"] = 'XK';
		}

		if ($country['properties']['name'] == 'Somaliland') {
			$country['properties']["iso_a2"] = 'SO';
		}

	}
	
	$selectedCountry = [];

	$selectedCountry = array_filter($countries, function ($country) {
		return ($country['properties']['iso_a2'] == $_REQUEST['countryCode']);
	});

	$selectedCountry = array_values($selectedCountry)[0];

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $selectedCountry;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 
    
?>
