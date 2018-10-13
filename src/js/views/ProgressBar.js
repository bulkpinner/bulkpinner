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
 * Class ProgressBar
 */
class ProgressBar {

    /**
     *
     * @param {int} totalParts The total
     */
    constructor(totalParts) {
        this.progressBarElement = document.querySelector('.progress-bar');
        this.increments = 100 / totalParts;
        this.width = 0;
    }

    /**
     * Start the progress bar by first making it visible
     */
    start() {
        this.progressBarElement.classList.toggle('invisible', false);
    }

    /**
     * Finish the progress bar by making it invisible and then setting width back to 0
     * This way it is ready for a second use
     */
    finish() {
        this.progressBarElement.classList.toggle('invisible', true);
        setTimeout(() => {
            // Allow for the 'fade out' animation when applying the invisible class
            // Without this timeout, the user would see the progress bar slide bar to 0
            this.progressBarElement.style.width = '0%';
        }, 1000);
    }

    /**
     * Increase the width property by the increment amount
     */
    increment() {
        this.width = this.width + this.increments;
        this.setAttribute();

        if (this.width >= 100) {
            setTimeout(() => {
                this.finish();
            }, 1500)
        }
    }

    /**
     * Set the width on the progress bar element
     */
    setAttribute() {
        this.progressBarElement.style.width = `${this.width}%`;
    }

}

export default ProgressBar;
