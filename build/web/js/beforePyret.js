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
/******/ 	var hotCurrentHash = "52a2ac8e7aaf9fd7ad06"; // eslint-disable-line no-unused-vars
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
	
	var shareAPI = makeShareAPI((""));
	
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
	
	$(window).bind("beforeunload", function () {
	  return "Because this page can load slowly, and you may have outstanding changes, we ask that you confirm before leaving the editor in case closing was an accident.";
	});
	window.CPO = {
	  save: function save() {},
	  autoSave: function autoSave() {}
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
	
	    var gutters = !options.simpleEditor ? ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "test-marker-gutter"] : [];
	
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
	      lineWrapping: true
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
	      var upperWarning = jQuery("<div>").addClass("warning-upper");
	      var upperArrow = jQuery("<img>").addClass("warning-upper-arrow").attr("src", "/img/up-arrow.png");
	      upperWarning.append(upperArrow);
	      CM.display.wrapper.appendChild(upperWarning.get(0));
	      var lowerWarning = jQuery("<div>").addClass("warning-lower");
	      var lowerArrow = jQuery("<img>").addClass("warning-lower-arrow").attr("src", "/img/down-arrow.png");
	      lowerWarning.append(lowerArrow);
	      CM.display.wrapper.appendChild(lowerWarning.get(0));
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
	
	  programLoaded.then(function (c) {
	    var codeContainer = $("<div>").addClass("replMain");
	    $("#main").prepend(codeContainer);
	
	    CPO.editor = CPO.makeEditor(codeContainer, {
	      runButton: $("#runButton"),
	      simpleEditor: false,
	      initial: c,
	      run: CPO.RUN_CODE,
	      initialGas: 100
	    });
	    // NOTE(joe): Clearing history to address https://github.com/brownplt/pyret-lang/issues/386,
	    // in which undo can revert the program back to empty
	    CPO.editor.cm.clearHistory();
	  });
	
	  programLoaded.fail(function () {
	    var codeContainer = $("<div>").addClass("replMain");
	    $("#main").prepend(codeContainer);
	
	    CPO.editor = CPO.makeEditor(codeContainer, {
	      runButton: $("#runButton"),
	      simpleEditor: false,
	      run: CPO.RUN_CODE,
	      initialGas: 100
	    });
	  });
	
	  programLoaded.fin(function () {
	    var pyretLoad = document.createElement('script');
	    console.log('process.env is', JSON.stringify(process.env));
	    console.log('process.env.PYRET is', ("http://localhost:5000/js/cpo-main.jarr"));
	    console.log(("http://localhost:5000/js/cpo-main.jarr"));
	    pyretLoad.src = ("http://localhost:5000/js/cpo-main.jarr");
	    pyretLoad.type = "text/javascript";
	    document.body.appendChild(pyretLoad);
	    CPO.editor.focus();
	    $(pyretLoad).on("error", function () {
	      $("#loader").hide();
	      $("#runPart").hide();
	      $("#breakButton").hide();
	      window.stickError("Pyret failed to load; check your connection or try refreshing the page.  If this happens repeatedly, please report it as a bug.");
	    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNTJhMmFjOGU3YWFmOWZkN2FkMDYiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dlYi9qcy9iZWZvcmVQeXJldC5qcyIsIndlYnBhY2s6Ly8vLi9+L3Byb2Nlc3MvYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly8vLi9+L3VybC5qcy91cmwuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL21vZHVsZS5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vYW1kLWRlZmluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBLG1FQUEyRDtBQUMzRDtBQUNBO0FBQ0E7O0FBRUEsb0RBQTRDO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtEQUEwQztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxjQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkI7QUFDM0I7QUFDQSxZQUFJO0FBQ0o7QUFDQSxXQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBLHNEQUE4QztBQUM5QztBQUNBLHFDQUE2Qjs7QUFFN0IsK0NBQXVDO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQU07QUFDTixhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFPO0FBQ1AsY0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw4Q0FBc0M7QUFDdEM7QUFDQTtBQUNBLHFDQUE2QjtBQUM3QixxQ0FBNkI7QUFDN0I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBb0IsZ0JBQWdCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBb0IsZ0JBQWdCO0FBQ3BDO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxhQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLGFBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5QkFBaUIsOEJBQThCO0FBQy9DO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDBCQUFrQixxQkFBcUI7QUFDdkM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFJO0FBQ0o7O0FBRUEsNERBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxZQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQW1CLDJCQUEyQjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSwwQkFBa0IsY0FBYztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUJBQWlCLDRCQUE0QjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSwwQkFBa0IsNEJBQTRCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLDBCQUFrQiw0QkFBNEI7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQW1CLHVDQUF1QztBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBbUIsdUNBQXVDO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBbUIsc0JBQXNCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBLGVBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx5QkFBaUIsd0NBQXdDO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsZUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLGNBQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSw4Q0FBc0MsdUJBQXVCOztBQUU3RDtBQUNBOzs7Ozs7Ozs7OztBQy9qQkEsS0FBSSxXQUFXLGFBQWEsSUFBYixDQUFmOztBQUVBLEtBQUksTUFBTSxvQkFBUSxDQUFSLENBQVY7O0FBRUEsS0FBTSxNQUFNLElBQVo7QUFDQSxRQUFPLE1BQVAsR0FBZ0IsWSxhQUF3QjtBQUN0QyxPQUFJLE9BQU8sT0FBUCxJQUFrQixHQUF0QixFQUEyQjtBQUN6QixhQUFRLEdBQVIsQ0FBWSxLQUFaLENBQWtCLE9BQWxCLEVBQTJCLFNBQTNCO0FBQ0Q7QUFDRixFQUpEOztBQU1BLFFBQU8sUUFBUCxHQUFrQixZLGFBQXdCO0FBQ3hDLE9BQUksT0FBTyxPQUFQLElBQWtCLEdBQXRCLEVBQTJCO0FBQ3pCLGFBQVEsS0FBUixDQUFjLEtBQWQsQ0FBb0IsT0FBcEIsRUFBNkIsU0FBN0I7QUFDRDtBQUNGLEVBSkQ7QUFLQSxLQUFJLGdCQUFnQixJQUFJLEtBQUosQ0FBVSxTQUFTLFFBQVQsQ0FBa0IsSUFBNUIsQ0FBcEI7QUFDQSxLQUFJLFNBQVMsSUFBSSxLQUFKLENBQVUsT0FBTyxjQUFjLE1BQWQsQ0FBakIsQ0FBYjtBQUNBLFFBQU8sYUFBUCxHQUF1QixNQUF2QixDO0FBQ0EsUUFBTyxVQUFQLEdBQW9CLFlBQVc7QUFDN0IsS0FBRSxtQkFBRixFQUF1QixLQUF2QjtBQUNELEVBRkQ7QUFHQSxRQUFPLFVBQVAsR0FBb0IsVUFBUyxPQUFULEVBQWtCLElBQWxCLEVBQXdCO0FBQzFDO0FBQ0EsT0FBSSxNQUFNLEVBQUUsT0FBRixFQUFXLFFBQVgsQ0FBb0IsT0FBcEIsRUFBNkIsSUFBN0IsQ0FBa0MsT0FBbEMsQ0FBVjtBQUNBLE9BQUcsSUFBSCxFQUFTO0FBQ1AsU0FBSSxJQUFKLENBQVMsT0FBVCxFQUFrQixJQUFsQjtBQUNEO0FBQ0QsT0FBSSxPQUFKO0FBQ0EsS0FBRSxtQkFBRixFQUF1QixPQUF2QixDQUErQixHQUEvQjtBQUNELEVBUkQ7QUFTQSxRQUFPLFVBQVAsR0FBb0IsVUFBUyxPQUFULEVBQWtCO0FBQ3BDO0FBQ0EsT0FBSSxNQUFNLEVBQUUsT0FBRixFQUFXLFFBQVgsQ0FBb0IsT0FBcEIsRUFBNkIsSUFBN0IsQ0FBa0MsT0FBbEMsQ0FBVjtBQUNBLEtBQUUsbUJBQUYsRUFBdUIsT0FBdkIsQ0FBK0IsR0FBL0I7QUFDQSxPQUFJLE9BQUosQ0FBWSxJQUFaO0FBQ0QsRUFMRDtBQU1BLFFBQU8sWUFBUCxHQUFzQixVQUFTLE9BQVQsRUFBa0I7QUFDdEM7QUFDQSxPQUFJLE1BQU0sRUFBRSxPQUFGLEVBQVcsUUFBWCxDQUFvQixRQUFwQixFQUE4QixJQUE5QixDQUFtQyxPQUFuQyxDQUFWO0FBQ0EsS0FBRSxtQkFBRixFQUF1QixPQUF2QixDQUErQixHQUEvQjtBQUNBLE9BQUksT0FBSixDQUFZLElBQVo7QUFDRCxFQUxEO0FBTUEsUUFBTyxZQUFQLEdBQXNCLFVBQVMsT0FBVCxFQUFrQjtBQUN0QztBQUNBLE9BQUksTUFBTSxFQUFFLE9BQUYsRUFBVyxRQUFYLENBQW9CLFFBQXBCLEVBQThCLElBQTlCLENBQW1DLE9BQW5DLENBQVY7QUFDQSxLQUFFLG1CQUFGLEVBQXVCLE9BQXZCLENBQStCLEdBQS9CO0FBQ0QsRUFKRDs7QUFNQSxHQUFFLE1BQUYsRUFBVSxJQUFWLENBQWUsY0FBZixFQUErQixZQUFXO0FBQ3hDLFVBQU8sNkpBQVA7QUFDRCxFQUZEO0FBR0EsUUFBTyxHQUFQLEdBQWE7QUFDWCxTQUFNLGdCQUFXLENBQUUsQ0FEUjtBQUVYLGFBQVUsb0JBQVcsQ0FBRTtBQUZaLEVBQWI7QUFJQSxHQUFFLFlBQVc7QUFDWCxZQUFTLEtBQVQsQ0FBZSxHQUFmLEVBQW9CLFNBQXBCLEVBQStCO0FBQzdCLFNBQUksU0FBUyxFQUFiO0FBQ0EsWUFBTyxJQUFQLENBQVksR0FBWixFQUFpQixPQUFqQixDQUF5QixVQUFTLENBQVQsRUFBWTtBQUNuQyxjQUFPLENBQVAsSUFBWSxJQUFJLENBQUosQ0FBWjtBQUNELE1BRkQ7QUFHQSxZQUFPLElBQVAsQ0FBWSxTQUFaLEVBQXVCLE9BQXZCLENBQStCLFVBQVMsQ0FBVCxFQUFZO0FBQ3pDLGNBQU8sQ0FBUCxJQUFZLFVBQVUsQ0FBVixDQUFaO0FBQ0QsTUFGRDtBQUdBLFlBQU8sTUFBUDtBQUNEO0FBQ0QsT0FBSSxlQUFlLElBQW5CO0FBQ0EsWUFBUyxvQkFBVCxHQUFnQztBQUM5QixTQUFHLFlBQUgsRUFBaUI7QUFDZixvQkFBYSxLQUFiO0FBQ0Esb0JBQWEsTUFBYixDQUFvQixTQUFwQjtBQUNBLHNCQUFlLElBQWY7QUFDRDtBQUNGO0FBQ0QsT0FBSSxVQUFKLEdBQWlCLFVBQVMsU0FBVCxFQUFvQixPQUFwQixFQUE2QjtBQUM1QyxTQUFJLFVBQVUsRUFBZDtBQUNBLFNBQUksUUFBUSxjQUFSLENBQXVCLFNBQXZCLENBQUosRUFBdUM7QUFDckMsaUJBQVUsUUFBUSxPQUFsQjtBQUNEOztBQUVELFNBQUksV0FBVyxPQUFPLFlBQVAsQ0FBZjtBQUNBLGNBQVMsR0FBVCxDQUFhLE9BQWI7QUFDQSxlQUFVLE1BQVYsQ0FBaUIsUUFBakI7O0FBRUEsU0FBSSxTQUFTLFNBQVQsTUFBUyxDQUFVLElBQVYsRUFBZ0IsV0FBaEIsRUFBNkI7QUFDeEMsZUFBUSxHQUFSLENBQVksSUFBWixFQUFrQixFQUFDLElBQUksRUFBTCxFQUFsQixFQUE0QixXQUE1QjtBQUNELE1BRkQ7O0FBSUEsU0FBSSxpQkFBaUIsQ0FBQyxRQUFRLFlBQTlCO0FBQ0EsU0FBSSxhQUFhLENBQUMsUUFBUSxZQUExQjs7QUFFQSxTQUFJLFVBQVUsQ0FBQyxRQUFRLFlBQVQsR0FDWixDQUFDLHdCQUFELEVBQTJCLHVCQUEzQixFQUFvRCxvQkFBcEQsQ0FEWSxHQUVaLEVBRkY7O0FBSUEsY0FBUyxnQkFBVCxDQUEwQixFQUExQixFQUE4QjtBQUM1QixXQUFJLE9BQU8sR0FBRyxTQUFILEVBQVg7QUFDQSxVQUFHLFNBQUgsQ0FBYSxZQUFXO0FBQ3RCLGNBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFwQixFQUEwQixFQUFFLENBQTVCO0FBQStCLGNBQUcsVUFBSCxDQUFjLENBQWQ7QUFBL0I7QUFDRCxRQUZEO0FBR0Q7O0FBRUQsU0FBSSxZQUFZO0FBQ2Qsa0JBQVc7QUFDVCx3QkFBZSxvQkFBUyxFQUFULEVBQWE7QUFBRSxrQkFBTyxHQUFHLFFBQUgsRUFBUDtBQUF3QixVQUQ3QztBQUVULDZCQUFvQix3QkFBUyxFQUFULEVBQWE7QUFBRSxrQkFBTyxHQUFHLFFBQUgsRUFBUDtBQUF3QixVQUZsRDtBQUdULGdCQUFPLFlBSEU7QUFJVCxtQkFBVTtBQUpELFFBREc7QUFPZCxtQkFBWSxDQVBFO0FBUWQsZ0JBQVMsQ0FSSztBQVNkLHVCQUFnQixRQVRGO0FBVWQsb0JBQWEsY0FWQztBQVdkLHNCQUFlLElBWEQ7QUFZZCxzQkFBZSxJQVpEO0FBYWQsMEJBQW1CLElBYkw7QUFjZCxtQkFBWSxVQWRFO0FBZWQsZ0JBQVMsT0FmSztBQWdCZCxxQkFBYztBQWhCQSxNQUFoQjs7QUFtQkEsaUJBQVksTUFBTSxTQUFOLEVBQWlCLFFBQVEsU0FBUixJQUFxQixFQUF0QyxDQUFaOztBQUVBLFNBQUksS0FBSyxXQUFXLFlBQVgsQ0FBd0IsU0FBUyxDQUFULENBQXhCLEVBQXFDLFNBQXJDLENBQVQ7O0FBRUEsU0FBSSxRQUFKOztBQUVBLFNBQUksT0FBTyxnQkFBUCxLQUE0QixXQUFoQyxFQUE2QztBQUMzQyxlQUFRLEdBQVIsQ0FBWSw0QkFBWjtBQUNBLGtCQUFXLFNBQVg7QUFDRCxNQUhELE1BR087QUFDTCxrQkFBVyxJQUFJLGdCQUFKLENBQXFCLEVBQXJCLEVBQ1QsVUFEUyxFQUVUO0FBQ0UseUJBQWdCLHdCQUFTLGNBQVQsRUFBeUIsVUFBekIsRUFBcUMsV0FBckMsRUFBa0Q7QUFDaEUsZUFBSSxPQUFPLEdBQUcsTUFBSCxDQUFVLE9BQVYsQ0FBa0IsWUFBWSxJQUE5QixDQUFYO0FBQ0EsZUFBSSxZQUFZLEVBQVosR0FBaUIsQ0FBakIsSUFBc0IsS0FBSyxZQUFZLEVBQVosR0FBaUIsQ0FBdEIsRUFBeUIsS0FBekIsQ0FBK0IsUUFBL0IsQ0FBMUIsRUFBb0U7O0FBRWxFLDhCQUFpQixNQUFNLGNBQXZCO0FBQ0Q7O0FBRUQsZUFBSSxZQUFZLEVBQVosR0FBaUIsS0FBSyxNQUF0QixJQUFnQyxLQUFLLFlBQVksRUFBakIsRUFBcUIsS0FBckIsQ0FBMkIsUUFBM0IsQ0FBcEMsRUFBMEU7O0FBRXhFLCtCQUFrQixHQUFsQjtBQUNEO0FBQ0Qsa0JBQU8sY0FBUDtBQUNEO0FBYkgsUUFGUyxDQUFYO0FBaUJBLFVBQUcsWUFBSCxHQUFrQixRQUFsQjtBQUNBLFVBQUcsVUFBSCxHQUFnQixVQUFTLElBQVQsRUFBZTtBQUM3QixhQUFJLFNBQVMsT0FBYixFQUFzQjtBQUNwQixrQkFBTyxLQUFQO0FBQ0QsVUFGRCxNQUVPO0FBQ0wsb0JBQVMsR0FBVCxHQUFlLElBQWY7QUFDRDtBQUNELGtCQUFTLFlBQVQsQ0FBc0IsSUFBdEI7QUFDRCxRQVBEO0FBUUQ7O0FBRUQsU0FBSSxjQUFKLEVBQW9CO0FBQ2xCLFdBQUksZUFBZSxPQUFPLE9BQVAsRUFBZ0IsUUFBaEIsQ0FBeUIsZUFBekIsQ0FBbkI7QUFDQSxXQUFJLGFBQWEsT0FBTyxPQUFQLEVBQWdCLFFBQWhCLENBQXlCLHFCQUF6QixFQUFnRCxJQUFoRCxDQUFxRCxLQUFyRCxFQUE0RCxtQkFBNUQsQ0FBakI7QUFDQSxvQkFBYSxNQUFiLENBQW9CLFVBQXBCO0FBQ0EsVUFBRyxPQUFILENBQVcsT0FBWCxDQUFtQixXQUFuQixDQUErQixhQUFhLEdBQWIsQ0FBaUIsQ0FBakIsQ0FBL0I7QUFDQSxXQUFJLGVBQWUsT0FBTyxPQUFQLEVBQWdCLFFBQWhCLENBQXlCLGVBQXpCLENBQW5CO0FBQ0EsV0FBSSxhQUFhLE9BQU8sT0FBUCxFQUFnQixRQUFoQixDQUF5QixxQkFBekIsRUFBZ0QsSUFBaEQsQ0FBcUQsS0FBckQsRUFBNEQscUJBQTVELENBQWpCO0FBQ0Esb0JBQWEsTUFBYixDQUFvQixVQUFwQjtBQUNBLFVBQUcsT0FBSCxDQUFXLE9BQVgsQ0FBbUIsV0FBbkIsQ0FBK0IsYUFBYSxHQUFiLENBQWlCLENBQWpCLENBQS9CO0FBQ0Q7O0FBRUQsWUFBTztBQUNMLFdBQUksRUFEQztBQUVMLGdCQUFTLG1CQUFXO0FBQUUsWUFBRyxPQUFIO0FBQWUsUUFGaEM7QUFHTCxZQUFLLGVBQVc7QUFDZCxnQkFBTyxHQUFHLFFBQUgsRUFBUDtBQUNELFFBTEk7QUFNTCxjQUFPLGlCQUFXO0FBQUUsWUFBRyxLQUFIO0FBQWE7QUFONUIsTUFBUDtBQVFELElBeEdEO0FBeUdBLE9BQUksUUFBSixHQUFlLFlBQVcsQ0FFekIsQ0FGRDs7QUFJQSxjQUFXLElBQVgsQ0FBZ0IsVUFBUyxHQUFULEVBQWM7QUFDNUIsU0FBSSxVQUFKLENBQWUsSUFBZixDQUFvQixZQUFXO0FBQzdCLFNBQUUsWUFBRixFQUFnQixJQUFoQjtBQUNBLFNBQUUsYUFBRixFQUFpQixJQUFqQjtBQUNBLFdBQUksR0FBSixDQUFRLGlCQUFSLEdBQTRCLElBQTVCLENBQWlDLFVBQVMsSUFBVCxFQUFlO0FBQzlDLFdBQUUsZUFBRixFQUFtQixJQUFuQixDQUF3QixNQUF4QixFQUFnQyxJQUFoQztBQUNELFFBRkQ7QUFHRCxNQU5EO0FBT0EsU0FBSSxVQUFKLENBQWUsSUFBZixDQUFvQixZQUFXO0FBQzdCLFNBQUUsWUFBRixFQUFnQixJQUFoQjtBQUNBLFNBQUUsYUFBRixFQUFpQixJQUFqQjtBQUNELE1BSEQ7QUFJRCxJQVpEOztBQWNBLGdCQUFhLFdBQVcsSUFBWCxDQUFnQixVQUFTLEdBQVQsRUFBYztBQUFFLFlBQU8sSUFBSSxHQUFYO0FBQWlCLElBQWpELENBQWI7QUFDQSxLQUFFLGdCQUFGLEVBQW9CLEtBQXBCLENBQTBCLFlBQVc7QUFDbkMsT0FBRSxnQkFBRixFQUFvQixJQUFwQixDQUF5QixlQUF6QjtBQUNBLE9BQUUsZ0JBQUYsRUFBb0IsSUFBcEIsQ0FBeUIsVUFBekIsRUFBcUMsVUFBckM7QUFDQSxrQkFBYSwyQkFBMkIsZ0JBQTNCLEVBQTZDLEtBQTdDLENBQWI7QUFDQSxnQkFBVyxJQUFYLENBQWdCLFVBQVMsR0FBVCxFQUFjO0FBQzVCLFdBQUksVUFBSixDQUFlLElBQWYsQ0FBb0IsWUFBVztBQUM3QixXQUFFLFlBQUYsRUFBZ0IsSUFBaEI7QUFDQSxXQUFFLGFBQUYsRUFBaUIsSUFBakI7QUFDQSxhQUFJLEdBQUosQ0FBUSxpQkFBUixHQUE0QixJQUE1QixDQUFpQyxVQUFTLElBQVQsRUFBZTtBQUM5QyxhQUFFLGVBQUYsRUFBbUIsSUFBbkIsQ0FBd0IsTUFBeEIsRUFBZ0MsSUFBaEM7QUFDRCxVQUZEO0FBR0EsYUFBRyxPQUFPLEtBQVAsS0FBaUIsT0FBTyxLQUFQLEVBQWMsU0FBZCxDQUFwQixFQUE4QztBQUM1QyxlQUFJLFNBQVMsSUFBSSxHQUFKLENBQVEsV0FBUixDQUFvQixPQUFPLEtBQVAsRUFBYyxTQUFkLENBQXBCLENBQWI7QUFDQSxtQkFBUSxHQUFSLENBQVkscUNBQVosRUFBbUQsTUFBbkQ7QUFDQSx1QkFBWSxNQUFaO0FBQ0EsMkJBQWdCLE1BQWhCO0FBQ0QsVUFMRCxNQUtPO0FBQ0wsMkJBQWdCLEVBQUUsS0FBRixDQUFRLFlBQVc7QUFBRSxvQkFBTyxJQUFQO0FBQWMsWUFBbkMsQ0FBaEI7QUFDRDtBQUNGLFFBZEQ7QUFlQSxXQUFJLFVBQUosQ0FBZSxJQUFmLENBQW9CLFlBQVc7QUFDN0IsV0FBRSxnQkFBRixFQUFvQixJQUFwQixDQUF5Qix5QkFBekI7QUFDQSxXQUFFLGdCQUFGLEVBQW9CLElBQXBCLENBQXlCLFVBQXpCLEVBQXFDLEtBQXJDO0FBQ0QsUUFIRDtBQUlELE1BcEJEO0FBcUJBLGtCQUFhLFdBQVcsSUFBWCxDQUFnQixVQUFTLEdBQVQsRUFBYztBQUFFLGNBQU8sSUFBSSxHQUFYO0FBQWlCLE1BQWpELENBQWI7QUFDRCxJQTFCRDs7QUE0QkEsT0FBSSxhQUFhLEtBQWpCOztBQUVBLE9BQUksaUJBQWlCLFdBQVcsSUFBWCxDQUFnQixVQUFTLEdBQVQsRUFBYztBQUNqRCxTQUFJLGNBQWMsSUFBbEI7QUFDQSxTQUFHLE9BQU8sS0FBUCxLQUFpQixPQUFPLEtBQVAsRUFBYyxTQUFkLENBQXBCLEVBQThDO0FBQzVDLHFCQUFjLElBQUksV0FBSixDQUFnQixPQUFPLEtBQVAsRUFBYyxTQUFkLENBQWhCLENBQWQ7QUFDQSxtQkFBWSxJQUFaLENBQWlCLFVBQVMsQ0FBVCxFQUFZO0FBQUUsNEJBQW1CLENBQW5CO0FBQXdCLFFBQXZEO0FBQ0Q7QUFDRCxTQUFHLE9BQU8sS0FBUCxLQUFpQixPQUFPLEtBQVAsRUFBYyxPQUFkLENBQXBCLEVBQTRDO0FBQzFDLHFCQUFjLElBQUksaUJBQUosQ0FBc0IsT0FBTyxLQUFQLEVBQWMsT0FBZCxDQUF0QixDQUFkO0FBQ0EsU0FBRSxhQUFGLEVBQWlCLElBQWpCLENBQXNCLGFBQXRCO0FBQ0Esb0JBQWEsSUFBYjtBQUNEO0FBQ0QsU0FBRyxXQUFILEVBQWdCO0FBQ2QsbUJBQVksSUFBWixDQUFpQixVQUFTLEdBQVQsRUFBYztBQUM3QixpQkFBUSxLQUFSLENBQWMsR0FBZDtBQUNBLGdCQUFPLFVBQVAsQ0FBa0IsNkJBQWxCO0FBQ0QsUUFIRDtBQUlBLGNBQU8sV0FBUDtBQUNELE1BTkQsTUFNTztBQUNMLGNBQU8sSUFBUDtBQUNEO0FBQ0YsSUFwQm9CLENBQXJCOztBQXNCQSxZQUFTLFFBQVQsQ0FBa0IsUUFBbEIsRUFBNEI7QUFDMUIsY0FBUyxLQUFULEdBQWlCLFdBQVcsbUJBQTVCO0FBQ0Q7QUFDRCxPQUFJLFFBQUosR0FBZSxRQUFmOztBQUVBLEtBQUUsYUFBRixFQUFpQixLQUFqQixDQUF1QixZQUFXO0FBQ2hDLFNBQUksY0FBYyxFQUFFLGFBQUYsQ0FBbEI7QUFDQSxTQUFJLFdBQVcsSUFBSSxNQUFKLENBQVcsRUFBWCxDQUFjLFFBQWQsRUFBZjtBQUNBLFNBQUksZUFBZSxPQUFPLEdBQVAsQ0FBVyxlQUFYLENBQTJCLElBQUksSUFBSixDQUFTLENBQUMsUUFBRCxDQUFULEVBQXFCLEVBQUMsTUFBTSxZQUFQLEVBQXJCLENBQTNCLENBQW5CO0FBQ0EsU0FBSSxXQUFXLEVBQUUsZUFBRixFQUFtQixHQUFuQixFQUFmO0FBQ0EsU0FBRyxDQUFDLFFBQUosRUFBYztBQUFFLGtCQUFXLHNCQUFYO0FBQW9DO0FBQ3BELFNBQUcsU0FBUyxPQUFULENBQWlCLE1BQWpCLE1BQThCLFNBQVMsTUFBVCxHQUFrQixDQUFuRCxFQUF1RDtBQUNyRCxtQkFBWSxNQUFaO0FBQ0Q7QUFDRCxpQkFBWSxJQUFaLENBQWlCO0FBQ2YsaUJBQVUsUUFESztBQUVmLGFBQU07QUFGUyxNQUFqQjtBQUlBLE9BQUUsV0FBRixFQUFlLE1BQWYsQ0FBc0IsV0FBdEI7QUFDRCxJQWREOztBQWdCQSxZQUFTLFdBQVQsQ0FBcUIsQ0FBckIsRUFBd0I7QUFDdEIsWUFBTyxFQUFFLElBQUYsQ0FBTyxVQUFTLENBQVQsRUFBWTtBQUN4QixXQUFHLE1BQU0sSUFBVCxFQUFlO0FBQ2IsV0FBRSxlQUFGLEVBQW1CLEdBQW5CLENBQXVCLEVBQUUsT0FBRixFQUF2QjtBQUNBLGtCQUFTLEVBQUUsT0FBRixFQUFUO0FBQ0EsZ0JBQU8sRUFBRSxXQUFGLEVBQVA7QUFDRDtBQUNGLE1BTk0sQ0FBUDtBQU9EOztBQUVELE9BQUksZ0JBQWdCLFlBQVksY0FBWixDQUFwQjs7QUFFQSxPQUFJLGdCQUFnQixjQUFwQjs7QUFFQSxZQUFTLGtCQUFULENBQTRCLENBQTVCLEVBQStCO0FBQzdCLE9BQUUsaUJBQUYsRUFBcUIsS0FBckI7QUFDQSxPQUFFLGlCQUFGLEVBQXFCLE1BQXJCLENBQTRCLFNBQVMsYUFBVCxDQUF1QixDQUF2QixDQUE1QjtBQUNEOztBQUVELFlBQVMsY0FBVCxHQUEwQjtBQUN4QixZQUFPLEVBQUUsZUFBRixFQUFtQixHQUFuQixNQUE0QixVQUFuQztBQUNEO0FBQ0QsWUFBUyxRQUFULEdBQW9CO0FBQ2xCLG1CQUFjLElBQWQsQ0FBbUIsVUFBUyxDQUFULEVBQVk7QUFDN0IsV0FBRyxNQUFNLElBQU4sSUFBYyxDQUFDLFVBQWxCLEVBQThCO0FBQUU7QUFBUztBQUMxQyxNQUZEO0FBR0Q7QUFDRCxPQUFJLFFBQUosR0FBZSxRQUFmO0FBQ0EsT0FBSSxrQkFBSixHQUF5QixrQkFBekI7QUFDQSxPQUFJLFdBQUosR0FBa0IsV0FBbEI7O0FBRUEsWUFBUyxJQUFULEdBQWdCO0FBQ2QsWUFBTyxZQUFQLENBQW9CLFdBQXBCO0FBQ0EsU0FBSSxlQUFlLGNBQWMsSUFBZCxDQUFtQixVQUFTLENBQVQsRUFBWTtBQUNoRCxXQUFHLE1BQU0sSUFBTixJQUFjLENBQUMsVUFBbEIsRUFBOEI7QUFDNUIsYUFBRyxFQUFFLE9BQUYsT0FBZ0IsRUFBRSxlQUFGLEVBQW1CLEdBQW5CLEVBQW5CLEVBQTZDO0FBQzNDLDJCQUFnQixFQUFFLE1BQUYsQ0FBUyxnQkFBVCxFQUEyQixJQUEzQixDQUFnQyxVQUFTLElBQVQsRUFBZTtBQUM3RCxvQkFBTyxJQUFQO0FBQ0QsWUFGZSxDQUFoQjtBQUdEO0FBQ0QsZ0JBQU8sY0FDTixJQURNLENBQ0QsVUFBUyxDQUFULEVBQVk7QUFDaEIsOEJBQW1CLENBQW5CO0FBQ0Esa0JBQU8sRUFBRSxJQUFGLENBQU8sSUFBSSxNQUFKLENBQVcsRUFBWCxDQUFjLFFBQWQsRUFBUCxFQUFpQyxLQUFqQyxDQUFQO0FBQ0QsVUFKTSxFQUtOLElBTE0sQ0FLRCxVQUFTLENBQVQsRUFBWTtBQUNoQixhQUFFLGVBQUYsRUFBbUIsR0FBbkIsQ0FBdUIsRUFBRSxPQUFGLEVBQXZCO0FBQ0EsYUFBRSxhQUFGLEVBQWlCLElBQWpCLENBQXNCLE1BQXRCO0FBQ0EsbUJBQVEsU0FBUixDQUFrQixJQUFsQixFQUF3QixJQUF4QixFQUE4QixjQUFjLEVBQUUsV0FBRixFQUE1QztBQUNBLGtCQUFPLFFBQVAsQ0FBZ0IsSUFBaEIsR0FBdUIsY0FBYyxFQUFFLFdBQUYsRUFBckM7QUFDQSxrQkFBTyxZQUFQLENBQW9CLHNCQUFzQixFQUFFLE9BQUYsRUFBMUM7QUFDQSxvQkFBUyxFQUFFLE9BQUYsRUFBVDtBQUNBLGtCQUFPLENBQVA7QUFDRCxVQWJNLENBQVA7QUFjRCxRQXBCRCxNQXFCSztBQUNILGFBQUksY0FBYyxFQUFFLGVBQUYsRUFBbUIsR0FBbkIsTUFBNEIsVUFBOUM7QUFDQSxXQUFFLGVBQUYsRUFBbUIsR0FBbkIsQ0FBdUIsV0FBdkI7QUFDQSx5QkFBZ0IsV0FDYixJQURhLENBQ1IsVUFBUyxHQUFULEVBQWM7QUFBRSxrQkFBTyxJQUFJLFVBQUosQ0FBZSxXQUFmLENBQVA7QUFBcUMsVUFEN0MsQ0FBaEI7QUFFQSxzQkFBYSxLQUFiO0FBQ0EsZ0JBQU8sTUFBUDtBQUNEO0FBQ0YsTUE5QmtCLENBQW5CO0FBK0JBLGtCQUFhLElBQWIsQ0FBa0IsVUFBUyxHQUFULEVBQWM7QUFDOUIsY0FBTyxVQUFQLENBQWtCLGdCQUFsQixFQUFvQyxvUEFBcEM7QUFDQSxlQUFRLEtBQVIsQ0FBYyxHQUFkO0FBQ0QsTUFIRDtBQUlEO0FBQ0QsT0FBSSxJQUFKLEdBQVcsSUFBWDtBQUNBLEtBQUUsWUFBRixFQUFnQixLQUFoQixDQUFzQixJQUFJLFFBQTFCO0FBQ0EsS0FBRSxhQUFGLEVBQWlCLEtBQWpCLENBQXVCLElBQXZCO0FBQ0EsWUFBUyxhQUFULENBQXVCLEVBQUUsT0FBRixDQUF2QixFQUFtQyxFQUFFLGVBQUYsQ0FBbkMsRUFBdUQsS0FBdkQsRUFBOEQsWUFBVSxDQUFFLENBQTFFOztBQUVBLGlCQUFjLElBQWQsQ0FBbUIsVUFBUyxDQUFULEVBQVk7QUFDN0IsU0FBSSxnQkFBZ0IsRUFBRSxPQUFGLEVBQVcsUUFBWCxDQUFvQixVQUFwQixDQUFwQjtBQUNBLE9BQUUsT0FBRixFQUFXLE9BQVgsQ0FBbUIsYUFBbkI7O0FBRUEsU0FBSSxNQUFKLEdBQWEsSUFBSSxVQUFKLENBQWUsYUFBZixFQUE4QjtBQUN6QyxrQkFBVyxFQUFFLFlBQUYsQ0FEOEI7QUFFekMscUJBQWMsS0FGMkI7QUFHekMsZ0JBQVMsQ0FIZ0M7QUFJekMsWUFBSyxJQUFJLFFBSmdDO0FBS3pDLG1CQUFZO0FBTDZCLE1BQTlCLENBQWI7OztBQVNBLFNBQUksTUFBSixDQUFXLEVBQVgsQ0FBYyxZQUFkO0FBQ0QsSUFkRDs7QUFnQkEsaUJBQWMsSUFBZCxDQUFtQixZQUFXO0FBQzVCLFNBQUksZ0JBQWdCLEVBQUUsT0FBRixFQUFXLFFBQVgsQ0FBb0IsVUFBcEIsQ0FBcEI7QUFDQSxPQUFFLE9BQUYsRUFBVyxPQUFYLENBQW1CLGFBQW5COztBQUVBLFNBQUksTUFBSixHQUFhLElBQUksVUFBSixDQUFlLGFBQWYsRUFBOEI7QUFDekMsa0JBQVcsRUFBRSxZQUFGLENBRDhCO0FBRXpDLHFCQUFjLEtBRjJCO0FBR3pDLFlBQUssSUFBSSxRQUhnQztBQUl6QyxtQkFBWTtBQUo2QixNQUE5QixDQUFiO0FBTUQsSUFWRDs7QUFZQSxpQkFBYyxHQUFkLENBQWtCLFlBQVc7QUFDM0IsU0FBSSxZQUFZLFNBQVMsYUFBVCxDQUF1QixRQUF2QixDQUFoQjtBQUNBLGFBQVEsR0FBUixDQUFZLGdCQUFaLEVBQThCLEtBQUssU0FBTCxDQUFlLFFBQVEsR0FBdkIsQ0FBOUI7QUFDQSxhQUFRLEdBQVIsQ0FBWSxzQkFBWixFQUFvQywwQ0FBcEM7QUFDQSxhQUFRLEdBQVIsQ0FBWSwwQ0FBWjtBQUNBLGVBQVUsR0FBVixHQUFnQiwwQ0FBaEI7QUFDQSxlQUFVLElBQVYsR0FBaUIsaUJBQWpCO0FBQ0EsY0FBUyxJQUFULENBQWMsV0FBZCxDQUEwQixTQUExQjtBQUNBLFNBQUksTUFBSixDQUFXLEtBQVg7QUFDQSxPQUFFLFNBQUYsRUFBYSxFQUFiLENBQWdCLE9BQWhCLEVBQXlCLFlBQVc7QUFDbEMsU0FBRSxTQUFGLEVBQWEsSUFBYjtBQUNBLFNBQUUsVUFBRixFQUFjLElBQWQ7QUFDQSxTQUFFLGNBQUYsRUFBa0IsSUFBbEI7QUFDQSxjQUFPLFVBQVAsQ0FBa0IsaUlBQWxCO0FBQ0QsTUFMRDtBQU1ELElBZkQ7QUFpQkQsRUEvVUQsRTs7Ozs7OztBQzFEQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCO0FBQ3JCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSw0QkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsNkJBQTRCLFVBQVU7Ozs7Ozs7bUVDdEh0Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhEQUE2RDtBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQThDLFdBQVc7QUFDekQsK0NBQThDLFdBQVc7QUFDekQsOENBQTZDLFdBQVc7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBcUMsV0FBVyxPQUFPO0FBQ3ZELHVDQUFzQyxXQUFXLE1BQU07QUFDdkQ7QUFDQSxZQUFXLE9BQU87QUFDbEIsYUFBWSwyQkFBMkIsRUFBRTtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLCtCQUErQjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDBCQUF5QixZQUFZO0FBQ3JDOztBQUVBOztBQUVBO0FBQ0Esa0JBQWlCLGNBQWM7QUFDL0I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFFOztBQUVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixZQUFXLE9BQU87QUFDbEI7QUFDQSxhQUFZLE9BQU87QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUU7O0FBRUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixhQUFZLFdBQVcsRUFBRTtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksUUFBUTtBQUNwQjtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxHQUFFOztBQUVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixZQUFXLE9BQU87QUFDbEIsYUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxHQUFFO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEVBQUM7Ozs7Ozs7O0FDclZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDVEEsOEJBQTZCLG1EQUFtRCIsImZpbGUiOiJqcy9iZWZvcmVQeXJldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdHZhciBwYXJlbnRIb3RVcGRhdGVDYWxsYmFjayA9IHRoaXNbXCJ3ZWJwYWNrSG90VXBkYXRlXCJdO1xuIFx0dGhpc1tcIndlYnBhY2tIb3RVcGRhdGVcIl0gPSBcclxuIFx0ZnVuY3Rpb24gd2VicGFja0hvdFVwZGF0ZUNhbGxiYWNrKGNodW5rSWQsIG1vcmVNb2R1bGVzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHRob3RBZGRVcGRhdGVDaHVuayhjaHVua0lkLCBtb3JlTW9kdWxlcyk7XHJcbiBcdFx0aWYocGFyZW50SG90VXBkYXRlQ2FsbGJhY2spIHBhcmVudEhvdFVwZGF0ZUNhbGxiYWNrKGNodW5rSWQsIG1vcmVNb2R1bGVzKTtcclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90RG93bmxvYWRVcGRhdGVDaHVuayhjaHVua0lkKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHR2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXTtcclxuIFx0XHR2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcclxuIFx0XHRzY3JpcHQudHlwZSA9IFwidGV4dC9qYXZhc2NyaXB0XCI7XHJcbiBcdFx0c2NyaXB0LmNoYXJzZXQgPSBcInV0Zi04XCI7XHJcbiBcdFx0c2NyaXB0LnNyYyA9IF9fd2VicGFja19yZXF1aXJlX18ucCArIFwiXCIgKyBjaHVua0lkICsgXCIuXCIgKyBob3RDdXJyZW50SGFzaCArIFwiLmhvdC11cGRhdGUuanNcIjtcclxuIFx0XHRoZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdERvd25sb2FkTWFuaWZlc3QoY2FsbGJhY2spIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdGlmKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCA9PT0gXCJ1bmRlZmluZWRcIilcclxuIFx0XHRcdHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJObyBicm93c2VyIHN1cHBvcnRcIikpO1xyXG4gXHRcdHRyeSB7XHJcbiBcdFx0XHR2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gXHRcdFx0dmFyIHJlcXVlc3RQYXRoID0gX193ZWJwYWNrX3JlcXVpcmVfXy5wICsgXCJcIiArIGhvdEN1cnJlbnRIYXNoICsgXCIuaG90LXVwZGF0ZS5qc29uXCI7XHJcbiBcdFx0XHRyZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgcmVxdWVzdFBhdGgsIHRydWUpO1xyXG4gXHRcdFx0cmVxdWVzdC50aW1lb3V0ID0gMTAwMDA7XHJcbiBcdFx0XHRyZXF1ZXN0LnNlbmQobnVsbCk7XHJcbiBcdFx0fSBjYXRjaChlcnIpIHtcclxuIFx0XHRcdHJldHVybiBjYWxsYmFjayhlcnIpO1xyXG4gXHRcdH1cclxuIFx0XHRyZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gXHRcdFx0aWYocmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSByZXR1cm47XHJcbiBcdFx0XHRpZihyZXF1ZXN0LnN0YXR1cyA9PT0gMCkge1xyXG4gXHRcdFx0XHQvLyB0aW1lb3V0XHJcbiBcdFx0XHRcdGNhbGxiYWNrKG5ldyBFcnJvcihcIk1hbmlmZXN0IHJlcXVlc3QgdG8gXCIgKyByZXF1ZXN0UGF0aCArIFwiIHRpbWVkIG91dC5cIikpO1xyXG4gXHRcdFx0fSBlbHNlIGlmKHJlcXVlc3Quc3RhdHVzID09PSA0MDQpIHtcclxuIFx0XHRcdFx0Ly8gbm8gdXBkYXRlIGF2YWlsYWJsZVxyXG4gXHRcdFx0XHRjYWxsYmFjaygpO1xyXG4gXHRcdFx0fSBlbHNlIGlmKHJlcXVlc3Quc3RhdHVzICE9PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgIT09IDMwNCkge1xyXG4gXHRcdFx0XHQvLyBvdGhlciBmYWlsdXJlXHJcbiBcdFx0XHRcdGNhbGxiYWNrKG5ldyBFcnJvcihcIk1hbmlmZXN0IHJlcXVlc3QgdG8gXCIgKyByZXF1ZXN0UGF0aCArIFwiIGZhaWxlZC5cIikpO1xyXG4gXHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0Ly8gc3VjY2Vzc1xyXG4gXHRcdFx0XHR0cnkge1xyXG4gXHRcdFx0XHRcdHZhciB1cGRhdGUgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcclxuIFx0XHRcdFx0fSBjYXRjaChlKSB7XHJcbiBcdFx0XHRcdFx0Y2FsbGJhY2soZSk7XHJcbiBcdFx0XHRcdFx0cmV0dXJuO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGNhbGxiYWNrKG51bGwsIHVwZGF0ZSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fTtcclxuIFx0fVxyXG5cbiBcdFxyXG4gXHRcclxuIFx0Ly8gQ29waWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2Jsb2IvYmVmNDViMC9zcmMvc2hhcmVkL3V0aWxzL2NhbkRlZmluZVByb3BlcnR5LmpzXHJcbiBcdHZhciBjYW5EZWZpbmVQcm9wZXJ0eSA9IGZhbHNlO1xyXG4gXHR0cnkge1xyXG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgXCJ4XCIsIHtcclxuIFx0XHRcdGdldDogZnVuY3Rpb24oKSB7fVxyXG4gXHRcdH0pO1xyXG4gXHRcdGNhbkRlZmluZVByb3BlcnR5ID0gdHJ1ZTtcclxuIFx0fSBjYXRjaCh4KSB7XHJcbiBcdFx0Ly8gSUUgd2lsbCBmYWlsIG9uIGRlZmluZVByb3BlcnR5XHJcbiBcdH1cclxuIFx0XHJcbiBcdHZhciBob3RBcHBseU9uVXBkYXRlID0gdHJ1ZTtcclxuIFx0dmFyIGhvdEN1cnJlbnRIYXNoID0gXCI1MmEyYWM4ZTdhYWY5ZmQ3YWQwNlwiOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdHZhciBob3RDdXJyZW50TW9kdWxlRGF0YSA9IHt9O1xyXG4gXHR2YXIgaG90Q3VycmVudFBhcmVudHMgPSBbXTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90Q3JlYXRlUmVxdWlyZShtb2R1bGVJZCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0dmFyIG1lID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0aWYoIW1lKSByZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXztcclxuIFx0XHR2YXIgZm4gPSBmdW5jdGlvbihyZXF1ZXN0KSB7XHJcbiBcdFx0XHRpZihtZS5ob3QuYWN0aXZlKSB7XHJcbiBcdFx0XHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbcmVxdWVzdF0pIHtcclxuIFx0XHRcdFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW3JlcXVlc3RdLnBhcmVudHMuaW5kZXhPZihtb2R1bGVJZCkgPCAwKVxyXG4gXHRcdFx0XHRcdFx0aW5zdGFsbGVkTW9kdWxlc1tyZXF1ZXN0XS5wYXJlbnRzLnB1c2gobW9kdWxlSWQpO1xyXG4gXHRcdFx0XHRcdGlmKG1lLmNoaWxkcmVuLmluZGV4T2YocmVxdWVzdCkgPCAwKVxyXG4gXHRcdFx0XHRcdFx0bWUuY2hpbGRyZW4ucHVzaChyZXF1ZXN0KTtcclxuIFx0XHRcdFx0fSBlbHNlIGhvdEN1cnJlbnRQYXJlbnRzID0gW21vZHVsZUlkXTtcclxuIFx0XHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRcdGNvbnNvbGUud2FybihcIltITVJdIHVuZXhwZWN0ZWQgcmVxdWlyZShcIiArIHJlcXVlc3QgKyBcIikgZnJvbSBkaXNwb3NlZCBtb2R1bGUgXCIgKyBtb2R1bGVJZCk7XHJcbiBcdFx0XHRcdGhvdEN1cnJlbnRQYXJlbnRzID0gW107XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhyZXF1ZXN0KTtcclxuIFx0XHR9O1xyXG4gXHRcdGZvcih2YXIgbmFtZSBpbiBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoX193ZWJwYWNrX3JlcXVpcmVfXywgbmFtZSkpIHtcclxuIFx0XHRcdFx0aWYoY2FuRGVmaW5lUHJvcGVydHkpIHtcclxuIFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIG5hbWUsIChmdW5jdGlvbihuYW1lKSB7XHJcbiBcdFx0XHRcdFx0XHRyZXR1cm4ge1xyXG4gXHRcdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXHJcbiBcdFx0XHRcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXHJcbiBcdFx0XHRcdFx0XHRcdGdldDogZnVuY3Rpb24oKSB7XHJcbiBcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX19bbmFtZV07XHJcbiBcdFx0XHRcdFx0XHRcdH0sXHJcbiBcdFx0XHRcdFx0XHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcclxuIFx0XHRcdFx0XHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fW25hbWVdID0gdmFsdWU7XHJcbiBcdFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRcdH07XHJcbiBcdFx0XHRcdFx0fShuYW1lKSkpO1xyXG4gXHRcdFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0XHRcdGZuW25hbWVdID0gX193ZWJwYWNrX3JlcXVpcmVfX1tuYW1lXTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0ZnVuY3Rpb24gZW5zdXJlKGNodW5rSWQsIGNhbGxiYWNrKSB7XHJcbiBcdFx0XHRpZihob3RTdGF0dXMgPT09IFwicmVhZHlcIilcclxuIFx0XHRcdFx0aG90U2V0U3RhdHVzKFwicHJlcGFyZVwiKTtcclxuIFx0XHRcdGhvdENodW5rc0xvYWRpbmcrKztcclxuIFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18uZShjaHVua0lkLCBmdW5jdGlvbigpIHtcclxuIFx0XHRcdFx0dHJ5IHtcclxuIFx0XHRcdFx0XHRjYWxsYmFjay5jYWxsKG51bGwsIGZuKTtcclxuIFx0XHRcdFx0fSBmaW5hbGx5IHtcclxuIFx0XHRcdFx0XHRmaW5pc2hDaHVua0xvYWRpbmcoKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcclxuIFx0XHRcdFx0ZnVuY3Rpb24gZmluaXNoQ2h1bmtMb2FkaW5nKCkge1xyXG4gXHRcdFx0XHRcdGhvdENodW5rc0xvYWRpbmctLTtcclxuIFx0XHRcdFx0XHRpZihob3RTdGF0dXMgPT09IFwicHJlcGFyZVwiKSB7XHJcbiBcdFx0XHRcdFx0XHRpZighaG90V2FpdGluZ0ZpbGVzTWFwW2NodW5rSWRdKSB7XHJcbiBcdFx0XHRcdFx0XHRcdGhvdEVuc3VyZVVwZGF0ZUNodW5rKGNodW5rSWQpO1xyXG4gXHRcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdFx0aWYoaG90Q2h1bmtzTG9hZGluZyA9PT0gMCAmJiBob3RXYWl0aW5nRmlsZXMgPT09IDApIHtcclxuIFx0XHRcdFx0XHRcdFx0aG90VXBkYXRlRG93bmxvYWRlZCgpO1xyXG4gXHRcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fSk7XHJcbiBcdFx0fVxyXG4gXHRcdGlmKGNhbkRlZmluZVByb3BlcnR5KSB7XHJcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIFwiZVwiLCB7XHJcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXHJcbiBcdFx0XHRcdHZhbHVlOiBlbnN1cmVcclxuIFx0XHRcdH0pO1xyXG4gXHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRmbi5lID0gZW5zdXJlO1xyXG4gXHRcdH1cclxuIFx0XHRyZXR1cm4gZm47XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdENyZWF0ZU1vZHVsZShtb2R1bGVJZCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0dmFyIGhvdCA9IHtcclxuIFx0XHRcdC8vIHByaXZhdGUgc3R1ZmZcclxuIFx0XHRcdF9hY2NlcHRlZERlcGVuZGVuY2llczoge30sXHJcbiBcdFx0XHRfZGVjbGluZWREZXBlbmRlbmNpZXM6IHt9LFxyXG4gXHRcdFx0X3NlbGZBY2NlcHRlZDogZmFsc2UsXHJcbiBcdFx0XHRfc2VsZkRlY2xpbmVkOiBmYWxzZSxcclxuIFx0XHRcdF9kaXNwb3NlSGFuZGxlcnM6IFtdLFxyXG4gXHRcclxuIFx0XHRcdC8vIE1vZHVsZSBBUElcclxuIFx0XHRcdGFjdGl2ZTogdHJ1ZSxcclxuIFx0XHRcdGFjY2VwdDogZnVuY3Rpb24oZGVwLCBjYWxsYmFjaykge1xyXG4gXHRcdFx0XHRpZih0eXBlb2YgZGVwID09PSBcInVuZGVmaW5lZFwiKVxyXG4gXHRcdFx0XHRcdGhvdC5fc2VsZkFjY2VwdGVkID0gdHJ1ZTtcclxuIFx0XHRcdFx0ZWxzZSBpZih0eXBlb2YgZGVwID09PSBcImZ1bmN0aW9uXCIpXHJcbiBcdFx0XHRcdFx0aG90Ll9zZWxmQWNjZXB0ZWQgPSBkZXA7XHJcbiBcdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIilcclxuIFx0XHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgZGVwLmxlbmd0aDsgaSsrKVxyXG4gXHRcdFx0XHRcdFx0aG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1tkZXBbaV1dID0gY2FsbGJhY2s7XHJcbiBcdFx0XHRcdGVsc2VcclxuIFx0XHRcdFx0XHRob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcF0gPSBjYWxsYmFjaztcclxuIFx0XHRcdH0sXHJcbiBcdFx0XHRkZWNsaW5lOiBmdW5jdGlvbihkZXApIHtcclxuIFx0XHRcdFx0aWYodHlwZW9mIGRlcCA9PT0gXCJ1bmRlZmluZWRcIilcclxuIFx0XHRcdFx0XHRob3QuX3NlbGZEZWNsaW5lZCA9IHRydWU7XHJcbiBcdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRlcCA9PT0gXCJudW1iZXJcIilcclxuIFx0XHRcdFx0XHRob3QuX2RlY2xpbmVkRGVwZW5kZW5jaWVzW2RlcF0gPSB0cnVlO1xyXG4gXHRcdFx0XHRlbHNlXHJcbiBcdFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGRlcC5sZW5ndGg7IGkrKylcclxuIFx0XHRcdFx0XHRcdGhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbZGVwW2ldXSA9IHRydWU7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0ZGlzcG9zZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuIFx0XHRcdFx0aG90Ll9kaXNwb3NlSGFuZGxlcnMucHVzaChjYWxsYmFjayk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0YWRkRGlzcG9zZUhhbmRsZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiBcdFx0XHRcdGhvdC5fZGlzcG9zZUhhbmRsZXJzLnB1c2goY2FsbGJhY2spO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdHJlbW92ZURpc3Bvc2VIYW5kbGVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gXHRcdFx0XHR2YXIgaWR4ID0gaG90Ll9kaXNwb3NlSGFuZGxlcnMuaW5kZXhPZihjYWxsYmFjayk7XHJcbiBcdFx0XHRcdGlmKGlkeCA+PSAwKSBob3QuX2Rpc3Bvc2VIYW5kbGVycy5zcGxpY2UoaWR4LCAxKTtcclxuIFx0XHRcdH0sXHJcbiBcdFxyXG4gXHRcdFx0Ly8gTWFuYWdlbWVudCBBUElcclxuIFx0XHRcdGNoZWNrOiBob3RDaGVjayxcclxuIFx0XHRcdGFwcGx5OiBob3RBcHBseSxcclxuIFx0XHRcdHN0YXR1czogZnVuY3Rpb24obCkge1xyXG4gXHRcdFx0XHRpZighbCkgcmV0dXJuIGhvdFN0YXR1cztcclxuIFx0XHRcdFx0aG90U3RhdHVzSGFuZGxlcnMucHVzaChsKTtcclxuIFx0XHRcdH0sXHJcbiBcdFx0XHRhZGRTdGF0dXNIYW5kbGVyOiBmdW5jdGlvbihsKSB7XHJcbiBcdFx0XHRcdGhvdFN0YXR1c0hhbmRsZXJzLnB1c2gobCk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0cmVtb3ZlU3RhdHVzSGFuZGxlcjogZnVuY3Rpb24obCkge1xyXG4gXHRcdFx0XHR2YXIgaWR4ID0gaG90U3RhdHVzSGFuZGxlcnMuaW5kZXhPZihsKTtcclxuIFx0XHRcdFx0aWYoaWR4ID49IDApIGhvdFN0YXR1c0hhbmRsZXJzLnNwbGljZShpZHgsIDEpO1xyXG4gXHRcdFx0fSxcclxuIFx0XHJcbiBcdFx0XHQvL2luaGVyaXQgZnJvbSBwcmV2aW91cyBkaXNwb3NlIGNhbGxcclxuIFx0XHRcdGRhdGE6IGhvdEN1cnJlbnRNb2R1bGVEYXRhW21vZHVsZUlkXVxyXG4gXHRcdH07XHJcbiBcdFx0cmV0dXJuIGhvdDtcclxuIFx0fVxyXG4gXHRcclxuIFx0dmFyIGhvdFN0YXR1c0hhbmRsZXJzID0gW107XHJcbiBcdHZhciBob3RTdGF0dXMgPSBcImlkbGVcIjtcclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdFNldFN0YXR1cyhuZXdTdGF0dXMpIHtcclxuIFx0XHRob3RTdGF0dXMgPSBuZXdTdGF0dXM7XHJcbiBcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGhvdFN0YXR1c0hhbmRsZXJzLmxlbmd0aDsgaSsrKVxyXG4gXHRcdFx0aG90U3RhdHVzSGFuZGxlcnNbaV0uY2FsbChudWxsLCBuZXdTdGF0dXMpO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHQvLyB3aGlsZSBkb3dubG9hZGluZ1xyXG4gXHR2YXIgaG90V2FpdGluZ0ZpbGVzID0gMDtcclxuIFx0dmFyIGhvdENodW5rc0xvYWRpbmcgPSAwO1xyXG4gXHR2YXIgaG90V2FpdGluZ0ZpbGVzTWFwID0ge307XHJcbiBcdHZhciBob3RSZXF1ZXN0ZWRGaWxlc01hcCA9IHt9O1xyXG4gXHR2YXIgaG90QXZhaWxpYmxlRmlsZXNNYXAgPSB7fTtcclxuIFx0dmFyIGhvdENhbGxiYWNrO1xyXG4gXHRcclxuIFx0Ly8gVGhlIHVwZGF0ZSBpbmZvXHJcbiBcdHZhciBob3RVcGRhdGUsIGhvdFVwZGF0ZU5ld0hhc2g7XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiB0b01vZHVsZUlkKGlkKSB7XHJcbiBcdFx0dmFyIGlzTnVtYmVyID0gKCtpZCkgKyBcIlwiID09PSBpZDtcclxuIFx0XHRyZXR1cm4gaXNOdW1iZXIgPyAraWQgOiBpZDtcclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90Q2hlY2soYXBwbHksIGNhbGxiYWNrKSB7XHJcbiBcdFx0aWYoaG90U3RhdHVzICE9PSBcImlkbGVcIikgdGhyb3cgbmV3IEVycm9yKFwiY2hlY2soKSBpcyBvbmx5IGFsbG93ZWQgaW4gaWRsZSBzdGF0dXNcIik7XHJcbiBcdFx0aWYodHlwZW9mIGFwcGx5ID09PSBcImZ1bmN0aW9uXCIpIHtcclxuIFx0XHRcdGhvdEFwcGx5T25VcGRhdGUgPSBmYWxzZTtcclxuIFx0XHRcdGNhbGxiYWNrID0gYXBwbHk7XHJcbiBcdFx0fSBlbHNlIHtcclxuIFx0XHRcdGhvdEFwcGx5T25VcGRhdGUgPSBhcHBseTtcclxuIFx0XHRcdGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oZXJyKSB7XHJcbiBcdFx0XHRcdGlmKGVycikgdGhyb3cgZXJyO1xyXG4gXHRcdFx0fTtcclxuIFx0XHR9XHJcbiBcdFx0aG90U2V0U3RhdHVzKFwiY2hlY2tcIik7XHJcbiBcdFx0aG90RG93bmxvYWRNYW5pZmVzdChmdW5jdGlvbihlcnIsIHVwZGF0ZSkge1xyXG4gXHRcdFx0aWYoZXJyKSByZXR1cm4gY2FsbGJhY2soZXJyKTtcclxuIFx0XHRcdGlmKCF1cGRhdGUpIHtcclxuIFx0XHRcdFx0aG90U2V0U3RhdHVzKFwiaWRsZVwiKTtcclxuIFx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgbnVsbCk7XHJcbiBcdFx0XHRcdHJldHVybjtcclxuIFx0XHRcdH1cclxuIFx0XHJcbiBcdFx0XHRob3RSZXF1ZXN0ZWRGaWxlc01hcCA9IHt9O1xyXG4gXHRcdFx0aG90QXZhaWxpYmxlRmlsZXNNYXAgPSB7fTtcclxuIFx0XHRcdGhvdFdhaXRpbmdGaWxlc01hcCA9IHt9O1xyXG4gXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IHVwZGF0ZS5jLmxlbmd0aDsgaSsrKVxyXG4gXHRcdFx0XHRob3RBdmFpbGlibGVGaWxlc01hcFt1cGRhdGUuY1tpXV0gPSB0cnVlO1xyXG4gXHRcdFx0aG90VXBkYXRlTmV3SGFzaCA9IHVwZGF0ZS5oO1xyXG4gXHRcclxuIFx0XHRcdGhvdFNldFN0YXR1cyhcInByZXBhcmVcIik7XHJcbiBcdFx0XHRob3RDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gXHRcdFx0aG90VXBkYXRlID0ge307XHJcbiBcdFx0XHR2YXIgY2h1bmtJZCA9IDA7XHJcbiBcdFx0XHR7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbG9uZS1ibG9ja3NcclxuIFx0XHRcdFx0LypnbG9iYWxzIGNodW5rSWQgKi9cclxuIFx0XHRcdFx0aG90RW5zdXJlVXBkYXRlQ2h1bmsoY2h1bmtJZCk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRpZihob3RTdGF0dXMgPT09IFwicHJlcGFyZVwiICYmIGhvdENodW5rc0xvYWRpbmcgPT09IDAgJiYgaG90V2FpdGluZ0ZpbGVzID09PSAwKSB7XHJcbiBcdFx0XHRcdGhvdFVwZGF0ZURvd25sb2FkZWQoKTtcclxuIFx0XHRcdH1cclxuIFx0XHR9KTtcclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90QWRkVXBkYXRlQ2h1bmsoY2h1bmtJZCwgbW9yZU1vZHVsZXMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdGlmKCFob3RBdmFpbGlibGVGaWxlc01hcFtjaHVua0lkXSB8fCAhaG90UmVxdWVzdGVkRmlsZXNNYXBbY2h1bmtJZF0pXHJcbiBcdFx0XHRyZXR1cm47XHJcbiBcdFx0aG90UmVxdWVzdGVkRmlsZXNNYXBbY2h1bmtJZF0gPSBmYWxzZTtcclxuIFx0XHRmb3IodmFyIG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHRob3RVcGRhdGVbbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHRpZigtLWhvdFdhaXRpbmdGaWxlcyA9PT0gMCAmJiBob3RDaHVua3NMb2FkaW5nID09PSAwKSB7XHJcbiBcdFx0XHRob3RVcGRhdGVEb3dubG9hZGVkKCk7XHJcbiBcdFx0fVxyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RFbnN1cmVVcGRhdGVDaHVuayhjaHVua0lkKSB7XHJcbiBcdFx0aWYoIWhvdEF2YWlsaWJsZUZpbGVzTWFwW2NodW5rSWRdKSB7XHJcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXNNYXBbY2h1bmtJZF0gPSB0cnVlO1xyXG4gXHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRob3RSZXF1ZXN0ZWRGaWxlc01hcFtjaHVua0lkXSA9IHRydWU7XHJcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXMrKztcclxuIFx0XHRcdGhvdERvd25sb2FkVXBkYXRlQ2h1bmsoY2h1bmtJZCk7XHJcbiBcdFx0fVxyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RVcGRhdGVEb3dubG9hZGVkKCkge1xyXG4gXHRcdGhvdFNldFN0YXR1cyhcInJlYWR5XCIpO1xyXG4gXHRcdHZhciBjYWxsYmFjayA9IGhvdENhbGxiYWNrO1xyXG4gXHRcdGhvdENhbGxiYWNrID0gbnVsbDtcclxuIFx0XHRpZighY2FsbGJhY2spIHJldHVybjtcclxuIFx0XHRpZihob3RBcHBseU9uVXBkYXRlKSB7XHJcbiBcdFx0XHRob3RBcHBseShob3RBcHBseU9uVXBkYXRlLCBjYWxsYmFjayk7XHJcbiBcdFx0fSBlbHNlIHtcclxuIFx0XHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbXTtcclxuIFx0XHRcdGZvcih2YXIgaWQgaW4gaG90VXBkYXRlKSB7XHJcbiBcdFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChob3RVcGRhdGUsIGlkKSkge1xyXG4gXHRcdFx0XHRcdG91dGRhdGVkTW9kdWxlcy5wdXNoKHRvTW9kdWxlSWQoaWQpKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdFx0Y2FsbGJhY2sobnVsbCwgb3V0ZGF0ZWRNb2R1bGVzKTtcclxuIFx0XHR9XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdEFwcGx5KG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiBcdFx0aWYoaG90U3RhdHVzICE9PSBcInJlYWR5XCIpIHRocm93IG5ldyBFcnJvcihcImFwcGx5KCkgaXMgb25seSBhbGxvd2VkIGluIHJlYWR5IHN0YXR1c1wiKTtcclxuIFx0XHRpZih0eXBlb2Ygb3B0aW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiBcdFx0XHRjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiBcdFx0XHRvcHRpb25zID0ge307XHJcbiBcdFx0fSBlbHNlIGlmKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMgPT09IFwib2JqZWN0XCIpIHtcclxuIFx0XHRcdGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oZXJyKSB7XHJcbiBcdFx0XHRcdGlmKGVycikgdGhyb3cgZXJyO1xyXG4gXHRcdFx0fTtcclxuIFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0b3B0aW9ucyA9IHt9O1xyXG4gXHRcdFx0Y2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbihlcnIpIHtcclxuIFx0XHRcdFx0aWYoZXJyKSB0aHJvdyBlcnI7XHJcbiBcdFx0XHR9O1xyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0ZnVuY3Rpb24gZ2V0QWZmZWN0ZWRTdHVmZihtb2R1bGUpIHtcclxuIFx0XHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbbW9kdWxlXTtcclxuIFx0XHRcdHZhciBvdXRkYXRlZERlcGVuZGVuY2llcyA9IHt9O1xyXG4gXHRcclxuIFx0XHRcdHZhciBxdWV1ZSA9IG91dGRhdGVkTW9kdWxlcy5zbGljZSgpO1xyXG4gXHRcdFx0d2hpbGUocXVldWUubGVuZ3RoID4gMCkge1xyXG4gXHRcdFx0XHR2YXIgbW9kdWxlSWQgPSBxdWV1ZS5wb3AoKTtcclxuIFx0XHRcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0XHRpZighbW9kdWxlIHx8IG1vZHVsZS5ob3QuX3NlbGZBY2NlcHRlZClcclxuIFx0XHRcdFx0XHRjb250aW51ZTtcclxuIFx0XHRcdFx0aWYobW9kdWxlLmhvdC5fc2VsZkRlY2xpbmVkKSB7XHJcbiBcdFx0XHRcdFx0cmV0dXJuIG5ldyBFcnJvcihcIkFib3J0ZWQgYmVjYXVzZSBvZiBzZWxmIGRlY2xpbmU6IFwiICsgbW9kdWxlSWQpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGlmKG1vZHVsZUlkID09PSAwKSB7XHJcbiBcdFx0XHRcdFx0cmV0dXJuO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtb2R1bGUucGFyZW50cy5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0XHRcdHZhciBwYXJlbnRJZCA9IG1vZHVsZS5wYXJlbnRzW2ldO1xyXG4gXHRcdFx0XHRcdHZhciBwYXJlbnQgPSBpbnN0YWxsZWRNb2R1bGVzW3BhcmVudElkXTtcclxuIFx0XHRcdFx0XHRpZihwYXJlbnQuaG90Ll9kZWNsaW5lZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pIHtcclxuIFx0XHRcdFx0XHRcdHJldHVybiBuZXcgRXJyb3IoXCJBYm9ydGVkIGJlY2F1c2Ugb2YgZGVjbGluZWQgZGVwZW5kZW5jeTogXCIgKyBtb2R1bGVJZCArIFwiIGluIFwiICsgcGFyZW50SWQpO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRpZihvdXRkYXRlZE1vZHVsZXMuaW5kZXhPZihwYXJlbnRJZCkgPj0gMCkgY29udGludWU7XHJcbiBcdFx0XHRcdFx0aWYocGFyZW50LmhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdKSB7XHJcbiBcdFx0XHRcdFx0XHRpZighb3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdKVxyXG4gXHRcdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF0gPSBbXTtcclxuIFx0XHRcdFx0XHRcdGFkZEFsbFRvU2V0KG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSwgW21vZHVsZUlkXSk7XHJcbiBcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0ZGVsZXRlIG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXTtcclxuIFx0XHRcdFx0XHRvdXRkYXRlZE1vZHVsZXMucHVzaChwYXJlbnRJZCk7XHJcbiBcdFx0XHRcdFx0cXVldWUucHVzaChwYXJlbnRJZCk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHJcbiBcdFx0XHRyZXR1cm4gW291dGRhdGVkTW9kdWxlcywgb3V0ZGF0ZWREZXBlbmRlbmNpZXNdO1xyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0ZnVuY3Rpb24gYWRkQWxsVG9TZXQoYSwgYikge1xyXG4gXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdFx0dmFyIGl0ZW0gPSBiW2ldO1xyXG4gXHRcdFx0XHRpZihhLmluZGV4T2YoaXRlbSkgPCAwKVxyXG4gXHRcdFx0XHRcdGEucHVzaChpdGVtKTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIGF0IGJlZ2luIGFsbCB1cGRhdGVzIG1vZHVsZXMgYXJlIG91dGRhdGVkXHJcbiBcdFx0Ly8gdGhlIFwib3V0ZGF0ZWRcIiBzdGF0dXMgY2FuIHByb3BhZ2F0ZSB0byBwYXJlbnRzIGlmIHRoZXkgZG9uJ3QgYWNjZXB0IHRoZSBjaGlsZHJlblxyXG4gXHRcdHZhciBvdXRkYXRlZERlcGVuZGVuY2llcyA9IHt9O1xyXG4gXHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbXTtcclxuIFx0XHR2YXIgYXBwbGllZFVwZGF0ZSA9IHt9O1xyXG4gXHRcdGZvcih2YXIgaWQgaW4gaG90VXBkYXRlKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaG90VXBkYXRlLCBpZCkpIHtcclxuIFx0XHRcdFx0dmFyIG1vZHVsZUlkID0gdG9Nb2R1bGVJZChpZCk7XHJcbiBcdFx0XHRcdHZhciByZXN1bHQgPSBnZXRBZmZlY3RlZFN0dWZmKG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0aWYoIXJlc3VsdCkge1xyXG4gXHRcdFx0XHRcdGlmKG9wdGlvbnMuaWdub3JlVW5hY2NlcHRlZClcclxuIFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRcdGhvdFNldFN0YXR1cyhcImFib3J0XCIpO1xyXG4gXHRcdFx0XHRcdHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJBYm9ydGVkIGJlY2F1c2UgXCIgKyBtb2R1bGVJZCArIFwiIGlzIG5vdCBhY2NlcHRlZFwiKSk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0aWYocmVzdWx0IGluc3RhbmNlb2YgRXJyb3IpIHtcclxuIFx0XHRcdFx0XHRob3RTZXRTdGF0dXMoXCJhYm9ydFwiKTtcclxuIFx0XHRcdFx0XHRyZXR1cm4gY2FsbGJhY2socmVzdWx0KTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRhcHBsaWVkVXBkYXRlW21vZHVsZUlkXSA9IGhvdFVwZGF0ZVttb2R1bGVJZF07XHJcbiBcdFx0XHRcdGFkZEFsbFRvU2V0KG91dGRhdGVkTW9kdWxlcywgcmVzdWx0WzBdKTtcclxuIFx0XHRcdFx0Zm9yKHZhciBtb2R1bGVJZCBpbiByZXN1bHRbMV0pIHtcclxuIFx0XHRcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmVzdWx0WzFdLCBtb2R1bGVJZCkpIHtcclxuIFx0XHRcdFx0XHRcdGlmKCFvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pXHJcbiBcdFx0XHRcdFx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSA9IFtdO1xyXG4gXHRcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdLCByZXN1bHRbMV1bbW9kdWxlSWRdKTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIFN0b3JlIHNlbGYgYWNjZXB0ZWQgb3V0ZGF0ZWQgbW9kdWxlcyB0byByZXF1aXJlIHRoZW0gbGF0ZXIgYnkgdGhlIG1vZHVsZSBzeXN0ZW1cclxuIFx0XHR2YXIgb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzID0gW107XHJcbiBcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG91dGRhdGVkTW9kdWxlcy5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0dmFyIG1vZHVsZUlkID0gb3V0ZGF0ZWRNb2R1bGVzW2ldO1xyXG4gXHRcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gJiYgaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uaG90Ll9zZWxmQWNjZXB0ZWQpXHJcbiBcdFx0XHRcdG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlcy5wdXNoKHtcclxuIFx0XHRcdFx0XHRtb2R1bGU6IG1vZHVsZUlkLFxyXG4gXHRcdFx0XHRcdGVycm9ySGFuZGxlcjogaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uaG90Ll9zZWxmQWNjZXB0ZWRcclxuIFx0XHRcdFx0fSk7XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBOb3cgaW4gXCJkaXNwb3NlXCIgcGhhc2VcclxuIFx0XHRob3RTZXRTdGF0dXMoXCJkaXNwb3NlXCIpO1xyXG4gXHRcdHZhciBxdWV1ZSA9IG91dGRhdGVkTW9kdWxlcy5zbGljZSgpO1xyXG4gXHRcdHdoaWxlKHF1ZXVlLmxlbmd0aCA+IDApIHtcclxuIFx0XHRcdHZhciBtb2R1bGVJZCA9IHF1ZXVlLnBvcCgpO1xyXG4gXHRcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0aWYoIW1vZHVsZSkgY29udGludWU7XHJcbiBcdFxyXG4gXHRcdFx0dmFyIGRhdGEgPSB7fTtcclxuIFx0XHJcbiBcdFx0XHQvLyBDYWxsIGRpc3Bvc2UgaGFuZGxlcnNcclxuIFx0XHRcdHZhciBkaXNwb3NlSGFuZGxlcnMgPSBtb2R1bGUuaG90Ll9kaXNwb3NlSGFuZGxlcnM7XHJcbiBcdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZGlzcG9zZUhhbmRsZXJzLmxlbmd0aDsgaisrKSB7XHJcbiBcdFx0XHRcdHZhciBjYiA9IGRpc3Bvc2VIYW5kbGVyc1tqXTtcclxuIFx0XHRcdFx0Y2IoZGF0YSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRob3RDdXJyZW50TW9kdWxlRGF0YVttb2R1bGVJZF0gPSBkYXRhO1xyXG4gXHRcclxuIFx0XHRcdC8vIGRpc2FibGUgbW9kdWxlICh0aGlzIGRpc2FibGVzIHJlcXVpcmVzIGZyb20gdGhpcyBtb2R1bGUpXHJcbiBcdFx0XHRtb2R1bGUuaG90LmFjdGl2ZSA9IGZhbHNlO1xyXG4gXHRcclxuIFx0XHRcdC8vIHJlbW92ZSBtb2R1bGUgZnJvbSBjYWNoZVxyXG4gXHRcdFx0ZGVsZXRlIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcclxuIFx0XHRcdC8vIHJlbW92ZSBcInBhcmVudHNcIiByZWZlcmVuY2VzIGZyb20gYWxsIGNoaWxkcmVuXHJcbiBcdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgbW9kdWxlLmNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XHJcbiBcdFx0XHRcdHZhciBjaGlsZCA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlLmNoaWxkcmVuW2pdXTtcclxuIFx0XHRcdFx0aWYoIWNoaWxkKSBjb250aW51ZTtcclxuIFx0XHRcdFx0dmFyIGlkeCA9IGNoaWxkLnBhcmVudHMuaW5kZXhPZihtb2R1bGVJZCk7XHJcbiBcdFx0XHRcdGlmKGlkeCA+PSAwKSB7XHJcbiBcdFx0XHRcdFx0Y2hpbGQucGFyZW50cy5zcGxpY2UoaWR4LCAxKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gcmVtb3ZlIG91dGRhdGVkIGRlcGVuZGVuY3kgZnJvbSBtb2R1bGUgY2hpbGRyZW5cclxuIFx0XHRmb3IodmFyIG1vZHVsZUlkIGluIG91dGRhdGVkRGVwZW5kZW5jaWVzKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob3V0ZGF0ZWREZXBlbmRlbmNpZXMsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRcdHZhciBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcyA9IG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzLmxlbmd0aDsgaisrKSB7XHJcbiBcdFx0XHRcdFx0dmFyIGRlcGVuZGVuY3kgPSBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llc1tqXTtcclxuIFx0XHRcdFx0XHR2YXIgaWR4ID0gbW9kdWxlLmNoaWxkcmVuLmluZGV4T2YoZGVwZW5kZW5jeSk7XHJcbiBcdFx0XHRcdFx0aWYoaWR4ID49IDApIG1vZHVsZS5jaGlsZHJlbi5zcGxpY2UoaWR4LCAxKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gTm90IGluIFwiYXBwbHlcIiBwaGFzZVxyXG4gXHRcdGhvdFNldFN0YXR1cyhcImFwcGx5XCIpO1xyXG4gXHRcclxuIFx0XHRob3RDdXJyZW50SGFzaCA9IGhvdFVwZGF0ZU5ld0hhc2g7XHJcbiBcdFxyXG4gXHRcdC8vIGluc2VydCBuZXcgY29kZVxyXG4gXHRcdGZvcih2YXIgbW9kdWxlSWQgaW4gYXBwbGllZFVwZGF0ZSkge1xyXG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGFwcGxpZWRVcGRhdGUsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHRtb2R1bGVzW21vZHVsZUlkXSA9IGFwcGxpZWRVcGRhdGVbbW9kdWxlSWRdO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gY2FsbCBhY2NlcHQgaGFuZGxlcnNcclxuIFx0XHR2YXIgZXJyb3IgPSBudWxsO1xyXG4gXHRcdGZvcih2YXIgbW9kdWxlSWQgaW4gb3V0ZGF0ZWREZXBlbmRlbmNpZXMpIHtcclxuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvdXRkYXRlZERlcGVuZGVuY2llcywgbW9kdWxlSWQpKSB7XHJcbiBcdFx0XHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0dmFyIG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzID0gb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0XHR2YXIgY2FsbGJhY2tzID0gW107XHJcbiBcdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcy5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0XHRcdHZhciBkZXBlbmRlbmN5ID0gbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXNbaV07XHJcbiBcdFx0XHRcdFx0dmFyIGNiID0gbW9kdWxlLmhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbZGVwZW5kZW5jeV07XHJcbiBcdFx0XHRcdFx0aWYoY2FsbGJhY2tzLmluZGV4T2YoY2IpID49IDApIGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRcdGNhbGxiYWNrcy5wdXNoKGNiKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHRcdFx0dmFyIGNiID0gY2FsbGJhY2tzW2ldO1xyXG4gXHRcdFx0XHRcdHRyeSB7XHJcbiBcdFx0XHRcdFx0XHRjYihvdXRkYXRlZERlcGVuZGVuY2llcyk7XHJcbiBcdFx0XHRcdFx0fSBjYXRjaChlcnIpIHtcclxuIFx0XHRcdFx0XHRcdGlmKCFlcnJvcilcclxuIFx0XHRcdFx0XHRcdFx0ZXJyb3IgPSBlcnI7XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBMb2FkIHNlbGYgYWNjZXB0ZWQgbW9kdWxlc1xyXG4gXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdHZhciBpdGVtID0gb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzW2ldO1xyXG4gXHRcdFx0dmFyIG1vZHVsZUlkID0gaXRlbS5tb2R1bGU7XHJcbiBcdFx0XHRob3RDdXJyZW50UGFyZW50cyA9IFttb2R1bGVJZF07XHJcbiBcdFx0XHR0cnkge1xyXG4gXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKTtcclxuIFx0XHRcdH0gY2F0Y2goZXJyKSB7XHJcbiBcdFx0XHRcdGlmKHR5cGVvZiBpdGVtLmVycm9ySGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiBcdFx0XHRcdFx0dHJ5IHtcclxuIFx0XHRcdFx0XHRcdGl0ZW0uZXJyb3JIYW5kbGVyKGVycik7XHJcbiBcdFx0XHRcdFx0fSBjYXRjaChlcnIpIHtcclxuIFx0XHRcdFx0XHRcdGlmKCFlcnJvcilcclxuIFx0XHRcdFx0XHRcdFx0ZXJyb3IgPSBlcnI7XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHR9IGVsc2UgaWYoIWVycm9yKVxyXG4gXHRcdFx0XHRcdGVycm9yID0gZXJyO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gaGFuZGxlIGVycm9ycyBpbiBhY2NlcHQgaGFuZGxlcnMgYW5kIHNlbGYgYWNjZXB0ZWQgbW9kdWxlIGxvYWRcclxuIFx0XHRpZihlcnJvcikge1xyXG4gXHRcdFx0aG90U2V0U3RhdHVzKFwiZmFpbFwiKTtcclxuIFx0XHRcdHJldHVybiBjYWxsYmFjayhlcnJvcik7XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHRob3RTZXRTdGF0dXMoXCJpZGxlXCIpO1xyXG4gXHRcdGNhbGxiYWNrKG51bGwsIG91dGRhdGVkTW9kdWxlcyk7XHJcbiBcdH1cclxuXG4gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2UsXG4gXHRcdFx0aG90OiBob3RDcmVhdGVNb2R1bGUobW9kdWxlSWQpLFxuIFx0XHRcdHBhcmVudHM6IGhvdEN1cnJlbnRQYXJlbnRzLFxuIFx0XHRcdGNoaWxkcmVuOiBbXVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBob3RDcmVhdGVSZXF1aXJlKG1vZHVsZUlkKSk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJodHRwOi8vbG9jYWxob3N0OjUwMDEvXCI7XG5cbiBcdC8vIF9fd2VicGFja19oYXNoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18uaCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaG90Q3VycmVudEhhc2g7IH07XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIGhvdENyZWF0ZVJlcXVpcmUoMCkoMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCA1MmEyYWM4ZTdhYWY5ZmQ3YWQwNlxuICoqLyIsIi8qIGdsb2JhbCAkIGpRdWVyeSBDUE8gQ29kZU1pcnJvciBzdG9yYWdlQVBJIFEgY3JlYXRlUHJvZ3JhbUNvbGxlY3Rpb25BUEkgbWFrZVNoYXJlQVBJICovXG5cbnZhciBzaGFyZUFQSSA9IG1ha2VTaGFyZUFQSShwcm9jZXNzLmVudi5DVVJSRU5UX1BZUkVUX1JFTEVBU0UpO1xuXG52YXIgdXJsID0gcmVxdWlyZSgndXJsLmpzJyk7XG5cbmNvbnN0IExPRyA9IHRydWU7XG53aW5kb3cuY3RfbG9nID0gZnVuY3Rpb24oLyogdmFyYXJncyAqLykge1xuICBpZiAod2luZG93LmNvbnNvbGUgJiYgTE9HKSB7XG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgfVxufTtcblxud2luZG93LmN0X2Vycm9yID0gZnVuY3Rpb24oLyogdmFyYXJncyAqLykge1xuICBpZiAod2luZG93LmNvbnNvbGUgJiYgTE9HKSB7XG4gICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICB9XG59O1xudmFyIGluaXRpYWxQYXJhbXMgPSB1cmwucGFyc2UoZG9jdW1lbnQubG9jYXRpb24uaHJlZik7XG52YXIgcGFyYW1zID0gdXJsLnBhcnNlKFwiLz9cIiArIGluaXRpYWxQYXJhbXNbXCJoYXNoXCJdKTtcbndpbmRvdy5oaWdobGlnaHRNb2RlID0gXCJtY21oXCI7IC8vIHdoYXQgaXMgdGhpcyBmb3I/XG53aW5kb3cuY2xlYXJGbGFzaCA9IGZ1bmN0aW9uKCkge1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikuZW1wdHkoKTtcbn1cbndpbmRvdy5zdGlja0Vycm9yID0gZnVuY3Rpb24obWVzc2FnZSwgbW9yZSkge1xuICBjbGVhckZsYXNoKCk7XG4gIHZhciBlcnIgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJlcnJvclwiKS50ZXh0KG1lc3NhZ2UpO1xuICBpZihtb3JlKSB7XG4gICAgZXJyLmF0dHIoXCJ0aXRsZVwiLCBtb3JlKTtcbiAgfVxuICBlcnIudG9vbHRpcCgpO1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikucHJlcGVuZChlcnIpO1xufTtcbndpbmRvdy5mbGFzaEVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBjbGVhckZsYXNoKCk7XG4gIHZhciBlcnIgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJlcnJvclwiKS50ZXh0KG1lc3NhZ2UpO1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikucHJlcGVuZChlcnIpO1xuICBlcnIuZmFkZU91dCg3MDAwKTtcbn07XG53aW5kb3cuZmxhc2hNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBjbGVhckZsYXNoKCk7XG4gIHZhciBtc2cgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJhY3RpdmVcIikudGV4dChtZXNzYWdlKTtcbiAgJChcIi5ub3RpZmljYXRpb25BcmVhXCIpLnByZXBlbmQobXNnKTtcbiAgbXNnLmZhZGVPdXQoNzAwMCk7XG59O1xud2luZG93LnN0aWNrTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgY2xlYXJGbGFzaCgpO1xuICB2YXIgZXJyID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpLnRleHQobWVzc2FnZSk7XG4gICQoXCIubm90aWZpY2F0aW9uQXJlYVwiKS5wcmVwZW5kKGVycik7XG59O1xuXG4kKHdpbmRvdykuYmluZChcImJlZm9yZXVubG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIFwiQmVjYXVzZSB0aGlzIHBhZ2UgY2FuIGxvYWQgc2xvd2x5LCBhbmQgeW91IG1heSBoYXZlIG91dHN0YW5kaW5nIGNoYW5nZXMsIHdlIGFzayB0aGF0IHlvdSBjb25maXJtIGJlZm9yZSBsZWF2aW5nIHRoZSBlZGl0b3IgaW4gY2FzZSBjbG9zaW5nIHdhcyBhbiBhY2NpZGVudC5cIjtcbn0pO1xud2luZG93LkNQTyA9IHtcbiAgc2F2ZTogZnVuY3Rpb24oKSB7fSxcbiAgYXV0b1NhdmU6IGZ1bmN0aW9uKCkge31cbn07XG4kKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBtZXJnZShvYmosIGV4dGVuc2lvbikge1xuICAgIHZhciBuZXdvYmogPSB7fTtcbiAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgICAgbmV3b2JqW2tdID0gb2JqW2tdO1xuICAgIH0pO1xuICAgIE9iamVjdC5rZXlzKGV4dGVuc2lvbikuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgICBuZXdvYmpba10gPSBleHRlbnNpb25ba107XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ld29iajtcbiAgfVxuICB2YXIgYW5pbWF0aW9uRGl2ID0gbnVsbDtcbiAgZnVuY3Rpb24gY2xvc2VBbmltYXRpb25JZk9wZW4oKSB7XG4gICAgaWYoYW5pbWF0aW9uRGl2KSB7XG4gICAgICBhbmltYXRpb25EaXYuZW1wdHkoKTtcbiAgICAgIGFuaW1hdGlvbkRpdi5kaWFsb2coXCJkZXN0cm95XCIpO1xuICAgICAgYW5pbWF0aW9uRGl2ID0gbnVsbDtcbiAgICB9XG4gIH1cbiAgQ1BPLm1ha2VFZGl0b3IgPSBmdW5jdGlvbihjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICB2YXIgaW5pdGlhbCA9IFwiXCI7XG4gICAgaWYgKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoXCJpbml0aWFsXCIpKSB7XG4gICAgICBpbml0aWFsID0gb3B0aW9ucy5pbml0aWFsO1xuICAgIH1cblxuICAgIHZhciB0ZXh0YXJlYSA9IGpRdWVyeShcIjx0ZXh0YXJlYT5cIik7XG4gICAgdGV4dGFyZWEudmFsKGluaXRpYWwpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQodGV4dGFyZWEpO1xuXG4gICAgdmFyIHJ1bkZ1biA9IGZ1bmN0aW9uIChjb2RlLCByZXBsT3B0aW9ucykge1xuICAgICAgb3B0aW9ucy5ydW4oY29kZSwge2NtOiBDTX0sIHJlcGxPcHRpb25zKTtcbiAgICB9O1xuXG4gICAgdmFyIHVzZUxpbmVOdW1iZXJzID0gIW9wdGlvbnMuc2ltcGxlRWRpdG9yO1xuICAgIHZhciB1c2VGb2xkaW5nID0gIW9wdGlvbnMuc2ltcGxlRWRpdG9yO1xuXG4gICAgdmFyIGd1dHRlcnMgPSAhb3B0aW9ucy5zaW1wbGVFZGl0b3IgP1xuICAgICAgW1wiQ29kZU1pcnJvci1saW5lbnVtYmVyc1wiLCBcIkNvZGVNaXJyb3ItZm9sZGd1dHRlclwiLCBcInRlc3QtbWFya2VyLWd1dHRlclwiXSA6XG4gICAgICBbXTtcblxuICAgIGZ1bmN0aW9uIHJlaW5kZW50QWxsTGluZXMoY20pIHtcbiAgICAgIHZhciBsYXN0ID0gY20ubGluZUNvdW50KCk7XG4gICAgICBjbS5vcGVyYXRpb24oZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdDsgKytpKSBjbS5pbmRlbnRMaW5lKGkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIGNtT3B0aW9ucyA9IHtcbiAgICAgIGV4dHJhS2V5czoge1xuICAgICAgICBcIlNoaWZ0LUVudGVyXCI6IGZ1bmN0aW9uKGNtKSB7IHJ1bkZ1bihjbS5nZXRWYWx1ZSgpKTsgfSxcbiAgICAgICAgXCJTaGlmdC1DdHJsLUVudGVyXCI6IGZ1bmN0aW9uKGNtKSB7IHJ1bkZ1bihjbS5nZXRWYWx1ZSgpKTsgfSxcbiAgICAgICAgXCJUYWJcIjogXCJpbmRlbnRBdXRvXCIsXG4gICAgICAgIFwiQ3RybC1JXCI6IHJlaW5kZW50QWxsTGluZXNcbiAgICAgIH0sXG4gICAgICBpbmRlbnRVbml0OiAyLFxuICAgICAgdGFiU2l6ZTogMixcbiAgICAgIHZpZXdwb3J0TWFyZ2luOiBJbmZpbml0eSxcbiAgICAgIGxpbmVOdW1iZXJzOiB1c2VMaW5lTnVtYmVycyxcbiAgICAgIG1hdGNoS2V5d29yZHM6IHRydWUsXG4gICAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgICAgc3R5bGVTZWxlY3RlZFRleHQ6IHRydWUsXG4gICAgICBmb2xkR3V0dGVyOiB1c2VGb2xkaW5nLFxuICAgICAgZ3V0dGVyczogZ3V0dGVycyxcbiAgICAgIGxpbmVXcmFwcGluZzogdHJ1ZVxuICAgIH07XG5cbiAgICBjbU9wdGlvbnMgPSBtZXJnZShjbU9wdGlvbnMsIG9wdGlvbnMuY21PcHRpb25zIHx8IHt9KTtcblxuICAgIHZhciBDTSA9IENvZGVNaXJyb3IuZnJvbVRleHRBcmVhKHRleHRhcmVhWzBdLCBjbU9wdGlvbnMpO1xuXG4gICAgdmFyIENNYmxvY2tzO1xuXG4gICAgaWYgKHR5cGVvZiBDb2RlTWlycm9yQmxvY2tzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc29sZS5sb2coJ0NvZGVNaXJyb3JCbG9ja3Mgbm90IGZvdW5kJyk7XG4gICAgICBDTWJsb2NrcyA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgQ01ibG9ja3MgPSBuZXcgQ29kZU1pcnJvckJsb2NrcyhDTSxcbiAgICAgICAgJ3dlc2NoZW1lJyxcbiAgICAgICAge1xuICAgICAgICAgIHdpbGxJbnNlcnROb2RlOiBmdW5jdGlvbihzb3VyY2VOb2RlVGV4dCwgc291cmNlTm9kZSwgZGVzdGluYXRpb24pIHtcbiAgICAgICAgICAgIHZhciBsaW5lID0gQ00uZWRpdG9yLmdldExpbmUoZGVzdGluYXRpb24ubGluZSk7XG4gICAgICAgICAgICBpZiAoZGVzdGluYXRpb24uY2ggPiAwICYmIGxpbmVbZGVzdGluYXRpb24uY2ggLSAxXS5tYXRjaCgvW1xcd1xcZF0vKSkge1xuICAgICAgICAgICAgICAvLyBwcmV2aW91cyBjaGFyYWN0ZXIgaXMgYSBsZXR0ZXIgb3IgbnVtYmVyLCBzbyBwcmVmaXggYSBzcGFjZVxuICAgICAgICAgICAgICBzb3VyY2VOb2RlVGV4dCA9ICcgJyArIHNvdXJjZU5vZGVUZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVzdGluYXRpb24uY2ggPCBsaW5lLmxlbmd0aCAmJiBsaW5lW2Rlc3RpbmF0aW9uLmNoXS5tYXRjaCgvW1xcd1xcZF0vKSkge1xuICAgICAgICAgICAgICAvLyBuZXh0IGNoYXJhY3RlciBpcyBhIGxldHRlciBvciBhIG51bWJlciwgc28gYXBwZW5kIGEgc3BhY2VcbiAgICAgICAgICAgICAgc291cmNlTm9kZVRleHQgKz0gJyAnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZU5vZGVUZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICBDTS5ibG9ja3NFZGl0b3IgPSBDTWJsb2NrcztcbiAgICAgIENNLmNoYW5nZU1vZGUgPSBmdW5jdGlvbihtb2RlKSB7XG4gICAgICAgIGlmIChtb2RlID09PSBcImZhbHNlXCIpIHtcbiAgICAgICAgICBtb2RlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgQ01ibG9ja3MuYXN0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBDTWJsb2Nrcy5zZXRCbG9ja01vZGUobW9kZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHVzZUxpbmVOdW1iZXJzKSB7XG4gICAgICB2YXIgdXBwZXJXYXJuaW5nID0galF1ZXJ5KFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJ3YXJuaW5nLXVwcGVyXCIpO1xuICAgICAgdmFyIHVwcGVyQXJyb3cgPSBqUXVlcnkoXCI8aW1nPlwiKS5hZGRDbGFzcyhcIndhcm5pbmctdXBwZXItYXJyb3dcIikuYXR0cihcInNyY1wiLCBcIi9pbWcvdXAtYXJyb3cucG5nXCIpO1xuICAgICAgdXBwZXJXYXJuaW5nLmFwcGVuZCh1cHBlckFycm93KTtcbiAgICAgIENNLmRpc3BsYXkud3JhcHBlci5hcHBlbmRDaGlsZCh1cHBlcldhcm5pbmcuZ2V0KDApKTtcbiAgICAgIHZhciBsb3dlcldhcm5pbmcgPSBqUXVlcnkoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcIndhcm5pbmctbG93ZXJcIik7XG4gICAgICB2YXIgbG93ZXJBcnJvdyA9IGpRdWVyeShcIjxpbWc+XCIpLmFkZENsYXNzKFwid2FybmluZy1sb3dlci1hcnJvd1wiKS5hdHRyKFwic3JjXCIsIFwiL2ltZy9kb3duLWFycm93LnBuZ1wiKTtcbiAgICAgIGxvd2VyV2FybmluZy5hcHBlbmQobG93ZXJBcnJvdyk7XG4gICAgICBDTS5kaXNwbGF5LndyYXBwZXIuYXBwZW5kQ2hpbGQobG93ZXJXYXJuaW5nLmdldCgwKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNtOiBDTSxcbiAgICAgIHJlZnJlc2g6IGZ1bmN0aW9uKCkgeyBDTS5yZWZyZXNoKCk7IH0sXG4gICAgICBydW46IGZ1bmN0aW9uKCkge1xuICAgICAgICBydW5GdW4oQ00uZ2V0VmFsdWUoKSk7XG4gICAgICB9LFxuICAgICAgZm9jdXM6IGZ1bmN0aW9uKCkgeyBDTS5mb2N1cygpOyB9XG4gICAgfTtcbiAgfTtcbiAgQ1BPLlJVTl9DT0RFID0gZnVuY3Rpb24oKSB7XG5cbiAgfTtcblxuICBzdG9yYWdlQVBJLnRoZW4oZnVuY3Rpb24oYXBpKSB7XG4gICAgYXBpLmNvbGxlY3Rpb24udGhlbihmdW5jdGlvbigpIHtcbiAgICAgICQoXCIubG9naW5Pbmx5XCIpLnNob3coKTtcbiAgICAgICQoXCIubG9nb3V0T25seVwiKS5oaWRlKCk7XG4gICAgICBhcGkuYXBpLmdldENvbGxlY3Rpb25MaW5rKCkudGhlbihmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICQoXCIjZHJpdmUtdmlldyBhXCIpLmF0dHIoXCJocmVmXCIsIGxpbmspO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgYXBpLmNvbGxlY3Rpb24uZmFpbChmdW5jdGlvbigpIHtcbiAgICAgICQoXCIubG9naW5Pbmx5XCIpLmhpZGUoKTtcbiAgICAgICQoXCIubG9nb3V0T25seVwiKS5zaG93KCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHN0b3JhZ2VBUEkgPSBzdG9yYWdlQVBJLnRoZW4oZnVuY3Rpb24oYXBpKSB7IHJldHVybiBhcGkuYXBpOyB9KTtcbiAgJChcIiNjb25uZWN0QnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICQoXCIjY29ubmVjdEJ1dHRvblwiKS50ZXh0KFwiQ29ubmVjdGluZy4uLlwiKTtcbiAgICAkKFwiI2Nvbm5lY3RCdXR0b25cIikuYXR0cihcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XG4gICAgc3RvcmFnZUFQSSA9IGNyZWF0ZVByb2dyYW1Db2xsZWN0aW9uQVBJKFwiY29kZS5weXJldC5vcmdcIiwgZmFsc2UpO1xuICAgIHN0b3JhZ2VBUEkudGhlbihmdW5jdGlvbihhcGkpIHtcbiAgICAgIGFwaS5jb2xsZWN0aW9uLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICQoXCIubG9naW5Pbmx5XCIpLnNob3coKTtcbiAgICAgICAgJChcIi5sb2dvdXRPbmx5XCIpLmhpZGUoKTtcbiAgICAgICAgYXBpLmFwaS5nZXRDb2xsZWN0aW9uTGluaygpLnRoZW4oZnVuY3Rpb24obGluaykge1xuICAgICAgICAgICQoXCIjZHJpdmUtdmlldyBhXCIpLmF0dHIoXCJocmVmXCIsIGxpbmspO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYocGFyYW1zW1wiZ2V0XCJdICYmIHBhcmFtc1tcImdldFwiXVtcInByb2dyYW1cIl0pIHtcbiAgICAgICAgICB2YXIgdG9Mb2FkID0gYXBpLmFwaS5nZXRGaWxlQnlJZChwYXJhbXNbXCJnZXRcIl1bXCJwcm9ncmFtXCJdKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbiBhbmQgaGFzIHByb2dyYW0gdG8gbG9hZDogXCIsIHRvTG9hZCk7XG4gICAgICAgICAgbG9hZFByb2dyYW0odG9Mb2FkKTtcbiAgICAgICAgICBwcm9ncmFtVG9TYXZlID0gdG9Mb2FkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb2dyYW1Ub1NhdmUgPSBRLmZjYWxsKGZ1bmN0aW9uKCkgeyByZXR1cm4gbnVsbDsgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYXBpLmNvbGxlY3Rpb24uZmFpbChmdW5jdGlvbigpIHtcbiAgICAgICAgJChcIiNjb25uZWN0QnV0dG9uXCIpLnRleHQoXCJDb25uZWN0IHRvIEdvb2dsZSBEcml2ZVwiKTtcbiAgICAgICAgJChcIiNjb25uZWN0QnV0dG9uXCIpLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBzdG9yYWdlQVBJID0gc3RvcmFnZUFQSS50aGVuKGZ1bmN0aW9uKGFwaSkgeyByZXR1cm4gYXBpLmFwaTsgfSk7XG4gIH0pO1xuXG4gIHZhciBjb3B5T25TYXZlID0gZmFsc2U7XG5cbiAgdmFyIGluaXRpYWxQcm9ncmFtID0gc3RvcmFnZUFQSS50aGVuKGZ1bmN0aW9uKGFwaSkge1xuICAgIHZhciBwcm9ncmFtTG9hZCA9IG51bGw7XG4gICAgaWYocGFyYW1zW1wiZ2V0XCJdICYmIHBhcmFtc1tcImdldFwiXVtcInByb2dyYW1cIl0pIHtcbiAgICAgIHByb2dyYW1Mb2FkID0gYXBpLmdldEZpbGVCeUlkKHBhcmFtc1tcImdldFwiXVtcInByb2dyYW1cIl0pO1xuICAgICAgcHJvZ3JhbUxvYWQudGhlbihmdW5jdGlvbihwKSB7IHNob3dTaGFyZUNvbnRhaW5lcihwKTsgfSk7XG4gICAgfVxuICAgIGlmKHBhcmFtc1tcImdldFwiXSAmJiBwYXJhbXNbXCJnZXRcIl1bXCJzaGFyZVwiXSkge1xuICAgICAgcHJvZ3JhbUxvYWQgPSBhcGkuZ2V0U2hhcmVkRmlsZUJ5SWQocGFyYW1zW1wiZ2V0XCJdW1wic2hhcmVcIl0pO1xuICAgICAgJChcIiNzYXZlQnV0dG9uXCIpLnRleHQoXCJTYXZlIGEgQ29weVwiKTtcbiAgICAgIGNvcHlPblNhdmUgPSB0cnVlO1xuICAgIH1cbiAgICBpZihwcm9ncmFtTG9hZCkge1xuICAgICAgcHJvZ3JhbUxvYWQuZmFpbChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB3aW5kb3cuc3RpY2tFcnJvcihcIlRoZSBwcm9ncmFtIGZhaWxlZCB0byBsb2FkLlwiKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHByb2dyYW1Mb2FkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHNldFRpdGxlKHByb2dOYW1lKSB7XG4gICAgZG9jdW1lbnQudGl0bGUgPSBwcm9nTmFtZSArIFwiIC0gY29kZS5weXJldC5vcmdcIjtcbiAgfVxuICBDUE8uc2V0VGl0bGUgPSBzZXRUaXRsZTtcblxuICAkKFwiI2Rvd25sb2FkIGFcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRvd25sb2FkRWx0ID0gJChcIiNkb3dubG9hZCBhXCIpO1xuICAgIHZhciBjb250ZW50cyA9IENQTy5lZGl0b3IuY20uZ2V0VmFsdWUoKTtcbiAgICB2YXIgZG93bmxvYWRCbG9iID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW2NvbnRlbnRzXSwge3R5cGU6ICd0ZXh0L3BsYWluJ30pKTtcbiAgICB2YXIgZmlsZW5hbWUgPSAkKFwiI3Byb2dyYW0tbmFtZVwiKS52YWwoKTtcbiAgICBpZighZmlsZW5hbWUpIHsgZmlsZW5hbWUgPSAndW50aXRsZWRfcHJvZ3JhbS5hcnInOyB9XG4gICAgaWYoZmlsZW5hbWUuaW5kZXhPZihcIi5hcnJcIikgIT09IChmaWxlbmFtZS5sZW5ndGggLSA0KSkge1xuICAgICAgZmlsZW5hbWUgKz0gXCIuYXJyXCI7XG4gICAgfVxuICAgIGRvd25sb2FkRWx0LmF0dHIoe1xuICAgICAgZG93bmxvYWQ6IGZpbGVuYW1lLFxuICAgICAgaHJlZjogZG93bmxvYWRCbG9iXG4gICAgfSk7XG4gICAgJChcIiNkb3dubG9hZFwiKS5hcHBlbmQoZG93bmxvYWRFbHQpO1xuICB9KTtcblxuICBmdW5jdGlvbiBsb2FkUHJvZ3JhbShwKSB7XG4gICAgcmV0dXJuIHAudGhlbihmdW5jdGlvbihwKSB7XG4gICAgICBpZihwICE9PSBudWxsKSB7XG4gICAgICAgICQoXCIjcHJvZ3JhbS1uYW1lXCIpLnZhbChwLmdldE5hbWUoKSk7XG4gICAgICAgIHNldFRpdGxlKHAuZ2V0TmFtZSgpKTtcbiAgICAgICAgcmV0dXJuIHAuZ2V0Q29udGVudHMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHZhciBwcm9ncmFtTG9hZGVkID0gbG9hZFByb2dyYW0oaW5pdGlhbFByb2dyYW0pO1xuXG4gIHZhciBwcm9ncmFtVG9TYXZlID0gaW5pdGlhbFByb2dyYW07XG5cbiAgZnVuY3Rpb24gc2hvd1NoYXJlQ29udGFpbmVyKHApIHtcbiAgICAkKFwiI3NoYXJlQ29udGFpbmVyXCIpLmVtcHR5KCk7XG4gICAgJChcIiNzaGFyZUNvbnRhaW5lclwiKS5hcHBlbmQoc2hhcmVBUEkubWFrZVNoYXJlTGluayhwKSk7XG4gIH1cblxuICBmdW5jdGlvbiBuYW1lT3JVbnRpdGxlZCgpIHtcbiAgICByZXR1cm4gJChcIiNwcm9ncmFtLW5hbWVcIikudmFsKCkgfHwgXCJVbnRpdGxlZFwiO1xuICB9XG4gIGZ1bmN0aW9uIGF1dG9TYXZlKCkge1xuICAgIHByb2dyYW1Ub1NhdmUudGhlbihmdW5jdGlvbihwKSB7XG4gICAgICBpZihwICE9PSBudWxsICYmICFjb3B5T25TYXZlKSB7IHNhdmUoKTsgfVxuICAgIH0pO1xuICB9XG4gIENQTy5hdXRvU2F2ZSA9IGF1dG9TYXZlO1xuICBDUE8uc2hvd1NoYXJlQ29udGFpbmVyID0gc2hvd1NoYXJlQ29udGFpbmVyO1xuICBDUE8ubG9hZFByb2dyYW0gPSBsb2FkUHJvZ3JhbTtcblxuICBmdW5jdGlvbiBzYXZlKCkge1xuICAgIHdpbmRvdy5zdGlja01lc3NhZ2UoXCJTYXZpbmcuLi5cIik7XG4gICAgdmFyIHNhdmVkUHJvZ3JhbSA9IHByb2dyYW1Ub1NhdmUudGhlbihmdW5jdGlvbihwKSB7XG4gICAgICBpZihwICE9PSBudWxsICYmICFjb3B5T25TYXZlKSB7XG4gICAgICAgIGlmKHAuZ2V0TmFtZSgpICE9PSAkKFwiI3Byb2dyYW0tbmFtZVwiKS52YWwoKSkge1xuICAgICAgICAgIHByb2dyYW1Ub1NhdmUgPSBwLnJlbmFtZShuYW1lT3JVbnRpdGxlZCgpKS50aGVuKGZ1bmN0aW9uKG5ld1ApIHtcbiAgICAgICAgICAgIHJldHVybiBuZXdQO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9ncmFtVG9TYXZlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICBzaG93U2hhcmVDb250YWluZXIocCk7XG4gICAgICAgICAgcmV0dXJuIHAuc2F2ZShDUE8uZWRpdG9yLmNtLmdldFZhbHVlKCksIGZhbHNlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocCkge1xuICAgICAgICAgICQoXCIjcHJvZ3JhbS1uYW1lXCIpLnZhbChwLmdldE5hbWUoKSk7XG4gICAgICAgICAgJChcIiNzYXZlQnV0dG9uXCIpLnRleHQoXCJTYXZlXCIpO1xuICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIFwiI3Byb2dyYW09XCIgKyBwLmdldFVuaXF1ZUlkKCkpO1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gXCIjcHJvZ3JhbT1cIiArIHAuZ2V0VW5pcXVlSWQoKTtcbiAgICAgICAgICB3aW5kb3cuZmxhc2hNZXNzYWdlKFwiUHJvZ3JhbSBzYXZlZCBhcyBcIiArIHAuZ2V0TmFtZSgpKTtcbiAgICAgICAgICBzZXRUaXRsZShwLmdldE5hbWUoKSk7XG4gICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBwcm9ncmFtTmFtZSA9ICQoXCIjcHJvZ3JhbS1uYW1lXCIpLnZhbCgpIHx8IFwiVW50aXRsZWRcIjtcbiAgICAgICAgJChcIiNwcm9ncmFtLW5hbWVcIikudmFsKHByb2dyYW1OYW1lKTtcbiAgICAgICAgcHJvZ3JhbVRvU2F2ZSA9IHN0b3JhZ2VBUElcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihhcGkpIHsgcmV0dXJuIGFwaS5jcmVhdGVGaWxlKHByb2dyYW1OYW1lKTsgfSk7XG4gICAgICAgIGNvcHlPblNhdmUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHNhdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBzYXZlZFByb2dyYW0uZmFpbChmdW5jdGlvbihlcnIpIHtcbiAgICAgIHdpbmRvdy5zdGlja0Vycm9yKFwiVW5hYmxlIHRvIHNhdmVcIiwgXCJZb3VyIGludGVybmV0IGNvbm5lY3Rpb24gbWF5IGJlIGRvd24sIG9yIHNvbWV0aGluZyBlbHNlIG1pZ2h0IGJlIHdyb25nIHdpdGggdGhpcyBzaXRlIG9yIHNhdmluZyB0byBHb29nbGUuICBZb3Ugc2hvdWxkIGJhY2sgdXAgYW55IGNoYW5nZXMgdG8gdGhpcyBwcm9ncmFtIHNvbWV3aGVyZSBlbHNlLiAgWW91IGNhbiB0cnkgc2F2aW5nIGFnYWluIHRvIHNlZSBpZiB0aGUgcHJvYmxlbSB3YXMgdGVtcG9yYXJ5LCBhcyB3ZWxsLlwiKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9KTtcbiAgfVxuICBDUE8uc2F2ZSA9IHNhdmU7XG4gICQoXCIjcnVuQnV0dG9uXCIpLmNsaWNrKENQTy5hdXRvU2F2ZSk7XG4gICQoXCIjc2F2ZUJ1dHRvblwiKS5jbGljayhzYXZlKTtcbiAgc2hhcmVBUEkubWFrZUhvdmVyTWVudSgkKFwiI21lbnVcIiksICQoXCIjbWVudUNvbnRlbnRzXCIpLCBmYWxzZSwgZnVuY3Rpb24oKXt9KTtcblxuICBwcm9ncmFtTG9hZGVkLnRoZW4oZnVuY3Rpb24oYykge1xuICAgIHZhciBjb2RlQ29udGFpbmVyID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwicmVwbE1haW5cIik7XG4gICAgJChcIiNtYWluXCIpLnByZXBlbmQoY29kZUNvbnRhaW5lcik7XG5cbiAgICBDUE8uZWRpdG9yID0gQ1BPLm1ha2VFZGl0b3IoY29kZUNvbnRhaW5lciwge1xuICAgICAgcnVuQnV0dG9uOiAkKFwiI3J1bkJ1dHRvblwiKSxcbiAgICAgIHNpbXBsZUVkaXRvcjogZmFsc2UsXG4gICAgICBpbml0aWFsOiBjLFxuICAgICAgcnVuOiBDUE8uUlVOX0NPREUsXG4gICAgICBpbml0aWFsR2FzOiAxMDBcbiAgICB9KTtcbiAgICAvLyBOT1RFKGpvZSk6IENsZWFyaW5nIGhpc3RvcnkgdG8gYWRkcmVzcyBodHRwczovL2dpdGh1Yi5jb20vYnJvd25wbHQvcHlyZXQtbGFuZy9pc3N1ZXMvMzg2LFxuICAgIC8vIGluIHdoaWNoIHVuZG8gY2FuIHJldmVydCB0aGUgcHJvZ3JhbSBiYWNrIHRvIGVtcHR5XG4gICAgQ1BPLmVkaXRvci5jbS5jbGVhckhpc3RvcnkoKTtcbiAgfSk7XG5cbiAgcHJvZ3JhbUxvYWRlZC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb2RlQ29udGFpbmVyID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwicmVwbE1haW5cIik7XG4gICAgJChcIiNtYWluXCIpLnByZXBlbmQoY29kZUNvbnRhaW5lcik7XG5cbiAgICBDUE8uZWRpdG9yID0gQ1BPLm1ha2VFZGl0b3IoY29kZUNvbnRhaW5lciwge1xuICAgICAgcnVuQnV0dG9uOiAkKFwiI3J1bkJ1dHRvblwiKSxcbiAgICAgIHNpbXBsZUVkaXRvcjogZmFsc2UsXG4gICAgICBydW46IENQTy5SVU5fQ09ERSxcbiAgICAgIGluaXRpYWxHYXM6IDEwMFxuICAgIH0pO1xuICB9KTtcblxuICBwcm9ncmFtTG9hZGVkLmZpbihmdW5jdGlvbigpIHtcbiAgICB2YXIgcHlyZXRMb2FkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgY29uc29sZS5sb2coJ3Byb2Nlc3MuZW52IGlzJywgSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYpKTtcbiAgICBjb25zb2xlLmxvZygncHJvY2Vzcy5lbnYuUFlSRVQgaXMnLCBwcm9jZXNzLmVudi5QWVJFVCk7XG4gICAgY29uc29sZS5sb2cocHJvY2Vzcy5lbnYuUFlSRVQpO1xuICAgIHB5cmV0TG9hZC5zcmMgPSBwcm9jZXNzLmVudi5QWVJFVDtcbiAgICBweXJldExvYWQudHlwZSA9IFwidGV4dC9qYXZhc2NyaXB0XCI7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChweXJldExvYWQpO1xuICAgIENQTy5lZGl0b3IuZm9jdXMoKTtcbiAgICAkKHB5cmV0TG9hZCkub24oXCJlcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICQoXCIjbG9hZGVyXCIpLmhpZGUoKTtcbiAgICAgICQoXCIjcnVuUGFydFwiKS5oaWRlKCk7XG4gICAgICAkKFwiI2JyZWFrQnV0dG9uXCIpLmhpZGUoKTtcbiAgICAgIHdpbmRvdy5zdGlja0Vycm9yKFwiUHlyZXQgZmFpbGVkIHRvIGxvYWQ7IGNoZWNrIHlvdXIgY29ubmVjdGlvbiBvciB0cnkgcmVmcmVzaGluZyB0aGUgcGFnZS4gIElmIHRoaXMgaGFwcGVucyByZXBlYXRlZGx5LCBwbGVhc2UgcmVwb3J0IGl0IGFzIGEgYnVnLlwiKTtcbiAgICB9KTtcbiAgfSk7XG5cbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvd2ViL2pzL2JlZm9yZVB5cmV0LmpzXG4gKiovIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuKGZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNhY2hlZFNldFRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaXMgbm90IGRlZmluZWQnKTtcbiAgICB9XG4gIH1cbiAgdHJ5IHtcbiAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBpcyBub3QgZGVmaW5lZCcpO1xuICAgIH1cbiAgfVxufSAoKSlcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IGNhY2hlZFNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNhY2hlZENsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9wcm9jZXNzL2Jyb3dzZXIuanNcbiAqKiBtb2R1bGUgaWQgPSAxXG4gKiogbW9kdWxlIGNodW5rcyA9IDAgMVxuICoqLyIsIi8vIENvcHlyaWdodCAyMDEzLTIwMTQgS2V2aW4gQ294XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgVGhpcyBzb2Z0d2FyZSBpcyBwcm92aWRlZCAnYXMtaXMnLCB3aXRob3V0IGFueSBleHByZXNzIG9yIGltcGxpZWQgICAgICAgICAgICpcbiogIHdhcnJhbnR5LiBJbiBubyBldmVudCB3aWxsIHRoZSBhdXRob3JzIGJlIGhlbGQgbGlhYmxlIGZvciBhbnkgZGFtYWdlcyAgICAgICAqXG4qICBhcmlzaW5nIGZyb20gdGhlIHVzZSBvZiB0aGlzIHNvZnR3YXJlLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogIFBlcm1pc3Npb24gaXMgZ3JhbnRlZCB0byBhbnlvbmUgdG8gdXNlIHRoaXMgc29mdHdhcmUgZm9yIGFueSBwdXJwb3NlLCAgICAgICAqXG4qICBpbmNsdWRpbmcgY29tbWVyY2lhbCBhcHBsaWNhdGlvbnMsIGFuZCB0byBhbHRlciBpdCBhbmQgcmVkaXN0cmlidXRlIGl0ICAgICAgKlxuKiAgZnJlZWx5LCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgcmVzdHJpY3Rpb25zOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICAxLiBUaGUgb3JpZ2luIG9mIHRoaXMgc29mdHdhcmUgbXVzdCBub3QgYmUgbWlzcmVwcmVzZW50ZWQ7IHlvdSBtdXN0IG5vdCAgICAgKlxuKiAgICAgY2xhaW0gdGhhdCB5b3Ugd3JvdGUgdGhlIG9yaWdpbmFsIHNvZnR3YXJlLiBJZiB5b3UgdXNlIHRoaXMgc29mdHdhcmUgaW4gICpcbiogICAgIGEgcHJvZHVjdCwgYW4gYWNrbm93bGVkZ21lbnQgaW4gdGhlIHByb2R1Y3QgZG9jdW1lbnRhdGlvbiB3b3VsZCBiZSAgICAgICAqXG4qICAgICBhcHByZWNpYXRlZCBidXQgaXMgbm90IHJlcXVpcmVkLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogIDIuIEFsdGVyZWQgc291cmNlIHZlcnNpb25zIG11c3QgYmUgcGxhaW5seSBtYXJrZWQgYXMgc3VjaCwgYW5kIG11c3Qgbm90IGJlICAqXG4qICAgICBtaXNyZXByZXNlbnRlZCBhcyBiZWluZyB0aGUgb3JpZ2luYWwgc29mdHdhcmUuICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogIDMuIFRoaXMgbm90aWNlIG1heSBub3QgYmUgcmVtb3ZlZCBvciBhbHRlcmVkIGZyb20gYW55IHNvdXJjZSBkaXN0cmlidXRpb24uICAqXG4qICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuK2Z1bmN0aW9uKCl7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGFycmF5ID0gL1xcWyhbXlxcW10qKVxcXSQvO1xuXG4vLy8gVVJMIFJlZ2V4LlxuLyoqXG4gKiBUaGlzIHJlZ2V4IHNwbGl0cyB0aGUgVVJMIGludG8gcGFydHMuICBUaGUgY2FwdHVyZSBncm91cHMgY2F0Y2ggdGhlIGltcG9ydGFudFxuICogYml0cy5cbiAqIFxuICogRWFjaCBzZWN0aW9uIGlzIG9wdGlvbmFsLCBzbyB0byB3b3JrIG9uIGFueSBwYXJ0IGZpbmQgdGhlIGNvcnJlY3QgdG9wIGxldmVsXG4gKiBgKC4uLik/YCBhbmQgbWVzcyBhcm91bmQgd2l0aCBpdC5cbiAqL1xudmFyIHJlZ2V4ID0gL14oPzooW2Etel0qKTopPyg/OlxcL1xcLyk/KD86KFteOkBdKikoPzo6KFteQF0qKSk/QCk/KFthLXotLl9dKyk/KD86OihbMC05XSopKT8oXFwvW14/I10qKT8oPzpcXD8oW14jXSopKT8oPzojKC4qKSk/JC9pO1xuLy8gICAgICAgICAgICAgICAxIC0gc2NoZW1lICAgICAgICAgICAgICAgIDIgLSB1c2VyICAgIDMgPSBwYXNzIDQgLSBob3N0ICAgICAgICA1IC0gcG9ydCAgNiAtIHBhdGggICAgICAgIDcgLSBxdWVyeSAgICA4IC0gaGFzaFxuXG52YXIgbm9zbGFzaCA9IFtcIm1haWx0b1wiLFwiYml0Y29pblwiXTtcblxudmFyIHNlbGYgPSB7XG5cdC8qKiBQYXJzZSBhIHF1ZXJ5IHN0cmluZy5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBwYXJzZXMgYSBxdWVyeSBzdHJpbmcgKHNvbWV0aW1lcyBjYWxsZWQgdGhlIHNlYXJjaFxuXHQgKiBzdHJpbmcpLiAgSXQgdGFrZXMgYSBxdWVyeSBzdHJpbmcgYW5kIHJldHVybnMgYSBtYXAgb2YgdGhlIHJlc3VsdHMuXG5cdCAqXG5cdCAqIEtleXMgYXJlIGNvbnNpZGVyZWQgdG8gYmUgZXZlcnl0aGluZyB1cCB0byB0aGUgZmlyc3QgJz0nIGFuZCB2YWx1ZXMgYXJlXG5cdCAqIGV2ZXJ5dGhpbmcgYWZ0ZXJ3b3Jkcy4gIFNpbmNlIFVSTC1kZWNvZGluZyBpcyBkb25lIGFmdGVyIHBhcnNpbmcsIGtleXNcblx0ICogYW5kIHZhbHVlcyBjYW4gaGF2ZSBhbnkgdmFsdWVzLCBob3dldmVyLCAnPScgaGF2ZSB0byBiZSBlbmNvZGVkIGluIGtleXNcblx0ICogd2hpbGUgJz8nIGFuZCAnJicgaGF2ZSB0byBiZSBlbmNvZGVkIGFueXdoZXJlIChhcyB0aGV5IGRlbGltaXQgdGhlXG5cdCAqIGt2LXBhaXJzKS5cblx0ICpcblx0ICogS2V5cyBhbmQgdmFsdWVzIHdpbGwgYWx3YXlzIGJlIHN0cmluZ3MsIGV4Y2VwdCBpZiB0aGVyZSBpcyBhIGtleSB3aXRoIG5vXG5cdCAqICc9JyBpbiB3aGljaCBjYXNlIGl0IHdpbGwgYmUgY29uc2lkZXJlZCBhIGZsYWcgYW5kIHdpbGwgYmUgc2V0IHRvIHRydWUuXG5cdCAqIExhdGVyIHZhbHVlcyB3aWxsIG92ZXJyaWRlIGVhcmxpZXIgdmFsdWVzLlxuXHQgKlxuXHQgKiBBcnJheSBrZXlzIGFyZSBhbHNvIHN1cHBvcnRlZC4gIEJ5IGRlZmF1bHQga2V5cyBpbiB0aGUgZm9ybSBvZiBgbmFtZVtpXWBcblx0ICogd2lsbCBiZSByZXR1cm5lZCBsaWtlIHRoYXQgYXMgc3RyaW5ncy4gIEhvd2V2ZXIsIGlmIHlvdSBzZXQgdGhlIGBhcnJheWBcblx0ICogZmxhZyBpbiB0aGUgb3B0aW9ucyBvYmplY3QgdGhleSB3aWxsIGJlIHBhcnNlZCBpbnRvIGFycmF5cy4gIE5vdGUgdGhhdFxuXHQgKiBhbHRob3VnaCB0aGUgb2JqZWN0IHJldHVybmVkIGlzIGFuIGBBcnJheWAgb2JqZWN0IGFsbCBrZXlzIHdpbGwgYmVcblx0ICogd3JpdHRlbiB0byBpdC4gIFRoaXMgbWVhbnMgdGhhdCBpZiB5b3UgaGF2ZSBhIGtleSBzdWNoIGFzIGBrW2ZvckVhY2hdYFxuXHQgKiBpdCB3aWxsIG92ZXJ3cml0ZSB0aGUgYGZvckVhY2hgIGZ1bmN0aW9uIG9uIHRoYXQgYXJyYXkuICBBbHNvIG5vdGUgdGhhdFxuXHQgKiBzdHJpbmcgcHJvcGVydGllcyBhbHdheXMgdGFrZSBwcmVjZWRlbmNlIG92ZXIgYXJyYXkgcHJvcGVydGllcyxcblx0ICogaXJyZXNwZWN0aXZlIG9mIHdoZXJlIHRoZXkgYXJlIGluIHRoZSBxdWVyeSBzdHJpbmcuXG5cdCAqXG5cdCAqICAgdXJsLmdldChcImFycmF5WzFdPXRlc3QmYXJyYXlbZm9vXT1iYXJcIix7YXJyYXk6dHJ1ZX0pLmFycmF5WzFdICA9PT0gXCJ0ZXN0XCJcblx0ICogICB1cmwuZ2V0KFwiYXJyYXlbMV09dGVzdCZhcnJheVtmb29dPWJhclwiLHthcnJheTp0cnVlfSkuYXJyYXkuZm9vID09PSBcImJhclwiXG5cdCAqICAgdXJsLmdldChcImFycmF5PW5vdGFuYXJyYXkmYXJyYXlbMF09MVwiLHthcnJheTp0cnVlfSkuYXJyYXkgICAgICA9PT0gXCJub3RhbmFycmF5XCJcblx0ICpcblx0ICogSWYgYXJyYXkgcGFyc2luZyBpcyBlbmFibGVkIGtleXMgaW4gdGhlIGZvcm0gb2YgYG5hbWVbXWAgd2lsbFxuXHQgKiBhdXRvbWF0aWNhbGx5IGJlIGdpdmVuIHRoZSBuZXh0IGF2YWlsYWJsZSBpbmRleC4gIE5vdGUgdGhhdCB0aGlzIGNhbiBiZVxuXHQgKiBvdmVyd3JpdHRlbiB3aXRoIGxhdGVyIHZhbHVlcyBpbiB0aGUgcXVlcnkgc3RyaW5nLiAgRm9yIHRoaXMgcmVhc29uIGlzXG5cdCAqIGlzIGJlc3Qgbm90IHRvIG1peCB0aGUgdHdvIGZvcm1hdHMsIGFsdGhvdWdoIGl0IGlzIHNhZmUgKGFuZCBvZnRlblxuXHQgKiB1c2VmdWwpIHRvIGFkZCBhbiBhdXRvbWF0aWMgaW5kZXggYXJndW1lbnQgdG8gdGhlIGVuZCBvZiBhIHF1ZXJ5IHN0cmluZy5cblx0ICpcblx0ICogICB1cmwuZ2V0KFwiYVtdPTAmYVtdPTEmYVswXT0yXCIsIHthcnJheTp0cnVlfSkgIC0+IHthOltcIjJcIixcIjFcIl19O1xuXHQgKiAgIHVybC5nZXQoXCJhWzBdPTAmYVsxXT0xJmFbXT0yXCIsIHthcnJheTp0cnVlfSkgLT4ge2E6W1wiMFwiLFwiMVwiLFwiMlwiXX07XG5cdCAqXG5cdCAqIEBwYXJhbXtzdHJpbmd9IHEgVGhlIHF1ZXJ5IHN0cmluZyAodGhlIHBhcnQgYWZ0ZXIgdGhlICc/JykuXG5cdCAqIEBwYXJhbXt7ZnVsbDpib29sZWFuLGFycmF5OmJvb2xlYW59PX0gb3B0IE9wdGlvbnMuXG5cdCAqXG5cdCAqIC0gZnVsbDogSWYgc2V0IGBxYCB3aWxsIGJlIHRyZWF0ZWQgYXMgYSBmdWxsIHVybCBhbmQgYHFgIHdpbGwgYmUgYnVpbHQuXG5cdCAqICAgYnkgY2FsbGluZyAjcGFyc2UgdG8gcmV0cmlldmUgdGhlIHF1ZXJ5IHBvcnRpb24uXG5cdCAqIC0gYXJyYXk6IElmIHNldCBrZXlzIGluIHRoZSBmb3JtIG9mIGBrZXlbaV1gIHdpbGwgYmUgdHJlYXRlZFxuXHQgKiAgIGFzIGFycmF5cy9tYXBzLlxuXHQgKlxuXHQgKiBAcmV0dXJueyFPYmplY3QuPHN0cmluZywgc3RyaW5nfEFycmF5Pn0gVGhlIHBhcnNlZCByZXN1bHQuXG5cdCAqL1xuXHRcImdldFwiOiBmdW5jdGlvbihxLCBvcHQpe1xuXHRcdHEgPSBxIHx8IFwiXCI7XG5cdFx0aWYgKCB0eXBlb2Ygb3B0ICAgICAgICAgID09IFwidW5kZWZpbmVkXCIgKSBvcHQgPSB7fTtcblx0XHRpZiAoIHR5cGVvZiBvcHRbXCJmdWxsXCJdICA9PSBcInVuZGVmaW5lZFwiICkgb3B0W1wiZnVsbFwiXSA9IGZhbHNlO1xuXHRcdGlmICggdHlwZW9mIG9wdFtcImFycmF5XCJdID09IFwidW5kZWZpbmVkXCIgKSBvcHRbXCJhcnJheVwiXSA9IGZhbHNlO1xuXHRcdFxuXHRcdGlmICggb3B0W1wiZnVsbFwiXSA9PT0gdHJ1ZSApXG5cdFx0e1xuXHRcdFx0cSA9IHNlbGZbXCJwYXJzZVwiXShxLCB7XCJnZXRcIjpmYWxzZX0pW1wicXVlcnlcIl0gfHwgXCJcIjtcblx0XHR9XG5cdFx0XG5cdFx0dmFyIG8gPSB7fTtcblx0XHRcblx0XHR2YXIgYyA9IHEuc3BsaXQoXCImXCIpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRpZiAoIWNbaV0ubGVuZ3RoKSBjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0dmFyIGQgPSBjW2ldLmluZGV4T2YoXCI9XCIpO1xuXHRcdFx0dmFyIGsgPSBjW2ldLCB2ID0gdHJ1ZTtcblx0XHRcdGlmICggZCA+PSAwIClcblx0XHRcdHtcblx0XHRcdFx0ayA9IGNbaV0uc3Vic3RyKDAsIGQpO1xuXHRcdFx0XHR2ID0gY1tpXS5zdWJzdHIoZCsxKTtcblx0XHRcdFx0XG5cdFx0XHRcdHYgPSBkZWNvZGVVUklDb21wb25lbnQodik7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmIChvcHRbXCJhcnJheVwiXSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIGluZHMgPSBbXTtcblx0XHRcdFx0dmFyIGluZDtcblx0XHRcdFx0dmFyIGN1cm8gPSBvO1xuXHRcdFx0XHR2YXIgY3VyayA9IGs7XG5cdFx0XHRcdHdoaWxlIChpbmQgPSBjdXJrLm1hdGNoKGFycmF5KSkgLy8gQXJyYXkhXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjdXJrID0gY3Vyay5zdWJzdHIoMCwgaW5kLmluZGV4KTtcblx0XHRcdFx0XHRpbmRzLnVuc2hpZnQoZGVjb2RlVVJJQ29tcG9uZW50KGluZFsxXSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGN1cmsgPSBkZWNvZGVVUklDb21wb25lbnQoY3Vyayk7XG5cdFx0XHRcdGlmIChpbmRzLnNvbWUoZnVuY3Rpb24oaSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICggdHlwZW9mIGN1cm9bY3Vya10gPT0gXCJ1bmRlZmluZWRcIiApIGN1cm9bY3Vya10gPSBbXTtcblx0XHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoY3Vyb1tjdXJrXSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcInVybC5nZXQ6IEFycmF5IHByb3BlcnR5IFwiK2N1cmsrXCIgYWxyZWFkeSBleGlzdHMgYXMgc3RyaW5nIVwiKTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjdXJvID0gY3Vyb1tjdXJrXTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAoIGkgPT09IFwiXCIgKSBpID0gY3Vyby5sZW5ndGg7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y3VyayA9IGk7XG5cdFx0XHRcdH0pKSBjb250aW51ZTtcblx0XHRcdFx0Y3Vyb1tjdXJrXSA9IHY7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRrID0gZGVjb2RlVVJJQ29tcG9uZW50KGspO1xuXHRcdFx0XG5cdFx0XHQvL3R5cGVvZiBvW2tdID09IFwidW5kZWZpbmVkXCIgfHwgY29uc29sZS5sb2coXCJQcm9wZXJ0eSBcIitrK1wiIGFscmVhZHkgZXhpc3RzIVwiKTtcblx0XHRcdG9ba10gPSB2O1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbztcblx0fSxcblx0XG5cdC8qKiBCdWlsZCBhIGdldCBxdWVyeSBmcm9tIGFuIG9iamVjdC5cblx0ICpcblx0ICogVGhpcyBjb25zdHJ1Y3RzIGEgcXVlcnkgc3RyaW5nIGZyb20gdGhlIGt2IHBhaXJzIGluIGBkYXRhYC4gIENhbGxpbmdcblx0ICogI2dldCBvbiB0aGUgc3RyaW5nIHJldHVybmVkIHNob3VsZCByZXR1cm4gYW4gb2JqZWN0IGlkZW50aWNhbCB0byB0aGUgb25lXG5cdCAqIHBhc3NlZCBpbiBleGNlcHQgYWxsIG5vbi1ib29sZWFuIHNjYWxhciB0eXBlcyBiZWNvbWUgc3RyaW5ncyBhbmQgYWxsXG5cdCAqIG9iamVjdCB0eXBlcyBiZWNvbWUgYXJyYXlzIChub24taW50ZWdlciBrZXlzIGFyZSBzdGlsbCBwcmVzZW50LCBzZWVcblx0ICogI2dldCdzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscykuXG5cdCAqXG5cdCAqIFRoaXMgYWx3YXlzIHVzZXMgYXJyYXkgc3ludGF4IGZvciBkZXNjcmliaW5nIGFycmF5cy4gIElmIHlvdSB3YW50IHRvXG5cdCAqIHNlcmlhbGl6ZSB0aGVtIGRpZmZlcmVudGx5IChsaWtlIGhhdmluZyB0aGUgdmFsdWUgYmUgYSBKU09OIGFycmF5IGFuZFxuXHQgKiBoYXZlIGEgcGxhaW4ga2V5KSB5b3Ugd2lsbCBuZWVkIHRvIGRvIHRoYXQgYmVmb3JlIHBhc3NpbmcgaXQgaW4uXG5cdCAqXG5cdCAqIEFsbCBrZXlzIGFuZCB2YWx1ZXMgYXJlIHN1cHBvcnRlZCAoYmluYXJ5IGRhdGEgYW55b25lPykgYXMgdGhleSBhcmVcblx0ICogcHJvcGVybHkgVVJMLWVuY29kZWQgYW5kICNnZXQgcHJvcGVybHkgZGVjb2Rlcy5cblx0ICpcblx0ICogQHBhcmFte09iamVjdH0gZGF0YSBUaGUga3YgcGFpcnMuXG5cdCAqIEBwYXJhbXtzdHJpbmd9IHByZWZpeCBUaGUgcHJvcGVybHkgZW5jb2RlZCBhcnJheSBrZXkgdG8gcHV0IHRoZVxuXHQgKiAgIHByb3BlcnRpZXMuICBNYWlubHkgaW50ZW5kZWQgZm9yIGludGVybmFsIHVzZS5cblx0ICogQHJldHVybntzdHJpbmd9IEEgVVJMLXNhZmUgc3RyaW5nLlxuXHQgKi9cblx0XCJidWlsZGdldFwiOiBmdW5jdGlvbihkYXRhLCBwcmVmaXgpe1xuXHRcdHZhciBpdG1zID0gW107XG5cdFx0Zm9yICggdmFyIGsgaW4gZGF0YSApXG5cdFx0e1xuXHRcdFx0dmFyIGVrID0gZW5jb2RlVVJJQ29tcG9uZW50KGspO1xuXHRcdFx0aWYgKCB0eXBlb2YgcHJlZml4ICE9IFwidW5kZWZpbmVkXCIgKVxuXHRcdFx0XHRlayA9IHByZWZpeCtcIltcIitlaytcIl1cIjtcblx0XHRcdFxuXHRcdFx0dmFyIHYgPSBkYXRhW2tdO1xuXHRcdFx0XG5cdFx0XHRzd2l0Y2ggKHR5cGVvZiB2KVxuXHRcdFx0e1xuXHRcdFx0XHRjYXNlICdib29sZWFuJzpcblx0XHRcdFx0XHRpZih2KSBpdG1zLnB1c2goZWspO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0XHRcdHYgPSB2LnRvU3RyaW5nKCk7XG5cdFx0XHRcdGNhc2UgJ3N0cmluZyc6XG5cdFx0XHRcdFx0aXRtcy5wdXNoKGVrK1wiPVwiK2VuY29kZVVSSUNvbXBvbmVudCh2KSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ29iamVjdCc6XG5cdFx0XHRcdFx0aXRtcy5wdXNoKHNlbGZbXCJidWlsZGdldFwiXSh2LCBlaykpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gaXRtcy5qb2luKFwiJlwiKTtcblx0fSxcblx0XG5cdC8qKiBQYXJzZSBhIFVSTFxuXHQgKiBcblx0ICogVGhpcyBicmVha3MgdXAgYSBVUkwgaW50byBjb21wb25lbnRzLiAgSXQgYXR0ZW1wdHMgdG8gYmUgdmVyeSBsaWJlcmFsXG5cdCAqIGFuZCByZXR1cm5zIHRoZSBiZXN0IHJlc3VsdCBpbiBtb3N0IGNhc2VzLiAgVGhpcyBtZWFucyB0aGF0IHlvdSBjYW5cblx0ICogb2Z0ZW4gcGFzcyBpbiBwYXJ0IG9mIGEgVVJMIGFuZCBnZXQgY29ycmVjdCBjYXRlZ29yaWVzIGJhY2suICBOb3RhYmx5LFxuXHQgKiB0aGlzIHdvcmtzIGZvciBlbWFpbHMgYW5kIEphYmJlciBJRHMsIGFzIHdlbGwgYXMgYWRkaW5nIGEgJz8nIHRvIHRoZVxuXHQgKiBiZWdpbm5pbmcgb2YgYSBzdHJpbmcgd2lsbCBwYXJzZSB0aGUgd2hvbGUgdGhpbmcgYXMgYSBxdWVyeSBzdHJpbmcuICBJZlxuXHQgKiBhbiBpdGVtIGlzIG5vdCBmb3VuZCB0aGUgcHJvcGVydHkgd2lsbCBiZSB1bmRlZmluZWQuICBJbiBzb21lIGNhc2VzIGFuXG5cdCAqIGVtcHR5IHN0cmluZyB3aWxsIGJlIHJldHVybmVkIGlmIHRoZSBzdXJyb3VuZGluZyBzeW50YXggYnV0IHRoZSBhY3R1YWxcblx0ICogdmFsdWUgaXMgZW1wdHkgKGV4YW1wbGU6IFwiOi8vZXhhbXBsZS5jb21cIiB3aWxsIGdpdmUgYSBlbXB0eSBzdHJpbmcgZm9yXG5cdCAqIHNjaGVtZS4pICBOb3RhYmx5IHRoZSBob3N0IG5hbWUgd2lsbCBhbHdheXMgYmUgc2V0IHRvIHNvbWV0aGluZy5cblx0ICogXG5cdCAqIFJldHVybmVkIHByb3BlcnRpZXMuXG5cdCAqIFxuXHQgKiAtICoqc2NoZW1lOioqIFRoZSB1cmwgc2NoZW1lLiAoZXg6IFwibWFpbHRvXCIgb3IgXCJodHRwc1wiKVxuXHQgKiAtICoqdXNlcjoqKiBUaGUgdXNlcm5hbWUuXG5cdCAqIC0gKipwYXNzOioqIFRoZSBwYXNzd29yZC5cblx0ICogLSAqKmhvc3Q6KiogVGhlIGhvc3RuYW1lLiAoZXg6IFwibG9jYWxob3N0XCIsIFwiMTIzLjQ1Ni43LjhcIiBvciBcImV4YW1wbGUuY29tXCIpXG5cdCAqIC0gKipwb3J0OioqIFRoZSBwb3J0LCBhcyBhIG51bWJlci4gKGV4OiAxMzM3KVxuXHQgKiAtICoqcGF0aDoqKiBUaGUgcGF0aC4gKGV4OiBcIi9cIiBvciBcIi9hYm91dC5odG1sXCIpXG5cdCAqIC0gKipxdWVyeToqKiBcIlRoZSBxdWVyeSBzdHJpbmcuIChleDogXCJmb289YmFyJnY9MTcmZm9ybWF0PWpzb25cIilcblx0ICogLSAqKmdldDoqKiBUaGUgcXVlcnkgc3RyaW5nIHBhcnNlZCB3aXRoIGdldC4gIElmIGBvcHQuZ2V0YCBpcyBgZmFsc2VgIHRoaXNcblx0ICogICB3aWxsIGJlIGFic2VudFxuXHQgKiAtICoqaGFzaDoqKiBUaGUgdmFsdWUgYWZ0ZXIgdGhlIGhhc2guIChleDogXCJteWFuY2hvclwiKVxuXHQgKiAgIGJlIHVuZGVmaW5lZCBldmVuIGlmIGBxdWVyeWAgaXMgc2V0LlxuXHQgKlxuXHQgKiBAcGFyYW17c3RyaW5nfSB1cmwgVGhlIFVSTCB0byBwYXJzZS5cblx0ICogQHBhcmFte3tnZXQ6T2JqZWN0fT19IG9wdCBPcHRpb25zOlxuXHQgKlxuXHQgKiAtIGdldDogQW4gb3B0aW9ucyBhcmd1bWVudCB0byBiZSBwYXNzZWQgdG8gI2dldCBvciBmYWxzZSB0byBub3QgY2FsbCAjZ2V0LlxuXHQgKiAgICAqKkRPIE5PVCoqIHNldCBgZnVsbGAuXG5cdCAqXG5cdCAqIEByZXR1cm57IU9iamVjdH0gQW4gb2JqZWN0IHdpdGggdGhlIHBhcnNlZCB2YWx1ZXMuXG5cdCAqL1xuXHRcInBhcnNlXCI6IGZ1bmN0aW9uKHVybCwgb3B0KSB7XG5cdFx0XG5cdFx0aWYgKCB0eXBlb2Ygb3B0ID09IFwidW5kZWZpbmVkXCIgKSBvcHQgPSB7fTtcblx0XHRcblx0XHR2YXIgbWQgPSB1cmwubWF0Y2gocmVnZXgpIHx8IFtdO1xuXHRcdFxuXHRcdHZhciByID0ge1xuXHRcdFx0XCJ1cmxcIjogICAgdXJsLFxuXHRcdFx0XG5cdFx0XHRcInNjaGVtZVwiOiBtZFsxXSxcblx0XHRcdFwidXNlclwiOiAgIG1kWzJdLFxuXHRcdFx0XCJwYXNzXCI6ICAgbWRbM10sXG5cdFx0XHRcImhvc3RcIjogICBtZFs0XSxcblx0XHRcdFwicG9ydFwiOiAgIG1kWzVdICYmICttZFs1XSxcblx0XHRcdFwicGF0aFwiOiAgIG1kWzZdLFxuXHRcdFx0XCJxdWVyeVwiOiAgbWRbN10sXG5cdFx0XHRcImhhc2hcIjogICBtZFs4XSxcblx0XHR9O1xuXHRcdFxuXHRcdGlmICggb3B0LmdldCAhPT0gZmFsc2UgKVxuXHRcdFx0cltcImdldFwiXSA9IHJbXCJxdWVyeVwiXSAmJiBzZWxmW1wiZ2V0XCJdKHJbXCJxdWVyeVwiXSwgb3B0LmdldCk7XG5cdFx0XG5cdFx0cmV0dXJuIHI7XG5cdH0sXG5cdFxuXHQvKiogQnVpbGQgYSBVUkwgZnJvbSBjb21wb25lbnRzLlxuXHQgKiBcblx0ICogVGhpcyBwaWVjZXMgdG9nZXRoZXIgYSB1cmwgZnJvbSB0aGUgcHJvcGVydGllcyBvZiB0aGUgcGFzc2VkIGluIG9iamVjdC5cblx0ICogSW4gZ2VuZXJhbCBwYXNzaW5nIHRoZSByZXN1bHQgb2YgYHBhcnNlKClgIHNob3VsZCByZXR1cm4gdGhlIFVSTC4gIFRoZXJlXG5cdCAqIG1heSBkaWZmZXJlbmNlcyBpbiB0aGUgZ2V0IHN0cmluZyBhcyB0aGUga2V5cyBhbmQgdmFsdWVzIG1pZ2h0IGJlIG1vcmVcblx0ICogZW5jb2RlZCB0aGVuIHRoZXkgd2VyZSBvcmlnaW5hbGx5IHdlcmUuICBIb3dldmVyLCBjYWxsaW5nIGBnZXQoKWAgb24gdGhlXG5cdCAqIHR3byB2YWx1ZXMgc2hvdWxkIHlpZWxkIHRoZSBzYW1lIHJlc3VsdC5cblx0ICogXG5cdCAqIEhlcmUgaXMgaG93IHRoZSBwYXJhbWV0ZXJzIGFyZSB1c2VkLlxuXHQgKiBcblx0ICogIC0gdXJsOiBVc2VkIG9ubHkgaWYgbm8gb3RoZXIgdmFsdWVzIGFyZSBwcm92aWRlZC4gIElmIHRoYXQgaXMgdGhlIGNhc2Vcblx0ICogICAgIGB1cmxgIHdpbGwgYmUgcmV0dXJuZWQgdmVyYmF0aW0uXG5cdCAqICAtIHNjaGVtZTogVXNlZCBpZiBkZWZpbmVkLlxuXHQgKiAgLSB1c2VyOiBVc2VkIGlmIGRlZmluZWQuXG5cdCAqICAtIHBhc3M6IFVzZWQgaWYgZGVmaW5lZC5cblx0ICogIC0gaG9zdDogVXNlZCBpZiBkZWZpbmVkLlxuXHQgKiAgLSBwYXRoOiBVc2VkIGlmIGRlZmluZWQuXG5cdCAqICAtIHF1ZXJ5OiBVc2VkIG9ubHkgaWYgYGdldGAgaXMgbm90IHByb3ZpZGVkIGFuZCBub24tZW1wdHkuXG5cdCAqICAtIGdldDogVXNlZCBpZiBub24tZW1wdHkuICBQYXNzZWQgdG8gI2J1aWxkZ2V0IGFuZCB0aGUgcmVzdWx0IGlzIHVzZWRcblx0ICogICAgYXMgdGhlIHF1ZXJ5IHN0cmluZy5cblx0ICogIC0gaGFzaDogVXNlZCBpZiBkZWZpbmVkLlxuXHQgKiBcblx0ICogVGhlc2UgYXJlIHRoZSBvcHRpb25zIHRoYXQgYXJlIHZhbGlkIG9uIHRoZSBvcHRpb25zIG9iamVjdC5cblx0ICogXG5cdCAqICAtIHVzZWVtcHR5Z2V0OiBJZiB0cnV0aHksIGEgcXVlc3Rpb24gbWFyayB3aWxsIGJlIGFwcGVuZGVkIGZvciBlbXB0eSBnZXRcblx0ICogICAgc3RyaW5ncy4gIFRoaXMgbm90YWJseSBtYWtlcyBgYnVpbGQoKWAgYW5kIGBwYXJzZSgpYCBmdWxseSBzeW1tZXRyaWMuXG5cdCAqXG5cdCAqIEBwYXJhbXtPYmplY3R9IGRhdGEgVGhlIHBpZWNlcyBvZiB0aGUgVVJMLlxuXHQgKiBAcGFyYW17T2JqZWN0fSBvcHQgT3B0aW9ucyBmb3IgYnVpbGRpbmcgdGhlIHVybC5cblx0ICogQHJldHVybntzdHJpbmd9IFRoZSBVUkwuXG5cdCAqL1xuXHRcImJ1aWxkXCI6IGZ1bmN0aW9uKGRhdGEsIG9wdCl7XG5cdFx0b3B0ID0gb3B0IHx8IHt9O1xuXHRcdFxuXHRcdHZhciByID0gXCJcIjtcblx0XHRcblx0XHRpZiAoIHR5cGVvZiBkYXRhW1wic2NoZW1lXCJdICE9IFwidW5kZWZpbmVkXCIgKVxuXHRcdHtcblx0XHRcdHIgKz0gZGF0YVtcInNjaGVtZVwiXTtcblx0XHRcdHIgKz0gKG5vc2xhc2guaW5kZXhPZihkYXRhW1wic2NoZW1lXCJdKT49MCk/XCI6XCI6XCI6Ly9cIjtcblx0XHR9XG5cdFx0aWYgKCB0eXBlb2YgZGF0YVtcInVzZXJcIl0gIT0gXCJ1bmRlZmluZWRcIiApXG5cdFx0e1xuXHRcdFx0ciArPSBkYXRhW1widXNlclwiXTtcblx0XHRcdGlmICggdHlwZW9mIGRhdGFbXCJwYXNzXCJdID09IFwidW5kZWZpbmVkXCIgKVxuXHRcdFx0e1xuXHRcdFx0XHRyICs9IFwiQFwiO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIHR5cGVvZiBkYXRhW1wicGFzc1wiXSAhPSBcInVuZGVmaW5lZFwiICkgciArPSBcIjpcIiArIGRhdGFbXCJwYXNzXCJdICsgXCJAXCI7XG5cdFx0aWYgKCB0eXBlb2YgZGF0YVtcImhvc3RcIl0gIT0gXCJ1bmRlZmluZWRcIiApIHIgKz0gZGF0YVtcImhvc3RcIl07XG5cdFx0aWYgKCB0eXBlb2YgZGF0YVtcInBvcnRcIl0gIT0gXCJ1bmRlZmluZWRcIiApIHIgKz0gXCI6XCIgKyBkYXRhW1wicG9ydFwiXTtcblx0XHRpZiAoIHR5cGVvZiBkYXRhW1wicGF0aFwiXSAhPSBcInVuZGVmaW5lZFwiICkgciArPSBkYXRhW1wicGF0aFwiXTtcblx0XHRcblx0XHRpZiAob3B0W1widXNlZW1wdHlnZXRcIl0pXG5cdFx0e1xuXHRcdFx0aWYgICAgICAoIHR5cGVvZiBkYXRhW1wiZ2V0XCJdICAgIT0gXCJ1bmRlZmluZWRcIiApIHIgKz0gXCI/XCIgKyBzZWxmW1wiYnVpbGRnZXRcIl0oZGF0YVtcImdldFwiXSk7XG5cdFx0XHRlbHNlIGlmICggdHlwZW9mIGRhdGFbXCJxdWVyeVwiXSAhPSBcInVuZGVmaW5lZFwiICkgciArPSBcIj9cIiArIGRhdGFbXCJxdWVyeVwiXTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdC8vIElmIC5nZXQgdXNlIGl0LiAgSWYgLmdldCBsZWFkcyB0byBlbXB0eSwgdXNlIC5xdWVyeS5cblx0XHRcdHZhciBxID0gZGF0YVtcImdldFwiXSAmJiBzZWxmW1wiYnVpbGRnZXRcIl0oZGF0YVtcImdldFwiXSkgfHwgZGF0YVtcInF1ZXJ5XCJdO1xuXHRcdFx0aWYgKHEpIHIgKz0gXCI/XCIgKyBxO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoIHR5cGVvZiBkYXRhW1wiaGFzaFwiXSAhPSBcInVuZGVmaW5lZFwiICkgciArPSBcIiNcIiArIGRhdGFbXCJoYXNoXCJdO1xuXHRcdFxuXHRcdHJldHVybiByIHx8IGRhdGFbXCJ1cmxcIl0gfHwgXCJcIjtcblx0fSxcbn07XG5cbmlmICggdHlwZW9mIGRlZmluZSAhPSBcInVuZGVmaW5lZFwiICYmIGRlZmluZVtcImFtZFwiXSApIGRlZmluZShzZWxmKTtcbmVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgKSBtb2R1bGVbJ2V4cG9ydHMnXSA9IHNlbGY7XG5lbHNlIHdpbmRvd1tcInVybFwiXSA9IHNlbGY7XG5cbn0oKTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3VybC5qcy91cmwuanNcbiAqKiBtb2R1bGUgaWQgPSAyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1vZHVsZSkge1xyXG5cdGlmKCFtb2R1bGUud2VicGFja1BvbHlmaWxsKSB7XHJcblx0XHRtb2R1bGUuZGVwcmVjYXRlID0gZnVuY3Rpb24oKSB7fTtcclxuXHRcdG1vZHVsZS5wYXRocyA9IFtdO1xyXG5cdFx0Ly8gbW9kdWxlLnBhcmVudCA9IHVuZGVmaW5lZCBieSBkZWZhdWx0XHJcblx0XHRtb2R1bGUuY2hpbGRyZW4gPSBbXTtcclxuXHRcdG1vZHVsZS53ZWJwYWNrUG9seWZpbGwgPSAxO1xyXG5cdH1cclxuXHRyZXR1cm4gbW9kdWxlO1xyXG59XHJcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogKHdlYnBhY2spL2J1aWxkaW4vbW9kdWxlLmpzXG4gKiogbW9kdWxlIGlkID0gM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwIDFcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkgeyB0aHJvdyBuZXcgRXJyb3IoXCJkZWZpbmUgY2Fubm90IGJlIHVzZWQgaW5kaXJlY3RcIik7IH07XHJcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogKHdlYnBhY2spL2J1aWxkaW4vYW1kLWRlZmluZS5qc1xuICoqIG1vZHVsZSBpZCA9IDRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMCAxXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==