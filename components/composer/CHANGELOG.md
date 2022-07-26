# Unreleased

## Breaking

## New Features

- Added the ability for Composer to consume [Nylas Contact](https://developer.nylas.com/docs/api#tag--Contacts) type into `to` `from`, `cc` and `bcc`. [#447](https://github.com/nylas/components/pull/447)

## Bug Fixes

- Focus the HTML editor textbox when a formatting option is clicked [#342](https://github.com/nylas/components/pull/342)
- Header should reactively update with the change in the subject [#367](https://github.com/nylas/components/pull/367)
- Fix bug where unable to tab into contenteditable area in Firefox [#400](https://github.com/nylas/components/pull/400)
- Attachments were not being displayed or sent if the `value.files` property was set [#398](https://github.com/nylas/components/pull/398)

# v1.1.6 (Unreleased)

## New Features

- Added `onError` custom event when an error occurs [#262](https://github.com/nylas/components/pull/262)
- Allow sending with CMD/CTRL + Enter
- Added tooltip labels to the WYSIWYG editor icons & attachment icons for improved accessibility
- Added a prop `reset_after_close` which resets composer fields after closing
- Added a prop `focus_body_onload` which allows to set focus on the 'body' field on load [#379](https://github.com/nylas/components/pull/379)
- Added border-left css to visually differentiate the current message from the previous messages [#379](https://github.com/nylas/components/pull/379)
- Added button for user to save email message as draft [#383](https://github.com/nylas/components/pull/383)
- Added a prop `show_max_file_size` to toggle showing the max file size of attachment. [#386](https://github.com/nylas/components/pull/386)

## Bug Fixes

- Fix support for Firefox and Safari browsers. [#279](https://github.com/nylas/components/pull/279)
- Reset sendSuccess when composer is opened and closed [#300](https://github.com/nylas/components/pull/300)
- Added a prop 'reset_after_close' which resets after closing[#301](https://github.com/nylas/components/pull/301)
- Attachment icon size was too small making it inaccessible
- Updated file size error copy, added tooltip label for attach icon[#317](https://github.com/nylas/components/pull/317)

## Breaking

- Removed the ability for users to change the "From" field value via the UI

# v1.1.5 (2021-12-10)

## Bug Fixes

- Added better error handling when file size exceeds 5MB [248](https://github.com/nylas/components/pull/248)

# v1.1.4 (2021-12-09)

## Bug Fixes

- Don't hide `from` field when account is loaded and add collapsible height to whole composer [#247](https://github.com/nylas/components/pull/247)
- Add background color to contact search dropdown items and increase search input width [#251](https://github.com/nylas/components/pull/251)
- Fix `show_cc` and `show_bcc` buttons and sets defaults to `true` [#250](https://github.com/nylas/components/pull/250)
