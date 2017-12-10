"use strict";

const RealisticBokehPass = require("../../build/postprocessing").RealisticBokehPass;

module.exports = {

	"RealisticBokeh": {

		"can be created and destroyed": function(test) {

			const pass = new RealisticBokehPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
