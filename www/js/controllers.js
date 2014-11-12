
'use strict';

angular.module('chamBus')

.controller('MainCtrl', function($scope, trip, $translate, $location){

  $scope.selectStartLang = function(lang) {
    $translate.use(lang);
    $location.path('/area');
  };

  this.isPlaning = function() {
    return trip.start;
  };

  this.reset = function() {
    trip.reset();
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



.controller('SelectAreaCtrl', function($scope, $location, trip, $cordovaGeolocation, BusAPI) {


  $scope.closeStops = [];

  if( trip.notStarted() ){
    $cordovaGeolocation
      .getCurrentPosition()
      .then(function (position) {
        if(position.coords.accuracy < 150){
          BusAPI.getNerbyStops(position.coords).then(function(resp){
            $scope.closeStops = resp.data.slice(0, 3);
          });
        }
      }, function(error){
        alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
      });
  }

  // TODO: fix duplicate from SelectStopCtrl
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
    $scope.stops = resp;
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
  };

})



.controller('ResultCtrl', function($scope, trip, $ionicPopup, BusAPI){
  $scope.trip = trip;

  $scope.dateTime = {};

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
  };

  $scope.times = [];
  BusAPI.findTimes().then(function(times){
    $scope.times = times;
  });

});

