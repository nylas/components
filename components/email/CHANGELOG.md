# Unreleased

- [Email] Checks existing draft in thread when clicking on reply/forward, and opens composer with draft if exists. [#405](https://github.com/nylas/components/pull/405)
- [Email] Highlights draft in thread when its opened with Composer. [#405](https://github.com/nylas/components/pull/405)

## Breaking

## New Features

- [Email] Show CC participants when reply all button is clicked [#319](https://github.com/nylas/components/pull/319)
- [Email] Added ability to forward email [#320](https://github.com/nylas/components/pull/320)
- [Email] Show CC and BCC fields on expanded email [#361](https://github.com/nylas/components/pull/361)
- [Email] Added customizable css variables for attachment button [#379](https://github.com/nylas/components/pull/379)

```
  -  --nylas-email-font-family
  -  --nylas-email-attachment-border-style
  -  --nylas-email-attachment-button-color
  -  --nylas-email-attachment-button-bg
  -  --nylas-email-attachment-button-hover-bg
```

## Bug Fixes

- [Email] UI tweaks that improve design [#270](https://github.com/nylas/components/pull/270)
- [Email] Added new loading indicator [#270](https://github.com/nylas/components/pull/270)
- [Email] Updated border style + variables [#270](https://github.com/nylas/components/pull/270)
- Fixed double clicking a thread caused the component to become unresponsive [#425](https://github.com/nylas/components/pull/425)
- Fixed mutation of the `event.detail.message` object submitted when the `replyAllClicked` or `replyClicked` events were fired [#428](https://github.com/nylas/components/pull/428)

# v1.1.7 (2021-12-22)

## New Features

- [Email] Added `onError` custom event when an error occurs [#262](https://github.com/nylas/components/pull/262)
- [Email] Added styles for draft and empty messages, disallows clicking on email with no messages [#267](https://github.com/nylas/components/pull/267)

- Added ability to reply to email/thread [#228](https://github.com/nylas/components/pull/228)
- Added dispatched event `replyAllClicked` with properties
  - event
  - message
  - thread
  - value
  - to
  - from
  - subject
- Added dispatched event `replyClicked` with properties
  - event
  - message
  - thread
  - value
  - to
  - from
  - subject

## Bug Fixes

- [Email] Fixed some attached files being treated as inline [283](https://github.com/nylas/components/pull/283)

# v1.1.6 (2021-12-15)

## Bug Fixes

- [Email] Participants list truncates after 1 participant and displays how many more participants are included. Clicking 'And {N} more' opens a tooltip with additional participants. [#254](https://github.com/nylas/components/pull/254)
- [Email] Fixed 'Return to mailbox' arrow being too small [#276](https://github.com/nylas/components/pull/276)
- [Email] Fixed the loader icon on mobile device / smaller screen [#269](https://github.com/nylas/components/pull/269)

# v1.1.5 (2021-12-10)

## New Features

- [Email] Added support for downloading attachments [#240](https://github.com/nylas/components/pull/240)
- [Email] Added support for rendering inline images (broken images) [#249](https://github.com/nylas/components/pull/249)

## Bug Fixes

- [Email] Triggering a tooltip for an individual participant no longer opens tooltip for all participants.
- [Email] Fixed props inconsistencies [253](https://github.com/nylas/components/pull/253)

# v1.1.4 (2021-12-09)

## Bug Fixes

- [Email] Add loading spinner when loading message body [#225](https://github.com/nylas/components/pull/225)
