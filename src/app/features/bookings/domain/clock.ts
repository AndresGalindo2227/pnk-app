/** Port for the current time, so rules that depend on "now" can be tested with a fixed date. */
export abstract class Clock {
  abstract now(): Date;
}

export class SystemClock extends Clock {
  now(): Date {
    return new Date();
  }
}
