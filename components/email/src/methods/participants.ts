import type { Message, Participant } from "@commons/types/Nylas";

export function includesMyEmail(
  myEmail: string,
  message: Message,
  field: "to" | "from" | "cc" | "bcc",
): boolean {
  if (!myEmail) {
    return false;
  }

  return message[field].some(
    (e) => e.email.toLowerCase() === myEmail.toLowerCase(),
  );
}

export function participantsWithoutGivenEmails(
  emails: string[],
  message: Message,
): Participant[] {
  const allParticipants = [
    ...message.from,
    ...message.to,
    ...message.cc,
    ...message.bcc,
  ];
  return allParticipants.filter((e) => !emails.includes(e.email));
}

type BuildParticipant = {
  myEmail: string;
  message: Message;
  type: "reply" | "reply_all";
};

export function buildParticipants({
  myEmail,
  message,
  type,
}: BuildParticipant): Record<string, Participant[]> {
  let to: Participant[] = [];
  let cc: Participant[] = [];
  to = message.reply_to;
  // if message does not have 'reply_to':
  // - AND if message from self set 'to' as the default 'to'
  // - else set 'from' as the default 'to'
  if (!to.length) {
    if (includesMyEmail(myEmail, message, "from")) {
      to = message.to;
    } else {
      to = message.from;
    }
  }

  if (type === "reply_all") {
    cc = [...message.cc];
  }

  return { to, cc };
}
