import { MathUtils } from 'three';

const frames = [
  { yaw: -1.05, pitch: 0, bank: 0, height: 0, distance: 0, ground: 1, clouds: 0, terminal: 0 },
  { yaw: -Math.PI / 2, pitch: 0, bank: 0, height: 0, distance: 12, ground: 1, clouds: 0, terminal: 0 },
  { yaw: -Math.PI / 2, pitch: 0, bank: 0, height: 0, distance: 24, ground: 1, clouds: 0, terminal: 0 },
  { yaw: -Math.PI / 2, pitch: -0.16, bank: 0, height: 1.5, distance: 48, ground: 1, clouds: 0.2, terminal: 0 },
  { yaw: -1.4, pitch: -0.12, bank: -0.035, height: 2.3, distance: 68, ground: 0, clouds: 1, terminal: 0 },
  { yaw: -Math.PI / 2, pitch: 0, bank: 0, height: 2, distance: 88, ground: 0, clouds: 1, terminal: 0 },
  { yaw: -Math.PI / 2, pitch: 0.045, bank: 0, height: 0.7, distance: 108, ground: 1, clouds: 0.25, terminal: 0 },
  { yaw: -Math.PI / 2, pitch: 0, bank: 0, height: 0, distance: 128, ground: 1, clouds: 0, terminal: 0 },
  { yaw: -Math.PI / 2, pitch: 0, bank: 0, height: 0, distance: 140, ground: 1, clouds: 0, terminal: 1 },
  { yaw: -Math.PI / 2, pitch: 0, bank: 0, height: 0, distance: 140, ground: 1, clouds: 0, terminal: 1 },
];

export function sampleFlight(progress) {
  const clamped = MathUtils.clamp(progress, 0, frames.length - 1);
  const index = Math.min(Math.floor(clamped), frames.length - 2);
  const blend = clamped - index;
  const pose = Object.fromEntries(Object.keys(frames[0]).map(key => [key, MathUtils.lerp(frames[index][key], frames[index + 1][key], blend)]));
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