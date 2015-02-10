/**
 * Trip Planner api
 */

'use strict';

angular.module('chamBus').factory('TripPlanner', function($q, $translate, Model, GeoTree, Time) {

  var api = {};
  var myPositionLabel;
  $translate('My position').then(function(text) {
    myPositionLabel = text;
  });

  function getItinerary(legs) {
    var iti = [];
    // console.log("creating itinerary from " + legs.length + " legs");
    for (var i = 0; i < legs.length; i++) {
      var leg = legs[i];
      var departure = leg[0];
      var arrival = leg[1];
      if (departure && arrival) {
        //console.log("creating itinerary leg: ", departure, arrival);
        var trip = departure.trip;
        iti.push({
          line: {
            direction: trip.headsign,
            trip: trip.id,
            number: trip.route.short_name
          },
          departure: {
            time: departure.departure_time.toString(),
            stop: {
              id: departure.stop.id,
              name: departure.stop.name
            }
          },
          destination: {
            time: arrival.arrival_time.toString(),
            stop: {
              id: arrival.stop.id,
              name: arrival.stop.name
            }
          }
        });
      } else {
        // console.log("Invalid itinerary leg: ", departure, arrival);
        return null;
      }
    }
    return iti;
  }

  function getLegs(departureStopTimes, possibleDestinations) { // , maxTime?
    var promises = [];
    var legs = [];
    departureStopTimes.forEach(function (st) {
      promises.push(Model.getArrivalStopTime(possibleDestinations, st.trip, st.departure_time)
        .then(function (ast) {
          if (ast && st.departure_time.before(ast.arrival_time)) {
            legs.push([st, ast]);
          }
        }));
    });

    return $q.all(promises).then(function () {
      return legs;
    });
  }

  /**
   *
   * @param options
   *  when : yyyy-mm-dd hh:mm:ss  or date
   *  allowTransfers
   *
   * @returns {*}
   */
  api.plan = function (options) {
    options = options || {};
    var mom = options.when ? moment(options.when) : moment();
    var departureTime = new Time(mom);
    var maxTime = (new Time(departureTime)).add(90);
    var maxWalk = options.walk || 200;

    var deferred = $q.defer();

    // find geo location of departure and destination
    if (_departure && _destination) {

      // find stops closest to departure or destination
      var possibleDepartures = GeoTree.closest(_departure, maxWalk);
      var possibleDestinations = GeoTree.closest(_destination, maxWalk);

      // for each stop find unique associated trips

      Model.getDepartureStopTimes(possibleDepartures, departureTime, maxTime, mom.toDate()).then(function (departureStopTimes) {
        var promises = [];
        var itineraries = [];

        // direct trips
        var deferred1 = $q.defer();
        getLegs(departureStopTimes, possibleDestinations).then(function (legs) {
          legs.forEach(function (leg) {
            itineraries.push(getItinerary([leg]));
          });
          deferred1.resolve();
        });
        promises.push(deferred1.promise);

        if (options.allowTransfer) {
          // single transfer only
          // console.log("adding 2 legged routes");
          departureStopTimes.forEach(function (st) {
            // get possible transfers and for each apply above logic
            var deferred1 = $q.defer();
            Model.getTransferStopTimes(st, mom.toDate()).then(function (transfers) {
              // console.log("found " + transfers.length + " potential transfers.");
              var subPromises = [];
              transfers.forEach(function (tx) {
                var deferred2 = $q.defer();
                getLegs([tx.to], possibleDestinations).then(function (legs) {
                  legs.forEach(function (leg) {
                    //console.log("found second leg", leg[0], leg[1]);
                    var iti = getItinerary([[st, tx.from], leg]);
                    if (iti) {
                      itineraries.push(iti);
                    }
                  });
                  deferred2.resolve();
                });
                subPromises.push(deferred2.promise);
              });
              return $q.all(subPromises).then(function () {
                deferred1.resolve();
              });

            });
            promises.push(deferred1);
          });
        }

        if (promises.length) {
          return $q.all(promises).then(function () {
            /*
             itineraries.sort(function (i1, i2) {
             // todo sort on destination stop times not itineraries
             return before(i1[i1.length-1].destination.time, i2[i2.length-1].destination.time) ? -1 : 1;
             });
             */
            return itineraries;
          });
        } else {
          return itineraries;
        }
      }).then(function (itineraries) {
        deferred.resolve(itineraries.slice(0, options.limit || 5));
      });

    } else {
      //todo
      deferred.reject('unknown destination', _departure, _destination);

    }
    return deferred.promise;

  };


  api.getAreas = function getAreas() {
    // todo lookup database
    return Model.getAreas();
  };


  api.getAreaById = function(id) {
    return Model.getArea(id);
  };

  api.getAreaStops = function(area) {
    return Model.searchStops({
      block: area.id || area
    });
  };


  // state variables
  var _departure, _destination;
  api.setDeparture = function(position) {
    _departure = (typeof position == 'number') ? Model.getStop(position): position;
    if (!_departure.name) {
      _departure.name = myPositionLabel;
    }
  };

  api.setDestination = function(position) {
    _destination = (typeof position == 'number') ? Model.getStop(position) : position;
    if (!_destination.name) {
      _destination.name = myPositionLabel;
    }
  };

  api.getDeparture = function() {
    return _departure;
  };
  api.getDestination = function() {
    return _destination;
  };
  api.reset = function() {
    _departure = null;
    _destination = null;
  };

  api.planning = function() {
    return !!_departure;
  };

  api.init = function() {
    return Model.init();
  };

  return api;
});

