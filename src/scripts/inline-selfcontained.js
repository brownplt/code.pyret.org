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
 *
 * FAIL LOUDLY. Every mistake this script could make would otherwise surface
 * only at webview runtime, and only on the hosts this template exists for. So
 * anything unexpected is a build error, not a fallback: a referenced asset
 * that's missing, a js/css reference the patterns below fail to inline, an
 * asset whose content the HTML parser could misread as markup (the script-data
 * restrictions in the HTML spec, "Restrictions for contents of script
 * elements"), an asset containing a sentinel or a template-variable tag (see
 * checkInlinable), or a sentinel that doesn't survive to the output.
 */
const fs = require("fs");
const path = require("path");

const BASE = "__PYRET_WEBVIEW_BASE_URL__";
const HASH = "__PYRET_WEBVIEW_HASH__";
const URL_FILE_MODE = "__PYRET_WEBVIEW_URL_FILE_MODE__";
const SENTINEL_PREFIX = "__PYRET_WEBVIEW_";

// The complete render dictionary for the self-contained template:
// runtime-dynamic values -> literal sentinels; the self-contained constants
// are baked; every other (server-only) var renders to "" as usual. Hoisted so
// checkInlinable below can guard against exactly these keys.
const TEMPLATE_VARS = {
  BASE_URL: BASE,
  PYRET: BASE + "/js/cpo-main.jarr.gz.js",
  PYRET_GZIPPED: "true",
  HASH_OPTIONS: HASH,
  URL_FILE_MODE: URL_FILE_MODE,
  IMAGE_PROXY_BYPASS: "true",
};

/*
 * Inlined content must be inert under every substitution pass that processes
 * the assembled string: the extension's split/join fills any __PYRET_WEBVIEW_*
 * sentinel at webview startup, and the template render substitutes {{...}}
 * tags naming TEMPLATE_VARS' keys. These same asset files are ALSO served
 * un-inlined (plain <script src>/<link>) by the normal server, where no
 * substitution ever touches them -- so substitutable-looking content in an
 * asset would silently mean different things in different deployments.
 * Statically reject it at build time instead.
 */
function checkInlinable(rel, content) {
  if (content.includes(SENTINEL_PREFIX)) {
    throw new Error(
      "inline-selfcontained: " + rel + " contains the sentinel prefix `" +
      SENTINEL_PREFIX + "`, which the vscode extension's placeholder fill " +
      "would rewrite inside the inlined copy at webview startup (and would " +
      "be left alone when the same file is served un-inlined by the server)."
    );
  }
  const keyTag = new RegExp(
    "\\{\\{\\{? ?&? ?(" + Object.keys(TEMPLATE_VARS).join("|") + ") ?\\}?\\}\\}");
  const m = content.match(keyTag);
  if (m) {
    throw new Error(
      "inline-selfcontained: " + rel + " contains `" + m[0] + "`, a tag " +
      "naming one of this build's template variables. It is NOT substituted " +
      "today (assets are inlined after the template render), but it would be " +
      "if the passes were ever reordered, and it reads as if it were -- keep " +
      "template-variable tags out of asset files."
    );
  }
}

/*
 * Inlined content must not contain anything the HTML parser would read as
 * markup while in the script-data / style-data states:
 *
 *  - `</script` (any case, in any position) ends the script element, even
 *    mid-string. Escaping it as `<\/script` is the standard fix and is
 *    meaning-preserving anywhere legal JS can contain the sequence (string,
 *    template, comment, regex -- `\/` is `/` in all of them). Note tools get
 *    this wrong by requiring a trailing `>`: `</script foo>` also closes the
 *    element, so we match the bare prefix.
 *  - `<!--` flips the parser into the "script data escaped" states, where a
 *    following bare `<script` changes how `</script>` is matched. An automatic
 *    escape could change the meaning of (legal, Annex-B) `<!--`-comment lines,
 *    and no asset we inline contains the sequence today -- so its appearance
 *    is a hard error demanding a human look, not a transform.
 */
function escapeForScript(rel, s) {
  if (/<!--/.test(s)) {
    throw new Error(
      "inline-selfcontained: " + rel + " contains `<!--`, which changes how " +
      "the HTML parser matches </script> once inlined (script-data escaped " +
      "states). Decide how to escape it for this asset; see the comment above " +
      "escapeForScript."
    );
  }
  return s.replace(/<\/(script)/gi, "<\\/$1");
}
function escapeForStyle(rel, s) { return s.replace(/<\/(style)/gi, "<\\/$1"); }

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

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

/*
 * The whole transform, on strings: mustache-render the clean template, then
 * inline every BASE-sentinel js/css reference via readAsset(rel), then check
 * the result. Separated from main() so it can be unit-tested.
 */
function buildSelfContained(template, readAsset, Mustache) {
  // 1. Render our template vars on the CLEAN template (mustache sees only its
  //    intended input). Runtime-dynamic values -> literal sentinels; the
  //    self-contained constants are baked; every other (server-only) var renders
  //    to "" as usual. The {{^PYRET_GZIPPED}} preload section drops out here.
  let html = Mustache.render(template, TEMPLATE_VARS);

  // 2. Inline the shell scripts (their src now starts with the BASE sentinel).
  //    Function replacers -- the library code is full of `$`, which a string
  //    replacement would treat as `$&`/`$1`/`$'`. checkInlinable runs on the
  //    raw bytes, before any of our own rewrites introduce sentinels.
  html = html.replace(
    new RegExp('<script\\b[^>]*\\bsrc="' + BASE + '/js/([^"]+)"[^>]*>\\s*</script>', "gi"),
    (tag, rel) => {
      const code = readAsset("js/" + rel);
      checkInlinable("js/" + rel, code);
      return "<script>\n" + escapeForScript("js/" + rel, code) + "\n</script>";
    }
  );

  // 3. Inline the stylesheets (absolutizing their url()s to the BASE sentinel).
  html = html.replace(
    new RegExp('<link\\b[^>]*\\bhref="' + BASE + '/css/([^"]+)"[^>]*>', "gi"),
    (tag, rel) => {
      const css = readAsset("css/" + rel);
      checkInlinable("css/" + rel, css);
      const dirUrl = (BASE + "/css/" + rel).replace(/\/[^/]*$/, "");
      return "<style>\n" + escapeForStyle("css/" + rel, absolutizeCssUrls(css, dirUrl)) + "\n</style>";
    }
  );

  // 4. No MIME-blocked load may still point at the sentinel base. nosniff only
  //    refuses script/style destinations, so the window.PYRET url (fetched, not
  //    a script load) and img/icon references survive intentionally; the check
  //    is: no <script src> at BASE at all, and no <link> at a BASE .css.
  //    Catches template drift the inline patterns above would silently skip
  //    (single-quoted attrs, a new asset directory, ...).
  const leftoverScripts = html.match(
    new RegExp("<script\\b[^>]*\\bsrc\\s*=\\s*['\"]?" + BASE + "[^>]*>", "gi"));
  const leftoverStyles = html.match(
    new RegExp("<link\\b[^>]*\\bhref\\s*=\\s*['\"]?" + BASE + "[^'\"]*\\.css[^>]*>", "gi"));
  if (leftoverScripts || leftoverStyles) {
    throw new Error(
      "inline-selfcontained: reference(s) to the webview base survived inlining " +
      "(the tag didn't match the inline patterns -- quoting? new directory?):\n  " +
      [...(leftoverScripts || []), ...(leftoverStyles || [])].join("\n  ")
    );
  }

  // 5. The extension fills exactly these sentinels (split/join); if the
  //    template stops using one, or uses one twice where once is assumed, that
  //    contract broke -- here, not in the webview.
  const hashCount = countOccurrences(html, HASH);
  const modeCount = countOccurrences(html, URL_FILE_MODE);
  if (hashCount !== 1 || modeCount !== 1 || countOccurrences(html, BASE) < 1) {
    throw new Error(
      "inline-selfcontained: sentinel contract broke: expected HASH x1 (got " +
      hashCount + "), URL_FILE_MODE x1 (got " + modeCount + "), BASE >= 1"
    );
  }

  return html;
}

function main() {
  const [editorPath, assetRoot, outPath] = process.argv.slice(2);
  if (!editorPath || !assetRoot || !outPath) {
    console.error("usage: node inline-selfcontained.js <editor.html> <asset-root> <out.html>");
    process.exit(2);
  }
  const readAsset = (rel) => {
    const p = path.join(assetRoot, rel);
    try {
      return fs.readFileSync(p, "utf8");
    } catch (e) {
      throw new Error(
        "inline-selfcontained: editor.html references an asset that is not in " +
        "the build: " + p + " (a self-contained template with a dead reference " +
        "would only fail later, inside the webview, on Open VSX-backed hosts)"
      );
    }
  };
  const html = buildSelfContained(
    fs.readFileSync(editorPath, "utf8"), readAsset, require("mustache"));
  fs.writeFileSync(outPath, html);
  console.log("wrote self-contained editor template: " + outPath);
}

module.exports = { escapeForScript, escapeForStyle, absolutizeCssUrls, checkInlinable, buildSelfContained, BASE, HASH, URL_FILE_MODE };

if (require.main === module) main();
