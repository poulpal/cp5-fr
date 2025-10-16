const ALIASES = {
  'accounting-advanced':    ['accounting-advanced-1','accounting-advanced-qr'],
  'accounting-advanced-1':  ['accounting-advanced','accounting-advanced-qr'],
  'accounting-advanced-qr': ['accounting-advanced','accounting-advanced-1']
};

export function hasModule(activeSlugs, requiredSlug) {
  const all = new Set([requiredSlug, ...(ALIASES[requiredSlug] || [])]);
  return activeSlugs.some(s => all.has(s));
}
