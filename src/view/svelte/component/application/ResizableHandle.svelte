<script>
   import { getContext } from "svelte";

   export let isResizable = false;

   const context = getContext('external');

   // Allows retrieval of the element root at runtime.
   const getElementRoot = getContext('getElementRoot');

   const foundryApp = context.foundryApp;
   const storeResizable = context.storeAppOptions.resizable;
   const storeMinimized = context.storeUIOptions.minimized;

   let elementResize;

   $: if (elementResize)
   {
      // Instead of creating a derived store it is easier to use isResizable and the minimized store below.
      elementResize.style.display = isResizable && !$storeMinimized ? 'block' : 'none';

      // Add / remove `resizable` class from element root.
      const elementRoot = getElementRoot();
      if (elementRoot) { elementRoot.classList[isResizable ? 'add' : 'remove']('resizable'); }
   }

   /**
    * Provides an action to handle resizing the application shell based on the resizable app option.
    *
    * @param {HTMLElement}       node - The node associated with the action.
    *
    * @param {Readable<boolean>} booleanStore - A Svelte store that contains a boolean.
    *
    * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
    */
   function resizable(node, booleanStore)
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
       * Stores the active state and is used to cut off any active resizing when the store value changes.
       *
       * @type {boolean}
       */
      let active = booleanStore;

      /**
       * Remember event handlers associated with this action so they may be later unregistered.
       *
       * @type {Object}
       */
      const handlers = {
         resizeDown: ['pointerdown', (e) => onResizePointerDown(e), false],
         resizeMove: ['pointermove', (e) => onResizePointerMove(e), false],
         resizeUp: ['pointerup', (e) => onResizePointerUp(e), false]
      };

      /**
       * Activates listeners.
       */
      function activateListeners()
      {
         active = true;

         // Resize handlers
         node.addEventListener(...handlers.resizeDown);

         isResizable = true;

         node.style.display = 'block';
      }

      /**
       * Removes listeners.
       */
      function removeListeners()
      {
         active = false;

         // Resize handlers
         node.removeEventListener(...handlers.resizeDown);
         node.removeEventListener(...handlers.resizeMove);
         node.removeEventListener(...handlers.resizeUp);

         node.style.display = 'none';

         isResizable = false;
      }

      // On mount if resizable is true then activate listeners otherwise set element display to `none`.
      if (active)
      {
         activateListeners();
      }
      else
      {
         node.style.display = 'none';
      }

      /**
       * Handle the initial mouse click which activates dragging behavior for the application
       * @private
       */
      function onResizePointerDown(event)
      {
         event.preventDefault();

         // Limit dragging to 60 updates per second
         const now = Date.now();

         if ((now - moveTime) < (1000 / 60)) { return; }

         moveTime = now;

         // Record initial position
         position = foundry.utils.duplicate(foundryApp.position);

         if (position.height === 'auto') { position.height = getElementRoot().clientHeight; }
         if (position.width === 'auto') { position.width = getElementRoot().clientWidth; }

         initialPosition = { x: event.clientX, y: event.clientY };

         // Add temporary handlers
         globalThis.addEventListener(...handlers.resizeMove);
         globalThis.addEventListener(...handlers.resizeUp);
      }

      /**
       * Move the window with the mouse, bounding the movement to ensure the window stays within bounds of the viewport
       * @private
       */
      function onResizePointerMove(event)
      {
         event.preventDefault();

         if (!active) { return; }

         foundryApp.setPosition({
            width: position.width + (event.clientX - initialPosition.x),
            height: position.height + (event.clientY - initialPosition.y)
         });
      }

      /**
       * Conclude the dragging behavior when the mouse is release, setting the final position and removing listeners
       * @private
       */
      function onResizePointerUp(event)
      {
         event.preventDefault();

         globalThis.removeEventListener(...handlers.resizeMove);
         globalThis.removeEventListener(...handlers.resizeUp);

         foundryApp._onResize(event);
      }


      return {
         update: (booleanStore) =>  // eslint-disable-line no-shadow
         {
            if (booleanStore) { activateListeners(); }
            else { removeListeners(); }
         },

         destroy: () => removeListeners()
      };
   }

</script>

<div class="window-resizable-handle"
     use:resizable={$storeResizable}
     bind:this={elementResize}>
   <i class="fas fa-arrows-alt-h"></i>
</div>
