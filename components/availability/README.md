# Nylas Availability -- In Development

Nylas Availability (`<nylas-availability>`) is part of the Nylas Components library that lets you build event/calendar applications in minutes. Use Nylas Availability with your Nylas account or by passing in your own JSON data.

Nylas Availability is currently in active development. Want to contribute? [Find out how!](../../CONTRIBUTING.md)

- [Nylas Availability -- In Development](#nylas-availability----in-development)
  - [Getting Started](#getting-started)
  - [Documentation](#documentation)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Using Nylas Provider](#using-nylas-provider)
    - [Bring your own data](#bring-your-own-data)
  - [Reference (Docs Site)](#reference-docs-site)
    - [Properties](#properties)
    - [Events](#events)
    - [Types](#types)

## Getting Started

- [Create a Nylas Developer Account](https://dashboard.nylas.com/register)

- [Nylas Components](https://developer.nylas.com/docs/user-experience/components/)

## Documentation

- [Nylas Availability reference](https://todo.developer.nylas.com/docs/user-experience/components/availiability-component/)

- [Examples](https://components.nylas.io/components/availability/src/index.html)

## Installation

First, install the Nylas Availability Component with npm

```bash
npm install @nylas/components-availability
```

or with yarn

```bash
yarn add @nylas/components-availability
```

or using the CDN by adding this script tag

```html
<script src="https://unpkg.com/@nylas/components-email"></script>
```

## Usage

If you've installed Nylas Availability using the CDN, then `<nylas-availability></nylas-availability>` is ready to use.

Otherwise, import the Nylas Availability component into your application.

```js
import "@nylas/components-availability";
```

### Using Nylas Provider

#### Setup

If you haven't registered for a Nylas account yet, you can do so at dashboard.nylas.com. Once there, head to the **Components** tab and create a new Availability component.

#### Allowed domains

During the setup process, you'll be prompted to provide a list of [allowed domains](https://developer.nylas.com/docs/user-experience/components/email-component/#allowed-domains). Be sure to add any domains you'll be testing your app on, including `localhost`, and any staging and production URLs you might use.

### Bring your own data

Nylas Availability can be used as a UI for any calendar data you provide.

Properties you can pass to Nylas Availability are [`calendars`](<(#properties)>), [`opening_hours`](#properties)

## Reference (Docs Site)

### Properties

| Name                   | Type               | Description                                                                                                                                                                                                                                                | Required | Default Value |
| ---------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------- |
| id                     | String             | The id of the Availability component                                                                                                                                                                                                                       | true     |               |
| access_token           | String             | Authorization for calendar queries                                                                                                                                                                                                                         | false    |               |
| view_as                | AvailabilityView   | Display availability as list or calendar.                                                                                                                                                                                                                  | false    | "schedule"    |
| show_header            | Boolean            | Toggles legend display.                                                                                                                                                                                                                                    | false    | true          |
| date_format            | DateFormat         | Set the format of the date in the legend to show full date, day of the month, or day of the week.                                                                                                                                                          | false    | "full"        |
| busy_color             | String             | Customize the color of busy time slots in the legend and ticks in schedule view.                                                                                                                                                                           | false    | "#EE3248cc"   |
| closed_color           | String             | Customize the color of closed time slots in the legend and ticks in schedule view.                                                                                                                                                                         | false    | "#EE3248cc"   |
| free_color             | String             | Customize the color of available time slots in the legend and ticks in schedule view.                                                                                                                                                                      | false    | "#078351cc"   |
| partial_color          | String             | Customize the color of partially available time slots in the legend and ticks in schedule view.                                                                                                                                                            | false    | "#FECA7Ccc"   |
| selected_color         | String             | Customize the color of busy time slots in the legend and ticks in schedule view.                                                                                                                                                                           | false    | "#002db4"     |
| show_as_week           | Boolean            | Display component fixed length week.                                                                                                                                                                                                                       | false    | false         |
| show_weekends          | Boolean            | Controls whether or not to include weekends when using `show_as_week`.                                                                                                                                                                                     | false    | true          |
| show_ticks             | Boolean            | Toggles time of day display when using `show_as_week`.                                                                                                                                                                                                     | false    | true          |
| dates_to_show          | Number             | Controls how many days to show. The actual number of days show may be less as the application will display the number of days that fit comfortably on the screen up to `dates_to_show`. When `show_as_week` is enabled, `dates_to_show` is not considered. | false    | 1             |
| show_hosts             | HostView           | Toggles hosts display.                                                                                                                                                                                                                                     | false    | "show"        |
| allow_date_change      | Boolean            | Controls if the date can be changed. When set to `true`, the user can not change the day. When set to `false`, the Availability component is fixed to today's date or `start_date` if passed.                                                              | false    | true          |
| attendees_to_show      | Number             | Truncates the number of attendees shown TODO                                                                                                                                                                                                               | false    | 5             |
| start_date             | Date               | Start availability component on a specific date. Used in combination with `dates_to_show = 1` to display availability for one day only.                                                                                                                    | false    | new Date()    |
| start_hour             | Number             | Controls the start time of each day.                                                                                                                                                                                                                       | false    | 0             |
| end_hour               | Number             | Controls the end time for each day.                                                                                                                                                                                                                        | false    | 24            |
| slot_size              | Number             | Set the size of each time block in minutes.                                                                                                                                                                                                                | false    | 15            |
| open_hours             | AvailabilityRule[] | Set a schedule through out the week that show as available or busy regardless of calendar availability.                                                                                                                                                    | false    | []            |
| events                 | EventDefinition[]  | TODO                                                                                                                                                                                                                                                       | false    | []            |
| calendars              | Calendar[]         | TODO                                                                                                                                                                                                                                                       | false    | []            |
| participants           | String[]           | Set the participants to check availability for each time slot.                                                                                                                                                                                             | false    | []            |
| required_participants  | String[]           | Set the participants who must be available for each time slot.                                                                                                                                                                                             | false    | []            |
| timezone               | String             | Configure the viewing timezone for ticks and slot sizes.                                                                                                                                                                                                   | false    | ""            |
| event_buffer           | Number             | TODO: Time in minutes to add before and after each time slot.                                                                                                                                                                                              | false    | 0             |
| capacity               | Number             | TODO: Group events? Unused                                                                                                                                                                                                                                 | false    | ?             |
| allow_booking          | Boolean            | Controls if time slots are bookable when used with the Nylas Scheduler component.                                                                                                                                                                          | false    | false         |
| booking_user_email     | String             | TODO?                                                                                                                                                                                                                                                      | false    | false         |
| booking_user_token     | String             | TODO?                                                                                                                                                                                                                                                      | false    | false         |
| mandate_top_of_hour    | Boolean            | Sets selected slots to the start of the hour. When `false`, slots can be selected at 15 minute intervals.                                                                                                                                                  | false    | false         |
| max_bookable_slots     | Number             | The maximum number of slots that can be selected.                                                                                                                                                                                                          | false    | 1             |
| max_book_ahead_days    | Number             | The maximum number of days in the future an event can be selected.                                                                                                                                                                                         | false    | 30            |
| min_book_ahead_days    | Number             | The minimum number of days in the future an event can be selected. Or the number days in advance required for an event to be selected.                                                                                                                     | false    | 0             |
| overbooked_threshold   | Number             | TODO                                                                                                                                                                                                                                                       | false    | 100           |
| partial_bookable_ratio | Number             | TODO                                                                                                                                                                                                                                                       | false    | 0.01          |

### Events

You can listen to certain events from your application by adding an event listener to the component.

`onError`
Listen to error events.

```js
document
  .querySelector("nylas-availability")
  .addEventListener("onError", (event) => {
    let { detail } = event;
    console.log("onError: ", detail);
  });
```

`timeSlotChosen`
Listen to timeSlotChosen event. Responds with an list of SelectableSlots.

```js
document
  .querySelector("nylas-availability")
  .addEventListener("timeSlotChosen", (event) => {
    let { detail } = event;
    console.log("timeSlotChosen: ", detail.timeSlots);
  });
```

`eventOptionsReady`

```js
document
  .querySelector("nylas-availability")
  .addEventListener("eventOptionsReady", (event) => {
    let { detail } = event;
    console.log("eventOptionsReady: ", detail.slots);
  });
```

### Types

```ts
type DateFormat: "full" | "date"| "weekday" | "none";

type AvailabilityView: "schedule"| "list";

type HostView: "show" | "hide";

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

interface SelectableSlot extends TimeSlot {
  selectionStatus: SelectionStatus;
  availability: AvailabilityStatus;
  selectionPending?: boolean;
  hovering?: boolean;
  timezone?: string;
}
```
