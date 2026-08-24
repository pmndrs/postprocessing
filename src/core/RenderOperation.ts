import { Compilable } from "./Compilable.js";
import { Disposable } from "./Disposable.js";
import { Task } from "./Task.js";

/**
 * An inline render operation.
 *
 * @category Core
 */

export interface RenderOperation extends Compilable, Disposable, Task {}
