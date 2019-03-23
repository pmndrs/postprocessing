module.exports = function(api) {

	api.cache.forever();

	return {
		compact: false,
		comments: false,
		presets: [
			["@babel/preset-env"]
		]
	};

};
