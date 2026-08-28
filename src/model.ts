export type Point = { x: number; y: number };

export type Segment = {
  id: string;
  name: string;
  points: Point[];
  pixels: number;
  color: string;
  direction: 'forward' | 'reverse';
  injection: 'start' | 'both' | 'none';
  controllerId: string;
};

export type Controller = { id: string; name: string; point: Point };
export type Supply = { id: string; name: string; point: Point; volts: number; amps: number };

export type Layout = {
  name: string;
  voltage: 5 | 12;
  milliAmpsPerPixel: number;
  brightness: number;
  segments: Segment[];
  controllers: Controller[];
  supplies: Supply[];
  updatedAt: string;
};

export type Check = { level: 'pass' | 'warn'; title: string; detail: string; segmentId?: string };

export const emptyLayout = (): Layout => ({
  name: 'Untitled light plan',
  voltage: 5,
  milliAmpsPerPixel: 60,
  brightness: 50,
  segments: [],
  controllers: [{ id: 'ctrl-1', name: 'Controller 1', point: { x: 10, y: 50 } }],
  supplies: [],
  updatedAt: new Date().toISOString(),
});

export const sampleLayout = (): Layout => ({
  name: 'Garden arch — 480 pixels',
  voltage: 5,
  milliAmpsPerPixel: 60,
  brightness: 40,
  controllers: [{ id: 'ctrl-1', name: 'ESP32', point: { x: 8, y: 51 } }],
  supplies: [
    { id: 'psu-1', name: 'Supply A', point: { x: 22, y: 84 }, volts: 5, amps: 20 },
    { id: 'psu-2', name: 'Supply B', point: { x: 78, y: 84 }, volts: 5, amps: 20 },
  ],
  segments: [
    {
      id: 'seg-arch-left', name: 'Arch left', pixels: 180, color: '#168a67', direction: 'forward',
      injection: 'both', controllerId: 'ctrl-1',
      points: [{ x: 14, y: 52 }, { x: 23, y: 27 }, { x: 39, y: 13 }, { x: 50, y: 12 }],
    },
    {
      id: 'seg-arch-right', name: 'Arch right', pixels: 180, color: '#d45a49', direction: 'forward',
      injection: 'start', controllerId: 'ctrl-1',
      points: [{ x: 50, y: 12 }, { x: 63, y: 14 }, { x: 79, y: 29 }, { x: 87, y: 53 }],
    },
    {
      id: 'seg-ground', name: 'Ground run', pixels: 120, color: '#a66f00', direction: 'reverse',
      injection: 'none', controllerId: 'ctrl-1',
      points: [{ x: 86, y: 67 }, { x: 65, y: 72 }, { x: 39, y: 72 }, { x: 15, y: 66 }],
    },
  ],
  updatedAt: new Date().toISOString(),
});
