const globalWindow = typeof window !== "undefined" ? window : undefined;

export function registerWebComponent(): void {
  if (globalWindow) {
    const originalDefine = globalWindow.customElements.define.bind(
      globalWindow.customElements,
    );

    globalWindow.customElements.define = (name: string, ...args) => {
      if (globalWindow.customElements.get(name)) {
        return;
      }
      return originalDefine(name, ...args);
    };
  }
}

registerWebComponent();
