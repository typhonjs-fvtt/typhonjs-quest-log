class GetSvelteData
{
   #svelteData;

   constructor(svelteData)
   {
      this.#svelteData = svelteData;
   }

   /**
    * Returns the indexed Svelte component.
    *
    * @param {number}   index -
    *
    * @returns {object} The loaded Svelte component.
    */
   component(index)
   {
      const data = this.#svelteData[index];
      return typeof data === 'object' ? data?.component : void 0;
   }

   /**
    * Returns the Svelte component entries iterator.
    *
    * @returns {Generator<(number|*)[], void, *>} Svelte component entries iterator.
    * @yields
    */
   *componentEntries()
   {
      for (let cntr = 0; cntr < this.#svelteData.length; cntr++)
      {
         yield [cntr, this.#svelteData[cntr].component];
      }
   }

   /**
    * Returns the Svelte component values iterator.
    *
    * @returns {Generator<*, void, *>} Svelte component values iterator.
    * @yields
    */
   *componentValues()
   {
      for (let cntr = 0; cntr < this.#svelteData.length; cntr++)
      {
         yield this.#svelteData[cntr].component;
      }
   }

   /**
    * Returns the indexed SvelteData entry.
    *
    * @param {number}   index -
    *
    * @returns {object} The loaded Svelte config + component.
    */
   data(index)
   {
      return this.#svelteData[index];
   }

   /**
    * Returns the SvelteData entries iterator.
    *
    * @returns {IterableIterator<[number, Object]>} SvelteData entries iterator.
    */
   dataEntries()
   {
      return this.#svelteData.entries();
   }

   /**
    * Returns the SvelteData values iterator.
    *
    * @returns {IterableIterator<Object>} SvelteData values iterator.
    */
   dataValues()
   {
      return this.#svelteData.values();
   }

   get length()
   {
      return this.#svelteData.length;
   }
}

Object.freeze(GetSvelteData);

export { GetSvelteData };