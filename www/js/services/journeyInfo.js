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

    if(areaId != 'my-location') {
      from.area = TripPlanner.getAreaById(areaId).name;
    } else {
      from.area = '';
    }
    deferred.resolve(from);

    return deferred.promise;
  };

  return api;
});
