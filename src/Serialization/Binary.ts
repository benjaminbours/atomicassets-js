import bigInt, { BigInteger } from 'big-integer';

import DeserializationError from '../Errors/DeserializationError';
import SerializationError from '../Errors/SerializationError';
import BaseCoder from './Coders/Base';
import SerializationState from './State';

export function varint_encode(input: any): Uint8Array {
  const bytes: number[] = [];
  let n = bigInt(input);

  if (n.lesser(0)) {
    throw new SerializationError('cant pack negative integer');
  }

  while (true) {
    const byte = n.and(0x7f);

    n = n.shiftRight(7);

    if (n.equals(0)) {
      bytes.push(byte.toJSNumber());

      break;
    }

    bytes.push(byte.toJSNumber() + 128);
  }

  return new Uint8Array(bytes);
}

export function varint_decode(state: SerializationState): BigInteger {
  let result: BigInteger = bigInt(0);

  for (let i = 0; true; i++) {
    if (state.position >= state.data.length) {
      throw new DeserializationError('failed to unpack integer');
    }

    const byte = bigInt(state.data[state.position]);
    state.position += 1;

    if (byte.lesser(128)) {
      result = result.plus(byte.shiftLeft(7 * i));

      break;
    }

    result = result.plus(byte.and(0x7f).shiftLeft(7 * i));
  }

  return result;
}

export function integer_sign(input: any, size: number): BigInteger {
  const n = bigInt(input);

  if (n.greaterOrEquals(bigInt(2).pow(8 * size - 1))) {
    throw new Error('cannot sign integer: too big');
  }

  if (n.greaterOrEquals(0)) {
    return n;
  }

  return n
    .negate()
    .xor(
      bigInt(2)
        .pow(8 * size)
        .minus(1),
    )
    .plus(1);
}

export function integer_unsign(input: any, size: number): BigInteger {
  const n = bigInt(input);

  if (n.greater(bigInt(2).pow(8 * size))) {
    throw new Error('cannot unsign integer: too big');
  }

  if (n.greater(bigInt(2).pow(8 * size - 1))) {
    return n
      .minus(1)
      .xor(
        bigInt(2)
          .pow(8 * size)
          .minus(1),
      )
      .negate();
  }

  return n;
}

export function zigzag_encode(input: any): BigInteger {
  const n = bigInt(input);

  if (n.lesser(0)) {
    return n.plus(1).multiply(-2).plus(1);
  }

  return n.multiply(2);
}

export function zigzag_decode(input: any): BigInteger {
  const n = bigInt(input);

  if (n.mod(2).equals(0)) {
    return n.divmod(2).quotient;
  }

  return n.divmod(2).quotient.multiply(-1).minus(1);
}

const bs58 = new BaseCoder(
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
);

export function base58_decode(data: string): Uint8Array {
  return bs58.decode(data);
}

export function base58_encode(data: Uint8Array): string {
  return bs58.encode(data);
}

export function hex_decode(hex: string): Uint8Array {
  const bytes = hex.match(/.{1,2}/g);

  if (!bytes) {
    return new Uint8Array(0);
  }

  return new Uint8Array(bytes.map((byte) => parseInt(byte, 16)));
}

export function hex_encode(bytes: Uint8Array): string {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, '0'),
    '',
  );
}

export function concat_byte_arrays(arr: Uint8Array[]): Uint8Array {
  // concat all bytearrays into one array
  const data = new Uint8Array(arr.reduce((acc, val) => acc + val.length, 0));

  let offset = 0;
  for (const bytes of arr) {
    data.set(bytes, offset);
    offset += bytes.length;
  }

  return data;
}

export function int_to_byte_vector(n: any): Uint8Array {
  const bytes: number[] = [];
  let num = bigInt(n);

  while (num.notEquals(0)) {
    bytes.push(num.and(0xff).toJSNumber());
    num = num.shiftRight(8);
  }

  return new Uint8Array(bytes);
}

export function byte_vector_to_int(bytes: Uint8Array): number {
  let num = bigInt(0);

  for (let i = 0; i < bytes.length; i++) {
    num = num.plus(bigInt(bytes[i]).shiftLeft(8 * i));
  }

  return num.toJSNumber();
}
