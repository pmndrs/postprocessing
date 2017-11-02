"use strict";

const ToneMappingPass = require("../../build/postprocessing").ToneMappingPass;

module.exports = {

	"Tone Mapping": {

		"can be created and destroyed": function(test) {

			const pass = new ToneMappingPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
