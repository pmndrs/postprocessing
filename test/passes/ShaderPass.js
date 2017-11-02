"use strict";

const ShaderPass = require("../../build/postprocessing").ShaderPass;

module.exports = {

	"Shader": {

		"can be created and destroyed": function(test) {

			const pass = new ShaderPass(null);
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
