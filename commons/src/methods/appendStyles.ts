export default function setShadowStyle(host: any, styleContent: string): void {
  const style = document.createElement("style");
  style.innerHTML = styleContent;
  host.shadowRoot.appendChild(style);
}
