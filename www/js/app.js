// Ionic Starter App

'use strict';

var mockApi = {
  areas: [
    { id: 1, name: 'Chamonix' },
    { id: 2, name: 'Servoz' },
    { id: 3, name: 'Les Houches' },
    { id: 4, name: 'Vaudagne' },
    { id: 5, name: 'Bossons/Pelerins' },
    { id: 6, name: 'Les Praz' },
    { id: 7, name: 'Les Tines' },
    { id: 8, name: 'Argentière' },
    { id: 9, name: 'Le Tour' }
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
angular.module('starter', ['ionic', 'ngCordova'])

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
    })
    .state('result', {
      url: '/result',
      templateUrl: 'partials/result.html',
      controller: 'ResultCtrl'
    });

   $urlRouterProvider.otherwise('/');

})


.factory('BusAPI', function($q, $http){

  // var db = window.openDatabase('gtfs', '1.0', 'my first database', 2 * 1024 * 1024);

  // db.transaction(function (tx) {
  //   console.log(tx);
  //   // tx.executeSql('create table block (id INTEGER, name TEXT, PRIMARY KEY(id))');
  //   // tx.executeSql('insert into block (id,name) values (1,"Chamonix")');
  //   tx.executeSql('SELECT * FROM block', [], function(tx, result){
  //     console.log(tx, result);
  //     for
  //   });
  // });

  // db.transaction(function (tx) {
  //   tx.executeSql('SELECT * FROM block', [], function(tx, result){
  //     console.log(tx, result);
  //   });
  // });

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

    getStops: function getStops(area_id) {

      var url = 'https://peaceful-chamber-9756.herokuapp.com/api/search?block='+ area_id;
      return $http.get(url);

    },

    getNerbyStops: function(coords, radius) {
      radius = radius || 500;
      var url = 'https://afternoon-cliffs-4353.herokuapp.com/api/closest';

      return $http.get(url +'?lat='+ coords.latitude +'&lng='+ coords.longitude +'&radius='+ radius);
    }
  };
})



.controller('MainCtrl', function($scope, trip){

  this.isPlaning = function() {
    return trip.start;
  };

  this.reset = function() {
    trip.reset();
  };
})


.controller('HomeCtrl', function($scope, trip, $cordovaGeolocation, BusAPI) {

  $scope.closeStops = [];

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

  if(!trip.start) {
    $scope.selectAreaTitle = 'Select start area';
  }else{
    $scope.selectAreaTitle = 'Select end area';
  }

})

.factory('trip', function($location){
  return {
    start: false,
    stop: false,
    reset: function() {
      this.start = false;
      this.stop = false;
      $location.path('/');
    }
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

  BusAPI.getStops($stateParams.id).then(function(resp){
    $scope.stops = resp.data;
  });


  $scope.selectStop = function(stop) {
    if(!trip.start){
      trip.start = stop;
      $location.path('/');
      return;
    }else{
      trip.end = stop;
    }
    $location.path('/result');
    console.log('Show times', trip.start, trip.end);
  }

})



.controller('ResultCtrl', function($scope, trip){
  $scope.trip = trip;
})


// Not used
.controller('StopCtrl', function($scope, $stateParams) {
  $scope.stop = {
    name: 'The stop',
    id: $stateParams.id
  };
});

