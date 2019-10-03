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
/******/ 	var hotCurrentHash = "a7e1259b4b4be0914c15"; // eslint-disable-line no-unused-vars
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
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	/* global $ jQuery CPO CodeMirror storageAPI Q createProgramCollectionAPI makeShareAPI */

	var connected = false; // Are you connected to google drive


	var shareAPI = makeShareAPI((""));
	
	var url = __webpack_require__(2);
	var modalPrompt = __webpack_require__(5);
	window.modalPrompt = modalPrompt;
	
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
	  CPO.sayAndForget(message);
	  clearFlash();
	  var err = $("<div>").addClass("error").text(message);
	  if (more) {
	    err.attr("title", more);
	  }
	  err.tooltip();
	  $(".notificationArea").prepend(err);
	};
	window.flashError = function (message) {
	  CPO.sayAndForget(message);
	  clearFlash();
	  var err = $("<div>").addClass("error").text(message);
	  $(".notificationArea").prepend(err);
	  err.fadeOut(7000);
	};
	window.flashMessage = function (message) {
	  CPO.sayAndForget(message);
	  clearFlash();
	  var msg = $("<div>").addClass("active").text(message);
	  $(".notificationArea").prepend(msg);
	  msg.fadeOut(7000);
	};
	window.stickMessage = function (message) {
	  CPO.sayAndForget(message);
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
	
	var VERSION_CHECK_INTERVAL = 120000 + 30000 * Math.random();
	
	function checkVersion() {
	  $.get("/current-version").then(function (resp) {
	    resp = JSON.parse(resp);
	    if (resp.version && resp.version !== ("")) {
	      window.flashMessage("A new version of Pyret is available. Save and reload the page to get the newest version.");
	    }
	  });
	}
	window.setInterval(checkVersion, VERSION_CHECK_INTERVAL);
	
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
	
	    var textarea = jQuery("<textarea aria-hidden='true'>");
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
	
	    // place a vertical line at character 80 in code editor, and not repl
	    var CODE_LINE_WIDTH = 100;
	
	    var rulers, rulersMinCol;
	    if (options.simpleEditor) {
	      rulers = [];
	    } else {
	      rulers = [{ color: "#317BCF", column: CODE_LINE_WIDTH, lineStyle: "dashed", className: "hidden" }];
	      rulersMinCol = CODE_LINE_WIDTH;
	    }
	
	    var cmOptions = {
	      extraKeys: CodeMirror.normalizeKeyMap({
	        "Shift-Enter": function ShiftEnter(cm) {
	          runFun(cm.getValue());
	        },
	        "Shift-Ctrl-Enter": function ShiftCtrlEnter(cm) {
	          runFun(cm.getValue());
	        },
	        "Tab": "indentAuto",
	        "Ctrl-I": reindentAllLines,
	        "Esc Left": "goBackwardSexp",
	        "Alt-Left": "goBackwardSexp",
	        "Esc Right": "goForwardSexp",
	        "Alt-Right": "goForwardSexp",
	        "Ctrl-Left": "goBackwardToken",
	        "Ctrl-Right": "goForwardToken"
	      }),
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
	      logging: true,
	      rulers: rulers,
	      rulersMinCol: rulersMinCol
	    };
	
	    cmOptions = merge(cmOptions, options.cmOptions || {});
	
	    var CM = CodeMirror.fromTextArea(textarea[0], cmOptions);
	
	    if (useLineNumbers) {
	      CM.display.wrapper.appendChild(mkWarningUpper()[0]);
	      CM.display.wrapper.appendChild(mkWarningLower()[0]);
	    }
	
	    getTopTierMenuitems();
	
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
	      },
	      focusCarousel: null //initFocusCarousel
	    };
	  };
	  CPO.RUN_CODE = function () {
	    console.log("Running before ready", arguments);
	  };
	
	  function setUsername(target) {
	    return gwrap.load({ name: 'plus',
	      version: 'v1'
	    }).then(function (api) {
	      api.people.get({ userId: "me" }).then(function (user) {
	        var name = user.displayName;
	        if (user.emails && user.emails[0] && user.emails[0].value) {
	          name = user.emails[0].value;
	        }
	        target.text(name);
	      });
	    });
	  }
	  
	  // THIS IS FOR DISPLAYING FILE-SAVE ELEMENTS OFFLINE
	  enableFileOptions();
	  $(".loginOnly").show();
	  $(".logoutOnly").hide();
	
	  storageAPI.then(function (api) {
	    api.collection.then(function () {
	      $(".loginOnly").show();
	      $(".logoutOnly").hide();
	      setUsername($("#username"));
	    });
	    // api.collection.fail(function () {
	    //   $(".loginOnly").hide();
	    //   $(".logoutOnly").show();
	    // });
	  });
	
	  storageAPI = storageAPI.then(function (api) {
	    return api.api;
	  });
	  $("#connectButton").click(function () {
	    $("#connectButton").text("Connecting...");
	    $("#connectButton").attr("disabled", "disabled");
	    $('#connectButtonli').attr('disabled', 'disabled');
	    $("#connectButton").attr("tabIndex", "-1");
	    //$("#topTierUl").attr("tabIndex", "0");
	    getTopTierMenuitems();
	    storageAPI = createProgramCollectionAPI("code.pyret.org", false);
	    storageAPI.then(function (api) {
	      
	      api.collection.then(function () {
	        $(".loginOnly").show();
	        $(".logoutOnly").hide();
	        document.activeElement.blur();
	        $("#bonniemenubutton").focus();
	        setUsername($("#username"));
	        
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
	        $('#connectButtonli').attr('disabled', false);
	        //$("#connectButton").attr("tabIndex", "0");
	        document.activeElement.blur();
	        $("#connectButton").focus();
	        //$("#topTierUl").attr("tabIndex", "-1");
	      });
	    });
	    storageAPI = storageAPI.then(function (api) {
	      return api.api;
	    });
	  });
	
	  /*
	    initialProgram holds a promise for a Drive File object or null
	     It's null if the page doesn't have a #share or #program url
	     If the url does have a #program or #share, the promise is for the
	    corresponding object.
	  */
	  var initialProgram = storageAPI.then(function (api) {
	    var programLoad = null;
	    if (params["get"] && params["get"]["program"]) {
	      enableFileOptions();
	      programLoad = api.getFileById(params["get"]["program"]);
	      programLoad.then(function (p) {
	        showShareContainer(p);
	      });
	    }
	    if (params["get"] && params["get"]["share"]) {
	      logger.log('shared-program-load', {
	        id: params["get"]["share"]
	      });
	      programLoad = api.getSharedFileById(params["get"]["share"]);
	      programLoad.then(function (file) {
	        // NOTE(joe): If the current user doesn't own or have access to this file
	        // (or isn't logged in) this will simply fail with a 401, so we don't do
	        // any further permission checking before showing the link.
	        file.getOriginal().then(function (response) {
	          console.log("Response for original: ", response);
	          var original = $("#open-original").show().off("click");
	          var id = response.result.value;
	          original.removeClass("disabled");
	          original.click(function () {
	            window.open(window.APP_BASE_URL + "/editor#program=" + id, "_blank");
	          });
	        });
	      });
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
	
	  var filename = false;
	
	  $("#download a").click(function () {
	    var downloadElt = $("#download a");
	    var contents = CPO.editor.cm.getValue();
	    var downloadBlob = window.URL.createObjectURL(new Blob([contents], { type: 'text/plain' }));
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
	
	  var TRUNCATE_LENGTH = 20;
	
	  function truncateName(name) {
	    if (name.length <= TRUNCATE_LENGTH + 1) {
	      return name;
	    }
	    return name.slice(0, TRUNCATE_LENGTH / 2) + "…" + name.slice(name.length - TRUNCATE_LENGTH / 2, name.length);
	  }
	
	  function updateName(p) {
	    filename = p.getName();
	    $("#filename").text(" (" + truncateName(filename) + ")");
	    setTitle(filename);
	    showShareContainer(p);
	  }
	
	  function loadProgram(p) {
	    programToSave = p;
	    return p.then(function (prog) {
	      if (prog !== null) {
	        updateName(prog);
	        if (prog.shared) {
	          window.stickMessage("You are viewing a shared program. Any changes you make will not be saved. You can use File -> Save a copy to save your own version with any edits you make.");
	        }
	        return prog.getContents();
	      }
	    });
	  }
	
	  function say(msg, forget) {
	    if (msg === "") return;
	    var announcements = document.getElementById("announcementlist");
	    var li = document.createElement("LI");
	    li.appendChild(document.createTextNode(msg));
	    announcements.insertBefore(li, announcements.firstChild);
	    if (forget) {
	      setTimeout(function () {
	        announcements.removeChild(li);
	      }, 1000);
	    }
	  }
	
	  function sayAndForget(msg) {
	    //console.log('doing sayAndForget', msg);
	    say(msg, true);
	  }
	
	  function cycleAdvance(currIndex, maxIndex, reverseP) {
	    var nextIndex = currIndex + (reverseP ? -1 : +1);
	    nextIndex = (nextIndex % maxIndex + maxIndex) % maxIndex;
	    return nextIndex;
	  }
	
	  function populateFocusCarousel(editor) {
	    if (!editor.focusCarousel) {
	      editor.focusCarousel = [];
	    }
	    var fc = editor.focusCarousel;
	    var docmain = document.getElementById("main");
	    if (!fc[0]) {
	      var toolbar = document.getElementById('Toolbar');
	      fc[0] = toolbar;
	      //fc[0] = document.getElementById("headeronelegend");
	      //getTopTierMenuitems();
	      //fc[0] = document.getElementById('bonniemenubutton');
	    }
	    if (!fc[1]) {
	      var docreplMain = docmain.getElementsByClassName("replMain");
	      var docreplMain0;
	      if (docreplMain.length === 0) {
	        docreplMain0 = undefined;
	      } else if (docreplMain.length === 1) {
	        docreplMain0 = docreplMain[0];
	      } else {
	        for (var i = 0; i < docreplMain.length; i++) {
	          if (docreplMain[i].innerText !== "") {
	            docreplMain0 = docreplMain[i];
	          }
	        }
	      }
	      fc[1] = docreplMain0;
	    }
	    if (!fc[2]) {
	      var docrepl = docmain.getElementsByClassName("repl");
	      var docreplcode = docrepl[0].getElementsByClassName("prompt-container")[0].getElementsByClassName("CodeMirror")[0];
	      fc[2] = docreplcode;
	    }
	    if (!fc[3]) {
	      fc[3] = document.getElementById("announcements");
	    }
	  }
	
	  function cycleFocus(reverseP) {
	    //console.log('doing cycleFocus', reverseP);
	    var editor = this.editor;
	    populateFocusCarousel(editor);
	    var fCarousel = editor.focusCarousel;
	    var maxIndex = fCarousel.length;
	    var currentFocusedElt = fCarousel.find(function (node) {
	      if (!node) {
	        return false;
	      } else {
	        return node.contains(document.activeElement);
	      }
	    });
	    var currentFocusIndex = fCarousel.indexOf(currentFocusedElt);
	    var nextFocusIndex = currentFocusIndex;
	    var focusElt;
	    do {
	      nextFocusIndex = cycleAdvance(nextFocusIndex, maxIndex, reverseP);
	      focusElt = fCarousel[nextFocusIndex];
	      //console.log('trying focusElt', focusElt);
	    } while (!focusElt);
	
	    var focusElt0;
	    if (focusElt.classList.contains('toolbarregion')) {
	      //console.log('settling on toolbar region')
	      getTopTierMenuitems();
	      focusElt0 = document.getElementById('bonniemenubutton');
	    } else if (focusElt.classList.contains("replMain") || focusElt.classList.contains("CodeMirror")) {
	      //console.log('settling on defn window')
	      var textareas = focusElt.getElementsByTagName("textarea");
	      //console.log('txtareas=', textareas)
	      //console.log('txtarea len=', textareas.length)
	      if (textareas.length === 0) {
	        //console.log('I')
	        focusElt0 = focusElt;
	      } else if (textareas.length === 1) {
	        //console.log('settling on inter window')
	        focusElt0 = textareas[0];
	      } else {
	        //console.log('settling on defn window')
	        /*
	        for (var i = 0; i < textareas.length; i++) {
	          if (textareas[i].getAttribute('tabIndex')) {
	            focusElt0 = textareas[i];
	          }
	        }
	        */
	        focusElt0 = textareas[textareas.length - 1];
	        focusElt0.removeAttribute('tabIndex');
	      }
	    } else {
	      //console.log('settling on announcement region', focusElt)
	      focusElt0 = focusElt;
	    }
	
	    document.activeElement.blur();
	    focusElt0.click();
	    focusElt0.focus();
	    //console.log('(cf)docactelt=', document.activeElement);
	  }
	
	  var programLoaded = loadProgram(initialProgram);
	
	  var programToSave = initialProgram;
	
	  function showShareContainer(p) {
	    //console.log('called showShareContainer');
	    if (!p.shared) {
	      $("#shareContainer").empty();
	      $('#publishli').show();
	      $("#shareContainer").append(shareAPI.makeShareLink(p));
	      getTopTierMenuitems();
	    }
	  }
	
	  function nameOrUntitled() {
	    return filename || "Untitled";
	  }
	  function autoSave() {
	    programToSave.then(function (p) {
	      if (p !== null && !p.shared) {
	        save();
	      }
	    });
	  }
	
	  function enableFileOptions() {
	    $("#filemenuContents *").removeClass("disabled");
	  }
	
	  function menuItemDisabled(id) {
	    return $("#" + id).hasClass("disabled");
	  }
	
	  function newEvent(e) {
	    window.open(window.APP_BASE_URL + "/editor");
	  }
	
	  function saveEvent(e) {
	    if (menuItemDisabled("save")) {
	      return;
	    }
	    return save();
	  }
	
	  /*
	    save : string (optional) -> undef
	     If a string argument is provided, create a new file with that name and save
	    the editor contents in that file.
	     If no filename is provided, save the existing file referenced by the editor
	    with the current editor contents.  If no filename has been set yet, just
	    set the name to "Untitled".
	   */
	  function save(newFilename) {
	    var useName, create;

	    if (newFilename !== undefined) {
	      useName = newFilename;
	      create = true;
	    } else if (filename === false) {
	      filename = "Untitled";
	      create = true;
	    } else {
	      useName = filename; // A closed-over variable
	      create = false;
	    }
	    window.stickMessage("Saving...");
	    
	    let contents = CPO.editor.cm.getValue();
		let loc = window.location.pathname;

	    storageAPI = localFileSaveAPI(loc);

	    var api = storageAPI.api;

	    api.createFile(contents);


		// NOTE: Need condition to see if we are connected or not

	 //    var savedProgram = programToSave.then(function (p) {
	 //      if (p !== null && p.shared && !create) {
	 //        return p; // Don't try to save shared files
	 //      }
	 //      if (create) {
	 //        programToSave = storageAPI.then(function (api) {
	 //          return api.createFile(useName);
	 //        }).then(function (p) {
	 //          // showShareContainer(p); TODO(joe): figure out where to put this
	 //          history.pushState(null, null, "#program=" + p.getUniqueId());
	 //          updateName(p); // sets filename
	 //          enableFileOptions();
	 //          return p;
	 //        });
	 //        return programToSave.then(function (p) {
	 //          return save();
	 //        });
	 //      } else {
	 //        return programToSave.then(function (p) {
	 //          if (p === null) {
	 //            return null;
	 //          } else {
	 //            return p.save(CPO.editor.cm.getValue(), false);
	 //          }
	 //        }).then(function (p) {
	 //          if (p !== null) {
	 //            window.flashMessage("Program saved as " + p.getName());
	 //          }
	 //          return p;
	 //        });
	 //      }
	 //    });
	 //    savedProgram.fail(function (err) {
	 //      window.stickError("Unable to save", "Your internet connection may be down, or something else might be wrong with this site or saving to Google.  You should back up any changes to this program somewhere else.  You can try saving again to see if the problem was temporary, as well.");
	 //      console.error(err);
	 //    });
	 //    return savedProgram;
	  }
	
	  function saveAs() {
	    if (menuItemDisabled("saveas")) {
	      return;
	    }
	    programToSave.then(function (p) {
	      var name = p === null ? "Untitled" : p.getName();
	      var saveAsPrompt = new modalPrompt({
	        title: "Save a copy",
	        style: "text",
	        options: [{
	          message: "The name for the copy:",
	          defaultValue: name
	        }]
	      });
	      return saveAsPrompt.show().then(function (newName) {
	        if (newName === null) {
	          return null;
	        }
	        window.stickMessage("Saving...");
	        return save(newName);
	      }).fail(function (err) {
	        console.error("Failed to rename: ", err);
	        window.flashError("Failed to rename file");
	      });
	    });
	  }
	
	  function rename() {
	    programToSave.then(function (p) {
	      var renamePrompt = new modalPrompt({
	        title: "Rename this file",
	        style: "text",
	        options: [{
	          message: "The new name for the file:",
	          defaultValue: p.getName()
	        }]
	      });
	      // null return values are for the "cancel" path
	      return renamePrompt.show().then(function (newName) {
	        if (newName === null) {
	          return null;
	        }
	        window.stickMessage("Renaming...");
	        programToSave = p.rename(newName);
	        return programToSave;
	      }).then(function (p) {
	        if (p === null) {
	          return null;
	        }
	        updateName(p);
	        window.flashMessage("Program saved as " + p.getName());
	      }).fail(function (err) {
	        console.error("Failed to rename: ", err);
	        window.flashError("Failed to rename file");
	      });
	    }).fail(function (err) {
	      console.error("Unable to rename: ", err);
	    });
	  }
	
	  $("#runButton").click(function () {
	    CPO.autoSave();
	  });
	
	  $("#new").click(newEvent);
	  $("#save").click(saveEvent);
	  $("#rename").click(rename);
	  $("#saveas").click(saveAs);
	
	  var focusableElts = $(document).find('#header .focusable');
	  //console.log('focusableElts=', focusableElts)
	  var theToolbar = $(document).find('#Toolbar');
	
	  function getTopTierMenuitems() {
	    //console.log('doing getTopTierMenuitems')
	    var topTierMenuitems = $(document).find('#header ul li.topTier').toArray();
	    topTierMenuitems = topTierMenuitems.filter(function (elt) {
	      return !(elt.style.display === 'none' || elt.getAttribute('disabled') === 'disabled');
	    });
	    var numTopTierMenuitems = topTierMenuitems.length;
	    for (var i = 0; i < numTopTierMenuitems; i++) {
	      var ithTopTierMenuitem = topTierMenuitems[i];
	      var iChild = $(ithTopTierMenuitem).children().first();
	      //console.log('iChild=', iChild);
	      iChild.find('.focusable').attr('aria-setsize', numTopTierMenuitems.toString()).attr('aria-posinset', (i + 1).toString());
	    }
	    return topTierMenuitems;
	  }
	
	  function updateEditorHeight() {
	    var toolbarHeight = document.getElementById('topTierUl').scrollHeight;
	    // gets bumped to 67 on initial resize perturbation, but actual value is indeed 40
	    if (toolbarHeight < 80) toolbarHeight = 40;
	    toolbarHeight += 'px';
	    document.getElementById('REPL').style.paddingTop = toolbarHeight;
	    var docMain = document.getElementById('main');
	    var docReplMain = docMain.getElementsByClassName('replMain');
	    if (docReplMain.length !== 0) {
	      docReplMain[0].style.paddingTop = toolbarHeight;
	    }
	  }
	
	  $(window).on('resize', updateEditorHeight);
	
	  function insertAriaPos(submenu) {
	    //console.log('doing insertAriaPos', submenu)
	    var arr = submenu.toArray();
	    //console.log('arr=', arr);
	    var len = arr.length;
	    for (var i = 0; i < len; i++) {
	      var elt = arr[i];
	      //console.log('elt', i, '=', elt);
	      elt.setAttribute('aria-setsize', len.toString());
	      elt.setAttribute('aria-posinset', (i + 1).toString());
	    }
	  }
	
	  document.addEventListener('click', function () {
	    hideAllTopMenuitems();
	  });
	
	  theToolbar.click(function (e) {
	    e.stopPropagation();
	  });
	
	  theToolbar.keydown(function (e) {
	    //console.log('toolbar keydown', e);
	    //most any key at all
	    var kc = e.keyCode;
	    if (kc === 27) {
	      // escape
	      hideAllTopMenuitems();
	      //console.log('calling cycleFocus from toolbar')
	      CPO.cycleFocus();
	      e.stopPropagation();
	    } else if (kc === 9 || kc === 37 || kc === 38 || kc === 39 || kc === 40) {
	      // an arrow
	      var target = $(this).find('[tabIndex=-1]');
	      getTopTierMenuitems();
	      document.activeElement.blur(); //needed?
	      target.first().focus(); //needed?
	      //console.log('docactelt=', document.activeElement);
	      e.stopPropagation();
	    } else {
	      hideAllTopMenuitems();
	    }
	  });
	
	  function clickTopMenuitem(e) {
	    hideAllTopMenuitems();
	    var thisElt = $(this);
	    //console.log('doing clickTopMenuitem on', thisElt);
	    var topTierUl = thisElt.closest('ul[id=topTierUl]');
	    if (thisElt[0].hasAttribute('aria-hidden')) {
	      return;
	    }
	    if (thisElt[0].getAttribute('disabled') === 'disabled') {
	      return;
	    }
	    //var hiddenP = (thisElt[0].getAttribute('aria-expanded') === 'false');
	    //hiddenP always false?
	    var thisTopMenuitem = thisElt.closest('li.topTier');
	    //console.log('thisTopMenuitem=', thisTopMenuitem);
	    var t1 = thisTopMenuitem[0];
	    var submenuOpen = thisElt[0].getAttribute('aria-expanded') === 'true';
	    if (!submenuOpen) {
	      //console.log('hiddenp true branch');
	      hideAllTopMenuitems();
	      thisTopMenuitem.children('ul.submenu').attr('aria-hidden', 'false').show();
	      thisTopMenuitem.children().first().find('[aria-expanded]').attr('aria-expanded', 'true');
	    } else {
	      //console.log('hiddenp false branch');
	      thisTopMenuitem.children('ul.submenu').attr('aria-hidden', 'true').hide();
	      thisTopMenuitem.children().first().find('[aria-expanded]').attr('aria-expanded', 'false');
	    }
	    e.stopPropagation();
	  }
	
	  var expandableElts = $(document).find('#header [aria-expanded]');
	  expandableElts.click(clickTopMenuitem);
	
	  function hideAllTopMenuitems() {
	    //console.log('doing hideAllTopMenuitems');
	    var topTierUl = $(document).find('#header ul[id=topTierUl]');
	    topTierUl.find('[aria-expanded]').attr('aria-expanded', 'false');
	    topTierUl.find('ul.submenu').attr('aria-hidden', 'true').hide();
	  }
	
	  var nonexpandableElts = $(document).find('#header .topTier > div > button:not([aria-expanded])');
	  nonexpandableElts.click(hideAllTopMenuitems);
	
	  function switchTopMenuitem(destTopMenuitem, destElt) {
	    //console.log('doing switchTopMenuitem', destTopMenuitem, destElt);
	    //console.log('dtmil=', destTopMenuitem.length);
	    hideAllTopMenuitems();
	    if (destTopMenuitem && destTopMenuitem.length !== 0) {
	      var elt = destTopMenuitem[0];
	      var eltId = elt.getAttribute('id');
	      destTopMenuitem.children('ul.submenu').attr('aria-hidden', 'false').show();
	      destTopMenuitem.children().first().find('[aria-expanded]').attr('aria-expanded', 'true');
	    }
	    if (destElt) {
	      //destElt.attr('tabIndex', '0').focus();
	      destElt.focus();
	    }
	  }
	
	  var showingHelpKeys = false;
	
	  function showHelpKeys() {
	    showingHelpKeys = true;
	    $('#help-keys').fadeIn(100);
	    reciteHelp();
	  }
	
	  focusableElts.keydown(function (e) {
	    //console.log('focusable elt keydown', e);
	    var kc = e.keyCode;
	    //$(this).blur(); // Delete?
	    var withinSecondTierUl = true;
	    var topTierUl = $(this).closest('ul[id=topTierUl]');
	    var secondTierUl = $(this).closest('ul.submenu');
	    if (secondTierUl.length === 0) {
	      withinSecondTierUl = false;
	    }
	    if (kc === 27) {
	      //console.log('escape pressed i')
	      $('#help-keys').fadeOut(500);
	    }
	    if (kc === 27 && withinSecondTierUl) {
	      // escape
	      var destTopMenuitem = $(this).closest('li.topTier');
	      var possElts = destTopMenuitem.find('.focusable:not([disabled])').filter(':visible');
	      switchTopMenuitem(destTopMenuitem, possElts.first());
	      e.stopPropagation();
	    } else if (kc === 39) {
	      // rightarrow
	      //console.log('rightarrow pressed');
	      var srcTopMenuitem = $(this).closest('li.topTier');
	      //console.log('srcTopMenuitem=', srcTopMenuitem);
	      srcTopMenuitem.children().first().find('.focusable').attr('tabIndex', '-1');
	      var topTierMenuitems = getTopTierMenuitems();
	      //console.log('ttmi* =', topTierMenuitems);
	      var ttmiN = topTierMenuitems.length;
	      var j = topTierMenuitems.indexOf(srcTopMenuitem[0]);
	      //console.log('j initial=', j);
	      for (var i = (j + 1) % ttmiN; i !== j; i = (i + 1) % ttmiN) {
	        var destTopMenuitem = $(topTierMenuitems[i]);
	        //console.log('destTopMenuitem(a)=', destTopMenuitem);
	        var possElts = destTopMenuitem.find('.focusable:not([disabled])').filter(':visible');
	        //console.log('possElts=', possElts)
	        if (possElts.length > 0) {
	          //console.log('final i=', i);
	          //console.log('landing on', possElts.first());
	          switchTopMenuitem(destTopMenuitem, possElts.first());
	          e.stopPropagation();
	          break;
	        }
	      }
	    } else if (kc === 37) {
	      // leftarrow
	      //console.log('leftarrow pressed');
	      var srcTopMenuitem = $(this).closest('li.topTier');
	      //console.log('srcTopMenuitem=', srcTopMenuitem);
	      srcTopMenuitem.children().first().find('.focusable').attr('tabIndex', '-1');
	      var topTierMenuitems = getTopTierMenuitems();
	      //console.log('ttmi* =', topTierMenuitems);
	      var ttmiN = topTierMenuitems.length;
	      var j = topTierMenuitems.indexOf(srcTopMenuitem[0]);
	      //console.log('j initial=', j);
	      for (var i = (j + ttmiN - 1) % ttmiN; i !== j; i = (i + ttmiN - 1) % ttmiN) {
	        var destTopMenuitem = $(topTierMenuitems[i]);
	        //console.log('destTopMenuitem(b)=', destTopMenuitem);
	        //console.log('i=', i)
	        var possElts = destTopMenuitem.find('.focusable:not([disabled])').filter(':visible');
	        //console.log('possElts=', possElts)
	        if (possElts.length > 0) {
	          //console.log('final i=', i);
	          //console.log('landing on', possElts.first());
	          switchTopMenuitem(destTopMenuitem, possElts.first());
	          e.stopPropagation();
	          break;
	        }
	      }
	    } else if (kc === 38) {
	      // uparrow
	      //console.log('uparrow pressed');
	      var submenu;
	      if (withinSecondTierUl) {
	        var nearSibs = $(this).closest('div').find('.focusable').filter(':visible');
	        //console.log('nearSibs=', nearSibs);
	        var myId = $(this)[0].getAttribute('id');
	        //console.log('myId=', myId);
	        submenu = $([]);
	        var thisEncountered = false;
	        for (var i = nearSibs.length - 1; i >= 0; i--) {
	          if (thisEncountered) {
	            //console.log('adding', nearSibs[i]);
	            submenu = submenu.add($(nearSibs[i]));
	          } else if (nearSibs[i].getAttribute('id') === myId) {
	            thisEncountered = true;
	          }
	        }
	        //console.log('submenu so far=', submenu);
	        var farSibs = $(this).closest('li').prevAll().find('div:not(.disabled)').find('.focusable').filter(':visible');
	        submenu = submenu.add(farSibs);
	        if (submenu.length === 0) {
	          submenu = $(this).closest('li').closest('ul').find('div:not(.disabled)').find('.focusable').filter(':visible').last();
	        }
	        if (submenu.length > 0) {
	          submenu.last().focus();
	        } else {
	          /*
	          //console.log('no actionable submenu found')
	          var topmenuItem = $(this).closest('ul.submenu').closest('li')
	          .children().first().find('.focusable:not([disabled])').filter(':visible');
	          if (topmenuItem.length > 0) {
	            topmenuItem.first().focus();
	          } else {
	            //console.log('no actionable topmenuitem found either')
	          }
	          */
	        }
	      }
	      e.stopPropagation();
	    } else if (kc === 40) {
	      // downarrow
	      //console.log('downarrow pressed');
	      var submenuDivs;
	      var submenu;
	      if (!withinSecondTierUl) {
	        //console.log('1st tier')
	        submenuDivs = $(this).closest('li').children('ul').find('div:not(.disabled)');
	        submenu = submenuDivs.find('.focusable').filter(':visible');
	        insertAriaPos(submenu);
	      } else {
	        //console.log('2nd tier')
	        var nearSibs = $(this).closest('div').find('.focusable').filter(':visible');
	        //console.log('nearSibs=', nearSibs);
	        var myId = $(this)[0].getAttribute('id');
	        //console.log('myId=', myId);
	        submenu = $([]);
	        var thisEncountered = false;
	        for (var i = 0; i < nearSibs.length; i++) {
	          if (thisEncountered) {
	            //console.log('adding', nearSibs[i]);
	            submenu = submenu.add($(nearSibs[i]));
	          } else if (nearSibs[i].getAttribute('id') === myId) {
	            thisEncountered = true;
	          }
	        }
	        //console.log('submenu so far=', submenu);
	        var farSibs = $(this).closest('li').nextAll().find('div:not(.disabled)').find('.focusable').filter(':visible');
	        submenu = submenu.add(farSibs);
	        if (submenu.length === 0) {
	          submenu = $(this).closest('li').closest('ul').find('div:not(.disabled)').find('.focusable').filter(':visible');
	        }
	      }
	      //console.log('submenu=', submenu)
	      if (submenu.length > 0) {
	        submenu.first().focus();
	      } else {
	        //console.log('no actionable submenu found')
	      }
	      e.stopPropagation();
	    } else if (kc === 27) {
	      //console.log('esc pressed');
	      hideAllTopMenuitems();
	      if (showingHelpKeys) {
	        showingHelpKeys = false;
	      } else {
	        //console.log('calling cycleFocus ii')
	        CPO.cycleFocus();
	      }
	      e.stopPropagation();
	      e.preventDefault();
	      //$(this).closest('nav').closest('main').focus();
	    } else if (kc === 9) {
	      if (e.shiftKey) {
	        hideAllTopMenuitems();
	        CPO.cycleFocus(true);
	      }
	      e.stopPropagation();
	      e.preventDefault();
	    } else if (kc === 13 || kc === 17 || kc === 20 || kc === 32) {
	      // 13=enter 17=ctrl 20=capslock 32=space
	      //console.log('stopprop 1')
	      e.stopPropagation();
	    } else if (kc >= 112 && kc <= 123) {
	      //console.log('doprop 1')
	      // fn keys
	      // go ahead, propagate
	    } else if (e.ctrlKey && kc === 191) {
	      //console.log('C-? pressed')
	      showHelpKeys();
	      e.stopPropagation();
	    } else {
	      //console.log('stopprop 2')
	      e.stopPropagation();
	    }
	    //e.stopPropagation();
	  });
	
	  // shareAPI.makeHoverMenu($("#filemenu"), $("#filemenuContents"), false, function(){});
	  // shareAPI.makeHoverMenu($("#bonniemenu"), $("#bonniemenuContents"), false, function(){});
	
	
	  var codeContainer = $("<div>").addClass("replMain");
	  codeContainer.attr("role", "region").attr("aria-label", "Definitions");
	  //attr("tabIndex", "-1");
	  $("#main").prepend(codeContainer);
	
	  CPO.editor = CPO.makeEditor(codeContainer, {
	    runButton: $("#runButton"),
	    simpleEditor: false,
	    run: CPO.RUN_CODE,
	    initialGas: 100
	  });
	  CPO.editor.cm.setOption("readOnly", "nocursor");
	  CPO.editor.cm.setOption("longLines", new Map());
	  function removeShortenedLine(lineHandle) {
	    var rulers = CPO.editor.cm.getOption("rulers");
	    var rulersMinCol = CPO.editor.cm.getOption("rulersMinCol");
	    var longLines = CPO.editor.cm.getOption("longLines");
	    if (lineHandle.text.length <= rulersMinCol) {
	      lineHandle.rulerListeners.forEach(function (f, evt) {
	        return lineHandle.off(evt, f);
	      });
	      longLines.delete(lineHandle);
	      // console.log("Removed ", lineHandle);
	      refreshRulers();
	    }
	  }
	  function deleteLine(lineHandle) {
	    var longLines = CPO.editor.cm.getOption("longLines");
	    lineHandle.rulerListeners.forEach(function (f, evt) {
	      return lineHandle.off(evt, f);
	    });
	    longLines.delete(lineHandle);
	    // console.log("Removed ", lineHandle);
	    refreshRulers();
	  }
	  function refreshRulers() {
	    var rulers = CPO.editor.cm.getOption("rulers");
	    var longLines = CPO.editor.cm.getOption("longLines");
	    var minLength;
	    if (longLines.size === 0) {
	      minLength = 0; // if there are no long lines, then we don't care about showing any rulers
	    } else {
	      minLength = Number.MAX_VALUE;
	      longLines.forEach(function (lineNo, lineHandle) {
	        if (lineHandle.text.length < minLength) {
	          minLength = lineHandle.text.length;
	        }
	      });
	    }
	    for (var i = 0; i < rulers.length; i++) {
	      if (rulers[i].column >= minLength) {
	        rulers[i].className = "hidden";
	      } else {
	        rulers[i].className = undefined;
	      }
	    }
	    // gotta set the option twice, or else CM short-circuits and ignores it
	    CPO.editor.cm.setOption("rulers", undefined);
	    CPO.editor.cm.setOption("rulers", rulers);
	  }
	  CPO.editor.cm.on('changes', function (instance, changeObjs) {
	    var minLine = instance.lastLine(),
	        maxLine = 0;
	    var rulersMinCol = instance.getOption("rulersMinCol");
	    var longLines = instance.getOption("longLines");
	    changeObjs.forEach(function (change) {
	      if (minLine > change.from.line) {
	        minLine = change.from.line;
	      }
	      if (maxLine < change.from.line + change.text.length) {
	        maxLine = change.from.line + change.text.length;
	      }
	    });
	    var changed = false;
	    instance.eachLine(minLine, maxLine, function (lineHandle) {
	      if (lineHandle.text.length > rulersMinCol) {
	        if (!longLines.has(lineHandle)) {
	          changed = true;
	          longLines.set(lineHandle, lineHandle.lineNo());
	          lineHandle.rulerListeners = new Map([["change", removeShortenedLine], ["delete", function () {
	            // needed because the delete handler gets no arguments at all
	            deleteLine(lineHandle);
	          }]]);
	          lineHandle.rulerListeners.forEach(function (f, evt) {
	            return lineHandle.on(evt, f);
	          });
	          // console.log("Added ", lineHandle);
	        }
	      } else {
	        if (longLines.has(lineHandle)) {
	          changed = true;
	          longLines.delete(lineHandle);
	          // console.log("Removed ", lineHandle);
	        }
	      }
	    });
	    if (changed) {
	      refreshRulers();
	    }
	  });
	
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
	  console.log(("./js/cpo-main.jarr"));
	  pyretLoad.src = ("./js/cpo-main.jarr");
	  pyretLoad.type = "text/javascript";
	  document.body.appendChild(pyretLoad);
	
	  var pyretLoad2 = document.createElement('script');
	
	  function logFailureAndManualFetch(url, e) {
	
	    // NOTE(joe): The error reported by the "error" event has essentially no
	    // information on it; it's just a notification that _something_ went wrong.
	    // So, we log that something happened, then immediately do an AJAX request
	    // call for the same URL, to see if we can get more information. This
	    // doesn't perfectly tell us about the original failure, but it's
	    // something.
	
	    // In addition, if someone is seeing the Pyret failed to load error, but we
	    // don't get these logging events, we have a strong hint that something is
	    // up with their network.
	    logger.log('pyret-load-failure', {
	      event: 'initial-failure',
	      url: url,
	
	      // The timestamp appears to count from the beginning of page load,
	      // which may approximate download time if, say, requests are timing out
	      // or getting cut off.
	
	      timeStamp: e.timeStamp
	    });
	
	    var manualFetch = $.ajax(url);
	    manualFetch.then(function (res) {
	      // Here, we log the first 100 characters of the response to make sure
	      // they resemble the Pyret blob
	      logger.log('pyret-load-failure', {
	        event: 'success-with-ajax',
	        contentsPrefix: res.slice(0, 100)
	      });
	    });
	    manualFetch.fail(function (res) {
	      logger.log('pyret-load-failure', {
	        event: 'failure-with-ajax',
	        status: res.status,
	        statusText: res.statusText,
	        // Since responseText could be a long error page, and we don't want to
	        // log huge pages, we slice it to 100 characters, which is enough to
	        // tell us what's going on (e.g. AWS failure, network outage).
	        responseText: res.responseText.slice(0, 100)
	      });
	    });
	  }
	
	  $(pyretLoad).on("error", function (e) {
	    logFailureAndManualFetch(("./js/cpo-main.jarr"), e);
	    console.log(process.env);
	    pyretLoad2.src = (undefined);
	    pyretLoad2.type = "text/javascript";
	    document.body.appendChild(pyretLoad2);
	  });
	
	  $(pyretLoad2).on("error", function (e) {
	    $("#loader").hide();
	    $("#runPart").hide();
	    $("#breakButton").hide();
	    window.stickError("Pyret failed to load; check your connection or try refreshing the page.  If this happens repeatedly, please report it as a bug.");
	    logFailureAndManualFetch((undefined), e);
	  });
	
	  programLoaded.fin(function () {
	    CPO.editor.focus();
	    CPO.editor.cm.setOption("readOnly", false);
	  });
	
	  CPO.autoSave = autoSave;
	  CPO.save = save;
	  CPO.updateName = updateName;
	  CPO.showShareContainer = showShareContainer;
	  CPO.loadProgram = loadProgram;
	  CPO.cycleFocus = cycleFocus;
	  CPO.say = say;
	  CPO.sayAndForget = sayAndForget;
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
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
	    var timeout = runTimeout(cleanUpNextTick);
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
	    runClearTimeout(timeout);
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
	        runTimeout(drainQueue);
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
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) { return [] }
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 3 */
/***/ (function(module, exports) {

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


/***/ }),
/* 4 */
/***/ (function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;"use strict";
	
	/**
	 * Module for managing modal prompt instances.
	 * NOTE: This module is currently limited in a number
	 *       of ways. For one, it only allows radio
	 *       input options. Additionally, it hard-codes in
	 *       a number of other behaviors which are specific
	 *       to the image import style prompt (for which
	 *       this module was written).
	 *       If desired, this module may be made more
	 *       general-purpose in the future, but, for now,
	 *       be aware of these limitations.
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(6)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Q) {
	
	  function autoHighlightBox(text) {
	    var textBox = $("<input type='text'>").addClass("auto-highlight");
	    textBox.attr("size", text.length);
	    textBox.attr("editable", false);
	    textBox.on("focus", function () {
	      $(this).select();
	    });
	    textBox.on("mouseup", function () {
	      $(this).select();
	    });
	    textBox.val(text);
	    return textBox;
	  }
	
	  // Allows asynchronous requesting of prompts
	  var promptQueue = Q();
	  var styles = ["radio", "tiles", "text", "copyText", "confirm"];
	
	  window.modals = [];
	
	  /**
	   * Represents an option to present the user
	   * @typedef {Object} ModalOption
	   * @property {string} message - The message to show the user which
	               describes this option
	   * @property {string} value - The value to return if this option is chosen
	   * @property {string} [example] - A code snippet to show with this option
	   */
	
	  /**
	   * Constructor for modal prompts.
	   * @param {ModalOption[]} options - The options to present the user
	   */
	  function Prompt(options) {
	    window.modals.push(this);
	    if (!options || styles.indexOf(options.style) === -1 || !options.options || typeof options.options.length !== "number" || options.options.length === 0) {
	      throw new Error("Invalid Prompt Options", options);
	    }
	    this.options = options;
	    this.modal = $("#promptModal");
	    if (this.options.style === "radio") {
	      this.elts = $($.parseHTML("<table></table>")).addClass("choiceContainer");
	    } else if (this.options.style === "text") {
	      this.elts = $("<div>").addClass("choiceContainer");
	    } else if (this.options.style === "copyText") {
	      this.elts = $("<div>").addClass("choiceContainer");
	    } else if (this.options.style === "confirm") {
	      this.elts = $("<div>").addClass("choiceContainer");
	    } else {
	      this.elts = $($.parseHTML("<div></div>")).addClass("choiceContainer");
	    }
	    this.title = $(".modal-header > h3", this.modal);
	    this.closeButton = $(".close", this.modal);
	    this.submitButton = $(".submit", this.modal);
	    if (this.options.submitText) {
	      this.submitButton.text(this.options.submitText);
	    } else {
	      this.submitButton.text("Submit");
	    }
	    this.isCompiled = false;
	    this.deferred = Q.defer();
	    this.promise = this.deferred.promise;
	  }
	
	  /**
	   * Type for handlers of responses from modal prompts
	   * @callback promptCallback
	   * @param {string} resp - The response from the user
	   */
	
	  /**
	   * Shows this prompt to the user (will wait until any active
	   * prompts have finished)
	   * @param {promptCallback} [callback] - Optional callback which is passed the
	   *        result of the prompt
	   * @returns A promise resolving to either the result of `callback`, if provided,
	   *          or the result of the prompt, otherwise.
	   */
	  Prompt.prototype.show = function (callback) {
	    // Use the promise queue to make sure there's no other
	    // prompt being shown currently
	    if (this.options.hideSubmit) {
	      this.submitButton.hide();
	    } else {
	      this.submitButton.show();
	    }
	    this.closeButton.click(this.onClose.bind(this));
	    this.submitButton.click(this.onSubmit.bind(this));
	    var docClick = function (e) {
	      // If the prompt is active and the background is clicked,
	      // then close.
	      if ($(e.target).is(this.modal) && this.deferred) {
	        this.onClose(e);
	        $(document).off("click", docClick);
	      }
	    }.bind(this);
	    $(document).click(docClick);
	    var docKeydown = function (e) {
	      if (e.key === "Escape") {
	        this.onClose(e);
	        $(document).off("keydown", docKeydown);
	      }
	    }.bind(this);
	    $(document).keydown(docKeydown);
	    this.title.text(this.options.title);
	    this.populateModal();
	    this.modal.css('display', 'block');
	
	    if (callback) {
	      return this.promise.then(callback);
	    } else {
	      return this.promise;
	    }
	  };
	
	  /**
	   * Clears the contents of the modal prompt.
	   */
	  Prompt.prototype.clearModal = function () {
	    this.submitButton.off();
	    this.closeButton.off();
	    this.elts.empty();
	  };
	
	  /**
	   * Populates the contents of the modal prompt with the
	   * options in this prompt.
	   */
	  Prompt.prototype.populateModal = function () {
	    function createRadioElt(option, idx) {
	      var elt = $($.parseHTML("<input name=\"pyret-modal\" type=\"radio\">"));
	      var id = "r" + idx.toString();
	      var label = $($.parseHTML("<label for=\"" + id + "\"></label>"));
	      elt.attr("id", id);
	      elt.attr("value", option.value);
	      label.text(option.message);
	      var eltContainer = $($.parseHTML("<td class=\"pyret-modal-option-radio\"></td>"));
	      eltContainer.append(elt);
	      var labelContainer = $($.parseHTML("<td class=\"pyret-modal-option-message\"></td>"));
	      labelContainer.append(label);
	      var container = $($.parseHTML("<tr class=\"pyret-modal-option\"></tr>"));
	      container.append(eltContainer);
	      container.append(labelContainer);
	      if (option.example) {
	        var example = $($.parseHTML("<div></div>"));
	        var cm = CodeMirror(example[0], {
	          value: option.example,
	          mode: 'pyret',
	          lineNumbers: false,
	          readOnly: true
	        });
	        setTimeout(function () {
	          cm.refresh();
	        }, 1);
	        var exampleContainer = $($.parseHTML("<td class=\"pyret-modal-option-example\"></td>"));
	        exampleContainer.append(example);
	        container.append(exampleContainer);
	      }
	
	      return container;
	    }
	    function createTileElt(option, idx) {
	      var elt = $($.parseHTML("<button name=\"pyret-modal\" class=\"tile\"></button>"));
	      elt.attr("id", "t" + idx.toString());
	      elt.append($("<b>").text(option.message)).append($("<p>").text(option.details));
	      for (var evt in option.on) {
	        elt.on(evt, option.on[evt]);
	      }return elt;
	    }
	
	    function createTextElt(option) {
	      var elt = $("<div>");
	      elt.append($("<span>").addClass("textLabel").text(option.message));
	      //      elt.append($("<span>").text("(" + option.details + ")"));
	      elt.append($("<input type='text'>").val(option.defaultValue));
	      return elt;
	    }
	
	    function createCopyTextElt(option) {
	      var elt = $("<div>");
	      elt.append($("<p>").addClass("textLabel").text(option.message));
	      if (option.text) {
	        var box = autoHighlightBox(option.text);
	        //      elt.append($("<span>").text("(" + option.details + ")"));
	        elt.append(box);
	        box.focus();
	      }
	      return elt;
	    }
	
	    function createConfirmElt(option) {
	      return $("<p>").text(option.message);
	    }
	
	    var that = this;
	
	    function createElt(option, i) {
	      if (that.options.style === "radio") {
	        return createRadioElt(option, i);
	      } else if (that.options.style === "tiles") {
	        return createTileElt(option, i);
	      } else if (that.options.style === "text") {
	        return createTextElt(option);
	      } else if (that.options.style === "copyText") {
	        return createCopyTextElt(option);
	      } else if (that.options.style === "confirm") {
	        return createConfirmElt(option);
	      }
	    }
	
	    var optionElts;
	    // Cache results
	    //    if (true) {
	    optionElts = this.options.options.map(createElt);
	    //      this.compiledElts = optionElts;
	    //      this.isCompiled = true;
	    //    } else {
	    //      optionElts = this.compiledElts;
	    //    }
	    $("input[type='radio']", optionElts[0]).attr('checked', true);
	    this.elts.append(optionElts);
	    $(".modal-body", this.modal).empty().append(this.elts);
	    optionElts[0].focus();
	  };
	
	  /**
	   * Handler which is called when the user does not select anything
	   */
	  Prompt.prototype.onClose = function (e) {
	    this.modal.css('display', 'none');
	    this.clearModal();
	    this.deferred.resolve(null);
	    delete this.deferred;
	    delete this.promise;
	  };
	
	  /**
	   * Handler which is called when the user presses "submit"
	   */
	  Prompt.prototype.onSubmit = function (e) {
	    if (this.options.style === "radio") {
	      var retval = $("input[type='radio']:checked", this.modal).val();
	    } else if (this.options.style === "text") {
	      var retval = $("input[type='text']", this.modal).val();
	    } else if (this.options.style === "copyText") {
	      var retval = true;
	    } else if (this.options.style === "confirm") {
	      var retval = true;
	    } else {
	      var retval = true; // Just return true if they clicked submit
	    }
	    this.modal.css('display', 'none');
	    this.clearModal();
	    this.deferred.resolve(retval);
	    delete this.deferred;
	    delete this.promise;
	  };
	
	  return Prompt;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, setImmediate) {// vim:ts=4:sts=4:sw=4:
	/*!
	 *
	 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
	 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
	 *
	 * With parts by Tyler Close
	 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
	 * at http://www.opensource.org/licenses/mit-license.html
	 * Forked at ref_send.js version: 2009-05-11
	 *
	 * With parts by Mark Miller
	 * Copyright (C) 2011 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 */
	
	(function (definition) {
	    "use strict";
	
	    // This file will function properly as a <script> tag, or a module
	    // using CommonJS and NodeJS or RequireJS module formats.  In
	    // Common/Node/RequireJS, the module exports the Q API and when
	    // executed as a simple <script>, it creates a Q global instead.
	
	    // Montage Require
	    if (typeof bootstrap === "function") {
	        bootstrap("promise", definition);
	
	    // CommonJS
	    } else if (true) {
	        module.exports = definition();
	
	    // RequireJS
	    } else if (typeof define === "function" && define.amd) {
	        define(definition);
	
	    // SES (Secure EcmaScript)
	    } else if (typeof ses !== "undefined") {
	        if (!ses.ok()) {
	            return;
	        } else {
	            ses.makeQ = definition;
	        }
	
	    // <script>
	    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
	        // Prefer window over self for add-on scripts. Use self for
	        // non-windowed contexts.
	        var global = typeof window !== "undefined" ? window : self;
	
	        // Get the `window` object, save the previous Q global
	        // and initialize Q as a global.
	        var previousQ = global.Q;
	        global.Q = definition();
	
	        // Add a noConflict function so Q can be removed from the
	        // global namespace.
	        global.Q.noConflict = function () {
	            global.Q = previousQ;
	            return this;
	        };
	
	    } else {
	        throw new Error("This environment was not anticipated by Q. Please file a bug.");
	    }
	
	})(function () {
	"use strict";
	
	var hasStacks = false;
	try {
	    throw new Error();
	} catch (e) {
	    hasStacks = !!e.stack;
	}
	
	// All code after this point will be filtered from stack traces reported
	// by Q.
	var qStartingLine = captureLine();
	var qFileName;
	
	// shims
	
	// used for fallback in "allResolved"
	var noop = function () {};
	
	// Use the fastest possible means to execute a task in a future turn
	// of the event loop.
	var nextTick =(function () {
	    // linked list of tasks (single, with head node)
	    var head = {task: void 0, next: null};
	    var tail = head;
	    var flushing = false;
	    var requestTick = void 0;
	    var isNodeJS = false;
	    // queue for late tasks, used by unhandled rejection tracking
	    var laterQueue = [];
	
	    function flush() {
	        /* jshint loopfunc: true */
	        var task, domain;
	
	        while (head.next) {
	            head = head.next;
	            task = head.task;
	            head.task = void 0;
	            domain = head.domain;
	
	            if (domain) {
	                head.domain = void 0;
	                domain.enter();
	            }
	            runSingle(task, domain);
	
	        }
	        while (laterQueue.length) {
	            task = laterQueue.pop();
	            runSingle(task);
	        }
	        flushing = false;
	    }
	    // runs a single function in the async queue
	    function runSingle(task, domain) {
	        try {
	            task();
	
	        } catch (e) {
	            if (isNodeJS) {
	                // In node, uncaught exceptions are considered fatal errors.
	                // Re-throw them synchronously to interrupt flushing!
	
	                // Ensure continuation if the uncaught exception is suppressed
	                // listening "uncaughtException" events (as domains does).
	                // Continue in next event to avoid tick recursion.
	                if (domain) {
	                    domain.exit();
	                }
	                setTimeout(flush, 0);
	                if (domain) {
	                    domain.enter();
	                }
	
	                throw e;
	
	            } else {
	                // In browsers, uncaught exceptions are not fatal.
	                // Re-throw them asynchronously to avoid slow-downs.
	                setTimeout(function () {
	                    throw e;
	                }, 0);
	            }
	        }
	
	        if (domain) {
	            domain.exit();
	        }
	    }
	
	    nextTick = function (task) {
	        tail = tail.next = {
	            task: task,
	            domain: isNodeJS && process.domain,
	            next: null
	        };
	
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	
	    if (typeof process === "object" &&
	        process.toString() === "[object process]" && process.nextTick) {
	        // Ensure Q is in a real Node environment, with a `process.nextTick`.
	        // To see through fake Node environments:
	        // * Mocha test runner - exposes a `process` global without a `nextTick`
	        // * Browserify - exposes a `process.nexTick` function that uses
	        //   `setTimeout`. In this case `setImmediate` is preferred because
	        //    it is faster. Browserify's `process.toString()` yields
	        //   "[object Object]", while in a real Node environment
	        //   `process.nextTick()` yields "[object process]".
	        isNodeJS = true;
	
	        requestTick = function () {
	            process.nextTick(flush);
	        };
	
	    } else if (typeof setImmediate === "function") {
	        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
	        if (typeof window !== "undefined") {
	            requestTick = setImmediate.bind(window, flush);
	        } else {
	            requestTick = function () {
	                setImmediate(flush);
	            };
	        }
	
	    } else if (typeof MessageChannel !== "undefined") {
	        // modern browsers
	        // http://www.nonblocking.io/2011/06/windownexttick.html
	        var channel = new MessageChannel();
	        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
	        // working message ports the first time a page loads.
	        channel.port1.onmessage = function () {
	            requestTick = requestPortTick;
	            channel.port1.onmessage = flush;
	            flush();
	        };
	        var requestPortTick = function () {
	            // Opera requires us to provide a message payload, regardless of
	            // whether we use it.
	            channel.port2.postMessage(0);
	        };
	        requestTick = function () {
	            setTimeout(flush, 0);
	            requestPortTick();
	        };
	
	    } else {
	        // old browsers
	        requestTick = function () {
	            setTimeout(flush, 0);
	        };
	    }
	    // runs a task after all other tasks have been run
	    // this is useful for unhandled rejection tracking that needs to happen
	    // after all `then`d tasks have been run.
	    nextTick.runAfter = function (task) {
	        laterQueue.push(task);
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	    return nextTick;
	})();
	
	// Attempt to make generics safe in the face of downstream
	// modifications.
	// There is no situation where this is necessary.
	// If you need a security guarantee, these primordials need to be
	// deeply frozen anyway, and if you don’t need a security guarantee,
	// this is just plain paranoid.
	// However, this **might** have the nice side-effect of reducing the size of
	// the minified code by reducing x.call() to merely x()
	// See Mark Miller’s explanation of what this does.
	// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
	var call = Function.call;
	function uncurryThis(f) {
	    return function () {
	        return call.apply(f, arguments);
	    };
	}
	// This is equivalent, but slower:
	// uncurryThis = Function_bind.bind(Function_bind.call);
	// http://jsperf.com/uncurrythis
	
	var array_slice = uncurryThis(Array.prototype.slice);
	
	var array_reduce = uncurryThis(
	    Array.prototype.reduce || function (callback, basis) {
	        var index = 0,
	            length = this.length;
	        // concerning the initial value, if one is not provided
	        if (arguments.length === 1) {
	            // seek to the first value in the array, accounting
	            // for the possibility that is is a sparse array
	            do {
	                if (index in this) {
	                    basis = this[index++];
	                    break;
	                }
	                if (++index >= length) {
	                    throw new TypeError();
	                }
	            } while (1);
	        }
	        // reduce
	        for (; index < length; index++) {
	            // account for the possibility that the array is sparse
	            if (index in this) {
	                basis = callback(basis, this[index], index);
	            }
	        }
	        return basis;
	    }
	);
	
	var array_indexOf = uncurryThis(
	    Array.prototype.indexOf || function (value) {
	        // not a very good shim, but good enough for our one use of it
	        for (var i = 0; i < this.length; i++) {
	            if (this[i] === value) {
	                return i;
	            }
	        }
	        return -1;
	    }
	);
	
	var array_map = uncurryThis(
	    Array.prototype.map || function (callback, thisp) {
	        var self = this;
	        var collect = [];
	        array_reduce(self, function (undefined, value, index) {
	            collect.push(callback.call(thisp, value, index, self));
	        }, void 0);
	        return collect;
	    }
	);
	
	var object_create = Object.create || function (prototype) {
	    function Type() { }
	    Type.prototype = prototype;
	    return new Type();
	};
	
	var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
	
	var object_keys = Object.keys || function (object) {
	    var keys = [];
	    for (var key in object) {
	        if (object_hasOwnProperty(object, key)) {
	            keys.push(key);
	        }
	    }
	    return keys;
	};
	
	var object_toString = uncurryThis(Object.prototype.toString);
	
	function isObject(value) {
	    return value === Object(value);
	}
	
	// generator related shims
	
	// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
	function isStopIteration(exception) {
	    return (
	        object_toString(exception) === "[object StopIteration]" ||
	        exception instanceof QReturnValue
	    );
	}
	
	// FIXME: Remove this helper and Q.return once ES6 generators are in
	// SpiderMonkey.
	var QReturnValue;
	if (typeof ReturnValue !== "undefined") {
	    QReturnValue = ReturnValue;
	} else {
	    QReturnValue = function (value) {
	        this.value = value;
	    };
	}
	
	// long stack traces
	
	var STACK_JUMP_SEPARATOR = "From previous event:";
	
	function makeStackTraceLong(error, promise) {
	    // If possible, transform the error stack trace by removing Node and Q
	    // cruft, then concatenating with the stack trace of `promise`. See #57.
	    if (hasStacks &&
	        promise.stack &&
	        typeof error === "object" &&
	        error !== null &&
	        error.stack &&
	        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
	    ) {
	        var stacks = [];
	        for (var p = promise; !!p; p = p.source) {
	            if (p.stack) {
	                stacks.unshift(p.stack);
	            }
	        }
	        stacks.unshift(error.stack);
	
	        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
	        error.stack = filterStackString(concatedStacks);
	    }
	}
	
	function filterStackString(stackString) {
	    var lines = stackString.split("\n");
	    var desiredLines = [];
	    for (var i = 0; i < lines.length; ++i) {
	        var line = lines[i];
	
	        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
	            desiredLines.push(line);
	        }
	    }
	    return desiredLines.join("\n");
	}
	
	function isNodeFrame(stackLine) {
	    return stackLine.indexOf("(module.js:") !== -1 ||
	           stackLine.indexOf("(node.js:") !== -1;
	}
	
	function getFileNameAndLineNumber(stackLine) {
	    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
	    // In IE10 function name can have spaces ("Anonymous function") O_o
	    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
	    if (attempt1) {
	        return [attempt1[1], Number(attempt1[2])];
	    }
	
	    // Anonymous functions: "at filename:lineNumber:columnNumber"
	    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
	    if (attempt2) {
	        return [attempt2[1], Number(attempt2[2])];
	    }
	
	    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
	    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
	    if (attempt3) {
	        return [attempt3[1], Number(attempt3[2])];
	    }
	}
	
	function isInternalFrame(stackLine) {
	    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
	
	    if (!fileNameAndLineNumber) {
	        return false;
	    }
	
	    var fileName = fileNameAndLineNumber[0];
	    var lineNumber = fileNameAndLineNumber[1];
	
	    return fileName === qFileName &&
	        lineNumber >= qStartingLine &&
	        lineNumber <= qEndingLine;
	}
	
	// discover own file name and line number range for filtering stack
	// traces
	function captureLine() {
	    if (!hasStacks) {
	        return;
	    }
	
	    try {
	        throw new Error();
	    } catch (e) {
	        var lines = e.stack.split("\n");
	        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
	        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
	        if (!fileNameAndLineNumber) {
	            return;
	        }
	
	        qFileName = fileNameAndLineNumber[0];
	        return fileNameAndLineNumber[1];
	    }
	}
	
	function deprecate(callback, name, alternative) {
	    return function () {
	        if (typeof console !== "undefined" &&
	            typeof console.warn === "function") {
	            console.warn(name + " is deprecated, use " + alternative +
	                         " instead.", new Error("").stack);
	        }
	        return callback.apply(callback, arguments);
	    };
	}
	
	// end of shims
	// beginning of real work
	
	/**
	 * Constructs a promise for an immediate reference, passes promises through, or
	 * coerces promises from different systems.
	 * @param value immediate reference or promise
	 */
	function Q(value) {
	    // If the object is already a Promise, return it directly.  This enables
	    // the resolve function to both be used to created references from objects,
	    // but to tolerably coerce non-promises to promises.
	    if (value instanceof Promise) {
	        return value;
	    }
	
	    // assimilate thenables
	    if (isPromiseAlike(value)) {
	        return coerce(value);
	    } else {
	        return fulfill(value);
	    }
	}
	Q.resolve = Q;
	
	/**
	 * Performs a task in a future turn of the event loop.
	 * @param {Function} task
	 */
	Q.nextTick = nextTick;
	
	/**
	 * Controls whether or not long stack traces will be on
	 */
	Q.longStackSupport = false;
	
	// enable long stacks if Q_DEBUG is set
	if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
	    Q.longStackSupport = true;
	}
	
	/**
	 * Constructs a {promise, resolve, reject} object.
	 *
	 * `resolve` is a callback to invoke with a more resolved value for the
	 * promise. To fulfill the promise, invoke `resolve` with any value that is
	 * not a thenable. To reject the promise, invoke `resolve` with a rejected
	 * thenable, or invoke `reject` with the reason directly. To resolve the
	 * promise to another thenable, thus putting it in the same state, invoke
	 * `resolve` with that other thenable.
	 */
	Q.defer = defer;
	function defer() {
	    // if "messages" is an "Array", that indicates that the promise has not yet
	    // been resolved.  If it is "undefined", it has been resolved.  Each
	    // element of the messages array is itself an array of complete arguments to
	    // forward to the resolved promise.  We coerce the resolution value to a
	    // promise using the `resolve` function because it handles both fully
	    // non-thenable values and other thenables gracefully.
	    var messages = [], progressListeners = [], resolvedPromise;
	
	    var deferred = object_create(defer.prototype);
	    var promise = object_create(Promise.prototype);
	
	    promise.promiseDispatch = function (resolve, op, operands) {
	        var args = array_slice(arguments);
	        if (messages) {
	            messages.push(args);
	            if (op === "when" && operands[1]) { // progress operand
	                progressListeners.push(operands[1]);
	            }
	        } else {
	            Q.nextTick(function () {
	                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
	            });
	        }
	    };
	
	    // XXX deprecated
	    promise.valueOf = function () {
	        if (messages) {
	            return promise;
	        }
	        var nearerValue = nearer(resolvedPromise);
	        if (isPromise(nearerValue)) {
	            resolvedPromise = nearerValue; // shorten chain
	        }
	        return nearerValue;
	    };
	
	    promise.inspect = function () {
	        if (!resolvedPromise) {
	            return { state: "pending" };
	        }
	        return resolvedPromise.inspect();
	    };
	
	    if (Q.longStackSupport && hasStacks) {
	        try {
	            throw new Error();
	        } catch (e) {
	            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
	            // accessor around; that causes memory leaks as per GH-111. Just
	            // reify the stack trace as a string ASAP.
	            //
	            // At the same time, cut off the first line; it's always just
	            // "[object Promise]\n", as per the `toString`.
	            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
	        }
	    }
	
	    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
	    // consolidating them into `become`, since otherwise we'd create new
	    // promises with the lines `become(whatever(value))`. See e.g. GH-252.
	
	    function become(newPromise) {
	        resolvedPromise = newPromise;
	        promise.source = newPromise;
	
	        array_reduce(messages, function (undefined, message) {
	            Q.nextTick(function () {
	                newPromise.promiseDispatch.apply(newPromise, message);
	            });
	        }, void 0);
	
	        messages = void 0;
	        progressListeners = void 0;
	    }
	
	    deferred.promise = promise;
	    deferred.resolve = function (value) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(Q(value));
	    };
	
	    deferred.fulfill = function (value) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(fulfill(value));
	    };
	    deferred.reject = function (reason) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(reject(reason));
	    };
	    deferred.notify = function (progress) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        array_reduce(progressListeners, function (undefined, progressListener) {
	            Q.nextTick(function () {
	                progressListener(progress);
	            });
	        }, void 0);
	    };
	
	    return deferred;
	}
	
	/**
	 * Creates a Node-style callback that will resolve or reject the deferred
	 * promise.
	 * @returns a nodeback
	 */
	defer.prototype.makeNodeResolver = function () {
	    var self = this;
	    return function (error, value) {
	        if (error) {
	            self.reject(error);
	        } else if (arguments.length > 2) {
	            self.resolve(array_slice(arguments, 1));
	        } else {
	            self.resolve(value);
	        }
	    };
	};
	
	/**
	 * @param resolver {Function} a function that returns nothing and accepts
	 * the resolve, reject, and notify functions for a deferred.
	 * @returns a promise that may be resolved with the given resolve and reject
	 * functions, or rejected by a thrown exception in resolver
	 */
	Q.Promise = promise; // ES6
	Q.promise = promise;
	function promise(resolver) {
	    if (typeof resolver !== "function") {
	        throw new TypeError("resolver must be a function.");
	    }
	    var deferred = defer();
	    try {
	        resolver(deferred.resolve, deferred.reject, deferred.notify);
	    } catch (reason) {
	        deferred.reject(reason);
	    }
	    return deferred.promise;
	}
	
	promise.race = race; // ES6
	promise.all = all; // ES6
	promise.reject = reject; // ES6
	promise.resolve = Q; // ES6
	
	// XXX experimental.  This method is a way to denote that a local value is
	// serializable and should be immediately dispatched to a remote upon request,
	// instead of passing a reference.
	Q.passByCopy = function (object) {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return object;
	};
	
	Promise.prototype.passByCopy = function () {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return this;
	};
	
	/**
	 * If two promises eventually fulfill to the same value, promises that value,
	 * but otherwise rejects.
	 * @param x {Any*}
	 * @param y {Any*}
	 * @returns {Any*} a promise for x and y if they are the same, but a rejection
	 * otherwise.
	 *
	 */
	Q.join = function (x, y) {
	    return Q(x).join(y);
	};
	
	Promise.prototype.join = function (that) {
	    return Q([this, that]).spread(function (x, y) {
	        if (x === y) {
	            // TODO: "===" should be Object.is or equiv
	            return x;
	        } else {
	            throw new Error("Can't join: not the same: " + x + " " + y);
	        }
	    });
	};
	
	/**
	 * Returns a promise for the first of an array of promises to become settled.
	 * @param answers {Array[Any*]} promises to race
	 * @returns {Any*} the first promise to be settled
	 */
	Q.race = race;
	function race(answerPs) {
	    return promise(function (resolve, reject) {
	        // Switch to this once we can assume at least ES5
	        // answerPs.forEach(function (answerP) {
	        //     Q(answerP).then(resolve, reject);
	        // });
	        // Use this in the meantime
	        for (var i = 0, len = answerPs.length; i < len; i++) {
	            Q(answerPs[i]).then(resolve, reject);
	        }
	    });
	}
	
	Promise.prototype.race = function () {
	    return this.then(Q.race);
	};
	
	/**
	 * Constructs a Promise with a promise descriptor object and optional fallback
	 * function.  The descriptor contains methods like when(rejected), get(name),
	 * set(name, value), post(name, args), and delete(name), which all
	 * return either a value, a promise for a value, or a rejection.  The fallback
	 * accepts the operation name, a resolver, and any further arguments that would
	 * have been forwarded to the appropriate method above had a method been
	 * provided with the proper name.  The API makes no guarantees about the nature
	 * of the returned object, apart from that it is usable whereever promises are
	 * bought and sold.
	 */
	Q.makePromise = Promise;
	function Promise(descriptor, fallback, inspect) {
	    if (fallback === void 0) {
	        fallback = function (op) {
	            return reject(new Error(
	                "Promise does not support operation: " + op
	            ));
	        };
	    }
	    if (inspect === void 0) {
	        inspect = function () {
	            return {state: "unknown"};
	        };
	    }
	
	    var promise = object_create(Promise.prototype);
	
	    promise.promiseDispatch = function (resolve, op, args) {
	        var result;
	        try {
	            if (descriptor[op]) {
	                result = descriptor[op].apply(promise, args);
	            } else {
	                result = fallback.call(promise, op, args);
	            }
	        } catch (exception) {
	            result = reject(exception);
	        }
	        if (resolve) {
	            resolve(result);
	        }
	    };
	
	    promise.inspect = inspect;
	
	    // XXX deprecated `valueOf` and `exception` support
	    if (inspect) {
	        var inspected = inspect();
	        if (inspected.state === "rejected") {
	            promise.exception = inspected.reason;
	        }
	
	        promise.valueOf = function () {
	            var inspected = inspect();
	            if (inspected.state === "pending" ||
	                inspected.state === "rejected") {
	                return promise;
	            }
	            return inspected.value;
	        };
	    }
	
	    return promise;
	}
	
	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};
	
	Promise.prototype.then = function (fulfilled, rejected, progressed) {
	    var self = this;
	    var deferred = defer();
	    var done = false;   // ensure the untrusted promise makes at most a
	                        // single call to one of the callbacks
	
	    function _fulfilled(value) {
	        try {
	            return typeof fulfilled === "function" ? fulfilled(value) : value;
	        } catch (exception) {
	            return reject(exception);
	        }
	    }
	
	    function _rejected(exception) {
	        if (typeof rejected === "function") {
	            makeStackTraceLong(exception, self);
	            try {
	                return rejected(exception);
	            } catch (newException) {
	                return reject(newException);
	            }
	        }
	        return reject(exception);
	    }
	
	    function _progressed(value) {
	        return typeof progressed === "function" ? progressed(value) : value;
	    }
	
	    Q.nextTick(function () {
	        self.promiseDispatch(function (value) {
	            if (done) {
	                return;
	            }
	            done = true;
	
	            deferred.resolve(_fulfilled(value));
	        }, "when", [function (exception) {
	            if (done) {
	                return;
	            }
	            done = true;
	
	            deferred.resolve(_rejected(exception));
	        }]);
	    });
	
	    // Progress propagator need to be attached in the current tick.
	    self.promiseDispatch(void 0, "when", [void 0, function (value) {
	        var newValue;
	        var threw = false;
	        try {
	            newValue = _progressed(value);
	        } catch (e) {
	            threw = true;
	            if (Q.onerror) {
	                Q.onerror(e);
	            } else {
	                throw e;
	            }
	        }
	
	        if (!threw) {
	            deferred.notify(newValue);
	        }
	    }]);
	
	    return deferred.promise;
	};
	
	Q.tap = function (promise, callback) {
	    return Q(promise).tap(callback);
	};
	
	/**
	 * Works almost like "finally", but not called for rejections.
	 * Original resolution value is passed through callback unaffected.
	 * Callback may return a promise that will be awaited for.
	 * @param {Function} callback
	 * @returns {Q.Promise}
	 * @example
	 * doSomething()
	 *   .then(...)
	 *   .tap(console.log)
	 *   .then(...);
	 */
	Promise.prototype.tap = function (callback) {
	    callback = Q(callback);
	
	    return this.then(function (value) {
	        return callback.fcall(value).thenResolve(value);
	    });
	};
	
	/**
	 * Registers an observer on a promise.
	 *
	 * Guarantees:
	 *
	 * 1. that fulfilled and rejected will be called only once.
	 * 2. that either the fulfilled callback or the rejected callback will be
	 *    called, but not both.
	 * 3. that fulfilled and rejected will not be called in this turn.
	 *
	 * @param value      promise or immediate reference to observe
	 * @param fulfilled  function to be called with the fulfilled value
	 * @param rejected   function to be called with the rejection exception
	 * @param progressed function to be called on any progress notifications
	 * @return promise for the return value from the invoked callback
	 */
	Q.when = when;
	function when(value, fulfilled, rejected, progressed) {
	    return Q(value).then(fulfilled, rejected, progressed);
	}
	
	Promise.prototype.thenResolve = function (value) {
	    return this.then(function () { return value; });
	};
	
	Q.thenResolve = function (promise, value) {
	    return Q(promise).thenResolve(value);
	};
	
	Promise.prototype.thenReject = function (reason) {
	    return this.then(function () { throw reason; });
	};
	
	Q.thenReject = function (promise, reason) {
	    return Q(promise).thenReject(reason);
	};
	
	/**
	 * If an object is not a promise, it is as "near" as possible.
	 * If a promise is rejected, it is as "near" as possible too.
	 * If it’s a fulfilled promise, the fulfillment value is nearer.
	 * If it’s a deferred promise and the deferred has been resolved, the
	 * resolution is "nearer".
	 * @param object
	 * @returns most resolved (nearest) form of the object
	 */
	
	// XXX should we re-do this?
	Q.nearer = nearer;
	function nearer(value) {
	    if (isPromise(value)) {
	        var inspected = value.inspect();
	        if (inspected.state === "fulfilled") {
	            return inspected.value;
	        }
	    }
	    return value;
	}
	
	/**
	 * @returns whether the given object is a promise.
	 * Otherwise it is a fulfilled value.
	 */
	Q.isPromise = isPromise;
	function isPromise(object) {
	    return object instanceof Promise;
	}
	
	Q.isPromiseAlike = isPromiseAlike;
	function isPromiseAlike(object) {
	    return isObject(object) && typeof object.then === "function";
	}
	
	/**
	 * @returns whether the given object is a pending promise, meaning not
	 * fulfilled or rejected.
	 */
	Q.isPending = isPending;
	function isPending(object) {
	    return isPromise(object) && object.inspect().state === "pending";
	}
	
	Promise.prototype.isPending = function () {
	    return this.inspect().state === "pending";
	};
	
	/**
	 * @returns whether the given object is a value or fulfilled
	 * promise.
	 */
	Q.isFulfilled = isFulfilled;
	function isFulfilled(object) {
	    return !isPromise(object) || object.inspect().state === "fulfilled";
	}
	
	Promise.prototype.isFulfilled = function () {
	    return this.inspect().state === "fulfilled";
	};
	
	/**
	 * @returns whether the given object is a rejected promise.
	 */
	Q.isRejected = isRejected;
	function isRejected(object) {
	    return isPromise(object) && object.inspect().state === "rejected";
	}
	
	Promise.prototype.isRejected = function () {
	    return this.inspect().state === "rejected";
	};
	
	//// BEGIN UNHANDLED REJECTION TRACKING
	
	// This promise library consumes exceptions thrown in handlers so they can be
	// handled by a subsequent promise.  The exceptions get added to this array when
	// they are created, and removed when they are handled.  Note that in ES6 or
	// shimmed environments, this would naturally be a `Set`.
	var unhandledReasons = [];
	var unhandledRejections = [];
	var reportedUnhandledRejections = [];
	var trackUnhandledRejections = true;
	
	function resetUnhandledRejections() {
	    unhandledReasons.length = 0;
	    unhandledRejections.length = 0;
	
	    if (!trackUnhandledRejections) {
	        trackUnhandledRejections = true;
	    }
	}
	
	function trackRejection(promise, reason) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	    if (typeof process === "object" && typeof process.emit === "function") {
	        Q.nextTick.runAfter(function () {
	            if (array_indexOf(unhandledRejections, promise) !== -1) {
	                process.emit("unhandledRejection", reason, promise);
	                reportedUnhandledRejections.push(promise);
	            }
	        });
	    }
	
	    unhandledRejections.push(promise);
	    if (reason && typeof reason.stack !== "undefined") {
	        unhandledReasons.push(reason.stack);
	    } else {
	        unhandledReasons.push("(no stack) " + reason);
	    }
	}
	
	function untrackRejection(promise) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	
	    var at = array_indexOf(unhandledRejections, promise);
	    if (at !== -1) {
	        if (typeof process === "object" && typeof process.emit === "function") {
	            Q.nextTick.runAfter(function () {
	                var atReport = array_indexOf(reportedUnhandledRejections, promise);
	                if (atReport !== -1) {
	                    process.emit("rejectionHandled", unhandledReasons[at], promise);
	                    reportedUnhandledRejections.splice(atReport, 1);
	                }
	            });
	        }
	        unhandledRejections.splice(at, 1);
	        unhandledReasons.splice(at, 1);
	    }
	}
	
	Q.resetUnhandledRejections = resetUnhandledRejections;
	
	Q.getUnhandledReasons = function () {
	    // Make a copy so that consumers can't interfere with our internal state.
	    return unhandledReasons.slice();
	};
	
	Q.stopUnhandledRejectionTracking = function () {
	    resetUnhandledRejections();
	    trackUnhandledRejections = false;
	};
	
	resetUnhandledRejections();
	
	//// END UNHANDLED REJECTION TRACKING
	
	/**
	 * Constructs a rejected promise.
	 * @param reason value describing the failure
	 */
	Q.reject = reject;
	function reject(reason) {
	    var rejection = Promise({
	        "when": function (rejected) {
	            // note that the error has been handled
	            if (rejected) {
	                untrackRejection(this);
	            }
	            return rejected ? rejected(reason) : this;
	        }
	    }, function fallback() {
	        return this;
	    }, function inspect() {
	        return { state: "rejected", reason: reason };
	    });
	
	    // Note that the reason has not been handled.
	    trackRejection(rejection, reason);
	
	    return rejection;
	}
	
	/**
	 * Constructs a fulfilled promise for an immediate reference.
	 * @param value immediate reference
	 */
	Q.fulfill = fulfill;
	function fulfill(value) {
	    return Promise({
	        "when": function () {
	            return value;
	        },
	        "get": function (name) {
	            return value[name];
	        },
	        "set": function (name, rhs) {
	            value[name] = rhs;
	        },
	        "delete": function (name) {
	            delete value[name];
	        },
	        "post": function (name, args) {
	            // Mark Miller proposes that post with no name should apply a
	            // promised function.
	            if (name === null || name === void 0) {
	                return value.apply(void 0, args);
	            } else {
	                return value[name].apply(value, args);
	            }
	        },
	        "apply": function (thisp, args) {
	            return value.apply(thisp, args);
	        },
	        "keys": function () {
	            return object_keys(value);
	        }
	    }, void 0, function inspect() {
	        return { state: "fulfilled", value: value };
	    });
	}
	
	/**
	 * Converts thenables to Q promises.
	 * @param promise thenable promise
	 * @returns a Q promise
	 */
	function coerce(promise) {
	    var deferred = defer();
	    Q.nextTick(function () {
	        try {
	            promise.then(deferred.resolve, deferred.reject, deferred.notify);
	        } catch (exception) {
	            deferred.reject(exception);
	        }
	    });
	    return deferred.promise;
	}
	
	/**
	 * Annotates an object such that it will never be
	 * transferred away from this process over any promise
	 * communication channel.
	 * @param object
	 * @returns promise a wrapping of that object that
	 * additionally responds to the "isDef" message
	 * without a rejection.
	 */
	Q.master = master;
	function master(object) {
	    return Promise({
	        "isDef": function () {}
	    }, function fallback(op, args) {
	        return dispatch(object, op, args);
	    }, function () {
	        return Q(object).inspect();
	    });
	}
	
	/**
	 * Spreads the values of a promised array of arguments into the
	 * fulfillment callback.
	 * @param fulfilled callback that receives variadic arguments from the
	 * promised array
	 * @param rejected callback that receives the exception if the promise
	 * is rejected.
	 * @returns a promise for the return value or thrown exception of
	 * either callback.
	 */
	Q.spread = spread;
	function spread(value, fulfilled, rejected) {
	    return Q(value).spread(fulfilled, rejected);
	}
	
	Promise.prototype.spread = function (fulfilled, rejected) {
	    return this.all().then(function (array) {
	        return fulfilled.apply(void 0, array);
	    }, rejected);
	};
	
	/**
	 * The async function is a decorator for generator functions, turning
	 * them into asynchronous generators.  Although generators are only part
	 * of the newest ECMAScript 6 drafts, this code does not cause syntax
	 * errors in older engines.  This code should continue to work and will
	 * in fact improve over time as the language improves.
	 *
	 * ES6 generators are currently part of V8 version 3.19 with the
	 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
	 * for longer, but under an older Python-inspired form.  This function
	 * works on both kinds of generators.
	 *
	 * Decorates a generator function such that:
	 *  - it may yield promises
	 *  - execution will continue when that promise is fulfilled
	 *  - the value of the yield expression will be the fulfilled value
	 *  - it returns a promise for the return value (when the generator
	 *    stops iterating)
	 *  - the decorated function returns a promise for the return value
	 *    of the generator or the first rejected promise among those
	 *    yielded.
	 *  - if an error is thrown in the generator, it propagates through
	 *    every following yield until it is caught, or until it escapes
	 *    the generator function altogether, and is translated into a
	 *    rejection for the promise returned by the decorated generator.
	 */
	Q.async = async;
	function async(makeGenerator) {
	    return function () {
	        // when verb is "send", arg is a value
	        // when verb is "throw", arg is an exception
	        function continuer(verb, arg) {
	            var result;
	
	            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
	            // engine that has a deployed base of browsers that support generators.
	            // However, SM's generators use the Python-inspired semantics of
	            // outdated ES6 drafts.  We would like to support ES6, but we'd also
	            // like to make it possible to use generators in deployed browsers, so
	            // we also support Python-style generators.  At some point we can remove
	            // this block.
	
	            if (typeof StopIteration === "undefined") {
	                // ES6 Generators
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    return reject(exception);
	                }
	                if (result.done) {
	                    return Q(result.value);
	                } else {
	                    return when(result.value, callback, errback);
	                }
	            } else {
	                // SpiderMonkey Generators
	                // FIXME: Remove this case when SM does ES6 generators.
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    if (isStopIteration(exception)) {
	                        return Q(exception.value);
	                    } else {
	                        return reject(exception);
	                    }
	                }
	                return when(result, callback, errback);
	            }
	        }
	        var generator = makeGenerator.apply(this, arguments);
	        var callback = continuer.bind(continuer, "next");
	        var errback = continuer.bind(continuer, "throw");
	        return callback();
	    };
	}
	
	/**
	 * The spawn function is a small wrapper around async that immediately
	 * calls the generator and also ends the promise chain, so that any
	 * unhandled errors are thrown instead of forwarded to the error
	 * handler. This is useful because it's extremely common to run
	 * generators at the top-level to work with libraries.
	 */
	Q.spawn = spawn;
	function spawn(makeGenerator) {
	    Q.done(Q.async(makeGenerator)());
	}
	
	// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
	/**
	 * Throws a ReturnValue exception to stop an asynchronous generator.
	 *
	 * This interface is a stop-gap measure to support generator return
	 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
	 * generators like Chromium 29, just use "return" in your generator
	 * functions.
	 *
	 * @param value the return value for the surrounding generator
	 * @throws ReturnValue exception with the value.
	 * @example
	 * // ES6 style
	 * Q.async(function* () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      return foo + bar;
	 * })
	 * // Older SpiderMonkey style
	 * Q.async(function () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      Q.return(foo + bar);
	 * })
	 */
	Q["return"] = _return;
	function _return(value) {
	    throw new QReturnValue(value);
	}
	
	/**
	 * The promised function decorator ensures that any promise arguments
	 * are settled and passed as values (`this` is also settled and passed
	 * as a value).  It will also ensure that the result of a function is
	 * always a promise.
	 *
	 * @example
	 * var add = Q.promised(function (a, b) {
	 *     return a + b;
	 * });
	 * add(Q(a), Q(B));
	 *
	 * @param {function} callback The function to decorate
	 * @returns {function} a function that has been decorated.
	 */
	Q.promised = promised;
	function promised(callback) {
	    return function () {
	        return spread([this, all(arguments)], function (self, args) {
	            return callback.apply(self, args);
	        });
	    };
	}
	
	/**
	 * sends a message to a value in a future turn
	 * @param object* the recipient
	 * @param op the name of the message operation, e.g., "when",
	 * @param args further arguments to be forwarded to the operation
	 * @returns result {Promise} a promise for the result of the operation
	 */
	Q.dispatch = dispatch;
	function dispatch(object, op, args) {
	    return Q(object).dispatch(op, args);
	}
	
	Promise.prototype.dispatch = function (op, args) {
	    var self = this;
	    var deferred = defer();
	    Q.nextTick(function () {
	        self.promiseDispatch(deferred.resolve, op, args);
	    });
	    return deferred.promise;
	};
	
	/**
	 * Gets the value of a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to get
	 * @return promise for the property value
	 */
	Q.get = function (object, key) {
	    return Q(object).dispatch("get", [key]);
	};
	
	Promise.prototype.get = function (key) {
	    return this.dispatch("get", [key]);
	};
	
	/**
	 * Sets the value of a property in a future turn.
	 * @param object    promise or immediate reference for object object
	 * @param name      name of property to set
	 * @param value     new value of property
	 * @return promise for the return value
	 */
	Q.set = function (object, key, value) {
	    return Q(object).dispatch("set", [key, value]);
	};
	
	Promise.prototype.set = function (key, value) {
	    return this.dispatch("set", [key, value]);
	};
	
	/**
	 * Deletes a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to delete
	 * @return promise for the return value
	 */
	Q.del = // XXX legacy
	Q["delete"] = function (object, key) {
	    return Q(object).dispatch("delete", [key]);
	};
	
	Promise.prototype.del = // XXX legacy
	Promise.prototype["delete"] = function (key) {
	    return this.dispatch("delete", [key]);
	};
	
	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param value     a value to post, typically an array of
	 *                  invocation arguments for promises that
	 *                  are ultimately backed with `resolve` values,
	 *                  as opposed to those backed with URLs
	 *                  wherein the posted value can be any
	 *                  JSON serializable object.
	 * @return promise for the return value
	 */
	// bound locally because it is used by other methods
	Q.mapply = // XXX As proposed by "Redsandro"
	Q.post = function (object, name, args) {
	    return Q(object).dispatch("post", [name, args]);
	};
	
	Promise.prototype.mapply = // XXX As proposed by "Redsandro"
	Promise.prototype.post = function (name, args) {
	    return this.dispatch("post", [name, args]);
	};
	
	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param ...args   array of invocation arguments
	 * @return promise for the return value
	 */
	Q.send = // XXX Mark Miller's proposed parlance
	Q.mcall = // XXX As proposed by "Redsandro"
	Q.invoke = function (object, name /*...args*/) {
	    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
	};
	
	Promise.prototype.send = // XXX Mark Miller's proposed parlance
	Promise.prototype.mcall = // XXX As proposed by "Redsandro"
	Promise.prototype.invoke = function (name /*...args*/) {
	    return this.dispatch("post", [name, array_slice(arguments, 1)]);
	};
	
	/**
	 * Applies the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param args      array of application arguments
	 */
	Q.fapply = function (object, args) {
	    return Q(object).dispatch("apply", [void 0, args]);
	};
	
	Promise.prototype.fapply = function (args) {
	    return this.dispatch("apply", [void 0, args]);
	};
	
	/**
	 * Calls the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q["try"] =
	Q.fcall = function (object /* ...args*/) {
	    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
	};
	
	Promise.prototype.fcall = function (/*...args*/) {
	    return this.dispatch("apply", [void 0, array_slice(arguments)]);
	};
	
	/**
	 * Binds the promised function, transforming return values into a fulfilled
	 * promise and thrown errors into a rejected one.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q.fbind = function (object /*...args*/) {
	    var promise = Q(object);
	    var args = array_slice(arguments, 1);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	Promise.prototype.fbind = function (/*...args*/) {
	    var promise = this;
	    var args = array_slice(arguments);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	
	/**
	 * Requests the names of the owned properties of a promised
	 * object in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @return promise for the keys of the eventually settled object
	 */
	Q.keys = function (object) {
	    return Q(object).dispatch("keys", []);
	};
	
	Promise.prototype.keys = function () {
	    return this.dispatch("keys", []);
	};
	
	/**
	 * Turns an array of promises into a promise for an array.  If any of
	 * the promises gets rejected, the whole array is rejected immediately.
	 * @param {Array*} an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns a promise for an array of the corresponding values
	 */
	// By Mark Miller
	// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
	Q.all = all;
	function all(promises) {
	    return when(promises, function (promises) {
	        var pendingCount = 0;
	        var deferred = defer();
	        array_reduce(promises, function (undefined, promise, index) {
	            var snapshot;
	            if (
	                isPromise(promise) &&
	                (snapshot = promise.inspect()).state === "fulfilled"
	            ) {
	                promises[index] = snapshot.value;
	            } else {
	                ++pendingCount;
	                when(
	                    promise,
	                    function (value) {
	                        promises[index] = value;
	                        if (--pendingCount === 0) {
	                            deferred.resolve(promises);
	                        }
	                    },
	                    deferred.reject,
	                    function (progress) {
	                        deferred.notify({ index: index, value: progress });
	                    }
	                );
	            }
	        }, void 0);
	        if (pendingCount === 0) {
	            deferred.resolve(promises);
	        }
	        return deferred.promise;
	    });
	}
	
	Promise.prototype.all = function () {
	    return all(this);
	};
	
	/**
	 * Returns the first resolved promise of an array. Prior rejected promises are
	 * ignored.  Rejects only if all promises are rejected.
	 * @param {Array*} an array containing values or promises for values
	 * @returns a promise fulfilled with the value of the first resolved promise,
	 * or a rejected promise if all promises are rejected.
	 */
	Q.any = any;
	
	function any(promises) {
	    if (promises.length === 0) {
	        return Q.resolve();
	    }
	
	    var deferred = Q.defer();
	    var pendingCount = 0;
	    array_reduce(promises, function (prev, current, index) {
	        var promise = promises[index];
	
	        pendingCount++;
	
	        when(promise, onFulfilled, onRejected, onProgress);
	        function onFulfilled(result) {
	            deferred.resolve(result);
	        }
	        function onRejected() {
	            pendingCount--;
	            if (pendingCount === 0) {
	                deferred.reject(new Error(
	                    "Can't get fulfillment value from any promise, all " +
	                    "promises were rejected."
	                ));
	            }
	        }
	        function onProgress(progress) {
	            deferred.notify({
	                index: index,
	                value: progress
	            });
	        }
	    }, undefined);
	
	    return deferred.promise;
	}
	
	Promise.prototype.any = function () {
	    return any(this);
	};
	
	/**
	 * Waits for all promises to be settled, either fulfilled or
	 * rejected.  This is distinct from `all` since that would stop
	 * waiting at the first rejection.  The promise returned by
	 * `allResolved` will never be rejected.
	 * @param promises a promise for an array (or an array) of promises
	 * (or values)
	 * @return a promise for an array of promises
	 */
	Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
	function allResolved(promises) {
	    return when(promises, function (promises) {
	        promises = array_map(promises, Q);
	        return when(all(array_map(promises, function (promise) {
	            return when(promise, noop, noop);
	        })), function () {
	            return promises;
	        });
	    });
	}
	
	Promise.prototype.allResolved = function () {
	    return allResolved(this);
	};
	
	/**
	 * @see Promise#allSettled
	 */
	Q.allSettled = allSettled;
	function allSettled(promises) {
	    return Q(promises).allSettled();
	}
	
	/**
	 * Turns an array of promises into a promise for an array of their states (as
	 * returned by `inspect`) when they have all settled.
	 * @param {Array[Any*]} values an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns {Array[State]} an array of states for the respective values.
	 */
	Promise.prototype.allSettled = function () {
	    return this.then(function (promises) {
	        return all(array_map(promises, function (promise) {
	            promise = Q(promise);
	            function regardless() {
	                return promise.inspect();
	            }
	            return promise.then(regardless, regardless);
	        }));
	    });
	};
	
	/**
	 * Captures the failure of a promise, giving an oportunity to recover
	 * with a callback.  If the given promise is fulfilled, the returned
	 * promise is fulfilled.
	 * @param {Any*} promise for something
	 * @param {Function} callback to fulfill the returned promise if the
	 * given promise is rejected
	 * @returns a promise for the return value of the callback
	 */
	Q.fail = // XXX legacy
	Q["catch"] = function (object, rejected) {
	    return Q(object).then(void 0, rejected);
	};
	
	Promise.prototype.fail = // XXX legacy
	Promise.prototype["catch"] = function (rejected) {
	    return this.then(void 0, rejected);
	};
	
	/**
	 * Attaches a listener that can respond to progress notifications from a
	 * promise's originating deferred. This listener receives the exact arguments
	 * passed to ``deferred.notify``.
	 * @param {Any*} promise for something
	 * @param {Function} callback to receive any progress notifications
	 * @returns the given promise, unchanged
	 */
	Q.progress = progress;
	function progress(object, progressed) {
	    return Q(object).then(void 0, void 0, progressed);
	}
	
	Promise.prototype.progress = function (progressed) {
	    return this.then(void 0, void 0, progressed);
	};
	
	/**
	 * Provides an opportunity to observe the settling of a promise,
	 * regardless of whether the promise is fulfilled or rejected.  Forwards
	 * the resolution to the returned promise when the callback is done.
	 * The callback can return a promise to defer completion.
	 * @param {Any*} promise
	 * @param {Function} callback to observe the resolution of the given
	 * promise, takes no arguments.
	 * @returns a promise for the resolution of the given promise when
	 * ``fin`` is done.
	 */
	Q.fin = // XXX legacy
	Q["finally"] = function (object, callback) {
	    return Q(object)["finally"](callback);
	};
	
	Promise.prototype.fin = // XXX legacy
	Promise.prototype["finally"] = function (callback) {
	    callback = Q(callback);
	    return this.then(function (value) {
	        return callback.fcall().then(function () {
	            return value;
	        });
	    }, function (reason) {
	        // TODO attempt to recycle the rejection with "this".
	        return callback.fcall().then(function () {
	            throw reason;
	        });
	    });
	};
	
	/**
	 * Terminates a chain of promises, forcing rejections to be
	 * thrown as exceptions.
	 * @param {Any*} promise at the end of a chain of promises
	 * @returns nothing
	 */
	Q.done = function (object, fulfilled, rejected, progress) {
	    return Q(object).done(fulfilled, rejected, progress);
	};
	
	Promise.prototype.done = function (fulfilled, rejected, progress) {
	    var onUnhandledError = function (error) {
	        // forward to a future turn so that ``when``
	        // does not catch it and turn it into a rejection.
	        Q.nextTick(function () {
	            makeStackTraceLong(error, promise);
	            if (Q.onerror) {
	                Q.onerror(error);
	            } else {
	                throw error;
	            }
	        });
	    };
	
	    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
	    var promise = fulfilled || rejected || progress ?
	        this.then(fulfilled, rejected, progress) :
	        this;
	
	    if (typeof process === "object" && process && process.domain) {
	        onUnhandledError = process.domain.bind(onUnhandledError);
	    }
	
	    promise.then(void 0, onUnhandledError);
	};
	
	/**
	 * Causes a promise to be rejected if it does not get fulfilled before
	 * some milliseconds time out.
	 * @param {Any*} promise
	 * @param {Number} milliseconds timeout
	 * @param {Any*} custom error message or Error object (optional)
	 * @returns a promise for the resolution of the given promise if it is
	 * fulfilled before the timeout, otherwise rejected.
	 */
	Q.timeout = function (object, ms, error) {
	    return Q(object).timeout(ms, error);
	};
	
	Promise.prototype.timeout = function (ms, error) {
	    var deferred = defer();
	    var timeoutId = setTimeout(function () {
	        if (!error || "string" === typeof error) {
	            error = new Error(error || "Timed out after " + ms + " ms");
	            error.code = "ETIMEDOUT";
	        }
	        deferred.reject(error);
	    }, ms);
	
	    this.then(function (value) {
	        clearTimeout(timeoutId);
	        deferred.resolve(value);
	    }, function (exception) {
	        clearTimeout(timeoutId);
	        deferred.reject(exception);
	    }, deferred.notify);
	
	    return deferred.promise;
	};
	
	/**
	 * Returns a promise for the given value (or promised value), some
	 * milliseconds after it resolved. Passes rejections immediately.
	 * @param {Any*} promise
	 * @param {Number} milliseconds
	 * @returns a promise for the resolution of the given promise after milliseconds
	 * time has elapsed since the resolution of the given promise.
	 * If the given promise rejects, that is passed immediately.
	 */
	Q.delay = function (object, timeout) {
	    if (timeout === void 0) {
	        timeout = object;
	        object = void 0;
	    }
	    return Q(object).delay(timeout);
	};
	
	Promise.prototype.delay = function (timeout) {
	    return this.then(function (value) {
	        var deferred = defer();
	        setTimeout(function () {
	            deferred.resolve(value);
	        }, timeout);
	        return deferred.promise;
	    });
	};
	
	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided as an array, and returns a promise.
	 *
	 *      Q.nfapply(FS.readFile, [__filename])
	 *      .then(function (content) {
	 *      })
	 *
	 */
	Q.nfapply = function (callback, args) {
	    return Q(callback).nfapply(args);
	};
	
	Promise.prototype.nfapply = function (args) {
	    var deferred = defer();
	    var nodeArgs = array_slice(args);
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided individually, and returns a promise.
	 * @example
	 * Q.nfcall(FS.readFile, __filename)
	 * .then(function (content) {
	 * })
	 *
	 */
	Q.nfcall = function (callback /*...args*/) {
	    var args = array_slice(arguments, 1);
	    return Q(callback).nfapply(args);
	};
	
	Promise.prototype.nfcall = function (/*...args*/) {
	    var nodeArgs = array_slice(arguments);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Wraps a NodeJS continuation passing function and returns an equivalent
	 * version that returns a promise.
	 * @example
	 * Q.nfbind(FS.readFile, __filename)("utf-8")
	 * .then(console.log)
	 * .done()
	 */
	Q.nfbind =
	Q.denodeify = function (callback /*...args*/) {
	    var baseArgs = array_slice(arguments, 1);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        Q(callback).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};
	
	Promise.prototype.nfbind =
	Promise.prototype.denodeify = function (/*...args*/) {
	    var args = array_slice(arguments);
	    args.unshift(this);
	    return Q.denodeify.apply(void 0, args);
	};
	
	Q.nbind = function (callback, thisp /*...args*/) {
	    var baseArgs = array_slice(arguments, 2);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        function bound() {
	            return callback.apply(thisp, arguments);
	        }
	        Q(bound).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};
	
	Promise.prototype.nbind = function (/*thisp, ...args*/) {
	    var args = array_slice(arguments, 0);
	    args.unshift(this);
	    return Q.nbind.apply(void 0, args);
	};
	
	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback with a given array of arguments, plus a provided callback.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param {Array} args arguments to pass to the method; the callback
	 * will be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nmapply = // XXX As proposed by "Redsandro"
	Q.npost = function (object, name, args) {
	    return Q(object).npost(name, args);
	};
	
	Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
	Promise.prototype.npost = function (name, args) {
	    var nodeArgs = array_slice(args || []);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback, forwarding the given variadic arguments, plus a provided
	 * callback argument.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param ...args arguments to pass to the method; the callback will
	 * be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nsend = // XXX Based on Mark Miller's proposed "send"
	Q.nmcall = // XXX Based on "Redsandro's" proposal
	Q.ninvoke = function (object, name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 2);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
	Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
	Promise.prototype.ninvoke = function (name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 1);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * If a function would like to support both Node continuation-passing-style and
	 * promise-returning-style, it can end its internal promise chain with
	 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
	 * elects to use a nodeback, the result will be sent there.  If they do not
	 * pass a nodeback, they will receive the result promise.
	 * @param object a result (or a promise for a result)
	 * @param {Function} nodeback a Node.js-style callback
	 * @returns either the promise or nothing
	 */
	Q.nodeify = nodeify;
	function nodeify(object, nodeback) {
	    return Q(object).nodeify(nodeback);
	}
	
	Promise.prototype.nodeify = function (nodeback) {
	    if (nodeback) {
	        this.then(function (value) {
	            Q.nextTick(function () {
	                nodeback(null, value);
	            });
	        }, function (error) {
	            Q.nextTick(function () {
	                nodeback(error);
	            });
	        });
	    } else {
	        return this;
	    }
	};
	
	Q.noConflict = function() {
	    throw new Error("Q.noConflict only works when Q is used as a global");
	};
	
	// All code before this point will be filtered from stack traces.
	var qEndingLine = captureLine();
	
	return Q;
	
	});
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(7).setImmediate))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var scope = (typeof global !== "undefined" && global) ||
	            (typeof self !== "undefined" && self) ||
	            window;
	var apply = Function.prototype.apply;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(scope, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// setimmediate attaches itself to the global object
	__webpack_require__(8);
	// On some exotic environments, it's not clear which object `setimmediate` was
	// able to install onto.  Search each possibility in the same order as the
	// `setimmediate` library.
	exports.setImmediate = (typeof self !== "undefined" && self.setImmediate) ||
	                       (typeof global !== "undefined" && global.setImmediate) ||
	                       (this && this.setImmediate);
	exports.clearImmediate = (typeof self !== "undefined" && self.clearImmediate) ||
	                         (typeof global !== "undefined" && global.clearImmediate) ||
	                         (this && this.clearImmediate);
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";
	
	    if (global.setImmediate) {
	        return;
	    }
	
	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;
	
	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }
	
	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }
	
	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }
	
	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }
	
	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }
	
	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }
	
	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
	
	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };
	
	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }
	
	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }
	
	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };
	
	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }
	
	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }
	
	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }
	
	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;
	
	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();
	
	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();
	
	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();
	
	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();
	
	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }
	
	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(1)))

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYTdlMTI1OWI0YjRiZTA5MTRjMTUiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dlYi9qcy9iZWZvcmVQeXJldC5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL34vbm9kZS1saWJzLWJyb3dzZXIvfi9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi91cmwuanMvdXJsLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2FtZC1kZWZpbmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dlYi9qcy9tb2RhbC1wcm9tcHQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9xL3EuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9+L25vZGUtbGlicy1icm93c2VyL34vdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL34vbm9kZS1saWJzLWJyb3dzZXIvfi90aW1lcnMtYnJvd3NlcmlmeS9+L3NldGltbWVkaWF0ZS9zZXRJbW1lZGlhdGUuanMiXSwibmFtZXMiOlsic2hhcmVBUEkiLCJtYWtlU2hhcmVBUEkiLCJ1cmwiLCJyZXF1aXJlIiwibW9kYWxQcm9tcHQiLCJ3aW5kb3ciLCJMT0ciLCJjdF9sb2ciLCJjb25zb2xlIiwibG9nIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJjdF9lcnJvciIsImVycm9yIiwiaW5pdGlhbFBhcmFtcyIsInBhcnNlIiwiZG9jdW1lbnQiLCJsb2NhdGlvbiIsImhyZWYiLCJwYXJhbXMiLCJoaWdobGlnaHRNb2RlIiwiY2xlYXJGbGFzaCIsIiQiLCJlbXB0eSIsInN0aWNrRXJyb3IiLCJtZXNzYWdlIiwibW9yZSIsIkNQTyIsInNheUFuZEZvcmdldCIsImVyciIsImFkZENsYXNzIiwidGV4dCIsImF0dHIiLCJ0b29sdGlwIiwicHJlcGVuZCIsImZsYXNoRXJyb3IiLCJmYWRlT3V0IiwiZmxhc2hNZXNzYWdlIiwibXNnIiwic3RpY2tNZXNzYWdlIiwibWtXYXJuaW5nVXBwZXIiLCJta1dhcm5pbmdMb3dlciIsImJpbmQiLCJEb2N1bWVudHMiLCJkb2N1bWVudHMiLCJNYXAiLCJwcm90b3R5cGUiLCJoYXMiLCJuYW1lIiwiZ2V0Iiwic2V0IiwiZG9jIiwibG9nZ2VyIiwiaXNEZXRhaWxlZCIsInZhbHVlIiwiZ2V0VmFsdWUiLCJkZWxldGUiLCJmb3JFYWNoIiwiZiIsIlZFUlNJT05fQ0hFQ0tfSU5URVJWQUwiLCJNYXRoIiwicmFuZG9tIiwiY2hlY2tWZXJzaW9uIiwidGhlbiIsInJlc3AiLCJKU09OIiwidmVyc2lvbiIsInNldEludGVydmFsIiwic2F2ZSIsImF1dG9TYXZlIiwibWVyZ2UiLCJvYmoiLCJleHRlbnNpb24iLCJuZXdvYmoiLCJPYmplY3QiLCJrZXlzIiwiayIsImFuaW1hdGlvbkRpdiIsImNsb3NlQW5pbWF0aW9uSWZPcGVuIiwiZGlhbG9nIiwibWFrZUVkaXRvciIsImNvbnRhaW5lciIsIm9wdGlvbnMiLCJpbml0aWFsIiwiaGFzT3duUHJvcGVydHkiLCJ0ZXh0YXJlYSIsImpRdWVyeSIsInZhbCIsImFwcGVuZCIsInJ1bkZ1biIsImNvZGUiLCJyZXBsT3B0aW9ucyIsInJ1biIsImNtIiwiQ00iLCJ1c2VMaW5lTnVtYmVycyIsInNpbXBsZUVkaXRvciIsInVzZUZvbGRpbmciLCJndXR0ZXJzIiwicmVpbmRlbnRBbGxMaW5lcyIsImxhc3QiLCJsaW5lQ291bnQiLCJvcGVyYXRpb24iLCJpIiwiaW5kZW50TGluZSIsIkNPREVfTElORV9XSURUSCIsInJ1bGVycyIsInJ1bGVyc01pbkNvbCIsImNvbG9yIiwiY29sdW1uIiwibGluZVN0eWxlIiwiY2xhc3NOYW1lIiwiY21PcHRpb25zIiwiZXh0cmFLZXlzIiwiQ29kZU1pcnJvciIsIm5vcm1hbGl6ZUtleU1hcCIsImluZGVudFVuaXQiLCJ0YWJTaXplIiwidmlld3BvcnRNYXJnaW4iLCJJbmZpbml0eSIsImxpbmVOdW1iZXJzIiwibWF0Y2hLZXl3b3JkcyIsIm1hdGNoQnJhY2tldHMiLCJzdHlsZVNlbGVjdGVkVGV4dCIsImZvbGRHdXR0ZXIiLCJsaW5lV3JhcHBpbmciLCJsb2dnaW5nIiwiZnJvbVRleHRBcmVhIiwiZGlzcGxheSIsIndyYXBwZXIiLCJhcHBlbmRDaGlsZCIsImdldFRvcFRpZXJNZW51aXRlbXMiLCJyZWZyZXNoIiwiZm9jdXMiLCJmb2N1c0Nhcm91c2VsIiwiUlVOX0NPREUiLCJzZXRVc2VybmFtZSIsInRhcmdldCIsImd3cmFwIiwibG9hZCIsImFwaSIsInBlb3BsZSIsInVzZXJJZCIsInVzZXIiLCJkaXNwbGF5TmFtZSIsImVtYWlscyIsInN0b3JhZ2VBUEkiLCJjb2xsZWN0aW9uIiwic2hvdyIsImhpZGUiLCJmYWlsIiwiY2xpY2siLCJjcmVhdGVQcm9ncmFtQ29sbGVjdGlvbkFQSSIsImFjdGl2ZUVsZW1lbnQiLCJibHVyIiwidG9Mb2FkIiwiZ2V0RmlsZUJ5SWQiLCJsb2FkUHJvZ3JhbSIsInByb2dyYW1Ub1NhdmUiLCJRIiwiZmNhbGwiLCJpbml0aWFsUHJvZ3JhbSIsInByb2dyYW1Mb2FkIiwiZW5hYmxlRmlsZU9wdGlvbnMiLCJwIiwic2hvd1NoYXJlQ29udGFpbmVyIiwiaWQiLCJnZXRTaGFyZWRGaWxlQnlJZCIsImZpbGUiLCJnZXRPcmlnaW5hbCIsInJlc3BvbnNlIiwib3JpZ2luYWwiLCJvZmYiLCJyZXN1bHQiLCJyZW1vdmVDbGFzcyIsIm9wZW4iLCJBUFBfQkFTRV9VUkwiLCJzZXRUaXRsZSIsInByb2dOYW1lIiwidGl0bGUiLCJmaWxlbmFtZSIsImRvd25sb2FkRWx0IiwiY29udGVudHMiLCJlZGl0b3IiLCJkb3dubG9hZEJsb2IiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJCbG9iIiwidHlwZSIsImluZGV4T2YiLCJsZW5ndGgiLCJkb3dubG9hZCIsIlRSVU5DQVRFX0xFTkdUSCIsInRydW5jYXRlTmFtZSIsInNsaWNlIiwidXBkYXRlTmFtZSIsImdldE5hbWUiLCJwcm9nIiwic2hhcmVkIiwiZ2V0Q29udGVudHMiLCJzYXkiLCJmb3JnZXQiLCJhbm5vdW5jZW1lbnRzIiwiZ2V0RWxlbWVudEJ5SWQiLCJsaSIsImNyZWF0ZUVsZW1lbnQiLCJjcmVhdGVUZXh0Tm9kZSIsImluc2VydEJlZm9yZSIsImZpcnN0Q2hpbGQiLCJzZXRUaW1lb3V0IiwicmVtb3ZlQ2hpbGQiLCJjeWNsZUFkdmFuY2UiLCJjdXJySW5kZXgiLCJtYXhJbmRleCIsInJldmVyc2VQIiwibmV4dEluZGV4IiwicG9wdWxhdGVGb2N1c0Nhcm91c2VsIiwiZmMiLCJkb2NtYWluIiwidG9vbGJhciIsImRvY3JlcGxNYWluIiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsImRvY3JlcGxNYWluMCIsInVuZGVmaW5lZCIsImlubmVyVGV4dCIsImRvY3JlcGwiLCJkb2NyZXBsY29kZSIsImN5Y2xlRm9jdXMiLCJmQ2Fyb3VzZWwiLCJjdXJyZW50Rm9jdXNlZEVsdCIsImZpbmQiLCJub2RlIiwiY29udGFpbnMiLCJjdXJyZW50Rm9jdXNJbmRleCIsIm5leHRGb2N1c0luZGV4IiwiZm9jdXNFbHQiLCJmb2N1c0VsdDAiLCJjbGFzc0xpc3QiLCJ0ZXh0YXJlYXMiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsInJlbW92ZUF0dHJpYnV0ZSIsInByb2dyYW1Mb2FkZWQiLCJtYWtlU2hhcmVMaW5rIiwibmFtZU9yVW50aXRsZWQiLCJtZW51SXRlbURpc2FibGVkIiwiaGFzQ2xhc3MiLCJuZXdFdmVudCIsImUiLCJzYXZlRXZlbnQiLCJuZXdGaWxlbmFtZSIsInVzZU5hbWUiLCJjcmVhdGUiLCJzYXZlZFByb2dyYW0iLCJjcmVhdGVGaWxlIiwiaGlzdG9yeSIsInB1c2hTdGF0ZSIsImdldFVuaXF1ZUlkIiwic2F2ZUFzIiwic2F2ZUFzUHJvbXB0Iiwic3R5bGUiLCJkZWZhdWx0VmFsdWUiLCJuZXdOYW1lIiwicmVuYW1lIiwicmVuYW1lUHJvbXB0IiwiZm9jdXNhYmxlRWx0cyIsInRoZVRvb2xiYXIiLCJ0b3BUaWVyTWVudWl0ZW1zIiwidG9BcnJheSIsImZpbHRlciIsImVsdCIsImdldEF0dHJpYnV0ZSIsIm51bVRvcFRpZXJNZW51aXRlbXMiLCJpdGhUb3BUaWVyTWVudWl0ZW0iLCJpQ2hpbGQiLCJjaGlsZHJlbiIsImZpcnN0IiwidG9TdHJpbmciLCJ1cGRhdGVFZGl0b3JIZWlnaHQiLCJ0b29sYmFySGVpZ2h0Iiwic2Nyb2xsSGVpZ2h0IiwicGFkZGluZ1RvcCIsImRvY01haW4iLCJkb2NSZXBsTWFpbiIsIm9uIiwiaW5zZXJ0QXJpYVBvcyIsInN1Ym1lbnUiLCJhcnIiLCJsZW4iLCJzZXRBdHRyaWJ1dGUiLCJhZGRFdmVudExpc3RlbmVyIiwiaGlkZUFsbFRvcE1lbnVpdGVtcyIsInN0b3BQcm9wYWdhdGlvbiIsImtleWRvd24iLCJrYyIsImtleUNvZGUiLCJjbGlja1RvcE1lbnVpdGVtIiwidGhpc0VsdCIsInRvcFRpZXJVbCIsImNsb3Nlc3QiLCJoYXNBdHRyaWJ1dGUiLCJ0aGlzVG9wTWVudWl0ZW0iLCJ0MSIsInN1Ym1lbnVPcGVuIiwiZXhwYW5kYWJsZUVsdHMiLCJub25leHBhbmRhYmxlRWx0cyIsInN3aXRjaFRvcE1lbnVpdGVtIiwiZGVzdFRvcE1lbnVpdGVtIiwiZGVzdEVsdCIsImVsdElkIiwic2hvd2luZ0hlbHBLZXlzIiwic2hvd0hlbHBLZXlzIiwiZmFkZUluIiwicmVjaXRlSGVscCIsIndpdGhpblNlY29uZFRpZXJVbCIsInNlY29uZFRpZXJVbCIsInBvc3NFbHRzIiwic3JjVG9wTWVudWl0ZW0iLCJ0dG1pTiIsImoiLCJuZWFyU2licyIsIm15SWQiLCJ0aGlzRW5jb3VudGVyZWQiLCJhZGQiLCJmYXJTaWJzIiwicHJldkFsbCIsInN1Ym1lbnVEaXZzIiwibmV4dEFsbCIsInByZXZlbnREZWZhdWx0Iiwic2hpZnRLZXkiLCJjdHJsS2V5IiwiY29kZUNvbnRhaW5lciIsInJ1bkJ1dHRvbiIsImluaXRpYWxHYXMiLCJzZXRPcHRpb24iLCJyZW1vdmVTaG9ydGVuZWRMaW5lIiwibGluZUhhbmRsZSIsImdldE9wdGlvbiIsImxvbmdMaW5lcyIsInJ1bGVyTGlzdGVuZXJzIiwiZXZ0IiwicmVmcmVzaFJ1bGVycyIsImRlbGV0ZUxpbmUiLCJtaW5MZW5ndGgiLCJzaXplIiwiTnVtYmVyIiwiTUFYX1ZBTFVFIiwibGluZU5vIiwiaW5zdGFuY2UiLCJjaGFuZ2VPYmpzIiwibWluTGluZSIsImxhc3RMaW5lIiwibWF4TGluZSIsImNoYW5nZSIsImZyb20iLCJsaW5lIiwiY2hhbmdlZCIsImVhY2hMaW5lIiwiYyIsImdldERvYyIsImNsZWFySGlzdG9yeSIsInNldFZhbHVlIiwicHlyZXRMb2FkIiwic3JjIiwiYm9keSIsInB5cmV0TG9hZDIiLCJsb2dGYWlsdXJlQW5kTWFudWFsRmV0Y2giLCJldmVudCIsInRpbWVTdGFtcCIsIm1hbnVhbEZldGNoIiwiYWpheCIsInJlcyIsImNvbnRlbnRzUHJlZml4Iiwic3RhdHVzIiwic3RhdHVzVGV4dCIsInJlc3BvbnNlVGV4dCIsInByb2Nlc3MiLCJlbnYiLCJmaW4iLCJhdXRvSGlnaGxpZ2h0Qm94IiwidGV4dEJveCIsInNlbGVjdCIsInByb21wdFF1ZXVlIiwic3R5bGVzIiwibW9kYWxzIiwiUHJvbXB0IiwicHVzaCIsIkVycm9yIiwibW9kYWwiLCJlbHRzIiwicGFyc2VIVE1MIiwiY2xvc2VCdXR0b24iLCJzdWJtaXRCdXR0b24iLCJzdWJtaXRUZXh0IiwiaXNDb21waWxlZCIsImRlZmVycmVkIiwiZGVmZXIiLCJwcm9taXNlIiwiY2FsbGJhY2siLCJoaWRlU3VibWl0Iiwib25DbG9zZSIsIm9uU3VibWl0IiwiZG9jQ2xpY2siLCJpcyIsImRvY0tleWRvd24iLCJrZXkiLCJwb3B1bGF0ZU1vZGFsIiwiY3NzIiwiY2xlYXJNb2RhbCIsImNyZWF0ZVJhZGlvRWx0Iiwib3B0aW9uIiwiaWR4IiwibGFiZWwiLCJlbHRDb250YWluZXIiLCJsYWJlbENvbnRhaW5lciIsImV4YW1wbGUiLCJtb2RlIiwicmVhZE9ubHkiLCJleGFtcGxlQ29udGFpbmVyIiwiY3JlYXRlVGlsZUVsdCIsImRldGFpbHMiLCJjcmVhdGVUZXh0RWx0IiwiY3JlYXRlQ29weVRleHRFbHQiLCJib3giLCJjcmVhdGVDb25maXJtRWx0IiwidGhhdCIsImNyZWF0ZUVsdCIsIm9wdGlvbkVsdHMiLCJtYXAiLCJyZXNvbHZlIiwicmV0dmFsIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBLG1FQUEyRDtBQUMzRDtBQUNBO0FBQ0E7O0FBRUEsb0RBQTRDO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtEQUEwQztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxjQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkI7QUFDM0I7QUFDQSxZQUFJO0FBQ0o7QUFDQSxXQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBLHNEQUE4QztBQUM5QztBQUNBLHFDQUE2Qjs7QUFFN0IsK0NBQXVDO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQU07QUFDTixhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFPO0FBQ1AsY0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FB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QUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUU7O0FBRUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxPQUFPO0FBQ2xCLFlBQVcsT0FBTztBQUNsQjtBQUNBLGFBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRTs7QUFFRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxPQUFPO0FBQ2xCLGFBQVksV0FBVyxFQUFFO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxRQUFRO0FBQ3BCO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLEdBQUU7O0FBRUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxPQUFPO0FBQ2xCLFlBQVcsT0FBTztBQUNsQixhQUFZLE9BQU87QUFDbkI7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLEdBQUU7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsRUFBQzs7Ozs7Ozs7QUNyVkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNUQSw4QkFBNkIsbURBQW1EOzs7Ozs7Ozs7QUNBaEY7Ozs7Ozs7Ozs7OztBQVlBLGtDQUEyQixDQUFDLHNCQUFELENBQTNCLGtDQUFrQyxVQUFTbUksQ0FBVCxFQUFZOztBQUU1QyxZQUFTMk4sZ0JBQVQsQ0FBMEIzVixJQUExQixFQUFnQztBQUM5QixTQUFJNFYsVUFBVXJXLEVBQUUscUJBQUYsRUFBeUJRLFFBQXpCLENBQWtDLGdCQUFsQyxDQUFkO0FBQ0E2VixhQUFRM1YsSUFBUixDQUFhLE1BQWIsRUFBcUJELEtBQUsrSixNQUExQjtBQUNBNkwsYUFBUTNWLElBQVIsQ0FBYSxVQUFiLEVBQXlCLEtBQXpCO0FBQ0EyVixhQUFRaEcsRUFBUixDQUFXLE9BQVgsRUFBb0IsWUFBVztBQUFFclEsU0FBRSxJQUFGLEVBQVFzVyxNQUFSO0FBQW1CLE1BQXBEO0FBQ0FELGFBQVFoRyxFQUFSLENBQVcsU0FBWCxFQUFzQixZQUFXO0FBQUVyUSxTQUFFLElBQUYsRUFBUXNXLE1BQVI7QUFBbUIsTUFBdEQ7QUFDQUQsYUFBUXBTLEdBQVIsQ0FBWXhELElBQVo7QUFDQSxZQUFPNFYsT0FBUDtBQUNEOztBQUVEO0FBQ0EsT0FBSUUsY0FBYzlOLEdBQWxCO0FBQ0EsT0FBSStOLFNBQVMsQ0FDWCxPQURXLEVBQ0YsT0FERSxFQUNPLE1BRFAsRUFDZSxVQURmLEVBQzJCLFNBRDNCLENBQWI7O0FBSUF6WCxVQUFPMFgsTUFBUCxHQUFnQixFQUFoQjs7QUFFQTs7Ozs7Ozs7O0FBU0E7Ozs7QUFJQSxZQUFTQyxNQUFULENBQWdCOVMsT0FBaEIsRUFBeUI7QUFDdkI3RSxZQUFPMFgsTUFBUCxDQUFjRSxJQUFkLENBQW1CLElBQW5CO0FBQ0EsU0FBSSxDQUFDL1MsT0FBRCxJQUNDNFMsT0FBT2pNLE9BQVAsQ0FBZTNHLFFBQVFpTCxLQUF2QixNQUFrQyxDQUFDLENBRHBDLElBRUEsQ0FBQ2pMLFFBQVFBLE9BRlQsSUFHQyxPQUFPQSxRQUFRQSxPQUFSLENBQWdCNEcsTUFBdkIsS0FBa0MsUUFIbkMsSUFHaUQ1RyxRQUFRQSxPQUFSLENBQWdCNEcsTUFBaEIsS0FBMkIsQ0FIaEYsRUFHb0Y7QUFDbEYsYUFBTSxJQUFJb00sS0FBSixDQUFVLHdCQUFWLEVBQW9DaFQsT0FBcEMsQ0FBTjtBQUNEO0FBQ0QsVUFBS0EsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsVUFBS2lULEtBQUwsR0FBYTdXLEVBQUUsY0FBRixDQUFiO0FBQ0EsU0FBSSxLQUFLNEQsT0FBTCxDQUFhaUwsS0FBYixLQUF1QixPQUEzQixFQUFvQztBQUNsQyxZQUFLaUksSUFBTCxHQUFZOVcsRUFBRUEsRUFBRStXLFNBQUYsQ0FBWSxpQkFBWixDQUFGLEVBQWtDdlcsUUFBbEMsQ0FBMkMsaUJBQTNDLENBQVo7QUFDRCxNQUZELE1BRU8sSUFBSSxLQUFLb0QsT0FBTCxDQUFhaUwsS0FBYixLQUF1QixNQUEzQixFQUFtQztBQUN4QyxZQUFLaUksSUFBTCxHQUFZOVcsRUFBRSxPQUFGLEVBQVdRLFFBQVgsQ0FBb0IsaUJBQXBCLENBQVo7QUFDRCxNQUZNLE1BRUEsSUFBSSxLQUFLb0QsT0FBTCxDQUFhaUwsS0FBYixLQUF1QixVQUEzQixFQUF1QztBQUM1QyxZQUFLaUksSUFBTCxHQUFZOVcsRUFBRSxPQUFGLEVBQVdRLFFBQVgsQ0FBb0IsaUJBQXBCLENBQVo7QUFDRCxNQUZNLE1BRUEsSUFBSSxLQUFLb0QsT0FBTCxDQUFhaUwsS0FBYixLQUF1QixTQUEzQixFQUFzQztBQUMzQyxZQUFLaUksSUFBTCxHQUFZOVcsRUFBRSxPQUFGLEVBQVdRLFFBQVgsQ0FBb0IsaUJBQXBCLENBQVo7QUFDRCxNQUZNLE1BRUE7QUFDTCxZQUFLc1csSUFBTCxHQUFZOVcsRUFBRUEsRUFBRStXLFNBQUYsQ0FBWSxhQUFaLENBQUYsRUFBOEJ2VyxRQUE5QixDQUF1QyxpQkFBdkMsQ0FBWjtBQUNEO0FBQ0QsVUFBS3FKLEtBQUwsR0FBYTdKLEVBQUUsb0JBQUYsRUFBd0IsS0FBSzZXLEtBQTdCLENBQWI7QUFDQSxVQUFLRyxXQUFMLEdBQW1CaFgsRUFBRSxRQUFGLEVBQVksS0FBSzZXLEtBQWpCLENBQW5CO0FBQ0EsVUFBS0ksWUFBTCxHQUFvQmpYLEVBQUUsU0FBRixFQUFhLEtBQUs2VyxLQUFsQixDQUFwQjtBQUNBLFNBQUcsS0FBS2pULE9BQUwsQ0FBYXNULFVBQWhCLEVBQTRCO0FBQzFCLFlBQUtELFlBQUwsQ0FBa0J4VyxJQUFsQixDQUF1QixLQUFLbUQsT0FBTCxDQUFhc1QsVUFBcEM7QUFDRCxNQUZELE1BR0s7QUFDSCxZQUFLRCxZQUFMLENBQWtCeFcsSUFBbEIsQ0FBdUIsUUFBdkI7QUFDRDtBQUNELFVBQUswVyxVQUFMLEdBQWtCLEtBQWxCO0FBQ0EsVUFBS0MsUUFBTCxHQUFnQjNPLEVBQUU0TyxLQUFGLEVBQWhCO0FBQ0EsVUFBS0MsT0FBTCxHQUFlLEtBQUtGLFFBQUwsQ0FBY0UsT0FBN0I7QUFDRDs7QUFFRDs7Ozs7O0FBTUE7Ozs7Ozs7O0FBUUFaLFVBQU9sVixTQUFQLENBQWlCc0csSUFBakIsR0FBd0IsVUFBU3lQLFFBQVQsRUFBbUI7QUFDekM7QUFDQTtBQUNBLFNBQUksS0FBSzNULE9BQUwsQ0FBYTRULFVBQWpCLEVBQTZCO0FBQzNCLFlBQUtQLFlBQUwsQ0FBa0JsUCxJQUFsQjtBQUNELE1BRkQsTUFFTztBQUNMLFlBQUtrUCxZQUFMLENBQWtCblAsSUFBbEI7QUFDRDtBQUNELFVBQUtrUCxXQUFMLENBQWlCL08sS0FBakIsQ0FBdUIsS0FBS3dQLE9BQUwsQ0FBYXJXLElBQWIsQ0FBa0IsSUFBbEIsQ0FBdkI7QUFDQSxVQUFLNlYsWUFBTCxDQUFrQmhQLEtBQWxCLENBQXdCLEtBQUt5UCxRQUFMLENBQWN0VyxJQUFkLENBQW1CLElBQW5CLENBQXhCO0FBQ0EsU0FBSXVXLFdBQVksVUFBUzFKLENBQVQsRUFBWTtBQUMxQjtBQUNBO0FBQ0EsV0FBSWpPLEVBQUVpTyxFQUFFOUcsTUFBSixFQUFZeVEsRUFBWixDQUFlLEtBQUtmLEtBQXBCLEtBQThCLEtBQUtPLFFBQXZDLEVBQWlEO0FBQy9DLGNBQUtLLE9BQUwsQ0FBYXhKLENBQWI7QUFDQWpPLFdBQUVOLFFBQUYsRUFBWTRKLEdBQVosQ0FBZ0IsT0FBaEIsRUFBeUJxTyxRQUF6QjtBQUNEO0FBQ0YsTUFQYyxDQU9adlcsSUFQWSxDQU9QLElBUE8sQ0FBZjtBQVFBcEIsT0FBRU4sUUFBRixFQUFZdUksS0FBWixDQUFrQjBQLFFBQWxCO0FBQ0EsU0FBSUUsYUFBYyxVQUFTNUosQ0FBVCxFQUFZO0FBQzVCLFdBQUlBLEVBQUU2SixHQUFGLEtBQVUsUUFBZCxFQUF3QjtBQUN0QixjQUFLTCxPQUFMLENBQWF4SixDQUFiO0FBQ0FqTyxXQUFFTixRQUFGLEVBQVk0SixHQUFaLENBQWdCLFNBQWhCLEVBQTJCdU8sVUFBM0I7QUFDRDtBQUNGLE1BTGdCLENBS2R6VyxJQUxjLENBS1QsSUFMUyxDQUFqQjtBQU1BcEIsT0FBRU4sUUFBRixFQUFZb1IsT0FBWixDQUFvQitHLFVBQXBCO0FBQ0EsVUFBS2hPLEtBQUwsQ0FBV3BKLElBQVgsQ0FBZ0IsS0FBS21ELE9BQUwsQ0FBYWlHLEtBQTdCO0FBQ0EsVUFBS2tPLGFBQUw7QUFDQSxVQUFLbEIsS0FBTCxDQUFXbUIsR0FBWCxDQUFlLFNBQWYsRUFBMEIsT0FBMUI7O0FBRUEsU0FBSVQsUUFBSixFQUFjO0FBQ1osY0FBTyxLQUFLRCxPQUFMLENBQWE3VSxJQUFiLENBQWtCOFUsUUFBbEIsQ0FBUDtBQUNELE1BRkQsTUFFTztBQUNMLGNBQU8sS0FBS0QsT0FBWjtBQUNEO0FBQ0YsSUFuQ0Q7O0FBc0NBOzs7QUFHQVosVUFBT2xWLFNBQVAsQ0FBaUJ5VyxVQUFqQixHQUE4QixZQUFXO0FBQ3ZDLFVBQUtoQixZQUFMLENBQWtCM04sR0FBbEI7QUFDQSxVQUFLME4sV0FBTCxDQUFpQjFOLEdBQWpCO0FBQ0EsVUFBS3dOLElBQUwsQ0FBVTdXLEtBQVY7QUFDRCxJQUpEOztBQU1BOzs7O0FBSUF5VyxVQUFPbFYsU0FBUCxDQUFpQnVXLGFBQWpCLEdBQWlDLFlBQVc7QUFDMUMsY0FBU0csY0FBVCxDQUF3QkMsTUFBeEIsRUFBZ0NDLEdBQWhDLEVBQXFDO0FBQ25DLFdBQUk3SSxNQUFNdlAsRUFBRUEsRUFBRStXLFNBQUYsQ0FBWSw2Q0FBWixDQUFGLENBQVY7QUFDQSxXQUFJL04sS0FBSyxNQUFNb1AsSUFBSXRJLFFBQUosRUFBZjtBQUNBLFdBQUl1SSxRQUFRclksRUFBRUEsRUFBRStXLFNBQUYsQ0FBWSxrQkFBa0IvTixFQUFsQixHQUF1QixhQUFuQyxDQUFGLENBQVo7QUFDQXVHLFdBQUk3TyxJQUFKLENBQVMsSUFBVCxFQUFlc0ksRUFBZjtBQUNBdUcsV0FBSTdPLElBQUosQ0FBUyxPQUFULEVBQWtCeVgsT0FBT25XLEtBQXpCO0FBQ0FxVyxhQUFNNVgsSUFBTixDQUFXMFgsT0FBT2hZLE9BQWxCO0FBQ0EsV0FBSW1ZLGVBQWV0WSxFQUFFQSxFQUFFK1csU0FBRixDQUFZLDhDQUFaLENBQUYsQ0FBbkI7QUFDQXVCLG9CQUFhcFUsTUFBYixDQUFvQnFMLEdBQXBCO0FBQ0EsV0FBSWdKLGlCQUFpQnZZLEVBQUVBLEVBQUUrVyxTQUFGLENBQVksZ0RBQVosQ0FBRixDQUFyQjtBQUNBd0Isc0JBQWVyVSxNQUFmLENBQXNCbVUsS0FBdEI7QUFDQSxXQUFJMVUsWUFBWTNELEVBQUVBLEVBQUUrVyxTQUFGLENBQVksd0NBQVosQ0FBRixDQUFoQjtBQUNBcFQsaUJBQVVPLE1BQVYsQ0FBaUJvVSxZQUFqQjtBQUNBM1UsaUJBQVVPLE1BQVYsQ0FBaUJxVSxjQUFqQjtBQUNBLFdBQUlKLE9BQU9LLE9BQVgsRUFBb0I7QUFDbEIsYUFBSUEsVUFBVXhZLEVBQUVBLEVBQUUrVyxTQUFGLENBQVksYUFBWixDQUFGLENBQWQ7QUFDQSxhQUFJeFMsS0FBS3FCLFdBQVc0UyxRQUFRLENBQVIsQ0FBWCxFQUF1QjtBQUM5QnhXLGtCQUFPbVcsT0FBT0ssT0FEZ0I7QUFFOUJDLGlCQUFNLE9BRndCO0FBRzlCdlMsd0JBQWEsS0FIaUI7QUFJOUJ3UyxxQkFBVTtBQUpvQixVQUF2QixDQUFUO0FBTUEvTSxvQkFBVyxZQUFVO0FBQ25CcEgsY0FBR3VDLE9BQUg7QUFDRCxVQUZELEVBRUcsQ0FGSDtBQUdBLGFBQUk2UixtQkFBbUIzWSxFQUFFQSxFQUFFK1csU0FBRixDQUFZLGdEQUFaLENBQUYsQ0FBdkI7QUFDQTRCLDBCQUFpQnpVLE1BQWpCLENBQXdCc1UsT0FBeEI7QUFDQTdVLG1CQUFVTyxNQUFWLENBQWlCeVUsZ0JBQWpCO0FBQ0Q7O0FBRUQsY0FBT2hWLFNBQVA7QUFDRDtBQUNELGNBQVNpVixhQUFULENBQXVCVCxNQUF2QixFQUErQkMsR0FBL0IsRUFBb0M7QUFDbEMsV0FBSTdJLE1BQU12UCxFQUFFQSxFQUFFK1csU0FBRixDQUFZLHVEQUFaLENBQUYsQ0FBVjtBQUNBeEgsV0FBSTdPLElBQUosQ0FBUyxJQUFULEVBQWUsTUFBTTBYLElBQUl0SSxRQUFKLEVBQXJCO0FBQ0FQLFdBQUlyTCxNQUFKLENBQVdsRSxFQUFFLEtBQUYsRUFBU1MsSUFBVCxDQUFjMFgsT0FBT2hZLE9BQXJCLENBQVgsRUFDRytELE1BREgsQ0FDVWxFLEVBQUUsS0FBRixFQUFTUyxJQUFULENBQWMwWCxPQUFPVSxPQUFyQixDQURWO0FBRUEsWUFBSyxJQUFJaEYsR0FBVCxJQUFnQnNFLE9BQU85SCxFQUF2QjtBQUNFZCxhQUFJYyxFQUFKLENBQU93RCxHQUFQLEVBQVlzRSxPQUFPOUgsRUFBUCxDQUFVd0QsR0FBVixDQUFaO0FBREYsUUFFQSxPQUFPdEUsR0FBUDtBQUNEOztBQUVELGNBQVN1SixhQUFULENBQXVCWCxNQUF2QixFQUErQjtBQUM3QixXQUFJNUksTUFBTXZQLEVBQUUsT0FBRixDQUFWO0FBQ0F1UCxXQUFJckwsTUFBSixDQUFXbEUsRUFBRSxRQUFGLEVBQVlRLFFBQVosQ0FBcUIsV0FBckIsRUFBa0NDLElBQWxDLENBQXVDMFgsT0FBT2hZLE9BQTlDLENBQVg7QUFDTjtBQUNNb1AsV0FBSXJMLE1BQUosQ0FBV2xFLEVBQUUscUJBQUYsRUFBeUJpRSxHQUF6QixDQUE2QmtVLE9BQU9ySixZQUFwQyxDQUFYO0FBQ0EsY0FBT1MsR0FBUDtBQUNEOztBQUVELGNBQVN3SixpQkFBVCxDQUEyQlosTUFBM0IsRUFBbUM7QUFDakMsV0FBSTVJLE1BQU12UCxFQUFFLE9BQUYsQ0FBVjtBQUNBdVAsV0FBSXJMLE1BQUosQ0FBV2xFLEVBQUUsS0FBRixFQUFTUSxRQUFULENBQWtCLFdBQWxCLEVBQStCQyxJQUEvQixDQUFvQzBYLE9BQU9oWSxPQUEzQyxDQUFYO0FBQ0EsV0FBR2dZLE9BQU8xWCxJQUFWLEVBQWdCO0FBQ2QsYUFBSXVZLE1BQU01QyxpQkFBaUIrQixPQUFPMVgsSUFBeEIsQ0FBVjtBQUNOO0FBQ004TyxhQUFJckwsTUFBSixDQUFXOFUsR0FBWDtBQUNBQSxhQUFJalMsS0FBSjtBQUNEO0FBQ0QsY0FBT3dJLEdBQVA7QUFDRDs7QUFFRCxjQUFTMEosZ0JBQVQsQ0FBMEJkLE1BQTFCLEVBQWtDO0FBQ2hDLGNBQU9uWSxFQUFFLEtBQUYsRUFBU1MsSUFBVCxDQUFjMFgsT0FBT2hZLE9BQXJCLENBQVA7QUFDRDs7QUFFRCxTQUFJK1ksT0FBTyxJQUFYOztBQUVBLGNBQVNDLFNBQVQsQ0FBbUJoQixNQUFuQixFQUEyQmxULENBQTNCLEVBQThCO0FBQzVCLFdBQUdpVSxLQUFLdFYsT0FBTCxDQUFhaUwsS0FBYixLQUF1QixPQUExQixFQUFtQztBQUNqQyxnQkFBT3FKLGVBQWVDLE1BQWYsRUFBdUJsVCxDQUF2QixDQUFQO0FBQ0QsUUFGRCxNQUdLLElBQUdpVSxLQUFLdFYsT0FBTCxDQUFhaUwsS0FBYixLQUF1QixPQUExQixFQUFtQztBQUN0QyxnQkFBTytKLGNBQWNULE1BQWQsRUFBc0JsVCxDQUF0QixDQUFQO0FBQ0QsUUFGSSxNQUdBLElBQUdpVSxLQUFLdFYsT0FBTCxDQUFhaUwsS0FBYixLQUF1QixNQUExQixFQUFrQztBQUNyQyxnQkFBT2lLLGNBQWNYLE1BQWQsQ0FBUDtBQUNELFFBRkksTUFHQSxJQUFHZSxLQUFLdFYsT0FBTCxDQUFhaUwsS0FBYixLQUF1QixVQUExQixFQUFzQztBQUN6QyxnQkFBT2tLLGtCQUFrQlosTUFBbEIsQ0FBUDtBQUNELFFBRkksTUFHQSxJQUFHZSxLQUFLdFYsT0FBTCxDQUFhaUwsS0FBYixLQUF1QixTQUExQixFQUFxQztBQUN4QyxnQkFBT29LLGlCQUFpQmQsTUFBakIsQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQsU0FBSWlCLFVBQUo7QUFDQTtBQUNKO0FBQ01BLGtCQUFhLEtBQUt4VixPQUFMLENBQWFBLE9BQWIsQ0FBcUJ5VixHQUFyQixDQUF5QkYsU0FBekIsQ0FBYjtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSW5aLE9BQUUscUJBQUYsRUFBeUJvWixXQUFXLENBQVgsQ0FBekIsRUFBd0MxWSxJQUF4QyxDQUE2QyxTQUE3QyxFQUF3RCxJQUF4RDtBQUNBLFVBQUtvVyxJQUFMLENBQVU1UyxNQUFWLENBQWlCa1YsVUFBakI7QUFDQXBaLE9BQUUsYUFBRixFQUFpQixLQUFLNlcsS0FBdEIsRUFBNkI1VyxLQUE3QixHQUFxQ2lFLE1BQXJDLENBQTRDLEtBQUs0UyxJQUFqRDtBQUNBc0MsZ0JBQVcsQ0FBWCxFQUFjclMsS0FBZDtBQUNELElBcEdEOztBQXNHQTs7O0FBR0EyUCxVQUFPbFYsU0FBUCxDQUFpQmlXLE9BQWpCLEdBQTJCLFVBQVN4SixDQUFULEVBQVk7QUFDckMsVUFBSzRJLEtBQUwsQ0FBV21CLEdBQVgsQ0FBZSxTQUFmLEVBQTBCLE1BQTFCO0FBQ0EsVUFBS0MsVUFBTDtBQUNBLFVBQUtiLFFBQUwsQ0FBY2tDLE9BQWQsQ0FBc0IsSUFBdEI7QUFDQSxZQUFPLEtBQUtsQyxRQUFaO0FBQ0EsWUFBTyxLQUFLRSxPQUFaO0FBQ0QsSUFORDs7QUFRQTs7O0FBR0FaLFVBQU9sVixTQUFQLENBQWlCa1csUUFBakIsR0FBNEIsVUFBU3pKLENBQVQsRUFBWTtBQUN0QyxTQUFHLEtBQUtySyxPQUFMLENBQWFpTCxLQUFiLEtBQXVCLE9BQTFCLEVBQW1DO0FBQ2pDLFdBQUkwSyxTQUFTdlosRUFBRSw2QkFBRixFQUFpQyxLQUFLNlcsS0FBdEMsRUFBNkM1UyxHQUE3QyxFQUFiO0FBQ0QsTUFGRCxNQUdLLElBQUcsS0FBS0wsT0FBTCxDQUFhaUwsS0FBYixLQUF1QixNQUExQixFQUFrQztBQUNyQyxXQUFJMEssU0FBU3ZaLEVBQUUsb0JBQUYsRUFBd0IsS0FBSzZXLEtBQTdCLEVBQW9DNVMsR0FBcEMsRUFBYjtBQUNELE1BRkksTUFHQSxJQUFHLEtBQUtMLE9BQUwsQ0FBYWlMLEtBQWIsS0FBdUIsVUFBMUIsRUFBc0M7QUFDekMsV0FBSTBLLFNBQVMsSUFBYjtBQUNELE1BRkksTUFHQSxJQUFHLEtBQUszVixPQUFMLENBQWFpTCxLQUFiLEtBQXVCLFNBQTFCLEVBQXFDO0FBQ3hDLFdBQUkwSyxTQUFTLElBQWI7QUFDRCxNQUZJLE1BR0E7QUFDSCxXQUFJQSxTQUFTLElBQWIsQ0FERyxDQUNnQjtBQUNwQjtBQUNELFVBQUsxQyxLQUFMLENBQVdtQixHQUFYLENBQWUsU0FBZixFQUEwQixNQUExQjtBQUNBLFVBQUtDLFVBQUw7QUFDQSxVQUFLYixRQUFMLENBQWNrQyxPQUFkLENBQXNCQyxNQUF0QjtBQUNBLFlBQU8sS0FBS25DLFFBQVo7QUFDQSxZQUFPLEtBQUtFLE9BQVo7QUFDRCxJQXJCRDs7QUF1QkEsVUFBT1osTUFBUDtBQUVELEVBbFJELGdKOzs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBSztBQUNMO0FBQ0E7O0FBRUEsRUFBQztBQUNEOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7QUFDRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBLGVBQWMsZ0JBQWdCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esd0JBQXVCLGlCQUFpQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXFCO0FBQ3JCO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE2QixLQUFLO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esb0JBQW1CLGtCQUFrQjtBQUNyQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFXLFNBQVM7QUFDcEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtCQUFpQix5QkFBeUI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQStDO0FBQy9DO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTBDO0FBQzFDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EscUJBQW9CO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxnQ0FBK0I7QUFDL0I7QUFDQTtBQUNBLHlEQUF3RDtBQUN4RDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYixVQUFTOztBQUVUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNUOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxQkFBb0IsU0FBUztBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHFCQUFvQjtBQUNwQixtQkFBa0I7QUFDbEIseUJBQXdCO0FBQ3hCLHFCQUFvQjs7QUFFcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYixjQUFhO0FBQ2IsY0FBYSxLQUFLO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBLG9CQUFtQixZQUFZO0FBQy9CLGNBQWEsS0FBSztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVk7QUFDWjtBQUNBLCtDQUE4QyxTQUFTO0FBQ3ZEO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQW9CO0FBQ3BCO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNCQUFxQjtBQUNyQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsVUFBUztBQUNULE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsU0FBUztBQUNwQixjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxtQ0FBa0MsY0FBYyxFQUFFO0FBQ2xEOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1DQUFrQyxjQUFjLEVBQUU7QUFDbEQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBLE1BQUs7QUFDTCxpQkFBZ0I7QUFDaEIsTUFBSzs7QUFFTDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTCxpQkFBZ0I7QUFDaEIsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBLE1BQUs7QUFDTDtBQUNBLE1BQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUI7QUFDakI7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQjtBQUNBO0FBQ0Esc0JBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUk7QUFDSjtBQUNBO0FBQ0EsWUFBVyxTQUFTO0FBQ3BCLGNBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQW9CLFFBQVE7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCO0FBQ3JCO0FBQ0E7QUFDQSwwQ0FBeUMsZ0NBQWdDO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBVyxPQUFPO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQSxNQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBLFVBQVM7QUFDVCxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsWUFBWTtBQUN2QjtBQUNBLGNBQWEsYUFBYTtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxLQUFLO0FBQ2hCLFlBQVcsU0FBUztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsS0FBSztBQUNoQixZQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxLQUFLO0FBQ2hCLFlBQVcsU0FBUztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVCxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNULE1BQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLEtBQUs7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBVyxLQUFLO0FBQ2hCLFlBQVcsT0FBTztBQUNsQixZQUFXLEtBQUs7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsS0FBSztBQUNoQixZQUFXLE9BQU87QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxNQUFNLHNDQUFzQztBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsbURBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNUO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNULE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsRUFBQzs7Ozs7Ozs7QUMvL0REO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUM5REE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsd0JBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCLGlCQUFpQjtBQUN0QztBQUNBO0FBQ0E7QUFDQSxtQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsMkNBQTBDLHNCQUFzQixFQUFFO0FBQ2xFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMENBQXlDO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxXQUFVO0FBQ1Y7QUFDQTs7QUFFQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFDIiwiZmlsZSI6ImpzL2JlZm9yZVB5cmV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0dmFyIHBhcmVudEhvdFVwZGF0ZUNhbGxiYWNrID0gdGhpc1tcIndlYnBhY2tIb3RVcGRhdGVcIl07XG4gXHR0aGlzW1wid2VicGFja0hvdFVwZGF0ZVwiXSA9IFxyXG4gXHRmdW5jdGlvbiB3ZWJwYWNrSG90VXBkYXRlQ2FsbGJhY2soY2h1bmtJZCwgbW9yZU1vZHVsZXMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdGhvdEFkZFVwZGF0ZUNodW5rKGNodW5rSWQsIG1vcmVNb2R1bGVzKTtcclxuIFx0XHRpZihwYXJlbnRIb3RVcGRhdGVDYWxsYmFjaykgcGFyZW50SG90VXBkYXRlQ2FsbGJhY2soY2h1bmtJZCwgbW9yZU1vZHVsZXMpO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3REb3dubG9hZFVwZGF0ZUNodW5rKGNodW5rSWQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdO1xyXG4gXHRcdHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xyXG4gXHRcdHNjcmlwdC50eXBlID0gXCJ0ZXh0L2phdmFzY3JpcHRcIjtcclxuIFx0XHRzY3JpcHQuY2hhcnNldCA9IFwidXRmLThcIjtcclxuIFx0XHRzY3JpcHQuc3JjID0gX193ZWJwYWNrX3JlcXVpcmVfXy5wICsgXCJcIiArIGNodW5rSWQgKyBcIi5cIiArIGhvdEN1cnJlbnRIYXNoICsgXCIuaG90LXVwZGF0ZS5qc1wiO1xyXG4gXHRcdGhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90RG93bmxvYWRNYW5pZmVzdChjYWxsYmFjaykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0aWYodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ID09PSBcInVuZGVmaW5lZFwiKVxyXG4gXHRcdFx0cmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihcIk5vIGJyb3dzZXIgc3VwcG9ydFwiKSk7XHJcbiBcdFx0dHJ5IHtcclxuIFx0XHRcdHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiBcdFx0XHR2YXIgcmVxdWVzdFBhdGggPSBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgKyBcIlwiICsgaG90Q3VycmVudEhhc2ggKyBcIi5ob3QtdXBkYXRlLmpzb25cIjtcclxuIFx0XHRcdHJlcXVlc3Qub3BlbihcIkdFVFwiLCByZXF1ZXN0UGF0aCwgdHJ1ZSk7XHJcbiBcdFx0XHRyZXF1ZXN0LnRpbWVvdXQgPSAxMDAwMDtcclxuIFx0XHRcdHJlcXVlc3Quc2VuZChudWxsKTtcclxuIFx0XHR9IGNhdGNoKGVycikge1xyXG4gXHRcdFx0cmV0dXJuIGNhbGxiYWNrKGVycik7XHJcbiBcdFx0fVxyXG4gXHRcdHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiBcdFx0XHRpZihyZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHJldHVybjtcclxuIFx0XHRcdGlmKHJlcXVlc3Quc3RhdHVzID09PSAwKSB7XHJcbiBcdFx0XHRcdC8vIHRpbWVvdXRcclxuIFx0XHRcdFx0Y2FsbGJhY2sobmV3IEVycm9yKFwiTWFuaWZlc3QgcmVxdWVzdCB0byBcIiArIHJlcXVlc3RQYXRoICsgXCIgdGltZWQgb3V0LlwiKSk7XHJcbiBcdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5zdGF0dXMgPT09IDQwNCkge1xyXG4gXHRcdFx0XHQvLyBubyB1cGRhdGUgYXZhaWxhYmxlXHJcbiBcdFx0XHRcdGNhbGxiYWNrKCk7XHJcbiBcdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5zdGF0dXMgIT09IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyAhPT0gMzA0KSB7XHJcbiBcdFx0XHRcdC8vIG90aGVyIGZhaWx1cmVcclxuIFx0XHRcdFx0Y2FsbGJhY2sobmV3IEVycm9yKFwiTWFuaWZlc3QgcmVxdWVzdCB0byBcIiArIHJlcXVlc3RQYXRoICsgXCIgZmFpbGVkLlwiKSk7XHJcbiBcdFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0XHQvLyBzdWNjZXNzXHJcbiBcdFx0XHRcdHRyeSB7XHJcbiBcdFx0XHRcdFx0dmFyIHVwZGF0ZSA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpO1xyXG4gXHRcdFx0XHR9IGNhdGNoKGUpIHtcclxuIFx0XHRcdFx0XHRjYWxsYmFjayhlKTtcclxuIFx0XHRcdFx0XHRyZXR1cm47XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgdXBkYXRlKTtcclxuIFx0XHRcdH1cclxuIFx0XHR9O1xyXG4gXHR9XHJcblxuIFx0XHJcbiBcdFxyXG4gXHQvLyBDb3BpZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvYmxvYi9iZWY0NWIwL3NyYy9zaGFyZWQvdXRpbHMvY2FuRGVmaW5lUHJvcGVydHkuanNcclxuIFx0dmFyIGNhbkRlZmluZVByb3BlcnR5ID0gZmFsc2U7XHJcbiBcdHRyeSB7XHJcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCBcInhcIiwge1xyXG4gXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHt9XHJcbiBcdFx0fSk7XHJcbiBcdFx0Y2FuRGVmaW5lUHJvcGVydHkgPSB0cnVlO1xyXG4gXHR9IGNhdGNoKHgpIHtcclxuIFx0XHQvLyBJRSB3aWxsIGZhaWwgb24gZGVmaW5lUHJvcGVydHlcclxuIFx0fVxyXG4gXHRcclxuIFx0dmFyIGhvdEFwcGx5T25VcGRhdGUgPSB0cnVlO1xyXG4gXHR2YXIgaG90Q3VycmVudEhhc2ggPSBcImE3ZTEyNTliNGI0YmUwOTE0YzE1XCI7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0dmFyIGhvdEN1cnJlbnRNb2R1bGVEYXRhID0ge307XHJcbiBcdHZhciBob3RDdXJyZW50UGFyZW50cyA9IFtdOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RDcmVhdGVSZXF1aXJlKG1vZHVsZUlkKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHR2YXIgbWUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHRpZighbWUpIHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fO1xyXG4gXHRcdHZhciBmbiA9IGZ1bmN0aW9uKHJlcXVlc3QpIHtcclxuIFx0XHRcdGlmKG1lLmhvdC5hY3RpdmUpIHtcclxuIFx0XHRcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1tyZXF1ZXN0XSkge1xyXG4gXHRcdFx0XHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbcmVxdWVzdF0ucGFyZW50cy5pbmRleE9mKG1vZHVsZUlkKSA8IDApXHJcbiBcdFx0XHRcdFx0XHRpbnN0YWxsZWRNb2R1bGVzW3JlcXVlc3RdLnBhcmVudHMucHVzaChtb2R1bGVJZCk7XHJcbiBcdFx0XHRcdFx0aWYobWUuY2hpbGRyZW4uaW5kZXhPZihyZXF1ZXN0KSA8IDApXHJcbiBcdFx0XHRcdFx0XHRtZS5jaGlsZHJlbi5wdXNoKHJlcXVlc3QpO1xyXG4gXHRcdFx0XHR9IGVsc2UgaG90Q3VycmVudFBhcmVudHMgPSBbbW9kdWxlSWRdO1xyXG4gXHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0Y29uc29sZS53YXJuKFwiW0hNUl0gdW5leHBlY3RlZCByZXF1aXJlKFwiICsgcmVxdWVzdCArIFwiKSBmcm9tIGRpc3Bvc2VkIG1vZHVsZSBcIiArIG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0aG90Q3VycmVudFBhcmVudHMgPSBbXTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKHJlcXVlc3QpO1xyXG4gXHRcdH07XHJcbiBcdFx0Zm9yKHZhciBuYW1lIGluIF9fd2VicGFja19yZXF1aXJlX18pIHtcclxuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChfX3dlYnBhY2tfcmVxdWlyZV9fLCBuYW1lKSkge1xyXG4gXHRcdFx0XHRpZihjYW5EZWZpbmVQcm9wZXJ0eSkge1xyXG4gXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmbiwgbmFtZSwgKGZ1bmN0aW9uKG5hbWUpIHtcclxuIFx0XHRcdFx0XHRcdHJldHVybiB7XHJcbiBcdFx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuIFx0XHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcclxuIFx0XHRcdFx0XHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcclxuIFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfX1tuYW1lXTtcclxuIFx0XHRcdFx0XHRcdFx0fSxcclxuIFx0XHRcdFx0XHRcdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gXHRcdFx0XHRcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX19bbmFtZV0gPSB2YWx1ZTtcclxuIFx0XHRcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdFx0fTtcclxuIFx0XHRcdFx0XHR9KG5hbWUpKSk7XHJcbiBcdFx0XHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRcdFx0Zm5bbmFtZV0gPSBfX3dlYnBhY2tfcmVxdWlyZV9fW25hbWVdO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHRmdW5jdGlvbiBlbnN1cmUoY2h1bmtJZCwgY2FsbGJhY2spIHtcclxuIFx0XHRcdGlmKGhvdFN0YXR1cyA9PT0gXCJyZWFkeVwiKVxyXG4gXHRcdFx0XHRob3RTZXRTdGF0dXMoXCJwcmVwYXJlXCIpO1xyXG4gXHRcdFx0aG90Q2h1bmtzTG9hZGluZysrO1xyXG4gXHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5lKGNodW5rSWQsIGZ1bmN0aW9uKCkge1xyXG4gXHRcdFx0XHR0cnkge1xyXG4gXHRcdFx0XHRcdGNhbGxiYWNrLmNhbGwobnVsbCwgZm4pO1xyXG4gXHRcdFx0XHR9IGZpbmFsbHkge1xyXG4gXHRcdFx0XHRcdGZpbmlzaENodW5rTG9hZGluZygpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFxyXG4gXHRcdFx0XHRmdW5jdGlvbiBmaW5pc2hDaHVua0xvYWRpbmcoKSB7XHJcbiBcdFx0XHRcdFx0aG90Q2h1bmtzTG9hZGluZy0tO1xyXG4gXHRcdFx0XHRcdGlmKGhvdFN0YXR1cyA9PT0gXCJwcmVwYXJlXCIpIHtcclxuIFx0XHRcdFx0XHRcdGlmKCFob3RXYWl0aW5nRmlsZXNNYXBbY2h1bmtJZF0pIHtcclxuIFx0XHRcdFx0XHRcdFx0aG90RW5zdXJlVXBkYXRlQ2h1bmsoY2h1bmtJZCk7XHJcbiBcdFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0XHRpZihob3RDaHVua3NMb2FkaW5nID09PSAwICYmIGhvdFdhaXRpbmdGaWxlcyA9PT0gMCkge1xyXG4gXHRcdFx0XHRcdFx0XHRob3RVcGRhdGVEb3dubG9hZGVkKCk7XHJcbiBcdFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9KTtcclxuIFx0XHR9XHJcbiBcdFx0aWYoY2FuRGVmaW5lUHJvcGVydHkpIHtcclxuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmbiwgXCJlXCIsIHtcclxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcclxuIFx0XHRcdFx0dmFsdWU6IGVuc3VyZVxyXG4gXHRcdFx0fSk7XHJcbiBcdFx0fSBlbHNlIHtcclxuIFx0XHRcdGZuLmUgPSBlbnN1cmU7XHJcbiBcdFx0fVxyXG4gXHRcdHJldHVybiBmbjtcclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90Q3JlYXRlTW9kdWxlKG1vZHVsZUlkKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHR2YXIgaG90ID0ge1xyXG4gXHRcdFx0Ly8gcHJpdmF0ZSBzdHVmZlxyXG4gXHRcdFx0X2FjY2VwdGVkRGVwZW5kZW5jaWVzOiB7fSxcclxuIFx0XHRcdF9kZWNsaW5lZERlcGVuZGVuY2llczoge30sXHJcbiBcdFx0XHRfc2VsZkFjY2VwdGVkOiBmYWxzZSxcclxuIFx0XHRcdF9zZWxmRGVjbGluZWQ6IGZhbHNlLFxyXG4gXHRcdFx0X2Rpc3Bvc2VIYW5kbGVyczogW10sXHJcbiBcdFxyXG4gXHRcdFx0Ly8gTW9kdWxlIEFQSVxyXG4gXHRcdFx0YWN0aXZlOiB0cnVlLFxyXG4gXHRcdFx0YWNjZXB0OiBmdW5jdGlvbihkZXAsIGNhbGxiYWNrKSB7XHJcbiBcdFx0XHRcdGlmKHR5cGVvZiBkZXAgPT09IFwidW5kZWZpbmVkXCIpXHJcbiBcdFx0XHRcdFx0aG90Ll9zZWxmQWNjZXB0ZWQgPSB0cnVlO1xyXG4gXHRcdFx0XHRlbHNlIGlmKHR5cGVvZiBkZXAgPT09IFwiZnVuY3Rpb25cIilcclxuIFx0XHRcdFx0XHRob3QuX3NlbGZBY2NlcHRlZCA9IGRlcDtcclxuIFx0XHRcdFx0ZWxzZSBpZih0eXBlb2YgZGVwID09PSBcIm9iamVjdFwiKVxyXG4gXHRcdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBkZXAubGVuZ3RoOyBpKyspXHJcbiBcdFx0XHRcdFx0XHRob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcFtpXV0gPSBjYWxsYmFjaztcclxuIFx0XHRcdFx0ZWxzZVxyXG4gXHRcdFx0XHRcdGhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbZGVwXSA9IGNhbGxiYWNrO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdGRlY2xpbmU6IGZ1bmN0aW9uKGRlcCkge1xyXG4gXHRcdFx0XHRpZih0eXBlb2YgZGVwID09PSBcInVuZGVmaW5lZFwiKVxyXG4gXHRcdFx0XHRcdGhvdC5fc2VsZkRlY2xpbmVkID0gdHJ1ZTtcclxuIFx0XHRcdFx0ZWxzZSBpZih0eXBlb2YgZGVwID09PSBcIm51bWJlclwiKVxyXG4gXHRcdFx0XHRcdGhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbZGVwXSA9IHRydWU7XHJcbiBcdFx0XHRcdGVsc2VcclxuIFx0XHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgZGVwLmxlbmd0aDsgaSsrKVxyXG4gXHRcdFx0XHRcdFx0aG90Ll9kZWNsaW5lZERlcGVuZGVuY2llc1tkZXBbaV1dID0gdHJ1ZTtcclxuIFx0XHRcdH0sXHJcbiBcdFx0XHRkaXNwb3NlOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gXHRcdFx0XHRob3QuX2Rpc3Bvc2VIYW5kbGVycy5wdXNoKGNhbGxiYWNrKTtcclxuIFx0XHRcdH0sXHJcbiBcdFx0XHRhZGREaXNwb3NlSGFuZGxlcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuIFx0XHRcdFx0aG90Ll9kaXNwb3NlSGFuZGxlcnMucHVzaChjYWxsYmFjayk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0cmVtb3ZlRGlzcG9zZUhhbmRsZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiBcdFx0XHRcdHZhciBpZHggPSBob3QuX2Rpc3Bvc2VIYW5kbGVycy5pbmRleE9mKGNhbGxiYWNrKTtcclxuIFx0XHRcdFx0aWYoaWR4ID49IDApIGhvdC5fZGlzcG9zZUhhbmRsZXJzLnNwbGljZShpZHgsIDEpO1xyXG4gXHRcdFx0fSxcclxuIFx0XHJcbiBcdFx0XHQvLyBNYW5hZ2VtZW50IEFQSVxyXG4gXHRcdFx0Y2hlY2s6IGhvdENoZWNrLFxyXG4gXHRcdFx0YXBwbHk6IGhvdEFwcGx5LFxyXG4gXHRcdFx0c3RhdHVzOiBmdW5jdGlvbihsKSB7XHJcbiBcdFx0XHRcdGlmKCFsKSByZXR1cm4gaG90U3RhdHVzO1xyXG4gXHRcdFx0XHRob3RTdGF0dXNIYW5kbGVycy5wdXNoKGwpO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdGFkZFN0YXR1c0hhbmRsZXI6IGZ1bmN0aW9uKGwpIHtcclxuIFx0XHRcdFx0aG90U3RhdHVzSGFuZGxlcnMucHVzaChsKTtcclxuIFx0XHRcdH0sXHJcbiBcdFx0XHRyZW1vdmVTdGF0dXNIYW5kbGVyOiBmdW5jdGlvbihsKSB7XHJcbiBcdFx0XHRcdHZhciBpZHggPSBob3RTdGF0dXNIYW5kbGVycy5pbmRleE9mKGwpO1xyXG4gXHRcdFx0XHRpZihpZHggPj0gMCkgaG90U3RhdHVzSGFuZGxlcnMuc3BsaWNlKGlkeCwgMSk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcclxuIFx0XHRcdC8vaW5oZXJpdCBmcm9tIHByZXZpb3VzIGRpc3Bvc2UgY2FsbFxyXG4gXHRcdFx0ZGF0YTogaG90Q3VycmVudE1vZHVsZURhdGFbbW9kdWxlSWRdXHJcbiBcdFx0fTtcclxuIFx0XHRyZXR1cm4gaG90O1xyXG4gXHR9XHJcbiBcdFxyXG4gXHR2YXIgaG90U3RhdHVzSGFuZGxlcnMgPSBbXTtcclxuIFx0dmFyIGhvdFN0YXR1cyA9IFwiaWRsZVwiO1xyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90U2V0U3RhdHVzKG5ld1N0YXR1cykge1xyXG4gXHRcdGhvdFN0YXR1cyA9IG5ld1N0YXR1cztcclxuIFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgaG90U3RhdHVzSGFuZGxlcnMubGVuZ3RoOyBpKyspXHJcbiBcdFx0XHRob3RTdGF0dXNIYW5kbGVyc1tpXS5jYWxsKG51bGwsIG5ld1N0YXR1cyk7XHJcbiBcdH1cclxuIFx0XHJcbiBcdC8vIHdoaWxlIGRvd25sb2FkaW5nXHJcbiBcdHZhciBob3RXYWl0aW5nRmlsZXMgPSAwO1xyXG4gXHR2YXIgaG90Q2h1bmtzTG9hZGluZyA9IDA7XHJcbiBcdHZhciBob3RXYWl0aW5nRmlsZXNNYXAgPSB7fTtcclxuIFx0dmFyIGhvdFJlcXVlc3RlZEZpbGVzTWFwID0ge307XHJcbiBcdHZhciBob3RBdmFpbGlibGVGaWxlc01hcCA9IHt9O1xyXG4gXHR2YXIgaG90Q2FsbGJhY2s7XHJcbiBcdFxyXG4gXHQvLyBUaGUgdXBkYXRlIGluZm9cclxuIFx0dmFyIGhvdFVwZGF0ZSwgaG90VXBkYXRlTmV3SGFzaDtcclxuIFx0XHJcbiBcdGZ1bmN0aW9uIHRvTW9kdWxlSWQoaWQpIHtcclxuIFx0XHR2YXIgaXNOdW1iZXIgPSAoK2lkKSArIFwiXCIgPT09IGlkO1xyXG4gXHRcdHJldHVybiBpc051bWJlciA/ICtpZCA6IGlkO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RDaGVjayhhcHBseSwgY2FsbGJhY2spIHtcclxuIFx0XHRpZihob3RTdGF0dXMgIT09IFwiaWRsZVwiKSB0aHJvdyBuZXcgRXJyb3IoXCJjaGVjaygpIGlzIG9ubHkgYWxsb3dlZCBpbiBpZGxlIHN0YXR1c1wiKTtcclxuIFx0XHRpZih0eXBlb2YgYXBwbHkgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gXHRcdFx0aG90QXBwbHlPblVwZGF0ZSA9IGZhbHNlO1xyXG4gXHRcdFx0Y2FsbGJhY2sgPSBhcHBseTtcclxuIFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0aG90QXBwbHlPblVwZGF0ZSA9IGFwcGx5O1xyXG4gXHRcdFx0Y2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbihlcnIpIHtcclxuIFx0XHRcdFx0aWYoZXJyKSB0aHJvdyBlcnI7XHJcbiBcdFx0XHR9O1xyXG4gXHRcdH1cclxuIFx0XHRob3RTZXRTdGF0dXMoXCJjaGVja1wiKTtcclxuIFx0XHRob3REb3dubG9hZE1hbmlmZXN0KGZ1bmN0aW9uKGVyciwgdXBkYXRlKSB7XHJcbiBcdFx0XHRpZihlcnIpIHJldHVybiBjYWxsYmFjayhlcnIpO1xyXG4gXHRcdFx0aWYoIXVwZGF0ZSkge1xyXG4gXHRcdFx0XHRob3RTZXRTdGF0dXMoXCJpZGxlXCIpO1xyXG4gXHRcdFx0XHRjYWxsYmFjayhudWxsLCBudWxsKTtcclxuIFx0XHRcdFx0cmV0dXJuO1xyXG4gXHRcdFx0fVxyXG4gXHRcclxuIFx0XHRcdGhvdFJlcXVlc3RlZEZpbGVzTWFwID0ge307XHJcbiBcdFx0XHRob3RBdmFpbGlibGVGaWxlc01hcCA9IHt9O1xyXG4gXHRcdFx0aG90V2FpdGluZ0ZpbGVzTWFwID0ge307XHJcbiBcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdXBkYXRlLmMubGVuZ3RoOyBpKyspXHJcbiBcdFx0XHRcdGhvdEF2YWlsaWJsZUZpbGVzTWFwW3VwZGF0ZS5jW2ldXSA9IHRydWU7XHJcbiBcdFx0XHRob3RVcGRhdGVOZXdIYXNoID0gdXBkYXRlLmg7XHJcbiBcdFxyXG4gXHRcdFx0aG90U2V0U3RhdHVzKFwicHJlcGFyZVwiKTtcclxuIFx0XHRcdGhvdENhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiBcdFx0XHRob3RVcGRhdGUgPSB7fTtcclxuIFx0XHRcdHZhciBjaHVua0lkID0gMDtcclxuIFx0XHRcdHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1sb25lLWJsb2Nrc1xyXG4gXHRcdFx0XHQvKmdsb2JhbHMgY2h1bmtJZCAqL1xyXG4gXHRcdFx0XHRob3RFbnN1cmVVcGRhdGVDaHVuayhjaHVua0lkKTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdGlmKGhvdFN0YXR1cyA9PT0gXCJwcmVwYXJlXCIgJiYgaG90Q2h1bmtzTG9hZGluZyA9PT0gMCAmJiBob3RXYWl0aW5nRmlsZXMgPT09IDApIHtcclxuIFx0XHRcdFx0aG90VXBkYXRlRG93bmxvYWRlZCgpO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH0pO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RBZGRVcGRhdGVDaHVuayhjaHVua0lkLCBtb3JlTW9kdWxlcykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0aWYoIWhvdEF2YWlsaWJsZUZpbGVzTWFwW2NodW5rSWRdIHx8ICFob3RSZXF1ZXN0ZWRGaWxlc01hcFtjaHVua0lkXSlcclxuIFx0XHRcdHJldHVybjtcclxuIFx0XHRob3RSZXF1ZXN0ZWRGaWxlc01hcFtjaHVua0lkXSA9IGZhbHNlO1xyXG4gXHRcdGZvcih2YXIgbW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcclxuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XHJcbiBcdFx0XHRcdGhvdFVwZGF0ZVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcdGlmKC0taG90V2FpdGluZ0ZpbGVzID09PSAwICYmIGhvdENodW5rc0xvYWRpbmcgPT09IDApIHtcclxuIFx0XHRcdGhvdFVwZGF0ZURvd25sb2FkZWQoKTtcclxuIFx0XHR9XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdEVuc3VyZVVwZGF0ZUNodW5rKGNodW5rSWQpIHtcclxuIFx0XHRpZighaG90QXZhaWxpYmxlRmlsZXNNYXBbY2h1bmtJZF0pIHtcclxuIFx0XHRcdGhvdFdhaXRpbmdGaWxlc01hcFtjaHVua0lkXSA9IHRydWU7XHJcbiBcdFx0fSBlbHNlIHtcclxuIFx0XHRcdGhvdFJlcXVlc3RlZEZpbGVzTWFwW2NodW5rSWRdID0gdHJ1ZTtcclxuIFx0XHRcdGhvdFdhaXRpbmdGaWxlcysrO1xyXG4gXHRcdFx0aG90RG93bmxvYWRVcGRhdGVDaHVuayhjaHVua0lkKTtcclxuIFx0XHR9XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdFVwZGF0ZURvd25sb2FkZWQoKSB7XHJcbiBcdFx0aG90U2V0U3RhdHVzKFwicmVhZHlcIik7XHJcbiBcdFx0dmFyIGNhbGxiYWNrID0gaG90Q2FsbGJhY2s7XHJcbiBcdFx0aG90Q2FsbGJhY2sgPSBudWxsO1xyXG4gXHRcdGlmKCFjYWxsYmFjaykgcmV0dXJuO1xyXG4gXHRcdGlmKGhvdEFwcGx5T25VcGRhdGUpIHtcclxuIFx0XHRcdGhvdEFwcGx5KGhvdEFwcGx5T25VcGRhdGUsIGNhbGxiYWNrKTtcclxuIFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0dmFyIG91dGRhdGVkTW9kdWxlcyA9IFtdO1xyXG4gXHRcdFx0Zm9yKHZhciBpZCBpbiBob3RVcGRhdGUpIHtcclxuIFx0XHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGhvdFVwZGF0ZSwgaWQpKSB7XHJcbiBcdFx0XHRcdFx0b3V0ZGF0ZWRNb2R1bGVzLnB1c2godG9Nb2R1bGVJZChpZCkpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRjYWxsYmFjayhudWxsLCBvdXRkYXRlZE1vZHVsZXMpO1xyXG4gXHRcdH1cclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90QXBwbHkob3B0aW9ucywgY2FsbGJhY2spIHtcclxuIFx0XHRpZihob3RTdGF0dXMgIT09IFwicmVhZHlcIikgdGhyb3cgbmV3IEVycm9yKFwiYXBwbHkoKSBpcyBvbmx5IGFsbG93ZWQgaW4gcmVhZHkgc3RhdHVzXCIpO1xyXG4gXHRcdGlmKHR5cGVvZiBvcHRpb25zID09PSBcImZ1bmN0aW9uXCIpIHtcclxuIFx0XHRcdGNhbGxiYWNrID0gb3B0aW9ucztcclxuIFx0XHRcdG9wdGlvbnMgPSB7fTtcclxuIFx0XHR9IGVsc2UgaWYob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJvYmplY3RcIikge1xyXG4gXHRcdFx0Y2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbihlcnIpIHtcclxuIFx0XHRcdFx0aWYoZXJyKSB0aHJvdyBlcnI7XHJcbiBcdFx0XHR9O1xyXG4gXHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRvcHRpb25zID0ge307XHJcbiBcdFx0XHRjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKGVycikge1xyXG4gXHRcdFx0XHRpZihlcnIpIHRocm93IGVycjtcclxuIFx0XHRcdH07XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHRmdW5jdGlvbiBnZXRBZmZlY3RlZFN0dWZmKG1vZHVsZSkge1xyXG4gXHRcdFx0dmFyIG91dGRhdGVkTW9kdWxlcyA9IFttb2R1bGVdO1xyXG4gXHRcdFx0dmFyIG91dGRhdGVkRGVwZW5kZW5jaWVzID0ge307XHJcbiBcdFxyXG4gXHRcdFx0dmFyIHF1ZXVlID0gb3V0ZGF0ZWRNb2R1bGVzLnNsaWNlKCk7XHJcbiBcdFx0XHR3aGlsZShxdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiBcdFx0XHRcdHZhciBtb2R1bGVJZCA9IHF1ZXVlLnBvcCgpO1xyXG4gXHRcdFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRcdGlmKCFtb2R1bGUgfHwgbW9kdWxlLmhvdC5fc2VsZkFjY2VwdGVkKVxyXG4gXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRpZihtb2R1bGUuaG90Ll9zZWxmRGVjbGluZWQpIHtcclxuIFx0XHRcdFx0XHRyZXR1cm4gbmV3IEVycm9yKFwiQWJvcnRlZCBiZWNhdXNlIG9mIHNlbGYgZGVjbGluZTogXCIgKyBtb2R1bGVJZCk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0aWYobW9kdWxlSWQgPT09IDApIHtcclxuIFx0XHRcdFx0XHRyZXR1cm47XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG1vZHVsZS5wYXJlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHRcdFx0dmFyIHBhcmVudElkID0gbW9kdWxlLnBhcmVudHNbaV07XHJcbiBcdFx0XHRcdFx0dmFyIHBhcmVudCA9IGluc3RhbGxlZE1vZHVsZXNbcGFyZW50SWRdO1xyXG4gXHRcdFx0XHRcdGlmKHBhcmVudC5ob3QuX2RlY2xpbmVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSkge1xyXG4gXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBFcnJvcihcIkFib3J0ZWQgYmVjYXVzZSBvZiBkZWNsaW5lZCBkZXBlbmRlbmN5OiBcIiArIG1vZHVsZUlkICsgXCIgaW4gXCIgKyBwYXJlbnRJZCk7XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdGlmKG91dGRhdGVkTW9kdWxlcy5pbmRleE9mKHBhcmVudElkKSA+PSAwKSBjb250aW51ZTtcclxuIFx0XHRcdFx0XHRpZihwYXJlbnQuaG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pIHtcclxuIFx0XHRcdFx0XHRcdGlmKCFvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF0pXHJcbiBcdFx0XHRcdFx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSA9IFtdO1xyXG4gXHRcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdLCBbbW9kdWxlSWRdKTtcclxuIFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRkZWxldGUgb3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdO1xyXG4gXHRcdFx0XHRcdG91dGRhdGVkTW9kdWxlcy5wdXNoKHBhcmVudElkKTtcclxuIFx0XHRcdFx0XHRxdWV1ZS5wdXNoKHBhcmVudElkKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcclxuIFx0XHRcdHJldHVybiBbb3V0ZGF0ZWRNb2R1bGVzLCBvdXRkYXRlZERlcGVuZGVuY2llc107XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHRmdW5jdGlvbiBhZGRBbGxUb1NldChhLCBiKSB7XHJcbiBcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgYi5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0XHR2YXIgaXRlbSA9IGJbaV07XHJcbiBcdFx0XHRcdGlmKGEuaW5kZXhPZihpdGVtKSA8IDApXHJcbiBcdFx0XHRcdFx0YS5wdXNoKGl0ZW0pO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gYXQgYmVnaW4gYWxsIHVwZGF0ZXMgbW9kdWxlcyBhcmUgb3V0ZGF0ZWRcclxuIFx0XHQvLyB0aGUgXCJvdXRkYXRlZFwiIHN0YXR1cyBjYW4gcHJvcGFnYXRlIHRvIHBhcmVudHMgaWYgdGhleSBkb24ndCBhY2NlcHQgdGhlIGNoaWxkcmVuXHJcbiBcdFx0dmFyIG91dGRhdGVkRGVwZW5kZW5jaWVzID0ge307XHJcbiBcdFx0dmFyIG91dGRhdGVkTW9kdWxlcyA9IFtdO1xyXG4gXHRcdHZhciBhcHBsaWVkVXBkYXRlID0ge307XHJcbiBcdFx0Zm9yKHZhciBpZCBpbiBob3RVcGRhdGUpIHtcclxuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChob3RVcGRhdGUsIGlkKSkge1xyXG4gXHRcdFx0XHR2YXIgbW9kdWxlSWQgPSB0b01vZHVsZUlkKGlkKTtcclxuIFx0XHRcdFx0dmFyIHJlc3VsdCA9IGdldEFmZmVjdGVkU3R1ZmYobW9kdWxlSWQpO1xyXG4gXHRcdFx0XHRpZighcmVzdWx0KSB7XHJcbiBcdFx0XHRcdFx0aWYob3B0aW9ucy5pZ25vcmVVbmFjY2VwdGVkKVxyXG4gXHRcdFx0XHRcdFx0Y29udGludWU7XHJcbiBcdFx0XHRcdFx0aG90U2V0U3RhdHVzKFwiYWJvcnRcIik7XHJcbiBcdFx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihcIkFib3J0ZWQgYmVjYXVzZSBcIiArIG1vZHVsZUlkICsgXCIgaXMgbm90IGFjY2VwdGVkXCIpKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRpZihyZXN1bHQgaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gXHRcdFx0XHRcdGhvdFNldFN0YXR1cyhcImFib3J0XCIpO1xyXG4gXHRcdFx0XHRcdHJldHVybiBjYWxsYmFjayhyZXN1bHQpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGFwcGxpZWRVcGRhdGVbbW9kdWxlSWRdID0gaG90VXBkYXRlW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWRNb2R1bGVzLCByZXN1bHRbMF0pO1xyXG4gXHRcdFx0XHRmb3IodmFyIG1vZHVsZUlkIGluIHJlc3VsdFsxXSkge1xyXG4gXHRcdFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyZXN1bHRbMV0sIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHRcdFx0aWYoIW91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSlcclxuIFx0XHRcdFx0XHRcdFx0b3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdID0gW107XHJcbiBcdFx0XHRcdFx0XHRhZGRBbGxUb1NldChvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0sIHJlc3VsdFsxXVttb2R1bGVJZF0pO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gU3RvcmUgc2VsZiBhY2NlcHRlZCBvdXRkYXRlZCBtb2R1bGVzIHRvIHJlcXVpcmUgdGhlbSBsYXRlciBieSB0aGUgbW9kdWxlIHN5c3RlbVxyXG4gXHRcdHZhciBvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMgPSBbXTtcclxuIFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgb3V0ZGF0ZWRNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHR2YXIgbW9kdWxlSWQgPSBvdXRkYXRlZE1vZHVsZXNbaV07XHJcbiBcdFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSAmJiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5ob3QuX3NlbGZBY2NlcHRlZClcclxuIFx0XHRcdFx0b3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzLnB1c2goe1xyXG4gXHRcdFx0XHRcdG1vZHVsZTogbW9kdWxlSWQsXHJcbiBcdFx0XHRcdFx0ZXJyb3JIYW5kbGVyOiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5ob3QuX3NlbGZBY2NlcHRlZFxyXG4gXHRcdFx0XHR9KTtcclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIE5vdyBpbiBcImRpc3Bvc2VcIiBwaGFzZVxyXG4gXHRcdGhvdFNldFN0YXR1cyhcImRpc3Bvc2VcIik7XHJcbiBcdFx0dmFyIHF1ZXVlID0gb3V0ZGF0ZWRNb2R1bGVzLnNsaWNlKCk7XHJcbiBcdFx0d2hpbGUocXVldWUubGVuZ3RoID4gMCkge1xyXG4gXHRcdFx0dmFyIG1vZHVsZUlkID0gcXVldWUucG9wKCk7XHJcbiBcdFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRpZighbW9kdWxlKSBjb250aW51ZTtcclxuIFx0XHJcbiBcdFx0XHR2YXIgZGF0YSA9IHt9O1xyXG4gXHRcclxuIFx0XHRcdC8vIENhbGwgZGlzcG9zZSBoYW5kbGVyc1xyXG4gXHRcdFx0dmFyIGRpc3Bvc2VIYW5kbGVycyA9IG1vZHVsZS5ob3QuX2Rpc3Bvc2VIYW5kbGVycztcclxuIFx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBkaXNwb3NlSGFuZGxlcnMubGVuZ3RoOyBqKyspIHtcclxuIFx0XHRcdFx0dmFyIGNiID0gZGlzcG9zZUhhbmRsZXJzW2pdO1xyXG4gXHRcdFx0XHRjYihkYXRhKTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdGhvdEN1cnJlbnRNb2R1bGVEYXRhW21vZHVsZUlkXSA9IGRhdGE7XHJcbiBcdFxyXG4gXHRcdFx0Ly8gZGlzYWJsZSBtb2R1bGUgKHRoaXMgZGlzYWJsZXMgcmVxdWlyZXMgZnJvbSB0aGlzIG1vZHVsZSlcclxuIFx0XHRcdG1vZHVsZS5ob3QuYWN0aXZlID0gZmFsc2U7XHJcbiBcdFxyXG4gXHRcdFx0Ly8gcmVtb3ZlIG1vZHVsZSBmcm9tIGNhY2hlXHJcbiBcdFx0XHRkZWxldGUgaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFxyXG4gXHRcdFx0Ly8gcmVtb3ZlIFwicGFyZW50c1wiIHJlZmVyZW5jZXMgZnJvbSBhbGwgY2hpbGRyZW5cclxuIFx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBtb2R1bGUuY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcclxuIFx0XHRcdFx0dmFyIGNoaWxkID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGUuY2hpbGRyZW5bal1dO1xyXG4gXHRcdFx0XHRpZighY2hpbGQpIGNvbnRpbnVlO1xyXG4gXHRcdFx0XHR2YXIgaWR4ID0gY2hpbGQucGFyZW50cy5pbmRleE9mKG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0aWYoaWR4ID49IDApIHtcclxuIFx0XHRcdFx0XHRjaGlsZC5wYXJlbnRzLnNwbGljZShpZHgsIDEpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyByZW1vdmUgb3V0ZGF0ZWQgZGVwZW5kZW5jeSBmcm9tIG1vZHVsZSBjaGlsZHJlblxyXG4gXHRcdGZvcih2YXIgbW9kdWxlSWQgaW4gb3V0ZGF0ZWREZXBlbmRlbmNpZXMpIHtcclxuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvdXRkYXRlZERlcGVuZGVuY2llcywgbW9kdWxlSWQpKSB7XHJcbiBcdFx0XHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0dmFyIG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzID0gb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMubGVuZ3RoOyBqKyspIHtcclxuIFx0XHRcdFx0XHR2YXIgZGVwZW5kZW5jeSA9IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzW2pdO1xyXG4gXHRcdFx0XHRcdHZhciBpZHggPSBtb2R1bGUuY2hpbGRyZW4uaW5kZXhPZihkZXBlbmRlbmN5KTtcclxuIFx0XHRcdFx0XHRpZihpZHggPj0gMCkgbW9kdWxlLmNoaWxkcmVuLnNwbGljZShpZHgsIDEpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBOb3QgaW4gXCJhcHBseVwiIHBoYXNlXHJcbiBcdFx0aG90U2V0U3RhdHVzKFwiYXBwbHlcIik7XHJcbiBcdFxyXG4gXHRcdGhvdEN1cnJlbnRIYXNoID0gaG90VXBkYXRlTmV3SGFzaDtcclxuIFx0XHJcbiBcdFx0Ly8gaW5zZXJ0IG5ldyBjb2RlXHJcbiBcdFx0Zm9yKHZhciBtb2R1bGVJZCBpbiBhcHBsaWVkVXBkYXRlKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXBwbGllZFVwZGF0ZSwgbW9kdWxlSWQpKSB7XHJcbiBcdFx0XHRcdG1vZHVsZXNbbW9kdWxlSWRdID0gYXBwbGllZFVwZGF0ZVttb2R1bGVJZF07XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBjYWxsIGFjY2VwdCBoYW5kbGVyc1xyXG4gXHRcdHZhciBlcnJvciA9IG51bGw7XHJcbiBcdFx0Zm9yKHZhciBtb2R1bGVJZCBpbiBvdXRkYXRlZERlcGVuZGVuY2llcykge1xyXG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG91dGRhdGVkRGVwZW5kZW5jaWVzLCBtb2R1bGVJZCkpIHtcclxuIFx0XHRcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0XHR2YXIgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMgPSBvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRcdHZhciBjYWxsYmFja3MgPSBbXTtcclxuIFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHRcdFx0dmFyIGRlcGVuZGVuY3kgPSBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llc1tpXTtcclxuIFx0XHRcdFx0XHR2YXIgY2IgPSBtb2R1bGUuaG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1tkZXBlbmRlbmN5XTtcclxuIFx0XHRcdFx0XHRpZihjYWxsYmFja3MuaW5kZXhPZihjYikgPj0gMCkgY29udGludWU7XHJcbiBcdFx0XHRcdFx0Y2FsbGJhY2tzLnB1c2goY2IpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdFx0XHR2YXIgY2IgPSBjYWxsYmFja3NbaV07XHJcbiBcdFx0XHRcdFx0dHJ5IHtcclxuIFx0XHRcdFx0XHRcdGNiKG91dGRhdGVkRGVwZW5kZW5jaWVzKTtcclxuIFx0XHRcdFx0XHR9IGNhdGNoKGVycikge1xyXG4gXHRcdFx0XHRcdFx0aWYoIWVycm9yKVxyXG4gXHRcdFx0XHRcdFx0XHRlcnJvciA9IGVycjtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIExvYWQgc2VsZiBhY2NlcHRlZCBtb2R1bGVzXHJcbiBcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlcy5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0dmFyIGl0ZW0gPSBvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXNbaV07XHJcbiBcdFx0XHR2YXIgbW9kdWxlSWQgPSBpdGVtLm1vZHVsZTtcclxuIFx0XHRcdGhvdEN1cnJlbnRQYXJlbnRzID0gW21vZHVsZUlkXTtcclxuIFx0XHRcdHRyeSB7XHJcbiBcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpO1xyXG4gXHRcdFx0fSBjYXRjaChlcnIpIHtcclxuIFx0XHRcdFx0aWYodHlwZW9mIGl0ZW0uZXJyb3JIYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcclxuIFx0XHRcdFx0XHR0cnkge1xyXG4gXHRcdFx0XHRcdFx0aXRlbS5lcnJvckhhbmRsZXIoZXJyKTtcclxuIFx0XHRcdFx0XHR9IGNhdGNoKGVycikge1xyXG4gXHRcdFx0XHRcdFx0aWYoIWVycm9yKVxyXG4gXHRcdFx0XHRcdFx0XHRlcnJvciA9IGVycjtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH0gZWxzZSBpZighZXJyb3IpXHJcbiBcdFx0XHRcdFx0ZXJyb3IgPSBlcnI7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBoYW5kbGUgZXJyb3JzIGluIGFjY2VwdCBoYW5kbGVycyBhbmQgc2VsZiBhY2NlcHRlZCBtb2R1bGUgbG9hZFxyXG4gXHRcdGlmKGVycm9yKSB7XHJcbiBcdFx0XHRob3RTZXRTdGF0dXMoXCJmYWlsXCIpO1xyXG4gXHRcdFx0cmV0dXJuIGNhbGxiYWNrKGVycm9yKTtcclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdGhvdFNldFN0YXR1cyhcImlkbGVcIik7XHJcbiBcdFx0Y2FsbGJhY2sobnVsbCwgb3V0ZGF0ZWRNb2R1bGVzKTtcclxuIFx0fVxyXG5cbiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZSxcbiBcdFx0XHRob3Q6IGhvdENyZWF0ZU1vZHVsZShtb2R1bGVJZCksXG4gXHRcdFx0cGFyZW50czogaG90Q3VycmVudFBhcmVudHMsXG4gXHRcdFx0Y2hpbGRyZW46IFtdXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIGhvdENyZWF0ZVJlcXVpcmUobW9kdWxlSWQpKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMS9cIjtcblxuIFx0Ly8gX193ZWJwYWNrX2hhc2hfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5oID0gZnVuY3Rpb24oKSB7IHJldHVybiBob3RDdXJyZW50SGFzaDsgfTtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gaG90Q3JlYXRlUmVxdWlyZSgwKSgwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBhN2UxMjU5YjRiNGJlMDkxNGMxNSIsIi8qIGdsb2JhbCAkIGpRdWVyeSBDUE8gQ29kZU1pcnJvciBzdG9yYWdlQVBJIFEgY3JlYXRlUHJvZ3JhbUNvbGxlY3Rpb25BUEkgbWFrZVNoYXJlQVBJICovXG5cbnZhciBzaGFyZUFQSSA9IG1ha2VTaGFyZUFQSShwcm9jZXNzLmVudi5DVVJSRU5UX1BZUkVUX1JFTEVBU0UpO1xuXG52YXIgdXJsID0gcmVxdWlyZSgndXJsLmpzJyk7XG52YXIgbW9kYWxQcm9tcHQgPSByZXF1aXJlKCcuL21vZGFsLXByb21wdC5qcycpO1xud2luZG93Lm1vZGFsUHJvbXB0ID0gbW9kYWxQcm9tcHQ7XG5cbmNvbnN0IExPRyA9IHRydWU7XG53aW5kb3cuY3RfbG9nID0gZnVuY3Rpb24oLyogdmFyYXJncyAqLykge1xuICBpZiAod2luZG93LmNvbnNvbGUgJiYgTE9HKSB7XG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgfVxufTtcblxud2luZG93LmN0X2Vycm9yID0gZnVuY3Rpb24oLyogdmFyYXJncyAqLykge1xuICBpZiAod2luZG93LmNvbnNvbGUgJiYgTE9HKSB7XG4gICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICB9XG59O1xudmFyIGluaXRpYWxQYXJhbXMgPSB1cmwucGFyc2UoZG9jdW1lbnQubG9jYXRpb24uaHJlZik7XG52YXIgcGFyYW1zID0gdXJsLnBhcnNlKFwiLz9cIiArIGluaXRpYWxQYXJhbXNbXCJoYXNoXCJdKTtcbndpbmRvdy5oaWdobGlnaHRNb2RlID0gXCJtY21oXCI7IC8vIHdoYXQgaXMgdGhpcyBmb3I/XG53aW5kb3cuY2xlYXJGbGFzaCA9IGZ1bmN0aW9uKCkge1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikuZW1wdHkoKTtcbn1cbndpbmRvdy5zdGlja0Vycm9yID0gZnVuY3Rpb24obWVzc2FnZSwgbW9yZSkge1xuICBDUE8uc2F5QW5kRm9yZ2V0KG1lc3NhZ2UpO1xuICBjbGVhckZsYXNoKCk7XG4gIHZhciBlcnIgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJlcnJvclwiKS50ZXh0KG1lc3NhZ2UpO1xuICBpZihtb3JlKSB7XG4gICAgZXJyLmF0dHIoXCJ0aXRsZVwiLCBtb3JlKTtcbiAgfVxuICBlcnIudG9vbHRpcCgpO1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikucHJlcGVuZChlcnIpO1xufTtcbndpbmRvdy5mbGFzaEVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBDUE8uc2F5QW5kRm9yZ2V0KG1lc3NhZ2UpO1xuICBjbGVhckZsYXNoKCk7XG4gIHZhciBlcnIgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJlcnJvclwiKS50ZXh0KG1lc3NhZ2UpO1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikucHJlcGVuZChlcnIpO1xuICBlcnIuZmFkZU91dCg3MDAwKTtcbn07XG53aW5kb3cuZmxhc2hNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBDUE8uc2F5QW5kRm9yZ2V0KG1lc3NhZ2UpO1xuICBjbGVhckZsYXNoKCk7XG4gIHZhciBtc2cgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJhY3RpdmVcIikudGV4dChtZXNzYWdlKTtcbiAgJChcIi5ub3RpZmljYXRpb25BcmVhXCIpLnByZXBlbmQobXNnKTtcbiAgbXNnLmZhZGVPdXQoNzAwMCk7XG59O1xud2luZG93LnN0aWNrTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgQ1BPLnNheUFuZEZvcmdldChtZXNzYWdlKTtcbiAgY2xlYXJGbGFzaCgpO1xuICB2YXIgZXJyID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpLnRleHQobWVzc2FnZSk7XG4gICQoXCIubm90aWZpY2F0aW9uQXJlYVwiKS5wcmVwZW5kKGVycik7XG59O1xud2luZG93Lm1rV2FybmluZ1VwcGVyID0gZnVuY3Rpb24oKXtyZXR1cm4gJChcIjxkaXYgY2xhc3M9J3dhcm5pbmctdXBwZXInPlwiKTt9XG53aW5kb3cubWtXYXJuaW5nTG93ZXIgPSBmdW5jdGlvbigpe3JldHVybiAkKFwiPGRpdiBjbGFzcz0nd2FybmluZy1sb3dlcic+XCIpO31cblxuJCh3aW5kb3cpLmJpbmQoXCJiZWZvcmV1bmxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBcIkJlY2F1c2UgdGhpcyBwYWdlIGNhbiBsb2FkIHNsb3dseSwgYW5kIHlvdSBtYXkgaGF2ZSBvdXRzdGFuZGluZyBjaGFuZ2VzLCB3ZSBhc2sgdGhhdCB5b3UgY29uZmlybSBiZWZvcmUgbGVhdmluZyB0aGUgZWRpdG9yIGluIGNhc2UgY2xvc2luZyB3YXMgYW4gYWNjaWRlbnQuXCI7XG59KTtcblxudmFyIERvY3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gIGZ1bmN0aW9uIERvY3VtZW50cygpIHtcbiAgICB0aGlzLmRvY3VtZW50cyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIERvY3VtZW50cy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuaGFzKG5hbWUpO1xuICB9O1xuXG4gIERvY3VtZW50cy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuZ2V0KG5hbWUpO1xuICB9O1xuXG4gIERvY3VtZW50cy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKG5hbWUsIGRvYykge1xuICAgIGlmKGxvZ2dlci5pc0RldGFpbGVkKVxuICAgICAgbG9nZ2VyLmxvZyhcImRvYy5zZXRcIiwge25hbWU6IG5hbWUsIHZhbHVlOiBkb2MuZ2V0VmFsdWUoKX0pO1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50cy5zZXQobmFtZSwgZG9jKTtcbiAgfTtcblxuICBEb2N1bWVudHMucHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYobG9nZ2VyLmlzRGV0YWlsZWQpXG4gICAgICBsb2dnZXIubG9nKFwiZG9jLmRlbFwiLCB7bmFtZTogbmFtZX0pO1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50cy5kZWxldGUobmFtZSk7XG4gIH07XG5cbiAgRG9jdW1lbnRzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGYpIHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuZm9yRWFjaChmKTtcbiAgfTtcblxuICByZXR1cm4gRG9jdW1lbnRzO1xufSgpO1xuXG52YXIgVkVSU0lPTl9DSEVDS19JTlRFUlZBTCA9IDEyMDAwMCArICgzMDAwMCAqIE1hdGgucmFuZG9tKCkpO1xuXG5mdW5jdGlvbiBjaGVja1ZlcnNpb24oKSB7XG4gICQuZ2V0KFwiL2N1cnJlbnQtdmVyc2lvblwiKS50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICByZXNwID0gSlNPTi5wYXJzZShyZXNwKTtcbiAgICBpZihyZXNwLnZlcnNpb24gJiYgcmVzcC52ZXJzaW9uICE9PSBwcm9jZXNzLmVudi5DVVJSRU5UX1BZUkVUX1JFTEVBU0UpIHtcbiAgICAgIHdpbmRvdy5mbGFzaE1lc3NhZ2UoXCJBIG5ldyB2ZXJzaW9uIG9mIFB5cmV0IGlzIGF2YWlsYWJsZS4gU2F2ZSBhbmQgcmVsb2FkIHRoZSBwYWdlIHRvIGdldCB0aGUgbmV3ZXN0IHZlcnNpb24uXCIpO1xuICAgIH1cbiAgfSk7XG59XG53aW5kb3cuc2V0SW50ZXJ2YWwoY2hlY2tWZXJzaW9uLCBWRVJTSU9OX0NIRUNLX0lOVEVSVkFMKTtcblxud2luZG93LkNQTyA9IHtcbiAgc2F2ZTogZnVuY3Rpb24oKSB7fSxcbiAgYXV0b1NhdmU6IGZ1bmN0aW9uKCkge30sXG4gIGRvY3VtZW50cyA6IG5ldyBEb2N1bWVudHMoKVxufTtcbiQoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIG1lcmdlKG9iaiwgZXh0ZW5zaW9uKSB7XG4gICAgdmFyIG5ld29iaiA9IHt9O1xuICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgICBuZXdvYmpba10gPSBvYmpba107XG4gICAgfSk7XG4gICAgT2JqZWN0LmtleXMoZXh0ZW5zaW9uKS5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICAgIG5ld29ialtrXSA9IGV4dGVuc2lvbltrXTtcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3b2JqO1xuICB9XG4gIHZhciBhbmltYXRpb25EaXYgPSBudWxsO1xuICBmdW5jdGlvbiBjbG9zZUFuaW1hdGlvbklmT3BlbigpIHtcbiAgICBpZihhbmltYXRpb25EaXYpIHtcbiAgICAgIGFuaW1hdGlvbkRpdi5lbXB0eSgpO1xuICAgICAgYW5pbWF0aW9uRGl2LmRpYWxvZyhcImRlc3Ryb3lcIik7XG4gICAgICBhbmltYXRpb25EaXYgPSBudWxsO1xuICAgIH1cbiAgfVxuICBDUE8ubWFrZUVkaXRvciA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIHZhciBpbml0aWFsID0gXCJcIjtcbiAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShcImluaXRpYWxcIikpIHtcbiAgICAgIGluaXRpYWwgPSBvcHRpb25zLmluaXRpYWw7XG4gICAgfVxuXG4gICAgdmFyIHRleHRhcmVhID0galF1ZXJ5KFwiPHRleHRhcmVhIGFyaWEtaGlkZGVuPSd0cnVlJz5cIik7XG4gICAgdGV4dGFyZWEudmFsKGluaXRpYWwpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQodGV4dGFyZWEpO1xuXG4gICAgdmFyIHJ1bkZ1biA9IGZ1bmN0aW9uIChjb2RlLCByZXBsT3B0aW9ucykge1xuICAgICAgb3B0aW9ucy5ydW4oY29kZSwge2NtOiBDTX0sIHJlcGxPcHRpb25zKTtcbiAgICB9O1xuXG4gICAgdmFyIHVzZUxpbmVOdW1iZXJzID0gIW9wdGlvbnMuc2ltcGxlRWRpdG9yO1xuICAgIHZhciB1c2VGb2xkaW5nID0gIW9wdGlvbnMuc2ltcGxlRWRpdG9yO1xuXG4gICAgdmFyIGd1dHRlcnMgPSAhb3B0aW9ucy5zaW1wbGVFZGl0b3IgP1xuICAgICAgW1wiQ29kZU1pcnJvci1saW5lbnVtYmVyc1wiLCBcIkNvZGVNaXJyb3ItZm9sZGd1dHRlclwiXSA6XG4gICAgICBbXTtcblxuICAgIGZ1bmN0aW9uIHJlaW5kZW50QWxsTGluZXMoY20pIHtcbiAgICAgIHZhciBsYXN0ID0gY20ubGluZUNvdW50KCk7XG4gICAgICBjbS5vcGVyYXRpb24oZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdDsgKytpKSBjbS5pbmRlbnRMaW5lKGkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gcGxhY2UgYSB2ZXJ0aWNhbCBsaW5lIGF0IGNoYXJhY3RlciA4MCBpbiBjb2RlIGVkaXRvciwgYW5kIG5vdCByZXBsXG4gICAgdmFyIENPREVfTElORV9XSURUSCA9IDEwMDtcblxuICAgIHZhciBydWxlcnMsIHJ1bGVyc01pbkNvbDtcbiAgICBpZiAob3B0aW9ucy5zaW1wbGVFZGl0b3IpIHtcbiAgICAgIHJ1bGVycyA9IFtdO1xuICAgIH0gZWxzZXtcbiAgICAgIHJ1bGVycyA9IFt7Y29sb3I6IFwiIzMxN0JDRlwiLCBjb2x1bW46IENPREVfTElORV9XSURUSCwgbGluZVN0eWxlOiBcImRhc2hlZFwiLCBjbGFzc05hbWU6IFwiaGlkZGVuXCJ9XTtcbiAgICAgIHJ1bGVyc01pbkNvbCA9IENPREVfTElORV9XSURUSDtcbiAgICB9XG5cbiAgICB2YXIgY21PcHRpb25zID0ge1xuICAgICAgZXh0cmFLZXlzOiBDb2RlTWlycm9yLm5vcm1hbGl6ZUtleU1hcCh7XG4gICAgICAgIFwiU2hpZnQtRW50ZXJcIjogZnVuY3Rpb24oY20pIHsgcnVuRnVuKGNtLmdldFZhbHVlKCkpOyB9LFxuICAgICAgICBcIlNoaWZ0LUN0cmwtRW50ZXJcIjogZnVuY3Rpb24oY20pIHsgcnVuRnVuKGNtLmdldFZhbHVlKCkpOyB9LFxuICAgICAgICBcIlRhYlwiOiBcImluZGVudEF1dG9cIixcbiAgICAgICAgXCJDdHJsLUlcIjogcmVpbmRlbnRBbGxMaW5lcyxcbiAgICAgICAgXCJFc2MgTGVmdFwiOiBcImdvQmFja3dhcmRTZXhwXCIsXG4gICAgICAgIFwiQWx0LUxlZnRcIjogXCJnb0JhY2t3YXJkU2V4cFwiLFxuICAgICAgICBcIkVzYyBSaWdodFwiOiBcImdvRm9yd2FyZFNleHBcIixcbiAgICAgICAgXCJBbHQtUmlnaHRcIjogXCJnb0ZvcndhcmRTZXhwXCIsXG4gICAgICAgIFwiQ3RybC1MZWZ0XCI6IFwiZ29CYWNrd2FyZFRva2VuXCIsXG4gICAgICAgIFwiQ3RybC1SaWdodFwiOiBcImdvRm9yd2FyZFRva2VuXCJcbiAgICAgIH0pLFxuICAgICAgaW5kZW50VW5pdDogMixcbiAgICAgIHRhYlNpemU6IDIsXG4gICAgICB2aWV3cG9ydE1hcmdpbjogSW5maW5pdHksXG4gICAgICBsaW5lTnVtYmVyczogdXNlTGluZU51bWJlcnMsXG4gICAgICBtYXRjaEtleXdvcmRzOiB0cnVlLFxuICAgICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICAgIHN0eWxlU2VsZWN0ZWRUZXh0OiB0cnVlLFxuICAgICAgZm9sZEd1dHRlcjogdXNlRm9sZGluZyxcbiAgICAgIGd1dHRlcnM6IGd1dHRlcnMsXG4gICAgICBsaW5lV3JhcHBpbmc6IHRydWUsXG4gICAgICBsb2dnaW5nOiB0cnVlLFxuICAgICAgcnVsZXJzOiBydWxlcnMsXG4gICAgICBydWxlcnNNaW5Db2w6IHJ1bGVyc01pbkNvbFxuICAgIH07XG5cbiAgICBjbU9wdGlvbnMgPSBtZXJnZShjbU9wdGlvbnMsIG9wdGlvbnMuY21PcHRpb25zIHx8IHt9KTtcblxuICAgIHZhciBDTSA9IENvZGVNaXJyb3IuZnJvbVRleHRBcmVhKHRleHRhcmVhWzBdLCBjbU9wdGlvbnMpO1xuXG4gICAgaWYgKHVzZUxpbmVOdW1iZXJzKSB7XG4gICAgICBDTS5kaXNwbGF5LndyYXBwZXIuYXBwZW5kQ2hpbGQobWtXYXJuaW5nVXBwZXIoKVswXSk7XG4gICAgICBDTS5kaXNwbGF5LndyYXBwZXIuYXBwZW5kQ2hpbGQobWtXYXJuaW5nTG93ZXIoKVswXSk7XG4gICAgfVxuXG4gICAgZ2V0VG9wVGllck1lbnVpdGVtcygpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNtOiBDTSxcbiAgICAgIHJlZnJlc2g6IGZ1bmN0aW9uKCkgeyBDTS5yZWZyZXNoKCk7IH0sXG4gICAgICBydW46IGZ1bmN0aW9uKCkge1xuICAgICAgICBydW5GdW4oQ00uZ2V0VmFsdWUoKSk7XG4gICAgICB9LFxuICAgICAgZm9jdXM6IGZ1bmN0aW9uKCkgeyBDTS5mb2N1cygpOyB9LFxuICAgICAgZm9jdXNDYXJvdXNlbDogbnVsbCAvL2luaXRGb2N1c0Nhcm91c2VsXG4gICAgfTtcbiAgfTtcbiAgQ1BPLlJVTl9DT0RFID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJSdW5uaW5nIGJlZm9yZSByZWFkeVwiLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHNldFVzZXJuYW1lKHRhcmdldCkge1xuICAgIHJldHVybiBnd3JhcC5sb2FkKHtuYW1lOiAncGx1cycsXG4gICAgICB2ZXJzaW9uOiAndjEnLFxuICAgIH0pLnRoZW4oKGFwaSkgPT4ge1xuICAgICAgYXBpLnBlb3BsZS5nZXQoeyB1c2VySWQ6IFwibWVcIiB9KS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgdmFyIG5hbWUgPSB1c2VyLmRpc3BsYXlOYW1lO1xuICAgICAgICBpZiAodXNlci5lbWFpbHMgJiYgdXNlci5lbWFpbHNbMF0gJiYgdXNlci5lbWFpbHNbMF0udmFsdWUpIHtcbiAgICAgICAgICBuYW1lID0gdXNlci5lbWFpbHNbMF0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0LnRleHQobmFtZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0b3JhZ2VBUEkudGhlbihmdW5jdGlvbihhcGkpIHtcbiAgICBhcGkuY29sbGVjdGlvbi50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgJChcIi5sb2dpbk9ubHlcIikuc2hvdygpO1xuICAgICAgJChcIi5sb2dvdXRPbmx5XCIpLmhpZGUoKTtcbiAgICAgIHNldFVzZXJuYW1lKCQoXCIjdXNlcm5hbWVcIikpO1xuICAgIH0pO1xuICAgIGFwaS5jb2xsZWN0aW9uLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICAkKFwiLmxvZ2luT25seVwiKS5oaWRlKCk7XG4gICAgICAkKFwiLmxvZ291dE9ubHlcIikuc2hvdygpO1xuICAgIH0pO1xuICB9KTtcblxuICBzdG9yYWdlQVBJID0gc3RvcmFnZUFQSS50aGVuKGZ1bmN0aW9uKGFwaSkgeyByZXR1cm4gYXBpLmFwaTsgfSk7XG4gICQoXCIjY29ubmVjdEJ1dHRvblwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAkKFwiI2Nvbm5lY3RCdXR0b25cIikudGV4dChcIkNvbm5lY3RpbmcuLi5cIik7XG4gICAgJChcIiNjb25uZWN0QnV0dG9uXCIpLmF0dHIoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xuICAgICQoJyNjb25uZWN0QnV0dG9ubGknKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgICQoXCIjY29ubmVjdEJ1dHRvblwiKS5hdHRyKFwidGFiSW5kZXhcIiwgXCItMVwiKTtcbiAgICAvLyQoXCIjdG9wVGllclVsXCIpLmF0dHIoXCJ0YWJJbmRleFwiLCBcIjBcIik7XG4gICAgZ2V0VG9wVGllck1lbnVpdGVtcygpO1xuICAgIHN0b3JhZ2VBUEkgPSBjcmVhdGVQcm9ncmFtQ29sbGVjdGlvbkFQSShcImNvZGUucHlyZXQub3JnXCIsIGZhbHNlKTtcbiAgICBzdG9yYWdlQVBJLnRoZW4oZnVuY3Rpb24oYXBpKSB7XG4gICAgICBhcGkuY29sbGVjdGlvbi50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAkKFwiLmxvZ2luT25seVwiKS5zaG93KCk7XG4gICAgICAgICQoXCIubG9nb3V0T25seVwiKS5oaWRlKCk7XG4gICAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgICAgICAkKFwiI2Jvbm5pZW1lbnVidXR0b25cIikuZm9jdXMoKTtcbiAgICAgICAgc2V0VXNlcm5hbWUoJChcIiN1c2VybmFtZVwiKSk7XG4gICAgICAgIGlmKHBhcmFtc1tcImdldFwiXSAmJiBwYXJhbXNbXCJnZXRcIl1bXCJwcm9ncmFtXCJdKSB7XG4gICAgICAgICAgdmFyIHRvTG9hZCA9IGFwaS5hcGkuZ2V0RmlsZUJ5SWQocGFyYW1zW1wiZ2V0XCJdW1wicHJvZ3JhbVwiXSk7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJMb2dnZWQgaW4gYW5kIGhhcyBwcm9ncmFtIHRvIGxvYWQ6IFwiLCB0b0xvYWQpO1xuICAgICAgICAgIGxvYWRQcm9ncmFtKHRvTG9hZCk7XG4gICAgICAgICAgcHJvZ3JhbVRvU2F2ZSA9IHRvTG9hZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcm9ncmFtVG9TYXZlID0gUS5mY2FsbChmdW5jdGlvbigpIHsgcmV0dXJuIG51bGw7IH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGFwaS5jb2xsZWN0aW9uLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICQoXCIjY29ubmVjdEJ1dHRvblwiKS50ZXh0KFwiQ29ubmVjdCB0byBHb29nbGUgRHJpdmVcIik7XG4gICAgICAgICQoXCIjY29ubmVjdEJ1dHRvblwiKS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICAkKCcjY29ubmVjdEJ1dHRvbmxpJykuYXR0cignZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICAgIC8vJChcIiNjb25uZWN0QnV0dG9uXCIpLmF0dHIoXCJ0YWJJbmRleFwiLCBcIjBcIik7XG4gICAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgICAgICAkKFwiI2Nvbm5lY3RCdXR0b25cIikuZm9jdXMoKTtcbiAgICAgICAgLy8kKFwiI3RvcFRpZXJVbFwiKS5hdHRyKFwidGFiSW5kZXhcIiwgXCItMVwiKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHN0b3JhZ2VBUEkgPSBzdG9yYWdlQVBJLnRoZW4oZnVuY3Rpb24oYXBpKSB7IHJldHVybiBhcGkuYXBpOyB9KTtcbiAgfSk7XG5cbiAgLypcbiAgICBpbml0aWFsUHJvZ3JhbSBob2xkcyBhIHByb21pc2UgZm9yIGEgRHJpdmUgRmlsZSBvYmplY3Qgb3IgbnVsbFxuXG4gICAgSXQncyBudWxsIGlmIHRoZSBwYWdlIGRvZXNuJ3QgaGF2ZSBhICNzaGFyZSBvciAjcHJvZ3JhbSB1cmxcblxuICAgIElmIHRoZSB1cmwgZG9lcyBoYXZlIGEgI3Byb2dyYW0gb3IgI3NoYXJlLCB0aGUgcHJvbWlzZSBpcyBmb3IgdGhlXG4gICAgY29ycmVzcG9uZGluZyBvYmplY3QuXG4gICovXG4gIHZhciBpbml0aWFsUHJvZ3JhbSA9IHN0b3JhZ2VBUEkudGhlbihmdW5jdGlvbihhcGkpIHtcbiAgICB2YXIgcHJvZ3JhbUxvYWQgPSBudWxsO1xuICAgIGlmKHBhcmFtc1tcImdldFwiXSAmJiBwYXJhbXNbXCJnZXRcIl1bXCJwcm9ncmFtXCJdKSB7XG4gICAgICBlbmFibGVGaWxlT3B0aW9ucygpO1xuICAgICAgcHJvZ3JhbUxvYWQgPSBhcGkuZ2V0RmlsZUJ5SWQocGFyYW1zW1wiZ2V0XCJdW1wicHJvZ3JhbVwiXSk7XG4gICAgICBwcm9ncmFtTG9hZC50aGVuKGZ1bmN0aW9uKHApIHsgc2hvd1NoYXJlQ29udGFpbmVyKHApOyB9KTtcbiAgICB9XG4gICAgaWYocGFyYW1zW1wiZ2V0XCJdICYmIHBhcmFtc1tcImdldFwiXVtcInNoYXJlXCJdKSB7XG4gICAgICBsb2dnZXIubG9nKCdzaGFyZWQtcHJvZ3JhbS1sb2FkJyxcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBwYXJhbXNbXCJnZXRcIl1bXCJzaGFyZVwiXVxuICAgICAgICB9KTtcbiAgICAgIHByb2dyYW1Mb2FkID0gYXBpLmdldFNoYXJlZEZpbGVCeUlkKHBhcmFtc1tcImdldFwiXVtcInNoYXJlXCJdKTtcbiAgICAgIHByb2dyYW1Mb2FkLnRoZW4oZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICAvLyBOT1RFKGpvZSk6IElmIHRoZSBjdXJyZW50IHVzZXIgZG9lc24ndCBvd24gb3IgaGF2ZSBhY2Nlc3MgdG8gdGhpcyBmaWxlXG4gICAgICAgIC8vIChvciBpc24ndCBsb2dnZWQgaW4pIHRoaXMgd2lsbCBzaW1wbHkgZmFpbCB3aXRoIGEgNDAxLCBzbyB3ZSBkb24ndCBkb1xuICAgICAgICAvLyBhbnkgZnVydGhlciBwZXJtaXNzaW9uIGNoZWNraW5nIGJlZm9yZSBzaG93aW5nIHRoZSBsaW5rLlxuICAgICAgICBmaWxlLmdldE9yaWdpbmFsKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVzcG9uc2UgZm9yIG9yaWdpbmFsOiBcIiwgcmVzcG9uc2UpO1xuICAgICAgICAgIHZhciBvcmlnaW5hbCA9ICQoXCIjb3Blbi1vcmlnaW5hbFwiKS5zaG93KCkub2ZmKFwiY2xpY2tcIik7XG4gICAgICAgICAgdmFyIGlkID0gcmVzcG9uc2UucmVzdWx0LnZhbHVlO1xuICAgICAgICAgIG9yaWdpbmFsLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgb3JpZ2luYWwuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3aW5kb3cub3Blbih3aW5kb3cuQVBQX0JBU0VfVVJMICsgXCIvZWRpdG9yI3Byb2dyYW09XCIgKyBpZCwgXCJfYmxhbmtcIik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmKHByb2dyYW1Mb2FkKSB7XG4gICAgICBwcm9ncmFtTG9hZC5mYWlsKGZ1bmN0aW9uKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIHdpbmRvdy5zdGlja0Vycm9yKFwiVGhlIHByb2dyYW0gZmFpbGVkIHRvIGxvYWQuXCIpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvZ3JhbUxvYWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2V0VGl0bGUocHJvZ05hbWUpIHtcbiAgICBkb2N1bWVudC50aXRsZSA9IHByb2dOYW1lICsgXCIgLSBjb2RlLnB5cmV0Lm9yZ1wiO1xuICB9XG4gIENQTy5zZXRUaXRsZSA9IHNldFRpdGxlO1xuXG4gIHZhciBmaWxlbmFtZSA9IGZhbHNlO1xuXG4gICQoXCIjZG93bmxvYWQgYVwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICB2YXIgZG93bmxvYWRFbHQgPSAkKFwiI2Rvd25sb2FkIGFcIik7XG4gICAgdmFyIGNvbnRlbnRzID0gQ1BPLmVkaXRvci5jbS5nZXRWYWx1ZSgpO1xuICAgIHZhciBkb3dubG9hZEJsb2IgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbY29udGVudHNdLCB7dHlwZTogJ3RleHQvcGxhaW4nfSkpO1xuICAgIGlmKCFmaWxlbmFtZSkgeyBmaWxlbmFtZSA9ICd1bnRpdGxlZF9wcm9ncmFtLmFycic7IH1cbiAgICBpZihmaWxlbmFtZS5pbmRleE9mKFwiLmFyclwiKSAhPT0gKGZpbGVuYW1lLmxlbmd0aCAtIDQpKSB7XG4gICAgICBmaWxlbmFtZSArPSBcIi5hcnJcIjtcbiAgICB9XG4gICAgZG93bmxvYWRFbHQuYXR0cih7XG4gICAgICBkb3dubG9hZDogZmlsZW5hbWUsXG4gICAgICBocmVmOiBkb3dubG9hZEJsb2JcbiAgICB9KTtcbiAgICAkKFwiI2Rvd25sb2FkXCIpLmFwcGVuZChkb3dubG9hZEVsdCk7XG4gIH0pO1xuXG4gIHZhciBUUlVOQ0FURV9MRU5HVEggPSAyMDtcblxuICBmdW5jdGlvbiB0cnVuY2F0ZU5hbWUobmFtZSkge1xuICAgIGlmKG5hbWUubGVuZ3RoIDw9IFRSVU5DQVRFX0xFTkdUSCArIDEpIHsgcmV0dXJuIG5hbWU7IH1cbiAgICByZXR1cm4gbmFtZS5zbGljZSgwLCBUUlVOQ0FURV9MRU5HVEggLyAyKSArIFwi4oCmXCIgKyBuYW1lLnNsaWNlKG5hbWUubGVuZ3RoIC0gVFJVTkNBVEVfTEVOR1RIIC8gMiwgbmFtZS5sZW5ndGgpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlTmFtZShwKSB7XG4gICAgZmlsZW5hbWUgPSBwLmdldE5hbWUoKTtcbiAgICAkKFwiI2ZpbGVuYW1lXCIpLnRleHQoXCIgKFwiICsgdHJ1bmNhdGVOYW1lKGZpbGVuYW1lKSArIFwiKVwiKTtcbiAgICBzZXRUaXRsZShmaWxlbmFtZSk7XG4gICAgc2hvd1NoYXJlQ29udGFpbmVyKHApO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9hZFByb2dyYW0ocCkge1xuICAgIHByb2dyYW1Ub1NhdmUgPSBwO1xuICAgIHJldHVybiBwLnRoZW4oZnVuY3Rpb24ocHJvZykge1xuICAgICAgaWYocHJvZyAhPT0gbnVsbCkge1xuICAgICAgICB1cGRhdGVOYW1lKHByb2cpO1xuICAgICAgICBpZihwcm9nLnNoYXJlZCkge1xuICAgICAgICAgIHdpbmRvdy5zdGlja01lc3NhZ2UoXCJZb3UgYXJlIHZpZXdpbmcgYSBzaGFyZWQgcHJvZ3JhbS4gQW55IGNoYW5nZXMgeW91IG1ha2Ugd2lsbCBub3QgYmUgc2F2ZWQuIFlvdSBjYW4gdXNlIEZpbGUgLT4gU2F2ZSBhIGNvcHkgdG8gc2F2ZSB5b3VyIG93biB2ZXJzaW9uIHdpdGggYW55IGVkaXRzIHlvdSBtYWtlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvZy5nZXRDb250ZW50cygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2F5KG1zZywgZm9yZ2V0KSB7XG4gICAgaWYgKG1zZyA9PT0gXCJcIikgcmV0dXJuO1xuICAgIHZhciBhbm5vdW5jZW1lbnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhbm5vdW5jZW1lbnRsaXN0XCIpO1xuICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJMSVwiKTtcbiAgICBsaS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtc2cpKTtcbiAgICBhbm5vdW5jZW1lbnRzLmluc2VydEJlZm9yZShsaSwgYW5ub3VuY2VtZW50cy5maXJzdENoaWxkKTtcbiAgICBpZiAoZm9yZ2V0KSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBhbm5vdW5jZW1lbnRzLnJlbW92ZUNoaWxkKGxpKTtcbiAgICAgIH0sIDEwMDApO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNheUFuZEZvcmdldChtc2cpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdkb2luZyBzYXlBbmRGb3JnZXQnLCBtc2cpO1xuICAgIHNheShtc2csIHRydWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY3ljbGVBZHZhbmNlKGN1cnJJbmRleCwgbWF4SW5kZXgsIHJldmVyc2VQKSB7XG4gICAgdmFyIG5leHRJbmRleCA9IGN1cnJJbmRleCArIChyZXZlcnNlUD8gLTEgOiArMSk7XG4gICAgbmV4dEluZGV4ID0gKChuZXh0SW5kZXggJSBtYXhJbmRleCkgKyBtYXhJbmRleCkgJSBtYXhJbmRleDtcbiAgICByZXR1cm4gbmV4dEluZGV4O1xuICB9XG5cbiAgZnVuY3Rpb24gcG9wdWxhdGVGb2N1c0Nhcm91c2VsKGVkaXRvcikge1xuICAgIGlmICghZWRpdG9yLmZvY3VzQ2Fyb3VzZWwpIHtcbiAgICAgIGVkaXRvci5mb2N1c0Nhcm91c2VsID0gW107XG4gICAgfVxuICAgIHZhciBmYyA9IGVkaXRvci5mb2N1c0Nhcm91c2VsO1xuICAgIHZhciBkb2NtYWluID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpO1xuICAgIGlmICghZmNbMF0pIHtcbiAgICAgIHZhciB0b29sYmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1Rvb2xiYXInKTtcbiAgICAgIGZjWzBdID0gdG9vbGJhcjtcbiAgICAgIC8vZmNbMF0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImhlYWRlcm9uZWxlZ2VuZFwiKTtcbiAgICAgIC8vZ2V0VG9wVGllck1lbnVpdGVtcygpO1xuICAgICAgLy9mY1swXSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib25uaWVtZW51YnV0dG9uJyk7XG4gICAgfVxuICAgIGlmICghZmNbMV0pIHtcbiAgICAgIHZhciBkb2NyZXBsTWFpbiA9IGRvY21haW4uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInJlcGxNYWluXCIpO1xuICAgICAgdmFyIGRvY3JlcGxNYWluMDtcbiAgICAgIGlmIChkb2NyZXBsTWFpbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgZG9jcmVwbE1haW4wID0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmIChkb2NyZXBsTWFpbi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgZG9jcmVwbE1haW4wID0gZG9jcmVwbE1haW5bMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRvY3JlcGxNYWluLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGRvY3JlcGxNYWluW2ldLmlubmVyVGV4dCAhPT0gXCJcIikge1xuICAgICAgICAgICAgZG9jcmVwbE1haW4wID0gZG9jcmVwbE1haW5baV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmY1sxXSA9IGRvY3JlcGxNYWluMDtcbiAgICB9XG4gICAgaWYgKCFmY1syXSkge1xuICAgICAgdmFyIGRvY3JlcGwgPSBkb2NtYWluLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJyZXBsXCIpO1xuICAgICAgdmFyIGRvY3JlcGxjb2RlID0gZG9jcmVwbFswXS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJvbXB0LWNvbnRhaW5lclwiKVswXS5cbiAgICAgICAgZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIkNvZGVNaXJyb3JcIilbMF07XG4gICAgICBmY1syXSA9IGRvY3JlcGxjb2RlO1xuICAgIH1cbiAgICBpZiAoIWZjWzNdKSB7XG4gICAgICBmY1szXSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYW5ub3VuY2VtZW50c1wiKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjeWNsZUZvY3VzKHJldmVyc2VQKSB7XG4gICAgLy9jb25zb2xlLmxvZygnZG9pbmcgY3ljbGVGb2N1cycsIHJldmVyc2VQKTtcbiAgICB2YXIgZWRpdG9yID0gdGhpcy5lZGl0b3I7XG4gICAgcG9wdWxhdGVGb2N1c0Nhcm91c2VsKGVkaXRvcik7XG4gICAgdmFyIGZDYXJvdXNlbCA9IGVkaXRvci5mb2N1c0Nhcm91c2VsO1xuICAgIHZhciBtYXhJbmRleCA9IGZDYXJvdXNlbC5sZW5ndGg7XG4gICAgdmFyIGN1cnJlbnRGb2N1c2VkRWx0ID0gZkNhcm91c2VsLmZpbmQoZnVuY3Rpb24obm9kZSkge1xuICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBub2RlLmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHZhciBjdXJyZW50Rm9jdXNJbmRleCA9IGZDYXJvdXNlbC5pbmRleE9mKGN1cnJlbnRGb2N1c2VkRWx0KTtcbiAgICB2YXIgbmV4dEZvY3VzSW5kZXggPSBjdXJyZW50Rm9jdXNJbmRleDtcbiAgICB2YXIgZm9jdXNFbHQ7XG4gICAgZG8ge1xuICAgICAgbmV4dEZvY3VzSW5kZXggPSBjeWNsZUFkdmFuY2UobmV4dEZvY3VzSW5kZXgsIG1heEluZGV4LCByZXZlcnNlUCk7XG4gICAgICBmb2N1c0VsdCA9IGZDYXJvdXNlbFtuZXh0Rm9jdXNJbmRleF07XG4gICAgICAvL2NvbnNvbGUubG9nKCd0cnlpbmcgZm9jdXNFbHQnLCBmb2N1c0VsdCk7XG4gICAgfSB3aGlsZSAoIWZvY3VzRWx0KTtcblxuICAgIHZhciBmb2N1c0VsdDA7XG4gICAgaWYgKGZvY3VzRWx0LmNsYXNzTGlzdC5jb250YWlucygndG9vbGJhcnJlZ2lvbicpKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKCdzZXR0bGluZyBvbiB0b29sYmFyIHJlZ2lvbicpXG4gICAgICBnZXRUb3BUaWVyTWVudWl0ZW1zKCk7XG4gICAgICBmb2N1c0VsdDAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9ubmllbWVudWJ1dHRvbicpO1xuICAgIH0gZWxzZSBpZiAoZm9jdXNFbHQuY2xhc3NMaXN0LmNvbnRhaW5zKFwicmVwbE1haW5cIikgfHxcbiAgICAgIGZvY3VzRWx0LmNsYXNzTGlzdC5jb250YWlucyhcIkNvZGVNaXJyb3JcIikpIHtcbiAgICAgIC8vY29uc29sZS5sb2coJ3NldHRsaW5nIG9uIGRlZm4gd2luZG93JylcbiAgICAgIHZhciB0ZXh0YXJlYXMgPSBmb2N1c0VsdC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRleHRhcmVhXCIpO1xuICAgICAgLy9jb25zb2xlLmxvZygndHh0YXJlYXM9JywgdGV4dGFyZWFzKVxuICAgICAgLy9jb25zb2xlLmxvZygndHh0YXJlYSBsZW49JywgdGV4dGFyZWFzLmxlbmd0aClcbiAgICAgIGlmICh0ZXh0YXJlYXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ0knKVxuICAgICAgICBmb2N1c0VsdDAgPSBmb2N1c0VsdDtcbiAgICAgIH0gZWxzZSBpZiAodGV4dGFyZWFzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdzZXR0bGluZyBvbiBpbnRlciB3aW5kb3cnKVxuICAgICAgICBmb2N1c0VsdDAgPSB0ZXh0YXJlYXNbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdzZXR0bGluZyBvbiBkZWZuIHdpbmRvdycpXG4gICAgICAgIC8qXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGV4dGFyZWFzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHRleHRhcmVhc1tpXS5nZXRBdHRyaWJ1dGUoJ3RhYkluZGV4JykpIHtcbiAgICAgICAgICAgIGZvY3VzRWx0MCA9IHRleHRhcmVhc1tpXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgKi9cbiAgICAgICAgZm9jdXNFbHQwID0gdGV4dGFyZWFzW3RleHRhcmVhcy5sZW5ndGgtMV07XG4gICAgICAgIGZvY3VzRWx0MC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYkluZGV4Jyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vY29uc29sZS5sb2coJ3NldHRsaW5nIG9uIGFubm91bmNlbWVudCByZWdpb24nLCBmb2N1c0VsdClcbiAgICAgIGZvY3VzRWx0MCA9IGZvY3VzRWx0O1xuICAgIH1cblxuICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgIGZvY3VzRWx0MC5jbGljaygpO1xuICAgIGZvY3VzRWx0MC5mb2N1cygpO1xuICAgIC8vY29uc29sZS5sb2coJyhjZilkb2NhY3RlbHQ9JywgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XG4gIH1cblxuICB2YXIgcHJvZ3JhbUxvYWRlZCA9IGxvYWRQcm9ncmFtKGluaXRpYWxQcm9ncmFtKTtcblxuICB2YXIgcHJvZ3JhbVRvU2F2ZSA9IGluaXRpYWxQcm9ncmFtO1xuXG4gIGZ1bmN0aW9uIHNob3dTaGFyZUNvbnRhaW5lcihwKSB7XG4gICAgLy9jb25zb2xlLmxvZygnY2FsbGVkIHNob3dTaGFyZUNvbnRhaW5lcicpO1xuICAgIGlmKCFwLnNoYXJlZCkge1xuICAgICAgJChcIiNzaGFyZUNvbnRhaW5lclwiKS5lbXB0eSgpO1xuICAgICAgJCgnI3B1Ymxpc2hsaScpLnNob3coKTtcbiAgICAgICQoXCIjc2hhcmVDb250YWluZXJcIikuYXBwZW5kKHNoYXJlQVBJLm1ha2VTaGFyZUxpbmsocCkpO1xuICAgICAgZ2V0VG9wVGllck1lbnVpdGVtcygpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5hbWVPclVudGl0bGVkKCkge1xuICAgIHJldHVybiBmaWxlbmFtZSB8fCBcIlVudGl0bGVkXCI7XG4gIH1cbiAgZnVuY3Rpb24gYXV0b1NhdmUoKSB7XG4gICAgcHJvZ3JhbVRvU2F2ZS50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgIGlmKHAgIT09IG51bGwgJiYgIXAuc2hhcmVkKSB7IHNhdmUoKTsgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZW5hYmxlRmlsZU9wdGlvbnMoKSB7XG4gICAgJChcIiNmaWxlbWVudUNvbnRlbnRzICpcIikucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lbnVJdGVtRGlzYWJsZWQoaWQpIHtcbiAgICByZXR1cm4gJChcIiNcIiArIGlkKS5oYXNDbGFzcyhcImRpc2FibGVkXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gbmV3RXZlbnQoZSkge1xuICAgIHdpbmRvdy5vcGVuKHdpbmRvdy5BUFBfQkFTRV9VUkwgKyBcIi9lZGl0b3JcIik7XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlRXZlbnQoZSkge1xuICAgIGlmKG1lbnVJdGVtRGlzYWJsZWQoXCJzYXZlXCIpKSB7IHJldHVybjsgfVxuICAgIHJldHVybiBzYXZlKCk7XG4gIH1cblxuICAvKlxuICAgIHNhdmUgOiBzdHJpbmcgKG9wdGlvbmFsKSAtPiB1bmRlZlxuXG4gICAgSWYgYSBzdHJpbmcgYXJndW1lbnQgaXMgcHJvdmlkZWQsIGNyZWF0ZSBhIG5ldyBmaWxlIHdpdGggdGhhdCBuYW1lIGFuZCBzYXZlXG4gICAgdGhlIGVkaXRvciBjb250ZW50cyBpbiB0aGF0IGZpbGUuXG5cbiAgICBJZiBubyBmaWxlbmFtZSBpcyBwcm92aWRlZCwgc2F2ZSB0aGUgZXhpc3RpbmcgZmlsZSByZWZlcmVuY2VkIGJ5IHRoZSBlZGl0b3JcbiAgICB3aXRoIHRoZSBjdXJyZW50IGVkaXRvciBjb250ZW50cy4gIElmIG5vIGZpbGVuYW1lIGhhcyBiZWVuIHNldCB5ZXQsIGp1c3RcbiAgICBzZXQgdGhlIG5hbWUgdG8gXCJVbnRpdGxlZFwiLlxuXG4gICovXG4gIGZ1bmN0aW9uIHNhdmUobmV3RmlsZW5hbWUpIHtcbiAgICB2YXIgdXNlTmFtZSwgY3JlYXRlO1xuICAgIGlmKG5ld0ZpbGVuYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHVzZU5hbWUgPSBuZXdGaWxlbmFtZTtcbiAgICAgIGNyZWF0ZSA9IHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYoZmlsZW5hbWUgPT09IGZhbHNlKSB7XG4gICAgICBmaWxlbmFtZSA9IFwiVW50aXRsZWRcIjtcbiAgICAgIGNyZWF0ZSA9IHRydWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdXNlTmFtZSA9IGZpbGVuYW1lOyAvLyBBIGNsb3NlZC1vdmVyIHZhcmlhYmxlXG4gICAgICBjcmVhdGUgPSBmYWxzZTtcbiAgICB9XG4gICAgd2luZG93LnN0aWNrTWVzc2FnZShcIlNhdmluZy4uLlwiKTtcbiAgICB2YXIgc2F2ZWRQcm9ncmFtID0gcHJvZ3JhbVRvU2F2ZS50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgIGlmKHAgIT09IG51bGwgJiYgcC5zaGFyZWQgJiYgIWNyZWF0ZSkge1xuICAgICAgICByZXR1cm4gcDsgLy8gRG9uJ3QgdHJ5IHRvIHNhdmUgc2hhcmVkIGZpbGVzXG4gICAgICB9XG4gICAgICBpZihjcmVhdGUpIHtcbiAgICAgICAgcHJvZ3JhbVRvU2F2ZSA9IHN0b3JhZ2VBUElcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihhcGkpIHsgcmV0dXJuIGFwaS5jcmVhdGVGaWxlKHVzZU5hbWUpOyB9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgIC8vIHNob3dTaGFyZUNvbnRhaW5lcihwKTsgVE9ETyhqb2UpOiBmaWd1cmUgb3V0IHdoZXJlIHRvIHB1dCB0aGlzXG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCBcIiNwcm9ncmFtPVwiICsgcC5nZXRVbmlxdWVJZCgpKTtcbiAgICAgICAgICAgIHVwZGF0ZU5hbWUocCk7IC8vIHNldHMgZmlsZW5hbWVcbiAgICAgICAgICAgIGVuYWJsZUZpbGVPcHRpb25zKCk7XG4gICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb2dyYW1Ub1NhdmUudGhlbihmdW5jdGlvbihwKSB7XG4gICAgICAgICAgcmV0dXJuIHNhdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHByb2dyYW1Ub1NhdmUudGhlbihmdW5jdGlvbihwKSB7XG4gICAgICAgICAgaWYocCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHAuc2F2ZShDUE8uZWRpdG9yLmNtLmdldFZhbHVlKCksIGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocCkge1xuICAgICAgICAgIGlmKHAgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHdpbmRvdy5mbGFzaE1lc3NhZ2UoXCJQcm9ncmFtIHNhdmVkIGFzIFwiICsgcC5nZXROYW1lKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgc2F2ZWRQcm9ncmFtLmZhaWwoZnVuY3Rpb24oZXJyKSB7XG4gICAgICB3aW5kb3cuc3RpY2tFcnJvcihcIlVuYWJsZSB0byBzYXZlXCIsIFwiWW91ciBpbnRlcm5ldCBjb25uZWN0aW9uIG1heSBiZSBkb3duLCBvciBzb21ldGhpbmcgZWxzZSBtaWdodCBiZSB3cm9uZyB3aXRoIHRoaXMgc2l0ZSBvciBzYXZpbmcgdG8gR29vZ2xlLiAgWW91IHNob3VsZCBiYWNrIHVwIGFueSBjaGFuZ2VzIHRvIHRoaXMgcHJvZ3JhbSBzb21ld2hlcmUgZWxzZS4gIFlvdSBjYW4gdHJ5IHNhdmluZyBhZ2FpbiB0byBzZWUgaWYgdGhlIHByb2JsZW0gd2FzIHRlbXBvcmFyeSwgYXMgd2VsbC5cIik7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNhdmVkUHJvZ3JhbTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVBcygpIHtcbiAgICBpZihtZW51SXRlbURpc2FibGVkKFwic2F2ZWFzXCIpKSB7IHJldHVybjsgfVxuICAgIHByb2dyYW1Ub1NhdmUudGhlbihmdW5jdGlvbihwKSB7XG4gICAgICB2YXIgbmFtZSA9IHAgPT09IG51bGwgPyBcIlVudGl0bGVkXCIgOiBwLmdldE5hbWUoKTtcbiAgICAgIHZhciBzYXZlQXNQcm9tcHQgPSBuZXcgbW9kYWxQcm9tcHQoe1xuICAgICAgICB0aXRsZTogXCJTYXZlIGEgY29weVwiLFxuICAgICAgICBzdHlsZTogXCJ0ZXh0XCIsXG4gICAgICAgIG9wdGlvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXNzYWdlOiBcIlRoZSBuYW1lIGZvciB0aGUgY29weTpcIixcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogbmFtZVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gc2F2ZUFzUHJvbXB0LnNob3coKS50aGVuKGZ1bmN0aW9uKG5ld05hbWUpIHtcbiAgICAgICAgaWYobmV3TmFtZSA9PT0gbnVsbCkgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgICB3aW5kb3cuc3RpY2tNZXNzYWdlKFwiU2F2aW5nLi4uXCIpO1xuICAgICAgICByZXR1cm4gc2F2ZShuZXdOYW1lKTtcbiAgICAgIH0pLlxuICAgICAgZmFpbChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byByZW5hbWU6IFwiLCBlcnIpO1xuICAgICAgICB3aW5kb3cuZmxhc2hFcnJvcihcIkZhaWxlZCB0byByZW5hbWUgZmlsZVwiKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuYW1lKCkge1xuICAgIHByb2dyYW1Ub1NhdmUudGhlbihmdW5jdGlvbihwKSB7XG4gICAgICB2YXIgcmVuYW1lUHJvbXB0ID0gbmV3IG1vZGFsUHJvbXB0KHtcbiAgICAgICAgdGl0bGU6IFwiUmVuYW1lIHRoaXMgZmlsZVwiLFxuICAgICAgICBzdHlsZTogXCJ0ZXh0XCIsXG4gICAgICAgIG9wdGlvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXNzYWdlOiBcIlRoZSBuZXcgbmFtZSBmb3IgdGhlIGZpbGU6XCIsXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHAuZ2V0TmFtZSgpXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgICAgIC8vIG51bGwgcmV0dXJuIHZhbHVlcyBhcmUgZm9yIHRoZSBcImNhbmNlbFwiIHBhdGhcbiAgICAgIHJldHVybiByZW5hbWVQcm9tcHQuc2hvdygpLnRoZW4oZnVuY3Rpb24obmV3TmFtZSkge1xuICAgICAgICBpZihuZXdOYW1lID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LnN0aWNrTWVzc2FnZShcIlJlbmFtaW5nLi4uXCIpO1xuICAgICAgICBwcm9ncmFtVG9TYXZlID0gcC5yZW5hbWUobmV3TmFtZSk7XG4gICAgICAgIHJldHVybiBwcm9ncmFtVG9TYXZlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgaWYocCA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZU5hbWUocCk7XG4gICAgICAgIHdpbmRvdy5mbGFzaE1lc3NhZ2UoXCJQcm9ncmFtIHNhdmVkIGFzIFwiICsgcC5nZXROYW1lKCkpO1xuICAgICAgfSlcbiAgICAgIC5mYWlsKGZ1bmN0aW9uKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHJlbmFtZTogXCIsIGVycik7XG4gICAgICAgIHdpbmRvdy5mbGFzaEVycm9yKFwiRmFpbGVkIHRvIHJlbmFtZSBmaWxlXCIpO1xuICAgICAgfSk7XG4gICAgfSlcbiAgICAuZmFpbChmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmFibGUgdG8gcmVuYW1lOiBcIiwgZXJyKTtcbiAgICB9KTtcbiAgfVxuXG4gICQoXCIjcnVuQnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIENQTy5hdXRvU2F2ZSgpO1xuICB9KTtcblxuICAkKFwiI25ld1wiKS5jbGljayhuZXdFdmVudCk7XG4gICQoXCIjc2F2ZVwiKS5jbGljayhzYXZlRXZlbnQpO1xuICAkKFwiI3JlbmFtZVwiKS5jbGljayhyZW5hbWUpO1xuICAkKFwiI3NhdmVhc1wiKS5jbGljayhzYXZlQXMpO1xuXG4gIHZhciBmb2N1c2FibGVFbHRzID0gJChkb2N1bWVudCkuZmluZCgnI2hlYWRlciAuZm9jdXNhYmxlJyk7XG4gIC8vY29uc29sZS5sb2coJ2ZvY3VzYWJsZUVsdHM9JywgZm9jdXNhYmxlRWx0cylcbiAgdmFyIHRoZVRvb2xiYXIgPSAkKGRvY3VtZW50KS5maW5kKCcjVG9vbGJhcicpO1xuXG4gIGZ1bmN0aW9uIGdldFRvcFRpZXJNZW51aXRlbXMoKSB7XG4gICAgLy9jb25zb2xlLmxvZygnZG9pbmcgZ2V0VG9wVGllck1lbnVpdGVtcycpXG4gICAgdmFyIHRvcFRpZXJNZW51aXRlbXMgPSAkKGRvY3VtZW50KS5maW5kKCcjaGVhZGVyIHVsIGxpLnRvcFRpZXInKS50b0FycmF5KCk7XG4gICAgdG9wVGllck1lbnVpdGVtcyA9IHRvcFRpZXJNZW51aXRlbXMuXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIoZWx0ID0+ICEoZWx0LnN0eWxlLmRpc3BsYXkgPT09ICdub25lJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsdC5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgPT09ICdkaXNhYmxlZCcpKTtcbiAgICB2YXIgbnVtVG9wVGllck1lbnVpdGVtcyA9IHRvcFRpZXJNZW51aXRlbXMubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtVG9wVGllck1lbnVpdGVtczsgaSsrKSB7XG4gICAgICB2YXIgaXRoVG9wVGllck1lbnVpdGVtID0gdG9wVGllck1lbnVpdGVtc1tpXTtcbiAgICAgIHZhciBpQ2hpbGQgPSAkKGl0aFRvcFRpZXJNZW51aXRlbSkuY2hpbGRyZW4oKS5maXJzdCgpO1xuICAgICAgLy9jb25zb2xlLmxvZygnaUNoaWxkPScsIGlDaGlsZCk7XG4gICAgICBpQ2hpbGQuZmluZCgnLmZvY3VzYWJsZScpLlxuICAgICAgICBhdHRyKCdhcmlhLXNldHNpemUnLCBudW1Ub3BUaWVyTWVudWl0ZW1zLnRvU3RyaW5nKCkpLlxuICAgICAgICBhdHRyKCdhcmlhLXBvc2luc2V0JywgKGkrMSkudG9TdHJpbmcoKSk7XG4gICAgfVxuICAgIHJldHVybiB0b3BUaWVyTWVudWl0ZW1zO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlRWRpdG9ySGVpZ2h0KCkge1xuICAgIHZhciB0b29sYmFySGVpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvcFRpZXJVbCcpLnNjcm9sbEhlaWdodDtcbiAgICAvLyBnZXRzIGJ1bXBlZCB0byA2NyBvbiBpbml0aWFsIHJlc2l6ZSBwZXJ0dXJiYXRpb24sIGJ1dCBhY3R1YWwgdmFsdWUgaXMgaW5kZWVkIDQwXG4gICAgaWYgKHRvb2xiYXJIZWlnaHQgPCA4MCkgdG9vbGJhckhlaWdodCA9IDQwO1xuICAgIHRvb2xiYXJIZWlnaHQgKz0gJ3B4JztcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnUkVQTCcpLnN0eWxlLnBhZGRpbmdUb3AgPSB0b29sYmFySGVpZ2h0O1xuICAgIHZhciBkb2NNYWluID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKTtcbiAgICB2YXIgZG9jUmVwbE1haW4gPSBkb2NNYWluLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3JlcGxNYWluJyk7XG4gICAgaWYgKGRvY1JlcGxNYWluLmxlbmd0aCAhPT0gMCkge1xuICAgICAgZG9jUmVwbE1haW5bMF0uc3R5bGUucGFkZGluZ1RvcCA9IHRvb2xiYXJIZWlnaHQ7XG4gICAgfVxuICB9XG5cbiAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCB1cGRhdGVFZGl0b3JIZWlnaHQpO1xuXG4gIGZ1bmN0aW9uIGluc2VydEFyaWFQb3Moc3VibWVudSkge1xuICAgIC8vY29uc29sZS5sb2coJ2RvaW5nIGluc2VydEFyaWFQb3MnLCBzdWJtZW51KVxuICAgIHZhciBhcnIgPSBzdWJtZW51LnRvQXJyYXkoKTtcbiAgICAvL2NvbnNvbGUubG9nKCdhcnI9JywgYXJyKTtcbiAgICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgZWx0ID0gYXJyW2ldO1xuICAgICAgLy9jb25zb2xlLmxvZygnZWx0JywgaSwgJz0nLCBlbHQpO1xuICAgICAgZWx0LnNldEF0dHJpYnV0ZSgnYXJpYS1zZXRzaXplJywgbGVuLnRvU3RyaW5nKCkpO1xuICAgICAgZWx0LnNldEF0dHJpYnV0ZSgnYXJpYS1wb3NpbnNldCcsIChpKzEpLnRvU3RyaW5nKCkpO1xuICAgIH1cbiAgfVxuXG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgaGlkZUFsbFRvcE1lbnVpdGVtcygpO1xuICB9KTtcblxuICB0aGVUb29sYmFyLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSk7XG5cbiAgdGhlVG9vbGJhci5rZXlkb3duKGZ1bmN0aW9uIChlKSB7XG4gICAgLy9jb25zb2xlLmxvZygndG9vbGJhciBrZXlkb3duJywgZSk7XG4gICAgLy9tb3N0IGFueSBrZXkgYXQgYWxsXG4gICAgdmFyIGtjID0gZS5rZXlDb2RlO1xuICAgIGlmIChrYyA9PT0gMjcpIHtcbiAgICAgIC8vIGVzY2FwZVxuICAgICAgaGlkZUFsbFRvcE1lbnVpdGVtcygpO1xuICAgICAgLy9jb25zb2xlLmxvZygnY2FsbGluZyBjeWNsZUZvY3VzIGZyb20gdG9vbGJhcicpXG4gICAgICBDUE8uY3ljbGVGb2N1cygpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9IGVsc2UgaWYgKGtjID09PSA5IHx8IGtjID09PSAzNyB8fCBrYyA9PT0gMzggfHwga2MgPT09IDM5IHx8IGtjID09PSA0MCkge1xuICAgICAgLy8gYW4gYXJyb3dcbiAgICAgIHZhciB0YXJnZXQgPSAkKHRoaXMpLmZpbmQoJ1t0YWJJbmRleD0tMV0nKTtcbiAgICAgIGdldFRvcFRpZXJNZW51aXRlbXMoKTtcbiAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpOyAvL25lZWRlZD9cbiAgICAgIHRhcmdldC5maXJzdCgpLmZvY3VzKCk7IC8vbmVlZGVkP1xuICAgICAgLy9jb25zb2xlLmxvZygnZG9jYWN0ZWx0PScsIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGlkZUFsbFRvcE1lbnVpdGVtcygpO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gY2xpY2tUb3BNZW51aXRlbShlKSB7XG4gICAgaGlkZUFsbFRvcE1lbnVpdGVtcygpO1xuICAgIHZhciB0aGlzRWx0ID0gJCh0aGlzKTtcbiAgICAvL2NvbnNvbGUubG9nKCdkb2luZyBjbGlja1RvcE1lbnVpdGVtIG9uJywgdGhpc0VsdCk7XG4gICAgdmFyIHRvcFRpZXJVbCA9IHRoaXNFbHQuY2xvc2VzdCgndWxbaWQ9dG9wVGllclVsXScpO1xuICAgIGlmICh0aGlzRWx0WzBdLmhhc0F0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpc0VsdFswXS5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgPT09ICdkaXNhYmxlZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy92YXIgaGlkZGVuUCA9ICh0aGlzRWx0WzBdLmdldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcpID09PSAnZmFsc2UnKTtcbiAgICAvL2hpZGRlblAgYWx3YXlzIGZhbHNlP1xuICAgIHZhciB0aGlzVG9wTWVudWl0ZW0gPSB0aGlzRWx0LmNsb3Nlc3QoJ2xpLnRvcFRpZXInKTtcbiAgICAvL2NvbnNvbGUubG9nKCd0aGlzVG9wTWVudWl0ZW09JywgdGhpc1RvcE1lbnVpdGVtKTtcbiAgICB2YXIgdDEgPSB0aGlzVG9wTWVudWl0ZW1bMF07XG4gICAgdmFyIHN1Ym1lbnVPcGVuID0gKHRoaXNFbHRbMF0uZ2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJykgPT09ICd0cnVlJyk7XG4gICAgaWYgKCFzdWJtZW51T3Blbikge1xuICAgICAgLy9jb25zb2xlLmxvZygnaGlkZGVucCB0cnVlIGJyYW5jaCcpO1xuICAgICAgaGlkZUFsbFRvcE1lbnVpdGVtcygpO1xuICAgICAgdGhpc1RvcE1lbnVpdGVtLmNoaWxkcmVuKCd1bC5zdWJtZW51JykuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKS5zaG93KCk7XG4gICAgICB0aGlzVG9wTWVudWl0ZW0uY2hpbGRyZW4oKS5maXJzdCgpLmZpbmQoJ1thcmlhLWV4cGFuZGVkXScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL2NvbnNvbGUubG9nKCdoaWRkZW5wIGZhbHNlIGJyYW5jaCcpO1xuICAgICAgdGhpc1RvcE1lbnVpdGVtLmNoaWxkcmVuKCd1bC5zdWJtZW51JykuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpLmhpZGUoKTtcbiAgICAgIHRoaXNUb3BNZW51aXRlbS5jaGlsZHJlbigpLmZpcnN0KCkuZmluZCgnW2FyaWEtZXhwYW5kZWRdJykuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuICAgIH1cbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG5cbiAgdmFyIGV4cGFuZGFibGVFbHRzID0gJChkb2N1bWVudCkuZmluZCgnI2hlYWRlciBbYXJpYS1leHBhbmRlZF0nKTtcbiAgZXhwYW5kYWJsZUVsdHMuY2xpY2soY2xpY2tUb3BNZW51aXRlbSk7XG5cbiAgZnVuY3Rpb24gaGlkZUFsbFRvcE1lbnVpdGVtcygpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdkb2luZyBoaWRlQWxsVG9wTWVudWl0ZW1zJyk7XG4gICAgdmFyIHRvcFRpZXJVbCA9ICQoZG9jdW1lbnQpLmZpbmQoJyNoZWFkZXIgdWxbaWQ9dG9wVGllclVsXScpO1xuICAgIHRvcFRpZXJVbC5maW5kKCdbYXJpYS1leHBhbmRlZF0nKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG4gICAgdG9wVGllclVsLmZpbmQoJ3VsLnN1Ym1lbnUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJykuaGlkZSgpO1xuICB9XG5cbiAgdmFyIG5vbmV4cGFuZGFibGVFbHRzID0gJChkb2N1bWVudCkuZmluZCgnI2hlYWRlciAudG9wVGllciA+IGRpdiA+IGJ1dHRvbjpub3QoW2FyaWEtZXhwYW5kZWRdKScpO1xuICBub25leHBhbmRhYmxlRWx0cy5jbGljayhoaWRlQWxsVG9wTWVudWl0ZW1zKTtcblxuICBmdW5jdGlvbiBzd2l0Y2hUb3BNZW51aXRlbShkZXN0VG9wTWVudWl0ZW0sIGRlc3RFbHQpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdkb2luZyBzd2l0Y2hUb3BNZW51aXRlbScsIGRlc3RUb3BNZW51aXRlbSwgZGVzdEVsdCk7XG4gICAgLy9jb25zb2xlLmxvZygnZHRtaWw9JywgZGVzdFRvcE1lbnVpdGVtLmxlbmd0aCk7XG4gICAgaGlkZUFsbFRvcE1lbnVpdGVtcygpO1xuICAgIGlmIChkZXN0VG9wTWVudWl0ZW0gJiYgZGVzdFRvcE1lbnVpdGVtLmxlbmd0aCAhPT0gMCkge1xuICAgICAgdmFyIGVsdCA9IGRlc3RUb3BNZW51aXRlbVswXTtcbiAgICAgIHZhciBlbHRJZCA9IGVsdC5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgICBkZXN0VG9wTWVudWl0ZW0uY2hpbGRyZW4oJ3VsLnN1Ym1lbnUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpLnNob3coKTtcbiAgICAgIGRlc3RUb3BNZW51aXRlbS5jaGlsZHJlbigpLmZpcnN0KCkuZmluZCgnW2FyaWEtZXhwYW5kZWRdJykuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgfVxuICAgIGlmIChkZXN0RWx0KSB7XG4gICAgICAvL2Rlc3RFbHQuYXR0cigndGFiSW5kZXgnLCAnMCcpLmZvY3VzKCk7XG4gICAgICBkZXN0RWx0LmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIHNob3dpbmdIZWxwS2V5cyA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIHNob3dIZWxwS2V5cygpIHtcbiAgICBzaG93aW5nSGVscEtleXMgPSB0cnVlO1xuICAgICQoJyNoZWxwLWtleXMnKS5mYWRlSW4oMTAwKTtcbiAgICByZWNpdGVIZWxwKCk7XG4gIH1cblxuICBmb2N1c2FibGVFbHRzLmtleWRvd24oZnVuY3Rpb24gKGUpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdmb2N1c2FibGUgZWx0IGtleWRvd24nLCBlKTtcbiAgICB2YXIga2MgPSBlLmtleUNvZGU7XG4gICAgLy8kKHRoaXMpLmJsdXIoKTsgLy8gRGVsZXRlP1xuICAgIHZhciB3aXRoaW5TZWNvbmRUaWVyVWwgPSB0cnVlO1xuICAgIHZhciB0b3BUaWVyVWwgPSAkKHRoaXMpLmNsb3Nlc3QoJ3VsW2lkPXRvcFRpZXJVbF0nKTtcbiAgICB2YXIgc2Vjb25kVGllclVsID0gJCh0aGlzKS5jbG9zZXN0KCd1bC5zdWJtZW51Jyk7XG4gICAgaWYgKHNlY29uZFRpZXJVbC5sZW5ndGggPT09IDApIHtcbiAgICAgIHdpdGhpblNlY29uZFRpZXJVbCA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoa2MgPT09IDI3KSB7XG4gICAgICAvL2NvbnNvbGUubG9nKCdlc2NhcGUgcHJlc3NlZCBpJylcbiAgICAgICQoJyNoZWxwLWtleXMnKS5mYWRlT3V0KDUwMCk7XG4gICAgfVxuICAgIGlmIChrYyA9PT0gMjcgJiYgd2l0aGluU2Vjb25kVGllclVsKSB7IC8vIGVzY2FwZVxuICAgICAgdmFyIGRlc3RUb3BNZW51aXRlbSA9ICQodGhpcykuY2xvc2VzdCgnbGkudG9wVGllcicpO1xuICAgICAgdmFyIHBvc3NFbHRzID0gZGVzdFRvcE1lbnVpdGVtLmZpbmQoJy5mb2N1c2FibGU6bm90KFtkaXNhYmxlZF0pJykuZmlsdGVyKCc6dmlzaWJsZScpO1xuICAgICAgc3dpdGNoVG9wTWVudWl0ZW0oZGVzdFRvcE1lbnVpdGVtLCBwb3NzRWx0cy5maXJzdCgpKTtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSBlbHNlIGlmIChrYyA9PT0gMzkpIHsgLy8gcmlnaHRhcnJvd1xuICAgICAgLy9jb25zb2xlLmxvZygncmlnaHRhcnJvdyBwcmVzc2VkJyk7XG4gICAgICB2YXIgc3JjVG9wTWVudWl0ZW0gPSAkKHRoaXMpLmNsb3Nlc3QoJ2xpLnRvcFRpZXInKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ3NyY1RvcE1lbnVpdGVtPScsIHNyY1RvcE1lbnVpdGVtKTtcbiAgICAgIHNyY1RvcE1lbnVpdGVtLmNoaWxkcmVuKCkuZmlyc3QoKS5maW5kKCcuZm9jdXNhYmxlJykuYXR0cigndGFiSW5kZXgnLCAnLTEnKTtcbiAgICAgIHZhciB0b3BUaWVyTWVudWl0ZW1zID0gZ2V0VG9wVGllck1lbnVpdGVtcygpO1xuICAgICAgLy9jb25zb2xlLmxvZygndHRtaSogPScsIHRvcFRpZXJNZW51aXRlbXMpO1xuICAgICAgdmFyIHR0bWlOID0gdG9wVGllck1lbnVpdGVtcy5sZW5ndGg7XG4gICAgICB2YXIgaiA9IHRvcFRpZXJNZW51aXRlbXMuaW5kZXhPZihzcmNUb3BNZW51aXRlbVswXSk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdqIGluaXRpYWw9Jywgaik7XG4gICAgICBmb3IgKHZhciBpID0gKGogKyAxKSAlIHR0bWlOOyBpICE9PSBqOyBpID0gKGkgKyAxKSAlIHR0bWlOKSB7XG4gICAgICAgIHZhciBkZXN0VG9wTWVudWl0ZW0gPSAkKHRvcFRpZXJNZW51aXRlbXNbaV0pO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdkZXN0VG9wTWVudWl0ZW0oYSk9JywgZGVzdFRvcE1lbnVpdGVtKTtcbiAgICAgICAgdmFyIHBvc3NFbHRzID0gZGVzdFRvcE1lbnVpdGVtLmZpbmQoJy5mb2N1c2FibGU6bm90KFtkaXNhYmxlZF0pJykuZmlsdGVyKCc6dmlzaWJsZScpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdwb3NzRWx0cz0nLCBwb3NzRWx0cylcbiAgICAgICAgaWYgKHBvc3NFbHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdmaW5hbCBpPScsIGkpO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ2xhbmRpbmcgb24nLCBwb3NzRWx0cy5maXJzdCgpKTtcbiAgICAgICAgICBzd2l0Y2hUb3BNZW51aXRlbShkZXN0VG9wTWVudWl0ZW0sIHBvc3NFbHRzLmZpcnN0KCkpO1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGtjID09PSAzNykgeyAvLyBsZWZ0YXJyb3dcbiAgICAgIC8vY29uc29sZS5sb2coJ2xlZnRhcnJvdyBwcmVzc2VkJyk7XG4gICAgICB2YXIgc3JjVG9wTWVudWl0ZW0gPSAkKHRoaXMpLmNsb3Nlc3QoJ2xpLnRvcFRpZXInKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ3NyY1RvcE1lbnVpdGVtPScsIHNyY1RvcE1lbnVpdGVtKTtcbiAgICAgIHNyY1RvcE1lbnVpdGVtLmNoaWxkcmVuKCkuZmlyc3QoKS5maW5kKCcuZm9jdXNhYmxlJykuYXR0cigndGFiSW5kZXgnLCAnLTEnKTtcbiAgICAgIHZhciB0b3BUaWVyTWVudWl0ZW1zID0gZ2V0VG9wVGllck1lbnVpdGVtcygpO1xuICAgICAgLy9jb25zb2xlLmxvZygndHRtaSogPScsIHRvcFRpZXJNZW51aXRlbXMpO1xuICAgICAgdmFyIHR0bWlOID0gdG9wVGllck1lbnVpdGVtcy5sZW5ndGg7XG4gICAgICB2YXIgaiA9IHRvcFRpZXJNZW51aXRlbXMuaW5kZXhPZihzcmNUb3BNZW51aXRlbVswXSk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdqIGluaXRpYWw9Jywgaik7XG4gICAgICBmb3IgKHZhciBpID0gKGogKyB0dG1pTiAtIDEpICUgdHRtaU47IGkgIT09IGo7IGkgPSAoaSArIHR0bWlOIC0gMSkgJSB0dG1pTikge1xuICAgICAgICB2YXIgZGVzdFRvcE1lbnVpdGVtID0gJCh0b3BUaWVyTWVudWl0ZW1zW2ldKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnZGVzdFRvcE1lbnVpdGVtKGIpPScsIGRlc3RUb3BNZW51aXRlbSk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ2k9JywgaSlcbiAgICAgICAgdmFyIHBvc3NFbHRzID0gZGVzdFRvcE1lbnVpdGVtLmZpbmQoJy5mb2N1c2FibGU6bm90KFtkaXNhYmxlZF0pJykuZmlsdGVyKCc6dmlzaWJsZScpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdwb3NzRWx0cz0nLCBwb3NzRWx0cylcbiAgICAgICAgaWYgKHBvc3NFbHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdmaW5hbCBpPScsIGkpO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ2xhbmRpbmcgb24nLCBwb3NzRWx0cy5maXJzdCgpKTtcbiAgICAgICAgICBzd2l0Y2hUb3BNZW51aXRlbShkZXN0VG9wTWVudWl0ZW0sIHBvc3NFbHRzLmZpcnN0KCkpO1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGtjID09PSAzOCkgeyAvLyB1cGFycm93XG4gICAgICAvL2NvbnNvbGUubG9nKCd1cGFycm93IHByZXNzZWQnKTtcbiAgICAgIHZhciBzdWJtZW51O1xuICAgICAgaWYgKHdpdGhpblNlY29uZFRpZXJVbCkge1xuICAgICAgICB2YXIgbmVhclNpYnMgPSAkKHRoaXMpLmNsb3Nlc3QoJ2RpdicpLmZpbmQoJy5mb2N1c2FibGUnKS5maWx0ZXIoJzp2aXNpYmxlJyk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ25lYXJTaWJzPScsIG5lYXJTaWJzKTtcbiAgICAgICAgdmFyIG15SWQgPSAkKHRoaXMpWzBdLmdldEF0dHJpYnV0ZSgnaWQnKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnbXlJZD0nLCBteUlkKTtcbiAgICAgICAgc3VibWVudSA9ICQoW10pO1xuICAgICAgICB2YXIgdGhpc0VuY291bnRlcmVkID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSBuZWFyU2licy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGlmICh0aGlzRW5jb3VudGVyZWQpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2FkZGluZycsIG5lYXJTaWJzW2ldKTtcbiAgICAgICAgICAgIHN1Ym1lbnUgPSBzdWJtZW51LmFkZCgkKG5lYXJTaWJzW2ldKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChuZWFyU2lic1tpXS5nZXRBdHRyaWJ1dGUoJ2lkJykgPT09IG15SWQpIHtcbiAgICAgICAgICAgIHRoaXNFbmNvdW50ZXJlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coJ3N1Ym1lbnUgc28gZmFyPScsIHN1Ym1lbnUpO1xuICAgICAgICB2YXIgZmFyU2licyA9ICQodGhpcykuY2xvc2VzdCgnbGknKS5wcmV2QWxsKCkuZmluZCgnZGl2Om5vdCguZGlzYWJsZWQpJylcbiAgICAgICAgICAuZmluZCgnLmZvY3VzYWJsZScpLmZpbHRlcignOnZpc2libGUnKTtcbiAgICAgICAgc3VibWVudSA9IHN1Ym1lbnUuYWRkKGZhclNpYnMpO1xuICAgICAgICBpZiAoc3VibWVudS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBzdWJtZW51ID0gJCh0aGlzKS5jbG9zZXN0KCdsaScpLmNsb3Nlc3QoJ3VsJykuZmluZCgnZGl2Om5vdCguZGlzYWJsZWQpJylcbiAgICAgICAgICAuZmluZCgnLmZvY3VzYWJsZScpLmZpbHRlcignOnZpc2libGUnKS5sYXN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN1Ym1lbnUubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHN1Ym1lbnUubGFzdCgpLmZvY3VzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLypcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdubyBhY3Rpb25hYmxlIHN1Ym1lbnUgZm91bmQnKVxuICAgICAgICAgIHZhciB0b3BtZW51SXRlbSA9ICQodGhpcykuY2xvc2VzdCgndWwuc3VibWVudScpLmNsb3Nlc3QoJ2xpJylcbiAgICAgICAgICAuY2hpbGRyZW4oKS5maXJzdCgpLmZpbmQoJy5mb2N1c2FibGU6bm90KFtkaXNhYmxlZF0pJykuZmlsdGVyKCc6dmlzaWJsZScpO1xuICAgICAgICAgIGlmICh0b3BtZW51SXRlbS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0b3BtZW51SXRlbS5maXJzdCgpLmZvY3VzKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ25vIGFjdGlvbmFibGUgdG9wbWVudWl0ZW0gZm91bmQgZWl0aGVyJylcbiAgICAgICAgICB9XG4gICAgICAgICAgKi9cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9IGVsc2UgaWYgKGtjID09PSA0MCkgeyAvLyBkb3duYXJyb3dcbiAgICAgIC8vY29uc29sZS5sb2coJ2Rvd25hcnJvdyBwcmVzc2VkJyk7XG4gICAgICB2YXIgc3VibWVudURpdnM7XG4gICAgICB2YXIgc3VibWVudTtcbiAgICAgIGlmICghd2l0aGluU2Vjb25kVGllclVsKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJzFzdCB0aWVyJylcbiAgICAgICAgc3VibWVudURpdnMgPSAkKHRoaXMpLmNsb3Nlc3QoJ2xpJykuY2hpbGRyZW4oJ3VsJykuZmluZCgnZGl2Om5vdCguZGlzYWJsZWQpJyk7XG4gICAgICAgIHN1Ym1lbnUgPSBzdWJtZW51RGl2cy5maW5kKCcuZm9jdXNhYmxlJykuZmlsdGVyKCc6dmlzaWJsZScpO1xuICAgICAgICBpbnNlcnRBcmlhUG9zKHN1Ym1lbnUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnMm5kIHRpZXInKVxuICAgICAgICB2YXIgbmVhclNpYnMgPSAkKHRoaXMpLmNsb3Nlc3QoJ2RpdicpLmZpbmQoJy5mb2N1c2FibGUnKS5maWx0ZXIoJzp2aXNpYmxlJyk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ25lYXJTaWJzPScsIG5lYXJTaWJzKTtcbiAgICAgICAgdmFyIG15SWQgPSAkKHRoaXMpWzBdLmdldEF0dHJpYnV0ZSgnaWQnKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnbXlJZD0nLCBteUlkKTtcbiAgICAgICAgc3VibWVudSA9ICQoW10pO1xuICAgICAgICB2YXIgdGhpc0VuY291bnRlcmVkID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmVhclNpYnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAodGhpc0VuY291bnRlcmVkKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdhZGRpbmcnLCBuZWFyU2lic1tpXSk7XG4gICAgICAgICAgICBzdWJtZW51ID0gc3VibWVudS5hZGQoJChuZWFyU2lic1tpXSkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAobmVhclNpYnNbaV0uZ2V0QXR0cmlidXRlKCdpZCcpID09PSBteUlkKSB7XG4gICAgICAgICAgICB0aGlzRW5jb3VudGVyZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCdzdWJtZW51IHNvIGZhcj0nLCBzdWJtZW51KTtcbiAgICAgICAgdmFyIGZhclNpYnMgPSAkKHRoaXMpLmNsb3Nlc3QoJ2xpJykubmV4dEFsbCgpLmZpbmQoJ2Rpdjpub3QoLmRpc2FibGVkKScpXG4gICAgICAgICAgLmZpbmQoJy5mb2N1c2FibGUnKS5maWx0ZXIoJzp2aXNpYmxlJyk7XG4gICAgICAgIHN1Ym1lbnUgPSBzdWJtZW51LmFkZChmYXJTaWJzKTtcbiAgICAgICAgaWYgKHN1Ym1lbnUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgc3VibWVudSA9ICQodGhpcykuY2xvc2VzdCgnbGknKS5jbG9zZXN0KCd1bCcpLmZpbmQoJ2Rpdjpub3QoLmRpc2FibGVkKScpXG4gICAgICAgICAgICAuZmluZCgnLmZvY3VzYWJsZScpLmZpbHRlcignOnZpc2libGUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZygnc3VibWVudT0nLCBzdWJtZW51KVxuICAgICAgaWYgKHN1Ym1lbnUubGVuZ3RoID4gMCkge1xuICAgICAgICBzdWJtZW51LmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ25vIGFjdGlvbmFibGUgc3VibWVudSBmb3VuZCcpXG4gICAgICB9XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0gZWxzZSBpZiAoa2MgPT09IDI3KSB7XG4gICAgICAvL2NvbnNvbGUubG9nKCdlc2MgcHJlc3NlZCcpO1xuICAgICAgaGlkZUFsbFRvcE1lbnVpdGVtcygpO1xuICAgICAgaWYgKHNob3dpbmdIZWxwS2V5cykge1xuICAgICAgICBzaG93aW5nSGVscEtleXMgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ2NhbGxpbmcgY3ljbGVGb2N1cyBpaScpXG4gICAgICAgIENQTy5jeWNsZUZvY3VzKCk7XG4gICAgICB9XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgLy8kKHRoaXMpLmNsb3Nlc3QoJ25hdicpLmNsb3Nlc3QoJ21haW4nKS5mb2N1cygpO1xuICAgIH0gZWxzZSBpZiAoa2MgPT09IDkgKSB7XG4gICAgICBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICBoaWRlQWxsVG9wTWVudWl0ZW1zKCk7XG4gICAgICAgIENQTy5jeWNsZUZvY3VzKHRydWUpO1xuICAgICAgfVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9IGVsc2UgaWYgKGtjID09PSAxMyB8fCBrYyA9PT0gMTcgfHwga2MgPT09IDIwIHx8IGtjID09PSAzMikge1xuICAgICAgLy8gMTM9ZW50ZXIgMTc9Y3RybCAyMD1jYXBzbG9jayAzMj1zcGFjZVxuICAgICAgLy9jb25zb2xlLmxvZygnc3RvcHByb3AgMScpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0gZWxzZSBpZiAoa2MgPj0gMTEyICYmIGtjIDw9IDEyMykge1xuICAgICAgLy9jb25zb2xlLmxvZygnZG9wcm9wIDEnKVxuICAgICAgLy8gZm4ga2V5c1xuICAgICAgLy8gZ28gYWhlYWQsIHByb3BhZ2F0ZVxuICAgIH0gZWxzZSBpZiAoZS5jdHJsS2V5ICYmIGtjID09PSAxOTEpIHtcbiAgICAgIC8vY29uc29sZS5sb2coJ0MtPyBwcmVzc2VkJylcbiAgICAgIHNob3dIZWxwS2V5cygpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy9jb25zb2xlLmxvZygnc3RvcHByb3AgMicpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgICAvL2Uuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0pO1xuXG4gIC8vIHNoYXJlQVBJLm1ha2VIb3Zlck1lbnUoJChcIiNmaWxlbWVudVwiKSwgJChcIiNmaWxlbWVudUNvbnRlbnRzXCIpLCBmYWxzZSwgZnVuY3Rpb24oKXt9KTtcbiAgLy8gc2hhcmVBUEkubWFrZUhvdmVyTWVudSgkKFwiI2Jvbm5pZW1lbnVcIiksICQoXCIjYm9ubmllbWVudUNvbnRlbnRzXCIpLCBmYWxzZSwgZnVuY3Rpb24oKXt9KTtcblxuXG4gIHZhciBjb2RlQ29udGFpbmVyID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwicmVwbE1haW5cIik7XG4gIGNvZGVDb250YWluZXIuYXR0cihcInJvbGVcIiwgXCJyZWdpb25cIikuXG4gICAgYXR0cihcImFyaWEtbGFiZWxcIiwgXCJEZWZpbml0aW9uc1wiKTtcbiAgICAvL2F0dHIoXCJ0YWJJbmRleFwiLCBcIi0xXCIpO1xuICAkKFwiI21haW5cIikucHJlcGVuZChjb2RlQ29udGFpbmVyKTtcblxuICBDUE8uZWRpdG9yID0gQ1BPLm1ha2VFZGl0b3IoY29kZUNvbnRhaW5lciwge1xuICAgIHJ1bkJ1dHRvbjogJChcIiNydW5CdXR0b25cIiksXG4gICAgc2ltcGxlRWRpdG9yOiBmYWxzZSxcbiAgICBydW46IENQTy5SVU5fQ09ERSxcbiAgICBpbml0aWFsR2FzOiAxMDBcbiAgfSk7XG4gIENQTy5lZGl0b3IuY20uc2V0T3B0aW9uKFwicmVhZE9ubHlcIiwgXCJub2N1cnNvclwiKTtcbiAgQ1BPLmVkaXRvci5jbS5zZXRPcHRpb24oXCJsb25nTGluZXNcIiwgbmV3IE1hcCgpKTtcbiAgZnVuY3Rpb24gcmVtb3ZlU2hvcnRlbmVkTGluZShsaW5lSGFuZGxlKSB7XG4gICAgdmFyIHJ1bGVycyA9IENQTy5lZGl0b3IuY20uZ2V0T3B0aW9uKFwicnVsZXJzXCIpO1xuICAgIHZhciBydWxlcnNNaW5Db2wgPSBDUE8uZWRpdG9yLmNtLmdldE9wdGlvbihcInJ1bGVyc01pbkNvbFwiKTtcbiAgICB2YXIgbG9uZ0xpbmVzID0gQ1BPLmVkaXRvci5jbS5nZXRPcHRpb24oXCJsb25nTGluZXNcIik7XG4gICAgaWYgKGxpbmVIYW5kbGUudGV4dC5sZW5ndGggPD0gcnVsZXJzTWluQ29sKSB7XG4gICAgICBsaW5lSGFuZGxlLnJ1bGVyTGlzdGVuZXJzLmZvckVhY2goKGYsIGV2dCkgPT4gbGluZUhhbmRsZS5vZmYoZXZ0LCBmKSk7XG4gICAgICBsb25nTGluZXMuZGVsZXRlKGxpbmVIYW5kbGUpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCJSZW1vdmVkIFwiLCBsaW5lSGFuZGxlKTtcbiAgICAgIHJlZnJlc2hSdWxlcnMoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZGVsZXRlTGluZShsaW5lSGFuZGxlKSB7XG4gICAgdmFyIGxvbmdMaW5lcyA9IENQTy5lZGl0b3IuY20uZ2V0T3B0aW9uKFwibG9uZ0xpbmVzXCIpO1xuICAgIGxpbmVIYW5kbGUucnVsZXJMaXN0ZW5lcnMuZm9yRWFjaCgoZiwgZXZ0KSA9PiBsaW5lSGFuZGxlLm9mZihldnQsIGYpKTtcbiAgICBsb25nTGluZXMuZGVsZXRlKGxpbmVIYW5kbGUpO1xuICAgIC8vIGNvbnNvbGUubG9nKFwiUmVtb3ZlZCBcIiwgbGluZUhhbmRsZSk7XG4gICAgcmVmcmVzaFJ1bGVycygpO1xuICB9XG4gIGZ1bmN0aW9uIHJlZnJlc2hSdWxlcnMoKSB7XG4gICAgdmFyIHJ1bGVycyA9IENQTy5lZGl0b3IuY20uZ2V0T3B0aW9uKFwicnVsZXJzXCIpO1xuICAgIHZhciBsb25nTGluZXMgPSBDUE8uZWRpdG9yLmNtLmdldE9wdGlvbihcImxvbmdMaW5lc1wiKTtcbiAgICB2YXIgbWluTGVuZ3RoO1xuICAgIGlmIChsb25nTGluZXMuc2l6ZSA9PT0gMCkge1xuICAgICAgbWluTGVuZ3RoID0gMDsgLy8gaWYgdGhlcmUgYXJlIG5vIGxvbmcgbGluZXMsIHRoZW4gd2UgZG9uJ3QgY2FyZSBhYm91dCBzaG93aW5nIGFueSBydWxlcnNcbiAgICB9IGVsc2Uge1xuICAgICAgbWluTGVuZ3RoID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICAgIGxvbmdMaW5lcy5mb3JFYWNoKGZ1bmN0aW9uKGxpbmVObywgbGluZUhhbmRsZSkge1xuICAgICAgICBpZiAobGluZUhhbmRsZS50ZXh0Lmxlbmd0aCA8IG1pbkxlbmd0aCkgeyBtaW5MZW5ndGggPSBsaW5lSGFuZGxlLnRleHQubGVuZ3RoOyB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChydWxlcnNbaV0uY29sdW1uID49IG1pbkxlbmd0aCkge1xuICAgICAgICBydWxlcnNbaV0uY2xhc3NOYW1lID0gXCJoaWRkZW5cIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJ1bGVyc1tpXS5jbGFzc05hbWUgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIGdvdHRhIHNldCB0aGUgb3B0aW9uIHR3aWNlLCBvciBlbHNlIENNIHNob3J0LWNpcmN1aXRzIGFuZCBpZ25vcmVzIGl0XG4gICAgQ1BPLmVkaXRvci5jbS5zZXRPcHRpb24oXCJydWxlcnNcIiwgdW5kZWZpbmVkKTtcbiAgICBDUE8uZWRpdG9yLmNtLnNldE9wdGlvbihcInJ1bGVyc1wiLCBydWxlcnMpO1xuICB9XG4gIENQTy5lZGl0b3IuY20ub24oJ2NoYW5nZXMnLCBmdW5jdGlvbihpbnN0YW5jZSwgY2hhbmdlT2Jqcykge1xuICAgIHZhciBtaW5MaW5lID0gaW5zdGFuY2UubGFzdExpbmUoKSwgbWF4TGluZSA9IDA7XG4gICAgdmFyIHJ1bGVyc01pbkNvbCA9IGluc3RhbmNlLmdldE9wdGlvbihcInJ1bGVyc01pbkNvbFwiKTtcbiAgICB2YXIgbG9uZ0xpbmVzID0gaW5zdGFuY2UuZ2V0T3B0aW9uKFwibG9uZ0xpbmVzXCIpO1xuICAgIGNoYW5nZU9ianMuZm9yRWFjaChmdW5jdGlvbihjaGFuZ2UpIHtcbiAgICAgIGlmIChtaW5MaW5lID4gY2hhbmdlLmZyb20ubGluZSkgeyBtaW5MaW5lID0gY2hhbmdlLmZyb20ubGluZTsgfVxuICAgICAgaWYgKG1heExpbmUgPCBjaGFuZ2UuZnJvbS5saW5lICsgY2hhbmdlLnRleHQubGVuZ3RoKSB7IG1heExpbmUgPSBjaGFuZ2UuZnJvbS5saW5lICsgY2hhbmdlLnRleHQubGVuZ3RoOyB9XG4gICAgfSk7XG4gICAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgICBpbnN0YW5jZS5lYWNoTGluZShtaW5MaW5lLCBtYXhMaW5lLCBmdW5jdGlvbihsaW5lSGFuZGxlKSB7XG4gICAgICBpZiAobGluZUhhbmRsZS50ZXh0Lmxlbmd0aCA+IHJ1bGVyc01pbkNvbCkge1xuICAgICAgICBpZiAoIWxvbmdMaW5lcy5oYXMobGluZUhhbmRsZSkpIHtcbiAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICBsb25nTGluZXMuc2V0KGxpbmVIYW5kbGUsIGxpbmVIYW5kbGUubGluZU5vKCkpO1xuICAgICAgICAgIGxpbmVIYW5kbGUucnVsZXJMaXN0ZW5lcnMgPSBuZXcgTWFwKFtcbiAgICAgICAgICAgIFtcImNoYW5nZVwiLCByZW1vdmVTaG9ydGVuZWRMaW5lXSxcbiAgICAgICAgICAgIFtcImRlbGV0ZVwiLCBmdW5jdGlvbigpIHsgLy8gbmVlZGVkIGJlY2F1c2UgdGhlIGRlbGV0ZSBoYW5kbGVyIGdldHMgbm8gYXJndW1lbnRzIGF0IGFsbFxuICAgICAgICAgICAgICBkZWxldGVMaW5lKGxpbmVIYW5kbGUpO1xuICAgICAgICAgICAgfV1cbiAgICAgICAgICBdKTtcbiAgICAgICAgICBsaW5lSGFuZGxlLnJ1bGVyTGlzdGVuZXJzLmZvckVhY2goKGYsIGV2dCkgPT4gbGluZUhhbmRsZS5vbihldnQsIGYpKTtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkFkZGVkIFwiLCBsaW5lSGFuZGxlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGxvbmdMaW5lcy5oYXMobGluZUhhbmRsZSkpIHtcbiAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICBsb25nTGluZXMuZGVsZXRlKGxpbmVIYW5kbGUpO1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiUmVtb3ZlZCBcIiwgbGluZUhhbmRsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgcmVmcmVzaFJ1bGVycygpO1xuICAgIH1cbiAgfSk7XG5cbiAgcHJvZ3JhbUxvYWRlZC50aGVuKGZ1bmN0aW9uKGMpIHtcbiAgICBDUE8uZG9jdW1lbnRzLnNldChcImRlZmluaXRpb25zOi8vXCIsIENQTy5lZGl0b3IuY20uZ2V0RG9jKCkpO1xuXG4gICAgLy8gTk9URShqb2UpOiBDbGVhcmluZyBoaXN0b3J5IHRvIGFkZHJlc3MgaHR0cHM6Ly9naXRodWIuY29tL2Jyb3ducGx0L3B5cmV0LWxhbmcvaXNzdWVzLzM4NixcbiAgICAvLyBpbiB3aGljaCB1bmRvIGNhbiByZXZlcnQgdGhlIHByb2dyYW0gYmFjayB0byBlbXB0eVxuICAgIENQTy5lZGl0b3IuY20uY2xlYXJIaXN0b3J5KCk7XG4gICAgQ1BPLmVkaXRvci5jbS5zZXRWYWx1ZShjKTtcbiAgfSk7XG5cbiAgcHJvZ3JhbUxvYWRlZC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgIENQTy5kb2N1bWVudHMuc2V0KFwiZGVmaW5pdGlvbnM6Ly9cIiwgQ1BPLmVkaXRvci5jbS5nZXREb2MoKSk7XG4gIH0pO1xuXG4gIHZhciBweXJldExvYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgY29uc29sZS5sb2cocHJvY2Vzcy5lbnYuUFlSRVQpO1xuICBweXJldExvYWQuc3JjID0gcHJvY2Vzcy5lbnYuUFlSRVQ7XG4gIHB5cmV0TG9hZC50eXBlID0gXCJ0ZXh0L2phdmFzY3JpcHRcIjtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChweXJldExvYWQpO1xuXG4gIHZhciBweXJldExvYWQyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5cbiAgZnVuY3Rpb24gbG9nRmFpbHVyZUFuZE1hbnVhbEZldGNoKHVybCwgZSkge1xuXG4gICAgLy8gTk9URShqb2UpOiBUaGUgZXJyb3IgcmVwb3J0ZWQgYnkgdGhlIFwiZXJyb3JcIiBldmVudCBoYXMgZXNzZW50aWFsbHkgbm9cbiAgICAvLyBpbmZvcm1hdGlvbiBvbiBpdDsgaXQncyBqdXN0IGEgbm90aWZpY2F0aW9uIHRoYXQgX3NvbWV0aGluZ18gd2VudCB3cm9uZy5cbiAgICAvLyBTbywgd2UgbG9nIHRoYXQgc29tZXRoaW5nIGhhcHBlbmVkLCB0aGVuIGltbWVkaWF0ZWx5IGRvIGFuIEFKQVggcmVxdWVzdFxuICAgIC8vIGNhbGwgZm9yIHRoZSBzYW1lIFVSTCwgdG8gc2VlIGlmIHdlIGNhbiBnZXQgbW9yZSBpbmZvcm1hdGlvbi4gVGhpc1xuICAgIC8vIGRvZXNuJ3QgcGVyZmVjdGx5IHRlbGwgdXMgYWJvdXQgdGhlIG9yaWdpbmFsIGZhaWx1cmUsIGJ1dCBpdCdzXG4gICAgLy8gc29tZXRoaW5nLlxuXG4gICAgLy8gSW4gYWRkaXRpb24sIGlmIHNvbWVvbmUgaXMgc2VlaW5nIHRoZSBQeXJldCBmYWlsZWQgdG8gbG9hZCBlcnJvciwgYnV0IHdlXG4gICAgLy8gZG9uJ3QgZ2V0IHRoZXNlIGxvZ2dpbmcgZXZlbnRzLCB3ZSBoYXZlIGEgc3Ryb25nIGhpbnQgdGhhdCBzb21ldGhpbmcgaXNcbiAgICAvLyB1cCB3aXRoIHRoZWlyIG5ldHdvcmsuXG4gICAgbG9nZ2VyLmxvZygncHlyZXQtbG9hZC1mYWlsdXJlJyxcbiAgICAgIHtcbiAgICAgICAgZXZlbnQgOiAnaW5pdGlhbC1mYWlsdXJlJyxcbiAgICAgICAgdXJsIDogdXJsLFxuXG4gICAgICAgIC8vIFRoZSB0aW1lc3RhbXAgYXBwZWFycyB0byBjb3VudCBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgcGFnZSBsb2FkLFxuICAgICAgICAvLyB3aGljaCBtYXkgYXBwcm94aW1hdGUgZG93bmxvYWQgdGltZSBpZiwgc2F5LCByZXF1ZXN0cyBhcmUgdGltaW5nIG91dFxuICAgICAgICAvLyBvciBnZXR0aW5nIGN1dCBvZmYuXG5cbiAgICAgICAgdGltZVN0YW1wIDogZS50aW1lU3RhbXBcbiAgICAgIH0pO1xuXG4gICAgdmFyIG1hbnVhbEZldGNoID0gJC5hamF4KHVybCk7XG4gICAgbWFudWFsRmV0Y2gudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIC8vIEhlcmUsIHdlIGxvZyB0aGUgZmlyc3QgMTAwIGNoYXJhY3RlcnMgb2YgdGhlIHJlc3BvbnNlIHRvIG1ha2Ugc3VyZVxuICAgICAgLy8gdGhleSByZXNlbWJsZSB0aGUgUHlyZXQgYmxvYlxuICAgICAgbG9nZ2VyLmxvZygncHlyZXQtbG9hZC1mYWlsdXJlJywge1xuICAgICAgICBldmVudCA6ICdzdWNjZXNzLXdpdGgtYWpheCcsXG4gICAgICAgIGNvbnRlbnRzUHJlZml4IDogcmVzLnNsaWNlKDAsIDEwMClcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIG1hbnVhbEZldGNoLmZhaWwoZnVuY3Rpb24ocmVzKSB7XG4gICAgICBsb2dnZXIubG9nKCdweXJldC1sb2FkLWZhaWx1cmUnLCB7XG4gICAgICAgIGV2ZW50IDogJ2ZhaWx1cmUtd2l0aC1hamF4JyxcbiAgICAgICAgc3RhdHVzOiByZXMuc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXMuc3RhdHVzVGV4dCxcbiAgICAgICAgLy8gU2luY2UgcmVzcG9uc2VUZXh0IGNvdWxkIGJlIGEgbG9uZyBlcnJvciBwYWdlLCBhbmQgd2UgZG9uJ3Qgd2FudCB0b1xuICAgICAgICAvLyBsb2cgaHVnZSBwYWdlcywgd2Ugc2xpY2UgaXQgdG8gMTAwIGNoYXJhY3RlcnMsIHdoaWNoIGlzIGVub3VnaCB0b1xuICAgICAgICAvLyB0ZWxsIHVzIHdoYXQncyBnb2luZyBvbiAoZS5nLiBBV1MgZmFpbHVyZSwgbmV0d29yayBvdXRhZ2UpLlxuICAgICAgICByZXNwb25zZVRleHQ6IHJlcy5yZXNwb25zZVRleHQuc2xpY2UoMCwgMTAwKVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAkKHB5cmV0TG9hZCkub24oXCJlcnJvclwiLCBmdW5jdGlvbihlKSB7XG4gICAgbG9nRmFpbHVyZUFuZE1hbnVhbEZldGNoKHByb2Nlc3MuZW52LlBZUkVULCBlKTtcbiAgICBjb25zb2xlLmxvZyhwcm9jZXNzLmVudik7XG4gICAgcHlyZXRMb2FkMi5zcmMgPSBwcm9jZXNzLmVudi5QWVJFVF9CQUNLVVA7XG4gICAgcHlyZXRMb2FkMi50eXBlID0gXCJ0ZXh0L2phdmFzY3JpcHRcIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHB5cmV0TG9hZDIpO1xuICB9KTtcblxuICAkKHB5cmV0TG9hZDIpLm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24oZSkge1xuICAgICQoXCIjbG9hZGVyXCIpLmhpZGUoKTtcbiAgICAkKFwiI3J1blBhcnRcIikuaGlkZSgpO1xuICAgICQoXCIjYnJlYWtCdXR0b25cIikuaGlkZSgpO1xuICAgIHdpbmRvdy5zdGlja0Vycm9yKFwiUHlyZXQgZmFpbGVkIHRvIGxvYWQ7IGNoZWNrIHlvdXIgY29ubmVjdGlvbiBvciB0cnkgcmVmcmVzaGluZyB0aGUgcGFnZS4gIElmIHRoaXMgaGFwcGVucyByZXBlYXRlZGx5LCBwbGVhc2UgcmVwb3J0IGl0IGFzIGEgYnVnLlwiKTtcbiAgICBsb2dGYWlsdXJlQW5kTWFudWFsRmV0Y2gocHJvY2Vzcy5lbnYuUFlSRVRfQkFDS1VQLCBlKTtcblxuICB9KTtcblxuICBwcm9ncmFtTG9hZGVkLmZpbihmdW5jdGlvbigpIHtcbiAgICBDUE8uZWRpdG9yLmZvY3VzKCk7XG4gICAgQ1BPLmVkaXRvci5jbS5zZXRPcHRpb24oXCJyZWFkT25seVwiLCBmYWxzZSk7XG4gIH0pO1xuXG4gIENQTy5hdXRvU2F2ZSA9IGF1dG9TYXZlO1xuICBDUE8uc2F2ZSA9IHNhdmU7XG4gIENQTy51cGRhdGVOYW1lID0gdXBkYXRlTmFtZTtcbiAgQ1BPLnNob3dTaGFyZUNvbnRhaW5lciA9IHNob3dTaGFyZUNvbnRhaW5lcjtcbiAgQ1BPLmxvYWRQcm9ncmFtID0gbG9hZFByb2dyYW07XG4gIENQTy5jeWNsZUZvY3VzID0gY3ljbGVGb2N1cztcbiAgQ1BPLnNheSA9IHNheTtcbiAgQ1BPLnNheUFuZEZvcmdldCA9IHNheUFuZEZvcmdldDtcblxufSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvd2ViL2pzL2JlZm9yZVB5cmV0LmpzIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS9+L25vZGUtbGlicy1icm93c2VyL34vcHJvY2Vzcy9icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIiwiLy8gQ29weXJpZ2h0IDIwMTMtMjAxNCBLZXZpbiBDb3hcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICBUaGlzIHNvZnR3YXJlIGlzIHByb3ZpZGVkICdhcy1pcycsIHdpdGhvdXQgYW55IGV4cHJlc3Mgb3IgaW1wbGllZCAgICAgICAgICAgKlxuKiAgd2FycmFudHkuIEluIG5vIGV2ZW50IHdpbGwgdGhlIGF1dGhvcnMgYmUgaGVsZCBsaWFibGUgZm9yIGFueSBkYW1hZ2VzICAgICAgICpcbiogIGFyaXNpbmcgZnJvbSB0aGUgdXNlIG9mIHRoaXMgc29mdHdhcmUuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgUGVybWlzc2lvbiBpcyBncmFudGVkIHRvIGFueW9uZSB0byB1c2UgdGhpcyBzb2Z0d2FyZSBmb3IgYW55IHB1cnBvc2UsICAgICAgICpcbiogIGluY2x1ZGluZyBjb21tZXJjaWFsIGFwcGxpY2F0aW9ucywgYW5kIHRvIGFsdGVyIGl0IGFuZCByZWRpc3RyaWJ1dGUgaXQgICAgICAqXG4qICBmcmVlbHksIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyByZXN0cmljdGlvbnM6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogIDEuIFRoZSBvcmlnaW4gb2YgdGhpcyBzb2Z0d2FyZSBtdXN0IG5vdCBiZSBtaXNyZXByZXNlbnRlZDsgeW91IG11c3Qgbm90ICAgICAqXG4qICAgICBjbGFpbSB0aGF0IHlvdSB3cm90ZSB0aGUgb3JpZ2luYWwgc29mdHdhcmUuIElmIHlvdSB1c2UgdGhpcyBzb2Z0d2FyZSBpbiAgKlxuKiAgICAgYSBwcm9kdWN0LCBhbiBhY2tub3dsZWRnbWVudCBpbiB0aGUgcHJvZHVjdCBkb2N1bWVudGF0aW9uIHdvdWxkIGJlICAgICAgICpcbiogICAgIGFwcHJlY2lhdGVkIGJ1dCBpcyBub3QgcmVxdWlyZWQuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgMi4gQWx0ZXJlZCBzb3VyY2UgdmVyc2lvbnMgbXVzdCBiZSBwbGFpbmx5IG1hcmtlZCBhcyBzdWNoLCBhbmQgbXVzdCBub3QgYmUgICpcbiogICAgIG1pc3JlcHJlc2VudGVkIGFzIGJlaW5nIHRoZSBvcmlnaW5hbCBzb2Z0d2FyZS4gICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgMy4gVGhpcyBub3RpY2UgbWF5IG5vdCBiZSByZW1vdmVkIG9yIGFsdGVyZWQgZnJvbSBhbnkgc291cmNlIGRpc3RyaWJ1dGlvbi4gICpcbiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4rZnVuY3Rpb24oKXtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgYXJyYXkgPSAvXFxbKFteXFxbXSopXFxdJC87XG5cbi8vLyBVUkwgUmVnZXguXG4vKipcbiAqIFRoaXMgcmVnZXggc3BsaXRzIHRoZSBVUkwgaW50byBwYXJ0cy4gIFRoZSBjYXB0dXJlIGdyb3VwcyBjYXRjaCB0aGUgaW1wb3J0YW50XG4gKiBiaXRzLlxuICogXG4gKiBFYWNoIHNlY3Rpb24gaXMgb3B0aW9uYWwsIHNvIHRvIHdvcmsgb24gYW55IHBhcnQgZmluZCB0aGUgY29ycmVjdCB0b3AgbGV2ZWxcbiAqIGAoLi4uKT9gIGFuZCBtZXNzIGFyb3VuZCB3aXRoIGl0LlxuICovXG52YXIgcmVnZXggPSAvXig/OihbYS16XSopOik/KD86XFwvXFwvKT8oPzooW146QF0qKSg/OjooW15AXSopKT9AKT8oW2Etei0uX10rKT8oPzo6KFswLTldKikpPyhcXC9bXj8jXSopPyg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8kL2k7XG4vLyAgICAgICAgICAgICAgIDEgLSBzY2hlbWUgICAgICAgICAgICAgICAgMiAtIHVzZXIgICAgMyA9IHBhc3MgNCAtIGhvc3QgICAgICAgIDUgLSBwb3J0ICA2IC0gcGF0aCAgICAgICAgNyAtIHF1ZXJ5ICAgIDggLSBoYXNoXG5cbnZhciBub3NsYXNoID0gW1wibWFpbHRvXCIsXCJiaXRjb2luXCJdO1xuXG52YXIgc2VsZiA9IHtcblx0LyoqIFBhcnNlIGEgcXVlcnkgc3RyaW5nLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHBhcnNlcyBhIHF1ZXJ5IHN0cmluZyAoc29tZXRpbWVzIGNhbGxlZCB0aGUgc2VhcmNoXG5cdCAqIHN0cmluZykuICBJdCB0YWtlcyBhIHF1ZXJ5IHN0cmluZyBhbmQgcmV0dXJucyBhIG1hcCBvZiB0aGUgcmVzdWx0cy5cblx0ICpcblx0ICogS2V5cyBhcmUgY29uc2lkZXJlZCB0byBiZSBldmVyeXRoaW5nIHVwIHRvIHRoZSBmaXJzdCAnPScgYW5kIHZhbHVlcyBhcmVcblx0ICogZXZlcnl0aGluZyBhZnRlcndvcmRzLiAgU2luY2UgVVJMLWRlY29kaW5nIGlzIGRvbmUgYWZ0ZXIgcGFyc2luZywga2V5c1xuXHQgKiBhbmQgdmFsdWVzIGNhbiBoYXZlIGFueSB2YWx1ZXMsIGhvd2V2ZXIsICc9JyBoYXZlIHRvIGJlIGVuY29kZWQgaW4ga2V5c1xuXHQgKiB3aGlsZSAnPycgYW5kICcmJyBoYXZlIHRvIGJlIGVuY29kZWQgYW55d2hlcmUgKGFzIHRoZXkgZGVsaW1pdCB0aGVcblx0ICoga3YtcGFpcnMpLlxuXHQgKlxuXHQgKiBLZXlzIGFuZCB2YWx1ZXMgd2lsbCBhbHdheXMgYmUgc3RyaW5ncywgZXhjZXB0IGlmIHRoZXJlIGlzIGEga2V5IHdpdGggbm9cblx0ICogJz0nIGluIHdoaWNoIGNhc2UgaXQgd2lsbCBiZSBjb25zaWRlcmVkIGEgZmxhZyBhbmQgd2lsbCBiZSBzZXQgdG8gdHJ1ZS5cblx0ICogTGF0ZXIgdmFsdWVzIHdpbGwgb3ZlcnJpZGUgZWFybGllciB2YWx1ZXMuXG5cdCAqXG5cdCAqIEFycmF5IGtleXMgYXJlIGFsc28gc3VwcG9ydGVkLiAgQnkgZGVmYXVsdCBrZXlzIGluIHRoZSBmb3JtIG9mIGBuYW1lW2ldYFxuXHQgKiB3aWxsIGJlIHJldHVybmVkIGxpa2UgdGhhdCBhcyBzdHJpbmdzLiAgSG93ZXZlciwgaWYgeW91IHNldCB0aGUgYGFycmF5YFxuXHQgKiBmbGFnIGluIHRoZSBvcHRpb25zIG9iamVjdCB0aGV5IHdpbGwgYmUgcGFyc2VkIGludG8gYXJyYXlzLiAgTm90ZSB0aGF0XG5cdCAqIGFsdGhvdWdoIHRoZSBvYmplY3QgcmV0dXJuZWQgaXMgYW4gYEFycmF5YCBvYmplY3QgYWxsIGtleXMgd2lsbCBiZVxuXHQgKiB3cml0dGVuIHRvIGl0LiAgVGhpcyBtZWFucyB0aGF0IGlmIHlvdSBoYXZlIGEga2V5IHN1Y2ggYXMgYGtbZm9yRWFjaF1gXG5cdCAqIGl0IHdpbGwgb3ZlcndyaXRlIHRoZSBgZm9yRWFjaGAgZnVuY3Rpb24gb24gdGhhdCBhcnJheS4gIEFsc28gbm90ZSB0aGF0XG5cdCAqIHN0cmluZyBwcm9wZXJ0aWVzIGFsd2F5cyB0YWtlIHByZWNlZGVuY2Ugb3ZlciBhcnJheSBwcm9wZXJ0aWVzLFxuXHQgKiBpcnJlc3BlY3RpdmUgb2Ygd2hlcmUgdGhleSBhcmUgaW4gdGhlIHF1ZXJ5IHN0cmluZy5cblx0ICpcblx0ICogICB1cmwuZ2V0KFwiYXJyYXlbMV09dGVzdCZhcnJheVtmb29dPWJhclwiLHthcnJheTp0cnVlfSkuYXJyYXlbMV0gID09PSBcInRlc3RcIlxuXHQgKiAgIHVybC5nZXQoXCJhcnJheVsxXT10ZXN0JmFycmF5W2Zvb109YmFyXCIse2FycmF5OnRydWV9KS5hcnJheS5mb28gPT09IFwiYmFyXCJcblx0ICogICB1cmwuZ2V0KFwiYXJyYXk9bm90YW5hcnJheSZhcnJheVswXT0xXCIse2FycmF5OnRydWV9KS5hcnJheSAgICAgID09PSBcIm5vdGFuYXJyYXlcIlxuXHQgKlxuXHQgKiBJZiBhcnJheSBwYXJzaW5nIGlzIGVuYWJsZWQga2V5cyBpbiB0aGUgZm9ybSBvZiBgbmFtZVtdYCB3aWxsXG5cdCAqIGF1dG9tYXRpY2FsbHkgYmUgZ2l2ZW4gdGhlIG5leHQgYXZhaWxhYmxlIGluZGV4LiAgTm90ZSB0aGF0IHRoaXMgY2FuIGJlXG5cdCAqIG92ZXJ3cml0dGVuIHdpdGggbGF0ZXIgdmFsdWVzIGluIHRoZSBxdWVyeSBzdHJpbmcuICBGb3IgdGhpcyByZWFzb24gaXNcblx0ICogaXMgYmVzdCBub3QgdG8gbWl4IHRoZSB0d28gZm9ybWF0cywgYWx0aG91Z2ggaXQgaXMgc2FmZSAoYW5kIG9mdGVuXG5cdCAqIHVzZWZ1bCkgdG8gYWRkIGFuIGF1dG9tYXRpYyBpbmRleCBhcmd1bWVudCB0byB0aGUgZW5kIG9mIGEgcXVlcnkgc3RyaW5nLlxuXHQgKlxuXHQgKiAgIHVybC5nZXQoXCJhW109MCZhW109MSZhWzBdPTJcIiwge2FycmF5OnRydWV9KSAgLT4ge2E6W1wiMlwiLFwiMVwiXX07XG5cdCAqICAgdXJsLmdldChcImFbMF09MCZhWzFdPTEmYVtdPTJcIiwge2FycmF5OnRydWV9KSAtPiB7YTpbXCIwXCIsXCIxXCIsXCIyXCJdfTtcblx0ICpcblx0ICogQHBhcmFte3N0cmluZ30gcSBUaGUgcXVlcnkgc3RyaW5nICh0aGUgcGFydCBhZnRlciB0aGUgJz8nKS5cblx0ICogQHBhcmFte3tmdWxsOmJvb2xlYW4sYXJyYXk6Ym9vbGVhbn09fSBvcHQgT3B0aW9ucy5cblx0ICpcblx0ICogLSBmdWxsOiBJZiBzZXQgYHFgIHdpbGwgYmUgdHJlYXRlZCBhcyBhIGZ1bGwgdXJsIGFuZCBgcWAgd2lsbCBiZSBidWlsdC5cblx0ICogICBieSBjYWxsaW5nICNwYXJzZSB0byByZXRyaWV2ZSB0aGUgcXVlcnkgcG9ydGlvbi5cblx0ICogLSBhcnJheTogSWYgc2V0IGtleXMgaW4gdGhlIGZvcm0gb2YgYGtleVtpXWAgd2lsbCBiZSB0cmVhdGVkXG5cdCAqICAgYXMgYXJyYXlzL21hcHMuXG5cdCAqXG5cdCAqIEByZXR1cm57IU9iamVjdC48c3RyaW5nLCBzdHJpbmd8QXJyYXk+fSBUaGUgcGFyc2VkIHJlc3VsdC5cblx0ICovXG5cdFwiZ2V0XCI6IGZ1bmN0aW9uKHEsIG9wdCl7XG5cdFx0cSA9IHEgfHwgXCJcIjtcblx0XHRpZiAoIHR5cGVvZiBvcHQgICAgICAgICAgPT0gXCJ1bmRlZmluZWRcIiApIG9wdCA9IHt9O1xuXHRcdGlmICggdHlwZW9mIG9wdFtcImZ1bGxcIl0gID09IFwidW5kZWZpbmVkXCIgKSBvcHRbXCJmdWxsXCJdID0gZmFsc2U7XG5cdFx0aWYgKCB0eXBlb2Ygb3B0W1wiYXJyYXlcIl0gPT0gXCJ1bmRlZmluZWRcIiApIG9wdFtcImFycmF5XCJdID0gZmFsc2U7XG5cdFx0XG5cdFx0aWYgKCBvcHRbXCJmdWxsXCJdID09PSB0cnVlIClcblx0XHR7XG5cdFx0XHRxID0gc2VsZltcInBhcnNlXCJdKHEsIHtcImdldFwiOmZhbHNlfSlbXCJxdWVyeVwiXSB8fCBcIlwiO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgbyA9IHt9O1xuXHRcdFxuXHRcdHZhciBjID0gcS5zcGxpdChcIiZcIik7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghY1tpXS5sZW5ndGgpIGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHR2YXIgZCA9IGNbaV0uaW5kZXhPZihcIj1cIik7XG5cdFx0XHR2YXIgayA9IGNbaV0sIHYgPSB0cnVlO1xuXHRcdFx0aWYgKCBkID49IDAgKVxuXHRcdFx0e1xuXHRcdFx0XHRrID0gY1tpXS5zdWJzdHIoMCwgZCk7XG5cdFx0XHRcdHYgPSBjW2ldLnN1YnN0cihkKzEpO1xuXHRcdFx0XHRcblx0XHRcdFx0diA9IGRlY29kZVVSSUNvbXBvbmVudCh2KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKG9wdFtcImFycmF5XCJdKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgaW5kcyA9IFtdO1xuXHRcdFx0XHR2YXIgaW5kO1xuXHRcdFx0XHR2YXIgY3VybyA9IG87XG5cdFx0XHRcdHZhciBjdXJrID0gaztcblx0XHRcdFx0d2hpbGUgKGluZCA9IGN1cmsubWF0Y2goYXJyYXkpKSAvLyBBcnJheSFcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGN1cmsgPSBjdXJrLnN1YnN0cigwLCBpbmQuaW5kZXgpO1xuXHRcdFx0XHRcdGluZHMudW5zaGlmdChkZWNvZGVVUklDb21wb25lbnQoaW5kWzFdKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y3VyayA9IGRlY29kZVVSSUNvbXBvbmVudChjdXJrKTtcblx0XHRcdFx0aWYgKGluZHMuc29tZShmdW5jdGlvbihpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKCB0eXBlb2YgY3Vyb1tjdXJrXSA9PSBcInVuZGVmaW5lZFwiICkgY3Vyb1tjdXJrXSA9IFtdO1xuXHRcdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShjdXJvW2N1cmtdKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwidXJsLmdldDogQXJyYXkgcHJvcGVydHkgXCIrY3VyaytcIiBhbHJlYWR5IGV4aXN0cyBhcyBzdHJpbmchXCIpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGN1cm8gPSBjdXJvW2N1cmtdO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmICggaSA9PT0gXCJcIiApIGkgPSBjdXJvLmxlbmd0aDtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjdXJrID0gaTtcblx0XHRcdFx0fSkpIGNvbnRpbnVlO1xuXHRcdFx0XHRjdXJvW2N1cmtdID0gdjtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGsgPSBkZWNvZGVVUklDb21wb25lbnQoayk7XG5cdFx0XHRcblx0XHRcdC8vdHlwZW9mIG9ba10gPT0gXCJ1bmRlZmluZWRcIiB8fCBjb25zb2xlLmxvZyhcIlByb3BlcnR5IFwiK2srXCIgYWxyZWFkeSBleGlzdHMhXCIpO1xuXHRcdFx0b1trXSA9IHY7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBvO1xuXHR9LFxuXHRcblx0LyoqIEJ1aWxkIGEgZ2V0IHF1ZXJ5IGZyb20gYW4gb2JqZWN0LlxuXHQgKlxuXHQgKiBUaGlzIGNvbnN0cnVjdHMgYSBxdWVyeSBzdHJpbmcgZnJvbSB0aGUga3YgcGFpcnMgaW4gYGRhdGFgLiAgQ2FsbGluZ1xuXHQgKiAjZ2V0IG9uIHRoZSBzdHJpbmcgcmV0dXJuZWQgc2hvdWxkIHJldHVybiBhbiBvYmplY3QgaWRlbnRpY2FsIHRvIHRoZSBvbmVcblx0ICogcGFzc2VkIGluIGV4Y2VwdCBhbGwgbm9uLWJvb2xlYW4gc2NhbGFyIHR5cGVzIGJlY29tZSBzdHJpbmdzIGFuZCBhbGxcblx0ICogb2JqZWN0IHR5cGVzIGJlY29tZSBhcnJheXMgKG5vbi1pbnRlZ2VyIGtleXMgYXJlIHN0aWxsIHByZXNlbnQsIHNlZVxuXHQgKiAjZ2V0J3MgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBkZXRhaWxzKS5cblx0ICpcblx0ICogVGhpcyBhbHdheXMgdXNlcyBhcnJheSBzeW50YXggZm9yIGRlc2NyaWJpbmcgYXJyYXlzLiAgSWYgeW91IHdhbnQgdG9cblx0ICogc2VyaWFsaXplIHRoZW0gZGlmZmVyZW50bHkgKGxpa2UgaGF2aW5nIHRoZSB2YWx1ZSBiZSBhIEpTT04gYXJyYXkgYW5kXG5cdCAqIGhhdmUgYSBwbGFpbiBrZXkpIHlvdSB3aWxsIG5lZWQgdG8gZG8gdGhhdCBiZWZvcmUgcGFzc2luZyBpdCBpbi5cblx0ICpcblx0ICogQWxsIGtleXMgYW5kIHZhbHVlcyBhcmUgc3VwcG9ydGVkIChiaW5hcnkgZGF0YSBhbnlvbmU/KSBhcyB0aGV5IGFyZVxuXHQgKiBwcm9wZXJseSBVUkwtZW5jb2RlZCBhbmQgI2dldCBwcm9wZXJseSBkZWNvZGVzLlxuXHQgKlxuXHQgKiBAcGFyYW17T2JqZWN0fSBkYXRhIFRoZSBrdiBwYWlycy5cblx0ICogQHBhcmFte3N0cmluZ30gcHJlZml4IFRoZSBwcm9wZXJseSBlbmNvZGVkIGFycmF5IGtleSB0byBwdXQgdGhlXG5cdCAqICAgcHJvcGVydGllcy4gIE1haW5seSBpbnRlbmRlZCBmb3IgaW50ZXJuYWwgdXNlLlxuXHQgKiBAcmV0dXJue3N0cmluZ30gQSBVUkwtc2FmZSBzdHJpbmcuXG5cdCAqL1xuXHRcImJ1aWxkZ2V0XCI6IGZ1bmN0aW9uKGRhdGEsIHByZWZpeCl7XG5cdFx0dmFyIGl0bXMgPSBbXTtcblx0XHRmb3IgKCB2YXIgayBpbiBkYXRhIClcblx0XHR7XG5cdFx0XHR2YXIgZWsgPSBlbmNvZGVVUklDb21wb25lbnQoayk7XG5cdFx0XHRpZiAoIHR5cGVvZiBwcmVmaXggIT0gXCJ1bmRlZmluZWRcIiApXG5cdFx0XHRcdGVrID0gcHJlZml4K1wiW1wiK2VrK1wiXVwiO1xuXHRcdFx0XG5cdFx0XHR2YXIgdiA9IGRhdGFba107XG5cdFx0XHRcblx0XHRcdHN3aXRjaCAodHlwZW9mIHYpXG5cdFx0XHR7XG5cdFx0XHRcdGNhc2UgJ2Jvb2xlYW4nOlxuXHRcdFx0XHRcdGlmKHYpIGl0bXMucHVzaChlayk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ251bWJlcic6XG5cdFx0XHRcdFx0diA9IHYudG9TdHJpbmcoKTtcblx0XHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0XHRpdG1zLnB1c2goZWsrXCI9XCIrZW5jb2RlVVJJQ29tcG9uZW50KHYpKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnb2JqZWN0Jzpcblx0XHRcdFx0XHRpdG1zLnB1c2goc2VsZltcImJ1aWxkZ2V0XCJdKHYsIGVrKSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpdG1zLmpvaW4oXCImXCIpO1xuXHR9LFxuXHRcblx0LyoqIFBhcnNlIGEgVVJMXG5cdCAqIFxuXHQgKiBUaGlzIGJyZWFrcyB1cCBhIFVSTCBpbnRvIGNvbXBvbmVudHMuICBJdCBhdHRlbXB0cyB0byBiZSB2ZXJ5IGxpYmVyYWxcblx0ICogYW5kIHJldHVybnMgdGhlIGJlc3QgcmVzdWx0IGluIG1vc3QgY2FzZXMuICBUaGlzIG1lYW5zIHRoYXQgeW91IGNhblxuXHQgKiBvZnRlbiBwYXNzIGluIHBhcnQgb2YgYSBVUkwgYW5kIGdldCBjb3JyZWN0IGNhdGVnb3JpZXMgYmFjay4gIE5vdGFibHksXG5cdCAqIHRoaXMgd29ya3MgZm9yIGVtYWlscyBhbmQgSmFiYmVyIElEcywgYXMgd2VsbCBhcyBhZGRpbmcgYSAnPycgdG8gdGhlXG5cdCAqIGJlZ2lubmluZyBvZiBhIHN0cmluZyB3aWxsIHBhcnNlIHRoZSB3aG9sZSB0aGluZyBhcyBhIHF1ZXJ5IHN0cmluZy4gIElmXG5cdCAqIGFuIGl0ZW0gaXMgbm90IGZvdW5kIHRoZSBwcm9wZXJ0eSB3aWxsIGJlIHVuZGVmaW5lZC4gIEluIHNvbWUgY2FzZXMgYW5cblx0ICogZW1wdHkgc3RyaW5nIHdpbGwgYmUgcmV0dXJuZWQgaWYgdGhlIHN1cnJvdW5kaW5nIHN5bnRheCBidXQgdGhlIGFjdHVhbFxuXHQgKiB2YWx1ZSBpcyBlbXB0eSAoZXhhbXBsZTogXCI6Ly9leGFtcGxlLmNvbVwiIHdpbGwgZ2l2ZSBhIGVtcHR5IHN0cmluZyBmb3Jcblx0ICogc2NoZW1lLikgIE5vdGFibHkgdGhlIGhvc3QgbmFtZSB3aWxsIGFsd2F5cyBiZSBzZXQgdG8gc29tZXRoaW5nLlxuXHQgKiBcblx0ICogUmV0dXJuZWQgcHJvcGVydGllcy5cblx0ICogXG5cdCAqIC0gKipzY2hlbWU6KiogVGhlIHVybCBzY2hlbWUuIChleDogXCJtYWlsdG9cIiBvciBcImh0dHBzXCIpXG5cdCAqIC0gKip1c2VyOioqIFRoZSB1c2VybmFtZS5cblx0ICogLSAqKnBhc3M6KiogVGhlIHBhc3N3b3JkLlxuXHQgKiAtICoqaG9zdDoqKiBUaGUgaG9zdG5hbWUuIChleDogXCJsb2NhbGhvc3RcIiwgXCIxMjMuNDU2LjcuOFwiIG9yIFwiZXhhbXBsZS5jb21cIilcblx0ICogLSAqKnBvcnQ6KiogVGhlIHBvcnQsIGFzIGEgbnVtYmVyLiAoZXg6IDEzMzcpXG5cdCAqIC0gKipwYXRoOioqIFRoZSBwYXRoLiAoZXg6IFwiL1wiIG9yIFwiL2Fib3V0Lmh0bWxcIilcblx0ICogLSAqKnF1ZXJ5OioqIFwiVGhlIHF1ZXJ5IHN0cmluZy4gKGV4OiBcImZvbz1iYXImdj0xNyZmb3JtYXQ9anNvblwiKVxuXHQgKiAtICoqZ2V0OioqIFRoZSBxdWVyeSBzdHJpbmcgcGFyc2VkIHdpdGggZ2V0LiAgSWYgYG9wdC5nZXRgIGlzIGBmYWxzZWAgdGhpc1xuXHQgKiAgIHdpbGwgYmUgYWJzZW50XG5cdCAqIC0gKipoYXNoOioqIFRoZSB2YWx1ZSBhZnRlciB0aGUgaGFzaC4gKGV4OiBcIm15YW5jaG9yXCIpXG5cdCAqICAgYmUgdW5kZWZpbmVkIGV2ZW4gaWYgYHF1ZXJ5YCBpcyBzZXQuXG5cdCAqXG5cdCAqIEBwYXJhbXtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHBhcnNlLlxuXHQgKiBAcGFyYW17e2dldDpPYmplY3R9PX0gb3B0IE9wdGlvbnM6XG5cdCAqXG5cdCAqIC0gZ2V0OiBBbiBvcHRpb25zIGFyZ3VtZW50IHRvIGJlIHBhc3NlZCB0byAjZ2V0IG9yIGZhbHNlIHRvIG5vdCBjYWxsICNnZXQuXG5cdCAqICAgICoqRE8gTk9UKiogc2V0IGBmdWxsYC5cblx0ICpcblx0ICogQHJldHVybnshT2JqZWN0fSBBbiBvYmplY3Qgd2l0aCB0aGUgcGFyc2VkIHZhbHVlcy5cblx0ICovXG5cdFwicGFyc2VcIjogZnVuY3Rpb24odXJsLCBvcHQpIHtcblx0XHRcblx0XHRpZiAoIHR5cGVvZiBvcHQgPT0gXCJ1bmRlZmluZWRcIiApIG9wdCA9IHt9O1xuXHRcdFxuXHRcdHZhciBtZCA9IHVybC5tYXRjaChyZWdleCkgfHwgW107XG5cdFx0XG5cdFx0dmFyIHIgPSB7XG5cdFx0XHRcInVybFwiOiAgICB1cmwsXG5cdFx0XHRcblx0XHRcdFwic2NoZW1lXCI6IG1kWzFdLFxuXHRcdFx0XCJ1c2VyXCI6ICAgbWRbMl0sXG5cdFx0XHRcInBhc3NcIjogICBtZFszXSxcblx0XHRcdFwiaG9zdFwiOiAgIG1kWzRdLFxuXHRcdFx0XCJwb3J0XCI6ICAgbWRbNV0gJiYgK21kWzVdLFxuXHRcdFx0XCJwYXRoXCI6ICAgbWRbNl0sXG5cdFx0XHRcInF1ZXJ5XCI6ICBtZFs3XSxcblx0XHRcdFwiaGFzaFwiOiAgIG1kWzhdLFxuXHRcdH07XG5cdFx0XG5cdFx0aWYgKCBvcHQuZ2V0ICE9PSBmYWxzZSApXG5cdFx0XHRyW1wiZ2V0XCJdID0gcltcInF1ZXJ5XCJdICYmIHNlbGZbXCJnZXRcIl0ocltcInF1ZXJ5XCJdLCBvcHQuZ2V0KTtcblx0XHRcblx0XHRyZXR1cm4gcjtcblx0fSxcblx0XG5cdC8qKiBCdWlsZCBhIFVSTCBmcm9tIGNvbXBvbmVudHMuXG5cdCAqIFxuXHQgKiBUaGlzIHBpZWNlcyB0b2dldGhlciBhIHVybCBmcm9tIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBwYXNzZWQgaW4gb2JqZWN0LlxuXHQgKiBJbiBnZW5lcmFsIHBhc3NpbmcgdGhlIHJlc3VsdCBvZiBgcGFyc2UoKWAgc2hvdWxkIHJldHVybiB0aGUgVVJMLiAgVGhlcmVcblx0ICogbWF5IGRpZmZlcmVuY2VzIGluIHRoZSBnZXQgc3RyaW5nIGFzIHRoZSBrZXlzIGFuZCB2YWx1ZXMgbWlnaHQgYmUgbW9yZVxuXHQgKiBlbmNvZGVkIHRoZW4gdGhleSB3ZXJlIG9yaWdpbmFsbHkgd2VyZS4gIEhvd2V2ZXIsIGNhbGxpbmcgYGdldCgpYCBvbiB0aGVcblx0ICogdHdvIHZhbHVlcyBzaG91bGQgeWllbGQgdGhlIHNhbWUgcmVzdWx0LlxuXHQgKiBcblx0ICogSGVyZSBpcyBob3cgdGhlIHBhcmFtZXRlcnMgYXJlIHVzZWQuXG5cdCAqIFxuXHQgKiAgLSB1cmw6IFVzZWQgb25seSBpZiBubyBvdGhlciB2YWx1ZXMgYXJlIHByb3ZpZGVkLiAgSWYgdGhhdCBpcyB0aGUgY2FzZVxuXHQgKiAgICAgYHVybGAgd2lsbCBiZSByZXR1cm5lZCB2ZXJiYXRpbS5cblx0ICogIC0gc2NoZW1lOiBVc2VkIGlmIGRlZmluZWQuXG5cdCAqICAtIHVzZXI6IFVzZWQgaWYgZGVmaW5lZC5cblx0ICogIC0gcGFzczogVXNlZCBpZiBkZWZpbmVkLlxuXHQgKiAgLSBob3N0OiBVc2VkIGlmIGRlZmluZWQuXG5cdCAqICAtIHBhdGg6IFVzZWQgaWYgZGVmaW5lZC5cblx0ICogIC0gcXVlcnk6IFVzZWQgb25seSBpZiBgZ2V0YCBpcyBub3QgcHJvdmlkZWQgYW5kIG5vbi1lbXB0eS5cblx0ICogIC0gZ2V0OiBVc2VkIGlmIG5vbi1lbXB0eS4gIFBhc3NlZCB0byAjYnVpbGRnZXQgYW5kIHRoZSByZXN1bHQgaXMgdXNlZFxuXHQgKiAgICBhcyB0aGUgcXVlcnkgc3RyaW5nLlxuXHQgKiAgLSBoYXNoOiBVc2VkIGlmIGRlZmluZWQuXG5cdCAqIFxuXHQgKiBUaGVzZSBhcmUgdGhlIG9wdGlvbnMgdGhhdCBhcmUgdmFsaWQgb24gdGhlIG9wdGlvbnMgb2JqZWN0LlxuXHQgKiBcblx0ICogIC0gdXNlZW1wdHlnZXQ6IElmIHRydXRoeSwgYSBxdWVzdGlvbiBtYXJrIHdpbGwgYmUgYXBwZW5kZWQgZm9yIGVtcHR5IGdldFxuXHQgKiAgICBzdHJpbmdzLiAgVGhpcyBub3RhYmx5IG1ha2VzIGBidWlsZCgpYCBhbmQgYHBhcnNlKClgIGZ1bGx5IHN5bW1ldHJpYy5cblx0ICpcblx0ICogQHBhcmFte09iamVjdH0gZGF0YSBUaGUgcGllY2VzIG9mIHRoZSBVUkwuXG5cdCAqIEBwYXJhbXtPYmplY3R9IG9wdCBPcHRpb25zIGZvciBidWlsZGluZyB0aGUgdXJsLlxuXHQgKiBAcmV0dXJue3N0cmluZ30gVGhlIFVSTC5cblx0ICovXG5cdFwiYnVpbGRcIjogZnVuY3Rpb24oZGF0YSwgb3B0KXtcblx0XHRvcHQgPSBvcHQgfHwge307XG5cdFx0XG5cdFx0dmFyIHIgPSBcIlwiO1xuXHRcdFxuXHRcdGlmICggdHlwZW9mIGRhdGFbXCJzY2hlbWVcIl0gIT0gXCJ1bmRlZmluZWRcIiApXG5cdFx0e1xuXHRcdFx0ciArPSBkYXRhW1wic2NoZW1lXCJdO1xuXHRcdFx0ciArPSAobm9zbGFzaC5pbmRleE9mKGRhdGFbXCJzY2hlbWVcIl0pPj0wKT9cIjpcIjpcIjovL1wiO1xuXHRcdH1cblx0XHRpZiAoIHR5cGVvZiBkYXRhW1widXNlclwiXSAhPSBcInVuZGVmaW5lZFwiIClcblx0XHR7XG5cdFx0XHRyICs9IGRhdGFbXCJ1c2VyXCJdO1xuXHRcdFx0aWYgKCB0eXBlb2YgZGF0YVtcInBhc3NcIl0gPT0gXCJ1bmRlZmluZWRcIiApXG5cdFx0XHR7XG5cdFx0XHRcdHIgKz0gXCJAXCI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICggdHlwZW9mIGRhdGFbXCJwYXNzXCJdICE9IFwidW5kZWZpbmVkXCIgKSByICs9IFwiOlwiICsgZGF0YVtcInBhc3NcIl0gKyBcIkBcIjtcblx0XHRpZiAoIHR5cGVvZiBkYXRhW1wiaG9zdFwiXSAhPSBcInVuZGVmaW5lZFwiICkgciArPSBkYXRhW1wiaG9zdFwiXTtcblx0XHRpZiAoIHR5cGVvZiBkYXRhW1wicG9ydFwiXSAhPSBcInVuZGVmaW5lZFwiICkgciArPSBcIjpcIiArIGRhdGFbXCJwb3J0XCJdO1xuXHRcdGlmICggdHlwZW9mIGRhdGFbXCJwYXRoXCJdICE9IFwidW5kZWZpbmVkXCIgKSByICs9IGRhdGFbXCJwYXRoXCJdO1xuXHRcdFxuXHRcdGlmIChvcHRbXCJ1c2VlbXB0eWdldFwiXSlcblx0XHR7XG5cdFx0XHRpZiAgICAgICggdHlwZW9mIGRhdGFbXCJnZXRcIl0gICAhPSBcInVuZGVmaW5lZFwiICkgciArPSBcIj9cIiArIHNlbGZbXCJidWlsZGdldFwiXShkYXRhW1wiZ2V0XCJdKTtcblx0XHRcdGVsc2UgaWYgKCB0eXBlb2YgZGF0YVtcInF1ZXJ5XCJdICE9IFwidW5kZWZpbmVkXCIgKSByICs9IFwiP1wiICsgZGF0YVtcInF1ZXJ5XCJdO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0Ly8gSWYgLmdldCB1c2UgaXQuICBJZiAuZ2V0IGxlYWRzIHRvIGVtcHR5LCB1c2UgLnF1ZXJ5LlxuXHRcdFx0dmFyIHEgPSBkYXRhW1wiZ2V0XCJdICYmIHNlbGZbXCJidWlsZGdldFwiXShkYXRhW1wiZ2V0XCJdKSB8fCBkYXRhW1wicXVlcnlcIl07XG5cdFx0XHRpZiAocSkgciArPSBcIj9cIiArIHE7XG5cdFx0fVxuXHRcdFxuXHRcdGlmICggdHlwZW9mIGRhdGFbXCJoYXNoXCJdICE9IFwidW5kZWZpbmVkXCIgKSByICs9IFwiI1wiICsgZGF0YVtcImhhc2hcIl07XG5cdFx0XG5cdFx0cmV0dXJuIHIgfHwgZGF0YVtcInVybFwiXSB8fCBcIlwiO1xuXHR9LFxufTtcblxuaWYgKCB0eXBlb2YgZGVmaW5lICE9IFwidW5kZWZpbmVkXCIgJiYgZGVmaW5lW1wiYW1kXCJdICkgZGVmaW5lKHNlbGYpO1xuZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiApIG1vZHVsZVsnZXhwb3J0cyddID0gc2VsZjtcbmVsc2Ugd2luZG93W1widXJsXCJdID0gc2VsZjtcblxufSgpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3VybC5qcy91cmwuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtb2R1bGUpIHtcclxuXHRpZighbW9kdWxlLndlYnBhY2tQb2x5ZmlsbCkge1xyXG5cdFx0bW9kdWxlLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKCkge307XHJcblx0XHRtb2R1bGUucGF0aHMgPSBbXTtcclxuXHRcdC8vIG1vZHVsZS5wYXJlbnQgPSB1bmRlZmluZWQgYnkgZGVmYXVsdFxyXG5cdFx0bW9kdWxlLmNoaWxkcmVuID0gW107XHJcblx0XHRtb2R1bGUud2VicGFja1BvbHlmaWxsID0gMTtcclxuXHR9XHJcblx0cmV0dXJuIG1vZHVsZTtcclxufVxyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9tb2R1bGUuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHsgdGhyb3cgbmV3IEVycm9yKFwiZGVmaW5lIGNhbm5vdCBiZSB1c2VkIGluZGlyZWN0XCIpOyB9O1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9hbWQtZGVmaW5lLmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogTW9kdWxlIGZvciBtYW5hZ2luZyBtb2RhbCBwcm9tcHQgaW5zdGFuY2VzLlxuICogTk9URTogVGhpcyBtb2R1bGUgaXMgY3VycmVudGx5IGxpbWl0ZWQgaW4gYSBudW1iZXJcbiAqICAgICAgIG9mIHdheXMuIEZvciBvbmUsIGl0IG9ubHkgYWxsb3dzIHJhZGlvXG4gKiAgICAgICBpbnB1dCBvcHRpb25zLiBBZGRpdGlvbmFsbHksIGl0IGhhcmQtY29kZXMgaW5cbiAqICAgICAgIGEgbnVtYmVyIG9mIG90aGVyIGJlaGF2aW9ycyB3aGljaCBhcmUgc3BlY2lmaWNcbiAqICAgICAgIHRvIHRoZSBpbWFnZSBpbXBvcnQgc3R5bGUgcHJvbXB0IChmb3Igd2hpY2hcbiAqICAgICAgIHRoaXMgbW9kdWxlIHdhcyB3cml0dGVuKS5cbiAqICAgICAgIElmIGRlc2lyZWQsIHRoaXMgbW9kdWxlIG1heSBiZSBtYWRlIG1vcmVcbiAqICAgICAgIGdlbmVyYWwtcHVycG9zZSBpbiB0aGUgZnV0dXJlLCBidXQsIGZvciBub3csXG4gKiAgICAgICBiZSBhd2FyZSBvZiB0aGVzZSBsaW1pdGF0aW9ucy5cbiAqL1xuZGVmaW5lKFwiY3BvL21vZGFsLXByb21wdFwiLCBbXCJxXCJdLCBmdW5jdGlvbihRKSB7XG5cbiAgZnVuY3Rpb24gYXV0b0hpZ2hsaWdodEJveCh0ZXh0KSB7XG4gICAgdmFyIHRleHRCb3ggPSAkKFwiPGlucHV0IHR5cGU9J3RleHQnPlwiKS5hZGRDbGFzcyhcImF1dG8taGlnaGxpZ2h0XCIpO1xuICAgIHRleHRCb3guYXR0cihcInNpemVcIiwgdGV4dC5sZW5ndGgpO1xuICAgIHRleHRCb3guYXR0cihcImVkaXRhYmxlXCIsIGZhbHNlKTtcbiAgICB0ZXh0Qm94Lm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKSB7ICQodGhpcykuc2VsZWN0KCk7IH0pO1xuICAgIHRleHRCb3gub24oXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKCkgeyAkKHRoaXMpLnNlbGVjdCgpOyB9KTtcbiAgICB0ZXh0Qm94LnZhbCh0ZXh0KTtcbiAgICByZXR1cm4gdGV4dEJveDtcbiAgfVxuXG4gIC8vIEFsbG93cyBhc3luY2hyb25vdXMgcmVxdWVzdGluZyBvZiBwcm9tcHRzXG4gIHZhciBwcm9tcHRRdWV1ZSA9IFEoKTtcbiAgdmFyIHN0eWxlcyA9IFtcbiAgICBcInJhZGlvXCIsIFwidGlsZXNcIiwgXCJ0ZXh0XCIsIFwiY29weVRleHRcIiwgXCJjb25maXJtXCJcbiAgXTtcblxuICB3aW5kb3cubW9kYWxzID0gW107XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgYW4gb3B0aW9uIHRvIHByZXNlbnQgdGhlIHVzZXJcbiAgICogQHR5cGVkZWYge09iamVjdH0gTW9kYWxPcHRpb25cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byBzaG93IHRoZSB1c2VyIHdoaWNoXG4gICAgICAgICAgICAgICBkZXNjcmliZXMgdGhpcyBvcHRpb25cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHJldHVybiBpZiB0aGlzIG9wdGlvbiBpcyBjaG9zZW5cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IFtleGFtcGxlXSAtIEEgY29kZSBzbmlwcGV0IHRvIHNob3cgd2l0aCB0aGlzIG9wdGlvblxuICAgKi9cblxuICAvKipcbiAgICogQ29uc3RydWN0b3IgZm9yIG1vZGFsIHByb21wdHMuXG4gICAqIEBwYXJhbSB7TW9kYWxPcHRpb25bXX0gb3B0aW9ucyAtIFRoZSBvcHRpb25zIHRvIHByZXNlbnQgdGhlIHVzZXJcbiAgICovXG4gIGZ1bmN0aW9uIFByb21wdChvcHRpb25zKSB7XG4gICAgd2luZG93Lm1vZGFscy5wdXNoKHRoaXMpO1xuICAgIGlmICghb3B0aW9ucyB8fFxuICAgICAgICAoc3R5bGVzLmluZGV4T2Yob3B0aW9ucy5zdHlsZSkgPT09IC0xKSB8fFxuICAgICAgICAhb3B0aW9ucy5vcHRpb25zIHx8XG4gICAgICAgICh0eXBlb2Ygb3B0aW9ucy5vcHRpb25zLmxlbmd0aCAhPT0gXCJudW1iZXJcIikgfHwgKG9wdGlvbnMub3B0aW9ucy5sZW5ndGggPT09IDApKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIFByb21wdCBPcHRpb25zXCIsIG9wdGlvbnMpO1xuICAgIH1cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMubW9kYWwgPSAkKFwiI3Byb21wdE1vZGFsXCIpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuc3R5bGUgPT09IFwicmFkaW9cIikge1xuICAgICAgdGhpcy5lbHRzID0gJCgkLnBhcnNlSFRNTChcIjx0YWJsZT48L3RhYmxlPlwiKSkuYWRkQ2xhc3MoXCJjaG9pY2VDb250YWluZXJcIik7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuc3R5bGUgPT09IFwidGV4dFwiKSB7XG4gICAgICB0aGlzLmVsdHMgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJjaG9pY2VDb250YWluZXJcIik7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuc3R5bGUgPT09IFwiY29weVRleHRcIikge1xuICAgICAgdGhpcy5lbHRzID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiY2hvaWNlQ29udGFpbmVyXCIpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnN0eWxlID09PSBcImNvbmZpcm1cIikge1xuICAgICAgdGhpcy5lbHRzID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiY2hvaWNlQ29udGFpbmVyXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVsdHMgPSAkKCQucGFyc2VIVE1MKFwiPGRpdj48L2Rpdj5cIikpLmFkZENsYXNzKFwiY2hvaWNlQ29udGFpbmVyXCIpO1xuICAgIH1cbiAgICB0aGlzLnRpdGxlID0gJChcIi5tb2RhbC1oZWFkZXIgPiBoM1wiLCB0aGlzLm1vZGFsKTtcbiAgICB0aGlzLmNsb3NlQnV0dG9uID0gJChcIi5jbG9zZVwiLCB0aGlzLm1vZGFsKTtcbiAgICB0aGlzLnN1Ym1pdEJ1dHRvbiA9ICQoXCIuc3VibWl0XCIsIHRoaXMubW9kYWwpO1xuICAgIGlmKHRoaXMub3B0aW9ucy5zdWJtaXRUZXh0KSB7XG4gICAgICB0aGlzLnN1Ym1pdEJ1dHRvbi50ZXh0KHRoaXMub3B0aW9ucy5zdWJtaXRUZXh0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnN1Ym1pdEJ1dHRvbi50ZXh0KFwiU3VibWl0XCIpO1xuICAgIH1cbiAgICB0aGlzLmlzQ29tcGlsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHRoaXMucHJvbWlzZSA9IHRoaXMuZGVmZXJyZWQucHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUeXBlIGZvciBoYW5kbGVycyBvZiByZXNwb25zZXMgZnJvbSBtb2RhbCBwcm9tcHRzXG4gICAqIEBjYWxsYmFjayBwcm9tcHRDYWxsYmFja1xuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVzcCAtIFRoZSByZXNwb25zZSBmcm9tIHRoZSB1c2VyXG4gICAqL1xuXG4gIC8qKlxuICAgKiBTaG93cyB0aGlzIHByb21wdCB0byB0aGUgdXNlciAod2lsbCB3YWl0IHVudGlsIGFueSBhY3RpdmVcbiAgICogcHJvbXB0cyBoYXZlIGZpbmlzaGVkKVxuICAgKiBAcGFyYW0ge3Byb21wdENhbGxiYWNrfSBbY2FsbGJhY2tdIC0gT3B0aW9uYWwgY2FsbGJhY2sgd2hpY2ggaXMgcGFzc2VkIHRoZVxuICAgKiAgICAgICAgcmVzdWx0IG9mIHRoZSBwcm9tcHRcbiAgICogQHJldHVybnMgQSBwcm9taXNlIHJlc29sdmluZyB0byBlaXRoZXIgdGhlIHJlc3VsdCBvZiBgY2FsbGJhY2tgLCBpZiBwcm92aWRlZCxcbiAgICogICAgICAgICAgb3IgdGhlIHJlc3VsdCBvZiB0aGUgcHJvbXB0LCBvdGhlcndpc2UuXG4gICAqL1xuICBQcm9tcHQucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIC8vIFVzZSB0aGUgcHJvbWlzZSBxdWV1ZSB0byBtYWtlIHN1cmUgdGhlcmUncyBubyBvdGhlclxuICAgIC8vIHByb21wdCBiZWluZyBzaG93biBjdXJyZW50bHlcbiAgICBpZiAodGhpcy5vcHRpb25zLmhpZGVTdWJtaXQpIHtcbiAgICAgIHRoaXMuc3VibWl0QnV0dG9uLmhpZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdWJtaXRCdXR0b24uc2hvdygpO1xuICAgIH1cbiAgICB0aGlzLmNsb3NlQnV0dG9uLmNsaWNrKHRoaXMub25DbG9zZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnN1Ym1pdEJ1dHRvbi5jbGljayh0aGlzLm9uU3VibWl0LmJpbmQodGhpcykpO1xuICAgIHZhciBkb2NDbGljayA9IChmdW5jdGlvbihlKSB7XG4gICAgICAvLyBJZiB0aGUgcHJvbXB0IGlzIGFjdGl2ZSBhbmQgdGhlIGJhY2tncm91bmQgaXMgY2xpY2tlZCxcbiAgICAgIC8vIHRoZW4gY2xvc2UuXG4gICAgICBpZiAoJChlLnRhcmdldCkuaXModGhpcy5tb2RhbCkgJiYgdGhpcy5kZWZlcnJlZCkge1xuICAgICAgICB0aGlzLm9uQ2xvc2UoZSk7XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZihcImNsaWNrXCIsIGRvY0NsaWNrKTtcbiAgICAgIH1cbiAgICB9KS5iaW5kKHRoaXMpO1xuICAgICQoZG9jdW1lbnQpLmNsaWNrKGRvY0NsaWNrKTtcbiAgICB2YXIgZG9jS2V5ZG93biA9IChmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgICAgdGhpcy5vbkNsb3NlKGUpO1xuICAgICAgICAkKGRvY3VtZW50KS5vZmYoXCJrZXlkb3duXCIsIGRvY0tleWRvd24pO1xuICAgICAgfVxuICAgIH0pLmJpbmQodGhpcyk7XG4gICAgJChkb2N1bWVudCkua2V5ZG93bihkb2NLZXlkb3duKTtcbiAgICB0aGlzLnRpdGxlLnRleHQodGhpcy5vcHRpb25zLnRpdGxlKTtcbiAgICB0aGlzLnBvcHVsYXRlTW9kYWwoKTtcbiAgICB0aGlzLm1vZGFsLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9taXNlLnRoZW4oY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuXG4gIC8qKlxuICAgKiBDbGVhcnMgdGhlIGNvbnRlbnRzIG9mIHRoZSBtb2RhbCBwcm9tcHQuXG4gICAqL1xuICBQcm9tcHQucHJvdG90eXBlLmNsZWFyTW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN1Ym1pdEJ1dHRvbi5vZmYoKTtcbiAgICB0aGlzLmNsb3NlQnV0dG9uLm9mZigpO1xuICAgIHRoaXMuZWx0cy5lbXB0eSgpO1xuICB9O1xuICBcbiAgLyoqXG4gICAqIFBvcHVsYXRlcyB0aGUgY29udGVudHMgb2YgdGhlIG1vZGFsIHByb21wdCB3aXRoIHRoZVxuICAgKiBvcHRpb25zIGluIHRoaXMgcHJvbXB0LlxuICAgKi9cbiAgUHJvbXB0LnByb3RvdHlwZS5wb3B1bGF0ZU1vZGFsID0gZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gY3JlYXRlUmFkaW9FbHQob3B0aW9uLCBpZHgpIHtcbiAgICAgIHZhciBlbHQgPSAkKCQucGFyc2VIVE1MKFwiPGlucHV0IG5hbWU9XFxcInB5cmV0LW1vZGFsXFxcIiB0eXBlPVxcXCJyYWRpb1xcXCI+XCIpKTtcbiAgICAgIHZhciBpZCA9IFwiclwiICsgaWR4LnRvU3RyaW5nKCk7XG4gICAgICB2YXIgbGFiZWwgPSAkKCQucGFyc2VIVE1MKFwiPGxhYmVsIGZvcj1cXFwiXCIgKyBpZCArIFwiXFxcIj48L2xhYmVsPlwiKSk7XG4gICAgICBlbHQuYXR0cihcImlkXCIsIGlkKTtcbiAgICAgIGVsdC5hdHRyKFwidmFsdWVcIiwgb3B0aW9uLnZhbHVlKTtcbiAgICAgIGxhYmVsLnRleHQob3B0aW9uLm1lc3NhZ2UpO1xuICAgICAgdmFyIGVsdENvbnRhaW5lciA9ICQoJC5wYXJzZUhUTUwoXCI8dGQgY2xhc3M9XFxcInB5cmV0LW1vZGFsLW9wdGlvbi1yYWRpb1xcXCI+PC90ZD5cIikpO1xuICAgICAgZWx0Q29udGFpbmVyLmFwcGVuZChlbHQpO1xuICAgICAgdmFyIGxhYmVsQ29udGFpbmVyID0gJCgkLnBhcnNlSFRNTChcIjx0ZCBjbGFzcz1cXFwicHlyZXQtbW9kYWwtb3B0aW9uLW1lc3NhZ2VcXFwiPjwvdGQ+XCIpKTtcbiAgICAgIGxhYmVsQ29udGFpbmVyLmFwcGVuZChsYWJlbCk7XG4gICAgICB2YXIgY29udGFpbmVyID0gJCgkLnBhcnNlSFRNTChcIjx0ciBjbGFzcz1cXFwicHlyZXQtbW9kYWwtb3B0aW9uXFxcIj48L3RyPlwiKSk7XG4gICAgICBjb250YWluZXIuYXBwZW5kKGVsdENvbnRhaW5lcik7XG4gICAgICBjb250YWluZXIuYXBwZW5kKGxhYmVsQ29udGFpbmVyKTtcbiAgICAgIGlmIChvcHRpb24uZXhhbXBsZSkge1xuICAgICAgICB2YXIgZXhhbXBsZSA9ICQoJC5wYXJzZUhUTUwoXCI8ZGl2PjwvZGl2PlwiKSk7XG4gICAgICAgIHZhciBjbSA9IENvZGVNaXJyb3IoZXhhbXBsZVswXSwge1xuICAgICAgICAgIHZhbHVlOiBvcHRpb24uZXhhbXBsZSxcbiAgICAgICAgICBtb2RlOiAncHlyZXQnLFxuICAgICAgICAgIGxpbmVOdW1iZXJzOiBmYWxzZSxcbiAgICAgICAgICByZWFkT25seTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGNtLnJlZnJlc2goKTtcbiAgICAgICAgfSwgMSk7XG4gICAgICAgIHZhciBleGFtcGxlQ29udGFpbmVyID0gJCgkLnBhcnNlSFRNTChcIjx0ZCBjbGFzcz1cXFwicHlyZXQtbW9kYWwtb3B0aW9uLWV4YW1wbGVcXFwiPjwvdGQ+XCIpKTtcbiAgICAgICAgZXhhbXBsZUNvbnRhaW5lci5hcHBlbmQoZXhhbXBsZSk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmQoZXhhbXBsZUNvbnRhaW5lcik7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiBjb250YWluZXI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZVRpbGVFbHQob3B0aW9uLCBpZHgpIHtcbiAgICAgIHZhciBlbHQgPSAkKCQucGFyc2VIVE1MKFwiPGJ1dHRvbiBuYW1lPVxcXCJweXJldC1tb2RhbFxcXCIgY2xhc3M9XFxcInRpbGVcXFwiPjwvYnV0dG9uPlwiKSk7XG4gICAgICBlbHQuYXR0cihcImlkXCIsIFwidFwiICsgaWR4LnRvU3RyaW5nKCkpO1xuICAgICAgZWx0LmFwcGVuZCgkKFwiPGI+XCIpLnRleHQob3B0aW9uLm1lc3NhZ2UpKVxuICAgICAgICAuYXBwZW5kKCQoXCI8cD5cIikudGV4dChvcHRpb24uZGV0YWlscykpO1xuICAgICAgZm9yICh2YXIgZXZ0IGluIG9wdGlvbi5vbilcbiAgICAgICAgZWx0Lm9uKGV2dCwgb3B0aW9uLm9uW2V2dF0pO1xuICAgICAgcmV0dXJuIGVsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVUZXh0RWx0KG9wdGlvbikge1xuICAgICAgdmFyIGVsdCA9ICQoXCI8ZGl2PlwiKTtcbiAgICAgIGVsdC5hcHBlbmQoJChcIjxzcGFuPlwiKS5hZGRDbGFzcyhcInRleHRMYWJlbFwiKS50ZXh0KG9wdGlvbi5tZXNzYWdlKSk7XG4vLyAgICAgIGVsdC5hcHBlbmQoJChcIjxzcGFuPlwiKS50ZXh0KFwiKFwiICsgb3B0aW9uLmRldGFpbHMgKyBcIilcIikpO1xuICAgICAgZWx0LmFwcGVuZCgkKFwiPGlucHV0IHR5cGU9J3RleHQnPlwiKS52YWwob3B0aW9uLmRlZmF1bHRWYWx1ZSkpO1xuICAgICAgcmV0dXJuIGVsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVDb3B5VGV4dEVsdChvcHRpb24pIHtcbiAgICAgIHZhciBlbHQgPSAkKFwiPGRpdj5cIik7XG4gICAgICBlbHQuYXBwZW5kKCQoXCI8cD5cIikuYWRkQ2xhc3MoXCJ0ZXh0TGFiZWxcIikudGV4dChvcHRpb24ubWVzc2FnZSkpO1xuICAgICAgaWYob3B0aW9uLnRleHQpIHtcbiAgICAgICAgdmFyIGJveCA9IGF1dG9IaWdobGlnaHRCb3gob3B0aW9uLnRleHQpO1xuICAvLyAgICAgIGVsdC5hcHBlbmQoJChcIjxzcGFuPlwiKS50ZXh0KFwiKFwiICsgb3B0aW9uLmRldGFpbHMgKyBcIilcIikpO1xuICAgICAgICBlbHQuYXBwZW5kKGJveCk7XG4gICAgICAgIGJveC5mb2N1cygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVDb25maXJtRWx0KG9wdGlvbikge1xuICAgICAgcmV0dXJuICQoXCI8cD5cIikudGV4dChvcHRpb24ubWVzc2FnZSk7XG4gICAgfVxuXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlRWx0KG9wdGlvbiwgaSkge1xuICAgICAgaWYodGhhdC5vcHRpb25zLnN0eWxlID09PSBcInJhZGlvXCIpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVJhZGlvRWx0KG9wdGlvbiwgaSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHRoYXQub3B0aW9ucy5zdHlsZSA9PT0gXCJ0aWxlc1wiKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVUaWxlRWx0KG9wdGlvbiwgaSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHRoYXQub3B0aW9ucy5zdHlsZSA9PT0gXCJ0ZXh0XCIpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVRleHRFbHQob3B0aW9uKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodGhhdC5vcHRpb25zLnN0eWxlID09PSBcImNvcHlUZXh0XCIpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUNvcHlUZXh0RWx0KG9wdGlvbik7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHRoYXQub3B0aW9ucy5zdHlsZSA9PT0gXCJjb25maXJtXCIpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUNvbmZpcm1FbHQob3B0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgb3B0aW9uRWx0cztcbiAgICAvLyBDYWNoZSByZXN1bHRzXG4vLyAgICBpZiAodHJ1ZSkge1xuICAgICAgb3B0aW9uRWx0cyA9IHRoaXMub3B0aW9ucy5vcHRpb25zLm1hcChjcmVhdGVFbHQpO1xuLy8gICAgICB0aGlzLmNvbXBpbGVkRWx0cyA9IG9wdGlvbkVsdHM7XG4vLyAgICAgIHRoaXMuaXNDb21waWxlZCA9IHRydWU7XG4vLyAgICB9IGVsc2Uge1xuLy8gICAgICBvcHRpb25FbHRzID0gdGhpcy5jb21waWxlZEVsdHM7XG4vLyAgICB9XG4gICAgJChcImlucHV0W3R5cGU9J3JhZGlvJ11cIiwgb3B0aW9uRWx0c1swXSkuYXR0cignY2hlY2tlZCcsIHRydWUpO1xuICAgIHRoaXMuZWx0cy5hcHBlbmQob3B0aW9uRWx0cyk7XG4gICAgJChcIi5tb2RhbC1ib2R5XCIsIHRoaXMubW9kYWwpLmVtcHR5KCkuYXBwZW5kKHRoaXMuZWx0cyk7XG4gICAgb3B0aW9uRWx0c1swXS5mb2N1cygpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGVyIHdoaWNoIGlzIGNhbGxlZCB3aGVuIHRoZSB1c2VyIGRvZXMgbm90IHNlbGVjdCBhbnl0aGluZ1xuICAgKi9cbiAgUHJvbXB0LnByb3RvdHlwZS5vbkNsb3NlID0gZnVuY3Rpb24oZSkge1xuICAgIHRoaXMubW9kYWwuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICB0aGlzLmNsZWFyTW9kYWwoKTtcbiAgICB0aGlzLmRlZmVycmVkLnJlc29sdmUobnVsbCk7XG4gICAgZGVsZXRlIHRoaXMuZGVmZXJyZWQ7XG4gICAgZGVsZXRlIHRoaXMucHJvbWlzZTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlciB3aGljaCBpcyBjYWxsZWQgd2hlbiB0aGUgdXNlciBwcmVzc2VzIFwic3VibWl0XCJcbiAgICovXG4gIFByb21wdC5wcm90b3R5cGUub25TdWJtaXQgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYodGhpcy5vcHRpb25zLnN0eWxlID09PSBcInJhZGlvXCIpIHtcbiAgICAgIHZhciByZXR2YWwgPSAkKFwiaW5wdXRbdHlwZT0ncmFkaW8nXTpjaGVja2VkXCIsIHRoaXMubW9kYWwpLnZhbCgpO1xuICAgIH1cbiAgICBlbHNlIGlmKHRoaXMub3B0aW9ucy5zdHlsZSA9PT0gXCJ0ZXh0XCIpIHtcbiAgICAgIHZhciByZXR2YWwgPSAkKFwiaW5wdXRbdHlwZT0ndGV4dCddXCIsIHRoaXMubW9kYWwpLnZhbCgpO1xuICAgIH1cbiAgICBlbHNlIGlmKHRoaXMub3B0aW9ucy5zdHlsZSA9PT0gXCJjb3B5VGV4dFwiKSB7XG4gICAgICB2YXIgcmV0dmFsID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSBpZih0aGlzLm9wdGlvbnMuc3R5bGUgPT09IFwiY29uZmlybVwiKSB7XG4gICAgICB2YXIgcmV0dmFsID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXIgcmV0dmFsID0gdHJ1ZTsgLy8gSnVzdCByZXR1cm4gdHJ1ZSBpZiB0aGV5IGNsaWNrZWQgc3VibWl0XG4gICAgfVxuICAgIHRoaXMubW9kYWwuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICB0aGlzLmNsZWFyTW9kYWwoKTtcbiAgICB0aGlzLmRlZmVycmVkLnJlc29sdmUocmV0dmFsKTtcbiAgICBkZWxldGUgdGhpcy5kZWZlcnJlZDtcbiAgICBkZWxldGUgdGhpcy5wcm9taXNlO1xuICB9O1xuXG4gIHJldHVybiBQcm9tcHQ7XG5cbn0pO1xuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvd2ViL2pzL21vZGFsLXByb21wdC5qcyIsIi8vIHZpbTp0cz00OnN0cz00OnN3PTQ6XG4vKiFcbiAqXG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEyIEtyaXMgS293YWwgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVRcbiAqIGxpY2Vuc2UgZm91bmQgYXQgaHR0cDovL2dpdGh1Yi5jb20va3Jpc2tvd2FsL3EvcmF3L21hc3Rlci9MSUNFTlNFXG4gKlxuICogV2l0aCBwYXJ0cyBieSBUeWxlciBDbG9zZVxuICogQ29weXJpZ2h0IDIwMDctMjAwOSBUeWxlciBDbG9zZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIE1JVCBYIGxpY2Vuc2UgZm91bmRcbiAqIGF0IGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UuaHRtbFxuICogRm9ya2VkIGF0IHJlZl9zZW5kLmpzIHZlcnNpb246IDIwMDktMDUtMTFcbiAqXG4gKiBXaXRoIHBhcnRzIGJ5IE1hcmsgTWlsbGVyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTEgR29vZ2xlIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKi9cblxuKGZ1bmN0aW9uIChkZWZpbml0aW9uKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvLyBUaGlzIGZpbGUgd2lsbCBmdW5jdGlvbiBwcm9wZXJseSBhcyBhIDxzY3JpcHQ+IHRhZywgb3IgYSBtb2R1bGVcbiAgICAvLyB1c2luZyBDb21tb25KUyBhbmQgTm9kZUpTIG9yIFJlcXVpcmVKUyBtb2R1bGUgZm9ybWF0cy4gIEluXG4gICAgLy8gQ29tbW9uL05vZGUvUmVxdWlyZUpTLCB0aGUgbW9kdWxlIGV4cG9ydHMgdGhlIFEgQVBJIGFuZCB3aGVuXG4gICAgLy8gZXhlY3V0ZWQgYXMgYSBzaW1wbGUgPHNjcmlwdD4sIGl0IGNyZWF0ZXMgYSBRIGdsb2JhbCBpbnN0ZWFkLlxuXG4gICAgLy8gTW9udGFnZSBSZXF1aXJlXG4gICAgaWYgKHR5cGVvZiBib290c3RyYXAgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBib290c3RyYXAoXCJwcm9taXNlXCIsIGRlZmluaXRpb24pO1xuXG4gICAgLy8gQ29tbW9uSlNcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKCk7XG5cbiAgICAvLyBSZXF1aXJlSlNcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShkZWZpbml0aW9uKTtcblxuICAgIC8vIFNFUyAoU2VjdXJlIEVjbWFTY3JpcHQpXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VzICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmICghc2VzLm9rKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlcy5tYWtlUSA9IGRlZmluaXRpb247XG4gICAgICAgIH1cblxuICAgIC8vIDxzY3JpcHQ+XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIC8vIFByZWZlciB3aW5kb3cgb3ZlciBzZWxmIGZvciBhZGQtb24gc2NyaXB0cy4gVXNlIHNlbGYgZm9yXG4gICAgICAgIC8vIG5vbi13aW5kb3dlZCBjb250ZXh0cy5cbiAgICAgICAgdmFyIGdsb2JhbCA9IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBzZWxmO1xuXG4gICAgICAgIC8vIEdldCB0aGUgYHdpbmRvd2Agb2JqZWN0LCBzYXZlIHRoZSBwcmV2aW91cyBRIGdsb2JhbFxuICAgICAgICAvLyBhbmQgaW5pdGlhbGl6ZSBRIGFzIGEgZ2xvYmFsLlxuICAgICAgICB2YXIgcHJldmlvdXNRID0gZ2xvYmFsLlE7XG4gICAgICAgIGdsb2JhbC5RID0gZGVmaW5pdGlvbigpO1xuXG4gICAgICAgIC8vIEFkZCBhIG5vQ29uZmxpY3QgZnVuY3Rpb24gc28gUSBjYW4gYmUgcmVtb3ZlZCBmcm9tIHRoZVxuICAgICAgICAvLyBnbG9iYWwgbmFtZXNwYWNlLlxuICAgICAgICBnbG9iYWwuUS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZ2xvYmFsLlEgPSBwcmV2aW91c1E7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgZW52aXJvbm1lbnQgd2FzIG5vdCBhbnRpY2lwYXRlZCBieSBRLiBQbGVhc2UgZmlsZSBhIGJ1Zy5cIik7XG4gICAgfVxuXG59KShmdW5jdGlvbiAoKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGhhc1N0YWNrcyA9IGZhbHNlO1xudHJ5IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbn0gY2F0Y2ggKGUpIHtcbiAgICBoYXNTdGFja3MgPSAhIWUuc3RhY2s7XG59XG5cbi8vIEFsbCBjb2RlIGFmdGVyIHRoaXMgcG9pbnQgd2lsbCBiZSBmaWx0ZXJlZCBmcm9tIHN0YWNrIHRyYWNlcyByZXBvcnRlZFxuLy8gYnkgUS5cbnZhciBxU3RhcnRpbmdMaW5lID0gY2FwdHVyZUxpbmUoKTtcbnZhciBxRmlsZU5hbWU7XG5cbi8vIHNoaW1zXG5cbi8vIHVzZWQgZm9yIGZhbGxiYWNrIGluIFwiYWxsUmVzb2x2ZWRcIlxudmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7fTtcblxuLy8gVXNlIHRoZSBmYXN0ZXN0IHBvc3NpYmxlIG1lYW5zIHRvIGV4ZWN1dGUgYSB0YXNrIGluIGEgZnV0dXJlIHR1cm5cbi8vIG9mIHRoZSBldmVudCBsb29wLlxudmFyIG5leHRUaWNrID0oZnVuY3Rpb24gKCkge1xuICAgIC8vIGxpbmtlZCBsaXN0IG9mIHRhc2tzIChzaW5nbGUsIHdpdGggaGVhZCBub2RlKVxuICAgIHZhciBoZWFkID0ge3Rhc2s6IHZvaWQgMCwgbmV4dDogbnVsbH07XG4gICAgdmFyIHRhaWwgPSBoZWFkO1xuICAgIHZhciBmbHVzaGluZyA9IGZhbHNlO1xuICAgIHZhciByZXF1ZXN0VGljayA9IHZvaWQgMDtcbiAgICB2YXIgaXNOb2RlSlMgPSBmYWxzZTtcbiAgICAvLyBxdWV1ZSBmb3IgbGF0ZSB0YXNrcywgdXNlZCBieSB1bmhhbmRsZWQgcmVqZWN0aW9uIHRyYWNraW5nXG4gICAgdmFyIGxhdGVyUXVldWUgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgICAgICAvKiBqc2hpbnQgbG9vcGZ1bmM6IHRydWUgKi9cbiAgICAgICAgdmFyIHRhc2ssIGRvbWFpbjtcblxuICAgICAgICB3aGlsZSAoaGVhZC5uZXh0KSB7XG4gICAgICAgICAgICBoZWFkID0gaGVhZC5uZXh0O1xuICAgICAgICAgICAgdGFzayA9IGhlYWQudGFzaztcbiAgICAgICAgICAgIGhlYWQudGFzayA9IHZvaWQgMDtcbiAgICAgICAgICAgIGRvbWFpbiA9IGhlYWQuZG9tYWluO1xuXG4gICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgaGVhZC5kb21haW4gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgZG9tYWluLmVudGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBydW5TaW5nbGUodGFzaywgZG9tYWluKTtcblxuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChsYXRlclF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgdGFzayA9IGxhdGVyUXVldWUucG9wKCk7XG4gICAgICAgICAgICBydW5TaW5nbGUodGFzayk7XG4gICAgICAgIH1cbiAgICAgICAgZmx1c2hpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgLy8gcnVucyBhIHNpbmdsZSBmdW5jdGlvbiBpbiB0aGUgYXN5bmMgcXVldWVcbiAgICBmdW5jdGlvbiBydW5TaW5nbGUodGFzaywgZG9tYWluKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0YXNrKCk7XG5cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGlzTm9kZUpTKSB7XG4gICAgICAgICAgICAgICAgLy8gSW4gbm9kZSwgdW5jYXVnaHQgZXhjZXB0aW9ucyBhcmUgY29uc2lkZXJlZCBmYXRhbCBlcnJvcnMuXG4gICAgICAgICAgICAgICAgLy8gUmUtdGhyb3cgdGhlbSBzeW5jaHJvbm91c2x5IHRvIGludGVycnVwdCBmbHVzaGluZyFcblxuICAgICAgICAgICAgICAgIC8vIEVuc3VyZSBjb250aW51YXRpb24gaWYgdGhlIHVuY2F1Z2h0IGV4Y2VwdGlvbiBpcyBzdXBwcmVzc2VkXG4gICAgICAgICAgICAgICAgLy8gbGlzdGVuaW5nIFwidW5jYXVnaHRFeGNlcHRpb25cIiBldmVudHMgKGFzIGRvbWFpbnMgZG9lcykuXG4gICAgICAgICAgICAgICAgLy8gQ29udGludWUgaW4gbmV4dCBldmVudCB0byBhdm9pZCB0aWNrIHJlY3Vyc2lvbi5cbiAgICAgICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbi5leGl0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgICAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluLmVudGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJbiBicm93c2VycywgdW5jYXVnaHQgZXhjZXB0aW9ucyBhcmUgbm90IGZhdGFsLlxuICAgICAgICAgICAgICAgIC8vIFJlLXRocm93IHRoZW0gYXN5bmNocm9ub3VzbHkgdG8gYXZvaWQgc2xvdy1kb3ducy5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgIGRvbWFpbi5leGl0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZXh0VGljayA9IGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgIHRhaWwgPSB0YWlsLm5leHQgPSB7XG4gICAgICAgICAgICB0YXNrOiB0YXNrLFxuICAgICAgICAgICAgZG9tYWluOiBpc05vZGVKUyAmJiBwcm9jZXNzLmRvbWFpbixcbiAgICAgICAgICAgIG5leHQ6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoIWZsdXNoaW5nKSB7XG4gICAgICAgICAgICBmbHVzaGluZyA9IHRydWU7XG4gICAgICAgICAgICByZXF1ZXN0VGljaygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICBwcm9jZXNzLnRvU3RyaW5nKCkgPT09IFwiW29iamVjdCBwcm9jZXNzXVwiICYmIHByb2Nlc3MubmV4dFRpY2spIHtcbiAgICAgICAgLy8gRW5zdXJlIFEgaXMgaW4gYSByZWFsIE5vZGUgZW52aXJvbm1lbnQsIHdpdGggYSBgcHJvY2Vzcy5uZXh0VGlja2AuXG4gICAgICAgIC8vIFRvIHNlZSB0aHJvdWdoIGZha2UgTm9kZSBlbnZpcm9ubWVudHM6XG4gICAgICAgIC8vICogTW9jaGEgdGVzdCBydW5uZXIgLSBleHBvc2VzIGEgYHByb2Nlc3NgIGdsb2JhbCB3aXRob3V0IGEgYG5leHRUaWNrYFxuICAgICAgICAvLyAqIEJyb3dzZXJpZnkgLSBleHBvc2VzIGEgYHByb2Nlc3MubmV4VGlja2AgZnVuY3Rpb24gdGhhdCB1c2VzXG4gICAgICAgIC8vICAgYHNldFRpbWVvdXRgLiBJbiB0aGlzIGNhc2UgYHNldEltbWVkaWF0ZWAgaXMgcHJlZmVycmVkIGJlY2F1c2VcbiAgICAgICAgLy8gICAgaXQgaXMgZmFzdGVyLiBCcm93c2VyaWZ5J3MgYHByb2Nlc3MudG9TdHJpbmcoKWAgeWllbGRzXG4gICAgICAgIC8vICAgXCJbb2JqZWN0IE9iamVjdF1cIiwgd2hpbGUgaW4gYSByZWFsIE5vZGUgZW52aXJvbm1lbnRcbiAgICAgICAgLy8gICBgcHJvY2Vzcy5uZXh0VGljaygpYCB5aWVsZHMgXCJbb2JqZWN0IHByb2Nlc3NdXCIuXG4gICAgICAgIGlzTm9kZUpTID0gdHJ1ZTtcblxuICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgICAgICB9O1xuXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgLy8gSW4gSUUxMCwgTm9kZS5qcyAwLjkrLCBvciBodHRwczovL2dpdGh1Yi5jb20vTm9ibGVKUy9zZXRJbW1lZGlhdGVcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gc2V0SW1tZWRpYXRlLmJpbmQod2luZG93LCBmbHVzaCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoZmx1c2gpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLy8gbW9kZXJuIGJyb3dzZXJzXG4gICAgICAgIC8vIGh0dHA6Ly93d3cubm9uYmxvY2tpbmcuaW8vMjAxMS8wNi93aW5kb3duZXh0dGljay5odG1sXG4gICAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICAgIC8vIEF0IGxlYXN0IFNhZmFyaSBWZXJzaW9uIDYuMC41ICg4NTM2LjMwLjEpIGludGVybWl0dGVudGx5IGNhbm5vdCBjcmVhdGVcbiAgICAgICAgLy8gd29ya2luZyBtZXNzYWdlIHBvcnRzIHRoZSBmaXJzdCB0aW1lIGEgcGFnZSBsb2Fkcy5cbiAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXF1ZXN0VGljayA9IHJlcXVlc3RQb3J0VGljaztcbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZmx1c2g7XG4gICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgcmVxdWVzdFBvcnRUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gT3BlcmEgcmVxdWlyZXMgdXMgdG8gcHJvdmlkZSBhIG1lc3NhZ2UgcGF5bG9hZCwgcmVnYXJkbGVzcyBvZlxuICAgICAgICAgICAgLy8gd2hldGhlciB3ZSB1c2UgaXQuXG4gICAgICAgICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgICAgICAgICAgcmVxdWVzdFBvcnRUaWNrKCk7XG4gICAgICAgIH07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBvbGQgYnJvd3NlcnNcbiAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gcnVucyBhIHRhc2sgYWZ0ZXIgYWxsIG90aGVyIHRhc2tzIGhhdmUgYmVlbiBydW5cbiAgICAvLyB0aGlzIGlzIHVzZWZ1bCBmb3IgdW5oYW5kbGVkIHJlamVjdGlvbiB0cmFja2luZyB0aGF0IG5lZWRzIHRvIGhhcHBlblxuICAgIC8vIGFmdGVyIGFsbCBgdGhlbmBkIHRhc2tzIGhhdmUgYmVlbiBydW4uXG4gICAgbmV4dFRpY2sucnVuQWZ0ZXIgPSBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICBsYXRlclF1ZXVlLnB1c2godGFzayk7XG4gICAgICAgIGlmICghZmx1c2hpbmcpIHtcbiAgICAgICAgICAgIGZsdXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBuZXh0VGljaztcbn0pKCk7XG5cbi8vIEF0dGVtcHQgdG8gbWFrZSBnZW5lcmljcyBzYWZlIGluIHRoZSBmYWNlIG9mIGRvd25zdHJlYW1cbi8vIG1vZGlmaWNhdGlvbnMuXG4vLyBUaGVyZSBpcyBubyBzaXR1YXRpb24gd2hlcmUgdGhpcyBpcyBuZWNlc3NhcnkuXG4vLyBJZiB5b3UgbmVlZCBhIHNlY3VyaXR5IGd1YXJhbnRlZSwgdGhlc2UgcHJpbW9yZGlhbHMgbmVlZCB0byBiZVxuLy8gZGVlcGx5IGZyb3plbiBhbnl3YXksIGFuZCBpZiB5b3UgZG9u4oCZdCBuZWVkIGEgc2VjdXJpdHkgZ3VhcmFudGVlLFxuLy8gdGhpcyBpcyBqdXN0IHBsYWluIHBhcmFub2lkLlxuLy8gSG93ZXZlciwgdGhpcyAqKm1pZ2h0KiogaGF2ZSB0aGUgbmljZSBzaWRlLWVmZmVjdCBvZiByZWR1Y2luZyB0aGUgc2l6ZSBvZlxuLy8gdGhlIG1pbmlmaWVkIGNvZGUgYnkgcmVkdWNpbmcgeC5jYWxsKCkgdG8gbWVyZWx5IHgoKVxuLy8gU2VlIE1hcmsgTWlsbGVy4oCZcyBleHBsYW5hdGlvbiBvZiB3aGF0IHRoaXMgZG9lcy5cbi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWNvbnZlbnRpb25zOnNhZmVfbWV0YV9wcm9ncmFtbWluZ1xudmFyIGNhbGwgPSBGdW5jdGlvbi5jYWxsO1xuZnVuY3Rpb24gdW5jdXJyeVRoaXMoZikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBjYWxsLmFwcGx5KGYsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cbi8vIFRoaXMgaXMgZXF1aXZhbGVudCwgYnV0IHNsb3dlcjpcbi8vIHVuY3VycnlUaGlzID0gRnVuY3Rpb25fYmluZC5iaW5kKEZ1bmN0aW9uX2JpbmQuY2FsbCk7XG4vLyBodHRwOi8vanNwZXJmLmNvbS91bmN1cnJ5dGhpc1xuXG52YXIgYXJyYXlfc2xpY2UgPSB1bmN1cnJ5VGhpcyhBcnJheS5wcm90b3R5cGUuc2xpY2UpO1xuXG52YXIgYXJyYXlfcmVkdWNlID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLnJlZHVjZSB8fCBmdW5jdGlvbiAoY2FsbGJhY2ssIGJhc2lzKSB7XG4gICAgICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgICAgICBsZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgICAgICAgLy8gY29uY2VybmluZyB0aGUgaW5pdGlhbCB2YWx1ZSwgaWYgb25lIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgLy8gc2VlayB0byB0aGUgZmlyc3QgdmFsdWUgaW4gdGhlIGFycmF5LCBhY2NvdW50aW5nXG4gICAgICAgICAgICAvLyBmb3IgdGhlIHBvc3NpYmlsaXR5IHRoYXQgaXMgaXMgYSBzcGFyc2UgYXJyYXlcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggaW4gdGhpcykge1xuICAgICAgICAgICAgICAgICAgICBiYXNpcyA9IHRoaXNbaW5kZXgrK107XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoKytpbmRleCA+PSBsZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gd2hpbGUgKDEpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlZHVjZVxuICAgICAgICBmb3IgKDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIC8vIGFjY291bnQgZm9yIHRoZSBwb3NzaWJpbGl0eSB0aGF0IHRoZSBhcnJheSBpcyBzcGFyc2VcbiAgICAgICAgICAgIGlmIChpbmRleCBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgYmFzaXMgPSBjYWxsYmFjayhiYXNpcywgdGhpc1tpbmRleF0sIGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzaXM7XG4gICAgfVxuKTtcblxudmFyIGFycmF5X2luZGV4T2YgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiB8fCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbm90IGEgdmVyeSBnb29kIHNoaW0sIGJ1dCBnb29kIGVub3VnaCBmb3Igb3VyIG9uZSB1c2Ugb2YgaXRcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpc1tpXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuKTtcblxudmFyIGFycmF5X21hcCA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5tYXAgfHwgZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzcCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBjb2xsZWN0ID0gW107XG4gICAgICAgIGFycmF5X3JlZHVjZShzZWxmLCBmdW5jdGlvbiAodW5kZWZpbmVkLCB2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIGNvbGxlY3QucHVzaChjYWxsYmFjay5jYWxsKHRoaXNwLCB2YWx1ZSwgaW5kZXgsIHNlbGYpKTtcbiAgICAgICAgfSwgdm9pZCAwKTtcbiAgICAgICAgcmV0dXJuIGNvbGxlY3Q7XG4gICAgfVxuKTtcblxudmFyIG9iamVjdF9jcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIChwcm90b3R5cGUpIHtcbiAgICBmdW5jdGlvbiBUeXBlKCkgeyB9XG4gICAgVHlwZS5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgcmV0dXJuIG5ldyBUeXBlKCk7XG59O1xuXG52YXIgb2JqZWN0X2hhc093blByb3BlcnR5ID0gdW5jdXJyeVRoaXMoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSk7XG5cbnZhciBvYmplY3Rfa2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKG9iamVjdF9oYXNPd25Qcm9wZXJ0eShvYmplY3QsIGtleSkpIHtcbiAgICAgICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufTtcblxudmFyIG9iamVjdF90b1N0cmluZyA9IHVuY3VycnlUaGlzKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcpO1xuXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gT2JqZWN0KHZhbHVlKTtcbn1cblxuLy8gZ2VuZXJhdG9yIHJlbGF0ZWQgc2hpbXNcblxuLy8gRklYTUU6IFJlbW92ZSB0aGlzIGZ1bmN0aW9uIG9uY2UgRVM2IGdlbmVyYXRvcnMgYXJlIGluIFNwaWRlck1vbmtleS5cbmZ1bmN0aW9uIGlzU3RvcEl0ZXJhdGlvbihleGNlcHRpb24pIHtcbiAgICByZXR1cm4gKFxuICAgICAgICBvYmplY3RfdG9TdHJpbmcoZXhjZXB0aW9uKSA9PT0gXCJbb2JqZWN0IFN0b3BJdGVyYXRpb25dXCIgfHxcbiAgICAgICAgZXhjZXB0aW9uIGluc3RhbmNlb2YgUVJldHVyblZhbHVlXG4gICAgKTtcbn1cblxuLy8gRklYTUU6IFJlbW92ZSB0aGlzIGhlbHBlciBhbmQgUS5yZXR1cm4gb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW5cbi8vIFNwaWRlck1vbmtleS5cbnZhciBRUmV0dXJuVmFsdWU7XG5pZiAodHlwZW9mIFJldHVyblZhbHVlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgUVJldHVyblZhbHVlID0gUmV0dXJuVmFsdWU7XG59IGVsc2Uge1xuICAgIFFSZXR1cm5WYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfTtcbn1cblxuLy8gbG9uZyBzdGFjayB0cmFjZXNcblxudmFyIFNUQUNLX0pVTVBfU0VQQVJBVE9SID0gXCJGcm9tIHByZXZpb3VzIGV2ZW50OlwiO1xuXG5mdW5jdGlvbiBtYWtlU3RhY2tUcmFjZUxvbmcoZXJyb3IsIHByb21pc2UpIHtcbiAgICAvLyBJZiBwb3NzaWJsZSwgdHJhbnNmb3JtIHRoZSBlcnJvciBzdGFjayB0cmFjZSBieSByZW1vdmluZyBOb2RlIGFuZCBRXG4gICAgLy8gY3J1ZnQsIHRoZW4gY29uY2F0ZW5hdGluZyB3aXRoIHRoZSBzdGFjayB0cmFjZSBvZiBgcHJvbWlzZWAuIFNlZSAjNTcuXG4gICAgaWYgKGhhc1N0YWNrcyAmJlxuICAgICAgICBwcm9taXNlLnN0YWNrICYmXG4gICAgICAgIHR5cGVvZiBlcnJvciA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICBlcnJvciAhPT0gbnVsbCAmJlxuICAgICAgICBlcnJvci5zdGFjayAmJlxuICAgICAgICBlcnJvci5zdGFjay5pbmRleE9mKFNUQUNLX0pVTVBfU0VQQVJBVE9SKSA9PT0gLTFcbiAgICApIHtcbiAgICAgICAgdmFyIHN0YWNrcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBwID0gcHJvbWlzZTsgISFwOyBwID0gcC5zb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChwLnN0YWNrKSB7XG4gICAgICAgICAgICAgICAgc3RhY2tzLnVuc2hpZnQocC5zdGFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3RhY2tzLnVuc2hpZnQoZXJyb3Iuc3RhY2spO1xuXG4gICAgICAgIHZhciBjb25jYXRlZFN0YWNrcyA9IHN0YWNrcy5qb2luKFwiXFxuXCIgKyBTVEFDS19KVU1QX1NFUEFSQVRPUiArIFwiXFxuXCIpO1xuICAgICAgICBlcnJvci5zdGFjayA9IGZpbHRlclN0YWNrU3RyaW5nKGNvbmNhdGVkU3RhY2tzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZpbHRlclN0YWNrU3RyaW5nKHN0YWNrU3RyaW5nKSB7XG4gICAgdmFyIGxpbmVzID0gc3RhY2tTdHJpbmcuc3BsaXQoXCJcXG5cIik7XG4gICAgdmFyIGRlc2lyZWRMaW5lcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tpXTtcblxuICAgICAgICBpZiAoIWlzSW50ZXJuYWxGcmFtZShsaW5lKSAmJiAhaXNOb2RlRnJhbWUobGluZSkgJiYgbGluZSkge1xuICAgICAgICAgICAgZGVzaXJlZExpbmVzLnB1c2gobGluZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlc2lyZWRMaW5lcy5qb2luKFwiXFxuXCIpO1xufVxuXG5mdW5jdGlvbiBpc05vZGVGcmFtZShzdGFja0xpbmUpIHtcbiAgICByZXR1cm4gc3RhY2tMaW5lLmluZGV4T2YoXCIobW9kdWxlLmpzOlwiKSAhPT0gLTEgfHxcbiAgICAgICAgICAgc3RhY2tMaW5lLmluZGV4T2YoXCIobm9kZS5qczpcIikgIT09IC0xO1xufVxuXG5mdW5jdGlvbiBnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIoc3RhY2tMaW5lKSB7XG4gICAgLy8gTmFtZWQgZnVuY3Rpb25zOiBcImF0IGZ1bmN0aW9uTmFtZSAoZmlsZW5hbWU6bGluZU51bWJlcjpjb2x1bW5OdW1iZXIpXCJcbiAgICAvLyBJbiBJRTEwIGZ1bmN0aW9uIG5hbWUgY2FuIGhhdmUgc3BhY2VzIChcIkFub255bW91cyBmdW5jdGlvblwiKSBPX29cbiAgICB2YXIgYXR0ZW1wdDEgPSAvYXQgLisgXFwoKC4rKTooXFxkKyk6KD86XFxkKylcXCkkLy5leGVjKHN0YWNrTGluZSk7XG4gICAgaWYgKGF0dGVtcHQxKSB7XG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDFbMV0sIE51bWJlcihhdHRlbXB0MVsyXSldO1xuICAgIH1cblxuICAgIC8vIEFub255bW91cyBmdW5jdGlvbnM6IFwiYXQgZmlsZW5hbWU6bGluZU51bWJlcjpjb2x1bW5OdW1iZXJcIlxuICAgIHZhciBhdHRlbXB0MiA9IC9hdCAoW14gXSspOihcXGQrKTooPzpcXGQrKSQvLmV4ZWMoc3RhY2tMaW5lKTtcbiAgICBpZiAoYXR0ZW1wdDIpIHtcbiAgICAgICAgcmV0dXJuIFthdHRlbXB0MlsxXSwgTnVtYmVyKGF0dGVtcHQyWzJdKV07XG4gICAgfVxuXG4gICAgLy8gRmlyZWZveCBzdHlsZTogXCJmdW5jdGlvbkBmaWxlbmFtZTpsaW5lTnVtYmVyIG9yIEBmaWxlbmFtZTpsaW5lTnVtYmVyXCJcbiAgICB2YXIgYXR0ZW1wdDMgPSAvLipAKC4rKTooXFxkKykkLy5leGVjKHN0YWNrTGluZSk7XG4gICAgaWYgKGF0dGVtcHQzKSB7XG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDNbMV0sIE51bWJlcihhdHRlbXB0M1syXSldO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNJbnRlcm5hbEZyYW1lKHN0YWNrTGluZSkge1xuICAgIHZhciBmaWxlTmFtZUFuZExpbmVOdW1iZXIgPSBnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIoc3RhY2tMaW5lKTtcblxuICAgIGlmICghZmlsZU5hbWVBbmRMaW5lTnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgZmlsZU5hbWUgPSBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMF07XG4gICAgdmFyIGxpbmVOdW1iZXIgPSBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMV07XG5cbiAgICByZXR1cm4gZmlsZU5hbWUgPT09IHFGaWxlTmFtZSAmJlxuICAgICAgICBsaW5lTnVtYmVyID49IHFTdGFydGluZ0xpbmUgJiZcbiAgICAgICAgbGluZU51bWJlciA8PSBxRW5kaW5nTGluZTtcbn1cblxuLy8gZGlzY292ZXIgb3duIGZpbGUgbmFtZSBhbmQgbGluZSBudW1iZXIgcmFuZ2UgZm9yIGZpbHRlcmluZyBzdGFja1xuLy8gdHJhY2VzXG5mdW5jdGlvbiBjYXB0dXJlTGluZSgpIHtcbiAgICBpZiAoIWhhc1N0YWNrcykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB2YXIgbGluZXMgPSBlLnN0YWNrLnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICB2YXIgZmlyc3RMaW5lID0gbGluZXNbMF0uaW5kZXhPZihcIkBcIikgPiAwID8gbGluZXNbMV0gOiBsaW5lc1syXTtcbiAgICAgICAgdmFyIGZpbGVOYW1lQW5kTGluZU51bWJlciA9IGdldEZpbGVOYW1lQW5kTGluZU51bWJlcihmaXJzdExpbmUpO1xuICAgICAgICBpZiAoIWZpbGVOYW1lQW5kTGluZU51bWJlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcUZpbGVOYW1lID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzBdO1xuICAgICAgICByZXR1cm4gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzFdO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZGVwcmVjYXRlKGNhbGxiYWNrLCBuYW1lLCBhbHRlcm5hdGl2ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgICAgICAgdHlwZW9mIGNvbnNvbGUud2FybiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4obmFtZSArIFwiIGlzIGRlcHJlY2F0ZWQsIHVzZSBcIiArIGFsdGVybmF0aXZlICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpbnN0ZWFkLlwiLCBuZXcgRXJyb3IoXCJcIikuc3RhY2spO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseShjYWxsYmFjaywgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuXG4vLyBlbmQgb2Ygc2hpbXNcbi8vIGJlZ2lubmluZyBvZiByZWFsIHdvcmtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgcHJvbWlzZSBmb3IgYW4gaW1tZWRpYXRlIHJlZmVyZW5jZSwgcGFzc2VzIHByb21pc2VzIHRocm91Z2gsIG9yXG4gKiBjb2VyY2VzIHByb21pc2VzIGZyb20gZGlmZmVyZW50IHN5c3RlbXMuXG4gKiBAcGFyYW0gdmFsdWUgaW1tZWRpYXRlIHJlZmVyZW5jZSBvciBwcm9taXNlXG4gKi9cbmZ1bmN0aW9uIFEodmFsdWUpIHtcbiAgICAvLyBJZiB0aGUgb2JqZWN0IGlzIGFscmVhZHkgYSBQcm9taXNlLCByZXR1cm4gaXQgZGlyZWN0bHkuICBUaGlzIGVuYWJsZXNcbiAgICAvLyB0aGUgcmVzb2x2ZSBmdW5jdGlvbiB0byBib3RoIGJlIHVzZWQgdG8gY3JlYXRlZCByZWZlcmVuY2VzIGZyb20gb2JqZWN0cyxcbiAgICAvLyBidXQgdG8gdG9sZXJhYmx5IGNvZXJjZSBub24tcHJvbWlzZXMgdG8gcHJvbWlzZXMuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgLy8gYXNzaW1pbGF0ZSB0aGVuYWJsZXNcbiAgICBpZiAoaXNQcm9taXNlQWxpa2UodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBjb2VyY2UodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmdWxmaWxsKHZhbHVlKTtcbiAgICB9XG59XG5RLnJlc29sdmUgPSBRO1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgdGFzayBpbiBhIGZ1dHVyZSB0dXJuIG9mIHRoZSBldmVudCBsb29wLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdGFza1xuICovXG5RLm5leHRUaWNrID0gbmV4dFRpY2s7XG5cbi8qKlxuICogQ29udHJvbHMgd2hldGhlciBvciBub3QgbG9uZyBzdGFjayB0cmFjZXMgd2lsbCBiZSBvblxuICovXG5RLmxvbmdTdGFja1N1cHBvcnQgPSBmYWxzZTtcblxuLy8gZW5hYmxlIGxvbmcgc3RhY2tzIGlmIFFfREVCVUcgaXMgc2V0XG5pZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgcHJvY2VzcyAmJiBwcm9jZXNzLmVudiAmJiBwcm9jZXNzLmVudi5RX0RFQlVHKSB7XG4gICAgUS5sb25nU3RhY2tTdXBwb3J0ID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEge3Byb21pc2UsIHJlc29sdmUsIHJlamVjdH0gb2JqZWN0LlxuICpcbiAqIGByZXNvbHZlYCBpcyBhIGNhbGxiYWNrIHRvIGludm9rZSB3aXRoIGEgbW9yZSByZXNvbHZlZCB2YWx1ZSBmb3IgdGhlXG4gKiBwcm9taXNlLiBUbyBmdWxmaWxsIHRoZSBwcm9taXNlLCBpbnZva2UgYHJlc29sdmVgIHdpdGggYW55IHZhbHVlIHRoYXQgaXNcbiAqIG5vdCBhIHRoZW5hYmxlLiBUbyByZWplY3QgdGhlIHByb21pc2UsIGludm9rZSBgcmVzb2x2ZWAgd2l0aCBhIHJlamVjdGVkXG4gKiB0aGVuYWJsZSwgb3IgaW52b2tlIGByZWplY3RgIHdpdGggdGhlIHJlYXNvbiBkaXJlY3RseS4gVG8gcmVzb2x2ZSB0aGVcbiAqIHByb21pc2UgdG8gYW5vdGhlciB0aGVuYWJsZSwgdGh1cyBwdXR0aW5nIGl0IGluIHRoZSBzYW1lIHN0YXRlLCBpbnZva2VcbiAqIGByZXNvbHZlYCB3aXRoIHRoYXQgb3RoZXIgdGhlbmFibGUuXG4gKi9cblEuZGVmZXIgPSBkZWZlcjtcbmZ1bmN0aW9uIGRlZmVyKCkge1xuICAgIC8vIGlmIFwibWVzc2FnZXNcIiBpcyBhbiBcIkFycmF5XCIsIHRoYXQgaW5kaWNhdGVzIHRoYXQgdGhlIHByb21pc2UgaGFzIG5vdCB5ZXRcbiAgICAvLyBiZWVuIHJlc29sdmVkLiAgSWYgaXQgaXMgXCJ1bmRlZmluZWRcIiwgaXQgaGFzIGJlZW4gcmVzb2x2ZWQuICBFYWNoXG4gICAgLy8gZWxlbWVudCBvZiB0aGUgbWVzc2FnZXMgYXJyYXkgaXMgaXRzZWxmIGFuIGFycmF5IG9mIGNvbXBsZXRlIGFyZ3VtZW50cyB0b1xuICAgIC8vIGZvcndhcmQgdG8gdGhlIHJlc29sdmVkIHByb21pc2UuICBXZSBjb2VyY2UgdGhlIHJlc29sdXRpb24gdmFsdWUgdG8gYVxuICAgIC8vIHByb21pc2UgdXNpbmcgdGhlIGByZXNvbHZlYCBmdW5jdGlvbiBiZWNhdXNlIGl0IGhhbmRsZXMgYm90aCBmdWxseVxuICAgIC8vIG5vbi10aGVuYWJsZSB2YWx1ZXMgYW5kIG90aGVyIHRoZW5hYmxlcyBncmFjZWZ1bGx5LlxuICAgIHZhciBtZXNzYWdlcyA9IFtdLCBwcm9ncmVzc0xpc3RlbmVycyA9IFtdLCByZXNvbHZlZFByb21pc2U7XG5cbiAgICB2YXIgZGVmZXJyZWQgPSBvYmplY3RfY3JlYXRlKGRlZmVyLnByb3RvdHlwZSk7XG4gICAgdmFyIHByb21pc2UgPSBvYmplY3RfY3JlYXRlKFByb21pc2UucHJvdG90eXBlKTtcblxuICAgIHByb21pc2UucHJvbWlzZURpc3BhdGNoID0gZnVuY3Rpb24gKHJlc29sdmUsIG9wLCBvcGVyYW5kcykge1xuICAgICAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgICAgIGlmIChtZXNzYWdlcykge1xuICAgICAgICAgICAgbWVzc2FnZXMucHVzaChhcmdzKTtcbiAgICAgICAgICAgIGlmIChvcCA9PT0gXCJ3aGVuXCIgJiYgb3BlcmFuZHNbMV0pIHsgLy8gcHJvZ3Jlc3Mgb3BlcmFuZFxuICAgICAgICAgICAgICAgIHByb2dyZXNzTGlzdGVuZXJzLnB1c2gob3BlcmFuZHNbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRQcm9taXNlLnByb21pc2VEaXNwYXRjaC5hcHBseShyZXNvbHZlZFByb21pc2UsIGFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gWFhYIGRlcHJlY2F0ZWRcbiAgICBwcm9taXNlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChtZXNzYWdlcykge1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5lYXJlclZhbHVlID0gbmVhcmVyKHJlc29sdmVkUHJvbWlzZSk7XG4gICAgICAgIGlmIChpc1Byb21pc2UobmVhcmVyVmFsdWUpKSB7XG4gICAgICAgICAgICByZXNvbHZlZFByb21pc2UgPSBuZWFyZXJWYWx1ZTsgLy8gc2hvcnRlbiBjaGFpblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZWFyZXJWYWx1ZTtcbiAgICB9O1xuXG4gICAgcHJvbWlzZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwicGVuZGluZ1wiIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc29sdmVkUHJvbWlzZS5pbnNwZWN0KCk7XG4gICAgfTtcblxuICAgIGlmIChRLmxvbmdTdGFja1N1cHBvcnQgJiYgaGFzU3RhY2tzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gTk9URTogZG9uJ3QgdHJ5IHRvIHVzZSBgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2VgIG9yIHRyYW5zZmVyIHRoZVxuICAgICAgICAgICAgLy8gYWNjZXNzb3IgYXJvdW5kOyB0aGF0IGNhdXNlcyBtZW1vcnkgbGVha3MgYXMgcGVyIEdILTExMS4gSnVzdFxuICAgICAgICAgICAgLy8gcmVpZnkgdGhlIHN0YWNrIHRyYWNlIGFzIGEgc3RyaW5nIEFTQVAuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gQXQgdGhlIHNhbWUgdGltZSwgY3V0IG9mZiB0aGUgZmlyc3QgbGluZTsgaXQncyBhbHdheXMganVzdFxuICAgICAgICAgICAgLy8gXCJbb2JqZWN0IFByb21pc2VdXFxuXCIsIGFzIHBlciB0aGUgYHRvU3RyaW5nYC5cbiAgICAgICAgICAgIHByb21pc2Uuc3RhY2sgPSBlLnN0YWNrLnN1YnN0cmluZyhlLnN0YWNrLmluZGV4T2YoXCJcXG5cIikgKyAxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE5PVEU6IHdlIGRvIHRoZSBjaGVja3MgZm9yIGByZXNvbHZlZFByb21pc2VgIGluIGVhY2ggbWV0aG9kLCBpbnN0ZWFkIG9mXG4gICAgLy8gY29uc29saWRhdGluZyB0aGVtIGludG8gYGJlY29tZWAsIHNpbmNlIG90aGVyd2lzZSB3ZSdkIGNyZWF0ZSBuZXdcbiAgICAvLyBwcm9taXNlcyB3aXRoIHRoZSBsaW5lcyBgYmVjb21lKHdoYXRldmVyKHZhbHVlKSlgLiBTZWUgZS5nLiBHSC0yNTIuXG5cbiAgICBmdW5jdGlvbiBiZWNvbWUobmV3UHJvbWlzZSkge1xuICAgICAgICByZXNvbHZlZFByb21pc2UgPSBuZXdQcm9taXNlO1xuICAgICAgICBwcm9taXNlLnNvdXJjZSA9IG5ld1Byb21pc2U7XG5cbiAgICAgICAgYXJyYXlfcmVkdWNlKG1lc3NhZ2VzLCBmdW5jdGlvbiAodW5kZWZpbmVkLCBtZXNzYWdlKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXdQcm9taXNlLnByb21pc2VEaXNwYXRjaC5hcHBseShuZXdQcm9taXNlLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB2b2lkIDApO1xuXG4gICAgICAgIG1lc3NhZ2VzID0gdm9pZCAwO1xuICAgICAgICBwcm9ncmVzc0xpc3RlbmVycyA9IHZvaWQgMDtcbiAgICB9XG5cbiAgICBkZWZlcnJlZC5wcm9taXNlID0gcHJvbWlzZTtcbiAgICBkZWZlcnJlZC5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJlY29tZShRKHZhbHVlKSk7XG4gICAgfTtcblxuICAgIGRlZmVycmVkLmZ1bGZpbGwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKGZ1bGZpbGwodmFsdWUpKTtcbiAgICB9O1xuICAgIGRlZmVycmVkLnJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKHJlamVjdChyZWFzb24pKTtcbiAgICB9O1xuICAgIGRlZmVycmVkLm5vdGlmeSA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhcnJheV9yZWR1Y2UocHJvZ3Jlc3NMaXN0ZW5lcnMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb2dyZXNzTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzTGlzdGVuZXIocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgfTtcblxuICAgIHJldHVybiBkZWZlcnJlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgTm9kZS1zdHlsZSBjYWxsYmFjayB0aGF0IHdpbGwgcmVzb2x2ZSBvciByZWplY3QgdGhlIGRlZmVycmVkXG4gKiBwcm9taXNlLlxuICogQHJldHVybnMgYSBub2RlYmFja1xuICovXG5kZWZlci5wcm90b3R5cGUubWFrZU5vZGVSZXNvbHZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlcnJvciwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBzZWxmLnJlamVjdChlcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZShhcnJheV9zbGljZShhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuLyoqXG4gKiBAcGFyYW0gcmVzb2x2ZXIge0Z1bmN0aW9ufSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBub3RoaW5nIGFuZCBhY2NlcHRzXG4gKiB0aGUgcmVzb2x2ZSwgcmVqZWN0LCBhbmQgbm90aWZ5IGZ1bmN0aW9ucyBmb3IgYSBkZWZlcnJlZC5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IG1heSBiZSByZXNvbHZlZCB3aXRoIHRoZSBnaXZlbiByZXNvbHZlIGFuZCByZWplY3RcbiAqIGZ1bmN0aW9ucywgb3IgcmVqZWN0ZWQgYnkgYSB0aHJvd24gZXhjZXB0aW9uIGluIHJlc29sdmVyXG4gKi9cblEuUHJvbWlzZSA9IHByb21pc2U7IC8vIEVTNlxuUS5wcm9taXNlID0gcHJvbWlzZTtcbmZ1bmN0aW9uIHByb21pc2UocmVzb2x2ZXIpIHtcbiAgICBpZiAodHlwZW9mIHJlc29sdmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcInJlc29sdmVyIG11c3QgYmUgYSBmdW5jdGlvbi5cIik7XG4gICAgfVxuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0LCBkZWZlcnJlZC5ub3RpZnkpO1xuICAgIH0gY2F0Y2ggKHJlYXNvbikge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbnByb21pc2UucmFjZSA9IHJhY2U7IC8vIEVTNlxucHJvbWlzZS5hbGwgPSBhbGw7IC8vIEVTNlxucHJvbWlzZS5yZWplY3QgPSByZWplY3Q7IC8vIEVTNlxucHJvbWlzZS5yZXNvbHZlID0gUTsgLy8gRVM2XG5cbi8vIFhYWCBleHBlcmltZW50YWwuICBUaGlzIG1ldGhvZCBpcyBhIHdheSB0byBkZW5vdGUgdGhhdCBhIGxvY2FsIHZhbHVlIGlzXG4vLyBzZXJpYWxpemFibGUgYW5kIHNob3VsZCBiZSBpbW1lZGlhdGVseSBkaXNwYXRjaGVkIHRvIGEgcmVtb3RlIHVwb24gcmVxdWVzdCxcbi8vIGluc3RlYWQgb2YgcGFzc2luZyBhIHJlZmVyZW5jZS5cblEucGFzc0J5Q29weSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAvL2ZyZWV6ZShvYmplY3QpO1xuICAgIC8vcGFzc0J5Q29waWVzLnNldChvYmplY3QsIHRydWUpO1xuICAgIHJldHVybiBvYmplY3Q7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5wYXNzQnlDb3B5ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vZnJlZXplKG9iamVjdCk7XG4gICAgLy9wYXNzQnlDb3BpZXMuc2V0KG9iamVjdCwgdHJ1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIElmIHR3byBwcm9taXNlcyBldmVudHVhbGx5IGZ1bGZpbGwgdG8gdGhlIHNhbWUgdmFsdWUsIHByb21pc2VzIHRoYXQgdmFsdWUsXG4gKiBidXQgb3RoZXJ3aXNlIHJlamVjdHMuXG4gKiBAcGFyYW0geCB7QW55Kn1cbiAqIEBwYXJhbSB5IHtBbnkqfVxuICogQHJldHVybnMge0FueSp9IGEgcHJvbWlzZSBmb3IgeCBhbmQgeSBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgYnV0IGEgcmVqZWN0aW9uXG4gKiBvdGhlcndpc2UuXG4gKlxuICovXG5RLmpvaW4gPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgIHJldHVybiBRKHgpLmpvaW4oeSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24gKHRoYXQpIHtcbiAgICByZXR1cm4gUShbdGhpcywgdGhhdF0pLnNwcmVhZChmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICBpZiAoeCA9PT0geSkge1xuICAgICAgICAgICAgLy8gVE9ETzogXCI9PT1cIiBzaG91bGQgYmUgT2JqZWN0LmlzIG9yIGVxdWl2XG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGpvaW46IG5vdCB0aGUgc2FtZTogXCIgKyB4ICsgXCIgXCIgKyB5KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIGZpcnN0IG9mIGFuIGFycmF5IG9mIHByb21pc2VzIHRvIGJlY29tZSBzZXR0bGVkLlxuICogQHBhcmFtIGFuc3dlcnMge0FycmF5W0FueSpdfSBwcm9taXNlcyB0byByYWNlXG4gKiBAcmV0dXJucyB7QW55Kn0gdGhlIGZpcnN0IHByb21pc2UgdG8gYmUgc2V0dGxlZFxuICovXG5RLnJhY2UgPSByYWNlO1xuZnVuY3Rpb24gcmFjZShhbnN3ZXJQcykge1xuICAgIHJldHVybiBwcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgLy8gU3dpdGNoIHRvIHRoaXMgb25jZSB3ZSBjYW4gYXNzdW1lIGF0IGxlYXN0IEVTNVxuICAgICAgICAvLyBhbnN3ZXJQcy5mb3JFYWNoKGZ1bmN0aW9uIChhbnN3ZXJQKSB7XG4gICAgICAgIC8vICAgICBRKGFuc3dlclApLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIFVzZSB0aGlzIGluIHRoZSBtZWFudGltZVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYW5zd2VyUHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIFEoYW5zd2VyUHNbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5yYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oUS5yYWNlKTtcbn07XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIFByb21pc2Ugd2l0aCBhIHByb21pc2UgZGVzY3JpcHRvciBvYmplY3QgYW5kIG9wdGlvbmFsIGZhbGxiYWNrXG4gKiBmdW5jdGlvbi4gIFRoZSBkZXNjcmlwdG9yIGNvbnRhaW5zIG1ldGhvZHMgbGlrZSB3aGVuKHJlamVjdGVkKSwgZ2V0KG5hbWUpLFxuICogc2V0KG5hbWUsIHZhbHVlKSwgcG9zdChuYW1lLCBhcmdzKSwgYW5kIGRlbGV0ZShuYW1lKSwgd2hpY2ggYWxsXG4gKiByZXR1cm4gZWl0aGVyIGEgdmFsdWUsIGEgcHJvbWlzZSBmb3IgYSB2YWx1ZSwgb3IgYSByZWplY3Rpb24uICBUaGUgZmFsbGJhY2tcbiAqIGFjY2VwdHMgdGhlIG9wZXJhdGlvbiBuYW1lLCBhIHJlc29sdmVyLCBhbmQgYW55IGZ1cnRoZXIgYXJndW1lbnRzIHRoYXQgd291bGRcbiAqIGhhdmUgYmVlbiBmb3J3YXJkZWQgdG8gdGhlIGFwcHJvcHJpYXRlIG1ldGhvZCBhYm92ZSBoYWQgYSBtZXRob2QgYmVlblxuICogcHJvdmlkZWQgd2l0aCB0aGUgcHJvcGVyIG5hbWUuICBUaGUgQVBJIG1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgdGhlIG5hdHVyZVxuICogb2YgdGhlIHJldHVybmVkIG9iamVjdCwgYXBhcnQgZnJvbSB0aGF0IGl0IGlzIHVzYWJsZSB3aGVyZWV2ZXIgcHJvbWlzZXMgYXJlXG4gKiBib3VnaHQgYW5kIHNvbGQuXG4gKi9cblEubWFrZVByb21pc2UgPSBQcm9taXNlO1xuZnVuY3Rpb24gUHJvbWlzZShkZXNjcmlwdG9yLCBmYWxsYmFjaywgaW5zcGVjdCkge1xuICAgIGlmIChmYWxsYmFjayA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGZhbGxiYWNrID0gZnVuY3Rpb24gKG9wKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBcIlByb21pc2UgZG9lcyBub3Qgc3VwcG9ydCBvcGVyYXRpb246IFwiICsgb3BcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoaW5zcGVjdCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge3N0YXRlOiBcInVua25vd25cIn07XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2UgPSBvYmplY3RfY3JlYXRlKFByb21pc2UucHJvdG90eXBlKTtcblxuICAgIHByb21pc2UucHJvbWlzZURpc3BhdGNoID0gZnVuY3Rpb24gKHJlc29sdmUsIG9wLCBhcmdzKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRvcltvcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBkZXNjcmlwdG9yW29wXS5hcHBseShwcm9taXNlLCBhcmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsbGJhY2suY2FsbChwcm9taXNlLCBvcCwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBpbnNwZWN0O1xuXG4gICAgLy8gWFhYIGRlcHJlY2F0ZWQgYHZhbHVlT2ZgIGFuZCBgZXhjZXB0aW9uYCBzdXBwb3J0XG4gICAgaWYgKGluc3BlY3QpIHtcbiAgICAgICAgdmFyIGluc3BlY3RlZCA9IGluc3BlY3QoKTtcbiAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XG4gICAgICAgICAgICBwcm9taXNlLmV4Y2VwdGlvbiA9IGluc3BlY3RlZC5yZWFzb247XG4gICAgICAgIH1cblxuICAgICAgICBwcm9taXNlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5zcGVjdGVkID0gaW5zcGVjdCgpO1xuICAgICAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJwZW5kaW5nXCIgfHxcbiAgICAgICAgICAgICAgICBpbnNwZWN0ZWQuc3RhdGUgPT09IFwicmVqZWN0ZWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGluc3BlY3RlZC52YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBQcm9taXNlXVwiO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIGRvbmUgPSBmYWxzZTsgICAvLyBlbnN1cmUgdGhlIHVudHJ1c3RlZCBwcm9taXNlIG1ha2VzIGF0IG1vc3QgYVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luZ2xlIGNhbGwgdG8gb25lIG9mIHRoZSBjYWxsYmFja3NcblxuICAgIGZ1bmN0aW9uIF9mdWxmaWxsZWQodmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgZnVsZmlsbGVkID09PSBcImZ1bmN0aW9uXCIgPyBmdWxmaWxsZWQodmFsdWUpIDogdmFsdWU7XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlamVjdGVkKGV4Y2VwdGlvbikge1xuICAgICAgICBpZiAodHlwZW9mIHJlamVjdGVkID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIG1ha2VTdGFja1RyYWNlTG9uZyhleGNlcHRpb24sIHNlbGYpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0ZWQoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKG5ld0V4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3RXhjZXB0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Byb2dyZXNzZWQodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBwcm9ncmVzc2VkID09PSBcImZ1bmN0aW9uXCIgPyBwcm9ncmVzc2VkKHZhbHVlKSA6IHZhbHVlO1xuICAgIH1cblxuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnByb21pc2VEaXNwYXRjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoX2Z1bGZpbGxlZCh2YWx1ZSkpO1xuICAgICAgICB9LCBcIndoZW5cIiwgW2Z1bmN0aW9uIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoX3JlamVjdGVkKGV4Y2VwdGlvbikpO1xuICAgICAgICB9XSk7XG4gICAgfSk7XG5cbiAgICAvLyBQcm9ncmVzcyBwcm9wYWdhdG9yIG5lZWQgdG8gYmUgYXR0YWNoZWQgaW4gdGhlIGN1cnJlbnQgdGljay5cbiAgICBzZWxmLnByb21pc2VEaXNwYXRjaCh2b2lkIDAsIFwid2hlblwiLCBbdm9pZCAwLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlO1xuICAgICAgICB2YXIgdGhyZXcgPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG5ld1ZhbHVlID0gX3Byb2dyZXNzZWQodmFsdWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJldyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoUS5vbmVycm9yKSB7XG4gICAgICAgICAgICAgICAgUS5vbmVycm9yKGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aHJldykge1xuICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuUS50YXAgPSBmdW5jdGlvbiAocHJvbWlzZSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gUShwcm9taXNlKS50YXAoY2FsbGJhY2spO1xufTtcblxuLyoqXG4gKiBXb3JrcyBhbG1vc3QgbGlrZSBcImZpbmFsbHlcIiwgYnV0IG5vdCBjYWxsZWQgZm9yIHJlamVjdGlvbnMuXG4gKiBPcmlnaW5hbCByZXNvbHV0aW9uIHZhbHVlIGlzIHBhc3NlZCB0aHJvdWdoIGNhbGxiYWNrIHVuYWZmZWN0ZWQuXG4gKiBDYWxsYmFjayBtYXkgcmV0dXJuIGEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgYXdhaXRlZCBmb3IuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge1EuUHJvbWlzZX1cbiAqIEBleGFtcGxlXG4gKiBkb1NvbWV0aGluZygpXG4gKiAgIC50aGVuKC4uLilcbiAqICAgLnRhcChjb25zb2xlLmxvZylcbiAqICAgLnRoZW4oLi4uKTtcbiAqL1xuUHJvbWlzZS5wcm90b3R5cGUudGFwID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBRKGNhbGxiYWNrKTtcblxuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCh2YWx1ZSkudGhlblJlc29sdmUodmFsdWUpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlcnMgYW4gb2JzZXJ2ZXIgb24gYSBwcm9taXNlLlxuICpcbiAqIEd1YXJhbnRlZXM6XG4gKlxuICogMS4gdGhhdCBmdWxmaWxsZWQgYW5kIHJlamVjdGVkIHdpbGwgYmUgY2FsbGVkIG9ubHkgb25jZS5cbiAqIDIuIHRoYXQgZWl0aGVyIHRoZSBmdWxmaWxsZWQgY2FsbGJhY2sgb3IgdGhlIHJlamVjdGVkIGNhbGxiYWNrIHdpbGwgYmVcbiAqICAgIGNhbGxlZCwgYnV0IG5vdCBib3RoLlxuICogMy4gdGhhdCBmdWxmaWxsZWQgYW5kIHJlamVjdGVkIHdpbGwgbm90IGJlIGNhbGxlZCBpbiB0aGlzIHR1cm4uXG4gKlxuICogQHBhcmFtIHZhbHVlICAgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIHRvIG9ic2VydmVcbiAqIEBwYXJhbSBmdWxmaWxsZWQgIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aXRoIHRoZSBmdWxmaWxsZWQgdmFsdWVcbiAqIEBwYXJhbSByZWplY3RlZCAgIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aXRoIHRoZSByZWplY3Rpb24gZXhjZXB0aW9uXG4gKiBAcGFyYW0gcHJvZ3Jlc3NlZCBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gYW55IHByb2dyZXNzIG5vdGlmaWNhdGlvbnNcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSBmcm9tIHRoZSBpbnZva2VkIGNhbGxiYWNrXG4gKi9cblEud2hlbiA9IHdoZW47XG5mdW5jdGlvbiB3aGVuKHZhbHVlLCBmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKSB7XG4gICAgcmV0dXJuIFEodmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3NlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnRoZW5SZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAoKSB7IHJldHVybiB2YWx1ZTsgfSk7XG59O1xuXG5RLnRoZW5SZXNvbHZlID0gZnVuY3Rpb24gKHByb21pc2UsIHZhbHVlKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZSkudGhlblJlc29sdmUodmFsdWUpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGhlblJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICgpIHsgdGhyb3cgcmVhc29uOyB9KTtcbn07XG5cblEudGhlblJlamVjdCA9IGZ1bmN0aW9uIChwcm9taXNlLCByZWFzb24pIHtcbiAgICByZXR1cm4gUShwcm9taXNlKS50aGVuUmVqZWN0KHJlYXNvbik7XG59O1xuXG4vKipcbiAqIElmIGFuIG9iamVjdCBpcyBub3QgYSBwcm9taXNlLCBpdCBpcyBhcyBcIm5lYXJcIiBhcyBwb3NzaWJsZS5cbiAqIElmIGEgcHJvbWlzZSBpcyByZWplY3RlZCwgaXQgaXMgYXMgXCJuZWFyXCIgYXMgcG9zc2libGUgdG9vLlxuICogSWYgaXTigJlzIGEgZnVsZmlsbGVkIHByb21pc2UsIHRoZSBmdWxmaWxsbWVudCB2YWx1ZSBpcyBuZWFyZXIuXG4gKiBJZiBpdOKAmXMgYSBkZWZlcnJlZCBwcm9taXNlIGFuZCB0aGUgZGVmZXJyZWQgaGFzIGJlZW4gcmVzb2x2ZWQsIHRoZVxuICogcmVzb2x1dGlvbiBpcyBcIm5lYXJlclwiLlxuICogQHBhcmFtIG9iamVjdFxuICogQHJldHVybnMgbW9zdCByZXNvbHZlZCAobmVhcmVzdCkgZm9ybSBvZiB0aGUgb2JqZWN0XG4gKi9cblxuLy8gWFhYIHNob3VsZCB3ZSByZS1kbyB0aGlzP1xuUS5uZWFyZXIgPSBuZWFyZXI7XG5mdW5jdGlvbiBuZWFyZXIodmFsdWUpIHtcbiAgICBpZiAoaXNQcm9taXNlKHZhbHVlKSkge1xuICAgICAgICB2YXIgaW5zcGVjdGVkID0gdmFsdWUuaW5zcGVjdCgpO1xuICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5zcGVjdGVkLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSBwcm9taXNlLlxuICogT3RoZXJ3aXNlIGl0IGlzIGEgZnVsZmlsbGVkIHZhbHVlLlxuICovXG5RLmlzUHJvbWlzZSA9IGlzUHJvbWlzZTtcbmZ1bmN0aW9uIGlzUHJvbWlzZShvYmplY3QpIHtcbiAgICByZXR1cm4gb2JqZWN0IGluc3RhbmNlb2YgUHJvbWlzZTtcbn1cblxuUS5pc1Byb21pc2VBbGlrZSA9IGlzUHJvbWlzZUFsaWtlO1xuZnVuY3Rpb24gaXNQcm9taXNlQWxpa2Uob2JqZWN0KSB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KG9iamVjdCkgJiYgdHlwZW9mIG9iamVjdC50aGVuID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgcGVuZGluZyBwcm9taXNlLCBtZWFuaW5nIG5vdFxuICogZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuICovXG5RLmlzUGVuZGluZyA9IGlzUGVuZGluZztcbmZ1bmN0aW9uIGlzUGVuZGluZyhvYmplY3QpIHtcbiAgICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgJiYgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzUGVuZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwicGVuZGluZ1wiO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSB2YWx1ZSBvciBmdWxmaWxsZWRcbiAqIHByb21pc2UuXG4gKi9cblEuaXNGdWxmaWxsZWQgPSBpc0Z1bGZpbGxlZDtcbmZ1bmN0aW9uIGlzRnVsZmlsbGVkKG9iamVjdCkge1xuICAgIHJldHVybiAhaXNQcm9taXNlKG9iamVjdCkgfHwgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNGdWxmaWxsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSByZWplY3RlZCBwcm9taXNlLlxuICovXG5RLmlzUmVqZWN0ZWQgPSBpc1JlamVjdGVkO1xuZnVuY3Rpb24gaXNSZWplY3RlZChvYmplY3QpIHtcbiAgICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgJiYgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc1JlamVjdGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiO1xufTtcblxuLy8vLyBCRUdJTiBVTkhBTkRMRUQgUkVKRUNUSU9OIFRSQUNLSU5HXG5cbi8vIFRoaXMgcHJvbWlzZSBsaWJyYXJ5IGNvbnN1bWVzIGV4Y2VwdGlvbnMgdGhyb3duIGluIGhhbmRsZXJzIHNvIHRoZXkgY2FuIGJlXG4vLyBoYW5kbGVkIGJ5IGEgc3Vic2VxdWVudCBwcm9taXNlLiAgVGhlIGV4Y2VwdGlvbnMgZ2V0IGFkZGVkIHRvIHRoaXMgYXJyYXkgd2hlblxuLy8gdGhleSBhcmUgY3JlYXRlZCwgYW5kIHJlbW92ZWQgd2hlbiB0aGV5IGFyZSBoYW5kbGVkLiAgTm90ZSB0aGF0IGluIEVTNiBvclxuLy8gc2hpbW1lZCBlbnZpcm9ubWVudHMsIHRoaXMgd291bGQgbmF0dXJhbGx5IGJlIGEgYFNldGAuXG52YXIgdW5oYW5kbGVkUmVhc29ucyA9IFtdO1xudmFyIHVuaGFuZGxlZFJlamVjdGlvbnMgPSBbXTtcbnZhciByZXBvcnRlZFVuaGFuZGxlZFJlamVjdGlvbnMgPSBbXTtcbnZhciB0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMgPSB0cnVlO1xuXG5mdW5jdGlvbiByZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKSB7XG4gICAgdW5oYW5kbGVkUmVhc29ucy5sZW5ndGggPSAwO1xuICAgIHVuaGFuZGxlZFJlamVjdGlvbnMubGVuZ3RoID0gMDtcblxuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IHRydWU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0cmFja1JlamVjdGlvbihwcm9taXNlLCByZWFzb24pIHtcbiAgICBpZiAoIXRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcHJvY2Vzcy5lbWl0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgUS5uZXh0VGljay5ydW5BZnRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlfaW5kZXhPZih1bmhhbmRsZWRSZWplY3Rpb25zLCBwcm9taXNlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmVtaXQoXCJ1bmhhbmRsZWRSZWplY3Rpb25cIiwgcmVhc29uLCBwcm9taXNlKTtcbiAgICAgICAgICAgICAgICByZXBvcnRlZFVuaGFuZGxlZFJlamVjdGlvbnMucHVzaChwcm9taXNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5wdXNoKHByb21pc2UpO1xuICAgIGlmIChyZWFzb24gJiYgdHlwZW9mIHJlYXNvbi5zdGFjayAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnB1c2gocmVhc29uLnN0YWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnB1c2goXCIobm8gc3RhY2spIFwiICsgcmVhc29uKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVudHJhY2tSZWplY3Rpb24ocHJvbWlzZSkge1xuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYXQgPSBhcnJheV9pbmRleE9mKHVuaGFuZGxlZFJlamVjdGlvbnMsIHByb21pc2UpO1xuICAgIGlmIChhdCAhPT0gLTEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBwcm9jZXNzLmVtaXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgUS5uZXh0VGljay5ydW5BZnRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGF0UmVwb3J0ID0gYXJyYXlfaW5kZXhPZihyZXBvcnRlZFVuaGFuZGxlZFJlamVjdGlvbnMsIHByb21pc2UpO1xuICAgICAgICAgICAgICAgIGlmIChhdFJlcG9ydCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5lbWl0KFwicmVqZWN0aW9uSGFuZGxlZFwiLCB1bmhhbmRsZWRSZWFzb25zW2F0XSwgcHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucy5zcGxpY2UoYXRSZXBvcnQsIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHVuaGFuZGxlZFJlamVjdGlvbnMuc3BsaWNlKGF0LCAxKTtcbiAgICAgICAgdW5oYW5kbGVkUmVhc29ucy5zcGxpY2UoYXQsIDEpO1xuICAgIH1cbn1cblxuUS5yZXNldFVuaGFuZGxlZFJlamVjdGlvbnMgPSByZXNldFVuaGFuZGxlZFJlamVjdGlvbnM7XG5cblEuZ2V0VW5oYW5kbGVkUmVhc29ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBNYWtlIGEgY29weSBzbyB0aGF0IGNvbnN1bWVycyBjYW4ndCBpbnRlcmZlcmUgd2l0aCBvdXIgaW50ZXJuYWwgc3RhdGUuXG4gICAgcmV0dXJuIHVuaGFuZGxlZFJlYXNvbnMuc2xpY2UoKTtcbn07XG5cblEuc3RvcFVuaGFuZGxlZFJlamVjdGlvblRyYWNraW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpO1xuICAgIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IGZhbHNlO1xufTtcblxucmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zKCk7XG5cbi8vLy8gRU5EIFVOSEFORExFRCBSRUpFQ1RJT04gVFJBQ0tJTkdcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgcmVqZWN0ZWQgcHJvbWlzZS5cbiAqIEBwYXJhbSByZWFzb24gdmFsdWUgZGVzY3JpYmluZyB0aGUgZmFpbHVyZVxuICovXG5RLnJlamVjdCA9IHJlamVjdDtcbmZ1bmN0aW9uIHJlamVjdChyZWFzb24pIHtcbiAgICB2YXIgcmVqZWN0aW9uID0gUHJvbWlzZSh7XG4gICAgICAgIFwid2hlblwiOiBmdW5jdGlvbiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICAgIC8vIG5vdGUgdGhhdCB0aGUgZXJyb3IgaGFzIGJlZW4gaGFuZGxlZFxuICAgICAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdW50cmFja1JlamVjdGlvbih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3RlZCA/IHJlamVjdGVkKHJlYXNvbikgOiB0aGlzO1xuICAgICAgICB9XG4gICAgfSwgZnVuY3Rpb24gZmFsbGJhY2soKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sIGZ1bmN0aW9uIGluc3BlY3QoKSB7XG4gICAgICAgIHJldHVybiB7IHN0YXRlOiBcInJlamVjdGVkXCIsIHJlYXNvbjogcmVhc29uIH07XG4gICAgfSk7XG5cbiAgICAvLyBOb3RlIHRoYXQgdGhlIHJlYXNvbiBoYXMgbm90IGJlZW4gaGFuZGxlZC5cbiAgICB0cmFja1JlamVjdGlvbihyZWplY3Rpb24sIHJlYXNvbik7XG5cbiAgICByZXR1cm4gcmVqZWN0aW9uO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBmdWxmaWxsZWQgcHJvbWlzZSBmb3IgYW4gaW1tZWRpYXRlIHJlZmVyZW5jZS5cbiAqIEBwYXJhbSB2YWx1ZSBpbW1lZGlhdGUgcmVmZXJlbmNlXG4gKi9cblEuZnVsZmlsbCA9IGZ1bGZpbGw7XG5mdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7XG4gICAgcmV0dXJuIFByb21pc2Uoe1xuICAgICAgICBcIndoZW5cIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBcImdldFwiOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBcInNldFwiOiBmdW5jdGlvbiAobmFtZSwgcmhzKSB7XG4gICAgICAgICAgICB2YWx1ZVtuYW1lXSA9IHJocztcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWxldGVcIjogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB2YWx1ZVtuYW1lXTtcbiAgICAgICAgfSxcbiAgICAgICAgXCJwb3N0XCI6IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gICAgICAgICAgICAvLyBNYXJrIE1pbGxlciBwcm9wb3NlcyB0aGF0IHBvc3Qgd2l0aCBubyBuYW1lIHNob3VsZCBhcHBseSBhXG4gICAgICAgICAgICAvLyBwcm9taXNlZCBmdW5jdGlvbi5cbiAgICAgICAgICAgIGlmIChuYW1lID09PSBudWxsIHx8IG5hbWUgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5hcHBseSh2b2lkIDAsIGFyZ3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVbbmFtZV0uYXBwbHkodmFsdWUsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImFwcGx5XCI6IGZ1bmN0aW9uICh0aGlzcCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmFwcGx5KHRoaXNwLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgXCJrZXlzXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmplY3Rfa2V5cyh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9LCB2b2lkIDAsIGZ1bmN0aW9uIGluc3BlY3QoKSB7XG4gICAgICAgIHJldHVybiB7IHN0YXRlOiBcImZ1bGZpbGxlZFwiLCB2YWx1ZTogdmFsdWUgfTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyB0aGVuYWJsZXMgdG8gUSBwcm9taXNlcy5cbiAqIEBwYXJhbSBwcm9taXNlIHRoZW5hYmxlIHByb21pc2VcbiAqIEByZXR1cm5zIGEgUSBwcm9taXNlXG4gKi9cbmZ1bmN0aW9uIGNvZXJjZShwcm9taXNlKSB7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb21pc2UudGhlbihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QsIGRlZmVycmVkLm5vdGlmeSk7XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuLyoqXG4gKiBBbm5vdGF0ZXMgYW4gb2JqZWN0IHN1Y2ggdGhhdCBpdCB3aWxsIG5ldmVyIGJlXG4gKiB0cmFuc2ZlcnJlZCBhd2F5IGZyb20gdGhpcyBwcm9jZXNzIG92ZXIgYW55IHByb21pc2VcbiAqIGNvbW11bmljYXRpb24gY2hhbm5lbC5cbiAqIEBwYXJhbSBvYmplY3RcbiAqIEByZXR1cm5zIHByb21pc2UgYSB3cmFwcGluZyBvZiB0aGF0IG9iamVjdCB0aGF0XG4gKiBhZGRpdGlvbmFsbHkgcmVzcG9uZHMgdG8gdGhlIFwiaXNEZWZcIiBtZXNzYWdlXG4gKiB3aXRob3V0IGEgcmVqZWN0aW9uLlxuICovXG5RLm1hc3RlciA9IG1hc3RlcjtcbmZ1bmN0aW9uIG1hc3RlcihvYmplY3QpIHtcbiAgICByZXR1cm4gUHJvbWlzZSh7XG4gICAgICAgIFwiaXNEZWZcIjogZnVuY3Rpb24gKCkge31cbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjayhvcCwgYXJncykge1xuICAgICAgICByZXR1cm4gZGlzcGF0Y2gob2JqZWN0LCBvcCwgYXJncyk7XG4gICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gUShvYmplY3QpLmluc3BlY3QoKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTcHJlYWRzIHRoZSB2YWx1ZXMgb2YgYSBwcm9taXNlZCBhcnJheSBvZiBhcmd1bWVudHMgaW50byB0aGVcbiAqIGZ1bGZpbGxtZW50IGNhbGxiYWNrLlxuICogQHBhcmFtIGZ1bGZpbGxlZCBjYWxsYmFjayB0aGF0IHJlY2VpdmVzIHZhcmlhZGljIGFyZ3VtZW50cyBmcm9tIHRoZVxuICogcHJvbWlzZWQgYXJyYXlcbiAqIEBwYXJhbSByZWplY3RlZCBjYWxsYmFjayB0aGF0IHJlY2VpdmVzIHRoZSBleGNlcHRpb24gaWYgdGhlIHByb21pc2VcbiAqIGlzIHJlamVjdGVkLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIG9yIHRocm93biBleGNlcHRpb24gb2ZcbiAqIGVpdGhlciBjYWxsYmFjay5cbiAqL1xuUS5zcHJlYWQgPSBzcHJlYWQ7XG5mdW5jdGlvbiBzcHJlYWQodmFsdWUsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gUSh2YWx1ZSkuc3ByZWFkKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5zcHJlYWQgPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICAgIHJldHVybiB0aGlzLmFsbCgpLnRoZW4oZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgICAgIHJldHVybiBmdWxmaWxsZWQuYXBwbHkodm9pZCAwLCBhcnJheSk7XG4gICAgfSwgcmVqZWN0ZWQpO1xufTtcblxuLyoqXG4gKiBUaGUgYXN5bmMgZnVuY3Rpb24gaXMgYSBkZWNvcmF0b3IgZm9yIGdlbmVyYXRvciBmdW5jdGlvbnMsIHR1cm5pbmdcbiAqIHRoZW0gaW50byBhc3luY2hyb25vdXMgZ2VuZXJhdG9ycy4gIEFsdGhvdWdoIGdlbmVyYXRvcnMgYXJlIG9ubHkgcGFydFxuICogb2YgdGhlIG5ld2VzdCBFQ01BU2NyaXB0IDYgZHJhZnRzLCB0aGlzIGNvZGUgZG9lcyBub3QgY2F1c2Ugc3ludGF4XG4gKiBlcnJvcnMgaW4gb2xkZXIgZW5naW5lcy4gIFRoaXMgY29kZSBzaG91bGQgY29udGludWUgdG8gd29yayBhbmQgd2lsbFxuICogaW4gZmFjdCBpbXByb3ZlIG92ZXIgdGltZSBhcyB0aGUgbGFuZ3VhZ2UgaW1wcm92ZXMuXG4gKlxuICogRVM2IGdlbmVyYXRvcnMgYXJlIGN1cnJlbnRseSBwYXJ0IG9mIFY4IHZlcnNpb24gMy4xOSB3aXRoIHRoZVxuICogLS1oYXJtb255LWdlbmVyYXRvcnMgcnVudGltZSBmbGFnIGVuYWJsZWQuICBTcGlkZXJNb25rZXkgaGFzIGhhZCB0aGVtXG4gKiBmb3IgbG9uZ2VyLCBidXQgdW5kZXIgYW4gb2xkZXIgUHl0aG9uLWluc3BpcmVkIGZvcm0uICBUaGlzIGZ1bmN0aW9uXG4gKiB3b3JrcyBvbiBib3RoIGtpbmRzIG9mIGdlbmVyYXRvcnMuXG4gKlxuICogRGVjb3JhdGVzIGEgZ2VuZXJhdG9yIGZ1bmN0aW9uIHN1Y2ggdGhhdDpcbiAqICAtIGl0IG1heSB5aWVsZCBwcm9taXNlc1xuICogIC0gZXhlY3V0aW9uIHdpbGwgY29udGludWUgd2hlbiB0aGF0IHByb21pc2UgaXMgZnVsZmlsbGVkXG4gKiAgLSB0aGUgdmFsdWUgb2YgdGhlIHlpZWxkIGV4cHJlc3Npb24gd2lsbCBiZSB0aGUgZnVsZmlsbGVkIHZhbHVlXG4gKiAgLSBpdCByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSAod2hlbiB0aGUgZ2VuZXJhdG9yXG4gKiAgICBzdG9wcyBpdGVyYXRpbmcpXG4gKiAgLSB0aGUgZGVjb3JhdGVkIGZ1bmN0aW9uIHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKiAgICBvZiB0aGUgZ2VuZXJhdG9yIG9yIHRoZSBmaXJzdCByZWplY3RlZCBwcm9taXNlIGFtb25nIHRob3NlXG4gKiAgICB5aWVsZGVkLlxuICogIC0gaWYgYW4gZXJyb3IgaXMgdGhyb3duIGluIHRoZSBnZW5lcmF0b3IsIGl0IHByb3BhZ2F0ZXMgdGhyb3VnaFxuICogICAgZXZlcnkgZm9sbG93aW5nIHlpZWxkIHVudGlsIGl0IGlzIGNhdWdodCwgb3IgdW50aWwgaXQgZXNjYXBlc1xuICogICAgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiBhbHRvZ2V0aGVyLCBhbmQgaXMgdHJhbnNsYXRlZCBpbnRvIGFcbiAqICAgIHJlamVjdGlvbiBmb3IgdGhlIHByb21pc2UgcmV0dXJuZWQgYnkgdGhlIGRlY29yYXRlZCBnZW5lcmF0b3IuXG4gKi9cblEuYXN5bmMgPSBhc3luYztcbmZ1bmN0aW9uIGFzeW5jKG1ha2VHZW5lcmF0b3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyB3aGVuIHZlcmIgaXMgXCJzZW5kXCIsIGFyZyBpcyBhIHZhbHVlXG4gICAgICAgIC8vIHdoZW4gdmVyYiBpcyBcInRocm93XCIsIGFyZyBpcyBhbiBleGNlcHRpb25cbiAgICAgICAgZnVuY3Rpb24gY29udGludWVyKHZlcmIsIGFyZykge1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgICAgICAgLy8gVW50aWwgVjggMy4xOSAvIENocm9taXVtIDI5IGlzIHJlbGVhc2VkLCBTcGlkZXJNb25rZXkgaXMgdGhlIG9ubHlcbiAgICAgICAgICAgIC8vIGVuZ2luZSB0aGF0IGhhcyBhIGRlcGxveWVkIGJhc2Ugb2YgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IGdlbmVyYXRvcnMuXG4gICAgICAgICAgICAvLyBIb3dldmVyLCBTTSdzIGdlbmVyYXRvcnMgdXNlIHRoZSBQeXRob24taW5zcGlyZWQgc2VtYW50aWNzIG9mXG4gICAgICAgICAgICAvLyBvdXRkYXRlZCBFUzYgZHJhZnRzLiAgV2Ugd291bGQgbGlrZSB0byBzdXBwb3J0IEVTNiwgYnV0IHdlJ2QgYWxzb1xuICAgICAgICAgICAgLy8gbGlrZSB0byBtYWtlIGl0IHBvc3NpYmxlIHRvIHVzZSBnZW5lcmF0b3JzIGluIGRlcGxveWVkIGJyb3dzZXJzLCBzb1xuICAgICAgICAgICAgLy8gd2UgYWxzbyBzdXBwb3J0IFB5dGhvbi1zdHlsZSBnZW5lcmF0b3JzLiAgQXQgc29tZSBwb2ludCB3ZSBjYW4gcmVtb3ZlXG4gICAgICAgICAgICAvLyB0aGlzIGJsb2NrLlxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIFN0b3BJdGVyYXRpb24gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAvLyBFUzYgR2VuZXJhdG9yc1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGdlbmVyYXRvclt2ZXJiXShhcmcpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUShyZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3aGVuKHJlc3VsdC52YWx1ZSwgY2FsbGJhY2ssIGVycmJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU3BpZGVyTW9ua2V5IEdlbmVyYXRvcnNcbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogUmVtb3ZlIHRoaXMgY2FzZSB3aGVuIFNNIGRvZXMgRVM2IGdlbmVyYXRvcnMuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2VuZXJhdG9yW3ZlcmJdKGFyZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1N0b3BJdGVyYXRpb24oZXhjZXB0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFEoZXhjZXB0aW9uLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gd2hlbihyZXN1bHQsIGNhbGxiYWNrLCBlcnJiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZ2VuZXJhdG9yID0gbWFrZUdlbmVyYXRvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBjb250aW51ZXIuYmluZChjb250aW51ZXIsIFwibmV4dFwiKTtcbiAgICAgICAgdmFyIGVycmJhY2sgPSBjb250aW51ZXIuYmluZChjb250aW51ZXIsIFwidGhyb3dcIik7XG4gICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgIH07XG59XG5cbi8qKlxuICogVGhlIHNwYXduIGZ1bmN0aW9uIGlzIGEgc21hbGwgd3JhcHBlciBhcm91bmQgYXN5bmMgdGhhdCBpbW1lZGlhdGVseVxuICogY2FsbHMgdGhlIGdlbmVyYXRvciBhbmQgYWxzbyBlbmRzIHRoZSBwcm9taXNlIGNoYWluLCBzbyB0aGF0IGFueVxuICogdW5oYW5kbGVkIGVycm9ycyBhcmUgdGhyb3duIGluc3RlYWQgb2YgZm9yd2FyZGVkIHRvIHRoZSBlcnJvclxuICogaGFuZGxlci4gVGhpcyBpcyB1c2VmdWwgYmVjYXVzZSBpdCdzIGV4dHJlbWVseSBjb21tb24gdG8gcnVuXG4gKiBnZW5lcmF0b3JzIGF0IHRoZSB0b3AtbGV2ZWwgdG8gd29yayB3aXRoIGxpYnJhcmllcy5cbiAqL1xuUS5zcGF3biA9IHNwYXduO1xuZnVuY3Rpb24gc3Bhd24obWFrZUdlbmVyYXRvcikge1xuICAgIFEuZG9uZShRLmFzeW5jKG1ha2VHZW5lcmF0b3IpKCkpO1xufVxuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgaW50ZXJmYWNlIG9uY2UgRVM2IGdlbmVyYXRvcnMgYXJlIGluIFNwaWRlck1vbmtleS5cbi8qKlxuICogVGhyb3dzIGEgUmV0dXJuVmFsdWUgZXhjZXB0aW9uIHRvIHN0b3AgYW4gYXN5bmNocm9ub3VzIGdlbmVyYXRvci5cbiAqXG4gKiBUaGlzIGludGVyZmFjZSBpcyBhIHN0b3AtZ2FwIG1lYXN1cmUgdG8gc3VwcG9ydCBnZW5lcmF0b3IgcmV0dXJuXG4gKiB2YWx1ZXMgaW4gb2xkZXIgRmlyZWZveC9TcGlkZXJNb25rZXkuICBJbiBicm93c2VycyB0aGF0IHN1cHBvcnQgRVM2XG4gKiBnZW5lcmF0b3JzIGxpa2UgQ2hyb21pdW0gMjksIGp1c3QgdXNlIFwicmV0dXJuXCIgaW4geW91ciBnZW5lcmF0b3JcbiAqIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgdGhlIHJldHVybiB2YWx1ZSBmb3IgdGhlIHN1cnJvdW5kaW5nIGdlbmVyYXRvclxuICogQHRocm93cyBSZXR1cm5WYWx1ZSBleGNlcHRpb24gd2l0aCB0aGUgdmFsdWUuXG4gKiBAZXhhbXBsZVxuICogLy8gRVM2IHN0eWxlXG4gKiBRLmFzeW5jKGZ1bmN0aW9uKiAoKSB7XG4gKiAgICAgIHZhciBmb28gPSB5aWVsZCBnZXRGb29Qcm9taXNlKCk7XG4gKiAgICAgIHZhciBiYXIgPSB5aWVsZCBnZXRCYXJQcm9taXNlKCk7XG4gKiAgICAgIHJldHVybiBmb28gKyBiYXI7XG4gKiB9KVxuICogLy8gT2xkZXIgU3BpZGVyTW9ua2V5IHN0eWxlXG4gKiBRLmFzeW5jKGZ1bmN0aW9uICgpIHtcbiAqICAgICAgdmFyIGZvbyA9IHlpZWxkIGdldEZvb1Byb21pc2UoKTtcbiAqICAgICAgdmFyIGJhciA9IHlpZWxkIGdldEJhclByb21pc2UoKTtcbiAqICAgICAgUS5yZXR1cm4oZm9vICsgYmFyKTtcbiAqIH0pXG4gKi9cblFbXCJyZXR1cm5cIl0gPSBfcmV0dXJuO1xuZnVuY3Rpb24gX3JldHVybih2YWx1ZSkge1xuICAgIHRocm93IG5ldyBRUmV0dXJuVmFsdWUodmFsdWUpO1xufVxuXG4vKipcbiAqIFRoZSBwcm9taXNlZCBmdW5jdGlvbiBkZWNvcmF0b3IgZW5zdXJlcyB0aGF0IGFueSBwcm9taXNlIGFyZ3VtZW50c1xuICogYXJlIHNldHRsZWQgYW5kIHBhc3NlZCBhcyB2YWx1ZXMgKGB0aGlzYCBpcyBhbHNvIHNldHRsZWQgYW5kIHBhc3NlZFxuICogYXMgYSB2YWx1ZSkuICBJdCB3aWxsIGFsc28gZW5zdXJlIHRoYXQgdGhlIHJlc3VsdCBvZiBhIGZ1bmN0aW9uIGlzXG4gKiBhbHdheXMgYSBwcm9taXNlLlxuICpcbiAqIEBleGFtcGxlXG4gKiB2YXIgYWRkID0gUS5wcm9taXNlZChmdW5jdGlvbiAoYSwgYikge1xuICogICAgIHJldHVybiBhICsgYjtcbiAqIH0pO1xuICogYWRkKFEoYSksIFEoQikpO1xuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBkZWNvcmF0ZVxuICogQHJldHVybnMge2Z1bmN0aW9ufSBhIGZ1bmN0aW9uIHRoYXQgaGFzIGJlZW4gZGVjb3JhdGVkLlxuICovXG5RLnByb21pc2VkID0gcHJvbWlzZWQ7XG5mdW5jdGlvbiBwcm9taXNlZChjYWxsYmFjaykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzcHJlYWQoW3RoaXMsIGFsbChhcmd1bWVudHMpXSwgZnVuY3Rpb24gKHNlbGYsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBzZW5kcyBhIG1lc3NhZ2UgdG8gYSB2YWx1ZSBpbiBhIGZ1dHVyZSB0dXJuXG4gKiBAcGFyYW0gb2JqZWN0KiB0aGUgcmVjaXBpZW50XG4gKiBAcGFyYW0gb3AgdGhlIG5hbWUgb2YgdGhlIG1lc3NhZ2Ugb3BlcmF0aW9uLCBlLmcuLCBcIndoZW5cIixcbiAqIEBwYXJhbSBhcmdzIGZ1cnRoZXIgYXJndW1lbnRzIHRvIGJlIGZvcndhcmRlZCB0byB0aGUgb3BlcmF0aW9uXG4gKiBAcmV0dXJucyByZXN1bHQge1Byb21pc2V9IGEgcHJvbWlzZSBmb3IgdGhlIHJlc3VsdCBvZiB0aGUgb3BlcmF0aW9uXG4gKi9cblEuZGlzcGF0Y2ggPSBkaXNwYXRjaDtcbmZ1bmN0aW9uIGRpc3BhdGNoKG9iamVjdCwgb3AsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKG9wLCBhcmdzKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuZGlzcGF0Y2ggPSBmdW5jdGlvbiAob3AsIGFyZ3MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5wcm9taXNlRGlzcGF0Y2goZGVmZXJyZWQucmVzb2x2ZSwgb3AsIGFyZ3MpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIHByb3BlcnR5IHRvIGdldFxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcHJvcGVydHkgdmFsdWVcbiAqL1xuUS5nZXQgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXkpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiZ2V0XCIsIFtrZXldKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImdldFwiLCBba2V5XSk7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciBvYmplY3Qgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gc2V0XG4gKiBAcGFyYW0gdmFsdWUgICAgIG5ldyB2YWx1ZSBvZiBwcm9wZXJ0eVxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cblEuc2V0ID0gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJzZXRcIiwgW2tleSwgdmFsdWVdKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJzZXRcIiwgW2tleSwgdmFsdWVdKTtcbn07XG5cbi8qKlxuICogRGVsZXRlcyBhIHByb3BlcnR5IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIHByb3BlcnR5IHRvIGRlbGV0ZVxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cblEuZGVsID0gLy8gWFhYIGxlZ2FjeVxuUVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJkZWxldGVcIiwgW2tleV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZGVsID0gLy8gWFhYIGxlZ2FjeVxuUHJvbWlzZS5wcm90b3R5cGVbXCJkZWxldGVcIl0gPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJkZWxldGVcIiwgW2tleV0pO1xufTtcblxuLyoqXG4gKiBJbnZva2VzIGEgbWV0aG9kIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIG1ldGhvZCB0byBpbnZva2VcbiAqIEBwYXJhbSB2YWx1ZSAgICAgYSB2YWx1ZSB0byBwb3N0LCB0eXBpY2FsbHkgYW4gYXJyYXkgb2ZcbiAqICAgICAgICAgICAgICAgICAgaW52b2NhdGlvbiBhcmd1bWVudHMgZm9yIHByb21pc2VzIHRoYXRcbiAqICAgICAgICAgICAgICAgICAgYXJlIHVsdGltYXRlbHkgYmFja2VkIHdpdGggYHJlc29sdmVgIHZhbHVlcyxcbiAqICAgICAgICAgICAgICAgICAgYXMgb3Bwb3NlZCB0byB0aG9zZSBiYWNrZWQgd2l0aCBVUkxzXG4gKiAgICAgICAgICAgICAgICAgIHdoZXJlaW4gdGhlIHBvc3RlZCB2YWx1ZSBjYW4gYmUgYW55XG4gKiAgICAgICAgICAgICAgICAgIEpTT04gc2VyaWFsaXphYmxlIG9iamVjdC5cbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG4vLyBib3VuZCBsb2NhbGx5IGJlY2F1c2UgaXQgaXMgdXNlZCBieSBvdGhlciBtZXRob2RzXG5RLm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5RLnBvc3QgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIGFyZ3NdKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5wb3N0ID0gZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIGFyZ3NdKTtcbn07XG5cbi8qKlxuICogSW52b2tlcyBhIG1ldGhvZCBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBtZXRob2QgdG8gaW52b2tlXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGludm9jYXRpb24gYXJndW1lbnRzXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5zZW5kID0gLy8gWFhYIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgcGFybGFuY2VcblEubWNhbGwgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUS5pbnZva2UgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMildKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnNlbmQgPSAvLyBYWFggTWFyayBNaWxsZXIncyBwcm9wb3NlZCBwYXJsYW5jZVxuUHJvbWlzZS5wcm90b3R5cGUubWNhbGwgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUHJvbWlzZS5wcm90b3R5cGUuaW52b2tlID0gZnVuY3Rpb24gKG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSldKTtcbn07XG5cbi8qKlxuICogQXBwbGllcyB0aGUgcHJvbWlzZWQgZnVuY3Rpb24gaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgZnVuY3Rpb25cbiAqIEBwYXJhbSBhcmdzICAgICAgYXJyYXkgb2YgYXBwbGljYXRpb24gYXJndW1lbnRzXG4gKi9cblEuZmFwcGx5ID0gZnVuY3Rpb24gKG9iamVjdCwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcmdzXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5mYXBwbHkgPSBmdW5jdGlvbiAoYXJncykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJnc10pO1xufTtcblxuLyoqXG4gKiBDYWxscyB0aGUgcHJvbWlzZWQgZnVuY3Rpb24gaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgZnVuY3Rpb25cbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgYXBwbGljYXRpb24gYXJndW1lbnRzXG4gKi9cblFbXCJ0cnlcIl0gPVxuUS5mY2FsbCA9IGZ1bmN0aW9uIChvYmplY3QgLyogLi4uYXJncyovKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSldKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZjYWxsID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcnJheV9zbGljZShhcmd1bWVudHMpXSk7XG59O1xuXG4vKipcbiAqIEJpbmRzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiwgdHJhbnNmb3JtaW5nIHJldHVybiB2YWx1ZXMgaW50byBhIGZ1bGZpbGxlZFxuICogcHJvbWlzZSBhbmQgdGhyb3duIGVycm9ycyBpbnRvIGEgcmVqZWN0ZWQgb25lLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUS5mYmluZCA9IGZ1bmN0aW9uIChvYmplY3QgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgcHJvbWlzZSA9IFEob2JqZWN0KTtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGZib3VuZCgpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UuZGlzcGF0Y2goXCJhcHBseVwiLCBbXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgYXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSlcbiAgICAgICAgXSk7XG4gICAgfTtcbn07XG5Qcm9taXNlLnByb3RvdHlwZS5mYmluZCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGZib3VuZCgpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UuZGlzcGF0Y2goXCJhcHBseVwiLCBbXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgYXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSlcbiAgICAgICAgXSk7XG4gICAgfTtcbn07XG5cbi8qKlxuICogUmVxdWVzdHMgdGhlIG5hbWVzIG9mIHRoZSBvd25lZCBwcm9wZXJ0aWVzIG9mIGEgcHJvbWlzZWRcbiAqIG9iamVjdCBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIGtleXMgb2YgdGhlIGV2ZW50dWFsbHkgc2V0dGxlZCBvYmplY3RcbiAqL1xuUS5rZXlzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJrZXlzXCIsIFtdKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJrZXlzXCIsIFtdKTtcbn07XG5cbi8qKlxuICogVHVybnMgYW4gYXJyYXkgb2YgcHJvbWlzZXMgaW50byBhIHByb21pc2UgZm9yIGFuIGFycmF5LiAgSWYgYW55IG9mXG4gKiB0aGUgcHJvbWlzZXMgZ2V0cyByZWplY3RlZCwgdGhlIHdob2xlIGFycmF5IGlzIHJlamVjdGVkIGltbWVkaWF0ZWx5LlxuICogQHBhcmFtIHtBcnJheSp9IGFuIGFycmF5IChvciBwcm9taXNlIGZvciBhbiBhcnJheSkgb2YgdmFsdWVzIChvclxuICogcHJvbWlzZXMgZm9yIHZhbHVlcylcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzXG4gKi9cbi8vIEJ5IE1hcmsgTWlsbGVyXG4vLyBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1zdHJhd21hbjpjb25jdXJyZW5jeSZyZXY9MTMwODc3NjUyMSNhbGxmdWxmaWxsZWRcblEuYWxsID0gYWxsO1xuZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gICAgcmV0dXJuIHdoZW4ocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlcykge1xuICAgICAgICB2YXIgcGVuZGluZ0NvdW50ID0gMDtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgYXJyYXlfcmVkdWNlKHByb21pc2VzLCBmdW5jdGlvbiAodW5kZWZpbmVkLCBwcm9taXNlLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIHNuYXBzaG90O1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGlzUHJvbWlzZShwcm9taXNlKSAmJlxuICAgICAgICAgICAgICAgIChzbmFwc2hvdCA9IHByb21pc2UuaW5zcGVjdCgpKS5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZXNbaW5kZXhdID0gc25hcHNob3QudmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICsrcGVuZGluZ0NvdW50O1xuICAgICAgICAgICAgICAgIHdoZW4oXG4gICAgICAgICAgICAgICAgICAgIHByb21pc2UsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoLS1wZW5kaW5nQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLm5vdGlmeSh7IGluZGV4OiBpbmRleCwgdmFsdWU6IHByb2dyZXNzIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdm9pZCAwKTtcbiAgICAgICAgaWYgKHBlbmRpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShwcm9taXNlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSk7XG59XG5cblByb21pc2UucHJvdG90eXBlLmFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYWxsKHRoaXMpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCByZXNvbHZlZCBwcm9taXNlIG9mIGFuIGFycmF5LiBQcmlvciByZWplY3RlZCBwcm9taXNlcyBhcmVcbiAqIGlnbm9yZWQuICBSZWplY3RzIG9ubHkgaWYgYWxsIHByb21pc2VzIGFyZSByZWplY3RlZC5cbiAqIEBwYXJhbSB7QXJyYXkqfSBhbiBhcnJheSBjb250YWluaW5nIHZhbHVlcyBvciBwcm9taXNlcyBmb3IgdmFsdWVzXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZnVsZmlsbGVkIHdpdGggdGhlIHZhbHVlIG9mIHRoZSBmaXJzdCByZXNvbHZlZCBwcm9taXNlLFxuICogb3IgYSByZWplY3RlZCBwcm9taXNlIGlmIGFsbCBwcm9taXNlcyBhcmUgcmVqZWN0ZWQuXG4gKi9cblEuYW55ID0gYW55O1xuXG5mdW5jdGlvbiBhbnkocHJvbWlzZXMpIHtcbiAgICBpZiAocHJvbWlzZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBRLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICB2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgdmFyIHBlbmRpbmdDb3VudCA9IDA7XG4gICAgYXJyYXlfcmVkdWNlKHByb21pc2VzLCBmdW5jdGlvbiAocHJldiwgY3VycmVudCwgaW5kZXgpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSBwcm9taXNlc1tpbmRleF07XG5cbiAgICAgICAgcGVuZGluZ0NvdW50Kys7XG5cbiAgICAgICAgd2hlbihwcm9taXNlLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcyk7XG4gICAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbGVkKHJlc3VsdCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQoKSB7XG4gICAgICAgICAgICBwZW5kaW5nQ291bnQtLTtcbiAgICAgICAgICAgIGlmIChwZW5kaW5nQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBcIkNhbid0IGdldCBmdWxmaWxsbWVudCB2YWx1ZSBmcm9tIGFueSBwcm9taXNlLCBhbGwgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInByb21pc2VzIHdlcmUgcmVqZWN0ZWQuXCJcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBvblByb2dyZXNzKHByb2dyZXNzKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvZ3Jlc3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgdW5kZWZpbmVkKTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5hbnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFueSh0aGlzKTtcbn07XG5cbi8qKlxuICogV2FpdHMgZm9yIGFsbCBwcm9taXNlcyB0byBiZSBzZXR0bGVkLCBlaXRoZXIgZnVsZmlsbGVkIG9yXG4gKiByZWplY3RlZC4gIFRoaXMgaXMgZGlzdGluY3QgZnJvbSBgYWxsYCBzaW5jZSB0aGF0IHdvdWxkIHN0b3BcbiAqIHdhaXRpbmcgYXQgdGhlIGZpcnN0IHJlamVjdGlvbi4gIFRoZSBwcm9taXNlIHJldHVybmVkIGJ5XG4gKiBgYWxsUmVzb2x2ZWRgIHdpbGwgbmV2ZXIgYmUgcmVqZWN0ZWQuXG4gKiBAcGFyYW0gcHJvbWlzZXMgYSBwcm9taXNlIGZvciBhbiBhcnJheSAob3IgYW4gYXJyYXkpIG9mIHByb21pc2VzXG4gKiAob3IgdmFsdWVzKVxuICogQHJldHVybiBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHByb21pc2VzXG4gKi9cblEuYWxsUmVzb2x2ZWQgPSBkZXByZWNhdGUoYWxsUmVzb2x2ZWQsIFwiYWxsUmVzb2x2ZWRcIiwgXCJhbGxTZXR0bGVkXCIpO1xuZnVuY3Rpb24gYWxsUmVzb2x2ZWQocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHByb21pc2VzID0gYXJyYXlfbWFwKHByb21pc2VzLCBRKTtcbiAgICAgICAgcmV0dXJuIHdoZW4oYWxsKGFycmF5X21hcChwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB3aGVuKHByb21pc2UsIG5vb3AsIG5vb3ApO1xuICAgICAgICB9KSksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlcztcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cblByb21pc2UucHJvdG90eXBlLmFsbFJlc29sdmVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbGxSZXNvbHZlZCh0aGlzKTtcbn07XG5cbi8qKlxuICogQHNlZSBQcm9taXNlI2FsbFNldHRsZWRcbiAqL1xuUS5hbGxTZXR0bGVkID0gYWxsU2V0dGxlZDtcbmZ1bmN0aW9uIGFsbFNldHRsZWQocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gUShwcm9taXNlcykuYWxsU2V0dGxlZCgpO1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIGFycmF5IG9mIHByb21pc2VzIGludG8gYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGVpciBzdGF0ZXMgKGFzXG4gKiByZXR1cm5lZCBieSBgaW5zcGVjdGApIHdoZW4gdGhleSBoYXZlIGFsbCBzZXR0bGVkLlxuICogQHBhcmFtIHtBcnJheVtBbnkqXX0gdmFsdWVzIGFuIGFycmF5IChvciBwcm9taXNlIGZvciBhbiBhcnJheSkgb2YgdmFsdWVzIChvclxuICogcHJvbWlzZXMgZm9yIHZhbHVlcylcbiAqIEByZXR1cm5zIHtBcnJheVtTdGF0ZV19IGFuIGFycmF5IG9mIHN0YXRlcyBmb3IgdGhlIHJlc3BlY3RpdmUgdmFsdWVzLlxuICovXG5Qcm9taXNlLnByb3RvdHlwZS5hbGxTZXR0bGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHJldHVybiBhbGwoYXJyYXlfbWFwKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICAgICAgcHJvbWlzZSA9IFEocHJvbWlzZSk7XG4gICAgICAgICAgICBmdW5jdGlvbiByZWdhcmRsZXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlLmluc3BlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlLnRoZW4ocmVnYXJkbGVzcywgcmVnYXJkbGVzcyk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ2FwdHVyZXMgdGhlIGZhaWx1cmUgb2YgYSBwcm9taXNlLCBnaXZpbmcgYW4gb3BvcnR1bml0eSB0byByZWNvdmVyXG4gKiB3aXRoIGEgY2FsbGJhY2suICBJZiB0aGUgZ2l2ZW4gcHJvbWlzZSBpcyBmdWxmaWxsZWQsIHRoZSByZXR1cm5lZFxuICogcHJvbWlzZSBpcyBmdWxmaWxsZWQuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgZm9yIHNvbWV0aGluZ1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gZnVsZmlsbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpZiB0aGVcbiAqIGdpdmVuIHByb21pc2UgaXMgcmVqZWN0ZWRcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgY2FsbGJhY2tcbiAqL1xuUS5mYWlsID0gLy8gWFhYIGxlZ2FjeVxuUVtcImNhdGNoXCJdID0gZnVuY3Rpb24gKG9iamVjdCwgcmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRoZW4odm9pZCAwLCByZWplY3RlZCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5mYWlsID0gLy8gWFhYIGxlZ2FjeVxuUHJvbWlzZS5wcm90b3R5cGVbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCByZWplY3RlZCk7XG59O1xuXG4vKipcbiAqIEF0dGFjaGVzIGEgbGlzdGVuZXIgdGhhdCBjYW4gcmVzcG9uZCB0byBwcm9ncmVzcyBub3RpZmljYXRpb25zIGZyb20gYVxuICogcHJvbWlzZSdzIG9yaWdpbmF0aW5nIGRlZmVycmVkLiBUaGlzIGxpc3RlbmVyIHJlY2VpdmVzIHRoZSBleGFjdCBhcmd1bWVudHNcbiAqIHBhc3NlZCB0byBgYGRlZmVycmVkLm5vdGlmeWBgLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGZvciBzb21ldGhpbmdcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIHJlY2VpdmUgYW55IHByb2dyZXNzIG5vdGlmaWNhdGlvbnNcbiAqIEByZXR1cm5zIHRoZSBnaXZlbiBwcm9taXNlLCB1bmNoYW5nZWRcbiAqL1xuUS5wcm9ncmVzcyA9IHByb2dyZXNzO1xuZnVuY3Rpb24gcHJvZ3Jlc3Mob2JqZWN0LCBwcm9ncmVzc2VkKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS50aGVuKHZvaWQgMCwgdm9pZCAwLCBwcm9ncmVzc2VkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUucHJvZ3Jlc3MgPSBmdW5jdGlvbiAocHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCB2b2lkIDAsIHByb2dyZXNzZWQpO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBvcHBvcnR1bml0eSB0byBvYnNlcnZlIHRoZSBzZXR0bGluZyBvZiBhIHByb21pc2UsXG4gKiByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHByb21pc2UgaXMgZnVsZmlsbGVkIG9yIHJlamVjdGVkLiAgRm9yd2FyZHNcbiAqIHRoZSByZXNvbHV0aW9uIHRvIHRoZSByZXR1cm5lZCBwcm9taXNlIHdoZW4gdGhlIGNhbGxiYWNrIGlzIGRvbmUuXG4gKiBUaGUgY2FsbGJhY2sgY2FuIHJldHVybiBhIHByb21pc2UgdG8gZGVmZXIgY29tcGxldGlvbi5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gb2JzZXJ2ZSB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW5cbiAqIHByb21pc2UsIHRha2VzIG5vIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2Ugd2hlblxuICogYGBmaW5gYCBpcyBkb25lLlxuICovXG5RLmZpbiA9IC8vIFhYWCBsZWdhY3lcblFbXCJmaW5hbGx5XCJdID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gUShvYmplY3QpW1wiZmluYWxseVwiXShjYWxsYmFjayk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5maW4gPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImZpbmFsbHlcIl0gPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIFRPRE8gYXR0ZW1wdCB0byByZWN5Y2xlIHRoZSByZWplY3Rpb24gd2l0aCBcInRoaXNcIi5cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUZXJtaW5hdGVzIGEgY2hhaW4gb2YgcHJvbWlzZXMsIGZvcmNpbmcgcmVqZWN0aW9ucyB0byBiZVxuICogdGhyb3duIGFzIGV4Y2VwdGlvbnMuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgYXQgdGhlIGVuZCBvZiBhIGNoYWluIG9mIHByb21pc2VzXG4gKiBAcmV0dXJucyBub3RoaW5nXG4gKi9cblEuZG9uZSA9IGZ1bmN0aW9uIChvYmplY3QsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kb25lKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIHtcbiAgICB2YXIgb25VbmhhbmRsZWRFcnJvciA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAvLyBmb3J3YXJkIHRvIGEgZnV0dXJlIHR1cm4gc28gdGhhdCBgYHdoZW5gYFxuICAgICAgICAvLyBkb2VzIG5vdCBjYXRjaCBpdCBhbmQgdHVybiBpdCBpbnRvIGEgcmVqZWN0aW9uLlxuICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSk7XG4gICAgICAgICAgICBpZiAoUS5vbmVycm9yKSB7XG4gICAgICAgICAgICAgICAgUS5vbmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBBdm9pZCB1bm5lY2Vzc2FyeSBgbmV4dFRpY2tgaW5nIHZpYSBhbiB1bm5lY2Vzc2FyeSBgd2hlbmAuXG4gICAgdmFyIHByb21pc2UgPSBmdWxmaWxsZWQgfHwgcmVqZWN0ZWQgfHwgcHJvZ3Jlc3MgP1xuICAgICAgICB0aGlzLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIDpcbiAgICAgICAgdGhpcztcblxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzICYmIHByb2Nlc3MuZG9tYWluKSB7XG4gICAgICAgIG9uVW5oYW5kbGVkRXJyb3IgPSBwcm9jZXNzLmRvbWFpbi5iaW5kKG9uVW5oYW5kbGVkRXJyb3IpO1xuICAgIH1cblxuICAgIHByb21pc2UudGhlbih2b2lkIDAsIG9uVW5oYW5kbGVkRXJyb3IpO1xufTtcblxuLyoqXG4gKiBDYXVzZXMgYSBwcm9taXNlIHRvIGJlIHJlamVjdGVkIGlmIGl0IGRvZXMgbm90IGdldCBmdWxmaWxsZWQgYmVmb3JlXG4gKiBzb21lIG1pbGxpc2Vjb25kcyB0aW1lIG91dC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtOdW1iZXJ9IG1pbGxpc2Vjb25kcyB0aW1lb3V0XG4gKiBAcGFyYW0ge0FueSp9IGN1c3RvbSBlcnJvciBtZXNzYWdlIG9yIEVycm9yIG9iamVjdCAob3B0aW9uYWwpXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIGlmIGl0IGlzXG4gKiBmdWxmaWxsZWQgYmVmb3JlIHRoZSB0aW1lb3V0LCBvdGhlcndpc2UgcmVqZWN0ZWQuXG4gKi9cblEudGltZW91dCA9IGZ1bmN0aW9uIChvYmplY3QsIG1zLCBlcnJvcikge1xuICAgIHJldHVybiBRKG9iamVjdCkudGltZW91dChtcywgZXJyb3IpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uIChtcywgZXJyb3IpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFlcnJvciB8fCBcInN0cmluZ1wiID09PSB0eXBlb2YgZXJyb3IpIHtcbiAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKGVycm9yIHx8IFwiVGltZWQgb3V0IGFmdGVyIFwiICsgbXMgKyBcIiBtc1wiKTtcbiAgICAgICAgICAgIGVycm9yLmNvZGUgPSBcIkVUSU1FRE9VVFwiO1xuICAgICAgICB9XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgfSwgbXMpO1xuXG4gICAgdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gKGV4Y2VwdGlvbikge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgfSwgZGVmZXJyZWQubm90aWZ5KTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIGdpdmVuIHZhbHVlIChvciBwcm9taXNlZCB2YWx1ZSksIHNvbWVcbiAqIG1pbGxpc2Vjb25kcyBhZnRlciBpdCByZXNvbHZlZC4gUGFzc2VzIHJlamVjdGlvbnMgaW1tZWRpYXRlbHkuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaWxsaXNlY29uZHNcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UgYWZ0ZXIgbWlsbGlzZWNvbmRzXG4gKiB0aW1lIGhhcyBlbGFwc2VkIHNpbmNlIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlLlxuICogSWYgdGhlIGdpdmVuIHByb21pc2UgcmVqZWN0cywgdGhhdCBpcyBwYXNzZWQgaW1tZWRpYXRlbHkuXG4gKi9cblEuZGVsYXkgPSBmdW5jdGlvbiAob2JqZWN0LCB0aW1lb3V0KSB7XG4gICAgaWYgKHRpbWVvdXQgPT09IHZvaWQgMCkge1xuICAgICAgICB0aW1lb3V0ID0gb2JqZWN0O1xuICAgICAgICBvYmplY3QgPSB2b2lkIDA7XG4gICAgfVxuICAgIHJldHVybiBRKG9iamVjdCkuZGVsYXkodGltZW91dCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kZWxheSA9IGZ1bmN0aW9uICh0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBQYXNzZXMgYSBjb250aW51YXRpb24gdG8gYSBOb2RlIGZ1bmN0aW9uLCB3aGljaCBpcyBjYWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAqIGFyZ3VtZW50cyBwcm92aWRlZCBhcyBhbiBhcnJheSwgYW5kIHJldHVybnMgYSBwcm9taXNlLlxuICpcbiAqICAgICAgUS5uZmFwcGx5KEZTLnJlYWRGaWxlLCBbX19maWxlbmFtZV0pXG4gKiAgICAgIC50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XG4gKiAgICAgIH0pXG4gKlxuICovXG5RLm5mYXBwbHkgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGFyZ3MpIHtcbiAgICByZXR1cm4gUShjYWxsYmFjaykubmZhcHBseShhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mYXBwbHkgPSBmdW5jdGlvbiAoYXJncykge1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJncyk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFBhc3NlcyBhIGNvbnRpbnVhdGlvbiB0byBhIE5vZGUgZnVuY3Rpb24sIHdoaWNoIGlzIGNhbGxlZCB3aXRoIHRoZSBnaXZlblxuICogYXJndW1lbnRzIHByb3ZpZGVkIGluZGl2aWR1YWxseSwgYW5kIHJldHVybnMgYSBwcm9taXNlLlxuICogQGV4YW1wbGVcbiAqIFEubmZjYWxsKEZTLnJlYWRGaWxlLCBfX2ZpbGVuYW1lKVxuICogLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAqIH0pXG4gKlxuICovXG5RLm5mY2FsbCA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gUShjYWxsYmFjaykubmZhcHBseShhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mY2FsbCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogV3JhcHMgYSBOb2RlSlMgY29udGludWF0aW9uIHBhc3NpbmcgZnVuY3Rpb24gYW5kIHJldHVybnMgYW4gZXF1aXZhbGVudFxuICogdmVyc2lvbiB0aGF0IHJldHVybnMgYSBwcm9taXNlLlxuICogQGV4YW1wbGVcbiAqIFEubmZiaW5kKEZTLnJlYWRGaWxlLCBfX2ZpbGVuYW1lKShcInV0Zi04XCIpXG4gKiAudGhlbihjb25zb2xlLmxvZylcbiAqIC5kb25lKClcbiAqL1xuUS5uZmJpbmQgPVxuUS5kZW5vZGVpZnkgPSBmdW5jdGlvbiAoY2FsbGJhY2sgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYmFzZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlQXJncyA9IGJhc2VBcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKTtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgICAgICBRKGNhbGxiYWNrKS5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mYmluZCA9XG5Qcm9taXNlLnByb3RvdHlwZS5kZW5vZGVpZnkgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuICAgIHJldHVybiBRLmRlbm9kZWlmeS5hcHBseSh2b2lkIDAsIGFyZ3MpO1xufTtcblxuUS5uYmluZCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc3AgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYmFzZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlQXJncyA9IGJhc2VBcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKTtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgICAgICBmdW5jdGlvbiBib3VuZCgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzcCwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBRKGJvdW5kKS5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5iaW5kID0gZnVuY3Rpb24gKC8qdGhpc3AsIC4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAwKTtcbiAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG4gICAgcmV0dXJuIFEubmJpbmQuYXBwbHkodm9pZCAwLCBhcmdzKTtcbn07XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb2YgYSBOb2RlLXN0eWxlIG9iamVjdCB0aGF0IGFjY2VwdHMgYSBOb2RlLXN0eWxlXG4gKiBjYWxsYmFjayB3aXRoIGEgZ2l2ZW4gYXJyYXkgb2YgYXJndW1lbnRzLCBwbHVzIGEgcHJvdmlkZWQgY2FsbGJhY2suXG4gKiBAcGFyYW0gb2JqZWN0IGFuIG9iamVjdCB0aGF0IGhhcyB0aGUgbmFtZWQgbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBtZXRob2Qgb2Ygb2JqZWN0XG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2Q7IHRoZSBjYWxsYmFja1xuICogd2lsbCBiZSBwcm92aWRlZCBieSBRIGFuZCBhcHBlbmRlZCB0byB0aGVzZSBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSB2YWx1ZSBvciBlcnJvclxuICovXG5RLm5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUS5ucG9zdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLm5wb3N0KG5hbWUsIGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5ucG9zdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJncyB8fCBbXSk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBvZiBhIE5vZGUtc3R5bGUgb2JqZWN0IHRoYXQgYWNjZXB0cyBhIE5vZGUtc3R5bGVcbiAqIGNhbGxiYWNrLCBmb3J3YXJkaW5nIHRoZSBnaXZlbiB2YXJpYWRpYyBhcmd1bWVudHMsIHBsdXMgYSBwcm92aWRlZFxuICogY2FsbGJhY2sgYXJndW1lbnQuXG4gKiBAcGFyYW0gb2JqZWN0IGFuIG9iamVjdCB0aGF0IGhhcyB0aGUgbmFtZWQgbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBtZXRob2Qgb2Ygb2JqZWN0XG4gKiBAcGFyYW0gLi4uYXJncyBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kOyB0aGUgY2FsbGJhY2sgd2lsbFxuICogYmUgcHJvdmlkZWQgYnkgUSBhbmQgYXBwZW5kZWQgdG8gdGhlc2UgYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgdmFsdWUgb3IgZXJyb3JcbiAqL1xuUS5uc2VuZCA9IC8vIFhYWCBCYXNlZCBvbiBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIFwic2VuZFwiXG5RLm5tY2FsbCA9IC8vIFhYWCBCYXNlZCBvbiBcIlJlZHNhbmRybydzXCIgcHJvcG9zYWxcblEubmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIFEob2JqZWN0KS5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubnNlbmQgPSAvLyBYWFggQmFzZWQgb24gTWFyayBNaWxsZXIncyBwcm9wb3NlZCBcInNlbmRcIlxuUHJvbWlzZS5wcm90b3R5cGUubm1jYWxsID0gLy8gWFhYIEJhc2VkIG9uIFwiUmVkc2FuZHJvJ3NcIiBwcm9wb3NhbFxuUHJvbWlzZS5wcm90b3R5cGUubmludm9rZSA9IGZ1bmN0aW9uIChuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIElmIGEgZnVuY3Rpb24gd291bGQgbGlrZSB0byBzdXBwb3J0IGJvdGggTm9kZSBjb250aW51YXRpb24tcGFzc2luZy1zdHlsZSBhbmRcbiAqIHByb21pc2UtcmV0dXJuaW5nLXN0eWxlLCBpdCBjYW4gZW5kIGl0cyBpbnRlcm5hbCBwcm9taXNlIGNoYWluIHdpdGhcbiAqIGBub2RlaWZ5KG5vZGViYWNrKWAsIGZvcndhcmRpbmcgdGhlIG9wdGlvbmFsIG5vZGViYWNrIGFyZ3VtZW50LiAgSWYgdGhlIHVzZXJcbiAqIGVsZWN0cyB0byB1c2UgYSBub2RlYmFjaywgdGhlIHJlc3VsdCB3aWxsIGJlIHNlbnQgdGhlcmUuICBJZiB0aGV5IGRvIG5vdFxuICogcGFzcyBhIG5vZGViYWNrLCB0aGV5IHdpbGwgcmVjZWl2ZSB0aGUgcmVzdWx0IHByb21pc2UuXG4gKiBAcGFyYW0gb2JqZWN0IGEgcmVzdWx0IChvciBhIHByb21pc2UgZm9yIGEgcmVzdWx0KVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbm9kZWJhY2sgYSBOb2RlLmpzLXN0eWxlIGNhbGxiYWNrXG4gKiBAcmV0dXJucyBlaXRoZXIgdGhlIHByb21pc2Ugb3Igbm90aGluZ1xuICovXG5RLm5vZGVpZnkgPSBub2RlaWZ5O1xuZnVuY3Rpb24gbm9kZWlmeShvYmplY3QsIG5vZGViYWNrKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5ub2RlaWZ5KG5vZGViYWNrKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUubm9kZWlmeSA9IGZ1bmN0aW9uIChub2RlYmFjaykge1xuICAgIGlmIChub2RlYmFjaykge1xuICAgICAgICB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub2RlYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub2RlYmFjayhlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufTtcblxuUS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUS5ub0NvbmZsaWN0IG9ubHkgd29ya3Mgd2hlbiBRIGlzIHVzZWQgYXMgYSBnbG9iYWxcIik7XG59O1xuXG4vLyBBbGwgY29kZSBiZWZvcmUgdGhpcyBwb2ludCB3aWxsIGJlIGZpbHRlcmVkIGZyb20gc3RhY2sgdHJhY2VzLlxudmFyIHFFbmRpbmdMaW5lID0gY2FwdHVyZUxpbmUoKTtcblxucmV0dXJuIFE7XG5cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3EvcS5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgc2NvcGUgPSAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBnbG9iYWwpIHx8XG4gICAgICAgICAgICAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgJiYgc2VsZikgfHxcbiAgICAgICAgICAgIHdpbmRvdztcbnZhciBhcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseTtcblxuLy8gRE9NIEFQSXMsIGZvciBjb21wbGV0ZW5lc3NcblxuZXhwb3J0cy5zZXRUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldFRpbWVvdXQsIHNjb3BlLCBhcmd1bWVudHMpLCBjbGVhclRpbWVvdXQpO1xufTtcbmV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0SW50ZXJ2YWwsIHNjb3BlLCBhcmd1bWVudHMpLCBjbGVhckludGVydmFsKTtcbn07XG5leHBvcnRzLmNsZWFyVGltZW91dCA9XG5leHBvcnRzLmNsZWFySW50ZXJ2YWwgPSBmdW5jdGlvbih0aW1lb3V0KSB7XG4gIGlmICh0aW1lb3V0KSB7XG4gICAgdGltZW91dC5jbG9zZSgpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBUaW1lb3V0KGlkLCBjbGVhckZuKSB7XG4gIHRoaXMuX2lkID0gaWQ7XG4gIHRoaXMuX2NsZWFyRm4gPSBjbGVhckZuO1xufVxuVGltZW91dC5wcm90b3R5cGUudW5yZWYgPSBUaW1lb3V0LnByb3RvdHlwZS5yZWYgPSBmdW5jdGlvbigpIHt9O1xuVGltZW91dC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fY2xlYXJGbi5jYWxsKHNjb3BlLCB0aGlzLl9pZCk7XG59O1xuXG4vLyBEb2VzIG5vdCBzdGFydCB0aGUgdGltZSwganVzdCBzZXRzIHVwIHRoZSBtZW1iZXJzIG5lZWRlZC5cbmV4cG9ydHMuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSwgbXNlY3MpIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IG1zZWNzO1xufTtcblxuZXhwb3J0cy51bmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IC0xO1xufTtcblxuZXhwb3J0cy5fdW5yZWZBY3RpdmUgPSBleHBvcnRzLmFjdGl2ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuXG4gIHZhciBtc2VjcyA9IGl0ZW0uX2lkbGVUaW1lb3V0O1xuICBpZiAobXNlY3MgPj0gMCkge1xuICAgIGl0ZW0uX2lkbGVUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uIG9uVGltZW91dCgpIHtcbiAgICAgIGlmIChpdGVtLl9vblRpbWVvdXQpXG4gICAgICAgIGl0ZW0uX29uVGltZW91dCgpO1xuICAgIH0sIG1zZWNzKTtcbiAgfVxufTtcblxuLy8gc2V0aW1tZWRpYXRlIGF0dGFjaGVzIGl0c2VsZiB0byB0aGUgZ2xvYmFsIG9iamVjdFxucmVxdWlyZShcInNldGltbWVkaWF0ZVwiKTtcbi8vIE9uIHNvbWUgZXhvdGljIGVudmlyb25tZW50cywgaXQncyBub3QgY2xlYXIgd2hpY2ggb2JqZWN0IGBzZXRpbW1lZGlhdGVgIHdhc1xuLy8gYWJsZSB0byBpbnN0YWxsIG9udG8uICBTZWFyY2ggZWFjaCBwb3NzaWJpbGl0eSBpbiB0aGUgc2FtZSBvcmRlciBhcyB0aGVcbi8vIGBzZXRpbW1lZGlhdGVgIGxpYnJhcnkuXG5leHBvcnRzLnNldEltbWVkaWF0ZSA9ICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBzZWxmLnNldEltbWVkaWF0ZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgJiYgZ2xvYmFsLnNldEltbWVkaWF0ZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgKHRoaXMgJiYgdGhpcy5zZXRJbW1lZGlhdGUpO1xuZXhwb3J0cy5jbGVhckltbWVkaWF0ZSA9ICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBzZWxmLmNsZWFySW1tZWRpYXRlKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiICYmIGdsb2JhbC5jbGVhckltbWVkaWF0ZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAodGhpcyAmJiB0aGlzLmNsZWFySW1tZWRpYXRlKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS9+L25vZGUtbGlicy1icm93c2VyL34vdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qc1xuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24gKGdsb2JhbCwgdW5kZWZpbmVkKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAoZ2xvYmFsLnNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5leHRIYW5kbGUgPSAxOyAvLyBTcGVjIHNheXMgZ3JlYXRlciB0aGFuIHplcm9cbiAgICB2YXIgdGFza3NCeUhhbmRsZSA9IHt9O1xuICAgIHZhciBjdXJyZW50bHlSdW5uaW5nQVRhc2sgPSBmYWxzZTtcbiAgICB2YXIgZG9jID0gZ2xvYmFsLmRvY3VtZW50O1xuICAgIHZhciByZWdpc3RlckltbWVkaWF0ZTtcblxuICAgIGZ1bmN0aW9uIHNldEltbWVkaWF0ZShjYWxsYmFjaykge1xuICAgICAgLy8gQ2FsbGJhY2sgY2FuIGVpdGhlciBiZSBhIGZ1bmN0aW9uIG9yIGEgc3RyaW5nXG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBuZXcgRnVuY3Rpb24oXCJcIiArIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICAgIC8vIENvcHkgZnVuY3Rpb24gYXJndW1lbnRzXG4gICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAxXTtcbiAgICAgIH1cbiAgICAgIC8vIFN0b3JlIGFuZCByZWdpc3RlciB0aGUgdGFza1xuICAgICAgdmFyIHRhc2sgPSB7IGNhbGxiYWNrOiBjYWxsYmFjaywgYXJnczogYXJncyB9O1xuICAgICAgdGFza3NCeUhhbmRsZVtuZXh0SGFuZGxlXSA9IHRhc2s7XG4gICAgICByZWdpc3RlckltbWVkaWF0ZShuZXh0SGFuZGxlKTtcbiAgICAgIHJldHVybiBuZXh0SGFuZGxlKys7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYXJJbW1lZGlhdGUoaGFuZGxlKSB7XG4gICAgICAgIGRlbGV0ZSB0YXNrc0J5SGFuZGxlW2hhbmRsZV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcnVuKHRhc2spIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gdGFzay5jYWxsYmFjaztcbiAgICAgICAgdmFyIGFyZ3MgPSB0YXNrLmFyZ3M7XG4gICAgICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBjYWxsYmFjayhhcmdzWzBdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBjYWxsYmFjayhhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBjYWxsYmFjayhhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodW5kZWZpbmVkLCBhcmdzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcnVuSWZQcmVzZW50KGhhbmRsZSkge1xuICAgICAgICAvLyBGcm9tIHRoZSBzcGVjOiBcIldhaXQgdW50aWwgYW55IGludm9jYXRpb25zIG9mIHRoaXMgYWxnb3JpdGhtIHN0YXJ0ZWQgYmVmb3JlIHRoaXMgb25lIGhhdmUgY29tcGxldGVkLlwiXG4gICAgICAgIC8vIFNvIGlmIHdlJ3JlIGN1cnJlbnRseSBydW5uaW5nIGEgdGFzaywgd2UnbGwgbmVlZCB0byBkZWxheSB0aGlzIGludm9jYXRpb24uXG4gICAgICAgIGlmIChjdXJyZW50bHlSdW5uaW5nQVRhc2spIHtcbiAgICAgICAgICAgIC8vIERlbGF5IGJ5IGRvaW5nIGEgc2V0VGltZW91dC4gc2V0SW1tZWRpYXRlIHdhcyB0cmllZCBpbnN0ZWFkLCBidXQgaW4gRmlyZWZveCA3IGl0IGdlbmVyYXRlZCBhXG4gICAgICAgICAgICAvLyBcInRvbyBtdWNoIHJlY3Vyc2lvblwiIGVycm9yLlxuICAgICAgICAgICAgc2V0VGltZW91dChydW5JZlByZXNlbnQsIDAsIGhhbmRsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdGFzayA9IHRhc2tzQnlIYW5kbGVbaGFuZGxlXTtcbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudGx5UnVubmluZ0FUYXNrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBydW4odGFzayk7XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbW1lZGlhdGUoaGFuZGxlKTtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudGx5UnVubmluZ0FUYXNrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbE5leHRUaWNrSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHsgcnVuSWZQcmVzZW50KGhhbmRsZSk7IH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhblVzZVBvc3RNZXNzYWdlKCkge1xuICAgICAgICAvLyBUaGUgdGVzdCBhZ2FpbnN0IGBpbXBvcnRTY3JpcHRzYCBwcmV2ZW50cyB0aGlzIGltcGxlbWVudGF0aW9uIGZyb20gYmVpbmcgaW5zdGFsbGVkIGluc2lkZSBhIHdlYiB3b3JrZXIsXG4gICAgICAgIC8vIHdoZXJlIGBnbG9iYWwucG9zdE1lc3NhZ2VgIG1lYW5zIHNvbWV0aGluZyBjb21wbGV0ZWx5IGRpZmZlcmVudCBhbmQgY2FuJ3QgYmUgdXNlZCBmb3IgdGhpcyBwdXJwb3NlLlxuICAgICAgICBpZiAoZ2xvYmFsLnBvc3RNZXNzYWdlICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cykge1xuICAgICAgICAgICAgdmFyIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXMgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIG9sZE9uTWVzc2FnZSA9IGdsb2JhbC5vbm1lc3NhZ2U7XG4gICAgICAgICAgICBnbG9iYWwub25tZXNzYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2VJc0FzeW5jaHJvbm91cyA9IGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShcIlwiLCBcIipcIik7XG4gICAgICAgICAgICBnbG9iYWwub25tZXNzYWdlID0gb2xkT25NZXNzYWdlO1xuICAgICAgICAgICAgcmV0dXJuIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsUG9zdE1lc3NhZ2VJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgLy8gSW5zdGFsbHMgYW4gZXZlbnQgaGFuZGxlciBvbiBgZ2xvYmFsYCBmb3IgdGhlIGBtZXNzYWdlYCBldmVudDogc2VlXG4gICAgICAgIC8vICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vRE9NL3dpbmRvdy5wb3N0TWVzc2FnZVxuICAgICAgICAvLyAqIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL2NvbW1zLmh0bWwjY3Jvc3NEb2N1bWVudE1lc3NhZ2VzXG5cbiAgICAgICAgdmFyIG1lc3NhZ2VQcmVmaXggPSBcInNldEltbWVkaWF0ZSRcIiArIE1hdGgucmFuZG9tKCkgKyBcIiRcIjtcbiAgICAgICAgdmFyIG9uR2xvYmFsTWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlID09PSBnbG9iYWwgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgZXZlbnQuZGF0YSA9PT0gXCJzdHJpbmdcIiAmJlxuICAgICAgICAgICAgICAgIGV2ZW50LmRhdGEuaW5kZXhPZihtZXNzYWdlUHJlZml4KSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJ1bklmUHJlc2VudCgrZXZlbnQuZGF0YS5zbGljZShtZXNzYWdlUHJlZml4Lmxlbmd0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIG9uR2xvYmFsTWVzc2FnZSwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2xvYmFsLmF0dGFjaEV2ZW50KFwib25tZXNzYWdlXCIsIG9uR2xvYmFsTWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKG1lc3NhZ2VQcmVmaXggKyBoYW5kbGUsIFwiKlwiKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsTWVzc2FnZUNoYW5uZWxJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZSA9IGV2ZW50LmRhdGE7XG4gICAgICAgICAgICBydW5JZlByZXNlbnQoaGFuZGxlKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZShoYW5kbGUpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxSZWFkeVN0YXRlQ2hhbmdlSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHZhciBodG1sID0gZG9jLmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIDxzY3JpcHQ+IGVsZW1lbnQ7IGl0cyByZWFkeXN0YXRlY2hhbmdlIGV2ZW50IHdpbGwgYmUgZmlyZWQgYXN5bmNocm9ub3VzbHkgb25jZSBpdCBpcyBpbnNlcnRlZFxuICAgICAgICAgICAgLy8gaW50byB0aGUgZG9jdW1lbnQuIERvIHNvLCB0aHVzIHF1ZXVpbmcgdXAgdGhlIHRhc2suIFJlbWVtYmVyIHRvIGNsZWFuIHVwIG9uY2UgaXQncyBiZWVuIGNhbGxlZC5cbiAgICAgICAgICAgIHZhciBzY3JpcHQgPSBkb2MuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcnVuSWZQcmVzZW50KGhhbmRsZSk7XG4gICAgICAgICAgICAgICAgc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgaHRtbC5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgICAgICAgICAgICAgIHNjcmlwdCA9IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaHRtbC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxTZXRUaW1lb3V0SW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJ1bklmUHJlc2VudCwgMCwgaGFuZGxlKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBJZiBzdXBwb3J0ZWQsIHdlIHNob3VsZCBhdHRhY2ggdG8gdGhlIHByb3RvdHlwZSBvZiBnbG9iYWwsIHNpbmNlIHRoYXQgaXMgd2hlcmUgc2V0VGltZW91dCBldCBhbC4gbGl2ZS5cbiAgICB2YXIgYXR0YWNoVG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKGdsb2JhbCk7XG4gICAgYXR0YWNoVG8gPSBhdHRhY2hUbyAmJiBhdHRhY2hUby5zZXRUaW1lb3V0ID8gYXR0YWNoVG8gOiBnbG9iYWw7XG5cbiAgICAvLyBEb24ndCBnZXQgZm9vbGVkIGJ5IGUuZy4gYnJvd3NlcmlmeSBlbnZpcm9ubWVudHMuXG4gICAgaWYgKHt9LnRvU3RyaW5nLmNhbGwoZ2xvYmFsLnByb2Nlc3MpID09PSBcIltvYmplY3QgcHJvY2Vzc11cIikge1xuICAgICAgICAvLyBGb3IgTm9kZS5qcyBiZWZvcmUgMC45XG4gICAgICAgIGluc3RhbGxOZXh0VGlja0ltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2UgaWYgKGNhblVzZVBvc3RNZXNzYWdlKCkpIHtcbiAgICAgICAgLy8gRm9yIG5vbi1JRTEwIG1vZGVybiBicm93c2Vyc1xuICAgICAgICBpbnN0YWxsUG9zdE1lc3NhZ2VJbXBsZW1lbnRhdGlvbigpO1xuXG4gICAgfSBlbHNlIGlmIChnbG9iYWwuTWVzc2FnZUNoYW5uZWwpIHtcbiAgICAgICAgLy8gRm9yIHdlYiB3b3JrZXJzLCB3aGVyZSBzdXBwb3J0ZWRcbiAgICAgICAgaW5zdGFsbE1lc3NhZ2VDaGFubmVsSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSBpZiAoZG9jICYmIFwib25yZWFkeXN0YXRlY2hhbmdlXCIgaW4gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIikpIHtcbiAgICAgICAgLy8gRm9yIElFIDbigJM4XG4gICAgICAgIGluc3RhbGxSZWFkeVN0YXRlQ2hhbmdlSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZvciBvbGRlciBicm93c2Vyc1xuICAgICAgICBpbnN0YWxsU2V0VGltZW91dEltcGxlbWVudGF0aW9uKCk7XG4gICAgfVxuXG4gICAgYXR0YWNoVG8uc2V0SW1tZWRpYXRlID0gc2V0SW1tZWRpYXRlO1xuICAgIGF0dGFjaFRvLmNsZWFySW1tZWRpYXRlID0gY2xlYXJJbW1lZGlhdGU7XG59KHR5cGVvZiBzZWxmID09PSBcInVuZGVmaW5lZFwiID8gdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHRoaXMgOiBnbG9iYWwgOiBzZWxmKSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvfi9ub2RlLWxpYnMtYnJvd3Nlci9+L3RpbWVycy1icm93c2VyaWZ5L34vc2V0aW1tZWRpYXRlL3NldEltbWVkaWF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9