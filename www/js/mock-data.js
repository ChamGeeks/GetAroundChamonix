
"use strict";

var mockApi = {
  areas_meta: [
    {lifts: ['Aiguille du Midi', 'Brevent'], areasOfInterest: ['Montenvers', 'Ski jump', 'Sports centre', 'Ice rink']},
    {areasOfInterest: ['Gorges de la Diosaz']},
    {lifts: ['Bellevue', 'Le Prarion'], areasOfInterest: ['Tramway du Mont Blanc', 'Climbing wall', 'Parc de Merlet']},
    {areasOfInterest: ['Ski jump', 'Glacier']},
    {lifts: ['Flegère'], areasOfInterest: ['Golf']},
    {lifts: ['Grands Montets']},
    {lifts: ['Balme']}
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
