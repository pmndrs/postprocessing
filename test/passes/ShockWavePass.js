"use strict";

const ShockWavePass = require("../../build/postprocessing").ShockWavePass;

module.exports = {

	"Shock Wave": {

		"can be created and destroyed": function(test) {

			const pass = new ShockWavePass(null);
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
