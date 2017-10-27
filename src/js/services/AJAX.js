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
import ajax from 'packing-ajax'

/**
 * Class AJAX
 *
 * Abstraction of all AJAX interactions
 */
export default class AJAX {

    /**
     * Class constructor
     *
     * @returns {null}
     */
    constructor() {
        this.baseUrl = 'https://api.pinterest.com/';
        this.apiVersion = 'v1/';
    }

    /**
     * Build the URL of the appropriate API being called
     *
     * @param {string}  endpoint The API endpoint being queried
     *
     * @returns {string}
     * @private
     */
    _buildUrl(endpoint) {
        return this.baseUrl + this.apiVersion + endpoint;
    }

    /**
     * Execute the API query
     *
     * @param {string} endpoint The API endpoint to be queried
     * @param {Object} data     Any additional data required
     * @param {string} type     The type of request being made. E.g. GET, POST etc
     *
     * @returns {Promise}
     * @private
     */
    _fetch(endpoint, data, type) {
        return new Promise((resolve, reject) => {
            const url = this._buildUrl(endpoint);

            ajax({
                url: url,
                type: type,
                dataType: 'json',
                data: data,
                success: (response) => {
                    resolve(response);
                },
                error: (response) => {
                    reject(response);
                }
            });
        });
    }

    /**
     * Helper function for performing a GET request
     *
     * @param {string} endpoint The API endpoint to be queried
     * @param {Object} data     Additional data to be sent with the request
     *
     * @returns {Promise}
     */
    static Get(endpoint, data) {
        return new Promise((resolve, reject) => {
            const ajax = new AJAX();
            ajax._fetch(endpoint, data, 'GET')
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Helper function for performing a POST request
     *
     * @param {string} endpoint The API endpoint to be queried
     * @param {Object} data     Additional data to be sent with the request
     *
     * @returns {Promise}
     */
    static Post(endpoint, data) {
        return new Promise((resolve, reject) => {
            const ajax = new AJAX();
            ajax._fetch(endpoint, data, 'POST')
                .then(resolve)
                .catch(reject);
        });
    }
}
