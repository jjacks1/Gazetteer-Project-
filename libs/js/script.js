
// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map;
var borderLayer;

// marker layers for cities, airports, and parks


var cityMarkersLayer = L.markerClusterGroup();
var airportMarkersLayer = L.markerClusterGroup();
var parkMarkersLayer = L.markerClusterGroup();


// tile layers

var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
  }
);

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  }
);

var basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

// buttons

var infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
    $("#infoModal").modal("show");
  });
  
var weatherBtn = L.easyButton("fa-cloud fa-xl", function (btn, map) {
    $("#weatherModal").modal("show");
});

var holidaysBtn = L.easyButton("fa-calendar-alt fa-xl", function (btn, map) {
    $("#holidaysModal").modal("show");
});

var landmarkBtn = L.easyButton("fa-landmark fa-xl", function (btn, map) {
    $("#landmarkModal").modal("show");
});

var newsBtn = L.easyButton("fa-newspaper fa-xl", function (btn, map) {
    $("#newsModal").modal("show");
});

var curConvertBtn = L.easyButton("fa-money-bill fa-xl", function (btn, map) {
    $("#currencyModal").modal("show");
});

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------


window.addEventListener('load', function() {
    // Show main content and remove preloader after a delay
    setTimeout(function() {
        var airplane = document.getElementById('airplane');
        airplane.style.opacity = '1';
        airplane.style.animation = 'fly 1s ease-in-out forwards';

        // After the airplane animation is done, remove the preloader
        document.body.classList.add('loaded');
    }, 4000); 

});


$(document).ready(function () {
    map = L.map("map", {
        layers: [streets]
    }).setView([54.5, -4], 6);

    layerControl = L.control.layers(basemaps, null, {collapsed: false}).addTo(map);

    //layer control
    layerControl.addOverlay(cityMarkersLayer, "Cities");
    layerControl.addOverlay(airportMarkersLayer, "Airports");
    layerControl.addOverlay(parkMarkersLayer, "Parks");

    // Add buttons to the map
    infoBtn.addTo(map);
    weatherBtn.addTo(map);
    holidaysBtn.addTo(map);
    landmarkBtn.addTo(map);
    newsBtn.addTo(map);
    curConvertBtn.addTo(map);

    $.getJSON('libs/php/getCountryList.php', function(data) {
        var select = $('#countrySelect');
        data.forEach(function(country) {
            var option = $('<option></option>')
                .attr('value', country.iso_a2)
                .text(country.name);
            select.append(option);
        });
    });

    getUserLocation();


    $("#countrySelect").on("change", function() {
        clearAllMarkers(); 
        var selectedCountryCode = $(this).val();
        getHolidaysInfo(selectedCountryCode);
        getCountryInfo(selectedCountryCode);
        getImagesInfo(selectedCountryCode);
        getNewsInfo(selectedCountryCode);
        drawCountryBorder(selectedCountryCode);
        getCitiesInfo(selectedCountryCode);
        getAirportsInfo(selectedCountryCode); 
        getParksInfo(selectedCountryCode);
        resetCurrencyModal();

    });

});

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
        console.error("Geolocation is not supported by this browser.");
        loadCountryData("GB"); // Default to the UK
    }
}

function successCallback(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    reverseGeocode(lat, lng);
}

function errorCallback(error) {
    console.error("Error getting location:", error);
    loadCountryData("GB"); // Default to the UK
}

function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    
    $.getJSON(url, function(data) {
        if (data && data.address && data.address.country_code) {
            const countryCode = data.address.country_code.toUpperCase(); 
            loadCountryData(countryCode);
        } else {
            console.error("Country code not found, using fallback.");
            loadCountryData("GB"); // Default to the UK
        }
    }).fail(function() {
        console.error("Error with reverse geocoding request.");
        loadCountryData("GB"); // Default to the UK
    });
}

function loadCountryData(countryCode) {
    $("#countrySelect").val(countryCode).trigger("change");
}

const cityIcon = L.ExtraMarkers.icon({
    icon: 'fa-map-marker-alt',
    markerColor: 'blue',
    shape: 'circle',
    prefix: 'fa'
});


function getCitiesInfo(selectedCountryCode) {
    $.ajax({
        url: 'libs/php/getMarkers.php',
        method: 'POST',
        data: { countryCode: selectedCountryCode },
        success: function(response) {
            if (response && response.data && Array.isArray(response.data)) {
                appendCityMarkers(response.data);
            } else {
                console.error("No city information found:", response.status.description);
            }
        },
        error: function(error) {
            console.error("Error fetching city information:", error);
        }
    });
}

function appendCityMarkers(cities) {
    cities.forEach(function(city) {
        const lat = parseFloat(city.lat);
        const lng = parseFloat(city.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng]);
            marker.on('click', function() {
                fetchWikipediaInfo(city.asciiName, marker);
            });
            cityMarkersLayer.addLayer(marker);
        } else {
            console.warn(`Invalid coordinates for city: ${city.asciiName}, lat: ${city.lat}, lng: ${city.lng}`);
        }
    });
    if (!map.hasLayer(cityMarkersLayer)) {
        map.addLayer(cityMarkersLayer); // Add the cluster group to the map
    }
}

// Airports logic

const airportIcon = L.ExtraMarkers.icon({
    icon: 'fa-plane',
    markerColor: 'orange-dark',
    shape: 'circle',
    prefix: 'fa'
});

function getAirportsInfo(selectedCountryCode) {
    $.ajax({
        url: 'libs/php/getAirports.php',
        method: 'POST',
        data: { countryCode: selectedCountryCode },
        success: function(response) {
            if (response && response.data && Array.isArray(response.data)) {
                appendAirportMarkers(response.data);
            } else {
                console.error("No airport information found:", response.status.description);
            }
        },
        error: function(error) {
            console.error("Error fetching airport information:", error);
        }
    });
}

function appendAirportMarkers(airports) {
    airports.forEach(function(airport) {
        const lat = parseFloat(airport.lat);
        const lng = parseFloat(airport.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng], { icon: airportIcon });
            marker.on('click', function() {
                fetchWikipediaInfo(airport.asciiName, marker);
            });
            airportMarkersLayer.addLayer(marker);
        } else {
            console.warn(`Invalid coordinates for airport: ${airport.asciiName}, lat: ${airport.lat}, lng: ${airport.lng}`);
        }
    });
    if (!map.hasLayer(airportMarkersLayer)) {
        map.addLayer(airportMarkersLayer); // Add the cluster group to the map
    }
}

// Parks logic

const parkIcon = L.ExtraMarkers.icon({
    icon: 'fa-tree',
    markerColor: 'green',
    shape: 'circle',
    prefix: 'fa'
});

function getParksInfo(selectedCountryCode) {
    $.ajax({
        url: 'libs/php/getParks.php',
        method: 'POST',
        data: { countryCode: selectedCountryCode },
        success: function(response) {
            if (response && response.data && Array.isArray(response.data)) {
                appendParkMarkers(response.data);
            } else {
                console.error("No park information found:", response.status.description);
            }
        },
        error: function(error) {
            console.error("Error fetching park information:", error);
        }
    });
}

function appendParkMarkers(parks) {
    parks.forEach(function(park) {
        const lat = parseFloat(park.lat);
        const lng = parseFloat(park.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng], { icon: parkIcon });
            marker.on('click', function() {
                fetchWikipediaInfo(park.asciiName, marker);
            });
            parkMarkersLayer.addLayer(marker);
        } else {
            console.warn(`Invalid coordinates for park: ${park.asciiName}, lat: ${park.lat}, lng: ${park.lng}`);
        }
    });
    if (!map.hasLayer(parkMarkersLayer)) {
        map.addLayer(parkMarkersLayer); // Add the cluster group to the map
    }
}

// Clear all marker layers

function clearAllMarkers() {
    cityMarkersLayer.clearLayers();
    airportMarkersLayer.clearLayers();
    parkMarkersLayer.clearLayers();
}

// Function to fetch Wikipedia information based on the name
function fetchWikipediaInfo(name, marker) {
    $.ajax({
        url: 'libs/php/getWikiInfo.php',
        method: 'POST',
        data: { cityName: name },
        success: function(response) {
            try {
                const data = JSON.parse(response);
                const pages = data.query.pages;
                const pageId = Object.keys(pages)[0];
                const page = pages[pageId];

                if (page && page.extract) {
                    const title = page.title;
                    const extract = page.extract ? page.extract.substring(0, 200) + '...' : 'No description available.';
                    const thumbnail = page.thumbnail ? page.thumbnail.source : 'path/to/placeholder_image.png';
                    const fullUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;

                    const popupContent = `
                        <b>${title}</b><br>
                        <img src="${thumbnail}" alt="${title}" width="100"><br>
                        ${extract}<br>
                        <a href="${fullUrl}" target="_blank">Read more</a>
                    `;

                    marker.bindPopup(popupContent).openPopup();
                } else {
                    marker.bindPopup(`<b>${name}</b><br>No Wikipedia information found.`).openPopup();
                }
            } catch (e) {
                console.error("Error parsing Wikipedia response:", e);
                marker.bindPopup(`<b>${name}</b><br>Error fetching Wikipedia information.`).openPopup();
            }
        },
        error: function() {
            marker.bindPopup(`<b>${name}</b><br>Error fetching Wikipedia information.`).openPopup();
        }
    });
}
// Country Information
function getCountryInfo(selectedCountryCode) {
    $.ajax({
        url: 'libs/php/getCountryInfo.php',
        method: 'POST',
        data: {
            countryCode: selectedCountryCode
        },
        success: function(response) {
            if (response && response.data) {
                var countryInfo = response.data;
                appendCountryInfo(countryInfo);

                var capitalLat = countryInfo[0].capitalInfo.latlng[0];
                var capitalLon = countryInfo[0].capitalInfo.latlng[1];
                var countryLat = countryInfo[0].latlng[0];
                var countryLon = countryInfo[0].latlng[1];
                var baseCurrency = Object.keys(countryInfo[0].currencies)[0];
                currencyCode = baseCurrency;
                var currencyName = countryInfo[0].currencies[baseCurrency].name;

                $("#baseCurrencyText").text(currencyName);
                convertCurrency();

                
                //map.setView([capitalLat, capitalLon], 6); 
                //map.setView([countryLat, countryLon], 4);
                
                
                getWeatherInfo(capitalLat, capitalLon);
                getImagesInfo(capitalLat, capitalLon);
                //getCurrencyInfo(currencyCode);
        

            } else {
                console.error("No country information found.");
            }
        },
        error: function(error) {
            console.error("Error fetching country information:", error);
        }
    });
}


function appendCountryInfo(countryInfo) {
    const info = countryInfo[0];

    const currencies = Object.values(info.currencies).map(currency => `${currency.name} (${currency.symbol})`).join(', ');

    const languages = Object.values(info.languages).join(', ');

    // Update modal with country information
    $("#contRslt").html(info.continents.join(', '));
    $("#capRslt").html(info.capital.join(', '));
    $("#currRslt").html(currencies);
    $("#popRslt").html(info.population.toLocaleString());
    $("#langRslt").html(languages);
    $("#tzRslt").html(info.timezones.join(', '));
}

//Weather Modal
function getWeatherInfo(lat, lon) {
    $.ajax({
        url: 'libs/php/getWeatherInfo.php',
        method: 'POST',
        data: {
            lat: lat,
            lon: lon
        },
        success: function(response) {
            if (response && response.data) {
                appendWeatherInfo(response.data);
            } else {
                console.error("No weather information found.");
            }
        },
        error: function(error) {
            console.error("Error fetching weather information:", error);
        }
    });
}

function appendWeatherInfo(weatherInfo) {
    var location = weatherInfo.location;
    var current = weatherInfo.current;

    $("#locTime").text(location.localtime);
    $("#locCity").text(location.name + ", " + location.country);
    $("#curTempt").html(current.temp_c + " °C <img src='" + current.condition.icon + "' alt='" + current.condition.text + "'>");
    $("#feelsLike").text(current.feelslike_c + " °C");
    $("#condTxt").text(current.condition.text);
}

//Holidays Modal
function getHolidaysInfo(selectedCountryCode) {
    $.ajax({
        url: 'libs/php/getHolidays.php',
        method: 'POST',
        data: { countryCode: selectedCountryCode },
        success: function(response) {
            if (response && response.data) {
                appendHolidaysInfo(response.data);
            } else {
                console.error("No holidays information found.");
            }
        },
        error: function(error) {
            console.error("Error fetching holidays information:", error);
        }
    });
}

function appendHolidaysInfo(holidays) {
    const table = $("#holidaysInfoTable");

    table.empty();

    const headerRow = `
    <tr> 
        <th><strong>Holiday</strong></th>
        <th><strong>Info</strong></th>
        <th><strong>Type</strong></th>
    </tr>`;
    table.append(headerRow);

    holidays.forEach(holiday => {
        
        const row = `
        <tr>
            <td><strong>${holiday.name}</strong><br>${holiday.date.iso}</td>
            <td>${holiday.description}</td>
            <td>${holiday.primary_type}</td>
        </tr>`;
        table.append(row);
    }); 
}

//Landmark images Modal 
function getImagesInfo(capitalLat, capitalLon) {
    $.ajax({
        url: 'libs/php/getImages.php',
        method: 'POST',
        data: {
            capitalLat: capitalLat,
            capitalLon: capitalLon
        },
        success: function(response) {
            if (response && response.data) {
                appendImagesInfo(response.data);
           // } else {
                //console.error("No images information found.");
            }
        },
        error: function(error) {
            console.error("Error fetching images information:", error);
        }
    });
}

function appendImagesInfo(places) {
    const table = $("#imagesTable");

    table.empty();

    places.forEach(place => {
        const photoReference = place.photos ? place.photos[0].photo_reference : null;
        const imageUrl = photoReference ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=AIzaSyAHU0gX6wBG6piyhBu-5b37ZL7IgjJ5QOY` : 'No image available';

        const row = `
        <tr>
            <td><strong>${place.name}</strong><br>${place.vicinity}</td>
            <td>${photoReference ? `<img src="${imageUrl}" alt="${place.name}" width="200">` : 'No image available'}</td>
        </tr>`;
        table.append(row);
    });
}

//News Modal Button
function getNewsInfo(selectedCountryCode) {
    $.ajax({
        url: 'libs/php/getNews.php',
        method: 'POST',
        data: { countryCode: selectedCountryCode },
        success: function(response) {
            if (response && response.data && Array.isArray(response.data)) {
                appendNewsInfo(response.data);
            } else {
                console.error("No news information found:", response.status.description);
            }
        },
        error: function(error) {
            console.error("Error fetching news information:", error);
        }
    });
}

function appendNewsInfo(news) {
    const table = $("#newsTable");
    const placeholderImage = 'path/to/placeholder_image.png'; 

    table.empty();

    if (news && news.length > 0) {
        news.forEach(article => {
            const imageUrl = article.image || placeholderImage; 
            const row = `
            <tr>
                <td><strong>${article.title}</strong></td>
                <td>${article.author || 'Unknown Author'}</td>
                <td><a href="${article.url}" target="_blank">Read more</a></td>
                <td><img src="${imageUrl}" alt="${article.title}" width="100"></td>
            </tr>`;
            table.append(row);
        });
    } else {
        const row = `<tr><td colspan="4">No news available</td></tr>`;
        table.append(row);
    }
}


//Currency converter Modal
function convertCurrency() {
    const amount = $('#amount').val();
    const fromCurrency = currencyCode;
    const toCurrency = 'GBP';

    if (!amount || isNaN(amount)) {
        $('#conversionResult').text('Invalid amount');
        return;
    }

    $.ajax({
        url: 'libs/php/getCurrConversion.php',
        method: 'POST',
        data: {
            baseCurrency: fromCurrency
        },
        success: function(response) {
            if (response && response.data && response.data.conversion_rate) {
                const conversionRate = response.data.conversion_rate;
                const convertedAmount = (amount * conversionRate).toFixed(2);
                $('#conversionResult').text(convertedAmount + ' GBP');
            } else {
                console.error("No currency conversion rate found.", response);
                $('#conversionResult').text('Conversion error');
            }
        },
        error: function(error) {
            console.error("Error fetching currency conversion rate:", error);
            $('#conversionResult').text('Conversion error');
        }
    });
}

$(document).ready(function() {

    $('#amount').on('keyup', function() {
        convertCurrency();
    });
});

function resetCurrencyModal() {
    $('#amount').val('1'); 
    $('#conversionResult').text(''); 
}

$('#currencyModal').on('hidden.bs.modal', function () {
    resetCurrencyModal();
});


//Logic for country borders
function drawCountryBorder(selectedCountryCode) {
    $.ajax({
        url: 'libs/php/getCountryBorders.php',
        method: 'POST',
        data: {
            countryCode: selectedCountryCode
        },
        success: function(response) {
            console.log("Response for country code", selectedCountryCode, response); 
            if (response && response.data) {
                if (borderLayer) {
                    map.removeLayer(borderLayer);
                }

        
                var geoJsonFeature = {
                    "type": "Feature",
                    "geometry": {
                        "type": Array.isArray(response.data[0][0][0]) ? "MultiPolygon" : "Polygon",
                        "coordinates": response.data
                    }
                };

                borderLayer = L.geoJSON(geoJsonFeature, {
                    style: {
                        color: "blue",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.2
                    }
                }).addTo(map);

                var bounds = borderLayer.getBounds();
                var center = bounds.getCenter();

                //var fixedZoomLevel = 5;

                //map.setView(center, fixedZoomLevel); 

                map.fitBounds(borderLayer.getBounds());
            } else {
                console.error("No border information found.");
            }
        },
        error: function(error) {
            console.error("Error fetching border information:", error);
        }
    });
}