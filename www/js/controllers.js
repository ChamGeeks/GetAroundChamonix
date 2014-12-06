
'use strict';

angular.module('chamBus')

.controller('MainCtrl', function($scope, TripPlanner, $translate, $state, $location){

  $scope.selectStartLang = function(lang) {
    $translate.use(lang);
    $location.path('/area');
  };

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
      if(position.coords.accuracy < 150){
        $scope.closeStops = GeoTree.closest(position.coords).slice(0, 3);
      }
    }, function(error){
      alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
    });

  // TODO: fix duplicate from SelectStopCtrl
  $scope.selectStop = function(stop) {
    TripPlanner.setDeparture(stop);
    $location.path('/area');
  };

  $scope.selectAreaTitle = 'Select start area';

  $scope.areas = [];

  TripPlanner.getAreas().then(function(data){
    $scope.areas = data;
  });

  $scope.selectArea = function(area) {
    $location.path('/area/'+ area);
  };

  $scope.from = JourneyInfo.getEmptyInfo();
  $scope.to = JourneyInfo.getEmptyInfo();
})

.controller('ToAreaController', function($scope, $location, $stateParams, TripPlanner) {
  $scope.areas = [];

  TripPlanner.getAreas().then(function(data){
    $scope.areas = data;
  });

  $scope.selectArea = function(area) {
    console.log('Going from ' + $stateParams.id + ' to ' + area);
    $location.path('/area/' + $stateParams.id + '/to/' + area);
  };

  var departure = TripPlanner.getDeparture();
  $scope.from = {
    "stop": departure ? departure.name : 'n/a', 
    "area": ''
  };
  TripPlanner.getAreaById($stateParams.id).then(function(data) {
    $scope.from.area = data.name;
  });

  $scope.to = {"stop":"...", "area":"..."};
})


.controller('SelectStopCtrl', function($scope, $stateParams, TripPlanner, $location) {

  $scope.area = '';
  $scope.stops = [];

  TripPlanner.getAreaById($stateParams.id).then(function(data){
    $scope.area = data;
  });

  TripPlanner.getAreaStops($stateParams.id).then(function(resp){
    $scope.stops = resp;
  });


  $scope.selectStop = function(stop) {
    TripPlanner.setDeparture(stop);
    console.log('going to ToArea ' + $scope.area.id);
    $location.path('/area/' + $scope.area.id + '/to');
  };

})

.controller('DestinationController', function($scope, $stateParams, TripPlanner, $location) {

  $scope.area = '';
  $scope.stops = [];

  TripPlanner.getAreaById($stateParams.id).then(function(data){
    $scope.area = data;
  });

  TripPlanner.getAreaStops($stateParams.id).then(function(resp){
    $scope.stops = resp;
  });


  $scope.selectStop = function(stop) {
    TripPlanner.setDestination(stop);
    $location.path('/result');
  };
})

.controller('ResultCtrl', function($scope, $ionicPopup, TripPlanner, $cordovaDatePicker){
  $scope.trip = {
    start: TripPlanner.getDeparture(),
    end: TripPlanner.getDestination()
  };

  $scope.dateTime = {};


  $scope.selectDate = function() {
    var options = {date: new Date(), mode: 'date'};
    //var options = {date: new Date(), mode: 'time'}; for time
    $cordovaDatePicker.show(options).then(function(date){
      alert(date);
    });
  }

  $scope.selectDateTime = function() {

    var myPopup = $ionicPopup.show({
      //template: '<input type="date" ng-model="dateTime.date"><br><input type="time" ng-model="dateTime.time">',
      templateUrl: 'partials/select-date.html',
      title: 'Select depature time',
      subTitle: 'Please',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.dateTime.date || !$scope.dateTime.time) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
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

