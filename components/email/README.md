# Nylas Email

Nylas Email (`<nylas-email>`) is part of the Nylas Components library that lets you build event/calendar applications in minutes. Use Nylas Email with your Nylas account or by passing in your own JSON data.

Nylas Email is currently in active development. Want to contribute? [Find out how!](../../CONTRIBUTING.md)

![Nylas Email](sample.png)

## Table of Contents

- [Nylas Email](#nylas-email)
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

In your JavaScript application, you can install Nylas Email with:

- npm `npm i @nylas/components-email`
- Yarn `yarn add @nylas/components-email`

Alternatively, on an html page, you can load the Email using a script tag:

```
   <head>
      <!-- Import the script from CDN -->
      <script src="https://unpkg.com/@nylas/components-email"></script>
    </head>
```

For both installation options, in the body of your page, you can instantiate the email component with `<nylas-email></nylas-email>`.

## Using It in Your App

All Nylas components have two ways of displaying data to your end-user:

1. [Fetching data directly from Nylas](#fetching-data-directly-from-nylas)
2. [Passing in your own data](#passing-in-your-own-data)

### Fetching data directly from Nylas

#### Setup

If you haven't registered for a Nylas account yet, you can do so at dashboard.nylas.com. Once there, head to the **Components** tab and create a new Email component.

You'll be guided through the component setup and be given the option to tie your component to a thread. Review the [Email Documentation](https://developer.nylas.com/docs/user-experience/components/email-component/).

#### Allowed domains

During the setup process, you'll be prompted to provide a list of [allowed domains](https://developer.nylas.com/docs/user-experience/components/email-component/#allowed-domains). Be sure to add any domains you'll be testing your app on, including `localhost`, and any staging and production URLs you might use.

### Passing in your own data

Nylas Email can be used as a UI on top of any thread data that you provide. Threads should follow the [Nylas thread object standard](https://developer.nylas.com/docs/api/#tag--Threads).

The property to use for this is `thread`. You can pass in a JSON thread with an array of messages.

```json
  const staticThread =
    {
      "account_id":"adsghdgajhsgdikzvz9afb",
      "drafts":[],
      "first_message_timestamp":1621472861,
      "has_attachments":false,
      "id":"daskjdkahskjdhk7md84fgk",
      "labels":[
        {"display_name":"Inbox","id":"asdghsdfafasdfdsfcm4","name":"inbox"}
      ],
      "last_message_received_timestamp":1621472865,
      "last_message_sent_timestamp":null,
      "last_message_timestamp":1621472865,
      "messages":[
        {
          "account_id":"adsghdgajhsgdikzvz9afb",
          "bcc":[],
          "cc":[
            {"email":"phil.r@nylas.com","name":"Phil Renaud"},
            {"email":"review_requested@noreply.github.com","name":"Review requested"}
          ],
          "date":1621472861,
          "files":[],
          "from":[
            {"email":"notifications@github.com","name":"Mostafa Rashed"}
          ],
          "id":"epgdadhsgfdghasyy6h9yyle6v",
          "labels":[
            {"display_name":"Inbox","id":"3fhdx7ssdfsfsdfm5ecwcm4","name":"inbox"}
          ],
          "object":"message",
          "reply_to":[
            {"email":"abcd@reply.github.com","name":"nylas/nylas-nodejs"}
          ],
          "snippet":"Hi, Welcome to Nylas",
          "starred":false,
          "subject":"Hello from Nylas",
          "thread_id":"ddfgdfdgdjsgdjhas7md84fgk",
          "to":[
            {"email":"nylas-nodejs@noreply.github.com","name":"nylas/nylas-nodejs"}
          ],
          "unread":true
        },
        {}
      ],
      "snippet":"Hi, Welcome to Nylas",
      "starred":false,
      "subject":"Hello from Nylas",
      "unread":true,
      "version":1
    }
```

Then pass the array into your component using any JavaScript.

```js
<nylas-email thread={thread}>
<nylas-email thread_id={thread_id}>
<nylas-email message={message}>
<nylas-email message_id={message_id}>
```

You can also use plain JavaScript as an attribute.

```js
document.querySelector("nylas-email").thread = staticThread;
document.querySelector("nylas-email").thread_id = staticThreadID;
document.querySelector("nylas-email").message = staticMessage;
document.querySelector("nylas-email").message_id = staticMessageID;
```

### Properties

Nylas Email allows for several properties that affect the layout and functionality of your component. You can find a complete list of properties within our [Documentation for Nylas Email](https://developer.nylas.com/docs/user-experience/components/email-component/#email-properties)

### Events and Callbacks

You can listen to certain user events from your application by adding an event listener to your component.

For example, you can listen for a `threadClicked` event with the following code:

```js
document
  .querySelector("nylas-email")
  .addEventListener("threadClicked", (event) => {
    let { detail } = event;
    console.log("thread clicked: ", detail.thread);
  });
```

A list of emitted events is available on our [Documentation for Nylas Email](https://developer.nylas.com/docs/user-experience/components/email-component/#event-listeners)

## Contributing

Please refer to our [Contributing Guidelines](CONTRIBUTING.md) for information about how to get involved. We welcome bug reports, questions, and pull requests.

1. Git clone `git@github.com:nylas/components.git`
2. Run `yarn install`
3. Run `yarn start`; your browser will load `http://localhost:8000` and show you a list of available running components

### Testing

`yarn cy:open` will launch our end-to-end tests in a browser
tests will automatically be run on push from push.yaml
snapshot (visual) diff tests are fun using Percy by running `yarn snapshot`

## Additional Documentation

- [Nylas Email on NPM](https://www.npmjs.com/package/@nylas/components-email)
- [Nylas Docs: Email Component](https://developer.nylas.com/docs/user-experience/components/email-component/)
