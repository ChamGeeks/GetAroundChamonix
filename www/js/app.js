// Ionic Starter App

'use strict';


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('chamBus', ['ionic', 'ngCordova', 'pascalprecht.translate'])

// Iconic code
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


/**
 * Routes
 */
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

    // Starting point
    .state('home', {
      url: '/',
      templateUrl: 'partials/home.html',
      controller: 'HomeCtrl'
    })

    .state('areas', {
      url: '/area',
      templateUrl: 'partials/select-area.html',
      controller: 'SelectAreaCtrl'
    })

    // Select a stop in an area
    .state('stops', {
      url: '/area/:id',
      templateUrl: 'partials/select-stop.html',
      controller: 'SelectStopCtrl'
    })

    // Show the result page
    .state('result', {
      url: '/result',
      templateUrl: 'partials/result.html',
      controller: 'ResultCtrl'
    });

   $urlRouterProvider.otherwise('/');

})

.config(['$translateProvider', function ($translateProvider) {
  $translateProvider.translations('en', {
    'SELECT_AREA': 'Select area',
    'STOPS_NEAR': 'Stops near by'
  });

  $translateProvider.translations('fr', {
    'SELECT_AREA': 'Oi hu hu',
    'STOPS_NEAR': 'Fu du fafa'
  });

  $translateProvider.translations('sv', {
    'SELECT_AREA': 'Välj område',
    'STOPS_NEAR': 'Hållplatser nära'
  });

  $translateProvider.preferredLanguage('en');
}]);
