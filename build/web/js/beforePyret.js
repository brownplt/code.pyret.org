/******/ (function(modules) { // webpackBootstrap
/******/ 	var parentHotUpdateCallback = this["webpackHotUpdate"];
/******/ 	this["webpackHotUpdate"] = 
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var head = document.getElementsByTagName("head")[0];
/******/ 		var script = document.createElement("script");
/******/ 		script.type = "text/javascript";
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 		head.appendChild(script);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest(callback) { // eslint-disable-line no-unused-vars
/******/ 		if(typeof XMLHttpRequest === "undefined")
/******/ 			return callback(new Error("No browser support"));
/******/ 		try {
/******/ 			var request = new XMLHttpRequest();
/******/ 			var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 			request.open("GET", requestPath, true);
/******/ 			request.timeout = 10000;
/******/ 			request.send(null);
/******/ 		} catch(err) {
/******/ 			return callback(err);
/******/ 		}
/******/ 		request.onreadystatechange = function() {
/******/ 			if(request.readyState !== 4) return;
/******/ 			if(request.status === 0) {
/******/ 				// timeout
/******/ 				callback(new Error("Manifest request to " + requestPath + " timed out."));
/******/ 			} else if(request.status === 404) {
/******/ 				// no update available
/******/ 				callback();
/******/ 			} else if(request.status !== 200 && request.status !== 304) {
/******/ 				// other failure
/******/ 				callback(new Error("Manifest request to " + requestPath + " failed."));
/******/ 			} else {
/******/ 				// success
/******/ 				try {
/******/ 					var update = JSON.parse(request.responseText);
/******/ 				} catch(e) {
/******/ 					callback(e);
/******/ 					return;
/******/ 				}
/******/ 				callback(null, update);
/******/ 			}
/******/ 		};
/******/ 	}
/******/
/******/ 	
/******/ 	
/******/ 	// Copied from https://github.com/facebook/react/blob/bef45b0/src/shared/utils/canDefineProperty.js
/******/ 	var canDefineProperty = false;
/******/ 	try {
/******/ 		Object.defineProperty({}, "x", {
/******/ 			get: function() {}
/******/ 		});
/******/ 		canDefineProperty = true;
/******/ 	} catch(x) {
/******/ 		// IE will fail on defineProperty
/******/ 	}
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "bf5ca9702b6411e0fc31"; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					if(me.children.indexOf(request) < 0)
/******/ 						me.children.push(request);
/******/ 				} else hotCurrentParents = [moduleId];
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name)) {
/******/ 				if(canDefineProperty) {
/******/ 					Object.defineProperty(fn, name, (function(name) {
/******/ 						return {
/******/ 							configurable: true,
/******/ 							enumerable: true,
/******/ 							get: function() {
/******/ 								return __webpack_require__[name];
/******/ 							},
/******/ 							set: function(value) {
/******/ 								__webpack_require__[name] = value;
/******/ 							}
/******/ 						};
/******/ 					}(name)));
/******/ 				} else {
/******/ 					fn[name] = __webpack_require__[name];
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		function ensure(chunkId, callback) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			__webpack_require__.e(chunkId, function() {
/******/ 				try {
/******/ 					callback.call(null, fn);
/******/ 				} finally {
/******/ 					finishChunkLoading();
/******/ 				}
/******/ 	
/******/ 				function finishChunkLoading() {
/******/ 					hotChunksLoading--;
/******/ 					if(hotStatus === "prepare") {
/******/ 						if(!hotWaitingFilesMap[chunkId]) {
/******/ 							hotEnsureUpdateChunk(chunkId);
/******/ 						}
/******/ 						if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 							hotUpdateDownloaded();
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		}
/******/ 		if(canDefineProperty) {
/******/ 			Object.defineProperty(fn, "e", {
/******/ 				enumerable: true,
/******/ 				value: ensure
/******/ 			});
/******/ 		} else {
/******/ 			fn.e = ensure;
/******/ 		}
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback;
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback;
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "number")
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 				else
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailibleFilesMap = {};
/******/ 	var hotCallback;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply, callback) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		if(typeof apply === "function") {
/******/ 			hotApplyOnUpdate = false;
/******/ 			callback = apply;
/******/ 		} else {
/******/ 			hotApplyOnUpdate = apply;
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		}
/******/ 		hotSetStatus("check");
/******/ 		hotDownloadManifest(function(err, update) {
/******/ 			if(err) return callback(err);
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				callback(null, null);
/******/ 				return;
/******/ 			}
/******/ 	
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotAvailibleFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			for(var i = 0; i < update.c.length; i++)
/******/ 				hotAvailibleFilesMap[update.c[i]] = true;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			hotCallback = callback;
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 0;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailibleFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailibleFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var callback = hotCallback;
/******/ 		hotCallback = null;
/******/ 		if(!callback) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			hotApply(hotApplyOnUpdate, callback);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			callback(null, outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options, callback) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		if(typeof options === "function") {
/******/ 			callback = options;
/******/ 			options = {};
/******/ 		} else if(options && typeof options === "object") {
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		} else {
/******/ 			options = {};
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function getAffectedStuff(module) {
/******/ 			var outdatedModules = [module];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice();
/******/ 			while(queue.length > 0) {
/******/ 				var moduleId = queue.pop();
/******/ 				var module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return new Error("Aborted because of self decline: " + moduleId);
/******/ 				}
/******/ 				if(moduleId === 0) {
/******/ 					return;
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return new Error("Aborted because of declined dependency: " + moduleId + " in " + parentId);
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push(parentId);
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return [outdatedModules, outdatedDependencies];
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				var moduleId = toModuleId(id);
/******/ 				var result = getAffectedStuff(moduleId);
/******/ 				if(!result) {
/******/ 					if(options.ignoreUnaccepted)
/******/ 						continue;
/******/ 					hotSetStatus("abort");
/******/ 					return callback(new Error("Aborted because " + moduleId + " is not accepted"));
/******/ 				}
/******/ 				if(result instanceof Error) {
/******/ 					hotSetStatus("abort");
/******/ 					return callback(result);
/******/ 				}
/******/ 				appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 				addAllToSet(outdatedModules, result[0]);
/******/ 				for(var moduleId in result[1]) {
/******/ 					if(Object.prototype.hasOwnProperty.call(result[1], moduleId)) {
/******/ 						if(!outdatedDependencies[moduleId])
/******/ 							outdatedDependencies[moduleId] = [];
/******/ 						addAllToSet(outdatedDependencies[moduleId], result[1][moduleId]);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(var i = 0; i < outdatedModules.length; i++) {
/******/ 			var moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			var moduleId = queue.pop();
/******/ 			var module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(var j = 0; j < disposeHandlers.length; j++) {
/******/ 				var cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(var j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				var idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				for(var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 					var dependency = moduleOutdatedDependencies[j];
/******/ 					var idx = module.children.indexOf(dependency);
/******/ 					if(idx >= 0) module.children.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(var moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				var callbacks = [];
/******/ 				for(var i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 					var dependency = moduleOutdatedDependencies[i];
/******/ 					var cb = module.hot._acceptedDependencies[dependency];
/******/ 					if(callbacks.indexOf(cb) >= 0) continue;
/******/ 					callbacks.push(cb);
/******/ 				}
/******/ 				for(var i = 0; i < callbacks.length; i++) {
/******/ 					var cb = callbacks[i];
/******/ 					try {
/******/ 						cb(outdatedDependencies);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(var i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			var moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else if(!error)
/******/ 					error = err;
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return callback(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		callback(null, outdatedModules);
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: hotCurrentParents,
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://localhost:5001/";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {"use strict";
	
	/* global $ jQuery CPO CodeMirror storageAPI Q createProgramCollectionAPI makeShareAPI */
	
	//var shareAPI = makeShareAPI(process.env.CURRENT_PYRET_RELEASE);
	var shareAPI = makeShareAPI(env_CURRENT_PYRET_RELEASE);
	
	var url = __webpack_require__(2);
	
	var LOG = true;
	window.ct_log = function () /* varargs */{
	  if (window.console && LOG) {
	    console.log.apply(console, arguments);
	  }
	};
	
	window.ct_error = function () /* varargs */{
	  if (window.console && LOG) {
	    console.error.apply(console, arguments);
	  }
	};
	var initialParams = url.parse(document.location.href);
	var params = url.parse("/?" + initialParams["hash"]);
	window.highlightMode = "mcmh"; // what is this for?
	window.clearFlash = function () {
	  $(".notificationArea").empty();
	};
	window.stickError = function (message, more) {
	  clearFlash();
	  var err = $("<div>").addClass("error").text(message);
	  if (more) {
	    err.attr("title", more);
	  }
	  err.tooltip();
	  $(".notificationArea").prepend(err);
	};
	window.flashError = function (message) {
	  clearFlash();
	  var err = $("<div>").addClass("error").text(message);
	  $(".notificationArea").prepend(err);
	  err.fadeOut(7000);
	};
	window.flashMessage = function (message) {
	  clearFlash();
	  var msg = $("<div>").addClass("active").text(message);
	  $(".notificationArea").prepend(msg);
	  msg.fadeOut(7000);
	};
	window.stickMessage = function (message) {
	  clearFlash();
	  var err = $("<div>").addClass("active").text(message);
	  $(".notificationArea").prepend(err);
	};
	window.mkWarningUpper = function () {
	  return $("<div class='warning-upper'>");
	};
	window.mkWarningLower = function () {
	  return $("<div class='warning-lower'>");
	};
	
	$(window).bind("beforeunload", function () {
	  return "Because this page can load slowly, and you may have outstanding changes, we ask that you confirm before leaving the editor in case closing was an accident.";
	});
	
	var Documents = function () {
	
	  function Documents() {
	    this.documents = new Map();
	  }
	
	  Documents.prototype.has = function (name) {
	    return this.documents.has(name);
	  };
	
	  Documents.prototype.get = function (name) {
	    return this.documents.get(name);
	  };
	
	  Documents.prototype.set = function (name, doc) {
	    if (logger.isDetailed) logger.log("doc.set", { name: name, value: doc.getValue() });
	    return this.documents.set(name, doc);
	  };
	
	  Documents.prototype.delete = function (name) {
	    if (logger.isDetailed) logger.log("doc.del", { name: name });
	    return this.documents.delete(name);
	  };
	
	  Documents.prototype.forEach = function (f) {
	    return this.documents.forEach(f);
	  };
	
	  return Documents;
	}();
	
	window.CPO = {
	  save: function save() {},
	  autoSave: function autoSave() {},
	  documents: new Documents()
	};
	$(function () {
	  function merge(obj, extension) {
	    var newobj = {};
	    Object.keys(obj).forEach(function (k) {
	      newobj[k] = obj[k];
	    });
	    Object.keys(extension).forEach(function (k) {
	      newobj[k] = extension[k];
	    });
	    return newobj;
	  }
	  var animationDiv = null;
	  function closeAnimationIfOpen() {
	    if (animationDiv) {
	      animationDiv.empty();
	      animationDiv.dialog("destroy");
	      animationDiv = null;
	    }
	  }
	  CPO.makeEditor = function (container, options) {
	    var initial = "";
	    if (options.hasOwnProperty("initial")) {
	      initial = options.initial;
	    }
	
	    var textarea = jQuery("<textarea>");
	    textarea.val(initial);
	    container.append(textarea);
	
	    var runFun = function runFun(code, replOptions) {
	      options.run(code, { cm: CM }, replOptions);
	    };
	
	    var useLineNumbers = !options.simpleEditor;
	    var useFolding = !options.simpleEditor;
	
	    var gutters = !options.simpleEditor ? ["CodeMirror-linenumbers", "CodeMirror-foldgutter"] : [];
	
	    function reindentAllLines(cm) {
	      var last = cm.lineCount();
	      cm.operation(function () {
	        for (var i = 0; i < last; ++i) {
	          cm.indentLine(i);
	        }
	      });
	    }
	
	    var cmOptions = {
	      extraKeys: {
	        "Shift-Enter": function ShiftEnter(cm) {
	          runFun(cm.getValue());
	        },
	        "Shift-Ctrl-Enter": function ShiftCtrlEnter(cm) {
	          runFun(cm.getValue());
	        },
	        "Tab": "indentAuto",
	        "Ctrl-I": reindentAllLines
	      },
	      indentUnit: 2,
	      tabSize: 2,
	      viewportMargin: Infinity,
	      lineNumbers: useLineNumbers,
	      matchKeywords: true,
	      matchBrackets: true,
	      styleSelectedText: true,
	      foldGutter: useFolding,
	      gutters: gutters,
	      lineWrapping: true,
	      logging: true
	    };
	
	    cmOptions = merge(cmOptions, options.cmOptions || {});
	
	    var CM = CodeMirror.fromTextArea(textarea[0], cmOptions);
	
	    var CMblocks;
	
	    if (typeof CodeMirrorBlocks === 'undefined') {
	      console.log('CodeMirrorBlocks not found');
	      CMblocks = undefined;
	    } else {
	      CMblocks = new CodeMirrorBlocks(CM, 'wescheme', {
	        willInsertNode: function willInsertNode(sourceNodeText, sourceNode, destination) {
	          var line = CM.editor.getLine(destination.line);
	          if (destination.ch > 0 && line[destination.ch - 1].match(/[\w\d]/)) {
	            // previous character is a letter or number, so prefix a space
	            sourceNodeText = ' ' + sourceNodeText;
	          }
	
	          if (destination.ch < line.length && line[destination.ch].match(/[\w\d]/)) {
	            // next character is a letter or a number, so append a space
	            sourceNodeText += ' ';
	          }
	          return sourceNodeText;
	        }
	      });
	      CM.blocksEditor = CMblocks;
	      CM.changeMode = function (mode) {
	        if (mode === "false") {
	          mode = false;
	        } else {
	          CMblocks.ast = null;
	        }
	        CMblocks.setBlockMode(mode);
	      };
	    }
	
	    if (useLineNumbers) {
	      CM.display.wrapper.appendChild(mkWarningUpper()[0]);
	      CM.display.wrapper.appendChild(mkWarningLower()[0]);
	    }
	
	    return {
	      cm: CM,
	      refresh: function refresh() {
	        CM.refresh();
	      },
	      run: function run() {
	        runFun(CM.getValue());
	      },
	      focus: function focus() {
	        CM.focus();
	      }
	    };
	  };
	  CPO.RUN_CODE = function () {};
	
	  storageAPI.then(function (api) {
	    api.collection.then(function () {
	      $(".loginOnly").show();
	      $(".logoutOnly").hide();
	      api.api.getCollectionLink().then(function (link) {
	        $("#drive-view a").attr("href", link);
	      });
	    });
	    api.collection.fail(function () {
	      $(".loginOnly").hide();
	      $(".logoutOnly").show();
	    });
	  });
	
	  storageAPI = storageAPI.then(function (api) {
	    return api.api;
	  });
	  $("#connectButton").click(function () {
	    $("#connectButton").text("Connecting...");
	    $("#connectButton").attr("disabled", "disabled");
	    storageAPI = createProgramCollectionAPI("code.pyret.org", false);
	    storageAPI.then(function (api) {
	      api.collection.then(function () {
	        $(".loginOnly").show();
	        $(".logoutOnly").hide();
	        api.api.getCollectionLink().then(function (link) {
	          $("#drive-view a").attr("href", link);
	        });
	        if (params["get"] && params["get"]["program"]) {
	          var toLoad = api.api.getFileById(params["get"]["program"]);
	          console.log("Logged in and has program to load: ", toLoad);
	          loadProgram(toLoad);
	          programToSave = toLoad;
	        } else {
	          programToSave = Q.fcall(function () {
	            return null;
	          });
	        }
	      });
	      api.collection.fail(function () {
	        $("#connectButton").text("Connect to Google Drive");
	        $("#connectButton").attr("disabled", false);
	      });
	    });
	    storageAPI = storageAPI.then(function (api) {
	      return api.api;
	    });
	  });
	
	  var copyOnSave = false;
	
	  var initialProgram = storageAPI.then(function (api) {
	    var programLoad = null;
	    if (params["get"] && params["get"]["program"]) {
	      programLoad = api.getFileById(params["get"]["program"]);
	      programLoad.then(function (p) {
	        showShareContainer(p);
	      });
	    }
	    if (params["get"] && params["get"]["share"]) {
	      programLoad = api.getSharedFileById(params["get"]["share"]);
	      $("#saveButton").text("Save a Copy");
	      copyOnSave = true;
	    }
	    if (programLoad) {
	      programLoad.fail(function (err) {
	        console.error(err);
	        window.stickError("The program failed to load.");
	      });
	      return programLoad;
	    } else {
	      return null;
	    }
	  });
	
	  function setTitle(progName) {
	    document.title = progName + " - code.pyret.org";
	  }
	  CPO.setTitle = setTitle;
	
	  $("#download a").click(function () {
	    var downloadElt = $("#download a");
	    var contents = CPO.editor.cm.getValue();
	    var downloadBlob = window.URL.createObjectURL(new Blob([contents], { type: 'text/plain' }));
	    var filename = $("#program-name").val();
	    if (!filename) {
	      filename = 'untitled_program.arr';
	    }
	    if (filename.indexOf(".arr") !== filename.length - 4) {
	      filename += ".arr";
	    }
	    downloadElt.attr({
	      download: filename,
	      href: downloadBlob
	    });
	    $("#download").append(downloadElt);
	  });
	
	  function loadProgram(p) {
	    return p.then(function (p) {
	      if (p !== null) {
	        $("#program-name").val(p.getName());
	        setTitle(p.getName());
	        return p.getContents();
	      }
	    });
	  }
	
	  var programLoaded = loadProgram(initialProgram);
	
	  var programToSave = initialProgram;
	
	  function showShareContainer(p) {
	    $("#shareContainer").empty();
	    $("#shareContainer").append(shareAPI.makeShareLink(p));
	  }
	
	  function nameOrUntitled() {
	    return $("#program-name").val() || "Untitled";
	  }
	  function autoSave() {
	    programToSave.then(function (p) {
	      if (p !== null && !copyOnSave) {
	        save();
	      }
	    });
	  }
	  CPO.autoSave = autoSave;
	  CPO.showShareContainer = showShareContainer;
	  CPO.loadProgram = loadProgram;
	
	  function save() {
	    window.stickMessage("Saving...");
	    var savedProgram = programToSave.then(function (p) {
	      if (p !== null && !copyOnSave) {
	        if (p.getName() !== $("#program-name").val()) {
	          programToSave = p.rename(nameOrUntitled()).then(function (newP) {
	            return newP;
	          });
	        }
	        return programToSave.then(function (p) {
	          showShareContainer(p);
	          return p.save(CPO.editor.cm.getValue(), false);
	        }).then(function (p) {
	          $("#program-name").val(p.getName());
	          $("#saveButton").text("Save");
	          history.pushState(null, null, "#program=" + p.getUniqueId());
	          window.location.hash = "#program=" + p.getUniqueId();
	          window.flashMessage("Program saved as " + p.getName());
	          setTitle(p.getName());
	          return p;
	        });
	      } else {
	        var programName = $("#program-name").val() || "Untitled";
	        $("#program-name").val(programName);
	        programToSave = storageAPI.then(function (api) {
	          return api.createFile(programName);
	        });
	        copyOnSave = false;
	        return save();
	      }
	    });
	    savedProgram.fail(function (err) {
	      window.stickError("Unable to save", "Your internet connection may be down, or something else might be wrong with this site or saving to Google.  You should back up any changes to this program somewhere else.  You can try saving again to see if the problem was temporary, as well.");
	      console.error(err);
	    });
	  }
	  CPO.save = save;
	  $("#runButton").click(CPO.autoSave);
	  $("#saveButton").click(save);
	  shareAPI.makeHoverMenu($("#menu"), $("#menuContents"), false, function () {});
	
	  var codeContainer = $("<div>").addClass("replMain");
	  $("#main").prepend(codeContainer);
	
	  CPO.editor = CPO.makeEditor(codeContainer, {
	    runButton: $("#runButton"),
	    simpleEditor: false,
	    run: CPO.RUN_CODE,
	    initialGas: 100
	  });
	  CPO.editor.cm.setOption("readOnly", "nocursor");
	
	  programLoaded.then(function (c) {
	    CPO.documents.set("definitions://", CPO.editor.cm.getDoc());
	
	    // NOTE(joe): Clearing history to address https://github.com/brownplt/pyret-lang/issues/386,
	    // in which undo can revert the program back to empty
	    CPO.editor.cm.clearHistory();
	    CPO.editor.cm.setValue(c);
	  });
	
	  programLoaded.fail(function () {
	    CPO.documents.set("definitions://", CPO.editor.cm.getDoc());
	  });
	
	  var pyretLoad = document.createElement('script');
	  console.log('process.env is', JSON.stringify(process.env));
	  console.log('process.env.GOOGLE_CLIENT_ID is', process.env.GOOGLE_CLIENT_ID);
	  console.log('process.env.REDISCLOUD_URL is', process.env.REDISCLOUD_URL);
	  console.log('process.env.BASE_URL is', ("http://localhost:5000"));
	  console.log('process.env.SESSION_SECRET is', process.env.SESSION_SECRET);
	  console.log('process.env.CURRENT_PYRET_RELEASE is', (""));
	  console.log('process.env.PYRET is', ("http://localhost:5000/js/cpo-main.jarr"));
	  console.log('process.env.PYRET_RELEASE_BASE is', process.env.PYRET_RELEASE_BASE);
	  console.log('clientId is', clientId);
	  //console.log(process.env.PYRET);
	  //pyretLoad.src = process.env.PYRET;
	  console.log(env_PYRET);
	  pyretLoad.src = env_PYRET;
	  pyretLoad.type = "text/javascript";
	  document.body.appendChild(pyretLoad);
	  $(pyretLoad).on("error", function () {
	    $("#loader").hide();
	    $("#runPart").hide();
	    $("#breakButton").hide();
	    window.stickError("Pyret failed to load; check your connection or try refreshing the page.  If this happens repeatedly, please report it as a bug.");
	  });
	
	  programLoaded.fin(function () {
	    CPO.editor.focus();
	    CPO.editor.cm.setOption("readOnly", false);
	  });
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 1 */
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	(function () {
	  try {
	    cachedSetTimeout = setTimeout;
	  } catch (e) {
	    cachedSetTimeout = function () {
	      throw new Error('setTimeout is not defined');
	    }
	  }
	  try {
	    cachedClearTimeout = clearTimeout;
	  } catch (e) {
	    cachedClearTimeout = function () {
	      throw new Error('clearTimeout is not defined');
	    }
	  }
	} ())
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = cachedSetTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    cachedClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        cachedSetTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {// Copyright 2013-2014 Kevin Cox
	
	/*******************************************************************************
	*                                                                              *
	*  This software is provided 'as-is', without any express or implied           *
	*  warranty. In no event will the authors be held liable for any damages       *
	*  arising from the use of this software.                                      *
	*                                                                              *
	*  Permission is granted to anyone to use this software for any purpose,       *
	*  including commercial applications, and to alter it and redistribute it      *
	*  freely, subject to the following restrictions:                              *
	*                                                                              *
	*  1. The origin of this software must not be misrepresented; you must not     *
	*     claim that you wrote the original software. If you use this software in  *
	*     a product, an acknowledgment in the product documentation would be       *
	*     appreciated but is not required.                                         *
	*                                                                              *
	*  2. Altered source versions must be plainly marked as such, and must not be  *
	*     misrepresented as being the original software.                           *
	*                                                                              *
	*  3. This notice may not be removed or altered from any source distribution.  *
	*                                                                              *
	*******************************************************************************/
	
	+function(){
	"use strict";
	
	var array = /\[([^\[]*)\]$/;
	
	/// URL Regex.
	/**
	 * This regex splits the URL into parts.  The capture groups catch the important
	 * bits.
	 * 
	 * Each section is optional, so to work on any part find the correct top level
	 * `(...)?` and mess around with it.
	 */
	var regex = /^(?:([a-z]*):)?(?:\/\/)?(?:([^:@]*)(?::([^@]*))?@)?([a-z-._]+)?(?::([0-9]*))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i;
	//               1 - scheme                2 - user    3 = pass 4 - host        5 - port  6 - path        7 - query    8 - hash
	
	var noslash = ["mailto","bitcoin"];
	
	var self = {
		/** Parse a query string.
		 *
		 * This function parses a query string (sometimes called the search
		 * string).  It takes a query string and returns a map of the results.
		 *
		 * Keys are considered to be everything up to the first '=' and values are
		 * everything afterwords.  Since URL-decoding is done after parsing, keys
		 * and values can have any values, however, '=' have to be encoded in keys
		 * while '?' and '&' have to be encoded anywhere (as they delimit the
		 * kv-pairs).
		 *
		 * Keys and values will always be strings, except if there is a key with no
		 * '=' in which case it will be considered a flag and will be set to true.
		 * Later values will override earlier values.
		 *
		 * Array keys are also supported.  By default keys in the form of `name[i]`
		 * will be returned like that as strings.  However, if you set the `array`
		 * flag in the options object they will be parsed into arrays.  Note that
		 * although the object returned is an `Array` object all keys will be
		 * written to it.  This means that if you have a key such as `k[forEach]`
		 * it will overwrite the `forEach` function on that array.  Also note that
		 * string properties always take precedence over array properties,
		 * irrespective of where they are in the query string.
		 *
		 *   url.get("array[1]=test&array[foo]=bar",{array:true}).array[1]  === "test"
		 *   url.get("array[1]=test&array[foo]=bar",{array:true}).array.foo === "bar"
		 *   url.get("array=notanarray&array[0]=1",{array:true}).array      === "notanarray"
		 *
		 * If array parsing is enabled keys in the form of `name[]` will
		 * automatically be given the next available index.  Note that this can be
		 * overwritten with later values in the query string.  For this reason is
		 * is best not to mix the two formats, although it is safe (and often
		 * useful) to add an automatic index argument to the end of a query string.
		 *
		 *   url.get("a[]=0&a[]=1&a[0]=2", {array:true})  -> {a:["2","1"]};
		 *   url.get("a[0]=0&a[1]=1&a[]=2", {array:true}) -> {a:["0","1","2"]};
		 *
		 * @param{string} q The query string (the part after the '?').
		 * @param{{full:boolean,array:boolean}=} opt Options.
		 *
		 * - full: If set `q` will be treated as a full url and `q` will be built.
		 *   by calling #parse to retrieve the query portion.
		 * - array: If set keys in the form of `key[i]` will be treated
		 *   as arrays/maps.
		 *
		 * @return{!Object.<string, string|Array>} The parsed result.
		 */
		"get": function(q, opt){
			q = q || "";
			if ( typeof opt          == "undefined" ) opt = {};
			if ( typeof opt["full"]  == "undefined" ) opt["full"] = false;
			if ( typeof opt["array"] == "undefined" ) opt["array"] = false;
			
			if ( opt["full"] === true )
			{
				q = self["parse"](q, {"get":false})["query"] || "";
			}
			
			var o = {};
			
			var c = q.split("&");
			for (var i = 0; i < c.length; i++)
			{
				if (!c[i].length) continue;
				
				var d = c[i].indexOf("=");
				var k = c[i], v = true;
				if ( d >= 0 )
				{
					k = c[i].substr(0, d);
					v = c[i].substr(d+1);
					
					v = decodeURIComponent(v);
				}
				
				if (opt["array"])
				{
					var inds = [];
					var ind;
					var curo = o;
					var curk = k;
					while (ind = curk.match(array)) // Array!
					{
						curk = curk.substr(0, ind.index);
						inds.unshift(decodeURIComponent(ind[1]));
					}
					curk = decodeURIComponent(curk);
					if (inds.some(function(i)
					{
						if ( typeof curo[curk] == "undefined" ) curo[curk] = [];
						if (!Array.isArray(curo[curk]))
						{
							//console.log("url.get: Array property "+curk+" already exists as string!");
							return true;
						}
						
						curo = curo[curk];
						
						if ( i === "" ) i = curo.length;
						
						curk = i;
					})) continue;
					curo[curk] = v;
					continue;
				}
				
				k = decodeURIComponent(k);
				
				//typeof o[k] == "undefined" || console.log("Property "+k+" already exists!");
				o[k] = v;
			}
			
			return o;
		},
		
		/** Build a get query from an object.
		 *
		 * This constructs a query string from the kv pairs in `data`.  Calling
		 * #get on the string returned should return an object identical to the one
		 * passed in except all non-boolean scalar types become strings and all
		 * object types become arrays (non-integer keys are still present, see
		 * #get's documentation for more details).
		 *
		 * This always uses array syntax for describing arrays.  If you want to
		 * serialize them differently (like having the value be a JSON array and
		 * have a plain key) you will need to do that before passing it in.
		 *
		 * All keys and values are supported (binary data anyone?) as they are
		 * properly URL-encoded and #get properly decodes.
		 *
		 * @param{Object} data The kv pairs.
		 * @param{string} prefix The properly encoded array key to put the
		 *   properties.  Mainly intended for internal use.
		 * @return{string} A URL-safe string.
		 */
		"buildget": function(data, prefix){
			var itms = [];
			for ( var k in data )
			{
				var ek = encodeURIComponent(k);
				if ( typeof prefix != "undefined" )
					ek = prefix+"["+ek+"]";
				
				var v = data[k];
				
				switch (typeof v)
				{
					case 'boolean':
						if(v) itms.push(ek);
						break;
					case 'number':
						v = v.toString();
					case 'string':
						itms.push(ek+"="+encodeURIComponent(v));
						break;
					case 'object':
						itms.push(self["buildget"](v, ek));
						break;
				}
			}
			return itms.join("&");
		},
		
		/** Parse a URL
		 * 
		 * This breaks up a URL into components.  It attempts to be very liberal
		 * and returns the best result in most cases.  This means that you can
		 * often pass in part of a URL and get correct categories back.  Notably,
		 * this works for emails and Jabber IDs, as well as adding a '?' to the
		 * beginning of a string will parse the whole thing as a query string.  If
		 * an item is not found the property will be undefined.  In some cases an
		 * empty string will be returned if the surrounding syntax but the actual
		 * value is empty (example: "://example.com" will give a empty string for
		 * scheme.)  Notably the host name will always be set to something.
		 * 
		 * Returned properties.
		 * 
		 * - **scheme:** The url scheme. (ex: "mailto" or "https")
		 * - **user:** The username.
		 * - **pass:** The password.
		 * - **host:** The hostname. (ex: "localhost", "123.456.7.8" or "example.com")
		 * - **port:** The port, as a number. (ex: 1337)
		 * - **path:** The path. (ex: "/" or "/about.html")
		 * - **query:** "The query string. (ex: "foo=bar&v=17&format=json")
		 * - **get:** The query string parsed with get.  If `opt.get` is `false` this
		 *   will be absent
		 * - **hash:** The value after the hash. (ex: "myanchor")
		 *   be undefined even if `query` is set.
		 *
		 * @param{string} url The URL to parse.
		 * @param{{get:Object}=} opt Options:
		 *
		 * - get: An options argument to be passed to #get or false to not call #get.
		 *    **DO NOT** set `full`.
		 *
		 * @return{!Object} An object with the parsed values.
		 */
		"parse": function(url, opt) {
			
			if ( typeof opt == "undefined" ) opt = {};
			
			var md = url.match(regex) || [];
			
			var r = {
				"url":    url,
				
				"scheme": md[1],
				"user":   md[2],
				"pass":   md[3],
				"host":   md[4],
				"port":   md[5] && +md[5],
				"path":   md[6],
				"query":  md[7],
				"hash":   md[8],
			};
			
			if ( opt.get !== false )
				r["get"] = r["query"] && self["get"](r["query"], opt.get);
			
			return r;
		},
		
		/** Build a URL from components.
		 * 
		 * This pieces together a url from the properties of the passed in object.
		 * In general passing the result of `parse()` should return the URL.  There
		 * may differences in the get string as the keys and values might be more
		 * encoded then they were originally were.  However, calling `get()` on the
		 * two values should yield the same result.
		 * 
		 * Here is how the parameters are used.
		 * 
		 *  - url: Used only if no other values are provided.  If that is the case
		 *     `url` will be returned verbatim.
		 *  - scheme: Used if defined.
		 *  - user: Used if defined.
		 *  - pass: Used if defined.
		 *  - host: Used if defined.
		 *  - path: Used if defined.
		 *  - query: Used only if `get` is not provided and non-empty.
		 *  - get: Used if non-empty.  Passed to #buildget and the result is used
		 *    as the query string.
		 *  - hash: Used if defined.
		 * 
		 * These are the options that are valid on the options object.
		 * 
		 *  - useemptyget: If truthy, a question mark will be appended for empty get
		 *    strings.  This notably makes `build()` and `parse()` fully symmetric.
		 *
		 * @param{Object} data The pieces of the URL.
		 * @param{Object} opt Options for building the url.
		 * @return{string} The URL.
		 */
		"build": function(data, opt){
			opt = opt || {};
			
			var r = "";
			
			if ( typeof data["scheme"] != "undefined" )
			{
				r += data["scheme"];
				r += (noslash.indexOf(data["scheme"])>=0)?":":"://";
			}
			if ( typeof data["user"] != "undefined" )
			{
				r += data["user"];
				if ( typeof data["pass"] == "undefined" )
				{
					r += "@";
				}
			}
			if ( typeof data["pass"] != "undefined" ) r += ":" + data["pass"] + "@";
			if ( typeof data["host"] != "undefined" ) r += data["host"];
			if ( typeof data["port"] != "undefined" ) r += ":" + data["port"];
			if ( typeof data["path"] != "undefined" ) r += data["path"];
			
			if (opt["useemptyget"])
			{
				if      ( typeof data["get"]   != "undefined" ) r += "?" + self["buildget"](data["get"]);
				else if ( typeof data["query"] != "undefined" ) r += "?" + data["query"];
			}
			else
			{
				// If .get use it.  If .get leads to empty, use .query.
				var q = data["get"] && self["buildget"](data["get"]) || data["query"];
				if (q) r += "?" + q;
			}
			
			if ( typeof data["hash"] != "undefined" ) r += "#" + data["hash"];
			
			return r || data["url"] || "";
		},
	};
	
	if ( "function" != "undefined" && __webpack_require__(4)["amd"] ) !(__WEBPACK_AMD_DEFINE_FACTORY__ = (self), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	else if ( true ) module['exports'] = self;
	else window["url"] = self;
	
	}();
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)(module)))

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYmY1Y2E5NzAyYjY0MTFlMGZjMzEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dlYi9qcy9iZWZvcmVQeXJldC5qcyIsIndlYnBhY2s6Ly8vLi9+L3Byb2Nlc3MvYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly8vLi9+L3VybC5qcy91cmwuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL21vZHVsZS5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vYW1kLWRlZmluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBLG1FQUEyRDtBQUMzRDtBQUNBO0FBQ0E7O0FBRUEsb0RBQTRDO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtEQUEwQztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxjQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkI7QUFDM0I7QUFDQSxZQUFJO0FBQ0o7QUFDQSxXQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBLHNEQUE4QztBQUM5QztBQUNBLHFDQUE2Qjs7QUFFN0IsK0NBQXVDO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQU07QUFDTixhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFPO0FBQ1AsY0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw4Q0FBc0M7QUFDdEM7QUFDQTtBQUNBLHFDQUE2QjtBQUM3QixxQ0FBNkI7QUFDN0I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBb0IsZ0JBQWdCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBb0IsZ0JBQWdCO0FBQ3BDO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxhQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLGFBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5QkFBaUIsOEJBQThCO0FBQy9DO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDBCQUFrQixxQkFBcUI7QUFDdkM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFJO0FBQ0o7O0FBRUEsNERBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxZQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQW1CLDJCQUEyQjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSwwQkFBa0IsY0FBYztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUJBQWlCLDRCQUE0QjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSwwQkFBa0IsNEJBQTRCO0FBQzlDO0FBQ0E7QUFDQTtBQUNB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RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxPQUFPO0FBQ2xCLGFBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsR0FBRTtBQUNGOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxFQUFDOzs7Ozs7OztBQ3JWRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ1RBLDhCQUE2QixtREFBbUQiLCJmaWxlIjoianMvYmVmb3JlUHlyZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHR2YXIgcGFyZW50SG90VXBkYXRlQ2FsbGJhY2sgPSB0aGlzW1wid2VicGFja0hvdFVwZGF0ZVwiXTtcbiBcdHRoaXNbXCJ3ZWJwYWNrSG90VXBkYXRlXCJdID0gXHJcbiBcdGZ1bmN0aW9uIHdlYnBhY2tIb3RVcGRhdGVDYWxsYmFjayhjaHVua0lkLCBtb3JlTW9kdWxlcykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0aG90QWRkVXBkYXRlQ2h1bmsoY2h1bmtJZCwgbW9yZU1vZHVsZXMpO1xyXG4gXHRcdGlmKHBhcmVudEhvdFVwZGF0ZUNhbGxiYWNrKSBwYXJlbnRIb3RVcGRhdGVDYWxsYmFjayhjaHVua0lkLCBtb3JlTW9kdWxlcyk7XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdERvd25sb2FkVXBkYXRlQ2h1bmsoY2h1bmtJZCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0dmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF07XHJcbiBcdFx0dmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XHJcbiBcdFx0c2NyaXB0LnR5cGUgPSBcInRleHQvamF2YXNjcmlwdFwiO1xyXG4gXHRcdHNjcmlwdC5jaGFyc2V0ID0gXCJ1dGYtOFwiO1xyXG4gXHRcdHNjcmlwdC5zcmMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgKyBcIlwiICsgY2h1bmtJZCArIFwiLlwiICsgaG90Q3VycmVudEhhc2ggKyBcIi5ob3QtdXBkYXRlLmpzXCI7XHJcbiBcdFx0aGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3REb3dubG9hZE1hbmlmZXN0KGNhbGxiYWNrKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHRpZih0eXBlb2YgWE1MSHR0cFJlcXVlc3QgPT09IFwidW5kZWZpbmVkXCIpXHJcbiBcdFx0XHRyZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKFwiTm8gYnJvd3NlciBzdXBwb3J0XCIpKTtcclxuIFx0XHR0cnkge1xyXG4gXHRcdFx0dmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuIFx0XHRcdHZhciByZXF1ZXN0UGF0aCA9IF9fd2VicGFja19yZXF1aXJlX18ucCArIFwiXCIgKyBob3RDdXJyZW50SGFzaCArIFwiLmhvdC11cGRhdGUuanNvblwiO1xyXG4gXHRcdFx0cmVxdWVzdC5vcGVuKFwiR0VUXCIsIHJlcXVlc3RQYXRoLCB0cnVlKTtcclxuIFx0XHRcdHJlcXVlc3QudGltZW91dCA9IDEwMDAwO1xyXG4gXHRcdFx0cmVxdWVzdC5zZW5kKG51bGwpO1xyXG4gXHRcdH0gY2F0Y2goZXJyKSB7XHJcbiBcdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyKTtcclxuIFx0XHR9XHJcbiBcdFx0cmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuIFx0XHRcdGlmKHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkgcmV0dXJuO1xyXG4gXHRcdFx0aWYocmVxdWVzdC5zdGF0dXMgPT09IDApIHtcclxuIFx0XHRcdFx0Ly8gdGltZW91dFxyXG4gXHRcdFx0XHRjYWxsYmFjayhuZXcgRXJyb3IoXCJNYW5pZmVzdCByZXF1ZXN0IHRvIFwiICsgcmVxdWVzdFBhdGggKyBcIiB0aW1lZCBvdXQuXCIpKTtcclxuIFx0XHRcdH0gZWxzZSBpZihyZXF1ZXN0LnN0YXR1cyA9PT0gNDA0KSB7XHJcbiBcdFx0XHRcdC8vIG5vIHVwZGF0ZSBhdmFpbGFibGVcclxuIFx0XHRcdFx0Y2FsbGJhY2soKTtcclxuIFx0XHRcdH0gZWxzZSBpZihyZXF1ZXN0LnN0YXR1cyAhPT0gMjAwICYmIHJlcXVlc3Quc3RhdHVzICE9PSAzMDQpIHtcclxuIFx0XHRcdFx0Ly8gb3RoZXIgZmFpbHVyZVxyXG4gXHRcdFx0XHRjYWxsYmFjayhuZXcgRXJyb3IoXCJNYW5pZmVzdCByZXF1ZXN0IHRvIFwiICsgcmVxdWVzdFBhdGggKyBcIiBmYWlsZWQuXCIpKTtcclxuIFx0XHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRcdC8vIHN1Y2Nlc3NcclxuIFx0XHRcdFx0dHJ5IHtcclxuIFx0XHRcdFx0XHR2YXIgdXBkYXRlID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XHJcbiBcdFx0XHRcdH0gY2F0Y2goZSkge1xyXG4gXHRcdFx0XHRcdGNhbGxiYWNrKGUpO1xyXG4gXHRcdFx0XHRcdHJldHVybjtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRjYWxsYmFjayhudWxsLCB1cGRhdGUpO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH07XHJcbiBcdH1cclxuXG4gXHRcclxuIFx0XHJcbiBcdC8vIENvcGllZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC9ibG9iL2JlZjQ1YjAvc3JjL3NoYXJlZC91dGlscy9jYW5EZWZpbmVQcm9wZXJ0eS5qc1xyXG4gXHR2YXIgY2FuRGVmaW5lUHJvcGVydHkgPSBmYWxzZTtcclxuIFx0dHJ5IHtcclxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sIFwieFwiLCB7XHJcbiBcdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge31cclxuIFx0XHR9KTtcclxuIFx0XHRjYW5EZWZpbmVQcm9wZXJ0eSA9IHRydWU7XHJcbiBcdH0gY2F0Y2goeCkge1xyXG4gXHRcdC8vIElFIHdpbGwgZmFpbCBvbiBkZWZpbmVQcm9wZXJ0eVxyXG4gXHR9XHJcbiBcdFxyXG4gXHR2YXIgaG90QXBwbHlPblVwZGF0ZSA9IHRydWU7XHJcbiBcdHZhciBob3RDdXJyZW50SGFzaCA9IFwiYmY1Y2E5NzAyYjY0MTFlMGZjMzFcIjsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHR2YXIgaG90Q3VycmVudE1vZHVsZURhdGEgPSB7fTtcclxuIFx0dmFyIGhvdEN1cnJlbnRQYXJlbnRzID0gW107IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdENyZWF0ZVJlcXVpcmUobW9kdWxlSWQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdHZhciBtZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdGlmKCFtZSkgcmV0dXJuIF9fd2VicGFja19yZXF1aXJlX187XHJcbiBcdFx0dmFyIGZuID0gZnVuY3Rpb24ocmVxdWVzdCkge1xyXG4gXHRcdFx0aWYobWUuaG90LmFjdGl2ZSkge1xyXG4gXHRcdFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW3JlcXVlc3RdKSB7XHJcbiBcdFx0XHRcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1tyZXF1ZXN0XS5wYXJlbnRzLmluZGV4T2YobW9kdWxlSWQpIDwgMClcclxuIFx0XHRcdFx0XHRcdGluc3RhbGxlZE1vZHVsZXNbcmVxdWVzdF0ucGFyZW50cy5wdXNoKG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0XHRpZihtZS5jaGlsZHJlbi5pbmRleE9mKHJlcXVlc3QpIDwgMClcclxuIFx0XHRcdFx0XHRcdG1lLmNoaWxkcmVuLnB1c2gocmVxdWVzdCk7XHJcbiBcdFx0XHRcdH0gZWxzZSBob3RDdXJyZW50UGFyZW50cyA9IFttb2R1bGVJZF07XHJcbiBcdFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0XHRjb25zb2xlLndhcm4oXCJbSE1SXSB1bmV4cGVjdGVkIHJlcXVpcmUoXCIgKyByZXF1ZXN0ICsgXCIpIGZyb20gZGlzcG9zZWQgbW9kdWxlIFwiICsgbW9kdWxlSWQpO1xyXG4gXHRcdFx0XHRob3RDdXJyZW50UGFyZW50cyA9IFtdO1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18ocmVxdWVzdCk7XHJcbiBcdFx0fTtcclxuIFx0XHRmb3IodmFyIG5hbWUgaW4gX193ZWJwYWNrX3JlcXVpcmVfXykge1xyXG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKF9fd2VicGFja19yZXF1aXJlX18sIG5hbWUpKSB7XHJcbiBcdFx0XHRcdGlmKGNhbkRlZmluZVByb3BlcnR5KSB7XHJcbiBcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGZuLCBuYW1lLCAoZnVuY3Rpb24obmFtZSkge1xyXG4gXHRcdFx0XHRcdFx0cmV0dXJuIHtcclxuIFx0XHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxyXG4gXHRcdFx0XHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxyXG4gXHRcdFx0XHRcdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gXHRcdFx0XHRcdFx0XHRcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fW25hbWVdO1xyXG4gXHRcdFx0XHRcdFx0XHR9LFxyXG4gXHRcdFx0XHRcdFx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiBcdFx0XHRcdFx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfX1tuYW1lXSA9IHZhbHVlO1xyXG4gXHRcdFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0XHR9O1xyXG4gXHRcdFx0XHRcdH0obmFtZSkpKTtcclxuIFx0XHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0XHRmbltuYW1lXSA9IF9fd2VicGFja19yZXF1aXJlX19bbmFtZV07XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdGZ1bmN0aW9uIGVuc3VyZShjaHVua0lkLCBjYWxsYmFjaykge1xyXG4gXHRcdFx0aWYoaG90U3RhdHVzID09PSBcInJlYWR5XCIpXHJcbiBcdFx0XHRcdGhvdFNldFN0YXR1cyhcInByZXBhcmVcIik7XHJcbiBcdFx0XHRob3RDaHVua3NMb2FkaW5nKys7XHJcbiBcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmUoY2h1bmtJZCwgZnVuY3Rpb24oKSB7XHJcbiBcdFx0XHRcdHRyeSB7XHJcbiBcdFx0XHRcdFx0Y2FsbGJhY2suY2FsbChudWxsLCBmbik7XHJcbiBcdFx0XHRcdH0gZmluYWxseSB7XHJcbiBcdFx0XHRcdFx0ZmluaXNoQ2h1bmtMb2FkaW5nKCk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHJcbiBcdFx0XHRcdGZ1bmN0aW9uIGZpbmlzaENodW5rTG9hZGluZygpIHtcclxuIFx0XHRcdFx0XHRob3RDaHVua3NMb2FkaW5nLS07XHJcbiBcdFx0XHRcdFx0aWYoaG90U3RhdHVzID09PSBcInByZXBhcmVcIikge1xyXG4gXHRcdFx0XHRcdFx0aWYoIWhvdFdhaXRpbmdGaWxlc01hcFtjaHVua0lkXSkge1xyXG4gXHRcdFx0XHRcdFx0XHRob3RFbnN1cmVVcGRhdGVDaHVuayhjaHVua0lkKTtcclxuIFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRcdGlmKGhvdENodW5rc0xvYWRpbmcgPT09IDAgJiYgaG90V2FpdGluZ0ZpbGVzID09PSAwKSB7XHJcbiBcdFx0XHRcdFx0XHRcdGhvdFVwZGF0ZURvd25sb2FkZWQoKTtcclxuIFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH0pO1xyXG4gXHRcdH1cclxuIFx0XHRpZihjYW5EZWZpbmVQcm9wZXJ0eSkge1xyXG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGZuLCBcImVcIiwge1xyXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxyXG4gXHRcdFx0XHR2YWx1ZTogZW5zdXJlXHJcbiBcdFx0XHR9KTtcclxuIFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0Zm4uZSA9IGVuc3VyZTtcclxuIFx0XHR9XHJcbiBcdFx0cmV0dXJuIGZuO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RDcmVhdGVNb2R1bGUobW9kdWxlSWQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdHZhciBob3QgPSB7XHJcbiBcdFx0XHQvLyBwcml2YXRlIHN0dWZmXHJcbiBcdFx0XHRfYWNjZXB0ZWREZXBlbmRlbmNpZXM6IHt9LFxyXG4gXHRcdFx0X2RlY2xpbmVkRGVwZW5kZW5jaWVzOiB7fSxcclxuIFx0XHRcdF9zZWxmQWNjZXB0ZWQ6IGZhbHNlLFxyXG4gXHRcdFx0X3NlbGZEZWNsaW5lZDogZmFsc2UsXHJcbiBcdFx0XHRfZGlzcG9zZUhhbmRsZXJzOiBbXSxcclxuIFx0XHJcbiBcdFx0XHQvLyBNb2R1bGUgQVBJXHJcbiBcdFx0XHRhY3RpdmU6IHRydWUsXHJcbiBcdFx0XHRhY2NlcHQ6IGZ1bmN0aW9uKGRlcCwgY2FsbGJhY2spIHtcclxuIFx0XHRcdFx0aWYodHlwZW9mIGRlcCA9PT0gXCJ1bmRlZmluZWRcIilcclxuIFx0XHRcdFx0XHRob3QuX3NlbGZBY2NlcHRlZCA9IHRydWU7XHJcbiBcdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRlcCA9PT0gXCJmdW5jdGlvblwiKVxyXG4gXHRcdFx0XHRcdGhvdC5fc2VsZkFjY2VwdGVkID0gZGVwO1xyXG4gXHRcdFx0XHRlbHNlIGlmKHR5cGVvZiBkZXAgPT09IFwib2JqZWN0XCIpXHJcbiBcdFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGRlcC5sZW5ndGg7IGkrKylcclxuIFx0XHRcdFx0XHRcdGhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbZGVwW2ldXSA9IGNhbGxiYWNrO1xyXG4gXHRcdFx0XHRlbHNlXHJcbiBcdFx0XHRcdFx0aG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1tkZXBdID0gY2FsbGJhY2s7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0ZGVjbGluZTogZnVuY3Rpb24oZGVwKSB7XHJcbiBcdFx0XHRcdGlmKHR5cGVvZiBkZXAgPT09IFwidW5kZWZpbmVkXCIpXHJcbiBcdFx0XHRcdFx0aG90Ll9zZWxmRGVjbGluZWQgPSB0cnVlO1xyXG4gXHRcdFx0XHRlbHNlIGlmKHR5cGVvZiBkZXAgPT09IFwibnVtYmVyXCIpXHJcbiBcdFx0XHRcdFx0aG90Ll9kZWNsaW5lZERlcGVuZGVuY2llc1tkZXBdID0gdHJ1ZTtcclxuIFx0XHRcdFx0ZWxzZVxyXG4gXHRcdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBkZXAubGVuZ3RoOyBpKyspXHJcbiBcdFx0XHRcdFx0XHRob3QuX2RlY2xpbmVkRGVwZW5kZW5jaWVzW2RlcFtpXV0gPSB0cnVlO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdGRpc3Bvc2U6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiBcdFx0XHRcdGhvdC5fZGlzcG9zZUhhbmRsZXJzLnB1c2goY2FsbGJhY2spO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdGFkZERpc3Bvc2VIYW5kbGVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gXHRcdFx0XHRob3QuX2Rpc3Bvc2VIYW5kbGVycy5wdXNoKGNhbGxiYWNrKTtcclxuIFx0XHRcdH0sXHJcbiBcdFx0XHRyZW1vdmVEaXNwb3NlSGFuZGxlcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuIFx0XHRcdFx0dmFyIGlkeCA9IGhvdC5fZGlzcG9zZUhhbmRsZXJzLmluZGV4T2YoY2FsbGJhY2spO1xyXG4gXHRcdFx0XHRpZihpZHggPj0gMCkgaG90Ll9kaXNwb3NlSGFuZGxlcnMuc3BsaWNlKGlkeCwgMSk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcclxuIFx0XHRcdC8vIE1hbmFnZW1lbnQgQVBJXHJcbiBcdFx0XHRjaGVjazogaG90Q2hlY2ssXHJcbiBcdFx0XHRhcHBseTogaG90QXBwbHksXHJcbiBcdFx0XHRzdGF0dXM6IGZ1bmN0aW9uKGwpIHtcclxuIFx0XHRcdFx0aWYoIWwpIHJldHVybiBob3RTdGF0dXM7XHJcbiBcdFx0XHRcdGhvdFN0YXR1c0hhbmRsZXJzLnB1c2gobCk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0YWRkU3RhdHVzSGFuZGxlcjogZnVuY3Rpb24obCkge1xyXG4gXHRcdFx0XHRob3RTdGF0dXNIYW5kbGVycy5wdXNoKGwpO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdHJlbW92ZVN0YXR1c0hhbmRsZXI6IGZ1bmN0aW9uKGwpIHtcclxuIFx0XHRcdFx0dmFyIGlkeCA9IGhvdFN0YXR1c0hhbmRsZXJzLmluZGV4T2YobCk7XHJcbiBcdFx0XHRcdGlmKGlkeCA+PSAwKSBob3RTdGF0dXNIYW5kbGVycy5zcGxpY2UoaWR4LCAxKTtcclxuIFx0XHRcdH0sXHJcbiBcdFxyXG4gXHRcdFx0Ly9pbmhlcml0IGZyb20gcHJldmlvdXMgZGlzcG9zZSBjYWxsXHJcbiBcdFx0XHRkYXRhOiBob3RDdXJyZW50TW9kdWxlRGF0YVttb2R1bGVJZF1cclxuIFx0XHR9O1xyXG4gXHRcdHJldHVybiBob3Q7XHJcbiBcdH1cclxuIFx0XHJcbiBcdHZhciBob3RTdGF0dXNIYW5kbGVycyA9IFtdO1xyXG4gXHR2YXIgaG90U3RhdHVzID0gXCJpZGxlXCI7XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RTZXRTdGF0dXMobmV3U3RhdHVzKSB7XHJcbiBcdFx0aG90U3RhdHVzID0gbmV3U3RhdHVzO1xyXG4gXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBob3RTdGF0dXNIYW5kbGVycy5sZW5ndGg7IGkrKylcclxuIFx0XHRcdGhvdFN0YXR1c0hhbmRsZXJzW2ldLmNhbGwobnVsbCwgbmV3U3RhdHVzKTtcclxuIFx0fVxyXG4gXHRcclxuIFx0Ly8gd2hpbGUgZG93bmxvYWRpbmdcclxuIFx0dmFyIGhvdFdhaXRpbmdGaWxlcyA9IDA7XHJcbiBcdHZhciBob3RDaHVua3NMb2FkaW5nID0gMDtcclxuIFx0dmFyIGhvdFdhaXRpbmdGaWxlc01hcCA9IHt9O1xyXG4gXHR2YXIgaG90UmVxdWVzdGVkRmlsZXNNYXAgPSB7fTtcclxuIFx0dmFyIGhvdEF2YWlsaWJsZUZpbGVzTWFwID0ge307XHJcbiBcdHZhciBob3RDYWxsYmFjaztcclxuIFx0XHJcbiBcdC8vIFRoZSB1cGRhdGUgaW5mb1xyXG4gXHR2YXIgaG90VXBkYXRlLCBob3RVcGRhdGVOZXdIYXNoO1xyXG4gXHRcclxuIFx0ZnVuY3Rpb24gdG9Nb2R1bGVJZChpZCkge1xyXG4gXHRcdHZhciBpc051bWJlciA9ICgraWQpICsgXCJcIiA9PT0gaWQ7XHJcbiBcdFx0cmV0dXJuIGlzTnVtYmVyID8gK2lkIDogaWQ7XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdENoZWNrKGFwcGx5LCBjYWxsYmFjaykge1xyXG4gXHRcdGlmKGhvdFN0YXR1cyAhPT0gXCJpZGxlXCIpIHRocm93IG5ldyBFcnJvcihcImNoZWNrKCkgaXMgb25seSBhbGxvd2VkIGluIGlkbGUgc3RhdHVzXCIpO1xyXG4gXHRcdGlmKHR5cGVvZiBhcHBseSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiBcdFx0XHRob3RBcHBseU9uVXBkYXRlID0gZmFsc2U7XHJcbiBcdFx0XHRjYWxsYmFjayA9IGFwcGx5O1xyXG4gXHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRob3RBcHBseU9uVXBkYXRlID0gYXBwbHk7XHJcbiBcdFx0XHRjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKGVycikge1xyXG4gXHRcdFx0XHRpZihlcnIpIHRocm93IGVycjtcclxuIFx0XHRcdH07XHJcbiBcdFx0fVxyXG4gXHRcdGhvdFNldFN0YXR1cyhcImNoZWNrXCIpO1xyXG4gXHRcdGhvdERvd25sb2FkTWFuaWZlc3QoZnVuY3Rpb24oZXJyLCB1cGRhdGUpIHtcclxuIFx0XHRcdGlmKGVycikgcmV0dXJuIGNhbGxiYWNrKGVycik7XHJcbiBcdFx0XHRpZighdXBkYXRlKSB7XHJcbiBcdFx0XHRcdGhvdFNldFN0YXR1cyhcImlkbGVcIik7XHJcbiBcdFx0XHRcdGNhbGxiYWNrKG51bGwsIG51bGwpO1xyXG4gXHRcdFx0XHRyZXR1cm47XHJcbiBcdFx0XHR9XHJcbiBcdFxyXG4gXHRcdFx0aG90UmVxdWVzdGVkRmlsZXNNYXAgPSB7fTtcclxuIFx0XHRcdGhvdEF2YWlsaWJsZUZpbGVzTWFwID0ge307XHJcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXNNYXAgPSB7fTtcclxuIFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCB1cGRhdGUuYy5sZW5ndGg7IGkrKylcclxuIFx0XHRcdFx0aG90QXZhaWxpYmxlRmlsZXNNYXBbdXBkYXRlLmNbaV1dID0gdHJ1ZTtcclxuIFx0XHRcdGhvdFVwZGF0ZU5ld0hhc2ggPSB1cGRhdGUuaDtcclxuIFx0XHJcbiBcdFx0XHRob3RTZXRTdGF0dXMoXCJwcmVwYXJlXCIpO1xyXG4gXHRcdFx0aG90Q2FsbGJhY2sgPSBjYWxsYmFjaztcclxuIFx0XHRcdGhvdFVwZGF0ZSA9IHt9O1xyXG4gXHRcdFx0dmFyIGNodW5rSWQgPSAwO1xyXG4gXHRcdFx0eyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWxvbmUtYmxvY2tzXHJcbiBcdFx0XHRcdC8qZ2xvYmFscyBjaHVua0lkICovXHJcbiBcdFx0XHRcdGhvdEVuc3VyZVVwZGF0ZUNodW5rKGNodW5rSWQpO1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0aWYoaG90U3RhdHVzID09PSBcInByZXBhcmVcIiAmJiBob3RDaHVua3NMb2FkaW5nID09PSAwICYmIGhvdFdhaXRpbmdGaWxlcyA9PT0gMCkge1xyXG4gXHRcdFx0XHRob3RVcGRhdGVEb3dubG9hZGVkKCk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fSk7XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdEFkZFVwZGF0ZUNodW5rKGNodW5rSWQsIG1vcmVNb2R1bGVzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHRpZighaG90QXZhaWxpYmxlRmlsZXNNYXBbY2h1bmtJZF0gfHwgIWhvdFJlcXVlc3RlZEZpbGVzTWFwW2NodW5rSWRdKVxyXG4gXHRcdFx0cmV0dXJuO1xyXG4gXHRcdGhvdFJlcXVlc3RlZEZpbGVzTWFwW2NodW5rSWRdID0gZmFsc2U7XHJcbiBcdFx0Zm9yKHZhciBtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xyXG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcclxuIFx0XHRcdFx0aG90VXBkYXRlW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFx0aWYoLS1ob3RXYWl0aW5nRmlsZXMgPT09IDAgJiYgaG90Q2h1bmtzTG9hZGluZyA9PT0gMCkge1xyXG4gXHRcdFx0aG90VXBkYXRlRG93bmxvYWRlZCgpO1xyXG4gXHRcdH1cclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90RW5zdXJlVXBkYXRlQ2h1bmsoY2h1bmtJZCkge1xyXG4gXHRcdGlmKCFob3RBdmFpbGlibGVGaWxlc01hcFtjaHVua0lkXSkge1xyXG4gXHRcdFx0aG90V2FpdGluZ0ZpbGVzTWFwW2NodW5rSWRdID0gdHJ1ZTtcclxuIFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0aG90UmVxdWVzdGVkRmlsZXNNYXBbY2h1bmtJZF0gPSB0cnVlO1xyXG4gXHRcdFx0aG90V2FpdGluZ0ZpbGVzKys7XHJcbiBcdFx0XHRob3REb3dubG9hZFVwZGF0ZUNodW5rKGNodW5rSWQpO1xyXG4gXHRcdH1cclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90VXBkYXRlRG93bmxvYWRlZCgpIHtcclxuIFx0XHRob3RTZXRTdGF0dXMoXCJyZWFkeVwiKTtcclxuIFx0XHR2YXIgY2FsbGJhY2sgPSBob3RDYWxsYmFjaztcclxuIFx0XHRob3RDYWxsYmFjayA9IG51bGw7XHJcbiBcdFx0aWYoIWNhbGxiYWNrKSByZXR1cm47XHJcbiBcdFx0aWYoaG90QXBwbHlPblVwZGF0ZSkge1xyXG4gXHRcdFx0aG90QXBwbHkoaG90QXBwbHlPblVwZGF0ZSwgY2FsbGJhY2spO1xyXG4gXHRcdH0gZWxzZSB7XHJcbiBcdFx0XHR2YXIgb3V0ZGF0ZWRNb2R1bGVzID0gW107XHJcbiBcdFx0XHRmb3IodmFyIGlkIGluIGhvdFVwZGF0ZSkge1xyXG4gXHRcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaG90VXBkYXRlLCBpZCkpIHtcclxuIFx0XHRcdFx0XHRvdXRkYXRlZE1vZHVsZXMucHVzaCh0b01vZHVsZUlkKGlkKSk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHRcdGNhbGxiYWNrKG51bGwsIG91dGRhdGVkTW9kdWxlcyk7XHJcbiBcdFx0fVxyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RBcHBseShvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gXHRcdGlmKGhvdFN0YXR1cyAhPT0gXCJyZWFkeVwiKSB0aHJvdyBuZXcgRXJyb3IoXCJhcHBseSgpIGlzIG9ubHkgYWxsb3dlZCBpbiByZWFkeSBzdGF0dXNcIik7XHJcbiBcdFx0aWYodHlwZW9mIG9wdGlvbnMgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gXHRcdFx0Y2FsbGJhY2sgPSBvcHRpb25zO1xyXG4gXHRcdFx0b3B0aW9ucyA9IHt9O1xyXG4gXHRcdH0gZWxzZSBpZihvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zID09PSBcIm9iamVjdFwiKSB7XHJcbiBcdFx0XHRjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKGVycikge1xyXG4gXHRcdFx0XHRpZihlcnIpIHRocm93IGVycjtcclxuIFx0XHRcdH07XHJcbiBcdFx0fSBlbHNlIHtcclxuIFx0XHRcdG9wdGlvbnMgPSB7fTtcclxuIFx0XHRcdGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oZXJyKSB7XHJcbiBcdFx0XHRcdGlmKGVycikgdGhyb3cgZXJyO1xyXG4gXHRcdFx0fTtcclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdGZ1bmN0aW9uIGdldEFmZmVjdGVkU3R1ZmYobW9kdWxlKSB7XHJcbiBcdFx0XHR2YXIgb3V0ZGF0ZWRNb2R1bGVzID0gW21vZHVsZV07XHJcbiBcdFx0XHR2YXIgb3V0ZGF0ZWREZXBlbmRlbmNpZXMgPSB7fTtcclxuIFx0XHJcbiBcdFx0XHR2YXIgcXVldWUgPSBvdXRkYXRlZE1vZHVsZXMuc2xpY2UoKTtcclxuIFx0XHRcdHdoaWxlKHF1ZXVlLmxlbmd0aCA+IDApIHtcclxuIFx0XHRcdFx0dmFyIG1vZHVsZUlkID0gcXVldWUucG9wKCk7XHJcbiBcdFx0XHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0aWYoIW1vZHVsZSB8fCBtb2R1bGUuaG90Ll9zZWxmQWNjZXB0ZWQpXHJcbiBcdFx0XHRcdFx0Y29udGludWU7XHJcbiBcdFx0XHRcdGlmKG1vZHVsZS5ob3QuX3NlbGZEZWNsaW5lZCkge1xyXG4gXHRcdFx0XHRcdHJldHVybiBuZXcgRXJyb3IoXCJBYm9ydGVkIGJlY2F1c2Ugb2Ygc2VsZiBkZWNsaW5lOiBcIiArIG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRpZihtb2R1bGVJZCA9PT0gMCkge1xyXG4gXHRcdFx0XHRcdHJldHVybjtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbW9kdWxlLnBhcmVudHMubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdFx0XHR2YXIgcGFyZW50SWQgPSBtb2R1bGUucGFyZW50c1tpXTtcclxuIFx0XHRcdFx0XHR2YXIgcGFyZW50ID0gaW5zdGFsbGVkTW9kdWxlc1twYXJlbnRJZF07XHJcbiBcdFx0XHRcdFx0aWYocGFyZW50LmhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdKSB7XHJcbiBcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IEVycm9yKFwiQWJvcnRlZCBiZWNhdXNlIG9mIGRlY2xpbmVkIGRlcGVuZGVuY3k6IFwiICsgbW9kdWxlSWQgKyBcIiBpbiBcIiArIHBhcmVudElkKTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0aWYob3V0ZGF0ZWRNb2R1bGVzLmluZGV4T2YocGFyZW50SWQpID49IDApIGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRcdGlmKHBhcmVudC5ob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSkge1xyXG4gXHRcdFx0XHRcdFx0aWYoIW91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSlcclxuIFx0XHRcdFx0XHRcdFx0b3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdID0gW107XHJcbiBcdFx0XHRcdFx0XHRhZGRBbGxUb1NldChvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF0sIFttb2R1bGVJZF0pO1xyXG4gXHRcdFx0XHRcdFx0Y29udGludWU7XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdGRlbGV0ZSBvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF07XHJcbiBcdFx0XHRcdFx0b3V0ZGF0ZWRNb2R1bGVzLnB1c2gocGFyZW50SWQpO1xyXG4gXHRcdFx0XHRcdHF1ZXVlLnB1c2gocGFyZW50SWQpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFxyXG4gXHRcdFx0cmV0dXJuIFtvdXRkYXRlZE1vZHVsZXMsIG91dGRhdGVkRGVwZW5kZW5jaWVzXTtcclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdGZ1bmN0aW9uIGFkZEFsbFRvU2V0KGEsIGIpIHtcclxuIFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBiLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHRcdHZhciBpdGVtID0gYltpXTtcclxuIFx0XHRcdFx0aWYoYS5pbmRleE9mKGl0ZW0pIDwgMClcclxuIFx0XHRcdFx0XHRhLnB1c2goaXRlbSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBhdCBiZWdpbiBhbGwgdXBkYXRlcyBtb2R1bGVzIGFyZSBvdXRkYXRlZFxyXG4gXHRcdC8vIHRoZSBcIm91dGRhdGVkXCIgc3RhdHVzIGNhbiBwcm9wYWdhdGUgdG8gcGFyZW50cyBpZiB0aGV5IGRvbid0IGFjY2VwdCB0aGUgY2hpbGRyZW5cclxuIFx0XHR2YXIgb3V0ZGF0ZWREZXBlbmRlbmNpZXMgPSB7fTtcclxuIFx0XHR2YXIgb3V0ZGF0ZWRNb2R1bGVzID0gW107XHJcbiBcdFx0dmFyIGFwcGxpZWRVcGRhdGUgPSB7fTtcclxuIFx0XHRmb3IodmFyIGlkIGluIGhvdFVwZGF0ZSkge1xyXG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGhvdFVwZGF0ZSwgaWQpKSB7XHJcbiBcdFx0XHRcdHZhciBtb2R1bGVJZCA9IHRvTW9kdWxlSWQoaWQpO1xyXG4gXHRcdFx0XHR2YXIgcmVzdWx0ID0gZ2V0QWZmZWN0ZWRTdHVmZihtb2R1bGVJZCk7XHJcbiBcdFx0XHRcdGlmKCFyZXN1bHQpIHtcclxuIFx0XHRcdFx0XHRpZihvcHRpb25zLmlnbm9yZVVuYWNjZXB0ZWQpXHJcbiBcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuIFx0XHRcdFx0XHRob3RTZXRTdGF0dXMoXCJhYm9ydFwiKTtcclxuIFx0XHRcdFx0XHRyZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKFwiQWJvcnRlZCBiZWNhdXNlIFwiICsgbW9kdWxlSWQgKyBcIiBpcyBub3QgYWNjZXB0ZWRcIikpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGlmKHJlc3VsdCBpbnN0YW5jZW9mIEVycm9yKSB7XHJcbiBcdFx0XHRcdFx0aG90U2V0U3RhdHVzKFwiYWJvcnRcIik7XHJcbiBcdFx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKHJlc3VsdCk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0YXBwbGllZFVwZGF0ZVttb2R1bGVJZF0gPSBob3RVcGRhdGVbbW9kdWxlSWRdO1xyXG4gXHRcdFx0XHRhZGRBbGxUb1NldChvdXRkYXRlZE1vZHVsZXMsIHJlc3VsdFswXSk7XHJcbiBcdFx0XHRcdGZvcih2YXIgbW9kdWxlSWQgaW4gcmVzdWx0WzFdKSB7XHJcbiBcdFx0XHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJlc3VsdFsxXSwgbW9kdWxlSWQpKSB7XHJcbiBcdFx0XHRcdFx0XHRpZighb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdKVxyXG4gXHRcdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0gPSBbXTtcclxuIFx0XHRcdFx0XHRcdGFkZEFsbFRvU2V0KG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSwgcmVzdWx0WzFdW21vZHVsZUlkXSk7XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBTdG9yZSBzZWxmIGFjY2VwdGVkIG91dGRhdGVkIG1vZHVsZXMgdG8gcmVxdWlyZSB0aGVtIGxhdGVyIGJ5IHRoZSBtb2R1bGUgc3lzdGVtXHJcbiBcdFx0dmFyIG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlcyA9IFtdO1xyXG4gXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBvdXRkYXRlZE1vZHVsZXMubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdHZhciBtb2R1bGVJZCA9IG91dGRhdGVkTW9kdWxlc1tpXTtcclxuIFx0XHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdICYmIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmhvdC5fc2VsZkFjY2VwdGVkKVxyXG4gXHRcdFx0XHRvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMucHVzaCh7XHJcbiBcdFx0XHRcdFx0bW9kdWxlOiBtb2R1bGVJZCxcclxuIFx0XHRcdFx0XHRlcnJvckhhbmRsZXI6IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmhvdC5fc2VsZkFjY2VwdGVkXHJcbiBcdFx0XHRcdH0pO1xyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gTm93IGluIFwiZGlzcG9zZVwiIHBoYXNlXHJcbiBcdFx0aG90U2V0U3RhdHVzKFwiZGlzcG9zZVwiKTtcclxuIFx0XHR2YXIgcXVldWUgPSBvdXRkYXRlZE1vZHVsZXMuc2xpY2UoKTtcclxuIFx0XHR3aGlsZShxdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiBcdFx0XHR2YXIgbW9kdWxlSWQgPSBxdWV1ZS5wb3AoKTtcclxuIFx0XHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHRcdGlmKCFtb2R1bGUpIGNvbnRpbnVlO1xyXG4gXHRcclxuIFx0XHRcdHZhciBkYXRhID0ge307XHJcbiBcdFxyXG4gXHRcdFx0Ly8gQ2FsbCBkaXNwb3NlIGhhbmRsZXJzXHJcbiBcdFx0XHR2YXIgZGlzcG9zZUhhbmRsZXJzID0gbW9kdWxlLmhvdC5fZGlzcG9zZUhhbmRsZXJzO1xyXG4gXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRpc3Bvc2VIYW5kbGVycy5sZW5ndGg7IGorKykge1xyXG4gXHRcdFx0XHR2YXIgY2IgPSBkaXNwb3NlSGFuZGxlcnNbal07XHJcbiBcdFx0XHRcdGNiKGRhdGEpO1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0aG90Q3VycmVudE1vZHVsZURhdGFbbW9kdWxlSWRdID0gZGF0YTtcclxuIFx0XHJcbiBcdFx0XHQvLyBkaXNhYmxlIG1vZHVsZSAodGhpcyBkaXNhYmxlcyByZXF1aXJlcyBmcm9tIHRoaXMgbW9kdWxlKVxyXG4gXHRcdFx0bW9kdWxlLmhvdC5hY3RpdmUgPSBmYWxzZTtcclxuIFx0XHJcbiBcdFx0XHQvLyByZW1vdmUgbW9kdWxlIGZyb20gY2FjaGVcclxuIFx0XHRcdGRlbGV0ZSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHJcbiBcdFx0XHQvLyByZW1vdmUgXCJwYXJlbnRzXCIgcmVmZXJlbmNlcyBmcm9tIGFsbCBjaGlsZHJlblxyXG4gXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IG1vZHVsZS5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xyXG4gXHRcdFx0XHR2YXIgY2hpbGQgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZS5jaGlsZHJlbltqXV07XHJcbiBcdFx0XHRcdGlmKCFjaGlsZCkgY29udGludWU7XHJcbiBcdFx0XHRcdHZhciBpZHggPSBjaGlsZC5wYXJlbnRzLmluZGV4T2YobW9kdWxlSWQpO1xyXG4gXHRcdFx0XHRpZihpZHggPj0gMCkge1xyXG4gXHRcdFx0XHRcdGNoaWxkLnBhcmVudHMuc3BsaWNlKGlkeCwgMSk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIHJlbW92ZSBvdXRkYXRlZCBkZXBlbmRlbmN5IGZyb20gbW9kdWxlIGNoaWxkcmVuXHJcbiBcdFx0Zm9yKHZhciBtb2R1bGVJZCBpbiBvdXRkYXRlZERlcGVuZGVuY2llcykge1xyXG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG91dGRhdGVkRGVwZW5kZW5jaWVzLCBtb2R1bGVJZCkpIHtcclxuIFx0XHRcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0XHR2YXIgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMgPSBvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcy5sZW5ndGg7IGorKykge1xyXG4gXHRcdFx0XHRcdHZhciBkZXBlbmRlbmN5ID0gbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXNbal07XHJcbiBcdFx0XHRcdFx0dmFyIGlkeCA9IG1vZHVsZS5jaGlsZHJlbi5pbmRleE9mKGRlcGVuZGVuY3kpO1xyXG4gXHRcdFx0XHRcdGlmKGlkeCA+PSAwKSBtb2R1bGUuY2hpbGRyZW4uc3BsaWNlKGlkeCwgMSk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIE5vdCBpbiBcImFwcGx5XCIgcGhhc2VcclxuIFx0XHRob3RTZXRTdGF0dXMoXCJhcHBseVwiKTtcclxuIFx0XHJcbiBcdFx0aG90Q3VycmVudEhhc2ggPSBob3RVcGRhdGVOZXdIYXNoO1xyXG4gXHRcclxuIFx0XHQvLyBpbnNlcnQgbmV3IGNvZGVcclxuIFx0XHRmb3IodmFyIG1vZHVsZUlkIGluIGFwcGxpZWRVcGRhdGUpIHtcclxuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhcHBsaWVkVXBkYXRlLCBtb2R1bGVJZCkpIHtcclxuIFx0XHRcdFx0bW9kdWxlc1ttb2R1bGVJZF0gPSBhcHBsaWVkVXBkYXRlW21vZHVsZUlkXTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIGNhbGwgYWNjZXB0IGhhbmRsZXJzXHJcbiBcdFx0dmFyIGVycm9yID0gbnVsbDtcclxuIFx0XHRmb3IodmFyIG1vZHVsZUlkIGluIG91dGRhdGVkRGVwZW5kZW5jaWVzKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob3V0ZGF0ZWREZXBlbmRlbmNpZXMsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRcdHZhciBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcyA9IG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0dmFyIGNhbGxiYWNrcyA9IFtdO1xyXG4gXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdFx0XHR2YXIgZGVwZW5kZW5jeSA9IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzW2ldO1xyXG4gXHRcdFx0XHRcdHZhciBjYiA9IG1vZHVsZS5ob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcGVuZGVuY3ldO1xyXG4gXHRcdFx0XHRcdGlmKGNhbGxiYWNrcy5pbmRleE9mKGNiKSA+PSAwKSBjb250aW51ZTtcclxuIFx0XHRcdFx0XHRjYWxsYmFja3MucHVzaChjYik7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0XHRcdHZhciBjYiA9IGNhbGxiYWNrc1tpXTtcclxuIFx0XHRcdFx0XHR0cnkge1xyXG4gXHRcdFx0XHRcdFx0Y2Iob3V0ZGF0ZWREZXBlbmRlbmNpZXMpO1xyXG4gXHRcdFx0XHRcdH0gY2F0Y2goZXJyKSB7XHJcbiBcdFx0XHRcdFx0XHRpZighZXJyb3IpXHJcbiBcdFx0XHRcdFx0XHRcdGVycm9yID0gZXJyO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gTG9hZCBzZWxmIGFjY2VwdGVkIG1vZHVsZXNcclxuIFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHR2YXIgaXRlbSA9IG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlc1tpXTtcclxuIFx0XHRcdHZhciBtb2R1bGVJZCA9IGl0ZW0ubW9kdWxlO1xyXG4gXHRcdFx0aG90Q3VycmVudFBhcmVudHMgPSBbbW9kdWxlSWRdO1xyXG4gXHRcdFx0dHJ5IHtcclxuIFx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCk7XHJcbiBcdFx0XHR9IGNhdGNoKGVycikge1xyXG4gXHRcdFx0XHRpZih0eXBlb2YgaXRlbS5lcnJvckhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gXHRcdFx0XHRcdHRyeSB7XHJcbiBcdFx0XHRcdFx0XHRpdGVtLmVycm9ySGFuZGxlcihlcnIpO1xyXG4gXHRcdFx0XHRcdH0gY2F0Y2goZXJyKSB7XHJcbiBcdFx0XHRcdFx0XHRpZighZXJyb3IpXHJcbiBcdFx0XHRcdFx0XHRcdGVycm9yID0gZXJyO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fSBlbHNlIGlmKCFlcnJvcilcclxuIFx0XHRcdFx0XHRlcnJvciA9IGVycjtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIGhhbmRsZSBlcnJvcnMgaW4gYWNjZXB0IGhhbmRsZXJzIGFuZCBzZWxmIGFjY2VwdGVkIG1vZHVsZSBsb2FkXHJcbiBcdFx0aWYoZXJyb3IpIHtcclxuIFx0XHRcdGhvdFNldFN0YXR1cyhcImZhaWxcIik7XHJcbiBcdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyb3IpO1xyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0aG90U2V0U3RhdHVzKFwiaWRsZVwiKTtcclxuIFx0XHRjYWxsYmFjayhudWxsLCBvdXRkYXRlZE1vZHVsZXMpO1xyXG4gXHR9XHJcblxuIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlLFxuIFx0XHRcdGhvdDogaG90Q3JlYXRlTW9kdWxlKG1vZHVsZUlkKSxcbiBcdFx0XHRwYXJlbnRzOiBob3RDdXJyZW50UGFyZW50cyxcbiBcdFx0XHRjaGlsZHJlbjogW11cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgaG90Q3JlYXRlUmVxdWlyZShtb2R1bGVJZCkpO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiaHR0cDovL2xvY2FsaG9zdDo1MDAxL1wiO1xuXG4gXHQvLyBfX3dlYnBhY2tfaGFzaF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmggPSBmdW5jdGlvbigpIHsgcmV0dXJuIGhvdEN1cnJlbnRIYXNoOyB9O1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBob3RDcmVhdGVSZXF1aXJlKDApKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgYmY1Y2E5NzAyYjY0MTFlMGZjMzFcbiAqKi8iLCIvKiBnbG9iYWwgJCBqUXVlcnkgQ1BPIENvZGVNaXJyb3Igc3RvcmFnZUFQSSBRIGNyZWF0ZVByb2dyYW1Db2xsZWN0aW9uQVBJIG1ha2VTaGFyZUFQSSAqL1xuXG4vL3ZhciBzaGFyZUFQSSA9IG1ha2VTaGFyZUFQSShwcm9jZXNzLmVudi5DVVJSRU5UX1BZUkVUX1JFTEVBU0UpO1xudmFyIHNoYXJlQVBJID0gbWFrZVNoYXJlQVBJKGVudl9DVVJSRU5UX1BZUkVUX1JFTEVBU0UpO1xuXG52YXIgdXJsID0gcmVxdWlyZSgndXJsLmpzJyk7XG5cbmNvbnN0IExPRyA9IHRydWU7XG53aW5kb3cuY3RfbG9nID0gZnVuY3Rpb24oLyogdmFyYXJncyAqLykge1xuICBpZiAod2luZG93LmNvbnNvbGUgJiYgTE9HKSB7XG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgfVxufTtcblxud2luZG93LmN0X2Vycm9yID0gZnVuY3Rpb24oLyogdmFyYXJncyAqLykge1xuICBpZiAod2luZG93LmNvbnNvbGUgJiYgTE9HKSB7XG4gICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICB9XG59O1xudmFyIGluaXRpYWxQYXJhbXMgPSB1cmwucGFyc2UoZG9jdW1lbnQubG9jYXRpb24uaHJlZik7XG52YXIgcGFyYW1zID0gdXJsLnBhcnNlKFwiLz9cIiArIGluaXRpYWxQYXJhbXNbXCJoYXNoXCJdKTtcbndpbmRvdy5oaWdobGlnaHRNb2RlID0gXCJtY21oXCI7IC8vIHdoYXQgaXMgdGhpcyBmb3I/XG53aW5kb3cuY2xlYXJGbGFzaCA9IGZ1bmN0aW9uKCkge1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikuZW1wdHkoKTtcbn1cbndpbmRvdy5zdGlja0Vycm9yID0gZnVuY3Rpb24obWVzc2FnZSwgbW9yZSkge1xuICBjbGVhckZsYXNoKCk7XG4gIHZhciBlcnIgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJlcnJvclwiKS50ZXh0KG1lc3NhZ2UpO1xuICBpZihtb3JlKSB7XG4gICAgZXJyLmF0dHIoXCJ0aXRsZVwiLCBtb3JlKTtcbiAgfVxuICBlcnIudG9vbHRpcCgpO1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikucHJlcGVuZChlcnIpO1xufTtcbndpbmRvdy5mbGFzaEVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBjbGVhckZsYXNoKCk7XG4gIHZhciBlcnIgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJlcnJvclwiKS50ZXh0KG1lc3NhZ2UpO1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikucHJlcGVuZChlcnIpO1xuICBlcnIuZmFkZU91dCg3MDAwKTtcbn07XG53aW5kb3cuZmxhc2hNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBjbGVhckZsYXNoKCk7XG4gIHZhciBtc2cgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJhY3RpdmVcIikudGV4dChtZXNzYWdlKTtcbiAgJChcIi5ub3RpZmljYXRpb25BcmVhXCIpLnByZXBlbmQobXNnKTtcbiAgbXNnLmZhZGVPdXQoNzAwMCk7XG59O1xud2luZG93LnN0aWNrTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgY2xlYXJGbGFzaCgpO1xuICB2YXIgZXJyID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpLnRleHQobWVzc2FnZSk7XG4gICQoXCIubm90aWZpY2F0aW9uQXJlYVwiKS5wcmVwZW5kKGVycik7XG59O1xud2luZG93Lm1rV2FybmluZ1VwcGVyID0gZnVuY3Rpb24oKXtyZXR1cm4gJChcIjxkaXYgY2xhc3M9J3dhcm5pbmctdXBwZXInPlwiKTt9XG53aW5kb3cubWtXYXJuaW5nTG93ZXIgPSBmdW5jdGlvbigpe3JldHVybiAkKFwiPGRpdiBjbGFzcz0nd2FybmluZy1sb3dlcic+XCIpO31cblxuJCh3aW5kb3cpLmJpbmQoXCJiZWZvcmV1bmxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBcIkJlY2F1c2UgdGhpcyBwYWdlIGNhbiBsb2FkIHNsb3dseSwgYW5kIHlvdSBtYXkgaGF2ZSBvdXRzdGFuZGluZyBjaGFuZ2VzLCB3ZSBhc2sgdGhhdCB5b3UgY29uZmlybSBiZWZvcmUgbGVhdmluZyB0aGUgZWRpdG9yIGluIGNhc2UgY2xvc2luZyB3YXMgYW4gYWNjaWRlbnQuXCI7XG59KTtcblxudmFyIERvY3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICBcbiAgZnVuY3Rpb24gRG9jdW1lbnRzKCkge1xuICAgIHRoaXMuZG9jdW1lbnRzID0gbmV3IE1hcCgpO1xuICB9XG4gIFxuICBEb2N1bWVudHMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnRzLmhhcyhuYW1lKTtcbiAgfTtcblxuICBEb2N1bWVudHMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnRzLmdldChuYW1lKTtcbiAgfTtcblxuICBEb2N1bWVudHMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChuYW1lLCBkb2MpIHtcbiAgICBpZihsb2dnZXIuaXNEZXRhaWxlZClcbiAgICAgIGxvZ2dlci5sb2coXCJkb2Muc2V0XCIsIHtuYW1lOiBuYW1lLCB2YWx1ZTogZG9jLmdldFZhbHVlKCl9KTtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuc2V0KG5hbWUsIGRvYyk7XG4gIH07XG4gIFxuICBEb2N1bWVudHMucHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYobG9nZ2VyLmlzRGV0YWlsZWQpXG4gICAgICBsb2dnZXIubG9nKFwiZG9jLmRlbFwiLCB7bmFtZTogbmFtZX0pO1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50cy5kZWxldGUobmFtZSk7XG4gIH07XG5cbiAgRG9jdW1lbnRzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGYpIHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuZm9yRWFjaChmKTtcbiAgfTtcblxuICByZXR1cm4gRG9jdW1lbnRzO1xufSgpO1xuXG53aW5kb3cuQ1BPID0ge1xuICBzYXZlOiBmdW5jdGlvbigpIHt9LFxuICBhdXRvU2F2ZTogZnVuY3Rpb24oKSB7fSxcbiAgZG9jdW1lbnRzIDogbmV3IERvY3VtZW50cygpXG59O1xuJChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gbWVyZ2Uob2JqLCBleHRlbnNpb24pIHtcbiAgICB2YXIgbmV3b2JqID0ge307XG4gICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICAgIG5ld29ialtrXSA9IG9ialtrXTtcbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhleHRlbnNpb24pLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgICAgbmV3b2JqW2tdID0gZXh0ZW5zaW9uW2tdO1xuICAgIH0pO1xuICAgIHJldHVybiBuZXdvYmo7XG4gIH1cbiAgdmFyIGFuaW1hdGlvbkRpdiA9IG51bGw7XG4gIGZ1bmN0aW9uIGNsb3NlQW5pbWF0aW9uSWZPcGVuKCkge1xuICAgIGlmKGFuaW1hdGlvbkRpdikge1xuICAgICAgYW5pbWF0aW9uRGl2LmVtcHR5KCk7XG4gICAgICBhbmltYXRpb25EaXYuZGlhbG9nKFwiZGVzdHJveVwiKTtcbiAgICAgIGFuaW1hdGlvbkRpdiA9IG51bGw7XG4gICAgfVxuICB9XG4gIENQTy5tYWtlRWRpdG9yID0gZnVuY3Rpb24oY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgdmFyIGluaXRpYWwgPSBcIlwiO1xuICAgIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KFwiaW5pdGlhbFwiKSkge1xuICAgICAgaW5pdGlhbCA9IG9wdGlvbnMuaW5pdGlhbDtcbiAgICB9XG5cbiAgICB2YXIgdGV4dGFyZWEgPSBqUXVlcnkoXCI8dGV4dGFyZWE+XCIpO1xuICAgIHRleHRhcmVhLnZhbChpbml0aWFsKTtcbiAgICBjb250YWluZXIuYXBwZW5kKHRleHRhcmVhKTtcblxuICAgIHZhciBydW5GdW4gPSBmdW5jdGlvbiAoY29kZSwgcmVwbE9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMucnVuKGNvZGUsIHtjbTogQ019LCByZXBsT3B0aW9ucyk7XG4gICAgfTtcblxuICAgIHZhciB1c2VMaW5lTnVtYmVycyA9ICFvcHRpb25zLnNpbXBsZUVkaXRvcjtcbiAgICB2YXIgdXNlRm9sZGluZyA9ICFvcHRpb25zLnNpbXBsZUVkaXRvcjtcblxuICAgIHZhciBndXR0ZXJzID0gIW9wdGlvbnMuc2ltcGxlRWRpdG9yID9cbiAgICAgIFtcIkNvZGVNaXJyb3ItbGluZW51bWJlcnNcIiwgXCJDb2RlTWlycm9yLWZvbGRndXR0ZXJcIl0gOlxuICAgICAgW107XG5cbiAgICBmdW5jdGlvbiByZWluZGVudEFsbExpbmVzKGNtKSB7XG4gICAgICB2YXIgbGFzdCA9IGNtLmxpbmVDb3VudCgpO1xuICAgICAgY20ub3BlcmF0aW9uKGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3Q7ICsraSkgY20uaW5kZW50TGluZShpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBjbU9wdGlvbnMgPSB7XG4gICAgICBleHRyYUtleXM6IHtcbiAgICAgICAgXCJTaGlmdC1FbnRlclwiOiBmdW5jdGlvbihjbSkgeyBydW5GdW4oY20uZ2V0VmFsdWUoKSk7IH0sXG4gICAgICAgIFwiU2hpZnQtQ3RybC1FbnRlclwiOiBmdW5jdGlvbihjbSkgeyBydW5GdW4oY20uZ2V0VmFsdWUoKSk7IH0sXG4gICAgICAgIFwiVGFiXCI6IFwiaW5kZW50QXV0b1wiLFxuICAgICAgICBcIkN0cmwtSVwiOiByZWluZGVudEFsbExpbmVzXG4gICAgICB9LFxuICAgICAgaW5kZW50VW5pdDogMixcbiAgICAgIHRhYlNpemU6IDIsXG4gICAgICB2aWV3cG9ydE1hcmdpbjogSW5maW5pdHksXG4gICAgICBsaW5lTnVtYmVyczogdXNlTGluZU51bWJlcnMsXG4gICAgICBtYXRjaEtleXdvcmRzOiB0cnVlLFxuICAgICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICAgIHN0eWxlU2VsZWN0ZWRUZXh0OiB0cnVlLFxuICAgICAgZm9sZEd1dHRlcjogdXNlRm9sZGluZyxcbiAgICAgIGd1dHRlcnM6IGd1dHRlcnMsXG4gICAgICBsaW5lV3JhcHBpbmc6IHRydWUsXG4gICAgICBsb2dnaW5nOiB0cnVlXG4gICAgfTtcblxuICAgIGNtT3B0aW9ucyA9IG1lcmdlKGNtT3B0aW9ucywgb3B0aW9ucy5jbU9wdGlvbnMgfHwge30pO1xuXG4gICAgdmFyIENNID0gQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEodGV4dGFyZWFbMF0sIGNtT3B0aW9ucyk7XG5cbiAgICB2YXIgQ01ibG9ja3M7XG5cbiAgICBpZiAodHlwZW9mIENvZGVNaXJyb3JCbG9ja3MgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zb2xlLmxvZygnQ29kZU1pcnJvckJsb2NrcyBub3QgZm91bmQnKTtcbiAgICAgIENNYmxvY2tzID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICBDTWJsb2NrcyA9IG5ldyBDb2RlTWlycm9yQmxvY2tzKENNLFxuICAgICAgICAnd2VzY2hlbWUnLFxuICAgICAgICB7XG4gICAgICAgICAgd2lsbEluc2VydE5vZGU6IGZ1bmN0aW9uKHNvdXJjZU5vZGVUZXh0LCBzb3VyY2VOb2RlLCBkZXN0aW5hdGlvbikge1xuICAgICAgICAgICAgdmFyIGxpbmUgPSBDTS5lZGl0b3IuZ2V0TGluZShkZXN0aW5hdGlvbi5saW5lKTtcbiAgICAgICAgICAgIGlmIChkZXN0aW5hdGlvbi5jaCA+IDAgJiYgbGluZVtkZXN0aW5hdGlvbi5jaCAtIDFdLm1hdGNoKC9bXFx3XFxkXS8pKSB7XG4gICAgICAgICAgICAgIC8vIHByZXZpb3VzIGNoYXJhY3RlciBpcyBhIGxldHRlciBvciBudW1iZXIsIHNvIHByZWZpeCBhIHNwYWNlXG4gICAgICAgICAgICAgIHNvdXJjZU5vZGVUZXh0ID0gJyAnICsgc291cmNlTm9kZVRleHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZXN0aW5hdGlvbi5jaCA8IGxpbmUubGVuZ3RoICYmIGxpbmVbZGVzdGluYXRpb24uY2hdLm1hdGNoKC9bXFx3XFxkXS8pKSB7XG4gICAgICAgICAgICAgIC8vIG5leHQgY2hhcmFjdGVyIGlzIGEgbGV0dGVyIG9yIGEgbnVtYmVyLCBzbyBhcHBlbmQgYSBzcGFjZVxuICAgICAgICAgICAgICBzb3VyY2VOb2RlVGV4dCArPSAnICc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc291cmNlTm9kZVRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIENNLmJsb2Nrc0VkaXRvciA9IENNYmxvY2tzO1xuICAgICAgQ00uY2hhbmdlTW9kZSA9IGZ1bmN0aW9uKG1vZGUpIHtcbiAgICAgICAgaWYgKG1vZGUgPT09IFwiZmFsc2VcIikge1xuICAgICAgICAgIG1vZGUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBDTWJsb2Nrcy5hc3QgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIENNYmxvY2tzLnNldEJsb2NrTW9kZShtb2RlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodXNlTGluZU51bWJlcnMpIHtcbiAgICAgIENNLmRpc3BsYXkud3JhcHBlci5hcHBlbmRDaGlsZChta1dhcm5pbmdVcHBlcigpWzBdKTtcbiAgICAgIENNLmRpc3BsYXkud3JhcHBlci5hcHBlbmRDaGlsZChta1dhcm5pbmdMb3dlcigpWzBdKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY206IENNLFxuICAgICAgcmVmcmVzaDogZnVuY3Rpb24oKSB7IENNLnJlZnJlc2goKTsgfSxcbiAgICAgIHJ1bjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJ1bkZ1bihDTS5nZXRWYWx1ZSgpKTtcbiAgICAgIH0sXG4gICAgICBmb2N1czogZnVuY3Rpb24oKSB7IENNLmZvY3VzKCk7IH1cbiAgICB9O1xuICB9O1xuICBDUE8uUlVOX0NPREUgPSBmdW5jdGlvbigpIHtcblxuICB9O1xuXG4gIHN0b3JhZ2VBUEkudGhlbihmdW5jdGlvbihhcGkpIHtcbiAgICBhcGkuY29sbGVjdGlvbi50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgJChcIi5sb2dpbk9ubHlcIikuc2hvdygpO1xuICAgICAgJChcIi5sb2dvdXRPbmx5XCIpLmhpZGUoKTtcbiAgICAgIGFwaS5hcGkuZ2V0Q29sbGVjdGlvbkxpbmsoKS50aGVuKGZ1bmN0aW9uKGxpbmspIHtcbiAgICAgICAgJChcIiNkcml2ZS12aWV3IGFcIikuYXR0cihcImhyZWZcIiwgbGluayk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBhcGkuY29sbGVjdGlvbi5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgJChcIi5sb2dpbk9ubHlcIikuaGlkZSgpO1xuICAgICAgJChcIi5sb2dvdXRPbmx5XCIpLnNob3coKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgc3RvcmFnZUFQSSA9IHN0b3JhZ2VBUEkudGhlbihmdW5jdGlvbihhcGkpIHsgcmV0dXJuIGFwaS5hcGk7IH0pO1xuICAkKFwiI2Nvbm5lY3RCdXR0b25cIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgJChcIiNjb25uZWN0QnV0dG9uXCIpLnRleHQoXCJDb25uZWN0aW5nLi4uXCIpO1xuICAgICQoXCIjY29ubmVjdEJ1dHRvblwiKS5hdHRyKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKTtcbiAgICBzdG9yYWdlQVBJID0gY3JlYXRlUHJvZ3JhbUNvbGxlY3Rpb25BUEkoXCJjb2RlLnB5cmV0Lm9yZ1wiLCBmYWxzZSk7XG4gICAgc3RvcmFnZUFQSS50aGVuKGZ1bmN0aW9uKGFwaSkge1xuICAgICAgYXBpLmNvbGxlY3Rpb24udGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgJChcIi5sb2dpbk9ubHlcIikuc2hvdygpO1xuICAgICAgICAkKFwiLmxvZ291dE9ubHlcIikuaGlkZSgpO1xuICAgICAgICBhcGkuYXBpLmdldENvbGxlY3Rpb25MaW5rKCkudGhlbihmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICAgJChcIiNkcml2ZS12aWV3IGFcIikuYXR0cihcImhyZWZcIiwgbGluayk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZihwYXJhbXNbXCJnZXRcIl0gJiYgcGFyYW1zW1wiZ2V0XCJdW1wicHJvZ3JhbVwiXSkge1xuICAgICAgICAgIHZhciB0b0xvYWQgPSBhcGkuYXBpLmdldEZpbGVCeUlkKHBhcmFtc1tcImdldFwiXVtcInByb2dyYW1cIl0pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiTG9nZ2VkIGluIGFuZCBoYXMgcHJvZ3JhbSB0byBsb2FkOiBcIiwgdG9Mb2FkKTtcbiAgICAgICAgICBsb2FkUHJvZ3JhbSh0b0xvYWQpO1xuICAgICAgICAgIHByb2dyYW1Ub1NhdmUgPSB0b0xvYWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvZ3JhbVRvU2F2ZSA9IFEuZmNhbGwoZnVuY3Rpb24oKSB7IHJldHVybiBudWxsOyB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBhcGkuY29sbGVjdGlvbi5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICAkKFwiI2Nvbm5lY3RCdXR0b25cIikudGV4dChcIkNvbm5lY3QgdG8gR29vZ2xlIERyaXZlXCIpO1xuICAgICAgICAkKFwiI2Nvbm5lY3RCdXR0b25cIikuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHN0b3JhZ2VBUEkgPSBzdG9yYWdlQVBJLnRoZW4oZnVuY3Rpb24oYXBpKSB7IHJldHVybiBhcGkuYXBpOyB9KTtcbiAgfSk7XG5cbiAgdmFyIGNvcHlPblNhdmUgPSBmYWxzZTtcblxuICB2YXIgaW5pdGlhbFByb2dyYW0gPSBzdG9yYWdlQVBJLnRoZW4oZnVuY3Rpb24oYXBpKSB7XG4gICAgdmFyIHByb2dyYW1Mb2FkID0gbnVsbDtcbiAgICBpZihwYXJhbXNbXCJnZXRcIl0gJiYgcGFyYW1zW1wiZ2V0XCJdW1wicHJvZ3JhbVwiXSkge1xuICAgICAgcHJvZ3JhbUxvYWQgPSBhcGkuZ2V0RmlsZUJ5SWQocGFyYW1zW1wiZ2V0XCJdW1wicHJvZ3JhbVwiXSk7XG4gICAgICBwcm9ncmFtTG9hZC50aGVuKGZ1bmN0aW9uKHApIHsgc2hvd1NoYXJlQ29udGFpbmVyKHApOyB9KTtcbiAgICB9XG4gICAgaWYocGFyYW1zW1wiZ2V0XCJdICYmIHBhcmFtc1tcImdldFwiXVtcInNoYXJlXCJdKSB7XG4gICAgICBwcm9ncmFtTG9hZCA9IGFwaS5nZXRTaGFyZWRGaWxlQnlJZChwYXJhbXNbXCJnZXRcIl1bXCJzaGFyZVwiXSk7XG4gICAgICAkKFwiI3NhdmVCdXR0b25cIikudGV4dChcIlNhdmUgYSBDb3B5XCIpO1xuICAgICAgY29weU9uU2F2ZSA9IHRydWU7XG4gICAgfVxuICAgIGlmKHByb2dyYW1Mb2FkKSB7XG4gICAgICBwcm9ncmFtTG9hZC5mYWlsKGZ1bmN0aW9uKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIHdpbmRvdy5zdGlja0Vycm9yKFwiVGhlIHByb2dyYW0gZmFpbGVkIHRvIGxvYWQuXCIpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvZ3JhbUxvYWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2V0VGl0bGUocHJvZ05hbWUpIHtcbiAgICBkb2N1bWVudC50aXRsZSA9IHByb2dOYW1lICsgXCIgLSBjb2RlLnB5cmV0Lm9yZ1wiO1xuICB9XG4gIENQTy5zZXRUaXRsZSA9IHNldFRpdGxlO1xuXG4gICQoXCIjZG93bmxvYWQgYVwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICB2YXIgZG93bmxvYWRFbHQgPSAkKFwiI2Rvd25sb2FkIGFcIik7XG4gICAgdmFyIGNvbnRlbnRzID0gQ1BPLmVkaXRvci5jbS5nZXRWYWx1ZSgpO1xuICAgIHZhciBkb3dubG9hZEJsb2IgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbY29udGVudHNdLCB7dHlwZTogJ3RleHQvcGxhaW4nfSkpO1xuICAgIHZhciBmaWxlbmFtZSA9ICQoXCIjcHJvZ3JhbS1uYW1lXCIpLnZhbCgpO1xuICAgIGlmKCFmaWxlbmFtZSkgeyBmaWxlbmFtZSA9ICd1bnRpdGxlZF9wcm9ncmFtLmFycic7IH1cbiAgICBpZihmaWxlbmFtZS5pbmRleE9mKFwiLmFyclwiKSAhPT0gKGZpbGVuYW1lLmxlbmd0aCAtIDQpKSB7XG4gICAgICBmaWxlbmFtZSArPSBcIi5hcnJcIjtcbiAgICB9XG4gICAgZG93bmxvYWRFbHQuYXR0cih7XG4gICAgICBkb3dubG9hZDogZmlsZW5hbWUsXG4gICAgICBocmVmOiBkb3dubG9hZEJsb2JcbiAgICB9KTtcbiAgICAkKFwiI2Rvd25sb2FkXCIpLmFwcGVuZChkb3dubG9hZEVsdCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGxvYWRQcm9ncmFtKHApIHtcbiAgICByZXR1cm4gcC50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgIGlmKHAgIT09IG51bGwpIHtcbiAgICAgICAgJChcIiNwcm9ncmFtLW5hbWVcIikudmFsKHAuZ2V0TmFtZSgpKTtcbiAgICAgICAgc2V0VGl0bGUocC5nZXROYW1lKCkpO1xuICAgICAgICByZXR1cm4gcC5nZXRDb250ZW50cygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdmFyIHByb2dyYW1Mb2FkZWQgPSBsb2FkUHJvZ3JhbShpbml0aWFsUHJvZ3JhbSk7XG5cbiAgdmFyIHByb2dyYW1Ub1NhdmUgPSBpbml0aWFsUHJvZ3JhbTtcblxuICBmdW5jdGlvbiBzaG93U2hhcmVDb250YWluZXIocCkge1xuICAgICQoXCIjc2hhcmVDb250YWluZXJcIikuZW1wdHkoKTtcbiAgICAkKFwiI3NoYXJlQ29udGFpbmVyXCIpLmFwcGVuZChzaGFyZUFQSS5tYWtlU2hhcmVMaW5rKHApKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5hbWVPclVudGl0bGVkKCkge1xuICAgIHJldHVybiAkKFwiI3Byb2dyYW0tbmFtZVwiKS52YWwoKSB8fCBcIlVudGl0bGVkXCI7XG4gIH1cbiAgZnVuY3Rpb24gYXV0b1NhdmUoKSB7XG4gICAgcHJvZ3JhbVRvU2F2ZS50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgIGlmKHAgIT09IG51bGwgJiYgIWNvcHlPblNhdmUpIHsgc2F2ZSgpOyB9XG4gICAgfSk7XG4gIH1cbiAgQ1BPLmF1dG9TYXZlID0gYXV0b1NhdmU7XG4gIENQTy5zaG93U2hhcmVDb250YWluZXIgPSBzaG93U2hhcmVDb250YWluZXI7XG4gIENQTy5sb2FkUHJvZ3JhbSA9IGxvYWRQcm9ncmFtO1xuXG4gIGZ1bmN0aW9uIHNhdmUoKSB7XG4gICAgd2luZG93LnN0aWNrTWVzc2FnZShcIlNhdmluZy4uLlwiKTtcbiAgICB2YXIgc2F2ZWRQcm9ncmFtID0gcHJvZ3JhbVRvU2F2ZS50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgIGlmKHAgIT09IG51bGwgJiYgIWNvcHlPblNhdmUpIHtcbiAgICAgICAgaWYocC5nZXROYW1lKCkgIT09ICQoXCIjcHJvZ3JhbS1uYW1lXCIpLnZhbCgpKSB7XG4gICAgICAgICAgcHJvZ3JhbVRvU2F2ZSA9IHAucmVuYW1lKG5hbWVPclVudGl0bGVkKCkpLnRoZW4oZnVuY3Rpb24obmV3UCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ld1A7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb2dyYW1Ub1NhdmVcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocCkge1xuICAgICAgICAgIHNob3dTaGFyZUNvbnRhaW5lcihwKTtcbiAgICAgICAgICByZXR1cm4gcC5zYXZlKENQTy5lZGl0b3IuY20uZ2V0VmFsdWUoKSwgZmFsc2UpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihwKSB7XG4gICAgICAgICAgJChcIiNwcm9ncmFtLW5hbWVcIikudmFsKHAuZ2V0TmFtZSgpKTtcbiAgICAgICAgICAkKFwiI3NhdmVCdXR0b25cIikudGV4dChcIlNhdmVcIik7XG4gICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgbnVsbCwgXCIjcHJvZ3JhbT1cIiArIHAuZ2V0VW5pcXVlSWQoKSk7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBcIiNwcm9ncmFtPVwiICsgcC5nZXRVbmlxdWVJZCgpO1xuICAgICAgICAgIHdpbmRvdy5mbGFzaE1lc3NhZ2UoXCJQcm9ncmFtIHNhdmVkIGFzIFwiICsgcC5nZXROYW1lKCkpO1xuICAgICAgICAgIHNldFRpdGxlKHAuZ2V0TmFtZSgpKTtcbiAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIHByb2dyYW1OYW1lID0gJChcIiNwcm9ncmFtLW5hbWVcIikudmFsKCkgfHwgXCJVbnRpdGxlZFwiO1xuICAgICAgICAkKFwiI3Byb2dyYW0tbmFtZVwiKS52YWwocHJvZ3JhbU5hbWUpO1xuICAgICAgICBwcm9ncmFtVG9TYXZlID0gc3RvcmFnZUFQSVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGFwaSkgeyByZXR1cm4gYXBpLmNyZWF0ZUZpbGUocHJvZ3JhbU5hbWUpOyB9KTtcbiAgICAgICAgY29weU9uU2F2ZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gc2F2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNhdmVkUHJvZ3JhbS5mYWlsKGZ1bmN0aW9uKGVycikge1xuICAgICAgd2luZG93LnN0aWNrRXJyb3IoXCJVbmFibGUgdG8gc2F2ZVwiLCBcIllvdXIgaW50ZXJuZXQgY29ubmVjdGlvbiBtYXkgYmUgZG93biwgb3Igc29tZXRoaW5nIGVsc2UgbWlnaHQgYmUgd3Jvbmcgd2l0aCB0aGlzIHNpdGUgb3Igc2F2aW5nIHRvIEdvb2dsZS4gIFlvdSBzaG91bGQgYmFjayB1cCBhbnkgY2hhbmdlcyB0byB0aGlzIHByb2dyYW0gc29tZXdoZXJlIGVsc2UuICBZb3UgY2FuIHRyeSBzYXZpbmcgYWdhaW4gdG8gc2VlIGlmIHRoZSBwcm9ibGVtIHdhcyB0ZW1wb3JhcnksIGFzIHdlbGwuXCIpO1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH0pO1xuICB9XG4gIENQTy5zYXZlID0gc2F2ZTtcbiAgJChcIiNydW5CdXR0b25cIikuY2xpY2soQ1BPLmF1dG9TYXZlKTtcbiAgJChcIiNzYXZlQnV0dG9uXCIpLmNsaWNrKHNhdmUpO1xuICBzaGFyZUFQSS5tYWtlSG92ZXJNZW51KCQoXCIjbWVudVwiKSwgJChcIiNtZW51Q29udGVudHNcIiksIGZhbHNlLCBmdW5jdGlvbigpe30pO1xuXG4gIHZhciBjb2RlQ29udGFpbmVyID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwicmVwbE1haW5cIik7XG4gICQoXCIjbWFpblwiKS5wcmVwZW5kKGNvZGVDb250YWluZXIpO1xuXG4gIENQTy5lZGl0b3IgPSBDUE8ubWFrZUVkaXRvcihjb2RlQ29udGFpbmVyLCB7XG4gICAgcnVuQnV0dG9uOiAkKFwiI3J1bkJ1dHRvblwiKSxcbiAgICBzaW1wbGVFZGl0b3I6IGZhbHNlLFxuICAgIHJ1bjogQ1BPLlJVTl9DT0RFLFxuICAgIGluaXRpYWxHYXM6IDEwMFxuICB9KTtcbiAgQ1BPLmVkaXRvci5jbS5zZXRPcHRpb24oXCJyZWFkT25seVwiLCBcIm5vY3Vyc29yXCIpO1xuICBcbiAgcHJvZ3JhbUxvYWRlZC50aGVuKGZ1bmN0aW9uKGMpIHtcbiAgICBDUE8uZG9jdW1lbnRzLnNldChcImRlZmluaXRpb25zOi8vXCIsIENQTy5lZGl0b3IuY20uZ2V0RG9jKCkpO1xuICAgIFxuICAgIC8vIE5PVEUoam9lKTogQ2xlYXJpbmcgaGlzdG9yeSB0byBhZGRyZXNzIGh0dHBzOi8vZ2l0aHViLmNvbS9icm93bnBsdC9weXJldC1sYW5nL2lzc3Vlcy8zODYsXG4gICAgLy8gaW4gd2hpY2ggdW5kbyBjYW4gcmV2ZXJ0IHRoZSBwcm9ncmFtIGJhY2sgdG8gZW1wdHlcbiAgICBDUE8uZWRpdG9yLmNtLmNsZWFySGlzdG9yeSgpO1xuICAgIENQTy5lZGl0b3IuY20uc2V0VmFsdWUoYyk7XG4gIH0pO1xuXG4gIHByb2dyYW1Mb2FkZWQuZmFpbChmdW5jdGlvbigpIHtcbiAgICBDUE8uZG9jdW1lbnRzLnNldChcImRlZmluaXRpb25zOi8vXCIsIENQTy5lZGl0b3IuY20uZ2V0RG9jKCkpO1xuICB9KTtcblxuICB2YXIgcHlyZXRMb2FkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIGNvbnNvbGUubG9nKCdwcm9jZXNzLmVudiBpcycsIEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52KSk7XG4gIGNvbnNvbGUubG9nKCdwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEIGlzJywgcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCk7XG4gIGNvbnNvbGUubG9nKCdwcm9jZXNzLmVudi5SRURJU0NMT1VEX1VSTCBpcycsIHByb2Nlc3MuZW52LlJFRElTQ0xPVURfVVJMKTtcbiAgY29uc29sZS5sb2coJ3Byb2Nlc3MuZW52LkJBU0VfVVJMIGlzJywgcHJvY2Vzcy5lbnYuQkFTRV9VUkwpO1xuICBjb25zb2xlLmxvZygncHJvY2Vzcy5lbnYuU0VTU0lPTl9TRUNSRVQgaXMnLCBwcm9jZXNzLmVudi5TRVNTSU9OX1NFQ1JFVCk7XG4gIGNvbnNvbGUubG9nKCdwcm9jZXNzLmVudi5DVVJSRU5UX1BZUkVUX1JFTEVBU0UgaXMnLCBwcm9jZXNzLmVudi5DVVJSRU5UX1BZUkVUX1JFTEVBU0UpO1xuICBjb25zb2xlLmxvZygncHJvY2Vzcy5lbnYuUFlSRVQgaXMnLCBwcm9jZXNzLmVudi5QWVJFVCk7XG4gIGNvbnNvbGUubG9nKCdwcm9jZXNzLmVudi5QWVJFVF9SRUxFQVNFX0JBU0UgaXMnLCBwcm9jZXNzLmVudi5QWVJFVF9SRUxFQVNFX0JBU0UpO1xuICBjb25zb2xlLmxvZygnY2xpZW50SWQgaXMnLCBjbGllbnRJZCk7XG4gIC8vY29uc29sZS5sb2cocHJvY2Vzcy5lbnYuUFlSRVQpO1xuICAvL3B5cmV0TG9hZC5zcmMgPSBwcm9jZXNzLmVudi5QWVJFVDtcbiAgY29uc29sZS5sb2coZW52X1BZUkVUKTtcbiAgcHlyZXRMb2FkLnNyYyA9IGVudl9QWVJFVDtcbiAgcHlyZXRMb2FkLnR5cGUgPSBcInRleHQvamF2YXNjcmlwdFwiO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHB5cmV0TG9hZCk7XG4gICQocHlyZXRMb2FkKS5vbihcImVycm9yXCIsIGZ1bmN0aW9uKCkge1xuICAgICQoXCIjbG9hZGVyXCIpLmhpZGUoKTtcbiAgICAkKFwiI3J1blBhcnRcIikuaGlkZSgpO1xuICAgICQoXCIjYnJlYWtCdXR0b25cIikuaGlkZSgpO1xuICAgIHdpbmRvdy5zdGlja0Vycm9yKFwiUHlyZXQgZmFpbGVkIHRvIGxvYWQ7IGNoZWNrIHlvdXIgY29ubmVjdGlvbiBvciB0cnkgcmVmcmVzaGluZyB0aGUgcGFnZS4gIElmIHRoaXMgaGFwcGVucyByZXBlYXRlZGx5LCBwbGVhc2UgcmVwb3J0IGl0IGFzIGEgYnVnLlwiKTtcbiAgfSk7XG5cbiAgcHJvZ3JhbUxvYWRlZC5maW4oZnVuY3Rpb24oKSB7XG4gICAgQ1BPLmVkaXRvci5mb2N1cygpO1xuICAgIENQTy5lZGl0b3IuY20uc2V0T3B0aW9uKFwicmVhZE9ubHlcIiwgZmFsc2UpO1xuICB9KTtcblxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy93ZWIvanMvYmVmb3JlUHlyZXQuanNcbiAqKi8iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG4oZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICB9IGNhdGNoIChlKSB7XG4gICAgY2FjaGVkU2V0VGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBpcyBub3QgZGVmaW5lZCcpO1xuICAgIH1cbiAgfVxuICB0cnkge1xuICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgfVxuICB9XG59ICgpKVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gY2FjaGVkU2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2FjaGVkQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3Byb2Nlc3MvYnJvd3Nlci5qc1xuICoqIG1vZHVsZSBpZCA9IDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMCAxXG4gKiovIiwiLy8gQ29weXJpZ2h0IDIwMTMtMjAxNCBLZXZpbiBDb3hcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICBUaGlzIHNvZnR3YXJlIGlzIHByb3ZpZGVkICdhcy1pcycsIHdpdGhvdXQgYW55IGV4cHJlc3Mgb3IgaW1wbGllZCAgICAgICAgICAgKlxuKiAgd2FycmFudHkuIEluIG5vIGV2ZW50IHdpbGwgdGhlIGF1dGhvcnMgYmUgaGVsZCBsaWFibGUgZm9yIGFueSBkYW1hZ2VzICAgICAgICpcbiogIGFyaXNpbmcgZnJvbSB0aGUgdXNlIG9mIHRoaXMgc29mdHdhcmUuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgUGVybWlzc2lvbiBpcyBncmFudGVkIHRvIGFueW9uZSB0byB1c2UgdGhpcyBzb2Z0d2FyZSBmb3IgYW55IHB1cnBvc2UsICAgICAgICpcbiogIGluY2x1ZGluZyBjb21tZXJjaWFsIGFwcGxpY2F0aW9ucywgYW5kIHRvIGFsdGVyIGl0IGFuZCByZWRpc3RyaWJ1dGUgaXQgICAgICAqXG4qICBmcmVlbHksIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyByZXN0cmljdGlvbnM6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogIDEuIFRoZSBvcmlnaW4gb2YgdGhpcyBzb2Z0d2FyZSBtdXN0IG5vdCBiZSBtaXNyZXByZXNlbnRlZDsgeW91IG11c3Qgbm90ICAgICAqXG4qICAgICBjbGFpbSB0aGF0IHlvdSB3cm90ZSB0aGUgb3JpZ2luYWwgc29mdHdhcmUuIElmIHlvdSB1c2UgdGhpcyBzb2Z0d2FyZSBpbiAgKlxuKiAgICAgYSBwcm9kdWN0LCBhbiBhY2tub3dsZWRnbWVudCBpbiB0aGUgcHJvZHVjdCBkb2N1bWVudGF0aW9uIHdvdWxkIGJlICAgICAgICpcbiogICAgIGFwcHJlY2lhdGVkIGJ1dCBpcyBub3QgcmVxdWlyZWQuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgMi4gQWx0ZXJlZCBzb3VyY2UgdmVyc2lvbnMgbXVzdCBiZSBwbGFpbmx5IG1hcmtlZCBhcyBzdWNoLCBhbmQgbXVzdCBub3QgYmUgICpcbiogICAgIG1pc3JlcHJlc2VudGVkIGFzIGJlaW5nIHRoZSBvcmlnaW5hbCBzb2Z0d2FyZS4gICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgMy4gVGhpcyBub3RpY2UgbWF5IG5vdCBiZSByZW1vdmVkIG9yIGFsdGVyZWQgZnJvbSBhbnkgc291cmNlIGRpc3RyaWJ1dGlvbi4gICpcbiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4rZnVuY3Rpb24oKXtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgYXJyYXkgPSAvXFxbKFteXFxbXSopXFxdJC87XG5cbi8vLyBVUkwgUmVnZXguXG4vKipcbiAqIFRoaXMgcmVnZXggc3BsaXRzIHRoZSBVUkwgaW50byBwYXJ0cy4gIFRoZSBjYXB0dXJlIGdyb3VwcyBjYXRjaCB0aGUgaW1wb3J0YW50XG4gKiBiaXRzLlxuICogXG4gKiBFYWNoIHNlY3Rpb24gaXMgb3B0aW9uYWwsIHNvIHRvIHdvcmsgb24gYW55IHBhcnQgZmluZCB0aGUgY29ycmVjdCB0b3AgbGV2ZWxcbiAqIGAoLi4uKT9gIGFuZCBtZXNzIGFyb3VuZCB3aXRoIGl0LlxuICovXG52YXIgcmVnZXggPSAvXig/OihbYS16XSopOik/KD86XFwvXFwvKT8oPzooW146QF0qKSg/OjooW15AXSopKT9AKT8oW2Etei0uX10rKT8oPzo6KFswLTldKikpPyhcXC9bXj8jXSopPyg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8kL2k7XG4vLyAgICAgICAgICAgICAgIDEgLSBzY2hlbWUgICAgICAgICAgICAgICAgMiAtIHVzZXIgICAgMyA9IHBhc3MgNCAtIGhvc3QgICAgICAgIDUgLSBwb3J0ICA2IC0gcGF0aCAgICAgICAgNyAtIHF1ZXJ5ICAgIDggLSBoYXNoXG5cbnZhciBub3NsYXNoID0gW1wibWFpbHRvXCIsXCJiaXRjb2luXCJdO1xuXG52YXIgc2VsZiA9IHtcblx0LyoqIFBhcnNlIGEgcXVlcnkgc3RyaW5nLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHBhcnNlcyBhIHF1ZXJ5IHN0cmluZyAoc29tZXRpbWVzIGNhbGxlZCB0aGUgc2VhcmNoXG5cdCAqIHN0cmluZykuICBJdCB0YWtlcyBhIHF1ZXJ5IHN0cmluZyBhbmQgcmV0dXJucyBhIG1hcCBvZiB0aGUgcmVzdWx0cy5cblx0ICpcblx0ICogS2V5cyBhcmUgY29uc2lkZXJlZCB0byBiZSBldmVyeXRoaW5nIHVwIHRvIHRoZSBmaXJzdCAnPScgYW5kIHZhbHVlcyBhcmVcblx0ICogZXZlcnl0aGluZyBhZnRlcndvcmRzLiAgU2luY2UgVVJMLWRlY29kaW5nIGlzIGRvbmUgYWZ0ZXIgcGFyc2luZywga2V5c1xuXHQgKiBhbmQgdmFsdWVzIGNhbiBoYXZlIGFueSB2YWx1ZXMsIGhvd2V2ZXIsICc9JyBoYXZlIHRvIGJlIGVuY29kZWQgaW4ga2V5c1xuXHQgKiB3aGlsZSAnPycgYW5kICcmJyBoYXZlIHRvIGJlIGVuY29kZWQgYW55d2hlcmUgKGFzIHRoZXkgZGVsaW1pdCB0aGVcblx0ICoga3YtcGFpcnMpLlxuXHQgKlxuXHQgKiBLZXlzIGFuZCB2YWx1ZXMgd2lsbCBhbHdheXMgYmUgc3RyaW5ncywgZXhjZXB0IGlmIHRoZXJlIGlzIGEga2V5IHdpdGggbm9cblx0ICogJz0nIGluIHdoaWNoIGNhc2UgaXQgd2lsbCBiZSBjb25zaWRlcmVkIGEgZmxhZyBhbmQgd2lsbCBiZSBzZXQgdG8gdHJ1ZS5cblx0ICogTGF0ZXIgdmFsdWVzIHdpbGwgb3ZlcnJpZGUgZWFybGllciB2YWx1ZXMuXG5cdCAqXG5cdCAqIEFycmF5IGtleXMgYXJlIGFsc28gc3VwcG9ydGVkLiAgQnkgZGVmYXVsdCBrZXlzIGluIHRoZSBmb3JtIG9mIGBuYW1lW2ldYFxuXHQgKiB3aWxsIGJlIHJldHVybmVkIGxpa2UgdGhhdCBhcyBzdHJpbmdzLiAgSG93ZXZlciwgaWYgeW91IHNldCB0aGUgYGFycmF5YFxuXHQgKiBmbGFnIGluIHRoZSBvcHRpb25zIG9iamVjdCB0aGV5IHdpbGwgYmUgcGFyc2VkIGludG8gYXJyYXlzLiAgTm90ZSB0aGF0XG5cdCAqIGFsdGhvdWdoIHRoZSBvYmplY3QgcmV0dXJuZWQgaXMgYW4gYEFycmF5YCBvYmplY3QgYWxsIGtleXMgd2lsbCBiZVxuXHQgKiB3cml0dGVuIHRvIGl0LiAgVGhpcyBtZWFucyB0aGF0IGlmIHlvdSBoYXZlIGEga2V5IHN1Y2ggYXMgYGtbZm9yRWFjaF1gXG5cdCAqIGl0IHdpbGwgb3ZlcndyaXRlIHRoZSBgZm9yRWFjaGAgZnVuY3Rpb24gb24gdGhhdCBhcnJheS4gIEFsc28gbm90ZSB0aGF0XG5cdCAqIHN0cmluZyBwcm9wZXJ0aWVzIGFsd2F5cyB0YWtlIHByZWNlZGVuY2Ugb3ZlciBhcnJheSBwcm9wZXJ0aWVzLFxuXHQgKiBpcnJlc3BlY3RpdmUgb2Ygd2hlcmUgdGhleSBhcmUgaW4gdGhlIHF1ZXJ5IHN0cmluZy5cblx0ICpcblx0ICogICB1cmwuZ2V0KFwiYXJyYXlbMV09dGVzdCZhcnJheVtmb29dPWJhclwiLHthcnJheTp0cnVlfSkuYXJyYXlbMV0gID09PSBcInRlc3RcIlxuXHQgKiAgIHVybC5nZXQoXCJhcnJheVsxXT10ZXN0JmFycmF5W2Zvb109YmFyXCIse2FycmF5OnRydWV9KS5hcnJheS5mb28gPT09IFwiYmFyXCJcblx0ICogICB1cmwuZ2V0KFwiYXJyYXk9bm90YW5hcnJheSZhcnJheVswXT0xXCIse2FycmF5OnRydWV9KS5hcnJheSAgICAgID09PSBcIm5vdGFuYXJyYXlcIlxuXHQgKlxuXHQgKiBJZiBhcnJheSBwYXJzaW5nIGlzIGVuYWJsZWQga2V5cyBpbiB0aGUgZm9ybSBvZiBgbmFtZVtdYCB3aWxsXG5cdCAqIGF1dG9tYXRpY2FsbHkgYmUgZ2l2ZW4gdGhlIG5leHQgYXZhaWxhYmxlIGluZGV4LiAgTm90ZSB0aGF0IHRoaXMgY2FuIGJlXG5cdCAqIG92ZXJ3cml0dGVuIHdpdGggbGF0ZXIgdmFsdWVzIGluIHRoZSBxdWVyeSBzdHJpbmcuICBGb3IgdGhpcyByZWFzb24gaXNcblx0ICogaXMgYmVzdCBub3QgdG8gbWl4IHRoZSB0d28gZm9ybWF0cywgYWx0aG91Z2ggaXQgaXMgc2FmZSAoYW5kIG9mdGVuXG5cdCAqIHVzZWZ1bCkgdG8gYWRkIGFuIGF1dG9tYXRpYyBpbmRleCBhcmd1bWVudCB0byB0aGUgZW5kIG9mIGEgcXVlcnkgc3RyaW5nLlxuXHQgKlxuXHQgKiAgIHVybC5nZXQoXCJhW109MCZhW109MSZhWzBdPTJcIiwge2FycmF5OnRydWV9KSAgLT4ge2E6W1wiMlwiLFwiMVwiXX07XG5cdCAqICAgdXJsLmdldChcImFbMF09MCZhWzFdPTEmYVtdPTJcIiwge2FycmF5OnRydWV9KSAtPiB7YTpbXCIwXCIsXCIxXCIsXCIyXCJdfTtcblx0ICpcblx0ICogQHBhcmFte3N0cmluZ30gcSBUaGUgcXVlcnkgc3RyaW5nICh0aGUgcGFydCBhZnRlciB0aGUgJz8nKS5cblx0ICogQHBhcmFte3tmdWxsOmJvb2xlYW4sYXJyYXk6Ym9vbGVhbn09fSBvcHQgT3B0aW9ucy5cblx0ICpcblx0ICogLSBmdWxsOiBJZiBzZXQgYHFgIHdpbGwgYmUgdHJlYXRlZCBhcyBhIGZ1bGwgdXJsIGFuZCBgcWAgd2lsbCBiZSBidWlsdC5cblx0ICogICBieSBjYWxsaW5nICNwYXJzZSB0byByZXRyaWV2ZSB0aGUgcXVlcnkgcG9ydGlvbi5cblx0ICogLSBhcnJheTogSWYgc2V0IGtleXMgaW4gdGhlIGZvcm0gb2YgYGtleVtpXWAgd2lsbCBiZSB0cmVhdGVkXG5cdCAqICAgYXMgYXJyYXlzL21hcHMuXG5cdCAqXG5cdCAqIEByZXR1cm57IU9iamVjdC48c3RyaW5nLCBzdHJpbmd8QXJyYXk+fSBUaGUgcGFyc2VkIHJlc3VsdC5cblx0ICovXG5cdFwiZ2V0XCI6IGZ1bmN0aW9uKHEsIG9wdCl7XG5cdFx0cSA9IHEgfHwgXCJcIjtcblx0XHRpZiAoIHR5cGVvZiBvcHQgICAgICAgICAgPT0gXCJ1bmRlZmluZWRcIiApIG9wdCA9IHt9O1xuXHRcdGlmICggdHlwZW9mIG9wdFtcImZ1bGxcIl0gID09IFwidW5kZWZpbmVkXCIgKSBvcHRbXCJmdWxsXCJdID0gZmFsc2U7XG5cdFx0aWYgKCB0eXBlb2Ygb3B0W1wiYXJyYXlcIl0gPT0gXCJ1bmRlZmluZWRcIiApIG9wdFtcImFycmF5XCJdID0gZmFsc2U7XG5cdFx0XG5cdFx0aWYgKCBvcHRbXCJmdWxsXCJdID09PSB0cnVlIClcblx0XHR7XG5cdFx0XHRxID0gc2VsZltcInBhcnNlXCJdKHEsIHtcImdldFwiOmZhbHNlfSlbXCJxdWVyeVwiXSB8fCBcIlwiO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgbyA9IHt9O1xuXHRcdFxuXHRcdHZhciBjID0gcS5zcGxpdChcIiZcIik7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghY1tpXS5sZW5ndGgpIGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHR2YXIgZCA9IGNbaV0uaW5kZXhPZihcIj1cIik7XG5cdFx0XHR2YXIgayA9IGNbaV0sIHYgPSB0cnVlO1xuXHRcdFx0aWYgKCBkID49IDAgKVxuXHRcdFx0e1xuXHRcdFx0XHRrID0gY1tpXS5zdWJzdHIoMCwgZCk7XG5cdFx0XHRcdHYgPSBjW2ldLnN1YnN0cihkKzEpO1xuXHRcdFx0XHRcblx0XHRcdFx0diA9IGRlY29kZVVSSUNvbXBvbmVudCh2KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKG9wdFtcImFycmF5XCJdKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgaW5kcyA9IFtdO1xuXHRcdFx0XHR2YXIgaW5kO1xuXHRcdFx0XHR2YXIgY3VybyA9IG87XG5cdFx0XHRcdHZhciBjdXJrID0gaztcblx0XHRcdFx0d2hpbGUgKGluZCA9IGN1cmsubWF0Y2goYXJyYXkpKSAvLyBBcnJheSFcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGN1cmsgPSBjdXJrLnN1YnN0cigwLCBpbmQuaW5kZXgpO1xuXHRcdFx0XHRcdGluZHMudW5zaGlmdChkZWNvZGVVUklDb21wb25lbnQoaW5kWzFdKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y3VyayA9IGRlY29kZVVSSUNvbXBvbmVudChjdXJrKTtcblx0XHRcdFx0aWYgKGluZHMuc29tZShmdW5jdGlvbihpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKCB0eXBlb2YgY3Vyb1tjdXJrXSA9PSBcInVuZGVmaW5lZFwiICkgY3Vyb1tjdXJrXSA9IFtdO1xuXHRcdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShjdXJvW2N1cmtdKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwidXJsLmdldDogQXJyYXkgcHJvcGVydHkgXCIrY3VyaytcIiBhbHJlYWR5IGV4aXN0cyBhcyBzdHJpbmchXCIpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGN1cm8gPSBjdXJvW2N1cmtdO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmICggaSA9PT0gXCJcIiApIGkgPSBjdXJvLmxlbmd0aDtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjdXJrID0gaTtcblx0XHRcdFx0fSkpIGNvbnRpbnVlO1xuXHRcdFx0XHRjdXJvW2N1cmtdID0gdjtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGsgPSBkZWNvZGVVUklDb21wb25lbnQoayk7XG5cdFx0XHRcblx0XHRcdC8vdHlwZW9mIG9ba10gPT0gXCJ1bmRlZmluZWRcIiB8fCBjb25zb2xlLmxvZyhcIlByb3BlcnR5IFwiK2srXCIgYWxyZWFkeSBleGlzdHMhXCIpO1xuXHRcdFx0b1trXSA9IHY7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBvO1xuXHR9LFxuXHRcblx0LyoqIEJ1aWxkIGEgZ2V0IHF1ZXJ5IGZyb20gYW4gb2JqZWN0LlxuXHQgKlxuXHQgKiBUaGlzIGNvbnN0cnVjdHMgYSBxdWVyeSBzdHJpbmcgZnJvbSB0aGUga3YgcGFpcnMgaW4gYGRhdGFgLiAgQ2FsbGluZ1xuXHQgKiAjZ2V0IG9uIHRoZSBzdHJpbmcgcmV0dXJuZWQgc2hvdWxkIHJldHVybiBhbiBvYmplY3QgaWRlbnRpY2FsIHRvIHRoZSBvbmVcblx0ICogcGFzc2VkIGluIGV4Y2VwdCBhbGwgbm9uLWJvb2xlYW4gc2NhbGFyIHR5cGVzIGJlY29tZSBzdHJpbmdzIGFuZCBhbGxcblx0ICogb2JqZWN0IHR5cGVzIGJlY29tZSBhcnJheXMgKG5vbi1pbnRlZ2VyIGtleXMgYXJlIHN0aWxsIHByZXNlbnQsIHNlZVxuXHQgKiAjZ2V0J3MgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBkZXRhaWxzKS5cblx0ICpcblx0ICogVGhpcyBhbHdheXMgdXNlcyBhcnJheSBzeW50YXggZm9yIGRlc2NyaWJpbmcgYXJyYXlzLiAgSWYgeW91IHdhbnQgdG9cblx0ICogc2VyaWFsaXplIHRoZW0gZGlmZmVyZW50bHkgKGxpa2UgaGF2aW5nIHRoZSB2YWx1ZSBiZSBhIEpTT04gYXJyYXkgYW5kXG5cdCAqIGhhdmUgYSBwbGFpbiBrZXkpIHlvdSB3aWxsIG5lZWQgdG8gZG8gdGhhdCBiZWZvcmUgcGFzc2luZyBpdCBpbi5cblx0ICpcblx0ICogQWxsIGtleXMgYW5kIHZhbHVlcyBhcmUgc3VwcG9ydGVkIChiaW5hcnkgZGF0YSBhbnlvbmU/KSBhcyB0aGV5IGFyZVxuXHQgKiBwcm9wZXJseSBVUkwtZW5jb2RlZCBhbmQgI2dldCBwcm9wZXJseSBkZWNvZGVzLlxuXHQgKlxuXHQgKiBAcGFyYW17T2JqZWN0fSBkYXRhIFRoZSBrdiBwYWlycy5cblx0ICogQHBhcmFte3N0cmluZ30gcHJlZml4IFRoZSBwcm9wZXJseSBlbmNvZGVkIGFycmF5IGtleSB0byBwdXQgdGhlXG5cdCAqICAgcHJvcGVydGllcy4gIE1haW5seSBpbnRlbmRlZCBmb3IgaW50ZXJuYWwgdXNlLlxuXHQgKiBAcmV0dXJue3N0cmluZ30gQSBVUkwtc2FmZSBzdHJpbmcuXG5cdCAqL1xuXHRcImJ1aWxkZ2V0XCI6IGZ1bmN0aW9uKGRhdGEsIHByZWZpeCl7XG5cdFx0dmFyIGl0bXMgPSBbXTtcblx0XHRmb3IgKCB2YXIgayBpbiBkYXRhIClcblx0XHR7XG5cdFx0XHR2YXIgZWsgPSBlbmNvZGVVUklDb21wb25lbnQoayk7XG5cdFx0XHRpZiAoIHR5cGVvZiBwcmVmaXggIT0gXCJ1bmRlZmluZWRcIiApXG5cdFx0XHRcdGVrID0gcHJlZml4K1wiW1wiK2VrK1wiXVwiO1xuXHRcdFx0XG5cdFx0XHR2YXIgdiA9IGRhdGFba107XG5cdFx0XHRcblx0XHRcdHN3aXRjaCAodHlwZW9mIHYpXG5cdFx0XHR7XG5cdFx0XHRcdGNhc2UgJ2Jvb2xlYW4nOlxuXHRcdFx0XHRcdGlmKHYpIGl0bXMucHVzaChlayk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ251bWJlcic6XG5cdFx0XHRcdFx0diA9IHYudG9TdHJpbmcoKTtcblx0XHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0XHRpdG1zLnB1c2goZWsrXCI9XCIrZW5jb2RlVVJJQ29tcG9uZW50KHYpKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnb2JqZWN0Jzpcblx0XHRcdFx0XHRpdG1zLnB1c2goc2VsZltcImJ1aWxkZ2V0XCJdKHYsIGVrKSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpdG1zLmpvaW4oXCImXCIpO1xuXHR9LFxuXHRcblx0LyoqIFBhcnNlIGEgVVJMXG5cdCAqIFxuXHQgKiBUaGlzIGJyZWFrcyB1cCBhIFVSTCBpbnRvIGNvbXBvbmVudHMuICBJdCBhdHRlbXB0cyB0byBiZSB2ZXJ5IGxpYmVyYWxcblx0ICogYW5kIHJldHVybnMgdGhlIGJlc3QgcmVzdWx0IGluIG1vc3QgY2FzZXMuICBUaGlzIG1lYW5zIHRoYXQgeW91IGNhblxuXHQgKiBvZnRlbiBwYXNzIGluIHBhcnQgb2YgYSBVUkwgYW5kIGdldCBjb3JyZWN0IGNhdGVnb3JpZXMgYmFjay4gIE5vdGFibHksXG5cdCAqIHRoaXMgd29ya3MgZm9yIGVtYWlscyBhbmQgSmFiYmVyIElEcywgYXMgd2VsbCBhcyBhZGRpbmcgYSAnPycgdG8gdGhlXG5cdCAqIGJlZ2lubmluZyBvZiBhIHN0cmluZyB3aWxsIHBhcnNlIHRoZSB3aG9sZSB0aGluZyBhcyBhIHF1ZXJ5IHN0cmluZy4gIElmXG5cdCAqIGFuIGl0ZW0gaXMgbm90IGZvdW5kIHRoZSBwcm9wZXJ0eSB3aWxsIGJlIHVuZGVmaW5lZC4gIEluIHNvbWUgY2FzZXMgYW5cblx0ICogZW1wdHkgc3RyaW5nIHdpbGwgYmUgcmV0dXJuZWQgaWYgdGhlIHN1cnJvdW5kaW5nIHN5bnRheCBidXQgdGhlIGFjdHVhbFxuXHQgKiB2YWx1ZSBpcyBlbXB0eSAoZXhhbXBsZTogXCI6Ly9leGFtcGxlLmNvbVwiIHdpbGwgZ2l2ZSBhIGVtcHR5IHN0cmluZyBmb3Jcblx0ICogc2NoZW1lLikgIE5vdGFibHkgdGhlIGhvc3QgbmFtZSB3aWxsIGFsd2F5cyBiZSBzZXQgdG8gc29tZXRoaW5nLlxuXHQgKiBcblx0ICogUmV0dXJuZWQgcHJvcGVydGllcy5cblx0ICogXG5cdCAqIC0gKipzY2hlbWU6KiogVGhlIHVybCBzY2hlbWUuIChleDogXCJtYWlsdG9cIiBvciBcImh0dHBzXCIpXG5cdCAqIC0gKip1c2VyOioqIFRoZSB1c2VybmFtZS5cblx0ICogLSAqKnBhc3M6KiogVGhlIHBhc3N3b3JkLlxuXHQgKiAtICoqaG9zdDoqKiBUaGUgaG9zdG5hbWUuIChleDogXCJsb2NhbGhvc3RcIiwgXCIxMjMuNDU2LjcuOFwiIG9yIFwiZXhhbXBsZS5jb21cIilcblx0ICogLSAqKnBvcnQ6KiogVGhlIHBvcnQsIGFzIGEgbnVtYmVyLiAoZXg6IDEzMzcpXG5cdCAqIC0gKipwYXRoOioqIFRoZSBwYXRoLiAoZXg6IFwiL1wiIG9yIFwiL2Fib3V0Lmh0bWxcIilcblx0ICogLSAqKnF1ZXJ5OioqIFwiVGhlIHF1ZXJ5IHN0cmluZy4gKGV4OiBcImZvbz1iYXImdj0xNyZmb3JtYXQ9anNvblwiKVxuXHQgKiAtICoqZ2V0OioqIFRoZSBxdWVyeSBzdHJpbmcgcGFyc2VkIHdpdGggZ2V0LiAgSWYgYG9wdC5nZXRgIGlzIGBmYWxzZWAgdGhpc1xuXHQgKiAgIHdpbGwgYmUgYWJzZW50XG5cdCAqIC0gKipoYXNoOioqIFRoZSB2YWx1ZSBhZnRlciB0aGUgaGFzaC4gKGV4OiBcIm15YW5jaG9yXCIpXG5cdCAqICAgYmUgdW5kZWZpbmVkIGV2ZW4gaWYgYHF1ZXJ5YCBpcyBzZXQuXG5cdCAqXG5cdCAqIEBwYXJhbXtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHBhcnNlLlxuXHQgKiBAcGFyYW17e2dldDpPYmplY3R9PX0gb3B0IE9wdGlvbnM6XG5cdCAqXG5cdCAqIC0gZ2V0OiBBbiBvcHRpb25zIGFyZ3VtZW50IHRvIGJlIHBhc3NlZCB0byAjZ2V0IG9yIGZhbHNlIHRvIG5vdCBjYWxsICNnZXQuXG5cdCAqICAgICoqRE8gTk9UKiogc2V0IGBmdWxsYC5cblx0ICpcblx0ICogQHJldHVybnshT2JqZWN0fSBBbiBvYmplY3Qgd2l0aCB0aGUgcGFyc2VkIHZhbHVlcy5cblx0ICovXG5cdFwicGFyc2VcIjogZnVuY3Rpb24odXJsLCBvcHQpIHtcblx0XHRcblx0XHRpZiAoIHR5cGVvZiBvcHQgPT0gXCJ1bmRlZmluZWRcIiApIG9wdCA9IHt9O1xuXHRcdFxuXHRcdHZhciBtZCA9IHVybC5tYXRjaChyZWdleCkgfHwgW107XG5cdFx0XG5cdFx0dmFyIHIgPSB7XG5cdFx0XHRcInVybFwiOiAgICB1cmwsXG5cdFx0XHRcblx0XHRcdFwic2NoZW1lXCI6IG1kWzFdLFxuXHRcdFx0XCJ1c2VyXCI6ICAgbWRbMl0sXG5cdFx0XHRcInBhc3NcIjogICBtZFszXSxcblx0XHRcdFwiaG9zdFwiOiAgIG1kWzRdLFxuXHRcdFx0XCJwb3J0XCI6ICAgbWRbNV0gJiYgK21kWzVdLFxuXHRcdFx0XCJwYXRoXCI6ICAgbWRbNl0sXG5cdFx0XHRcInF1ZXJ5XCI6ICBtZFs3XSxcblx0XHRcdFwiaGFzaFwiOiAgIG1kWzhdLFxuXHRcdH07XG5cdFx0XG5cdFx0aWYgKCBvcHQuZ2V0ICE9PSBmYWxzZSApXG5cdFx0XHRyW1wiZ2V0XCJdID0gcltcInF1ZXJ5XCJdICYmIHNlbGZbXCJnZXRcIl0ocltcInF1ZXJ5XCJdLCBvcHQuZ2V0KTtcblx0XHRcblx0XHRyZXR1cm4gcjtcblx0fSxcblx0XG5cdC8qKiBCdWlsZCBhIFVSTCBmcm9tIGNvbXBvbmVudHMuXG5cdCAqIFxuXHQgKiBUaGlzIHBpZWNlcyB0b2dldGhlciBhIHVybCBmcm9tIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBwYXNzZWQgaW4gb2JqZWN0LlxuXHQgKiBJbiBnZW5lcmFsIHBhc3NpbmcgdGhlIHJlc3VsdCBvZiBgcGFyc2UoKWAgc2hvdWxkIHJldHVybiB0aGUgVVJMLiAgVGhlcmVcblx0ICogbWF5IGRpZmZlcmVuY2VzIGluIHRoZSBnZXQgc3RyaW5nIGFzIHRoZSBrZXlzIGFuZCB2YWx1ZXMgbWlnaHQgYmUgbW9yZVxuXHQgKiBlbmNvZGVkIHRoZW4gdGhleSB3ZXJlIG9yaWdpbmFsbHkgd2VyZS4gIEhvd2V2ZXIsIGNhbGxpbmcgYGdldCgpYCBvbiB0aGVcblx0ICogdHdvIHZhbHVlcyBzaG91bGQgeWllbGQgdGhlIHNhbWUgcmVzdWx0LlxuXHQgKiBcblx0ICogSGVyZSBpcyBob3cgdGhlIHBhcmFtZXRlcnMgYXJlIHVzZWQuXG5cdCAqIFxuXHQgKiAgLSB1cmw6IFVzZWQgb25seSBpZiBubyBvdGhlciB2YWx1ZXMgYXJlIHByb3ZpZGVkLiAgSWYgdGhhdCBpcyB0aGUgY2FzZVxuXHQgKiAgICAgYHVybGAgd2lsbCBiZSByZXR1cm5lZCB2ZXJiYXRpbS5cblx0ICogIC0gc2NoZW1lOiBVc2VkIGlmIGRlZmluZWQuXG5cdCAqICAtIHVzZXI6IFVzZWQgaWYgZGVmaW5lZC5cblx0ICogIC0gcGFzczogVXNlZCBpZiBkZWZpbmVkLlxuXHQgKiAgLSBob3N0OiBVc2VkIGlmIGRlZmluZWQuXG5cdCAqICAtIHBhdGg6IFVzZWQgaWYgZGVmaW5lZC5cblx0ICogIC0gcXVlcnk6IFVzZWQgb25seSBpZiBgZ2V0YCBpcyBub3QgcHJvdmlkZWQgYW5kIG5vbi1lbXB0eS5cblx0ICogIC0gZ2V0OiBVc2VkIGlmIG5vbi1lbXB0eS4gIFBhc3NlZCB0byAjYnVpbGRnZXQgYW5kIHRoZSByZXN1bHQgaXMgdXNlZFxuXHQgKiAgICBhcyB0aGUgcXVlcnkgc3RyaW5nLlxuXHQgKiAgLSBoYXNoOiBVc2VkIGlmIGRlZmluZWQuXG5cdCAqIFxuXHQgKiBUaGVzZSBhcmUgdGhlIG9wdGlvbnMgdGhhdCBhcmUgdmFsaWQgb24gdGhlIG9wdGlvbnMgb2JqZWN0LlxuXHQgKiBcblx0ICogIC0gdXNlZW1wdHlnZXQ6IElmIHRydXRoeSwgYSBxdWVzdGlvbiBtYXJrIHdpbGwgYmUgYXBwZW5kZWQgZm9yIGVtcHR5IGdldFxuXHQgKiAgICBzdHJpbmdzLiAgVGhpcyBub3RhYmx5IG1ha2VzIGBidWlsZCgpYCBhbmQgYHBhcnNlKClgIGZ1bGx5IHN5bW1ldHJpYy5cblx0ICpcblx0ICogQHBhcmFte09iamVjdH0gZGF0YSBUaGUgcGllY2VzIG9mIHRoZSBVUkwuXG5cdCAqIEBwYXJhbXtPYmplY3R9IG9wdCBPcHRpb25zIGZvciBidWlsZGluZyB0aGUgdXJsLlxuXHQgKiBAcmV0dXJue3N0cmluZ30gVGhlIFVSTC5cblx0ICovXG5cdFwiYnVpbGRcIjogZnVuY3Rpb24oZGF0YSwgb3B0KXtcblx0XHRvcHQgPSBvcHQgfHwge307XG5cdFx0XG5cdFx0dmFyIHIgPSBcIlwiO1xuXHRcdFxuXHRcdGlmICggdHlwZW9mIGRhdGFbXCJzY2hlbWVcIl0gIT0gXCJ1bmRlZmluZWRcIiApXG5cdFx0e1xuXHRcdFx0ciArPSBkYXRhW1wic2NoZW1lXCJdO1xuXHRcdFx0ciArPSAobm9zbGFzaC5pbmRleE9mKGRhdGFbXCJzY2hlbWVcIl0pPj0wKT9cIjpcIjpcIjovL1wiO1xuXHRcdH1cblx0XHRpZiAoIHR5cGVvZiBkYXRhW1widXNlclwiXSAhPSBcInVuZGVmaW5lZFwiIClcblx0XHR7XG5cdFx0XHRyICs9IGRhdGFbXCJ1c2VyXCJdO1xuXHRcdFx0aWYgKCB0eXBlb2YgZGF0YVtcInBhc3NcIl0gPT0gXCJ1bmRlZmluZWRcIiApXG5cdFx0XHR7XG5cdFx0XHRcdHIgKz0gXCJAXCI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICggdHlwZW9mIGRhdGFbXCJwYXNzXCJdICE9IFwidW5kZWZpbmVkXCIgKSByICs9IFwiOlwiICsgZGF0YVtcInBhc3NcIl0gKyBcIkBcIjtcblx0XHRpZiAoIHR5cGVvZiBkYXRhW1wiaG9zdFwiXSAhPSBcInVuZGVmaW5lZFwiICkgciArPSBkYXRhW1wiaG9zdFwiXTtcblx0XHRpZiAoIHR5cGVvZiBkYXRhW1wicG9ydFwiXSAhPSBcInVuZGVmaW5lZFwiICkgciArPSBcIjpcIiArIGRhdGFbXCJwb3J0XCJdO1xuXHRcdGlmICggdHlwZW9mIGRhdGFbXCJwYXRoXCJdICE9IFwidW5kZWZpbmVkXCIgKSByICs9IGRhdGFbXCJwYXRoXCJdO1xuXHRcdFxuXHRcdGlmIChvcHRbXCJ1c2VlbXB0eWdldFwiXSlcblx0XHR7XG5cdFx0XHRpZiAgICAgICggdHlwZW9mIGRhdGFbXCJnZXRcIl0gICAhPSBcInVuZGVmaW5lZFwiICkgciArPSBcIj9cIiArIHNlbGZbXCJidWlsZGdldFwiXShkYXRhW1wiZ2V0XCJdKTtcblx0XHRcdGVsc2UgaWYgKCB0eXBlb2YgZGF0YVtcInF1ZXJ5XCJdICE9IFwidW5kZWZpbmVkXCIgKSByICs9IFwiP1wiICsgZGF0YVtcInF1ZXJ5XCJdO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0Ly8gSWYgLmdldCB1c2UgaXQuICBJZiAuZ2V0IGxlYWRzIHRvIGVtcHR5LCB1c2UgLnF1ZXJ5LlxuXHRcdFx0dmFyIHEgPSBkYXRhW1wiZ2V0XCJdICYmIHNlbGZbXCJidWlsZGdldFwiXShkYXRhW1wiZ2V0XCJdKSB8fCBkYXRhW1wicXVlcnlcIl07XG5cdFx0XHRpZiAocSkgciArPSBcIj9cIiArIHE7XG5cdFx0fVxuXHRcdFxuXHRcdGlmICggdHlwZW9mIGRhdGFbXCJoYXNoXCJdICE9IFwidW5kZWZpbmVkXCIgKSByICs9IFwiI1wiICsgZGF0YVtcImhhc2hcIl07XG5cdFx0XG5cdFx0cmV0dXJuIHIgfHwgZGF0YVtcInVybFwiXSB8fCBcIlwiO1xuXHR9LFxufTtcblxuaWYgKCB0eXBlb2YgZGVmaW5lICE9IFwidW5kZWZpbmVkXCIgJiYgZGVmaW5lW1wiYW1kXCJdICkgZGVmaW5lKHNlbGYpO1xuZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiApIG1vZHVsZVsnZXhwb3J0cyddID0gc2VsZjtcbmVsc2Ugd2luZG93W1widXJsXCJdID0gc2VsZjtcblxufSgpO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vdXJsLmpzL3VybC5qc1xuICoqIG1vZHVsZSBpZCA9IDJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kdWxlKSB7XHJcblx0aWYoIW1vZHVsZS53ZWJwYWNrUG9seWZpbGwpIHtcclxuXHRcdG1vZHVsZS5kZXByZWNhdGUgPSBmdW5jdGlvbigpIHt9O1xyXG5cdFx0bW9kdWxlLnBhdGhzID0gW107XHJcblx0XHQvLyBtb2R1bGUucGFyZW50ID0gdW5kZWZpbmVkIGJ5IGRlZmF1bHRcclxuXHRcdG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xyXG5cdFx0bW9kdWxlLndlYnBhY2tQb2x5ZmlsbCA9IDE7XHJcblx0fVxyXG5cdHJldHVybiBtb2R1bGU7XHJcbn1cclxuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAod2VicGFjaykvYnVpbGRpbi9tb2R1bGUuanNcbiAqKiBtb2R1bGUgaWQgPSAzXG4gKiogbW9kdWxlIGNodW5rcyA9IDAgMVxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7IHRocm93IG5ldyBFcnJvcihcImRlZmluZSBjYW5ub3QgYmUgdXNlZCBpbmRpcmVjdFwiKTsgfTtcclxuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAod2VicGFjaykvYnVpbGRpbi9hbWQtZGVmaW5lLmpzXG4gKiogbW9kdWxlIGlkID0gNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwIDFcbiAqKi8iXSwic291cmNlUm9vdCI6IiJ9