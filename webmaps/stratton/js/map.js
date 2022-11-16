// var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
// 	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
//   });

//   var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
//     subdomains: 'abcd',
//     maxZoom: 19
//   });
  
//   var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
// 	maxZoom: 19,
// 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//   });

  var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0','mt1','mt2','mt3']
  });

  const extent = [25.8, -80.234];

	var map = L.map('map', {
		center: extent,
		zoom: 9,
    zoomControl: false,
    preferCanvas: true,
		layers: googleTerrain
	});

//   var baseLayers = {
//     "Roads": googleTerrain,
//     "Image": Esri_WorldImagery
//     };

// L.control.layers(baseLayers).addTo(map);


var zoomHome = L.Control.zoomHome({
	position: 'bottomright',
	zoomHomeIcon: 'rotate-right'
	});
zoomHome.addTo(map);


function getColor(d) {
		return	d === 'Permitted' ? '#0868ac' :
            d === 'Not permitted' ? '#cb181d' :
            d === 'TBD' ? '#fee391' :
            '#252525';
	}


  function style(feature) {
   var color = getColor(feature.properties.STATUS);
   return {
     color: color,
     weight: 1,
   };
 }

 map.createPane('myPane');
 map.getPane('myPane').style.opacity = 1;
 
 
 function popUpMaker(county, name, status, url) {
    var countyHTML = `<b> County: </b> ${county} </br>`
    var nameHTML = `<b> City: </b> ${name} </br>`
    var statusHTML = `<b> STR Regulation: </b> ${status}`
      if (url) {
        var urlHTML = `</br> <a href="${url}" target="_blank">Go to web-page</a>`
        var popUpContent = countyHTML + nameHTML + statusHTML + urlHTML
      } else {
        var popUpContent = countyHTML + nameHTML + statusHTML
      }
    return popUpContent;
 }

 var county = L.geoJson(mdbw_v3, {
   pane: 'myPane',
   onEachFeature: function (feature, layer) {
    layer.bindPopup(
      popUpMaker(
        feature.properties.COUNTY,
        feature.properties.NAME,
        feature.properties.STATUS,
        feature.properties.URL
        )
      );
    },
   style: style,
  }).addTo(map);



  const search = new GeoSearch.GeoSearchControl({
    notFoundMessage: 'Address not found. Contact us to improve this tool.',
    provider: new GeoSearch.GoogleProvider({
      params: {
        key: '__YOUR_API_KEY__',
        language: 'en',
        country: 'us',
        region: 'us',
        administrative_area_level_1: 'FL',
        administrative_area_level_2: 'Miami-Dade, Broward'
      }
    }),
    //retainZoomLevel: true,
    showMarker: false, // optional: true|false  - default true
    showPopup: false, // optional: true|false  - default false
    searchLabel: 'Find your STR regulation', // optional: string
    style: 'bar'
  });


map.addControl(search);

function searchEventHandler(result) {
  var coords = L.latLng(result.location.y, result.location.x)
  var markerSearch = L.marker(coords).addTo(map);
  var results = leafletPip.pointInLayer(coords, county, first=true);
    if (results.length > 0) {
      var popUpData = (results[0].feature.properties);
        popUp = popUpMaker(
          popUpData.COUNTY,
          popUpData.NAME,
          popUpData.STATUS,
          popUpData.URL
          );
    } else {
      var popUp = "<b>Short Term Rentals regulations are only available " + 
                  "for Miami-Dade and Broward counties at the moment.</b>"
    };
  markerSearch.bindPopup(popUp).openPopup();
};

map.on('geosearch/showlocation', searchEventHandler);