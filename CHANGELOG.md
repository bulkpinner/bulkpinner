# 1.0.4

Fixed further bad URLs

# 1.0.3

Fixed bad URL preloading the scripts file

# 1.0.2

Fixed URLs of items to cache to be relative

# 1.0.1

Fixed the URL to the service worker so it's relative

# 1.0.0

## Improvements

**Added a service worker!**

The service worker will make the application load *much* faster on repeat visits

# 0.5.5

## Bug Fixes

Fixed bug caused by trying to clear error sig

# 0.5.4

Updated uglification of JS so it happens within webpack

# 0.5.2

Updated version of Bugsnag to hopefully better capture application errors

# 0.5.2

## Bug Fixes

Modals can now be viewed on mobile

Autofill will work on subsequent tries, not just the first time after a page load

# 0.5.1

## Bug Fixes

Actually fixed the modal close bug

Added an Analytics feature tracking event

# 0.5.0

## Improvements

Added the ability to disconnect the currently connected Pinterst account, so that you can authorize and use another Pinterest account

Styled the letters in the keyboard shortcuts modal. In case you weren't aware the modal can be accessed by typing ? (shift + /)

## Bug fixes

Fixed close button for keyboard shortcuts modal

Fixed the height of pin previews so they all match

Fixed layering of modals, which were being displayed behing the toolbar since it was made sticky

Fixed position of modals when they triggered after users have scrolled down the page

Fixed the width of the note and link fields

# 0.4.3

**Fixed event tracking**

The previous udpate added some event tracking, but it wasn't going through to Google Analytics in a very readable way,
so that's been fixed

**Out of date browser message**

The application doesn't work in Internet Explorer. IE is a pain to support, so I decided I wouldn't. As there have been
people trying to use Bulk Pinner with IE11, I've now created a simple Browser Out Of Date message that will let users
know that they should update to a modern browser.

# 0.4.2

**Added more custom event tracking**

This will allow me to see how people use the application, so I can see which parts are useful and which aren't so useful

# 0.4.1

**Removed note about limited users**

Pinterest have finally approved the app, so the notice that only testers can use it is no longer required

# 0.4.0

## Features

**Sticky Action Toolbar**

When scrolling down, the action toolbar will now become sticky. This is to stop users having to scroll back to the top
of the page to click the Pin button, but also because the other actions could be useful as a user scrolls

## Improvement

**Pin Preview option drop down hidden**

When a pin is successfully create, the options drop down is no longer required, so it is now hidden

**Autofill all note/link fields**

Added a new shortcut key that will automatically populate the note and link fields for all Pin Preview with the value
of the note and link fields in the first Pin Preview.

**Various code refactoring**

**Made interface somewhat responsive**

If using the application on mobile, it should be a lot more usable now

# 0.3.0

## Features

**Use Image Filename**

As requested by a tester, you can now select to use the filename of the image being pinned in the note field. This is
available through a drop down options menu in the top right of each pin preview component

**Keyboard Shorts**

I have added some simple keyboard shortcuts to hopefully make things even easier! To view the available keyboard shortcuts,
type `?`.

## Bug fixes

**Application header in Firefox**

Firefox seems to have issues when setting the height of an element to 100%, with a max height set in viewport units.
I've fixed that now so it should display as nicely in Firefox as it does in other browsers

**Error Reporting**

I was getting error reports in Bugsnag, however it wasn't including any information of the actual error.
I've now update the call to the service so I can see more information about errors if/when they happen. This will make
them a lot easier to identify, replicate and fix.

# 0.2.5

**Privacy Policy**

Added a privacy policy for Bulk Pinner 

# 0.2.4

**Version bump**

# 0.2.3

**Bug fixes**

* Removed the error reporting as it had the potential to report false positives. Will need some further work

# 0.2.2

**Bug fixes**

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
