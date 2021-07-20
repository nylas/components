<script>
  import "../../";
  export let show_header;
  export let subject;
  export let body;
  export let show_subject;
  export let show_from;
  export let show_to;
  export let theme;
  export let from;
  export let to;
  export let show_editor_toolbar;
  export let show_close_button;
  export let show_minimize_button;
  export let show_cc_button;
  export let show_bcc_button;
  export let show_attachment_button;
  export let visible;
  export let minimized;

  const options = {
    show_header,
    show_subject,
    show_from,
    show_to,
    theme,
    show_editor_toolbar,
    show_close_button,
    show_minimize_button,
    show_cc_button,
    show_bcc_button,
    show_attachment_button,
    visible,
    minimized,
  };

  const value = {
    subject,
    body,
    to: to ? [{ email: to }] : [],
    from: from ? [{ email: from }] : [],
  };

  let searchCallback = async (term) => {
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users`);
      const json = await res.json();
      return json
        .map((item) => ({ name: item.name, email: item.email }))
        .filter((item) => item.name.toLowerCase().includes(term.toLowerCase()));
    } catch (e) {
      return await Promise.resolve([]);
    }
  };
</script>

<nylas-composer {options} {value} from={searchCallback} to={searchCallback} />
