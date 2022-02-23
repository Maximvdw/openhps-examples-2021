import {
    Corridor,
    Building,
    Room,
    Floor,
    Zone
} from '@openhps/geospatial';
import {
    GeographicalPosition,
    Absolute2DPosition
} from '@openhps/core';

/* Unused currently */

const building = new Building("Pleinlaan 9")
    .setBounds({
        topLeft: new GeographicalPosition(
            50.8203726927966, 4.392241309019189
        ),
        width: 46.275,
        height: 37.27,
        rotation: -34.04
    });
const floor = new Floor("3")
    .setBuilding(building)
    .setBounds([
        new Absolute2DPosition(0, 0),
        new Absolute2DPosition(0, 13.73),
        new Absolute2DPosition(10.102, 13.73),
        new Absolute2DPosition(10.102, 23.54),
        new Absolute2DPosition(0, 23.54),
        new Absolute2DPosition(0, 37.27),
        new Absolute2DPosition(44.33, 37.27),
        new Absolute2DPosition(44.33, 23.54),
        new Absolute2DPosition(28.06, 23.54),
        new Absolute2DPosition(28.06, 13.73),
        new Absolute2DPosition(44.33, 13.73),
        new Absolute2DPosition(44.33, 0),
    ])
    .setFloorNumber(3);
const office1 = new Room("3.60")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(0.57, 31.25),
        new Absolute2DPosition(4.75, 37.02),
    ]);
const office2 = new Room("3.58")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(4.75, 31.25),
        new Absolute2DPosition(8.35, 37.02),
    ]);
const office3 = new Room("3.56")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(8.35, 31.25),
        new Absolute2DPosition(13.15, 37.02),
    ]);
const office4 = new Room("3.32")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(29.97, 31.25),
        new Absolute2DPosition(34.77, 37.02),
    ]);
const lab = new Room("3.54")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(13.15, 31.25),
        new Absolute2DPosition(25.15, 37.02),
    ]);
const classroom = new Room("3.62")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(27.55, 24.105),
        new Absolute2DPosition(35.95, 29.5),
    ]);
const hallway = new Corridor("Corridor")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(2.39, 6.015),
        new Absolute2DPosition(2.39, 7.715),
        new Absolute2DPosition(18.015, 7.715),
        new Absolute2DPosition(18.015, 29.555),
        new Absolute2DPosition(2.39, 29.555),
        new Absolute2DPosition(2.39, 31.255),
        new Absolute2DPosition(41.94, 31.255),
        new Absolute2DPosition(41.94, 29.555),
        new Absolute2DPosition(20.315, 29.555),
        new Absolute2DPosition(20.315, 7.715),
        new Absolute2DPosition(41.94, 7.715),
        new Absolute2DPosition(41.94, 6.015),
    ]);
const lobby = new Zone("Lobby - WISE Lab")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(20.315, 20.155),
        new Absolute2DPosition(25.765, 27.27)
    ])
const lobby2 = new Zone("Lobby - AI Lab")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(18.015, 0.57),
        new Absolute2DPosition(20.315, 6.015)
    ])
const toilet1 = new Zone("Toilets - WISE Lab")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(15.48, 10.51),
        new Absolute2DPosition(18.015, 12.71),
    ])
const toilet2 = new Zone("Toilets - AI Lab")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(15.48, 24.56),
        new Absolute2DPosition(18.015, 26.76),
    ])
const elevators = new Corridor("Elevators")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(10.73, 17.22),
        new Absolute2DPosition(18.02, 20.06),
    ])
const stairs = new Corridor("Staircase")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(20.315, 17.22),
        new Absolute2DPosition(27.56, 20.06),
    ])
console.log(JSON.stringify({
    type: "FeatureCollection",
    features: [floor, lobby, lobby2, hallway, 
        classroom, office1, office2, elevators, stairs,
        office3, office4,  lab, toilet1, toilet2].map(space => space.toGeoJSON())
}, undefined, 4))

export { 
    lobby, lobby2, hallway, 
    classroom, office1, office2, 
    office3, office4,  lab , building, floor
};