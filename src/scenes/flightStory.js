import { MathUtils } from 'three';

// orbit/lift are camera azimuth/elevation offsets (radians); sun 0 = midday, 1 = golden hour.
const frames = [
  { yaw: -1.05, pitch: 0, bank: 0, height: 0, distance: 0, ground: 1, clouds: 0, terminal: 0, orbit: 0, lift: 0, zoom: 1, sun: 0.55 },
  { yaw: -Math.PI / 2, pitch: 0, bank: 0, height: 0, distance: 12, ground: 1, clouds: 0, terminal: 0, orbit: 0, lift: 0, zoom: 1, sun: 0.45 },
  { yaw: -Math.PI / 2, pitch: 0, bank: 0, height: 0, distance: 24, ground: 1, clouds: 0, terminal: 0, orbit: -0.36, lift: -0.085, zoom: 1, sun: 0.3 },
  { yaw: -Math.PI / 2, pitch: -0.16, bank: 0, height: 1.5, distance: 48, ground: 1, clouds: 0.2, terminal: 0, orbit: 0.3, lift: -0.16, zoom: 1, sun: 0.15 },
  { yaw: -1.4, pitch: -0.12, bank: -0.13, height: 2.3, distance: 68, ground: 0, clouds: 1, terminal: 0, orbit: 0.2, lift: 0.22, zoom: 1.06, sun: 0 },
  { yaw: -Math.PI / 2, pitch: 0, bank: 0, height: 2, distance: 88, ground: 0, clouds: 1, terminal: 0, orbit: -0.18, lift: 0, zoom: 1.03, sun: 0.1 },
  { yaw: -Math.PI / 2, pitch: 0.045, bank: 0, height: 0.7, distance: 108, ground: 1, clouds: 0.25, terminal: 0, orbit: -0.3, lift: -0.06, zoom: 1, sun: 0.5 },
  { yaw: -Math.PI / 2, pitch: 0, bank: 0, height: 0, distance: 128, ground: 1, clouds: 0, terminal: 0, orbit: 0, lift: 0, zoom: 1, sun: 0.75 },
  { yaw: -Math.PI / 2, pitch: 0, bank: 0, height: 0, distance: 140, ground: 1, clouds: 0, terminal: 1, orbit: 0, lift: 0, zoom: 1, sun: 0.9 },
  { yaw: -Math.PI / 2, pitch: 0, bank: 0, height: 0, distance: 140, ground: 1, clouds: 0, terminal: 1, orbit: 0, lift: 0, zoom: 1, sun: 0.9 },
];

const keys = Object.keys(frames[0]);
// Monotone (Fritsch-Carlson) tangents keep curves smooth without overshooting, e.g. the runway stays at height 0.
const tangents = Object.fromEntries(keys.map(key => [key, frames.map((frame, index) => {
  if (index === 0 || index === frames.length - 1) return 0;
  const before = frame[key] - frames[index - 1][key];
  const after = frames[index + 1][key] - frame[key];
  return before * after <= 0 ? 0 : 2 * before * after / (before + after);
})]));

function hermite(start, end, startSlope, endSlope, t) {
  return start + (end - start) * t * t * (3 - 2 * t) + startSlope * t * (1 - t) * (1 - t) + endSlope * t * t * (t - 1);
}

export function sampleFlight(progress) {
  const clamped = MathUtils.clamp(progress, 0, frames.length - 1);
  const index = Math.min(Math.floor(clamped), frames.length - 2);
  const blend = clamped - index;
  const pose = Object.fromEntries(keys.map(key => [key, hermite(frames[index][key], frames[index + 1][key], tangents[key][index], tangents[key][index + 1], blend)]));
  if (index === 2) {
    const liftoff = MathUtils.clamp((clamped - 2.35) / 0.65, 0, 1);
    pose.height = liftoff > 0 ? hermite(0, frames[3].height, 0.25, tangents.height[3] * 0.65, liftoff) : 0;
    pose.pitch = frames[3].pitch * MathUtils.smoothstep(clamped, 2.2, 2.45);
  }
  if (index === 6) {
    const flare = MathUtils.clamp((clamped - 6) / 0.62, 0, 1);
    pose.height = flare < 1 ? hermite(frames[6].height, 0, tangents.height[6] * 0.62, -0.155, flare) : 0;
    pose.pitch += -0.065 * MathUtils.smoothstep(clamped, 6.3, 6.55) * (1 - MathUtils.smoothstep(clamped, 6.62, 6.85));
  }
  pose.gear = 1 - MathUtils.smoothstep(clamped, 2.65, 3.65) + MathUtils.smoothstep(clamped, 5.3, 6.2);
  const taxi = MathUtils.clamp(pose.distance / 12, 0, 1);
  pose.lateral = 4 * (1 - MathUtils.smoothstep(taxi, 0, 1));
  if (clamped < 1) pose.yaw = -Math.PI / 2 - Math.atan(2 * taxi * (1 - taxi));
  const arrival = MathUtils.clamp((pose.distance - 128) / 12, 0, 1);
  if (clamped >= 7) {
    pose.lateral = arrival === 0 ? 0 : -7 * MathUtils.smoothstep(arrival, 0, 1);
    pose.yaw = -Math.PI / 2 - Math.atan(3.5 * arrival * (1 - arrival));
  }
  pose.clouds = clamped >= 4 && clamped <= 5 ? 1 : 0;
  pose.cloudHeight = 3.5 - pose.height * 2.2;
  pose.deck = ((clamped < 4.5 ? 1.83 : 1.65) - pose.height) * 2.4;
  pose.city = clamped < 4 || clamped > 5 ? 1 : 0;
  pose.bridge = MathUtils.smoothstep(clamped, 8.05, 8.35);
  pose.disembark = MathUtils.smoothstep(clamped, 8.4, 8.9);
  return pose;
}

export function storyProgress(top, height, viewportHeight, from, to) {
  const travel = from === 7 ? (height - viewportHeight + 88) * 0.9 : height - viewportHeight * 0.35 + 88;
  const local = MathUtils.clamp((88 - top) / Math.max(1, travel), 0, 1);
  return MathUtils.lerp(from, to, local);
}

export function advanceFlight(previous, requested, delta = 1 / 30) {
  return MathUtils.damp(previous, MathUtils.clamp(requested, 0, 9), 9, Math.min(delta, 0.05));
}

export function flightFraming(stageTop, headingBottom, footerTop, viewportHeight, pinnedTop) {
  const top = Math.max(88, headingBottom - stageTop + pinnedTop + 24);
  const bottom = Math.min(viewportHeight - 20, footerTop - stageTop + pinnedTop - 20);
  return { center: (top + bottom) / (2 * viewportHeight), available: Math.max(0, bottom - top) / viewportHeight };
}