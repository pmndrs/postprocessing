"use strict";

const GodRaysPass = require("../../build/postprocessing").GodRaysPass;

module.exports = {

	"God Rays": {

		"can be created and destroyed": function(test) {

			const pass = new GodRaysPass(null, null, null);
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
