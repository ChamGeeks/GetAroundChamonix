'use strict';
angular.module('chamBus').factory('JourneyInfo', function($q) {
  var api = {};
  api.getEmptyInfo = function() {
    return {"stop":"...", "area":"..."};
  };
  return api;
});
