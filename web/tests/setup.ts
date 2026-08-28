import "@testing-library/jest-dom/vitest";

// jsdom renders <dialog> but does not implement the modal API.
// https://github.com/jsdom/jsdom/issues/3294
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    this.setAttribute("open", "");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      document.removeEventListener("keydown", onKeyDown);
      this.close();
    };

    document.addEventListener("keydown", onKeyDown);
  };

  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close", { bubbles: true }));
  };
}
