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
    if (array) {
      this.push(array);
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

    const [chunkIdx, offset] = this.chunkAt(searchIdx);
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

    const [startIndex, startOffset] = this.chunkAt(start);
    const [endIndex, endOffset] = this.chunkAt(end);

    if (startIndex === endIndex) {
      // same underlying chunk
      const chunk = this.#chunks[startIndex];
      return chunk.slice(start - startOffset, end - startOffset);
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

  private chunkAt(i: number): [index: number, offset: number] {
    let chunkIdx = 0;
    let offset = 0;
    while (offset + this.#chunks[chunkIdx].length <= i) {
      offset += this.#chunks[chunkIdx].length;
      chunkIdx++;
    }
    return [chunkIdx, offset];
  }
}
