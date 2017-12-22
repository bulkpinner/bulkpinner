/* Bulk Pinner - Create multiple pins in your Pinterest boards at once
 * Copyright (C) 2017 Luke Denton
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Bullet from 'bullet-pubsub';

/**
 * Class Event
 *
 * Wrapper for the event library chosen, preventing the application from being tightly coupled to the library
 *
 * This class will only be used for custom events. Events like click, hover etc will be handled by vanilla JS handlers
 */
export default class CustomEvent {

    /**
     * Wrapper for the .on event listener
     *
     * @param {string}   eventName The name of the event to listen for
     * @param {function} callback  The function to execute when the event is detected
     *
     * @returns {null}
     */
    static on(eventName, callback) {
        Bullet.on(eventName, callback, false);
    }

    /**
     * Wrapper for the .off function
     *
     * @param {string}   eventName The name of the event to remove
     * @param {function} callback  [Optional] The function to remove. If the event listener needs to remain for some instances.
     *
     * @returns {null}
     */
    static off(eventName, callback) {
        Bullet.off(eventName, callback);
    }

    /**
     * Wrapper for the .once event listener.
     * This listener will only be triggered once, and then removed
     *
     * @param {string}   eventName The name of the event to listen for
     * @param {function} callback  The function to execute when event is detected
     *
     * @returns {null}
     */
    static once(eventName, callback) {
        Bullet.once(eventName, callback);
    }

    /**
     * Wrapper for the .trigger function, that will trigger an event
     *
     * @param {string} eventName The name of the event to trigger
     * @param {Object} data      [Optional] Custom data to pass to the event listener callback
     *
     * @returns {null}
     */
    static trigger(eventName, data = {}) {
        Bullet.trigger(eventName, data)
    }
}
