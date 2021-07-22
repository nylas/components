<svelte:options tag="nylas-day" />

<script lang="ts">
  import {
    EventStore,
    MessageStore,
    ManifestStore,
    fetchMessages,
  } from "../../../commons/src";
  import { get_current_component } from "svelte/internal";
  import { getEventDispatcher } from "@commons/methods/component";

  import {
    arc,
    range,
    scaleBand,
    scaleOrdinal,
    scaleRadial,
    schemeTableau10,
  } from "d3";

  import {
    populatePositionMap,
    updateEventPosition,
  } from "../../agenda/src/methods/position";

  import type { EventPosition } from "../../agenda/src/methods/position";
  import type { Arc, ScaleOrdinal } from "d3";
  import { onMount, tick } from "svelte";

  let manifest: Partial<Nylas.DayProperties> = {};
  let main: Element;

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  export let id: string = "";
  export let access_token: string = "";
  export let theme: string;
  export let day: Date;
  export let events: Events.Event[] | null = null;
  export let messages: Nylas.Message[] | null = null;
  export let calendar_ids: any = "";

  function getPropertyValue(name: keyof Nylas.DayProperties, def?: unknown) {
    if ($$props.hasOwnProperty(name)) {
      return $$props[name];
    } else if (manifest?.hasOwnProperty(name)) {
      return manifest[name];
    }
    return def;
  }

  $: theme = manifest && getPropertyValue("theme", "theme-1");
  $: day = manifest && getPropertyValue("day");
  $: calendar_ids = manifest && getPropertyValue("calendar_ids", "");

  let eventStatus: "idle" | "loading" | "loaded" | "error" = "idle";
  let messageStatus: "idle" | "loading" | "loaded" | "error" = "idle";

  let startOfDay: number;
  let endOfDay: number;
  $: startOfDay = new Date(day).setHours(0, 0, 0, 0) / 1000;
  $: endOfDay = new Date(day).setHours(23, 59, 59, 999) / 1000;

  // Accept either comma-separated string, or array.
  $: calendarIDs = (() => {
    let IDList = calendar_ids;
    if (typeof calendar_ids === "string" && calendar_ids.length) {
      IDList = IDList.split(",").map((id: string) => id.trim());
    }
    return IDList;
  })();

  //#region queries
  let eventsQuery: Events.EventQuery;
  let messagesQuery: Nylas.MessagesQuery;
  $: {
    eventsQuery = {
      component_id: id,
      calendarIDs,
      starts_after: startOfDay,
      ends_before: endOfDay,
    };

    if (access_token) {
      eventsQuery.access_token = access_token;
    }
    if (allValuesPresent(eventsQuery)) getEvents();
  }

  $: {
    messagesQuery = {
      component_id: id,
      received_after: startOfDay,
      received_before: endOfDay,
    };

    if (access_token) {
      messagesQuery.access_token = access_token;
    }
    if (allValuesPresent(messagesQuery)) getMessages();
  }

  const allValuesPresent = (obj: Object) =>
    Object.values(obj).every((value) => !!value);

  const getEvents = async () => {
    if (!events && !$EventStore[JSON.stringify(eventsQuery)]) {
      eventStatus = "loading";
      events = (await EventStore.getEvents(eventsQuery)) || [];
    }
    eventStatus = "loaded";
    return events;
  };

  const getMessages = async () => {
    if (!messages && !$MessageStore[JSON.stringify(messagesQuery)]) {
      messageStatus = "loading";
      await fetchMessages(messagesQuery, 0, 100);
    }
    messageStatus = "loaded";
    return $MessageStore[JSON.stringify(messagesQuery)];
  };
  //#endregion queries

  let dayEvents: Events.TimespanEvent[] = [];
  $: {
    if (events?.length) {
      dayEvents =
        events
          .filter(
            (event): event is Events.TimespanEvent =>
              "start_time" in event.when,
          )
          .map((event) => {
            event.when.start_moment =
              new Date(event.when.start_time * 1000).getMinutes() / 15 +
              new Date(event.when.start_time * 1000).getHours() * (60 / 15);
            event.when.end_moment =
              new Date(event.when.end_time * 1000).getMinutes() / 15 +
              new Date(event.when.end_time * 1000).getHours() * (60 / 15);
            return event;
          }) || [];
    }

    // Event Overlap detection and positioning
    const positionMap: Record<string, EventPosition> = {};
    populatePositionMap(dayEvents, positionMap);

    dayEvents
      // Ensure longer events are processed first, so they can be placed as far left as possible
      .sort((a, b) =>
        a.when.end_time - a.when.start_time <
        b.when.end_time - b.when.start_time
          ? 1
          : -1,
      )
      .forEach((event) => updateEventPosition(event, positionMap));
  }

  let dayMessages: Nylas.RadialMessage[] = [];
  $: {
    dayMessages =
      $MessageStore[JSON.stringify(messagesQuery)]?.map((message) => {
        return {
          ...message,
          received_moment: Math.floor(
            new Date(message.date * 1000).getMinutes() / 15 +
              new Date(message.date * 1000).getHours() * (60 / 15),
          ),
          offset: 0,
        };
      }) || [];
  }

  $: dayMessages = dayMessages.map((message) => {
    message.offset = dayMessages
      .filter((m) => m.received_moment === message.received_moment)
      .findIndex((m) => m.id === message.id);
    return message;
  });

  $: maxMessagesInABlock = Math.max.apply(
    Math,
    dayMessages.map(function (day) {
      return day.offset || 0;
    }),
  );
  //#region visualization

  const startQuarter = 0;
  const endQuarter = 96;

  let minBoundary = 300;
  $: minBoundary = Math.min(clientHeight, clientWidth) / 2;

  let outerRadius = 300;
  let innerRadius = 100;
  let outerEventRadius = 80;
  let innerEventRadius = 10;

  $: innerEventRadius = minBoundary / 30;
  $: outerEventRadius = minBoundary / 4;
  $: innerRadius = minBoundary / 3;
  $: outerRadius = minBoundary;
  let svg: SVGElement;
  let eventArc: Arc<any, Events.TimespanEvent> = arc<Events.TimespanEvent>();

  $: eventArc = arc<Events.TimespanEvent>()
    .outerRadius((d: Events.TimespanEvent) => {
      return eventY(d.relativeOverlapOffset);
    })
    .innerRadius((d: Events.TimespanEvent) =>
      eventY(d.relativeOverlapOffset + d.relativeOverlapWidth),
    )
    .padAngle(0.01)
    .padRadius(innerRadius)
    .startAngle((d: Events.TimespanEvent) => {
      return eventX(d.when.start_moment + "") as number;
    })
    .endAngle((d: Events.TimespanEvent) => {
      return eventX(d.when.end_moment + "") as number;
    });

  let messageArc: Arc<any, Nylas.RadialMessage> = arc<Nylas.RadialMessage>();
  $: messageArc = arc<Nylas.RadialMessage>()
    .innerRadius((d: Nylas.RadialMessage) => {
      return messageY(d.offset);
    })
    .outerRadius((d: Nylas.RadialMessage) => messageY(d.offset + 1))
    .padAngle(0.01)
    .padRadius(innerRadius)
    .startAngle((d: Nylas.RadialMessage) => {
      return messageX(d.received_moment + "") as number;
    })
    .endAngle((d: Nylas.RadialMessage) => {
      return (
        (messageX(d.received_moment + "") as number) + messageX.bandwidth()
      );
    });

  // Commented out vs deleted: I am thinking of bringing these back; they're the perimeter circles aroudn the component. -PR

  // $: bigArc = d3
  //   .arc()
  //   .innerRadius(outerRadius)
  //   .outerRadius(outerRadius - 1)
  //   .padAngle(0.01)
  //   .padRadius(outerRadius)
  //   .startAngle(0)
  //   .endAngle(360);
  // $: littleArc = d3
  //   .arc()
  //   .innerRadius(innerRadius)
  //   .outerRadius(innerRadius - 1)
  //   .padAngle(0.01)
  //   .padRadius(innerRadius)
  //   .startAngle(0)
  //   .endAngle(360);

  // $: arc = d3
  //   .arc()
  //   .innerRadius((d) => {
  //     console.log("uhh", d);
  //     return y(d[0]);
  //   })
  //   .outerRadius((d) => y(d[1]))
  //   .startAngle((d) => {
  //     console.log("startangle", d);
  //     return x(d.data.owner);
  //   })
  //   .endAngle((d) => x(d.data.owner) + x.bandwidth())
  //   .padAngle(0.01)
  //   .padRadius(innerRadius);

  let eventX = scaleBand();
  $: eventX = scaleBand()
    .domain(range(startQuarter, endQuarter) as [any, any])
    .range([0, 2 * Math.PI])
    .align(0);

  let eventZ: ScaleOrdinal<string, string, string> = scaleOrdinal(
    schemeTableau10,
  ).domain(dayEvents as any[]);
  // This scale maintains area proportionality of radial bars

  $: eventY = scaleRadial()
    .domain([0, 1])
    .range([innerEventRadius, outerEventRadius]);

  let messageX = scaleBand();
  $: messageX = scaleBand()
    .domain(range(startQuarter, endQuarter) as [any, any])
    .range([0, 2 * Math.PI])
    .align(0);

  let messageZ = scaleOrdinal(schemeTableau10).domain(dayMessages as any[]);
  // This scale maintains area proportionality of radial bars

  $: messageY = scaleRadial()
    .domain([0, maxMessagesInABlock + 1])
    .range([innerRadius, outerRadius]);

  //#endregion visualization

  let clientHeight = 0;
  let clientWidth = 0;

  onMount(async () => {
    await tick(); // https://github.com/sveltejs/svelte/issues/2227
    clientHeight = main?.getBoundingClientRect().height;
    clientWidth = main?.getBoundingClientRect().width;
    manifest = ((await $ManifestStore[
      JSON.stringify({ component_id: id, access_token })
    ]) || {}) as Nylas.DayProperties;
  });

  $: dispatchEvent("manifestLoaded", manifest);
</script>

<style lang="scss">
  @use 'sass:list';
  @import "../../theming/reset.scss";
  @import "../../theming/animation.scss";
  @import "../../theming/variables.scss";
  main {
    height: 100%;
    width: 100%;
    position: relative;
    aside {
      position: absolute;
      top: 0;
      width: 100%;
      text-align: center;
      font-size: 0.75rem;
      font-weight: bold;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  }
</style>

{#if manifest && manifest.error}
  <nylas-domain-error {id} />
{/if}
<main bind:this={main} bind:clientHeight bind:clientWidth>
  <aside>
    {new Date(day).toLocaleDateString()}
  </aside>
  <svg bind:this={svg}>
    <g transform="translate({clientWidth / 2}, {clientHeight / 2})">
      <!-- <path d={littleArc()} />
      <path d={bigArc()} /> -->
      {#await dayEvents then events}
        {#each events as node, i}
          <path
            id="event-path-{i}"
            d={eventArc(node) || undefined}
            fill={eventZ(i + "")}
          />
          <!-- <text dy="-10" letter-spacing="-1">
            <textPath xlink:href="#event-path-{i}">
              {node.title}
            </textPath>
          </text> -->
        {/each}
      {/await}
      {#await dayMessages then messages}
        {#each messages as node, i}
          <path
            id="message-path-{i}"
            d={messageArc(node) || undefined}
            fill={messageZ(i + "")}
            on:mouseenter={() => console.log(node)}
          />
          <!-- <text dy="-10" letter-spacing="-1">
            <textPath xlink:href="#message-path-{i}">
              {node.subject}
            </textPath>
          </text> -->
        {/each}
      {/await}
    </g>
  </svg>
</main>
