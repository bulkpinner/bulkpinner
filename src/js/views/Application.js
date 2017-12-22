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
import ClearPreviews from "ClearPreviews";
import API from 'services/API';
import DataStore from 'services/DataStore';
import PinPreview from 'PinPreview';
import ErrorUtil from 'services/ErrorUtil';

/**
 * Class Application
 */
export default class Application {

    constructor() {
        this.clearPreviews = new ClearPreviews();
        this.previewsPinsContainer = document.querySelector('.preview-pins-container');
        this.imageSelectContainer = document.querySelector(".image-select-container");
        this.refreshBoardsButton = document.querySelector('.refresh-boards');
        this.pinsContainer = document.querySelector('.pins-container');
        this.sendToPinterestButton = document.querySelector('.send-to-pinterest');
        this.sendAllToBoardSelect = document.getElementById('send-all-to-board');
        this.fileUploadInput = document.getElementById("fileToUpload");

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
    }

    /**
     * @returns {null}
     */
    showApplicationContainer() {
        this.imageSelectContainer.classList.toggle('hidden', false);
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
        this.refreshBoardsButton.addEventListener('click', () => {
            this.loadBoards(true)
            .then(boards => {
                this.populateBoardNames(boards);
            })
            .catch(response => {
                console.error(response);
            });
        });

        this.pinsContainer.addEventListener('blur', e => {
            if (e.target.matches('.note')) {
                e.target.classList.toggle('invalid', e.target.value !== '');
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
            }
        });

        this.fileUploadInput.onchange = e => this.handleImagesSelected(e);

        // Prepare the preview pin template with names of boards to pin to
        this.loadBoards().then(boards => {
            this.populateBoardNames(boards);
        })
    }

    /**
     * Loop through the images selected and create new FileReader objects for them,
     * displaying the image preview to the user
     *
     * @param {Event} e The event object
     *
     * @returns {null}
     */
    handleImagesSelected(e) {
        const input = e.target;

        if (input.files.length === 0) {
            return;
        }

        document.querySelector('.page-header').classList.toggle('large', false);
        document.querySelector('.get-started').classList.toggle('hidden', true);
        document.querySelector('.application-container').classList.toggle('expanded', true);
        document.querySelector('.label-text').innerText = 'Add More Images';
        this.previewsPinsContainer.classList.toggle('hidden', false);

        window.setTimeout(() => { // Allow time for the CSS animation to run before
            for (let i = 0 ; i < input.files.length ; i++) {
                let file = input.files[i];
                let pinPreview = new PinPreview(file);
                this.previewsPinsContainer.querySelector(".pins-container").appendChild(pinPreview.render());
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
        const previews = document.querySelectorAll('.preview-container');

        for (let i = 0 ; i < previews.length ; i++) {
            let preview = previews[i];

            // Skip any images that have already been pinned in this session
            if (preview.dataset.pinned) {
                continue;
            }

            const imageData = preview.querySelector('.preview-image').src;
            const note      = preview.querySelector(".note").value;
            const board     = preview.querySelector(".board-names").value;
            const link      = preview.querySelector(".link").value;

            preview.classList.toggle('sending', true);
            delete preview.dataset.pinError; // Remove any previous error that might be displaying

            try {
                API.CreatePin({
                    board: board, // Sending just the board ID. Documentation doesn't say this can be done, but it works. Reason is: spaces in board names
                    image_base64: imageData,
                    note: note,
                    link: link
                })
                .then(response => {
                    preview.dataset.pinned = true;
                    preview.classList.toggle('sending', false);
                    Analytics.PinCreated();
                })
                .catch(err => {
                    preview.classList.toggle('sending', false);
                    preview.dataset.pinError = true;

                    ErrorUtil.Log(new Error('Create Pin promise rejected'), {
                        metaData: {
                            'error': err
                        },
                        severity: 'error'
                    });

                });
            } catch (exception) {
                ErrorUtil.Log(new Error('Exception thrown from CreatePin function'), {
                    metaData: {
                        'exception': exception
                    },
                    severity: 'error'
                });
            }
        }
    }
}
