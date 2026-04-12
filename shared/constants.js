// Shared constants between client and server
// Physics must be identical on both sides

export const PHYSICS = {
  gravity:           { x: 0, y: 0, z: -3.25 * 4 },
  defaultRestitution: 0.2,

  car: {
    mass:            40,
    // Body-local axes matching client Physics.js: X=depth(forward), Y=width(right), Z=up
    // chassisDepth=2.03 → half=1.015, chassisWidth=1.02 → half=0.51, chassisHeight=1.16 → half=0.58
    chassisHalfSize: { x: 1.015, y: 0.51, z: 0.58 },
    // Same chassis shape offset as client Physics.js
    chassisOffset:   { x: 0, y: 0, z: 0.41 },

    wheel: {
      radius:                          0.25,
      suspensionStiffness:             50,
      suspensionRestLength:            0.1,
      frictionSlip:                    10,
      dampingRelaxation:               1.8,
      dampingCompression:              1.5,
      maxSuspensionForce:              100000,
      rollInfluence:                   0.01,
      maxSuspensionTravel:             0.3,
      customSlidingRotationalSpeed:    -30,
    },

    // Body-local positions matching client Physics.js convention:
    //   X = wheelFrontOffsetDepth / wheelBackOffsetDepth (forward axis)
    //   Y = ±wheelOffsetWidth (right axis)
    // [frontLeft, frontRight, backLeft, backRight] — same order as client
    wheelPositions: [
      { x:  0.635, y:  0.39, z: 0 },  // frontLeft
      { x:  0.635, y: -0.39, z: 0 },  // frontRight
      { x: -0.475, y:  0.39, z: 0 },  // backLeft
      { x: -0.475, y: -0.39, z: 0 },  // backRight
    ],

    controls: {
      maxForce:      800,
      boostForce:    1600,
      maxBrake:      50,
      maxSteer:      0.3,
    },
  },
}

export const NETWORK = {
  tickRate:              20,    // Hz — server broadcast frequency
  physicsRate:           60,    // Hz — physics step frequency
  maxPlayers:            20,
  interpolationDelay:    100,   // ms — client renders this far behind server
  snapshotBufferTime:    3000,  // ms — how long to keep old snapshots
  pingInterval:          2000,  // ms
}

// Input bitmask
export const INPUT = {
  UP:    1,
  DOWN:  2,
  LEFT:  4,
  RIGHT: 8,
  BRAKE: 16,
  BOOST: 32,
}

// Race grid — 2-wide staggered positions on the start straight (facing +X)
export const SPAWN_GRID = [
  { x: 10,  y: -33 },  { x: 10,  y: -37 },
  { x:  5,  y: -33 },  { x:  5,  y: -37 },
  { x:  0,  y: -33 },  { x:  0,  y: -37 },
  { x: -5,  y: -33 },  { x: -5,  y: -37 },
  { x: -10, y: -33 },  { x: -10, y: -37 },
  { x: -15, y: -33 },  { x: -15, y: -37 },
  { x: -20, y: -33 },  { x: -20, y: -37 },
  { x: -25, y: -33 },  { x: -25, y: -37 },
  { x: -30, y: -33 },  { x: -30, y: -37 },
  { x: -35, y: -33 },  { x: -35, y: -37 },
]

export const CAR_COLORS = [
  '#e74c3c', // red
  '#3498db', // blue
  '#2ecc71', // green
  '#f39c12', // orange
  '#9b59b6', // purple
  '#1abc9c', // teal
  '#e91e63', // pink
  '#ffffff',  // white
]
