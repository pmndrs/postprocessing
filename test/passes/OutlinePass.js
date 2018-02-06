"use strict";

const OutlinePass = require("../../build/postprocessing").OutlinePass;

module.exports = {

	"Outline": {

		"can be created and destroyed": function(test) {

			const pass = new OutlinePass(null, null);
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
