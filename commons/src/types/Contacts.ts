import type { CommonQuery, WebPage } from "@commons/types/Nylas";

export interface Contact {
  account_id: string;
  birthday: string | null;
  company_name: string | null;
  emails: ContactEmail[];
  given_name: string | null;
  id: string;
  source: string | null;
  im_addresses: ContactImAddress[];
  job_title: string | null;
  manager_name: string | null;
  middle_name: string | null;
  nickname: string | null;
  notes: string | null;
  object: string;
  office_location: string | null;
  phone_numbers: ContactPhoneNumber[];
  physical_addresses: [];
  picture_url: string | null;
  suffix: string | null;
  surname: string | null;
  web_pages: WebPage[];
  groups: ContactGroup[];
}

export interface HydratedContact extends Contact {
  selected?: boolean;
  last_contacted_date?: number;
  time_ago?: string;
  picture?: string;
  default_picture?: string;
}

export interface ContactGroup {
  id: string;
  object: string;
  account_id: string;
  name: string;
  path: string;
}

export interface ContactEmail {
  email: string;
  type: string | null;
}

export interface ContactImAddress {
  im_address: string;
  type: string;
}

export interface ContactPhoneNumber {
  number: string;
  type: string;
}

export interface ContactsQuery extends CommonQuery {}

export interface ContactSearchQuery extends CommonQuery {
  query: string;
}

export interface StoredContacts {
  queryKey: string;
  data: Contact[];
}
