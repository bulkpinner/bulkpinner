# 0.2.3

*Bug fixes*

* Removed the error reporting as it had the potential to report false positives. Will need some further work

# 0.2.2

*Bug fixes*

* If there was an error sending the image to Pinterest, that error wasn't being handled, it is now
* The Send all images to board drop down select now resets when clicking Clear Completed or Clear All
* The application will now actually check if some images were selected before 'transforming' into the pin preview view
* Clicking refresh board won't add the 'blank' board option into the select drop down

# 0.2.1

**Actually removed jQuery from being downloaded**

Whilst the previous release just a few minutes ago removed the need for jQuery, I forgot to actually
remove the script tags that was downloading the library.

**Minified the JS**

Took this opportunity to also minify the main JS file, so it's much, much smaller now

# 0.2.0

**Bug Fixes**

* Image previews weren't displaying correctly
* Spacing between image previews was inconsistent
* Removed left over console.log debug code

**Improvements**

* Removed the need for jQuery. Using a smaller ajax library now
* Added icon for Authorize button
* Added Fork me on GitHub ribbon
* Added Clear completed and clear all buttons
* Added fancier link hover animation
* Added hover effect for Authorize and Change Images buttons. I don't think it will stay though because I'm not a big fan of it
* Added various structured data and Google Analytics related code

# 0.1.1

Added error tracking

* Included Bugsnag, which will hopefully keep me informed of any errors, and also updated Google Analytics tracking code

# 0.1.0

Beta release

The initial version of the application. Allows people to select images from their device, add a note and then select which Pinterest board they should be sent to.

Users can select individual boards for each image, or select a board for all images to be sent to.

Currently the application uses a pretty raw implementation of FileReader to load up images, which is not the best for
performance, but that will be updated in the near future
