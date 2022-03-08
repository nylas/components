<svelte:options tag="nylas-schedule-editor" />

<script lang="ts">
  import { DefaultCustomFields } from "@commons/constants/custom-fields";
  import { NotificationMode } from "@commons/enums/Booking";
  import parseStringToArray, {
    buildInternalProps,
  } from "@commons/methods/component";
  import { weekdays } from "@commons/methods/datetime";
  import type { AvailabilityRule, TimeSlot } from "@commons/types/Availability";

  import type {
    Manifest,
    EventDefinition,
    Sections,
  } from "@commons/types/ScheduleEditor";
  import { SectionNames } from "@commons/types/ScheduleEditor";

  import type { CustomField } from "@commons/types/Booking";
  import { onDestroy, onMount, tick } from "svelte";
  import timezones from "timezones-list";
  import { ErrorStore, ManifestStore } from "@commons";
  import { getEventDispatcher } from "@commons/methods/component";
  import { saveManifest } from "@commons/connections/manifest";
  import "../../availability/src/Availability.svelte";
  import "../../booking/src/Booking.svelte";
  import CheckmarkIcon from "./assets/checkmark-icon.svg";
  import DragIcon from "./assets/drag-icon.svg";
  import PencilIcon from "./assets/pencil-icon.svg";
  import PlusIcon from "./assets/plus-icon.svg";
  import TrashIcon from "./assets/trash-icon.svg";
  import "./components/DragItemPlaceholder.svelte";
  import "./components/EditorSection.svelte";
  import { getDomRects, getDomRectsFromParentAndChildren } from "./methods/dom";
  import { get_current_component } from "svelte/internal";

  export let id: string = "";
  export let access_token: string = "";

  export let allow_booking: boolean;
  export let attendees_to_show: number;
  export let capacity: number | null;
  export let custom_fields: CustomField[];
  export let dates_to_show: number;
  export let end_hour: number;
  export let mandate_top_of_hour: boolean;
  export let max_bookable_slots: number;
  export let max_book_ahead_days: number;
  export let min_book_ahead_days: number;
  export let notification_message: string;
  export let notification_mode: NotificationMode;
  export let notification_subject: string;
  export let open_hours: AvailabilityRule[];
  export let partial_bookable_ratio: number;
  export let recurrence: "none" | "required" | "optional";
  export let recurrence_cadence: (
    | "none"
    | "daily"
    | "weekdays"
    | "weekly"
    | "biweekly"
    | "monthly"
  )[];
  export let show_as_week: boolean;
  export let show_preview: boolean;
  export let show_ticks: boolean;
  export let show_weekends: boolean;
  export let start_date: Date;
  export let start_hour: number;
  export let view_as: "schedule" | "list";
  export let screen_bookings: boolean;
  export let timezone: string;
  export let events: EventDefinition[];
  export let sections: Partial<Sections>;

  const dispatchEvent = getEventDispatcher(get_current_component());
  $: dispatchEvent("manifestLoaded", manifest);

  $: if (Object.keys($ErrorStore).length) {
    dispatchEvent("onError", $ErrorStore);
  }

  const eventTemplate: EventDefinition = {
    event_title: "",
    event_description: "",
    slot_size: 15,
    event_location: "",
    event_conferencing: "",
    participantEmails: [],
    host_rules: {
      method: "all",
    },
  };

  const defaultValueMap: Partial<Manifest> = {
    allow_booking: false,
    attendees_to_show: 5,
    capacity: null,
    custom_fields: DefaultCustomFields,
    dates_to_show: 1,
    end_hour: 17,
    mandate_top_of_hour: false,
    max_bookable_slots: 1,
    max_book_ahead_days: 30,
    min_book_ahead_days: 0,
    notification_message: "Thank you for scheduling!",
    notification_mode: NotificationMode.SHOW_MESSAGE,
    notification_subject: "Invitation",
    open_hours: [],
    partial_bookable_ratio: 0.01,
    recurrence_cadence: ["none"],
    recurrence: "none",
    show_as_week: false,
    show_ticks: true,
    show_weekends: true,
    start_date: new Date(),
    start_hour: 9,
    view_as: "schedule",
    screen_bookings: false,
    timezone: "",
    events: [{ ...eventTemplate }],
    sections: {},
  };

  let main: HTMLElement;

  //#region mount and prop initialization
  let _this = <Manifest>buildInternalProps({}, {}, defaultValueMap);
  let initialized = false;
  let manifest: Partial<Manifest> = {};

  onMount(async () => {
    await tick();
    const storeKey = JSON.stringify({ component_id: id, access_token });
    manifest = (await $ManifestStore[storeKey]) || {};

    _this = buildInternalProps($$props, manifest, defaultValueMap) as Manifest;
    transformPropertyValues();

    // Initialize sections
    establishSections();

    initialized = true;

    // Setup temporary ids for custom fields for drag reorder functionality
    _this.custom_fields = _this.custom_fields.map((field, i) => {
      customFieldIdOrder = customFieldIdOrder.concat(String(i));

      return {
        ...field,
        id: String(i),
      };
    });
  });

  onDestroy(() => {
    main.removeEventListener("mousemove", handleCustomFieldDragMove);
    main.removeEventListener("mouseup", handleCustomFieldDragRelease);

    if (rowResizeObserver) {
      rowResizeObserver.disconnect();
    }
  });

  $: if (main) {
    main.addEventListener("mouseup", handleCustomFieldDragRelease);
    main.addEventListener("mousemove", handleCustomFieldDragMove);
  }

  let previousProps = $$props;
  $: {
    if (JSON.stringify(previousProps) !== JSON.stringify($$props)) {
      _this = buildInternalProps(
        $$props,
        manifest,
        defaultValueMap,
      ) as Manifest;
      transformPropertyValues();
      previousProps = $$props;
    }
  }

  // Properties requiring further manipulation:
  let startDate: string | null = new Date().toLocaleDateString("en-CA");
  let customStartDate: boolean = false;

  function transformPropertyValues() {
    startDate = _this.start_date?.toLocaleDateString("en-CA") as string;
    customStartDate = _this.start_date ? true : false;
  }

  $: {
    if (initialized) {
      if (startDate) {
        _this.start_date = new Date(
          new Date(startDate).getTime() -
            new Date(startDate).getTimezoneOffset() * -60000,
        );
      } else {
        _this.start_date = null;
      }
    }
  }
  // #endregion mount and prop initialization

  function saveProperties() {
    const cleanedProps = {
      ..._this,
      custom_fields: _this.custom_fields.map((field) => {
        delete field.id; // used only for drag reorder interactions
        return field;
      }),
    };

    saveManifest(id, cleanedProps, access_token);
  }

  // #region unpersisted variables
  function availabilityChosen(event: any) {
    _this.open_hours = event.detail.timeSlots.map((slot: TimeSlot) => {
      const { start_time, end_time } = slot;
      const openTime: any = {
        startHour: start_time.getHours(),
        startMinute: start_time.getMinutes(),
        endHour: end_time.getHours(),
        endMinute: end_time.getMinutes(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      if (_this.show_as_week || _this.show_weekends) {
        openTime.startWeekday = start_time.getDay();
        openTime.endWeekday = end_time.getDay();
      }
      return openTime;
    });
  }

  // niceDate: shows date rules in a nice string format; selectively includes weekday if _this.show_as_week /  _this.show_weekends are set
  function niceDate(block: AvailabilityRule) {
    const startMoment = new Date(
      0,
      0,
      0,
      block.startHour,
      block.startMinute,
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const endMoment = new Date(
      0,
      0,
      0,
      block.endHour,
      block.endMinute,
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if ((_this.show_as_week || _this.show_weekends) && block.startWeekday) {
      const weekday = weekdays[block.startWeekday];
      return `${weekday}: ${startMoment} - ${endMoment}`;
    } else {
      return `${startMoment} - ${endMoment}`;
    }
  }
  // #endregion unpersisted variables

  let width = "640px";
  let gutterWidth = 35;
  $: width = showPreview ? "640px" : "100%";
  let adjustingPreviewPane: boolean = false;

  function adjustColumns(e: MouseEvent) {
    if (adjustingPreviewPane) {
      width = `${e.clientX - gutterWidth}px`;
    }
  }

  let debouncedInputTimer: number;

  function debounceEmailInput(e: Event, event: EventDefinition) {
    const emailString = (e.target as HTMLTextAreaElement)?.value;
    clearTimeout(debouncedInputTimer);
    debouncedInputTimer = setTimeout(() => {
      event.participantEmails = parseStringToArray(emailString);
      _this.events = [..._this.events];
    }, 1000);
  }

  let slots_to_book: TimeSlot;
  let mainElementWidth: number;
  $: showPreview = mainElementWidth > 600;

  //#region custom fields
  const emptyCustomField: CustomField = {
    title: "",
    description: "",
    type: "text",
    required: false,
    id: "",
  };
  const customFieldKeys: (keyof CustomField)[] = ["title", "type", "required"];

  let newCustomField: CustomField = { ...emptyCustomField };
  let editableCustomField: CustomField = { ...emptyCustomField };

  let currentlyEditedField: string = null;
  let isAddingCustomField = false;

  function removeCustomField(field: CustomField) {
    _this.custom_fields = _this.custom_fields.filter(
      (customField: CustomField) => customField !== field,
    );
    currentlyEditedField = null;
  }

  function addNewField() {
    const fieldWithId = {
      ...newCustomField,
      id: String(_this.custom_fields.length),
    };
    _this.custom_fields = [..._this.custom_fields, fieldWithId];

    newCustomField = { ...emptyCustomField };

    customFieldDomRects = getDomRects(customFieldRefs);
    isAddingCustomField = false;
  }

  function editCustomField(field: CustomField) {
    editableCustomField = {
      ...emptyCustomField,
      ...field,
    };
    currentlyEditedField = field.id;
  }

  let draggedField: CustomField | null = null;
  let draggedFieldIndex: number;
  let tablerowRect: DOMRect;
  let tablecellRect: DOMRect[] = []; // To replicate cell dimensions on drag-placeholder
  let customFieldRefs: Record<string, HTMLElement> = {}; // store the refs to dom nodes once so we can recalculate sizes on the fly
  let customFieldDomRects: DOMRect[] = [];
  let customFieldIdOrder: string[] = [];
  let maxDragTop: number;
  let maxDragBottom: number;
  let dragBegins = false;
  let dragPlaceholder = {
    left: 0,
    top: 0,
  };
  let rowResizeObserver: ResizeObserver;

  function handleCustomFieldDrag(
    event: MouseEvent,
    fieldProperties: CustomField,
    fieldIndex: number,
  ) {
    if (!dragBegins) {
      customFieldDomRects = getDomRects(customFieldRefs);
      dragBegins = true;
    }

    draggedFieldIndex = fieldIndex;
    draggedField = fieldProperties;

    setDragRowPosition(event);
  }

  function handleCustomFieldDragRelease() {
    draggedField = null;
  }

  function swapDraggedWithHovered(hoveredFieldIndex: number) {
    let updatedFieldOrder = [..._this.custom_fields];

    // Swap the current hovered field with the dragged field
    let temp = updatedFieldOrder[hoveredFieldIndex];
    updatedFieldOrder[hoveredFieldIndex] = updatedFieldOrder[draggedFieldIndex];
    updatedFieldOrder[draggedFieldIndex] = temp;

    // update custom fields to reflect the drag order
    _this.custom_fields = updatedFieldOrder;
    customFieldIdOrder = <string[]>updatedFieldOrder.map((field) => field.id);

    // current dragged index is now what was hovered
    draggedFieldIndex = updatedFieldOrder.findIndex(
      (customField) => customField.id === draggedField?.id,
    );
  }

  /**
   * Sets position for the drag preview row
   * @param event
   */
  const setDragRowPosition = (event: MouseEvent) => {
    const rowHeightOffset = tablerowRect.height / 2;
    const dragRowPosition = event.pageY;

    // stick the drag preview if cursor is beyond max top and max bottom
    let previewTopPosition: number | null = null;
    if (dragRowPosition <= maxDragTop) {
      previewTopPosition = maxDragTop - rowHeightOffset;
    } else if (dragRowPosition >= maxDragBottom) {
      previewTopPosition = maxDragBottom - rowHeightOffset;
    }

    // set initial position of drag preview
    dragPlaceholder = {
      left: tablerowRect.x,
      top: previewTopPosition ?? dragRowPosition - rowHeightOffset,
    };
  };

  $: if (customFieldDomRects) {
    // Set max top and bottom for drag
    if (customFieldDomRects[0]) {
      maxDragTop =
        document.documentElement.scrollTop +
        customFieldDomRects[0].top +
        tablerowRect.height / 2;
    }
    if (customFieldDomRects[customFieldDomRects.length - 1]) {
      maxDragBottom =
        document.documentElement.scrollTop +
        customFieldDomRects[customFieldDomRects.length - 1].top +
        tablerowRect.height / 2;
    }
  }

  function handleCustomFieldDragMove(e: MouseEvent) {
    if (draggedField) {
      setDragRowPosition(e);
    }
  }

  function storeRef(node: HTMLElement, params: { id: string }) {
    customFieldRefs[params.id] = node;

    if (!tablerowRect) {
      const { parentRect, childRects } = getDomRectsFromParentAndChildren(
        node,
        "td",
      );
      tablerowRect = parentRect;
      tablecellRect = childRects;

      // Watches row element if it changes size
      rowResizeObserver = new ResizeObserver(([observerEntry]) => {
        const { parentRect, childRects } = getDomRectsFromParentAndChildren(
          observerEntry.target,
          "td",
        );
        tablerowRect = parentRect;
        tablecellRect = childRects;

        dragBegins = false; // reset on next start of drag
      });

      rowResizeObserver.observe(node);
    }

    return {
      destroy() {
        // clean up customFieldIdOrder hashmap
        delete customFieldRefs[params.id];
      },
    };
  }

  //#endregion custom fields

  //#region consecutive events

  function addConsecutiveEvent() {
    _this.events = [..._this.events, { ...eventTemplate }];
  }

  function removeConsecutiveEvent(event: EventDefinition) {
    _this.events = _this.events.filter((e) => e !== event);
  }

  //#endregion consecutive events

  //#region initialize sections

  function establishSections() {
    if (!Object.entries(_this.sections).length) {
      Object.values(SectionNames).forEach((name, iter) => {
        _this.sections[name] = {
          expanded: iter === 0,
          editable: true,
          hidden_fields: [],
        };
      });
    } else {
      Object.values(SectionNames).forEach((name) => {
        // If a section doesnt appear in the passed property,
        // normalize it with uneditable properties here to preserve expected format
        if (!_this.sections[name]) {
          _this.sections[name] = {
            expanded: false,
            editable: false,
            hidden_fields: [],
          };
        } else {
          // If the section is passed in but lacks an "editable" property, assume positive intent.
          if (!Object.keys(_this.sections[name]).includes("editable")) {
            _this.sections[name].editable = true;
          }
          // Establish a default empty list for hidden fields
          if (!Object.keys(_this.sections[name]).includes("hidden_fields")) {
            _this.sections[name].hidden_fields = [];
          }
        }
      });
    }
  }

  function fieldIsEditable(sectionName: SectionNames, fieldName: string) {
    // console.log("is field editable?", sectionName, fieldName);
    return !_this.sections[sectionName].hidden_fields.includes(fieldName);
  }
  //#endregion initialize sections
</script>

<style lang="scss">
  @import "./styles/schedule-editor.scss";
</style>

{#if manifest && manifest.error}
  <nylas-domain-error {id} />
{:else if initialized}
  <main
    style="grid-template-columns: {width} 5px auto"
    on:mousemove={adjustColumns}
    on:mouseup={() => (adjustingPreviewPane = false)}
    bind:clientWidth={mainElementWidth}
    bind:this={main}>
    <div class="settings">
      {#if _this.sections[SectionNames.BASIC_DETAILS].editable}
        <nylas-schedule-editor-section
          section_title={SectionNames.BASIC_DETAILS}
          expanded={_this.sections[SectionNames.BASIC_DETAILS].expanded}>
          <h1 slot="title">Event Details</h1>
          <p slot="intro" class="intro">
            Edit the details for your meeting. You can add consecutive meetings
            to allow users to book back-to-back events.
          </p>
          <div slot="contents" class="contents basic-details">
            {#each _this.events as event, iter}
              <fieldset>
                {#if _this.events.length > 1}
                  <button
                    class="remove-event"
                    on:click={() => removeConsecutiveEvent(event)}>
                    Remove this event
                  </button>
                {/if}
                {#if fieldIsEditable(SectionNames.BASIC_DETAILS, "event_title")}
                  <label>
                    <strong>Event Title</strong>
                    <input type="text" bind:value={event.event_title} />
                  </label>
                {/if}
                {#if fieldIsEditable(SectionNames.BASIC_DETAILS, "event_description")}
                  <label>
                    <strong>Event Description</strong>
                    <input type="text" bind:value={event.event_description} />
                  </label>
                {/if}
                {#if fieldIsEditable(SectionNames.BASIC_DETAILS, "event_location")}
                  <label>
                    <strong>Event Location</strong>
                    <input type="text" bind:value={event.event_location} />
                  </label>
                {/if}
                {#if fieldIsEditable(SectionNames.BASIC_DETAILS, "conferencing_link")}
                  <label>
                    <strong
                      >Conferencing Link (Zoom, Teams, or Meet URL)</strong>
                    <input type="url" bind:value={event.event_conferencing} />
                  </label>
                {/if}
                {#if fieldIsEditable(SectionNames.BASIC_DETAILS, "meeting_length")}
                  <div role="radiogroup" aria-labelledby="slot_size">
                    <strong id="slot_size">Meeting Length</strong>
                    <label>
                      <input
                        type="radio"
                        value={15}
                        bind:group={event.slot_size} />
                      <span>15 minutes</span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        value={30}
                        bind:group={event.slot_size} />
                      <span>30 minutes</span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        value={60}
                        bind:group={event.slot_size} />
                      <span>60 minutes</span>
                    </label>
                    {#if iter !== 0 && event.slot_size !== _this.events[0].slot_size}
                      <!-- Temporary! Nylas' Consecutive Availabiilty API does not support variant time lengths between meetings -->
                      <!-- https://app.shortcut.com/nylas/story/74514/consecutive-availability-allow-to-specify-duration-minutes-per-meeting -->
                      <p class="warning">
                        Note: different meeting lengths in a conecutive chain
                        are not currently supported; all meetings in this chain
                        will fall back to {_this.events[0].slot_size} minutes.
                      </p>
                    {/if}
                  </div>
                {/if}
                {#if fieldIsEditable(SectionNames.BASIC_DETAILS, "participants")}
                  <div>
                    <strong id="participants">
                      Email Ids to include for scheduling
                    </strong>
                    <label>
                      <textarea
                        name="participants"
                        on:input={(e) => debounceEmailInput(e, event)}
                        value={event.participantEmails} />
                    </label>
                  </div>
                {/if}
              </fieldset>
            {/each}
          </div>
          <footer slot="footer">
            <button class="add-event" on:click={addConsecutiveEvent}
              >Add a follow-up event</button>
            <button on:click={saveProperties}>Save Editor Options</button>
          </footer>
        </nylas-schedule-editor-section>
      {/if}

      {#if _this.sections[SectionNames.TIME_DATE_DETAILS].editable}
        <nylas-schedule-editor-section
          section_title={SectionNames.TIME_DATE_DETAILS}
          expanded={_this.sections[SectionNames.TIME_DATE_DETAILS].expanded}>
          <h1 slot="title">Date/Time Details</h1>
          <div slot="contents" class="contents">
            {#if fieldIsEditable(SectionNames.TIME_DATE_DETAILS, "start_hour")}
              <label>
                <strong>Start Hour</strong>
                <input
                  type="range"
                  min={0}
                  max={24}
                  step={1}
                  bind:value={_this.start_hour} />
                {_this.start_hour}:00
              </label>
            {/if}
            {#if fieldIsEditable(SectionNames.TIME_DATE_DETAILS, "end_hour")}
              <label>
                <strong>End Hour</strong>
                <input
                  type="range"
                  min={0}
                  max={24}
                  step={1}
                  bind:value={_this.end_hour} />
                {_this.end_hour}:00
              </label>
            {/if}
            {#if fieldIsEditable(SectionNames.TIME_DATE_DETAILS, "start_date")}
              <label>
                <strong>Start Date</strong>
                <strong>
                  <input
                    type="checkbox"
                    name="custom_start_date"
                    bind:checked={customStartDate}
                    on:change={async () => {
                      if (!customStartDate) {
                        startDate = new Date().toLocaleDateString("en-CA");
                        await tick();
                        startDate = null;
                      }
                    }} />
                  Show a specific date
                </strong>

                <input
                  type="date"
                  bind:value={startDate}
                  disabled={!customStartDate} />
              </label>
            {/if}
            {#if fieldIsEditable(SectionNames.TIME_DATE_DETAILS, "time_zone")}
              <label>
                <strong>Time Zone</strong>
                <select bind:value={_this.timezone}>
                  {#each timezones.default as timezone}
                    <option value={timezone.tzCode}>{timezone.name}</option>
                  {/each}
                </select>
              </label>
            {/if}
            {#if fieldIsEditable(SectionNames.TIME_DATE_DETAILS, "days_to_show")}
              <label>
                <strong>Days to show</strong>
                <input
                  type="range"
                  min={1}
                  max={7}
                  step={1}
                  bind:value={_this.dates_to_show} />
                {_this.dates_to_show}
              </label>
            {/if}
            {#if fieldIsEditable(SectionNames.TIME_DATE_DETAILS, "show_as_week")}
              <div role="checkbox" aria-labelledby="show_as_week">
                <strong id="show_as_week">Show as week</strong>
                <label>
                  <input
                    type="checkbox"
                    name="show_as_week"
                    bind:checked={_this.show_as_week} />
                  Show whole week
                </label>
              </div>
            {/if}
            {#if fieldIsEditable(SectionNames.TIME_DATE_DETAILS, "show_weekends")}
              <div role="checkbox" aria-labelledby="show_weekends">
                <strong id="show_weekends">Show weekends</strong>
                <label>
                  <input
                    type="checkbox"
                    name="show_weekends"
                    bind:checked={_this.show_weekends} />
                  Keep weekends on
                </label>
              </div>
            {/if}
            {#if fieldIsEditable(SectionNames.TIME_DATE_DETAILS, "available_hours")}
              <div class="available-hours">
                <strong>Available Hours</strong>
                <p>
                  Drag over the hours want to be availble for booking. All other
                  hours will always show up as "busy" to your users.
                </p>
                <div role="checkbox" aria-labelledby="show_as_week">
                  <label>
                    <input
                      type="checkbox"
                      name="_this.show_as_week"
                      bind:checked={_this.show_as_week} />
                    Customize each weekday
                  </label>
                </div>
                <div role="checkbox" aria-labelledby="show_as_week">
                  <label>
                    <input
                      type="checkbox"
                      name=" _this.show_weekends"
                      bind:checked={_this.show_weekends} />
                    Allow booking on weekends
                  </label>
                </div>
                <div class="availability-container">
                  <nylas-availability
                    allow_booking={true}
                    show_as_week={_this.show_as_week || _this.show_weekends}
                    show_weekends={_this.show_weekends}
                    start_hour={_this.start_hour}
                    end_hour={_this.end_hour}
                    allow_date_change={false}
                    partial_bookable_ratio="0"
                    show_header={false}
                    date_format={_this.show_as_week || _this.show_weekends
                      ? "weekday"
                      : "none"}
                    busy_color="#000"
                    closed_color="#999"
                    selected_color="#095"
                    slot_size="15"
                    on:timeSlotChosen={availabilityChosen} />
                </div>
                <ul class="availability">
                  {#each _this.open_hours || [] as availability}
                    <li>
                      <span class="date">
                        {niceDate(availability)}
                      </span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
          <footer slot="footer">
            <button on:click={saveProperties}>Save Editor Options</button>
          </footer>
        </nylas-schedule-editor-section>
      {/if}

      {#if _this.sections[SectionNames.STYLE_DETAILS].editable}
        <nylas-schedule-editor-section
          section_title={SectionNames.STYLE_DETAILS}
          expanded={_this.sections[SectionNames.STYLE_DETAILS].expanded}>
          <h1 slot="title">Style Details</h1>
          <div slot="contents" class="contents">
            {#if fieldIsEditable(SectionNames.STYLE_DETAILS, "show_ticks")}
              <div role="checkbox" aria-labelledby="show_ticks">
                <strong id="show_ticks">Show ticks</strong>
                <label>
                  <input
                    type="checkbox"
                    name="show_ticks"
                    bind:checked={_this.show_ticks} />
                  Show tick marks on left side
                </label>
              </div>
            {/if}
            {#if fieldIsEditable(SectionNames.STYLE_DETAILS, "view_as_schedule")}
              <div role="radiogroup" aria-labelledby="view_as">
                <strong id="view_as">View as a Schedule, or as a List?</strong>
                <label>
                  <input
                    type="radio"
                    name="view_as"
                    bind:group={_this.view_as}
                    value="schedule" />
                  <span>Schedule</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="view_as"
                    bind:group={_this.view_as}
                    value="list" />
                  <span>List</span>
                </label>
              </div>
            {/if}
          </div>
          <footer slot="footer">
            <button on:click={saveProperties}>Save Editor Options</button>
          </footer>
        </nylas-schedule-editor-section>
      {/if}

      {#if _this.sections[SectionNames.BOOKING_DETAILS].editable}
        <nylas-schedule-editor-section
          section_title={SectionNames.BOOKING_DETAILS}
          expanded={_this.sections[SectionNames.BOOKING_DETAILS].expanded}>
          <h1 slot="title">Booking Details</h1>
          <div slot="contents" class="contents">
            <div role="checkbox" aria-labelledby="allow_booking">
              <strong id="allow_booking">Allow booking</strong>
              <label>
                <input
                  type="checkbox"
                  name="allow_booking"
                  bind:checked={_this.allow_booking} />
                Allow bookings to be made
              </label>
            </div>
            <label>
              <strong>Maximum slots that can be booked at once</strong>
              <input
                type="number"
                min={1}
                max={20}
                bind:value={_this.max_bookable_slots} />
            </label>
            <div role="checkbox" aria-labelledby="screen_bookings">
              <strong id="screen_bookings">
                Scheduling on this calendar requires manual confirmation
              </strong>
              <label>
                <input
                  type="checkbox"
                  name="screen_bookings"
                  bind:checked={_this.screen_bookings} />
                Let the meeting host screen bookings before they're made official
              </label>
            </div>
            <label>
              <strong>Participant Threshold / Partial bookable ratio</strong>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                bind:value={_this.partial_bookable_ratio} />
              {Math.floor(_this.partial_bookable_ratio * 100)}%
            </label>
            <div role="radiogroup" aria-labelledby="recurrence">
              <strong id="recurrence">
                Allow, Disallow, or Mandate events to repeat?
              </strong>
              <label>
                <input
                  type="radio"
                  name="recurrence"
                  bind:group={_this.recurrence}
                  value="none" />
                <span>Don't Repeat Events</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="recurrence"
                  bind:group={_this.recurrence}
                  value="optional" />
                <span>Users May Repeat Events</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="recurrence"
                  bind:group={_this.recurrence}
                  value="required" />
                <span>Events Always Repeat</span>
              </label>
            </div>
            <label>
              <strong>Capacity</strong>
              <input type="number" min={1} bind:value={_this.capacity} />
            </label>
            <div role="checkbox" aria-labelledby="allow_booking">
              <strong>Top of the Hour Events</strong>
              <label>
                <input
                  type="checkbox"
                  name="mandate_top_of_hour"
                  bind:checked={_this.mandate_top_of_hour} />
                Only allow events to be booked at the Top of the Hour
              </label>
            </div>
            {#if _this.recurrence === "required" || _this.recurrence === "optional"}
              <div role="radiogroup" aria-labelledby="recurrence_cadence">
                <strong id="recurrence_cadence">
                  How often should events repeat{#if _this.recurrence === "optional"},
                    if a user chooses to do so{/if}?
                </strong>
                <label>
                  <input
                    type="checkbox"
                    name="recurrence_cadence"
                    bind:group={_this.recurrence_cadence}
                    value="daily" />
                  <span>Daily</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="recurrence_cadence"
                    bind:group={_this.recurrence_cadence}
                    value="weekdays" />
                  <span>Daily, only on weekdays</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="recurrence_cadence"
                    bind:group={_this.recurrence_cadence}
                    value="weekly" />
                  <span>Weekly</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="recurrence_cadence"
                    bind:group={_this.recurrence_cadence}
                    value="biweekly" />
                  <span>Biweekly</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="recurrence_cadence"
                    bind:group={_this.recurrence_cadence}
                    value="monthly" />
                  <span>Monthly</span>
                </label>
              </div>
            {/if}
          </div>
          <footer slot="footer">
            <button on:click={saveProperties}>Save Editor Options</button>
          </footer>
        </nylas-schedule-editor-section>
      {/if}

      {#if _this.sections[SectionNames.CUSTOM_FIELDS].editable}
        <nylas-schedule-editor-section
          section_title={SectionNames.CUSTOM_FIELDS}
          expanded={_this.sections[SectionNames.CUSTOM_FIELDS].expanded}>
          <h1 slot="title">Custom Fields</h1>
          <p slot="intro" class="intro">
            Users will fill out these fields when booking an event with your
            team. By default, they'll be asked for their name and email address.
          </p>
          <div slot="contents" class="contents">
            {#if _this.custom_fields}
              <table cellspacing="0" cellpadding="0">
                <thead>
                  <th />
                  <th>Title and description</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th />
                </thead>
                <tbody>
                  {#each _this.custom_fields as field, i (field.id)}
                    <tr
                      class:disabled={currentlyEditedField ||
                        isAddingCustomField}
                      class:drag-active={field.id === draggedField?.id}
                      on:mouseenter={() => {
                        if (draggedField && i !== draggedFieldIndex) {
                          swapDraggedWithHovered(i);
                        }
                      }}
                      use:storeRef={{ id: field.id }}>
                      <td class="cta">
                        <button
                          class="drag"
                          on:mousedown={(event) => {
                            handleCustomFieldDrag(event, field, i);
                          }}>
                          <span class="sr-only">Reorder custom field</span>
                          <DragIcon />
                        </button>
                      </td>
                      <td
                        class:multi-line={field.description}
                        class={"title-and-description"}>
                        <span>{field.title ?? "—"}</span>
                        {#if field.description}
                          <span class="description">{field.description}</span>
                        {/if}
                      </td>
                      <td class="type">{field.type ?? "—"}</td>
                      <td class="required">
                        {#if field.required}
                          <CheckmarkIcon />
                        {/if}
                      </td>
                      <td>
                        <button
                          class="edit"
                          aria-label="Edit"
                          on:click={() => editCustomField(field)}>
                          <PencilIcon />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                    {#if currentlyEditedField === field.id}
                      <tr class="edit-custom-field">
                        <td colspan="5">
                          <div class="header">
                            <h3>Edit field</h3>
                            <button
                              class="delete"
                              aria-label="Delete"
                              on:click={() => removeCustomField(field)}>
                              <TrashIcon />
                              <span>Delete</span>
                            </button>
                          </div>
                          <div class="input-field">
                            <label>
                              <div>Title *</div>
                              <input
                                type="text"
                                aria-label="Title"
                                bind:value={editableCustomField.title} />
                            </label>
                          </div>
                          <div class="input-field">
                            <label>
                              <div>Description</div>
                              <input
                                type="text"
                                aria-label="Description"
                                bind:value={editableCustomField.description} />
                            </label>
                          </div>
                          <div class="input-field">
                            <label class="select">
                              <div>Type *</div>
                              <select
                                bind:value={editableCustomField.type}
                                aria-label="Input Type">
                                <option value="text">Text</option>
                                <option value="checkbox">Checkbox</option>
                              </select>
                            </label>
                          </div>
                          <div class="input-field">
                            <label class="checkbox">
                              <input
                                type="checkbox"
                                aria-label="Required field?"
                                bind:checked={editableCustomField.required} />
                              <span>Required</span>
                            </label>
                          </div>
                          <div class="footer">
                            <button
                              class="cancel"
                              on:click={() => {
                                currentlyEditedField = null;
                                editableCustomField = { ...emptyCustomField };
                              }}>
                              <span>Cancel</span>
                            </button>

                            <button
                              class="save"
                              disabled={editableCustomField.title?.length ===
                                0 || !editableCustomField.type}
                              on:click={() => {
                                currentlyEditedField = null;
                                field = { ...editableCustomField };
                                editableCustomField = { ...emptyCustomField };
                              }}>
                              <span>Save changes</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
              <div class="add-custom-field">
                {#if !isAddingCustomField}
                  <button
                    aria-label="Add a custom field"
                    on:click={() => (isAddingCustomField = true)}>
                    <PlusIcon />
                    <span>Add a custom field</span>
                  </button>
                {:else}
                  <div class="edit-custom-field">
                    <div class="header">
                      <h3>Add a custom field</h3>
                    </div>
                    <div class="input-field">
                      <label>
                        <div>Title</div>
                        <input
                          type="text"
                          aria-label="Title"
                          bind:value={newCustomField.title} />
                      </label>
                    </div>
                    <div class="input-field">
                      <label>
                        <div>Description</div>
                        <input
                          type="text"
                          aria-label="Description"
                          bind:value={newCustomField.description} />
                      </label>
                    </div>
                    <div class="input-field">
                      <label class="select">
                        <div>Type</div>
                        <select
                          bind:value={newCustomField.type}
                          aria-label="Input Type">
                          <option value="text">Text</option>
                          <option value="checkbox">Checkbox</option>
                        </select>
                      </label>
                    </div>
                    <div class="input-field">
                      <label class="checkbox">
                        <input
                          type="checkbox"
                          aria-label="Required Field?"
                          bind:checked={newCustomField.required} />
                        <span>Required</span>
                      </label>
                    </div>
                    <div class="footer">
                      <button
                        class="cancel"
                        on:click={() => {
                          newCustomField = { ...emptyCustomField };
                          isAddingCustomField = false;
                        }}>
                        <span>Cancel</span>
                      </button>
                      <button
                        class="save"
                        disabled={newCustomField.title?.length === 0 ||
                          !newCustomField.type}
                        on:click={() => addNewField()}>
                        <span>Add field</span>
                      </button>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
          <footer slot="footer">
            <button on:click={saveProperties}>Save Editor Options</button>
          </footer>
        </nylas-schedule-editor-section>
      {/if}

      {#if _this.sections[SectionNames.NOTIFICATION_DETAILS].editable}
        <nylas-schedule-editor-section
          section_title={SectionNames.NOTIFICATION_DETAILS}
          expanded={_this.sections[SectionNames.NOTIFICATION_DETAILS].expanded}>
          <h1 slot="title">Notification Details</h1>
          <div slot="contents" class="contents">
            <div role="radiogroup" aria-labelledby="notification_mode">
              <strong id="notification_mode"
                >How would you like to notify the customer on event creation?</strong>
              <label>
                <input
                  type="radio"
                  name="notification_mode"
                  value={NotificationMode.SHOW_MESSAGE}
                  bind:group={_this.notification_mode} />
                <span>Show Message on UI</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="notification_mode"
                  value={NotificationMode.SEND_MESSAGE}
                  bind:group={_this.notification_mode} />
                <span>Send message via email</span>
              </label>
            </div>
            <label>
              <strong>Notification message</strong>
              <input type="text" bind:value={_this.notification_message} />
            </label>
            <label>
              <strong>Notification Subject</strong>
              <input type="text" bind:value={_this.notification_subject} />
            </label>
          </div>
          <footer slot="footer">
            <button on:click={saveProperties}>Save Editor Options</button>
          </footer>
        </nylas-schedule-editor-section>
      {/if}
    </div>
    {#if showPreview}
      <span class="gutter" on:mousedown={() => (adjustingPreviewPane = true)} />
      <aside id="preview">
        <h1>Preview</h1>
        <nylas-availability
          {..._this}
          {..._this.events[0]}
          capacity={null}
          on:timeSlotChosen={(event) => {
            slots_to_book = event.detail.timeSlots;
          }}
          calendars={!_this.events[0]?.participantEmails
            ? [
                {
                  availability: "busy",
                  timeslots: [],
                },
              ]
            : []}
          {id} />
        <nylas-booking
          {slots_to_book}
          {..._this}
          capacity={null}
          calendars={!_this.events[0]?.participantEmails
            ? [
                {
                  availability: "busy",
                  timeslots: [],
                },
              ]
            : []}
          {id} />
      </aside>
    {/if}

    {#if tablerowRect && tablecellRect.length}
      <nylas-schedule-editor-drag-item-placeholder
        left={dragPlaceholder.left}
        top={dragPlaceholder.top}
        height={tablerowRect.height}
        width={tablerowRect.width}
        visible={!!draggedField}>
        {#each customFieldKeys as key, i}
          <div
            class="drag-preview-cell"
            style="width: {tablecellRect[i].width}px; height: {tablecellRect[i]
              .height}px;">
            {(draggedField && draggedField[key]) || "—"}
          </div>
        {/each}
      </nylas-schedule-editor-drag-item-placeholder>
    {/if}
  </main>
{/if}
