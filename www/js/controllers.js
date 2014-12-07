
'use strict';

angular.module('chamBus')

.controller('MainCtrl', function($scope, TripPlanner, $translate, $state, $location, Database){

  $scope.selectStartLang = function(lang, redirect) {
    $translate.use(lang);
    if(redirect) {
      $location.path('/'+ redirect);
    }
  };

  $scope.dbVersion = Database.getVersion();

  $scope.isPlanning = function() {
    return TripPlanner.planning();
  };

  this.reset = function() {
    TripPlanner.reset();
    $state.go('areas');
  };
})


.controller('HomeCtrl', function($scope, $cordovaGlobalization, $state, $translate, $timeout) {

  // A language has been set go to next step
  if(window.localStorage.CHAM_LANG){
    $state.go('areas');
  }else{
    window.localStorage.CHAM_LANG = true;
  }

  /**
   * @todo $timeout is needed for navigator.globalization to be initiated :/
   */
  $timeout(function(){
    if(navigator.globalization){
      $cordovaGlobalization.getPreferredLanguage().then(
        function(result) {
          var langs = ['en', 'fr', 'sv'];
          var userLang = result.value.substr(0,2);
          if(langs[userLang]){
            $translate.use(userLang);
            $state.go('areas');
          }
        },
        function(error) {
          console.log(error);
      });
    }
  }, 200);

  $scope.homeTitle = 'ChamBus';

})

.controller('SelectAreaCtrl', function($scope, $location, $cordovaGeolocation, GeoTree, TripPlanner, JourneyInfo) {

    $scope.closeStops = [];

    $cordovaGeolocation
      .getCurrentPosition()
      .then(function (position) {
        if (position.coords.accuracy < 150) {
          $scope.closeStops = GeoTree.closest(position.coords).slice(0, 3);
        }
      }, function (error) {
        console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
      });

    // TODO: fix duplicate from SelectStopCtrl
    $scope.selectStop = function (stop) {
      TripPlanner.setDeparture(stop);
      $location.path('/area');
    };

    $scope.selectAreaTitle = 'Select start area';

    $scope.areas = TripPlanner.getAreas();

    $scope.selectArea = function (area) {
      $location.path('/area/' + area);
    };

    $scope.from = JourneyInfo.getEmptyInfo();
    $scope.to = JourneyInfo.getEmptyInfo();
  })

.controller('ToAreaController', function($scope, $location, $stateParams, JourneyInfo, TripPlanner) {
  $scope.areas = TripPlanner.getAreas();

  $scope.selectArea = function(area) {
    console.log('Going from ' + $stateParams.id + ' to ' + area);
    $location.path('/area/' + $stateParams.id + '/to/' + area);
  };

  var departure = TripPlanner.getDeparture();
  $scope.from = {
    'stop': departure ? departure.name : 'n/a',
    'area': ''
  };

  $scope.from.area = TripPlanner.getAreaById($stateParams.id).name;

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

  $scope.to = JourneyInfo.getEmptyInfo();
})

.controller('DestinationController', function($scope, $stateParams, JourneyInfo, TripPlanner, $location) {

  $scope.area = '';
  $scope.stops = [];
  $scope.to = JourneyInfo.getEmptyInfo();

  $scope.area = TripPlanner.getAreaById($stateParams.id);
  $scope.to.area = $scope.area.name;

  TripPlanner.getAreaStops($stateParams.id).then(function(resp){
    $scope.stops = resp;
  });

  $scope.selectStop = function(stop) {
    TripPlanner.setDestination(stop);
    $location.path('/result');
  };

  $scope.from = JourneyInfo.getEmptyInfo();
  $scope.to = JourneyInfo.getEmptyInfo();

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
  TripPlanner.plan().then(function(times){
    $scope.times = times;
  });

});

