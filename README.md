Bulk Pinner
======================
An application that allows you to upload multiple images to multiple Pinterest boards at once!

![Imgur](https://i.imgur.com/dWZ5hpL.png)

## Demo

Check out how much faster uploading just 10 images is!

[![Demo](https://i.imgur.com/2QkFPVo.png)](https://www.youtube.com/watch?v=E-NItREQ92M)

## How to Use

1. Visit the application website (https://bulkpinner.app)
2. Authorize the application to read/write to your Pinterest
3. Choose images you wish to pin
4. Fill out the details for the images that are about to be pinned
5. Choose which board/s the images are to be sent to
6. Click Pin!

## Tips and tricks

### Keyboard shortcuts

Type `?` to view the keyboard shortcuts

**The keyboard shortcut you'll likely use more than any**

Type `>` then `>` then `>` (press and hold `SHIFT`, then type `.` 3 tmes) - This will populate the note and link fields in all Pin Previews with the value in the first Pin Preview

## A Bit More Detail

Check out the Medium post I wrote that goes in to a bit more detail on using Bulk Pinner

[View article](https://medium.com/@denno020/upload-multiple-images-to-pinterest-at-once-3fb0ec3737ea)

## Error Monitoring

Error monitoring is provided by Bugsnag

## Fine Print

Pinterest will allow you to upload as many images through Bulk Pinner as you like! However, there is a rate limit.
As per their API terms, the rate limit is 1000 requests per user, per hour. These requests would include refreshing
board list, as well as creating pins. Your list of Pinterest boards is cached locally in your browser, so there is no
need to click the button unless you have created a new board on Pinterest since first authorizing the app.

As soon as Pinterest's API is updated with endpoints to upload directly to a Section within a board, I will be working
on integrating that with Bulk Pinner, but for now we're only able to upload to a board. Pinterest have the ability to
bulk move pins, so it's easy enough to upload all your images using Bulk Pinner, then using Pinterest itself to move those
pins into a Section, as required.
