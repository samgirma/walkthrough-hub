import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { codeToHast } from "shiki";
import { generateSlug } from "@/lib/slug";
import { TOCItem } from "@/types";

/**
 * Extract Table of Contents items from Markdown content.
 */
export function extractTOC(contentMd: string): TOCItem[] {
  if (!contentMd) return [];

  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const toc: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(contentMd)) !== null) {
    const hashes = match[1];
    const rawTitle = match[2].trim();
    // Strip markdown formatting from title
    const cleanTitle = rawTitle
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1");

    const level = hashes.length;
    const id = generateSlug(cleanTitle);

    toc.push({
      id,
      title: cleanTitle,
      level,
    });
  }

  return toc;
}

/**
 * Remark AST plugin to parse custom CTF callouts (:::callout[type]) and flag spoilers (:::flag)
 */
function remarkCtfDirectives() {
  return (tree: any) => {
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (
        node.type === "paragraph" &&
        node.children &&
        node.children[0]?.type === "text"
      ) {
        const firstText = node.children[0].value;
        const calloutMatch = firstText.match(
          /^:::callout(?:\[([a-zA-Z0-9_-]+)\])?/
        );

        if (calloutMatch) {
          const type = (calloutMatch[1] || "info").toLowerCase();
          node.children[0].value = firstText.replace(
            /^:::callout(?:\[[a-zA-Z0-9_-]+\])?\s*/,
            ""
          );

          // Strip closing ::: from last text child
          const lastChild = node.children[node.children.length - 1];
          if (lastChild && lastChild.type === "text") {
            lastChild.value = lastChild.value.replace(/\s*:::$/, "");
          }

          tree.children[i] = {
            type: "element",
            data: {
              hName: "div",
              hProperties: {
                className: ["ctf-callout", `ctf-callout-${type}`],
              },
            },
            children: [
              {
                type: "element",
                data: {
                  hName: "div",
                  hProperties: { className: ["callout-header"] },
                },
                children: [
                  {
                    type: "text",
                    value: type.toUpperCase(),
                  },
                ],
              },
              {
                type: "paragraph",
                data: {
                  hName: "div",
                  hProperties: { className: ["callout-body"] },
                },
                children: node.children,
              },
            ],
          };
          continue;
        }

        const flagMatch = firstText.match(/^:::flag/);
        if (flagMatch) {
          node.children[0].value = firstText.replace(/^:::flag\s*/, "");
          const lastChild = node.children[node.children.length - 1];
          if (lastChild && lastChild.type === "text") {
            lastChild.value = lastChild.value.replace(/\s*:::$/, "");
          }

          tree.children[i] = {
            type: "element",
            data: {
              hName: "details",
              hProperties: { className: ["flag-spoiler-box"] },
            },
            children: [
              {
                type: "element",
                data: {
                  hName: "summary",
                  hProperties: { className: ["flag-summary"] },
                },
                children: [
                  {
                    type: "text",
                    value: "FLAG SOLUTION // SPOILER",
                  },
                ],
              },
              {
                type: "paragraph",
                data: {
                  hName: "div",
                  hProperties: { className: ["flag-content"] },
                },
                children: node.children,
              },
            ],
          };
        }
      }
    }
  };
}

/**
 * Rehype plugin to syntax-highlight code blocks with Shiki
 * and wrap them with file chrome and interactive copy button.
 */
function rehypeShikiPlugin() {
  return async (tree: any) => {
    const tasks: (() => Promise<void>)[] = [];

    visit(tree, "element", (node: any, index: any, parent: any) => {
      if (node.tagName === "pre") {
        const codeEl = node.children?.find(
          (c: any) => c.type === "element" && c.tagName === "code"
        );
        if (!codeEl) return;

        const textNode = codeEl.children?.find((c: any) => c.type === "text");
        const rawCode = textNode ? textNode.value : "";
        const classNames = codeEl.properties?.className || [];
        const langClass = Array.isArray(classNames)
          ? classNames.find((c: any) => String(c).startsWith("language-"))
          : "";
        const lang = langClass
          ? String(langClass).replace("language-", "").toLowerCase()
          : "text";

        tasks.push(async () => {
          let shikiHast;
          try {
            shikiHast = await codeToHast(rawCode.trimEnd(), {
              lang,
              theme: "github-dark",
            });
          } catch {
            shikiHast = await codeToHast(rawCode.trimEnd(), {
              lang: "text",
              theme: "github-dark",
            });
          }

          const preEl = shikiHast.children?.find(
            (c: any) => c.type === "element" && c.tagName === "pre"
          );

          const windowEl = {
            type: "element",
            tagName: "div",
            properties: { className: ["code-window", "card-cyber"] },
            children: [
              {
                type: "element",
                tagName: "div",
                properties: { className: ["code-header"] },
                children: [
                  {
                    type: "element",
                    tagName: "span",
                    properties: { className: ["lang-badge"] },
                    children: [{ type: "text", value: lang.toUpperCase() }],
                  },
                  {
                    type: "element",
                    tagName: "button",
                    properties: {
                      type: "button",
                      className: ["copy-code-button"],
                      dataCode: encodeURIComponent(rawCode),
                      title: "Copy code to clipboard",
                    },
                    children: [{ type: "text", value: "Copy" }],
                  },
                ],
              },
              {
                type: "element",
                tagName: "div",
                properties: { className: ["code-body"] },
                children: preEl ? [preEl] : [],
              },
            ],
          };

          parent.children[index] = windowEl;
        });
      }
    });

    for (const task of tasks) {
      await task();
    }
  };
}

/**
 * Strict sanitizer schema allowing only safe CTF elements & classes
 */
const customSanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: "",
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "details",
    "summary",
    "div",
    "span",
    "pre",
    "code",
    "button",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": [
      "className",
      "class",
      "id",
      "style",
      "dataCode",
      "aria*",
      "title",
    ],
    details: ["className", "class", "open"],
    summary: ["className", "class"],
    button: ["type", "className", "class", "dataCode", "title"],
    a: ["href", "title", "target", "rel", "className", "class"],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto", "#"],
  },
};

/**
 * Compile and sanitize Markdown to high-performance secure HTML.
 */
export async function renderMarkdown(contentMd: string): Promise<string> {
  if (!contentMd || typeof contentMd !== "string") {
    return "";
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCtfDirectives)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeShikiPlugin)
    .use(rehypeSanitize, customSanitizeSchema as any)
    .use(rehypeStringify)
    .process(contentMd);

  return String(file);
}
