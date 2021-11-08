/**
 * Defines the application shell contract. If Svelte components export getter / setters for the following properties
 * then that component is considered an application shell.
 *
 * @type {string[]}
 */
const applicationShellContract = ['elementContent', 'elementRoot', 'title', 'zIndex'];

Object.freeze(applicationShellContract);

export { applicationShellContract };