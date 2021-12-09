import type { File, Manifest } from "@commons/types/Nylas";

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
  let timeoutId: ReturnType<typeof setTimeout>;
  return (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(fn, time);
  };
}

export function buildInternalProps<T extends Partial<Manifest>>(
  properties: T,
  manifest: T,
  defaultValueMap: T,
): T {
  return new Proxy(properties, {
    get: (target, name: keyof Manifest | "toJSON" | "toString") => {
      if (name === "toString" || name === "toJSON") {
        return () => JSON.stringify(target);
      }

      if (Reflect.get(target, name) !== undefined) {
        return getPropertyValue(
          Reflect.get(target, name),
          defaultValueMap[name],
        );
      }

      if (manifest && name in manifest) {
        return getPropertyValue(manifest[name], defaultValueMap[name]);
      }
      return defaultValueMap[name];
    },

    ownKeys: (target) => {
      const keys = new Set([
        ...Reflect.ownKeys(target),
        ...Object.keys(manifest),
        ...Object.keys(defaultValueMap),
      ]);
      return Array.from(keys);
    },

    getOwnPropertyDescriptor: (target, prop) => {
      let propDescriptor = Reflect.getOwnPropertyDescriptor(target, prop);
      if (!propDescriptor) {
        propDescriptor = (manifest &&
          Object.getOwnPropertyDescriptor(manifest, prop)) ??
          (defaultValueMap &&
            Object.getOwnPropertyDescriptor(defaultValueMap, prop)) ?? {
            configurable: true,
            enumerable: true,
            writable: true,
          };
        Reflect.defineProperty(target, prop, propDescriptor);
      }
      return propDescriptor;
    },
  });
}

export function getPropertyValue<T>(propValue: any, defaultTo: T): T {
  if (propValue) {
    if (typeof defaultTo === "boolean") {
      return parseBoolean(propValue) as any;
    }
    if (typeof defaultTo === "number") {
      return Number(propValue) as any;
    }
    if (defaultTo instanceof Date) {
      return new Date(propValue) as any;
    }
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

export function downloadAttachedFile(fileData: string, file: File): void {
  const buffer = Uint8Array.from(atob(fileData), (c) => c.charCodeAt(0));
  const blob = new Blob([buffer], { type: file.content_type });
  const blobFile = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobFile;
  a.download = file.filename ?? file.id;
  a.target = "_blank";
  a.click();
  a.remove();
}
