import { LayerType } from '../../../lib/harmony/hexagonal-layers-corrected';

// 5 outer layers (1 center + 5 rings = 6 total, matching hexagon's 6 sides)
export const LAYER_ORDER: LayerType[] = [
  'diatonic',
  'extensions',
  'borrowed',
  'substitutions',
  'circle-fifths',
];

const LAYER_LABELS: Record<LayerType, string> = {
  'diatonic': 'Diatonic',
  'extensions': 'Extensions',
  'borrowed': 'Borrowed',
  'substitutions': 'Substitutions',
  'circle-fifths': 'Circle of 5ths',
  'chromatic': 'Chromatic',
  'root': 'Root',
};

export function getLayerLabel(layer: LayerType): string {
  return LAYER_LABELS[layer] || layer;
}

// Calculate opacity and scale for each layer - all visible, focused one emphasized
export function getLayerStyle(layer: LayerType, focusedLayer: LayerType) {
  if (layer === focusedLayer) {
    // Focused layer: fully visible, interactive
    return { opacity: 1, scale: 1, showLabels: true, interactive: true };
  } else {
    // Other layers: visible but dimmed, still show labels for context
    return { opacity: 0.3, scale: 1, showLabels: true, interactive: false };
  }
}
