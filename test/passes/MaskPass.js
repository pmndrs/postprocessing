"use strict";

const MaskPass = require("../../build/postprocessing").MaskPass;

module.exports = {

	"Mask": {

		"can be created and destroyed": function(test) {

			const pass = new MaskPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
