import { Clock, WebGLRenderer } from "three";
import dat from "dat.gui";
import Stats from "stats.js";

import { EffectComposer } from "../src";
import { RenderDemo } from "./render.js";
import { DepthDemo } from "./depth.js";
import { DotScreenDemo } from "./dot-screen.js";
import { FilmDemo } from "./film.js";
import { GlitchDemo } from "./glitch.js";
import { BloomDemo } from "./bloom.js";
import { BokehDemo } from "./bokeh.js";
import { Bokeh2Demo } from "./bokeh2.js";
import { GodRaysDemo } from "./god-rays.js";
import { SMAADemo } from "./smaa.js";
import { ToneMappingDemo } from "./tone-mapping.js";

/**
 * A demo application.
 *
 * @class App
 * @constructor
 */

export class App {

	constructor() {

		/**
		 * A clock.
		 *
		 * @property clock
		 * @type Clock
		 * @private
		 */

		this.clock = new Clock();

		/**
		 * A composer.
		 *
		 * @property composer
		 * @type EffectComposer
		 * @private
		 */

		this.composer = (function() {

			const renderer = new WebGLRenderer({
				logarithmicDepthBuffer: true,
				antialias: true
			});

			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setClearColor(0x000000);
			renderer.setPixelRatio(window.devicePixelRatio);

			return new EffectComposer(renderer, {
				depthTexture: true
			});

		}());

		/**
		 * Statistics.
		 *
		 * @property stats
		 * @type Stats
		 * @private
		 */

		this.stats = (function() {

			const stats = new Stats();
			stats.showPanel(0);
			stats.dom.id = "stats";

			return stats;

		}());

		/**
		 * Available demos.
		 *
		 * @property demos
		 * @type Map
		 * @private
		 */

		this.demos = (function(composer) {

			const demos = new Map();

			demos.set("render", new RenderDemo(composer));
			demos.set("bloom", new BloomDemo(composer));
			demos.set("bokeh", new BokehDemo(composer));
			demos.set("bokeh2", new Bokeh2Demo(composer));
			demos.set("depth", new DepthDemo(composer));
			demos.set("dot-screen", new DotScreenDemo(composer));
			demos.set("film", new FilmDemo(composer));
			demos.set("glitch", new GlitchDemo(composer));
			demos.set("god-rays", new GodRaysDemo(composer));
			demos.set("smaa", new SMAADemo(composer));
			demos.set("tone-mapping", new ToneMappingDemo(composer));

			return demos;

		}(this.composer));

		/**
		 * The key of the current effect.
		 *
		 * @property effect
		 * @type String
		 * @private
		 */

		this.effect = (function(demos) {

			let key = window.location.hash.slice(1);

			if(key.length === 0 || !demos.has(key)) {

				key = demos.keys().next().value;

			}

			return key;

		}(this.demos));

	}

	/**
	 * Initialises the demo.
	 *
	 * @method initialise
	 * @static
	 * @param {HTMLElement} viewport - The viewport.
	 * @param {HTMLElement} aside - A secondary DOM container.
	 * @param {HTMLElement} loadingMessage - A loading message.
	 */

	initialise(viewport, aside, loadingMessage) {

		const app = this;

		const composer = this.composer;
		const renderer = composer.renderer;
		const clock = this.clock;
		const stats = this.stats;
		const demos = this.demos;

		let demo = null;
		let gui = null;

		viewport.appendChild(composer.renderer.domElement);
		aside.appendChild(stats.dom);

		/**
		 * Activates the currently selected demo.
		 *
		 * @method activateDemo
		 * @private
		 * @static
		 */

		function activateDemo() {

			const camera = demo.camera;
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			gui = new dat.GUI({ autoPlace: false });
			gui.add(app, "effect", Array.from(demos.keys())).onChange(loadDemo);
			demo.configure(gui);
			aside.appendChild(gui.domElement);

			loadingMessage.style.display = "none";
			renderer.domElement.style.visibility = "visible";

		}

		/**
		 * Loads the currently selected demo.
		 *
		 * @method loadDemo
		 * @private
		 * @static
		 */

		function loadDemo() {

			loadingMessage.style.display = "block";
			renderer.domElement.style.visibility = "hidden";

			if(gui !== null) {

				gui.destroy();
				aside.removeChild(gui.domElement);

			}

			if(demo !== null) {

				demo.reset();
				composer.replaceRenderer(renderer);

			}

			composer.reset();
			demo = demos.get(app.effect);
			demo.load(activateDemo);

		}

		loadDemo();

		/**
		 * Toggles the visibility of the interface on alt key press.
		 *
		 * @method onKeyDown
		 * @private
		 * @static
		 * @param {Event} event - An event.
		 */

		document.addEventListener("keydown", function onKeyDown(event) {

			if(event.altKey) {

				event.preventDefault();
				aside.style.visibility = (aside.style.visibility === "hidden") ? "visible" : "hidden";

			}

		});

		/**
		 * Handles browser resizing.
		 *
		 * @method onResize
		 * @private
		 * @static
		 * @param {Event} event - An event.
		 */

		window.addEventListener("resize", (function() {

			let id = 0;

			function handleResize(event) {

				const width = event.target.innerWidth;
				const height = event.target.innerHeight;

				composer.setSize(width, height);
				demo.camera.aspect = width / height;
				demo.camera.updateProjectionMatrix();

				id = 0;

			}

			return function onResize(event) {

				if(id === 0) {

					id = setTimeout(handleResize, 66, event);

				}

			};

		}()));

		/**
		 * The main render loop.
		 *
		 * @method render
		 * @private
		 * @static
		 * @param {DOMHighResTimeStamp} now - An execution timestamp.
		 */

		(function render(now) {

			requestAnimationFrame(render);

			stats.begin();

			demo.update();
			composer.render(clock.getDelta());

			stats.end();

		}());

	}

}
