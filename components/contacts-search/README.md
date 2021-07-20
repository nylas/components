# Composer

> This document is still work in progress!

Contacts autocomplete component is used for finding contacts.

## Installation

You can use composer in two ways:

- via CDN
- install using `yarn`

## Props

Component accepts next props:

**Data:**

- id
- change
- contacts - can be an array of contacts or an API function call
- value - initial selected contacts can have contacts not in `contacts` prop
- placeholder - input placeholder
- single - if true user can select only one contact
- theme

### Contacts structure example

```javascript
[
  {
    "email": "example@nylas.com",
    "name": "John" // Not required
    ...args
  }
]
```

## Styling

- Composer can be styled by choosing theme or
- Providing a stylesheet with css variables
