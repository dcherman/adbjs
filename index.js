var Promise = require( "bluebird" ),
    shell = require( "shelljs" ),
    exec = Promise.promisify( shell.exec ),
    adbPath "--";

function assertAdbSupported() {
    if ( adbPath === "--" ) {
        adbPath = shell.which( "adb" );
    }

    if ( !adbPath ) {
        throw new Error( "An `adb` executable was not found.  Is it in your PATH?" );
    }
}

function ADB( address, port ) {
    assertAdbSupported();

    if ( !address ) {
        throw new Error( "address is required" );
    }

    this.address = address;

    if ( port ) {
        if ( !/^\d+$/.test( port ) ) {
            throw new Error( "port must be a valid integer" );
        }

        this.port = port;
    }
}

ADB.prototype = {
    constructor: ADB,

    port: 5555,

    exec: function( cmd ) {
        return Promise.try(function() {
            return exec( "adb -s " + this.address + ":" + this.port + " shell " + cmd, { silent: true });
        }.bind(this));
    },

    init: function() {
        return this.exec( "date" ).catch(function() {
            return this.disconnect().then(function() {
                return exec( "adb connect " + this.address, { silent: true });
            }.bind(this)).catch(function() {
                throw new Error( "Unable to connect to " + this.address );
            }.bind(this));
        }.bind(this));
    },

    disconnect: function() {
        return exec( "adb disconnect " + this.address, { silent: true });
    }
};

module.exports = ADB;
