export const normalizeUploadFilename = (filename: string): string => {
  const looksLatin1Encoded = [...filename].some((character) => character.charCodeAt(0) >= 128)
    && [...filename].every((character) => character.charCodeAt(0) <= 255);
  if (!looksLatin1Encoded) return filename;
  const decoded = Buffer.from(filename, 'latin1').toString('utf8');
  return decoded.includes('\uFFFD') ? filename : decoded;
};
