"use strict";

const SMAAPass = require("../../build/postprocessing").SMAAPass;

module.exports = {

	"SMAA": {

		"can be created and destroyed": function(test) {

			const pass = new SMAAPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
