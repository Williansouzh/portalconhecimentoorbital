let activeInput: HTMLInputElement | null = null;

export function registerSearchInput(el: HTMLInputElement | null) {
  activeInput = el;
}

export function focusSearchInput() {
  activeInput?.focus();
}
