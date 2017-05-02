# maptalks-build-helpers
Helpers of build flow for maptalks.js and plugins.

# Install

```npm install maptalks-build-helpers```

# Usage

Common usage with gulp:

```javascript
const gulp = require('gulp'),
    pkg = require('./package.json'),
    BundleHelper = require('maptalks-build-helpers').BundleHelper,
    TestHelper = require('maptalks-build-helpers').TestHelper;
const bundleHelper = new BundleHelper(pkg);
gulp.task('build', () => {
    return bundleHelper.bundle('index.js');
});

gulp.task('minify', ['build'], () => {
    bundleHelper.minify();
});

gulp.task('watch', ['build'], () => {
    gulp.watch(['index.js', './gulpfile.js'], ['build']);
});

gulp.task('test', ['build'], () => {
    testHelper.test(karmaConfig);
});

gulp.task('tdd', ['build'], () => {
    karmaConfig.singleRun = false;
    gulp.watch(['index.js'], ['test']);
    testHelper.test(karmaConfig);
});

gulp.task('default', ['watch']);
```

# Develop

Based on rollup, karma and uglify