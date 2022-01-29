import {
   EventbusSecure,
   PluginManager }  from '@typhonjs-fvtt/runtime/plugin/manager';

const pluginManager = new PluginManager();

const mainEventbus = pluginManager.getEventbus();

// Create a secure eventbus which can not have new registrations from plugin eventbus.
export const eventbus = EventbusSecure.initialize(pluginManager.getEventbus(), 'plugin-eventbus').eventbusSecure;

mainEventbus.on('tql:eventbus:secure:get', () => eventbus);

export default pluginManager;