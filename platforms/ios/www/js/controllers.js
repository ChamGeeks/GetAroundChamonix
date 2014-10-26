
'use strict';

angular.module('chamBus')

.controller('MainCtrl', function($scope, trip){

  this.isPlaning = function() {
    return trip.start;
  };

  this.reset = function() {
    trip.reset();
  };
})


.controller('HomeCtrl', function($scope) {

  $scope.homeTitle = 'ChamBus';

})



.controller('SelectAreaCtrl', function($scope, $location, trip, $cordovaGeolocation, BusAPI) {


  $scope.closeStops = [];

  if( trip.notStarted() ){
    $cordovaGeolocation
      .getCurrentPosition()
      .then(function (position) {
        console.log(position.coords.accuracy);
        if(position.coords.accuracy < 150){
          BusAPI.getNerbyStops(position.coords).then(function(resp){
            $scope.closeStops = resp.data.slice(0, 3);
          });
        }
      });
  }

  if(!trip.start) {
    $scope.selectAreaTitle = 'Select start area';
  }else{
    $scope.selectAreaTitle = 'Select end area';
  }


  $scope.areas = [];

  BusAPI.getAreas().then(function(data){
    $scope.areas = data;
  });


  $scope.selectArea = function(area) {
    $location.path('/area/'+ area);
  };

})



.controller('SelectStopCtrl', function($scope, $stateParams, BusAPI, $location, trip) {

  $scope.area = '';
  $scope.stops = [];


  BusAPI.getAreaById($stateParams.id).then(function(data){
    $scope.area = data;
  });

  BusAPI.getStops($stateParams.id).then(function(resp){
    $scope.stops = resp.data;
  });


  $scope.selectStop = function(stop) {
    if(!trip.start){
      trip.start = stop;
      $location.path('/area');
      return;
    }else{
      trip.end = stop;
    }
    $location.path('/result');
    console.log('Show times', trip.start, trip.end);
  };

})



.controller('ResultCtrl', function($scope, trip, $ionicPopup){
  $scope.trip = trip;

  $scope.dateTime = {
    time: false,
    date: false
  };

  $scope.selectDateTime = function() {

    var myPopup = $ionicPopup.show({
      template: '<input type="date" ng-model="dateTime.date"><br><input type="time" ng-model="dateTime.time">',
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
        },
      ]
    });
  }

});

