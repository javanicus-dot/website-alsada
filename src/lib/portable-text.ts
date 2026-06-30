/**
 * Portable Text → HTML converter untuk Alsada.
 *
 * Portable Text adalah format rich text dari Sanity (mirip JSON tree).
 * Fungsi ini mengubahnya jadi HTML string yang bisa di-render di Astro.
 *
 * Block types yang didukung:
 * - normal → <p>
 * - h2 → <h2>
 * - h3 → <h3>
 * - blockquote → <blockquote>
 * - bullet/number → <ul>/<ol>
 *
 * Marks yang didukung:
 * - strong → <strong>
 * - em → <em>
 * - code → <code>
 * - link → <a>
 *
 * Inline image → <img> (kalau ada)
 */

interface PortableTextBlock {
  _type: string;
  _key?: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: PortableTextSpan[];
  markDefs?: any[];
  asset?: any;
  alt?: string;
  caption?: string;
}

interface PortableTextSpan {
  // Sengaja `string` (bukan literal "span") agar kompatibel dengan tipe dari src/lib/sanity.ts.
  _type: string;
  _key?: string;
  text: string;
  marks?: string[];
}

function renderSpan(span: PortableTextSpan, markDefs: any[] = []): string {
  let html = escapeHtml(span.text);
  const marks = span.marks || [];

  for (const mark of marks) {
    // Mark definitions (annotations) like links
    const def = markDefs.find((d: any) => d._key === mark);
    if (def && def._type === "link") {
      const target = def.blank ? ' target="_blank" rel="noopener noreferrer"' : "";
      html = `<a href="${escapeHtml(safeUrl(def.href))}"${target}>${html}</a>`;
      continue;
    }

    // Standard marks
    if (mark === "strong") html = `<strong>${html}</strong>`;
    else if (mark === "em") html = `<em>${html}</em>`;
    else if (mark === "code") html = `<code>${html}</code>`;
  }

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (/^(\/|#|\.\/|\.\.\/)/.test(trimmed)) return trimmed;
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return "";
}

function renderBlock(block: PortableTextBlock, markDefs: any[] = []): string {
  // Inline image block
  if (block._type === "image") {
    const url = block.asset?.url || block.asset?._ref || "";
    const alt = block.alt || block.caption || "";
    const caption = block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : "";
    const safeSrc = safeUrl(url);
    if (!safeSrc) return "";
    return `<figure><img src="${escapeHtml(safeSrc)}" alt="${escapeHtml(alt)}" loading="lazy" />${caption}</figure>`;
  }

  // Text block
  if (!block.children || block.children.length === 0) return "";

  const innerHtml = block.children
    .map((child) => renderSpan(child as PortableTextSpan, block.markDefs || markDefs))
    .join("");

  switch (block.style) {
    case "h2":
      return `<h2>${innerHtml}</h2>`;
    case "h3":
      return `<h3>${innerHtml}</h3>`;
    case "blockquote":
      return `<blockquote>${innerHtml}</blockquote>`;
    default:
      return `<p>${innerHtml}</p>`;
  }
}

function renderList(items: PortableTextBlock[], listType: string, markDefs: any[] = []): string {
  const tag = listType === "number" ? "ol" : "ul";
  const innerHtml = items
    .map((item) => {
      const li = (item.children || [])
        .map((child) => renderSpan(child as PortableTextSpan, item.markDefs || markDefs))
        .join("");
      return `<li>${li}</li>`;
    })
    .join("");
  return `<${tag}>${innerHtml}</${tag}>`;
}

/**
 * Convert Portable Text array to HTML string.
 */
export function portableTextToHtml(blocks: PortableTextBlock[] | null | undefined): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  // Group consecutive list items into single <ul>/<ol>
  const out: string[] = [];
  let buffer: PortableTextBlock[] = [];
  let bufferType: string | null = null;

  const flush = () => {
    if (buffer.length > 0 && bufferType) {
      out.push(renderList(buffer, bufferType));
    }
    buffer = [];
    bufferType = null;
  };

  for (const block of blocks) {
    if (block._type === "block" && (block.style === "normal" || !block.style) && block.listItem) {
      // List item
      if (bufferType && bufferType !== block.listItem) {
        flush();
      }
      bufferType = block.listItem;
      buffer.push(block);
    } else {
      flush();
      out.push(renderBlock(block));
    }
  }
  flush();

  return out.join("\n");
}
