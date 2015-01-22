/**
 * Geo spatial search service
 */

'use strict';

angular.module('chamBus').factory('GeoTree', function($q, Database){
  var geoTree = new GeoTree();

  function loadGeoTree() {
    return Database.find("select * from stop;").then(function (data) {
      data = data || [];
      data.forEach(function (stop) {
        geoTree.insert({lat: stop.lat, lng: stop.lon, data: stop});
      });
      console.log(data.length + " points inserted in geo tree");
    });
  }

  return {
    init: loadGeoTree,
    closest: function (position, radius) {
      var res = geoTree.find({
        lat: position.latitude || position.lat,
        lng: position.longitude || position.lng || position.lon
      }, parseFloat(radius), 'm');
      console.log("looking for points within " + radius + "m of " + position + " - found " + res.length);
      return res;
    }
  }

});

