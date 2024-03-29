# Unreleased

## Breaking

## New Features

- [Mailbox][email] Added custom CSS options for Email and Mailbox components, with two pre-defined themes: `dark` and `light`. [#455](https://github.com/nylas/components/pull/455)
- [Mailbox] Add pagination when `keyword_to_search` is used [#313](https://github.com/nylas/components/pull/313)
- [Mailbox] Added ability to reply to email/thread [#311](https://github.com/nylas/components/pull/311)
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
- Added ability to forward email [#320](https://github.com/nylas/components/pull/320)
- Show confirmation pop up, when deleting emails
- Pass z-index css to confirmation pop up's modal & overlay using css variables `z-index-modal` & `z-index-overlay` respectively
- Draft, reply, reply all and forwarded messages include inline images and attachments
- [Mailbox] Added new prop 'thread_click_action' that allows to specify the action on clicking an email thread [#369](https://github.com/nylas/components/pull/369)
- View/save/send draft messages in email thread [#399](https://github.com/nylas/components/pull/399)
- Added `draft` label an email thread [#403](https://github.com/nylas/components/pull/403)
- Removed `event.detail.value` from custom events `draftThreadClicked`, `replyClicked`, `replyAllClicked`, `forwardClicked` and `draftClicked`, message value will be passed by `event.detail.message`. [#417](https://github.com/nylas/components/pull/417)
- Deprecated `draftThreadEvent` event and renamed it to `draftThreadClicked`. [#417](https://github.com/nylas/components/pull/417)

## Bug Fixes

- Updated border style + variables [#270](https://github.com/nylas/components/pull/270)
- Scroll to latest message when thread is expanded [#314](https://github.com/nylas/components/pull/314)
- Message content of emails failed to load if they were accessed while pagination was in progress [311](https://github.com/nylas/components/pull/311)
- Fixed some attached files being treated as inline [283](https://github.com/nylas/components/pull/283)
- Fixed TypeError was being thrown if all_threads prop was used and user clicked a message to expand it's body [315](https://github.com/nylas/components/pull/315)
- Fixed dispatched event `threadClicked` being dispatched multiple times on a single click [315](https://github.com/nylas/components/pull/315)
- Fixed the issue where deleting a sent thread by self using non-gmail account was not working [#374](https://github.com/nylas/components/pull/374)
- Fixed double clicking a thread caused the component to become unresponsive [#425](https://github.com/nylas/components/pull/425)

# v1.1.5 (2021-12-15)

## New Features

- Added `onError` custom event when an error occurs [#262](https://github.com/nylas/components/pull/262)

# v1.1.4 (2021-12-10)

## New Features

- Added support for downloading attachments [#240](https://github.com/nylas/components/issues/240)
- Added support for rendering inline images (broken images) [249](https://github.com/nylas/components/pull/249)

## Bug Fixes

# v1.1.4-canary.0 (2021-12-09)

## Bug Fixes

- Fixed pagination offsetting by 1 email instead of page size [#256](https://github.com/nylas/components/pull/256)
