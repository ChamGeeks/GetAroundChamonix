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
    { id: 132, name: 'Stop 1' },
    { id: 12, name: 'Stop 2' },
    { id: 2, name: 'Stop 3' },
    { id: 32, name: 'Stop 4' }
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
    });

   $urlRouterProvider.otherwise('/');

})


.factory('BusAPI', function(){
  return {
    getAreas: function getAreas(callback) {
      return callback(mockApi.areas);
    },
    getAreaById: function(id, callback) {
      var area = {};
      mockApi.areas.forEach(function(value){
        if(value.id == id) {
          area = value;
        }
      });
      return callback(area);
    },
    getStops: function getStops(id, callback) {
      return callback(mockApi.stops);
    }
  };
})


.controller('HomeCtrl', function($scope, $location, BusAPI) {

  $scope.areas = [];

  BusAPI.getAreas(function(data){
    $scope.areas = data;
  });


  $scope.selectArea = function(area) {
    $location.path('/area/'+ area);
  };

})

.controller('AreaCtrl', function($scope, $stateParams, BusAPI) {

  $scope.area = '';
  $scope.stops = [];


  BusAPI.getAreaById($stateParams.id, function(data){
    $scope.area = data;
  });

  BusAPI.getStops('id', function(data){
    $scope.stops = data;
  });


});

