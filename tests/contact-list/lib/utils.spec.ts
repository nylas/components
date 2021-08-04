import { sortingPredicates } from "../../../components/contact-list/lib/sorting";
import type { HydratedContact } from "@commons/types/Contacts";

const chad: HydratedContact = {
  emails: [
    {
      email: "chad.edwards@nylas.com",
      type: null,
    },
  ],
  given_name: "Chad",
  surname: "Edwards",
  last_contacted_date: 1613690130,
  account_id: "none",
  birthday: null,
  company_name: null,
  id: "string",
  source: null,
  im_addresses: [],
  job_title: null,
  manager_name: null,
  middle_name: null,
  nickname: null,
  notes: null,
  object: "object",
  office_location: null,
  phone_numbers: [],
  physical_addresses: [],
  picture_url: null,
  suffix: null,
  web_pages: [],
  groups: [],
};
const jenifer: HydratedContact = {
  emails: [
    {
      email: "jenifer.v@nylas.com",
      type: null,
    },
  ],
  given_name: "J",
  surname: "Valdivia",
  last_contacted_date: 1611767110,
  account_id: "none",
  birthday: null,
  company_name: null,
  id: "string",
  source: null,
  im_addresses: [],
  job_title: null,
  manager_name: null,
  middle_name: null,
  nickname: null,
  notes: null,
  object: "object",
  office_location: null,
  phone_numbers: [],
  physical_addresses: [],
  picture_url: null,
  suffix: null,
  web_pages: [],
  groups: [],
};
const adam: HydratedContact = {
  emails: [
    {
      email: "adam.maes@nylas.com",
      type: null,
    },
  ],
  given_name: "Adam",
  surname: "Maes",
  last_contacted_date: 1614637293,
  account_id: "none",
  birthday: null,
  company_name: null,
  id: "string",
  source: null,
  im_addresses: [],
  job_title: null,
  manager_name: null,
  middle_name: null,
  nickname: null,
  notes: null,
  object: "object",
  office_location: null,
  phone_numbers: [],
  physical_addresses: [],
  picture_url: null,
  suffix: null,
  web_pages: [],
  groups: [],
};

describe("sortingPredicates", () => {
  it("sort_by is last_emailed", () => {
    const sort_by = "last_emailed";

    const unsortedList: HydratedContact[] = [chad, jenifer, adam];
    const sortedList: HydratedContact[] = [adam, chad, jenifer];
    unsortedList.sort(sortingPredicates[sort_by]);
    expect(unsortedList).toEqual(sortedList);
  });

  it("sort_by is name", () => {
    const sort_by = "name";

    const unsortedList: HydratedContact[] = [chad, jenifer, adam];
    const sortedList: HydratedContact[] = [
      adam, // Jan 19 10:24 AM
      chad, // Jan 19 11:14 AM
      jenifer, // Jan 19 11:30 AM
    ];
    unsortedList.sort(sortingPredicates[sort_by]);
    expect(unsortedList).toEqual(sortedList);
  });
});
