import { fireEvent, render } from "@testing-library/svelte";
import * as connections from "../../commons/src/";
import { CalendarStore } from "../../commons/src/store/calendars";
import { EventStore } from "../../commons/src/store/events";
import { ManifestStore } from "../../commons/src/store/manifest";
import Agenda from "../../components/agenda/src/Agenda.svelte";
import { mockAgendaCalendar } from "../mocks/MockCalendars";
import { mockEvents } from "../mocks/MockEvents";
import { mockAgendaManifest } from "../mocks/MockManifests";

jest.mock("../../commons/src/connections/manifest", () => ({
  ...jest.requireActual("../../commons/src/connections/manifest"),
  fetchManifest: jest.fn(),
}));
import { fetchManifest } from "../../commons/src/connections/manifest";

describe("Agenda Props", () => {
  beforeEach(() => {
    jest
      .spyOn(connections, "fetchManifest")
      .mockImplementation(
        () => new Promise((resolve) => resolve(mockAgendaManifest)),
      );

    jest
      .spyOn(EventStore, "getEvents")
      .mockImplementation(
        () => new Promise((resolve) => resolve(mockEvents as any[])),
      );

    jest
      .spyOn(CalendarStore, "getCalendars")
      .mockImplementation(
        () => new Promise((resolve) => resolve(mockAgendaCalendar)),
      );
  });

  afterEach(() => {
    CalendarStore.reset();
    EventStore.reset();
  });
  afterAll(() => jest.restoreAllMocks());

  it("should load an Agenda component with events passed as props", (done) => {
    const { container: agenda } = render(Agenda, {
      events: mockEvents,
    });

    setTimeout(() => {
      expect(agenda.querySelectorAll(".event").length).toBe(mockEvents.length);
      done();
    });
  });

  it("should call a custom function passed in as the click_action", async (done) => {
    const clickHandler = jest.fn((event, calendarEvent) => {
      expect(event).toBeTruthy();
      expect(calendarEvent.id).toBe(mockEvents[0].id);
      done();
    });

    const { getByText } = render(Agenda, {
      events: mockEvents,
      click_action: clickHandler,
    });
    setTimeout(
      async () => await fireEvent.click(getByText(<string>mockEvents[0].title)),
    );
  });

  it("should show the date change arrows only if allow_date_change is set to true", (done) => {
    const { container: agenda, component } = render(Agenda, {
      events: mockEvents,
      allow_date_change: true,
    });
    setTimeout(() => {
      expect(agenda.querySelectorAll(".change-date").length).toBe(2);

      component.allow_date_change = false;
      expect(agenda.querySelectorAll(".change-date").length).toBe(0);
      done();
    });
  });

  it("should change to the next day when the next arrow is clicked", async (done) => {
    const { container: agenda } = render(Agenda, {
      events: mockEvents,
      allow_date_change: true,
    });

    setTimeout(async () => {
      const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));

      // Assume that default is current date
      await fireEvent.click(
        agenda.querySelector(".change-date.next") as Element,
      );

      const nextMonth = (agenda.querySelector("header .month h1") as Element)
        .textContent;
      const nextDay = (agenda.querySelector("header .day") as Element)
        .textContent;
      const nextDate = new Date(`${nextDay} ${nextMonth}`);

      expect(nextDate.toDateString()).toBe(tomorrow.toDateString());
      done();
    });
  });

  it("should change to the previous day when the previous arrow is clicked", async (done) => {
    const { container: agenda } = render(Agenda, {
      events: mockEvents,
      allow_date_change: true,
    });

    setTimeout(async () => {
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

      // Assume that default is current date
      await fireEvent.click(
        agenda.querySelector(".change-date.prev") as Element,
      );

      const prevMonth = (agenda.querySelector("header .month h1") as Element)
        .textContent;
      const prevDay = (agenda.querySelector("header .day") as Element)
        .textContent;
      const prevDate = new Date(`${prevDay} ${prevMonth}`);

      expect(prevDate.toDateString()).toBe(yesterday.toDateString());
      done();
    });
  });

  it("should not allow changing the zoom level if the component is at the max zoom", async (done) => {
    const { container: agenda } = render(Agenda, {
      events: mockEvents,
      prevent_zoom: false,
      auto_time_box: false,
    });

    setTimeout(async () => {
      const zoomableEvent = agenda.querySelector(".event") as Element;
      const initialZoomLevel = zoomableEvent.getAttribute("style");

      // Zooming in shouldn't work, because we are at max zoom by default
      await fireEvent.wheel(zoomableEvent, { deltaY: 5 });
      expect(initialZoomLevel).toBe(zoomableEvent.getAttribute("style"));

      // Zooming out should still work
      await fireEvent.wheel(zoomableEvent, { deltaY: -5 });
      expect(initialZoomLevel).not.toBe(zoomableEvent.getAttribute("style"));
      done();
    });
  });

  it("should change the zoom level when scrolling only if prevent_zoom is false", async (done) => {
    const { container: agenda, component } = render(Agenda, {
      events: mockEvents,
      prevent_zoom: true,
    });

    setTimeout(async () => {
      const zoomableEvent = agenda.querySelector(".event") as Element;
      const initialZoomLevel = zoomableEvent.getAttribute("style");

      await fireEvent.wheel(zoomableEvent, { deltaY: -5 });
      expect(initialZoomLevel).toBe(zoomableEvent.getAttribute("style"));

      component.prevent_zoom = false;

      await fireEvent.wheel(zoomableEvent, { deltaY: -5 });
      expect(initialZoomLevel).not.toBe(zoomableEvent.getAttribute("style"));
      done();
    });
  });

  it("should change the zoom level when scrolling only if condensed_view is false", async (done) => {
    const { container: agenda, component } = render(Agenda, {
      events: mockEvents,
      condensed_view: true,
    });

    setTimeout(async () => {
      const zoomableEvent = agenda.querySelector(".event") as Element;
      const initialZoomLevel = zoomableEvent.getAttribute("style");

      await fireEvent.wheel(zoomableEvent, { deltaY: -5 });
      expect(initialZoomLevel).toBe(zoomableEvent.getAttribute("style"));

      component.condensed_view = false;

      await fireEvent.wheel(zoomableEvent, { deltaY: -5 });
      expect(initialZoomLevel).not.toBe(zoomableEvent.getAttribute("style"));
      done();
    });
  });

  it("should hide the header if header_type is none", (done) => {
    const { container: agenda, component } = render(Agenda, {
      events: mockEvents,
      header_type: "none",
    });

    setTimeout(() => {
      expect(agenda.querySelector(".headless")).toBeTruthy();

      component.header_type = "full";
      expect(agenda.querySelector(".headless")).toBeFalsy();
      done();
    });
  });

  it("should hide the month if header_type is day", (done) => {
    const { container: agenda, component } = render(Agenda, {
      events: mockEvents,
      header_type: "full",
    });

    setTimeout(() => {
      expect(agenda.querySelector("header .month")).toBeTruthy();

      component.header_type = "day";
      expect(agenda.querySelector("header .month")).toBeFalsy();
      done();
    });
  });

  it("should show the current time marker when hide_current_time is false", (done) => {
    const { container: agenda, component } = render(Agenda, {
      events: mockEvents,
      hide_current_time: false,
    });

    setTimeout(async () => {
      expect(agenda.querySelector("span.now")).toBeTruthy();

      component.hide_current_time = true;
      expect(agenda.querySelector("span.now")).toBeFalsy();
      done();
    });
  });
});

describe("Store and web requests", () => {
  let getEventSpy: jest.SpyInstance;
  let getCalendarSpy: jest.SpyInstance;

  beforeEach(() => {
    getEventSpy = jest
      .spyOn(EventStore, "getEvents")
      .mockImplementation(
        () => new Promise((resolve) => resolve(mockEvents as any[])),
      );
    getCalendarSpy = jest
      .spyOn(CalendarStore, "getCalendars")
      .mockImplementation(
        () => new Promise((resolve) => resolve(mockAgendaCalendar)),
      );
  });

  afterEach(() => {
    ManifestStore.set({});
    CalendarStore.reset();
    EventStore.reset();
    jest.resetAllMocks();
  });
  afterAll(() => jest.restoreAllMocks());

  it("should set the theme to the manifest's value if none is provided as a property", async (done) => {
    const mockManifestClone = { ...mockAgendaManifest, theme: "theme-4" };
    (<any>fetchManifest).mockImplementation(
      () => new Promise((resolve) => resolve(mockManifestClone)),
    );

    const { container: agenda } = render(Agenda, {
      id: "mock agenda ID 2",
    });

    setTimeout(() => {
      expect(getEventSpy).toHaveBeenCalled();
      expect(getCalendarSpy).toHaveBeenCalled();
      expect(agenda.querySelector(".theme-4")).toBeTruthy();
      done();
    });
  });

  it("should fetch from the event store if no events are passed in as props", (done) => {
    const mockComponentId = "mock agenda ID";
    const mockManifestKey = JSON.stringify({
      component_id: mockComponentId,
      access_token: "",
    });

    ManifestStore.update(() => ({
      [mockManifestKey]: new Promise((resolve) => resolve(mockAgendaManifest)),
    }));

    const { container: agenda } = render(Agenda, {
      id: mockComponentId,
    });

    setTimeout(() => {
      expect(getEventSpy).toHaveBeenCalled();
      expect(getCalendarSpy).toHaveBeenCalled();
      expect(agenda.querySelectorAll(".event").length).toBe(mockEvents.length);
      done();
    });
  });

  it("should set the current day's events when multiple ", (done) => {
    getEventSpy.mockReset();
    getEventSpy = jest
      .spyOn(EventStore, "getEvents")
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => setTimeout(() => resolve([] as any[]), 10)),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([mockEvents[0]] as any[]), 10),
          ),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([mockEvents[1]] as any[]), 20),
          ),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockEvents as any[]), 5),
          ),
      );

    const mockComponentId = "mock agenda ID";
    const mockManifestKey = JSON.stringify({
      component_id: mockComponentId,
      access_token: "",
    });

    ManifestStore.update(() => ({
      [mockManifestKey]: new Promise((resolve) => resolve(mockAgendaManifest)),
    }));

    const { container: agenda } = render(Agenda, {
      id: mockComponentId,
    });

    setTimeout(async () => {
      await fireEvent.click(
        agenda.querySelector(".change-date.next") as Element,
      );

      await fireEvent.click(
        agenda.querySelector(".change-date.next") as Element,
      );

      setTimeout(() => {
        expect(agenda.querySelectorAll(".event").length).toBe(
          mockEvents.length,
        );
        done();
      }, 200);
    });
  });
});
