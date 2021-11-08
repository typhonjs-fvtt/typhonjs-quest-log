import ApplicationShell       from './app/ApplicationShell.svelte';
import TJSApplicationShell    from './app/TJSApplicationShell.svelte';

/**
 * Provides a method to determine if the passed in object is ApplicationShell or TJSApplicationShell.
 *
 * @param {*}  component - Object / component to test.
 *
 * @returns {boolean} Whether the component is a ApplicationShell or TJSApplicationShell.
 */
export function isApplicationShell(component)
{
   if (component === null || component === void 0) { return false; }

   return component instanceof ApplicationShell || component instanceof TJSApplicationShell;
}