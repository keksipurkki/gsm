import { encode } from "../gsm-codec.js";
import { expect } from "chai";

describe("encode", () => {

  it("empty input -> output is empty", () => {
    const output = Array.from(encode());
    expect(output).to.deep.equal([]);
  });

  it("input is a single one-byte Unicode character -> encoding is correct", () => {
    const output = Array.from(encode("£"));
    expect(output).to.deep.equal([0x01]);
  });

  it("input is a supported two-byte Unicode character -> encoding is little-endian", () => {
    const output = Array.from(encode("€"));
    // 0x20AC (euro sign) -> 0x1B65 -> [0x65, 0x1B]
    expect(output).to.deep.equal([0x65, 0x1b]);
  });

  it("input is an unsupported multibyte Unicode character -> encoded as a questionmark", () => {
    const output = Array.from(encode("🙉"));
    expect(output).to.deep.equal([0x3f]);
  });

  it("input is 10 bytes -> encoded with 9 bytes", () => {
    const input = "hellohello";
    const output = Array.from(encode("hellohello"));
    expect(input.length).to.equal(10);
    expect(output.length).to.equal(9);
  });

  it("input is given in hex encoding -> works", () => {
    const expected = [0xe8, 0x32, 0x9b, 0xfd, 0x46, 0x97, 0xd9, 0xec, 0x37];
    const input = Buffer.from("hellohello").toString("hex");
    const output = Array.from(encode(input, "hex"));
    expect(output).to.deep.equal(expected);
  });

  it("input is given in binary encoding -> works", () => {
    const expected = [0xe8, 0x32, 0x9b, 0xfd, 0x46, 0x97, 0xd9, 0xec, 0x37];
    const input = Buffer.from("hellohello").toString("binary");
    const output = Array.from(encode(input, "binary"));
    expect(output).to.deep.equal(expected);
  });

  it("input given asn array of bytes -> works", () => {
    const expected = [0xe8, 0x32, 0x9b, 0xfd, 0x46, 0x97, 0xd9, 0xec, 0x37];
    const input = Array.from(Buffer.from("hellohello"));
    const output = Array.from(encode(input));
    expect(output).to.deep.equal(expected);
  });

  it("input given as uint8 typed array -> works", () => {
    const expected = [0xe8, 0x32, 0x9b, 0xfd, 0x46, 0x97, 0xd9, 0xec, 0x37];
    const bytes = Array.from(Buffer.from("hellohello"));
    const input = Uint8Array.from(bytes);
    const output = Array.from(encode(input));
    expect(output).to.deep.equal(expected);
  });

});
