import { Event as Event3, EventDispatcher, Object3D } from "three";

/**
 * A scene event.
 *
 * @category Utils
 * @internal
 */

export interface SceneEvent extends Event3<keyof SceneEventTargetMap> {

	child: Object3D;

}

/**
 * SceneEventTarget events.
 *
 * @category Utils
 * @internal
 */

export interface SceneEventTargetMap {

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
 * A helper that forwards `childadded` and `childremoved` events of all objects in a given scene.
 *
 * @category Utils
 * @internal
 */

export class SceneEventTarget extends EventDispatcher<SceneEventTargetMap> {

	/**
	 * A listener for events dispatched by the {@link scene}.
	 */

	private readonly listener: (event: SceneEvent) => void;

	/**
	 * Constructs a new scene event target.
	 *
	 * @param scene - A scene.
	 */

	constructor(scene: Object3D) {

		super();

		this.listener = (event) => this.handleSceneEvent(event);

		// Attach the listener to the scene and its children.
		this.handleSceneEvent({
			type: "childadded",
			target: scene,
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

}
