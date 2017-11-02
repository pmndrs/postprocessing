"use strict";

const TexturePass = require("../../build/postprocessing").TexturePass;

module.exports = {

	"Texture": {

		"can be created and destroyed": function(test) {

			const pass = new TexturePass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
