const fs = require('fs'),
    rollup = require('rollup'),
    babel = require('maptalks-rollup-plugin-babel'),
    commonjs = require('rollup-plugin-commonjs'),
    localResolve = require('rollup-plugin-local-resolve'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    uglify = require('uglify-js').minify,
    zlib = require('zlib');

module.exports = class BundleHelper {
    constructor(pkg) {
        this.pkg = pkg;
        const year = new Date().getFullYear();
        this.banner = `/*!\n * ${pkg.name} v${pkg.version}\n * LICENSE : ${pkg.license}\n * (c) 2016-${year} maptalks.org\n */`;
        let outro = pkg.name + ' v' + pkg.version;
        if (this.pkg !== 'maptalks') {
            if (this.pkg.peerDependencies && this.pkg.peerDependencies['maptalks']) {
                this.banner += `\n/*!\n * requires maptalks@${pkg.peerDependencies.maptalks} \n */`;
                outro += `, requires maptalks@${pkg.peerDependencies.maptalks}.`;
            }
        }
        this.outro = `typeof console !== 'undefined' && console.log('${outro}');`;
    }

    /**
     * Generate the bundle using rollup
     * @param  {String} entry   the entry file path, relative to the project root.
     * @param  {Object} [options=null] rollup's options
     */
    bundle(entry, options) {
        const pkg = this.pkg;

        options = options || this.getDefaultRollupConfig();
        options.input = entry;

        const umd = {
            'extend' : true,
            'sourcemap': false,
            'format': 'umd',
            'name': 'maptalks',
            'banner': this.banner,
            'file': 'dist/' + pkg.name + '.js',
            'outro' : this.outro
        };
        const es = {
            'sourcemap': false,
            'format': 'es',
            'banner': this.banner,
            'file': 'dist/' + pkg.name + '.es.js',
            'outro' : this.outro
        };
        return rollup.rollup(options).then(bundle => Promise.all(
            [
                bundle.write(umd),
                bundle.write(es),
            ]
        ));
    }

    getDefaultRollupConfig() {
        return {
            'external': [
                'maptalks'
            ],
            'plugins': [
                localResolve(),
                nodeResolve({
                    module: true,
                    jsnext: true,
                    main: true
                }),
                commonjs(),
                babel({
                    plugins : ['transform-proto-to-assign']
                })
            ]
        };
    }

    /**
     * Minify the bundle and also generate a gzipped version.
     * It assumes bundle is already at 'dist/pkgname.js'
     */
    minify() {
        const name = this.pkg.name;
        const dest = 'dist/' + name + '.js';
        const code = fs.readFileSync(dest).toString('utf-8');
        const u = uglify(code, {
            'output': {
                'ascii_only': true
            }
        });
        const minified = this.banner + '\n' + u.code;
        fs.writeFileSync('dist/' + name + '.min.js', minified);
        const gzipped = zlib.gzipSync(minified);
        fs.writeFileSync('dist/' + name + '.min.js.gz', gzipped);
    }
};
