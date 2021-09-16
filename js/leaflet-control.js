//map initialization
var map = L.map("map").setView([7.0840, 80.0098], 11);
//base map
var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
//add base map

//dark map
var dark = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  });
  //dark map

//googlesat map
var googleSat = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);
//googlesat map

//basemaps control
var baseMaps = {
  "OSM": osm,
  "Dark Map": dark,
  "Google Satellite": googleSat,
};
//basemaps control

L.control.layers(baseMaps, null, { collapsed: true }).addTo(map);

//handle layer function
function handleLayer(layerName) {
  var layer = L.tileLayer.wms("http://localhost:8080/geoserver/wms?", {
    layers: layerName,
    transparent: true,
    format: "image/png",
  });

  return layer;
}

//Layer card in left-sidebar
layersFromGeoserver.map((layer) => {
  $(".left-sidebar").append(
    layerCardGenerator(
      layer.layerTitle,
      layer.layerName,
      layer.defaultCheck,
      layer.thumbnailUrl,
      layer.description
    )
  );
});


//Default layer on switch
layersFromGeoserver.map((layer) => {
  if (layer.defaultCheck === "checked") {
    handleLayer(layer.layerName).addTo(map);
    $(".legend").append(wmsLegendControl(layer.layerName, layer.layerTitle));
  }
});

// Layer on/off switch
$(".layer-card-cb").on("change", function () {
  var layerName = $(this).attr("id");
  var layerTitle = $(this).attr("name");

  if ($(this).is(":checked")) {
    window[layerName] = handleLayer(layerName).addTo(map);
    $(".legend").append(wmsLegendControl(layerName, layerTitle));

  } else {
    map.eachLayer(function (layer) {
      if (layer.options.layers === layerName) {
        map.removeLayer(layer);
      }
    });
    var className = layerName.split(":")[1];
    $(`.legend .${className}`).remove();
  }
});

//Opacity control
$(".opacity").on("change", function () {
  var layerName = $(this).attr("code");
  var opacity = $(this).val() / 100;

  map.eachLayer(function (layer) {
    if (layer.options.layers === layerName) {
      layer.setOpacity(opacity);
    }
  });
});

//legend control function
function wmsLegendControl(layerName, layerTitle) {
  var className = layerName.split(":")[1];
  var url = `http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&LAYER=${layerName}`;
  var legend = `<p class="${className}" style='margion-top:10px; font-weight: bold'>${layerTitle}</p>`;
  legend += `<p><img class="${className}" src=${url} /><br class=${className} /></p> `;
  return legend;
}

//mouse coordinate
map.on("mousemove", function (e) {
  $(".map-coordinate").html(`Lat: ${e.latlng.lat},  Lng: ${e.latlng.lng}`);
});

//map scale
L.control.scale().addTo(map);

//View map in full browser
function fullScreenToggler() {
  var doc = document,
    elm = document.getElementById("map");

  if (elm.requestFullscreen) {
    !doc.fullscreenElement ? elm.requestFullscreen() : doc.exitFullscreen();
  } else if (elm.mozRequestFullScreen) {
    !doc.mozFullScreen ? elm.mozRequestFullScreen() : doc.mozCancelFullScreen();
  } else if (elm.msRequestFullscreen) {
    !doc.msFullscreenElement
      ? elm.msRequestFullscreen()
      : doc.msExitFullscreen();
  } else if (elm.webkitRequestFullscreen) {
    !doc.webkitIsFullscreen
      ? elm.webkitRequestFullscreen()
      : doc.webkitCancelFullscreen();
  } else {
    console.log("Fullscreen support not detected.");
  }
}

$(".full-screen").click(fullScreenToggler);

//Default map view
$(".default-view").on("click", function () {
  map.setView([7.0840, 80.0098], 11);
});

//Browser print
L.control.browserPrint().addTo(map);

