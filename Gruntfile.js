module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-concat');

  var license = grunt.file.read('LICENSE_min');
  var basefiles = [];
  var config = grunt.file.readJSON("build.json");
  var targets = Object.keys(config);


  // basefiles
  basefiles.push('closure-primitives/base.js');

  switch (grunt.option('typedarray')) {
    case 'use':
      console.log('USE_TYPEDARRAY=true');
      basefiles.push(
        'define/typedarray/use.js'
      );
      break;
    case 'no':
      console.log('USE_TYPEDARRAY=false');
      basefiles.push(
        'define/typedarray/no.js'
      );
      break;
    case 'hypbrid': /* FALLTHROUGH */
    default:
      console.log('USE_TYPEDARRAY=hybrid');
      basefiles.push(
        'define/typedarray/hybrid.js'
      );
      break;
  }

  basefiles.push('src/*.js');

  grunt.initConfig({
    closureDepsWriter: {
      options: {
        depswriter: 'closure-primitives/depswriter.py',
        root_with_prefix: ['"src ../src"']
      },
      deps: {
        dest: 'closure-primitives/deps.js'
      }
    },
    closureCompiler: mergeObject(
      {
        options: {
          compilerFile: 'vendor/google-closure-compiler/compiler.jar',
          checkModified: false,
          compilerOpts: {
            compilation_level: 'PERFORMANCE_OPTIMIZATIONS',
            language_in: 'ECMASCRIPT5_STRICT',
            source_map_format: "V3",
            manage_closure_dependencies: true,
            summary_detail_level: 3,
            warning_level: 'VERBOSE',
            jscomp_error: [
              'accessControls',
              'checkTypes',
              'checkVars',
              'const',
              'constantProperty',
              'duplicate',
              'visibility'
            ],
            output_wrapper:
              '"' + license + '(function() {%output%}).call(this);"'
          }
        }
      }, (function() {
        var result = {};

        targets.forEach(function(target) {
          result[target] = createClosureCompilerSetting(target);
        });

        return result;
      })()
    ),
    'concat': mergeObject(
      {
        options: {
          process: concatProcess
        }
      }, (function() {
        var result = {};

        targets.forEach(function(target) {
          result[target] = createConcatSettings(target);
        });

        return result;
      })()
    )
  });

  // create compile settings
  function createClosureCompilerSetting(target) {
    return {
      src: basefiles.concat(config[target].src),
      dest: config[target].dest,
      TEMPcompilerOpts: mergeObject(
        {
          create_source_map: config[target].map
        },
        config[target].compilerOpts || {}
      )
    }
  }

  // create concat settings
  function createConcatSettings(target) {
    return {
      src: config[target].dest,
      dest: config[target].dev
    }
  }

  // concat sourcemaps
  function concatProcess(src, filepath) {
    var mapfile = filepath + ".map";

    var result =
      src + '//# sourceMappingURL=data:application/json;charset=utf-8;base64,' +
        new Buffer(updateSourceMaps(mapfile)).toString('base64');
    grunt.file.delete(mapfile);

    return result;
  }

  // update sourcemaps
  function updateSourceMaps(path) {
    var mapObject = grunt.file.readJSON(path);
    var contents = [];

    /*
    // source data-url version
    mapObject.sources.forEach(function(sourcePath, i) {
      mapObject.sources[i] = 'data:text/plain;charset=utf-8;base64,' +
        new Buffer(grunt.file.read(sourcePath, {encoding: null}).toString('base64'))
    });
    */

    // sourceContent version
    mapObject.sources.forEach(function(sourcePath) {
      contents.push(grunt.file.read(sourcePath, {encoding: null}).toString())
    });

    mapObject.sourcesContent = contents;

    return JSON.stringify(mapObject);
  }

  // merge object
  function mergeObject(dst, src) {
    Object.keys(src).forEach(function(key) {
      dst[key] = src[key];
    });

    return dst;
  }

  grunt.registerTask("default", targets);
  grunt.registerTask("all", targets);
  grunt.registerTask("deps", ["closureDepsWriter:deps"]);
  targets.forEach(function(target) {
    grunt.registerTask(target, ["closureCompiler:" + target, "concat:" + target]);
  });
};
