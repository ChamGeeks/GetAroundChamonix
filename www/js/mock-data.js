
"use strict";

var mockApi = {
  areas: [
    { id:  2, name: "Servoz", numberOfStops: 9, 
      meta: { areasOfInterest: ['Gorges de la Diosaz'] }},
    { id:  4, name: "Vaudagne", numberOfStops: 2 },
    { id:  3, name: "Les Houches", numberOfStops: 9, 
      meta: { lifts: ['Bellevue', 'Le Prarion'], areasOfInterest: ['Tramway du Mont Blanc', 'Climbing wall', 'Parc de Merlet'] }},
    { id:  5, name: "Bossons/Pelerins", numberOfStops: 22,
      meta: { areasOfInterest: ['Ski jump', 'Glacier'] }},
    { id:  1, name: "Chamonix", numberOfStops: 29, 
      meta: { lifts: ['Aiguille du Midi', 'Brevent'], areasOfInterest: ['Montenvers', 'Ski jump', 'Sports centre', 'Ice rink'] }},
    { id:  6, name: "Les Praz", numberOfStops: 10, 
      meta: { lifts: ['Flegère'], areasOfInterest: ['Golf'] }},
    { id:  7, name: "Les Tines", numberOfStops: 5 },
    { id:  8, name: "Argentière", numberOfStops: 6, 
      meta: { lifts: ['Grands Montets'] }},
    { id:  9, name: "Le Tour/Vallorcine", numberOfStops: 2, 
      meta: { lifts: ['Balme'] }}
  ],
  searchResult: [
    [{
      line: {
        number: "1",
        direction: "Le Tour > Les houches",
      },
      departure: {
        stop: {
          id: 1,
          name: "Les Argentiere SNCF",
        },
        time: "09:38"
      },
      destination: {
        stop: {
          id: 2,
          name: "Auguille du Midi",
        },
        time: "09:58"
      }
    }],
    [{
      line: {
        number: "12",
        direction: "Le Tour > Chamonix Süd",
      },
      departure: {
        stop: {
          id: 1,
          name: "Les Argentiere SNCF",
        },
        time: "09:42"
      },
      destination: {
        stop: {
          id: 3,
          name: "Chaomix Center",
        },
        time: "10:03"
      }
    }],
    [{
      line: {
        number: "11",
        direction: "Gran Montets > Chamonix Süd",
      },
      departure: {
        stop: {
          id: 4,
          name: "Grand Montets",
        },
        time: "09:49"
      },
      destination: {
        stop: {
          id: 3,
          name: "Chaomix Center",
        },
        time: "10:05"
      }
    }]
  ]
};
