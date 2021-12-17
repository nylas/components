/* eslint-disable no-console */

describe("Composer loading state", () => {
  it("displays loading screen", () => {
    cy.visit("/components/composer/src/index.html");

    cy.contains("Loading");
  });
});

describe("Composer dispatches events", () => {
  const eventsFired = {
    minimized: false,
    maximized: false,
    opened: false,
    closed: false,
  };

  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      { fixture: "composer/manifest.json" },
    ).as("getMiddlewareManifest");

    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "composer/account.json",
    }).as("getMiddlewareAccount");

    cy.intercept("GET", "/users", [
      { name: "Test User", email: "tester@nylas.com" },
      { name: "Secound Test User", email: "tester2@nylas.com" },
    ]).as("getUsers");

    cy.visit("/components/composer/src/index.html");

    cy.get("nylas-composer")
      .should("exist")
      .as("composer")
      .then((el) => {
        // Set defaults
        const component = el[0];
        component.show_header = true;

        component.addEventListener("composerMinimized", () => {
          eventsFired.minimized = true;
        });
        component.addEventListener("composerMaximized", () => {
          eventsFired.maximized = true;
        });
        component.addEventListener("composerClosed", () => {
          eventsFired.closed = true;
        });
      });
    cy.get("nylas-composer").shadow().get(".nylas-composer").should("exist");
  });

  it("dispatches composerMinimized event", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.minimized = false;
    });

    cy.get("@composer")
      .shadow()
      .contains("Collapse Composer") // see: https://docs.cypress.io/api/commands/contains#Number
      .click()
      .then(() => {
        expect(eventsFired.minimized).to.equal(true);
      });
  });

  it("dispatches composerMaximized event", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.minimized = true;
    });

    cy.get("@composer")
      .shadow()
      .findByRole("button", { name: /Expand composer/i })
      .click()
      .then(() => {
        expect(eventsFired.maximized).to.equal(true);
      });
  });

  it("dispatches composerClosed event", () => {
    cy.get("@composer")
      .shadow()
      .findByRole("button", { name: /Close composer/i })
      .click()
      .then(() => {
        expect(eventsFired.closed).to.equal(true);
      });
  });
});

describe("Composer `to` prop", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      { fixture: "composer/manifest.json" },
    ).as("getMiddlewareManifest");

    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "composer/account.json",
    }).as("getMiddlewareAccount");

    cy.intercept("GET", "/users", [
      { name: "Test User", email: "tester@nylas.com" },
      { name: "Secound Test User", email: "tester2@nylas.com" },
    ]).as("getUsers");

    cy.visit("/components/composer/src/index.html");

    cy.get("nylas-composer").should("exist").as("composer");
    cy.get("nylas-composer").shadow().get(".nylas-composer").should("exist");
  });

  it("Replace to field with array", () => {
    cy.wait(["@getMiddlewareManifest", "@getMiddlewareAccount"]);

    cy.get("@composer")
      .then((el) => {
        const composer = el[0];
        composer.to = [{ name: "test", email: "test@test.com" }];
      })
      .wait(500);

    cy.get("[data-cy=contacts-search-field]").first().click();

    cy.contains("test@test.com");
  });

  it("Replace to field with callback", () => {
    cy.wait(["@getMiddlewareManifest", "@getMiddlewareAccount"]);

    cy.get("@composer")
      .then((el) => {
        const composer = el[0];
        composer.to = () =>
          Promise.resolve([{ name: "async", email: "async@test.com" }]);
      })
      .wait(500);

    cy.get("[data-cy=contacts-search-field]").first().click();

    cy.contains("async@test.com");
  });
});

describe("Composer interactions", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      { fixture: "composer/manifest.json" },
    ).as("getMiddlewareManifest");

    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "composer/account.json",
    }).as("getMiddlewareAccount");

    cy.intercept("GET", "/users", [
      { name: "Test User", email: "tester@nylas.com" },
      { name: "Secound Test User", email: "tester2@nylas.com" },
    ]).as("getUsers");

    cy.visit("/components/composer/src/index.html");

    cy.get("nylas-composer")
      .should("exist")
      .as("composer")
      .then((el) => {
        const component = el[0];
        component.show_header = true;
      });
    cy.get("nylas-composer").shadow().get(".nylas-composer").should("exist");
  });

  it("minimizes composer", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.minimized = false;
    });

    cy.get("@composer")
      .shadow()
      .findByRole("button", { name: /Collapse composer/i })
      .click();
    cy.get("@composer")
      .shadow()
      .findByRole("button", { name: /Send/i })
      .should("not.exist");
  });

  it("expands composer", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.minimized = true;
    });

    cy.get("@composer")
      .shadow()
      .findByRole("button", { name: /Expand composer/i })
      .click();
    cy.get("@composer")
      .shadow()
      .findByRole("button", { name: /Send/i })
      .should("exist");
  });

  it("closes composer", () => {
    cy.get("@composer")
      .shadow()
      .findByRole("button", { name: /Close composer/i })
      .click();
    cy.get("header").should("not.exist");
  });

  // TODO: We need to figure out why tests are failing in Github Actions
  xit("disables send button when no recipient (to) provided", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.value = {
        from: [
          {
            name: "Luka Test",
            email: "luka.b@nylas.com",
          },
        ],
        to: [],
        subject: "Sample subject",
        body: "Sample Body",
      };
    });

    cy.get("@composer")
      .shadow()
      .findByRole("button", { name: /Send/i })
      .should("be.disabled");
  });

  it("hides file upload button if no ID or custom file upload handler is provided", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.setAttribute("id", "");
      component.setAttribute("uploadFile", "");
    });

    cy.get("@composer")
      .shadow()
      .findByRole("button", { name: /Attach files/i })
      .should("not.exist");
  });

  it("shows the file upload button if an ID is provided", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.setAttribute("uploadFile", "");
    });

    cy.get("@composer").shadow().contains("Attach Files").should("exist");
  });
});

describe("Composer customizations", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      { fixture: "composer/manifest.json" },
    ).as("getMiddlewareManifest");

    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "composer/manifest.json", // We don't want account loaded so from field is empty
    }).as("getMiddlewareAccount");

    cy.intercept("GET", "/users", [
      { name: "Test User", email: "tester@nylas.com" },
      { name: "Secound Test User", email: "tester2@nylas.com" },
    ]).as("getUsers");

    cy.visit("/components/composer/src/index.html");

    cy.get("nylas-composer").should("exist").as("composer");
    cy.get("nylas-composer").shadow().get(".nylas-composer").should("exist");
  });

  it("show header", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_header = true;
    });

    cy.get("header").should("exist");
  });

  it("hide header", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_header = false;
    });

    cy.get("header").should("not.exist");
  });

  it("hide from field", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_from = false;
    });

    cy.get("[data-cy=from-field]").should("not.exist");
  });

  it("show from field", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_from = true;
      component.from = [];
    });

    cy.get("[data-cy=from-field]").should("exist");
  });

  it("hide to field", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_to = false;
    });

    cy.get("[data-cy=to-field]").should("not.exist");
  });

  it("show to field", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_to = true;
    });

    cy.get("[data-cy=to-field]").should("exist");
  });

  it("hide subject", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_subject = false;
    });

    cy.get("@composer")
      .shadow()
      .findByLabelText(/email subject/i)
      .should("not.exist");
  });

  it("show subject", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_subject = true;
    });

    cy.get("@composer")
      .shadow()
      .findByLabelText(/email subject/i)
      .should("exist");
  });

  it("hide edit toolbar", () => {
    cy.get("@composer")
      .find("nylas-html-editor")
      .then((el) => {
        const component = el[0];
        component.show_editor_toolbar = false;
      });
    cy.get(".toolbar").should("not.exist");
  });

  it("show edit toolbar", () => {
    cy.get("@composer")
      .find("nylas-html-editor")
      .then((el) => {
        const component = el[0];
        component.show_editor_toolbar = true;
      });
    cy.get(".toolbar").should("exist");
  });

  it("shows CC button", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_cc_button = true;
      component.show_cc = false;
    });

    cy.get("[data-cy=toggle-cc-field-btn]").should("exist");
  });

  it("hides CC button", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_cc_button = false;
      component.show_cc = true;
    });

    cy.get("[data-cy=toggle-cc-field-btn]").should("be.hidden");
  });

  it("shows BCC button", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_bcc_button = true;
      component.show_bcc = false;
    });

    cy.get("[data-cy=toggle-bcc-field-btn]").should("exist");
  });

  it("hides BCC button", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_bcc_button = false;
      component.show_bcc = true;
    });

    cy.get("[data-cy=toggle-bcc-field-btn]").should("be.hidden");
  });

  it("hides whole composer", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.close();
      // Check after applying options
      cy.get(".nylas-composer").should("not.exist");
    });
  });

  // TODO: We must figure out why this test fails only in Github Actions
  xit("Replaces merge fields as defined in replace_fields when passed as a strinigfied version", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.value = {
        body: `[hi] what up!<br />
      <br />
      <br />
      Thanks,
      -Phil`,
      };
    });

    cy.get("@composer").then((el) => {
      const component = el[0];
      component.setAttribute(
        "replace_fields",
        '[{"from": "[hi]", "to": "hello"}]',
      );
      cy.get(".html-editor[contenteditable=true]")
        .invoke("prop", "innerHTML")
        .then((html) => {
          expect(html).to.equal(
            "hello what up!<br>\n      <br>\n      <br>\n      Thanks,\n      -Phil",
          );
        });
    });
  });

  // TODO: We must figure out why this test fails only in Github Actions
  xit("Replaces merge fields as defined in replace_fields when passed a prop", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.value = {
        body: `[hi] what up!<br />
      <br />
      <br />
      Thanks,
      -Phil`,
      };

      component.replace_fields = [{ from: "[hi]", to: "hello" }];
    });

    cy.get(".html-editor[contenteditable=true]")
      .invoke("prop", "innerHTML")
      .then((html) => {
        expect(html).to.include(
          "hello what up!<br>\n      <br>\n      <br>\n      Thanks,\n      -Phil",
        );
      });
  });
});

// TODO: These tests consistently fail when run via Github Actions.
// We need to investigate why this is happening.
xdescribe("Composer html", () => {
  let element;

  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      { fixture: "composer/manifest.json" },
    ).as("getMiddlewareManifest");

    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "composer/account.json",
    }).as("getMiddlewareAccount");

    cy.intercept("GET", "/users", [
      { name: "Test User", email: "tester@nylas.com" },
      { name: "Secound Test User", email: "tester2@nylas.com" },
    ]).as("getUsers");

    cy.visit("/components/composer/src/index.html");

    cy.get("nylas-composer")
      .should("exist")
      .as("composer")
      .then((el) => {
        element = el[0];
        element.change = (msg) => console.log("message changed", msg);

        element.from = [
          { id: 1, email: "Tia30@hotmail.com" },
          { id: 2, email: "Obie_Stokes@hotmail.com" },
          { id: 3, email: "Mikayla.Jaskolski85@gmail.com" },
          { id: 4, email: "Jacquelyn65@hotmail.com" },
          { id: 5, email: "Dee57@hotmail.com" },
        ];

        element.to = (term) => {
          return fetch(`https://jsonplaceholder.typicode.com/users`)
            .then((res) => res.json())
            .then((res) => {
              return res.filter((item) =>
                item.name.toLowerCase().includes(term.toLowerCase()),
              );
            })
            .catch((_err) => Promise.resolve([]));
        };

        element.value = {
          from: [
            {
              name: "Luka Test",
              email: "luka.b@nylas.com",
            },
          ],
          to: [
            {
              name: "Dan Test",
              email: "dan.r@nylas.com",
            },
          ],
          subject: "Sample subject",
          body: "Sample Body",
        };

        element.show_header = true;
        element.show_subject = true;
        element.mode = "inline"; // or inline
        element.theme = "dark";
        element.show_editor_toolbar = true;

        element.send = async (data) => {
          console.log("sending (element.send)", data);
          return new Promise((resolve, _reject) => {
            setTimeout(() => {
              return resolve({ success: true });
            }, 250);
          });
        };

        element.beforeSend = (message) => {
          console.log(`Message before sending`, message);
        };
        element.afterSendSuccess = (response) => {
          console.log(`Response afterSend success`, response);
        };
        element.afterSendError = (response) => {
          console.log("After send error", response);
        };

        element.beforeFileUpload = (file) => {
          console.log("beforeFileUpload", file);
        };

        element.afterFileUploadSuccess = (response) => {
          console.log(`afterFileUploadSuccess`, response);
        };

        element.afterFileUploadError = (response) => {
          console.log("afterFileUploadError error", response);
        };
      });
    cy.get("nylas-composer").shadow().get(".nylas-composer").should("exist");
  });

  describe("Composer integration", () => {
    beforeEach(() => {
      cy.wait(["@getMiddlewareManifest", "@getMiddlewareAccount"]);
    });

    it("Composer basic integration", () => {
      cy.get("header").contains("Sample subject");

      element.value = {
        from: [
          {
            name: "Luka Test",
            email: "luka.b@nylas.com",
          },
        ],
        to: [
          {
            name: "Dan Test",
            email: "dan.r@nylas.com",
          },
        ],
        subject: "Sample subject",
        body: "Sample Body",
      };

      element.send = async (_data) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            return reject({ success: false });
          }, 25);
        });
      };

      cy.get("input[name=subject]").should("have.value", "Sample subject");
      cy.get("header").contains("Sample subject");
      cy.get(".contact-item button").first().click();

      cy.get("[data-cy=contacts-search-field]")
        .first()
        .type("{downarrow}{downarrow}{enter}", {
          force: true,
        });
      cy.get("[data-cy=contacts-search-field]")
        .first()
        .type("Seco", { force: true });

      cy.wait("@getUsers");

      cy.get(".addons button:first").click({ force: true });
      cy.get("[data-cy=contacts-search-field]")
        .first()
        .type("tester@nylas.com{enter}", { force: true });
      cy.get(".addons button:first").click({ force: true });
      cy.get(".html-editor[contenteditable=true]")
        .click({ force: true })
        .type("{selectall}", { force: true });

      cy.get(".send-btn").contains("Send").click();
      cy.get("nylas-composer-alert-bar")
        .should("exist")
        .contains("Failed to send the message");
    });

    it("shows template", () => {
      element.value = { body: "" };
      element.template = `Hey what up!<br />
      <br />
      <br />
      Thanks,
      -Phil`;
      cy.get("nylas-composer")
        .as("composer")
        .then(() => {
          cy.get(".html-editor[contenteditable=true]")
            .invoke("prop", "innerHTML")
            .then((html) => {
              expect(html).to.include(
                "Hey what up!<br>\n      <br>\n      <br>\n      Thanks,\n      -Phil",
              );
            });
        });
    });
  });

  describe("Composer callbacks and options", () => {
    beforeEach(() => {
      cy.wait(["@getMiddlewareManifest", "@getMiddlewareAccount"]);
    });

    it("Open/Close composer", () => {
      cy.get("@composer").then((el) => {
        const component = el[0];
        component.open();
        cy.get("header").should("exist");
      });
    });

    it("Calls send callback", () => {
      cy.get("header"); // wait for component to render

      // NOTE: Cannot be spied because it's called in shadow dom
      const sendCallback = () => {
        return Promise.resolve({});
      };
      cy.get("@composer").then((el) => {
        const component = el[0];
        component.send = sendCallback;
      });
      cy.get(".send-btn").contains("Send").click();
      cy.contains("Message sent successfully");
    });

    it("Has a reactive value prop", () => {
      cy.get("header"); // wait for component to render

      element.value = { body: "Test reactive prop" };

      cy.get(".html-editor[contenteditable=true]")
        .invoke("prop", "innerHTML")
        .should("include", "Test reactive prop");
    });
  });

  describe("File upload", () => {
    it("Successful upload", () => {
      cy.get("nylas-composer").should("exist").as("composer");
      cy.get("header"); // wait for component to render

      const filePath = "example.json";

      const send = async (data) => {
        return new Promise((resolve, _reject) => {
          setTimeout(() => {
            expect(data.file_ids).to.have.lengthOf(1);
            return resolve({ success: true });
          }, 25);
        });
      };
      const uploadFile = async (id, _file) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            return resolve({ id });
          }, 25);
        });
      };
      cy.get("@composer").then((el) => {
        const component = el[0];
        component.send = send;
        // component.beforeSend = beforeSend;
        component.uploadFile = uploadFile;
      });
      cy.get("input[type=file]").attachFile(filePath);
      cy.get(".send-btn").contains("Send").click();
      cy.get("nylas-composer-alert-bar")
        .should("exist")
        .contains("Message sent successfully!");
      cy.get(".file-item .close-btn").click();
    });

    it("Failed upload", () => {
      cy.get("nylas-composer").should("exist").as("composer");
      cy.get("header"); // wait for component to render
      const send = async (_data) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            return reject({ success: false });
          }, 25);
        });
      };
      cy.get("@composer").then((el) => {
        const component = el[0];
        component.send = send;
        // component.beforeSend = beforeSend;
      });
      const filePath = "example.json";
      cy.get("input[type=file]").attachFile(filePath);
      cy.get(".send-btn").contains("Send").click();
      cy.get("nylas-composer-alert-bar")
        .should("exist")
        .contains("Failed to send the message");
    });
  });
});
