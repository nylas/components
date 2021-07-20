import type { SvelteComponent } from "svelte";
import Conversation from "../Conversation.svelte";

export default {
  title: "Conversation",
  component: Conversation,
  argTypes: {},
};

const componentID = "conversation-demo";

interface ConversationProps {
  Component: typeof SvelteComponent;
  props: {
    id?: string;
  };
}

export const StaticData = (): ConversationProps => ({
  Component: Conversation,
  props: {
    id: componentID,
  },
});
