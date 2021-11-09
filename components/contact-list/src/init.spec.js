import { defaultPhoto } from "./default_photo.js";

describe("Contact List initial states and thread/contact counts", () => {
  it("Loads 100 contacts by default", () => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html");
    cy.get("nylas-contact-list").should("exist");
    cy.wait("@contacts");
    cy.get("nylas-contact-list")
      .find(".contact")
      .should("have.length.greaterThan", 1);
  });
  xit("Loads 10 contacts", () => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html");
    cy.get("nylas-contact-list").should("exist");
    cy.get("#contacts_to_load").contains("10").click();
    cy.wait("@little-contacts");
    cy.get("nylas-contact-list").find(".contact").should("have.length", 10);
  });
});

describe("Contact List component (Svelte)", () => {
  it("Shows Contact List", () => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html");
    cy.get("nylas-contact-list").should("exist");
    cy.get("nylas-contact-list").find(".loader").should("exist");
    cy.get("nylas-contact-list").invoke("attr", "theme", "arbitrary thinger");
  });

  it("Shows Empty state", () => {
    cy.intercept("/middleware/contact-list/contacts?limit=100&offset=0", {
      response: [],
    });
    cy.visit("/components/contact-list/src/index.html");

    cy.get("nylas-contact-list").then(() => {
      cy.get(".empty-state").contains("Enter contacts using the contacts prop");
    });
  });

  it("Sorts correctly (alphabetical)", () => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html");
    cy.wait("@contacts");

    cy.get("nylas-contact-list").should("exist");
    cy.get(".contact span.title").then(($contacts) => {
      let titles = $contacts.map((index, contact) => contact.innerText);
      expect(titles).to.deep.equal(titles.sort());
    });
  });

  it("Sorts correctly (last emailed)", () => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html");
    cy.wait("@contacts");
    cy.get("nylas-contact-list").should("exist");
    cy.get("nylas-contact-list")
      .find(".contact")
      .should("have.length.greaterThan", 1);
    cy.get("nylas-contact-list").invoke("attr", "sort_by", "last_emailed");

    cy.get(".contact").then(($contacts) => {
      let lastContactedDates = $contacts.map((index, contact) => {
        return contact.getAttribute("data-last-contacted-date");
      });
      expect(lastContactedDates).to.deep.equal(lastContactedDates.sort());
    });
  });

  it("handles selection properly", () => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html");
    cy.wait("@contacts");
    cy.get("nylas-contact-list").should("exist");
    cy.get("nylas-contact-list")
      .find(".contact")
      .should("have.length.greaterThan", 1);
    cy.get("nylas-contact-list").invoke("attr", "click_action", "select");
    cy.get("[data-cy=0]");
    cy.get("nylas-contact-list")
      .find(".contact.selected")
      .should("have.length", 0);
    cy.get(".contact:eq(0)").click();
    cy.get("nylas-contact-list")
      .find(".contact.selected")
      .should("have.length", 1);
    cy.get(".contact:eq(0)").click();
    cy.get("nylas-contact-list")
      .find(".contact.selected")
      .should("have.length", 0);
  });
});

describe("Contact List Interaction", () => {
  xit("Emits a contactClicked event", () => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html");
    cy.get("nylas-contact-list").should("exist");
    cy.wait("@contacts");
    let contactsCurrentlyClicked = 0;
    cy.get("[data-cy=0]");
    cy.document().then((document) => {
      document
        .getElementsByTagName("nylas-contact-list")[0]
        .addEventListener("contactClicked", (event) => {
          expect(event.detail).to.have.ownProperty("event");
          contactsCurrentlyClicked = event.detail.contacts.filter(
            (c) => c.selected,
          ).length;
        });

      cy.get(".contact:eq(0)")
        .click()
        .then(() => {
          expect(contactsCurrentlyClicked).to.equal(1);
        });
      cy.get(".contact:eq(1)")
        .click()
        .then(() => {
          expect(contactsCurrentlyClicked).to.equal(2);
        });
    });
  });

  xit("Shows loading overlay and displays 1 or more contacts when user scrolls to the bottom of contact list element", () => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html");
    cy.wait("@contacts");
    cy.get("nylas-contact-list").should("exist");
    cy.get("nylas-contact-list")
      .find(".contact")
      .should("have.length.greaterThan", 1);
    cy.get("[data-cy=99]").scrollIntoView();
    cy.get("nylas-contact-list").find(".loading").should("exist");
    cy.wait("@one-hundred-more-contacts");
    cy.get("nylas-contact-list").find(".loading").should("not.exist");
    cy.get("nylas-contact-list").find("[data-cy=199]").should("exist");
    cy.get("nylas-contact-list")
      .find(".contact")
      .should("have.length.greaterThan", 1);
  });

  describe("Custom data", () => {
    it("Toggles between custom and Nylas data", () => {
      cy.loadContacts();
      cy.visit("/components/contact-list/src/index.html");
      cy.get("nylas-contact-list").should("exist");
      cy.wait("@contacts").then(() => {
        cy.get("nylas-contact-list")
          .as("contacts")
          .then((element) => {
            const contactlist = element[0];

            // Check to make sure it's using Nylas data (Test user is a signifier)
            cy.get("ul.contacts")
              .find("li.contact .title:contains('Test User')")
              .should("exist");

            cy.loadContacts();
            cy.wait("@contacts").then(() => {
              // Set custom data
              contactlist.contacts = [
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

              // Check to make sure it's using custom data (not Nylas data)
              cy.get("ul.contacts")
                .find("li.contact .title")
                .should("not.contain", "Test User");
              cy.get("ul.contacts")
                .find("li.contact .title:contains('Thomas Edison')")
                .should("exist")
                .then(() => {
                  // Revert custom data
                  contactlist.contacts = null;

                  // Check to make sure it's using Nylas data again
                  cy.get("ul.contacts")
                    .find("li.contact .title")
                    .should("contain", "Test User");
                  cy.get("ul.contacts")
                    .find("li.contact .title")
                    .should("not.contain", "Thomas Edison");
                });
            });
          });
      });
    });
  });
});

describe("Optional Prop Handling", () => {
  // todo: exing it, since html file doesn't have controls
  xit("Hides names when show_names is false", () => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html");
    cy.get("nylas-contact-list").should("exist");
    cy.wait("@contacts");
    cy.get("#show_names").contains("false").click();
    cy.get("nylas-contact-list")
      .find(".contact")
      .should("have.length.greaterThan", 1);
    cy.get(".email").should("not.exist");
  });
  xit("Loads default image passed by user", () => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html", {
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
    cy.wait("@contacts");
    cy.get("nylas-contact-list")
      .find("[data-cy=default_set_by_user]")
      .should("exist");
  });

  it("Component shows filter by email option when 'show_filter' is set to true", () => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html");
    cy.get("nylas-contact-list").should("exist");
    cy.get("nylas-contact-list").then((element) => {
      const component = element[0];
      component.show_filter = true;
    });
    cy.wait("@contacts");
    cy.get("label.entry.filter").contains("Filter by email: ");
    cy.get("input#show-filter-input").should("exist");
    cy.get("input#show-filter-input").type("nylascypresstest");
    cy.get("nylas-contact-list").find(".contact").should("have.length", 2);
  });

  it("Component loads and works for sort_by=last_emailed when account has email & contact scopes", () => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html");
    cy.get("nylas-contact-list").should("exist");
    cy.get("nylas-contact-list").then((element) => {
      const component = element[0];
      component.sort_by = "last_emailed";
    });
    cy.get(".loader").should("not.exist");
    cy.get("nylas-contact-list")
      .find(".contact")
      .should("have.length.greaterThan", 1);
  });
});

describe("ContactList component with contact scope (only) should work by default", () => {
  beforeEach(() => {
    cy.loadContacts();
    cy.visit("/components/contact-list/src/index.html");
    cy.get("nylas-contact-list").should("exist");
    cy.get("nylas-contact-list").then((element) => {
      const component = element[0];
      component.id = "75f0cbc5-6b15-4bf1-894e-11eeb198cc34";
      component.sort_by = "name";
    });
  });

  it("Component loads and works for sort_by=name when account has only contact scope", () => {
    cy.get("nylas-contact-list")
      .find(".contact")
      .should("have.length.greaterThan", 1);
  });
});
