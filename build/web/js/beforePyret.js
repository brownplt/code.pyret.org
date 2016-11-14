/******/ (function(modules) { // webpackBootstrap
/******/ 	var parentHotUpdateCallback = this["webpackHotUpdate"];
/******/ 	this["webpackHotUpdate"] = function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
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
/******/ 	var hotCurrentHash = "1d8360cfadaea7a30858"; // eslint-disable-line no-unused-vars
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMWQ4MzYwY2ZhZGFlYTdhMzA4NTgiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dlYi9qcy9iZWZvcmVQeXJldC5qcyIsIndlYnBhY2s6Ly8vLi9+L3VybC5qcy91cmwuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL21vZHVsZS5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vYW1kLWRlZmluZS5qcyJdLCJuYW1lcyI6WyJzaGFyZUFQSSIsIm1ha2VTaGFyZUFQSSIsImVudl9DVVJSRU5UX1BZUkVUX1JFTEVBU0UiLCJ1cmwiLCJyZXF1aXJlIiwiTE9HIiwid2luZG93IiwiY3RfbG9nIiwiY29uc29sZSIsImxvZyIsImFwcGx5IiwiYXJndW1lbnRzIiwiY3RfZXJyb3IiLCJlcnJvciIsImluaXRpYWxQYXJhbXMiLCJwYXJzZSIsImRvY3VtZW50IiwibG9jYXRpb24iLCJocmVmIiwicGFyYW1zIiwiaGlnaGxpZ2h0TW9kZSIsImNsZWFyRmxhc2giLCIkIiwiZW1wdHkiLCJzdGlja0Vycm9yIiwibWVzc2FnZSIsIm1vcmUiLCJlcnIiLCJhZGRDbGFzcyIsInRleHQiLCJhdHRyIiwidG9vbHRpcCIsInByZXBlbmQiLCJmbGFzaEVycm9yIiwiZmFkZU91dCIsImZsYXNoTWVzc2FnZSIsIm1zZyIsInN0aWNrTWVzc2FnZSIsIm1rV2FybmluZ1VwcGVyIiwibWtXYXJuaW5nTG93ZXIiLCJiaW5kIiwiRG9jdW1lbnRzIiwiZG9jdW1lbnRzIiwiTWFwIiwicHJvdG90eXBlIiwiaGFzIiwibmFtZSIsImdldCIsInNldCIsImRvYyIsImxvZ2dlciIsImlzRGV0YWlsZWQiLCJ2YWx1ZSIsImdldFZhbHVlIiwiZGVsZXRlIiwiZm9yRWFjaCIsImYiLCJDUE8iLCJzYXZlIiwiYXV0b1NhdmUiLCJtZXJnZSIsIm9iaiIsImV4dGVuc2lvbiIsIm5ld29iaiIsIk9iamVjdCIsImtleXMiLCJrIiwiYW5pbWF0aW9uRGl2IiwiY2xvc2VBbmltYXRpb25JZk9wZW4iLCJkaWFsb2ciLCJtYWtlRWRpdG9yIiwiY29udGFpbmVyIiwib3B0aW9ucyIsImluaXRpYWwiLCJoYXNPd25Qcm9wZXJ0eSIsInRleHRhcmVhIiwialF1ZXJ5IiwidmFsIiwiYXBwZW5kIiwicnVuRnVuIiwiY29kZSIsInJlcGxPcHRpb25zIiwicnVuIiwiY20iLCJDTSIsInVzZUxpbmVOdW1iZXJzIiwic2ltcGxlRWRpdG9yIiwidXNlRm9sZGluZyIsImd1dHRlcnMiLCJyZWluZGVudEFsbExpbmVzIiwibGFzdCIsImxpbmVDb3VudCIsIm9wZXJhdGlvbiIsImkiLCJpbmRlbnRMaW5lIiwiY21PcHRpb25zIiwiZXh0cmFLZXlzIiwiaW5kZW50VW5pdCIsInRhYlNpemUiLCJ2aWV3cG9ydE1hcmdpbiIsIkluZmluaXR5IiwibGluZU51bWJlcnMiLCJtYXRjaEtleXdvcmRzIiwibWF0Y2hCcmFja2V0cyIsInN0eWxlU2VsZWN0ZWRUZXh0IiwiZm9sZEd1dHRlciIsImxpbmVXcmFwcGluZyIsImxvZ2dpbmciLCJDb2RlTWlycm9yIiwiZnJvbVRleHRBcmVhIiwiQ01ibG9ja3MiLCJDb2RlTWlycm9yQmxvY2tzIiwidW5kZWZpbmVkIiwid2lsbEluc2VydE5vZGUiLCJzb3VyY2VOb2RlVGV4dCIsInNvdXJjZU5vZGUiLCJkZXN0aW5hdGlvbiIsImxpbmUiLCJlZGl0b3IiLCJnZXRMaW5lIiwiY2giLCJtYXRjaCIsImxlbmd0aCIsImJsb2Nrc0VkaXRvciIsImNoYW5nZU1vZGUiLCJtb2RlIiwiYXN0Iiwic2V0QmxvY2tNb2RlIiwiZGlzcGxheSIsIndyYXBwZXIiLCJhcHBlbmRDaGlsZCIsInJlZnJlc2giLCJmb2N1cyIsIlJVTl9DT0RFIiwic3RvcmFnZUFQSSIsInRoZW4iLCJhcGkiLCJjb2xsZWN0aW9uIiwic2hvdyIsImhpZGUiLCJnZXRDb2xsZWN0aW9uTGluayIsImxpbmsiLCJmYWlsIiwiY2xpY2siLCJjcmVhdGVQcm9ncmFtQ29sbGVjdGlvbkFQSSIsInRvTG9hZCIsImdldEZpbGVCeUlkIiwibG9hZFByb2dyYW0iLCJwcm9ncmFtVG9TYXZlIiwiUSIsImZjYWxsIiwiY29weU9uU2F2ZSIsImluaXRpYWxQcm9ncmFtIiwicHJvZ3JhbUxvYWQiLCJwIiwic2hvd1NoYXJlQ29udGFpbmVyIiwiZ2V0U2hhcmVkRmlsZUJ5SWQiLCJzZXRUaXRsZSIsInByb2dOYW1lIiwidGl0bGUiLCJkb3dubG9hZEVsdCIsImNvbnRlbnRzIiwiZG93bmxvYWRCbG9iIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwiQmxvYiIsInR5cGUiLCJmaWxlbmFtZSIsImluZGV4T2YiLCJkb3dubG9hZCIsImdldE5hbWUiLCJnZXRDb250ZW50cyIsInByb2dyYW1Mb2FkZWQiLCJtYWtlU2hhcmVMaW5rIiwibmFtZU9yVW50aXRsZWQiLCJzYXZlZFByb2dyYW0iLCJyZW5hbWUiLCJuZXdQIiwiaGlzdG9yeSIsInB1c2hTdGF0ZSIsImdldFVuaXF1ZUlkIiwiaGFzaCIsInByb2dyYW1OYW1lIiwiY3JlYXRlRmlsZSIsIm1ha2VIb3Zlck1lbnUiLCJjb2RlQ29udGFpbmVyIiwicnVuQnV0dG9uIiwiaW5pdGlhbEdhcyIsInNldE9wdGlvbiIsImMiLCJnZXREb2MiLCJjbGVhckhpc3RvcnkiLCJzZXRWYWx1ZSIsInB5cmV0TG9hZCIsImNyZWF0ZUVsZW1lbnQiLCJlbnZfUFlSRVQiLCJzcmMiLCJib2R5Iiwib24iLCJmaW4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBLDhGQUFzRjtBQUN0RjtBQUNBO0FBQ0E7O0FBRUEsb0RBQTRDO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtEQUEwQztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxjQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQjtBQUMzQjtBQUNBLFlBQUk7QUFDSjtBQUNBLFdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0Esc0RBQThDO0FBQzlDO0FBQ0EscUNBQTZCOztBQUU3QiwrQ0FBdUM7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQU87QUFDUCxjQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFNO0FBQ047QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0wsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDhDQUFzQztBQUN0QztBQUNBO0FBQ0EscUNBQTZCO0FBQzdCLHFDQUE2QjtBQUM3QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUFvQixnQkFBZ0I7QUFDcEM7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUFvQixnQkFBZ0I7QUFDcEM7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLGFBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsYUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlCQUFpQiw4QkFBOEI7QUFDL0M7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMEJBQWtCLHFCQUFxQjtBQUN2QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQUk7QUFDSjs7QUFFQSw0REFBb0Q7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBbUIsMkJBQTJCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLDBCQUFrQixjQUFjO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5QkFBaUIsNEJBQTRCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFNO0FBQ047O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLDBCQUFrQiw0QkFBNEI7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsMEJBQWtCLDRCQUE0QjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBbUIsdUNBQXVDO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUFtQix1Q0FBdUM7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUFtQixzQkFBc0I7QUFDekM7QUFDQTtBQUNBO0FBQ0EsZUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHlCQUFpQix3Q0FBd0M7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxlQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLDhDQUFzQyx1QkFBdUI7O0FBRTdEO0FBQ0E7Ozs7Ozs7OztBQy9qQkE7O0FBRUE7QUFDQSxLQUFJQSxXQUFXQyxhQUFhQyx5QkFBYixDQUFmOztBQUVBLEtBQUlDLE1BQU0sbUJBQUFDLENBQVEsQ0FBUixDQUFWOztBQUVBLEtBQU1DLE1BQU0sSUFBWjtBQUNBQyxRQUFPQyxNQUFQLEdBQWdCLFlBQVMsYUFBZTtBQUN0QyxPQUFJRCxPQUFPRSxPQUFQLElBQWtCSCxHQUF0QixFQUEyQjtBQUN6QkcsYUFBUUMsR0FBUixDQUFZQyxLQUFaLENBQWtCRixPQUFsQixFQUEyQkcsU0FBM0I7QUFDRDtBQUNGLEVBSkQ7O0FBTUFMLFFBQU9NLFFBQVAsR0FBa0IsWUFBUyxhQUFlO0FBQ3hDLE9BQUlOLE9BQU9FLE9BQVAsSUFBa0JILEdBQXRCLEVBQTJCO0FBQ3pCRyxhQUFRSyxLQUFSLENBQWNILEtBQWQsQ0FBb0JGLE9BQXBCLEVBQTZCRyxTQUE3QjtBQUNEO0FBQ0YsRUFKRDtBQUtBLEtBQUlHLGdCQUFnQlgsSUFBSVksS0FBSixDQUFVQyxTQUFTQyxRQUFULENBQWtCQyxJQUE1QixDQUFwQjtBQUNBLEtBQUlDLFNBQVNoQixJQUFJWSxLQUFKLENBQVUsT0FBT0QsY0FBYyxNQUFkLENBQWpCLENBQWI7QUFDQVIsUUFBT2MsYUFBUCxHQUF1QixNQUF2QixDLENBQStCO0FBQy9CZCxRQUFPZSxVQUFQLEdBQW9CLFlBQVc7QUFDN0JDLEtBQUUsbUJBQUYsRUFBdUJDLEtBQXZCO0FBQ0QsRUFGRDtBQUdBakIsUUFBT2tCLFVBQVAsR0FBb0IsVUFBU0MsT0FBVCxFQUFrQkMsSUFBbEIsRUFBd0I7QUFDMUNMO0FBQ0EsT0FBSU0sTUFBTUwsRUFBRSxPQUFGLEVBQVdNLFFBQVgsQ0FBb0IsT0FBcEIsRUFBNkJDLElBQTdCLENBQWtDSixPQUFsQyxDQUFWO0FBQ0EsT0FBR0MsSUFBSCxFQUFTO0FBQ1BDLFNBQUlHLElBQUosQ0FBUyxPQUFULEVBQWtCSixJQUFsQjtBQUNEO0FBQ0RDLE9BQUlJLE9BQUo7QUFDQVQsS0FBRSxtQkFBRixFQUF1QlUsT0FBdkIsQ0FBK0JMLEdBQS9CO0FBQ0QsRUFSRDtBQVNBckIsUUFBTzJCLFVBQVAsR0FBb0IsVUFBU1IsT0FBVCxFQUFrQjtBQUNwQ0o7QUFDQSxPQUFJTSxNQUFNTCxFQUFFLE9BQUYsRUFBV00sUUFBWCxDQUFvQixPQUFwQixFQUE2QkMsSUFBN0IsQ0FBa0NKLE9BQWxDLENBQVY7QUFDQUgsS0FBRSxtQkFBRixFQUF1QlUsT0FBdkIsQ0FBK0JMLEdBQS9CO0FBQ0FBLE9BQUlPLE9BQUosQ0FBWSxJQUFaO0FBQ0QsRUFMRDtBQU1BNUIsUUFBTzZCLFlBQVAsR0FBc0IsVUFBU1YsT0FBVCxFQUFrQjtBQUN0Q0o7QUFDQSxPQUFJZSxNQUFNZCxFQUFFLE9BQUYsRUFBV00sUUFBWCxDQUFvQixRQUFwQixFQUE4QkMsSUFBOUIsQ0FBbUNKLE9BQW5DLENBQVY7QUFDQUgsS0FBRSxtQkFBRixFQUF1QlUsT0FBdkIsQ0FBK0JJLEdBQS9CO0FBQ0FBLE9BQUlGLE9BQUosQ0FBWSxJQUFaO0FBQ0QsRUFMRDtBQU1BNUIsUUFBTytCLFlBQVAsR0FBc0IsVUFBU1osT0FBVCxFQUFrQjtBQUN0Q0o7QUFDQSxPQUFJTSxNQUFNTCxFQUFFLE9BQUYsRUFBV00sUUFBWCxDQUFvQixRQUFwQixFQUE4QkMsSUFBOUIsQ0FBbUNKLE9BQW5DLENBQVY7QUFDQUgsS0FBRSxtQkFBRixFQUF1QlUsT0FBdkIsQ0FBK0JMLEdBQS9CO0FBQ0QsRUFKRDtBQUtBckIsUUFBT2dDLGNBQVAsR0FBd0IsWUFBVTtBQUFDLFVBQU9oQixFQUFFLDZCQUFGLENBQVA7QUFBeUMsRUFBNUU7QUFDQWhCLFFBQU9pQyxjQUFQLEdBQXdCLFlBQVU7QUFBQyxVQUFPakIsRUFBRSw2QkFBRixDQUFQO0FBQXlDLEVBQTVFOztBQUVBQSxHQUFFaEIsTUFBRixFQUFVa0MsSUFBVixDQUFlLGNBQWYsRUFBK0IsWUFBVztBQUN4QyxVQUFPLDZKQUFQO0FBQ0QsRUFGRDs7QUFJQSxLQUFJQyxZQUFZLFlBQVc7O0FBRXpCLFlBQVNBLFNBQVQsR0FBcUI7QUFDbkIsVUFBS0MsU0FBTCxHQUFpQixJQUFJQyxHQUFKLEVBQWpCO0FBQ0Q7O0FBRURGLGFBQVVHLFNBQVYsQ0FBb0JDLEdBQXBCLEdBQTBCLFVBQVVDLElBQVYsRUFBZ0I7QUFDeEMsWUFBTyxLQUFLSixTQUFMLENBQWVHLEdBQWYsQ0FBbUJDLElBQW5CLENBQVA7QUFDRCxJQUZEOztBQUlBTCxhQUFVRyxTQUFWLENBQW9CRyxHQUFwQixHQUEwQixVQUFVRCxJQUFWLEVBQWdCO0FBQ3hDLFlBQU8sS0FBS0osU0FBTCxDQUFlSyxHQUFmLENBQW1CRCxJQUFuQixDQUFQO0FBQ0QsSUFGRDs7QUFJQUwsYUFBVUcsU0FBVixDQUFvQkksR0FBcEIsR0FBMEIsVUFBVUYsSUFBVixFQUFnQkcsR0FBaEIsRUFBcUI7QUFDN0MsU0FBR0MsT0FBT0MsVUFBVixFQUNFRCxPQUFPekMsR0FBUCxDQUFXLFNBQVgsRUFBc0IsRUFBQ3FDLE1BQU1BLElBQVAsRUFBYU0sT0FBT0gsSUFBSUksUUFBSixFQUFwQixFQUF0QjtBQUNGLFlBQU8sS0FBS1gsU0FBTCxDQUFlTSxHQUFmLENBQW1CRixJQUFuQixFQUF5QkcsR0FBekIsQ0FBUDtBQUNELElBSkQ7O0FBTUFSLGFBQVVHLFNBQVYsQ0FBb0JVLE1BQXBCLEdBQTZCLFVBQVVSLElBQVYsRUFBZ0I7QUFDM0MsU0FBR0ksT0FBT0MsVUFBVixFQUNFRCxPQUFPekMsR0FBUCxDQUFXLFNBQVgsRUFBc0IsRUFBQ3FDLE1BQU1BLElBQVAsRUFBdEI7QUFDRixZQUFPLEtBQUtKLFNBQUwsQ0FBZVksTUFBZixDQUFzQlIsSUFBdEIsQ0FBUDtBQUNELElBSkQ7O0FBTUFMLGFBQVVHLFNBQVYsQ0FBb0JXLE9BQXBCLEdBQThCLFVBQVVDLENBQVYsRUFBYTtBQUN6QyxZQUFPLEtBQUtkLFNBQUwsQ0FBZWEsT0FBZixDQUF1QkMsQ0FBdkIsQ0FBUDtBQUNELElBRkQ7O0FBSUEsVUFBT2YsU0FBUDtBQUNELEVBL0JlLEVBQWhCOztBQWlDQW5DLFFBQU9tRCxHQUFQLEdBQWE7QUFDWEMsU0FBTSxnQkFBVyxDQUFFLENBRFI7QUFFWEMsYUFBVSxvQkFBVyxDQUFFLENBRlo7QUFHWGpCLGNBQVksSUFBSUQsU0FBSjtBQUhELEVBQWI7QUFLQW5CLEdBQUUsWUFBVztBQUNYLFlBQVNzQyxLQUFULENBQWVDLEdBQWYsRUFBb0JDLFNBQXBCLEVBQStCO0FBQzdCLFNBQUlDLFNBQVMsRUFBYjtBQUNBQyxZQUFPQyxJQUFQLENBQVlKLEdBQVosRUFBaUJOLE9BQWpCLENBQXlCLFVBQVNXLENBQVQsRUFBWTtBQUNuQ0gsY0FBT0csQ0FBUCxJQUFZTCxJQUFJSyxDQUFKLENBQVo7QUFDRCxNQUZEO0FBR0FGLFlBQU9DLElBQVAsQ0FBWUgsU0FBWixFQUF1QlAsT0FBdkIsQ0FBK0IsVUFBU1csQ0FBVCxFQUFZO0FBQ3pDSCxjQUFPRyxDQUFQLElBQVlKLFVBQVVJLENBQVYsQ0FBWjtBQUNELE1BRkQ7QUFHQSxZQUFPSCxNQUFQO0FBQ0Q7QUFDRCxPQUFJSSxlQUFlLElBQW5CO0FBQ0EsWUFBU0Msb0JBQVQsR0FBZ0M7QUFDOUIsU0FBR0QsWUFBSCxFQUFpQjtBQUNmQSxvQkFBYTVDLEtBQWI7QUFDQTRDLG9CQUFhRSxNQUFiLENBQW9CLFNBQXBCO0FBQ0FGLHNCQUFlLElBQWY7QUFDRDtBQUNGO0FBQ0RWLE9BQUlhLFVBQUosR0FBaUIsVUFBU0MsU0FBVCxFQUFvQkMsT0FBcEIsRUFBNkI7QUFDNUMsU0FBSUMsVUFBVSxFQUFkO0FBQ0EsU0FBSUQsUUFBUUUsY0FBUixDQUF1QixTQUF2QixDQUFKLEVBQXVDO0FBQ3JDRCxpQkFBVUQsUUFBUUMsT0FBbEI7QUFDRDs7QUFFRCxTQUFJRSxXQUFXQyxPQUFPLFlBQVAsQ0FBZjtBQUNBRCxjQUFTRSxHQUFULENBQWFKLE9BQWI7QUFDQUYsZUFBVU8sTUFBVixDQUFpQkgsUUFBakI7O0FBRUEsU0FBSUksU0FBUyxTQUFUQSxNQUFTLENBQVVDLElBQVYsRUFBZ0JDLFdBQWhCLEVBQTZCO0FBQ3hDVCxlQUFRVSxHQUFSLENBQVlGLElBQVosRUFBa0IsRUFBQ0csSUFBSUMsRUFBTCxFQUFsQixFQUE0QkgsV0FBNUI7QUFDRCxNQUZEOztBQUlBLFNBQUlJLGlCQUFpQixDQUFDYixRQUFRYyxZQUE5QjtBQUNBLFNBQUlDLGFBQWEsQ0FBQ2YsUUFBUWMsWUFBMUI7O0FBRUEsU0FBSUUsVUFBVSxDQUFDaEIsUUFBUWMsWUFBVCxHQUNaLENBQUMsd0JBQUQsRUFBMkIsdUJBQTNCLENBRFksR0FFWixFQUZGOztBQUlBLGNBQVNHLGdCQUFULENBQTBCTixFQUExQixFQUE4QjtBQUM1QixXQUFJTyxPQUFPUCxHQUFHUSxTQUFILEVBQVg7QUFDQVIsVUFBR1MsU0FBSCxDQUFhLFlBQVc7QUFDdEIsY0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlILElBQXBCLEVBQTBCLEVBQUVHLENBQTVCO0FBQStCVixjQUFHVyxVQUFILENBQWNELENBQWQ7QUFBL0I7QUFDRCxRQUZEO0FBR0Q7O0FBRUQsU0FBSUUsWUFBWTtBQUNkQyxrQkFBVztBQUNULHdCQUFlLG9CQUFTYixFQUFULEVBQWE7QUFBRUosa0JBQU9JLEdBQUc5QixRQUFILEVBQVA7QUFBd0IsVUFEN0M7QUFFVCw2QkFBb0Isd0JBQVM4QixFQUFULEVBQWE7QUFBRUosa0JBQU9JLEdBQUc5QixRQUFILEVBQVA7QUFBd0IsVUFGbEQ7QUFHVCxnQkFBTyxZQUhFO0FBSVQsbUJBQVVvQztBQUpELFFBREc7QUFPZFEsbUJBQVksQ0FQRTtBQVFkQyxnQkFBUyxDQVJLO0FBU2RDLHVCQUFnQkMsUUFURjtBQVVkQyxvQkFBYWhCLGNBVkM7QUFXZGlCLHNCQUFlLElBWEQ7QUFZZEMsc0JBQWUsSUFaRDtBQWFkQywwQkFBbUIsSUFiTDtBQWNkQyxtQkFBWWxCLFVBZEU7QUFlZEMsZ0JBQVNBLE9BZks7QUFnQmRrQixxQkFBYyxJQWhCQTtBQWlCZEMsZ0JBQVM7QUFqQkssTUFBaEI7O0FBb0JBWixpQkFBWW5DLE1BQU1tQyxTQUFOLEVBQWlCdkIsUUFBUXVCLFNBQVIsSUFBcUIsRUFBdEMsQ0FBWjs7QUFFQSxTQUFJWCxLQUFLd0IsV0FBV0MsWUFBWCxDQUF3QmxDLFNBQVMsQ0FBVCxDQUF4QixFQUFxQ29CLFNBQXJDLENBQVQ7O0FBRUEsU0FBSWUsUUFBSjs7QUFFQSxTQUFJLE9BQU9DLGdCQUFQLEtBQTRCLFdBQWhDLEVBQTZDO0FBQzNDdkcsZUFBUUMsR0FBUixDQUFZLDRCQUFaO0FBQ0FxRyxrQkFBV0UsU0FBWDtBQUNELE1BSEQsTUFHTztBQUNMRixrQkFBVyxJQUFJQyxnQkFBSixDQUFxQjNCLEVBQXJCLEVBQ1QsVUFEUyxFQUVUO0FBQ0U2Qix5QkFBZ0Isd0JBQVNDLGNBQVQsRUFBeUJDLFVBQXpCLEVBQXFDQyxXQUFyQyxFQUFrRDtBQUNoRSxlQUFJQyxPQUFPakMsR0FBR2tDLE1BQUgsQ0FBVUMsT0FBVixDQUFrQkgsWUFBWUMsSUFBOUIsQ0FBWDtBQUNBLGVBQUlELFlBQVlJLEVBQVosR0FBaUIsQ0FBakIsSUFBc0JILEtBQUtELFlBQVlJLEVBQVosR0FBaUIsQ0FBdEIsRUFBeUJDLEtBQXpCLENBQStCLFFBQS9CLENBQTFCLEVBQW9FO0FBQ2xFO0FBQ0FQLDhCQUFpQixNQUFNQSxjQUF2QjtBQUNEOztBQUVELGVBQUlFLFlBQVlJLEVBQVosR0FBaUJILEtBQUtLLE1BQXRCLElBQWdDTCxLQUFLRCxZQUFZSSxFQUFqQixFQUFxQkMsS0FBckIsQ0FBMkIsUUFBM0IsQ0FBcEMsRUFBMEU7QUFDeEU7QUFDQVAsK0JBQWtCLEdBQWxCO0FBQ0Q7QUFDRCxrQkFBT0EsY0FBUDtBQUNEO0FBYkgsUUFGUyxDQUFYO0FBaUJBOUIsVUFBR3VDLFlBQUgsR0FBa0JiLFFBQWxCO0FBQ0ExQixVQUFHd0MsVUFBSCxHQUFnQixVQUFTQyxJQUFULEVBQWU7QUFDN0IsYUFBSUEsU0FBUyxPQUFiLEVBQXNCO0FBQ3BCQSxrQkFBTyxLQUFQO0FBQ0QsVUFGRCxNQUVPO0FBQ0xmLG9CQUFTZ0IsR0FBVCxHQUFlLElBQWY7QUFDRDtBQUNEaEIsa0JBQVNpQixZQUFULENBQXNCRixJQUF0QjtBQUNELFFBUEQ7QUFRRDs7QUFFRCxTQUFJeEMsY0FBSixFQUFvQjtBQUNsQkQsVUFBRzRDLE9BQUgsQ0FBV0MsT0FBWCxDQUFtQkMsV0FBbkIsQ0FBK0I1RixpQkFBaUIsQ0FBakIsQ0FBL0I7QUFDQThDLFVBQUc0QyxPQUFILENBQVdDLE9BQVgsQ0FBbUJDLFdBQW5CLENBQStCM0YsaUJBQWlCLENBQWpCLENBQS9CO0FBQ0Q7O0FBRUQsWUFBTztBQUNMNEMsV0FBSUMsRUFEQztBQUVMK0MsZ0JBQVMsbUJBQVc7QUFBRS9DLFlBQUcrQyxPQUFIO0FBQWUsUUFGaEM7QUFHTGpELFlBQUssZUFBVztBQUNkSCxnQkFBT0ssR0FBRy9CLFFBQUgsRUFBUDtBQUNELFFBTEk7QUFNTCtFLGNBQU8saUJBQVc7QUFBRWhELFlBQUdnRCxLQUFIO0FBQWE7QUFONUIsTUFBUDtBQVFELElBbkdEO0FBb0dBM0UsT0FBSTRFLFFBQUosR0FBZSxZQUFXLENBRXpCLENBRkQ7O0FBSUFDLGNBQVdDLElBQVgsQ0FBZ0IsVUFBU0MsR0FBVCxFQUFjO0FBQzVCQSxTQUFJQyxVQUFKLENBQWVGLElBQWYsQ0FBb0IsWUFBVztBQUM3QmpILFNBQUUsWUFBRixFQUFnQm9ILElBQWhCO0FBQ0FwSCxTQUFFLGFBQUYsRUFBaUJxSCxJQUFqQjtBQUNBSCxXQUFJQSxHQUFKLENBQVFJLGlCQUFSLEdBQTRCTCxJQUE1QixDQUFpQyxVQUFTTSxJQUFULEVBQWU7QUFDOUN2SCxXQUFFLGVBQUYsRUFBbUJRLElBQW5CLENBQXdCLE1BQXhCLEVBQWdDK0csSUFBaEM7QUFDRCxRQUZEO0FBR0QsTUFORDtBQU9BTCxTQUFJQyxVQUFKLENBQWVLLElBQWYsQ0FBb0IsWUFBVztBQUM3QnhILFNBQUUsWUFBRixFQUFnQnFILElBQWhCO0FBQ0FySCxTQUFFLGFBQUYsRUFBaUJvSCxJQUFqQjtBQUNELE1BSEQ7QUFJRCxJQVpEOztBQWNBSixnQkFBYUEsV0FBV0MsSUFBWCxDQUFnQixVQUFTQyxHQUFULEVBQWM7QUFBRSxZQUFPQSxJQUFJQSxHQUFYO0FBQWlCLElBQWpELENBQWI7QUFDQWxILEtBQUUsZ0JBQUYsRUFBb0J5SCxLQUFwQixDQUEwQixZQUFXO0FBQ25DekgsT0FBRSxnQkFBRixFQUFvQk8sSUFBcEIsQ0FBeUIsZUFBekI7QUFDQVAsT0FBRSxnQkFBRixFQUFvQlEsSUFBcEIsQ0FBeUIsVUFBekIsRUFBcUMsVUFBckM7QUFDQXdHLGtCQUFhVSwyQkFBMkIsZ0JBQTNCLEVBQTZDLEtBQTdDLENBQWI7QUFDQVYsZ0JBQVdDLElBQVgsQ0FBZ0IsVUFBU0MsR0FBVCxFQUFjO0FBQzVCQSxXQUFJQyxVQUFKLENBQWVGLElBQWYsQ0FBb0IsWUFBVztBQUM3QmpILFdBQUUsWUFBRixFQUFnQm9ILElBQWhCO0FBQ0FwSCxXQUFFLGFBQUYsRUFBaUJxSCxJQUFqQjtBQUNBSCxhQUFJQSxHQUFKLENBQVFJLGlCQUFSLEdBQTRCTCxJQUE1QixDQUFpQyxVQUFTTSxJQUFULEVBQWU7QUFDOUN2SCxhQUFFLGVBQUYsRUFBbUJRLElBQW5CLENBQXdCLE1BQXhCLEVBQWdDK0csSUFBaEM7QUFDRCxVQUZEO0FBR0EsYUFBRzFILE9BQU8sS0FBUCxLQUFpQkEsT0FBTyxLQUFQLEVBQWMsU0FBZCxDQUFwQixFQUE4QztBQUM1QyxlQUFJOEgsU0FBU1QsSUFBSUEsR0FBSixDQUFRVSxXQUFSLENBQW9CL0gsT0FBTyxLQUFQLEVBQWMsU0FBZCxDQUFwQixDQUFiO0FBQ0FYLG1CQUFRQyxHQUFSLENBQVkscUNBQVosRUFBbUR3SSxNQUFuRDtBQUNBRSx1QkFBWUYsTUFBWjtBQUNBRywyQkFBZ0JILE1BQWhCO0FBQ0QsVUFMRCxNQUtPO0FBQ0xHLDJCQUFnQkMsRUFBRUMsS0FBRixDQUFRLFlBQVc7QUFBRSxvQkFBTyxJQUFQO0FBQWMsWUFBbkMsQ0FBaEI7QUFDRDtBQUNGLFFBZEQ7QUFlQWQsV0FBSUMsVUFBSixDQUFlSyxJQUFmLENBQW9CLFlBQVc7QUFDN0J4SCxXQUFFLGdCQUFGLEVBQW9CTyxJQUFwQixDQUF5Qix5QkFBekI7QUFDQVAsV0FBRSxnQkFBRixFQUFvQlEsSUFBcEIsQ0FBeUIsVUFBekIsRUFBcUMsS0FBckM7QUFDRCxRQUhEO0FBSUQsTUFwQkQ7QUFxQkF3RyxrQkFBYUEsV0FBV0MsSUFBWCxDQUFnQixVQUFTQyxHQUFULEVBQWM7QUFBRSxjQUFPQSxJQUFJQSxHQUFYO0FBQWlCLE1BQWpELENBQWI7QUFDRCxJQTFCRDs7QUE0QkEsT0FBSWUsYUFBYSxLQUFqQjs7QUFFQSxPQUFJQyxpQkFBaUJsQixXQUFXQyxJQUFYLENBQWdCLFVBQVNDLEdBQVQsRUFBYztBQUNqRCxTQUFJaUIsY0FBYyxJQUFsQjtBQUNBLFNBQUd0SSxPQUFPLEtBQVAsS0FBaUJBLE9BQU8sS0FBUCxFQUFjLFNBQWQsQ0FBcEIsRUFBOEM7QUFDNUNzSSxxQkFBY2pCLElBQUlVLFdBQUosQ0FBZ0IvSCxPQUFPLEtBQVAsRUFBYyxTQUFkLENBQWhCLENBQWQ7QUFDQXNJLG1CQUFZbEIsSUFBWixDQUFpQixVQUFTbUIsQ0FBVCxFQUFZO0FBQUVDLDRCQUFtQkQsQ0FBbkI7QUFBd0IsUUFBdkQ7QUFDRDtBQUNELFNBQUd2SSxPQUFPLEtBQVAsS0FBaUJBLE9BQU8sS0FBUCxFQUFjLE9BQWQsQ0FBcEIsRUFBNEM7QUFDMUNzSSxxQkFBY2pCLElBQUlvQixpQkFBSixDQUFzQnpJLE9BQU8sS0FBUCxFQUFjLE9BQWQsQ0FBdEIsQ0FBZDtBQUNBRyxTQUFFLGFBQUYsRUFBaUJPLElBQWpCLENBQXNCLGFBQXRCO0FBQ0EwSCxvQkFBYSxJQUFiO0FBQ0Q7QUFDRCxTQUFHRSxXQUFILEVBQWdCO0FBQ2RBLG1CQUFZWCxJQUFaLENBQWlCLFVBQVNuSCxHQUFULEVBQWM7QUFDN0JuQixpQkFBUUssS0FBUixDQUFjYyxHQUFkO0FBQ0FyQixnQkFBT2tCLFVBQVAsQ0FBa0IsNkJBQWxCO0FBQ0QsUUFIRDtBQUlBLGNBQU9pSSxXQUFQO0FBQ0QsTUFORCxNQU1PO0FBQ0wsY0FBTyxJQUFQO0FBQ0Q7QUFDRixJQXBCb0IsQ0FBckI7O0FBc0JBLFlBQVNJLFFBQVQsQ0FBa0JDLFFBQWxCLEVBQTRCO0FBQzFCOUksY0FBUytJLEtBQVQsR0FBaUJELFdBQVcsbUJBQTVCO0FBQ0Q7QUFDRHJHLE9BQUlvRyxRQUFKLEdBQWVBLFFBQWY7O0FBRUF2SSxLQUFFLGFBQUYsRUFBaUJ5SCxLQUFqQixDQUF1QixZQUFXO0FBQ2hDLFNBQUlpQixjQUFjMUksRUFBRSxhQUFGLENBQWxCO0FBQ0EsU0FBSTJJLFdBQVd4RyxJQUFJNkQsTUFBSixDQUFXbkMsRUFBWCxDQUFjOUIsUUFBZCxFQUFmO0FBQ0EsU0FBSTZHLGVBQWU1SixPQUFPNkosR0FBUCxDQUFXQyxlQUFYLENBQTJCLElBQUlDLElBQUosQ0FBUyxDQUFDSixRQUFELENBQVQsRUFBcUIsRUFBQ0ssTUFBTSxZQUFQLEVBQXJCLENBQTNCLENBQW5CO0FBQ0EsU0FBSUMsV0FBV2pKLEVBQUUsZUFBRixFQUFtQnVELEdBQW5CLEVBQWY7QUFDQSxTQUFHLENBQUMwRixRQUFKLEVBQWM7QUFBRUEsa0JBQVcsc0JBQVg7QUFBb0M7QUFDcEQsU0FBR0EsU0FBU0MsT0FBVCxDQUFpQixNQUFqQixNQUE4QkQsU0FBUzdDLE1BQVQsR0FBa0IsQ0FBbkQsRUFBdUQ7QUFDckQ2QyxtQkFBWSxNQUFaO0FBQ0Q7QUFDRFAsaUJBQVlsSSxJQUFaLENBQWlCO0FBQ2YySSxpQkFBVUYsUUFESztBQUVmckosYUFBTWdKO0FBRlMsTUFBakI7QUFJQTVJLE9BQUUsV0FBRixFQUFld0QsTUFBZixDQUFzQmtGLFdBQXRCO0FBQ0QsSUFkRDs7QUFnQkEsWUFBU2IsV0FBVCxDQUFxQk8sQ0FBckIsRUFBd0I7QUFDdEIsWUFBT0EsRUFBRW5CLElBQUYsQ0FBTyxVQUFTbUIsQ0FBVCxFQUFZO0FBQ3hCLFdBQUdBLE1BQU0sSUFBVCxFQUFlO0FBQ2JwSSxXQUFFLGVBQUYsRUFBbUJ1RCxHQUFuQixDQUF1QjZFLEVBQUVnQixPQUFGLEVBQXZCO0FBQ0FiLGtCQUFTSCxFQUFFZ0IsT0FBRixFQUFUO0FBQ0EsZ0JBQU9oQixFQUFFaUIsV0FBRixFQUFQO0FBQ0Q7QUFDRixNQU5NLENBQVA7QUFPRDs7QUFFRCxPQUFJQyxnQkFBZ0J6QixZQUFZSyxjQUFaLENBQXBCOztBQUVBLE9BQUlKLGdCQUFnQkksY0FBcEI7O0FBRUEsWUFBU0csa0JBQVQsQ0FBNEJELENBQTVCLEVBQStCO0FBQzdCcEksT0FBRSxpQkFBRixFQUFxQkMsS0FBckI7QUFDQUQsT0FBRSxpQkFBRixFQUFxQndELE1BQXJCLENBQTRCOUUsU0FBUzZLLGFBQVQsQ0FBdUJuQixDQUF2QixDQUE1QjtBQUNEOztBQUVELFlBQVNvQixjQUFULEdBQTBCO0FBQ3hCLFlBQU94SixFQUFFLGVBQUYsRUFBbUJ1RCxHQUFuQixNQUE0QixVQUFuQztBQUNEO0FBQ0QsWUFBU2xCLFFBQVQsR0FBb0I7QUFDbEJ5RixtQkFBY2IsSUFBZCxDQUFtQixVQUFTbUIsQ0FBVCxFQUFZO0FBQzdCLFdBQUdBLE1BQU0sSUFBTixJQUFjLENBQUNILFVBQWxCLEVBQThCO0FBQUU3RjtBQUFTO0FBQzFDLE1BRkQ7QUFHRDtBQUNERCxPQUFJRSxRQUFKLEdBQWVBLFFBQWY7QUFDQUYsT0FBSWtHLGtCQUFKLEdBQXlCQSxrQkFBekI7QUFDQWxHLE9BQUkwRixXQUFKLEdBQWtCQSxXQUFsQjs7QUFFQSxZQUFTekYsSUFBVCxHQUFnQjtBQUNkcEQsWUFBTytCLFlBQVAsQ0FBb0IsV0FBcEI7QUFDQSxTQUFJMEksZUFBZTNCLGNBQWNiLElBQWQsQ0FBbUIsVUFBU21CLENBQVQsRUFBWTtBQUNoRCxXQUFHQSxNQUFNLElBQU4sSUFBYyxDQUFDSCxVQUFsQixFQUE4QjtBQUM1QixhQUFHRyxFQUFFZ0IsT0FBRixPQUFnQnBKLEVBQUUsZUFBRixFQUFtQnVELEdBQW5CLEVBQW5CLEVBQTZDO0FBQzNDdUUsMkJBQWdCTSxFQUFFc0IsTUFBRixDQUFTRixnQkFBVCxFQUEyQnZDLElBQTNCLENBQWdDLFVBQVMwQyxJQUFULEVBQWU7QUFDN0Qsb0JBQU9BLElBQVA7QUFDRCxZQUZlLENBQWhCO0FBR0Q7QUFDRCxnQkFBTzdCLGNBQ05iLElBRE0sQ0FDRCxVQUFTbUIsQ0FBVCxFQUFZO0FBQ2hCQyw4QkFBbUJELENBQW5CO0FBQ0Esa0JBQU9BLEVBQUVoRyxJQUFGLENBQU9ELElBQUk2RCxNQUFKLENBQVduQyxFQUFYLENBQWM5QixRQUFkLEVBQVAsRUFBaUMsS0FBakMsQ0FBUDtBQUNELFVBSk0sRUFLTmtGLElBTE0sQ0FLRCxVQUFTbUIsQ0FBVCxFQUFZO0FBQ2hCcEksYUFBRSxlQUFGLEVBQW1CdUQsR0FBbkIsQ0FBdUI2RSxFQUFFZ0IsT0FBRixFQUF2QjtBQUNBcEosYUFBRSxhQUFGLEVBQWlCTyxJQUFqQixDQUFzQixNQUF0QjtBQUNBcUosbUJBQVFDLFNBQVIsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFBOEIsY0FBY3pCLEVBQUUwQixXQUFGLEVBQTVDO0FBQ0E5SyxrQkFBT1csUUFBUCxDQUFnQm9LLElBQWhCLEdBQXVCLGNBQWMzQixFQUFFMEIsV0FBRixFQUFyQztBQUNBOUssa0JBQU82QixZQUFQLENBQW9CLHNCQUFzQnVILEVBQUVnQixPQUFGLEVBQTFDO0FBQ0FiLG9CQUFTSCxFQUFFZ0IsT0FBRixFQUFUO0FBQ0Esa0JBQU9oQixDQUFQO0FBQ0QsVUFiTSxDQUFQO0FBY0QsUUFwQkQsTUFxQks7QUFDSCxhQUFJNEIsY0FBY2hLLEVBQUUsZUFBRixFQUFtQnVELEdBQW5CLE1BQTRCLFVBQTlDO0FBQ0F2RCxXQUFFLGVBQUYsRUFBbUJ1RCxHQUFuQixDQUF1QnlHLFdBQXZCO0FBQ0FsQyx5QkFBZ0JkLFdBQ2JDLElBRGEsQ0FDUixVQUFTQyxHQUFULEVBQWM7QUFBRSxrQkFBT0EsSUFBSStDLFVBQUosQ0FBZUQsV0FBZixDQUFQO0FBQXFDLFVBRDdDLENBQWhCO0FBRUEvQixzQkFBYSxLQUFiO0FBQ0EsZ0JBQU83RixNQUFQO0FBQ0Q7QUFDRixNQTlCa0IsQ0FBbkI7QUErQkFxSCxrQkFBYWpDLElBQWIsQ0FBa0IsVUFBU25ILEdBQVQsRUFBYztBQUM5QnJCLGNBQU9rQixVQUFQLENBQWtCLGdCQUFsQixFQUFvQyxvUEFBcEM7QUFDQWhCLGVBQVFLLEtBQVIsQ0FBY2MsR0FBZDtBQUNELE1BSEQ7QUFJRDtBQUNEOEIsT0FBSUMsSUFBSixHQUFXQSxJQUFYO0FBQ0FwQyxLQUFFLFlBQUYsRUFBZ0J5SCxLQUFoQixDQUFzQnRGLElBQUlFLFFBQTFCO0FBQ0FyQyxLQUFFLGFBQUYsRUFBaUJ5SCxLQUFqQixDQUF1QnJGLElBQXZCO0FBQ0ExRCxZQUFTd0wsYUFBVCxDQUF1QmxLLEVBQUUsT0FBRixDQUF2QixFQUFtQ0EsRUFBRSxlQUFGLENBQW5DLEVBQXVELEtBQXZELEVBQThELFlBQVUsQ0FBRSxDQUExRTs7QUFFQSxPQUFJbUssZ0JBQWdCbkssRUFBRSxPQUFGLEVBQVdNLFFBQVgsQ0FBb0IsVUFBcEIsQ0FBcEI7QUFDQU4sS0FBRSxPQUFGLEVBQVdVLE9BQVgsQ0FBbUJ5SixhQUFuQjs7QUFFQWhJLE9BQUk2RCxNQUFKLEdBQWE3RCxJQUFJYSxVQUFKLENBQWVtSCxhQUFmLEVBQThCO0FBQ3pDQyxnQkFBV3BLLEVBQUUsWUFBRixDQUQ4QjtBQUV6Q2dFLG1CQUFjLEtBRjJCO0FBR3pDSixVQUFLekIsSUFBSTRFLFFBSGdDO0FBSXpDc0QsaUJBQVk7QUFKNkIsSUFBOUIsQ0FBYjtBQU1BbEksT0FBSTZELE1BQUosQ0FBV25DLEVBQVgsQ0FBY3lHLFNBQWQsQ0FBd0IsVUFBeEIsRUFBb0MsVUFBcEM7O0FBRUFoQixpQkFBY3JDLElBQWQsQ0FBbUIsVUFBU3NELENBQVQsRUFBWTtBQUM3QnBJLFNBQUlmLFNBQUosQ0FBY00sR0FBZCxDQUFrQixnQkFBbEIsRUFBb0NTLElBQUk2RCxNQUFKLENBQVduQyxFQUFYLENBQWMyRyxNQUFkLEVBQXBDOztBQUVBO0FBQ0E7QUFDQXJJLFNBQUk2RCxNQUFKLENBQVduQyxFQUFYLENBQWM0RyxZQUFkO0FBQ0F0SSxTQUFJNkQsTUFBSixDQUFXbkMsRUFBWCxDQUFjNkcsUUFBZCxDQUF1QkgsQ0FBdkI7QUFDRCxJQVBEOztBQVNBakIsaUJBQWM5QixJQUFkLENBQW1CLFlBQVc7QUFDNUJyRixTQUFJZixTQUFKLENBQWNNLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DUyxJQUFJNkQsTUFBSixDQUFXbkMsRUFBWCxDQUFjMkcsTUFBZCxFQUFwQztBQUNELElBRkQ7O0FBSUEsT0FBSUcsWUFBWWpMLFNBQVNrTCxhQUFULENBQXVCLFFBQXZCLENBQWhCO0FBQ0E7Ozs7Ozs7Ozs7O0FBV0E7QUFDQTtBQUNBMUwsV0FBUUMsR0FBUixDQUFZLGNBQVosRUFBNEIwTCxTQUE1QjtBQUNBRixhQUFVRyxHQUFWLEdBQWdCRCxTQUFoQjtBQUNBRixhQUFVM0IsSUFBVixHQUFpQixpQkFBakI7QUFDQXRKLFlBQVNxTCxJQUFULENBQWNuRSxXQUFkLENBQTBCK0QsU0FBMUI7QUFDQTNLLEtBQUUySyxTQUFGLEVBQWFLLEVBQWIsQ0FBZ0IsT0FBaEIsRUFBeUIsWUFBVztBQUNsQ2hMLE9BQUUsU0FBRixFQUFhcUgsSUFBYjtBQUNBckgsT0FBRSxVQUFGLEVBQWNxSCxJQUFkO0FBQ0FySCxPQUFFLGNBQUYsRUFBa0JxSCxJQUFsQjtBQUNBckksWUFBT2tCLFVBQVAsQ0FBa0IsaUlBQWxCO0FBQ0QsSUFMRDs7QUFPQW9KLGlCQUFjMkIsR0FBZCxDQUFrQixZQUFXO0FBQzNCOUksU0FBSTZELE1BQUosQ0FBV2MsS0FBWDtBQUNBM0UsU0FBSTZELE1BQUosQ0FBV25DLEVBQVgsQ0FBY3lHLFNBQWQsQ0FBd0IsVUFBeEIsRUFBb0MsS0FBcEM7QUFDRCxJQUhEO0FBS0QsRUFuVkQsRTs7Ozs7O21FQ2hHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhEQUE2RDtBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQThDLFdBQVc7QUFDekQsK0NBQThDLFdBQVc7QUFDekQsOENBQTZDLFdBQVc7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBcUMsV0FBVyxPQUFPO0FBQ3ZELHVDQUFzQyxXQUFXLE1BQU07QUFDdkQ7QUFDQSxZQUFXLE9BQU87QUFDbEIsYUFBWSwyQkFBMkIsRUFBRTtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLCtCQUErQjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDBCQUF5QixZQUFZO0FBQ3JDOztBQUVBOztBQUVBO0FBQ0Esa0JBQWlCLGNBQWM7QUFDL0I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFFOztBQUVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixZQUFXLE9BQU87QUFDbEI7QUFDQSxhQUFZLE9BQU87QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUU7O0FBRUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixhQUFZLFdBQVcsRUFBRTtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksUUFBUTtBQUNwQjtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxHQUFFOztBQUVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixZQUFXLE9BQU87QUFDbEIsYUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxHQUFFO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEVBQUM7Ozs7Ozs7O0FDclZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDVEEsOEJBQTZCLG1EQUFtRCIsImZpbGUiOiJqcy9iZWZvcmVQeXJldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdHZhciBwYXJlbnRIb3RVcGRhdGVDYWxsYmFjayA9IHRoaXNbXCJ3ZWJwYWNrSG90VXBkYXRlXCJdO1xuIFx0dGhpc1tcIndlYnBhY2tIb3RVcGRhdGVcIl0gPSBmdW5jdGlvbiB3ZWJwYWNrSG90VXBkYXRlQ2FsbGJhY2soY2h1bmtJZCwgbW9yZU1vZHVsZXMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuIFx0XHRob3RBZGRVcGRhdGVDaHVuayhjaHVua0lkLCBtb3JlTW9kdWxlcyk7XG4gXHRcdGlmKHBhcmVudEhvdFVwZGF0ZUNhbGxiYWNrKSBwYXJlbnRIb3RVcGRhdGVDYWxsYmFjayhjaHVua0lkLCBtb3JlTW9kdWxlcyk7XG4gXHR9XG5cbiBcdGZ1bmN0aW9uIGhvdERvd25sb2FkVXBkYXRlQ2h1bmsoY2h1bmtJZCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gXHRcdHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdO1xuIFx0XHR2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiBcdFx0c2NyaXB0LnR5cGUgPSBcInRleHQvamF2YXNjcmlwdFwiO1xuIFx0XHRzY3JpcHQuY2hhcnNldCA9IFwidXRmLThcIjtcbiBcdFx0c2NyaXB0LnNyYyA9IF9fd2VicGFja19yZXF1aXJlX18ucCArIFwiXCIgKyBjaHVua0lkICsgXCIuXCIgKyBob3RDdXJyZW50SGFzaCArIFwiLmhvdC11cGRhdGUuanNcIjtcbiBcdFx0aGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuIFx0fVxuXG4gXHRmdW5jdGlvbiBob3REb3dubG9hZE1hbmlmZXN0KGNhbGxiYWNrKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiBcdFx0aWYodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ID09PSBcInVuZGVmaW5lZFwiKVxuIFx0XHRcdHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJObyBicm93c2VyIHN1cHBvcnRcIikpO1xuIFx0XHR0cnkge1xuIFx0XHRcdHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gXHRcdFx0dmFyIHJlcXVlc3RQYXRoID0gX193ZWJwYWNrX3JlcXVpcmVfXy5wICsgXCJcIiArIGhvdEN1cnJlbnRIYXNoICsgXCIuaG90LXVwZGF0ZS5qc29uXCI7XG4gXHRcdFx0cmVxdWVzdC5vcGVuKFwiR0VUXCIsIHJlcXVlc3RQYXRoLCB0cnVlKTtcbiBcdFx0XHRyZXF1ZXN0LnRpbWVvdXQgPSAxMDAwMDtcbiBcdFx0XHRyZXF1ZXN0LnNlbmQobnVsbCk7XG4gXHRcdH0gY2F0Y2goZXJyKSB7XG4gXHRcdFx0cmV0dXJuIGNhbGxiYWNrKGVycik7XG4gXHRcdH1cbiBcdFx0cmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiBcdFx0XHRpZihyZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHJldHVybjtcbiBcdFx0XHRpZihyZXF1ZXN0LnN0YXR1cyA9PT0gMCkge1xuIFx0XHRcdFx0Ly8gdGltZW91dFxuIFx0XHRcdFx0Y2FsbGJhY2sobmV3IEVycm9yKFwiTWFuaWZlc3QgcmVxdWVzdCB0byBcIiArIHJlcXVlc3RQYXRoICsgXCIgdGltZWQgb3V0LlwiKSk7XG4gXHRcdFx0fSBlbHNlIGlmKHJlcXVlc3Quc3RhdHVzID09PSA0MDQpIHtcbiBcdFx0XHRcdC8vIG5vIHVwZGF0ZSBhdmFpbGFibGVcbiBcdFx0XHRcdGNhbGxiYWNrKCk7XG4gXHRcdFx0fSBlbHNlIGlmKHJlcXVlc3Quc3RhdHVzICE9PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgIT09IDMwNCkge1xuIFx0XHRcdFx0Ly8gb3RoZXIgZmFpbHVyZVxuIFx0XHRcdFx0Y2FsbGJhY2sobmV3IEVycm9yKFwiTWFuaWZlc3QgcmVxdWVzdCB0byBcIiArIHJlcXVlc3RQYXRoICsgXCIgZmFpbGVkLlwiKSk7XG4gXHRcdFx0fSBlbHNlIHtcbiBcdFx0XHRcdC8vIHN1Y2Nlc3NcbiBcdFx0XHRcdHRyeSB7XG4gXHRcdFx0XHRcdHZhciB1cGRhdGUgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiBcdFx0XHRcdH0gY2F0Y2goZSkge1xuIFx0XHRcdFx0XHRjYWxsYmFjayhlKTtcbiBcdFx0XHRcdFx0cmV0dXJuO1xuIFx0XHRcdFx0fVxuIFx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgdXBkYXRlKTtcbiBcdFx0XHR9XG4gXHRcdH07XG4gXHR9XG5cblxuIFx0Ly8gQ29waWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2Jsb2IvYmVmNDViMC9zcmMvc2hhcmVkL3V0aWxzL2NhbkRlZmluZVByb3BlcnR5LmpzXG4gXHR2YXIgY2FuRGVmaW5lUHJvcGVydHkgPSBmYWxzZTtcbiBcdHRyeSB7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgXCJ4XCIsIHtcbiBcdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge31cbiBcdFx0fSk7XG4gXHRcdGNhbkRlZmluZVByb3BlcnR5ID0gdHJ1ZTtcbiBcdH0gY2F0Y2goeCkge1xuIFx0XHQvLyBJRSB3aWxsIGZhaWwgb24gZGVmaW5lUHJvcGVydHlcbiBcdH1cblxuIFx0dmFyIGhvdEFwcGx5T25VcGRhdGUgPSB0cnVlO1xuIFx0dmFyIGhvdEN1cnJlbnRIYXNoID0gXCIxZDgzNjBjZmFkYWVhN2EzMDg1OFwiOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gXHR2YXIgaG90Q3VycmVudE1vZHVsZURhdGEgPSB7fTtcbiBcdHZhciBob3RDdXJyZW50UGFyZW50cyA9IFtdOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5cbiBcdGZ1bmN0aW9uIGhvdENyZWF0ZVJlcXVpcmUobW9kdWxlSWQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuIFx0XHR2YXIgbWUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcbiBcdFx0aWYoIW1lKSByZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXztcbiBcdFx0dmFyIGZuID0gZnVuY3Rpb24ocmVxdWVzdCkge1xuIFx0XHRcdGlmKG1lLmhvdC5hY3RpdmUpIHtcbiBcdFx0XHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbcmVxdWVzdF0pIHtcbiBcdFx0XHRcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1tyZXF1ZXN0XS5wYXJlbnRzLmluZGV4T2YobW9kdWxlSWQpIDwgMClcbiBcdFx0XHRcdFx0XHRpbnN0YWxsZWRNb2R1bGVzW3JlcXVlc3RdLnBhcmVudHMucHVzaChtb2R1bGVJZCk7XG4gXHRcdFx0XHRcdGlmKG1lLmNoaWxkcmVuLmluZGV4T2YocmVxdWVzdCkgPCAwKVxuIFx0XHRcdFx0XHRcdG1lLmNoaWxkcmVuLnB1c2gocmVxdWVzdCk7XG4gXHRcdFx0XHR9IGVsc2UgaG90Q3VycmVudFBhcmVudHMgPSBbbW9kdWxlSWRdO1xuIFx0XHRcdH0gZWxzZSB7XG4gXHRcdFx0XHRjb25zb2xlLndhcm4oXCJbSE1SXSB1bmV4cGVjdGVkIHJlcXVpcmUoXCIgKyByZXF1ZXN0ICsgXCIpIGZyb20gZGlzcG9zZWQgbW9kdWxlIFwiICsgbW9kdWxlSWQpO1xuIFx0XHRcdFx0aG90Q3VycmVudFBhcmVudHMgPSBbXTtcbiBcdFx0XHR9XG4gXHRcdFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18ocmVxdWVzdCk7XG4gXHRcdH07XG4gXHRcdGZvcih2YXIgbmFtZSBpbiBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKF9fd2VicGFja19yZXF1aXJlX18sIG5hbWUpKSB7XG4gXHRcdFx0XHRpZihjYW5EZWZpbmVQcm9wZXJ0eSkge1xuIFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIG5hbWUsIChmdW5jdGlvbihuYW1lKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIHtcbiBcdFx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRcdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuIFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfX1tuYW1lXTtcbiBcdFx0XHRcdFx0XHRcdH0sXG4gXHRcdFx0XHRcdFx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gXHRcdFx0XHRcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX19bbmFtZV0gPSB2YWx1ZTtcbiBcdFx0XHRcdFx0XHRcdH1cbiBcdFx0XHRcdFx0XHR9O1xuIFx0XHRcdFx0XHR9KG5hbWUpKSk7XG4gXHRcdFx0XHR9IGVsc2Uge1xuIFx0XHRcdFx0XHRmbltuYW1lXSA9IF9fd2VicGFja19yZXF1aXJlX19bbmFtZV07XG4gXHRcdFx0XHR9XG4gXHRcdFx0fVxuIFx0XHR9XG5cbiBcdFx0ZnVuY3Rpb24gZW5zdXJlKGNodW5rSWQsIGNhbGxiYWNrKSB7XG4gXHRcdFx0aWYoaG90U3RhdHVzID09PSBcInJlYWR5XCIpXG4gXHRcdFx0XHRob3RTZXRTdGF0dXMoXCJwcmVwYXJlXCIpO1xuIFx0XHRcdGhvdENodW5rc0xvYWRpbmcrKztcbiBcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmUoY2h1bmtJZCwgZnVuY3Rpb24oKSB7XG4gXHRcdFx0XHR0cnkge1xuIFx0XHRcdFx0XHRjYWxsYmFjay5jYWxsKG51bGwsIGZuKTtcbiBcdFx0XHRcdH0gZmluYWxseSB7XG4gXHRcdFx0XHRcdGZpbmlzaENodW5rTG9hZGluZygpO1xuIFx0XHRcdFx0fVxuXG4gXHRcdFx0XHRmdW5jdGlvbiBmaW5pc2hDaHVua0xvYWRpbmcoKSB7XG4gXHRcdFx0XHRcdGhvdENodW5rc0xvYWRpbmctLTtcbiBcdFx0XHRcdFx0aWYoaG90U3RhdHVzID09PSBcInByZXBhcmVcIikge1xuIFx0XHRcdFx0XHRcdGlmKCFob3RXYWl0aW5nRmlsZXNNYXBbY2h1bmtJZF0pIHtcbiBcdFx0XHRcdFx0XHRcdGhvdEVuc3VyZVVwZGF0ZUNodW5rKGNodW5rSWQpO1xuIFx0XHRcdFx0XHRcdH1cbiBcdFx0XHRcdFx0XHRpZihob3RDaHVua3NMb2FkaW5nID09PSAwICYmIGhvdFdhaXRpbmdGaWxlcyA9PT0gMCkge1xuIFx0XHRcdFx0XHRcdFx0aG90VXBkYXRlRG93bmxvYWRlZCgpO1xuIFx0XHRcdFx0XHRcdH1cbiBcdFx0XHRcdFx0fVxuIFx0XHRcdFx0fVxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHRcdGlmKGNhbkRlZmluZVByb3BlcnR5KSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGZuLCBcImVcIiwge1xuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdHZhbHVlOiBlbnN1cmVcbiBcdFx0XHR9KTtcbiBcdFx0fSBlbHNlIHtcbiBcdFx0XHRmbi5lID0gZW5zdXJlO1xuIFx0XHR9XG4gXHRcdHJldHVybiBmbjtcbiBcdH1cblxuIFx0ZnVuY3Rpb24gaG90Q3JlYXRlTW9kdWxlKG1vZHVsZUlkKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiBcdFx0dmFyIGhvdCA9IHtcbiBcdFx0XHQvLyBwcml2YXRlIHN0dWZmXG4gXHRcdFx0X2FjY2VwdGVkRGVwZW5kZW5jaWVzOiB7fSxcbiBcdFx0XHRfZGVjbGluZWREZXBlbmRlbmNpZXM6IHt9LFxuIFx0XHRcdF9zZWxmQWNjZXB0ZWQ6IGZhbHNlLFxuIFx0XHRcdF9zZWxmRGVjbGluZWQ6IGZhbHNlLFxuIFx0XHRcdF9kaXNwb3NlSGFuZGxlcnM6IFtdLFxuXG4gXHRcdFx0Ly8gTW9kdWxlIEFQSVxuIFx0XHRcdGFjdGl2ZTogdHJ1ZSxcbiBcdFx0XHRhY2NlcHQ6IGZ1bmN0aW9uKGRlcCwgY2FsbGJhY2spIHtcbiBcdFx0XHRcdGlmKHR5cGVvZiBkZXAgPT09IFwidW5kZWZpbmVkXCIpXG4gXHRcdFx0XHRcdGhvdC5fc2VsZkFjY2VwdGVkID0gdHJ1ZTtcbiBcdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRlcCA9PT0gXCJmdW5jdGlvblwiKVxuIFx0XHRcdFx0XHRob3QuX3NlbGZBY2NlcHRlZCA9IGRlcDtcbiBcdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIilcbiBcdFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGRlcC5sZW5ndGg7IGkrKylcbiBcdFx0XHRcdFx0XHRob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcFtpXV0gPSBjYWxsYmFjaztcbiBcdFx0XHRcdGVsc2VcbiBcdFx0XHRcdFx0aG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1tkZXBdID0gY2FsbGJhY2s7XG4gXHRcdFx0fSxcbiBcdFx0XHRkZWNsaW5lOiBmdW5jdGlvbihkZXApIHtcbiBcdFx0XHRcdGlmKHR5cGVvZiBkZXAgPT09IFwidW5kZWZpbmVkXCIpXG4gXHRcdFx0XHRcdGhvdC5fc2VsZkRlY2xpbmVkID0gdHJ1ZTtcbiBcdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRlcCA9PT0gXCJudW1iZXJcIilcbiBcdFx0XHRcdFx0aG90Ll9kZWNsaW5lZERlcGVuZGVuY2llc1tkZXBdID0gdHJ1ZTtcbiBcdFx0XHRcdGVsc2VcbiBcdFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGRlcC5sZW5ndGg7IGkrKylcbiBcdFx0XHRcdFx0XHRob3QuX2RlY2xpbmVkRGVwZW5kZW5jaWVzW2RlcFtpXV0gPSB0cnVlO1xuIFx0XHRcdH0sXG4gXHRcdFx0ZGlzcG9zZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiBcdFx0XHRcdGhvdC5fZGlzcG9zZUhhbmRsZXJzLnB1c2goY2FsbGJhY2spO1xuIFx0XHRcdH0sXG4gXHRcdFx0YWRkRGlzcG9zZUhhbmRsZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gXHRcdFx0XHRob3QuX2Rpc3Bvc2VIYW5kbGVycy5wdXNoKGNhbGxiYWNrKTtcbiBcdFx0XHR9LFxuIFx0XHRcdHJlbW92ZURpc3Bvc2VIYW5kbGVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuIFx0XHRcdFx0dmFyIGlkeCA9IGhvdC5fZGlzcG9zZUhhbmRsZXJzLmluZGV4T2YoY2FsbGJhY2spO1xuIFx0XHRcdFx0aWYoaWR4ID49IDApIGhvdC5fZGlzcG9zZUhhbmRsZXJzLnNwbGljZShpZHgsIDEpO1xuIFx0XHRcdH0sXG5cbiBcdFx0XHQvLyBNYW5hZ2VtZW50IEFQSVxuIFx0XHRcdGNoZWNrOiBob3RDaGVjayxcbiBcdFx0XHRhcHBseTogaG90QXBwbHksXG4gXHRcdFx0c3RhdHVzOiBmdW5jdGlvbihsKSB7XG4gXHRcdFx0XHRpZighbCkgcmV0dXJuIGhvdFN0YXR1cztcbiBcdFx0XHRcdGhvdFN0YXR1c0hhbmRsZXJzLnB1c2gobCk7XG4gXHRcdFx0fSxcbiBcdFx0XHRhZGRTdGF0dXNIYW5kbGVyOiBmdW5jdGlvbihsKSB7XG4gXHRcdFx0XHRob3RTdGF0dXNIYW5kbGVycy5wdXNoKGwpO1xuIFx0XHRcdH0sXG4gXHRcdFx0cmVtb3ZlU3RhdHVzSGFuZGxlcjogZnVuY3Rpb24obCkge1xuIFx0XHRcdFx0dmFyIGlkeCA9IGhvdFN0YXR1c0hhbmRsZXJzLmluZGV4T2YobCk7XG4gXHRcdFx0XHRpZihpZHggPj0gMCkgaG90U3RhdHVzSGFuZGxlcnMuc3BsaWNlKGlkeCwgMSk7XG4gXHRcdFx0fSxcblxuIFx0XHRcdC8vaW5oZXJpdCBmcm9tIHByZXZpb3VzIGRpc3Bvc2UgY2FsbFxuIFx0XHRcdGRhdGE6IGhvdEN1cnJlbnRNb2R1bGVEYXRhW21vZHVsZUlkXVxuIFx0XHR9O1xuIFx0XHRyZXR1cm4gaG90O1xuIFx0fVxuXG4gXHR2YXIgaG90U3RhdHVzSGFuZGxlcnMgPSBbXTtcbiBcdHZhciBob3RTdGF0dXMgPSBcImlkbGVcIjtcblxuIFx0ZnVuY3Rpb24gaG90U2V0U3RhdHVzKG5ld1N0YXR1cykge1xuIFx0XHRob3RTdGF0dXMgPSBuZXdTdGF0dXM7XG4gXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBob3RTdGF0dXNIYW5kbGVycy5sZW5ndGg7IGkrKylcbiBcdFx0XHRob3RTdGF0dXNIYW5kbGVyc1tpXS5jYWxsKG51bGwsIG5ld1N0YXR1cyk7XG4gXHR9XG5cbiBcdC8vIHdoaWxlIGRvd25sb2FkaW5nXG4gXHR2YXIgaG90V2FpdGluZ0ZpbGVzID0gMDtcbiBcdHZhciBob3RDaHVua3NMb2FkaW5nID0gMDtcbiBcdHZhciBob3RXYWl0aW5nRmlsZXNNYXAgPSB7fTtcbiBcdHZhciBob3RSZXF1ZXN0ZWRGaWxlc01hcCA9IHt9O1xuIFx0dmFyIGhvdEF2YWlsaWJsZUZpbGVzTWFwID0ge307XG4gXHR2YXIgaG90Q2FsbGJhY2s7XG5cbiBcdC8vIFRoZSB1cGRhdGUgaW5mb1xuIFx0dmFyIGhvdFVwZGF0ZSwgaG90VXBkYXRlTmV3SGFzaDtcblxuIFx0ZnVuY3Rpb24gdG9Nb2R1bGVJZChpZCkge1xuIFx0XHR2YXIgaXNOdW1iZXIgPSAoK2lkKSArIFwiXCIgPT09IGlkO1xuIFx0XHRyZXR1cm4gaXNOdW1iZXIgPyAraWQgOiBpZDtcbiBcdH1cblxuIFx0ZnVuY3Rpb24gaG90Q2hlY2soYXBwbHksIGNhbGxiYWNrKSB7XG4gXHRcdGlmKGhvdFN0YXR1cyAhPT0gXCJpZGxlXCIpIHRocm93IG5ldyBFcnJvcihcImNoZWNrKCkgaXMgb25seSBhbGxvd2VkIGluIGlkbGUgc3RhdHVzXCIpO1xuIFx0XHRpZih0eXBlb2YgYXBwbHkgPT09IFwiZnVuY3Rpb25cIikge1xuIFx0XHRcdGhvdEFwcGx5T25VcGRhdGUgPSBmYWxzZTtcbiBcdFx0XHRjYWxsYmFjayA9IGFwcGx5O1xuIFx0XHR9IGVsc2Uge1xuIFx0XHRcdGhvdEFwcGx5T25VcGRhdGUgPSBhcHBseTtcbiBcdFx0XHRjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKGVycikge1xuIFx0XHRcdFx0aWYoZXJyKSB0aHJvdyBlcnI7XG4gXHRcdFx0fTtcbiBcdFx0fVxuIFx0XHRob3RTZXRTdGF0dXMoXCJjaGVja1wiKTtcbiBcdFx0aG90RG93bmxvYWRNYW5pZmVzdChmdW5jdGlvbihlcnIsIHVwZGF0ZSkge1xuIFx0XHRcdGlmKGVycikgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gXHRcdFx0aWYoIXVwZGF0ZSkge1xuIFx0XHRcdFx0aG90U2V0U3RhdHVzKFwiaWRsZVwiKTtcbiBcdFx0XHRcdGNhbGxiYWNrKG51bGwsIG51bGwpO1xuIFx0XHRcdFx0cmV0dXJuO1xuIFx0XHRcdH1cblxuIFx0XHRcdGhvdFJlcXVlc3RlZEZpbGVzTWFwID0ge307XG4gXHRcdFx0aG90QXZhaWxpYmxlRmlsZXNNYXAgPSB7fTtcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXNNYXAgPSB7fTtcbiBcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdXBkYXRlLmMubGVuZ3RoOyBpKyspXG4gXHRcdFx0XHRob3RBdmFpbGlibGVGaWxlc01hcFt1cGRhdGUuY1tpXV0gPSB0cnVlO1xuIFx0XHRcdGhvdFVwZGF0ZU5ld0hhc2ggPSB1cGRhdGUuaDtcblxuIFx0XHRcdGhvdFNldFN0YXR1cyhcInByZXBhcmVcIik7XG4gXHRcdFx0aG90Q2FsbGJhY2sgPSBjYWxsYmFjaztcbiBcdFx0XHRob3RVcGRhdGUgPSB7fTtcbiBcdFx0XHR2YXIgY2h1bmtJZCA9IDA7XG4gXHRcdFx0eyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWxvbmUtYmxvY2tzXG4gXHRcdFx0XHQvKmdsb2JhbHMgY2h1bmtJZCAqL1xuIFx0XHRcdFx0aG90RW5zdXJlVXBkYXRlQ2h1bmsoY2h1bmtJZCk7XG4gXHRcdFx0fVxuIFx0XHRcdGlmKGhvdFN0YXR1cyA9PT0gXCJwcmVwYXJlXCIgJiYgaG90Q2h1bmtzTG9hZGluZyA9PT0gMCAmJiBob3RXYWl0aW5nRmlsZXMgPT09IDApIHtcbiBcdFx0XHRcdGhvdFVwZGF0ZURvd25sb2FkZWQoKTtcbiBcdFx0XHR9XG4gXHRcdH0pO1xuIFx0fVxuXG4gXHRmdW5jdGlvbiBob3RBZGRVcGRhdGVDaHVuayhjaHVua0lkLCBtb3JlTW9kdWxlcykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gXHRcdGlmKCFob3RBdmFpbGlibGVGaWxlc01hcFtjaHVua0lkXSB8fCAhaG90UmVxdWVzdGVkRmlsZXNNYXBbY2h1bmtJZF0pXG4gXHRcdFx0cmV0dXJuO1xuIFx0XHRob3RSZXF1ZXN0ZWRGaWxlc01hcFtjaHVua0lkXSA9IGZhbHNlO1xuIFx0XHRmb3IodmFyIG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcbiBcdFx0XHRcdGhvdFVwZGF0ZVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG4gXHRcdFx0fVxuIFx0XHR9XG4gXHRcdGlmKC0taG90V2FpdGluZ0ZpbGVzID09PSAwICYmIGhvdENodW5rc0xvYWRpbmcgPT09IDApIHtcbiBcdFx0XHRob3RVcGRhdGVEb3dubG9hZGVkKCk7XG4gXHRcdH1cbiBcdH1cblxuIFx0ZnVuY3Rpb24gaG90RW5zdXJlVXBkYXRlQ2h1bmsoY2h1bmtJZCkge1xuIFx0XHRpZighaG90QXZhaWxpYmxlRmlsZXNNYXBbY2h1bmtJZF0pIHtcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXNNYXBbY2h1bmtJZF0gPSB0cnVlO1xuIFx0XHR9IGVsc2Uge1xuIFx0XHRcdGhvdFJlcXVlc3RlZEZpbGVzTWFwW2NodW5rSWRdID0gdHJ1ZTtcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXMrKztcbiBcdFx0XHRob3REb3dubG9hZFVwZGF0ZUNodW5rKGNodW5rSWQpO1xuIFx0XHR9XG4gXHR9XG5cbiBcdGZ1bmN0aW9uIGhvdFVwZGF0ZURvd25sb2FkZWQoKSB7XG4gXHRcdGhvdFNldFN0YXR1cyhcInJlYWR5XCIpO1xuIFx0XHR2YXIgY2FsbGJhY2sgPSBob3RDYWxsYmFjaztcbiBcdFx0aG90Q2FsbGJhY2sgPSBudWxsO1xuIFx0XHRpZighY2FsbGJhY2spIHJldHVybjtcbiBcdFx0aWYoaG90QXBwbHlPblVwZGF0ZSkge1xuIFx0XHRcdGhvdEFwcGx5KGhvdEFwcGx5T25VcGRhdGUsIGNhbGxiYWNrKTtcbiBcdFx0fSBlbHNlIHtcbiBcdFx0XHR2YXIgb3V0ZGF0ZWRNb2R1bGVzID0gW107XG4gXHRcdFx0Zm9yKHZhciBpZCBpbiBob3RVcGRhdGUpIHtcbiBcdFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChob3RVcGRhdGUsIGlkKSkge1xuIFx0XHRcdFx0XHRvdXRkYXRlZE1vZHVsZXMucHVzaCh0b01vZHVsZUlkKGlkKSk7XG4gXHRcdFx0XHR9XG4gXHRcdFx0fVxuIFx0XHRcdGNhbGxiYWNrKG51bGwsIG91dGRhdGVkTW9kdWxlcyk7XG4gXHRcdH1cbiBcdH1cblxuIFx0ZnVuY3Rpb24gaG90QXBwbHkob3B0aW9ucywgY2FsbGJhY2spIHtcbiBcdFx0aWYoaG90U3RhdHVzICE9PSBcInJlYWR5XCIpIHRocm93IG5ldyBFcnJvcihcImFwcGx5KCkgaXMgb25seSBhbGxvd2VkIGluIHJlYWR5IHN0YXR1c1wiKTtcbiBcdFx0aWYodHlwZW9mIG9wdGlvbnMgPT09IFwiZnVuY3Rpb25cIikge1xuIFx0XHRcdGNhbGxiYWNrID0gb3B0aW9ucztcbiBcdFx0XHRvcHRpb25zID0ge307XG4gXHRcdH0gZWxzZSBpZihvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zID09PSBcIm9iamVjdFwiKSB7XG4gXHRcdFx0Y2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbihlcnIpIHtcbiBcdFx0XHRcdGlmKGVycikgdGhyb3cgZXJyO1xuIFx0XHRcdH07XG4gXHRcdH0gZWxzZSB7XG4gXHRcdFx0b3B0aW9ucyA9IHt9O1xuIFx0XHRcdGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oZXJyKSB7XG4gXHRcdFx0XHRpZihlcnIpIHRocm93IGVycjtcbiBcdFx0XHR9O1xuIFx0XHR9XG5cbiBcdFx0ZnVuY3Rpb24gZ2V0QWZmZWN0ZWRTdHVmZihtb2R1bGUpIHtcbiBcdFx0XHR2YXIgb3V0ZGF0ZWRNb2R1bGVzID0gW21vZHVsZV07XG4gXHRcdFx0dmFyIG91dGRhdGVkRGVwZW5kZW5jaWVzID0ge307XG5cbiBcdFx0XHR2YXIgcXVldWUgPSBvdXRkYXRlZE1vZHVsZXMuc2xpY2UoKTtcbiBcdFx0XHR3aGlsZShxdWV1ZS5sZW5ndGggPiAwKSB7XG4gXHRcdFx0XHR2YXIgbW9kdWxlSWQgPSBxdWV1ZS5wb3AoKTtcbiBcdFx0XHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcbiBcdFx0XHRcdGlmKCFtb2R1bGUgfHwgbW9kdWxlLmhvdC5fc2VsZkFjY2VwdGVkKVxuIFx0XHRcdFx0XHRjb250aW51ZTtcbiBcdFx0XHRcdGlmKG1vZHVsZS5ob3QuX3NlbGZEZWNsaW5lZCkge1xuIFx0XHRcdFx0XHRyZXR1cm4gbmV3IEVycm9yKFwiQWJvcnRlZCBiZWNhdXNlIG9mIHNlbGYgZGVjbGluZTogXCIgKyBtb2R1bGVJZCk7XG4gXHRcdFx0XHR9XG4gXHRcdFx0XHRpZihtb2R1bGVJZCA9PT0gMCkge1xuIFx0XHRcdFx0XHRyZXR1cm47XG4gXHRcdFx0XHR9XG4gXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbW9kdWxlLnBhcmVudHMubGVuZ3RoOyBpKyspIHtcbiBcdFx0XHRcdFx0dmFyIHBhcmVudElkID0gbW9kdWxlLnBhcmVudHNbaV07XG4gXHRcdFx0XHRcdHZhciBwYXJlbnQgPSBpbnN0YWxsZWRNb2R1bGVzW3BhcmVudElkXTtcbiBcdFx0XHRcdFx0aWYocGFyZW50LmhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBFcnJvcihcIkFib3J0ZWQgYmVjYXVzZSBvZiBkZWNsaW5lZCBkZXBlbmRlbmN5OiBcIiArIG1vZHVsZUlkICsgXCIgaW4gXCIgKyBwYXJlbnRJZCk7XG4gXHRcdFx0XHRcdH1cbiBcdFx0XHRcdFx0aWYob3V0ZGF0ZWRNb2R1bGVzLmluZGV4T2YocGFyZW50SWQpID49IDApIGNvbnRpbnVlO1xuIFx0XHRcdFx0XHRpZihwYXJlbnQuaG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRcdFx0XHRpZighb3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdKVxuIFx0XHRcdFx0XHRcdFx0b3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdID0gW107XG4gXHRcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdLCBbbW9kdWxlSWRdKTtcbiBcdFx0XHRcdFx0XHRjb250aW51ZTtcbiBcdFx0XHRcdFx0fVxuIFx0XHRcdFx0XHRkZWxldGUgb3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdO1xuIFx0XHRcdFx0XHRvdXRkYXRlZE1vZHVsZXMucHVzaChwYXJlbnRJZCk7XG4gXHRcdFx0XHRcdHF1ZXVlLnB1c2gocGFyZW50SWQpO1xuIFx0XHRcdFx0fVxuIFx0XHRcdH1cblxuIFx0XHRcdHJldHVybiBbb3V0ZGF0ZWRNb2R1bGVzLCBvdXRkYXRlZERlcGVuZGVuY2llc107XG4gXHRcdH1cblxuIFx0XHRmdW5jdGlvbiBhZGRBbGxUb1NldChhLCBiKSB7XG4gXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcbiBcdFx0XHRcdHZhciBpdGVtID0gYltpXTtcbiBcdFx0XHRcdGlmKGEuaW5kZXhPZihpdGVtKSA8IDApXG4gXHRcdFx0XHRcdGEucHVzaChpdGVtKTtcbiBcdFx0XHR9XG4gXHRcdH1cblxuIFx0XHQvLyBhdCBiZWdpbiBhbGwgdXBkYXRlcyBtb2R1bGVzIGFyZSBvdXRkYXRlZFxuIFx0XHQvLyB0aGUgXCJvdXRkYXRlZFwiIHN0YXR1cyBjYW4gcHJvcGFnYXRlIHRvIHBhcmVudHMgaWYgdGhleSBkb24ndCBhY2NlcHQgdGhlIGNoaWxkcmVuXG4gXHRcdHZhciBvdXRkYXRlZERlcGVuZGVuY2llcyA9IHt9O1xuIFx0XHR2YXIgb3V0ZGF0ZWRNb2R1bGVzID0gW107XG4gXHRcdHZhciBhcHBsaWVkVXBkYXRlID0ge307XG4gXHRcdGZvcih2YXIgaWQgaW4gaG90VXBkYXRlKSB7XG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGhvdFVwZGF0ZSwgaWQpKSB7XG4gXHRcdFx0XHR2YXIgbW9kdWxlSWQgPSB0b01vZHVsZUlkKGlkKTtcbiBcdFx0XHRcdHZhciByZXN1bHQgPSBnZXRBZmZlY3RlZFN0dWZmKG1vZHVsZUlkKTtcbiBcdFx0XHRcdGlmKCFyZXN1bHQpIHtcbiBcdFx0XHRcdFx0aWYob3B0aW9ucy5pZ25vcmVVbmFjY2VwdGVkKVxuIFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuIFx0XHRcdFx0XHRob3RTZXRTdGF0dXMoXCJhYm9ydFwiKTtcbiBcdFx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihcIkFib3J0ZWQgYmVjYXVzZSBcIiArIG1vZHVsZUlkICsgXCIgaXMgbm90IGFjY2VwdGVkXCIpKTtcbiBcdFx0XHRcdH1cbiBcdFx0XHRcdGlmKHJlc3VsdCBpbnN0YW5jZW9mIEVycm9yKSB7XG4gXHRcdFx0XHRcdGhvdFNldFN0YXR1cyhcImFib3J0XCIpO1xuIFx0XHRcdFx0XHRyZXR1cm4gY2FsbGJhY2socmVzdWx0KTtcbiBcdFx0XHRcdH1cbiBcdFx0XHRcdGFwcGxpZWRVcGRhdGVbbW9kdWxlSWRdID0gaG90VXBkYXRlW21vZHVsZUlkXTtcbiBcdFx0XHRcdGFkZEFsbFRvU2V0KG91dGRhdGVkTW9kdWxlcywgcmVzdWx0WzBdKTtcbiBcdFx0XHRcdGZvcih2YXIgbW9kdWxlSWQgaW4gcmVzdWx0WzFdKSB7XG4gXHRcdFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyZXN1bHRbMV0sIG1vZHVsZUlkKSkge1xuIFx0XHRcdFx0XHRcdGlmKCFvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pXG4gXHRcdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0gPSBbXTtcbiBcdFx0XHRcdFx0XHRhZGRBbGxUb1NldChvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0sIHJlc3VsdFsxXVttb2R1bGVJZF0pO1xuIFx0XHRcdFx0XHR9XG4gXHRcdFx0XHR9XG4gXHRcdFx0fVxuIFx0XHR9XG5cbiBcdFx0Ly8gU3RvcmUgc2VsZiBhY2NlcHRlZCBvdXRkYXRlZCBtb2R1bGVzIHRvIHJlcXVpcmUgdGhlbSBsYXRlciBieSB0aGUgbW9kdWxlIHN5c3RlbVxuIFx0XHR2YXIgb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzID0gW107XG4gXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBvdXRkYXRlZE1vZHVsZXMubGVuZ3RoOyBpKyspIHtcbiBcdFx0XHR2YXIgbW9kdWxlSWQgPSBvdXRkYXRlZE1vZHVsZXNbaV07XG4gXHRcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gJiYgaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uaG90Ll9zZWxmQWNjZXB0ZWQpXG4gXHRcdFx0XHRvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMucHVzaCh7XG4gXHRcdFx0XHRcdG1vZHVsZTogbW9kdWxlSWQsXG4gXHRcdFx0XHRcdGVycm9ySGFuZGxlcjogaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uaG90Ll9zZWxmQWNjZXB0ZWRcbiBcdFx0XHRcdH0pO1xuIFx0XHR9XG5cbiBcdFx0Ly8gTm93IGluIFwiZGlzcG9zZVwiIHBoYXNlXG4gXHRcdGhvdFNldFN0YXR1cyhcImRpc3Bvc2VcIik7XG4gXHRcdHZhciBxdWV1ZSA9IG91dGRhdGVkTW9kdWxlcy5zbGljZSgpO1xuIFx0XHR3aGlsZShxdWV1ZS5sZW5ndGggPiAwKSB7XG4gXHRcdFx0dmFyIG1vZHVsZUlkID0gcXVldWUucG9wKCk7XG4gXHRcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xuIFx0XHRcdGlmKCFtb2R1bGUpIGNvbnRpbnVlO1xuXG4gXHRcdFx0dmFyIGRhdGEgPSB7fTtcblxuIFx0XHRcdC8vIENhbGwgZGlzcG9zZSBoYW5kbGVyc1xuIFx0XHRcdHZhciBkaXNwb3NlSGFuZGxlcnMgPSBtb2R1bGUuaG90Ll9kaXNwb3NlSGFuZGxlcnM7XG4gXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRpc3Bvc2VIYW5kbGVycy5sZW5ndGg7IGorKykge1xuIFx0XHRcdFx0dmFyIGNiID0gZGlzcG9zZUhhbmRsZXJzW2pdO1xuIFx0XHRcdFx0Y2IoZGF0YSk7XG4gXHRcdFx0fVxuIFx0XHRcdGhvdEN1cnJlbnRNb2R1bGVEYXRhW21vZHVsZUlkXSA9IGRhdGE7XG5cbiBcdFx0XHQvLyBkaXNhYmxlIG1vZHVsZSAodGhpcyBkaXNhYmxlcyByZXF1aXJlcyBmcm9tIHRoaXMgbW9kdWxlKVxuIFx0XHRcdG1vZHVsZS5ob3QuYWN0aXZlID0gZmFsc2U7XG5cbiBcdFx0XHQvLyByZW1vdmUgbW9kdWxlIGZyb20gY2FjaGVcbiBcdFx0XHRkZWxldGUgaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XG5cbiBcdFx0XHQvLyByZW1vdmUgXCJwYXJlbnRzXCIgcmVmZXJlbmNlcyBmcm9tIGFsbCBjaGlsZHJlblxuIFx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBtb2R1bGUuY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbiBcdFx0XHRcdHZhciBjaGlsZCA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlLmNoaWxkcmVuW2pdXTtcbiBcdFx0XHRcdGlmKCFjaGlsZCkgY29udGludWU7XG4gXHRcdFx0XHR2YXIgaWR4ID0gY2hpbGQucGFyZW50cy5pbmRleE9mKG1vZHVsZUlkKTtcbiBcdFx0XHRcdGlmKGlkeCA+PSAwKSB7XG4gXHRcdFx0XHRcdGNoaWxkLnBhcmVudHMuc3BsaWNlKGlkeCwgMSk7XG4gXHRcdFx0XHR9XG4gXHRcdFx0fVxuIFx0XHR9XG5cbiBcdFx0Ly8gcmVtb3ZlIG91dGRhdGVkIGRlcGVuZGVuY3kgZnJvbSBtb2R1bGUgY2hpbGRyZW5cbiBcdFx0Zm9yKHZhciBtb2R1bGVJZCBpbiBvdXRkYXRlZERlcGVuZGVuY2llcykge1xuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvdXRkYXRlZERlcGVuZGVuY2llcywgbW9kdWxlSWQpKSB7XG4gXHRcdFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XG4gXHRcdFx0XHR2YXIgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMgPSBvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF07XG4gXHRcdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMubGVuZ3RoOyBqKyspIHtcbiBcdFx0XHRcdFx0dmFyIGRlcGVuZGVuY3kgPSBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llc1tqXTtcbiBcdFx0XHRcdFx0dmFyIGlkeCA9IG1vZHVsZS5jaGlsZHJlbi5pbmRleE9mKGRlcGVuZGVuY3kpO1xuIFx0XHRcdFx0XHRpZihpZHggPj0gMCkgbW9kdWxlLmNoaWxkcmVuLnNwbGljZShpZHgsIDEpO1xuIFx0XHRcdFx0fVxuIFx0XHRcdH1cbiBcdFx0fVxuXG4gXHRcdC8vIE5vdCBpbiBcImFwcGx5XCIgcGhhc2VcbiBcdFx0aG90U2V0U3RhdHVzKFwiYXBwbHlcIik7XG5cbiBcdFx0aG90Q3VycmVudEhhc2ggPSBob3RVcGRhdGVOZXdIYXNoO1xuXG4gXHRcdC8vIGluc2VydCBuZXcgY29kZVxuIFx0XHRmb3IodmFyIG1vZHVsZUlkIGluIGFwcGxpZWRVcGRhdGUpIHtcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXBwbGllZFVwZGF0ZSwgbW9kdWxlSWQpKSB7XG4gXHRcdFx0XHRtb2R1bGVzW21vZHVsZUlkXSA9IGFwcGxpZWRVcGRhdGVbbW9kdWxlSWRdO1xuIFx0XHRcdH1cbiBcdFx0fVxuXG4gXHRcdC8vIGNhbGwgYWNjZXB0IGhhbmRsZXJzXG4gXHRcdHZhciBlcnJvciA9IG51bGw7XG4gXHRcdGZvcih2YXIgbW9kdWxlSWQgaW4gb3V0ZGF0ZWREZXBlbmRlbmNpZXMpIHtcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob3V0ZGF0ZWREZXBlbmRlbmNpZXMsIG1vZHVsZUlkKSkge1xuIFx0XHRcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xuIFx0XHRcdFx0dmFyIG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzID0gb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdO1xuIFx0XHRcdFx0dmFyIGNhbGxiYWNrcyA9IFtdO1xuIFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzLmxlbmd0aDsgaSsrKSB7XG4gXHRcdFx0XHRcdHZhciBkZXBlbmRlbmN5ID0gbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXNbaV07XG4gXHRcdFx0XHRcdHZhciBjYiA9IG1vZHVsZS5ob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcGVuZGVuY3ldO1xuIFx0XHRcdFx0XHRpZihjYWxsYmFja3MuaW5kZXhPZihjYikgPj0gMCkgY29udGludWU7XG4gXHRcdFx0XHRcdGNhbGxiYWNrcy5wdXNoKGNiKTtcbiBcdFx0XHRcdH1cbiBcdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiBcdFx0XHRcdFx0dmFyIGNiID0gY2FsbGJhY2tzW2ldO1xuIFx0XHRcdFx0XHR0cnkge1xuIFx0XHRcdFx0XHRcdGNiKG91dGRhdGVkRGVwZW5kZW5jaWVzKTtcbiBcdFx0XHRcdFx0fSBjYXRjaChlcnIpIHtcbiBcdFx0XHRcdFx0XHRpZighZXJyb3IpXG4gXHRcdFx0XHRcdFx0XHRlcnJvciA9IGVycjtcbiBcdFx0XHRcdFx0fVxuIFx0XHRcdFx0fVxuIFx0XHRcdH1cbiBcdFx0fVxuXG4gXHRcdC8vIExvYWQgc2VsZiBhY2NlcHRlZCBtb2R1bGVzXG4gXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMubGVuZ3RoOyBpKyspIHtcbiBcdFx0XHR2YXIgaXRlbSA9IG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlc1tpXTtcbiBcdFx0XHR2YXIgbW9kdWxlSWQgPSBpdGVtLm1vZHVsZTtcbiBcdFx0XHRob3RDdXJyZW50UGFyZW50cyA9IFttb2R1bGVJZF07XG4gXHRcdFx0dHJ5IHtcbiBcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpO1xuIFx0XHRcdH0gY2F0Y2goZXJyKSB7XG4gXHRcdFx0XHRpZih0eXBlb2YgaXRlbS5lcnJvckhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuIFx0XHRcdFx0XHR0cnkge1xuIFx0XHRcdFx0XHRcdGl0ZW0uZXJyb3JIYW5kbGVyKGVycik7XG4gXHRcdFx0XHRcdH0gY2F0Y2goZXJyKSB7XG4gXHRcdFx0XHRcdFx0aWYoIWVycm9yKVxuIFx0XHRcdFx0XHRcdFx0ZXJyb3IgPSBlcnI7XG4gXHRcdFx0XHRcdH1cbiBcdFx0XHRcdH0gZWxzZSBpZighZXJyb3IpXG4gXHRcdFx0XHRcdGVycm9yID0gZXJyO1xuIFx0XHRcdH1cbiBcdFx0fVxuXG4gXHRcdC8vIGhhbmRsZSBlcnJvcnMgaW4gYWNjZXB0IGhhbmRsZXJzIGFuZCBzZWxmIGFjY2VwdGVkIG1vZHVsZSBsb2FkXG4gXHRcdGlmKGVycm9yKSB7XG4gXHRcdFx0aG90U2V0U3RhdHVzKFwiZmFpbFwiKTtcbiBcdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyb3IpO1xuIFx0XHR9XG5cbiBcdFx0aG90U2V0U3RhdHVzKFwiaWRsZVwiKTtcbiBcdFx0Y2FsbGJhY2sobnVsbCwgb3V0ZGF0ZWRNb2R1bGVzKTtcbiBcdH1cblxuIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlLFxuIFx0XHRcdGhvdDogaG90Q3JlYXRlTW9kdWxlKG1vZHVsZUlkKSxcbiBcdFx0XHRwYXJlbnRzOiBob3RDdXJyZW50UGFyZW50cyxcbiBcdFx0XHRjaGlsZHJlbjogW11cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgaG90Q3JlYXRlUmVxdWlyZShtb2R1bGVJZCkpO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiaHR0cDovL2xvY2FsaG9zdDo1MDAxL1wiO1xuXG4gXHQvLyBfX3dlYnBhY2tfaGFzaF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmggPSBmdW5jdGlvbigpIHsgcmV0dXJuIGhvdEN1cnJlbnRIYXNoOyB9O1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBob3RDcmVhdGVSZXF1aXJlKDApKDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDFkODM2MGNmYWRhZWE3YTMwODU4IiwiLyogZ2xvYmFsICQgalF1ZXJ5IENQTyBDb2RlTWlycm9yIHN0b3JhZ2VBUEkgUSBjcmVhdGVQcm9ncmFtQ29sbGVjdGlvbkFQSSBtYWtlU2hhcmVBUEkgKi9cblxuLy92YXIgc2hhcmVBUEkgPSBtYWtlU2hhcmVBUEkocHJvY2Vzcy5lbnYuQ1VSUkVOVF9QWVJFVF9SRUxFQVNFKTtcbnZhciBzaGFyZUFQSSA9IG1ha2VTaGFyZUFQSShlbnZfQ1VSUkVOVF9QWVJFVF9SRUxFQVNFKTtcblxudmFyIHVybCA9IHJlcXVpcmUoJ3VybC5qcycpO1xuXG5jb25zdCBMT0cgPSB0cnVlO1xud2luZG93LmN0X2xvZyA9IGZ1bmN0aW9uKC8qIHZhcmFyZ3MgKi8pIHtcbiAgaWYgKHdpbmRvdy5jb25zb2xlICYmIExPRykge1xuICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIH1cbn07XG5cbndpbmRvdy5jdF9lcnJvciA9IGZ1bmN0aW9uKC8qIHZhcmFyZ3MgKi8pIHtcbiAgaWYgKHdpbmRvdy5jb25zb2xlICYmIExPRykge1xuICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgfVxufTtcbnZhciBpbml0aWFsUGFyYW1zID0gdXJsLnBhcnNlKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYpO1xudmFyIHBhcmFtcyA9IHVybC5wYXJzZShcIi8/XCIgKyBpbml0aWFsUGFyYW1zW1wiaGFzaFwiXSk7XG53aW5kb3cuaGlnaGxpZ2h0TW9kZSA9IFwibWNtaFwiOyAvLyB3aGF0IGlzIHRoaXMgZm9yP1xud2luZG93LmNsZWFyRmxhc2ggPSBmdW5jdGlvbigpIHtcbiAgJChcIi5ub3RpZmljYXRpb25BcmVhXCIpLmVtcHR5KCk7XG59XG53aW5kb3cuc3RpY2tFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UsIG1vcmUpIHtcbiAgY2xlYXJGbGFzaCgpO1xuICB2YXIgZXJyID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiZXJyb3JcIikudGV4dChtZXNzYWdlKTtcbiAgaWYobW9yZSkge1xuICAgIGVyci5hdHRyKFwidGl0bGVcIiwgbW9yZSk7XG4gIH1cbiAgZXJyLnRvb2x0aXAoKTtcbiAgJChcIi5ub3RpZmljYXRpb25BcmVhXCIpLnByZXBlbmQoZXJyKTtcbn07XG53aW5kb3cuZmxhc2hFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgY2xlYXJGbGFzaCgpO1xuICB2YXIgZXJyID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiZXJyb3JcIikudGV4dChtZXNzYWdlKTtcbiAgJChcIi5ub3RpZmljYXRpb25BcmVhXCIpLnByZXBlbmQoZXJyKTtcbiAgZXJyLmZhZGVPdXQoNzAwMCk7XG59O1xud2luZG93LmZsYXNoTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgY2xlYXJGbGFzaCgpO1xuICB2YXIgbXNnID0gJChcIjxkaXY+XCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpLnRleHQobWVzc2FnZSk7XG4gICQoXCIubm90aWZpY2F0aW9uQXJlYVwiKS5wcmVwZW5kKG1zZyk7XG4gIG1zZy5mYWRlT3V0KDcwMDApO1xufTtcbndpbmRvdy5zdGlja01lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gIGNsZWFyRmxhc2goKTtcbiAgdmFyIGVyciA9ICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKS50ZXh0KG1lc3NhZ2UpO1xuICAkKFwiLm5vdGlmaWNhdGlvbkFyZWFcIikucHJlcGVuZChlcnIpO1xufTtcbndpbmRvdy5ta1dhcm5pbmdVcHBlciA9IGZ1bmN0aW9uKCl7cmV0dXJuICQoXCI8ZGl2IGNsYXNzPSd3YXJuaW5nLXVwcGVyJz5cIik7fVxud2luZG93Lm1rV2FybmluZ0xvd2VyID0gZnVuY3Rpb24oKXtyZXR1cm4gJChcIjxkaXYgY2xhc3M9J3dhcm5pbmctbG93ZXInPlwiKTt9XG5cbiQod2luZG93KS5iaW5kKFwiYmVmb3JldW5sb2FkXCIsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gXCJCZWNhdXNlIHRoaXMgcGFnZSBjYW4gbG9hZCBzbG93bHksIGFuZCB5b3UgbWF5IGhhdmUgb3V0c3RhbmRpbmcgY2hhbmdlcywgd2UgYXNrIHRoYXQgeW91IGNvbmZpcm0gYmVmb3JlIGxlYXZpbmcgdGhlIGVkaXRvciBpbiBjYXNlIGNsb3Npbmcgd2FzIGFuIGFjY2lkZW50LlwiO1xufSk7XG5cbnZhciBEb2N1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgXG4gIGZ1bmN0aW9uIERvY3VtZW50cygpIHtcbiAgICB0aGlzLmRvY3VtZW50cyA9IG5ldyBNYXAoKTtcbiAgfVxuICBcbiAgRG9jdW1lbnRzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50cy5oYXMobmFtZSk7XG4gIH07XG5cbiAgRG9jdW1lbnRzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50cy5nZXQobmFtZSk7XG4gIH07XG5cbiAgRG9jdW1lbnRzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAobmFtZSwgZG9jKSB7XG4gICAgaWYobG9nZ2VyLmlzRGV0YWlsZWQpXG4gICAgICBsb2dnZXIubG9nKFwiZG9jLnNldFwiLCB7bmFtZTogbmFtZSwgdmFsdWU6IGRvYy5nZXRWYWx1ZSgpfSk7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnRzLnNldChuYW1lLCBkb2MpO1xuICB9O1xuICBcbiAgRG9jdW1lbnRzLnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmKGxvZ2dlci5pc0RldGFpbGVkKVxuICAgICAgbG9nZ2VyLmxvZyhcImRvYy5kZWxcIiwge25hbWU6IG5hbWV9KTtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuZGVsZXRlKG5hbWUpO1xuICB9O1xuXG4gIERvY3VtZW50cy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChmKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnRzLmZvckVhY2goZik7XG4gIH07XG5cbiAgcmV0dXJuIERvY3VtZW50cztcbn0oKTtcblxud2luZG93LkNQTyA9IHtcbiAgc2F2ZTogZnVuY3Rpb24oKSB7fSxcbiAgYXV0b1NhdmU6IGZ1bmN0aW9uKCkge30sXG4gIGRvY3VtZW50cyA6IG5ldyBEb2N1bWVudHMoKVxufTtcbiQoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIG1lcmdlKG9iaiwgZXh0ZW5zaW9uKSB7XG4gICAgdmFyIG5ld29iaiA9IHt9O1xuICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgICBuZXdvYmpba10gPSBvYmpba107XG4gICAgfSk7XG4gICAgT2JqZWN0LmtleXMoZXh0ZW5zaW9uKS5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICAgIG5ld29ialtrXSA9IGV4dGVuc2lvbltrXTtcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3b2JqO1xuICB9XG4gIHZhciBhbmltYXRpb25EaXYgPSBudWxsO1xuICBmdW5jdGlvbiBjbG9zZUFuaW1hdGlvbklmT3BlbigpIHtcbiAgICBpZihhbmltYXRpb25EaXYpIHtcbiAgICAgIGFuaW1hdGlvbkRpdi5lbXB0eSgpO1xuICAgICAgYW5pbWF0aW9uRGl2LmRpYWxvZyhcImRlc3Ryb3lcIik7XG4gICAgICBhbmltYXRpb25EaXYgPSBudWxsO1xuICAgIH1cbiAgfVxuICBDUE8ubWFrZUVkaXRvciA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIHZhciBpbml0aWFsID0gXCJcIjtcbiAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShcImluaXRpYWxcIikpIHtcbiAgICAgIGluaXRpYWwgPSBvcHRpb25zLmluaXRpYWw7XG4gICAgfVxuXG4gICAgdmFyIHRleHRhcmVhID0galF1ZXJ5KFwiPHRleHRhcmVhPlwiKTtcbiAgICB0ZXh0YXJlYS52YWwoaW5pdGlhbCk7XG4gICAgY29udGFpbmVyLmFwcGVuZCh0ZXh0YXJlYSk7XG5cbiAgICB2YXIgcnVuRnVuID0gZnVuY3Rpb24gKGNvZGUsIHJlcGxPcHRpb25zKSB7XG4gICAgICBvcHRpb25zLnJ1bihjb2RlLCB7Y206IENNfSwgcmVwbE9wdGlvbnMpO1xuICAgIH07XG5cbiAgICB2YXIgdXNlTGluZU51bWJlcnMgPSAhb3B0aW9ucy5zaW1wbGVFZGl0b3I7XG4gICAgdmFyIHVzZUZvbGRpbmcgPSAhb3B0aW9ucy5zaW1wbGVFZGl0b3I7XG5cbiAgICB2YXIgZ3V0dGVycyA9ICFvcHRpb25zLnNpbXBsZUVkaXRvciA/XG4gICAgICBbXCJDb2RlTWlycm9yLWxpbmVudW1iZXJzXCIsIFwiQ29kZU1pcnJvci1mb2xkZ3V0dGVyXCJdIDpcbiAgICAgIFtdO1xuXG4gICAgZnVuY3Rpb24gcmVpbmRlbnRBbGxMaW5lcyhjbSkge1xuICAgICAgdmFyIGxhc3QgPSBjbS5saW5lQ291bnQoKTtcbiAgICAgIGNtLm9wZXJhdGlvbihmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0OyArK2kpIGNtLmluZGVudExpbmUoaSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgY21PcHRpb25zID0ge1xuICAgICAgZXh0cmFLZXlzOiB7XG4gICAgICAgIFwiU2hpZnQtRW50ZXJcIjogZnVuY3Rpb24oY20pIHsgcnVuRnVuKGNtLmdldFZhbHVlKCkpOyB9LFxuICAgICAgICBcIlNoaWZ0LUN0cmwtRW50ZXJcIjogZnVuY3Rpb24oY20pIHsgcnVuRnVuKGNtLmdldFZhbHVlKCkpOyB9LFxuICAgICAgICBcIlRhYlwiOiBcImluZGVudEF1dG9cIixcbiAgICAgICAgXCJDdHJsLUlcIjogcmVpbmRlbnRBbGxMaW5lc1xuICAgICAgfSxcbiAgICAgIGluZGVudFVuaXQ6IDIsXG4gICAgICB0YWJTaXplOiAyLFxuICAgICAgdmlld3BvcnRNYXJnaW46IEluZmluaXR5LFxuICAgICAgbGluZU51bWJlcnM6IHVzZUxpbmVOdW1iZXJzLFxuICAgICAgbWF0Y2hLZXl3b3JkczogdHJ1ZSxcbiAgICAgIG1hdGNoQnJhY2tldHM6IHRydWUsXG4gICAgICBzdHlsZVNlbGVjdGVkVGV4dDogdHJ1ZSxcbiAgICAgIGZvbGRHdXR0ZXI6IHVzZUZvbGRpbmcsXG4gICAgICBndXR0ZXJzOiBndXR0ZXJzLFxuICAgICAgbGluZVdyYXBwaW5nOiB0cnVlLFxuICAgICAgbG9nZ2luZzogdHJ1ZVxuICAgIH07XG5cbiAgICBjbU9wdGlvbnMgPSBtZXJnZShjbU9wdGlvbnMsIG9wdGlvbnMuY21PcHRpb25zIHx8IHt9KTtcblxuICAgIHZhciBDTSA9IENvZGVNaXJyb3IuZnJvbVRleHRBcmVhKHRleHRhcmVhWzBdLCBjbU9wdGlvbnMpO1xuXG4gICAgdmFyIENNYmxvY2tzO1xuXG4gICAgaWYgKHR5cGVvZiBDb2RlTWlycm9yQmxvY2tzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc29sZS5sb2coJ0NvZGVNaXJyb3JCbG9ja3Mgbm90IGZvdW5kJyk7XG4gICAgICBDTWJsb2NrcyA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgQ01ibG9ja3MgPSBuZXcgQ29kZU1pcnJvckJsb2NrcyhDTSxcbiAgICAgICAgJ3dlc2NoZW1lJyxcbiAgICAgICAge1xuICAgICAgICAgIHdpbGxJbnNlcnROb2RlOiBmdW5jdGlvbihzb3VyY2VOb2RlVGV4dCwgc291cmNlTm9kZSwgZGVzdGluYXRpb24pIHtcbiAgICAgICAgICAgIHZhciBsaW5lID0gQ00uZWRpdG9yLmdldExpbmUoZGVzdGluYXRpb24ubGluZSk7XG4gICAgICAgICAgICBpZiAoZGVzdGluYXRpb24uY2ggPiAwICYmIGxpbmVbZGVzdGluYXRpb24uY2ggLSAxXS5tYXRjaCgvW1xcd1xcZF0vKSkge1xuICAgICAgICAgICAgICAvLyBwcmV2aW91cyBjaGFyYWN0ZXIgaXMgYSBsZXR0ZXIgb3IgbnVtYmVyLCBzbyBwcmVmaXggYSBzcGFjZVxuICAgICAgICAgICAgICBzb3VyY2VOb2RlVGV4dCA9ICcgJyArIHNvdXJjZU5vZGVUZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVzdGluYXRpb24uY2ggPCBsaW5lLmxlbmd0aCAmJiBsaW5lW2Rlc3RpbmF0aW9uLmNoXS5tYXRjaCgvW1xcd1xcZF0vKSkge1xuICAgICAgICAgICAgICAvLyBuZXh0IGNoYXJhY3RlciBpcyBhIGxldHRlciBvciBhIG51bWJlciwgc28gYXBwZW5kIGEgc3BhY2VcbiAgICAgICAgICAgICAgc291cmNlTm9kZVRleHQgKz0gJyAnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZU5vZGVUZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICBDTS5ibG9ja3NFZGl0b3IgPSBDTWJsb2NrcztcbiAgICAgIENNLmNoYW5nZU1vZGUgPSBmdW5jdGlvbihtb2RlKSB7XG4gICAgICAgIGlmIChtb2RlID09PSBcImZhbHNlXCIpIHtcbiAgICAgICAgICBtb2RlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgQ01ibG9ja3MuYXN0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBDTWJsb2Nrcy5zZXRCbG9ja01vZGUobW9kZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHVzZUxpbmVOdW1iZXJzKSB7XG4gICAgICBDTS5kaXNwbGF5LndyYXBwZXIuYXBwZW5kQ2hpbGQobWtXYXJuaW5nVXBwZXIoKVswXSk7XG4gICAgICBDTS5kaXNwbGF5LndyYXBwZXIuYXBwZW5kQ2hpbGQobWtXYXJuaW5nTG93ZXIoKVswXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNtOiBDTSxcbiAgICAgIHJlZnJlc2g6IGZ1bmN0aW9uKCkgeyBDTS5yZWZyZXNoKCk7IH0sXG4gICAgICBydW46IGZ1bmN0aW9uKCkge1xuICAgICAgICBydW5GdW4oQ00uZ2V0VmFsdWUoKSk7XG4gICAgICB9LFxuICAgICAgZm9jdXM6IGZ1bmN0aW9uKCkgeyBDTS5mb2N1cygpOyB9XG4gICAgfTtcbiAgfTtcbiAgQ1BPLlJVTl9DT0RFID0gZnVuY3Rpb24oKSB7XG5cbiAgfTtcblxuICBzdG9yYWdlQVBJLnRoZW4oZnVuY3Rpb24oYXBpKSB7XG4gICAgYXBpLmNvbGxlY3Rpb24udGhlbihmdW5jdGlvbigpIHtcbiAgICAgICQoXCIubG9naW5Pbmx5XCIpLnNob3coKTtcbiAgICAgICQoXCIubG9nb3V0T25seVwiKS5oaWRlKCk7XG4gICAgICBhcGkuYXBpLmdldENvbGxlY3Rpb25MaW5rKCkudGhlbihmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICQoXCIjZHJpdmUtdmlldyBhXCIpLmF0dHIoXCJocmVmXCIsIGxpbmspO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgYXBpLmNvbGxlY3Rpb24uZmFpbChmdW5jdGlvbigpIHtcbiAgICAgICQoXCIubG9naW5Pbmx5XCIpLmhpZGUoKTtcbiAgICAgICQoXCIubG9nb3V0T25seVwiKS5zaG93KCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHN0b3JhZ2VBUEkgPSBzdG9yYWdlQVBJLnRoZW4oZnVuY3Rpb24oYXBpKSB7IHJldHVybiBhcGkuYXBpOyB9KTtcbiAgJChcIiNjb25uZWN0QnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICQoXCIjY29ubmVjdEJ1dHRvblwiKS50ZXh0KFwiQ29ubmVjdGluZy4uLlwiKTtcbiAgICAkKFwiI2Nvbm5lY3RCdXR0b25cIikuYXR0cihcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XG4gICAgc3RvcmFnZUFQSSA9IGNyZWF0ZVByb2dyYW1Db2xsZWN0aW9uQVBJKFwiY29kZS5weXJldC5vcmdcIiwgZmFsc2UpO1xuICAgIHN0b3JhZ2VBUEkudGhlbihmdW5jdGlvbihhcGkpIHtcbiAgICAgIGFwaS5jb2xsZWN0aW9uLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICQoXCIubG9naW5Pbmx5XCIpLnNob3coKTtcbiAgICAgICAgJChcIi5sb2dvdXRPbmx5XCIpLmhpZGUoKTtcbiAgICAgICAgYXBpLmFwaS5nZXRDb2xsZWN0aW9uTGluaygpLnRoZW4oZnVuY3Rpb24obGluaykge1xuICAgICAgICAgICQoXCIjZHJpdmUtdmlldyBhXCIpLmF0dHIoXCJocmVmXCIsIGxpbmspO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYocGFyYW1zW1wiZ2V0XCJdICYmIHBhcmFtc1tcImdldFwiXVtcInByb2dyYW1cIl0pIHtcbiAgICAgICAgICB2YXIgdG9Mb2FkID0gYXBpLmFwaS5nZXRGaWxlQnlJZChwYXJhbXNbXCJnZXRcIl1bXCJwcm9ncmFtXCJdKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbiBhbmQgaGFzIHByb2dyYW0gdG8gbG9hZDogXCIsIHRvTG9hZCk7XG4gICAgICAgICAgbG9hZFByb2dyYW0odG9Mb2FkKTtcbiAgICAgICAgICBwcm9ncmFtVG9TYXZlID0gdG9Mb2FkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb2dyYW1Ub1NhdmUgPSBRLmZjYWxsKGZ1bmN0aW9uKCkgeyByZXR1cm4gbnVsbDsgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYXBpLmNvbGxlY3Rpb24uZmFpbChmdW5jdGlvbigpIHtcbiAgICAgICAgJChcIiNjb25uZWN0QnV0dG9uXCIpLnRleHQoXCJDb25uZWN0IHRvIEdvb2dsZSBEcml2ZVwiKTtcbiAgICAgICAgJChcIiNjb25uZWN0QnV0dG9uXCIpLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBzdG9yYWdlQVBJID0gc3RvcmFnZUFQSS50aGVuKGZ1bmN0aW9uKGFwaSkgeyByZXR1cm4gYXBpLmFwaTsgfSk7XG4gIH0pO1xuXG4gIHZhciBjb3B5T25TYXZlID0gZmFsc2U7XG5cbiAgdmFyIGluaXRpYWxQcm9ncmFtID0gc3RvcmFnZUFQSS50aGVuKGZ1bmN0aW9uKGFwaSkge1xuICAgIHZhciBwcm9ncmFtTG9hZCA9IG51bGw7XG4gICAgaWYocGFyYW1zW1wiZ2V0XCJdICYmIHBhcmFtc1tcImdldFwiXVtcInByb2dyYW1cIl0pIHtcbiAgICAgIHByb2dyYW1Mb2FkID0gYXBpLmdldEZpbGVCeUlkKHBhcmFtc1tcImdldFwiXVtcInByb2dyYW1cIl0pO1xuICAgICAgcHJvZ3JhbUxvYWQudGhlbihmdW5jdGlvbihwKSB7IHNob3dTaGFyZUNvbnRhaW5lcihwKTsgfSk7XG4gICAgfVxuICAgIGlmKHBhcmFtc1tcImdldFwiXSAmJiBwYXJhbXNbXCJnZXRcIl1bXCJzaGFyZVwiXSkge1xuICAgICAgcHJvZ3JhbUxvYWQgPSBhcGkuZ2V0U2hhcmVkRmlsZUJ5SWQocGFyYW1zW1wiZ2V0XCJdW1wic2hhcmVcIl0pO1xuICAgICAgJChcIiNzYXZlQnV0dG9uXCIpLnRleHQoXCJTYXZlIGEgQ29weVwiKTtcbiAgICAgIGNvcHlPblNhdmUgPSB0cnVlO1xuICAgIH1cbiAgICBpZihwcm9ncmFtTG9hZCkge1xuICAgICAgcHJvZ3JhbUxvYWQuZmFpbChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB3aW5kb3cuc3RpY2tFcnJvcihcIlRoZSBwcm9ncmFtIGZhaWxlZCB0byBsb2FkLlwiKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHByb2dyYW1Mb2FkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHNldFRpdGxlKHByb2dOYW1lKSB7XG4gICAgZG9jdW1lbnQudGl0bGUgPSBwcm9nTmFtZSArIFwiIC0gY29kZS5weXJldC5vcmdcIjtcbiAgfVxuICBDUE8uc2V0VGl0bGUgPSBzZXRUaXRsZTtcblxuICAkKFwiI2Rvd25sb2FkIGFcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRvd25sb2FkRWx0ID0gJChcIiNkb3dubG9hZCBhXCIpO1xuICAgIHZhciBjb250ZW50cyA9IENQTy5lZGl0b3IuY20uZ2V0VmFsdWUoKTtcbiAgICB2YXIgZG93bmxvYWRCbG9iID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW2NvbnRlbnRzXSwge3R5cGU6ICd0ZXh0L3BsYWluJ30pKTtcbiAgICB2YXIgZmlsZW5hbWUgPSAkKFwiI3Byb2dyYW0tbmFtZVwiKS52YWwoKTtcbiAgICBpZighZmlsZW5hbWUpIHsgZmlsZW5hbWUgPSAndW50aXRsZWRfcHJvZ3JhbS5hcnInOyB9XG4gICAgaWYoZmlsZW5hbWUuaW5kZXhPZihcIi5hcnJcIikgIT09IChmaWxlbmFtZS5sZW5ndGggLSA0KSkge1xuICAgICAgZmlsZW5hbWUgKz0gXCIuYXJyXCI7XG4gICAgfVxuICAgIGRvd25sb2FkRWx0LmF0dHIoe1xuICAgICAgZG93bmxvYWQ6IGZpbGVuYW1lLFxuICAgICAgaHJlZjogZG93bmxvYWRCbG9iXG4gICAgfSk7XG4gICAgJChcIiNkb3dubG9hZFwiKS5hcHBlbmQoZG93bmxvYWRFbHQpO1xuICB9KTtcblxuICBmdW5jdGlvbiBsb2FkUHJvZ3JhbShwKSB7XG4gICAgcmV0dXJuIHAudGhlbihmdW5jdGlvbihwKSB7XG4gICAgICBpZihwICE9PSBudWxsKSB7XG4gICAgICAgICQoXCIjcHJvZ3JhbS1uYW1lXCIpLnZhbChwLmdldE5hbWUoKSk7XG4gICAgICAgIHNldFRpdGxlKHAuZ2V0TmFtZSgpKTtcbiAgICAgICAgcmV0dXJuIHAuZ2V0Q29udGVudHMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHZhciBwcm9ncmFtTG9hZGVkID0gbG9hZFByb2dyYW0oaW5pdGlhbFByb2dyYW0pO1xuXG4gIHZhciBwcm9ncmFtVG9TYXZlID0gaW5pdGlhbFByb2dyYW07XG5cbiAgZnVuY3Rpb24gc2hvd1NoYXJlQ29udGFpbmVyKHApIHtcbiAgICAkKFwiI3NoYXJlQ29udGFpbmVyXCIpLmVtcHR5KCk7XG4gICAgJChcIiNzaGFyZUNvbnRhaW5lclwiKS5hcHBlbmQoc2hhcmVBUEkubWFrZVNoYXJlTGluayhwKSk7XG4gIH1cblxuICBmdW5jdGlvbiBuYW1lT3JVbnRpdGxlZCgpIHtcbiAgICByZXR1cm4gJChcIiNwcm9ncmFtLW5hbWVcIikudmFsKCkgfHwgXCJVbnRpdGxlZFwiO1xuICB9XG4gIGZ1bmN0aW9uIGF1dG9TYXZlKCkge1xuICAgIHByb2dyYW1Ub1NhdmUudGhlbihmdW5jdGlvbihwKSB7XG4gICAgICBpZihwICE9PSBudWxsICYmICFjb3B5T25TYXZlKSB7IHNhdmUoKTsgfVxuICAgIH0pO1xuICB9XG4gIENQTy5hdXRvU2F2ZSA9IGF1dG9TYXZlO1xuICBDUE8uc2hvd1NoYXJlQ29udGFpbmVyID0gc2hvd1NoYXJlQ29udGFpbmVyO1xuICBDUE8ubG9hZFByb2dyYW0gPSBsb2FkUHJvZ3JhbTtcblxuICBmdW5jdGlvbiBzYXZlKCkge1xuICAgIHdpbmRvdy5zdGlja01lc3NhZ2UoXCJTYXZpbmcuLi5cIik7XG4gICAgdmFyIHNhdmVkUHJvZ3JhbSA9IHByb2dyYW1Ub1NhdmUudGhlbihmdW5jdGlvbihwKSB7XG4gICAgICBpZihwICE9PSBudWxsICYmICFjb3B5T25TYXZlKSB7XG4gICAgICAgIGlmKHAuZ2V0TmFtZSgpICE9PSAkKFwiI3Byb2dyYW0tbmFtZVwiKS52YWwoKSkge1xuICAgICAgICAgIHByb2dyYW1Ub1NhdmUgPSBwLnJlbmFtZShuYW1lT3JVbnRpdGxlZCgpKS50aGVuKGZ1bmN0aW9uKG5ld1ApIHtcbiAgICAgICAgICAgIHJldHVybiBuZXdQO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9ncmFtVG9TYXZlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICBzaG93U2hhcmVDb250YWluZXIocCk7XG4gICAgICAgICAgcmV0dXJuIHAuc2F2ZShDUE8uZWRpdG9yLmNtLmdldFZhbHVlKCksIGZhbHNlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocCkge1xuICAgICAgICAgICQoXCIjcHJvZ3JhbS1uYW1lXCIpLnZhbChwLmdldE5hbWUoKSk7XG4gICAgICAgICAgJChcIiNzYXZlQnV0dG9uXCIpLnRleHQoXCJTYXZlXCIpO1xuICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIFwiI3Byb2dyYW09XCIgKyBwLmdldFVuaXF1ZUlkKCkpO1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gXCIjcHJvZ3JhbT1cIiArIHAuZ2V0VW5pcXVlSWQoKTtcbiAgICAgICAgICB3aW5kb3cuZmxhc2hNZXNzYWdlKFwiUHJvZ3JhbSBzYXZlZCBhcyBcIiArIHAuZ2V0TmFtZSgpKTtcbiAgICAgICAgICBzZXRUaXRsZShwLmdldE5hbWUoKSk7XG4gICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBwcm9ncmFtTmFtZSA9ICQoXCIjcHJvZ3JhbS1uYW1lXCIpLnZhbCgpIHx8IFwiVW50aXRsZWRcIjtcbiAgICAgICAgJChcIiNwcm9ncmFtLW5hbWVcIikudmFsKHByb2dyYW1OYW1lKTtcbiAgICAgICAgcHJvZ3JhbVRvU2F2ZSA9IHN0b3JhZ2VBUElcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihhcGkpIHsgcmV0dXJuIGFwaS5jcmVhdGVGaWxlKHByb2dyYW1OYW1lKTsgfSk7XG4gICAgICAgIGNvcHlPblNhdmUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHNhdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBzYXZlZFByb2dyYW0uZmFpbChmdW5jdGlvbihlcnIpIHtcbiAgICAgIHdpbmRvdy5zdGlja0Vycm9yKFwiVW5hYmxlIHRvIHNhdmVcIiwgXCJZb3VyIGludGVybmV0IGNvbm5lY3Rpb24gbWF5IGJlIGRvd24sIG9yIHNvbWV0aGluZyBlbHNlIG1pZ2h0IGJlIHdyb25nIHdpdGggdGhpcyBzaXRlIG9yIHNhdmluZyB0byBHb29nbGUuICBZb3Ugc2hvdWxkIGJhY2sgdXAgYW55IGNoYW5nZXMgdG8gdGhpcyBwcm9ncmFtIHNvbWV3aGVyZSBlbHNlLiAgWW91IGNhbiB0cnkgc2F2aW5nIGFnYWluIHRvIHNlZSBpZiB0aGUgcHJvYmxlbSB3YXMgdGVtcG9yYXJ5LCBhcyB3ZWxsLlwiKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9KTtcbiAgfVxuICBDUE8uc2F2ZSA9IHNhdmU7XG4gICQoXCIjcnVuQnV0dG9uXCIpLmNsaWNrKENQTy5hdXRvU2F2ZSk7XG4gICQoXCIjc2F2ZUJ1dHRvblwiKS5jbGljayhzYXZlKTtcbiAgc2hhcmVBUEkubWFrZUhvdmVyTWVudSgkKFwiI21lbnVcIiksICQoXCIjbWVudUNvbnRlbnRzXCIpLCBmYWxzZSwgZnVuY3Rpb24oKXt9KTtcblxuICB2YXIgY29kZUNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcInJlcGxNYWluXCIpO1xuICAkKFwiI21haW5cIikucHJlcGVuZChjb2RlQ29udGFpbmVyKTtcblxuICBDUE8uZWRpdG9yID0gQ1BPLm1ha2VFZGl0b3IoY29kZUNvbnRhaW5lciwge1xuICAgIHJ1bkJ1dHRvbjogJChcIiNydW5CdXR0b25cIiksXG4gICAgc2ltcGxlRWRpdG9yOiBmYWxzZSxcbiAgICBydW46IENQTy5SVU5fQ09ERSxcbiAgICBpbml0aWFsR2FzOiAxMDBcbiAgfSk7XG4gIENQTy5lZGl0b3IuY20uc2V0T3B0aW9uKFwicmVhZE9ubHlcIiwgXCJub2N1cnNvclwiKTtcbiAgXG4gIHByb2dyYW1Mb2FkZWQudGhlbihmdW5jdGlvbihjKSB7XG4gICAgQ1BPLmRvY3VtZW50cy5zZXQoXCJkZWZpbml0aW9uczovL1wiLCBDUE8uZWRpdG9yLmNtLmdldERvYygpKTtcbiAgICBcbiAgICAvLyBOT1RFKGpvZSk6IENsZWFyaW5nIGhpc3RvcnkgdG8gYWRkcmVzcyBodHRwczovL2dpdGh1Yi5jb20vYnJvd25wbHQvcHlyZXQtbGFuZy9pc3N1ZXMvMzg2LFxuICAgIC8vIGluIHdoaWNoIHVuZG8gY2FuIHJldmVydCB0aGUgcHJvZ3JhbSBiYWNrIHRvIGVtcHR5XG4gICAgQ1BPLmVkaXRvci5jbS5jbGVhckhpc3RvcnkoKTtcbiAgICBDUE8uZWRpdG9yLmNtLnNldFZhbHVlKGMpO1xuICB9KTtcblxuICBwcm9ncmFtTG9hZGVkLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgQ1BPLmRvY3VtZW50cy5zZXQoXCJkZWZpbml0aW9uczovL1wiLCBDUE8uZWRpdG9yLmNtLmdldERvYygpKTtcbiAgfSk7XG5cbiAgdmFyIHB5cmV0TG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAvKlxuICBjb25zb2xlLmxvZygncHJvY2Vzcy5lbnYgaXMnLCBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudikpO1xuICBjb25zb2xlLmxvZygncHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCBpcycsIHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSUQpO1xuICBjb25zb2xlLmxvZygncHJvY2Vzcy5lbnYuUkVESVNDTE9VRF9VUkwgaXMnLCBwcm9jZXNzLmVudi5SRURJU0NMT1VEX1VSTCk7XG4gIGNvbnNvbGUubG9nKCdwcm9jZXNzLmVudi5CQVNFX1VSTCBpcycsIHByb2Nlc3MuZW52LkJBU0VfVVJMKTtcbiAgY29uc29sZS5sb2coJ3Byb2Nlc3MuZW52LlNFU1NJT05fU0VDUkVUIGlzJywgcHJvY2Vzcy5lbnYuU0VTU0lPTl9TRUNSRVQpO1xuICBjb25zb2xlLmxvZygncHJvY2Vzcy5lbnYuQ1VSUkVOVF9QWVJFVF9SRUxFQVNFIGlzJywgcHJvY2Vzcy5lbnYuQ1VSUkVOVF9QWVJFVF9SRUxFQVNFKTtcbiAgY29uc29sZS5sb2coJ3Byb2Nlc3MuZW52LlBZUkVUIGlzJywgcHJvY2Vzcy5lbnYuUFlSRVQpO1xuICBjb25zb2xlLmxvZygncHJvY2Vzcy5lbnYuUFlSRVRfUkVMRUFTRV9CQVNFIGlzJywgcHJvY2Vzcy5lbnYuUFlSRVRfUkVMRUFTRV9CQVNFKTtcbiAgY29uc29sZS5sb2coJ2NsaWVudElkIGlzJywgY2xpZW50SWQpO1xuICAqL1xuICAvL2NvbnNvbGUubG9nKHByb2Nlc3MuZW52LlBZUkVUKTtcbiAgLy9weXJldExvYWQuc3JjID0gcHJvY2Vzcy5lbnYuUFlSRVQ7XG4gIGNvbnNvbGUubG9nKCdlbnZfUFlSRVQgaXMnLCBlbnZfUFlSRVQpO1xuICBweXJldExvYWQuc3JjID0gZW52X1BZUkVUO1xuICBweXJldExvYWQudHlwZSA9IFwidGV4dC9qYXZhc2NyaXB0XCI7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocHlyZXRMb2FkKTtcbiAgJChweXJldExvYWQpLm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24oKSB7XG4gICAgJChcIiNsb2FkZXJcIikuaGlkZSgpO1xuICAgICQoXCIjcnVuUGFydFwiKS5oaWRlKCk7XG4gICAgJChcIiNicmVha0J1dHRvblwiKS5oaWRlKCk7XG4gICAgd2luZG93LnN0aWNrRXJyb3IoXCJQeXJldCBmYWlsZWQgdG8gbG9hZDsgY2hlY2sgeW91ciBjb25uZWN0aW9uIG9yIHRyeSByZWZyZXNoaW5nIHRoZSBwYWdlLiAgSWYgdGhpcyBoYXBwZW5zIHJlcGVhdGVkbHksIHBsZWFzZSByZXBvcnQgaXQgYXMgYSBidWcuXCIpO1xuICB9KTtcblxuICBwcm9ncmFtTG9hZGVkLmZpbihmdW5jdGlvbigpIHtcbiAgICBDUE8uZWRpdG9yLmZvY3VzKCk7XG4gICAgQ1BPLmVkaXRvci5jbS5zZXRPcHRpb24oXCJyZWFkT25seVwiLCBmYWxzZSk7XG4gIH0pO1xuXG59KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy93ZWIvanMvYmVmb3JlUHlyZXQuanMiLCIvLyBDb3B5cmlnaHQgMjAxMy0yMDE0IEtldmluIENveFxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogIFRoaXMgc29mdHdhcmUgaXMgcHJvdmlkZWQgJ2FzLWlzJywgd2l0aG91dCBhbnkgZXhwcmVzcyBvciBpbXBsaWVkICAgICAgICAgICAqXG4qICB3YXJyYW50eS4gSW4gbm8gZXZlbnQgd2lsbCB0aGUgYXV0aG9ycyBiZSBoZWxkIGxpYWJsZSBmb3IgYW55IGRhbWFnZXMgICAgICAgKlxuKiAgYXJpc2luZyBmcm9tIHRoZSB1c2Ugb2YgdGhpcyBzb2Z0d2FyZS4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICBQZXJtaXNzaW9uIGlzIGdyYW50ZWQgdG8gYW55b25lIHRvIHVzZSB0aGlzIHNvZnR3YXJlIGZvciBhbnkgcHVycG9zZSwgICAgICAgKlxuKiAgaW5jbHVkaW5nIGNvbW1lcmNpYWwgYXBwbGljYXRpb25zLCBhbmQgdG8gYWx0ZXIgaXQgYW5kIHJlZGlzdHJpYnV0ZSBpdCAgICAgICpcbiogIGZyZWVseSwgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIHJlc3RyaWN0aW9uczogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuKiAgMS4gVGhlIG9yaWdpbiBvZiB0aGlzIHNvZnR3YXJlIG11c3Qgbm90IGJlIG1pc3JlcHJlc2VudGVkOyB5b3UgbXVzdCBub3QgICAgICpcbiogICAgIGNsYWltIHRoYXQgeW91IHdyb3RlIHRoZSBvcmlnaW5hbCBzb2Z0d2FyZS4gSWYgeW91IHVzZSB0aGlzIHNvZnR3YXJlIGluICAqXG4qICAgICBhIHByb2R1Y3QsIGFuIGFja25vd2xlZGdtZW50IGluIHRoZSBwcm9kdWN0IGRvY3VtZW50YXRpb24gd291bGQgYmUgICAgICAgKlxuKiAgICAgYXBwcmVjaWF0ZWQgYnV0IGlzIG5vdCByZXF1aXJlZC4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICAyLiBBbHRlcmVkIHNvdXJjZSB2ZXJzaW9ucyBtdXN0IGJlIHBsYWlubHkgbWFya2VkIGFzIHN1Y2gsIGFuZCBtdXN0IG5vdCBiZSAgKlxuKiAgICAgbWlzcmVwcmVzZW50ZWQgYXMgYmVpbmcgdGhlIG9yaWdpbmFsIHNvZnR3YXJlLiAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4qICAzLiBUaGlzIG5vdGljZSBtYXkgbm90IGJlIHJlbW92ZWQgb3IgYWx0ZXJlZCBmcm9tIGFueSBzb3VyY2UgZGlzdHJpYnV0aW9uLiAgKlxuKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbitmdW5jdGlvbigpe1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBhcnJheSA9IC9cXFsoW15cXFtdKilcXF0kLztcblxuLy8vIFVSTCBSZWdleC5cbi8qKlxuICogVGhpcyByZWdleCBzcGxpdHMgdGhlIFVSTCBpbnRvIHBhcnRzLiAgVGhlIGNhcHR1cmUgZ3JvdXBzIGNhdGNoIHRoZSBpbXBvcnRhbnRcbiAqIGJpdHMuXG4gKiBcbiAqIEVhY2ggc2VjdGlvbiBpcyBvcHRpb25hbCwgc28gdG8gd29yayBvbiBhbnkgcGFydCBmaW5kIHRoZSBjb3JyZWN0IHRvcCBsZXZlbFxuICogYCguLi4pP2AgYW5kIG1lc3MgYXJvdW5kIHdpdGggaXQuXG4gKi9cbnZhciByZWdleCA9IC9eKD86KFthLXpdKik6KT8oPzpcXC9cXC8pPyg/OihbXjpAXSopKD86OihbXkBdKikpP0ApPyhbYS16LS5fXSspPyg/OjooWzAtOV0qKSk/KFxcL1tePyNdKik/KD86XFw/KFteI10qKSk/KD86IyguKikpPyQvaTtcbi8vICAgICAgICAgICAgICAgMSAtIHNjaGVtZSAgICAgICAgICAgICAgICAyIC0gdXNlciAgICAzID0gcGFzcyA0IC0gaG9zdCAgICAgICAgNSAtIHBvcnQgIDYgLSBwYXRoICAgICAgICA3IC0gcXVlcnkgICAgOCAtIGhhc2hcblxudmFyIG5vc2xhc2ggPSBbXCJtYWlsdG9cIixcImJpdGNvaW5cIl07XG5cbnZhciBzZWxmID0ge1xuXHQvKiogUGFyc2UgYSBxdWVyeSBzdHJpbmcuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcGFyc2VzIGEgcXVlcnkgc3RyaW5nIChzb21ldGltZXMgY2FsbGVkIHRoZSBzZWFyY2hcblx0ICogc3RyaW5nKS4gIEl0IHRha2VzIGEgcXVlcnkgc3RyaW5nIGFuZCByZXR1cm5zIGEgbWFwIG9mIHRoZSByZXN1bHRzLlxuXHQgKlxuXHQgKiBLZXlzIGFyZSBjb25zaWRlcmVkIHRvIGJlIGV2ZXJ5dGhpbmcgdXAgdG8gdGhlIGZpcnN0ICc9JyBhbmQgdmFsdWVzIGFyZVxuXHQgKiBldmVyeXRoaW5nIGFmdGVyd29yZHMuICBTaW5jZSBVUkwtZGVjb2RpbmcgaXMgZG9uZSBhZnRlciBwYXJzaW5nLCBrZXlzXG5cdCAqIGFuZCB2YWx1ZXMgY2FuIGhhdmUgYW55IHZhbHVlcywgaG93ZXZlciwgJz0nIGhhdmUgdG8gYmUgZW5jb2RlZCBpbiBrZXlzXG5cdCAqIHdoaWxlICc/JyBhbmQgJyYnIGhhdmUgdG8gYmUgZW5jb2RlZCBhbnl3aGVyZSAoYXMgdGhleSBkZWxpbWl0IHRoZVxuXHQgKiBrdi1wYWlycykuXG5cdCAqXG5cdCAqIEtleXMgYW5kIHZhbHVlcyB3aWxsIGFsd2F5cyBiZSBzdHJpbmdzLCBleGNlcHQgaWYgdGhlcmUgaXMgYSBrZXkgd2l0aCBub1xuXHQgKiAnPScgaW4gd2hpY2ggY2FzZSBpdCB3aWxsIGJlIGNvbnNpZGVyZWQgYSBmbGFnIGFuZCB3aWxsIGJlIHNldCB0byB0cnVlLlxuXHQgKiBMYXRlciB2YWx1ZXMgd2lsbCBvdmVycmlkZSBlYXJsaWVyIHZhbHVlcy5cblx0ICpcblx0ICogQXJyYXkga2V5cyBhcmUgYWxzbyBzdXBwb3J0ZWQuICBCeSBkZWZhdWx0IGtleXMgaW4gdGhlIGZvcm0gb2YgYG5hbWVbaV1gXG5cdCAqIHdpbGwgYmUgcmV0dXJuZWQgbGlrZSB0aGF0IGFzIHN0cmluZ3MuICBIb3dldmVyLCBpZiB5b3Ugc2V0IHRoZSBgYXJyYXlgXG5cdCAqIGZsYWcgaW4gdGhlIG9wdGlvbnMgb2JqZWN0IHRoZXkgd2lsbCBiZSBwYXJzZWQgaW50byBhcnJheXMuICBOb3RlIHRoYXRcblx0ICogYWx0aG91Z2ggdGhlIG9iamVjdCByZXR1cm5lZCBpcyBhbiBgQXJyYXlgIG9iamVjdCBhbGwga2V5cyB3aWxsIGJlXG5cdCAqIHdyaXR0ZW4gdG8gaXQuICBUaGlzIG1lYW5zIHRoYXQgaWYgeW91IGhhdmUgYSBrZXkgc3VjaCBhcyBga1tmb3JFYWNoXWBcblx0ICogaXQgd2lsbCBvdmVyd3JpdGUgdGhlIGBmb3JFYWNoYCBmdW5jdGlvbiBvbiB0aGF0IGFycmF5LiAgQWxzbyBub3RlIHRoYXRcblx0ICogc3RyaW5nIHByb3BlcnRpZXMgYWx3YXlzIHRha2UgcHJlY2VkZW5jZSBvdmVyIGFycmF5IHByb3BlcnRpZXMsXG5cdCAqIGlycmVzcGVjdGl2ZSBvZiB3aGVyZSB0aGV5IGFyZSBpbiB0aGUgcXVlcnkgc3RyaW5nLlxuXHQgKlxuXHQgKiAgIHVybC5nZXQoXCJhcnJheVsxXT10ZXN0JmFycmF5W2Zvb109YmFyXCIse2FycmF5OnRydWV9KS5hcnJheVsxXSAgPT09IFwidGVzdFwiXG5cdCAqICAgdXJsLmdldChcImFycmF5WzFdPXRlc3QmYXJyYXlbZm9vXT1iYXJcIix7YXJyYXk6dHJ1ZX0pLmFycmF5LmZvbyA9PT0gXCJiYXJcIlxuXHQgKiAgIHVybC5nZXQoXCJhcnJheT1ub3RhbmFycmF5JmFycmF5WzBdPTFcIix7YXJyYXk6dHJ1ZX0pLmFycmF5ICAgICAgPT09IFwibm90YW5hcnJheVwiXG5cdCAqXG5cdCAqIElmIGFycmF5IHBhcnNpbmcgaXMgZW5hYmxlZCBrZXlzIGluIHRoZSBmb3JtIG9mIGBuYW1lW11gIHdpbGxcblx0ICogYXV0b21hdGljYWxseSBiZSBnaXZlbiB0aGUgbmV4dCBhdmFpbGFibGUgaW5kZXguICBOb3RlIHRoYXQgdGhpcyBjYW4gYmVcblx0ICogb3ZlcndyaXR0ZW4gd2l0aCBsYXRlciB2YWx1ZXMgaW4gdGhlIHF1ZXJ5IHN0cmluZy4gIEZvciB0aGlzIHJlYXNvbiBpc1xuXHQgKiBpcyBiZXN0IG5vdCB0byBtaXggdGhlIHR3byBmb3JtYXRzLCBhbHRob3VnaCBpdCBpcyBzYWZlIChhbmQgb2Z0ZW5cblx0ICogdXNlZnVsKSB0byBhZGQgYW4gYXV0b21hdGljIGluZGV4IGFyZ3VtZW50IHRvIHRoZSBlbmQgb2YgYSBxdWVyeSBzdHJpbmcuXG5cdCAqXG5cdCAqICAgdXJsLmdldChcImFbXT0wJmFbXT0xJmFbMF09MlwiLCB7YXJyYXk6dHJ1ZX0pICAtPiB7YTpbXCIyXCIsXCIxXCJdfTtcblx0ICogICB1cmwuZ2V0KFwiYVswXT0wJmFbMV09MSZhW109MlwiLCB7YXJyYXk6dHJ1ZX0pIC0+IHthOltcIjBcIixcIjFcIixcIjJcIl19O1xuXHQgKlxuXHQgKiBAcGFyYW17c3RyaW5nfSBxIFRoZSBxdWVyeSBzdHJpbmcgKHRoZSBwYXJ0IGFmdGVyIHRoZSAnPycpLlxuXHQgKiBAcGFyYW17e2Z1bGw6Ym9vbGVhbixhcnJheTpib29sZWFufT19IG9wdCBPcHRpb25zLlxuXHQgKlxuXHQgKiAtIGZ1bGw6IElmIHNldCBgcWAgd2lsbCBiZSB0cmVhdGVkIGFzIGEgZnVsbCB1cmwgYW5kIGBxYCB3aWxsIGJlIGJ1aWx0LlxuXHQgKiAgIGJ5IGNhbGxpbmcgI3BhcnNlIHRvIHJldHJpZXZlIHRoZSBxdWVyeSBwb3J0aW9uLlxuXHQgKiAtIGFycmF5OiBJZiBzZXQga2V5cyBpbiB0aGUgZm9ybSBvZiBga2V5W2ldYCB3aWxsIGJlIHRyZWF0ZWRcblx0ICogICBhcyBhcnJheXMvbWFwcy5cblx0ICpcblx0ICogQHJldHVybnshT2JqZWN0LjxzdHJpbmcsIHN0cmluZ3xBcnJheT59IFRoZSBwYXJzZWQgcmVzdWx0LlxuXHQgKi9cblx0XCJnZXRcIjogZnVuY3Rpb24ocSwgb3B0KXtcblx0XHRxID0gcSB8fCBcIlwiO1xuXHRcdGlmICggdHlwZW9mIG9wdCAgICAgICAgICA9PSBcInVuZGVmaW5lZFwiICkgb3B0ID0ge307XG5cdFx0aWYgKCB0eXBlb2Ygb3B0W1wiZnVsbFwiXSAgPT0gXCJ1bmRlZmluZWRcIiApIG9wdFtcImZ1bGxcIl0gPSBmYWxzZTtcblx0XHRpZiAoIHR5cGVvZiBvcHRbXCJhcnJheVwiXSA9PSBcInVuZGVmaW5lZFwiICkgb3B0W1wiYXJyYXlcIl0gPSBmYWxzZTtcblx0XHRcblx0XHRpZiAoIG9wdFtcImZ1bGxcIl0gPT09IHRydWUgKVxuXHRcdHtcblx0XHRcdHEgPSBzZWxmW1wicGFyc2VcIl0ocSwge1wiZ2V0XCI6ZmFsc2V9KVtcInF1ZXJ5XCJdIHx8IFwiXCI7XG5cdFx0fVxuXHRcdFxuXHRcdHZhciBvID0ge307XG5cdFx0XG5cdFx0dmFyIGMgPSBxLnNwbGl0KFwiJlwiKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGMubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKCFjW2ldLmxlbmd0aCkgY29udGludWU7XG5cdFx0XHRcblx0XHRcdHZhciBkID0gY1tpXS5pbmRleE9mKFwiPVwiKTtcblx0XHRcdHZhciBrID0gY1tpXSwgdiA9IHRydWU7XG5cdFx0XHRpZiAoIGQgPj0gMCApXG5cdFx0XHR7XG5cdFx0XHRcdGsgPSBjW2ldLnN1YnN0cigwLCBkKTtcblx0XHRcdFx0diA9IGNbaV0uc3Vic3RyKGQrMSk7XG5cdFx0XHRcdFxuXHRcdFx0XHR2ID0gZGVjb2RlVVJJQ29tcG9uZW50KHYpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAob3B0W1wiYXJyYXlcIl0pXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBpbmRzID0gW107XG5cdFx0XHRcdHZhciBpbmQ7XG5cdFx0XHRcdHZhciBjdXJvID0gbztcblx0XHRcdFx0dmFyIGN1cmsgPSBrO1xuXHRcdFx0XHR3aGlsZSAoaW5kID0gY3Vyay5tYXRjaChhcnJheSkpIC8vIEFycmF5IVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y3VyayA9IGN1cmsuc3Vic3RyKDAsIGluZC5pbmRleCk7XG5cdFx0XHRcdFx0aW5kcy51bnNoaWZ0KGRlY29kZVVSSUNvbXBvbmVudChpbmRbMV0pKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjdXJrID0gZGVjb2RlVVJJQ29tcG9uZW50KGN1cmspO1xuXHRcdFx0XHRpZiAoaW5kcy5zb21lKGZ1bmN0aW9uKGkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoIHR5cGVvZiBjdXJvW2N1cmtdID09IFwidW5kZWZpbmVkXCIgKSBjdXJvW2N1cmtdID0gW107XG5cdFx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KGN1cm9bY3Vya10pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJ1cmwuZ2V0OiBBcnJheSBwcm9wZXJ0eSBcIitjdXJrK1wiIGFscmVhZHkgZXhpc3RzIGFzIHN0cmluZyFcIik7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y3VybyA9IGN1cm9bY3Vya107XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKCBpID09PSBcIlwiICkgaSA9IGN1cm8ubGVuZ3RoO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGN1cmsgPSBpO1xuXHRcdFx0XHR9KSkgY29udGludWU7XG5cdFx0XHRcdGN1cm9bY3Vya10gPSB2O1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0ayA9IGRlY29kZVVSSUNvbXBvbmVudChrKTtcblx0XHRcdFxuXHRcdFx0Ly90eXBlb2Ygb1trXSA9PSBcInVuZGVmaW5lZFwiIHx8IGNvbnNvbGUubG9nKFwiUHJvcGVydHkgXCIraytcIiBhbHJlYWR5IGV4aXN0cyFcIik7XG5cdFx0XHRvW2tdID0gdjtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG87XG5cdH0sXG5cdFxuXHQvKiogQnVpbGQgYSBnZXQgcXVlcnkgZnJvbSBhbiBvYmplY3QuXG5cdCAqXG5cdCAqIFRoaXMgY29uc3RydWN0cyBhIHF1ZXJ5IHN0cmluZyBmcm9tIHRoZSBrdiBwYWlycyBpbiBgZGF0YWAuICBDYWxsaW5nXG5cdCAqICNnZXQgb24gdGhlIHN0cmluZyByZXR1cm5lZCBzaG91bGQgcmV0dXJuIGFuIG9iamVjdCBpZGVudGljYWwgdG8gdGhlIG9uZVxuXHQgKiBwYXNzZWQgaW4gZXhjZXB0IGFsbCBub24tYm9vbGVhbiBzY2FsYXIgdHlwZXMgYmVjb21lIHN0cmluZ3MgYW5kIGFsbFxuXHQgKiBvYmplY3QgdHlwZXMgYmVjb21lIGFycmF5cyAobm9uLWludGVnZXIga2V5cyBhcmUgc3RpbGwgcHJlc2VudCwgc2VlXG5cdCAqICNnZXQncyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGRldGFpbHMpLlxuXHQgKlxuXHQgKiBUaGlzIGFsd2F5cyB1c2VzIGFycmF5IHN5bnRheCBmb3IgZGVzY3JpYmluZyBhcnJheXMuICBJZiB5b3Ugd2FudCB0b1xuXHQgKiBzZXJpYWxpemUgdGhlbSBkaWZmZXJlbnRseSAobGlrZSBoYXZpbmcgdGhlIHZhbHVlIGJlIGEgSlNPTiBhcnJheSBhbmRcblx0ICogaGF2ZSBhIHBsYWluIGtleSkgeW91IHdpbGwgbmVlZCB0byBkbyB0aGF0IGJlZm9yZSBwYXNzaW5nIGl0IGluLlxuXHQgKlxuXHQgKiBBbGwga2V5cyBhbmQgdmFsdWVzIGFyZSBzdXBwb3J0ZWQgKGJpbmFyeSBkYXRhIGFueW9uZT8pIGFzIHRoZXkgYXJlXG5cdCAqIHByb3Blcmx5IFVSTC1lbmNvZGVkIGFuZCAjZ2V0IHByb3Blcmx5IGRlY29kZXMuXG5cdCAqXG5cdCAqIEBwYXJhbXtPYmplY3R9IGRhdGEgVGhlIGt2IHBhaXJzLlxuXHQgKiBAcGFyYW17c3RyaW5nfSBwcmVmaXggVGhlIHByb3Blcmx5IGVuY29kZWQgYXJyYXkga2V5IHRvIHB1dCB0aGVcblx0ICogICBwcm9wZXJ0aWVzLiAgTWFpbmx5IGludGVuZGVkIGZvciBpbnRlcm5hbCB1c2UuXG5cdCAqIEByZXR1cm57c3RyaW5nfSBBIFVSTC1zYWZlIHN0cmluZy5cblx0ICovXG5cdFwiYnVpbGRnZXRcIjogZnVuY3Rpb24oZGF0YSwgcHJlZml4KXtcblx0XHR2YXIgaXRtcyA9IFtdO1xuXHRcdGZvciAoIHZhciBrIGluIGRhdGEgKVxuXHRcdHtcblx0XHRcdHZhciBlayA9IGVuY29kZVVSSUNvbXBvbmVudChrKTtcblx0XHRcdGlmICggdHlwZW9mIHByZWZpeCAhPSBcInVuZGVmaW5lZFwiIClcblx0XHRcdFx0ZWsgPSBwcmVmaXgrXCJbXCIrZWsrXCJdXCI7XG5cdFx0XHRcblx0XHRcdHZhciB2ID0gZGF0YVtrXTtcblx0XHRcdFxuXHRcdFx0c3dpdGNoICh0eXBlb2Ygdilcblx0XHRcdHtcblx0XHRcdFx0Y2FzZSAnYm9vbGVhbic6XG5cdFx0XHRcdFx0aWYodikgaXRtcy5wdXNoKGVrKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnbnVtYmVyJzpcblx0XHRcdFx0XHR2ID0gdi50b1N0cmluZygpO1xuXHRcdFx0XHRjYXNlICdzdHJpbmcnOlxuXHRcdFx0XHRcdGl0bXMucHVzaChlaytcIj1cIitlbmNvZGVVUklDb21wb25lbnQodikpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdvYmplY3QnOlxuXHRcdFx0XHRcdGl0bXMucHVzaChzZWxmW1wiYnVpbGRnZXRcIl0odiwgZWspKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGl0bXMuam9pbihcIiZcIik7XG5cdH0sXG5cdFxuXHQvKiogUGFyc2UgYSBVUkxcblx0ICogXG5cdCAqIFRoaXMgYnJlYWtzIHVwIGEgVVJMIGludG8gY29tcG9uZW50cy4gIEl0IGF0dGVtcHRzIHRvIGJlIHZlcnkgbGliZXJhbFxuXHQgKiBhbmQgcmV0dXJucyB0aGUgYmVzdCByZXN1bHQgaW4gbW9zdCBjYXNlcy4gIFRoaXMgbWVhbnMgdGhhdCB5b3UgY2FuXG5cdCAqIG9mdGVuIHBhc3MgaW4gcGFydCBvZiBhIFVSTCBhbmQgZ2V0IGNvcnJlY3QgY2F0ZWdvcmllcyBiYWNrLiAgTm90YWJseSxcblx0ICogdGhpcyB3b3JrcyBmb3IgZW1haWxzIGFuZCBKYWJiZXIgSURzLCBhcyB3ZWxsIGFzIGFkZGluZyBhICc/JyB0byB0aGVcblx0ICogYmVnaW5uaW5nIG9mIGEgc3RyaW5nIHdpbGwgcGFyc2UgdGhlIHdob2xlIHRoaW5nIGFzIGEgcXVlcnkgc3RyaW5nLiAgSWZcblx0ICogYW4gaXRlbSBpcyBub3QgZm91bmQgdGhlIHByb3BlcnR5IHdpbGwgYmUgdW5kZWZpbmVkLiAgSW4gc29tZSBjYXNlcyBhblxuXHQgKiBlbXB0eSBzdHJpbmcgd2lsbCBiZSByZXR1cm5lZCBpZiB0aGUgc3Vycm91bmRpbmcgc3ludGF4IGJ1dCB0aGUgYWN0dWFsXG5cdCAqIHZhbHVlIGlzIGVtcHR5IChleGFtcGxlOiBcIjovL2V4YW1wbGUuY29tXCIgd2lsbCBnaXZlIGEgZW1wdHkgc3RyaW5nIGZvclxuXHQgKiBzY2hlbWUuKSAgTm90YWJseSB0aGUgaG9zdCBuYW1lIHdpbGwgYWx3YXlzIGJlIHNldCB0byBzb21ldGhpbmcuXG5cdCAqIFxuXHQgKiBSZXR1cm5lZCBwcm9wZXJ0aWVzLlxuXHQgKiBcblx0ICogLSAqKnNjaGVtZToqKiBUaGUgdXJsIHNjaGVtZS4gKGV4OiBcIm1haWx0b1wiIG9yIFwiaHR0cHNcIilcblx0ICogLSAqKnVzZXI6KiogVGhlIHVzZXJuYW1lLlxuXHQgKiAtICoqcGFzczoqKiBUaGUgcGFzc3dvcmQuXG5cdCAqIC0gKipob3N0OioqIFRoZSBob3N0bmFtZS4gKGV4OiBcImxvY2FsaG9zdFwiLCBcIjEyMy40NTYuNy44XCIgb3IgXCJleGFtcGxlLmNvbVwiKVxuXHQgKiAtICoqcG9ydDoqKiBUaGUgcG9ydCwgYXMgYSBudW1iZXIuIChleDogMTMzNylcblx0ICogLSAqKnBhdGg6KiogVGhlIHBhdGguIChleDogXCIvXCIgb3IgXCIvYWJvdXQuaHRtbFwiKVxuXHQgKiAtICoqcXVlcnk6KiogXCJUaGUgcXVlcnkgc3RyaW5nLiAoZXg6IFwiZm9vPWJhciZ2PTE3JmZvcm1hdD1qc29uXCIpXG5cdCAqIC0gKipnZXQ6KiogVGhlIHF1ZXJ5IHN0cmluZyBwYXJzZWQgd2l0aCBnZXQuICBJZiBgb3B0LmdldGAgaXMgYGZhbHNlYCB0aGlzXG5cdCAqICAgd2lsbCBiZSBhYnNlbnRcblx0ICogLSAqKmhhc2g6KiogVGhlIHZhbHVlIGFmdGVyIHRoZSBoYXNoLiAoZXg6IFwibXlhbmNob3JcIilcblx0ICogICBiZSB1bmRlZmluZWQgZXZlbiBpZiBgcXVlcnlgIGlzIHNldC5cblx0ICpcblx0ICogQHBhcmFte3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gcGFyc2UuXG5cdCAqIEBwYXJhbXt7Z2V0Ok9iamVjdH09fSBvcHQgT3B0aW9uczpcblx0ICpcblx0ICogLSBnZXQ6IEFuIG9wdGlvbnMgYXJndW1lbnQgdG8gYmUgcGFzc2VkIHRvICNnZXQgb3IgZmFsc2UgdG8gbm90IGNhbGwgI2dldC5cblx0ICogICAgKipETyBOT1QqKiBzZXQgYGZ1bGxgLlxuXHQgKlxuXHQgKiBAcmV0dXJueyFPYmplY3R9IEFuIG9iamVjdCB3aXRoIHRoZSBwYXJzZWQgdmFsdWVzLlxuXHQgKi9cblx0XCJwYXJzZVwiOiBmdW5jdGlvbih1cmwsIG9wdCkge1xuXHRcdFxuXHRcdGlmICggdHlwZW9mIG9wdCA9PSBcInVuZGVmaW5lZFwiICkgb3B0ID0ge307XG5cdFx0XG5cdFx0dmFyIG1kID0gdXJsLm1hdGNoKHJlZ2V4KSB8fCBbXTtcblx0XHRcblx0XHR2YXIgciA9IHtcblx0XHRcdFwidXJsXCI6ICAgIHVybCxcblx0XHRcdFxuXHRcdFx0XCJzY2hlbWVcIjogbWRbMV0sXG5cdFx0XHRcInVzZXJcIjogICBtZFsyXSxcblx0XHRcdFwicGFzc1wiOiAgIG1kWzNdLFxuXHRcdFx0XCJob3N0XCI6ICAgbWRbNF0sXG5cdFx0XHRcInBvcnRcIjogICBtZFs1XSAmJiArbWRbNV0sXG5cdFx0XHRcInBhdGhcIjogICBtZFs2XSxcblx0XHRcdFwicXVlcnlcIjogIG1kWzddLFxuXHRcdFx0XCJoYXNoXCI6ICAgbWRbOF0sXG5cdFx0fTtcblx0XHRcblx0XHRpZiAoIG9wdC5nZXQgIT09IGZhbHNlIClcblx0XHRcdHJbXCJnZXRcIl0gPSByW1wicXVlcnlcIl0gJiYgc2VsZltcImdldFwiXShyW1wicXVlcnlcIl0sIG9wdC5nZXQpO1xuXHRcdFxuXHRcdHJldHVybiByO1xuXHR9LFxuXHRcblx0LyoqIEJ1aWxkIGEgVVJMIGZyb20gY29tcG9uZW50cy5cblx0ICogXG5cdCAqIFRoaXMgcGllY2VzIHRvZ2V0aGVyIGEgdXJsIGZyb20gdGhlIHByb3BlcnRpZXMgb2YgdGhlIHBhc3NlZCBpbiBvYmplY3QuXG5cdCAqIEluIGdlbmVyYWwgcGFzc2luZyB0aGUgcmVzdWx0IG9mIGBwYXJzZSgpYCBzaG91bGQgcmV0dXJuIHRoZSBVUkwuICBUaGVyZVxuXHQgKiBtYXkgZGlmZmVyZW5jZXMgaW4gdGhlIGdldCBzdHJpbmcgYXMgdGhlIGtleXMgYW5kIHZhbHVlcyBtaWdodCBiZSBtb3JlXG5cdCAqIGVuY29kZWQgdGhlbiB0aGV5IHdlcmUgb3JpZ2luYWxseSB3ZXJlLiAgSG93ZXZlciwgY2FsbGluZyBgZ2V0KClgIG9uIHRoZVxuXHQgKiB0d28gdmFsdWVzIHNob3VsZCB5aWVsZCB0aGUgc2FtZSByZXN1bHQuXG5cdCAqIFxuXHQgKiBIZXJlIGlzIGhvdyB0aGUgcGFyYW1ldGVycyBhcmUgdXNlZC5cblx0ICogXG5cdCAqICAtIHVybDogVXNlZCBvbmx5IGlmIG5vIG90aGVyIHZhbHVlcyBhcmUgcHJvdmlkZWQuICBJZiB0aGF0IGlzIHRoZSBjYXNlXG5cdCAqICAgICBgdXJsYCB3aWxsIGJlIHJldHVybmVkIHZlcmJhdGltLlxuXHQgKiAgLSBzY2hlbWU6IFVzZWQgaWYgZGVmaW5lZC5cblx0ICogIC0gdXNlcjogVXNlZCBpZiBkZWZpbmVkLlxuXHQgKiAgLSBwYXNzOiBVc2VkIGlmIGRlZmluZWQuXG5cdCAqICAtIGhvc3Q6IFVzZWQgaWYgZGVmaW5lZC5cblx0ICogIC0gcGF0aDogVXNlZCBpZiBkZWZpbmVkLlxuXHQgKiAgLSBxdWVyeTogVXNlZCBvbmx5IGlmIGBnZXRgIGlzIG5vdCBwcm92aWRlZCBhbmQgbm9uLWVtcHR5LlxuXHQgKiAgLSBnZXQ6IFVzZWQgaWYgbm9uLWVtcHR5LiAgUGFzc2VkIHRvICNidWlsZGdldCBhbmQgdGhlIHJlc3VsdCBpcyB1c2VkXG5cdCAqICAgIGFzIHRoZSBxdWVyeSBzdHJpbmcuXG5cdCAqICAtIGhhc2g6IFVzZWQgaWYgZGVmaW5lZC5cblx0ICogXG5cdCAqIFRoZXNlIGFyZSB0aGUgb3B0aW9ucyB0aGF0IGFyZSB2YWxpZCBvbiB0aGUgb3B0aW9ucyBvYmplY3QuXG5cdCAqIFxuXHQgKiAgLSB1c2VlbXB0eWdldDogSWYgdHJ1dGh5LCBhIHF1ZXN0aW9uIG1hcmsgd2lsbCBiZSBhcHBlbmRlZCBmb3IgZW1wdHkgZ2V0XG5cdCAqICAgIHN0cmluZ3MuICBUaGlzIG5vdGFibHkgbWFrZXMgYGJ1aWxkKClgIGFuZCBgcGFyc2UoKWAgZnVsbHkgc3ltbWV0cmljLlxuXHQgKlxuXHQgKiBAcGFyYW17T2JqZWN0fSBkYXRhIFRoZSBwaWVjZXMgb2YgdGhlIFVSTC5cblx0ICogQHBhcmFte09iamVjdH0gb3B0IE9wdGlvbnMgZm9yIGJ1aWxkaW5nIHRoZSB1cmwuXG5cdCAqIEByZXR1cm57c3RyaW5nfSBUaGUgVVJMLlxuXHQgKi9cblx0XCJidWlsZFwiOiBmdW5jdGlvbihkYXRhLCBvcHQpe1xuXHRcdG9wdCA9IG9wdCB8fCB7fTtcblx0XHRcblx0XHR2YXIgciA9IFwiXCI7XG5cdFx0XG5cdFx0aWYgKCB0eXBlb2YgZGF0YVtcInNjaGVtZVwiXSAhPSBcInVuZGVmaW5lZFwiIClcblx0XHR7XG5cdFx0XHRyICs9IGRhdGFbXCJzY2hlbWVcIl07XG5cdFx0XHRyICs9IChub3NsYXNoLmluZGV4T2YoZGF0YVtcInNjaGVtZVwiXSk+PTApP1wiOlwiOlwiOi8vXCI7XG5cdFx0fVxuXHRcdGlmICggdHlwZW9mIGRhdGFbXCJ1c2VyXCJdICE9IFwidW5kZWZpbmVkXCIgKVxuXHRcdHtcblx0XHRcdHIgKz0gZGF0YVtcInVzZXJcIl07XG5cdFx0XHRpZiAoIHR5cGVvZiBkYXRhW1wicGFzc1wiXSA9PSBcInVuZGVmaW5lZFwiIClcblx0XHRcdHtcblx0XHRcdFx0ciArPSBcIkBcIjtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCB0eXBlb2YgZGF0YVtcInBhc3NcIl0gIT0gXCJ1bmRlZmluZWRcIiApIHIgKz0gXCI6XCIgKyBkYXRhW1wicGFzc1wiXSArIFwiQFwiO1xuXHRcdGlmICggdHlwZW9mIGRhdGFbXCJob3N0XCJdICE9IFwidW5kZWZpbmVkXCIgKSByICs9IGRhdGFbXCJob3N0XCJdO1xuXHRcdGlmICggdHlwZW9mIGRhdGFbXCJwb3J0XCJdICE9IFwidW5kZWZpbmVkXCIgKSByICs9IFwiOlwiICsgZGF0YVtcInBvcnRcIl07XG5cdFx0aWYgKCB0eXBlb2YgZGF0YVtcInBhdGhcIl0gIT0gXCJ1bmRlZmluZWRcIiApIHIgKz0gZGF0YVtcInBhdGhcIl07XG5cdFx0XG5cdFx0aWYgKG9wdFtcInVzZWVtcHR5Z2V0XCJdKVxuXHRcdHtcblx0XHRcdGlmICAgICAgKCB0eXBlb2YgZGF0YVtcImdldFwiXSAgICE9IFwidW5kZWZpbmVkXCIgKSByICs9IFwiP1wiICsgc2VsZltcImJ1aWxkZ2V0XCJdKGRhdGFbXCJnZXRcIl0pO1xuXHRcdFx0ZWxzZSBpZiAoIHR5cGVvZiBkYXRhW1wicXVlcnlcIl0gIT0gXCJ1bmRlZmluZWRcIiApIHIgKz0gXCI/XCIgKyBkYXRhW1wicXVlcnlcIl07XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHQvLyBJZiAuZ2V0IHVzZSBpdC4gIElmIC5nZXQgbGVhZHMgdG8gZW1wdHksIHVzZSAucXVlcnkuXG5cdFx0XHR2YXIgcSA9IGRhdGFbXCJnZXRcIl0gJiYgc2VsZltcImJ1aWxkZ2V0XCJdKGRhdGFbXCJnZXRcIl0pIHx8IGRhdGFbXCJxdWVyeVwiXTtcblx0XHRcdGlmIChxKSByICs9IFwiP1wiICsgcTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKCB0eXBlb2YgZGF0YVtcImhhc2hcIl0gIT0gXCJ1bmRlZmluZWRcIiApIHIgKz0gXCIjXCIgKyBkYXRhW1wiaGFzaFwiXTtcblx0XHRcblx0XHRyZXR1cm4gciB8fCBkYXRhW1widXJsXCJdIHx8IFwiXCI7XG5cdH0sXG59O1xuXG5pZiAoIHR5cGVvZiBkZWZpbmUgIT0gXCJ1bmRlZmluZWRcIiAmJiBkZWZpbmVbXCJhbWRcIl0gKSBkZWZpbmUoc2VsZik7XG5lbHNlIGlmICggdHlwZW9mIG1vZHVsZSAhPSBcInVuZGVmaW5lZFwiICkgbW9kdWxlWydleHBvcnRzJ10gPSBzZWxmO1xuZWxzZSB3aW5kb3dbXCJ1cmxcIl0gPSBzZWxmO1xuXG59KCk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vdXJsLmpzL3VybC5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuXHRpZighbW9kdWxlLndlYnBhY2tQb2x5ZmlsbCkge1xuXHRcdG1vZHVsZS5kZXByZWNhdGUgPSBmdW5jdGlvbigpIHt9O1xuXHRcdG1vZHVsZS5wYXRocyA9IFtdO1xuXHRcdC8vIG1vZHVsZS5wYXJlbnQgPSB1bmRlZmluZWQgYnkgZGVmYXVsdFxuXHRcdG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xuXHRcdG1vZHVsZS53ZWJwYWNrUG9seWZpbGwgPSAxO1xuXHR9XG5cdHJldHVybiBtb2R1bGU7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9tb2R1bGUuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkgeyB0aHJvdyBuZXcgRXJyb3IoXCJkZWZpbmUgY2Fubm90IGJlIHVzZWQgaW5kaXJlY3RcIik7IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9hbWQtZGVmaW5lLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIl0sInNvdXJjZVJvb3QiOiIifQ==