/** A variable length array of 8-bit unsigned integers. */
export class Uint8Deque {
  #chunks: Uint8Array[] = [];
  #length = 0;

  /**
   * Returns a number value of the element size. `1` in the case of an
   * `Uint8Deque`.
   */
  static get BYTES_PER_ELEMENT() {
    return 1;
  }

  constructor(array?: Uint8Array) {
    if (array instanceof Uint8Array) {
      this.push(array);
    } else if (typeof array !== "undefined") {
      throw new TypeError("The provided value is not of type 'Uint8Array'");
    }
  }

  /** Returns the number of elements held in the `Uint8Deque`. */
  get length() {
    return this.#length;
  }

  /** Returns the length (in bytes) of the `Uint8Deque`. */
  get byteLength() {
    return this.#length;
  }

  *[Symbol.iterator]() {
    for (const chunk of this.#chunks) {
      for (const elem of chunk) {
        yield elem;
      }
    }
  }

  /** Removes all elements from the `Uint8Deque`. */
  clear(): void {
    this.#chunks = [];
    this.#length = 0;
  }

  /**
   * Appends the given array to the end of the `Uint8Deque`, and returns the
   * new `length` of the `Uint8Deque`. This will not create a new buffer,
   * changes to the given array will impact the `Uint8Deque` and vice versa.
   * @param array elements to add to the end of the `Uint8Deque`
   */
  push(array: Uint8Array): number {
    if (!(array instanceof Uint8Array)) {
      throw new TypeError("The provided value is not of type 'Uint8Array'");
    }
    this.#chunks.push(array);
    this.#length += array.length;
    return this.#length;
  }

  /**
   * Returns the element at the given index. Returns `undefined` if the given
   * index can not be found.
   * @param index The index of the element to be returned. A negative index can
   *     be used, indicating an offset from the end of the `Uint8Deque`.
   */
  at(index: number): number | undefined {
    let searchIdx = Math.trunc(index) || 0;
    if (searchIdx < 0) {
      searchIdx += this.#length;
    }
    if (searchIdx < 0 || searchIdx >= this.#length) {
      return undefined;
    }

    const [chunkIdx, offset] = this._chunkAt(searchIdx);
    return this.#chunks[chunkIdx][searchIdx - offset];
  }

  /**
   * Removes up to the given number of elements from the start of the
   * `Uint8Deque`.
   * @param count Number of elements to remove, defaults to `1`.
   */
  shift(count = 1): void {
    while (this.#chunks.length > 0 && count > 0) {
      const chunk = this.#chunks[0];
      if (chunk.length < count) {
        this.#chunks.shift();
        count -= chunk.length;
        this.#length -= chunk.length;
      } else {
        this.#chunks[0] = chunk.subarray(count);
        this.#length -= count;
        return;
      }
    }
  }

  /**
   * Removes up to the given number of elements from the end of the
   * `Uint8Deque`.
   * @param count Number of elements to remove, defaults to `1`.
   */
  pop(count = 1): void {
    while (this.#chunks.length > 0 && count > 0) {
      const chunk = this.#chunks[this.#chunks.length - 1];
      if (chunk.length < count) {
        this.#chunks.pop();
        count -= chunk.length;
        this.#length -= chunk.length;
      } else {
        this.#chunks[this.#chunks.length - 1] = chunk.subarray(0, -count);
        this.#length -= count;
        return;
      }
    }
  }

  /**
   * Returns a new typed array that contains a copy of a portion of the
   * `Uint8Deque` from `start` up to but not including `end`.
   * A negative index can be used, indicating an offset from the end.
   * An empty array is returned if `start >= end`.
   * @param start The beginning of the specified portion of the array, defaults
   *     to `0`.
   * @param end The end of the specified portion of the array, defaults to the
   *     end of the `Uint8Deque`. If `end` is greater than `length`, then
   *     `length` is used as `end`.
   */
  slice(start = 0, end = this.#length): Uint8Array {
    if (start < 0) {
      start += this.#length;
    }
    if (end < 0) {
      end += this.#length;
    }
    if (end > this.#length) {
      end = this.#length;
    }

    if (end <= start) {
      return new Uint8Array();
    }

    const ret = new Uint8Array(end - start);
    let offset = 0;

    if (start === 0 && end === this.#length) {
      // full copy shortcut
      for (const chunk of this.#chunks) {
        ret.set(chunk, offset);
        offset += chunk.length;
      }
      return ret;
    }

    const [startIndex, startOffset] = this._chunkAt(start);
    const [endIndex, endOffset] = this._chunkAt(end - 1);

    if (startIndex === endIndex) {
      // same underlying chunk
      const chunk = this.#chunks[startIndex];
      // TypedArray.prototype.slice is incompatible with Buffer.prototype.slice
      ret.set(chunk.subarray(start - startOffset, end - startOffset));
      return ret;
    }

    const startSection = this.#chunks[startIndex].subarray(start - startOffset);
    ret.set(startSection, offset);
    offset += startSection.length;

    for (let i = startIndex + 1; i < endIndex; i++) {
      const chunk = this.#chunks[i];
      ret.set(chunk, offset);
      offset += chunk.length;
    }

    const endSection = this.#chunks[endIndex].subarray(0, end - endOffset);
    ret.set(endSection, offset);

    return ret;
  }

  /**
   * Returns the first index at which a given element can be found in the
   * `Uint8Deque`, or -1 if it is not present.
   * @param searchElement Element to locate
   * @param fromIndex The index to start the search at, defaults to `0`.
   *     A negative index can be used, indicating an offset from the end.
   */
  indexOf(searchElement: number, fromIndex = 0): number {
    if (fromIndex < 0) {
      fromIndex += this.#length;
    }
    if (fromIndex >= this.#length) {
      return -1;
    }

    let offset = 0;
    for (let i = 0; i < this.#chunks.length; i++) {
      const startIdx = Math.max(fromIndex - offset, 0);
      const idx = this.#chunks[i].indexOf(searchElement, startIdx);
      if (idx >= 0) {
        return offset + idx;
      }
      offset += this.#chunks[i].length;
    }
    return -1;
  }

  /**
   * Determines whether a `Uint8Deque` includes a certain element.
   * @param searchElement Element to search for
   * @param fromIndex The index to start the search at, defaults to `0`.
   *     A negative index can be used, indicating an offset from the end.
   */
  includes(searchElement: number, fromIndex = 0): boolean {
    return this.indexOf(searchElement, fromIndex) >= 0;
  }

  /**
   * Copy the content of an array into the `Uint8Deque`.
   * @param array The array fron which to copy values.
   * @param offset The offset into the `Uint8Deque` at which to begin writing
   *     values.
   * @throws {RangeError} if the offset is set such as it would store beyond the
   *     end of the `Uint8Deque`.
   */
  set(array: number[] | Uint8Array, offset = 0) {
    if (offset < 0 || offset + array.length > this.#length) {
      throw new RangeError("offset is out of bounds");
    }
    if (array.length === 0) return;

    let [chunkIdx, chunkOffset] = this._chunkAt(offset);
    if (offset + array.length < chunkOffset + this.#chunks[chunkIdx].length) {
      this.#chunks[chunkIdx].set(array, offset - chunkOffset);
      return;
    }

    if (!(array instanceof Uint8Array)) {
      array = new Uint8Array(array);
    }

    const end = array.length;
    let pos = chunkOffset + this.#chunks[chunkIdx].length - offset;

    this.#chunks[chunkIdx].set(array.subarray(0, pos), offset - chunkOffset);
    chunkIdx++;

    while (pos < end) {
      const chunk = this.#chunks[chunkIdx];
      if (chunk.length < end - pos) {
        chunk.set(array.subarray(pos, pos + chunk.length));
        pos += chunk.length;
        chunkIdx++;
      } else {
        chunk.set(array.subarray(pos));
        return;
      }
    }
  }

  toString(): string {
    return `Uint8Deque(${this.#length}) [${this.length ? " ... " : ""}]`;
  }

  private _chunkAt(i: number): [index: number, offset: number] {
    let chunkIdx = 0;
    let offset = 0;
    while (offset + this.#chunks[chunkIdx].length <= i) {
      offset += this.#chunks[chunkIdx].length;
      chunkIdx++;
    }
    return [chunkIdx, offset];
  }
}
