export type FeedbackType =
  | "click"
  | "copy"
  | "success"
  | "heart"
  | "star"
  | "tick"
  | "tabSwitch"
  | "select"
  | "toggleOn"
  | "toggleOff";

export function useFeedback(_input?: unknown): () => void {
  return () => {};
}
