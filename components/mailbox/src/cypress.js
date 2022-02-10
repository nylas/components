function toggleComposer(event, component) {
  component.removeAttribute("hidden");
  component.value = event.detail.value;
  component.focus_body_onload = event.detail.focus_body_onload;
  if (Object.keys(event.detail.message).length) {
    component.message_with_body = event.detail.message;
  }
  component.open();
}

document.addEventListener("DOMContentLoaded", function () {
  const mailbox = document.querySelector("nylas-mailbox");

  const composer = document.querySelector("nylas-composer");
  composer.show_header = true;
  composer.show_minimize_button = false;
  composer.show_from = false;
  composer.show_bcc = false;
  composer.show_cc = false;
  composer.reset_after_send = true;
  composer.reset_after_close = true;
  composer.close();

  composer.afterSendSuccess = async (data) => {
    composer.close();
    composer.classList.remove("active");
    composer.classList.add("hidden");
  };

  composer.addEventListener("messageSent", (event) => {
    const message = event.detail.message;
    mailbox.sentMessageUpdate(message);
  });

  const events = [
    "replyClicked",
    "replyAllClicked",
    "forwardClicked",
    "draftThreadEvent",
  ];
  events.forEach((eventType) =>
    mailbox.addEventListener(eventType, (e) =>
      toggleComposer(e, composer, eventType),
    ),
  );
});
