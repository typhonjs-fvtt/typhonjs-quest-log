/**
 * Provides a custom override to PermissionControl enabling GM & trusted player w/ edit capabilities to alter
 * quest permissions. The default PermissionControl only allows GM level users permission editing.
 *
 * When the underlying document / {@link JournalEntry} is updated the {@link QuestDB} will receive this update and
 * fire {@link QuestDBHooks} that other parts of TQL can respond to handle as necessary. In particular
 * {@link ViewManager} handles these hooks to update the GUI on local and remote clients when permissions change.
 */
export default class TQLPermissionControl extends PermissionControl
{
   /** @override */
   async _updateObject(event, formData)
   {
      event.preventDefault();

      // Collect user permissions
      const perms = {};
      for (const [user, level] of Object.entries(formData))
      {
         if ((name !== 'default') && (level === -1))
         {
            delete perms[user];
            continue;
         }
         perms[user] = level;
      }

      return this.document.update({ permission: perms }, { diff: false, recursive: false, noHook: true });
   }
}