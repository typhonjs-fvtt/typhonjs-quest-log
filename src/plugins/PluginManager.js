import { EventbusSecure }  from '../../external/PluginManager.js';
import PluginManager       from '../../external/PluginManager.js';

const pluginManager = new PluginManager();

// Create a secure eventbus which can not have new registrations from plugin eventbus.
export const eventbus = EventbusSecure.initialize(pluginManager.getEventbus(), 'plugin-eventbus').eventbusSecure;

export default pluginManager;