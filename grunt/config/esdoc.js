module.exports = {

	options: {
		coverageThreshold: 90.0,
		plugins: [{
			name: "esdoc-standard-plugin"
		}]
	},

	lib: {
		src: "src",
		dest: "public/docs"
	}

};
