import { constants, settings } from '#constants';

/**
 * Manages the state of the Foundry UI elements including the {@link Hotbar}, {@link SceneNavigation} and
 * {@link Sidebar} providing management of the {@link QuestTracker}. Controls pinning the QuestTracker to the sidebar
 * and modifications to the SceneNavigation width when pinned.
 */
export default class PositionValidator
{
   static dragHeader = false;

   static inPinDropRect = false;

   /**
    * @type {QuestTrackerApp}
    */
   static tracker;

   /**
    * @param {QuestTrackerApp} tracker -
    *
    * Registers browser window resize event callback and Foundry render Hook for {@link SceneNavigation} and
    * {@link QuestTracker}.
    */
   static init(tracker)
   {
      this.tracker = tracker;

      // Subscribe to dragging state changes.
      this.tracker.reactive.storeUIOptions.dragging.subscribe(this.handleDraggingState.bind(this));

      globalThis.addEventListener('resize', s_WINDOW_RESIZE);
      Hooks.on('collapseSidebar', PositionValidator.collapseSidebar);
      Hooks.on('renderSceneNavigation', PositionValidator.updateTrackerPinned.bind(this));

      sidebar.currentCollapsed = ui?.sidebar?._collapsed || false;

      s_STORE_STATE();

      PositionValidator.updateTrackerPinned();
   }

   /**
    * Check the position against the sidebar and hotbar.
    *
    * @param {QuestTrackerApp} app - The quest tracker.
    *
    * @param {PositionData}   position - The complete position with top, left, width, height keys.
    *
    * @returns {PositionData} Adjusted position data.
    */
   static checkPosition(app, position)
   {
      const sidebarData = sidebar.currentCollapsed ? sidebar.collapsed : sidebar.open;

      const resizeWidth = this.tracker.position.width < position.width;
      const resizeHeight = this.tracker.position.height < position.height;

      // Detect if the new position overlaps with the sidebar.
      if (sidebarData.gapX >= 0 && position.left + this.tracker.position.width > sidebarData.left - s_SPACE_X)
      {
         // This is a resize width change, so limit the new position width to the sidebar left side.
         if (resizeWidth)
         {
            position.width = sidebarData.left - s_SPACE_X - position.left;
         }
         else // Otherwise move the new position to the left pinning the position to the sidebar left.
         {
            position.left = sidebarData.left - s_SPACE_X - this.tracker.position.width;
            if (position.left < 0) { position.left = 0; }
         }
      }

      // If not pinned adjust the position top based on the hotbar top.
      if (!this.tracker.options.pinned && hotbar.gapY >= 0 && position.top + position.height > hotbar.top)
      {
         if (resizeHeight)
         {
            position.height = hotbar.top - s_SPACE_Y - position.top;
            this.tracker.position.height = position.height;
         }
         else
         {
            position.top = hotbar.top - s_SPACE_Y - position.height;
            if (position.top < 0) { position.top = 0; }
         }
      }

      // If pinned always make sure the position top is the sidebar top.
      if (this.tracker.options.pinned) { position.top = sidebarData.top; }

      s_SAVE_POSITION(position);

      // TODO: RECT PIN RELATED
      const currentInPinDropRect = sidebarData.rectDock.contains(
       this.tracker.position.left + this.tracker.position.width, this.tracker.position.top);

      this.inPinDropRect = sidebarData.rectDock.contains(position.left + position.width, position.top);

      // Set the jiggle animation if the position movement is coming from dragging the header and the pin drop state
      // has changed.
      // if (!this.tracker.options.pinned && this.#dragHeader && currentInPinDropRect !== this.#inPinDropRect)
      if (this.tracker?.elementTarget && this.dragHeader && !this.tracker.options.pinned && currentInPinDropRect !== this.inPinDropRect)
      {
         this.tracker.elementTarget.style.animation = this.inPinDropRect ? 'tql-jiggle 0.3s infinite' : '';
      }

      return position;
   }

   /**
    * The `collapseSidebar` Hook callback. Store the new state and update the tracker.
    *
    * @param {Sidebar}  sidebarUI - The Foundry Sidebar.
    *
    * @param {boolean}  collapsed - The sidebar collapsed state.
    */
   static collapseSidebar(sidebarUI, collapsed)
   {
      sidebar.currentCollapsed = collapsed;
      s_STORE_STATE();
      PositionValidator.updateTracker();
   }

   /**
    * Handles setting {@link TQLSettings.questTrackerPinned} based on current dragging state.
    *
    * @param {boolean}   dragging - Current dragging state.
    */
   static async handleDraggingState(dragging)
   {
      if (dragging)
      {
         this.dragHeader = true;
         this.tracker.options.pinned = false;

         // Only set `setting.questTrackerPinned` to false if it is currently true.
         if (game.settings.get(constants.moduleName, settings.questTrackerPinned))
         {
            await game.settings.set(constants.moduleName, settings.questTrackerPinned, false);
         }
      }
      else
      {
         this.dragHeader = false;

         if (this.inPinDropRect)
         {
            this.tracker.options.pinned = true;
            await game.settings.set(constants.moduleName, settings.questTrackerPinned, true);

            if (this.tracker?.elementTarget)
            {
               this.tracker.elementTarget.style.animation = '';
            }
         }
      }

      this.updateTrackerPinned();
      this.updateTracker();
   }

   /**
    * Updates the tracker bounds based on pinned state and invokes {@link QuestTracker.setPosition} if changes occur.
    */
   static updateTracker()
   {
      // Make sure the tracker is rendered or rendering.
      switch (this.tracker._state)
      {
         case Application.RENDER_STATES.RENDERED:
         case Application.RENDER_STATES.RENDERING:
            break;
         default: return;
      }

      const sidebarData = sidebar.currentCollapsed ? sidebar.collapsed : sidebar.open;

      // Store the current position before any modification.
      const position = {
         pinned: false,
         top: this.tracker.position.top,
         left: this.tracker.position.left,
         width: this.tracker.position.width,
         height: this.tracker.position.height
      };

      // If the tracker is pinned set the top / left based on the sidebar.
      if (this.tracker.options.pinned)
      {
         position.top = sidebarData.top;
         position.left = sidebarData.left - this.tracker.position.width - s_SPACE_X;
      }
      else // Make sure the tracker isn't overlapping the sidebar or hotbar.
      {
         const trackerRight = this.tracker.position.left + this.tracker.position.width;
         if (trackerRight > sidebarData.left - s_SPACE_X)
         {
            position.left = sidebarData.left - this.tracker.position.width - s_SPACE_X;
            if (position.left < 0) { position.left = 0; }
         }

         const trackerBottom = this.tracker.position.top + this.tracker.position.height;
         if (trackerBottom > hotbar.top - s_SPACE_Y)
         {
            position.top = hotbar.top - this.tracker.position.height - s_SPACE_Y;
            if (position.top < 0) { position.top = 0; }
         }
      }

      // Only post a position change if there are modifications.
      if (position.top !== this.tracker.position.top || position.left !== this.tracker.position.left ||
       position.width !== this.tracker.position.width || position.height !== this.tracker.position.height)
      {
         this.tracker.setPosition(position);
      }
   }

   /**
    * Updates state when the quest tracker is pinned / unpinned. Currently manipulates the Foundry
    * {@link SceneNavigation} component width so that it doesn't overlap the pinned quest tracker.
    */
   static updateTrackerPinned()
   {
      const sidebarData = sidebar.open;

      let width = navigation.left + sidebarData.width + s_SPACE_NAV_X;
      width += this.tracker.options.pinned ? this.tracker.position.width : 0;
      ui?.nav?.element?.css('width', `calc(100% - ${width}px`);
   }

   /**
    * Unregisters browser window event callback and Foundry render hook for {@link QuestTracker}.
    */
   static unregister()
   {
      globalThis.removeEventListener('resize', s_WINDOW_RESIZE);

      Hooks.off('collapseSidebar', PositionValidator.collapseSidebar);
      Hooks.off('renderSceneNavigation', PositionValidator.updateTrackerPinned);
      Hooks.off('renderQuestTracker', s_QUEST_TRACKER_RENDERED);
   }
}

/**
 * Provides a debounced function to save position to {@link TQLSettings.questTrackerPosition}.
 *
 * @type {(function(object): void)}
 */
const s_SAVE_POSITION = foundry.utils.debounce((currentPosition) =>
{
   game.settings.set(constants.moduleName, settings.questTrackerPosition, JSON.stringify(currentPosition));
}, 1000);

/**
 * Defines a rectangle with essential contains check. Used to define the pinning rectangle next to the
 * upper left of the sidebar.
 */
class TQLRect
{
   /**
    * @param {number}   x - Left
    *
    * @param {number}   y - Top
    *
    * @param {number}   width - Width
    *
    * @param {number}   height - Height
    */
   constructor(x, y, width, height)
   {
      /**
       * @type {number}
       */
      this.x = x;

      /**
       * @type {number}
       */
      this.y = y;

      /**
       * @type {number}
       */
      this.width = width;

      /**
       * @type {number}
       */
      this.height = height;
   }

   /**
    * Tests if the point is contained by this TQLRect.
    *
    * @param {number}   x - Point X
    *
    * @param {number}   y - Point Y
    *
    * @returns {boolean} Is point contained in rectangle.
    */
   contains(x, y)
   {
      return this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height;
   }
}

/**
 * Stores the navigation element parameters.
 *
 * @type {object}
 */
const navigation = {
   left: ''
};

/**
 * Stores the state of the sidebar.
 *
 * @type {object}
 */
const sidebar = {
   currentCollapsed: false,

   collapsed: {
      gapX: -1,
      gapY: -1,
      top: -1,
      left: -1,
      width: -1,
      height: -1,
      rectDock: new TQLRect(0, 0, 15, 30)
   },

   open: {
      gapX: -1,
      gapY: -1,
      top: -1,
      left: -1,
      width: -1,
      height: -1,
      rectDock: new TQLRect(0, 0, 15, 30)
   }
};

/**
 * Stores the bounds of the hotbar.
 *
 * @type {object}
 */
const hotbar = {
   gapX: -1,
   gapY: -1,
   top: -1,
   left: -1,
   width: -1,
   height: -1
};

/**
 * Invokes `updateTracker` when the QuestTracker is rendered.
 *
 * @param {Application} app - The Application instance being rendered.
 */
function s_QUEST_TRACKER_RENDERED(app)
{
   // TODO UNCOMMENT AFTER NEW QUEST TRACKER IS FINISHED
   // if (app instanceof QuestTracker) { PositionValidator.updateTracker(); }

   PositionValidator.updateTracker();
}

/**
 * Buffer space between sidebar and right side of quest tracker.
 *
 * @type {number}
 */
const s_SPACE_X = 8;

/**
 * Buffer space between hotbar and bottom side of quest tracker.
 *
 * @type {number}
 */
const s_SPACE_Y = 8;

/**
 * Buffer space for the navigation bar.
 *
 * @type {number}
 */
const s_SPACE_NAV_X = 22;

/**
 * Stores the current Foundry UI calculated bounds state.
 */
function s_STORE_STATE()
{
   const sidebarElem = ui?.sidebar?.element[0];
   const sidebarRect = sidebarElem?.getBoundingClientRect();

   const navLeft = ui?.nav?.element?.css('left');
   if (typeof navLeft === 'string') { navigation.left = parseInt(navLeft, 10); }

   if (sidebarRect)
   {
      const sidebarData = sidebar.currentCollapsed ? sidebar.collapsed : sidebar.open;

      // Store gapX / gapY calculating including any ::before elements if it has not already been set.
      // This is only calculated one time on startup.
      if (sidebarData.gapX < 0)
      {
         let beforeWidth;
         let beforeHeight;
         try
         {
            const style = globalThis.getComputedStyle(sidebarElem, 'before');

            const width = parseInt(style.getPropertyValue('width'), 10);
            if (!Number.isNaN(width)) { beforeWidth = width; }

            const height = parseInt(style.getPropertyValue('height'), 10);
            if (!Number.isNaN(height)) { beforeHeight = height; }
         }
         catch (err) { /**/ }

         sidebarData.gapX = beforeWidth && beforeWidth > sidebarRect.width ? beforeWidth - sidebarRect.width : 0;
         sidebarData.gapY = beforeHeight && beforeHeight > sidebarRect.height ? beforeHeight - sidebarRect.height : 0;
      }

      sidebarData.left = sidebarRect.left - sidebarData.gapX;
      sidebarData.top = sidebarRect.top - sidebarData.gapY;
      sidebarData.width = sidebarRect.width + sidebarData.gapX;
      sidebarData.height = sidebarRect.height + sidebarData.gapY;

      sidebarData.rectDock.x = sidebarData.left - sidebarData.rectDock.width;
   }

   const hotbarElem = ui?.hotbar?.element[0];
   const hotbarRect = hotbarElem?.getBoundingClientRect();

   if (hotbarRect)
   {
      // Store gapX / gapY calculating including any ::before elements if it has not already been set.
      // This is only calculated one time on startup.
      if (hotbar.gapX < 0)
      {
         let beforeWidth;
         let beforeHeight;
         try
         {
            const style = globalThis.getComputedStyle(hotbarElem, 'before');

            const width = parseInt(style.getPropertyValue('width'), 10);
            if (!Number.isNaN(width)) { beforeWidth = width; }

            const height = parseInt(style.getPropertyValue('height'), 10);
            if (!Number.isNaN(height)) { beforeHeight = height; }
         }
         catch (err) { /**/ }

         hotbar.gapX = beforeWidth && beforeWidth > hotbarRect.width ? beforeWidth - hotbarRect.width : 0;
         hotbar.gapY = beforeHeight && beforeHeight > hotbarRect.height ? beforeHeight - hotbarRect.height : 0;
      }

      hotbar.left = hotbarRect.left - hotbar.gapX;
      hotbar.top = hotbarRect.top - hotbar.gapY;
      hotbar.width = hotbarRect.width + hotbar.gapX;
      hotbar.height = hotbarRect.height + hotbar.gapY;
   }
}

/**
 * Callback for window resize events. Update tracker position.
 */
function s_WINDOW_RESIZE()
{
   s_STORE_STATE();
   PositionValidator.updateTracker();
}