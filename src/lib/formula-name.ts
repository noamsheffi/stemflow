export function splitFormulaName(name: string) {
  const match = name.match(/^(.*?)\s+\(([^()]*)\)\s*$/);
  if (!match || !/[A-Za-z]/.test(match[2])) return { hebrew: name.trim(), english: "" };

  return {
    hebrew: match[1].trim(),
    english: match[2].trim().replace(/\s*-\s*ma$/i, "").trim(),
  };
}
