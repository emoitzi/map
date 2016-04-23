var dd, ds, hospital_element, station_element;
var distance, distance_return, geocoder, searched = false;

var stations = [ 
{key: "Murau", address: "Märzenkeller 16, 8850 Murau", default:true},
{key: "Neumarkt", address: "Freimoosstraße 3, 8860 Neumarkt, Österreich"},
{key: "Oberwölz", address: "Vorstadt 117, 8832 Oberwölz, Österreich"},
{key: "Stadl/Mur", address: "Stadl an der Mur 120, 8862 Stadl an der Mur, Österreich"}
];

var hospitals = [
{key: "BHB St.Veit/Glan", address: "Spitalgasse 26, 9300 St. Veit/Glan"},
{key: "DOKH Friesach", address: "St. Veiterstraße 12, 9360 Friesach"},
{key: "LKH Bruck/Mur", address: "Tragösserstraße 1, Bruck/Mur"},
{key: "LKH Graz", address: "Auenbruggerplatz 1, 8010 Graz"},
{key: "LKH Graz West", address: "Göstinger Straße 22, 8020 Graz"},
{key: "LKH Judenburg", address: "Oberweggasse 18, 8750 Judenburg"},
{key: "LKH Klagenfurt", address: "Feschniggstraße 11, 9020 Klagenfurt"},
{key: "LKH Knittelfeld", address: "Gaaler Straße 10, 8720 Knittelfeld"},
{key: "LKH Leoben", address: "Vordernbergerstraße 42, 8700 Leoben"},
{key: "LKH Stolzalpe", address: "Stolzalpe 38, 8852 Stolzalpe", default:true},
{key: "LKH Tamsweg", address: "Bahnhofstraße 7, 5580 Tamsweg"},
{key: "LSF Graz", address: "  Wagner Jauregg Platz 1, 8053 Graz"},
{key: "UKH Graz", address: "Göstinger Straße 24, 8020 Graz"},
{key: "Dr. Friess", address: "Schwarzenbergstraße 2a, 8850 Murau"},
{key: "Dr. Katschnig", address: "Burggasse 108, 8750 Judenburg"},
{key: "Dr. Pferschy", address: "Friesacherstraße 5, 8850 Murau"}
];


function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(47.112470, 14.160578),
        zoom: 12
    };
    var map = new google.maps.Map(document.getElementById('map-div'), mapOptions);
    ds = new google.maps.DirectionsService();
    dd = new google.maps.DirectionsRenderer();
    geocoder = new google.maps.Geocoder();
    dd.setMap(map);

}

function clearResult() {
    $("#distance").val("");
    $("#distance_return").val("");
}

$(document).ready(function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=initialize';
    document.body.appendChild(script);
    hospital_element = document.getElementById("hospital-select");
    station_element = document.getElementById("station-select");

    $("#start-button").click(startSearch);

    $("#location").autocomplete({
      source: getAddressSuggestions,
      minLength: 4,
      delay: 250
    })
    .click(function() {
        if (searched) {
            $("#location").select();
            searched = false;
        }
    })
    .change(clearResult);

    $("#hospital-select").change(clearResult)
        .click(hospitalSelectClick);
    $("#station-select").change(clearResult)
        .click(stationSelectClick);
    populateSelect("#hospital-select", hospitals);
    populateSelect("#station-select", stations);
    hospitalSelectClick();
    stationSelectClick();

    distance = document.getElementById("distance");
    distance_return = document.getElementById("distance_return");
});





function populateSelect(id, data) {
  var tag = $(id);
  $.each(data, function() {
    var option = $("<option />", {
        text: this.key,
        value: this.address
    });
    if (this.default) {
      option.attr("selected", true);
    }
    tag.append(option);
  });
}


function getAddressSuggestions(location, callback) {
  
  var request, sug = [];

  var bounds = new google.maps.LatLngBounds(
    google.maps.LatLng(46.460151,13.053683),
    google.maps.LatLng(47.810881,16.993587));
  //Salzburg
//  47.810881, 13.053683
  //Nagykanizsa
//  46.460151, 16.993587
  request = { address: location.term,
              bounds: bounds,
              region: "AT"}
  geocoder.geocode(request, function (response, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      response.every(function (result, index) {
        sug.push(result.formatted_address);
        return index < 10;

      });
    }
    callback(sug);


  });
}

function getDistanceString(legs) {
    var distance = 0.0;
    legs.forEach(function (leg) {
        distance += leg.distance.value;
    })
    distance /= 1000;
    return distance.toString() + " km";
}

function routeCallback(distance_tag, result, status) {
    if (status === google.maps.DirectionsStatus.OK) {
        var route = result.routes[0];
        distance_tag.value = getDistanceString(route.legs);
        dd.setDirections(result);
    }
    else {
        console.log(status.toString());
    }


}

function hospitalSelectClick() {
    document.getElementById("hospital-div").innerHTML = 'Ziel: ' + hospital_element[hospital_element.selectedIndex].text;
    }

function stationSelectClick() {
    document.getElementById("station-div").innerHTML = 'Dienststelle: ' + station_element[station_element.selectedIndex].text;
}

function startSearch() {
    var station,request, request_return, location;
    searched = true;
    location = $("#location").val();

    station = station_element.value;
    request = {
        travelMode: google.maps.TravelMode.DRIVING,
        origin : station,
        destination: station,
        waypoints : [{location: location},
                     {location: hospital_element.value}]
    };
    ds.route(request, function (result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            var route = result.routes[0];
            distance.value = getDistanceString(route.legs);
            dd.setDirections(result);
        }
    });

    request_return = {
        travelMode: google.maps.TravelMode.DRIVING,
        origin : station,
        destination: station,
        waypoints : [{location: location},
                     {location: hospital_element.value},
                     {location: location}]
    };
    ds.route(request_return, function (result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            var route = result.routes[0];
            distance_return.value = getDistanceString(route.legs);
        }    
    });
}
