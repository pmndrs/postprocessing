"use strict";

const FilmPass = require("../../build/postprocessing").FilmPass;

module.exports = {

	"Film": {

		"can be created and destroyed": function(test) {

			const pass = new FilmPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
