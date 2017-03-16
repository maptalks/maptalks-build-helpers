'use strict';
const minimist = require('minimist');
const Server = require('karma').Server;

const knownOptions = {
    string: ['browsers', 'pattern'],
    boolean: 'coverage',
    alias: {
        'coverage': 'cov'
    },
    default: {
        browsers: '',
        coverage: false
    }
};

const options = minimist(process.argv.slice(2), knownOptions);
const browsers = [];
options.browsers.split(',').forEach(name => {
    if (!name || name.length < 2) {
        return;
    }
    var lname = name.toLowerCase();
    if (lname.indexOf('phantom') === 0) {
        browsers.push('PhantomJS');
    }
    if (lname[0] === 'i' && lname[1] === 'e') {
        browsers.push('IE' + lname.substr(2));
    } else {
        browsers.push(lname[0].toUpperCase() + lname.substr(1));
    }
});

module.exports = class TestHelper {

    test(karmaConfig) {
        if (this.karmaServer) {
            this.karmaServer.refreshFiles();
            return;
        }
        this.karmaServer = new Server(karmaConfig);
        if (browsers.length > 0) {
            karmaConfig.browsers = browsers;
        }
        if (options.pattern) {
            karmaConfig.client = {
                'mocha': {
                    'grep': options.pattern
                }
            };
        }
        this.karmaServer.start();
    }

};
