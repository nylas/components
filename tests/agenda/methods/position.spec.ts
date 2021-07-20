import { mockEvents } from "../../mocks/MockEvents";
import {
  EventPosition,
  populatePositionMap,
  updateEventPosition,
} from "../../../components/agenda/src/methods/position";

describe("Event positioning", () => {
  it("should correctly populate a position map based on a list of events", () => {
    const expectedPositionMap = {
      abc123: {
        leftNeighbour: null,
        offset: 0,
        overlaps: [mockEvents.find((event) => event.id === "ghi789")],
      },
      def456: {
        leftNeighbour: null,
        offset: 0,
        overlaps: [mockEvents.find((event) => event.id === "ghi789")],
      },
      ghi789: {
        leftNeighbour: null,
        offset: 0,
        overlaps: [
          mockEvents.find((event) => event.id === "abc123"),
          mockEvents.find((event) => event.id === "def456"),
        ],
      },
    };

    const positionMap = {};

    populatePositionMap(<any>mockEvents, positionMap);

    expect(positionMap).toEqual(expectedPositionMap);
  });

  it("should position and size events with no overlaps to take up the full width of the calendar", () => {
    const positionMap = {
      abc123: {
        leftNeighbour: null,
        offset: 0,
        overlaps: [],
      },
    };
    const mockEvent = <any>{
      ...mockEvents.find((event) => event.id === "abc123"),
    };
    updateEventPosition(mockEvent, positionMap);

    expect(mockEvent.relativeOverlapWidth).toBe(1);
    expect(mockEvent.relativeOverlapOffset).toBe(0);
  });

  it("should update the offset of overlapping events based on the event's width", () => {
    const clonedOverlaps = [
      <Events.TimespanEvent>{
        ...mockEvents.find((event) => event.id === "abc123"),
      },
      <Events.TimespanEvent>{
        ...mockEvents.find((event) => event.id === "def456"),
      },
    ];

    const positionMap: Record<string, EventPosition> = {
      abc123: {
        leftNeighbour: null,
        offset: 0,
        overlaps: [
          <Events.TimespanEvent>(
            mockEvents.find((event) => event.id === "ghi789")
          ),
        ],
      },
      def456: {
        leftNeighbour: null,
        offset: 0,
        overlaps: [
          <Events.TimespanEvent>(
            mockEvents.find((event) => event.id === "ghi789")
          ),
        ],
      },
      ghi789: {
        leftNeighbour: null,
        offset: 0,
        overlaps: clonedOverlaps,
      },
    };
    const mockEvent = <any>{
      ...mockEvents.find((event) => event.id === "ghi789"),
    };
    updateEventPosition(mockEvent, positionMap);

    expect(mockEvent.relativeOverlapWidth).toBe(0.3333333333333333);
    for (const event of clonedOverlaps) {
      expect(positionMap[event.id].offset).toBe(0.3333333333333333);
    }
  });

  it("should size the right-most events to take up the remaining width", () => {
    const clonedOverlaps = [
      <Events.TimespanEvent>{
        ...mockEvents.find((event) => event.id === "abc123"),
      },
      <Events.TimespanEvent>{
        ...mockEvents.find((event) => event.id === "def456"),
      },
    ];

    const positionMap: Record<string, EventPosition> = {
      abc123: {
        leftNeighbour: null,
        offset: 0,
        overlaps: [
          <Events.TimespanEvent>(
            mockEvents.find((event) => event.id === "ghi789")
          ),
        ],
      },
      def456: {
        leftNeighbour: null,
        offset: 0,
        overlaps: [
          <Events.TimespanEvent>(
            mockEvents.find((event) => event.id === "ghi789")
          ),
        ],
      },
      ghi789: {
        leftNeighbour: null,
        offset: 0,
        overlaps: clonedOverlaps,
      },
    };
    const mockEvent = <any>{
      ...mockEvents.find((event) => event.id === "ghi789"),
    };
    updateEventPosition(mockEvent, positionMap);

    expect(mockEvent.relativeOverlapWidth).toBe(0.3333333333333333);
    for (const event of clonedOverlaps) {
      updateEventPosition(event, positionMap);
      expect(event.relativeOverlapWidth).toBe(0.6666666666666667);
    }
  });
});
