define(['js/js-numbers'], function(jsnums) {
// browser-specific hooks and definitions
var sys = {};

sys.print = function(str) {
	var s = str.toString().replace(new RegExp('\n', 'g'), '<br />');
	document.write(s);
};

sys.error = function(e) {
    if (typeof(console) !== 'undefined' && console.log) {
		if (e.stack) {
			console.log(e.stack);
		}
		else {
			console.log("Error: " + str);
		}
	}
	else {
		var s = e.toString().replace(new RegExp('\n', 'g'), '<br />');
		s = "<br />Error: " + s + "<br />";
		document.write(s);
	}
};


sys.inspect = function(x) {
    // FIXME: add more helpful inspect function that'll show
    // us what's really inside.  Perhaps use toString()?
    return x + '';
};


var DEBUG_ON = false;

var setDebug = function(v) {
    DEBUG_ON = v;
}

var debug = function(s) {
    if (DEBUG_ON) {
	sys.print(s);
    }
}

var debugF = function(f_s) {
    if (DEBUG_ON) {
	sys.print(f_s());
    }
}


var hasOwnProperty = {}.hasOwnProperty;

var deepEqual = function (obj1, obj2) {
    if (obj1 === obj2) {
	return true;
    }

    var i;
    if (obj1 instanceof Array) {
        if (obj2 instanceof Array) {
            for (i = 0; i < obj1.length; i++) {
                if (! deepEqual(obj1[i], obj2[i])) { return false; }
            }
            return true;
        } else {
            return false;
        }        
    }

    if (typeof(obj1) === 'string' || typeof(obj1) === 'number') {
        return obj1 === obj2;
    }

    for (var i in obj1) {
	if ( hasOwnProperty.call(obj1, i) && i !== '_eqHashCode' && i !== '_isList') {
	    if ( !(hasOwnProperty.call(obj2, i) && deepEqual(obj1[i], obj2[i])) )
		return false;
	}
    }
    for (var i in obj2) {
	if ( hasOwnProperty.call(obj2, i) && i !== '_eqHashCode' && i !== '_isList') {
	    if ( !(hasOwnProperty.call(obj1, i) && deepEqual(obj1[i], obj2[i])) )
		return false;
	}
    }
    return true;
}


var assert = {};

assert.equal = function(x, y) {
    if (x !== y) {
	throw new Error('AssertError: ' + x + ' equal ' + y);
    }
}

assert.deepEqual = function(x, y) {
	if ( !deepEqual(x, y) ) {
	    throw new Error('AssertError: ' + x + ' deepEqual ' + y);
	}
}


assert.ok = function(x) {
	if (!x) {
		throw new Error('AssertError: not ok: ' + x );
	}
}


assert.throwsExn = function(f) {
	try {
		f.apply(null, []);
	} catch (e) {
		return;
	}
	throw new Error('AssertError: Throw expected, none received.');
}

/**
 * Copyright 2009 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


//     *
//       void put(Object key, Object value)

//       Sets the value associated with the key supplied. If the hash table already contains the key then the old value is overwritten.
//     *
//       void get(Object key)

//       Returns the value associated with the key supplied, or null if no value is found for that key.
//     *
//       Boolean containsKey(Object key)

//       Returns whether the hash table contains the specified key.
//     *
//       Boolean containsValue(Object value)

//       Returns whether the hash table contains the specified value.
//     *
//       void clear()

//       Removes all entries from the hash table.
//     *
//       Boolean isEmpty()

//       Returns true if the hash table contains no key/value pairs.
//     *
//       Array keys()

//       Returns an array containing all the keys contained in the hash table.
//     *
//       Array values()

//       Returns an array containing all the values contained in the hash table.
//     *
//       void remove(Object key)

//       Removes the key and its corresponding value from the hash table.
//     *
//       Number size()

//       Returns the number of key/value pairs contained in the hash table.


var _Hashtable=(function(){function _1(_2){return(typeof _2==="undefined");};function _3(_4){return(typeof _4==="function");};function _5(_6){return(typeof _6==="string");};function _7(_8,_9){return _3(_8[_9]);};function _a(_b){return _7(_b,"equals");};function _c(_d){return _7(_d,"hashCode");};function _e(_f){if(_5(_f)){return _f;}else{if(_c(_f)){var _10=_f.hashCode();if(!_5(_10)){return _e(_10);}
return _10;}else{if(_7(_f,"toString")){return _f.toString();}else{return String(_f);}}}};function _11(_12,_13){return _12.equals(_13);};function _14(_15,_16){if(_a(_16)){return _16.equals(_15);}else{return _15===_16;}};function _17(o1,o2){return o1===o2;};function _1a(arr,_1c,_1d,_1e,_1f){var _20;for(var i=0,len=arr.length;i<len;i++){_20=arr[i];if(_1f(_1c,_1d(_20))){return _1e?[i,_20]:true;}}
return false;};function _23(arr,idx){if(_7(arr,"splice")){arr.splice(idx,1);}else{if(idx===arr.length-1){arr.length=idx;}else{var _26=arr.slice(idx+1);arr.length=idx;for(var i=0,len=_26.length;i<len;i++){arr[idx+i]=_26[i];}}}};function _29(kv,_2b){if(kv===null){throw new Error("null is not a valid "+_2b);}else{if(_1(kv)){throw new Error(_2b+" must not be undefined");}}};var _2c="key",_2d="value";function _2e(key){_29(key,_2c);};function _30(_31){_29(_31,_2d);};function _32(_33,_34,_35){this.entries=[];this.addEntry(_33,_34);if(_35!==null){this.getEqualityFunction=function(){return _35;};}};function _36(_37){return _37[0];};function _38(_39){return _39[1];};_32.prototype={getEqualityFunction:function(_3a){if(_a(_3a)){return _11;}else{return _14;}},searchForEntry:function(key){return _1a(this.entries,key,_36,true,this.getEqualityFunction(key));},getEntryForKey:function(key){return this.searchForEntry(key)[1];},getEntryIndexForKey:function(key){return this.searchForEntry(key)[0];},removeEntryForKey:function(key){var _3f=this.searchForEntry(key);if(_3f){_23(this.entries,_3f[0]);return true;}
return false;},addEntry:function(key,_41){this.entries[this.entries.length]=[key,_41];},size:function(){return this.entries.length;},keys:function(_42){var _43=_42.length;for(var i=0,len=this.entries.length;i<len;i++){_42[_43+i]=this.entries[i][0];}},values:function(_46){var _47=_46.length;for(var i=0,len=this.entries.length;i<len;i++){_46[_47+i]=this.entries[i][1];}},containsKey:function(key){return _1a(this.entries,key,_36,false,this.getEqualityFunction(key));},containsValue:function(_4b){return _1a(this.entries,_4b,_38,false,_17);}};function _4c(){};_4c.prototype=[];function _4d(_4e){return _4e[0];};function _4f(_50,_51,_52){return _1a(_50,_51,_4d,true,_52);};function _53(_54,_55){var _56=_54[_55];if(_56&&(_56 instanceof _4c)){return _56[1];}
return null;};function _57(_58,_59){var _5a=[];var _5b={};_58=_3(_58)?_58:_e;_59=_3(_59)?_59:null;this.put=function(key,_5d){_2e(key);_30(_5d);var _5e=_58(key);var _5f=_53(_5b,_5e);if(_5f){var _60=_5f.getEntryForKey(key);if(_60){_60[1]=_5d;}else{_5f.addEntry(key,_5d);}}else{var _61=new _4c();_61[0]=_5e;_61[1]=new _32(key,_5d,_59);_5a[_5a.length]=_61;_5b[_5e]=_61;}};this.get=function(key){_2e(key);var _63=_58(key);var _64=_53(_5b,_63);if(_64){var _65=_64.getEntryForKey(key);if(_65){return _65[1];}}
return null;};this.containsKey=function(key){_2e(key);var _67=_58(key);var _68=_53(_5b,_67);if(_68){return _68.containsKey(key);}
return false;};this.containsValue=function(_69){_30(_69);for(var i=0,len=_5a.length;i<len;i++){if(_5a[i][1].containsValue(_69)){return true;}}
return false;};this.clear=function(){_5a.length=0;_5b={};};this.isEmpty=function(){return _5a.length===0;};this.keys=function(){var _6c=[];for(var i=0,len=_5a.length;i<len;i++){_5a[i][1].keys(_6c);}
return _6c;};this.values=function(){var _6f=[];for(var i=0,len=_5a.length;i<len;i++){_5a[i][1].values(_6f);}
return _6f;};this.remove=function(key){_2e(key);var _73=_58(key);var _74=_53(_5b,_73);if(_74){if(_74.removeEntryForKey(key)){if(_74.size()===0){var _75=_4f(_5a,_73,_74.getEqualityFunction(key));_23(_5a,_75[0]);delete _5b[_73];}}}};this.size=function(){var _76=0;for(var i=0,len=_5a.length;i<len;i++){_76+=_5a[i][1].size();}
return _76;};};return _57;})();
//////////////////////////////////////////////////////////////////////
// helper functions

//var jsnums = require('./js-numbers');

var types = {};

(function () {

//////////////////////////////////////////////////////////////////////

var appendChild = function(parent, child) {
    parent.appendChild(child);
};

var hasOwnProperty = {}.hasOwnProperty;

//////////////////////////////////////////////////////////////////////

var _eqHashCodeCounter = 0;
makeEqHashCode = function() {
    _eqHashCodeCounter++;
    return _eqHashCodeCounter;
};

// getHashCode: any -> (or fixnum string)
// Produces a hashcode appropriate for eq.
getEqHashCode = function(x) {
    if (x && !x._eqHashCode) {
	x._eqHashCode = makeEqHashCode();
    }
    if (x && x._eqHashCode) {
	return x._eqHashCode;
    }
    if (typeof(x) == 'string') {
	return x;
    }
    return 0;
};

// Union/find for circular equality testing.

var UnionFind = function() {
	// this.parenMap holds the arrows from an arbitrary pointer
	// to its parent.
	this.parentMap = makeLowLevelEqHash();
}

// find: ptr -> UnionFindNode
// Returns the representative for this ptr.
UnionFind.prototype.find = function(ptr) {
	var parent = (this.parentMap.containsKey(ptr) ?
		      this.parentMap.get(ptr) : ptr);
	if (parent === ptr) {
	    return parent;
	} else {
	    var rep = this.find(parent);
	    // Path compression:
	    this.parentMap.put(ptr, rep);
	    return rep;
	}
};

// merge: ptr ptr -> void
// Merge the representative nodes for ptr1 and ptr2.
UnionFind.prototype.merge = function(ptr1, ptr2) {
	this.parentMap.put(this.find(ptr1), this.find(ptr2));
};

//////////////////////////////////////////////////////////////////////

// Class inheritance infrastructure

// This code copied directly from http://ejohn.org/blog/simple-javascript-inheritance/
var Class = (function(){
	var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	// The base Class implementation (does nothing)
	var innerClass = function(){};

	// Create a new Class that inherits from this class
	innerClass.extend = function(prop) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] == "function" &&
				typeof _super[name] == "function" && fnTest.test(prop[name]) ?
				(function(name, fn){
					return function() {
						var tmp = this._super;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = _super[name];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						var ret = fn.apply(this, arguments);
						this._super = tmp;

						return ret;
					};
				})(name, prop[name]) :
				prop[name];
		}

		// The dummy class constructor
		var Dummy = function() {
			// All construction is actually done in the init method
			if ( !initializing && this.init )
				this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		Dummy.prototype = prototype;

		// Enforce the constructor to be what we expect
		Dummy.constructor = Dummy;

		// And make this class extendable
		Dummy.extend = arguments.callee;

		return Dummy;
	};
	return innerClass;
})();

function makeLParen(){
   var node = document.createElement('span');
   node.appendChild(document.createTextNode("("));
   node.className = "lParen";
   return node;
}

function makeRParen(){
   var node = document.createElement('span');
   node.appendChild(document.createTextNode(")"));
   node.className = "rParen";
   return node;
}

//////////////////////////////////////////////////////////////////////

StructType = function(name, type, numberOfArgs, numberOfFields, firstField,
		      constructor, predicate, accessor, mutator) {
	this.name = name;
	this.type = type;
	this.numberOfArgs = numberOfArgs;
	this.numberOfFields = numberOfFields;
	this.firstField = firstField;

	this.constructor = constructor;
	this.predicate = predicate;
	this.accessor = accessor;
	this.mutator = mutator;
};

StructType.prototype.toString = function() {
	return '#<struct-type:' + this.name + '>';
};

StructType.prototype.isEqual = function(other, aUnionFind) {
	return this === other;
};

var makeStructureType = function(theName, parentType, initFieldCnt, autoFieldCnt, autoV, guard) {
    // If no parent type given, then the parent type is Struct
    if ( !parentType ) {
	parentType = ({type: Struct,
		       numberOfArgs: 0,
		       numberOfFields: 0,
		       firstField: 0});
    }
    var numParentArgs = parentType.numberOfArgs;

    // Create a new struct type inheriting from the parent
    var aStruct = parentType.type.extend({
	init: function(name, initArgs) {
		// if there's no guard, construct a default one

		if (!guard) {
			guard = function(k) {
				if (arguments.length == 3) {
					k(arguments[1]);
				}
				else {
					var args = [];
					var i;
					for(i = 1; i < arguments.length-1; i++) {
						args.push(arguments[i]);
					}
					k(new ValuesWrapper(args));
				}
			}
		}

		var that = this;
		var cont = function(guardRes) {
			var guardedArgs;
			if ( guardRes instanceof ValuesWrapper ) {
				guardedArgs = guardRes.elts;
			} else {
				guardedArgs = [guardRes];
			}

			var parentArgs = guardedArgs.slice(0, numParentArgs);
			that._super(name, parentArgs);

			for (var i = 0; i < initFieldCnt; i++) {
				that._fields.push(guardedArgs[i+numParentArgs]);
			}
			for (var i = 0; i < autoFieldCnt; i++) {
				that._fields.push(autoV);
			}
		};
		initArgs.unshift(cont);
		initArgs.push(Symbol.makeInstance(name));
		guard.apply(null, initArgs);
	}
    });
    // Set type, necessary for equality checking
    aStruct.prototype.type = aStruct;

    // construct and return the new type
    return new StructType(theName,
			  aStruct,
			  initFieldCnt + numParentArgs,
			  initFieldCnt + autoFieldCnt,
			  parentType.firstField + parentType.numberOfFields,
			  function() {
			  	var args = [];
				for (var i = 0; i < arguments.length; i++) {
					args.push(arguments[i]);
				}
				return new aStruct(theName, args);
			  },
			  function(x) { return x instanceof aStruct; },
			  function(x, i) { return x._fields[i + this.firstField]; },
			  function(x, i, v) { x._fields[i + this.firstField] = v; });
};

// Structures.
var Struct = Class.extend({
	init: function (constructorName, fields) {
	    this._constructorName = constructorName;
	    this._fields = [];
	},

	toWrittenString: function(cache) {
	    //    cache.put(this, true);
	    var buffer = [];
	    var i;
	    buffer.push("(");
	    buffer.push(this._constructorName);
	    for(i = 0; i < this._fields.length; i++) {
		buffer.push(" ");
		buffer.push(toWrittenString(this._fields[i], cache));
	    }
	    buffer.push(")");
	    return buffer.join("");
	},

	toDisplayedString: function(cache) { return this.toWrittenString(cache); },

	toDomNode: function(cache) {
	    //    cache.put(this, true);
	    var node = document.createElement("div"),
            constructor= document.createElement("span");
            constructor.appendChild(document.createTextNode(this._constructorName));
	    var i;
	    node.appendChild(makeLParen());
	    node.appendChild(constructor);
	    for(i = 0; i < this._fields.length; i++) {
                appendChild(node, toDomNode(this._fields[i], cache));
	    }
	    node.appendChild(makeRParen());
	    return node;
	},

	isEqual: function(other, aUnionFind) {
	    if ( other.type == undefined ||
		 this.type !== other.type ||
		 !(other instanceof this.type) ) {
		    return false;
	    }

	    for (var i = 0; i < this._fields.length; i++) {
		if (! isEqual(this._fields[i],
			      other._fields[i],
			      aUnionFind)) {
			return false;
		}
	    }
	    return true;
	}
});
Struct.prototype.type = Struct;

//////////////////////////////////////////////////////////////////////

// Regular expressions.

var RegularExpression = function(pattern) {
    this.pattern = pattern;
};

var ByteRegularExpression = function(pattern) {
    this.pattern = pattern;
};

//////////////////////////////////////////////////////////////////////

// Paths

var Path = function(p) {
    this.path = p;
};

//////////////////////////////////////////////////////////////////////

// Bytes

var Bytes = function(bts, mutable) {
    this.bytes = bts;
    this.mutable = (mutable === undefined) ? false : mutable;
};

Bytes.prototype.get = function(i) {
	return this.bytes[i];
};

Bytes.prototype.set = function(i, b) {
	if (this.mutable) {
		this.bytes[i] = b;
	}
};

Bytes.prototype.length = function() {
	return this.bytes.length;
};

Bytes.prototype.copy = function(mutable) {
	return new Bytes(this.bytes.slice(0), mutable);
};

Bytes.prototype.subbytes = function(start, end) {
	if (end == null || end == undefined) {
		end = this.bytes.length;
	}

	return new Bytes( this.bytes.slice(start, end), true );
};

Bytes.prototype.toString = function() {
	var ret = '';
	for (var i = 0; i < this.bytes.length; i++) {
		ret += String.fromCharCode(this.bytes[i]);
	}

	return ret;
};

Bytes.prototype.toDisplayedString = Bytes.prototype.toString;

Bytes.prototype.toWrittenString = function() {
	var ret = ['#"'];
	for (var i = 0; i < this.bytes.length; i++) {
		ret.push( escapeByte(this.bytes[i]) );
	}
	ret.push('"');
	return ret.join('');
};

var escapeByte = function(aByte) {
	var ret = [];
	var returnVal;
	switch(aByte) {
		case 7: returnVal = '\\a'; break;
		case 8: returnVal = '\\b'; break;
		case 9: returnVal = '\\t'; break;
		case 10: returnVal = '\\n'; break;
		case 11: returnVal = '\\v'; break;
		case 12: returnVal = '\\f'; break;
		case 13: returnVal = '\\r'; break;
		case 34: returnVal = '\\"'; break;
		case 92: returnVal = '\\\\'; break;
		default: if (val >= 32 && val <= 126) {
				 returnVal = String.fromCharCode(val);
			 }
			 else {
				 ret.push( '\\' + val.toString(8) );
			 }
			 break;
	}
	return returnVal;
};

//////////////////////////////////////////////////////////////////////
// Boxes

var Box = function(x, mutable) {
	this.val = x;
	this.mutable = mutable;
};

Box.prototype.unbox = function() {
    return this.val;
};

Box.prototype.set = function(newVal) {
    if (this.mutable) {
	    this.val = newVal;
    }
};

Box.prototype.toString = function() {
    return "#&" + this.val.toString();
};

Box.prototype.toWrittenString = function(cache) {
    return "#&" + toWrittenString(this.val, cache);
};

Box.prototype.toDisplayedString = function(cache) {
    return "#&" + toDisplayedString(this.val, cache);
};

Box.prototype.toDomNode = function(cache) {
    var parent = document.createElement("span"),
    boxSymbol = document.createElement("span");
    boxSymbol.appendChild(document.createTextNode("#&"));
    parent.className = "wescheme-box";
    parent.appendChild(boxSymbol);
    parent.appendChild(toDomNode(this.val, cache));
    return parent;
};

//////////////////////////////////////////////////////////////////////

// We are reusing the built-in Javascript boolean class here.
Logic = {
    TRUE : true,
    FALSE : false
};

// WARNING
// WARNING: we are extending the built-in Javascript boolean class here!
// WARNING
Boolean.prototype.toWrittenString = function(cache) {
    if (this.valueOf()) { return "true"; }
    return "false";
};
Boolean.prototype.toDisplayedString = Boolean.prototype.toWrittenString;

Boolean.prototype.toString = function() { return this.valueOf() ? "true" : "false"; };

Boolean.prototype.isEqual = function(other, aUnionFind){
    return this == other;
};

// Chars
// Char: string -> Char
Char = function(val){
    this.val = val;
};

Char.makeInstance = function(val){
    return new Char(val);
};

Char.prototype.toString = function() {
	var code = this.val.charCodeAt(0);
	var returnVal;
	switch (code) {
		case 0: returnVal = '#\\nul'; break;
		case 8: returnVal = '#\\backspace'; break;
		case 9: returnVal = '#\\tab'; break;
		case 10: returnVal = '#\\newline'; break;
		case 11: returnVal = '#\\vtab'; break;
		case 12: returnVal = '#\\page'; break;
		case 13: returnVal = '#\\return'; break;
		case 20: returnVal = '#\\space'; break;
		case 127: returnVal = '#\\rubout'; break;
		default: if (code >= 32 && code <= 126) {
				 returnVal = ("#\\" + this.val);
			 }
			 else {
				 var numStr = code.toString(16).toUpperCase();
				 while (numStr.length < 4) {
					 numStr = '0' + numStr;
				 }
				 returnVal = ('#\\u' + numStr);
			 }
			 break;
	}
	return returnVal;
};

Char.prototype.toWrittenString = Char.prototype.toString;

Char.prototype.toDisplayedString = function (cache) {
    return this.val;
};

Char.prototype.getValue = function() {
    return this.val;
};

Char.prototype.isEqual = function(other, aUnionFind){
    return other instanceof Char && this.val == other.val;
};

//////////////////////////////////////////////////////////////////////

// Symbols

//////////////////////////////////////////////////////////////////////
var Symbol = function(val) {
    this.val = val;
};

var symbolCache = {};

// makeInstance: string -> Symbol.
Symbol.makeInstance = function(val) {
    // To ensure that we can eq? symbols with equal values.
    if (!(hasOwnProperty.call(symbolCache, val))) {
	symbolCache[val] = new Symbol(val);
    }
    return symbolCache[val];
};

Symbol.prototype.isEqual = function(other, aUnionFind) {
    return other instanceof Symbol &&
    this.val == other.val;
};

Symbol.prototype.toString = function() {
    return this.val;
};

Symbol.prototype.toWrittenString = function(cache) {
    return this.val;
};

Symbol.prototype.toDisplayedString = function(cache) {
    return this.val;
};

Symbol.prototype.toDomNode = function(cache) {
    var wrapper = document.createElement("span");
    wrapper.className = "wescheme-symbol";
    wrapper.style.fontFamily = 'monospace';
    wrapper.style.whiteSpace = "pre";
    wrapper.appendChild(document.createTextNode("'" + this.val));
    return wrapper;
};

//////////////////////////////////////////////////////////////////////

// Keywords

var Keyword = function(val) {
    this.val = val;
};

var keywordCache = {};

// makeInstance: string -> Keyword.
Keyword.makeInstance = function(val) {
    // To ensure that we can eq? symbols with equal values.
    if (!(hasOwnProperty.call(keywordCache, val))) {
	keywordCache[val] = new Keyword(val);
    }
    return keywordCache[val];
};

Keyword.prototype.isEqual = function(other, aUnionFind) {
    return other instanceof Keyword &&
    this.val == other.val;
};

Keyword.prototype.toString = function() {
    return this.val;
};

Keyword.prototype.toWrittenString = function(cache) {
    return this.val;
};

Keyword.prototype.toDisplayedString = function(cache) {
    return this.val;
};

//////////////////////////////////////////////////////////////////////

Empty = function() {
};
Empty.EMPTY = new Empty();

Empty.prototype.isEqual = function(other, aUnionFind) {
    return other instanceof Empty;
};

Empty.prototype.reverse = function() {
    return this;
};

Empty.prototype.first = function() {
    throw new Error("first can't be applied on empty.");
};
Empty.prototype.rest = function() {
    throw new Error("rest can't be applied on empty.");
};
Empty.prototype.isEmpty = function() {
    return true;
};
Empty.prototype.toWrittenString = function(cache) { return "empty"; };
Empty.prototype.toDisplayedString = function(cache) { return "empty"; };
Empty.prototype.toString = function(cache) { return "()"; };

// Empty.append: (listof X) -> (listof X)
Empty.prototype.append = function(b){
    return b;
};

Cons = function(f, r) {
    this.f = f;
    this.r = r;
};

Cons.prototype.reverse = function() {
    var lst = this;
    var ret = Empty.EMPTY;
    while (!lst.isEmpty()){
	ret = Cons.makeInstance(lst.first(), ret);
	lst = lst.rest();
    }
    return ret;
};

Cons.makeInstance = function(f, r) {
    return new Cons(f, r);
};

// FIXME: can we reduce the recursion on this?
Cons.prototype.isEqual = function(other, aUnionFind) {
    if (! (other instanceof Cons)) {
	return Logic.FALSE;
    }
    return (isEqual(this.first(), other.first(), aUnionFind) &&
	    isEqual(this.rest(), other.rest(), aUnionFind));
};

Cons.prototype.first = function() {
    return this.f;
};

Cons.prototype.rest = function() {
    return this.r;
};

Cons.prototype.isEmpty = function() {
    return false;
};

// Cons.append: (listof X) -> (listof X)
Cons.prototype.append = function(b){
    if (b === Empty.EMPTY)
	return this;
    var ret = b;
    var lst = this.reverse();
    while ( !lst.isEmpty() ) {
	ret = Cons.makeInstance(lst.first(), ret);
	lst = lst.rest();
    }

    return ret;
};

Cons.prototype.toWrittenString = function(cache) {
    //    cache.put(this, true);
    var texts = ["list"];
    var p = this;
    while ( p instanceof Cons ) {
	texts.push(toWrittenString(p.first(), cache));
	p = p.rest();
    }
    if ( p !== Empty.EMPTY ) {
	// If not a list, we've got to switch over to cons pair
	// representation.
	return explicitConsString(this, cache, toWrittenString);
    }
    return "(" + texts.join(" ") + ")";
};

var explicitConsString = function(p, cache, f) {
    var texts = [];
    var tails = []
    while ( p instanceof Cons ) {
	texts.push("(cons ");
	texts.push(f(p.first(), cache));
	texts.push(" ");

	tails.push(")");
	p = p.rest();
    }
    texts.push(f(p, cache));
    return (texts.join("") + tails.join(""));
};

Cons.prototype.toString = Cons.prototype.toWrittenString;

Cons.prototype.toDisplayedString = function(cache) {
    //    cache.put(this, true);
    var texts = ["list"];
    var p = this;
    while ( p instanceof Cons ) {
	texts.push(toDisplayedString(p.first(), cache));
	p = p.rest();
    }
    if ( p !== Empty.EMPTY ) {
	return explicitConsString(this, cache, toDisplayedString);
    }
//    while (true) {
//	if ((!(p instanceof Cons)) && (!(p instanceof Empty))) {
//	    texts.push(".");
//	    texts.push(toDisplayedString(p, cache));
//	    break;
//	}
//	if (p.isEmpty())
//	    break;
//	texts.push(toDisplayedString(p.first(), cache));
//	p = p.rest();
//    }
    return "(" + texts.join(" ") + ")";
};

Cons.prototype.toDomNode = function(cache) {
    //    cache.put(this, true);
    var node = document.createElement("span"),
        abbr = document.createElement("span");
    node.className = "wescheme-cons";
    abbr.appendChild(document.createTextNode("list"));

     node.appendChild(makeLParen());
     node.appendChild(abbr);
    var p = this;
    while ( p instanceof Cons ) {
      appendChild(node, toDomNode(p.first(), cache));
      p = p.rest();
    }
    if ( p !== Empty.EMPTY ) {
	return explicitConsDomNode(this, cache);
    }
 node.appendChild(makeRParen());
    return node;
};

var explicitConsDomNode = function(p, cache) {
    var topNode = document.createElement("span");
    var node = topNode, constructor = document.createElement("span");
       constructor.appendChild(document.createTextNode("cons"));

    node.className = "wescheme-cons";
    while ( p instanceof Cons ) {
      node.appendChild(makeLParen());
      node.appendChild(constructor);
      appendChild(node, toDomNode(p.first(), cache));

      var restSpan = document.createElement("span");
      node.appendChild(restSpan);
      node.appendChild(makeRParen());
      node = restSpan;
      p = p.rest();
    }
    appendChild(node, toDomNode(p, cache));
    return topNode;
};

//////////////////////////////////////////////////////////////////////

Vector = function(n, initialElements) {
    this.elts = new Array(n);
    if (initialElements) {
	for (var i = 0; i < n; i++) {
	    this.elts[i] = initialElements[i];
	}
    } else {
	for (var i = 0; i < n; i++) {
	    this.elts[i] = undefined;
	}
    }
    this.mutable = true;
};
Vector.makeInstance = function(n, elts) {
    return new Vector(n, elts);
}
    Vector.prototype.length = function() {
	return this.elts.length;
    };
Vector.prototype.ref = function(k) {
    return this.elts[k];
};
Vector.prototype.set = function(k, v) {
    this.elts[k] = v;
};

Vector.prototype.isEqual = function(other, aUnionFind) {
    if (other != null && other != undefined && other instanceof Vector) {
	if (other.length() != this.length()) {
	    return false
	}
	for (var i = 0; i <  this.length(); i++) {
	    if (! isEqual(this.elts[i], other.elts[i], aUnionFind)) {
		return false;
	    }
	}
	return true;
    } else {
	return false;
    }
};

Vector.prototype.toList = function() {
    var ret = Empty.EMPTY;
    for (var i = this.length() - 1; i >= 0; i--) {
	ret = Cons.makeInstance(this.elts[i], ret);
    }
    return ret;
};

Vector.prototype.toWrittenString = function(cache) {
    //    cache.put(this, true);
    var texts = [];
    for (var i = 0; i < this.length(); i++) {
	texts.push(toWrittenString(this.ref(i), cache));
    }
    return "#(" + texts.join(" ") + ")";
};

Vector.prototype.toDisplayedString = function(cache) {
    //    cache.put(this, true);
    var texts = [];
    for (var i = 0; i < this.length(); i++) {
	texts.push(toDisplayedString(this.ref(i), cache));
    }
    return "#(" + texts.join(" ") + ")";
};

Vector.prototype.toDomNode = function(cache) {
    //    cache.put(this, true);
    var node = document.createElement("span"),
        lVect = document.createElement("span"),
        rVect = document.createElement("span");
    lVect.appendChild(document.createTextNode("#("));
    lVect.className = "lParen";
    rVect.appendChild(document.createTextNode(")"));
    rVect.className = "rParen";
    node.className = "wescheme-vector";
    node.appendChild(lVect);
    for (var i = 0; i < this.length(); i++) {
      appendChild(node, toDomNode(this.ref(i), cache));
    }
    node.appendChild(rVect);
    return node;
};

//////////////////////////////////////////////////////////////////////

// Now using mutable strings
var Str = function(chars) {
	this.chars = chars;
	this.length = chars.length;
	this.mutable = true;
}

Str.makeInstance = function(chars) {
	return new Str(chars);
}

Str.fromString = function(s) {
	return Str.makeInstance(s.split(""));
}

Str.prototype.toString = function() {
	return this.chars.join("");
}

Str.prototype.toWrittenString = function(cache) {
    return escapeString(this.toString());
}

Str.prototype.toDisplayedString = Str.prototype.toString;

Str.prototype.copy = function() {
	return Str.makeInstance(this.chars.slice(0));
}

Str.prototype.substring = function(start, end) {
	if (end == null || end == undefined) {
		end = this.length;
	}

	return Str.makeInstance( this.chars.slice(start, end) );
}

Str.prototype.charAt = function(index) {
	return this.chars[index];
}

Str.prototype.charCodeAt = function(index) {
	return this.chars[index].charCodeAt(0);
}

Str.prototype.replace = function(expr, newStr) {
	return Str.fromString( this.toString().replace(expr, newStr) );
}

Str.prototype.isEqual = function(other, aUnionFind) {
	if ( !(other instanceof Str || typeof(other) == 'string') ) {
		return false;
	}
	return this.toString() === other.toString();
}

Str.prototype.set = function(i, c) {
	this.chars[i] = c;
}

Str.prototype.toUpperCase = function() {
	return Str.fromString( this.chars.join("").toUpperCase() );
}

Str.prototype.toLowerCase = function() {
	return Str.fromString( this.chars.join("").toLowerCase() );
}

Str.prototype.match = function(regexpr) {
	return this.toString().match(regexpr);
}

//var _quoteReplacingRegexp = new RegExp("[\"\\\\]", "g");
var escapeString = function(s) {
    return '"' + replaceUnprintableStringChars(s) + '"';
//    return '"' + s.replace(_quoteReplacingRegexp,
//			      function(match, submatch, index) {
//				  return "\\" + match;
//			      }) + '"';
};

var replaceUnprintableStringChars = function(s) {
	var ret = [];
	for (var i = 0; i < s.length; i++) {
		var val = s.charCodeAt(i);
		switch(val) {
			case 7: ret.push('\\a'); break;
			case 8: ret.push('\\b'); break;
			case 9: ret.push('\\t'); break;
			case 10: ret.push('\\n'); break;
			case 11: ret.push('\\v'); break;
			case 12: ret.push('\\f'); break;
			case 13: ret.push('\\r'); break;
			case 34: ret.push('\\"'); break;
			case 92: ret.push('\\\\'); break;
			default: if (val >= 32 && val <= 126) {
					 ret.push( s.charAt(i) );
				 }
				 else {
					 var numStr = val.toString(16).toUpperCase();
					 while (numStr.length < 4) {
						 numStr = '0' + numStr;
					 }
					 ret.push('\\u' + numStr);
				 }
				 break;
		}
	}
	return ret.join('');
};

/*
// Strings
// For the moment, we just reuse Javascript strings.
String = String;
String.makeInstance = function(s) {
    return s.valueOf();
};

// WARNING
// WARNING: we are extending the built-in Javascript string class here!
// WARNING
String.prototype.isEqual = function(other, aUnionFind){
    return this == other;
};

var _quoteReplacingRegexp = new RegExp("[\"\\\\]", "g");
String.prototype.toWrittenString = function(cache) {
    return '"' + this.replace(_quoteReplacingRegexp,
			      function(match, submatch, index) {
				  return "\\" + match;
			      }) + '"';
};

String.prototype.toDisplayedString = function(cache) {
    return this;
};
*/

//////////////////////////////////////////////////////////////////////

// makeLowLevelEqHash: -> hashtable
// Constructs an eq hashtable that uses Moby's getEqHashCode function.
var makeLowLevelEqHash = function() {
    return new _Hashtable(function(x) { return getEqHashCode(x); },
			  function(x, y) { return x === y; });
};

//////////////////////////////////////////////////////////////////////
// Hashtables
var EqHashTable = function(inputHash) {
    this.hash = makeLowLevelEqHash();
    this.mutable = true;

};
EqHashTable = EqHashTable;

EqHashTable.prototype.toWrittenString = function(cache) {
    var keys = this.hash.keys();
    var ret = [];
    for (var i = 0; i < keys.length; i++) {
	    var keyStr = types.toWrittenString(keys[i], cache);
	    var valStr = types.toWrittenString(this.hash.get(keys[i]), cache);
	    ret.push('(' + keyStr + ' . ' + valStr + ')');
    }
    return ('#hasheq(' + ret.join(' ') + ')');
};

EqHashTable.prototype.toDisplayedString = function(cache) {
    var keys = this.hash.keys();
    var ret = [];
    for (var i = 0; i < keys.length; i++) {
	    var keyStr = types.toDisplayedString(keys[i], cache);
	    var valStr = types.toDisplayedString(this.hash.get(keys[i]), cache);
	    ret.push('(' + keyStr + ' . ' + valStr + ')');
    }
    return ('#hasheq(' + ret.join(' ') + ')');
};

EqHashTable.prototype.isEqual = function(other, aUnionFind) {
    if ( !(other instanceof EqHashTable) ) {
	return false;
    }

    if (this.hash.keys().length != other.hash.keys().length) {
	return false;
    }

    var keys = this.hash.keys();
    for (var i = 0; i < keys.length; i++){
	if ( !(other.hash.containsKey(keys[i]) &&
	       isEqual(this.hash.get(keys[i]),
		       other.hash.get(keys[i]),
		       aUnionFind)) ) {
		return false;
	}
    }
    return true;
};

var EqualHashTable = function(inputHash) {
	this.hash = new _Hashtable(function(x) {
			return toWrittenString(x);
		},
		function(x, y) {
			return isEqual(x, y, new UnionFind());
		});
	this.mutable = true;
};

EqualHashTable = EqualHashTable;

EqualHashTable.prototype.toWrittenString = function(cache) {
    var keys = this.hash.keys();
    var ret = [];
    for (var i = 0; i < keys.length; i++) {
	    var keyStr = types.toWrittenString(keys[i], cache);
	    var valStr = types.toWrittenString(this.hash.get(keys[i]), cache);
	    ret.push('(' + keyStr + ' . ' + valStr + ')');
    }
    return ('#hash(' + ret.join(' ') + ')');
};
EqualHashTable.prototype.toDisplayedString = function(cache) {
    var keys = this.hash.keys();
    var ret = [];
    for (var i = 0; i < keys.length; i++) {
	    var keyStr = types.toDisplayedString(keys[i], cache);
	    var valStr = types.toDisplayedString(this.hash.get(keys[i]), cache);
	    ret.push('(' + keyStr + ' . ' + valStr + ')');
    }
    return ('#hash(' + ret.join(' ') + ')');
};

EqualHashTable.prototype.isEqual = function(other, aUnionFind) {
    if ( !(other instanceof EqualHashTable) ) {
	return false;
    }

    if (this.hash.keys().length != other.hash.keys().length) {
	return false;
    }

    var keys = this.hash.keys();
    for (var i = 0; i < keys.length; i++){
	if (! (other.hash.containsKey(keys[i]) &&
	       isEqual(this.hash.get(keys[i]),
		       other.hash.get(keys[i]),
		       aUnionFind))) {
	    return false;
	}
    }
    return true;
};

//////////////////////////////////////////////////////////////////////

var JsObject = function(name, obj) {
	this.name = name;
	this.obj = obj;
};

JsObject.prototype.toString = function() {
	return '#<js-object:' + typeof(this.obj) + ':' + this.name + '>';
};

JsObject.prototype.isEqual = function(other, aUnionFind) {
	return (this.obj === other.obj);
};

//////////////////////////////////////////////////////////////////////

var WorldConfig = function(startup, shutdown, args) {
	this.startup = startup;
	this.shutdown = shutdown;
	this.startupArgs = args;
	this.shutdownArg = undefined;
};

WorldConfig.prototype.toString = function() {
	return '#<world-config>';
};

WorldConfig.prototype.isEqual = function(other, aUnionFind) {
	if ( ! isEqual(this.startup, other.startup, aUnionFind) ||
	     ! isEqual(this.shutdown, other.shutdown, aUnionFind) ||
	     this.startupArgs.length != other.startupArgs.length ||
	     ! isEqual(this.shutdownArg, other.shutdownArg, aUnionFind) ) {
		return false;
	}

	for (var i = 0; i < args.length; i++) {
		if ( !isEqual(this.startupArgs[i], other.startupArgs[i], aUnionFind) )
			return false;
	}
	return true;
};

var Effect = makeStructureType('effect', false, 0, 0, false, false);
Effect.type.prototype.invokeEffect = function(k) {
	helpers.raise(types.incompleteExn(
			types.exnFail,
			'effect type created without using make-effect-type',
			[]));
};
//Effect.handlerIndices = [];

//var wrapHandler = function(handler, caller, changeWorld) {
//	return types.jsObject('function', function() {
//		var externalArgs = arguments;
//		changeWorld(function(w, k) {
//			var args = helpers.map(helpers.wrapJsObject, externalArgs);
//			args.unshift(w);
//			caller(handler, args, k);
//		});
//	});
//};

var makeEffectType = function(name, superType, initFieldCnt, impl, guard, caller) {
	if ( !superType ) {
		superType = Effect;
	}

	var newType = makeStructureType(name, superType, initFieldCnt, 0, false, guard);
	var lastFieldIndex = newType.firstField + newType.numberOfFields;

	newType.type.prototype.invokeEffect = function(changeWorld, k) {
		var schemeChangeWorld = new PrimProc('update-world', 1, false, true,
			function(aState, worldUpdater) {
				helpers.check(aState, worldUpdater, helpers.procArityContains(1),
					      'update-world', 'procedure (arity 1)', 1);

				changeWorld(function(w, k2) { interpret.call(aState,
									     worldUpdater, [w],
									     k2,
									     function(e) { throw e; }); },
					    function() { aState.v = VOID_VALUE; });
			});

		var args = this._fields.slice(0, lastFieldIndex);
		args.unshift(schemeChangeWorld);
		caller(impl, args, k);
	}

	return newType;
};

var RenderEffect = makeStructureType('render-effect', false, 0, 0, false, false);
RenderEffect.type.prototype.callImplementation = function(caller, k) {
	helpers.raise(types.incompleteExn(
			types.exnFail,
			'render effect created without using make-render-effect-type',
			[]));
};

var makeRenderEffectType = function(name, superType, initFieldCnt, impl, guard) {
	if ( !superType ) {
		superType = RenderEffect;
	}

	var newType = makeStructureType(name, superType, initFieldCnt, 0, false, guard);
	var lastFieldIndex = newType.firstField + newType.numberOfFields;

	newType.type.prototype.callImplementation = function(caller, k) {
		var args = this._fields.slice(0, lastFieldIndex);
		caller(impl, args, k);
	}

	return newType;
};

//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////

var toWrittenString = function(x, cache) {
    if (! cache) {
     	cache = makeLowLevelEqHash();
    }

    if (typeof(x) == 'object') {
	    if (cache.containsKey(x)) {
		    return "...";
	    } else {
	        cache.put(x, true);
            }
    }

    if (x == undefined || x == null) {
	return "#<undefined>";
    }
    if (typeof(x) == 'string') {
	return escapeString(x.toString());
    }
    if (typeof(x) != 'object' && typeof(x) != 'function') {
	return x.toString();
    }

    var returnVal;
    if (typeof(x.toWrittenString) !== 'undefined') {
	returnVal = x.toWrittenString(cache);
    } else if (typeof(x.toDisplayedString) !== 'undefined') {
	returnVal = x.toDisplayedString(cache);
    } else {
	returnVal = x.toString();
    }
    cache.remove(x);
    return returnVal;
};

var toDisplayedString = function(x, cache) {
    if (! cache) {
    	cache = makeLowLevelEqHash();
    }
    if (typeof(x) == 'object') {
	    if (cache.containsKey(x)) {
		    return "...";
	    }
	    cache.put(x, true);
    }

    if (x == undefined || x == null) {
	return "#<undefined>";
    }
    if (typeof(x) == 'string') {
	return x;
    }
    if (typeof(x) != 'object' && typeof(x) != 'function') {
	return x.toString();
    }

    var returnVal;
    if (typeof(x.toDisplayedString) !== 'undefined') {
	returnVal = x.toDisplayedString(cache);
    } else if (typeof(x.toWrittenString) !== 'undefined') {
	returnVal = x.toWrittenString(cache);
    } else {
	returnVal = x.toString();
    }
    cache.remove(x);
    return returnVal;
};

// toDomNode: scheme-value -> dom-node
var toDomNode = function(x, cache) {
    if (! cache) {
    	cache = makeLowLevelEqHash();
    }

    if (isNumber(x)) {
	return numberToDomNode(x);
    }

    if (typeof(x) == 'object') {
	    if (cache.containsKey(x)) {
        var node = document.createElement("span");
        node.style['font-family'] = 'monospace';
        node.appendChild(document.createTextNode("..."));
        return node;
	    }
	    cache.put(x, true);
    }

    if (x == undefined || x == null) {
      var node = document.createElement("span");
      node.style['font-family'] = 'monospace';
      node.appendChild(document.createTextNode("#<undefined>"));
      return node;
    }
    if (typeof(x) == 'string') {
        return textToDomNode(toWrittenString(x));
    }
    if (typeof(x) != 'object' && typeof(x) != 'function') {
        return textToDomNode(x.toString());
    }

    var returnVal;
    if (x.nodeType) {
	returnVal =  x;
    } else if (typeof(x.toDomNode) !== 'undefined') {
	returnVal =  x.toDomNode(cache);
    } else if (typeof(x.toWrittenString) !== 'undefined') {
        returnVal = textToDomNode(x.toWrittenString(cache))
    } else if (typeof(x.toDisplayedString) !== 'undefined') {
        returnVal = textToDomNode(x.toDisplayedString(cache));
    } else {
        returnVal = textToDomNode(x.toString());
    }
    cache.remove(x);
    return returnVal;
};

var textToDomNode = function(text) {
    var chunks = text.split("\n");
    var i;
    var wrapper = document.createElement("span");
    var newlineDiv;
    wrapper.className = (text==="true" || text==="false")? "wescheme-boolean" : "wescheme-string";
    wrapper.style.fontFamily = 'monospace';
    wrapper.style.whiteSpace = "pre";
    if (chunks.length > 0) {
        wrapper.appendChild(document.createTextNode(chunks[0]));
    }
    for (i = 1; i < chunks.length; i++) {
        newlineDiv = document.createElement("br");
        newlineDiv.style.clear = 'left';
        wrapper.appendChild(newlineDiv);
        wrapper.appendChild(document.createTextNode(chunks[i]));
    }
    return wrapper;
};

// numberToDomNode: jsnum -> dom
// Given a jsnum, produces a dom-node representation.
var numberToDomNode = function(n) {
    var node;
    if (jsnums.isExact(n)) {
      if (jsnums.isInteger(n)) {
          node = document.createElement("span");
          node.className = "wescheme-number Integer";
          node.appendChild(document.createTextNode(n.toString()));
          return node;
      } else if (jsnums.isRational(n)) {
          return rationalToDomNode(n);
      } else if (isComplex(n)) {
          node = document.createElement("span");
          node.className = "wescheme-number Complex";
          node.appendChild(document.createTextNode(n.toString()));
          return node;
      } else {
          node = document.createElement("span");
          node.className = "wescheme-number";
          node.appendChild(document.createTextNode(n.toString()));
          return node;
      }
    } else {
      node = document.createElement("span");
      node.className = "wescheme-number";
      node.appendChild(document.createTextNode(n.toString()));
      return node;
    }
};

// rationalToDomNode: rational -> dom-node
var rationalToDomNode = function(n) {
    var repeatingDecimalNode = document.createElement("span");
    var chunks = jsnums.toRepeatingDecimal(jsnums.numerator(n),
					   jsnums.denominator(n),
					   {limit: 25});
    var firstPart = document.createElement("span");
    firstPart.appendChild(document.createTextNode(chunks[0] + '.' + chunks[1]));
    repeatingDecimalNode.appendChild(firstPart);
    if (chunks[2] === '...') {
      firstPart.appendChild(document.createTextNode(chunks[2]));
    } else if (chunks[2] !== '0') {
      var overlineSpan = document.createElement("span");
      overlineSpan.style.textDecoration = 'overline';
      overlineSpan.appendChild(document.createTextNode(chunks[2]));
      repeatingDecimalNode.appendChild(overlineSpan);
    }

    var fractionalNode = document.createElement("span");
    var numeratorNode = document.createElement("sup");
    numeratorNode.appendChild(document.createTextNode(String(jsnums.numerator(n))));
    var denominatorNode = document.createElement("sub");
    denominatorNode.appendChild(document.createTextNode(String(jsnums.denominator(n))));
    var barNode = document.createElement("span");
    barNode.appendChild(document.createTextNode("/"));

    fractionalNode.appendChild(numeratorNode);
    fractionalNode.appendChild(barNode);
    fractionalNode.appendChild(denominatorNode);

    var numberNode = document.createElement("span");
    numberNode.appendChild(repeatingDecimalNode);
    numberNode.appendChild(fractionalNode);
    fractionalNode.style['display'] = 'none';

    var showingRepeating = true;

    numberNode.onclick = function(e) {
	showingRepeating = !showingRepeating;
	repeatingDecimalNode.style['display'] =
	    (showingRepeating ? 'inline' : 'none')
	fractionalNode.style['display'] =
	    (!showingRepeating ? 'inline' : 'none')
    };
    numberNode.style['cursor'] = 'pointer';
    numberNode.className = "wescheme-number Rational";
    return numberNode;

};

    // Alternative: use <sup> and <sub> tags

var isNumber = jsnums.isSchemeNumber;
var isComplex = isNumber;
var isString = function(s) {
	return (typeof s === 'string' || s instanceof Str);
}

// isEqual: X Y -> boolean
// Returns true if the objects are equivalent; otherwise, returns false.
var isEqual = function(x, y, aUnionFind) {
    if (x === y) { return true; }

    if (isNumber(x) && isNumber(y)) {
	return jsnums.equals(x, y);
    }

    if (isString(x) && isString(y)) {
	return x.toString() === y.toString();
    }

    if (x == undefined || x == null) {
	return (y == undefined || y == null);
    }

    if ( typeof(x) == 'object' &&
	 typeof(y) == 'object' &&
	 x.isEqual &&
	 y.isEqual) {
	if (aUnionFind.find(x) === aUnionFind.find(y)) {
	    return true;
	}
	else {
	    aUnionFind.merge(x, y);
	    return x.isEqual(y, aUnionFind);
	}
    }
    return false;
};

// liftToplevelToFunctionValue: primitive-function string fixnum scheme-value -> scheme-value
// Lifts a primitive toplevel or module-bound value to a scheme value.
var liftToplevelToFunctionValue = function(primitiveF,
				       name,
				       minArity,
				       procedureArityDescription) {
    if (! primitiveF._mobyLiftedFunction) {
	var lifted = function(args) {
	    return primitiveF.apply(null, args.slice(0, minArity).concat([args.slice(minArity)]));
	};
	lifted.isEqual = function(other, cache) {
	    return this === other;
	}
	lifted.toWrittenString = function(cache) {
	    return "#<function:" + name + ">";
	};
	lifted.toDisplayedString = lifted.toWrittenString;
	lifted.procedureArity = procedureArityDescription;
	primitiveF._mobyLiftedFunction = lifted;

    }
    return primitiveF._mobyLiftedFunction;
};

//////////////////////////////////////////////////////////////////////
var ThreadCell = function(v, isPreserved) {
    this.v = v;
    this.isPreserved = isPreserved || false;
};

//////////////////////////////////////////////////////////////////////

// Wrapper around functions that return multiple values.
var ValuesWrapper = function(elts) {
    this.elts = elts;
};

ValuesWrapper.prototype.toDomNode = function(cache) {
    var parent = document.createElement("span");
    parent.style.whiteSpace = "pre";
    if ( this.elts.length > 0 ) {
	    parent.appendChild( toDomNode(this.elts[0], cache) );
	    for (var i = 1; i < this.elts.length; i++) {
		    parent.appendChild( document.createTextNode('\n') );
		    parent.appendChild( toDomNode(this.elts[i], cache) );
	    }
    }
    return parent;
};

var UndefinedValue = function() {
};
UndefinedValue.prototype.toString = function() {
    return "#<undefined>";
};
var UNDEFINED_VALUE = new UndefinedValue();

var VoidValue = function() {};
VoidValue.prototype.toString = function() {
	return "#<void>";
};

var VOID_VALUE = new VoidValue();

var EofValue = function() {};
EofValue.prototype.toString = function() {
	return "#<eof>";
}

var EOF_VALUE = new EofValue();

var ClosureValue = function(name, locs, numParams, paramTypes, isRest, closureVals, body) {
    this.name = name;
    this.locs = locs;
    this.numParams = numParams;
    this.paramTypes = paramTypes;
    this.isRest = isRest;
    this.closureVals = closureVals;
    this.body = body;
};

ClosureValue.prototype.toString = function() {
    if (this.name !== Empty.EMPTY) {
	return helpers.format("#<function:~a>", [this.name]);
    } else {
	return "#<function>";
    }
};

var CaseLambdaValue = function(name, closures) {
    this.name = name;
    this.closures = closures;
};

CaseLambdaValue.prototype.toString = function() {
    if (this.name !== Empty.EMPTY) {
	return helpers.format("#<case-lambda-procedure:~a>", [this.name]);
    } else {
	return "#<case-lambda-procedure>";
    }
};

var ContinuationClosureValue = function(vstack, cstack) {
    this.name = false;
    this.vstack = vstack.slice(0);
    this.cstack = cstack.slice(0);
};

ContinuationClosureValue.prototype.toString = function() {
    if (this.name !== Empty.EMPTY) {
	return helpers.format("#<function:~a>", [this.name]);
    } else {
	return "#<function>";
    }
};

//////////////////////////////////////////////////////////////////////

var PrefixValue = function() {
    this.slots = [];
    this.definedMask = [];
};

PrefixValue.prototype.addSlot = function(v) {
    if (v === undefined) {
	this.slots.push(types.UNDEFINED);
	this.definedMask.push(false);
    } else {
        this.slots.push(v);
	if (v instanceof GlobalBucket) {
	    if (v.value === types.UNDEFINED) {
		this.definedMask.push(false);
	    } else {
		this.definedMask.push(true);
	    }
	} else {
	    this.definedMask.push(true);
	}
    }
};

PrefixValue.prototype.ref = function(n, srcloc) {
    if (this.slots[n] instanceof GlobalBucket) {
    	if (this.definedMask[n]) {
    	    return this.slots[n].value;
    	} else {
    	    helpers.raise(types.incompleteExn(
    			types.exnFailContractVariable,
    			new Message([new ColoredPart(this.slots[n].name, srcloc),
                            ": this variable is not defined"]),
    			[this.slots[n].name]));
    	}
        } else {
    	if (this.definedMask[n]) {
    	    return this.slots[n];
    	} else {
    	    helpers.raise(types.incompleteExn(
    			types.exnFailContractVariable,
    			"variable has not been defined",
    			[false]));
    	}
    }
};

PrefixValue.prototype.set = function(n, v) {
    if (this.slots[n] instanceof GlobalBucket) {
	this.slots[n].value = v;
	this.definedMask[n] = true;
    } else {
	this.slots[n] = v;
	this.definedMask[n] = true;
    }
};

PrefixValue.prototype.length = function() {
    return this.slots.length;
};

var GlobalBucket = function(name, value) {
    this.name = name;
    this.value = value;
};

var ModuleVariableRecord = function(resolvedModuleName,
				    variableName) {
    this.resolvedModuleName = resolvedModuleName;
    this.variableName = variableName;
};

//////////////////////////////////////////////////////////////////////

var VariableReference = function(prefix, pos) {
    this.prefix = prefix;
    this.pos = pos;
};

VariableReference.prototype.ref = function() {
    return this.prefix.ref(this.pos);
};

VariableReference.prototype.set = function(v) {
    this.prefix.set(this.pos, v);
}

//////////////////////////////////////////////////////////////////////

// Continuation Marks

var ContMarkRecordControl = function(dict) {
    this.dict = dict || makeLowLevelEqHash();
};

ContMarkRecordControl.prototype.invoke = function(state) {
    // No-op: the record will simply pop off the control stack.
};

ContMarkRecordControl.prototype.update = function(key, val) {
    var newDict = makeLowLevelEqHash();
    // FIXME: what's the javascript idiom for hash key copy?
    // Maybe we should use a rbtree instead?
    var oldKeys = this.dict.keys();
    for (var i = 0; i < oldKeys.length; i++) {
	    newDict.put( oldKeys[i], this.dict.get(oldKeys[i]) );
    }
    newDict.put(key, val);
    return new ContMarkRecordControl(newDict);
};

var ContinuationMarkSet = function(dict) {
    this.dict = dict;
}

ContinuationMarkSet.prototype.toDomNode = function(cache) {
    var dom = document.createElement("span");
    dom.appendChild(document.createTextNode('#<continuation-mark-set>'));
    return dom;
};

ContinuationMarkSet.prototype.toWrittenString = function(cache) {
    return '#<continuation-mark-set>';
};

ContinuationMarkSet.prototype.toDisplayedString = function(cache) {
    return '#<continuation-mark-set>';
};

ContinuationMarkSet.prototype.ref = function(key) {
    if ( this.dict.containsKey(key) ) {
	    return this.dict.get(key);
    }
    return [];
};

//////////////////////////////////////////////////////////////////////

var ContinuationPrompt = function() {
};

var defaultContinuationPrompt = new ContinuationPrompt();

//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////

var PrimProc = function(name, numParams, isRest, assignsToValueRegister, impl) {
    this.name = name;
    this.numParams = numParams;
    this.isRest = isRest;
    this.assignsToValueRegister = assignsToValueRegister;
    this.impl = impl;
};

PrimProc.prototype.toString = function() {
    return ("#<function:" + this.name + ">");
};

PrimProc.prototype.toWrittenString = function(cache) {
    return ("#<function:" + this.name + ">");
};

PrimProc.prototype.toDisplayedString = function(cache) {
    return ("#<function:" + this.name + ">");
};

PrimProc.prototype.toDomNode = function(cache) {
    var node = document.createElement("span");
    node.className = "wescheme-primproc";
    node.appendChild(document.createTextNode("#<function:"+ this.name +">"));
    return node;
};

var CasePrimitive = function(name, cases) {
    this.name = name;
    this.cases = cases;
};

CasePrimitive.prototype.toDomNode = function(cache) {
    var node = document.createElement("span");
    node.className = "wescheme-caseprimitive";
    node.appendChild(document.createTextNode("#<function:"+ this.name +">"));
    return node;
};

CasePrimitive.prototype.toWrittenString = function(cache) {
    return ("#<function:" + this.name + ">");
};

CasePrimitive.prototype.toDisplayedString = function(cache) {
    return ("#<function:" + this.name + ">");
};

/////////////////////////////////////////////////////////////////////
// Colored Error Message Support

var Message = function(args) {
  this.args = args;
};

Message.prototype.toString = function() {
  var toReturn = [];
  var i;
  for(i = 0; i < this.args.length; i++) {
      toReturn.push(''+this.args[i]);
  }

  return toReturn.join("");
};

var isMessage = function(o) {
  return o instanceof Message;
};

var ColoredPart = function(text, location) {
  this.text = text;
  this.location = location;
};

var isColoredPart = function(o) {
  return o instanceof ColoredPart;
};

ColoredPart.prototype.toString = function() {
    return this.text+'';
};

var GradientPart = function(coloredParts) {
    this.coloredParts = coloredParts;
};

var isGradientPart = function(o) {
  return o instanceof GradientPart;
};

GradientPart.prototype.toString = function() {
	var i;
	var resultArray = [];
	for(i = 0; i < this.coloredParts.length; i++){
		resultArray.push(this.coloredParts[i].text+'');
	}
	return resultArray.join("");

};

var MultiPart = function(text, locations, solid) {
    this.text = text;
    this.locations = locations;
    this.solid = solid;
};

var isMultiPart = function(o) {
  return o instanceof MultiPart;
};

MultiPart.prototype.toString = function() {
	return this.text;
};

//////////////////////////////////////////////////////////////////////

var makeList = function(args) {
    var result = Empty.EMPTY;
    var i;
    for(i = args.length-1; i >= 0; i--) {
	result = Cons.makeInstance(args[i], result);
    }
    return result;
};

var makeVector = function(args) {
    return Vector.makeInstance(args.length, args);
};

var makeString = function(s) {
	if (s instanceof Str) {
		return s;
	}
	else if (s instanceof Array) {
//		for (var i = 0; i < s.length; i++) {
//			if ( typeof s[i] !== 'string' || s[i].length != 1 ) {
//				return undefined;
//			}
//		}
		return Str.makeInstance(s);
	}
	else if (typeof s === 'string') {
		return Str.fromString(s);
	}
	else {
		throw types.internalError('makeString expects and array of 1-character strings or a string;' +
					  ' given ' + s.toString(),
					  false);
	}
};

var makeHashEq = function(lst) {
	var newHash = new EqHashTable();
	while ( !lst.isEmpty() ) {
		newHash.hash.put(lst.first().first(), lst.first().rest());
		lst = lst.rest();
	}
	return newHash;
};

var makeHashEqual = function(lst) {
	var newHash = new EqualHashTable();
	while ( !lst.isEmpty() ) {
		newHash.hash.put(lst.first().first(), lst.first().rest());
		lst = lst.rest();
	}
	return newHash;
};

//if there is not enough location information available,
//this allows for highlighting to be turned off
var NoLocation = makeVector(['<no-location>', 0,0,0,0]);

var isNoLocation = function(o) {
  return o === NoLocation;
};

var Posn = makeStructureType('posn', false, 2, 0, false, false);
var Color = makeStructureType('color', false, 4, 0, false, false);
var ArityAtLeast = makeStructureType('arity-at-least', false, 1, 0, false,
		function(k, n, name) {
			helpers.check(undefined, n, function(x) { return ( jsnums.isExact(x) &&
								jsnums.isInteger(x) &&
								jsnums.greaterThanOrEqual(x, 0) ); },
				      name, 'exact non-negative integer', 1);
			k(n);
		});

types.symbol = Symbol.makeInstance;
types.rational = jsnums.makeRational;
types.roughnum = jsnums.makeRoughnum;
types.complexrational = jsnums.makeComplexRational;
types.complexroughnum = jsnums.makeComplexRoughnum;
//types['float'] = jsnums.makeFloat;
//types.complex = jsnums.makeComplex;
types.bignum = jsnums.makeBignum;
types.list = makeList;
types.vector = makeVector;
types.regexp = function(p) { return new RegularExpression(p) ; }
types.byteRegexp = function(p) { return new ByteRegularExpression(p) ; }
types['char'] = Char.makeInstance;
types['string'] = makeString;
types.box = function(x) { return new Box(x, true); };
types.boxImmutable = function(x) { return new Box(x, false); };
types.path = function(x) { return new Path(x); };
types.bytes = function(x, mutable) { return new Bytes(x, mutable); };
types.keyword = function(k) { return new Keyword(k); };
types.pair = function(x, y) { return Cons.makeInstance(x, y); };
types.hash = makeHashEqual;
types.hashEq = makeHashEq;
types.jsObject = function(name, obj) { return new JsObject(name, obj); };

types.toWrittenString = toWrittenString;
types.toDisplayedString = toDisplayedString;
types.toDomNode = toDomNode;

types.posn = Posn.constructor;
types.posnX = function(psn) { return Posn.accessor(psn, 0); };
types.posnY = function(psn) { return Posn.accessor(psn, 1); };

types.color = function(r, g, b, a) {
    if (a === undefined) {
        a = 255;
    }
    return Color.constructor(r, g, b, a);
};
types.colorRed = function(x) { return Color.accessor(x, 0); };
types.colorGreen = function(x) { return Color.accessor(x, 1); };
types.colorBlue = function(x) { return Color.accessor(x, 2); };
types.colorAlpha = function(x) { return Color.accessor(x, 3); };

types.arityAtLeast = ArityAtLeast.constructor;
types.arityValue = function(arity) { return ArityAtLeast.accessor(arity, 0); };

types.FALSE = Logic.FALSE;
types.TRUE = Logic.TRUE;
types.EMPTY = Empty.EMPTY;

types.isEqual = isEqual;
types.isNumber = isNumber;
types.isSymbol = function(x) { return x instanceof Symbol; };
types.isChar = function(x) { return x instanceof Char; };
types.isString = isString;
types.isPair = function(x) { return x instanceof Cons; };
types.isVector = function(x) { return x instanceof Vector; };
types.isBox = function(x) { return x instanceof Box; };
types.isHash = function(x) { return (x instanceof EqHashTable ||
				     x instanceof EqualHashTable); };
types.isByteString = function(x) { return x instanceof Bytes; };
types.isStruct = function(x) { return x instanceof Struct; };
types.isPosn = Posn.predicate;
types.isArityAtLeast = ArityAtLeast.predicate;
types.isColor = Color.predicate;
types.isFunction = function(x) {
	return (x instanceof PrimProc ||
		x instanceof CasePrimitive ||
		x instanceof ClosureValue ||
		x instanceof CaseLambdaValue ||
		x instanceof ContinuationClosureValue);
};
types.isJsObject = function(x) { return x instanceof JsObject; };

types.UnionFind = UnionFind;
types.cons = Cons.makeInstance;

types.UNDEFINED = UNDEFINED_VALUE;
types.VOID = VOID_VALUE;
types.EOF = EOF_VALUE;

types.ValuesWrapper = ValuesWrapper;
types.ClosureValue = ClosureValue;
types.ContinuationPrompt = ContinuationPrompt;
types.defaultContinuationPrompt = defaultContinuationPrompt;
types.ContinuationClosureValue = ContinuationClosureValue;
types.CaseLambdaValue = CaseLambdaValue;
types.PrimProc = PrimProc;
types.CasePrimitive = CasePrimitive;

types.contMarkRecordControl = function(dict) { return new ContMarkRecordControl(dict); };
types.isContMarkRecordControl = function(x) { return x instanceof ContMarkRecordControl; };
types.continuationMarkSet = function(dict) { return new ContinuationMarkSet(dict); };
types.isContinuationMarkSet = function(x) { return x instanceof ContinuationMarkSet; };

types.PrefixValue = PrefixValue;
types.GlobalBucket = GlobalBucket;
types.ModuleVariableRecord = ModuleVariableRecord;
types.VariableReference = VariableReference;

types.Box = Box;
types.ThreadCell = ThreadCell;

types.Class = Class;

types.makeStructureType = makeStructureType;
types.isStructType = function(x) { return x instanceof StructType; };

types.makeLowLevelEqHash = makeLowLevelEqHash;

// Error type exports
var InternalError = function(val, contMarks) {
	this.val = val;
	this.contMarks = (contMarks ? contMarks : false);
}
types.internalError = function(v, contMarks) { return new InternalError(v, contMarks); };
types.isInternalError = function(x) { return x instanceof InternalError; };

var SchemeError = function(val) {
	this.val = val;
}
types.schemeError = function(v) { return new SchemeError(v); };
types.isSchemeError = function(v) { return v instanceof SchemeError; };

var IncompleteExn = function(constructor, msg, otherArgs) {
	this.constructor = constructor;
	this.msg = msg;
	this.otherArgs = otherArgs;
};
types.incompleteExn = function(constructor, msg, args) { return new IncompleteExn(constructor, msg, args); };
types.isIncompleteExn = function(x) { return x instanceof IncompleteExn; };

var Exn = makeStructureType('exn', false, 2, 0, false,
		function(k, msg, contMarks, name) {
			// helpers.check(msg, isString, name, 'string', 1, [msg, contMarks]);
			helpers.check(undefined, contMarks, types.isContinuationMarkSet, name, 'continuation mark set', 2);
			k( new ValuesWrapper([msg, contMarks]) );
		});
types.exn = Exn.constructor;
types.isExn = Exn.predicate;
types.exnMessage = function(exn) { return Exn.accessor(exn, 0); };
types.exnContMarks = function(exn) { return Exn.accessor(exn, 1); };
types.exnSetContMarks = function(exn, v) { Exn.mutator(exn, 1, v); };

// (define-struct (exn:break exn) (continuation))
var ExnBreak = makeStructureType('exn:break', Exn, 1, 0, false,
		function(k, msg, contMarks, cont, name) {
		// FIXME: what type is a continuation here?
//			helpers.check(cont, isContinuation, name, 'continuation', 3);
			k( new ValuesWrapper([msg, contMarks, cont]) );
		});
types.exnBreak = ExnBreak.constructor;
types.isExnBreak = ExnBreak.predicate;
types.exnBreakContinuation = function(exn) {
    return ExnBreak.accessor(exn, 0); };

var ExnFail = makeStructureType('exn:fail', Exn, 0, 0, false, false);
types.exnFail = ExnFail.constructor;
types.isExnFail = ExnFail.predicate;

var ExnFailContract = makeStructureType('exn:fail:contract', ExnFail, 0, 0, false, false);
types.exnFailContract = ExnFailContract.constructor;
types.isExnFailContract = ExnFailContract.predicate;

var ExnFailContractArity = makeStructureType('exn:fail:contract:arity', ExnFailContract, 0, 0, false, false);
types.exnFailContractArity = ExnFailContract.constructor;
types.isExnFailContractArity = ExnFailContract.predicate;

var ExnFailContractVariable = makeStructureType('exn:fail:contract:variable', ExnFailContract, 1, 0, false, false);
types.exnFailContractVariable = ExnFailContract.constructor;
types.isExnFailContractVariable = ExnFailContract.predicate;
types.exnFailContractVariableId = function(exn) { return ExnFailContractVariable.accessor(exn, 0); };

var ExnFailContractDivisionByZero = makeStructureType('exn:fail:contract:division-by-zero', ExnFailContract, 0, 0, false, false);
types.exnFailContractDivisionByZero = ExnFailContractDivisionByZero.constructor;
types.isExnFailContractDivisionByZero = ExnFailContractDivisionByZero.predicate;

var ExnFailContractArityWithPosition = makeStructureType('exn:fail:contract:arity:position', ExnFailContractArity, 1, 0, false, false);
types.exnFailContractArityWithPosition = ExnFailContractArityWithPosition.constructor;
types.isExnFailContractArityWithPosition = ExnFailContractArityWithPosition.predicate;

types.exnFailContractArityWithPositionLocations = function(exn) { return ExnFailContractArityWithPosition.accessor(exn, 0); };

///////////////////////////////////////
// World-specific exports

types.worldConfig = function(startup, shutdown, args) { return new WorldConfig(startup, shutdown, args); };
types.isWorldConfig = function(x) { return x instanceof WorldConfig; };

types.makeEffectType = makeEffectType;
types.isEffectType = function(x) {
	return (x instanceof StructType && x.type.prototype.invokeEffect) ? true : false;
};

types.isEffect = Effect.predicate;

//types.EffectDoNothing = makeEffectType('effect:do-nothing',
//				       false,
//				       0,
//				       function(k) { k(); },
//				       [],
//				       function(k) { k(new ValuesWrapper([])); },
//				       function(f, args, k) { f(k); });
//types.effectDoNothing = EffectDoNothing.constructor;
//types.isEffectDoNothing = EffectDoNothing.predicate;

//RenderEffect = makeStructureType('render-effect', false, 2, 0, false,
//		function(k, domNode, effects, name) {
//			helpers.checkListOf(effects, helpers.procArityContains(0), name, 'procedure (arity 0)', 2);
//			k( new ValuesWrapper([domNode, effects]) );
//		});

types.makeRenderEffectType = makeRenderEffectType;
types.isRenderEffectType = function(x) {
	return (x instanceof StructType && x.type.prototype.callImplementation) ? true : false;
};

//types.RenderEffect = RenderEffect;
//types.makeRenderEffect = RenderEffect.constructor;
types.isRenderEffect = RenderEffect.predicate;
//types.renderEffectDomNode = function(x) { return RenderEffect.accessor(x, 0); };
//types.renderEffectEffects = function(x) { return RenderEffect.accessor(x, 1); };
//types.setRenderEffectEffects = function(x, v) { RenderEffect.mutator(x, 1, v); };

types.NoLocation = NoLocation;
types.isNoLocation = isNoLocation;

types.ColoredPart = ColoredPart;
types.Message = Message;
types.isColoredPart = isColoredPart;
types.isMessage = isMessage;
types.GradientPart = GradientPart;
types.isGradientPart = isGradientPart;
types.MultiPart = MultiPart;
types.isMultiPart = isMultiPart;

})();
return {
  types: types,
  Char: Char,
  Vector: Vector
}

});
