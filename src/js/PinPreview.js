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

import ErrorUtil from 'services/ErrorUtil';
import Analytics from 'services/Analytics';
import API from 'services/API';

/**
 * Class PinPreview
 */
export default class PinPreview {

    constructor(file) {
        this.file = file;

        let name = this.file.name.split('.');
        // Remove the extension from the filename array
        name.pop();
        // Re-join the remaining elements in the filename array, in case the filename itself had other fullstops in it
        this.name = name.join('.');
    }

    /**
     * Save the instance of the pin preview element that has been imported into the DOM
     *
     * @param instance
     *
     * @returns {PinPreview}
     */
    setInstance(instance) {
        this.instance          = instance;
        this.actionMenuTrigger = this.instance.querySelector('.preview-action-btn');
        this.actionMenu        = this.instance.querySelector('.preview-actions');
        this.note              = this.instance.querySelector('#note');
        this.link              = this.instance.querySelector('.link');

        return this;
    }

    /**
     * Attach event listeners to various elements in the Pin Preview
     *
     * @returns {null}
     */
    attachListeners() {

        // Event listener to show/hide the actions menu
        this.actionMenuTrigger.addEventListener('click', e => {
            if (!this.isActionMenuVisible()) {
                this.showPreviewActions();
            } else {
                this.hidePreviewActions();
            }
        });

        // Event listener to populate the note with the name of the file being pinned
        this.actionMenu.querySelector('.preview-action').addEventListener('click', e => {
            switch (e.target.dataset.action) {
                case 'filename':
                    this.setNote(this.name);
                    break;
            }
        });
    }

    /**
     * Show the preview actions menu for the current Pin Preview
     *
     * @returns {null}
     */
    showPreviewActions() {
        this.actionMenu.classList.add('is-visible');
    }

    /**
     * Hide the preview actions menu for the current Pin Preview
     *
     * @returns {null}
     */
    hidePreviewActions() {
        this.actionMenu.classList.remove('is-visible');
    }

    /**
     * Determine if the action menu for this PinPreview class is showing
     *
     * @returns {boolean}
     */
    isActionMenuVisible() {
        return this.actionMenu.classList.contains('is-visible');
    }

    /**
     * Determine if this pin preview has been sent to Pinterest
     *
     * @returns {boolean}
     */
    isPinned() {
        return !!this.instance.dataset.pinned || false;
    }

    /**
     * Set value for the note textarea
     *
     * @param {string} value The new value for the note
     *
     * @returns {null}
     */
    setNote(value) {
        this.note.value = value;
    }

    /**
     * Set value for link
     *
     * @param {string} link The value to be set for the link field
     *
     * @returns {null}
     */
    setLink(link) {
        this.link.value = link;
    }

    /**
     * Render a pin preview template instance
     *
     * @returns {Node}
     */
    render() {
        const template = document.getElementById('preview-template');
        const instance = document.importNode(template.content, true);

        const reader = new FileReader();

        reader.onload = (theFile => {
            const previewContainer = theFile.querySelector('.preview-container');
            const previewImage = previewContainer.querySelector(".preview-image");

            return e => {
                previewImage.src = e.target.result;
                previewImage.classList.toggle('loaded', true);
            };
        })(instance);

        reader.abort();
        reader.readAsDataURL(this.file);

        return instance;
    }

    /**
     * Send request to Pinterest to pin this image
     *
     * @returns {null}
     */
    createPin() {
        const imageData = this.instance.querySelector('.preview-image').src;
        const note      = this.instance.querySelector(".note").value;
        const board     = this.instance.querySelector(".board-names").value;
        const link      = this.instance.querySelector(".link").value;

        this.instance.classList.toggle('sending', true);
        if (typeof this.instance.dataset.pinError !== 'undefined') {
            delete this.instance.dataset.pinError; // Remove any previous error that might be displaying
        }

        try {
            API.CreatePin({
                board: board, // Sending just the board ID. Documentation doesn't say this can be done, but it works. Reason is: spaces in board names
                image_base64: imageData,
                note: note,
                link: link
            })
                .then(response => {
                    this.instance.dataset.pinned = true;
                    this.instance.classList.toggle('sending', false);
                    Analytics.PinCreated();
                })
                .catch(err => {
                    ErrorUtil.Log(new Error('Create Pin promise rejected'), {
                        error: err,
                        severity: 'error'
                    });
                });
        } catch (exception) {
            ErrorUtil.Log(new Error('Exception thrown from CreatePin function'), {
                metaData: {
                    'details': exception
                },
                severity: 'error'
            });
        }
    }
}
