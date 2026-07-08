export function normalizeClassName(className) {
  if (!className) return "";
  
  // 1. Remove "kelas" or "class" prefix with any optional dash/space
  let cleaned = className.trim().replace(/^(kelas|class)\s*[-:\s]*/i, "");
  
  // 2. Convert to uppercase
  cleaned = cleaned.toUpperCase();
  
  // 3. Match numeric format: e.g. "10A", "10 A", "10-A", "12 IPS" -> "10-A", "12-IPS"
  const numericMatch = cleaned.match(/^(\d+)\s*[-:\s]?\s*([A-Z](?:\s*.*)?)$/);
  if (numericMatch) {
    return `${numericMatch[1]}-${numericMatch[2].trim()}`;
  }
  
  // 4. Match Roman numeral format: e.g. "X A", "XI-IPA 1" -> "X-A", "XI-IPA 1"
  const romanMatch = cleaned.match(/^(I[VX]|V?I{0,3})\s*[-:\s]?\s*([A-Z](?:\s*.*)?)$/);
  if (romanMatch && romanMatch[1]) {
    return `${romanMatch[1]}-${romanMatch[2].trim()}`;
  }
  
  return cleaned;
}
