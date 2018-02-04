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

import DataStore from 'services/DataStore';

/**
 * Class Analytics
 */
export default class Analytics {

    /**
     * Perform analytics tracking actions relative to a pin being created
     *
     * @returns {null}
     */
    static PinCreated() {
        Analytics.FireEvent('pin_created', {
            'event_category': 'pins',
            'event_label':'created',
            'value': '1'
        });
    }

    /**
     * Fire an event to help track which features are used
     *
     * @param {string} shortcutName The label of the shortcut that was used
     *
     * @returns {null}
     */
    static KeyboardShortcutUsed(shortcutName) {
        Analytics.FireEvent('keyboard_shortcut_used', {
            'event_category': 'keyboard_shortcuts',
            'value': shortcutName
        });
    }

    /**
     * Fire an event to help track which features are used
     *
     * @param {string} featureName The label of the feature that was used
     *
     * @returns {null}
     */
    static FeatureUsed(featureName) {
        Analytics.FireEvent('feature_used', {
            'event_category': 'features',
            'value': featureName
        });
    }

    /**
     * Fire an event on Google Analytics
     *
     * @param {string} eventAction  The 'action' of the event to creation
     * @param {Object} eventOptions Extra options to send with the event action
     *
     * @returns {null}
     */
    static FireEvent(eventAction, eventOptions) {
        if (DataStore.Get(DataStore.DATA__IS_ADMIN) === null) {
            gtag('event', eventAction, eventOptions);
        }
    }
}
