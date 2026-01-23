/**
 * This file overrides the filesystem-internal.js module in pyret-lang.
 * It only makes sense to use this library when an embedding context is
 * providing appropriate RPC calls.
 */
({
    provides: {
        values: {},
        types: {}
    },
    requires: [],
    nativeRequires: [],
    theModule: function(runtime, _, _) {
        let initializedOK = true;
        if(!window.MESSAGES) {
            initializedOK = false;
            console.error("No MESSAGES object found. filesystem-internal on the web requires an embedding context to provide RPC calls.");
        }
        function wrap(f) {
            if(initializedOK) {
                return f; 
            }
            else {
                return async function() {
                    throw runtime.ffi.makeMessageException(`filesystem-internal: Cannot call ${f.name} because filesystem-internal on the web requires an embedding context to provide RPC calls`)
                }
            }
        }
        async function readFile(p) {
            return window.MESSAGES.sendRpc('fs', 'readFile', [p]);
        }
        async function writeFile(p, data) {
            return window.MESSAGES.sendRpc('fs', 'writeFile', [p, data]);
        }
        async function stat(p) {
            return window.MESSAGES.sendRpc('fs', 'stat', [p]);
        }
        async function exists(p) {
            try {
                const _ = await stat(p);
                return true;
            }
            catch(e) {
                if(String(e).includes("EntryNotFound")) {
                    return false;
                }
                console.error(e);
                throw e;
            }
        }
        async function resolve(...paths) {
            return window.MESSAGES.sendRpc('path', 'resolve', paths);
        }
        async function join(...paths) {
            return window.MESSAGES.sendRpc('path', 'join', paths);
        }
        async function dirname(path) {
            return window.MESSAGES.sendRpc('path', 'dirname', [path]);
        }
        async function basename(path) {
            return window.MESSAGES.sendRpc('path', 'basename', [path]);
        }
        async function extname(path) {
            return window.MESSAGES.sendRpc('path', 'extname', [path]);
        }
        async function relative(from, to) {
            return window.MESSAGES.sendRpc('path', 'relative', [from, to]);
        }
        async function isAbsolute(path) {
            return window.MESSAGES.sendRpc('path', 'isAbsolute', [path]);
        }
        async function createDir(path) {
            return window.MESSAGES.sendRpc('fs', 'createDir', [path]);
        }
        return runtime.makeJSModuleReturn({
            readFile: wrap(readFile),
            writeFile: wrap(writeFile),
            stat: wrap(stat),
            resolve: wrap(resolve),
            exists: wrap(exists),
            join: wrap(join),
            dirname: wrap(dirname),
            basename: wrap(basename),
            extname: wrap(extname),
            relative: wrap(relative),
            isAbsolute: wrap(isAbsolute),
            createDir: wrap(createDir),
            init: initializedOK
        });
    }
})
