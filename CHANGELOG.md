# 2021-11-29

## 1.1.0

- Mailbox: Supports server-side pagination [Pull Request](https://github.com/nylas/components/pull/217)
- Agenda: Supports timezone agnostic all day events [Pull Request](https://github.com/nylas/components/pull/210)
- Conversation: Supports custom styling using css variables [Pull Request](https://github.com/nylas/components/pull/216)
- Email: Supports custom styling using css variables [Pull Request](https://github.com/nylas/components/pull/224)

### Deprecated

- Mailbox: `unread_status` prop has been deprecated
- Email: `unread` prop has been deprecated

# 2021-11-19

## 1.0.15

- General bug fixes related to Email and Mailbox components
- Fixed css variables for style overrides and custom data handling
- Sanitize svelte @html bindings to prevent XSS [Pull Request](https://github.com/nylas/components/pull/200)
- Refactored internal component properties to be accessed through internal \_this object [Pull Request](https://github.com/nylas/components/pull/195)

### Bug Fixes

- Email: Added overflow auto to the message body for cases where the body of the html content exceeds the parent width [Pull request](https://github.com/nylas/components/pull/198)
- Email: Component thread's message body overflows container [Pull Request](https://github.com/nylas/components/pull/187)
- Mailbox: Fixed not able to delete threads in outlook accounts issue [Pull Request](https://github.com/nylas/components/pull/207)
- Mailbox: Fixed displayed message body not being updated once it has been fetched [Pull Request](https://github.com/nylas/components/pull/208)

# 2021-11-08

## 1.0.14

- General bug fixes related to Email and Mailbox components
- Conversation: Refactored to use nylas-contact-image and fixed multiple avatar fetches [Pull Request](https://github.com/nylas/components/pull/174)

### Bug Fixes

- Mailbox: Removed query params from window url in the requests for threads [Pull request](https://github.com/nylas/components/pull/181)
- Email: Fixed emails height sometimes causing content to overflow [Pull Request](https://github.com/nylas/components/pull/179)
- Email: Fixed case where creating a new email component in the same parent app as a fully loaded email would cause an infinite loop [Pull Request](https://github.com/nylas/components/pull/178)

# 2021-11-04

## 1.0.13

- Package updates and general improvements with setting manifest properties
- Mailbox: Style improvements for refreshing mailbox [Pull Request](https://github.com/nylas/components/pull/140)

### Bug Fixes

- Ensure access_token props are always passed through to request headers [Pull request](https://github.com/nylas/components/pull/166)

# 2021-10-28

## 1.0.12

- README & components index: Updated with our new launched components (Email, Mailbox, Conversation) 🎉

### Bug Fixes

- Mailbox: Fixed a bug where the component did not respect the parent container width [Pull Request](https://github.com/nylas/components/pull/158)
- Email: Fixed a bug where access_token prop was not being sent in the requests [Pull Request](https://github.com/nylas/components/pull/145)
- Conversation: Fixed a bug where access_token prop was not being sent in the requests [Pull Request](https://github.com/nylas/components/pull/147)

# 2021-10-25

## 1.0.11

### Bug Fixes

- Mailbox: Fixed a bug where access_token prop was not being sent in the requests [Pull Request](https://github.com/nylas/components/pull/142)

# 2021-10-21

## 1.0.10

- Nylas Email, Nylas Mailbox and Nylas Conversation components launched 🎉

# 2021-10-08

## 1.0.8

### Bug Fixes

- Composer: Fixed a bug where `value` prop was not reactive. This fix allows users to dynamically change the value [Pull Request](https://github.com/nylas/components/pull/93)

# 2021-09-17

## 1.0.5

### Bug Fixes

- ContactList: Fixed a bug where prop value `show_filter` was not being read from the manifest [Pull Request](https://github.com/nylas/components/pull/71)

# 2021-09-08

## 1.0.3

### New Features

- ContactList: Default value of `sort_by` prop is now set to `name` instead of `last_emailed` [Pull Request](https://github.com/nylas/components/pull/58)

# 2021-08-03

## 1.0.2

### New Features

- Composer now supports [Message Tracking](https://developer.nylas.com/docs/developer-tools/webhooks/message-tracking) for Nylas accounts ([Pull Request](https://github.com/nylas/components/pull/18))

### Community

- New Issue templates, including an RFC template ([Pull Request](https://github.com/nylas/components/pull/17))

# 2021-07-27

## 1.0.1

### Bug Fixes

- Better tree shaking from our common stores/connections ([Pull Request](https://github.com/nylas/components/pull/11))
- Better testing for Composer component's replace_fields property ([Pull Request](https://github.com/nylas/components/pull/6))

### Community

- Code of Conduct and Contributing files added ([Pull Request](https://github.com/nylas/components/pull/7))

# 2021-07-20

## 1.0.0

- Nylas Components Open Sourced 🎉
