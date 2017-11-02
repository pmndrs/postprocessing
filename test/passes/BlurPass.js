"use strict";

const BlurPass = require("../../build/postprocessing").BlurPass;

module.exports = {

	"Blur": {

		"can be created and destroyed": function(test) {

			const pass = new BlurPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
