import MockDate from "mockdate";
import fetchMock from "fetch-mock";
import inPercy from "@percy-io/in-percy";
import mockContacts from "../mocks/mock-contacts";
import mockPicture from "../mocks/mock-picture";
import mockAccount from "../mocks/mock-account";
import mockEvents from "../mocks/mock-events";
import mockCalendars from "../mocks/mock-calendars";
import mockManifest from "../mocks/mock-manifest";

if (inPercy()) {
  // Mock our date
  MockDate.set("2021-02-01");

  // Mock our responses
  fetchMock.get(
    /https:\/\/web-components.nylas.com\/middleware\/manifest/,
    mockManifest,
  );
  fetchMock.get(
    /https:\/\/web-components.nylas.com\/middleware\/calendars\/*/,
    mockCalendars,
  );
  fetchMock.get(
    /https:\/\/web-components.nylas.com\/middleware\/agenda\/events*/,
    mockEvents,
  );
  fetchMock.get(
    /https:\/\/web-components.nylas.com\/middleware\/account/,
    mockAccount,
  );
  fetchMock.get(
    /https:\/\/web-components.nylas.com\/middleware\/contacts\/[a-zA-Z0-9]+\/picture/,
    mockPicture,
  );
  fetchMock.get(
    /https:\/\/web-components.nylas.com\/middleware\/contact-list\/contacts*/,
    mockContacts,
  );
}

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};
