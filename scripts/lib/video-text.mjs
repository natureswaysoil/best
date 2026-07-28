export function wrapVideoText(text, max = 26, maxLines = 4) {
  const normalized = String(text || '')
    .replace(/%/g, ' percent')
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/[\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = normalized.split(' ').filter(Boolean);
  const lines = [];
  let current = '';

  const push = (line) => {
    if (line && lines.length < maxLines) lines.push(line);
  };
  const splitLongWord = (word) => {
    const chunks = [];
    let remaining = word;
    while (remaining.length > max) {
      const window = remaining.slice(0, max);
      const slash = window.lastIndexOf('/');
      const hyphen = window.lastIndexOf('-');
      const delimiter = Math.max(slash, hyphen);
      const cut = delimiter >= Math.ceil(max * 0.55) ? delimiter + 1 : max;
      chunks.push(remaining.slice(0, cut));
      remaining = remaining.slice(cut);
    }
    if (remaining) chunks.push(remaining);
    return chunks;
  };

  for (const word of words) {
    for (const chunk of splitLongWord(word)) {
      const next = current ? `${current} ${chunk}` : chunk;
      if (next.length > max && current) {
        push(current);
        current = chunk;
      } else {
        current = next;
      }
      if (lines.length >= maxLines) break;
    }
    if (lines.length >= maxLines) break;
  }
  if (lines.length < maxLines) push(current);
  return lines.join('\n');
}
