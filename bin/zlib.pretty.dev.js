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
goog.provide("FixPhantomJSFunctionApplyBug_StringFromCharCode");
if(goog.global["Uint8Array"] !== void 0) {
  try {
    eval("String.fromCharCode.apply(null, new Uint8Array([0]));")
  }catch(e) {
    String.fromCharCode.apply = function(fromCharCodeApply) {
      return function(thisobj, args) {
        return fromCharCodeApply.call(String.fromCharCode, thisobj, Array.prototype.slice.call(args))
      }
    }(String.fromCharCode.apply)
  }
}
;goog.provide("Zlib.GunzipMember");
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
goog.require("FixPhantomJSFunctionApplyBug_StringFromCharCode");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TUEsTUFBTixHQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBc0I7ZUFDbEQ7YUFBTUEsTUFBTixLQUFpQixFQUFqQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDcEQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDcEQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEdBQWYsRUFBb0IsQ0FBcEIsQ0FBd0I7ZUFDckQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEdBQWYsRUFBb0IsQ0FBcEIsQ0FBd0I7ZUFDckQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEdBQWYsRUFBb0IsQ0FBcEIsQ0FBd0I7ZUFDckQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFB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dmVzL2Jhc2UuanMiLCJkZWZpbmUvdHlwZWRhcnJheS9oeWJyaWQuanMiLCJzcmMvYml0c3RyZWFtLmpzIiwic3JjL2NyYzMyLmpzIiwic3JjL2ZpeF9waGFudG9tanNfZnVuY3Rpb25fYXBwbHlfYnVnLmpzIiwic3JjL2d1bnppcF9tZW1iZXIuanMiLCJzcmMvaGVhcC5qcyIsInNyYy9odWZmbWFuLmpzIiwic3JjL3Jhd2RlZmxhdGUuanMiLCJzcmMvZ3ppcC5qcyIsInNyYy9yYXdpbmZsYXRlLmpzIiwic3JjL2d1bnppcC5qcyIsInNyYy9yYXdpbmZsYXRlX3N0cmVhbS5qcyIsInNyYy91dGlsLmpzIiwic3JjL2FkbGVyMzIuanMiLCJzcmMvaW5mbGF0ZS5qcyIsInNyYy96aXAuanMiLCJzcmMvdW56aXAuanMiLCJzcmMvemxpYi5qcyIsInNyYy9kZWZsYXRlLmpzIiwic3JjL2V4cG9ydF9vYmplY3QuanMiLCJzcmMvaW5mbGF0ZV9zdHJlYW0uanMiLCJleHBvcnQvYWRsZXIzMi5qcyIsImV4cG9ydC9jcmMzMi5qcyIsImV4cG9ydC9kZWZsYXRlLmpzIiwiZXhwb3J0L2d1bnppcC5qcyIsImV4cG9ydC9ndW56aXBfbWVtYmVyLmpzIiwiZXhwb3J0L2d6aXAuanMiLCJleHBvcnQvaW5mbGF0ZS5qcyIsImV4cG9ydC9pbmZsYXRlX3N0cmVhbS5qcyIsImV4cG9ydC9yYXdkZWZsYXRlLmpzIiwiZXhwb3J0L3Jhd2luZmxhdGUuanMiLCJleHBvcnQvcmF3aW5mbGF0ZV9zdHJlYW0uanMiLCJleHBvcnQvdW56aXAuanMiLCJleHBvcnQvemlwLmpzIl0sIm5hbWVzIjpbIkNPTVBJTEVEIiwiZ29vZyIsImdsb2JhbCIsIkRFQlVHIiwiTE9DQUxFIiwicHJvdmlkZSIsImdvb2cucHJvdmlkZSIsIm5hbWUiLCJpc1Byb3ZpZGVkXyIsIkVycm9yIiwiaW1wbGljaXROYW1lc3BhY2VzXyIsIm5hbWVzcGFjZSIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiZ2V0T2JqZWN0QnlOYW1lIiwiZXhwb3J0UGF0aF8iLCJzZXRUZXN0T25seSIsImdvb2cuc2V0VGVzdE9ubHkiLCJvcHRfbWVzc2FnZSIsImdvb2cuaXNQcm92aWRlZF8iLCJnb29nLmV4cG9ydFBhdGhfIiwib3B0X29iamVjdCIsIm9wdF9vYmplY3RUb0V4cG9ydFRvIiwicGFydHMiLCJzcGxpdCIsImN1ciIsImV4ZWNTY3JpcHQiLCJwYXJ0IiwibGVuZ3RoIiwic2hpZnQiLCJpc0RlZiIsImdvb2cuZ2V0T2JqZWN0QnlOYW1lIiwib3B0X29iaiIsImlzRGVmQW5kTm90TnVsbCIsImdsb2JhbGl6ZSIsImdvb2cuZ2xvYmFsaXplIiwib2JqIiwib3B0X2dsb2JhbCIsIngiLCJhZGREZXBlbmRlbmN5IiwiZ29vZy5hZGREZXBlbmRlbmN5IiwicmVsUGF0aCIsInByb3ZpZGVzIiwicmVxdWlyZXMiLCJyZXF1aXJlIiwicGF0aCIsInJlcGxhY2UiLCJkZXBzIiwiZGVwZW5kZW5jaWVzXyIsImkiLCJuYW1lVG9QYXRoIiwicGF0aFRvTmFtZXMiLCJqIiwiRU5BQkxFX0RFQlVHX0xPQURFUiIsImdvb2cucmVxdWlyZSIsImdldFBhdGhGcm9tRGVwc18iLCJpbmNsdWRlZF8iLCJ3cml0ZVNjcmlwdHNfIiwiZXJyb3JNZXNzYWdlIiwiY29uc29sZSIsImJhc2VQYXRoIiwiQ0xPU1VSRV9CQVNFX1BBVEgiLCJDTE9TVVJFX05PX0RFUFMiLCJDTE9TVVJFX0lNUE9SVF9TQ1JJUFQiLCJudWxsRnVuY3Rpb24iLCJnb29nLm51bGxGdW5jdGlvbiIsImlkZW50aXR5RnVuY3Rpb24iLCJnb29nLmlkZW50aXR5RnVuY3Rpb24iLCJvcHRfcmV0dXJuVmFsdWUiLCJ2YXJfYXJncyIsImFic3RyYWN0TWV0aG9kIiwiZ29vZy5hYnN0cmFjdE1ldGhvZCIsImFkZFNpbmdsZXRvbkdldHRlciIsImdvb2cuYWRkU2luZ2xldG9uR2V0dGVyIiwiY3RvciIsImdldEluc3RhbmNlIiwiY3Rvci5nZXRJbnN0YW5jZSIsImluc3RhbmNlXyIsImluc3RhbnRpYXRlZFNpbmdsZXRvbnNfIiwiaW5IdG1sRG9jdW1lbnRfIiwiZ29vZy5pbkh0bWxEb2N1bWVudF8iLCJkb2MiLCJkb2N1bWVudCIsImZpbmRCYXNlUGF0aF8iLCJnb29nLmZpbmRCYXNlUGF0aF8iLCJzY3JpcHRzIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJzcmMiLCJxbWFyayIsImwiLCJzdWJzdHIiLCJpbXBvcnRTY3JpcHRfIiwiZ29vZy5pbXBvcnRTY3JpcHRfIiwiaW1wb3J0U2NyaXB0Iiwid3JpdGVTY3JpcHRUYWdfIiwid3JpdHRlbiIsImdvb2cud3JpdGVTY3JpcHRUYWdfIiwid3JpdGUiLCJnb29nLndyaXRlU2NyaXB0c18iLCJzZWVuU2NyaXB0IiwidmlzaXROb2RlIiwidmlzaXRlZCIsInB1c2giLCJyZXF1aXJlTmFtZSIsImdvb2cuZ2V0UGF0aEZyb21EZXBzXyIsInJ1bGUiLCJ0eXBlT2YiLCJnb29nLnR5cGVPZiIsInZhbHVlIiwicyIsIkFycmF5IiwiT2JqZWN0IiwiY2xhc3NOYW1lIiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwic3BsaWNlIiwicHJvcGVydHlJc0VudW1lcmFibGUiLCJnb29nLmlzRGVmIiwidmFsIiwidW5kZWZpbmVkIiwiaXNOdWxsIiwiZ29vZy5pc051bGwiLCJnb29nLmlzRGVmQW5kTm90TnVsbCIsImlzQXJyYXkiLCJnb29nLmlzQXJyYXkiLCJpc0FycmF5TGlrZSIsImdvb2cuaXNBcnJheUxpa2UiLCJ0eXBlIiwiaXNEYXRlTGlrZSIsImdvb2cuaXNEYXRlTGlrZSIsImlzT2JqZWN0IiwiZ2V0RnVsbFllYXIiLCJpc1N0cmluZyIsImdvb2cuaXNTdHJpbmciLCJpc0Jvb2xlYW4iLCJnb29nLmlzQm9vbGVhbiIsImlzTnVtYmVyIiwiZ29vZy5pc051bWJlciIsImlzRnVuY3Rpb24iLCJnb29nLmlzRnVuY3Rpb24iLCJnb29nLmlzT2JqZWN0IiwiZ2V0VWlkIiwiZ29vZy5nZXRVaWQiLCJVSURfUFJPUEVSVFlfIiwidWlkQ291bnRlcl8iLCJyZW1vdmVVaWQiLCJnb29nLnJlbW92ZVVpZCIsInJlbW92ZUF0dHJpYnV0ZSIsImV4IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZ2V0SGFzaENvZGUiLCJyZW1vdmVIYXNoQ29kZSIsImNsb25lT2JqZWN0IiwiZ29vZy5jbG9uZU9iamVjdCIsImNsb25lIiwia2V5IiwiYmluZE5hdGl2ZV8iLCJnb29nLmJpbmROYXRpdmVfIiwiZm4iLCJzZWxmT2JqIiwiYXBwbHkiLCJiaW5kIiwiYXJndW1lbnRzIiwiYmluZEpzXyIsImdvb2cuYmluZEpzXyIsImJvdW5kQXJncyIsInNsaWNlIiwibmV3QXJncyIsInVuc2hpZnQiLCJnb29nLmJpbmQiLCJGdW5jdGlvbiIsImluZGV4T2YiLCJwYXJ0aWFsIiwiZ29vZy5wYXJ0aWFsIiwiYXJncyIsIm1peGluIiwiZ29vZy5taXhpbiIsInRhcmdldCIsInNvdXJjZSIsIm5vdyIsIkRhdGUiLCJnbG9iYWxFdmFsIiwiZ29vZy5nbG9iYWxFdmFsIiwic2NyaXB0IiwiZXZhbCIsImV2YWxXb3Jrc0Zvckdsb2JhbHNfIiwic2NyaXB0RWx0IiwiY3JlYXRlRWxlbWVudCIsImRlZmVyIiwiYXBwZW5kQ2hpbGQiLCJjcmVhdGVUZXh0Tm9kZSIsImJvZHkiLCJyZW1vdmVDaGlsZCIsImNzc05hbWVNYXBwaW5nXyIsImNzc05hbWVNYXBwaW5nU3R5bGVfIiwiZ2V0Q3NzTmFtZSIsImdvb2cuZ2V0Q3NzTmFtZSIsIm9wdF9tb2RpZmllciIsImdldE1hcHBpbmciLCJjc3NOYW1lIiwicmVuYW1lQnlQYXJ0cyIsIm1hcHBlZCIsImpvaW4iLCJyZW5hbWUiLCJhIiwic2V0Q3NzTmFtZU1hcHBpbmciLCJnb29nLnNldENzc05hbWVNYXBwaW5nIiwibWFwcGluZyIsIm9wdF9zdHlsZSIsIkNMT1NVUkVfQ1NTX05BTUVfTUFQUElORyIsImdldE1zZyIsImdvb2cuZ2V0TXNnIiwic3RyIiwib3B0X3ZhbHVlcyIsInZhbHVlcyIsIlJlZ0V4cCIsImV4cG9ydFN5bWJvbCIsImdvb2cuZXhwb3J0U3ltYm9sIiwicHVibGljUGF0aCIsIm9iamVjdCIsImV4cG9ydFByb3BlcnR5IiwiZ29vZy5leHBvcnRQcm9wZXJ0eSIsInB1YmxpY05hbWUiLCJzeW1ib2wiLCJpbmhlcml0cyIsImdvb2cuaW5oZXJpdHMiLCJjaGlsZEN0b3IiLCJwYXJlbnRDdG9yIiwidGVtcEN0b3IiLCJzdXBlckNsYXNzXyIsImNvbnN0cnVjdG9yIiwiYmFzZSIsImdvb2cuYmFzZSIsIm1lIiwib3B0X21ldGhvZE5hbWUiLCJjYWxsZXIiLCJjYWxsZWUiLCJmb3VuZENhbGxlciIsInNjb3BlIiwiZ29vZy5zY29wZSIsIlVTRV9UWVBFREFSUkFZIiwiVWludDhBcnJheSIsIlVpbnQxNkFycmF5IiwiVWludDMyQXJyYXkiLCJEYXRhVmlldyIsIlpsaWIiLCJCaXRTdHJlYW0iLCJabGliLkJpdFN0cmVhbSIsImJ1ZmZlciIsImJ1ZmZlclBvc2l0aW9uIiwiaW5kZXgiLCJiaXRpbmRleCIsIkRlZmF1bHRCbG9ja1NpemUiLCJleHBhbmRCdWZmZXIiLCJabGliLkJpdFN0cmVhbS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyIiwib2xkYnVmIiwiaWwiLCJzZXQiLCJ3cml0ZUJpdHMiLCJabGliLkJpdFN0cmVhbS5wcm90b3R5cGUud3JpdGVCaXRzIiwibnVtYmVyIiwibiIsInJldmVyc2UiLCJjdXJyZW50IiwicmV2MzJfIiwiUmV2ZXJzZVRhYmxlIiwiZmluaXNoIiwiWmxpYi5CaXRTdHJlYW0ucHJvdG90eXBlLmZpbmlzaCIsIm91dHB1dCIsInN1YmFycmF5IiwidGFibGUiLCJyIiwiWkxJQl9DUkMzMl9DT01QQUNUIiwiQ1JDMzIiLCJjYWxjIiwiWmxpYi5DUkMzMi5jYWxjIiwiZGF0YSIsInBvcyIsInVwZGF0ZSIsIlpsaWIuQ1JDMzIudXBkYXRlIiwiY3JjIiwiVGFibGUiLCJzaW5nbGUiLCJabGliLkNSQzMyLnNpbmdsZSIsIm51bSIsIlRhYmxlXyIsImMiLCJlIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiZnJvbUNoYXJDb2RlQXBwbHkiLCJ0aGlzb2JqIiwiR3VuemlwTWVtYmVyIiwiWmxpYi5HdW56aXBNZW1iZXIiLCJpZDEiLCJpZDIiLCJjbSIsImZsZyIsIm10aW1lIiwieGZsIiwib3MiLCJjcmMxNiIsInhsZW4iLCJjcmMzMiIsImlzaXplIiwiY29tbWVudCIsImdldE5hbWUiLCJabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TmFtZSIsImdldERhdGEiLCJabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0RGF0YSIsImdldE10aW1lIiwiWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldE10aW1lIiwiSGVhcCIsIlpsaWIuSGVhcCIsImdldFBhcmVudCIsIlpsaWIuSGVhcC5wcm90b3R5cGUuZ2V0UGFyZW50IiwiZ2V0Q2hpbGQiLCJabGliLkhlYXAucHJvdG90eXBlLmdldENoaWxkIiwiWmxpYi5IZWFwLnByb3RvdHlwZS5wdXNoIiwicGFyZW50IiwiaGVhcCIsInN3YXAiLCJwb3AiLCJabGliLkhlYXAucHJvdG90eXBlLnBvcCIsIkh1ZmZtYW4iLCJidWlsZEh1ZmZtYW5UYWJsZSIsIlpsaWIuSHVmZm1hbi5idWlsZEh1ZmZtYW5UYWJsZSIsImxlbmd0aHMiLCJsaXN0U2l6ZSIsIm1heENvZGVMZW5ndGgiLCJtaW5Db2RlTGVuZ3RoIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJzaXplIiwiYml0TGVuZ3RoIiwiY29kZSIsInNraXAiLCJyZXZlcnNlZCIsInJ0ZW1wIiwiUmF3RGVmbGF0ZSIsIlpsaWIuUmF3RGVmbGF0ZSIsImlucHV0Iiwib3B0X3BhcmFtcyIsImNvbXByZXNzaW9uVHlwZSIsIkNvbXByZXNzaW9uVHlwZSIsIkRZTkFNSUMiLCJsYXp5IiwiZnJlcXNMaXRMZW4iLCJmcmVxc0Rpc3QiLCJvcCIsIkx6NzdNaW5MZW5ndGgiLCJMejc3TWF4TGVuZ3RoIiwiV2luZG93U2l6ZSIsIk1heENvZGVMZW5ndGgiLCJIVUZNQVgiLCJGaXhlZEh1ZmZtYW5UYWJsZSIsImNvbXByZXNzIiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5jb21wcmVzcyIsImJsb2NrQXJyYXkiLCJwb3NpdGlvbiIsIk5PTkUiLCJtYWtlTm9jb21wcmVzc0Jsb2NrIiwiRklYRUQiLCJtYWtlRml4ZWRIdWZmbWFuQmxvY2siLCJtYWtlRHluYW1pY0h1ZmZtYW5CbG9jayIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZU5vY29tcHJlc3NCbG9jayIsImlzRmluYWxCbG9jayIsImJmaW5hbCIsImJ0eXBlIiwibGVuIiwibmxlbiIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZUZpeGVkSHVmZm1hbkJsb2NrIiwic3RyZWFtIiwibHo3NyIsImZpeGVkSHVmZm1hbiIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZUR5bmFtaWNIdWZmbWFuQmxvY2siLCJobGl0IiwiaGRpc3QiLCJoY2xlbiIsImhjbGVuT3JkZXIiLCJsaXRMZW5MZW5ndGhzIiwibGl0TGVuQ29kZXMiLCJkaXN0TGVuZ3RocyIsImRpc3RDb2RlcyIsInRyZWVTeW1ib2xzIiwidHJlZUxlbmd0aHMiLCJ0cmFuc0xlbmd0aHMiLCJ0cmVlQ29kZXMiLCJiaXRsZW4iLCJnZXRMZW5ndGhzXyIsImdldENvZGVzRnJvbUxlbmd0aHNfIiwiZ2V0VHJlZVN5bWJvbHNfIiwiZnJlcXMiLCJjb2RlcyIsImR5bmFtaWNIdWZmbWFuIiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5keW5hbWljSHVmZm1hbiIsImRhdGFBcnJheSIsImxpdExlbiIsImRpc3QiLCJsaXRlcmFsIiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5maXhlZEh1ZmZtYW4iLCJMejc3TWF0Y2giLCJabGliLlJhd0RlZmxhdGUuTHo3N01hdGNoIiwiYmFja3dhcmREaXN0YW5jZSIsIkxlbmd0aENvZGVUYWJsZSIsImdldERpc3RhbmNlQ29kZV8iLCJabGliLlJhd0RlZmxhdGUuTHo3N01hdGNoLnByb3RvdHlwZS5nZXREaXN0YW5jZUNvZGVfIiwidG9Mejc3QXJyYXkiLCJabGliLlJhd0RlZmxhdGUuTHo3N01hdGNoLnByb3RvdHlwZS50b0x6NzdBcnJheSIsImNvZGVBcnJheSIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubHo3NyIsIm1hdGNoS2V5Iiwid2luZG93U2l6ZSIsIm1hdGNoTGlzdCIsImxvbmdlc3RNYXRjaCIsInByZXZNYXRjaCIsImx6NzdidWYiLCJza2lwTGVuZ3RoIiwidG1wIiwid3JpdGVNYXRjaCIsIm1hdGNoIiwib2Zmc2V0IiwibHo3N0FycmF5Iiwic2VhcmNoTG9uZ2VzdE1hdGNoXyIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuc2VhcmNoTG9uZ2VzdE1hdGNoXyIsImN1cnJlbnRNYXRjaCIsIm1hdGNoTWF4IiwibWF0Y2hMZW5ndGgiLCJkbCIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuZ2V0VHJlZVN5bWJvbHNfIiwibGl0bGVuTGVuZ3RocyIsInJ1bkxlbmd0aCIsInJlc3VsdCIsIm5SZXN1bHQiLCJycHQiLCJabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmdldExlbmd0aHNfIiwibGltaXQiLCJuU3ltYm9scyIsIm5vZGVzIiwiY29kZUxlbmd0aCIsInJldmVyc2VQYWNrYWdlTWVyZ2VfIiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5yZXZlcnNlUGFja2FnZU1lcmdlXyIsInN5bWJvbHMiLCJtaW5pbXVtQ29zdCIsImZsYWciLCJjdXJyZW50UG9zaXRpb24iLCJleGNlc3MiLCJoYWxmIiwidCIsIndlaWdodCIsIm5leHQiLCJ0YWtlUGFja2FnZSIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuZ2V0Q29kZXNGcm9tTGVuZ3Roc18iLCJjb3VudCIsInN0YXJ0Q29kZSIsIm0iLCJHemlwIiwiWmxpYi5HemlwIiwiaXAiLCJmbGFncyIsImZpbGVuYW1lIiwiZGVmbGF0ZU9wdGlvbnMiLCJEZWZhdWx0QnVmZmVyU2l6ZSIsIlpsaWIuR3ppcC5wcm90b3R5cGUuY29tcHJlc3MiLCJyYXdkZWZsYXRlIiwiRmxhZ3NNYXNrIiwiRk5BTUUiLCJGQ09NTUVOVCIsIkZIQ1JDIiwiT3BlcmF0aW5nU3lzdGVtIiwiVU5LTk9XTiIsImNoYXJDb2RlQXQiLCJieXRlTGVuZ3RoIiwiWkxJQl9SQVdfSU5GTEFURV9CVUZGRVJfU0laRSIsIlJhd0luZmxhdGUiLCJabGliLlJhd0luZmxhdGUiLCJibG9ja3MiLCJidWZmZXJTaXplIiwidG90YWxwb3MiLCJiaXRzYnVmIiwiYml0c2J1ZmxlbiIsImJ1ZmZlclR5cGUiLCJCdWZmZXJUeXBlIiwiQURBUFRJVkUiLCJyZXNpemUiLCJwcmV2IiwiQkxPQ0siLCJNYXhCYWNrd2FyZExlbmd0aCIsIk1heENvcHlMZW5ndGgiLCJleHBhbmRCdWZmZXJBZGFwdGl2ZSIsImNvbmNhdEJ1ZmZlciIsImNvbmNhdEJ1ZmZlckR5bmFtaWMiLCJkZWNvZGVIdWZmbWFuIiwiZGVjb2RlSHVmZm1hbkFkYXB0aXZlIiwiZGVjb21wcmVzcyIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb21wcmVzcyIsInBhcnNlQmxvY2siLCJPcmRlciIsIkxlbmd0aEV4dHJhVGFibGUiLCJEaXN0Q29kZVRhYmxlIiwiRGlzdEV4dHJhVGFibGUiLCJGaXhlZExpdGVyYWxMZW5ndGhUYWJsZSIsIkZpeGVkRGlzdGFuY2VUYWJsZSIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VCbG9jayIsImhkciIsInJlYWRCaXRzIiwicGFyc2VVbmNvbXByZXNzZWRCbG9jayIsInBhcnNlRml4ZWRIdWZmbWFuQmxvY2siLCJwYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2siLCJabGliLlJhd0luZmxhdGUucHJvdG90eXBlLnJlYWRCaXRzIiwiaW5wdXRMZW5ndGgiLCJvY3RldCIsInJlYWRDb2RlQnlUYWJsZSIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucmVhZENvZGVCeVRhYmxlIiwiY29kZVRhYmxlIiwiY29kZVdpdGhMZW5ndGgiLCJabGliLlJhd0luZmxhdGUucHJvdG90eXBlLnBhcnNlVW5jb21wcmVzc2VkQmxvY2siLCJvbGVuZ3RoIiwicHJlQ29weSIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VGaXhlZEh1ZmZtYW5CbG9jayIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrIiwiY29kZUxlbmd0aHMiLCJjb2RlTGVuZ3Roc1RhYmxlIiwiZGVjb2RlIiwicmVwZWF0IiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5kZWNvZGVIdWZmbWFuIiwibGl0bGVuIiwiY3VycmVudExpdGxlblRhYmxlIiwidGkiLCJjb2RlRGlzdCIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb2RlSHVmZm1hbkFkYXB0aXZlIiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5leHBhbmRCdWZmZXIiLCJvcHRfcGFyYW0iLCJiYWNrd2FyZCIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyQWRhcHRpdmUiLCJyYXRpbyIsIm1heEh1ZmZDb2RlIiwibmV3U2l6ZSIsIm1heEluZmxhdGVTaXplIiwiZml4UmF0aW8iLCJhZGRSYXRpbyIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuY29uY2F0QnVmZmVyIiwiYmxvY2siLCJqbCIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuY29uY2F0QnVmZmVyRHluYW1pYyIsIkd1bnppcCIsIlpsaWIuR3VuemlwIiwibWVtYmVyIiwiZGVjb21wcmVzc2VkIiwiZ2V0TWVtYmVycyIsIlpsaWIuR3VuemlwLnByb3RvdHlwZS5nZXRNZW1iZXJzIiwiWmxpYi5HdW56aXAucHJvdG90eXBlLmRlY29tcHJlc3MiLCJkZWNvZGVNZW1iZXIiLCJjb25jYXRNZW1iZXIiLCJabGliLkd1bnppcC5wcm90b3R5cGUuZGVjb2RlTWVtYmVyIiwicmF3aW5mbGF0ZSIsImluZmxhdGVkIiwiaW5mbGVuIiwiY2kiLCJGRVhUUkEiLCJkZWNvZGVTdWJGaWVsZCIsIlpsaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvZGVTdWJGaWVsZCIsIlpsaWIuR3VuemlwLnByb3RvdHlwZS5jb25jYXRNZW1iZXIiLCJwIiwiY29uY2F0IiwiWkxJQl9TVFJFQU1fUkFXX0lORkxBVEVfQlVGRkVSX1NJWkUiLCJSYXdJbmZsYXRlU3RyZWFtIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtIiwib3B0X2J1ZmZlcnNpemUiLCJibG9ja0xlbmd0aCIsImxpdGxlblRhYmxlIiwiZGlzdFRhYmxlIiwic3AiLCJzdGF0dXMiLCJTdGF0dXMiLCJJTklUSUFMSVpFRCIsImlwXyIsImJpdHNidWZsZW5fIiwiYml0c2J1Zl8iLCJCbG9ja1R5cGUiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3MiLCJuZXdJbnB1dCIsInN0b3AiLCJCTE9DS19IRUFERVJfU1RBUlQiLCJyZWFkQmxvY2tIZWFkZXIiLCJCTE9DS19IRUFERVJfRU5EIiwiQkxPQ0tfQk9EWV9TVEFSVCIsImN1cnJlbnRCbG9ja1R5cGUiLCJVTkNPTVBSRVNTRUQiLCJyZWFkVW5jb21wcmVzc2VkQmxvY2tIZWFkZXIiLCJCTE9DS19CT0RZX0VORCIsIkRFQ09ERV9CTE9DS19TVEFSVCIsIkRFQ09ERV9CTE9DS19FTkQiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRCbG9ja0hlYWRlciIsInNhdmVfIiwicmVzdG9yZV8iLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRCaXRzIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkQ29kZUJ5VGFibGUiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRVbmNvbXByZXNzZWRCbG9ja0hlYWRlciIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucGFyc2VVbmNvbXByZXNzZWRCbG9jayIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucGFyc2VGaXhlZEh1ZmZtYW5CbG9jayIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuc2F2ZV8iLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlc3RvcmVfIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5wYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2siLCJwYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2tJbXBsIiwiYml0cyIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb2RlSHVmZm1hbiIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5jb25jYXRCdWZmZXIiLCJnZXRCeXRlcyIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZ2V0Qnl0ZXMiLCJVdGlsIiwic3RyaW5nVG9CeXRlQXJyYXkiLCJabGliLlV0aWwuc3RyaW5nVG9CeXRlQXJyYXkiLCJBZGxlcjMyIiwiWmxpYi5BZGxlcjMyIiwiYXJyYXkiLCJabGliLkFkbGVyMzIudXBkYXRlIiwiYWRsZXIiLCJzMSIsInMyIiwidGxlbiIsIk9wdGltaXphdGlvblBhcmFtZXRlciIsIkluZmxhdGUiLCJabGliLkluZmxhdGUiLCJjbWYiLCJ2ZXJpZnkiLCJDb21wcmVzc2lvbk1ldGhvZCIsIkRFRkxBVEUiLCJtZXRob2QiLCJabGliLkluZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3MiLCJhZGxlcjMyIiwiWmlwIiwiWmxpYi5aaXAiLCJmaWxlcyIsInBhc3N3b3JkIiwiRmxhZ3MiLCJGaWxlSGVhZGVyU2lnbmF0dXJlIiwiTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlIiwiQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZSIsImFkZEZpbGUiLCJabGliLlppcC5wcm90b3R5cGUuYWRkRmlsZSIsImNvbXByZXNzZWQiLCJTVE9SRSIsImRlZmxhdGVXaXRoT3B0aW9uIiwic2V0UGFzc3dvcmQiLCJabGliLlppcC5wcm90b3R5cGUuc2V0UGFzc3dvcmQiLCJabGliLlppcC5wcm90b3R5cGUuY29tcHJlc3MiLCJmaWxlIiwib3AxIiwib3AyIiwib3AzIiwibG9jYWxGaWxlU2l6ZSIsImNlbnRyYWxEaXJlY3RvcnlTaXplIiwiZW5kT2ZDZW50cmFsRGlyZWN0b3J5U2l6ZSIsIm5lZWRWZXJzaW9uIiwiY29tcHJlc3Npb25NZXRob2QiLCJkYXRlIiwicGxhaW5TaXplIiwiZmlsZW5hbWVMZW5ndGgiLCJleHRyYUZpZWxkTGVuZ3RoIiwiY29tbWVudExlbmd0aCIsImV4dHJhRmllbGQiLCJvcHRpb24iLCJjcmVhdGVFbmNyeXB0aW9uS2V5IiwiZW5jb2RlIiwiTVNET1MiLCJFTkNSWVBUIiwiZ2V0TWludXRlcyIsImdldFNlY29uZHMiLCJnZXRIb3VycyIsImdldE1vbnRoIiwiZ2V0RGF0ZSIsIlpsaWIuWmlwLnByb3RvdHlwZS5kZWZsYXRlV2l0aE9wdGlvbiIsImRlZmxhdG9yIiwiZ2V0Qnl0ZSIsIlpsaWIuWmlwLnByb3RvdHlwZS5nZXRCeXRlIiwiWmxpYi5aaXAucHJvdG90eXBlLmVuY29kZSIsInVwZGF0ZUtleXMiLCJabGliLlppcC5wcm90b3R5cGUudXBkYXRlS2V5cyIsIlpsaWIuWmlwLnByb3RvdHlwZS5jcmVhdGVFbmNyeXB0aW9uS2V5IiwiVW56aXAiLCJabGliLlVuemlwIiwiZW9jZHJPZmZzZXQiLCJudW1iZXJPZlRoaXNEaXNrIiwic3RhcnREaXNrIiwidG90YWxFbnRyaWVzVGhpc0Rpc2siLCJ0b3RhbEVudHJpZXMiLCJjZW50cmFsRGlyZWN0b3J5T2Zmc2V0IiwiZmlsZUhlYWRlckxpc3QiLCJmaWxlbmFtZVRvSW5kZXgiLCJGaWxlSGVhZGVyIiwiWmxpYi5VbnppcC5GaWxlSGVhZGVyIiwidmVyc2lvbiIsImNvbXByZXNzaW9uIiwidGltZSIsImNvbXByZXNzZWRTaXplIiwiZmlsZU5hbWVMZW5ndGgiLCJmaWxlQ29tbWVudExlbmd0aCIsImRpc2tOdW1iZXJTdGFydCIsImludGVybmFsRmlsZUF0dHJpYnV0ZXMiLCJleHRlcm5hbEZpbGVBdHRyaWJ1dGVzIiwicmVsYXRpdmVPZmZzZXQiLCJwYXJzZSIsIlpsaWIuVW56aXAuRmlsZUhlYWRlci5wcm90b3R5cGUucGFyc2UiLCJMb2NhbEZpbGVIZWFkZXIiLCJabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlciIsIlpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyLnByb3RvdHlwZS5wYXJzZSIsInNlYXJjaEVuZE9mQ2VudHJhbERpcmVjdG9yeVJlY29yZCIsIlpsaWIuVW56aXAucHJvdG90eXBlLnNlYXJjaEVuZE9mQ2VudHJhbERpcmVjdG9yeVJlY29yZCIsInBhcnNlRW5kT2ZDZW50cmFsRGlyZWN0b3J5UmVjb3JkIiwiWmxpYi5VbnppcC5wcm90b3R5cGUucGFyc2VFbmRPZkNlbnRyYWxEaXJlY3RvcnlSZWNvcmQiLCJwYXJzZUZpbGVIZWFkZXIiLCJabGliLlVuemlwLnByb3RvdHlwZS5wYXJzZUZpbGVIZWFkZXIiLCJmaWxlbGlzdCIsImZpbGV0YWJsZSIsImZpbGVIZWFkZXIiLCJnZXRGaWxlRGF0YSIsIlpsaWIuVW56aXAucHJvdG90eXBlLmdldEZpbGVEYXRhIiwibG9jYWxGaWxlSGVhZGVyIiwiY3JlYXRlRGVjcnlwdGlvbktleSIsImdldEZpbGVuYW1lcyIsIlpsaWIuVW56aXAucHJvdG90eXBlLmdldEZpbGVuYW1lcyIsImZpbGVuYW1lTGlzdCIsIlpsaWIuVW56aXAucHJvdG90eXBlLmRlY29tcHJlc3MiLCJabGliLlVuemlwLnByb3RvdHlwZS5zZXRQYXNzd29yZCIsIlpsaWIuVW56aXAucHJvdG90eXBlLmRlY29kZSIsIkRlZmxhdGUiLCJabGliLkRlZmxhdGUiLCJyYXdEZWZsYXRlIiwicmF3RGVmbGF0ZU9wdGlvbiIsInByb3AiLCJabGliLkRlZmxhdGUuY29tcHJlc3MiLCJabGliLkRlZmxhdGUucHJvdG90eXBlLmNvbXByZXNzIiwiY2luZm8iLCJmY2hlY2siLCJmZGljdCIsImZsZXZlbCIsImNsZXZlbCIsImVycm9yIiwiTE9HMkUiLCJsb2ciLCJleHBvcnRPYmplY3QiLCJabGliLmV4cG9ydE9iamVjdCIsImVudW1TdHJpbmciLCJleHBvcnRLZXlWYWx1ZSIsImtleXMiLCJJbmZsYXRlU3RyZWFtIiwiWmxpYi5JbmZsYXRlU3RyZWFtIiwiWmxpYi5JbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5kZWNvbXByZXNzIiwicmVhZEhlYWRlciIsIlpsaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZ2V0Qnl0ZXMiLCJabGliLkluZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRIZWFkZXIiLCJVTklYIiwiTUFDSU5UT1NIIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDA2IFRoZSBDbG9zdXJlIExpYnJhcnkgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgQm9vdHN0cmFwIGZvciB0aGUgR29vZ2xlIEpTIExpYnJhcnkgKENsb3N1cmUpLlxuICpcbiAqIEluIHVuY29tcGlsZWQgbW9kZSBiYXNlLmpzIHdpbGwgd3JpdGUgb3V0IENsb3N1cmUncyBkZXBzIGZpbGUsIHVubGVzcyB0aGVcbiAqIGdsb2JhbCA8Y29kZT5DTE9TVVJFX05PX0RFUFM8L2NvZGU+IGlzIHNldCB0byB0cnVlLiAgVGhpcyBhbGxvd3MgcHJvamVjdHMgdG9cbiAqIGluY2x1ZGUgdGhlaXIgb3duIGRlcHMgZmlsZShzKSBmcm9tIGRpZmZlcmVudCBsb2NhdGlvbnMuXG4gKlxuICovXG5cblxuLyoqXG4gKiBAZGVmaW5lIHtib29sZWFufSBPdmVycmlkZGVuIHRvIHRydWUgYnkgdGhlIGNvbXBpbGVyIHdoZW4gLS1jbG9zdXJlX3Bhc3NcbiAqICAgICBvciAtLW1hcmtfYXNfY29tcGlsZWQgaXMgc3BlY2lmaWVkLlxuICovXG52YXIgQ09NUElMRUQgPSBmYWxzZTtcblxuXG4vKipcbiAqIEJhc2UgbmFtZXNwYWNlIGZvciB0aGUgQ2xvc3VyZSBsaWJyYXJ5LiAgQ2hlY2tzIHRvIHNlZSBnb29nIGlzXG4gKiBhbHJlYWR5IGRlZmluZWQgaW4gdGhlIGN1cnJlbnQgc2NvcGUgYmVmb3JlIGFzc2lnbmluZyB0byBwcmV2ZW50XG4gKiBjbG9iYmVyaW5nIGlmIGJhc2UuanMgaXMgbG9hZGVkIG1vcmUgdGhhbiBvbmNlLlxuICpcbiAqIEBjb25zdFxuICovXG52YXIgZ29vZyA9IGdvb2cgfHwge307IC8vIElkZW50aWZpZXMgdGhpcyBmaWxlIGFzIHRoZSBDbG9zdXJlIGJhc2UuXG5cblxuLyoqXG4gKiBSZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBjb250ZXh0LiAgSW4gbW9zdCBjYXNlcyB0aGlzIHdpbGwgYmUgJ3dpbmRvdycuXG4gKi9cbmdvb2cuZ2xvYmFsID0gdGhpcztcblxuXG4vKipcbiAqIEBkZWZpbmUge2Jvb2xlYW59IERFQlVHIGlzIHByb3ZpZGVkIGFzIGEgY29udmVuaWVuY2Ugc28gdGhhdCBkZWJ1Z2dpbmcgY29kZVxuICogdGhhdCBzaG91bGQgbm90IGJlIGluY2x1ZGVkIGluIGEgcHJvZHVjdGlvbiBqc19iaW5hcnkgY2FuIGJlIGVhc2lseSBzdHJpcHBlZFxuICogYnkgc3BlY2lmeWluZyAtLWRlZmluZSBnb29nLkRFQlVHPWZhbHNlIHRvIHRoZSBKU0NvbXBpbGVyLiBGb3IgZXhhbXBsZSwgbW9zdFxuICogdG9TdHJpbmcoKSBtZXRob2RzIHNob3VsZCBiZSBkZWNsYXJlZCBpbnNpZGUgYW4gXCJpZiAoZ29vZy5ERUJVRylcIiBjb25kaXRpb25hbFxuICogYmVjYXVzZSB0aGV5IGFyZSBnZW5lcmFsbHkgdXNlZCBmb3IgZGVidWdnaW5nIHB1cnBvc2VzIGFuZCBpdCBpcyBkaWZmaWN1bHRcbiAqIGZvciB0aGUgSlNDb21waWxlciB0byBzdGF0aWNhbGx5IGRldGVybWluZSB3aGV0aGVyIHRoZXkgYXJlIHVzZWQuXG4gKi9cbmdvb2cuREVCVUcgPSB0cnVlO1xuXG5cbi8qKlxuICogQGRlZmluZSB7c3RyaW5nfSBMT0NBTEUgZGVmaW5lcyB0aGUgbG9jYWxlIGJlaW5nIHVzZWQgZm9yIGNvbXBpbGF0aW9uLiBJdCBpc1xuICogdXNlZCB0byBzZWxlY3QgbG9jYWxlIHNwZWNpZmljIGRhdGEgdG8gYmUgY29tcGlsZWQgaW4ganMgYmluYXJ5LiBCVUlMRCBydWxlXG4gKiBjYW4gc3BlY2lmeSB0aGlzIHZhbHVlIGJ5IFwiLS1kZWZpbmUgZ29vZy5MT0NBTEU9PGxvY2FsZV9uYW1lPlwiIGFzIEpTQ29tcGlsZXJcbiAqIG9wdGlvbi5cbiAqXG4gKiBUYWtlIGludG8gYWNjb3VudCB0aGF0IHRoZSBsb2NhbGUgY29kZSBmb3JtYXQgaXMgaW1wb3J0YW50LiBZb3Ugc2hvdWxkIHVzZVxuICogdGhlIGNhbm9uaWNhbCBVbmljb2RlIGZvcm1hdCB3aXRoIGh5cGhlbiBhcyBhIGRlbGltaXRlci4gTGFuZ3VhZ2UgbXVzdCBiZVxuICogbG93ZXJjYXNlLCBMYW5ndWFnZSBTY3JpcHQgLSBDYXBpdGFsaXplZCwgUmVnaW9uIC0gVVBQRVJDQVNFLlxuICogVGhlcmUgYXJlIGZldyBleGFtcGxlczogcHQtQlIsIGVuLCBlbi1VUywgc3ItTGF0aW4tQk8sIHpoLUhhbnMtQ04uXG4gKlxuICogU2VlIG1vcmUgaW5mbyBhYm91dCBsb2NhbGUgY29kZXMgaGVyZTpcbiAqIGh0dHA6Ly93d3cudW5pY29kZS5vcmcvcmVwb3J0cy90cjM1LyNVbmljb2RlX0xhbmd1YWdlX2FuZF9Mb2NhbGVfSWRlbnRpZmllcnNcbiAqXG4gKiBGb3IgbGFuZ3VhZ2UgY29kZXMgeW91IHNob3VsZCB1c2UgdmFsdWVzIGRlZmluZWQgYnkgSVNPIDY5My0xLiBTZWUgaXQgaGVyZVxuICogaHR0cDovL3d3dy53My5vcmcvV0FJL0VSL0lHL2VydC9pc282MzkuaHRtLiBUaGVyZSBpcyBvbmx5IG9uZSBleGNlcHRpb24gZnJvbVxuICogdGhpcyBydWxlOiB0aGUgSGVicmV3IGxhbmd1YWdlLiBGb3IgbGVnYWN5IHJlYXNvbnMgdGhlIG9sZCBjb2RlIChpdykgc2hvdWxkXG4gKiBiZSB1c2VkIGluc3RlYWQgb2YgdGhlIG5ldyBjb2RlIChoZSksIHNlZSBodHRwOi8vd2lraS9NYWluL0lJSVN5bm9ueW1zLlxuICovXG5nb29nLkxPQ0FMRSA9ICdlbic7ICAvLyBkZWZhdWx0IHRvIGVuXG5cblxuLyoqXG4gKiBDcmVhdGVzIG9iamVjdCBzdHVicyBmb3IgYSBuYW1lc3BhY2UuICBUaGUgcHJlc2VuY2Ugb2Ygb25lIG9yIG1vcmVcbiAqIGdvb2cucHJvdmlkZSgpIGNhbGxzIGluZGljYXRlIHRoYXQgdGhlIGZpbGUgZGVmaW5lcyB0aGUgZ2l2ZW5cbiAqIG9iamVjdHMvbmFtZXNwYWNlcy4gIEJ1aWxkIHRvb2xzIGFsc28gc2NhbiBmb3IgcHJvdmlkZS9yZXF1aXJlIHN0YXRlbWVudHNcbiAqIHRvIGRpc2Nlcm4gZGVwZW5kZW5jaWVzLCBidWlsZCBkZXBlbmRlbmN5IGZpbGVzIChzZWUgZGVwcy5qcyksIGV0Yy5cbiAqIEBzZWUgZ29vZy5yZXF1aXJlXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBOYW1lc3BhY2UgcHJvdmlkZWQgYnkgdGhpcyBmaWxlIGluIHRoZSBmb3JtXG4gKiAgICAgXCJnb29nLnBhY2thZ2UucGFydFwiLlxuICovXG5nb29nLnByb3ZpZGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIGlmICghQ09NUElMRUQpIHtcbiAgICAvLyBFbnN1cmUgdGhhdCB0aGUgc2FtZSBuYW1lc3BhY2UgaXNuJ3QgcHJvdmlkZWQgdHdpY2UuIFRoaXMgaXMgaW50ZW5kZWRcbiAgICAvLyB0byB0ZWFjaCBuZXcgZGV2ZWxvcGVycyB0aGF0ICdnb29nLnByb3ZpZGUnIGlzIGVmZmVjdGl2ZWx5IGEgdmFyaWFibGVcbiAgICAvLyBkZWNsYXJhdGlvbi4gQW5kIHdoZW4gSlNDb21waWxlciB0cmFuc2Zvcm1zIGdvb2cucHJvdmlkZSBpbnRvIGEgcmVhbFxuICAgIC8vIHZhcmlhYmxlIGRlY2xhcmF0aW9uLCB0aGUgY29tcGlsZWQgSlMgc2hvdWxkIHdvcmsgdGhlIHNhbWUgYXMgdGhlIHJhd1xuICAgIC8vIEpTLS1ldmVuIHdoZW4gdGhlIHJhdyBKUyB1c2VzIGdvb2cucHJvdmlkZSBpbmNvcnJlY3RseS5cbiAgICBpZiAoZ29vZy5pc1Byb3ZpZGVkXyhuYW1lKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ05hbWVzcGFjZSBcIicgKyBuYW1lICsgJ1wiIGFscmVhZHkgZGVjbGFyZWQuJyk7XG4gICAgfVxuICAgIGRlbGV0ZSBnb29nLmltcGxpY2l0TmFtZXNwYWNlc19bbmFtZV07XG5cbiAgICB2YXIgbmFtZXNwYWNlID0gbmFtZTtcbiAgICB3aGlsZSAoKG5hbWVzcGFjZSA9IG5hbWVzcGFjZS5zdWJzdHJpbmcoMCwgbmFtZXNwYWNlLmxhc3RJbmRleE9mKCcuJykpKSkge1xuICAgICAgaWYgKGdvb2cuZ2V0T2JqZWN0QnlOYW1lKG5hbWVzcGFjZSkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBnb29nLmltcGxpY2l0TmFtZXNwYWNlc19bbmFtZXNwYWNlXSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgZ29vZy5leHBvcnRQYXRoXyhuYW1lKTtcbn07XG5cblxuLyoqXG4gKiBNYXJrcyB0aGF0IHRoZSBjdXJyZW50IGZpbGUgc2hvdWxkIG9ubHkgYmUgdXNlZCBmb3IgdGVzdGluZywgYW5kIG5ldmVyIGZvclxuICogbGl2ZSBjb2RlIGluIHByb2R1Y3Rpb24uXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9tZXNzYWdlIE9wdGlvbmFsIG1lc3NhZ2UgdG8gYWRkIHRvIHRoZSBlcnJvciB0aGF0J3NcbiAqICAgICByYWlzZWQgd2hlbiB1c2VkIGluIHByb2R1Y3Rpb24gY29kZS5cbiAqL1xuZ29vZy5zZXRUZXN0T25seSA9IGZ1bmN0aW9uKG9wdF9tZXNzYWdlKSB7XG4gIGlmIChDT01QSUxFRCAmJiAhZ29vZy5ERUJVRykge1xuICAgIG9wdF9tZXNzYWdlID0gb3B0X21lc3NhZ2UgfHwgJyc7XG4gICAgdGhyb3cgRXJyb3IoJ0ltcG9ydGluZyB0ZXN0LW9ubHkgY29kZSBpbnRvIG5vbi1kZWJ1ZyBlbnZpcm9ubWVudCcgK1xuICAgICAgICAgICAgICAgIG9wdF9tZXNzYWdlID8gJzogJyArIG9wdF9tZXNzYWdlIDogJy4nKTtcbiAgfVxufTtcblxuXG5pZiAoIUNPTVBJTEVEKSB7XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiBuYW1lIGhhcyBiZWVuIGdvb2cucHJvdmlkZWQuIFRoaXMgd2lsbCByZXR1cm4gZmFsc2UgZm9yXG4gICAqIG5hbWVzIHRoYXQgYXJlIGF2YWlsYWJsZSBvbmx5IGFzIGltcGxpY2l0IG5hbWVzcGFjZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIG9iamVjdCB0byBsb29rIGZvci5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGUgbmFtZSBoYXMgYmVlbiBwcm92aWRlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdvb2cuaXNQcm92aWRlZF8gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuICFnb29nLmltcGxpY2l0TmFtZXNwYWNlc19bbmFtZV0gJiYgISFnb29nLmdldE9iamVjdEJ5TmFtZShuYW1lKTtcbiAgfTtcblxuICAvKipcbiAgICogTmFtZXNwYWNlcyBpbXBsaWNpdGx5IGRlZmluZWQgYnkgZ29vZy5wcm92aWRlLiBGb3IgZXhhbXBsZSxcbiAgICogZ29vZy5wcm92aWRlKCdnb29nLmV2ZW50cy5FdmVudCcpIGltcGxpY2l0bHkgZGVjbGFyZXNcbiAgICogdGhhdCAnZ29vZycgYW5kICdnb29nLmV2ZW50cycgbXVzdCBiZSBuYW1lc3BhY2VzLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy5pbXBsaWNpdE5hbWVzcGFjZXNfID0ge307XG59XG5cblxuLyoqXG4gKiBCdWlsZHMgYW4gb2JqZWN0IHN0cnVjdHVyZSBmb3IgdGhlIHByb3ZpZGVkIG5hbWVzcGFjZSBwYXRoLFxuICogZW5zdXJpbmcgdGhhdCBuYW1lcyB0aGF0IGFscmVhZHkgZXhpc3QgYXJlIG5vdCBvdmVyd3JpdHRlbi4gRm9yXG4gKiBleGFtcGxlOlxuICogXCJhLmIuY1wiIC0+IGEgPSB7fTthLmI9e307YS5iLmM9e307XG4gKiBVc2VkIGJ5IGdvb2cucHJvdmlkZSBhbmQgZ29vZy5leHBvcnRTeW1ib2wuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBvYmplY3QgdGhhdCB0aGlzIGZpbGUgZGVmaW5lcy5cbiAqIEBwYXJhbSB7Kj19IG9wdF9vYmplY3QgdGhlIG9iamVjdCB0byBleHBvc2UgYXQgdGhlIGVuZCBvZiB0aGUgcGF0aC5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X29iamVjdFRvRXhwb3J0VG8gVGhlIG9iamVjdCB0byBhZGQgdGhlIHBhdGggdG87IGRlZmF1bHRcbiAqICAgICBpcyB8Z29vZy5nbG9iYWx8LlxuICogQHByaXZhdGVcbiAqL1xuZ29vZy5leHBvcnRQYXRoXyA9IGZ1bmN0aW9uKG5hbWUsIG9wdF9vYmplY3QsIG9wdF9vYmplY3RUb0V4cG9ydFRvKSB7XG4gIHZhciBwYXJ0cyA9IG5hbWUuc3BsaXQoJy4nKTtcbiAgdmFyIGN1ciA9IG9wdF9vYmplY3RUb0V4cG9ydFRvIHx8IGdvb2cuZ2xvYmFsO1xuXG4gIC8vIEludGVybmV0IEV4cGxvcmVyIGV4aGliaXRzIHN0cmFuZ2UgYmVoYXZpb3Igd2hlbiB0aHJvd2luZyBlcnJvcnMgZnJvbVxuICAvLyBtZXRob2RzIGV4dGVybmVkIGluIHRoaXMgbWFubmVyLiAgU2VlIHRoZSB0ZXN0RXhwb3J0U3ltYm9sRXhjZXB0aW9ucyBpblxuICAvLyBiYXNlX3Rlc3QuaHRtbCBmb3IgYW4gZXhhbXBsZS5cbiAgaWYgKCEocGFydHNbMF0gaW4gY3VyKSAmJiBjdXIuZXhlY1NjcmlwdCkge1xuICAgIGN1ci5leGVjU2NyaXB0KCd2YXIgJyArIHBhcnRzWzBdKTtcbiAgfVxuXG4gIC8vIENlcnRhaW4gYnJvd3NlcnMgY2Fubm90IHBhcnNlIGNvZGUgaW4gdGhlIGZvcm0gZm9yKChhIGluIGIpOyBjOyk7XG4gIC8vIFRoaXMgcGF0dGVybiBpcyBwcm9kdWNlZCBieSB0aGUgSlNDb21waWxlciB3aGVuIGl0IGNvbGxhcHNlcyB0aGVcbiAgLy8gc3RhdGVtZW50IGFib3ZlIGludG8gdGhlIGNvbmRpdGlvbmFsIGxvb3AgYmVsb3cuIFRvIHByZXZlbnQgdGhpcyBmcm9tXG4gIC8vIGhhcHBlbmluZywgdXNlIGEgZm9yLWxvb3AgYW5kIHJlc2VydmUgdGhlIGluaXQgbG9naWMgYXMgYmVsb3cuXG5cbiAgLy8gUGFyZW50aGVzZXMgYWRkZWQgdG8gZWxpbWluYXRlIHN0cmljdCBKUyB3YXJuaW5nIGluIEZpcmVmb3guXG4gIGZvciAodmFyIHBhcnQ7IHBhcnRzLmxlbmd0aCAmJiAocGFydCA9IHBhcnRzLnNoaWZ0KCkpOykge1xuICAgIGlmICghcGFydHMubGVuZ3RoICYmIGdvb2cuaXNEZWYob3B0X29iamVjdCkpIHtcbiAgICAgIC8vIGxhc3QgcGFydCBhbmQgd2UgaGF2ZSBhbiBvYmplY3Q7IHVzZSBpdFxuICAgICAgY3VyW3BhcnRdID0gb3B0X29iamVjdDtcbiAgICB9IGVsc2UgaWYgKGN1cltwYXJ0XSkge1xuICAgICAgY3VyID0gY3VyW3BhcnRdO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXIgPSBjdXJbcGFydF0gPSB7fTtcbiAgICB9XG4gIH1cbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCBiYXNlZCBvbiBpdHMgZnVsbHkgcXVhbGlmaWVkIGV4dGVybmFsIG5hbWUuICBJZiB5b3UgYXJlXG4gKiB1c2luZyBhIGNvbXBpbGF0aW9uIHBhc3MgdGhhdCByZW5hbWVzIHByb3BlcnR5IG5hbWVzIGJld2FyZSB0aGF0IHVzaW5nIHRoaXNcbiAqIGZ1bmN0aW9uIHdpbGwgbm90IGZpbmQgcmVuYW1lZCBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBmdWxseSBxdWFsaWZpZWQgbmFtZS5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X29iaiBUaGUgb2JqZWN0IHdpdGhpbiB3aGljaCB0byBsb29rOyBkZWZhdWx0IGlzXG4gKiAgICAgfGdvb2cuZ2xvYmFsfC5cbiAqIEByZXR1cm4gez99IFRoZSB2YWx1ZSAob2JqZWN0IG9yIHByaW1pdGl2ZSkgb3IsIGlmIG5vdCBmb3VuZCwgbnVsbC5cbiAqL1xuZ29vZy5nZXRPYmplY3RCeU5hbWUgPSBmdW5jdGlvbihuYW1lLCBvcHRfb2JqKSB7XG4gIHZhciBwYXJ0cyA9IG5hbWUuc3BsaXQoJy4nKTtcbiAgdmFyIGN1ciA9IG9wdF9vYmogfHwgZ29vZy5nbG9iYWw7XG4gIGZvciAodmFyIHBhcnQ7IHBhcnQgPSBwYXJ0cy5zaGlmdCgpOyApIHtcbiAgICBpZiAoZ29vZy5pc0RlZkFuZE5vdE51bGwoY3VyW3BhcnRdKSkge1xuICAgICAgY3VyID0gY3VyW3BhcnRdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN1cjtcbn07XG5cblxuLyoqXG4gKiBHbG9iYWxpemVzIGEgd2hvbGUgbmFtZXNwYWNlLCBzdWNoIGFzIGdvb2cgb3IgZ29vZy5sYW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG5hbWVzcGFjZSB0byBnbG9iYWxpemUuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9nbG9iYWwgVGhlIG9iamVjdCB0byBhZGQgdGhlIHByb3BlcnRpZXMgdG8uXG4gKiBAZGVwcmVjYXRlZCBQcm9wZXJ0aWVzIG1heSBiZSBleHBsaWNpdGx5IGV4cG9ydGVkIHRvIHRoZSBnbG9iYWwgc2NvcGUsIGJ1dFxuICogICAgIHRoaXMgc2hvdWxkIG5vIGxvbmdlciBiZSBkb25lIGluIGJ1bGsuXG4gKi9cbmdvb2cuZ2xvYmFsaXplID0gZnVuY3Rpb24ob2JqLCBvcHRfZ2xvYmFsKSB7XG4gIHZhciBnbG9iYWwgPSBvcHRfZ2xvYmFsIHx8IGdvb2cuZ2xvYmFsO1xuICBmb3IgKHZhciB4IGluIG9iaikge1xuICAgIGdsb2JhbFt4XSA9IG9ialt4XTtcbiAgfVxufTtcblxuXG4vKipcbiAqIEFkZHMgYSBkZXBlbmRlbmN5IGZyb20gYSBmaWxlIHRvIHRoZSBmaWxlcyBpdCByZXF1aXJlcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxQYXRoIFRoZSBwYXRoIHRvIHRoZSBqcyBmaWxlLlxuICogQHBhcmFtIHtBcnJheX0gcHJvdmlkZXMgQW4gYXJyYXkgb2Ygc3RyaW5ncyB3aXRoIHRoZSBuYW1lcyBvZiB0aGUgb2JqZWN0c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyBmaWxlIHByb3ZpZGVzLlxuICogQHBhcmFtIHtBcnJheX0gcmVxdWlyZXMgQW4gYXJyYXkgb2Ygc3RyaW5ncyB3aXRoIHRoZSBuYW1lcyBvZiB0aGUgb2JqZWN0c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyBmaWxlIHJlcXVpcmVzLlxuICovXG5nb29nLmFkZERlcGVuZGVuY3kgPSBmdW5jdGlvbihyZWxQYXRoLCBwcm92aWRlcywgcmVxdWlyZXMpIHtcbiAgaWYgKCFDT01QSUxFRCkge1xuICAgIHZhciBwcm92aWRlLCByZXF1aXJlO1xuICAgIHZhciBwYXRoID0gcmVsUGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gICAgdmFyIGRlcHMgPSBnb29nLmRlcGVuZGVuY2llc187XG4gICAgZm9yICh2YXIgaSA9IDA7IHByb3ZpZGUgPSBwcm92aWRlc1tpXTsgaSsrKSB7XG4gICAgICBkZXBzLm5hbWVUb1BhdGhbcHJvdmlkZV0gPSBwYXRoO1xuICAgICAgaWYgKCEocGF0aCBpbiBkZXBzLnBhdGhUb05hbWVzKSkge1xuICAgICAgICBkZXBzLnBhdGhUb05hbWVzW3BhdGhdID0ge307XG4gICAgICB9XG4gICAgICBkZXBzLnBhdGhUb05hbWVzW3BhdGhdW3Byb3ZpZGVdID0gdHJ1ZTtcbiAgICB9XG4gICAgZm9yICh2YXIgaiA9IDA7IHJlcXVpcmUgPSByZXF1aXJlc1tqXTsgaisrKSB7XG4gICAgICBpZiAoIShwYXRoIGluIGRlcHMucmVxdWlyZXMpKSB7XG4gICAgICAgIGRlcHMucmVxdWlyZXNbcGF0aF0gPSB7fTtcbiAgICAgIH1cbiAgICAgIGRlcHMucmVxdWlyZXNbcGF0aF1bcmVxdWlyZV0gPSB0cnVlO1xuICAgIH1cbiAgfVxufTtcblxuXG5cblxuLy8gTk9URShubmF6ZSk6IFRoZSBkZWJ1ZyBET00gbG9hZGVyIHdhcyBpbmNsdWRlZCBpbiBiYXNlLmpzIGFzIGFuIG9yaWduYWxcbi8vIHdheSB0byBkbyBcImRlYnVnLW1vZGVcIiBkZXZlbG9wbWVudC4gIFRoZSBkZXBlbmRlbmN5IHN5c3RlbSBjYW4gc29tZXRpbWVzXG4vLyBiZSBjb25mdXNpbmcsIGFzIGNhbiB0aGUgZGVidWcgRE9NIGxvYWRlcidzIGFzeW5jcm9ub3VzIG5hdHVyZS5cbi8vXG4vLyBXaXRoIHRoZSBET00gbG9hZGVyLCBhIGNhbGwgdG8gZ29vZy5yZXF1aXJlKCkgaXMgbm90IGJsb2NraW5nIC0tIHRoZVxuLy8gc2NyaXB0IHdpbGwgbm90IGxvYWQgdW50aWwgc29tZSBwb2ludCBhZnRlciB0aGUgY3VycmVudCBzY3JpcHQuICBJZiBhXG4vLyBuYW1lc3BhY2UgaXMgbmVlZGVkIGF0IHJ1bnRpbWUsIGl0IG5lZWRzIHRvIGJlIGRlZmluZWQgaW4gYSBwcmV2aW91c1xuLy8gc2NyaXB0LCBvciBsb2FkZWQgdmlhIHJlcXVpcmUoKSB3aXRoIGl0cyByZWdpc3RlcmVkIGRlcGVuZGVuY2llcy5cbi8vIFVzZXItZGVmaW5lZCBuYW1lc3BhY2VzIG1heSBuZWVkIHRoZWlyIG93biBkZXBzIGZpbGUuICBTZWUgaHR0cDovL2dvL2pzX2RlcHMsXG4vLyBodHRwOi8vZ28vZ2VuanNkZXBzLCBvciwgZXh0ZXJuYWxseSwgRGVwc1dyaXRlci5cbi8vIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vY2xvc3VyZS9saWJyYXJ5L2RvY3MvZGVwc3dyaXRlci5odG1sXG4vL1xuLy8gQmVjYXVzZSBvZiBsZWdhY3kgY2xpZW50cywgdGhlIERPTSBsb2FkZXIgY2FuJ3QgYmUgZWFzaWx5IHJlbW92ZWQgZnJvbVxuLy8gYmFzZS5qcy4gIFdvcmsgaXMgYmVpbmcgZG9uZSB0byBtYWtlIGl0IGRpc2FibGVhYmxlIG9yIHJlcGxhY2VhYmxlIGZvclxuLy8gZGlmZmVyZW50IGVudmlyb25tZW50cyAoRE9NLWxlc3MgSmF2YVNjcmlwdCBpbnRlcnByZXRlcnMgbGlrZSBSaGlubyBvciBWOCxcbi8vIGZvciBleGFtcGxlKS4gU2VlIGJvb3RzdHJhcC8gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG5cblxuLyoqXG4gKiBAZGVmaW5lIHtib29sZWFufSBXaGV0aGVyIHRvIGVuYWJsZSB0aGUgZGVidWcgbG9hZGVyLlxuICpcbiAqIElmIGVuYWJsZWQsIGEgY2FsbCB0byBnb29nLnJlcXVpcmUoKSB3aWxsIGF0dGVtcHQgdG8gbG9hZCB0aGUgbmFtZXNwYWNlIGJ5XG4gKiBhcHBlbmRpbmcgYSBzY3JpcHQgdGFnIHRvIHRoZSBET00gKGlmIHRoZSBuYW1lc3BhY2UgaGFzIGJlZW4gcmVnaXN0ZXJlZCkuXG4gKlxuICogSWYgZGlzYWJsZWQsIGdvb2cucmVxdWlyZSgpIHdpbGwgc2ltcGx5IGFzc2VydCB0aGF0IHRoZSBuYW1lc3BhY2UgaGFzIGJlZW5cbiAqIHByb3ZpZGVkIChhbmQgZGVwZW5kIG9uIHRoZSBmYWN0IHRoYXQgc29tZSBvdXRzaWRlIHRvb2wgY29ycmVjdGx5IG9yZGVyZWRcbiAqIHRoZSBzY3JpcHQpLlxuICovXG5nb29nLkVOQUJMRV9ERUJVR19MT0FERVIgPSB0cnVlO1xuXG5cbi8qKlxuICogSW1wbGVtZW50cyBhIHN5c3RlbSBmb3IgdGhlIGR5bmFtaWMgcmVzb2x1dGlvbiBvZiBkZXBlbmRlbmNpZXNcbiAqIHRoYXQgd29ya3MgaW4gcGFyYWxsZWwgd2l0aCB0aGUgQlVJTEQgc3lzdGVtLiBOb3RlIHRoYXQgYWxsIGNhbGxzXG4gKiB0byBnb29nLnJlcXVpcmUgd2lsbCBiZSBzdHJpcHBlZCBieSB0aGUgSlNDb21waWxlciB3aGVuIHRoZVxuICogLS1jbG9zdXJlX3Bhc3Mgb3B0aW9uIGlzIHVzZWQuXG4gKiBAc2VlIGdvb2cucHJvdmlkZVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgTmFtZXNwYWNlIHRvIGluY2x1ZGUgKGFzIHdhcyBnaXZlbiBpbiBnb29nLnByb3ZpZGUoKSlcbiAqICAgICBpbiB0aGUgZm9ybSBcImdvb2cucGFja2FnZS5wYXJ0XCIuXG4gKi9cbmdvb2cucmVxdWlyZSA9IGZ1bmN0aW9uKG5hbWUpIHtcblxuICAvLyBpZiB0aGUgb2JqZWN0IGFscmVhZHkgZXhpc3RzIHdlIGRvIG5vdCBuZWVkIGRvIGRvIGFueXRoaW5nXG4gIC8vIFRPRE8oYXJ2KTogSWYgd2Ugc3RhcnQgdG8gc3VwcG9ydCByZXF1aXJlIGJhc2VkIG9uIGZpbGUgbmFtZSB0aGlzIGhhc1xuICAvLyAgICAgICAgICAgIHRvIGNoYW5nZVxuICAvLyBUT0RPKGFydik6IElmIHdlIGFsbG93IGdvb2cuZm9vLiogdGhpcyBoYXMgdG8gY2hhbmdlXG4gIC8vIFRPRE8oYXJ2KTogSWYgd2UgaW1wbGVtZW50IGR5bmFtaWMgbG9hZCBhZnRlciBwYWdlIGxvYWQgd2Ugc2hvdWxkIHByb2JhYmx5XG4gIC8vICAgICAgICAgICAgbm90IHJlbW92ZSB0aGlzIGNvZGUgZm9yIHRoZSBjb21waWxlZCBvdXRwdXRcbiAgaWYgKCFDT01QSUxFRCkge1xuICAgIGlmIChnb29nLmlzUHJvdmlkZWRfKG5hbWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGdvb2cuRU5BQkxFX0RFQlVHX0xPQURFUikge1xuICAgICAgdmFyIHBhdGggPSBnb29nLmdldFBhdGhGcm9tRGVwc18obmFtZSk7XG4gICAgICBpZiAocGF0aCkge1xuICAgICAgICBnb29nLmluY2x1ZGVkX1twYXRoXSA9IHRydWU7XG4gICAgICAgIGdvb2cud3JpdGVTY3JpcHRzXygpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGVycm9yTWVzc2FnZSA9ICdnb29nLnJlcXVpcmUgY291bGQgbm90IGZpbmQ6ICcgKyBuYW1lO1xuICAgIGlmIChnb29nLmdsb2JhbC5jb25zb2xlKSB7XG4gICAgICBnb29nLmdsb2JhbC5jb25zb2xlWydlcnJvciddKGVycm9yTWVzc2FnZSk7XG4gICAgfVxuXG5cbiAgICAgIHRocm93IEVycm9yKGVycm9yTWVzc2FnZSk7XG5cbiAgfVxufTtcblxuXG4vKipcbiAqIFBhdGggZm9yIGluY2x1ZGVkIHNjcmlwdHNcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmdvb2cuYmFzZVBhdGggPSAnJztcblxuXG4vKipcbiAqIEEgaG9vayBmb3Igb3ZlcnJpZGluZyB0aGUgYmFzZSBwYXRoLlxuICogQHR5cGUge3N0cmluZ3x1bmRlZmluZWR9XG4gKi9cbmdvb2cuZ2xvYmFsLkNMT1NVUkVfQkFTRV9QQVRIO1xuXG5cbi8qKlxuICogV2hldGhlciB0byB3cml0ZSBvdXQgQ2xvc3VyZSdzIGRlcHMgZmlsZS4gQnkgZGVmYXVsdCxcbiAqIHRoZSBkZXBzIGFyZSB3cml0dGVuLlxuICogQHR5cGUge2Jvb2xlYW58dW5kZWZpbmVkfVxuICovXG5nb29nLmdsb2JhbC5DTE9TVVJFX05PX0RFUFM7XG5cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRvIGltcG9ydCBhIHNpbmdsZSBzY3JpcHQuIFRoaXMgaXMgbWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiB3aGVuXG4gKiBDbG9zdXJlIGlzIGJlaW5nIHJ1biBpbiBub24tSFRNTCBjb250ZXh0cywgc3VjaCBhcyB3ZWIgd29ya2Vycy4gSXQncyBkZWZpbmVkXG4gKiBpbiB0aGUgZ2xvYmFsIHNjb3BlIHNvIHRoYXQgaXQgY2FuIGJlIHNldCBiZWZvcmUgYmFzZS5qcyBpcyBsb2FkZWQsIHdoaWNoXG4gKiBhbGxvd3MgZGVwcy5qcyB0byBiZSBpbXBvcnRlZCBwcm9wZXJseS5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gaXMgcGFzc2VkIHRoZSBzY3JpcHQgc291cmNlLCB3aGljaCBpcyBhIHJlbGF0aXZlIFVSSS4gSXQgc2hvdWxkXG4gKiByZXR1cm4gdHJ1ZSBpZiB0aGUgc2NyaXB0IHdhcyBpbXBvcnRlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5nb29nLmdsb2JhbC5DTE9TVVJFX0lNUE9SVF9TQ1JJUFQ7XG5cblxuLyoqXG4gKiBOdWxsIGZ1bmN0aW9uIHVzZWQgZm9yIGRlZmF1bHQgdmFsdWVzIG9mIGNhbGxiYWNrcywgZXRjLlxuICogQHJldHVybiB7dm9pZH0gTm90aGluZy5cbiAqL1xuZ29vZy5udWxsRnVuY3Rpb24gPSBmdW5jdGlvbigpIHt9O1xuXG5cbi8qKlxuICogVGhlIGlkZW50aXR5IGZ1bmN0aW9uLiBSZXR1cm5zIGl0cyBmaXJzdCBhcmd1bWVudC5cbiAqXG4gKiBAcGFyYW0geyo9fSBvcHRfcmV0dXJuVmFsdWUgVGhlIHNpbmdsZSB2YWx1ZSB0aGF0IHdpbGwgYmUgcmV0dXJuZWQuXG4gKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIE9wdGlvbmFsIHRyYWlsaW5nIGFyZ3VtZW50cy4gVGhlc2UgYXJlIGlnbm9yZWQuXG4gKiBAcmV0dXJuIHs/fSBUaGUgZmlyc3QgYXJndW1lbnQuIFdlIGNhbid0IGtub3cgdGhlIHR5cGUgLS0ganVzdCBwYXNzIGl0IGFsb25nXG4gKiAgICAgIHdpdGhvdXQgdHlwZS5cbiAqIEBkZXByZWNhdGVkIFVzZSBnb29nLmZ1bmN0aW9ucy5pZGVudGl0eSBpbnN0ZWFkLlxuICovXG5nb29nLmlkZW50aXR5RnVuY3Rpb24gPSBmdW5jdGlvbihvcHRfcmV0dXJuVmFsdWUsIHZhcl9hcmdzKSB7XG4gIHJldHVybiBvcHRfcmV0dXJuVmFsdWU7XG59O1xuXG5cbi8qKlxuICogV2hlbiBkZWZpbmluZyBhIGNsYXNzIEZvbyB3aXRoIGFuIGFic3RyYWN0IG1ldGhvZCBiYXIoKSwgeW91IGNhbiBkbzpcbiAqXG4gKiBGb28ucHJvdG90eXBlLmJhciA9IGdvb2cuYWJzdHJhY3RNZXRob2RcbiAqXG4gKiBOb3cgaWYgYSBzdWJjbGFzcyBvZiBGb28gZmFpbHMgdG8gb3ZlcnJpZGUgYmFyKCksIGFuIGVycm9yXG4gKiB3aWxsIGJlIHRocm93biB3aGVuIGJhcigpIGlzIGludm9rZWQuXG4gKlxuICogTm90ZTogVGhpcyBkb2VzIG5vdCB0YWtlIHRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbiB0byBvdmVycmlkZSBhc1xuICogYW4gYXJndW1lbnQgYmVjYXVzZSB0aGF0IHdvdWxkIG1ha2UgaXQgbW9yZSBkaWZmaWN1bHQgdG8gb2JmdXNjYXRlXG4gKiBvdXIgSmF2YVNjcmlwdCBjb2RlLlxuICpcbiAqIEB0eXBlIHshRnVuY3Rpb259XG4gKiBAdGhyb3dzIHtFcnJvcn0gd2hlbiBpbnZva2VkIHRvIGluZGljYXRlIHRoZSBtZXRob2Qgc2hvdWxkIGJlXG4gKiAgIG92ZXJyaWRkZW4uXG4gKi9cbmdvb2cuYWJzdHJhY3RNZXRob2QgPSBmdW5jdGlvbigpIHtcbiAgdGhyb3cgRXJyb3IoJ3VuaW1wbGVtZW50ZWQgYWJzdHJhY3QgbWV0aG9kJyk7XG59O1xuXG5cbi8qKlxuICogQWRkcyBhIHtAY29kZSBnZXRJbnN0YW5jZX0gc3RhdGljIG1ldGhvZCB0aGF0IGFsd2F5cyByZXR1cm4gdGhlIHNhbWUgaW5zdGFuY2VcbiAqIG9iamVjdC5cbiAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBjdG9yIFRoZSBjb25zdHJ1Y3RvciBmb3IgdGhlIGNsYXNzIHRvIGFkZCB0aGUgc3RhdGljXG4gKiAgICAgbWV0aG9kIHRvLlxuICovXG5nb29nLmFkZFNpbmdsZXRvbkdldHRlciA9IGZ1bmN0aW9uKGN0b3IpIHtcbiAgY3Rvci5nZXRJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChjdG9yLmluc3RhbmNlXykge1xuICAgICAgcmV0dXJuIGN0b3IuaW5zdGFuY2VfO1xuICAgIH1cbiAgICBpZiAoZ29vZy5ERUJVRykge1xuICAgICAgLy8gTk9URTogSlNDb21waWxlciBjYW4ndCBvcHRpbWl6ZSBhd2F5IEFycmF5I3B1c2guXG4gICAgICBnb29nLmluc3RhbnRpYXRlZFNpbmdsZXRvbnNfW2dvb2cuaW5zdGFudGlhdGVkU2luZ2xldG9uc18ubGVuZ3RoXSA9IGN0b3I7XG4gICAgfVxuICAgIHJldHVybiBjdG9yLmluc3RhbmNlXyA9IG5ldyBjdG9yO1xuICB9O1xufTtcblxuXG4vKipcbiAqIEFsbCBzaW5nbGV0b24gY2xhc3NlcyB0aGF0IGhhdmUgYmVlbiBpbnN0YW50aWF0ZWQsIGZvciB0ZXN0aW5nLiBEb24ndCByZWFkXG4gKiBpdCBkaXJlY3RseSwgdXNlIHRoZSB7QGNvZGUgZ29vZy50ZXN0aW5nLnNpbmdsZXRvbn0gbW9kdWxlLiBUaGUgY29tcGlsZXJcbiAqIHJlbW92ZXMgdGhpcyB2YXJpYWJsZSBpZiB1bnVzZWQuXG4gKiBAdHlwZSB7IUFycmF5LjwhRnVuY3Rpb24+fVxuICogQHByaXZhdGVcbiAqL1xuZ29vZy5pbnN0YW50aWF0ZWRTaW5nbGV0b25zXyA9IFtdO1xuXG5cbmlmICghQ09NUElMRUQgJiYgZ29vZy5FTkFCTEVfREVCVUdfTE9BREVSKSB7XG4gIC8qKlxuICAgKiBPYmplY3QgdXNlZCB0byBrZWVwIHRyYWNrIG9mIHVybHMgdGhhdCBoYXZlIGFscmVhZHkgYmVlbiBhZGRlZC4gVGhpc1xuICAgKiByZWNvcmQgYWxsb3dzIHRoZSBwcmV2ZW50aW9uIG9mIGNpcmN1bGFyIGRlcGVuZGVuY2llcy5cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdvb2cuaW5jbHVkZWRfID0ge307XG5cblxuICAvKipcbiAgICogVGhpcyBvYmplY3QgaXMgdXNlZCB0byBrZWVwIHRyYWNrIG9mIGRlcGVuZGVuY2llcyBhbmQgb3RoZXIgZGF0YSB0aGF0IGlzXG4gICAqIHVzZWQgZm9yIGxvYWRpbmcgc2NyaXB0c1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgZ29vZy5kZXBlbmRlbmNpZXNfID0ge1xuICAgIHBhdGhUb05hbWVzOiB7fSwgLy8gMSB0byBtYW55XG4gICAgbmFtZVRvUGF0aDoge30sIC8vIDEgdG8gMVxuICAgIHJlcXVpcmVzOiB7fSwgLy8gMSB0byBtYW55XG4gICAgLy8gdXNlZCB3aGVuIHJlc29sdmluZyBkZXBlbmRlbmNpZXMgdG8gcHJldmVudCB1cyBmcm9tXG4gICAgLy8gdmlzaXRpbmcgdGhlIGZpbGUgdHdpY2VcbiAgICB2aXNpdGVkOiB7fSxcbiAgICB3cml0dGVuOiB7fSAvLyB1c2VkIHRvIGtlZXAgdHJhY2sgb2Ygc2NyaXB0IGZpbGVzIHdlIGhhdmUgd3JpdHRlblxuICB9O1xuXG5cbiAgLyoqXG4gICAqIFRyaWVzIHRvIGRldGVjdCB3aGV0aGVyIGlzIGluIHRoZSBjb250ZXh0IG9mIGFuIEhUTUwgZG9jdW1lbnQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgaXQgbG9va3MgbGlrZSBIVE1MIGRvY3VtZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy5pbkh0bWxEb2N1bWVudF8gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZG9jID0gZ29vZy5nbG9iYWwuZG9jdW1lbnQ7XG4gICAgcmV0dXJuIHR5cGVvZiBkb2MgIT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgJ3dyaXRlJyBpbiBkb2M7ICAvLyBYVUxEb2N1bWVudCBtaXNzZXMgd3JpdGUuXG4gIH07XG5cblxuICAvKipcbiAgICogVHJpZXMgdG8gZGV0ZWN0IHRoZSBiYXNlIHBhdGggb2YgdGhlIGJhc2UuanMgc2NyaXB0IHRoYXQgYm9vdHN0cmFwcyBDbG9zdXJlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnb29nLmZpbmRCYXNlUGF0aF8gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoZ29vZy5nbG9iYWwuQ0xPU1VSRV9CQVNFX1BBVEgpIHtcbiAgICAgIGdvb2cuYmFzZVBhdGggPSBnb29nLmdsb2JhbC5DTE9TVVJFX0JBU0VfUEFUSDtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKCFnb29nLmluSHRtbERvY3VtZW50XygpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBkb2MgPSBnb29nLmdsb2JhbC5kb2N1bWVudDtcbiAgICB2YXIgc2NyaXB0cyA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0Jyk7XG4gICAgLy8gU2VhcmNoIGJhY2t3YXJkcyBzaW5jZSB0aGUgY3VycmVudCBzY3JpcHQgaXMgaW4gYWxtb3N0IGFsbCBjYXNlcyB0aGUgb25lXG4gICAgLy8gdGhhdCBoYXMgYmFzZS5qcy5cbiAgICBmb3IgKHZhciBpID0gc2NyaXB0cy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdmFyIHNyYyA9IHNjcmlwdHNbaV0uc3JjO1xuICAgICAgdmFyIHFtYXJrID0gc3JjLmxhc3RJbmRleE9mKCc/Jyk7XG4gICAgICB2YXIgbCA9IHFtYXJrID09IC0xID8gc3JjLmxlbmd0aCA6IHFtYXJrO1xuICAgICAgaWYgKHNyYy5zdWJzdHIobCAtIDcsIDcpID09ICdiYXNlLmpzJykge1xuICAgICAgICBnb29nLmJhc2VQYXRoID0gc3JjLnN1YnN0cigwLCBsIC0gNyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cblxuICAvKipcbiAgICogSW1wb3J0cyBhIHNjcmlwdCBpZiwgYW5kIG9ubHkgaWYsIHRoYXQgc2NyaXB0IGhhc24ndCBhbHJlYWR5IGJlZW4gaW1wb3J0ZWQuXG4gICAqIChNdXN0IGJlIGNhbGxlZCBhdCBleGVjdXRpb24gdGltZSlcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNyYyBTY3JpcHQgc291cmNlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy5pbXBvcnRTY3JpcHRfID0gZnVuY3Rpb24oc3JjKSB7XG4gICAgdmFyIGltcG9ydFNjcmlwdCA9IGdvb2cuZ2xvYmFsLkNMT1NVUkVfSU1QT1JUX1NDUklQVCB8fFxuICAgICAgICBnb29nLndyaXRlU2NyaXB0VGFnXztcbiAgICBpZiAoIWdvb2cuZGVwZW5kZW5jaWVzXy53cml0dGVuW3NyY10gJiYgaW1wb3J0U2NyaXB0KHNyYykpIHtcbiAgICAgIGdvb2cuZGVwZW5kZW5jaWVzXy53cml0dGVuW3NyY10gPSB0cnVlO1xuICAgIH1cbiAgfTtcblxuXG4gIC8qKlxuICAgKiBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgaW1wb3J0IGZ1bmN0aW9uLiBXcml0ZXMgYSBzY3JpcHQgdGFnIHRvXG4gICAqIGltcG9ydCB0aGUgc2NyaXB0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3JjIFRoZSBzY3JpcHQgc291cmNlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBzY3JpcHQgd2FzIGltcG9ydGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnb29nLndyaXRlU2NyaXB0VGFnXyA9IGZ1bmN0aW9uKHNyYykge1xuICAgIGlmIChnb29nLmluSHRtbERvY3VtZW50XygpKSB7XG4gICAgICB2YXIgZG9jID0gZ29vZy5nbG9iYWwuZG9jdW1lbnQ7XG4gICAgICBkb2Mud3JpdGUoXG4gICAgICAgICAgJzxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cIicgKyBzcmMgKyAnXCI+PC8nICsgJ3NjcmlwdD4nKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuXG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIGRlcGVuZGVuY2llcyBiYXNlZCBvbiB0aGUgZGVwZW5kZW5jaWVzIGFkZGVkIHVzaW5nIGFkZERlcGVuZGVuY3lcbiAgICogYW5kIGNhbGxzIGltcG9ydFNjcmlwdF8gaW4gdGhlIGNvcnJlY3Qgb3JkZXIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnb29nLndyaXRlU2NyaXB0c18gPSBmdW5jdGlvbigpIHtcbiAgICAvLyB0aGUgc2NyaXB0cyB3ZSBuZWVkIHRvIHdyaXRlIHRoaXMgdGltZVxuICAgIHZhciBzY3JpcHRzID0gW107XG4gICAgdmFyIHNlZW5TY3JpcHQgPSB7fTtcbiAgICB2YXIgZGVwcyA9IGdvb2cuZGVwZW5kZW5jaWVzXztcblxuICAgIGZ1bmN0aW9uIHZpc2l0Tm9kZShwYXRoKSB7XG4gICAgICBpZiAocGF0aCBpbiBkZXBzLndyaXR0ZW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyB3ZSBoYXZlIGFscmVhZHkgdmlzaXRlZCB0aGlzIG9uZS4gV2UgY2FuIGdldCBoZXJlIGlmIHdlIGhhdmUgY3ljbGljXG4gICAgICAvLyBkZXBlbmRlbmNpZXNcbiAgICAgIGlmIChwYXRoIGluIGRlcHMudmlzaXRlZCkge1xuICAgICAgICBpZiAoIShwYXRoIGluIHNlZW5TY3JpcHQpKSB7XG4gICAgICAgICAgc2VlblNjcmlwdFtwYXRoXSA9IHRydWU7XG4gICAgICAgICAgc2NyaXB0cy5wdXNoKHBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZGVwcy52aXNpdGVkW3BhdGhdID0gdHJ1ZTtcblxuICAgICAgaWYgKHBhdGggaW4gZGVwcy5yZXF1aXJlcykge1xuICAgICAgICBmb3IgKHZhciByZXF1aXJlTmFtZSBpbiBkZXBzLnJlcXVpcmVzW3BhdGhdKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHJlcXVpcmVkIG5hbWUgaXMgZGVmaW5lZCwgd2UgYXNzdW1lIHRoYXQgaXQgd2FzIGFscmVhZHlcbiAgICAgICAgICAvLyBib290c3RyYXBwZWQgYnkgb3RoZXIgbWVhbnMuXG4gICAgICAgICAgaWYgKCFnb29nLmlzUHJvdmlkZWRfKHJlcXVpcmVOYW1lKSkge1xuICAgICAgICAgICAgaWYgKHJlcXVpcmVOYW1lIGluIGRlcHMubmFtZVRvUGF0aCkge1xuICAgICAgICAgICAgICB2aXNpdE5vZGUoZGVwcy5uYW1lVG9QYXRoW3JlcXVpcmVOYW1lXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBFcnJvcignVW5kZWZpbmVkIG5hbWVUb1BhdGggZm9yICcgKyByZXF1aXJlTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghKHBhdGggaW4gc2VlblNjcmlwdCkpIHtcbiAgICAgICAgc2VlblNjcmlwdFtwYXRoXSA9IHRydWU7XG4gICAgICAgIHNjcmlwdHMucHVzaChwYXRoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBwYXRoIGluIGdvb2cuaW5jbHVkZWRfKSB7XG4gICAgICBpZiAoIWRlcHMud3JpdHRlbltwYXRoXSkge1xuICAgICAgICB2aXNpdE5vZGUocGF0aCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoc2NyaXB0c1tpXSkge1xuICAgICAgICBnb29nLmltcG9ydFNjcmlwdF8oZ29vZy5iYXNlUGF0aCArIHNjcmlwdHNbaV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ1VuZGVmaW5lZCBzY3JpcHQgaW5wdXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cblxuICAvKipcbiAgICogTG9va3MgYXQgdGhlIGRlcGVuZGVuY3kgcnVsZXMgYW5kIHRyaWVzIHRvIGRldGVybWluZSB0aGUgc2NyaXB0IGZpbGUgdGhhdFxuICAgKiBmdWxmaWxscyBhIHBhcnRpY3VsYXIgcnVsZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHJ1bGUgSW4gdGhlIGZvcm0gZ29vZy5uYW1lc3BhY2UuQ2xhc3Mgb3IgcHJvamVjdC5zY3JpcHQuXG4gICAqIEByZXR1cm4gez9zdHJpbmd9IFVybCBjb3JyZXNwb25kaW5nIHRvIHRoZSBydWxlLCBvciBudWxsLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy5nZXRQYXRoRnJvbURlcHNfID0gZnVuY3Rpb24ocnVsZSkge1xuICAgIGlmIChydWxlIGluIGdvb2cuZGVwZW5kZW5jaWVzXy5uYW1lVG9QYXRoKSB7XG4gICAgICByZXR1cm4gZ29vZy5kZXBlbmRlbmNpZXNfLm5hbWVUb1BhdGhbcnVsZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcblxuICBnb29nLmZpbmRCYXNlUGF0aF8oKTtcblxuICAvLyBBbGxvdyBwcm9qZWN0cyB0byBtYW5hZ2UgdGhlIGRlcHMgZmlsZXMgdGhlbXNlbHZlcy5cbiAgaWYgKCFnb29nLmdsb2JhbC5DTE9TVVJFX05PX0RFUFMpIHtcbiAgICBnb29nLmltcG9ydFNjcmlwdF8oZ29vZy5iYXNlUGF0aCArICdkZXBzLmpzJyk7XG4gIH1cbn1cblxuXG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBMYW5ndWFnZSBFbmhhbmNlbWVudHNcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cblxuLyoqXG4gKiBUaGlzIGlzIGEgXCJmaXhlZFwiIHZlcnNpb24gb2YgdGhlIHR5cGVvZiBvcGVyYXRvci4gIEl0IGRpZmZlcnMgZnJvbSB0aGUgdHlwZW9mXG4gKiBvcGVyYXRvciBpbiBzdWNoIGEgd2F5IHRoYXQgbnVsbCByZXR1cm5zICdudWxsJyBhbmQgYXJyYXlzIHJldHVybiAnYXJyYXknLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gZ2V0IHRoZSB0eXBlIG9mLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgbmFtZSBvZiB0aGUgdHlwZS5cbiAqL1xuZ29vZy50eXBlT2YgPSBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgcyA9IHR5cGVvZiB2YWx1ZTtcbiAgaWYgKHMgPT0gJ29iamVjdCcpIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIC8vIENoZWNrIHRoZXNlIGZpcnN0LCBzbyB3ZSBjYW4gYXZvaWQgY2FsbGluZyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nIGlmXG4gICAgICAvLyBwb3NzaWJsZS5cbiAgICAgIC8vXG4gICAgICAvLyBJRSBpbXByb3Blcmx5IG1hcnNoYWxzIHR5ZXBvZiBhY3Jvc3MgZXhlY3V0aW9uIGNvbnRleHRzLCBidXQgYVxuICAgICAgLy8gY3Jvc3MtY29udGV4dCBvYmplY3Qgd2lsbCBzdGlsbCByZXR1cm4gZmFsc2UgZm9yIFwiaW5zdGFuY2VvZiBPYmplY3RcIi5cbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHJldHVybiAnYXJyYXknO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICByZXR1cm4gcztcbiAgICAgIH1cblxuICAgICAgLy8gSEFDSzogSW4gb3JkZXIgdG8gdXNlIGFuIE9iamVjdCBwcm90b3R5cGUgbWV0aG9kIG9uIHRoZSBhcmJpdHJhcnlcbiAgICAgIC8vICAgdmFsdWUsIHRoZSBjb21waWxlciByZXF1aXJlcyB0aGUgdmFsdWUgYmUgY2FzdCB0byB0eXBlIE9iamVjdCxcbiAgICAgIC8vICAgZXZlbiB0aG91Z2ggdGhlIEVDTUEgc3BlYyBleHBsaWNpdGx5IGFsbG93cyBpdC5cbiAgICAgIHZhciBjbGFzc05hbWUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoXG4gICAgICAgICAgLyoqIEB0eXBlIHtPYmplY3R9ICovICh2YWx1ZSkpO1xuICAgICAgLy8gSW4gRmlyZWZveCAzLjYsIGF0dGVtcHRpbmcgdG8gYWNjZXNzIGlmcmFtZSB3aW5kb3cgb2JqZWN0cycgbGVuZ3RoXG4gICAgICAvLyBwcm9wZXJ0eSB0aHJvd3MgYW4gTlNfRVJST1JfRkFJTFVSRSwgc28gd2UgbmVlZCB0byBzcGVjaWFsLWNhc2UgaXRcbiAgICAgIC8vIGhlcmUuXG4gICAgICBpZiAoY2xhc3NOYW1lID09ICdbb2JqZWN0IFdpbmRvd10nKSB7XG4gICAgICAgIHJldHVybiAnb2JqZWN0JztcbiAgICAgIH1cblxuICAgICAgLy8gV2UgY2Fubm90IGFsd2F5cyB1c2UgY29uc3RydWN0b3IgPT0gQXJyYXkgb3IgaW5zdGFuY2VvZiBBcnJheSBiZWNhdXNlXG4gICAgICAvLyBkaWZmZXJlbnQgZnJhbWVzIGhhdmUgZGlmZmVyZW50IEFycmF5IG9iamVjdHMuIEluIElFNiwgaWYgdGhlIGlmcmFtZVxuICAgICAgLy8gd2hlcmUgdGhlIGFycmF5IHdhcyBjcmVhdGVkIGlzIGRlc3Ryb3llZCwgdGhlIGFycmF5IGxvc2VzIGl0c1xuICAgICAgLy8gcHJvdG90eXBlLiBUaGVuIGRlcmVmZXJlbmNpbmcgdmFsLnNwbGljZSBoZXJlIHRocm93cyBhbiBleGNlcHRpb24sIHNvXG4gICAgICAvLyB3ZSBjYW4ndCB1c2UgZ29vZy5pc0Z1bmN0aW9uLiBDYWxsaW5nIHR5cGVvZiBkaXJlY3RseSByZXR1cm5zICd1bmtub3duJ1xuICAgICAgLy8gc28gdGhhdCB3aWxsIHdvcmsuIEluIHRoaXMgY2FzZSwgdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiBmYWxzZSBhbmRcbiAgICAgIC8vIG1vc3QgYXJyYXkgZnVuY3Rpb25zIHdpbGwgc3RpbGwgd29yayBiZWNhdXNlIHRoZSBhcnJheSBpcyBzdGlsbFxuICAgICAgLy8gYXJyYXktbGlrZSAoc3VwcG9ydHMgbGVuZ3RoIGFuZCBbXSkgZXZlbiB0aG91Z2ggaXQgaGFzIGxvc3QgaXRzXG4gICAgICAvLyBwcm90b3R5cGUuXG4gICAgICAvLyBNYXJrIE1pbGxlciBub3RpY2VkIHRoYXQgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuICAgICAgLy8gYWxsb3dzIGFjY2VzcyB0byB0aGUgdW5mb3JnZWFibGUgW1tDbGFzc11dIHByb3BlcnR5LlxuICAgICAgLy8gIDE1LjIuNC4yIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcgKCApXG4gICAgICAvLyAgV2hlbiB0aGUgdG9TdHJpbmcgbWV0aG9kIGlzIGNhbGxlZCwgdGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gICAgICAvLyAgICAgIDEuIEdldCB0aGUgW1tDbGFzc11dIHByb3BlcnR5IG9mIHRoaXMgb2JqZWN0LlxuICAgICAgLy8gICAgICAyLiBDb21wdXRlIGEgc3RyaW5nIHZhbHVlIGJ5IGNvbmNhdGVuYXRpbmcgdGhlIHRocmVlIHN0cmluZ3NcbiAgICAgIC8vICAgICAgICAgXCJbb2JqZWN0IFwiLCBSZXN1bHQoMSksIGFuZCBcIl1cIi5cbiAgICAgIC8vICAgICAgMy4gUmV0dXJuIFJlc3VsdCgyKS5cbiAgICAgIC8vIGFuZCB0aGlzIGJlaGF2aW9yIHN1cnZpdmVzIHRoZSBkZXN0cnVjdGlvbiBvZiB0aGUgZXhlY3V0aW9uIGNvbnRleHQuXG4gICAgICBpZiAoKGNsYXNzTmFtZSA9PSAnW29iamVjdCBBcnJheV0nIHx8XG4gICAgICAgICAgIC8vIEluIElFIGFsbCBub24gdmFsdWUgdHlwZXMgYXJlIHdyYXBwZWQgYXMgb2JqZWN0cyBhY3Jvc3Mgd2luZG93XG4gICAgICAgICAgIC8vIGJvdW5kYXJpZXMgKG5vdCBpZnJhbWUgdGhvdWdoKSBzbyB3ZSBoYXZlIHRvIGRvIG9iamVjdCBkZXRlY3Rpb25cbiAgICAgICAgICAgLy8gZm9yIHRoaXMgZWRnZSBjYXNlXG4gICAgICAgICAgIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICAgICAgICAgdHlwZW9mIHZhbHVlLnNwbGljZSAhPSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICB0eXBlb2YgdmFsdWUucHJvcGVydHlJc0VudW1lcmFibGUgIT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgIXZhbHVlLnByb3BlcnR5SXNFbnVtZXJhYmxlKCdzcGxpY2UnKVxuXG4gICAgICAgICAgKSkge1xuICAgICAgICByZXR1cm4gJ2FycmF5JztcbiAgICAgIH1cbiAgICAgIC8vIEhBQ0s6IFRoZXJlIGlzIHN0aWxsIGFuIGFycmF5IGNhc2UgdGhhdCBmYWlscy5cbiAgICAgIC8vICAgICBmdW5jdGlvbiBBcnJheUltcG9zdG9yKCkge31cbiAgICAgIC8vICAgICBBcnJheUltcG9zdG9yLnByb3RvdHlwZSA9IFtdO1xuICAgICAgLy8gICAgIHZhciBpbXBvc3RvciA9IG5ldyBBcnJheUltcG9zdG9yO1xuICAgICAgLy8gdGhpcyBjYW4gYmUgZml4ZWQgYnkgZ2V0dGluZyByaWQgb2YgdGhlIGZhc3QgcGF0aFxuICAgICAgLy8gKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpIGFuZCBzb2xlbHkgcmVseWluZyBvblxuICAgICAgLy8gKHZhbHVlICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcudmFsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScpXG4gICAgICAvLyBidXQgdGhhdCB3b3VsZCByZXF1aXJlIG1hbnkgbW9yZSBmdW5jdGlvbiBjYWxscyBhbmQgaXMgbm90IHdhcnJhbnRlZFxuICAgICAgLy8gdW5sZXNzIGNsb3N1cmUgY29kZSBpcyByZWNlaXZpbmcgb2JqZWN0cyBmcm9tIHVudHJ1c3RlZCBzb3VyY2VzLlxuXG4gICAgICAvLyBJRSBpbiBjcm9zcy13aW5kb3cgY2FsbHMgZG9lcyBub3QgY29ycmVjdGx5IG1hcnNoYWwgdGhlIGZ1bmN0aW9uIHR5cGVcbiAgICAgIC8vIChpdCBhcHBlYXJzIGp1c3QgYXMgYW4gb2JqZWN0KSBzbyB3ZSBjYW5ub3QgdXNlIGp1c3QgdHlwZW9mIHZhbCA9PVxuICAgICAgLy8gJ2Z1bmN0aW9uJy4gSG93ZXZlciwgaWYgdGhlIG9iamVjdCBoYXMgYSBjYWxsIHByb3BlcnR5LCBpdCBpcyBhXG4gICAgICAvLyBmdW5jdGlvbi5cbiAgICAgIGlmICgoY2xhc3NOYW1lID09ICdbb2JqZWN0IEZ1bmN0aW9uXScgfHxcbiAgICAgICAgICB0eXBlb2YgdmFsdWUuY2FsbCAhPSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgIHR5cGVvZiB2YWx1ZS5wcm9wZXJ0eUlzRW51bWVyYWJsZSAhPSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICF2YWx1ZS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgnY2FsbCcpKSkge1xuICAgICAgICByZXR1cm4gJ2Z1bmN0aW9uJztcbiAgICAgIH1cblxuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnbnVsbCc7XG4gICAgfVxuXG4gIH0gZWxzZSBpZiAocyA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWx1ZS5jYWxsID09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gSW4gU2FmYXJpIHR5cGVvZiBub2RlTGlzdCByZXR1cm5zICdmdW5jdGlvbicsIGFuZCBvbiBGaXJlZm94XG4gICAgLy8gdHlwZW9mIGJlaGF2ZXMgc2ltaWxhcmx5IGZvciBIVE1Me0FwcGxldCxFbWJlZCxPYmplY3R9RWxlbWVudHNcbiAgICAvLyBhbmQgUmVnRXhwcy4gIFdlIHdvdWxkIGxpa2UgdG8gcmV0dXJuIG9iamVjdCBmb3IgdGhvc2UgYW5kIHdlIGNhblxuICAgIC8vIGRldGVjdCBhbiBpbnZhbGlkIGZ1bmN0aW9uIGJ5IG1ha2luZyBzdXJlIHRoYXQgdGhlIGZ1bmN0aW9uXG4gICAgLy8gb2JqZWN0IGhhcyBhIGNhbGwgbWV0aG9kLlxuICAgIHJldHVybiAnb2JqZWN0JztcbiAgfVxuICByZXR1cm4gcztcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBub3QgfHVuZGVmaW5lZHwuXG4gKiBXQVJOSU5HOiBEbyBub3QgdXNlIHRoaXMgdG8gdGVzdCBpZiBhbiBvYmplY3QgaGFzIGEgcHJvcGVydHkuIFVzZSB0aGUgaW5cbiAqIG9wZXJhdG9yIGluc3RlYWQuICBBZGRpdGlvbmFsbHksIHRoaXMgZnVuY3Rpb24gYXNzdW1lcyB0aGF0IHRoZSBnbG9iYWxcbiAqIHVuZGVmaW5lZCB2YXJpYWJsZSBoYXMgbm90IGJlZW4gcmVkZWZpbmVkLlxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgZGVmaW5lZC5cbiAqL1xuZ29vZy5pc0RlZiA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQ7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgfG51bGx8XG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBudWxsLlxuICovXG5nb29nLmlzTnVsbCA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdmFsID09PSBudWxsO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGRlZmluZWQgYW5kIG5vdCBudWxsXG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBkZWZpbmVkIGFuZCBub3QgbnVsbC5cbiAqL1xuZ29vZy5pc0RlZkFuZE5vdE51bGwgPSBmdW5jdGlvbih2YWwpIHtcbiAgLy8gTm90ZSB0aGF0IHVuZGVmaW5lZCA9PSBudWxsLlxuICByZXR1cm4gdmFsICE9IG51bGw7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYW4gYXJyYXlcbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGFuIGFycmF5LlxuICovXG5nb29nLmlzQXJyYXkgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIGdvb2cudHlwZU9mKHZhbCkgPT0gJ2FycmF5Jztcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9iamVjdCBsb29rcyBsaWtlIGFuIGFycmF5LiBUbyBxdWFsaWZ5IGFzIGFycmF5IGxpa2VcbiAqIHRoZSB2YWx1ZSBuZWVkcyB0byBiZSBlaXRoZXIgYSBOb2RlTGlzdCBvciBhbiBvYmplY3Qgd2l0aCBhIE51bWJlciBsZW5ndGhcbiAqIHByb3BlcnR5LlxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgYW4gYXJyYXkuXG4gKi9cbmdvb2cuaXNBcnJheUxpa2UgPSBmdW5jdGlvbih2YWwpIHtcbiAgdmFyIHR5cGUgPSBnb29nLnR5cGVPZih2YWwpO1xuICByZXR1cm4gdHlwZSA9PSAnYXJyYXknIHx8IHR5cGUgPT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbC5sZW5ndGggPT0gJ251bWJlcic7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBvYmplY3QgbG9va3MgbGlrZSBhIERhdGUuIFRvIHF1YWxpZnkgYXMgRGF0ZS1saWtlXG4gKiB0aGUgdmFsdWUgbmVlZHMgdG8gYmUgYW4gb2JqZWN0IGFuZCBoYXZlIGEgZ2V0RnVsbFllYXIoKSBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGEgbGlrZSBhIERhdGUuXG4gKi9cbmdvb2cuaXNEYXRlTGlrZSA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gZ29vZy5pc09iamVjdCh2YWwpICYmIHR5cGVvZiB2YWwuZ2V0RnVsbFllYXIgPT0gJ2Z1bmN0aW9uJztcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBhIHN0cmluZ1xuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgYSBzdHJpbmcuXG4gKi9cbmdvb2cuaXNTdHJpbmcgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT0gJ3N0cmluZyc7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYSBib29sZWFuXG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBib29sZWFuLlxuICovXG5nb29nLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PSAnYm9vbGVhbic7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYSBudW1iZXJcbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGEgbnVtYmVyLlxuICovXG5nb29nLmlzTnVtYmVyID0gZnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09ICdudW1iZXInO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGEgZnVuY3Rpb25cbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGEgZnVuY3Rpb24uXG4gKi9cbmdvb2cuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gZ29vZy50eXBlT2YodmFsKSA9PSAnZnVuY3Rpb24nO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGFuIG9iamVjdC4gIFRoaXMgaW5jbHVkZXMgYXJyYXlzXG4gKiBhbmQgZnVuY3Rpb25zLlxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgYW4gb2JqZWN0LlxuICovXG5nb29nLmlzT2JqZWN0ID0gZnVuY3Rpb24odmFsKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgcmV0dXJuIHR5cGUgPT0gJ29iamVjdCcgJiYgdmFsICE9IG51bGwgfHwgdHlwZSA9PSAnZnVuY3Rpb24nO1xuICAvLyByZXR1cm4gT2JqZWN0KHZhbCkgPT09IHZhbCBhbHNvIHdvcmtzLCBidXQgaXMgc2xvd2VyLCBlc3BlY2lhbGx5IGlmIHZhbCBpc1xuICAvLyBub3QgYW4gb2JqZWN0LlxufTtcblxuXG4vKipcbiAqIEdldHMgYSB1bmlxdWUgSUQgZm9yIGFuIG9iamVjdC4gVGhpcyBtdXRhdGVzIHRoZSBvYmplY3Qgc28gdGhhdCBmdXJ0aGVyXG4gKiBjYWxscyB3aXRoIHRoZSBzYW1lIG9iamVjdCBhcyBhIHBhcmFtZXRlciByZXR1cm5zIHRoZSBzYW1lIHZhbHVlLiBUaGUgdW5pcXVlXG4gKiBJRCBpcyBndWFyYW50ZWVkIHRvIGJlIHVuaXF1ZSBhY3Jvc3MgdGhlIGN1cnJlbnQgc2Vzc2lvbiBhbW9uZ3N0IG9iamVjdHMgdGhhdFxuICogYXJlIHBhc3NlZCBpbnRvIHtAY29kZSBnZXRVaWR9LiBUaGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCB0aGUgSUQgaXMgdW5pcXVlXG4gKiBvciBjb25zaXN0ZW50IGFjcm9zcyBzZXNzaW9ucy4gSXQgaXMgdW5zYWZlIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRCBmb3JcbiAqIGZ1bmN0aW9uIHByb3RvdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIGdldCB0aGUgdW5pcXVlIElEIGZvci5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIHVuaXF1ZSBJRCBmb3IgdGhlIG9iamVjdC5cbiAqL1xuZ29vZy5nZXRVaWQgPSBmdW5jdGlvbihvYmopIHtcbiAgLy8gVE9ETyhhcnYpOiBNYWtlIHRoZSB0eXBlIHN0cmljdGVyLCBkbyBub3QgYWNjZXB0IG51bGwuXG5cbiAgLy8gSW4gT3BlcmEgd2luZG93Lmhhc093blByb3BlcnR5IGV4aXN0cyBidXQgYWx3YXlzIHJldHVybnMgZmFsc2Ugc28gd2UgYXZvaWRcbiAgLy8gdXNpbmcgaXQuIEFzIGEgY29uc2VxdWVuY2UgdGhlIHVuaXF1ZSBJRCBnZW5lcmF0ZWQgZm9yIEJhc2VDbGFzcy5wcm90b3R5cGVcbiAgLy8gYW5kIFN1YkNsYXNzLnByb3RvdHlwZSB3aWxsIGJlIHRoZSBzYW1lLlxuICByZXR1cm4gb2JqW2dvb2cuVUlEX1BST1BFUlRZX10gfHxcbiAgICAgIChvYmpbZ29vZy5VSURfUFJPUEVSVFlfXSA9ICsrZ29vZy51aWRDb3VudGVyXyk7XG59O1xuXG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgdW5pcXVlIElEIGZyb20gYW4gb2JqZWN0LiBUaGlzIGlzIHVzZWZ1bCBpZiB0aGUgb2JqZWN0IHdhc1xuICogcHJldmlvdXNseSBtdXRhdGVkIHVzaW5nIHtAY29kZSBnb29nLmdldFVpZH0gaW4gd2hpY2ggY2FzZSB0aGUgbXV0YXRpb24gaXNcbiAqIHVuZG9uZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byByZW1vdmUgdGhlIHVuaXF1ZSBJRCBmaWVsZCBmcm9tLlxuICovXG5nb29nLnJlbW92ZVVpZCA9IGZ1bmN0aW9uKG9iaikge1xuICAvLyBUT0RPKGFydik6IE1ha2UgdGhlIHR5cGUgc3RyaWN0ZXIsIGRvIG5vdCBhY2NlcHQgbnVsbC5cblxuICAvLyBET00gbm9kZXMgaW4gSUUgYXJlIG5vdCBpbnN0YW5jZSBvZiBPYmplY3QgYW5kIHRocm93cyBleGNlcHRpb25cbiAgLy8gZm9yIGRlbGV0ZS4gSW5zdGVhZCB3ZSB0cnkgdG8gdXNlIHJlbW92ZUF0dHJpYnV0ZVxuICBpZiAoJ3JlbW92ZUF0dHJpYnV0ZScgaW4gb2JqKSB7XG4gICAgb2JqLnJlbW92ZUF0dHJpYnV0ZShnb29nLlVJRF9QUk9QRVJUWV8pO1xuICB9XG4gIC8qKiBAcHJlc2VydmVUcnkgKi9cbiAgdHJ5IHtcbiAgICBkZWxldGUgb2JqW2dvb2cuVUlEX1BST1BFUlRZX107XG4gIH0gY2F0Y2ggKGV4KSB7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBOYW1lIGZvciB1bmlxdWUgSUQgcHJvcGVydHkuIEluaXRpYWxpemVkIGluIGEgd2F5IHRvIGhlbHAgYXZvaWQgY29sbGlzaW9uc1xuICogd2l0aCBvdGhlciBjbG9zdXJlIGphdmFzY3JpcHQgb24gdGhlIHNhbWUgcGFnZS5cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG5nb29nLlVJRF9QUk9QRVJUWV8gPSAnY2xvc3VyZV91aWRfJyArXG4gICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjE0NzQ4MzY0OCkudG9TdHJpbmcoMzYpO1xuXG5cbi8qKlxuICogQ291bnRlciBmb3IgVUlELlxuICogQHR5cGUge251bWJlcn1cbiAqIEBwcml2YXRlXG4gKi9cbmdvb2cudWlkQ291bnRlcl8gPSAwO1xuXG5cbi8qKlxuICogQWRkcyBhIGhhc2ggY29kZSBmaWVsZCB0byBhbiBvYmplY3QuIFRoZSBoYXNoIGNvZGUgaXMgdW5pcXVlIGZvciB0aGVcbiAqIGdpdmVuIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBnZXQgdGhlIGhhc2ggY29kZSBmb3IuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBoYXNoIGNvZGUgZm9yIHRoZSBvYmplY3QuXG4gKiBAZGVwcmVjYXRlZCBVc2UgZ29vZy5nZXRVaWQgaW5zdGVhZC5cbiAqL1xuZ29vZy5nZXRIYXNoQ29kZSA9IGdvb2cuZ2V0VWlkO1xuXG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgaGFzaCBjb2RlIGZpZWxkIGZyb20gYW4gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHJlbW92ZSB0aGUgZmllbGQgZnJvbS5cbiAqIEBkZXByZWNhdGVkIFVzZSBnb29nLnJlbW92ZVVpZCBpbnN0ZWFkLlxuICovXG5nb29nLnJlbW92ZUhhc2hDb2RlID0gZ29vZy5yZW1vdmVVaWQ7XG5cblxuLyoqXG4gKiBDbG9uZXMgYSB2YWx1ZS4gVGhlIGlucHV0IG1heSBiZSBhbiBPYmplY3QsIEFycmF5LCBvciBiYXNpYyB0eXBlLiBPYmplY3RzIGFuZFxuICogYXJyYXlzIHdpbGwgYmUgY2xvbmVkIHJlY3Vyc2l2ZWx5LlxuICpcbiAqIFdBUk5JTkdTOlxuICogPGNvZGU+Z29vZy5jbG9uZU9iamVjdDwvY29kZT4gZG9lcyBub3QgZGV0ZWN0IHJlZmVyZW5jZSBsb29wcy4gT2JqZWN0cyB0aGF0XG4gKiByZWZlciB0byB0aGVtc2VsdmVzIHdpbGwgY2F1c2UgaW5maW5pdGUgcmVjdXJzaW9uLlxuICpcbiAqIDxjb2RlPmdvb2cuY2xvbmVPYmplY3Q8L2NvZGU+IGlzIHVuYXdhcmUgb2YgdW5pcXVlIGlkZW50aWZpZXJzLCBhbmQgY29waWVzXG4gKiBVSURzIGNyZWF0ZWQgYnkgPGNvZGU+Z2V0VWlkPC9jb2RlPiBpbnRvIGNsb25lZCByZXN1bHRzLlxuICpcbiAqIEBwYXJhbSB7Kn0gb2JqIFRoZSB2YWx1ZSB0byBjbG9uZS5cbiAqIEByZXR1cm4geyp9IEEgY2xvbmUgb2YgdGhlIGlucHV0IHZhbHVlLlxuICogQGRlcHJlY2F0ZWQgZ29vZy5jbG9uZU9iamVjdCBpcyB1bnNhZmUuIFByZWZlciB0aGUgZ29vZy5vYmplY3QgbWV0aG9kcy5cbiAqL1xuZ29vZy5jbG9uZU9iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICB2YXIgdHlwZSA9IGdvb2cudHlwZU9mKG9iaik7XG4gIGlmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2FycmF5Jykge1xuICAgIGlmIChvYmouY2xvbmUpIHtcbiAgICAgIHJldHVybiBvYmouY2xvbmUoKTtcbiAgICB9XG4gICAgdmFyIGNsb25lID0gdHlwZSA9PSAnYXJyYXknID8gW10gOiB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBjbG9uZVtrZXldID0gZ29vZy5jbG9uZU9iamVjdChvYmpba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG5cbi8qKlxuICogRm9yd2FyZCBkZWNsYXJhdGlvbiBmb3IgdGhlIGNsb25lIG1ldGhvZC4gVGhpcyBpcyBuZWNlc3NhcnkgdW50aWwgdGhlXG4gKiBjb21waWxlciBjYW4gYmV0dGVyIHN1cHBvcnQgZHVjay10eXBpbmcgY29uc3RydWN0cyBhcyB1c2VkIGluXG4gKiBnb29nLmNsb25lT2JqZWN0LlxuICpcbiAqIFRPRE8oYnJlbm5lbWFuKTogUmVtb3ZlIG9uY2UgdGhlIEpTQ29tcGlsZXIgY2FuIGluZmVyIHRoYXQgdGhlIGNoZWNrIGZvclxuICogcHJvdG8uY2xvbmUgaXMgc2FmZSBpbiBnb29nLmNsb25lT2JqZWN0LlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqL1xuT2JqZWN0LnByb3RvdHlwZS5jbG9uZTtcblxuXG4vKipcbiAqIEEgbmF0aXZlIGltcGxlbWVudGF0aW9uIG9mIGdvb2cuYmluZC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEEgZnVuY3Rpb24gdG8gcGFydGlhbGx5IGFwcGx5LlxuICogQHBhcmFtIHtPYmplY3R8dW5kZWZpbmVkfSBzZWxmT2JqIFNwZWNpZmllcyB0aGUgb2JqZWN0IHdoaWNoIHx0aGlzfCBzaG91bGRcbiAqICAgICBwb2ludCB0byB3aGVuIHRoZSBmdW5jdGlvbiBpcyBydW4uXG4gKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIEFkZGl0aW9uYWwgYXJndW1lbnRzIHRoYXQgYXJlIHBhcnRpYWxseVxuICogICAgIGFwcGxpZWQgdG8gdGhlIGZ1bmN0aW9uLlxuICogQHJldHVybiB7IUZ1bmN0aW9ufSBBIHBhcnRpYWxseS1hcHBsaWVkIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGJpbmQoKSB3YXNcbiAqICAgICBpbnZva2VkIGFzIGEgbWV0aG9kIG9mLlxuICogQHByaXZhdGVcbiAqIEBzdXBwcmVzcyB7ZGVwcmVjYXRlZH0gVGhlIGNvbXBpbGVyIHRoaW5rcyB0aGF0IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXG4gKiAgICAgaXMgZGVwcmVjYXRlZCBiZWNhdXNlIHNvbWUgcGVvcGxlIGhhdmUgZGVjbGFyZWQgYSBwdXJlLUpTIHZlcnNpb24uXG4gKiAgICAgT25seSB0aGUgcHVyZS1KUyB2ZXJzaW9uIGlzIHRydWx5IGRlcHJlY2F0ZWQuXG4gKi9cbmdvb2cuYmluZE5hdGl2ZV8gPSBmdW5jdGlvbihmbiwgc2VsZk9iaiwgdmFyX2FyZ3MpIHtcbiAgcmV0dXJuIC8qKiBAdHlwZSB7IUZ1bmN0aW9ufSAqLyAoZm4uY2FsbC5hcHBseShmbi5iaW5kLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBBIHB1cmUtSlMgaW1wbGVtZW50YXRpb24gb2YgZ29vZy5iaW5kLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQSBmdW5jdGlvbiB0byBwYXJ0aWFsbHkgYXBwbHkuXG4gKiBAcGFyYW0ge09iamVjdHx1bmRlZmluZWR9IHNlbGZPYmogU3BlY2lmaWVzIHRoZSBvYmplY3Qgd2hpY2ggfHRoaXN8IHNob3VsZFxuICogICAgIHBvaW50IHRvIHdoZW4gdGhlIGZ1bmN0aW9uIGlzIHJ1bi5cbiAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3MgQWRkaXRpb25hbCBhcmd1bWVudHMgdGhhdCBhcmUgcGFydGlhbGx5XG4gKiAgICAgYXBwbGllZCB0byB0aGUgZnVuY3Rpb24uXG4gKiBAcmV0dXJuIHshRnVuY3Rpb259IEEgcGFydGlhbGx5LWFwcGxpZWQgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYmluZCgpIHdhc1xuICogICAgIGludm9rZWQgYXMgYSBtZXRob2Qgb2YuXG4gKiBAcHJpdmF0ZVxuICovXG5nb29nLmJpbmRKc18gPSBmdW5jdGlvbihmbiwgc2VsZk9iaiwgdmFyX2FyZ3MpIHtcbiAgaWYgKCFmbikge1xuICAgIHRocm93IG5ldyBFcnJvcigpO1xuICB9XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgdmFyIGJvdW5kQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gUHJlcGVuZCB0aGUgYm91bmQgYXJndW1lbnRzIHRvIHRoZSBjdXJyZW50IGFyZ3VtZW50cy5cbiAgICAgIHZhciBuZXdBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KG5ld0FyZ3MsIGJvdW5kQXJncyk7XG4gICAgICByZXR1cm4gZm4uYXBwbHkoc2VsZk9iaiwgbmV3QXJncyk7XG4gICAgfTtcblxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmbi5hcHBseShzZWxmT2JqLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cbn07XG5cblxuLyoqXG4gKiBQYXJ0aWFsbHkgYXBwbGllcyB0aGlzIGZ1bmN0aW9uIHRvIGEgcGFydGljdWxhciAndGhpcyBvYmplY3QnIGFuZCB6ZXJvIG9yXG4gKiBtb3JlIGFyZ3VtZW50cy4gVGhlIHJlc3VsdCBpcyBhIG5ldyBmdW5jdGlvbiB3aXRoIHNvbWUgYXJndW1lbnRzIG9mIHRoZSBmaXJzdFxuICogZnVuY3Rpb24gcHJlLWZpbGxlZCBhbmQgdGhlIHZhbHVlIG9mIHx0aGlzfCAncHJlLXNwZWNpZmllZCcuPGJyPjxicj5cbiAqXG4gKiBSZW1haW5pbmcgYXJndW1lbnRzIHNwZWNpZmllZCBhdCBjYWxsLXRpbWUgYXJlIGFwcGVuZGVkIHRvIHRoZSBwcmUtXG4gKiBzcGVjaWZpZWQgb25lcy48YnI+PGJyPlxuICpcbiAqIEFsc28gc2VlOiB7QGxpbmsgI3BhcnRpYWx9Ljxicj48YnI+XG4gKlxuICogVXNhZ2U6XG4gKiA8cHJlPnZhciBiYXJNZXRoQm91bmQgPSBiaW5kKG15RnVuY3Rpb24sIG15T2JqLCAnYXJnMScsICdhcmcyJyk7XG4gKiBiYXJNZXRoQm91bmQoJ2FyZzMnLCAnYXJnNCcpOzwvcHJlPlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEEgZnVuY3Rpb24gdG8gcGFydGlhbGx5IGFwcGx5LlxuICogQHBhcmFtIHtPYmplY3R8dW5kZWZpbmVkfSBzZWxmT2JqIFNwZWNpZmllcyB0aGUgb2JqZWN0IHdoaWNoIHx0aGlzfCBzaG91bGRcbiAqICAgICBwb2ludCB0byB3aGVuIHRoZSBmdW5jdGlvbiBpcyBydW4uXG4gKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIEFkZGl0aW9uYWwgYXJndW1lbnRzIHRoYXQgYXJlIHBhcnRpYWxseVxuICogICAgIGFwcGxpZWQgdG8gdGhlIGZ1bmN0aW9uLlxuICogQHJldHVybiB7IUZ1bmN0aW9ufSBBIHBhcnRpYWxseS1hcHBsaWVkIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGJpbmQoKSB3YXNcbiAqICAgICBpbnZva2VkIGFzIGEgbWV0aG9kIG9mLlxuICogQHN1cHByZXNzIHtkZXByZWNhdGVkfSBTZWUgYWJvdmUuXG4gKi9cbmdvb2cuYmluZCA9IGZ1bmN0aW9uKGZuLCBzZWxmT2JqLCB2YXJfYXJncykge1xuICAvLyBUT0RPKG5pY2tzYW50b3MpOiBuYXJyb3cgdGhlIHR5cGUgc2lnbmF0dXJlLlxuICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgJiZcbiAgICAgIC8vIE5PVEUobmlja3NhbnRvcyk6IFNvbWVib2R5IHB1bGxlZCBiYXNlLmpzIGludG8gdGhlIGRlZmF1bHRcbiAgICAgIC8vIENocm9tZSBleHRlbnNpb24gZW52aXJvbm1lbnQuIFRoaXMgbWVhbnMgdGhhdCBmb3IgQ2hyb21lIGV4dGVuc2lvbnMsXG4gICAgICAvLyB0aGV5IGdldCB0aGUgaW1wbGVtZW50YXRpb24gb2YgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgdGhhdFxuICAgICAgLy8gY2FsbHMgZ29vZy5iaW5kIGluc3RlYWQgb2YgdGhlIG5hdGl2ZSBvbmUuIEV2ZW4gd29yc2UsIHdlIGRvbid0IHdhbnRcbiAgICAgIC8vIHRvIGludHJvZHVjZSBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgYmV0d2VlbiBnb29nLmJpbmQgYW5kXG4gICAgICAvLyBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCwgc28gd2UgaGF2ZSB0byBoYWNrIHRoaXMgdG8gbWFrZSBzdXJlIGl0XG4gICAgICAvLyB3b3JrcyBjb3JyZWN0bHkuXG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC50b1N0cmluZygpLmluZGV4T2YoJ25hdGl2ZSBjb2RlJykgIT0gLTEpIHtcbiAgICBnb29nLmJpbmQgPSBnb29nLmJpbmROYXRpdmVfO1xuICB9IGVsc2Uge1xuICAgIGdvb2cuYmluZCA9IGdvb2cuYmluZEpzXztcbiAgfVxuICByZXR1cm4gZ29vZy5iaW5kLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG59O1xuXG5cbi8qKlxuICogTGlrZSBiaW5kKCksIGV4Y2VwdCB0aGF0IGEgJ3RoaXMgb2JqZWN0JyBpcyBub3QgcmVxdWlyZWQuIFVzZWZ1bCB3aGVuIHRoZVxuICogdGFyZ2V0IGZ1bmN0aW9uIGlzIGFscmVhZHkgYm91bmQuXG4gKlxuICogVXNhZ2U6XG4gKiB2YXIgZyA9IHBhcnRpYWwoZiwgYXJnMSwgYXJnMik7XG4gKiBnKGFyZzMsIGFyZzQpO1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEEgZnVuY3Rpb24gdG8gcGFydGlhbGx5IGFwcGx5LlxuICogQHBhcmFtIHsuLi4qfSB2YXJfYXJncyBBZGRpdGlvbmFsIGFyZ3VtZW50cyB0aGF0IGFyZSBwYXJ0aWFsbHlcbiAqICAgICBhcHBsaWVkIHRvIGZuLlxuICogQHJldHVybiB7IUZ1bmN0aW9ufSBBIHBhcnRpYWxseS1hcHBsaWVkIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGJpbmQoKSB3YXNcbiAqICAgICBpbnZva2VkIGFzIGEgbWV0aG9kIG9mLlxuICovXG5nb29nLnBhcnRpYWwgPSBmdW5jdGlvbihmbiwgdmFyX2FyZ3MpIHtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgLy8gUHJlcGVuZCB0aGUgYm91bmQgYXJndW1lbnRzIHRvIHRoZSBjdXJyZW50IGFyZ3VtZW50cy5cbiAgICB2YXIgbmV3QXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgbmV3QXJncy51bnNoaWZ0LmFwcGx5KG5ld0FyZ3MsIGFyZ3MpO1xuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBuZXdBcmdzKTtcbiAgfTtcbn07XG5cblxuLyoqXG4gKiBDb3BpZXMgYWxsIHRoZSBtZW1iZXJzIG9mIGEgc291cmNlIG9iamVjdCB0byBhIHRhcmdldCBvYmplY3QuIFRoaXMgbWV0aG9kXG4gKiBkb2VzIG5vdCB3b3JrIG9uIGFsbCBicm93c2VycyBmb3IgYWxsIG9iamVjdHMgdGhhdCBjb250YWluIGtleXMgc3VjaCBhc1xuICogdG9TdHJpbmcgb3IgaGFzT3duUHJvcGVydHkuIFVzZSBnb29nLm9iamVjdC5leHRlbmQgZm9yIHRoaXMgcHVycG9zZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXQgVGFyZ2V0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBTb3VyY2UuXG4gKi9cbmdvb2cubWl4aW4gPSBmdW5jdGlvbih0YXJnZXQsIHNvdXJjZSkge1xuICBmb3IgKHZhciB4IGluIHNvdXJjZSkge1xuICAgIHRhcmdldFt4XSA9IHNvdXJjZVt4XTtcbiAgfVxuXG4gIC8vIEZvciBJRTcgb3IgbG93ZXIsIHRoZSBmb3ItaW4tbG9vcCBkb2VzIG5vdCBjb250YWluIGFueSBwcm9wZXJ0aWVzIHRoYXQgYXJlXG4gIC8vIG5vdCBlbnVtZXJhYmxlIG9uIHRoZSBwcm90b3R5cGUgb2JqZWN0IChmb3IgZXhhbXBsZSwgaXNQcm90b3R5cGVPZiBmcm9tXG4gIC8vIE9iamVjdC5wcm90b3R5cGUpIGJ1dCBhbHNvIGl0IHdpbGwgbm90IGluY2x1ZGUgJ3JlcGxhY2UnIG9uIG9iamVjdHMgdGhhdFxuICAvLyBleHRlbmQgU3RyaW5nIGFuZCBjaGFuZ2UgJ3JlcGxhY2UnIChub3QgdGhhdCBpdCBpcyBjb21tb24gZm9yIGFueW9uZSB0b1xuICAvLyBleHRlbmQgYW55dGhpbmcgZXhjZXB0IE9iamVjdCkuXG59O1xuXG5cbi8qKlxuICogQHJldHVybiB7bnVtYmVyfSBBbiBpbnRlZ2VyIHZhbHVlIHJlcHJlc2VudGluZyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kc1xuICogICAgIGJldHdlZW4gbWlkbmlnaHQsIEphbnVhcnkgMSwgMTk3MCBhbmQgdGhlIGN1cnJlbnQgdGltZS5cbiAqL1xuZ29vZy5ub3cgPSBEYXRlLm5vdyB8fCAoZnVuY3Rpb24oKSB7XG4gIC8vIFVuYXJ5IHBsdXMgb3BlcmF0b3IgY29udmVydHMgaXRzIG9wZXJhbmQgdG8gYSBudW1iZXIgd2hpY2ggaW4gdGhlIGNhc2Ugb2ZcbiAgLy8gYSBkYXRlIGlzIGRvbmUgYnkgY2FsbGluZyBnZXRUaW1lKCkuXG4gIHJldHVybiArbmV3IERhdGUoKTtcbn0pO1xuXG5cbi8qKlxuICogRXZhbHMgamF2YXNjcmlwdCBpbiB0aGUgZ2xvYmFsIHNjb3BlLiAgSW4gSUUgdGhpcyB1c2VzIGV4ZWNTY3JpcHQsIG90aGVyXG4gKiBicm93c2VycyB1c2UgZ29vZy5nbG9iYWwuZXZhbC4gSWYgZ29vZy5nbG9iYWwuZXZhbCBkb2VzIG5vdCBldmFsdWF0ZSBpbiB0aGVcbiAqIGdsb2JhbCBzY29wZSAoZm9yIGV4YW1wbGUsIGluIFNhZmFyaSksIGFwcGVuZHMgYSBzY3JpcHQgdGFnIGluc3RlYWQuXG4gKiBUaHJvd3MgYW4gZXhjZXB0aW9uIGlmIG5laXRoZXIgZXhlY1NjcmlwdCBvciBldmFsIGlzIGRlZmluZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gc2NyaXB0IEphdmFTY3JpcHQgc3RyaW5nLlxuICovXG5nb29nLmdsb2JhbEV2YWwgPSBmdW5jdGlvbihzY3JpcHQpIHtcbiAgaWYgKGdvb2cuZ2xvYmFsLmV4ZWNTY3JpcHQpIHtcbiAgICBnb29nLmdsb2JhbC5leGVjU2NyaXB0KHNjcmlwdCwgJ0phdmFTY3JpcHQnKTtcbiAgfSBlbHNlIGlmIChnb29nLmdsb2JhbC5ldmFsKSB7XG4gICAgLy8gVGVzdCB0byBzZWUgaWYgZXZhbCB3b3Jrc1xuICAgIGlmIChnb29nLmV2YWxXb3Jrc0Zvckdsb2JhbHNfID09IG51bGwpIHtcbiAgICAgIGdvb2cuZ2xvYmFsLmV2YWwoJ3ZhciBfZXRfID0gMTsnKTtcbiAgICAgIGlmICh0eXBlb2YgZ29vZy5nbG9iYWxbJ19ldF8nXSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICBkZWxldGUgZ29vZy5nbG9iYWxbJ19ldF8nXTtcbiAgICAgICAgZ29vZy5ldmFsV29ya3NGb3JHbG9iYWxzXyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnb29nLmV2YWxXb3Jrc0Zvckdsb2JhbHNfID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGdvb2cuZXZhbFdvcmtzRm9yR2xvYmFsc18pIHtcbiAgICAgIGdvb2cuZ2xvYmFsLmV2YWwoc2NyaXB0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGRvYyA9IGdvb2cuZ2xvYmFsLmRvY3VtZW50O1xuICAgICAgdmFyIHNjcmlwdEVsdCA9IGRvYy5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIHNjcmlwdEVsdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgICBzY3JpcHRFbHQuZGVmZXIgPSBmYWxzZTtcbiAgICAgIC8vIE5vdGUodXNlcik6IGNhbid0IHVzZSAuaW5uZXJIVE1MIHNpbmNlIFwidCgnPHRlc3Q+JylcIiB3aWxsIGZhaWwgYW5kXG4gICAgICAvLyAudGV4dCBkb2Vzbid0IHdvcmsgaW4gU2FmYXJpIDIuICBUaGVyZWZvcmUgd2UgYXBwZW5kIGEgdGV4dCBub2RlLlxuICAgICAgc2NyaXB0RWx0LmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShzY3JpcHQpKTtcbiAgICAgIGRvYy5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdEVsdCk7XG4gICAgICBkb2MuYm9keS5yZW1vdmVDaGlsZChzY3JpcHRFbHQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBFcnJvcignZ29vZy5nbG9iYWxFdmFsIG5vdCBhdmFpbGFibGUnKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCB3ZSBjYW4gY2FsbCAnZXZhbCcgZGlyZWN0bHkgdG8gZXZhbCBjb2RlIGluIHRoZVxuICogZ2xvYmFsIHNjb3BlLiBTZXQgdG8gYSBCb29sZWFuIGJ5IHRoZSBmaXJzdCBjYWxsIHRvIGdvb2cuZ2xvYmFsRXZhbCAod2hpY2hcbiAqIGVtcGlyaWNhbGx5IHRlc3RzIHdoZXRoZXIgZXZhbCB3b3JrcyBmb3IgZ2xvYmFscykuIEBzZWUgZ29vZy5nbG9iYWxFdmFsXG4gKiBAdHlwZSB7P2Jvb2xlYW59XG4gKiBAcHJpdmF0ZVxuICovXG5nb29nLmV2YWxXb3Jrc0Zvckdsb2JhbHNfID0gbnVsbDtcblxuXG4vKipcbiAqIE9wdGlvbmFsIG1hcCBvZiBDU1MgY2xhc3MgbmFtZXMgdG8gb2JmdXNjYXRlZCBuYW1lcyB1c2VkIHdpdGhcbiAqIGdvb2cuZ2V0Q3NzTmFtZSgpLlxuICogQHR5cGUge09iamVjdHx1bmRlZmluZWR9XG4gKiBAcHJpdmF0ZVxuICogQHNlZSBnb29nLnNldENzc05hbWVNYXBwaW5nXG4gKi9cbmdvb2cuY3NzTmFtZU1hcHBpbmdfO1xuXG5cbi8qKlxuICogT3B0aW9uYWwgb2JmdXNjYXRpb24gc3R5bGUgZm9yIENTUyBjbGFzcyBuYW1lcy4gU2hvdWxkIGJlIHNldCB0byBlaXRoZXJcbiAqICdCWV9XSE9MRScgb3IgJ0JZX1BBUlQnIGlmIGRlZmluZWQuXG4gKiBAdHlwZSB7c3RyaW5nfHVuZGVmaW5lZH1cbiAqIEBwcml2YXRlXG4gKiBAc2VlIGdvb2cuc2V0Q3NzTmFtZU1hcHBpbmdcbiAqL1xuZ29vZy5jc3NOYW1lTWFwcGluZ1N0eWxlXztcblxuXG4vKipcbiAqIEhhbmRsZXMgc3RyaW5ncyB0aGF0IGFyZSBpbnRlbmRlZCB0byBiZSB1c2VkIGFzIENTUyBjbGFzcyBuYW1lcy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHdvcmtzIGluIHRhbmRlbSB3aXRoIEBzZWUgZ29vZy5zZXRDc3NOYW1lTWFwcGluZy5cbiAqXG4gKiBXaXRob3V0IGFueSBtYXBwaW5nIHNldCwgdGhlIGFyZ3VtZW50cyBhcmUgc2ltcGxlIGpvaW5lZCB3aXRoIGFcbiAqIGh5cGhlbiBhbmQgcGFzc2VkIHRocm91Z2ggdW5hbHRlcmVkLlxuICpcbiAqIFdoZW4gdGhlcmUgaXMgYSBtYXBwaW5nLCB0aGVyZSBhcmUgdHdvIHBvc3NpYmxlIHN0eWxlcyBpbiB3aGljaFxuICogdGhlc2UgbWFwcGluZ3MgYXJlIHVzZWQuIEluIHRoZSBCWV9QQVJUIHN0eWxlLCBlYWNoIHBhcnQgKGkuZS4gaW5cbiAqIGJldHdlZW4gaHlwaGVucykgb2YgdGhlIHBhc3NlZCBpbiBjc3MgbmFtZSBpcyByZXdyaXR0ZW4gYWNjb3JkaW5nXG4gKiB0byB0aGUgbWFwLiBJbiB0aGUgQllfV0hPTEUgc3R5bGUsIHRoZSBmdWxsIGNzcyBuYW1lIGlzIGxvb2tlZCB1cCBpblxuICogdGhlIG1hcCBkaXJlY3RseS4gSWYgYSByZXdyaXRlIGlzIG5vdCBzcGVjaWZpZWQgYnkgdGhlIG1hcCwgdGhlXG4gKiBjb21waWxlciB3aWxsIG91dHB1dCBhIHdhcm5pbmcuXG4gKlxuICogV2hlbiB0aGUgbWFwcGluZyBpcyBwYXNzZWQgdG8gdGhlIGNvbXBpbGVyLCBpdCB3aWxsIHJlcGxhY2UgY2FsbHNcbiAqIHRvIGdvb2cuZ2V0Q3NzTmFtZSB3aXRoIHRoZSBzdHJpbmdzIGZyb20gdGhlIG1hcHBpbmcsIGUuZy5cbiAqICAgICB2YXIgeCA9IGdvb2cuZ2V0Q3NzTmFtZSgnZm9vJyk7XG4gKiAgICAgdmFyIHkgPSBnb29nLmdldENzc05hbWUodGhpcy5iYXNlQ2xhc3MsICdhY3RpdmUnKTtcbiAqICBiZWNvbWVzOlxuICogICAgIHZhciB4PSAnZm9vJztcbiAqICAgICB2YXIgeSA9IHRoaXMuYmFzZUNsYXNzICsgJy1hY3RpdmUnO1xuICpcbiAqIElmIG9uZSBhcmd1bWVudCBpcyBwYXNzZWQgaXQgd2lsbCBiZSBwcm9jZXNzZWQsIGlmIHR3byBhcmUgcGFzc2VkXG4gKiBvbmx5IHRoZSBtb2RpZmllciB3aWxsIGJlIHByb2Nlc3NlZCwgYXMgaXQgaXMgYXNzdW1lZCB0aGUgZmlyc3RcbiAqIGFyZ3VtZW50IHdhcyBnZW5lcmF0ZWQgYXMgYSByZXN1bHQgb2YgY2FsbGluZyBnb29nLmdldENzc05hbWUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzTmFtZSBUaGUgY2xhc3MgbmFtZS5cbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X21vZGlmaWVyIEEgbW9kaWZpZXIgdG8gYmUgYXBwZW5kZWQgdG8gdGhlIGNsYXNzIG5hbWUuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBjbGFzcyBuYW1lIG9yIHRoZSBjb25jYXRlbmF0aW9uIG9mIHRoZSBjbGFzcyBuYW1lIGFuZFxuICogICAgIHRoZSBtb2RpZmllci5cbiAqL1xuZ29vZy5nZXRDc3NOYW1lID0gZnVuY3Rpb24oY2xhc3NOYW1lLCBvcHRfbW9kaWZpZXIpIHtcbiAgdmFyIGdldE1hcHBpbmcgPSBmdW5jdGlvbihjc3NOYW1lKSB7XG4gICAgcmV0dXJuIGdvb2cuY3NzTmFtZU1hcHBpbmdfW2Nzc05hbWVdIHx8IGNzc05hbWU7XG4gIH07XG5cbiAgdmFyIHJlbmFtZUJ5UGFydHMgPSBmdW5jdGlvbihjc3NOYW1lKSB7XG4gICAgLy8gUmVtYXAgYWxsIHRoZSBwYXJ0cyBpbmRpdmlkdWFsbHkuXG4gICAgdmFyIHBhcnRzID0gY3NzTmFtZS5zcGxpdCgnLScpO1xuICAgIHZhciBtYXBwZWQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBtYXBwZWQucHVzaChnZXRNYXBwaW5nKHBhcnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBtYXBwZWQuam9pbignLScpO1xuICB9O1xuXG4gIHZhciByZW5hbWU7XG4gIGlmIChnb29nLmNzc05hbWVNYXBwaW5nXykge1xuICAgIHJlbmFtZSA9IGdvb2cuY3NzTmFtZU1hcHBpbmdTdHlsZV8gPT0gJ0JZX1dIT0xFJyA/XG4gICAgICAgIGdldE1hcHBpbmcgOiByZW5hbWVCeVBhcnRzO1xuICB9IGVsc2Uge1xuICAgIHJlbmFtZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgIHJldHVybiBhO1xuICAgIH07XG4gIH1cblxuICBpZiAob3B0X21vZGlmaWVyKSB7XG4gICAgcmV0dXJuIGNsYXNzTmFtZSArICctJyArIHJlbmFtZShvcHRfbW9kaWZpZXIpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiByZW5hbWUoY2xhc3NOYW1lKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIFNldHMgdGhlIG1hcCB0byBjaGVjayB3aGVuIHJldHVybmluZyBhIHZhbHVlIGZyb20gZ29vZy5nZXRDc3NOYW1lKCkuIEV4YW1wbGU6XG4gKiA8cHJlPlxuICogZ29vZy5zZXRDc3NOYW1lTWFwcGluZyh7XG4gKiAgIFwiZ29vZ1wiOiBcImFcIixcbiAqICAgXCJkaXNhYmxlZFwiOiBcImJcIixcbiAqIH0pO1xuICpcbiAqIHZhciB4ID0gZ29vZy5nZXRDc3NOYW1lKCdnb29nJyk7XG4gKiAvLyBUaGUgZm9sbG93aW5nIGV2YWx1YXRlcyB0bzogXCJhIGEtYlwiLlxuICogZ29vZy5nZXRDc3NOYW1lKCdnb29nJykgKyAnICcgKyBnb29nLmdldENzc05hbWUoeCwgJ2Rpc2FibGVkJylcbiAqIDwvcHJlPlxuICogV2hlbiBkZWNsYXJlZCBhcyBhIG1hcCBvZiBzdHJpbmcgbGl0ZXJhbHMgdG8gc3RyaW5nIGxpdGVyYWxzLCB0aGUgSlNDb21waWxlclxuICogd2lsbCByZXBsYWNlIGFsbCBjYWxscyB0byBnb29nLmdldENzc05hbWUoKSB1c2luZyB0aGUgc3VwcGxpZWQgbWFwIGlmIHRoZVxuICogLS1jbG9zdXJlX3Bhc3MgZmxhZyBpcyBzZXQuXG4gKlxuICogQHBhcmFtIHshT2JqZWN0fSBtYXBwaW5nIEEgbWFwIG9mIHN0cmluZ3MgdG8gc3RyaW5ncyB3aGVyZSBrZXlzIGFyZSBwb3NzaWJsZVxuICogICAgIGFyZ3VtZW50cyB0byBnb29nLmdldENzc05hbWUoKSBhbmQgdmFsdWVzIGFyZSB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcbiAqICAgICB0aGF0IHNob3VsZCBiZSByZXR1cm5lZC5cbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3N0eWxlIFRoZSBzdHlsZSBvZiBjc3MgbmFtZSBtYXBwaW5nLiBUaGVyZSBhcmUgdHdvIHZhbGlkXG4gKiAgICAgb3B0aW9uczogJ0JZX1BBUlQnLCBhbmQgJ0JZX1dIT0xFJy5cbiAqIEBzZWUgZ29vZy5nZXRDc3NOYW1lIGZvciBhIGRlc2NyaXB0aW9uLlxuICovXG5nb29nLnNldENzc05hbWVNYXBwaW5nID0gZnVuY3Rpb24obWFwcGluZywgb3B0X3N0eWxlKSB7XG4gIGdvb2cuY3NzTmFtZU1hcHBpbmdfID0gbWFwcGluZztcbiAgZ29vZy5jc3NOYW1lTWFwcGluZ1N0eWxlXyA9IG9wdF9zdHlsZTtcbn07XG5cblxuLyoqXG4gKiBUbyB1c2UgQ1NTIHJlbmFtaW5nIGluIGNvbXBpbGVkIG1vZGUsIG9uZSBvZiB0aGUgaW5wdXQgZmlsZXMgc2hvdWxkIGhhdmUgYVxuICogY2FsbCB0byBnb29nLnNldENzc05hbWVNYXBwaW5nKCkgd2l0aCBhbiBvYmplY3QgbGl0ZXJhbCB0aGF0IHRoZSBKU0NvbXBpbGVyXG4gKiBjYW4gZXh0cmFjdCBhbmQgdXNlIHRvIHJlcGxhY2UgYWxsIGNhbGxzIHRvIGdvb2cuZ2V0Q3NzTmFtZSgpLiBJbiB1bmNvbXBpbGVkXG4gKiBtb2RlLCBKYXZhU2NyaXB0IGNvZGUgc2hvdWxkIGJlIGxvYWRlZCBiZWZvcmUgdGhpcyBiYXNlLmpzIGZpbGUgdGhhdCBkZWNsYXJlc1xuICogYSBnbG9iYWwgdmFyaWFibGUsIENMT1NVUkVfQ1NTX05BTUVfTUFQUElORywgd2hpY2ggaXMgdXNlZCBiZWxvdy4gVGhpcyBpc1xuICogdG8gZW5zdXJlIHRoYXQgdGhlIG1hcHBpbmcgaXMgbG9hZGVkIGJlZm9yZSBhbnkgY2FsbHMgdG8gZ29vZy5nZXRDc3NOYW1lKClcbiAqIGFyZSBtYWRlIGluIHVuY29tcGlsZWQgbW9kZS5cbiAqXG4gKiBBIGhvb2sgZm9yIG92ZXJyaWRpbmcgdGhlIENTUyBuYW1lIG1hcHBpbmcuXG4gKiBAdHlwZSB7T2JqZWN0fHVuZGVmaW5lZH1cbiAqL1xuZ29vZy5nbG9iYWwuQ0xPU1VSRV9DU1NfTkFNRV9NQVBQSU5HO1xuXG5cbmlmICghQ09NUElMRUQgJiYgZ29vZy5nbG9iYWwuQ0xPU1VSRV9DU1NfTkFNRV9NQVBQSU5HKSB7XG4gIC8vIFRoaXMgZG9lcyBub3QgY2FsbCBnb29nLnNldENzc05hbWVNYXBwaW5nKCkgYmVjYXVzZSB0aGUgSlNDb21waWxlclxuICAvLyByZXF1aXJlcyB0aGF0IGdvb2cuc2V0Q3NzTmFtZU1hcHBpbmcoKSBiZSBjYWxsZWQgd2l0aCBhbiBvYmplY3QgbGl0ZXJhbC5cbiAgZ29vZy5jc3NOYW1lTWFwcGluZ18gPSBnb29nLmdsb2JhbC5DTE9TVVJFX0NTU19OQU1FX01BUFBJTkc7XG59XG5cblxuLyoqXG4gKiBBYnN0cmFjdCBpbXBsZW1lbnRhdGlvbiBvZiBnb29nLmdldE1zZyBmb3IgdXNlIHdpdGggbG9jYWxpemVkIG1lc3NhZ2VzLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBUcmFuc2xhdGFibGUgc3RyaW5nLCBwbGFjZXMgaG9sZGVycyBpbiB0aGUgZm9ybSB7JGZvb30uXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF92YWx1ZXMgTWFwIG9mIHBsYWNlIGhvbGRlciBuYW1lIHRvIHZhbHVlLlxuICogQHJldHVybiB7c3RyaW5nfSBtZXNzYWdlIHdpdGggcGxhY2Vob2xkZXJzIGZpbGxlZC5cbiAqL1xuZ29vZy5nZXRNc2cgPSBmdW5jdGlvbihzdHIsIG9wdF92YWx1ZXMpIHtcbiAgdmFyIHZhbHVlcyA9IG9wdF92YWx1ZXMgfHwge307XG4gIGZvciAodmFyIGtleSBpbiB2YWx1ZXMpIHtcbiAgICB2YXIgdmFsdWUgPSAoJycgKyB2YWx1ZXNba2V5XSkucmVwbGFjZSgvXFwkL2csICckJCQkJyk7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXHtcXFxcJCcgKyBrZXkgKyAnXFxcXH0nLCAnZ2knKSwgdmFsdWUpO1xuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8qKlxuICogRXhwb3NlcyBhbiB1bm9iZnVzY2F0ZWQgZ2xvYmFsIG5hbWVzcGFjZSBwYXRoIGZvciB0aGUgZ2l2ZW4gb2JqZWN0LlxuICogTm90ZSB0aGF0IGZpZWxkcyBvZiB0aGUgZXhwb3J0ZWQgb2JqZWN0ICp3aWxsKiBiZSBvYmZ1c2NhdGVkLFxuICogdW5sZXNzIHRoZXkgYXJlIGV4cG9ydGVkIGluIHR1cm4gdmlhIHRoaXMgZnVuY3Rpb24gb3JcbiAqIGdvb2cuZXhwb3J0UHJvcGVydHlcbiAqXG4gKiA8cD5BbHNvIGhhbmR5IGZvciBtYWtpbmcgcHVibGljIGl0ZW1zIHRoYXQgYXJlIGRlZmluZWQgaW4gYW5vbnltb3VzXG4gKiBjbG9zdXJlcy5cbiAqXG4gKiBleC4gZ29vZy5leHBvcnRTeW1ib2woJ3B1YmxpYy5wYXRoLkZvbycsIEZvbyk7XG4gKlxuICogZXguIGdvb2cuZXhwb3J0U3ltYm9sKCdwdWJsaWMucGF0aC5Gb28uc3RhdGljRnVuY3Rpb24nLFxuICogICAgICAgICAgICAgICAgICAgICAgIEZvby5zdGF0aWNGdW5jdGlvbik7XG4gKiAgICAgcHVibGljLnBhdGguRm9vLnN0YXRpY0Z1bmN0aW9uKCk7XG4gKlxuICogZXguIGdvb2cuZXhwb3J0U3ltYm9sKCdwdWJsaWMucGF0aC5Gb28ucHJvdG90eXBlLm15TWV0aG9kJyxcbiAqICAgICAgICAgICAgICAgICAgICAgICBGb28ucHJvdG90eXBlLm15TWV0aG9kKTtcbiAqICAgICBuZXcgcHVibGljLnBhdGguRm9vKCkubXlNZXRob2QoKTtcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcHVibGljUGF0aCBVbm9iZnVzY2F0ZWQgbmFtZSB0byBleHBvcnQuXG4gKiBAcGFyYW0geyp9IG9iamVjdCBPYmplY3QgdGhlIG5hbWUgc2hvdWxkIHBvaW50IHRvLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfb2JqZWN0VG9FeHBvcnRUbyBUaGUgb2JqZWN0IHRvIGFkZCB0aGUgcGF0aCB0bzsgZGVmYXVsdFxuICogICAgIGlzIHxnb29nLmdsb2JhbHwuXG4gKi9cbmdvb2cuZXhwb3J0U3ltYm9sID0gZnVuY3Rpb24ocHVibGljUGF0aCwgb2JqZWN0LCBvcHRfb2JqZWN0VG9FeHBvcnRUbykge1xuICBnb29nLmV4cG9ydFBhdGhfKHB1YmxpY1BhdGgsIG9iamVjdCwgb3B0X29iamVjdFRvRXhwb3J0VG8pO1xufTtcblxuXG4vKipcbiAqIEV4cG9ydHMgYSBwcm9wZXJ0eSB1bm9iZnVzY2F0ZWQgaW50byB0aGUgb2JqZWN0J3MgbmFtZXNwYWNlLlxuICogZXguIGdvb2cuZXhwb3J0UHJvcGVydHkoRm9vLCAnc3RhdGljRnVuY3Rpb24nLCBGb28uc3RhdGljRnVuY3Rpb24pO1xuICogZXguIGdvb2cuZXhwb3J0UHJvcGVydHkoRm9vLnByb3RvdHlwZSwgJ215TWV0aG9kJywgRm9vLnByb3RvdHlwZS5teU1ldGhvZCk7XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IE9iamVjdCB3aG9zZSBzdGF0aWMgcHJvcGVydHkgaXMgYmVpbmcgZXhwb3J0ZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gcHVibGljTmFtZSBVbm9iZnVzY2F0ZWQgbmFtZSB0byBleHBvcnQuXG4gKiBAcGFyYW0geyp9IHN5bWJvbCBPYmplY3QgdGhlIG5hbWUgc2hvdWxkIHBvaW50IHRvLlxuICovXG5nb29nLmV4cG9ydFByb3BlcnR5ID0gZnVuY3Rpb24ob2JqZWN0LCBwdWJsaWNOYW1lLCBzeW1ib2wpIHtcbiAgb2JqZWN0W3B1YmxpY05hbWVdID0gc3ltYm9sO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBVc2FnZTpcbiAqIDxwcmU+XG4gKiBmdW5jdGlvbiBQYXJlbnRDbGFzcyhhLCBiKSB7IH1cbiAqIFBhcmVudENsYXNzLnByb3RvdHlwZS5mb28gPSBmdW5jdGlvbihhKSB7IH1cbiAqXG4gKiBmdW5jdGlvbiBDaGlsZENsYXNzKGEsIGIsIGMpIHtcbiAqICAgZ29vZy5iYXNlKHRoaXMsIGEsIGIpO1xuICogfVxuICogZ29vZy5pbmhlcml0cyhDaGlsZENsYXNzLCBQYXJlbnRDbGFzcyk7XG4gKlxuICogdmFyIGNoaWxkID0gbmV3IENoaWxkQ2xhc3MoJ2EnLCAnYicsICdzZWUnKTtcbiAqIGNoaWxkLmZvbygpOyAvLyB3b3Jrc1xuICogPC9wcmU+XG4gKlxuICogSW4gYWRkaXRpb24sIGEgc3VwZXJjbGFzcycgaW1wbGVtZW50YXRpb24gb2YgYSBtZXRob2QgY2FuIGJlIGludm9rZWRcbiAqIGFzIGZvbGxvd3M6XG4gKlxuICogPHByZT5cbiAqIENoaWxkQ2xhc3MucHJvdG90eXBlLmZvbyA9IGZ1bmN0aW9uKGEpIHtcbiAqICAgQ2hpbGRDbGFzcy5zdXBlckNsYXNzXy5mb28uY2FsbCh0aGlzLCBhKTtcbiAqICAgLy8gb3RoZXIgY29kZVxuICogfTtcbiAqIDwvcHJlPlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNoaWxkQ3RvciBDaGlsZCBjbGFzcy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHBhcmVudEN0b3IgUGFyZW50IGNsYXNzLlxuICovXG5nb29nLmluaGVyaXRzID0gZnVuY3Rpb24oY2hpbGRDdG9yLCBwYXJlbnRDdG9yKSB7XG4gIC8qKiBAY29uc3RydWN0b3IgKi9cbiAgZnVuY3Rpb24gdGVtcEN0b3IoKSB7fTtcbiAgdGVtcEN0b3IucHJvdG90eXBlID0gcGFyZW50Q3Rvci5wcm90b3R5cGU7XG4gIGNoaWxkQ3Rvci5zdXBlckNsYXNzXyA9IHBhcmVudEN0b3IucHJvdG90eXBlO1xuICBjaGlsZEN0b3IucHJvdG90eXBlID0gbmV3IHRlbXBDdG9yKCk7XG4gIGNoaWxkQ3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjaGlsZEN0b3I7XG59O1xuXG5cbi8qKlxuICogQ2FsbCB1cCB0byB0aGUgc3VwZXJjbGFzcy5cbiAqXG4gKiBJZiB0aGlzIGlzIGNhbGxlZCBmcm9tIGEgY29uc3RydWN0b3IsIHRoZW4gdGhpcyBjYWxscyB0aGUgc3VwZXJjbGFzc1xuICogY29udHJ1Y3RvciB3aXRoIGFyZ3VtZW50cyAxLU4uXG4gKlxuICogSWYgdGhpcyBpcyBjYWxsZWQgZnJvbSBhIHByb3RvdHlwZSBtZXRob2QsIHRoZW4geW91IG11c3QgcGFzc1xuICogdGhlIG5hbWUgb2YgdGhlIG1ldGhvZCBhcyB0aGUgc2Vjb25kIGFyZ3VtZW50IHRvIHRoaXMgZnVuY3Rpb24uIElmXG4gKiB5b3UgZG8gbm90LCB5b3Ugd2lsbCBnZXQgYSBydW50aW1lIGVycm9yLiBUaGlzIGNhbGxzIHRoZSBzdXBlcmNsYXNzJ1xuICogbWV0aG9kIHdpdGggYXJndW1lbnRzIDItTi5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIG9ubHkgd29ya3MgaWYgeW91IHVzZSBnb29nLmluaGVyaXRzIHRvIGV4cHJlc3NcbiAqIGluaGVyaXRhbmNlIHJlbGF0aW9uc2hpcHMgYmV0d2VlbiB5b3VyIGNsYXNzZXMuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBhIGNvbXBpbGVyIHByaW1pdGl2ZS4gQXQgY29tcGlsZS10aW1lLCB0aGVcbiAqIGNvbXBpbGVyIHdpbGwgZG8gbWFjcm8gZXhwYW5zaW9uIHRvIHJlbW92ZSBhIGxvdCBvZlxuICogdGhlIGV4dHJhIG92ZXJoZWFkIHRoYXQgdGhpcyBmdW5jdGlvbiBpbnRyb2R1Y2VzLiBUaGUgY29tcGlsZXJcbiAqIHdpbGwgYWxzbyBlbmZvcmNlIGEgbG90IG9mIHRoZSBhc3N1bXB0aW9ucyB0aGF0IHRoaXMgZnVuY3Rpb25cbiAqIG1ha2VzLCBhbmQgdHJlYXQgaXQgYXMgYSBjb21waWxlciBlcnJvciBpZiB5b3UgYnJlYWsgdGhlbS5cbiAqXG4gKiBAcGFyYW0geyFPYmplY3R9IG1lIFNob3VsZCBhbHdheXMgYmUgXCJ0aGlzXCIuXG4gKiBAcGFyYW0geyo9fSBvcHRfbWV0aG9kTmFtZSBUaGUgbWV0aG9kIG5hbWUgaWYgY2FsbGluZyBhIHN1cGVyIG1ldGhvZC5cbiAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3MgVGhlIHJlc3Qgb2YgdGhlIGFyZ3VtZW50cy5cbiAqIEByZXR1cm4geyp9IFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHN1cGVyY2xhc3MgbWV0aG9kLlxuICovXG5nb29nLmJhc2UgPSBmdW5jdGlvbihtZSwgb3B0X21ldGhvZE5hbWUsIHZhcl9hcmdzKSB7XG4gIHZhciBjYWxsZXIgPSBhcmd1bWVudHMuY2FsbGVlLmNhbGxlcjtcbiAgaWYgKGNhbGxlci5zdXBlckNsYXNzXykge1xuICAgIC8vIFRoaXMgaXMgYSBjb25zdHJ1Y3Rvci4gQ2FsbCB0aGUgc3VwZXJjbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICByZXR1cm4gY2FsbGVyLnN1cGVyQ2xhc3NfLmNvbnN0cnVjdG9yLmFwcGx5KFxuICAgICAgICBtZSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIH1cblxuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gIHZhciBmb3VuZENhbGxlciA9IGZhbHNlO1xuICBmb3IgKHZhciBjdG9yID0gbWUuY29uc3RydWN0b3I7XG4gICAgICAgY3RvcjsgY3RvciA9IGN0b3Iuc3VwZXJDbGFzc18gJiYgY3Rvci5zdXBlckNsYXNzXy5jb25zdHJ1Y3Rvcikge1xuICAgIGlmIChjdG9yLnByb3RvdHlwZVtvcHRfbWV0aG9kTmFtZV0gPT09IGNhbGxlcikge1xuICAgICAgZm91bmRDYWxsZXIgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoZm91bmRDYWxsZXIpIHtcbiAgICAgIHJldHVybiBjdG9yLnByb3RvdHlwZVtvcHRfbWV0aG9kTmFtZV0uYXBwbHkobWUsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHdlIGRpZCBub3QgZmluZCB0aGUgY2FsbGVyIGluIHRoZSBwcm90b3R5cGUgY2hhaW4sXG4gIC8vIHRoZW4gb25lIG9mIHR3byB0aGluZ3MgaGFwcGVuZWQ6XG4gIC8vIDEpIFRoZSBjYWxsZXIgaXMgYW4gaW5zdGFuY2UgbWV0aG9kLlxuICAvLyAyKSBUaGlzIG1ldGhvZCB3YXMgbm90IGNhbGxlZCBieSB0aGUgcmlnaHQgY2FsbGVyLlxuICBpZiAobWVbb3B0X21ldGhvZE5hbWVdID09PSBjYWxsZXIpIHtcbiAgICByZXR1cm4gbWUuY29uc3RydWN0b3IucHJvdG90eXBlW29wdF9tZXRob2ROYW1lXS5hcHBseShtZSwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICdnb29nLmJhc2UgY2FsbGVkIGZyb20gYSBtZXRob2Qgb2Ygb25lIG5hbWUgJyArXG4gICAgICAgICd0byBhIG1ldGhvZCBvZiBhIGRpZmZlcmVudCBuYW1lJyk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBBbGxvdyBmb3IgYWxpYXNpbmcgd2l0aGluIHNjb3BlIGZ1bmN0aW9ucy4gIFRoaXMgZnVuY3Rpb24gZXhpc3RzIGZvclxuICogdW5jb21waWxlZCBjb2RlIC0gaW4gY29tcGlsZWQgY29kZSB0aGUgY2FsbHMgd2lsbCBiZSBpbmxpbmVkIGFuZCB0aGVcbiAqIGFsaWFzZXMgYXBwbGllZC4gIEluIHVuY29tcGlsZWQgY29kZSB0aGUgZnVuY3Rpb24gaXMgc2ltcGx5IHJ1biBzaW5jZSB0aGVcbiAqIGFsaWFzZXMgYXMgd3JpdHRlbiBhcmUgdmFsaWQgSmF2YVNjcmlwdC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gZm4gRnVuY3Rpb24gdG8gY2FsbC4gIFRoaXMgZnVuY3Rpb24gY2FuIGNvbnRhaW4gYWxpYXNlc1xuICogICAgIHRvIG5hbWVzcGFjZXMgKGUuZy4gXCJ2YXIgZG9tID0gZ29vZy5kb21cIikgb3IgY2xhc3Nlc1xuICogICAgKGUuZy4gXCJ2YXIgVGltZXIgPSBnb29nLlRpbWVyXCIpLlxuICovXG5nb29nLnNjb3BlID0gZnVuY3Rpb24oZm4pIHtcbiAgZm4uY2FsbChnb29nLmdsb2JhbCk7XG59O1xuXG5cbiIsIi8qKlxuICogZGVmaW5lc1xuICovXG5cbmdvb2cucHJvdmlkZSgnVVNFX1RZUEVEQVJSQVknKTtcblxuLy8gU2FmYXJpIOOBjCB0eXBlb2YgVWludDhBcnJheSA9PT0gJ29iamVjdCcg44Gr44Gq44KL44Gf44KB44CBXG4vLyDmnKrlrprnvqnjgYvlkKbjgYvjgacgVHlwZWQgQXJyYXkg44Gu5L2/55So44KS5rG65a6a44GZ44KLXG5cbi8qKiBAY29uc3Qge2Jvb2xlYW59IHVzZSB0eXBlZCBhcnJheSBmbGFnLiAqL1xudmFyIFVTRV9UWVBFREFSUkFZID1cbiAgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykgJiZcbiAgKHR5cGVvZiBVaW50MTZBcnJheSAhPT0gJ3VuZGVmaW5lZCcpICYmXG4gICh0eXBlb2YgVWludDMyQXJyYXkgIT09ICd1bmRlZmluZWQnKSAmJlxuICAodHlwZW9mIERhdGFWaWV3ICE9PSAndW5kZWZpbmVkJyk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgYml0IOWNmOS9jeOBp+OBruabuOOBjei+vOOBv+Wun+ijhS5cbiAqL1xuZ29vZy5wcm92aWRlKCdabGliLkJpdFN0cmVhbScpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICog44OT44OD44OI44K544OI44Oq44O844OgXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5KT19IGJ1ZmZlciBvdXRwdXQgYnVmZmVyLlxuICogQHBhcmFtIHtudW1iZXI9fSBidWZmZXJQb3NpdGlvbiBzdGFydCBidWZmZXIgcG9pbnRlci5cbiAqL1xuWmxpYi5CaXRTdHJlYW0gPSBmdW5jdGlvbihidWZmZXIsIGJ1ZmZlclBvc2l0aW9uKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBidWZmZXIgaW5kZXguICovXG4gIHRoaXMuaW5kZXggPSB0eXBlb2YgYnVmZmVyUG9zaXRpb24gPT09ICdudW1iZXInID8gYnVmZmVyUG9zaXRpb24gOiAwO1xuICAvKiogQHR5cGUge251bWJlcn0gYml0IGluZGV4LiAqL1xuICB0aGlzLmJpdGluZGV4ID0gMDtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBiaXQtc3RyZWFtIG91dHB1dCBidWZmZXIuICovXG4gIHRoaXMuYnVmZmVyID0gYnVmZmVyIGluc3RhbmNlb2YgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSA/XG4gICAgYnVmZmVyIDpcbiAgICBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShabGliLkJpdFN0cmVhbS5EZWZhdWx0QmxvY2tTaXplKTtcblxuICAvLyDlhaXlipvjgZXjgozjgZ8gaW5kZXgg44GM6Laz44KK44Gq44GL44Gj44Gf44KJ5ouh5by144GZ44KL44GM44CB5YCN44Gr44GX44Gm44KC44OA44Oh44Gq44KJ5LiN5q2j44Go44GZ44KLXG4gIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggKiAyIDw9IHRoaXMuaW5kZXgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGluZGV4XCIpO1xuICB9IGVsc2UgaWYgKHRoaXMuYnVmZmVyLmxlbmd0aCA8PSB0aGlzLmluZGV4KSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgfVxufTtcblxuLyoqXG4gKiDjg4fjg5Xjgqnjg6vjg4jjg5bjg63jg4Pjgq/jgrXjgqTjgrouXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cblpsaWIuQml0U3RyZWFtLkRlZmF1bHRCbG9ja1NpemUgPSAweDgwMDA7XG5cbi8qKlxuICogZXhwYW5kIGJ1ZmZlci5cbiAqIEByZXR1cm4geyEoQXJyYXl8VWludDhBcnJheSl9IG5ldyBidWZmZXIuXG4gKi9cblpsaWIuQml0U3RyZWFtLnByb3RvdHlwZS5leHBhbmRCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBvbGQgYnVmZmVyLiAqL1xuICB2YXIgb2xkYnVmID0gdGhpcy5idWZmZXI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBsaW1pdGVyLiAqL1xuICB2YXIgaWwgPSBvbGRidWYubGVuZ3RoO1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IG5ldyBidWZmZXIuICovXG4gIHZhciBidWZmZXIgPVxuICAgIG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKGlsIDw8IDEpO1xuXG4gIC8vIGNvcHkgYnVmZmVyXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIGJ1ZmZlci5zZXQob2xkYnVmKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBYWFg6IGxvb3AgdW5yb2xsaW5nXG4gICAgZm9yIChpID0gMDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGJ1ZmZlcltpXSA9IG9sZGJ1ZltpXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gKHRoaXMuYnVmZmVyID0gYnVmZmVyKTtcbn07XG5cblxuLyoqXG4gKiDmlbDlgKTjgpLjg5Pjg4Pjg4jjgafmjIflrprjgZfjgZ/mlbDjgaDjgZHmm7jjgY3ovrzjgoAuXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyIOabuOOBjei+vOOCgOaVsOWApC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBuIOabuOOBjei+vOOCgOODk+ODg+ODiOaVsC5cbiAqIEBwYXJhbSB7Ym9vbGVhbj19IHJldmVyc2Ug6YCG6aCG44Gr5pu444GN6L6844KA44Gq44KJ44GwIHRydWUuXG4gKi9cblpsaWIuQml0U3RyZWFtLnByb3RvdHlwZS53cml0ZUJpdHMgPSBmdW5jdGlvbihudW1iZXIsIG4sIHJldmVyc2UpIHtcbiAgdmFyIGJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICB2YXIgaW5kZXggPSB0aGlzLmluZGV4O1xuICB2YXIgYml0aW5kZXggPSB0aGlzLmJpdGluZGV4O1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjdXJyZW50IG9jdGV0LiAqL1xuICB2YXIgY3VycmVudCA9IGJ1ZmZlcltpbmRleF07XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBpO1xuXG4gIC8qKlxuICAgKiAzMi1iaXQg5pW05pWw44Gu44OT44OD44OI6aCG44KS6YCG44Gr44GZ44KLXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuIDMyLWJpdCBpbnRlZ2VyLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IHJldmVyc2VkIDMyLWJpdCBpbnRlZ2VyLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gcmV2MzJfKG4pIHtcbiAgICByZXR1cm4gKFpsaWIuQml0U3RyZWFtLlJldmVyc2VUYWJsZVtuICYgMHhGRl0gPDwgMjQpIHxcbiAgICAgIChabGliLkJpdFN0cmVhbS5SZXZlcnNlVGFibGVbbiA+Pj4gOCAmIDB4RkZdIDw8IDE2KSB8XG4gICAgICAoWmxpYi5CaXRTdHJlYW0uUmV2ZXJzZVRhYmxlW24gPj4+IDE2ICYgMHhGRl0gPDwgOCkgfFxuICAgICAgWmxpYi5CaXRTdHJlYW0uUmV2ZXJzZVRhYmxlW24gPj4+IDI0ICYgMHhGRl07XG4gIH1cblxuICBpZiAocmV2ZXJzZSAmJiBuID4gMSkge1xuICAgIG51bWJlciA9IG4gPiA4ID9cbiAgICAgIHJldjMyXyhudW1iZXIpID4+ICgzMiAtIG4pIDpcbiAgICAgIFpsaWIuQml0U3RyZWFtLlJldmVyc2VUYWJsZVtudW1iZXJdID4+ICg4IC0gbik7XG4gIH1cblxuICAvLyBCeXRlIOWig+eVjOOCkui2heOBiOOBquOBhOOBqOOBjVxuICBpZiAobiArIGJpdGluZGV4IDwgOCkge1xuICAgIGN1cnJlbnQgPSAoY3VycmVudCA8PCBuKSB8IG51bWJlcjtcbiAgICBiaXRpbmRleCArPSBuO1xuICAvLyBCeXRlIOWig+eVjOOCkui2heOBiOOCi+OBqOOBjVxuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGN1cnJlbnQgPSAoY3VycmVudCA8PCAxKSB8ICgobnVtYmVyID4+IG4gLSBpIC0gMSkgJiAxKTtcblxuICAgICAgLy8gbmV4dCBieXRlXG4gICAgICBpZiAoKytiaXRpbmRleCA9PT0gOCkge1xuICAgICAgICBiaXRpbmRleCA9IDA7XG4gICAgICAgIGJ1ZmZlcltpbmRleCsrXSA9IFpsaWIuQml0U3RyZWFtLlJldmVyc2VUYWJsZVtjdXJyZW50XTtcbiAgICAgICAgY3VycmVudCA9IDA7XG5cbiAgICAgICAgLy8gZXhwYW5kXG4gICAgICAgIGlmIChpbmRleCA9PT0gYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICAgIGJ1ZmZlciA9IHRoaXMuZXhwYW5kQnVmZmVyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgYnVmZmVyW2luZGV4XSA9IGN1cnJlbnQ7XG5cbiAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gIHRoaXMuYml0aW5kZXggPSBiaXRpbmRleDtcbiAgdGhpcy5pbmRleCA9IGluZGV4O1xufTtcblxuXG4vKipcbiAqIOOCueODiOODquODvOODoOOBrue1guerr+WHpueQhuOCkuihjOOBhlxuICogQHJldHVybiB7IShBcnJheXxVaW50OEFycmF5KX0g57WC56uv5Yem55CG5b6M44Gu44OQ44OD44OV44Kh44KSIGJ5dGUgYXJyYXkg44Gn6L+U44GZLlxuICovXG5abGliLkJpdFN0cmVhbS5wcm90b3R5cGUuZmluaXNoID0gZnVuY3Rpb24oKSB7XG4gIHZhciBidWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgdmFyIGluZGV4ID0gdGhpcy5pbmRleDtcblxuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuICovXG4gIHZhciBvdXRwdXQ7XG5cbiAgLy8gYml0aW5kZXgg44GMIDAg44Gu5pmC44Gv5L2Z5YiG44GrIGluZGV4IOOBjOmAsuOCk+OBp+OBhOOCi+eKtuaFi1xuICBpZiAodGhpcy5iaXRpbmRleCA+IDApIHtcbiAgICBidWZmZXJbaW5kZXhdIDw8PSA4IC0gdGhpcy5iaXRpbmRleDtcbiAgICBidWZmZXJbaW5kZXhdID0gWmxpYi5CaXRTdHJlYW0uUmV2ZXJzZVRhYmxlW2J1ZmZlcltpbmRleF1dO1xuICAgIGluZGV4Kys7XG4gIH1cblxuICAvLyBhcnJheSB0cnVuY2F0aW9uXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIG91dHB1dCA9IGJ1ZmZlci5zdWJhcnJheSgwLCBpbmRleCk7XG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyLmxlbmd0aCA9IGluZGV4O1xuICAgIG91dHB1dCA9IGJ1ZmZlcjtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKipcbiAqIDAtMjU1IOOBruODk+ODg+ODiOmghuOCkuWPjei7ouOBl+OBn+ODhuODvOODluODq1xuICogQGNvbnN0XG4gKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX1cbiAqL1xuWmxpYi5CaXRTdHJlYW0uUmV2ZXJzZVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiB0YWJsZTtcbn0pKChmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSByZXZlcnNlIHRhYmxlLiAqL1xuICB2YXIgdGFibGUgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgyNTYpO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBjb3VudGVyLiAqL1xuICB2YXIgaTtcblxuICAvLyBnZW5lcmF0ZVxuICBmb3IgKGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgICB0YWJsZVtpXSA9IChmdW5jdGlvbihuKSB7XG4gICAgICB2YXIgciA9IG47XG4gICAgICB2YXIgcyA9IDc7XG5cbiAgICAgIGZvciAobiA+Pj49IDE7IG47IG4gPj4+PSAxKSB7XG4gICAgICAgIHIgPDw9IDE7XG4gICAgICAgIHIgfD0gbiAmIDE7XG4gICAgICAgIC0tcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChyIDw8IHMgJiAweGZmKSA+Pj4gMDtcbiAgICB9KShpKTtcbiAgfVxuXG4gIHJldHVybiB0YWJsZTtcbn0pKCkpO1xuXG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDUkMzMiDlrp/oo4UuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5DUkMzMicpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5cbi8qKiBAZGVmaW5lIHtib29sZWFufSAqL1xudmFyIFpMSUJfQ1JDMzJfQ09NUEFDVCA9IGZhbHNlO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIENSQzMyIOODj+ODg+OCt+ODpeWApOOCkuWPluW+l1xuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBkYXRhIGRhdGEgYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7bnVtYmVyPX0gcG9zIGRhdGEgcG9zaXRpb24uXG4gKiBAcGFyYW0ge251bWJlcj19IGxlbmd0aCBkYXRhIGxlbmd0aC5cbiAqIEByZXR1cm4ge251bWJlcn0gQ1JDMzIuXG4gKi9cblpsaWIuQ1JDMzIuY2FsYyA9IGZ1bmN0aW9uKGRhdGEsIHBvcywgbGVuZ3RoKSB7XG4gIHJldHVybiBabGliLkNSQzMyLnVwZGF0ZShkYXRhLCAwLCBwb3MsIGxlbmd0aCk7XG59O1xuXG4vKipcbiAqIENSQzMy44OP44OD44K344Ol5YCk44KS5pu05pawXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGRhdGEgZGF0YSBieXRlIGFycmF5LlxuICogQHBhcmFtIHtudW1iZXJ9IGNyYyBDUkMzMi5cbiAqIEBwYXJhbSB7bnVtYmVyPX0gcG9zIGRhdGEgcG9zaXRpb24uXG4gKiBAcGFyYW0ge251bWJlcj19IGxlbmd0aCBkYXRhIGxlbmd0aC5cbiAqIEByZXR1cm4ge251bWJlcn0gQ1JDMzIuXG4gKi9cblpsaWIuQ1JDMzIudXBkYXRlID0gZnVuY3Rpb24oZGF0YSwgY3JjLCBwb3MsIGxlbmd0aCkge1xuICB2YXIgdGFibGUgPSBabGliLkNSQzMyLlRhYmxlO1xuICB2YXIgaSA9ICh0eXBlb2YgcG9zID09PSAnbnVtYmVyJykgPyBwb3MgOiAocG9zID0gMCk7XG4gIHZhciBpbCA9ICh0eXBlb2YgbGVuZ3RoID09PSAnbnVtYmVyJykgPyBsZW5ndGggOiBkYXRhLmxlbmd0aDtcblxuICBjcmMgXj0gMHhmZmZmZmZmZjtcblxuICAvLyBsb29wIHVucm9sbGluZyBmb3IgcGVyZm9ybWFuY2VcbiAgZm9yIChpID0gaWwgJiA3OyBpLS07ICsrcG9zKSB7XG4gICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVsoY3JjIF4gZGF0YVtwb3NdKSAmIDB4ZmZdO1xuICB9XG4gIGZvciAoaSA9IGlsID4+IDM7IGktLTsgcG9zICs9IDgpIHtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW3BvcyAgICBdKSAmIDB4ZmZdO1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdGFibGVbKGNyYyBeIGRhdGFbcG9zICsgMV0pICYgMHhmZl07XG4gICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVsoY3JjIF4gZGF0YVtwb3MgKyAyXSkgJiAweGZmXTtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW3BvcyArIDNdKSAmIDB4ZmZdO1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdGFibGVbKGNyYyBeIGRhdGFbcG9zICsgNF0pICYgMHhmZl07XG4gICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVsoY3JjIF4gZGF0YVtwb3MgKyA1XSkgJiAweGZmXTtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW3BvcyArIDZdKSAmIDB4ZmZdO1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdGFibGVbKGNyYyBeIGRhdGFbcG9zICsgN10pICYgMHhmZl07XG4gIH1cblxuICByZXR1cm4gKGNyYyBeIDB4ZmZmZmZmZmYpID4+PiAwO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtXG4gKiBAcGFyYW0ge251bWJlcn0gY3JjXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5abGliLkNSQzMyLnNpbmdsZSA9IGZ1bmN0aW9uKG51bSwgY3JjKSB7XG4gIHJldHVybiAoWmxpYi5DUkMzMi5UYWJsZVsobnVtIF4gY3JjKSAmIDB4ZmZdIF4gKG51bSA+Pj4gOCkpID4+PiAwO1xufTtcblxuLyoqXG4gKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XG4gKiBAY29uc3RcbiAqIEBwcml2YXRlXG4gKi9cblpsaWIuQ1JDMzIuVGFibGVfID0gW1xuICAweDAwMDAwMDAwLCAweDc3MDczMDk2LCAweGVlMGU2MTJjLCAweDk5MDk1MWJhLCAweDA3NmRjNDE5LCAweDcwNmFmNDhmLFxuICAweGU5NjNhNTM1LCAweDllNjQ5NWEzLCAweDBlZGI4ODMyLCAweDc5ZGNiOGE0LCAweGUwZDVlOTFlLCAweDk3ZDJkOTg4LFxuICAweDA5YjY0YzJiLCAweDdlYjE3Y2JkLCAweGU3YjgyZDA3LCAweDkwYmYxZDkxLCAweDFkYjcxMDY0LCAweDZhYjAyMGYyLFxuICAweGYzYjk3MTQ4LCAweDg0YmU0MWRlLCAweDFhZGFkNDdkLCAweDZkZGRlNGViLCAweGY0ZDRiNTUxLCAweDgzZDM4NWM3LFxuICAweDEzNmM5ODU2LCAweDY0NmJhOGMwLCAweGZkNjJmOTdhLCAweDhhNjVjOWVjLCAweDE0MDE1YzRmLCAweDYzMDY2Y2Q5LFxuICAweGZhMGYzZDYzLCAweDhkMDgwZGY1LCAweDNiNmUyMGM4LCAweDRjNjkxMDVlLCAweGQ1NjA0MWU0LCAweGEyNjc3MTcyLFxuICAweDNjMDNlNGQxLCAweDRiMDRkNDQ3LCAweGQyMGQ4NWZkLCAweGE1MGFiNTZiLCAweDM1YjVhOGZhLCAweDQyYjI5ODZjLFxuICAweGRiYmJjOWQ2LCAweGFjYmNmOTQwLCAweDMyZDg2Y2UzLCAweDQ1ZGY1Yzc1LCAweGRjZDYwZGNmLCAweGFiZDEzZDU5LFxuICAweDI2ZDkzMGFjLCAweDUxZGUwMDNhLCAweGM4ZDc1MTgwLCAweGJmZDA2MTE2LCAweDIxYjRmNGI1LCAweDU2YjNjNDIzLFxuICAweGNmYmE5NTk5LCAweGI4YmRhNTBmLCAweDI4MDJiODllLCAweDVmMDU4ODA4LCAweGM2MGNkOWIyLCAweGIxMGJlOTI0LFxuICAweDJmNmY3Yzg3LCAweDU4Njg0YzExLCAweGMxNjExZGFiLCAweGI2NjYyZDNkLCAweDc2ZGM0MTkwLCAweDAxZGI3MTA2LFxuICAweDk4ZDIyMGJjLCAweGVmZDUxMDJhLCAweDcxYjE4NTg5LCAweDA2YjZiNTFmLCAweDlmYmZlNGE1LCAweGU4YjhkNDMzLFxuICAweDc4MDdjOWEyLCAweDBmMDBmOTM0LCAweDk2MDlhODhlLCAweGUxMGU5ODE4LCAweDdmNmEwZGJiLCAweDA4NmQzZDJkLFxuICAweDkxNjQ2Yzk3LCAweGU2NjM1YzAxLCAweDZiNmI1MWY0LCAweDFjNmM2MTYyLCAweDg1NjUzMGQ4LCAweGYyNjIwMDRlLFxuICAweDZjMDY5NWVkLCAweDFiMDFhNTdiLCAweDgyMDhmNGMxLCAweGY1MGZjNDU3LCAweDY1YjBkOWM2LCAweDEyYjdlOTUwLFxuICAweDhiYmViOGVhLCAweGZjYjk4ODdjLCAweDYyZGQxZGRmLCAweDE1ZGEyZDQ5LCAweDhjZDM3Y2YzLCAweGZiZDQ0YzY1LFxuICAweDRkYjI2MTU4LCAweDNhYjU1MWNlLCAweGEzYmMwMDc0LCAweGQ0YmIzMGUyLCAweDRhZGZhNTQxLCAweDNkZDg5NWQ3LFxuICAweGE0ZDFjNDZkLCAweGQzZDZmNGZiLCAweDQzNjllOTZhLCAweDM0NmVkOWZjLCAweGFkNjc4ODQ2LCAweGRhNjBiOGQwLFxuICAweDQ0MDQyZDczLCAweDMzMDMxZGU1LCAweGFhMGE0YzVmLCAweGRkMGQ3Y2M5LCAweDUwMDU3MTNjLCAweDI3MDI0MWFhLFxuICAweGJlMGIxMDEwLCAweGM5MGMyMDg2LCAweDU3NjhiNTI1LCAweDIwNmY4NWIzLCAweGI5NjZkNDA5LCAweGNlNjFlNDlmLFxuICAweDVlZGVmOTBlLCAweDI5ZDljOTk4LCAweGIwZDA5ODIyLCAweGM3ZDdhOGI0LCAweDU5YjMzZDE3LCAweDJlYjQwZDgxLFxuICAweGI3YmQ1YzNiLCAweGMwYmE2Y2FkLCAweGVkYjg4MzIwLCAweDlhYmZiM2I2LCAweDAzYjZlMjBjLCAweDc0YjFkMjlhLFxuICAweGVhZDU0NzM5LCAweDlkZDI3N2FmLCAweDA0ZGIyNjE1LCAweDczZGMxNjgzLCAweGUzNjMwYjEyLCAweDk0NjQzYjg0LFxuICAweDBkNmQ2YTNlLCAweDdhNmE1YWE4LCAweGU0MGVjZjBiLCAweDkzMDlmZjlkLCAweDBhMDBhZTI3LCAweDdkMDc5ZWIxLFxuICAweGYwMGY5MzQ0LCAweDg3MDhhM2QyLCAweDFlMDFmMjY4LCAweDY5MDZjMmZlLCAweGY3NjI1NzVkLCAweDgwNjU2N2NiLFxuICAweDE5NmMzNjcxLCAweDZlNmIwNmU3LCAweGZlZDQxYjc2LCAweDg5ZDMyYmUwLCAweDEwZGE3YTVhLCAweDY3ZGQ0YWNjLFxuICAweGY5YjlkZjZmLCAweDhlYmVlZmY5LCAweDE3YjdiZTQzLCAweDYwYjA4ZWQ1LCAweGQ2ZDZhM2U4LCAweGExZDE5MzdlLFxuICAweDM4ZDhjMmM0LCAweDRmZGZmMjUyLCAweGQxYmI2N2YxLCAweGE2YmM1NzY3LCAweDNmYjUwNmRkLCAweDQ4YjIzNjRiLFxuICAweGQ4MGQyYmRhLCAweGFmMGExYjRjLCAweDM2MDM0YWY2LCAweDQxMDQ3YTYwLCAweGRmNjBlZmMzLCAweGE4NjdkZjU1LFxuICAweDMxNmU4ZWVmLCAweDQ2NjliZTc5LCAweGNiNjFiMzhjLCAweGJjNjY4MzFhLCAweDI1NmZkMmEwLCAweDUyNjhlMjM2LFxuICAweGNjMGM3Nzk1LCAweGJiMGI0NzAzLCAweDIyMDIxNmI5LCAweDU1MDUyNjJmLCAweGM1YmEzYmJlLCAweGIyYmQwYjI4LFxuICAweDJiYjQ1YTkyLCAweDVjYjM2YTA0LCAweGMyZDdmZmE3LCAweGI1ZDBjZjMxLCAweDJjZDk5ZThiLCAweDViZGVhZTFkLFxuICAweDliNjRjMmIwLCAweGVjNjNmMjI2LCAweDc1NmFhMzljLCAweDAyNmQ5MzBhLCAweDljMDkwNmE5LCAweGViMGUzNjNmLFxuICAweDcyMDc2Nzg1LCAweDA1MDA1NzEzLCAweDk1YmY0YTgyLCAweGUyYjg3YTE0LCAweDdiYjEyYmFlLCAweDBjYjYxYjM4LFxuICAweDkyZDI4ZTliLCAweGU1ZDViZTBkLCAweDdjZGNlZmI3LCAweDBiZGJkZjIxLCAweDg2ZDNkMmQ0LCAweGYxZDRlMjQyLFxuICAweDY4ZGRiM2Y4LCAweDFmZGE4MzZlLCAweDgxYmUxNmNkLCAweGY2YjkyNjViLCAweDZmYjA3N2UxLCAweDE4Yjc0Nzc3LFxuICAweDg4MDg1YWU2LCAweGZmMGY2YTcwLCAweDY2MDYzYmNhLCAweDExMDEwYjVjLCAweDhmNjU5ZWZmLCAweGY4NjJhZTY5LFxuICAweDYxNmJmZmQzLCAweDE2NmNjZjQ1LCAweGEwMGFlMjc4LCAweGQ3MGRkMmVlLCAweDRlMDQ4MzU0LCAweDM5MDNiM2MyLFxuICAweGE3NjcyNjYxLCAweGQwNjAxNmY3LCAweDQ5Njk0NzRkLCAweDNlNmU3N2RiLCAweGFlZDE2YTRhLCAweGQ5ZDY1YWRjLFxuICAweDQwZGYwYjY2LCAweDM3ZDgzYmYwLCAweGE5YmNhZTUzLCAweGRlYmI5ZWM1LCAweDQ3YjJjZjdmLCAweDMwYjVmZmU5LFxuICAweGJkYmRmMjFjLCAweGNhYmFjMjhhLCAweDUzYjM5MzMwLCAweDI0YjRhM2E2LCAweGJhZDAzNjA1LCAweGNkZDcwNjkzLFxuICAweDU0ZGU1NzI5LCAweDIzZDk2N2JmLCAweGIzNjY3YTJlLCAweGM0NjE0YWI4LCAweDVkNjgxYjAyLCAweDJhNmYyYjk0LFxuICAweGI0MGJiZTM3LCAweGMzMGM4ZWExLCAweDVhMDVkZjFiLCAweDJkMDJlZjhkXG5dO1xuXG4vKipcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gQ1JDLTMyIFRhYmxlLlxuICogQGNvbnN0XG4gKi9cblpsaWIuQ1JDMzIuVGFibGUgPSBaTElCX0NSQzMyX0NPTVBBQ1QgPyAoZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovXG4gIHZhciB0YWJsZSA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50MzJBcnJheSA6IEFycmF5KSgyNTYpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGM7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBqO1xuXG4gIGZvciAoaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICAgIGMgPSBpO1xuICAgIGZvciAoaiA9IDA7IGogPCA4OyArK2opIHtcbiAgICAgIGMgPSAoYyAmIDEpID8gKDB4ZWRCODgzMjAgXiAoYyA+Pj4gMSkpIDogKGMgPj4+IDEpO1xuICAgIH1cbiAgICB0YWJsZVtpXSA9IGMgPj4+IDA7XG4gIH1cblxuICByZXR1cm4gdGFibGU7XG59KSgpIDogVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDMyQXJyYXkoWmxpYi5DUkMzMi5UYWJsZV8pIDogWmxpYi5DUkMzMi5UYWJsZV87XG5cbn0pO1xuIiwiZ29vZy5wcm92aWRlKCdGaXhQaGFudG9tSlNGdW5jdGlvbkFwcGx5QnVnX1N0cmluZ0Zyb21DaGFyQ29kZScpO1xuXG5pZiAoZ29vZy5nbG9iYWxbJ1VpbnQ4QXJyYXknXSAhPT0gdm9pZCAwKSB7XG4gIHRyeSB7XG4gICAgLy8gYW50aS1vcHRpbWl6YXRpb25cbiAgICBldmFsKFwiU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDhBcnJheShbMF0pKTtcIik7XG4gIH0gY2F0Y2goZSkge1xuICAgIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkgPSAoZnVuY3Rpb24oZnJvbUNoYXJDb2RlQXBwbHkpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbih0aGlzb2JqLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBmcm9tQ2hhckNvZGVBcHBseS5jYWxsKFN0cmluZy5mcm9tQ2hhckNvZGUsIHRoaXNvYmosIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpKTtcbiAgICAgIH1cbiAgICB9KShTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KTtcbiAgfVxufSIsImdvb2cucHJvdmlkZSgnWmxpYi5HdW56aXBNZW1iZXInKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuWmxpYi5HdW56aXBNZW1iZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHNpZ25hdHVyZSBmaXJzdCBieXRlLiAqL1xuICB0aGlzLmlkMTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHNpZ25hdHVyZSBzZWNvbmQgYnl0ZS4gKi9cbiAgdGhpcy5pZDI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjb21wcmVzc2lvbiBtZXRob2QuICovXG4gIHRoaXMuY207XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBmbGFncy4gKi9cbiAgdGhpcy5mbGc7XG4gIC8qKiBAdHlwZSB7RGF0ZX0gbW9kaWZpY2F0aW9uIHRpbWUuICovXG4gIHRoaXMubXRpbWU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBleHRyYSBmbGFncy4gKi9cbiAgdGhpcy54Zmw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBvcGVyYXRpbmcgc3lzdGVtIG51bWJlci4gKi9cbiAgdGhpcy5vcztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IENSQy0xNiB2YWx1ZSBmb3IgRkhDUkMgZmxhZy4gKi9cbiAgdGhpcy5jcmMxNjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGV4dHJhIGxlbmd0aC4gKi9cbiAgdGhpcy54bGVuO1xuICAvKiogQHR5cGUge251bWJlcn0gQ1JDLTMyIHZhbHVlIGZvciB2ZXJpZmljYXRpb24uICovXG4gIHRoaXMuY3JjMzI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBzaXplIG1vZHVsbyAzMiB2YWx1ZS4gKi9cbiAgdGhpcy5pc2l6ZTtcbiAgLyoqIEB0eXBlIHtzdHJpbmd9IGZpbGVuYW1lLiAqL1xuICB0aGlzLm5hbWU7XG4gIC8qKiBAdHlwZSB7c3RyaW5nfSBjb21tZW50LiAqL1xuICB0aGlzLmNvbW1lbnQ7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gKi9cbiAgdGhpcy5kYXRhO1xufTtcblxuWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldE5hbWUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMubmFtZTtcbn07XG5cblpsaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXREYXRhID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmRhdGE7XG59O1xuXG5abGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TXRpbWUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMubXRpbWU7XG59XG5cbn0pOyIsIi8qKlxuICogQGZpbGVvdmVydmlldyBIZWFwIFNvcnQg5a6f6KOFLiDjg4/jg5Xjg57jg7PnrKblj7fljJbjgafkvb/nlKjjgZnjgosuXG4gKi9cblxuZ29vZy5wcm92aWRlKCdabGliLkhlYXAnKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIOOCq+OCueOCv+ODoOODj+ODleODnuODs+espuWPt+OBp+S9v+eUqOOBmeOCi+ODkuODvOODl+Wun+ijhVxuICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCDjg5Ljg7zjg5fjgrXjgqTjgrouXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuWmxpYi5IZWFwID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gIHRoaXMuYnVmZmVyID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQxNkFycmF5IDogQXJyYXkpKGxlbmd0aCAqIDIpO1xuICB0aGlzLmxlbmd0aCA9IDA7XG59O1xuXG4vKipcbiAqIOimquODjuODvOODieOBriBpbmRleCDlj5blvpdcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCDlrZDjg47jg7zjg4njga4gaW5kZXguXG4gKiBAcmV0dXJuIHtudW1iZXJ9IOimquODjuODvOODieOBriBpbmRleC5cbiAqXG4gKi9cblpsaWIuSGVhcC5wcm90b3R5cGUuZ2V0UGFyZW50ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgcmV0dXJuICgoaW5kZXggLSAyKSAvIDQgfCAwKSAqIDI7XG59O1xuXG4vKipcbiAqIOWtkOODjuODvOODieOBriBpbmRleCDlj5blvpdcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCDopqrjg47jg7zjg4njga4gaW5kZXguXG4gKiBAcmV0dXJuIHtudW1iZXJ9IOWtkOODjuODvOODieOBriBpbmRleC5cbiAqL1xuWmxpYi5IZWFwLnByb3RvdHlwZS5nZXRDaGlsZCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gIHJldHVybiAyICogaW5kZXggKyAyO1xufTtcblxuLyoqXG4gKiBIZWFwIOOBq+WApOOCkui/veWKoOOBmeOCi1xuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IOOCreODvCBpbmRleC5cbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSDlgKQuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IOePvuWcqOOBruODkuODvOODl+mVty5cbiAqL1xuWmxpYi5IZWFwLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oaW5kZXgsIHZhbHVlKSB7XG4gIHZhciBjdXJyZW50LCBwYXJlbnQsXG4gICAgICBoZWFwID0gdGhpcy5idWZmZXIsXG4gICAgICBzd2FwO1xuXG4gIGN1cnJlbnQgPSB0aGlzLmxlbmd0aDtcbiAgaGVhcFt0aGlzLmxlbmd0aCsrXSA9IHZhbHVlO1xuICBoZWFwW3RoaXMubGVuZ3RoKytdID0gaW5kZXg7XG5cbiAgLy8g44Or44O844OI44OO44O844OJ44Gr44Gf44Gp44KK552A44GP44G+44Gn5YWl44KM5pu/44GI44KS6Kmm44G/44KLXG4gIHdoaWxlIChjdXJyZW50ID4gMCkge1xuICAgIHBhcmVudCA9IHRoaXMuZ2V0UGFyZW50KGN1cnJlbnQpO1xuXG4gICAgLy8g6Kaq44OO44O844OJ44Go5q+U6LyD44GX44Gm6Kaq44Gu5pa544GM5bCP44GV44GR44KM44Gw5YWl44KM5pu/44GI44KLXG4gICAgaWYgKGhlYXBbY3VycmVudF0gPiBoZWFwW3BhcmVudF0pIHtcbiAgICAgIHN3YXAgPSBoZWFwW2N1cnJlbnRdO1xuICAgICAgaGVhcFtjdXJyZW50XSA9IGhlYXBbcGFyZW50XTtcbiAgICAgIGhlYXBbcGFyZW50XSA9IHN3YXA7XG5cbiAgICAgIHN3YXAgPSBoZWFwW2N1cnJlbnQgKyAxXTtcbiAgICAgIGhlYXBbY3VycmVudCArIDFdID0gaGVhcFtwYXJlbnQgKyAxXTtcbiAgICAgIGhlYXBbcGFyZW50ICsgMV0gPSBzd2FwO1xuXG4gICAgICBjdXJyZW50ID0gcGFyZW50O1xuICAgIC8vIOWFpeOCjOabv+OBiOOBjOW/heimgeOBquOBj+OBquOBo+OBn+OCieOBneOBk+OBp+aKnOOBkeOCi1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcy5sZW5ndGg7XG59O1xuXG4vKipcbiAqIEhlYXDjgYvjgonkuIDnlarlpKfjgY3jgYTlgKTjgpLov5TjgZlcbiAqIEByZXR1cm4ge3tpbmRleDogbnVtYmVyLCB2YWx1ZTogbnVtYmVyLCBsZW5ndGg6IG51bWJlcn19IHtpbmRleDog44Kt44O8aW5kZXgsXG4gKiAgICAgdmFsdWU6IOWApCwgbGVuZ3RoOiDjg5Ljg7zjg5fplbd9IOOBriBPYmplY3QuXG4gKi9cblpsaWIuSGVhcC5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpbmRleCwgdmFsdWUsXG4gICAgICBoZWFwID0gdGhpcy5idWZmZXIsIHN3YXAsXG4gICAgICBjdXJyZW50LCBwYXJlbnQ7XG5cbiAgdmFsdWUgPSBoZWFwWzBdO1xuICBpbmRleCA9IGhlYXBbMV07XG5cbiAgLy8g5b6M44KN44GL44KJ5YCk44KS5Y+W44KLXG4gIHRoaXMubGVuZ3RoIC09IDI7XG4gIGhlYXBbMF0gPSBoZWFwW3RoaXMubGVuZ3RoXTtcbiAgaGVhcFsxXSA9IGhlYXBbdGhpcy5sZW5ndGggKyAxXTtcblxuICBwYXJlbnQgPSAwO1xuICAvLyDjg6vjg7zjg4jjg47jg7zjg4njgYvjgonkuIvjgYzjgaPjgabjgYTjgY9cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBjdXJyZW50ID0gdGhpcy5nZXRDaGlsZChwYXJlbnQpO1xuXG4gICAgLy8g56+E5Zuy44OB44Kn44OD44KvXG4gICAgaWYgKGN1cnJlbnQgPj0gdGhpcy5sZW5ndGgpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIOmao+OBruODjuODvOODieOBqOavlOi8g+OBl+OBpuOAgemao+OBruaWueOBjOWApOOBjOWkp+OBjeOBkeOCjOOBsOmao+OCkuePvuWcqOODjuODvOODieOBqOOBl+OBpumBuOaKnlxuICAgIGlmIChjdXJyZW50ICsgMiA8IHRoaXMubGVuZ3RoICYmIGhlYXBbY3VycmVudCArIDJdID4gaGVhcFtjdXJyZW50XSkge1xuICAgICAgY3VycmVudCArPSAyO1xuICAgIH1cblxuICAgIC8vIOimquODjuODvOODieOBqOavlOi8g+OBl+OBpuimquOBruaWueOBjOWwj+OBleOBhOWgtOWQiOOBr+WFpeOCjOabv+OBiOOCi1xuICAgIGlmIChoZWFwW2N1cnJlbnRdID4gaGVhcFtwYXJlbnRdKSB7XG4gICAgICBzd2FwID0gaGVhcFtwYXJlbnRdO1xuICAgICAgaGVhcFtwYXJlbnRdID0gaGVhcFtjdXJyZW50XTtcbiAgICAgIGhlYXBbY3VycmVudF0gPSBzd2FwO1xuXG4gICAgICBzd2FwID0gaGVhcFtwYXJlbnQgKyAxXTtcbiAgICAgIGhlYXBbcGFyZW50ICsgMV0gPSBoZWFwW2N1cnJlbnQgKyAxXTtcbiAgICAgIGhlYXBbY3VycmVudCArIDFdID0gc3dhcDtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcGFyZW50ID0gY3VycmVudDtcbiAgfVxuXG4gIHJldHVybiB7aW5kZXg6IGluZGV4LCB2YWx1ZTogdmFsdWUsIGxlbmd0aDogdGhpcy5sZW5ndGh9O1xufTtcblxuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuXG4vKiB2aW06c2V0IGV4cGFuZHRhYiB0cz0yIHN3PTIgdHc9ODA6ICovXG4iLCJnb29nLnByb3ZpZGUoJ1psaWIuSHVmZm1hbicpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogYnVpbGQgaHVmZm1hbiB0YWJsZSBmcm9tIGxlbmd0aCBsaXN0LlxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBsZW5ndGhzIGxlbmd0aCBsaXN0LlxuICogQHJldHVybiB7IUFycmF5fSBodWZmbWFuIHRhYmxlLlxuICovXG5abGliLkh1ZmZtYW4uYnVpbGRIdWZmbWFuVGFibGUgPSBmdW5jdGlvbihsZW5ndGhzKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsZW5ndGggbGlzdCBzaXplLiAqL1xuICB2YXIgbGlzdFNpemUgPSBsZW5ndGhzLmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG1heCBjb2RlIGxlbmd0aCBmb3IgdGFibGUgc2l6ZS4gKi9cbiAgdmFyIG1heENvZGVMZW5ndGggPSAwO1xuICAvKiogQHR5cGUge251bWJlcn0gbWluIGNvZGUgbGVuZ3RoIGZvciB0YWJsZSBzaXplLiAqL1xuICB2YXIgbWluQ29kZUxlbmd0aCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHRhYmxlIHNpemUuICovXG4gIHZhciBzaXplO1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IGh1ZmZtYW4gY29kZSB0YWJsZS4gKi9cbiAgdmFyIHRhYmxlO1xuICAvKiogQHR5cGUge251bWJlcn0gYml0IGxlbmd0aC4gKi9cbiAgdmFyIGJpdExlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZS4gKi9cbiAgdmFyIGNvZGU7XG4gIC8qKlxuICAgKiDjgrXjgqTjgrrjgYwgMl5tYXhsZW5ndGgg5YCL44Gu44OG44O844OW44Or44KS5Z+L44KB44KL44Gf44KB44Gu44K544Kt44OD44OX6ZW3LlxuICAgKiBAdHlwZSB7bnVtYmVyfSBza2lwIGxlbmd0aCBmb3IgdGFibGUgZmlsbGluZy5cbiAgICovXG4gIHZhciBza2lwO1xuICAvKiogQHR5cGUge251bWJlcn0gcmV2ZXJzZWQgY29kZS4gKi9cbiAgdmFyIHJldmVyc2VkO1xuICAvKiogQHR5cGUge251bWJlcn0gcmV2ZXJzZSB0ZW1wLiAqL1xuICB2YXIgcnRlbXA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBsaW1pdC4gKi9cbiAgdmFyIGlsO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBjb3VudGVyLiAqL1xuICB2YXIgajtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHRhYmxlIHZhbHVlLiAqL1xuICB2YXIgdmFsdWU7XG5cbiAgLy8gTWF0aC5tYXgg44Gv6YGF44GE44Gu44Gn5pyA6ZW344Gu5YCk44GvIGZvci1sb29wIOOBp+WPluW+l+OBmeOCi1xuICBmb3IgKGkgPSAwLCBpbCA9IGxpc3RTaXplOyBpIDwgaWw7ICsraSkge1xuICAgIGlmIChsZW5ndGhzW2ldID4gbWF4Q29kZUxlbmd0aCkge1xuICAgICAgbWF4Q29kZUxlbmd0aCA9IGxlbmd0aHNbaV07XG4gICAgfVxuICAgIGlmIChsZW5ndGhzW2ldIDwgbWluQ29kZUxlbmd0aCkge1xuICAgICAgbWluQ29kZUxlbmd0aCA9IGxlbmd0aHNbaV07XG4gICAgfVxuICB9XG5cbiAgc2l6ZSA9IDEgPDwgbWF4Q29kZUxlbmd0aDtcbiAgdGFibGUgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDMyQXJyYXkgOiBBcnJheSkoc2l6ZSk7XG5cbiAgLy8g44OT44OD44OI6ZW344Gu55+t44GE6aCG44GL44KJ44OP44OV44Oe44Oz56ym5Y+344KS5Ymy44KK5b2T44Gm44KLXG4gIGZvciAoYml0TGVuZ3RoID0gMSwgY29kZSA9IDAsIHNraXAgPSAyOyBiaXRMZW5ndGggPD0gbWF4Q29kZUxlbmd0aDspIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdFNpemU7ICsraSkge1xuICAgICAgaWYgKGxlbmd0aHNbaV0gPT09IGJpdExlbmd0aCkge1xuICAgICAgICAvLyDjg5Pjg4Pjg4jjgqrjg7zjg4Djg7zjgYzpgIbjgavjgarjgovjgZ/jgoHjg5Pjg4Pjg4jplbfliIbkuKbjgbPjgpLlj43ou6LjgZnjgotcbiAgICAgICAgZm9yIChyZXZlcnNlZCA9IDAsIHJ0ZW1wID0gY29kZSwgaiA9IDA7IGogPCBiaXRMZW5ndGg7ICsraikge1xuICAgICAgICAgIHJldmVyc2VkID0gKHJldmVyc2VkIDw8IDEpIHwgKHJ0ZW1wICYgMSk7XG4gICAgICAgICAgcnRlbXAgPj49IDE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmnIDlpKfjg5Pjg4Pjg4jplbfjgpLjgoLjgajjgavjg4bjg7zjg5bjg6vjgpLkvZzjgovjgZ/jgoHjgIFcbiAgICAgICAgLy8g5pyA5aSn44OT44OD44OI6ZW35Lul5aSW44Gn44GvIDAgLyAxIOOBqeOBoeOCieOBp+OCguiJr+OBhOeuh+aJgOOBjOOBp+OBjeOCi1xuICAgICAgICAvLyDjgZ3jga7jganjgaHjgonjgafjgoLoia/jgYTloLTmiYDjga/lkIzjgZjlgKTjgafln4vjgoHjgovjgZPjgajjgadcbiAgICAgICAgLy8g5pys5p2l44Gu44OT44OD44OI6ZW35Lul5LiK44Gu44OT44OD44OI5pWw5Y+W5b6X44GX44Gm44KC5ZWP6aGM44GM6LW344GT44KJ44Gq44GE44KI44GG44Gr44GZ44KLXG4gICAgICAgIHZhbHVlID0gKGJpdExlbmd0aCA8PCAxNikgfCBpO1xuICAgICAgICBmb3IgKGogPSByZXZlcnNlZDsgaiA8IHNpemU7IGogKz0gc2tpcCkge1xuICAgICAgICAgIHRhYmxlW2pdID0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICArK2NvZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5qyh44Gu44OT44OD44OI6ZW344G4XG4gICAgKytiaXRMZW5ndGg7XG4gICAgY29kZSA8PD0gMTtcbiAgICBza2lwIDw8PSAxO1xuICB9XG5cbiAgcmV0dXJuIFt0YWJsZSwgbWF4Q29kZUxlbmd0aCwgbWluQ29kZUxlbmd0aF07XG59O1xuXG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBEZWZsYXRlIChSRkMxOTUxKSDnrKblj7fljJbjgqLjg6vjgrTjg6rjgrrjg6Dlrp/oo4UuXG4gKi9cblxuZ29vZy5wcm92aWRlKCdabGliLlJhd0RlZmxhdGUnKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkJpdFN0cmVhbScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkhlYXAnKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBSYXcgRGVmbGF0ZSDlrp/oo4VcbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5wdXQg56ym5Y+35YyW44GZ44KL5a++6LGh44Gu44OQ44OD44OV44KhLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICpcbiAqIHR5cGVkIGFycmF5IOOBjOS9v+eUqOWPr+iDveOBquOBqOOBjeOAgW91dHB1dEJ1ZmZlciDjgYwgQXJyYXkg44Gv6Ieq5YuV55qE44GrIFVpbnQ4QXJyYXkg44GrXG4gKiDlpInmj5vjgZXjgozjgb7jgZkuXG4gKiDliKXjga7jgqrjg5bjgrjjgqfjgq/jg4jjgavjgarjgovjgZ/jgoHlh7rlipvjg5Djg4Pjg5XjgqHjgpLlj4LnhafjgZfjgabjgYTjgovlpInmlbDjgarjganjga9cbiAqIOabtOaWsOOBmeOCi+W/heimgeOBjOOBguOCiuOBvuOBmS5cbiAqL1xuWmxpYi5SYXdEZWZsYXRlID0gZnVuY3Rpb24oaW5wdXQsIG9wdF9wYXJhbXMpIHtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlfSAqL1xuICB0aGlzLmNvbXByZXNzaW9uVHlwZSA9IFpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRFlOQU1JQztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMubGF6eSA9IDA7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovXG4gIHRoaXMuZnJlcXNMaXRMZW47XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovXG4gIHRoaXMuZnJlcXNEaXN0O1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHRoaXMuaW5wdXQgPVxuICAgIChVU0VfVFlQRURBUlJBWSAmJiBpbnB1dCBpbnN0YW5jZW9mIEFycmF5KSA/IG5ldyBVaW50OEFycmF5KGlucHV0KSA6IGlucHV0O1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBvdXRwdXQgYnVmZmVyLiAqL1xuICB0aGlzLm91dHB1dDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHBvcyBvdXRwdXQgYnVmZmVyIHBvc2l0aW9uLiAqL1xuICB0aGlzLm9wID0gMDtcblxuICAvLyBvcHRpb24gcGFyYW1ldGVyc1xuICBpZiAob3B0X3BhcmFtcykge1xuICAgIGlmIChvcHRfcGFyYW1zWydsYXp5J10pIHtcbiAgICAgIHRoaXMubGF6eSA9IG9wdF9wYXJhbXNbJ2xhenknXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW1zWydjb21wcmVzc2lvblR5cGUnXSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRoaXMuY29tcHJlc3Npb25UeXBlID0gb3B0X3BhcmFtc1snY29tcHJlc3Npb25UeXBlJ107XG4gICAgfVxuICAgIGlmIChvcHRfcGFyYW1zWydvdXRwdXRCdWZmZXInXSkge1xuICAgICAgdGhpcy5vdXRwdXQgPVxuICAgICAgICAoVVNFX1RZUEVEQVJSQVkgJiYgb3B0X3BhcmFtc1snb3V0cHV0QnVmZmVyJ10gaW5zdGFuY2VvZiBBcnJheSkgP1xuICAgICAgICBuZXcgVWludDhBcnJheShvcHRfcGFyYW1zWydvdXRwdXRCdWZmZXInXSkgOiBvcHRfcGFyYW1zWydvdXRwdXRCdWZmZXInXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW1zWydvdXRwdXRJbmRleCddID09PSAnbnVtYmVyJykge1xuICAgICAgdGhpcy5vcCA9IG9wdF9wYXJhbXNbJ291dHB1dEluZGV4J107XG4gICAgfVxuICB9XG5cbiAgaWYgKCF0aGlzLm91dHB1dCkge1xuICAgIHRoaXMub3V0cHV0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoMHg4MDAwKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5abGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlID0ge1xuICBOT05FOiAwLFxuICBGSVhFRDogMSxcbiAgRFlOQU1JQzogMixcbiAgUkVTRVJWRUQ6IDNcbn07XG5cblxuLyoqXG4gKiBMWjc3IOOBruacgOWwj+ODnuODg+ODgemVt1xuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5abGliLlJhd0RlZmxhdGUuTHo3N01pbkxlbmd0aCA9IDM7XG5cbi8qKlxuICogTFo3NyDjga7mnIDlpKfjg57jg4Pjg4HplbdcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn1cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXhMZW5ndGggPSAyNTg7XG5cbi8qKlxuICogTFo3NyDjga7jgqbjgqPjg7Pjg4njgqbjgrXjgqTjgrpcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn1cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLldpbmRvd1NpemUgPSAweDgwMDA7XG5cbi8qKlxuICog5pyA6ZW344Gu56ym5Y+36ZW3XG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5NYXhDb2RlTGVuZ3RoID0gMTY7XG5cbi8qKlxuICog44OP44OV44Oe44Oz56ym5Y+344Gu5pyA5aSn5pWw5YCkXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5IVUZNQVggPSAyODY7XG5cbi8qKlxuICog5Zu65a6a44OP44OV44Oe44Oz56ym5Y+344Gu56ym5Y+35YyW44OG44O844OW44OrXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtBcnJheS48QXJyYXkuPG51bWJlciwgbnVtYmVyPj59XG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5GaXhlZEh1ZmZtYW5UYWJsZSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHRhYmxlID0gW10sIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IDI4ODsgaSsrKSB7XG4gICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICBjYXNlIChpIDw9IDE0Myk6IHRhYmxlLnB1c2goW2kgICAgICAgKyAweDAzMCwgOF0pOyBicmVhaztcbiAgICAgIGNhc2UgKGkgPD0gMjU1KTogdGFibGUucHVzaChbaSAtIDE0NCArIDB4MTkwLCA5XSk7IGJyZWFrO1xuICAgICAgY2FzZSAoaSA8PSAyNzkpOiB0YWJsZS5wdXNoKFtpIC0gMjU2ICsgMHgwMDAsIDddKTsgYnJlYWs7XG4gICAgICBjYXNlIChpIDw9IDI4Nyk6IHRhYmxlLnB1c2goW2kgLSAyODAgKyAweDBDMCwgOF0pOyBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93ICdpbnZhbGlkIGxpdGVyYWw6ICcgKyBpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YWJsZTtcbn0pKCk7XG5cbi8qKlxuICogREVGTEFURSDjg5bjg63jg4Pjgq/jga7kvZzmiJBcbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IOWcp+e4rua4iOOBvyBieXRlIGFycmF5LlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmNvbXByZXNzID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIGJsb2NrQXJyYXk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgcG9zaXRpb247XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGVuZ3RoO1xuXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG5cbiAgLy8gY29tcHJlc3Npb25cbiAgc3dpdGNoICh0aGlzLmNvbXByZXNzaW9uVHlwZSkge1xuICAgIGNhc2UgWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5OT05FOlxuICAgICAgLy8gZWFjaCA2NTUzNS1CeXRlIChsZW5ndGggaGVhZGVyOiAxNi1iaXQpXG4gICAgICBmb3IgKHBvc2l0aW9uID0gMCwgbGVuZ3RoID0gaW5wdXQubGVuZ3RoOyBwb3NpdGlvbiA8IGxlbmd0aDspIHtcbiAgICAgICAgYmxvY2tBcnJheSA9IFVTRV9UWVBFREFSUkFZID9cbiAgICAgICAgICBpbnB1dC5zdWJhcnJheShwb3NpdGlvbiwgcG9zaXRpb24gKyAweGZmZmYpIDpcbiAgICAgICAgICBpbnB1dC5zbGljZShwb3NpdGlvbiwgcG9zaXRpb24gKyAweGZmZmYpO1xuICAgICAgICBwb3NpdGlvbiArPSBibG9ja0FycmF5Lmxlbmd0aDtcbiAgICAgICAgdGhpcy5tYWtlTm9jb21wcmVzc0Jsb2NrKGJsb2NrQXJyYXksIChwb3NpdGlvbiA9PT0gbGVuZ3RoKSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRklYRUQ6XG4gICAgICB0aGlzLm91dHB1dCA9IHRoaXMubWFrZUZpeGVkSHVmZm1hbkJsb2NrKGlucHV0LCB0cnVlKTtcbiAgICAgIHRoaXMub3AgPSB0aGlzLm91dHB1dC5sZW5ndGg7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRFlOQU1JQzpcbiAgICAgIHRoaXMub3V0cHV0ID0gdGhpcy5tYWtlRHluYW1pY0h1ZmZtYW5CbG9jayhpbnB1dCwgdHJ1ZSk7XG4gICAgICB0aGlzLm9wID0gdGhpcy5vdXRwdXQubGVuZ3RoO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93ICdpbnZhbGlkIGNvbXByZXNzaW9uIHR5cGUnO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMub3V0cHV0O1xufTtcblxuLyoqXG4gKiDpnZ7lnKfnuK7jg5bjg63jg4Pjgq/jga7kvZzmiJBcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gYmxvY2tBcnJheSDjg5bjg63jg4Pjgq/jg4fjg7zjgr8gYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7IWJvb2xlYW59IGlzRmluYWxCbG9jayDmnIDlvozjga7jg5bjg63jg4Pjgq/jgarjgonjgbB0cnVlLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0g6Z2e5Zyn57iu44OW44Ot44OD44KvIGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZU5vY29tcHJlc3NCbG9jayA9XG5mdW5jdGlvbihibG9ja0FycmF5LCBpc0ZpbmFsQmxvY2spIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBiZmluYWw7XG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZX0gKi9cbiAgdmFyIGJ0eXBlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxlbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBubGVuO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaWw7XG5cbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuICB2YXIgb3AgPSB0aGlzLm9wO1xuXG4gIC8vIGV4cGFuZCBidWZmZXJcbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5vdXRwdXQuYnVmZmVyKTtcbiAgICB3aGlsZSAob3V0cHV0Lmxlbmd0aCA8PSBvcCArIGJsb2NrQXJyYXkubGVuZ3RoICsgNSkge1xuICAgICAgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0Lmxlbmd0aCA8PCAxKTtcbiAgICB9XG4gICAgb3V0cHV0LnNldCh0aGlzLm91dHB1dCk7XG4gIH1cblxuICAvLyBoZWFkZXJcbiAgYmZpbmFsID0gaXNGaW5hbEJsb2NrID8gMSA6IDA7XG4gIGJ0eXBlID0gWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5OT05FO1xuICBvdXRwdXRbb3ArK10gPSAoYmZpbmFsKSB8IChidHlwZSA8PCAxKTtcblxuICAvLyBsZW5ndGhcbiAgbGVuID0gYmxvY2tBcnJheS5sZW5ndGg7XG4gIG5sZW4gPSAofmxlbiArIDB4MTAwMDApICYgMHhmZmZmO1xuICBvdXRwdXRbb3ArK10gPSAgICAgICAgICBsZW4gJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAgKGxlbiA+Pj4gOCkgJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAgICAgICAgIG5sZW4gJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAobmxlbiA+Pj4gOCkgJiAweGZmO1xuXG4gIC8vIGNvcHkgYnVmZmVyXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgICBvdXRwdXQuc2V0KGJsb2NrQXJyYXksIG9wKTtcbiAgICAgb3AgKz0gYmxvY2tBcnJheS5sZW5ndGg7XG4gICAgIG91dHB1dCA9IG91dHB1dC5zdWJhcnJheSgwLCBvcCk7XG4gIH0gZWxzZSB7XG4gICAgZm9yIChpID0gMCwgaWwgPSBibG9ja0FycmF5Lmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIG91dHB1dFtvcCsrXSA9IGJsb2NrQXJyYXlbaV07XG4gICAgfVxuICAgIG91dHB1dC5sZW5ndGggPSBvcDtcbiAgfVxuXG4gIHRoaXMub3AgPSBvcDtcbiAgdGhpcy5vdXRwdXQgPSBvdXRwdXQ7XG5cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICog5Zu65a6a44OP44OV44Oe44Oz44OW44Ot44OD44Kv44Gu5L2c5oiQXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGJsb2NrQXJyYXkg44OW44Ot44OD44Kv44OH44O844K/IGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0geyFib29sZWFufSBpc0ZpbmFsQmxvY2sg5pyA5b6M44Gu44OW44Ot44OD44Kv44Gq44KJ44GwdHJ1ZS5cbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IOWbuuWumuODj+ODleODnuODs+espuWPt+WMluODluODreODg+OCryBieXRlIGFycmF5LlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLm1ha2VGaXhlZEh1ZmZtYW5CbG9jayA9XG5mdW5jdGlvbihibG9ja0FycmF5LCBpc0ZpbmFsQmxvY2spIHtcbiAgLyoqIEB0eXBlIHtabGliLkJpdFN0cmVhbX0gKi9cbiAgdmFyIHN0cmVhbSA9IG5ldyBabGliLkJpdFN0cmVhbShVU0VfVFlQRURBUlJBWSA/XG4gICAgbmV3IFVpbnQ4QXJyYXkodGhpcy5vdXRwdXQuYnVmZmVyKSA6IHRoaXMub3V0cHV0LCB0aGlzLm9wKTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBiZmluYWw7XG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZX0gKi9cbiAgdmFyIGJ0eXBlO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSAqL1xuICB2YXIgZGF0YTtcblxuICAvLyBoZWFkZXJcbiAgYmZpbmFsID0gaXNGaW5hbEJsb2NrID8gMSA6IDA7XG4gIGJ0eXBlID0gWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5GSVhFRDtcblxuICBzdHJlYW0ud3JpdGVCaXRzKGJmaW5hbCwgMSwgdHJ1ZSk7XG4gIHN0cmVhbS53cml0ZUJpdHMoYnR5cGUsIDIsIHRydWUpO1xuXG4gIGRhdGEgPSB0aGlzLmx6NzcoYmxvY2tBcnJheSk7XG4gIHRoaXMuZml4ZWRIdWZmbWFuKGRhdGEsIHN0cmVhbSk7XG5cbiAgcmV0dXJuIHN0cmVhbS5maW5pc2goKTtcbn07XG5cbi8qKlxuICog5YuV55qE44OP44OV44Oe44Oz44OW44Ot44OD44Kv44Gu5L2c5oiQXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGJsb2NrQXJyYXkg44OW44Ot44OD44Kv44OH44O844K/IGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0geyFib29sZWFufSBpc0ZpbmFsQmxvY2sg5pyA5b6M44Gu44OW44Ot44OD44Kv44Gq44KJ44GwdHJ1ZS5cbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IOWLleeahOODj+ODleODnuODs+espuWPt+ODluODreODg+OCryBieXRlIGFycmF5LlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLm1ha2VEeW5hbWljSHVmZm1hbkJsb2NrID1cbmZ1bmN0aW9uKGJsb2NrQXJyYXksIGlzRmluYWxCbG9jaykge1xuICAvKiogQHR5cGUge1psaWIuQml0U3RyZWFtfSAqL1xuICB2YXIgc3RyZWFtID0gbmV3IFpsaWIuQml0U3RyZWFtKFVTRV9UWVBFREFSUkFZID9cbiAgICBuZXcgVWludDhBcnJheSh0aGlzLm91dHB1dC5idWZmZXIpIDogdGhpcy5vdXRwdXQsIHRoaXMub3ApO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGJmaW5hbDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlfSAqL1xuICB2YXIgYnR5cGU7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9ICovXG4gIHZhciBkYXRhO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGhsaXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaGRpc3Q7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaGNsZW47XG4gIC8qKiBAY29uc3QgQHR5cGUge0FycmF5LjxudW1iZXI+fSAqL1xuICB2YXIgaGNsZW5PcmRlciA9XG4gICAgICAgIFsxNiwgMTcsIDE4LCAwLCA4LCA3LCA5LCA2LCAxMCwgNSwgMTEsIDQsIDEyLCAzLCAxMywgMiwgMTQsIDEsIDE1XTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgbGl0TGVuTGVuZ3RocztcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gKi9cbiAgdmFyIGxpdExlbkNvZGVzO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBkaXN0TGVuZ3RocztcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gKi9cbiAgdmFyIGRpc3RDb2RlcztcbiAgLyoqIEB0eXBlIHt7XG4gICAqICAgY29kZXM6ICEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpLFxuICAgKiAgIGZyZXFzOiAhKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KVxuICAgKiB9fSAqL1xuICB2YXIgdHJlZVN5bWJvbHM7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIHRyZWVMZW5ndGhzO1xuICAvKiogQHR5cGUge0FycmF5fSAqL1xuICB2YXIgdHJhbnNMZW5ndGhzID0gbmV3IEFycmF5KDE5KTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gKi9cbiAgdmFyIHRyZWVDb2RlcztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBjb2RlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGJpdGxlbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlsO1xuXG4gIC8vIGhlYWRlclxuICBiZmluYWwgPSBpc0ZpbmFsQmxvY2sgPyAxIDogMDtcbiAgYnR5cGUgPSBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkRZTkFNSUM7XG5cbiAgc3RyZWFtLndyaXRlQml0cyhiZmluYWwsIDEsIHRydWUpO1xuICBzdHJlYW0ud3JpdGVCaXRzKGJ0eXBlLCAyLCB0cnVlKTtcblxuICBkYXRhID0gdGhpcy5sejc3KGJsb2NrQXJyYXkpO1xuXG4gIC8vIOODquODhuODqeODq+ODu+mVt+OBlSwg6Led6Zui44Gu44OP44OV44Oe44Oz56ym5Y+344Go56ym5Y+36ZW344Gu566X5Ye6XG4gIGxpdExlbkxlbmd0aHMgPSB0aGlzLmdldExlbmd0aHNfKHRoaXMuZnJlcXNMaXRMZW4sIDE1KTtcbiAgbGl0TGVuQ29kZXMgPSB0aGlzLmdldENvZGVzRnJvbUxlbmd0aHNfKGxpdExlbkxlbmd0aHMpO1xuICBkaXN0TGVuZ3RocyA9IHRoaXMuZ2V0TGVuZ3Roc18odGhpcy5mcmVxc0Rpc3QsIDcpO1xuICBkaXN0Q29kZXMgPSB0aGlzLmdldENvZGVzRnJvbUxlbmd0aHNfKGRpc3RMZW5ndGhzKTtcblxuICAvLyBITElULCBIRElTVCDjga7msbrlrppcbiAgZm9yIChobGl0ID0gMjg2OyBobGl0ID4gMjU3ICYmIGxpdExlbkxlbmd0aHNbaGxpdCAtIDFdID09PSAwOyBobGl0LS0pIHt9XG4gIGZvciAoaGRpc3QgPSAzMDsgaGRpc3QgPiAxICYmIGRpc3RMZW5ndGhzW2hkaXN0IC0gMV0gPT09IDA7IGhkaXN0LS0pIHt9XG5cbiAgLy8gSENMRU5cbiAgdHJlZVN5bWJvbHMgPVxuICAgIHRoaXMuZ2V0VHJlZVN5bWJvbHNfKGhsaXQsIGxpdExlbkxlbmd0aHMsIGhkaXN0LCBkaXN0TGVuZ3Rocyk7XG4gIHRyZWVMZW5ndGhzID0gdGhpcy5nZXRMZW5ndGhzXyh0cmVlU3ltYm9scy5mcmVxcywgNyk7XG4gIGZvciAoaSA9IDA7IGkgPCAxOTsgaSsrKSB7XG4gICAgdHJhbnNMZW5ndGhzW2ldID0gdHJlZUxlbmd0aHNbaGNsZW5PcmRlcltpXV07XG4gIH1cbiAgZm9yIChoY2xlbiA9IDE5OyBoY2xlbiA+IDQgJiYgdHJhbnNMZW5ndGhzW2hjbGVuIC0gMV0gPT09IDA7IGhjbGVuLS0pIHt9XG5cbiAgdHJlZUNvZGVzID0gdGhpcy5nZXRDb2Rlc0Zyb21MZW5ndGhzXyh0cmVlTGVuZ3Rocyk7XG5cbiAgLy8g5Ye65YqbXG4gIHN0cmVhbS53cml0ZUJpdHMoaGxpdCAtIDI1NywgNSwgdHJ1ZSk7XG4gIHN0cmVhbS53cml0ZUJpdHMoaGRpc3QgLSAxLCA1LCB0cnVlKTtcbiAgc3RyZWFtLndyaXRlQml0cyhoY2xlbiAtIDQsIDQsIHRydWUpO1xuICBmb3IgKGkgPSAwOyBpIDwgaGNsZW47IGkrKykge1xuICAgIHN0cmVhbS53cml0ZUJpdHModHJhbnNMZW5ndGhzW2ldLCAzLCB0cnVlKTtcbiAgfVxuXG4gIC8vIOODhOODquODvOOBruWHuuWKm1xuICBmb3IgKGkgPSAwLCBpbCA9IHRyZWVTeW1ib2xzLmNvZGVzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHtcbiAgICBjb2RlID0gdHJlZVN5bWJvbHMuY29kZXNbaV07XG5cbiAgICBzdHJlYW0ud3JpdGVCaXRzKHRyZWVDb2Rlc1tjb2RlXSwgdHJlZUxlbmd0aHNbY29kZV0sIHRydWUpO1xuXG4gICAgLy8gZXh0cmEgYml0c1xuICAgIGlmIChjb2RlID49IDE2KSB7XG4gICAgICBpKys7XG4gICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgY2FzZSAxNjogYml0bGVuID0gMjsgYnJlYWs7XG4gICAgICAgIGNhc2UgMTc6IGJpdGxlbiA9IDM7IGJyZWFrO1xuICAgICAgICBjYXNlIDE4OiBiaXRsZW4gPSA3OyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyAnaW52YWxpZCBjb2RlOiAnICsgY29kZTtcbiAgICAgIH1cblxuICAgICAgc3RyZWFtLndyaXRlQml0cyh0cmVlU3ltYm9scy5jb2Rlc1tpXSwgYml0bGVuLCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICB0aGlzLmR5bmFtaWNIdWZmbWFuKFxuICAgIGRhdGEsXG4gICAgW2xpdExlbkNvZGVzLCBsaXRMZW5MZW5ndGhzXSxcbiAgICBbZGlzdENvZGVzLCBkaXN0TGVuZ3Roc10sXG4gICAgc3RyZWFtXG4gICk7XG5cbiAgcmV0dXJuIHN0cmVhbS5maW5pc2goKTtcbn07XG5cblxuLyoqXG4gKiDli5XnmoTjg4/jg5Xjg57jg7PnrKblj7fljJYo44Kr44K544K/44Og44OP44OV44Oe44Oz44OG44O844OW44OrKVxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gZGF0YUFycmF5IExaNzcg56ym5Y+35YyW5riI44G/IGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0geyFabGliLkJpdFN0cmVhbX0gc3RyZWFtIOabuOOBjei+vOOBv+eUqOODk+ODg+ODiOOCueODiOODquODvOODoC5cbiAqIEByZXR1cm4geyFabGliLkJpdFN0cmVhbX0g44OP44OV44Oe44Oz56ym5Y+35YyW5riI44G/44OT44OD44OI44K544OI44Oq44O844Og44Kq44OW44K444Kn44Kv44OILlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmR5bmFtaWNIdWZmbWFuID1cbmZ1bmN0aW9uKGRhdGFBcnJheSwgbGl0TGVuLCBkaXN0LCBzdHJlYW0pIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbmRleDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGl0ZXJhbDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBjb2RlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxpdExlbkNvZGVzO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxpdExlbkxlbmd0aHM7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgZGlzdENvZGVzO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGRpc3RMZW5ndGhzO1xuXG4gIGxpdExlbkNvZGVzID0gbGl0TGVuWzBdO1xuICBsaXRMZW5MZW5ndGhzID0gbGl0TGVuWzFdO1xuICBkaXN0Q29kZXMgPSBkaXN0WzBdO1xuICBkaXN0TGVuZ3RocyA9IGRpc3RbMV07XG5cbiAgLy8g56ym5Y+344KSIEJpdFN0cmVhbSDjgavmm7jjgY3ovrzjgpPjgafjgYTjgY9cbiAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IGRhdGFBcnJheS5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyArK2luZGV4KSB7XG4gICAgbGl0ZXJhbCA9IGRhdGFBcnJheVtpbmRleF07XG5cbiAgICAvLyBsaXRlcmFsIG9yIGxlbmd0aFxuICAgIHN0cmVhbS53cml0ZUJpdHMobGl0TGVuQ29kZXNbbGl0ZXJhbF0sIGxpdExlbkxlbmd0aHNbbGl0ZXJhbF0sIHRydWUpO1xuXG4gICAgLy8g6ZW344GV44O76Led6Zui56ym5Y+3XG4gICAgaWYgKGxpdGVyYWwgPiAyNTYpIHtcbiAgICAgIC8vIGxlbmd0aCBleHRyYVxuICAgICAgc3RyZWFtLndyaXRlQml0cyhkYXRhQXJyYXlbKytpbmRleF0sIGRhdGFBcnJheVsrK2luZGV4XSwgdHJ1ZSk7XG4gICAgICAvLyBkaXN0YW5jZVxuICAgICAgY29kZSA9IGRhdGFBcnJheVsrK2luZGV4XTtcbiAgICAgIHN0cmVhbS53cml0ZUJpdHMoZGlzdENvZGVzW2NvZGVdLCBkaXN0TGVuZ3Roc1tjb2RlXSwgdHJ1ZSk7XG4gICAgICAvLyBkaXN0YW5jZSBleHRyYVxuICAgICAgc3RyZWFtLndyaXRlQml0cyhkYXRhQXJyYXlbKytpbmRleF0sIGRhdGFBcnJheVsrK2luZGV4XSwgdHJ1ZSk7XG4gICAgLy8g57WC56uvXG4gICAgfSBlbHNlIGlmIChsaXRlcmFsID09PSAyNTYpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdHJlYW07XG59O1xuXG4vKipcbiAqIOWbuuWumuODj+ODleODnuODs+espuWPt+WMllxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gZGF0YUFycmF5IExaNzcg56ym5Y+35YyW5riI44G/IGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0geyFabGliLkJpdFN0cmVhbX0gc3RyZWFtIOabuOOBjei+vOOBv+eUqOODk+ODg+ODiOOCueODiOODquODvOODoC5cbiAqIEByZXR1cm4geyFabGliLkJpdFN0cmVhbX0g44OP44OV44Oe44Oz56ym5Y+35YyW5riI44G/44OT44OD44OI44K544OI44Oq44O844Og44Kq44OW44K444Kn44Kv44OILlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmZpeGVkSHVmZm1hbiA9IGZ1bmN0aW9uKGRhdGFBcnJheSwgc3RyZWFtKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaW5kZXg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxpdGVyYWw7XG5cbiAgLy8g56ym5Y+344KSIEJpdFN0cmVhbSDjgavmm7jjgY3ovrzjgpPjgafjgYTjgY9cbiAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IGRhdGFBcnJheS5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgbGl0ZXJhbCA9IGRhdGFBcnJheVtpbmRleF07XG5cbiAgICAvLyDnrKblj7fjga7mm7jjgY3ovrzjgb9cbiAgICBabGliLkJpdFN0cmVhbS5wcm90b3R5cGUud3JpdGVCaXRzLmFwcGx5KFxuICAgICAgc3RyZWFtLFxuICAgICAgWmxpYi5SYXdEZWZsYXRlLkZpeGVkSHVmZm1hblRhYmxlW2xpdGVyYWxdXG4gICAgKTtcblxuICAgIC8vIOmVt+OBleODu+i3nembouespuWPt1xuICAgIGlmIChsaXRlcmFsID4gMHgxMDApIHtcbiAgICAgIC8vIGxlbmd0aCBleHRyYVxuICAgICAgc3RyZWFtLndyaXRlQml0cyhkYXRhQXJyYXlbKytpbmRleF0sIGRhdGFBcnJheVsrK2luZGV4XSwgdHJ1ZSk7XG4gICAgICAvLyBkaXN0YW5jZVxuICAgICAgc3RyZWFtLndyaXRlQml0cyhkYXRhQXJyYXlbKytpbmRleF0sIDUpO1xuICAgICAgLy8gZGlzdGFuY2UgZXh0cmFcbiAgICAgIHN0cmVhbS53cml0ZUJpdHMoZGF0YUFycmF5WysraW5kZXhdLCBkYXRhQXJyYXlbKytpbmRleF0sIHRydWUpO1xuICAgIC8vIOe1guerr1xuICAgIH0gZWxzZSBpZiAobGl0ZXJhbCA9PT0gMHgxMDApIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdHJlYW07XG59O1xuXG4vKipcbiAqIOODnuODg+ODgeaDheWgsVxuICogQHBhcmFtIHshbnVtYmVyfSBsZW5ndGgg44Oe44OD44OB44GX44Gf6ZW344GVLlxuICogQHBhcmFtIHshbnVtYmVyfSBiYWNrd2FyZERpc3RhbmNlIOODnuODg+ODgeS9jee9ruOBqOOBrui3nemboi5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5abGliLlJhd0RlZmxhdGUuTHo3N01hdGNoID0gZnVuY3Rpb24obGVuZ3RoLCBiYWNrd2FyZERpc3RhbmNlKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtYXRjaCBsZW5ndGguICovXG4gIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gYmFja3dhcmQgZGlzdGFuY2UuICovXG4gIHRoaXMuYmFja3dhcmREaXN0YW5jZSA9IGJhY2t3YXJkRGlzdGFuY2U7XG59O1xuXG4vKipcbiAqIOmVt+OBleespuWPt+ODhuODvOODluODqy5cbiAqIFvjgrPjg7zjg4ksIOaLoeW8teODk+ODg+ODiCwg5ouh5by144OT44OD44OI6ZW3XSDjga7phY3liJfjgajjgarjgaPjgabjgYTjgosuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX1cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaC5MZW5ndGhDb2RlVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQzMkFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoKGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUgeyFBcnJheX0gKi9cbiAgdmFyIHRhYmxlID0gW107XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHshQXJyYXkuPG51bWJlcj59ICovXG4gIHZhciBjO1xuXG4gIGZvciAoaSA9IDM7IGkgPD0gMjU4OyBpKyspIHtcbiAgICBjID0gY29kZShpKTtcbiAgICB0YWJsZVtpXSA9IChjWzJdIDw8IDI0KSB8IChjWzFdIDw8IDE2KSB8IGNbMF07XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCBsejc3IGxlbmd0aC5cbiAgICogQHJldHVybiB7IUFycmF5LjxudW1iZXI+fSBsejc3IGNvZGVzLlxuICAgKi9cbiAgZnVuY3Rpb24gY29kZShsZW5ndGgpIHtcbiAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgIGNhc2UgKGxlbmd0aCA9PT0gMyk6IHJldHVybiBbMjU3LCBsZW5ndGggLSAzLCAwXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDQpOiByZXR1cm4gWzI1OCwgbGVuZ3RoIC0gNCwgMF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoID09PSA1KTogcmV0dXJuIFsyNTksIGxlbmd0aCAtIDUsIDBdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA9PT0gNik6IHJldHVybiBbMjYwLCBsZW5ndGggLSA2LCAwXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDcpOiByZXR1cm4gWzI2MSwgbGVuZ3RoIC0gNywgMF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoID09PSA4KTogcmV0dXJuIFsyNjIsIGxlbmd0aCAtIDgsIDBdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA9PT0gOSk6IHJldHVybiBbMjYzLCBsZW5ndGggLSA5LCAwXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDEwKTogcmV0dXJuIFsyNjQsIGxlbmd0aCAtIDEwLCAwXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMTIpOiByZXR1cm4gWzI2NSwgbGVuZ3RoIC0gMTEsIDFdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAxNCk6IHJldHVybiBbMjY2LCBsZW5ndGggLSAxMywgMV07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDE2KTogcmV0dXJuIFsyNjcsIGxlbmd0aCAtIDE1LCAxXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMTgpOiByZXR1cm4gWzI2OCwgbGVuZ3RoIC0gMTcsIDFdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAyMik6IHJldHVybiBbMjY5LCBsZW5ndGggLSAxOSwgMl07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDI2KTogcmV0dXJuIFsyNzAsIGxlbmd0aCAtIDIzLCAyXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMzApOiByZXR1cm4gWzI3MSwgbGVuZ3RoIC0gMjcsIDJdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAzNCk6IHJldHVybiBbMjcyLCBsZW5ndGggLSAzMSwgMl07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDQyKTogcmV0dXJuIFsyNzMsIGxlbmd0aCAtIDM1LCAzXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gNTApOiByZXR1cm4gWzI3NCwgbGVuZ3RoIC0gNDMsIDNdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSA1OCk6IHJldHVybiBbMjc1LCBsZW5ndGggLSA1MSwgM107IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDY2KTogcmV0dXJuIFsyNzYsIGxlbmd0aCAtIDU5LCAzXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gODIpOiByZXR1cm4gWzI3NywgbGVuZ3RoIC0gNjcsIDRdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSA5OCk6IHJldHVybiBbMjc4LCBsZW5ndGggLSA4MywgNF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDExNCk6IHJldHVybiBbMjc5LCBsZW5ndGggLSA5OSwgNF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDEzMCk6IHJldHVybiBbMjgwLCBsZW5ndGggLSAxMTUsIDRdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAxNjIpOiByZXR1cm4gWzI4MSwgbGVuZ3RoIC0gMTMxLCA1XTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMTk0KTogcmV0dXJuIFsyODIsIGxlbmd0aCAtIDE2MywgNV07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDIyNik6IHJldHVybiBbMjgzLCBsZW5ndGggLSAxOTUsIDVdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAyNTcpOiByZXR1cm4gWzI4NCwgbGVuZ3RoIC0gMjI3LCA1XTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDI1OCk6IHJldHVybiBbMjg1LCBsZW5ndGggLSAyNTgsIDBdOyBicmVhaztcbiAgICAgIGRlZmF1bHQ6IHRocm93ICdpbnZhbGlkIGxlbmd0aDogJyArIGxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFibGU7XG59KSgpKTtcblxuLyoqXG4gKiDot53pm6LnrKblj7fjg4bjg7zjg5bjg6tcbiAqIEBwYXJhbSB7IW51bWJlcn0gZGlzdCDot53pm6IuXG4gKiBAcmV0dXJuIHshQXJyYXkuPG51bWJlcj59IOOCs+ODvOODieOAgeaLoeW8teODk+ODg+ODiOOAgeaLoeW8teODk+ODg+ODiOmVt+OBrumFjeWIly5cbiAqIEBwcml2YXRlXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2gucHJvdG90eXBlLmdldERpc3RhbmNlQ29kZV8gPSBmdW5jdGlvbihkaXN0KSB7XG4gIC8qKiBAdHlwZSB7IUFycmF5LjxudW1iZXI+fSBkaXN0YW5jZSBjb2RlIHRhYmxlLiAqL1xuICB2YXIgcjtcblxuICBzd2l0Y2ggKHRydWUpIHtcbiAgICBjYXNlIChkaXN0ID09PSAxKTogciA9IFswLCBkaXN0IC0gMSwgMF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPT09IDIpOiByID0gWzEsIGRpc3QgLSAyLCAwXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA9PT0gMyk6IHIgPSBbMiwgZGlzdCAtIDMsIDBdOyBicmVhaztcbiAgICBjYXNlIChkaXN0ID09PSA0KTogciA9IFszLCBkaXN0IC0gNCwgMF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gNik6IHIgPSBbNCwgZGlzdCAtIDUsIDFdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDgpOiByID0gWzUsIGRpc3QgLSA3LCAxXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAxMik6IHIgPSBbNiwgZGlzdCAtIDksIDJdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDE2KTogciA9IFs3LCBkaXN0IC0gMTMsIDJdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDI0KTogciA9IFs4LCBkaXN0IC0gMTcsIDNdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDMyKTogciA9IFs5LCBkaXN0IC0gMjUsIDNdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDQ4KTogciA9IFsxMCwgZGlzdCAtIDMzLCA0XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA2NCk6IHIgPSBbMTEsIGRpc3QgLSA0OSwgNF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gOTYpOiByID0gWzEyLCBkaXN0IC0gNjUsIDVdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDEyOCk6IHIgPSBbMTMsIGRpc3QgLSA5NywgNV07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMTkyKTogciA9IFsxNCwgZGlzdCAtIDEyOSwgNl07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMjU2KTogciA9IFsxNSwgZGlzdCAtIDE5MywgNl07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMzg0KTogciA9IFsxNiwgZGlzdCAtIDI1NywgN107IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gNTEyKTogciA9IFsxNywgZGlzdCAtIDM4NSwgN107IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gNzY4KTogciA9IFsxOCwgZGlzdCAtIDUxMywgOF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMTAyNCk6IHIgPSBbMTksIGRpc3QgLSA3NjksIDhdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDE1MzYpOiByID0gWzIwLCBkaXN0IC0gMTAyNSwgOV07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMjA0OCk6IHIgPSBbMjEsIGRpc3QgLSAxNTM3LCA5XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAzMDcyKTogciA9IFsyMiwgZGlzdCAtIDIwNDksIDEwXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA0MDk2KTogciA9IFsyMywgZGlzdCAtIDMwNzMsIDEwXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA2MTQ0KTogciA9IFsyNCwgZGlzdCAtIDQwOTcsIDExXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA4MTkyKTogciA9IFsyNSwgZGlzdCAtIDYxNDUsIDExXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAxMjI4OCk6IHIgPSBbMjYsIGRpc3QgLSA4MTkzLCAxMl07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMTYzODQpOiByID0gWzI3LCBkaXN0IC0gMTIyODksIDEyXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAyNDU3Nik6IHIgPSBbMjgsIGRpc3QgLSAxNjM4NSwgMTNdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDMyNzY4KTogciA9IFsyOSwgZGlzdCAtIDI0NTc3LCAxM107IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRocm93ICdpbnZhbGlkIGRpc3RhbmNlJztcbiAgfVxuXG4gIHJldHVybiByO1xufTtcblxuLyoqXG4gKiDjg57jg4Pjg4Hmg4XloLHjgpIgTFo3NyDnrKblj7fljJbphY3liJfjgafov5TjgZkuXG4gKiDjgarjgYrjgIHjgZPjgZPjgafjga/ku6XkuIvjga7lhoXpg6jku5Xmp5jjgafnrKblj7fljJbjgZfjgabjgYTjgotcbiAqIFsgQ09ERSwgRVhUUkEtQklULUxFTiwgRVhUUkEsIENPREUsIEVYVFJBLUJJVC1MRU4sIEVYVFJBIF1cbiAqIEByZXR1cm4geyFBcnJheS48bnVtYmVyPn0gTFo3NyDnrKblj7fljJYgYnl0ZSBhcnJheS5cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaC5wcm90b3R5cGUudG9Mejc3QXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBkaXN0ID0gdGhpcy5iYWNrd2FyZERpc3RhbmNlO1xuICAvKiogQHR5cGUge0FycmF5fSAqL1xuICB2YXIgY29kZUFycmF5ID0gW107XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgcG9zID0gMDtcbiAgLyoqIEB0eXBlIHshQXJyYXkuPG51bWJlcj59ICovXG4gIHZhciBjb2RlO1xuXG4gIC8vIGxlbmd0aFxuICBjb2RlID0gWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaC5MZW5ndGhDb2RlVGFibGVbbGVuZ3RoXTtcbiAgY29kZUFycmF5W3BvcysrXSA9IGNvZGUgJiAweGZmZmY7XG4gIGNvZGVBcnJheVtwb3MrK10gPSAoY29kZSA+PiAxNikgJiAweGZmO1xuICBjb2RlQXJyYXlbcG9zKytdID0gY29kZSA+PiAyNDtcblxuICAvLyBkaXN0YW5jZVxuICBjb2RlID0gdGhpcy5nZXREaXN0YW5jZUNvZGVfKGRpc3QpO1xuICBjb2RlQXJyYXlbcG9zKytdID0gY29kZVswXTtcbiAgY29kZUFycmF5W3BvcysrXSA9IGNvZGVbMV07XG4gIGNvZGVBcnJheVtwb3MrK10gPSBjb2RlWzJdO1xuXG4gIHJldHVybiBjb2RlQXJyYXk7XG59O1xuXG4vKipcbiAqIExaNzcg5a6f6KOFXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGRhdGFBcnJheSBMWjc3IOespuWPt+WMluOBmeOCi+ODkOOCpOODiOmFjeWIly5cbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSBMWjc3IOespuWPt+WMluOBl+OBn+mFjeWIly5cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5sejc3ID0gZnVuY3Rpb24oZGF0YUFycmF5KSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBwb3NpdGlvbiAqL1xuICB2YXIgcG9zaXRpb247XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBsZW5ndGggKi9cbiAgdmFyIGxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlciAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgbGltaXRlciAqL1xuICB2YXIgaWw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjaGFpbmVkLWhhc2gtdGFibGUga2V5ICovXG4gIHZhciBtYXRjaEtleTtcbiAgLyoqIEB0eXBlIHtPYmplY3QuPG51bWJlciwgQXJyYXkuPG51bWJlcj4+fSBjaGFpbmVkLWhhc2gtdGFibGUgKi9cbiAgdmFyIHRhYmxlID0ge307XG4gIC8qKiBAY29uc3QgQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHdpbmRvd1NpemUgPSBabGliLlJhd0RlZmxhdGUuV2luZG93U2l6ZTtcbiAgLyoqIEB0eXBlIHtBcnJheS48bnVtYmVyPn0gbWF0Y2ggbGlzdCAqL1xuICB2YXIgbWF0Y2hMaXN0O1xuICAvKiogQHR5cGUge1psaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2h9IGxvbmdlc3QgbWF0Y2ggKi9cbiAgdmFyIGxvbmdlc3RNYXRjaDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGUuTHo3N01hdGNofSBwcmV2aW91cyBsb25nZXN0IG1hdGNoICovXG4gIHZhciBwcmV2TWF0Y2g7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9IGx6NzcgYnVmZmVyICovXG4gIHZhciBsejc3YnVmID0gVVNFX1RZUEVEQVJSQVkgP1xuICAgIG5ldyBVaW50MTZBcnJheShkYXRhQXJyYXkubGVuZ3RoICogMikgOiBbXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGx6Nzcgb3V0cHV0IGJ1ZmZlciBwb2ludGVyICovXG4gIHZhciBwb3MgPSAwO1xuICAvKiogQHR5cGUge251bWJlcn0gbHo3NyBza2lwIGxlbmd0aCAqL1xuICB2YXIgc2tpcExlbmd0aCA9IDA7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovXG4gIHZhciBmcmVxc0xpdExlbiA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50MzJBcnJheSA6IEFycmF5KSgyODYpO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqL1xuICB2YXIgZnJlcXNEaXN0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQzMkFycmF5IDogQXJyYXkpKDMwKTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsYXp5ID0gdGhpcy5sYXp5O1xuICAvKiogQHR5cGUgeyp9IHRlbXBvcmFyeSB2YXJpYWJsZSAqL1xuICB2YXIgdG1wO1xuXG4gIC8vIOWIneacn+WMllxuICBpZiAoIVVTRV9UWVBFREFSUkFZKSB7XG4gICAgZm9yIChpID0gMDsgaSA8PSAyODU7KSB7IGZyZXFzTGl0TGVuW2krK10gPSAwOyB9XG4gICAgZm9yIChpID0gMDsgaSA8PSAyOTspIHsgZnJlcXNEaXN0W2krK10gPSAwOyB9XG4gIH1cbiAgZnJlcXNMaXRMZW5bMjU2XSA9IDE7IC8vIEVPQiDjga7mnIDkvY7lh7rnj77lm57mlbDjga8gMVxuXG4gIC8qKlxuICAgKiDjg57jg4Pjg4Hjg4fjg7zjgr/jga7mm7jjgY3ovrzjgb9cbiAgICogQHBhcmFtIHtabGliLlJhd0RlZmxhdGUuTHo3N01hdGNofSBtYXRjaCBMWjc3IE1hdGNoIGRhdGEuXG4gICAqIEBwYXJhbSB7IW51bWJlcn0gb2Zmc2V0IOOCueOCreODg+ODl+mWi+Wni+S9jee9rijnm7jlr77mjIflrpopLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gd3JpdGVNYXRjaChtYXRjaCwgb2Zmc2V0KSB7XG4gICAgLyoqIEB0eXBlIHtBcnJheS48bnVtYmVyPn0gKi9cbiAgICB2YXIgbHo3N0FycmF5ID0gbWF0Y2gudG9Mejc3QXJyYXkoKTtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgaTtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgaWw7XG5cbiAgICBmb3IgKGkgPSAwLCBpbCA9IGx6NzdBcnJheS5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICBsejc3YnVmW3BvcysrXSA9IGx6NzdBcnJheVtpXTtcbiAgICB9XG4gICAgZnJlcXNMaXRMZW5bbHo3N0FycmF5WzBdXSsrO1xuICAgIGZyZXFzRGlzdFtsejc3QXJyYXlbM11dKys7XG4gICAgc2tpcExlbmd0aCA9IG1hdGNoLmxlbmd0aCArIG9mZnNldCAtIDE7XG4gICAgcHJldk1hdGNoID0gbnVsbDtcbiAgfVxuXG4gIC8vIExaNzcg56ym5Y+35YyWXG4gIGZvciAocG9zaXRpb24gPSAwLCBsZW5ndGggPSBkYXRhQXJyYXkubGVuZ3RoOyBwb3NpdGlvbiA8IGxlbmd0aDsgKytwb3NpdGlvbikge1xuICAgIC8vIOODj+ODg+OCt+ODpeOCreODvOOBruS9nOaIkFxuICAgIGZvciAobWF0Y2hLZXkgPSAwLCBpID0gMCwgaWwgPSBabGliLlJhd0RlZmxhdGUuTHo3N01pbkxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGlmIChwb3NpdGlvbiArIGkgPT09IGxlbmd0aCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIG1hdGNoS2V5ID0gKG1hdGNoS2V5IDw8IDgpIHwgZGF0YUFycmF5W3Bvc2l0aW9uICsgaV07XG4gICAgfVxuXG4gICAgLy8g44OG44O844OW44Or44GM5pyq5a6a576p44Gg44Gj44Gf44KJ5L2c5oiQ44GZ44KLXG4gICAgaWYgKHRhYmxlW21hdGNoS2V5XSA9PT0gdm9pZCAwKSB7IHRhYmxlW21hdGNoS2V5XSA9IFtdOyB9XG4gICAgbWF0Y2hMaXN0ID0gdGFibGVbbWF0Y2hLZXldO1xuXG4gICAgLy8gc2tpcFxuICAgIGlmIChza2lwTGVuZ3RoLS0gPiAwKSB7XG4gICAgICBtYXRjaExpc3QucHVzaChwb3NpdGlvbik7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyDjg57jg4Pjg4Hjg4bjg7zjg5bjg6vjga7mm7TmlrAgKOacgOWkp+aIu+OCiui3nembouOCkui2heOBiOOBpuOBhOOCi+OCguOBruOCkuWJiumZpOOBmeOCiylcbiAgICB3aGlsZSAobWF0Y2hMaXN0Lmxlbmd0aCA+IDAgJiYgcG9zaXRpb24gLSBtYXRjaExpc3RbMF0gPiB3aW5kb3dTaXplKSB7XG4gICAgICBtYXRjaExpc3Quc2hpZnQoKTtcbiAgICB9XG5cbiAgICAvLyDjg4fjg7zjgr/mnKvlsL7jgafjg57jg4Pjg4HjgZfjgojjgYbjgYzjgarjgYTloLTlkIjjga/jgZ3jga7jgb7jgb7mtYHjgZfjgZPjgoBcbiAgICBpZiAocG9zaXRpb24gKyBabGliLlJhd0RlZmxhdGUuTHo3N01pbkxlbmd0aCA+PSBsZW5ndGgpIHtcbiAgICAgIGlmIChwcmV2TWF0Y2gpIHtcbiAgICAgICAgd3JpdGVNYXRjaChwcmV2TWF0Y2gsIC0xKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMCwgaWwgPSBsZW5ndGggLSBwb3NpdGlvbjsgaSA8IGlsOyArK2kpIHtcbiAgICAgICAgdG1wID0gZGF0YUFycmF5W3Bvc2l0aW9uICsgaV07XG4gICAgICAgIGx6NzdidWZbcG9zKytdID0gdG1wO1xuICAgICAgICArK2ZyZXFzTGl0TGVuW3RtcF07XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyDjg57jg4Pjg4HlgJnoo5zjgYvjgonmnIDplbfjga7jgoLjga7jgpLmjqLjgZlcbiAgICBpZiAobWF0Y2hMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgIGxvbmdlc3RNYXRjaCA9IHRoaXMuc2VhcmNoTG9uZ2VzdE1hdGNoXyhkYXRhQXJyYXksIHBvc2l0aW9uLCBtYXRjaExpc3QpO1xuXG4gICAgICBpZiAocHJldk1hdGNoKSB7XG4gICAgICAgIC8vIOePvuWcqOOBruODnuODg+ODgeOBruaWueOBjOWJjeWbnuOBruODnuODg+ODgeOCiOOCiuOCgumVt+OBhFxuICAgICAgICBpZiAocHJldk1hdGNoLmxlbmd0aCA8IGxvbmdlc3RNYXRjaC5sZW5ndGgpIHtcbiAgICAgICAgICAvLyB3cml0ZSBwcmV2aW91cyBsaXRlcmFsXG4gICAgICAgICAgdG1wID0gZGF0YUFycmF5W3Bvc2l0aW9uIC0gMV07XG4gICAgICAgICAgbHo3N2J1Zltwb3MrK10gPSB0bXA7XG4gICAgICAgICAgKytmcmVxc0xpdExlblt0bXBdO1xuXG4gICAgICAgICAgLy8gd3JpdGUgY3VycmVudCBtYXRjaFxuICAgICAgICAgIHdyaXRlTWF0Y2gobG9uZ2VzdE1hdGNoLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyB3cml0ZSBwcmV2aW91cyBtYXRjaFxuICAgICAgICAgIHdyaXRlTWF0Y2gocHJldk1hdGNoLCAtMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobG9uZ2VzdE1hdGNoLmxlbmd0aCA8IGxhenkpIHtcbiAgICAgICAgcHJldk1hdGNoID0gbG9uZ2VzdE1hdGNoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd3JpdGVNYXRjaChsb25nZXN0TWF0Y2gsIDApO1xuICAgICAgfVxuICAgIC8vIOWJjeWbnuODnuODg+ODgeOBl+OBpuOBhOOBpuS7iuWbnuODnuODg+ODgeOBjOOBquOBi+OBo+OBn+OCieWJjeWbnuOBruOCkuaOoeeUqFxuICAgIH0gZWxzZSBpZiAocHJldk1hdGNoKSB7XG4gICAgICB3cml0ZU1hdGNoKHByZXZNYXRjaCwgLTEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgPSBkYXRhQXJyYXlbcG9zaXRpb25dO1xuICAgICAgbHo3N2J1Zltwb3MrK10gPSB0bXA7XG4gICAgICArK2ZyZXFzTGl0TGVuW3RtcF07XG4gICAgfVxuXG4gICAgbWF0Y2hMaXN0LnB1c2gocG9zaXRpb24pOyAvLyDjg57jg4Pjg4Hjg4bjg7zjg5bjg6vjgavnj77lnKjjga7kvY3nva7jgpLkv53lrZhcbiAgfVxuXG4gIC8vIOe1guerr+WHpueQhlxuICBsejc3YnVmW3BvcysrXSA9IDI1NjtcbiAgZnJlcXNMaXRMZW5bMjU2XSsrO1xuICB0aGlzLmZyZXFzTGl0TGVuID0gZnJlcXNMaXRMZW47XG4gIHRoaXMuZnJlcXNEaXN0ID0gZnJlcXNEaXN0O1xuXG4gIHJldHVybiAvKiogQHR5cGUgeyEoVWludDE2QXJyYXl8QXJyYXkuPG51bWJlcj4pfSAqLyAoXG4gICAgVVNFX1RZUEVEQVJSQVkgPyAgbHo3N2J1Zi5zdWJhcnJheSgwLCBwb3MpIDogbHo3N2J1ZlxuICApO1xufTtcblxuLyoqXG4gKiDjg57jg4Pjg4HjgZfjgZ/lgJnoo5zjga7kuK3jgYvjgonmnIDplbfkuIDoh7TjgpLmjqLjgZlcbiAqIEBwYXJhbSB7IU9iamVjdH0gZGF0YSBwbGFpbiBkYXRhIGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0geyFudW1iZXJ9IHBvc2l0aW9uIHBsYWluIGRhdGEgYnl0ZSBhcnJheSBwb3NpdGlvbi5cbiAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBtYXRjaExpc3Qg5YCZ6KOc44Go44Gq44KL5L2N572u44Gu6YWN5YiXLlxuICogQHJldHVybiB7IVpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2h9IOacgOmVt+OBi+OBpOacgOefrei3nembouOBruODnuODg+ODgeOCquODluOCuOOCp+OCr+ODiC5cbiAqIEBwcml2YXRlXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuc2VhcmNoTG9uZ2VzdE1hdGNoXyA9XG5mdW5jdGlvbihkYXRhLCBwb3NpdGlvbiwgbWF0Y2hMaXN0KSB7XG4gIHZhciBtYXRjaCxcbiAgICAgIGN1cnJlbnRNYXRjaCxcbiAgICAgIG1hdGNoTWF4ID0gMCwgbWF0Y2hMZW5ndGgsXG4gICAgICBpLCBqLCBsLCBkbCA9IGRhdGEubGVuZ3RoO1xuXG4gIC8vIOWAmeijnOOCkuW+jOOCjeOBi+OCiSAxIOOBpOOBmuOBpOe1nuOCiui+vOOCk+OBp+OChuOBj1xuICBwZXJtYXRjaDpcbiAgZm9yIChpID0gMCwgbCA9IG1hdGNoTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBtYXRjaCA9IG1hdGNoTGlzdFtsIC0gaSAtIDFdO1xuICAgIG1hdGNoTGVuZ3RoID0gWmxpYi5SYXdEZWZsYXRlLkx6NzdNaW5MZW5ndGg7XG5cbiAgICAvLyDliY3lm57jgb7jgafjga7mnIDplbfkuIDoh7TjgpLmnKvlsL7jgYvjgonkuIDoh7TmpJzntKLjgZnjgotcbiAgICBpZiAobWF0Y2hNYXggPiBabGliLlJhd0RlZmxhdGUuTHo3N01pbkxlbmd0aCkge1xuICAgICAgZm9yIChqID0gbWF0Y2hNYXg7IGogPiBabGliLlJhd0RlZmxhdGUuTHo3N01pbkxlbmd0aDsgai0tKSB7XG4gICAgICAgIGlmIChkYXRhW21hdGNoICsgaiAtIDFdICE9PSBkYXRhW3Bvc2l0aW9uICsgaiAtIDFdKSB7XG4gICAgICAgICAgY29udGludWUgcGVybWF0Y2g7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG1hdGNoTGVuZ3RoID0gbWF0Y2hNYXg7XG4gICAgfVxuXG4gICAgLy8g5pyA6ZW35LiA6Ie05o6i57SiXG4gICAgd2hpbGUgKG1hdGNoTGVuZ3RoIDwgWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXhMZW5ndGggJiZcbiAgICAgICAgICAgcG9zaXRpb24gKyBtYXRjaExlbmd0aCA8IGRsICYmXG4gICAgICAgICAgIGRhdGFbbWF0Y2ggKyBtYXRjaExlbmd0aF0gPT09IGRhdGFbcG9zaXRpb24gKyBtYXRjaExlbmd0aF0pIHtcbiAgICAgICsrbWF0Y2hMZW5ndGg7XG4gICAgfVxuXG4gICAgLy8g44Oe44OD44OB6ZW344GM5ZCM44GY5aC05ZCI44Gv5b6M5pa544KS5YSq5YWIXG4gICAgaWYgKG1hdGNoTGVuZ3RoID4gbWF0Y2hNYXgpIHtcbiAgICAgIGN1cnJlbnRNYXRjaCA9IG1hdGNoO1xuICAgICAgbWF0Y2hNYXggPSBtYXRjaExlbmd0aDtcbiAgICB9XG5cbiAgICAvLyDmnIDplbfjgYznorrlrprjgZfjgZ/jgonlvozjga7lh6bnkIbjga/nnIHnlaVcbiAgICBpZiAobWF0Y2hMZW5ndGggPT09IFpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF4TGVuZ3RoKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2gobWF0Y2hNYXgsIHBvc2l0aW9uIC0gY3VycmVudE1hdGNoKTtcbn07XG5cbi8qKlxuICogVHJlZS1UcmFuc21pdCBTeW1ib2xzIOOBrueul+WHulxuICogcmVmZXJlbmNlOiBQdVRUWSBEZWZsYXRlIGltcGxlbWVudGF0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0gaGxpdCBITElULlxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBsaXRsZW5MZW5ndGhzIOODquODhuODqeODq+OBqOmVt+OBleespuWPt+OBruespuWPt+mVt+mFjeWIly5cbiAqIEBwYXJhbSB7bnVtYmVyfSBoZGlzdCBIRElTVC5cbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gZGlzdExlbmd0aHMg6Led6Zui56ym5Y+344Gu56ym5Y+36ZW36YWN5YiXLlxuICogQHJldHVybiB7e1xuICogICBjb2RlczogIShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSksXG4gKiAgIGZyZXFzOiAhKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KVxuICogfX0gVHJlZS1UcmFuc21pdCBTeW1ib2xzLlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmdldFRyZWVTeW1ib2xzXyA9XG5mdW5jdGlvbihobGl0LCBsaXRsZW5MZW5ndGhzLCBoZGlzdCwgZGlzdExlbmd0aHMpIHtcbiAgdmFyIHNyYyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50MzJBcnJheSA6IEFycmF5KShobGl0ICsgaGRpc3QpLFxuICAgICAgaSwgaiwgcnVuTGVuZ3RoLCBsLFxuICAgICAgcmVzdWx0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQzMkFycmF5IDogQXJyYXkpKDI4NiArIDMwKSxcbiAgICAgIG5SZXN1bHQsXG4gICAgICBycHQsXG4gICAgICBmcmVxcyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKDE5KTtcblxuICBqID0gMDtcbiAgZm9yIChpID0gMDsgaSA8IGhsaXQ7IGkrKykge1xuICAgIHNyY1tqKytdID0gbGl0bGVuTGVuZ3Roc1tpXTtcbiAgfVxuICBmb3IgKGkgPSAwOyBpIDwgaGRpc3Q7IGkrKykge1xuICAgIHNyY1tqKytdID0gZGlzdExlbmd0aHNbaV07XG4gIH1cblxuICAvLyDliJ3mnJ/ljJZcbiAgaWYgKCFVU0VfVFlQRURBUlJBWSkge1xuICAgIGZvciAoaSA9IDAsIGwgPSBmcmVxcy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgIGZyZXFzW2ldID0gMDtcbiAgICB9XG4gIH1cblxuICAvLyDnrKblj7fljJZcbiAgblJlc3VsdCA9IDA7XG4gIGZvciAoaSA9IDAsIGwgPSBzcmMubGVuZ3RoOyBpIDwgbDsgaSArPSBqKSB7XG4gICAgLy8gUnVuIExlbmd0aCBFbmNvZGluZ1xuICAgIGZvciAoaiA9IDE7IGkgKyBqIDwgbCAmJiBzcmNbaSArIGpdID09PSBzcmNbaV07ICsraikge31cblxuICAgIHJ1bkxlbmd0aCA9IGo7XG5cbiAgICBpZiAoc3JjW2ldID09PSAwKSB7XG4gICAgICAvLyAwIOOBrue5sOOCiui/lOOBl+OBjCAzIOWbnuacqua6gOOBquOCieOBsOOBneOBruOBvuOBvlxuICAgICAgaWYgKHJ1bkxlbmd0aCA8IDMpIHtcbiAgICAgICAgd2hpbGUgKHJ1bkxlbmd0aC0tID4gMCkge1xuICAgICAgICAgIHJlc3VsdFtuUmVzdWx0KytdID0gMDtcbiAgICAgICAgICBmcmVxc1swXSsrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aGlsZSAocnVuTGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIOe5sOOCiui/lOOBl+OBr+acgOWkpyAxMzgg44G+44Gn44Gq44Gu44Gn5YiH44KK6Kmw44KB44KLXG4gICAgICAgICAgcnB0ID0gKHJ1bkxlbmd0aCA8IDEzOCA/IHJ1bkxlbmd0aCA6IDEzOCk7XG5cbiAgICAgICAgICBpZiAocnB0ID4gcnVuTGVuZ3RoIC0gMyAmJiBycHQgPCBydW5MZW5ndGgpIHtcbiAgICAgICAgICAgIHJwdCA9IHJ1bkxlbmd0aCAtIDM7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gMy0xMCDlm54gLT4gMTdcbiAgICAgICAgICBpZiAocnB0IDw9IDEwKSB7XG4gICAgICAgICAgICByZXN1bHRbblJlc3VsdCsrXSA9IDE3O1xuICAgICAgICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBycHQgLSAzO1xuICAgICAgICAgICAgZnJlcXNbMTddKys7XG4gICAgICAgICAgLy8gMTEtMTM4IOWbniAtPiAxOFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRbblJlc3VsdCsrXSA9IDE4O1xuICAgICAgICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBycHQgLSAxMTtcbiAgICAgICAgICAgIGZyZXFzWzE4XSsrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJ1bkxlbmd0aCAtPSBycHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBzcmNbaV07XG4gICAgICBmcmVxc1tzcmNbaV1dKys7XG4gICAgICBydW5MZW5ndGgtLTtcblxuICAgICAgLy8g57mw44KK6L+U44GX5Zue5pWw44GMM+Wbnuacqua6gOOBquOCieOBsOODqeODs+ODrOODs+OCsOOCueespuWPt+OBr+imgeOCieOBquOBhFxuICAgICAgaWYgKHJ1bkxlbmd0aCA8IDMpIHtcbiAgICAgICAgd2hpbGUgKHJ1bkxlbmd0aC0tID4gMCkge1xuICAgICAgICAgIHJlc3VsdFtuUmVzdWx0KytdID0gc3JjW2ldO1xuICAgICAgICAgIGZyZXFzW3NyY1tpXV0rKztcbiAgICAgICAgfVxuICAgICAgLy8gMyDlm57ku6XkuIrjgarjgonjgbDjg6njg7Pjg6zjg7PjgrDjgrnnrKblj7fljJZcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChydW5MZW5ndGggPiAwKSB7XG4gICAgICAgICAgLy8gcnVuTGVuZ3Ro44KSIDMtNiDjgafliIblibJcbiAgICAgICAgICBycHQgPSAocnVuTGVuZ3RoIDwgNiA/IHJ1bkxlbmd0aCA6IDYpO1xuXG4gICAgICAgICAgaWYgKHJwdCA+IHJ1bkxlbmd0aCAtIDMgJiYgcnB0IDwgcnVuTGVuZ3RoKSB7XG4gICAgICAgICAgICBycHQgPSBydW5MZW5ndGggLSAzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdFtuUmVzdWx0KytdID0gMTY7XG4gICAgICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBycHQgLSAzO1xuICAgICAgICAgIGZyZXFzWzE2XSsrO1xuXG4gICAgICAgICAgcnVuTGVuZ3RoIC09IHJwdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29kZXM6XG4gICAgICBVU0VfVFlQRURBUlJBWSA/IHJlc3VsdC5zdWJhcnJheSgwLCBuUmVzdWx0KSA6IHJlc3VsdC5zbGljZSgwLCBuUmVzdWx0KSxcbiAgICBmcmVxczogZnJlcXNcbiAgfTtcbn07XG5cbi8qKlxuICog44OP44OV44Oe44Oz56ym5Y+344Gu6ZW344GV44KS5Y+W5b6X44GZ44KLXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSBmcmVxcyDlh7rnj77jgqvjgqbjg7Pjg4guXG4gKiBAcGFyYW0ge251bWJlcn0gbGltaXQg56ym5Y+36ZW344Gu5Yi26ZmQLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0g56ym5Y+36ZW36YWN5YiXLlxuICogQHByaXZhdGVcbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5nZXRMZW5ndGhzXyA9IGZ1bmN0aW9uKGZyZXFzLCBsaW1pdCkge1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG5TeW1ib2xzID0gZnJlcXMubGVuZ3RoO1xuICAvKiogQHR5cGUge1psaWIuSGVhcH0gKi9cbiAgdmFyIGhlYXAgPSBuZXcgWmxpYi5IZWFwKDIgKiBabGliLlJhd0RlZmxhdGUuSFVGTUFYKTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgbGVuZ3RoID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoblN5bWJvbHMpO1xuICAvKiogQHR5cGUge0FycmF5fSAqL1xuICB2YXIgbm9kZXM7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIHZhbHVlcztcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgY29kZUxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlsO1xuXG4gIC8vIOmFjeWIl+OBruWIneacn+WMllxuICBpZiAoIVVTRV9UWVBFREFSUkFZKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG5TeW1ib2xzOyBpKyspIHtcbiAgICAgIGxlbmd0aFtpXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgLy8g44OS44O844OX44Gu5qeL56+JXG4gIGZvciAoaSA9IDA7IGkgPCBuU3ltYm9sczsgKytpKSB7XG4gICAgaWYgKGZyZXFzW2ldID4gMCkge1xuICAgICAgaGVhcC5wdXNoKGksIGZyZXFzW2ldKTtcbiAgICB9XG4gIH1cbiAgbm9kZXMgPSBuZXcgQXJyYXkoaGVhcC5sZW5ndGggLyAyKTtcbiAgdmFsdWVzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQzMkFycmF5IDogQXJyYXkpKGhlYXAubGVuZ3RoIC8gMik7XG5cbiAgLy8g6Z2eIDAg44Gu6KaB57Sg44GM5LiA44Gk44Gg44GR44Gg44Gj44Gf5aC05ZCI44Gv44CB44Gd44Gu44K344Oz44Oc44Or44Gr56ym5Y+36ZW3IDEg44KS5Ymy44KK5b2T44Gm44Gm57WC5LqGXG4gIGlmIChub2Rlcy5sZW5ndGggPT09IDEpIHtcbiAgICBsZW5ndGhbaGVhcC5wb3AoKS5pbmRleF0gPSAxO1xuICAgIHJldHVybiBsZW5ndGg7XG4gIH1cblxuICAvLyBSZXZlcnNlIFBhY2thZ2UgTWVyZ2UgQWxnb3JpdGhtIOOBq+OCiOOCiyBDYW5vbmljYWwgSHVmZm1hbiBDb2RlIOOBruespuWPt+mVt+axuuWumlxuICBmb3IgKGkgPSAwLCBpbCA9IGhlYXAubGVuZ3RoIC8gMjsgaSA8IGlsOyArK2kpIHtcbiAgICBub2Rlc1tpXSA9IGhlYXAucG9wKCk7XG4gICAgdmFsdWVzW2ldID0gbm9kZXNbaV0udmFsdWU7XG4gIH1cbiAgY29kZUxlbmd0aCA9IHRoaXMucmV2ZXJzZVBhY2thZ2VNZXJnZV8odmFsdWVzLCB2YWx1ZXMubGVuZ3RoLCBsaW1pdCk7XG5cbiAgZm9yIChpID0gMCwgaWwgPSBub2Rlcy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgbGVuZ3RoW25vZGVzW2ldLmluZGV4XSA9IGNvZGVMZW5ndGhbaV07XG4gIH1cblxuICByZXR1cm4gbGVuZ3RoO1xufTtcblxuLyoqXG4gKiBSZXZlcnNlIFBhY2thZ2UgTWVyZ2UgQWxnb3JpdGhtLlxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gZnJlcXMgc29ydGVkIHByb2JhYmlsaXR5LlxuICogQHBhcmFtIHtudW1iZXJ9IHN5bWJvbHMgbnVtYmVyIG9mIHN5bWJvbHMuXG4gKiBAcGFyYW0ge251bWJlcn0gbGltaXQgY29kZSBsZW5ndGggbGltaXQuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBjb2RlIGxlbmd0aHMuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUucmV2ZXJzZVBhY2thZ2VNZXJnZV8gPSBmdW5jdGlvbihmcmVxcywgc3ltYm9scywgbGltaXQpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gKi9cbiAgdmFyIG1pbmltdW1Db3N0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQxNkFycmF5IDogQXJyYXkpKGxpbWl0KTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgZmxhZyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKGxpbWl0KTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgY29kZUxlbmd0aCA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKHN5bWJvbHMpO1xuICAvKiogQHR5cGUge0FycmF5fSAqL1xuICB2YXIgdmFsdWUgPSBuZXcgQXJyYXkobGltaXQpO1xuICAvKiogQHR5cGUge0FycmF5fSAqL1xuICB2YXIgdHlwZSAgPSBuZXcgQXJyYXkobGltaXQpO1xuICAvKiogQHR5cGUge0FycmF5LjxudW1iZXI+fSAqL1xuICB2YXIgY3VycmVudFBvc2l0aW9uID0gbmV3IEFycmF5KGxpbWl0KTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBleGNlc3MgPSAoMSA8PCBsaW1pdCkgLSBzeW1ib2xzO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGhhbGYgPSAoMSA8PCAobGltaXQgLSAxKSk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBqO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgd2VpZ2h0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG5leHQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBqXG4gICAqL1xuICBmdW5jdGlvbiB0YWtlUGFja2FnZShqKSB7XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgdmFyIHggPSB0eXBlW2pdW2N1cnJlbnRQb3NpdGlvbltqXV07XG5cbiAgICBpZiAoeCA9PT0gc3ltYm9scykge1xuICAgICAgdGFrZVBhY2thZ2UoaisxKTtcbiAgICAgIHRha2VQYWNrYWdlKGorMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC0tY29kZUxlbmd0aFt4XTtcbiAgICB9XG5cbiAgICArK2N1cnJlbnRQb3NpdGlvbltqXTtcbiAgfVxuXG4gIG1pbmltdW1Db3N0W2xpbWl0LTFdID0gc3ltYm9scztcblxuICBmb3IgKGogPSAwOyBqIDwgbGltaXQ7ICsraikge1xuICAgIGlmIChleGNlc3MgPCBoYWxmKSB7XG4gICAgICBmbGFnW2pdID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgZmxhZ1tqXSA9IDE7XG4gICAgICBleGNlc3MgLT0gaGFsZjtcbiAgICB9XG4gICAgZXhjZXNzIDw8PSAxO1xuICAgIG1pbmltdW1Db3N0W2xpbWl0LTItal0gPSAobWluaW11bUNvc3RbbGltaXQtMS1qXSAvIDIgfCAwKSArIHN5bWJvbHM7XG4gIH1cbiAgbWluaW11bUNvc3RbMF0gPSBmbGFnWzBdO1xuXG4gIHZhbHVlWzBdID0gbmV3IEFycmF5KG1pbmltdW1Db3N0WzBdKTtcbiAgdHlwZVswXSAgPSBuZXcgQXJyYXkobWluaW11bUNvc3RbMF0pO1xuICBmb3IgKGogPSAxOyBqIDwgbGltaXQ7ICsraikge1xuICAgIGlmIChtaW5pbXVtQ29zdFtqXSA+IDIgKiBtaW5pbXVtQ29zdFtqLTFdICsgZmxhZ1tqXSkge1xuICAgICAgbWluaW11bUNvc3Rbal0gPSAyICogbWluaW11bUNvc3Rbai0xXSArIGZsYWdbal07XG4gICAgfVxuICAgIHZhbHVlW2pdID0gbmV3IEFycmF5KG1pbmltdW1Db3N0W2pdKTtcbiAgICB0eXBlW2pdICA9IG5ldyBBcnJheShtaW5pbXVtQ29zdFtqXSk7XG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgc3ltYm9sczsgKytpKSB7XG4gICAgY29kZUxlbmd0aFtpXSA9IGxpbWl0O1xuICB9XG5cbiAgZm9yICh0ID0gMDsgdCA8IG1pbmltdW1Db3N0W2xpbWl0LTFdOyArK3QpIHtcbiAgICB2YWx1ZVtsaW1pdC0xXVt0XSA9IGZyZXFzW3RdO1xuICAgIHR5cGVbbGltaXQtMV1bdF0gID0gdDtcbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBsaW1pdDsgKytpKSB7XG4gICAgY3VycmVudFBvc2l0aW9uW2ldID0gMDtcbiAgfVxuICBpZiAoZmxhZ1tsaW1pdC0xXSA9PT0gMSkge1xuICAgIC0tY29kZUxlbmd0aFswXTtcbiAgICArK2N1cnJlbnRQb3NpdGlvbltsaW1pdC0xXTtcbiAgfVxuXG4gIGZvciAoaiA9IGxpbWl0LTI7IGogPj0gMDsgLS1qKSB7XG4gICAgaSA9IDA7XG4gICAgd2VpZ2h0ID0gMDtcbiAgICBuZXh0ID0gY3VycmVudFBvc2l0aW9uW2orMV07XG5cbiAgICBmb3IgKHQgPSAwOyB0IDwgbWluaW11bUNvc3Rbal07IHQrKykge1xuICAgICAgd2VpZ2h0ID0gdmFsdWVbaisxXVtuZXh0XSArIHZhbHVlW2orMV1bbmV4dCsxXTtcblxuICAgICAgaWYgKHdlaWdodCA+IGZyZXFzW2ldKSB7XG4gICAgICAgIHZhbHVlW2pdW3RdID0gd2VpZ2h0O1xuICAgICAgICB0eXBlW2pdW3RdID0gc3ltYm9scztcbiAgICAgICAgbmV4dCArPSAyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVbal1bdF0gPSBmcmVxc1tpXTtcbiAgICAgICAgdHlwZVtqXVt0XSA9IGk7XG4gICAgICAgICsraTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjdXJyZW50UG9zaXRpb25bal0gPSAwO1xuICAgIGlmIChmbGFnW2pdID09PSAxKSB7XG4gICAgICB0YWtlUGFja2FnZShqKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29kZUxlbmd0aDtcbn07XG5cbi8qKlxuICog56ym5Y+36ZW36YWN5YiX44GL44KJ44OP44OV44Oe44Oz56ym5Y+344KS5Y+W5b6X44GZ44KLXG4gKiByZWZlcmVuY2U6IFB1VFRZIERlZmxhdGUgaW1wbGVtZW50YXRpb25cbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gbGVuZ3RocyDnrKblj7fplbfphY3liJcuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0g44OP44OV44Oe44Oz56ym5Y+36YWN5YiXLlxuICogQHByaXZhdGVcbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5nZXRDb2Rlc0Zyb21MZW5ndGhzXyA9IGZ1bmN0aW9uKGxlbmd0aHMpIHtcbiAgdmFyIGNvZGVzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQxNkFycmF5IDogQXJyYXkpKGxlbmd0aHMubGVuZ3RoKSxcbiAgICAgIGNvdW50ID0gW10sXG4gICAgICBzdGFydENvZGUgPSBbXSxcbiAgICAgIGNvZGUgPSAwLCBpLCBpbCwgaiwgbTtcblxuICAvLyBDb3VudCB0aGUgY29kZXMgb2YgZWFjaCBsZW5ndGguXG4gIGZvciAoaSA9IDAsIGlsID0gbGVuZ3Rocy5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XG4gICAgY291bnRbbGVuZ3Roc1tpXV0gPSAoY291bnRbbGVuZ3Roc1tpXV0gfCAwKSArIDE7XG4gIH1cblxuICAvLyBEZXRlcm1pbmUgdGhlIHN0YXJ0aW5nIGNvZGUgZm9yIGVhY2ggbGVuZ3RoIGJsb2NrLlxuICBmb3IgKGkgPSAxLCBpbCA9IFpsaWIuUmF3RGVmbGF0ZS5NYXhDb2RlTGVuZ3RoOyBpIDw9IGlsOyBpKyspIHtcbiAgICBzdGFydENvZGVbaV0gPSBjb2RlO1xuICAgIGNvZGUgKz0gY291bnRbaV0gfCAwO1xuICAgIGNvZGUgPDw9IDE7XG4gIH1cblxuICAvLyBEZXRlcm1pbmUgdGhlIGNvZGUgZm9yIGVhY2ggc3ltYm9sLiBNaXJyb3JlZCwgb2YgY291cnNlLlxuICBmb3IgKGkgPSAwLCBpbCA9IGxlbmd0aHMubGVuZ3RoOyBpIDwgaWw7IGkrKykge1xuICAgIGNvZGUgPSBzdGFydENvZGVbbGVuZ3Roc1tpXV07XG4gICAgc3RhcnRDb2RlW2xlbmd0aHNbaV1dICs9IDE7XG4gICAgY29kZXNbaV0gPSAwO1xuXG4gICAgZm9yIChqID0gMCwgbSA9IGxlbmd0aHNbaV07IGogPCBtOyBqKyspIHtcbiAgICAgIGNvZGVzW2ldID0gKGNvZGVzW2ldIDw8IDEpIHwgKGNvZGUgJiAxKTtcbiAgICAgIGNvZGUgPj4+PSAxO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb2Rlcztcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBHWklQIChSRkMxOTUyKSDlrp/oo4UuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5HemlwJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5DUkMzMicpO1xuZ29vZy5yZXF1aXJlKCdabGliLlJhd0RlZmxhdGUnKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICovXG5abGliLkd6aXAgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGlucHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5pbnB1dCA9IGlucHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gaW5wdXQgYnVmZmVyIHBvaW50ZXIuICovXG4gIHRoaXMuaXAgPSAwO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuICovXG4gIHRoaXMub3V0cHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5vcCA9IDA7XG4gIC8qKiBAdHlwZSB7IU9iamVjdH0gZmxhZ3Mgb3B0aW9uIGZsYWdzLiAqL1xuICB0aGlzLmZsYWdzID0ge307XG4gIC8qKiBAdHlwZSB7IXN0cmluZ30gZmlsZW5hbWUuICovXG4gIHRoaXMuZmlsZW5hbWU7XG4gIC8qKiBAdHlwZSB7IXN0cmluZ30gY29tbWVudC4gKi9cbiAgdGhpcy5jb21tZW50O1xuICAvKiogQHR5cGUgeyFPYmplY3R9IGRlZmxhdGUgb3B0aW9ucy4gKi9cbiAgdGhpcy5kZWZsYXRlT3B0aW9ucztcblxuICAvLyBvcHRpb24gcGFyYW1ldGVyc1xuICBpZiAob3B0X3BhcmFtcykge1xuICAgIGlmIChvcHRfcGFyYW1zWydmbGFncyddKSB7XG4gICAgICB0aGlzLmZsYWdzID0gb3B0X3BhcmFtc1snZmxhZ3MnXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW1zWydmaWxlbmFtZSddID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5maWxlbmFtZSA9IG9wdF9wYXJhbXNbJ2ZpbGVuYW1lJ107XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtc1snY29tbWVudCddID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5jb21tZW50ID0gb3B0X3BhcmFtc1snY29tbWVudCddO1xuICAgIH1cbiAgICBpZiAob3B0X3BhcmFtc1snZGVmbGF0ZU9wdGlvbnMnXSkge1xuICAgICAgdGhpcy5kZWZsYXRlT3B0aW9ucyA9IG9wdF9wYXJhbXNbJ2RlZmxhdGVPcHRpb25zJ107XG4gICAgfVxuICB9XG5cbiAgaWYgKCF0aGlzLmRlZmxhdGVPcHRpb25zKSB7XG4gICAgdGhpcy5kZWZsYXRlT3B0aW9ucyA9IHt9O1xuICB9XG59O1xuXG4vKipcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKiBAY29uc3RcbiAqL1xuWmxpYi5HemlwLkRlZmF1bHRCdWZmZXJTaXplID0gMHg4MDAwO1xuXG4vKipcbiAqIGVuY29kZSBnemlwIG1lbWJlcnMuXG4gKiBAcmV0dXJuIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBnemlwIGJpbmFyeSBhcnJheS5cbiAqL1xuWmxpYi5HemlwLnByb3RvdHlwZS5jb21wcmVzcyA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gZmxhZ3MuICovXG4gIHZhciBmbGc7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtb2RpZmljYXRpb24gdGltZS4gKi9cbiAgdmFyIG10aW1lO1xuICAvKiogQHR5cGUge251bWJlcn0gQ1JDLTE2IHZhbHVlIGZvciBGSENSQyBmbGFnLiAqL1xuICB2YXIgY3JjMTY7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBDUkMtMzIgdmFsdWUgZm9yIHZlcmlmaWNhdGlvbi4gKi9cbiAgdmFyIGNyYzMyO1xuICAvKiogQHR5cGUgeyFabGliLlJhd0RlZmxhdGV9IHJhdyBkZWZsYXRlIG9iamVjdC4gKi9cbiAgdmFyIHJhd2RlZmxhdGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjaGFyYWN0ZXIgY29kZSAqL1xuICB2YXIgYztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGxpbWl0ZXIuICovXG4gIHZhciBpbDtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyLiAqL1xuICB2YXIgb3V0cHV0ID1cbiAgICBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShabGliLkd6aXAuRGVmYXVsdEJ1ZmZlclNpemUpO1xuICAvKiogQHR5cGUge251bWJlcn0gb3V0cHV0IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB2YXIgb3AgPSAwO1xuXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG4gIHZhciBmaWxlbmFtZSA9IHRoaXMuZmlsZW5hbWU7XG4gIHZhciBjb21tZW50ID0gdGhpcy5jb21tZW50O1xuXG4gIC8vIGNoZWNrIHNpZ25hdHVyZVxuICBvdXRwdXRbb3ArK10gPSAweDFmO1xuICBvdXRwdXRbb3ArK10gPSAweDhiO1xuXG4gIC8vIGNoZWNrIGNvbXByZXNzaW9uIG1ldGhvZFxuICBvdXRwdXRbb3ArK10gPSA4OyAvKiBYWFg6IHVzZSBabGliIGNvbnN0ICovXG5cbiAgLy8gZmxhZ3NcbiAgZmxnID0gMDtcbiAgaWYgKHRoaXMuZmxhZ3NbJ2ZuYW1lJ10pICAgIGZsZyB8PSBabGliLkd6aXAuRmxhZ3NNYXNrLkZOQU1FO1xuICBpZiAodGhpcy5mbGFnc1snZmNvbW1lbnQnXSkgZmxnIHw9IFpsaWIuR3ppcC5GbGFnc01hc2suRkNPTU1FTlQ7XG4gIGlmICh0aGlzLmZsYWdzWydmaGNyYyddKSAgICBmbGcgfD0gWmxpYi5HemlwLkZsYWdzTWFzay5GSENSQztcbiAgLy8gWFhYOiBGVEVYVFxuICAvLyBYWFg6IEZFWFRSQVxuICBvdXRwdXRbb3ArK10gPSBmbGc7XG5cbiAgLy8gbW9kaWZpY2F0aW9uIHRpbWVcbiAgbXRpbWUgPSAoRGF0ZS5ub3cgPyBEYXRlLm5vdygpIDogK25ldyBEYXRlKCkpIC8gMTAwMCB8IDA7XG4gIG91dHB1dFtvcCsrXSA9IG10aW1lICAgICAgICAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IG10aW1lID4+PiAgOCAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IG10aW1lID4+PiAxNiAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IG10aW1lID4+PiAyNCAmIDB4ZmY7XG5cbiAgLy8gZXh0cmEgZmxhZ3NcbiAgb3V0cHV0W29wKytdID0gMDtcblxuICAvLyBvcGVyYXRpbmcgc3lzdGVtXG4gIG91dHB1dFtvcCsrXSA9IFpsaWIuR3ppcC5PcGVyYXRpbmdTeXN0ZW0uVU5LTk9XTjtcblxuICAvLyBleHRyYVxuICAvKiBOT1AgKi9cblxuICAvLyBmbmFtZVxuICBpZiAodGhpcy5mbGFnc1snZm5hbWUnXSAhPT0gdm9pZCAwKSB7XG4gICAgZm9yIChpID0gMCwgaWwgPSBmaWxlbmFtZS5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICBjID0gZmlsZW5hbWUuY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjID4gMHhmZikgeyBvdXRwdXRbb3ArK10gPSAoYyA+Pj4gOCkgJiAweGZmOyB9XG4gICAgICBvdXRwdXRbb3ArK10gPSBjICYgMHhmZjtcbiAgICB9XG4gICAgb3V0cHV0W29wKytdID0gMDsgLy8gbnVsbCB0ZXJtaW5hdGlvblxuICB9XG5cbiAgLy8gZmNvbW1lbnRcbiAgaWYgKHRoaXMuZmxhZ3NbJ2NvbW1lbnQnXSkge1xuICAgIGZvciAoaSA9IDAsIGlsID0gY29tbWVudC5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICBjID0gY29tbWVudC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGMgPiAweGZmKSB7IG91dHB1dFtvcCsrXSA9IChjID4+PiA4KSAmIDB4ZmY7IH1cbiAgICAgIG91dHB1dFtvcCsrXSA9IGMgJiAweGZmO1xuICAgIH1cbiAgICBvdXRwdXRbb3ArK10gPSAwOyAvLyBudWxsIHRlcm1pbmF0aW9uXG4gIH1cblxuICAvLyBmaGNyY1xuICBpZiAodGhpcy5mbGFnc1snZmhjcmMnXSkge1xuICAgIGNyYzE2ID0gWmxpYi5DUkMzMi5jYWxjKG91dHB1dCwgMCwgb3ApICYgMHhmZmZmO1xuICAgIG91dHB1dFtvcCsrXSA9IChjcmMxNiAgICAgICkgJiAweGZmO1xuICAgIG91dHB1dFtvcCsrXSA9IChjcmMxNiA+Pj4gOCkgJiAweGZmO1xuICB9XG5cbiAgLy8gYWRkIGNvbXByZXNzIG9wdGlvblxuICB0aGlzLmRlZmxhdGVPcHRpb25zWydvdXRwdXRCdWZmZXInXSA9IG91dHB1dDtcbiAgdGhpcy5kZWZsYXRlT3B0aW9uc1snb3V0cHV0SW5kZXgnXSA9IG9wO1xuXG4gIC8vIGNvbXByZXNzXG4gIHJhd2RlZmxhdGUgPSBuZXcgWmxpYi5SYXdEZWZsYXRlKGlucHV0LCB0aGlzLmRlZmxhdGVPcHRpb25zKTtcbiAgb3V0cHV0ID0gcmF3ZGVmbGF0ZS5jb21wcmVzcygpO1xuICBvcCA9IHJhd2RlZmxhdGUub3A7XG5cbiAgLy8gZXhwYW5kIGJ1ZmZlclxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBpZiAob3AgKyA4ID4gb3V0cHV0LmJ1ZmZlci5ieXRlTGVuZ3RoKSB7XG4gICAgICB0aGlzLm91dHB1dCA9IG5ldyBVaW50OEFycmF5KG9wICsgOCk7XG4gICAgICB0aGlzLm91dHB1dC5zZXQobmV3IFVpbnQ4QXJyYXkob3V0cHV0LmJ1ZmZlcikpO1xuICAgICAgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dCA9IG5ldyBVaW50OEFycmF5KG91dHB1dC5idWZmZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNyYzMyXG4gIGNyYzMyID0gWmxpYi5DUkMzMi5jYWxjKGlucHV0KTtcbiAgb3V0cHV0W29wKytdID0gKGNyYzMyICAgICAgICkgJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAoY3JjMzIgPj4+ICA4KSAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IChjcmMzMiA+Pj4gMTYpICYgMHhmZjtcbiAgb3V0cHV0W29wKytdID0gKGNyYzMyID4+PiAyNCkgJiAweGZmO1xuXG4gIC8vIGlucHV0IHNpemVcbiAgaWwgPSBpbnB1dC5sZW5ndGg7XG4gIG91dHB1dFtvcCsrXSA9IChpbCAgICAgICApICYgMHhmZjtcbiAgb3V0cHV0W29wKytdID0gKGlsID4+PiAgOCkgJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAoaWwgPj4+IDE2KSAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IChpbCA+Pj4gMjQpICYgMHhmZjtcblxuICB0aGlzLmlwID0gaXA7XG5cbiAgaWYgKFVTRV9UWVBFREFSUkFZICYmIG9wIDwgb3V0cHV0Lmxlbmd0aCkge1xuICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0ID0gb3V0cHV0LnN1YmFycmF5KDAsIG9wKTtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKiogQGVudW0ge251bWJlcn0gKi9cblpsaWIuR3ppcC5PcGVyYXRpbmdTeXN0ZW0gPSB7XG4gIEZBVDogMCxcbiAgQU1JR0E6IDEsXG4gIFZNUzogMixcbiAgVU5JWDogMyxcbiAgVk1fQ01TOiA0LFxuICBBVEFSSV9UT1M6IDUsXG4gIEhQRlM6IDYsXG4gIE1BQ0lOVE9TSDogNyxcbiAgWl9TWVNURU06IDgsXG4gIENQX006IDksXG4gIFRPUFNfMjA6IDEwLFxuICBOVEZTOiAxMSxcbiAgUURPUzogMTIsXG4gIEFDT1JOX1JJU0NPUzogMTMsXG4gIFVOS05PV046IDI1NVxufTtcblxuLyoqIEBlbnVtIHtudW1iZXJ9ICovXG5abGliLkd6aXAuRmxhZ3NNYXNrID0ge1xuICBGVEVYVDogMHgwMSxcbiAgRkhDUkM6IDB4MDIsXG4gIEZFWFRSQTogMHgwNCxcbiAgRk5BTUU6IDB4MDgsXG4gIEZDT01NRU5UOiAweDEwXG59O1xuXG59KTtcbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsImdvb2cucHJvdmlkZSgnWmxpYi5SYXdJbmZsYXRlJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5IdWZmbWFuJyk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIEBkZWZpbmUge251bWJlcn0gYnVmZmVyIGJsb2NrIHNpemUuICovXG52YXIgWkxJQl9SQVdfSU5GTEFURV9CVUZGRVJfU0laRSA9IDB4ODAwMDsgLy8gWyAweDgwMDAgPj0gWkxJQl9CVUZGRVJfQkxPQ0tfU0laRSBdXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxudmFyIGJ1aWxkSHVmZm1hblRhYmxlID0gWmxpYi5IdWZmbWFuLmJ1aWxkSHVmZm1hblRhYmxlO1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBpbnB1dCBpbnB1dCBidWZmZXIuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0X3BhcmFtcyBvcHRpb24gcGFyYW1ldGVyLlxuICpcbiAqIG9wdF9wYXJhbXMg44Gv5Lul5LiL44Gu44OX44Ot44OR44OG44Kj44KS5oyH5a6a44GZ44KL5LqL44GM44Gn44GN44G+44GZ44CCXG4gKiAgIC0gaW5kZXg6IGlucHV0IGJ1ZmZlciDjga4gZGVmbGF0ZSDjgrPjg7Pjg4bjg4rjga7plovlp4vkvY3nva4uXG4gKiAgIC0gYmxvY2tTaXplOiDjg5Djg4Pjg5XjgqHjga7jg5bjg63jg4Pjgq/jgrXjgqTjgrouXG4gKiAgIC0gYnVmZmVyVHlwZTogWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUg44Gu5YCk44Gr44KI44Gj44Gm44OQ44OD44OV44Kh44Gu566h55CG5pa55rOV44KS5oyH5a6a44GZ44KLLlxuICogICAtIHJlc2l6ZTog56K65L+d44GX44Gf44OQ44OD44OV44Kh44GM5a6f6Zqb44Gu5aSn44GN44GV44KI44KK5aSn44GN44GL44Gj44Gf5aC05ZCI44Gr5YiH44KK6Kmw44KB44KLLlxuICovXG5abGliLlJhd0luZmxhdGUgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGluZmxhdGVkIGJ1ZmZlciAqL1xuICB0aGlzLmJ1ZmZlcjtcbiAgLyoqIEB0eXBlIHshQXJyYXkuPChBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KT59ICovXG4gIHRoaXMuYmxvY2tzID0gW107XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBibG9jayBzaXplLiAqL1xuICB0aGlzLmJ1ZmZlclNpemUgPSBaTElCX1JBV19JTkZMQVRFX0JVRkZFUl9TSVpFO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IHRvdGFsIG91dHB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy50b3RhbHBvcyA9IDA7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gaW5wdXQgYnVmZmVyIHBvaW50ZXIuICovXG4gIHRoaXMuaXAgPSAwO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IGJpdCBzdHJlYW0gcmVhZGVyIGJ1ZmZlci4gKi9cbiAgdGhpcy5iaXRzYnVmID0gMDtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSBiaXQgc3RyZWFtIHJlYWRlciBidWZmZXIgc2l6ZS4gKi9cbiAgdGhpcy5iaXRzYnVmbGVuID0gMDtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbnB1dCBidWZmZXIuICovXG4gIHRoaXMuaW5wdXQgPSBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50OEFycmF5KGlucHV0KSA6IGlucHV0O1xuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheS48bnVtYmVyPil9IG91dHB1dCBidWZmZXIuICovXG4gIHRoaXMub3V0cHV0O1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IG91dHB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy5vcDtcbiAgLyoqIEB0eXBlIHtib29sZWFufSBpcyBmaW5hbCBibG9jayBmbGFnLiAqL1xuICB0aGlzLmJmaW5hbCA9IGZhbHNlO1xuICAvKiogQHR5cGUge1psaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlfSBidWZmZXIgbWFuYWdlbWVudC4gKi9cbiAgdGhpcy5idWZmZXJUeXBlID0gWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUuQURBUFRJVkU7XG4gIC8qKiBAdHlwZSB7Ym9vbGVhbn0gcmVzaXplIGZsYWcgZm9yIG1lbW9yeSBzaXplIG9wdGltaXphdGlvbi4gKi9cbiAgdGhpcy5yZXNpemUgPSBmYWxzZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHByZXZpb3VzIFJMRSB2YWx1ZSAqL1xuICB0aGlzLnByZXY7XG5cbiAgLy8gb3B0aW9uIHBhcmFtZXRlcnNcbiAgaWYgKG9wdF9wYXJhbXMgfHwgIShvcHRfcGFyYW1zID0ge30pKSB7XG4gICAgaWYgKG9wdF9wYXJhbXNbJ2luZGV4J10pIHtcbiAgICAgIHRoaXMuaXAgPSBvcHRfcGFyYW1zWydpbmRleCddO1xuICAgIH1cbiAgICBpZiAob3B0X3BhcmFtc1snYnVmZmVyU2l6ZSddKSB7XG4gICAgICB0aGlzLmJ1ZmZlclNpemUgPSBvcHRfcGFyYW1zWydidWZmZXJTaXplJ107XG4gICAgfVxuICAgIGlmIChvcHRfcGFyYW1zWydidWZmZXJUeXBlJ10pIHtcbiAgICAgIHRoaXMuYnVmZmVyVHlwZSA9IG9wdF9wYXJhbXNbJ2J1ZmZlclR5cGUnXTtcbiAgICB9XG4gICAgaWYgKG9wdF9wYXJhbXNbJ3Jlc2l6ZSddKSB7XG4gICAgICB0aGlzLnJlc2l6ZSA9IG9wdF9wYXJhbXNbJ3Jlc2l6ZSddO1xuICAgIH1cbiAgfVxuXG4gIC8vIGluaXRpYWxpemVcbiAgc3dpdGNoICh0aGlzLmJ1ZmZlclR5cGUpIHtcbiAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlLkJMT0NLOlxuICAgICAgdGhpcy5vcCA9IFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aDtcbiAgICAgIHRoaXMub3V0cHV0ID1cbiAgICAgICAgbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoXG4gICAgICAgICAgWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoICtcbiAgICAgICAgICB0aGlzLmJ1ZmZlclNpemUgK1xuICAgICAgICAgIFpsaWIuUmF3SW5mbGF0ZS5NYXhDb3B5TGVuZ3RoXG4gICAgICAgICk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlLkFEQVBUSVZFOlxuICAgICAgdGhpcy5vcCA9IDA7XG4gICAgICB0aGlzLm91dHB1dCA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKHRoaXMuYnVmZmVyU2l6ZSk7XG4gICAgICB0aGlzLmV4cGFuZEJ1ZmZlciA9IHRoaXMuZXhwYW5kQnVmZmVyQWRhcHRpdmU7XG4gICAgICB0aGlzLmNvbmNhdEJ1ZmZlciA9IHRoaXMuY29uY2F0QnVmZmVyRHluYW1pYztcbiAgICAgIHRoaXMuZGVjb2RlSHVmZm1hbiA9IHRoaXMuZGVjb2RlSHVmZm1hbkFkYXB0aXZlO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBpbmZsYXRlIG1vZGUnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5abGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZSA9IHtcbiAgQkxPQ0s6IDAsXG4gIEFEQVBUSVZFOiAxXG59O1xuXG4vKipcbiAqIGRlY29tcHJlc3MuXG4gKiBAcmV0dXJuIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBpbmZsYXRlZCBidWZmZXIuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb21wcmVzcyA9IGZ1bmN0aW9uKCkge1xuICB3aGlsZSAoIXRoaXMuYmZpbmFsKSB7XG4gICAgdGhpcy5wYXJzZUJsb2NrKCk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5jb25jYXRCdWZmZXIoKTtcbn07XG5cbi8qKlxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfSBtYXggYmFja3dhcmQgbGVuZ3RoIGZvciBMWjc3LlxuICovXG5abGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGggPSAzMjc2ODtcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9IG1heCBjb3B5IGxlbmd0aCBmb3IgTFo3Ny5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLk1heENvcHlMZW5ndGggPSAyNTg7XG5cbi8qKlxuICogaHVmZm1hbiBvcmRlclxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLk9yZGVyID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50MTZBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFsxNiwgMTcsIDE4LCAwLCA4LCA3LCA5LCA2LCAxMCwgNSwgMTEsIDQsIDEyLCAzLCAxMywgMiwgMTQsIDEsIDE1XSk7XG5cbi8qKlxuICogaHVmZm1hbiBsZW5ndGggY29kZSB0YWJsZS5cbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGUuTGVuZ3RoQ29kZVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50MTZBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFtcbiAgMHgwMDAzLCAweDAwMDQsIDB4MDAwNSwgMHgwMDA2LCAweDAwMDcsIDB4MDAwOCwgMHgwMDA5LCAweDAwMGEsIDB4MDAwYixcbiAgMHgwMDBkLCAweDAwMGYsIDB4MDAxMSwgMHgwMDEzLCAweDAwMTcsIDB4MDAxYiwgMHgwMDFmLCAweDAwMjMsIDB4MDAyYixcbiAgMHgwMDMzLCAweDAwM2IsIDB4MDA0MywgMHgwMDUzLCAweDAwNjMsIDB4MDA3MywgMHgwMDgzLCAweDAwYTMsIDB4MDBjMyxcbiAgMHgwMGUzLCAweDAxMDIsIDB4MDEwMiwgMHgwMTAyXG5dKTtcblxuLyoqXG4gKiBodWZmbWFuIGxlbmd0aCBleHRyYS1iaXRzIHRhYmxlLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLkxlbmd0aEV4dHJhVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQ4QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbXG4gIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDEsIDEsIDIsIDIsIDIsIDIsIDMsIDMsIDMsIDMsIDQsIDQsIDQsIDQsIDUsIDUsXG4gIDUsIDUsIDAsIDAsIDBcbl0pO1xuXG4vKipcbiAqIGh1ZmZtYW4gZGlzdCBjb2RlIHRhYmxlLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5EaXN0Q29kZVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50MTZBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFtcbiAgMHgwMDAxLCAweDAwMDIsIDB4MDAwMywgMHgwMDA0LCAweDAwMDUsIDB4MDAwNywgMHgwMDA5LCAweDAwMGQsIDB4MDAxMSxcbiAgMHgwMDE5LCAweDAwMjEsIDB4MDAzMSwgMHgwMDQxLCAweDAwNjEsIDB4MDA4MSwgMHgwMGMxLCAweDAxMDEsIDB4MDE4MSxcbiAgMHgwMjAxLCAweDAzMDEsIDB4MDQwMSwgMHgwNjAxLCAweDA4MDEsIDB4MGMwMSwgMHgxMDAxLCAweDE4MDEsIDB4MjAwMSxcbiAgMHgzMDAxLCAweDQwMDEsIDB4NjAwMVxuXSk7XG5cbi8qKlxuICogaHVmZm1hbiBkaXN0IGV4dHJhLWJpdHMgdGFibGUuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGUuRGlzdEV4dHJhVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQ4QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbXG4gIDAsIDAsIDAsIDAsIDEsIDEsIDIsIDIsIDMsIDMsIDQsIDQsIDUsIDUsIDYsIDYsIDcsIDcsIDgsIDgsIDksIDksIDEwLCAxMCwgMTEsXG4gIDExLCAxMiwgMTIsIDEzLCAxM1xuXSk7XG5cbi8qKlxuICogZml4ZWQgaHVmZm1hbiBsZW5ndGggY29kZSB0YWJsZVxuICogQGNvbnN0XG4gKiBAdHlwZSB7IUFycmF5fVxuICovXG5abGliLlJhd0luZmxhdGUuRml4ZWRMaXRlcmFsTGVuZ3RoVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIHRhYmxlO1xufSkoKGZ1bmN0aW9uKCkge1xuICB2YXIgbGVuZ3RocyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKDI4OCk7XG4gIHZhciBpLCBpbDtcblxuICBmb3IgKGkgPSAwLCBpbCA9IGxlbmd0aHMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgIGxlbmd0aHNbaV0gPVxuICAgICAgKGkgPD0gMTQzKSA/IDggOlxuICAgICAgKGkgPD0gMjU1KSA/IDkgOlxuICAgICAgKGkgPD0gMjc5KSA/IDcgOlxuICAgICAgODtcbiAgfVxuXG4gIHJldHVybiBidWlsZEh1ZmZtYW5UYWJsZShsZW5ndGhzKTtcbn0pKCkpO1xuXG4vKipcbiAqIGZpeGVkIGh1ZmZtYW4gZGlzdGFuY2UgY29kZSB0YWJsZVxuICogQGNvbnN0XG4gKiBAdHlwZSB7IUFycmF5fVxuICovXG5abGliLlJhd0luZmxhdGUuRml4ZWREaXN0YW5jZVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiB0YWJsZTtcbn0pKChmdW5jdGlvbigpIHtcbiAgdmFyIGxlbmd0aHMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgzMCk7XG4gIHZhciBpLCBpbDtcblxuICBmb3IgKGkgPSAwLCBpbCA9IGxlbmd0aHMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgIGxlbmd0aHNbaV0gPSA1O1xuICB9XG5cbiAgcmV0dXJuIGJ1aWxkSHVmZm1hblRhYmxlKGxlbmd0aHMpO1xufSkoKSk7XG5cbi8qKlxuICogcGFyc2UgZGVmbGF0ZWQgYmxvY2suXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VCbG9jayA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gaGVhZGVyICovXG4gIHZhciBoZHIgPSB0aGlzLnJlYWRCaXRzKDMpO1xuXG4gIC8vIEJGSU5BTFxuICBpZiAoaGRyICYgMHgxKSB7XG4gICAgdGhpcy5iZmluYWwgPSB0cnVlO1xuICB9XG5cbiAgLy8gQlRZUEVcbiAgaGRyID4+Pj0gMTtcbiAgc3dpdGNoIChoZHIpIHtcbiAgICAvLyB1bmNvbXByZXNzZWRcbiAgICBjYXNlIDA6XG4gICAgICB0aGlzLnBhcnNlVW5jb21wcmVzc2VkQmxvY2soKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIGZpeGVkIGh1ZmZtYW5cbiAgICBjYXNlIDE6XG4gICAgICB0aGlzLnBhcnNlRml4ZWRIdWZmbWFuQmxvY2soKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIGR5bmFtaWMgaHVmZm1hblxuICAgIGNhc2UgMjpcbiAgICAgIHRoaXMucGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrKCk7XG4gICAgICBicmVhaztcbiAgICAvLyByZXNlcnZlZCBvciBvdGhlclxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gQlRZUEU6ICcgKyBoZHIpO1xuICB9XG59O1xuXG4vKipcbiAqIHJlYWQgaW5mbGF0ZSBiaXRzXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIGJpdHMgbGVuZ3RoLlxuICogQHJldHVybiB7bnVtYmVyfSByZWFkIGJpdHMuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucmVhZEJpdHMgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgdmFyIGJpdHNidWYgPSB0aGlzLmJpdHNidWY7XG4gIHZhciBiaXRzYnVmbGVuID0gdGhpcy5iaXRzYnVmbGVuO1xuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgaXAgPSB0aGlzLmlwO1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBhbmQgb3V0cHV0IGJ5dGUuICovXG4gIHZhciBvY3RldDtcblxuICAvLyBub3QgZW5vdWdoIGJ1ZmZlclxuICB3aGlsZSAoYml0c2J1ZmxlbiA8IGxlbmd0aCkge1xuICAgIC8vIGlucHV0IGJ5dGVcbiAgICBpZiAoaXAgPj0gaW5wdXRMZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW5wdXQgYnVmZmVyIGlzIGJyb2tlbicpO1xuICAgIH1cblxuICAgIC8vIGNvbmNhdCBvY3RldFxuICAgIGJpdHNidWYgfD0gaW5wdXRbaXArK10gPDwgYml0c2J1ZmxlbjtcbiAgICBiaXRzYnVmbGVuICs9IDg7XG4gIH1cblxuICAvLyBvdXRwdXQgYnl0ZVxuICBvY3RldCA9IGJpdHNidWYgJiAvKiBNQVNLICovICgoMSA8PCBsZW5ndGgpIC0gMSk7XG4gIGJpdHNidWYgPj4+PSBsZW5ndGg7XG4gIGJpdHNidWZsZW4gLT0gbGVuZ3RoO1xuXG4gIHRoaXMuYml0c2J1ZiA9IGJpdHNidWY7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IGJpdHNidWZsZW47XG4gIHRoaXMuaXAgPSBpcDtcblxuICByZXR1cm4gb2N0ZXQ7XG59O1xuXG4vKipcbiAqIHJlYWQgaHVmZm1hbiBjb2RlIHVzaW5nIHRhYmxlXG4gKiBAcGFyYW0ge0FycmF5fSB0YWJsZSBodWZmbWFuIGNvZGUgdGFibGUuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IGh1ZmZtYW4gY29kZS5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5yZWFkQ29kZUJ5VGFibGUgPSBmdW5jdGlvbih0YWJsZSkge1xuICB2YXIgYml0c2J1ZiA9IHRoaXMuYml0c2J1ZjtcbiAgdmFyIGJpdHNidWZsZW4gPSB0aGlzLmJpdHNidWZsZW47XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBodWZmbWFuIGNvZGUgdGFibGUgKi9cbiAgdmFyIGNvZGVUYWJsZSA9IHRhYmxlWzBdO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG1heENvZGVMZW5ndGggPSB0YWJsZVsxXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvZGUgbGVuZ3RoICYgY29kZSAoMTZiaXQsIDE2Yml0KSAqL1xuICB2YXIgY29kZVdpdGhMZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjb2RlIGJpdHMgbGVuZ3RoICovXG4gIHZhciBjb2RlTGVuZ3RoO1xuXG4gIC8vIG5vdCBlbm91Z2ggYnVmZmVyXG4gIHdoaWxlIChiaXRzYnVmbGVuIDwgbWF4Q29kZUxlbmd0aCkge1xuICAgIGlmIChpcCA+PSBpbnB1dExlbmd0aCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGJpdHNidWYgfD0gaW5wdXRbaXArK10gPDwgYml0c2J1ZmxlbjtcbiAgICBiaXRzYnVmbGVuICs9IDg7XG4gIH1cblxuICAvLyByZWFkIG1heCBsZW5ndGhcbiAgY29kZVdpdGhMZW5ndGggPSBjb2RlVGFibGVbYml0c2J1ZiAmICgoMSA8PCBtYXhDb2RlTGVuZ3RoKSAtIDEpXTtcbiAgY29kZUxlbmd0aCA9IGNvZGVXaXRoTGVuZ3RoID4+PiAxNjtcblxuICB0aGlzLmJpdHNidWYgPSBiaXRzYnVmID4+IGNvZGVMZW5ndGg7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IGJpdHNidWZsZW4gLSBjb2RlTGVuZ3RoO1xuICB0aGlzLmlwID0gaXA7XG5cbiAgcmV0dXJuIGNvZGVXaXRoTGVuZ3RoICYgMHhmZmZmO1xufTtcblxuLyoqXG4gKiBwYXJzZSB1bmNvbXByZXNzZWQgYmxvY2suXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VVbmNvbXByZXNzZWRCbG9jayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgaXAgPSB0aGlzLmlwO1xuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gIHZhciBvcCA9IHRoaXMub3A7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJsb2NrIGxlbmd0aCAqL1xuICB2YXIgbGVuO1xuICAvKiogQHR5cGUge251bWJlcn0gbnVtYmVyIGZvciBjaGVjayBibG9jayBsZW5ndGggKi9cbiAgdmFyIG5sZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBvdXRwdXQgYnVmZmVyIGxlbmd0aCAqL1xuICB2YXIgb2xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjb3B5IGNvdW50ZXIgKi9cbiAgdmFyIHByZUNvcHk7XG5cbiAgLy8gc2tpcCBidWZmZXJlZCBoZWFkZXIgYml0c1xuICB0aGlzLmJpdHNidWYgPSAwO1xuICB0aGlzLmJpdHNidWZsZW4gPSAwO1xuXG4gIC8vIGxlblxuICBpZiAoaXAgKyAxID49IGlucHV0TGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHVuY29tcHJlc3NlZCBibG9jayBoZWFkZXI6IExFTicpO1xuICB9XG4gIGxlbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuXG4gIC8vIG5sZW5cbiAgaWYgKGlwICsgMSA+PSBpbnB1dExlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB1bmNvbXByZXNzZWQgYmxvY2sgaGVhZGVyOiBOTEVOJyk7XG4gIH1cbiAgbmxlbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuXG4gIC8vIGNoZWNrIGxlbiAmIG5sZW5cbiAgaWYgKGxlbiA9PT0gfm5sZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgdW5jb21wcmVzc2VkIGJsb2NrIGhlYWRlcjogbGVuZ3RoIHZlcmlmeScpO1xuICB9XG5cbiAgLy8gY2hlY2sgc2l6ZVxuICBpZiAoaXAgKyBsZW4gPiBpbnB1dC5sZW5ndGgpIHsgdGhyb3cgbmV3IEVycm9yKCdpbnB1dCBidWZmZXIgaXMgYnJva2VuJyk7IH1cblxuICAvLyBleHBhbmQgYnVmZmVyXG4gIHN3aXRjaCAodGhpcy5idWZmZXJUeXBlKSB7XG4gICAgY2FzZSBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZS5CTE9DSzpcbiAgICAgIC8vIHByZSBjb3B5XG4gICAgICB3aGlsZSAob3AgKyBsZW4gPiBvdXRwdXQubGVuZ3RoKSB7XG4gICAgICAgIHByZUNvcHkgPSBvbGVuZ3RoIC0gb3A7XG4gICAgICAgIGxlbiAtPSBwcmVDb3B5O1xuICAgICAgICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICAgICAgICBvdXRwdXQuc2V0KGlucHV0LnN1YmFycmF5KGlwLCBpcCArIHByZUNvcHkpLCBvcCk7XG4gICAgICAgICAgb3AgKz0gcHJlQ29weTtcbiAgICAgICAgICBpcCArPSBwcmVDb3B5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdoaWxlIChwcmVDb3B5LS0pIHtcbiAgICAgICAgICAgIG91dHB1dFtvcCsrXSA9IGlucHV0W2lwKytdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9wID0gb3A7XG4gICAgICAgIG91dHB1dCA9IHRoaXMuZXhwYW5kQnVmZmVyKCk7XG4gICAgICAgIG9wID0gdGhpcy5vcDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUuQURBUFRJVkU6XG4gICAgICB3aGlsZSAob3AgKyBsZW4gPiBvdXRwdXQubGVuZ3RoKSB7XG4gICAgICAgIG91dHB1dCA9IHRoaXMuZXhwYW5kQnVmZmVyKHtmaXhSYXRpbzogMn0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBpbmZsYXRlIG1vZGUnKTtcbiAgfVxuXG4gIC8vIGNvcHlcbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgb3V0cHV0LnNldChpbnB1dC5zdWJhcnJheShpcCwgaXAgKyBsZW4pLCBvcCk7XG4gICAgb3AgKz0gbGVuO1xuICAgIGlwICs9IGxlbjtcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgIG91dHB1dFtvcCsrXSA9IGlucHV0W2lwKytdO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuaXAgPSBpcDtcbiAgdGhpcy5vcCA9IG9wO1xuICB0aGlzLm91dHB1dCA9IG91dHB1dDtcbn07XG5cbi8qKlxuICogcGFyc2UgZml4ZWQgaHVmZm1hbiBibG9jay5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5wYXJzZUZpeGVkSHVmZm1hbkJsb2NrID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZGVjb2RlSHVmZm1hbihcbiAgICBabGliLlJhd0luZmxhdGUuRml4ZWRMaXRlcmFsTGVuZ3RoVGFibGUsXG4gICAgWmxpYi5SYXdJbmZsYXRlLkZpeGVkRGlzdGFuY2VUYWJsZVxuICApO1xufTtcblxuLyoqXG4gKiBwYXJzZSBkeW5hbWljIGh1ZmZtYW4gYmxvY2suXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgb2YgbGl0ZXJhbCBhbmQgbGVuZ3RoIGNvZGVzLiAqL1xuICB2YXIgaGxpdCA9IHRoaXMucmVhZEJpdHMoNSkgKyAyNTc7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgb2YgZGlzdGFuY2UgY29kZXMuICovXG4gIHZhciBoZGlzdCA9IHRoaXMucmVhZEJpdHMoNSkgKyAxO1xuICAvKiogQHR5cGUge251bWJlcn0gbnVtYmVyIG9mIGNvZGUgbGVuZ3Rocy4gKi9cbiAgdmFyIGhjbGVuID0gdGhpcy5yZWFkQml0cyg0KSArIDQ7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gY29kZSBsZW5ndGhzLiAqL1xuICB2YXIgY29kZUxlbmd0aHMgPVxuICAgIG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKFpsaWIuUmF3SW5mbGF0ZS5PcmRlci5sZW5ndGgpO1xuICAvKiogQHR5cGUgeyFBcnJheX0gY29kZSBsZW5ndGhzIHRhYmxlLiAqL1xuICB2YXIgY29kZUxlbmd0aHNUYWJsZTtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBsaXRlcmFsIGFuZCBsZW5ndGggY29kZSBsZW5ndGhzLiAqL1xuICB2YXIgbGl0bGVuTGVuZ3RocztcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBkaXN0YW5jZSBjb2RlIGxlbmd0aHMuICovXG4gIHZhciBkaXN0TGVuZ3RocztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGk7XG5cbiAgLy8gZGVjb2RlIGNvZGUgbGVuZ3Roc1xuICBmb3IgKGkgPSAwOyBpIDwgaGNsZW47ICsraSkge1xuICAgIGNvZGVMZW5ndGhzW1psaWIuUmF3SW5mbGF0ZS5PcmRlcltpXV0gPSB0aGlzLnJlYWRCaXRzKDMpO1xuICB9XG4gIGlmICghVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBmb3IgKGkgPSBoY2xlbiwgaGNsZW4gPSBjb2RlTGVuZ3Rocy5sZW5ndGg7IGkgPCBoY2xlbjsgKytpKSB7XG4gICAgICBjb2RlTGVuZ3Roc1tabGliLlJhd0luZmxhdGUuT3JkZXJbaV1dID0gMDtcbiAgICB9XG4gIH1cbiAgY29kZUxlbmd0aHNUYWJsZSA9IGJ1aWxkSHVmZm1hblRhYmxlKGNvZGVMZW5ndGhzKTtcblxuICAvKipcbiAgICogZGVjb2RlIGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW0gbnVtYmVyIG9mIGxlbmd0aHMuXG4gICAqIEBwYXJhbSB7IUFycmF5fSB0YWJsZSBjb2RlIGxlbmd0aHMgdGFibGUuXG4gICAqIEBwYXJhbSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gbGVuZ3RocyBjb2RlIGxlbmd0aHMgYnVmZmVyLlxuICAgKiBAcmV0dXJuIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBjb2RlIGxlbmd0aHMgYnVmZmVyLlxuICAgKi9cbiAgZnVuY3Rpb24gZGVjb2RlKG51bSwgdGFibGUsIGxlbmd0aHMpIHtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgY29kZTtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgcHJldiA9IHRoaXMucHJldjtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgcmVwZWF0O1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIHZhciBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IG51bTspIHtcbiAgICAgIGNvZGUgPSB0aGlzLnJlYWRDb2RlQnlUYWJsZSh0YWJsZSk7XG4gICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICByZXBlYXQgPSAzICsgdGhpcy5yZWFkQml0cygyKTtcbiAgICAgICAgICB3aGlsZSAocmVwZWF0LS0pIHsgbGVuZ3Roc1tpKytdID0gcHJldjsgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgIHJlcGVhdCA9IDMgKyB0aGlzLnJlYWRCaXRzKDMpO1xuICAgICAgICAgIHdoaWxlIChyZXBlYXQtLSkgeyBsZW5ndGhzW2krK10gPSAwOyB9XG4gICAgICAgICAgcHJldiA9IDA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgcmVwZWF0ID0gMTEgKyB0aGlzLnJlYWRCaXRzKDcpO1xuICAgICAgICAgIHdoaWxlIChyZXBlYXQtLSkgeyBsZW5ndGhzW2krK10gPSAwOyB9XG4gICAgICAgICAgcHJldiA9IDA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbGVuZ3Roc1tpKytdID0gY29kZTtcbiAgICAgICAgICBwcmV2ID0gY29kZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnByZXYgPSBwcmV2O1xuXG4gICAgcmV0dXJuIGxlbmd0aHM7XG4gIH1cblxuICAvLyBsaXRlcmFsIGFuZCBsZW5ndGggY29kZVxuICBsaXRsZW5MZW5ndGhzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoaGxpdCk7XG5cbiAgLy8gZGlzdGFuY2UgY29kZVxuICBkaXN0TGVuZ3RocyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKGhkaXN0KTtcblxuICB0aGlzLnByZXYgPSAwO1xuICB0aGlzLmRlY29kZUh1ZmZtYW4oXG4gICAgYnVpbGRIdWZmbWFuVGFibGUoZGVjb2RlLmNhbGwodGhpcywgaGxpdCwgY29kZUxlbmd0aHNUYWJsZSwgbGl0bGVuTGVuZ3RocykpLFxuICAgIGJ1aWxkSHVmZm1hblRhYmxlKGRlY29kZS5jYWxsKHRoaXMsIGhkaXN0LCBjb2RlTGVuZ3Roc1RhYmxlLCBkaXN0TGVuZ3RocykpXG4gICk7XG59O1xuXG4vKipcbiAqIGRlY29kZSBodWZmbWFuIGNvZGVcbiAqIEBwYXJhbSB7IUFycmF5fSBsaXRsZW4gbGl0ZXJhbCBhbmQgbGVuZ3RoIGNvZGUgdGFibGUuXG4gKiBAcGFyYW0geyFBcnJheX0gZGlzdCBkaXN0aW5hdGlvbiBjb2RlIHRhYmxlLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLmRlY29kZUh1ZmZtYW4gPSBmdW5jdGlvbihsaXRsZW4sIGRpc3QpIHtcbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuICB2YXIgb3AgPSB0aGlzLm9wO1xuXG4gIHRoaXMuY3VycmVudExpdGxlblRhYmxlID0gbGl0bGVuO1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBvdXRwdXQgcG9zaXRpb24gbGltaXQuICovXG4gIHZhciBvbGVuZ3RoID0gb3V0cHV0Lmxlbmd0aCAtIFpsaWIuUmF3SW5mbGF0ZS5NYXhDb3B5TGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlLiAqL1xuICB2YXIgY29kZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHRhYmxlIGluZGV4LiAqL1xuICB2YXIgdGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBodWZmbWFuIGNvZGUgZGlzdGluYXRpb24uICovXG4gIHZhciBjb2RlRGlzdDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZSBsZW5ndGguICovXG4gIHZhciBjb2RlTGVuZ3RoO1xuXG4gIHdoaWxlICgoY29kZSA9IHRoaXMucmVhZENvZGVCeVRhYmxlKGxpdGxlbikpICE9PSAyNTYpIHtcbiAgICAvLyBsaXRlcmFsXG4gICAgaWYgKGNvZGUgPCAyNTYpIHtcbiAgICAgIGlmIChvcCA+PSBvbGVuZ3RoKSB7XG4gICAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgICAgb3AgPSB0aGlzLm9wO1xuICAgICAgfVxuICAgICAgb3V0cHV0W29wKytdID0gY29kZTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGVuZ3RoIGNvZGVcbiAgICB0aSA9IGNvZGUgLSAyNTc7XG4gICAgY29kZUxlbmd0aCA9IFpsaWIuUmF3SW5mbGF0ZS5MZW5ndGhDb2RlVGFibGVbdGldO1xuICAgIGlmIChabGliLlJhd0luZmxhdGUuTGVuZ3RoRXh0cmFUYWJsZVt0aV0gPiAwKSB7XG4gICAgICBjb2RlTGVuZ3RoICs9IHRoaXMucmVhZEJpdHMoWmxpYi5SYXdJbmZsYXRlLkxlbmd0aEV4dHJhVGFibGVbdGldKTtcbiAgICB9XG5cbiAgICAvLyBkaXN0IGNvZGVcbiAgICBjb2RlID0gdGhpcy5yZWFkQ29kZUJ5VGFibGUoZGlzdCk7XG4gICAgY29kZURpc3QgPSBabGliLlJhd0luZmxhdGUuRGlzdENvZGVUYWJsZVtjb2RlXTtcbiAgICBpZiAoWmxpYi5SYXdJbmZsYXRlLkRpc3RFeHRyYVRhYmxlW2NvZGVdID4gMCkge1xuICAgICAgY29kZURpc3QgKz0gdGhpcy5yZWFkQml0cyhabGliLlJhd0luZmxhdGUuRGlzdEV4dHJhVGFibGVbY29kZV0pO1xuICAgIH1cblxuICAgIC8vIGx6NzcgZGVjb2RlXG4gICAgaWYgKG9wID49IG9sZW5ndGgpIHtcbiAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgIG91dHB1dCA9IHRoaXMuZXhwYW5kQnVmZmVyKCk7XG4gICAgICBvcCA9IHRoaXMub3A7XG4gICAgfVxuICAgIHdoaWxlIChjb2RlTGVuZ3RoLS0pIHtcbiAgICAgIG91dHB1dFtvcF0gPSBvdXRwdXRbKG9wKyspIC0gY29kZURpc3RdO1xuICAgIH1cbiAgfVxuXG4gIHdoaWxlICh0aGlzLmJpdHNidWZsZW4gPj0gOCkge1xuICAgIHRoaXMuYml0c2J1ZmxlbiAtPSA4O1xuICAgIHRoaXMuaXAtLTtcbiAgfVxuICB0aGlzLm9wID0gb3A7XG59O1xuXG4vKipcbiAqIGRlY29kZSBodWZmbWFuIGNvZGUgKGFkYXB0aXZlKVxuICogQHBhcmFtIHshQXJyYXl9IGxpdGxlbiBsaXRlcmFsIGFuZCBsZW5ndGggY29kZSB0YWJsZS5cbiAqIEBwYXJhbSB7IUFycmF5fSBkaXN0IGRpc3RpbmF0aW9uIGNvZGUgdGFibGUuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb2RlSHVmZm1hbkFkYXB0aXZlID0gZnVuY3Rpb24obGl0bGVuLCBkaXN0KSB7XG4gIHZhciBvdXRwdXQgPSB0aGlzLm91dHB1dDtcbiAgdmFyIG9wID0gdGhpcy5vcDtcblxuICB0aGlzLmN1cnJlbnRMaXRsZW5UYWJsZSA9IGxpdGxlbjtcblxuICAvKiogQHR5cGUge251bWJlcn0gb3V0cHV0IHBvc2l0aW9uIGxpbWl0LiAqL1xuICB2YXIgb2xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBodWZmbWFuIGNvZGUuICovXG4gIHZhciBjb2RlO1xuICAvKiogQHR5cGUge251bWJlcn0gdGFibGUgaW5kZXguICovXG4gIHZhciB0aTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZSBkaXN0aW5hdGlvbi4gKi9cbiAgdmFyIGNvZGVEaXN0O1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlIGxlbmd0aC4gKi9cbiAgdmFyIGNvZGVMZW5ndGg7XG5cbiAgd2hpbGUgKChjb2RlID0gdGhpcy5yZWFkQ29kZUJ5VGFibGUobGl0bGVuKSkgIT09IDI1Nikge1xuICAgIC8vIGxpdGVyYWxcbiAgICBpZiAoY29kZSA8IDI1Nikge1xuICAgICAgaWYgKG9wID49IG9sZW5ndGgpIHtcbiAgICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgICAgb2xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG4gICAgICB9XG4gICAgICBvdXRwdXRbb3ArK10gPSBjb2RlO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsZW5ndGggY29kZVxuICAgIHRpID0gY29kZSAtIDI1NztcbiAgICBjb2RlTGVuZ3RoID0gWmxpYi5SYXdJbmZsYXRlLkxlbmd0aENvZGVUYWJsZVt0aV07XG4gICAgaWYgKFpsaWIuUmF3SW5mbGF0ZS5MZW5ndGhFeHRyYVRhYmxlW3RpXSA+IDApIHtcbiAgICAgIGNvZGVMZW5ndGggKz0gdGhpcy5yZWFkQml0cyhabGliLlJhd0luZmxhdGUuTGVuZ3RoRXh0cmFUYWJsZVt0aV0pO1xuICAgIH1cblxuICAgIC8vIGRpc3QgY29kZVxuICAgIGNvZGUgPSB0aGlzLnJlYWRDb2RlQnlUYWJsZShkaXN0KTtcbiAgICBjb2RlRGlzdCA9IFpsaWIuUmF3SW5mbGF0ZS5EaXN0Q29kZVRhYmxlW2NvZGVdO1xuICAgIGlmIChabGliLlJhd0luZmxhdGUuRGlzdEV4dHJhVGFibGVbY29kZV0gPiAwKSB7XG4gICAgICBjb2RlRGlzdCArPSB0aGlzLnJlYWRCaXRzKFpsaWIuUmF3SW5mbGF0ZS5EaXN0RXh0cmFUYWJsZVtjb2RlXSk7XG4gICAgfVxuXG4gICAgLy8gbHo3NyBkZWNvZGVcbiAgICBpZiAob3AgKyBjb2RlTGVuZ3RoID4gb2xlbmd0aCkge1xuICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgIG9sZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuICAgIH1cbiAgICB3aGlsZSAoY29kZUxlbmd0aC0tKSB7XG4gICAgICBvdXRwdXRbb3BdID0gb3V0cHV0WyhvcCsrKSAtIGNvZGVEaXN0XTtcbiAgICB9XG4gIH1cblxuICB3aGlsZSAodGhpcy5iaXRzYnVmbGVuID49IDgpIHtcbiAgICB0aGlzLmJpdHNidWZsZW4gLT0gODtcbiAgICB0aGlzLmlwLS07XG4gIH1cbiAgdGhpcy5vcCA9IG9wO1xufTtcblxuLyoqXG4gKiBleHBhbmQgb3V0cHV0IGJ1ZmZlci5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5leHBhbmRCdWZmZXIgPSBmdW5jdGlvbihvcHRfcGFyYW0pIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBzdG9yZSBidWZmZXIuICovXG4gIHZhciBidWZmZXIgPVxuICAgIG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKFxuICAgICAgICB0aGlzLm9wIC0gWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoXG4gICAgKTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJhY2t3YXJkIGJhc2UgcG9pbnQgKi9cbiAgdmFyIGJhY2t3YXJkID0gdGhpcy5vcCAtIFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvcHkgaW5kZXguICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gY29weSBsaW1pdCAqL1xuICB2YXIgaWw7XG5cbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuXG4gIC8vIGNvcHkgdG8gb3V0cHV0IGJ1ZmZlclxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBidWZmZXIuc2V0KG91dHB1dC5zdWJhcnJheShabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGgsIGJ1ZmZlci5sZW5ndGgpKTtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKGkgPSAwLCBpbCA9IGJ1ZmZlci5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICBidWZmZXJbaV0gPSBvdXRwdXRbaSArIFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aF07XG4gICAgfVxuICB9XG5cbiAgdGhpcy5ibG9ja3MucHVzaChidWZmZXIpO1xuICB0aGlzLnRvdGFscG9zICs9IGJ1ZmZlci5sZW5ndGg7XG5cbiAgLy8gY29weSB0byBiYWNrd2FyZCBidWZmZXJcbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgb3V0cHV0LnNldChcbiAgICAgIG91dHB1dC5zdWJhcnJheShiYWNrd2FyZCwgYmFja3dhcmQgKyBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGgpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoOyArK2kpIHtcbiAgICAgIG91dHB1dFtpXSA9IG91dHB1dFtiYWNrd2FyZCArIGldO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMub3AgPSBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGg7XG5cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogZXhwYW5kIG91dHB1dCBidWZmZXIuIChhZGFwdGl2ZSlcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlciBwb2ludGVyLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLmV4cGFuZEJ1ZmZlckFkYXB0aXZlID0gZnVuY3Rpb24ob3B0X3BhcmFtKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gc3RvcmUgYnVmZmVyLiAqL1xuICB2YXIgYnVmZmVyO1xuICAvKiogQHR5cGUge251bWJlcn0gZXhwYW50aW9uIHJhdGlvLiAqL1xuICB2YXIgcmF0aW8gPSAodGhpcy5pbnB1dC5sZW5ndGggLyB0aGlzLmlwICsgMSkgfCAwO1xuICAvKiogQHR5cGUge251bWJlcn0gbWF4aW11bSBudW1iZXIgb2YgaHVmZm1hbiBjb2RlLiAqL1xuICB2YXIgbWF4SHVmZkNvZGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBuZXcgb3V0cHV0IGJ1ZmZlciBzaXplLiAqL1xuICB2YXIgbmV3U2l6ZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG1heCBpbmZsYXRlIHNpemUuICovXG4gIHZhciBtYXhJbmZsYXRlU2l6ZTtcblxuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG5cbiAgaWYgKG9wdF9wYXJhbSkge1xuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtLmZpeFJhdGlvID09PSAnbnVtYmVyJykge1xuICAgICAgcmF0aW8gPSBvcHRfcGFyYW0uZml4UmF0aW87XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtLmFkZFJhdGlvID09PSAnbnVtYmVyJykge1xuICAgICAgcmF0aW8gKz0gb3B0X3BhcmFtLmFkZFJhdGlvO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNhbGN1bGF0ZSBuZXcgYnVmZmVyIHNpemVcbiAgaWYgKHJhdGlvIDwgMikge1xuICAgIG1heEh1ZmZDb2RlID1cbiAgICAgIChpbnB1dC5sZW5ndGggLSB0aGlzLmlwKSAvIHRoaXMuY3VycmVudExpdGxlblRhYmxlWzJdO1xuICAgIG1heEluZmxhdGVTaXplID0gKG1heEh1ZmZDb2RlIC8gMiAqIDI1OCkgfCAwO1xuICAgIG5ld1NpemUgPSBtYXhJbmZsYXRlU2l6ZSA8IG91dHB1dC5sZW5ndGggP1xuICAgICAgb3V0cHV0Lmxlbmd0aCArIG1heEluZmxhdGVTaXplIDpcbiAgICAgIG91dHB1dC5sZW5ndGggPDwgMTtcbiAgfSBlbHNlIHtcbiAgICBuZXdTaXplID0gb3V0cHV0Lmxlbmd0aCAqIHJhdGlvO1xuICB9XG5cbiAgLy8gYnVmZmVyIGV4cGFudGlvblxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShuZXdTaXplKTtcbiAgICBidWZmZXIuc2V0KG91dHB1dCk7XG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyID0gb3V0cHV0O1xuICB9XG5cbiAgdGhpcy5vdXRwdXQgPSBidWZmZXI7XG5cbiAgcmV0dXJuIHRoaXMub3V0cHV0O1xufTtcblxuLyoqXG4gKiBjb25jYXQgb3V0cHV0IGJ1ZmZlci5cbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuY29uY2F0QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBidWZmZXIgcG9pbnRlci4gKi9cbiAgdmFyIHBvcyA9IDA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBidWZmZXIgcG9pbnRlci4gKi9cbiAgdmFyIGxpbWl0ID0gdGhpcy50b3RhbHBvcyArICh0aGlzLm9wIC0gWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoKTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYmxvY2sgYXJyYXkuICovXG4gIHZhciBvdXRwdXQgPSB0aGlzLm91dHB1dDtcbiAgLyoqIEB0eXBlIHshQXJyYXl9IGJsb2NrcyBhcnJheS4gKi9cbiAgdmFyIGJsb2NrcyA9IHRoaXMuYmxvY2tzO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBibG9jayBhcnJheS4gKi9cbiAgdmFyIGJsb2NrO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuICovXG4gIHZhciBidWZmZXIgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShsaW1pdCk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBsaW1pdGVyLiAqL1xuICB2YXIgaWw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBqO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBsaW1pdGVyLiAqL1xuICB2YXIgamw7XG5cbiAgLy8gc2luZ2xlIGJ1ZmZlclxuICBpZiAoYmxvY2tzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBVU0VfVFlQRURBUlJBWSA/XG4gICAgICB0aGlzLm91dHB1dC5zdWJhcnJheShabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGgsIHRoaXMub3ApIDpcbiAgICAgIHRoaXMub3V0cHV0LnNsaWNlKFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aCwgdGhpcy5vcCk7XG4gIH1cblxuICAvLyBjb3B5IHRvIGJ1ZmZlclxuICBmb3IgKGkgPSAwLCBpbCA9IGJsb2Nrcy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgYmxvY2sgPSBibG9ja3NbaV07XG4gICAgZm9yIChqID0gMCwgamwgPSBibG9jay5sZW5ndGg7IGogPCBqbDsgKytqKSB7XG4gICAgICBidWZmZXJbcG9zKytdID0gYmxvY2tbal07XG4gICAgfVxuICB9XG5cbiAgLy8gY3VycmVudCBidWZmZXJcbiAgZm9yIChpID0gWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoLCBpbCA9IHRoaXMub3A7IGkgPCBpbDsgKytpKSB7XG4gICAgYnVmZmVyW3BvcysrXSA9IG91dHB1dFtpXTtcbiAgfVxuXG4gIHRoaXMuYmxvY2tzID0gW107XG4gIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuXG4gIHJldHVybiB0aGlzLmJ1ZmZlcjtcbn07XG5cbi8qKlxuICogY29uY2F0IG91dHB1dCBidWZmZXIuIChkeW5hbWljKVxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5jb25jYXRCdWZmZXJEeW5hbWljID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7QXJyYXkuPG51bWJlcj58VWludDhBcnJheX0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdmFyIGJ1ZmZlcjtcbiAgdmFyIG9wID0gdGhpcy5vcDtcblxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBpZiAodGhpcy5yZXNpemUpIHtcbiAgICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG9wKTtcbiAgICAgIGJ1ZmZlci5zZXQodGhpcy5vdXRwdXQuc3ViYXJyYXkoMCwgb3ApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmZmVyID0gdGhpcy5vdXRwdXQuc3ViYXJyYXkoMCwgb3ApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAodGhpcy5vdXRwdXQubGVuZ3RoID4gb3ApIHtcbiAgICAgIHRoaXMub3V0cHV0Lmxlbmd0aCA9IG9wO1xuICAgIH1cbiAgICBidWZmZXIgPSB0aGlzLm91dHB1dDtcbiAgfVxuXG4gIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuXG4gIHJldHVybiB0aGlzLmJ1ZmZlcjtcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBHWklQIChSRkMxOTUyKSDlsZXplovjgrPjg7Pjg4bjg4rlrp/oo4UuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5HdW56aXAnKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkNSQzMyJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuR3ppcCcpO1xuZ29vZy5yZXF1aXJlKCdabGliLlJhd0luZmxhdGUnKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5HdW56aXBNZW1iZXInKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICovXG5abGliLkd1bnppcCA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5wdXQgYnVmZmVyLiAqL1xuICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy5pcCA9IDA7XG4gIC8qKiBAdHlwZSB7QXJyYXkuPFpsaWIuR3VuemlwTWVtYmVyPn0gKi9cbiAgdGhpcy5tZW1iZXIgPSBbXTtcbiAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICB0aGlzLmRlY29tcHJlc3NlZCA9IGZhbHNlO1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHtBcnJheS48WmxpYi5HdW56aXBNZW1iZXI+fVxuICovXG5abGliLkd1bnppcC5wcm90b3R5cGUuZ2V0TWVtYmVycyA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXRoaXMuZGVjb21wcmVzc2VkKSB7XG4gICAgdGhpcy5kZWNvbXByZXNzKCk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5tZW1iZXIuc2xpY2UoKTtcbn07XG5cbi8qKlxuICogaW5mbGF0ZSBnemlwIGRhdGEuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbmZsYXRlZCBidWZmZXIuXG4gKi9cblpsaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvbXByZXNzID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBsZW5ndGguICovXG4gIHZhciBpbCA9IHRoaXMuaW5wdXQubGVuZ3RoO1xuXG4gIHdoaWxlICh0aGlzLmlwIDwgaWwpIHtcbiAgICB0aGlzLmRlY29kZU1lbWJlcigpO1xuICB9XG5cbiAgdGhpcy5kZWNvbXByZXNzZWQgPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzLmNvbmNhdE1lbWJlcigpO1xufTtcblxuLyoqXG4gKiBkZWNvZGUgZ3ppcCBtZW1iZXIuXG4gKi9cblpsaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvZGVNZW1iZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtabGliLkd1bnppcE1lbWJlcn0gKi9cbiAgdmFyIG1lbWJlciA9IG5ldyBabGliLkd1bnppcE1lbWJlcigpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlzaXplO1xuICAvKiogQHR5cGUge1psaWIuUmF3SW5mbGF0ZX0gUmF3SW5mbGF0ZSBpbXBsZW1lbnRhdGlvbi4gKi9cbiAgdmFyIHJhd2luZmxhdGU7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5mbGF0ZWQgZGF0YS4gKi9cbiAgdmFyIGluZmxhdGVkO1xuICAvKiogQHR5cGUge251bWJlcn0gaW5mbGF0ZSBzaXplICovXG4gIHZhciBpbmZsZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjaGFyYWN0ZXIgY29kZSAqL1xuICB2YXIgYztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNoYXJhY3RlciBpbmRleCBpbiBzdHJpbmcuICovXG4gIHZhciBjaTtcbiAgLyoqIEB0eXBlIHtBcnJheS48c3RyaW5nPn0gY2hhcmFjdGVyIGFycmF5LiAqL1xuICB2YXIgc3RyO1xuICAvKiogQHR5cGUge251bWJlcn0gbW9kaWZpY2F0aW9uIHRpbWUuICovXG4gIHZhciBtdGltZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBjcmMzMjtcblxuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgaXAgPSB0aGlzLmlwO1xuXG4gIG1lbWJlci5pZDEgPSBpbnB1dFtpcCsrXTtcbiAgbWVtYmVyLmlkMiA9IGlucHV0W2lwKytdO1xuXG4gIC8vIGNoZWNrIHNpZ25hdHVyZVxuICBpZiAobWVtYmVyLmlkMSAhPT0gMHgxZiB8fCBtZW1iZXIuaWQyICE9PSAweDhiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpbGUgc2lnbmF0dXJlOicgKyBtZW1iZXIuaWQxICsgJywnICsgbWVtYmVyLmlkMik7XG4gIH1cblxuICAvLyBjaGVjayBjb21wcmVzc2lvbiBtZXRob2RcbiAgbWVtYmVyLmNtID0gaW5wdXRbaXArK107XG4gIHN3aXRjaCAobWVtYmVyLmNtKSB7XG4gICAgY2FzZSA4OiAvKiBYWFg6IHVzZSBabGliIGNvbnN0ICovXG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIGNvbXByZXNzaW9uIG1ldGhvZDogJyArIG1lbWJlci5jbSk7XG4gIH1cblxuICAvLyBmbGFnc1xuICBtZW1iZXIuZmxnID0gaW5wdXRbaXArK107XG5cbiAgLy8gbW9kaWZpY2F0aW9uIHRpbWVcbiAgbXRpbWUgPSAoaW5wdXRbaXArK10pICAgICAgIHxcbiAgICAgICAgICAoaW5wdXRbaXArK10gPDwgOCkgIHxcbiAgICAgICAgICAoaW5wdXRbaXArK10gPDwgMTYpIHxcbiAgICAgICAgICAoaW5wdXRbaXArK10gPDwgMjQpO1xuICBtZW1iZXIubXRpbWUgPSBuZXcgRGF0ZShtdGltZSAqIDEwMDApO1xuXG4gIC8vIGV4dHJhIGZsYWdzXG4gIG1lbWJlci54ZmwgPSBpbnB1dFtpcCsrXTtcblxuICAvLyBvcGVyYXRpbmcgc3lzdGVtXG4gIG1lbWJlci5vcyA9IGlucHV0W2lwKytdO1xuXG4gIC8vIGV4dHJhXG4gIGlmICgobWVtYmVyLmZsZyAmIFpsaWIuR3ppcC5GbGFnc01hc2suRkVYVFJBKSA+IDApIHtcbiAgICBtZW1iZXIueGxlbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuICAgIGlwID0gdGhpcy5kZWNvZGVTdWJGaWVsZChpcCwgbWVtYmVyLnhsZW4pO1xuICB9XG5cbiAgLy8gZm5hbWVcbiAgaWYgKChtZW1iZXIuZmxnICYgWmxpYi5HemlwLkZsYWdzTWFzay5GTkFNRSkgPiAwKSB7XG4gICAgZm9yKHN0ciA9IFtdLCBjaSA9IDA7IChjID0gaW5wdXRbaXArK10pID4gMDspIHtcbiAgICAgIHN0cltjaSsrXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgfVxuICAgIG1lbWJlci5uYW1lID0gc3RyLmpvaW4oJycpO1xuICB9XG5cbiAgLy8gZmNvbW1lbnRcbiAgaWYgKChtZW1iZXIuZmxnICYgWmxpYi5HemlwLkZsYWdzTWFzay5GQ09NTUVOVCkgPiAwKSB7XG4gICAgZm9yKHN0ciA9IFtdLCBjaSA9IDA7IChjID0gaW5wdXRbaXArK10pID4gMDspIHtcbiAgICAgIHN0cltjaSsrXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgfVxuICAgIG1lbWJlci5jb21tZW50ID0gc3RyLmpvaW4oJycpO1xuICB9XG5cbiAgLy8gZmhjcmNcbiAgaWYgKChtZW1iZXIuZmxnICYgWmxpYi5HemlwLkZsYWdzTWFzay5GSENSQykgPiAwKSB7XG4gICAgbWVtYmVyLmNyYzE2ID0gWmxpYi5DUkMzMi5jYWxjKGlucHV0LCAwLCBpcCkgJiAweGZmZmY7XG4gICAgaWYgKG1lbWJlci5jcmMxNiAhPT0gKGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGhlYWRlciBjcmMxNicpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlzaXplIOOCkuS6i+WJjeOBq+WPluW+l+OBmeOCi+OBqOWxlemWi+W+jOOBruOCteOCpOOCuuOBjOWIhuOBi+OCi+OBn+OCgeOAgVxuICAvLyBpbmZsYXRl5Yem55CG44Gu44OQ44OD44OV44Kh44K144Kk44K644GM5LqL5YmN44Gr5YiG44GL44KK44CB6auY6YCf44Gr44Gq44KLXG4gIGlzaXplID0gKGlucHV0W2lucHV0Lmxlbmd0aCAtIDRdKSAgICAgICB8IChpbnB1dFtpbnB1dC5sZW5ndGggLSAzXSA8PCA4KSB8XG4gICAgICAgICAgKGlucHV0W2lucHV0Lmxlbmd0aCAtIDJdIDw8IDE2KSB8IChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA8PCAyNCk7XG5cbiAgLy8gaXNpemUg44Gu5aal5b2T5oCn44OB44Kn44OD44KvXG4gIC8vIOODj+ODleODnuODs+espuWPt+OBp+OBr+acgOWwjyAyLWJpdCDjga7jgZ/jgoHjgIHmnIDlpKfjgacgMS80IOOBq+OBquOCi1xuICAvLyBMWjc3IOespuWPt+OBp+OBryDplbfjgZXjgajot53pm6IgMi1CeXRlIOOBp+acgOWkpyAyNTgtQnl0ZSDjgpLooajnj77jgafjgY3jgovjgZ/jgoHjgIFcbiAgLy8gMS8xMjgg44Gr44Gq44KL44Go44GZ44KLXG4gIC8vIOOBk+OBk+OBi+OCieWFpeWKm+ODkOODg+ODleOCoeOBruaui+OCiuOBjCBpc2l6ZSDjga4gNTEyIOWAjeS7peS4iuOBoOOBo+OBn+OCiVxuICAvLyDjgrXjgqTjgrrmjIflrprjga7jg5Djg4Pjg5XjgqHnorrkv53jga/ooYzjgo/jgarjgYTkuovjgajjgZnjgotcbiAgaWYgKGlucHV0Lmxlbmd0aCAtIGlwIC0gLyogQ1JDLTMyICovNCAtIC8qIElTSVpFICovNCA8IGlzaXplICogNTEyKSB7XG4gICAgaW5mbGVuID0gaXNpemU7XG4gIH1cblxuICAvLyBjb21wcmVzc2VkIGJsb2NrXG4gIHJhd2luZmxhdGUgPSBuZXcgWmxpYi5SYXdJbmZsYXRlKGlucHV0LCB7J2luZGV4JzogaXAsICdidWZmZXJTaXplJzogaW5mbGVufSk7XG4gIG1lbWJlci5kYXRhID0gaW5mbGF0ZWQgPSByYXdpbmZsYXRlLmRlY29tcHJlc3MoKTtcbiAgaXAgPSByYXdpbmZsYXRlLmlwO1xuXG4gIC8vIGNyYzMyXG4gIG1lbWJlci5jcmMzMiA9IGNyYzMyID1cbiAgICAoKGlucHV0W2lwKytdKSAgICAgICB8IChpbnB1dFtpcCsrXSA8PCA4KSB8XG4gICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpKSA+Pj4gMDtcbiAgaWYgKFpsaWIuQ1JDMzIuY2FsYyhpbmZsYXRlZCkgIT09IGNyYzMyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIENSQy0zMiBjaGVja3N1bTogMHgnICtcbiAgICAgICAgWmxpYi5DUkMzMi5jYWxjKGluZmxhdGVkKS50b1N0cmluZygxNikgKyAnIC8gMHgnICsgY3JjMzIudG9TdHJpbmcoMTYpKTtcbiAgfVxuXG4gIC8vIGlucHV0IHNpemVcbiAgbWVtYmVyLmlzaXplID0gaXNpemUgPVxuICAgICgoaW5wdXRbaXArK10pICAgICAgIHwgKGlucHV0W2lwKytdIDw8IDgpIHxcbiAgICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNCkpID4+PiAwO1xuICBpZiAoKGluZmxhdGVkLmxlbmd0aCAmIDB4ZmZmZmZmZmYpICE9PSBpc2l6ZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBpbnB1dCBzaXplOiAnICtcbiAgICAgICAgKGluZmxhdGVkLmxlbmd0aCAmIDB4ZmZmZmZmZmYpICsgJyAvICcgKyBpc2l6ZSk7XG4gIH1cblxuICB0aGlzLm1lbWJlci5wdXNoKG1lbWJlcik7XG4gIHRoaXMuaXAgPSBpcDtcbn07XG5cbi8qKlxuICog44K144OW44OV44Kj44O844Or44OJ44Gu44OH44Kz44O844OJXG4gKiBYWFg6IOePvuWcqOOBr+S9leOCguOBm+OBmuOCueOCreODg+ODl+OBmeOCi1xuICovXG5abGliLkd1bnppcC5wcm90b3R5cGUuZGVjb2RlU3ViRmllbGQgPSBmdW5jdGlvbihpcCwgbGVuZ3RoKSB7XG4gIHJldHVybiBpcCArIGxlbmd0aDtcbn07XG5cbi8qKlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX1cbiAqL1xuWmxpYi5HdW56aXAucHJvdG90eXBlLmNvbmNhdE1lbWJlciA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge0FycmF5LjxabGliLkd1bnppcE1lbWJlcj59ICovXG4gIHZhciBtZW1iZXIgPSB0aGlzLm1lbWJlcjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlsO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHAgPSAwO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHNpemUgPSAwO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBidWZmZXI7XG5cbiAgZm9yIChpID0gMCwgaWwgPSBtZW1iZXIubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgIHNpemUgKz0gbWVtYmVyW2ldLmRhdGEubGVuZ3RoO1xuICB9XG5cbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSk7XG4gICAgZm9yIChpID0gMDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGJ1ZmZlci5zZXQobWVtYmVyW2ldLmRhdGEsIHApO1xuICAgICAgcCArPSBtZW1iZXJbaV0uZGF0YS5sZW5ndGg7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGJ1ZmZlciA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBpbDsgKytpKSB7XG4gICAgICBidWZmZXJbaV0gPSBtZW1iZXJbaV0uZGF0YTtcbiAgICB9XG4gICAgYnVmZmVyID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgYnVmZmVyKTtcbiAgfVxuXG4gIHJldHVybiBidWZmZXI7XG59O1xuXG59KTtcbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsImdvb2cucHJvdmlkZSgnWmxpYi5SYXdJbmZsYXRlU3RyZWFtJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5IdWZmbWFuJyk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIEBkZWZpbmUge251bWJlcn0gYnVmZmVyIGJsb2NrIHNpemUuICovXG52YXIgWkxJQl9TVFJFQU1fUkFXX0lORkxBVEVfQlVGRkVSX1NJWkUgPSAweDgwMDA7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxudmFyIGJ1aWxkSHVmZm1hblRhYmxlID0gWmxpYi5IdWZmbWFuLmJ1aWxkSHVmZm1hblRhYmxlO1xuXG4vKipcbiAqIEBwYXJhbSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxuICogQHBhcmFtIHtudW1iZXJ9IGlwIGlucHV0IGJ1ZmZlciBwb2ludGVyLlxuICogQHBhcmFtIHtudW1iZXI9fSBvcHRfYnVmZmVyc2l6ZSBidWZmZXIgYmxvY2sgc2l6ZS5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0gPSBmdW5jdGlvbihpbnB1dCwgaXAsIG9wdF9idWZmZXJzaXplKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyICovXG4gIHRoaXMuYnVmZmVyO1xuICAvKiogQHR5cGUgeyFBcnJheS48KEFycmF5fFVpbnQ4QXJyYXkpPn0gKi9cbiAgdGhpcy5ibG9ja3MgPSBbXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJsb2NrIHNpemUuICovXG4gIHRoaXMuYnVmZmVyU2l6ZSA9XG4gICAgb3B0X2J1ZmZlcnNpemUgPyBvcHRfYnVmZmVyc2l6ZSA6IFpMSUJfU1RSRUFNX1JBV19JTkZMQVRFX0JVRkZFUl9TSVpFO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IHRvdGFsIG91dHB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy50b3RhbHBvcyA9IDA7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gaW5wdXQgYnVmZmVyIHBvaW50ZXIuICovXG4gIHRoaXMuaXAgPSBpcCA9PT0gdm9pZCAwID8gMCA6IGlwO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IGJpdCBzdHJlYW0gcmVhZGVyIGJ1ZmZlci4gKi9cbiAgdGhpcy5iaXRzYnVmID0gMDtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSBiaXQgc3RyZWFtIHJlYWRlciBidWZmZXIgc2l6ZS4gKi9cbiAgdGhpcy5iaXRzYnVmbGVuID0gMDtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBpbnB1dCBidWZmZXIuICovXG4gIHRoaXMuaW5wdXQgPSBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50OEFycmF5KGlucHV0KSA6IGlucHV0O1xuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheSl9IG91dHB1dCBidWZmZXIuICovXG4gIHRoaXMub3V0cHV0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkodGhpcy5idWZmZXJTaXplKTtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSBvdXRwdXQgYnVmZmVyIHBvaW50ZXIuICovXG4gIHRoaXMub3AgPSAwO1xuICAvKiogQHR5cGUge2Jvb2xlYW59IGlzIGZpbmFsIGJsb2NrIGZsYWcuICovXG4gIHRoaXMuYmZpbmFsID0gZmFsc2U7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSB1bmNvbXByZXNzZWQgYmxvY2sgbGVuZ3RoLiAqL1xuICB0aGlzLmJsb2NrTGVuZ3RoO1xuICAvKiogQHR5cGUge2Jvb2xlYW59IHJlc2l6ZSBmbGFnIGZvciBtZW1vcnkgc2l6ZSBvcHRpbWl6YXRpb24uICovXG4gIHRoaXMucmVzaXplID0gZmFsc2U7XG4gIC8qKiBAdHlwZSB7QXJyYXl9ICovXG4gIHRoaXMubGl0bGVuVGFibGU7XG4gIC8qKiBAdHlwZSB7QXJyYXl9ICovXG4gIHRoaXMuZGlzdFRhYmxlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5zcCA9IDA7IC8vIHN0cmVhbSBwb2ludGVyXG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1c30gKi9cbiAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLklOSVRJQUxJWkVEO1xuICAvKiogQHR5cGUge251bWJlcn0gcHJldmlvdXMgUkxFIHZhbHVlICovXG4gIHRoaXMucHJldjtcblxuICAvL1xuICAvLyBiYWNrdXBcbiAgLy9cbiAgLyoqIEB0eXBlIHshbnVtYmVyfSAqL1xuICB0aGlzLmlwXztcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSAqL1xuICB0aGlzLmJpdHNidWZsZW5fO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9ICovXG4gIHRoaXMuYml0c2J1Zl87XG59O1xuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUgPSB7XG4gIFVOQ09NUFJFU1NFRDogMCxcbiAgRklYRUQ6IDEsXG4gIERZTkFNSUM6IDJcbn07XG5cbi8qKlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cyA9IHtcbiAgSU5JVElBTElaRUQ6IDAsXG4gIEJMT0NLX0hFQURFUl9TVEFSVDogMSxcbiAgQkxPQ0tfSEVBREVSX0VORDogMixcbiAgQkxPQ0tfQk9EWV9TVEFSVDogMyxcbiAgQkxPQ0tfQk9EWV9FTkQ6IDQsXG4gIERFQ09ERV9CTE9DS19TVEFSVDogNSxcbiAgREVDT0RFX0JMT0NLX0VORDogNlxufTtcblxuLyoqXG4gKiBkZWNvbXByZXNzLlxuICogQHJldHVybiB7IShVaW50OEFycmF5fEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3MgPSBmdW5jdGlvbihuZXdJbnB1dCwgaXApIHtcbiAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICB2YXIgc3RvcCA9IGZhbHNlO1xuXG4gIGlmIChuZXdJbnB1dCAhPT0gdm9pZCAwKSB7XG4gICAgdGhpcy5pbnB1dCA9IG5ld0lucHV0O1xuICB9XG5cbiAgaWYgKGlwICE9PSB2b2lkIDApIHtcbiAgICB0aGlzLmlwID0gaXA7XG4gIH1cblxuICAvLyBkZWNvbXByZXNzXG4gIHdoaWxlICghc3RvcCkge1xuICAgIHN3aXRjaCAodGhpcy5zdGF0dXMpIHtcbiAgICAgIC8vIGJsb2NrIGhlYWRlclxuICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLklOSVRJQUxJWkVEOlxuICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkJMT0NLX0hFQURFUl9TVEFSVDpcbiAgICAgICAgaWYgKHRoaXMucmVhZEJsb2NrSGVhZGVyKCkgPCAwKSB7XG4gICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBibG9jayBib2R5XG4gICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfSEVBREVSX0VORDogLyogRkFMTFRIUk9VR0ggKi9cbiAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX1NUQVJUOlxuICAgICAgICBzd2l0Y2godGhpcy5jdXJyZW50QmxvY2tUeXBlKSB7XG4gICAgICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uQmxvY2tUeXBlLlVOQ09NUFJFU1NFRDpcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWRVbmNvbXByZXNzZWRCbG9ja0hlYWRlcigpIDwgMCkge1xuICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5GSVhFRDpcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcnNlRml4ZWRIdWZmbWFuQmxvY2soKSA8IDApIHtcbiAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuRFlOQU1JQzpcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcnNlRHluYW1pY0h1ZmZtYW5CbG9jaygpIDwgMCkge1xuICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gZGVjb2RlIGRhdGFcbiAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX0VORDpcbiAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5ERUNPREVfQkxPQ0tfU1RBUlQ6XG4gICAgICAgIHN3aXRjaCh0aGlzLmN1cnJlbnRCbG9ja1R5cGUpIHtcbiAgICAgICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuVU5DT01QUkVTU0VEOlxuICAgICAgICAgICAgaWYgKHRoaXMucGFyc2VVbmNvbXByZXNzZWRCbG9jaygpIDwgMCkge1xuICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5GSVhFRDogLyogRkFMTFRIUk9VR0ggKi9cbiAgICAgICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuRFlOQU1JQzpcbiAgICAgICAgICAgIGlmICh0aGlzLmRlY29kZUh1ZmZtYW4oKSA8IDApIHtcbiAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5ERUNPREVfQkxPQ0tfRU5EOlxuICAgICAgICBpZiAodGhpcy5iZmluYWwpIHtcbiAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuSU5JVElBTElaRUQ7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXMuY29uY2F0QnVmZmVyKCk7XG59O1xuXG4vKipcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn0gbWF4IGJhY2t3YXJkIGxlbmd0aCBmb3IgTFo3Ny5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLk1heEJhY2t3YXJkTGVuZ3RoID0gMzI3Njg7XG5cbi8qKlxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfSBtYXggY29weSBsZW5ndGggZm9yIExaNzcuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5NYXhDb3B5TGVuZ3RoID0gMjU4O1xuXG4vKipcbiAqIGh1ZmZtYW4gb3JkZXJcbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5PcmRlciA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDE2QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbMTYsIDE3LCAxOCwgMCwgOCwgNywgOSwgNiwgMTAsIDUsIDExLCA0LCAxMiwgMywgMTMsIDIsIDE0LCAxLCAxNV0pO1xuXG4vKipcbiAqIGh1ZmZtYW4gbGVuZ3RoIGNvZGUgdGFibGUuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkxlbmd0aENvZGVUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDE2QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbXG4gIDB4MDAwMywgMHgwMDA0LCAweDAwMDUsIDB4MDAwNiwgMHgwMDA3LCAweDAwMDgsIDB4MDAwOSwgMHgwMDBhLCAweDAwMGIsXG4gIDB4MDAwZCwgMHgwMDBmLCAweDAwMTEsIDB4MDAxMywgMHgwMDE3LCAweDAwMWIsIDB4MDAxZiwgMHgwMDIzLCAweDAwMmIsXG4gIDB4MDAzMywgMHgwMDNiLCAweDAwNDMsIDB4MDA1MywgMHgwMDYzLCAweDAwNzMsIDB4MDA4MywgMHgwMGEzLCAweDAwYzMsXG4gIDB4MDBlMywgMHgwMTAyLCAweDAxMDIsIDB4MDEwMlxuXSk7XG5cbi8qKlxuICogaHVmZm1hbiBsZW5ndGggZXh0cmEtYml0cyB0YWJsZS5cbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5MZW5ndGhFeHRyYVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50OEFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoW1xuICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxLCAxLCAxLCAyLCAyLCAyLCAyLCAzLCAzLCAzLCAzLCA0LCA0LCA0LCA0LCA1LCA1LFxuICA1LCA1LCAwLCAwLCAwXG5dKTtcblxuLyoqXG4gKiBodWZmbWFuIGRpc3QgY29kZSB0YWJsZS5cbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0uRGlzdENvZGVUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDE2QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbXG4gIDB4MDAwMSwgMHgwMDAyLCAweDAwMDMsIDB4MDAwNCwgMHgwMDA1LCAweDAwMDcsIDB4MDAwOSwgMHgwMDBkLCAweDAwMTEsXG4gIDB4MDAxOSwgMHgwMDIxLCAweDAwMzEsIDB4MDA0MSwgMHgwMDYxLCAweDAwODEsIDB4MDBjMSwgMHgwMTAxLCAweDAxODEsXG4gIDB4MDIwMSwgMHgwMzAxLCAweDA0MDEsIDB4MDYwMSwgMHgwODAxLCAweDBjMDEsIDB4MTAwMSwgMHgxODAxLCAweDIwMDEsXG4gIDB4MzAwMSwgMHg0MDAxLCAweDYwMDFcbl0pO1xuXG4vKipcbiAqIGh1ZmZtYW4gZGlzdCBleHRyYS1iaXRzIHRhYmxlLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkRpc3RFeHRyYVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50OEFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoW1xuICAwLCAwLCAwLCAwLCAxLCAxLCAyLCAyLCAzLCAzLCA0LCA0LCA1LCA1LCA2LCA2LCA3LCA3LCA4LCA4LCA5LCA5LCAxMCwgMTAsIDExLFxuICAxMSwgMTIsIDEyLCAxMywgMTNcbl0pO1xuXG4vKipcbiAqIGZpeGVkIGh1ZmZtYW4gbGVuZ3RoIGNvZGUgdGFibGVcbiAqIEBjb25zdFxuICogQHR5cGUgeyFBcnJheX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkZpeGVkTGl0ZXJhbExlbmd0aFRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiB0YWJsZTtcbn0pKChmdW5jdGlvbigpIHtcbiAgdmFyIGxlbmd0aHMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgyODgpO1xuICB2YXIgaSwgaWw7XG5cbiAgZm9yIChpID0gMCwgaWwgPSBsZW5ndGhzLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICBsZW5ndGhzW2ldID1cbiAgICAgIChpIDw9IDE0MykgPyA4IDpcbiAgICAgIChpIDw9IDI1NSkgPyA5IDpcbiAgICAgIChpIDw9IDI3OSkgPyA3IDpcbiAgICAgIDg7XG4gIH1cblxuICByZXR1cm4gYnVpbGRIdWZmbWFuVGFibGUobGVuZ3Rocyk7XG59KSgpKTtcblxuLyoqXG4gKiBmaXhlZCBodWZmbWFuIGRpc3RhbmNlIGNvZGUgdGFibGVcbiAqIEBjb25zdFxuICogQHR5cGUgeyFBcnJheX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkZpeGVkRGlzdGFuY2VUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gdGFibGU7XG59KSgoZnVuY3Rpb24oKSB7XG4gIHZhciBsZW5ndGhzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoMzApO1xuICB2YXIgaSwgaWw7XG5cbiAgZm9yIChpID0gMCwgaWwgPSBsZW5ndGhzLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICBsZW5ndGhzW2ldID0gNTtcbiAgfVxuXG4gIHJldHVybiBidWlsZEh1ZmZtYW5UYWJsZShsZW5ndGhzKTtcbn0pKCkpO1xuXG4vKipcbiAqIHBhcnNlIGRlZmxhdGVkIGJsb2NrLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRCbG9ja0hlYWRlciA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gaGVhZGVyICovXG4gIHZhciBoZHI7XG5cbiAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkJMT0NLX0hFQURFUl9TVEFSVDtcblxuICB0aGlzLnNhdmVfKCk7XG4gIGlmICgoaGRyID0gdGhpcy5yZWFkQml0cygzKSkgPCAwKSB7XG4gICAgdGhpcy5yZXN0b3JlXygpO1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8vIEJGSU5BTFxuICBpZiAoaGRyICYgMHgxKSB7XG4gICAgdGhpcy5iZmluYWwgPSB0cnVlO1xuICB9XG5cbiAgLy8gQlRZUEVcbiAgaGRyID4+Pj0gMTtcbiAgc3dpdGNoIChoZHIpIHtcbiAgICBjYXNlIDA6IC8vIHVuY29tcHJlc3NlZFxuICAgICAgdGhpcy5jdXJyZW50QmxvY2tUeXBlID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5VTkNPTVBSRVNTRUQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDE6IC8vIGZpeGVkIGh1ZmZtYW5cbiAgICAgIHRoaXMuY3VycmVudEJsb2NrVHlwZSA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuRklYRUQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6IC8vIGR5bmFtaWMgaHVmZm1hblxuICAgICAgdGhpcy5jdXJyZW50QmxvY2tUeXBlID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5EWU5BTUlDO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDogLy8gcmVzZXJ2ZWQgb3Igb3RoZXJcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBCVFlQRTogJyArIGhkcik7XG4gIH1cblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfSEVBREVSX0VORDtcbn07XG5cbi8qKlxuICogcmVhZCBpbmZsYXRlIGJpdHNcbiAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggYml0cyBsZW5ndGguXG4gKiBAcmV0dXJuIHtudW1iZXJ9IHJlYWQgYml0cy5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkQml0cyA9IGZ1bmN0aW9uKGxlbmd0aCkge1xuICB2YXIgYml0c2J1ZiA9IHRoaXMuYml0c2J1ZjtcbiAgdmFyIGJpdHNidWZsZW4gPSB0aGlzLmJpdHNidWZsZW47XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IGFuZCBvdXRwdXQgYnl0ZS4gKi9cbiAgdmFyIG9jdGV0O1xuXG4gIC8vIG5vdCBlbm91Z2ggYnVmZmVyXG4gIHdoaWxlIChiaXRzYnVmbGVuIDwgbGVuZ3RoKSB7XG4gICAgLy8gaW5wdXQgYnl0ZVxuICAgIGlmIChpbnB1dC5sZW5ndGggPD0gaXApIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgb2N0ZXQgPSBpbnB1dFtpcCsrXTtcblxuICAgIC8vIGNvbmNhdCBvY3RldFxuICAgIGJpdHNidWYgfD0gb2N0ZXQgPDwgYml0c2J1ZmxlbjtcbiAgICBiaXRzYnVmbGVuICs9IDg7XG4gIH1cblxuICAvLyBvdXRwdXQgYnl0ZVxuICBvY3RldCA9IGJpdHNidWYgJiAvKiBNQVNLICovICgoMSA8PCBsZW5ndGgpIC0gMSk7XG4gIGJpdHNidWYgPj4+PSBsZW5ndGg7XG4gIGJpdHNidWZsZW4gLT0gbGVuZ3RoO1xuXG4gIHRoaXMuYml0c2J1ZiA9IGJpdHNidWY7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IGJpdHNidWZsZW47XG4gIHRoaXMuaXAgPSBpcDtcblxuICByZXR1cm4gb2N0ZXQ7XG59O1xuXG4vKipcbiAqIHJlYWQgaHVmZm1hbiBjb2RlIHVzaW5nIHRhYmxlXG4gKiBAcGFyYW0ge0FycmF5fSB0YWJsZSBodWZmbWFuIGNvZGUgdGFibGUuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IGh1ZmZtYW4gY29kZS5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkQ29kZUJ5VGFibGUgPSBmdW5jdGlvbih0YWJsZSkge1xuICB2YXIgYml0c2J1ZiA9IHRoaXMuYml0c2J1ZjtcbiAgdmFyIGJpdHNidWZsZW4gPSB0aGlzLmJpdHNidWZsZW47XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG5cbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBodWZmbWFuIGNvZGUgdGFibGUgKi9cbiAgdmFyIGNvZGVUYWJsZSA9IHRhYmxlWzBdO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG1heENvZGVMZW5ndGggPSB0YWJsZVsxXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IGJ5dGUgKi9cbiAgdmFyIG9jdGV0O1xuICAvKiogQHR5cGUge251bWJlcn0gY29kZSBsZW5ndGggJiBjb2RlICgxNmJpdCwgMTZiaXQpICovXG4gIHZhciBjb2RlV2l0aExlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvZGUgYml0cyBsZW5ndGggKi9cbiAgdmFyIGNvZGVMZW5ndGg7XG5cbiAgLy8gbm90IGVub3VnaCBidWZmZXJcbiAgd2hpbGUgKGJpdHNidWZsZW4gPCBtYXhDb2RlTGVuZ3RoKSB7XG4gICAgaWYgKGlucHV0Lmxlbmd0aCA8PSBpcCkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICBvY3RldCA9IGlucHV0W2lwKytdO1xuICAgIGJpdHNidWYgfD0gb2N0ZXQgPDwgYml0c2J1ZmxlbjtcbiAgICBiaXRzYnVmbGVuICs9IDg7XG4gIH1cblxuICAvLyByZWFkIG1heCBsZW5ndGhcbiAgY29kZVdpdGhMZW5ndGggPSBjb2RlVGFibGVbYml0c2J1ZiAmICgoMSA8PCBtYXhDb2RlTGVuZ3RoKSAtIDEpXTtcbiAgY29kZUxlbmd0aCA9IGNvZGVXaXRoTGVuZ3RoID4+PiAxNjtcblxuICB0aGlzLmJpdHNidWYgPSBiaXRzYnVmID4+IGNvZGVMZW5ndGg7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IGJpdHNidWZsZW4gLSBjb2RlTGVuZ3RoO1xuICB0aGlzLmlwID0gaXA7XG5cbiAgcmV0dXJuIGNvZGVXaXRoTGVuZ3RoICYgMHhmZmZmO1xufTtcblxuLyoqXG4gKiByZWFkIHVuY29tcHJlc3NlZCBibG9jayBoZWFkZXJcbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkVW5jb21wcmVzc2VkQmxvY2tIZWFkZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJsb2NrIGxlbmd0aCAqL1xuICB2YXIgbGVuO1xuICAvKiogQHR5cGUge251bWJlcn0gbnVtYmVyIGZvciBjaGVjayBibG9jayBsZW5ndGggKi9cbiAgdmFyIG5sZW47XG5cbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgdmFyIGlwID0gdGhpcy5pcDtcblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9TVEFSVDtcblxuICBpZiAoaXAgKyA0ID49IGlucHV0Lmxlbmd0aCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGxlbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuICBubGVuID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gY2hlY2sgbGVuICYgbmxlblxuICBpZiAobGVuID09PSB+bmxlbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB1bmNvbXByZXNzZWQgYmxvY2sgaGVhZGVyOiBsZW5ndGggdmVyaWZ5Jyk7XG4gIH1cblxuICAvLyBza2lwIGJ1ZmZlcmVkIGhlYWRlciBiaXRzXG4gIHRoaXMuYml0c2J1ZiA9IDA7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IDA7XG5cbiAgdGhpcy5pcCA9IGlwO1xuICB0aGlzLmJsb2NrTGVuZ3RoID0gbGVuO1xuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9FTkQ7XG59XG5cbi8qKlxuICogcGFyc2UgdW5jb21wcmVzc2VkIGJsb2NrLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnBhcnNlVW5jb21wcmVzc2VkQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgdmFyIGlwID0gdGhpcy5pcDtcbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuICB2YXIgb3AgPSB0aGlzLm9wO1xuICB2YXIgbGVuID0gdGhpcy5ibG9ja0xlbmd0aDtcblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuREVDT0RFX0JMT0NLX1NUQVJUO1xuXG4gIC8vIGNvcHlcbiAgLy8gWFhYOiDjgajjgorjgYLjgYjjgZrntKDnm7TjgavjgrPjg5Tjg7xcbiAgd2hpbGUgKGxlbi0tKSB7XG4gICAgaWYgKG9wID09PSBvdXRwdXQubGVuZ3RoKSB7XG4gICAgICBvdXRwdXQgPSB0aGlzLmV4cGFuZEJ1ZmZlcih7Zml4UmF0aW86IDJ9KTtcbiAgICB9XG5cbiAgICAvLyBub3QgZW5vdWdoIGlucHV0IGJ1ZmZlclxuICAgIGlmIChpcCA+PSBpbnB1dC5sZW5ndGgpIHtcbiAgICAgIHRoaXMuaXAgPSBpcDtcbiAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgIHRoaXMuYmxvY2tMZW5ndGggPSBsZW4gKyAxOyAvLyDjgrPjg5Tjg7zjgZfjgabjgarjgYTjga7jgafmiLvjgZlcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBvdXRwdXRbb3ArK10gPSBpbnB1dFtpcCsrXTtcbiAgfVxuXG4gIGlmIChsZW4gPCAwKSB7XG4gICAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkRFQ09ERV9CTE9DS19FTkQ7XG4gIH1cblxuICB0aGlzLmlwID0gaXA7XG4gIHRoaXMub3AgPSBvcDtcblxuICByZXR1cm4gMDtcbn07XG5cbi8qKlxuICogcGFyc2UgZml4ZWQgaHVmZm1hbiBibG9jay5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5wYXJzZUZpeGVkSHVmZm1hbkJsb2NrID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX1NUQVJUO1xuXG4gIHRoaXMubGl0bGVuVGFibGUgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uRml4ZWRMaXRlcmFsTGVuZ3RoVGFibGU7XG4gIHRoaXMuZGlzdFRhYmxlID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkZpeGVkRGlzdGFuY2VUYWJsZTtcblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9FTkQ7XG5cbiAgcmV0dXJuIDA7XG59O1xuXG4vKipcbiAqIOOCquODluOCuOOCp+OCr+ODiOOBruOCs+ODs+ODhuOCreOCueODiOOCkuWIpeOBruODl+ODreODkeODhuOCo+OBq+mAgOmBv+OBmeOCiy5cbiAqIEBwcml2YXRlXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuc2F2ZV8gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pcF8gPSB0aGlzLmlwO1xuICB0aGlzLmJpdHNidWZsZW5fID0gdGhpcy5iaXRzYnVmbGVuO1xuICB0aGlzLmJpdHNidWZfID0gdGhpcy5iaXRzYnVmO1xufTtcblxuLyoqXG4gKiDliKXjga7jg5fjg63jg5Hjg4bjgqPjgavpgIDpgb/jgZfjgZ/jgrPjg7Pjg4bjgq3jgrnjg4jjgpLlvqnlhYPjgZnjgosuXG4gKiBAcHJpdmF0ZVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlc3RvcmVfID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXAgPSB0aGlzLmlwXztcbiAgdGhpcy5iaXRzYnVmbGVuID0gdGhpcy5iaXRzYnVmbGVuXztcbiAgdGhpcy5iaXRzYnVmID0gdGhpcy5iaXRzYnVmXztcbn07XG5cbi8qKlxuICogcGFyc2UgZHluYW1pYyBodWZmbWFuIGJsb2NrLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnBhcnNlRHluYW1pY0h1ZmZtYW5CbG9jayA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gbnVtYmVyIG9mIGxpdGVyYWwgYW5kIGxlbmd0aCBjb2Rlcy4gKi9cbiAgdmFyIGhsaXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgb2YgZGlzdGFuY2UgY29kZXMuICovXG4gIHZhciBoZGlzdDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG51bWJlciBvZiBjb2RlIGxlbmd0aHMuICovXG4gIHZhciBoY2xlbjtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSBjb2RlIGxlbmd0aHMuICovXG4gIHZhciBjb2RlTGVuZ3RocyA9XG4gICAgbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoWmxpYi5SYXdJbmZsYXRlU3RyZWFtLk9yZGVyLmxlbmd0aCk7XG4gIC8qKiBAdHlwZSB7IUFycmF5fSBjb2RlIGxlbmd0aHMgdGFibGUuICovXG4gIHZhciBjb2RlTGVuZ3Roc1RhYmxlO1xuICAvKiogQHR5cGUgeyEoVWludDMyQXJyYXl8QXJyYXkpfSBsaXRlcmFsIGFuZCBsZW5ndGggY29kZSBsZW5ndGhzLiAqL1xuICB2YXIgbGl0bGVuTGVuZ3RocztcbiAgLyoqIEB0eXBlIHshKFVpbnQzMkFycmF5fEFycmF5KX0gZGlzdGFuY2UgY29kZSBsZW5ndGhzLiAqL1xuICB2YXIgZGlzdExlbmd0aHM7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBpID0gMDtcblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9TVEFSVDtcblxuICB0aGlzLnNhdmVfKCk7XG4gIGhsaXQgPSB0aGlzLnJlYWRCaXRzKDUpICsgMjU3O1xuICBoZGlzdCA9IHRoaXMucmVhZEJpdHMoNSkgKyAxO1xuICBoY2xlbiA9IHRoaXMucmVhZEJpdHMoNCkgKyA0O1xuICBpZiAoaGxpdCA8IDAgfHwgaGRpc3QgPCAwIHx8IGhjbGVuIDwgMCkge1xuICAgIHRoaXMucmVzdG9yZV8oKTtcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICB0cnkge1xuICAgIHBhcnNlRHluYW1pY0h1ZmZtYW5CbG9ja0ltcGwuY2FsbCh0aGlzKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgdGhpcy5yZXN0b3JlXygpO1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlRHluYW1pY0h1ZmZtYW5CbG9ja0ltcGwoKSB7XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgdmFyIGJpdHM7XG5cbiAgICAvLyBkZWNvZGUgY29kZSBsZW5ndGhzXG4gICAgZm9yIChpID0gMDsgaSA8IGhjbGVuOyArK2kpIHtcbiAgICAgIGlmICgoYml0cyA9IHRoaXMucmVhZEJpdHMoMykpIDwgMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBlbm91Z2ggaW5wdXQnKTtcbiAgICAgIH1cbiAgICAgIGNvZGVMZW5ndGhzW1psaWIuUmF3SW5mbGF0ZVN0cmVhbS5PcmRlcltpXV0gPSBiaXRzO1xuICAgIH1cbiAgICBjb2RlTGVuZ3Roc1RhYmxlID0gYnVpbGRIdWZmbWFuVGFibGUoY29kZUxlbmd0aHMpO1xuXG4gICAgLy8gZGVjb2RlIGZ1bmN0aW9uXG4gICAgZnVuY3Rpb24gZGVjb2RlKG51bSwgdGFibGUsIGxlbmd0aHMpIHtcbiAgICAgIHZhciBjb2RlO1xuICAgICAgdmFyIHByZXYgPSB0aGlzLnByZXY7XG4gICAgICB2YXIgcmVwZWF0O1xuICAgICAgdmFyIGk7XG4gICAgICB2YXIgYml0cztcblxuICAgICAgZm9yIChpID0gMDsgaSA8IG51bTspIHtcbiAgICAgICAgY29kZSA9IHRoaXMucmVhZENvZGVCeVRhYmxlKHRhYmxlKTtcbiAgICAgICAgaWYgKGNvZGUgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdub3QgZW5vdWdoIGlucHV0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIGlmICgoYml0cyA9IHRoaXMucmVhZEJpdHMoMikpIDwgMCkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBlbm91Z2ggaW5wdXQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcGVhdCA9IDMgKyBiaXRzO1xuICAgICAgICAgICAgd2hpbGUgKHJlcGVhdC0tKSB7IGxlbmd0aHNbaSsrXSA9IHByZXY7IH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICBpZiAoKGJpdHMgPSB0aGlzLnJlYWRCaXRzKDMpKSA8IDApIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdub3QgZW5vdWdoIGlucHV0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXBlYXQgPSAzICsgYml0cztcbiAgICAgICAgICAgIHdoaWxlIChyZXBlYXQtLSkgeyBsZW5ndGhzW2krK10gPSAwOyB9XG4gICAgICAgICAgICBwcmV2ID0gMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgICBpZiAoKGJpdHMgPSB0aGlzLnJlYWRCaXRzKDcpKSA8IDApIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdub3QgZW5vdWdoIGlucHV0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXBlYXQgPSAxMSArIGJpdHM7XG4gICAgICAgICAgICB3aGlsZSAocmVwZWF0LS0pIHsgbGVuZ3Roc1tpKytdID0gMDsgfVxuICAgICAgICAgICAgcHJldiA9IDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGVuZ3Roc1tpKytdID0gY29kZTtcbiAgICAgICAgICAgIHByZXYgPSBjb2RlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5wcmV2ID0gcHJldjtcblxuICAgICAgcmV0dXJuIGxlbmd0aHM7XG4gICAgfVxuXG4gICAgLy8gbGl0ZXJhbCBhbmQgbGVuZ3RoIGNvZGVcbiAgICBsaXRsZW5MZW5ndGhzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoaGxpdCk7XG5cbiAgICAvLyBkaXN0YW5jZSBjb2RlXG4gICAgZGlzdExlbmd0aHMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShoZGlzdCk7XG5cbiAgICB0aGlzLnByZXYgPSAwO1xuICAgIHRoaXMubGl0bGVuVGFibGUgPSBidWlsZEh1ZmZtYW5UYWJsZShkZWNvZGUuY2FsbCh0aGlzLCBobGl0LCBjb2RlTGVuZ3Roc1RhYmxlLCBsaXRsZW5MZW5ndGhzKSk7XG4gICAgdGhpcy5kaXN0VGFibGUgPSBidWlsZEh1ZmZtYW5UYWJsZShkZWNvZGUuY2FsbCh0aGlzLCBoZGlzdCwgY29kZUxlbmd0aHNUYWJsZSwgZGlzdExlbmd0aHMpKTtcbiAgfVxuXG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX0VORDtcblxuICByZXR1cm4gMDtcbn07XG5cbi8qKlxuICogZGVjb2RlIGh1ZmZtYW4gY29kZSAoZHluYW1pYylcbiAqIEByZXR1cm4geyhudW1iZXJ8dW5kZWZpbmVkKX0gLTEgaXMgZXJyb3IuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb2RlSHVmZm1hbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gIHZhciBvcCA9IHRoaXMub3A7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZS4gKi9cbiAgdmFyIGNvZGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSB0YWJsZSBpbmRleC4gKi9cbiAgdmFyIHRpO1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlIGRpc3RpbmF0aW9uLiAqL1xuICB2YXIgY29kZURpc3Q7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBodWZmbWFuIGNvZGUgbGVuZ3RoLiAqL1xuICB2YXIgY29kZUxlbmd0aDtcblxuICB2YXIgbGl0bGVuID0gdGhpcy5saXRsZW5UYWJsZTtcbiAgdmFyIGRpc3QgPSB0aGlzLmRpc3RUYWJsZTtcblxuICB2YXIgb2xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG4gIHZhciBiaXRzO1xuXG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5ERUNPREVfQkxPQ0tfU1RBUlQ7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICB0aGlzLnNhdmVfKCk7XG5cbiAgICBjb2RlID0gdGhpcy5yZWFkQ29kZUJ5VGFibGUobGl0bGVuKTtcbiAgICBpZiAoY29kZSA8IDApIHtcbiAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgIHRoaXMucmVzdG9yZV8oKTtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBpZiAoY29kZSA9PT0gMjU2KSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBsaXRlcmFsXG4gICAgaWYgKGNvZGUgPCAyNTYpIHtcbiAgICAgIGlmIChvcCA9PT0gb2xlbmd0aCkge1xuICAgICAgICBvdXRwdXQgPSB0aGlzLmV4cGFuZEJ1ZmZlcigpO1xuICAgICAgICBvbGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIG91dHB1dFtvcCsrXSA9IGNvZGU7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxlbmd0aCBjb2RlXG4gICAgdGkgPSBjb2RlIC0gMjU3O1xuICAgIGNvZGVMZW5ndGggPSBabGliLlJhd0luZmxhdGVTdHJlYW0uTGVuZ3RoQ29kZVRhYmxlW3RpXTtcbiAgICBpZiAoWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkxlbmd0aEV4dHJhVGFibGVbdGldID4gMCkge1xuICAgICAgYml0cyA9IHRoaXMucmVhZEJpdHMoWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkxlbmd0aEV4dHJhVGFibGVbdGldKTtcbiAgICAgIGlmIChiaXRzIDwgMCkge1xuICAgICAgICB0aGlzLm9wID0gb3A7XG4gICAgICAgIHRoaXMucmVzdG9yZV8oKTtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgY29kZUxlbmd0aCArPSBiaXRzO1xuICAgIH1cblxuICAgIC8vIGRpc3QgY29kZVxuICAgIGNvZGUgPSB0aGlzLnJlYWRDb2RlQnlUYWJsZShkaXN0KTtcbiAgICBpZiAoY29kZSA8IDApIHtcbiAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgIHRoaXMucmVzdG9yZV8oKTtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgY29kZURpc3QgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uRGlzdENvZGVUYWJsZVtjb2RlXTtcbiAgICBpZiAoWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkRpc3RFeHRyYVRhYmxlW2NvZGVdID4gMCkge1xuICAgICAgYml0cyA9IHRoaXMucmVhZEJpdHMoWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkRpc3RFeHRyYVRhYmxlW2NvZGVdKTtcbiAgICAgIGlmIChiaXRzIDwgMCkge1xuICAgICAgICB0aGlzLm9wID0gb3A7XG4gICAgICAgIHRoaXMucmVzdG9yZV8oKTtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgY29kZURpc3QgKz0gYml0cztcbiAgICB9XG5cbiAgICAvLyBsejc3IGRlY29kZVxuICAgIGlmIChvcCArIGNvZGVMZW5ndGggPj0gb2xlbmd0aCkge1xuICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgIG9sZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuICAgIH1cblxuICAgIHdoaWxlIChjb2RlTGVuZ3RoLS0pIHtcbiAgICAgIG91dHB1dFtvcF0gPSBvdXRwdXRbKG9wKyspIC0gY29kZURpc3RdO1xuICAgIH1cblxuICAgIC8vIGJyZWFrXG4gICAgaWYgKHRoaXMuaXAgPT09IHRoaXMuaW5wdXQubGVuZ3RoKSB7XG4gICAgICB0aGlzLm9wID0gb3A7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICB9XG5cbiAgd2hpbGUgKHRoaXMuYml0c2J1ZmxlbiA+PSA4KSB7XG4gICAgdGhpcy5iaXRzYnVmbGVuIC09IDg7XG4gICAgdGhpcy5pcC0tO1xuICB9XG5cbiAgdGhpcy5vcCA9IG9wO1xuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuREVDT0RFX0JMT0NLX0VORDtcbn07XG5cbi8qKlxuICogZXhwYW5kIG91dHB1dCBidWZmZXIuIChkeW5hbWljKVxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW0gb3B0aW9uIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyIHBvaW50ZXIuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyID0gZnVuY3Rpb24ob3B0X3BhcmFtKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gc3RvcmUgYnVmZmVyLiAqL1xuICB2YXIgYnVmZmVyO1xuICAvKiogQHR5cGUge251bWJlcn0gZXhwYW50aW9uIHJhdGlvLiAqL1xuICB2YXIgcmF0aW8gPSAodGhpcy5pbnB1dC5sZW5ndGggLyB0aGlzLmlwICsgMSkgfCAwO1xuICAvKiogQHR5cGUge251bWJlcn0gbWF4aW11bSBudW1iZXIgb2YgaHVmZm1hbiBjb2RlLiAqL1xuICB2YXIgbWF4SHVmZkNvZGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBuZXcgb3V0cHV0IGJ1ZmZlciBzaXplLiAqL1xuICB2YXIgbmV3U2l6ZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG1heCBpbmZsYXRlIHNpemUuICovXG4gIHZhciBtYXhJbmZsYXRlU2l6ZTtcblxuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG5cbiAgaWYgKG9wdF9wYXJhbSkge1xuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtLmZpeFJhdGlvID09PSAnbnVtYmVyJykge1xuICAgICAgcmF0aW8gPSBvcHRfcGFyYW0uZml4UmF0aW87XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtLmFkZFJhdGlvID09PSAnbnVtYmVyJykge1xuICAgICAgcmF0aW8gKz0gb3B0X3BhcmFtLmFkZFJhdGlvO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNhbGN1bGF0ZSBuZXcgYnVmZmVyIHNpemVcbiAgaWYgKHJhdGlvIDwgMikge1xuICAgIG1heEh1ZmZDb2RlID1cbiAgICAgIChpbnB1dC5sZW5ndGggLSB0aGlzLmlwKSAvIHRoaXMubGl0bGVuVGFibGVbMl07XG4gICAgbWF4SW5mbGF0ZVNpemUgPSAobWF4SHVmZkNvZGUgLyAyICogMjU4KSB8IDA7XG4gICAgbmV3U2l6ZSA9IG1heEluZmxhdGVTaXplIDwgb3V0cHV0Lmxlbmd0aCA/XG4gICAgICBvdXRwdXQubGVuZ3RoICsgbWF4SW5mbGF0ZVNpemUgOlxuICAgICAgb3V0cHV0Lmxlbmd0aCA8PCAxO1xuICB9IGVsc2Uge1xuICAgIG5ld1NpemUgPSBvdXRwdXQubGVuZ3RoICogcmF0aW87XG4gIH1cblxuICAvLyBidWZmZXIgZXhwYW50aW9uXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG5ld1NpemUpO1xuICAgIGJ1ZmZlci5zZXQob3V0cHV0KTtcbiAgfSBlbHNlIHtcbiAgICBidWZmZXIgPSBvdXRwdXQ7XG4gIH1cblxuICB0aGlzLm91dHB1dCA9IGJ1ZmZlcjtcblxuICByZXR1cm4gdGhpcy5vdXRwdXQ7XG59O1xuXG4vKipcbiAqIGNvbmNhdCBvdXRwdXQgYnVmZmVyLiAoZHluYW1pYylcbiAqIEByZXR1cm4geyEoQXJyYXl8VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuY29uY2F0QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdmFyIGJ1ZmZlcjtcblxuICB2YXIgcmVzaXplID0gdGhpcy5yZXNpemU7XG5cbiAgdmFyIG9wID0gdGhpcy5vcDtcblxuICBpZiAocmVzaXplKSB7XG4gICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShvcCk7XG4gICAgICBidWZmZXIuc2V0KHRoaXMub3V0cHV0LnN1YmFycmF5KHRoaXMuc3AsIG9wKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1ZmZlciA9IHRoaXMub3V0cHV0LnNsaWNlKHRoaXMuc3AsIG9wKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyID1cbiAgICAgIFVTRV9UWVBFREFSUkFZID8gdGhpcy5vdXRwdXQuc3ViYXJyYXkodGhpcy5zcCwgb3ApIDogdGhpcy5vdXRwdXQuc2xpY2UodGhpcy5zcCwgb3ApO1xuICB9XG5cblxuICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgdGhpcy5zcCA9IG9wO1xuXG4gIHJldHVybiB0aGlzLmJ1ZmZlcjtcbn07XG5cbi8qKlxuICogQHJldHVybiB7IShBcnJheXxVaW50OEFycmF5KX0gY3VycmVudCBvdXRwdXQgYnVmZmVyLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmdldEJ5dGVzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/XG4gICAgdGhpcy5vdXRwdXQuc3ViYXJyYXkoMCwgdGhpcy5vcCkgOiB0aGlzLm91dHB1dC5zbGljZSgwLCB0aGlzLm9wKTtcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyDpm5HlpJrjgarplqLmlbDnvqTjgpLjgb7jgajjgoHjgZ/jg6Ljgrjjg6Xjg7zjg6vlrp/oo4UuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5VdGlsJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQnl0ZSBTdHJpbmcg44GL44KJIEJ5dGUgQXJyYXkg44Gr5aSJ5o+bLlxuICogQHBhcmFtIHshc3RyaW5nfSBzdHIgYnl0ZSBzdHJpbmcuXG4gKiBAcmV0dXJuIHshQXJyYXkuPG51bWJlcj59IGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuVXRpbC5zdHJpbmdUb0J5dGVBcnJheSA9IGZ1bmN0aW9uKHN0cikge1xuICAvKiogQHR5cGUgeyFBcnJheS48KHN0cmluZ3xudW1iZXIpPn0gKi9cbiAgdmFyIHRtcCA9IHN0ci5zcGxpdCgnJyk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbDtcblxuICBmb3IgKGkgPSAwLCBpbCA9IHRtcC5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XG4gICAgdG1wW2ldID0gKHRtcFtpXS5jaGFyQ29kZUF0KDApICYgMHhmZikgPj4+IDA7XG4gIH1cblxuICByZXR1cm4gdG1wO1xufTtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEFkbGVyMzIgY2hlY2tzdW0g5a6f6KOFLlxuICovXG5nb29nLnByb3ZpZGUoJ1psaWIuQWRsZXIzMicpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuVXRpbCcpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIEFkbGVyMzIg44OP44OD44K344Ol5YCk44Gu5L2c5oiQXG4gKiBAcGFyYW0geyEoQXJyYXl8VWludDhBcnJheXxzdHJpbmcpfSBhcnJheSDnrpflh7rjgavkvb/nlKjjgZnjgosgYnl0ZSBhcnJheS5cbiAqIEByZXR1cm4ge251bWJlcn0gQWRsZXIzMiDjg4/jg4Pjgrfjg6XlgKQuXG4gKi9cblpsaWIuQWRsZXIzMiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gIGlmICh0eXBlb2YoYXJyYXkpID09PSAnc3RyaW5nJykge1xuICAgIGFycmF5ID0gWmxpYi5VdGlsLnN0cmluZ1RvQnl0ZUFycmF5KGFycmF5KTtcbiAgfVxuICByZXR1cm4gWmxpYi5BZGxlcjMyLnVwZGF0ZSgxLCBhcnJheSk7XG59O1xuXG4vKipcbiAqIEFkbGVyMzIg44OP44OD44K344Ol5YCk44Gu5pu05pawXG4gKiBAcGFyYW0ge251bWJlcn0gYWRsZXIg54++5Zyo44Gu44OP44OD44K344Ol5YCkLlxuICogQHBhcmFtIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBhcnJheSDmm7TmlrDjgavkvb/nlKjjgZnjgosgYnl0ZSBhcnJheS5cbiAqIEByZXR1cm4ge251bWJlcn0gQWRsZXIzMiDjg4/jg4Pjgrfjg6XlgKQuXG4gKi9cblpsaWIuQWRsZXIzMi51cGRhdGUgPSBmdW5jdGlvbihhZGxlciwgYXJyYXkpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBzMSA9IGFkbGVyICYgMHhmZmZmO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHMyID0gKGFkbGVyID4+PiAxNikgJiAweGZmZmY7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBhcnJheSBsZW5ndGggKi9cbiAgdmFyIGxlbiA9IGFycmF5Lmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgbGVuZ3RoIChkb24ndCBvdmVyZmxvdykgKi9cbiAgdmFyIHRsZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBhcnJheSBpbmRleCAqL1xuICB2YXIgaSA9IDA7XG5cbiAgd2hpbGUgKGxlbiA+IDApIHtcbiAgICB0bGVuID0gbGVuID4gWmxpYi5BZGxlcjMyLk9wdGltaXphdGlvblBhcmFtZXRlciA/XG4gICAgICBabGliLkFkbGVyMzIuT3B0aW1pemF0aW9uUGFyYW1ldGVyIDogbGVuO1xuICAgIGxlbiAtPSB0bGVuO1xuICAgIGRvIHtcbiAgICAgIHMxICs9IGFycmF5W2krK107XG4gICAgICBzMiArPSBzMTtcbiAgICB9IHdoaWxlICgtLXRsZW4pO1xuXG4gICAgczEgJT0gNjU1MjE7XG4gICAgczIgJT0gNjU1MjE7XG4gIH1cblxuICByZXR1cm4gKChzMiA8PCAxNikgfCBzMSkgPj4+IDA7XG59O1xuXG4vKipcbiAqIEFkbGVyMzIg5pyA6YGp5YyW44OR44Op44Oh44O844K/XG4gKiDnj77nirbjgafjga8gMTAyNCDnqIvluqbjgYzmnIDpgakuXG4gKiBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL2FkbGVyLTMyLXNpbXBsZS12cy1vcHRpbWl6ZWQvM1xuICogQGRlZmluZSB7bnVtYmVyfVxuICovXG5abGliLkFkbGVyMzIuT3B0aW1pemF0aW9uUGFyYW1ldGVyID0gMTAyNDtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiZ29vZy5wcm92aWRlKCdabGliLkluZmxhdGUnKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkFkbGVyMzInKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5SYXdJbmZsYXRlJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0geyEoVWludDhBcnJheXxBcnJheSl9IGlucHV0IGRlZmxhdGVkIGJ1ZmZlci5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtcyBvcHRpb24gcGFyYW1ldGVycy5cbiAqXG4gKiBvcHRfcGFyYW1zIOOBr+S7peS4i+OBruODl+ODreODkeODhuOCo+OCkuaMh+WumuOBmeOCi+S6i+OBjOOBp+OBjeOBvuOBmeOAglxuICogICAtIGluZGV4OiBpbnB1dCBidWZmZXIg44GuIGRlZmxhdGUg44Kz44Oz44OG44OK44Gu6ZaL5aeL5L2N572uLlxuICogICAtIGJsb2NrU2l6ZTog44OQ44OD44OV44Kh44Gu44OW44Ot44OD44Kv44K144Kk44K6LlxuICogICAtIHZlcmlmeTog5Ly45by144GM57WC44KP44Gj44Gf5b6MIGFkbGVyLTMyIGNoZWNrc3VtIOOBruaknOiovOOCkuihjOOBhuOBiy5cbiAqICAgLSBidWZmZXJUeXBlOiBabGliLkluZmxhdGUuQnVmZmVyVHlwZSDjga7lgKTjgavjgojjgaPjgabjg5Djg4Pjg5XjgqHjga7nrqHnkIbmlrnms5XjgpLmjIflrprjgZnjgosuXG4gKiAgICAgICBabGliLkluZmxhdGUuQnVmZmVyVHlwZSDjga8gWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUg44Gu44Ko44Kk44Oq44Ki44K5LlxuICovXG5abGliLkluZmxhdGUgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGJ1ZmZlclNpemU7XG4gIC8qKiBAdHlwZSB7WmxpYi5JbmZsYXRlLkJ1ZmZlclR5cGV9ICovXG4gIHZhciBidWZmZXJUeXBlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNtZjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBmbGc7XG5cbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSAqL1xuICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLmlwID0gMDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0luZmxhdGV9ICovXG4gIHRoaXMucmF3aW5mbGF0ZTtcbiAgLyoqIEB0eXBlIHsoYm9vbGVhbnx1bmRlZmluZWQpfSB2ZXJpZnkgZmxhZy4gKi9cbiAgdGhpcy52ZXJpZnk7XG5cbiAgLy8gb3B0aW9uIHBhcmFtZXRlcnNcbiAgaWYgKG9wdF9wYXJhbXMgfHwgIShvcHRfcGFyYW1zID0ge30pKSB7XG4gICAgaWYgKG9wdF9wYXJhbXNbJ2luZGV4J10pIHtcbiAgICAgIHRoaXMuaXAgPSBvcHRfcGFyYW1zWydpbmRleCddO1xuICAgIH1cbiAgICBpZiAob3B0X3BhcmFtc1sndmVyaWZ5J10pIHtcbiAgICAgIHRoaXMudmVyaWZ5ID0gb3B0X3BhcmFtc1sndmVyaWZ5J107XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tcHJlc3Npb24gTWV0aG9kIGFuZCBGbGFnc1xuICBjbWYgPSBpbnB1dFt0aGlzLmlwKytdO1xuICBmbGcgPSBpbnB1dFt0aGlzLmlwKytdO1xuXG4gIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICBzd2l0Y2ggKGNtZiAmIDB4MGYpIHtcbiAgICBjYXNlIFpsaWIuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTpcbiAgICAgIHRoaXMubWV0aG9kID0gWmxpYi5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgY29tcHJlc3Npb24gbWV0aG9kJyk7XG4gIH1cblxuICAvLyBmY2hlY2tcbiAgaWYgKCgoY21mIDw8IDgpICsgZmxnKSAlIDMxICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZjaGVjayBmbGFnOicgKyAoKGNtZiA8PCA4KSArIGZsZykgJSAzMSk7XG4gIH1cblxuICAvLyBmZGljdCAobm90IHN1cHBvcnRlZClcbiAgaWYgKGZsZyAmIDB4MjApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZkaWN0IGZsYWcgaXMgbm90IHN1cHBvcnRlZCcpO1xuICB9XG5cbiAgLy8gUmF3SW5mbGF0ZVxuICB0aGlzLnJhd2luZmxhdGUgPSBuZXcgWmxpYi5SYXdJbmZsYXRlKGlucHV0LCB7XG4gICAgJ2luZGV4JzogdGhpcy5pcCxcbiAgICAnYnVmZmVyU2l6ZSc6IG9wdF9wYXJhbXNbJ2J1ZmZlclNpemUnXSxcbiAgICAnYnVmZmVyVHlwZSc6IG9wdF9wYXJhbXNbJ2J1ZmZlclR5cGUnXSxcbiAgICAncmVzaXplJzogb3B0X3BhcmFtc1sncmVzaXplJ11cbiAgfSk7XG59XG5cbi8qKlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuWmxpYi5JbmZsYXRlLkJ1ZmZlclR5cGUgPSBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZTtcblxuLyoqXG4gKiBkZWNvbXByZXNzLlxuICogQHJldHVybiB7IShVaW50OEFycmF5fEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyLlxuICovXG5abGliLkluZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3MgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBpbnB1dCBidWZmZXIuICovXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyLiAqL1xuICB2YXIgYnVmZmVyO1xuICAvKiogQHR5cGUge251bWJlcn0gYWRsZXItMzIgY2hlY2tzdW0gKi9cbiAgdmFyIGFkbGVyMzI7XG5cbiAgYnVmZmVyID0gdGhpcy5yYXdpbmZsYXRlLmRlY29tcHJlc3MoKTtcbiAgdGhpcy5pcCA9IHRoaXMucmF3aW5mbGF0ZS5pcDtcblxuICAvLyB2ZXJpZnkgYWRsZXItMzJcbiAgaWYgKHRoaXMudmVyaWZ5KSB7XG4gICAgYWRsZXIzMiA9IChcbiAgICAgIGlucHV0W3RoaXMuaXArK10gPDwgMjQgfCBpbnB1dFt0aGlzLmlwKytdIDw8IDE2IHxcbiAgICAgIGlucHV0W3RoaXMuaXArK10gPDwgOCB8IGlucHV0W3RoaXMuaXArK11cbiAgICApID4+PiAwO1xuXG4gICAgaWYgKGFkbGVyMzIgIT09IFpsaWIuQWRsZXIzMihidWZmZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYWRsZXItMzIgY2hlY2tzdW0nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmZmVyO1xufTtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiZ29vZy5wcm92aWRlKCdabGliLlppcCcpO1xyXG5cclxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xyXG5nb29nLnJlcXVpcmUoJ1psaWIuUmF3RGVmbGF0ZScpO1xyXG5nb29nLnJlcXVpcmUoJ1psaWIuQ1JDMzInKTtcclxuXHJcbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbnMuXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuWmxpYi5aaXAgPSBmdW5jdGlvbihvcHRfcGFyYW1zKSB7XHJcbiAgb3B0X3BhcmFtcyA9IG9wdF9wYXJhbXMgfHwge307XHJcbiAgLyoqIEB0eXBlIHtBcnJheS48e1xyXG4gICAqICAgYnVmZmVyOiAhKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpLFxyXG4gICAqICAgb3B0aW9uOiBPYmplY3QsXHJcbiAgICogICBjb21wcmVzc2VkOiBib29sZWFuLFxyXG4gICAqICAgZW5jcnlwdGVkOiBib29sZWFuLFxyXG4gICAqICAgc2l6ZTogbnVtYmVyLFxyXG4gICAqICAgY3JjMzI6IG51bWJlclxyXG4gICAqIH0+fSAqL1xyXG4gIHRoaXMuZmlsZXMgPSBbXTtcclxuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB0aGlzLmNvbW1lbnQgPSBvcHRfcGFyYW1zWydjb21tZW50J107XHJcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdGhpcy5wYXNzd29yZDtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogQGVudW0ge251bWJlcn1cclxuICovXHJcblpsaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kID0ge1xyXG4gIFNUT1JFOiAwLFxyXG4gIERFRkxBVEU6IDhcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAZW51bSB7bnVtYmVyfVxyXG4gKi9cclxuWmxpYi5aaXAuT3BlcmF0aW5nU3lzdGVtID0ge1xyXG4gIE1TRE9TOiAwLFxyXG4gIFVOSVg6IDMsXHJcbiAgTUFDSU5UT1NIOiA3XHJcbn07XHJcblxyXG4vKipcclxuICogQGVudW0ge251bWJlcn1cclxuICovXHJcblpsaWIuWmlwLkZsYWdzID0ge1xyXG4gIEVOQ1JZUFQ6ICAgIDB4MDAwMSxcclxuICBERVNDUklQVE9SOiAweDAwMDgsXHJcbiAgVVRGODogICAgICAgMHgwODAwXHJcbn07XHJcblxyXG4vKipcclxuICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxyXG4gKiBAY29uc3RcclxuICovXHJcblpsaWIuWmlwLkZpbGVIZWFkZXJTaWduYXR1cmUgPSBbMHg1MCwgMHg0YiwgMHgwMSwgMHgwMl07XHJcblxyXG4vKipcclxuICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxyXG4gKiBAY29uc3RcclxuICovXHJcblpsaWIuWmlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZSA9IFsweDUwLCAweDRiLCAweDAzLCAweDA0XTtcclxuXHJcbi8qKlxyXG4gKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XHJcbiAqIEBjb25zdFxyXG4gKi9cclxuWmxpYi5aaXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZSA9IFsweDUwLCAweDRiLCAweDA1LCAweDA2XTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXl9IGlucHV0XHJcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtcyBvcHRpb25zLlxyXG4gKi9cclxuWmxpYi5aaXAucHJvdG90eXBlLmFkZEZpbGUgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xyXG4gIG9wdF9wYXJhbXMgPSBvcHRfcGFyYW1zIHx8IHt9O1xyXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xyXG4gIHZhciBmaWxlbmFtZSA9ICcnIHx8IG9wdF9wYXJhbXNbJ2ZpbGVuYW1lJ107XHJcbiAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xyXG4gIHZhciBjb21wcmVzc2VkO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBzaXplID0gaW5wdXQubGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBjcmMzMiA9IDA7XHJcblxyXG4gIGlmIChVU0VfVFlQRURBUlJBWSAmJiBpbnB1dCBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICBpbnB1dCA9IG5ldyBVaW50OEFycmF5KGlucHV0KTtcclxuICB9XHJcblxyXG4gIC8vIGRlZmF1bHRcclxuICBpZiAodHlwZW9mIG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uTWV0aG9kJ10gIT09ICdudW1iZXInKSB7XHJcbiAgICBvcHRfcGFyYW1zWydjb21wcmVzc2lvbk1ldGhvZCddID0gWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTtcclxuICB9XHJcblxyXG4gIC8vIOOBneOBruWgtOOBp+Wcp+e4ruOBmeOCi+WgtOWQiFxyXG4gIGlmIChvcHRfcGFyYW1zWydjb21wcmVzcyddKSB7XHJcbiAgICBzd2l0Y2ggKG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uTWV0aG9kJ10pIHtcclxuICAgICAgY2FzZSBabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZC5TVE9SRTpcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxyXG4gICAgICAgIGNyYzMyID0gWmxpYi5DUkMzMi5jYWxjKGlucHV0KTtcclxuICAgICAgICBpbnB1dCA9IHRoaXMuZGVmbGF0ZVdpdGhPcHRpb24oaW5wdXQsIG9wdF9wYXJhbXMpO1xyXG4gICAgICAgIGNvbXByZXNzZWQgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Q6JyArIG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uTWV0aG9kJ10pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdGhpcy5maWxlcy5wdXNoKHtcclxuICAgIGJ1ZmZlcjogaW5wdXQsXHJcbiAgICBvcHRpb246IG9wdF9wYXJhbXMsXHJcbiAgICBjb21wcmVzc2VkOiBjb21wcmVzc2VkLFxyXG4gICAgZW5jcnlwdGVkOiBmYWxzZSxcclxuICAgIHNpemU6IHNpemUsXHJcbiAgICBjcmMzMjogY3JjMzJcclxuICB9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0geyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gcGFzc3dvcmRcclxuICovXHJcblpsaWIuWmlwLnByb3RvdHlwZS5zZXRQYXNzd29yZCA9IGZ1bmN0aW9uKHBhc3N3b3JkKSB7XHJcbiAgdGhpcy5wYXNzd29yZCA9IHBhc3N3b3JkO1xyXG59O1xyXG5cclxuWmxpYi5aaXAucHJvdG90eXBlLmNvbXByZXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgLyoqIEB0eXBlIHtBcnJheS48e1xyXG4gICAqICAgYnVmZmVyOiAhKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpLFxyXG4gICAqICAgb3B0aW9uOiBPYmplY3QsXHJcbiAgICogICBjb21wcmVzc2VkOiBib29sZWFuLFxyXG4gICAqICAgZW5jcnlwdGVkOiBib29sZWFuLFxyXG4gICAqICAgc2l6ZTogbnVtYmVyLFxyXG4gICAqICAgY3JjMzI6IG51bWJlclxyXG4gICAqIH0+fSAqL1xyXG4gIHZhciBmaWxlcyA9IHRoaXMuZmlsZXM7XHJcbiAgLyoqIEB0eXBlIHt7XHJcbiAgICogICBidWZmZXI6ICEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSksXHJcbiAgICogICBvcHRpb246IE9iamVjdCxcclxuICAgKiAgIGNvbXByZXNzZWQ6IGJvb2xlYW4sXHJcbiAgICogICBlbmNyeXB0ZWQ6IGJvb2xlYW4sXHJcbiAgICogICBzaXplOiBudW1iZXIsXHJcbiAgICogICBjcmMzMjogbnVtYmVyXHJcbiAgICogfX0gKi9cclxuICB2YXIgZmlsZTtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIG91dHB1dDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgb3AxO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBvcDI7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIG9wMztcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgbG9jYWxGaWxlU2l6ZSA9IDA7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGNlbnRyYWxEaXJlY3RvcnlTaXplID0gMDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgZW5kT2ZDZW50cmFsRGlyZWN0b3J5U2l6ZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgb2Zmc2V0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBuZWVkVmVyc2lvbjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgZmxhZ3M7XHJcbiAgLyoqIEB0eXBlIHtabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZH0gKi9cclxuICB2YXIgY29tcHJlc3Npb25NZXRob2Q7XHJcbiAgLyoqIEB0eXBlIHtEYXRlfSAqL1xyXG4gIHZhciBkYXRlO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBjcmMzMjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgc2l6ZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgcGxhaW5TaXplO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBmaWxlbmFtZUxlbmd0aDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgZXh0cmFGaWVsZExlbmd0aDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgY29tbWVudExlbmd0aDtcclxuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB2YXIgZmlsZW5hbWU7XHJcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIGV4dHJhRmllbGQ7XHJcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIGNvbW1lbnQ7XHJcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIGJ1ZmZlcjtcclxuICAvKiogQHR5cGUgeyp9ICovXHJcbiAgdmFyIHRtcDtcclxuICAvKiogQHR5cGUge0FycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5fE9iamVjdH0gKi9cclxuICB2YXIga2V5O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpbDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgajtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgamw7XHJcblxyXG4gIC8vIOODleOCoeOCpOODq+OBruWcp+e4rlxyXG4gIGZvciAoaSA9IDAsIGlsID0gZmlsZXMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xyXG4gICAgZmlsZSA9IGZpbGVzW2ldO1xyXG4gICAgZmlsZW5hbWVMZW5ndGggPVxyXG4gICAgICAoZmlsZS5vcHRpb25bJ2ZpbGVuYW1lJ10pID8gZmlsZS5vcHRpb25bJ2ZpbGVuYW1lJ10ubGVuZ3RoIDogMDtcclxuICAgIGV4dHJhRmllbGRMZW5ndGggPVxyXG4gICAgICAoZmlsZS5vcHRpb25bJ2V4dHJhRmllbGQnXSkgPyBmaWxlLm9wdGlvblsnZXh0cmFGaWVsZCddLmxlbmd0aCA6IDA7XHJcbiAgICBjb21tZW50TGVuZ3RoID1cclxuICAgICAgKGZpbGUub3B0aW9uWydjb21tZW50J10pID8gZmlsZS5vcHRpb25bJ2NvbW1lbnQnXS5sZW5ndGggOiAwO1xyXG5cclxuICAgIC8vIOWcp+e4ruOBleOCjOOBpuOBhOOBquOBi+OBo+OBn+OCieWcp+e4rlxyXG4gICAgaWYgKCFmaWxlLmNvbXByZXNzZWQpIHtcclxuICAgICAgLy8g5Zyn57iu5YmN44GrIENSQzMyIOOBruioiOeul+OCkuOBl+OBpuOBiuOBj1xyXG4gICAgICBmaWxlLmNyYzMyID0gWmxpYi5DUkMzMi5jYWxjKGZpbGUuYnVmZmVyKTtcclxuXHJcbiAgICAgIHN3aXRjaCAoZmlsZS5vcHRpb25bJ2NvbXByZXNzaW9uTWV0aG9kJ10pIHtcclxuICAgICAgICBjYXNlIFpsaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kLlNUT1JFOlxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxyXG4gICAgICAgICAgZmlsZS5idWZmZXIgPSB0aGlzLmRlZmxhdGVXaXRoT3B0aW9uKGZpbGUuYnVmZmVyLCBmaWxlLm9wdGlvbik7XHJcbiAgICAgICAgICBmaWxlLmNvbXByZXNzZWQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Q6JyArIGZpbGUub3B0aW9uWydjb21wcmVzc2lvbk1ldGhvZCddKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGVuY3J5cHRpb25cclxuICAgIGlmIChmaWxlLm9wdGlvblsncGFzc3dvcmQnXSAhPT0gdm9pZCAwfHwgdGhpcy5wYXNzd29yZCAhPT0gdm9pZCAwKSB7XHJcbiAgICAgIC8vIGluaXQgZW5jcnlwdGlvblxyXG4gICAgICBrZXkgPSB0aGlzLmNyZWF0ZUVuY3J5cHRpb25LZXkoZmlsZS5vcHRpb25bJ3Bhc3N3b3JkJ10gfHwgdGhpcy5wYXNzd29yZCk7XHJcblxyXG4gICAgICAvLyBhZGQgaGVhZGVyXHJcbiAgICAgIGJ1ZmZlciA9IGZpbGUuYnVmZmVyO1xyXG4gICAgICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcclxuICAgICAgICB0bXAgPSBuZXcgVWludDhBcnJheShidWZmZXIubGVuZ3RoICsgMTIpO1xyXG4gICAgICAgIHRtcC5zZXQoYnVmZmVyLCAxMik7XHJcbiAgICAgICAgYnVmZmVyID0gdG1wO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJ1ZmZlci51bnNoaWZ0KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGogPSAwOyBqIDwgMTI7ICsraikge1xyXG4gICAgICAgIGJ1ZmZlcltqXSA9IHRoaXMuZW5jb2RlKFxyXG4gICAgICAgICAga2V5LFxyXG4gICAgICAgICAgaSA9PT0gMTEgPyAoZmlsZS5jcmMzMiAmIDB4ZmYpIDogKE1hdGgucmFuZG9tKCkgKiAyNTYgfCAwKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGRhdGEgZW5jcnlwdGlvblxyXG4gICAgICBmb3IgKGpsID0gYnVmZmVyLmxlbmd0aDsgaiA8IGpsOyArK2opIHtcclxuICAgICAgICBidWZmZXJbal0gPSB0aGlzLmVuY29kZShrZXksIGJ1ZmZlcltqXSk7XHJcbiAgICAgIH1cclxuICAgICAgZmlsZS5idWZmZXIgPSBidWZmZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5b+F6KaB44OQ44OD44OV44Kh44K144Kk44K644Gu6KiI566XXHJcbiAgICBsb2NhbEZpbGVTaXplICs9XHJcbiAgICAgIC8vIGxvY2FsIGZpbGUgaGVhZGVyXHJcbiAgICAgIDMwICsgZmlsZW5hbWVMZW5ndGggK1xyXG4gICAgICAvLyBmaWxlIGRhdGFcclxuICAgICAgZmlsZS5idWZmZXIubGVuZ3RoO1xyXG5cclxuICAgIGNlbnRyYWxEaXJlY3RvcnlTaXplICs9XHJcbiAgICAgIC8vIGZpbGUgaGVhZGVyXHJcbiAgICAgIDQ2ICsgZmlsZW5hbWVMZW5ndGggKyBjb21tZW50TGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLy8gZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5XHJcbiAgZW5kT2ZDZW50cmFsRGlyZWN0b3J5U2l6ZSA9IDQ2ICsgKHRoaXMuY29tbWVudCA/IHRoaXMuY29tbWVudC5sZW5ndGggOiAwKTtcclxuICBvdXRwdXQgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShcclxuICAgIGxvY2FsRmlsZVNpemUgKyBjZW50cmFsRGlyZWN0b3J5U2l6ZSArIGVuZE9mQ2VudHJhbERpcmVjdG9yeVNpemVcclxuICApO1xyXG4gIG9wMSA9IDA7XHJcbiAgb3AyID0gbG9jYWxGaWxlU2l6ZTtcclxuICBvcDMgPSBvcDIgKyBjZW50cmFsRGlyZWN0b3J5U2l6ZTtcclxuXHJcbiAgLy8g44OV44Kh44Kk44Or44Gu5Zyn57iuXHJcbiAgZm9yIChpID0gMCwgaWwgPSBmaWxlcy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XHJcbiAgICBmaWxlID0gZmlsZXNbaV07XHJcbiAgICBmaWxlbmFtZUxlbmd0aCA9XHJcbiAgICAgIGZpbGUub3B0aW9uWydmaWxlbmFtZSddID8gZmlsZS5vcHRpb25bJ2ZpbGVuYW1lJ10ubGVuZ3RoIDogIDA7XHJcbiAgICBleHRyYUZpZWxkTGVuZ3RoID0gMDsgLy8gVE9ET1xyXG4gICAgY29tbWVudExlbmd0aCA9XHJcbiAgICAgIGZpbGUub3B0aW9uWydjb21tZW50J10gPyBmaWxlLm9wdGlvblsnY29tbWVudCddLmxlbmd0aCA6IDA7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBsb2NhbCBmaWxlIGhlYWRlciAmIGZpbGUgaGVhZGVyXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvZmZzZXQgPSBvcDE7XHJcblxyXG4gICAgLy8gc2lnbmF0dXJlXHJcbiAgICAvLyBsb2NhbCBmaWxlIGhlYWRlclxyXG4gICAgb3V0cHV0W29wMSsrXSA9IFpsaWIuWmlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZVswXTtcclxuICAgIG91dHB1dFtvcDErK10gPSBabGliLlppcC5Mb2NhbEZpbGVIZWFkZXJTaWduYXR1cmVbMV07XHJcbiAgICBvdXRwdXRbb3AxKytdID0gWmxpYi5aaXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlWzJdO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IFpsaWIuWmlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZVszXTtcclxuICAgIC8vIGZpbGUgaGVhZGVyXHJcbiAgICBvdXRwdXRbb3AyKytdID0gWmxpYi5aaXAuRmlsZUhlYWRlclNpZ25hdHVyZVswXTtcclxuICAgIG91dHB1dFtvcDIrK10gPSBabGliLlppcC5GaWxlSGVhZGVyU2lnbmF0dXJlWzFdO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IFpsaWIuWmlwLkZpbGVIZWFkZXJTaWduYXR1cmVbMl07XHJcbiAgICBvdXRwdXRbb3AyKytdID0gWmxpYi5aaXAuRmlsZUhlYWRlclNpZ25hdHVyZVszXTtcclxuXHJcbiAgICAvLyBjb21wcmVzc29yIGluZm9cclxuICAgIG5lZWRWZXJzaW9uID0gMjA7XHJcbiAgICBvdXRwdXRbb3AyKytdID0gbmVlZFZlcnNpb24gJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMisrXSA9XHJcbiAgICAgIC8qKiBAdHlwZSB7WmxpYi5aaXAuT3BlcmF0aW5nU3lzdGVtfSAqL1xyXG4gICAgICAoZmlsZS5vcHRpb25bJ29zJ10pIHx8XHJcbiAgICAgIFpsaWIuWmlwLk9wZXJhdGluZ1N5c3RlbS5NU0RPUztcclxuXHJcbiAgICAvLyBuZWVkIHZlcnNpb25cclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gIG5lZWRWZXJzaW9uICAgICAgICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKG5lZWRWZXJzaW9uID4+IDgpICYgMHhmZjtcclxuXHJcbiAgICAvLyBnZW5lcmFsIHB1cnBvc2UgYml0IGZsYWdcclxuICAgIGZsYWdzID0gMDtcclxuICAgIGlmIChmaWxlLm9wdGlvblsncGFzc3dvcmQnXSB8fCB0aGlzLnBhc3N3b3JkKSB7XHJcbiAgICAgIGZsYWdzIHw9IFpsaWIuWmlwLkZsYWdzLkVOQ1JZUFQ7XHJcbiAgICB9XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9ICBmbGFncyAgICAgICAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChmbGFncyA+PiA4KSAmIDB4ZmY7XHJcblxyXG4gICAgLy8gY29tcHJlc3Npb24gbWV0aG9kXHJcbiAgICBjb21wcmVzc2lvbk1ldGhvZCA9XHJcbiAgICAgIC8qKiBAdHlwZSB7WmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2R9ICovXHJcbiAgICAgIChmaWxlLm9wdGlvblsnY29tcHJlc3Npb25NZXRob2QnXSk7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9ICBjb21wcmVzc2lvbk1ldGhvZCAgICAgICAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChjb21wcmVzc2lvbk1ldGhvZCA+PiA4KSAmIDB4ZmY7XHJcblxyXG4gICAgLy8gZGF0ZVxyXG4gICAgZGF0ZSA9IC8qKiBAdHlwZSB7KERhdGV8dW5kZWZpbmVkKX0gKi8oZmlsZS5vcHRpb25bJ2RhdGUnXSkgfHwgbmV3IERhdGUoKTtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID1cclxuICAgICAgKChkYXRlLmdldE1pbnV0ZXMoKSAmIDB4NykgPDwgNSkgfFxyXG4gICAgICAoZGF0ZS5nZXRTZWNvbmRzKCkgLyAyIHwgMCk7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9XHJcbiAgICAgIChkYXRlLmdldEhvdXJzKCkgICA8PCAzKSB8XHJcbiAgICAgIChkYXRlLmdldE1pbnV0ZXMoKSA+PiAzKTtcclxuICAgIC8vXHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9XHJcbiAgICAgICgoZGF0ZS5nZXRNb250aCgpICsgMSAmIDB4NykgPDwgNSkgfFxyXG4gICAgICAoZGF0ZS5nZXREYXRlKCkpO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPVxyXG4gICAgICAoKGRhdGUuZ2V0RnVsbFllYXIoKSAtIDE5ODAgJiAweDdmKSA8PCAxKSB8XHJcbiAgICAgIChkYXRlLmdldE1vbnRoKCkgKyAxID4+IDMpO1xyXG5cclxuICAgIC8vIENSQy0zMlxyXG4gICAgY3JjMzIgPSBmaWxlLmNyYzMyO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAgY3JjMzIgICAgICAgICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKGNyYzMyID4+ICA4KSAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChjcmMzMiA+PiAxNikgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAoY3JjMzIgPj4gMjQpICYgMHhmZjtcclxuXHJcbiAgICAvLyBjb21wcmVzc2VkIHNpemVcclxuICAgIHNpemUgPSBmaWxlLmJ1ZmZlci5sZW5ndGg7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9ICBzaXplICAgICAgICAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChzaXplID4+ICA4KSAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChzaXplID4+IDE2KSAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChzaXplID4+IDI0KSAmIDB4ZmY7XHJcblxyXG4gICAgLy8gdW5jb21wcmVzc2VkIHNpemVcclxuICAgIHBsYWluU2l6ZSA9IGZpbGUuc2l6ZTtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gIHBsYWluU2l6ZSAgICAgICAgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAocGxhaW5TaXplID4+ICA4KSAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChwbGFpblNpemUgPj4gMTYpICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKHBsYWluU2l6ZSA+PiAyNCkgJiAweGZmO1xyXG5cclxuICAgIC8vIGZpbGVuYW1lIGxlbmd0aFxyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAgZmlsZW5hbWVMZW5ndGggICAgICAgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAoZmlsZW5hbWVMZW5ndGggPj4gOCkgJiAweGZmO1xyXG5cclxuICAgIC8vIGV4dHJhIGZpZWxkIGxlbmd0aFxyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAgZXh0cmFGaWVsZExlbmd0aCAgICAgICAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChleHRyYUZpZWxkTGVuZ3RoID4+IDgpICYgMHhmZjtcclxuXHJcbiAgICAvLyBmaWxlIGNvbW1lbnQgbGVuZ3RoXHJcbiAgICBvdXRwdXRbb3AyKytdID0gIGNvbW1lbnRMZW5ndGggICAgICAgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IChjb21tZW50TGVuZ3RoID4+IDgpICYgMHhmZjtcclxuXHJcbiAgICAvLyBkaXNrIG51bWJlciBzdGFydFxyXG4gICAgb3V0cHV0W29wMisrXSA9IDA7XHJcbiAgICBvdXRwdXRbb3AyKytdID0gMDtcclxuXHJcbiAgICAvLyBpbnRlcm5hbCBmaWxlIGF0dHJpYnV0ZXNcclxuICAgIG91dHB1dFtvcDIrK10gPSAwO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IDA7XHJcblxyXG4gICAgLy8gZXh0ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXHJcbiAgICBvdXRwdXRbb3AyKytdID0gMDtcclxuICAgIG91dHB1dFtvcDIrK10gPSAwO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IDA7XHJcbiAgICBvdXRwdXRbb3AyKytdID0gMDtcclxuXHJcbiAgICAvLyByZWxhdGl2ZSBvZmZzZXQgb2YgbG9jYWwgaGVhZGVyXHJcbiAgICBvdXRwdXRbb3AyKytdID0gIG9mZnNldCAgICAgICAgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IChvZmZzZXQgPj4gIDgpICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDIrK10gPSAob2Zmc2V0ID4+IDE2KSAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AyKytdID0gKG9mZnNldCA+PiAyNCkgJiAweGZmO1xyXG5cclxuICAgIC8vIGZpbGVuYW1lXHJcbiAgICBmaWxlbmFtZSA9IGZpbGUub3B0aW9uWydmaWxlbmFtZSddO1xyXG4gICAgaWYgKGZpbGVuYW1lKSB7XHJcbiAgICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xyXG4gICAgICAgIG91dHB1dC5zZXQoZmlsZW5hbWUsIG9wMSk7XHJcbiAgICAgICAgb3V0cHV0LnNldChmaWxlbmFtZSwgb3AyKTtcclxuICAgICAgICBvcDEgKz0gZmlsZW5hbWVMZW5ndGg7XHJcbiAgICAgICAgb3AyICs9IGZpbGVuYW1lTGVuZ3RoO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBmaWxlbmFtZUxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IGZpbGVuYW1lW2pdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGV4dHJhIGZpZWxkXHJcbiAgICBleHRyYUZpZWxkID0gZmlsZS5vcHRpb25bJ2V4dHJhRmllbGQnXTtcclxuICAgIGlmIChleHRyYUZpZWxkKSB7XHJcbiAgICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xyXG4gICAgICAgIG91dHB1dC5zZXQoZXh0cmFGaWVsZCwgb3AxKTtcclxuICAgICAgICBvdXRwdXQuc2V0KGV4dHJhRmllbGQsIG9wMik7XHJcbiAgICAgICAgb3AxICs9IGV4dHJhRmllbGRMZW5ndGg7XHJcbiAgICAgICAgb3AyICs9IGV4dHJhRmllbGRMZW5ndGg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGNvbW1lbnRMZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSBleHRyYUZpZWxkW2pdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvbW1lbnRcclxuICAgIGNvbW1lbnQgPSBmaWxlLm9wdGlvblsnY29tbWVudCddO1xyXG4gICAgaWYgKGNvbW1lbnQpIHtcclxuICAgICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XHJcbiAgICAgICAgb3V0cHV0LnNldChjb21tZW50LCBvcDIpO1xyXG4gICAgICAgIG9wMiArPSBjb21tZW50TGVuZ3RoO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBjb21tZW50TGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgIG91dHB1dFtvcDIrK10gPSBjb21tZW50W2pdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gZmlsZSBkYXRhXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcclxuICAgICAgb3V0cHV0LnNldChmaWxlLmJ1ZmZlciwgb3AxKTtcclxuICAgICAgb3AxICs9IGZpbGUuYnVmZmVyLmxlbmd0aDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAoaiA9IDAsIGpsID0gZmlsZS5idWZmZXIubGVuZ3RoOyBqIDwgamw7ICsraikge1xyXG4gICAgICAgIG91dHB1dFtvcDErK10gPSBmaWxlLmJ1ZmZlcltqXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5XHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8vIHNpZ25hdHVyZVxyXG4gIG91dHB1dFtvcDMrK10gPSBabGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzBdO1xyXG4gIG91dHB1dFtvcDMrK10gPSBabGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzFdO1xyXG4gIG91dHB1dFtvcDMrK10gPSBabGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzJdO1xyXG4gIG91dHB1dFtvcDMrK10gPSBabGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzNdO1xyXG5cclxuICAvLyBudW1iZXIgb2YgdGhpcyBkaXNrXHJcbiAgb3V0cHV0W29wMysrXSA9IDA7XHJcbiAgb3V0cHV0W29wMysrXSA9IDA7XHJcblxyXG4gIC8vIG51bWJlciBvZiB0aGUgZGlzayB3aXRoIHRoZSBzdGFydCBvZiB0aGUgY2VudHJhbCBkaXJlY3RvcnlcclxuICBvdXRwdXRbb3AzKytdID0gMDtcclxuICBvdXRwdXRbb3AzKytdID0gMDtcclxuXHJcbiAgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXMgaW4gdGhlIGNlbnRyYWwgZGlyZWN0b3J5IG9uIHRoaXMgZGlza1xyXG4gIG91dHB1dFtvcDMrK10gPSAgaWwgICAgICAgJiAweGZmO1xyXG4gIG91dHB1dFtvcDMrK10gPSAoaWwgPj4gOCkgJiAweGZmO1xyXG5cclxuICAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllcyBpbiB0aGUgY2VudHJhbCBkaXJlY3RvcnlcclxuICBvdXRwdXRbb3AzKytdID0gIGlsICAgICAgICYgMHhmZjtcclxuICBvdXRwdXRbb3AzKytdID0gKGlsID4+IDgpICYgMHhmZjtcclxuXHJcbiAgLy8gc2l6ZSBvZiB0aGUgY2VudHJhbCBkaXJlY3RvcnlcclxuICBvdXRwdXRbb3AzKytdID0gIGNlbnRyYWxEaXJlY3RvcnlTaXplICAgICAgICAmIDB4ZmY7XHJcbiAgb3V0cHV0W29wMysrXSA9IChjZW50cmFsRGlyZWN0b3J5U2l6ZSA+PiAgOCkgJiAweGZmO1xyXG4gIG91dHB1dFtvcDMrK10gPSAoY2VudHJhbERpcmVjdG9yeVNpemUgPj4gMTYpICYgMHhmZjtcclxuICBvdXRwdXRbb3AzKytdID0gKGNlbnRyYWxEaXJlY3RvcnlTaXplID4+IDI0KSAmIDB4ZmY7XHJcblxyXG4gIC8vIG9mZnNldCBvZiBzdGFydCBvZiBjZW50cmFsIGRpcmVjdG9yeSB3aXRoIHJlc3BlY3QgdG8gdGhlIHN0YXJ0aW5nIGRpc2sgbnVtYmVyXHJcbiAgb3V0cHV0W29wMysrXSA9ICBsb2NhbEZpbGVTaXplICAgICAgICAmIDB4ZmY7XHJcbiAgb3V0cHV0W29wMysrXSA9IChsb2NhbEZpbGVTaXplID4+ICA4KSAmIDB4ZmY7XHJcbiAgb3V0cHV0W29wMysrXSA9IChsb2NhbEZpbGVTaXplID4+IDE2KSAmIDB4ZmY7XHJcbiAgb3V0cHV0W29wMysrXSA9IChsb2NhbEZpbGVTaXplID4+IDI0KSAmIDB4ZmY7XHJcblxyXG4gIC8vIC5aSVAgZmlsZSBjb21tZW50IGxlbmd0aFxyXG4gIGNvbW1lbnRMZW5ndGggPSB0aGlzLmNvbW1lbnQgPyB0aGlzLmNvbW1lbnQubGVuZ3RoIDogMDtcclxuICBvdXRwdXRbb3AzKytdID0gIGNvbW1lbnRMZW5ndGggICAgICAgJiAweGZmO1xyXG4gIG91dHB1dFtvcDMrK10gPSAoY29tbWVudExlbmd0aCA+PiA4KSAmIDB4ZmY7XHJcblxyXG4gIC8vIC5aSVAgZmlsZSBjb21tZW50XHJcbiAgaWYgKHRoaXMuY29tbWVudCkge1xyXG4gICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XHJcbiAgICAgIG91dHB1dC5zZXQodGhpcy5jb21tZW50LCBvcDMpO1xyXG4gICAgICBvcDMgKz0gY29tbWVudExlbmd0aDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAoaiA9IDAsIGpsID0gY29tbWVudExlbmd0aDsgaiA8IGpsOyArK2opIHtcclxuICAgICAgICBvdXRwdXRbb3AzKytdID0gdGhpcy5jb21tZW50W2pdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gb3V0cHV0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5wdXRcclxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbnMuXHJcbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9XHJcbiAqL1xyXG5abGliLlppcC5wcm90b3R5cGUuZGVmbGF0ZVdpdGhPcHRpb24gPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xyXG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdEZWZsYXRlfSAqL1xyXG4gIHZhciBkZWZsYXRvciA9IG5ldyBabGliLlJhd0RlZmxhdGUoaW5wdXQsIG9wdF9wYXJhbXNbJ2RlZmxhdGVPcHRpb24nXSk7XHJcblxyXG4gIHJldHVybiBkZWZsYXRvci5jb21wcmVzcygpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0ga2V5XHJcbiAqIEByZXR1cm4ge251bWJlcn1cclxuICovXHJcblpsaWIuWmlwLnByb3RvdHlwZS5nZXRCeXRlID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIHRtcCA9ICgoa2V5WzJdICYgMHhmZmZmKSB8IDIpO1xyXG5cclxuICByZXR1cm4gKCh0bXAgKiAodG1wIF4gMSkpID4+IDgpICYgMHhmZjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0geyhBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheXxPYmplY3QpfSBrZXlcclxuICogQHBhcmFtIHtudW1iZXJ9IG5cclxuICogQHJldHVybiB7bnVtYmVyfVxyXG4gKi9cclxuWmxpYi5aaXAucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uKGtleSwgbikge1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciB0bXAgPSB0aGlzLmdldEJ5dGUoLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqLyhrZXkpKTtcclxuXHJcbiAgdGhpcy51cGRhdGVLZXlzKC8qKiBAdHlwZSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi8oa2V5KSwgbik7XHJcblxyXG4gIHJldHVybiB0bXAgXiBuO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0ga2V5XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBuXHJcbiAqL1xyXG5abGliLlppcC5wcm90b3R5cGUudXBkYXRlS2V5cyA9IGZ1bmN0aW9uKGtleSwgbikge1xyXG4gIGtleVswXSA9IFpsaWIuQ1JDMzIuc2luZ2xlKGtleVswXSwgbik7XHJcbiAga2V5WzFdID1cclxuICAgICgoKCgoa2V5WzFdICsgKGtleVswXSAmIDB4ZmYpKSAqIDIwMTczID4+PiAwKSAqIDY2ODEpID4+PiAwKSArIDEpID4+PiAwO1xyXG4gIGtleVsyXSA9IFpsaWIuQ1JDMzIuc2luZ2xlKGtleVsyXSwga2V5WzFdID4+PiAyNCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IHBhc3N3b3JkXHJcbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXl8T2JqZWN0KX1cclxuICovXHJcblpsaWIuWmlwLnByb3RvdHlwZS5jcmVhdGVFbmNyeXB0aW9uS2V5ID0gZnVuY3Rpb24ocGFzc3dvcmQpIHtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqL1xyXG4gIHZhciBrZXkgPSBbMzA1NDE5ODk2LCA1OTE3NTEwNDksIDg3ODA4MjE5Ml07XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGk7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGlsO1xyXG5cclxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcclxuICAgIGtleSA9IG5ldyBVaW50MzJBcnJheShrZXkpO1xyXG4gIH1cclxuXHJcbiAgZm9yIChpID0gMCwgaWwgPSBwYXNzd29yZC5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XHJcbiAgICB0aGlzLnVwZGF0ZUtleXMoa2V5LCBwYXNzd29yZFtpXSAmIDB4ZmYpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGtleTtcclxufTtcclxuXHJcbn0pOyIsImdvb2cucHJvdmlkZSgnWmxpYi5VbnppcCcpO1xyXG5cclxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xyXG5nb29nLnJlcXVpcmUoJ0ZpeFBoYW50b21KU0Z1bmN0aW9uQXBwbHlCdWdfU3RyaW5nRnJvbUNoYXJDb2RlJyk7XHJcbmdvb2cucmVxdWlyZSgnWmxpYi5SYXdJbmZsYXRlJyk7XHJcbmdvb2cucmVxdWlyZSgnWmxpYi5DUkMzMicpO1xyXG5nb29nLnJlcXVpcmUoJ1psaWIuWmlwJyk7XHJcblxyXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxyXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9ucy5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5abGliLlVuemlwID0gZnVuY3Rpb24oaW5wdXQsIG9wdF9wYXJhbXMpIHtcclxuICBvcHRfcGFyYW1zID0gb3B0X3BhcmFtcyB8fCB7fTtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdGhpcy5pbnB1dCA9XHJcbiAgICAoVVNFX1RZUEVEQVJSQVkgJiYgKGlucHV0IGluc3RhbmNlb2YgQXJyYXkpKSA/XHJcbiAgICBuZXcgVWludDhBcnJheShpbnB1dCkgOiBpbnB1dDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmlwID0gMDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmVvY2RyT2Zmc2V0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMubnVtYmVyT2ZUaGlzRGlzaztcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLnN0YXJ0RGlzaztcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLnRvdGFsRW50cmllc1RoaXNEaXNrO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMudG90YWxFbnRyaWVzO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuY2VudHJhbERpcmVjdG9yeVNpemU7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5jZW50cmFsRGlyZWN0b3J5T2Zmc2V0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuY29tbWVudExlbmd0aDtcclxuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB0aGlzLmNvbW1lbnQ7XHJcbiAgLyoqIEB0eXBlIHtBcnJheS48WmxpYi5VbnppcC5GaWxlSGVhZGVyPn0gKi9cclxuICB0aGlzLmZpbGVIZWFkZXJMaXN0O1xyXG4gIC8qKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIG51bWJlcj59ICovXHJcbiAgdGhpcy5maWxlbmFtZVRvSW5kZXg7XHJcbiAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xyXG4gIHRoaXMudmVyaWZ5ID0gb3B0X3BhcmFtc1sndmVyaWZ5J10gfHwgZmFsc2U7XHJcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdGhpcy5wYXNzd29yZCA9IG9wdF9wYXJhbXNbJ3Bhc3N3b3JkJ107XHJcbn07XHJcblxyXG5abGliLlVuemlwLkNvbXByZXNzaW9uTWV0aG9kID0gWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2Q7XHJcblxyXG4vKipcclxuICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxyXG4gKiBAY29uc3RcclxuICovXHJcblpsaWIuVW56aXAuRmlsZUhlYWRlclNpZ25hdHVyZSA9IFpsaWIuWmlwLkZpbGVIZWFkZXJTaWduYXR1cmU7XHJcblxyXG4vKipcclxuICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxyXG4gKiBAY29uc3RcclxuICovXHJcblpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlID0gWmxpYi5aaXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlO1xyXG5cclxuLyoqXHJcbiAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cclxuICogQGNvbnN0XHJcbiAqL1xyXG5abGliLlVuemlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmUgPSBabGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlO1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gaXAgaW5wdXQgcG9zaXRpb24uXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuWmxpYi5VbnppcC5GaWxlSGVhZGVyID0gZnVuY3Rpb24oaW5wdXQsIGlwKSB7XHJcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHRoaXMuaW5wdXQgPSBpbnB1dDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLm9mZnNldCA9IGlwO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMubGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMudmVyc2lvbjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLm9zO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMubmVlZFZlcnNpb247XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5mbGFncztcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmNvbXByZXNzaW9uO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMudGltZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmRhdGU7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5jcmMzMjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmNvbXByZXNzZWRTaXplO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMucGxhaW5TaXplO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuZmlsZU5hbWVMZW5ndGg7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5leHRyYUZpZWxkTGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuZmlsZUNvbW1lbnRMZW5ndGg7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5kaXNrTnVtYmVyU3RhcnQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5pbnRlcm5hbEZpbGVBdHRyaWJ1dGVzO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuZXh0ZXJuYWxGaWxlQXR0cmlidXRlcztcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLnJlbGF0aXZlT2Zmc2V0O1xyXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xyXG4gIHRoaXMuZmlsZW5hbWU7XHJcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHRoaXMuZXh0cmFGaWVsZDtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdGhpcy5jb21tZW50O1xyXG59O1xyXG5cclxuWmxpYi5VbnppcC5GaWxlSGVhZGVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKCkge1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpcCA9IHRoaXMub2Zmc2V0O1xyXG5cclxuICAvLyBjZW50cmFsIGZpbGUgaGVhZGVyIHNpZ25hdHVyZVxyXG4gIGlmIChpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5GaWxlSGVhZGVyU2lnbmF0dXJlWzBdIHx8XHJcbiAgICAgIGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkZpbGVIZWFkZXJTaWduYXR1cmVbMV0gfHxcclxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuRmlsZUhlYWRlclNpZ25hdHVyZVsyXSB8fFxyXG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5GaWxlSGVhZGVyU2lnbmF0dXJlWzNdKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmlsZSBoZWFkZXIgc2lnbmF0dXJlJyk7XHJcbiAgfVxyXG5cclxuICAvLyB2ZXJzaW9uIG1hZGUgYnlcclxuICB0aGlzLnZlcnNpb24gPSBpbnB1dFtpcCsrXTtcclxuICB0aGlzLm9zID0gaW5wdXRbaXArK107XHJcblxyXG4gIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcclxuICB0aGlzLm5lZWRWZXJzaW9uID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZ1xyXG4gIHRoaXMuZmxhZ3MgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gY29tcHJlc3Npb24gbWV0aG9kXHJcbiAgdGhpcy5jb21wcmVzc2lvbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBsYXN0IG1vZCBmaWxlIHRpbWVcclxuICB0aGlzLnRpbWUgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy9sYXN0IG1vZCBmaWxlIGRhdGVcclxuICB0aGlzLmRhdGUgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gY3JjLTMyXHJcbiAgdGhpcy5jcmMzMiA9IChcclxuICAgIChpbnB1dFtpcCsrXSAgICAgICkgfCAoaW5wdXRbaXArK10gPDwgIDgpIHxcclxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXHJcbiAgKSA+Pj4gMDtcclxuXHJcbiAgLy8gY29tcHJlc3NlZCBzaXplXHJcbiAgdGhpcy5jb21wcmVzc2VkU2l6ZSA9IChcclxuICAgIChpbnB1dFtpcCsrXSAgICAgICkgfCAoaW5wdXRbaXArK10gPDwgIDgpIHxcclxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXHJcbiAgKSA+Pj4gMDtcclxuXHJcbiAgLy8gdW5jb21wcmVzc2VkIHNpemVcclxuICB0aGlzLnBsYWluU2l6ZSA9IChcclxuICAgIChpbnB1dFtpcCsrXSAgICAgICkgfCAoaW5wdXRbaXArK10gPDwgIDgpIHxcclxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXHJcbiAgKSA+Pj4gMDtcclxuXHJcbiAgLy8gZmlsZSBuYW1lIGxlbmd0aFxyXG4gIHRoaXMuZmlsZU5hbWVMZW5ndGggPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXHJcbiAgdGhpcy5leHRyYUZpZWxkTGVuZ3RoID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGZpbGUgY29tbWVudCBsZW5ndGhcclxuICB0aGlzLmZpbGVDb21tZW50TGVuZ3RoID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGRpc2sgbnVtYmVyIHN0YXJ0XHJcbiAgdGhpcy5kaXNrTnVtYmVyU3RhcnQgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gaW50ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXHJcbiAgdGhpcy5pbnRlcm5hbEZpbGVBdHRyaWJ1dGVzID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGV4dGVybmFsIGZpbGUgYXR0cmlidXRlc1xyXG4gIHRoaXMuZXh0ZXJuYWxGaWxlQXR0cmlidXRlcyA9XHJcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XHJcbiAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KTtcclxuXHJcbiAgLy8gcmVsYXRpdmUgb2Zmc2V0IG9mIGxvY2FsIGhlYWRlclxyXG4gIHRoaXMucmVsYXRpdmVPZmZzZXQgPSAoXHJcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XHJcbiAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KVxyXG4gICkgPj4+IDA7XHJcblxyXG4gIC8vIGZpbGUgbmFtZVxyXG4gIHRoaXMuZmlsZW5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIFVTRV9UWVBFREFSUkFZID9cclxuICAgIGlucHV0LnN1YmFycmF5KGlwLCBpcCArPSB0aGlzLmZpbGVOYW1lTGVuZ3RoKSA6XHJcbiAgICBpbnB1dC5zbGljZShpcCwgaXAgKz0gdGhpcy5maWxlTmFtZUxlbmd0aClcclxuICApO1xyXG5cclxuICAvLyBleHRyYSBmaWVsZFxyXG4gIHRoaXMuZXh0cmFGaWVsZCA9IFVTRV9UWVBFREFSUkFZID9cclxuICAgIGlucHV0LnN1YmFycmF5KGlwLCBpcCArPSB0aGlzLmV4dHJhRmllbGRMZW5ndGgpIDpcclxuICAgIGlucHV0LnNsaWNlKGlwLCBpcCArPSB0aGlzLmV4dHJhRmllbGRMZW5ndGgpO1xyXG5cclxuICAvLyBmaWxlIGNvbW1lbnRcclxuICB0aGlzLmNvbW1lbnQgPSBVU0VfVFlQRURBUlJBWSA/XHJcbiAgICBpbnB1dC5zdWJhcnJheShpcCwgaXAgKyB0aGlzLmZpbGVDb21tZW50TGVuZ3RoKSA6XHJcbiAgICBpbnB1dC5zbGljZShpcCwgaXAgKyB0aGlzLmZpbGVDb21tZW50TGVuZ3RoKTtcclxuXHJcbiAgdGhpcy5sZW5ndGggPSBpcCAtIHRoaXMub2Zmc2V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gaXAgaW5wdXQgcG9zaXRpb24uXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXIgPSBmdW5jdGlvbihpbnB1dCwgaXApIHtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdGhpcy5pbnB1dCA9IGlucHV0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMub2Zmc2V0ID0gaXA7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5sZW5ndGg7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5uZWVkVmVyc2lvbjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmZsYWdzO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuY29tcHJlc3Npb247XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy50aW1lO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuZGF0ZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmNyYzMyO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuY29tcHJlc3NlZFNpemU7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5wbGFpblNpemU7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5maWxlTmFtZUxlbmd0aDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmV4dHJhRmllbGRMZW5ndGg7XHJcbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXHJcbiAgdGhpcy5maWxlbmFtZTtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdGhpcy5leHRyYUZpZWxkO1xyXG59O1xyXG5cclxuWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXIuRmxhZ3MgPSBabGliLlppcC5GbGFncztcclxuXHJcblpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKCkge1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpcCA9IHRoaXMub2Zmc2V0O1xyXG5cclxuICAvLyBsb2NhbCBmaWxlIGhlYWRlciBzaWduYXR1cmVcclxuICBpZiAoaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlWzBdIHx8XHJcbiAgICAgIGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZVsxXSB8fFxyXG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXJTaWduYXR1cmVbMl0gfHxcclxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlWzNdKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgbG9jYWwgZmlsZSBoZWFkZXIgc2lnbmF0dXJlJyk7XHJcbiAgfVxyXG5cclxuICAvLyB2ZXJzaW9uIG5lZWRlZCB0byBleHRyYWN0XHJcbiAgdGhpcy5uZWVkVmVyc2lvbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBnZW5lcmFsIHB1cnBvc2UgYml0IGZsYWdcclxuICB0aGlzLmZsYWdzID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxyXG4gIHRoaXMuY29tcHJlc3Npb24gPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gbGFzdCBtb2QgZmlsZSB0aW1lXHJcbiAgdGhpcy50aW1lID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vbGFzdCBtb2QgZmlsZSBkYXRlXHJcbiAgdGhpcy5kYXRlID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGNyYy0zMlxyXG4gIHRoaXMuY3JjMzIgPSAoXHJcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XHJcbiAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KVxyXG4gICkgPj4+IDA7XHJcblxyXG4gIC8vIGNvbXByZXNzZWQgc2l6ZVxyXG4gIHRoaXMuY29tcHJlc3NlZFNpemUgPSAoXHJcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XHJcbiAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KVxyXG4gICkgPj4+IDA7XHJcblxyXG4gIC8vIHVuY29tcHJlc3NlZCBzaXplXHJcbiAgdGhpcy5wbGFpblNpemUgPSAoXHJcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XHJcbiAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KVxyXG4gICkgPj4+IDA7XHJcblxyXG4gIC8vIGZpbGUgbmFtZSBsZW5ndGhcclxuICB0aGlzLmZpbGVOYW1lTGVuZ3RoID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGV4dHJhIGZpZWxkIGxlbmd0aFxyXG4gIHRoaXMuZXh0cmFGaWVsZExlbmd0aCA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBmaWxlIG5hbWVcclxuICB0aGlzLmZpbGVuYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBVU0VfVFlQRURBUlJBWSA/XHJcbiAgICBpbnB1dC5zdWJhcnJheShpcCwgaXAgKz0gdGhpcy5maWxlTmFtZUxlbmd0aCkgOlxyXG4gICAgaW5wdXQuc2xpY2UoaXAsIGlwICs9IHRoaXMuZmlsZU5hbWVMZW5ndGgpXHJcbiAgKTtcclxuXHJcbiAgLy8gZXh0cmEgZmllbGRcclxuICB0aGlzLmV4dHJhRmllbGQgPSBVU0VfVFlQRURBUlJBWSA/XHJcbiAgICBpbnB1dC5zdWJhcnJheShpcCwgaXAgKz0gdGhpcy5leHRyYUZpZWxkTGVuZ3RoKSA6XHJcbiAgICBpbnB1dC5zbGljZShpcCwgaXAgKz0gdGhpcy5leHRyYUZpZWxkTGVuZ3RoKTtcclxuXHJcbiAgdGhpcy5sZW5ndGggPSBpcCAtIHRoaXMub2Zmc2V0O1xyXG59O1xyXG5cclxuXHJcblpsaWIuVW56aXAucHJvdG90eXBlLnNlYXJjaEVuZE9mQ2VudHJhbERpcmVjdG9yeVJlY29yZCA9IGZ1bmN0aW9uKCkge1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpcDtcclxuXHJcbiAgZm9yIChpcCA9IGlucHV0Lmxlbmd0aCAtIDEyOyBpcCA+IDA7IC0taXApIHtcclxuICAgIGlmIChpbnB1dFtpcCAgXSA9PT0gWmxpYi5VbnppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzBdICYmXHJcbiAgICAgICAgaW5wdXRbaXArMV0gPT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVsxXSAmJlxyXG4gICAgICAgIGlucHV0W2lwKzJdID09PSBabGliLlVuemlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbMl0gJiZcclxuICAgICAgICBpbnB1dFtpcCszXSA9PT0gWmxpYi5VbnppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzNdKSB7XHJcbiAgICAgIHRoaXMuZW9jZHJPZmZzZXQgPSBpcDtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdGhyb3cgbmV3IEVycm9yKCdFbmQgb2YgQ2VudHJhbCBEaXJlY3RvcnkgUmVjb3JkIG5vdCBmb3VuZCcpO1xyXG59O1xyXG5cclxuWmxpYi5VbnppcC5wcm90b3R5cGUucGFyc2VFbmRPZkNlbnRyYWxEaXJlY3RvcnlSZWNvcmQgPSBmdW5jdGlvbigpIHtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaXA7XHJcblxyXG4gIGlmICghdGhpcy5lb2Nkck9mZnNldCkge1xyXG4gICAgdGhpcy5zZWFyY2hFbmRPZkNlbnRyYWxEaXJlY3RvcnlSZWNvcmQoKTtcclxuICB9XHJcbiAgaXAgPSB0aGlzLmVvY2RyT2Zmc2V0O1xyXG5cclxuICAvLyBzaWduYXR1cmVcclxuICBpZiAoaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVswXSB8fFxyXG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzFdIHx8XHJcbiAgICAgIGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbMl0gfHxcclxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVszXSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHNpZ25hdHVyZScpO1xyXG4gIH1cclxuXHJcbiAgLy8gbnVtYmVyIG9mIHRoaXMgZGlza1xyXG4gIHRoaXMubnVtYmVyT2ZUaGlzRGlzayA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBudW1iZXIgb2YgdGhlIGRpc2sgd2l0aCB0aGUgc3RhcnQgb2YgdGhlIGNlbnRyYWwgZGlyZWN0b3J5XHJcbiAgdGhpcy5zdGFydERpc2sgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXMgaW4gdGhlIGNlbnRyYWwgZGlyZWN0b3J5IG9uIHRoaXMgZGlza1xyXG4gIHRoaXMudG90YWxFbnRyaWVzVGhpc0Rpc2sgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXMgaW4gdGhlIGNlbnRyYWwgZGlyZWN0b3J5XHJcbiAgdGhpcy50b3RhbEVudHJpZXMgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gc2l6ZSBvZiB0aGUgY2VudHJhbCBkaXJlY3RvcnlcclxuICB0aGlzLmNlbnRyYWxEaXJlY3RvcnlTaXplID0gKFxyXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxyXG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcclxuICApID4+PiAwO1xyXG5cclxuICAvLyBvZmZzZXQgb2Ygc3RhcnQgb2YgY2VudHJhbCBkaXJlY3Rvcnkgd2l0aCByZXNwZWN0IHRvIHRoZSBzdGFydGluZyBkaXNrIG51bWJlclxyXG4gIHRoaXMuY2VudHJhbERpcmVjdG9yeU9mZnNldCA9IChcclxuICAgIChpbnB1dFtpcCsrXSAgICAgICkgfCAoaW5wdXRbaXArK10gPDwgIDgpIHxcclxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXHJcbiAgKSA+Pj4gMDtcclxuXHJcbiAgLy8gLlpJUCBmaWxlIGNvbW1lbnQgbGVuZ3RoXHJcbiAgdGhpcy5jb21tZW50TGVuZ3RoID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIC5aSVAgZmlsZSBjb21tZW50XHJcbiAgdGhpcy5jb21tZW50ID0gVVNFX1RZUEVEQVJSQVkgP1xyXG4gICAgaW5wdXQuc3ViYXJyYXkoaXAsIGlwICsgdGhpcy5jb21tZW50TGVuZ3RoKSA6XHJcbiAgICBpbnB1dC5zbGljZShpcCwgaXAgKyB0aGlzLmNvbW1lbnRMZW5ndGgpO1xyXG59O1xyXG5cclxuWmxpYi5VbnppcC5wcm90b3R5cGUucGFyc2VGaWxlSGVhZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgLyoqIEB0eXBlIHtBcnJheS48WmxpYi5VbnppcC5GaWxlSGVhZGVyPn0gKi9cclxuICB2YXIgZmlsZWxpc3QgPSBbXTtcclxuICAvKiogQHR5cGUge09iamVjdC48c3RyaW5nLCBudW1iZXI+fSAqL1xyXG4gIHZhciBmaWxldGFibGUgPSB7fTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaXA7XHJcbiAgLyoqIEB0eXBlIHtabGliLlVuemlwLkZpbGVIZWFkZXJ9ICovXHJcbiAgdmFyIGZpbGVIZWFkZXI7XHJcbiAgLyo6IEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGk7XHJcbiAgLyo6IEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGlsO1xyXG5cclxuICBpZiAodGhpcy5maWxlSGVhZGVyTGlzdCkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKHRoaXMuY2VudHJhbERpcmVjdG9yeU9mZnNldCA9PT0gdm9pZCAwKSB7XHJcbiAgICB0aGlzLnBhcnNlRW5kT2ZDZW50cmFsRGlyZWN0b3J5UmVjb3JkKCk7XHJcbiAgfVxyXG4gIGlwID0gdGhpcy5jZW50cmFsRGlyZWN0b3J5T2Zmc2V0O1xyXG5cclxuICBmb3IgKGkgPSAwLCBpbCA9IHRoaXMudG90YWxFbnRyaWVzOyBpIDwgaWw7ICsraSkge1xyXG4gICAgZmlsZUhlYWRlciA9IG5ldyBabGliLlVuemlwLkZpbGVIZWFkZXIodGhpcy5pbnB1dCwgaXApO1xyXG4gICAgZmlsZUhlYWRlci5wYXJzZSgpO1xyXG4gICAgaXAgKz0gZmlsZUhlYWRlci5sZW5ndGg7XHJcbiAgICBmaWxlbGlzdFtpXSA9IGZpbGVIZWFkZXI7XHJcbiAgICBmaWxldGFibGVbZmlsZUhlYWRlci5maWxlbmFtZV0gPSBpO1xyXG4gIH1cclxuXHJcbiAgaWYgKHRoaXMuY2VudHJhbERpcmVjdG9yeVNpemUgPCBpcCAtIHRoaXMuY2VudHJhbERpcmVjdG9yeU9mZnNldCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpbGUgaGVhZGVyIHNpemUnKTtcclxuICB9XHJcblxyXG4gIHRoaXMuZmlsZUhlYWRlckxpc3QgPSBmaWxlbGlzdDtcclxuICB0aGlzLmZpbGVuYW1lVG9JbmRleCA9IGZpbGV0YWJsZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gaW5kZXggZmlsZSBoZWFkZXIgaW5kZXguXHJcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtc1xyXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBmaWxlIGRhdGEuXHJcbiAqL1xyXG5abGliLlVuemlwLnByb3RvdHlwZS5nZXRGaWxlRGF0YSA9IGZ1bmN0aW9uKGluZGV4LCBvcHRfcGFyYW1zKSB7XHJcbiAgb3B0X3BhcmFtcyA9IG9wdF9wYXJhbXMgfHwge307XHJcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XHJcbiAgLyoqIEB0eXBlIHtBcnJheS48WmxpYi5VbnppcC5GaWxlSGVhZGVyPn0gKi9cclxuICB2YXIgZmlsZUhlYWRlckxpc3QgPSB0aGlzLmZpbGVIZWFkZXJMaXN0O1xyXG4gIC8qKiBAdHlwZSB7WmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXJ9ICovXHJcbiAgdmFyIGxvY2FsRmlsZUhlYWRlcjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgb2Zmc2V0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBsZW5ndGg7XHJcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHZhciBidWZmZXI7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGNyYzMyO1xyXG4gIC8qKiBAdHlwZSB7QXJyYXkuPG51bWJlcj58VWludDMyQXJyYXl8T2JqZWN0fSAqL1xyXG4gIHZhciBrZXk7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGk7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGlsO1xyXG5cclxuICBpZiAoIWZpbGVIZWFkZXJMaXN0KSB7XHJcbiAgICB0aGlzLnBhcnNlRmlsZUhlYWRlcigpO1xyXG4gIH1cclxuXHJcbiAgaWYgKGZpbGVIZWFkZXJMaXN0W2luZGV4XSA9PT0gdm9pZCAwKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3dyb25nIGluZGV4Jyk7XHJcbiAgfVxyXG5cclxuICBvZmZzZXQgPSBmaWxlSGVhZGVyTGlzdFtpbmRleF0ucmVsYXRpdmVPZmZzZXQ7XHJcbiAgbG9jYWxGaWxlSGVhZGVyID0gbmV3IFpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyKHRoaXMuaW5wdXQsIG9mZnNldCk7XHJcbiAgbG9jYWxGaWxlSGVhZGVyLnBhcnNlKCk7XHJcbiAgb2Zmc2V0ICs9IGxvY2FsRmlsZUhlYWRlci5sZW5ndGg7XHJcbiAgbGVuZ3RoID0gbG9jYWxGaWxlSGVhZGVyLmNvbXByZXNzZWRTaXplO1xyXG5cclxuICAvLyBkZWNyeXB0aW9uXHJcbiAgaWYgKChsb2NhbEZpbGVIZWFkZXIuZmxhZ3MgJiBabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlci5GbGFncy5FTkNSWVBUKSAhPT0gMCkge1xyXG4gICAgaWYgKCEob3B0X3BhcmFtc1sncGFzc3dvcmQnXSB8fCB0aGlzLnBhc3N3b3JkKSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3BsZWFzZSBzZXQgcGFzc3dvcmQnKTtcclxuICAgIH1cclxuICAgIGtleSA9ICB0aGlzLmNyZWF0ZURlY3J5cHRpb25LZXkob3B0X3BhcmFtc1sncGFzc3dvcmQnXSB8fCB0aGlzLnBhc3N3b3JkKTtcclxuXHJcbiAgICAvLyBlbmNyeXB0aW9uIGhlYWRlclxyXG4gICAgZm9yKGkgPSBvZmZzZXQsIGlsID0gb2Zmc2V0ICsgMTI7IGkgPCBpbDsgKytpKSB7XHJcbiAgICAgIHRoaXMuZGVjb2RlKGtleSwgaW5wdXRbaV0pO1xyXG4gICAgfVxyXG4gICAgb2Zmc2V0ICs9IDEyO1xyXG4gICAgbGVuZ3RoIC09IDEyO1xyXG5cclxuICAgIC8vIGRlY3J5cHRpb25cclxuICAgIGZvciAoaSA9IG9mZnNldCwgaWwgPSBvZmZzZXQgKyBsZW5ndGg7IGkgPCBpbDsgKytpKSB7XHJcbiAgICAgIGlucHV0W2ldID0gdGhpcy5kZWNvZGUoa2V5LCBpbnB1dFtpXSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzd2l0Y2ggKGxvY2FsRmlsZUhlYWRlci5jb21wcmVzc2lvbikge1xyXG4gICAgY2FzZSBabGliLlVuemlwLkNvbXByZXNzaW9uTWV0aG9kLlNUT1JFOlxyXG4gICAgICBidWZmZXIgPSBVU0VfVFlQRURBUlJBWSA/XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zdWJhcnJheShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCkgOlxyXG4gICAgICAgIHRoaXMuaW5wdXQuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBsZW5ndGgpO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgWmxpYi5VbnppcC5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxyXG4gICAgICBidWZmZXIgPSBuZXcgWmxpYi5SYXdJbmZsYXRlKHRoaXMuaW5wdXQsIHtcclxuICAgICAgICAnaW5kZXgnOiBvZmZzZXQsXHJcbiAgICAgICAgJ2J1ZmZlclNpemUnOiBsb2NhbEZpbGVIZWFkZXIucGxhaW5TaXplXHJcbiAgICAgIH0pLmRlY29tcHJlc3MoKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gY29tcHJlc3Npb24gdHlwZScpO1xyXG4gIH1cclxuXHJcbiAgaWYgKHRoaXMudmVyaWZ5KSB7XHJcbiAgICBjcmMzMiA9IFpsaWIuQ1JDMzIuY2FsYyhidWZmZXIpO1xyXG4gICAgaWYgKGxvY2FsRmlsZUhlYWRlci5jcmMzMiAhPT0gY3JjMzIpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICd3cm9uZyBjcmM6IGZpbGU9MHgnICsgbG9jYWxGaWxlSGVhZGVyLmNyYzMyLnRvU3RyaW5nKDE2KSArXHJcbiAgICAgICAgJywgZGF0YT0weCcgKyBjcmMzMi50b1N0cmluZygxNilcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBidWZmZXI7XHJcbn07XHJcblxyXG4vKipcclxuICogQHJldHVybiB7QXJyYXkuPHN0cmluZz59XHJcbiAqL1xyXG5abGliLlVuemlwLnByb3RvdHlwZS5nZXRGaWxlbmFtZXMgPSBmdW5jdGlvbigpIHtcclxuICAvKiogQHR5cGUge0FycmF5LjxzdHJpbmc+fSAqL1xyXG4gIHZhciBmaWxlbmFtZUxpc3QgPSBbXTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaWw7XHJcbiAgLyoqIEB0eXBlIHtBcnJheS48WmxpYi5VbnppcC5GaWxlSGVhZGVyPn0gKi9cclxuICB2YXIgZmlsZUhlYWRlckxpc3Q7XHJcblxyXG4gIGlmICghdGhpcy5maWxlSGVhZGVyTGlzdCkge1xyXG4gICAgdGhpcy5wYXJzZUZpbGVIZWFkZXIoKTtcclxuICB9XHJcbiAgZmlsZUhlYWRlckxpc3QgPSB0aGlzLmZpbGVIZWFkZXJMaXN0O1xyXG5cclxuICBmb3IgKGkgPSAwLCBpbCA9IGZpbGVIZWFkZXJMaXN0Lmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcclxuICAgIGZpbGVuYW1lTGlzdFtpXSA9IGZpbGVIZWFkZXJMaXN0W2ldLmZpbGVuYW1lO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZpbGVuYW1lTGlzdDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZW5hbWUgZXh0cmFjdCBmaWxlbmFtZS5cclxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zXHJcbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGRlY29tcHJlc3NlZCBkYXRhLlxyXG4gKi9cclxuWmxpYi5VbnppcC5wcm90b3R5cGUuZGVjb21wcmVzcyA9IGZ1bmN0aW9uKGZpbGVuYW1lLCBvcHRfcGFyYW1zKSB7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGluZGV4O1xyXG5cclxuICBpZiAoIXRoaXMuZmlsZW5hbWVUb0luZGV4KSB7XHJcbiAgICB0aGlzLnBhcnNlRmlsZUhlYWRlcigpO1xyXG4gIH1cclxuICBpbmRleCA9IHRoaXMuZmlsZW5hbWVUb0luZGV4W2ZpbGVuYW1lXTtcclxuXHJcbiAgaWYgKGluZGV4ID09PSB2b2lkIDApIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihmaWxlbmFtZSArICcgbm90IGZvdW5kJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcy5nZXRGaWxlRGF0YShpbmRleCwgb3B0X3BhcmFtcyk7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IHBhc3N3b3JkXHJcbiAqL1xyXG5abGliLlVuemlwLnByb3RvdHlwZS5zZXRQYXNzd29yZCA9IGZ1bmN0aW9uKHBhc3N3b3JkKSB7XHJcbiAgdGhpcy5wYXNzd29yZCA9IHBhc3N3b3JkO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5fE9iamVjdCl9IGtleVxyXG4gKiBAcGFyYW0ge251bWJlcn0gblxyXG4gKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAqL1xyXG5abGliLlVuemlwLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbihrZXksIG4pIHtcclxuICBuIF49IHRoaXMuZ2V0Qnl0ZSgvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovKGtleSkpO1xyXG4gIHRoaXMudXBkYXRlS2V5cygvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovKGtleSksIG4pO1xyXG5cclxuICByZXR1cm4gbjtcclxufTtcclxuXHJcbi8vIGNvbW1vbiBtZXRob2RcclxuWmxpYi5VbnppcC5wcm90b3R5cGUudXBkYXRlS2V5cyA9IFpsaWIuWmlwLnByb3RvdHlwZS51cGRhdGVLZXlzO1xyXG5abGliLlVuemlwLnByb3RvdHlwZS5jcmVhdGVEZWNyeXB0aW9uS2V5ID0gWmxpYi5aaXAucHJvdG90eXBlLmNyZWF0ZUVuY3J5cHRpb25LZXk7XHJcblpsaWIuVW56aXAucHJvdG90eXBlLmdldEJ5dGUgPSBabGliLlppcC5wcm90b3R5cGUuZ2V0Qnl0ZTtcclxuXHJcbi8vIGVuZCBvZiBzY29wZVxyXG59KTtcclxuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFpsaWIgbmFtZXNwYWNlLiBabGliIOOBruS7leanmOOBq+a6luaLoOOBl+OBn+Wcp+e4ruOBryBabGliLkRlZmxhdGUg44Gn5a6f6KOFXG4gKiDjgZXjgozjgabjgYTjgosuIOOBk+OCjOOBryBJbmZsYXRlIOOBqOOBruWFseWtmOOCkuiAg+aFruOBl+OBpuOBhOOCi+eCui5cbiAqL1xuXG5nb29nLnByb3ZpZGUoJ1psaWInKTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIENvbXByZXNzaW9uIE1ldGhvZFxuICogQGVudW0ge251bWJlcn1cbiAqL1xuWmxpYi5Db21wcmVzc2lvbk1ldGhvZCA9IHtcbiAgREVGTEFURTogOCxcbiAgUkVTRVJWRUQ6IDE1XG59O1xuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuXG4vKiB2aW06c2V0IGV4cGFuZHRhYiB0cz0yIHN3PTIgdHc9ODA6ICovXG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGVmbGF0ZSAoUkZDMTk1MSkg5a6f6KOFLlxuICogRGVmbGF0ZeOCouODq+OCtOODquOCuuODoOacrOS9k+OBryBabGliLlJhd0RlZmxhdGUg44Gn5a6f6KOF44GV44KM44Gm44GE44KLLlxuICovXG5nb29nLnByb3ZpZGUoJ1psaWIuRGVmbGF0ZScpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5nb29nLnJlcXVpcmUoJ1psaWInKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5BZGxlcjMyJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuUmF3RGVmbGF0ZScpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIFpsaWIgRGVmbGF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0geyEoQXJyYXl8VWludDhBcnJheSl9IGlucHV0IOespuWPt+WMluOBmeOCi+WvvuixoeOBriBieXRlIGFycmF5LlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICovXG5abGliLkRlZmxhdGUgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9ICovXG4gIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSAqL1xuICB0aGlzLm91dHB1dCA9XG4gICAgbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoWmxpYi5EZWZsYXRlLkRlZmF1bHRCdWZmZXJTaXplKTtcbiAgLyoqIEB0eXBlIHtabGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlfSAqL1xuICB0aGlzLmNvbXByZXNzaW9uVHlwZSA9IFpsaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRFlOQU1JQztcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGV9ICovXG4gIHRoaXMucmF3RGVmbGF0ZTtcbiAgLyoqIEB0eXBlIHtPYmplY3R9ICovXG4gIHZhciByYXdEZWZsYXRlT3B0aW9uID0ge307XG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICB2YXIgcHJvcDtcblxuICAvLyBvcHRpb24gcGFyYW1ldGVyc1xuICBpZiAob3B0X3BhcmFtcyB8fCAhKG9wdF9wYXJhbXMgPSB7fSkpIHtcbiAgICBpZiAodHlwZW9mIG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uVHlwZSddID09PSAnbnVtYmVyJykge1xuICAgICAgdGhpcy5jb21wcmVzc2lvblR5cGUgPSBvcHRfcGFyYW1zWydjb21wcmVzc2lvblR5cGUnXTtcbiAgICB9XG4gIH1cblxuICAvLyBjb3B5IG9wdGlvbnNcbiAgZm9yIChwcm9wIGluIG9wdF9wYXJhbXMpIHtcbiAgICByYXdEZWZsYXRlT3B0aW9uW3Byb3BdID0gb3B0X3BhcmFtc1twcm9wXTtcbiAgfVxuXG4gIC8vIHNldCByYXctZGVmbGF0ZSBvdXRwdXQgYnVmZmVyXG4gIHJhd0RlZmxhdGVPcHRpb25bJ291dHB1dEJ1ZmZlciddID0gdGhpcy5vdXRwdXQ7XG5cbiAgdGhpcy5yYXdEZWZsYXRlID0gbmV3IFpsaWIuUmF3RGVmbGF0ZSh0aGlzLmlucHV0LCByYXdEZWZsYXRlT3B0aW9uKTtcbn07XG5cbi8qKlxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfSDjg4fjg5Xjgqnjg6vjg4jjg5Djg4Pjg5XjgqHjgrXjgqTjgrouXG4gKi9cblpsaWIuRGVmbGF0ZS5EZWZhdWx0QnVmZmVyU2l6ZSA9IDB4ODAwMDtcblxuLyoqXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5abGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlID0gWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZTtcblxuLyoqXG4gKiDnm7TmjqXlnKfnuK7jgavmjpvjgZHjgosuXG4gKiBAcGFyYW0geyEoQXJyYXl8VWludDhBcnJheSl9IGlucHV0IHRhcmdldCBidWZmZXIuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9uIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBjb21wcmVzc2VkIGRhdGEgYnl0ZSBhcnJheS5cbiAqL1xuWmxpYi5EZWZsYXRlLmNvbXByZXNzID0gZnVuY3Rpb24oaW5wdXQsIG9wdF9wYXJhbXMpIHtcbiAgcmV0dXJuIChuZXcgWmxpYi5EZWZsYXRlKGlucHV0LCBvcHRfcGFyYW1zKSkuY29tcHJlc3MoKTtcbn07XG5cbi8qKlxuICogRGVmbGF0ZSBDb21wcmVzc2lvbi5cbiAqIEByZXR1cm4geyEoQXJyYXl8VWludDhBcnJheSl9IGNvbXByZXNzZWQgZGF0YSBieXRlIGFycmF5LlxuICovXG5abGliLkRlZmxhdGUucHJvdG90eXBlLmNvbXByZXNzID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7WmxpYi5Db21wcmVzc2lvbk1ldGhvZH0gKi9cbiAgdmFyIGNtO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNpbmZvO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNtZjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBmbGc7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgZmNoZWNrO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGZkaWN0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGZsZXZlbDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBjbGV2ZWw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgYWRsZXI7XG4gIC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cbiAgdmFyIGVycm9yID0gZmFsc2U7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gKi9cbiAgdmFyIG91dHB1dDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBwb3MgPSAwO1xuXG4gIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuXG4gIC8vIENvbXByZXNzaW9uIE1ldGhvZCBhbmQgRmxhZ3NcbiAgY20gPSBabGliLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU7XG4gIHN3aXRjaCAoY20pIHtcbiAgICBjYXNlIFpsaWIuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTpcbiAgICAgIGNpbmZvID0gTWF0aC5MT0cyRSAqIE1hdGgubG9nKFpsaWIuUmF3RGVmbGF0ZS5XaW5kb3dTaXplKSAtIDg7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGNvbXByZXNzaW9uIG1ldGhvZCcpO1xuICB9XG4gIGNtZiA9IChjaW5mbyA8PCA0KSB8IGNtO1xuICBvdXRwdXRbcG9zKytdID0gY21mO1xuXG4gIC8vIEZsYWdzXG4gIGZkaWN0ID0gMDtcbiAgc3dpdGNoIChjbSkge1xuICAgIGNhc2UgWmxpYi5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxuICAgICAgc3dpdGNoICh0aGlzLmNvbXByZXNzaW9uVHlwZSkge1xuICAgICAgICBjYXNlIFpsaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuTk9ORTogZmxldmVsID0gMDsgYnJlYWs7XG4gICAgICAgIGNhc2UgWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5GSVhFRDogZmxldmVsID0gMTsgYnJlYWs7XG4gICAgICAgIGNhc2UgWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5EWU5BTUlDOiBmbGV2ZWwgPSAyOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBjb21wcmVzc2lvbiB0eXBlJyk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGNvbXByZXNzaW9uIG1ldGhvZCcpO1xuICB9XG4gIGZsZyA9IChmbGV2ZWwgPDwgNikgfCAoZmRpY3QgPDwgNSk7XG4gIGZjaGVjayA9IDMxIC0gKGNtZiAqIDI1NiArIGZsZykgJSAzMTtcbiAgZmxnIHw9IGZjaGVjaztcbiAgb3V0cHV0W3BvcysrXSA9IGZsZztcblxuICAvLyBBZGxlci0zMiBjaGVja3N1bVxuICBhZGxlciA9IFpsaWIuQWRsZXIzMih0aGlzLmlucHV0KTtcblxuICB0aGlzLnJhd0RlZmxhdGUub3AgPSBwb3M7XG4gIG91dHB1dCA9IHRoaXMucmF3RGVmbGF0ZS5jb21wcmVzcygpO1xuICBwb3MgPSBvdXRwdXQubGVuZ3RoO1xuXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIC8vIHN1YmFycmF5IOWIhuOCkuWFg+OBq+OCguOBqeOBmVxuICAgIG91dHB1dCA9IG5ldyBVaW50OEFycmF5KG91dHB1dC5idWZmZXIpO1xuICAgIC8vIGV4cGFuZCBidWZmZXJcbiAgICBpZiAob3V0cHV0Lmxlbmd0aCA8PSBwb3MgKyA0KSB7XG4gICAgICB0aGlzLm91dHB1dCA9IG5ldyBVaW50OEFycmF5KG91dHB1dC5sZW5ndGggKyA0KTtcbiAgICAgIHRoaXMub3V0cHV0LnNldChvdXRwdXQpO1xuICAgICAgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gICAgfVxuICAgIG91dHB1dCA9IG91dHB1dC5zdWJhcnJheSgwLCBwb3MgKyA0KTtcbiAgfVxuXG4gIC8vIGFkbGVyMzJcbiAgb3V0cHV0W3BvcysrXSA9IChhZGxlciA+PiAyNCkgJiAweGZmO1xuICBvdXRwdXRbcG9zKytdID0gKGFkbGVyID4+IDE2KSAmIDB4ZmY7XG4gIG91dHB1dFtwb3MrK10gPSAoYWRsZXIgPj4gIDgpICYgMHhmZjtcbiAgb3V0cHV0W3BvcysrXSA9IChhZGxlciAgICAgICkgJiAweGZmO1xuXG4gIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuXG4vKiB2aW06c2V0IGV4cGFuZHRhYiB0cz0yIHN3PTIgdHc9ODA6ICovXG4iLCJnb29nLnByb3ZpZGUoJ1psaWIuZXhwb3J0T2JqZWN0Jyk7XG5cbmdvb2cucmVxdWlyZSgnWmxpYicpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG5abGliLmV4cG9ydE9iamVjdCA9IGZ1bmN0aW9uKGVudW1TdHJpbmcsIGV4cG9ydEtleVZhbHVlKSB7XG4gIC8qKiBAdHlwZSB7QXJyYXkuPHN0cmluZz59ICovXG4gIHZhciBrZXlzO1xuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgdmFyIGtleTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlsO1xuXG4gIGlmIChPYmplY3Qua2V5cykge1xuICAgIGtleXMgPSBPYmplY3Qua2V5cyhleHBvcnRLZXlWYWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAga2V5cyA9IFtdO1xuICAgIGkgPSAwO1xuICAgIGZvciAoa2V5IGluIGV4cG9ydEtleVZhbHVlKSB7XG4gICAgICBrZXlzW2krK10gPSBrZXk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChpID0gMCwgaWwgPSBrZXlzLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICBrZXkgPSBrZXlzW2ldO1xuICAgIGdvb2cuZXhwb3J0U3ltYm9sKGVudW1TdHJpbmcgKyAnLicgKyBrZXksIGV4cG9ydEtleVZhbHVlW2tleV0pXG4gIH1cbn07XG5cbn0pOyIsImdvb2cucHJvdmlkZSgnWmxpYi5JbmZsYXRlU3RyZWFtJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYicpO1xuLy9nb29nLnJlcXVpcmUoJ1psaWIuQWRsZXIzMicpO1xuZ29vZy5yZXF1aXJlKCdabGliLlJhd0luZmxhdGVTdHJlYW0nKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBAcGFyYW0geyEoVWludDhBcnJheXxBcnJheSl9IGlucHV0IGRlZmxhdGVkIGJ1ZmZlci5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5abGliLkluZmxhdGVTdHJlYW0gPSBmdW5jdGlvbihpbnB1dCkge1xuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheSl9ICovXG4gIHRoaXMuaW5wdXQgPSBpbnB1dCA9PT0gdm9pZCAwID8gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoKSA6IGlucHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5pcCA9IDA7XG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdJbmZsYXRlU3RyZWFtfSAqL1xuICB0aGlzLnJhd2luZmxhdGUgPSBuZXcgWmxpYi5SYXdJbmZsYXRlU3RyZWFtKHRoaXMuaW5wdXQsIHRoaXMuaXApO1xuICAvKiogQHR5cGUge1psaWIuQ29tcHJlc3Npb25NZXRob2R9ICovXG4gIHRoaXMubWV0aG9kO1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9ICovXG4gIHRoaXMub3V0cHV0ID0gdGhpcy5yYXdpbmZsYXRlLm91dHB1dDtcbn07XG5cbi8qKlxuICogZGVjb21wcmVzcy5cbiAqIEByZXR1cm4geyEoVWludDhBcnJheXxBcnJheSl9IGluZmxhdGVkIGJ1ZmZlci5cbiAqL1xuWmxpYi5JbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5kZWNvbXByZXNzID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSBpbmZsYXRlZCBidWZmZXIuICovXG4gIHZhciBidWZmZXI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBhZGxlci0zMiBjaGVja3N1bSAqL1xuICB2YXIgYWRsZXIzMjtcblxuICAvLyDmlrDjgZfjgYTlhaXlipvjgpLlhaXlipvjg5Djg4Pjg5XjgqHjgavntZDlkIjjgZnjgotcbiAgLy8gWFhYIEFycmF5LCBVaW50OEFycmF5IOOBruODgeOCp+ODg+OCr+OCkuihjOOBhuOBi+eiuuiqjeOBmeOCi1xuICBpZiAoaW5wdXQgIT09IHZvaWQgMCkge1xuICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgICAgdmFyIHRtcCA9IG5ldyBVaW50OEFycmF5KHRoaXMuaW5wdXQubGVuZ3RoICsgaW5wdXQubGVuZ3RoKTtcbiAgICAgIHRtcC5zZXQodGhpcy5pbnB1dCwgMCk7XG4gICAgICB0bXAuc2V0KGlucHV0LCB0aGlzLmlucHV0Lmxlbmd0aCk7XG4gICAgICB0aGlzLmlucHV0ID0gdG1wO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmlucHV0ID0gdGhpcy5pbnB1dC5jb25jYXQoaW5wdXQpO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLm1ldGhvZCA9PT0gdm9pZCAwKSB7XG4gICAgaWYodGhpcy5yZWFkSGVhZGVyKCkgPCAwKSB7XG4gICAgICByZXR1cm4gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoKTtcbiAgICB9XG4gIH1cblxuICBidWZmZXIgPSB0aGlzLnJhd2luZmxhdGUuZGVjb21wcmVzcyh0aGlzLmlucHV0LCB0aGlzLmlwKTtcbiAgaWYgKHRoaXMucmF3aW5mbGF0ZS5pcCAhPT0gMCkge1xuICAgIHRoaXMuaW5wdXQgPSBVU0VfVFlQRURBUlJBWSA/XG4gICAgICB0aGlzLmlucHV0LnN1YmFycmF5KHRoaXMucmF3aW5mbGF0ZS5pcCkgOlxuICAgICAgdGhpcy5pbnB1dC5zbGljZSh0aGlzLnJhd2luZmxhdGUuaXApO1xuICAgIHRoaXMuaXAgPSAwO1xuICB9XG5cbiAgLy8gdmVyaWZ5IGFkbGVyLTMyXG4gIC8qXG4gIGlmICh0aGlzLnZlcmlmeSkge1xuICAgIGFkbGVyMzIgPVxuICAgICAgaW5wdXRbdGhpcy5pcCsrXSA8PCAyNCB8IGlucHV0W3RoaXMuaXArK10gPDwgMTYgfFxuICAgICAgaW5wdXRbdGhpcy5pcCsrXSA8PCA4IHwgaW5wdXRbdGhpcy5pcCsrXTtcblxuICAgIGlmIChhZGxlcjMyICE9PSBabGliLkFkbGVyMzIoYnVmZmVyKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGFkbGVyLTMyIGNoZWNrc3VtJyk7XG4gICAgfVxuICB9XG4gICovXG5cbiAgcmV0dXJuIGJ1ZmZlcjtcbn07XG5cbi8qKlxuICogQHJldHVybiB7IShVaW50OEFycmF5fEFycmF5KX0gY3VycmVudCBvdXRwdXQgYnVmZmVyLlxuICovXG5abGliLkluZmxhdGVTdHJlYW0ucHJvdG90eXBlLmdldEJ5dGVzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnJhd2luZmxhdGUuZ2V0Qnl0ZXMoKTtcbn07XG5cblpsaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucmVhZEhlYWRlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaXAgPSB0aGlzLmlwO1xuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuXG4gIC8vIENvbXByZXNzaW9uIE1ldGhvZCBhbmQgRmxhZ3NcbiAgdmFyIGNtZiA9IGlucHV0W2lwKytdO1xuICB2YXIgZmxnID0gaW5wdXRbaXArK107XG5cbiAgaWYgKGNtZiA9PT0gdm9pZCAwIHx8IGZsZyA9PT0gdm9pZCAwKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgLy8gY29tcHJlc3Npb24gbWV0aG9kXG4gIHN3aXRjaCAoY21mICYgMHgwZikge1xuICAgIGNhc2UgWmxpYi5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxuICAgICAgdGhpcy5tZXRob2QgPSBabGliLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBjb21wcmVzc2lvbiBtZXRob2QnKTtcbiAgfVxuXG4gIC8vIGZjaGVja1xuICBpZiAoKChjbWYgPDwgOCkgKyBmbGcpICUgMzEgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmNoZWNrIGZsYWc6JyArICgoY21mIDw8IDgpICsgZmxnKSAlIDMxKTtcbiAgfVxuXG4gIC8vIGZkaWN0IChub3Qgc3VwcG9ydGVkKVxuICBpZiAoZmxnICYgMHgyMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignZmRpY3QgZmxhZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gIH1cblxuICB0aGlzLmlwID0gaXA7XG59O1xuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuXG4vKiB2aW06c2V0IGV4cGFuZHRhYiB0cz0yIHN3PTIgdHc9ODA6ICovXG4iLCJnb29nLnJlcXVpcmUoJ1psaWIuQWRsZXIzMicpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5BZGxlcjMyJywgWmxpYi5BZGxlcjMyKTtcbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkFkbGVyMzIudXBkYXRlJywgWmxpYi5BZGxlcjMyLnVwZGF0ZSk7XG4iLCJnb29nLnJlcXVpcmUoJ1psaWIuQ1JDMzInKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuQ1JDMzInLCBabGliLkNSQzMyKTtcbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkNSQzMyLmNhbGMnLCBabGliLkNSQzMyLmNhbGMpO1xuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuQ1JDMzIudXBkYXRlJywgWmxpYi5DUkMzMi51cGRhdGUpOyIsImdvb2cucmVxdWlyZSgnWmxpYi5EZWZsYXRlJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuZXhwb3J0T2JqZWN0Jyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkRlZmxhdGUnLCBabGliLkRlZmxhdGUpO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkRlZmxhdGUuY29tcHJlc3MnLFxuICBabGliLkRlZmxhdGUuY29tcHJlc3Ncbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuRGVmbGF0ZS5wcm90b3R5cGUuY29tcHJlc3MnLFxuICBabGliLkRlZmxhdGUucHJvdG90eXBlLmNvbXByZXNzXG4pO1xuWmxpYi5leHBvcnRPYmplY3QoJ1psaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGUnLCB7XG4gICdOT05FJzogWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5OT05FLFxuICAnRklYRUQnOiBabGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkZJWEVELFxuICAnRFlOQU1JQyc6IFpsaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRFlOQU1JQ1xufSk7XG4iLCJnb29nLnJlcXVpcmUoJ1psaWIuR3VuemlwJyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkd1bnppcCcsIFpsaWIuR3VuemlwKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5HdW56aXAucHJvdG90eXBlLmRlY29tcHJlc3MnLFxuICBabGliLkd1bnppcC5wcm90b3R5cGUuZGVjb21wcmVzc1xuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5HdW56aXAucHJvdG90eXBlLmdldE1lbWJlcnMnLFxuICBabGliLkd1bnppcC5wcm90b3R5cGUuZ2V0TWVtYmVyc1xuKTtcbiIsImdvb2cucmVxdWlyZSgnWmxpYi5HdW56aXBNZW1iZXInKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuR3VuemlwTWVtYmVyJywgWmxpYi5HdW56aXBNZW1iZXIpO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TmFtZScsXG4gIFpsaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXROYW1lXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0RGF0YScsXG4gIFpsaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXREYXRhXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TXRpbWUnLFxuICBabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TXRpbWVcbik7IiwiZ29vZy5yZXF1aXJlKCdabGliLkd6aXAnKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuR3ppcCcsIFpsaWIuR3ppcCk7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuR3ppcC5wcm90b3R5cGUuY29tcHJlc3MnLFxuICBabGliLkd6aXAucHJvdG90eXBlLmNvbXByZXNzXG4pOyIsImdvb2cucmVxdWlyZSgnWmxpYi5JbmZsYXRlJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuZXhwb3J0T2JqZWN0Jyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkluZmxhdGUnLCBabGliLkluZmxhdGUpO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkluZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3MnLFxuICBabGliLkluZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3Ncbik7XG5abGliLmV4cG9ydE9iamVjdCgnWmxpYi5JbmZsYXRlLkJ1ZmZlclR5cGUnLCB7XG4gICdBREFQVElWRSc6IFpsaWIuSW5mbGF0ZS5CdWZmZXJUeXBlLkFEQVBUSVZFLFxuICAnQkxPQ0snOiBabGliLkluZmxhdGUuQnVmZmVyVHlwZS5CTE9DS1xufSk7XG4iLCJnb29nLnJlcXVpcmUoJ1psaWIuSW5mbGF0ZVN0cmVhbScpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5JbmZsYXRlU3RyZWFtJywgWmxpYi5JbmZsYXRlU3RyZWFtKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5JbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5kZWNvbXByZXNzJyxcbiAgWmxpYi5JbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5kZWNvbXByZXNzXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkluZmxhdGVTdHJlYW0ucHJvdG90eXBlLmdldEJ5dGVzJyxcbiAgWmxpYi5JbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5nZXRCeXRlc1xuKTsiLCJnb29nLnJlcXVpcmUoJ1psaWIuUmF3RGVmbGF0ZScpO1xuZ29vZy5yZXF1aXJlKCdabGliLmV4cG9ydE9iamVjdCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuUmF3RGVmbGF0ZScsXG4gIFpsaWIuUmF3RGVmbGF0ZVxuKTtcblxuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmNvbXByZXNzJyxcbiAgWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5jb21wcmVzc1xuKTtcblxuWmxpYi5leHBvcnRPYmplY3QoXG4gICdabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlJyxcbiAge1xuICAgICdOT05FJzogWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5OT05FLFxuICAgICdGSVhFRCc6IFpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRklYRUQsXG4gICAgJ0RZTkFNSUMnOiBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkRZTkFNSUNcbiAgfVxuKTtcbiIsImdvb2cucmVxdWlyZSgnWmxpYi5SYXdJbmZsYXRlJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuZXhwb3J0T2JqZWN0Jyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLlJhd0luZmxhdGUnLCBabGliLlJhd0luZmxhdGUpO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlJhd0luZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3MnLFxuICBabGliLlJhd0luZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3Ncbik7XG5abGliLmV4cG9ydE9iamVjdCgnWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUnLCB7XG4gICdBREFQVElWRSc6IFpsaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlLkFEQVBUSVZFLFxuICAnQkxPQ0snOiBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZS5CTE9DS1xufSk7XG4iLCJnb29nLnJlcXVpcmUoJ1psaWIuUmF3SW5mbGF0ZVN0cmVhbScpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5SYXdJbmZsYXRlU3RyZWFtJywgWmxpYi5SYXdJbmZsYXRlU3RyZWFtKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5kZWNvbXByZXNzJyxcbiAgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5kZWNvbXByZXNzXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmdldEJ5dGVzJyxcbiAgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5nZXRCeXRlc1xuKTsiLCJnb29nLnJlcXVpcmUoJ1psaWIuVW56aXAnKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuVW56aXAnLCBabGliLlVuemlwKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5VbnppcC5wcm90b3R5cGUuZGVjb21wcmVzcycsXG4gIFpsaWIuVW56aXAucHJvdG90eXBlLmRlY29tcHJlc3Ncbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuVW56aXAucHJvdG90eXBlLmdldEZpbGVuYW1lcycsXG4gIFpsaWIuVW56aXAucHJvdG90eXBlLmdldEZpbGVuYW1lc1xuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5VbnppcC5wcm90b3R5cGUuc2V0UGFzc3dvcmQnLFxuICBabGliLlVuemlwLnByb3RvdHlwZS5zZXRQYXNzd29yZFxuKTsiLCJnb29nLnJlcXVpcmUoJ1psaWIuWmlwJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuZXhwb3J0T2JqZWN0Jyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5aaXAnLFxuICBabGliLlppcFxuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5aaXAucHJvdG90eXBlLmFkZEZpbGUnLFxuICBabGliLlppcC5wcm90b3R5cGUuYWRkRmlsZVxuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5aaXAucHJvdG90eXBlLmNvbXByZXNzJyxcbiAgWmxpYi5aaXAucHJvdG90eXBlLmNvbXByZXNzXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlppcC5wcm90b3R5cGUuc2V0UGFzc3dvcmQnLFxuICBabGliLlppcC5wcm90b3R5cGUuc2V0UGFzc3dvcmRcbik7XG5abGliLmV4cG9ydE9iamVjdChcbiAnWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2QnLCB7XG4gICAgJ1NUT1JFJzogWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2QuU1RPUkUsXG4gICAgJ0RFRkxBVEUnOiBabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFXG4gIH1cbik7XG5abGliLmV4cG9ydE9iamVjdChcbiAgJ1psaWIuWmlwLk9wZXJhdGluZ1N5c3RlbScsIHtcbiAgICAnTVNET1MnOiBabGliLlppcC5PcGVyYXRpbmdTeXN0ZW0uTVNET1MsXG4gICAgJ1VOSVgnOiBabGliLlppcC5PcGVyYXRpbmdTeXN0ZW0uVU5JWCxcbiAgICAnTUFDSU5UT1NIJzogWmxpYi5aaXAuT3BlcmF0aW5nU3lzdGVtLk1BQ0lOVE9TSFxuICB9XG4pO1xuLy8gVE9ETzogRGVmbGF0ZSBPcHRpb24iXX0=