import { lerp } from "../../utils/math.js";
import { RawImageData } from "../RawImageData.js";

/**
 * Maps edges to bilinear fetch cases (reverse lookup of the bilinear function).
 */

const edges = new Map<number, number[]>([

	[bilinear(0, 0, 0, 0), [0, 0, 0, 0]],
	[bilinear(0, 0, 0, 1), [0, 0, 0, 1]],
	[bilinear(0, 0, 1, 0), [0, 0, 1, 0]],
	[bilinear(0, 0, 1, 1), [0, 0, 1, 1]],

	[bilinear(0, 1, 0, 0), [0, 1, 0, 0]],
	[bilinear(0, 1, 0, 1), [0, 1, 0, 1]],
	[bilinear(0, 1, 1, 0), [0, 1, 1, 0]],
	[bilinear(0, 1, 1, 1), [0, 1, 1, 1]],

	[bilinear(1, 0, 0, 0), [1, 0, 0, 0]],
	[bilinear(1, 0, 0, 1), [1, 0, 0, 1]],
	[bilinear(1, 0, 1, 0), [1, 0, 1, 0]],
	[bilinear(1, 0, 1, 1), [1, 0, 1, 1]],

	[bilinear(1, 1, 0, 0), [1, 1, 0, 0]],
	[bilinear(1, 1, 0, 1), [1, 1, 0, 1]],
	[bilinear(1, 1, 1, 0), [1, 1, 1, 0]],
	[bilinear(1, 1, 1, 1), [1, 1, 1, 1]]

]);

/**
 * Calculates the bilinear fetch for a certain edge combination.
 *
 *     e[0]       e[1]
 *
 *              x <-------- Sample Position: (-0.25, -0.125)
 *     e[2]       e[3] <--- Current Pixel [3]: (0.0, 0.0)
 *
 * @param e0 - The edge combination.
 * @param e1 - The edge combination.
 * @param e2 - The edge combination.
 * @param e3 - The edge combination.
 * @return The interpolated value.
 */

function bilinear(e0: number, e1: number, e2: number, e3: number): number {

	const a = lerp(e0, e1, 1.0 - 0.25);
	const b = lerp(e2, e3, 1.0 - 0.25);
	return lerp(a, b, 1.0 - 0.125);

}

/**
 * Computes the distance to add in the last step of searches to the left.
 *
 * @param left - The left edge combination.
 * @param top - The top edge combination.
 * @return The left delta distance.
 */

function deltaLeft(left: number[], top: number[]): number {

	let d = 0;

	// If there is an edge, continue.
	if(top[3] === 1) {

		d += 1;

	}

	// If an edge was previously found, there's another edge and no crossing edges, continue.
	if(d === 1 && top[2] === 1 && left[1] !== 1 && left[3] !== 1) {

		d += 1;

	}

	return d;

}

/**
 * Computes the delta distance to add in the last step of searches to the right.
 *
 * @param left - The left edge combination.
 * @param top - The top edge combination.
 * @return The right delta distance.
 */

function deltaRight(left: number[], top: number[]): number {

	let d = 0;

	// If there is an edge, and no crossing edges, continue.
	if(top[3] === 1 && left[1] !== 1 && left[3] !== 1) {

		d += 1;

	}

	// If an edge was previously found, there's another edge and there are no crossing edges.
	if(d === 1 && top[2] === 1 && left[0] !== 1 && left[2] !== 1) {

		d += 1;

	}

	return d;

}

/**
 * SMAA search image data.
 *
 * This image stores information about how many pixels the line search algorithm must advance in the last step.
 *
 * @see https://github.com/iryoku/smaa/tree/master/Scripts
 * @group Textures
 */

export class SMAASearchImageData {

	/**
	 * Creates a new search image.
	 *
	 * @return The generated image data.
	 */

	static generate(): RawImageData {

		const width = 66;
		const height = 33;
		const halfWidth = width / 2;

		const croppedWidth = 64;
		const croppedHeight = 16;

		const data = new Uint8ClampedArray(width * height);
		const croppedData = new Uint8ClampedArray(croppedWidth * croppedHeight * 4);

		// Calculate delta distances.
		for(let y = 0; y < height; ++y) {

			for(let x = 0; x < width; ++x) {

				const s = 0.03125 * x;
				const t = 0.03125 * y;

				if(edges.has(s) && edges.has(t)) {

					const e1 = edges.get(s) as number[];
					const e2 = edges.get(t) as number[];

					const i = y * width + x;

					// Maximize the dynamic range to help the compression.
					data[i] = (127 * deltaLeft(e1, e2));
					data[i + halfWidth] = (127 * deltaRight(e1, e2));

				}

			}

		}

		// Crop the result to powers-of-two to make it BC4-friendly.
		for(let i = 0, y = height - croppedHeight; y < height; ++y) {

			for(let x = 0; x < croppedWidth; ++x, i += 4) {

				croppedData[i] = data[y * width + x];
				croppedData[i + 3] = 255;

			}

		}

		return new RawImageData(croppedWidth, croppedHeight, croppedData);

	}

}
