let idCounter = 0;

export function generateUniqueId(prefix = 'clinic-ui'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('aria-hidden')
  );
}

export function handleModalFocusTrap(e: KeyboardEvent, containerRef: HTMLElement | null): void {
  if (!containerRef || e.key !== 'Tab') return;

  const focusable = getFocusableElements(containerRef);
  if (focusable.length === 0) return;

  const firstElement = focusable[0];
  const lastElement = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
  } else {
    if (document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}
