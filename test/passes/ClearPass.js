"use strict";

const ClearPass = require("../../build/postprocessing").ClearPass;

module.exports = {

	"Clear": {

		"can be created and destroyed": function(test) {

			const pass = new ClearPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
