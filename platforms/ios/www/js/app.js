// Ionic Starter App

'use strict';

var mockApi = {
  areas: [
    { id: 1, name: 'Le Tour' },
    { id: 2, name: 'Argentiere', meta: {
      lifts: [ 'Grand Montets' ]
    } },
    { id: 3, name: 'Le Praz', meta: {
      lifts: [ 'Flegere' ]
    } },
    { id: 4, name: 'Chamonix', meta: {
      lifts: [ 'Brevant', 'Aiguille du Midi' ]
    } },
    { id: 5, name: 'Les Houches' }
  ],
  stops: [
    { id: 1, name: 'Les Praz Flégèr', lines: [ 1, 2, 11, 12] },
    { id: 2, name: 'Les Praz Poste', lines: [ 2, 11 ] },
    { id: 3, name: 'Les Vardesses', lines: [ 1, 12 ] },
    { id: 4, name: 'L\'Arveyron', lines: [ 1, 12 ] },
    { id: 5, name: 'Les Ilettes', lines: [ 2, 11 ] },
    { id: 6, name: 'Les Nants', lines: [ 2, 11 ] }
  ]
};



// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})


.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'partials/home.html',
      controller: 'HomeCtrl'
    })
    .state('area', {
      url: '/area/:id',
      templateUrl: 'partials/area.html',
      controller: 'AreaCtrl'
    })
    .state('stop', {
      url: '/stop/:id',
      templateUrl: 'partials/stop.html',
      controller: 'StopCtrl'
    });

   $urlRouterProvider.otherwise('/');

})


.factory('BusAPI', function($q){
  return {

    getAreas: function getAreas() {
      var deferred = $q.defer();
      deferred.resolve(mockApi.areas);
      return deferred.promise;
    },


    getAreaById: function(id) {
      var deferred = $q.defer();

      var area = {};
      mockApi.areas.forEach(function(value){
        if(value.id == id) {
          area = value;
        }
      });

      deferred.resolve(area);

      return deferred.promise;
    },
    getStops: function getStops(id) {
      var deferred = $q.defer();
      deferred.resolve(mockApi.stops);
      return deferred.promise;
    }
  };
})



.controller('MainCtrl', function($scope){

  // Move to factory
  $scope.startStop = 0;
  $scope.endStop = 0;
})


.controller('HomeCtrl', function($scope, trip) {

  if(!trip.start) {
    $scope.selectAreaTitle = 'Select start area';
  }else{
    $scope.selectAreaTitle = 'Select end area';
  }

})

.factory('trip', function(){
  return {
    start: false,
    stop: false
  };
})



.controller('SelectAreaCtrl', function($scope, $location, BusAPI) {

  $scope.areas = [];

  BusAPI.getAreas().then(function(data){
    $scope.areas = data;
  });


  $scope.selectArea = function(area) {
    $location.path('/area/'+ area);
  };

})



.controller('AreaCtrl', function($scope, $stateParams, BusAPI, $location, trip) {

  $scope.area = '';
  $scope.stops = [];


  BusAPI.getAreaById($stateParams.id).then(function(data){
    $scope.area = data;
  });

  BusAPI.getStops('id').then(function(data){
    $scope.stops = data;
  });


  $scope.selectStop = function(id) {
    if(!trip.start){
      trip.start = id;
      $location.path('/');
      return;
    }else{
      trip.end = id;
    }
    console.log('Show times');
  }

})


.controller('StopCtrl', function($scope, $stateParams, BusAPI) {
  $scope.stop = {
    name: 'The stop'
  };




});

