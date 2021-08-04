import type { Manifest } from "@commons/types/Nylas";

export function getEventDispatcher(component: {
  dispatchEvent?: (e: Event) => boolean;
}) {
  return (name: string, detail: unknown): void => {
    if (component.dispatchEvent) {
      component.dispatchEvent(
        new CustomEvent(name, {
          detail,
          composed: true, // propagate across the shadow DOM
        }),
      );
    }
  };
}

export function debounce(
  fn: (args: unknown) => unknown,
  time: number,
): () => void {
  let timeoutId: number;
  return (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(fn, time);
  };
}

export function buildInternalProps<T extends Manifest>(
  properties: any,
  manifest: Manifest,
): T {
  return new Proxy(properties, {
    get: (properties, name: keyof Manifest) => {
      if (name in properties) {
        return properties[name];
      } else if (manifest && name in manifest) {
        return manifest[name];
      }
    },
  });
}

export function getPropertyValue<T>(
  propValue: any,
  currentValue: T,
  defaultTo: T,
): T {
  if (propValue) {
    return typeof defaultTo === "boolean"
      ? (parseBoolean(propValue) as any)
      : propValue;
  }

  return currentValue === undefined ? defaultTo : currentValue;
}

export function parseBoolean(
  val: string | boolean | undefined | null,
): boolean {
  return (<any>[true, "true", "1"]).includes(val);
}
