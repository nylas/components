# Nylas Conversation

Nylas Conversation (`<nylas-conversation>`) is part of the Nylas Components library that lets you build event/calendar applications in minutes. Use Nylas Conversation with your Nylas account or by passing in your own JSON data.

Nylas Conversation is currently in active development. Want to contribute? [Find out how!](../../CONTRIBUTING.md)

## Table of Contents

- [Nylas Conversation](#nylas-conversation)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Using It in Your App](#using-it-in-your-app)
    - [Fetching data directly from Nylas](#fetching-data-directly-from-nylas)
      - [Setup](#setup)
      - [Allowed domains](#allowed-domains)
    - [Passing in your own data](#passing-in-your-own-data)
    - [Properties](#properties)
    - [Events and Callbacks](#events-and-callbacks)
  - [Contributing](#contributing)
    - [Testing](#testing)
  - [Additional Documentation](#additional-documentation)

## Installation

In your JavaScript application, you can install Nylas Conversation with:

- npm `npm i @nylas/components-conversation`
- Yarn `yarn add @nylas/components-conversation`

Alternatively, on an html page, you can load the Conversation using a script tag:

```
   <head>
      <!-- Import the script from CDN -->
      <script src="https://unpkg.com/@nylas/components-conversation"></script>
    </head>
```

For both installation options, in the body of your page, you can instantiate the conversation component with `<nylas-conversation></nylas-conversation>`.

## Using It in Your App

All Nylas components have two ways of displaying data to your end-user:

1. [Fetching data directly from Nylas](#fetching-data-directly-from-nylas)
2. [Passing in your own data](#passing-in-your-own-data)

### Fetching data directly from Nylas

#### Setup

If you haven't registered for a Nylas account yet, you can do so at dashboard.nylas.com. Once there, head to the **Components** tab and create a new Conversation component.

You'll be guided through the component setup and be given the option to tie your component to a thread. Review the [Conversation Documentation](https://developer.nylas.com/docs/user-experience/components/conversation-component/).

#### Allowed domains

During the setup process, you'll be prompted to provide a list of [allowed domains](https://developer.nylas.com/docs/user-experience/components/conversation-component/#allowed-domains). Be sure to add any domains you'll be testing your app on, including `localhost`, and any staging and production URLs you might use.

### Passing in your own data

Nylas Conversation can be used as a UI on top of any thread data that you provide. Threads should follow the [Nylas thread object standard](https://developer.nylas.com/docs/api/#tag--Threads).

The property to use for this is `messages`. You can pass in a list of JSON message objects.

```json
  const staticMessages =
    [
  {
    "account_id": "ehiyqnpjag93ylo6etchcdhr9",
    "bcc": [],
    "cc": [],
    "date": 1629163362,
    "files": [],
    "from": [{ "email": "demo@nylas.com", "name": "Demo User" }],
    "id": "bp1y6jnepx3t9uyr548b4nsdp",
    "labels": [
      {
        "display_name": "Sent Mail",
        "id": "6n0whoxa8tdpvreq01mrgvr3d",
        "name": "sent"
      }
    ],
    "object": "message",
    "reply_to": [],
    "snippet": "Hey there, Welcome to Nylas! Glad to have you onboard",
    "starred": false,
    "subject": "Welcome to Nylas",
    "thread_id": "dclpsfd1i46mukv77b8y0qe4s",
    "to": [
      {
        "email": "jack.smith@gmail.com",
        "name": "Jack Smith"
      }
    ],
    "unread": false
  },
  {
    "account_id": "ehiyqnpjag93ylo6etchcdhr9",
    "bcc": [],
    "cc": [],
    "date": 1629163387,
    "files": [],
    "from": [
      {
        "email": "jack.smith@gmail.com",
        "name": "Jack Smith"
      }
    ],
    "id": "60mqc30m5cfffi7mii61oajxt",
    "labels": [
      {
        "display_name": "Inbox",
        "id": "5izbd0saul1qtmdp1jakkkdhx",
        "name": "inbox"
      },
      {
        "display_name": "Important",
        "id": "2wx96u918ncyeuv9yzjroo43g",
        "name": "important"
      }
    ],
    "object": "message",
    "reply_to": [],
    "snippet": "Thank you! Excited to be here.",
    "starred": false,
    "subject": "Re: Welcome to Nylas",
    "thread_id": "dclpsfd1i46mukv77b8y0qe4s",
    "to": [{ "email": "demo@nylas.com", "name": "Demo User" }],
    "unread": false
  }
    ]
```

Then pass the array into your component using any JavaScript.

```js
<nylas-conversation thread_id={thread_id}>
<nylas-conversation messages={messages}>
```

You can also use plain JavaScript as an attribute.

```js
document.querySelector("nylas-conversation").thread_id = staticThreadID;
document.querySelector("nylas-conversation").messages = staticMessages;
```

### Properties

Nylas Conversation allows for several properties that affect the layout and functionality of your component. You can find a complete list of properties within our [Documentation for Nylas Conversation](https://developer.nylas.com/docs/user-experience/components/conversation-component/#conversation-properties)

### Events and Callbacks

You can listen to certain user events from your application by adding an event listener to your component.

For example, you can listen for a `threadClicked` event with the following code:

```js
document
  .querySelector("nylas-conversation")
  .addEventListener("sendMessageClicked", (event) => {
    let { detail } = event;
    console.log("Send message clicked: ", detail.thread);
  });
```

A list of emitted events is available on our [Documentation for Nylas Conversation](https://developer.nylas.com/docs/user-experience/components/conversation-component/#event-listeners)

## Contributing

Please refer to our [Contributing Guidelines](CONTRIBUTING.md) for information about how to get involved. We welcome bug reports, questions, and pull requests.

1. Git clone `git@github.com:nylas/components.git`
2. Run `yarn install`
3. Run `yarn start`; your browser will load `http://localhost:8000` and show you a list of available running components

### Testing

`yarn cy:open` will launch our end-to-end tests in a browser
tests will automatically be run on push from push.yaml

## Additional Documentation

- [Nylas Conversation on NPM](https://www.npmjs.com/package/@nylas/components-conversation)
- [Nylas Docs: Conversation Component](https://developer.nylas.com/docs/user-experience/components/conversation-component/)
