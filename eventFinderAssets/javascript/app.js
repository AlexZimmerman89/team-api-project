/////////////////////////////////////////////////
////////////  Global Variables.
////////////////////////////////////////////////

var locationObjects = [];
var center = { lat: 39.7392, lng: -104.9903 };
var ticketMasterRespondObjects = [];
var cityForCenter = "";

/////////////////////////////////////////////////
////////////  Master Function
////////////////////////////////////////////////
0
function onCreation() {
    $("document").ready(function () {
        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyDgBiTT1tZkPzoAwQORSah0mfdrgq5vht0",
            authDomain: "trendroomproject.firebaseapp.com",
            databaseURL: "https://trendroomproject.firebaseio.com",
            projectId: "trendroomproject",
            storageBucket: "trendroomproject.appspot.com",
            messagingSenderId: "800339938200"
        };

        firebase.initializeApp(config);

        // Create a variable to reference the database.
        var database = firebase.database();

        dropDownCat(database);
        dropDownCity(database);

        var userSelectCity, userSelectCat;
        generateQuery()
    });
}

onCreation();


////////////////////////////////////////////////
/////////// Mapping Functions
////////////////////////////////////////////////


///summary 
/// initialize the map, recreates map with markers based off of location objects, and center 
///
function initMap() {

    var incr = 0;

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: center
    });

    locationObjects.forEach(location => {
        var latitude = location.latitude;
        var longitude = location.longitude;
        var eventId = "#tmEvent" + incr;
        incr++;

        var marker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            ourAppId: eventId,
        });

        marker.addListener('click', function () {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                window.setTimeout(
                    function () {
                        marker.setAnimation(null);
                    },
                    1300
                );
            }
            console.log(this.ourAppId);
            scrollToCard(this.ourAppId);
        });
    });
};

///Summary
/// Returns a location object with lat and long
///
function makeLocationObject(lat, long) {
    return {
        latitude: lat,
        longitude: long
    };
}

/// summary 
/// set the global variable center to the selected city's lat and long
///
async function setCenterAndMapEvents() {

    console.log("---------------------------------------------------");
    console.log("Entered Set Center");
    console.log("---------------------------------------------------");

    var apicall = "https://maps.googleapis.com/maps/api/geocode/json?address=" + cityForCenter + "&key=AIzaSyD7S0i7eNHqNekovmb6LjPjaKMd-t2XMJ0";

    console.log("apiCall: " + apicall);

    var clatitude = "";
    var clongitude = "";

    $.ajax({
        type: "GET",
        url: apicall,
        async: true,
        dataType: "json",
        success: function (json) {
            //console.log("Json object for Center query: ");
            //console.log(json);

            clatitude = json.results[0].geometry.location.lat;
            clongitude = json.results[0].geometry.location.lng;

            console.log("---------------------------------------------------");
            console.log("center before setting it");
            console.log(center);
            console.log("---------------------------------------------------");

            center = { lat: clatitude, lng: clongitude };

            console.log("---------------------------------------------------");
            console.log("center After setting it");
            console.log(center);
            console.log("---------------------------------------------------");
            //console.log(center);
        },
        error: function (xhr, status, err) {
            //console.log(err);
        }
    }).then(mapTicketMasterEvents);
}

function mapTicketMasterEvents() {

    locationObjects = [];

    for (var i = 0; i < ticketMasterRespondObjects.length; i++) {
        var tmEvent = ticketMasterRespondObjects[i];
        var latitude = parseFloat(tmEvent.latitude);
        var longitude = parseFloat(tmEvent.longitude);

        var location = makeLocationObject(latitude, longitude);
        locationObjects.push(location);
    }

    console.log("--------------------------------------");
    console.log(" number of location objects" + locationObjects.length);
    console.log("--------------------------------------");

    initMap();


}

////////////////////////////////////////////////
/////////// Card Functions
////////////////////////////////////////////////

function createCards() {
    $("#events").html("");

    for (var i = 0; i < ticketMasterRespondObjects.length; i++) {
        var ticketlink = ticketMasterRespondObjects[i].ticketPurchase;

        var thehtml = `
                 <div class="card" id="tmEvent${i}">
                 <div class="card-header">
                     <h6>${ticketMasterRespondObjects[i].name}</h6>
                     <p>${ticketMasterRespondObjects[i].playingAtVenue}</p>
                 </div>
                 <div class="card-body">
                     <div class="col-7">
                         <img src="${ticketMasterRespondObjects[i].image}" width="100%">
                     </div>
                     <div class="col-5">
                         <p>${ticketMasterRespondObjects[i].date}</p>
                         <p>${ticketMasterRespondObjects[i].genre} ${ticketMasterRespondObjects[i].segment}</p>
                         <a href="${ticketlink}" target="_blank" class="btn btn-primary btn-sm">See Ticket</a>
                         </div>
                 </div>
                 </div>
                 `
        console.log("ticketsxxxxx :" + ticketMasterRespondObjects[i].ticketPurchase);
        // appends each after
        $("#events").append(thehtml)
    };
}

function scrollToCard(id) {
    var $container = $('#events'),
        $scrollTo = $(id);

    console.log("entered function");

    $container.scrollTop(
        $scrollTo.offset().top - $container.offset().top + $container.scrollTop()
    );

    // Or you can animate the scrolling:
    $container.animate({
        scrollTop: $scrollTo.offset().top - $container.offset().top + $container.scrollTop()
    });

    $scrollTo.addClass('animated pulse bg-focus').one(animationEnd, function () {
        $(this).removeClass('animated pulse bg-focus');

        if (typeof callback === 'function') callback();
    });
}


////////////////////////////////////////////////
//////////// Menu Buttons
////////////////////////////////////////////////


///<summary>
/// Populates the city drop down menu
///
function dropDownCity(database) {
    event.preventDefault();
    $('#TM-City-Select').prepend("<option>Please Choose Location</option>");

    // Firebase watcher + initial loader + order/limit HINT: .on("child_added"
    database.ref('-LA4CrA1ByvodmmTtkRQ').orderByValue().limitToLast(300).on("child_added", function (snapshot) {

        //console.log(snapshot);
        // get the city codes
        var city = snapshot.val();
        ////console.log("the city code is: " + city);

        var cityName = snapshot.key;
        ////console.log("the city Name is: " + cityName);

        //create dropdown
        $('#TM-City-Select').append($('<option>', {
            value: city,
            text: cityName
        }));

    });
}

///<summary> 
/// populates the category drop down menu
///
function dropDownCat(database) {

    //detect the category selection and display the content for the subcategory
    $('#Cat').on('change', { passive: true }, function (event) {
        event.preventDefault();

        //empty the dropdown menu
        $('#SubCat').empty();
        $('#SubCat').prepend("<option>Please Choose One</option>");

        //set the variable for category
        var catSelect = $('#Cat').val();
        console.log("the selected Category is: " + catSelect);

        //construct the variable for connecting to the DB
        var dataSelect = '-LA90S7jRzghy4mvqy86/' + catSelect;
        ////console.log("The database referance is: " + dataSelect);

        // Firebase watcher + initial loader + order/limit HINT: .on("child_added"
        database.ref(dataSelect).orderByValue().on("child_added", function (snapshot) {

            // get the categories
            result = snapshot.val();
            ////console.log("the ID is: " + result.id + " The name is: " + result.name);

            //result id provide the id value for generating query
            resultId = result.id;

            //result id provide the id value for generating query
            resultName = result.name;

            //create dropdown

            $('#SubCat').append($('<option>', {
                value: resultId,
                text: resultName,
                name: resultName
            }));
        });
    });
}

///<summary>
/// populates the music genre drop down. 
function generateQuery() {

    //get and register the user selection for the city
    $('#TM-City-Select').on('change', { passive: true }, function (event) {

        //empty the dropdown menu
        $('#Cat').val('null');
        $('#SubCat').empty();

        userSelectCity = $('#TM-City-Select').val();
        console.log("The City code is : " + userSelectCity);

        var cityoption = $("[value=" + userSelectCity + "]");
        cityForCenter = cityoption.html();
        console.log("city to use for center: " + cityForCenter);

        //detect the category selection and display the content for the subcategory
        $('#Cat').on('change', { passive: true }, function (event) {
            //set the variable for category
            var catSelect = $('#Cat').val();
            //console.log("CatSelectis:XXXXXXX " + catSelect);

            //get and register the user selection for the type of event
            $('#SubCat').on('change', { passive: true }, function (event) {

                userSelectCat = $('#SubCat').val();

                //console.log("userSelectCat is:****** " + userSelectCat);

                var key = "&apikey=f5oUWGdzD2xIKTd5rGEGxwy0moJZvoWg";
                var baseURL = "https://app.ticketmaster.com/discovery/v2/events.json?";
                var classNum = "classificationId=" + userSelectCat;
                var location = "&dmaId=" + userSelectCity;

                var queryBuild = baseURL + classNum + location + key;

                //console.log("the Query Build is-------: " + queryBuild);

                $.ajax({
                    type: "GET",
                    url: queryBuild,
                    async: true,
                    dataType: "json",
                    success: function (json) {

                        //console.log(json);
                        if (json == null) {
                            return;
                        }
                        ticketMasterRespondObjects = [];
                        for (var i = 0; i < 20; i++) {

                            //console.log("entered for loop");

                            var responseObject = {
                                playingAtVenue: json._embedded.events[i]._embedded.venues[0].name,
                                latitude: json._embedded.events[i]._embedded.venues[0].location.latitude,
                                longitude: json._embedded.events[i]._embedded.venues[0].location.longitude,
                                segment: json._embedded.events[i].classifications[0].segment.name,
                                genre: json._embedded.events[i].classifications[0].genre.name,
                                date: json._embedded.events[i].dates.start.localDate,
                                name: json._embedded.events[i].name,
                                image: json._embedded.events[i].images[0].url,
                                ticketPurchase: json._embedded.events[i].url
                            };

                            console.log("ticket master objects: ");
                            console.log(responseObject);

                            ticketMasterRespondObjects.push(responseObject);
                        }
                        //console.log("ticket master objects: " + ticketMasterRespondObjects);
                        createCards();
                        setCenterAndMapEvents();
                    },
                    error: function (xhr, status, err) {
                        //console.log(err);
                    }
                });
            });
        });
    });

}