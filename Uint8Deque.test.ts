import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { Uint8Deque } from "./Uint8Deque.ts";

Deno.test("BYTES_PER_ELEMENT should return 1", () => {
  assertEquals(Uint8Deque.BYTES_PER_ELEMENT, 1);
});

Deno.test("BYTES_PER_ELEMENT should be read only", () => {
  assertThrows(() => {
    // @ts-ignore: invalid
    Uint8Deque.BYTES_PER_ELEMENT = 2;
  });
});

Deno.test("constructor should allow no argument", () => {
  const dq = new Uint8Deque();
  assertEquals(dq.slice(), new Uint8Array());
});

Deno.test("constructor should allow an Uint8Array as argument", () => {
  const arr = new Uint8Array([1, 2, 3]);
  const dq = new Uint8Deque(arr);
  assertEquals(dq.slice(), arr);
});

Deno.test("constructor should throw if the argument is not Uint8Array", () => {
  const arr = new Uint16Array([1, 2, 3]);
  assertThrows(() => {
    new Uint8Deque(arr as unknown as Uint8Array);
  }, TypeError);
});

Deno.test("length should return the number of elements held", () => {
  const arr = new Uint8Array([1, 2, 3]);
  const dq = new Uint8Deque(arr);
  assertEquals(dq.length, 3);
  const dq2 = new Uint8Deque();
  assertEquals(dq2.length, 0);
});

Deno.test("length should be read only", () => {
  assertThrows(() => {
    const dq = new Uint8Deque();
    // @ts-ignore: invalid
    dq.length = 2;
  });
});

Deno.test("byteLength should return the length in bytes", () => {
  const arr = new Uint8Array([1, 2, 3, 4]);
  const dq = new Uint8Deque(arr);
  assertEquals(dq.byteLength, 4);
  const dq2 = new Uint8Deque();
  assertEquals(dq2.byteLength, 0);
});

Deno.test("byteLength should be read only", () => {
  assertThrows(() => {
    const dq = new Uint8Deque();
    // @ts-ignore: invalid
    dq.byteLength = 2;
  });
});

Deno.test("clear should reset the queue", () => {
  const arr = new Uint8Array([1, 2, 3]);
  const dq = new Uint8Deque(arr);
  dq.push(new Uint8Array([3]));
  dq.clear();
  assertEquals(dq.length, 0);
  assertEquals(dq.slice(), new Uint8Array());
});

Deno.test("push should throw if the argument is not Uint8Array", () => {
  const dq = new Uint8Deque();
  assertThrows(() => {
    dq.push(new Uint16Array([1, 2, 3]) as unknown as Uint8Array);
  }, TypeError);
});

Deno.test("push should update the buffer", () => {
  const dq = new Uint8Deque();
  dq.push(new Uint8Array([1, 2, 3]));
  assertEquals(dq.length, 3);
  assertEquals(dq.slice(), new Uint8Array([1, 2, 3]));
  dq.push(new Uint8Array([11, 12]));
  assertEquals(dq.length, 5);
  assertEquals(dq.slice(), new Uint8Array([1, 2, 3, 11, 12]));
});

Deno.test("push should return the new length", () => {
  const dq = new Uint8Deque();
  assertEquals(dq.push(new Uint8Array([1, 2, 3])), dq.length);
  assertEquals(dq.push(new Uint8Array([21, 22])), dq.length);
});

Deno.test("at should use the integer part of the argument", () => {
  const dq = new Uint8Deque(new Uint8Array([1, 2]));
  assertEquals(dq.at(-0.01), 1);
  assertEquals(dq.at(0.9), 1);
  assertEquals(dq.at(1.001), 2);
});

Deno.test("at", () => {
  const dq = new Uint8Deque(new Uint8Array([1, 2]));
  const arr = new Uint8Array([1, 2]);

  for (let i = -3; i < arr.length + 1; i++) {
    assertEquals(dq.at(i), arr.at(i));
  }

  dq.push(new Uint8Array([11, 12]));
  const arr2 = new Uint8Array([1, 2, 11, 12]);

  for (let i = -1; i < arr2.length + 1; i++) {
    assertEquals(dq.at(i), arr2.at(i));
  }
});

Deno.test("slice", () => {
  const dq = new Uint8Deque(new Uint8Array([1, 2, 3]));
  const arr = new Uint8Array([1, 2, 3]);

  for (let start = -1; start < arr.length + 2; start++) {
    for (let end = -1; end < arr.length + 2; end++) {
      assertEquals(dq.slice(start, end), arr.slice(start, end));
    }
  }

  dq.push(new Uint8Array([11, 12]));
  dq.push(new Uint8Array([21, 22]));
  const arr2 = new Uint8Array([1, 2, 3, 11, 12, 21, 22]);

  for (let start = -1; start < arr2.length + 2; start++) {
    for (let end = -1; end < arr2.length + 2; end++) {
      assertEquals(dq.slice(start, end), arr2.slice(start, end));
    }
  }
});

Deno.test("indexOf", () => {
  const dq = new Uint8Deque(new Uint8Array([1, 2]));
  const arr = new Uint8Array([1, 2]);

  assertEquals(dq.indexOf(1), arr.indexOf(1));
  assertEquals(dq.indexOf(3), arr.indexOf(3));

  for (const elem of arr) {
    for (let i = -3; i < arr.length + 1; i++) {
      assertEquals(dq.indexOf(elem, i), arr.indexOf(elem, i));
    }
  }

  dq.push(new Uint8Array([11, 12]));
  const arr2 = new Uint8Array([1, 2, 11, 12]);
  for (const elem of arr2) {
    for (let i = -1; i < arr2.length + 1; i++) {
      assertEquals(dq.indexOf(elem, i), arr2.indexOf(elem, i));
    }
  }
});

Deno.test("includes", () => {
  const dq = new Uint8Deque(new Uint8Array([1, 2]));
  const arr = new Uint8Array([1, 2]);

  assertEquals(dq.includes(1), arr.includes(1));
  assertEquals(dq.includes(3), arr.includes(3));

  for (const elem of arr) {
    for (let i = -3; i < arr.length + 1; i++) {
      assertEquals(dq.includes(elem, i), arr.includes(elem, i));
    }
  }

  dq.push(new Uint8Array([11, 12]));
  const arr2 = new Uint8Array([1, 2, 11, 12]);
  for (const elem of arr2) {
    for (let i = -1; i < arr2.length + 1; i++) {
      assertEquals(dq.includes(elem, i), arr2.includes(elem, i));
    }
  }
});

Deno.test("pop single value", () => {
  const dq = new Uint8Deque(new Uint8Array([1, 2]));
  const arr = [1, 2];
  const pop = () => {
    dq.pop();
    arr.pop();
    assertEquals([...dq.slice()], arr);
  };

  pop();
  pop();
  pop();

  dq.push(new Uint8Array([11, 12, 13]));
  arr.push(11, 12, 13);
  dq.push(new Uint8Array([21, 22]));
  arr.push(21, 22);
  while (arr.length) {
    pop();
  }
});

Deno.test("shift single value", () => {
  const dq = new Uint8Deque(new Uint8Array([1, 2]));
  const arr = [1, 2];
  const shift = () => {
    dq.shift();
    arr.shift();
    assertEquals([...dq.slice()], arr);
  };

  shift();
  shift();
  shift();

  dq.push(new Uint8Array([11, 12, 13]));
  arr.push(11, 12, 13);
  dq.push(new Uint8Array([21, 22]));
  arr.push(21, 22);
  while (arr.length) {
    shift();
  }
});
