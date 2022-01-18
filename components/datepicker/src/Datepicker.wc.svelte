<svelte:options tag="nylas-datepicker" immutable={true} />

<script lang="ts">
  import { tick } from "svelte";
  const months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  export let value: Date = new Date();
  export let min: Date | null;
  export let max: Date | null;
  export let timepicker: boolean = false;
  export let change: Datepicker.ChangeCallback | void;
  let currentDate: Date = new Date();
  let selectedDate: Date = new Date();
  let dates: Datepicker.Dates[] = [];
  let hours: Datepicker.Time[] = [];
  let minutes: Datepicker.Time[] = [];
  let hoursSelect: HTMLSelectElement;
  let minutesSelect: HTMLSelectElement;
  const UNIXDAY: number = 86340000; // 23h 59m
  const populate = () => {
    // Set initial values
    if (value) {
      selectedDate = value;
    }
    if (timepicker) {
      getHours();
      getMinutes();
    }
  };
  // Returns number of days of the month
  const daysInMonth = (
    year: number,
    month: number,
    modifier: number = 1,
  ): number => {
    let d = new Date(year, month + modifier, 0);
    return d.getDate();
  };
  // Changes month
  const changeMonth = (x: number) => {
    currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + x));
    setDays();
  };
  const setDate = (date: Date) => {
    const dateToSelect = new Date(date);
    // if timepicker active set time as well
    if (timepicker) {
      dateToSelect.setHours(parseInt(hoursSelect.value));
      dateToSelect.setMinutes(parseInt(minutesSelect.value));
    }
    selectedDate = new Date(dateToSelect);

    if (min) {
      if (formatDate(min) === formatDate(date)) {
        selectedDate = new Date(min);
      }
    }
    if (max) {
      if (formatDate(max) === formatDate(date)) {
        selectedDate = new Date(max);
      }
    }
    setSelected();
    if (timepicker) {
      setHours();
      setMinutes();
    }
  };
  const setHour = () => {
    selectedDate = new Date(selectedDate.setHours(parseInt(hoursSelect.value)));
    if (min && !max) {
      if (formatDate(min) === formatDate(selectedDate)) {
        selectedDate = new Date(selectedDate.setMinutes(min.getMinutes()));
      }
    } else if (max && !min) {
      if (formatDate(max) === formatDate(selectedDate)) {
        selectedDate = new Date(selectedDate.setMinutes(max.getMinutes()));
      }
    } else if (max && min) {
      if (formatDate(min) === formatDate(selectedDate)) {
        selectedDate = new Date(selectedDate.setMinutes(min.getMinutes()));
      } else if (formatDate(max) === formatDate(selectedDate)) {
        selectedDate = new Date(selectedDate.setMinutes(max.getMinutes()));
      }
    } else {
    }
    setMinutes();
  };
  const setMinute = () => {
    selectedDate = new Date(
      selectedDate.setMinutes(parseInt(minutesSelect.value)),
    );
  };
  const setClock = (hours: number) => {
    selectedDate = new Date(
      selectedDate.setHours(selectedDate.getHours() + hours),
    );
  };
  const formatHours = (x: number): string => {
    x = x > 12 ? x - 12 : x === 0 ? 12 : x;
    return `${x}`.length < 2 ? `0${x}` : `${x}`;
  };
  const getHours = () => {
    const hourList: Datepicker.Time[] = [];
    for (let x = 0; x < 24; x++) {
      hourList.push({
        value: x,
        text: formatHours(x),
        disabled: false,
      });
    }
    hours = hourList;
    setHours();
  };
  const setHours = () =>
    (hours = hours.map((hour: Datepicker.Time) => {
      hour.disabled = false;
      if (min && !max) {
        if (formatDate(min) === formatDate(selectedDate)) {
          hour.disabled = hour.value < min.getHours();
        }
      } else if (max && !min) {
        if (formatDate(max) === formatDate(selectedDate)) {
          hour.disabled = hour.value > max.getHours();
        }
      } else if (max && min) {
        if (formatDate(min) === formatDate(selectedDate)) {
          hour.disabled = hour.value < min.getHours();
        } else if (formatDate(max) === formatDate(selectedDate)) {
          hour.disabled = hour.value > max.getHours();
        }
      }
      return hour;
    }));
  const getMinutes = () => {
    const minuteList: Datepicker.Time[] = [];
    for (let x = 0; x < 60; x++) {
      minuteList.push({
        value: x,
        text: `${x}`.length < 2 ? `0${x}` : `${x}`,
        disabled: false,
      });
    }

    minutes = minuteList;
    setMinutes();
  };
  const setMinutes = () =>
    (minutes = minutes.map((minute: Datepicker.Time) => {
      minute.disabled = false;

      if (min && !max) {
        if (
          formatDate(min) === formatDate(selectedDate) &&
          selectedDate.getHours() === min.getHours()
        ) {
          minute.disabled = minute.value < min.getMinutes();
        }
      } else if (max && !min) {
        if (
          formatDate(max) === formatDate(selectedDate) &&
          selectedDate.getHours() === max.getHours()
        ) {
          minute.disabled = minute.value > max.getMinutes();
        }
      } else if (max && min) {
        if (
          formatDate(min) === formatDate(selectedDate) &&
          selectedDate.getHours() === min.getHours()
        ) {
          minute.disabled = minute.value < min.getMinutes();
        } else if (
          formatDate(max) === formatDate(selectedDate) &&
          selectedDate.getHours() === max.getHours()
        ) {
          minute.disabled = minute.value > max.getMinutes();
        }
      }
      return minute;
    }));
  function formatDate(date: Date): string {
    let month = "" + (date.getMonth() + 1),
      day = "" + date.getDate(),
      year = date.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }
  const setSelected = () =>
    (dates = dates.map((d: Datepicker.Dates) => {
      if (min && !max) {
        d.isDisabled = d.date.getTime() + UNIXDAY < min.getTime();
      }
      if (max && !min) {
        d.isDisabled = d.date.getTime() > max.getTime();
      }
      if (max && min) {
        d.isDisabled =
          d.date.getTime() + UNIXDAY < min.getTime() ||
          d.date.getTime() > max.getTime();
      }
      d.isSelected =
        formatDate(d.date) === formatDate(selectedDate) && !d.isDisabled
          ? true
          : false;
      return d;
    }));
  const setDays = () => {
    dates = [];
    currentDate = new Date(currentDate.setDate(1));
    const lastDay = daysInMonth(
      currentDate.getFullYear(),
      currentDate.getMonth(),
    );
    const lastPrevDay = daysInMonth(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    );
    // Days in previous month
    for (let x = currentDate.getDay(); x > 0; x--) {
      dates = [
        ...dates,
        {
          day: lastPrevDay - x + 1,
          activeMonth: false,
          date: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            lastPrevDay - x + 1,
          ),
        },
      ];
    }
    // Days in current month
    for (let x = 1; x <= lastDay; x++) {
      dates = [
        ...dates,
        {
          day: x,
          activeMonth: true,
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), x),
        },
      ];
    }
    // Days in next month
    const nextDays = 42 - dates.length;
    for (let x = 1; x <= nextDays; x++) {
      dates = [
        ...dates,
        {
          day: x,
          activeMonth: false,
          date: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            x,
          ),
        },
      ];
    }
    // Update Selected date
    setSelected();
  };
  setDays();

  $: if (selectedDate && change) {
    tick().then(() => {
      // @ts-ignore
      change(selectedDate);
    });
  }
  $: currentMonth = currentDate.getMonth();
  $: currentYear = currentDate.getFullYear();
  $: selectableMonth = dates.filter(
    (d) => d.activeMonth && !d.isDisabled,
  ).length;
  $: if (value || min || max || timepicker) {
    populate();

    setSelected();
  }
  $: isAmDisabled = () => {
    if (min) {
      if (formatDate(min) === formatDate(selectedDate)) {
        return min.getHours() >= 12;
      }
      return false;
    }
  };
  $: isPmDisabled = () => {
    if (max) {
      if (formatDate(max) === formatDate(selectedDate)) {
        return max.getHours() < 12;
      }
      return false;
    }
  };
</script>

<style lang="scss">
  //Total width divided by days in a week
  $day-block-width: 100%/7;
  $day-text-selected-color: var(--background);
  $day-background-color: var(--background);
  $day-background-hover-color: var(--primary-dark);
  $day-background-selected-color: var(--primary);

  .nylas-datepicker {
    --font: sans-serif;
    --background: white;
    --text: black;
    --text-light: #6e6e7a;
    --border-radius: 16px;
    --shadow: 0 1px 10px rgba(0, 0, 0, 0.11), 0 3px 36px rgba(0, 0, 0, 0.12);
    --font: sans-serif;
    --font-size: 12px;
    --border: #f7f7f7;
    --primary: #5c77ff;
  }
  .datepicker {
    font-family: var(--font);
    width: 100%;
    font-size: var(--font-size);
    background: var(--background);
    font-family: sans-serif;
    font-size: 14px;
  }
  .datepicker-wrapper {
    padding: 1rem;
  }
  .datepicker-dates {
    display: flex;
    flex-direction: column;
  }
  .label-days {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
  }
  .datepicker-header {
    padding: 10px;
    color: var(--text);
    margin: 0px;
  }
  .datepicker-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
  }
  .datepicker-btn {
    height: 31px;
    width: 31px;
    background: var(--background);
    font-size: 18px;
    cursor: pointer;
    font-weight: 700;
    border-radius: 50px;
    border: none;
    color: var(--text);
  }
  .datepicker-btn:hover {
    background: $day-background-hover-color !important;
    color: var(--button-active-text);
  }
  .datepicker-btn:focus {
    outline: none;
  }
  .label-days > div {
    flex-basis: $day-block-width;
    text-align: center;
  }
  .days {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }
  .label {
    color: var(--text-light);
    font-size: 10px;
  }
  .current {
    font-weight: 700;
  }
  .current-month h3 {
    color: var(--text);
    margin: 0px;
  }
  .selected {
    background: $day-background-selected-color !important;
    color: var(--button-active-text) !important;
    font-weight: 700;
  }
  .days div {
    flex-basis: $day-block-width;
    text-align: center;
    margin-top: 3px;
    box-sizing: border-box;
    margin-bottom: 3px;
  }
  .days div button {
    border-radius: 50px;
    background: $day-background-color;
    color: var(--text);
    width: 30px;
    font-size: 12px;
    font-weight: 500;
    height: 30px;
    padding: 0;
    text-align: center;
    cursor: pointer;
    border: none;
  }
  .days div button:focus {
    outline: 0;
  }
  .days div button:hover {
    background: $day-background-hover-color;
    color: var(--button-active-text) !important;
  }
  .days div button:disabled {
    color: var(--text-light);
    opacity: 0.6;
    cursor: not-allowed;
  }
  .timepicker {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 10px;
  }
  .timepicker div {
    display: flex;
  }
  .timepicker p {
    margin: 0;
    color: var(--text-light);
  }
  .picker {
    border-radius: 4px;
    border: none;
    color: var(--text);
    padding: 5px 0px;
    background: $day-background-color;
    margin: 0px 3px;
    width: 100%;
  }
  .clock {
    border-radius: 4px;
    display: flex;
    width: 75px;
    background: $day-background-color;
    // border: none;
  }
  .time {
    flex: 1;
    // border: none;
  }
  .clock-button {
    border-radius: 4px;
    color: #a4aaad;
    background: none;
    cursor: pointer;
    flex: 1;
    padding: 5px 0px;
    border: none;
    outline: 0;
  }
  .clock-button:disabled {
    cursor: not-allowed;
  }
  .clock-button-active {
    color: #fff;
    background: var(--primary);
  }
  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip .tooltiptext {
    opacity: 0;
    visibility: hidden;
    width: 120px;
    background-color: white;
    color: #000;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    box-shadow: 0 1px 10px rgba(0, 0, 0, 0.11), 0 3px 10px rgba(0, 0, 0, 0.12);
    /* Position the tooltip */
    position: absolute;
    z-index: 1;
    top: 110%;
    left: 50%;
    margin-left: -60px;
    transition: opacity 0.3s;
    transition-delay: 1s;
  }
  .tooltip:hover .tooltiptext {
    opacity: 1;
    visibility: visible;
  }
  .error {
    background: #ffe3e3;
    text-align: center;
    border-radius: 0px 0px 10px 10px;
    padding: 0.7rem;
    color: #ff6060;
  }
</style>

<div>
  <div class="datepicker" id="datepicker">
    <div class="datepicker-wrapper">
      <h2 class="datepicker-header">
        Pick a date
        {timepicker ? " and time" : ""}
      </h2>
      <div class="datepicker-controls">
        <div class="current-month">
          <h3>{months[currentMonth]} {currentYear}</h3>
        </div>
        <div>
          <div class="tooltip">
            <button class="datepicker-btn" on:click={() => changeMonth(-1)}>
              &lsaquo;
            </button>
            <span class="tooltiptext">Previous month</span>
          </div>
          <div class="tooltip">
            <button class="datepicker-btn" on:click={() => changeMonth(1)}>
              &rsaquo;
            </button>
            <span class="tooltiptext">Next month</span>
          </div>
        </div>
      </div>

      <div class="datepicker-dates">
        <div class="label-days">
          <div class="day label">SUN</div>
          <div class="day label">MON</div>
          <div class="day label">TUE</div>
          <div class="day label">WED</div>
          <div class="day label">THU</div>
          <div class="day label">FRI</div>
          <div class="day label">SAT</div>
        </div>

        <div id="calendarDays" class="days">
          {#each dates as date (date)}
            <div>
              <button
                class:label={!date.activeMonth}
                class:current={date.activeMonth}
                class:selected={date.isSelected}
                disabled={date.isDisabled}
                on:click={() => setDate(date.date)}>{date.day}</button
              >
            </div>
          {/each}
        </div>
        {#if timepicker}
          <div class="timepicker">
            <p>Set time</p>
            <div class="time">
              <select
                class="picker"
                value={selectedDate.getHours()}
                bind:this={hoursSelect}
                on:blur={() => setHour()}
              >
                {#each hours as hour (hour)}
                  {#if selectedDate.getHours() >= 12 && hour.value >= 12}
                    <option value={hour.value} disabled={hour.disabled}>
                      {hour.text}
                    </option>
                  {:else if selectedDate.getHours() < 12 && hour.value < 12}
                    <option value={hour.value} disabled={hour.disabled}>
                      {hour.text}
                    </option>
                  {/if}
                {/each}
              </select>
              <select
                class="picker"
                bind:this={minutesSelect}
                on:blur={() => setMinute()}
                value={selectedDate.getMinutes()}
              >
                {#each minutes as minute (minute)}
                  <option value={minute.value} disabled={minute.disabled}>
                    {minute.text}
                  </option>
                {/each}
              </select>
            </div>
            <div class="clock">
              <button
                class={selectedDate.getHours() < 12
                  ? "clock-button clock-button-active"
                  : "clock-button"}
                on:click={() => selectedDate.getHours() >= 12 && setClock(-12)}
                disabled={isAmDisabled()}>AM</button
              >
              <button
                class={selectedDate.getHours() >= 12
                  ? "clock-button clock-button-active"
                  : "clock-button"}
                on:click={() => selectedDate.getHours() < 12 && setClock(12)}
                disabled={isPmDisabled()}>PM</button
              >
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
