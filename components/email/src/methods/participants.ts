import type { Message, Participant } from "@commons/types/Nylas";

export function includesMyEmail(
  myEmail: string,
  message: Message,
  field: "to" | "from" | "cc" | "bcc",
): boolean {
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

  switch (type) {
    case "reply":
      if (includesMyEmail(myEmail, message, "from")) {
        to = message.to;
      } else {
        to = message.from;
      }
      break;
    case "reply_all":
      if (includesMyEmail(myEmail, message, "cc")) {
        to = participantsWithoutGivenEmails([myEmail], message);
      } else {
        to = message.from;
        const fromEmails = message.from?.map((i) => i.email);
        cc = [
          ...message.cc,
          ...participantsWithoutGivenEmails([...fromEmails, myEmail], message),
        ];
      }
      break;
  }

  return { to, cc };
}
