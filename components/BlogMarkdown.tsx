import Link from 'next/link';
import type { ReactNode } from 'react';

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\[[^\]]+\]\((?:https?:\/\/[^\s)]+|\/[^\s)]*)\)|\*\*[^*]+\*\*)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const index = match.index;
    if (index > cursor) nodes.push(text.slice(cursor, index));
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={index}>{token.slice(2, -2)}</strong>);
    } else {
      const parts = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (parts) {
        const [, label, href] = parts;
        nodes.push(href.startsWith('/')
          ? <Link key={index} href={href} className="font-semibold text-nature-green-700 underline hover:text-nature-green-900">{label}</Link>
          : <a key={index} href={href} className="font-semibold text-nature-green-700 underline hover:text-nature-green-900" rel="noopener noreferrer">{label}</a>);
      }
    }
    cursor = index + token.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export default function BlogMarkdown({ content }: { content: string }) {
  return (
    <div className="article-content">
      {content.split('\n').map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-3" />;
        if (line.startsWith('# ')) return <h1 key={index} className="mb-6 mt-8 text-3xl font-bold text-gray-900">{inline(line.slice(2))}</h1>;
        if (line.startsWith('## ')) return <h2 key={index} className="mb-4 mt-8 text-2xl font-bold text-gray-900">{inline(line.slice(3))}</h2>;
        if (line.startsWith('### ')) return <h3 key={index} className="mb-3 mt-6 text-xl font-semibold text-gray-900">{inline(line.slice(4))}</h3>;
        if (/^\d+\.\s/.test(trimmed)) return <div key={index} className="mb-2 ml-5 text-gray-700">{inline(trimmed)}</div>;
        if (trimmed.startsWith('- ')) return <div key={index} className="mb-2 ml-5 text-gray-700">• {inline(trimmed.slice(2))}</div>;
        return <p key={index} className="mb-4 leading-relaxed text-gray-700">{inline(trimmed)}</p>;
      })}
    </div>
  );
}
