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

/**
 * Class API
 *
 * Interface for communicating with the API
 */
export default class DataStore {

    /**
     * String constant for access token key
     *
     * @returns {string}
     */
    static DATA__ACCESS_TOKEN() {
        return 'pinterest_accessToken';
    }

    static DATA__BOARDS() {
        return 'pinterest_boards';
    }

    /**
     * Set value in the data store
     *
     * @param {string} key   The identifying key for the value
     * @param {string} value The value for the identifying key
     *
     * @returns {null}
     */
    static Set(key, value) {
        window.localStorage.setItem(key, value);
    }

    /**
     * Get the value for a given key
     *
     * @param {string} key The identifying key for the value
     *
     * @returns {string}
     */
    static Get(key) {
        return window.localStorage.getItem(key);
    }
}
