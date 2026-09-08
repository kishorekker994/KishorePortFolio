import { geoEquirectangular, geoPath } from 'd3-geo';

export const mapProjection = geoEquirectangular().scale(1000 / (2 * Math.PI)).translate([500, 250]);
export const mapPath = geoPath(mapProjection);
export const destinations = [
  { code: 'MAA', name: 'Chennai', coordinates: [80.1693, 12.9941] },
  { code: 'LHR', name: 'London', coordinates: [-0.4543, 51.4700] },
  { code: 'DXB', name: 'Dubai', coordinates: [55.3644, 25.2532] },
  { code: 'SIN', name: 'Singapore', coordinates: [103.9915, 1.3644] },
  { code: 'JFK', name: 'New York', coordinates: [-73.7781, 40.6413] },
].map(airport => {
  const [horizontal, vertical] = mapProjection(airport.coordinates);
  return { ...airport, x: horizontal / 10, y: vertical / 5 };
});

export function airportRoute(destination) {
  return mapPath({ type: 'LineString', coordinates: [destinations[0].coordinates, destination.coordinates] });
}