// Ionic Starter App

'use strict';


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('chamBus', ['ionic', 'ngCordova', 'pascalprecht.translate', 'ngCookies'])

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
      // Wait for all data to be loaded
      resolve: {
        preLoadData: function(TripPlanner, $ionicLoading) {
          $ionicLoading.show({
            template: 'Loading database...'
          });
          TripPlanner.init().finally(function() {
            $ionicLoading.hide();
          });
        }
      },
      templateUrl: 'partials/select-area.html',
      controller: 'SelectAreaCtrl'
    })

    // Select a stop in an area
    .state('stops', {
      url: '/area/:id',
      templateUrl: 'partials/select-stop.html',
      controller: 'SelectStopCtrl'
    })

    .state('toAreas', {
      url: '/area/:id/to',
      templateUrl: 'partials/select-area.html',
      controller: 'ToAreaController'
    })

    .state('destination', {
      url: '/area/:departureId/to/:id',
      templateUrl: 'partials/select-stop.html',
      controller: 'DestinationController'
    })

    // Show the result page
    .state('result', {
      url: '/result',
      templateUrl: 'partials/result.html',
      controller: 'ResultCtrl'
    })

    // About page
    .state('about', {
      url: '/about',
      templateUrl: 'partials/about.html'
    });

  $urlRouterProvider.otherwise('/');

})

.config(['$translateProvider', function ($translateProvider) {

    $translateProvider.translations('en', {
      'SELECT_AREA': 'Select area',
      'SELECT_STOP': 'Select stop',
      'PICK_A_START': 'Pick a journey start below',
      'STOPS_NEAR': 'Stops near by',
      'STOPS_IN': 'Stops in: ',
      'FROM': 'Where are you now?',
      'WHERE_AREA': 'Where in',
      'TO': 'And where are you headed?',
      'STOP': 'Which stop?',
      'BUSS_TIMES_TITLE': 'Bus times',
      'SELECT_OTHER_TIME': 'Select a time',
      'NO_TIMES_FOUND': 'No times found for this trip.'
    });

    $translateProvider.translations('fr', {
      'SELECT_AREA': 'Choisir un quartier',
      'PICK_A_START': 'Pick a journey start below',
      'STOPS_NEAR': 'Arrêt à proximité',
      'STOPS_IN': 'Arrêts ',
      'FROM': 'Départ',
      'TO': 'Arrivée',
      'STOP': 'Quelle arrêt?',
      'BUSS_TIMES_TITLE': 'Horaire',
      'SELECT_OTHER_TIME': 'Choisir un horaire',
      'NO_TIMES_FOUND': 'Aucun horaire trouvé',
      'My position': 'Ma position'
    });

    $translateProvider.translations('sv', {
      'SELECT_AREA': 'Välj område',
      'PICK_A_START': 'Pick a journey start below',
      'STOPS_NEAR': 'Hållplatser nära',
      'STOPS_IN': 'Hållplatser i: ',
      'FROM': 'Vart är du nu?',
      'TO': 'Var vill du åka?',
      'STOP': 'Vilken hållplats?',
      'BUSS_TIMES_TITLE': 'Buss tider',
      'SELECT_OTHER_TIME': 'Välj en tid',
      'NO_TIMES_FOUND': 'Hittade inga tider för denna resa.',
      'My position': 'My position in sv'
    });

    $translateProvider.preferredLanguage('en');

    // remember language
    $translateProvider.useLocalStorage();
  }]);
