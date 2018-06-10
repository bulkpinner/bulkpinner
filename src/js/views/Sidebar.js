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
 * Class Sidebar
 */
export default class Sidebar {

    constructor(selector) {
        this.element = document.querySelector(selector);
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.element.querySelector('.sidebar-close').addEventListener('click', (e) => {
            e.preventDefault();
            this.hide();
        });
    }

    /**
     *
     * Toggle the visibility of the sidebar menu
     *
     * @param show [Optional] Boolean for forcing the visibility
     *
     * @returns {null}
     */
    toggle(show = undefined) {
        this.element.classList.toggle('is-active', show);
    }

    /**
     * Show the sidebar
     *
     * @returns {null}
     */
    show() {
        this.toggle(true);
    }

    /**
     * Hide the sidebar
     *
     * @returns {null}
     */
    hide() {
        this.toggle(false);
    }
}
