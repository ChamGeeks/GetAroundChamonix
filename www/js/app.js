// Ionic Starter App

'use strict';

var mockApi = {
  areas: [
    { id: 1, name: 'Le Tour' },
    { id: 2, name: 'Argentiere' },
    { id: 3, name: 'Le Praz' },
    { id: 4, name: 'Chamonix' },
    { id: 5, name: 'Les Houches' }
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

.controller('AreaCtrl', function($scope, $stateParams) {

  $scope.area = $stateParams.id;
});
