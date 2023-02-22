//global variables
let lat;
let lng;
let borderLayer;
let capital;
let countryAnthem;

//loader
$(window).on("load", function () {

  if ($("#preloader").length) {
    $("#preloader")
      .delay(1000)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }

  navigator.geolocation.getCurrentPosition(onSuccess, onError);

});

//myLocation functionality
const onSuccess = (position) => {
  lat = position.coords.latitude;
  lng = position.coords.longitude;
  getCountryCode();
};

const onError = (error) => {
  console.log(error);
};

// m/s to km/h
function ms2km(num) {
  return Math.round((num / 1000) * 60 * 60);
}

//format large number with commas
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//replace whitespace
const replaceWhitespace = (string) => {
  return string = string.replace(" ", "_");
};

const replaceWhitespace20 = (string) => {
  return string = string.replace(" ", "%20");
};

//capitalize 1st letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

//populate select options
$(document).ready(function () {
  $.ajax({
    url: "libs/php/getSelectOptions.php",
    type: "POST",
    dataType: "json",
    success: function (result) {

      let countries = result['data'];

      countries.forEach((country) =>
        $("#selCountry").append(
          new Option(
            country['name'],
            country['code']
          )
        )
      );

      $("#selCountry option[value='SO1']").remove();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
});

//getCountryBorders
const getCountryBorders = function () {
  $.ajax({
    url: "libs/php/getCountryBorders.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: countryCode
    },
    success: function (result) {

      let geoJSON = result.data

      //remove old border
      if (borderLayer) {
        borderLayer.remove();
      }

      //add new border
      const borderStyle = {
        color: "red",
        weight: 1,
        fillColor: "red",
        fillOpacity: 0.1,
      };

      borderLayer = L.geoJson(geoJSON, {
        style: borderStyle,
      }).addTo(map);

      map.fitBounds(borderLayer.getBounds().pad(0.1));
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};

//Layer and cluster groups
let POIs = L.markerClusterGroup({
  spiderfyOnMaxZoom: false,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  removeOutsideVisibleBounds: true,
  maxClusterRadius: 50,
	iconCreateFunction: function (cluster) {
    var childCount = cluster.getChildCount();
    var c = ' marker-cluster-';
    if (childCount < 10) {
      c += 'small';
    }
    else if (childCount < 100) {
      c += 'medium';
    }
    else {
      c += 'large';
    }

    return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>',
     className: 'POIs marker-cluster' + c, iconSize: new L.Point(40, 40) });
  }
});

webcams = L.markerClusterGroup({
  spiderfyOnMaxZoom: false,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  removeOutsideVisibleBounds: true,
  maxClusterRadius: 70,
	iconCreateFunction: function (cluster) {
    var childCount = cluster.getChildCount();
    var c = ' marker-cluster-';
    if (childCount < 10) {
      c += 'small';
    }
    else if (childCount < 100) {
      c += 'medium';
    }
    else {
      c += 'large';
    }

    return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>',
     className: 'webcams marker-cluster' + c, iconSize: new L.Point(40, 40) });
  }
});

//getCities
function getCities() {
  $.ajax({
    url: "libs/php/getCities.php",
    type: "POST",
    dataType: "json",
    data : {
      countryCode: countryCode
    },
    success: function (result) {
      const json = result;
      let citiesJSON = {
        type: "FeatureCollection",
        features: [],
      };

      for (i = 0; i < json.data.length; i++) {
        citiesJSON.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [json.data[i].lng, json.data[i].lat]
          },
          "properties": {
            "name": json.data[i].name,
            "countryName": json.data[i].countryName
          }
        });
      }

      citiesJSON = citiesJSON["features"];

      function onEachFeature(feature, layer) {
        if (feature.properties.name) {
          layer.bindPopup(
            feature.properties.name
          );
          layer.on("mouseover", function () {
            layer.openPopup();
          });
          layer.on("click", function () {
            layer.openPopup();
          });
        }
      }

      var citiesMarker = L.ExtraMarkers.icon({
        icon: 'fa-city',
        extraClasses: 'fa-2x',
        markerColor: 'violet',
        shape: 'circle',
        prefix: 'fas',
        shadowSize: [0, 0]
      });

      function pointToLayer(feature, latlng){
        return L.marker(latlng,{icon: citiesMarker});
      }

      L.geoJSON(citiesJSON, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
      }).addTo(POIs);

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  })
};

//getStadia
function getStadia() {
  $.ajax({
    url: "libs/php/getStadia.php",
    type: "POST",
    dataType: "json",
    data : {
      countryCode: countryCode
    },
    success: function (result) {
      const json = result;
      let stadiaJSON = {
        type: "FeatureCollection",
        features: [],
      };

      for (i = 0; i < json.data.length; i++) {
        stadiaJSON.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [json.data[i].lng, json.data[i].lat]
          },
          "properties": {
            "name": json.data[i].toponymName,
            "countryName": json.data[i].countryName
          }
        });
      }

      stadiaJSON = stadiaJSON["features"];

      function onEachFeature(feature, layer) {
        if (feature.properties.name) {
          layer.bindPopup(
            feature.properties.name
          );
          layer.on("mouseover", function () {
            layer.openPopup();
          });
          layer.on("click", function () {
            layer.openPopup();
          });
        }
      }

      var stadiaMarker = L.ExtraMarkers.icon({
        icon: 'fa-futbol',
        extraClasses: 'fa-3x',
        markerColor: 'red',
        shape: 'circle',
        prefix: 'fas',
        shadowSize: [0, 0]
      });

      function pointToLayer(feature, latlng){
        return L.marker(latlng,{icon: stadiaMarker});
      }

      L.geoJSON(stadiaJSON, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
      }).addTo(POIs);

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  })
};

//getAirports
function getAirports() {
  $.ajax({
    url: "libs/php/getAirports.php",
    type: "POST",
    dataType: "json",
    data : {
      countryCode: countryCode
    },
    success: function (result) {
      const json = result;
      let airportsJSON = {
        type: "FeatureCollection",
        features: [],
      };

      for (i = 0; i < json.data.length; i++) {
        airportsJSON.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [json.data[i].lng, json.data[i].lat]
          },
          "properties": {
            "name": json.data[i].name,
            "countryName": json.data[i].countryName
          }
        });
      }

      airportsJSON = airportsJSON["features"];

      function onEachFeature(feature, layer) {
        if (feature.properties.name) {
          layer.bindPopup(
            feature.properties.name
          );
          layer.on("mouseover", function () {
            layer.openPopup();
          });
          layer.on("click", function () {
            layer.openPopup();
          });
        }
      }

      var airportsMarker = L.ExtraMarkers.icon({
        icon: 'fa-plane',
        extraClasses: 'fa-3x',
        markerColor: 'pink',
        shape: 'circle',
        prefix: 'fas',
        shadowSize: [0, 0]
      });

      function pointToLayer(feature, latlng){
        return L.marker(latlng,{icon: airportsMarker});
      }

      L.geoJSON(airportsJSON, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
      }).addTo(POIs);

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  })
};

//getParks
function getParks() {
  $.ajax({
    url: "libs/php/getParks.php",
    type: "POST",
    dataType: "json",
    data : {
      countryCode: countryCode
    },
    success: function (result) {
      const json = result;
      let parksJSON = {
        type: "FeatureCollection",
        features: [],
      };

      for (i = 0; i < json.data.length; i++) {
        parksJSON.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [json.data[i].lng, json.data[i].lat]
          },
          "properties": {
            "name": json.data[i].toponymName,
            "countryName": json.data[i].countryName
          }
        });
      }

      parksJSON = parksJSON["features"];

      function onEachFeature(feature, layer) {
        if (feature.properties.name) {
          layer.bindPopup(
            feature.properties.name
          );
          layer.on("mouseover", function () {
            layer.openPopup();
          });
          layer.on("click", function () {
            layer.openPopup();
          });
        }
      }

      var parksMarker = L.ExtraMarkers.icon({
        icon: 'fa-tree',
        extraClasses: 'fa-3x',
        markerColor: 'green',
        shape: 'circle',
        prefix: 'fas',
        shadowSize: [0, 0]
      });

      function pointToLayer(feature, latlng){
        return L.marker(latlng,{icon: parksMarker});
      }

      L.geoJSON(parksJSON, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
      }).addTo(POIs);

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  })
};

//getHistorical
function getHistorical() {
  $.ajax({
    url: "libs/php/getHistorical.php",
    type: "POST",
    dataType: "json",
    data : {
      countryCode: countryCode
    },
    success: function (result) {
      const json = result;
      let historicalJSON = {
        type: "FeatureCollection",
        features: [],
      };

      for (i = 0; i < json.data.length; i++) {
        historicalJSON.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [json.data[i].lng, json.data[i].lat]
          },
          "properties": {
            "name": json.data[i].toponymName,
            "countryName": json.data[i].countryName
          }
        });
      }

      historicalJSON = historicalJSON["features"];

      function onEachFeature(feature, layer) {
        if (feature.properties.name) {
          layer.bindPopup(
            feature.properties.name
          );
          layer.on("mouseover", function () {
            layer.openPopup();
          });
          layer.on("click", function () {
            layer.openPopup();
          });
        }
      }

      var historicalMarker = L.ExtraMarkers.icon({
        icon: 'fa-monument',
        extraClasses: 'fa-3x',
        markerColor: 'black',
        shape: 'circle',
        prefix: 'fas',
        shadowSize: [0, 0]
      });

      function pointToLayer(feature, latlng){
        return L.marker(latlng,{icon: historicalMarker});
      }

      L.geoJSON(historicalJSON, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
      }).addTo(POIs);

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  })
};

//getWebcams
function getWebcams() {
  $.ajax({
    url: "libs/php/getWebcams.php",
    type: "POST",
    dataType: "json",
    data : {
      countryCode: countryCode
    },

    success: function (result) {

      const json = result;

      let webcamsJSON = {
        type: "FeatureCollection",
        features: [],
      };

      for (i = 0; i < json.data.webcams.length; i++) {

        webcamsJSON.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [json.data.webcams[i].location.longitude, json.data.webcams[i].location.latitude]
          },
          "properties": {
            "name": json.data.webcams[i].title,
            "countryName": json.data.webcams[i].location.country,
            "dayEmbed": json.data.webcams[i].player.day.embed,
            "thumbnail": json.data.webcams[i].image.current.thumbnail,
            "toenail": json.data.webcams[i].image.current.toenail,
            "icon": json.data.webcams[i].image.current.icon,
            "url": json.data.webcams[i].url.current.desktop
          }
        });
      }

      webcamsJSON = webcamsJSON["features"];

      function onEachFeature(feature, layer) {
        let dayEmbed = feature.properties.dayEmbed;
        let url = feature.properties.url;
        let webcamTitle = feature.properties.name;

        if (feature.properties.dayEmbed) {
          layer.bindPopup(
            // `<a href="#"><img class="webcamIcon" src=${feature.properties.icon}></a>`
            `<iframe id="miniWebcamFrame" src=${dayEmbed} title="miniWebcam" allow='autoplay'></iframe>`
          );
          layer.on("mouseover", function () {
            //layer.openPopup();
            // $("#webcamFrame").attr("src", dayEmbed);
            // $("#webcamLink").attr("href", url);
            // $("#webcamTitle").html(webcamTitle);
          });
          layer.on("click", function () {
            layerControl.collapse();
            layer.openPopup();
            map.panTo(this.getLatLng());
            // $("#webcamFrame").attr("src", dayEmbed);
            // $("#webcamLink").attr("href", url);
            // $("#webcamTitle").html(webcamTitle);
          });
        }
      }

      var webcamsMarker = L.ExtraMarkers.icon({
        icon: 'fa-video',
        extraClasses: 'fa-3x',
        markerColor: 'orange',
        shape: 'circle',
        prefix: 'fas',
        shadowSize: [0, 0]
      });

      function pointToLayer(feature, latlng){
        return L.marker(latlng,{icon: webcamsMarker});
      }

      L.geoJSON(webcamsJSON, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
      }).addTo(POIs);

      $('body').on('click', '.webcamIcon', function(){
        $('#webcamModal').modal('show');
      });

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
    },
  })
};


//add map layers
const blank = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  }
);

const satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

const labelled = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }
);

//initialize map
const map = L.map("map", { zoomControl: true}).setView([0, 0], 2);
labelled.addTo(map,);

// easyButtons
L.easyButton('fas fa-location-arrow fa-1x', function(btn, map){
  navigator.geolocation.getCurrentPosition(onSuccess, onError);
}, 'Use my location').addTo(map);

L.easyButton('fas fa-random fa-1x', function(btn, map){
  const select = document.getElementById("selCountry");
  const items = select.getElementsByTagName("option");
  const index = Math.floor(Math.random() * items.length);
  select.selectedIndex = index;

  getLatLng();
}, 'Random country').addTo(map);

L.easyButton('fas fa-info fa-1x', function(btn, map){
  $('#infoModal').modal('show');
}, 'Country Info').addTo(map);

L.easyButton('fas fa-sun fa-1x', function(btn, map){
  $('#weatherModal').modal('show');
}, 'Weather').addTo(map);

L.easyButton('fas fa-dollar-sign fa-1x', function(btn, map){
  $('#financeModal').modal('show');
}, 'Financial Data').addTo(map);

L.easyButton('fas fa-flag fa-1x', function(btn, map){
  $('#flagModal').modal('show');
}, 'Flag').addTo(map);

L.easyButton('fas fa-music fa-1x', function(btn, map){
  $('#anthemModal').modal('show');
}, 'National Anthem').addTo(map);

L.easyButton('far fa-newspaper fa-1x', function(btn, map){
  $('#newsModal').modal('show');
}, 'Latest Headlines').addTo(map);

L.easyButton('fas fa-virus fa-1x', function(btn, map){
  $('#covidModal').modal('show');
}, 'Covid-19 Data').addTo(map);

//layer control
const baseMaps = {
  Labelled: labelled,
  Blank: blank,
  Satellite: satellite

};

const overlays = {
  "POIs": POIs,
  //"Webcams": webcams
};

const layerControl = new L.Control.Layers(
  baseMaps,
  overlays,
  {
    collapsed: true
  }
).addTo(map);

// document.addEventListener('click', function() {
//   layerControl.collapse();
// });

// document.querySelector("div.leaflet-top.leaflet-right > div").addEventListener('click', function(event) {
//   event.stopPropagation();
// });

//map scale
L.control.scale().addTo(map);

//creates popups
const popup = L.popup();
const capitalPopup = L.popup();
const oceanPopup = L.popup();

//show modalButton
const showModalButton = function () {
  $("#modalButton").show();
};

//show modalButton
const showCheckbox = function () {
  document.querySelector("#map > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > label:nth-child(5)").css( "display", "block" );
};

//getOcean
const getOcean = function () {
  $.ajax({
    url: "libs/php/getOcean.php",
    type: "POST",
    dataType: "json",
    data: {
      lat: lat,
      lng: lng,
    },
    success: function (result) {
      console.log(JSON.stringify(result));

      if (result.status.name == "ok" && result["data"]["ocean"]) {
        oceanPopup
          .setLatLng(L.latLng(lat, lng))
          .setContent(result["data"]["ocean"]["name"])
          .openOn(map);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//getNeighbours
const getNeighbours = function () {
  $.ajax({
    url: "libs/php/getNeighbours.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: countryCode,
    },
    success: function (result) {

      if (result["data"][1]) {
        $('#neighboursWord').html("Border Neighbours");
      } else {
        $('#neighboursWord').html("Border Neighbour");
      }

      if (!result["data"][0]) {
        $('#neighboursWord').html("Border Neighbours");
        $("#neighboursTxt").html("None");
      } else {
        let countries = result["data"].map(function (country) {
          return country["countryName"];
        }).join(", ");

        $("#neighboursTxt").html(countries);
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//getTime
const getTime = function () {
  $.ajax({
    url: "libs/php/getTime.php",
    type: "POST",
    dataType: "json",
    data: {
      lat: lat,
      lng: lng,
    },
    success: function (result) {

      let parsedDate = Date.parse(result["data"]["time"]);

      $("#dateTxt").html(`${parsedDate.toString("ddd d MMM")}`);
      $("#weatherDate").html(`${parsedDate.toString("ddd d MMM, HH:mm")}`);
      $("#timeTxt").html(`${parsedDate.toString("HH:mm")}`);

      let datePlus1 = parsedDate.add(1).days();
      $("#day2").html(`${datePlus1.toString("ddd d")}`);

      let datePlus2 = datePlus1.add(1).days();
      $("#day3").html(`${datePlus2.toString("ddd d")}`);

      let datePlus3 = datePlus2.add(1).days();
      $("#day4").html(`${datePlus3.toString("ddd d")}`);

      let datePlus4 = datePlus3.add(1).days();
      $("#day5").html(`${datePlus3.toString("ddd d")}`);

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//getWeather
const getWeather = function () {
  $.ajax({
    url: "libs/php/getWeather.php",
    type: "POST",
    dataType: "json",
    data: {
      lat: lat,
      lng: lng,
    },
    success: function (result) {

      let iconSrc = "https://openweathermap.org/img/wn/" + result["data"]["current"]['weather'][0]["icon"] + "@4x.png";
      $("#largeWeatherIcon").attr("src", iconSrc);

      let temp = Math.round(result['data']['current']['temp']);

      $("#currentTemp").html(`${temp}&deg;C`);

      $('#weatherDescription').html(capitalizeFirstLetter(result['data']["current"]['weather'][0]["description"]));

      let iconSrc2 = "https://openweathermap.org/img/wn/" + result["data"]["daily"][1]['weather'][0]["icon"] + "@4x.png";
      $('#weatherIcon2').attr("src", iconSrc2);

      let iconSrc3 = "https://openweathermap.org/img/wn/" + result["data"]["daily"][2]['weather'][0]["icon"] + "@4x.png";
      $('#weatherIcon3').attr("src", iconSrc3);

      let iconSrc4 = "https://openweathermap.org/img/wn/" + result["data"]["daily"][3]['weather'][0]["icon"] + "@4x.png";
      $('#weatherIcon4').attr("src", iconSrc4);

      let iconSrc5 = "https://openweathermap.org/img/wn/" + result["data"]["daily"][4]['weather'][0]["icon"] + "@4x.png";
      $('#weatherIcon5').attr("src", iconSrc5);

      $("#day2Temp").html(`${Math.round(result["data"]["daily"][1]['temp']['day'])}&deg;C`);
      $("#day3Temp").html(`${Math.round(result["data"]["daily"][2]['temp']['day'])}&deg;C`);
      $("#day4Temp").html(`${Math.round(result["data"]["daily"][3]['temp']['day'])}&deg;C`);
      $("#day5Temp").html(`${Math.round(result["data"]["daily"][4]['temp']['day'])}&deg;C`);



    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//getCityCoords
const getCityCoords = function () {
  $.ajax({
    url: "libs/php/getCityCoords.php",
    type: "POST",
    dataType: "json",
    data: {
      capital: capital,
      countryCode: countryCode,
    },
    success: function (result) {

      lat = result['data']['coord']['lat'];
      lng = result['data']['coord']['lon'];

      getWeather();

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//getIncomeLevel
const getIncomeLevel = function () {
  $.ajax({
    url: "libs/php/getIncomeLevel.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: countryCode
    },
    success: function (result) {
      if (result['data'][1]) {
      $('#incomeLevelTxt').html(result['data'][1][0]['incomeLevel']['value']);
      } else {
        $('#incomeLevelTxt').html("")
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//getNews
const getNews = function () {
  $.ajax({
    url: "libs/php/getNews.php",
    type: "GET",
    dataType: "json",
    data: {
      countryCode: countryCode,
      category: $("#selCategory").val(),
      limit: $("#selLimit").val()
    },
    success: function (result) {

      const articles = result['data']['articles'];

      const tbody = document.getElementById('tbodyNews');

      const fragment = document.createDocumentFragment();

      function removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
      }

      removeAllChildNodes(tbody);

      if (result['data']['totalResults'] === 0 || result['data']['status'] === "error") {

        const tr = document.createElement('tr');

        const td = document.createElement('td');

        td.appendChild(document.createTextNode("No headlines available"));

        tr.appendChild(td);

        fragment.appendChild(tr);

      } else {
          for (var i = 0; i < articles.length; i++){

            const tr = document.createElement('tr');

            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            const td3 = document.createElement('td');

            td1.insertAdjacentHTML('beforeend', `<i class="far fa-clock"></i><br>${fromNow(articles[i]['publishedAt'])}`);
            td2.appendChild(document.createTextNode(articles[i]['title']));
            td3.insertAdjacentHTML('beforeend', `<a id="readMore1" href=${articles[i]['url']} target="_blank" rel="noopener"><i class="fas fa-long-arrow-alt-right fa-2x"></i></a>`);

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);

            fragment.appendChild(tr);
        }
      }

      tbody.appendChild(fragment);

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//getAnthem
const getAnthem = function () {
  $.ajax({
    url: "libs/php/getAnthem.php",
    type: "POST",
    dataType: "json",
    data : {
      countryAnthem: countryAnthem
    },
    success: function (result) {

      if(countryAnthem === 'Nepal') {

        $("#anthemFrame").attr("src", 'https://www.youtube.com/embed/cZophCR3rmo');

      } else if(countryAnthem === 'Falkland%20Islands'){

        $("#anthemFrame").attr("src", 'https://www.youtube.com/embed/WhIwRMIXzOY');

      } else if(countryAnthem === 'New%20Caledonia'){

        $("#anthemFrame").attr("src", 'https://www.youtube.com/embed/Rp4VUo75YS4');

      } else if(countryAnthem === 'Western%20Sahara'){

        $("#anthemFrame").attr("src", 'https://www.youtube.com/embed/9z7kpJOp9Qo');

      } else if(countryAnthem === 'Uganda'){

        $("#anthemFrame").attr("src", 'https://www.youtube.com/embed/e2ZPUHVUoTw');

      } else {

        $("#anthemFrame").attr("src", `https://www.youtube.com/embed/${result['data'][0]['id']['videoId']}`);

      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText);
    },
  });
};


//stop anthem when modal closed
$('#anthemModal').on('hidden.bs.modal', function () {
  var memory = $(this).html();
     $(this).html(memory);
});

//getCovid
const getCovid = function () {
  $.ajax({
    url: "libs/php/getCovid.php",
    type: "POST",
    dataType: "json",
    success: function (result) {

      let countriesArray = result['data']['Countries'];

      let countryObject = countriesArray.filter(country => (country['CountryCode'] === countryCode));

      if(countryObject[0]) {
        $('#newCases').html(numberWithCommas(countryObject[0]['NewConfirmed']));
        $('#totalCases').html(numberWithCommas(countryObject[0]['TotalConfirmed']));
        $('#newDeaths').html(numberWithCommas(countryObject[0]['NewDeaths']));
        $('#totalDeaths').html(numberWithCommas(countryObject[0]['TotalDeaths']));

      var d = new Date(countryObject[0]['Date']);

      $('#covidDate').html(`Updated ${fromNow(d)} ago`);

      } else {
          $('#newCases').html("");
          $('#totalCases').html("");
          $('#newDeaths').html("");
          $('#totalDeaths').html("");
          $('#covidDate').html("");
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//getExchangeRate
const getExchangeRate = function () {
  $.ajax({
    url: "libs/php/getExchangeRate.php",
    type: "POST",
    dataType: "json",
    data: {
      baseCurrencyCode: $("#selCurrency").val()
    },
    success: function (result) {

      $('#exchangeTxt').html(result['data']['rates'][currencyCode]);

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//getCurrencyNames
$.ajax({
    url: "libs/php/getCurrencyNames.php",
    type: "POST",
    dataType: "json",
    success: function (result) {

      let currenciesArray = Object.keys(result['data']['rates']);

      currenciesArray = currenciesArray.filter(function (currency) {
        return currency !== "EUR";
      });
      currenciesArray = currenciesArray.filter(function (currency) {
        return currency !== "GBP";
      });
      currenciesArray = currenciesArray.filter(function (currency) {
        return currency !== "USD";
      });

      currenciesArray.forEach((currency) => $("#optGroupAll").append(new Option(currency, currency)));

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });

//getCountryInfo
const getCountryInfo = function () {
  $.ajax({
    url: "libs/php/getCountryInfo.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: countryCode,
    },
    success: function (result) {

      capital = result["data"][0]["capital"]

      let continent = result["data"][0]["continentName"];
      $("#continentTxt").html(continent);

      if (continent === "Europe") {
        $("#continentIcon").addClass('fa-globe-europe');
      } else if (continent === "Asia") {
        $("#continentIcon").addClass('fa-globe-asia');
      } else if (continent === "North America" || continent === "South America") {
        $("#continentIcon").addClass('fa-globe-americas');
      } else if (continent === "Africa") {
        $("#continentIcon").addClass('fa-globe-africa');
      } else {
        $("#continentIcon").addClass('fa-globe');
      }

      $("#areaTxt").html(numberWithCommas(Math.round(result["data"][0]["areaInSqKm"])));
      $("#populationTxt").html(numberWithCommas(result["data"][0]["population"]));
      currencyCode = result["data"][0]["currencyCode"];

      let countryCode = result["data"][0]["countryCode"];
      $("#ISO2Txt").html(countryCode);
      $("#ISO3Txt").html(result["data"][0]["isoAlpha3"]);

      countryName = result["data"][0]["countryName"];
      countryAnthem = replaceWhitespace20(replaceWhitespace20(countryName));
      $("#countryName").html(countryName);
      $("#countryLink").attr("href", `https://en.wikipedia.org/wiki/${replaceWhitespace(countryName)}`)
      $("#covidTitle").html(`${countryName} Covid-19 Data`);
      $("#flagName").html(countryName);
      $("#anthemName").html(countryName);

      getExchangeRate();
      getCityCoords();
      getCountryBorders();
      webcams.remove();
      POIs.clearLayers();
      webcams.clearLayers();
      getAnthem();
      getNews();
      getCovid();
      getCities();
      getStadia();
      getAirports();
      getParks();
      getHistorical()
      getWebcams();
      document.getElementById("selCategory").selectedIndex = 0;
      POIs.addTo(map);
      webcams.addTo(map);

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//getRestCountries
const getRestCountries = function () {
  $.ajax({
    url: "libs/php/getRestCountries.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: countryCode,
    },
    success: function (result) {

      $("#capitalTxt").html(result["data"][0]["capital"][0]);
      $("#weatherCity").html(result["data"][0]["capital"][0]);

      if (Object.values(result["data"][0]["languages"]).length > 1) {
        $('#languageWord').html("Languages");
      } else {
        $('#languageWord').html("Language");
      }

      $("#languagesTxt").html(
        Object.values(result["data"][0]["languages"]).join(", ")
      );

      if (
        result["data"][0]["demonyms"]["eng"]["f"] === result["data"][0]["demonyms"]["eng"]["m"]
      ) {
        $('#demonymWord').html("Demonym");
        $("#demonymTxt").html(result["data"][0]["demonyms"]["eng"]["f"]);
      } else {
        $('#demonymWord').html("Demonyms");
        $("#demonymTxt").html(Object.values(result["data"][0]["demonyms"]["eng"]).join(", "));
      }

      $("#drivesTxt").html(
        capitalizeFirstLetter(result["data"][0]["car"]["side"])
      );

      let currencyObject = Object.values(result["data"][0]["currencies"])[0];

      let newCurrencyCode = Object.keys(result["data"][0]["currencies"])[0];

      if (currencyObject.symbol){
        $("#currencyTxt").html(`${currencyObject.name} (${currencyObject.symbol}) (${newCurrencyCode})`);
      } else {
        $("#currencyTxt").html(`${currencyObject.name} (${newCurrencyCode})`);
      }

      let flagSrc = result["data"][0]["flags"]["png"];

      $("#titleFlag").attr("src", flagSrc);
      $("#flag").attr("src", flagSrc);

    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//getCountryCode
const getCountryCode = function () {
  $.ajax({
    url: "libs/php/getCountryCode.php",
    type: "POST",
    dataType: "json",
    data: {
      lat: lat,
      lng: lng,
    },
    success: function (result) {
      console.log(JSON.stringify(result));

      if (result.status.name == "ok" && result["data"]["countryCode"]) {

        setTimeout(function () {
          countryCode = result["data"]["countryCode"];

          $("#selCountry").val(countryCode);

          getCountryInfo();
          getNeighbours();
          getIncomeLevel();
          getTime();
          getRestCountries();
        }, 0);
      } else {
        getOcean();
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//getLatLng
const getLatLng = function () {
  $.ajax({
    url: "libs/php/getLatLng.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: $("#selCountry").val(),
    },
    success: function (result) {

      switch ($("#selCountry").val()) {
        case "BS":
          lat = 25.066667;
          lng = -77.333333;
          break;
        case "CU":
          lat = 23.136667;
          lng = -82.358889;
          break;
        case "FK":
          lat = -51.7;
          lng = -57.85;
          break;
        case "FJ":
          lat = -17.83378025276999;
          lng = 178.023239265527;
          break;
        case "VU":
          lat = -17.733333;
          lng = 168.316667;
          break;
        case "TT":
          lat = 10.666667;
          lng = -61.5075;
          break;
        case "PH":
          lat = 14.6;
          lng = 120.98;
          break;
        default:
          lat = result["data"]["latlng"][0];
          lng = result["data"]["latlng"][1];
      }

      setTimeout(getCountryCode, 1);
    },
    error: function (jqXHR, textStatus, errorThrown) {},
  });
};

//selCountry functionality
$("#selCountry").change(function () {
  getLatLng();
});

//selCurrency
$("#selCurrency").change(function () {
  getExchangeRate();
});

//clicking on map functionality
function onMapClick(e) {
  lat = e.latlng.lat;
  lng = e.latlng.lng;

  setTimeout(getCountryCode, 1);
}

map.on("click", onMapClick);

//refresh page
const refreshPage = () => {
  location.reload();
}

$(".navbar-brand").click(refreshPage);

//fromNow func
function fromNow(date) {

  var date = Date.parse(date);

  var seconds = Math.floor((new Date() - date) / 1000);
  var years = Math.floor(seconds / 31536000);
  var months = Math.floor(seconds / 2592000);
  var days = Math.floor(seconds / 86400);

  if (days > 548) {
    return years + 'y';
  }
  if (days >= 320 && days <= 547) {
    return '1y';
  }
  if (days >= 45 && days <= 319) {
    return months + 'm';
  }
  if (days >= 26 && days <= 45) {
    return '1m';
  }

  var hours = Math.floor(seconds / 3600);

  if (hours >= 36 && days <= 25) {
    return days + 'd';
  }
  if (hours >= 22 && hours <= 35) {
    return '1d';
  }

  var minutes = Math.floor(seconds / 60);

  if (minutes >= 90 && hours <= 21) {
    return hours + 'h';
  }
  if (minutes >= 45 && minutes <= 89) {
    return '1h';
  }
  if (seconds >= 90 && minutes <= 44) {
    return minutes + ' mins';
  }
  if (seconds >= 45 && seconds <= 89) {
    return '1 min';
  }
  if (seconds >= 0 && seconds <= 45) {
    return 'a few seconds ago';
  }
}

//select news category
$('#selCategory').on('change', function() {
  getNews();
});

//select news limit
$('#selLimit').on('change', function() {
  getNews();
});

//reset news modal scroll
$('#newsModal').on('shown.bs.modal', function() {
  $('#newsModal').scrollTop(0);
});


