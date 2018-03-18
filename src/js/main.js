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

import Authorization from 'views/Authorization';
import Application from 'views/Application';
import API from 'services/API';
import CustomEvent from 'services/CustomEvent';

// If the user is using Internet Explorer, kindly let them know that their browser is out of date, and that they should update
if (window.navigator.userAgent.indexOf("MSIE") > 0 || !!navigator.userAgent.match(/Trident\/7\./)) {
    document.querySelector('body').classList.add('no-scroll');
    document.querySelector('.modal-overlay').classList.remove('hidden');
    document.querySelector('.modal-overlay').classList.add('ie-overlay');
    document.querySelector('.modal-overlay').querySelector('.internet-explorer-disabled').classList.remove('hidden');
} else {
    // Create instances of application classes
    new Authorization();
    new Application();

    // Determine if used is logged in and publish appropriate status
    if (!API.IsAuthenticated()) {
        CustomEvent.trigger('user-not-authenticated');
    } else {
        CustomEvent.trigger('user-authenticated');
    }

    const bugsnagOptions = {
        apiKey: '856ea8cf87049704dbad28042ef0aa16',
        appVersion: '[[applicationVersion]]',
        releaseStage: 'production',
        notifyReleaseStages: ['production', 'staging'],
        collectUserIp: false
    };

    if (window.location.origin !== 'https://bulkpinner.github.io') {
        bugsnagOptions.releaseStage = 'developer';
    }

    // Now that the error-capture.js file is loaded asynchronously, need to wait until the page has loaded before initialising
    window.addEventListener('load', () => {
        window.bugsnagClient = bugsnag(bugsnagOptions)
    })
}
