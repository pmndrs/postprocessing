"use strict";

const ClearMaskPass = require("../../build/postprocessing").ClearMaskPass;

module.exports = {

	"Clear Mask": {

		"can be created and destroyed": function(test) {

			const pass = new ClearMaskPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
