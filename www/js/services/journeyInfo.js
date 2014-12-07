'use strict';
angular.module('chamBus').factory('JourneyInfo', function($q, TripPlanner) {
  var api = {};
  api.getEmptyInfo = function() {
    return {"stop":"...", "area":"..."};
  };

  api.getFromInfo = function(areaId) {
		var deferred = $q.defer();

    var departure = TripPlanner.getDeparture();
    var from = {
      "stop": departure ? departure.name : 'n/a',
      "area": ''
    };
    TripPlanner.getAreaById(areaId).then(function(data) {
      from.area = data.name;
      deferred.resolve(from);
    });

    return deferred.promise;
  };

  return api;
});
