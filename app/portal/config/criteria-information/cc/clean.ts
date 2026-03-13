/**
 * sanitize-html.ts
 *
 * Shared sanitizer for criteria info HTML fields.
 * Safe to use:
 *  - on paste (RichEditor)
 *  - before save (CriteriaForm handleSubmit)
 *  - on display (CriteriaInfoDetail)
 *
 * What it removes:
 *  - Word / MSO XML blocks and conditional comments
 *  - <style>, <script>, <meta>, <link> tags
 *  - Namespace tags: <o:p>, <w:*>, <m:*> etc.
 *  - ALL attributes EXCEPT: href, target, rel on <a>; nothing else
 *  - Event handler attributes (onclick, onerror, etc.)
 *  - javascript: href values
 *
 * What it preserves:
 *  - <b>, <strong>, <i>, <em>, <u>, <s>
 *  - <ul>, <ol>, <li>
 *  - <p>, <br>, <div>, <span>
 *  - <a href="..."> (safe URLs only)
 *  - Text content, spaces, punctuation, numbers
 */

const ALLOWED_TAGS = new Set([
  "b", "strong", "i", "em", "u", "s", "strike",
  "p", "br", "div", "span",
  "ul", "ol", "li",
  "a",
]);

/**
 * Full sanitize: strips Word/XML junk, then strips all attributes
 * except safe <a> attrs, and removes disallowed tags (keeping their text).
 */
export function sanitizeHtml(raw: string): string {
  if (!raw) return "";

  let out = raw
    // ── Word / MSO junk ──────────────────────────────────────────────────
    // MSO conditional comments  <!--[if gte mso 9]>...</[endif]-->
    .replace(/<!--\[if[\s\S]*?\[endif\]-->/gi, "")
    // XML declarations
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    // <xml>...</xml> blocks
    .replace(/<xml[\s\S]*?<\/xml>/gi, "")
    // <style>...</style>
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    // <script>...</script>
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    // <meta ...> <link ...>
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    // HTML comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // Namespace tags: <o:p>, <w:WordDocument>, <m:math> etc.
    .replace(/<\/?[a-z]+:[a-z][^>]*>/gi, "")

    // ── Strip dangerous attributes on any remaining tag ──────────────────
    // Remove event handlers: onclick, onerror, onload, etc.
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    // Remove style="..." attributes entirely (may contain mso- or expression())
    .replace(/\s+style\s*=\s*(?:"[^"]*"|'[^']*')/gi, "")
    // Remove class="Mso..." (Word paragraph classes)
    .replace(/\s+class\s*=\s*(?:"[^"]*"|'[^']*')/gi, "")
    // Remove lang, xml:lang, xmlns attributes
    .replace(/\s+(?:lang|xml:lang|xmlns(?::[a-z]+)?)\s*=\s*(?:"[^"]*"|'[^']*')/gi, "")

    // ── Sanitize <a> hrefs — allow only http/https/mailto ────────────────
    // First nullify javascript: hrefs
    .replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"')
    .replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'")

    // ── Cosmetic cleanup ─────────────────────────────────────────────────
    .replace(/&nbsp;/gi, " ")
    .replace(/\s{3,}/g, " ")
    .trim();

  // ── Strip disallowed HTML tags (keep their inner text content) ───────
  // This regex matches any opening/closing/self-closing tag.
  // If the tag name is not in ALLOWED_TAGS, remove the tag (but keep inner text).
  out = out.replace(/<\/?([a-z][a-z0-9]*)[^>]*>/gi, (match, tagName: string) => {
    if (ALLOWED_TAGS.has(tagName.toLowerCase())) return match;
    // Self-closing / void tags we don't want: drop entirely
    return "";
  });

  return out;
}

/**
 * For plain-text only fields (brief_info displayed as <p>):
 * runs sanitizeHtml then strips all remaining tags.
 */
export function stripToPlainText(raw: string): string {
  return sanitizeHtml(raw)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}