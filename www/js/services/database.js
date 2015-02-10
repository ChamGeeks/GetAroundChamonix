/**
 * html5 sql interface
 *
 * Alternative? http://lokijs.org/
 */

'use strict';

angular.module('chamBus').factory('Database', function($http, $q, $ionicLoading) {

  var db = {},
      dbInit;

  function updateDatabase() {
    var deferred = $q.defer();
    $http.get('https://chx-transit-db.herokuapp.com/api/export/sql', {
      headers: {
        'If-None-Match': html5sql.database.version
      }
    }).then(function(response) {
        var version = response.headers('Etag');
        html5sql.changeVersion(html5sql.database.version, version, response.data, function () {
          console.log('Dataset updated to version ' + version);
          db.version = version;
          deferred.resolve();
        }, function (error, statement) {
          console.log('Error: ' + error.message + ' when processing ' + statement);
          deferred.resolve();
        });
      }).catch(function(error) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        if (error.status == 304) {
          console.log("Data is up to date");
        } else {
          console.log("Data could not be updated", error.data);
        }
        deferred.resolve();
      });
    return deferred.promise;
  }


  // Check if there is a newer version of the database in the background
  // and ask to update if there is
  function checkForDatabaseUpdate() {
    $http.get('https://chx-transit-db.herokuapp.com/api/status').then(function(res) {
      // If a newer version exist
      if(res.data.id && res.data.id > ~~(html5sql.database.version)) {
        // ask the user first
        var update = confirm("There is a new version of the timetable do you want to update?");
        if(update) {
          $ionicLoading.show({ template: 'Updating database...' });
          // Get the new version
          updateDatabase().finally(function() {
            $ionicLoading.hide();
            location.reload();
          });;
        }
      }
    });
  }




  // Open the db
  html5sql.openDatabase('com.chamgeeks.chambus', 'ChamBus Database', 3*1024*1024);

  // Will allways run if no database exist
  if(~~(html5sql.database.version) < 2) {
    dbInit = updateDatabase();
  }else {

    // Just return resolved promise
    var deferred = $q.defer(); deferred.resolve();
    dbInit = deferred.promise;

    // Check if there is a new version of the database
    checkForDatabaseUpdate();
  }



  function toSQL(o) {
    return (typeof o === 'string') ? '\'' + o + '\'' : o;
  }


  // Returns a promise
  db.init = function() { return dbInit; };

  db.find = function(sql, params) {
    var query = [];
    if (params) {
      params.forEach(function (p) {
        var i = sql.indexOf('?');
        if (i >= 0) {
          query.push(sql.substr(0, i));
          query.push(toSQL(p));
          sql = sql.substr(i + 1);
        } else {
          query.push(sql);
          sql = '';
        }
      });
    }
    query.push(sql);

    // todo handle params
    var deferred = $q.defer();
    query = query.join('');
    html5sql.process(query, function(transaction, results) {
      var records = [];
      for (var i = 0; i < results.rows.length; i++) {
        records.push(results.rows.item(i));
      }
      // console.log(query, records.length);
      deferred.resolve(records);
    }, function(error, failingQuery) {
      // console.log(error, failingQuery);
      deferred.reject({ error: error, sql: failingQuery});
    });

    return deferred.promise;
  };

  db.findOne = function(sql, params) {
    return db.find(sql, params).then(function(data) {
      return data[0];
    });
  };

  db.version = html5sql.database.version;

  return db;

});

