import type { Message, Participant } from "@commons/types/Nylas";

export function isFromMe(myEmail: string, message: Message): boolean {
  if (!myEmail) {
    return false;
  }

  return message.from
    .map((f) => {
      return f.email.toLowerCase();
    })
    .includes(myEmail.toLowerCase());
}

export function participantsWithoutMe(
  myEmail: string,
  message: Message,
): Participant[] {
  const allParticipants = [
    ...message.from,
    ...message.to,
    ...message.cc,
    ...message.bcc,
  ];
  return allParticipants.filter((e) => e.email != myEmail);
}

export function wasCCed(myEmail: string, message: Message): boolean {
  return message.cc.some((e) => e.email === myEmail);
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
      if (isFromMe(myEmail, message)) {
        to = message.to;
      } else {
        to = message.from;
      }
      break;
    case "reply_all":
      if (wasCCed(myEmail, message)) {
        to = participantsWithoutMe(myEmail, message);
      } else {
        to = message.from;
        cc = message.cc;
      }
      break;
  }

  return { to, cc };
}
