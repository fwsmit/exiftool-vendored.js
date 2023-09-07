import { DateTime } from "luxon"
import { first, map, Maybe } from "./Maybe"
import { blank, pad2, pad3, toS } from "./String"

// Reject times whose raw value is "0" or "00". TODO: We may want to reject
// "00:00", but midnight is a valid time--we'd have to reject 00:00 only if we
// could be certain this photo wasn't taken exactly at midnight.
const onlyZerosRE = /^0+$/

/**
 * Encodes an ExifTime (which may not have a timezone offset)
 */
export class ExifTime {
  static fromEXIF(text: string): Maybe<ExifTime> {
    text = toS(text).trim()
    if (blank(text) || onlyZerosRE.test(text)) return
    return first(
      ["HH:mm:ss.uZZ", "HH:mm:ssZZ", "HH:mm:ss.u", "HH:mm:ss"],
      (fmt) =>
        map(DateTime.fromFormat(text, fmt), (dt) => this.fromDateTime(dt, text))
    )
  }

  static fromDateTime(dt: DateTime, rawValue?: string): Maybe<ExifTime> {
    return dt == null || !dt.isValid
      ? undefined
      : new ExifTime(dt.hour, dt.minute, dt.second, dt.millisecond, rawValue)
  }

  constructor(
    readonly hour: number,
    readonly minute: number,
    readonly second: number,
    readonly millisecond?: number,
    readonly rawValue?: string
  ) {}

  get millis() {
    return this.millisecond
  }

  private subsec() {
    return this.millisecond == null || this.millisecond === 0
      ? ""
      : "." + pad3(this.millisecond)
  }

  toString() {
    return pad2(this.hour, this.minute, this.second).join(":") + this.subsec()
  }

  toISOString() {
    return this.toString()
  }

  toExifString() {
    return this.toString()
  }

  toJSON() {
    return {
      _ctor: "ExifTime",
      hour: this.hour,
      minute: this.minute,
      second: this.second,
      millisecond: this.millisecond,
      rawValue: this.rawValue,
    }
  }

  static fromJSON(json: ReturnType<ExifTime["toJSON"]>): ExifTime {
    return new ExifTime(
      json.hour,
      json.minute,
      json.second,
      json.millisecond,
      json.rawValue
    )
  }
}
