
'use strict';

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


.controller('SettingsCtrl', function() {
})

.controller('SelectAreaCtrl', function($scope, $location, $cordovaGeolocation, TripPlanner) {

    $scope.positionFound = false;
    $scope.positionStatus = 'loading';
    $cordovaGeolocation
      .getCurrentPosition()
      .then(function (position) {
        if (position.coords.accuracy < 150) {
          $scope.positionFound = position.coords;
          $scope.positionFound.name = 'My position';
          $scope.positionStatus = 'found';
        } else {
          $scope.positionStatus = 'inaccurate';
        }
      }, function (error) {
        $scope.positionStatus = 'error';
        console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
      });

    $scope.locationClass = function() {
      var htmlclass = '';
      switch($scope.positionStatus) {
        case 'loading':
          htmlclass = 'ion-loading-c';
          break;
        case 'found':
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
        case 'loading':
          message = 'Trying to locate your current position.';
          break;
        case 'found':
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




    $scope.selectStop = function (stop) {
      TripPlanner.setDeparture(stop);
      $location.path('/area');
    };

    $scope.selectAreaTitle = 'Select start area';

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

.controller('ResultCtrl', function($scope, $ionicPopup, TripPlanner, $cordovaDatePicker){
  $scope.trip = {
    start: TripPlanner.getDeparture(),
    end: TripPlanner.getDestination()
  };

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

  $scope.selectDateTime = function() {

    $ionicPopup.show({
      //template: '<input type="date" ng-model="dateTime.date"><br><input type="time" ng-model="dateTime.time">',
      templateUrl: 'partials/select-date.html',
      title: 'Select depature time',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Get times</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.dateTime.date && !$scope.dateTime.time) {
              window.alert('You have to select a time or date');

              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              // Do cool stuff
            }
          }
        }
      ]
    });
  };

  $scope.times = [];
  TripPlanner.plan({
    allowTransfer: true   // get transfer options
  }).then(function(times){
    $scope.times = times;
  });

});

