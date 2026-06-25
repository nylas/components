<div align="center">
  <a href="https://www.nylas.com/">
    <img width="100%" alt="Nylas" src="https://github.com/user-attachments/assets/137517ae-244d-47a5-8ca7-b12984971fc4" />
  </a>

  <h1>Nylas Components</h1>

  <p>
    <strong>UI building blocks for email, calendar, and contacts — from Nylas, the infrastructure that powers communications</strong>
  </p>

  <p>
    <a href="https://developer.nylas.com/">📖 Docs</a> ·
    <a href="https://developer.nylas.com/docs/api/v3/">📚 API Reference</a> ·
    <a href="https://dashboard-v3.nylas.com/register">🚀 Sign up</a> ·
    <a href="https://github.com/orgs/nylas-samples/repositories">💡 Samples</a> ·
    <a href="https://forums.nylas.com">💬 Forum</a>
  </p>
</div>

<br />

Nylas Components are a suite of UI building blocks that let you build user-facing email, calendar, and contacts functionality in minutes. Use Nylas Components with your Nylas account or by adding standard JSON data.

[Nylas](https://developer.nylas.com/) is the infrastructure that powers communications — integrate with Gmail, Microsoft, IMAP, Zoom, and 250+ providers in 5 minutes, or give your AI agent its own mailbox. The broader platform covers [Agent Accounts](https://developer.nylas.com/docs/v3/agent-accounts/), [Email](https://developer.nylas.com/docs/v3/email/), [Calendar](https://developer.nylas.com/docs/v3/calendar/), [Contacts](https://developer.nylas.com/docs/v3/email/contacts/), [Scheduler](https://developer.nylas.com/docs/v3/scheduler/), and [Notetaker](https://developer.nylas.com/docs/v3/notetaker/).

> **Compatibility:** Nylas Components were built for the Nylas v2 API and are **not supported on the [v3 API](https://developer.nylas.com/docs/api/v3/)**. If you're starting a new v3 project, see the [Scheduler](https://developer.nylas.com/docs/v3/scheduler/) UI components and the current [SDKs](https://developer.nylas.com/docs/v3/sdks/) instead.

## Background

Front-end UIs can often be time-consuming to build, even for simple functionality. The Nylas Components are designed to help developers more quickly add communications and scheduling functionality into their app.

The Nylas Components include:

- [Email](./components/email): View an email thread or message
- [Mailbox](./components/mailbox): View, filter, and search over a group of email threads
- [Conversation](./components/conversation): View an email thread in a modern SMS-like interface
- [Agenda](./components/agenda): Display a day, week, or month view of all events from one or more users or calendars.
- [Contact List](./components/contact-list): Display a list of selectable contacts from a user’s contacts book.
- [Composer](./components/composer): Draft and send emails.

The Components repository is for people who want to modify the code and build it from the source. Visit our [documentation](https://developer.nylas.com/) if you are looking for the easiest way to get started with Nylas Components.

If you want to report a bug, create a feature request, or contribute code, take a look at the [Contributing Guidelines](CONTRIBUTING.md).

## Install

### Email

`npm i @nylas/components-email`

### Mailbox

`npm i @nylas/components-mailbox`

### Conversation

`npm i @nylas/components-conversation`

### Agenda

`npm i @nylas/components-agenda`

### Composer

`npm i @nylas/components-composer`

### Contact List

`npm i @nylas/components-contact-list`

### Alternative installation (vanilla JS)

You can use `<script src="https://unpkg.com/@nylas/components-agenda"></script>` (replace agenda with the component of your choice) to load components directly into the head of your page or application.

## Usage

Each Component can be used with a Nylas account or by passing in a JSON object. To get a component ID, create a [Nylas account](https://dashboard-v3.nylas.com/register), then click Components. From there you'll be able to create a new component and get an ID.

To see an example of each, check out the [documentation](https://developer.nylas.com/).

### Agenda Nylas Account

```js
import React from "react";
import "@nylas/components-agenda";
import "./styles.css";

export default function App() {
  return (
    <div className="App">
      <h1>Nylas Agenda</h1>
      <nylas-agenda id="c307b6e9-5da4-4efb-8095-08176ed8f361"></nylas-agenda>
    </div>
  );
}
```

### Agenda JSON Object

```js
  import Agenda from "@nylas/components-agenda";
  const staticEvents = [
    {
      title: "Some event that I am manipulating outside of the context of Nylas",
      description: "Passed in from HTML!",
      participants: [],
      when: { end_time: 1600444800, object: "timespan", start_time: 1600438500 }
    },
    {
      title: "Some I got from elsewhere",
      description: "Passed in from HTML!",
      participants: [],
      when: { end_time: 1600449999, object: "timespan", start_time: 1600448500 }
    },
    {
      title: "A third event of the day",
      description: "Passed in from HTML!",
      participants: [],
      when: { end_time: 1600468500, object: "timespan", start_time: 1600458500 }
    }
  ];
</script>

<main>
  <h1>Nylas Agenda</h1>
  <nylas-agenda events={staticEvents}/>
</main>
```

## Framework-specific workarounds

### NextJS

`nylas/components` leverages web components so for any server-side framework like [NextJS](https://nextjs.org/), we should import components at runtime.

```js
// NylasAgenda.js
export default function NylasAgenda() {
  useEffect(() => import("@nylas/components-agenda"), []);

  return <nylas-agenda id="c307b6e9-5da4-4efb-8095-08176ed8f361" />;
}

// App.js
import NylasAgenda from "./NylasAgenda";

export default function App() {
  return (
    <div className="App">
      <h1>Nylas Agenda</h1>
      <NylasAgenda />
    </div>
  );
}
```

## Contribute

Please refer to our [Contributing Guidelines](CONTRIBUTING.md) for information about how to get involved. We welcome bug reports, questions, and pull requests.

Please view our [development documentation](DOCUMENTATION.md) for information about how we've built our Components.

## License

This project is licensed under the terms of the MIT open source license. Please refer to [LICENSE](LICENSE) for the full terms.

---

## Build From Source

Ensure that any new middleware requests can optionally accept an `access_token` to pass through to the middleware.

### Installation

You must have node version 14.0.0.

1. Git clone `git@github.com:nylas/components.git`
2. Run `yarn install`
3. Create a `.env` file in the project root and copy over the contents of `.env-sample` into it

### Local Development

After installing, run `yarn start`, go to `http://localhost:8000` in your browser

### Testing

`yarn cy:open` will launch our end-to-end tests in a browser
tests will automatically be run on push from push.yaml

### Push some Code

We rebase and squash our commits here. Here's how to rebase your branch:

1. Run `git checkout main`

2. Run `git pull`

3. Run `git checkout -` (this will take you back to the branch you were on before checking out main)

4. Run `git rebase -i main`. This will open up Vim on your command line 🙀

5. Hit `esc`, press `w` (for write), then hit the `enter` key. You may need to type a couple of random characters to see that you're able to write

6. Leave the first commit at the top of the file as `pick`.

7. Write `s` or `squash` beside the commits you want to squash

8. When you're done hit `esc`, press `qw` (for quit + write), then hit the `enter` key. You should be back on the command line.

9. Run `git push` to push changes to your remote branch. Your branch now has your changes and the most recent commits.
