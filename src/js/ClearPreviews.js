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
export default class ClearPreviews {

    constructor() {
        this.clearButton    = document.querySelector(".clear-completed");
        this.clearAllButton = document.querySelector(".clear-all");

        this.attachListeners();
    }

    /**
     * Attach listeners to the clear buttons
     *
     * @returns {null}
     */
    attachListeners() {
        this.clearButton.addEventListener('click', e => {
            this.clearCompleted();
        });

        this.clearAllButton.addEventListener('click', e => {
            this.clearAll();
        });
    }

    /**
     * Clear preview pins that have been uploaded to pinterest
     *
     * @returns {null}
     */
    clearCompleted() {
        const completedPins = document.querySelectorAll(".preview-container[data-pinned='true']");
        this.clear(completedPins);
    }

    /**
     * Clear all preview pins
     *
     * @returns {null}
     */
    clearAll() {
        const previewPins = document.querySelectorAll(".preview-container");
        this.clear(previewPins);
    }

    /**
     * Remove elements from the DOM
     *
     * @param {NodeList} elements Array of elements to remove
     */
    clear(elements) {
        for (let i = 0 ; i < elements.length ; i++) {
            elements[i].remove();
        }

        if (document.querySelectorAll(".preview-container").length === 0) {
            document.querySelector('.page-header').classList.toggle('large', true);
            document.querySelector('.get-started').classList.toggle('hidden', false);
            document.querySelector('.application-container').classList.toggle('expanded', false);
            document.querySelector('.label-text').innerText = 'Choose Images';
            document.querySelector('.preview-pins-container').classList.toggle('hidden', true);
        }
    }
}
