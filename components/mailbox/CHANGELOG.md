# Unreleased

## Breaking

## New Features

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

## Bug Fixes

- Updated border style + variables [#270](https://github.com/nylas/components/pull/270)
- Scroll to latest message when thread is expanded [#314](https://github.com/nylas/components/pull/314)
- Message content of emails failed to load if they were accessed while pagination was in progress [311](https://github.com/nylas/components/pull/311)
- Fixed some attached files being treated as inline [283](https://github.com/nylas/components/pull/283)
- Fixed TypeError was being thrown if all_threads prop was used and user clicked a message to expand it's body [315](https://github.com/nylas/components/pull/315)
- Fixed dispatched event `threadClicked` being dispatched multiple times on a single click [315](https://github.com/nylas/components/pull/315)

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
