ninja-notify
==========

A Ninja Blocks driver that sends notifications to Android, iOS and desktops.

Currently only supports Pushover, but more will be added as needed.

# Usage
Use the driver config button in the Dashboard to add you Pushover User Key and optionally a device or group id.

It will appear as a text display device, just send text to notify your device(s).

# Advanced usage
If you send JSON to the text display device, you can set extra properties.

From https://pushover.net/api:
Some optional parameters may be included:
 - device - your user's device name to send the message directly to that device, rather than all of the user's devices
 - title - your message's title, otherwise your app's name is used
 - url - a supplementary URL to show with your message
 - url_title - a title for your supplementary URL, otherwise just the URL is shown
 - priority - send as -1 to always send as a quiet notification, 1 to display as high-priority and bypass the user's quiet hours, or 2 to also require confirmation from the user
 - timestamp - a Unix timestamp of your message's date and time to display to the user, rather than the time your message is received by our API
 - sound - the name of one of the sounds supported by device clients to override the user's default sound choice

# Changelog

0.0.0
 - Initial version.
 - Simple Pushover support