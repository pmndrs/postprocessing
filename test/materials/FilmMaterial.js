"use strict";

const FilmMaterial = require("../../build/postprocessing").FilmMaterial;

module.exports = {

	"Film": {

		"can be created": function(test) {

			const material = new FilmMaterial();
			test.ok(material);
			test.done();

		}

	}

};
