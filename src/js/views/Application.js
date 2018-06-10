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
import PinPreview from 'PinPreview';
import Mousetrap from 'mousetrap';
import debounce from 'debounce';
import Analytics from 'services/Analytics';
import Sidebar from 'views/Sidebar';

/**
 * Class Application
 */
export default class Application {

    constructor() {
        this.previewsPinsContainer = document.querySelector('.preview-pins-container');
        this.imageSelectContainer = document.querySelector(".image-select-container");
        this.pinsContainer = document.querySelector('.pins-container');
        this.sendToPinterestButton = document.querySelector('.send-to-pinterest');
        this.sendAllToBoardSelect = document.getElementById('send-all-to-board');
        this.fileUploadInput = document.getElementById("fileToUpload");
        this.modalOverlay = document.querySelector('.modal-overlay');
        this.userActionMenuToggle = document.querySelector('.user-action-menu-toggle');
        this.userActionsContainer = document.querySelector('.user-actions-container');
        this.refreshBoardsButtons = document.querySelectorAll('.action__refresh-boards');
        this.clearButtons    = document.querySelectorAll(".action__clear-completed");
        this.clearAllButtons = document.querySelectorAll(".action__clear-all");
        this.disconnectButtons = document.querySelectorAll('.action__disconnect');
        this.pinPreviews = [];

        this.sidebar = new Sidebar('.sidebar');

        // Wait until the user is authenticated before showing the main application interface
        CustomEvent.on('user-authenticated', () => {
            this.init();
        });
    }

    /**
     * @returns {null}
     */
    init() {
        this.showApplicationContainer();
        this.attachListeners();
        this.createKeyboardShortcuts();
    }

    /**
     * @returns {null}
     */
    showApplicationContainer() {
        this.imageSelectContainer.classList.toggle('hidden', false);
        this.userActionsContainer.classList.toggle('hidden', false);
    }

    /**
     * @returns {null}
     */
    hideApplicationContainer() {
        this.imageSelectContainer.classList.toggle('hidden', true);
    }

    /**
     * Attach event listeners
     *
     * @returns {null}
     */
    attachListeners() {
        for (let i = 0 ; i < this.refreshBoardsButtons.length ; i++) {
            let button = this.refreshBoardsButtons[i];
            button.addEventListener('click', e => {
                e.preventDefault();
                this.toggleActionMenu(false);
                this.loadBoards(true)
                    .then(boards => {
                        this.populateBoardNames(boards);
                    })
                    .catch(response => {
                        console.error(response);
                    });
                Analytics.FeatureUsed('refresh_boards');
                this.toggleActionMenu(false);
            });
        }

        for (let j = 0 ; j < this.clearButtons.length ; j++) {
            let button = this.clearButtons[j];
            button.addEventListener('click', e => {
                e.preventDefault();
                this.clearCompleted();
                this.toggleActionMenu(false);
            });
        }

        for ( let k = 0 ; k < this.clearAllButtons.length ; k++) {
            let button = this.clearAllButtons[k];
            button.addEventListener('click', e => {
                e.preventDefault();
                this.clearAll();
                this.toggleActionMenu(false);
            })
        }

        this.pinsContainer.addEventListener('blur', e => {
            if (e.target.matches('.note')) {
                e.target.classList.toggle('invalid', e.target.value !== '');
            }
        });

        // Event listener that will handle closing any open action menus
        document.querySelector('body').addEventListener('click', (e) => {
            this.pinPreviews.forEach(pinPreview => {
                if (pinPreview.actionMenuTrigger !== e.target) {
                    pinPreview.hidePreviewActions();
                }
            });
            this.toggleActionMenu(false);

            if (e.target.matches('.paypal-me-link')) {
                Analytics.LinkClicked('paypal-me');
            }
        });

        this.sendToPinterestButton.addEventListener('click', () => {
            if (this.validateInputs()) {
                this.createPins();
            }
        });

        this.sendAllToBoardSelect.addEventListener('change', e => {
            const boardValue = e.target.value;

            if (boardValue !== '') {
                this.updateSelectedBoards(boardValue);
                Analytics.FeatureUsed('update_selected_boards');
            }
        });

        this.fileUploadInput.onchange = e => this.createPinPreviews(e);

        document.querySelector('.privacy-policy-link').addEventListener('click', e => {
            this.showPrivacyPolicy();
        });

        document.querySelector('.modal-overlay').addEventListener('click', e => {
            if (e.target.classList.contains('modal-overlay')) {
                this.hidePrivacyPolicy();
                this.hideKeyboardShortcuts();
                return;
            }

            if (e.target.classList.contains('close')) {
                this.hidePrivacyPolicy();
                this.hideKeyboardShortcuts();
            }
        });

        // Prepare the preview pin template with names of boards to pin to
        this.loadBoards().then(boards => {
            this.populateBoardNames(boards);
        });

        // Listen for scroll event to check for updating the sticky-ness of the Pin button
        document.addEventListener('scroll', debounce(() => {
            this.updateStickyPin();
        }, 10, false));

        document.querySelector('.action-menu-toggle').addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            this.toggleActionMenu();
        });

        // @TODO This will need to be refactored - create an action menu class that will work for both the user actions and app actions
        this.userActionMenuToggle.addEventListener('click', e => {
            this.userActionsContainer.classList.toggle('show-menu');
        });

        for (let l = 0 ; l < this.disconnectButtons.length ; l++) {
            let button = this.disconnectButtons[l];
            button.addEventListener('click', e => {
                e.preventDefault();
                DataStore.Remove(DataStore.DATA__ACCESS_TOKEN());
                DataStore.Remove(DataStore.DATA__BOARDS());
                Analytics.FeatureUsed('disconnect_pinterest');
                location.reload();
            });
        }

        document.querySelector('.action__copy-fill').addEventListener('click', (e) => {
            e.preventDefault();
            this.autofillFields();
            this.toggleActionMenu(false);
        });

        document.querySelector('.keyboard-shortcuts').addEventListener('click', (e) => {
            e.preventDefault();

            this.showKeyboardShortcuts();
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
        this.pinPreviews = this.pinPreviews.filter(preview => !preview.isPinned());
    }

    /**
     * Clear all preview pins
     *
     * @returns {null}
     */
    clearAll() {
        this.pinPreviews = [];
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
            document.querySelector('.image-select-container').classList.toggle('fab-container', false);
            document.querySelector('.label-text').innerText = 'Choose Images';
            document.querySelector('.preview-pins-container').classList.toggle('hidden', true);
        }

        this.resetSendAllToBoard();
        this.toggleActionMenu(false);

        // Only remove the ads container if there is no more pin previews showing
        if (this.pinPreviews.length === 0) {
            document.querySelector('.preview-pins-aside').remove();
        }
    }

    /**
     * Reset the selected value in the Send all to board drop down
     *
     * @returns {null}
     */
    resetSendAllToBoard() {
        document.querySelector("#send-all-to-board").value = "";
    }

    /**
     * Assign application keyboard shortcuts
     *
     * @returns {null}
     */
    createKeyboardShortcuts() {
        // Choose/Add more pictures to pin
        Mousetrap.bind('a', () => {
            document.getElementById('fileToUpload').click();
            Analytics.KeyboardShortcutUsed('add_more');
        });

        // Clear all completed (pinned) images
        Mousetrap.bind('p c', () => {
            document.querySelector('.clear-completed.action-button').click();
            Analytics.KeyboardShortcutUsed('clear_completed');
        });

        // Clean all images
        Mousetrap.bind('p x', () => {
            document.querySelector('.clear-all.action-button').click();
            Analytics.KeyboardShortcutUsed('clear_all');
        });

        // Show privacy policy
        Mousetrap.bind('p p', () => {
            document.querySelector('.privacy-policy-link').click();
            Analytics.KeyboardShortcutUsed('show_privacy_policy');
        });

        // Show privacy policy
        Mousetrap.bind('esc', () => {
            this.hideKeyboardShortcuts();
            this.hidePrivacyPolicy();
        });

        // Autofill shortcut
        Mousetrap.bind('> > >', () => {
            this.autofillFields();
            Analytics.KeyboardShortcutUsed('autofill_fields');
        });

        // Show keyboard shortcuts modal
        Mousetrap.bind('?', () => {
            this.showKeyboardShortcuts();
            Analytics.KeyboardShortcutUsed('show_keyboard_shortcuts_modal');
        });
    }

    /**
     * Loop through the images selected and create instances of the Pin Preview class for each
     *
     * @param {Event} e The event object
     *
     * @returns {null}
     */
    createPinPreviews(e) {
        const input = e.target;

        if (input.files.length === 0) {
            return;
        }

        document.querySelector('.page-header').classList.toggle('large', false);
        document.querySelector('.get-started').classList.toggle('hidden', true);
        document.querySelector('.application-container').classList.toggle('expanded', true);
        document.querySelector('.image-select-container').classList.toggle('fab-container', true);
        document.querySelector('.label-text').innerText = 'Add More Images';
        this.previewsPinsContainer.classList.toggle('hidden', false);

        window.setTimeout(() => { // Allow time for the CSS animation to run before
            // Set the breakpoint for the Pin button becoming sticky _after_ the header is back to it's small state
            const scrollOffset = -20; // Padding changes from 30px top 10px, so that needs to be factored in
            this.windowBreakpoint = Math.abs(document.querySelector('.action-toolbar').getBoundingClientRect().top - document.querySelector('body').getBoundingClientRect().top - scrollOffset);

            for (let i = 0 ; i < input.files.length ; i++) {
                let file = input.files[i];
                let pinPreview = new PinPreview(file);
                this.previewsPinsContainer.querySelector(".pins-container").appendChild(pinPreview.render());

                // Grab the pin preview element that was just created and set it on the Pin Preview class
                // Unable to use the returned value of appendChild, as it returns and empty DocumentFragment
                let pinPreviews = this.previewsPinsContainer.querySelectorAll('.preview-container');
                let instance = pinPreviews[(pinPreviews.length - 1)];
                pinPreview.setInstance(instance);
                pinPreview.attachListeners();

                this.pinPreviews.push(pinPreview);
            }

            // Only activate the ads container if there isn't already one activated
            if (!document.querySelector('.preview-pins-aside')) {
                this.activateAdsenseTemplate();
            }
        }, 300);
    }

    /**
     * Load the users boards
     *
     * @param {Boolean} forceLoad [Optional] Indicates if the API should be queried regardless of DataStore
     *
     * @returns {Promise}
     */
    loadBoards(forceLoad = false) {
        return new Promise((resolve, reject) => {
            const boards = DataStore.Get(DataStore.DATA__BOARDS());
            if (boards !== null && !forceLoad) {
                resolve(JSON.parse(boards));
                return;
            }

            API.Boards()
            .then((boards) => {
                DataStore.Set(DataStore.DATA__BOARDS(), JSON.stringify(boards));
                resolve(boards);
            })
            .catch((response) => {
                reject(response);
            });
        });
    }

    /**
     * Populate the <select> of board names with the names returned from Pinterest API
     *
     * @param {Array} boards An array of board objects
     *
     * @return {null}
     */
    populateBoardNames(boards) {
        const boardNames = document.getElementById('preview-template').content.querySelector(".board-names");
        boardNames.innerHTML = ''; // Remove the 'Loading...' option

        if (boards.length === 0) {
            let option = this.createBoardNameOptionElement({id: '', name: `You don't have any Pinterest boards!`});
            boardNames.appendChild(option);
            document.querySelector(".send-to-pinterest").classList.toggle('hidden', true); // Can't send to pinterest as the user doesn't have any boards
            return;
        }

        // The user may have seen the message above, gone to Pinterest to create a board, and then come back to click the Refresh Boards button
        document.querySelector(".send-to-pinterest").classList.toggle('hidden', false);

        for (let i = 0 ; i < boards.length ; i++) {
            let board = boards[i];
            let option = this.createBoardNameOptionElement(board);
            boardNames.appendChild(option);
        }

        // Update any <select> elements in preview-containers that have already been activated from the template
        const existingBoardNameSelectors = document.querySelectorAll('.board-names');
        for (let i = 0 ; i < existingBoardNameSelectors.length ; i++) {
            let select = existingBoardNameSelectors[i];
            select.innerHTML = '';

            // If the board being looped is the 'send all to board', need to add the blank option
            if (select.id === 'send-all-to-board') {
                let option = this.createBoardNameOptionElement({name: '---', id: ''});
                select.appendChild(option);
            }

            for (let i = 0 ; i < boards.length ; i++) {
                let board = boards[i];
                let option = this.createBoardNameOptionElement(board);
                select.appendChild(option);
            }
        }
    }

    /**
     * Create a new <option> element for the provided board object
     *
     * @param {Object} board Object representing a Pinterest board
     *
     * @returns {Element}
     */
    createBoardNameOptionElement(board) {
        const option = document.createElement('option');
        option.value = board.id;
        option.innerText = board.name;
        return option;
    }

    /**
     * Update the selected board in each of the pin previews to match the one selected in the
     * Send all images to board drop down
     *
     * @param {int} newBoard The ID value of the board to be selected
     */
    updateSelectedBoards(newBoard) {
        // Loop through all existing board name selectors and update their values to match the one just selected
        const boardNameSelectors = document.querySelectorAll('.preview-pin-board-select');
        for (let i = 0 ; i < boardNameSelectors.length ; i++) {
            let boardNameSelect = boardNameSelectors[i];

            boardNameSelect.value = newBoard;
        }
    }

    /**
     * Loop through all pin previews and make sure a note has been set
     *
     * If a required field isn't filled in, it will be marked as invalid, but also set up with tabIndexing,
     * so that users can click tab to easily move between only the notes that aren't filled in yet
     *
     * @returns {Boolean}
     */
    validateInputs() {
        const previews = document.querySelectorAll('.preview-container');
        let error = false;
        let tabIndex = 1;

        for (let i = 0 ; i < previews.length ; i++) {
            let preview = previews[i];

            const noteContainer = preview.querySelector(".note-container");
            const note = noteContainer.querySelector(".note").value;

            if (note === '') {
                let note = preview.querySelector('.note');
                note.classList.toggle('invalid', true);
                note.tabIndex = tabIndex;
                if (tabIndex === 1) {
                    note.focus();
                    noteContainer.dataset.balloon = noteContainer.dataset.tooltip;

                    // @todo: This needs to be cleaned up and removed from here. Also need to make sure it only triggers once
                    note.addEventListener('blur', e => {
                        noteContainer.removeAttribute('data-balloon');
                    });
                }
                tabIndex++;
                error = true;
            }
        }

        return error === false;
    }

    /**
     * Loop through all of the <img> elements, and call the API function to create a pin,
     * with all the relevant information
     *
     * @returns {null}
     */
    createPins() {
        for (let pinPreview of this.pinPreviews) {
            // Skip any images that have already been pinned in this session
            if (pinPreview.instance.dataset.pinned) {
                continue;
            }

            pinPreview.createPin();
        }
    }

    /**
     * Display the privacy policy modal
     *
     * @returns {null}
     */
    showPrivacyPolicy() {
        this.modalOverlay.classList.remove('hidden');
        this.modalOverlay.querySelector('.privacy-policy-modal').classList.remove('hidden');
    }

    /**
     * Hide the privacy policy modal
     *
     * @returns {null}
     */
    hidePrivacyPolicy() {
        this.modalOverlay.classList.add('hidden');
        this.modalOverlay.querySelector('.privacy-policy-modal').classList.add('hidden');
    }

    /**
     * Display the keyboard shortcuts modal
     *
     * @returns {null}
     */
    showKeyboardShortcuts() {
        this.modalOverlay.classList.remove('hidden');
        this.modalOverlay.querySelector('.keyboard-shortcuts-modal').classList.remove('hidden');
    }

    /**
     * Hide the keyboard shortcuts modal
     *
     * @returns {null}
     */
    hideKeyboardShortcuts() {
        this.modalOverlay.classList.add('hidden');
        this.modalOverlay.querySelector('.keyboard-shortcuts-modal').classList.add('hidden');
    }

    /**
     * Auto fill the note and link fields from the first Pin Preview element, to the rest of the Pin Preview elements
     *
     * @returns {null}
     */
    autofillFields() {
        if (this.pinPreviews.length === 0) {
            return;
        }

        const noteField = this.pinPreviews[0].instance.querySelector("#note").value;
        const linkField = this.pinPreviews[0].instance.querySelector(".link").value;

        for (let pinPreview of this.pinPreviews) {
            pinPreview.setNote(noteField);
            pinPreview.setLink(linkField);
        }
    }

    /**
     * Check for and enable/disable the Pin button from being sticky
     *
     * @returns {null}
     */
    updateStickyPin() {
        if (window.pageYOffset >= this.windowBreakpoint) {
            document.querySelector('.action-toolbar').classList.toggle('sticky', true);
            document.querySelector('.preview-pins-container').classList.toggle('toolbar-is-sticky', true);
        } else {
            document.querySelector('.action-toolbar').classList.toggle('sticky', false);
            document.querySelector('.preview-pins-container').classList.toggle('toolbar-is-sticky', false);
        }
    }

    /**
     * Activate the Google Adsense HTML template
     *
     * @returns {null}
     */
    activateAdsenseTemplate() {
        const template = document.querySelector('#adsense-template');
        const clone = document.importNode(template.content, true);
        document.querySelector('.preview-pins-container').insertBefore(clone, document.querySelector('.pins-container'))
    }

    /**
     * Toggle the state of the action menu
     *
     * @param {boolean|undefined} show [Optional] True/false to force show/hide the menu
     *                                 No value passed and the menu will just toggle
     *
     * @returns {null}
     */
    toggleActionMenu(show = undefined) {
        this.sidebar.toggle(show);
    }
}
