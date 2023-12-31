import { Log, LogLevel } from "postprocessing";

// Indicates whether the current location is localhost.
export const isLocalhost = ["localhost", "127.0.0.1", "", "[::1]"].includes(window.location.hostname);

if(isLocalhost) {

	Log.level = LogLevel.DEBUG;

}
