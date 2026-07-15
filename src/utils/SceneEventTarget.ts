import { BaseEvent, EventDispatcher, Object3D } from "three";

/**
 * A scene event.
 *
 * @category Utils
 * @internal
 */

export interface SceneEvent extends BaseEvent<keyof SceneEventTargetEventMap> {

	/**
	 * A scene child node.
	 */

	child: Object3D;

}

/**
 * SceneEventTarget events.
 *
 * @category Utils
 * @internal
 */

export interface SceneEventTargetEventMap {

	/**
	 * Triggers when a child is added to the scene.
	 *
	 * @event
	 */

	childadded: SceneEvent;

	/**
	 * Triggers when a child is removed from the scene.
	 *
	 * @event
	 */

	childremoved: SceneEvent;

}

/**
 * A unified event target that efficiently forwards nested `childadded` and `childremoved` scene events.
 *
 * @see {@link getInstance} for fetching an event target for a given scene.
 * @category Utils
 * @internal
 */

export class SceneEventTarget extends EventDispatcher<SceneEventTargetEventMap> {

	/**
	 * A collection of scene event helpers.
	 *
	 * One helper is created per scene to efficiently forward events of all child objects.
	 */

	private static sceneEventTargets = /* @__PURE__ */ new WeakMap<Object3D, SceneEventTarget>();

	/**
	 * A listener for events dispatched by the {@link scene}.
	 */

	private readonly listener: (event: SceneEvent) => void;

	/**
	 * Constructs a new scene event target.
	 *
	 * @param scene - A scene.
	 */

	private constructor(scene: Object3D) {

		super();

		this.listener = (event) => this.handleSceneEvent(event);

		// Attach the listener to the scene and its children.
		this.handleSceneEvent({
			type: "childadded",
			child: scene
		});

	}

	/**
	 * Handles scene graph events.
	 *
	 * @param event - A scene graph event.
	 */

	private handleSceneEvent(event: SceneEvent): void {

		switch(event.type) {

			case "childadded": {

				// Attach the listener to the new object and its children.
				event.child?.traverse((node) => {

					node.addEventListener("childadded", this.listener);
					node.addEventListener("childremoved", this.listener);

				});

				break;

			}

			case "childremoved": {

				// Remove the listener from the removed object and its children.
				event.child?.traverse((node) => {

					node.removeEventListener("childadded", this.listener);
					node.removeEventListener("childremoved", this.listener);

				});

				break;

			}

		}

		this.dispatchEvent(event);

	}

	/**
	 * Returns a scene event target instance for the given scene.
	 *
	 * Event targets are created on demand and cached per scene. This ensures that only one listener is added to each
	 * node of the scene graph.
	 *
	 * @param scene - A scene.
	 * @return A scene event target.
	 */

	static getInstance(scene: Object3D): SceneEventTarget {

		if(!SceneEventTarget.sceneEventTargets.has(scene)) {

			// Create a new scene event target for this scene.
			SceneEventTarget.sceneEventTargets.set(scene, new SceneEventTarget(scene));

		}

		return SceneEventTarget.sceneEventTargets.get(scene)!;

	}

}
