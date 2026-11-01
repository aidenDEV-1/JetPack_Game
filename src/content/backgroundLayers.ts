export interface BackgroundLayerDefinition {
  id: string;
  repeatWidth: number;
  scrollFactor: number;
  colors: [number, number];
}

export const backgroundLayerDefinitions: BackgroundLayerDefinition[] = [
  { id: 'far', repeatWidth: 1280, scrollFactor: 0.18, colors: [0x203a5b, 0x162946] },
  { id: 'mid', repeatWidth: 960, scrollFactor: 0.42, colors: [0x172d48, 0x0f2036] },
  { id: 'near', repeatWidth: 640, scrollFactor: 0.75, colors: [0x0e1b2c, 0x091321] },
];
