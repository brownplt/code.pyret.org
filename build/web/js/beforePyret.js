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
/******/ 	var hotCurrentHash = "b492e84858c390432246"; // eslint-disable-line no-unused-vars
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

	"use strict";
	
	/* global $ jQuery CPO CodeMirror storageAPI Q createProgramCollectionAPI makeShareAPI */
	
	//var shareAPI = makeShareAPI(process.env.CURRENT_PYRET_RELEASE);
	var shareAPI = makeShareAPI(env_CURRENT_PYRET_RELEASE);
	
	var url = __webpack_require__(1);
	
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
	  /*
	  console.log('process.env is', JSON.stringify(process.env));
	  console.log('process.env.GOOGLE_CLIENT_ID is', process.env.GOOGLE_CLIENT_ID);
	  console.log('process.env.REDISCLOUD_URL is', process.env.REDISCLOUD_URL);
	  console.log('process.env.BASE_URL is', process.env.BASE_URL);
	  console.log('process.env.SESSION_SECRET is', process.env.SESSION_SECRET);
	  console.log('process.env.CURRENT_PYRET_RELEASE is', process.env.CURRENT_PYRET_RELEASE);
	  console.log('process.env.PYRET is', process.env.PYRET);
	  console.log('process.env.PYRET_RELEASE_BASE is', process.env.PYRET_RELEASE_BASE);
	  console.log('clientId is', clientId);
	  */
	  //console.log(process.env.PYRET);
	  //pyretLoad.src = process.env.PYRET;
	  console.log('env_PYRET is', env_PYRET);
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

/***/ },
/* 1 */
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
	
	if ( "function" != "undefined" && __webpack_require__(3)["amd"] ) !(__WEBPACK_AMD_DEFINE_FACTORY__ = (self), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	else if ( true ) module['exports'] = self;
	else window["url"] = self;
	
	}();
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ },
/* 2 */
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
/* 3 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYjQ5MmU4NDg1OGMzOTA0MzIyNDYiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dlYi9qcy9iZWZvcmVQeXJldC5qcyIsIndlYnBhY2s6Ly8vLi9+L3VybC5qcy91cmwuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL21vZHVsZS5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vYW1kLWRlZmluZS5qcyJdLCJuYW1lcyI6WyJzaGFyZUFQSSIsIm1ha2VTaGFyZUFQSSIsImVudl9DVVJSRU5UX1BZUkVUX1JFTEVBU0UiLCJ1cmwiLCJyZXF1aXJlIiwiTE9HIiwid2luZG93IiwiY3RfbG9nIiwiY29uc29sZSIsImxvZyIsImFwcGx5IiwiYXJndW1lbnRzIiwiY3RfZXJyb3IiLCJlcnJvciIsImluaXRpYWxQYXJhbXMiLCJwYXJzZSIsImRvY3VtZW50IiwibG9jYXRpb24iLCJocmVmIiwicGFyYW1zIiwiaGlnaGxpZ2h0TW9kZSIsImNsZWFyRmxhc2giLCIkIiwiZW1wdHkiLCJzdGlja0Vycm9yIiwibWVzc2FnZSIsIm1vcmUiLCJlcnIiLCJhZGRDbGFzcyIsInRleHQiLCJhdHRyIiwidG9vbHRpcCIsInByZXBlbmQiLCJmbGFzaEVycm9yIiwiZmFkZU91dCIsImZsYXNoTWVzc2FnZSIsIm1zZyIsInN0aWNrTWVzc2FnZSIsIm1rV2FybmluZ1VwcGVyIiwibWtXYXJuaW5nTG93ZXIiLCJiaW5kIiwiRG9jdW1lbnRzIiwiZG9jdW1lbnRzIiwiTWFwIiwicHJvdG90eXBlIiwiaGFzIiwibmFtZSIsImdldCIsInNldCIsImRvYyIsImxvZ2dlciIsImlzRGV0YWlsZWQiLCJ2YWx1ZSIsImdldFZhbHVlIiwiZGVsZXRlIiwiZm9yRWFjaCIsImYiLCJDUE8iLCJzYXZlIiwiYXV0b1NhdmUiLCJtZXJnZSIsIm9iaiIsImV4dGVuc2lvbiIsIm5ld29iaiIsIk9iamVjdCIsImtleXMiLCJrIiwiYW5pbWF0aW9uRGl2IiwiY2xvc2VBbmltYXRpb25JZk9wZW4iLCJkaWFsb2ciLCJtYWtlRWRpdG9yIiwiY29udGFpbmVyIiwib3B0aW9ucyIsImluaXRpYWwiLCJoYXNPd25Qcm9wZXJ0eSIsInRleHRhcmVhIiwialF1ZXJ5IiwidmFsIiwiYXBwZW5kIiwicnVuRnVuIiwiY29kZSIsInJlcGxPcHRpb25zIiwicnVuIiwiY20iLCJDTSIsInVzZUxpbmVOdW1iZXJzIiwic2ltcGxlRWRpdG9yIiwidXNlRm9sZGluZyIsImd1dHRlcnMiLCJyZWluZGVudEFsbExpbmVzIiwibGFzdCIsImxpbmVDb3VudCIsIm9wZXJhdGlvbiIsImkiLCJpbmRlbnRMaW5lIiwiY21PcHRpb25zIiwiZXh0cmFLZXlzIiwiaW5kZW50VW5pdCIsInRhYlNpemUiLCJ2aWV3cG9ydE1hcmdpbiIsIkluZmluaXR5IiwibGluZU51bWJlcnMiLCJtYXRjaEtleXdvcmRzIiwibWF0Y2hCcmFja2V0cyIsInN0eWxlU2VsZWN0ZWRUZXh0IiwiZm9sZEd1dHRlciIsImxpbmVXcmFwcGluZyIsImxvZ2dpbmciLCJDb2RlTWlycm9yIiwiZnJvbVRleHRBcmVhIiwiQ01ibG9ja3MiLCJDb2RlTWlycm9yQmxvY2tzIiwidW5kZWZpbmVkIiwid2lsbEluc2VydE5vZGUiLCJzb3VyY2VOb2RlVGV4dCIsInNvdXJjZU5vZGUiLCJkZXN0aW5hdGlvbiIsImxpbmUiLCJlZGl0b3IiLCJnZXRMaW5lIiwiY2giLCJtYXRjaCIsImxlbmd0aCIsImJsb2Nrc0VkaXRvciIsImNoYW5nZU1vZGUiLCJtb2RlIiwiYXN0Iiwic2V0QmxvY2tNb2RlIiwiZGlzcGxheSIsIndyYXBwZXIiLCJhcHBlbmRDaGlsZCIsInJlZnJlc2giLCJmb2N1cyIsIlJVTl9DT0RFIiwic3RvcmFnZUFQSSIsInRoZW4iLCJhcGkiLCJjb2xsZWN0aW9uIiwic2hvdyIsImhpZGUiLCJnZXRDb2xsZWN0aW9uTGluayIsImxpbmsiLCJmYWlsIiwiY2xpY2siLCJjcmVhdGVQcm9ncmFtQ29sbGVjdGlvbkFQSSIsInRvTG9hZCIsImdldEZpbGVCeUlkIiwibG9hZFByb2dyYW0iLCJwcm9ncmFtVG9TYXZlIiwiUSIsImZjYWxsIiwiY29weU9uU2F2ZSIsImluaXRpYWxQcm9ncmFtIiwicHJvZ3JhbUxvYWQiLCJwIiwic2hvd1NoYXJlQ29udGFpbmVyIiwiZ2V0U2hhcmVkRmlsZUJ5SWQiLCJzZXRUaXRsZSIsInByb2dOYW1lIiwidGl0bGUiLCJkb3dubG9hZEVsdCIsImNvbnRlbnRzIiwiZG93bmxvYWRCbG9iIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwiQmxvYiIsInR5cGUiLCJmaWxlbmFtZSIsImluZGV4T2YiLCJkb3dubG9hZCIsImdldE5hbWUiLCJnZXRDb250ZW50cyIsInByb2dyYW1Mb2FkZWQiLCJtYWtlU2hhcmVMaW5rIiwibmFtZU9yVW50aXRsZWQiLCJzYXZlZFByb2dyYW0iLCJyZW5hbWUiLCJuZXdQIiwiaGlzdG9yeSIsInB1c2hTdGF0ZSIsImdldFVuaXF1ZUlkIiwiaGFzaCIsInByb2dyYW1OYW1lIiwiY3JlYXRlRmlsZSIsIm1ha2VIb3Zlck1lbnUiLCJjb2RlQ29udGFpbmVyIiwicnVuQnV0dG9uIiwiaW5pdGlhbEdhcyIsInNldE9wdGlvbiIsImMiLCJnZXREb2MiLCJjbGVhckhpc3RvcnkiLCJzZXRWYWx1ZSIsInB5cmV0TG9hZCIsImNyZWF0ZUVsZW1lbnQiLCJlbnZfUFlSRVQiLCJzcmMiLCJib2R5Iiwib24iLCJmaW4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0EsbUVBQTJEO0FBQzNEO0FBQ0E7QUFDQTs7QUFFQSxvREFBNEM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0RBQTBDO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0EsYUFBSztBQUNM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QUFDQTtBQUNBOzs7Ozs7O0FDVEEsOEJBQTZCLG1EQUFtRCIsImZpbGUiOiJqcy9iZWZvcmVQeXJldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdHZhciBwYXJlbnRIb3RVcGRhdGVDYWxsYmFjayA9IHRoaXNbXCJ3ZWJwYWNrSG90VXBkYXRlXCJdO1xuIFx0dGhpc1tcIndlYnBhY2tIb3RVcGRhdGVcIl0gPSBcclxuIFx0ZnVuY3Rpb24gd2VicGFja0hvdFVwZGF0ZUNhbGxiYWNrKGNodW5rSWQsIG1vcmVNb2R1bGVzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHRob3RBZGRVcGRhdGVDaHVuayhjaHVua0lkLCBtb3JlTW9kdWxlcyk7XHJcbiBcdFx0aWYocGFyZW50SG90VXBkYXRlQ2FsbGJhY2spIHBhcmVudEhvdFVwZGF0ZUNhbGxiYWNrKGNodW5rSWQsIG1vcmVNb2R1bGVzKTtcclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90RG93bmxvYWRVcGRhdGVDaHVuayhjaHVua0lkKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHR2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXTtcclxuIFx0XHR2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcclxuIFx0XHRzY3JpcHQudHlwZSA9IFwidGV4dC9qYXZhc2NyaXB0XCI7XHJcbiBcdFx0c2NyaXB0LmNoYXJzZXQgPSBcInV0Zi04XCI7XHJcbiBcdFx0c2NyaXB0LnNyYyA9IF9fd2VicGFja19yZXF1aXJlX18ucCArIFwiXCIgKyBjaHVua0lkICsgXCIuXCIgKyBob3RDdXJyZW50SGFzaCArIFwiLmhvdC11cGRhdGUuanNcIjtcclxuIFx0XHRoZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdERvd25sb2FkTWFuaWZlc3QoY2FsbGJhY2spIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdGlmKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCA9PT0gXCJ1bmRlZmluZWRcIilcclxuIFx0XHRcdHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJObyBicm93c2VyIHN1cHBvcnRcIikpO1xyXG4gXHRcdHRyeSB7XHJcbiBcdFx0XHR2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gXHRcdFx0dmFyIHJlcXVlc3RQYXRoID0gX193ZWJwYWNrX3JlcXVpcmVfXy5wICsgXCJcIiArIGhvdEN1cnJlbnRIYXNoICsgXCIuaG90LXVwZGF0ZS5qc29uXCI7XHJcbiBcdFx0XHRyZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgcmVxdWVzdFBhdGgsIHRydWUpO1xyXG4gXHRcdFx0cmVxdWVzdC50aW1lb3V0ID0gMTAwMDA7XHJcbiBcdFx0XHRyZXF1ZXN0LnNlbmQobnVsbCk7XHJcbiBcdFx0fSBjYXRjaChlcnIpIHtcclxuIFx0XHRcdHJldHVybiBjYWxsYmFjayhlcnIpO1xyXG4gXHRcdH1cclxuIFx0XHRyZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gXHRcdFx0aWYocmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSByZXR1cm47XHJcbiBcdFx0XHRpZihyZXF1ZXN0LnN0YXR1cyA9PT0gMCkge1xyXG4gXHRcdFx0XHQvLyB0aW1lb3V0XHJcbiBcdFx0XHRcdGNhbGxiYWNrKG5ldyBFcnJvcihcIk1hbmlmZXN0IHJlcXVlc3QgdG8gXCIgKyByZXF1ZXN0UGF0aCArIFwiIHRpbWVkIG91dC5cIikpO1xyXG4gXHRcdFx0fSBlbHNlIGlmKHJlcXVlc3Quc3RhdHVzID09PSA0MDQpIHtcclxuIFx0XHRcdFx0Ly8gbm8gdXBkYXRlIGF2YWlsYWJsZVxyXG4gXHRcdFx0XHRjYWxsYmFjaygpO1xyXG4gXHRcdFx0fSBlbHNlIGlmKHJlcXVlc3Quc3RhdHVzICE9PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgIT09IDMwNCkge1xyXG4gXHRcdFx0XHQvLyBvdGhlciBmYWlsdXJlXHJcbiBcdFx0XHRcdGNhbGxiYWNrKG5ldyBFcnJvcihcIk1hbmlmZXN0IHJlcXVlc3QgdG8gXCIgKyByZXF1ZXN0UGF0aCArIFwiIGZhaWxlZC5cIikpO1xyXG4gXHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0Ly8gc3VjY2Vzc1xyXG4gXHRcdFx0XHR0cnkge1xyXG4gXHRcdFx0XHRcdHZhciB1cGRhdGUgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcclxuIFx0XHRcdFx0fSBjYXRjaChlKSB7XHJcbiBcdFx0XHRcdFx0Y2FsbGJhY2soZSk7XHJcbiBcdFx0XHRcdFx0cmV0dXJuO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGNhbGxiYWNrKG51bGwsIHVwZGF0ZSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fTtcclxuIFx0fVxyXG5cbiBcdFxyXG4gXHRcclxuIFx0Ly8gQ29waWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2Jsb2IvYmVmNDViMC9zcmMvc2hhcmVkL3V0aWxzL2NhbkRlZmluZVByb3BlcnR5LmpzXHJcbiBcdHZhciBjYW5EZWZpbmVQcm9wZXJ0eSA9IGZhbHNlO1xyXG4gXHR0cnkge1xyXG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgXCJ4XCIsIHtcclxuIFx0XHRcdGdldDogZnVuY3Rpb24oKSB7fVxyXG4gXHRcdH0pO1xyXG4gXHRcdGNhbkRlZmluZVByb3BlcnR5ID0gdHJ1ZTtcclxuIFx0fSBjYXRjaCh4KSB7XHJcbiBcdFx0Ly8gSUUgd2lsbCBmYWlsIG9uIGRlZmluZVByb3BlcnR5XHJcbiBcdH1cclxuIFx0XHJcbiBcdHZhciBob3RBcHBseU9uVXBkYXRlID0gdHJ1ZTtcclxuIFx0dmFyIGhvdEN1cnJlbnRIYXNoID0gXCJiNDkyZTg0ODU4YzM5MDQzMjI0NlwiOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdHZhciBob3RDdXJyZW50TW9kdWxlRGF0YSA9IHt9O1xyXG4gXHR2YXIgaG90Q3VycmVudFBhcmVudHMgPSBbXTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90Q3JlYXRlUmVxdWlyZShtb2R1bGVJZCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0dmFyIG1lID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0aWYoIW1lKSByZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXztcclxuIFx0XHR2YXIgZm4gPSBmdW5jdGlvbihyZXF1ZXN0KSB7XHJcbiBcdFx0XHRpZihtZS5ob3QuYWN0aXZlKSB7XHJcbiBcdFx0XHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbcmVxdWVzdF0pIHtcclxuIFx0XHRcdFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW3JlcXVlc3RdLnBhcmVudHMuaW5kZXhPZihtb2R1bGVJZCkgPCAwKVxyXG4gXHRcdFx0XHRcdFx0aW5zdGFsbGVkTW9kdWxlc1tyZXF1ZXN0XS5wYXJlbnRzLnB1c2gobW9kdWxlSWQpO1xyXG4gXHRcdFx0XHRcdGlmKG1lLmNoaWxkcmVuLmluZGV4T2YocmVxdWVzdCkgPCAwKVxyXG4gXHRcdFx0XHRcdFx0bWUuY2hpbGRyZW4ucHVzaChyZXF1ZXN0KTtcclxuIFx0XHRcdFx0fSBlbHNlIGhvdEN1cnJlbnRQYXJlbnRzID0gW21vZHVsZUlkXTtcclxuIFx0XHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRcdGNvbnNvbGUud2FybihcIltITVJdIHVuZXhwZWN0ZWQgcmVxdWlyZShcIiArIHJlcXVlc3QgKyBcIikgZnJvbSBkaXNwb3NlZCBtb2R1bGUgXCIgKyBtb2R1bGVJZCk7XHJcbiBcdFx0XHRcdGhvdEN1cnJlbnRQYXJlbnRzID0gW107XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhyZXF1ZXN0KTtcclxuIFx0XHR9O1xyXG4gXHRcdGZvcih2YXIgbmFtZSBpbiBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoX193ZWJwYWNrX3JlcXVpcmVfXywgbmFtZSkpIHtcclxuIFx0XHRcdFx0aWYoY2FuRGVmaW5lUHJvcGVydHkpIHtcclxuIFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIG5hbWUsIChmdW5jdGlvbihuYW1lKSB7XHJcbiBcdFx0XHRcdFx0XHRyZXR1cm4ge1xyXG4gXHRcdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXHJcbiBcdFx0XHRcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXHJcbiBcdFx0XHRcdFx0XHRcdGdldDogZnVuY3Rpb24oKSB7XHJcbiBcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX19bbmFtZV07XHJcbiBcdFx0XHRcdFx0XHRcdH0sXHJcbiBcdFx0XHRcdFx0XHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcclxuIFx0XHRcdFx0XHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fW25hbWVdID0gdmFsdWU7XHJcbiBcdFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRcdH07XHJcbiBcdFx0XHRcdFx0fShuYW1lKSkpO1xyXG4gXHRcdFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0XHRcdGZuW25hbWVdID0gX193ZWJwYWNrX3JlcXVpcmVfX1tuYW1lXTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0ZnVuY3Rpb24gZW5zdXJlKGNodW5rSWQsIGNhbGxiYWNrKSB7XHJcbiBcdFx0XHRpZihob3RTdGF0dXMgPT09IFwicmVhZHlcIilcclxuIFx0XHRcdFx0aG90U2V0U3RhdHVzKFwicHJlcGFyZVwiKTtcclxuIFx0XHRcdGhvdENodW5rc0xvYWRpbmcrKztcclxuIFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18uZShjaHVua0lkLCBmdW5jdGlvbigpIHtcclxuIFx0XHRcdFx0dHJ5IHtcclxuIFx0XHRcdFx0XHRjYWxsYmFjay5jYWxsKG51bGwsIGZuKTtcclxuIFx0XHRcdFx0fSBmaW5hbGx5IHtcclxuIFx0XHRcdFx0XHRmaW5pc2hDaHVua0xvYWRpbmcoKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcclxuIFx0XHRcdFx0ZnVuY3Rpb24gZmluaXNoQ2h1bmtMb2FkaW5nKCkge1xyXG4gXHRcdFx0XHRcdGhvdENodW5rc0xvYWRpbmctLTtcclxuIFx0XHRcdFx0XHRpZihob3RTdGF0dXMgPT09IFwicHJlcGFyZVwiKSB7XHJcbiBcdFx0XHRcdFx0XHRpZighaG90V2FpdGluZ0ZpbGVzTWFwW2NodW5rSWRdKSB7XHJcbiBcdFx0XHRcdFx0XHRcdGhvdEVuc3VyZVVwZGF0ZUNodW5rKGNodW5rSWQpO1xyXG4gXHRcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdFx0aWYoaG90Q2h1bmtzTG9hZGluZyA9PT0gMCAmJiBob3RXYWl0aW5nRmlsZXMgPT09IDApIHtcclxuIFx0XHRcdFx0XHRcdFx0aG90VXBkYXRlRG93bmxvYWRlZCgpO1xyXG4gXHRcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fSk7XHJcbiBcdFx0fVxyXG4gXHRcdGlmKGNhbkRlZmluZVByb3BlcnR5KSB7XHJcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIFwiZVwiLCB7XHJcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXHJcbiBcdFx0XHRcdHZhbHVlOiBlbnN1cmVcclxuIFx0XHRcdH0pO1xyXG4gXHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRmbi5lID0gZW5zdXJlO1xyXG4gXHRcdH1cclxuIFx0XHRyZXR1cm4gZm47XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdENyZWF0ZU1vZHVsZShtb2R1bGVJZCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0dmFyIGhvdCA9IHtcclxuIFx0XHRcdC8vIHByaXZhdGUgc3R1ZmZcclxuIFx0XHRcdF9hY2NlcHRlZERlcGVuZGVuY2llczoge30sXHJcbiBcdFx0XHRfZGVjbGluZWREZXBlbmRlbmNpZXM6IHt9LFxyXG4gXHRcdFx0X3NlbGZBY2NlcHRlZDogZmFsc2UsXHJcbiBcdFx0XHRfc2VsZkRlY2xpbmVkOiBmYWxzZSxcclxuIFx0XHRcdF9kaXNwb3NlSGFuZGxlcnM6IFtdLFxyXG4gXHRcclxuIFx0XHRcdC8vIE1vZHVsZSBBUElcclxuIFx0XHRcdGFjdGl2ZTogdHJ1ZSxcclxuIFx0XHRcdGFjY2VwdDogZnVuY3Rpb24oZGVwLCBjYWxsYmFjaykge1xyXG4gXHRcdFx0XHRpZih0eXBlb2YgZGVwID09PSBcInVuZGVmaW5lZFwiKVxyXG4gXHRcdFx0XHRcdGhvdC5fc2VsZkFjY2VwdGVkID0gdHJ1ZTtcclxuIFx0XHRcdFx0ZWxzZSBpZih0eXBlb2YgZGVwID09PSBcImZ1bmN0aW9uXCIpXHJcbiBcdFx0XHRcdFx0aG90Ll9zZWxmQWNjZXB0ZWQgPSBkZXA7XHJcbiBcdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIilcclxuIFx0XHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgZGVwLmxlbmd0aDsgaSsrKVxyXG4gXHRcdFx0XHRcdFx0aG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1tkZXBbaV1dID0gY2FsbGJhY2s7XHJcbiBcdFx0XHRcdGVsc2VcclxuIFx0XHRcdFx0XHRob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcF0gPSBjYWxsYmFjaztcclxuIFx0XHRcdH0sXHJcbiBcdFx0XHRkZWNsaW5lOiBmdW5jdGlvbihkZXApIHtcclxuIFx0XHRcdFx0aWYodHlwZW9mIGRlcCA9PT0gXCJ1bmRlZmluZWRcIilcclxuIFx0XHRcdFx0XHRob3QuX3NlbGZEZWNsaW5lZCA9IHRydWU7XHJcbiBcdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRlcCA9PT0gXCJudW1iZXJcIilcclxuIFx0XHRcdFx0XHRob3QuX2RlY2xpbmVkRGVwZW5kZW5jaWVzW2RlcF0gPSB0cnVlO1xyXG4gXHRcdFx0XHRlbHNlXHJcbiBcdFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGRlcC5sZW5ndGg7IGkrKylcclxuIFx0XHRcdFx0XHRcdGhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbZGVwW2ldXSA9IHRydWU7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0ZGlzcG9zZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuIFx0XHRcdFx0aG90Ll9kaXNwb3NlSGFuZGxlcnMucHVzaChjYWxsYmFjayk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0YWRkRGlzcG9zZUhhbmRsZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiBcdFx0XHRcdGhvdC5fZGlzcG9zZUhhbmRsZXJzLnB1c2goY2FsbGJhY2spO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdHJlbW92ZURpc3Bvc2VIYW5kbGVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gXHRcdFx0XHR2YXIgaWR4ID0gaG90Ll9kaXNwb3NlSGFuZGxlcnMuaW5kZXhPZihjYWxsYmFjayk7XHJcbiBcdFx0XHRcdGlmKGlkeCA+PSAwKSBob3QuX2Rpc3Bvc2VIYW5kbGVycy5zcGxpY2UoaWR4LCAxKTtcclxuIFx0XHRcdH0sXHJcbiBcdFxyXG4gXHRcdFx0Ly8gTWFuYWdlbWVudCBBUElcclxuIFx0XHRcdGNoZWNrOiBob3RDaGVjayxcclxuIFx0XHRcdGFwcGx5OiBob3RBcHBseSxcclxuIFx0XHRcdHN0YXR1czogZnVuY3Rpb24obCkge1xyXG4gXHRcdFx0XHRpZighbCkgcmV0dXJuIGhvdFN0YXR1cztcclxuIFx0XHRcdFx0aG90U3RhdHVzSGFuZGxlcnMucHVzaChsKTtcclxuIFx0XHRcdH0sXHJcbiBcdFx0XHRhZGRTdGF0dXNIYW5kbGVyOiBmdW5jdGlvbihsKSB7XHJcbiBcdFx0XHRcdGhvdFN0YXR1c0hhbmRsZXJzLnB1c2gobCk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0cmVtb3ZlU3RhdHVzSGFuZGxlcjogZnVuY3Rpb24obCkge1xyXG4gXHRcdFx0XHR2YXIgaWR4ID0gaG90U3RhdHVzSGFuZGxlcnMuaW5kZXhPZihsKTtcclxuIFx0XHRcdFx0aWYoaWR4ID49IDApIGhvdFN0YXR1c0hhbmRsZXJzLnNwbGljZShpZHgsIDEpO1xyXG4gXHRcdFx0fSxcclxuIFx0XHJcbiBcdFx0XHQvL2luaGVyaXQgZnJvbSBwcmV2aW91cyBkaXNwb3NlIGNhbGxcclxuIFx0XHRcdGRhdGE6IGhvdEN1cnJlbnRNb2R1bGVEYXRhW21vZHVsZUlkXVxyXG4gXHRcdH07XHJcbiBcdFx0cmV0dXJuIGhvdDtcclxuIFx0fVxyXG4gXHRcclxuIFx0dmFyIGhvdFN0YXR1c0hhbmRsZXJzID0gW107XHJcbiBcdHZhciBob3RTdGF0dXMgPSBcImlkbGVcIjtcclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdFNldFN0YXR1cyhuZXdTdGF0dXMpIHtcclxuIFx0XHRob3RTdGF0dXMgPSBuZXdTdGF0dXM7XHJcbiBcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGhvdFN0YXR1c0hhbmRsZXJzLmxlbmd0aDsgaSsrKVxyXG4gXHRcdFx0aG90U3RhdHVzSGFuZGxlcnNbaV0uY2FsbChudWxsLCBuZXdTdGF0dXMpO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHQvLyB3aGlsZSBkb3dubG9hZGluZ1xyXG4gXHR2YXIgaG90V2FpdGluZ0ZpbGVzID0gMDtcclxuIFx0dmFyIGhvdENodW5rc0xvYWRpbmcgPSAwO1xyXG4gXHR2YXIgaG90V2FpdGluZ0ZpbGVzTWFwID0ge307XHJcbiBcdHZhciBob3RSZXF1ZXN0ZWRGaWxlc01hcCA9IHt9O1xyXG4gXHR2YXIgaG90QXZhaWxpYmxlRmlsZXNNYXAgPSB7fTtcclxuIFx0dmFyIGhvdENhbGxiYWNrO1xyXG4gXHRcclxuIFx0Ly8gVGhlIHVwZGF0ZSBpbmZvXHJcbiBcdHZhciBob3RVcGRhdGUsIGhvdFVwZGF0ZU5ld0hhc2g7XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiB0b01vZHVsZUlkKGlkKSB7XHJcbiBcdFx0dmFyIGlzTnVtYmVyID0gKCtpZCkgKyBcIlwiID09PSBpZDtcclxuIFx0XHRyZXR1cm4gaXNOdW1iZXIgPyAraWQgOiBpZDtcclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90Q2hlY2soYXBwbHksIGNhbGxiYWNrKSB7XHJcbiBcdFx0aWYoaG90U3RhdHVzICE9PSBcImlkbGVcIikgdGhyb3cgbmV3IEVycm9yKFwiY2hlY2soKSBpcyBvbmx5IGFsbG93ZWQgaW4gaWRsZSBzdGF0dXNcIik7XHJcbiBcdFx0aWYodHlwZW9mIGFwcGx5ID09PSBcImZ1bmN0aW9uXCIpIHtcclxuIFx0XHRcdGhvdEFwcGx5T25VcGRhdGUgPSBmYWxzZTtcclxuIFx0XHRcdGNhbGxiYWNrID0gYXBwbHk7XHJcbiBcdFx0fSBlbHNlIHtcclxuIFx0XHRcdGhvdEFwcGx5T25VcGRhdGUgPSBhcHBseTtcclxuIFx0XHRcdGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oZXJyKSB7XHJcbiBcdFx0XHRcdGlmKGVycikgdGhyb3cgZXJyO1xyXG4gXHRcdFx0fTtcclxuIFx0XHR9XHJcbiBcdFx0aG90U2V0U3RhdHVzKFwiY2hlY2tcIik7XHJcbiBcdFx0aG90RG93bmxvYWRNYW5pZmVzdChmdW5jdGlvbihlcnIsIHVwZGF0ZSkge1xyXG4gXHRcdFx0aWYoZXJyKSByZXR1cm4gY2FsbGJhY2soZXJyKTtcclxuIFx0XHRcdGlmKCF1cGRhdGUpIHtcclxuIFx0XHRcdFx0aG90U2V0U3RhdHVzKFwiaWRsZVwiKTtcclxuIFx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgbnVsbCk7XHJcbiBcdFx0XHRcdHJldHVybjtcclxuIFx0XHRcdH1cclxuIFx0XHJcbiBcdFx0XHRob3RSZXF1ZXN0ZWRGaWxlc01hcCA9IHt9O1xyXG4gXHRcdFx0aG90QXZhaWxpYmxlRmlsZXNNYXAgPSB7fTtcclxuIFx0XHRcdGhvdFdhaXRpbmdGaWxlc01hcCA9IHt9O1xyXG4gXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IHVwZGF0ZS5jLmxlbmd0aDsgaSsrKVxyXG4gXHRcdFx0XHRob3RBdmFpbGlibGVGaWxlc01hcFt1cGRhdGUuY1tpXV0gPSB0cnVlO1xyXG4gXHRcdFx0aG90VXBkYXRlTmV3SGFzaCA9IHVwZGF0ZS5oO1xyXG4gXHRcclxuIFx0XHRcdGhvdFNldFN0YXR1cyhcInByZXBhcmVcIik7XHJcbiBcdFx0XHRob3RDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gXHRcdFx0aG90VXBkYXRlID0ge307XHJcbiBcdFx0XHR2YXIgY2h1bmtJZCA9IDA7XHJcbiBcdFx0XHR7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbG9uZS1ibG9ja3NcclxuIFx0XHRcdFx0LypnbG9iYWxzIGNodW5rSWQgKi9cclxuIFx0XHRcdFx0aG90RW5zdXJlVXBkYXRlQ2h1bmsoY2h1bmtJZCk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRpZihob3RTdGF0dXMgPT09IFwicHJlcGFyZVwiICYmIGhvdENodW5rc0xvYWRpbmcgPT09IDAgJiYgaG90V2FpdGluZ0ZpbGVzID09PSAwKSB7XHJcbiBcdFx0XHRcdGhvdFVwZGF0ZURvd25sb2FkZWQoKTtcclxuIFx0XHRcdH1cclxuIFx0XHR9KTtcclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90QWRkVXBkYXRlQ2h1bmsoY2h1bmtJZCwgbW9yZU1vZHVsZXMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdGlmKCFob3RBdmFpbGlibGVGaWxlc01hcFtjaHVua0lkXSB8fCAhaG90UmVxdWVzdGVkRmlsZXNNYXBbY2h1bmtJZF0pXHJcbiBcdFx0XHRyZXR1cm47XHJcbiBcdFx0aG90UmVxdWVzdGVkRmlsZXNNYXBbY2h1bmtJZF0gPSBmYWxzZTtcclxuIFx0XHRmb3IodmFyIG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHRob3RVcGRhdGVbbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHRpZigtLWhvdFdhaXRpbmdGaWxlcyA9PT0gMCAmJiBob3RDaHVua3NMb2FkaW5nID09PSAwKSB7XHJcbiBcdFx0XHRob3RVcGRhdGVEb3dubG9hZGVkKCk7XHJcbiBcdFx0fVxyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RFbnN1cmVVcGRhdGVDaHVuayhjaHVua0lkKSB7XHJcbiBcdFx0aWYoIWhvdEF2YWlsaWJsZUZpbGVzTWFwW2NodW5rSWRdKSB7XHJcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXNNYXBbY2h1bmtJZF0gPSB0cnVlO1xyXG4gXHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRob3RSZXF1ZXN0ZWRGaWxlc01hcFtjaHVua0lkXSA9IHRydWU7XHJcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXMrKztcclxuIFx0XHRcdGhvdERvd25sb2FkVXBkYXRlQ2h1bmsoY2h1bmtJZCk7XHJcbiBcdFx0fVxyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RVcGRhdGVEb3dubG9hZGVkKCkge1xyXG4gXHRcdGhvdFNldFN0YXR1cyhcInJlYWR5XCIpO1xyXG4gXHRcdHZhciBjYWxsYmFjayA9IGhvdENhbGxiYWNrO1xyXG4gXHRcdGhvdENhbGxiYWNrID0gbnVsbDtcclxuIFx0XHRpZighY2FsbGJhY2spIHJldHVybjtcclxuIFx0XHRpZihob3RBcHBseU9uVXBkYXRlKSB7XHJcbiBcdFx0XHRob3RBcHBseShob3RBcHBseU9uVXBkYXRlLCBjYWxsYmFjayk7XHJcbiBcdFx0fSBlbHNlIHtcclxuIFx0XHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbXTtcclxuIFx0XHRcdGZvcih2YXIgaWQgaW4gaG90VXBkYXRlKSB7XHJcbiBcdFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChob3RVcGRhdGUsIGlkKSkge1xyXG4gXHRcdFx0XHRcdG91dGRhdGVkTW9kdWxlcy5wdXNoKHRvTW9kdWxlSWQoaWQpKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdFx0Y2FsbGJhY2sobnVsbCwgb3V0ZGF0ZWRNb2R1bGVzKTtcclxuIFx0XHR9XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdEFwcGx5KG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiBcdFx0aWYoaG90U3RhdHVzICE9PSBcInJlYWR5XCIpIHRocm93IG5ldyBFcnJvcihcImFwcGx5KCkgaXMgb25seSBhbGxvd2VkIGluIHJlYWR5IHN0YXR1c1wiKTtcclxuIFx0XHRpZih0eXBlb2Ygb3B0aW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiBcdFx0XHRjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiBcdFx0XHRvcHRpb25zID0ge307XHJcbiBcdFx0fSBlbHNlIGlmKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMgPT09IFwib2JqZWN0XCIpIHtcclxuIFx0XHRcdGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oZXJyKSB7XHJcbiBcdFx0XHRcdGlmKGVycikgdGhyb3cgZXJyO1xyXG4gXHRcdFx0fTtcclxuIFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0b3B0aW9ucyA9IHt9O1xyXG4gXHRcdFx0Y2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbihlcnIpIHtcclxuIFx0XHRcdFx0aWYoZXJyKSB0aHJvdyBlcnI7XHJcbiBcdFx0XHR9O1xyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0ZnVuY3Rpb24gZ2V0QWZmZWN0ZWRTdHVmZihtb2R1bGUpIHtcclxuIFx0XHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbbW9kdWxlXTtcclxuIFx0XHRcdHZhciBvdXRkYXRlZERlcGVuZGVuY2llcyA9IHt9O1xyXG4gXHRcclxuIFx0XHRcdHZhciBxdWV1ZSA9IG91dGRhdGVkTW9kdWxlcy5zbGljZSgpO1xyXG4gXHRcdFx0d2hpbGUocXVldWUubGVuZ3RoID4gMCkge1xyXG4gXHRcdFx0XHR2YXIgbW9kdWxlSWQgPSBxdWV1ZS5wb3AoKTtcclxuIFx0XHRcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0XHRpZighbW9kdWxlIHx8IG1vZHVsZS5ob3QuX3NlbGZBY2NlcHRlZClcclxuIFx0XHRcdFx0XHRjb250aW51ZTtcclxuIFx0XHRcdFx0aWYobW9kdWxlLmhvdC5fc2VsZkRlY2xpbmVkKSB7XHJcbiBcdFx0XHRcdFx0cmV0dXJuIG5ldyBFcnJvcihcIkFib3J0ZWQgYmVjYXVzZSBvZiBzZWxmIGRlY2xpbmU6IFwiICsgbW9kdWxlSWQpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGlmKG1vZHVsZUlkID09PSAwKSB7XHJcbiBcdFx0XHRcdFx0cmV0dXJuO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtb2R1bGUucGFyZW50cy5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0XHRcdHZhciBwYXJlbnRJZCA9IG1vZHVsZS5wYXJlbnRzW2ldO1xyXG4gXHRcdFx0XHRcdHZhciBwYXJlbnQgPSBpbnN0YWxsZWRNb2R1bGVzW3BhcmVudElkXTtcclxuIFx0XHRcdFx0XHRpZihwYXJlbnQuaG90Ll9kZWNsaW5lZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pIHtcclxuIFx0XHRcdFx0XHRcdHJldHVybiBuZXcgRXJyb3IoXCJBYm9ydGVkIGJlY2F1c2Ugb2YgZGVjbGluZWQgZGVwZW5kZW5jeTogXCIgKyBtb2R1bGVJZCArIFwiIGluIFwiICsgcGFyZW50SWQpO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRpZihvdXRkYXRlZE1vZHVsZXMuaW5kZXhPZihwYXJlbnRJZCkgPj0gMCkgY29udGludWU7XHJcbiBcdFx0XHRcdFx0aWYocGFyZW50LmhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdKSB7XHJcbiBcdFx0XHRcdFx0XHRpZighb3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdKVxyXG4gXHRcdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF0gPSBbXTtcclxuIFx0XHRcdFx0XHRcdGFkZEFsbFRvU2V0KG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSwgW21vZHVsZUlkXSk7XHJcbiBcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0ZGVsZXRlIG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXTtcclxuIFx0XHRcdFx0XHRvdXRkYXRlZE1vZHVsZXMucHVzaChwYXJlbnRJZCk7XHJcbiBcdFx0XHRcdFx0cXVldWUucHVzaChwYXJlbnRJZCk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHJcbiBcdFx0XHRyZXR1cm4gW291dGRhdGVkTW9kdWxlcywgb3V0ZGF0ZWREZXBlbmRlbmNpZXNdO1xyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0ZnVuY3Rpb24gYWRkQWxsVG9TZXQoYSwgYikge1xyXG4gXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdFx0dmFyIGl0ZW0gPSBiW2ldO1xyXG4gXHRcdFx0XHRpZihhLmluZGV4T2YoaXRlbSkgPCAwKVxyXG4gXHRcdFx0XHRcdGEucHVzaChpdGVtKTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIGF0IGJlZ2luIGFsbCB1cGRhdGVzIG1vZHVsZXMgYXJlIG91dGRhdGVkXHJcbiBcdFx0Ly8gdGhlIFwib3V0ZGF0ZWRcIiBzdGF0dXMgY2FuIHByb3BhZ2F0ZSB0byBwYXJlbnRzIGlmIHRoZXkgZG9uJ3QgYWNjZXB0IHRoZSBjaGlsZHJlblxyXG4gXHRcdHZhciBvdXRkYXRlZERlcGVuZGVuY2llcyA9IHt9O1xyXG4gXHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbXTtcclxuIFx0XHR2YXIgYXBwbGllZFVwZGF0ZSA9IHt9O1xyXG4gXHRcdGZvcih2YXIgaWQgaW4gaG90VXBkYXRlKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaG90VXBkYXRlLCBpZCkpIHtcclxuIFx0XHRcdFx0dmFyIG1vZHVsZUlkID0gdG9Nb2R1bGVJZChpZCk7XHJcbiBcdFx0XHRcdHZhciByZXN1bHQgPSBnZXRBZmZlY3RlZFN0dWZmKG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0aWYoIXJlc3VsdCkge1xyXG4gXHRcdFx0XHRcdGlmKG9wdGlvbnMuaWdub3JlVW5hY2NlcHRlZClcclxuIFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRcdGhvdFNldFN0YXR1cyhcImFib3J0XCIpO1xyXG4gXHRcdFx0XHRcdHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJBYm9ydGVkIGJlY2F1c2UgXCIgKyBtb2R1bGVJZCArIFwiIGlzIG5vdCBhY2NlcHRlZFwiKSk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0aWYocmVzdWx0IGluc3RhbmNlb2YgRXJyb3IpIHtcclxuIFx0XHRcdFx0XHRob3RTZXRTdGF0dXMoXCJhYm9ydFwiKTtcclxuIFx0XHRcdFx0XHRyZXR1cm4gY2FsbGJhY2socmVzdWx0KTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRhcHBsaWVkVXBkYXRlW21vZHVsZUlkXSA9IGhvdFVwZGF0ZVttb2R1bGVJZF07XHJcbiBcdFx0XHRcdGFkZEFsbFRvU2V0KG91dGRhdGVkTW9kdWxlcywgcmVzdWx0WzBdKTtcclxuIFx0XHRcdFx0Zm9yKHZhciBtb2R1bGVJZCBpbiByZXN1bHRbMV0pIHtcclxuIFx0XHRcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmVzdWx0WzFdLCBtb2R1bGVJZCkpIHtcclxuIFx0XHRcdFx0XHRcdGlmKCFvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pXHJcbiBcdFx0XHRcdFx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSA9IFtdO1xyXG4gXHRcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdLCByZXN1bHRbMV1bbW9kdWxlSWRdKTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIFN0b3JlIHNlbGYgYWNjZXB0ZWQgb3V0ZGF0ZWQgbW9kdWxlcyB0byByZXF1aXJlIHRoZW0gbGF0ZXIgYnkgdGhlIG1vZHVsZSBzeXN0ZW1cclxuIFx0XHR2YXIgb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzID0gW107XHJcbiBcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG91dGRhdGVkTW9kdWxlcy5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0dmFyIG1vZHVsZUlkID0gb3V0ZGF0ZWRNb2R1bGVzW2ldO1xyXG4gXHRcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gJiYgaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uaG90Ll9zZWxmQWNjZXB0ZWQpXHJcbiBcdFx0XHRcdG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlcy5wdXNoKHtcclxuIFx0XHRcdFx0XHRtb2R1bGU6IG1vZHVsZUlkLFxyXG4gXHRcdFx0XHRcdGVycm9ySGFuZGxlcjogaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uaG90Ll9zZWxmQWNjZXB0ZWRcclxuIFx0XHRcdFx0fSk7XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBOb3cgaW4gXCJkaXNwb3NlXCIgcGhhc2VcclxuIFx0XHRob3RTZXRTdGF0dXMoXCJkaXNwb3NlXCIpO1xyXG4gXHRcdHZhciBxdWV1ZSA9IG91dGRhdGVkTW9kdWxlcy5zbGljZSgpO1xyXG4gXHRcdHdoaWxlKHF1ZXVlLmxlbmd0aCA+IDApIHtcclxuIFx0XHRcdHZhciBtb2R1bGVJZCA9IHF1ZXVlLnBvcCgpO1xyXG4gXHRcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0aWYoIW1vZHVsZSkgY29udGludWU7XHJcbiBcdFxyXG4gXHRcdFx0dmFyIGRhdGEgPSB7fTtcclxuIFx0XHJcbiBcdFx0XHQvLyBDYWxsIGRpc3Bvc2UgaGFuZGxlcnNcclxuIFx0XHRcdHZhciBkaXNwb3NlSGFuZGxlcnMgPSBtb2R1bGUuaG90Ll9kaXNwb3NlSGFuZGxlcnM7XHJcbiBcdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZGlzcG9zZUhhbmRsZXJzLmxlbmd0aDsgaisrKSB7XHJcbiBcdFx0XHRcdHZhciBjYiA9IGRpc3Bvc2VIYW5kbGVyc1tqXTtcclxuIFx0XHRcdFx0Y2IoZGF0YSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRob3RDdXJyZW50TW9kdWxlRGF0YVttb2R1bGVJZF0gPSBkYXRhO1xyXG4gXHRcclxuIFx0XHRcdC8vIGRpc2FibGUgbW9kdWxlICh0aGlzIGRpc2FibGVzIHJlcXVpcmVzIGZyb20gdGhpcyBtb2R1bGUpXHJcbiBcdFx0XHRtb2R1bGUuaG90LmFjdGl2ZSA9IGZhbHNlO1xyXG4gXHRcclxuIFx0XHRcdC8vIHJlbW92ZSBtb2R1bGUgZnJvbSBjYWNoZVxyXG4gXHRcdFx0ZGVsZXRlIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcclxuIFx0XHRcdC8vIHJlbW92ZSBcInBhcmVudHNcIiByZWZlcmVuY2VzIGZyb20gYWxsIGNoaWxkcmVuXHJcbiBcdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgbW9kdWxlLmNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XHJcbiBcdFx0XHRcdHZhciBjaGlsZCA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlLmNoaWxkcmVuW2pdXTtcclxuIFx0XHRcdFx0aWYoIWNoaWxkKSBjb250aW51ZTtcclxuIFx0XHRcdFx0dmFyIGlkeCA9IGNoaWxkLnBhcmVudHMuaW5kZXhPZihtb2R1bGVJZCk7XHJcbiBcdFx0XHRcdGlmKGlkeCA+PSAwKSB7XHJcbiBcdFx0XHRcdFx0Y2hpbGQucGFyZW50cy5zcGxpY2UoaWR4LCAxKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gcmVtb3ZlIG91dGRhdGVkIGRlcGVuZGVuY3kgZnJvbSBtb2R1bGUgY2hpbGRyZW5cclxuIFx0XHRmb3IodmFyIG1vZHVsZUlkIGluIG91dGRhdGVkRGVwZW5kZW5jaWVzKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob3V0ZGF0ZWREZXBlbmRlbmNpZXMsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRcdHZhciBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcyA9IG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzLmxlbmd0aDsgaisrKSB7XHJcbiBcdFx0XHRcdFx0dmFyIGRlcGVuZGVuY3kgPSBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llc1tqXTtcclxuIFx0XHRcdFx0XHR2YXIgaWR4ID0gbW9kdWxlLmNoaWxkcmVuLmluZGV4T2YoZGVwZW5kZW5jeSk7XHJcbiBcdFx0XHRcdFx0aWYoaWR4ID49IDApIG1vZHVsZS5jaGlsZHJlbi5zcGxpY2UoaWR4LCAxKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gTm90IGluIFwiYXBwbHlcIiBwaGFzZVxyXG4gXHRcdGhvdFNldFN0YXR1cyhcImFwcGx5XCIpO1xyXG4gXHRcclxuIFx0XHRob3RDdXJyZW50SGFzaCA9IGhvdFVwZGF0ZU5ld0hhc2g7XHJcbiBcdFxyXG4gXHRcdC8vIGluc2VydCBuZXcgY29kZVxyXG4gXHRcdGZvcih2YXIgbW9kdWxlSWQgaW4gYXBwbGllZFVwZGF0ZSkge1xyXG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGFwcGxpZWRVcGRhdGUsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHRtb2R1bGVzW21vZHVsZUlkXSA9IGFwcGxpZWRVcGRhdGVbbW9kdWxlSWRdO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gY2FsbCBhY2NlcHQgaGFuZGxlcnNcclxuIFx0XHR2YXIgZXJyb3IgPSBudWxsO1xyXG4gXHRcdGZvcih2YXIgbW9kdWxlSWQgaW4gb3V0ZGF0ZWREZXBlbmRlbmNpZXMpIHtcclxuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvdXRkYXRlZERlcGVuZGVuY2llcywgbW9kdWxlSWQpKSB7XHJcbiBcdFx0XHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0dmFyIG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzID0gb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0XHR2YXIgY2FsbGJhY2tzID0gW107XHJcbiBcdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcy5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0XHRcdHZhciBkZXBlbmRlbmN5ID0gbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXNbaV07XHJcbiBcdFx0XHRcdFx0dmFyIGNiID0gbW9kdWxlLmhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbZGVwZW5kZW5jeV07XHJcbiBcdFx0XHRcdFx0aWYoY2FsbGJhY2tzLmluZGV4T2YoY2IpID49IDApIGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRcdGNhbGxiYWNrcy5wdXNoKGNiKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHRcdFx0dmFyIGNiID0gY2FsbGJhY2tzW2ldO1xyXG4gXHRcdFx0XHRcdHRyeSB7XHJcbiBcdFx0XHRcdFx0XHRjYihvdXRkYXRlZERlcGVuZGVuY2llcyk7XHJcbiBcdFx0XHRcdFx0fSBjYXRjaChlcnIpIHtcclxuIFx0XHRcdFx0XHRcdGlmKCFlcnJvcilcclxuIFx0XHRcdFx0XHRcdFx0ZXJyb3IgPSBlcnI7XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBMb2FkIHNlbGYgYWNjZXB0ZWQgbW9kdWxlc1xyXG4gXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdHZhciBpdGVtID0gb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzW2ldO1xyXG4gXHRcdFx0dmFyIG1vZHVsZUlkID0gaXRlbS5tb2R1bGU7XHJcbiBcdFx0XHRob3RDdXJyZW50UGFyZW50cyA9IFttb2R1bGVJZF07XHJcbiBcdFx0XHR0cnkge1xyXG4gXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKTtcclxuIFx0XHRcdH0gY2F0Y2goZXJyKSB7XHJcbiBcdFx0XHRcdGlmKHR5cGVvZiBpdGVtLmVycm9ySGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiBcdFx0XHRcdFx0dHJ5IHtcclxuIFx0XHRcdFx0XHRcdGl0ZW0uZXJyb3JIYW5kbGVyKGVycik7XHJcbiBcdFx0XHRcdFx0fSBjYXRjaChlcnIpIHtcclxuIFx0XHRcdFx0XHRcdGlmKCFlcnJvcilcclxuIFx0XHRcdFx0XHRcdFx0ZXJyb3IgPSBlcnI7XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHR9IGVsc2UgaWYoIWVycm9yKVxyXG4gXHRcdFx0XHRcdGVycm9yID0gZXJyO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gaGFuZGxlIGVycm9ycyBpbiBhY2NlcHQgaGFuZGxlcnMgYW5kIHNlbGYgYWNjZXB0ZWQgbW9kdWxlIGxvYWRcclxuIFx0XHRpZihlcnJvcikge1xyXG4gXHRcdFx0aG90U2V0U3RhdHVzKFwiZmFpbFwiKTtcclxuIFx0XHRcdHJldHVybiBjYWxsYmFjayhlcnJvcik7XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHRob3RTZXRTdGF0dXMoXCJpZGxlXCIpO1xyXG4gXHRcdGNhbGxiYWNrKG51bGwsIG91dGRhdGVkTW9kdWxlcyk7XHJcbiBcdH1cclxuXG4gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2UsXG4gXHRcdFx0aG90OiBob3RDcmVhdGVNb2R1bGUobW9kdWxlSWQpLFxuIFx0XHRcdHBhcmVudHM6IGhvdEN1cnJlbnRQYXJlbnRzLFxuIFx0XHRcdGNoaWxkcmVuOiBbXVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBob3RDcmVhdGVSZXF1aXJlKG1vZHVsZUlkKSk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJodHRwOi8vbG9jYWxob3N0OjUwMDEvXCI7XG5cbiBcdC8vIF9fd2VicGFja19oYXNoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18uaCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaG90Q3VycmVudEhhc2g7IH07XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIGhvdENyZWF0ZVJlcXVpcmUoMCkoMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYjQ5MmU4NDg1OGMzOTA0MzIyNDYiLCIvKiBnbG9iYWwgJCBqUXVlcnkgQ1BPIENvZGVNaXJyb3Igc3RvcmFnZUFQSSBRIGNyZWF0ZVByb2dyYW1Db2xsZWN0aW9uQVBJIG1ha2VTaGFyZUFQSSAqL1xuXG4vL3ZhciBzaGFyZUFQSSA9IG1ha2VTaGFyZUFQSShwcm9jZXNzLmVudi5DVVJSRU5UX1BZUkVUX1JFTEVBU0UpO1xudmFyIHNoYXJlQVBJID0gbWFrZVNoYXJlQVBJKGVudl9DVVJSRU5UX1BZUkVUX1JFTEVBU0UpO1xuXG52YXIgdXJsID0gcmVxdWlyZSgndXJsLmpzJyk7XG5cbmNvbnN0IExPRyA9IHRydWU7XG53aW5kb3cuY3RfbG9nID0gZnVuY3Rpb24oLyogdmFyYXJncyAqLykge1xuICBpZiAod2luZG93LmNvbnNvbGUgJiYgTE9HKSB7XG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgfVxufTtcblxud2luZG93LmN0X2Vycm9yID0gZnVuY3Rpb24oLyogdmFyYXJncyAqLykge1xuICBpZiAod2luZG93LmNvbnNvbGUgJiYgTE9HKSB7XG4gICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICB9XG59O1xudmFyIGluaXRpYWxQYXJhbXMgPSB1cmwucGFyc2UoZG9jdW1lbnQubG9jYXRpb24uaHJlZik7XG52YXIgcGFyYW1zID0gdXJsLnBhcnNlKFwiLz9cIiArIGluaXRpYWxQYXJhbXNbXCJoYXNoXCJdKTtcbndpbmRvdy5oaWdobGlnaHRNb2RlID0gXCJtY21oXCI7IC8vIHdoYXQgaXMgdGhpcyBmb3I/XG53aW5kb3cuY2xlYXJGbGFzaCA9IGZ1bmN0aW9uKCkge1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikuZW1wdHkoKTtcbn1cbndpbmRvdy5zdGlja0Vycm9yID0gZnVuY3Rpb24obWVzc2FnZSwgbW9yZSkge1xuICBjbGVhckZsYXNoKCk7XG4gIHZhciBlcnIgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJlcnJvclwiKS50ZXh0KG1lc3NhZ2UpO1xuICBpZihtb3JlKSB7XG4gICAgZXJyLmF0dHIoXCJ0aXRsZVwiLCBtb3JlKTtcbiAgfVxuICBlcnIudG9vbHRpcCgpO1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikucHJlcGVuZChlcnIpO1xufTtcbndpbmRvdy5mbGFzaEVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBjbGVhckZsYXNoKCk7XG4gIHZhciBlcnIgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJlcnJvclwiKS50ZXh0KG1lc3NhZ2UpO1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikucHJlcGVuZChlcnIpO1xuICBlcnIuZmFkZU91dCg3MDAwKTtcbn07XG53aW5kb3cuZmxhc2hNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBjbGVhckZsYXNoKCk7XG4gIHZhciBtc2cgPSAkKFwiPGRpdj5cIikuYWRkQ2xhc3MoXCJhY3RpdmVcIikudGV4dChtZXNzYWdlKTtcbiAgJChcIi5ub3RpZmljYXRpb25BcmVhXCIpLnByZXBlbmQobXNnKTtcbiAgbXNnLmZhZGVPdXQoNzAwMCk7XG59O1xud2luZG93LnN0aWNrTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgY2xlYXJGbGFzaCgpO1xuICB2YXIgZXJyID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpLnRleHQobWVzc2FnZSk7XG4gICQoXCIubm90aWZpY2F0aW9uQXJlYVwiKS5wcmVwZW5kKGVycik7XG59O1xud2luZG93Lm1rV2FybmluZ1VwcGVyID0gZnVuY3Rpb24oKXtyZXR1cm4gJChcIjxkaXYgY2xhc3M9J3dhcm5pbmctdXBwZXInPlwiKTt9XG53aW5kb3cubWtXYXJuaW5nTG93ZXIgPSBmdW5jdGlvbigpe3JldHVybiAkKFwiPGRpdiBjbGFzcz0nd2FybmluZy1sb3dlcic+XCIpO31cblxuJCh3aW5kb3cpLmJpbmQoXCJiZWZvcmV1bmxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBcIkJlY2F1c2UgdGhpcyBwYWdlIGNhbiBsb2FkIHNsb3dseSwgYW5kIHlvdSBtYXkgaGF2ZSBvdXRzdGFuZGluZyBjaGFuZ2VzLCB3ZSBhc2sgdGhhdCB5b3UgY29uZmlybSBiZWZvcmUgbGVhdmluZyB0aGUgZWRpdG9yIGluIGNhc2UgY2xvc2luZyB3YXMgYW4gYWNjaWRlbnQuXCI7XG59KTtcblxudmFyIERvY3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICBcbiAgZnVuY3Rpb24gRG9jdW1lbnRzKCkge1xuICAgIHRoaXMuZG9jdW1lbnRzID0gbmV3IE1hcCgpO1xuICB9XG4gIFxuICBEb2N1bWVudHMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnRzLmhhcyhuYW1lKTtcbiAgfTtcblxuICBEb2N1bWVudHMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnRzLmdldChuYW1lKTtcbiAgfTtcblxuICBEb2N1bWVudHMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChuYW1lLCBkb2MpIHtcbiAgICBpZihsb2dnZXIuaXNEZXRhaWxlZClcbiAgICAgIGxvZ2dlci5sb2coXCJkb2Muc2V0XCIsIHtuYW1lOiBuYW1lLCB2YWx1ZTogZG9jLmdldFZhbHVlKCl9KTtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuc2V0KG5hbWUsIGRvYyk7XG4gIH07XG4gIFxuICBEb2N1bWVudHMucHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYobG9nZ2VyLmlzRGV0YWlsZWQpXG4gICAgICBsb2dnZXIubG9nKFwiZG9jLmRlbFwiLCB7bmFtZTogbmFtZX0pO1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50cy5kZWxldGUobmFtZSk7XG4gIH07XG5cbiAgRG9jdW1lbnRzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGYpIHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuZm9yRWFjaChmKTtcbiAgfTtcblxuICByZXR1cm4gRG9jdW1lbnRzO1xufSgpO1xuXG53aW5kb3cuQ1BPID0ge1xuICBzYXZlOiBmdW5jdGlvbigpIHt9LFxuICBhdXRvU2F2ZTogZnVuY3Rpb24oKSB7fSxcbiAgZG9jdW1lbnRzIDogbmV3IERvY3VtZW50cygpXG59O1xuJChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gbWVyZ2Uob2JqLCBleHRlbnNpb24pIHtcbiAgICB2YXIgbmV3b2JqID0ge307XG4gICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICAgIG5ld29ialtrXSA9IG9ialtrXTtcbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhleHRlbnNpb24pLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgICAgbmV3b2JqW2tdID0gZXh0ZW5zaW9uW2tdO1xuICAgIH0pO1xuICAgIHJldHVybiBuZXdvYmo7XG4gIH1cbiAgdmFyIGFuaW1hdGlvbkRpdiA9IG51bGw7XG4gIGZ1bmN0aW9uIGNsb3NlQW5pbWF0aW9uSWZPcGVuKCkge1xuICAgIGlmKGFuaW1hdGlvbkRpdikge1xuICAgICAgYW5pbWF0aW9uRGl2LmVtcHR5KCk7XG4gICAgICBhbmltYXRpb25EaXYuZGlhbG9nKFwiZGVzdHJveVwiKTtcbiAgICAgIGFuaW1hdGlvbkRpdiA9IG51bGw7XG4gICAgfVxuICB9XG4gIENQTy5tYWtlRWRpdG9yID0gZnVuY3Rpb24oY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgdmFyIGluaXRpYWwgPSBcIlwiO1xuICAgIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KFwiaW5pdGlhbFwiKSkge1xuICAgICAgaW5pdGlhbCA9IG9wdGlvbnMuaW5pdGlhbDtcbiAgICB9XG5cbiAgICB2YXIgdGV4dGFyZWEgPSBqUXVlcnkoXCI8dGV4dGFyZWE+XCIpO1xuICAgIHRleHRhcmVhLnZhbChpbml0aWFsKTtcbiAgICBjb250YWluZXIuYXBwZW5kKHRleHRhcmVhKTtcblxuICAgIHZhciBydW5GdW4gPSBmdW5jdGlvbiAoY29kZSwgcmVwbE9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMucnVuKGNvZGUsIHtjbTogQ019LCByZXBsT3B0aW9ucyk7XG4gICAgfTtcblxuICAgIHZhciB1c2VMaW5lTnVtYmVycyA9ICFvcHRpb25zLnNpbXBsZUVkaXRvcjtcbiAgICB2YXIgdXNlRm9sZGluZyA9ICFvcHRpb25zLnNpbXBsZUVkaXRvcjtcblxuICAgIHZhciBndXR0ZXJzID0gIW9wdGlvbnMuc2ltcGxlRWRpdG9yID9cbiAgICAgIFtcIkNvZGVNaXJyb3ItbGluZW51bWJlcnNcIiwgXCJDb2RlTWlycm9yLWZvbGRndXR0ZXJcIl0gOlxuICAgICAgW107XG5cbiAgICBmdW5jdGlvbiByZWluZGVudEFsbExpbmVzKGNtKSB7XG4gICAgICB2YXIgbGFzdCA9IGNtLmxpbmVDb3VudCgpO1xuICAgICAgY20ub3BlcmF0aW9uKGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3Q7ICsraSkgY20uaW5kZW50TGluZShpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBjbU9wdGlvbnMgPSB7XG4gICAgICBleHRyYUtleXM6IHtcbiAgICAgICAgXCJTaGlmdC1FbnRlclwiOiBmdW5jdGlvbihjbSkgeyBydW5GdW4oY20uZ2V0VmFsdWUoKSk7IH0sXG4gICAgICAgIFwiU2hpZnQtQ3RybC1FbnRlclwiOiBmdW5jdGlvbihjbSkgeyBydW5GdW4oY20uZ2V0VmFsdWUoKSk7IH0sXG4gICAgICAgIFwiVGFiXCI6IFwiaW5kZW50QXV0b1wiLFxuICAgICAgICBcIkN0cmwtSVwiOiByZWluZGVudEFsbExpbmVzXG4gICAgICB9LFxuICAgICAgaW5kZW50VW5pdDogMixcbiAgICAgIHRhYlNpemU6IDIsXG4gICAgICB2aWV3cG9ydE1hcmdpbjogSW5maW5pdHksXG4gICAgICBsaW5lTnVtYmVyczogdXNlTGluZU51bWJlcnMsXG4gICAgICBtYXRjaEtleXdvcmRzOiB0cnVlLFxuICAgICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICAgIHN0eWxlU2VsZWN0ZWRUZXh0OiB0cnVlLFxuICAgICAgZm9sZEd1dHRlcjogdXNlRm9sZGluZyxcbiAgICAgIGd1dHRlcnM6IGd1dHRlcnMsXG4gICAgICBsaW5lV3JhcHBpbmc6IHRydWUsXG4gICAgICBsb2dnaW5nOiB0cnVlXG4gICAgfTtcblxuICAgIGNtT3B0aW9ucyA9IG1lcmdlKGNtT3B0aW9ucywgb3B0aW9ucy5jbU9wdGlvbnMgfHwge30pO1xuXG4gICAgdmFyIENNID0gQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEodGV4dGFyZWFbMF0sIGNtT3B0aW9ucyk7XG5cbiAgICB2YXIgQ01ibG9ja3M7XG5cbiAgICBpZiAodHlwZW9mIENvZGVNaXJyb3JCbG9ja3MgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zb2xlLmxvZygnQ29kZU1pcnJvckJsb2NrcyBub3QgZm91bmQnKTtcbiAgICAgIENNYmxvY2tzID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICBDTWJsb2NrcyA9IG5ldyBDb2RlTWlycm9yQmxvY2tzKENNLFxuICAgICAgICAnd2VzY2hlbWUnLFxuICAgICAgICB7XG4gICAgICAgICAgd2lsbEluc2VydE5vZGU6IGZ1bmN0aW9uKHNvdXJjZU5vZGVUZXh0LCBzb3VyY2VOb2RlLCBkZXN0aW5hdGlvbikge1xuICAgICAgICAgICAgdmFyIGxpbmUgPSBDTS5lZGl0b3IuZ2V0TGluZShkZXN0aW5hdGlvbi5saW5lKTtcbiAgICAgICAgICAgIGlmIChkZXN0aW5hdGlvbi5jaCA+IDAgJiYgbGluZVtkZXN0aW5hdGlvbi5jaCAtIDFdLm1hdGNoKC9bXFx3XFxkXS8pKSB7XG4gICAgICAgICAgICAgIC8vIHByZXZpb3VzIGNoYXJhY3RlciBpcyBhIGxldHRlciBvciBudW1iZXIsIHNvIHByZWZpeCBhIHNwYWNlXG4gICAgICAgICAgICAgIHNvdXJjZU5vZGVUZXh0ID0gJyAnICsgc291cmNlTm9kZVRleHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZXN0aW5hdGlvbi5jaCA8IGxpbmUubGVuZ3RoICYmIGxpbmVbZGVzdGluYXRpb24uY2hdLm1hdGNoKC9bXFx3XFxkXS8pKSB7XG4gICAgICAgICAgICAgIC8vIG5leHQgY2hhcmFjdGVyIGlzIGEgbGV0dGVyIG9yIGEgbnVtYmVyLCBzbyBhcHBlbmQgYSBzcGFjZVxuICAgICAgICAgICAgICBzb3VyY2VOb2RlVGV4dCArPSAnICc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc291cmNlTm9kZVRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIENNLmJsb2Nrc0VkaXRvciA9IENNYmxvY2tzO1xuICAgICAgQ00uY2hhbmdlTW9kZSA9IGZ1bmN0aW9uKG1vZGUpIHtcbiAgICAgICAgaWYgKG1vZGUgPT09IFwiZmFsc2VcIikge1xuICAgICAgICAgIG1vZGUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBDTWJsb2Nrcy5hc3QgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIENNYmxvY2tzLnNldEJsb2NrTW9kZShtb2RlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodXNlTGluZU51bWJlcnMpIHtcbiAgICAgIENNLmRpc3BsYXkud3JhcHBlci5hcHBlbmRDaGlsZChta1dhcm5pbmdVcHBlcigpWzBdKTtcbiAgICAgIENNLmRpc3BsYXkud3JhcHBlci5hcHBlbmRDaGlsZChta1dhcm5pbmdMb3dlcigpWzBdKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY206IENNLFxuICAgICAgcmVmcmVzaDogZnVuY3Rpb24oKSB7IENNLnJlZnJlc2goKTsgfSxcbiAgICAgIHJ1bjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJ1bkZ1bihDTS5nZXRWYWx1ZSgpKTtcbiAgICAgIH0sXG4gICAgICBmb2N1czogZnVuY3Rpb24oKSB7IENNLmZvY3VzKCk7IH1cbiAgICB9O1xuICB9O1xuICBDUE8uUlVOX0NPREUgPSBmdW5jdGlvbigpIHtcblxuICB9O1xuXG4gIHN0b3JhZ2VBUEkudGhlbihmdW5jdGlvbihhcGkpIHtcbiAgICBhcGkuY29sbGVjdGlvbi50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgJChcIi5sb2dpbk9ubHlcIikuc2hvdygpO1xuICAgICAgJChcIi5sb2dvdXRPbmx5XCIpLmhpZGUoKTtcbiAgICAgIGFwaS5hcGkuZ2V0Q29sbGVjdGlvbkxpbmsoKS50aGVuKGZ1bmN0aW9uKGxpbmspIHtcbiAgICAgICAgJChcIiNkcml2ZS12aWV3IGFcIikuYXR0cihcImhyZWZcIiwgbGluayk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBhcGkuY29sbGVjdGlvbi5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgJChcIi5sb2dpbk9ubHlcIikuaGlkZSgpO1xuICAgICAgJChcIi5sb2dvdXRPbmx5XCIpLnNob3coKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgc3RvcmFnZUFQSSA9IHN0b3JhZ2VBUEkudGhlbihmdW5jdGlvbihhcGkpIHsgcmV0dXJuIGFwaS5hcGk7IH0pO1xuICAkKFwiI2Nvbm5lY3RCdXR0b25cIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgJChcIiNjb25uZWN0QnV0dG9uXCIpLnRleHQoXCJDb25uZWN0aW5nLi4uXCIpO1xuICAgICQoXCIjY29ubmVjdEJ1dHRvblwiKS5hdHRyKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKTtcbiAgICBzdG9yYWdlQVBJID0gY3JlYXRlUHJvZ3JhbUNvbGxlY3Rpb25BUEkoXCJjb2RlLnB5cmV0Lm9yZ1wiLCBmYWxzZSk7XG4gICAgc3RvcmFnZUFQSS50aGVuKGZ1bmN0aW9uKGFwaSkge1xuICAgICAgYXBpLmNvbGxlY3Rpb24udGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgJChcIi5sb2dpbk9ubHlcIikuc2hvdygpO1xuICAgICAgICAkKFwiLmxvZ291dE9ubHlcIikuaGlkZSgpO1xuICAgICAgICBhcGkuYXBpLmdldENvbGxlY3Rpb25MaW5rKCkudGhlbihmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICAgJChcIiNkcml2ZS12aWV3IGFcIikuYXR0cihcImhyZWZcIiwgbGluayk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZihwYXJhbXNbXCJnZXRcIl0gJiYgcGFyYW1zW1wiZ2V0XCJdW1wicHJvZ3JhbVwiXSkge1xuICAgICAgICAgIHZhciB0b0xvYWQgPSBhcGkuYXBpLmdldEZpbGVCeUlkKHBhcmFtc1tcImdldFwiXVtcInByb2dyYW1cIl0pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiTG9nZ2VkIGluIGFuZCBoYXMgcHJvZ3JhbSB0byBsb2FkOiBcIiwgdG9Mb2FkKTtcbiAgICAgICAgICBsb2FkUHJvZ3JhbSh0b0xvYWQpO1xuICAgICAgICAgIHByb2dyYW1Ub1NhdmUgPSB0b0xvYWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvZ3JhbVRvU2F2ZSA9IFEuZmNhbGwoZnVuY3Rpb24oKSB7IHJldHVybiBudWxsOyB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBhcGkuY29sbGVjdGlvbi5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICAkKFwiI2Nvbm5lY3RCdXR0b25cIikudGV4dChcIkNvbm5lY3QgdG8gR29vZ2xlIERyaXZlXCIpO1xuICAgICAgICAkKFwiI2Nvbm5lY3RCdXR0b25cIikuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHN0b3JhZ2VBUEkgPSBzdG9yYWdlQVBJLnRoZW4oZnVuY3Rpb24oYXBpKSB7IHJldHVybiBhcGkuYXBpOyB9KTtcbiAgfSk7XG5cbiAgdmFyIGNvcHlPblNhdmUgPSBmYWxzZTtcblxuICB2YXIgaW5pdGlhbFByb2dyYW0gPSBzdG9yYWdlQVBJLnRoZW4oZnVuY3Rpb24oYXBpKSB7XG4gICAgdmFyIHByb2dyYW1Mb2FkID0gbnVsbDtcbiAgICBpZihwYXJhbXNbXCJnZXRcIl0gJiYgcGFyYW1zW1wiZ2V0XCJdW1wicHJvZ3JhbVwiXSkge1xuICAgICAgcHJvZ3JhbUxvYWQgPSBhcGkuZ2V0RmlsZUJ5SWQocGFyYW1zW1wiZ2V0XCJdW1wicHJvZ3JhbVwiXSk7XG4gICAgICBwcm9ncmFtTG9hZC50aGVuKGZ1bmN0aW9uKHApIHsgc2hvd1NoYXJlQ29udGFpbmVyKHApOyB9KTtcbiAgICB9XG4gICAgaWYocGFyYW1zW1wiZ2V0XCJdICYmIHBhcmFtc1tcImdldFwiXVtcInNoYXJlXCJdKSB7XG4gICAgICBwcm9ncmFtTG9hZCA9IGFwaS5nZXRTaGFyZWRGaWxlQnlJZChwYXJhbXNbXCJnZXRcIl1bXCJzaGFyZVwiXSk7XG4gICAgICAkKFwiI3NhdmVCdXR0b25cIikudGV4dChcIlNhdmUgYSBDb3B5XCIpO1xuICAgICAgY29weU9uU2F2ZSA9IHRydWU7XG4gICAgfVxuICAgIGlmKHByb2dyYW1Mb2FkKSB7XG4gICAgICBwcm9ncmFtTG9hZC5mYWlsKGZ1bmN0aW9uKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIHdpbmRvdy5zdGlja0Vycm9yKFwiVGhlIHByb2dyYW0gZmFpbGVkIHRvIGxvYWQuXCIpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvZ3JhbUxvYWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2V0VGl0bGUocHJvZ05hbWUpIHtcbiAgICBkb2N1bWVudC50aXRsZSA9IHByb2dOYW1lICsgXCIgLSBjb2RlLnB5cmV0Lm9yZ1wiO1xuICB9XG4gIENQTy5zZXRUaXRsZSA9IHNldFRpdGxlO1xuXG4gICQoXCIjZG93bmxvYWQgYVwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICB2YXIgZG93bmxvYWRFbHQgPSAkKFwiI2Rvd25sb2FkIGFcIik7XG4gICAgdmFyIGNvbnRlbnRzID0gQ1BPLmVkaXRvci5jbS5nZXRWYWx1ZSgpO1xuICAgIHZhciBkb3dubG9hZEJsb2IgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbY29udGVudHNdLCB7dHlwZTogJ3RleHQvcGxhaW4nfSkpO1xuICAgIHZhciBmaWxlbmFtZSA9ICQoXCIjcHJvZ3JhbS1uYW1lXCIpLnZhbCgpO1xuICAgIGlmKCFmaWxlbmFtZSkgeyBmaWxlbmFtZSA9ICd1bnRpdGxlZF9wcm9ncmFtLmFycic7IH1cbiAgICBpZihmaWxlbmFtZS5pbmRleE9mKFwiLmFyclwiKSAhPT0gKGZpbGVuYW1lLmxlbmd0aCAtIDQpKSB7XG4gICAgICBmaWxlbmFtZSArPSBcIi5hcnJcIjtcbiAgICB9XG4gICAgZG93bmxvYWRFbHQuYXR0cih7XG4gICAgICBkb3dubG9hZDogZmlsZW5hbWUsXG4gICAgICBocmVmOiBkb3dubG9hZEJsb2JcbiAgICB9KTtcbiAgICAkKFwiI2Rvd25sb2FkXCIpLmFwcGVuZChkb3dubG9hZEVsdCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGxvYWRQcm9ncmFtKHApIHtcbiAgICByZXR1cm4gcC50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgIGlmKHAgIT09IG51bGwpIHtcbiAgICAgICAgJChcIiNwcm9ncmFtLW5hbWVcIikudmFsKHAuZ2V0TmFtZSgpKTtcbiAgICAgICAgc2V0VGl0bGUocC5nZXROYW1lKCkpO1xuICAgICAgICByZXR1cm4gcC5nZXRDb250ZW50cygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdmFyIHByb2dyYW1Mb2FkZWQgPSBsb2FkUHJvZ3JhbShpbml0aWFsUHJvZ3JhbSk7XG5cbiAgdmFyIHByb2dyYW1Ub1NhdmUgPSBpbml0aWFsUHJvZ3JhbTtcblxuICBmdW5jdGlvbiBzaG93U2hhcmVDb250YWluZXIocCkge1xuICAgICQoXCIjc2hhcmVDb250YWluZXJcIikuZW1wdHkoKTtcbiAgICAkKFwiI3NoYXJlQ29udGFpbmVyXCIpLmFwcGVuZChzaGFyZUFQSS5tYWtlU2hhcmVMaW5rKHApKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5hbWVPclVudGl0bGVkKCkge1xuICAgIHJldHVybiAkKFwiI3Byb2dyYW0tbmFtZVwiKS52YWwoKSB8fCBcIlVudGl0bGVkXCI7XG4gIH1cbiAgZnVuY3Rpb24gYXV0b1NhdmUoKSB7XG4gICAgcHJvZ3JhbVRvU2F2ZS50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgIGlmKHAgIT09IG51bGwgJiYgIWNvcHlPblNhdmUpIHsgc2F2ZSgpOyB9XG4gICAgfSk7XG4gIH1cbiAgQ1BPLmF1dG9TYXZlID0gYXV0b1NhdmU7XG4gIENQTy5zaG93U2hhcmVDb250YWluZXIgPSBzaG93U2hhcmVDb250YWluZXI7XG4gIENQTy5sb2FkUHJvZ3JhbSA9IGxvYWRQcm9ncmFtO1xuXG4gIGZ1bmN0aW9uIHNhdmUoKSB7XG4gICAgd2luZG93LnN0aWNrTWVzc2FnZShcIlNhdmluZy4uLlwiKTtcbiAgICB2YXIgc2F2ZWRQcm9ncmFtID0gcHJvZ3JhbVRvU2F2ZS50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgIGlmKHAgIT09IG51bGwgJiYgIWNvcHlPblNhdmUpIHtcbiAgICAgICAgaWYocC5nZXROYW1lKCkgIT09ICQoXCIjcHJvZ3JhbS1uYW1lXCIpLnZhbCgpKSB7XG4gICAgICAgICAgcHJvZ3JhbVRvU2F2ZSA9IHAucmVuYW1lKG5hbWVPclVudGl0bGVkKCkpLnRoZW4oZnVuY3Rpb24obmV3UCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ld1A7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb2dyYW1Ub1NhdmVcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocCkge1xuICAgICAgICAgIHNob3dTaGFyZUNvbnRhaW5lcihwKTtcbiAgICAgICAgICByZXR1cm4gcC5zYXZlKENQTy5lZGl0b3IuY20uZ2V0VmFsdWUoKSwgZmFsc2UpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihwKSB7XG4gICAgICAgICAgJChcIiNwcm9ncmFtLW5hbWVcIikudmFsKHAuZ2V0TmFtZSgpKTtcbiAgICAgICAgICAkKFwiI3NhdmVCdXR0b25cIikudGV4dChcIlNhdmVcIik7XG4gICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgbnVsbCwgXCIjcHJvZ3JhbT1cIiArIHAuZ2V0VW5pcXVlSWQoKSk7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBcIiNwcm9ncmFtPVwiICsgcC5nZXRVbmlxdWVJZCgpO1xuICAgICAgICAgIHdpbmRvdy5mbGFzaE1lc3NhZ2UoXCJQcm9ncmFtIHNhdmVkIGFzIFwiICsgcC5nZXROYW1lKCkpO1xuICAgICAgICAgIHNldFRpdGxlKHAuZ2V0TmFtZSgpKTtcbiAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIHByb2dyYW1OYW1lID0gJChcIiNwcm9ncmFtLW5hbWVcIikudmFsKCkgfHwgXCJVbnRpdGxlZFwiO1xuICAgICAgICAkKFwiI3Byb2dyYW0tbmFtZVwiKS52YWwocHJvZ3JhbU5hbWUpO1xuICAgICAgICBwcm9ncmFtVG9TYXZlID0gc3RvcmFnZUFQSVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGFwaSkgeyByZXR1cm4gYXBpLmNyZWF0ZUZpbGUocHJvZ3JhbU5hbWUpOyB9KTtcbiAgICAgICAgY29weU9uU2F2ZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gc2F2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNhdmVkUHJvZ3JhbS5mYWlsKGZ1bmN0aW9uKGVycikge1xuICAgICAgd2luZG93LnN0aWNrRXJyb3IoXCJVbmFibGUgdG8gc2F2ZVwiLCBcIllvdXIgaW50ZXJuZXQgY29ubmVjdGlvbiBtYXkgYmUgZG93biwgb3Igc29tZXRoaW5nIGVsc2UgbWlnaHQgYmUgd3Jvbmcgd2l0aCB0aGlzIHNpdGUgb3Igc2F2aW5nIHRvIEdvb2dsZS4gIFlvdSBzaG91bGQgYmFjayB1cCBhbnkgY2hhbmdlcyB0byB0aGlzIHByb2dyYW0gc29tZXdoZXJlIGVsc2UuICBZb3UgY2FuIHRyeSBzYXZpbmcgYWdhaW4gdG8gc2VlIGlmIHRoZSBwcm9ibGVtIHdhcyB0ZW1wb3JhcnksIGFzIHdlbGwuXCIpO1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH0pO1xuICB9XG4gIENQTy5zYXZlID0gc2F2ZTtcbiAgJChcIiNydW5CdXR0b25cIikuY2xpY2soQ1BPLmF1dG9TYXZlKTtcbiAgJChcIiNzYXZlQnV0dG9uXCIpLmNsaWNrKHNhdmUpO1xuICBzaGFyZUFQSS5tYWtlSG92ZXJNZW51KCQoXCIjbWVudVwiKSwgJChcIiNtZW51Q29udGVudHNcIiksIGZhbHNlLCBmdW5jdGlvbigpe30pO1xuXG4gIHZhciBjb2RlQ29udGFpbmVyID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwicmVwbE1haW5cIik7XG4gICQoXCIjbWFpblwiKS5wcmVwZW5kKGNvZGVDb250YWluZXIpO1xuXG4gIENQTy5lZGl0b3IgPSBDUE8ubWFrZUVkaXRvcihjb2RlQ29udGFpbmVyLCB7XG4gICAgcnVuQnV0dG9uOiAkKFwiI3J1bkJ1dHRvblwiKSxcbiAgICBzaW1wbGVFZGl0b3I6IGZhbHNlLFxuICAgIHJ1bjogQ1BPLlJVTl9DT0RFLFxuICAgIGluaXRpYWxHYXM6IDEwMFxuICB9KTtcbiAgQ1BPLmVkaXRvci5jbS5zZXRPcHRpb24oXCJyZWFkT25seVwiLCBcIm5vY3Vyc29yXCIpO1xuICBcbiAgcHJvZ3JhbUxvYWRlZC50aGVuKGZ1bmN0aW9uKGMpIHtcbiAgICBDUE8uZG9jdW1lbnRzLnNldChcImRlZmluaXRpb25zOi8vXCIsIENQTy5lZGl0b3IuY20uZ2V0RG9jKCkpO1xuICAgIFxuICAgIC8vIE5PVEUoam9lKTogQ2xlYXJpbmcgaGlzdG9yeSB0byBhZGRyZXNzIGh0dHBzOi8vZ2l0aHViLmNvbS9icm93bnBsdC9weXJldC1sYW5nL2lzc3Vlcy8zODYsXG4gICAgLy8gaW4gd2hpY2ggdW5kbyBjYW4gcmV2ZXJ0IHRoZSBwcm9ncmFtIGJhY2sgdG8gZW1wdHlcbiAgICBDUE8uZWRpdG9yLmNtLmNsZWFySGlzdG9yeSgpO1xuICAgIENQTy5lZGl0b3IuY20uc2V0VmFsdWUoYyk7XG4gIH0pO1xuXG4gIHByb2dyYW1Mb2FkZWQuZmFpbChmdW5jdGlvbigpIHtcbiAgICBDUE8uZG9jdW1lbnRzLnNldChcImRlZmluaXRpb25zOi8vXCIsIENQTy5lZGl0b3IuY20uZ2V0RG9jKCkpO1xuICB9KTtcblxuICB2YXIgcHlyZXRMb2FkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIC8qXG4gIGNvbnNvbGUubG9nKCdwcm9jZXNzLmVudiBpcycsIEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52KSk7XG4gIGNvbnNvbGUubG9nKCdwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEIGlzJywgcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCk7XG4gIGNvbnNvbGUubG9nKCdwcm9jZXNzLmVudi5SRURJU0NMT1VEX1VSTCBpcycsIHByb2Nlc3MuZW52LlJFRElTQ0xPVURfVVJMKTtcbiAgY29uc29sZS5sb2coJ3Byb2Nlc3MuZW52LkJBU0VfVVJMIGlzJywgcHJvY2Vzcy5lbnYuQkFTRV9VUkwpO1xuICBjb25zb2xlLmxvZygncHJvY2Vzcy5lbnYuU0VTU0lPTl9TRUNSRVQgaXMnLCBwcm9jZXNzLmVudi5TRVNTSU9OX1NFQ1JFVCk7XG4gIGNvbnNvbGUubG9nKCdwcm9jZXNzLmVudi5DVVJSRU5UX1BZUkVUX1JFTEVBU0UgaXMnLCBwcm9jZXNzLmVudi5DVVJSRU5UX1BZUkVUX1JFTEVBU0UpO1xuICBjb25zb2xlLmxvZygncHJvY2Vzcy5lbnYuUFlSRVQgaXMnLCBwcm9jZXNzLmVudi5QWVJFVCk7XG4gIGNvbnNvbGUubG9nKCdwcm9jZXNzLmVudi5QWVJFVF9SRUxFQVNFX0JBU0UgaXMnLCBwcm9jZXNzLmVudi5QWVJFVF9SRUxFQVNFX0JBU0UpO1xuICBjb25zb2xlLmxvZygnY2xpZW50SWQgaXMnLCBjbGllbnRJZCk7XG4gICovXG4gIC8vY29uc29sZS5sb2cocHJvY2Vzcy5lbnYuUFlSRVQpO1xuICAvL3B5cmV0TG9hZC5zcmMgPSBwcm9jZXNzLmVudi5QWVJFVDtcbiAgY29uc29sZS5sb2coJ2Vudl9QWVJFVCBpcycsIGVudl9QWVJFVCk7XG4gIHB5cmV0TG9hZC5zcmMgPSBlbnZfUFlSRVQ7XG4gIHB5cmV0TG9hZC50eXBlID0gXCJ0ZXh0L2phdmFzY3JpcHRcIjtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChweXJldExvYWQpO1xuICAkKHB5cmV0TG9hZCkub24oXCJlcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAkKFwiI2xvYWRlclwiKS5oaWRlKCk7XG4gICAgJChcIiNydW5QYXJ0XCIpLmhpZGUoKTtcbiAgICAkKFwiI2JyZWFrQnV0dG9uXCIpLmhpZGUoKTtcbiAgICB3aW5kb3cuc3RpY2tFcnJvcihcIlB5cmV0IGZhaWxlZCB0byBsb2FkOyBjaGVjayB5b3VyIGNvbm5lY3Rpb24gb3IgdHJ5IHJlZnJlc2hpbmcgdGhlIHBhZ2UuICBJZiB0aGlzIGhhcHBlbnMgcmVwZWF0ZWRseSwgcGxlYXNlIHJlcG9ydCBpdCBhcyBhIGJ1Zy5cIik7XG4gIH0pO1xuXG4gIHByb2dyYW1Mb2FkZWQuZmluKGZ1bmN0aW9uKCkge1xuICAgIENQTy5lZGl0b3IuZm9jdXMoKTtcbiAgICBDUE8uZWRpdG9yLmNtLnNldE9wdGlvbihcInJlYWRPbmx5XCIsIGZhbHNlKTtcbiAgfSk7XG5cbn0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3dlYi9qcy9iZWZvcmVQeXJldC5qcyIsIi8vIENvcHlyaWdodCAyMDEzLTIwMTQgS2V2aW4gQ294XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgVGhpcyBzb2Z0d2FyZSBpcyBwcm92aWRlZCAnYXMtaXMnLCB3aXRob3V0IGFueSBleHByZXNzIG9yIGltcGxpZWQgICAgICAgICAgICpcbiogIHdhcnJhbnR5LiBJbiBubyBldmVudCB3aWxsIHRoZSBhdXRob3JzIGJlIGhlbGQgbGlhYmxlIGZvciBhbnkgZGFtYWdlcyAgICAgICAqXG4qICBhcmlzaW5nIGZyb20gdGhlIHVzZSBvZiB0aGlzIHNvZnR3YXJlLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogIFBlcm1pc3Npb24gaXMgZ3JhbnRlZCB0byBhbnlvbmUgdG8gdXNlIHRoaXMgc29mdHdhcmUgZm9yIGFueSBwdXJwb3NlLCAgICAgICAqXG4qICBpbmNsdWRpbmcgY29tbWVyY2lhbCBhcHBsaWNhdGlvbnMsIGFuZCB0byBhbHRlciBpdCBhbmQgcmVkaXN0cmlidXRlIGl0ICAgICAgKlxuKiAgZnJlZWx5LCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgcmVzdHJpY3Rpb25zOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICAxLiBUaGUgb3JpZ2luIG9mIHRoaXMgc29mdHdhcmUgbXVzdCBub3QgYmUgbWlzcmVwcmVzZW50ZWQ7IHlvdSBtdXN0IG5vdCAgICAgKlxuKiAgICAgY2xhaW0gdGhhdCB5b3Ugd3JvdGUgdGhlIG9yaWdpbmFsIHNvZnR3YXJlLiBJZiB5b3UgdXNlIHRoaXMgc29mdHdhcmUgaW4gICpcbiogICAgIGEgcHJvZHVjdCwgYW4gYWNrbm93bGVkZ21lbnQgaW4gdGhlIHByb2R1Y3QgZG9jdW1lbnRhdGlvbiB3b3VsZCBiZSAgICAgICAqXG4qICAgICBhcHByZWNpYXRlZCBidXQgaXMgbm90IHJlcXVpcmVkLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogIDIuIEFsdGVyZWQgc291cmNlIHZlcnNpb25zIG11c3QgYmUgcGxhaW5seSBtYXJrZWQgYXMgc3VjaCwgYW5kIG11c3Qgbm90IGJlICAqXG4qICAgICBtaXNyZXByZXNlbnRlZCBhcyBiZWluZyB0aGUgb3JpZ2luYWwgc29mdHdhcmUuICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogIDMuIFRoaXMgbm90aWNlIG1heSBub3QgYmUgcmVtb3ZlZCBvciBhbHRlcmVkIGZyb20gYW55IHNvdXJjZSBkaXN0cmlidXRpb24uICAqXG4qICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuK2Z1bmN0aW9uKCl7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGFycmF5ID0gL1xcWyhbXlxcW10qKVxcXSQvO1xuXG4vLy8gVVJMIFJlZ2V4LlxuLyoqXG4gKiBUaGlzIHJlZ2V4IHNwbGl0cyB0aGUgVVJMIGludG8gcGFydHMuICBUaGUgY2FwdHVyZSBncm91cHMgY2F0Y2ggdGhlIGltcG9ydGFudFxuICogYml0cy5cbiAqIFxuICogRWFjaCBzZWN0aW9uIGlzIG9wdGlvbmFsLCBzbyB0byB3b3JrIG9uIGFueSBwYXJ0IGZpbmQgdGhlIGNvcnJlY3QgdG9wIGxldmVsXG4gKiBgKC4uLik/YCBhbmQgbWVzcyBhcm91bmQgd2l0aCBpdC5cbiAqL1xudmFyIHJlZ2V4ID0gL14oPzooW2Etel0qKTopPyg/OlxcL1xcLyk/KD86KFteOkBdKikoPzo6KFteQF0qKSk/QCk/KFthLXotLl9dKyk/KD86OihbMC05XSopKT8oXFwvW14/I10qKT8oPzpcXD8oW14jXSopKT8oPzojKC4qKSk/JC9pO1xuLy8gICAgICAgICAgICAgICAxIC0gc2NoZW1lICAgICAgICAgICAgICAgIDIgLSB1c2VyICAgIDMgPSBwYXNzIDQgLSBob3N0ICAgICAgICA1IC0gcG9ydCAgNiAtIHBhdGggICAgICAgIDcgLSBxdWVyeSAgICA4IC0gaGFzaFxuXG52YXIgbm9zbGFzaCA9IFtcIm1haWx0b1wiLFwiYml0Y29pblwiXTtcblxudmFyIHNlbGYgPSB7XG5cdC8qKiBQYXJzZSBhIHF1ZXJ5IHN0cmluZy5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBwYXJzZXMgYSBxdWVyeSBzdHJpbmcgKHNvbWV0aW1lcyBjYWxsZWQgdGhlIHNlYXJjaFxuXHQgKiBzdHJpbmcpLiAgSXQgdGFrZXMgYSBxdWVyeSBzdHJpbmcgYW5kIHJldHVybnMgYSBtYXAgb2YgdGhlIHJlc3VsdHMuXG5cdCAqXG5cdCAqIEtleXMgYXJlIGNvbnNpZGVyZWQgdG8gYmUgZXZlcnl0aGluZyB1cCB0byB0aGUgZmlyc3QgJz0nIGFuZCB2YWx1ZXMgYXJlXG5cdCAqIGV2ZXJ5dGhpbmcgYWZ0ZXJ3b3Jkcy4gIFNpbmNlIFVSTC1kZWNvZGluZyBpcyBkb25lIGFmdGVyIHBhcnNpbmcsIGtleXNcblx0ICogYW5kIHZhbHVlcyBjYW4gaGF2ZSBhbnkgdmFsdWVzLCBob3dldmVyLCAnPScgaGF2ZSB0byBiZSBlbmNvZGVkIGluIGtleXNcblx0ICogd2hpbGUgJz8nIGFuZCAnJicgaGF2ZSB0byBiZSBlbmNvZGVkIGFueXdoZXJlIChhcyB0aGV5IGRlbGltaXQgdGhlXG5cdCAqIGt2LXBhaXJzKS5cblx0ICpcblx0ICogS2V5cyBhbmQgdmFsdWVzIHdpbGwgYWx3YXlzIGJlIHN0cmluZ3MsIGV4Y2VwdCBpZiB0aGVyZSBpcyBhIGtleSB3aXRoIG5vXG5cdCAqICc9JyBpbiB3aGljaCBjYXNlIGl0IHdpbGwgYmUgY29uc2lkZXJlZCBhIGZsYWcgYW5kIHdpbGwgYmUgc2V0IHRvIHRydWUuXG5cdCAqIExhdGVyIHZhbHVlcyB3aWxsIG92ZXJyaWRlIGVhcmxpZXIgdmFsdWVzLlxuXHQgKlxuXHQgKiBBcnJheSBrZXlzIGFyZSBhbHNvIHN1cHBvcnRlZC4gIEJ5IGRlZmF1bHQga2V5cyBpbiB0aGUgZm9ybSBvZiBgbmFtZVtpXWBcblx0ICogd2lsbCBiZSByZXR1cm5lZCBsaWtlIHRoYXQgYXMgc3RyaW5ncy4gIEhvd2V2ZXIsIGlmIHlvdSBzZXQgdGhlIGBhcnJheWBcblx0ICogZmxhZyBpbiB0aGUgb3B0aW9ucyBvYmplY3QgdGhleSB3aWxsIGJlIHBhcnNlZCBpbnRvIGFycmF5cy4gIE5vdGUgdGhhdFxuXHQgKiBhbHRob3VnaCB0aGUgb2JqZWN0IHJldHVybmVkIGlzIGFuIGBBcnJheWAgb2JqZWN0IGFsbCBrZXlzIHdpbGwgYmVcblx0ICogd3JpdHRlbiB0byBpdC4gIFRoaXMgbWVhbnMgdGhhdCBpZiB5b3UgaGF2ZSBhIGtleSBzdWNoIGFzIGBrW2ZvckVhY2hdYFxuXHQgKiBpdCB3aWxsIG92ZXJ3cml0ZSB0aGUgYGZvckVhY2hgIGZ1bmN0aW9uIG9uIHRoYXQgYXJyYXkuICBBbHNvIG5vdGUgdGhhdFxuXHQgKiBzdHJpbmcgcHJvcGVydGllcyBhbHdheXMgdGFrZSBwcmVjZWRlbmNlIG92ZXIgYXJyYXkgcHJvcGVydGllcyxcblx0ICogaXJyZXNwZWN0aXZlIG9mIHdoZXJlIHRoZXkgYXJlIGluIHRoZSBxdWVyeSBzdHJpbmcuXG5cdCAqXG5cdCAqICAgdXJsLmdldChcImFycmF5WzFdPXRlc3QmYXJyYXlbZm9vXT1iYXJcIix7YXJyYXk6dHJ1ZX0pLmFycmF5WzFdICA9PT0gXCJ0ZXN0XCJcblx0ICogICB1cmwuZ2V0KFwiYXJyYXlbMV09dGVzdCZhcnJheVtmb29dPWJhclwiLHthcnJheTp0cnVlfSkuYXJyYXkuZm9vID09PSBcImJhclwiXG5cdCAqICAgdXJsLmdldChcImFycmF5PW5vdGFuYXJyYXkmYXJyYXlbMF09MVwiLHthcnJheTp0cnVlfSkuYXJyYXkgICAgICA9PT0gXCJub3RhbmFycmF5XCJcblx0ICpcblx0ICogSWYgYXJyYXkgcGFyc2luZyBpcyBlbmFibGVkIGtleXMgaW4gdGhlIGZvcm0gb2YgYG5hbWVbXWAgd2lsbFxuXHQgKiBhdXRvbWF0aWNhbGx5IGJlIGdpdmVuIHRoZSBuZXh0IGF2YWlsYWJsZSBpbmRleC4gIE5vdGUgdGhhdCB0aGlzIGNhbiBiZVxuXHQgKiBvdmVyd3JpdHRlbiB3aXRoIGxhdGVyIHZhbHVlcyBpbiB0aGUgcXVlcnkgc3RyaW5nLiAgRm9yIHRoaXMgcmVhc29uIGlzXG5cdCAqIGlzIGJlc3Qgbm90IHRvIG1peCB0aGUgdHdvIGZvcm1hdHMsIGFsdGhvdWdoIGl0IGlzIHNhZmUgKGFuZCBvZnRlblxuXHQgKiB1c2VmdWwpIHRvIGFkZCBhbiBhdXRvbWF0aWMgaW5kZXggYXJndW1lbnQgdG8gdGhlIGVuZCBvZiBhIHF1ZXJ5IHN0cmluZy5cblx0ICpcblx0ICogICB1cmwuZ2V0KFwiYVtdPTAmYVtdPTEmYVswXT0yXCIsIHthcnJheTp0cnVlfSkgIC0+IHthOltcIjJcIixcIjFcIl19O1xuXHQgKiAgIHVybC5nZXQoXCJhWzBdPTAmYVsxXT0xJmFbXT0yXCIsIHthcnJheTp0cnVlfSkgLT4ge2E6W1wiMFwiLFwiMVwiLFwiMlwiXX07XG5cdCAqXG5cdCAqIEBwYXJhbXtzdHJpbmd9IHEgVGhlIHF1ZXJ5IHN0cmluZyAodGhlIHBhcnQgYWZ0ZXIgdGhlICc/JykuXG5cdCAqIEBwYXJhbXt7ZnVsbDpib29sZWFuLGFycmF5OmJvb2xlYW59PX0gb3B0IE9wdGlvbnMuXG5cdCAqXG5cdCAqIC0gZnVsbDogSWYgc2V0IGBxYCB3aWxsIGJlIHRyZWF0ZWQgYXMgYSBmdWxsIHVybCBhbmQgYHFgIHdpbGwgYmUgYnVpbHQuXG5cdCAqICAgYnkgY2FsbGluZyAjcGFyc2UgdG8gcmV0cmlldmUgdGhlIHF1ZXJ5IHBvcnRpb24uXG5cdCAqIC0gYXJyYXk6IElmIHNldCBrZXlzIGluIHRoZSBmb3JtIG9mIGBrZXlbaV1gIHdpbGwgYmUgdHJlYXRlZFxuXHQgKiAgIGFzIGFycmF5cy9tYXBzLlxuXHQgKlxuXHQgKiBAcmV0dXJueyFPYmplY3QuPHN0cmluZywgc3RyaW5nfEFycmF5Pn0gVGhlIHBhcnNlZCByZXN1bHQuXG5cdCAqL1xuXHRcImdldFwiOiBmdW5jdGlvbihxLCBvcHQpe1xuXHRcdHEgPSBxIHx8IFwiXCI7XG5cdFx0aWYgKCB0eXBlb2Ygb3B0ICAgICAgICAgID09IFwidW5kZWZpbmVkXCIgKSBvcHQgPSB7fTtcblx0XHRpZiAoIHR5cGVvZiBvcHRbXCJmdWxsXCJdICA9PSBcInVuZGVmaW5lZFwiICkgb3B0W1wiZnVsbFwiXSA9IGZhbHNlO1xuXHRcdGlmICggdHlwZW9mIG9wdFtcImFycmF5XCJdID09IFwidW5kZWZpbmVkXCIgKSBvcHRbXCJhcnJheVwiXSA9IGZhbHNlO1xuXHRcdFxuXHRcdGlmICggb3B0W1wiZnVsbFwiXSA9PT0gdHJ1ZSApXG5cdFx0e1xuXHRcdFx0cSA9IHNlbGZbXCJwYXJzZVwiXShxLCB7XCJnZXRcIjpmYWxzZX0pW1wicXVlcnlcIl0gfHwgXCJcIjtcblx0XHR9XG5cdFx0XG5cdFx0dmFyIG8gPSB7fTtcblx0XHRcblx0XHR2YXIgYyA9IHEuc3BsaXQoXCImXCIpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRpZiAoIWNbaV0ubGVuZ3RoKSBjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0dmFyIGQgPSBjW2ldLmluZGV4T2YoXCI9XCIpO1xuXHRcdFx0dmFyIGsgPSBjW2ldLCB2ID0gdHJ1ZTtcblx0XHRcdGlmICggZCA+PSAwIClcblx0XHRcdHtcblx0XHRcdFx0ayA9IGNbaV0uc3Vic3RyKDAsIGQpO1xuXHRcdFx0XHR2ID0gY1tpXS5zdWJzdHIoZCsxKTtcblx0XHRcdFx0XG5cdFx0XHRcdHYgPSBkZWNvZGVVUklDb21wb25lbnQodik7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmIChvcHRbXCJhcnJheVwiXSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIGluZHMgPSBbXTtcblx0XHRcdFx0dmFyIGluZDtcblx0XHRcdFx0dmFyIGN1cm8gPSBvO1xuXHRcdFx0XHR2YXIgY3VyayA9IGs7XG5cdFx0XHRcdHdoaWxlIChpbmQgPSBjdXJrLm1hdGNoKGFycmF5KSkgLy8gQXJyYXkhXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjdXJrID0gY3Vyay5zdWJzdHIoMCwgaW5kLmluZGV4KTtcblx0XHRcdFx0XHRpbmRzLnVuc2hpZnQoZGVjb2RlVVJJQ29tcG9uZW50KGluZFsxXSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGN1cmsgPSBkZWNvZGVVUklDb21wb25lbnQoY3Vyayk7XG5cdFx0XHRcdGlmIChpbmRzLnNvbWUoZnVuY3Rpb24oaSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICggdHlwZW9mIGN1cm9bY3Vya10gPT0gXCJ1bmRlZmluZWRcIiApIGN1cm9bY3Vya10gPSBbXTtcblx0XHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoY3Vyb1tjdXJrXSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcInVybC5nZXQ6IEFycmF5IHByb3BlcnR5IFwiK2N1cmsrXCIgYWxyZWFkeSBleGlzdHMgYXMgc3RyaW5nIVwiKTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjdXJvID0gY3Vyb1tjdXJrXTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAoIGkgPT09IFwiXCIgKSBpID0gY3Vyby5sZW5ndGg7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y3VyayA9IGk7XG5cdFx0XHRcdH0pKSBjb250aW51ZTtcblx0XHRcdFx0Y3Vyb1tjdXJrXSA9IHY7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRrID0gZGVjb2RlVVJJQ29tcG9uZW50KGspO1xuXHRcdFx0XG5cdFx0XHQvL3R5cGVvZiBvW2tdID09IFwidW5kZWZpbmVkXCIgfHwgY29uc29sZS5sb2coXCJQcm9wZXJ0eSBcIitrK1wiIGFscmVhZHkgZXhpc3RzIVwiKTtcblx0XHRcdG9ba10gPSB2O1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbztcblx0fSxcblx0XG5cdC8qKiBCdWlsZCBhIGdldCBxdWVyeSBmcm9tIGFuIG9iamVjdC5cblx0ICpcblx0ICogVGhpcyBjb25zdHJ1Y3RzIGEgcXVlcnkgc3RyaW5nIGZyb20gdGhlIGt2IHBhaXJzIGluIGBkYXRhYC4gIENhbGxpbmdcblx0ICogI2dldCBvbiB0aGUgc3RyaW5nIHJldHVybmVkIHNob3VsZCByZXR1cm4gYW4gb2JqZWN0IGlkZW50aWNhbCB0byB0aGUgb25lXG5cdCAqIHBhc3NlZCBpbiBleGNlcHQgYWxsIG5vbi1ib29sZWFuIHNjYWxhciB0eXBlcyBiZWNvbWUgc3RyaW5ncyBhbmQgYWxsXG5cdCAqIG9iamVjdCB0eXBlcyBiZWNvbWUgYXJyYXlzIChub24taW50ZWdlciBrZXlzIGFyZSBzdGlsbCBwcmVzZW50LCBzZWVcblx0ICogI2dldCdzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscykuXG5cdCAqXG5cdCAqIFRoaXMgYWx3YXlzIHVzZXMgYXJyYXkgc3ludGF4IGZvciBkZXNjcmliaW5nIGFycmF5cy4gIElmIHlvdSB3YW50IHRvXG5cdCAqIHNlcmlhbGl6ZSB0aGVtIGRpZmZlcmVudGx5IChsaWtlIGhhdmluZyB0aGUgdmFsdWUgYmUgYSBKU09OIGFycmF5IGFuZFxuXHQgKiBoYXZlIGEgcGxhaW4ga2V5KSB5b3Ugd2lsbCBuZWVkIHRvIGRvIHRoYXQgYmVmb3JlIHBhc3NpbmcgaXQgaW4uXG5cdCAqXG5cdCAqIEFsbCBrZXlzIGFuZCB2YWx1ZXMgYXJlIHN1cHBvcnRlZCAoYmluYXJ5IGRhdGEgYW55b25lPykgYXMgdGhleSBhcmVcblx0ICogcHJvcGVybHkgVVJMLWVuY29kZWQgYW5kICNnZXQgcHJvcGVybHkgZGVjb2Rlcy5cblx0ICpcblx0ICogQHBhcmFte09iamVjdH0gZGF0YSBUaGUga3YgcGFpcnMuXG5cdCAqIEBwYXJhbXtzdHJpbmd9IHByZWZpeCBUaGUgcHJvcGVybHkgZW5jb2RlZCBhcnJheSBrZXkgdG8gcHV0IHRoZVxuXHQgKiAgIHByb3BlcnRpZXMuICBNYWlubHkgaW50ZW5kZWQgZm9yIGludGVybmFsIHVzZS5cblx0ICogQHJldHVybntzdHJpbmd9IEEgVVJMLXNhZmUgc3RyaW5nLlxuXHQgKi9cblx0XCJidWlsZGdldFwiOiBmdW5jdGlvbihkYXRhLCBwcmVmaXgpe1xuXHRcdHZhciBpdG1zID0gW107XG5cdFx0Zm9yICggdmFyIGsgaW4gZGF0YSApXG5cdFx0e1xuXHRcdFx0dmFyIGVrID0gZW5jb2RlVVJJQ29tcG9uZW50KGspO1xuXHRcdFx0aWYgKCB0eXBlb2YgcHJlZml4ICE9IFwidW5kZWZpbmVkXCIgKVxuXHRcdFx0XHRlayA9IHByZWZpeCtcIltcIitlaytcIl1cIjtcblx0XHRcdFxuXHRcdFx0dmFyIHYgPSBkYXRhW2tdO1xuXHRcdFx0XG5cdFx0XHRzd2l0Y2ggKHR5cGVvZiB2KVxuXHRcdFx0e1xuXHRcdFx0XHRjYXNlICdib29sZWFuJzpcblx0XHRcdFx0XHRpZih2KSBpdG1zLnB1c2goZWspO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0XHRcdHYgPSB2LnRvU3RyaW5nKCk7XG5cdFx0XHRcdGNhc2UgJ3N0cmluZyc6XG5cdFx0XHRcdFx0aXRtcy5wdXNoKGVrK1wiPVwiK2VuY29kZVVSSUNvbXBvbmVudCh2KSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ29iamVjdCc6XG5cdFx0XHRcdFx0aXRtcy5wdXNoKHNlbGZbXCJidWlsZGdldFwiXSh2LCBlaykpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gaXRtcy5qb2luKFwiJlwiKTtcblx0fSxcblx0XG5cdC8qKiBQYXJzZSBhIFVSTFxuXHQgKiBcblx0ICogVGhpcyBicmVha3MgdXAgYSBVUkwgaW50byBjb21wb25lbnRzLiAgSXQgYXR0ZW1wdHMgdG8gYmUgdmVyeSBsaWJlcmFsXG5cdCAqIGFuZCByZXR1cm5zIHRoZSBiZXN0IHJlc3VsdCBpbiBtb3N0IGNhc2VzLiAgVGhpcyBtZWFucyB0aGF0IHlvdSBjYW5cblx0ICogb2Z0ZW4gcGFzcyBpbiBwYXJ0IG9mIGEgVVJMIGFuZCBnZXQgY29ycmVjdCBjYXRlZ29yaWVzIGJhY2suICBOb3RhYmx5LFxuXHQgKiB0aGlzIHdvcmtzIGZvciBlbWFpbHMgYW5kIEphYmJlciBJRHMsIGFzIHdlbGwgYXMgYWRkaW5nIGEgJz8nIHRvIHRoZVxuXHQgKiBiZWdpbm5pbmcgb2YgYSBzdHJpbmcgd2lsbCBwYXJzZSB0aGUgd2hvbGUgdGhpbmcgYXMgYSBxdWVyeSBzdHJpbmcuICBJZlxuXHQgKiBhbiBpdGVtIGlzIG5vdCBmb3VuZCB0aGUgcHJvcGVydHkgd2lsbCBiZSB1bmRlZmluZWQuICBJbiBzb21lIGNhc2VzIGFuXG5cdCAqIGVtcHR5IHN0cmluZyB3aWxsIGJlIHJldHVybmVkIGlmIHRoZSBzdXJyb3VuZGluZyBzeW50YXggYnV0IHRoZSBhY3R1YWxcblx0ICogdmFsdWUgaXMgZW1wdHkgKGV4YW1wbGU6IFwiOi8vZXhhbXBsZS5jb21cIiB3aWxsIGdpdmUgYSBlbXB0eSBzdHJpbmcgZm9yXG5cdCAqIHNjaGVtZS4pICBOb3RhYmx5IHRoZSBob3N0IG5hbWUgd2lsbCBhbHdheXMgYmUgc2V0IHRvIHNvbWV0aGluZy5cblx0ICogXG5cdCAqIFJldHVybmVkIHByb3BlcnRpZXMuXG5cdCAqIFxuXHQgKiAtICoqc2NoZW1lOioqIFRoZSB1cmwgc2NoZW1lLiAoZXg6IFwibWFpbHRvXCIgb3IgXCJodHRwc1wiKVxuXHQgKiAtICoqdXNlcjoqKiBUaGUgdXNlcm5hbWUuXG5cdCAqIC0gKipwYXNzOioqIFRoZSBwYXNzd29yZC5cblx0ICogLSAqKmhvc3Q6KiogVGhlIGhvc3RuYW1lLiAoZXg6IFwibG9jYWxob3N0XCIsIFwiMTIzLjQ1Ni43LjhcIiBvciBcImV4YW1wbGUuY29tXCIpXG5cdCAqIC0gKipwb3J0OioqIFRoZSBwb3J0LCBhcyBhIG51bWJlci4gKGV4OiAxMzM3KVxuXHQgKiAtICoqcGF0aDoqKiBUaGUgcGF0aC4gKGV4OiBcIi9cIiBvciBcIi9hYm91dC5odG1sXCIpXG5cdCAqIC0gKipxdWVyeToqKiBcIlRoZSBxdWVyeSBzdHJpbmcuIChleDogXCJmb289YmFyJnY9MTcmZm9ybWF0PWpzb25cIilcblx0ICogLSAqKmdldDoqKiBUaGUgcXVlcnkgc3RyaW5nIHBhcnNlZCB3aXRoIGdldC4gIElmIGBvcHQuZ2V0YCBpcyBgZmFsc2VgIHRoaXNcblx0ICogICB3aWxsIGJlIGFic2VudFxuXHQgKiAtICoqaGFzaDoqKiBUaGUgdmFsdWUgYWZ0ZXIgdGhlIGhhc2guIChleDogXCJteWFuY2hvclwiKVxuXHQgKiAgIGJlIHVuZGVmaW5lZCBldmVuIGlmIGBxdWVyeWAgaXMgc2V0LlxuXHQgKlxuXHQgKiBAcGFyYW17c3RyaW5nfSB1cmwgVGhlIFVSTCB0byBwYXJzZS5cblx0ICogQHBhcmFte3tnZXQ6T2JqZWN0fT19IG9wdCBPcHRpb25zOlxuXHQgKlxuXHQgKiAtIGdldDogQW4gb3B0aW9ucyBhcmd1bWVudCB0byBiZSBwYXNzZWQgdG8gI2dldCBvciBmYWxzZSB0byBub3QgY2FsbCAjZ2V0LlxuXHQgKiAgICAqKkRPIE5PVCoqIHNldCBgZnVsbGAuXG5cdCAqXG5cdCAqIEByZXR1cm57IU9iamVjdH0gQW4gb2JqZWN0IHdpdGggdGhlIHBhcnNlZCB2YWx1ZXMuXG5cdCAqL1xuXHRcInBhcnNlXCI6IGZ1bmN0aW9uKHVybCwgb3B0KSB7XG5cdFx0XG5cdFx0aWYgKCB0eXBlb2Ygb3B0ID09IFwidW5kZWZpbmVkXCIgKSBvcHQgPSB7fTtcblx0XHRcblx0XHR2YXIgbWQgPSB1cmwubWF0Y2gocmVnZXgpIHx8IFtdO1xuXHRcdFxuXHRcdHZhciByID0ge1xuXHRcdFx0XCJ1cmxcIjogICAgdXJsLFxuXHRcdFx0XG5cdFx0XHRcInNjaGVtZVwiOiBtZFsxXSxcblx0XHRcdFwidXNlclwiOiAgIG1kWzJdLFxuXHRcdFx0XCJwYXNzXCI6ICAgbWRbM10sXG5cdFx0XHRcImhvc3RcIjogICBtZFs0XSxcblx0XHRcdFwicG9ydFwiOiAgIG1kWzVdICYmICttZFs1XSxcblx0XHRcdFwicGF0aFwiOiAgIG1kWzZdLFxuXHRcdFx0XCJxdWVyeVwiOiAgbWRbN10sXG5cdFx0XHRcImhhc2hcIjogICBtZFs4XSxcblx0XHR9O1xuXHRcdFxuXHRcdGlmICggb3B0LmdldCAhPT0gZmFsc2UgKVxuXHRcdFx0cltcImdldFwiXSA9IHJbXCJxdWVyeVwiXSAmJiBzZWxmW1wiZ2V0XCJdKHJbXCJxdWVyeVwiXSwgb3B0LmdldCk7XG5cdFx0XG5cdFx0cmV0dXJuIHI7XG5cdH0sXG5cdFxuXHQvKiogQnVpbGQgYSBVUkwgZnJvbSBjb21wb25lbnRzLlxuXHQgKiBcblx0ICogVGhpcyBwaWVjZXMgdG9nZXRoZXIgYSB1cmwgZnJvbSB0aGUgcHJvcGVydGllcyBvZiB0aGUgcGFzc2VkIGluIG9iamVjdC5cblx0ICogSW4gZ2VuZXJhbCBwYXNzaW5nIHRoZSByZXN1bHQgb2YgYHBhcnNlKClgIHNob3VsZCByZXR1cm4gdGhlIFVSTC4gIFRoZXJlXG5cdCAqIG1heSBkaWZmZXJlbmNlcyBpbiB0aGUgZ2V0IHN0cmluZyBhcyB0aGUga2V5cyBhbmQgdmFsdWVzIG1pZ2h0IGJlIG1vcmVcblx0ICogZW5jb2RlZCB0aGVuIHRoZXkgd2VyZSBvcmlnaW5hbGx5IHdlcmUuICBIb3dldmVyLCBjYWxsaW5nIGBnZXQoKWAgb24gdGhlXG5cdCAqIHR3byB2YWx1ZXMgc2hvdWxkIHlpZWxkIHRoZSBzYW1lIHJlc3VsdC5cblx0ICogXG5cdCAqIEhlcmUgaXMgaG93IHRoZSBwYXJhbWV0ZXJzIGFyZSB1c2VkLlxuXHQgKiBcblx0ICogIC0gdXJsOiBVc2VkIG9ubHkgaWYgbm8gb3RoZXIgdmFsdWVzIGFyZSBwcm92aWRlZC4gIElmIHRoYXQgaXMgdGhlIGNhc2Vcblx0ICogICAgIGB1cmxgIHdpbGwgYmUgcmV0dXJuZWQgdmVyYmF0aW0uXG5cdCAqICAtIHNjaGVtZTogVXNlZCBpZiBkZWZpbmVkLlxuXHQgKiAgLSB1c2VyOiBVc2VkIGlmIGRlZmluZWQuXG5cdCAqICAtIHBhc3M6IFVzZWQgaWYgZGVmaW5lZC5cblx0ICogIC0gaG9zdDogVXNlZCBpZiBkZWZpbmVkLlxuXHQgKiAgLSBwYXRoOiBVc2VkIGlmIGRlZmluZWQuXG5cdCAqICAtIHF1ZXJ5OiBVc2VkIG9ubHkgaWYgYGdldGAgaXMgbm90IHByb3ZpZGVkIGFuZCBub24tZW1wdHkuXG5cdCAqICAtIGdldDogVXNlZCBpZiBub24tZW1wdHkuICBQYXNzZWQgdG8gI2J1aWxkZ2V0IGFuZCB0aGUgcmVzdWx0IGlzIHVzZWRcblx0ICogICAgYXMgdGhlIHF1ZXJ5IHN0cmluZy5cblx0ICogIC0gaGFzaDogVXNlZCBpZiBkZWZpbmVkLlxuXHQgKiBcblx0ICogVGhlc2UgYXJlIHRoZSBvcHRpb25zIHRoYXQgYXJlIHZhbGlkIG9uIHRoZSBvcHRpb25zIG9iamVjdC5cblx0ICogXG5cdCAqICAtIHVzZWVtcHR5Z2V0OiBJZiB0cnV0aHksIGEgcXVlc3Rpb24gbWFyayB3aWxsIGJlIGFwcGVuZGVkIGZvciBlbXB0eSBnZXRcblx0ICogICAgc3RyaW5ncy4gIFRoaXMgbm90YWJseSBtYWtlcyBgYnVpbGQoKWAgYW5kIGBwYXJzZSgpYCBmdWxseSBzeW1tZXRyaWMuXG5cdCAqXG5cdCAqIEBwYXJhbXtPYmplY3R9IGRhdGEgVGhlIHBpZWNlcyBvZiB0aGUgVVJMLlxuXHQgKiBAcGFyYW17T2JqZWN0fSBvcHQgT3B0aW9ucyBmb3IgYnVpbGRpbmcgdGhlIHVybC5cblx0ICogQHJldHVybntzdHJpbmd9IFRoZSBVUkwuXG5cdCAqL1xuXHRcImJ1aWxkXCI6IGZ1bmN0aW9uKGRhdGEsIG9wdCl7XG5cdFx0b3B0ID0gb3B0IHx8IHt9O1xuXHRcdFxuXHRcdHZhciByID0gXCJcIjtcblx0XHRcblx0XHRpZiAoIHR5cGVvZiBkYXRhW1wic2NoZW1lXCJdICE9IFwidW5kZWZpbmVkXCIgKVxuXHRcdHtcblx0XHRcdHIgKz0gZGF0YVtcInNjaGVtZVwiXTtcblx0XHRcdHIgKz0gKG5vc2xhc2guaW5kZXhPZihkYXRhW1wic2NoZW1lXCJdKT49MCk/XCI6XCI6XCI6Ly9cIjtcblx0XHR9XG5cdFx0aWYgKCB0eXBlb2YgZGF0YVtcInVzZXJcIl0gIT0gXCJ1bmRlZmluZWRcIiApXG5cdFx0e1xuXHRcdFx0ciArPSBkYXRhW1widXNlclwiXTtcblx0XHRcdGlmICggdHlwZW9mIGRhdGFbXCJwYXNzXCJdID09IFwidW5kZWZpbmVkXCIgKVxuXHRcdFx0e1xuXHRcdFx0XHRyICs9IFwiQFwiO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIHR5cGVvZiBkYXRhW1wicGFzc1wiXSAhPSBcInVuZGVmaW5lZFwiICkgciArPSBcIjpcIiArIGRhdGFbXCJwYXNzXCJdICsgXCJAXCI7XG5cdFx0aWYgKCB0eXBlb2YgZGF0YVtcImhvc3RcIl0gIT0gXCJ1bmRlZmluZWRcIiApIHIgKz0gZGF0YVtcImhvc3RcIl07XG5cdFx0aWYgKCB0eXBlb2YgZGF0YVtcInBvcnRcIl0gIT0gXCJ1bmRlZmluZWRcIiApIHIgKz0gXCI6XCIgKyBkYXRhW1wicG9ydFwiXTtcblx0XHRpZiAoIHR5cGVvZiBkYXRhW1wicGF0aFwiXSAhPSBcInVuZGVmaW5lZFwiICkgciArPSBkYXRhW1wicGF0aFwiXTtcblx0XHRcblx0XHRpZiAob3B0W1widXNlZW1wdHlnZXRcIl0pXG5cdFx0e1xuXHRcdFx0aWYgICAgICAoIHR5cGVvZiBkYXRhW1wiZ2V0XCJdICAgIT0gXCJ1bmRlZmluZWRcIiApIHIgKz0gXCI/XCIgKyBzZWxmW1wiYnVpbGRnZXRcIl0oZGF0YVtcImdldFwiXSk7XG5cdFx0XHRlbHNlIGlmICggdHlwZW9mIGRhdGFbXCJxdWVyeVwiXSAhPSBcInVuZGVmaW5lZFwiICkgciArPSBcIj9cIiArIGRhdGFbXCJxdWVyeVwiXTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdC8vIElmIC5nZXQgdXNlIGl0LiAgSWYgLmdldCBsZWFkcyB0byBlbXB0eSwgdXNlIC5xdWVyeS5cblx0XHRcdHZhciBxID0gZGF0YVtcImdldFwiXSAmJiBzZWxmW1wiYnVpbGRnZXRcIl0oZGF0YVtcImdldFwiXSkgfHwgZGF0YVtcInF1ZXJ5XCJdO1xuXHRcdFx0aWYgKHEpIHIgKz0gXCI/XCIgKyBxO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoIHR5cGVvZiBkYXRhW1wiaGFzaFwiXSAhPSBcInVuZGVmaW5lZFwiICkgciArPSBcIiNcIiArIGRhdGFbXCJoYXNoXCJdO1xuXHRcdFxuXHRcdHJldHVybiByIHx8IGRhdGFbXCJ1cmxcIl0gfHwgXCJcIjtcblx0fSxcbn07XG5cbmlmICggdHlwZW9mIGRlZmluZSAhPSBcInVuZGVmaW5lZFwiICYmIGRlZmluZVtcImFtZFwiXSApIGRlZmluZShzZWxmKTtcbmVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgKSBtb2R1bGVbJ2V4cG9ydHMnXSA9IHNlbGY7XG5lbHNlIHdpbmRvd1tcInVybFwiXSA9IHNlbGY7XG5cbn0oKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi91cmwuanMvdXJsLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kdWxlKSB7XHJcblx0aWYoIW1vZHVsZS53ZWJwYWNrUG9seWZpbGwpIHtcclxuXHRcdG1vZHVsZS5kZXByZWNhdGUgPSBmdW5jdGlvbigpIHt9O1xyXG5cdFx0bW9kdWxlLnBhdGhzID0gW107XHJcblx0XHQvLyBtb2R1bGUucGFyZW50ID0gdW5kZWZpbmVkIGJ5IGRlZmF1bHRcclxuXHRcdG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xyXG5cdFx0bW9kdWxlLndlYnBhY2tQb2x5ZmlsbCA9IDE7XHJcblx0fVxyXG5cdHJldHVybiBtb2R1bGU7XHJcbn1cclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spL2J1aWxkaW4vbW9kdWxlLmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHsgdGhyb3cgbmV3IEVycm9yKFwiZGVmaW5lIGNhbm5vdCBiZSB1c2VkIGluZGlyZWN0XCIpOyB9O1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9hbWQtZGVmaW5lLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIl0sInNvdXJjZVJvb3QiOiIifQ==