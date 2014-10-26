
'use strict';

angular.module('chamBus')


// Sahev state in the planing
.factory('trip', function($location){
  return {
    start: false,
    stop: false,

    started: function(){
      return !!this.start;
    },
    notStarted: function() {
      return !this.start;
    },

    reset: function() {
      this.start = false;
      this.stop = false;
      $location.path('/area');
    }
  };
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
});
