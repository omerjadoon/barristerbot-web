const piiPatterns = [
  { tag: "EMAIL", regex: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
  { tag: "PHONE", regex: /(?:\+\d{1,3}[\s-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s-]?\d{3,4}[\s-]?\d{3,4}/g },
  { tag: "CNIC", regex: /\b\d{5}-\d{7}-\d\b/g },
  { tag: "SSN", regex: /\b\d{3}-\d{2}-\d{4}\b/g },
];

export function maskPII(text) {
  const piiMap = {};
  let sanitized = String(text);

  piiPatterns.forEach(({ tag, regex }) => {
    sanitized = sanitized.replace(regex, (match) => {
      const key = `[PII_${tag}_${Object.keys(piiMap).length + 1}]`;
      piiMap[key] = match;
      return key;
    });
  });

  return { sanitized, piiMap };
}

export function restorePII(text, piiMap) {
  if (!piiMap || !Object.keys(piiMap).length) {
    return text;
  }

  return Object.entries(piiMap).reduce((result, [key, value]) => {
    return result.split(key).join(value);
  }, text);
}

export function sanitizeUserQuery(query) {
  return String(query || "").trim();
}
