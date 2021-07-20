/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const sortingPredicates = {
  last_emailed: (
    contact1: Contacts.HydratedContact,
    contact2: Contacts.HydratedContact,
  ) =>
    (contact2.last_contacted_date || 0) - (contact1.last_contacted_date || 0),
  name: (contact1: Contacts.Contact, contact2: Contacts.Contact) =>
    (contact1.given_name || contact1.emails[0].email).localeCompare(
      contact2.given_name || contact2.emails[0].email,
    ),
};
