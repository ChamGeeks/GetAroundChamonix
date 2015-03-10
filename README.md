# Get Around Chamonix!

This project is the result of our first hackathon in Chamonix!  We wanted to build an app that was genuinely useful to the people who live and work in Chamonix, and we felt that a full bus and train timetable would be a good way to do this.

We've open sourced the project to get contributions on all aspects.  Here are the technical details first, though:

### Structure

The app is built in [angular.js](https://angularjs.org/) with the [Ionic framework](http://ionicframework.com/) for native-like UI elements and easy local testing on top of [ng-cordova](http://ngcordova.com/) and Cordova / PhoneGap

### Data

We've gone for storing the data using [Web Database](http://dev.w3.org/html5/webdatabase/) and [html5sql.js](http://html5sql.com/).  We know that it is a deprecated standard, but the PhoneGap v3.5.0 page [shows compatibility](http://docs.phonegap.com/en/3.5.0/cordova_storage_storage.md.html#Storage), which is fine with us for the time being.  We wanted to use something that we were familiar enough with, i.e. SQL, to make progress quickly.  We've structured the data in [the Google GTFS transit format](https://developers.google.com/transit/gtfs/reference) so that we had an existing and tested structure for storing all of the bus lines, times, stops, etc.

### Server interaction

The app retrieves the data from our server initially.  This means that we can update the bus timetable as and when it changes, or if we have any errors in the data that we've collected.

## Getting going 

You'll need npm, then install Cordova and Ionic, and set up emulation ([as per the Ionic getting started guide](http://ionicframework.com/getting-started/)).

    npm install -g cordova ionic
    ionic platform add ios
    ionic build ios

(or)

    ionic platform add android
    ionic build android

 Then you can kick off an iOS emulation:  `ionic emulate ios`

 Or just fire it up in the browser: `ionic serve`


## License

GetAroundChamonix is licensed under GPL-2. See [LICENSE](https://github.com/ChamGeeks/GetAroundChamonix/blob/master/LICENSE) for more details.
