
"use strict";

var mockApi = {
  areas: [
    { id:  2, name: "Servoz" },
    { id:  4, name: "Vaudagne" },
    { id:  3, name: "Les Houches" },
    { id:  5, name: "Bossons/Pelerins" },
    { id:  1, name: "Chamonix" },
    { id:  6, name: "Les Praz" },
    { id:  7, name: "Les Tines" },
    { id:  8, name: "Argentière" },
    { id:  9, name: "Le Tour" }
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
