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
  message,
  type,
}: BuildParticipant): Record<string, Participant[]> {
  let to: Participant[] = [];
  let cc: Participant[] = [];

  switch (type) {
    case "reply":
      to = message.reply_to;
      break;
    case "reply_all":
      to = message.reply_to;
      cc = [...message.cc];
      break;
  }

  return { to, cc };
}
