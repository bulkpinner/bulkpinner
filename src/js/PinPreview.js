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
 * Class PinPreview
 */
export default class PinPreview {

    constructor(file) {
        this.file = file;
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
}
