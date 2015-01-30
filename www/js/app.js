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
 * Overwrite default syste configs e.g.Android tab in top
 */
.config(function($ionicConfigProvider) {
  // Always display the tabs in the bottom and none striped (android)
  $ionicConfigProvider.tabs
    .style("standard")
    .position("bottom");
  // Center the title on all systems
  $ionicConfigProvider.navBar.alignTitle("center");
})




/**
 * Routes
 */
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

    // Starting point
    .state('settings', {
      url: '/settings',
       views: {
        'settings': {
          templateUrl: 'partials/settings.html',
          controller: 'SettingsCtrl'
        }
      }
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
      views: {
        'planner': {
          templateUrl: 'partials/select-area.html',
          controller: 'SelectAreaCtrl'
        }
      }
    })

    // Select a stop in an area
    .state('stops', {
      url: '/area/:id',
      views: {
        'planner': {
          templateUrl: 'partials/select-stop.html',
          controller: 'SelectStopCtrl'
        }
      }
    })

    .state('toAreas', {
      url: '/area/:id/to',
      views: {
        'planner': {
          templateUrl: 'partials/select-area.html',
          controller: 'ToAreaController'
        }
      }
    })

    .state('destination', {
      url: '/area/:departureId/to/:id',
      views: {
        'planner': {
          templateUrl: 'partials/select-stop.html',
          controller: 'DestinationController'
        }
      }
    })

    // Show the result page
    .state('result', {
      url: '/result',
      views: {
        'planner': {
          templateUrl: 'partials/result.html',
          controller: 'ResultCtrl'
        }
      }
    })

    // About page
    .state('about', {
      url: '/about',
      views: {
        'about': {
          templateUrl: 'partials/about.html'
        }
      }
    });

  $urlRouterProvider.otherwise('/area');

})



/**
 * Translations
 */
.config(['$translateProvider', function ($translateProvider) {

  // English
  $translateProvider.translations('en', {
    'APP_NAME': 'ChamRide',
    'ABOUT': 'About',
    'ABOUT_TEXT': 'This is an app to help you find the next bus.'+
      '<p>The app was created during a ChamGeeks hackaton.</p>',
    'ABOUT_CHAMGEEKS': 'ChamGeeks is a organisation created for geeks in Chamonix to come'+
      'together and talk, create and help each other. We usualy meet up one night each month'+
      'during the first week and sometimes throw a hackaton.',
    'CREDITS': 'Credits',

    'SELECT_AREA': 'Select area',
    'PICK_A_START': 'Pick a journey start below',
    'My position': 'My position',

    'SELECT_STOP': 'Select stop',
    'STOP': 'Which stop?',

    'RESULTS_TITLE': 'Bus times',
    'SELECT_OTHER_TIME': 'Select a time',
    'NO_TIMES_FOUND': 'No times found for this trip.',
    'New trip': 'New trip',
    'Loading...': 'Loading...',
    'Pick time': 'Pick time',
    'Pick date': 'Pick date',

    'TIME_POPUP_TITLE': 'Select depature time',
    'CANCEL': 'Cancel',
    'GET_TIMES': 'Get times',
    'TIME_POPUP_ALERT': 'You have to select a time or date',

    'Settings': 'Settings',
    'Change language': 'Change language'
  });

  // French
  $translateProvider.translations('fr', {
    'SELECT_AREA': 'Choisir un quartier',
    'PICK_A_START': 'Pick a journey start below',
    'FROM': 'Départ',
    'TO': 'Arrivée',
    'STOP': 'Quelle arrêt?',
    'RESULTS_TITLE': 'Horaire',
    'SELECT_OTHER_TIME': 'Choisir un horaire',
    'NO_TIMES_FOUND': 'Aucun horaire trouvé',
    'My position': 'Ma position',
    'Settings': 'Le paramètres',
    'Change language': 'Changer de langue',
  });

  // Swedish
  $translateProvider.translations('sv', {
    'APP_NAME': 'ChamRide',
    'ABOUT': 'Om ChamRide',
    // 'ABOUT_TEXT': 'This is an app to help you find the next bus.'+
    //   '<p>The app was created during a ChamGeeks hackaton.</p>',
    // 'ABOUT_CHAMGEEKS': 'ChamGeeks is a organisation created for geeks in Chamonix to come'+
    //   'together and talk, create and help each other. We usualy meet up one night each month'+
    //   'during the first week and sometimes throw a hackaton.',
    'CREDITS': 'Credits',

    'SELECT_AREA': 'Välj område',
    'PICK_A_START': 'Välj inom vilket område resan startar',
    'My position': 'Min position',

    'SELECT_STOP': 'Välj ändhållplats',
    'STOP': 'Vilken hållplats?',

    'RESULTS_TITLE': 'Buss tider',
    'SELECT_OTHER_TIME': 'Välj en tid',
    'NO_TIMES_FOUND': 'Hittade inga tider för denna resa.',
    'New trip': 'Ny resa',
    'Loading...': 'Laddar...',
    'Pick time': 'Välj en tid',
    'Pick date': 'Välj datum',

    'TIME_POPUP_TITLE': 'Välj tid för resan',
    'CANCEL': 'Avbryt',
    'GET_TIMES': 'Hämta tider',
    'TIME_POPUP_ALERT': 'Du måste välja minst en tid eller ett datum.',

    'Settings': 'Inställningar',
    'Change language': 'Ändra språk'
  });

  // Default language
  $translateProvider.preferredLanguage('en');

  // remember language
  $translateProvider.useLocalStorage();
}]);
