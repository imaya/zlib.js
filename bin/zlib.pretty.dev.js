/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.DEBUG = true;
goog.LOCALE = "en";
goog.provide = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while(namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if(goog.getObjectByName(namespace)) {
        break
      }
      goog.implicitNamespaces_[namespace] = true
    }
  }
  goog.exportPath_(name)
};
goog.setTestOnly = function(opt_message) {
  if(COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
if(!COMPILED) {
  goog.isProvided_ = function(name) {
    return!goog.implicitNamespaces_[name] && !!goog.getObjectByName(name)
  };
  goog.implicitNamespaces_ = {}
}
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if(!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0])
  }
  for(var part;parts.length && (part = parts.shift());) {
    if(!parts.length && goog.isDef(opt_object)) {
      cur[part] = opt_object
    }else {
      if(cur[part]) {
        cur = cur[part]
      }else {
        cur = cur[part] = {}
      }
    }
  }
};
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for(var part;part = parts.shift();) {
    if(goog.isDefAndNotNull(cur[part])) {
      cur = cur[part]
    }else {
      return null
    }
  }
  return cur
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for(var x in obj) {
    global[x] = obj[x]
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if(!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for(var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if(!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {}
      }
      deps.pathToNames[path][provide] = true
    }
    for(var j = 0;require = requires[j];j++) {
      if(!(path in deps.requires)) {
        deps.requires[path] = {}
      }
      deps.requires[path][require] = true
    }
  }
};
goog.ENABLE_DEBUG_LOADER = true;
goog.require = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      return
    }
    if(goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if(path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    if(goog.global.console) {
      goog.global.console["error"](errorMessage)
    }
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if(ctor.instance_) {
      return ctor.instance_
    }
    if(goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor
    }
    return ctor.instance_ = new ctor
  }
};
goog.instantiatedSingletons_ = [];
if(!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc
  };
  goog.findBasePath_ = function() {
    if(goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return
    }else {
      if(!goog.inHtmlDocument_()) {
        return
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for(var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if(src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if(!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true
    }
  };
  goog.writeScriptTag_ = function(src) {
    if(goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true
    }else {
      return false
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if(path in deps.written) {
        return
      }
      if(path in deps.visited) {
        if(!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path)
        }
        return
      }
      deps.visited[path] = true;
      if(path in deps.requires) {
        for(var requireName in deps.requires[path]) {
          if(!goog.isProvided_(requireName)) {
            if(requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName])
            }else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if(!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path)
      }
    }
    for(var path in goog.included_) {
      if(!deps.written[path]) {
        visitNode(path)
      }
    }
    for(var i = 0;i < scripts.length;i++) {
      if(scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i])
      }else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if(rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule]
    }else {
      return null
    }
  };
  goog.findBasePath_();
  if(!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js")
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if(s == "object") {
    if(value) {
      if(value instanceof Array) {
        return"array"
      }else {
        if(value instanceof Object) {
          return s
        }
      }
      var className = Object.prototype.toString.call((value));
      if(className == "[object Window]") {
        return"object"
      }
      if(className == "[object Array]" || typeof value.length == "number" && typeof value.splice != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")) {
        return"array"
      }
      if(className == "[object Function]" || typeof value.call != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if(s == "function" && typeof value.call == "undefined") {
      return"object"
    }
  }
  return s
};
goog.isDef = function(val) {
  return val !== undefined
};
goog.isNull = function(val) {
  return val === null
};
goog.isDefAndNotNull = function(val) {
  return val != null
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array"
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number"
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function"
};
goog.isString = function(val) {
  return typeof val == "string"
};
goog.isBoolean = function(val) {
  return typeof val == "boolean"
};
goog.isNumber = function(val) {
  return typeof val == "number"
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function"
};
goog.isObject = function(val) {
  var type = typeof val;
  return type == "object" && val != null || type == "function"
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.removeUid = function(obj) {
  if("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_)
  }
  try {
    delete obj[goog.UID_PROPERTY_]
  }catch(ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + Math.floor(Math.random() * 2147483648).toString(36);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.cloneObject(obj[key])
    }
    return clone
  }
  return obj
};
Object.prototype.clone;
goog.bindNative_ = function(fn, selfObj, var_args) {
  return(fn.call.apply(fn.bind, arguments))
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if(!fn) {
    throw new Error;
  }
  if(arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs)
    }
  }else {
    return function() {
      return fn.apply(selfObj, arguments)
    }
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if(Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_
  }else {
    goog.bind = goog.bindJs_
  }
  return goog.bind.apply(null, arguments)
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs)
  }
};
goog.mixin = function(target, source) {
  for(var x in source) {
    target[x] = source[x]
  }
};
goog.now = Date.now || function() {
  return+new Date
};
goog.globalEval = function(script) {
  if(goog.global.execScript) {
    goog.global.execScript(script, "JavaScript")
  }else {
    if(goog.global.eval) {
      if(goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if(typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true
        }else {
          goog.evalWorksForGlobals_ = false
        }
      }
      if(goog.evalWorksForGlobals_) {
        goog.global.eval(script)
      }else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt)
      }
    }else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for(var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]))
    }
    return mapped.join("-")
  };
  var rename;
  if(goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts
  }else {
    rename = function(a) {
      return a
    }
  }
  if(opt_modifier) {
    return className + "-" + rename(opt_modifier)
  }else {
    return rename(className)
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if(!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for(var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value)
  }
  return str
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo)
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if(caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1))
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for(var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if(ctor.prototype[opt_methodName] === caller) {
      foundCaller = true
    }else {
      if(foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args)
      }
    }
  }
  if(me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args)
  }else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global)
};
goog.provide("USE_TYPEDARRAY");
var USE_TYPEDARRAY = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Uint32Array !== "undefined" && typeof DataView !== "undefined";
goog.provide("Zlib.BitStream");
goog.require("USE_TYPEDARRAY");
goog.scope(function() {
  Zlib.BitStream = function(buffer, bufferPosition) {
    this.index = typeof bufferPosition === "number" ? bufferPosition : 0;
    this.bitindex = 0;
    this.buffer = buffer instanceof (USE_TYPEDARRAY ? Uint8Array : Array) ? buffer : new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.BitStream.DefaultBlockSize);
    if(this.buffer.length * 2 <= this.index) {
      throw new Error("invalid index");
    }else {
      if(this.buffer.length <= this.index) {
        this.expandBuffer()
      }
    }
  };
  Zlib.BitStream.DefaultBlockSize = 32768;
  Zlib.BitStream.prototype.expandBuffer = function() {
    var oldbuf = this.buffer;
    var i;
    var il = oldbuf.length;
    var buffer = new (USE_TYPEDARRAY ? Uint8Array : Array)(il << 1);
    if(USE_TYPEDARRAY) {
      buffer.set(oldbuf)
    }else {
      for(i = 0;i < il;++i) {
        buffer[i] = oldbuf[i]
      }
    }
    return this.buffer = buffer
  };
  Zlib.BitStream.prototype.writeBits = function(number, n, reverse) {
    var buffer = this.buffer;
    var index = this.index;
    var bitindex = this.bitindex;
    var current = buffer[index];
    var i;
    function rev32_(n) {
      return Zlib.BitStream.ReverseTable[n & 255] << 24 | Zlib.BitStream.ReverseTable[n >>> 8 & 255] << 16 | Zlib.BitStream.ReverseTable[n >>> 16 & 255] << 8 | Zlib.BitStream.ReverseTable[n >>> 24 & 255]
    }
    if(reverse && n > 1) {
      number = n > 8 ? rev32_(number) >> 32 - n : Zlib.BitStream.ReverseTable[number] >> 8 - n
    }
    if(n + bitindex < 8) {
      current = current << n | number;
      bitindex += n
    }else {
      for(i = 0;i < n;++i) {
        current = current << 1 | number >> n - i - 1 & 1;
        if(++bitindex === 8) {
          bitindex = 0;
          buffer[index++] = Zlib.BitStream.ReverseTable[current];
          current = 0;
          if(index === buffer.length) {
            buffer = this.expandBuffer()
          }
        }
      }
    }
    buffer[index] = current;
    this.buffer = buffer;
    this.bitindex = bitindex;
    this.index = index
  };
  Zlib.BitStream.prototype.finish = function() {
    var buffer = this.buffer;
    var index = this.index;
    var output;
    if(this.bitindex > 0) {
      buffer[index] <<= 8 - this.bitindex;
      buffer[index] = Zlib.BitStream.ReverseTable[buffer[index]];
      index++
    }
    if(USE_TYPEDARRAY) {
      output = buffer.subarray(0, index)
    }else {
      buffer.length = index;
      output = buffer
    }
    return output
  };
  Zlib.BitStream.ReverseTable = function(table) {
    return table
  }(function() {
    var table = new (USE_TYPEDARRAY ? Uint8Array : Array)(256);
    var i;
    for(i = 0;i < 256;++i) {
      table[i] = function(n) {
        var r = n;
        var s = 7;
        for(n >>>= 1;n;n >>>= 1) {
          r <<= 1;
          r |= n & 1;
          --s
        }
        return(r << s & 255) >>> 0
      }(i)
    }
    return table
  }())
});
goog.provide("Zlib.CRC32");
goog.require("USE_TYPEDARRAY");
var ZLIB_CRC32_COMPACT = false;
goog.scope(function() {
  Zlib.CRC32.calc = function(data, pos, length) {
    return Zlib.CRC32.update(data, 0, pos, length)
  };
  Zlib.CRC32.update = function(data, crc, pos, length) {
    var table = Zlib.CRC32.Table;
    var i = typeof pos === "number" ? pos : pos = 0;
    var il = typeof length === "number" ? length : data.length;
    crc ^= 4294967295;
    for(i = il & 7;i--;++pos) {
      crc = crc >>> 8 ^ table[(crc ^ data[pos]) & 255]
    }
    for(i = il >> 3;i--;pos += 8) {
      crc = crc >>> 8 ^ table[(crc ^ data[pos]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 1]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 2]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 3]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 4]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 5]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 6]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 7]) & 255]
    }
    return(crc ^ 4294967295) >>> 0
  };
  Zlib.CRC32.single = function(num, crc) {
    return(Zlib.CRC32.Table[(num ^ crc) & 255] ^ num >>> 8) >>> 0
  };
  Zlib.CRC32.Table_ = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 
  3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 
  453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 
  3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 
  1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 
  1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918E3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117];
  Zlib.CRC32.Table = ZLIB_CRC32_COMPACT ? function() {
    var table = new (USE_TYPEDARRAY ? Uint32Array : Array)(256);
    var c;
    var i;
    var j;
    for(i = 0;i < 256;++i) {
      c = i;
      for(j = 0;j < 8;++j) {
        c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1
      }
      table[i] = c >>> 0
    }
    return table
  }() : USE_TYPEDARRAY ? new Uint32Array(Zlib.CRC32.Table_) : Zlib.CRC32.Table_
});
goog.provide("Zlib.GunzipMember");
goog.scope(function() {
  Zlib.GunzipMember = function() {
    this.id1;
    this.id2;
    this.cm;
    this.flg;
    this.mtime;
    this.xfl;
    this.os;
    this.crc16;
    this.xlen;
    this.crc32;
    this.isize;
    this.name;
    this.comment;
    this.data
  };
  Zlib.GunzipMember.prototype.getName = function() {
    return this.name
  };
  Zlib.GunzipMember.prototype.getData = function() {
    return this.data
  };
  Zlib.GunzipMember.prototype.getMtime = function() {
    return this.mtime
  }
});
goog.provide("Zlib.Heap");
goog.require("USE_TYPEDARRAY");
goog.scope(function() {
  Zlib.Heap = function(length) {
    this.buffer = new (USE_TYPEDARRAY ? Uint16Array : Array)(length * 2);
    this.length = 0
  };
  Zlib.Heap.prototype.getParent = function(index) {
    return((index - 2) / 4 | 0) * 2
  };
  Zlib.Heap.prototype.getChild = function(index) {
    return 2 * index + 2
  };
  Zlib.Heap.prototype.push = function(index, value) {
    var current, parent, heap = this.buffer, swap;
    current = this.length;
    heap[this.length++] = value;
    heap[this.length++] = index;
    while(current > 0) {
      parent = this.getParent(current);
      if(heap[current] > heap[parent]) {
        swap = heap[current];
        heap[current] = heap[parent];
        heap[parent] = swap;
        swap = heap[current + 1];
        heap[current + 1] = heap[parent + 1];
        heap[parent + 1] = swap;
        current = parent
      }else {
        break
      }
    }
    return this.length
  };
  Zlib.Heap.prototype.pop = function() {
    var index, value, heap = this.buffer, swap, current, parent;
    value = heap[0];
    index = heap[1];
    this.length -= 2;
    heap[0] = heap[this.length];
    heap[1] = heap[this.length + 1];
    parent = 0;
    while(true) {
      current = this.getChild(parent);
      if(current >= this.length) {
        break
      }
      if(current + 2 < this.length && heap[current + 2] > heap[current]) {
        current += 2
      }
      if(heap[current] > heap[parent]) {
        swap = heap[parent];
        heap[parent] = heap[current];
        heap[current] = swap;
        swap = heap[parent + 1];
        heap[parent + 1] = heap[current + 1];
        heap[current + 1] = swap
      }else {
        break
      }
      parent = current
    }
    return{index:index, value:value, length:this.length}
  }
});
goog.provide("Zlib.Huffman");
goog.require("USE_TYPEDARRAY");
goog.scope(function() {
  Zlib.Huffman.buildHuffmanTable = function(lengths) {
    var listSize = lengths.length;
    var maxCodeLength = 0;
    var minCodeLength = Number.POSITIVE_INFINITY;
    var size;
    var table;
    var bitLength;
    var code;
    var skip;
    var reversed;
    var rtemp;
    var i;
    var il;
    var j;
    var value;
    for(i = 0, il = listSize;i < il;++i) {
      if(lengths[i] > maxCodeLength) {
        maxCodeLength = lengths[i]
      }
      if(lengths[i] < minCodeLength) {
        minCodeLength = lengths[i]
      }
    }
    size = 1 << maxCodeLength;
    table = new (USE_TYPEDARRAY ? Uint32Array : Array)(size);
    for(bitLength = 1, code = 0, skip = 2;bitLength <= maxCodeLength;) {
      for(i = 0;i < listSize;++i) {
        if(lengths[i] === bitLength) {
          for(reversed = 0, rtemp = code, j = 0;j < bitLength;++j) {
            reversed = reversed << 1 | rtemp & 1;
            rtemp >>= 1
          }
          value = bitLength << 16 | i;
          for(j = reversed;j < size;j += skip) {
            table[j] = value
          }
          ++code
        }
      }
      ++bitLength;
      code <<= 1;
      skip <<= 1
    }
    return[table, maxCodeLength, minCodeLength]
  }
});
goog.provide("Zlib.RawDeflate");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.BitStream");
goog.require("Zlib.Heap");
goog.scope(function() {
  Zlib.RawDeflate = function(input, opt_params) {
    this.compressionType = Zlib.RawDeflate.CompressionType.DYNAMIC;
    this.lazy = 0;
    this.freqsLitLen;
    this.freqsDist;
    this.input = USE_TYPEDARRAY && input instanceof Array ? new Uint8Array(input) : input;
    this.output;
    this.op = 0;
    if(opt_params) {
      if(opt_params["lazy"]) {
        this.lazy = opt_params["lazy"]
      }
      if(typeof opt_params["compressionType"] === "number") {
        this.compressionType = opt_params["compressionType"]
      }
      if(opt_params["outputBuffer"]) {
        this.output = USE_TYPEDARRAY && opt_params["outputBuffer"] instanceof Array ? new Uint8Array(opt_params["outputBuffer"]) : opt_params["outputBuffer"]
      }
      if(typeof opt_params["outputIndex"] === "number") {
        this.op = opt_params["outputIndex"]
      }
    }
    if(!this.output) {
      this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(32768)
    }
  };
  Zlib.RawDeflate.CompressionType = {NONE:0, FIXED:1, DYNAMIC:2, RESERVED:3};
  Zlib.RawDeflate.Lz77MinLength = 3;
  Zlib.RawDeflate.Lz77MaxLength = 258;
  Zlib.RawDeflate.WindowSize = 32768;
  Zlib.RawDeflate.MaxCodeLength = 16;
  Zlib.RawDeflate.HUFMAX = 286;
  Zlib.RawDeflate.FixedHuffmanTable = function() {
    var table = [], i;
    for(i = 0;i < 288;i++) {
      switch(true) {
        case i <= 143:
          table.push([i + 48, 8]);
          break;
        case i <= 255:
          table.push([i - 144 + 400, 9]);
          break;
        case i <= 279:
          table.push([i - 256 + 0, 7]);
          break;
        case i <= 287:
          table.push([i - 280 + 192, 8]);
          break;
        default:
          throw"invalid literal: " + i;
      }
    }
    return table
  }();
  Zlib.RawDeflate.prototype.compress = function() {
    var blockArray;
    var position;
    var length;
    var input = this.input;
    switch(this.compressionType) {
      case Zlib.RawDeflate.CompressionType.NONE:
        for(position = 0, length = input.length;position < length;) {
          blockArray = USE_TYPEDARRAY ? input.subarray(position, position + 65535) : input.slice(position, position + 65535);
          position += blockArray.length;
          this.makeNocompressBlock(blockArray, position === length)
        }
        break;
      case Zlib.RawDeflate.CompressionType.FIXED:
        this.output = this.makeFixedHuffmanBlock(input, true);
        this.op = this.output.length;
        break;
      case Zlib.RawDeflate.CompressionType.DYNAMIC:
        this.output = this.makeDynamicHuffmanBlock(input, true);
        this.op = this.output.length;
        break;
      default:
        throw"invalid compression type";
    }
    return this.output
  };
  Zlib.RawDeflate.prototype.makeNocompressBlock = function(blockArray, isFinalBlock) {
    var bfinal;
    var btype;
    var len;
    var nlen;
    var i;
    var il;
    var output = this.output;
    var op = this.op;
    if(USE_TYPEDARRAY) {
      output = new Uint8Array(this.output.buffer);
      while(output.length <= op + blockArray.length + 5) {
        output = new Uint8Array(output.length << 1)
      }
      output.set(this.output)
    }
    bfinal = isFinalBlock ? 1 : 0;
    btype = Zlib.RawDeflate.CompressionType.NONE;
    output[op++] = bfinal | btype << 1;
    len = blockArray.length;
    nlen = ~len + 65536 & 65535;
    output[op++] = len & 255;
    output[op++] = len >>> 8 & 255;
    output[op++] = nlen & 255;
    output[op++] = nlen >>> 8 & 255;
    if(USE_TYPEDARRAY) {
      output.set(blockArray, op);
      op += blockArray.length;
      output = output.subarray(0, op)
    }else {
      for(i = 0, il = blockArray.length;i < il;++i) {
        output[op++] = blockArray[i]
      }
      output.length = op
    }
    this.op = op;
    this.output = output;
    return output
  };
  Zlib.RawDeflate.prototype.makeFixedHuffmanBlock = function(blockArray, isFinalBlock) {
    var stream = new Zlib.BitStream(USE_TYPEDARRAY ? new Uint8Array(this.output.buffer) : this.output, this.op);
    var bfinal;
    var btype;
    var data;
    bfinal = isFinalBlock ? 1 : 0;
    btype = Zlib.RawDeflate.CompressionType.FIXED;
    stream.writeBits(bfinal, 1, true);
    stream.writeBits(btype, 2, true);
    data = this.lz77(blockArray);
    this.fixedHuffman(data, stream);
    return stream.finish()
  };
  Zlib.RawDeflate.prototype.makeDynamicHuffmanBlock = function(blockArray, isFinalBlock) {
    var stream = new Zlib.BitStream(USE_TYPEDARRAY ? new Uint8Array(this.output.buffer) : this.output, this.op);
    var bfinal;
    var btype;
    var data;
    var hlit;
    var hdist;
    var hclen;
    var hclenOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var litLenLengths;
    var litLenCodes;
    var distLengths;
    var distCodes;
    var treeSymbols;
    var treeLengths;
    var transLengths = new Array(19);
    var treeCodes;
    var code;
    var bitlen;
    var i;
    var il;
    bfinal = isFinalBlock ? 1 : 0;
    btype = Zlib.RawDeflate.CompressionType.DYNAMIC;
    stream.writeBits(bfinal, 1, true);
    stream.writeBits(btype, 2, true);
    data = this.lz77(blockArray);
    litLenLengths = this.getLengths_(this.freqsLitLen, 15);
    litLenCodes = this.getCodesFromLengths_(litLenLengths);
    distLengths = this.getLengths_(this.freqsDist, 7);
    distCodes = this.getCodesFromLengths_(distLengths);
    for(hlit = 286;hlit > 257 && litLenLengths[hlit - 1] === 0;hlit--) {
    }
    for(hdist = 30;hdist > 1 && distLengths[hdist - 1] === 0;hdist--) {
    }
    treeSymbols = this.getTreeSymbols_(hlit, litLenLengths, hdist, distLengths);
    treeLengths = this.getLengths_(treeSymbols.freqs, 7);
    for(i = 0;i < 19;i++) {
      transLengths[i] = treeLengths[hclenOrder[i]]
    }
    for(hclen = 19;hclen > 4 && transLengths[hclen - 1] === 0;hclen--) {
    }
    treeCodes = this.getCodesFromLengths_(treeLengths);
    stream.writeBits(hlit - 257, 5, true);
    stream.writeBits(hdist - 1, 5, true);
    stream.writeBits(hclen - 4, 4, true);
    for(i = 0;i < hclen;i++) {
      stream.writeBits(transLengths[i], 3, true)
    }
    for(i = 0, il = treeSymbols.codes.length;i < il;i++) {
      code = treeSymbols.codes[i];
      stream.writeBits(treeCodes[code], treeLengths[code], true);
      if(code >= 16) {
        i++;
        switch(code) {
          case 16:
            bitlen = 2;
            break;
          case 17:
            bitlen = 3;
            break;
          case 18:
            bitlen = 7;
            break;
          default:
            throw"invalid code: " + code;
        }
        stream.writeBits(treeSymbols.codes[i], bitlen, true)
      }
    }
    this.dynamicHuffman(data, [litLenCodes, litLenLengths], [distCodes, distLengths], stream);
    return stream.finish()
  };
  Zlib.RawDeflate.prototype.dynamicHuffman = function(dataArray, litLen, dist, stream) {
    var index;
    var length;
    var literal;
    var code;
    var litLenCodes;
    var litLenLengths;
    var distCodes;
    var distLengths;
    litLenCodes = litLen[0];
    litLenLengths = litLen[1];
    distCodes = dist[0];
    distLengths = dist[1];
    for(index = 0, length = dataArray.length;index < length;++index) {
      literal = dataArray[index];
      stream.writeBits(litLenCodes[literal], litLenLengths[literal], true);
      if(literal > 256) {
        stream.writeBits(dataArray[++index], dataArray[++index], true);
        code = dataArray[++index];
        stream.writeBits(distCodes[code], distLengths[code], true);
        stream.writeBits(dataArray[++index], dataArray[++index], true)
      }else {
        if(literal === 256) {
          break
        }
      }
    }
    return stream
  };
  Zlib.RawDeflate.prototype.fixedHuffman = function(dataArray, stream) {
    var index;
    var length;
    var literal;
    for(index = 0, length = dataArray.length;index < length;index++) {
      literal = dataArray[index];
      Zlib.BitStream.prototype.writeBits.apply(stream, Zlib.RawDeflate.FixedHuffmanTable[literal]);
      if(literal > 256) {
        stream.writeBits(dataArray[++index], dataArray[++index], true);
        stream.writeBits(dataArray[++index], 5);
        stream.writeBits(dataArray[++index], dataArray[++index], true)
      }else {
        if(literal === 256) {
          break
        }
      }
    }
    return stream
  };
  Zlib.RawDeflate.Lz77Match = function(length, backwardDistance) {
    this.length = length;
    this.backwardDistance = backwardDistance
  };
  Zlib.RawDeflate.Lz77Match.LengthCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint32Array(table) : table
  }(function() {
    var table = [];
    var i;
    var c;
    for(i = 3;i <= 258;i++) {
      c = code(i);
      table[i] = c[2] << 24 | c[1] << 16 | c[0]
    }
    function code(length) {
      switch(true) {
        case length === 3:
          return[257, length - 3, 0];
          break;
        case length === 4:
          return[258, length - 4, 0];
          break;
        case length === 5:
          return[259, length - 5, 0];
          break;
        case length === 6:
          return[260, length - 6, 0];
          break;
        case length === 7:
          return[261, length - 7, 0];
          break;
        case length === 8:
          return[262, length - 8, 0];
          break;
        case length === 9:
          return[263, length - 9, 0];
          break;
        case length === 10:
          return[264, length - 10, 0];
          break;
        case length <= 12:
          return[265, length - 11, 1];
          break;
        case length <= 14:
          return[266, length - 13, 1];
          break;
        case length <= 16:
          return[267, length - 15, 1];
          break;
        case length <= 18:
          return[268, length - 17, 1];
          break;
        case length <= 22:
          return[269, length - 19, 2];
          break;
        case length <= 26:
          return[270, length - 23, 2];
          break;
        case length <= 30:
          return[271, length - 27, 2];
          break;
        case length <= 34:
          return[272, length - 31, 2];
          break;
        case length <= 42:
          return[273, length - 35, 3];
          break;
        case length <= 50:
          return[274, length - 43, 3];
          break;
        case length <= 58:
          return[275, length - 51, 3];
          break;
        case length <= 66:
          return[276, length - 59, 3];
          break;
        case length <= 82:
          return[277, length - 67, 4];
          break;
        case length <= 98:
          return[278, length - 83, 4];
          break;
        case length <= 114:
          return[279, length - 99, 4];
          break;
        case length <= 130:
          return[280, length - 115, 4];
          break;
        case length <= 162:
          return[281, length - 131, 5];
          break;
        case length <= 194:
          return[282, length - 163, 5];
          break;
        case length <= 226:
          return[283, length - 195, 5];
          break;
        case length <= 257:
          return[284, length - 227, 5];
          break;
        case length === 258:
          return[285, length - 258, 0];
          break;
        default:
          throw"invalid length: " + length;
      }
    }
    return table
  }());
  Zlib.RawDeflate.Lz77Match.prototype.getDistanceCode_ = function(dist) {
    var r;
    switch(true) {
      case dist === 1:
        r = [0, dist - 1, 0];
        break;
      case dist === 2:
        r = [1, dist - 2, 0];
        break;
      case dist === 3:
        r = [2, dist - 3, 0];
        break;
      case dist === 4:
        r = [3, dist - 4, 0];
        break;
      case dist <= 6:
        r = [4, dist - 5, 1];
        break;
      case dist <= 8:
        r = [5, dist - 7, 1];
        break;
      case dist <= 12:
        r = [6, dist - 9, 2];
        break;
      case dist <= 16:
        r = [7, dist - 13, 2];
        break;
      case dist <= 24:
        r = [8, dist - 17, 3];
        break;
      case dist <= 32:
        r = [9, dist - 25, 3];
        break;
      case dist <= 48:
        r = [10, dist - 33, 4];
        break;
      case dist <= 64:
        r = [11, dist - 49, 4];
        break;
      case dist <= 96:
        r = [12, dist - 65, 5];
        break;
      case dist <= 128:
        r = [13, dist - 97, 5];
        break;
      case dist <= 192:
        r = [14, dist - 129, 6];
        break;
      case dist <= 256:
        r = [15, dist - 193, 6];
        break;
      case dist <= 384:
        r = [16, dist - 257, 7];
        break;
      case dist <= 512:
        r = [17, dist - 385, 7];
        break;
      case dist <= 768:
        r = [18, dist - 513, 8];
        break;
      case dist <= 1024:
        r = [19, dist - 769, 8];
        break;
      case dist <= 1536:
        r = [20, dist - 1025, 9];
        break;
      case dist <= 2048:
        r = [21, dist - 1537, 9];
        break;
      case dist <= 3072:
        r = [22, dist - 2049, 10];
        break;
      case dist <= 4096:
        r = [23, dist - 3073, 10];
        break;
      case dist <= 6144:
        r = [24, dist - 4097, 11];
        break;
      case dist <= 8192:
        r = [25, dist - 6145, 11];
        break;
      case dist <= 12288:
        r = [26, dist - 8193, 12];
        break;
      case dist <= 16384:
        r = [27, dist - 12289, 12];
        break;
      case dist <= 24576:
        r = [28, dist - 16385, 13];
        break;
      case dist <= 32768:
        r = [29, dist - 24577, 13];
        break;
      default:
        throw"invalid distance";
    }
    return r
  };
  Zlib.RawDeflate.Lz77Match.prototype.toLz77Array = function() {
    var length = this.length;
    var dist = this.backwardDistance;
    var codeArray = [];
    var pos = 0;
    var code;
    code = Zlib.RawDeflate.Lz77Match.LengthCodeTable[length];
    codeArray[pos++] = code & 65535;
    codeArray[pos++] = code >> 16 & 255;
    codeArray[pos++] = code >> 24;
    code = this.getDistanceCode_(dist);
    codeArray[pos++] = code[0];
    codeArray[pos++] = code[1];
    codeArray[pos++] = code[2];
    return codeArray
  };
  Zlib.RawDeflate.prototype.lz77 = function(dataArray) {
    var position;
    var length;
    var i;
    var il;
    var matchKey;
    var table = {};
    var windowSize = Zlib.RawDeflate.WindowSize;
    var matchList;
    var longestMatch;
    var prevMatch;
    var lz77buf = USE_TYPEDARRAY ? new Uint16Array(dataArray.length * 2) : [];
    var pos = 0;
    var skipLength = 0;
    var freqsLitLen = new (USE_TYPEDARRAY ? Uint32Array : Array)(286);
    var freqsDist = new (USE_TYPEDARRAY ? Uint32Array : Array)(30);
    var lazy = this.lazy;
    var tmp;
    if(!USE_TYPEDARRAY) {
      for(i = 0;i <= 285;) {
        freqsLitLen[i++] = 0
      }
      for(i = 0;i <= 29;) {
        freqsDist[i++] = 0
      }
    }
    freqsLitLen[256] = 1;
    function writeMatch(match, offset) {
      var lz77Array = match.toLz77Array();
      var i;
      var il;
      for(i = 0, il = lz77Array.length;i < il;++i) {
        lz77buf[pos++] = lz77Array[i]
      }
      freqsLitLen[lz77Array[0]]++;
      freqsDist[lz77Array[3]]++;
      skipLength = match.length + offset - 1;
      prevMatch = null
    }
    for(position = 0, length = dataArray.length;position < length;++position) {
      for(matchKey = 0, i = 0, il = Zlib.RawDeflate.Lz77MinLength;i < il;++i) {
        if(position + i === length) {
          break
        }
        matchKey = matchKey << 8 | dataArray[position + i]
      }
      if(table[matchKey] === void 0) {
        table[matchKey] = []
      }
      matchList = table[matchKey];
      if(skipLength-- > 0) {
        matchList.push(position);
        continue
      }
      while(matchList.length > 0 && position - matchList[0] > windowSize) {
        matchList.shift()
      }
      if(position + Zlib.RawDeflate.Lz77MinLength >= length) {
        if(prevMatch) {
          writeMatch(prevMatch, -1)
        }
        for(i = 0, il = length - position;i < il;++i) {
          tmp = dataArray[position + i];
          lz77buf[pos++] = tmp;
          ++freqsLitLen[tmp]
        }
        break
      }
      if(matchList.length > 0) {
        longestMatch = this.searchLongestMatch_(dataArray, position, matchList);
        if(prevMatch) {
          if(prevMatch.length < longestMatch.length) {
            tmp = dataArray[position - 1];
            lz77buf[pos++] = tmp;
            ++freqsLitLen[tmp];
            writeMatch(longestMatch, 0)
          }else {
            writeMatch(prevMatch, -1)
          }
        }else {
          if(longestMatch.length < lazy) {
            prevMatch = longestMatch
          }else {
            writeMatch(longestMatch, 0)
          }
        }
      }else {
        if(prevMatch) {
          writeMatch(prevMatch, -1)
        }else {
          tmp = dataArray[position];
          lz77buf[pos++] = tmp;
          ++freqsLitLen[tmp]
        }
      }
      matchList.push(position)
    }
    lz77buf[pos++] = 256;
    freqsLitLen[256]++;
    this.freqsLitLen = freqsLitLen;
    this.freqsDist = freqsDist;
    return(USE_TYPEDARRAY ? lz77buf.subarray(0, pos) : lz77buf)
  };
  Zlib.RawDeflate.prototype.searchLongestMatch_ = function(data, position, matchList) {
    var match, currentMatch, matchMax = 0, matchLength, i, j, l, dl = data.length;
    permatch:for(i = 0, l = matchList.length;i < l;i++) {
      match = matchList[l - i - 1];
      matchLength = Zlib.RawDeflate.Lz77MinLength;
      if(matchMax > Zlib.RawDeflate.Lz77MinLength) {
        for(j = matchMax;j > Zlib.RawDeflate.Lz77MinLength;j--) {
          if(data[match + j - 1] !== data[position + j - 1]) {
            continue permatch
          }
        }
        matchLength = matchMax
      }
      while(matchLength < Zlib.RawDeflate.Lz77MaxLength && position + matchLength < dl && data[match + matchLength] === data[position + matchLength]) {
        ++matchLength
      }
      if(matchLength > matchMax) {
        currentMatch = match;
        matchMax = matchLength
      }
      if(matchLength === Zlib.RawDeflate.Lz77MaxLength) {
        break
      }
    }
    return new Zlib.RawDeflate.Lz77Match(matchMax, position - currentMatch)
  };
  Zlib.RawDeflate.prototype.getTreeSymbols_ = function(hlit, litlenLengths, hdist, distLengths) {
    var src = new (USE_TYPEDARRAY ? Uint32Array : Array)(hlit + hdist), i, j, runLength, l, result = new (USE_TYPEDARRAY ? Uint32Array : Array)(286 + 30), nResult, rpt, freqs = new (USE_TYPEDARRAY ? Uint8Array : Array)(19);
    j = 0;
    for(i = 0;i < hlit;i++) {
      src[j++] = litlenLengths[i]
    }
    for(i = 0;i < hdist;i++) {
      src[j++] = distLengths[i]
    }
    if(!USE_TYPEDARRAY) {
      for(i = 0, l = freqs.length;i < l;++i) {
        freqs[i] = 0
      }
    }
    nResult = 0;
    for(i = 0, l = src.length;i < l;i += j) {
      for(j = 1;i + j < l && src[i + j] === src[i];++j) {
      }
      runLength = j;
      if(src[i] === 0) {
        if(runLength < 3) {
          while(runLength-- > 0) {
            result[nResult++] = 0;
            freqs[0]++
          }
        }else {
          while(runLength > 0) {
            rpt = runLength < 138 ? runLength : 138;
            if(rpt > runLength - 3 && rpt < runLength) {
              rpt = runLength - 3
            }
            if(rpt <= 10) {
              result[nResult++] = 17;
              result[nResult++] = rpt - 3;
              freqs[17]++
            }else {
              result[nResult++] = 18;
              result[nResult++] = rpt - 11;
              freqs[18]++
            }
            runLength -= rpt
          }
        }
      }else {
        result[nResult++] = src[i];
        freqs[src[i]]++;
        runLength--;
        if(runLength < 3) {
          while(runLength-- > 0) {
            result[nResult++] = src[i];
            freqs[src[i]]++
          }
        }else {
          while(runLength > 0) {
            rpt = runLength < 6 ? runLength : 6;
            if(rpt > runLength - 3 && rpt < runLength) {
              rpt = runLength - 3
            }
            result[nResult++] = 16;
            result[nResult++] = rpt - 3;
            freqs[16]++;
            runLength -= rpt
          }
        }
      }
    }
    return{codes:USE_TYPEDARRAY ? result.subarray(0, nResult) : result.slice(0, nResult), freqs:freqs}
  };
  Zlib.RawDeflate.prototype.getLengths_ = function(freqs, limit) {
    var nSymbols = freqs.length;
    var heap = new Zlib.Heap(2 * Zlib.RawDeflate.HUFMAX);
    var length = new (USE_TYPEDARRAY ? Uint8Array : Array)(nSymbols);
    var nodes;
    var values;
    var codeLength;
    var i;
    var il;
    if(!USE_TYPEDARRAY) {
      for(i = 0;i < nSymbols;i++) {
        length[i] = 0
      }
    }
    for(i = 0;i < nSymbols;++i) {
      if(freqs[i] > 0) {
        heap.push(i, freqs[i])
      }
    }
    nodes = new Array(heap.length / 2);
    values = new (USE_TYPEDARRAY ? Uint32Array : Array)(heap.length / 2);
    if(nodes.length === 1) {
      length[heap.pop().index] = 1;
      return length
    }
    for(i = 0, il = heap.length / 2;i < il;++i) {
      nodes[i] = heap.pop();
      values[i] = nodes[i].value
    }
    codeLength = this.reversePackageMerge_(values, values.length, limit);
    for(i = 0, il = nodes.length;i < il;++i) {
      length[nodes[i].index] = codeLength[i]
    }
    return length
  };
  Zlib.RawDeflate.prototype.reversePackageMerge_ = function(freqs, symbols, limit) {
    var minimumCost = new (USE_TYPEDARRAY ? Uint16Array : Array)(limit);
    var flag = new (USE_TYPEDARRAY ? Uint8Array : Array)(limit);
    var codeLength = new (USE_TYPEDARRAY ? Uint8Array : Array)(symbols);
    var value = new Array(limit);
    var type = new Array(limit);
    var currentPosition = new Array(limit);
    var excess = (1 << limit) - symbols;
    var half = 1 << limit - 1;
    var i;
    var j;
    var t;
    var weight;
    var next;
    function takePackage(j) {
      var x = type[j][currentPosition[j]];
      if(x === symbols) {
        takePackage(j + 1);
        takePackage(j + 1)
      }else {
        --codeLength[x]
      }
      ++currentPosition[j]
    }
    minimumCost[limit - 1] = symbols;
    for(j = 0;j < limit;++j) {
      if(excess < half) {
        flag[j] = 0
      }else {
        flag[j] = 1;
        excess -= half
      }
      excess <<= 1;
      minimumCost[limit - 2 - j] = (minimumCost[limit - 1 - j] / 2 | 0) + symbols
    }
    minimumCost[0] = flag[0];
    value[0] = new Array(minimumCost[0]);
    type[0] = new Array(minimumCost[0]);
    for(j = 1;j < limit;++j) {
      if(minimumCost[j] > 2 * minimumCost[j - 1] + flag[j]) {
        minimumCost[j] = 2 * minimumCost[j - 1] + flag[j]
      }
      value[j] = new Array(minimumCost[j]);
      type[j] = new Array(minimumCost[j])
    }
    for(i = 0;i < symbols;++i) {
      codeLength[i] = limit
    }
    for(t = 0;t < minimumCost[limit - 1];++t) {
      value[limit - 1][t] = freqs[t];
      type[limit - 1][t] = t
    }
    for(i = 0;i < limit;++i) {
      currentPosition[i] = 0
    }
    if(flag[limit - 1] === 1) {
      --codeLength[0];
      ++currentPosition[limit - 1]
    }
    for(j = limit - 2;j >= 0;--j) {
      i = 0;
      weight = 0;
      next = currentPosition[j + 1];
      for(t = 0;t < minimumCost[j];t++) {
        weight = value[j + 1][next] + value[j + 1][next + 1];
        if(weight > freqs[i]) {
          value[j][t] = weight;
          type[j][t] = symbols;
          next += 2
        }else {
          value[j][t] = freqs[i];
          type[j][t] = i;
          ++i
        }
      }
      currentPosition[j] = 0;
      if(flag[j] === 1) {
        takePackage(j)
      }
    }
    return codeLength
  };
  Zlib.RawDeflate.prototype.getCodesFromLengths_ = function(lengths) {
    var codes = new (USE_TYPEDARRAY ? Uint16Array : Array)(lengths.length), count = [], startCode = [], code = 0, i, il, j, m;
    for(i = 0, il = lengths.length;i < il;i++) {
      count[lengths[i]] = (count[lengths[i]] | 0) + 1
    }
    for(i = 1, il = Zlib.RawDeflate.MaxCodeLength;i <= il;i++) {
      startCode[i] = code;
      code += count[i] | 0;
      code <<= 1
    }
    for(i = 0, il = lengths.length;i < il;i++) {
      code = startCode[lengths[i]];
      startCode[lengths[i]] += 1;
      codes[i] = 0;
      for(j = 0, m = lengths[i];j < m;j++) {
        codes[i] = codes[i] << 1 | code & 1;
        code >>>= 1
      }
    }
    return codes
  }
});
goog.provide("Zlib.Gzip");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.CRC32");
goog.require("Zlib.RawDeflate");
goog.scope(function() {
  Zlib.Gzip = function(input, opt_params) {
    this.input = input;
    this.ip = 0;
    this.output;
    this.op = 0;
    this.flags = {};
    this.filename;
    this.comment;
    this.deflateOptions;
    if(opt_params) {
      if(opt_params["flags"]) {
        this.flags = opt_params["flags"]
      }
      if(typeof opt_params["filename"] === "string") {
        this.filename = opt_params["filename"]
      }
      if(typeof opt_params["comment"] === "string") {
        this.comment = opt_params["comment"]
      }
      if(opt_params["deflateOptions"]) {
        this.deflateOptions = opt_params["deflateOptions"]
      }
    }
    if(!this.deflateOptions) {
      this.deflateOptions = {}
    }
  };
  Zlib.Gzip.DefaultBufferSize = 32768;
  Zlib.Gzip.prototype.compress = function() {
    var flg;
    var mtime;
    var crc16;
    var crc32;
    var rawdeflate;
    var c;
    var i;
    var il;
    var output = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.Gzip.DefaultBufferSize);
    var op = 0;
    var input = this.input;
    var ip = this.ip;
    var filename = this.filename;
    var comment = this.comment;
    output[op++] = 31;
    output[op++] = 139;
    output[op++] = 8;
    flg = 0;
    if(this.flags["fname"]) {
      flg |= Zlib.Gzip.FlagsMask.FNAME
    }
    if(this.flags["fcomment"]) {
      flg |= Zlib.Gzip.FlagsMask.FCOMMENT
    }
    if(this.flags["fhcrc"]) {
      flg |= Zlib.Gzip.FlagsMask.FHCRC
    }
    output[op++] = flg;
    mtime = (Date.now ? Date.now() : +new Date) / 1E3 | 0;
    output[op++] = mtime & 255;
    output[op++] = mtime >>> 8 & 255;
    output[op++] = mtime >>> 16 & 255;
    output[op++] = mtime >>> 24 & 255;
    output[op++] = 0;
    output[op++] = Zlib.Gzip.OperatingSystem.UNKNOWN;
    if(this.flags["fname"] !== void 0) {
      for(i = 0, il = filename.length;i < il;++i) {
        c = filename.charCodeAt(i);
        if(c > 255) {
          output[op++] = c >>> 8 & 255
        }
        output[op++] = c & 255
      }
      output[op++] = 0
    }
    if(this.flags["comment"]) {
      for(i = 0, il = comment.length;i < il;++i) {
        c = comment.charCodeAt(i);
        if(c > 255) {
          output[op++] = c >>> 8 & 255
        }
        output[op++] = c & 255
      }
      output[op++] = 0
    }
    if(this.flags["fhcrc"]) {
      crc16 = Zlib.CRC32.calc(output, 0, op) & 65535;
      output[op++] = crc16 & 255;
      output[op++] = crc16 >>> 8 & 255
    }
    this.deflateOptions["outputBuffer"] = output;
    this.deflateOptions["outputIndex"] = op;
    rawdeflate = new Zlib.RawDeflate(input, this.deflateOptions);
    output = rawdeflate.compress();
    op = rawdeflate.op;
    if(USE_TYPEDARRAY) {
      if(op + 8 > output.buffer.byteLength) {
        this.output = new Uint8Array(op + 8);
        this.output.set(new Uint8Array(output.buffer));
        output = this.output
      }else {
        output = new Uint8Array(output.buffer)
      }
    }
    crc32 = Zlib.CRC32.calc(input);
    output[op++] = crc32 & 255;
    output[op++] = crc32 >>> 8 & 255;
    output[op++] = crc32 >>> 16 & 255;
    output[op++] = crc32 >>> 24 & 255;
    il = input.length;
    output[op++] = il & 255;
    output[op++] = il >>> 8 & 255;
    output[op++] = il >>> 16 & 255;
    output[op++] = il >>> 24 & 255;
    this.ip = ip;
    if(USE_TYPEDARRAY && op < output.length) {
      this.output = output = output.subarray(0, op)
    }
    return output
  };
  Zlib.Gzip.OperatingSystem = {FAT:0, AMIGA:1, VMS:2, UNIX:3, VM_CMS:4, ATARI_TOS:5, HPFS:6, MACINTOSH:7, Z_SYSTEM:8, CP_M:9, TOPS_20:10, NTFS:11, QDOS:12, ACORN_RISCOS:13, UNKNOWN:255};
  Zlib.Gzip.FlagsMask = {FTEXT:1, FHCRC:2, FEXTRA:4, FNAME:8, FCOMMENT:16}
});
goog.provide("Zlib.RawInflate");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.Huffman");
var ZLIB_RAW_INFLATE_BUFFER_SIZE = 32768;
goog.scope(function() {
  var buildHuffmanTable = Zlib.Huffman.buildHuffmanTable;
  Zlib.RawInflate = function(input, opt_params) {
    this.buffer;
    this.blocks = [];
    this.bufferSize = ZLIB_RAW_INFLATE_BUFFER_SIZE;
    this.totalpos = 0;
    this.ip = 0;
    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    this.input = USE_TYPEDARRAY ? new Uint8Array(input) : input;
    this.output;
    this.op;
    this.bfinal = false;
    this.bufferType = Zlib.RawInflate.BufferType.ADAPTIVE;
    this.resize = false;
    this.prev;
    if(opt_params || !(opt_params = {})) {
      if(opt_params["index"]) {
        this.ip = opt_params["index"]
      }
      if(opt_params["bufferSize"]) {
        this.bufferSize = opt_params["bufferSize"]
      }
      if(opt_params["bufferType"]) {
        this.bufferType = opt_params["bufferType"]
      }
      if(opt_params["resize"]) {
        this.resize = opt_params["resize"]
      }
    }
    switch(this.bufferType) {
      case Zlib.RawInflate.BufferType.BLOCK:
        this.op = Zlib.RawInflate.MaxBackwardLength;
        this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.RawInflate.MaxBackwardLength + this.bufferSize + Zlib.RawInflate.MaxCopyLength);
        break;
      case Zlib.RawInflate.BufferType.ADAPTIVE:
        this.op = 0;
        this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(this.bufferSize);
        this.expandBuffer = this.expandBufferAdaptive;
        this.concatBuffer = this.concatBufferDynamic;
        this.decodeHuffman = this.decodeHuffmanAdaptive;
        break;
      default:
        throw new Error("invalid inflate mode");
    }
  };
  Zlib.RawInflate.BufferType = {BLOCK:0, ADAPTIVE:1};
  Zlib.RawInflate.prototype.decompress = function() {
    while(!this.bfinal) {
      this.parseBlock()
    }
    return this.concatBuffer()
  };
  Zlib.RawInflate.MaxBackwardLength = 32768;
  Zlib.RawInflate.MaxCopyLength = 258;
  Zlib.RawInflate.Order = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  Zlib.RawInflate.LengthCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258]);
  Zlib.RawInflate.LengthExtraTable = function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table
  }([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0]);
  Zlib.RawInflate.DistCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577]);
  Zlib.RawInflate.DistExtraTable = function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table
  }([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
  Zlib.RawInflate.FixedLiteralLengthTable = function(table) {
    return table
  }(function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(288);
    var i, il;
    for(i = 0, il = lengths.length;i < il;++i) {
      lengths[i] = i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8
    }
    return buildHuffmanTable(lengths)
  }());
  Zlib.RawInflate.FixedDistanceTable = function(table) {
    return table
  }(function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(30);
    var i, il;
    for(i = 0, il = lengths.length;i < il;++i) {
      lengths[i] = 5
    }
    return buildHuffmanTable(lengths)
  }());
  Zlib.RawInflate.prototype.parseBlock = function() {
    var hdr = this.readBits(3);
    if(hdr & 1) {
      this.bfinal = true
    }
    hdr >>>= 1;
    switch(hdr) {
      case 0:
        this.parseUncompressedBlock();
        break;
      case 1:
        this.parseFixedHuffmanBlock();
        break;
      case 2:
        this.parseDynamicHuffmanBlock();
        break;
      default:
        throw new Error("unknown BTYPE: " + hdr);
    }
  };
  Zlib.RawInflate.prototype.readBits = function(length) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    var inputLength = input.length;
    var octet;
    while(bitsbuflen < length) {
      if(ip >= inputLength) {
        throw new Error("input buffer is broken");
      }
      bitsbuf |= input[ip++] << bitsbuflen;
      bitsbuflen += 8
    }
    octet = bitsbuf & (1 << length) - 1;
    bitsbuf >>>= length;
    bitsbuflen -= length;
    this.bitsbuf = bitsbuf;
    this.bitsbuflen = bitsbuflen;
    this.ip = ip;
    return octet
  };
  Zlib.RawInflate.prototype.readCodeByTable = function(table) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    var inputLength = input.length;
    var codeTable = table[0];
    var maxCodeLength = table[1];
    var codeWithLength;
    var codeLength;
    while(bitsbuflen < maxCodeLength) {
      if(ip >= inputLength) {
        break
      }
      bitsbuf |= input[ip++] << bitsbuflen;
      bitsbuflen += 8
    }
    codeWithLength = codeTable[bitsbuf & (1 << maxCodeLength) - 1];
    codeLength = codeWithLength >>> 16;
    this.bitsbuf = bitsbuf >> codeLength;
    this.bitsbuflen = bitsbuflen - codeLength;
    this.ip = ip;
    return codeWithLength & 65535
  };
  Zlib.RawInflate.prototype.parseUncompressedBlock = function() {
    var input = this.input;
    var ip = this.ip;
    var output = this.output;
    var op = this.op;
    var inputLength = input.length;
    var len;
    var nlen;
    var olength = output.length;
    var preCopy;
    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    if(ip + 1 >= inputLength) {
      throw new Error("invalid uncompressed block header: LEN");
    }
    len = input[ip++] | input[ip++] << 8;
    if(ip + 1 >= inputLength) {
      throw new Error("invalid uncompressed block header: NLEN");
    }
    nlen = input[ip++] | input[ip++] << 8;
    if(len === ~nlen) {
      throw new Error("invalid uncompressed block header: length verify");
    }
    if(ip + len > input.length) {
      throw new Error("input buffer is broken");
    }
    switch(this.bufferType) {
      case Zlib.RawInflate.BufferType.BLOCK:
        while(op + len > output.length) {
          preCopy = olength - op;
          len -= preCopy;
          if(USE_TYPEDARRAY) {
            output.set(input.subarray(ip, ip + preCopy), op);
            op += preCopy;
            ip += preCopy
          }else {
            while(preCopy--) {
              output[op++] = input[ip++]
            }
          }
          this.op = op;
          output = this.expandBuffer();
          op = this.op
        }
        break;
      case Zlib.RawInflate.BufferType.ADAPTIVE:
        while(op + len > output.length) {
          output = this.expandBuffer({fixRatio:2})
        }
        break;
      default:
        throw new Error("invalid inflate mode");
    }
    if(USE_TYPEDARRAY) {
      output.set(input.subarray(ip, ip + len), op);
      op += len;
      ip += len
    }else {
      while(len--) {
        output[op++] = input[ip++]
      }
    }
    this.ip = ip;
    this.op = op;
    this.output = output
  };
  Zlib.RawInflate.prototype.parseFixedHuffmanBlock = function() {
    this.decodeHuffman(Zlib.RawInflate.FixedLiteralLengthTable, Zlib.RawInflate.FixedDistanceTable)
  };
  Zlib.RawInflate.prototype.parseDynamicHuffmanBlock = function() {
    var hlit = this.readBits(5) + 257;
    var hdist = this.readBits(5) + 1;
    var hclen = this.readBits(4) + 4;
    var codeLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.RawInflate.Order.length);
    var codeLengthsTable;
    var litlenLengths;
    var distLengths;
    var i;
    for(i = 0;i < hclen;++i) {
      codeLengths[Zlib.RawInflate.Order[i]] = this.readBits(3)
    }
    if(!USE_TYPEDARRAY) {
      for(i = hclen, hclen = codeLengths.length;i < hclen;++i) {
        codeLengths[Zlib.RawInflate.Order[i]] = 0
      }
    }
    codeLengthsTable = buildHuffmanTable(codeLengths);
    function decode(num, table, lengths) {
      var code;
      var prev = this.prev;
      var repeat;
      var i;
      for(i = 0;i < num;) {
        code = this.readCodeByTable(table);
        switch(code) {
          case 16:
            repeat = 3 + this.readBits(2);
            while(repeat--) {
              lengths[i++] = prev
            }
            break;
          case 17:
            repeat = 3 + this.readBits(3);
            while(repeat--) {
              lengths[i++] = 0
            }
            prev = 0;
            break;
          case 18:
            repeat = 11 + this.readBits(7);
            while(repeat--) {
              lengths[i++] = 0
            }
            prev = 0;
            break;
          default:
            lengths[i++] = code;
            prev = code;
            break
        }
      }
      this.prev = prev;
      return lengths
    }
    litlenLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(hlit);
    distLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(hdist);
    this.prev = 0;
    this.decodeHuffman(buildHuffmanTable(decode.call(this, hlit, codeLengthsTable, litlenLengths)), buildHuffmanTable(decode.call(this, hdist, codeLengthsTable, distLengths)))
  };
  Zlib.RawInflate.prototype.decodeHuffman = function(litlen, dist) {
    var output = this.output;
    var op = this.op;
    this.currentLitlenTable = litlen;
    var olength = output.length - Zlib.RawInflate.MaxCopyLength;
    var code;
    var ti;
    var codeDist;
    var codeLength;
    while((code = this.readCodeByTable(litlen)) !== 256) {
      if(code < 256) {
        if(op >= olength) {
          this.op = op;
          output = this.expandBuffer();
          op = this.op
        }
        output[op++] = code;
        continue
      }
      ti = code - 257;
      codeLength = Zlib.RawInflate.LengthCodeTable[ti];
      if(Zlib.RawInflate.LengthExtraTable[ti] > 0) {
        codeLength += this.readBits(Zlib.RawInflate.LengthExtraTable[ti])
      }
      code = this.readCodeByTable(dist);
      codeDist = Zlib.RawInflate.DistCodeTable[code];
      if(Zlib.RawInflate.DistExtraTable[code] > 0) {
        codeDist += this.readBits(Zlib.RawInflate.DistExtraTable[code])
      }
      if(op >= olength) {
        this.op = op;
        output = this.expandBuffer();
        op = this.op
      }
      while(codeLength--) {
        output[op] = output[op++ - codeDist]
      }
    }
    while(this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--
    }
    this.op = op
  };
  Zlib.RawInflate.prototype.decodeHuffmanAdaptive = function(litlen, dist) {
    var output = this.output;
    var op = this.op;
    this.currentLitlenTable = litlen;
    var olength = output.length;
    var code;
    var ti;
    var codeDist;
    var codeLength;
    while((code = this.readCodeByTable(litlen)) !== 256) {
      if(code < 256) {
        if(op >= olength) {
          output = this.expandBuffer();
          olength = output.length
        }
        output[op++] = code;
        continue
      }
      ti = code - 257;
      codeLength = Zlib.RawInflate.LengthCodeTable[ti];
      if(Zlib.RawInflate.LengthExtraTable[ti] > 0) {
        codeLength += this.readBits(Zlib.RawInflate.LengthExtraTable[ti])
      }
      code = this.readCodeByTable(dist);
      codeDist = Zlib.RawInflate.DistCodeTable[code];
      if(Zlib.RawInflate.DistExtraTable[code] > 0) {
        codeDist += this.readBits(Zlib.RawInflate.DistExtraTable[code])
      }
      if(op + codeLength > olength) {
        output = this.expandBuffer();
        olength = output.length
      }
      while(codeLength--) {
        output[op] = output[op++ - codeDist]
      }
    }
    while(this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--
    }
    this.op = op
  };
  Zlib.RawInflate.prototype.expandBuffer = function(opt_param) {
    var buffer = new (USE_TYPEDARRAY ? Uint8Array : Array)(this.op - Zlib.RawInflate.MaxBackwardLength);
    var backward = this.op - Zlib.RawInflate.MaxBackwardLength;
    var i;
    var il;
    var output = this.output;
    if(USE_TYPEDARRAY) {
      buffer.set(output.subarray(Zlib.RawInflate.MaxBackwardLength, buffer.length))
    }else {
      for(i = 0, il = buffer.length;i < il;++i) {
        buffer[i] = output[i + Zlib.RawInflate.MaxBackwardLength]
      }
    }
    this.blocks.push(buffer);
    this.totalpos += buffer.length;
    if(USE_TYPEDARRAY) {
      output.set(output.subarray(backward, backward + Zlib.RawInflate.MaxBackwardLength))
    }else {
      for(i = 0;i < Zlib.RawInflate.MaxBackwardLength;++i) {
        output[i] = output[backward + i]
      }
    }
    this.op = Zlib.RawInflate.MaxBackwardLength;
    return output
  };
  Zlib.RawInflate.prototype.expandBufferAdaptive = function(opt_param) {
    var buffer;
    var ratio = this.input.length / this.ip + 1 | 0;
    var maxHuffCode;
    var newSize;
    var maxInflateSize;
    var input = this.input;
    var output = this.output;
    if(opt_param) {
      if(typeof opt_param.fixRatio === "number") {
        ratio = opt_param.fixRatio
      }
      if(typeof opt_param.addRatio === "number") {
        ratio += opt_param.addRatio
      }
    }
    if(ratio < 2) {
      maxHuffCode = (input.length - this.ip) / this.currentLitlenTable[2];
      maxInflateSize = maxHuffCode / 2 * 258 | 0;
      newSize = maxInflateSize < output.length ? output.length + maxInflateSize : output.length << 1
    }else {
      newSize = output.length * ratio
    }
    if(USE_TYPEDARRAY) {
      buffer = new Uint8Array(newSize);
      buffer.set(output)
    }else {
      buffer = output
    }
    this.output = buffer;
    return this.output
  };
  Zlib.RawInflate.prototype.concatBuffer = function() {
    var pos = 0;
    var limit = this.totalpos + (this.op - Zlib.RawInflate.MaxBackwardLength);
    var output = this.output;
    var blocks = this.blocks;
    var block;
    var buffer = new (USE_TYPEDARRAY ? Uint8Array : Array)(limit);
    var i;
    var il;
    var j;
    var jl;
    if(blocks.length === 0) {
      return USE_TYPEDARRAY ? this.output.subarray(Zlib.RawInflate.MaxBackwardLength, this.op) : this.output.slice(Zlib.RawInflate.MaxBackwardLength, this.op)
    }
    for(i = 0, il = blocks.length;i < il;++i) {
      block = blocks[i];
      for(j = 0, jl = block.length;j < jl;++j) {
        buffer[pos++] = block[j]
      }
    }
    for(i = Zlib.RawInflate.MaxBackwardLength, il = this.op;i < il;++i) {
      buffer[pos++] = output[i]
    }
    this.blocks = [];
    this.buffer = buffer;
    return this.buffer
  };
  Zlib.RawInflate.prototype.concatBufferDynamic = function() {
    var buffer;
    var op = this.op;
    if(USE_TYPEDARRAY) {
      if(this.resize) {
        buffer = new Uint8Array(op);
        buffer.set(this.output.subarray(0, op))
      }else {
        buffer = this.output.subarray(0, op)
      }
    }else {
      if(this.output.length > op) {
        this.output.length = op
      }
      buffer = this.output
    }
    this.buffer = buffer;
    return this.buffer
  }
});
goog.provide("Zlib.Gunzip");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.CRC32");
goog.require("Zlib.Gzip");
goog.require("Zlib.RawInflate");
goog.require("Zlib.GunzipMember");
goog.scope(function() {
  Zlib.Gunzip = function(input, opt_params) {
    this.input = input;
    this.ip = 0;
    this.member = [];
    this.decompressed = false
  };
  Zlib.Gunzip.prototype.getMembers = function() {
    if(!this.decompressed) {
      this.decompress()
    }
    return this.member.slice()
  };
  Zlib.Gunzip.prototype.decompress = function() {
    var il = this.input.length;
    while(this.ip < il) {
      this.decodeMember()
    }
    this.decompressed = true;
    return this.concatMember()
  };
  Zlib.Gunzip.prototype.decodeMember = function() {
    var member = new Zlib.GunzipMember;
    var isize;
    var rawinflate;
    var inflated;
    var inflen;
    var c;
    var ci;
    var str;
    var mtime;
    var crc32;
    var input = this.input;
    var ip = this.ip;
    member.id1 = input[ip++];
    member.id2 = input[ip++];
    if(member.id1 !== 31 || member.id2 !== 139) {
      throw new Error("invalid file signature:" + member.id1 + "," + member.id2);
    }
    member.cm = input[ip++];
    switch(member.cm) {
      case 8:
        break;
      default:
        throw new Error("unknown compression method: " + member.cm);
    }
    member.flg = input[ip++];
    mtime = input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24;
    member.mtime = new Date(mtime * 1E3);
    member.xfl = input[ip++];
    member.os = input[ip++];
    if((member.flg & Zlib.Gzip.FlagsMask.FEXTRA) > 0) {
      member.xlen = input[ip++] | input[ip++] << 8;
      ip = this.decodeSubField(ip, member.xlen)
    }
    if((member.flg & Zlib.Gzip.FlagsMask.FNAME) > 0) {
      for(str = [], ci = 0;(c = input[ip++]) > 0;) {
        str[ci++] = String.fromCharCode(c)
      }
      member.name = str.join("")
    }
    if((member.flg & Zlib.Gzip.FlagsMask.FCOMMENT) > 0) {
      for(str = [], ci = 0;(c = input[ip++]) > 0;) {
        str[ci++] = String.fromCharCode(c)
      }
      member.comment = str.join("")
    }
    if((member.flg & Zlib.Gzip.FlagsMask.FHCRC) > 0) {
      member.crc16 = Zlib.CRC32.calc(input, 0, ip) & 65535;
      if(member.crc16 !== (input[ip++] | input[ip++] << 8)) {
        throw new Error("invalid header crc16");
      }
    }
    isize = input[input.length - 4] | input[input.length - 3] << 8 | input[input.length - 2] << 16 | input[input.length - 1] << 24;
    if(input.length - ip - 4 - 4 < isize * 512) {
      inflen = isize
    }
    rawinflate = new Zlib.RawInflate(input, {"index":ip, "bufferSize":inflen});
    member.data = inflated = rawinflate.decompress();
    ip = rawinflate.ip;
    member.crc32 = crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    if(Zlib.CRC32.calc(inflated) !== crc32) {
      throw new Error("invalid CRC-32 checksum: 0x" + Zlib.CRC32.calc(inflated).toString(16) + " / 0x" + crc32.toString(16));
    }
    member.isize = isize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    if((inflated.length & 4294967295) !== isize) {
      throw new Error("invalid input size: " + (inflated.length & 4294967295) + " / " + isize);
    }
    this.member.push(member);
    this.ip = ip
  };
  Zlib.Gunzip.prototype.decodeSubField = function(ip, length) {
    return ip + length
  };
  Zlib.Gunzip.prototype.concatMember = function() {
    var member = this.member;
    var i;
    var il;
    var p = 0;
    var size = 0;
    var buffer;
    for(i = 0, il = member.length;i < il;++i) {
      size += member[i].data.length
    }
    if(USE_TYPEDARRAY) {
      buffer = new Uint8Array(size);
      for(i = 0;i < il;++i) {
        buffer.set(member[i].data, p);
        p += member[i].data.length
      }
    }else {
      buffer = [];
      for(i = 0;i < il;++i) {
        buffer[i] = member[i].data
      }
      buffer = Array.prototype.concat.apply([], buffer)
    }
    return buffer
  }
});
goog.provide("Zlib.RawInflateStream");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.Huffman");
var ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE = 32768;
goog.scope(function() {
  var buildHuffmanTable = Zlib.Huffman.buildHuffmanTable;
  Zlib.RawInflateStream = function(input, ip, opt_buffersize) {
    this.buffer;
    this.blocks = [];
    this.bufferSize = opt_buffersize ? opt_buffersize : ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE;
    this.totalpos = 0;
    this.ip = ip === void 0 ? 0 : ip;
    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    this.input = USE_TYPEDARRAY ? new Uint8Array(input) : input;
    this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(this.bufferSize);
    this.op = 0;
    this.bfinal = false;
    this.blockLength;
    this.resize = false;
    this.litlenTable;
    this.distTable;
    this.sp = 0;
    this.status = Zlib.RawInflateStream.Status.INITIALIZED;
    this.prev;
    this.ip_;
    this.bitsbuflen_;
    this.bitsbuf_
  };
  Zlib.RawInflateStream.BlockType = {UNCOMPRESSED:0, FIXED:1, DYNAMIC:2};
  Zlib.RawInflateStream.Status = {INITIALIZED:0, BLOCK_HEADER_START:1, BLOCK_HEADER_END:2, BLOCK_BODY_START:3, BLOCK_BODY_END:4, DECODE_BLOCK_START:5, DECODE_BLOCK_END:6};
  Zlib.RawInflateStream.prototype.decompress = function(newInput, ip) {
    var stop = false;
    if(newInput !== void 0) {
      this.input = newInput
    }
    if(ip !== void 0) {
      this.ip = ip
    }
    while(!stop) {
      switch(this.status) {
        case Zlib.RawInflateStream.Status.INITIALIZED:
        ;
        case Zlib.RawInflateStream.Status.BLOCK_HEADER_START:
          if(this.readBlockHeader() < 0) {
            stop = true
          }
          break;
        case Zlib.RawInflateStream.Status.BLOCK_HEADER_END:
        ;
        case Zlib.RawInflateStream.Status.BLOCK_BODY_START:
          switch(this.currentBlockType) {
            case Zlib.RawInflateStream.BlockType.UNCOMPRESSED:
              if(this.readUncompressedBlockHeader() < 0) {
                stop = true
              }
              break;
            case Zlib.RawInflateStream.BlockType.FIXED:
              if(this.parseFixedHuffmanBlock() < 0) {
                stop = true
              }
              break;
            case Zlib.RawInflateStream.BlockType.DYNAMIC:
              if(this.parseDynamicHuffmanBlock() < 0) {
                stop = true
              }
              break
          }
          break;
        case Zlib.RawInflateStream.Status.BLOCK_BODY_END:
        ;
        case Zlib.RawInflateStream.Status.DECODE_BLOCK_START:
          switch(this.currentBlockType) {
            case Zlib.RawInflateStream.BlockType.UNCOMPRESSED:
              if(this.parseUncompressedBlock() < 0) {
                stop = true
              }
              break;
            case Zlib.RawInflateStream.BlockType.FIXED:
            ;
            case Zlib.RawInflateStream.BlockType.DYNAMIC:
              if(this.decodeHuffman() < 0) {
                stop = true
              }
              break
          }
          break;
        case Zlib.RawInflateStream.Status.DECODE_BLOCK_END:
          if(this.bfinal) {
            stop = true
          }else {
            this.status = Zlib.RawInflateStream.Status.INITIALIZED
          }
          break
      }
    }
    return this.concatBuffer()
  };
  Zlib.RawInflateStream.MaxBackwardLength = 32768;
  Zlib.RawInflateStream.MaxCopyLength = 258;
  Zlib.RawInflateStream.Order = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  Zlib.RawInflateStream.LengthCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258]);
  Zlib.RawInflateStream.LengthExtraTable = function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table
  }([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0]);
  Zlib.RawInflateStream.DistCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577]);
  Zlib.RawInflateStream.DistExtraTable = function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table
  }([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
  Zlib.RawInflateStream.FixedLiteralLengthTable = function(table) {
    return table
  }(function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(288);
    var i, il;
    for(i = 0, il = lengths.length;i < il;++i) {
      lengths[i] = i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8
    }
    return buildHuffmanTable(lengths)
  }());
  Zlib.RawInflateStream.FixedDistanceTable = function(table) {
    return table
  }(function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(30);
    var i, il;
    for(i = 0, il = lengths.length;i < il;++i) {
      lengths[i] = 5
    }
    return buildHuffmanTable(lengths)
  }());
  Zlib.RawInflateStream.prototype.readBlockHeader = function() {
    var hdr;
    this.status = Zlib.RawInflateStream.Status.BLOCK_HEADER_START;
    this.save_();
    if((hdr = this.readBits(3)) < 0) {
      this.restore_();
      return-1
    }
    if(hdr & 1) {
      this.bfinal = true
    }
    hdr >>>= 1;
    switch(hdr) {
      case 0:
        this.currentBlockType = Zlib.RawInflateStream.BlockType.UNCOMPRESSED;
        break;
      case 1:
        this.currentBlockType = Zlib.RawInflateStream.BlockType.FIXED;
        break;
      case 2:
        this.currentBlockType = Zlib.RawInflateStream.BlockType.DYNAMIC;
        break;
      default:
        throw new Error("unknown BTYPE: " + hdr);
    }
    this.status = Zlib.RawInflateStream.Status.BLOCK_HEADER_END
  };
  Zlib.RawInflateStream.prototype.readBits = function(length) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    var octet;
    while(bitsbuflen < length) {
      if(input.length <= ip) {
        return-1
      }
      octet = input[ip++];
      bitsbuf |= octet << bitsbuflen;
      bitsbuflen += 8
    }
    octet = bitsbuf & (1 << length) - 1;
    bitsbuf >>>= length;
    bitsbuflen -= length;
    this.bitsbuf = bitsbuf;
    this.bitsbuflen = bitsbuflen;
    this.ip = ip;
    return octet
  };
  Zlib.RawInflateStream.prototype.readCodeByTable = function(table) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    var codeTable = table[0];
    var maxCodeLength = table[1];
    var octet;
    var codeWithLength;
    var codeLength;
    while(bitsbuflen < maxCodeLength) {
      if(input.length <= ip) {
        return-1
      }
      octet = input[ip++];
      bitsbuf |= octet << bitsbuflen;
      bitsbuflen += 8
    }
    codeWithLength = codeTable[bitsbuf & (1 << maxCodeLength) - 1];
    codeLength = codeWithLength >>> 16;
    this.bitsbuf = bitsbuf >> codeLength;
    this.bitsbuflen = bitsbuflen - codeLength;
    this.ip = ip;
    return codeWithLength & 65535
  };
  Zlib.RawInflateStream.prototype.readUncompressedBlockHeader = function() {
    var len;
    var nlen;
    var input = this.input;
    var ip = this.ip;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
    if(ip + 4 >= input.length) {
      return-1
    }
    len = input[ip++] | input[ip++] << 8;
    nlen = input[ip++] | input[ip++] << 8;
    if(len === ~nlen) {
      throw new Error("invalid uncompressed block header: length verify");
    }
    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    this.ip = ip;
    this.blockLength = len;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END
  };
  Zlib.RawInflateStream.prototype.parseUncompressedBlock = function() {
    var input = this.input;
    var ip = this.ip;
    var output = this.output;
    var op = this.op;
    var len = this.blockLength;
    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_START;
    while(len--) {
      if(op === output.length) {
        output = this.expandBuffer({fixRatio:2})
      }
      if(ip >= input.length) {
        this.ip = ip;
        this.op = op;
        this.blockLength = len + 1;
        return-1
      }
      output[op++] = input[ip++]
    }
    if(len < 0) {
      this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_END
    }
    this.ip = ip;
    this.op = op;
    return 0
  };
  Zlib.RawInflateStream.prototype.parseFixedHuffmanBlock = function() {
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
    this.litlenTable = Zlib.RawInflateStream.FixedLiteralLengthTable;
    this.distTable = Zlib.RawInflateStream.FixedDistanceTable;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END;
    return 0
  };
  Zlib.RawInflateStream.prototype.save_ = function() {
    this.ip_ = this.ip;
    this.bitsbuflen_ = this.bitsbuflen;
    this.bitsbuf_ = this.bitsbuf
  };
  Zlib.RawInflateStream.prototype.restore_ = function() {
    this.ip = this.ip_;
    this.bitsbuflen = this.bitsbuflen_;
    this.bitsbuf = this.bitsbuf_
  };
  Zlib.RawInflateStream.prototype.parseDynamicHuffmanBlock = function() {
    var hlit;
    var hdist;
    var hclen;
    var codeLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.RawInflateStream.Order.length);
    var codeLengthsTable;
    var litlenLengths;
    var distLengths;
    var i = 0;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
    this.save_();
    hlit = this.readBits(5) + 257;
    hdist = this.readBits(5) + 1;
    hclen = this.readBits(4) + 4;
    if(hlit < 0 || hdist < 0 || hclen < 0) {
      this.restore_();
      return-1
    }
    try {
      parseDynamicHuffmanBlockImpl.call(this)
    }catch(e) {
      this.restore_();
      return-1
    }
    function parseDynamicHuffmanBlockImpl() {
      var bits;
      for(i = 0;i < hclen;++i) {
        if((bits = this.readBits(3)) < 0) {
          throw new Error("not enough input");
        }
        codeLengths[Zlib.RawInflateStream.Order[i]] = bits
      }
      codeLengthsTable = buildHuffmanTable(codeLengths);
      function decode(num, table, lengths) {
        var code;
        var prev = this.prev;
        var repeat;
        var i;
        var bits;
        for(i = 0;i < num;) {
          code = this.readCodeByTable(table);
          if(code < 0) {
            throw new Error("not enough input");
          }
          switch(code) {
            case 16:
              if((bits = this.readBits(2)) < 0) {
                throw new Error("not enough input");
              }
              repeat = 3 + bits;
              while(repeat--) {
                lengths[i++] = prev
              }
              break;
            case 17:
              if((bits = this.readBits(3)) < 0) {
                throw new Error("not enough input");
              }
              repeat = 3 + bits;
              while(repeat--) {
                lengths[i++] = 0
              }
              prev = 0;
              break;
            case 18:
              if((bits = this.readBits(7)) < 0) {
                throw new Error("not enough input");
              }
              repeat = 11 + bits;
              while(repeat--) {
                lengths[i++] = 0
              }
              prev = 0;
              break;
            default:
              lengths[i++] = code;
              prev = code;
              break
          }
        }
        this.prev = prev;
        return lengths
      }
      litlenLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(hlit);
      distLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(hdist);
      this.prev = 0;
      this.litlenTable = buildHuffmanTable(decode.call(this, hlit, codeLengthsTable, litlenLengths));
      this.distTable = buildHuffmanTable(decode.call(this, hdist, codeLengthsTable, distLengths))
    }
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END;
    return 0
  };
  Zlib.RawInflateStream.prototype.decodeHuffman = function() {
    var output = this.output;
    var op = this.op;
    var code;
    var ti;
    var codeDist;
    var codeLength;
    var litlen = this.litlenTable;
    var dist = this.distTable;
    var olength = output.length;
    var bits;
    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_START;
    while(true) {
      this.save_();
      code = this.readCodeByTable(litlen);
      if(code < 0) {
        this.op = op;
        this.restore_();
        return-1
      }
      if(code === 256) {
        break
      }
      if(code < 256) {
        if(op === olength) {
          output = this.expandBuffer();
          olength = output.length
        }
        output[op++] = code;
        continue
      }
      ti = code - 257;
      codeLength = Zlib.RawInflateStream.LengthCodeTable[ti];
      if(Zlib.RawInflateStream.LengthExtraTable[ti] > 0) {
        bits = this.readBits(Zlib.RawInflateStream.LengthExtraTable[ti]);
        if(bits < 0) {
          this.op = op;
          this.restore_();
          return-1
        }
        codeLength += bits
      }
      code = this.readCodeByTable(dist);
      if(code < 0) {
        this.op = op;
        this.restore_();
        return-1
      }
      codeDist = Zlib.RawInflateStream.DistCodeTable[code];
      if(Zlib.RawInflateStream.DistExtraTable[code] > 0) {
        bits = this.readBits(Zlib.RawInflateStream.DistExtraTable[code]);
        if(bits < 0) {
          this.op = op;
          this.restore_();
          return-1
        }
        codeDist += bits
      }
      if(op + codeLength >= olength) {
        output = this.expandBuffer();
        olength = output.length
      }
      while(codeLength--) {
        output[op] = output[op++ - codeDist]
      }
      if(this.ip === this.input.length) {
        this.op = op;
        return-1
      }
    }
    while(this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--
    }
    this.op = op;
    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_END
  };
  Zlib.RawInflateStream.prototype.expandBuffer = function(opt_param) {
    var buffer;
    var ratio = this.input.length / this.ip + 1 | 0;
    var maxHuffCode;
    var newSize;
    var maxInflateSize;
    var input = this.input;
    var output = this.output;
    if(opt_param) {
      if(typeof opt_param.fixRatio === "number") {
        ratio = opt_param.fixRatio
      }
      if(typeof opt_param.addRatio === "number") {
        ratio += opt_param.addRatio
      }
    }
    if(ratio < 2) {
      maxHuffCode = (input.length - this.ip) / this.litlenTable[2];
      maxInflateSize = maxHuffCode / 2 * 258 | 0;
      newSize = maxInflateSize < output.length ? output.length + maxInflateSize : output.length << 1
    }else {
      newSize = output.length * ratio
    }
    if(USE_TYPEDARRAY) {
      buffer = new Uint8Array(newSize);
      buffer.set(output)
    }else {
      buffer = output
    }
    this.output = buffer;
    return this.output
  };
  Zlib.RawInflateStream.prototype.concatBuffer = function() {
    var buffer;
    var resize = this.resize;
    var op = this.op;
    if(resize) {
      if(USE_TYPEDARRAY) {
        buffer = new Uint8Array(op);
        buffer.set(this.output.subarray(this.sp, op))
      }else {
        buffer = this.output.slice(this.sp, op)
      }
    }else {
      buffer = USE_TYPEDARRAY ? this.output.subarray(this.sp, op) : this.output.slice(this.sp, op)
    }
    this.buffer = buffer;
    this.sp = op;
    return this.buffer
  };
  Zlib.RawInflateStream.prototype.getBytes = function() {
    return USE_TYPEDARRAY ? this.output.subarray(0, this.op) : this.output.slice(0, this.op)
  }
});
goog.provide("Zlib.Util");
goog.scope(function() {
  Zlib.Util.stringToByteArray = function(str) {
    var tmp = str.split("");
    var i;
    var il;
    for(i = 0, il = tmp.length;i < il;i++) {
      tmp[i] = (tmp[i].charCodeAt(0) & 255) >>> 0
    }
    return tmp
  }
});
goog.provide("Zlib.Adler32");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.Util");
goog.scope(function() {
  Zlib.Adler32 = function(array) {
    if(typeof array === "string") {
      array = Zlib.Util.stringToByteArray(array)
    }
    return Zlib.Adler32.update(1, array)
  };
  Zlib.Adler32.update = function(adler, array) {
    var s1 = adler & 65535;
    var s2 = adler >>> 16 & 65535;
    var len = array.length;
    var tlen;
    var i = 0;
    while(len > 0) {
      tlen = len > Zlib.Adler32.OptimizationParameter ? Zlib.Adler32.OptimizationParameter : len;
      len -= tlen;
      do {
        s1 += array[i++];
        s2 += s1
      }while(--tlen);
      s1 %= 65521;
      s2 %= 65521
    }
    return(s2 << 16 | s1) >>> 0
  };
  Zlib.Adler32.OptimizationParameter = 1024
});
goog.provide("Zlib.Inflate");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.Adler32");
goog.require("Zlib.RawInflate");
goog.scope(function() {
  Zlib.Inflate = function(input, opt_params) {
    var bufferSize;
    var bufferType;
    var cmf;
    var flg;
    this.input = input;
    this.ip = 0;
    this.rawinflate;
    this.verify;
    if(opt_params || !(opt_params = {})) {
      if(opt_params["index"]) {
        this.ip = opt_params["index"]
      }
      if(opt_params["verify"]) {
        this.verify = opt_params["verify"]
      }
    }
    cmf = input[this.ip++];
    flg = input[this.ip++];
    switch(cmf & 15) {
      case Zlib.CompressionMethod.DEFLATE:
        this.method = Zlib.CompressionMethod.DEFLATE;
        break;
      default:
        throw new Error("unsupported compression method");
    }
    if(((cmf << 8) + flg) % 31 !== 0) {
      throw new Error("invalid fcheck flag:" + ((cmf << 8) + flg) % 31);
    }
    if(flg & 32) {
      throw new Error("fdict flag is not supported");
    }
    this.rawinflate = new Zlib.RawInflate(input, {"index":this.ip, "bufferSize":opt_params["bufferSize"], "bufferType":opt_params["bufferType"], "resize":opt_params["resize"]})
  };
  Zlib.Inflate.BufferType = Zlib.RawInflate.BufferType;
  Zlib.Inflate.prototype.decompress = function() {
    var input = this.input;
    var buffer;
    var adler32;
    buffer = this.rawinflate.decompress();
    this.ip = this.rawinflate.ip;
    if(this.verify) {
      adler32 = (input[this.ip++] << 24 | input[this.ip++] << 16 | input[this.ip++] << 8 | input[this.ip++]) >>> 0;
      if(adler32 !== Zlib.Adler32(buffer)) {
        throw new Error("invalid adler-32 checksum");
      }
    }
    return buffer
  }
});
goog.provide("Zlib.Zip");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.RawDeflate");
goog.require("Zlib.CRC32");
goog.scope(function() {
  Zlib.Zip = function(opt_params) {
    opt_params = opt_params || {};
    this.files = [];
    this.comment = opt_params["comment"];
    this.password
  };
  Zlib.Zip.CompressionMethod = {STORE:0, DEFLATE:8};
  Zlib.Zip.OperatingSystem = {MSDOS:0, UNIX:3, MACINTOSH:7};
  Zlib.Zip.Flags = {ENCRYPT:1, DESCRIPTOR:8, UTF8:2048};
  Zlib.Zip.FileHeaderSignature = [80, 75, 1, 2];
  Zlib.Zip.LocalFileHeaderSignature = [80, 75, 3, 4];
  Zlib.Zip.CentralDirectorySignature = [80, 75, 5, 6];
  Zlib.Zip.prototype.addFile = function(input, opt_params) {
    opt_params = opt_params || {};
    var filename = "" || opt_params["filename"];
    var compressed;
    var size = input.length;
    var crc32 = 0;
    if(USE_TYPEDARRAY && input instanceof Array) {
      input = new Uint8Array(input)
    }
    if(typeof opt_params["compressionMethod"] !== "number") {
      opt_params["compressionMethod"] = Zlib.Zip.CompressionMethod.DEFLATE
    }
    if(opt_params["compress"]) {
      switch(opt_params["compressionMethod"]) {
        case Zlib.Zip.CompressionMethod.STORE:
          break;
        case Zlib.Zip.CompressionMethod.DEFLATE:
          crc32 = Zlib.CRC32.calc(input);
          input = this.deflateWithOption(input, opt_params);
          compressed = true;
          break;
        default:
          throw new Error("unknown compression method:" + opt_params["compressionMethod"]);
      }
    }
    this.files.push({buffer:input, option:opt_params, compressed:compressed, encrypted:false, size:size, crc32:crc32})
  };
  Zlib.Zip.prototype.setPassword = function(password) {
    this.password = password
  };
  Zlib.Zip.prototype.compress = function() {
    var files = this.files;
    var file;
    var output;
    var op1;
    var op2;
    var op3;
    var localFileSize = 0;
    var centralDirectorySize = 0;
    var endOfCentralDirectorySize;
    var offset;
    var needVersion;
    var flags;
    var compressionMethod;
    var date;
    var crc32;
    var size;
    var plainSize;
    var filenameLength;
    var extraFieldLength;
    var commentLength;
    var filename;
    var extraField;
    var comment;
    var buffer;
    var tmp;
    var key;
    var i;
    var il;
    var j;
    var jl;
    for(i = 0, il = files.length;i < il;++i) {
      file = files[i];
      filenameLength = file.option["filename"] ? file.option["filename"].length : 0;
      extraFieldLength = file.option["extraField"] ? file.option["extraField"].length : 0;
      commentLength = file.option["comment"] ? file.option["comment"].length : 0;
      if(!file.compressed) {
        file.crc32 = Zlib.CRC32.calc(file.buffer);
        switch(file.option["compressionMethod"]) {
          case Zlib.Zip.CompressionMethod.STORE:
            break;
          case Zlib.Zip.CompressionMethod.DEFLATE:
            file.buffer = this.deflateWithOption(file.buffer, file.option);
            file.compressed = true;
            break;
          default:
            throw new Error("unknown compression method:" + file.option["compressionMethod"]);
        }
      }
      if(file.option["password"] !== void 0 || this.password !== void 0) {
        key = this.createEncryptionKey(file.option["password"] || this.password);
        buffer = file.buffer;
        if(USE_TYPEDARRAY) {
          tmp = new Uint8Array(buffer.length + 12);
          tmp.set(buffer, 12);
          buffer = tmp
        }else {
          buffer.unshift(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
        }
        for(j = 0;j < 12;++j) {
          buffer[j] = this.encode(key, i === 11 ? file.crc32 & 255 : Math.random() * 256 | 0)
        }
        for(jl = buffer.length;j < jl;++j) {
          buffer[j] = this.encode(key, buffer[j])
        }
        file.buffer = buffer
      }
      localFileSize += 30 + filenameLength + file.buffer.length;
      centralDirectorySize += 46 + filenameLength + commentLength
    }
    endOfCentralDirectorySize = 46 + (this.comment ? this.comment.length : 0);
    output = new (USE_TYPEDARRAY ? Uint8Array : Array)(localFileSize + centralDirectorySize + endOfCentralDirectorySize);
    op1 = 0;
    op2 = localFileSize;
    op3 = op2 + centralDirectorySize;
    for(i = 0, il = files.length;i < il;++i) {
      file = files[i];
      filenameLength = file.option["filename"] ? file.option["filename"].length : 0;
      extraFieldLength = 0;
      commentLength = file.option["comment"] ? file.option["comment"].length : 0;
      offset = op1;
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[0];
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[1];
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[2];
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[3];
      output[op2++] = Zlib.Zip.FileHeaderSignature[0];
      output[op2++] = Zlib.Zip.FileHeaderSignature[1];
      output[op2++] = Zlib.Zip.FileHeaderSignature[2];
      output[op2++] = Zlib.Zip.FileHeaderSignature[3];
      needVersion = 20;
      output[op2++] = needVersion & 255;
      output[op2++] = (file.option["os"]) || Zlib.Zip.OperatingSystem.MSDOS;
      output[op1++] = output[op2++] = needVersion & 255;
      output[op1++] = output[op2++] = needVersion >> 8 & 255;
      flags = 0;
      if(file.option["password"] || this.password) {
        flags |= Zlib.Zip.Flags.ENCRYPT
      }
      output[op1++] = output[op2++] = flags & 255;
      output[op1++] = output[op2++] = flags >> 8 & 255;
      compressionMethod = (file.option["compressionMethod"]);
      output[op1++] = output[op2++] = compressionMethod & 255;
      output[op1++] = output[op2++] = compressionMethod >> 8 & 255;
      date = (file.option["date"]) || new Date;
      output[op1++] = output[op2++] = (date.getMinutes() & 7) << 5 | date.getSeconds() / 2 | 0;
      output[op1++] = output[op2++] = date.getHours() << 3 | date.getMinutes() >> 3;
      output[op1++] = output[op2++] = (date.getMonth() + 1 & 7) << 5 | date.getDate();
      output[op1++] = output[op2++] = (date.getFullYear() - 1980 & 127) << 1 | date.getMonth() + 1 >> 3;
      crc32 = file.crc32;
      output[op1++] = output[op2++] = crc32 & 255;
      output[op1++] = output[op2++] = crc32 >> 8 & 255;
      output[op1++] = output[op2++] = crc32 >> 16 & 255;
      output[op1++] = output[op2++] = crc32 >> 24 & 255;
      size = file.buffer.length;
      output[op1++] = output[op2++] = size & 255;
      output[op1++] = output[op2++] = size >> 8 & 255;
      output[op1++] = output[op2++] = size >> 16 & 255;
      output[op1++] = output[op2++] = size >> 24 & 255;
      plainSize = file.size;
      output[op1++] = output[op2++] = plainSize & 255;
      output[op1++] = output[op2++] = plainSize >> 8 & 255;
      output[op1++] = output[op2++] = plainSize >> 16 & 255;
      output[op1++] = output[op2++] = plainSize >> 24 & 255;
      output[op1++] = output[op2++] = filenameLength & 255;
      output[op1++] = output[op2++] = filenameLength >> 8 & 255;
      output[op1++] = output[op2++] = extraFieldLength & 255;
      output[op1++] = output[op2++] = extraFieldLength >> 8 & 255;
      output[op2++] = commentLength & 255;
      output[op2++] = commentLength >> 8 & 255;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = offset & 255;
      output[op2++] = offset >> 8 & 255;
      output[op2++] = offset >> 16 & 255;
      output[op2++] = offset >> 24 & 255;
      filename = file.option["filename"];
      if(filename) {
        if(USE_TYPEDARRAY) {
          output.set(filename, op1);
          output.set(filename, op2);
          op1 += filenameLength;
          op2 += filenameLength
        }else {
          for(j = 0;j < filenameLength;++j) {
            output[op1++] = output[op2++] = filename[j]
          }
        }
      }
      extraField = file.option["extraField"];
      if(extraField) {
        if(USE_TYPEDARRAY) {
          output.set(extraField, op1);
          output.set(extraField, op2);
          op1 += extraFieldLength;
          op2 += extraFieldLength
        }else {
          for(j = 0;j < commentLength;++j) {
            output[op1++] = output[op2++] = extraField[j]
          }
        }
      }
      comment = file.option["comment"];
      if(comment) {
        if(USE_TYPEDARRAY) {
          output.set(comment, op2);
          op2 += commentLength
        }else {
          for(j = 0;j < commentLength;++j) {
            output[op2++] = comment[j]
          }
        }
      }
      if(USE_TYPEDARRAY) {
        output.set(file.buffer, op1);
        op1 += file.buffer.length
      }else {
        for(j = 0, jl = file.buffer.length;j < jl;++j) {
          output[op1++] = file.buffer[j]
        }
      }
    }
    output[op3++] = Zlib.Zip.CentralDirectorySignature[0];
    output[op3++] = Zlib.Zip.CentralDirectorySignature[1];
    output[op3++] = Zlib.Zip.CentralDirectorySignature[2];
    output[op3++] = Zlib.Zip.CentralDirectorySignature[3];
    output[op3++] = 0;
    output[op3++] = 0;
    output[op3++] = 0;
    output[op3++] = 0;
    output[op3++] = il & 255;
    output[op3++] = il >> 8 & 255;
    output[op3++] = il & 255;
    output[op3++] = il >> 8 & 255;
    output[op3++] = centralDirectorySize & 255;
    output[op3++] = centralDirectorySize >> 8 & 255;
    output[op3++] = centralDirectorySize >> 16 & 255;
    output[op3++] = centralDirectorySize >> 24 & 255;
    output[op3++] = localFileSize & 255;
    output[op3++] = localFileSize >> 8 & 255;
    output[op3++] = localFileSize >> 16 & 255;
    output[op3++] = localFileSize >> 24 & 255;
    commentLength = this.comment ? this.comment.length : 0;
    output[op3++] = commentLength & 255;
    output[op3++] = commentLength >> 8 & 255;
    if(this.comment) {
      if(USE_TYPEDARRAY) {
        output.set(this.comment, op3);
        op3 += commentLength
      }else {
        for(j = 0, jl = commentLength;j < jl;++j) {
          output[op3++] = this.comment[j]
        }
      }
    }
    return output
  };
  Zlib.Zip.prototype.deflateWithOption = function(input, opt_params) {
    var deflator = new Zlib.RawDeflate(input, opt_params["deflateOption"]);
    return deflator.compress()
  };
  Zlib.Zip.prototype.getByte = function(key) {
    var tmp = key[2] & 65535 | 2;
    return tmp * (tmp ^ 1) >> 8 & 255
  };
  Zlib.Zip.prototype.encode = function(key, n) {
    var tmp = this.getByte((key));
    this.updateKeys((key), n);
    return tmp ^ n
  };
  Zlib.Zip.prototype.updateKeys = function(key, n) {
    key[0] = Zlib.CRC32.single(key[0], n);
    key[1] = (((key[1] + (key[0] & 255)) * 20173 >>> 0) * 6681 >>> 0) + 1 >>> 0;
    key[2] = Zlib.CRC32.single(key[2], key[1] >>> 24)
  };
  Zlib.Zip.prototype.createEncryptionKey = function(password) {
    var key = [305419896, 591751049, 878082192];
    var i;
    var il;
    if(USE_TYPEDARRAY) {
      key = new Uint32Array(key)
    }
    for(i = 0, il = password.length;i < il;++i) {
      this.updateKeys(key, password[i] & 255)
    }
    return key
  }
});
goog.provide("Zlib.Unzip");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.RawInflate");
goog.require("Zlib.CRC32");
goog.require("Zlib.Zip");
goog.scope(function() {
  Zlib.Unzip = function(input, opt_params) {
    opt_params = opt_params || {};
    this.input = USE_TYPEDARRAY && input instanceof Array ? new Uint8Array(input) : input;
    this.ip = 0;
    this.eocdrOffset;
    this.numberOfThisDisk;
    this.startDisk;
    this.totalEntriesThisDisk;
    this.totalEntries;
    this.centralDirectorySize;
    this.centralDirectoryOffset;
    this.commentLength;
    this.comment;
    this.fileHeaderList;
    this.filenameToIndex;
    this.verify = opt_params["verify"] || false;
    this.password = opt_params["password"]
  };
  Zlib.Unzip.CompressionMethod = Zlib.Zip.CompressionMethod;
  Zlib.Unzip.FileHeaderSignature = Zlib.Zip.FileHeaderSignature;
  Zlib.Unzip.LocalFileHeaderSignature = Zlib.Zip.LocalFileHeaderSignature;
  Zlib.Unzip.CentralDirectorySignature = Zlib.Zip.CentralDirectorySignature;
  Zlib.Unzip.FileHeader = function(input, ip) {
    this.input = input;
    this.offset = ip;
    this.length;
    this.version;
    this.os;
    this.needVersion;
    this.flags;
    this.compression;
    this.time;
    this.date;
    this.crc32;
    this.compressedSize;
    this.plainSize;
    this.fileNameLength;
    this.extraFieldLength;
    this.fileCommentLength;
    this.diskNumberStart;
    this.internalFileAttributes;
    this.externalFileAttributes;
    this.relativeOffset;
    this.filename;
    this.extraField;
    this.comment
  };
  Zlib.Unzip.FileHeader.prototype.parse = function() {
    var input = this.input;
    var ip = this.offset;
    if(input[ip++] !== Zlib.Unzip.FileHeaderSignature[0] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[1] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[2] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[3]) {
      throw new Error("invalid file header signature");
    }
    this.version = input[ip++];
    this.os = input[ip++];
    this.needVersion = input[ip++] | input[ip++] << 8;
    this.flags = input[ip++] | input[ip++] << 8;
    this.compression = input[ip++] | input[ip++] << 8;
    this.time = input[ip++] | input[ip++] << 8;
    this.date = input[ip++] | input[ip++] << 8;
    this.crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.compressedSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.plainSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.fileNameLength = input[ip++] | input[ip++] << 8;
    this.extraFieldLength = input[ip++] | input[ip++] << 8;
    this.fileCommentLength = input[ip++] | input[ip++] << 8;
    this.diskNumberStart = input[ip++] | input[ip++] << 8;
    this.internalFileAttributes = input[ip++] | input[ip++] << 8;
    this.externalFileAttributes = input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24;
    this.relativeOffset = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.filename = String.fromCharCode.apply(null, USE_TYPEDARRAY ? input.subarray(ip, ip += this.fileNameLength) : input.slice(ip, ip += this.fileNameLength));
    this.extraField = USE_TYPEDARRAY ? input.subarray(ip, ip += this.extraFieldLength) : input.slice(ip, ip += this.extraFieldLength);
    this.comment = USE_TYPEDARRAY ? input.subarray(ip, ip + this.fileCommentLength) : input.slice(ip, ip + this.fileCommentLength);
    this.length = ip - this.offset
  };
  Zlib.Unzip.LocalFileHeader = function(input, ip) {
    this.input = input;
    this.offset = ip;
    this.length;
    this.needVersion;
    this.flags;
    this.compression;
    this.time;
    this.date;
    this.crc32;
    this.compressedSize;
    this.plainSize;
    this.fileNameLength;
    this.extraFieldLength;
    this.filename;
    this.extraField
  };
  Zlib.Unzip.LocalFileHeader.Flags = Zlib.Zip.Flags;
  Zlib.Unzip.LocalFileHeader.prototype.parse = function() {
    var input = this.input;
    var ip = this.offset;
    if(input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[0] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[1] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[2] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[3]) {
      throw new Error("invalid local file header signature");
    }
    this.needVersion = input[ip++] | input[ip++] << 8;
    this.flags = input[ip++] | input[ip++] << 8;
    this.compression = input[ip++] | input[ip++] << 8;
    this.time = input[ip++] | input[ip++] << 8;
    this.date = input[ip++] | input[ip++] << 8;
    this.crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.compressedSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.plainSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.fileNameLength = input[ip++] | input[ip++] << 8;
    this.extraFieldLength = input[ip++] | input[ip++] << 8;
    this.filename = String.fromCharCode.apply(null, USE_TYPEDARRAY ? input.subarray(ip, ip += this.fileNameLength) : input.slice(ip, ip += this.fileNameLength));
    this.extraField = USE_TYPEDARRAY ? input.subarray(ip, ip += this.extraFieldLength) : input.slice(ip, ip += this.extraFieldLength);
    this.length = ip - this.offset
  };
  Zlib.Unzip.prototype.searchEndOfCentralDirectoryRecord = function() {
    var input = this.input;
    var ip;
    for(ip = input.length - 12;ip > 0;--ip) {
      if(input[ip] === Zlib.Unzip.CentralDirectorySignature[0] && input[ip + 1] === Zlib.Unzip.CentralDirectorySignature[1] && input[ip + 2] === Zlib.Unzip.CentralDirectorySignature[2] && input[ip + 3] === Zlib.Unzip.CentralDirectorySignature[3]) {
        this.eocdrOffset = ip;
        return
      }
    }
    throw new Error("End of Central Directory Record not found");
  };
  Zlib.Unzip.prototype.parseEndOfCentralDirectoryRecord = function() {
    var input = this.input;
    var ip;
    if(!this.eocdrOffset) {
      this.searchEndOfCentralDirectoryRecord()
    }
    ip = this.eocdrOffset;
    if(input[ip++] !== Zlib.Unzip.CentralDirectorySignature[0] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[1] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[2] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[3]) {
      throw new Error("invalid signature");
    }
    this.numberOfThisDisk = input[ip++] | input[ip++] << 8;
    this.startDisk = input[ip++] | input[ip++] << 8;
    this.totalEntriesThisDisk = input[ip++] | input[ip++] << 8;
    this.totalEntries = input[ip++] | input[ip++] << 8;
    this.centralDirectorySize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.centralDirectoryOffset = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.commentLength = input[ip++] | input[ip++] << 8;
    this.comment = USE_TYPEDARRAY ? input.subarray(ip, ip + this.commentLength) : input.slice(ip, ip + this.commentLength)
  };
  Zlib.Unzip.prototype.parseFileHeader = function() {
    var filelist = [];
    var filetable = {};
    var ip;
    var fileHeader;
    var i;
    var il;
    if(this.fileHeaderList) {
      return
    }
    if(this.centralDirectoryOffset === void 0) {
      this.parseEndOfCentralDirectoryRecord()
    }
    ip = this.centralDirectoryOffset;
    for(i = 0, il = this.totalEntries;i < il;++i) {
      fileHeader = new Zlib.Unzip.FileHeader(this.input, ip);
      fileHeader.parse();
      ip += fileHeader.length;
      filelist[i] = fileHeader;
      filetable[fileHeader.filename] = i
    }
    if(this.centralDirectorySize < ip - this.centralDirectoryOffset) {
      throw new Error("invalid file header size");
    }
    this.fileHeaderList = filelist;
    this.filenameToIndex = filetable
  };
  Zlib.Unzip.prototype.getFileData = function(index, opt_params) {
    opt_params = opt_params || {};
    var input = this.input;
    var fileHeaderList = this.fileHeaderList;
    var localFileHeader;
    var offset;
    var length;
    var buffer;
    var crc32;
    var key;
    var i;
    var il;
    if(!fileHeaderList) {
      this.parseFileHeader()
    }
    if(fileHeaderList[index] === void 0) {
      throw new Error("wrong index");
    }
    offset = fileHeaderList[index].relativeOffset;
    localFileHeader = new Zlib.Unzip.LocalFileHeader(this.input, offset);
    localFileHeader.parse();
    offset += localFileHeader.length;
    length = localFileHeader.compressedSize;
    if((localFileHeader.flags & Zlib.Unzip.LocalFileHeader.Flags.ENCRYPT) !== 0) {
      if(!(opt_params["password"] || this.password)) {
        throw new Error("please set password");
      }
      key = this.createDecryptionKey(opt_params["password"] || this.password);
      for(i = offset, il = offset + 12;i < il;++i) {
        this.decode(key, input[i])
      }
      offset += 12;
      length -= 12;
      for(i = offset, il = offset + length;i < il;++i) {
        input[i] = this.decode(key, input[i])
      }
    }
    switch(localFileHeader.compression) {
      case Zlib.Unzip.CompressionMethod.STORE:
        buffer = USE_TYPEDARRAY ? this.input.subarray(offset, offset + length) : this.input.slice(offset, offset + length);
        break;
      case Zlib.Unzip.CompressionMethod.DEFLATE:
        buffer = (new Zlib.RawInflate(this.input, {"index":offset, "bufferSize":localFileHeader.plainSize})).decompress();
        break;
      default:
        throw new Error("unknown compression type");
    }
    if(this.verify) {
      crc32 = Zlib.CRC32.calc(buffer);
      if(localFileHeader.crc32 !== crc32) {
        throw new Error("wrong crc: file=0x" + localFileHeader.crc32.toString(16) + ", data=0x" + crc32.toString(16));
      }
    }
    return buffer
  };
  Zlib.Unzip.prototype.getFilenames = function() {
    var filenameList = [];
    var i;
    var il;
    var fileHeaderList;
    if(!this.fileHeaderList) {
      this.parseFileHeader()
    }
    fileHeaderList = this.fileHeaderList;
    for(i = 0, il = fileHeaderList.length;i < il;++i) {
      filenameList[i] = fileHeaderList[i].filename
    }
    return filenameList
  };
  Zlib.Unzip.prototype.decompress = function(filename, opt_params) {
    var index;
    if(!this.filenameToIndex) {
      this.parseFileHeader()
    }
    index = this.filenameToIndex[filename];
    if(index === void 0) {
      throw new Error(filename + " not found");
    }
    return this.getFileData(index, opt_params)
  };
  Zlib.Unzip.prototype.setPassword = function(password) {
    this.password = password
  };
  Zlib.Unzip.prototype.decode = function(key, n) {
    n ^= this.getByte((key));
    this.updateKeys((key), n);
    return n
  };
  Zlib.Unzip.prototype.updateKeys = Zlib.Zip.prototype.updateKeys;
  Zlib.Unzip.prototype.createDecryptionKey = Zlib.Zip.prototype.createEncryptionKey;
  Zlib.Unzip.prototype.getByte = Zlib.Zip.prototype.getByte
});
goog.provide("Zlib");
goog.scope(function() {
  Zlib.CompressionMethod = {DEFLATE:8, RESERVED:15}
});
goog.provide("Zlib.Deflate");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib");
goog.require("Zlib.Adler32");
goog.require("Zlib.RawDeflate");
goog.scope(function() {
  Zlib.Deflate = function(input, opt_params) {
    this.input = input;
    this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.Deflate.DefaultBufferSize);
    this.compressionType = Zlib.Deflate.CompressionType.DYNAMIC;
    this.rawDeflate;
    var rawDeflateOption = {};
    var prop;
    if(opt_params || !(opt_params = {})) {
      if(typeof opt_params["compressionType"] === "number") {
        this.compressionType = opt_params["compressionType"]
      }
    }
    for(prop in opt_params) {
      rawDeflateOption[prop] = opt_params[prop]
    }
    rawDeflateOption["outputBuffer"] = this.output;
    this.rawDeflate = new Zlib.RawDeflate(this.input, rawDeflateOption)
  };
  Zlib.Deflate.DefaultBufferSize = 32768;
  Zlib.Deflate.CompressionType = Zlib.RawDeflate.CompressionType;
  Zlib.Deflate.compress = function(input, opt_params) {
    return(new Zlib.Deflate(input, opt_params)).compress()
  };
  Zlib.Deflate.prototype.compress = function() {
    var cm;
    var cinfo;
    var cmf;
    var flg;
    var fcheck;
    var fdict;
    var flevel;
    var clevel;
    var adler;
    var error = false;
    var output;
    var pos = 0;
    output = this.output;
    cm = Zlib.CompressionMethod.DEFLATE;
    switch(cm) {
      case Zlib.CompressionMethod.DEFLATE:
        cinfo = Math.LOG2E * Math.log(Zlib.RawDeflate.WindowSize) - 8;
        break;
      default:
        throw new Error("invalid compression method");
    }
    cmf = cinfo << 4 | cm;
    output[pos++] = cmf;
    fdict = 0;
    switch(cm) {
      case Zlib.CompressionMethod.DEFLATE:
        switch(this.compressionType) {
          case Zlib.Deflate.CompressionType.NONE:
            flevel = 0;
            break;
          case Zlib.Deflate.CompressionType.FIXED:
            flevel = 1;
            break;
          case Zlib.Deflate.CompressionType.DYNAMIC:
            flevel = 2;
            break;
          default:
            throw new Error("unsupported compression type");
        }
        break;
      default:
        throw new Error("invalid compression method");
    }
    flg = flevel << 6 | fdict << 5;
    fcheck = 31 - (cmf * 256 + flg) % 31;
    flg |= fcheck;
    output[pos++] = flg;
    adler = Zlib.Adler32(this.input);
    this.rawDeflate.op = pos;
    output = this.rawDeflate.compress();
    pos = output.length;
    if(USE_TYPEDARRAY) {
      output = new Uint8Array(output.buffer);
      if(output.length <= pos + 4) {
        this.output = new Uint8Array(output.length + 4);
        this.output.set(output);
        output = this.output
      }
      output = output.subarray(0, pos + 4)
    }
    output[pos++] = adler >> 24 & 255;
    output[pos++] = adler >> 16 & 255;
    output[pos++] = adler >> 8 & 255;
    output[pos++] = adler & 255;
    return output
  }
});
goog.provide("Zlib.exportObject");
goog.require("Zlib");
goog.scope(function() {
  Zlib.exportObject = function(enumString, exportKeyValue) {
    var keys;
    var key;
    var i;
    var il;
    if(Object.keys) {
      keys = Object.keys(exportKeyValue)
    }else {
      keys = [];
      i = 0;
      for(key in exportKeyValue) {
        keys[i++] = key
      }
    }
    for(i = 0, il = keys.length;i < il;++i) {
      key = keys[i];
      goog.exportSymbol(enumString + "." + key, exportKeyValue[key])
    }
  }
});
goog.provide("Zlib.InflateStream");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib");
goog.require("Zlib.RawInflateStream");
goog.scope(function() {
  Zlib.InflateStream = function(input) {
    this.input = input === void 0 ? new (USE_TYPEDARRAY ? Uint8Array : Array) : input;
    this.ip = 0;
    this.rawinflate = new Zlib.RawInflateStream(this.input, this.ip);
    this.method;
    this.output = this.rawinflate.output
  };
  Zlib.InflateStream.prototype.decompress = function(input) {
    var buffer;
    var adler32;
    if(input !== void 0) {
      if(USE_TYPEDARRAY) {
        var tmp = new Uint8Array(this.input.length + input.length);
        tmp.set(this.input, 0);
        tmp.set(input, this.input.length);
        this.input = tmp
      }else {
        this.input = this.input.concat(input)
      }
    }
    if(this.method === void 0) {
      if(this.readHeader() < 0) {
        return new (USE_TYPEDARRAY ? Uint8Array : Array)
      }
    }
    buffer = this.rawinflate.decompress(this.input, this.ip);
    if(this.rawinflate.ip !== 0) {
      this.input = USE_TYPEDARRAY ? this.input.subarray(this.rawinflate.ip) : this.input.slice(this.rawinflate.ip);
      this.ip = 0
    }
    return buffer
  };
  Zlib.InflateStream.prototype.getBytes = function() {
    return this.rawinflate.getBytes()
  };
  Zlib.InflateStream.prototype.readHeader = function() {
    var ip = this.ip;
    var input = this.input;
    var cmf = input[ip++];
    var flg = input[ip++];
    if(cmf === void 0 || flg === void 0) {
      return-1
    }
    switch(cmf & 15) {
      case Zlib.CompressionMethod.DEFLATE:
        this.method = Zlib.CompressionMethod.DEFLATE;
        break;
      default:
        throw new Error("unsupported compression method");
    }
    if(((cmf << 8) + flg) % 31 !== 0) {
      throw new Error("invalid fcheck flag:" + ((cmf << 8) + flg) % 31);
    }
    if(flg & 32) {
      throw new Error("fdict flag is not supported");
    }
    this.ip = ip
  }
});
goog.require("Zlib.Adler32");
goog.exportSymbol("Zlib.Adler32", Zlib.Adler32);
goog.exportSymbol("Zlib.Adler32.update", Zlib.Adler32.update);
goog.require("Zlib.CRC32");
goog.exportSymbol("Zlib.CRC32", Zlib.CRC32);
goog.exportSymbol("Zlib.CRC32.calc", Zlib.CRC32.calc);
goog.exportSymbol("Zlib.CRC32.update", Zlib.CRC32.update);
goog.require("Zlib.Deflate");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.Deflate", Zlib.Deflate);
goog.exportSymbol("Zlib.Deflate.compress", Zlib.Deflate.compress);
goog.exportSymbol("Zlib.Deflate.prototype.compress", Zlib.Deflate.prototype.compress);
Zlib.exportObject("Zlib.Deflate.CompressionType", {"NONE":Zlib.Deflate.CompressionType.NONE, "FIXED":Zlib.Deflate.CompressionType.FIXED, "DYNAMIC":Zlib.Deflate.CompressionType.DYNAMIC});
goog.require("Zlib.Gunzip");
goog.exportSymbol("Zlib.Gunzip", Zlib.Gunzip);
goog.exportSymbol("Zlib.Gunzip.prototype.decompress", Zlib.Gunzip.prototype.decompress);
goog.exportSymbol("Zlib.Gunzip.prototype.getMembers", Zlib.Gunzip.prototype.getMembers);
goog.require("Zlib.GunzipMember");
goog.exportSymbol("Zlib.GunzipMember", Zlib.GunzipMember);
goog.exportSymbol("Zlib.GunzipMember.prototype.getName", Zlib.GunzipMember.prototype.getName);
goog.exportSymbol("Zlib.GunzipMember.prototype.getData", Zlib.GunzipMember.prototype.getData);
goog.exportSymbol("Zlib.GunzipMember.prototype.getMtime", Zlib.GunzipMember.prototype.getMtime);
goog.require("Zlib.Gzip");
goog.exportSymbol("Zlib.Gzip", Zlib.Gzip);
goog.exportSymbol("Zlib.Gzip.prototype.compress", Zlib.Gzip.prototype.compress);
goog.require("Zlib.Inflate");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.Inflate", Zlib.Inflate);
goog.exportSymbol("Zlib.Inflate.prototype.decompress", Zlib.Inflate.prototype.decompress);
Zlib.exportObject("Zlib.Inflate.BufferType", {"ADAPTIVE":Zlib.Inflate.BufferType.ADAPTIVE, "BLOCK":Zlib.Inflate.BufferType.BLOCK});
goog.require("Zlib.InflateStream");
goog.exportSymbol("Zlib.InflateStream", Zlib.InflateStream);
goog.exportSymbol("Zlib.InflateStream.prototype.decompress", Zlib.InflateStream.prototype.decompress);
goog.exportSymbol("Zlib.InflateStream.prototype.getBytes", Zlib.InflateStream.prototype.getBytes);
goog.require("Zlib.RawDeflate");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.RawDeflate", Zlib.RawDeflate);
goog.exportSymbol("Zlib.RawDeflate.prototype.compress", Zlib.RawDeflate.prototype.compress);
Zlib.exportObject("Zlib.RawDeflate.CompressionType", {"NONE":Zlib.RawDeflate.CompressionType.NONE, "FIXED":Zlib.RawDeflate.CompressionType.FIXED, "DYNAMIC":Zlib.RawDeflate.CompressionType.DYNAMIC});
goog.require("Zlib.RawInflate");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.RawInflate", Zlib.RawInflate);
goog.exportSymbol("Zlib.RawInflate.prototype.decompress", Zlib.RawInflate.prototype.decompress);
Zlib.exportObject("Zlib.RawInflate.BufferType", {"ADAPTIVE":Zlib.RawInflate.BufferType.ADAPTIVE, "BLOCK":Zlib.RawInflate.BufferType.BLOCK});
goog.require("Zlib.RawInflateStream");
goog.exportSymbol("Zlib.RawInflateStream", Zlib.RawInflateStream);
goog.exportSymbol("Zlib.RawInflateStream.prototype.decompress", Zlib.RawInflateStream.prototype.decompress);
goog.exportSymbol("Zlib.RawInflateStream.prototype.getBytes", Zlib.RawInflateStream.prototype.getBytes);
goog.require("Zlib.Unzip");
goog.exportSymbol("Zlib.Unzip", Zlib.Unzip);
goog.exportSymbol("Zlib.Unzip.prototype.decompress", Zlib.Unzip.prototype.decompress);
goog.exportSymbol("Zlib.Unzip.prototype.getFilenames", Zlib.Unzip.prototype.getFilenames);
goog.exportSymbol("Zlib.Unzip.prototype.setPassword", Zlib.Unzip.prototype.setPassword);
goog.require("Zlib.Zip");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.Zip", Zlib.Zip);
goog.exportSymbol("Zlib.Zip.prototype.addFile", Zlib.Zip.prototype.addFile);
goog.exportSymbol("Zlib.Zip.prototype.compress", Zlib.Zip.prototype.compress);
goog.exportSymbol("Zlib.Zip.prototype.setPassword", Zlib.Zip.prototype.setPassword);
Zlib.exportObject("Zlib.Zip.CompressionMethod", {"STORE":Zlib.Zip.CompressionMethod.STORE, "DEFLATE":Zlib.Zip.CompressionMethod.DEFLATE});
Zlib.exportObject("Zlib.Zip.OperatingSystem", {"MSDOS":Zlib.Zip.OperatingSystem.MSDOS, "UNIX":Zlib.Zip.OperatingSystem.UNIX, "MACINTOSH":Zlib.Zip.OperatingSystem.MACINTOSH});
}).call(this);
//# sourceMappingURL=data:application/json;base64,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S0FBaUIsQ0FBakI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxDQUFmLEVBQWtCLENBQWxCLENBQXNCO2VBQ2xEO2FBQU1BLE1BQU4sS0FBaUIsQ0FBakI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxDQUFmLEVBQWtCLENBQWxCLENBQXNCO2VBQ2xEO2FBQU1BLE1BQU4sS0FBaUIsQ0FBakI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxDQUFmLEVBQWtCLENBQWxCLENBQXNCO2VBQ2xEO2FBQU1BLE1BQU4sS0FBaUIsQ0FBakI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxDQUFmLEVBQWtCLENBQWxCLENBQXNCO2VBQ2xEO2FBQU1BLE1BQU4sS0FBaUIsQ0FBakI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxDQUFmLEVBQWtCLENBQWxCLENBQXNCO2VBQ2xEO2FBQU1BLE1BQU4sS0FBaUIsQ0FBakI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxDQUFmLEVBQWtCLENBQWxCLENBQXNCO2VBQ2xEO2FBQU1BLE1BQU4sS0FBaUIsRUFBakI7QUFBc0IsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ3BEO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsRUFBaEI7QUFBcUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ25EO2FBQU1BLE1BQU4sSUFBZ0IsR0FBaEI7QUFBc0IsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxFQUFmLEVBQW1CLENBQW5CLENBQXVCO2VBQ3BEO2FBQU1BLE1BQU4sSUFBZ0IsR0FBaEI7QUFBc0IsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxHQUFmLEVBQW9CLENBQXBCLENBQXdCO2VBQ3JEO2FBQU1BLE1BQU4sSUFBZ0IsR0FBaEI7QUFBc0IsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxHQUFmLEVBQW9CLENBQXBCLENBQXdCO2VBQ3JEO2FBQU1BLE1BQU4sSUFBZ0IsR0FBaEI7QUFBc0IsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxHQUFmLEVBQW9CLENBQXBCLENBQXdCO2VBQ3JEO2FBQU1BLE1BQU4sSUFBZ0IsR0FBaEI7QUFBc0IsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxHQUFmLEVBQW9CLENBQXBCLENBQXdCO2VBQ3JEO2FBQU1BLE1BQU4sSUFBZ0IsR0FBaEI7QUFBc0IsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxHQUFmLEVBQW9CLENBQXBCLENBQXdCO2VBQ3JEO2FBQU1BLE1BQU4sS0FBaUIsR0FBakI7QUFBdUIsZ0JBQU8sQ0FBQyxHQUFELEVBQU1BLE1BQU4sR0FBZSxHQUFmLEVBQW9CLENBQXBCLENBQXdCO2VBQ3REOztBQUFTLGVBQU0sa0JBQU4sR0FBMkJBLE1BQTNCLENBOUJYOztBQURvQixLQUF0QmlUO0FBbUNBLFVBQU81RCxNQXBETTtHQUFYLEVBRnlDLENBK0Q3Q3pCO01BQUF5RixXQUFBOEQsVUFBQTlSLFVBQUFrUyxpQkFBQSxHQUF1REMsUUFBUSxDQUFDUixJQUFELENBQU87QUFFcEUsUUFBSTFILENBRUo7V0FBUSxJQUFSO0FBQ0UsV0FBTTBILElBQU4sS0FBZSxDQUFmO0FBQW1CMUgsU0FBQSxHQUFJLENBQUMsQ0FBRCxFQUFJMEgsSUFBSixHQUFXLENBQVgsRUFBYyxDQUFkLENBQWtCO2FBQ3pDO1dBQU1BLElBQU4sS0FBZSxDQUFmO0FBQW1CMUgsU0FBQSxHQUFJLENBQUMsQ0FBRCxFQUFJMEgsSUFBSixHQUFXLENBQVgsRUFBYyxDQUFkLENBQWtCO2FBQ3pDO1dBQU1BLElBQU4sS0FBZSxDQUFmO0FBQW1CMUgsU0FBQSxHQUFJLENBQUMsQ0FBRCxFQUFJMEgsSUFBSixHQUFXLENBQVgsRUFBYyxDQUFkLENBQWtCO2FBQ3pDO1dBQU1BLElBQU4sS0FBZSxDQUFmO0FBQW1CMUgsU0FBQSxHQUFJLENBQUMsQ0FBRCxFQUFJMEgsSUFBSixHQUFXLENBQVgsRUFBYyxDQUFkLENBQWtCO2FBQ3pDO1dBQU1BLElBQU4sSUFBYyxDQUFkO0FBQWtCMUgsU0FBQSxHQUFJLENBQUMsQ0FBRCxFQUFJMEgsSUFBSixHQUFXLENBQVgsRUFBYyxDQUFkLENBQWtCO2FBQ3hDO1dBQU1BLElBQU4sSUFBYyxDQUFkO0FBQWtCMUgsU0FBQSxHQUFJLENBQUMsQ0FBRCxFQUFJMEgsSUFBSixHQUFXLENBQVgsRUFBYyxDQUFkLENBQWtCO2FBQ3hDO1dBQU1BLElBQU4sSUFBYyxFQUFkO0FBQW1CMUgsU0FBQSxHQUFJLENBQUMsQ0FBRCxFQUFJMEgsSUFBSixHQUFXLENBQVgsRUFBYyxDQUFkLENBQWtCO2FBQ3pDO1dBQU1BLElBQU4sSUFBYyxFQUFkO0FBQW1CMUgsU0FBQSxHQUFJLENBQUMsQ0FBRCxFQUFJMEgsSUFBSixHQUFXLEVBQVgsRUFBZSxDQUFmLENBQW1CO2FBQzFDO1dBQU1BLElBQU4sSUFBYyxFQUFkO0FBQW1CMUgsU0FBQSxHQUFJLENBQUMsQ0FBRCxFQUFJMEgsSUFBSixHQUFXLEVBQVgsRUFBZSxDQUFmLENBQW1CO2FBQzFDO1dBQU1BLElBQU4sSUFBYyxFQUFkO0FBQW1CMUgsU0FBQSxHQUFJLENBQUMsQ0FBRCxFQUFJMEgsSUFBSixHQUFXLEVB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LEVBRUU2QixJQUFBaVksSUFBQXhnQixVQUFBaVAsU0FGRixDQUlBalc7SUFBQTBOLGFBQUEsQ0FDRSxnQ0FERixFQUVFNkIsSUFBQWlZLElBQUF4Z0IsVUFBQXFoQixZQUZGLENBSUE5WTtJQUFBK2UsYUFBQSxDQUNDLDRCQURELEVBQytCLENBQzNCLE9BRDJCLENBQ2xCL2UsSUFBQWlZLElBQUFMLGtCQUFBZ0IsTUFEa0IsRUFFM0IsU0FGMkIsQ0FFaEI1WSxJQUFBaVksSUFBQUwsa0JBQUFDLFFBRmdCLENBRC9CLENBTUE3WDtJQUFBK2UsYUFBQSxDQUNFLDBCQURGLEVBQzhCLENBQzFCLE9BRDBCLENBQ2pCL2UsSUFBQWlZLElBQUF0SyxnQkFBQXdNLE1BRGlCLEVBRTFCLE1BRjBCLENBRWxCbmEsSUFBQWlZLElBQUF0SyxnQkFBQStSLEtBRmtCLEVBRzFCLFdBSDBCLENBR2IxZixJQUFBaVksSUFBQXRLLGdCQUFBZ1MsVUFIYSxDQUQ5QjsiLCJzb3VyY2VzIjpbImNsb3N1cmUtcHJpbWl0aXZlcy9iYXNlLmpzIiwiZGVmaW5lL3R5cGVkYXJyYXkvaHlicmlkLmpzIiwic3JjL2JpdHN0cmVhbS5qcyIsInNyYy9jcmMzMi5qcyIsInNyYy9ndW56aXBfbWVtYmVyLmpzIiwic3JjL2hlYXAuanMiLCJzcmMvaHVmZm1hbi5qcyIsInNyYy9yYXdkZWZsYXRlLmpzIiwic3JjL2d6aXAuanMiLCJzcmMvcmF3aW5mbGF0ZS5qcyIsInNyYy9ndW56aXAuanMiLCJzcmMvcmF3aW5mbGF0ZV9zdHJlYW0uanMiLCJzcmMvdXRpbC5qcyIsInNyYy9hZGxlcjMyLmpzIiwic3JjL2luZmxhdGUuanMiLCJzcmMvemlwLmpzIiwic3JjL3VuemlwLmpzIiwic3JjL3psaWIuanMiLCJzcmMvZGVmbGF0ZS5qcyIsInNyYy9leHBvcnRfb2JqZWN0LmpzIiwic3JjL2luZmxhdGVfc3RyZWFtLmpzIiwiZXhwb3J0L2FkbGVyMzIuanMiLCJleHBvcnQvY3JjMzIuanMiLCJleHBvcnQvZGVmbGF0ZS5qcyIsImV4cG9ydC9ndW56aXAuanMiLCJleHBvcnQvZ3VuemlwX21lbWJlci5qcyIsImV4cG9ydC9nemlwLmpzIiwiZXhwb3J0L2luZmxhdGUuanMiLCJleHBvcnQvaW5mbGF0ZV9zdHJlYW0uanMiLCJleHBvcnQvcmF3ZGVmbGF0ZS5qcyIsImV4cG9ydC9yYXdpbmZsYXRlLmpzIiwiZXhwb3J0L3Jhd2luZmxhdGVfc3RyZWFtLmpzIiwiZXhwb3J0L3VuemlwLmpzIiwiZXhwb3J0L3ppcC5qcyJdLCJuYW1lcyI6WyJDT01QSUxFRCIsImdvb2ciLCJnbG9iYWwiLCJERUJVRyIsIkxPQ0FMRSIsInByb3ZpZGUiLCJnb29nLnByb3ZpZGUiLCJuYW1lIiwiaXNQcm92aWRlZF8iLCJFcnJvciIsImltcGxpY2l0TmFtZXNwYWNlc18iLCJuYW1lc3BhY2UiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsImdldE9iamVjdEJ5TmFtZSIsImV4cG9ydFBhdGhfIiwic2V0VGVzdE9ubHkiLCJnb29nLnNldFRlc3RPbmx5Iiwib3B0X21lc3NhZ2UiLCJnb29nLmlzUHJvdmlkZWRfIiwiZ29vZy5leHBvcnRQYXRoXyIsIm9wdF9vYmplY3QiLCJvcHRfb2JqZWN0VG9FeHBvcnRUbyIsInBhcnRzIiwic3BsaXQiLCJjdXIiLCJleGVjU2NyaXB0IiwicGFydCIsImxlbmd0aCIsInNoaWZ0IiwiaXNEZWYiLCJnb29nLmdldE9iamVjdEJ5TmFtZSIsIm9wdF9vYmoiLCJpc0RlZkFuZE5vdE51bGwiLCJnbG9iYWxpemUiLCJnb29nLmdsb2JhbGl6ZSIsIm9iaiIsIm9wdF9nbG9iYWwiLCJ4IiwiYWRkRGVwZW5kZW5jeSIsImdvb2cuYWRkRGVwZW5kZW5jeSIsInJlbFBhdGgiLCJwcm92aWRlcyIsInJlcXVpcmVzIiwicmVxdWlyZSIsInBhdGgiLCJyZXBsYWNlIiwiZGVwcyIsImRlcGVuZGVuY2llc18iLCJpIiwibmFtZVRvUGF0aCIsInBhdGhUb05hbWVzIiwiaiIsIkVOQUJMRV9ERUJVR19MT0FERVIiLCJnb29nLnJlcXVpcmUiLCJnZXRQYXRoRnJvbURlcHNfIiwiaW5jbHVkZWRfIiwid3JpdGVTY3JpcHRzXyIsImVycm9yTWVzc2FnZSIsImNvbnNvbGUiLCJiYXNlUGF0aCIsIkNMT1NVUkVfQkFTRV9QQVRIIiwiQ0xPU1VSRV9OT19ERVBTIiwiQ0xPU1VSRV9JTVBPUlRfU0NSSVBUIiwibnVsbEZ1bmN0aW9uIiwiZ29vZy5udWxsRnVuY3Rpb24iLCJpZGVudGl0eUZ1bmN0aW9uIiwiZ29vZy5pZGVudGl0eUZ1bmN0aW9uIiwib3B0X3JldHVyblZhbHVlIiwidmFyX2FyZ3MiLCJhYnN0cmFjdE1ldGhvZCIsImdvb2cuYWJzdHJhY3RNZXRob2QiLCJhZGRTaW5nbGV0b25HZXR0ZXIiLCJnb29nLmFkZFNpbmdsZXRvbkdldHRlciIsImN0b3IiLCJnZXRJbnN0YW5jZSIsImN0b3IuZ2V0SW5zdGFuY2UiLCJpbnN0YW5jZV8iLCJpbnN0YW50aWF0ZWRTaW5nbGV0b25zXyIsImluSHRtbERvY3VtZW50XyIsImdvb2cuaW5IdG1sRG9jdW1lbnRfIiwiZG9jIiwiZG9jdW1lbnQiLCJmaW5kQmFzZVBhdGhfIiwiZ29vZy5maW5kQmFzZVBhdGhfIiwic2NyaXB0cyIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwic3JjIiwicW1hcmsiLCJsIiwic3Vic3RyIiwiaW1wb3J0U2NyaXB0XyIsImdvb2cuaW1wb3J0U2NyaXB0XyIsImltcG9ydFNjcmlwdCIsIndyaXRlU2NyaXB0VGFnXyIsIndyaXR0ZW4iLCJnb29nLndyaXRlU2NyaXB0VGFnXyIsIndyaXRlIiwiZ29vZy53cml0ZVNjcmlwdHNfIiwic2VlblNjcmlwdCIsInZpc2l0Tm9kZSIsInZpc2l0ZWQiLCJwdXNoIiwicmVxdWlyZU5hbWUiLCJnb29nLmdldFBhdGhGcm9tRGVwc18iLCJydWxlIiwidHlwZU9mIiwiZ29vZy50eXBlT2YiLCJ2YWx1ZSIsInMiLCJBcnJheSIsIk9iamVjdCIsImNsYXNzTmFtZSIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2FsbCIsInNwbGljZSIsInByb3BlcnR5SXNFbnVtZXJhYmxlIiwiZ29vZy5pc0RlZiIsInZhbCIsInVuZGVmaW5lZCIsImlzTnVsbCIsImdvb2cuaXNOdWxsIiwiZ29vZy5pc0RlZkFuZE5vdE51bGwiLCJpc0FycmF5IiwiZ29vZy5pc0FycmF5IiwiaXNBcnJheUxpa2UiLCJnb29nLmlzQXJyYXlMaWtlIiwidHlwZSIsImlzRGF0ZUxpa2UiLCJnb29nLmlzRGF0ZUxpa2UiLCJpc09iamVjdCIsImdldEZ1bGxZZWFyIiwiaXNTdHJpbmciLCJnb29nLmlzU3RyaW5nIiwiaXNCb29sZWFuIiwiZ29vZy5pc0Jvb2xlYW4iLCJpc051bWJlciIsImdvb2cuaXNOdW1iZXIiLCJpc0Z1bmN0aW9uIiwiZ29vZy5pc0Z1bmN0aW9uIiwiZ29vZy5pc09iamVjdCIsImdldFVpZCIsImdvb2cuZ2V0VWlkIiwiVUlEX1BST1BFUlRZXyIsInVpZENvdW50ZXJfIiwicmVtb3ZlVWlkIiwiZ29vZy5yZW1vdmVVaWQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJleCIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImdldEhhc2hDb2RlIiwicmVtb3ZlSGFzaENvZGUiLCJjbG9uZU9iamVjdCIsImdvb2cuY2xvbmVPYmplY3QiLCJjbG9uZSIsImtleSIsImJpbmROYXRpdmVfIiwiZ29vZy5iaW5kTmF0aXZlXyIsImZuIiwic2VsZk9iaiIsImFwcGx5IiwiYmluZCIsImFyZ3VtZW50cyIsImJpbmRKc18iLCJnb29nLmJpbmRKc18iLCJib3VuZEFyZ3MiLCJzbGljZSIsIm5ld0FyZ3MiLCJ1bnNoaWZ0IiwiZ29vZy5iaW5kIiwiRnVuY3Rpb24iLCJpbmRleE9mIiwicGFydGlhbCIsImdvb2cucGFydGlhbCIsImFyZ3MiLCJtaXhpbiIsImdvb2cubWl4aW4iLCJ0YXJnZXQiLCJzb3VyY2UiLCJub3ciLCJEYXRlIiwiZ2xvYmFsRXZhbCIsImdvb2cuZ2xvYmFsRXZhbCIsInNjcmlwdCIsImV2YWwiLCJldmFsV29ya3NGb3JHbG9iYWxzXyIsInNjcmlwdEVsdCIsImNyZWF0ZUVsZW1lbnQiLCJkZWZlciIsImFwcGVuZENoaWxkIiwiY3JlYXRlVGV4dE5vZGUiLCJib2R5IiwicmVtb3ZlQ2hpbGQiLCJjc3NOYW1lTWFwcGluZ18iLCJjc3NOYW1lTWFwcGluZ1N0eWxlXyIsImdldENzc05hbWUiLCJnb29nLmdldENzc05hbWUiLCJvcHRfbW9kaWZpZXIiLCJnZXRNYXBwaW5nIiwiY3NzTmFtZSIsInJlbmFtZUJ5UGFydHMiLCJtYXBwZWQiLCJqb2luIiwicmVuYW1lIiwiYSIsInNldENzc05hbWVNYXBwaW5nIiwiZ29vZy5zZXRDc3NOYW1lTWFwcGluZyIsIm1hcHBpbmciLCJvcHRfc3R5bGUiLCJDTE9TVVJFX0NTU19OQU1FX01BUFBJTkciLCJnZXRNc2ciLCJnb29nLmdldE1zZyIsInN0ciIsIm9wdF92YWx1ZXMiLCJ2YWx1ZXMiLCJSZWdFeHAiLCJleHBvcnRTeW1ib2wiLCJnb29nLmV4cG9ydFN5bWJvbCIsInB1YmxpY1BhdGgiLCJvYmplY3QiLCJleHBvcnRQcm9wZXJ0eSIsImdvb2cuZXhwb3J0UHJvcGVydHkiLCJwdWJsaWNOYW1lIiwic3ltYm9sIiwiaW5oZXJpdHMiLCJnb29nLmluaGVyaXRzIiwiY2hpbGRDdG9yIiwicGFyZW50Q3RvciIsInRlbXBDdG9yIiwic3VwZXJDbGFzc18iLCJjb25zdHJ1Y3RvciIsImJhc2UiLCJnb29nLmJhc2UiLCJtZSIsIm9wdF9tZXRob2ROYW1lIiwiY2FsbGVyIiwiY2FsbGVlIiwiZm91bmRDYWxsZXIiLCJzY29wZSIsImdvb2cuc2NvcGUiLCJVU0VfVFlQRURBUlJBWSIsIlVpbnQ4QXJyYXkiLCJVaW50MTZBcnJheSIsIlVpbnQzMkFycmF5IiwiRGF0YVZpZXciLCJabGliIiwiQml0U3RyZWFtIiwiWmxpYi5CaXRTdHJlYW0iLCJidWZmZXIiLCJidWZmZXJQb3NpdGlvbiIsImluZGV4IiwiYml0aW5kZXgiLCJEZWZhdWx0QmxvY2tTaXplIiwiZXhwYW5kQnVmZmVyIiwiWmxpYi5CaXRTdHJlYW0ucHJvdG90eXBlLmV4cGFuZEJ1ZmZlciIsIm9sZGJ1ZiIsImlsIiwic2V0Iiwid3JpdGVCaXRzIiwiWmxpYi5CaXRTdHJlYW0ucHJvdG90eXBlLndyaXRlQml0cyIsIm51bWJlciIsIm4iLCJyZXZlcnNlIiwiY3VycmVudCIsInJldjMyXyIsIlJldmVyc2VUYWJsZSIsImZpbmlzaCIsIlpsaWIuQml0U3RyZWFtLnByb3RvdHlwZS5maW5pc2giLCJvdXRwdXQiLCJzdWJhcnJheSIsInRhYmxlIiwiciIsIlpMSUJfQ1JDMzJfQ09NUEFDVCIsIkNSQzMyIiwiY2FsYyIsIlpsaWIuQ1JDMzIuY2FsYyIsImRhdGEiLCJwb3MiLCJ1cGRhdGUiLCJabGliLkNSQzMyLnVwZGF0ZSIsImNyYyIsIlRhYmxlIiwic2luZ2xlIiwiWmxpYi5DUkMzMi5zaW5nbGUiLCJudW0iLCJUYWJsZV8iLCJjIiwiR3VuemlwTWVtYmVyIiwiWmxpYi5HdW56aXBNZW1iZXIiLCJpZDEiLCJpZDIiLCJjbSIsImZsZyIsIm10aW1lIiwieGZsIiwib3MiLCJjcmMxNiIsInhsZW4iLCJjcmMzMiIsImlzaXplIiwiY29tbWVudCIsImdldE5hbWUiLCJabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TmFtZSIsImdldERhdGEiLCJabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0RGF0YSIsImdldE10aW1lIiwiWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldE10aW1lIiwiSGVhcCIsIlpsaWIuSGVhcCIsImdldFBhcmVudCIsIlpsaWIuSGVhcC5wcm90b3R5cGUuZ2V0UGFyZW50IiwiZ2V0Q2hpbGQiLCJabGliLkhlYXAucHJvdG90eXBlLmdldENoaWxkIiwiWmxpYi5IZWFwLnByb3RvdHlwZS5wdXNoIiwicGFyZW50IiwiaGVhcCIsInN3YXAiLCJwb3AiLCJabGliLkhlYXAucHJvdG90eXBlLnBvcCIsIkh1ZmZtYW4iLCJidWlsZEh1ZmZtYW5UYWJsZSIsIlpsaWIuSHVmZm1hbi5idWlsZEh1ZmZtYW5UYWJsZSIsImxlbmd0aHMiLCJsaXN0U2l6ZSIsIm1heENvZGVMZW5ndGgiLCJtaW5Db2RlTGVuZ3RoIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJzaXplIiwiYml0TGVuZ3RoIiwiY29kZSIsInNraXAiLCJyZXZlcnNlZCIsInJ0ZW1wIiwiUmF3RGVmbGF0ZSIsIlpsaWIuUmF3RGVmbGF0ZSIsImlucHV0Iiwib3B0X3BhcmFtcyIsImNvbXByZXNzaW9uVHlwZSIsIkNvbXByZXNzaW9uVHlwZSIsIkRZTkFNSUMiLCJsYXp5IiwiZnJlcXNMaXRMZW4iLCJmcmVxc0Rpc3QiLCJvcCIsIkx6NzdNaW5MZW5ndGgiLCJMejc3TWF4TGVuZ3RoIiwiV2luZG93U2l6ZSIsIk1heENvZGVMZW5ndGgiLCJIVUZNQVgiLCJGaXhlZEh1ZmZtYW5UYWJsZSIsImNvbXByZXNzIiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5jb21wcmVzcyIsImJsb2NrQXJyYXkiLCJwb3NpdGlvbiIsIk5PTkUiLCJtYWtlTm9jb21wcmVzc0Jsb2NrIiwiRklYRUQiLCJtYWtlRml4ZWRIdWZmbWFuQmxvY2siLCJtYWtlRHluYW1pY0h1ZmZtYW5CbG9jayIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZU5vY29tcHJlc3NCbG9jayIsImlzRmluYWxCbG9jayIsImJmaW5hbCIsImJ0eXBlIiwibGVuIiwibmxlbiIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZUZpeGVkSHVmZm1hbkJsb2NrIiwic3RyZWFtIiwibHo3NyIsImZpeGVkSHVmZm1hbiIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZUR5bmFtaWNIdWZmbWFuQmxvY2siLCJobGl0IiwiaGRpc3QiLCJoY2xlbiIsImhjbGVuT3JkZXIiLCJsaXRMZW5MZW5ndGhzIiwibGl0TGVuQ29kZXMiLCJkaXN0TGVuZ3RocyIsImRpc3RDb2RlcyIsInRyZWVTeW1ib2xzIiwidHJlZUxlbmd0aHMiLCJ0cmFuc0xlbmd0aHMiLCJ0cmVlQ29kZXMiLCJiaXRsZW4iLCJnZXRMZW5ndGhzXyIsImdldENvZGVzRnJvbUxlbmd0aHNfIiwiZ2V0VHJlZVN5bWJvbHNfIiwiZnJlcXMiLCJjb2RlcyIsImR5bmFtaWNIdWZmbWFuIiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5keW5hbWljSHVmZm1hbiIsImRhdGFBcnJheSIsImxpdExlbiIsImRpc3QiLCJsaXRlcmFsIiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5maXhlZEh1ZmZtYW4iLCJMejc3TWF0Y2giLCJabGliLlJhd0RlZmxhdGUuTHo3N01hdGNoIiwiYmFja3dhcmREaXN0YW5jZSIsIkxlbmd0aENvZGVUYWJsZSIsImdldERpc3RhbmNlQ29kZV8iLCJabGliLlJhd0RlZmxhdGUuTHo3N01hdGNoLnByb3RvdHlwZS5nZXREaXN0YW5jZUNvZGVfIiwidG9Mejc3QXJyYXkiLCJabGliLlJhd0RlZmxhdGUuTHo3N01hdGNoLnByb3RvdHlwZS50b0x6NzdBcnJheSIsImNvZGVBcnJheSIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubHo3NyIsIm1hdGNoS2V5Iiwid2luZG93U2l6ZSIsIm1hdGNoTGlzdCIsImxvbmdlc3RNYXRjaCIsInByZXZNYXRjaCIsImx6NzdidWYiLCJza2lwTGVuZ3RoIiwidG1wIiwid3JpdGVNYXRjaCIsIm1hdGNoIiwib2Zmc2V0IiwibHo3N0FycmF5Iiwic2VhcmNoTG9uZ2VzdE1hdGNoXyIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuc2VhcmNoTG9uZ2VzdE1hdGNoXyIsImN1cnJlbnRNYXRjaCIsIm1hdGNoTWF4IiwibWF0Y2hMZW5ndGgiLCJkbCIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuZ2V0VHJlZVN5bWJvbHNfIiwibGl0bGVuTGVuZ3RocyIsInJ1bkxlbmd0aCIsInJlc3VsdCIsIm5SZXN1bHQiLCJycHQiLCJabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmdldExlbmd0aHNfIiwibGltaXQiLCJuU3ltYm9scyIsIm5vZGVzIiwiY29kZUxlbmd0aCIsInJldmVyc2VQYWNrYWdlTWVyZ2VfIiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5yZXZlcnNlUGFja2FnZU1lcmdlXyIsInN5bWJvbHMiLCJtaW5pbXVtQ29zdCIsImZsYWciLCJjdXJyZW50UG9zaXRpb24iLCJleGNlc3MiLCJoYWxmIiwidCIsIndlaWdodCIsIm5leHQiLCJ0YWtlUGFja2FnZSIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuZ2V0Q29kZXNGcm9tTGVuZ3Roc18iLCJjb3VudCIsInN0YXJ0Q29kZSIsIm0iLCJHemlwIiwiWmxpYi5HemlwIiwiaXAiLCJmbGFncyIsImZpbGVuYW1lIiwiZGVmbGF0ZU9wdGlvbnMiLCJEZWZhdWx0QnVmZmVyU2l6ZSIsIlpsaWIuR3ppcC5wcm90b3R5cGUuY29tcHJlc3MiLCJyYXdkZWZsYXRlIiwiRmxhZ3NNYXNrIiwiRk5BTUUiLCJGQ09NTUVOVCIsIkZIQ1JDIiwiT3BlcmF0aW5nU3lzdGVtIiwiVU5LTk9XTiIsImNoYXJDb2RlQXQiLCJieXRlTGVuZ3RoIiwiWkxJQl9SQVdfSU5GTEFURV9CVUZGRVJfU0laRSIsIlJhd0luZmxhdGUiLCJabGliLlJhd0luZmxhdGUiLCJibG9ja3MiLCJidWZmZXJTaXplIiwidG90YWxwb3MiLCJiaXRzYnVmIiwiYml0c2J1ZmxlbiIsImJ1ZmZlclR5cGUiLCJCdWZmZXJUeXBlIiwiQURBUFRJVkUiLCJyZXNpemUiLCJwcmV2IiwiQkxPQ0siLCJNYXhCYWNrd2FyZExlbmd0aCIsIk1heENvcHlMZW5ndGgiLCJleHBhbmRCdWZmZXJBZGFwdGl2ZSIsImNvbmNhdEJ1ZmZlciIsImNvbmNhdEJ1ZmZlckR5bmFtaWMiLCJkZWNvZGVIdWZmbWFuIiwiZGVjb2RlSHVmZm1hbkFkYXB0aXZlIiwiZGVjb21wcmVzcyIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb21wcmVzcyIsInBhcnNlQmxvY2siLCJPcmRlciIsIkxlbmd0aEV4dHJhVGFibGUiLCJEaXN0Q29kZVRhYmxlIiwiRGlzdEV4dHJhVGFibGUiLCJGaXhlZExpdGVyYWxMZW5ndGhUYWJsZSIsIkZpeGVkRGlzdGFuY2VUYWJsZSIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VCbG9jayIsImhkciIsInJlYWRCaXRzIiwicGFyc2VVbmNvbXByZXNzZWRCbG9jayIsInBhcnNlRml4ZWRIdWZmbWFuQmxvY2siLCJwYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2siLCJabGliLlJhd0luZmxhdGUucHJvdG90eXBlLnJlYWRCaXRzIiwiaW5wdXRMZW5ndGgiLCJvY3RldCIsInJlYWRDb2RlQnlUYWJsZSIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucmVhZENvZGVCeVRhYmxlIiwiY29kZVRhYmxlIiwiY29kZVdpdGhMZW5ndGgiLCJabGliLlJhd0luZmxhdGUucHJvdG90eXBlLnBhcnNlVW5jb21wcmVzc2VkQmxvY2siLCJvbGVuZ3RoIiwicHJlQ29weSIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VGaXhlZEh1ZmZtYW5CbG9jayIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrIiwiY29kZUxlbmd0aHMiLCJjb2RlTGVuZ3Roc1RhYmxlIiwiZGVjb2RlIiwicmVwZWF0IiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5kZWNvZGVIdWZmbWFuIiwibGl0bGVuIiwiY3VycmVudExpdGxlblRhYmxlIiwidGkiLCJjb2RlRGlzdCIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb2RlSHVmZm1hbkFkYXB0aXZlIiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5leHBhbmRCdWZmZXIiLCJvcHRfcGFyYW0iLCJiYWNrd2FyZCIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyQWRhcHRpdmUiLCJyYXRpbyIsIm1heEh1ZmZDb2RlIiwibmV3U2l6ZSIsIm1heEluZmxhdGVTaXplIiwiZml4UmF0aW8iLCJhZGRSYXRpbyIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuY29uY2F0QnVmZmVyIiwiYmxvY2siLCJqbCIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuY29uY2F0QnVmZmVyRHluYW1pYyIsIkd1bnppcCIsIlpsaWIuR3VuemlwIiwibWVtYmVyIiwiZGVjb21wcmVzc2VkIiwiZ2V0TWVtYmVycyIsIlpsaWIuR3VuemlwLnByb3RvdHlwZS5nZXRNZW1iZXJzIiwiWmxpYi5HdW56aXAucHJvdG90eXBlLmRlY29tcHJlc3MiLCJkZWNvZGVNZW1iZXIiLCJjb25jYXRNZW1iZXIiLCJabGliLkd1bnppcC5wcm90b3R5cGUuZGVjb2RlTWVtYmVyIiwicmF3aW5mbGF0ZSIsImluZmxhdGVkIiwiaW5mbGVuIiwiY2kiLCJGRVhUUkEiLCJkZWNvZGVTdWJGaWVsZCIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsIlpsaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvZGVTdWJGaWVsZCIsIlpsaWIuR3VuemlwLnByb3RvdHlwZS5jb25jYXRNZW1iZXIiLCJwIiwiY29uY2F0IiwiWkxJQl9TVFJFQU1fUkFXX0lORkxBVEVfQlVGRkVSX1NJWkUiLCJSYXdJbmZsYXRlU3RyZWFtIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtIiwib3B0X2J1ZmZlcnNpemUiLCJibG9ja0xlbmd0aCIsImxpdGxlblRhYmxlIiwiZGlzdFRhYmxlIiwic3AiLCJzdGF0dXMiLCJTdGF0dXMiLCJJTklUSUFMSVpFRCIsImlwXyIsImJpdHNidWZsZW5fIiwiYml0c2J1Zl8iLCJCbG9ja1R5cGUiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3MiLCJuZXdJbnB1dCIsInN0b3AiLCJCTE9DS19IRUFERVJfU1RBUlQiLCJyZWFkQmxvY2tIZWFkZXIiLCJCTE9DS19IRUFERVJfRU5EIiwiQkxPQ0tfQk9EWV9TVEFSVCIsImN1cnJlbnRCbG9ja1R5cGUiLCJVTkNPTVBSRVNTRUQiLCJyZWFkVW5jb21wcmVzc2VkQmxvY2tIZWFkZXIiLCJCTE9DS19CT0RZX0VORCIsIkRFQ09ERV9CTE9DS19TVEFSVCIsIkRFQ09ERV9CTE9DS19FTkQiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRCbG9ja0hlYWRlciIsInNhdmVfIiwicmVzdG9yZV8iLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRCaXRzIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkQ29kZUJ5VGFibGUiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRVbmNvbXByZXNzZWRCbG9ja0hlYWRlciIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucGFyc2VVbmNvbXByZXNzZWRCbG9jayIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucGFyc2VGaXhlZEh1ZmZtYW5CbG9jayIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuc2F2ZV8iLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlc3RvcmVfIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5wYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2siLCJwYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2tJbXBsIiwiZSIsImJpdHMiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29kZUh1ZmZtYW4iLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmV4cGFuZEJ1ZmZlciIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuY29uY2F0QnVmZmVyIiwiZ2V0Qnl0ZXMiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmdldEJ5dGVzIiwiVXRpbCIsInN0cmluZ1RvQnl0ZUFycmF5IiwiWmxpYi5VdGlsLnN0cmluZ1RvQnl0ZUFycmF5IiwiQWRsZXIzMiIsIlpsaWIuQWRsZXIzMiIsImFycmF5IiwiWmxpYi5BZGxlcjMyLnVwZGF0ZSIsImFkbGVyIiwiczEiLCJzMiIsInRsZW4iLCJPcHRpbWl6YXRpb25QYXJhbWV0ZXIiLCJJbmZsYXRlIiwiWmxpYi5JbmZsYXRlIiwiY21mIiwidmVyaWZ5IiwiQ29tcHJlc3Npb25NZXRob2QiLCJERUZMQVRFIiwibWV0aG9kIiwiWmxpYi5JbmZsYXRlLnByb3RvdHlwZS5kZWNvbXByZXNzIiwiYWRsZXIzMiIsIlppcCIsIlpsaWIuWmlwIiwiZmlsZXMiLCJwYXNzd29yZCIsIkZsYWdzIiwiRmlsZUhlYWRlclNpZ25hdHVyZSIsIkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZSIsIkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmUiLCJhZGRGaWxlIiwiWmxpYi5aaXAucHJvdG90eXBlLmFkZEZpbGUiLCJjb21wcmVzc2VkIiwiU1RPUkUiLCJkZWZsYXRlV2l0aE9wdGlvbiIsInNldFBhc3N3b3JkIiwiWmxpYi5aaXAucHJvdG90eXBlLnNldFBhc3N3b3JkIiwiWmxpYi5aaXAucHJvdG90eXBlLmNvbXByZXNzIiwiZmlsZSIsIm9wMSIsIm9wMiIsIm9wMyIsImxvY2FsRmlsZVNpemUiLCJjZW50cmFsRGlyZWN0b3J5U2l6ZSIsImVuZE9mQ2VudHJhbERpcmVjdG9yeVNpemUiLCJuZWVkVmVyc2lvbiIsImNvbXByZXNzaW9uTWV0aG9kIiwiZGF0ZSIsInBsYWluU2l6ZSIsImZpbGVuYW1lTGVuZ3RoIiwiZXh0cmFGaWVsZExlbmd0aCIsImNvbW1lbnRMZW5ndGgiLCJleHRyYUZpZWxkIiwib3B0aW9uIiwiY3JlYXRlRW5jcnlwdGlvbktleSIsImVuY29kZSIsIk1TRE9TIiwiRU5DUllQVCIsImdldE1pbnV0ZXMiLCJnZXRTZWNvbmRzIiwiZ2V0SG91cnMiLCJnZXRNb250aCIsImdldERhdGUiLCJabGliLlppcC5wcm90b3R5cGUuZGVmbGF0ZVdpdGhPcHRpb24iLCJkZWZsYXRvciIsImdldEJ5dGUiLCJabGliLlppcC5wcm90b3R5cGUuZ2V0Qnl0ZSIsIlpsaWIuWmlwLnByb3RvdHlwZS5lbmNvZGUiLCJ1cGRhdGVLZXlzIiwiWmxpYi5aaXAucHJvdG90eXBlLnVwZGF0ZUtleXMiLCJabGliLlppcC5wcm90b3R5cGUuY3JlYXRlRW5jcnlwdGlvbktleSIsIlVuemlwIiwiWmxpYi5VbnppcCIsImVvY2RyT2Zmc2V0IiwibnVtYmVyT2ZUaGlzRGlzayIsInN0YXJ0RGlzayIsInRvdGFsRW50cmllc1RoaXNEaXNrIiwidG90YWxFbnRyaWVzIiwiY2VudHJhbERpcmVjdG9yeU9mZnNldCIsImZpbGVIZWFkZXJMaXN0IiwiZmlsZW5hbWVUb0luZGV4IiwiRmlsZUhlYWRlciIsIlpsaWIuVW56aXAuRmlsZUhlYWRlciIsInZlcnNpb24iLCJjb21wcmVzc2lvbiIsInRpbWUiLCJjb21wcmVzc2VkU2l6ZSIsImZpbGVOYW1lTGVuZ3RoIiwiZmlsZUNvbW1lbnRMZW5ndGgiLCJkaXNrTnVtYmVyU3RhcnQiLCJpbnRlcm5hbEZpbGVBdHRyaWJ1dGVzIiwiZXh0ZXJuYWxGaWxlQXR0cmlidXRlcyIsInJlbGF0aXZlT2Zmc2V0IiwicGFyc2UiLCJabGliLlVuemlwLkZpbGVIZWFkZXIucHJvdG90eXBlLnBhcnNlIiwiTG9jYWxGaWxlSGVhZGVyIiwiWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXIiLCJabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlci5wcm90b3R5cGUucGFyc2UiLCJzZWFyY2hFbmRPZkNlbnRyYWxEaXJlY3RvcnlSZWNvcmQiLCJabGliLlVuemlwLnByb3RvdHlwZS5zZWFyY2hFbmRPZkNlbnRyYWxEaXJlY3RvcnlSZWNvcmQiLCJwYXJzZUVuZE9mQ2VudHJhbERpcmVjdG9yeVJlY29yZCIsIlpsaWIuVW56aXAucHJvdG90eXBlLnBhcnNlRW5kT2ZDZW50cmFsRGlyZWN0b3J5UmVjb3JkIiwicGFyc2VGaWxlSGVhZGVyIiwiWmxpYi5VbnppcC5wcm90b3R5cGUucGFyc2VGaWxlSGVhZGVyIiwiZmlsZWxpc3QiLCJmaWxldGFibGUiLCJmaWxlSGVhZGVyIiwiZ2V0RmlsZURhdGEiLCJabGliLlVuemlwLnByb3RvdHlwZS5nZXRGaWxlRGF0YSIsImxvY2FsRmlsZUhlYWRlciIsImNyZWF0ZURlY3J5cHRpb25LZXkiLCJnZXRGaWxlbmFtZXMiLCJabGliLlVuemlwLnByb3RvdHlwZS5nZXRGaWxlbmFtZXMiLCJmaWxlbmFtZUxpc3QiLCJabGliLlVuemlwLnByb3RvdHlwZS5kZWNvbXByZXNzIiwiWmxpYi5VbnppcC5wcm90b3R5cGUuc2V0UGFzc3dvcmQiLCJabGliLlVuemlwLnByb3RvdHlwZS5kZWNvZGUiLCJEZWZsYXRlIiwiWmxpYi5EZWZsYXRlIiwicmF3RGVmbGF0ZSIsInJhd0RlZmxhdGVPcHRpb24iLCJwcm9wIiwiWmxpYi5EZWZsYXRlLmNvbXByZXNzIiwiWmxpYi5EZWZsYXRlLnByb3RvdHlwZS5jb21wcmVzcyIsImNpbmZvIiwiZmNoZWNrIiwiZmRpY3QiLCJmbGV2ZWwiLCJjbGV2ZWwiLCJlcnJvciIsIkxPRzJFIiwibG9nIiwiZXhwb3J0T2JqZWN0IiwiWmxpYi5leHBvcnRPYmplY3QiLCJlbnVtU3RyaW5nIiwiZXhwb3J0S2V5VmFsdWUiLCJrZXlzIiwiSW5mbGF0ZVN0cmVhbSIsIlpsaWIuSW5mbGF0ZVN0cmVhbSIsIlpsaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb21wcmVzcyIsInJlYWRIZWFkZXIiLCJabGliLkluZmxhdGVTdHJlYW0ucHJvdG90eXBlLmdldEJ5dGVzIiwiWmxpYi5JbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkSGVhZGVyIiwiVU5JWCIsIk1BQ0lOVE9TSCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAwNiBUaGUgQ2xvc3VyZSBMaWJyYXJ5IEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy9cbi8vICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJvb3RzdHJhcCBmb3IgdGhlIEdvb2dsZSBKUyBMaWJyYXJ5IChDbG9zdXJlKS5cbiAqXG4gKiBJbiB1bmNvbXBpbGVkIG1vZGUgYmFzZS5qcyB3aWxsIHdyaXRlIG91dCBDbG9zdXJlJ3MgZGVwcyBmaWxlLCB1bmxlc3MgdGhlXG4gKiBnbG9iYWwgPGNvZGU+Q0xPU1VSRV9OT19ERVBTPC9jb2RlPiBpcyBzZXQgdG8gdHJ1ZS4gIFRoaXMgYWxsb3dzIHByb2plY3RzIHRvXG4gKiBpbmNsdWRlIHRoZWlyIG93biBkZXBzIGZpbGUocykgZnJvbSBkaWZmZXJlbnQgbG9jYXRpb25zLlxuICpcbiAqL1xuXG5cbi8qKlxuICogQGRlZmluZSB7Ym9vbGVhbn0gT3ZlcnJpZGRlbiB0byB0cnVlIGJ5IHRoZSBjb21waWxlciB3aGVuIC0tY2xvc3VyZV9wYXNzXG4gKiAgICAgb3IgLS1tYXJrX2FzX2NvbXBpbGVkIGlzIHNwZWNpZmllZC5cbiAqL1xudmFyIENPTVBJTEVEID0gZmFsc2U7XG5cblxuLyoqXG4gKiBCYXNlIG5hbWVzcGFjZSBmb3IgdGhlIENsb3N1cmUgbGlicmFyeS4gIENoZWNrcyB0byBzZWUgZ29vZyBpc1xuICogYWxyZWFkeSBkZWZpbmVkIGluIHRoZSBjdXJyZW50IHNjb3BlIGJlZm9yZSBhc3NpZ25pbmcgdG8gcHJldmVudFxuICogY2xvYmJlcmluZyBpZiBiYXNlLmpzIGlzIGxvYWRlZCBtb3JlIHRoYW4gb25jZS5cbiAqXG4gKiBAY29uc3RcbiAqL1xudmFyIGdvb2cgPSBnb29nIHx8IHt9OyAvLyBJZGVudGlmaWVzIHRoaXMgZmlsZSBhcyB0aGUgQ2xvc3VyZSBiYXNlLlxuXG5cbi8qKlxuICogUmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgY29udGV4dC4gIEluIG1vc3QgY2FzZXMgdGhpcyB3aWxsIGJlICd3aW5kb3cnLlxuICovXG5nb29nLmdsb2JhbCA9IHRoaXM7XG5cblxuLyoqXG4gKiBAZGVmaW5lIHtib29sZWFufSBERUJVRyBpcyBwcm92aWRlZCBhcyBhIGNvbnZlbmllbmNlIHNvIHRoYXQgZGVidWdnaW5nIGNvZGVcbiAqIHRoYXQgc2hvdWxkIG5vdCBiZSBpbmNsdWRlZCBpbiBhIHByb2R1Y3Rpb24ganNfYmluYXJ5IGNhbiBiZSBlYXNpbHkgc3RyaXBwZWRcbiAqIGJ5IHNwZWNpZnlpbmcgLS1kZWZpbmUgZ29vZy5ERUJVRz1mYWxzZSB0byB0aGUgSlNDb21waWxlci4gRm9yIGV4YW1wbGUsIG1vc3RcbiAqIHRvU3RyaW5nKCkgbWV0aG9kcyBzaG91bGQgYmUgZGVjbGFyZWQgaW5zaWRlIGFuIFwiaWYgKGdvb2cuREVCVUcpXCIgY29uZGl0aW9uYWxcbiAqIGJlY2F1c2UgdGhleSBhcmUgZ2VuZXJhbGx5IHVzZWQgZm9yIGRlYnVnZ2luZyBwdXJwb3NlcyBhbmQgaXQgaXMgZGlmZmljdWx0XG4gKiBmb3IgdGhlIEpTQ29tcGlsZXIgdG8gc3RhdGljYWxseSBkZXRlcm1pbmUgd2hldGhlciB0aGV5IGFyZSB1c2VkLlxuICovXG5nb29nLkRFQlVHID0gdHJ1ZTtcblxuXG4vKipcbiAqIEBkZWZpbmUge3N0cmluZ30gTE9DQUxFIGRlZmluZXMgdGhlIGxvY2FsZSBiZWluZyB1c2VkIGZvciBjb21waWxhdGlvbi4gSXQgaXNcbiAqIHVzZWQgdG8gc2VsZWN0IGxvY2FsZSBzcGVjaWZpYyBkYXRhIHRvIGJlIGNvbXBpbGVkIGluIGpzIGJpbmFyeS4gQlVJTEQgcnVsZVxuICogY2FuIHNwZWNpZnkgdGhpcyB2YWx1ZSBieSBcIi0tZGVmaW5lIGdvb2cuTE9DQUxFPTxsb2NhbGVfbmFtZT5cIiBhcyBKU0NvbXBpbGVyXG4gKiBvcHRpb24uXG4gKlxuICogVGFrZSBpbnRvIGFjY291bnQgdGhhdCB0aGUgbG9jYWxlIGNvZGUgZm9ybWF0IGlzIGltcG9ydGFudC4gWW91IHNob3VsZCB1c2VcbiAqIHRoZSBjYW5vbmljYWwgVW5pY29kZSBmb3JtYXQgd2l0aCBoeXBoZW4gYXMgYSBkZWxpbWl0ZXIuIExhbmd1YWdlIG11c3QgYmVcbiAqIGxvd2VyY2FzZSwgTGFuZ3VhZ2UgU2NyaXB0IC0gQ2FwaXRhbGl6ZWQsIFJlZ2lvbiAtIFVQUEVSQ0FTRS5cbiAqIFRoZXJlIGFyZSBmZXcgZXhhbXBsZXM6IHB0LUJSLCBlbiwgZW4tVVMsIHNyLUxhdGluLUJPLCB6aC1IYW5zLUNOLlxuICpcbiAqIFNlZSBtb3JlIGluZm8gYWJvdXQgbG9jYWxlIGNvZGVzIGhlcmU6XG4gKiBodHRwOi8vd3d3LnVuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS8jVW5pY29kZV9MYW5ndWFnZV9hbmRfTG9jYWxlX0lkZW50aWZpZXJzXG4gKlxuICogRm9yIGxhbmd1YWdlIGNvZGVzIHlvdSBzaG91bGQgdXNlIHZhbHVlcyBkZWZpbmVkIGJ5IElTTyA2OTMtMS4gU2VlIGl0IGhlcmVcbiAqIGh0dHA6Ly93d3cudzMub3JnL1dBSS9FUi9JRy9lcnQvaXNvNjM5Lmh0bS4gVGhlcmUgaXMgb25seSBvbmUgZXhjZXB0aW9uIGZyb21cbiAqIHRoaXMgcnVsZTogdGhlIEhlYnJldyBsYW5ndWFnZS4gRm9yIGxlZ2FjeSByZWFzb25zIHRoZSBvbGQgY29kZSAoaXcpIHNob3VsZFxuICogYmUgdXNlZCBpbnN0ZWFkIG9mIHRoZSBuZXcgY29kZSAoaGUpLCBzZWUgaHR0cDovL3dpa2kvTWFpbi9JSUlTeW5vbnltcy5cbiAqL1xuZ29vZy5MT0NBTEUgPSAnZW4nOyAgLy8gZGVmYXVsdCB0byBlblxuXG5cbi8qKlxuICogQ3JlYXRlcyBvYmplY3Qgc3R1YnMgZm9yIGEgbmFtZXNwYWNlLiAgVGhlIHByZXNlbmNlIG9mIG9uZSBvciBtb3JlXG4gKiBnb29nLnByb3ZpZGUoKSBjYWxscyBpbmRpY2F0ZSB0aGF0IHRoZSBmaWxlIGRlZmluZXMgdGhlIGdpdmVuXG4gKiBvYmplY3RzL25hbWVzcGFjZXMuICBCdWlsZCB0b29scyBhbHNvIHNjYW4gZm9yIHByb3ZpZGUvcmVxdWlyZSBzdGF0ZW1lbnRzXG4gKiB0byBkaXNjZXJuIGRlcGVuZGVuY2llcywgYnVpbGQgZGVwZW5kZW5jeSBmaWxlcyAoc2VlIGRlcHMuanMpLCBldGMuXG4gKiBAc2VlIGdvb2cucmVxdWlyZVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgTmFtZXNwYWNlIHByb3ZpZGVkIGJ5IHRoaXMgZmlsZSBpbiB0aGUgZm9ybVxuICogICAgIFwiZ29vZy5wYWNrYWdlLnBhcnRcIi5cbiAqL1xuZ29vZy5wcm92aWRlID0gZnVuY3Rpb24obmFtZSkge1xuICBpZiAoIUNPTVBJTEVEKSB7XG4gICAgLy8gRW5zdXJlIHRoYXQgdGhlIHNhbWUgbmFtZXNwYWNlIGlzbid0IHByb3ZpZGVkIHR3aWNlLiBUaGlzIGlzIGludGVuZGVkXG4gICAgLy8gdG8gdGVhY2ggbmV3IGRldmVsb3BlcnMgdGhhdCAnZ29vZy5wcm92aWRlJyBpcyBlZmZlY3RpdmVseSBhIHZhcmlhYmxlXG4gICAgLy8gZGVjbGFyYXRpb24uIEFuZCB3aGVuIEpTQ29tcGlsZXIgdHJhbnNmb3JtcyBnb29nLnByb3ZpZGUgaW50byBhIHJlYWxcbiAgICAvLyB2YXJpYWJsZSBkZWNsYXJhdGlvbiwgdGhlIGNvbXBpbGVkIEpTIHNob3VsZCB3b3JrIHRoZSBzYW1lIGFzIHRoZSByYXdcbiAgICAvLyBKUy0tZXZlbiB3aGVuIHRoZSByYXcgSlMgdXNlcyBnb29nLnByb3ZpZGUgaW5jb3JyZWN0bHkuXG4gICAgaWYgKGdvb2cuaXNQcm92aWRlZF8obmFtZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdOYW1lc3BhY2UgXCInICsgbmFtZSArICdcIiBhbHJlYWR5IGRlY2xhcmVkLicpO1xuICAgIH1cbiAgICBkZWxldGUgZ29vZy5pbXBsaWNpdE5hbWVzcGFjZXNfW25hbWVdO1xuXG4gICAgdmFyIG5hbWVzcGFjZSA9IG5hbWU7XG4gICAgd2hpbGUgKChuYW1lc3BhY2UgPSBuYW1lc3BhY2Uuc3Vic3RyaW5nKDAsIG5hbWVzcGFjZS5sYXN0SW5kZXhPZignLicpKSkpIHtcbiAgICAgIGlmIChnb29nLmdldE9iamVjdEJ5TmFtZShuYW1lc3BhY2UpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZ29vZy5pbXBsaWNpdE5hbWVzcGFjZXNfW25hbWVzcGFjZV0gPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGdvb2cuZXhwb3J0UGF0aF8obmFtZSk7XG59O1xuXG5cbi8qKlxuICogTWFya3MgdGhhdCB0aGUgY3VycmVudCBmaWxlIHNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIHRlc3RpbmcsIGFuZCBuZXZlciBmb3JcbiAqIGxpdmUgY29kZSBpbiBwcm9kdWN0aW9uLlxuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfbWVzc2FnZSBPcHRpb25hbCBtZXNzYWdlIHRvIGFkZCB0byB0aGUgZXJyb3IgdGhhdCdzXG4gKiAgICAgcmFpc2VkIHdoZW4gdXNlZCBpbiBwcm9kdWN0aW9uIGNvZGUuXG4gKi9cbmdvb2cuc2V0VGVzdE9ubHkgPSBmdW5jdGlvbihvcHRfbWVzc2FnZSkge1xuICBpZiAoQ09NUElMRUQgJiYgIWdvb2cuREVCVUcpIHtcbiAgICBvcHRfbWVzc2FnZSA9IG9wdF9tZXNzYWdlIHx8ICcnO1xuICAgIHRocm93IEVycm9yKCdJbXBvcnRpbmcgdGVzdC1vbmx5IGNvZGUgaW50byBub24tZGVidWcgZW52aXJvbm1lbnQnICtcbiAgICAgICAgICAgICAgICBvcHRfbWVzc2FnZSA/ICc6ICcgKyBvcHRfbWVzc2FnZSA6ICcuJyk7XG4gIH1cbn07XG5cblxuaWYgKCFDT01QSUxFRCkge1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgZ2l2ZW4gbmFtZSBoYXMgYmVlbiBnb29nLnByb3ZpZGVkLiBUaGlzIHdpbGwgcmV0dXJuIGZhbHNlIGZvclxuICAgKiBuYW1lcyB0aGF0IGFyZSBhdmFpbGFibGUgb25seSBhcyBpbXBsaWNpdCBuYW1lc3BhY2VzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBvYmplY3QgdG8gbG9vayBmb3IuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhlIG5hbWUgaGFzIGJlZW4gcHJvdmlkZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnb29nLmlzUHJvdmlkZWRfID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiAhZ29vZy5pbXBsaWNpdE5hbWVzcGFjZXNfW25hbWVdICYmICEhZ29vZy5nZXRPYmplY3RCeU5hbWUobmFtZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIE5hbWVzcGFjZXMgaW1wbGljaXRseSBkZWZpbmVkIGJ5IGdvb2cucHJvdmlkZS4gRm9yIGV4YW1wbGUsXG4gICAqIGdvb2cucHJvdmlkZSgnZ29vZy5ldmVudHMuRXZlbnQnKSBpbXBsaWNpdGx5IGRlY2xhcmVzXG4gICAqIHRoYXQgJ2dvb2cnIGFuZCAnZ29vZy5ldmVudHMnIG11c3QgYmUgbmFtZXNwYWNlcy5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdvb2cuaW1wbGljaXROYW1lc3BhY2VzXyA9IHt9O1xufVxuXG5cbi8qKlxuICogQnVpbGRzIGFuIG9iamVjdCBzdHJ1Y3R1cmUgZm9yIHRoZSBwcm92aWRlZCBuYW1lc3BhY2UgcGF0aCxcbiAqIGVuc3VyaW5nIHRoYXQgbmFtZXMgdGhhdCBhbHJlYWR5IGV4aXN0IGFyZSBub3Qgb3ZlcndyaXR0ZW4uIEZvclxuICogZXhhbXBsZTpcbiAqIFwiYS5iLmNcIiAtPiBhID0ge307YS5iPXt9O2EuYi5jPXt9O1xuICogVXNlZCBieSBnb29nLnByb3ZpZGUgYW5kIGdvb2cuZXhwb3J0U3ltYm9sLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgb2JqZWN0IHRoYXQgdGhpcyBmaWxlIGRlZmluZXMuXG4gKiBAcGFyYW0geyo9fSBvcHRfb2JqZWN0IHRoZSBvYmplY3QgdG8gZXhwb3NlIGF0IHRoZSBlbmQgb2YgdGhlIHBhdGguXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9vYmplY3RUb0V4cG9ydFRvIFRoZSBvYmplY3QgdG8gYWRkIHRoZSBwYXRoIHRvOyBkZWZhdWx0XG4gKiAgICAgaXMgfGdvb2cuZ2xvYmFsfC5cbiAqIEBwcml2YXRlXG4gKi9cbmdvb2cuZXhwb3J0UGF0aF8gPSBmdW5jdGlvbihuYW1lLCBvcHRfb2JqZWN0LCBvcHRfb2JqZWN0VG9FeHBvcnRUbykge1xuICB2YXIgcGFydHMgPSBuYW1lLnNwbGl0KCcuJyk7XG4gIHZhciBjdXIgPSBvcHRfb2JqZWN0VG9FeHBvcnRUbyB8fCBnb29nLmdsb2JhbDtcblxuICAvLyBJbnRlcm5ldCBFeHBsb3JlciBleGhpYml0cyBzdHJhbmdlIGJlaGF2aW9yIHdoZW4gdGhyb3dpbmcgZXJyb3JzIGZyb21cbiAgLy8gbWV0aG9kcyBleHRlcm5lZCBpbiB0aGlzIG1hbm5lci4gIFNlZSB0aGUgdGVzdEV4cG9ydFN5bWJvbEV4Y2VwdGlvbnMgaW5cbiAgLy8gYmFzZV90ZXN0Lmh0bWwgZm9yIGFuIGV4YW1wbGUuXG4gIGlmICghKHBhcnRzWzBdIGluIGN1cikgJiYgY3VyLmV4ZWNTY3JpcHQpIHtcbiAgICBjdXIuZXhlY1NjcmlwdCgndmFyICcgKyBwYXJ0c1swXSk7XG4gIH1cblxuICAvLyBDZXJ0YWluIGJyb3dzZXJzIGNhbm5vdCBwYXJzZSBjb2RlIGluIHRoZSBmb3JtIGZvcigoYSBpbiBiKTsgYzspO1xuICAvLyBUaGlzIHBhdHRlcm4gaXMgcHJvZHVjZWQgYnkgdGhlIEpTQ29tcGlsZXIgd2hlbiBpdCBjb2xsYXBzZXMgdGhlXG4gIC8vIHN0YXRlbWVudCBhYm92ZSBpbnRvIHRoZSBjb25kaXRpb25hbCBsb29wIGJlbG93LiBUbyBwcmV2ZW50IHRoaXMgZnJvbVxuICAvLyBoYXBwZW5pbmcsIHVzZSBhIGZvci1sb29wIGFuZCByZXNlcnZlIHRoZSBpbml0IGxvZ2ljIGFzIGJlbG93LlxuXG4gIC8vIFBhcmVudGhlc2VzIGFkZGVkIHRvIGVsaW1pbmF0ZSBzdHJpY3QgSlMgd2FybmluZyBpbiBGaXJlZm94LlxuICBmb3IgKHZhciBwYXJ0OyBwYXJ0cy5sZW5ndGggJiYgKHBhcnQgPSBwYXJ0cy5zaGlmdCgpKTspIHtcbiAgICBpZiAoIXBhcnRzLmxlbmd0aCAmJiBnb29nLmlzRGVmKG9wdF9vYmplY3QpKSB7XG4gICAgICAvLyBsYXN0IHBhcnQgYW5kIHdlIGhhdmUgYW4gb2JqZWN0OyB1c2UgaXRcbiAgICAgIGN1cltwYXJ0XSA9IG9wdF9vYmplY3Q7XG4gICAgfSBlbHNlIGlmIChjdXJbcGFydF0pIHtcbiAgICAgIGN1ciA9IGN1cltwYXJ0XTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VyID0gY3VyW3BhcnRdID0ge307XG4gICAgfVxuICB9XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgYmFzZWQgb24gaXRzIGZ1bGx5IHF1YWxpZmllZCBleHRlcm5hbCBuYW1lLiAgSWYgeW91IGFyZVxuICogdXNpbmcgYSBjb21waWxhdGlvbiBwYXNzIHRoYXQgcmVuYW1lcyBwcm9wZXJ0eSBuYW1lcyBiZXdhcmUgdGhhdCB1c2luZyB0aGlzXG4gKiBmdW5jdGlvbiB3aWxsIG5vdCBmaW5kIHJlbmFtZWQgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgZnVsbHkgcXVhbGlmaWVkIG5hbWUuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9vYmogVGhlIG9iamVjdCB3aXRoaW4gd2hpY2ggdG8gbG9vazsgZGVmYXVsdCBpc1xuICogICAgIHxnb29nLmdsb2JhbHwuXG4gKiBAcmV0dXJuIHs/fSBUaGUgdmFsdWUgKG9iamVjdCBvciBwcmltaXRpdmUpIG9yLCBpZiBub3QgZm91bmQsIG51bGwuXG4gKi9cbmdvb2cuZ2V0T2JqZWN0QnlOYW1lID0gZnVuY3Rpb24obmFtZSwgb3B0X29iaikge1xuICB2YXIgcGFydHMgPSBuYW1lLnNwbGl0KCcuJyk7XG4gIHZhciBjdXIgPSBvcHRfb2JqIHx8IGdvb2cuZ2xvYmFsO1xuICBmb3IgKHZhciBwYXJ0OyBwYXJ0ID0gcGFydHMuc2hpZnQoKTsgKSB7XG4gICAgaWYgKGdvb2cuaXNEZWZBbmROb3ROdWxsKGN1cltwYXJ0XSkpIHtcbiAgICAgIGN1ciA9IGN1cltwYXJ0XTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIHJldHVybiBjdXI7XG59O1xuXG5cbi8qKlxuICogR2xvYmFsaXplcyBhIHdob2xlIG5hbWVzcGFjZSwgc3VjaCBhcyBnb29nIG9yIGdvb2cubGFuZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBuYW1lc3BhY2UgdG8gZ2xvYmFsaXplLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfZ2xvYmFsIFRoZSBvYmplY3QgdG8gYWRkIHRoZSBwcm9wZXJ0aWVzIHRvLlxuICogQGRlcHJlY2F0ZWQgUHJvcGVydGllcyBtYXkgYmUgZXhwbGljaXRseSBleHBvcnRlZCB0byB0aGUgZ2xvYmFsIHNjb3BlLCBidXRcbiAqICAgICB0aGlzIHNob3VsZCBubyBsb25nZXIgYmUgZG9uZSBpbiBidWxrLlxuICovXG5nb29nLmdsb2JhbGl6ZSA9IGZ1bmN0aW9uKG9iaiwgb3B0X2dsb2JhbCkge1xuICB2YXIgZ2xvYmFsID0gb3B0X2dsb2JhbCB8fCBnb29nLmdsb2JhbDtcbiAgZm9yICh2YXIgeCBpbiBvYmopIHtcbiAgICBnbG9iYWxbeF0gPSBvYmpbeF07XG4gIH1cbn07XG5cblxuLyoqXG4gKiBBZGRzIGEgZGVwZW5kZW5jeSBmcm9tIGEgZmlsZSB0byB0aGUgZmlsZXMgaXQgcmVxdWlyZXMuXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsUGF0aCBUaGUgcGF0aCB0byB0aGUganMgZmlsZS5cbiAqIEBwYXJhbSB7QXJyYXl9IHByb3ZpZGVzIEFuIGFycmF5IG9mIHN0cmluZ3Mgd2l0aCB0aGUgbmFtZXMgb2YgdGhlIG9iamVjdHNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgZmlsZSBwcm92aWRlcy5cbiAqIEBwYXJhbSB7QXJyYXl9IHJlcXVpcmVzIEFuIGFycmF5IG9mIHN0cmluZ3Mgd2l0aCB0aGUgbmFtZXMgb2YgdGhlIG9iamVjdHNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgZmlsZSByZXF1aXJlcy5cbiAqL1xuZ29vZy5hZGREZXBlbmRlbmN5ID0gZnVuY3Rpb24ocmVsUGF0aCwgcHJvdmlkZXMsIHJlcXVpcmVzKSB7XG4gIGlmICghQ09NUElMRUQpIHtcbiAgICB2YXIgcHJvdmlkZSwgcmVxdWlyZTtcbiAgICB2YXIgcGF0aCA9IHJlbFBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgIHZhciBkZXBzID0gZ29vZy5kZXBlbmRlbmNpZXNfO1xuICAgIGZvciAodmFyIGkgPSAwOyBwcm92aWRlID0gcHJvdmlkZXNbaV07IGkrKykge1xuICAgICAgZGVwcy5uYW1lVG9QYXRoW3Byb3ZpZGVdID0gcGF0aDtcbiAgICAgIGlmICghKHBhdGggaW4gZGVwcy5wYXRoVG9OYW1lcykpIHtcbiAgICAgICAgZGVwcy5wYXRoVG9OYW1lc1twYXRoXSA9IHt9O1xuICAgICAgfVxuICAgICAgZGVwcy5wYXRoVG9OYW1lc1twYXRoXVtwcm92aWRlXSA9IHRydWU7XG4gICAgfVxuICAgIGZvciAodmFyIGogPSAwOyByZXF1aXJlID0gcmVxdWlyZXNbal07IGorKykge1xuICAgICAgaWYgKCEocGF0aCBpbiBkZXBzLnJlcXVpcmVzKSkge1xuICAgICAgICBkZXBzLnJlcXVpcmVzW3BhdGhdID0ge307XG4gICAgICB9XG4gICAgICBkZXBzLnJlcXVpcmVzW3BhdGhdW3JlcXVpcmVdID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn07XG5cblxuXG5cbi8vIE5PVEUobm5hemUpOiBUaGUgZGVidWcgRE9NIGxvYWRlciB3YXMgaW5jbHVkZWQgaW4gYmFzZS5qcyBhcyBhbiBvcmlnbmFsXG4vLyB3YXkgdG8gZG8gXCJkZWJ1Zy1tb2RlXCIgZGV2ZWxvcG1lbnQuICBUaGUgZGVwZW5kZW5jeSBzeXN0ZW0gY2FuIHNvbWV0aW1lc1xuLy8gYmUgY29uZnVzaW5nLCBhcyBjYW4gdGhlIGRlYnVnIERPTSBsb2FkZXIncyBhc3luY3Jvbm91cyBuYXR1cmUuXG4vL1xuLy8gV2l0aCB0aGUgRE9NIGxvYWRlciwgYSBjYWxsIHRvIGdvb2cucmVxdWlyZSgpIGlzIG5vdCBibG9ja2luZyAtLSB0aGVcbi8vIHNjcmlwdCB3aWxsIG5vdCBsb2FkIHVudGlsIHNvbWUgcG9pbnQgYWZ0ZXIgdGhlIGN1cnJlbnQgc2NyaXB0LiAgSWYgYVxuLy8gbmFtZXNwYWNlIGlzIG5lZWRlZCBhdCBydW50aW1lLCBpdCBuZWVkcyB0byBiZSBkZWZpbmVkIGluIGEgcHJldmlvdXNcbi8vIHNjcmlwdCwgb3IgbG9hZGVkIHZpYSByZXF1aXJlKCkgd2l0aCBpdHMgcmVnaXN0ZXJlZCBkZXBlbmRlbmNpZXMuXG4vLyBVc2VyLWRlZmluZWQgbmFtZXNwYWNlcyBtYXkgbmVlZCB0aGVpciBvd24gZGVwcyBmaWxlLiAgU2VlIGh0dHA6Ly9nby9qc19kZXBzLFxuLy8gaHR0cDovL2dvL2dlbmpzZGVwcywgb3IsIGV4dGVybmFsbHksIERlcHNXcml0ZXIuXG4vLyBodHRwOi8vY29kZS5nb29nbGUuY29tL2Nsb3N1cmUvbGlicmFyeS9kb2NzL2RlcHN3cml0ZXIuaHRtbFxuLy9cbi8vIEJlY2F1c2Ugb2YgbGVnYWN5IGNsaWVudHMsIHRoZSBET00gbG9hZGVyIGNhbid0IGJlIGVhc2lseSByZW1vdmVkIGZyb21cbi8vIGJhc2UuanMuICBXb3JrIGlzIGJlaW5nIGRvbmUgdG8gbWFrZSBpdCBkaXNhYmxlYWJsZSBvciByZXBsYWNlYWJsZSBmb3Jcbi8vIGRpZmZlcmVudCBlbnZpcm9ubWVudHMgKERPTS1sZXNzIEphdmFTY3JpcHQgaW50ZXJwcmV0ZXJzIGxpa2UgUmhpbm8gb3IgVjgsXG4vLyBmb3IgZXhhbXBsZSkuIFNlZSBib290c3RyYXAvIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuXG5cbi8qKlxuICogQGRlZmluZSB7Ym9vbGVhbn0gV2hldGhlciB0byBlbmFibGUgdGhlIGRlYnVnIGxvYWRlci5cbiAqXG4gKiBJZiBlbmFibGVkLCBhIGNhbGwgdG8gZ29vZy5yZXF1aXJlKCkgd2lsbCBhdHRlbXB0IHRvIGxvYWQgdGhlIG5hbWVzcGFjZSBieVxuICogYXBwZW5kaW5nIGEgc2NyaXB0IHRhZyB0byB0aGUgRE9NIChpZiB0aGUgbmFtZXNwYWNlIGhhcyBiZWVuIHJlZ2lzdGVyZWQpLlxuICpcbiAqIElmIGRpc2FibGVkLCBnb29nLnJlcXVpcmUoKSB3aWxsIHNpbXBseSBhc3NlcnQgdGhhdCB0aGUgbmFtZXNwYWNlIGhhcyBiZWVuXG4gKiBwcm92aWRlZCAoYW5kIGRlcGVuZCBvbiB0aGUgZmFjdCB0aGF0IHNvbWUgb3V0c2lkZSB0b29sIGNvcnJlY3RseSBvcmRlcmVkXG4gKiB0aGUgc2NyaXB0KS5cbiAqL1xuZ29vZy5FTkFCTEVfREVCVUdfTE9BREVSID0gdHJ1ZTtcblxuXG4vKipcbiAqIEltcGxlbWVudHMgYSBzeXN0ZW0gZm9yIHRoZSBkeW5hbWljIHJlc29sdXRpb24gb2YgZGVwZW5kZW5jaWVzXG4gKiB0aGF0IHdvcmtzIGluIHBhcmFsbGVsIHdpdGggdGhlIEJVSUxEIHN5c3RlbS4gTm90ZSB0aGF0IGFsbCBjYWxsc1xuICogdG8gZ29vZy5yZXF1aXJlIHdpbGwgYmUgc3RyaXBwZWQgYnkgdGhlIEpTQ29tcGlsZXIgd2hlbiB0aGVcbiAqIC0tY2xvc3VyZV9wYXNzIG9wdGlvbiBpcyB1c2VkLlxuICogQHNlZSBnb29nLnByb3ZpZGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIE5hbWVzcGFjZSB0byBpbmNsdWRlIChhcyB3YXMgZ2l2ZW4gaW4gZ29vZy5wcm92aWRlKCkpXG4gKiAgICAgaW4gdGhlIGZvcm0gXCJnb29nLnBhY2thZ2UucGFydFwiLlxuICovXG5nb29nLnJlcXVpcmUgPSBmdW5jdGlvbihuYW1lKSB7XG5cbiAgLy8gaWYgdGhlIG9iamVjdCBhbHJlYWR5IGV4aXN0cyB3ZSBkbyBub3QgbmVlZCBkbyBkbyBhbnl0aGluZ1xuICAvLyBUT0RPKGFydik6IElmIHdlIHN0YXJ0IHRvIHN1cHBvcnQgcmVxdWlyZSBiYXNlZCBvbiBmaWxlIG5hbWUgdGhpcyBoYXNcbiAgLy8gICAgICAgICAgICB0byBjaGFuZ2VcbiAgLy8gVE9ETyhhcnYpOiBJZiB3ZSBhbGxvdyBnb29nLmZvby4qIHRoaXMgaGFzIHRvIGNoYW5nZVxuICAvLyBUT0RPKGFydik6IElmIHdlIGltcGxlbWVudCBkeW5hbWljIGxvYWQgYWZ0ZXIgcGFnZSBsb2FkIHdlIHNob3VsZCBwcm9iYWJseVxuICAvLyAgICAgICAgICAgIG5vdCByZW1vdmUgdGhpcyBjb2RlIGZvciB0aGUgY29tcGlsZWQgb3V0cHV0XG4gIGlmICghQ09NUElMRUQpIHtcbiAgICBpZiAoZ29vZy5pc1Byb3ZpZGVkXyhuYW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChnb29nLkVOQUJMRV9ERUJVR19MT0FERVIpIHtcbiAgICAgIHZhciBwYXRoID0gZ29vZy5nZXRQYXRoRnJvbURlcHNfKG5hbWUpO1xuICAgICAgaWYgKHBhdGgpIHtcbiAgICAgICAgZ29vZy5pbmNsdWRlZF9bcGF0aF0gPSB0cnVlO1xuICAgICAgICBnb29nLndyaXRlU2NyaXB0c18oKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBlcnJvck1lc3NhZ2UgPSAnZ29vZy5yZXF1aXJlIGNvdWxkIG5vdCBmaW5kOiAnICsgbmFtZTtcbiAgICBpZiAoZ29vZy5nbG9iYWwuY29uc29sZSkge1xuICAgICAgZ29vZy5nbG9iYWwuY29uc29sZVsnZXJyb3InXShlcnJvck1lc3NhZ2UpO1xuICAgIH1cblxuXG4gICAgICB0aHJvdyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuXG4gIH1cbn07XG5cblxuLyoqXG4gKiBQYXRoIGZvciBpbmNsdWRlZCBzY3JpcHRzXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5nb29nLmJhc2VQYXRoID0gJyc7XG5cblxuLyoqXG4gKiBBIGhvb2sgZm9yIG92ZXJyaWRpbmcgdGhlIGJhc2UgcGF0aC5cbiAqIEB0eXBlIHtzdHJpbmd8dW5kZWZpbmVkfVxuICovXG5nb29nLmdsb2JhbC5DTE9TVVJFX0JBU0VfUEFUSDtcblxuXG4vKipcbiAqIFdoZXRoZXIgdG8gd3JpdGUgb3V0IENsb3N1cmUncyBkZXBzIGZpbGUuIEJ5IGRlZmF1bHQsXG4gKiB0aGUgZGVwcyBhcmUgd3JpdHRlbi5cbiAqIEB0eXBlIHtib29sZWFufHVuZGVmaW5lZH1cbiAqL1xuZ29vZy5nbG9iYWwuQ0xPU1VSRV9OT19ERVBTO1xuXG5cbi8qKlxuICogQSBmdW5jdGlvbiB0byBpbXBvcnQgYSBzaW5nbGUgc2NyaXB0LiBUaGlzIGlzIG1lYW50IHRvIGJlIG92ZXJyaWRkZW4gd2hlblxuICogQ2xvc3VyZSBpcyBiZWluZyBydW4gaW4gbm9uLUhUTUwgY29udGV4dHMsIHN1Y2ggYXMgd2ViIHdvcmtlcnMuIEl0J3MgZGVmaW5lZFxuICogaW4gdGhlIGdsb2JhbCBzY29wZSBzbyB0aGF0IGl0IGNhbiBiZSBzZXQgYmVmb3JlIGJhc2UuanMgaXMgbG9hZGVkLCB3aGljaFxuICogYWxsb3dzIGRlcHMuanMgdG8gYmUgaW1wb3J0ZWQgcHJvcGVybHkuXG4gKlxuICogVGhlIGZ1bmN0aW9uIGlzIHBhc3NlZCB0aGUgc2NyaXB0IHNvdXJjZSwgd2hpY2ggaXMgYSByZWxhdGl2ZSBVUkkuIEl0IHNob3VsZFxuICogcmV0dXJuIHRydWUgaWYgdGhlIHNjcmlwdCB3YXMgaW1wb3J0ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZ29vZy5nbG9iYWwuQ0xPU1VSRV9JTVBPUlRfU0NSSVBUO1xuXG5cbi8qKlxuICogTnVsbCBmdW5jdGlvbiB1c2VkIGZvciBkZWZhdWx0IHZhbHVlcyBvZiBjYWxsYmFja3MsIGV0Yy5cbiAqIEByZXR1cm4ge3ZvaWR9IE5vdGhpbmcuXG4gKi9cbmdvb2cubnVsbEZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7fTtcblxuXG4vKipcbiAqIFRoZSBpZGVudGl0eSBmdW5jdGlvbi4gUmV0dXJucyBpdHMgZmlyc3QgYXJndW1lbnQuXG4gKlxuICogQHBhcmFtIHsqPX0gb3B0X3JldHVyblZhbHVlIFRoZSBzaW5nbGUgdmFsdWUgdGhhdCB3aWxsIGJlIHJldHVybmVkLlxuICogQHBhcmFtIHsuLi4qfSB2YXJfYXJncyBPcHRpb25hbCB0cmFpbGluZyBhcmd1bWVudHMuIFRoZXNlIGFyZSBpZ25vcmVkLlxuICogQHJldHVybiB7P30gVGhlIGZpcnN0IGFyZ3VtZW50LiBXZSBjYW4ndCBrbm93IHRoZSB0eXBlIC0tIGp1c3QgcGFzcyBpdCBhbG9uZ1xuICogICAgICB3aXRob3V0IHR5cGUuXG4gKiBAZGVwcmVjYXRlZCBVc2UgZ29vZy5mdW5jdGlvbnMuaWRlbnRpdHkgaW5zdGVhZC5cbiAqL1xuZ29vZy5pZGVudGl0eUZ1bmN0aW9uID0gZnVuY3Rpb24ob3B0X3JldHVyblZhbHVlLCB2YXJfYXJncykge1xuICByZXR1cm4gb3B0X3JldHVyblZhbHVlO1xufTtcblxuXG4vKipcbiAqIFdoZW4gZGVmaW5pbmcgYSBjbGFzcyBGb28gd2l0aCBhbiBhYnN0cmFjdCBtZXRob2QgYmFyKCksIHlvdSBjYW4gZG86XG4gKlxuICogRm9vLnByb3RvdHlwZS5iYXIgPSBnb29nLmFic3RyYWN0TWV0aG9kXG4gKlxuICogTm93IGlmIGEgc3ViY2xhc3Mgb2YgRm9vIGZhaWxzIHRvIG92ZXJyaWRlIGJhcigpLCBhbiBlcnJvclxuICogd2lsbCBiZSB0aHJvd24gd2hlbiBiYXIoKSBpcyBpbnZva2VkLlxuICpcbiAqIE5vdGU6IFRoaXMgZG9lcyBub3QgdGFrZSB0aGUgbmFtZSBvZiB0aGUgZnVuY3Rpb24gdG8gb3ZlcnJpZGUgYXNcbiAqIGFuIGFyZ3VtZW50IGJlY2F1c2UgdGhhdCB3b3VsZCBtYWtlIGl0IG1vcmUgZGlmZmljdWx0IHRvIG9iZnVzY2F0ZVxuICogb3VyIEphdmFTY3JpcHQgY29kZS5cbiAqXG4gKiBAdHlwZSB7IUZ1bmN0aW9ufVxuICogQHRocm93cyB7RXJyb3J9IHdoZW4gaW52b2tlZCB0byBpbmRpY2F0ZSB0aGUgbWV0aG9kIHNob3VsZCBiZVxuICogICBvdmVycmlkZGVuLlxuICovXG5nb29nLmFic3RyYWN0TWV0aG9kID0gZnVuY3Rpb24oKSB7XG4gIHRocm93IEVycm9yKCd1bmltcGxlbWVudGVkIGFic3RyYWN0IG1ldGhvZCcpO1xufTtcblxuXG4vKipcbiAqIEFkZHMgYSB7QGNvZGUgZ2V0SW5zdGFuY2V9IHN0YXRpYyBtZXRob2QgdGhhdCBhbHdheXMgcmV0dXJuIHRoZSBzYW1lIGluc3RhbmNlXG4gKiBvYmplY3QuXG4gKiBAcGFyYW0geyFGdW5jdGlvbn0gY3RvciBUaGUgY29uc3RydWN0b3IgZm9yIHRoZSBjbGFzcyB0byBhZGQgdGhlIHN0YXRpY1xuICogICAgIG1ldGhvZCB0by5cbiAqL1xuZ29vZy5hZGRTaW5nbGV0b25HZXR0ZXIgPSBmdW5jdGlvbihjdG9yKSB7XG4gIGN0b3IuZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoY3Rvci5pbnN0YW5jZV8pIHtcbiAgICAgIHJldHVybiBjdG9yLmluc3RhbmNlXztcbiAgICB9XG4gICAgaWYgKGdvb2cuREVCVUcpIHtcbiAgICAgIC8vIE5PVEU6IEpTQ29tcGlsZXIgY2FuJ3Qgb3B0aW1pemUgYXdheSBBcnJheSNwdXNoLlxuICAgICAgZ29vZy5pbnN0YW50aWF0ZWRTaW5nbGV0b25zX1tnb29nLmluc3RhbnRpYXRlZFNpbmdsZXRvbnNfLmxlbmd0aF0gPSBjdG9yO1xuICAgIH1cbiAgICByZXR1cm4gY3Rvci5pbnN0YW5jZV8gPSBuZXcgY3RvcjtcbiAgfTtcbn07XG5cblxuLyoqXG4gKiBBbGwgc2luZ2xldG9uIGNsYXNzZXMgdGhhdCBoYXZlIGJlZW4gaW5zdGFudGlhdGVkLCBmb3IgdGVzdGluZy4gRG9uJ3QgcmVhZFxuICogaXQgZGlyZWN0bHksIHVzZSB0aGUge0Bjb2RlIGdvb2cudGVzdGluZy5zaW5nbGV0b259IG1vZHVsZS4gVGhlIGNvbXBpbGVyXG4gKiByZW1vdmVzIHRoaXMgdmFyaWFibGUgaWYgdW51c2VkLlxuICogQHR5cGUgeyFBcnJheS48IUZ1bmN0aW9uPn1cbiAqIEBwcml2YXRlXG4gKi9cbmdvb2cuaW5zdGFudGlhdGVkU2luZ2xldG9uc18gPSBbXTtcblxuXG5pZiAoIUNPTVBJTEVEICYmIGdvb2cuRU5BQkxFX0RFQlVHX0xPQURFUikge1xuICAvKipcbiAgICogT2JqZWN0IHVzZWQgdG8ga2VlcCB0cmFjayBvZiB1cmxzIHRoYXQgaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQuIFRoaXNcbiAgICogcmVjb3JkIGFsbG93cyB0aGUgcHJldmVudGlvbiBvZiBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnb29nLmluY2x1ZGVkXyA9IHt9O1xuXG5cbiAgLyoqXG4gICAqIFRoaXMgb2JqZWN0IGlzIHVzZWQgdG8ga2VlcCB0cmFjayBvZiBkZXBlbmRlbmNpZXMgYW5kIG90aGVyIGRhdGEgdGhhdCBpc1xuICAgKiB1c2VkIGZvciBsb2FkaW5nIHNjcmlwdHNcbiAgICogQHByaXZhdGVcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGdvb2cuZGVwZW5kZW5jaWVzXyA9IHtcbiAgICBwYXRoVG9OYW1lczoge30sIC8vIDEgdG8gbWFueVxuICAgIG5hbWVUb1BhdGg6IHt9LCAvLyAxIHRvIDFcbiAgICByZXF1aXJlczoge30sIC8vIDEgdG8gbWFueVxuICAgIC8vIHVzZWQgd2hlbiByZXNvbHZpbmcgZGVwZW5kZW5jaWVzIHRvIHByZXZlbnQgdXMgZnJvbVxuICAgIC8vIHZpc2l0aW5nIHRoZSBmaWxlIHR3aWNlXG4gICAgdmlzaXRlZDoge30sXG4gICAgd3JpdHRlbjoge30gLy8gdXNlZCB0byBrZWVwIHRyYWNrIG9mIHNjcmlwdCBmaWxlcyB3ZSBoYXZlIHdyaXR0ZW5cbiAgfTtcblxuXG4gIC8qKlxuICAgKiBUcmllcyB0byBkZXRlY3Qgd2hldGhlciBpcyBpbiB0aGUgY29udGV4dCBvZiBhbiBIVE1MIGRvY3VtZW50LlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIGl0IGxvb2tzIGxpa2UgSFRNTCBkb2N1bWVudC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdvb2cuaW5IdG1sRG9jdW1lbnRfID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRvYyA9IGdvb2cuZ2xvYmFsLmRvY3VtZW50O1xuICAgIHJldHVybiB0eXBlb2YgZG9jICE9ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgICd3cml0ZScgaW4gZG9jOyAgLy8gWFVMRG9jdW1lbnQgbWlzc2VzIHdyaXRlLlxuICB9O1xuXG5cbiAgLyoqXG4gICAqIFRyaWVzIHRvIGRldGVjdCB0aGUgYmFzZSBwYXRoIG9mIHRoZSBiYXNlLmpzIHNjcmlwdCB0aGF0IGJvb3RzdHJhcHMgQ2xvc3VyZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy5maW5kQmFzZVBhdGhfID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGdvb2cuZ2xvYmFsLkNMT1NVUkVfQkFTRV9QQVRIKSB7XG4gICAgICBnb29nLmJhc2VQYXRoID0gZ29vZy5nbG9iYWwuQ0xPU1VSRV9CQVNFX1BBVEg7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmICghZ29vZy5pbkh0bWxEb2N1bWVudF8oKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgZG9jID0gZ29vZy5nbG9iYWwuZG9jdW1lbnQ7XG4gICAgdmFyIHNjcmlwdHMgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpO1xuICAgIC8vIFNlYXJjaCBiYWNrd2FyZHMgc2luY2UgdGhlIGN1cnJlbnQgc2NyaXB0IGlzIGluIGFsbW9zdCBhbGwgY2FzZXMgdGhlIG9uZVxuICAgIC8vIHRoYXQgaGFzIGJhc2UuanMuXG4gICAgZm9yICh2YXIgaSA9IHNjcmlwdHMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHZhciBzcmMgPSBzY3JpcHRzW2ldLnNyYztcbiAgICAgIHZhciBxbWFyayA9IHNyYy5sYXN0SW5kZXhPZignPycpO1xuICAgICAgdmFyIGwgPSBxbWFyayA9PSAtMSA/IHNyYy5sZW5ndGggOiBxbWFyaztcbiAgICAgIGlmIChzcmMuc3Vic3RyKGwgLSA3LCA3KSA9PSAnYmFzZS5qcycpIHtcbiAgICAgICAgZ29vZy5iYXNlUGF0aCA9IHNyYy5zdWJzdHIoMCwgbCAtIDcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG5cbiAgLyoqXG4gICAqIEltcG9ydHMgYSBzY3JpcHQgaWYsIGFuZCBvbmx5IGlmLCB0aGF0IHNjcmlwdCBoYXNuJ3QgYWxyZWFkeSBiZWVuIGltcG9ydGVkLlxuICAgKiAoTXVzdCBiZSBjYWxsZWQgYXQgZXhlY3V0aW9uIHRpbWUpXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzcmMgU2NyaXB0IHNvdXJjZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdvb2cuaW1wb3J0U2NyaXB0XyA9IGZ1bmN0aW9uKHNyYykge1xuICAgIHZhciBpbXBvcnRTY3JpcHQgPSBnb29nLmdsb2JhbC5DTE9TVVJFX0lNUE9SVF9TQ1JJUFQgfHxcbiAgICAgICAgZ29vZy53cml0ZVNjcmlwdFRhZ187XG4gICAgaWYgKCFnb29nLmRlcGVuZGVuY2llc18ud3JpdHRlbltzcmNdICYmIGltcG9ydFNjcmlwdChzcmMpKSB7XG4gICAgICBnb29nLmRlcGVuZGVuY2llc18ud3JpdHRlbltzcmNdID0gdHJ1ZTtcbiAgICB9XG4gIH07XG5cblxuICAvKipcbiAgICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIGltcG9ydCBmdW5jdGlvbi4gV3JpdGVzIGEgc2NyaXB0IHRhZyB0b1xuICAgKiBpbXBvcnQgdGhlIHNjcmlwdC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNyYyBUaGUgc2NyaXB0IHNvdXJjZS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc2NyaXB0IHdhcyBpbXBvcnRlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy53cml0ZVNjcmlwdFRhZ18gPSBmdW5jdGlvbihzcmMpIHtcbiAgICBpZiAoZ29vZy5pbkh0bWxEb2N1bWVudF8oKSkge1xuICAgICAgdmFyIGRvYyA9IGdvb2cuZ2xvYmFsLmRvY3VtZW50O1xuICAgICAgZG9jLndyaXRlKFxuICAgICAgICAgICc8c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIiBzcmM9XCInICsgc3JjICsgJ1wiPjwvJyArICdzY3JpcHQ+Jyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfTtcblxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyBkZXBlbmRlbmNpZXMgYmFzZWQgb24gdGhlIGRlcGVuZGVuY2llcyBhZGRlZCB1c2luZyBhZGREZXBlbmRlbmN5XG4gICAqIGFuZCBjYWxscyBpbXBvcnRTY3JpcHRfIGluIHRoZSBjb3JyZWN0IG9yZGVyLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy53cml0ZVNjcmlwdHNfID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gdGhlIHNjcmlwdHMgd2UgbmVlZCB0byB3cml0ZSB0aGlzIHRpbWVcbiAgICB2YXIgc2NyaXB0cyA9IFtdO1xuICAgIHZhciBzZWVuU2NyaXB0ID0ge307XG4gICAgdmFyIGRlcHMgPSBnb29nLmRlcGVuZGVuY2llc187XG5cbiAgICBmdW5jdGlvbiB2aXNpdE5vZGUocGF0aCkge1xuICAgICAgaWYgKHBhdGggaW4gZGVwcy53cml0dGVuKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gd2UgaGF2ZSBhbHJlYWR5IHZpc2l0ZWQgdGhpcyBvbmUuIFdlIGNhbiBnZXQgaGVyZSBpZiB3ZSBoYXZlIGN5Y2xpY1xuICAgICAgLy8gZGVwZW5kZW5jaWVzXG4gICAgICBpZiAocGF0aCBpbiBkZXBzLnZpc2l0ZWQpIHtcbiAgICAgICAgaWYgKCEocGF0aCBpbiBzZWVuU2NyaXB0KSkge1xuICAgICAgICAgIHNlZW5TY3JpcHRbcGF0aF0gPSB0cnVlO1xuICAgICAgICAgIHNjcmlwdHMucHVzaChwYXRoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGRlcHMudmlzaXRlZFtwYXRoXSA9IHRydWU7XG5cbiAgICAgIGlmIChwYXRoIGluIGRlcHMucmVxdWlyZXMpIHtcbiAgICAgICAgZm9yICh2YXIgcmVxdWlyZU5hbWUgaW4gZGVwcy5yZXF1aXJlc1twYXRoXSkge1xuICAgICAgICAgIC8vIElmIHRoZSByZXF1aXJlZCBuYW1lIGlzIGRlZmluZWQsIHdlIGFzc3VtZSB0aGF0IGl0IHdhcyBhbHJlYWR5XG4gICAgICAgICAgLy8gYm9vdHN0cmFwcGVkIGJ5IG90aGVyIG1lYW5zLlxuICAgICAgICAgIGlmICghZ29vZy5pc1Byb3ZpZGVkXyhyZXF1aXJlTmFtZSkpIHtcbiAgICAgICAgICAgIGlmIChyZXF1aXJlTmFtZSBpbiBkZXBzLm5hbWVUb1BhdGgpIHtcbiAgICAgICAgICAgICAgdmlzaXROb2RlKGRlcHMubmFtZVRvUGF0aFtyZXF1aXJlTmFtZV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ1VuZGVmaW5lZCBuYW1lVG9QYXRoIGZvciAnICsgcmVxdWlyZU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIShwYXRoIGluIHNlZW5TY3JpcHQpKSB7XG4gICAgICAgIHNlZW5TY3JpcHRbcGF0aF0gPSB0cnVlO1xuICAgICAgICBzY3JpcHRzLnB1c2gocGF0aCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgcGF0aCBpbiBnb29nLmluY2x1ZGVkXykge1xuICAgICAgaWYgKCFkZXBzLndyaXR0ZW5bcGF0aF0pIHtcbiAgICAgICAgdmlzaXROb2RlKHBhdGgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2NyaXB0cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHNjcmlwdHNbaV0pIHtcbiAgICAgICAgZ29vZy5pbXBvcnRTY3JpcHRfKGdvb2cuYmFzZVBhdGggKyBzY3JpcHRzW2ldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IEVycm9yKCdVbmRlZmluZWQgc2NyaXB0IGlucHV0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG5cbiAgLyoqXG4gICAqIExvb2tzIGF0IHRoZSBkZXBlbmRlbmN5IHJ1bGVzIGFuZCB0cmllcyB0byBkZXRlcm1pbmUgdGhlIHNjcmlwdCBmaWxlIHRoYXRcbiAgICogZnVsZmlsbHMgYSBwYXJ0aWN1bGFyIHJ1bGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBydWxlIEluIHRoZSBmb3JtIGdvb2cubmFtZXNwYWNlLkNsYXNzIG9yIHByb2plY3Quc2NyaXB0LlxuICAgKiBAcmV0dXJuIHs/c3RyaW5nfSBVcmwgY29ycmVzcG9uZGluZyB0byB0aGUgcnVsZSwgb3IgbnVsbC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdvb2cuZ2V0UGF0aEZyb21EZXBzXyA9IGZ1bmN0aW9uKHJ1bGUpIHtcbiAgICBpZiAocnVsZSBpbiBnb29nLmRlcGVuZGVuY2llc18ubmFtZVRvUGF0aCkge1xuICAgICAgcmV0dXJuIGdvb2cuZGVwZW5kZW5jaWVzXy5uYW1lVG9QYXRoW3J1bGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgZ29vZy5maW5kQmFzZVBhdGhfKCk7XG5cbiAgLy8gQWxsb3cgcHJvamVjdHMgdG8gbWFuYWdlIHRoZSBkZXBzIGZpbGVzIHRoZW1zZWx2ZXMuXG4gIGlmICghZ29vZy5nbG9iYWwuQ0xPU1VSRV9OT19ERVBTKSB7XG4gICAgZ29vZy5pbXBvcnRTY3JpcHRfKGdvb2cuYmFzZVBhdGggKyAnZGVwcy5qcycpO1xuICB9XG59XG5cblxuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTGFuZ3VhZ2UgRW5oYW5jZW1lbnRzXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5cbi8qKlxuICogVGhpcyBpcyBhIFwiZml4ZWRcIiB2ZXJzaW9uIG9mIHRoZSB0eXBlb2Ygb3BlcmF0b3IuICBJdCBkaWZmZXJzIGZyb20gdGhlIHR5cGVvZlxuICogb3BlcmF0b3IgaW4gc3VjaCBhIHdheSB0aGF0IG51bGwgcmV0dXJucyAnbnVsbCcgYW5kIGFycmF5cyByZXR1cm4gJ2FycmF5Jy5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGdldCB0aGUgdHlwZSBvZi5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIG5hbWUgb2YgdGhlIHR5cGUuXG4gKi9cbmdvb2cudHlwZU9mID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIHMgPSB0eXBlb2YgdmFsdWU7XG4gIGlmIChzID09ICdvYmplY3QnKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICAvLyBDaGVjayB0aGVzZSBmaXJzdCwgc28gd2UgY2FuIGF2b2lkIGNhbGxpbmcgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyBpZlxuICAgICAgLy8gcG9zc2libGUuXG4gICAgICAvL1xuICAgICAgLy8gSUUgaW1wcm9wZXJseSBtYXJzaGFscyB0eWVwb2YgYWNyb3NzIGV4ZWN1dGlvbiBjb250ZXh0cywgYnV0IGFcbiAgICAgIC8vIGNyb3NzLWNvbnRleHQgb2JqZWN0IHdpbGwgc3RpbGwgcmV0dXJuIGZhbHNlIGZvciBcImluc3RhbmNlb2YgT2JqZWN0XCIuXG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICByZXR1cm4gJ2FycmF5JztcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICB9XG5cbiAgICAgIC8vIEhBQ0s6IEluIG9yZGVyIHRvIHVzZSBhbiBPYmplY3QgcHJvdG90eXBlIG1ldGhvZCBvbiB0aGUgYXJiaXRyYXJ5XG4gICAgICAvLyAgIHZhbHVlLCB0aGUgY29tcGlsZXIgcmVxdWlyZXMgdGhlIHZhbHVlIGJlIGNhc3QgdG8gdHlwZSBPYmplY3QsXG4gICAgICAvLyAgIGV2ZW4gdGhvdWdoIHRoZSBFQ01BIHNwZWMgZXhwbGljaXRseSBhbGxvd3MgaXQuXG4gICAgICB2YXIgY2xhc3NOYW1lID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKFxuICAgICAgICAgIC8qKiBAdHlwZSB7T2JqZWN0fSAqLyAodmFsdWUpKTtcbiAgICAgIC8vIEluIEZpcmVmb3ggMy42LCBhdHRlbXB0aW5nIHRvIGFjY2VzcyBpZnJhbWUgd2luZG93IG9iamVjdHMnIGxlbmd0aFxuICAgICAgLy8gcHJvcGVydHkgdGhyb3dzIGFuIE5TX0VSUk9SX0ZBSUxVUkUsIHNvIHdlIG5lZWQgdG8gc3BlY2lhbC1jYXNlIGl0XG4gICAgICAvLyBoZXJlLlxuICAgICAgaWYgKGNsYXNzTmFtZSA9PSAnW29iamVjdCBXaW5kb3ddJykge1xuICAgICAgICByZXR1cm4gJ29iamVjdCc7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGNhbm5vdCBhbHdheXMgdXNlIGNvbnN0cnVjdG9yID09IEFycmF5IG9yIGluc3RhbmNlb2YgQXJyYXkgYmVjYXVzZVxuICAgICAgLy8gZGlmZmVyZW50IGZyYW1lcyBoYXZlIGRpZmZlcmVudCBBcnJheSBvYmplY3RzLiBJbiBJRTYsIGlmIHRoZSBpZnJhbWVcbiAgICAgIC8vIHdoZXJlIHRoZSBhcnJheSB3YXMgY3JlYXRlZCBpcyBkZXN0cm95ZWQsIHRoZSBhcnJheSBsb3NlcyBpdHNcbiAgICAgIC8vIHByb3RvdHlwZS4gVGhlbiBkZXJlZmVyZW5jaW5nIHZhbC5zcGxpY2UgaGVyZSB0aHJvd3MgYW4gZXhjZXB0aW9uLCBzb1xuICAgICAgLy8gd2UgY2FuJ3QgdXNlIGdvb2cuaXNGdW5jdGlvbi4gQ2FsbGluZyB0eXBlb2YgZGlyZWN0bHkgcmV0dXJucyAndW5rbm93bidcbiAgICAgIC8vIHNvIHRoYXQgd2lsbCB3b3JrLiBJbiB0aGlzIGNhc2UsIHRoaXMgZnVuY3Rpb24gd2lsbCByZXR1cm4gZmFsc2UgYW5kXG4gICAgICAvLyBtb3N0IGFycmF5IGZ1bmN0aW9ucyB3aWxsIHN0aWxsIHdvcmsgYmVjYXVzZSB0aGUgYXJyYXkgaXMgc3RpbGxcbiAgICAgIC8vIGFycmF5LWxpa2UgKHN1cHBvcnRzIGxlbmd0aCBhbmQgW10pIGV2ZW4gdGhvdWdoIGl0IGhhcyBsb3N0IGl0c1xuICAgICAgLy8gcHJvdG90eXBlLlxuICAgICAgLy8gTWFyayBNaWxsZXIgbm90aWNlZCB0aGF0IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcbiAgICAgIC8vIGFsbG93cyBhY2Nlc3MgdG8gdGhlIHVuZm9yZ2VhYmxlIFtbQ2xhc3NdXSBwcm9wZXJ0eS5cbiAgICAgIC8vICAxNS4yLjQuMiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nICggKVxuICAgICAgLy8gIFdoZW4gdGhlIHRvU3RyaW5nIG1ldGhvZCBpcyBjYWxsZWQsIHRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICAgICAgLy8gICAgICAxLiBHZXQgdGhlIFtbQ2xhc3NdXSBwcm9wZXJ0eSBvZiB0aGlzIG9iamVjdC5cbiAgICAgIC8vICAgICAgMi4gQ29tcHV0ZSBhIHN0cmluZyB2YWx1ZSBieSBjb25jYXRlbmF0aW5nIHRoZSB0aHJlZSBzdHJpbmdzXG4gICAgICAvLyAgICAgICAgIFwiW29iamVjdCBcIiwgUmVzdWx0KDEpLCBhbmQgXCJdXCIuXG4gICAgICAvLyAgICAgIDMuIFJldHVybiBSZXN1bHQoMikuXG4gICAgICAvLyBhbmQgdGhpcyBiZWhhdmlvciBzdXJ2aXZlcyB0aGUgZGVzdHJ1Y3Rpb24gb2YgdGhlIGV4ZWN1dGlvbiBjb250ZXh0LlxuICAgICAgaWYgKChjbGFzc05hbWUgPT0gJ1tvYmplY3QgQXJyYXldJyB8fFxuICAgICAgICAgICAvLyBJbiBJRSBhbGwgbm9uIHZhbHVlIHR5cGVzIGFyZSB3cmFwcGVkIGFzIG9iamVjdHMgYWNyb3NzIHdpbmRvd1xuICAgICAgICAgICAvLyBib3VuZGFyaWVzIChub3QgaWZyYW1lIHRob3VnaCkgc28gd2UgaGF2ZSB0byBkbyBvYmplY3QgZGV0ZWN0aW9uXG4gICAgICAgICAgIC8vIGZvciB0aGlzIGVkZ2UgY2FzZVxuICAgICAgICAgICB0eXBlb2YgdmFsdWUubGVuZ3RoID09ICdudW1iZXInICYmXG4gICAgICAgICAgIHR5cGVvZiB2YWx1ZS5zcGxpY2UgIT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgdHlwZW9mIHZhbHVlLnByb3BlcnR5SXNFbnVtZXJhYmxlICE9ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgICF2YWx1ZS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgnc3BsaWNlJylcblxuICAgICAgICAgICkpIHtcbiAgICAgICAgcmV0dXJuICdhcnJheSc7XG4gICAgICB9XG4gICAgICAvLyBIQUNLOiBUaGVyZSBpcyBzdGlsbCBhbiBhcnJheSBjYXNlIHRoYXQgZmFpbHMuXG4gICAgICAvLyAgICAgZnVuY3Rpb24gQXJyYXlJbXBvc3RvcigpIHt9XG4gICAgICAvLyAgICAgQXJyYXlJbXBvc3Rvci5wcm90b3R5cGUgPSBbXTtcbiAgICAgIC8vICAgICB2YXIgaW1wb3N0b3IgPSBuZXcgQXJyYXlJbXBvc3RvcjtcbiAgICAgIC8vIHRoaXMgY2FuIGJlIGZpeGVkIGJ5IGdldHRpbmcgcmlkIG9mIHRoZSBmYXN0IHBhdGhcbiAgICAgIC8vICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSBhbmQgc29sZWx5IHJlbHlpbmcgb25cbiAgICAgIC8vICh2YWx1ZSAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLnZhbGwodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nKVxuICAgICAgLy8gYnV0IHRoYXQgd291bGQgcmVxdWlyZSBtYW55IG1vcmUgZnVuY3Rpb24gY2FsbHMgYW5kIGlzIG5vdCB3YXJyYW50ZWRcbiAgICAgIC8vIHVubGVzcyBjbG9zdXJlIGNvZGUgaXMgcmVjZWl2aW5nIG9iamVjdHMgZnJvbSB1bnRydXN0ZWQgc291cmNlcy5cblxuICAgICAgLy8gSUUgaW4gY3Jvc3Mtd2luZG93IGNhbGxzIGRvZXMgbm90IGNvcnJlY3RseSBtYXJzaGFsIHRoZSBmdW5jdGlvbiB0eXBlXG4gICAgICAvLyAoaXQgYXBwZWFycyBqdXN0IGFzIGFuIG9iamVjdCkgc28gd2UgY2Fubm90IHVzZSBqdXN0IHR5cGVvZiB2YWwgPT1cbiAgICAgIC8vICdmdW5jdGlvbicuIEhvd2V2ZXIsIGlmIHRoZSBvYmplY3QgaGFzIGEgY2FsbCBwcm9wZXJ0eSwgaXQgaXMgYVxuICAgICAgLy8gZnVuY3Rpb24uXG4gICAgICBpZiAoKGNsYXNzTmFtZSA9PSAnW29iamVjdCBGdW5jdGlvbl0nIHx8XG4gICAgICAgICAgdHlwZW9mIHZhbHVlLmNhbGwgIT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICB0eXBlb2YgdmFsdWUucHJvcGVydHlJc0VudW1lcmFibGUgIT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAhdmFsdWUucHJvcGVydHlJc0VudW1lcmFibGUoJ2NhbGwnKSkpIHtcbiAgICAgICAgcmV0dXJuICdmdW5jdGlvbic7XG4gICAgICB9XG5cblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ251bGwnO1xuICAgIH1cblxuICB9IGVsc2UgaWYgKHMgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUuY2FsbCA9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEluIFNhZmFyaSB0eXBlb2Ygbm9kZUxpc3QgcmV0dXJucyAnZnVuY3Rpb24nLCBhbmQgb24gRmlyZWZveFxuICAgIC8vIHR5cGVvZiBiZWhhdmVzIHNpbWlsYXJseSBmb3IgSFRNTHtBcHBsZXQsRW1iZWQsT2JqZWN0fUVsZW1lbnRzXG4gICAgLy8gYW5kIFJlZ0V4cHMuICBXZSB3b3VsZCBsaWtlIHRvIHJldHVybiBvYmplY3QgZm9yIHRob3NlIGFuZCB3ZSBjYW5cbiAgICAvLyBkZXRlY3QgYW4gaW52YWxpZCBmdW5jdGlvbiBieSBtYWtpbmcgc3VyZSB0aGF0IHRoZSBmdW5jdGlvblxuICAgIC8vIG9iamVjdCBoYXMgYSBjYWxsIG1ldGhvZC5cbiAgICByZXR1cm4gJ29iamVjdCc7XG4gIH1cbiAgcmV0dXJuIHM7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgbm90IHx1bmRlZmluZWR8LlxuICogV0FSTklORzogRG8gbm90IHVzZSB0aGlzIHRvIHRlc3QgaWYgYW4gb2JqZWN0IGhhcyBhIHByb3BlcnR5LiBVc2UgdGhlIGluXG4gKiBvcGVyYXRvciBpbnN0ZWFkLiAgQWRkaXRpb25hbGx5LCB0aGlzIGZ1bmN0aW9uIGFzc3VtZXMgdGhhdCB0aGUgZ2xvYmFsXG4gKiB1bmRlZmluZWQgdmFyaWFibGUgaGFzIG5vdCBiZWVuIHJlZGVmaW5lZC5cbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGRlZmluZWQuXG4gKi9cbmdvb2cuaXNEZWYgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gdW5kZWZpbmVkO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIHxudWxsfFxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgbnVsbC5cbiAqL1xuZ29vZy5pc051bGwgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHZhbCA9PT0gbnVsbDtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBkZWZpbmVkIGFuZCBub3QgbnVsbFxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgZGVmaW5lZCBhbmQgbm90IG51bGwuXG4gKi9cbmdvb2cuaXNEZWZBbmROb3ROdWxsID0gZnVuY3Rpb24odmFsKSB7XG4gIC8vIE5vdGUgdGhhdCB1bmRlZmluZWQgPT0gbnVsbC5cbiAgcmV0dXJuIHZhbCAhPSBudWxsO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGFuIGFycmF5XG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBhbiBhcnJheS5cbiAqL1xuZ29vZy5pc0FycmF5ID0gZnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBnb29nLnR5cGVPZih2YWwpID09ICdhcnJheSc7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBvYmplY3QgbG9va3MgbGlrZSBhbiBhcnJheS4gVG8gcXVhbGlmeSBhcyBhcnJheSBsaWtlXG4gKiB0aGUgdmFsdWUgbmVlZHMgdG8gYmUgZWl0aGVyIGEgTm9kZUxpc3Qgb3IgYW4gb2JqZWN0IHdpdGggYSBOdW1iZXIgbGVuZ3RoXG4gKiBwcm9wZXJ0eS5cbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGFuIGFycmF5LlxuICovXG5nb29nLmlzQXJyYXlMaWtlID0gZnVuY3Rpb24odmFsKSB7XG4gIHZhciB0eXBlID0gZ29vZy50eXBlT2YodmFsKTtcbiAgcmV0dXJuIHR5cGUgPT0gJ2FycmF5JyB8fCB0eXBlID09ICdvYmplY3QnICYmIHR5cGVvZiB2YWwubGVuZ3RoID09ICdudW1iZXInO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgb2JqZWN0IGxvb2tzIGxpa2UgYSBEYXRlLiBUbyBxdWFsaWZ5IGFzIERhdGUtbGlrZVxuICogdGhlIHZhbHVlIG5lZWRzIHRvIGJlIGFuIG9iamVjdCBhbmQgaGF2ZSBhIGdldEZ1bGxZZWFyKCkgZnVuY3Rpb24uXG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBhIGxpa2UgYSBEYXRlLlxuICovXG5nb29nLmlzRGF0ZUxpa2UgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIGdvb2cuaXNPYmplY3QodmFsKSAmJiB0eXBlb2YgdmFsLmdldEZ1bGxZZWFyID09ICdmdW5jdGlvbic7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYSBzdHJpbmdcbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGEgc3RyaW5nLlxuICovXG5nb29nLmlzU3RyaW5nID0gZnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09ICdzdHJpbmcnO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGEgYm9vbGVhblxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgYm9vbGVhbi5cbiAqL1xuZ29vZy5pc0Jvb2xlYW4gPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT0gJ2Jvb2xlYW4nO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGEgbnVtYmVyXG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBhIG51bWJlci5cbiAqL1xuZ29vZy5pc051bWJlciA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PSAnbnVtYmVyJztcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBhIGZ1bmN0aW9uXG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBhIGZ1bmN0aW9uLlxuICovXG5nb29nLmlzRnVuY3Rpb24gPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIGdvb2cudHlwZU9mKHZhbCkgPT0gJ2Z1bmN0aW9uJztcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBhbiBvYmplY3QuICBUaGlzIGluY2x1ZGVzIGFycmF5c1xuICogYW5kIGZ1bmN0aW9ucy5cbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGFuIG9iamVjdC5cbiAqL1xuZ29vZy5pc09iamVjdCA9IGZ1bmN0aW9uKHZhbCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWw7XG4gIHJldHVybiB0eXBlID09ICdvYmplY3QnICYmIHZhbCAhPSBudWxsIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJztcbiAgLy8gcmV0dXJuIE9iamVjdCh2YWwpID09PSB2YWwgYWxzbyB3b3JrcywgYnV0IGlzIHNsb3dlciwgZXNwZWNpYWxseSBpZiB2YWwgaXNcbiAgLy8gbm90IGFuIG9iamVjdC5cbn07XG5cblxuLyoqXG4gKiBHZXRzIGEgdW5pcXVlIElEIGZvciBhbiBvYmplY3QuIFRoaXMgbXV0YXRlcyB0aGUgb2JqZWN0IHNvIHRoYXQgZnVydGhlclxuICogY2FsbHMgd2l0aCB0aGUgc2FtZSBvYmplY3QgYXMgYSBwYXJhbWV0ZXIgcmV0dXJucyB0aGUgc2FtZSB2YWx1ZS4gVGhlIHVuaXF1ZVxuICogSUQgaXMgZ3VhcmFudGVlZCB0byBiZSB1bmlxdWUgYWNyb3NzIHRoZSBjdXJyZW50IHNlc3Npb24gYW1vbmdzdCBvYmplY3RzIHRoYXRcbiAqIGFyZSBwYXNzZWQgaW50byB7QGNvZGUgZ2V0VWlkfS4gVGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgdGhlIElEIGlzIHVuaXF1ZVxuICogb3IgY29uc2lzdGVudCBhY3Jvc3Mgc2Vzc2lvbnMuIEl0IGlzIHVuc2FmZSB0byBnZW5lcmF0ZSB1bmlxdWUgSUQgZm9yXG4gKiBmdW5jdGlvbiBwcm90b3R5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBnZXQgdGhlIHVuaXF1ZSBJRCBmb3IuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSB1bmlxdWUgSUQgZm9yIHRoZSBvYmplY3QuXG4gKi9cbmdvb2cuZ2V0VWlkID0gZnVuY3Rpb24ob2JqKSB7XG4gIC8vIFRPRE8oYXJ2KTogTWFrZSB0aGUgdHlwZSBzdHJpY3RlciwgZG8gbm90IGFjY2VwdCBudWxsLlxuXG4gIC8vIEluIE9wZXJhIHdpbmRvdy5oYXNPd25Qcm9wZXJ0eSBleGlzdHMgYnV0IGFsd2F5cyByZXR1cm5zIGZhbHNlIHNvIHdlIGF2b2lkXG4gIC8vIHVzaW5nIGl0LiBBcyBhIGNvbnNlcXVlbmNlIHRoZSB1bmlxdWUgSUQgZ2VuZXJhdGVkIGZvciBCYXNlQ2xhc3MucHJvdG90eXBlXG4gIC8vIGFuZCBTdWJDbGFzcy5wcm90b3R5cGUgd2lsbCBiZSB0aGUgc2FtZS5cbiAgcmV0dXJuIG9ialtnb29nLlVJRF9QUk9QRVJUWV9dIHx8XG4gICAgICAob2JqW2dvb2cuVUlEX1BST1BFUlRZX10gPSArK2dvb2cudWlkQ291bnRlcl8pO1xufTtcblxuXG4vKipcbiAqIFJlbW92ZXMgdGhlIHVuaXF1ZSBJRCBmcm9tIGFuIG9iamVjdC4gVGhpcyBpcyB1c2VmdWwgaWYgdGhlIG9iamVjdCB3YXNcbiAqIHByZXZpb3VzbHkgbXV0YXRlZCB1c2luZyB7QGNvZGUgZ29vZy5nZXRVaWR9IGluIHdoaWNoIGNhc2UgdGhlIG11dGF0aW9uIGlzXG4gKiB1bmRvbmUuXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcmVtb3ZlIHRoZSB1bmlxdWUgSUQgZmllbGQgZnJvbS5cbiAqL1xuZ29vZy5yZW1vdmVVaWQgPSBmdW5jdGlvbihvYmopIHtcbiAgLy8gVE9ETyhhcnYpOiBNYWtlIHRoZSB0eXBlIHN0cmljdGVyLCBkbyBub3QgYWNjZXB0IG51bGwuXG5cbiAgLy8gRE9NIG5vZGVzIGluIElFIGFyZSBub3QgaW5zdGFuY2Ugb2YgT2JqZWN0IGFuZCB0aHJvd3MgZXhjZXB0aW9uXG4gIC8vIGZvciBkZWxldGUuIEluc3RlYWQgd2UgdHJ5IHRvIHVzZSByZW1vdmVBdHRyaWJ1dGVcbiAgaWYgKCdyZW1vdmVBdHRyaWJ1dGUnIGluIG9iaikge1xuICAgIG9iai5yZW1vdmVBdHRyaWJ1dGUoZ29vZy5VSURfUFJPUEVSVFlfKTtcbiAgfVxuICAvKiogQHByZXNlcnZlVHJ5ICovXG4gIHRyeSB7XG4gICAgZGVsZXRlIG9ialtnb29nLlVJRF9QUk9QRVJUWV9dO1xuICB9IGNhdGNoIChleCkge1xuICB9XG59O1xuXG5cbi8qKlxuICogTmFtZSBmb3IgdW5pcXVlIElEIHByb3BlcnR5LiBJbml0aWFsaXplZCBpbiBhIHdheSB0byBoZWxwIGF2b2lkIGNvbGxpc2lvbnNcbiAqIHdpdGggb3RoZXIgY2xvc3VyZSBqYXZhc2NyaXB0IG9uIHRoZSBzYW1lIHBhZ2UuXG4gKiBAdHlwZSB7c3RyaW5nfVxuICogQHByaXZhdGVcbiAqL1xuZ29vZy5VSURfUFJPUEVSVFlfID0gJ2Nsb3N1cmVfdWlkXycgK1xuICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIxNDc0ODM2NDgpLnRvU3RyaW5nKDM2KTtcblxuXG4vKipcbiAqIENvdW50ZXIgZm9yIFVJRC5cbiAqIEB0eXBlIHtudW1iZXJ9XG4gKiBAcHJpdmF0ZVxuICovXG5nb29nLnVpZENvdW50ZXJfID0gMDtcblxuXG4vKipcbiAqIEFkZHMgYSBoYXNoIGNvZGUgZmllbGQgdG8gYW4gb2JqZWN0LiBUaGUgaGFzaCBjb2RlIGlzIHVuaXF1ZSBmb3IgdGhlXG4gKiBnaXZlbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gZ2V0IHRoZSBoYXNoIGNvZGUgZm9yLlxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgaGFzaCBjb2RlIGZvciB0aGUgb2JqZWN0LlxuICogQGRlcHJlY2F0ZWQgVXNlIGdvb2cuZ2V0VWlkIGluc3RlYWQuXG4gKi9cbmdvb2cuZ2V0SGFzaENvZGUgPSBnb29nLmdldFVpZDtcblxuXG4vKipcbiAqIFJlbW92ZXMgdGhlIGhhc2ggY29kZSBmaWVsZCBmcm9tIGFuIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byByZW1vdmUgdGhlIGZpZWxkIGZyb20uXG4gKiBAZGVwcmVjYXRlZCBVc2UgZ29vZy5yZW1vdmVVaWQgaW5zdGVhZC5cbiAqL1xuZ29vZy5yZW1vdmVIYXNoQ29kZSA9IGdvb2cucmVtb3ZlVWlkO1xuXG5cbi8qKlxuICogQ2xvbmVzIGEgdmFsdWUuIFRoZSBpbnB1dCBtYXkgYmUgYW4gT2JqZWN0LCBBcnJheSwgb3IgYmFzaWMgdHlwZS4gT2JqZWN0cyBhbmRcbiAqIGFycmF5cyB3aWxsIGJlIGNsb25lZCByZWN1cnNpdmVseS5cbiAqXG4gKiBXQVJOSU5HUzpcbiAqIDxjb2RlPmdvb2cuY2xvbmVPYmplY3Q8L2NvZGU+IGRvZXMgbm90IGRldGVjdCByZWZlcmVuY2UgbG9vcHMuIE9iamVjdHMgdGhhdFxuICogcmVmZXIgdG8gdGhlbXNlbHZlcyB3aWxsIGNhdXNlIGluZmluaXRlIHJlY3Vyc2lvbi5cbiAqXG4gKiA8Y29kZT5nb29nLmNsb25lT2JqZWN0PC9jb2RlPiBpcyB1bmF3YXJlIG9mIHVuaXF1ZSBpZGVudGlmaWVycywgYW5kIGNvcGllc1xuICogVUlEcyBjcmVhdGVkIGJ5IDxjb2RlPmdldFVpZDwvY29kZT4gaW50byBjbG9uZWQgcmVzdWx0cy5cbiAqXG4gKiBAcGFyYW0geyp9IG9iaiBUaGUgdmFsdWUgdG8gY2xvbmUuXG4gKiBAcmV0dXJuIHsqfSBBIGNsb25lIG9mIHRoZSBpbnB1dCB2YWx1ZS5cbiAqIEBkZXByZWNhdGVkIGdvb2cuY2xvbmVPYmplY3QgaXMgdW5zYWZlLiBQcmVmZXIgdGhlIGdvb2cub2JqZWN0IG1ldGhvZHMuXG4gKi9cbmdvb2cuY2xvbmVPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgdmFyIHR5cGUgPSBnb29nLnR5cGVPZihvYmopO1xuICBpZiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdhcnJheScpIHtcbiAgICBpZiAob2JqLmNsb25lKSB7XG4gICAgICByZXR1cm4gb2JqLmNsb25lKCk7XG4gICAgfVxuICAgIHZhciBjbG9uZSA9IHR5cGUgPT0gJ2FycmF5JyA/IFtdIDoge307XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgY2xvbmVba2V5XSA9IGdvb2cuY2xvbmVPYmplY3Qob2JqW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxuXG4vKipcbiAqIEZvcndhcmQgZGVjbGFyYXRpb24gZm9yIHRoZSBjbG9uZSBtZXRob2QuIFRoaXMgaXMgbmVjZXNzYXJ5IHVudGlsIHRoZVxuICogY29tcGlsZXIgY2FuIGJldHRlciBzdXBwb3J0IGR1Y2stdHlwaW5nIGNvbnN0cnVjdHMgYXMgdXNlZCBpblxuICogZ29vZy5jbG9uZU9iamVjdC5cbiAqXG4gKiBUT0RPKGJyZW5uZW1hbik6IFJlbW92ZSBvbmNlIHRoZSBKU0NvbXBpbGVyIGNhbiBpbmZlciB0aGF0IHRoZSBjaGVjayBmb3JcbiAqIHByb3RvLmNsb25lIGlzIHNhZmUgaW4gZ29vZy5jbG9uZU9iamVjdC5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cbk9iamVjdC5wcm90b3R5cGUuY2xvbmU7XG5cblxuLyoqXG4gKiBBIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbiBvZiBnb29nLmJpbmQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBBIGZ1bmN0aW9uIHRvIHBhcnRpYWxseSBhcHBseS5cbiAqIEBwYXJhbSB7T2JqZWN0fHVuZGVmaW5lZH0gc2VsZk9iaiBTcGVjaWZpZXMgdGhlIG9iamVjdCB3aGljaCB8dGhpc3wgc2hvdWxkXG4gKiAgICAgcG9pbnQgdG8gd2hlbiB0aGUgZnVuY3Rpb24gaXMgcnVuLlxuICogQHBhcmFtIHsuLi4qfSB2YXJfYXJncyBBZGRpdGlvbmFsIGFyZ3VtZW50cyB0aGF0IGFyZSBwYXJ0aWFsbHlcbiAqICAgICBhcHBsaWVkIHRvIHRoZSBmdW5jdGlvbi5cbiAqIEByZXR1cm4geyFGdW5jdGlvbn0gQSBwYXJ0aWFsbHktYXBwbGllZCBmb3JtIG9mIHRoZSBmdW5jdGlvbiBiaW5kKCkgd2FzXG4gKiAgICAgaW52b2tlZCBhcyBhIG1ldGhvZCBvZi5cbiAqIEBwcml2YXRlXG4gKiBAc3VwcHJlc3Mge2RlcHJlY2F0ZWR9IFRoZSBjb21waWxlciB0aGlua3MgdGhhdCBGdW5jdGlvbi5wcm90b3R5cGUuYmluZFxuICogICAgIGlzIGRlcHJlY2F0ZWQgYmVjYXVzZSBzb21lIHBlb3BsZSBoYXZlIGRlY2xhcmVkIGEgcHVyZS1KUyB2ZXJzaW9uLlxuICogICAgIE9ubHkgdGhlIHB1cmUtSlMgdmVyc2lvbiBpcyB0cnVseSBkZXByZWNhdGVkLlxuICovXG5nb29nLmJpbmROYXRpdmVfID0gZnVuY3Rpb24oZm4sIHNlbGZPYmosIHZhcl9hcmdzKSB7XG4gIHJldHVybiAvKiogQHR5cGUgeyFGdW5jdGlvbn0gKi8gKGZuLmNhbGwuYXBwbHkoZm4uYmluZCwgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogQSBwdXJlLUpTIGltcGxlbWVudGF0aW9uIG9mIGdvb2cuYmluZC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEEgZnVuY3Rpb24gdG8gcGFydGlhbGx5IGFwcGx5LlxuICogQHBhcmFtIHtPYmplY3R8dW5kZWZpbmVkfSBzZWxmT2JqIFNwZWNpZmllcyB0aGUgb2JqZWN0IHdoaWNoIHx0aGlzfCBzaG91bGRcbiAqICAgICBwb2ludCB0byB3aGVuIHRoZSBmdW5jdGlvbiBpcyBydW4uXG4gKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIEFkZGl0aW9uYWwgYXJndW1lbnRzIHRoYXQgYXJlIHBhcnRpYWxseVxuICogICAgIGFwcGxpZWQgdG8gdGhlIGZ1bmN0aW9uLlxuICogQHJldHVybiB7IUZ1bmN0aW9ufSBBIHBhcnRpYWxseS1hcHBsaWVkIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGJpbmQoKSB3YXNcbiAqICAgICBpbnZva2VkIGFzIGEgbWV0aG9kIG9mLlxuICogQHByaXZhdGVcbiAqL1xuZ29vZy5iaW5kSnNfID0gZnVuY3Rpb24oZm4sIHNlbGZPYmosIHZhcl9hcmdzKSB7XG4gIGlmICghZm4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgfVxuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgIHZhciBib3VuZEFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFByZXBlbmQgdGhlIGJvdW5kIGFyZ3VtZW50cyB0byB0aGUgY3VycmVudCBhcmd1bWVudHMuXG4gICAgICB2YXIgbmV3QXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShuZXdBcmdzLCBib3VuZEFyZ3MpO1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KHNlbGZPYmosIG5ld0FyZ3MpO1xuICAgIH07XG5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkoc2VsZk9iaiwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG59O1xuXG5cbi8qKlxuICogUGFydGlhbGx5IGFwcGxpZXMgdGhpcyBmdW5jdGlvbiB0byBhIHBhcnRpY3VsYXIgJ3RoaXMgb2JqZWN0JyBhbmQgemVybyBvclxuICogbW9yZSBhcmd1bWVudHMuIFRoZSByZXN1bHQgaXMgYSBuZXcgZnVuY3Rpb24gd2l0aCBzb21lIGFyZ3VtZW50cyBvZiB0aGUgZmlyc3RcbiAqIGZ1bmN0aW9uIHByZS1maWxsZWQgYW5kIHRoZSB2YWx1ZSBvZiB8dGhpc3wgJ3ByZS1zcGVjaWZpZWQnLjxicj48YnI+XG4gKlxuICogUmVtYWluaW5nIGFyZ3VtZW50cyBzcGVjaWZpZWQgYXQgY2FsbC10aW1lIGFyZSBhcHBlbmRlZCB0byB0aGUgcHJlLVxuICogc3BlY2lmaWVkIG9uZXMuPGJyPjxicj5cbiAqXG4gKiBBbHNvIHNlZToge0BsaW5rICNwYXJ0aWFsfS48YnI+PGJyPlxuICpcbiAqIFVzYWdlOlxuICogPHByZT52YXIgYmFyTWV0aEJvdW5kID0gYmluZChteUZ1bmN0aW9uLCBteU9iaiwgJ2FyZzEnLCAnYXJnMicpO1xuICogYmFyTWV0aEJvdW5kKCdhcmczJywgJ2FyZzQnKTs8L3ByZT5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBBIGZ1bmN0aW9uIHRvIHBhcnRpYWxseSBhcHBseS5cbiAqIEBwYXJhbSB7T2JqZWN0fHVuZGVmaW5lZH0gc2VsZk9iaiBTcGVjaWZpZXMgdGhlIG9iamVjdCB3aGljaCB8dGhpc3wgc2hvdWxkXG4gKiAgICAgcG9pbnQgdG8gd2hlbiB0aGUgZnVuY3Rpb24gaXMgcnVuLlxuICogQHBhcmFtIHsuLi4qfSB2YXJfYXJncyBBZGRpdGlvbmFsIGFyZ3VtZW50cyB0aGF0IGFyZSBwYXJ0aWFsbHlcbiAqICAgICBhcHBsaWVkIHRvIHRoZSBmdW5jdGlvbi5cbiAqIEByZXR1cm4geyFGdW5jdGlvbn0gQSBwYXJ0aWFsbHktYXBwbGllZCBmb3JtIG9mIHRoZSBmdW5jdGlvbiBiaW5kKCkgd2FzXG4gKiAgICAgaW52b2tlZCBhcyBhIG1ldGhvZCBvZi5cbiAqIEBzdXBwcmVzcyB7ZGVwcmVjYXRlZH0gU2VlIGFib3ZlLlxuICovXG5nb29nLmJpbmQgPSBmdW5jdGlvbihmbiwgc2VsZk9iaiwgdmFyX2FyZ3MpIHtcbiAgLy8gVE9ETyhuaWNrc2FudG9zKTogbmFycm93IHRoZSB0eXBlIHNpZ25hdHVyZS5cbiAgaWYgKEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kICYmXG4gICAgICAvLyBOT1RFKG5pY2tzYW50b3MpOiBTb21lYm9keSBwdWxsZWQgYmFzZS5qcyBpbnRvIHRoZSBkZWZhdWx0XG4gICAgICAvLyBDaHJvbWUgZXh0ZW5zaW9uIGVudmlyb25tZW50LiBUaGlzIG1lYW5zIHRoYXQgZm9yIENocm9tZSBleHRlbnNpb25zLFxuICAgICAgLy8gdGhleSBnZXQgdGhlIGltcGxlbWVudGF0aW9uIG9mIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIHRoYXRcbiAgICAgIC8vIGNhbGxzIGdvb2cuYmluZCBpbnN0ZWFkIG9mIHRoZSBuYXRpdmUgb25lLiBFdmVuIHdvcnNlLCB3ZSBkb24ndCB3YW50XG4gICAgICAvLyB0byBpbnRyb2R1Y2UgYSBjaXJjdWxhciBkZXBlbmRlbmN5IGJldHdlZW4gZ29vZy5iaW5kIGFuZFxuICAgICAgLy8gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQsIHNvIHdlIGhhdmUgdG8gaGFjayB0aGlzIHRvIG1ha2Ugc3VyZSBpdFxuICAgICAgLy8gd29ya3MgY29ycmVjdGx5LlxuICAgICAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQudG9TdHJpbmcoKS5pbmRleE9mKCduYXRpdmUgY29kZScpICE9IC0xKSB7XG4gICAgZ29vZy5iaW5kID0gZ29vZy5iaW5kTmF0aXZlXztcbiAgfSBlbHNlIHtcbiAgICBnb29nLmJpbmQgPSBnb29nLmJpbmRKc187XG4gIH1cbiAgcmV0dXJuIGdvb2cuYmluZC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xufTtcblxuXG4vKipcbiAqIExpa2UgYmluZCgpLCBleGNlcHQgdGhhdCBhICd0aGlzIG9iamVjdCcgaXMgbm90IHJlcXVpcmVkLiBVc2VmdWwgd2hlbiB0aGVcbiAqIHRhcmdldCBmdW5jdGlvbiBpcyBhbHJlYWR5IGJvdW5kLlxuICpcbiAqIFVzYWdlOlxuICogdmFyIGcgPSBwYXJ0aWFsKGYsIGFyZzEsIGFyZzIpO1xuICogZyhhcmczLCBhcmc0KTtcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBBIGZ1bmN0aW9uIHRvIHBhcnRpYWxseSBhcHBseS5cbiAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3MgQWRkaXRpb25hbCBhcmd1bWVudHMgdGhhdCBhcmUgcGFydGlhbGx5XG4gKiAgICAgYXBwbGllZCB0byBmbi5cbiAqIEByZXR1cm4geyFGdW5jdGlvbn0gQSBwYXJ0aWFsbHktYXBwbGllZCBmb3JtIG9mIHRoZSBmdW5jdGlvbiBiaW5kKCkgd2FzXG4gKiAgICAgaW52b2tlZCBhcyBhIG1ldGhvZCBvZi5cbiAqL1xuZ29vZy5wYXJ0aWFsID0gZnVuY3Rpb24oZm4sIHZhcl9hcmdzKSB7XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIC8vIFByZXBlbmQgdGhlIGJvdW5kIGFyZ3VtZW50cyB0byB0aGUgY3VycmVudCBhcmd1bWVudHMuXG4gICAgdmFyIG5ld0FyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIG5ld0FyZ3MudW5zaGlmdC5hcHBseShuZXdBcmdzLCBhcmdzKTtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgbmV3QXJncyk7XG4gIH07XG59O1xuXG5cbi8qKlxuICogQ29waWVzIGFsbCB0aGUgbWVtYmVycyBvZiBhIHNvdXJjZSBvYmplY3QgdG8gYSB0YXJnZXQgb2JqZWN0LiBUaGlzIG1ldGhvZFxuICogZG9lcyBub3Qgd29yayBvbiBhbGwgYnJvd3NlcnMgZm9yIGFsbCBvYmplY3RzIHRoYXQgY29udGFpbiBrZXlzIHN1Y2ggYXNcbiAqIHRvU3RyaW5nIG9yIGhhc093blByb3BlcnR5LiBVc2UgZ29vZy5vYmplY3QuZXh0ZW5kIGZvciB0aGlzIHB1cnBvc2UuXG4gKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0IFRhcmdldC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgU291cmNlLlxuICovXG5nb29nLm1peGluID0gZnVuY3Rpb24odGFyZ2V0LCBzb3VyY2UpIHtcbiAgZm9yICh2YXIgeCBpbiBzb3VyY2UpIHtcbiAgICB0YXJnZXRbeF0gPSBzb3VyY2VbeF07XG4gIH1cblxuICAvLyBGb3IgSUU3IG9yIGxvd2VyLCB0aGUgZm9yLWluLWxvb3AgZG9lcyBub3QgY29udGFpbiBhbnkgcHJvcGVydGllcyB0aGF0IGFyZVxuICAvLyBub3QgZW51bWVyYWJsZSBvbiB0aGUgcHJvdG90eXBlIG9iamVjdCAoZm9yIGV4YW1wbGUsIGlzUHJvdG90eXBlT2YgZnJvbVxuICAvLyBPYmplY3QucHJvdG90eXBlKSBidXQgYWxzbyBpdCB3aWxsIG5vdCBpbmNsdWRlICdyZXBsYWNlJyBvbiBvYmplY3RzIHRoYXRcbiAgLy8gZXh0ZW5kIFN0cmluZyBhbmQgY2hhbmdlICdyZXBsYWNlJyAobm90IHRoYXQgaXQgaXMgY29tbW9uIGZvciBhbnlvbmUgdG9cbiAgLy8gZXh0ZW5kIGFueXRoaW5nIGV4Y2VwdCBPYmplY3QpLlxufTtcblxuXG4vKipcbiAqIEByZXR1cm4ge251bWJlcn0gQW4gaW50ZWdlciB2YWx1ZSByZXByZXNlbnRpbmcgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHNcbiAqICAgICBiZXR3ZWVuIG1pZG5pZ2h0LCBKYW51YXJ5IDEsIDE5NzAgYW5kIHRoZSBjdXJyZW50IHRpbWUuXG4gKi9cbmdvb2cubm93ID0gRGF0ZS5ub3cgfHwgKGZ1bmN0aW9uKCkge1xuICAvLyBVbmFyeSBwbHVzIG9wZXJhdG9yIGNvbnZlcnRzIGl0cyBvcGVyYW5kIHRvIGEgbnVtYmVyIHdoaWNoIGluIHRoZSBjYXNlIG9mXG4gIC8vIGEgZGF0ZSBpcyBkb25lIGJ5IGNhbGxpbmcgZ2V0VGltZSgpLlxuICByZXR1cm4gK25ldyBEYXRlKCk7XG59KTtcblxuXG4vKipcbiAqIEV2YWxzIGphdmFzY3JpcHQgaW4gdGhlIGdsb2JhbCBzY29wZS4gIEluIElFIHRoaXMgdXNlcyBleGVjU2NyaXB0LCBvdGhlclxuICogYnJvd3NlcnMgdXNlIGdvb2cuZ2xvYmFsLmV2YWwuIElmIGdvb2cuZ2xvYmFsLmV2YWwgZG9lcyBub3QgZXZhbHVhdGUgaW4gdGhlXG4gKiBnbG9iYWwgc2NvcGUgKGZvciBleGFtcGxlLCBpbiBTYWZhcmkpLCBhcHBlbmRzIGEgc2NyaXB0IHRhZyBpbnN0ZWFkLlxuICogVGhyb3dzIGFuIGV4Y2VwdGlvbiBpZiBuZWl0aGVyIGV4ZWNTY3JpcHQgb3IgZXZhbCBpcyBkZWZpbmVkLlxuICogQHBhcmFtIHtzdHJpbmd9IHNjcmlwdCBKYXZhU2NyaXB0IHN0cmluZy5cbiAqL1xuZ29vZy5nbG9iYWxFdmFsID0gZnVuY3Rpb24oc2NyaXB0KSB7XG4gIGlmIChnb29nLmdsb2JhbC5leGVjU2NyaXB0KSB7XG4gICAgZ29vZy5nbG9iYWwuZXhlY1NjcmlwdChzY3JpcHQsICdKYXZhU2NyaXB0Jyk7XG4gIH0gZWxzZSBpZiAoZ29vZy5nbG9iYWwuZXZhbCkge1xuICAgIC8vIFRlc3QgdG8gc2VlIGlmIGV2YWwgd29ya3NcbiAgICBpZiAoZ29vZy5ldmFsV29ya3NGb3JHbG9iYWxzXyA9PSBudWxsKSB7XG4gICAgICBnb29nLmdsb2JhbC5ldmFsKCd2YXIgX2V0XyA9IDE7Jyk7XG4gICAgICBpZiAodHlwZW9mIGdvb2cuZ2xvYmFsWydfZXRfJ10gIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZGVsZXRlIGdvb2cuZ2xvYmFsWydfZXRfJ107XG4gICAgICAgIGdvb2cuZXZhbFdvcmtzRm9yR2xvYmFsc18gPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ29vZy5ldmFsV29ya3NGb3JHbG9iYWxzXyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChnb29nLmV2YWxXb3Jrc0Zvckdsb2JhbHNfKSB7XG4gICAgICBnb29nLmdsb2JhbC5ldmFsKHNjcmlwdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBkb2MgPSBnb29nLmdsb2JhbC5kb2N1bWVudDtcbiAgICAgIHZhciBzY3JpcHRFbHQgPSBkb2MuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBzY3JpcHRFbHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgc2NyaXB0RWx0LmRlZmVyID0gZmFsc2U7XG4gICAgICAvLyBOb3RlKHVzZXIpOiBjYW4ndCB1c2UgLmlubmVySFRNTCBzaW5jZSBcInQoJzx0ZXN0PicpXCIgd2lsbCBmYWlsIGFuZFxuICAgICAgLy8gLnRleHQgZG9lc24ndCB3b3JrIGluIFNhZmFyaSAyLiAgVGhlcmVmb3JlIHdlIGFwcGVuZCBhIHRleHQgbm9kZS5cbiAgICAgIHNjcmlwdEVsdC5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoc2NyaXB0KSk7XG4gICAgICBkb2MuYm9keS5hcHBlbmRDaGlsZChzY3JpcHRFbHQpO1xuICAgICAgZG9jLmJvZHkucmVtb3ZlQ2hpbGQoc2NyaXB0RWx0KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgRXJyb3IoJ2dvb2cuZ2xvYmFsRXZhbCBub3QgYXZhaWxhYmxlJyk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBJbmRpY2F0ZXMgd2hldGhlciBvciBub3Qgd2UgY2FuIGNhbGwgJ2V2YWwnIGRpcmVjdGx5IHRvIGV2YWwgY29kZSBpbiB0aGVcbiAqIGdsb2JhbCBzY29wZS4gU2V0IHRvIGEgQm9vbGVhbiBieSB0aGUgZmlyc3QgY2FsbCB0byBnb29nLmdsb2JhbEV2YWwgKHdoaWNoXG4gKiBlbXBpcmljYWxseSB0ZXN0cyB3aGV0aGVyIGV2YWwgd29ya3MgZm9yIGdsb2JhbHMpLiBAc2VlIGdvb2cuZ2xvYmFsRXZhbFxuICogQHR5cGUgez9ib29sZWFufVxuICogQHByaXZhdGVcbiAqL1xuZ29vZy5ldmFsV29ya3NGb3JHbG9iYWxzXyA9IG51bGw7XG5cblxuLyoqXG4gKiBPcHRpb25hbCBtYXAgb2YgQ1NTIGNsYXNzIG5hbWVzIHRvIG9iZnVzY2F0ZWQgbmFtZXMgdXNlZCB3aXRoXG4gKiBnb29nLmdldENzc05hbWUoKS5cbiAqIEB0eXBlIHtPYmplY3R8dW5kZWZpbmVkfVxuICogQHByaXZhdGVcbiAqIEBzZWUgZ29vZy5zZXRDc3NOYW1lTWFwcGluZ1xuICovXG5nb29nLmNzc05hbWVNYXBwaW5nXztcblxuXG4vKipcbiAqIE9wdGlvbmFsIG9iZnVzY2F0aW9uIHN0eWxlIGZvciBDU1MgY2xhc3MgbmFtZXMuIFNob3VsZCBiZSBzZXQgdG8gZWl0aGVyXG4gKiAnQllfV0hPTEUnIG9yICdCWV9QQVJUJyBpZiBkZWZpbmVkLlxuICogQHR5cGUge3N0cmluZ3x1bmRlZmluZWR9XG4gKiBAcHJpdmF0ZVxuICogQHNlZSBnb29nLnNldENzc05hbWVNYXBwaW5nXG4gKi9cbmdvb2cuY3NzTmFtZU1hcHBpbmdTdHlsZV87XG5cblxuLyoqXG4gKiBIYW5kbGVzIHN0cmluZ3MgdGhhdCBhcmUgaW50ZW5kZWQgdG8gYmUgdXNlZCBhcyBDU1MgY2xhc3MgbmFtZXMuXG4gKlxuICogVGhpcyBmdW5jdGlvbiB3b3JrcyBpbiB0YW5kZW0gd2l0aCBAc2VlIGdvb2cuc2V0Q3NzTmFtZU1hcHBpbmcuXG4gKlxuICogV2l0aG91dCBhbnkgbWFwcGluZyBzZXQsIHRoZSBhcmd1bWVudHMgYXJlIHNpbXBsZSBqb2luZWQgd2l0aCBhXG4gKiBoeXBoZW4gYW5kIHBhc3NlZCB0aHJvdWdoIHVuYWx0ZXJlZC5cbiAqXG4gKiBXaGVuIHRoZXJlIGlzIGEgbWFwcGluZywgdGhlcmUgYXJlIHR3byBwb3NzaWJsZSBzdHlsZXMgaW4gd2hpY2hcbiAqIHRoZXNlIG1hcHBpbmdzIGFyZSB1c2VkLiBJbiB0aGUgQllfUEFSVCBzdHlsZSwgZWFjaCBwYXJ0IChpLmUuIGluXG4gKiBiZXR3ZWVuIGh5cGhlbnMpIG9mIHRoZSBwYXNzZWQgaW4gY3NzIG5hbWUgaXMgcmV3cml0dGVuIGFjY29yZGluZ1xuICogdG8gdGhlIG1hcC4gSW4gdGhlIEJZX1dIT0xFIHN0eWxlLCB0aGUgZnVsbCBjc3MgbmFtZSBpcyBsb29rZWQgdXAgaW5cbiAqIHRoZSBtYXAgZGlyZWN0bHkuIElmIGEgcmV3cml0ZSBpcyBub3Qgc3BlY2lmaWVkIGJ5IHRoZSBtYXAsIHRoZVxuICogY29tcGlsZXIgd2lsbCBvdXRwdXQgYSB3YXJuaW5nLlxuICpcbiAqIFdoZW4gdGhlIG1hcHBpbmcgaXMgcGFzc2VkIHRvIHRoZSBjb21waWxlciwgaXQgd2lsbCByZXBsYWNlIGNhbGxzXG4gKiB0byBnb29nLmdldENzc05hbWUgd2l0aCB0aGUgc3RyaW5ncyBmcm9tIHRoZSBtYXBwaW5nLCBlLmcuXG4gKiAgICAgdmFyIHggPSBnb29nLmdldENzc05hbWUoJ2ZvbycpO1xuICogICAgIHZhciB5ID0gZ29vZy5nZXRDc3NOYW1lKHRoaXMuYmFzZUNsYXNzLCAnYWN0aXZlJyk7XG4gKiAgYmVjb21lczpcbiAqICAgICB2YXIgeD0gJ2Zvbyc7XG4gKiAgICAgdmFyIHkgPSB0aGlzLmJhc2VDbGFzcyArICctYWN0aXZlJztcbiAqXG4gKiBJZiBvbmUgYXJndW1lbnQgaXMgcGFzc2VkIGl0IHdpbGwgYmUgcHJvY2Vzc2VkLCBpZiB0d28gYXJlIHBhc3NlZFxuICogb25seSB0aGUgbW9kaWZpZXIgd2lsbCBiZSBwcm9jZXNzZWQsIGFzIGl0IGlzIGFzc3VtZWQgdGhlIGZpcnN0XG4gKiBhcmd1bWVudCB3YXMgZ2VuZXJhdGVkIGFzIGEgcmVzdWx0IG9mIGNhbGxpbmcgZ29vZy5nZXRDc3NOYW1lLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgVGhlIGNsYXNzIG5hbWUuXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9tb2RpZmllciBBIG1vZGlmaWVyIHRvIGJlIGFwcGVuZGVkIHRvIHRoZSBjbGFzcyBuYW1lLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgY2xhc3MgbmFtZSBvciB0aGUgY29uY2F0ZW5hdGlvbiBvZiB0aGUgY2xhc3MgbmFtZSBhbmRcbiAqICAgICB0aGUgbW9kaWZpZXIuXG4gKi9cbmdvb2cuZ2V0Q3NzTmFtZSA9IGZ1bmN0aW9uKGNsYXNzTmFtZSwgb3B0X21vZGlmaWVyKSB7XG4gIHZhciBnZXRNYXBwaW5nID0gZnVuY3Rpb24oY3NzTmFtZSkge1xuICAgIHJldHVybiBnb29nLmNzc05hbWVNYXBwaW5nX1tjc3NOYW1lXSB8fCBjc3NOYW1lO1xuICB9O1xuXG4gIHZhciByZW5hbWVCeVBhcnRzID0gZnVuY3Rpb24oY3NzTmFtZSkge1xuICAgIC8vIFJlbWFwIGFsbCB0aGUgcGFydHMgaW5kaXZpZHVhbGx5LlxuICAgIHZhciBwYXJ0cyA9IGNzc05hbWUuc3BsaXQoJy0nKTtcbiAgICB2YXIgbWFwcGVkID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgbWFwcGVkLnB1c2goZ2V0TWFwcGluZyhwYXJ0c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gbWFwcGVkLmpvaW4oJy0nKTtcbiAgfTtcblxuICB2YXIgcmVuYW1lO1xuICBpZiAoZ29vZy5jc3NOYW1lTWFwcGluZ18pIHtcbiAgICByZW5hbWUgPSBnb29nLmNzc05hbWVNYXBwaW5nU3R5bGVfID09ICdCWV9XSE9MRScgP1xuICAgICAgICBnZXRNYXBwaW5nIDogcmVuYW1lQnlQYXJ0cztcbiAgfSBlbHNlIHtcbiAgICByZW5hbWUgPSBmdW5jdGlvbihhKSB7XG4gICAgICByZXR1cm4gYTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKG9wdF9tb2RpZmllcikge1xuICAgIHJldHVybiBjbGFzc05hbWUgKyAnLScgKyByZW5hbWUob3B0X21vZGlmaWVyKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcmVuYW1lKGNsYXNzTmFtZSk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBTZXRzIHRoZSBtYXAgdG8gY2hlY2sgd2hlbiByZXR1cm5pbmcgYSB2YWx1ZSBmcm9tIGdvb2cuZ2V0Q3NzTmFtZSgpLiBFeGFtcGxlOlxuICogPHByZT5cbiAqIGdvb2cuc2V0Q3NzTmFtZU1hcHBpbmcoe1xuICogICBcImdvb2dcIjogXCJhXCIsXG4gKiAgIFwiZGlzYWJsZWRcIjogXCJiXCIsXG4gKiB9KTtcbiAqXG4gKiB2YXIgeCA9IGdvb2cuZ2V0Q3NzTmFtZSgnZ29vZycpO1xuICogLy8gVGhlIGZvbGxvd2luZyBldmFsdWF0ZXMgdG86IFwiYSBhLWJcIi5cbiAqIGdvb2cuZ2V0Q3NzTmFtZSgnZ29vZycpICsgJyAnICsgZ29vZy5nZXRDc3NOYW1lKHgsICdkaXNhYmxlZCcpXG4gKiA8L3ByZT5cbiAqIFdoZW4gZGVjbGFyZWQgYXMgYSBtYXAgb2Ygc3RyaW5nIGxpdGVyYWxzIHRvIHN0cmluZyBsaXRlcmFscywgdGhlIEpTQ29tcGlsZXJcbiAqIHdpbGwgcmVwbGFjZSBhbGwgY2FsbHMgdG8gZ29vZy5nZXRDc3NOYW1lKCkgdXNpbmcgdGhlIHN1cHBsaWVkIG1hcCBpZiB0aGVcbiAqIC0tY2xvc3VyZV9wYXNzIGZsYWcgaXMgc2V0LlxuICpcbiAqIEBwYXJhbSB7IU9iamVjdH0gbWFwcGluZyBBIG1hcCBvZiBzdHJpbmdzIHRvIHN0cmluZ3Mgd2hlcmUga2V5cyBhcmUgcG9zc2libGVcbiAqICAgICBhcmd1bWVudHMgdG8gZ29vZy5nZXRDc3NOYW1lKCkgYW5kIHZhbHVlcyBhcmUgdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzXG4gKiAgICAgdGhhdCBzaG91bGQgYmUgcmV0dXJuZWQuXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9zdHlsZSBUaGUgc3R5bGUgb2YgY3NzIG5hbWUgbWFwcGluZy4gVGhlcmUgYXJlIHR3byB2YWxpZFxuICogICAgIG9wdGlvbnM6ICdCWV9QQVJUJywgYW5kICdCWV9XSE9MRScuXG4gKiBAc2VlIGdvb2cuZ2V0Q3NzTmFtZSBmb3IgYSBkZXNjcmlwdGlvbi5cbiAqL1xuZ29vZy5zZXRDc3NOYW1lTWFwcGluZyA9IGZ1bmN0aW9uKG1hcHBpbmcsIG9wdF9zdHlsZSkge1xuICBnb29nLmNzc05hbWVNYXBwaW5nXyA9IG1hcHBpbmc7XG4gIGdvb2cuY3NzTmFtZU1hcHBpbmdTdHlsZV8gPSBvcHRfc3R5bGU7XG59O1xuXG5cbi8qKlxuICogVG8gdXNlIENTUyByZW5hbWluZyBpbiBjb21waWxlZCBtb2RlLCBvbmUgb2YgdGhlIGlucHV0IGZpbGVzIHNob3VsZCBoYXZlIGFcbiAqIGNhbGwgdG8gZ29vZy5zZXRDc3NOYW1lTWFwcGluZygpIHdpdGggYW4gb2JqZWN0IGxpdGVyYWwgdGhhdCB0aGUgSlNDb21waWxlclxuICogY2FuIGV4dHJhY3QgYW5kIHVzZSB0byByZXBsYWNlIGFsbCBjYWxscyB0byBnb29nLmdldENzc05hbWUoKS4gSW4gdW5jb21waWxlZFxuICogbW9kZSwgSmF2YVNjcmlwdCBjb2RlIHNob3VsZCBiZSBsb2FkZWQgYmVmb3JlIHRoaXMgYmFzZS5qcyBmaWxlIHRoYXQgZGVjbGFyZXNcbiAqIGEgZ2xvYmFsIHZhcmlhYmxlLCBDTE9TVVJFX0NTU19OQU1FX01BUFBJTkcsIHdoaWNoIGlzIHVzZWQgYmVsb3cuIFRoaXMgaXNcbiAqIHRvIGVuc3VyZSB0aGF0IHRoZSBtYXBwaW5nIGlzIGxvYWRlZCBiZWZvcmUgYW55IGNhbGxzIHRvIGdvb2cuZ2V0Q3NzTmFtZSgpXG4gKiBhcmUgbWFkZSBpbiB1bmNvbXBpbGVkIG1vZGUuXG4gKlxuICogQSBob29rIGZvciBvdmVycmlkaW5nIHRoZSBDU1MgbmFtZSBtYXBwaW5nLlxuICogQHR5cGUge09iamVjdHx1bmRlZmluZWR9XG4gKi9cbmdvb2cuZ2xvYmFsLkNMT1NVUkVfQ1NTX05BTUVfTUFQUElORztcblxuXG5pZiAoIUNPTVBJTEVEICYmIGdvb2cuZ2xvYmFsLkNMT1NVUkVfQ1NTX05BTUVfTUFQUElORykge1xuICAvLyBUaGlzIGRvZXMgbm90IGNhbGwgZ29vZy5zZXRDc3NOYW1lTWFwcGluZygpIGJlY2F1c2UgdGhlIEpTQ29tcGlsZXJcbiAgLy8gcmVxdWlyZXMgdGhhdCBnb29nLnNldENzc05hbWVNYXBwaW5nKCkgYmUgY2FsbGVkIHdpdGggYW4gb2JqZWN0IGxpdGVyYWwuXG4gIGdvb2cuY3NzTmFtZU1hcHBpbmdfID0gZ29vZy5nbG9iYWwuQ0xPU1VSRV9DU1NfTkFNRV9NQVBQSU5HO1xufVxuXG5cbi8qKlxuICogQWJzdHJhY3QgaW1wbGVtZW50YXRpb24gb2YgZ29vZy5nZXRNc2cgZm9yIHVzZSB3aXRoIGxvY2FsaXplZCBtZXNzYWdlcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgVHJhbnNsYXRhYmxlIHN0cmluZywgcGxhY2VzIGhvbGRlcnMgaW4gdGhlIGZvcm0geyRmb299LlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfdmFsdWVzIE1hcCBvZiBwbGFjZSBob2xkZXIgbmFtZSB0byB2YWx1ZS5cbiAqIEByZXR1cm4ge3N0cmluZ30gbWVzc2FnZSB3aXRoIHBsYWNlaG9sZGVycyBmaWxsZWQuXG4gKi9cbmdvb2cuZ2V0TXNnID0gZnVuY3Rpb24oc3RyLCBvcHRfdmFsdWVzKSB7XG4gIHZhciB2YWx1ZXMgPSBvcHRfdmFsdWVzIHx8IHt9O1xuICBmb3IgKHZhciBrZXkgaW4gdmFsdWVzKSB7XG4gICAgdmFyIHZhbHVlID0gKCcnICsgdmFsdWVzW2tleV0pLnJlcGxhY2UoL1xcJC9nLCAnJCQkJCcpO1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFx7XFxcXCQnICsga2V5ICsgJ1xcXFx9JywgJ2dpJyksIHZhbHVlKTtcbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vKipcbiAqIEV4cG9zZXMgYW4gdW5vYmZ1c2NhdGVkIGdsb2JhbCBuYW1lc3BhY2UgcGF0aCBmb3IgdGhlIGdpdmVuIG9iamVjdC5cbiAqIE5vdGUgdGhhdCBmaWVsZHMgb2YgdGhlIGV4cG9ydGVkIG9iamVjdCAqd2lsbCogYmUgb2JmdXNjYXRlZCxcbiAqIHVubGVzcyB0aGV5IGFyZSBleHBvcnRlZCBpbiB0dXJuIHZpYSB0aGlzIGZ1bmN0aW9uIG9yXG4gKiBnb29nLmV4cG9ydFByb3BlcnR5XG4gKlxuICogPHA+QWxzbyBoYW5keSBmb3IgbWFraW5nIHB1YmxpYyBpdGVtcyB0aGF0IGFyZSBkZWZpbmVkIGluIGFub255bW91c1xuICogY2xvc3VyZXMuXG4gKlxuICogZXguIGdvb2cuZXhwb3J0U3ltYm9sKCdwdWJsaWMucGF0aC5Gb28nLCBGb28pO1xuICpcbiAqIGV4LiBnb29nLmV4cG9ydFN5bWJvbCgncHVibGljLnBhdGguRm9vLnN0YXRpY0Z1bmN0aW9uJyxcbiAqICAgICAgICAgICAgICAgICAgICAgICBGb28uc3RhdGljRnVuY3Rpb24pO1xuICogICAgIHB1YmxpYy5wYXRoLkZvby5zdGF0aWNGdW5jdGlvbigpO1xuICpcbiAqIGV4LiBnb29nLmV4cG9ydFN5bWJvbCgncHVibGljLnBhdGguRm9vLnByb3RvdHlwZS5teU1ldGhvZCcsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgRm9vLnByb3RvdHlwZS5teU1ldGhvZCk7XG4gKiAgICAgbmV3IHB1YmxpYy5wYXRoLkZvbygpLm15TWV0aG9kKCk7XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHB1YmxpY1BhdGggVW5vYmZ1c2NhdGVkIG5hbWUgdG8gZXhwb3J0LlxuICogQHBhcmFtIHsqfSBvYmplY3QgT2JqZWN0IHRoZSBuYW1lIHNob3VsZCBwb2ludCB0by5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X29iamVjdFRvRXhwb3J0VG8gVGhlIG9iamVjdCB0byBhZGQgdGhlIHBhdGggdG87IGRlZmF1bHRcbiAqICAgICBpcyB8Z29vZy5nbG9iYWx8LlxuICovXG5nb29nLmV4cG9ydFN5bWJvbCA9IGZ1bmN0aW9uKHB1YmxpY1BhdGgsIG9iamVjdCwgb3B0X29iamVjdFRvRXhwb3J0VG8pIHtcbiAgZ29vZy5leHBvcnRQYXRoXyhwdWJsaWNQYXRoLCBvYmplY3QsIG9wdF9vYmplY3RUb0V4cG9ydFRvKTtcbn07XG5cblxuLyoqXG4gKiBFeHBvcnRzIGEgcHJvcGVydHkgdW5vYmZ1c2NhdGVkIGludG8gdGhlIG9iamVjdCdzIG5hbWVzcGFjZS5cbiAqIGV4LiBnb29nLmV4cG9ydFByb3BlcnR5KEZvbywgJ3N0YXRpY0Z1bmN0aW9uJywgRm9vLnN0YXRpY0Z1bmN0aW9uKTtcbiAqIGV4LiBnb29nLmV4cG9ydFByb3BlcnR5KEZvby5wcm90b3R5cGUsICdteU1ldGhvZCcsIEZvby5wcm90b3R5cGUubXlNZXRob2QpO1xuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBPYmplY3Qgd2hvc2Ugc3RhdGljIHByb3BlcnR5IGlzIGJlaW5nIGV4cG9ydGVkLlxuICogQHBhcmFtIHtzdHJpbmd9IHB1YmxpY05hbWUgVW5vYmZ1c2NhdGVkIG5hbWUgdG8gZXhwb3J0LlxuICogQHBhcmFtIHsqfSBzeW1ib2wgT2JqZWN0IHRoZSBuYW1lIHNob3VsZCBwb2ludCB0by5cbiAqL1xuZ29vZy5leHBvcnRQcm9wZXJ0eSA9IGZ1bmN0aW9uKG9iamVjdCwgcHVibGljTmFtZSwgc3ltYm9sKSB7XG4gIG9iamVjdFtwdWJsaWNOYW1lXSA9IHN5bWJvbDtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVXNhZ2U6XG4gKiA8cHJlPlxuICogZnVuY3Rpb24gUGFyZW50Q2xhc3MoYSwgYikgeyB9XG4gKiBQYXJlbnRDbGFzcy5wcm90b3R5cGUuZm9vID0gZnVuY3Rpb24oYSkgeyB9XG4gKlxuICogZnVuY3Rpb24gQ2hpbGRDbGFzcyhhLCBiLCBjKSB7XG4gKiAgIGdvb2cuYmFzZSh0aGlzLCBhLCBiKTtcbiAqIH1cbiAqIGdvb2cuaW5oZXJpdHMoQ2hpbGRDbGFzcywgUGFyZW50Q2xhc3MpO1xuICpcbiAqIHZhciBjaGlsZCA9IG5ldyBDaGlsZENsYXNzKCdhJywgJ2InLCAnc2VlJyk7XG4gKiBjaGlsZC5mb28oKTsgLy8gd29ya3NcbiAqIDwvcHJlPlxuICpcbiAqIEluIGFkZGl0aW9uLCBhIHN1cGVyY2xhc3MnIGltcGxlbWVudGF0aW9uIG9mIGEgbWV0aG9kIGNhbiBiZSBpbnZva2VkXG4gKiBhcyBmb2xsb3dzOlxuICpcbiAqIDxwcmU+XG4gKiBDaGlsZENsYXNzLnByb3RvdHlwZS5mb28gPSBmdW5jdGlvbihhKSB7XG4gKiAgIENoaWxkQ2xhc3Muc3VwZXJDbGFzc18uZm9vLmNhbGwodGhpcywgYSk7XG4gKiAgIC8vIG90aGVyIGNvZGVcbiAqIH07XG4gKiA8L3ByZT5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjaGlsZEN0b3IgQ2hpbGQgY2xhc3MuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwYXJlbnRDdG9yIFBhcmVudCBjbGFzcy5cbiAqL1xuZ29vZy5pbmhlcml0cyA9IGZ1bmN0aW9uKGNoaWxkQ3RvciwgcGFyZW50Q3Rvcikge1xuICAvKiogQGNvbnN0cnVjdG9yICovXG4gIGZ1bmN0aW9uIHRlbXBDdG9yKCkge307XG4gIHRlbXBDdG9yLnByb3RvdHlwZSA9IHBhcmVudEN0b3IucHJvdG90eXBlO1xuICBjaGlsZEN0b3Iuc3VwZXJDbGFzc18gPSBwYXJlbnRDdG9yLnByb3RvdHlwZTtcbiAgY2hpbGRDdG9yLnByb3RvdHlwZSA9IG5ldyB0ZW1wQ3RvcigpO1xuICBjaGlsZEN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY2hpbGRDdG9yO1xufTtcblxuXG4vKipcbiAqIENhbGwgdXAgdG8gdGhlIHN1cGVyY2xhc3MuXG4gKlxuICogSWYgdGhpcyBpcyBjYWxsZWQgZnJvbSBhIGNvbnN0cnVjdG9yLCB0aGVuIHRoaXMgY2FsbHMgdGhlIHN1cGVyY2xhc3NcbiAqIGNvbnRydWN0b3Igd2l0aCBhcmd1bWVudHMgMS1OLlxuICpcbiAqIElmIHRoaXMgaXMgY2FsbGVkIGZyb20gYSBwcm90b3R5cGUgbWV0aG9kLCB0aGVuIHlvdSBtdXN0IHBhc3NcbiAqIHRoZSBuYW1lIG9mIHRoZSBtZXRob2QgYXMgdGhlIHNlY29uZCBhcmd1bWVudCB0byB0aGlzIGZ1bmN0aW9uLiBJZlxuICogeW91IGRvIG5vdCwgeW91IHdpbGwgZ2V0IGEgcnVudGltZSBlcnJvci4gVGhpcyBjYWxscyB0aGUgc3VwZXJjbGFzcydcbiAqIG1ldGhvZCB3aXRoIGFyZ3VtZW50cyAyLU4uXG4gKlxuICogVGhpcyBmdW5jdGlvbiBvbmx5IHdvcmtzIGlmIHlvdSB1c2UgZ29vZy5pbmhlcml0cyB0byBleHByZXNzXG4gKiBpbmhlcml0YW5jZSByZWxhdGlvbnNoaXBzIGJldHdlZW4geW91ciBjbGFzc2VzLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgYSBjb21waWxlciBwcmltaXRpdmUuIEF0IGNvbXBpbGUtdGltZSwgdGhlXG4gKiBjb21waWxlciB3aWxsIGRvIG1hY3JvIGV4cGFuc2lvbiB0byByZW1vdmUgYSBsb3Qgb2ZcbiAqIHRoZSBleHRyYSBvdmVyaGVhZCB0aGF0IHRoaXMgZnVuY3Rpb24gaW50cm9kdWNlcy4gVGhlIGNvbXBpbGVyXG4gKiB3aWxsIGFsc28gZW5mb3JjZSBhIGxvdCBvZiB0aGUgYXNzdW1wdGlvbnMgdGhhdCB0aGlzIGZ1bmN0aW9uXG4gKiBtYWtlcywgYW5kIHRyZWF0IGl0IGFzIGEgY29tcGlsZXIgZXJyb3IgaWYgeW91IGJyZWFrIHRoZW0uXG4gKlxuICogQHBhcmFtIHshT2JqZWN0fSBtZSBTaG91bGQgYWx3YXlzIGJlIFwidGhpc1wiLlxuICogQHBhcmFtIHsqPX0gb3B0X21ldGhvZE5hbWUgVGhlIG1ldGhvZCBuYW1lIGlmIGNhbGxpbmcgYSBzdXBlciBtZXRob2QuXG4gKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIFRoZSByZXN0IG9mIHRoZSBhcmd1bWVudHMuXG4gKiBAcmV0dXJuIHsqfSBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBzdXBlcmNsYXNzIG1ldGhvZC5cbiAqL1xuZ29vZy5iYXNlID0gZnVuY3Rpb24obWUsIG9wdF9tZXRob2ROYW1lLCB2YXJfYXJncykge1xuICB2YXIgY2FsbGVyID0gYXJndW1lbnRzLmNhbGxlZS5jYWxsZXI7XG4gIGlmIChjYWxsZXIuc3VwZXJDbGFzc18pIHtcbiAgICAvLyBUaGlzIGlzIGEgY29uc3RydWN0b3IuIENhbGwgdGhlIHN1cGVyY2xhc3MgY29uc3RydWN0b3IuXG4gICAgcmV0dXJuIGNhbGxlci5zdXBlckNsYXNzXy5jb25zdHJ1Y3Rvci5hcHBseShcbiAgICAgICAgbWUsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICB9XG5cbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICB2YXIgZm91bmRDYWxsZXIgPSBmYWxzZTtcbiAgZm9yICh2YXIgY3RvciA9IG1lLmNvbnN0cnVjdG9yO1xuICAgICAgIGN0b3I7IGN0b3IgPSBjdG9yLnN1cGVyQ2xhc3NfICYmIGN0b3Iuc3VwZXJDbGFzc18uY29uc3RydWN0b3IpIHtcbiAgICBpZiAoY3Rvci5wcm90b3R5cGVbb3B0X21ldGhvZE5hbWVdID09PSBjYWxsZXIpIHtcbiAgICAgIGZvdW5kQ2FsbGVyID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGZvdW5kQ2FsbGVyKSB7XG4gICAgICByZXR1cm4gY3Rvci5wcm90b3R5cGVbb3B0X21ldGhvZE5hbWVdLmFwcGx5KG1lLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICAvLyBJZiB3ZSBkaWQgbm90IGZpbmQgdGhlIGNhbGxlciBpbiB0aGUgcHJvdG90eXBlIGNoYWluLFxuICAvLyB0aGVuIG9uZSBvZiB0d28gdGhpbmdzIGhhcHBlbmVkOlxuICAvLyAxKSBUaGUgY2FsbGVyIGlzIGFuIGluc3RhbmNlIG1ldGhvZC5cbiAgLy8gMikgVGhpcyBtZXRob2Qgd2FzIG5vdCBjYWxsZWQgYnkgdGhlIHJpZ2h0IGNhbGxlci5cbiAgaWYgKG1lW29wdF9tZXRob2ROYW1lXSA9PT0gY2FsbGVyKSB7XG4gICAgcmV0dXJuIG1lLmNvbnN0cnVjdG9yLnByb3RvdHlwZVtvcHRfbWV0aG9kTmFtZV0uYXBwbHkobWUsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgICAnZ29vZy5iYXNlIGNhbGxlZCBmcm9tIGEgbWV0aG9kIG9mIG9uZSBuYW1lICcgK1xuICAgICAgICAndG8gYSBtZXRob2Qgb2YgYSBkaWZmZXJlbnQgbmFtZScpO1xuICB9XG59O1xuXG5cbi8qKlxuICogQWxsb3cgZm9yIGFsaWFzaW5nIHdpdGhpbiBzY29wZSBmdW5jdGlvbnMuICBUaGlzIGZ1bmN0aW9uIGV4aXN0cyBmb3JcbiAqIHVuY29tcGlsZWQgY29kZSAtIGluIGNvbXBpbGVkIGNvZGUgdGhlIGNhbGxzIHdpbGwgYmUgaW5saW5lZCBhbmQgdGhlXG4gKiBhbGlhc2VzIGFwcGxpZWQuICBJbiB1bmNvbXBpbGVkIGNvZGUgdGhlIGZ1bmN0aW9uIGlzIHNpbXBseSBydW4gc2luY2UgdGhlXG4gKiBhbGlhc2VzIGFzIHdyaXR0ZW4gYXJlIHZhbGlkIEphdmFTY3JpcHQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGZuIEZ1bmN0aW9uIHRvIGNhbGwuICBUaGlzIGZ1bmN0aW9uIGNhbiBjb250YWluIGFsaWFzZXNcbiAqICAgICB0byBuYW1lc3BhY2VzIChlLmcuIFwidmFyIGRvbSA9IGdvb2cuZG9tXCIpIG9yIGNsYXNzZXNcbiAqICAgIChlLmcuIFwidmFyIFRpbWVyID0gZ29vZy5UaW1lclwiKS5cbiAqL1xuZ29vZy5zY29wZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIGZuLmNhbGwoZ29vZy5nbG9iYWwpO1xufTtcblxuXG4iLCIvKipcbiAqIGRlZmluZXNcbiAqL1xuXG5nb29nLnByb3ZpZGUoJ1VTRV9UWVBFREFSUkFZJyk7XG5cbi8vIFNhZmFyaSDjgYwgdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICdvYmplY3QnIOOBq+OBquOCi+OBn+OCgeOAgVxuLy8g5pyq5a6a576p44GL5ZCm44GL44GnIFR5cGVkIEFycmF5IOOBruS9v+eUqOOCkuaxuuWumuOBmeOCi1xuXG4vKiogQGNvbnN0IHtib29sZWFufSB1c2UgdHlwZWQgYXJyYXkgZmxhZy4gKi9cbnZhciBVU0VfVFlQRURBUlJBWSA9XG4gICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpICYmXG4gICh0eXBlb2YgVWludDE2QXJyYXkgIT09ICd1bmRlZmluZWQnKSAmJlxuICAodHlwZW9mIFVpbnQzMkFycmF5ICE9PSAndW5kZWZpbmVkJykgJiZcbiAgKHR5cGVvZiBEYXRhVmlldyAhPT0gJ3VuZGVmaW5lZCcpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGJpdCDljZjkvY3jgafjga7mm7jjgY3ovrzjgb/lrp/oo4UuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5CaXRTdHJlYW0nKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIOODk+ODg+ODiOOCueODiOODquODvOODoFxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0geyEoQXJyYXl8VWludDhBcnJheSk9fSBidWZmZXIgb3V0cHV0IGJ1ZmZlci5cbiAqIEBwYXJhbSB7bnVtYmVyPX0gYnVmZmVyUG9zaXRpb24gc3RhcnQgYnVmZmVyIHBvaW50ZXIuXG4gKi9cblpsaWIuQml0U3RyZWFtID0gZnVuY3Rpb24oYnVmZmVyLCBidWZmZXJQb3NpdGlvbikge1xuICAvKiogQHR5cGUge251bWJlcn0gYnVmZmVyIGluZGV4LiAqL1xuICB0aGlzLmluZGV4ID0gdHlwZW9mIGJ1ZmZlclBvc2l0aW9uID09PSAnbnVtYmVyJyA/IGJ1ZmZlclBvc2l0aW9uIDogMDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJpdCBpbmRleC4gKi9cbiAgdGhpcy5iaXRpbmRleCA9IDA7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gYml0LXN0cmVhbSBvdXRwdXQgYnVmZmVyLiAqL1xuICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlciBpbnN0YW5jZW9mIChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkgP1xuICAgIGJ1ZmZlciA6XG4gICAgbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoWmxpYi5CaXRTdHJlYW0uRGVmYXVsdEJsb2NrU2l6ZSk7XG5cbiAgLy8g5YWl5Yqb44GV44KM44GfIGluZGV4IOOBjOi2s+OCiuOBquOBi+OBo+OBn+OCieaLoeW8teOBmeOCi+OBjOOAgeWAjeOBq+OBl+OBpuOCguODgOODoeOBquOCieS4jeato+OBqOOBmeOCi1xuICBpZiAodGhpcy5idWZmZXIubGVuZ3RoICogMiA8PSB0aGlzLmluZGV4KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBpbmRleFwiKTtcbiAgfSBlbHNlIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPD0gdGhpcy5pbmRleCkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKCk7XG4gIH1cbn07XG5cbi8qKlxuICog44OH44OV44Kp44Or44OI44OW44Ot44OD44Kv44K144Kk44K6LlxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5abGliLkJpdFN0cmVhbS5EZWZhdWx0QmxvY2tTaXplID0gMHg4MDAwO1xuXG4vKipcbiAqIGV4cGFuZCBidWZmZXIuXG4gKiBAcmV0dXJuIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBuZXcgYnVmZmVyLlxuICovXG5abGliLkJpdFN0cmVhbS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gb2xkIGJ1ZmZlci4gKi9cbiAgdmFyIG9sZGJ1ZiA9IHRoaXMuYnVmZmVyO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBjb3VudGVyLiAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgbGltaXRlci4gKi9cbiAgdmFyIGlsID0gb2xkYnVmLmxlbmd0aDtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBuZXcgYnVmZmVyLiAqL1xuICB2YXIgYnVmZmVyID1cbiAgICBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShpbCA8PCAxKTtcblxuICAvLyBjb3B5IGJ1ZmZlclxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBidWZmZXIuc2V0KG9sZGJ1Zik7XG4gIH0gZWxzZSB7XG4gICAgLy8gWFhYOiBsb29wIHVucm9sbGluZ1xuICAgIGZvciAoaSA9IDA7IGkgPCBpbDsgKytpKSB7XG4gICAgICBidWZmZXJbaV0gPSBvbGRidWZbaV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuICh0aGlzLmJ1ZmZlciA9IGJ1ZmZlcik7XG59O1xuXG5cbi8qKlxuICog5pWw5YCk44KS44OT44OD44OI44Gn5oyH5a6a44GX44Gf5pWw44Gg44GR5pu444GN6L6844KALlxuICogQHBhcmFtIHtudW1iZXJ9IG51bWJlciDmm7jjgY3ovrzjgoDmlbDlgKQuXG4gKiBAcGFyYW0ge251bWJlcn0gbiDmm7jjgY3ovrzjgoDjg5Pjg4Pjg4jmlbAuXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSByZXZlcnNlIOmAhumghuOBq+abuOOBjei+vOOCgOOBquOCieOBsCB0cnVlLlxuICovXG5abGliLkJpdFN0cmVhbS5wcm90b3R5cGUud3JpdGVCaXRzID0gZnVuY3Rpb24obnVtYmVyLCBuLCByZXZlcnNlKSB7XG4gIHZhciBidWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgdmFyIGluZGV4ID0gdGhpcy5pbmRleDtcbiAgdmFyIGJpdGluZGV4ID0gdGhpcy5iaXRpbmRleDtcblxuICAvKiogQHR5cGUge251bWJlcn0gY3VycmVudCBvY3RldC4gKi9cbiAgdmFyIGN1cnJlbnQgPSBidWZmZXJbaW5kZXhdO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBjb3VudGVyLiAqL1xuICB2YXIgaTtcblxuICAvKipcbiAgICogMzItYml0IOaVtOaVsOOBruODk+ODg+ODiOmghuOCkumAhuOBq+OBmeOCi1xuICAgKiBAcGFyYW0ge251bWJlcn0gbiAzMi1iaXQgaW50ZWdlci5cbiAgICogQHJldHVybiB7bnVtYmVyfSByZXZlcnNlZCAzMi1iaXQgaW50ZWdlci5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZ1bmN0aW9uIHJldjMyXyhuKSB7XG4gICAgcmV0dXJuIChabGliLkJpdFN0cmVhbS5SZXZlcnNlVGFibGVbbiAmIDB4RkZdIDw8IDI0KSB8XG4gICAgICAoWmxpYi5CaXRTdHJlYW0uUmV2ZXJzZVRhYmxlW24gPj4+IDggJiAweEZGXSA8PCAxNikgfFxuICAgICAgKFpsaWIuQml0U3RyZWFtLlJldmVyc2VUYWJsZVtuID4+PiAxNiAmIDB4RkZdIDw8IDgpIHxcbiAgICAgIFpsaWIuQml0U3RyZWFtLlJldmVyc2VUYWJsZVtuID4+PiAyNCAmIDB4RkZdO1xuICB9XG5cbiAgaWYgKHJldmVyc2UgJiYgbiA+IDEpIHtcbiAgICBudW1iZXIgPSBuID4gOCA/XG4gICAgICByZXYzMl8obnVtYmVyKSA+PiAoMzIgLSBuKSA6XG4gICAgICBabGliLkJpdFN0cmVhbS5SZXZlcnNlVGFibGVbbnVtYmVyXSA+PiAoOCAtIG4pO1xuICB9XG5cbiAgLy8gQnl0ZSDlooPnlYzjgpLotoXjgYjjgarjgYTjgajjgY1cbiAgaWYgKG4gKyBiaXRpbmRleCA8IDgpIHtcbiAgICBjdXJyZW50ID0gKGN1cnJlbnQgPDwgbikgfCBudW1iZXI7XG4gICAgYml0aW5kZXggKz0gbjtcbiAgLy8gQnl0ZSDlooPnlYzjgpLotoXjgYjjgovjgajjgY1cbiAgfSBlbHNlIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBjdXJyZW50ID0gKGN1cnJlbnQgPDwgMSkgfCAoKG51bWJlciA+PiBuIC0gaSAtIDEpICYgMSk7XG5cbiAgICAgIC8vIG5leHQgYnl0ZVxuICAgICAgaWYgKCsrYml0aW5kZXggPT09IDgpIHtcbiAgICAgICAgYml0aW5kZXggPSAwO1xuICAgICAgICBidWZmZXJbaW5kZXgrK10gPSBabGliLkJpdFN0cmVhbS5SZXZlcnNlVGFibGVbY3VycmVudF07XG4gICAgICAgIGN1cnJlbnQgPSAwO1xuXG4gICAgICAgIC8vIGV4cGFuZFxuICAgICAgICBpZiAoaW5kZXggPT09IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgICBidWZmZXIgPSB0aGlzLmV4cGFuZEJ1ZmZlcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGJ1ZmZlcltpbmRleF0gPSBjdXJyZW50O1xuXG4gIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICB0aGlzLmJpdGluZGV4ID0gYml0aW5kZXg7XG4gIHRoaXMuaW5kZXggPSBpbmRleDtcbn07XG5cblxuLyoqXG4gKiDjgrnjg4jjg6rjg7zjg6Djga7ntYLnq6/lh6bnkIbjgpLooYzjgYZcbiAqIEByZXR1cm4geyEoQXJyYXl8VWludDhBcnJheSl9IOe1guerr+WHpueQhuW+jOOBruODkOODg+ODleOCoeOCkiBieXRlIGFycmF5IOOBp+i/lOOBmS5cbiAqL1xuWmxpYi5CaXRTdHJlYW0ucHJvdG90eXBlLmZpbmlzaCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gIHZhciBpbmRleCA9IHRoaXMuaW5kZXg7XG5cbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyLiAqL1xuICB2YXIgb3V0cHV0O1xuXG4gIC8vIGJpdGluZGV4IOOBjCAwIOOBruaZguOBr+S9meWIhuOBqyBpbmRleCDjgYzpgLLjgpPjgafjgYTjgovnirbmhYtcbiAgaWYgKHRoaXMuYml0aW5kZXggPiAwKSB7XG4gICAgYnVmZmVyW2luZGV4XSA8PD0gOCAtIHRoaXMuYml0aW5kZXg7XG4gICAgYnVmZmVyW2luZGV4XSA9IFpsaWIuQml0U3RyZWFtLlJldmVyc2VUYWJsZVtidWZmZXJbaW5kZXhdXTtcbiAgICBpbmRleCsrO1xuICB9XG5cbiAgLy8gYXJyYXkgdHJ1bmNhdGlvblxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBvdXRwdXQgPSBidWZmZXIuc3ViYXJyYXkoMCwgaW5kZXgpO1xuICB9IGVsc2Uge1xuICAgIGJ1ZmZlci5sZW5ndGggPSBpbmRleDtcbiAgICBvdXRwdXQgPSBidWZmZXI7XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiAwLTI1NSDjga7jg5Pjg4Pjg4jpoIbjgpLlj43ou6LjgZfjgZ/jg4bjg7zjg5bjg6tcbiAqIEBjb25zdFxuICogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheS48bnVtYmVyPil9XG4gKi9cblpsaWIuQml0U3RyZWFtLlJldmVyc2VUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gdGFibGU7XG59KSgoZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gcmV2ZXJzZSB0YWJsZS4gKi9cbiAgdmFyIHRhYmxlID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoMjU2KTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGk7XG5cbiAgLy8gZ2VuZXJhdGVcbiAgZm9yIChpID0gMDsgaSA8IDI1NjsgKytpKSB7XG4gICAgdGFibGVbaV0gPSAoZnVuY3Rpb24obikge1xuICAgICAgdmFyIHIgPSBuO1xuICAgICAgdmFyIHMgPSA3O1xuXG4gICAgICBmb3IgKG4gPj4+PSAxOyBuOyBuID4+Pj0gMSkge1xuICAgICAgICByIDw8PSAxO1xuICAgICAgICByIHw9IG4gJiAxO1xuICAgICAgICAtLXM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAociA8PCBzICYgMHhmZikgPj4+IDA7XG4gICAgfSkoaSk7XG4gIH1cblxuICByZXR1cm4gdGFibGU7XG59KSgpKTtcblxuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuXG4vKiB2aW06c2V0IGV4cGFuZHRhYiB0cz0yIHN3PTIgdHc9ODA6ICovXG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ1JDMzIg5a6f6KOFLlxuICovXG5nb29nLnByb3ZpZGUoJ1psaWIuQ1JDMzInKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuXG4vKiogQGRlZmluZSB7Ym9vbGVhbn0gKi9cbnZhciBaTElCX0NSQzMyX0NPTVBBQ1QgPSBmYWxzZTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBDUkMzMiDjg4/jg4Pjgrfjg6XlgKTjgpLlj5blvpdcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gZGF0YSBkYXRhIGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0ge251bWJlcj19IHBvcyBkYXRhIHBvc2l0aW9uLlxuICogQHBhcmFtIHtudW1iZXI9fSBsZW5ndGggZGF0YSBsZW5ndGguXG4gKiBAcmV0dXJuIHtudW1iZXJ9IENSQzMyLlxuICovXG5abGliLkNSQzMyLmNhbGMgPSBmdW5jdGlvbihkYXRhLCBwb3MsIGxlbmd0aCkge1xuICByZXR1cm4gWmxpYi5DUkMzMi51cGRhdGUoZGF0YSwgMCwgcG9zLCBsZW5ndGgpO1xufTtcblxuLyoqXG4gKiBDUkMzMuODj+ODg+OCt+ODpeWApOOCkuabtOaWsFxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBkYXRhIGRhdGEgYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBjcmMgQ1JDMzIuXG4gKiBAcGFyYW0ge251bWJlcj19IHBvcyBkYXRhIHBvc2l0aW9uLlxuICogQHBhcmFtIHtudW1iZXI9fSBsZW5ndGggZGF0YSBsZW5ndGguXG4gKiBAcmV0dXJuIHtudW1iZXJ9IENSQzMyLlxuICovXG5abGliLkNSQzMyLnVwZGF0ZSA9IGZ1bmN0aW9uKGRhdGEsIGNyYywgcG9zLCBsZW5ndGgpIHtcbiAgdmFyIHRhYmxlID0gWmxpYi5DUkMzMi5UYWJsZTtcbiAgdmFyIGkgPSAodHlwZW9mIHBvcyA9PT0gJ251bWJlcicpID8gcG9zIDogKHBvcyA9IDApO1xuICB2YXIgaWwgPSAodHlwZW9mIGxlbmd0aCA9PT0gJ251bWJlcicpID8gbGVuZ3RoIDogZGF0YS5sZW5ndGg7XG5cbiAgY3JjIF49IDB4ZmZmZmZmZmY7XG5cbiAgLy8gbG9vcCB1bnJvbGxpbmcgZm9yIHBlcmZvcm1hbmNlXG4gIGZvciAoaSA9IGlsICYgNzsgaS0tOyArK3Bvcykge1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdGFibGVbKGNyYyBeIGRhdGFbcG9zXSkgJiAweGZmXTtcbiAgfVxuICBmb3IgKGkgPSBpbCA+PiAzOyBpLS07IHBvcyArPSA4KSB7XG4gICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVsoY3JjIF4gZGF0YVtwb3MgICAgXSkgJiAweGZmXTtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW3BvcyArIDFdKSAmIDB4ZmZdO1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdGFibGVbKGNyYyBeIGRhdGFbcG9zICsgMl0pICYgMHhmZl07XG4gICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVsoY3JjIF4gZGF0YVtwb3MgKyAzXSkgJiAweGZmXTtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW3BvcyArIDRdKSAmIDB4ZmZdO1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdGFibGVbKGNyYyBeIGRhdGFbcG9zICsgNV0pICYgMHhmZl07XG4gICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVsoY3JjIF4gZGF0YVtwb3MgKyA2XSkgJiAweGZmXTtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW3BvcyArIDddKSAmIDB4ZmZdO1xuICB9XG5cbiAgcmV0dXJuIChjcmMgXiAweGZmZmZmZmZmKSA+Pj4gMDtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtudW1iZXJ9IG51bVxuICogQHBhcmFtIHtudW1iZXJ9IGNyY1xuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuWmxpYi5DUkMzMi5zaW5nbGUgPSBmdW5jdGlvbihudW0sIGNyYykge1xuICByZXR1cm4gKFpsaWIuQ1JDMzIuVGFibGVbKG51bSBeIGNyYykgJiAweGZmXSBeIChudW0gPj4+IDgpKSA+Pj4gMDtcbn07XG5cbi8qKlxuICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxuICogQGNvbnN0XG4gKiBAcHJpdmF0ZVxuICovXG5abGliLkNSQzMyLlRhYmxlXyA9IFtcbiAgMHgwMDAwMDAwMCwgMHg3NzA3MzA5NiwgMHhlZTBlNjEyYywgMHg5OTA5NTFiYSwgMHgwNzZkYzQxOSwgMHg3MDZhZjQ4ZixcbiAgMHhlOTYzYTUzNSwgMHg5ZTY0OTVhMywgMHgwZWRiODgzMiwgMHg3OWRjYjhhNCwgMHhlMGQ1ZTkxZSwgMHg5N2QyZDk4OCxcbiAgMHgwOWI2NGMyYiwgMHg3ZWIxN2NiZCwgMHhlN2I4MmQwNywgMHg5MGJmMWQ5MSwgMHgxZGI3MTA2NCwgMHg2YWIwMjBmMixcbiAgMHhmM2I5NzE0OCwgMHg4NGJlNDFkZSwgMHgxYWRhZDQ3ZCwgMHg2ZGRkZTRlYiwgMHhmNGQ0YjU1MSwgMHg4M2QzODVjNyxcbiAgMHgxMzZjOTg1NiwgMHg2NDZiYThjMCwgMHhmZDYyZjk3YSwgMHg4YTY1YzllYywgMHgxNDAxNWM0ZiwgMHg2MzA2NmNkOSxcbiAgMHhmYTBmM2Q2MywgMHg4ZDA4MGRmNSwgMHgzYjZlMjBjOCwgMHg0YzY5MTA1ZSwgMHhkNTYwNDFlNCwgMHhhMjY3NzE3MixcbiAgMHgzYzAzZTRkMSwgMHg0YjA0ZDQ0NywgMHhkMjBkODVmZCwgMHhhNTBhYjU2YiwgMHgzNWI1YThmYSwgMHg0MmIyOTg2YyxcbiAgMHhkYmJiYzlkNiwgMHhhY2JjZjk0MCwgMHgzMmQ4NmNlMywgMHg0NWRmNWM3NSwgMHhkY2Q2MGRjZiwgMHhhYmQxM2Q1OSxcbiAgMHgyNmQ5MzBhYywgMHg1MWRlMDAzYSwgMHhjOGQ3NTE4MCwgMHhiZmQwNjExNiwgMHgyMWI0ZjRiNSwgMHg1NmIzYzQyMyxcbiAgMHhjZmJhOTU5OSwgMHhiOGJkYTUwZiwgMHgyODAyYjg5ZSwgMHg1ZjA1ODgwOCwgMHhjNjBjZDliMiwgMHhiMTBiZTkyNCxcbiAgMHgyZjZmN2M4NywgMHg1ODY4NGMxMSwgMHhjMTYxMWRhYiwgMHhiNjY2MmQzZCwgMHg3NmRjNDE5MCwgMHgwMWRiNzEwNixcbiAgMHg5OGQyMjBiYywgMHhlZmQ1MTAyYSwgMHg3MWIxODU4OSwgMHgwNmI2YjUxZiwgMHg5ZmJmZTRhNSwgMHhlOGI4ZDQzMyxcbiAgMHg3ODA3YzlhMiwgMHgwZjAwZjkzNCwgMHg5NjA5YTg4ZSwgMHhlMTBlOTgxOCwgMHg3ZjZhMGRiYiwgMHgwODZkM2QyZCxcbiAgMHg5MTY0NmM5NywgMHhlNjYzNWMwMSwgMHg2YjZiNTFmNCwgMHgxYzZjNjE2MiwgMHg4NTY1MzBkOCwgMHhmMjYyMDA0ZSxcbiAgMHg2YzA2OTVlZCwgMHgxYjAxYTU3YiwgMHg4MjA4ZjRjMSwgMHhmNTBmYzQ1NywgMHg2NWIwZDljNiwgMHgxMmI3ZTk1MCxcbiAgMHg4YmJlYjhlYSwgMHhmY2I5ODg3YywgMHg2MmRkMWRkZiwgMHgxNWRhMmQ0OSwgMHg4Y2QzN2NmMywgMHhmYmQ0NGM2NSxcbiAgMHg0ZGIyNjE1OCwgMHgzYWI1NTFjZSwgMHhhM2JjMDA3NCwgMHhkNGJiMzBlMiwgMHg0YWRmYTU0MSwgMHgzZGQ4OTVkNyxcbiAgMHhhNGQxYzQ2ZCwgMHhkM2Q2ZjRmYiwgMHg0MzY5ZTk2YSwgMHgzNDZlZDlmYywgMHhhZDY3ODg0NiwgMHhkYTYwYjhkMCxcbiAgMHg0NDA0MmQ3MywgMHgzMzAzMWRlNSwgMHhhYTBhNGM1ZiwgMHhkZDBkN2NjOSwgMHg1MDA1NzEzYywgMHgyNzAyNDFhYSxcbiAgMHhiZTBiMTAxMCwgMHhjOTBjMjA4NiwgMHg1NzY4YjUyNSwgMHgyMDZmODViMywgMHhiOTY2ZDQwOSwgMHhjZTYxZTQ5ZixcbiAgMHg1ZWRlZjkwZSwgMHgyOWQ5Yzk5OCwgMHhiMGQwOTgyMiwgMHhjN2Q3YThiNCwgMHg1OWIzM2QxNywgMHgyZWI0MGQ4MSxcbiAgMHhiN2JkNWMzYiwgMHhjMGJhNmNhZCwgMHhlZGI4ODMyMCwgMHg5YWJmYjNiNiwgMHgwM2I2ZTIwYywgMHg3NGIxZDI5YSxcbiAgMHhlYWQ1NDczOSwgMHg5ZGQyNzdhZiwgMHgwNGRiMjYxNSwgMHg3M2RjMTY4MywgMHhlMzYzMGIxMiwgMHg5NDY0M2I4NCxcbiAgMHgwZDZkNmEzZSwgMHg3YTZhNWFhOCwgMHhlNDBlY2YwYiwgMHg5MzA5ZmY5ZCwgMHgwYTAwYWUyNywgMHg3ZDA3OWViMSxcbiAgMHhmMDBmOTM0NCwgMHg4NzA4YTNkMiwgMHgxZTAxZjI2OCwgMHg2OTA2YzJmZSwgMHhmNzYyNTc1ZCwgMHg4MDY1NjdjYixcbiAgMHgxOTZjMzY3MSwgMHg2ZTZiMDZlNywgMHhmZWQ0MWI3NiwgMHg4OWQzMmJlMCwgMHgxMGRhN2E1YSwgMHg2N2RkNGFjYyxcbiAgMHhmOWI5ZGY2ZiwgMHg4ZWJlZWZmOSwgMHgxN2I3YmU0MywgMHg2MGIwOGVkNSwgMHhkNmQ2YTNlOCwgMHhhMWQxOTM3ZSxcbiAgMHgzOGQ4YzJjNCwgMHg0ZmRmZjI1MiwgMHhkMWJiNjdmMSwgMHhhNmJjNTc2NywgMHgzZmI1MDZkZCwgMHg0OGIyMzY0YixcbiAgMHhkODBkMmJkYSwgMHhhZjBhMWI0YywgMHgzNjAzNGFmNiwgMHg0MTA0N2E2MCwgMHhkZjYwZWZjMywgMHhhODY3ZGY1NSxcbiAgMHgzMTZlOGVlZiwgMHg0NjY5YmU3OSwgMHhjYjYxYjM4YywgMHhiYzY2ODMxYSwgMHgyNTZmZDJhMCwgMHg1MjY4ZTIzNixcbiAgMHhjYzBjNzc5NSwgMHhiYjBiNDcwMywgMHgyMjAyMTZiOSwgMHg1NTA1MjYyZiwgMHhjNWJhM2JiZSwgMHhiMmJkMGIyOCxcbiAgMHgyYmI0NWE5MiwgMHg1Y2IzNmEwNCwgMHhjMmQ3ZmZhNywgMHhiNWQwY2YzMSwgMHgyY2Q5OWU4YiwgMHg1YmRlYWUxZCxcbiAgMHg5YjY0YzJiMCwgMHhlYzYzZjIyNiwgMHg3NTZhYTM5YywgMHgwMjZkOTMwYSwgMHg5YzA5MDZhOSwgMHhlYjBlMzYzZixcbiAgMHg3MjA3Njc4NSwgMHgwNTAwNTcxMywgMHg5NWJmNGE4MiwgMHhlMmI4N2ExNCwgMHg3YmIxMmJhZSwgMHgwY2I2MWIzOCxcbiAgMHg5MmQyOGU5YiwgMHhlNWQ1YmUwZCwgMHg3Y2RjZWZiNywgMHgwYmRiZGYyMSwgMHg4NmQzZDJkNCwgMHhmMWQ0ZTI0MixcbiAgMHg2OGRkYjNmOCwgMHgxZmRhODM2ZSwgMHg4MWJlMTZjZCwgMHhmNmI5MjY1YiwgMHg2ZmIwNzdlMSwgMHgxOGI3NDc3NyxcbiAgMHg4ODA4NWFlNiwgMHhmZjBmNmE3MCwgMHg2NjA2M2JjYSwgMHgxMTAxMGI1YywgMHg4ZjY1OWVmZiwgMHhmODYyYWU2OSxcbiAgMHg2MTZiZmZkMywgMHgxNjZjY2Y0NSwgMHhhMDBhZTI3OCwgMHhkNzBkZDJlZSwgMHg0ZTA0ODM1NCwgMHgzOTAzYjNjMixcbiAgMHhhNzY3MjY2MSwgMHhkMDYwMTZmNywgMHg0OTY5NDc0ZCwgMHgzZTZlNzdkYiwgMHhhZWQxNmE0YSwgMHhkOWQ2NWFkYyxcbiAgMHg0MGRmMGI2NiwgMHgzN2Q4M2JmMCwgMHhhOWJjYWU1MywgMHhkZWJiOWVjNSwgMHg0N2IyY2Y3ZiwgMHgzMGI1ZmZlOSxcbiAgMHhiZGJkZjIxYywgMHhjYWJhYzI4YSwgMHg1M2IzOTMzMCwgMHgyNGI0YTNhNiwgMHhiYWQwMzYwNSwgMHhjZGQ3MDY5MyxcbiAgMHg1NGRlNTcyOSwgMHgyM2Q5NjdiZiwgMHhiMzY2N2EyZSwgMHhjNDYxNGFiOCwgMHg1ZDY4MWIwMiwgMHgyYTZmMmI5NCxcbiAgMHhiNDBiYmUzNywgMHhjMzBjOGVhMSwgMHg1YTA1ZGYxYiwgMHgyZDAyZWY4ZFxuXTtcblxuLyoqXG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9IENSQy0zMiBUYWJsZS5cbiAqIEBjb25zdFxuICovXG5abGliLkNSQzMyLlRhYmxlID0gWkxJQl9DUkMzMl9DT01QQUNUID8gKGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqL1xuICB2YXIgdGFibGUgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDMyQXJyYXkgOiBBcnJheSkoMjU2KTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBjO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgajtcblxuICBmb3IgKGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgICBjID0gaTtcbiAgICBmb3IgKGogPSAwOyBqIDwgODsgKytqKSB7XG4gICAgICBjID0gKGMgJiAxKSA/ICgweGVkQjg4MzIwIF4gKGMgPj4+IDEpKSA6IChjID4+PiAxKTtcbiAgICB9XG4gICAgdGFibGVbaV0gPSBjID4+PiAwO1xuICB9XG5cbiAgcmV0dXJuIHRhYmxlO1xufSkoKSA6IFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQzMkFycmF5KFpsaWIuQ1JDMzIuVGFibGVfKSA6IFpsaWIuQ1JDMzIuVGFibGVfO1xuXG59KTtcbiIsImdvb2cucHJvdmlkZSgnWmxpYi5HdW56aXBNZW1iZXInKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuWmxpYi5HdW56aXBNZW1iZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHNpZ25hdHVyZSBmaXJzdCBieXRlLiAqL1xuICB0aGlzLmlkMTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHNpZ25hdHVyZSBzZWNvbmQgYnl0ZS4gKi9cbiAgdGhpcy5pZDI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjb21wcmVzc2lvbiBtZXRob2QuICovXG4gIHRoaXMuY207XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBmbGFncy4gKi9cbiAgdGhpcy5mbGc7XG4gIC8qKiBAdHlwZSB7RGF0ZX0gbW9kaWZpY2F0aW9uIHRpbWUuICovXG4gIHRoaXMubXRpbWU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBleHRyYSBmbGFncy4gKi9cbiAgdGhpcy54Zmw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBvcGVyYXRpbmcgc3lzdGVtIG51bWJlci4gKi9cbiAgdGhpcy5vcztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IENSQy0xNiB2YWx1ZSBmb3IgRkhDUkMgZmxhZy4gKi9cbiAgdGhpcy5jcmMxNjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGV4dHJhIGxlbmd0aC4gKi9cbiAgdGhpcy54bGVuO1xuICAvKiogQHR5cGUge251bWJlcn0gQ1JDLTMyIHZhbHVlIGZvciB2ZXJpZmljYXRpb24uICovXG4gIHRoaXMuY3JjMzI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBzaXplIG1vZHVsbyAzMiB2YWx1ZS4gKi9cbiAgdGhpcy5pc2l6ZTtcbiAgLyoqIEB0eXBlIHtzdHJpbmd9IGZpbGVuYW1lLiAqL1xuICB0aGlzLm5hbWU7XG4gIC8qKiBAdHlwZSB7c3RyaW5nfSBjb21tZW50LiAqL1xuICB0aGlzLmNvbW1lbnQ7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gKi9cbiAgdGhpcy5kYXRhO1xufTtcblxuWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldE5hbWUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMubmFtZTtcbn07XG5cblpsaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXREYXRhID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmRhdGE7XG59O1xuXG5abGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TXRpbWUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMubXRpbWU7XG59XG5cbn0pOyIsIi8qKlxuICogQGZpbGVvdmVydmlldyBIZWFwIFNvcnQg5a6f6KOFLiDjg4/jg5Xjg57jg7PnrKblj7fljJbjgafkvb/nlKjjgZnjgosuXG4gKi9cblxuZ29vZy5wcm92aWRlKCdabGliLkhlYXAnKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIOOCq+OCueOCv+ODoOODj+ODleODnuODs+espuWPt+OBp+S9v+eUqOOBmeOCi+ODkuODvOODl+Wun+ijhVxuICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCDjg5Ljg7zjg5fjgrXjgqTjgrouXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuWmxpYi5IZWFwID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gIHRoaXMuYnVmZmVyID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQxNkFycmF5IDogQXJyYXkpKGxlbmd0aCAqIDIpO1xuICB0aGlzLmxlbmd0aCA9IDA7XG59O1xuXG4vKipcbiAqIOimquODjuODvOODieOBriBpbmRleCDlj5blvpdcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCDlrZDjg47jg7zjg4njga4gaW5kZXguXG4gKiBAcmV0dXJuIHtudW1iZXJ9IOimquODjuODvOODieOBriBpbmRleC5cbiAqXG4gKi9cblpsaWIuSGVhcC5wcm90b3R5cGUuZ2V0UGFyZW50ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgcmV0dXJuICgoaW5kZXggLSAyKSAvIDQgfCAwKSAqIDI7XG59O1xuXG4vKipcbiAqIOWtkOODjuODvOODieOBriBpbmRleCDlj5blvpdcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCDopqrjg47jg7zjg4njga4gaW5kZXguXG4gKiBAcmV0dXJuIHtudW1iZXJ9IOWtkOODjuODvOODieOBriBpbmRleC5cbiAqL1xuWmxpYi5IZWFwLnByb3RvdHlwZS5nZXRDaGlsZCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gIHJldHVybiAyICogaW5kZXggKyAyO1xufTtcblxuLyoqXG4gKiBIZWFwIOOBq+WApOOCkui/veWKoOOBmeOCi1xuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IOOCreODvCBpbmRleC5cbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSDlgKQuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IOePvuWcqOOBruODkuODvOODl+mVty5cbiAqL1xuWmxpYi5IZWFwLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oaW5kZXgsIHZhbHVlKSB7XG4gIHZhciBjdXJyZW50LCBwYXJlbnQsXG4gICAgICBoZWFwID0gdGhpcy5idWZmZXIsXG4gICAgICBzd2FwO1xuXG4gIGN1cnJlbnQgPSB0aGlzLmxlbmd0aDtcbiAgaGVhcFt0aGlzLmxlbmd0aCsrXSA9IHZhbHVlO1xuICBoZWFwW3RoaXMubGVuZ3RoKytdID0gaW5kZXg7XG5cbiAgLy8g44Or44O844OI44OO44O844OJ44Gr44Gf44Gp44KK552A44GP44G+44Gn5YWl44KM5pu/44GI44KS6Kmm44G/44KLXG4gIHdoaWxlIChjdXJyZW50ID4gMCkge1xuICAgIHBhcmVudCA9IHRoaXMuZ2V0UGFyZW50KGN1cnJlbnQpO1xuXG4gICAgLy8g6Kaq44OO44O844OJ44Go5q+U6LyD44GX44Gm6Kaq44Gu5pa544GM5bCP44GV44GR44KM44Gw5YWl44KM5pu/44GI44KLXG4gICAgaWYgKGhlYXBbY3VycmVudF0gPiBoZWFwW3BhcmVudF0pIHtcbiAgICAgIHN3YXAgPSBoZWFwW2N1cnJlbnRdO1xuICAgICAgaGVhcFtjdXJyZW50XSA9IGhlYXBbcGFyZW50XTtcbiAgICAgIGhlYXBbcGFyZW50XSA9IHN3YXA7XG5cbiAgICAgIHN3YXAgPSBoZWFwW2N1cnJlbnQgKyAxXTtcbiAgICAgIGhlYXBbY3VycmVudCArIDFdID0gaGVhcFtwYXJlbnQgKyAxXTtcbiAgICAgIGhlYXBbcGFyZW50ICsgMV0gPSBzd2FwO1xuXG4gICAgICBjdXJyZW50ID0gcGFyZW50O1xuICAgIC8vIOWFpeOCjOabv+OBiOOBjOW/heimgeOBquOBj+OBquOBo+OBn+OCieOBneOBk+OBp+aKnOOBkeOCi1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcy5sZW5ndGg7XG59O1xuXG4vKipcbiAqIEhlYXDjgYvjgonkuIDnlarlpKfjgY3jgYTlgKTjgpLov5TjgZlcbiAqIEByZXR1cm4ge3tpbmRleDogbnVtYmVyLCB2YWx1ZTogbnVtYmVyLCBsZW5ndGg6IG51bWJlcn19IHtpbmRleDog44Kt44O8aW5kZXgsXG4gKiAgICAgdmFsdWU6IOWApCwgbGVuZ3RoOiDjg5Ljg7zjg5fplbd9IOOBriBPYmplY3QuXG4gKi9cblpsaWIuSGVhcC5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpbmRleCwgdmFsdWUsXG4gICAgICBoZWFwID0gdGhpcy5idWZmZXIsIHN3YXAsXG4gICAgICBjdXJyZW50LCBwYXJlbnQ7XG5cbiAgdmFsdWUgPSBoZWFwWzBdO1xuICBpbmRleCA9IGhlYXBbMV07XG5cbiAgLy8g5b6M44KN44GL44KJ5YCk44KS5Y+W44KLXG4gIHRoaXMubGVuZ3RoIC09IDI7XG4gIGhlYXBbMF0gPSBoZWFwW3RoaXMubGVuZ3RoXTtcbiAgaGVhcFsxXSA9IGhlYXBbdGhpcy5sZW5ndGggKyAxXTtcblxuICBwYXJlbnQgPSAwO1xuICAvLyDjg6vjg7zjg4jjg47jg7zjg4njgYvjgonkuIvjgYzjgaPjgabjgYTjgY9cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBjdXJyZW50ID0gdGhpcy5nZXRDaGlsZChwYXJlbnQpO1xuXG4gICAgLy8g56+E5Zuy44OB44Kn44OD44KvXG4gICAgaWYgKGN1cnJlbnQgPj0gdGhpcy5sZW5ndGgpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIOmao+OBruODjuODvOODieOBqOavlOi8g+OBl+OBpuOAgemao+OBruaWueOBjOWApOOBjOWkp+OBjeOBkeOCjOOBsOmao+OCkuePvuWcqOODjuODvOODieOBqOOBl+OBpumBuOaKnlxuICAgIGlmIChjdXJyZW50ICsgMiA8IHRoaXMubGVuZ3RoICYmIGhlYXBbY3VycmVudCArIDJdID4gaGVhcFtjdXJyZW50XSkge1xuICAgICAgY3VycmVudCArPSAyO1xuICAgIH1cblxuICAgIC8vIOimquODjuODvOODieOBqOavlOi8g+OBl+OBpuimquOBruaWueOBjOWwj+OBleOBhOWgtOWQiOOBr+WFpeOCjOabv+OBiOOCi1xuICAgIGlmIChoZWFwW2N1cnJlbnRdID4gaGVhcFtwYXJlbnRdKSB7XG4gICAgICBzd2FwID0gaGVhcFtwYXJlbnRdO1xuICAgICAgaGVhcFtwYXJlbnRdID0gaGVhcFtjdXJyZW50XTtcbiAgICAgIGhlYXBbY3VycmVudF0gPSBzd2FwO1xuXG4gICAgICBzd2FwID0gaGVhcFtwYXJlbnQgKyAxXTtcbiAgICAgIGhlYXBbcGFyZW50ICsgMV0gPSBoZWFwW2N1cnJlbnQgKyAxXTtcbiAgICAgIGhlYXBbY3VycmVudCArIDFdID0gc3dhcDtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcGFyZW50ID0gY3VycmVudDtcbiAgfVxuXG4gIHJldHVybiB7aW5kZXg6IGluZGV4LCB2YWx1ZTogdmFsdWUsIGxlbmd0aDogdGhpcy5sZW5ndGh9O1xufTtcblxuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuXG4vKiB2aW06c2V0IGV4cGFuZHRhYiB0cz0yIHN3PTIgdHc9ODA6ICovXG4iLCJnb29nLnByb3ZpZGUoJ1psaWIuSHVmZm1hbicpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogYnVpbGQgaHVmZm1hbiB0YWJsZSBmcm9tIGxlbmd0aCBsaXN0LlxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBsZW5ndGhzIGxlbmd0aCBsaXN0LlxuICogQHJldHVybiB7IUFycmF5fSBodWZmbWFuIHRhYmxlLlxuICovXG5abGliLkh1ZmZtYW4uYnVpbGRIdWZmbWFuVGFibGUgPSBmdW5jdGlvbihsZW5ndGhzKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsZW5ndGggbGlzdCBzaXplLiAqL1xuICB2YXIgbGlzdFNpemUgPSBsZW5ndGhzLmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG1heCBjb2RlIGxlbmd0aCBmb3IgdGFibGUgc2l6ZS4gKi9cbiAgdmFyIG1heENvZGVMZW5ndGggPSAwO1xuICAvKiogQHR5cGUge251bWJlcn0gbWluIGNvZGUgbGVuZ3RoIGZvciB0YWJsZSBzaXplLiAqL1xuICB2YXIgbWluQ29kZUxlbmd0aCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHRhYmxlIHNpemUuICovXG4gIHZhciBzaXplO1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IGh1ZmZtYW4gY29kZSB0YWJsZS4gKi9cbiAgdmFyIHRhYmxlO1xuICAvKiogQHR5cGUge251bWJlcn0gYml0IGxlbmd0aC4gKi9cbiAgdmFyIGJpdExlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZS4gKi9cbiAgdmFyIGNvZGU7XG4gIC8qKlxuICAgKiDjgrXjgqTjgrrjgYwgMl5tYXhsZW5ndGgg5YCL44Gu44OG44O844OW44Or44KS5Z+L44KB44KL44Gf44KB44Gu44K544Kt44OD44OX6ZW3LlxuICAgKiBAdHlwZSB7bnVtYmVyfSBza2lwIGxlbmd0aCBmb3IgdGFibGUgZmlsbGluZy5cbiAgICovXG4gIHZhciBza2lwO1xuICAvKiogQHR5cGUge251bWJlcn0gcmV2ZXJzZWQgY29kZS4gKi9cbiAgdmFyIHJldmVyc2VkO1xuICAvKiogQHR5cGUge251bWJlcn0gcmV2ZXJzZSB0ZW1wLiAqL1xuICB2YXIgcnRlbXA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBsaW1pdC4gKi9cbiAgdmFyIGlsO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBjb3VudGVyLiAqL1xuICB2YXIgajtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHRhYmxlIHZhbHVlLiAqL1xuICB2YXIgdmFsdWU7XG5cbiAgLy8gTWF0aC5tYXgg44Gv6YGF44GE44Gu44Gn5pyA6ZW344Gu5YCk44GvIGZvci1sb29wIOOBp+WPluW+l+OBmeOCi1xuICBmb3IgKGkgPSAwLCBpbCA9IGxpc3RTaXplOyBpIDwgaWw7ICsraSkge1xuICAgIGlmIChsZW5ndGhzW2ldID4gbWF4Q29kZUxlbmd0aCkge1xuICAgICAgbWF4Q29kZUxlbmd0aCA9IGxlbmd0aHNbaV07XG4gICAgfVxuICAgIGlmIChsZW5ndGhzW2ldIDwgbWluQ29kZUxlbmd0aCkge1xuICAgICAgbWluQ29kZUxlbmd0aCA9IGxlbmd0aHNbaV07XG4gICAgfVxuICB9XG5cbiAgc2l6ZSA9IDEgPDwgbWF4Q29kZUxlbmd0aDtcbiAgdGFibGUgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDMyQXJyYXkgOiBBcnJheSkoc2l6ZSk7XG5cbiAgLy8g44OT44OD44OI6ZW344Gu55+t44GE6aCG44GL44KJ44OP44OV44Oe44Oz56ym5Y+344KS5Ymy44KK5b2T44Gm44KLXG4gIGZvciAoYml0TGVuZ3RoID0gMSwgY29kZSA9IDAsIHNraXAgPSAyOyBiaXRMZW5ndGggPD0gbWF4Q29kZUxlbmd0aDspIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdFNpemU7ICsraSkge1xuICAgICAgaWYgKGxlbmd0aHNbaV0gPT09IGJpdExlbmd0aCkge1xuICAgICAgICAvLyDjg5Pjg4Pjg4jjgqrjg7zjg4Djg7zjgYzpgIbjgavjgarjgovjgZ/jgoHjg5Pjg4Pjg4jplbfliIbkuKbjgbPjgpLlj43ou6LjgZnjgotcbiAgICAgICAgZm9yIChyZXZlcnNlZCA9IDAsIHJ0ZW1wID0gY29kZSwgaiA9IDA7IGogPCBiaXRMZW5ndGg7ICsraikge1xuICAgICAgICAgIHJldmVyc2VkID0gKHJldmVyc2VkIDw8IDEpIHwgKHJ0ZW1wICYgMSk7XG4gICAgICAgICAgcnRlbXAgPj49IDE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmnIDlpKfjg5Pjg4Pjg4jplbfjgpLjgoLjgajjgavjg4bjg7zjg5bjg6vjgpLkvZzjgovjgZ/jgoHjgIFcbiAgICAgICAgLy8g5pyA5aSn44OT44OD44OI6ZW35Lul5aSW44Gn44GvIDAgLyAxIOOBqeOBoeOCieOBp+OCguiJr+OBhOeuh+aJgOOBjOOBp+OBjeOCi1xuICAgICAgICAvLyDjgZ3jga7jganjgaHjgonjgafjgoLoia/jgYTloLTmiYDjga/lkIzjgZjlgKTjgafln4vjgoHjgovjgZPjgajjgadcbiAgICAgICAgLy8g5pys5p2l44Gu44OT44OD44OI6ZW35Lul5LiK44Gu44OT44OD44OI5pWw5Y+W5b6X44GX44Gm44KC5ZWP6aGM44GM6LW344GT44KJ44Gq44GE44KI44GG44Gr44GZ44KLXG4gICAgICAgIHZhbHVlID0gKGJpdExlbmd0aCA8PCAxNikgfCBpO1xuICAgICAgICBmb3IgKGogPSByZXZlcnNlZDsgaiA8IHNpemU7IGogKz0gc2tpcCkge1xuICAgICAgICAgIHRhYmxlW2pdID0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICArK2NvZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5qyh44Gu44OT44OD44OI6ZW344G4XG4gICAgKytiaXRMZW5ndGg7XG4gICAgY29kZSA8PD0gMTtcbiAgICBza2lwIDw8PSAxO1xuICB9XG5cbiAgcmV0dXJuIFt0YWJsZSwgbWF4Q29kZUxlbmd0aCwgbWluQ29kZUxlbmd0aF07XG59O1xuXG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBEZWZsYXRlIChSRkMxOTUxKSDnrKblj7fljJbjgqLjg6vjgrTjg6rjgrrjg6Dlrp/oo4UuXG4gKi9cblxuZ29vZy5wcm92aWRlKCdabGliLlJhd0RlZmxhdGUnKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkJpdFN0cmVhbScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkhlYXAnKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBSYXcgRGVmbGF0ZSDlrp/oo4VcbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5wdXQg56ym5Y+35YyW44GZ44KL5a++6LGh44Gu44OQ44OD44OV44KhLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICpcbiAqIHR5cGVkIGFycmF5IOOBjOS9v+eUqOWPr+iDveOBquOBqOOBjeOAgW91dHB1dEJ1ZmZlciDjgYwgQXJyYXkg44Gv6Ieq5YuV55qE44GrIFVpbnQ4QXJyYXkg44GrXG4gKiDlpInmj5vjgZXjgozjgb7jgZkuXG4gKiDliKXjga7jgqrjg5bjgrjjgqfjgq/jg4jjgavjgarjgovjgZ/jgoHlh7rlipvjg5Djg4Pjg5XjgqHjgpLlj4LnhafjgZfjgabjgYTjgovlpInmlbDjgarjganjga9cbiAqIOabtOaWsOOBmeOCi+W/heimgeOBjOOBguOCiuOBvuOBmS5cbiAqL1xuWmxpYi5SYXdEZWZsYXRlID0gZnVuY3Rpb24oaW5wdXQsIG9wdF9wYXJhbXMpIHtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlfSAqL1xuICB0aGlzLmNvbXByZXNzaW9uVHlwZSA9IFpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRFlOQU1JQztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMubGF6eSA9IDA7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovXG4gIHRoaXMuZnJlcXNMaXRMZW47XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovXG4gIHRoaXMuZnJlcXNEaXN0O1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHRoaXMuaW5wdXQgPVxuICAgIChVU0VfVFlQRURBUlJBWSAmJiBpbnB1dCBpbnN0YW5jZW9mIEFycmF5KSA/IG5ldyBVaW50OEFycmF5KGlucHV0KSA6IGlucHV0O1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBvdXRwdXQgYnVmZmVyLiAqL1xuICB0aGlzLm91dHB1dDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHBvcyBvdXRwdXQgYnVmZmVyIHBvc2l0aW9uLiAqL1xuICB0aGlzLm9wID0gMDtcblxuICAvLyBvcHRpb24gcGFyYW1ldGVyc1xuICBpZiAob3B0X3BhcmFtcykge1xuICAgIGlmIChvcHRfcGFyYW1zWydsYXp5J10pIHtcbiAgICAgIHRoaXMubGF6eSA9IG9wdF9wYXJhbXNbJ2xhenknXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW1zWydjb21wcmVzc2lvblR5cGUnXSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRoaXMuY29tcHJlc3Npb25UeXBlID0gb3B0X3BhcmFtc1snY29tcHJlc3Npb25UeXBlJ107XG4gICAgfVxuICAgIGlmIChvcHRfcGFyYW1zWydvdXRwdXRCdWZmZXInXSkge1xuICAgICAgdGhpcy5vdXRwdXQgPVxuICAgICAgICAoVVNFX1RZUEVEQVJSQVkgJiYgb3B0X3BhcmFtc1snb3V0cHV0QnVmZmVyJ10gaW5zdGFuY2VvZiBBcnJheSkgP1xuICAgICAgICBuZXcgVWludDhBcnJheShvcHRfcGFyYW1zWydvdXRwdXRCdWZmZXInXSkgOiBvcHRfcGFyYW1zWydvdXRwdXRCdWZmZXInXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW1zWydvdXRwdXRJbmRleCddID09PSAnbnVtYmVyJykge1xuICAgICAgdGhpcy5vcCA9IG9wdF9wYXJhbXNbJ291dHB1dEluZGV4J107XG4gICAgfVxuICB9XG5cbiAgaWYgKCF0aGlzLm91dHB1dCkge1xuICAgIHRoaXMub3V0cHV0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoMHg4MDAwKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5abGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlID0ge1xuICBOT05FOiAwLFxuICBGSVhFRDogMSxcbiAgRFlOQU1JQzogMixcbiAgUkVTRVJWRUQ6IDNcbn07XG5cblxuLyoqXG4gKiBMWjc3IOOBruacgOWwj+ODnuODg+ODgemVt1xuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5abGliLlJhd0RlZmxhdGUuTHo3N01pbkxlbmd0aCA9IDM7XG5cbi8qKlxuICogTFo3NyDjga7mnIDlpKfjg57jg4Pjg4HplbdcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn1cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXhMZW5ndGggPSAyNTg7XG5cbi8qKlxuICogTFo3NyDjga7jgqbjgqPjg7Pjg4njgqbjgrXjgqTjgrpcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn1cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLldpbmRvd1NpemUgPSAweDgwMDA7XG5cbi8qKlxuICog5pyA6ZW344Gu56ym5Y+36ZW3XG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5NYXhDb2RlTGVuZ3RoID0gMTY7XG5cbi8qKlxuICog44OP44OV44Oe44Oz56ym5Y+344Gu5pyA5aSn5pWw5YCkXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5IVUZNQVggPSAyODY7XG5cbi8qKlxuICog5Zu65a6a44OP44OV44Oe44Oz56ym5Y+344Gu56ym5Y+35YyW44OG44O844OW44OrXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtBcnJheS48QXJyYXkuPG51bWJlciwgbnVtYmVyPj59XG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5GaXhlZEh1ZmZtYW5UYWJsZSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHRhYmxlID0gW10sIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IDI4ODsgaSsrKSB7XG4gICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICBjYXNlIChpIDw9IDE0Myk6IHRhYmxlLnB1c2goW2kgICAgICAgKyAweDAzMCwgOF0pOyBicmVhaztcbiAgICAgIGNhc2UgKGkgPD0gMjU1KTogdGFibGUucHVzaChbaSAtIDE0NCArIDB4MTkwLCA5XSk7IGJyZWFrO1xuICAgICAgY2FzZSAoaSA8PSAyNzkpOiB0YWJsZS5wdXNoKFtpIC0gMjU2ICsgMHgwMDAsIDddKTsgYnJlYWs7XG4gICAgICBjYXNlIChpIDw9IDI4Nyk6IHRhYmxlLnB1c2goW2kgLSAyODAgKyAweDBDMCwgOF0pOyBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93ICdpbnZhbGlkIGxpdGVyYWw6ICcgKyBpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YWJsZTtcbn0pKCk7XG5cbi8qKlxuICogREVGTEFURSDjg5bjg63jg4Pjgq/jga7kvZzmiJBcbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IOWcp+e4rua4iOOBvyBieXRlIGFycmF5LlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmNvbXByZXNzID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIGJsb2NrQXJyYXk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgcG9zaXRpb247XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGVuZ3RoO1xuXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG5cbiAgLy8gY29tcHJlc3Npb25cbiAgc3dpdGNoICh0aGlzLmNvbXByZXNzaW9uVHlwZSkge1xuICAgIGNhc2UgWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5OT05FOlxuICAgICAgLy8gZWFjaCA2NTUzNS1CeXRlIChsZW5ndGggaGVhZGVyOiAxNi1iaXQpXG4gICAgICBmb3IgKHBvc2l0aW9uID0gMCwgbGVuZ3RoID0gaW5wdXQubGVuZ3RoOyBwb3NpdGlvbiA8IGxlbmd0aDspIHtcbiAgICAgICAgYmxvY2tBcnJheSA9IFVTRV9UWVBFREFSUkFZID9cbiAgICAgICAgICBpbnB1dC5zdWJhcnJheShwb3NpdGlvbiwgcG9zaXRpb24gKyAweGZmZmYpIDpcbiAgICAgICAgICBpbnB1dC5zbGljZShwb3NpdGlvbiwgcG9zaXRpb24gKyAweGZmZmYpO1xuICAgICAgICBwb3NpdGlvbiArPSBibG9ja0FycmF5Lmxlbmd0aDtcbiAgICAgICAgdGhpcy5tYWtlTm9jb21wcmVzc0Jsb2NrKGJsb2NrQXJyYXksIChwb3NpdGlvbiA9PT0gbGVuZ3RoKSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRklYRUQ6XG4gICAgICB0aGlzLm91dHB1dCA9IHRoaXMubWFrZUZpeGVkSHVmZm1hbkJsb2NrKGlucHV0LCB0cnVlKTtcbiAgICAgIHRoaXMub3AgPSB0aGlzLm91dHB1dC5sZW5ndGg7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRFlOQU1JQzpcbiAgICAgIHRoaXMub3V0cHV0ID0gdGhpcy5tYWtlRHluYW1pY0h1ZmZtYW5CbG9jayhpbnB1dCwgdHJ1ZSk7XG4gICAgICB0aGlzLm9wID0gdGhpcy5vdXRwdXQubGVuZ3RoO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93ICdpbnZhbGlkIGNvbXByZXNzaW9uIHR5cGUnO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMub3V0cHV0O1xufTtcblxuLyoqXG4gKiDpnZ7lnKfnuK7jg5bjg63jg4Pjgq/jga7kvZzmiJBcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gYmxvY2tBcnJheSDjg5bjg63jg4Pjgq/jg4fjg7zjgr8gYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7IWJvb2xlYW59IGlzRmluYWxCbG9jayDmnIDlvozjga7jg5bjg63jg4Pjgq/jgarjgonjgbB0cnVlLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0g6Z2e5Zyn57iu44OW44Ot44OD44KvIGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZU5vY29tcHJlc3NCbG9jayA9XG5mdW5jdGlvbihibG9ja0FycmF5LCBpc0ZpbmFsQmxvY2spIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBiZmluYWw7XG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZX0gKi9cbiAgdmFyIGJ0eXBlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxlbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBubGVuO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaWw7XG5cbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuICB2YXIgb3AgPSB0aGlzLm9wO1xuXG4gIC8vIGV4cGFuZCBidWZmZXJcbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5vdXRwdXQuYnVmZmVyKTtcbiAgICB3aGlsZSAob3V0cHV0Lmxlbmd0aCA8PSBvcCArIGJsb2NrQXJyYXkubGVuZ3RoICsgNSkge1xuICAgICAgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0Lmxlbmd0aCA8PCAxKTtcbiAgICB9XG4gICAgb3V0cHV0LnNldCh0aGlzLm91dHB1dCk7XG4gIH1cblxuICAvLyBoZWFkZXJcbiAgYmZpbmFsID0gaXNGaW5hbEJsb2NrID8gMSA6IDA7XG4gIGJ0eXBlID0gWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5OT05FO1xuICBvdXRwdXRbb3ArK10gPSAoYmZpbmFsKSB8IChidHlwZSA8PCAxKTtcblxuICAvLyBsZW5ndGhcbiAgbGVuID0gYmxvY2tBcnJheS5sZW5ndGg7XG4gIG5sZW4gPSAofmxlbiArIDB4MTAwMDApICYgMHhmZmZmO1xuICBvdXRwdXRbb3ArK10gPSAgICAgICAgICBsZW4gJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAgKGxlbiA+Pj4gOCkgJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAgICAgICAgIG5sZW4gJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAobmxlbiA+Pj4gOCkgJiAweGZmO1xuXG4gIC8vIGNvcHkgYnVmZmVyXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgICBvdXRwdXQuc2V0KGJsb2NrQXJyYXksIG9wKTtcbiAgICAgb3AgKz0gYmxvY2tBcnJheS5sZW5ndGg7XG4gICAgIG91dHB1dCA9IG91dHB1dC5zdWJhcnJheSgwLCBvcCk7XG4gIH0gZWxzZSB7XG4gICAgZm9yIChpID0gMCwgaWwgPSBibG9ja0FycmF5Lmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIG91dHB1dFtvcCsrXSA9IGJsb2NrQXJyYXlbaV07XG4gICAgfVxuICAgIG91dHB1dC5sZW5ndGggPSBvcDtcbiAgfVxuXG4gIHRoaXMub3AgPSBvcDtcbiAgdGhpcy5vdXRwdXQgPSBvdXRwdXQ7XG5cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICog5Zu65a6a44OP44OV44Oe44Oz44OW44Ot44OD44Kv44Gu5L2c5oiQXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGJsb2NrQXJyYXkg44OW44Ot44OD44Kv44OH44O844K/IGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0geyFib29sZWFufSBpc0ZpbmFsQmxvY2sg5pyA5b6M44Gu44OW44Ot44OD44Kv44Gq44KJ44GwdHJ1ZS5cbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IOWbuuWumuODj+ODleODnuODs+espuWPt+WMluODluODreODg+OCryBieXRlIGFycmF5LlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLm1ha2VGaXhlZEh1ZmZtYW5CbG9jayA9XG5mdW5jdGlvbihibG9ja0FycmF5LCBpc0ZpbmFsQmxvY2spIHtcbiAgLyoqIEB0eXBlIHtabGliLkJpdFN0cmVhbX0gKi9cbiAgdmFyIHN0cmVhbSA9IG5ldyBabGliLkJpdFN0cmVhbShVU0VfVFlQRURBUlJBWSA/XG4gICAgbmV3IFVpbnQ4QXJyYXkodGhpcy5vdXRwdXQuYnVmZmVyKSA6IHRoaXMub3V0cHV0LCB0aGlzLm9wKTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBiZmluYWw7XG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZX0gKi9cbiAgdmFyIGJ0eXBlO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSAqL1xuICB2YXIgZGF0YTtcblxuICAvLyBoZWFkZXJcbiAgYmZpbmFsID0gaXNGaW5hbEJsb2NrID8gMSA6IDA7XG4gIGJ0eXBlID0gWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5GSVhFRDtcblxuICBzdHJlYW0ud3JpdGVCaXRzKGJmaW5hbCwgMSwgdHJ1ZSk7XG4gIHN0cmVhbS53cml0ZUJpdHMoYnR5cGUsIDIsIHRydWUpO1xuXG4gIGRhdGEgPSB0aGlzLmx6NzcoYmxvY2tBcnJheSk7XG4gIHRoaXMuZml4ZWRIdWZmbWFuKGRhdGEsIHN0cmVhbSk7XG5cbiAgcmV0dXJuIHN0cmVhbS5maW5pc2goKTtcbn07XG5cbi8qKlxuICog5YuV55qE44OP44OV44Oe44Oz44OW44Ot44OD44Kv44Gu5L2c5oiQXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGJsb2NrQXJyYXkg44OW44Ot44OD44Kv44OH44O844K/IGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0geyFib29sZWFufSBpc0ZpbmFsQmxvY2sg5pyA5b6M44Gu44OW44Ot44OD44Kv44Gq44KJ44GwdHJ1ZS5cbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IOWLleeahOODj+ODleODnuODs+espuWPt+ODluODreODg+OCryBieXRlIGFycmF5LlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLm1ha2VEeW5hbWljSHVmZm1hbkJsb2NrID1cbmZ1bmN0aW9uKGJsb2NrQXJyYXksIGlzRmluYWxCbG9jaykge1xuICAvKiogQHR5cGUge1psaWIuQml0U3RyZWFtfSAqL1xuICB2YXIgc3RyZWFtID0gbmV3IFpsaWIuQml0U3RyZWFtKFVTRV9UWVBFREFSUkFZID9cbiAgICBuZXcgVWludDhBcnJheSh0aGlzLm91dHB1dC5idWZmZXIpIDogdGhpcy5vdXRwdXQsIHRoaXMub3ApO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGJmaW5hbDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlfSAqL1xuICB2YXIgYnR5cGU7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9ICovXG4gIHZhciBkYXRhO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGhsaXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaGRpc3Q7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaGNsZW47XG4gIC8qKiBAY29uc3QgQHR5cGUge0FycmF5LjxudW1iZXI+fSAqL1xuICB2YXIgaGNsZW5PcmRlciA9XG4gICAgICAgIFsxNiwgMTcsIDE4LCAwLCA4LCA3LCA5LCA2LCAxMCwgNSwgMTEsIDQsIDEyLCAzLCAxMywgMiwgMTQsIDEsIDE1XTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgbGl0TGVuTGVuZ3RocztcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gKi9cbiAgdmFyIGxpdExlbkNvZGVzO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBkaXN0TGVuZ3RocztcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gKi9cbiAgdmFyIGRpc3RDb2RlcztcbiAgLyoqIEB0eXBlIHt7XG4gICAqICAgY29kZXM6ICEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpLFxuICAgKiAgIGZyZXFzOiAhKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KVxuICAgKiB9fSAqL1xuICB2YXIgdHJlZVN5bWJvbHM7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIHRyZWVMZW5ndGhzO1xuICAvKiogQHR5cGUge0FycmF5fSAqL1xuICB2YXIgdHJhbnNMZW5ndGhzID0gbmV3IEFycmF5KDE5KTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gKi9cbiAgdmFyIHRyZWVDb2RlcztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBjb2RlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGJpdGxlbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlsO1xuXG4gIC8vIGhlYWRlclxuICBiZmluYWwgPSBpc0ZpbmFsQmxvY2sgPyAxIDogMDtcbiAgYnR5cGUgPSBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkRZTkFNSUM7XG5cbiAgc3RyZWFtLndyaXRlQml0cyhiZmluYWwsIDEsIHRydWUpO1xuICBzdHJlYW0ud3JpdGVCaXRzKGJ0eXBlLCAyLCB0cnVlKTtcblxuICBkYXRhID0gdGhpcy5sejc3KGJsb2NrQXJyYXkpO1xuXG4gIC8vIOODquODhuODqeODq+ODu+mVt+OBlSwg6Led6Zui44Gu44OP44OV44Oe44Oz56ym5Y+344Go56ym5Y+36ZW344Gu566X5Ye6XG4gIGxpdExlbkxlbmd0aHMgPSB0aGlzLmdldExlbmd0aHNfKHRoaXMuZnJlcXNMaXRMZW4sIDE1KTtcbiAgbGl0TGVuQ29kZXMgPSB0aGlzLmdldENvZGVzRnJvbUxlbmd0aHNfKGxpdExlbkxlbmd0aHMpO1xuICBkaXN0TGVuZ3RocyA9IHRoaXMuZ2V0TGVuZ3Roc18odGhpcy5mcmVxc0Rpc3QsIDcpO1xuICBkaXN0Q29kZXMgPSB0aGlzLmdldENvZGVzRnJvbUxlbmd0aHNfKGRpc3RMZW5ndGhzKTtcblxuICAvLyBITElULCBIRElTVCDjga7msbrlrppcbiAgZm9yIChobGl0ID0gMjg2OyBobGl0ID4gMjU3ICYmIGxpdExlbkxlbmd0aHNbaGxpdCAtIDFdID09PSAwOyBobGl0LS0pIHt9XG4gIGZvciAoaGRpc3QgPSAzMDsgaGRpc3QgPiAxICYmIGRpc3RMZW5ndGhzW2hkaXN0IC0gMV0gPT09IDA7IGhkaXN0LS0pIHt9XG5cbiAgLy8gSENMRU5cbiAgdHJlZVN5bWJvbHMgPVxuICAgIHRoaXMuZ2V0VHJlZVN5bWJvbHNfKGhsaXQsIGxpdExlbkxlbmd0aHMsIGhkaXN0LCBkaXN0TGVuZ3Rocyk7XG4gIHRyZWVMZW5ndGhzID0gdGhpcy5nZXRMZW5ndGhzXyh0cmVlU3ltYm9scy5mcmVxcywgNyk7XG4gIGZvciAoaSA9IDA7IGkgPCAxOTsgaSsrKSB7XG4gICAgdHJhbnNMZW5ndGhzW2ldID0gdHJlZUxlbmd0aHNbaGNsZW5PcmRlcltpXV07XG4gIH1cbiAgZm9yIChoY2xlbiA9IDE5OyBoY2xlbiA+IDQgJiYgdHJhbnNMZW5ndGhzW2hjbGVuIC0gMV0gPT09IDA7IGhjbGVuLS0pIHt9XG5cbiAgdHJlZUNvZGVzID0gdGhpcy5nZXRDb2Rlc0Zyb21MZW5ndGhzXyh0cmVlTGVuZ3Rocyk7XG5cbiAgLy8g5Ye65YqbXG4gIHN0cmVhbS53cml0ZUJpdHMoaGxpdCAtIDI1NywgNSwgdHJ1ZSk7XG4gIHN0cmVhbS53cml0ZUJpdHMoaGRpc3QgLSAxLCA1LCB0cnVlKTtcbiAgc3RyZWFtLndyaXRlQml0cyhoY2xlbiAtIDQsIDQsIHRydWUpO1xuICBmb3IgKGkgPSAwOyBpIDwgaGNsZW47IGkrKykge1xuICAgIHN0cmVhbS53cml0ZUJpdHModHJhbnNMZW5ndGhzW2ldLCAzLCB0cnVlKTtcbiAgfVxuXG4gIC8vIOODhOODquODvOOBruWHuuWKm1xuICBmb3IgKGkgPSAwLCBpbCA9IHRyZWVTeW1ib2xzLmNvZGVzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHtcbiAgICBjb2RlID0gdHJlZVN5bWJvbHMuY29kZXNbaV07XG5cbiAgICBzdHJlYW0ud3JpdGVCaXRzKHRyZWVDb2Rlc1tjb2RlXSwgdHJlZUxlbmd0aHNbY29kZV0sIHRydWUpO1xuXG4gICAgLy8gZXh0cmEgYml0c1xuICAgIGlmIChjb2RlID49IDE2KSB7XG4gICAgICBpKys7XG4gICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgY2FzZSAxNjogYml0bGVuID0gMjsgYnJlYWs7XG4gICAgICAgIGNhc2UgMTc6IGJpdGxlbiA9IDM7IGJyZWFrO1xuICAgICAgICBjYXNlIDE4OiBiaXRsZW4gPSA3OyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyAnaW52YWxpZCBjb2RlOiAnICsgY29kZTtcbiAgICAgIH1cblxuICAgICAgc3RyZWFtLndyaXRlQml0cyh0cmVlU3ltYm9scy5jb2Rlc1tpXSwgYml0bGVuLCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICB0aGlzLmR5bmFtaWNIdWZmbWFuKFxuICAgIGRhdGEsXG4gICAgW2xpdExlbkNvZGVzLCBsaXRMZW5MZW5ndGhzXSxcbiAgICBbZGlzdENvZGVzLCBkaXN0TGVuZ3Roc10sXG4gICAgc3RyZWFtXG4gICk7XG5cbiAgcmV0dXJuIHN0cmVhbS5maW5pc2goKTtcbn07XG5cblxuLyoqXG4gKiDli5XnmoTjg4/jg5Xjg57jg7PnrKblj7fljJYo44Kr44K544K/44Og44OP44OV44Oe44Oz44OG44O844OW44OrKVxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gZGF0YUFycmF5IExaNzcg56ym5Y+35YyW5riI44G/IGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0geyFabGliLkJpdFN0cmVhbX0gc3RyZWFtIOabuOOBjei+vOOBv+eUqOODk+ODg+ODiOOCueODiOODquODvOODoC5cbiAqIEByZXR1cm4geyFabGliLkJpdFN0cmVhbX0g44OP44OV44Oe44Oz56ym5Y+35YyW5riI44G/44OT44OD44OI44K544OI44Oq44O844Og44Kq44OW44K444Kn44Kv44OILlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmR5bmFtaWNIdWZmbWFuID1cbmZ1bmN0aW9uKGRhdGFBcnJheSwgbGl0TGVuLCBkaXN0LCBzdHJlYW0pIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbmRleDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGl0ZXJhbDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBjb2RlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxpdExlbkNvZGVzO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxpdExlbkxlbmd0aHM7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgZGlzdENvZGVzO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGRpc3RMZW5ndGhzO1xuXG4gIGxpdExlbkNvZGVzID0gbGl0TGVuWzBdO1xuICBsaXRMZW5MZW5ndGhzID0gbGl0TGVuWzFdO1xuICBkaXN0Q29kZXMgPSBkaXN0WzBdO1xuICBkaXN0TGVuZ3RocyA9IGRpc3RbMV07XG5cbiAgLy8g56ym5Y+344KSIEJpdFN0cmVhbSDjgavmm7jjgY3ovrzjgpPjgafjgYTjgY9cbiAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IGRhdGFBcnJheS5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyArK2luZGV4KSB7XG4gICAgbGl0ZXJhbCA9IGRhdGFBcnJheVtpbmRleF07XG5cbiAgICAvLyBsaXRlcmFsIG9yIGxlbmd0aFxuICAgIHN0cmVhbS53cml0ZUJpdHMobGl0TGVuQ29kZXNbbGl0ZXJhbF0sIGxpdExlbkxlbmd0aHNbbGl0ZXJhbF0sIHRydWUpO1xuXG4gICAgLy8g6ZW344GV44O76Led6Zui56ym5Y+3XG4gICAgaWYgKGxpdGVyYWwgPiAyNTYpIHtcbiAgICAgIC8vIGxlbmd0aCBleHRyYVxuICAgICAgc3RyZWFtLndyaXRlQml0cyhkYXRhQXJyYXlbKytpbmRleF0sIGRhdGFBcnJheVsrK2luZGV4XSwgdHJ1ZSk7XG4gICAgICAvLyBkaXN0YW5jZVxuICAgICAgY29kZSA9IGRhdGFBcnJheVsrK2luZGV4XTtcbiAgICAgIHN0cmVhbS53cml0ZUJpdHMoZGlzdENvZGVzW2NvZGVdLCBkaXN0TGVuZ3Roc1tjb2RlXSwgdHJ1ZSk7XG4gICAgICAvLyBkaXN0YW5jZSBleHRyYVxuICAgICAgc3RyZWFtLndyaXRlQml0cyhkYXRhQXJyYXlbKytpbmRleF0sIGRhdGFBcnJheVsrK2luZGV4XSwgdHJ1ZSk7XG4gICAgLy8g57WC56uvXG4gICAgfSBlbHNlIGlmIChsaXRlcmFsID09PSAyNTYpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdHJlYW07XG59O1xuXG4vKipcbiAqIOWbuuWumuODj+ODleODnuODs+espuWPt+WMllxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gZGF0YUFycmF5IExaNzcg56ym5Y+35YyW5riI44G/IGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0geyFabGliLkJpdFN0cmVhbX0gc3RyZWFtIOabuOOBjei+vOOBv+eUqOODk+ODg+ODiOOCueODiOODquODvOODoC5cbiAqIEByZXR1cm4geyFabGliLkJpdFN0cmVhbX0g44OP44OV44Oe44Oz56ym5Y+35YyW5riI44G/44OT44OD44OI44K544OI44Oq44O844Og44Kq44OW44K444Kn44Kv44OILlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmZpeGVkSHVmZm1hbiA9IGZ1bmN0aW9uKGRhdGFBcnJheSwgc3RyZWFtKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaW5kZXg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxpdGVyYWw7XG5cbiAgLy8g56ym5Y+344KSIEJpdFN0cmVhbSDjgavmm7jjgY3ovrzjgpPjgafjgYTjgY9cbiAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IGRhdGFBcnJheS5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgbGl0ZXJhbCA9IGRhdGFBcnJheVtpbmRleF07XG5cbiAgICAvLyDnrKblj7fjga7mm7jjgY3ovrzjgb9cbiAgICBabGliLkJpdFN0cmVhbS5wcm90b3R5cGUud3JpdGVCaXRzLmFwcGx5KFxuICAgICAgc3RyZWFtLFxuICAgICAgWmxpYi5SYXdEZWZsYXRlLkZpeGVkSHVmZm1hblRhYmxlW2xpdGVyYWxdXG4gICAgKTtcblxuICAgIC8vIOmVt+OBleODu+i3nembouespuWPt1xuICAgIGlmIChsaXRlcmFsID4gMHgxMDApIHtcbiAgICAgIC8vIGxlbmd0aCBleHRyYVxuICAgICAgc3RyZWFtLndyaXRlQml0cyhkYXRhQXJyYXlbKytpbmRleF0sIGRhdGFBcnJheVsrK2luZGV4XSwgdHJ1ZSk7XG4gICAgICAvLyBkaXN0YW5jZVxuICAgICAgc3RyZWFtLndyaXRlQml0cyhkYXRhQXJyYXlbKytpbmRleF0sIDUpO1xuICAgICAgLy8gZGlzdGFuY2UgZXh0cmFcbiAgICAgIHN0cmVhbS53cml0ZUJpdHMoZGF0YUFycmF5WysraW5kZXhdLCBkYXRhQXJyYXlbKytpbmRleF0sIHRydWUpO1xuICAgIC8vIOe1guerr1xuICAgIH0gZWxzZSBpZiAobGl0ZXJhbCA9PT0gMHgxMDApIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdHJlYW07XG59O1xuXG4vKipcbiAqIOODnuODg+ODgeaDheWgsVxuICogQHBhcmFtIHshbnVtYmVyfSBsZW5ndGgg44Oe44OD44OB44GX44Gf6ZW344GVLlxuICogQHBhcmFtIHshbnVtYmVyfSBiYWNrd2FyZERpc3RhbmNlIOODnuODg+ODgeS9jee9ruOBqOOBrui3nemboi5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5abGliLlJhd0RlZmxhdGUuTHo3N01hdGNoID0gZnVuY3Rpb24obGVuZ3RoLCBiYWNrd2FyZERpc3RhbmNlKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtYXRjaCBsZW5ndGguICovXG4gIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gYmFja3dhcmQgZGlzdGFuY2UuICovXG4gIHRoaXMuYmFja3dhcmREaXN0YW5jZSA9IGJhY2t3YXJkRGlzdGFuY2U7XG59O1xuXG4vKipcbiAqIOmVt+OBleespuWPt+ODhuODvOODluODqy5cbiAqIFvjgrPjg7zjg4ksIOaLoeW8teODk+ODg+ODiCwg5ouh5by144OT44OD44OI6ZW3XSDjga7phY3liJfjgajjgarjgaPjgabjgYTjgosuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX1cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaC5MZW5ndGhDb2RlVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQzMkFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoKGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUgeyFBcnJheX0gKi9cbiAgdmFyIHRhYmxlID0gW107XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHshQXJyYXkuPG51bWJlcj59ICovXG4gIHZhciBjO1xuXG4gIGZvciAoaSA9IDM7IGkgPD0gMjU4OyBpKyspIHtcbiAgICBjID0gY29kZShpKTtcbiAgICB0YWJsZVtpXSA9IChjWzJdIDw8IDI0KSB8IChjWzFdIDw8IDE2KSB8IGNbMF07XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCBsejc3IGxlbmd0aC5cbiAgICogQHJldHVybiB7IUFycmF5LjxudW1iZXI+fSBsejc3IGNvZGVzLlxuICAgKi9cbiAgZnVuY3Rpb24gY29kZShsZW5ndGgpIHtcbiAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgIGNhc2UgKGxlbmd0aCA9PT0gMyk6IHJldHVybiBbMjU3LCBsZW5ndGggLSAzLCAwXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDQpOiByZXR1cm4gWzI1OCwgbGVuZ3RoIC0gNCwgMF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoID09PSA1KTogcmV0dXJuIFsyNTksIGxlbmd0aCAtIDUsIDBdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA9PT0gNik6IHJldHVybiBbMjYwLCBsZW5ndGggLSA2LCAwXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDcpOiByZXR1cm4gWzI2MSwgbGVuZ3RoIC0gNywgMF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoID09PSA4KTogcmV0dXJuIFsyNjIsIGxlbmd0aCAtIDgsIDBdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA9PT0gOSk6IHJldHVybiBbMjYzLCBsZW5ndGggLSA5LCAwXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDEwKTogcmV0dXJuIFsyNjQsIGxlbmd0aCAtIDEwLCAwXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMTIpOiByZXR1cm4gWzI2NSwgbGVuZ3RoIC0gMTEsIDFdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAxNCk6IHJldHVybiBbMjY2LCBsZW5ndGggLSAxMywgMV07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDE2KTogcmV0dXJuIFsyNjcsIGxlbmd0aCAtIDE1LCAxXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMTgpOiByZXR1cm4gWzI2OCwgbGVuZ3RoIC0gMTcsIDFdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAyMik6IHJldHVybiBbMjY5LCBsZW5ndGggLSAxOSwgMl07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDI2KTogcmV0dXJuIFsyNzAsIGxlbmd0aCAtIDIzLCAyXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMzApOiByZXR1cm4gWzI3MSwgbGVuZ3RoIC0gMjcsIDJdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAzNCk6IHJldHVybiBbMjcyLCBsZW5ndGggLSAzMSwgMl07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDQyKTogcmV0dXJuIFsyNzMsIGxlbmd0aCAtIDM1LCAzXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gNTApOiByZXR1cm4gWzI3NCwgbGVuZ3RoIC0gNDMsIDNdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSA1OCk6IHJldHVybiBbMjc1LCBsZW5ndGggLSA1MSwgM107IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDY2KTogcmV0dXJuIFsyNzYsIGxlbmd0aCAtIDU5LCAzXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gODIpOiByZXR1cm4gWzI3NywgbGVuZ3RoIC0gNjcsIDRdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSA5OCk6IHJldHVybiBbMjc4LCBsZW5ndGggLSA4MywgNF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDExNCk6IHJldHVybiBbMjc5LCBsZW5ndGggLSA5OSwgNF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDEzMCk6IHJldHVybiBbMjgwLCBsZW5ndGggLSAxMTUsIDRdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAxNjIpOiByZXR1cm4gWzI4MSwgbGVuZ3RoIC0gMTMxLCA1XTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMTk0KTogcmV0dXJuIFsyODIsIGxlbmd0aCAtIDE2MywgNV07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDIyNik6IHJldHVybiBbMjgzLCBsZW5ndGggLSAxOTUsIDVdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAyNTcpOiByZXR1cm4gWzI4NCwgbGVuZ3RoIC0gMjI3LCA1XTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDI1OCk6IHJldHVybiBbMjg1LCBsZW5ndGggLSAyNTgsIDBdOyBicmVhaztcbiAgICAgIGRlZmF1bHQ6IHRocm93ICdpbnZhbGlkIGxlbmd0aDogJyArIGxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFibGU7XG59KSgpKTtcblxuLyoqXG4gKiDot53pm6LnrKblj7fjg4bjg7zjg5bjg6tcbiAqIEBwYXJhbSB7IW51bWJlcn0gZGlzdCDot53pm6IuXG4gKiBAcmV0dXJuIHshQXJyYXkuPG51bWJlcj59IOOCs+ODvOODieOAgeaLoeW8teODk+ODg+ODiOOAgeaLoeW8teODk+ODg+ODiOmVt+OBrumFjeWIly5cbiAqIEBwcml2YXRlXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2gucHJvdG90eXBlLmdldERpc3RhbmNlQ29kZV8gPSBmdW5jdGlvbihkaXN0KSB7XG4gIC8qKiBAdHlwZSB7IUFycmF5LjxudW1iZXI+fSBkaXN0YW5jZSBjb2RlIHRhYmxlLiAqL1xuICB2YXIgcjtcblxuICBzd2l0Y2ggKHRydWUpIHtcbiAgICBjYXNlIChkaXN0ID09PSAxKTogciA9IFswLCBkaXN0IC0gMSwgMF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPT09IDIpOiByID0gWzEsIGRpc3QgLSAyLCAwXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA9PT0gMyk6IHIgPSBbMiwgZGlzdCAtIDMsIDBdOyBicmVhaztcbiAgICBjYXNlIChkaXN0ID09PSA0KTogciA9IFszLCBkaXN0IC0gNCwgMF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gNik6IHIgPSBbNCwgZGlzdCAtIDUsIDFdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDgpOiByID0gWzUsIGRpc3QgLSA3LCAxXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAxMik6IHIgPSBbNiwgZGlzdCAtIDksIDJdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDE2KTogciA9IFs3LCBkaXN0IC0gMTMsIDJdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDI0KTogciA9IFs4LCBkaXN0IC0gMTcsIDNdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDMyKTogciA9IFs5LCBkaXN0IC0gMjUsIDNdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDQ4KTogciA9IFsxMCwgZGlzdCAtIDMzLCA0XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA2NCk6IHIgPSBbMTEsIGRpc3QgLSA0OSwgNF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gOTYpOiByID0gWzEyLCBkaXN0IC0gNjUsIDVdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDEyOCk6IHIgPSBbMTMsIGRpc3QgLSA5NywgNV07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMTkyKTogciA9IFsxNCwgZGlzdCAtIDEyOSwgNl07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMjU2KTogciA9IFsxNSwgZGlzdCAtIDE5MywgNl07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMzg0KTogciA9IFsxNiwgZGlzdCAtIDI1NywgN107IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gNTEyKTogciA9IFsxNywgZGlzdCAtIDM4NSwgN107IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gNzY4KTogciA9IFsxOCwgZGlzdCAtIDUxMywgOF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMTAyNCk6IHIgPSBbMTksIGRpc3QgLSA3NjksIDhdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDE1MzYpOiByID0gWzIwLCBkaXN0IC0gMTAyNSwgOV07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMjA0OCk6IHIgPSBbMjEsIGRpc3QgLSAxNTM3LCA5XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAzMDcyKTogciA9IFsyMiwgZGlzdCAtIDIwNDksIDEwXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA0MDk2KTogciA9IFsyMywgZGlzdCAtIDMwNzMsIDEwXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA2MTQ0KTogciA9IFsyNCwgZGlzdCAtIDQwOTcsIDExXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA4MTkyKTogciA9IFsyNSwgZGlzdCAtIDYxNDUsIDExXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAxMjI4OCk6IHIgPSBbMjYsIGRpc3QgLSA4MTkzLCAxMl07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMTYzODQpOiByID0gWzI3LCBkaXN0IC0gMTIyODksIDEyXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAyNDU3Nik6IHIgPSBbMjgsIGRpc3QgLSAxNjM4NSwgMTNdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDMyNzY4KTogciA9IFsyOSwgZGlzdCAtIDI0NTc3LCAxM107IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRocm93ICdpbnZhbGlkIGRpc3RhbmNlJztcbiAgfVxuXG4gIHJldHVybiByO1xufTtcblxuLyoqXG4gKiDjg57jg4Pjg4Hmg4XloLHjgpIgTFo3NyDnrKblj7fljJbphY3liJfjgafov5TjgZkuXG4gKiDjgarjgYrjgIHjgZPjgZPjgafjga/ku6XkuIvjga7lhoXpg6jku5Xmp5jjgafnrKblj7fljJbjgZfjgabjgYTjgotcbiAqIFsgQ09ERSwgRVhUUkEtQklULUxFTiwgRVhUUkEsIENPREUsIEVYVFJBLUJJVC1MRU4sIEVYVFJBIF1cbiAqIEByZXR1cm4geyFBcnJheS48bnVtYmVyPn0gTFo3NyDnrKblj7fljJYgYnl0ZSBhcnJheS5cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaC5wcm90b3R5cGUudG9Mejc3QXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBkaXN0ID0gdGhpcy5iYWNrd2FyZERpc3RhbmNlO1xuICAvKiogQHR5cGUge0FycmF5fSAqL1xuICB2YXIgY29kZUFycmF5ID0gW107XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgcG9zID0gMDtcbiAgLyoqIEB0eXBlIHshQXJyYXkuPG51bWJlcj59ICovXG4gIHZhciBjb2RlO1xuXG4gIC8vIGxlbmd0aFxuICBjb2RlID0gWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaC5MZW5ndGhDb2RlVGFibGVbbGVuZ3RoXTtcbiAgY29kZUFycmF5W3BvcysrXSA9IGNvZGUgJiAweGZmZmY7XG4gIGNvZGVBcnJheVtwb3MrK10gPSAoY29kZSA+PiAxNikgJiAweGZmO1xuICBjb2RlQXJyYXlbcG9zKytdID0gY29kZSA+PiAyNDtcblxuICAvLyBkaXN0YW5jZVxuICBjb2RlID0gdGhpcy5nZXREaXN0YW5jZUNvZGVfKGRpc3QpO1xuICBjb2RlQXJyYXlbcG9zKytdID0gY29kZVswXTtcbiAgY29kZUFycmF5W3BvcysrXSA9IGNvZGVbMV07XG4gIGNvZGVBcnJheVtwb3MrK10gPSBjb2RlWzJdO1xuXG4gIHJldHVybiBjb2RlQXJyYXk7XG59O1xuXG4vKipcbiAqIExaNzcg5a6f6KOFXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGRhdGFBcnJheSBMWjc3IOespuWPt+WMluOBmeOCi+ODkOOCpOODiOmFjeWIly5cbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSBMWjc3IOespuWPt+WMluOBl+OBn+mFjeWIly5cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5sejc3ID0gZnVuY3Rpb24oZGF0YUFycmF5KSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBwb3NpdGlvbiAqL1xuICB2YXIgcG9zaXRpb247XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBsZW5ndGggKi9cbiAgdmFyIGxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlciAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgbGltaXRlciAqL1xuICB2YXIgaWw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjaGFpbmVkLWhhc2gtdGFibGUga2V5ICovXG4gIHZhciBtYXRjaEtleTtcbiAgLyoqIEB0eXBlIHtPYmplY3QuPG51bWJlciwgQXJyYXkuPG51bWJlcj4+fSBjaGFpbmVkLWhhc2gtdGFibGUgKi9cbiAgdmFyIHRhYmxlID0ge307XG4gIC8qKiBAY29uc3QgQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHdpbmRvd1NpemUgPSBabGliLlJhd0RlZmxhdGUuV2luZG93U2l6ZTtcbiAgLyoqIEB0eXBlIHtBcnJheS48bnVtYmVyPn0gbWF0Y2ggbGlzdCAqL1xuICB2YXIgbWF0Y2hMaXN0O1xuICAvKiogQHR5cGUge1psaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2h9IGxvbmdlc3QgbWF0Y2ggKi9cbiAgdmFyIGxvbmdlc3RNYXRjaDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGUuTHo3N01hdGNofSBwcmV2aW91cyBsb25nZXN0IG1hdGNoICovXG4gIHZhciBwcmV2TWF0Y2g7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9IGx6NzcgYnVmZmVyICovXG4gIHZhciBsejc3YnVmID0gVVNFX1RZUEVEQVJSQVkgP1xuICAgIG5ldyBVaW50MTZBcnJheShkYXRhQXJyYXkubGVuZ3RoICogMikgOiBbXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGx6Nzcgb3V0cHV0IGJ1ZmZlciBwb2ludGVyICovXG4gIHZhciBwb3MgPSAwO1xuICAvKiogQHR5cGUge251bWJlcn0gbHo3NyBza2lwIGxlbmd0aCAqL1xuICB2YXIgc2tpcExlbmd0aCA9IDA7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovXG4gIHZhciBmcmVxc0xpdExlbiA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50MzJBcnJheSA6IEFycmF5KSgyODYpO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqL1xuICB2YXIgZnJlcXNEaXN0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQzMkFycmF5IDogQXJyYXkpKDMwKTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsYXp5ID0gdGhpcy5sYXp5O1xuICAvKiogQHR5cGUgeyp9IHRlbXBvcmFyeSB2YXJpYWJsZSAqL1xuICB2YXIgdG1wO1xuXG4gIC8vIOWIneacn+WMllxuICBpZiAoIVVTRV9UWVBFREFSUkFZKSB7XG4gICAgZm9yIChpID0gMDsgaSA8PSAyODU7KSB7IGZyZXFzTGl0TGVuW2krK10gPSAwOyB9XG4gICAgZm9yIChpID0gMDsgaSA8PSAyOTspIHsgZnJlcXNEaXN0W2krK10gPSAwOyB9XG4gIH1cbiAgZnJlcXNMaXRMZW5bMjU2XSA9IDE7IC8vIEVPQiDjga7mnIDkvY7lh7rnj77lm57mlbDjga8gMVxuXG4gIC8qKlxuICAgKiDjg57jg4Pjg4Hjg4fjg7zjgr/jga7mm7jjgY3ovrzjgb9cbiAgICogQHBhcmFtIHtabGliLlJhd0RlZmxhdGUuTHo3N01hdGNofSBtYXRjaCBMWjc3IE1hdGNoIGRhdGEuXG4gICAqIEBwYXJhbSB7IW51bWJlcn0gb2Zmc2V0IOOCueOCreODg+ODl+mWi+Wni+S9jee9rijnm7jlr77mjIflrpopLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gd3JpdGVNYXRjaChtYXRjaCwgb2Zmc2V0KSB7XG4gICAgLyoqIEB0eXBlIHtBcnJheS48bnVtYmVyPn0gKi9cbiAgICB2YXIgbHo3N0FycmF5ID0gbWF0Y2gudG9Mejc3QXJyYXkoKTtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgaTtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgaWw7XG5cbiAgICBmb3IgKGkgPSAwLCBpbCA9IGx6NzdBcnJheS5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICBsejc3YnVmW3BvcysrXSA9IGx6NzdBcnJheVtpXTtcbiAgICB9XG4gICAgZnJlcXNMaXRMZW5bbHo3N0FycmF5WzBdXSsrO1xuICAgIGZyZXFzRGlzdFtsejc3QXJyYXlbM11dKys7XG4gICAgc2tpcExlbmd0aCA9IG1hdGNoLmxlbmd0aCArIG9mZnNldCAtIDE7XG4gICAgcHJldk1hdGNoID0gbnVsbDtcbiAgfVxuXG4gIC8vIExaNzcg56ym5Y+35YyWXG4gIGZvciAocG9zaXRpb24gPSAwLCBsZW5ndGggPSBkYXRhQXJyYXkubGVuZ3RoOyBwb3NpdGlvbiA8IGxlbmd0aDsgKytwb3NpdGlvbikge1xuICAgIC8vIOODj+ODg+OCt+ODpeOCreODvOOBruS9nOaIkFxuICAgIGZvciAobWF0Y2hLZXkgPSAwLCBpID0gMCwgaWwgPSBabGliLlJhd0RlZmxhdGUuTHo3N01pbkxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGlmIChwb3NpdGlvbiArIGkgPT09IGxlbmd0aCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIG1hdGNoS2V5ID0gKG1hdGNoS2V5IDw8IDgpIHwgZGF0YUFycmF5W3Bvc2l0aW9uICsgaV07XG4gICAgfVxuXG4gICAgLy8g44OG44O844OW44Or44GM5pyq5a6a576p44Gg44Gj44Gf44KJ5L2c5oiQ44GZ44KLXG4gICAgaWYgKHRhYmxlW21hdGNoS2V5XSA9PT0gdm9pZCAwKSB7IHRhYmxlW21hdGNoS2V5XSA9IFtdOyB9XG4gICAgbWF0Y2hMaXN0ID0gdGFibGVbbWF0Y2hLZXldO1xuXG4gICAgLy8gc2tpcFxuICAgIGlmIChza2lwTGVuZ3RoLS0gPiAwKSB7XG4gICAgICBtYXRjaExpc3QucHVzaChwb3NpdGlvbik7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyDjg57jg4Pjg4Hjg4bjg7zjg5bjg6vjga7mm7TmlrAgKOacgOWkp+aIu+OCiui3nembouOCkui2heOBiOOBpuOBhOOCi+OCguOBruOCkuWJiumZpOOBmeOCiylcbiAgICB3aGlsZSAobWF0Y2hMaXN0Lmxlbmd0aCA+IDAgJiYgcG9zaXRpb24gLSBtYXRjaExpc3RbMF0gPiB3aW5kb3dTaXplKSB7XG4gICAgICBtYXRjaExpc3Quc2hpZnQoKTtcbiAgICB9XG5cbiAgICAvLyDjg4fjg7zjgr/mnKvlsL7jgafjg57jg4Pjg4HjgZfjgojjgYbjgYzjgarjgYTloLTlkIjjga/jgZ3jga7jgb7jgb7mtYHjgZfjgZPjgoBcbiAgICBpZiAocG9zaXRpb24gKyBabGliLlJhd0RlZmxhdGUuTHo3N01pbkxlbmd0aCA+PSBsZW5ndGgpIHtcbiAgICAgIGlmIChwcmV2TWF0Y2gpIHtcbiAgICAgICAgd3JpdGVNYXRjaChwcmV2TWF0Y2gsIC0xKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMCwgaWwgPSBsZW5ndGggLSBwb3NpdGlvbjsgaSA8IGlsOyArK2kpIHtcbiAgICAgICAgdG1wID0gZGF0YUFycmF5W3Bvc2l0aW9uICsgaV07XG4gICAgICAgIGx6NzdidWZbcG9zKytdID0gdG1wO1xuICAgICAgICArK2ZyZXFzTGl0TGVuW3RtcF07XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyDjg57jg4Pjg4HlgJnoo5zjgYvjgonmnIDplbfjga7jgoLjga7jgpLmjqLjgZlcbiAgICBpZiAobWF0Y2hMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgIGxvbmdlc3RNYXRjaCA9IHRoaXMuc2VhcmNoTG9uZ2VzdE1hdGNoXyhkYXRhQXJyYXksIHBvc2l0aW9uLCBtYXRjaExpc3QpO1xuXG4gICAgICBpZiAocHJldk1hdGNoKSB7XG4gICAgICAgIC8vIOePvuWcqOOBruODnuODg+ODgeOBruaWueOBjOWJjeWbnuOBruODnuODg+ODgeOCiOOCiuOCgumVt+OBhFxuICAgICAgICBpZiAocHJldk1hdGNoLmxlbmd0aCA8IGxvbmdlc3RNYXRjaC5sZW5ndGgpIHtcbiAgICAgICAgICAvLyB3cml0ZSBwcmV2aW91cyBsaXRlcmFsXG4gICAgICAgICAgdG1wID0gZGF0YUFycmF5W3Bvc2l0aW9uIC0gMV07XG4gICAgICAgICAgbHo3N2J1Zltwb3MrK10gPSB0bXA7XG4gICAgICAgICAgKytmcmVxc0xpdExlblt0bXBdO1xuXG4gICAgICAgICAgLy8gd3JpdGUgY3VycmVudCBtYXRjaFxuICAgICAgICAgIHdyaXRlTWF0Y2gobG9uZ2VzdE1hdGNoLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyB3cml0ZSBwcmV2aW91cyBtYXRjaFxuICAgICAgICAgIHdyaXRlTWF0Y2gocHJldk1hdGNoLCAtMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobG9uZ2VzdE1hdGNoLmxlbmd0aCA8IGxhenkpIHtcbiAgICAgICAgcHJldk1hdGNoID0gbG9uZ2VzdE1hdGNoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd3JpdGVNYXRjaChsb25nZXN0TWF0Y2gsIDApO1xuICAgICAgfVxuICAgIC8vIOWJjeWbnuODnuODg+ODgeOBl+OBpuOBhOOBpuS7iuWbnuODnuODg+ODgeOBjOOBquOBi+OBo+OBn+OCieWJjeWbnuOBruOCkuaOoeeUqFxuICAgIH0gZWxzZSBpZiAocHJldk1hdGNoKSB7XG4gICAgICB3cml0ZU1hdGNoKHByZXZNYXRjaCwgLTEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgPSBkYXRhQXJyYXlbcG9zaXRpb25dO1xuICAgICAgbHo3N2J1Zltwb3MrK10gPSB0bXA7XG4gICAgICArK2ZyZXFzTGl0TGVuW3RtcF07XG4gICAgfVxuXG4gICAgbWF0Y2hMaXN0LnB1c2gocG9zaXRpb24pOyAvLyDjg57jg4Pjg4Hjg4bjg7zjg5bjg6vjgavnj77lnKjjga7kvY3nva7jgpLkv53lrZhcbiAgfVxuXG4gIC8vIOe1guerr+WHpueQhlxuICBsejc3YnVmW3BvcysrXSA9IDI1NjtcbiAgZnJlcXNMaXRMZW5bMjU2XSsrO1xuICB0aGlzLmZyZXFzTGl0TGVuID0gZnJlcXNMaXRMZW47XG4gIHRoaXMuZnJlcXNEaXN0ID0gZnJlcXNEaXN0O1xuXG4gIHJldHVybiAvKiogQHR5cGUgeyEoVWludDE2QXJyYXl8QXJyYXkuPG51bWJlcj4pfSAqLyAoXG4gICAgVVNFX1RZUEVEQVJSQVkgPyAgbHo3N2J1Zi5zdWJhcnJheSgwLCBwb3MpIDogbHo3N2J1ZlxuICApO1xufTtcblxuLyoqXG4gKiDjg57jg4Pjg4HjgZfjgZ/lgJnoo5zjga7kuK3jgYvjgonmnIDplbfkuIDoh7TjgpLmjqLjgZlcbiAqIEBwYXJhbSB7IU9iamVjdH0gZGF0YSBwbGFpbiBkYXRhIGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0geyFudW1iZXJ9IHBvc2l0aW9uIHBsYWluIGRhdGEgYnl0ZSBhcnJheSBwb3NpdGlvbi5cbiAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBtYXRjaExpc3Qg5YCZ6KOc44Go44Gq44KL5L2N572u44Gu6YWN5YiXLlxuICogQHJldHVybiB7IVpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2h9IOacgOmVt+OBi+OBpOacgOefrei3nembouOBruODnuODg+ODgeOCquODluOCuOOCp+OCr+ODiC5cbiAqIEBwcml2YXRlXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuc2VhcmNoTG9uZ2VzdE1hdGNoXyA9XG5mdW5jdGlvbihkYXRhLCBwb3NpdGlvbiwgbWF0Y2hMaXN0KSB7XG4gIHZhciBtYXRjaCxcbiAgICAgIGN1cnJlbnRNYXRjaCxcbiAgICAgIG1hdGNoTWF4ID0gMCwgbWF0Y2hMZW5ndGgsXG4gICAgICBpLCBqLCBsLCBkbCA9IGRhdGEubGVuZ3RoO1xuXG4gIC8vIOWAmeijnOOCkuW+jOOCjeOBi+OCiSAxIOOBpOOBmuOBpOe1nuOCiui+vOOCk+OBp+OChuOBj1xuICBwZXJtYXRjaDpcbiAgZm9yIChpID0gMCwgbCA9IG1hdGNoTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBtYXRjaCA9IG1hdGNoTGlzdFtsIC0gaSAtIDFdO1xuICAgIG1hdGNoTGVuZ3RoID0gWmxpYi5SYXdEZWZsYXRlLkx6NzdNaW5MZW5ndGg7XG5cbiAgICAvLyDliY3lm57jgb7jgafjga7mnIDplbfkuIDoh7TjgpLmnKvlsL7jgYvjgonkuIDoh7TmpJzntKLjgZnjgotcbiAgICBpZiAobWF0Y2hNYXggPiBabGliLlJhd0RlZmxhdGUuTHo3N01pbkxlbmd0aCkge1xuICAgICAgZm9yIChqID0gbWF0Y2hNYXg7IGogPiBabGliLlJhd0RlZmxhdGUuTHo3N01pbkxlbmd0aDsgai0tKSB7XG4gICAgICAgIGlmIChkYXRhW21hdGNoICsgaiAtIDFdICE9PSBkYXRhW3Bvc2l0aW9uICsgaiAtIDFdKSB7XG4gICAgICAgICAgY29udGludWUgcGVybWF0Y2g7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG1hdGNoTGVuZ3RoID0gbWF0Y2hNYXg7XG4gICAgfVxuXG4gICAgLy8g5pyA6ZW35LiA6Ie05o6i57SiXG4gICAgd2hpbGUgKG1hdGNoTGVuZ3RoIDwgWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXhMZW5ndGggJiZcbiAgICAgICAgICAgcG9zaXRpb24gKyBtYXRjaExlbmd0aCA8IGRsICYmXG4gICAgICAgICAgIGRhdGFbbWF0Y2ggKyBtYXRjaExlbmd0aF0gPT09IGRhdGFbcG9zaXRpb24gKyBtYXRjaExlbmd0aF0pIHtcbiAgICAgICsrbWF0Y2hMZW5ndGg7XG4gICAgfVxuXG4gICAgLy8g44Oe44OD44OB6ZW344GM5ZCM44GY5aC05ZCI44Gv5b6M5pa544KS5YSq5YWIXG4gICAgaWYgKG1hdGNoTGVuZ3RoID4gbWF0Y2hNYXgpIHtcbiAgICAgIGN1cnJlbnRNYXRjaCA9IG1hdGNoO1xuICAgICAgbWF0Y2hNYXggPSBtYXRjaExlbmd0aDtcbiAgICB9XG5cbiAgICAvLyDmnIDplbfjgYznorrlrprjgZfjgZ/jgonlvozjga7lh6bnkIbjga/nnIHnlaVcbiAgICBpZiAobWF0Y2hMZW5ndGggPT09IFpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF4TGVuZ3RoKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2gobWF0Y2hNYXgsIHBvc2l0aW9uIC0gY3VycmVudE1hdGNoKTtcbn07XG5cbi8qKlxuICogVHJlZS1UcmFuc21pdCBTeW1ib2xzIOOBrueul+WHulxuICogcmVmZXJlbmNlOiBQdVRUWSBEZWZsYXRlIGltcGxlbWVudGF0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0gaGxpdCBITElULlxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBsaXRsZW5MZW5ndGhzIOODquODhuODqeODq+OBqOmVt+OBleespuWPt+OBruespuWPt+mVt+mFjeWIly5cbiAqIEBwYXJhbSB7bnVtYmVyfSBoZGlzdCBIRElTVC5cbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gZGlzdExlbmd0aHMg6Led6Zui56ym5Y+344Gu56ym5Y+36ZW36YWN5YiXLlxuICogQHJldHVybiB7e1xuICogICBjb2RlczogIShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSksXG4gKiAgIGZyZXFzOiAhKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KVxuICogfX0gVHJlZS1UcmFuc21pdCBTeW1ib2xzLlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmdldFRyZWVTeW1ib2xzXyA9XG5mdW5jdGlvbihobGl0LCBsaXRsZW5MZW5ndGhzLCBoZGlzdCwgZGlzdExlbmd0aHMpIHtcbiAgdmFyIHNyYyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50MzJBcnJheSA6IEFycmF5KShobGl0ICsgaGRpc3QpLFxuICAgICAgaSwgaiwgcnVuTGVuZ3RoLCBsLFxuICAgICAgcmVzdWx0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQzMkFycmF5IDogQXJyYXkpKDI4NiArIDMwKSxcbiAgICAgIG5SZXN1bHQsXG4gICAgICBycHQsXG4gICAgICBmcmVxcyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKDE5KTtcblxuICBqID0gMDtcbiAgZm9yIChpID0gMDsgaSA8IGhsaXQ7IGkrKykge1xuICAgIHNyY1tqKytdID0gbGl0bGVuTGVuZ3Roc1tpXTtcbiAgfVxuICBmb3IgKGkgPSAwOyBpIDwgaGRpc3Q7IGkrKykge1xuICAgIHNyY1tqKytdID0gZGlzdExlbmd0aHNbaV07XG4gIH1cblxuICAvLyDliJ3mnJ/ljJZcbiAgaWYgKCFVU0VfVFlQRURBUlJBWSkge1xuICAgIGZvciAoaSA9IDAsIGwgPSBmcmVxcy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgIGZyZXFzW2ldID0gMDtcbiAgICB9XG4gIH1cblxuICAvLyDnrKblj7fljJZcbiAgblJlc3VsdCA9IDA7XG4gIGZvciAoaSA9IDAsIGwgPSBzcmMubGVuZ3RoOyBpIDwgbDsgaSArPSBqKSB7XG4gICAgLy8gUnVuIExlbmd0aCBFbmNvZGluZ1xuICAgIGZvciAoaiA9IDE7IGkgKyBqIDwgbCAmJiBzcmNbaSArIGpdID09PSBzcmNbaV07ICsraikge31cblxuICAgIHJ1bkxlbmd0aCA9IGo7XG5cbiAgICBpZiAoc3JjW2ldID09PSAwKSB7XG4gICAgICAvLyAwIOOBrue5sOOCiui/lOOBl+OBjCAzIOWbnuacqua6gOOBquOCieOBsOOBneOBruOBvuOBvlxuICAgICAgaWYgKHJ1bkxlbmd0aCA8IDMpIHtcbiAgICAgICAgd2hpbGUgKHJ1bkxlbmd0aC0tID4gMCkge1xuICAgICAgICAgIHJlc3VsdFtuUmVzdWx0KytdID0gMDtcbiAgICAgICAgICBmcmVxc1swXSsrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aGlsZSAocnVuTGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIOe5sOOCiui/lOOBl+OBr+acgOWkpyAxMzgg44G+44Gn44Gq44Gu44Gn5YiH44KK6Kmw44KB44KLXG4gICAgICAgICAgcnB0ID0gKHJ1bkxlbmd0aCA8IDEzOCA/IHJ1bkxlbmd0aCA6IDEzOCk7XG5cbiAgICAgICAgICBpZiAocnB0ID4gcnVuTGVuZ3RoIC0gMyAmJiBycHQgPCBydW5MZW5ndGgpIHtcbiAgICAgICAgICAgIHJwdCA9IHJ1bkxlbmd0aCAtIDM7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gMy0xMCDlm54gLT4gMTdcbiAgICAgICAgICBpZiAocnB0IDw9IDEwKSB7XG4gICAgICAgICAgICByZXN1bHRbblJlc3VsdCsrXSA9IDE3O1xuICAgICAgICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBycHQgLSAzO1xuICAgICAgICAgICAgZnJlcXNbMTddKys7XG4gICAgICAgICAgLy8gMTEtMTM4IOWbniAtPiAxOFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRbblJlc3VsdCsrXSA9IDE4O1xuICAgICAgICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBycHQgLSAxMTtcbiAgICAgICAgICAgIGZyZXFzWzE4XSsrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJ1bkxlbmd0aCAtPSBycHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBzcmNbaV07XG4gICAgICBmcmVxc1tzcmNbaV1dKys7XG4gICAgICBydW5MZW5ndGgtLTtcblxuICAgICAgLy8g57mw44KK6L+U44GX5Zue5pWw44GMM+Wbnuacqua6gOOBquOCieOBsOODqeODs+ODrOODs+OCsOOCueespuWPt+OBr+imgeOCieOBquOBhFxuICAgICAgaWYgKHJ1bkxlbmd0aCA8IDMpIHtcbiAgICAgICAgd2hpbGUgKHJ1bkxlbmd0aC0tID4gMCkge1xuICAgICAgICAgIHJlc3VsdFtuUmVzdWx0KytdID0gc3JjW2ldO1xuICAgICAgICAgIGZyZXFzW3NyY1tpXV0rKztcbiAgICAgICAgfVxuICAgICAgLy8gMyDlm57ku6XkuIrjgarjgonjgbDjg6njg7Pjg6zjg7PjgrDjgrnnrKblj7fljJZcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChydW5MZW5ndGggPiAwKSB7XG4gICAgICAgICAgLy8gcnVuTGVuZ3Ro44KSIDMtNiDjgafliIblibJcbiAgICAgICAgICBycHQgPSAocnVuTGVuZ3RoIDwgNiA/IHJ1bkxlbmd0aCA6IDYpO1xuXG4gICAgICAgICAgaWYgKHJwdCA+IHJ1bkxlbmd0aCAtIDMgJiYgcnB0IDwgcnVuTGVuZ3RoKSB7XG4gICAgICAgICAgICBycHQgPSBydW5MZW5ndGggLSAzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdFtuUmVzdWx0KytdID0gMTY7XG4gICAgICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBycHQgLSAzO1xuICAgICAgICAgIGZyZXFzWzE2XSsrO1xuXG4gICAgICAgICAgcnVuTGVuZ3RoIC09IHJwdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29kZXM6XG4gICAgICBVU0VfVFlQRURBUlJBWSA/IHJlc3VsdC5zdWJhcnJheSgwLCBuUmVzdWx0KSA6IHJlc3VsdC5zbGljZSgwLCBuUmVzdWx0KSxcbiAgICBmcmVxczogZnJlcXNcbiAgfTtcbn07XG5cbi8qKlxuICog44OP44OV44Oe44Oz56ym5Y+344Gu6ZW344GV44KS5Y+W5b6X44GZ44KLXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSBmcmVxcyDlh7rnj77jgqvjgqbjg7Pjg4guXG4gKiBAcGFyYW0ge251bWJlcn0gbGltaXQg56ym5Y+36ZW344Gu5Yi26ZmQLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0g56ym5Y+36ZW36YWN5YiXLlxuICogQHByaXZhdGVcbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5nZXRMZW5ndGhzXyA9IGZ1bmN0aW9uKGZyZXFzLCBsaW1pdCkge1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG5TeW1ib2xzID0gZnJlcXMubGVuZ3RoO1xuICAvKiogQHR5cGUge1psaWIuSGVhcH0gKi9cbiAgdmFyIGhlYXAgPSBuZXcgWmxpYi5IZWFwKDIgKiBabGliLlJhd0RlZmxhdGUuSFVGTUFYKTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgbGVuZ3RoID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoblN5bWJvbHMpO1xuICAvKiogQHR5cGUge0FycmF5fSAqL1xuICB2YXIgbm9kZXM7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIHZhbHVlcztcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgY29kZUxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlsO1xuXG4gIC8vIOmFjeWIl+OBruWIneacn+WMllxuICBpZiAoIVVTRV9UWVBFREFSUkFZKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG5TeW1ib2xzOyBpKyspIHtcbiAgICAgIGxlbmd0aFtpXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgLy8g44OS44O844OX44Gu5qeL56+JXG4gIGZvciAoaSA9IDA7IGkgPCBuU3ltYm9sczsgKytpKSB7XG4gICAgaWYgKGZyZXFzW2ldID4gMCkge1xuICAgICAgaGVhcC5wdXNoKGksIGZyZXFzW2ldKTtcbiAgICB9XG4gIH1cbiAgbm9kZXMgPSBuZXcgQXJyYXkoaGVhcC5sZW5ndGggLyAyKTtcbiAgdmFsdWVzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQzMkFycmF5IDogQXJyYXkpKGhlYXAubGVuZ3RoIC8gMik7XG5cbiAgLy8g6Z2eIDAg44Gu6KaB57Sg44GM5LiA44Gk44Gg44GR44Gg44Gj44Gf5aC05ZCI44Gv44CB44Gd44Gu44K344Oz44Oc44Or44Gr56ym5Y+36ZW3IDEg44KS5Ymy44KK5b2T44Gm44Gm57WC5LqGXG4gIGlmIChub2Rlcy5sZW5ndGggPT09IDEpIHtcbiAgICBsZW5ndGhbaGVhcC5wb3AoKS5pbmRleF0gPSAxO1xuICAgIHJldHVybiBsZW5ndGg7XG4gIH1cblxuICAvLyBSZXZlcnNlIFBhY2thZ2UgTWVyZ2UgQWxnb3JpdGhtIOOBq+OCiOOCiyBDYW5vbmljYWwgSHVmZm1hbiBDb2RlIOOBruespuWPt+mVt+axuuWumlxuICBmb3IgKGkgPSAwLCBpbCA9IGhlYXAubGVuZ3RoIC8gMjsgaSA8IGlsOyArK2kpIHtcbiAgICBub2Rlc1tpXSA9IGhlYXAucG9wKCk7XG4gICAgdmFsdWVzW2ldID0gbm9kZXNbaV0udmFsdWU7XG4gIH1cbiAgY29kZUxlbmd0aCA9IHRoaXMucmV2ZXJzZVBhY2thZ2VNZXJnZV8odmFsdWVzLCB2YWx1ZXMubGVuZ3RoLCBsaW1pdCk7XG5cbiAgZm9yIChpID0gMCwgaWwgPSBub2Rlcy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgbGVuZ3RoW25vZGVzW2ldLmluZGV4XSA9IGNvZGVMZW5ndGhbaV07XG4gIH1cblxuICByZXR1cm4gbGVuZ3RoO1xufTtcblxuLyoqXG4gKiBSZXZlcnNlIFBhY2thZ2UgTWVyZ2UgQWxnb3JpdGhtLlxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gZnJlcXMgc29ydGVkIHByb2JhYmlsaXR5LlxuICogQHBhcmFtIHtudW1iZXJ9IHN5bWJvbHMgbnVtYmVyIG9mIHN5bWJvbHMuXG4gKiBAcGFyYW0ge251bWJlcn0gbGltaXQgY29kZSBsZW5ndGggbGltaXQuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBjb2RlIGxlbmd0aHMuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUucmV2ZXJzZVBhY2thZ2VNZXJnZV8gPSBmdW5jdGlvbihmcmVxcywgc3ltYm9scywgbGltaXQpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gKi9cbiAgdmFyIG1pbmltdW1Db3N0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQxNkFycmF5IDogQXJyYXkpKGxpbWl0KTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgZmxhZyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKGxpbWl0KTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgY29kZUxlbmd0aCA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKHN5bWJvbHMpO1xuICAvKiogQHR5cGUge0FycmF5fSAqL1xuICB2YXIgdmFsdWUgPSBuZXcgQXJyYXkobGltaXQpO1xuICAvKiogQHR5cGUge0FycmF5fSAqL1xuICB2YXIgdHlwZSAgPSBuZXcgQXJyYXkobGltaXQpO1xuICAvKiogQHR5cGUge0FycmF5LjxudW1iZXI+fSAqL1xuICB2YXIgY3VycmVudFBvc2l0aW9uID0gbmV3IEFycmF5KGxpbWl0KTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBleGNlc3MgPSAoMSA8PCBsaW1pdCkgLSBzeW1ib2xzO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGhhbGYgPSAoMSA8PCAobGltaXQgLSAxKSk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBqO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgd2VpZ2h0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG5leHQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBqXG4gICAqL1xuICBmdW5jdGlvbiB0YWtlUGFja2FnZShqKSB7XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgdmFyIHggPSB0eXBlW2pdW2N1cnJlbnRQb3NpdGlvbltqXV07XG5cbiAgICBpZiAoeCA9PT0gc3ltYm9scykge1xuICAgICAgdGFrZVBhY2thZ2UoaisxKTtcbiAgICAgIHRha2VQYWNrYWdlKGorMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC0tY29kZUxlbmd0aFt4XTtcbiAgICB9XG5cbiAgICArK2N1cnJlbnRQb3NpdGlvbltqXTtcbiAgfVxuXG4gIG1pbmltdW1Db3N0W2xpbWl0LTFdID0gc3ltYm9scztcblxuICBmb3IgKGogPSAwOyBqIDwgbGltaXQ7ICsraikge1xuICAgIGlmIChleGNlc3MgPCBoYWxmKSB7XG4gICAgICBmbGFnW2pdID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgZmxhZ1tqXSA9IDE7XG4gICAgICBleGNlc3MgLT0gaGFsZjtcbiAgICB9XG4gICAgZXhjZXNzIDw8PSAxO1xuICAgIG1pbmltdW1Db3N0W2xpbWl0LTItal0gPSAobWluaW11bUNvc3RbbGltaXQtMS1qXSAvIDIgfCAwKSArIHN5bWJvbHM7XG4gIH1cbiAgbWluaW11bUNvc3RbMF0gPSBmbGFnWzBdO1xuXG4gIHZhbHVlWzBdID0gbmV3IEFycmF5KG1pbmltdW1Db3N0WzBdKTtcbiAgdHlwZVswXSAgPSBuZXcgQXJyYXkobWluaW11bUNvc3RbMF0pO1xuICBmb3IgKGogPSAxOyBqIDwgbGltaXQ7ICsraikge1xuICAgIGlmIChtaW5pbXVtQ29zdFtqXSA+IDIgKiBtaW5pbXVtQ29zdFtqLTFdICsgZmxhZ1tqXSkge1xuICAgICAgbWluaW11bUNvc3Rbal0gPSAyICogbWluaW11bUNvc3Rbai0xXSArIGZsYWdbal07XG4gICAgfVxuICAgIHZhbHVlW2pdID0gbmV3IEFycmF5KG1pbmltdW1Db3N0W2pdKTtcbiAgICB0eXBlW2pdICA9IG5ldyBBcnJheShtaW5pbXVtQ29zdFtqXSk7XG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgc3ltYm9sczsgKytpKSB7XG4gICAgY29kZUxlbmd0aFtpXSA9IGxpbWl0O1xuICB9XG5cbiAgZm9yICh0ID0gMDsgdCA8IG1pbmltdW1Db3N0W2xpbWl0LTFdOyArK3QpIHtcbiAgICB2YWx1ZVtsaW1pdC0xXVt0XSA9IGZyZXFzW3RdO1xuICAgIHR5cGVbbGltaXQtMV1bdF0gID0gdDtcbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBsaW1pdDsgKytpKSB7XG4gICAgY3VycmVudFBvc2l0aW9uW2ldID0gMDtcbiAgfVxuICBpZiAoZmxhZ1tsaW1pdC0xXSA9PT0gMSkge1xuICAgIC0tY29kZUxlbmd0aFswXTtcbiAgICArK2N1cnJlbnRQb3NpdGlvbltsaW1pdC0xXTtcbiAgfVxuXG4gIGZvciAoaiA9IGxpbWl0LTI7IGogPj0gMDsgLS1qKSB7XG4gICAgaSA9IDA7XG4gICAgd2VpZ2h0ID0gMDtcbiAgICBuZXh0ID0gY3VycmVudFBvc2l0aW9uW2orMV07XG5cbiAgICBmb3IgKHQgPSAwOyB0IDwgbWluaW11bUNvc3Rbal07IHQrKykge1xuICAgICAgd2VpZ2h0ID0gdmFsdWVbaisxXVtuZXh0XSArIHZhbHVlW2orMV1bbmV4dCsxXTtcblxuICAgICAgaWYgKHdlaWdodCA+IGZyZXFzW2ldKSB7XG4gICAgICAgIHZhbHVlW2pdW3RdID0gd2VpZ2h0O1xuICAgICAgICB0eXBlW2pdW3RdID0gc3ltYm9scztcbiAgICAgICAgbmV4dCArPSAyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVbal1bdF0gPSBmcmVxc1tpXTtcbiAgICAgICAgdHlwZVtqXVt0XSA9IGk7XG4gICAgICAgICsraTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjdXJyZW50UG9zaXRpb25bal0gPSAwO1xuICAgIGlmIChmbGFnW2pdID09PSAxKSB7XG4gICAgICB0YWtlUGFja2FnZShqKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29kZUxlbmd0aDtcbn07XG5cbi8qKlxuICog56ym5Y+36ZW36YWN5YiX44GL44KJ44OP44OV44Oe44Oz56ym5Y+344KS5Y+W5b6X44GZ44KLXG4gKiByZWZlcmVuY2U6IFB1VFRZIERlZmxhdGUgaW1wbGVtZW50YXRpb25cbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gbGVuZ3RocyDnrKblj7fplbfphY3liJcuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0g44OP44OV44Oe44Oz56ym5Y+36YWN5YiXLlxuICogQHByaXZhdGVcbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5nZXRDb2Rlc0Zyb21MZW5ndGhzXyA9IGZ1bmN0aW9uKGxlbmd0aHMpIHtcbiAgdmFyIGNvZGVzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQxNkFycmF5IDogQXJyYXkpKGxlbmd0aHMubGVuZ3RoKSxcbiAgICAgIGNvdW50ID0gW10sXG4gICAgICBzdGFydENvZGUgPSBbXSxcbiAgICAgIGNvZGUgPSAwLCBpLCBpbCwgaiwgbTtcblxuICAvLyBDb3VudCB0aGUgY29kZXMgb2YgZWFjaCBsZW5ndGguXG4gIGZvciAoaSA9IDAsIGlsID0gbGVuZ3Rocy5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XG4gICAgY291bnRbbGVuZ3Roc1tpXV0gPSAoY291bnRbbGVuZ3Roc1tpXV0gfCAwKSArIDE7XG4gIH1cblxuICAvLyBEZXRlcm1pbmUgdGhlIHN0YXJ0aW5nIGNvZGUgZm9yIGVhY2ggbGVuZ3RoIGJsb2NrLlxuICBmb3IgKGkgPSAxLCBpbCA9IFpsaWIuUmF3RGVmbGF0ZS5NYXhDb2RlTGVuZ3RoOyBpIDw9IGlsOyBpKyspIHtcbiAgICBzdGFydENvZGVbaV0gPSBjb2RlO1xuICAgIGNvZGUgKz0gY291bnRbaV0gfCAwO1xuICAgIGNvZGUgPDw9IDE7XG4gIH1cblxuICAvLyBEZXRlcm1pbmUgdGhlIGNvZGUgZm9yIGVhY2ggc3ltYm9sLiBNaXJyb3JlZCwgb2YgY291cnNlLlxuICBmb3IgKGkgPSAwLCBpbCA9IGxlbmd0aHMubGVuZ3RoOyBpIDwgaWw7IGkrKykge1xuICAgIGNvZGUgPSBzdGFydENvZGVbbGVuZ3Roc1tpXV07XG4gICAgc3RhcnRDb2RlW2xlbmd0aHNbaV1dICs9IDE7XG4gICAgY29kZXNbaV0gPSAwO1xuXG4gICAgZm9yIChqID0gMCwgbSA9IGxlbmd0aHNbaV07IGogPCBtOyBqKyspIHtcbiAgICAgIGNvZGVzW2ldID0gKGNvZGVzW2ldIDw8IDEpIHwgKGNvZGUgJiAxKTtcbiAgICAgIGNvZGUgPj4+PSAxO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb2Rlcztcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBHWklQIChSRkMxOTUyKSDlrp/oo4UuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5HemlwJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5DUkMzMicpO1xuZ29vZy5yZXF1aXJlKCdabGliLlJhd0RlZmxhdGUnKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICovXG5abGliLkd6aXAgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGlucHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5pbnB1dCA9IGlucHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gaW5wdXQgYnVmZmVyIHBvaW50ZXIuICovXG4gIHRoaXMuaXAgPSAwO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuICovXG4gIHRoaXMub3V0cHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5vcCA9IDA7XG4gIC8qKiBAdHlwZSB7IU9iamVjdH0gZmxhZ3Mgb3B0aW9uIGZsYWdzLiAqL1xuICB0aGlzLmZsYWdzID0ge307XG4gIC8qKiBAdHlwZSB7IXN0cmluZ30gZmlsZW5hbWUuICovXG4gIHRoaXMuZmlsZW5hbWU7XG4gIC8qKiBAdHlwZSB7IXN0cmluZ30gY29tbWVudC4gKi9cbiAgdGhpcy5jb21tZW50O1xuICAvKiogQHR5cGUgeyFPYmplY3R9IGRlZmxhdGUgb3B0aW9ucy4gKi9cbiAgdGhpcy5kZWZsYXRlT3B0aW9ucztcblxuICAvLyBvcHRpb24gcGFyYW1ldGVyc1xuICBpZiAob3B0X3BhcmFtcykge1xuICAgIGlmIChvcHRfcGFyYW1zWydmbGFncyddKSB7XG4gICAgICB0aGlzLmZsYWdzID0gb3B0X3BhcmFtc1snZmxhZ3MnXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW1zWydmaWxlbmFtZSddID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5maWxlbmFtZSA9IG9wdF9wYXJhbXNbJ2ZpbGVuYW1lJ107XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtc1snY29tbWVudCddID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5jb21tZW50ID0gb3B0X3BhcmFtc1snY29tbWVudCddO1xuICAgIH1cbiAgICBpZiAob3B0X3BhcmFtc1snZGVmbGF0ZU9wdGlvbnMnXSkge1xuICAgICAgdGhpcy5kZWZsYXRlT3B0aW9ucyA9IG9wdF9wYXJhbXNbJ2RlZmxhdGVPcHRpb25zJ107XG4gICAgfVxuICB9XG5cbiAgaWYgKCF0aGlzLmRlZmxhdGVPcHRpb25zKSB7XG4gICAgdGhpcy5kZWZsYXRlT3B0aW9ucyA9IHt9O1xuICB9XG59O1xuXG4vKipcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKiBAY29uc3RcbiAqL1xuWmxpYi5HemlwLkRlZmF1bHRCdWZmZXJTaXplID0gMHg4MDAwO1xuXG4vKipcbiAqIGVuY29kZSBnemlwIG1lbWJlcnMuXG4gKiBAcmV0dXJuIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBnemlwIGJpbmFyeSBhcnJheS5cbiAqL1xuWmxpYi5HemlwLnByb3RvdHlwZS5jb21wcmVzcyA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gZmxhZ3MuICovXG4gIHZhciBmbGc7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtb2RpZmljYXRpb24gdGltZS4gKi9cbiAgdmFyIG10aW1lO1xuICAvKiogQHR5cGUge251bWJlcn0gQ1JDLTE2IHZhbHVlIGZvciBGSENSQyBmbGFnLiAqL1xuICB2YXIgY3JjMTY7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBDUkMtMzIgdmFsdWUgZm9yIHZlcmlmaWNhdGlvbi4gKi9cbiAgdmFyIGNyYzMyO1xuICAvKiogQHR5cGUgeyFabGliLlJhd0RlZmxhdGV9IHJhdyBkZWZsYXRlIG9iamVjdC4gKi9cbiAgdmFyIHJhd2RlZmxhdGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjaGFyYWN0ZXIgY29kZSAqL1xuICB2YXIgYztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGxpbWl0ZXIuICovXG4gIHZhciBpbDtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyLiAqL1xuICB2YXIgb3V0cHV0ID1cbiAgICBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShabGliLkd6aXAuRGVmYXVsdEJ1ZmZlclNpemUpO1xuICAvKiogQHR5cGUge251bWJlcn0gb3V0cHV0IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB2YXIgb3AgPSAwO1xuXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG4gIHZhciBmaWxlbmFtZSA9IHRoaXMuZmlsZW5hbWU7XG4gIHZhciBjb21tZW50ID0gdGhpcy5jb21tZW50O1xuXG4gIC8vIGNoZWNrIHNpZ25hdHVyZVxuICBvdXRwdXRbb3ArK10gPSAweDFmO1xuICBvdXRwdXRbb3ArK10gPSAweDhiO1xuXG4gIC8vIGNoZWNrIGNvbXByZXNzaW9uIG1ldGhvZFxuICBvdXRwdXRbb3ArK10gPSA4OyAvKiBYWFg6IHVzZSBabGliIGNvbnN0ICovXG5cbiAgLy8gZmxhZ3NcbiAgZmxnID0gMDtcbiAgaWYgKHRoaXMuZmxhZ3NbJ2ZuYW1lJ10pICAgIGZsZyB8PSBabGliLkd6aXAuRmxhZ3NNYXNrLkZOQU1FO1xuICBpZiAodGhpcy5mbGFnc1snZmNvbW1lbnQnXSkgZmxnIHw9IFpsaWIuR3ppcC5GbGFnc01hc2suRkNPTU1FTlQ7XG4gIGlmICh0aGlzLmZsYWdzWydmaGNyYyddKSAgICBmbGcgfD0gWmxpYi5HemlwLkZsYWdzTWFzay5GSENSQztcbiAgLy8gWFhYOiBGVEVYVFxuICAvLyBYWFg6IEZFWFRSQVxuICBvdXRwdXRbb3ArK10gPSBmbGc7XG5cbiAgLy8gbW9kaWZpY2F0aW9uIHRpbWVcbiAgbXRpbWUgPSAoRGF0ZS5ub3cgPyBEYXRlLm5vdygpIDogK25ldyBEYXRlKCkpIC8gMTAwMCB8IDA7XG4gIG91dHB1dFtvcCsrXSA9IG10aW1lICAgICAgICAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IG10aW1lID4+PiAgOCAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IG10aW1lID4+PiAxNiAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IG10aW1lID4+PiAyNCAmIDB4ZmY7XG5cbiAgLy8gZXh0cmEgZmxhZ3NcbiAgb3V0cHV0W29wKytdID0gMDtcblxuICAvLyBvcGVyYXRpbmcgc3lzdGVtXG4gIG91dHB1dFtvcCsrXSA9IFpsaWIuR3ppcC5PcGVyYXRpbmdTeXN0ZW0uVU5LTk9XTjtcblxuICAvLyBleHRyYVxuICAvKiBOT1AgKi9cblxuICAvLyBmbmFtZVxuICBpZiAodGhpcy5mbGFnc1snZm5hbWUnXSAhPT0gdm9pZCAwKSB7XG4gICAgZm9yIChpID0gMCwgaWwgPSBmaWxlbmFtZS5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICBjID0gZmlsZW5hbWUuY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjID4gMHhmZikgeyBvdXRwdXRbb3ArK10gPSAoYyA+Pj4gOCkgJiAweGZmOyB9XG4gICAgICBvdXRwdXRbb3ArK10gPSBjICYgMHhmZjtcbiAgICB9XG4gICAgb3V0cHV0W29wKytdID0gMDsgLy8gbnVsbCB0ZXJtaW5hdGlvblxuICB9XG5cbiAgLy8gZmNvbW1lbnRcbiAgaWYgKHRoaXMuZmxhZ3NbJ2NvbW1lbnQnXSkge1xuICAgIGZvciAoaSA9IDAsIGlsID0gY29tbWVudC5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICBjID0gY29tbWVudC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGMgPiAweGZmKSB7IG91dHB1dFtvcCsrXSA9IChjID4+PiA4KSAmIDB4ZmY7IH1cbiAgICAgIG91dHB1dFtvcCsrXSA9IGMgJiAweGZmO1xuICAgIH1cbiAgICBvdXRwdXRbb3ArK10gPSAwOyAvLyBudWxsIHRlcm1pbmF0aW9uXG4gIH1cblxuICAvLyBmaGNyY1xuICBpZiAodGhpcy5mbGFnc1snZmhjcmMnXSkge1xuICAgIGNyYzE2ID0gWmxpYi5DUkMzMi5jYWxjKG91dHB1dCwgMCwgb3ApICYgMHhmZmZmO1xuICAgIG91dHB1dFtvcCsrXSA9IChjcmMxNiAgICAgICkgJiAweGZmO1xuICAgIG91dHB1dFtvcCsrXSA9IChjcmMxNiA+Pj4gOCkgJiAweGZmO1xuICB9XG5cbiAgLy8gYWRkIGNvbXByZXNzIG9wdGlvblxuICB0aGlzLmRlZmxhdGVPcHRpb25zWydvdXRwdXRCdWZmZXInXSA9IG91dHB1dDtcbiAgdGhpcy5kZWZsYXRlT3B0aW9uc1snb3V0cHV0SW5kZXgnXSA9IG9wO1xuXG4gIC8vIGNvbXByZXNzXG4gIHJhd2RlZmxhdGUgPSBuZXcgWmxpYi5SYXdEZWZsYXRlKGlucHV0LCB0aGlzLmRlZmxhdGVPcHRpb25zKTtcbiAgb3V0cHV0ID0gcmF3ZGVmbGF0ZS5jb21wcmVzcygpO1xuICBvcCA9IHJhd2RlZmxhdGUub3A7XG5cbiAgLy8gZXhwYW5kIGJ1ZmZlclxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBpZiAob3AgKyA4ID4gb3V0cHV0LmJ1ZmZlci5ieXRlTGVuZ3RoKSB7XG4gICAgICB0aGlzLm91dHB1dCA9IG5ldyBVaW50OEFycmF5KG9wICsgOCk7XG4gICAgICB0aGlzLm91dHB1dC5zZXQobmV3IFVpbnQ4QXJyYXkob3V0cHV0LmJ1ZmZlcikpO1xuICAgICAgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dCA9IG5ldyBVaW50OEFycmF5KG91dHB1dC5idWZmZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNyYzMyXG4gIGNyYzMyID0gWmxpYi5DUkMzMi5jYWxjKGlucHV0KTtcbiAgb3V0cHV0W29wKytdID0gKGNyYzMyICAgICAgICkgJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAoY3JjMzIgPj4+ICA4KSAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IChjcmMzMiA+Pj4gMTYpICYgMHhmZjtcbiAgb3V0cHV0W29wKytdID0gKGNyYzMyID4+PiAyNCkgJiAweGZmO1xuXG4gIC8vIGlucHV0IHNpemVcbiAgaWwgPSBpbnB1dC5sZW5ndGg7XG4gIG91dHB1dFtvcCsrXSA9IChpbCAgICAgICApICYgMHhmZjtcbiAgb3V0cHV0W29wKytdID0gKGlsID4+PiAgOCkgJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAoaWwgPj4+IDE2KSAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IChpbCA+Pj4gMjQpICYgMHhmZjtcblxuICB0aGlzLmlwID0gaXA7XG5cbiAgaWYgKFVTRV9UWVBFREFSUkFZICYmIG9wIDwgb3V0cHV0Lmxlbmd0aCkge1xuICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0ID0gb3V0cHV0LnN1YmFycmF5KDAsIG9wKTtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKiogQGVudW0ge251bWJlcn0gKi9cblpsaWIuR3ppcC5PcGVyYXRpbmdTeXN0ZW0gPSB7XG4gIEZBVDogMCxcbiAgQU1JR0E6IDEsXG4gIFZNUzogMixcbiAgVU5JWDogMyxcbiAgVk1fQ01TOiA0LFxuICBBVEFSSV9UT1M6IDUsXG4gIEhQRlM6IDYsXG4gIE1BQ0lOVE9TSDogNyxcbiAgWl9TWVNURU06IDgsXG4gIENQX006IDksXG4gIFRPUFNfMjA6IDEwLFxuICBOVEZTOiAxMSxcbiAgUURPUzogMTIsXG4gIEFDT1JOX1JJU0NPUzogMTMsXG4gIFVOS05PV046IDI1NVxufTtcblxuLyoqIEBlbnVtIHtudW1iZXJ9ICovXG5abGliLkd6aXAuRmxhZ3NNYXNrID0ge1xuICBGVEVYVDogMHgwMSxcbiAgRkhDUkM6IDB4MDIsXG4gIEZFWFRSQTogMHgwNCxcbiAgRk5BTUU6IDB4MDgsXG4gIEZDT01NRU5UOiAweDEwXG59O1xuXG59KTtcbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsImdvb2cucHJvdmlkZSgnWmxpYi5SYXdJbmZsYXRlJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5IdWZmbWFuJyk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIEBkZWZpbmUge251bWJlcn0gYnVmZmVyIGJsb2NrIHNpemUuICovXG52YXIgWkxJQl9SQVdfSU5GTEFURV9CVUZGRVJfU0laRSA9IDB4ODAwMDsgLy8gWyAweDgwMDAgPj0gWkxJQl9CVUZGRVJfQkxPQ0tfU0laRSBdXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxudmFyIGJ1aWxkSHVmZm1hblRhYmxlID0gWmxpYi5IdWZmbWFuLmJ1aWxkSHVmZm1hblRhYmxlO1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBpbnB1dCBpbnB1dCBidWZmZXIuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0X3BhcmFtcyBvcHRpb24gcGFyYW1ldGVyLlxuICpcbiAqIG9wdF9wYXJhbXMg44Gv5Lul5LiL44Gu44OX44Ot44OR44OG44Kj44KS5oyH5a6a44GZ44KL5LqL44GM44Gn44GN44G+44GZ44CCXG4gKiAgIC0gaW5kZXg6IGlucHV0IGJ1ZmZlciDjga4gZGVmbGF0ZSDjgrPjg7Pjg4bjg4rjga7plovlp4vkvY3nva4uXG4gKiAgIC0gYmxvY2tTaXplOiDjg5Djg4Pjg5XjgqHjga7jg5bjg63jg4Pjgq/jgrXjgqTjgrouXG4gKiAgIC0gYnVmZmVyVHlwZTogWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUg44Gu5YCk44Gr44KI44Gj44Gm44OQ44OD44OV44Kh44Gu566h55CG5pa55rOV44KS5oyH5a6a44GZ44KLLlxuICogICAtIHJlc2l6ZTog56K65L+d44GX44Gf44OQ44OD44OV44Kh44GM5a6f6Zqb44Gu5aSn44GN44GV44KI44KK5aSn44GN44GL44Gj44Gf5aC05ZCI44Gr5YiH44KK6Kmw44KB44KLLlxuICovXG5abGliLlJhd0luZmxhdGUgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGluZmxhdGVkIGJ1ZmZlciAqL1xuICB0aGlzLmJ1ZmZlcjtcbiAgLyoqIEB0eXBlIHshQXJyYXkuPChBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KT59ICovXG4gIHRoaXMuYmxvY2tzID0gW107XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBibG9jayBzaXplLiAqL1xuICB0aGlzLmJ1ZmZlclNpemUgPSBaTElCX1JBV19JTkZMQVRFX0JVRkZFUl9TSVpFO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IHRvdGFsIG91dHB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy50b3RhbHBvcyA9IDA7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gaW5wdXQgYnVmZmVyIHBvaW50ZXIuICovXG4gIHRoaXMuaXAgPSAwO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IGJpdCBzdHJlYW0gcmVhZGVyIGJ1ZmZlci4gKi9cbiAgdGhpcy5iaXRzYnVmID0gMDtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSBiaXQgc3RyZWFtIHJlYWRlciBidWZmZXIgc2l6ZS4gKi9cbiAgdGhpcy5iaXRzYnVmbGVuID0gMDtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbnB1dCBidWZmZXIuICovXG4gIHRoaXMuaW5wdXQgPSBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50OEFycmF5KGlucHV0KSA6IGlucHV0O1xuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheS48bnVtYmVyPil9IG91dHB1dCBidWZmZXIuICovXG4gIHRoaXMub3V0cHV0O1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IG91dHB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy5vcDtcbiAgLyoqIEB0eXBlIHtib29sZWFufSBpcyBmaW5hbCBibG9jayBmbGFnLiAqL1xuICB0aGlzLmJmaW5hbCA9IGZhbHNlO1xuICAvKiogQHR5cGUge1psaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlfSBidWZmZXIgbWFuYWdlbWVudC4gKi9cbiAgdGhpcy5idWZmZXJUeXBlID0gWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUuQURBUFRJVkU7XG4gIC8qKiBAdHlwZSB7Ym9vbGVhbn0gcmVzaXplIGZsYWcgZm9yIG1lbW9yeSBzaXplIG9wdGltaXphdGlvbi4gKi9cbiAgdGhpcy5yZXNpemUgPSBmYWxzZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHByZXZpb3VzIFJMRSB2YWx1ZSAqL1xuICB0aGlzLnByZXY7XG5cbiAgLy8gb3B0aW9uIHBhcmFtZXRlcnNcbiAgaWYgKG9wdF9wYXJhbXMgfHwgIShvcHRfcGFyYW1zID0ge30pKSB7XG4gICAgaWYgKG9wdF9wYXJhbXNbJ2luZGV4J10pIHtcbiAgICAgIHRoaXMuaXAgPSBvcHRfcGFyYW1zWydpbmRleCddO1xuICAgIH1cbiAgICBpZiAob3B0X3BhcmFtc1snYnVmZmVyU2l6ZSddKSB7XG4gICAgICB0aGlzLmJ1ZmZlclNpemUgPSBvcHRfcGFyYW1zWydidWZmZXJTaXplJ107XG4gICAgfVxuICAgIGlmIChvcHRfcGFyYW1zWydidWZmZXJUeXBlJ10pIHtcbiAgICAgIHRoaXMuYnVmZmVyVHlwZSA9IG9wdF9wYXJhbXNbJ2J1ZmZlclR5cGUnXTtcbiAgICB9XG4gICAgaWYgKG9wdF9wYXJhbXNbJ3Jlc2l6ZSddKSB7XG4gICAgICB0aGlzLnJlc2l6ZSA9IG9wdF9wYXJhbXNbJ3Jlc2l6ZSddO1xuICAgIH1cbiAgfVxuXG4gIC8vIGluaXRpYWxpemVcbiAgc3dpdGNoICh0aGlzLmJ1ZmZlclR5cGUpIHtcbiAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlLkJMT0NLOlxuICAgICAgdGhpcy5vcCA9IFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aDtcbiAgICAgIHRoaXMub3V0cHV0ID1cbiAgICAgICAgbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoXG4gICAgICAgICAgWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoICtcbiAgICAgICAgICB0aGlzLmJ1ZmZlclNpemUgK1xuICAgICAgICAgIFpsaWIuUmF3SW5mbGF0ZS5NYXhDb3B5TGVuZ3RoXG4gICAgICAgICk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlLkFEQVBUSVZFOlxuICAgICAgdGhpcy5vcCA9IDA7XG4gICAgICB0aGlzLm91dHB1dCA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKHRoaXMuYnVmZmVyU2l6ZSk7XG4gICAgICB0aGlzLmV4cGFuZEJ1ZmZlciA9IHRoaXMuZXhwYW5kQnVmZmVyQWRhcHRpdmU7XG4gICAgICB0aGlzLmNvbmNhdEJ1ZmZlciA9IHRoaXMuY29uY2F0QnVmZmVyRHluYW1pYztcbiAgICAgIHRoaXMuZGVjb2RlSHVmZm1hbiA9IHRoaXMuZGVjb2RlSHVmZm1hbkFkYXB0aXZlO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBpbmZsYXRlIG1vZGUnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5abGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZSA9IHtcbiAgQkxPQ0s6IDAsXG4gIEFEQVBUSVZFOiAxXG59O1xuXG4vKipcbiAqIGRlY29tcHJlc3MuXG4gKiBAcmV0dXJuIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBpbmZsYXRlZCBidWZmZXIuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb21wcmVzcyA9IGZ1bmN0aW9uKCkge1xuICB3aGlsZSAoIXRoaXMuYmZpbmFsKSB7XG4gICAgdGhpcy5wYXJzZUJsb2NrKCk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5jb25jYXRCdWZmZXIoKTtcbn07XG5cbi8qKlxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfSBtYXggYmFja3dhcmQgbGVuZ3RoIGZvciBMWjc3LlxuICovXG5abGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGggPSAzMjc2ODtcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9IG1heCBjb3B5IGxlbmd0aCBmb3IgTFo3Ny5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLk1heENvcHlMZW5ndGggPSAyNTg7XG5cbi8qKlxuICogaHVmZm1hbiBvcmRlclxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLk9yZGVyID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50MTZBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFsxNiwgMTcsIDE4LCAwLCA4LCA3LCA5LCA2LCAxMCwgNSwgMTEsIDQsIDEyLCAzLCAxMywgMiwgMTQsIDEsIDE1XSk7XG5cbi8qKlxuICogaHVmZm1hbiBsZW5ndGggY29kZSB0YWJsZS5cbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGUuTGVuZ3RoQ29kZVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50MTZBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFtcbiAgMHgwMDAzLCAweDAwMDQsIDB4MDAwNSwgMHgwMDA2LCAweDAwMDcsIDB4MDAwOCwgMHgwMDA5LCAweDAwMGEsIDB4MDAwYixcbiAgMHgwMDBkLCAweDAwMGYsIDB4MDAxMSwgMHgwMDEzLCAweDAwMTcsIDB4MDAxYiwgMHgwMDFmLCAweDAwMjMsIDB4MDAyYixcbiAgMHgwMDMzLCAweDAwM2IsIDB4MDA0MywgMHgwMDUzLCAweDAwNjMsIDB4MDA3MywgMHgwMDgzLCAweDAwYTMsIDB4MDBjMyxcbiAgMHgwMGUzLCAweDAxMDIsIDB4MDEwMiwgMHgwMTAyXG5dKTtcblxuLyoqXG4gKiBodWZmbWFuIGxlbmd0aCBleHRyYS1iaXRzIHRhYmxlLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLkxlbmd0aEV4dHJhVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQ4QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbXG4gIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDEsIDEsIDIsIDIsIDIsIDIsIDMsIDMsIDMsIDMsIDQsIDQsIDQsIDQsIDUsIDUsXG4gIDUsIDUsIDAsIDAsIDBcbl0pO1xuXG4vKipcbiAqIGh1ZmZtYW4gZGlzdCBjb2RlIHRhYmxlLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5EaXN0Q29kZVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50MTZBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFtcbiAgMHgwMDAxLCAweDAwMDIsIDB4MDAwMywgMHgwMDA0LCAweDAwMDUsIDB4MDAwNywgMHgwMDA5LCAweDAwMGQsIDB4MDAxMSxcbiAgMHgwMDE5LCAweDAwMjEsIDB4MDAzMSwgMHgwMDQxLCAweDAwNjEsIDB4MDA4MSwgMHgwMGMxLCAweDAxMDEsIDB4MDE4MSxcbiAgMHgwMjAxLCAweDAzMDEsIDB4MDQwMSwgMHgwNjAxLCAweDA4MDEsIDB4MGMwMSwgMHgxMDAxLCAweDE4MDEsIDB4MjAwMSxcbiAgMHgzMDAxLCAweDQwMDEsIDB4NjAwMVxuXSk7XG5cbi8qKlxuICogaHVmZm1hbiBkaXN0IGV4dHJhLWJpdHMgdGFibGUuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGUuRGlzdEV4dHJhVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQ4QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbXG4gIDAsIDAsIDAsIDAsIDEsIDEsIDIsIDIsIDMsIDMsIDQsIDQsIDUsIDUsIDYsIDYsIDcsIDcsIDgsIDgsIDksIDksIDEwLCAxMCwgMTEsXG4gIDExLCAxMiwgMTIsIDEzLCAxM1xuXSk7XG5cbi8qKlxuICogZml4ZWQgaHVmZm1hbiBsZW5ndGggY29kZSB0YWJsZVxuICogQGNvbnN0XG4gKiBAdHlwZSB7IUFycmF5fVxuICovXG5abGliLlJhd0luZmxhdGUuRml4ZWRMaXRlcmFsTGVuZ3RoVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIHRhYmxlO1xufSkoKGZ1bmN0aW9uKCkge1xuICB2YXIgbGVuZ3RocyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKDI4OCk7XG4gIHZhciBpLCBpbDtcblxuICBmb3IgKGkgPSAwLCBpbCA9IGxlbmd0aHMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgIGxlbmd0aHNbaV0gPVxuICAgICAgKGkgPD0gMTQzKSA/IDggOlxuICAgICAgKGkgPD0gMjU1KSA/IDkgOlxuICAgICAgKGkgPD0gMjc5KSA/IDcgOlxuICAgICAgODtcbiAgfVxuXG4gIHJldHVybiBidWlsZEh1ZmZtYW5UYWJsZShsZW5ndGhzKTtcbn0pKCkpO1xuXG4vKipcbiAqIGZpeGVkIGh1ZmZtYW4gZGlzdGFuY2UgY29kZSB0YWJsZVxuICogQGNvbnN0XG4gKiBAdHlwZSB7IUFycmF5fVxuICovXG5abGliLlJhd0luZmxhdGUuRml4ZWREaXN0YW5jZVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiB0YWJsZTtcbn0pKChmdW5jdGlvbigpIHtcbiAgdmFyIGxlbmd0aHMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgzMCk7XG4gIHZhciBpLCBpbDtcblxuICBmb3IgKGkgPSAwLCBpbCA9IGxlbmd0aHMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgIGxlbmd0aHNbaV0gPSA1O1xuICB9XG5cbiAgcmV0dXJuIGJ1aWxkSHVmZm1hblRhYmxlKGxlbmd0aHMpO1xufSkoKSk7XG5cbi8qKlxuICogcGFyc2UgZGVmbGF0ZWQgYmxvY2suXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VCbG9jayA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gaGVhZGVyICovXG4gIHZhciBoZHIgPSB0aGlzLnJlYWRCaXRzKDMpO1xuXG4gIC8vIEJGSU5BTFxuICBpZiAoaGRyICYgMHgxKSB7XG4gICAgdGhpcy5iZmluYWwgPSB0cnVlO1xuICB9XG5cbiAgLy8gQlRZUEVcbiAgaGRyID4+Pj0gMTtcbiAgc3dpdGNoIChoZHIpIHtcbiAgICAvLyB1bmNvbXByZXNzZWRcbiAgICBjYXNlIDA6XG4gICAgICB0aGlzLnBhcnNlVW5jb21wcmVzc2VkQmxvY2soKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIGZpeGVkIGh1ZmZtYW5cbiAgICBjYXNlIDE6XG4gICAgICB0aGlzLnBhcnNlRml4ZWRIdWZmbWFuQmxvY2soKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIGR5bmFtaWMgaHVmZm1hblxuICAgIGNhc2UgMjpcbiAgICAgIHRoaXMucGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrKCk7XG4gICAgICBicmVhaztcbiAgICAvLyByZXNlcnZlZCBvciBvdGhlclxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gQlRZUEU6ICcgKyBoZHIpO1xuICB9XG59O1xuXG4vKipcbiAqIHJlYWQgaW5mbGF0ZSBiaXRzXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIGJpdHMgbGVuZ3RoLlxuICogQHJldHVybiB7bnVtYmVyfSByZWFkIGJpdHMuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucmVhZEJpdHMgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgdmFyIGJpdHNidWYgPSB0aGlzLmJpdHNidWY7XG4gIHZhciBiaXRzYnVmbGVuID0gdGhpcy5iaXRzYnVmbGVuO1xuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgaXAgPSB0aGlzLmlwO1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBhbmQgb3V0cHV0IGJ5dGUuICovXG4gIHZhciBvY3RldDtcblxuICAvLyBub3QgZW5vdWdoIGJ1ZmZlclxuICB3aGlsZSAoYml0c2J1ZmxlbiA8IGxlbmd0aCkge1xuICAgIC8vIGlucHV0IGJ5dGVcbiAgICBpZiAoaXAgPj0gaW5wdXRMZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW5wdXQgYnVmZmVyIGlzIGJyb2tlbicpO1xuICAgIH1cblxuICAgIC8vIGNvbmNhdCBvY3RldFxuICAgIGJpdHNidWYgfD0gaW5wdXRbaXArK10gPDwgYml0c2J1ZmxlbjtcbiAgICBiaXRzYnVmbGVuICs9IDg7XG4gIH1cblxuICAvLyBvdXRwdXQgYnl0ZVxuICBvY3RldCA9IGJpdHNidWYgJiAvKiBNQVNLICovICgoMSA8PCBsZW5ndGgpIC0gMSk7XG4gIGJpdHNidWYgPj4+PSBsZW5ndGg7XG4gIGJpdHNidWZsZW4gLT0gbGVuZ3RoO1xuXG4gIHRoaXMuYml0c2J1ZiA9IGJpdHNidWY7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IGJpdHNidWZsZW47XG4gIHRoaXMuaXAgPSBpcDtcblxuICByZXR1cm4gb2N0ZXQ7XG59O1xuXG4vKipcbiAqIHJlYWQgaHVmZm1hbiBjb2RlIHVzaW5nIHRhYmxlXG4gKiBAcGFyYW0ge0FycmF5fSB0YWJsZSBodWZmbWFuIGNvZGUgdGFibGUuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IGh1ZmZtYW4gY29kZS5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5yZWFkQ29kZUJ5VGFibGUgPSBmdW5jdGlvbih0YWJsZSkge1xuICB2YXIgYml0c2J1ZiA9IHRoaXMuYml0c2J1ZjtcbiAgdmFyIGJpdHNidWZsZW4gPSB0aGlzLmJpdHNidWZsZW47XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBodWZmbWFuIGNvZGUgdGFibGUgKi9cbiAgdmFyIGNvZGVUYWJsZSA9IHRhYmxlWzBdO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG1heENvZGVMZW5ndGggPSB0YWJsZVsxXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvZGUgbGVuZ3RoICYgY29kZSAoMTZiaXQsIDE2Yml0KSAqL1xuICB2YXIgY29kZVdpdGhMZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjb2RlIGJpdHMgbGVuZ3RoICovXG4gIHZhciBjb2RlTGVuZ3RoO1xuXG4gIC8vIG5vdCBlbm91Z2ggYnVmZmVyXG4gIHdoaWxlIChiaXRzYnVmbGVuIDwgbWF4Q29kZUxlbmd0aCkge1xuICAgIGlmIChpcCA+PSBpbnB1dExlbmd0aCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGJpdHNidWYgfD0gaW5wdXRbaXArK10gPDwgYml0c2J1ZmxlbjtcbiAgICBiaXRzYnVmbGVuICs9IDg7XG4gIH1cblxuICAvLyByZWFkIG1heCBsZW5ndGhcbiAgY29kZVdpdGhMZW5ndGggPSBjb2RlVGFibGVbYml0c2J1ZiAmICgoMSA8PCBtYXhDb2RlTGVuZ3RoKSAtIDEpXTtcbiAgY29kZUxlbmd0aCA9IGNvZGVXaXRoTGVuZ3RoID4+PiAxNjtcblxuICB0aGlzLmJpdHNidWYgPSBiaXRzYnVmID4+IGNvZGVMZW5ndGg7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IGJpdHNidWZsZW4gLSBjb2RlTGVuZ3RoO1xuICB0aGlzLmlwID0gaXA7XG5cbiAgcmV0dXJuIGNvZGVXaXRoTGVuZ3RoICYgMHhmZmZmO1xufTtcblxuLyoqXG4gKiBwYXJzZSB1bmNvbXByZXNzZWQgYmxvY2suXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VVbmNvbXByZXNzZWRCbG9jayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgaXAgPSB0aGlzLmlwO1xuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gIHZhciBvcCA9IHRoaXMub3A7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJsb2NrIGxlbmd0aCAqL1xuICB2YXIgbGVuO1xuICAvKiogQHR5cGUge251bWJlcn0gbnVtYmVyIGZvciBjaGVjayBibG9jayBsZW5ndGggKi9cbiAgdmFyIG5sZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBvdXRwdXQgYnVmZmVyIGxlbmd0aCAqL1xuICB2YXIgb2xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjb3B5IGNvdW50ZXIgKi9cbiAgdmFyIHByZUNvcHk7XG5cbiAgLy8gc2tpcCBidWZmZXJlZCBoZWFkZXIgYml0c1xuICB0aGlzLmJpdHNidWYgPSAwO1xuICB0aGlzLmJpdHNidWZsZW4gPSAwO1xuXG4gIC8vIGxlblxuICBpZiAoaXAgKyAxID49IGlucHV0TGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHVuY29tcHJlc3NlZCBibG9jayBoZWFkZXI6IExFTicpO1xuICB9XG4gIGxlbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuXG4gIC8vIG5sZW5cbiAgaWYgKGlwICsgMSA+PSBpbnB1dExlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB1bmNvbXByZXNzZWQgYmxvY2sgaGVhZGVyOiBOTEVOJyk7XG4gIH1cbiAgbmxlbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuXG4gIC8vIGNoZWNrIGxlbiAmIG5sZW5cbiAgaWYgKGxlbiA9PT0gfm5sZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgdW5jb21wcmVzc2VkIGJsb2NrIGhlYWRlcjogbGVuZ3RoIHZlcmlmeScpO1xuICB9XG5cbiAgLy8gY2hlY2sgc2l6ZVxuICBpZiAoaXAgKyBsZW4gPiBpbnB1dC5sZW5ndGgpIHsgdGhyb3cgbmV3IEVycm9yKCdpbnB1dCBidWZmZXIgaXMgYnJva2VuJyk7IH1cblxuICAvLyBleHBhbmQgYnVmZmVyXG4gIHN3aXRjaCAodGhpcy5idWZmZXJUeXBlKSB7XG4gICAgY2FzZSBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZS5CTE9DSzpcbiAgICAgIC8vIHByZSBjb3B5XG4gICAgICB3aGlsZSAob3AgKyBsZW4gPiBvdXRwdXQubGVuZ3RoKSB7XG4gICAgICAgIHByZUNvcHkgPSBvbGVuZ3RoIC0gb3A7XG4gICAgICAgIGxlbiAtPSBwcmVDb3B5O1xuICAgICAgICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICAgICAgICBvdXRwdXQuc2V0KGlucHV0LnN1YmFycmF5KGlwLCBpcCArIHByZUNvcHkpLCBvcCk7XG4gICAgICAgICAgb3AgKz0gcHJlQ29weTtcbiAgICAgICAgICBpcCArPSBwcmVDb3B5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdoaWxlIChwcmVDb3B5LS0pIHtcbiAgICAgICAgICAgIG91dHB1dFtvcCsrXSA9IGlucHV0W2lwKytdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9wID0gb3A7XG4gICAgICAgIG91dHB1dCA9IHRoaXMuZXhwYW5kQnVmZmVyKCk7XG4gICAgICAgIG9wID0gdGhpcy5vcDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUuQURBUFRJVkU6XG4gICAgICB3aGlsZSAob3AgKyBsZW4gPiBvdXRwdXQubGVuZ3RoKSB7XG4gICAgICAgIG91dHB1dCA9IHRoaXMuZXhwYW5kQnVmZmVyKHtmaXhSYXRpbzogMn0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBpbmZsYXRlIG1vZGUnKTtcbiAgfVxuXG4gIC8vIGNvcHlcbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgb3V0cHV0LnNldChpbnB1dC5zdWJhcnJheShpcCwgaXAgKyBsZW4pLCBvcCk7XG4gICAgb3AgKz0gbGVuO1xuICAgIGlwICs9IGxlbjtcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgIG91dHB1dFtvcCsrXSA9IGlucHV0W2lwKytdO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuaXAgPSBpcDtcbiAgdGhpcy5vcCA9IG9wO1xuICB0aGlzLm91dHB1dCA9IG91dHB1dDtcbn07XG5cbi8qKlxuICogcGFyc2UgZml4ZWQgaHVmZm1hbiBibG9jay5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5wYXJzZUZpeGVkSHVmZm1hbkJsb2NrID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZGVjb2RlSHVmZm1hbihcbiAgICBabGliLlJhd0luZmxhdGUuRml4ZWRMaXRlcmFsTGVuZ3RoVGFibGUsXG4gICAgWmxpYi5SYXdJbmZsYXRlLkZpeGVkRGlzdGFuY2VUYWJsZVxuICApO1xufTtcblxuLyoqXG4gKiBwYXJzZSBkeW5hbWljIGh1ZmZtYW4gYmxvY2suXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgb2YgbGl0ZXJhbCBhbmQgbGVuZ3RoIGNvZGVzLiAqL1xuICB2YXIgaGxpdCA9IHRoaXMucmVhZEJpdHMoNSkgKyAyNTc7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgb2YgZGlzdGFuY2UgY29kZXMuICovXG4gIHZhciBoZGlzdCA9IHRoaXMucmVhZEJpdHMoNSkgKyAxO1xuICAvKiogQHR5cGUge251bWJlcn0gbnVtYmVyIG9mIGNvZGUgbGVuZ3Rocy4gKi9cbiAgdmFyIGhjbGVuID0gdGhpcy5yZWFkQml0cyg0KSArIDQ7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gY29kZSBsZW5ndGhzLiAqL1xuICB2YXIgY29kZUxlbmd0aHMgPVxuICAgIG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKFpsaWIuUmF3SW5mbGF0ZS5PcmRlci5sZW5ndGgpO1xuICAvKiogQHR5cGUgeyFBcnJheX0gY29kZSBsZW5ndGhzIHRhYmxlLiAqL1xuICB2YXIgY29kZUxlbmd0aHNUYWJsZTtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBsaXRlcmFsIGFuZCBsZW5ndGggY29kZSBsZW5ndGhzLiAqL1xuICB2YXIgbGl0bGVuTGVuZ3RocztcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBkaXN0YW5jZSBjb2RlIGxlbmd0aHMuICovXG4gIHZhciBkaXN0TGVuZ3RocztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGk7XG5cbiAgLy8gZGVjb2RlIGNvZGUgbGVuZ3Roc1xuICBmb3IgKGkgPSAwOyBpIDwgaGNsZW47ICsraSkge1xuICAgIGNvZGVMZW5ndGhzW1psaWIuUmF3SW5mbGF0ZS5PcmRlcltpXV0gPSB0aGlzLnJlYWRCaXRzKDMpO1xuICB9XG4gIGlmICghVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBmb3IgKGkgPSBoY2xlbiwgaGNsZW4gPSBjb2RlTGVuZ3Rocy5sZW5ndGg7IGkgPCBoY2xlbjsgKytpKSB7XG4gICAgICBjb2RlTGVuZ3Roc1tabGliLlJhd0luZmxhdGUuT3JkZXJbaV1dID0gMDtcbiAgICB9XG4gIH1cbiAgY29kZUxlbmd0aHNUYWJsZSA9IGJ1aWxkSHVmZm1hblRhYmxlKGNvZGVMZW5ndGhzKTtcblxuICAvKipcbiAgICogZGVjb2RlIGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW0gbnVtYmVyIG9mIGxlbmd0aHMuXG4gICAqIEBwYXJhbSB7IUFycmF5fSB0YWJsZSBjb2RlIGxlbmd0aHMgdGFibGUuXG4gICAqIEBwYXJhbSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gbGVuZ3RocyBjb2RlIGxlbmd0aHMgYnVmZmVyLlxuICAgKiBAcmV0dXJuIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBjb2RlIGxlbmd0aHMgYnVmZmVyLlxuICAgKi9cbiAgZnVuY3Rpb24gZGVjb2RlKG51bSwgdGFibGUsIGxlbmd0aHMpIHtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgY29kZTtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgcHJldiA9IHRoaXMucHJldjtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgcmVwZWF0O1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIHZhciBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IG51bTspIHtcbiAgICAgIGNvZGUgPSB0aGlzLnJlYWRDb2RlQnlUYWJsZSh0YWJsZSk7XG4gICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICByZXBlYXQgPSAzICsgdGhpcy5yZWFkQml0cygyKTtcbiAgICAgICAgICB3aGlsZSAocmVwZWF0LS0pIHsgbGVuZ3Roc1tpKytdID0gcHJldjsgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgIHJlcGVhdCA9IDMgKyB0aGlzLnJlYWRCaXRzKDMpO1xuICAgICAgICAgIHdoaWxlIChyZXBlYXQtLSkgeyBsZW5ndGhzW2krK10gPSAwOyB9XG4gICAgICAgICAgcHJldiA9IDA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgcmVwZWF0ID0gMTEgKyB0aGlzLnJlYWRCaXRzKDcpO1xuICAgICAgICAgIHdoaWxlIChyZXBlYXQtLSkgeyBsZW5ndGhzW2krK10gPSAwOyB9XG4gICAgICAgICAgcHJldiA9IDA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbGVuZ3Roc1tpKytdID0gY29kZTtcbiAgICAgICAgICBwcmV2ID0gY29kZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnByZXYgPSBwcmV2O1xuXG4gICAgcmV0dXJuIGxlbmd0aHM7XG4gIH1cblxuICAvLyBsaXRlcmFsIGFuZCBsZW5ndGggY29kZVxuICBsaXRsZW5MZW5ndGhzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoaGxpdCk7XG5cbiAgLy8gZGlzdGFuY2UgY29kZVxuICBkaXN0TGVuZ3RocyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKGhkaXN0KTtcblxuICB0aGlzLnByZXYgPSAwO1xuICB0aGlzLmRlY29kZUh1ZmZtYW4oXG4gICAgYnVpbGRIdWZmbWFuVGFibGUoZGVjb2RlLmNhbGwodGhpcywgaGxpdCwgY29kZUxlbmd0aHNUYWJsZSwgbGl0bGVuTGVuZ3RocykpLFxuICAgIGJ1aWxkSHVmZm1hblRhYmxlKGRlY29kZS5jYWxsKHRoaXMsIGhkaXN0LCBjb2RlTGVuZ3Roc1RhYmxlLCBkaXN0TGVuZ3RocykpXG4gICk7XG59O1xuXG4vKipcbiAqIGRlY29kZSBodWZmbWFuIGNvZGVcbiAqIEBwYXJhbSB7IUFycmF5fSBsaXRsZW4gbGl0ZXJhbCBhbmQgbGVuZ3RoIGNvZGUgdGFibGUuXG4gKiBAcGFyYW0geyFBcnJheX0gZGlzdCBkaXN0aW5hdGlvbiBjb2RlIHRhYmxlLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLmRlY29kZUh1ZmZtYW4gPSBmdW5jdGlvbihsaXRsZW4sIGRpc3QpIHtcbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuICB2YXIgb3AgPSB0aGlzLm9wO1xuXG4gIHRoaXMuY3VycmVudExpdGxlblRhYmxlID0gbGl0bGVuO1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBvdXRwdXQgcG9zaXRpb24gbGltaXQuICovXG4gIHZhciBvbGVuZ3RoID0gb3V0cHV0Lmxlbmd0aCAtIFpsaWIuUmF3SW5mbGF0ZS5NYXhDb3B5TGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlLiAqL1xuICB2YXIgY29kZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHRhYmxlIGluZGV4LiAqL1xuICB2YXIgdGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBodWZmbWFuIGNvZGUgZGlzdGluYXRpb24uICovXG4gIHZhciBjb2RlRGlzdDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZSBsZW5ndGguICovXG4gIHZhciBjb2RlTGVuZ3RoO1xuXG4gIHdoaWxlICgoY29kZSA9IHRoaXMucmVhZENvZGVCeVRhYmxlKGxpdGxlbikpICE9PSAyNTYpIHtcbiAgICAvLyBsaXRlcmFsXG4gICAgaWYgKGNvZGUgPCAyNTYpIHtcbiAgICAgIGlmIChvcCA+PSBvbGVuZ3RoKSB7XG4gICAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgICAgb3AgPSB0aGlzLm9wO1xuICAgICAgfVxuICAgICAgb3V0cHV0W29wKytdID0gY29kZTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGVuZ3RoIGNvZGVcbiAgICB0aSA9IGNvZGUgLSAyNTc7XG4gICAgY29kZUxlbmd0aCA9IFpsaWIuUmF3SW5mbGF0ZS5MZW5ndGhDb2RlVGFibGVbdGldO1xuICAgIGlmIChabGliLlJhd0luZmxhdGUuTGVuZ3RoRXh0cmFUYWJsZVt0aV0gPiAwKSB7XG4gICAgICBjb2RlTGVuZ3RoICs9IHRoaXMucmVhZEJpdHMoWmxpYi5SYXdJbmZsYXRlLkxlbmd0aEV4dHJhVGFibGVbdGldKTtcbiAgICB9XG5cbiAgICAvLyBkaXN0IGNvZGVcbiAgICBjb2RlID0gdGhpcy5yZWFkQ29kZUJ5VGFibGUoZGlzdCk7XG4gICAgY29kZURpc3QgPSBabGliLlJhd0luZmxhdGUuRGlzdENvZGVUYWJsZVtjb2RlXTtcbiAgICBpZiAoWmxpYi5SYXdJbmZsYXRlLkRpc3RFeHRyYVRhYmxlW2NvZGVdID4gMCkge1xuICAgICAgY29kZURpc3QgKz0gdGhpcy5yZWFkQml0cyhabGliLlJhd0luZmxhdGUuRGlzdEV4dHJhVGFibGVbY29kZV0pO1xuICAgIH1cblxuICAgIC8vIGx6NzcgZGVjb2RlXG4gICAgaWYgKG9wID49IG9sZW5ndGgpIHtcbiAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgIG91dHB1dCA9IHRoaXMuZXhwYW5kQnVmZmVyKCk7XG4gICAgICBvcCA9IHRoaXMub3A7XG4gICAgfVxuICAgIHdoaWxlIChjb2RlTGVuZ3RoLS0pIHtcbiAgICAgIG91dHB1dFtvcF0gPSBvdXRwdXRbKG9wKyspIC0gY29kZURpc3RdO1xuICAgIH1cbiAgfVxuXG4gIHdoaWxlICh0aGlzLmJpdHNidWZsZW4gPj0gOCkge1xuICAgIHRoaXMuYml0c2J1ZmxlbiAtPSA4O1xuICAgIHRoaXMuaXAtLTtcbiAgfVxuICB0aGlzLm9wID0gb3A7XG59O1xuXG4vKipcbiAqIGRlY29kZSBodWZmbWFuIGNvZGUgKGFkYXB0aXZlKVxuICogQHBhcmFtIHshQXJyYXl9IGxpdGxlbiBsaXRlcmFsIGFuZCBsZW5ndGggY29kZSB0YWJsZS5cbiAqIEBwYXJhbSB7IUFycmF5fSBkaXN0IGRpc3RpbmF0aW9uIGNvZGUgdGFibGUuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb2RlSHVmZm1hbkFkYXB0aXZlID0gZnVuY3Rpb24obGl0bGVuLCBkaXN0KSB7XG4gIHZhciBvdXRwdXQgPSB0aGlzLm91dHB1dDtcbiAgdmFyIG9wID0gdGhpcy5vcDtcblxuICB0aGlzLmN1cnJlbnRMaXRsZW5UYWJsZSA9IGxpdGxlbjtcblxuICAvKiogQHR5cGUge251bWJlcn0gb3V0cHV0IHBvc2l0aW9uIGxpbWl0LiAqL1xuICB2YXIgb2xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBodWZmbWFuIGNvZGUuICovXG4gIHZhciBjb2RlO1xuICAvKiogQHR5cGUge251bWJlcn0gdGFibGUgaW5kZXguICovXG4gIHZhciB0aTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZSBkaXN0aW5hdGlvbi4gKi9cbiAgdmFyIGNvZGVEaXN0O1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlIGxlbmd0aC4gKi9cbiAgdmFyIGNvZGVMZW5ndGg7XG5cbiAgd2hpbGUgKChjb2RlID0gdGhpcy5yZWFkQ29kZUJ5VGFibGUobGl0bGVuKSkgIT09IDI1Nikge1xuICAgIC8vIGxpdGVyYWxcbiAgICBpZiAoY29kZSA8IDI1Nikge1xuICAgICAgaWYgKG9wID49IG9sZW5ndGgpIHtcbiAgICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgICAgb2xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG4gICAgICB9XG4gICAgICBvdXRwdXRbb3ArK10gPSBjb2RlO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsZW5ndGggY29kZVxuICAgIHRpID0gY29kZSAtIDI1NztcbiAgICBjb2RlTGVuZ3RoID0gWmxpYi5SYXdJbmZsYXRlLkxlbmd0aENvZGVUYWJsZVt0aV07XG4gICAgaWYgKFpsaWIuUmF3SW5mbGF0ZS5MZW5ndGhFeHRyYVRhYmxlW3RpXSA+IDApIHtcbiAgICAgIGNvZGVMZW5ndGggKz0gdGhpcy5yZWFkQml0cyhabGliLlJhd0luZmxhdGUuTGVuZ3RoRXh0cmFUYWJsZVt0aV0pO1xuICAgIH1cblxuICAgIC8vIGRpc3QgY29kZVxuICAgIGNvZGUgPSB0aGlzLnJlYWRDb2RlQnlUYWJsZShkaXN0KTtcbiAgICBjb2RlRGlzdCA9IFpsaWIuUmF3SW5mbGF0ZS5EaXN0Q29kZVRhYmxlW2NvZGVdO1xuICAgIGlmIChabGliLlJhd0luZmxhdGUuRGlzdEV4dHJhVGFibGVbY29kZV0gPiAwKSB7XG4gICAgICBjb2RlRGlzdCArPSB0aGlzLnJlYWRCaXRzKFpsaWIuUmF3SW5mbGF0ZS5EaXN0RXh0cmFUYWJsZVtjb2RlXSk7XG4gICAgfVxuXG4gICAgLy8gbHo3NyBkZWNvZGVcbiAgICBpZiAob3AgKyBjb2RlTGVuZ3RoID4gb2xlbmd0aCkge1xuICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgIG9sZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuICAgIH1cbiAgICB3aGlsZSAoY29kZUxlbmd0aC0tKSB7XG4gICAgICBvdXRwdXRbb3BdID0gb3V0cHV0WyhvcCsrKSAtIGNvZGVEaXN0XTtcbiAgICB9XG4gIH1cblxuICB3aGlsZSAodGhpcy5iaXRzYnVmbGVuID49IDgpIHtcbiAgICB0aGlzLmJpdHNidWZsZW4gLT0gODtcbiAgICB0aGlzLmlwLS07XG4gIH1cbiAgdGhpcy5vcCA9IG9wO1xufTtcblxuLyoqXG4gKiBleHBhbmQgb3V0cHV0IGJ1ZmZlci5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5leHBhbmRCdWZmZXIgPSBmdW5jdGlvbihvcHRfcGFyYW0pIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBzdG9yZSBidWZmZXIuICovXG4gIHZhciBidWZmZXIgPVxuICAgIG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKFxuICAgICAgICB0aGlzLm9wIC0gWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoXG4gICAgKTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJhY2t3YXJkIGJhc2UgcG9pbnQgKi9cbiAgdmFyIGJhY2t3YXJkID0gdGhpcy5vcCAtIFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvcHkgaW5kZXguICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gY29weSBsaW1pdCAqL1xuICB2YXIgaWw7XG5cbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuXG4gIC8vIGNvcHkgdG8gb3V0cHV0IGJ1ZmZlclxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBidWZmZXIuc2V0KG91dHB1dC5zdWJhcnJheShabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGgsIGJ1ZmZlci5sZW5ndGgpKTtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKGkgPSAwLCBpbCA9IGJ1ZmZlci5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICBidWZmZXJbaV0gPSBvdXRwdXRbaSArIFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aF07XG4gICAgfVxuICB9XG5cbiAgdGhpcy5ibG9ja3MucHVzaChidWZmZXIpO1xuICB0aGlzLnRvdGFscG9zICs9IGJ1ZmZlci5sZW5ndGg7XG5cbiAgLy8gY29weSB0byBiYWNrd2FyZCBidWZmZXJcbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgb3V0cHV0LnNldChcbiAgICAgIG91dHB1dC5zdWJhcnJheShiYWNrd2FyZCwgYmFja3dhcmQgKyBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGgpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoOyArK2kpIHtcbiAgICAgIG91dHB1dFtpXSA9IG91dHB1dFtiYWNrd2FyZCArIGldO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMub3AgPSBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGg7XG5cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogZXhwYW5kIG91dHB1dCBidWZmZXIuIChhZGFwdGl2ZSlcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlciBwb2ludGVyLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLmV4cGFuZEJ1ZmZlckFkYXB0aXZlID0gZnVuY3Rpb24ob3B0X3BhcmFtKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gc3RvcmUgYnVmZmVyLiAqL1xuICB2YXIgYnVmZmVyO1xuICAvKiogQHR5cGUge251bWJlcn0gZXhwYW50aW9uIHJhdGlvLiAqL1xuICB2YXIgcmF0aW8gPSAodGhpcy5pbnB1dC5sZW5ndGggLyB0aGlzLmlwICsgMSkgfCAwO1xuICAvKiogQHR5cGUge251bWJlcn0gbWF4aW11bSBudW1iZXIgb2YgaHVmZm1hbiBjb2RlLiAqL1xuICB2YXIgbWF4SHVmZkNvZGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBuZXcgb3V0cHV0IGJ1ZmZlciBzaXplLiAqL1xuICB2YXIgbmV3U2l6ZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG1heCBpbmZsYXRlIHNpemUuICovXG4gIHZhciBtYXhJbmZsYXRlU2l6ZTtcblxuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG5cbiAgaWYgKG9wdF9wYXJhbSkge1xuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtLmZpeFJhdGlvID09PSAnbnVtYmVyJykge1xuICAgICAgcmF0aW8gPSBvcHRfcGFyYW0uZml4UmF0aW87XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtLmFkZFJhdGlvID09PSAnbnVtYmVyJykge1xuICAgICAgcmF0aW8gKz0gb3B0X3BhcmFtLmFkZFJhdGlvO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNhbGN1bGF0ZSBuZXcgYnVmZmVyIHNpemVcbiAgaWYgKHJhdGlvIDwgMikge1xuICAgIG1heEh1ZmZDb2RlID1cbiAgICAgIChpbnB1dC5sZW5ndGggLSB0aGlzLmlwKSAvIHRoaXMuY3VycmVudExpdGxlblRhYmxlWzJdO1xuICAgIG1heEluZmxhdGVTaXplID0gKG1heEh1ZmZDb2RlIC8gMiAqIDI1OCkgfCAwO1xuICAgIG5ld1NpemUgPSBtYXhJbmZsYXRlU2l6ZSA8IG91dHB1dC5sZW5ndGggP1xuICAgICAgb3V0cHV0Lmxlbmd0aCArIG1heEluZmxhdGVTaXplIDpcbiAgICAgIG91dHB1dC5sZW5ndGggPDwgMTtcbiAgfSBlbHNlIHtcbiAgICBuZXdTaXplID0gb3V0cHV0Lmxlbmd0aCAqIHJhdGlvO1xuICB9XG5cbiAgLy8gYnVmZmVyIGV4cGFudGlvblxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShuZXdTaXplKTtcbiAgICBidWZmZXIuc2V0KG91dHB1dCk7XG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyID0gb3V0cHV0O1xuICB9XG5cbiAgdGhpcy5vdXRwdXQgPSBidWZmZXI7XG5cbiAgcmV0dXJuIHRoaXMub3V0cHV0O1xufTtcblxuLyoqXG4gKiBjb25jYXQgb3V0cHV0IGJ1ZmZlci5cbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuY29uY2F0QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBidWZmZXIgcG9pbnRlci4gKi9cbiAgdmFyIHBvcyA9IDA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBidWZmZXIgcG9pbnRlci4gKi9cbiAgdmFyIGxpbWl0ID0gdGhpcy50b3RhbHBvcyArICh0aGlzLm9wIC0gWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoKTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYmxvY2sgYXJyYXkuICovXG4gIHZhciBvdXRwdXQgPSB0aGlzLm91dHB1dDtcbiAgLyoqIEB0eXBlIHshQXJyYXl9IGJsb2NrcyBhcnJheS4gKi9cbiAgdmFyIGJsb2NrcyA9IHRoaXMuYmxvY2tzO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBibG9jayBhcnJheS4gKi9cbiAgdmFyIGJsb2NrO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuICovXG4gIHZhciBidWZmZXIgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShsaW1pdCk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBsaW1pdGVyLiAqL1xuICB2YXIgaWw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBqO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBsaW1pdGVyLiAqL1xuICB2YXIgamw7XG5cbiAgLy8gc2luZ2xlIGJ1ZmZlclxuICBpZiAoYmxvY2tzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBVU0VfVFlQRURBUlJBWSA/XG4gICAgICB0aGlzLm91dHB1dC5zdWJhcnJheShabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGgsIHRoaXMub3ApIDpcbiAgICAgIHRoaXMub3V0cHV0LnNsaWNlKFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aCwgdGhpcy5vcCk7XG4gIH1cblxuICAvLyBjb3B5IHRvIGJ1ZmZlclxuICBmb3IgKGkgPSAwLCBpbCA9IGJsb2Nrcy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgYmxvY2sgPSBibG9ja3NbaV07XG4gICAgZm9yIChqID0gMCwgamwgPSBibG9jay5sZW5ndGg7IGogPCBqbDsgKytqKSB7XG4gICAgICBidWZmZXJbcG9zKytdID0gYmxvY2tbal07XG4gICAgfVxuICB9XG5cbiAgLy8gY3VycmVudCBidWZmZXJcbiAgZm9yIChpID0gWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoLCBpbCA9IHRoaXMub3A7IGkgPCBpbDsgKytpKSB7XG4gICAgYnVmZmVyW3BvcysrXSA9IG91dHB1dFtpXTtcbiAgfVxuXG4gIHRoaXMuYmxvY2tzID0gW107XG4gIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuXG4gIHJldHVybiB0aGlzLmJ1ZmZlcjtcbn07XG5cbi8qKlxuICogY29uY2F0IG91dHB1dCBidWZmZXIuIChkeW5hbWljKVxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5jb25jYXRCdWZmZXJEeW5hbWljID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7QXJyYXkuPG51bWJlcj58VWludDhBcnJheX0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdmFyIGJ1ZmZlcjtcbiAgdmFyIG9wID0gdGhpcy5vcDtcblxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBpZiAodGhpcy5yZXNpemUpIHtcbiAgICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG9wKTtcbiAgICAgIGJ1ZmZlci5zZXQodGhpcy5vdXRwdXQuc3ViYXJyYXkoMCwgb3ApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmZmVyID0gdGhpcy5vdXRwdXQuc3ViYXJyYXkoMCwgb3ApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAodGhpcy5vdXRwdXQubGVuZ3RoID4gb3ApIHtcbiAgICAgIHRoaXMub3V0cHV0Lmxlbmd0aCA9IG9wO1xuICAgIH1cbiAgICBidWZmZXIgPSB0aGlzLm91dHB1dDtcbiAgfVxuXG4gIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuXG4gIHJldHVybiB0aGlzLmJ1ZmZlcjtcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBHWklQIChSRkMxOTUyKSDlsZXplovjgrPjg7Pjg4bjg4rlrp/oo4UuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5HdW56aXAnKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkNSQzMyJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuR3ppcCcpO1xuZ29vZy5yZXF1aXJlKCdabGliLlJhd0luZmxhdGUnKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5HdW56aXBNZW1iZXInKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICovXG5abGliLkd1bnppcCA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5wdXQgYnVmZmVyLiAqL1xuICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy5pcCA9IDA7XG4gIC8qKiBAdHlwZSB7QXJyYXkuPFpsaWIuR3VuemlwTWVtYmVyPn0gKi9cbiAgdGhpcy5tZW1iZXIgPSBbXTtcbiAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICB0aGlzLmRlY29tcHJlc3NlZCA9IGZhbHNlO1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHtBcnJheS48WmxpYi5HdW56aXBNZW1iZXI+fVxuICovXG5abGliLkd1bnppcC5wcm90b3R5cGUuZ2V0TWVtYmVycyA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXRoaXMuZGVjb21wcmVzc2VkKSB7XG4gICAgdGhpcy5kZWNvbXByZXNzKCk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5tZW1iZXIuc2xpY2UoKTtcbn07XG5cbi8qKlxuICogaW5mbGF0ZSBnemlwIGRhdGEuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbmZsYXRlZCBidWZmZXIuXG4gKi9cblpsaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvbXByZXNzID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBsZW5ndGguICovXG4gIHZhciBpbCA9IHRoaXMuaW5wdXQubGVuZ3RoO1xuXG4gIHdoaWxlICh0aGlzLmlwIDwgaWwpIHtcbiAgICB0aGlzLmRlY29kZU1lbWJlcigpO1xuICB9XG5cbiAgdGhpcy5kZWNvbXByZXNzZWQgPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzLmNvbmNhdE1lbWJlcigpO1xufTtcblxuLyoqXG4gKiBkZWNvZGUgZ3ppcCBtZW1iZXIuXG4gKi9cblpsaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvZGVNZW1iZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtabGliLkd1bnppcE1lbWJlcn0gKi9cbiAgdmFyIG1lbWJlciA9IG5ldyBabGliLkd1bnppcE1lbWJlcigpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlzaXplO1xuICAvKiogQHR5cGUge1psaWIuUmF3SW5mbGF0ZX0gUmF3SW5mbGF0ZSBpbXBsZW1lbnRhdGlvbi4gKi9cbiAgdmFyIHJhd2luZmxhdGU7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5mbGF0ZWQgZGF0YS4gKi9cbiAgdmFyIGluZmxhdGVkO1xuICAvKiogQHR5cGUge251bWJlcn0gaW5mbGF0ZSBzaXplICovXG4gIHZhciBpbmZsZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjaGFyYWN0ZXIgY29kZSAqL1xuICB2YXIgYztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNoYXJhY3RlciBpbmRleCBpbiBzdHJpbmcuICovXG4gIHZhciBjaTtcbiAgLyoqIEB0eXBlIHtBcnJheS48c3RyaW5nPn0gY2hhcmFjdGVyIGFycmF5LiAqL1xuICB2YXIgc3RyO1xuICAvKiogQHR5cGUge251bWJlcn0gbW9kaWZpY2F0aW9uIHRpbWUuICovXG4gIHZhciBtdGltZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBjcmMzMjtcblxuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgaXAgPSB0aGlzLmlwO1xuXG4gIG1lbWJlci5pZDEgPSBpbnB1dFtpcCsrXTtcbiAgbWVtYmVyLmlkMiA9IGlucHV0W2lwKytdO1xuXG4gIC8vIGNoZWNrIHNpZ25hdHVyZVxuICBpZiAobWVtYmVyLmlkMSAhPT0gMHgxZiB8fCBtZW1iZXIuaWQyICE9PSAweDhiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpbGUgc2lnbmF0dXJlOicgKyBtZW1iZXIuaWQxICsgJywnICsgbWVtYmVyLmlkMik7XG4gIH1cblxuICAvLyBjaGVjayBjb21wcmVzc2lvbiBtZXRob2RcbiAgbWVtYmVyLmNtID0gaW5wdXRbaXArK107XG4gIHN3aXRjaCAobWVtYmVyLmNtKSB7XG4gICAgY2FzZSA4OiAvKiBYWFg6IHVzZSBabGliIGNvbnN0ICovXG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIGNvbXByZXNzaW9uIG1ldGhvZDogJyArIG1lbWJlci5jbSk7XG4gIH1cblxuICAvLyBmbGFnc1xuICBtZW1iZXIuZmxnID0gaW5wdXRbaXArK107XG5cbiAgLy8gbW9kaWZpY2F0aW9uIHRpbWVcbiAgbXRpbWUgPSAoaW5wdXRbaXArK10pICAgICAgIHxcbiAgICAgICAgICAoaW5wdXRbaXArK10gPDwgOCkgIHxcbiAgICAgICAgICAoaW5wdXRbaXArK10gPDwgMTYpIHxcbiAgICAgICAgICAoaW5wdXRbaXArK10gPDwgMjQpO1xuICBtZW1iZXIubXRpbWUgPSBuZXcgRGF0ZShtdGltZSAqIDEwMDApO1xuXG4gIC8vIGV4dHJhIGZsYWdzXG4gIG1lbWJlci54ZmwgPSBpbnB1dFtpcCsrXTtcblxuICAvLyBvcGVyYXRpbmcgc3lzdGVtXG4gIG1lbWJlci5vcyA9IGlucHV0W2lwKytdO1xuXG4gIC8vIGV4dHJhXG4gIGlmICgobWVtYmVyLmZsZyAmIFpsaWIuR3ppcC5GbGFnc01hc2suRkVYVFJBKSA+IDApIHtcbiAgICBtZW1iZXIueGxlbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuICAgIGlwID0gdGhpcy5kZWNvZGVTdWJGaWVsZChpcCwgbWVtYmVyLnhsZW4pO1xuICB9XG5cbiAgLy8gZm5hbWVcbiAgaWYgKChtZW1iZXIuZmxnICYgWmxpYi5HemlwLkZsYWdzTWFzay5GTkFNRSkgPiAwKSB7XG4gICAgZm9yKHN0ciA9IFtdLCBjaSA9IDA7IChjID0gaW5wdXRbaXArK10pID4gMDspIHtcbiAgICAgIHN0cltjaSsrXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgfVxuICAgIG1lbWJlci5uYW1lID0gc3RyLmpvaW4oJycpO1xuICB9XG5cbiAgLy8gZmNvbW1lbnRcbiAgaWYgKChtZW1iZXIuZmxnICYgWmxpYi5HemlwLkZsYWdzTWFzay5GQ09NTUVOVCkgPiAwKSB7XG4gICAgZm9yKHN0ciA9IFtdLCBjaSA9IDA7IChjID0gaW5wdXRbaXArK10pID4gMDspIHtcbiAgICAgIHN0cltjaSsrXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgfVxuICAgIG1lbWJlci5jb21tZW50ID0gc3RyLmpvaW4oJycpO1xuICB9XG5cbiAgLy8gZmhjcmNcbiAgaWYgKChtZW1iZXIuZmxnICYgWmxpYi5HemlwLkZsYWdzTWFzay5GSENSQykgPiAwKSB7XG4gICAgbWVtYmVyLmNyYzE2ID0gWmxpYi5DUkMzMi5jYWxjKGlucHV0LCAwLCBpcCkgJiAweGZmZmY7XG4gICAgaWYgKG1lbWJlci5jcmMxNiAhPT0gKGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGhlYWRlciBjcmMxNicpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlzaXplIOOCkuS6i+WJjeOBq+WPluW+l+OBmeOCi+OBqOWxlemWi+W+jOOBruOCteOCpOOCuuOBjOWIhuOBi+OCi+OBn+OCgeOAgVxuICAvLyBpbmZsYXRl5Yem55CG44Gu44OQ44OD44OV44Kh44K144Kk44K644GM5LqL5YmN44Gr5YiG44GL44KK44CB6auY6YCf44Gr44Gq44KLXG4gIGlzaXplID0gKGlucHV0W2lucHV0Lmxlbmd0aCAtIDRdKSAgICAgICB8IChpbnB1dFtpbnB1dC5sZW5ndGggLSAzXSA8PCA4KSB8XG4gICAgICAgICAgKGlucHV0W2lucHV0Lmxlbmd0aCAtIDJdIDw8IDE2KSB8IChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA8PCAyNCk7XG5cbiAgLy8gaXNpemUg44Gu5aal5b2T5oCn44OB44Kn44OD44KvXG4gIC8vIOODj+ODleODnuODs+espuWPt+OBp+OBr+acgOWwjyAyLWJpdCDjga7jgZ/jgoHjgIHmnIDlpKfjgacgMS80IOOBq+OBquOCi1xuICAvLyBMWjc3IOespuWPt+OBp+OBryDplbfjgZXjgajot53pm6IgMi1CeXRlIOOBp+acgOWkpyAyNTgtQnl0ZSDjgpLooajnj77jgafjgY3jgovjgZ/jgoHjgIFcbiAgLy8gMS8xMjgg44Gr44Gq44KL44Go44GZ44KLXG4gIC8vIOOBk+OBk+OBi+OCieWFpeWKm+ODkOODg+ODleOCoeOBruaui+OCiuOBjCBpc2l6ZSDjga4gNTEyIOWAjeS7peS4iuOBoOOBo+OBn+OCiVxuICAvLyDjgrXjgqTjgrrmjIflrprjga7jg5Djg4Pjg5XjgqHnorrkv53jga/ooYzjgo/jgarjgYTkuovjgajjgZnjgotcbiAgaWYgKGlucHV0Lmxlbmd0aCAtIGlwIC0gLyogQ1JDLTMyICovNCAtIC8qIElTSVpFICovNCA8IGlzaXplICogNTEyKSB7XG4gICAgaW5mbGVuID0gaXNpemU7XG4gIH1cblxuICAvLyBjb21wcmVzc2VkIGJsb2NrXG4gIHJhd2luZmxhdGUgPSBuZXcgWmxpYi5SYXdJbmZsYXRlKGlucHV0LCB7J2luZGV4JzogaXAsICdidWZmZXJTaXplJzogaW5mbGVufSk7XG4gIG1lbWJlci5kYXRhID0gaW5mbGF0ZWQgPSByYXdpbmZsYXRlLmRlY29tcHJlc3MoKTtcbiAgaXAgPSByYXdpbmZsYXRlLmlwO1xuXG4gIC8vIGNyYzMyXG4gIG1lbWJlci5jcmMzMiA9IGNyYzMyID1cbiAgICAoKGlucHV0W2lwKytdKSAgICAgICB8IChpbnB1dFtpcCsrXSA8PCA4KSB8XG4gICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpKSA+Pj4gMDtcbiAgaWYgKFpsaWIuQ1JDMzIuY2FsYyhpbmZsYXRlZCkgIT09IGNyYzMyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIENSQy0zMiBjaGVja3N1bTogMHgnICtcbiAgICAgICAgWmxpYi5DUkMzMi5jYWxjKGluZmxhdGVkKS50b1N0cmluZygxNikgKyAnIC8gMHgnICsgY3JjMzIudG9TdHJpbmcoMTYpKTtcbiAgfVxuXG4gIC8vIGlucHV0IHNpemVcbiAgbWVtYmVyLmlzaXplID0gaXNpemUgPVxuICAgICgoaW5wdXRbaXArK10pICAgICAgIHwgKGlucHV0W2lwKytdIDw8IDgpIHxcbiAgICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNCkpID4+PiAwO1xuICBpZiAoKGluZmxhdGVkLmxlbmd0aCAmIDB4ZmZmZmZmZmYpICE9PSBpc2l6ZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBpbnB1dCBzaXplOiAnICtcbiAgICAgICAgKGluZmxhdGVkLmxlbmd0aCAmIDB4ZmZmZmZmZmYpICsgJyAvICcgKyBpc2l6ZSk7XG4gIH1cblxuICB0aGlzLm1lbWJlci5wdXNoKG1lbWJlcik7XG4gIHRoaXMuaXAgPSBpcDtcbn07XG5cbi8qKlxuICog44K144OW44OV44Kj44O844Or44OJ44Gu44OH44Kz44O844OJXG4gKiBYWFg6IOePvuWcqOOBr+S9leOCguOBm+OBmuOCueOCreODg+ODl+OBmeOCi1xuICovXG5abGliLkd1bnppcC5wcm90b3R5cGUuZGVjb2RlU3ViRmllbGQgPSBmdW5jdGlvbihpcCwgbGVuZ3RoKSB7XG4gIHJldHVybiBpcCArIGxlbmd0aDtcbn07XG5cbi8qKlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX1cbiAqL1xuWmxpYi5HdW56aXAucHJvdG90eXBlLmNvbmNhdE1lbWJlciA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge0FycmF5LjxabGliLkd1bnppcE1lbWJlcj59ICovXG4gIHZhciBtZW1iZXIgPSB0aGlzLm1lbWJlcjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlsO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHAgPSAwO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHNpemUgPSAwO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBidWZmZXI7XG5cbiAgZm9yIChpID0gMCwgaWwgPSBtZW1iZXIubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgIHNpemUgKz0gbWVtYmVyW2ldLmRhdGEubGVuZ3RoO1xuICB9XG5cbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSk7XG4gICAgZm9yIChpID0gMDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGJ1ZmZlci5zZXQobWVtYmVyW2ldLmRhdGEsIHApO1xuICAgICAgcCArPSBtZW1iZXJbaV0uZGF0YS5sZW5ndGg7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGJ1ZmZlciA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBpbDsgKytpKSB7XG4gICAgICBidWZmZXJbaV0gPSBtZW1iZXJbaV0uZGF0YTtcbiAgICB9XG4gICAgYnVmZmVyID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgYnVmZmVyKTtcbiAgfVxuXG4gIHJldHVybiBidWZmZXI7XG59O1xuXG59KTtcbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsImdvb2cucHJvdmlkZSgnWmxpYi5SYXdJbmZsYXRlU3RyZWFtJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5IdWZmbWFuJyk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIEBkZWZpbmUge251bWJlcn0gYnVmZmVyIGJsb2NrIHNpemUuICovXG52YXIgWkxJQl9TVFJFQU1fUkFXX0lORkxBVEVfQlVGRkVSX1NJWkUgPSAweDgwMDA7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxudmFyIGJ1aWxkSHVmZm1hblRhYmxlID0gWmxpYi5IdWZmbWFuLmJ1aWxkSHVmZm1hblRhYmxlO1xuXG4vKipcbiAqIEBwYXJhbSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxuICogQHBhcmFtIHtudW1iZXJ9IGlwIGlucHV0IGJ1ZmZlciBwb2ludGVyLlxuICogQHBhcmFtIHtudW1iZXI9fSBvcHRfYnVmZmVyc2l6ZSBidWZmZXIgYmxvY2sgc2l6ZS5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0gPSBmdW5jdGlvbihpbnB1dCwgaXAsIG9wdF9idWZmZXJzaXplKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyICovXG4gIHRoaXMuYnVmZmVyO1xuICAvKiogQHR5cGUgeyFBcnJheS48KEFycmF5fFVpbnQ4QXJyYXkpPn0gKi9cbiAgdGhpcy5ibG9ja3MgPSBbXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJsb2NrIHNpemUuICovXG4gIHRoaXMuYnVmZmVyU2l6ZSA9XG4gICAgb3B0X2J1ZmZlcnNpemUgPyBvcHRfYnVmZmVyc2l6ZSA6IFpMSUJfU1RSRUFNX1JBV19JTkZMQVRFX0JVRkZFUl9TSVpFO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IHRvdGFsIG91dHB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy50b3RhbHBvcyA9IDA7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gaW5wdXQgYnVmZmVyIHBvaW50ZXIuICovXG4gIHRoaXMuaXAgPSBpcCA9PT0gdm9pZCAwID8gMCA6IGlwO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IGJpdCBzdHJlYW0gcmVhZGVyIGJ1ZmZlci4gKi9cbiAgdGhpcy5iaXRzYnVmID0gMDtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSBiaXQgc3RyZWFtIHJlYWRlciBidWZmZXIgc2l6ZS4gKi9cbiAgdGhpcy5iaXRzYnVmbGVuID0gMDtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBpbnB1dCBidWZmZXIuICovXG4gIHRoaXMuaW5wdXQgPSBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50OEFycmF5KGlucHV0KSA6IGlucHV0O1xuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheSl9IG91dHB1dCBidWZmZXIuICovXG4gIHRoaXMub3V0cHV0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkodGhpcy5idWZmZXJTaXplKTtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSBvdXRwdXQgYnVmZmVyIHBvaW50ZXIuICovXG4gIHRoaXMub3AgPSAwO1xuICAvKiogQHR5cGUge2Jvb2xlYW59IGlzIGZpbmFsIGJsb2NrIGZsYWcuICovXG4gIHRoaXMuYmZpbmFsID0gZmFsc2U7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSB1bmNvbXByZXNzZWQgYmxvY2sgbGVuZ3RoLiAqL1xuICB0aGlzLmJsb2NrTGVuZ3RoO1xuICAvKiogQHR5cGUge2Jvb2xlYW59IHJlc2l6ZSBmbGFnIGZvciBtZW1vcnkgc2l6ZSBvcHRpbWl6YXRpb24uICovXG4gIHRoaXMucmVzaXplID0gZmFsc2U7XG4gIC8qKiBAdHlwZSB7QXJyYXl9ICovXG4gIHRoaXMubGl0bGVuVGFibGU7XG4gIC8qKiBAdHlwZSB7QXJyYXl9ICovXG4gIHRoaXMuZGlzdFRhYmxlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5zcCA9IDA7IC8vIHN0cmVhbSBwb2ludGVyXG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1c30gKi9cbiAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLklOSVRJQUxJWkVEO1xuICAvKiogQHR5cGUge251bWJlcn0gcHJldmlvdXMgUkxFIHZhbHVlICovXG4gIHRoaXMucHJldjtcblxuICAvL1xuICAvLyBiYWNrdXBcbiAgLy9cbiAgLyoqIEB0eXBlIHshbnVtYmVyfSAqL1xuICB0aGlzLmlwXztcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSAqL1xuICB0aGlzLmJpdHNidWZsZW5fO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9ICovXG4gIHRoaXMuYml0c2J1Zl87XG59O1xuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUgPSB7XG4gIFVOQ09NUFJFU1NFRDogMCxcbiAgRklYRUQ6IDEsXG4gIERZTkFNSUM6IDJcbn07XG5cbi8qKlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cyA9IHtcbiAgSU5JVElBTElaRUQ6IDAsXG4gIEJMT0NLX0hFQURFUl9TVEFSVDogMSxcbiAgQkxPQ0tfSEVBREVSX0VORDogMixcbiAgQkxPQ0tfQk9EWV9TVEFSVDogMyxcbiAgQkxPQ0tfQk9EWV9FTkQ6IDQsXG4gIERFQ09ERV9CTE9DS19TVEFSVDogNSxcbiAgREVDT0RFX0JMT0NLX0VORDogNlxufTtcblxuLyoqXG4gKiBkZWNvbXByZXNzLlxuICogQHJldHVybiB7IShVaW50OEFycmF5fEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3MgPSBmdW5jdGlvbihuZXdJbnB1dCwgaXApIHtcbiAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICB2YXIgc3RvcCA9IGZhbHNlO1xuXG4gIGlmIChuZXdJbnB1dCAhPT0gdm9pZCAwKSB7XG4gICAgdGhpcy5pbnB1dCA9IG5ld0lucHV0O1xuICB9XG5cbiAgaWYgKGlwICE9PSB2b2lkIDApIHtcbiAgICB0aGlzLmlwID0gaXA7XG4gIH1cblxuICAvLyBkZWNvbXByZXNzXG4gIHdoaWxlICghc3RvcCkge1xuICAgIHN3aXRjaCAodGhpcy5zdGF0dXMpIHtcbiAgICAgIC8vIGJsb2NrIGhlYWRlclxuICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLklOSVRJQUxJWkVEOlxuICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkJMT0NLX0hFQURFUl9TVEFSVDpcbiAgICAgICAgaWYgKHRoaXMucmVhZEJsb2NrSGVhZGVyKCkgPCAwKSB7XG4gICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBibG9jayBib2R5XG4gICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfSEVBREVSX0VORDogLyogRkFMTFRIUk9VR0ggKi9cbiAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX1NUQVJUOlxuICAgICAgICBzd2l0Y2godGhpcy5jdXJyZW50QmxvY2tUeXBlKSB7XG4gICAgICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uQmxvY2tUeXBlLlVOQ09NUFJFU1NFRDpcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWRVbmNvbXByZXNzZWRCbG9ja0hlYWRlcigpIDwgMCkge1xuICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5GSVhFRDpcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcnNlRml4ZWRIdWZmbWFuQmxvY2soKSA8IDApIHtcbiAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuRFlOQU1JQzpcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcnNlRHluYW1pY0h1ZmZtYW5CbG9jaygpIDwgMCkge1xuICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gZGVjb2RlIGRhdGFcbiAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX0VORDpcbiAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5ERUNPREVfQkxPQ0tfU1RBUlQ6XG4gICAgICAgIHN3aXRjaCh0aGlzLmN1cnJlbnRCbG9ja1R5cGUpIHtcbiAgICAgICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuVU5DT01QUkVTU0VEOlxuICAgICAgICAgICAgaWYgKHRoaXMucGFyc2VVbmNvbXByZXNzZWRCbG9jaygpIDwgMCkge1xuICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5GSVhFRDogLyogRkFMTFRIUk9VR0ggKi9cbiAgICAgICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuRFlOQU1JQzpcbiAgICAgICAgICAgIGlmICh0aGlzLmRlY29kZUh1ZmZtYW4oKSA8IDApIHtcbiAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5ERUNPREVfQkxPQ0tfRU5EOlxuICAgICAgICBpZiAodGhpcy5iZmluYWwpIHtcbiAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuSU5JVElBTElaRUQ7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXMuY29uY2F0QnVmZmVyKCk7XG59O1xuXG4vKipcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn0gbWF4IGJhY2t3YXJkIGxlbmd0aCBmb3IgTFo3Ny5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLk1heEJhY2t3YXJkTGVuZ3RoID0gMzI3Njg7XG5cbi8qKlxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfSBtYXggY29weSBsZW5ndGggZm9yIExaNzcuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5NYXhDb3B5TGVuZ3RoID0gMjU4O1xuXG4vKipcbiAqIGh1ZmZtYW4gb3JkZXJcbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5PcmRlciA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDE2QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbMTYsIDE3LCAxOCwgMCwgOCwgNywgOSwgNiwgMTAsIDUsIDExLCA0LCAxMiwgMywgMTMsIDIsIDE0LCAxLCAxNV0pO1xuXG4vKipcbiAqIGh1ZmZtYW4gbGVuZ3RoIGNvZGUgdGFibGUuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkxlbmd0aENvZGVUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDE2QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbXG4gIDB4MDAwMywgMHgwMDA0LCAweDAwMDUsIDB4MDAwNiwgMHgwMDA3LCAweDAwMDgsIDB4MDAwOSwgMHgwMDBhLCAweDAwMGIsXG4gIDB4MDAwZCwgMHgwMDBmLCAweDAwMTEsIDB4MDAxMywgMHgwMDE3LCAweDAwMWIsIDB4MDAxZiwgMHgwMDIzLCAweDAwMmIsXG4gIDB4MDAzMywgMHgwMDNiLCAweDAwNDMsIDB4MDA1MywgMHgwMDYzLCAweDAwNzMsIDB4MDA4MywgMHgwMGEzLCAweDAwYzMsXG4gIDB4MDBlMywgMHgwMTAyLCAweDAxMDIsIDB4MDEwMlxuXSk7XG5cbi8qKlxuICogaHVmZm1hbiBsZW5ndGggZXh0cmEtYml0cyB0YWJsZS5cbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5MZW5ndGhFeHRyYVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50OEFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoW1xuICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxLCAxLCAxLCAyLCAyLCAyLCAyLCAzLCAzLCAzLCAzLCA0LCA0LCA0LCA0LCA1LCA1LFxuICA1LCA1LCAwLCAwLCAwXG5dKTtcblxuLyoqXG4gKiBodWZmbWFuIGRpc3QgY29kZSB0YWJsZS5cbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0uRGlzdENvZGVUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDE2QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbXG4gIDB4MDAwMSwgMHgwMDAyLCAweDAwMDMsIDB4MDAwNCwgMHgwMDA1LCAweDAwMDcsIDB4MDAwOSwgMHgwMDBkLCAweDAwMTEsXG4gIDB4MDAxOSwgMHgwMDIxLCAweDAwMzEsIDB4MDA0MSwgMHgwMDYxLCAweDAwODEsIDB4MDBjMSwgMHgwMTAxLCAweDAxODEsXG4gIDB4MDIwMSwgMHgwMzAxLCAweDA0MDEsIDB4MDYwMSwgMHgwODAxLCAweDBjMDEsIDB4MTAwMSwgMHgxODAxLCAweDIwMDEsXG4gIDB4MzAwMSwgMHg0MDAxLCAweDYwMDFcbl0pO1xuXG4vKipcbiAqIGh1ZmZtYW4gZGlzdCBleHRyYS1iaXRzIHRhYmxlLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkRpc3RFeHRyYVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50OEFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoW1xuICAwLCAwLCAwLCAwLCAxLCAxLCAyLCAyLCAzLCAzLCA0LCA0LCA1LCA1LCA2LCA2LCA3LCA3LCA4LCA4LCA5LCA5LCAxMCwgMTAsIDExLFxuICAxMSwgMTIsIDEyLCAxMywgMTNcbl0pO1xuXG4vKipcbiAqIGZpeGVkIGh1ZmZtYW4gbGVuZ3RoIGNvZGUgdGFibGVcbiAqIEBjb25zdFxuICogQHR5cGUgeyFBcnJheX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkZpeGVkTGl0ZXJhbExlbmd0aFRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiB0YWJsZTtcbn0pKChmdW5jdGlvbigpIHtcbiAgdmFyIGxlbmd0aHMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgyODgpO1xuICB2YXIgaSwgaWw7XG5cbiAgZm9yIChpID0gMCwgaWwgPSBsZW5ndGhzLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICBsZW5ndGhzW2ldID1cbiAgICAgIChpIDw9IDE0MykgPyA4IDpcbiAgICAgIChpIDw9IDI1NSkgPyA5IDpcbiAgICAgIChpIDw9IDI3OSkgPyA3IDpcbiAgICAgIDg7XG4gIH1cblxuICByZXR1cm4gYnVpbGRIdWZmbWFuVGFibGUobGVuZ3Rocyk7XG59KSgpKTtcblxuLyoqXG4gKiBmaXhlZCBodWZmbWFuIGRpc3RhbmNlIGNvZGUgdGFibGVcbiAqIEBjb25zdFxuICogQHR5cGUgeyFBcnJheX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkZpeGVkRGlzdGFuY2VUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gdGFibGU7XG59KSgoZnVuY3Rpb24oKSB7XG4gIHZhciBsZW5ndGhzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoMzApO1xuICB2YXIgaSwgaWw7XG5cbiAgZm9yIChpID0gMCwgaWwgPSBsZW5ndGhzLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICBsZW5ndGhzW2ldID0gNTtcbiAgfVxuXG4gIHJldHVybiBidWlsZEh1ZmZtYW5UYWJsZShsZW5ndGhzKTtcbn0pKCkpO1xuXG4vKipcbiAqIHBhcnNlIGRlZmxhdGVkIGJsb2NrLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRCbG9ja0hlYWRlciA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gaGVhZGVyICovXG4gIHZhciBoZHI7XG5cbiAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkJMT0NLX0hFQURFUl9TVEFSVDtcblxuICB0aGlzLnNhdmVfKCk7XG4gIGlmICgoaGRyID0gdGhpcy5yZWFkQml0cygzKSkgPCAwKSB7XG4gICAgdGhpcy5yZXN0b3JlXygpO1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8vIEJGSU5BTFxuICBpZiAoaGRyICYgMHgxKSB7XG4gICAgdGhpcy5iZmluYWwgPSB0cnVlO1xuICB9XG5cbiAgLy8gQlRZUEVcbiAgaGRyID4+Pj0gMTtcbiAgc3dpdGNoIChoZHIpIHtcbiAgICBjYXNlIDA6IC8vIHVuY29tcHJlc3NlZFxuICAgICAgdGhpcy5jdXJyZW50QmxvY2tUeXBlID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5VTkNPTVBSRVNTRUQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDE6IC8vIGZpeGVkIGh1ZmZtYW5cbiAgICAgIHRoaXMuY3VycmVudEJsb2NrVHlwZSA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuRklYRUQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6IC8vIGR5bmFtaWMgaHVmZm1hblxuICAgICAgdGhpcy5jdXJyZW50QmxvY2tUeXBlID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5EWU5BTUlDO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDogLy8gcmVzZXJ2ZWQgb3Igb3RoZXJcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBCVFlQRTogJyArIGhkcik7XG4gIH1cblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfSEVBREVSX0VORDtcbn07XG5cbi8qKlxuICogcmVhZCBpbmZsYXRlIGJpdHNcbiAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggYml0cyBsZW5ndGguXG4gKiBAcmV0dXJuIHtudW1iZXJ9IHJlYWQgYml0cy5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkQml0cyA9IGZ1bmN0aW9uKGxlbmd0aCkge1xuICB2YXIgYml0c2J1ZiA9IHRoaXMuYml0c2J1ZjtcbiAgdmFyIGJpdHNidWZsZW4gPSB0aGlzLmJpdHNidWZsZW47XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IGFuZCBvdXRwdXQgYnl0ZS4gKi9cbiAgdmFyIG9jdGV0O1xuXG4gIC8vIG5vdCBlbm91Z2ggYnVmZmVyXG4gIHdoaWxlIChiaXRzYnVmbGVuIDwgbGVuZ3RoKSB7XG4gICAgLy8gaW5wdXQgYnl0ZVxuICAgIGlmIChpbnB1dC5sZW5ndGggPD0gaXApIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgb2N0ZXQgPSBpbnB1dFtpcCsrXTtcblxuICAgIC8vIGNvbmNhdCBvY3RldFxuICAgIGJpdHNidWYgfD0gb2N0ZXQgPDwgYml0c2J1ZmxlbjtcbiAgICBiaXRzYnVmbGVuICs9IDg7XG4gIH1cblxuICAvLyBvdXRwdXQgYnl0ZVxuICBvY3RldCA9IGJpdHNidWYgJiAvKiBNQVNLICovICgoMSA8PCBsZW5ndGgpIC0gMSk7XG4gIGJpdHNidWYgPj4+PSBsZW5ndGg7XG4gIGJpdHNidWZsZW4gLT0gbGVuZ3RoO1xuXG4gIHRoaXMuYml0c2J1ZiA9IGJpdHNidWY7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IGJpdHNidWZsZW47XG4gIHRoaXMuaXAgPSBpcDtcblxuICByZXR1cm4gb2N0ZXQ7XG59O1xuXG4vKipcbiAqIHJlYWQgaHVmZm1hbiBjb2RlIHVzaW5nIHRhYmxlXG4gKiBAcGFyYW0ge0FycmF5fSB0YWJsZSBodWZmbWFuIGNvZGUgdGFibGUuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IGh1ZmZtYW4gY29kZS5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkQ29kZUJ5VGFibGUgPSBmdW5jdGlvbih0YWJsZSkge1xuICB2YXIgYml0c2J1ZiA9IHRoaXMuYml0c2J1ZjtcbiAgdmFyIGJpdHNidWZsZW4gPSB0aGlzLmJpdHNidWZsZW47XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG5cbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBodWZmbWFuIGNvZGUgdGFibGUgKi9cbiAgdmFyIGNvZGVUYWJsZSA9IHRhYmxlWzBdO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG1heENvZGVMZW5ndGggPSB0YWJsZVsxXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IGJ5dGUgKi9cbiAgdmFyIG9jdGV0O1xuICAvKiogQHR5cGUge251bWJlcn0gY29kZSBsZW5ndGggJiBjb2RlICgxNmJpdCwgMTZiaXQpICovXG4gIHZhciBjb2RlV2l0aExlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvZGUgYml0cyBsZW5ndGggKi9cbiAgdmFyIGNvZGVMZW5ndGg7XG5cbiAgLy8gbm90IGVub3VnaCBidWZmZXJcbiAgd2hpbGUgKGJpdHNidWZsZW4gPCBtYXhDb2RlTGVuZ3RoKSB7XG4gICAgaWYgKGlucHV0Lmxlbmd0aCA8PSBpcCkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICBvY3RldCA9IGlucHV0W2lwKytdO1xuICAgIGJpdHNidWYgfD0gb2N0ZXQgPDwgYml0c2J1ZmxlbjtcbiAgICBiaXRzYnVmbGVuICs9IDg7XG4gIH1cblxuICAvLyByZWFkIG1heCBsZW5ndGhcbiAgY29kZVdpdGhMZW5ndGggPSBjb2RlVGFibGVbYml0c2J1ZiAmICgoMSA8PCBtYXhDb2RlTGVuZ3RoKSAtIDEpXTtcbiAgY29kZUxlbmd0aCA9IGNvZGVXaXRoTGVuZ3RoID4+PiAxNjtcblxuICB0aGlzLmJpdHNidWYgPSBiaXRzYnVmID4+IGNvZGVMZW5ndGg7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IGJpdHNidWZsZW4gLSBjb2RlTGVuZ3RoO1xuICB0aGlzLmlwID0gaXA7XG5cbiAgcmV0dXJuIGNvZGVXaXRoTGVuZ3RoICYgMHhmZmZmO1xufTtcblxuLyoqXG4gKiByZWFkIHVuY29tcHJlc3NlZCBibG9jayBoZWFkZXJcbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkVW5jb21wcmVzc2VkQmxvY2tIZWFkZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJsb2NrIGxlbmd0aCAqL1xuICB2YXIgbGVuO1xuICAvKiogQHR5cGUge251bWJlcn0gbnVtYmVyIGZvciBjaGVjayBibG9jayBsZW5ndGggKi9cbiAgdmFyIG5sZW47XG5cbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgdmFyIGlwID0gdGhpcy5pcDtcblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9TVEFSVDtcblxuICBpZiAoaXAgKyA0ID49IGlucHV0Lmxlbmd0aCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGxlbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuICBubGVuID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gY2hlY2sgbGVuICYgbmxlblxuICBpZiAobGVuID09PSB+bmxlbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB1bmNvbXByZXNzZWQgYmxvY2sgaGVhZGVyOiBsZW5ndGggdmVyaWZ5Jyk7XG4gIH1cblxuICAvLyBza2lwIGJ1ZmZlcmVkIGhlYWRlciBiaXRzXG4gIHRoaXMuYml0c2J1ZiA9IDA7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IDA7XG5cbiAgdGhpcy5pcCA9IGlwO1xuICB0aGlzLmJsb2NrTGVuZ3RoID0gbGVuO1xuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9FTkQ7XG59XG5cbi8qKlxuICogcGFyc2UgdW5jb21wcmVzc2VkIGJsb2NrLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnBhcnNlVW5jb21wcmVzc2VkQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgdmFyIGlwID0gdGhpcy5pcDtcbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuICB2YXIgb3AgPSB0aGlzLm9wO1xuICB2YXIgbGVuID0gdGhpcy5ibG9ja0xlbmd0aDtcblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuREVDT0RFX0JMT0NLX1NUQVJUO1xuXG4gIC8vIGNvcHlcbiAgLy8gWFhYOiDjgajjgorjgYLjgYjjgZrntKDnm7TjgavjgrPjg5Tjg7xcbiAgd2hpbGUgKGxlbi0tKSB7XG4gICAgaWYgKG9wID09PSBvdXRwdXQubGVuZ3RoKSB7XG4gICAgICBvdXRwdXQgPSB0aGlzLmV4cGFuZEJ1ZmZlcih7Zml4UmF0aW86IDJ9KTtcbiAgICB9XG5cbiAgICAvLyBub3QgZW5vdWdoIGlucHV0IGJ1ZmZlclxuICAgIGlmIChpcCA+PSBpbnB1dC5sZW5ndGgpIHtcbiAgICAgIHRoaXMuaXAgPSBpcDtcbiAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgIHRoaXMuYmxvY2tMZW5ndGggPSBsZW4gKyAxOyAvLyDjgrPjg5Tjg7zjgZfjgabjgarjgYTjga7jgafmiLvjgZlcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBvdXRwdXRbb3ArK10gPSBpbnB1dFtpcCsrXTtcbiAgfVxuXG4gIGlmIChsZW4gPCAwKSB7XG4gICAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkRFQ09ERV9CTE9DS19FTkQ7XG4gIH1cblxuICB0aGlzLmlwID0gaXA7XG4gIHRoaXMub3AgPSBvcDtcblxuICByZXR1cm4gMDtcbn07XG5cbi8qKlxuICogcGFyc2UgZml4ZWQgaHVmZm1hbiBibG9jay5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5wYXJzZUZpeGVkSHVmZm1hbkJsb2NrID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX1NUQVJUO1xuXG4gIHRoaXMubGl0bGVuVGFibGUgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uRml4ZWRMaXRlcmFsTGVuZ3RoVGFibGU7XG4gIHRoaXMuZGlzdFRhYmxlID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkZpeGVkRGlzdGFuY2VUYWJsZTtcblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9FTkQ7XG5cbiAgcmV0dXJuIDA7XG59O1xuXG4vKipcbiAqIOOCquODluOCuOOCp+OCr+ODiOOBruOCs+ODs+ODhuOCreOCueODiOOCkuWIpeOBruODl+ODreODkeODhuOCo+OBq+mAgOmBv+OBmeOCiy5cbiAqIEBwcml2YXRlXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuc2F2ZV8gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pcF8gPSB0aGlzLmlwO1xuICB0aGlzLmJpdHNidWZsZW5fID0gdGhpcy5iaXRzYnVmbGVuO1xuICB0aGlzLmJpdHNidWZfID0gdGhpcy5iaXRzYnVmO1xufTtcblxuLyoqXG4gKiDliKXjga7jg5fjg63jg5Hjg4bjgqPjgavpgIDpgb/jgZfjgZ/jgrPjg7Pjg4bjgq3jgrnjg4jjgpLlvqnlhYPjgZnjgosuXG4gKiBAcHJpdmF0ZVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlc3RvcmVfID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXAgPSB0aGlzLmlwXztcbiAgdGhpcy5iaXRzYnVmbGVuID0gdGhpcy5iaXRzYnVmbGVuXztcbiAgdGhpcy5iaXRzYnVmID0gdGhpcy5iaXRzYnVmXztcbn07XG5cbi8qKlxuICogcGFyc2UgZHluYW1pYyBodWZmbWFuIGJsb2NrLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnBhcnNlRHluYW1pY0h1ZmZtYW5CbG9jayA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gbnVtYmVyIG9mIGxpdGVyYWwgYW5kIGxlbmd0aCBjb2Rlcy4gKi9cbiAgdmFyIGhsaXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgb2YgZGlzdGFuY2UgY29kZXMuICovXG4gIHZhciBoZGlzdDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG51bWJlciBvZiBjb2RlIGxlbmd0aHMuICovXG4gIHZhciBoY2xlbjtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSBjb2RlIGxlbmd0aHMuICovXG4gIHZhciBjb2RlTGVuZ3RocyA9XG4gICAgbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoWmxpYi5SYXdJbmZsYXRlU3RyZWFtLk9yZGVyLmxlbmd0aCk7XG4gIC8qKiBAdHlwZSB7IUFycmF5fSBjb2RlIGxlbmd0aHMgdGFibGUuICovXG4gIHZhciBjb2RlTGVuZ3Roc1RhYmxlO1xuICAvKiogQHR5cGUgeyEoVWludDMyQXJyYXl8QXJyYXkpfSBsaXRlcmFsIGFuZCBsZW5ndGggY29kZSBsZW5ndGhzLiAqL1xuICB2YXIgbGl0bGVuTGVuZ3RocztcbiAgLyoqIEB0eXBlIHshKFVpbnQzMkFycmF5fEFycmF5KX0gZGlzdGFuY2UgY29kZSBsZW5ndGhzLiAqL1xuICB2YXIgZGlzdExlbmd0aHM7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBpID0gMDtcblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9TVEFSVDtcblxuICB0aGlzLnNhdmVfKCk7XG4gIGhsaXQgPSB0aGlzLnJlYWRCaXRzKDUpICsgMjU3O1xuICBoZGlzdCA9IHRoaXMucmVhZEJpdHMoNSkgKyAxO1xuICBoY2xlbiA9IHRoaXMucmVhZEJpdHMoNCkgKyA0O1xuICBpZiAoaGxpdCA8IDAgfHwgaGRpc3QgPCAwIHx8IGhjbGVuIDwgMCkge1xuICAgIHRoaXMucmVzdG9yZV8oKTtcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICB0cnkge1xuICAgIHBhcnNlRHluYW1pY0h1ZmZtYW5CbG9ja0ltcGwuY2FsbCh0aGlzKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgdGhpcy5yZXN0b3JlXygpO1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlRHluYW1pY0h1ZmZtYW5CbG9ja0ltcGwoKSB7XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgdmFyIGJpdHM7XG5cbiAgICAvLyBkZWNvZGUgY29kZSBsZW5ndGhzXG4gICAgZm9yIChpID0gMDsgaSA8IGhjbGVuOyArK2kpIHtcbiAgICAgIGlmICgoYml0cyA9IHRoaXMucmVhZEJpdHMoMykpIDwgMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBlbm91Z2ggaW5wdXQnKTtcbiAgICAgIH1cbiAgICAgIGNvZGVMZW5ndGhzW1psaWIuUmF3SW5mbGF0ZVN0cmVhbS5PcmRlcltpXV0gPSBiaXRzO1xuICAgIH1cbiAgICBjb2RlTGVuZ3Roc1RhYmxlID0gYnVpbGRIdWZmbWFuVGFibGUoY29kZUxlbmd0aHMpO1xuXG4gICAgLy8gZGVjb2RlIGZ1bmN0aW9uXG4gICAgZnVuY3Rpb24gZGVjb2RlKG51bSwgdGFibGUsIGxlbmd0aHMpIHtcbiAgICAgIHZhciBjb2RlO1xuICAgICAgdmFyIHByZXYgPSB0aGlzLnByZXY7XG4gICAgICB2YXIgcmVwZWF0O1xuICAgICAgdmFyIGk7XG4gICAgICB2YXIgYml0cztcblxuICAgICAgZm9yIChpID0gMDsgaSA8IG51bTspIHtcbiAgICAgICAgY29kZSA9IHRoaXMucmVhZENvZGVCeVRhYmxlKHRhYmxlKTtcbiAgICAgICAgaWYgKGNvZGUgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdub3QgZW5vdWdoIGlucHV0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIGlmICgoYml0cyA9IHRoaXMucmVhZEJpdHMoMikpIDwgMCkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBlbm91Z2ggaW5wdXQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcGVhdCA9IDMgKyBiaXRzO1xuICAgICAgICAgICAgd2hpbGUgKHJlcGVhdC0tKSB7IGxlbmd0aHNbaSsrXSA9IHByZXY7IH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICBpZiAoKGJpdHMgPSB0aGlzLnJlYWRCaXRzKDMpKSA8IDApIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdub3QgZW5vdWdoIGlucHV0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXBlYXQgPSAzICsgYml0cztcbiAgICAgICAgICAgIHdoaWxlIChyZXBlYXQtLSkgeyBsZW5ndGhzW2krK10gPSAwOyB9XG4gICAgICAgICAgICBwcmV2ID0gMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgICBpZiAoKGJpdHMgPSB0aGlzLnJlYWRCaXRzKDcpKSA8IDApIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdub3QgZW5vdWdoIGlucHV0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXBlYXQgPSAxMSArIGJpdHM7XG4gICAgICAgICAgICB3aGlsZSAocmVwZWF0LS0pIHsgbGVuZ3Roc1tpKytdID0gMDsgfVxuICAgICAgICAgICAgcHJldiA9IDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGVuZ3Roc1tpKytdID0gY29kZTtcbiAgICAgICAgICAgIHByZXYgPSBjb2RlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5wcmV2ID0gcHJldjtcblxuICAgICAgcmV0dXJuIGxlbmd0aHM7XG4gICAgfVxuXG4gICAgLy8gbGl0ZXJhbCBhbmQgbGVuZ3RoIGNvZGVcbiAgICBsaXRsZW5MZW5ndGhzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoaGxpdCk7XG5cbiAgICAvLyBkaXN0YW5jZSBjb2RlXG4gICAgZGlzdExlbmd0aHMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShoZGlzdCk7XG5cbiAgICB0aGlzLnByZXYgPSAwO1xuICAgIHRoaXMubGl0bGVuVGFibGUgPSBidWlsZEh1ZmZtYW5UYWJsZShkZWNvZGUuY2FsbCh0aGlzLCBobGl0LCBjb2RlTGVuZ3Roc1RhYmxlLCBsaXRsZW5MZW5ndGhzKSk7XG4gICAgdGhpcy5kaXN0VGFibGUgPSBidWlsZEh1ZmZtYW5UYWJsZShkZWNvZGUuY2FsbCh0aGlzLCBoZGlzdCwgY29kZUxlbmd0aHNUYWJsZSwgZGlzdExlbmd0aHMpKTtcbiAgfVxuXG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX0VORDtcblxuICByZXR1cm4gMDtcbn07XG5cbi8qKlxuICogZGVjb2RlIGh1ZmZtYW4gY29kZSAoZHluYW1pYylcbiAqIEByZXR1cm4geyhudW1iZXJ8dW5kZWZpbmVkKX0gLTEgaXMgZXJyb3IuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb2RlSHVmZm1hbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gIHZhciBvcCA9IHRoaXMub3A7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZS4gKi9cbiAgdmFyIGNvZGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSB0YWJsZSBpbmRleC4gKi9cbiAgdmFyIHRpO1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlIGRpc3RpbmF0aW9uLiAqL1xuICB2YXIgY29kZURpc3Q7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBodWZmbWFuIGNvZGUgbGVuZ3RoLiAqL1xuICB2YXIgY29kZUxlbmd0aDtcblxuICB2YXIgbGl0bGVuID0gdGhpcy5saXRsZW5UYWJsZTtcbiAgdmFyIGRpc3QgPSB0aGlzLmRpc3RUYWJsZTtcblxuICB2YXIgb2xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG4gIHZhciBiaXRzO1xuXG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5ERUNPREVfQkxPQ0tfU1RBUlQ7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICB0aGlzLnNhdmVfKCk7XG5cbiAgICBjb2RlID0gdGhpcy5yZWFkQ29kZUJ5VGFibGUobGl0bGVuKTtcbiAgICBpZiAoY29kZSA8IDApIHtcbiAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgIHRoaXMucmVzdG9yZV8oKTtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBpZiAoY29kZSA9PT0gMjU2KSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBsaXRlcmFsXG4gICAgaWYgKGNvZGUgPCAyNTYpIHtcbiAgICAgIGlmIChvcCA9PT0gb2xlbmd0aCkge1xuICAgICAgICBvdXRwdXQgPSB0aGlzLmV4cGFuZEJ1ZmZlcigpO1xuICAgICAgICBvbGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIG91dHB1dFtvcCsrXSA9IGNvZGU7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxlbmd0aCBjb2RlXG4gICAgdGkgPSBjb2RlIC0gMjU3O1xuICAgIGNvZGVMZW5ndGggPSBabGliLlJhd0luZmxhdGVTdHJlYW0uTGVuZ3RoQ29kZVRhYmxlW3RpXTtcbiAgICBpZiAoWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkxlbmd0aEV4dHJhVGFibGVbdGldID4gMCkge1xuICAgICAgYml0cyA9IHRoaXMucmVhZEJpdHMoWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkxlbmd0aEV4dHJhVGFibGVbdGldKTtcbiAgICAgIGlmIChiaXRzIDwgMCkge1xuICAgICAgICB0aGlzLm9wID0gb3A7XG4gICAgICAgIHRoaXMucmVzdG9yZV8oKTtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgY29kZUxlbmd0aCArPSBiaXRzO1xuICAgIH1cblxuICAgIC8vIGRpc3QgY29kZVxuICAgIGNvZGUgPSB0aGlzLnJlYWRDb2RlQnlUYWJsZShkaXN0KTtcbiAgICBpZiAoY29kZSA8IDApIHtcbiAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgIHRoaXMucmVzdG9yZV8oKTtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgY29kZURpc3QgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uRGlzdENvZGVUYWJsZVtjb2RlXTtcbiAgICBpZiAoWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkRpc3RFeHRyYVRhYmxlW2NvZGVdID4gMCkge1xuICAgICAgYml0cyA9IHRoaXMucmVhZEJpdHMoWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkRpc3RFeHRyYVRhYmxlW2NvZGVdKTtcbiAgICAgIGlmIChiaXRzIDwgMCkge1xuICAgICAgICB0aGlzLm9wID0gb3A7XG4gICAgICAgIHRoaXMucmVzdG9yZV8oKTtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgY29kZURpc3QgKz0gYml0cztcbiAgICB9XG5cbiAgICAvLyBsejc3IGRlY29kZVxuICAgIGlmIChvcCArIGNvZGVMZW5ndGggPj0gb2xlbmd0aCkge1xuICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgIG9sZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuICAgIH1cblxuICAgIHdoaWxlIChjb2RlTGVuZ3RoLS0pIHtcbiAgICAgIG91dHB1dFtvcF0gPSBvdXRwdXRbKG9wKyspIC0gY29kZURpc3RdO1xuICAgIH1cblxuICAgIC8vIGJyZWFrXG4gICAgaWYgKHRoaXMuaXAgPT09IHRoaXMuaW5wdXQubGVuZ3RoKSB7XG4gICAgICB0aGlzLm9wID0gb3A7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICB9XG5cbiAgd2hpbGUgKHRoaXMuYml0c2J1ZmxlbiA+PSA4KSB7XG4gICAgdGhpcy5iaXRzYnVmbGVuIC09IDg7XG4gICAgdGhpcy5pcC0tO1xuICB9XG5cbiAgdGhpcy5vcCA9IG9wO1xuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuREVDT0RFX0JMT0NLX0VORDtcbn07XG5cbi8qKlxuICogZXhwYW5kIG91dHB1dCBidWZmZXIuIChkeW5hbWljKVxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW0gb3B0aW9uIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyIHBvaW50ZXIuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyID0gZnVuY3Rpb24ob3B0X3BhcmFtKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gc3RvcmUgYnVmZmVyLiAqL1xuICB2YXIgYnVmZmVyO1xuICAvKiogQHR5cGUge251bWJlcn0gZXhwYW50aW9uIHJhdGlvLiAqL1xuICB2YXIgcmF0aW8gPSAodGhpcy5pbnB1dC5sZW5ndGggLyB0aGlzLmlwICsgMSkgfCAwO1xuICAvKiogQHR5cGUge251bWJlcn0gbWF4aW11bSBudW1iZXIgb2YgaHVmZm1hbiBjb2RlLiAqL1xuICB2YXIgbWF4SHVmZkNvZGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBuZXcgb3V0cHV0IGJ1ZmZlciBzaXplLiAqL1xuICB2YXIgbmV3U2l6ZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG1heCBpbmZsYXRlIHNpemUuICovXG4gIHZhciBtYXhJbmZsYXRlU2l6ZTtcblxuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG5cbiAgaWYgKG9wdF9wYXJhbSkge1xuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtLmZpeFJhdGlvID09PSAnbnVtYmVyJykge1xuICAgICAgcmF0aW8gPSBvcHRfcGFyYW0uZml4UmF0aW87XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtLmFkZFJhdGlvID09PSAnbnVtYmVyJykge1xuICAgICAgcmF0aW8gKz0gb3B0X3BhcmFtLmFkZFJhdGlvO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNhbGN1bGF0ZSBuZXcgYnVmZmVyIHNpemVcbiAgaWYgKHJhdGlvIDwgMikge1xuICAgIG1heEh1ZmZDb2RlID1cbiAgICAgIChpbnB1dC5sZW5ndGggLSB0aGlzLmlwKSAvIHRoaXMubGl0bGVuVGFibGVbMl07XG4gICAgbWF4SW5mbGF0ZVNpemUgPSAobWF4SHVmZkNvZGUgLyAyICogMjU4KSB8IDA7XG4gICAgbmV3U2l6ZSA9IG1heEluZmxhdGVTaXplIDwgb3V0cHV0Lmxlbmd0aCA/XG4gICAgICBvdXRwdXQubGVuZ3RoICsgbWF4SW5mbGF0ZVNpemUgOlxuICAgICAgb3V0cHV0Lmxlbmd0aCA8PCAxO1xuICB9IGVsc2Uge1xuICAgIG5ld1NpemUgPSBvdXRwdXQubGVuZ3RoICogcmF0aW87XG4gIH1cblxuICAvLyBidWZmZXIgZXhwYW50aW9uXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG5ld1NpemUpO1xuICAgIGJ1ZmZlci5zZXQob3V0cHV0KTtcbiAgfSBlbHNlIHtcbiAgICBidWZmZXIgPSBvdXRwdXQ7XG4gIH1cblxuICB0aGlzLm91dHB1dCA9IGJ1ZmZlcjtcblxuICByZXR1cm4gdGhpcy5vdXRwdXQ7XG59O1xuXG4vKipcbiAqIGNvbmNhdCBvdXRwdXQgYnVmZmVyLiAoZHluYW1pYylcbiAqIEByZXR1cm4geyEoQXJyYXl8VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuY29uY2F0QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdmFyIGJ1ZmZlcjtcblxuICB2YXIgcmVzaXplID0gdGhpcy5yZXNpemU7XG5cbiAgdmFyIG9wID0gdGhpcy5vcDtcblxuICBpZiAocmVzaXplKSB7XG4gICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShvcCk7XG4gICAgICBidWZmZXIuc2V0KHRoaXMub3V0cHV0LnN1YmFycmF5KHRoaXMuc3AsIG9wKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1ZmZlciA9IHRoaXMub3V0cHV0LnNsaWNlKHRoaXMuc3AsIG9wKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyID1cbiAgICAgIFVTRV9UWVBFREFSUkFZID8gdGhpcy5vdXRwdXQuc3ViYXJyYXkodGhpcy5zcCwgb3ApIDogdGhpcy5vdXRwdXQuc2xpY2UodGhpcy5zcCwgb3ApO1xuICB9XG5cblxuICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgdGhpcy5zcCA9IG9wO1xuXG4gIHJldHVybiB0aGlzLmJ1ZmZlcjtcbn07XG5cbi8qKlxuICogQHJldHVybiB7IShBcnJheXxVaW50OEFycmF5KX0gY3VycmVudCBvdXRwdXQgYnVmZmVyLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmdldEJ5dGVzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/XG4gICAgdGhpcy5vdXRwdXQuc3ViYXJyYXkoMCwgdGhpcy5vcCkgOiB0aGlzLm91dHB1dC5zbGljZSgwLCB0aGlzLm9wKTtcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyDpm5HlpJrjgarplqLmlbDnvqTjgpLjgb7jgajjgoHjgZ/jg6Ljgrjjg6Xjg7zjg6vlrp/oo4UuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5VdGlsJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQnl0ZSBTdHJpbmcg44GL44KJIEJ5dGUgQXJyYXkg44Gr5aSJ5o+bLlxuICogQHBhcmFtIHshc3RyaW5nfSBzdHIgYnl0ZSBzdHJpbmcuXG4gKiBAcmV0dXJuIHshQXJyYXkuPG51bWJlcj59IGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuVXRpbC5zdHJpbmdUb0J5dGVBcnJheSA9IGZ1bmN0aW9uKHN0cikge1xuICAvKiogQHR5cGUgeyFBcnJheS48KHN0cmluZ3xudW1iZXIpPn0gKi9cbiAgdmFyIHRtcCA9IHN0ci5zcGxpdCgnJyk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbDtcblxuICBmb3IgKGkgPSAwLCBpbCA9IHRtcC5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XG4gICAgdG1wW2ldID0gKHRtcFtpXS5jaGFyQ29kZUF0KDApICYgMHhmZikgPj4+IDA7XG4gIH1cblxuICByZXR1cm4gdG1wO1xufTtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEFkbGVyMzIgY2hlY2tzdW0g5a6f6KOFLlxuICovXG5nb29nLnByb3ZpZGUoJ1psaWIuQWRsZXIzMicpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuVXRpbCcpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIEFkbGVyMzIg44OP44OD44K344Ol5YCk44Gu5L2c5oiQXG4gKiBAcGFyYW0geyEoQXJyYXl8VWludDhBcnJheXxzdHJpbmcpfSBhcnJheSDnrpflh7rjgavkvb/nlKjjgZnjgosgYnl0ZSBhcnJheS5cbiAqIEByZXR1cm4ge251bWJlcn0gQWRsZXIzMiDjg4/jg4Pjgrfjg6XlgKQuXG4gKi9cblpsaWIuQWRsZXIzMiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gIGlmICh0eXBlb2YoYXJyYXkpID09PSAnc3RyaW5nJykge1xuICAgIGFycmF5ID0gWmxpYi5VdGlsLnN0cmluZ1RvQnl0ZUFycmF5KGFycmF5KTtcbiAgfVxuICByZXR1cm4gWmxpYi5BZGxlcjMyLnVwZGF0ZSgxLCBhcnJheSk7XG59O1xuXG4vKipcbiAqIEFkbGVyMzIg44OP44OD44K344Ol5YCk44Gu5pu05pawXG4gKiBAcGFyYW0ge251bWJlcn0gYWRsZXIg54++5Zyo44Gu44OP44OD44K344Ol5YCkLlxuICogQHBhcmFtIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBhcnJheSDmm7TmlrDjgavkvb/nlKjjgZnjgosgYnl0ZSBhcnJheS5cbiAqIEByZXR1cm4ge251bWJlcn0gQWRsZXIzMiDjg4/jg4Pjgrfjg6XlgKQuXG4gKi9cblpsaWIuQWRsZXIzMi51cGRhdGUgPSBmdW5jdGlvbihhZGxlciwgYXJyYXkpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBzMSA9IGFkbGVyICYgMHhmZmZmO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHMyID0gKGFkbGVyID4+PiAxNikgJiAweGZmZmY7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBhcnJheSBsZW5ndGggKi9cbiAgdmFyIGxlbiA9IGFycmF5Lmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgbGVuZ3RoIChkb24ndCBvdmVyZmxvdykgKi9cbiAgdmFyIHRsZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBhcnJheSBpbmRleCAqL1xuICB2YXIgaSA9IDA7XG5cbiAgd2hpbGUgKGxlbiA+IDApIHtcbiAgICB0bGVuID0gbGVuID4gWmxpYi5BZGxlcjMyLk9wdGltaXphdGlvblBhcmFtZXRlciA/XG4gICAgICBabGliLkFkbGVyMzIuT3B0aW1pemF0aW9uUGFyYW1ldGVyIDogbGVuO1xuICAgIGxlbiAtPSB0bGVuO1xuICAgIGRvIHtcbiAgICAgIHMxICs9IGFycmF5W2krK107XG4gICAgICBzMiArPSBzMTtcbiAgICB9IHdoaWxlICgtLXRsZW4pO1xuXG4gICAgczEgJT0gNjU1MjE7XG4gICAgczIgJT0gNjU1MjE7XG4gIH1cblxuICByZXR1cm4gKChzMiA8PCAxNikgfCBzMSkgPj4+IDA7XG59O1xuXG4vKipcbiAqIEFkbGVyMzIg5pyA6YGp5YyW44OR44Op44Oh44O844K/XG4gKiDnj77nirbjgafjga8gMTAyNCDnqIvluqbjgYzmnIDpgakuXG4gKiBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL2FkbGVyLTMyLXNpbXBsZS12cy1vcHRpbWl6ZWQvM1xuICogQGRlZmluZSB7bnVtYmVyfVxuICovXG5abGliLkFkbGVyMzIuT3B0aW1pemF0aW9uUGFyYW1ldGVyID0gMTAyNDtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiZ29vZy5wcm92aWRlKCdabGliLkluZmxhdGUnKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkFkbGVyMzInKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5SYXdJbmZsYXRlJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0geyEoVWludDhBcnJheXxBcnJheSl9IGlucHV0IGRlZmxhdGVkIGJ1ZmZlci5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtcyBvcHRpb24gcGFyYW1ldGVycy5cbiAqXG4gKiBvcHRfcGFyYW1zIOOBr+S7peS4i+OBruODl+ODreODkeODhuOCo+OCkuaMh+WumuOBmeOCi+S6i+OBjOOBp+OBjeOBvuOBmeOAglxuICogICAtIGluZGV4OiBpbnB1dCBidWZmZXIg44GuIGRlZmxhdGUg44Kz44Oz44OG44OK44Gu6ZaL5aeL5L2N572uLlxuICogICAtIGJsb2NrU2l6ZTog44OQ44OD44OV44Kh44Gu44OW44Ot44OD44Kv44K144Kk44K6LlxuICogICAtIHZlcmlmeTog5Ly45by144GM57WC44KP44Gj44Gf5b6MIGFkbGVyLTMyIGNoZWNrc3VtIOOBruaknOiovOOCkuihjOOBhuOBiy5cbiAqICAgLSBidWZmZXJUeXBlOiBabGliLkluZmxhdGUuQnVmZmVyVHlwZSDjga7lgKTjgavjgojjgaPjgabjg5Djg4Pjg5XjgqHjga7nrqHnkIbmlrnms5XjgpLmjIflrprjgZnjgosuXG4gKiAgICAgICBabGliLkluZmxhdGUuQnVmZmVyVHlwZSDjga8gWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUg44Gu44Ko44Kk44Oq44Ki44K5LlxuICovXG5abGliLkluZmxhdGUgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGJ1ZmZlclNpemU7XG4gIC8qKiBAdHlwZSB7WmxpYi5JbmZsYXRlLkJ1ZmZlclR5cGV9ICovXG4gIHZhciBidWZmZXJUeXBlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNtZjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBmbGc7XG5cbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSAqL1xuICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLmlwID0gMDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0luZmxhdGV9ICovXG4gIHRoaXMucmF3aW5mbGF0ZTtcbiAgLyoqIEB0eXBlIHsoYm9vbGVhbnx1bmRlZmluZWQpfSB2ZXJpZnkgZmxhZy4gKi9cbiAgdGhpcy52ZXJpZnk7XG5cbiAgLy8gb3B0aW9uIHBhcmFtZXRlcnNcbiAgaWYgKG9wdF9wYXJhbXMgfHwgIShvcHRfcGFyYW1zID0ge30pKSB7XG4gICAgaWYgKG9wdF9wYXJhbXNbJ2luZGV4J10pIHtcbiAgICAgIHRoaXMuaXAgPSBvcHRfcGFyYW1zWydpbmRleCddO1xuICAgIH1cbiAgICBpZiAob3B0X3BhcmFtc1sndmVyaWZ5J10pIHtcbiAgICAgIHRoaXMudmVyaWZ5ID0gb3B0X3BhcmFtc1sndmVyaWZ5J107XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tcHJlc3Npb24gTWV0aG9kIGFuZCBGbGFnc1xuICBjbWYgPSBpbnB1dFt0aGlzLmlwKytdO1xuICBmbGcgPSBpbnB1dFt0aGlzLmlwKytdO1xuXG4gIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICBzd2l0Y2ggKGNtZiAmIDB4MGYpIHtcbiAgICBjYXNlIFpsaWIuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTpcbiAgICAgIHRoaXMubWV0aG9kID0gWmxpYi5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgY29tcHJlc3Npb24gbWV0aG9kJyk7XG4gIH1cblxuICAvLyBmY2hlY2tcbiAgaWYgKCgoY21mIDw8IDgpICsgZmxnKSAlIDMxICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZjaGVjayBmbGFnOicgKyAoKGNtZiA8PCA4KSArIGZsZykgJSAzMSk7XG4gIH1cblxuICAvLyBmZGljdCAobm90IHN1cHBvcnRlZClcbiAgaWYgKGZsZyAmIDB4MjApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZkaWN0IGZsYWcgaXMgbm90IHN1cHBvcnRlZCcpO1xuICB9XG5cbiAgLy8gUmF3SW5mbGF0ZVxuICB0aGlzLnJhd2luZmxhdGUgPSBuZXcgWmxpYi5SYXdJbmZsYXRlKGlucHV0LCB7XG4gICAgJ2luZGV4JzogdGhpcy5pcCxcbiAgICAnYnVmZmVyU2l6ZSc6IG9wdF9wYXJhbXNbJ2J1ZmZlclNpemUnXSxcbiAgICAnYnVmZmVyVHlwZSc6IG9wdF9wYXJhbXNbJ2J1ZmZlclR5cGUnXSxcbiAgICAncmVzaXplJzogb3B0X3BhcmFtc1sncmVzaXplJ11cbiAgfSk7XG59XG5cbi8qKlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuWmxpYi5JbmZsYXRlLkJ1ZmZlclR5cGUgPSBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZTtcblxuLyoqXG4gKiBkZWNvbXByZXNzLlxuICogQHJldHVybiB7IShVaW50OEFycmF5fEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyLlxuICovXG5abGliLkluZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3MgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBpbnB1dCBidWZmZXIuICovXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyLiAqL1xuICB2YXIgYnVmZmVyO1xuICAvKiogQHR5cGUge251bWJlcn0gYWRsZXItMzIgY2hlY2tzdW0gKi9cbiAgdmFyIGFkbGVyMzI7XG5cbiAgYnVmZmVyID0gdGhpcy5yYXdpbmZsYXRlLmRlY29tcHJlc3MoKTtcbiAgdGhpcy5pcCA9IHRoaXMucmF3aW5mbGF0ZS5pcDtcblxuICAvLyB2ZXJpZnkgYWRsZXItMzJcbiAgaWYgKHRoaXMudmVyaWZ5KSB7XG4gICAgYWRsZXIzMiA9IChcbiAgICAgIGlucHV0W3RoaXMuaXArK10gPDwgMjQgfCBpbnB1dFt0aGlzLmlwKytdIDw8IDE2IHxcbiAgICAgIGlucHV0W3RoaXMuaXArK10gPDwgOCB8IGlucHV0W3RoaXMuaXArK11cbiAgICApID4+PiAwO1xuXG4gICAgaWYgKGFkbGVyMzIgIT09IFpsaWIuQWRsZXIzMihidWZmZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYWRsZXItMzIgY2hlY2tzdW0nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmZmVyO1xufTtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiZ29vZy5wcm92aWRlKCdabGliLlppcCcpO1xyXG5cclxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xyXG5nb29nLnJlcXVpcmUoJ1psaWIuUmF3RGVmbGF0ZScpO1xyXG5nb29nLnJlcXVpcmUoJ1psaWIuQ1JDMzInKTtcclxuXHJcbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbnMuXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuWmxpYi5aaXAgPSBmdW5jdGlvbihvcHRfcGFyYW1zKSB7XHJcbiAgb3B0X3BhcmFtcyA9IG9wdF9wYXJhbXMgfHwge307XHJcbiAgLyoqIEB0eXBlIHtBcnJheS48e1xyXG4gICAqICAgYnVmZmVyOiAhKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpLFxyXG4gICAqICAgb3B0aW9uOiBPYmplY3QsXHJcbiAgICogICBjb21wcmVzc2VkOiBib29sZWFuLFxyXG4gICAqICAgZW5jcnlwdGVkOiBib29sZWFuLFxyXG4gICAqICAgc2l6ZTogbnVtYmVyLFxyXG4gICAqICAgY3JjMzI6IG51bWJlclxyXG4gICAqIH0+fSAqL1xyXG4gIHRoaXMuZmlsZXMgPSBbXTtcclxuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB0aGlzLmNvbW1lbnQgPSBvcHRfcGFyYW1zWydjb21tZW50J107XHJcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdGhpcy5wYXNzd29yZDtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogQGVudW0ge251bWJlcn1cclxuICovXHJcblpsaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kID0ge1xyXG4gIFNUT1JFOiAwLFxyXG4gIERFRkxBVEU6IDhcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAZW51bSB7bnVtYmVyfVxyXG4gKi9cclxuWmxpYi5aaXAuT3BlcmF0aW5nU3lzdGVtID0ge1xyXG4gIE1TRE9TOiAwLFxyXG4gIFVOSVg6IDMsXHJcbiAgTUFDSU5UT1NIOiA3XHJcbn07XHJcblxyXG4vKipcclxuICogQGVudW0ge251bWJlcn1cclxuICovXHJcblpsaWIuWmlwLkZsYWdzID0ge1xyXG4gIEVOQ1JZUFQ6ICAgIDB4MDAwMSxcclxuICBERVNDUklQVE9SOiAweDAwMDgsXHJcbiAgVVRGODogICAgICAgMHgwODAwXHJcbn07XHJcblxyXG4vKipcclxuICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxyXG4gKiBAY29uc3RcclxuICovXHJcblpsaWIuWmlwLkZpbGVIZWFkZXJTaWduYXR1cmUgPSBbMHg1MCwgMHg0YiwgMHgwMSwgMHgwMl07XHJcblxyXG4vKipcclxuICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxyXG4gKiBAY29uc3RcclxuICovXHJcblpsaWIuWmlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZSA9IFsweDUwLCAweDRiLCAweDAzLCAweDA0XTtcclxuXHJcbi8qKlxyXG4gKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XHJcbiAqIEBjb25zdFxyXG4gKi9cclxuWmxpYi5aaXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZSA9IFsweDUwLCAweDRiLCAweDA1LCAweDA2XTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXl9IGlucHV0XHJcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtcyBvcHRpb25zLlxyXG4gKi9cclxuWmxpYi5aaXAucHJvdG90eXBlLmFkZEZpbGUgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xyXG4gIG9wdF9wYXJhbXMgPSBvcHRfcGFyYW1zIHx8IHt9O1xyXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xyXG4gIHZhciBmaWxlbmFtZSA9ICcnIHx8IG9wdF9wYXJhbXNbJ2ZpbGVuYW1lJ107XHJcbiAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xyXG4gIHZhciBjb21wcmVzc2VkO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBzaXplID0gaW5wdXQubGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBjcmMzMiA9IDA7XHJcblxyXG4gIGlmIChVU0VfVFlQRURBUlJBWSAmJiBpbnB1dCBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICBpbnB1dCA9IG5ldyBVaW50OEFycmF5KGlucHV0KTtcclxuICB9XHJcblxyXG4gIC8vIGRlZmF1bHRcclxuICBpZiAodHlwZW9mIG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uTWV0aG9kJ10gIT09ICdudW1iZXInKSB7XHJcbiAgICBvcHRfcGFyYW1zWydjb21wcmVzc2lvbk1ldGhvZCddID0gWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTtcclxuICB9XHJcblxyXG4gIC8vIOOBneOBruWgtOOBp+Wcp+e4ruOBmeOCi+WgtOWQiFxyXG4gIGlmIChvcHRfcGFyYW1zWydjb21wcmVzcyddKSB7XHJcbiAgICBzd2l0Y2ggKG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uTWV0aG9kJ10pIHtcclxuICAgICAgY2FzZSBabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZC5TVE9SRTpcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxyXG4gICAgICAgIGNyYzMyID0gWmxpYi5DUkMzMi5jYWxjKGlucHV0KTtcclxuICAgICAgICBpbnB1dCA9IHRoaXMuZGVmbGF0ZVdpdGhPcHRpb24oaW5wdXQsIG9wdF9wYXJhbXMpO1xyXG4gICAgICAgIGNvbXByZXNzZWQgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Q6JyArIG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uTWV0aG9kJ10pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdGhpcy5maWxlcy5wdXNoKHtcclxuICAgIGJ1ZmZlcjogaW5wdXQsXHJcbiAgICBvcHRpb246IG9wdF9wYXJhbXMsXHJcbiAgICBjb21wcmVzc2VkOiBjb21wcmVzc2VkLFxyXG4gICAgZW5jcnlwdGVkOiBmYWxzZSxcclxuICAgIHNpemU6IHNpemUsXHJcbiAgICBjcmMzMjogY3JjMzJcclxuICB9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0geyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gcGFzc3dvcmRcclxuICovXHJcblpsaWIuWmlwLnByb3RvdHlwZS5zZXRQYXNzd29yZCA9IGZ1bmN0aW9uKHBhc3N3b3JkKSB7XHJcbiAgdGhpcy5wYXNzd29yZCA9IHBhc3N3b3JkO1xyXG59O1xyXG5cclxuWmxpYi5aaXAucHJvdG90eXBlLmNvbXByZXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgLyoqIEB0eXBlIHtBcnJheS48e1xyXG4gICAqICAgYnVmZmVyOiAhKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpLFxyXG4gICAqICAgb3B0aW9uOiBPYmplY3QsXHJcbiAgICogICBjb21wcmVzc2VkOiBib29sZWFuLFxyXG4gICAqICAgZW5jcnlwdGVkOiBib29sZWFuLFxyXG4gICAqICAgc2l6ZTogbnVtYmVyLFxyXG4gICAqICAgY3JjMzI6IG51bWJlclxyXG4gICAqIH0+fSAqL1xyXG4gIHZhciBmaWxlcyA9IHRoaXMuZmlsZXM7XHJcbiAgLyoqIEB0eXBlIHt7XHJcbiAgICogICBidWZmZXI6ICEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSksXHJcbiAgICogICBvcHRpb246IE9iamVjdCxcclxuICAgKiAgIGNvbXByZXNzZWQ6IGJvb2xlYW4sXHJcbiAgICogICBlbmNyeXB0ZWQ6IGJvb2xlYW4sXHJcbiAgICogICBzaXplOiBudW1iZXIsXHJcbiAgICogICBjcmMzMjogbnVtYmVyXHJcbiAgICogfX0gKi9cclxuICB2YXIgZmlsZTtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIG91dHB1dDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgb3AxO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBvcDI7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIG9wMztcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgbG9jYWxGaWxlU2l6ZSA9IDA7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGNlbnRyYWxEaXJlY3RvcnlTaXplID0gMDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgZW5kT2ZDZW50cmFsRGlyZWN0b3J5U2l6ZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgb2Zmc2V0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBuZWVkVmVyc2lvbjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgZmxhZ3M7XHJcbiAgLyoqIEB0eXBlIHtabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZH0gKi9cclxuICB2YXIgY29tcHJlc3Npb25NZXRob2Q7XHJcbiAgLyoqIEB0eXBlIHtEYXRlfSAqL1xyXG4gIHZhciBkYXRlO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBjcmMzMjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgc2l6ZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgcGxhaW5TaXplO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBmaWxlbmFtZUxlbmd0aDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgZXh0cmFGaWVsZExlbmd0aDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgY29tbWVudExlbmd0aDtcclxuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB2YXIgZmlsZW5hbWU7XHJcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIGV4dHJhRmllbGQ7XHJcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIGNvbW1lbnQ7XHJcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIGJ1ZmZlcjtcclxuICAvKiogQHR5cGUgeyp9ICovXHJcbiAgdmFyIHRtcDtcclxuICAvKiogQHR5cGUge0FycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5fE9iamVjdH0gKi9cclxuICB2YXIga2V5O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpbDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgajtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgamw7XHJcblxyXG4gIC8vIOODleOCoeOCpOODq+OBruWcp+e4rlxyXG4gIGZvciAoaSA9IDAsIGlsID0gZmlsZXMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xyXG4gICAgZmlsZSA9IGZpbGVzW2ldO1xyXG4gICAgZmlsZW5hbWVMZW5ndGggPVxyXG4gICAgICAoZmlsZS5vcHRpb25bJ2ZpbGVuYW1lJ10pID8gZmlsZS5vcHRpb25bJ2ZpbGVuYW1lJ10ubGVuZ3RoIDogMDtcclxuICAgIGV4dHJhRmllbGRMZW5ndGggPVxyXG4gICAgICAoZmlsZS5vcHRpb25bJ2V4dHJhRmllbGQnXSkgPyBmaWxlLm9wdGlvblsnZXh0cmFGaWVsZCddLmxlbmd0aCA6IDA7XHJcbiAgICBjb21tZW50TGVuZ3RoID1cclxuICAgICAgKGZpbGUub3B0aW9uWydjb21tZW50J10pID8gZmlsZS5vcHRpb25bJ2NvbW1lbnQnXS5sZW5ndGggOiAwO1xyXG5cclxuICAgIC8vIOWcp+e4ruOBleOCjOOBpuOBhOOBquOBi+OBo+OBn+OCieWcp+e4rlxyXG4gICAgaWYgKCFmaWxlLmNvbXByZXNzZWQpIHtcclxuICAgICAgLy8g5Zyn57iu5YmN44GrIENSQzMyIOOBruioiOeul+OCkuOBl+OBpuOBiuOBj1xyXG4gICAgICBmaWxlLmNyYzMyID0gWmxpYi5DUkMzMi5jYWxjKGZpbGUuYnVmZmVyKTtcclxuXHJcbiAgICAgIHN3aXRjaCAoZmlsZS5vcHRpb25bJ2NvbXByZXNzaW9uTWV0aG9kJ10pIHtcclxuICAgICAgICBjYXNlIFpsaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kLlNUT1JFOlxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxyXG4gICAgICAgICAgZmlsZS5idWZmZXIgPSB0aGlzLmRlZmxhdGVXaXRoT3B0aW9uKGZpbGUuYnVmZmVyLCBmaWxlLm9wdGlvbik7XHJcbiAgICAgICAgICBmaWxlLmNvbXByZXNzZWQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Q6JyArIGZpbGUub3B0aW9uWydjb21wcmVzc2lvbk1ldGhvZCddKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGVuY3J5cHRpb25cclxuICAgIGlmIChmaWxlLm9wdGlvblsncGFzc3dvcmQnXSAhPT0gdm9pZCAwfHwgdGhpcy5wYXNzd29yZCAhPT0gdm9pZCAwKSB7XHJcbiAgICAgIC8vIGluaXQgZW5jcnlwdGlvblxyXG4gICAgICBrZXkgPSB0aGlzLmNyZWF0ZUVuY3J5cHRpb25LZXkoZmlsZS5vcHRpb25bJ3Bhc3N3b3JkJ10gfHwgdGhpcy5wYXNzd29yZCk7XHJcblxyXG4gICAgICAvLyBhZGQgaGVhZGVyXHJcbiAgICAgIGJ1ZmZlciA9IGZpbGUuYnVmZmVyO1xyXG4gICAgICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcclxuICAgICAgICB0bXAgPSBuZXcgVWludDhBcnJheShidWZmZXIubGVuZ3RoICsgMTIpO1xyXG4gICAgICAgIHRtcC5zZXQoYnVmZmVyLCAxMik7XHJcbiAgICAgICAgYnVmZmVyID0gdG1wO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJ1ZmZlci51bnNoaWZ0KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGogPSAwOyBqIDwgMTI7ICsraikge1xyXG4gICAgICAgIGJ1ZmZlcltqXSA9IHRoaXMuZW5jb2RlKFxyXG4gICAgICAgICAga2V5LFxyXG4gICAgICAgICAgaSA9PT0gMTEgPyAoZmlsZS5jcmMzMiAmIDB4ZmYpIDogKE1hdGgucmFuZG9tKCkgKiAyNTYgfCAwKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGRhdGEgZW5jcnlwdGlvblxyXG4gICAgICBmb3IgKGpsID0gYnVmZmVyLmxlbmd0aDsgaiA8IGpsOyArK2opIHtcclxuICAgICAgICBidWZmZXJbal0gPSB0aGlzLmVuY29kZShrZXksIGJ1ZmZlcltqXSk7XHJcbiAgICAgIH1cclxuICAgICAgZmlsZS5idWZmZXIgPSBidWZmZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5b+F6KaB44OQ44OD44OV44Kh44K144Kk44K644Gu6KiI566XXHJcbiAgICBsb2NhbEZpbGVTaXplICs9XHJcbiAgICAgIC8vIGxvY2FsIGZpbGUgaGVhZGVyXHJcbiAgICAgIDMwICsgZmlsZW5hbWVMZW5ndGggK1xyXG4gICAgICAvLyBmaWxlIGRhdGFcclxuICAgICAgZmlsZS5idWZmZXIubGVuZ3RoO1xyXG5cclxuICAgIGNlbnRyYWxEaXJlY3RvcnlTaXplICs9XHJcbiAgICAgIC8vIGZpbGUgaGVhZGVyXHJcbiAgICAgIDQ2ICsgZmlsZW5hbWVMZW5ndGggKyBjb21tZW50TGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLy8gZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5XHJcbiAgZW5kT2ZDZW50cmFsRGlyZWN0b3J5U2l6ZSA9IDQ2ICsgKHRoaXMuY29tbWVudCA/IHRoaXMuY29tbWVudC5sZW5ndGggOiAwKTtcclxuICBvdXRwdXQgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShcclxuICAgIGxvY2FsRmlsZVNpemUgKyBjZW50cmFsRGlyZWN0b3J5U2l6ZSArIGVuZE9mQ2VudHJhbERpcmVjdG9yeVNpemVcclxuICApO1xyXG4gIG9wMSA9IDA7XHJcbiAgb3AyID0gbG9jYWxGaWxlU2l6ZTtcclxuICBvcDMgPSBvcDIgKyBjZW50cmFsRGlyZWN0b3J5U2l6ZTtcclxuXHJcbiAgLy8g44OV44Kh44Kk44Or44Gu5Zyn57iuXHJcbiAgZm9yIChpID0gMCwgaWwgPSBmaWxlcy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XHJcbiAgICBmaWxlID0gZmlsZXNbaV07XHJcbiAgICBmaWxlbmFtZUxlbmd0aCA9XHJcbiAgICAgIGZpbGUub3B0aW9uWydmaWxlbmFtZSddID8gZmlsZS5vcHRpb25bJ2ZpbGVuYW1lJ10ubGVuZ3RoIDogIDA7XHJcbiAgICBleHRyYUZpZWxkTGVuZ3RoID0gMDsgLy8gVE9ET1xyXG4gICAgY29tbWVudExlbmd0aCA9XHJcbiAgICAgIGZpbGUub3B0aW9uWydjb21tZW50J10gPyBmaWxlLm9wdGlvblsnY29tbWVudCddLmxlbmd0aCA6IDA7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBsb2NhbCBmaWxlIGhlYWRlciAmIGZpbGUgaGVhZGVyXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvZmZzZXQgPSBvcDE7XHJcblxyXG4gICAgLy8gc2lnbmF0dXJlXHJcbiAgICAvLyBsb2NhbCBmaWxlIGhlYWRlclxyXG4gICAgb3V0cHV0W29wMSsrXSA9IFpsaWIuWmlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZVswXTtcclxuICAgIG91dHB1dFtvcDErK10gPSBabGliLlppcC5Mb2NhbEZpbGVIZWFkZXJTaWduYXR1cmVbMV07XHJcbiAgICBvdXRwdXRbb3AxKytdID0gWmxpYi5aaXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlWzJdO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IFpsaWIuWmlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZVszXTtcclxuICAgIC8vIGZpbGUgaGVhZGVyXHJcbiAgICBvdXRwdXRbb3AyKytdID0gWmxpYi5aaXAuRmlsZUhlYWRlclNpZ25hdHVyZVswXTtcclxuICAgIG91dHB1dFtvcDIrK10gPSBabGliLlppcC5GaWxlSGVhZGVyU2lnbmF0dXJlWzFdO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IFpsaWIuWmlwLkZpbGVIZWFkZXJTaWduYXR1cmVbMl07XHJcbiAgICBvdXRwdXRbb3AyKytdID0gWmxpYi5aaXAuRmlsZUhlYWRlclNpZ25hdHVyZVszXTtcclxuXHJcbiAgICAvLyBjb21wcmVzc29yIGluZm9cclxuICAgIG5lZWRWZXJzaW9uID0gMjA7XHJcbiAgICBvdXRwdXRbb3AyKytdID0gbmVlZFZlcnNpb24gJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMisrXSA9XHJcbiAgICAgIC8qKiBAdHlwZSB7WmxpYi5aaXAuT3BlcmF0aW5nU3lzdGVtfSAqL1xyXG4gICAgICAoZmlsZS5vcHRpb25bJ29zJ10pIHx8XHJcbiAgICAgIFpsaWIuWmlwLk9wZXJhdGluZ1N5c3RlbS5NU0RPUztcclxuXHJcbiAgICAvLyBuZWVkIHZlcnNpb25cclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gIG5lZWRWZXJzaW9uICAgICAgICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKG5lZWRWZXJzaW9uID4+IDgpICYgMHhmZjtcclxuXHJcbiAgICAvLyBnZW5lcmFsIHB1cnBvc2UgYml0IGZsYWdcclxuICAgIGZsYWdzID0gMDtcclxuICAgIGlmIChmaWxlLm9wdGlvblsncGFzc3dvcmQnXSB8fCB0aGlzLnBhc3N3b3JkKSB7XHJcbiAgICAgIGZsYWdzIHw9IFpsaWIuWmlwLkZsYWdzLkVOQ1JZUFQ7XHJcbiAgICB9XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9ICBmbGFncyAgICAgICAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChmbGFncyA+PiA4KSAmIDB4ZmY7XHJcblxyXG4gICAgLy8gY29tcHJlc3Npb24gbWV0aG9kXHJcbiAgICBjb21wcmVzc2lvbk1ldGhvZCA9XHJcbiAgICAgIC8qKiBAdHlwZSB7WmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2R9ICovXHJcbiAgICAgIChmaWxlLm9wdGlvblsnY29tcHJlc3Npb25NZXRob2QnXSk7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9ICBjb21wcmVzc2lvbk1ldGhvZCAgICAgICAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChjb21wcmVzc2lvbk1ldGhvZCA+PiA4KSAmIDB4ZmY7XHJcblxyXG4gICAgLy8gZGF0ZVxyXG4gICAgZGF0ZSA9IC8qKiBAdHlwZSB7KERhdGV8dW5kZWZpbmVkKX0gKi8oZmlsZS5vcHRpb25bJ2RhdGUnXSkgfHwgbmV3IERhdGUoKTtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID1cclxuICAgICAgKChkYXRlLmdldE1pbnV0ZXMoKSAmIDB4NykgPDwgNSkgfFxyXG4gICAgICAoZGF0ZS5nZXRTZWNvbmRzKCkgLyAyIHwgMCk7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9XHJcbiAgICAgIChkYXRlLmdldEhvdXJzKCkgICA8PCAzKSB8XHJcbiAgICAgIChkYXRlLmdldE1pbnV0ZXMoKSA+PiAzKTtcclxuICAgIC8vXHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9XHJcbiAgICAgICgoZGF0ZS5nZXRNb250aCgpICsgMSAmIDB4NykgPDwgNSkgfFxyXG4gICAgICAoZGF0ZS5nZXREYXRlKCkpO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPVxyXG4gICAgICAoKGRhdGUuZ2V0RnVsbFllYXIoKSAtIDE5ODAgJiAweDdmKSA8PCAxKSB8XHJcbiAgICAgIChkYXRlLmdldE1vbnRoKCkgKyAxID4+IDMpO1xyXG5cclxuICAgIC8vIENSQy0zMlxyXG4gICAgY3JjMzIgPSBmaWxlLmNyYzMyO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAgY3JjMzIgICAgICAgICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKGNyYzMyID4+ICA4KSAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChjcmMzMiA+PiAxNikgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAoY3JjMzIgPj4gMjQpICYgMHhmZjtcclxuXHJcbiAgICAvLyBjb21wcmVzc2VkIHNpemVcclxuICAgIHNpemUgPSBmaWxlLmJ1ZmZlci5sZW5ndGg7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9ICBzaXplICAgICAgICAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChzaXplID4+ICA4KSAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChzaXplID4+IDE2KSAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChzaXplID4+IDI0KSAmIDB4ZmY7XHJcblxyXG4gICAgLy8gdW5jb21wcmVzc2VkIHNpemVcclxuICAgIHBsYWluU2l6ZSA9IGZpbGUuc2l6ZTtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gIHBsYWluU2l6ZSAgICAgICAgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAocGxhaW5TaXplID4+ICA4KSAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChwbGFpblNpemUgPj4gMTYpICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKHBsYWluU2l6ZSA+PiAyNCkgJiAweGZmO1xyXG5cclxuICAgIC8vIGZpbGVuYW1lIGxlbmd0aFxyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAgZmlsZW5hbWVMZW5ndGggICAgICAgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAoZmlsZW5hbWVMZW5ndGggPj4gOCkgJiAweGZmO1xyXG5cclxuICAgIC8vIGV4dHJhIGZpZWxkIGxlbmd0aFxyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAgZXh0cmFGaWVsZExlbmd0aCAgICAgICAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChleHRyYUZpZWxkTGVuZ3RoID4+IDgpICYgMHhmZjtcclxuXHJcbiAgICAvLyBmaWxlIGNvbW1lbnQgbGVuZ3RoXHJcbiAgICBvdXRwdXRbb3AyKytdID0gIGNvbW1lbnRMZW5ndGggICAgICAgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IChjb21tZW50TGVuZ3RoID4+IDgpICYgMHhmZjtcclxuXHJcbiAgICAvLyBkaXNrIG51bWJlciBzdGFydFxyXG4gICAgb3V0cHV0W29wMisrXSA9IDA7XHJcbiAgICBvdXRwdXRbb3AyKytdID0gMDtcclxuXHJcbiAgICAvLyBpbnRlcm5hbCBmaWxlIGF0dHJpYnV0ZXNcclxuICAgIG91dHB1dFtvcDIrK10gPSAwO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IDA7XHJcblxyXG4gICAgLy8gZXh0ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXHJcbiAgICBvdXRwdXRbb3AyKytdID0gMDtcclxuICAgIG91dHB1dFtvcDIrK10gPSAwO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IDA7XHJcbiAgICBvdXRwdXRbb3AyKytdID0gMDtcclxuXHJcbiAgICAvLyByZWxhdGl2ZSBvZmZzZXQgb2YgbG9jYWwgaGVhZGVyXHJcbiAgICBvdXRwdXRbb3AyKytdID0gIG9mZnNldCAgICAgICAgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IChvZmZzZXQgPj4gIDgpICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDIrK10gPSAob2Zmc2V0ID4+IDE2KSAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AyKytdID0gKG9mZnNldCA+PiAyNCkgJiAweGZmO1xyXG5cclxuICAgIC8vIGZpbGVuYW1lXHJcbiAgICBmaWxlbmFtZSA9IGZpbGUub3B0aW9uWydmaWxlbmFtZSddO1xyXG4gICAgaWYgKGZpbGVuYW1lKSB7XHJcbiAgICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xyXG4gICAgICAgIG91dHB1dC5zZXQoZmlsZW5hbWUsIG9wMSk7XHJcbiAgICAgICAgb3V0cHV0LnNldChmaWxlbmFtZSwgb3AyKTtcclxuICAgICAgICBvcDEgKz0gZmlsZW5hbWVMZW5ndGg7XHJcbiAgICAgICAgb3AyICs9IGZpbGVuYW1lTGVuZ3RoO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBmaWxlbmFtZUxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IGZpbGVuYW1lW2pdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGV4dHJhIGZpZWxkXHJcbiAgICBleHRyYUZpZWxkID0gZmlsZS5vcHRpb25bJ2V4dHJhRmllbGQnXTtcclxuICAgIGlmIChleHRyYUZpZWxkKSB7XHJcbiAgICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xyXG4gICAgICAgIG91dHB1dC5zZXQoZXh0cmFGaWVsZCwgb3AxKTtcclxuICAgICAgICBvdXRwdXQuc2V0KGV4dHJhRmllbGQsIG9wMik7XHJcbiAgICAgICAgb3AxICs9IGV4dHJhRmllbGRMZW5ndGg7XHJcbiAgICAgICAgb3AyICs9IGV4dHJhRmllbGRMZW5ndGg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGNvbW1lbnRMZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSBleHRyYUZpZWxkW2pdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvbW1lbnRcclxuICAgIGNvbW1lbnQgPSBmaWxlLm9wdGlvblsnY29tbWVudCddO1xyXG4gICAgaWYgKGNvbW1lbnQpIHtcclxuICAgICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XHJcbiAgICAgICAgb3V0cHV0LnNldChjb21tZW50LCBvcDIpO1xyXG4gICAgICAgIG9wMiArPSBjb21tZW50TGVuZ3RoO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBjb21tZW50TGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgIG91dHB1dFtvcDIrK10gPSBjb21tZW50W2pdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gZmlsZSBkYXRhXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcclxuICAgICAgb3V0cHV0LnNldChmaWxlLmJ1ZmZlciwgb3AxKTtcclxuICAgICAgb3AxICs9IGZpbGUuYnVmZmVyLmxlbmd0aDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAoaiA9IDAsIGpsID0gZmlsZS5idWZmZXIubGVuZ3RoOyBqIDwgamw7ICsraikge1xyXG4gICAgICAgIG91dHB1dFtvcDErK10gPSBmaWxlLmJ1ZmZlcltqXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5XHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8vIHNpZ25hdHVyZVxyXG4gIG91dHB1dFtvcDMrK10gPSBabGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzBdO1xyXG4gIG91dHB1dFtvcDMrK10gPSBabGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzFdO1xyXG4gIG91dHB1dFtvcDMrK10gPSBabGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzJdO1xyXG4gIG91dHB1dFtvcDMrK10gPSBabGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzNdO1xyXG5cclxuICAvLyBudW1iZXIgb2YgdGhpcyBkaXNrXHJcbiAgb3V0cHV0W29wMysrXSA9IDA7XHJcbiAgb3V0cHV0W29wMysrXSA9IDA7XHJcblxyXG4gIC8vIG51bWJlciBvZiB0aGUgZGlzayB3aXRoIHRoZSBzdGFydCBvZiB0aGUgY2VudHJhbCBkaXJlY3RvcnlcclxuICBvdXRwdXRbb3AzKytdID0gMDtcclxuICBvdXRwdXRbb3AzKytdID0gMDtcclxuXHJcbiAgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXMgaW4gdGhlIGNlbnRyYWwgZGlyZWN0b3J5IG9uIHRoaXMgZGlza1xyXG4gIG91dHB1dFtvcDMrK10gPSAgaWwgICAgICAgJiAweGZmO1xyXG4gIG91dHB1dFtvcDMrK10gPSAoaWwgPj4gOCkgJiAweGZmO1xyXG5cclxuICAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllcyBpbiB0aGUgY2VudHJhbCBkaXJlY3RvcnlcclxuICBvdXRwdXRbb3AzKytdID0gIGlsICAgICAgICYgMHhmZjtcclxuICBvdXRwdXRbb3AzKytdID0gKGlsID4+IDgpICYgMHhmZjtcclxuXHJcbiAgLy8gc2l6ZSBvZiB0aGUgY2VudHJhbCBkaXJlY3RvcnlcclxuICBvdXRwdXRbb3AzKytdID0gIGNlbnRyYWxEaXJlY3RvcnlTaXplICAgICAgICAmIDB4ZmY7XHJcbiAgb3V0cHV0W29wMysrXSA9IChjZW50cmFsRGlyZWN0b3J5U2l6ZSA+PiAgOCkgJiAweGZmO1xyXG4gIG91dHB1dFtvcDMrK10gPSAoY2VudHJhbERpcmVjdG9yeVNpemUgPj4gMTYpICYgMHhmZjtcclxuICBvdXRwdXRbb3AzKytdID0gKGNlbnRyYWxEaXJlY3RvcnlTaXplID4+IDI0KSAmIDB4ZmY7XHJcblxyXG4gIC8vIG9mZnNldCBvZiBzdGFydCBvZiBjZW50cmFsIGRpcmVjdG9yeSB3aXRoIHJlc3BlY3QgdG8gdGhlIHN0YXJ0aW5nIGRpc2sgbnVtYmVyXHJcbiAgb3V0cHV0W29wMysrXSA9ICBsb2NhbEZpbGVTaXplICAgICAgICAmIDB4ZmY7XHJcbiAgb3V0cHV0W29wMysrXSA9IChsb2NhbEZpbGVTaXplID4+ICA4KSAmIDB4ZmY7XHJcbiAgb3V0cHV0W29wMysrXSA9IChsb2NhbEZpbGVTaXplID4+IDE2KSAmIDB4ZmY7XHJcbiAgb3V0cHV0W29wMysrXSA9IChsb2NhbEZpbGVTaXplID4+IDI0KSAmIDB4ZmY7XHJcblxyXG4gIC8vIC5aSVAgZmlsZSBjb21tZW50IGxlbmd0aFxyXG4gIGNvbW1lbnRMZW5ndGggPSB0aGlzLmNvbW1lbnQgPyB0aGlzLmNvbW1lbnQubGVuZ3RoIDogMDtcclxuICBvdXRwdXRbb3AzKytdID0gIGNvbW1lbnRMZW5ndGggICAgICAgJiAweGZmO1xyXG4gIG91dHB1dFtvcDMrK10gPSAoY29tbWVudExlbmd0aCA+PiA4KSAmIDB4ZmY7XHJcblxyXG4gIC8vIC5aSVAgZmlsZSBjb21tZW50XHJcbiAgaWYgKHRoaXMuY29tbWVudCkge1xyXG4gICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XHJcbiAgICAgIG91dHB1dC5zZXQodGhpcy5jb21tZW50LCBvcDMpO1xyXG4gICAgICBvcDMgKz0gY29tbWVudExlbmd0aDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAoaiA9IDAsIGpsID0gY29tbWVudExlbmd0aDsgaiA8IGpsOyArK2opIHtcclxuICAgICAgICBvdXRwdXRbb3AzKytdID0gdGhpcy5jb21tZW50W2pdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gb3V0cHV0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5wdXRcclxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbnMuXHJcbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9XHJcbiAqL1xyXG5abGliLlppcC5wcm90b3R5cGUuZGVmbGF0ZVdpdGhPcHRpb24gPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xyXG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdEZWZsYXRlfSAqL1xyXG4gIHZhciBkZWZsYXRvciA9IG5ldyBabGliLlJhd0RlZmxhdGUoaW5wdXQsIG9wdF9wYXJhbXNbJ2RlZmxhdGVPcHRpb24nXSk7XHJcblxyXG4gIHJldHVybiBkZWZsYXRvci5jb21wcmVzcygpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0ga2V5XHJcbiAqIEByZXR1cm4ge251bWJlcn1cclxuICovXHJcblpsaWIuWmlwLnByb3RvdHlwZS5nZXRCeXRlID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIHRtcCA9ICgoa2V5WzJdICYgMHhmZmZmKSB8IDIpO1xyXG5cclxuICByZXR1cm4gKCh0bXAgKiAodG1wIF4gMSkpID4+IDgpICYgMHhmZjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0geyhBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheXxPYmplY3QpfSBrZXlcclxuICogQHBhcmFtIHtudW1iZXJ9IG5cclxuICogQHJldHVybiB7bnVtYmVyfVxyXG4gKi9cclxuWmxpYi5aaXAucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uKGtleSwgbikge1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciB0bXAgPSB0aGlzLmdldEJ5dGUoLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqLyhrZXkpKTtcclxuXHJcbiAgdGhpcy51cGRhdGVLZXlzKC8qKiBAdHlwZSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi8oa2V5KSwgbik7XHJcblxyXG4gIHJldHVybiB0bXAgXiBuO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0ga2V5XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBuXHJcbiAqL1xyXG5abGliLlppcC5wcm90b3R5cGUudXBkYXRlS2V5cyA9IGZ1bmN0aW9uKGtleSwgbikge1xyXG4gIGtleVswXSA9IFpsaWIuQ1JDMzIuc2luZ2xlKGtleVswXSwgbik7XHJcbiAga2V5WzFdID1cclxuICAgICgoKCgoa2V5WzFdICsgKGtleVswXSAmIDB4ZmYpKSAqIDIwMTczID4+PiAwKSAqIDY2ODEpID4+PiAwKSArIDEpID4+PiAwO1xyXG4gIGtleVsyXSA9IFpsaWIuQ1JDMzIuc2luZ2xlKGtleVsyXSwga2V5WzFdID4+PiAyNCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IHBhc3N3b3JkXHJcbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXl8T2JqZWN0KX1cclxuICovXHJcblpsaWIuWmlwLnByb3RvdHlwZS5jcmVhdGVFbmNyeXB0aW9uS2V5ID0gZnVuY3Rpb24ocGFzc3dvcmQpIHtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqL1xyXG4gIHZhciBrZXkgPSBbMzA1NDE5ODk2LCA1OTE3NTEwNDksIDg3ODA4MjE5Ml07XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGk7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGlsO1xyXG5cclxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcclxuICAgIGtleSA9IG5ldyBVaW50MzJBcnJheShrZXkpO1xyXG4gIH1cclxuXHJcbiAgZm9yIChpID0gMCwgaWwgPSBwYXNzd29yZC5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XHJcbiAgICB0aGlzLnVwZGF0ZUtleXMoa2V5LCBwYXNzd29yZFtpXSAmIDB4ZmYpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGtleTtcclxufTtcclxuXHJcbn0pOyIsImdvb2cucHJvdmlkZSgnWmxpYi5VbnppcCcpO1xyXG5cclxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xyXG5nb29nLnJlcXVpcmUoJ1psaWIuUmF3SW5mbGF0ZScpO1xyXG5nb29nLnJlcXVpcmUoJ1psaWIuQ1JDMzInKTtcclxuZ29vZy5yZXF1aXJlKCdabGliLlppcCcpO1xyXG5cclxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGlucHV0IGlucHV0IGJ1ZmZlci5cclxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbnMuXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuWmxpYi5VbnppcCA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XHJcbiAgb3B0X3BhcmFtcyA9IG9wdF9wYXJhbXMgfHwge307XHJcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHRoaXMuaW5wdXQgPVxyXG4gICAgKFVTRV9UWVBFREFSUkFZICYmIChpbnB1dCBpbnN0YW5jZW9mIEFycmF5KSkgP1xyXG4gICAgbmV3IFVpbnQ4QXJyYXkoaW5wdXQpIDogaW5wdXQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5pcCA9IDA7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5lb2Nkck9mZnNldDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLm51bWJlck9mVGhpc0Rpc2s7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5zdGFydERpc2s7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy50b3RhbEVudHJpZXNUaGlzRGlzaztcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLnRvdGFsRW50cmllcztcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmNlbnRyYWxEaXJlY3RvcnlTaXplO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuY2VudHJhbERpcmVjdG9yeU9mZnNldDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmNvbW1lbnRMZW5ndGg7XHJcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdGhpcy5jb21tZW50O1xyXG4gIC8qKiBAdHlwZSB7QXJyYXkuPFpsaWIuVW56aXAuRmlsZUhlYWRlcj59ICovXHJcbiAgdGhpcy5maWxlSGVhZGVyTGlzdDtcclxuICAvKiogQHR5cGUge09iamVjdC48c3RyaW5nLCBudW1iZXI+fSAqL1xyXG4gIHRoaXMuZmlsZW5hbWVUb0luZGV4O1xyXG4gIC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cclxuICB0aGlzLnZlcmlmeSA9IG9wdF9wYXJhbXNbJ3ZlcmlmeSddIHx8IGZhbHNlO1xyXG4gIC8qKiBAdHlwZSB7KEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHRoaXMucGFzc3dvcmQgPSBvcHRfcGFyYW1zWydwYXNzd29yZCddO1xyXG59O1xyXG5cclxuWmxpYi5VbnppcC5Db21wcmVzc2lvbk1ldGhvZCA9IFpsaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kO1xyXG5cclxuLyoqXHJcbiAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cclxuICogQGNvbnN0XHJcbiAqL1xyXG5abGliLlVuemlwLkZpbGVIZWFkZXJTaWduYXR1cmUgPSBabGliLlppcC5GaWxlSGVhZGVyU2lnbmF0dXJlO1xyXG5cclxuLyoqXHJcbiAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cclxuICogQGNvbnN0XHJcbiAqL1xyXG5abGliLlVuemlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZSA9IFpsaWIuWmlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZTtcclxuXHJcbi8qKlxyXG4gKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XHJcbiAqIEBjb25zdFxyXG4gKi9cclxuWmxpYi5VbnppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlID0gWmxpYi5aaXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGlucHV0IGlucHV0IGJ1ZmZlci5cclxuICogQHBhcmFtIHtudW1iZXJ9IGlwIGlucHV0IHBvc2l0aW9uLlxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcblpsaWIuVW56aXAuRmlsZUhlYWRlciA9IGZ1bmN0aW9uKGlucHV0LCBpcCkge1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB0aGlzLmlucHV0ID0gaW5wdXQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5vZmZzZXQgPSBpcDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmxlbmd0aDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLnZlcnNpb247XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5vcztcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLm5lZWRWZXJzaW9uO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuZmxhZ3M7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5jb21wcmVzc2lvbjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLnRpbWU7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5kYXRlO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuY3JjMzI7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5jb21wcmVzc2VkU2l6ZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLnBsYWluU2l6ZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmZpbGVOYW1lTGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuZXh0cmFGaWVsZExlbmd0aDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmZpbGVDb21tZW50TGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuZGlza051bWJlclN0YXJ0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuaW50ZXJuYWxGaWxlQXR0cmlidXRlcztcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmV4dGVybmFsRmlsZUF0dHJpYnV0ZXM7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5yZWxhdGl2ZU9mZnNldDtcclxuICAvKiogQHR5cGUge3N0cmluZ30gKi9cclxuICB0aGlzLmZpbGVuYW1lO1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB0aGlzLmV4dHJhRmllbGQ7XHJcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHRoaXMuY29tbWVudDtcclxufTtcclxuXHJcblpsaWIuVW56aXAuRmlsZUhlYWRlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbigpIHtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaXAgPSB0aGlzLm9mZnNldDtcclxuXHJcbiAgLy8gY2VudHJhbCBmaWxlIGhlYWRlciBzaWduYXR1cmVcclxuICBpZiAoaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuRmlsZUhlYWRlclNpZ25hdHVyZVswXSB8fFxyXG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5GaWxlSGVhZGVyU2lnbmF0dXJlWzFdIHx8XHJcbiAgICAgIGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkZpbGVIZWFkZXJTaWduYXR1cmVbMl0gfHxcclxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuRmlsZUhlYWRlclNpZ25hdHVyZVszXSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpbGUgaGVhZGVyIHNpZ25hdHVyZScpO1xyXG4gIH1cclxuXHJcbiAgLy8gdmVyc2lvbiBtYWRlIGJ5XHJcbiAgdGhpcy52ZXJzaW9uID0gaW5wdXRbaXArK107XHJcbiAgdGhpcy5vcyA9IGlucHV0W2lwKytdO1xyXG5cclxuICAvLyB2ZXJzaW9uIG5lZWRlZCB0byBleHRyYWN0XHJcbiAgdGhpcy5uZWVkVmVyc2lvbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBnZW5lcmFsIHB1cnBvc2UgYml0IGZsYWdcclxuICB0aGlzLmZsYWdzID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxyXG4gIHRoaXMuY29tcHJlc3Npb24gPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gbGFzdCBtb2QgZmlsZSB0aW1lXHJcbiAgdGhpcy50aW1lID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vbGFzdCBtb2QgZmlsZSBkYXRlXHJcbiAgdGhpcy5kYXRlID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGNyYy0zMlxyXG4gIHRoaXMuY3JjMzIgPSAoXHJcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XHJcbiAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KVxyXG4gICkgPj4+IDA7XHJcblxyXG4gIC8vIGNvbXByZXNzZWQgc2l6ZVxyXG4gIHRoaXMuY29tcHJlc3NlZFNpemUgPSAoXHJcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XHJcbiAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KVxyXG4gICkgPj4+IDA7XHJcblxyXG4gIC8vIHVuY29tcHJlc3NlZCBzaXplXHJcbiAgdGhpcy5wbGFpblNpemUgPSAoXHJcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XHJcbiAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KVxyXG4gICkgPj4+IDA7XHJcblxyXG4gIC8vIGZpbGUgbmFtZSBsZW5ndGhcclxuICB0aGlzLmZpbGVOYW1lTGVuZ3RoID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGV4dHJhIGZpZWxkIGxlbmd0aFxyXG4gIHRoaXMuZXh0cmFGaWVsZExlbmd0aCA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBmaWxlIGNvbW1lbnQgbGVuZ3RoXHJcbiAgdGhpcy5maWxlQ29tbWVudExlbmd0aCA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBkaXNrIG51bWJlciBzdGFydFxyXG4gIHRoaXMuZGlza051bWJlclN0YXJ0ID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGludGVybmFsIGZpbGUgYXR0cmlidXRlc1xyXG4gIHRoaXMuaW50ZXJuYWxGaWxlQXR0cmlidXRlcyA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBleHRlcm5hbCBmaWxlIGF0dHJpYnV0ZXNcclxuICB0aGlzLmV4dGVybmFsRmlsZUF0dHJpYnV0ZXMgPVxyXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxyXG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNCk7XHJcblxyXG4gIC8vIHJlbGF0aXZlIG9mZnNldCBvZiBsb2NhbCBoZWFkZXJcclxuICB0aGlzLnJlbGF0aXZlT2Zmc2V0ID0gKFxyXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxyXG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcclxuICApID4+PiAwO1xyXG5cclxuICAvLyBmaWxlIG5hbWVcclxuICB0aGlzLmZpbGVuYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBVU0VfVFlQRURBUlJBWSA/XHJcbiAgICBpbnB1dC5zdWJhcnJheShpcCwgaXAgKz0gdGhpcy5maWxlTmFtZUxlbmd0aCkgOlxyXG4gICAgaW5wdXQuc2xpY2UoaXAsIGlwICs9IHRoaXMuZmlsZU5hbWVMZW5ndGgpXHJcbiAgKTtcclxuXHJcbiAgLy8gZXh0cmEgZmllbGRcclxuICB0aGlzLmV4dHJhRmllbGQgPSBVU0VfVFlQRURBUlJBWSA/XHJcbiAgICBpbnB1dC5zdWJhcnJheShpcCwgaXAgKz0gdGhpcy5leHRyYUZpZWxkTGVuZ3RoKSA6XHJcbiAgICBpbnB1dC5zbGljZShpcCwgaXAgKz0gdGhpcy5leHRyYUZpZWxkTGVuZ3RoKTtcclxuXHJcbiAgLy8gZmlsZSBjb21tZW50XHJcbiAgdGhpcy5jb21tZW50ID0gVVNFX1RZUEVEQVJSQVkgP1xyXG4gICAgaW5wdXQuc3ViYXJyYXkoaXAsIGlwICsgdGhpcy5maWxlQ29tbWVudExlbmd0aCkgOlxyXG4gICAgaW5wdXQuc2xpY2UoaXAsIGlwICsgdGhpcy5maWxlQ29tbWVudExlbmd0aCk7XHJcblxyXG4gIHRoaXMubGVuZ3RoID0gaXAgLSB0aGlzLm9mZnNldDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGlucHV0IGlucHV0IGJ1ZmZlci5cclxuICogQHBhcmFtIHtudW1iZXJ9IGlwIGlucHV0IHBvc2l0aW9uLlxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcblpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyID0gZnVuY3Rpb24oaW5wdXQsIGlwKSB7XHJcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHRoaXMuaW5wdXQgPSBpbnB1dDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLm9mZnNldCA9IGlwO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMubGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMubmVlZFZlcnNpb247XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5mbGFncztcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmNvbXByZXNzaW9uO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMudGltZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmRhdGU7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5jcmMzMjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmNvbXByZXNzZWRTaXplO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMucGxhaW5TaXplO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuZmlsZU5hbWVMZW5ndGg7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5leHRyYUZpZWxkTGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xyXG4gIHRoaXMuZmlsZW5hbWU7XHJcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHRoaXMuZXh0cmFGaWVsZDtcclxufTtcclxuXHJcblpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyLkZsYWdzID0gWmxpYi5aaXAuRmxhZ3M7XHJcblxyXG5abGliLlVuemlwLkxvY2FsRmlsZUhlYWRlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbigpIHtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaXAgPSB0aGlzLm9mZnNldDtcclxuXHJcbiAgLy8gbG9jYWwgZmlsZSBoZWFkZXIgc2lnbmF0dXJlXHJcbiAgaWYgKGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZVswXSB8fFxyXG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXJTaWduYXR1cmVbMV0gfHxcclxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlWzJdIHx8XHJcbiAgICAgIGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZVszXSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGxvY2FsIGZpbGUgaGVhZGVyIHNpZ25hdHVyZScpO1xyXG4gIH1cclxuXHJcbiAgLy8gdmVyc2lvbiBuZWVkZWQgdG8gZXh0cmFjdFxyXG4gIHRoaXMubmVlZFZlcnNpb24gPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gZ2VuZXJhbCBwdXJwb3NlIGJpdCBmbGFnXHJcbiAgdGhpcy5mbGFncyA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBjb21wcmVzc2lvbiBtZXRob2RcclxuICB0aGlzLmNvbXByZXNzaW9uID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGxhc3QgbW9kIGZpbGUgdGltZVxyXG4gIHRoaXMudGltZSA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvL2xhc3QgbW9kIGZpbGUgZGF0ZVxyXG4gIHRoaXMuZGF0ZSA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBjcmMtMzJcclxuICB0aGlzLmNyYzMyID0gKFxyXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxyXG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcclxuICApID4+PiAwO1xyXG5cclxuICAvLyBjb21wcmVzc2VkIHNpemVcclxuICB0aGlzLmNvbXByZXNzZWRTaXplID0gKFxyXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxyXG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcclxuICApID4+PiAwO1xyXG5cclxuICAvLyB1bmNvbXByZXNzZWQgc2l6ZVxyXG4gIHRoaXMucGxhaW5TaXplID0gKFxyXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxyXG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcclxuICApID4+PiAwO1xyXG5cclxuICAvLyBmaWxlIG5hbWUgbGVuZ3RoXHJcbiAgdGhpcy5maWxlTmFtZUxlbmd0aCA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBleHRyYSBmaWVsZCBsZW5ndGhcclxuICB0aGlzLmV4dHJhRmllbGRMZW5ndGggPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gZmlsZSBuYW1lXHJcbiAgdGhpcy5maWxlbmFtZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgVVNFX1RZUEVEQVJSQVkgP1xyXG4gICAgaW5wdXQuc3ViYXJyYXkoaXAsIGlwICs9IHRoaXMuZmlsZU5hbWVMZW5ndGgpIDpcclxuICAgIGlucHV0LnNsaWNlKGlwLCBpcCArPSB0aGlzLmZpbGVOYW1lTGVuZ3RoKVxyXG4gICk7XHJcblxyXG4gIC8vIGV4dHJhIGZpZWxkXHJcbiAgdGhpcy5leHRyYUZpZWxkID0gVVNFX1RZUEVEQVJSQVkgP1xyXG4gICAgaW5wdXQuc3ViYXJyYXkoaXAsIGlwICs9IHRoaXMuZXh0cmFGaWVsZExlbmd0aCkgOlxyXG4gICAgaW5wdXQuc2xpY2UoaXAsIGlwICs9IHRoaXMuZXh0cmFGaWVsZExlbmd0aCk7XHJcblxyXG4gIHRoaXMubGVuZ3RoID0gaXAgLSB0aGlzLm9mZnNldDtcclxufTtcclxuXHJcblxyXG5abGliLlVuemlwLnByb3RvdHlwZS5zZWFyY2hFbmRPZkNlbnRyYWxEaXJlY3RvcnlSZWNvcmQgPSBmdW5jdGlvbigpIHtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaXA7XHJcblxyXG4gIGZvciAoaXAgPSBpbnB1dC5sZW5ndGggLSAxMjsgaXAgPiAwOyAtLWlwKSB7XHJcbiAgICBpZiAoaW5wdXRbaXAgIF0gPT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVswXSAmJlxyXG4gICAgICAgIGlucHV0W2lwKzFdID09PSBabGliLlVuemlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbMV0gJiZcclxuICAgICAgICBpbnB1dFtpcCsyXSA9PT0gWmxpYi5VbnppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzJdICYmXHJcbiAgICAgICAgaW5wdXRbaXArM10gPT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVszXSkge1xyXG4gICAgICB0aGlzLmVvY2RyT2Zmc2V0ID0gaXA7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHRocm93IG5ldyBFcnJvcignRW5kIG9mIENlbnRyYWwgRGlyZWN0b3J5IFJlY29yZCBub3QgZm91bmQnKTtcclxufTtcclxuXHJcblpsaWIuVW56aXAucHJvdG90eXBlLnBhcnNlRW5kT2ZDZW50cmFsRGlyZWN0b3J5UmVjb3JkID0gZnVuY3Rpb24oKSB7XHJcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGlwO1xyXG5cclxuICBpZiAoIXRoaXMuZW9jZHJPZmZzZXQpIHtcclxuICAgIHRoaXMuc2VhcmNoRW5kT2ZDZW50cmFsRGlyZWN0b3J5UmVjb3JkKCk7XHJcbiAgfVxyXG4gIGlwID0gdGhpcy5lb2Nkck9mZnNldDtcclxuXHJcbiAgLy8gc2lnbmF0dXJlXHJcbiAgaWYgKGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbMF0gfHxcclxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVsxXSB8fFxyXG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzJdIHx8XHJcbiAgICAgIGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbM10pIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzaWduYXR1cmUnKTtcclxuICB9XHJcblxyXG4gIC8vIG51bWJlciBvZiB0aGlzIGRpc2tcclxuICB0aGlzLm51bWJlck9mVGhpc0Rpc2sgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gbnVtYmVyIG9mIHRoZSBkaXNrIHdpdGggdGhlIHN0YXJ0IG9mIHRoZSBjZW50cmFsIGRpcmVjdG9yeVxyXG4gIHRoaXMuc3RhcnREaXNrID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzIGluIHRoZSBjZW50cmFsIGRpcmVjdG9yeSBvbiB0aGlzIGRpc2tcclxuICB0aGlzLnRvdGFsRW50cmllc1RoaXNEaXNrID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzIGluIHRoZSBjZW50cmFsIGRpcmVjdG9yeVxyXG4gIHRoaXMudG90YWxFbnRyaWVzID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIHNpemUgb2YgdGhlIGNlbnRyYWwgZGlyZWN0b3J5XHJcbiAgdGhpcy5jZW50cmFsRGlyZWN0b3J5U2l6ZSA9IChcclxuICAgIChpbnB1dFtpcCsrXSAgICAgICkgfCAoaW5wdXRbaXArK10gPDwgIDgpIHxcclxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXHJcbiAgKSA+Pj4gMDtcclxuXHJcbiAgLy8gb2Zmc2V0IG9mIHN0YXJ0IG9mIGNlbnRyYWwgZGlyZWN0b3J5IHdpdGggcmVzcGVjdCB0byB0aGUgc3RhcnRpbmcgZGlzayBudW1iZXJcclxuICB0aGlzLmNlbnRyYWxEaXJlY3RvcnlPZmZzZXQgPSAoXHJcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XHJcbiAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KVxyXG4gICkgPj4+IDA7XHJcblxyXG4gIC8vIC5aSVAgZmlsZSBjb21tZW50IGxlbmd0aFxyXG4gIHRoaXMuY29tbWVudExlbmd0aCA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyAuWklQIGZpbGUgY29tbWVudFxyXG4gIHRoaXMuY29tbWVudCA9IFVTRV9UWVBFREFSUkFZID9cclxuICAgIGlucHV0LnN1YmFycmF5KGlwLCBpcCArIHRoaXMuY29tbWVudExlbmd0aCkgOlxyXG4gICAgaW5wdXQuc2xpY2UoaXAsIGlwICsgdGhpcy5jb21tZW50TGVuZ3RoKTtcclxufTtcclxuXHJcblpsaWIuVW56aXAucHJvdG90eXBlLnBhcnNlRmlsZUhlYWRlciA9IGZ1bmN0aW9uKCkge1xyXG4gIC8qKiBAdHlwZSB7QXJyYXkuPFpsaWIuVW56aXAuRmlsZUhlYWRlcj59ICovXHJcbiAgdmFyIGZpbGVsaXN0ID0gW107XHJcbiAgLyoqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgbnVtYmVyPn0gKi9cclxuICB2YXIgZmlsZXRhYmxlID0ge307XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGlwO1xyXG4gIC8qKiBAdHlwZSB7WmxpYi5VbnppcC5GaWxlSGVhZGVyfSAqL1xyXG4gIHZhciBmaWxlSGVhZGVyO1xyXG4gIC8qOiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpO1xyXG4gIC8qOiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpbDtcclxuXHJcbiAgaWYgKHRoaXMuZmlsZUhlYWRlckxpc3QpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmICh0aGlzLmNlbnRyYWxEaXJlY3RvcnlPZmZzZXQgPT09IHZvaWQgMCkge1xyXG4gICAgdGhpcy5wYXJzZUVuZE9mQ2VudHJhbERpcmVjdG9yeVJlY29yZCgpO1xyXG4gIH1cclxuICBpcCA9IHRoaXMuY2VudHJhbERpcmVjdG9yeU9mZnNldDtcclxuXHJcbiAgZm9yIChpID0gMCwgaWwgPSB0aGlzLnRvdGFsRW50cmllczsgaSA8IGlsOyArK2kpIHtcclxuICAgIGZpbGVIZWFkZXIgPSBuZXcgWmxpYi5VbnppcC5GaWxlSGVhZGVyKHRoaXMuaW5wdXQsIGlwKTtcclxuICAgIGZpbGVIZWFkZXIucGFyc2UoKTtcclxuICAgIGlwICs9IGZpbGVIZWFkZXIubGVuZ3RoO1xyXG4gICAgZmlsZWxpc3RbaV0gPSBmaWxlSGVhZGVyO1xyXG4gICAgZmlsZXRhYmxlW2ZpbGVIZWFkZXIuZmlsZW5hbWVdID0gaTtcclxuICB9XHJcblxyXG4gIGlmICh0aGlzLmNlbnRyYWxEaXJlY3RvcnlTaXplIDwgaXAgLSB0aGlzLmNlbnRyYWxEaXJlY3RvcnlPZmZzZXQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaWxlIGhlYWRlciBzaXplJyk7XHJcbiAgfVxyXG5cclxuICB0aGlzLmZpbGVIZWFkZXJMaXN0ID0gZmlsZWxpc3Q7XHJcbiAgdGhpcy5maWxlbmFtZVRvSW5kZXggPSBmaWxldGFibGU7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGZpbGUgaGVhZGVyIGluZGV4LlxyXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXNcclxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gZmlsZSBkYXRhLlxyXG4gKi9cclxuWmxpYi5VbnppcC5wcm90b3R5cGUuZ2V0RmlsZURhdGEgPSBmdW5jdGlvbihpbmRleCwgb3B0X3BhcmFtcykge1xyXG4gIG9wdF9wYXJhbXMgPSBvcHRfcGFyYW1zIHx8IHt9O1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xyXG4gIC8qKiBAdHlwZSB7QXJyYXkuPFpsaWIuVW56aXAuRmlsZUhlYWRlcj59ICovXHJcbiAgdmFyIGZpbGVIZWFkZXJMaXN0ID0gdGhpcy5maWxlSGVhZGVyTGlzdDtcclxuICAvKiogQHR5cGUge1psaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyfSAqL1xyXG4gIHZhciBsb2NhbEZpbGVIZWFkZXI7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIG9mZnNldDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgbGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB2YXIgYnVmZmVyO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBjcmMzMjtcclxuICAvKiogQHR5cGUge0FycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5fE9iamVjdH0gKi9cclxuICB2YXIga2V5O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpbDtcclxuXHJcbiAgaWYgKCFmaWxlSGVhZGVyTGlzdCkge1xyXG4gICAgdGhpcy5wYXJzZUZpbGVIZWFkZXIoKTtcclxuICB9XHJcblxyXG4gIGlmIChmaWxlSGVhZGVyTGlzdFtpbmRleF0gPT09IHZvaWQgMCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCd3cm9uZyBpbmRleCcpO1xyXG4gIH1cclxuXHJcbiAgb2Zmc2V0ID0gZmlsZUhlYWRlckxpc3RbaW5kZXhdLnJlbGF0aXZlT2Zmc2V0O1xyXG4gIGxvY2FsRmlsZUhlYWRlciA9IG5ldyBabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlcih0aGlzLmlucHV0LCBvZmZzZXQpO1xyXG4gIGxvY2FsRmlsZUhlYWRlci5wYXJzZSgpO1xyXG4gIG9mZnNldCArPSBsb2NhbEZpbGVIZWFkZXIubGVuZ3RoO1xyXG4gIGxlbmd0aCA9IGxvY2FsRmlsZUhlYWRlci5jb21wcmVzc2VkU2l6ZTtcclxuXHJcbiAgLy8gZGVjcnlwdGlvblxyXG4gIGlmICgobG9jYWxGaWxlSGVhZGVyLmZsYWdzICYgWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXIuRmxhZ3MuRU5DUllQVCkgIT09IDApIHtcclxuICAgIGlmICghKG9wdF9wYXJhbXNbJ3Bhc3N3b3JkJ10gfHwgdGhpcy5wYXNzd29yZCkpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdwbGVhc2Ugc2V0IHBhc3N3b3JkJyk7XHJcbiAgICB9XHJcbiAgICBrZXkgPSAgdGhpcy5jcmVhdGVEZWNyeXB0aW9uS2V5KG9wdF9wYXJhbXNbJ3Bhc3N3b3JkJ10gfHwgdGhpcy5wYXNzd29yZCk7XHJcblxyXG4gICAgLy8gZW5jcnlwdGlvbiBoZWFkZXJcclxuICAgIGZvcihpID0gb2Zmc2V0LCBpbCA9IG9mZnNldCArIDEyOyBpIDwgaWw7ICsraSkge1xyXG4gICAgICB0aGlzLmRlY29kZShrZXksIGlucHV0W2ldKTtcclxuICAgIH1cclxuICAgIG9mZnNldCArPSAxMjtcclxuICAgIGxlbmd0aCAtPSAxMjtcclxuXHJcbiAgICAvLyBkZWNyeXB0aW9uXHJcbiAgICBmb3IgKGkgPSBvZmZzZXQsIGlsID0gb2Zmc2V0ICsgbGVuZ3RoOyBpIDwgaWw7ICsraSkge1xyXG4gICAgICBpbnB1dFtpXSA9IHRoaXMuZGVjb2RlKGtleSwgaW5wdXRbaV0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3dpdGNoIChsb2NhbEZpbGVIZWFkZXIuY29tcHJlc3Npb24pIHtcclxuICAgIGNhc2UgWmxpYi5VbnppcC5Db21wcmVzc2lvbk1ldGhvZC5TVE9SRTpcclxuICAgICAgYnVmZmVyID0gVVNFX1RZUEVEQVJSQVkgP1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc3ViYXJyYXkob2Zmc2V0LCBvZmZzZXQgKyBsZW5ndGgpIDpcclxuICAgICAgICB0aGlzLmlucHV0LnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgbGVuZ3RoKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIFpsaWIuVW56aXAuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTpcclxuICAgICAgYnVmZmVyID0gbmV3IFpsaWIuUmF3SW5mbGF0ZSh0aGlzLmlucHV0LCB7XHJcbiAgICAgICAgJ2luZGV4Jzogb2Zmc2V0LFxyXG4gICAgICAgICdidWZmZXJTaXplJzogbG9jYWxGaWxlSGVhZGVyLnBsYWluU2l6ZVxyXG4gICAgICB9KS5kZWNvbXByZXNzKCk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIGNvbXByZXNzaW9uIHR5cGUnKTtcclxuICB9XHJcblxyXG4gIGlmICh0aGlzLnZlcmlmeSkge1xyXG4gICAgY3JjMzIgPSBabGliLkNSQzMyLmNhbGMoYnVmZmVyKTtcclxuICAgIGlmIChsb2NhbEZpbGVIZWFkZXIuY3JjMzIgIT09IGNyYzMyKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAnd3JvbmcgY3JjOiBmaWxlPTB4JyArIGxvY2FsRmlsZUhlYWRlci5jcmMzMi50b1N0cmluZygxNikgK1xyXG4gICAgICAgICcsIGRhdGE9MHgnICsgY3JjMzIudG9TdHJpbmcoMTYpXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYnVmZmVyO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEByZXR1cm4ge0FycmF5LjxzdHJpbmc+fVxyXG4gKi9cclxuWmxpYi5VbnppcC5wcm90b3R5cGUuZ2V0RmlsZW5hbWVzID0gZnVuY3Rpb24oKSB7XHJcbiAgLyoqIEB0eXBlIHtBcnJheS48c3RyaW5nPn0gKi9cclxuICB2YXIgZmlsZW5hbWVMaXN0ID0gW107XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGk7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGlsO1xyXG4gIC8qKiBAdHlwZSB7QXJyYXkuPFpsaWIuVW56aXAuRmlsZUhlYWRlcj59ICovXHJcbiAgdmFyIGZpbGVIZWFkZXJMaXN0O1xyXG5cclxuICBpZiAoIXRoaXMuZmlsZUhlYWRlckxpc3QpIHtcclxuICAgIHRoaXMucGFyc2VGaWxlSGVhZGVyKCk7XHJcbiAgfVxyXG4gIGZpbGVIZWFkZXJMaXN0ID0gdGhpcy5maWxlSGVhZGVyTGlzdDtcclxuXHJcbiAgZm9yIChpID0gMCwgaWwgPSBmaWxlSGVhZGVyTGlzdC5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XHJcbiAgICBmaWxlbmFtZUxpc3RbaV0gPSBmaWxlSGVhZGVyTGlzdFtpXS5maWxlbmFtZTtcclxuICB9XHJcblxyXG4gIHJldHVybiBmaWxlbmFtZUxpc3Q7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIGV4dHJhY3QgZmlsZW5hbWUuXHJcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtc1xyXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBkZWNvbXByZXNzZWQgZGF0YS5cclxuICovXHJcblpsaWIuVW56aXAucHJvdG90eXBlLmRlY29tcHJlc3MgPSBmdW5jdGlvbihmaWxlbmFtZSwgb3B0X3BhcmFtcykge1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpbmRleDtcclxuXHJcbiAgaWYgKCF0aGlzLmZpbGVuYW1lVG9JbmRleCkge1xyXG4gICAgdGhpcy5wYXJzZUZpbGVIZWFkZXIoKTtcclxuICB9XHJcbiAgaW5kZXggPSB0aGlzLmZpbGVuYW1lVG9JbmRleFtmaWxlbmFtZV07XHJcblxyXG4gIGlmIChpbmRleCA9PT0gdm9pZCAwKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoZmlsZW5hbWUgKyAnIG5vdCBmb3VuZCcpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXMuZ2V0RmlsZURhdGEoaW5kZXgsIG9wdF9wYXJhbXMpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7KEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBwYXNzd29yZFxyXG4gKi9cclxuWmxpYi5VbnppcC5wcm90b3R5cGUuc2V0UGFzc3dvcmQgPSBmdW5jdGlvbihwYXNzd29yZCkge1xyXG4gIHRoaXMucGFzc3dvcmQgPSBwYXNzd29yZDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0geyhBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheXxPYmplY3QpfSBrZXlcclxuICogQHBhcmFtIHtudW1iZXJ9IG5cclxuICogQHJldHVybiB7bnVtYmVyfVxyXG4gKi9cclxuWmxpYi5VbnppcC5wcm90b3R5cGUuZGVjb2RlID0gZnVuY3Rpb24oa2V5LCBuKSB7XHJcbiAgbiBePSB0aGlzLmdldEJ5dGUoLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqLyhrZXkpKTtcclxuICB0aGlzLnVwZGF0ZUtleXMoLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqLyhrZXkpLCBuKTtcclxuXHJcbiAgcmV0dXJuIG47XHJcbn07XHJcblxyXG4vLyBjb21tb24gbWV0aG9kXHJcblpsaWIuVW56aXAucHJvdG90eXBlLnVwZGF0ZUtleXMgPSBabGliLlppcC5wcm90b3R5cGUudXBkYXRlS2V5cztcclxuWmxpYi5VbnppcC5wcm90b3R5cGUuY3JlYXRlRGVjcnlwdGlvbktleSA9IFpsaWIuWmlwLnByb3RvdHlwZS5jcmVhdGVFbmNyeXB0aW9uS2V5O1xyXG5abGliLlVuemlwLnByb3RvdHlwZS5nZXRCeXRlID0gWmxpYi5aaXAucHJvdG90eXBlLmdldEJ5dGU7XHJcblxyXG4vLyBlbmQgb2Ygc2NvcGVcclxufSk7XHJcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBabGliIG5hbWVzcGFjZS4gWmxpYiDjga7ku5Xmp5jjgavmupbmi6DjgZfjgZ/lnKfnuK7jga8gWmxpYi5EZWZsYXRlIOOBp+Wun+ijhVxuICog44GV44KM44Gm44GE44KLLiDjgZPjgozjga8gSW5mbGF0ZSDjgajjga7lhbHlrZjjgpLogIPmha7jgZfjgabjgYTjgovngrouXG4gKi9cblxuZ29vZy5wcm92aWRlKCdabGliJyk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBDb21wcmVzc2lvbiBNZXRob2RcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblpsaWIuQ29tcHJlc3Npb25NZXRob2QgPSB7XG4gIERFRkxBVEU6IDgsXG4gIFJFU0VSVkVEOiAxNVxufTtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERlZmxhdGUgKFJGQzE5NTEpIOWun+ijhS5cbiAqIERlZmxhdGXjgqLjg6vjgrTjg6rjgrrjg6DmnKzkvZPjga8gWmxpYi5SYXdEZWZsYXRlIOOBp+Wun+ijheOBleOCjOOBpuOBhOOCiy5cbiAqL1xuZ29vZy5wcm92aWRlKCdabGliLkRlZmxhdGUnKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuQWRsZXIzMicpO1xuZ29vZy5yZXF1aXJlKCdabGliLlJhd0RlZmxhdGUnKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBabGliIERlZmxhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBpbnB1dCDnrKblj7fljJbjgZnjgovlr77osaHjga4gYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtcyBvcHRpb24gcGFyYW1ldGVycy5cbiAqL1xuWmxpYi5EZWZsYXRlID0gZnVuY3Rpb24oaW5wdXQsIG9wdF9wYXJhbXMpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSAqL1xuICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gKi9cbiAgdGhpcy5vdXRwdXQgPVxuICAgIG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKFpsaWIuRGVmbGF0ZS5EZWZhdWx0QnVmZmVyU2l6ZSk7XG4gIC8qKiBAdHlwZSB7WmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZX0gKi9cbiAgdGhpcy5jb21wcmVzc2lvblR5cGUgPSBabGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkRZTkFNSUM7XG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdEZWZsYXRlfSAqL1xuICB0aGlzLnJhd0RlZmxhdGU7XG4gIC8qKiBAdHlwZSB7T2JqZWN0fSAqL1xuICB2YXIgcmF3RGVmbGF0ZU9wdGlvbiA9IHt9O1xuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgdmFyIHByb3A7XG5cbiAgLy8gb3B0aW9uIHBhcmFtZXRlcnNcbiAgaWYgKG9wdF9wYXJhbXMgfHwgIShvcHRfcGFyYW1zID0ge30pKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW1zWydjb21wcmVzc2lvblR5cGUnXSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRoaXMuY29tcHJlc3Npb25UeXBlID0gb3B0X3BhcmFtc1snY29tcHJlc3Npb25UeXBlJ107XG4gICAgfVxuICB9XG5cbiAgLy8gY29weSBvcHRpb25zXG4gIGZvciAocHJvcCBpbiBvcHRfcGFyYW1zKSB7XG4gICAgcmF3RGVmbGF0ZU9wdGlvbltwcm9wXSA9IG9wdF9wYXJhbXNbcHJvcF07XG4gIH1cblxuICAvLyBzZXQgcmF3LWRlZmxhdGUgb3V0cHV0IGJ1ZmZlclxuICByYXdEZWZsYXRlT3B0aW9uWydvdXRwdXRCdWZmZXInXSA9IHRoaXMub3V0cHV0O1xuXG4gIHRoaXMucmF3RGVmbGF0ZSA9IG5ldyBabGliLlJhd0RlZmxhdGUodGhpcy5pbnB1dCwgcmF3RGVmbGF0ZU9wdGlvbik7XG59O1xuXG4vKipcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn0g44OH44OV44Kp44Or44OI44OQ44OD44OV44Kh44K144Kk44K6LlxuICovXG5abGliLkRlZmxhdGUuRGVmYXVsdEJ1ZmZlclNpemUgPSAweDgwMDA7XG5cbi8qKlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZSA9IFpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGU7XG5cbi8qKlxuICog55u05o6l5Zyn57iu44Gr5o6b44GR44KLLlxuICogQHBhcmFtIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBpbnB1dCB0YXJnZXQgYnVmZmVyLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICogQHJldHVybiB7IShBcnJheXxVaW50OEFycmF5KX0gY29tcHJlc3NlZCBkYXRhIGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuRGVmbGF0ZS5jb21wcmVzcyA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XG4gIHJldHVybiAobmV3IFpsaWIuRGVmbGF0ZShpbnB1dCwgb3B0X3BhcmFtcykpLmNvbXByZXNzKCk7XG59O1xuXG4vKipcbiAqIERlZmxhdGUgQ29tcHJlc3Npb24uXG4gKiBAcmV0dXJuIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBjb21wcmVzc2VkIGRhdGEgYnl0ZSBhcnJheS5cbiAqL1xuWmxpYi5EZWZsYXRlLnByb3RvdHlwZS5jb21wcmVzcyA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge1psaWIuQ29tcHJlc3Npb25NZXRob2R9ICovXG4gIHZhciBjbTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBjaW5mbztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBjbWY7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgZmxnO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGZjaGVjaztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBmZGljdDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBmbGV2ZWw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgY2xldmVsO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGFkbGVyO1xuICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gIHZhciBlcnJvciA9IGZhbHNlO1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9ICovXG4gIHZhciBvdXRwdXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgcG9zID0gMDtcblxuICBvdXRwdXQgPSB0aGlzLm91dHB1dDtcblxuICAvLyBDb21wcmVzc2lvbiBNZXRob2QgYW5kIEZsYWdzXG4gIGNtID0gWmxpYi5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFO1xuICBzd2l0Y2ggKGNtKSB7XG4gICAgY2FzZSBabGliLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU6XG4gICAgICBjaW5mbyA9IE1hdGguTE9HMkUgKiBNYXRoLmxvZyhabGliLlJhd0RlZmxhdGUuV2luZG93U2l6ZSkgLSA4O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBjb21wcmVzc2lvbiBtZXRob2QnKTtcbiAgfVxuICBjbWYgPSAoY2luZm8gPDwgNCkgfCBjbTtcbiAgb3V0cHV0W3BvcysrXSA9IGNtZjtcblxuICAvLyBGbGFnc1xuICBmZGljdCA9IDA7XG4gIHN3aXRjaCAoY20pIHtcbiAgICBjYXNlIFpsaWIuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTpcbiAgICAgIHN3aXRjaCAodGhpcy5jb21wcmVzc2lvblR5cGUpIHtcbiAgICAgICAgY2FzZSBabGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlLk5PTkU6IGZsZXZlbCA9IDA7IGJyZWFrO1xuICAgICAgICBjYXNlIFpsaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRklYRUQ6IGZsZXZlbCA9IDE7IGJyZWFrO1xuICAgICAgICBjYXNlIFpsaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRFlOQU1JQzogZmxldmVsID0gMjsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgY29tcHJlc3Npb24gdHlwZScpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBjb21wcmVzc2lvbiBtZXRob2QnKTtcbiAgfVxuICBmbGcgPSAoZmxldmVsIDw8IDYpIHwgKGZkaWN0IDw8IDUpO1xuICBmY2hlY2sgPSAzMSAtIChjbWYgKiAyNTYgKyBmbGcpICUgMzE7XG4gIGZsZyB8PSBmY2hlY2s7XG4gIG91dHB1dFtwb3MrK10gPSBmbGc7XG5cbiAgLy8gQWRsZXItMzIgY2hlY2tzdW1cbiAgYWRsZXIgPSBabGliLkFkbGVyMzIodGhpcy5pbnB1dCk7XG5cbiAgdGhpcy5yYXdEZWZsYXRlLm9wID0gcG9zO1xuICBvdXRwdXQgPSB0aGlzLnJhd0RlZmxhdGUuY29tcHJlc3MoKTtcbiAgcG9zID0gb3V0cHV0Lmxlbmd0aDtcblxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICAvLyBzdWJhcnJheSDliIbjgpLlhYPjgavjgoLjganjgZlcbiAgICBvdXRwdXQgPSBuZXcgVWludDhBcnJheShvdXRwdXQuYnVmZmVyKTtcbiAgICAvLyBleHBhbmQgYnVmZmVyXG4gICAgaWYgKG91dHB1dC5sZW5ndGggPD0gcG9zICsgNCkge1xuICAgICAgdGhpcy5vdXRwdXQgPSBuZXcgVWludDhBcnJheShvdXRwdXQubGVuZ3RoICsgNCk7XG4gICAgICB0aGlzLm91dHB1dC5zZXQob3V0cHV0KTtcbiAgICAgIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuICAgIH1cbiAgICBvdXRwdXQgPSBvdXRwdXQuc3ViYXJyYXkoMCwgcG9zICsgNCk7XG4gIH1cblxuICAvLyBhZGxlcjMyXG4gIG91dHB1dFtwb3MrK10gPSAoYWRsZXIgPj4gMjQpICYgMHhmZjtcbiAgb3V0cHV0W3BvcysrXSA9IChhZGxlciA+PiAxNikgJiAweGZmO1xuICBvdXRwdXRbcG9zKytdID0gKGFkbGVyID4+ICA4KSAmIDB4ZmY7XG4gIG91dHB1dFtwb3MrK10gPSAoYWRsZXIgICAgICApICYgMHhmZjtcblxuICByZXR1cm4gb3V0cHV0O1xufTtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiZ29vZy5wcm92aWRlKCdabGliLmV4cG9ydE9iamVjdCcpO1xuXG5nb29nLnJlcXVpcmUoJ1psaWInKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuWmxpYi5leHBvcnRPYmplY3QgPSBmdW5jdGlvbihlbnVtU3RyaW5nLCBleHBvcnRLZXlWYWx1ZSkge1xuICAvKiogQHR5cGUge0FycmF5LjxzdHJpbmc+fSAqL1xuICB2YXIga2V5cztcbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gIHZhciBrZXk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbDtcblxuICBpZiAoT2JqZWN0LmtleXMpIHtcbiAgICBrZXlzID0gT2JqZWN0LmtleXMoZXhwb3J0S2V5VmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIGtleXMgPSBbXTtcbiAgICBpID0gMDtcbiAgICBmb3IgKGtleSBpbiBleHBvcnRLZXlWYWx1ZSkge1xuICAgICAga2V5c1tpKytdID0ga2V5O1xuICAgIH1cbiAgfVxuXG4gIGZvciAoaSA9IDAsIGlsID0ga2V5cy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAga2V5ID0ga2V5c1tpXTtcbiAgICBnb29nLmV4cG9ydFN5bWJvbChlbnVtU3RyaW5nICsgJy4nICsga2V5LCBleHBvcnRLZXlWYWx1ZVtrZXldKVxuICB9XG59O1xuXG59KTsiLCJnb29nLnByb3ZpZGUoJ1psaWIuSW5mbGF0ZVN0cmVhbScpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5nb29nLnJlcXVpcmUoJ1psaWInKTtcbi8vZ29vZy5yZXF1aXJlKCdabGliLkFkbGVyMzInKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5SYXdJbmZsYXRlU3RyZWFtJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQHBhcmFtIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSBpbnB1dCBkZWZsYXRlZCBidWZmZXIuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuWmxpYi5JbmZsYXRlU3RyZWFtID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSAqL1xuICB0aGlzLmlucHV0ID0gaW5wdXQgPT09IHZvaWQgMCA/IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKCkgOiBpbnB1dDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMuaXAgPSAwO1xuICAvKiogQHR5cGUge1psaWIuUmF3SW5mbGF0ZVN0cmVhbX0gKi9cbiAgdGhpcy5yYXdpbmZsYXRlID0gbmV3IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbSh0aGlzLmlucHV0LCB0aGlzLmlwKTtcbiAgLyoqIEB0eXBlIHtabGliLkNvbXByZXNzaW9uTWV0aG9kfSAqL1xuICB0aGlzLm1ldGhvZDtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSAqL1xuICB0aGlzLm91dHB1dCA9IHRoaXMucmF3aW5mbGF0ZS5vdXRwdXQ7XG59O1xuXG4vKipcbiAqIGRlY29tcHJlc3MuXG4gKiBAcmV0dXJuIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSBpbmZsYXRlZCBidWZmZXIuXG4gKi9cblpsaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb21wcmVzcyA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyLiAqL1xuICB2YXIgYnVmZmVyO1xuICAvKiogQHR5cGUge251bWJlcn0gYWRsZXItMzIgY2hlY2tzdW0gKi9cbiAgdmFyIGFkbGVyMzI7XG5cbiAgLy8g5paw44GX44GE5YWl5Yqb44KS5YWl5Yqb44OQ44OD44OV44Kh44Gr57WQ5ZCI44GZ44KLXG4gIC8vIFhYWCBBcnJheSwgVWludDhBcnJheSDjga7jg4Hjgqfjg4Pjgq/jgpLooYzjgYbjgYvnorroqo3jgZnjgotcbiAgaWYgKGlucHV0ICE9PSB2b2lkIDApIHtcbiAgICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICAgIHZhciB0bXAgPSBuZXcgVWludDhBcnJheSh0aGlzLmlucHV0Lmxlbmd0aCArIGlucHV0Lmxlbmd0aCk7XG4gICAgICB0bXAuc2V0KHRoaXMuaW5wdXQsIDApO1xuICAgICAgdG1wLnNldChpbnB1dCwgdGhpcy5pbnB1dC5sZW5ndGgpO1xuICAgICAgdGhpcy5pbnB1dCA9IHRtcDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pbnB1dCA9IHRoaXMuaW5wdXQuY29uY2F0KGlucHV0KTtcbiAgICB9XG4gIH1cblxuICBpZiAodGhpcy5tZXRob2QgPT09IHZvaWQgMCkge1xuICAgIGlmKHRoaXMucmVhZEhlYWRlcigpIDwgMCkge1xuICAgICAgcmV0dXJuIG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKCk7XG4gICAgfVxuICB9XG5cbiAgYnVmZmVyID0gdGhpcy5yYXdpbmZsYXRlLmRlY29tcHJlc3ModGhpcy5pbnB1dCwgdGhpcy5pcCk7XG4gIGlmICh0aGlzLnJhd2luZmxhdGUuaXAgIT09IDApIHtcbiAgICB0aGlzLmlucHV0ID0gVVNFX1RZUEVEQVJSQVkgP1xuICAgICAgdGhpcy5pbnB1dC5zdWJhcnJheSh0aGlzLnJhd2luZmxhdGUuaXApIDpcbiAgICAgIHRoaXMuaW5wdXQuc2xpY2UodGhpcy5yYXdpbmZsYXRlLmlwKTtcbiAgICB0aGlzLmlwID0gMDtcbiAgfVxuXG4gIC8vIHZlcmlmeSBhZGxlci0zMlxuICAvKlxuICBpZiAodGhpcy52ZXJpZnkpIHtcbiAgICBhZGxlcjMyID1cbiAgICAgIGlucHV0W3RoaXMuaXArK10gPDwgMjQgfCBpbnB1dFt0aGlzLmlwKytdIDw8IDE2IHxcbiAgICAgIGlucHV0W3RoaXMuaXArK10gPDwgOCB8IGlucHV0W3RoaXMuaXArK107XG5cbiAgICBpZiAoYWRsZXIzMiAhPT0gWmxpYi5BZGxlcjMyKGJ1ZmZlcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhZGxlci0zMiBjaGVja3N1bScpO1xuICAgIH1cbiAgfVxuICAqL1xuXG4gIHJldHVybiBidWZmZXI7XG59O1xuXG4vKipcbiAqIEByZXR1cm4geyEoVWludDhBcnJheXxBcnJheSl9IGN1cnJlbnQgb3V0cHV0IGJ1ZmZlci5cbiAqL1xuWmxpYi5JbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5nZXRCeXRlcyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yYXdpbmZsYXRlLmdldEJ5dGVzKCk7XG59O1xuXG5abGliLkluZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRIZWFkZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGlwID0gdGhpcy5pcDtcbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcblxuICAvLyBDb21wcmVzc2lvbiBNZXRob2QgYW5kIEZsYWdzXG4gIHZhciBjbWYgPSBpbnB1dFtpcCsrXTtcbiAgdmFyIGZsZyA9IGlucHV0W2lwKytdO1xuXG4gIGlmIChjbWYgPT09IHZvaWQgMCB8fCBmbGcgPT09IHZvaWQgMCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICBzd2l0Y2ggKGNtZiAmIDB4MGYpIHtcbiAgICBjYXNlIFpsaWIuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTpcbiAgICAgIHRoaXMubWV0aG9kID0gWmxpYi5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgY29tcHJlc3Npb24gbWV0aG9kJyk7XG4gIH1cblxuICAvLyBmY2hlY2tcbiAgaWYgKCgoY21mIDw8IDgpICsgZmxnKSAlIDMxICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZjaGVjayBmbGFnOicgKyAoKGNtZiA8PCA4KSArIGZsZykgJSAzMSk7XG4gIH1cblxuICAvLyBmZGljdCAobm90IHN1cHBvcnRlZClcbiAgaWYgKGZsZyAmIDB4MjApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZkaWN0IGZsYWcgaXMgbm90IHN1cHBvcnRlZCcpO1xuICB9XG5cbiAgdGhpcy5pcCA9IGlwO1xufTtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiZ29vZy5yZXF1aXJlKCdabGliLkFkbGVyMzInKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuQWRsZXIzMicsIFpsaWIuQWRsZXIzMik7XG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5BZGxlcjMyLnVwZGF0ZScsIFpsaWIuQWRsZXIzMi51cGRhdGUpO1xuIiwiZ29vZy5yZXF1aXJlKCdabGliLkNSQzMyJyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkNSQzMyJywgWmxpYi5DUkMzMik7XG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5DUkMzMi5jYWxjJywgWmxpYi5DUkMzMi5jYWxjKTtcbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkNSQzMyLnVwZGF0ZScsIFpsaWIuQ1JDMzIudXBkYXRlKTsiLCJnb29nLnJlcXVpcmUoJ1psaWIuRGVmbGF0ZScpO1xuZ29vZy5yZXF1aXJlKCdabGliLmV4cG9ydE9iamVjdCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5EZWZsYXRlJywgWmxpYi5EZWZsYXRlKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5EZWZsYXRlLmNvbXByZXNzJyxcbiAgWmxpYi5EZWZsYXRlLmNvbXByZXNzXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkRlZmxhdGUucHJvdG90eXBlLmNvbXByZXNzJyxcbiAgWmxpYi5EZWZsYXRlLnByb3RvdHlwZS5jb21wcmVzc1xuKTtcblpsaWIuZXhwb3J0T2JqZWN0KCdabGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlJywge1xuICAnTk9ORSc6IFpsaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuTk9ORSxcbiAgJ0ZJWEVEJzogWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5GSVhFRCxcbiAgJ0RZTkFNSUMnOiBabGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkRZTkFNSUNcbn0pO1xuIiwiZ29vZy5yZXF1aXJlKCdabGliLkd1bnppcCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5HdW56aXAnLCBabGliLkd1bnppcCk7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvbXByZXNzJyxcbiAgWmxpYi5HdW56aXAucHJvdG90eXBlLmRlY29tcHJlc3Ncbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuR3VuemlwLnByb3RvdHlwZS5nZXRNZW1iZXJzJyxcbiAgWmxpYi5HdW56aXAucHJvdG90eXBlLmdldE1lbWJlcnNcbik7XG4iLCJnb29nLnJlcXVpcmUoJ1psaWIuR3VuemlwTWVtYmVyJyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkd1bnppcE1lbWJlcicsIFpsaWIuR3VuemlwTWVtYmVyKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldE5hbWUnLFxuICBabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TmFtZVxuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldERhdGEnLFxuICBabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0RGF0YVxuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldE10aW1lJyxcbiAgWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldE10aW1lXG4pOyIsImdvb2cucmVxdWlyZSgnWmxpYi5HemlwJyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkd6aXAnLCBabGliLkd6aXApO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkd6aXAucHJvdG90eXBlLmNvbXByZXNzJyxcbiAgWmxpYi5HemlwLnByb3RvdHlwZS5jb21wcmVzc1xuKTsiLCJnb29nLnJlcXVpcmUoJ1psaWIuSW5mbGF0ZScpO1xuZ29vZy5yZXF1aXJlKCdabGliLmV4cG9ydE9iamVjdCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5JbmZsYXRlJywgWmxpYi5JbmZsYXRlKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5JbmZsYXRlLnByb3RvdHlwZS5kZWNvbXByZXNzJyxcbiAgWmxpYi5JbmZsYXRlLnByb3RvdHlwZS5kZWNvbXByZXNzXG4pO1xuWmxpYi5leHBvcnRPYmplY3QoJ1psaWIuSW5mbGF0ZS5CdWZmZXJUeXBlJywge1xuICAnQURBUFRJVkUnOiBabGliLkluZmxhdGUuQnVmZmVyVHlwZS5BREFQVElWRSxcbiAgJ0JMT0NLJzogWmxpYi5JbmZsYXRlLkJ1ZmZlclR5cGUuQkxPQ0tcbn0pO1xuIiwiZ29vZy5yZXF1aXJlKCdabGliLkluZmxhdGVTdHJlYW0nKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuSW5mbGF0ZVN0cmVhbScsIFpsaWIuSW5mbGF0ZVN0cmVhbSk7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb21wcmVzcycsXG4gIFpsaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb21wcmVzc1xuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5JbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5nZXRCeXRlcycsXG4gIFpsaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZ2V0Qnl0ZXNcbik7IiwiZ29vZy5yZXF1aXJlKCdabGliLlJhd0RlZmxhdGUnKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5leHBvcnRPYmplY3QnKTtcblxuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlJhd0RlZmxhdGUnLFxuICBabGliLlJhd0RlZmxhdGVcbik7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5jb21wcmVzcycsXG4gIFpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuY29tcHJlc3Ncbik7XG5cblpsaWIuZXhwb3J0T2JqZWN0KFxuICAnWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZScsXG4gIHtcbiAgICAnTk9ORSc6IFpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuTk9ORSxcbiAgICAnRklYRUQnOiBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkZJWEVELFxuICAgICdEWU5BTUlDJzogWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5EWU5BTUlDXG4gIH1cbik7XG4iLCJnb29nLnJlcXVpcmUoJ1psaWIuUmF3SW5mbGF0ZScpO1xuZ29vZy5yZXF1aXJlKCdabGliLmV4cG9ydE9iamVjdCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5SYXdJbmZsYXRlJywgWmxpYi5SYXdJbmZsYXRlKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5kZWNvbXByZXNzJyxcbiAgWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5kZWNvbXByZXNzXG4pO1xuWmxpYi5leHBvcnRPYmplY3QoJ1psaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlJywge1xuICAnQURBUFRJVkUnOiBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZS5BREFQVElWRSxcbiAgJ0JMT0NLJzogWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUuQkxPQ0tcbn0pO1xuIiwiZ29vZy5yZXF1aXJlKCdabGliLlJhd0luZmxhdGVTdHJlYW0nKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuUmF3SW5mbGF0ZVN0cmVhbScsIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbSk7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb21wcmVzcycsXG4gIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb21wcmVzc1xuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5nZXRCeXRlcycsXG4gIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZ2V0Qnl0ZXNcbik7IiwiZ29vZy5yZXF1aXJlKCdabGliLlVuemlwJyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLlVuemlwJywgWmxpYi5VbnppcCk7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuVW56aXAucHJvdG90eXBlLmRlY29tcHJlc3MnLFxuICBabGliLlVuemlwLnByb3RvdHlwZS5kZWNvbXByZXNzXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlVuemlwLnByb3RvdHlwZS5nZXRGaWxlbmFtZXMnLFxuICBabGliLlVuemlwLnByb3RvdHlwZS5nZXRGaWxlbmFtZXNcbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuVW56aXAucHJvdG90eXBlLnNldFBhc3N3b3JkJyxcbiAgWmxpYi5VbnppcC5wcm90b3R5cGUuc2V0UGFzc3dvcmRcbik7IiwiZ29vZy5yZXF1aXJlKCdabGliLlppcCcpO1xuZ29vZy5yZXF1aXJlKCdabGliLmV4cG9ydE9iamVjdCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuWmlwJyxcbiAgWmxpYi5aaXBcbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuWmlwLnByb3RvdHlwZS5hZGRGaWxlJyxcbiAgWmxpYi5aaXAucHJvdG90eXBlLmFkZEZpbGVcbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuWmlwLnByb3RvdHlwZS5jb21wcmVzcycsXG4gIFpsaWIuWmlwLnByb3RvdHlwZS5jb21wcmVzc1xuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5aaXAucHJvdG90eXBlLnNldFBhc3N3b3JkJyxcbiAgWmxpYi5aaXAucHJvdG90eXBlLnNldFBhc3N3b3JkXG4pO1xuWmxpYi5leHBvcnRPYmplY3QoXG4gJ1psaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kJywge1xuICAgICdTVE9SRSc6IFpsaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kLlNUT1JFLFxuICAgICdERUZMQVRFJzogWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURVxuICB9XG4pO1xuWmxpYi5leHBvcnRPYmplY3QoXG4gICdabGliLlppcC5PcGVyYXRpbmdTeXN0ZW0nLCB7XG4gICAgJ01TRE9TJzogWmxpYi5aaXAuT3BlcmF0aW5nU3lzdGVtLk1TRE9TLFxuICAgICdVTklYJzogWmxpYi5aaXAuT3BlcmF0aW5nU3lzdGVtLlVOSVgsXG4gICAgJ01BQ0lOVE9TSCc6IFpsaWIuWmlwLk9wZXJhdGluZ1N5c3RlbS5NQUNJTlRPU0hcbiAgfVxuKTtcbi8vIFRPRE86IERlZmxhdGUgT3B0aW9uIl19