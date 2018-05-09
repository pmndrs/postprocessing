"use strict";

const GlitchPass = require("../../build/postprocessing").GlitchPass;

module.exports = {

	"Glitch": {

		"can be created and destroyed": function(test) {

			const pass = new GlitchPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
