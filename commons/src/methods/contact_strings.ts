import type { Participant, Account } from "@commons/types/Nylas";

export function getNameInitials(name: string): string {
  const nameParts = name.split(" ");
  return nameParts
    .map((n, i) => (i === 0 || i === nameParts.length - 1 ? n[0] : ""))
    .join("");
}

export function getContactInitialForAvatar(
  contact: Participant | Partial<Account>,
): string {
  const participant = <Participant>contact;
  const account = <Partial<Account>>contact;

  // if participant type
  if (participant.email) {
    if (participant.name) {
      return getNameInitials(participant.name);
    }
    return participant.email[0];
  }

  // else account type
  // since this is partial, need to check every attr and have a fallback
  if (account.name) {
    return getNameInitials(account.name);
  } else if (account.email_address) {
    return account.email_address[0];
  } else {
    return "?";
  }
}
