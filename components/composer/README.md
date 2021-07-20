# Composer

> This document is still work in progress!

Composer component is used for sending emails.

## Installation

You can use composer in two ways:

- via CDN
- install using `yarn`

## Props

Component accepts next props:

Methods:

- open()
- close()

**Data:**

- id
- change
- options
- from
- to
- cc
- bcc
- value
- send

**Hooks:**

- Send:

  - send (implementation)
  - beforeSend
  - onSend
  - onSendError
  - afterSend

- File uploads (attachments):

  - fileUpload (implementation)
  - beforeAttachmentUpload
  - onAttachmentUpload
  - onAttachmentUploadError
  - afterAttachmentUpload

- onFromChange (use onchange with additional argument)
- onToChange (use onchange with additional argument)
- onCcChange (use onchange with additional argument)
- onBccChange (use onchange with additional argument)
- onSubjectChange
- onBodyChange
- onFilesChanged

**UI**:

- popup
- visible
- showSubject
- showHeaders

## Events:

- {action: 'subject-changed' }
- body-changed
- attachment-added
- attachment-removed
- {event: 'from-changed', action: 'add'}
- {event: 'from-changed', action: 'remove'}

## Styling

- Composer can be styled by choosing theme or
- Providing a stylesheet with css variables
