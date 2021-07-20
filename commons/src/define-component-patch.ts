const origDefine = window.customElements.define.bind(window.customElements);
window.customElements.define = (name: string, ...args) => {
  if (customElements.get(name)) {
    return;
  }
  return origDefine(name, ...args);
};
