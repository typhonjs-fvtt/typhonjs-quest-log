/**
 * @typedef {object} Positionable
 *
 * @property {object}   position - A position object storing top, left, width, height.
 *
 * @property {Function} setPosition - A callback function to set position.
 */

/**
 * Provides an action to enable pointer dragging of an HTMLElement and invoke `setPosition` on given Positionable
 * object provided. When the attached boolean store state changes the draggable action is enabled or disabled.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object}            params - Required parameters.
 *
 * @param {Positionable}      params.positionable - A positionable object.
 *
 * @param {Readable<boolean>} params.booleanStore - A Svelte store that contains a boolean.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
export function draggable(node, { positionable, booleanStore })
{
   /**
    * Duplicate the app / Positionable starting position to track differences.
    *
    * @type {object}
    */
   let position = null;

   /**
    * Stores the initial X / Y on drag down.
    *
    * @type {object}
    */
   let initialPosition = {};

   /**
    * Throttle mousemove event handling to 60fps
    *
    * @type {number}
    */
   let moveTime = 0;

   /**
    * Stores the active state and is used to cut off any active dragging when the store value changes.
    *
    * @type {Readable<boolean>}
    */
   let active = booleanStore;

   /**
    * Remember event handlers associated with this action so they may be later unregistered.
    *
    * @type {object}
    */
   const handlers = {
      dragDown: ['pointerdown', (e) => onDragPointerDown(e), false],
      dragMove: ['pointermove', (e) => onDragPointerMove(e), false],
      dragUp: ['pointerup', (e) => onDragPointerUp(e), false]
   };

   /**
    * Activates listeners.
    */
   function activateListeners()
   {
      active = true;

      // Drag handlers
      node.addEventListener(...handlers.dragDown);
      node.classList.add('draggable');
   }

   /**
    * Removes listeners.
    */
   function removeListeners()
   {
      active = false;

      // Drag handlers
      node.removeEventListener(...handlers.dragDown);
      node.removeEventListener(...handlers.dragMove);
      node.removeEventListener(...handlers.dragUp);
      node.classList.remove('draggable');
   }

   if (active)
   {
      activateListeners();
   }

   /**
    * Handle the initial pointer down which activates dragging behavior for the positionable.
    *
    * @param {PointerEvent} event - The pointer down event.
    */
   function onDragPointerDown(event)
   {
      event.preventDefault();

      // Record initial position
      position = foundry.utils.duplicate(positionable.position);
      initialPosition = { x: event.clientX, y: event.clientY };

      // Add temporary handlers
      globalThis.addEventListener(...handlers.dragMove);
      globalThis.addEventListener(...handlers.dragUp);
   }

   /**
    * Move the positionable.
    *
    * @param {PointerEvent} event - The pointer move event.
    */
   function onDragPointerMove(event)
   {
      event.preventDefault();

      if (!active) { return; }

      // Limit dragging to 60 updates per second
      const now = Date.now();

      if ((now - moveTime) < (1000 / 60)) { return; }

      moveTime = now;

      // Update application position
      positionable.setPosition({
         left: position.left + (event.clientX - initialPosition.x),
         top: position.top + (event.clientY - initialPosition.y)
      });
   }

   /**
    * Conclude the dragging behavior when the mouse is release, setting the final position and removing listeners
    *
    * @param {PointerEvent} event - The pointer up event.
    */
   function onDragPointerUp(event)
   {
      event.preventDefault();
      globalThis.removeEventListener(...handlers.dragMove);
      globalThis.removeEventListener(...handlers.dragUp);
   }

   return {
      update: ({ booleanStore }) =>  // eslint-disable-line no-shadow
      {
         if (booleanStore) { activateListeners(); }
         else { removeListeners(); }
      },

      destroy: () => removeListeners()
   };
}