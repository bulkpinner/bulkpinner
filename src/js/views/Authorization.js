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

import CustomEvent from 'services/CustomEvent';
import API from 'services/API';
import DataStore from 'services/DataStore';

/**
 * Class Authorization
 */
export default class Authorization {

    constructor() {
        this.authenticationContainer = document.querySelector(".authentication-container");
        this.authenticationButton    = document.querySelector(".authenticate-button");

        // Listen for the instruction that the user isn't authenticated yet
        CustomEvent.on('user-not-authenticated', () => {
            this.init();
        });
    }

    /**
     * Initialise the authorization section of the application
     *
     * @returns {null}
     */
    init() {
        this.showAuthenticationContainer();
        this.attachListeners();
    }

    /**
     * @returns {null}
     */
    showAuthenticationContainer() {
        this.authenticationContainer.classList.toggle('hidden', false);
        CustomEvent.trigger('authentication-shown');
    }

    /**
     * @returns {null}
     */
    hideAuthenticationContainer() {
        this.authenticationContainer.classList.toggle('hidden', true);
        CustomEvent.trigger('authentication-hidden');
    }

    /**
     * Attach event listeners
     *
     * @returns {null}
     */
    attachListeners() {
        this.authenticationButton.addEventListener('click', () => {
            API.Login()
            .then(({accessToken}) => {
                DataStore.Set(DataStore.DATA__ACCESS_TOKEN(), accessToken);
                CustomEvent.trigger('user-authenticated');
            })
            .catch((response) => {
                console.error(response);
            });
        });

        // Make sure the authentication container is hidden if the application container gets shown
        CustomEvent.on('user-authenticated', e => {
            this.hideAuthenticationContainer();
        });
    }
}
