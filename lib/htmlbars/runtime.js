import { domHelpers } from "./runtime/dom_helpers";
import { Placeholder } from "./runtime/placeholder";

export function hydrate(spec, options) {
  return spec(domHelpers(options && options.extensions), Placeholder);
}
