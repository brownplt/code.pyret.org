/*
 * inline-selfcontained.js
 *
 * Emits a self-contained variant of editor.html for hosts that serve the
 * editor's assets WITHOUT an executable MIME type or Content-Encoding -- most
 * importantly a VS Code webview whose resources resolve to Open VSX / the GitLab
 * Web IDE, where every file comes back as text/plain + nosniff (so <script src>
 * and <link rel=stylesheet> are refused execution) and files over ~15MB 503
 * (so the uncompressed cpo-main.jarr.js never loads). See pyret-parley issue #21.
 *
 * The injected webview HTML string is never fetched, so anything inlined into it
 * always runs. This script inlines the shell scripts (jquery, editor-misc,
 * beforePyret, events, ...) and stylesheets in place. The runtime bundle is NOT
 * inlined (it's 37MB): beforePyret loads it via window.PYRET, which the template
 * points at cpo-main.jarr.gz.js + window.PYRET_GZIPPED=true, so beforePyret
 * fetches + inflates it in-page (DecompressionStream) -- see beforePyret.js.
 *
 * ORDER MATTERS. We render OUR mustache vars FIRST, on the clean template,
 * before any JS is inlined -- because minified shell JS is full of `{{`/`}}`
 * (object braces) that mustache would greedily eat if it ran afterward. The
 * three values that are only known at the extension's runtime (the webview base
 * URL, the theme/layout hash, the url-file-mode config) are rendered as LITERAL
 * sentinels; the extension fills them with a plain string replace (not a
 * template engine), which can't misfire on the inlined JS's braces. The
 * sentinels below MUST match vscode/src/pyretCPOWebEditor.ts.
 */
const fs = require("fs");
const path = require("path");
const Mustache = require("mustache");

const BASE = "__PYRET_WEBVIEW_BASE_URL__";
const HASH = "__PYRET_WEBVIEW_HASH__";
const URL_FILE_MODE = "__PYRET_WEBVIEW_URL_FILE_MODE__";

// Inlined JS/CSS is executed, so the standard `</script`->`<\/script` (and the
// `</style` analogue) escape is safe.
function escapeForScript(s) { return s.replace(/<\/(script)/gi, "<\\/$1"); }
function escapeForStyle(s) { return s.replace(/<\/(style)/gi, "<\\/$1"); }

// A stylesheet inlined into a <style> in the top-level document would resolve
// its relative url(...)s against the page instead of against .../css/. Rewrite
// them to the stylesheet's own directory (still a BASE sentinel) so fonts/images
// still load once the extension fills in the base URL.
function absolutizeCssUrls(css, cssDirUrl) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (m, q, ref) => {
    const r = ref.trim();
    if (/^(data:|https?:|\/|#)/i.test(r)) return m;
    return "url(" + q + cssDirUrl + "/" + r + q + ")";
  });
}

function main() {
  const [editorPath, assetRoot, outPath] = process.argv.slice(2);
  if (!editorPath || !assetRoot || !outPath) {
    console.error("usage: node inline-selfcontained.js <editor.html> <asset-root> <out.html>");
    process.exit(2);
  }
  const readAsset = (rel) => fs.readFileSync(path.join(assetRoot, rel), "utf8");

  // 1. Render our template vars on the CLEAN template (mustache sees only its
  //    intended input). Runtime-dynamic values -> literal sentinels; the
  //    self-contained constants are baked; every other (server-only) var renders
  //    to "" as usual. The {{^PYRET_GZIPPED}} preload section drops out here.
  let html = Mustache.render(fs.readFileSync(editorPath, "utf8"), {
    BASE_URL: BASE,
    PYRET: BASE + "/js/cpo-main.jarr.gz.js",
    PYRET_GZIPPED: "true",
    HASH_OPTIONS: HASH,
    URL_FILE_MODE: URL_FILE_MODE,
    IMAGE_PROXY_BYPASS: "true",
  });

  // 2. Inline the shell scripts (their src now starts with the BASE sentinel).
  //    Function replacers -- the library code is full of `$`, which a string
  //    replacement would treat as `$&`/`$1`/`$'`.
  html = html.replace(
    new RegExp('<script\\b[^>]*\\bsrc="' + BASE + '/js/([^"]+)"[^>]*>\\s*</script>', "gi"),
    (tag, rel) => {
      let code;
      try { code = readAsset("js/" + rel); } catch (e) { return tag; }
      return "<script>\n" + escapeForScript(code) + "\n</script>";
    }
  );

  // 3. Inline the stylesheets (absolutizing their url()s to the BASE sentinel).
  html = html.replace(
    new RegExp('<link\\b[^>]*\\bhref="' + BASE + '/css/([^"]+)"[^>]*>', "gi"),
    (tag, rel) => {
      let css;
      try { css = readAsset("css/" + rel); } catch (e) { return tag; }
      const dirUrl = (BASE + "/css/" + rel).replace(/\/[^/]*$/, "");
      return "<style>\n" + escapeForStyle(absolutizeCssUrls(css, dirUrl)) + "\n</style>";
    }
  );

  fs.writeFileSync(outPath, html);
  console.log("wrote self-contained editor template: " + outPath);
}

main();
