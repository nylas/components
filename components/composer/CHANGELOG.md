# v1.1.6 (Unreleased)

## New Features

- Added `onError` custom event when an error occurs [#262](https://github.com/nylas/components/pull/262)
- Allow sending with CMD/CTRL + Enter
- Added tooltip labels to the WYSIWYG editor icons & attachment icons for improved accessibility
- Added a prop `reset_after_close` which resets composer fields after closing

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
