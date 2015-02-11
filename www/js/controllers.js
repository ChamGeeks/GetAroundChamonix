'use strict';

angular.module('chamBus')



/**
 *
 * Main controller that run in all views
 *
 */
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
.controller('MyLocationCtrl', function(
    $scope, $location, $cordovaGeolocation, GeoTree, TripPlanner, Database
  ) {

  // Get the user location
  $scope.positionFound = false;
  $scope.positionStatus = 'Loading';
  $cordovaGeolocation
    .getCurrentPosition()
    .then(function (position) {

      // Require a minimum accuracy
      if (position.coords.accuracy < 150) {

        var stops = GeoTree.closest(position.coords, 250);
        if(stops.length) {
          $scope.positionFound = position.coords;
          $scope.positionFound.name = 'My position';
          $scope.positionStatus = 'Found';
        } else {
          $scope.positionStatus = 'No stops found';
        }

      // inaccurate Geo
      } else {
        $scope.positionStatus = 'Inaccurate';
      }

    // Error getting Geo
    }, function (error) {
      $scope.positionStatus = 'Error';
      console.log('Position error: ' + error.code + '\n' + 'message: ' + error.message + '\n');
    });

  // Update the location icon depending of loaction status (CSS class)
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

  // Display an alert message when clicking the icon if there is any error
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

  // Set my location as departure and go to destination
  $scope.useMyLocation = function() {
    TripPlanner.setDeparture($scope.positionFound);
    $location.path('/area/my-location/to');
  };
})



/**
 *
 * Select departure area
 *
 */
.controller('SelectAreaCtrl', function($scope, $location, TripPlanner) {

  // Get all areas
  $scope.areas = TripPlanner.getAreas();

  // Select a area
  $scope.selectArea = function (area) {
    $location.path('/area/' + area);
  };

  // Display more information about an area
  $scope.toggleInfo = function(area) {
    area.showInfo = !area.showInfo;
    console.log('Show info for ' + area.name + '? ' + area.showInfo);
  };
})



/**
 *
 * Select departure station
 *
 */
.controller('SelectStopCtrl', function($scope, $stateParams, JourneyInfo, TripPlanner, $location) {

  $scope.area = '';
  $scope.stops = [];
  $scope.from = JourneyInfo.getEmptyInfo();

  // Get selected area
  $scope.area = TripPlanner.getAreaById($stateParams.id);
  $scope.from.area = $scope.area.name;

  // Get all stops in selected area
  TripPlanner.getAreaStops($stateParams.id).then(function(resp){
    $scope.stops = resp;
  });


  // Select a stop and go to select destination area
  $scope.selectStop = function(stop) {
    TripPlanner.setDeparture(stop);;
    $location.path('/area/' + $scope.area.id + '/to');
  };
})



/**
 *
 * Destination area
 *
 */
.controller('DestinationAreaController', function(
    $scope, $location, $stateParams, JourneyInfo, TripPlanner
  ) {

  // Get all areas
  $scope.areas = TripPlanner.getAreas();

  // Select an area and continue to select a destination station
  $scope.selectArea = function(area) {
    $location.path('/area/' + $stateParams.id + '/to/' + area);
  };

  // ?
  $scope.from = JourneyInfo.getEmptyInfo();
  $scope.to = JourneyInfo.getEmptyInfo();

  // Get departure data
  JourneyInfo.getFromInfo($stateParams.id).then(function(data) {
    $scope.from = data;
  });

  // Display information about an area
  $scope.toggleInfo = function(area) {
    area.showInfo = !area.showInfo;
  };
})



/**
 *
 * Select destination station
 *
 */
.controller('DestinationStopController', function(
    $scope, $stateParams, JourneyInfo, TripPlanner, $location
  ) {

  $scope.area = '';
  $scope.stops = [];
  $scope.to = JourneyInfo.getEmptyInfo();
  $scope.from = JourneyInfo.getEmptyInfo();

  // Get the current area
  $scope.area = TripPlanner.getAreaById($stateParams.id);
  $scope.to.area = $scope.area.name;

  // Get departure data
  JourneyInfo.getFromInfo($stateParams.departureId).then(function(data) {
    $scope.from = data;
  });

  // Get all stops in current area
  TripPlanner.getAreaStops($stateParams.id).then(function(resp){
    $scope.stops = resp;
  });

  // Select a stop and go to results
  $scope.selectStop = function(stop) {
    TripPlanner.setDestination(stop);
    $location.path('/result');
  };

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

