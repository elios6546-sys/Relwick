import { EventType } from "@relwick/shared";
import { enqueue } from "./queue";
import { getCurrentPageViewId } from "./ids";

export function bindFormTracking(form: HTMLFormElement): () => void {
  let started = false;
  const onFocusIn = (e: FocusEvent) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (!form.contains(t)) return;
    if (t.matches("input, textarea, select") && !started) {
      started = true;
      enqueue({
        type: EventType.FORM_START,
        pageViewId: getCurrentPageViewId(),
        ts: Date.now(),
      });
    }
  };

  form.addEventListener("focusin", onFocusIn);
  return () => form.removeEventListener("focusin", onFocusIn);
}

export function trackFormError(fieldName: string): void {
  enqueue({
    type: EventType.FORM_ERROR,
    pageViewId: getCurrentPageViewId(),
    name: fieldName,
    ts: Date.now(),
  });
}

export function trackFormSubmit(leadId: string): void {
  enqueue({
    type: EventType.FORM_SUBMIT,
    pageViewId: getCurrentPageViewId(),
    name: leadId,
    ts: Date.now(),
  });
}
