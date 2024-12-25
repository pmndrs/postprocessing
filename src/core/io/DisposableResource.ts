import { Disposable } from "../Disposable.js";
import { Resource } from "./Resource.js";

/**
 * A wrapper base class for disposable resources.
 *
 * This wrapper automatically disposes resources when they are no longer referenced by any wrapper.
 *
 * @param T - The type of the internal value.
 * @category IO
 */

export abstract class DisposableResource<T extends Disposable | null> extends Resource<T> implements Disposable {

	/**
	 * Keeps track of resource references.
	 */

	private static readonly references = new Map<Disposable, number>();

	/**
	 * Constructs a new disposable resource wrapper.
	 *
	 * @param value - A resource value.
	 */

	constructor(value: T | null) {

		super(value);

		DisposableResource.increaseReferenceCount(value);

	}

	override get value(): T | null {

		return super.value;

	}

	override set value(value: T | null) {

		const previousValue = super.value;
		super.value = value;

		if(value === previousValue) {

			// Nothing changed.
			return;

		}

		// Update reference counts.
		DisposableResource.decreaseReferenceCount(previousValue);
		DisposableResource.increaseReferenceCount(value);

		if(previousValue !== null && !DisposableResource.references.has(previousValue)) {

			// Dispose the orphaned resource.
			previousValue.dispose();

		}

	}

	dispose(): void {

		this.value?.dispose();

	}

	/**
	 * Decreases the reference count for the given resource.
	 *
	 * @param resource - A resource.
	 */

	private static decreaseReferenceCount(value: Disposable | null): void {

		if(value === null) {

			return;

		}

		const refs = DisposableResource.references;
		const currentValue = refs.get(value) ?? 0;

		if(currentValue > 0) {

			if(currentValue === 1) {

				refs.delete(value);

			} else {

				refs.set(value, currentValue - 1);

			}

		}

	}

	/**
	 * Increases the reference count for the given resource.
	 *
	 * @param resource - A resource.
	 */

	private static increaseReferenceCount(value: Disposable | null): void {

		if(value === null) {

			return;

		}

		const refs = DisposableResource.references;
		const currentValue = refs.get(value) ?? 0;
		refs.set(value, currentValue + 1);

	}

}
