/**
 * html5 sql interface
 */

'use strict';

angular.module('chamBus').factory('Database', function($http, $q, $ionicLoading){

	function updateDatabase() {
		$http.get('https://chx-transit-db.herokuapp.com/api/export/sql').then(function(resp) {

			var version = resp.headers['db-version'] || 1;

			html5sql.changeVersion(html5sql.database.version, version, resp.data, function(){
				$ionicLoading.hide();
				console.log('Db updated');
			}, function(error, statement){
				$ionicLoading.hide();
				console.error('Error: ' + error.message + ' when processing ' + statement);
			});
		});
	}

	function toSQL(o) {
		return (typeof o === 'string') ? '\'' + o + '\'' : o;
	}

	var db = {
		init: function() {
			// Open the db
			html5sql.openDatabase('com.chamgeeks.chambus', 'ChamBus Database', 3*1024*1024);

			// Update db
			if(html5sql.database && html5sql.database.version === ''){
				console.log('DB version: ', html5sql.database.version);
				$ionicLoading.show({
					template: 'Downloading database...'
				});

				updateDatabase();

			} else if(html5sql.database) {
				$http.get('https://chx-transit-db.herokuapp.com/api/status')
					.then(function(resp) {
						if(resp && resp.data && resp.data.version != html5sql.database.version) {
							console.log('Update: ', resp.data.version, html5sql.database.version);
							// Update database
							updateDatabase();
						}
					});
			}

		},
		find: function(sql, params) {

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
				console.log(query, records.length);
				deferred.resolve(records);
			}, function(error, failingQuery) {
				console.log(error, failingQuery);
				deferred.reject({ error: error, sql: failingQuery});
			});

			return deferred.promise;
		},

		findOne: function(sql, params) {
			return db.find(sql, params).then(function(data) {
				return data[0];
			});
		}
	};

	return db;

});

