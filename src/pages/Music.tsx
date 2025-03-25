
// In the problematic part of Music.tsx where click() is used on an Element

// Instead of directly using element.click(), check if it's an HTMLElement first
const tabTrigger = document.querySelector('[data-value="player"]');
if (tabTrigger instanceof HTMLElement) {
  tabTrigger.click();
}
