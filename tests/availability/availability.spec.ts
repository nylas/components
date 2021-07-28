import { fireEvent, render } from "@testing-library/svelte";
import * as connections from "../../commons/src/";
import { EventStore } from "../../commons/src/store/events";
import { ManifestStore } from "../../commons/src/store/manifest";
import Availability from "../../components/availability/src/Availability.svelte";
// import { mockAgendaCalendar } from "../mocks/MockCalendars";
// import { mockEvents } from "../mocks/MockEvents";
import { mockAvailabilityManifest } from "../mocks/MockManifests";

jest.mock("../../commons/src/connections/manifest", () => ({
  ...jest.requireActual("../../commons/src/connections/manifest"),
  fetchManifest: jest.fn(),
}));
import { fetchManifest } from "../../commons/src/connections/manifest";
