/* eslint-disable no-console */

xdescribe("Composer loading state", () => {
  it("displays loading screen", () => {
    cy.visit("/components/composer/src/cypress.html");

    cy.contains("Loading");
  });
});

xdescribe("Composer dispatches events", () => {
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

    cy.visit("/components/composer/src/cypress.html");

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

xdescribe("Composer `to` prop", () => {
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

    cy.visit("/components/composer/src/cypress.html");

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

xdescribe("Composer interactions", () => {
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

    cy.visit("/components/composer/src/cypress.html");

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

  it("disables send button when no recipient (to) provided", () => {
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
      .findByRole("label", { name: /Attach files/i })
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

    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/account",
    ).as("getMiddlewareAccount");

    cy.intercept("GET", "/users", [
      { name: "Test User", email: "tester@nylas.com" },
      { name: "Secound Test User", email: "tester2@nylas.com" },
    ]).as("getUsers");

    cy.visit("/components/composer/src/cypress.html");

    cy.get("nylas-composer").should("exist").as("composer");
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

  it("from field cannot be changed", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_from = true;
      component.value = {
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
      };
    });

    cy.get("[data-cy=from-field]").contains("Test").should("be.visible");
    cy.get("[data-cy=from-field] .contact-item button").should("not.exist");
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
      // Check after applying options.
      cy.get(".nylas-composer").should("not.exist");
    });
  });

  it("opens composer", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.open();
    });
    cy.get(".nylas-composer").should("exist");
  });

  it("Replaces merge fields as defined in replace_fields when passed as a strinigfied version", () => {
    const value = {
      body: `[hi] what up!<br />
      <br />
      <br />
      Thanks,
      -Phil`,
    };

    cy.get("@composer").invoke("prop", "value", value);
    cy.get("@composer").invoke("prop", "replace_fields", [
      { from: "[hi]", to: "hello" },
    ]);
    cy.get(".html-editor[contenteditable=true]").should("exist");
    cy.get(".html-editor[contenteditable=true]")
      .invoke("prop", "innerHTML")
      .then((html) => {
        expect(html).to.equal(
          "hello what up!<br>\n      <br>\n      <br>\n      Thanks,\n      -Phil",
        );
      });
  });

  it("Replaces merge fields as defined in replace_fields when passed a prop", () => {
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

xdescribe("Composer integration", () => {
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

    cy.visit("/components/composer/src/cypress.html");

    cy.get("nylas-composer").should("exist").as("composer");
  });

  it("Search input populates contact search dropdown", () => {
    cy.get("@composer").then((element) => {
      const component = element[0];
      component.to = [
        {
          name: "Test User",
          email: "luka.b@nylas.com",
        },
      ];
    });

    cy.get("[data-cy=to-field]")
      .find("[data-cy=contacts-search-field]")
      .type("Test", { force: true });

    cy.contains("Test User").should("be.visible");
  });

  it("Displays failed message after failing to send email", () => {
    cy.get("@composer").then((element) => {
      const component = element[0];
      component.value = {
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
      };

      component.send = () => {
        return Promise.reject("some error");
      };
    });

    cy.get(".send-btn").contains("Send").click();
    cy.get("nylas-composer-alert-bar").should(
      "contain",
      "Failed to send the message",
    );
  });

  it("Displays success message after successfully sending email", () => {
    cy.get("@composer").then((element) => {
      const component = element[0];
      component.value = {
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
      };

      component.send = () => {
        return Promise.resolve("success");
      };
    });

    cy.get(".send-btn").contains("Send").click();
    cy.get("nylas-composer-alert-bar").should(
      "contain",
      "Message sent successfully!",
    );
  });

  it("Shows template in email body", () => {
    cy.get("@composer").then((element) => {
      const component = element[0];
      component.template = `Hey what up!<br />
      <br />
      <br />
      Thanks,
      -Phil`;
    });

    cy.get(".html-editor[contenteditable=true]")
      .invoke("prop", "innerHTML")
      .then((html) => {
        expect(html).to.include(
          "Hey what up!<br>\n      <br>\n      <br>\n      Thanks,\n      -Phil",
        );
      });
  });

  it("Shows body via value prop", () => {
    cy.get("@composer").then((element) => {
      const component = element[0];
      component.value = { body: "Test value body prop" };
    });

    cy.get(".html-editor[contenteditable=true]")
      .invoke("prop", "innerHTML")
      .should("include", "Test value body prop");
  });
});

xdescribe("Composer callbacks and options", () => {
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

    cy.visit("/components/composer/src/cypress.html");

    cy.get("nylas-composer").should("exist").as("composer");
  });

  it("Calls send callback", () => {
    let sent = false;
    cy.get("@composer").then((element) => {
      const component = element[0];
      component.value = {
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
      };

      component.send = () => {
        sent = true;
        return Promise.resolve("success");
      };
    });

    cy.get(".send-btn")
      .contains("Send")
      .click()
      .then(() => {
        expect(sent).to.be.true;
      });
  });
});

xdescribe("Composer file upload", () => {
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

    cy.visit("/components/composer/src/cypress.html");

    cy.get("nylas-composer").should("exist").as("composer");
  });

  it("Successful upload", () => {
    const filePath = "example.json";

    const send = (data) => {
      expect(data.file_ids).to.have.lengthOf(1);
      return Promise.resolve({ success: true });
    };
    const uploadFile = (id, _file) => {
      return Promise.resolve({ id });
    };
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.value = {
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
      };
      component.send = send;
      component.uploadFile = uploadFile;
    });

    cy.get("input[type=file]").attachFile(filePath);
    cy.get("nylas-composer-attachment")
      .contains("example.json")
      .should("be.visible");
    cy.get(".send-btn").contains("Send").click();
    cy.get("nylas-composer-alert-bar").should(
      "contain",
      "Message sent successfully!",
    );
  });

  it("Failed upload", () => {
    const send = (_data) => {
      return Promise.reject({ success: false });
    };
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.send = send;
      component.value = {
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
      };
    });
    const filePath = "example.json";
    cy.get("input[type=file]").attachFile(filePath);
    cy.get("nylas-composer-attachment")
      .contains("example.json")
      .should("be.visible");
    cy.get(".send-btn").contains("Send").click();
    cy.get("nylas-composer-alert-bar").should(
      "contain",
      "Failed to send the message",
    );
  });
});

xdescribe("Composer subject", () => {
  beforeEach(() => {
    cy.visitComponentPage(
      "/components/composer/src/index.html",
      "nylas-composer",
      "demo-composer",
    );
    cy.get("@testComponent")
      .should("have.prop", "id")
      .and("equal", "test-composer");
  });

  it("Sets subject", () => {
    cy.get("@testComponent").then((element) => {
      element[0].value = { subject: "Test subject" };
    });

    cy.get("input[name=subject]").should("have.value", "Test subject");
    cy.get("header span:eq(0)").contains("Test subject").should("be.visible");
  });

  it("Sets default subject if no subject is set", () => {
    cy.get("header span:eq(0)").contains("New Message");
    cy.get("input.subject").invoke("val").should("eq", "New Message");
  });
});
