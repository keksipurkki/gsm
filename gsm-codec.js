import { table } from "./gsm-mapping.js";

/**
 *
 * Yields `l` bits of `memory`, one bit at a time
 *
 */
function* bits(memory, l = 8) {
  for (let i = 0; i < l; i++) {
    yield (memory & (1 << i)) >>> i;
  }
}

/**
 *
 * Yields the bits of any input, one bit at a time
 *
 * @param {Bufferable} input
 *
 */
function* bitStream(input) {
  const buffer = Buffer.from(input);
  for (const byte of buffer) {
    for (const bit of bits(byte)) {
      yield bit;
    }
  }
}

/**
 *
 * Yields GSM 03.38 encoded septets from `input`
 *
 * @param {Bufferable} input
 *
 */
export function* encode(input, encoding = "utf8") {

  let questionmark = "?".charCodeAt(0);
  let septet = 0, unknown = table.encoding[questionmark];

  if (!input) {
    return;
  }

  let byte = 0, i = 0;
  for (const letter of String(Buffer.from(input, encoding))) {

    const codepoint = letter.charCodeAt(0);
    septet = table.encoding[codepoint];
    septet = isNaN(septet) ? unknown : septet;
    const l = septet > 256 ? 14 : 7;
    for (const bit of bits(septet, l)) {
      if (i >= 8) {
        yield byte;
        i = 0;
        byte = 0;
      }
      byte += bit << i++;
    }

  }
  yield byte;
}

/**
 *
 * Emits Unicode codepoints from a buffer of GSM 03.38 encoded septets
 *
 */
export function* decode(input) {
  let septet = 0, i = 0;

  for (const bit of bitStream(input)) {
    if (i >= 7) {
      yield table.decoding[septet];
      septet = 0;
      i = 0;
    }
    septet += bit << i++;
  }
}
