// ================ Configuration constants - can be changed ================ //
/** Maximum number of events that can be stacked in the month view */
export const MAX_EVENT_STACK = 3;
/** Height of a single time cell in pixels */
export const CELL_HEIGHT_PX = 96;
/** Vertical padding in pixels subtracted from event block height calculations */
export const EVENT_VERTICAL_PADDING = 8;
/** Duration threshold in minutes below which events switch to a compact layout */
export const COMPACT_EVENT_THRESHOLD_MINUTES = 35;
/** Minimum event duration in minutes required to display the event time */
export const MIN_DURATION_FOR_TIME_DISPLAY = 25;

// ================ Helper constants - should not be changed ================ //
/** Number of minutes in an hour */
export const MINUTES_IN_HOUR = 60;
/** Number of days in a week */
export const DAYS_IN_WEEK = 7;
