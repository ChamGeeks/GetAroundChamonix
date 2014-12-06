/**
 * Trip Planner api
 */

'use strict';

angular.module('chamBus').factory('TripPlanner', function($q, Model, GeoTree, Time) {

	var api = {};

	function getItinerary(legs) {
		var iti = [];
		console.log("creating itinerary from " + legs.length + " legs");
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
				console.log("Invalid itinerary leg: ", departure, arrival);
				return null;
			}
		}
		return iti;
	}

	function getLegs(departureStopTimes, possibleDestinations, maxTime) {
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

	api.plan = function (options) {
		options = options || {};
		var departureTime = new Time((moment(options.when) || moment()).format("HH:mm"));
		var maxTime = (new Time(departureTime)).add(90);
		var maxWalk = options.walk || 200;

		var deferred = $q.defer();

		// find geo location of departure and destination
		if (_departure && _destination) {

			// find stops closest to departure or destination
			var possibleDepartures = GeoTree.closest(_departure, maxWalk);
			var possibleDestinations = GeoTree.closest(_destination, maxWalk);

			// for each stop find unique associated trips

			Model.getDepartureStopTimes(possibleDepartures, departureTime, maxTime).then(function (departureStopTimes) {
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
					console.log("adding 2 legged routes");
					departureStopTimes.forEach(function (st) {
						// get possible transfers and for each apply above logic
						var deferred1 = $q.defer();
						Model.getTransferStopTimes(st).then(function (transfers) {
							console.log("found " + transfers.length + " potential transfers.");
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
			deferred.reject("unknown destination", _departure, _destination);

		}
		return deferred.promise;

	};


	api.getAreas = function getAreas() {
		// todo lookup database
		var deferred = $q.defer();
		deferred.resolve(mockApi.areas);
		return deferred.promise;
	};


	api.getAreaById = function(id) {
		var deferred = $q.defer();

    id = ~~(id);

		var area = {};
		mockApi.areas.forEach(function(value){
			if(value.id === id) {
				area = value;
			}
		});

		deferred.resolve(area);

		return deferred.promise;
	};

	api.getAreaStops = function(area) {
		return Model.searchStops({
			block: area.id || area
		});
	};


	// state variables
	var _departure, _destination;
	api.setDeparture = function(stop) {
		_departure = stop.id ? stop : Model.getStop(stop);
	};
	api.setDestination = function(stop) {
		_destination = stop.id ? stop : Model.getStop(stop);
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
		return !!_departure
	};

	return api;
});

