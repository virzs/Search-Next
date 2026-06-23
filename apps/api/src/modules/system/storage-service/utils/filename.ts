export type ParsedUploadFilename = {
  normalized: string;
  safeName: string;
  baseName: string;
  ext: string;
};

function normalizeMojibakeFilename(input: string) {
  if (!input) return input;
  const decoded = Buffer.from(input, 'latin1').toString('utf8');
  if (!decoded || decoded.includes('�')) return input;
  const hasCjk = /[\u4e00-\u9fff]/.test(input);
  const decodedHasCjk = /[\u4e00-\u9fff]/.test(decoded);
  if (decodedHasCjk && !hasCjk) return decoded;
  const bad = /[ÃÂåæçéðï]/g;
  const badInput = (input.match(bad) || []).length;
  const badDecoded = (decoded.match(bad) || []).length;
  if (badDecoded < badInput) return decoded;
  return input;
}

export function parseUploadFilename(
  originalname: string,
): ParsedUploadFilename {
  const normalized = normalizeMojibakeFilename(originalname);
  const safeName = normalized.replace(/[\\/]/g, '_');
  const dotIdx = safeName.lastIndexOf('.');
  const baseName = dotIdx > 0 ? safeName.slice(0, dotIdx) : safeName;
  const ext = dotIdx > 0 ? safeName.slice(dotIdx + 1) : '';
  return { normalized, safeName, baseName, ext };
}
