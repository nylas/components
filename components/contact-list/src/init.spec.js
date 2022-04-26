const BASE_PATH = Cypress.env("TEST_COVERAGE")
  ? "contact-list/src/cypress.html"
  : "/components/contact-list/src/index.html";

import { defaultPhoto } from "./default_photo.js";

const STATIC_CONTACTS = [
  {
    emails: [{ email: "tom@brightideas.com" }],
    given_name: "Thomas Edison",
  },
  {
    emails: [{ email: "alex@bell.com" }],
    given_name: "Alexander Graham Bell",
  },
  {
    emails: [{ email: "al@particletech.com" }],
    given_name: "Albert Einstein",
  },
];

describe("Contact List initial", () => {
  it("shows loader", () => {
    cy.visit(BASE_PATH);

    cy.get("nylas-contact-list").find(".loader").should("exist");
  });

  it("shows empty state", () => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/contact-list/contacts?offset=0&limit=100",
      {
        response: [],
      },
    );

    cy.visit(BASE_PATH);

    cy.get("nylas-contact-list").contains(
      "Enter contacts using the contacts prop",
    );
  });
});

describe("Contact List display contacts", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      { fixture: "contact-list/manifest.json" },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/contact-list/contacts?offset=0&limit=100",
      { fixture: "contact-list/contacts100.json" },
    ).as("getContacts");

    cy.visit(BASE_PATH);

    cy.get("nylas-contact-list").should("exist").as("contactList");
  });

  it("Loads 100 contacts by default", () => {
    cy.wait("@getContacts");
    cy.get("@contactList").find(".contact").should("have.length", 100);
  });

  // TODO: Feature not implemented yet
  xit("Loads 10 contacts", () => {
    cy.get("@contactList").invoke("prop", "contacts_to_load", 10);
    cy.get("@contactList").find(".contact").should("have.length", 10);
  });

  it("Sorts correctly (alphabetical)", () => {
    cy.wait("@getContacts");

    cy.get(".contact span.title").then(($contacts) => {
      const titles = $contacts.map((index, contact) => contact.innerText);
      expect(titles).to.deep.equal(titles.sort());
    });
  });

  it("Sorts correctly (last emailed)", () => {
    cy.wait("@getContacts");
    cy.get("@contactList").invoke("prop", "sort_by", "last_emailed");

    cy.get(".contact").then(($contacts) => {
      const lastContactedDates = $contacts.map((index, contact) => {
        return contact.getAttribute("data-last-contacted-date");
      });
      expect(lastContactedDates).to.deep.equal(lastContactedDates.sort());
    });
  });
});

describe("Contact List Interaction", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      { fixture: "contact-list/manifest.json" },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/contact-list/contacts?offset=0&limit=100",
      { fixture: "contact-list/contacts100.json" },
    ).as("getContacts");

    cy.visit(BASE_PATH);

    cy.get("nylas-contact-list").should("exist").as("contactList");
  });

  it("selects contact", () => {
    cy.wait("@getContacts");
    cy.get("@contactList").invoke("prop", "click_action", "select");

    cy.get("[data-cy=0]");
    cy.get("@contactList").find(".contact.selected").should("have.length", 0);
    cy.get(".contact:eq(0)").click();

    cy.get("@contactList").find(".contact.selected").should("have.length", 1);
    cy.get(".contact:eq(0)").click();

    cy.get("@contactList").find(".contact.selected").should("have.length", 0);
  });

  it("Emits a contactClicked event", () => {
    let clicked = false;
    cy.get("@contactList").then((el) => {
      const component = el[0];

      component.addEventListener("contactClicked", () => {
        clicked = true;
      });
    });

    cy.wait("@getContacts");

    cy.get(".contact")
      .first()
      .click()
      .then(() => {
        expect(clicked).to.be.true;
      });
  });

  xit("Shows loading overlay and displays 1 or more contacts when user scrolls to the bottom of contact list element", () => {
    cy.get("@contactList")
      .find(".contact")
      .should("have.length.greaterThan", 1);
    cy.get("[data-cy=99]").scrollIntoView();
    cy.get("@contactList").find(".loading").should("exist");
    cy.wait("@one-hundred-more-contacts");
    cy.get("@contactList").find(".loading").should("not.exist");
    cy.get("@contactList").find("[data-cy=199]").should("exist");
    cy.get("@contactList")
      .find(".contact")
      .should("have.length.greaterThan", 1);
  });

  it("Toggles between custom and Nylas data", () => {
    cy.wait("@getContacts");
    cy.get("@contactList").invoke("prop", "contacts", STATIC_CONTACTS);
    cy.get("@contactList").contains("Thomas Edison");

    cy.get("@contactList").invoke("prop", "contacts", null);
    cy.get("@contactList").contains("Adelaide Mack");
  });
});

describe("Contact List props", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      { fixture: "contact-list/manifest.json" },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/contact-list/contacts?offset=0&limit=100",
      { fixture: "contact-list/contacts100.json" },
    ).as("getContacts");

    cy.visit(BASE_PATH);

    cy.get("nylas-contact-list").should("exist").as("contactList");
  });

  it("Hides names when show_names is false", () => {
    cy.get("@contactList").invoke("prop", "show_names", false);
    cy.get("@contactList")
      .contains(".email", "Adelaide Mack")
      .should("not.exist");
  });

  xit("Loads default image passed by user", () => {
    cy.visit("/components/contact-list/src/cypress.html", {
      onBeforeLoad(win) {
        Object.defineProperty(win, "features", {
          writable: false,
          value: {
            args: {
              default_photo: defaultPhoto,
            },
          },
        });
      },
    });
    cy.wait("@getContacts");
    cy.get("@contactList")
      .find("[data-cy=default_set_by_user]")
      .should("exist");
  });

  it("Component shows filter by email option when 'show_filter' is set to true", () => {
    cy.get("@contactList").invoke("prop", "show_filter", true);
    cy.wait("@getContacts");

    cy.get("label.entry.filter").contains("Filter by email: ");
    cy.get("input#show-filter-input").should("exist");
    cy.get("input#show-filter-input").type("ar");
    cy.get("@contactList").find(".contact").should("have.length", 14);
  });

  it("Component loads and works for sort_by=last_emailed when account has email & contact scopes", () => {
    cy.get("@contactList").invoke("prop", "sort_by", "last_emailed");

    cy.get("@contactList").find(".contact").first().contains("Ashlee Ferguson");
    cy.get("@contactList").find(".contact").last().contains("Ariana Peters");
  });
});

describe("Contact List display contacts", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      { fixture: "contact-list/manifest.json" },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/contact-list/contacts?offset=0&limit=100",
      { fixture: "contact-list/contactsWithPicture.json" },
    ).as("getContacts");

    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/contacts/1572prjpqtq8758xo9n0q1wtp/picture",
      { fixture: "contact-list/contactPictureResponse.json" },
    ).as("picture");

    cy.visit(BASE_PATH);

    cy.get("nylas-contact-list").should("exist").as("contactList");
  });

  it("Display contact with fetched image", () => {
    cy.wait("@getContacts");
    cy.wait("@picture");

    cy.get("@contactList")
      .find('img[alt="nylascypresstest@gmail.com"]')
      .should("exist")
      .as("contactImage");
    cy.get("@contactImage")
      .should("have.attr", "src")
      .and("contain", "data:image/jpg");
  });
});

describe("ContactList edge cases", () => {
  beforeEach(() => {
    cy.visit(BASE_PATH);

    cy.get("nylas-contact-list").should("exist").as("contactList");
  });

  it("ContactList component with contact scope (only) should work by default", () => {
    cy.get("@contactList").invoke(
      "prop",
      "id",
      "75f0cbc5-6b15-4bf1-894e-11eeb198cc34",
    );
    cy.get("@contactList").invoke("prop", "sort_by", "name");
    cy.get("@contactList")
      .find(".contact")
      .should("have.length.greaterThan", 1);
  });
});
