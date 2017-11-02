"use strict";

const PixelationPass = require("../../build/postprocessing").PixelationPass;

module.exports = {

	"Pixelation": {

		"can be created and destroyed": function(test) {

			const pass = new PixelationPass(null, null, null);
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
