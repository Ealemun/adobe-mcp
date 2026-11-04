// Enregistre tous les tools Premiere Pro (ppro_*). Chaque module couvre un domaine ; common.js porte les schémas partagés.
import { makeContext } from './common.js';
import { registerReadTools } from './read.js';
import { registerEditTools } from './edit.js';
import { registerProjectTools } from './project.js';
import { registerMarkerTools } from './markers.js';
import { registerSafetyTools } from './safety.js';
import { registerRenderTools } from './render.js';
import { registerEffectTools } from './effects.js';
import { registerDynamicLinkTools } from './dynamiclink.js';

export function registerPproTools(server, bridge, config) {
  const ctx = makeContext(server, bridge, config);
  registerReadTools(ctx);
  registerEditTools(ctx);
  registerProjectTools(ctx);
  registerMarkerTools(ctx);
  registerSafetyTools(ctx);
  registerRenderTools(ctx);
  registerEffectTools(ctx);
  registerDynamicLinkTools(ctx);
}
