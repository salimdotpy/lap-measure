const R = 6378137; // Radius of the Earth in meters
var cord_pos = {lat: 7.7200717, lng: 4.41305};

// Convert degrees to radians
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Calculate the area of the polygon
function polygonArea(latitudes, longitudes) {
    const numVertices = latitudes.length;
    if (numVertices < 3) return 0; // Not a polygon

    // Convert coordinates to radians
    const radLatitudes = latitudes.map(degToRad);
    const radLongitudes = longitudes.map(degToRad);

    // Initialize the sum
    var area = 0.0;

    // Loop over vertices
    for (var i = 0; i < numVertices; i++) {
        const j = (i + 1) % numVertices;
        area += (radLongitudes[j] - radLongitudes[i]) * (2 + Math.sin(radLatitudes[i]) + Math.sin(radLatitudes[j]));
    }

    // Absolute value and multiply by Earth's radius squared, then divide by 2
    area = Math.abs(area * R ** 2 / 2.0);
    return area;
}

//Perimeter function
function polygonPerimeter(latitudes, longitudes) {
    const numVertices = latitudes.length;
    var perimeter = 0;

    for (var i = 0; i < numVertices; i++) {
        const j = (i + 1) % numVertices;
        const lat1 = degToRad(latitudes[i]);
        const lon1 = degToRad(longitudes[i]);
        const lat2 = degToRad(latitudes[j]);
        const lon2 = degToRad(longitudes[j]);

        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;

        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        perimeter += R * c;
    }

    return perimeter;
}

//Distance function
// Function to calculate the distance between two lat/lng points using Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
    //const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Function to calculate the distances between each pair of consecutive coordinates
function calculateDistances(coordinates) {
    const distances = [];
    for (var i = 0; i < coordinates.length - 1; i++) {
        const current = coordinates[i];
        const next = coordinates[i + 1];
        const distance = haversineDistance(current.lat, current.lng, next.lat, next.lng);
        distances.push({
            from: current,
            to: next,
            distance: distance
        });
    }
    return distances;
}

function getDistance(obj, ele=false) {
// Example usage
    const coordinates = obj;
    var list = '<ul class="list-group">';
    const distances = calculateDistances(coordinates);

    distances.forEach((segment, index) => {
        list += `<li class= "list-group-item" >Segment ${index + 1}:`;
        list += `<br>From: (${segment.from.lat}, ${segment.from.lng})`;
        list += `<br>To: (${segment.to.lat}, ${segment.to.lng})`;
        list += `<br>Distance: ${segment.distance.toFixed(2)}m </li>`;
});
if (ele) ele.innerHTML = list + "</ul>";
}

function getArea(obj, ele) {
    const latitudes = [];
    const longitudes = [];
    for (var i of obj) {
        latitudes.push(i.lat);
        longitudes.push(i.lng);
    }
    const area = polygonArea(latitudes, longitudes);
    ele.innerHTML = `Area: ${area.toFixed(5)}m²`;
}

function getPerimeter(obj, ele) {
    const latitudes = [];
    const longitudes = [];
    for (var i of obj) {
        latitudes.push(i.lat);
        longitudes.push(i.lng);
    }
    const perimeter = polygonPerimeter(latitudes, longitudes);
    ele.innerHTML = `Perimeter: ${perimeter.toFixed(5)}m`;
}
//Get location function
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition, showError, {enableHighAccuracy: true, maximumAge: 5000});
    } else {
        toast_it({ text: 'Geolocation is not supported by this browser.', icon: 'error' });
    }
}

function showPosition(position) {
    cord_pos = position ?
    {lat: position.coords.latitude, lng: position.coords.longitude} :
    {lat: 6.1334096, lng: 6.8075828};
}
function showError(error) {
    var x = "";
    switch (error.code) {
        case error.PERMISSION_DENIED:
            x = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            x = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            x = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            x = "An unknown error occurred.";
            break;
    }
    toast_it({ text: x, icon: 'warning' });
    cord_pos = {lat: 6.1334096, lng: 6.8075828};
}

//Map function start here-----------------------------------------------------------------------------------

var myPolygon, cords;
var myMarker, mc = 0;
var map, settings_array = {d_unit: 'cm', a_unit: 'cm', poly_color: '#ff0000'};

function initMap(pick=false) {
    getLocation();
    var zoom = pick? 20 : 17;
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: zoom,
        center: cord_pos,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    });
    placeMarker(cord_pos, true);
    google.maps.event.addListener(map, 'click', function (event) {
        if(pick){
            toast_it({ text: 'Click pick button to pick current coordinate!', icon: 'info' });
        }else{
            placeMarker(event.latLng, false, true);
            updatePoygon()
        }
    });
}

function pickCord() {
    getLocation();
    placeMarker(cord_pos, false, true);
    updatePoygon();
}

function placeMarker(location, init=false, multi=false) {
    if (init) {
        myMarker = new google.maps.Marker({
            position: location,
            map: map,
            animation: google.maps.Animation.DROP
        });
        mc = 1;
    }
    else if (multi) {
        if (mc == 1) {
            myMarker.setPosition(location);
            mc = 0;
        } else {
            myMarker = new google.maps.Marker({
                position: location,
                map: map,
                animation: google.maps.Animation.DROP
            });
        }
    }
    else if (myMarker == undefined) {
        myMarker = new google.maps.Marker({
            position: location,
            map: map,
            animation: google.maps.Animation.DROP
        });
    }
    else {
        myMarker.setPosition(location);
    }
    if (!init) {
        try {
            document.getElementById('txt-marker-coord').value += 'n' + location.lat().toFixed(5) + ',' + location.lng().toFixed(5);
        }
        catch (err) {
            document.getElementById('txt-marker-coord').value += 'n' + location.lat.toFixed(5) + ',' + location.lng.toFixed(5);
        }
    }
}

function updatePoygon() {
    // If polygon already added to map, remove it:
    if (myPolygon) {
        myPolygon.setMap(null);
    }
    // Parse text area and create polygon coordinates:
    var coordText = document.getElementById('txt-marker-coord').value;
    var lines = coordText.split('n');
    var polygonCoords = [];

    for (var i = 1; i < lines.length; i++) {
        var line = lines[i];
        var coordParts = line.split(',');

        if (coordParts.length != 2) {
            window.alert('Error on line ' + (i + 1) + ' (' + line + ') ' + '... each line should look like "40,30" (lat,lng).');
            return;
        }
        var newLat = parseFloat(coordParts[0]);
        var newLng = parseFloat(coordParts[1]);
        var finalCoord = {lat: newLat, lng: newLng};
        polygonCoords.push(finalCoord);
    }
    // Construct the polygon and add to the map:
    myPolygon = new google.maps.Polygon({
        paths: polygonCoords,
        strokeColor: settings_array.poly_color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: settings_array.poly_color,
        fillOpacity: 0.35
    });

    myPolygon.setMap(map);
    var result = document.getElementById('area');
    getArea(polygonCoords, result);

    result = document.getElementById('perimeter');
    getPerimeter(polygonCoords, result);

    cords = polygonCoords;
}
function pointsDist() {
    result = document.getElementById('distance');
    getDistance(cords, result);
}

function convertLength(value, from, to) {
    const units = {mm: 1, cm: 10, dm: 100, m: 1000, km: 1000000, in: 25.4, ft: 304.8, yd: 914.4, mi: 1609340};
    const fromMulti = units[from];
    const toMulti = units[to];
    return (value * fromMulti) / toMulti;
}
function convertArea(value, from, to) {
    const units = {mm: 1, cm: 100, dm: 1000, m: 1000000, km: 1000000000000, in: 645.16, ft: 92903, yd: 836127, ac: 4046866, ha: 10000000000};
    const fromMulti = units[from];
    const toMulti = units[to];
    return (value * fromMulti) / toMulti;
}