# Nylas Scheduler

Nylas Scheduler (`<nylas-scheduler>`) lets you build event-booking functionality into your application in minutes. Use Nylas Scheduler with your Nylas account or by passing in your own JSON data.

Nylas Scheduler is currently in active development. Want to contribute? [Find out how!](../../CONTRIBUTING.md)

- [Nylas Scheduler](#nylas-scheduler)
  - [Getting Started](#getting-started)
  - [Documentation](#documentation)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Using Nylas Provider](#using-nylas-provider)
    - [Bring your own data](#bring-your-own-data)
  - [Reference](#reference)
    - [Properties](#properties)
    - [Events](#events)
    - [Types](#types)
  - [Integrating with Other Components](#integrating-with-other-components)
    - [Select Event with Nylas Availability](#select-event-with-nylas-availability)
    - [Select Consecutive Events with Nylas Availability](#select-consecutive-events-with-nylas-availability)

## Getting Started

- [Create a Nylas Developer Account](https://dashboard.nylas.com/register)

- [Nylas Components](https://developer.nylas.com/docs/user-experience/components/)

## Documentation

- [Nylas Scheduler reference](https://todo.developer.nylas.com/docs/user-experience/components/scheduler-component/)

- [Examples](https://components.nylas.io/components/scheduler/src/index.html)

## Installation

First, install the Nylas Scheduler Component with npm

```bash
npm install @nylas/components-scheduler
```

or with yarn

```bash
yarn add @nylas/components-scheduler
```

or using the CDN by adding this script tag

```html
<script src="https://unpkg.com/@nylas/components-email"></script>
```

## Usage

If you've installed Nylas Scheduler using the CDN, then `<nylas-scheduler></nylas-scheduler>` is ready to use.

Otherwise, import the Nylas Scheduler component into your application.

```js
import "@nylas/components-scheduler";
```

### Using Nylas Provider

#### Setup

If you haven't registered for a Nylas account yet, you can do so at dashboard.nylas.com. Once there, head to the **Components** tab and create a new Scheduler component.

#### Allowed domains

During the setup process, you'll be prompted to provide a list of [allowed domains](https://developer.nylas.com/docs/user-experience/components/email-component/#allowed-domains). Be sure to add any domains you'll be testing your app on, including `localhost`, and any staging and production URLs you might use.

### Bring your own data

Nylas Scheduler can be used as a UI for any calendar data you provide.

Properties you can pass to Nylas Scheduler are [`event_title`](<(#properties)>), [`event_description`](#properties), [`event_location`](#properties), [`event_conferencing`](#properties), [`slots_to_book`](#properties)

## Reference

### Properties

| Name                 | Type                | Description                                                                      | Required | Default Value                                             |
| -------------------- | ------------------- | -------------------------------------------------------------------------------- | -------- | --------------------------------------------------------- |
| id                   | String              | The id of the Scheduler component                                                | true     |                                                           |
| access_token         | String              | Authorization for component calendar actions                                     | false    |                                                           |
| booking_label        | string              | Customize the text of the booking button                                         | false    | "Schedule time slots"                                     |
| custom_fields        | CustomField[]       | Add custom fields to collect input data from users before booking                | false    | By default, the scheduler adds inputs for name, and email |
| event_title          | string              | Set the title of the event to be scheduled.                                      | false    | "Meeting"                                                 |
| event_description    | string              | Set the description of the event to be scheduled.                                | false    | ""                                                        |
| event_location       | string              | Set the meeting location of the event to be scheduled.                           | false    | ""                                                        |
| event_conferencing   | string              | Set the URL of the zoom meeting                                                  | false    | ""                                                        |
| slots_to_book        | BookableSlot[]      | TODO                                                                             | false    | []                                                        |
| notification_mode    | NotificationMode    | Choose whether to display a notification on the UI, or to send by email          | false    | "show_message"                                            |
| notification_message | string              | Set the text of the notification displayed or sent                               | false    | "Thank you for scheduling!"                               |
| notification_subject | string              | Set the subject of the notification when using `notification_mode="show_message" | false    | "Invitation"                                              |
| recurrence           | Recurrence          | Choose whether event should repeat? TODO                                         | false    | "none"                                                    |
| recurrence_cadence   | RecurrenceCadence[] | Set how often the event should recur.                                            | false    | ["none"]                                                  |
| recurrence_expiry    | RecurrenceExpiry    | Set when recurring events should stop repeating.                                 | false    | null                                                      |
| event_options        | any[]               | TODO                                                                             | false    | []                                                        |

### Events

You can listen to certain events from your application by adding an event listener to the component.

`onError`
Listen to error events.

```js
document
  .querySelector("nylas-scheduler")
  .addEventListener("onError", (event) => {
    let { detail } = event;
    console.log("onError: ", detail);
  });
```

`bookedEvents`
Listen to bookedEvents event. Responds with an list of events.

```js
document
  .querySelector("nylas-scheduler")
  .addEventListener("bookedEvents", (event) => {
    let { detail } = event;
    console.log("bookedEvents: ", detail.events);
  });
```

`hoverOptionChange`
Listen to hoverOptionChange event. Responds with the actively hovered event when using consecutive mode.

```js
document
  .querySelector("nylas-scheduler")
  .addEventListener("hoverOptionChange", (event) => {
    let { detail } = event;
    console.log("hoverOptionChange: ", detail.event);
  });
```

`eventOptionSelected`
Listen to eventOptionSelected event. Responds with the actively selected event.

```js
document
  .querySelector("nylas-scheduler")
  .addEventListener("eventOptionSelected", (event) => {
    let { detail } = event;
    console.log("eventOptionSelected: ", detail.event);
  });
```

### Types

```ts
type Recurrence: "none" | "required" | "optional";

type RecurrenceCadence:
    "none"
    | "daily"
    | "weekdays"
    | "weekly"
    | "biweekly"
    | "monthly";

type RecurrenceExpiry: Date | string;

type NotificationMode: "show_message" | "send_message";

interface CustomField {
  description?: string;
  required: boolean;
  title: string;
  type: "text" | "checkbox" | "email";
  id?: string;
  placeholder?: string;
}

interface TimeSlot {
  start_time: Date;
  end_time: Date;
  available_calendars: string[];
  calendar_id?: string;
  expirySelection?: string;
  recurrence_cadence?: string;
  recurrence_expiry?: Date | string;
  isBookable: boolean;
}

interface BookableSlot extends TimeSlot {
  event_conferencing: string;
  event_description: string;
  event_location: string;
  event_title: string;
  expirySelection: string;
  participantEmails: string[];
  recurrence_cadence?:
    | "none"
    | "daily"
    | "weekdays"
    | "biweekly"
    | "weekly"
    | "monthly";
  recurrence_expiry?: Date | string;
}
```

## Integrating with Other Components

Nylas Components can also work in coordination with one another. The sections below cover different scenarios.

### Select Event with Nylas Availability

With the Nylas Scheduler Component, you can configure actions based on events. The code below is an example of responding to the `timeSlotChosen` event from the Availability component.

```ts
document.addEventListener("DOMContentLoaded", function () {
  const availability = document.querySelector("nylas-availability");
  const scheduler = document.querySelector("nylas-scheduler");

  // Set event definition
  availability.events = [
    {
      event_title: "My Intro Meeting",
      event_description: "Lets about nylas components!",
      slot_size: 15,
      participantEmails: ["example@example.com"],
    },
  ];

  // When a timeslot is selected, set the slot to book on the
  // scheduler.
  availability.addEventListener("timeSlotChosen", (event) => {
    console.log({ timeSlotChosen: event.detail.timeSlots });
    scheduler.slots_to_book = event.detail.timeSlots;
  });
});
```

### Select Consecutive Events with Nylas Availability

With the Nylas Scheduler Component, you can configure actions based on events. The code below is an example of responding to the `eventOptionSelected` event from the Availability component.

```ts
document.addEventListener("DOMContentLoaded", function () {
  const availability = document.querySelector("nylas-availability");
  const scheduler = document.querySelector("nylas-scheduler");

  // Set event definition
  availability.events = [
    {
      event_title: "My Intro Meeting",
      event_description: "Lets about nylas components!",
      slot_size: 15,
      participantEmails: ["example@example.com"],
    },
    {
      event_title: "Follow Up Meeting",
      event_description: "Lets about nylas components... again!",
      slot_size: 15,
      participantEmails: ["example@example.com"],
    },
  ];

  // When a timeslot is selected, set the slot to book on the
  // scheduler.
  availability.addEventListener("timeSlotChosen", (event) => {
    console.log({ timeSlotChosen: event.detail.timeSlots });
    scheduler.slots_to_book = event.detail.timeSlots;
  });

  availability.addEventListener("eventOptionsReady", (event) => {
    console.log({ eventOptionsReady: event.detail.slots });
    scheduler.event_options = event.detail.slots;
  });

  scheduler.addEventListener("hoverOptionChange", (event) => {
    console.log({ eventOptionSelected: event.detail.event });
    availability.event_to_hover = event.detail.event;
  });

  scheduler.addEventListener("eventOptionSelected", (event) => {
    console.log({ eventOptionSelected: event.detail.event });
    availability.event_to_select = event.detail.event;
  });
});
```
