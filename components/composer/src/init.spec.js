/* eslint-disable no-console */

describe("Composer Dispatching Events", () => {
  it("passes events up to parent application", () => {
    cy.visit("/components/composer/src/index.html");
    cy.get("nylas-composer").should("exist");
    const eventsFired = {
      minimized: false,
      maximized: false,
      opened: false,
      closed: false,
    };
    cy.document().then((document) => {
      document
        .getElementsByTagName("nylas-composer")[0]
        .addEventListener("composerMinimized", () => {
          eventsFired.minimized = true;
        });
      document
        .getElementsByTagName("nylas-composer")[0]
        .addEventListener("composerMaximized", () => {
          eventsFired.maximized = true;
        });
      document
        .getElementsByTagName("nylas-composer")[0]
        .addEventListener("composerClosed", () => {
          eventsFired.closed = true;
        });

      cy.get(".nylas-composer header .composer-btn")
        .eq(0)
        .click()
        .then(() => {
          expect(eventsFired.minimized).to.equal(true);
        });

      cy.get(".nylas-composer header .composer-btn")
        .eq(0)
        .click()
        .then(() => {
          expect(eventsFired.maximized).to.equal(true);
        });

      cy.get(".nylas-composer header .composer-btn")
        .eq(1)
        .click()
        .then(() => {
          expect(eventsFired.closed).to.equal(true);
        });
    });
  });
});

describe("Composer html", () => {
  let element;

  beforeEach(() => {
    cy.visit("/components/composer/src/index.html");

    cy.get("nylas-composer").should("exist").as("composer");
    cy.get("@composer").then(([el]) => {
      element = el;
      el.change = (msg) => console.log("message changed", msg);

      el.from = [
        { id: 1, email: "Tia30@hotmail.com" },
        { id: 2, email: "Obie_Stokes@hotmail.com" },
        { id: 3, email: "Mikayla.Jaskolski85@gmail.com" },
        { id: 4, email: "Jacquelyn65@hotmail.com" },
        { id: 5, email: "Dee57@hotmail.com" },
      ];

      el.to = (term) => {
        return fetch(`https://jsonplaceholder.typicode.com/users`)
          .then((res) => res.json())
          .then((res) => {
            return res
              .map((item) => ({ name: item.name, email: item.email }))
              .filter((item) =>
                item.name.toLowerCase().includes(term.toLowerCase()),
              );
          })
          .catch((_err) => Promise.resolve([]));
      };

      el.value = {
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

      el.show_header = true;
      el.show_subject = true;
      el.mode = "inline"; // or inline
      el.theme = "light";
      el.show_editor_toolbar = true;

      el.send = async (data) => {
        console.log("sending (el.send)", data);
        return new Promise((resolve, _reject) => {
          setTimeout(() => {
            return resolve({ success: true });
          }, 250);
        });
      };

      el.beforeSend = (message) => {
        console.log(`Message before sending`, message);
      };
      el.afterSendSuccess = (response) => {
        console.log(`Response afterSend success`, response);
      };
      el.afterSendError = (response) => {
        console.log("After send error", response);
      };

      el.beforeFileUpload = (file) => {
        console.log("beforeFileUpload", file);
      };

      el.afterFileUploadSuccess = (response) => {
        console.log(`afterFileUploadSuccess`, response);
      };

      el.afterFileUploadError = (response) => {
        console.log("afterFileUploadError error", response);
      };
    });
  });

  describe("Composer integration", () => {
    it("Composer basic integration", () => {
      cy.intercept("GET", "/users", [
        { name: "Test User", email: "tester@nylas.com" },
        { name: "Secound Test User", email: "tester2@nylas.com" },
      ]).as("getAsyncContacts");
      cy.get("nylas-composer").should("exist").as("composer");
      cy.get("header").should("have.text", "Sample subject  ");
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
      });
      cy.get("input[name=subject]").should("have.value", "Sample subject");
      cy.get("header").contains("Sample subject");
      cy.get(".contact-item button").first().click();

      cy.get("[data-cy=composer-to]")
        .get("[data-cy=contacts-search-field]")
        .first()
        .type("{downarrow}{downarrow}{enter}", {
          force: true,
        });
      cy.get("[data-cy=composer-to]")
        .get("[data-cy=contacts-search-field]")
        .first()
        .type("Seco", { force: true });
      cy.wait("@getAsyncContacts");
      cy.get(".addons button:first").click({ force: true });
      cy.get("[data-cy=composer-to]")
        .get("[data-cy=contacts-search-field]")
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

    it("Shows loader", () => {
      cy.get("div").contains("Loading");
    });
  });

  describe("Composer callbacks and options", () => {
    it("Open/Close composer", () => {
      cy.get("nylas-composer").should("exist").as("composer");
      cy.get("header"); // wait for component to render

      // Close
      cy.get("@composer").then((el) => {
        const component = el[0];
        component.close();
        cy.get("header").should("not.exist");
      });
      // Open
      cy.get("@composer").then((el) => {
        const component = el[0];
        component.open();
        cy.get("header").should("exist");
      });
    });

    it("Calls send callback", () => {
      cy.get("nylas-composer").should("exist").as("composer");
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

    it("Replace to field with array", () => {
      cy.get("nylas-composer").should("exist").as("composer");
      cy.get("header"); // wait for component to render

      // Array
      cy.get("@composer").then((el) => {
        const component = el[0];
        component.to = [{ name: "test", email: "test@test.com" }];
      });
      cy.wait(100);
      cy.get("[data-cy=composer-from]")
        .get("[data-cy=contacts-search-field]")
        .first()
        .click();
      cy.contains("test@test.com");
    });

    it("Replace to field with callback", () => {
      cy.get("nylas-composer").should("exist").as("composer");
      cy.get("header"); // wait for component to render

      // Promise (function)
      cy.get("@composer").then((el) => {
        const component = el[0];
        component.to = () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve([{ name: "async", email: "async@test.com" }]);
            }, 5);
          });
      });
      cy.wait(100);
      cy.get("[data-cy=composer-from]")
        .get("[data-cy=contacts-search-field]")
        .first()
        .click();
      cy.contains("async@test.com");
    });

    it("Has a reactive value prop", () => {
      cy.get("nylas-composer").should("exist").as("composer");
      cy.get("header"); // wait for component to render

      cy.get("@composer").then((el) => {
        const component = el[0];
        component.value = { body: "Test reactive prop" };
        cy.get(".html-editor[contenteditable=true]")
          .invoke("prop", "innerHTML")
          .should("include", "Test reactive prop");
      });
    });
  });

  describe("Composer actions", () => {
    it("Minimize or expand on button click", () => {
      // Collapse (minimize)
      cy.get(".composer-btn")
        .first()
        .click()
        .then(() => {
          cy.get(".send-btn").should("not.exist");
        });
      // Deminimize
      cy.get(".composer-btn")
        .first()
        .click()
        .then(() => {
          cy.get(".send-btn").should("exist");
        });
    });

    it("Close on button click", () => {
      cy.get("header>div>.composer-btn")
        .last()
        .click()
        .then(() => {
          cy.get("header").should("not.exist");
        });
    });

    it("should not send an email if there is no recipient", () => {
      element.value = {
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

      cy.get(".send-btn").contains("Send").should("be.disabled");
      // cy.get(".send-btn.send-later").should("be.disabled");
    });

    it("Hides the file upload button if no ID or custom file upload handler is provided", () => {
      cy.visit("/components/composer/src/index.html");
      cy.get("nylas-composer").then((el) => {
        const component = el[0];
        component.setAttribute("id", "");
        component.setAttribute("uploadFile", "");
        cy.get(".file-upload").should("not.exist");
      });
    });

    it("Shows the file upload button if an ID is provided", () => {
      cy.visit("/components/composer/src/index.html");
      cy.get("nylas-composer").then((el) => {
        const component = el[0];
        component.setAttribute("uploadFile", "");
        cy.get(".file-upload").should("exist");
      });
    });
  });

  describe("Composer customizations", () => {
    it("Hide Composer Elements", () => {
      cy.get("nylas-composer")
        .as("composer")
        .then((el) => {
          // Check after applying options
          cy.get(".html-editor").should("exist");
          const component = el[0];
          component.show_header = false;
          component.show_from = false;
          component.show_to = false;
          component.show_subject = false;
          component.show_editor_toolbar = false;
          cy.get("[data-cy=composer-from]").should("not.exist");
          cy.get("[data-cy=composer-to]").should("not.exist");
          cy.get(".subject").should("not.exist");
          cy.get(".html-editor>.toolbar").should("not.exist");
          cy.get("header").should("not.exist");
        });
    });

    it("Shows CC BCC buttons", () => {
      cy.get("nylas-composer")
        .as("composer")
        .then((el) => {
          const component = el[0];
          component.show_cc_button = true;
          component.show_bcc_button = true;
          cy.get(".addons > button").should("have.length", 2);
        });
    });

    it("Hides CC BCC buttons", () => {
      cy.get("nylas-composer")
        .as("composer")
        .then((el) => {
          const component = el[0];
          component.show_cc_button = false;
          component.show_bcc_button = false;
          cy.get(".addons > button").should("have.length", 0);
        });
    });

    it("Hides CC BCC fields by default", () => {
      cy.get("nylas-composer")
        .as("composer")
        .then((el) => {
          const component = el[0];
          component.show_cc = true;
          component.show_bcc = true;
          cy.get("main > nylas-contacts-search").should("have.length", 0);
        });
    });

    it("Shows CC BCC fields", () => {
      cy.get("nylas-composer")
        .as("composer")
        .then((el) => {
          const component = el[0];
          component.show_cc = true;
          component.show_bcc = true;
          cy.get("main > div.cc-container > nylas-contacts-search").should(
            "have.length",
            2,
          );
        });
    });

    it("Hide whole composer", () => {
      cy.get("nylas-composer")
        .as("composer")
        .then((el) => {
          const component = el[0];
          component.close();
          // Check after applying options
          cy.get(".nylas-composer").should("not.exist");
        });
    });

    it("Replaces merge fields as defined in replace_fields when passed as a strinigfied version", () => {
      element.value = {
        body: `[hi] what up!<br />
      <br />
      <br />
      Thanks,
      -Phil`,
      };
      cy.get("nylas-composer")
        .as("composer")
        .then((el) => {
          const component = el[0];
          component.setAttribute(
            "replace_fields",
            '[{"from": "[hi]", "to": "Hello"}]',
          );
          cy.get(".html-editor[contenteditable=true]")
            .invoke("prop", "innerHTML")
            .then((html) => {
              expect(html).to.equal(
                "Hello what up!<br>\n      <br>\n      <br>\n      Thanks,\n      -Phil",
              );
            });
        });
    });

    it("Replaces merge fields as defined in replace_fields when passed a prop", () => {
      element.value = {
        body: `[hi] what up!<br />
      <br />
      <br />
      Thanks,
      -Phil`,
      };
      cy.get("nylas-composer")
        .as("composer")
        .then((el) => {
          const component = el[0];
          component.replace_fields = [{ from: "[hi]", to: "Hello" }];
          cy.get(".html-editor[contenteditable=true]")
            .invoke("prop", "innerHTML")
            .then((html) => {
              expect(html).to.include(
                "Hello what up!<br>\n      <br>\n      <br>\n      Thanks,\n      -Phil",
              );
            });
        });
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
