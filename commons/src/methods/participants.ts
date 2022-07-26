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
  to = message.reply_to.filter((e) => e.email !== myEmail);
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
    const fromEmails = message.from?.map((i) => i.email);
    cc = [...participantsWithoutGivenEmails([...fromEmails, myEmail], message)];
  }

  return { to, cc };
}

export const isValidParticipant = (participant: Participant): boolean => {
  if ("email" in participant && "name" in participant) {
    return true;
  }
  return false;
};

export const cleanParticipants = (contacts: any[]): Participant[] => {
  const participants = contacts.reduce((result: Participant[], contact) => {
    if (isValidParticipant(contact)) {
      // If it is a valid Participant type
      result.push(contact);
    } else {
      // If it is a Contact type, consumed /contacts api
      if ("emails" in contact && contact.emails?.length > 0) {
        result.push({
          name: `${contact.given_name ?? ""} ${contact.surname ?? ""}`,
          email: contact.emails[0].email,
          contact,
        });
      }
    }
    return result;
  }, []);
  return participants;
};
