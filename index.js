const fs = require('fs'),
    rollup = require('rollup').rollup,
    babel = require('rollup-plugin-babel'),
    commonjs = require('rollup-plugin-commonjs'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    localResolve = require('rollup-plugin-local-resolve'),        
    uglify = require('uglify-js').minify,
    zlib = require('zlib');

class BundleHelper {
    constructor(pkg) {
        this.pkg = pkg;
        const year = new Date().getFullYear();
        this.banner = `/*!\n * ${pkg.name} v${pkg.version}\n * LICENSE : ${pkg.license}\n * (c) 2016-${year} maptalks.org\n */`;
    }

    /**
     * Generate the bundle using rollup
     * @param  {String} entry   the entry file path, relative to the project root.
     * @param  {Object} [options=null] rollup's options
     */
    bundle(entry, options) {
        options = options || {
            'external': [
                'maptalks'
            ],
            'plugins': [                
                localResolve(),
                nodeResolve({
                    jsnext: true,
                    main: true,
                    browser: true
                }),
                commonjs(),
                babel({
                    plugins : ['transform-proto-to-assign']
                })
            ],
            'sourceMap': true
        };
        options.entry = entry;

        const dest = 'dist/' + this.pkg.name + '.js';
        const bundleOpts = {
            'format': 'umd',
            'moduleName': 'maptalks',
            'banner': this.banner,
            'dest': dest
        };

        if (options.sourceMap || options.sourceMap === undefined) {
            bundleOpts.sourceMap = 'inline';
        }
        return rollup(options).then(bundle => bundle.write(bundleOpts));
    }

    /**
     * Minify the bundle and also generate a gzipped version.
     * It assumes bundle is already at 'dist/pkgname.js'
     */
    minify() {
        const name = this.pkg.name;
        const dest = 'dist/' + name + '.js';
        const code = fs.readFileSync(dest).toString('utf-8');
        const minified = this.banner + '\n' + uglify(code, {
            'fromString': true,
            'output': {
                'screw_ie8': true,
                'ascii_only': true
            }
        }).code;
        fs.writeFileSync('dist/' + name + '.min.js', minified);
        const gzipped = zlib.gzipSync(minified);
        fs.writeFileSync('dist/' + name + '.min.js.gz', gzipped);
    }
}

module.exports = {
    'BundleHelper' : BundleHelper
};
