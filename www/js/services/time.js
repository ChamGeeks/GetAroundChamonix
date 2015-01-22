/**
 * time conversion service
 */

'use strict';

angular.module('chamBus').factory('Time', function() {

  /**
   * service to convert between integer minute counts from 00:00
   * and formatted times e.g. '08:39'.
   */

  function pad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
  }

  function Time(minutes) {
    if (minutes instanceof Time) {
      this.t = minutes.t;
    } else if (typeof minutes === 'number') {
      this.t = minutes;
    } else if (typeof minutes === 'string') {
      this.s = minutes;
      var a = minutes.split(":");
      if (a.length != 2) {
        console.error("invalid time format", minutes);
      }
      this.t = parseInt(a[0].replace(/^0/, "")) * 60 + parseInt(a[1].replace(/^0/, ""));
    } else {
      // assume date or moment
      this.s = moment(minutes).format("HH:mm");
      var a = this.s.split(":");
      this.t = parseInt(a[0].replace(/^0/, "")) * 60 + parseInt(a[1].replace(/^0/, ""))
    }
  }

  Time.prototype.add = function (minutes) {
    if (this.t - minutes > 0) {
      this.t += minutes;
      if (minutes != 0) {
        this.s = null;
      }
    }
    return this;
  };

  Time.prototype.toString = function () {
    if (!this.s) {
      var hours = Math.floor(this.t / 60);
      this.s = pad(hours, 2) + ":" + pad(this.t - hours * 60, 2);
    }
    return this.s;
  };

  Time.prototype.toInt = function () {
    return this.t;
  };

  Time.prototype.before = function (otherTime) {
    if (!(otherTime instanceof Time)) {
      otherTime = new Time(otherTime);
    }
    return this.t <= otherTime.toInt();
  };

  Time.prototype.after = function (otherTime) {
    if (!(otherTime instanceof Time)) {
      otherTime = new Time(otherTime);
    }
    return this.t > otherTime.toInt();
  };

  Time.create = function (arg) {
    return (arg instanceof Time) ? arg : new Time(arg);
  };

  return Time;

});

