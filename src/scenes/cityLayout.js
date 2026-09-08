export const CITY_COLUMNS = 18;
export const CITY_ROWS = 10;
export const CITY_SETBACK = 48;

export const cityRoads = Array.from({ length: CITY_ROWS + 1 }, (_, index) => 4 - index * 8);
export const cityAvenues = Array.from({ length: CITY_COLUMNS / 2 + 1 }, (_, index) => (index - 4.5) * 16.8);

export const cityBuildings = Array.from({ length: CITY_COLUMNS * CITY_ROWS }, (_, index) => {
  const kind = ['house', 'apartment', 'shop', 'office', 'warehouse'][index % 5];
  const floors = { house: 2, apartment: 4 + index % 2, shop: 1, office: 3, warehouse: 1 }[kind];
  return {
    kind,
    floors,
    height: kind === 'warehouse' ? 1.15 : floors * 0.55,
    width: { house: 2.1, apartment: 2.6, shop: 3.3, office: 2.8, warehouse: 3.8 }[kind],
    depth: { house: 2.4, apartment: 2.8, shop: 2.3, office: 3, warehouse: 3.5 }[kind],
    x: (index % CITY_COLUMNS - 8.5) * 8.4 + Math.sin(index * 7.3) * 0.5,
    z: -Math.floor(index / CITY_COLUMNS) * 8,
    color: ['#d3d4ca', '#b9c5ba', '#c5b6a5', '#c1c7ce', '#d5c4b5'][Math.floor(index / 5) % 5],
  };
});

export const cityVehicles = Array.from({ length: 60 }, (_, index) => ({
  kind: ['car', 'car', 'van', 'bus', 'car', 'truck'][index % 6],
  parked: index % 5 === 0,
  direction: index % 2 === 0 ? 1 : -1,
  road: cityRoads[Math.floor(index / 6)],
  start: (index * 19.3) % 144 - 72,
  color: ['#d2d7d5', '#c65e49', '#4e758a', '#e0b858', '#566863', '#a8b8bd'][index % 6],
}));

export function vehiclePose(vehicle, seconds) {
  const distance = vehicle.parked ? 0 : seconds * (vehicle.kind === 'bus' ? 0.65 : 0.9) * vehicle.direction;
  return {
    x: ((vehicle.start + distance + 72) % 144 + 144) % 144 - 72,
    z: vehicle.road + (vehicle.parked ? 0.82 : vehicle.direction * 0.31),
  };
}