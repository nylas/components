/* eslint-disable no-console */

describe("Composer loading state", () => {
  it("displays loading screen", () => {
    cy.visit("/components/composer/src/cypress.html");

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
      { name: "Test User", email: "tester@test.com" },
      { name: "Secound Test User", email: "tester2@test.com" },
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
      { name: "Test User", email: "tester@test.com" },
      { name: "Secound Test User", email: "tester2@test.com" },
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

    cy.get("[data-cy=contacts-search-field]").first().click().wait(500);

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
      { name: "Test User", email: "tester@test.com" },
      { name: "Secound Test User", email: "tester2@test.com" },
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
            email: "luka.b@test.com",
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

    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "composer/manifest.json",
    }).as("getMiddlewareAccount");

    cy.intercept("GET", "/users", [
      { name: "Test User", email: "tester@test.com" },
      { name: "Secound Test User", email: "tester2@test.com" },
    ]).as("getUsers");

    cy.visit("/components/composer/src/cypress.html");

    cy.get("nylas-composer").should("exist").as("composer");
    cy.wait(["@getMiddlewareManifest", "@getMiddlewareAccount"]);
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
            email: "luka.b@test.com",
          },
        ],
        to: [
          {
            name: "Dan Test",
            email: "dan.r@test.com",
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

  it("Replaces merge fields as defined in replace_fields when passed as a stringified version", () => {
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
    cy.get(".html-editor-content[contenteditable]").should("exist");
    cy.get(".html-editor-content[contenteditable]")
      .invoke("prop", "innerHTML")
      .then((html) => {
        console.log("html:", html);
        expect(html).to.equal(
          `hello what up!<br>\n      <br>\n      <br>\n      Thanks,\n      -Phil`,
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

    cy.get(".html-editor-content[contenteditable]")
      .invoke("prop", "innerHTML")
      .then((html) => {
        expect(html).to.include(
          "hello what up!<br>\n      <br>\n      <br>\n      Thanks,\n      -Phil",
        );
      });
  });

  it("should focus body on load", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.focus_body_onload = true;
    });
    cy.get("@composer")
      .shadow()
      .get(".nylas-composer__loader")
      .should("not.exist");
    cy.get("@composer")
      .shadow()
      .get("nylas-html-editor")
      .shadow()
      .get(".html-editor-content[contenteditable]")
      .should("have.focus", { timeout: 1000 });
  });

  it("should not focus body on load", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.focus_body_onload = false;
    });
    cy.get("@composer")
      .shadow()
      .get("nylas-html-editor")
      .shadow()
      .get(".html-editor-content[contenteditable]")
      .should("not.have.focus");
  });

  it("Hide attachment button", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_attachment_button = false;
    });
    cy.get(".file-upload").should("not.exist");
  });

  it("Hide attachment max file size", () => {
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.show_max_file_size = false;
    });
    cy.get(".file-size").should("not.exist");
  });
});

describe("Composer integration", () => {
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
      { name: "Test User", email: "tester@test.com" },
      { name: "Secound Test User", email: "tester2@test.com" },
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
          email: "luka.b@test.com",
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
            email: "luka.b@test.com",
          },
        ],
        to: [
          {
            name: "Dan Test",
            email: "dan.r@test.com",
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
            email: "luka.b@test.com",
          },
        ],
        to: [
          {
            name: "Dan Test",
            email: "dan.r@test.com",
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
      component.template = `<div><br><br><div style="border-left: 3px solid #dfe1e8; padding-left: 1rem;">Hey what up!<br />
      <br />
      <br />
      Thanks,
      -Phil</div></div>`;
    });

    cy.get(".html-editor-content[contenteditable]")
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

    cy.get(".html-editor-content[contenteditable=true]")
      .invoke("prop", "innerHTML")
      .should("include", "Test value body prop");
  });
});

describe("Composer callbacks and options", () => {
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
      { name: "Test User", email: "tester@test.com" },
      { name: "Secound Test User", email: "tester2@test.com" },
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
            email: "luka.b@test.com",
          },
        ],
        to: [
          {
            name: "Dan Test",
            email: "dan.r@test.com",
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

describe("Composer file upload", () => {
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
      { name: "Test User", email: "tester@test.com" },
      { name: "Secound Test User", email: "tester2@test.com" },
    ]).as("getUsers");

    cy.visit("/components/composer/src/cypress.html");

    cy.get("nylas-composer").should("exist").as("composer");
  });

  it("Successful upload", () => {
    const filePath = "composer/files/tiny_text_file.txt";

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
            email: "luka.b@test.com",
          },
        ],
        to: [
          {
            name: "Dan Test",
            email: "dan.r@test.com",
          },
        ],
      };
      component.send = send;
      component.uploadFile = uploadFile;
    });

    cy.get("input[type=file]").attachFile(filePath);
    cy.get("nylas-composer-attachment")
      .contains("tiny_text_file.txt")
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
            email: "luka.b@test.com",
          },
        ],
        to: [
          {
            name: "Dan Test",
            email: "dan.r@test.com",
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

  //Default maximum size for Nylas api is 4MB
  it("Default maximum file size with Nylas file upload", () => {
    //file size 5.7MB
    const filePath = "composer/files/file_size_5.jpg";

    cy.get("input[type=file]").attachFile(filePath);
    cy.get("nylas-composer-attachment")
      .contains("Maximum file size is 4MB. Please upload a different file.")
      .should("be.visible");
  });

  it("Maximum size set with Nylas file upload", () => {
    //file size 3.4MB
    const filePath = "composer/files/file_size_3.jpg";

    cy.get("@composer").then((el) => {
      const component = el[0];
      component.max_file_size = 3;
    });

    cy.get("input[type=file]").attachFile(filePath);
    cy.get("nylas-composer-attachment")
      .contains("Maximum file size is 3MB. Please upload a different file.")
      .should("be.visible");
  });

  //Default maximum size for custom uploadFile function is disabled
  it("Deafult maximum size is disabled with custom upload function", () => {
    //file size 5.7MB
    const filePath = "composer/files/file_size_5.jpg";

    const uploadFile = (id, _file) => {
      return Promise.resolve({ id });
    };
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.uploadFile = uploadFile;
    });

    cy.get("input[type=file]").attachFile(filePath);
    cy.get("nylas-composer-attachment")
      .contains("file_size_5.jpg")
      .should("be.visible");
  });

  it("Set maximum size with custom upload function", () => {
    //file size 5.7MB
    const filePath = "composer/files/file_size_5.jpg";

    const uploadFile = (id, _file) => {
      return Promise.resolve({ id });
    };
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.uploadFile = uploadFile;
      component.max_file_size = 5;
    });

    cy.get("input[type=file]").attachFile(filePath);
    cy.get("nylas-composer-attachment")
      .contains("Maximum file size is 5MB. Please upload a different file.")
      .should("be.visible");
  });
});

describe("Composer subject", () => {
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
    cy.get("@testComponent")
      .then((element) => {
        element[0].value = { subject: "Test subject" };
      })
      .wait(500);

    cy.get("input[name=subject]").should("have.value", "Test subject");
    cy.get("header span:eq(0)").contains("Test subject").should("be.visible");
  });

  it("Sets default subject if no subject is set", () => {
    cy.get("header span:eq(0)").contains("New Message");
    cy.get("input.subject").invoke("val").should("eq", "New Message");
  });
});

describe("Save composer message as draft", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      { fixture: "composer/manifest.json" },
    ).as("getMiddlewareManifest");

    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "composer/account.json",
    }).as("getMiddlewareAccount");

    cy.visit("/components/composer/src/cypress.html");

    cy.get("nylas-composer").should("exist").as("composer");
  });

  it("Save empty draft messege", () => {
    const save = () => {
      return Promise.resolve({ success: true });
    };
    cy.get("@composer").then((el) => {
      const component = el[0];
      component.value = {
        from: [
          {
            name: "Luka Test",
            email: "luka.b@test.com",
          },
        ],
        to: [
          {
            name: "Dan Test",
            email: "dan.r@test.com",
          },
        ],
      };
      component.save = save;
    });

    cy.get(".save-draft").click();
    cy.get("nylas-composer-alert-bar").should(
      "contain",
      "Message draft saved successfully!",
    );
  });

  it("Successful upload", () => {
    const filePath = "composer/files/tiny_text_file.txt";

    const save = (data) => {
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
            email: "luka.b@test.com",
          },
        ],
        to: [
          {
            name: "Dan Test",
            email: "dan.r@test.com",
          },
        ],
      };
      component.save = save;
      component.uploadFile = uploadFile;
    });

    cy.get("input[type=file]").attachFile(filePath);
    cy.get("nylas-composer-attachment")
      .contains("tiny_text_file.txt")
      .should("be.visible");
    cy.get(".save-draft").click();
    cy.get("nylas-composer-alert-bar").should(
      "contain",
      "Message draft saved successfully!",
    );
  });
});

describe("Composer `value` prop", () => {
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
      { name: "Test User", email: "tester@test.com" },
      { name: "Secound Test User", email: "tester2@test.com" },
    ]).as("getUsers");

    cy.visit("/components/composer/src/cypress.html");

    cy.get("nylas-composer").should("exist").as("composer");
    cy.get("nylas-composer").shadow().get(".nylas-composer").should("exist");
  });

  it("Set value.body", () => {
    cy.wait(["@getMiddlewareManifest", "@getMiddlewareAccount"]);
    cy.get("@composer").then((el) => {
      const composer = el[0];
      composer.value = {
        ...composer.value,
        body: "<b>HTML Body Test</b>",
      };
    });

    cy.get("@composer")
      .shadow()
      .get(".nylas-composer__loader")
      .should("not.exist");
    cy.get("@composer")
      .shadow()
      .get("nylas-html-editor")
      .shadow()
      .get(".html-editor-content[contenteditable]")
      .invoke("prop", "innerHTML")
      .then((html) => {
        expect(html).to.equal(`<b>HTML Body Test</b>`);
      });

    cy.get("@composer").then((el) => {
      const composer = el[0];
      composer.value = {
        ...composer.value,
        body: "<b>Updated HTML Body</b>",
      };
    });

    cy.get("@composer")
      .shadow()
      .get("nylas-html-editor")
      .shadow()
      .get(".html-editor-content[contenteditable]")
      .invoke("prop", "innerHTML")
      .then((html) => {
        expect(html).to.equal(`<b>Updated HTML Body</b>`);
      });
  });

  it("Set value.files", () => {
    cy.wait(["@getMiddlewareManifest", "@getMiddlewareAccount"]);
    const files_one = [
      {
        content_disposition: "attachment",
        content_type: "text/calendar",
        filename: null,
        id: "file-id-1",
        size: 636,
      },
      {
        content_disposition: "attachment",
        content_type: "application/ics",
        filename: "invite.ics",
        id: "file-id-2",
        size: 636,
      },
    ];

    cy.get("@composer").then((el) => {
      const composer = el[0];
      composer.value = {
        ...composer.value,
        files: files_one,
      };
    });
    cy.get("@composer")
      .shadow()
      .get(".nylas-composer__loader")
      .should("not.exist");
    cy.get("@composer")
      .shadow()
      .get(".file-item")
      .then((el) => {
        const fileItem = cy.wrap(el[0]);
        fileItem.contains(files_one[1].filename);
      });

    const files_two = [
      {
        content_disposition: "attachment",
        content_id: "some-content-id@email.mail",
        content_type: "application/pdf",
        filename: "invoice.pdf",
        id: "file-id-3",
        size: 26769,
      },
    ];
    cy.get("@composer").then((el) => {
      const composer = el[0];
      composer.value = {
        ...composer.value,
        files: files_two,
      };
    });
    cy.get("@composer")
      .shadow()
      .get(".file-item")
      .then((el) => {
        const fileItem = cy.wrap(el[0]);
        fileItem.contains(files_two[0].filename);
      });
  });

  it("Set value.files and send with correct file ids", () => {
    const files = [
      {
        content_disposition: "attachment",
        content_type: "text/calendar",
        filename: null,
        id: "file-id-1",
        size: 636,
      },
      {
        content_disposition: "attachment",
        content_type: "application/ics",
        filename: "invite.ics",
        id: "file-id-2",
        size: 636,
      },
    ];

    const send = (data) => {
      expect(data.file_ids).to.have.lengthOf(2);
      expect(data.file_ids).to.contain(files[1].id);
      return Promise.resolve({ success: true });
    };
    const uploadFile = (id, _file) => {
      return Promise.resolve({ id });
    };

    cy.get("@composer").then((el) => {
      const component = el[0];
      component.value = {
        files: files,
        from: [
          {
            name: "Luka Test",
            email: "luka@test.com",
          },
        ],
        to: [
          {
            name: "Dan Test",
            email: "dan@test.com",
          },
        ],
      };
      component.send = send;
      component.uploadFile = uploadFile;
    });
    cy.get("@composer")
      .shadow()
      .get(".nylas-composer__loader")
      .should("not.exist");
    cy.get("@composer").shadow().contains("Send").click();
    cy.get("@composer")
      .shadow()
      .get("nylas-composer-alert-bar")
      .should("contain", "Message sent successfully!");
  });
});
