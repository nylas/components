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
  - [Reference](#reference)
    - [Properties](#properties)
    - [Events](#events)
    - [Types](#types)

## Getting Started

- [Create a Nylas Developer Account](https://dashboard.nylas.com/register)

- [Nylas Components](https://developer.nylas.com/docs/user-experience/components/)

## Documentation

- [Nylas Availability reference](https://developer.nylas.com/docs/user-experience/components/availiability-component/)

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
<script src="https://unpkg.com/@nylas/components-availability"></script>
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

During the setup process, you'll be prompted to provide a list of [allowed domains](https://developer.nylas.com/docs/user-experience/components/availability-component/#allowed-domains). Be sure to add any domains you'll be testing your app on, including `localhost`, and any staging and production URLs you might use.

### Bring your own data

Nylas Availability can be used as a UI for any calendar data you provide.

Properties you can pass to Nylas Availability are [`calendars`](<(#properties)>), [`opening_hours`](#properties)

## Reference

### Properties

| Name                   | Type                 | Description                                                                                                                                                                                                                                                | Required | Default Value |
| ---------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------- |
| id                     | string               | The id of the Availability component                                                                                                                                                                                                                       | true     |               |
| access_token           | string               | Individual user's access token if the component has been enabled for all accounts                                                                                                                                                                          | false    |               |
| view_as                | AvailabilityView     | Display availability as a list or calendar.                                                                                                                                                                                                                | false    | "schedule"    |
| show_header            | boolean              | Toggles header display.                                                                                                                                                                                                                                    | false    | true          |
| date_format            | DateFormat           | Set the format of the date in the legend to show full date, day of the month, or day of the week.                                                                                                                                                          | false    | "full"        |
| busy_color             | string               | Customize the color of busy time slots in the legend and ticks in the calendar view.                                                                                                                                                                       | false    | "#EE3248"     |
| closed_color           | string               | Customize the color of closed time slots in the legend and ticks in the calendar view.                                                                                                                                                                     | false    | "#EE3248"     |
| free_color             | string               | Customize the color of available time slots in the legend and ticks in the calendar view.                                                                                                                                                                  | false    | "#078351"     |
| partial_color          | string               | Customize the color of partially available time slots in the legend and ticks in the calendar view.                                                                                                                                                        | false    | "#FECA7C"     |
| selected_color         | string               | Customize the color of busy time slots in the legend and ticks in the calendar view.                                                                                                                                                                       | false    | "#002DB4"     |
| unavailable_color      | string               | Customize the color of unavailable time slots in the legend and ticks in the calendar view.                                                                                                                                                                | false    | "#DDDDDD"     |
| show_as_week           | boolean              | Displays availability as a fixed length week, 7 days (Sun - Sat)                                                                                                                                                                                           | false    | false         |
| show_weekends          | boolean              | Controls whether or not to include weekends when using `show_as_week`.                                                                                                                                                                                     | false    | true          |
| show_ticks             | boolean              | Display the time of day on the left side of the calendar view.                                                                                                                                                                                             | false    | true          |
| dates_to_show          | number               | Controls how many days to show. The actual number of days show may be less as the application will display the number of days that fit comfortably on the screen up to `dates_to_show`. When `show_as_week` is enabled, `dates_to_show` is not considered. | false    | 1             |
| allow_date_change      | boolean              | Controls if the date can be changed. When set to `true`, the user can change the day. When set to `false`, the Availability component is fixed to today's date or `start_date` if passed.                                                                  | false    | true          |
| start_date             | Date                 | Start availability component on a specific date. Used in combination with `dates_to_show = 1` to display availability for one day only.                                                                                                                    | false    | new Date()    |
| start_hour             | number               | Controls the start time of each day.                                                                                                                                                                                                                       | false    | 0             |
| end_hour               | number               | Controls the end time for each day.                                                                                                                                                                                                                        | false    | 24            |
| slot_size              | number               | Set the size of each time slot in minutes.                                                                                                                                                                                                                 | false    | 15            |
| open_hours             | AvailabilityRule[]   | Set a schedule through out the week that show as available or busy regardless of calendar availability.                                                                                                                                                    | false    | []            |
| events                 | EventDefinition[]    | A list of event(s) to be booked. If multiple events are provided, the component will attempt to book them consecutively.                                                                                                                                   | true     | []            |
| availability           | Availability[]       | Sets the availability data to be used by the component. This data will be used by the component instead of data queried from the Nylas API.                                                                                                                | false    | []            |
| booking_options        | ConsecutiveEvent[][] | Sets the data used for displaying booking options to be used by the component. This data will be used by the component instead of data queried from the Nylas API.                                                                                         | false    | []            |
| required_participants  | string[]             | Set the participants who must be available for each time slot.                                                                                                                                                                                             | false    | []            |
| timezone               | string               | Configure the IANA timezone to be used by the component.                                                                                                                                                                                                   | false    | ""            |
| allow_booking          | boolean              | Controls if time slots can be selected.                                                                                                                                                                                                                    | false    | false         |
| mandate_top_of_hour    | boolean              | Sets selected slots to the start of the hour. When `false`, slots can be selected in intervals based on `slot_size`.                                                                                                                                       | false    | false         |
| max_book_ahead_days    | number               | The maximum number of days in the future an event can be selected.                                                                                                                                                                                         | false    | 30            |
| min_book_ahead_days    | number               | The minimum number of days in the future an event can be selected. Or the number days in advance required for an event to be selected.                                                                                                                     | false    | 0             |
| overbooked_threshold   | number               | The threshold of meetings in a day past which users will not be able to select more time slots. The threshold is calculated as a percentage of total meetings in the given day.                                                                            | false    | 100           |
| partial_bookable_ratio | number               | The number of participants that must be available at a given timeslot for it to be bookable. This value is configured as a ratio of the total number of participants.                                                                                      | false    | 0.01          |

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
