/**
 * Given an object where key is an id and value is its DOM Element, return a list of DOM Rects
 * @param refs
 * @returns list of DOM Rects
 */
export function getDomRects(refs: Record<string, HTMLElement>): DOMRect[] {
  return Object.values(refs).reduce<DOMRect[]>((allPositions, node) => {
    const domRect = node.getBoundingClientRect();
    return allPositions.concat([domRect]);
  }, []);
}

/**
 * Given a parent node and a selector, return DOMRect for parent and all children targetted by selector
 * @param node
 * @param childSelector
 * @returns parent DOMRect and children DOMRects
 */
export function getDomRectsFromParentAndChildren(
  node: Element,
  childSelector: string,
): { parentRect: DOMRect; childRects: DOMRect[] } {
  const parentRect = node.getBoundingClientRect();
  const childRects = [...node.querySelectorAll(childSelector)].map((child) =>
    child.getBoundingClientRect(),
  );
  return { parentRect, childRects };
}
