"use strict";

const DotScreenPass = require("../../build/postprocessing").DotScreenPass;

module.exports = {

	"Dot Screen": {

		"can be created and destroyed": function(test) {

			const pass = new DotScreenPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
