# 2021-06-15

## 0.0.40

## Bug Fixes

- The Composer's fields will now be cleared when an email is successfully sent. To turn this behaviour off, the property `reset_after_send` can be set to `false` ([Pull Request](https://github.com/nylas/components/pull/285))

#

# 2021-06-03

## 0.0.39

## New Features

- Added the `template` property to Composer that allows an email template to be provided ([Pull Request](https://github.com/nylas/components/pull/269))

## Bug Fixes

- Improved keyboard navigation for Composer inputs ([Pull Request](https://github.com/nylas/components/pull/274))

#

# 2021-05-19

## 0.0.38

## New Features

- Added event creation callback for Agenda that allows users to modify event details on creation ([Pull Request](https://github.com/nylas/components/pull/268))

## Bug Fixes

- Fixed composer throwing errors when loaded with webpack ([Pull Request](https://github.com/nylas/components/pull/275))

#

# 2021-05-17

## 0.0.37

## New Features

- Added ability to insert hyperlinks in Composer ([Pull Request](https://github.com/nylas/components/pull/265))
- Agenda will now emit a 'dateChange' event when the date is changed ([Pull Request](https://github.com/nylas/components/pull/273))

## Bug Fixes

- Fixed Composer CC/BCC input fields not expanding to full width ([Pull Request](https://github.com/nylas/components/pull/272))
- Removed Composer's 'visible' property as it was causing issues. Use `open()` and `close()` on Composer instead. ([Pull Request](https://github.com/nylas/components/pull/271))

#

# 2021-05-12

## 0.0.36

## Bug Fixes

- Fixed an issue where `access_token` was not being passed to Composer's send and file upload endpoints ([Pull Request](https://github.com/nylas/components/pull/263))
- Rolled back "send later" functionality from Composer until it can be fully implemented ([Pull Request](https://github.com/nylas/components/pull/260))

#

# 2021-04-23

## 0.0.35

## Bug Fixes

- Fixed unloaded Contact List images showing `[object Promise]` while loading ([Pull Request](https://github.com/nylas/components/pull/249))
- Fixed Composer not properly loading custom themes. Added custom theme support for Agenda and Contact List. Custom themes can be loaded by providing a file path or URL to the component's `theme` property ([Pull Request](https://github.com/nylas/components/pull/247))
- Fixed Composer and Contact List not passing the shared access_token on some web requests ([Pull Request](https://github.com/nylas/components/pull/248))

#

# 2021-04-23

## 0.0.32

## New Features

- Adds a `manifestLoaded` event on all components that can be accessed via an `addEventListener` (https://github.com/nylas/components/pull/242)
- added a `hide_ticks` property for the Agenda component that toggles the display of the hour-line left margin (https://github.com/nylas/components/pull/243)
- Added an `eagerly_fetch_events` property for the Agenda component that defaults to `true` and pre-fetches nearby dates for smoother date change
- Added a swipe/drag interface to allow users to change dates (https://github.com/nylas/components/pull/244)

#

# 2021-04-14

## 0.0.31

## New Features

- Added a close button (X) to the composer's CC & BCC inputs so that they can hidden

## Bug Fixes

- Fix composer not firing fileUpload hooks if no component ID is provided
- Prevent composer from sending emails without a recipient
