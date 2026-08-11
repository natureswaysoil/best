import { Fragment, ReactNode } from 'react';

const INLINE_MARKDOWN = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;

function safeHref(value: string): string | null {
  const href = value.trim();
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  try {
    const url = new URL(href);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function inlineMarkdown(value: string): ReactNode[] {
  return value.split(INLINE_MARKDOWN).filter(Boolean).map((token, index) => {
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = safeHref(link[2]);
      return href ? <a key={index} href={href} className="font-medium text-nature-green-700 underline hover:text-nature-green-800">{link[1]}</a> : <Fragment key={index}>{link[1]}</Fragment>;
    }
    if (token.startsWith('**') && token.endsWith('**')) return <strong key={index}>{token.slice(2, -2)}</strong>;
    if (token.startsWith('`') && token.endsWith('`')) return <code key={index}>{token.slice(1, -1)}</code>;
    return <Fragment key={index}>{token}</Fragment>;
  });
}

export default function BlogContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }
    if (line.startsWith('### ')) { blocks.push(<h3 key={index}>{inlineMarkdown(line.slice(4))}</h3>); index += 1; continue; }
    if (line.startsWith('## ')) { blocks.push(<h2 key={index}>{inlineMarkdown(line.slice(3))}</h2>); index += 1; continue; }
    if (line.startsWith('# ')) { blocks.push(<h2 key={index}>{inlineMarkdown(line.slice(2))}</h2>); index += 1; continue; }

    const unordered = /^[-*]\s+/.test(line);
    const ordered = /^\d+\.\s+/.test(line);
    if (unordered || ordered) {
      const items: ReactNode[] = [];
      const pattern = unordered ? /^[-*]\s+/ : /^\d+\.\s+/;
      while (index < lines.length && pattern.test(lines[index].trim())) {
        items.push(<li key={index}>{inlineMarkdown(lines[index].trim().replace(pattern, ''))}</li>);
        index += 1;
      }
      blocks.push(unordered ? <ul key={`list-${index}`}>{items}</ul> : <ol key={`list-${index}`}>{items}</ol>);
      continue;
    }

    blocks.push(<p key={index}>{inlineMarkdown(line)}</p>);
    index += 1;
  }

  return <div className="article-content">{blocks}</div>;
}
