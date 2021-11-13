/**
 * @typedef {object} ApplicationShell - Application shell contract for Svelte components.
 *
 * @property {HTMLElement} elementRoot - The root element / exported prop.
 *
 * @property {HTMLElement} [elementContent] - The content element / exported prop.
 *
 * @property {HTMLElement} [elementTarget] - The target element / exported prop.
 */

/**
 * @typedef {object} StoreAppOptions - Provides a custom readable Svelte store for Application options state.
 *
 * @property {import('svelte/store').Readable.subscribe} subscribe - Subscribe to all app options updates.
 *
 * @property {import('svelte/store').Readable<boolean>} draggable - Derived store for `draggable` updates.
 *
 * @property {import('svelte/store').Readable<boolean>} minimizable - Derived store for `minimizable` updates.
 *
 * @property {import('svelte/store').Readable<boolean>} popOut - Derived store for `popOut` updates.
 *
 * @property {import('svelte/store').Readable<boolean>} resizable - Derived store for `resizable` updates.
 *
 * @property {import('svelte/store').Readable<string>} title - Derived store for `title` updates.
 *
 * @property {import('svelte/store').Readable<number>} zIndex - Derived store for `zIndex` updates.
 */

/**
 * @typedef {object} StoreUIOptions - Provides a custom readable Svelte store for UI options state.
 *
 * @property {import('svelte/store').Readable.subscribe} subscribe - Subscribe to all UI options updates.
 *
 * @property {import('svelte/store').Readable<ApplicationHeaderButton[]>} headerButtons - Derived store for
 *                                                                                        `headerButtons` updates.
 *
 * @property {import('svelte/store').Readable<boolean>} minimized - Derived store for `minimized` updates.
 */

/**
 * @typedef {object} TransformData
 *
 * @property {Function} transition - A transition applying to both in & out.
 *
 * @property {Function} inTransition - A transition applying to in.
 *
 * @property {Function} outTransition - A transition applying to out.
 *
 * @property {object}   transitionOptions - The options config object for in & out transitions.
 *
 * @property {object}   inTransitionOptions - The options config object for in transitions.
 *
 * @property {object}   outTransitionOptions - The options config object for out transitions.
 */
