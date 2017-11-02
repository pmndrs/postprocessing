"use strict";

const BokehPass = require("../../build/postprocessing").BokehPass;

module.exports = {

	"Bokeh": {

		"can be created and destroyed": function(test) {

			const pass = new BokehPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
