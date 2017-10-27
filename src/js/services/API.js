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
import AJAX from 'services/AJAX';
import DataStore from 'services/DataStore';

/**
 * Class API
 *
 * Interface for communicating with the API
 */
export default class API {

    /**
     * Check if a user has authenticated the application. I.e. an access token exists
     *
     * @returns {boolean}
     */
    static IsAuthenticated() {
        return DataStore.Get(DataStore.DATA__ACCESS_TOKEN()) !== null;
    }

    /**
     * Initialise the Pinterest SDK and call the login function to get an access token
     * Access token information will be set in the Pinterest SDK, however at the moment
     * the SDK is only used here
     *
     * @returns {Promise}
     */
    static Login() {
        return new Promise((resolve, reject) => {
            PDK.init({
                appId: "4927694653406329461", // Change this
                cookie: true
            });
            PDK.login({scope: 'read_public, write_public'}, ({session}) => {
                PDK.setSession(session);
                resolve(session);
            })
        });
    }

    /**
     * Get cursor of users' Pins
     *
     * @returns {Promise}
     */
    static Pins() {
        return new Promise((resolve, reject) => {
            AJAX.Post('me/pins/', data)
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Get list of users boards
     *
     * @returns {Promise}
     */
    static Boards() {
        return new Promise((resolve, reject) => {
            AJAX.Get('me/boards/', {
                access_token: DataStore.Get(DataStore.DATA__ACCESS_TOKEN())
            }, true)
                .then(({data}) => {
                    data.sort((a, b) => {
                        let nameA = a.name.toUpperCase();
                        let nameB = b.name.toUpperCase();
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }
                        return 0;
                    });

                    resolve(data);
                })
        });
    }

    /**
     * Send request to Pinterest API to create a new pin
     *
     * @param {Object} data The data to create the pin with
     *
     * @returns {Promise}
     */
    static CreatePin(data) {
        return new Promise((resolve, reject) => {
            AJAX.Post('pins/', {
                access_token: DataStore.Get(DataStore.DATA__ACCESS_TOKEN()),
                ...data
            })
            .then(resolve)
            .catch(reject);
        });
    }
}
