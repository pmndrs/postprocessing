"use strict";

const GlitchPass = require("../../build/postprocessing").GlitchPass;

module.exports = {

	"Glitch": {

		"can be created and destroyed": function(test) {

			const pass = new GlitchPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		},

		"should find and destroy all disposable properties": function(test) {

			const pass = new GlitchPass();
			const keys = Object.keys(pass);

			let c = 0;
			let key;

			pass.dispose();

			for(key of keys) {

				if(pass[key] === null) {

					++c;

				}

			}

			test.equal(c, 2, "should destroy 2 of its properties");
			test.done();

		}

	}

};
