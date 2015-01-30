/**
 * Data object model
 *
 * This service hides all SQL code from the rest of the application and only exposes
 * Trip, Stop, StopTime and Transfer objects
 */

'use strict';

angular.module('chamBus').factory('Model', function($q, Time, Database, GeoTree) {

  function StopTime(data, trip) {
    this.departure_time = new Time(data.departure_time);
    this.arrival_time = new Time(data.arrival_time);
    this.trip = trip;
    this.stop = _stops['_' + data.stop_id];
    if (!this.stop) {
      console.log('STOP NOT FOUND', data.stop_id);
    }
  }

  function Trip(data) {
    this.id = data.id;
    this.headsign = data.headsign;
    this.route = _routes['_' + data.route_id];
    if (data.service_id) {
      this.service = getService(data.service_id);
    }
  }

  function Service(data) {
    this.id = this.id;
    this.route = getRoute(data.route_id);
    this.from = moment(data.from_date);
    this.to = moment(data.to_date);
    this.filter = JSON.parse(data.json_days);
  }

  Service.prototype.isRunning = function(when) {
    when = moment(when);
    var dow = when.isoWeekday();
    return (this.filter.indexOf(dow) >= 0) &&
      this.from.isBefore(when) &&
      this.to.isAfter(when);
  };

  function Transfer(from, to, transferTime) {
    this.from = from;
    this.to = to;
    this.transferTime = transferTime;
  }

  var _stops = {}, _routes = {}, _areas = {}, _services = {};
  function loadStops() {
    return Database.find('select * from stop;').then(function(stops) {
      stops.forEach(function (stop) {
        _stops['_' + stop.id] = stop;
      });
      // console.log('Loaded ' + stops.length + ' stops');

      return Database.find('select * from stop_block;').then(function (records) {
        records.forEach(function (record) {
          var stop = getStop(record.stop_id);
          if (stop) {
            stop.areas = stop.areas || [];
            var area = getArea(record.block_id);
            if (area) {
              stop.areas.push(area);
              area.numberOfStops++;
            }
          }
        });
        // console.log('Stops linked to areas');
      }).then(function () {
        return Database.find('select * from stop_metadata;').then(function (records) {
          records.forEach(function (record) {
            var stop = getStop(record.stop_id);
            if (stop) {
              stop.meta = stop.meta || {};
              stop.meta[record.name] = JSON.parse(record.json_value);
            }
          });
          // console.log('medadata added to stops');
        });
      });
    });
  }

  function loadServices() {
    return Database.find('select * from service;').then(function(services) {
      services.forEach(function(service) {
        _services['_' + service.id] = new Service(service);
      });
      // console.log('Loaded ' + services.length + ' services');
    });
  }

  function loadRoutes() {
    return Database.find('select * from route;').then(function(routes) {
      routes.forEach(function(route) {
        _routes['_' + route.id] = route;
      });
      // console.log('Loaded ' + routes.length + ' routes');
    });
  }

  function loadAreas() {
    return Database.find('select * from block;').then(function(areas) {
      areas.forEach(function(area) {
        _areas['_' + area.id] = area;
        area.numberOfStops = 0;
      });
      // console.log('Loaded ' + areas.length + ' areas');
    }).then(function() {
      return Database.find('select * from area_metadata;').then(function (records) {
        records.forEach(function (record) {
          var area = getArea(record.area_id);
          if (area) {
            area.meta = area.meta || {};
            area.meta[record.name] = JSON.parse(record.json_value);
          }
        });
        // console.log("medadata added to areas");
      });
    });
  }

  function getStop(id) {
    return _stops['_' + id];
  }

  function getRoute(id) {
    return _routes['_' + id];
  }

  function getArea(id) {
    return _areas['_' + id];
  }

  function getService(id) {
    return _services['_' + id];
  }

  var model = {
    getStop: getStop,
    getRoute: getRoute,
    getArea: getArea
  };


  // function getStopRoutes() {
  //   Database.find([
  //     'SELECT route.short_name FROM stop_time',
  //     'JOIN trip ON stop_time.trip_id = trip.id',
  //     'JOIN route ON trip.route_id = route.id',
  //     'WHERE stop_time.id=?',
  //     'GROUP BY route.id'
  //     ].join(' '), [10328])
  //       .then(function (records) {
  //         console.log(records);
  //       });
  // }

  model.searchStops = function (filter) {
    var deferred = $q.defer();
    if (filter.block) {
      Database.find('select stop_id from stop_block' +
      ' where block_id=?;', [parseInt(filter.block)])
        .then(function (records) {
          var res = records.reduce(function (arr, el) {
            arr.push(model.getStop(el.stop_id));
            return arr;
          }, []);
          deferred.resolve(res);
        });
    } else {
      // todo
    }
    return deferred.promise;
  };

  model.getCommonTransferStops = function (trip1, trip2) {
    trip1 = trip1.id || trip1;
    trip2 = trip2.id || trip2;

    return Database.find('select' +
      ' st1.stop_id as stopid1, st2.stop_id as stopid2,' +
      ' st1.departure_time as dep1, st2.departure_time as dep2,' +
      ' st1.arrival_time as arr1, st2.arrival_time as arr2,' +
      ' t1.headsign as tripname1, t2.headsign as tripname2,' +
      ' t1.route_id as routeid1, t2.route_id as routeid2,' +
      ' t1.id as tripid1, t2.id as tripid2' +
      ' from transfer' +
      ' inner join stop on stop.id = transfer.from_stop_id ' +
      ' inner join stop_time st1 on st1.stop_id = stop.id ' +
      ' inner join stop_time st2 on st2.stop_id = stop.id ' +
      ' inner join trip t1 on t1.id = st1.trip_id ' +
      ' inner join trip t2 on t2.id = st2.trip_id ' +
      ' where st1.trip_id=? st2.trip_id=? and st1.arrival_time < st2.departure_time;',
      [trip1, trip2]).then(function (records) {
        //console.log(records);
        return records;
      });
  };

  model.getDepartureStopTimes = function (stops, minTime, maxTime, day) {
    day = day || new Date();
    var trips = {};
    var promises = [];
    stops.forEach(function (stop) {
      promises.push(Database.find('select ' +
      ' stop_time.stop_id as stop_id,' +
      ' stop_time.departure_time as departure_time,' +
      ' stop_time.arrival_time as arrival_time, ' +
      ' trip.id as tripid,' +
      ' trip.headsign as headsign,' +
      ' trip.service_id as service_id,' +
      ' trip.route_id as route_id' +
      ' from stop_time inner join trip on trip.id = stop_time.trip_id' +
      ' where stop_time.stop_id=?;', [stop.id]).then(function (records) {
        //console.log(records);
        return records.reduce(function (arr, el) {
          if (minTime.before(el.departure_time) &&
            maxTime.after(el.departure_time)) {
            var t = new Trip({
              id: el.tripid,
              headsign: el.headsign,
              route_id: el.route_id,
              service_id: el.service_id
            });
            if (!t.service || t.service.isRunning(day)) {
              arr.push(new StopTime(el, t));
            }
          }
          return arr;
        }, []);
      }).then(function (times) {
        // console.log('After time filters: ' + times.length);
        // find the closest future time and associated trip
        times.forEach(function (st) {
          var lastTrip = trips['_' + st.trip.id];
          if (lastTrip) {
            if (st.departure_time.before(lastTrip.departure_time)) {
              trips['_' + st.trip.id] = st;
            }
          } else {
            trips['_' + st.trip.id] = st;
          }
        });
      }));
    });

    var deferred = $q.defer();
    $q.all(promises).then(function () {
      var results = [];
      for (var i in trips) {
        results.push(trips[i]);
      }
      deferred.resolve(results);
    });

    return deferred.promise;
  };

  model.getArrivalStopTime = function (stops, trip, minTime) {
    var promises = [];
    var times = [];
    stops.forEach(function (stop) {
      //console.log(stop, trip, minTime);
      promises.push(Database.find('select ' +
      ' stop_time.stop_id as stop_id,' +
      ' stop_time.departure_time as departure_time,' +
      ' stop_time.arrival_time as arrival_time, ' +
      ' trip.id as tripid,' +
      ' trip.headsign as headsign,' +
      ' trip.route_id as route_id' +
      ' from stop_time' +
      ' inner join trip on trip.id = stop_time.trip_id' +
      ' where stop_time.stop_id=? and trip.id=?' +
      ' order by arrival_time;', [stop.id, trip.id])
        .then(function (records) {
          if (records && records.length) {
            //console.log(records);
            records.forEach(function (el) {
              //console.log(el, minTime);
              if (!minTime || minTime.before(el.arrival_time)) {
                times.push(new StopTime(el, trip));
              }
            });
          }
        }));
    });

    var deferred = $q.defer();
    $q.all(promises).then(function () {
      //console.log('times', times);
      deferred.resolve(times.length ? times[0] : null);
    });
    return deferred.promise;
  };

  function _getTransfers(from, toStopId, transferTime, day) {
    var promises = [];
    var transfers = [];
    var minTime = (new Time(from.arrival_time)).add(transferTime);
    var maxTime = (new Time(minTime)).add(30);  // max transfer wait time = 30 minutes
    promises.push(model.getDepartureStopTimes([{id: toStopId}], minTime, maxTime, day)
      .then(function (times) {
        // console.log('_getTransfers. found ' + times.length + ' departure stop times from ' + toStopId + ' after ' + minTime);
        times.forEach(function (st) {
          if (st.trip.id !== from.trip.id) {
            transfers.push(new Transfer(from, st, transferTime));
          } else {
            // console.log('ignoring transfer within same trip ' + from.trip.id);
          }
        });
      }));

    var deferred = $q.defer();
    $q.all(promises).then(function () {
      // console.log(transfers);
      deferred.resolve(transfers);
    });
    return deferred.promise;
  }

  model.getTransferStopTimes = function (st, day) {
    var deferred = $q.defer();
    Database.find('select' +
    ' transfer.from_stop_id as from_stop_id,' +
    ' transfer.to_stop_id as to_stop_id,' +
    ' stop_time.departure_time as departure_time,' +
    ' stop_time.arrival_time as arrival_time, ' +
    ' transfer.min_transfer_time as transfer_time ' +
    ' from stop_time ' +
    ' inner join trip on trip.id=stop_time.trip_id ' +
    ' inner join transfer on transfer.from_stop_id = stop_time.stop_id ' +
    ' where stop_time.trip_id=?;', [st.trip.id]).then(function (records) {
      var promises = [];
      var transfers = [];
      records.forEach(function (el) {
        if (st.departure_time.before(el.arrival_time)) {
          var transferFromStopTime = new StopTime({
            stop_id: el.from_stop_id,
            arrival_time: el.arrival_time,
            departure_time: el.departure_time
          }, st.trip);
          promises.push(_getTransfers(transferFromStopTime, el.to_stop_id, el.transfer_time, day).then(function (xfers) {
            transfers.push.apply(transfers, xfers);
          }));
        }
      });

      $q.all(promises).then(function () {
        deferred.resolve(transfers);
      });
    });
    return deferred.promise;
  };

  model.getAreas = function() {
    return _areas;
  };

  model.getAreaStops = function(block_id) {
    var deferred = $q.defer();

    Database.find('select distinct stop_id,' +
    ' from stop_block' +
    ' where block_id=?', [block_id]).then(
      function (results) {
        deferred.resolve(results.reduce(function (arr, el) {
          arr.push(model.getStop(el));
          return arr;
        }, []));
      });

    return deferred.promise;
  };

  // store the status of the init
  var modelInit = false;
  model.init = function() {

    // If init already has been initiated just return the promise
    if(modelInit) {
      return modelInit;
    }

    var deferred = $q.defer();
    Database.init().then(function() {
      // cache routes and stops (async so may not be complete before use)
      loadRoutes()
        .then(function () {
          return loadAreas();
        })
        .then(function () {
          return loadServices();
        })
        .then(function () {
          return loadStops();
        })
        .then(function () {
          GeoTree.init();
          deferred.resolve(true);
          console.log('TripPlanner initialized');
        });
    });

    modelInit = deferred.promise;
    return modelInit;
  };

  return model;
});
