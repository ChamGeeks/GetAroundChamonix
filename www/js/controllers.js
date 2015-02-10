
'use strict';

function rad2deg(angle) {
  //  discuss at: http://phpjs.org/functions/rad2deg/
  // original by: Enrique Gonzalez
  // improved by: Brett Zamir (http://brett-zamir.me)
  //   example 1: rad2deg(3.141592653589793);
  //   returns 1: 180

  return angle * 57.29577951308232; // angle / Math.PI * 180
}

function deg2rad(angle) {
  //  discuss at: http://phpjs.org/functions/deg2rad/
  // original by: Enrique Gonzalez
  // improved by: Thomas Grainger (http://graingert.co.uk)
  //   example 1: deg2rad(45);
  //   returns 1: 0.7853981633974483

  return angle * .017453292519943295; // (angle / 180) * Math.PI;
}

/**
 * Calculate max min coordinates to get within distance in SQL
 *
 * @param  {float} lat    Latitude
 * @param  {float} lng    Longitude
 * @param  {float} radius The radius
 * @return {object}       The calculated max min values
 */
function get_max_min_lat_lon(lat, lon, radius) {

  var radius = radius || 0.22, // the radius in km
      R      = 6371.0,           // the earth radius
      values = {};

  // first-cut bounding box (in degrees)
  values.lat_max = lat + rad2deg(radius/R),
  values.lat_min = lat - rad2deg(radius/R),
  // compensate for degrees longitude getting smaller with increasing latitude
  values.lon_max = lon + rad2deg(radius/R/Math.cos(deg2rad(lat))),
  values.lon_min = lon - rad2deg(radius/R/Math.cos(deg2rad(lat)));

  return values;
}



angular.module('chamBus')

.controller('MainCtrl', function($scope, TripPlanner, $translate, $state, $location,
                                  Database, $cordovaGlobalization, $timeout) {

  $scope.selectStartLang = function(lang, redirect) {
    $translate.use(lang);
    if(redirect) {
      $location.path('/'+ redirect);
    }
  };


  if(!window.localStorage.CHAM_LANG_IS_SET) {
    $timeout(function(){
      if(navigator.globalization) {
        $cordovaGlobalization.getPreferredLanguage().then(
          function(result) {
            var langs = ['en', 'fr', 'sv'];
            var userLang = result.value.substr(0,2);
            if(langs.indexOf(userLang) >= 0) {
              $translate.use(userLang);
            }
          },
          function(error) {
            console.log('Lang err: ', error);
        });
      }
    }, 1000);
    window.localStorage.CHAM_LANG_IS_SET = true;
  }


  $scope.db = Database;

  this.isPlanning = function() {
    return TripPlanner.planning();
  };

  this.reset = function() {
    TripPlanner.reset();
    $state.go('areas');
  };
})


.controller('SettingsCtrl', function($scope, $translate) {
  $scope.settings = {
    language: $translate.use()
  }
})



/**
 *
 * Select my location
 *
 */
.controller('MyLocationCtrl', function($scope, $location, $cordovaGeolocation, TripPlanner, Database) {

  // Get the user location
  $scope.positionFound = false;
  $scope.positionStatus = 'Loading';
  $cordovaGeolocation
    .getCurrentPosition()
    .then(function (position) {

      // Require a minimum accuracy
      if (position.coords.accuracy < 150) {

        // Verify ther is any stops close by
        var coords = get_max_min_lat_lon(position.coords.latitude, position.coords.longitude);
        Database.find([
          'SELECT * FROM stop',
          'WHERE lat > '+ coords.lat_min +' AND lat < '+ coords.lat_max,
          'AND lon > '+ coords.lon_min +' AND lon < '+ coords.lon_max
        ].join(' ')).then(function(stops) {
          if(stops.length) {
            $scope.positionFound = position.coords;
            $scope.positionFound.name = 'My position';
            $scope.positionStatus = 'Found';
          } else {
            $scope.positionStatus = 'No stops found';
          }

        // Error looking in db
        }, function (err) {
          $scope.positionStatus = 'Error';
          console.log('Find lat lon db error :', err);
        });

      // inaccurate Geo
      } else {
        $scope.positionStatus = 'Inaccurate';
      }

    // Error getting Geo
    }, function (error) {
      $scope.positionStatus = 'Error';
      console.log('Position error: ' + error.code + '\n' + 'message: ' + error.message + '\n');
    });

  // Update the location icon depending of loaction status
  $scope.locationClass = function() {
    var htmlclass = '';
    switch($scope.positionStatus) {
      case 'Loading':
        htmlclass = 'ion-loading-c';
        break;
      case 'Found':
        htmlclass = 'ion-android-locate';
        break;
      default:
        htmlclass = 'ion-close-round button-assertive';
    }
    return htmlclass;
  };


  $scope.getPositionInfo = function() {
    var message = '';
    switch($scope.positionStatus) {
      case 'Loading':
        message = 'Trying to locate your current position.';
        break;
      case 'No stops found':
        message = 'No stops found nearby.';
        break;
      case 'Found':
        break;
      default:
        message = 'The GPS was to inaccurate or could not load.';
    }
    if(message) {
      window.alert(message);
    }
  };

  $scope.useMyLocation = function() {
    TripPlanner.setDeparture($scope.positionFound);
    $location.path('/area/my-location/to');
  };
})



/**
 *
 * Select starting area
 *
 */
.controller('SelectAreaCtrl', function($scope, $location, TripPlanner) {

  // Select a stop
  $scope.selectStop = function (stop) {
    TripPlanner.setDeparture(stop);
    $location.path('/area');
  };

  $scope.areas = TripPlanner.getAreas();

  $scope.selectArea = function (area) {
    $location.path('/area/' + area);
  };

  $scope.toggleInfo = function(area) {
    area.showInfo = !area.showInfo;
    console.log('Show info for ' + area.name + '? ' + area.showInfo);
  };
})

.controller('ToAreaController', function($scope, $location, $stateParams, JourneyInfo, TripPlanner) {
  $scope.areas = TripPlanner.getAreas();

  $scope.selectArea = function(area) {
    console.log('Going from ' + $stateParams.id + ' to ' + area);
    $location.path('/area/' + $stateParams.id + '/to/' + area);
  };

  $scope.from = JourneyInfo.getEmptyInfo();
  $scope.to = JourneyInfo.getEmptyInfo();

  JourneyInfo.getFromInfo($stateParams.id).then(function(data) {
    $scope.from = data;
  });

  $scope.toggleInfo = function(area) {
    area.showInfo = !area.showInfo;
    console.log('Show info for ' + area.name + '? ' + area.showInfo);
  };
})


.controller('SelectStopCtrl', function($scope, $stateParams, JourneyInfo, TripPlanner, $location) {

  $scope.area = '';
  $scope.stops = [];
  $scope.from = JourneyInfo.getEmptyInfo();

  $scope.area = TripPlanner.getAreaById($stateParams.id);
  $scope.from.area = $scope.area.name;

  TripPlanner.getAreaStops($stateParams.id).then(function(resp){
    $scope.stops = resp;
  });


  $scope.selectStop = function(stop) {
    TripPlanner.setDeparture(stop);
    console.log('going to ToArea ' + $scope.area.id);
    $location.path('/area/' + $scope.area.id + '/to');
  };
})

.controller('DestinationController', function($scope, $stateParams, JourneyInfo, TripPlanner, $location) {

  $scope.area = '';
  $scope.stops = [];
  $scope.to = JourneyInfo.getEmptyInfo();

  $scope.area = TripPlanner.getAreaById($stateParams.id);

  TripPlanner.getAreaStops($stateParams.id).then(function(resp){
    $scope.stops = resp;
  });

  $scope.selectStop = function(stop) {
    TripPlanner.setDestination(stop);
    $location.path('/result');
  };

  $scope.from = JourneyInfo.getEmptyInfo();
  $scope.to = JourneyInfo.getEmptyInfo();
  $scope.to.area = $scope.area.name;

  JourneyInfo.getFromInfo($stateParams.departureId).then(function(data) {
    $scope.from = data;
  });
})




/**
 * Display bus times for the choosen trip
 *
 * @param {object} $scope               Angular scope
 * @param {object} $ionicPopup          Create ionic popup (alert-ish) for date select
 * @param {object} TripPlanner          Get the current trip plans and get the results
 * @param {Object} $cordovaDatePicker   Use native date pickers for Android and iOS (travel later)
 * @param {object} $translate           Translate popup text and buttons
 */
.controller('ResultCtrl', function(
    $scope, $ionicPopup, TripPlanner, $cordovaDatePicker, $translate)
  {

  // Store the choosen trip
  $scope.trip = {
    start: TripPlanner.getDeparture(),
    end: TripPlanner.getDestination()
  };

  // Object to store date and time
  $scope.dateTime = {};


  $scope.selectDate = function() {
    var options = {date: new Date(), mode: 'date'};
    $cordovaDatePicker.show(options).then(function(date){
      $scope.dateTime.date = date;
      // alert(date);
    });
  };

  $scope.selectTime = function() {
    var options = {date: new Date(), mode: 'time'};
    $cordovaDatePicker.show(options).then(function(date){
      $scope.dateTime.time = date;
      // alert(date);
      // 2014-12-06T17:09:51.000Z
    });
  };

  var popup_text = {};
  $translate([
        'TIME_POPUP_TITLE', 'CANCEL', 'GET_TIMES', 'TIME_POPUP_ALERT'
      ]).then(function (translations) {
    popup_text = {
      title: translations.TIME_POPUP_TITLE,
      cancel: translations.CANCEL,
      get_times: translations.GET_TIMES,
      alert: translations.TIME_POPUP_ALERT
    }
  });

  $scope.selectDateTime = function() {

    $ionicPopup.show({
      //template: '<input type="date" ng-model="dateTime.date"><br><input type="time" ng-model="dateTime.time">',
      templateUrl: 'partials/select-date.html',
      title: popup_text.title,
      scope: $scope,
      buttons: [
        { text: popup_text.cancel },
        {
          text: '<b>'+ popup_text.get_times +'</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.dateTime.date && !$scope.dateTime.time) {
              window.alert(popup_text.alert);

              //don't allow the user to close unless he/she have selected a date and time
              e.preventDefault();
            } else {
              // Generate a date based on selected time and date
              var date = '';
              if($scope.dateTime.time && $scope.dateTime.date) {
                date = $scope.dateTime.date;
                var time = $scope.dateTime.time.getHours() +':'+ $scope.dateTime.time.getMinutes(),
                    month = ('0'+ (date.getMonth()+1)).slice(-2);
                date = date.getFullYear() +'-'+ month +'-'+ date.getDate();
                date = date +' '+ time;
              } else {
                date = $scope.dateTime.time ? $scope.dateTime.time : $scope.dateTime.date;
              }

              TripPlanner.plan({
                allowTransfer: true,
                when: date
              }).then(function(times) {
                $scope.times = times;
              });
            }
          }
        }
      ]
    });
  };

  $scope.times = [];
  $scope.timesLoaded = false;
  TripPlanner.plan({
    allowTransfer: true   // get transfer options
  }).then(function(times) {
    $scope.times = times;
    $scope.timesLoaded = true;
  });

});

