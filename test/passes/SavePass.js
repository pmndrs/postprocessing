"use strict";

const SavePass = require("../../build/postprocessing").SavePass;

module.exports = {

	"Save": {

		"can be created and destroyed": function(test) {

			const pass = new SavePass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
