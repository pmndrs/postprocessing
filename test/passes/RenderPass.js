"use strict";

const RenderPass = require("../../build/postprocessing").RenderPass;

module.exports = {

	"Render": {

		"can be created and destroyed": function(test) {

			const pass = new RenderPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
