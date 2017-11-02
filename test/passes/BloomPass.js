"use strict";

const BloomPass = require("../../build/postprocessing").BloomPass;

module.exports = {

	"Bloom": {

		"can be created and destroyed": function(test) {

			const pass = new BloomPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
