import BoldIcon from "../assets/bold.svg";
import ItalicIcon from "../assets/italic.svg";
import UnderlineIcon from "../assets/underline.svg";
import ListIcon from "../assets/list.svg";
import BulletIcon from "../assets/bullet.svg";
import JustifyLeftIcon from "../assets/aligned-left.svg";
import JustifyRightIcon from "../assets/aligned-right.svg";
import JustifyCenterIcon from "../assets/centered.svg";
import JustifyIcon from "../assets/justified.svg";
import LinkIcon from "../assets/link.svg";
import type { ToolbarItem } from "@commons/types/Composer";

const queryCommandState = (command: string): boolean =>
  document.queryCommandState(command);
export const exec = (command: string, value?: string): boolean =>
  document.execCommand(command, false, value);

export const defaultActions: ToolbarItem[] = [
  {
    title: "Bold",
    state: (): boolean => queryCommandState("bold"),
    result: (): boolean => exec("bold"),
    icon: BoldIcon,
  },
  {
    title: "Italic",
    state: (): boolean => queryCommandState("italic"),
    result: (): boolean => exec("italic"),
    icon: ItalicIcon,
  },
  {
    title: "Underline",
    state: (): boolean => queryCommandState("underline"),
    result: (): boolean => exec("underline"),
    icon: UnderlineIcon,
  },
  {
    title: "Justify Left",
    state: (): boolean => queryCommandState("justifyLeft"),
    result: (): boolean => exec("justifyLeft"),
    icon: JustifyLeftIcon,
  },
  {
    title: "Justify Right",
    state: (): boolean => queryCommandState("justifyRight"),
    result: (): boolean => exec("justifyRight"),
    icon: JustifyRightIcon,
  },
  {
    title: "Justify Center",
    state: (): boolean => queryCommandState("justifyCenter"),
    result: (): boolean => exec("justifyCenter"),
    icon: JustifyCenterIcon,
  },
  {
    title: "Justify Full",
    state: (): boolean => queryCommandState("justifyFull"),
    result: (): boolean => exec("justifyFull"),
    icon: JustifyIcon,
  },
  {
    title: "Ordered List",
    result: (): boolean => exec("insertOrderedList"),
    icon: ListIcon,
  },
  {
    title: "Unordered List",
    result: (): boolean => exec("insertUnorderedList"),
    icon: BulletIcon,
  },
  {
    title: "Link",
    result: (): boolean => {
      const url = prompt("Enter a URL:", "http://");
      return exec("createLink", url || "");
    },
    icon: LinkIcon,
  },
];
