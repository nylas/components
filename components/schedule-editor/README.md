# Nylas Schedule Editor

Nylas Scheduler Editor (`<nylas-schedule-editor>`) lets you build event-booking functionality into your application in minutes. Use Nylas Schedule Editor with your Nylas account or by passing in your own JSON data.

Nylas Schedule Editor is currently in active development. Want to contribute? [Find out how!](../../CONTRIBUTING.md)

- [Nylas Schedule Editor](#nylas-schedule-editor)
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
    - [Using Schedule Editor Configuration with Nylas Scheduler](#using-schedule-editor-configuration-with-nylas-scheduler)

## Getting Started

- [Create a Nylas Developer Account](https://dashboard.nylas.com/register)

- [Nylas Components](https://developer.nylas.com/docs/user-experience/components/)

## Documentation

- [Nylas Scheduler reference](https://todo.developer.nylas.com/docs/user-experience/components/scheduler-editor-component/)

- [Examples](https://components.nylas.io/components/scheduler-editor/src/index.html)

## Installation

First, install the Nylas Scheduler Component with npm

```bash
npm install @nylas/components-scheduler-editor
```

or with yarn

```bash
yarn add @nylas/components-scheduler-editor
```

or using the CDN by adding this script tag

```html
<script src="https://unpkg.com/@nylas/components-schedule-editor"></script>
```

## Usage

If you've installed Nylas Scheduler using the CDN, then `<nylas-schedule-editor></nylas-schedule-editor>` is ready to use.

Otherwise, import the Nylas Scheduler Editor component into your application.

```js
import "@nylas/components-scheduler-editor";
```

### Using Nylas Provider

#### Setup

If you haven't registered for a Nylas account yet, you can do so at dashboard.nylas.com. Once there, head to the **Components** tab and create a new Scheduler Editor component.

#### Allowed domains

During the setup process, you'll be prompted to provide a list of [allowed domains](https://developer.nylas.com/docs/user-experience/components/schedule-editor-component/#allowed-domains). Be sure to add any domains you'll be testing your app on, including `localhost`, and any staging and production URLs you might use.

### Bring your own data

Nylas Scheduler Editor can be used as a UI for any data you provide.

Properties you can pass to Nylas Scheduler are [`event_title`](<(#properties)>), [`event_description`](#properties), [`event_location`](#properties), [`event_conferencing`](#properties), [`slots_to_book`](#properties)

## Reference

### Properties

| Name                   | Type                | Description                                                                                                                                                                                                                                                | Required | Default Value                                             |
| ---------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------- |
| id                     | string              | The id of the Scheduler component                                                                                                                                                                                                                          | true     |                                                           |
| access_token           | string              | Authorization for component calendar actions                                                                                                                                                                                                               | false    |                                                           |
| view_as                | AvailabilityView    | Display availability as list or calendar.                                                                                                                                                                                                                  | false    | "schedule"                                                |
| allow_booking          | boolean             | Controls if time slots are bookable when used with the Nylas Scheduler component.                                                                                                                                                                          | false    | false                                                     |
| attendees_to_show      | number              | Truncates the number of attendees shown                                                                                                                                                                                                                    | false    | 5                                                         |
| capacity               | number              | TODO: Group events? Unused                                                                                                                                                                                                                                 | false    |                                                           |
| show_as_week           | boolean             | Display component fixed length week.                                                                                                                                                                                                                       | false    | false                                                     |
| show_weekends          | boolean             | Controls whether or not to include weekends when using `show_as_week`.                                                                                                                                                                                     | false    | true                                                      |
| dates_to_show          | number              | Controls how many days to show. The actual number of days show may be less as the application will display the number of days that fit comfortably on the screen up to `dates_to_show`. When `show_as_week` is enabled, `dates_to_show` is not considered. | false    | 1                                                         |
| show_preview           | boolean             | Toggles a preview of the editor settings in Availability and Scheduler components. TODO Unused                                                                                                                                                             | false    |                                                           |
| show_ticks             | boolean             | Display time of day.                                                                                                                                                                                                                                       | false    | true                                                      |
| start_date             | Date                | Start availability component on a specific date. Used in combination with `dates_to_show = 1` to display availability for one day only.                                                                                                                    | false    | new Date()                                                |
| start_hour             | number              | Controls the start time of each day.                                                                                                                                                                                                                       | false    | 0                                                         |
| end_hour               | number              | Controls the end time for each day.                                                                                                                                                                                                                        | false    | 24                                                        |
| mandate_top_of_hour    | boolean             | Sets selected slots to the start of the hour. When `false`, slots can be selected at 15 minute intervals.                                                                                                                                                  | false    | false                                                     |
| max_bookable_slots     | number              | The maximum number of slots that can be selected.                                                                                                                                                                                                          | false    | 1                                                         |
| max_book_ahead_days    | number              | The maximum number of days in the future an event can be selected.                                                                                                                                                                                         | false    | 30                                                        |
| min_book_ahead_days    | number              | The minimum number of days in the future an event can be selected. Or the number days in advance required for an event to be selected.                                                                                                                     | false    | 0                                                         |
| notification_mode      | NotificationMode    | Choose whether to display a notification on the UI, or to send by email                                                                                                                                                                                    | false    | "show_message"                                            |
| notification_message   | string              | Set the text of the notification displayed or sent                                                                                                                                                                                                         | false    | "Thank you for scheduling!"                               |
| notification_subject   | string              | Set the subject of the notification when using `notification_mode="show_message"                                                                                                                                                                           | false    | "Invitation"                                              |
| open_hours             | AvailabilityRule[]  | Set a schedule through out the week that show as available or busy regardless of calendar availability.                                                                                                                                                    | false    | []                                                        |
| partial_bookable_ratio | number              | TODO                                                                                                                                                                                                                                                       | false    | 0.01                                                      |
| screen_bookings        | boolean             | Require meetings to be approved by the meeting host screen bookings before they're made official.                                                                                                                                                          | false    | false                                                     |
| timezone               | string              | Configure the viewing timezone for ticks and slot sizes.                                                                                                                                                                                                   | false    | ""                                                        |
| events                 | EventDefinition[]   | TODO                                                                                                                                                                                                                                                       | false    | []                                                        |
| custom_fields          | CustomField[]       | Add custom fields to collect input data from users before booking                                                                                                                                                                                          | false    | By default, the scheduler adds inputs for name, and email |
| recurrence             | Recurrence          | Choose whether event should repeat? TODO                                                                                                                                                                                                                   | false    | "none"                                                    |
| recurrence_cadence     | RecurrenceCadence[] | Set how often the event should recur.                                                                                                                                                                                                                      | false    | ["none"]                                                  |
| recurrence_expiry      | RecurrenceExpiry    | Set when recurring events should stop repeating.                                                                                                                                                                                                           | false    | null                                                      |

### Events

You can listen to certain events from your application by adding an event listener to the component.

`onError`
Listen to error events.

```js
document
  .querySelector("nylas-scheduler-editor")
  .addEventListener("onError", (event) => {
    let { detail } = event;
    console.log("onError: ", detail);
  });
```

`manifestLoaded`
Listen to manifestLoaded event. Responds with component manifest.

```js
document
  .querySelector("nylas-scheduler-editor")
  .addEventListener("manifestLoaded", (event) => {
    let { detail } = event;
    console.log("manifestLoaded: ", detail);
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

### Using Schedule Editor Configuration with Nylas Scheduler

You can configure the Nylas Scheduler Component to use the settings from the Schedule Editor by setting the Schedule Editor ID.

![Configure Schedule Editor](/./components/schedule-editor/docs/configure-schedule-editor-id.png)
