
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



.factory('chamDb', function($http, $q){

  // Open the db
  html5sql.openDatabase('com.chamgeeks.chambus', 'ChamBus Database', 3*1024*1024);

  // Update db
  if(html5sql.database && html5sql.database.version === ''){
    console.log('DB version: ', html5sql.database.version);
    $http.get('https://peaceful-chamber-9756.herokuapp.com/api/export/sql').then(function(resp){

      html5sql.changeVersion('', '0.1', resp.data, function(){
          console.log('Db updated');
        }, function(error, statement){
          console.error('Error: ' + error.message + ' when processing ' + statement);
        });
    });
  }

  var db = {
    init: function() { return 'Yay'; },
    query: function(sql) {
      var deferred = $q.defer();

      html5sql.process(sql, function(transaction, results) {
          deferred.resolve(results);
        }, function(error, failingQuery) {
          deferred.reject({ error: error, sql: failingQuery});
        });

      return deferred.promise;
    },

    getStops: function(block_id) {
      var deferred = $q.defer();

      html5sql.process('select distinct stop_id from stop_block where block_id='+ ~~block_id +';',
          function(tx, results){

          var ids = [];
          var len = results.rows.length, i;
          for (i = 0; i < len; i++) {
            ids.push(results.rows.item(i).stop_id);
          }

          html5sql.process('select * from stop where id in (' + ids.join(',') +');',
            function(tx, results) {

            var stops = [];

            var len = results.rows.length, i;
            for (i = 0; i < len; i++) {
              stops.push(results.rows.item(i));
            }

            deferred.resolve(stops);
        });
      });

    return deferred.promise;
    }
  };

  return db;

})




.factory('BusAPI', function($q, $http, chamDb){

  // var db = window.openDatabase('gtfs', '1.0', 'my first database', 2 * 1024 * 1024);

  // db.transaction(function (tx) {
  //   console.log(tx);
  //   // tx.executeSql('create table block (id INTEGER, name TEXT, PRIMARY KEY(id))');
  //   // tx.executeSql('insert into block (id,name) values (1,'Chamonix')');
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

      return chamDb.getStops(area_id);

      // var url = 'https://peaceful-chamber-9756.herokuapp.com/api/search?block='+ area_id;
      // return $http.get(url);

    },

    getNerbyStops: function(coords, radius) {
      radius = radius || 500;
      var url = 'https://afternoon-cliffs-4353.herokuapp.com/api/closest';

      return $http.get(url +'?lat='+ coords.latitude +'&lng='+ coords.longitude +'&radius='+ radius);
    }
  };
});
