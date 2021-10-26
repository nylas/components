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
  defaultValueMap: Record<string, any>,
): T {
  // console.log("buildInternalProps");
  return new Proxy(properties, {
    // set: () => {
    // },
    get: (properties, name: keyof Manifest | "toJSON" | "toString") => {
      // console.log("getstart", name, properties);
      console.log(Reflect.get(...arguments));
      if (name === "toString" || name === "toJSON") {
        return () => JSON.stringify(properties);
      }

      if (name in properties) {
        // console.log("--- in prop", name, properties[name]);
        return getPropertyValue(properties[name], defaultValueMap[name]);
      }

      if (manifest && name in manifest) {
        // console.log("+++ manifested", manifest[<keyof Manifest>name]);
        return getPropertyValue(
          manifest[<keyof Manifest>name],
          defaultValueMap[name],
        );
      }
      return defaultValueMap[name] ?? null;
    },
  });
}

export function getPropertyValue<T>(propValue: any, defaultTo: T): T {
  if (propValue) {
    return typeof defaultTo === "boolean"
      ? (parseBoolean(propValue) as any)
      : propValue;
  }

  return propValue === undefined ? defaultTo ?? null : propValue;
}

export function parseBoolean(
  val: string | boolean | undefined | null,
): boolean {
  return (<any>[true, "true", "1"]).includes(val);
}

export default function parseStringToArray(parseStr: string) {
  if (!parseStr) {
    return [];
  }

  if (parseStr.includes(",")) {
    return parseStr.split(",").map((s: string) => s.trim());
  }
  if (parseStr.includes(" ")) {
    return parseStr.split(" ").map((s: string) => s.trim());
  }
  if (parseStr.includes("\n")) {
    return parseStr.split("\n").map((s: string) => s.trim());
  }

  return [parseStr.trim()];
}
