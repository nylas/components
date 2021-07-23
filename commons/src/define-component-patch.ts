export const originalDefine = window.customElements.define.bind(
  window.customElements,
);
window.customElements.define = (name: string, ...args) => {
  if (customElements.get(name)) {
    return;
  }
  return originalDefine(name, ...args);
};
