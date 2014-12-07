
'use strict';

angular.module('chamBus')

.filter('areasOrder', function () {
  return function (items, search) {
    var result = [];

    // Convert the object to an array
    angular.forEach(items, function (value) {
      result.push(value);
    });

    // Sort the array to match the area order
    result.sort(function(a1, a2) {
      return a1.display_order - a2.display_order;
    });

    return result;
  }
});
