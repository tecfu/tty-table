(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TtyTable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],3:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],4:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (value instanceof ArrayBuffer) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (isArrayBufferView(string) || string instanceof ArrayBuffer) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":2,"ieee754":7}],5:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})

},{"../../is-buffer/index.js":9}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],7:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],8:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],9:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],10:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],11:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

}).call(this,require('_process'))

},{"_process":12}],12:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],13:[function(require,module,exports){
module.exports = require('./lib/_stream_duplex.js');

},{"./lib/_stream_duplex.js":14}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  processNextTick(cb, err);
};

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
},{"./_stream_readable":16,"./_stream_writable":18,"core-util-is":5,"inherits":8,"process-nextick-args":11}],15:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":17,"core-util-is":5,"inherits":8}],16:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

// TODO(bmeurer): Change this back to const once hole checks are
// properly optimized away early in Ignition+TurboFan.
/*<replacement>*/
var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], self.emit.bind(self, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./_stream_duplex":14,"./internal/streams/BufferList":19,"./internal/streams/destroy":20,"./internal/streams/stream":21,"_process":12,"core-util-is":5,"events":6,"inherits":8,"isarray":10,"process-nextick-args":11,"safe-buffer":26,"string_decoder/":28,"util":3}],17:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return stream.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er, data) {
      done(stream, er, data);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data !== null && data !== undefined) stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":14,"core-util-is":5,"inherits":8}],18:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/
var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = _isUint8Array(chunk) && !state.objectMode;

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    processNextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    processNextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      processNextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./_stream_duplex":14,"./internal/streams/destroy":20,"./internal/streams/stream":21,"_process":12,"core-util-is":5,"inherits":8,"process-nextick-args":11,"safe-buffer":26,"util-deprecate":29}],19:[function(require,module,exports){
'use strict';

/*<replacement>*/

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();
},{"safe-buffer":26}],20:[function(require,module,exports){
'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      processNextTick(emitErrorNT, this, err);
    }
    return;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      processNextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":11}],21:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":6}],22:[function(require,module,exports){
module.exports = require('./readable').PassThrough

},{"./readable":23}],23:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":14,"./lib/_stream_passthrough.js":15,"./lib/_stream_readable.js":16,"./lib/_stream_transform.js":17,"./lib/_stream_writable.js":18}],24:[function(require,module,exports){
module.exports = require('./readable').Transform

},{"./readable":23}],25:[function(require,module,exports){
module.exports = require('./lib/_stream_writable.js');

},{"./lib/_stream_writable.js":18}],26:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":4}],27:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":6,"inherits":8,"readable-stream/duplex.js":13,"readable-stream/passthrough.js":22,"readable-stream/readable.js":23,"readable-stream/transform.js":24,"readable-stream/writable.js":25}],28:[function(require,module,exports){
'use strict';

var Buffer = require('safe-buffer').Buffer;

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return -1;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// UTF-8 replacement characters ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd'.repeat(p);
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd'.repeat(p + 1);
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd'.repeat(p + 2);
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character for each buffered byte of a (partial)
// character needs to be added to the output.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd'.repeat(this.lastTotal - this.lastNeed);
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":26}],29:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],30:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],31:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],32:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":31,"_process":12,"inherits":30}],"/src/main.js":[function(require,module,exports){
'use strict';require('use-strict'),require.main===module?require('./terminal-adapter.js'):module.exports=require('./default-adapter.js');

},{"./default-adapter.js":55,"./terminal-adapter.js":60,"use-strict":51}],33:[function(require,module,exports){
'use strict';
module.exports = function () {
	return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g;
};

},{}],34:[function(require,module,exports){
'use strict';

function assembleStyles () {
	var styles = {
		modifiers: {
			reset: [0, 0],
			bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		colors: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39]
		},
		bgColors: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49]
		}
	};

	// fix humans
	styles.colors.grey = styles.colors.gray;

	Object.keys(styles).forEach(function (groupName) {
		var group = styles[groupName];

		Object.keys(group).forEach(function (styleName) {
			var style = group[styleName];

			styles[styleName] = group[styleName] = {
				open: '\u001b[' + style[0] + 'm',
				close: '\u001b[' + style[1] + 'm'
			};
		});

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	});

	return styles;
}

Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});

},{}],35:[function(require,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Wcwidth = require('wcwidth');
module.exports = function (word, breakAtLength) {
	var charArr = [].concat(_toConsumableArray(word));
	var index = 0;
	var indexOfLastFitChar = 0;
	var fittableLength = 0;
	while (charArr.length > 0) {
		var char = charArr.shift();
		var currentLength = fittableLength + Wcwidth(char);
		if (currentLength <= breakAtLength) {
			indexOfLastFitChar = index;
			fittableLength = currentLength;
			index++;
		} else {
			break;
		}
	}
	//break after this character
	return indexOfLastFitChar;
};


},{"wcwidth":53}],36:[function(require,module,exports){
(function (process){
'use strict';
var escapeStringRegexp = require('escape-string-regexp');
var ansiStyles = require('ansi-styles');
var stripAnsi = require('strip-ansi');
var hasAnsi = require('has-ansi');
var supportsColor = require('supports-color');
var defineProps = Object.defineProperties;
var isSimpleWindowsTerm = process.platform === 'win32' && !/^xterm/i.test(process.env.TERM);

function Chalk(options) {
	// detect mode if not set manually
	this.enabled = !options || options.enabled === undefined ? supportsColor : options.enabled;
}

// use bright blue on Windows as the normal blue color is illegible
if (isSimpleWindowsTerm) {
	ansiStyles.blue.open = '\u001b[94m';
}

var styles = (function () {
	var ret = {};

	Object.keys(ansiStyles).forEach(function (key) {
		ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');

		ret[key] = {
			get: function () {
				return build.call(this, this._styles.concat(key));
			}
		};
	});

	return ret;
})();

var proto = defineProps(function chalk() {}, styles);

function build(_styles) {
	var builder = function () {
		return applyStyle.apply(builder, arguments);
	};

	builder._styles = _styles;
	builder.enabled = this.enabled;
	// __proto__ is used because we must return a function, but there is
	// no way to create a function with a different prototype.
	/* eslint-disable no-proto */
	builder.__proto__ = proto;

	return builder;
}

function applyStyle() {
	// support varags, but simply cast to string in case there's only one arg
	var args = arguments;
	var argsLen = args.length;
	var str = argsLen !== 0 && String(arguments[0]);

	if (argsLen > 1) {
		// don't slice `arguments`, it prevents v8 optimizations
		for (var a = 1; a < argsLen; a++) {
			str += ' ' + args[a];
		}
	}

	if (!this.enabled || !str) {
		return str;
	}

	var nestedStyles = this._styles;
	var i = nestedStyles.length;

	// Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
	// see https://github.com/chalk/chalk/issues/58
	// If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
	var originalDim = ansiStyles.dim.open;
	if (isSimpleWindowsTerm && (nestedStyles.indexOf('gray') !== -1 || nestedStyles.indexOf('grey') !== -1)) {
		ansiStyles.dim.open = '';
	}

	while (i--) {
		var code = ansiStyles[nestedStyles[i]];

		// Replace any instances already present with a re-opening code
		// otherwise only the part of the string until said closing code
		// will be colored, and the rest will simply be 'plain'.
		str = code.open + str.replace(code.closeRe, code.open) + code.close;
	}

	// Reset the original 'dim' if we changed it to work around the Windows dimmed gray issue.
	ansiStyles.dim.open = originalDim;

	return str;
}

function init() {
	var ret = {};

	Object.keys(styles).forEach(function (name) {
		ret[name] = {
			get: function () {
				return build.call(this, [name]);
			}
		};
	});

	return ret;
}

defineProps(Chalk.prototype, init());

module.exports = new Chalk();
module.exports.styles = ansiStyles;
module.exports.hasColor = hasAnsi;
module.exports.stripColor = stripAnsi;
module.exports.supportsColor = supportsColor;

}).call(this,require('_process'))

},{"_process":12,"ansi-styles":34,"escape-string-regexp":43,"has-ansi":44,"strip-ansi":49,"supports-color":50}],37:[function(require,module,exports){
(function (Buffer){
var clone = (function() {
'use strict';

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
 * @param `prototype` - sets the prototype to be used when cloning an object.
 *    (optional - defaults to parent prototype).
*/
function clone(parent, circular, depth, prototype) {
  var filter;
  if (typeof circular === 'object') {
    depth = circular.depth;
    prototype = circular.prototype;
    filter = circular.filter;
    circular = circular.circular
  }
  // maintain two arrays for circular references, where corresponding parents
  // and children have the same index
  var allParents = [];
  var allChildren = [];

  var useBuffer = typeof Buffer != 'undefined';

  if (typeof circular == 'undefined')
    circular = true;

  if (typeof depth == 'undefined')
    depth = Infinity;

  // recurse this function so we don't reset allParents and allChildren
  function _clone(parent, depth) {
    // cloning null always returns null
    if (parent === null)
      return null;

    if (depth == 0)
      return parent;

    var child;
    var proto;
    if (typeof parent != 'object') {
      return parent;
    }

    if (clone.__isArray(parent)) {
      child = [];
    } else if (clone.__isRegExp(parent)) {
      child = new RegExp(parent.source, __getRegExpFlags(parent));
      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    } else if (clone.__isDate(parent)) {
      child = new Date(parent.getTime());
    } else if (useBuffer && Buffer.isBuffer(parent)) {
      child = new Buffer(parent.length);
      parent.copy(child);
      return child;
    } else {
      if (typeof prototype == 'undefined') {
        proto = Object.getPrototypeOf(parent);
        child = Object.create(proto);
      }
      else {
        child = Object.create(prototype);
        proto = prototype;
      }
    }

    if (circular) {
      var index = allParents.indexOf(parent);

      if (index != -1) {
        return allChildren[index];
      }
      allParents.push(parent);
      allChildren.push(child);
    }

    for (var i in parent) {
      var attrs;
      if (proto) {
        attrs = Object.getOwnPropertyDescriptor(proto, i);
      }

      if (attrs && attrs.set == null) {
        continue;
      }
      child[i] = _clone(parent[i], depth - 1);
    }

    return child;
  }

  return _clone(parent, depth);
}

/**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
clone.clonePrototype = function clonePrototype(parent) {
  if (parent === null)
    return null;

  var c = function () {};
  c.prototype = parent;
  return new c();
};

// private utility functions

function __objToStr(o) {
  return Object.prototype.toString.call(o);
};
clone.__objToStr = __objToStr;

function __isDate(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Date]';
};
clone.__isDate = __isDate;

function __isArray(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Array]';
};
clone.__isArray = __isArray;

function __isRegExp(o) {
  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
};
clone.__isRegExp = __isRegExp;

function __getRegExpFlags(re) {
  var flags = '';
  if (re.global) flags += 'g';
  if (re.ignoreCase) flags += 'i';
  if (re.multiline) flags += 'm';
  return flags;
};
clone.__getRegExpFlags = __getRegExpFlags;

return clone;
})();

if (typeof module === 'object' && module.exports) {
  module.exports = clone;
}

}).call(this,require("buffer").Buffer)

},{"buffer":4}],38:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
var Generator, stream, util;

stream = require('stream');

util = require('util');

module.exports = function() {
  var callback, data, generator, options;
  if (arguments.length === 2) {
    options = arguments[0];
    callback = arguments[1];
  } else if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      options = {};
      callback = arguments[0];
    } else {
      options = arguments[0];
    }
  } else if (arguments.length === 0) {
    options = {};
  }
  generator = new Generator(options);
  if (callback) {
    data = [];
    generator.on('readable', function() {
      var d, results;
      results = [];
      while (d = generator.read()) {
        results.push(data.push(options.objectMode ? d : d.toString()));
      }
      return results;
    });
    generator.on('error', callback);
    generator.on('end', function() {
      return callback(null, options.objectMode ? data : data.join(''));
    });
  }
  return generator;
};

Generator = function(options1) {
  var base, base1, base2, base3, base4, base5, base6, base7, base8, i, j, len, ref, v;
  this.options = options1 != null ? options1 : {};
  stream.Readable.call(this, this.options);
  this.options.count = 0;
  if ((base = this.options).duration == null) {
    base.duration = 4 * 60 * 1000;
  }
  if ((base1 = this.options).columns == null) {
    base1.columns = 8;
  }
  if ((base2 = this.options).max_word_length == null) {
    base2.max_word_length = 16;
  }
  if ((base3 = this.options).fixed_size == null) {
    base3.fixed_size = false;
  }
  if (this.fixed_size_buffer == null) {
    this.fixed_size_buffer = '';
  }
  if ((base4 = this.options).start == null) {
    base4.start = Date.now();
  }
  if ((base5 = this.options).end == null) {
    base5.end = null;
  }
  if ((base6 = this.options).seed == null) {
    base6.seed = false;
  }
  if ((base7 = this.options).length == null) {
    base7.length = -1;
  }
  if ((base8 = this.options).delimiter == null) {
    base8.delimiter = ',';
  }
  this.count_written = 0;
  this.count_created = 0;
  if (typeof this.options.columns === 'number') {
    this.options.columns = new Array(this.options.columns);
  }
  ref = this.options.columns;
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    v = ref[i];
    if (v == null) {
      v = 'ascii';
    }
    if (typeof v === 'string') {
      this.options.columns[i] = Generator[v];
    }
  }
  return this;
};

util.inherits(Generator, stream.Readable);

module.exports.Generator = Generator;

Generator.prototype.random = function() {
  if (this.options.seed) {
    return this.options.seed = this.options.seed * Math.PI * 100 % 100 / 100;
  } else {
    return Math.random();
  }
};

Generator.prototype.end = function() {
  return this.push(null);
};

Generator.prototype._read = function(size) {
  var column, data, header, j, k, l, len, len1, len2, len3, length, line, lineLength, m, ref;
  data = [];
  length = this.fixed_size_buffer.length;
  if (length) {
    data.push(this.fixed_size_buffer);
  }
  while (true) {
    if ((this.count_created === this.options.length) || (this.options.end && Date.now() > this.options.end)) {
      if (data.length) {
        if (this.options.objectMode) {
          for (j = 0, len = data.length; j < len; j++) {
            line = data[j];
            this.count_written++;
            this.push(line);
          }
        } else {
          this.count_written++;
          this.push(data.join(''));
        }
      }
      return this.push(null);
    }
    line = [];
    ref = this.options.columns;
    for (k = 0, len1 = ref.length; k < len1; k++) {
      header = ref[k];
      line.push("" + (header(this)));
    }
    if (this.options.objectMode) {
      lineLength = 0;
      for (l = 0, len2 = line.length; l < len2; l++) {
        column = line[l];
        lineLength += column.length;
      }
    } else {
      line = "" + (this.count_created === 0 ? '' : '\n') + (line.join(this.options.delimiter));
      lineLength = line.length;
    }
    this.count_created++;
    if (length + lineLength > size) {
      if (this.options.objectMode) {
        data.push(line);
        for (m = 0, len3 = data.length; m < len3; m++) {
          line = data[m];
          this.count_written++;
          this.push(line);
        }
      } else {
        if (this.options.fixed_size) {
          this.fixed_size_buffer = line.substr(size - length);
          data.push(line.substr(0, size - length));
        } else {
          data.push(line);
        }
        this.count_written++;
        this.push(data.join(''));
      }
      break;
    }
    length += lineLength;
    data.push(line);
  }
};

Generator.ascii = function(gen) {
  var char, column, j, nb_chars, ref;
  column = [];
  for (nb_chars = j = 0, ref = Math.ceil(gen.random() * gen.options.max_word_length); 0 <= ref ? j < ref : j > ref; nb_chars = 0 <= ref ? ++j : --j) {
    char = Math.floor(gen.random() * 32);
    column.push(String.fromCharCode(char + (char < 16 ? 65 : 97 - 16)));
  }
  return column.join('');
};

Generator.int = function(gen) {
  return Math.floor(gen.random() * Math.pow(2, 52));
};

Generator.bool = function(gen) {
  return Math.floor(gen.random() * 2);
};

},{"stream":27,"util":32}],39:[function(require,module,exports){
(function (process,Buffer){
// Generated by CoffeeScript 1.10.0
var Parser, StringDecoder, stream, util;

stream = require('stream');

util = require('util');

StringDecoder = require('string_decoder').StringDecoder;

module.exports = function() {
  var callback, called, chunks, data, options, parser;
  if (arguments.length === 3) {
    data = arguments[0];
    options = arguments[1];
    callback = arguments[2];
    if (typeof callback !== 'function') {
      throw Error("Invalid callback argument: " + (JSON.stringify(callback)));
    }
    if (!(typeof data === 'string' || Buffer.isBuffer(arguments[0]))) {
      return callback(Error("Invalid data argument: " + (JSON.stringify(data))));
    }
  } else if (arguments.length === 2) {
    if (typeof arguments[0] === 'string' || Buffer.isBuffer(arguments[0])) {
      data = arguments[0];
    } else {
      options = arguments[0];
    }
    if (typeof arguments[1] === 'function') {
      callback = arguments[1];
    } else {
      options = arguments[1];
    }
  } else if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      callback = arguments[0];
    } else {
      options = arguments[0];
    }
  }
  if (options == null) {
    options = {};
  }
  parser = new Parser(options);
  if (data != null) {
    process.nextTick(function() {
      parser.write(data);
      return parser.end();
    });
  }
  if (callback) {
    called = false;
    chunks = options.objname ? {} : [];
    parser.on('readable', function() {
      var chunk, results;
      results = [];
      while (chunk = parser.read()) {
        if (options.objname) {
          results.push(chunks[chunk[0]] = chunk[1]);
        } else {
          results.push(chunks.push(chunk));
        }
      }
      return results;
    });
    parser.on('error', function(err) {
      called = true;
      return callback(err);
    });
    parser.on('end', function() {
      if (!called) {
        return callback(null, chunks);
      }
    });
  }
  return parser;
};

Parser = function(options) {
  var base, base1, base10, base11, base12, base13, base14, base15, base16, base2, base3, base4, base5, base6, base7, base8, base9, k, v;
  if (options == null) {
    options = {};
  }
  options.objectMode = true;
  this.options = {};
  for (k in options) {
    v = options[k];
    this.options[k] = v;
  }
  stream.Transform.call(this, this.options);
  if ((base = this.options).rowDelimiter == null) {
    base.rowDelimiter = null;
  }
  if (typeof this.options.rowDelimiter === 'string') {
    this.options.rowDelimiter = [this.options.rowDelimiter];
  }
  if ((base1 = this.options).delimiter == null) {
    base1.delimiter = ',';
  }
  if ((base2 = this.options).quote == null) {
    base2.quote = '"';
  }
  if ((base3 = this.options).escape == null) {
    base3.escape = '"';
  }
  if ((base4 = this.options).columns == null) {
    base4.columns = null;
  }
  if ((base5 = this.options).comment == null) {
    base5.comment = '';
  }
  if ((base6 = this.options).objname == null) {
    base6.objname = false;
  }
  if ((base7 = this.options).trim == null) {
    base7.trim = false;
  }
  if ((base8 = this.options).ltrim == null) {
    base8.ltrim = false;
  }
  if ((base9 = this.options).rtrim == null) {
    base9.rtrim = false;
  }
  if ((base10 = this.options).auto_parse == null) {
    base10.auto_parse = false;
  }
  if ((base11 = this.options).auto_parse_date == null) {
    base11.auto_parse_date = false;
  }
  if ((base12 = this.options).relax == null) {
    base12.relax = false;
  }
  if ((base13 = this.options).relax_column_count == null) {
    base13.relax_column_count = false;
  }
  if ((base14 = this.options).skip_empty_lines == null) {
    base14.skip_empty_lines = false;
  }
  if ((base15 = this.options).max_limit_on_data_read == null) {
    base15.max_limit_on_data_read = 128000;
  }
  if ((base16 = this.options).skip_lines_with_empty_values == null) {
    base16.skip_lines_with_empty_values = false;
  }
  this.lines = 0;
  this.count = 0;
  this.skipped_line_count = 0;
  this.empty_line_count = 0;
  this.is_int = /^(\-|\+)?([1-9]+[0-9]*)$/;
  this.is_float = function(value) {
    return (value - parseFloat(value) + 1) >= 0;
  };
  this._ = {};
  this._.decoder = new StringDecoder();
  this._.quoting = false;
  this._.commenting = false;
  this._.field = null;
  this._.nextChar = null;
  this._.closingQuote = 0;
  this._.line = [];
  this._.chunks = [];
  this._.rawBuf = '';
  this._.buf = '';
  if (this.options.rowDelimiter) {
    this._.rowDelimiterLength = Math.max.apply(Math, this.options.rowDelimiter.map(function(v) {
      return v.length;
    }));
  }
  return this;
};

util.inherits(Parser, stream.Transform);

module.exports.Parser = Parser;

Parser.prototype._transform = function(chunk, encoding, callback) {
  var err, error;
  if (chunk instanceof Buffer) {
    chunk = this._.decoder.write(chunk);
  }
  try {
    this.__write(chunk, false);
    return callback();
  } catch (error) {
    err = error;
    return this.emit('error', err);
  }
};

Parser.prototype._flush = function(callback) {
  var err, error;
  try {
    this.__write(this._.decoder.end(), true);
    if (this._.quoting) {
      this.emit('error', new Error("Quoted field not terminated at line " + (this.lines + 1)));
      return;
    }
    if (this._.line.length > 0) {
      this.__push(this._.line);
    }
    return callback();
  } catch (error) {
    err = error;
    return this.emit('error', err);
  }
};

Parser.prototype.__push = function(line) {
  var field, i, j, len, lineAsColumns, rawBuf, row;
  if (this.options.skip_lines_with_empty_values && line.join('').trim() === '') {
    return;
  }
  row = null;
  if (this.options.columns === true) {
    this.options.columns = line;
    rawBuf = '';
    return;
  } else if (typeof this.options.columns === 'function') {
    this.options.columns = this.options.columns(line);
    rawBuf = '';
    return;
  }
  if (!this._.line_length && line.length > 0) {
    this._.line_length = this.options.columns ? this.options.columns.length : line.length;
  }
  if (line.length === 1 && line[0] === '') {
    this.empty_line_count++;
  } else if (line.length !== this._.line_length) {
    if (this.options.relax_column_count) {
      this.skipped_line_count++;
    } else if (this.options.columns != null) {
      throw Error("Number of columns on line " + this.lines + " does not match header");
    } else {
      throw Error("Number of columns is inconsistent on line " + this.lines);
    }
  } else {
    this.count++;
  }
  if (this.options.columns != null) {
    lineAsColumns = {};
    for (i = j = 0, len = line.length; j < len; i = ++j) {
      field = line[i];
      if (this.options.columns[i] === false) {
        continue;
      }
      lineAsColumns[this.options.columns[i]] = field;
    }
    if (this.options.objname) {
      row = [lineAsColumns[this.options.objname], lineAsColumns];
    } else {
      row = lineAsColumns;
    }
  } else {
    row = line;
  }
  if (this.count < this.options.from) {
    return;
  }
  if (this.count > this.options.to) {
    return;
  }
  if (this.options.raw) {
    this.push({
      raw: this._.rawBuf,
      row: row
    });
    return this._.rawBuf = '';
  } else {
    return this.push(row);
  }
};

Parser.prototype.__write = function(chars, end) {
  var areNextCharsDelimiter, areNextCharsRowDelimiters, auto_parse, char, escapeIsQuote, i, isDelimiter, isEscape, isNextCharAComment, isQuote, isRowDelimiter, isRowDelimiterLength, is_float, is_int, l, ltrim, nextCharPos, ref, ref1, ref2, ref3, ref4, remainingBuffer, results, rowDelimiter, rtrim, wasCommenting;
  is_int = (function(_this) {
    return function(value) {
      if (typeof _this.is_int === 'function') {
        return _this.is_int(value);
      } else {
        return _this.is_int.test(value);
      }
    };
  })(this);
  is_float = (function(_this) {
    return function(value) {
      if (typeof _this.is_float === 'function') {
        return _this.is_float(value);
      } else {
        return _this.is_float.test(value);
      }
    };
  })(this);
  auto_parse = (function(_this) {
    return function(value) {
      var m;
      if (!_this.options.auto_parse) {
        return value;
      }
      if (is_int(value)) {
        value = parseInt(value);
      } else if (is_float(value)) {
        value = parseFloat(value);
      } else if (_this.options.auto_parse_date) {
        m = Date.parse(value);
        if (!isNaN(m)) {
          value = new Date(m);
        }
      }
      return value;
    };
  })(this);
  ltrim = this.options.trim || this.options.ltrim;
  rtrim = this.options.trim || this.options.rtrim;
  chars = this._.buf + chars;
  l = chars.length;
  i = 0;
  if (this.lines === 0 && 0xFEFF === chars.charCodeAt(0)) {
    i++;
  }
  while (i < l) {
    if (!end) {
      remainingBuffer = chars.substr(i, l - i);
      if ((!this.options.rowDelimiter && i + 3 > l) || (!this._.commenting && l - i < this.options.comment.length && this.options.comment.substr(0, l - i) === remainingBuffer) || (this.options.rowDelimiter && l - i < this._.rowDelimiterLength && this.options.rowDelimiter.some(function(rd) {
        return rd.substr(0, l - i) === remainingBuffer;
      })) || (this.options.rowDelimiter && this._.quoting && l - i < (this.options.quote.length + this._.rowDelimiterLength) && this.options.rowDelimiter.some((function(_this) {
        return function(rd) {
          return (_this.options.quote + rd).substr(0, l - i) === remainingBuffer;
        };
      })(this))) || (l - i <= this.options.delimiter.length && this.options.delimiter.substr(0, l - i) === remainingBuffer) || (l - i <= this.options.escape.length && this.options.escape.substr(0, l - i) === remainingBuffer)) {
        break;
      }
    }
    char = this._.nextChar ? this._.nextChar : chars.charAt(i);
    this._.nextChar = l > i + 1 ? chars.charAt(i + 1) : '';
    if (this.options.raw) {
      this._.rawBuf += char;
    }
    if (this.options.rowDelimiter == null) {
      nextCharPos = i;
      rowDelimiter = null;
      if (!this._.quoting && (char === '\n' || char === '\r')) {
        rowDelimiter = char;
        nextCharPos += 1;
      } else if (!(!this._.quoting && char === this.options.quote) && (this._.nextChar === '\n' || this._.nextChar === '\r')) {
        rowDelimiter = this._.nextChar;
        nextCharPos += 2;
        if (this.raw) {
          rawBuf += this._.nextChar;
        }
      }
      if (rowDelimiter) {
        if (rowDelimiter === '\r' && chars.charAt(nextCharPos) === '\n') {
          rowDelimiter += '\n';
        }
        this.options.rowDelimiter = [rowDelimiter];
        this._.rowDelimiterLength = rowDelimiter.length;
      }
    }
    if (!this._.commenting && char === this.options.escape) {
      escapeIsQuote = this.options.escape === this.options.quote;
      isEscape = this._.nextChar === this.options.escape;
      isQuote = this._.nextChar === this.options.quote;
      if (!(escapeIsQuote && (this._.field == null) && !this._.quoting) && (isEscape || isQuote)) {
        i++;
        char = this._.nextChar;
        this._.nextChar = chars.charAt(i + 1);
        if (this._.field == null) {
          this._.field = '';
        }
        this._.field += char;
        if (this.options.raw) {
          this._.rawBuf += char;
        }
        i++;
        continue;
      }
    }
    if (!this._.commenting && char === this.options.quote) {
      if (this._.quoting) {
        areNextCharsRowDelimiters = this.options.rowDelimiter && this.options.rowDelimiter.some(function(rd) {
          return chars.substr(i + 1, rd.length) === rd;
        });
        areNextCharsDelimiter = chars.substr(i + 1, this.options.delimiter.length) === this.options.delimiter;
        isNextCharAComment = this._.nextChar === this.options.comment;
        if (this._.nextChar && !areNextCharsRowDelimiters && !areNextCharsDelimiter && !isNextCharAComment) {
          if (this.options.relax) {
            this._.quoting = false;
            this._.field = "" + this.options.quote + this._.field;
          } else {
            throw Error("Invalid closing quote at line " + (this.lines + 1) + "; found " + (JSON.stringify(this._.nextChar)) + " instead of delimiter " + (JSON.stringify(this.options.delimiter)));
          }
        } else {
          this._.quoting = false;
          this._.closingQuote = this.options.quote.length;
          i++;
          if (end && i === l) {
            this._.line.push(auto_parse(this._.field || ''));
            this._.field = null;
          }
          continue;
        }
      } else if (!this._.field) {
        this._.quoting = true;
        i++;
        continue;
      } else if ((this._.field != null) && !this.options.relax) {
        throw Error("Invalid opening quote at line " + (this.lines + 1));
      }
    }
    isRowDelimiter = this.options.rowDelimiter && this.options.rowDelimiter.some(function(rd) {
      return chars.substr(i, rd.length) === rd;
    });
    if (isRowDelimiter) {
      isRowDelimiterLength = this.options.rowDelimiter.filter(function(rd) {
        return chars.substr(i, rd.length) === rd;
      })[0].length;
    }
    if (isRowDelimiter || (end && i === l - 1)) {
      this.lines++;
    }
    wasCommenting = false;
    if (!this._.commenting && !this._.quoting && this.options.comment && chars.substr(i, this.options.comment.length) === this.options.comment) {
      this._.commenting = true;
    } else if (this._.commenting && isRowDelimiter) {
      wasCommenting = true;
      this._.commenting = false;
    }
    isDelimiter = chars.substr(i, this.options.delimiter.length) === this.options.delimiter;
    if (!this._.commenting && !this._.quoting && (isDelimiter || isRowDelimiter)) {
      if (isRowDelimiter && this._.line.length === 0 && (this._.field == null)) {
        if (wasCommenting || this.options.skip_empty_lines) {
          i += isRowDelimiterLength;
          this._.nextChar = chars.charAt(i);
          continue;
        }
      }
      if (rtrim) {
        if (!this._.closingQuote) {
          this._.field = (ref = this._.field) != null ? ref.trimRight() : void 0;
        }
      }
      this._.line.push(auto_parse(this._.field || ''));
      this._.closingQuote = 0;
      this._.field = null;
      if (isDelimiter) {
        i += this.options.delimiter.length;
        this._.nextChar = chars.charAt(i);
        if (end && !this._.nextChar) {
          isRowDelimiter = true;
          this._.line.push('');
        }
      }
      if (isRowDelimiter) {
        this.__push(this._.line);
        this._.line = [];
        i += isRowDelimiterLength;
        this._.nextChar = chars.charAt(i);
        continue;
      }
    } else if (!this._.commenting && !this._.quoting && (char === ' ' || char === '\t')) {
      if (this._.field == null) {
        this._.field = '';
      }
      if (!(ltrim && !this._.field)) {
        this._.field += char;
      }
      i++;
    } else if (!this._.commenting) {
      if (this._.field == null) {
        this._.field = '';
      }
      this._.field += char;
      i++;
    } else {
      i++;
    }
    if (!this._.commenting && ((ref1 = this._.field) != null ? ref1.length : void 0) > this.options.max_limit_on_data_read) {
      throw Error("Delimiter not found in the file " + (JSON.stringify(this.options.delimiter)));
    }
    if (!this._.commenting && ((ref2 = this._.line) != null ? ref2.length : void 0) > this.options.max_limit_on_data_read) {
      throw Error("Row delimiter not found in the file " + (JSON.stringify(this.options.rowDelimiter)));
    }
  }
  if (end) {
    if (this._.field != null) {
      if (rtrim) {
        if (!this._.closingQuote) {
          this._.field = (ref3 = this._.field) != null ? ref3.trimRight() : void 0;
        }
      }
      this._.line.push(auto_parse(this._.field || ''));
      this._.field = null;
    }
    if (((ref4 = this._.field) != null ? ref4.length : void 0) > this.options.max_limit_on_data_read) {
      throw Error("Delimiter not found in the file " + (JSON.stringify(this.options.delimiter)));
    }
    if (l === 0) {
      this.lines++;
    }
    if (this._.line.length > this.options.max_limit_on_data_read) {
      throw Error("Row delimiter not found in the file " + (JSON.stringify(this.options.rowDelimiter)));
    }
  }
  this._.buf = '';
  results = [];
  while (i < l) {
    this._.buf += chars.charAt(i);
    results.push(i++);
  }
  return results;
};

}).call(this,require('_process'),require("buffer").Buffer)

},{"_process":12,"buffer":4,"stream":27,"string_decoder":28,"util":32}],40:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.10.0
var Stringifier, get, stream, util;

stream = require('stream');

util = require('util');

get = require('lodash.get');

module.exports = function() {
  var callback, chunks, data, options, stringifier;
  if (arguments.length === 3) {
    data = arguments[0];
    options = arguments[1];
    callback = arguments[2];
  } else if (arguments.length === 2) {
    if (Array.isArray(arguments[0])) {
      data = arguments[0];
    } else {
      options = arguments[0];
    }
    if (typeof arguments[1] === 'function') {
      callback = arguments[1];
    } else {
      options = arguments[1];
    }
  } else if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      callback = arguments[0];
    } else if (Array.isArray(arguments[0])) {
      data = arguments[0];
    } else {
      options = arguments[0];
    }
  }
  if (options == null) {
    options = {};
  }
  stringifier = new Stringifier(options);
  if (data) {
    process.nextTick(function() {
      var d, j, len;
      for (j = 0, len = data.length; j < len; j++) {
        d = data[j];
        stringifier.write(d);
      }
      return stringifier.end();
    });
  }
  if (callback) {
    chunks = [];
    stringifier.on('readable', function() {
      var chunk, results;
      results = [];
      while (chunk = stringifier.read()) {
        results.push(chunks.push(chunk));
      }
      return results;
    });
    stringifier.on('error', function(err) {
      return callback(err);
    });
    stringifier.on('end', function() {
      return callback(null, chunks.join(''));
    });
  }
  return stringifier;
};

Stringifier = function(opts) {
  var base, base1, base10, base11, base12, base2, base3, base4, base5, base6, base7, base8, base9, k, options, v;
  if (opts == null) {
    opts = {};
  }
  options = {};
  for (k in opts) {
    v = opts[k];
    options[k] = v;
  }
  stream.Transform.call(this, options);
  this.options = options;
  if ((base = this.options).delimiter == null) {
    base.delimiter = ',';
  }
  if ((base1 = this.options).quote == null) {
    base1.quote = '"';
  }
  if ((base2 = this.options).quoted == null) {
    base2.quoted = false;
  }
  if ((base3 = this.options).quotedString == null) {
    base3.quotedString = false;
  }
  if ((base4 = this.options).eof == null) {
    base4.eof = true;
  }
  if ((base5 = this.options).escape == null) {
    base5.escape = '"';
  }
  if ((base6 = this.options).columns == null) {
    base6.columns = null;
  }
  if ((base7 = this.options).header == null) {
    base7.header = false;
  }
  if ((base8 = this.options).formatters == null) {
    base8.formatters = {};
  }
  if ((base9 = this.options.formatters).date == null) {
    base9.date = function(value) {
      return '' + value.getTime();
    };
  }
  if ((base10 = this.options.formatters).bool == null) {
    base10.bool = function(value) {
      if (value) {
        return '1';
      } else {
        return '';
      }
    };
  }
  if ((base11 = this.options.formatters).object == null) {
    base11.object = function(value) {
      return JSON.stringify(value);
    };
  }
  if ((base12 = this.options).rowDelimiter == null) {
    base12.rowDelimiter = '\n';
  }
  if (this.countWriten == null) {
    this.countWriten = 0;
  }
  switch (this.options.rowDelimiter) {
    case 'auto':
      this.options.rowDelimiter = null;
      break;
    case 'unix':
      this.options.rowDelimiter = "\n";
      break;
    case 'mac':
      this.options.rowDelimiter = "\r";
      break;
    case 'windows':
      this.options.rowDelimiter = "\r\n";
      break;
    case 'unicode':
      this.options.rowDelimiter = "\u2028";
  }
  return this;
};

util.inherits(Stringifier, stream.Transform);

module.exports.Stringifier = Stringifier;

Stringifier.prototype.headers = function() {
  var k, label, labels;
  if (!this.options.header) {
    return;
  }
  if (!this.options.columns) {
    return;
  }
  labels = this.options.columns;
  if (typeof labels === 'object') {
    labels = (function() {
      var results;
      results = [];
      for (k in labels) {
        label = labels[k];
        results.push(label);
      }
      return results;
    })();
  }
  if (this.options.eof) {
    labels = this.stringify(labels) + this.options.rowDelimiter;
  } else {
    labels = this.stringify(labels);
  }
  return stream.Transform.prototype.write.call(this, labels);
};

Stringifier.prototype.end = function(chunk, encoding, callback) {
  if (this.countWriten === 0) {
    this.headers();
  }
  return stream.Transform.prototype.end.apply(this, arguments);
};

Stringifier.prototype.write = function(chunk, encoding, callback) {
  var base, e, error, preserve;
  if (chunk == null) {
    return;
  }
  preserve = typeof chunk !== 'object';
  if (!preserve) {
    if (this.countWriten === 0 && !Array.isArray(chunk)) {
      if ((base = this.options).columns == null) {
        base.columns = Object.keys(chunk);
      }
    }
    try {
      this.emit('record', chunk, this.countWriten);
    } catch (error) {
      e = error;
      return this.emit('error', e);
    }
    if (this.options.eof) {
      chunk = this.stringify(chunk) + this.options.rowDelimiter;
    } else {
      chunk = this.stringify(chunk);
      if (this.options.header || this.countWriten) {
        chunk = this.options.rowDelimiter + chunk;
      }
    }
  }
  if (typeof chunk === 'number') {
    chunk = "" + chunk;
  }
  if (this.countWriten === 0) {
    this.headers();
  }
  if (!preserve) {
    this.countWriten++;
  }
  return stream.Transform.prototype.write.call(this, chunk, encoding, callback);
};

Stringifier.prototype._transform = function(chunk, encoding, callback) {
  this.push(chunk);
  return callback();
};

Stringifier.prototype.stringify = function(line) {
  var _line, column, columns, containsEscape, containsLinebreak, containsQuote, containsdelimiter, delimiter, escape, field, i, j, l, newLine, quote, ref, ref1, regexp, shouldQuote, value;
  if (typeof line !== 'object') {
    return line;
  }
  columns = this.options.columns;
  if (typeof columns === 'object' && columns !== null && !Array.isArray(columns)) {
    columns = Object.keys(columns);
  }
  delimiter = this.options.delimiter;
  quote = this.options.quote;
  escape = this.options.escape;
  if (!Array.isArray(line)) {
    _line = [];
    if (columns) {
      for (i = j = 0, ref = columns.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        column = columns[i];
        value = get(line, column);
        _line[i] = typeof value === 'undefined' || value === null ? '' : value;
      }
    } else {
      for (column in line) {
        _line.push(line[column]);
      }
    }
    line = _line;
    _line = null;
  } else if (columns) {
    line.splice(columns.length);
  }
  if (Array.isArray(line)) {
    newLine = '';
    for (i = l = 0, ref1 = line.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
      field = line[i];
      if (typeof field === 'string') {

      } else if (typeof field === 'number') {
        field = '' + field;
      } else if (typeof field === 'boolean') {
        field = this.options.formatters.bool(field);
      } else if (field instanceof Date) {
        field = this.options.formatters.date(field);
      } else if (typeof field === 'object' && field !== null) {
        field = this.options.formatters.object(field);
      }
      if (field) {
        containsdelimiter = field.indexOf(delimiter) >= 0;
        containsQuote = field.indexOf(quote) >= 0;
        containsEscape = field.indexOf(escape) >= 0 && (escape !== quote);
        containsLinebreak = field.indexOf('\r') >= 0 || field.indexOf('\n') >= 0;
        shouldQuote = containsQuote || containsdelimiter || containsLinebreak || this.options.quoted || (this.options.quotedString && typeof line[i] === 'string');
        if (shouldQuote && containsEscape) {
          regexp = escape === '\\' ? new RegExp(escape + escape, 'g') : new RegExp(escape, 'g');
          field = field.replace(regexp, escape + escape);
        }
        if (containsQuote) {
          regexp = new RegExp(quote, 'g');
          field = field.replace(regexp, escape + quote);
        }
        if (shouldQuote) {
          field = quote + field + quote;
        }
        newLine += field;
      } else if (this.options.quotedEmpty || ((this.options.quotedEmpty == null) && line[i] === '' && this.options.quotedString)) {
        newLine += quote + quote;
      }
      if (i !== line.length - 1) {
        newLine += delimiter;
      }
    }
    line = newLine;
  }
  return line;
};

}).call(this,require('_process'))

},{"_process":12,"lodash.get":45,"stream":27,"util":32}],41:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var generate, parse, stringify, transform;

generate = require('csv-generate');

parse = require('csv-parse');

transform = require('stream-transform');

stringify = require('csv-stringify');

module.exports.generate = generate;

module.exports.parse = parse;

module.exports.transform = transform;

module.exports.stringify = stringify;

},{"csv-generate":38,"csv-parse":39,"csv-stringify":40,"stream-transform":48}],42:[function(require,module,exports){
var clone = require('clone');

module.exports = function(options, defaults) {
  options = options || {};

  Object.keys(defaults).forEach(function(key) {
    if (typeof options[key] === 'undefined') {
      options[key] = clone(defaults[key]);
    }
  });

  return options;
};
},{"clone":37}],43:[function(require,module,exports){
'use strict';

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

module.exports = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe, '\\$&');
};

},{}],44:[function(require,module,exports){
'use strict';
var ansiRegex = require('ansi-regex');
var re = new RegExp(ansiRegex().source); // remove the `g` flag
module.exports = re.test.bind(re);

},{"ansi-regex":33}],45:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    symbolTag = '[object Symbol]';

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    reLeadingDot = /^\./,
    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol = root.Symbol,
    splice = arrayProto.splice;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map'),
    nativeCreate = getNative(Object, 'create');

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoize(function(string) {
  string = toString(string);

  var result = [];
  if (reLeadingDot.test(string)) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],46:[function(require,module,exports){
/*!
 * @name JavaScript/NodeJS Merge v1.2.0
 * @author yeikos
 * @repository https://github.com/yeikos/js.merge

 * Copyright 2014 yeikos - MIT license
 * https://raw.github.com/yeikos/js.merge/master/LICENSE
 */

;(function(isNode) {

	/**
	 * Merge one or more objects 
	 * @param bool? clone
	 * @param mixed,... arguments
	 * @return object
	 */

	var Public = function(clone) {

		return merge(clone === true, false, arguments);

	}, publicName = 'merge';

	/**
	 * Merge two or more objects recursively 
	 * @param bool? clone
	 * @param mixed,... arguments
	 * @return object
	 */

	Public.recursive = function(clone) {

		return merge(clone === true, true, arguments);

	};

	/**
	 * Clone the input removing any reference
	 * @param mixed input
	 * @return mixed
	 */

	Public.clone = function(input) {

		var output = input,
			type = typeOf(input),
			index, size;

		if (type === 'array') {

			output = [];
			size = input.length;

			for (index=0;index<size;++index)

				output[index] = Public.clone(input[index]);

		} else if (type === 'object') {

			output = {};

			for (index in input)

				output[index] = Public.clone(input[index]);

		}

		return output;

	};

	/**
	 * Merge two objects recursively
	 * @param mixed input
	 * @param mixed extend
	 * @return mixed
	 */

	function merge_recursive(base, extend) {

		if (typeOf(base) !== 'object')

			return extend;

		for (var key in extend) {

			if (typeOf(base[key]) === 'object' && typeOf(extend[key]) === 'object') {

				base[key] = merge_recursive(base[key], extend[key]);

			} else {

				base[key] = extend[key];

			}

		}

		return base;

	}

	/**
	 * Merge two or more objects
	 * @param bool clone
	 * @param bool recursive
	 * @param array argv
	 * @return object
	 */

	function merge(clone, recursive, argv) {

		var result = argv[0],
			size = argv.length;

		if (clone || typeOf(result) !== 'object')

			result = {};

		for (var index=0;index<size;++index) {

			var item = argv[index],

				type = typeOf(item);

			if (type !== 'object') continue;

			for (var key in item) {

				var sitem = clone ? Public.clone(item[key]) : item[key];

				if (recursive) {

					result[key] = merge_recursive(result[key], sitem);

				} else {

					result[key] = sitem;

				}

			}

		}

		return result;

	}

	/**
	 * Get type of variable
	 * @param mixed input
	 * @return string
	 *
	 * @see http://jsperf.com/typeofvar
	 */

	function typeOf(input) {

		return ({}).toString.call(input).slice(8, -1).toLowerCase();

	}

	if (isNode) {

		module.exports = Public;

	} else {

		window[publicName] = Public;

	}

})(typeof module === 'object' && module && typeof module.exports === 'object' && module.exports);
},{}],47:[function(require,module,exports){
'use strict';

function smartWrap(text,options){

  options = options || {};
  let Merge = require('merge');
  let Wcwidth = require('wcwidth');
  let Breakword = require('breakword');
  
  let defaults = {};
  defaults.calculateSpaceRemaining = function(obj,i){//i is in case someone wants to customize based on line index
    return Math.max(obj.lineLength - obj.spacesUsed - obj.paddingLeft - obj.paddingRight,0);
  }; //function to set starting line length
  defaults.currentLine = 0; //index of current line in 'lines[]'
  defaults.input = []; //input string split by whitespace 
  defaults.lines = [
    []
  ]; //assume at least one line
  defaults.minWidth = 2; //fallback to if width set too narrow
  defaults.paddingLeft = 0;
  defaults.paddingRight = 0;
  defaults.returnFormat = 'string'; //or 'array'
  defaults.skipPadding = false; //set to true when padding set too wide for line length
  defaults.spacesUsed = 0; //spaces used so far on current line
  defaults.splitAt = [" ","\t"];
  defaults.trim = true;
  defaults.width = 10; 
  defaults.words = [];
  
  let wrapObj = Merge({},defaults,options);

  //make sure correct sign on padding
  wrapObj.paddingLeft = Math.abs(wrapObj.paddingLeft);
  wrapObj.paddingRight = Math.abs(wrapObj.paddingRight);

  wrapObj.lineLength = wrapObj.width -
   wrapObj.paddingLeft -
   wrapObj.paddingRight;
  
  if(wrapObj.lineLength < wrapObj.minWidth){
    //skip padding if lineLength too narrow
    wrapObj.skipPadding = true;
    wrapObj.lineLength = wrapObj.minWidth;
  }
  else{
    //resize line length to include padding
    wrapObj.lineLength = wrapObj.lineLength;
  }
  //Break input into array of characters split by whitespace and/or tabs
  let unfilteredWords = [];

  //to trim or not to trim...
  let modifiedText = text.toString();
  if(wrapObj.trim){
    modifiedText = modifiedText.trim();
  }
  
  if(wrapObj.splitAt.indexOf('\t')!==-1){
    //split at both spaces and tabs
    unfilteredWords = modifiedText.split(/ |\t/i);
  }
  else{
    //split at whitespace
    unfilteredWords = modifiedText.split(' ');
  }
  
  //remove empty array elements
  unfilteredWords.forEach(function(val){
    if (val.length > 0){
      wrapObj.words.push(val);
    }
  });

  let i,
      spaceRemaining,
      splitIndex,
      word,
      wordlength;

  while(wrapObj.words.length > 0){
    spaceRemaining = wrapObj.calculateSpaceRemaining(wrapObj);
    word = wrapObj.words.shift();
    wordlength = Wcwidth(word);
    
    switch(true){
      //1- Word is too long for an empty line and must be broken
      case(wrapObj.lineLength < wordlength):
        //Break it, then re-insert its parts into wrapObj.words
        //so can loop back to re-handle each word
        splitIndex = Breakword(word,wrapObj.lineLength);
        wrapObj.words.unshift(word.substr(0,splitIndex + 1)); //+1 for substr fn
        wrapObj.words.splice(1,0,word.substr(splitIndex + 1));//+1 for substr fn
        break;

      //2- Word is too long for current line and must be wrapped
      case(spaceRemaining < wordlength):
        //add a new line to our array of lines
        wrapObj.lines.push([]);
        //note carriage to new line in counter
        wrapObj.currentLine++;
        //reset the spacesUsed to 0
        wrapObj.spacesUsed = 0;
        /* falls through */

      //3- Word fits on current line
      default:
        //add word to line
        wrapObj.lines[wrapObj.currentLine].push(word);
        //reduce space remaining (add a space between words)
        wrapObj.spacesUsed += wordlength + 1;
        //increment iterator
        i++;
    }
  }

  if(wrapObj.returnFormat === 'array'){
    return wrapObj.lines;
  }
  else{
    let lines = wrapObj.lines.map(function(line){
      //restore spaces to line
      line = line.join('\ ');
      //add padding to ends of line
      if(!wrapObj.skipPadding){
        line = Array(wrapObj.paddingLeft+1).join('\ ') +
             line +
             Array(wrapObj.paddingRight+1).join('\ ');
      }
      return line;
    });
    //return as string
    return lines.join('\n');  
  }
}

module.exports = smartWrap;

},{"breakword":35,"merge":46,"wcwidth":53}],48:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.9.2
var Transformer, stream, util,
  slice = [].slice;

stream = require('stream');

util = require('util');

module.exports = function() {
  var argument, callback, data, error, handler, i, j, k, len, options, result, transform, type, v;
  options = {};
  for (i = j = 0, len = arguments.length; j < len; i = ++j) {
    argument = arguments[i];
    type = typeof argument;
    if (argument === null) {
      type = 'null';
    } else if (type === 'object' && Array.isArray(argument)) {
      type = 'array';
    }
    if (i === 0) {
      if (type === 'function') {
        handler = argument;
      } else if (type !== null) {
        data = argument;
      }
      continue;
    }
    if (type === 'object') {
      for (k in argument) {
        v = argument[k];
        options[k] = v;
      }
    } else if (type === 'function') {
      if (handler && i === arguments.length - 1) {
        callback = argument;
      } else {
        handler = argument;
      }
    } else if (type !== 'null') {
      throw new Error('Invalid arguments');
    }
  }
  transform = new Transformer(options, handler);
  error = false;
  if (data) {
    process.nextTick(function() {
      var len1, m, row;
      for (m = 0, len1 = data.length; m < len1; m++) {
        row = data[m];
        if (error) {
          break;
        }
        transform.write(row);
      }
      return transform.end();
    });
  }
  if (callback || options.consume) {
    result = [];
    transform.on('readable', function() {
      var r, results;
      results = [];
      while ((r = transform.read())) {
        if (callback) {
          results.push(result.push(r));
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
    transform.on('error', function(err) {
      error = true;
      if (callback) {
        return callback(err);
      }
    });
    transform.on('end', function() {
      if (callback && !error) {
        return callback(null, result);
      }
    });
  }
  return transform;
};

Transformer = function(options1, transform1) {
  var base;
  this.options = options1 != null ? options1 : {};
  this.transform = transform1;
  this.options.objectMode = true;
  if ((base = this.options).parallel == null) {
    base.parallel = 100;
  }
  stream.Transform.call(this, this.options);
  this.running = 0;
  this.started = 0;
  this.finished = 0;
  return this;
};

util.inherits(Transformer, stream.Transform);

module.exports.Transformer = Transformer;

Transformer.prototype._transform = function(chunk, encoding, cb) {
  var callback, err, l;
  this.started++;
  this.running++;
  if (this.running < this.options.parallel) {
    cb();
    cb = null;
  }
  try {
    l = this.transform.length;
    if (this.options.params != null) {
      l--;
    }
    if (l === 1) {
      this._done(null, [this.transform.call(null, chunk, this.options.params)], cb);
    } else if (l === 2) {
      callback = (function(_this) {
        return function() {
          var chunks, err;
          err = arguments[0], chunks = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          return _this._done(err, chunks, cb);
        };
      })(this);
      this.transform.call(null, chunk, callback, this.options.params);
    } else {
      throw Error("Invalid handler arguments");
    }
    return false;
  } catch (_error) {
    err = _error;
    return this._done(err);
  }
};

Transformer.prototype._flush = function(cb) {
  this._ending = function() {
    if (this.running === 0) {
      return cb();
    }
  };
  return this._ending();
};

Transformer.prototype._done = function(err, chunks, cb) {
  var chunk, j, len;
  this.running--;
  if (err) {
    return this.emit('error', err);
  }
  this.finished++;
  for (j = 0, len = chunks.length; j < len; j++) {
    chunk = chunks[j];
    if (typeof chunk === 'number') {
      chunk = "" + chunk;
    }
    if (chunk != null) {
      this.push(chunk);
    }
  }
  if (cb) {
    cb();
  }
  if (this._ending) {
    return this._ending();
  }
};

}).call(this,require('_process'))

},{"_process":12,"stream":27,"util":32}],49:[function(require,module,exports){
'use strict';
var ansiRegex = require('ansi-regex')();

module.exports = function (str) {
	return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
};

},{"ansi-regex":33}],50:[function(require,module,exports){
(function (process){
'use strict';
var argv = process.argv;

var terminator = argv.indexOf('--');
var hasFlag = function (flag) {
	flag = '--' + flag;
	var pos = argv.indexOf(flag);
	return pos !== -1 && (terminator !== -1 ? pos < terminator : true);
};

module.exports = (function () {
	if ('FORCE_COLOR' in process.env) {
		return true;
	}

	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false')) {
		return false;
	}

	if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		return true;
	}

	if (process.stdout && !process.stdout.isTTY) {
		return false;
	}

	if (process.platform === 'win32') {
		return true;
	}

	if ('COLORTERM' in process.env) {
		return true;
	}

	if (process.env.TERM === 'dumb') {
		return false;
	}

	if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
		return true;
	}

	return false;
})();

}).call(this,require('_process'))

},{"_process":12}],51:[function(require,module,exports){
var module = require('module')
module.wrapper[0] += '"use strict";'
Object.freeze(module.wrap)

},{"module":1}],52:[function(require,module,exports){
module.exports = [
    [ 0x0300, 0x036F ], [ 0x0483, 0x0486 ], [ 0x0488, 0x0489 ],
    [ 0x0591, 0x05BD ], [ 0x05BF, 0x05BF ], [ 0x05C1, 0x05C2 ],
    [ 0x05C4, 0x05C5 ], [ 0x05C7, 0x05C7 ], [ 0x0600, 0x0603 ],
    [ 0x0610, 0x0615 ], [ 0x064B, 0x065E ], [ 0x0670, 0x0670 ],
    [ 0x06D6, 0x06E4 ], [ 0x06E7, 0x06E8 ], [ 0x06EA, 0x06ED ],
    [ 0x070F, 0x070F ], [ 0x0711, 0x0711 ], [ 0x0730, 0x074A ],
    [ 0x07A6, 0x07B0 ], [ 0x07EB, 0x07F3 ], [ 0x0901, 0x0902 ],
    [ 0x093C, 0x093C ], [ 0x0941, 0x0948 ], [ 0x094D, 0x094D ],
    [ 0x0951, 0x0954 ], [ 0x0962, 0x0963 ], [ 0x0981, 0x0981 ],
    [ 0x09BC, 0x09BC ], [ 0x09C1, 0x09C4 ], [ 0x09CD, 0x09CD ],
    [ 0x09E2, 0x09E3 ], [ 0x0A01, 0x0A02 ], [ 0x0A3C, 0x0A3C ],
    [ 0x0A41, 0x0A42 ], [ 0x0A47, 0x0A48 ], [ 0x0A4B, 0x0A4D ],
    [ 0x0A70, 0x0A71 ], [ 0x0A81, 0x0A82 ], [ 0x0ABC, 0x0ABC ],
    [ 0x0AC1, 0x0AC5 ], [ 0x0AC7, 0x0AC8 ], [ 0x0ACD, 0x0ACD ],
    [ 0x0AE2, 0x0AE3 ], [ 0x0B01, 0x0B01 ], [ 0x0B3C, 0x0B3C ],
    [ 0x0B3F, 0x0B3F ], [ 0x0B41, 0x0B43 ], [ 0x0B4D, 0x0B4D ],
    [ 0x0B56, 0x0B56 ], [ 0x0B82, 0x0B82 ], [ 0x0BC0, 0x0BC0 ],
    [ 0x0BCD, 0x0BCD ], [ 0x0C3E, 0x0C40 ], [ 0x0C46, 0x0C48 ],
    [ 0x0C4A, 0x0C4D ], [ 0x0C55, 0x0C56 ], [ 0x0CBC, 0x0CBC ],
    [ 0x0CBF, 0x0CBF ], [ 0x0CC6, 0x0CC6 ], [ 0x0CCC, 0x0CCD ],
    [ 0x0CE2, 0x0CE3 ], [ 0x0D41, 0x0D43 ], [ 0x0D4D, 0x0D4D ],
    [ 0x0DCA, 0x0DCA ], [ 0x0DD2, 0x0DD4 ], [ 0x0DD6, 0x0DD6 ],
    [ 0x0E31, 0x0E31 ], [ 0x0E34, 0x0E3A ], [ 0x0E47, 0x0E4E ],
    [ 0x0EB1, 0x0EB1 ], [ 0x0EB4, 0x0EB9 ], [ 0x0EBB, 0x0EBC ],
    [ 0x0EC8, 0x0ECD ], [ 0x0F18, 0x0F19 ], [ 0x0F35, 0x0F35 ],
    [ 0x0F37, 0x0F37 ], [ 0x0F39, 0x0F39 ], [ 0x0F71, 0x0F7E ],
    [ 0x0F80, 0x0F84 ], [ 0x0F86, 0x0F87 ], [ 0x0F90, 0x0F97 ],
    [ 0x0F99, 0x0FBC ], [ 0x0FC6, 0x0FC6 ], [ 0x102D, 0x1030 ],
    [ 0x1032, 0x1032 ], [ 0x1036, 0x1037 ], [ 0x1039, 0x1039 ],
    [ 0x1058, 0x1059 ], [ 0x1160, 0x11FF ], [ 0x135F, 0x135F ],
    [ 0x1712, 0x1714 ], [ 0x1732, 0x1734 ], [ 0x1752, 0x1753 ],
    [ 0x1772, 0x1773 ], [ 0x17B4, 0x17B5 ], [ 0x17B7, 0x17BD ],
    [ 0x17C6, 0x17C6 ], [ 0x17C9, 0x17D3 ], [ 0x17DD, 0x17DD ],
    [ 0x180B, 0x180D ], [ 0x18A9, 0x18A9 ], [ 0x1920, 0x1922 ],
    [ 0x1927, 0x1928 ], [ 0x1932, 0x1932 ], [ 0x1939, 0x193B ],
    [ 0x1A17, 0x1A18 ], [ 0x1B00, 0x1B03 ], [ 0x1B34, 0x1B34 ],
    [ 0x1B36, 0x1B3A ], [ 0x1B3C, 0x1B3C ], [ 0x1B42, 0x1B42 ],
    [ 0x1B6B, 0x1B73 ], [ 0x1DC0, 0x1DCA ], [ 0x1DFE, 0x1DFF ],
    [ 0x200B, 0x200F ], [ 0x202A, 0x202E ], [ 0x2060, 0x2063 ],
    [ 0x206A, 0x206F ], [ 0x20D0, 0x20EF ], [ 0x302A, 0x302F ],
    [ 0x3099, 0x309A ], [ 0xA806, 0xA806 ], [ 0xA80B, 0xA80B ],
    [ 0xA825, 0xA826 ], [ 0xFB1E, 0xFB1E ], [ 0xFE00, 0xFE0F ],
    [ 0xFE20, 0xFE23 ], [ 0xFEFF, 0xFEFF ], [ 0xFFF9, 0xFFFB ],
    [ 0x10A01, 0x10A03 ], [ 0x10A05, 0x10A06 ], [ 0x10A0C, 0x10A0F ],
    [ 0x10A38, 0x10A3A ], [ 0x10A3F, 0x10A3F ], [ 0x1D167, 0x1D169 ],
    [ 0x1D173, 0x1D182 ], [ 0x1D185, 0x1D18B ], [ 0x1D1AA, 0x1D1AD ],
    [ 0x1D242, 0x1D244 ], [ 0xE0001, 0xE0001 ], [ 0xE0020, 0xE007F ],
    [ 0xE0100, 0xE01EF ]
]

},{}],53:[function(require,module,exports){
"use strict"

var defaults = require('defaults')
var combining = require('./combining')

var DEFAULTS = {
  nul: 0,
  control: 0
}

module.exports = function wcwidth(str) {
  return wcswidth(str, DEFAULTS)
}

module.exports.config = function(opts) {
  opts = defaults(opts || {}, DEFAULTS)
  return function wcwidth(str) {
    return wcswidth(str, opts)
  }
}

/*
 *  The following functions define the column width of an ISO 10646
 *  character as follows:
 *  - The null character (U+0000) has a column width of 0.
 *  - Other C0/C1 control characters and DEL will lead to a return value
 *    of -1.
 *  - Non-spacing and enclosing combining characters (general category
 *    code Mn or Me in the
 *    Unicode database) have a column width of 0.
 *  - SOFT HYPHEN (U+00AD) has a column width of 1.
 *  - Other format characters (general category code Cf in the Unicode
 *    database) and ZERO WIDTH
 *    SPACE (U+200B) have a column width of 0.
 *  - Hangul Jamo medial vowels and final consonants (U+1160-U+11FF)
 *    have a column width of 0.
 *  - Spacing characters in the East Asian Wide (W) or East Asian
 *    Full-width (F) category as
 *    defined in Unicode Technical Report #11 have a column width of 2.
 *  - All remaining characters (including all printable ISO 8859-1 and
 *    WGL4 characters, Unicode control characters, etc.) have a column
 *    width of 1.
 *  This implementation assumes that characters are encoded in ISO 10646.
*/

function wcswidth(str, opts) {
  if (typeof str !== 'string') return wcwidth(str, opts)

  var s = 0
  for (var i = 0; i < str.length; i++) {
    var n = wcwidth(str.charCodeAt(i), opts)
    if (n < 0) return -1
    s += n
  }

  return s
}

function wcwidth(ucs, opts) {
  // test for 8-bit control characters
  if (ucs === 0) return opts.nul
  if (ucs < 32 || (ucs >= 0x7f && ucs < 0xa0)) return opts.control

  // binary search in table of non-spacing characters
  if (bisearch(ucs)) return 0

  // if we arrive here, ucs is not a combining or C0/C1 control character
  return 1 +
      (ucs >= 0x1100 &&
       (ucs <= 0x115f ||                       // Hangul Jamo init. consonants
        ucs == 0x2329 || ucs == 0x232a ||
        (ucs >= 0x2e80 && ucs <= 0xa4cf &&
         ucs != 0x303f) ||                     // CJK ... Yi
        (ucs >= 0xac00 && ucs <= 0xd7a3) ||    // Hangul Syllables
        (ucs >= 0xf900 && ucs <= 0xfaff) ||    // CJK Compatibility Ideographs
        (ucs >= 0xfe10 && ucs <= 0xfe19) ||    // Vertical forms
        (ucs >= 0xfe30 && ucs <= 0xfe6f) ||    // CJK Compatibility Forms
        (ucs >= 0xff00 && ucs <= 0xff60) ||    // Fullwidth Forms
        (ucs >= 0xffe0 && ucs <= 0xffe6) ||
        (ucs >= 0x20000 && ucs <= 0x2fffd) ||
        (ucs >= 0x30000 && ucs <= 0x3fffd)));
}

function bisearch(ucs) {
  var min = 0
  var max = combining.length - 1
  var mid

  if (ucs < combining[0][0] || ucs > combining[max][1]) return false

  while (max >= min) {
    mid = Math.floor((min + max) / 2)
    if (ucs > combining[mid][1]) min = mid + 1
    else if (ucs < combining[mid][0]) max = mid - 1
    else return true
  }

  return false
}

},{"./combining":52,"defaults":42}],54:[function(require,module,exports){
"use strict";var Config={borderCharacters:[[{v:" ",l:" ",j:" ",h:" ",r:" "},{v:" ",l:" ",j:" ",h:" ",r:" "},{v:" ",l:" ",j:" ",h:" ",r:" "}],[{v:"\u2502",l:"\u250C",j:"\u252C",h:"\u2500",r:"\u2510"},{v:"\u2502",l:"\u251C",j:"\u253C",h:"\u2500",r:"\u2524"},{v:"\u2502",l:"\u2514",j:"\u2534",h:"\u2500",r:"\u2518"}],[{v:"|",l:"+",j:"+",h:"-",r:"+"},{v:"|",l:"+",j:"+",h:"-",r:"+"},{v:"|",l:"+",j:"+",h:"-",r:"+"}]],align:"center",borderColor:null,borderStyle:1,color:!1,compact:!1,defaultErrorValue:"\x1B[32m\x1B[37m\x1B[41m ERROR!  \x1B[49m\x1B[32m\x1B[39m",defaultValue:"\x1B[32m\x1B[37m\x1B[41m ?  \x1B[49m\x1B[32m\x1B[39m",errorOnNull:!1,footerAlign:"center",footerColor:!1,formatter:null,headerAlign:"center",headerColor:"yellow",marginLeft:2,marginTop:1,paddingBottom:0,paddingLeft:0,paddingRight:0,paddingTop:0,tableType:null,truncate:!1,width:20};Config.GUTTER=1,Config.columnSettings=[],Config.headerEmpty=!1,Config.table={body:"",columnInnerWidths:[],columnWidths:[],columns:[],footer:"",header:"",height:0,typeLocked:!1},module.exports=Config;

},{}],55:[function(require,module,exports){
'use strict';var Public=require('./public.js');module.exports=function(){return Public.setup}();

},{"./public.js":57}],56:[function(require,module,exports){
(function (process){
"use strict";var _Mathfloor=Math.floor,_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},Wrap=require("smartwrap"),Wcwidth=require("wcwidth"),Format={};Format.calculateLength=function(a){return Wcwidth(a)},Format.wrapCellContent=function(a,b,c,d,e){var f=b.toString(),g=/^(\033\[[0-9;]*m)+/,h=f.match(g)||[""];f=f.replace(g,"");var j=/(\033\[[0-9;]*m)+$/,k=f.match(j)||[""];f=f.replace(j,"");var l="header"===e?"headerAlign":"body"===e?"align":"footerAlign";"center"===d[l]&&(d.paddingLeft=d.paddingRight=Math.max(d.paddingRight,d.paddingLeft,0));var m=a.table.columnWidths[c],n=m-d.paddingLeft-d.paddingRight-a.GUTTER;switch(!0){case"string"==typeof a.truncate&&0<a.truncate.length:f=Format.handleTruncatedValue(f,d,n);break;case f.length<Format.calculateLength(f):f=Format.handleAsianChars(f,d,n);break;default:f=Format.handleLatinChars(f,d,n);}var o=f.split("\n");return o=o.map(function(p){p=p.trim();var q=Format.calculateLength(p);if(q<m){var r=m-q;switch(!0){case"center"===d[l]:r--;var s=_Mathfloor(r/2),t=r%2;p=Array(s+1).join(" ")+p+Array(s+1+t).join(" ");break;case"right"===d[l]:p=Array(r-d.paddingRight).join(" ")+p+Array(d.paddingRight+1).join(" ");break;default:p=Array(d.paddingLeft+1).join(" ")+p+Array(r-d.paddingLeft).join(" ");}}return p=h[0]+p,p+=k[0],p}),{output:o,width:n}},Format.handleTruncatedValue=function(a,b,c){var d=a;return c<d.length&&(d=d.substring(0,c-b.truncate.length),d+=b.truncate),d},Format.handleAsianChars=function(a,b,c){var d=0,e=0,f=a.split(""),g=f.reduce(function(h,j,k){return d+=Format.calculateLength(j),d>c?(h.push(a.slice(e,k)),e=k,d=0):f.length===k+1&&h.push(a.slice(e)),h},[]).join("\n");return g},Format.handleLatinChars=function(a,b,c){var d=c-b.paddingLeft-b.paddingRight,e=Wrap(a,{width:d,trim:!0});return e},Format.getColumnWidths=function(a,b){var d,c=[];if(a.table.header[0]&&0<a.table.header[0].length)d=a.table.header[0];else if(0<b.length)d=b[0];else return[];c=d.map(function(f){return"object"===("undefined"==typeof f?"undefined":_typeof(f))&&"undefined"!=typeof f.width?f.width:a.width});var e=c.reduce(function(f,g){return f+g});if(e+=a.marginLeft,process&&process.stdout&&e>process.stdout.columns){var f=process.stdout.columns/e;f=f.toFixed(2)-0.01,c=c.map(function(g){return _Mathfloor(f*g)})}return c},module.exports=Format;

}).call(this,require('_process'))

},{"_process":12,"smartwrap":47,"wcwidth":53}],57:[function(require,module,exports){
'use strict';var _typeof='function'==typeof Symbol&&'symbol'==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&'function'==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?'symbol':typeof a},Merge=require('merge'),Render=require('./render.js'),Cls=Object.create(Array.prototype),Config=void 0;Cls.setup=function(){if(1===Object.keys(arguments).length&&'string'==typeof arguments[0])return require('../'+arguments[0]);Config=require('./config.js');var a='object'===_typeof(arguments[3])?arguments[3]:'object'===_typeof(arguments[2])?arguments[2]:{};if(Config=Merge(!0,Config,a),Config.align=Config.alignment||Config.align,Config.headerAlign=Config.headerAlignment||Config.headerAlign,arguments[0]&&arguments[0]instanceof Array&&arguments[0].length?Config.table.header=arguments[0]:(Config.table.header=[],Config.headerEmpty=!0),Config.columnSettings=Config.table.header.slice(0),null!==Config.borderColor){var b=require('chalk');Config.borderCharacters[Config.borderStyle]=Config.borderCharacters[Config.borderStyle].map(function(c){return Object.keys(c).forEach(function(d){c[d]=b[Config.borderColor](c[d])}),c})}return Config.table.header=[Config.table.header],arguments[1]&&arguments[1]instanceof Array&&arguments[1].forEach(function(b){Cls.push(b)}),Config.table.footer=arguments[2]instanceof Array?arguments[2]:[],Cls},Cls.render=function(){var a=Render.stringifyData.call(this,Config,this);return a},module.exports=Cls;

},{"./config.js":54,"./render.js":58,"chalk":36,"merge":46}],58:[function(require,module,exports){
"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(d){return typeof d}:function(d){return d&&"function"==typeof Symbol&&d.constructor===Symbol&&d!==Symbol.prototype?"symbol":typeof d},Merge=require("merge"),Style=require("./style.js"),Format=require("./format.js"),Render={};Render.stringifyData=function(d,e){var f={header:[],body:[],footer:[]},g="",h=Array(d.marginLeft+1).join(" "),j=d.borderCharacters[d.borderStyle],k=[];d.rowFormat=Render.getRowFormat(e[0]||[]),e=Render.transformRows(d,e),d.table.columnWidths=Format.getColumnWidths(d,e),f.header=d.headerEmpty?[]:d.table.header.map(function(o){return Render.buildRow(d,o,"header")}),f.body=e.map(function(o){return Render.buildRow(d,o,"body")}),f.footer=d.table.footer instanceof Array&&0<d.table.footer.length?[d.table.footer]:[],f.footer=f.footer.map(function(o){return Render.buildRow(d,o,"footer")});for(var l=function _loop(o){k.push(""),d.table.columnWidths.forEach(function(q,r,s){k[o]+=Array(q).join(j[o].h)+(r+1===s.length?j[o].r:j[o].j)}),k[o]=j[o].l+k[o],k[o]=k[o].split(""),k[o][k[o].length1]=j[o].r,k[o]=k[o].join(""),k[o]=2>o?h+k[o]+"\n":h+k[o]},o=0;3>o;o++)l(o);g+=k[0];var m;Object.keys(f).forEach(function(o,q){for(;f[o].length;)switch(m=f[o].shift(),m.forEach(function(r){g=g+h+j[1].v+r.join(j[1].v)+j[1].v+"\n"}),!0){case 0===f[o].length&&1===q&&0===f.footer.length:break;case 0===f[o].length&&2===q:break;case d.compact&&"body"===o&&!m.empty:break;default:g+=k[1];}}),g+=k[2],this.splice(0,this.length);var n=Array(d.marginTop+1).join("\n")+g;return this.height=n.split(/\r\n|\r|\n/).length,n},Render.buildRow=function(d,e,f){var g=0;if(0===e.length&&d.compact)return e.empty=!0,e;var h=d.table.columnWidths.length-e.length;0<h?e=e.concat(Array.apply(null,Array(h)).map(function(){return null})):0>h&&(e.length=d.table.columnWidths.length);for(var j=[],k=e.length,m=0;m<k;m++){var n=Render.buildCell(d,e[m],m,f),o=n.cellArr;"header"===f&&d.table.columnInnerWidths.push(n.width),g=g<o.length?o.length:g,j.push(o)}g="header"===f?g:g+(d.paddingBottom+d.paddingTop);var l=Array.apply(null,{length:g}).map(Function.call,function(){return[]});return j.forEach(function(m,n){var o=Array(d.table.columnWidths[n]).join(" ");if("body"===f){for(var q=0;q<d.paddingTop;q++)m.unshift(o);for(var q=0;q<d.paddingBottom;q++)m.push(o)}for(var q=0;q<g;q++)l[q].push("undefined"==typeof m[q]?o:m[q])}),l},Render.buildCell=function(d,e,f,g){var h,j=Merge(!0,d,"body"===g?d.columnSettings[f]:{},e);if("header"===g)d.table.columns.push(j),h=j.alias||j.value||"";else{switch(!0){case"undefined"==typeof e||null===e:h=d.errorOnNull?d.defaultErrorValue:d.defaultValue;break;case"object"===("undefined"==typeof e?"undefined":_typeof(e))&&"undefined"!=typeof e.value:h=e.value;break;default:h=e;}"function"==typeof j.formatter&&(h=j.formatter(h))}h=Style.colorizeCell(h,j,g);var k=Format.wrapCellContent(d,h,f,j,g);return{cellArr:k.output,width:k.width}},Render.getRowFormat=function(d){var e;if("object"===("undefined"==typeof d?"undefined":_typeof(d))&&!(d instanceof Array)){var f=Object.keys(d);if(1===f.length){var g=f[0];e=d[g]instanceof Array?"automattic-cross":"automattic-vertical"}else e="o-horizontal"}else e="a-horizontal";return e},Render.verticalizeMatrix=function(d,e){var f=[],g=d.table.columns;return g.forEach(function(h){f.push([h])}),e.forEach(function(h){h.forEach(function(j,k){f[k].push(j)})}),f},Render.transformRows=function(d,e){var f=[];switch(d.rowFormat){case"automattic-cross":d.columnSettings[0]=d.columnSettings[0]||{},d.columnSettings[0].color=d.headerColor,f=e.map(function(g){var h=[],j=Object.keys(g)[0];return h.push(j),h.concat(g[j])});break;case"automattic-vertical":d.columnSettings[0]=d.columnSettings[0]||{},d.columnSettings[0].color=d.headerColor,f=e.map(function(g){var h=Object.keys(g)[0];return[h,g[h]]});break;case"o-horizontal":f=e.map(function(g){return d.table.header[0].map(function(h){return g[h.value]||null})});break;case"a-horizontal":f=e;break;default:}return f},module.exports=Render;

},{"./format.js":56,"./style.js":59,"merge":46}],59:[function(require,module,exports){
'use strict';var Chalk=require('chalk');exports.colorizeCell=function(a,b,c){var d=!1;switch(!0){case'body'===c:d=b.color||d;break;case'header'===c:d=b.headerColor||d;break;default:d=b.footerColor||d;}return d&&(a=Chalk[d](a)),a};

},{"chalk":36}],60:[function(require,module,exports){
(function (process,__dirname){

'use strict';var csv=require('csv'),yargs=require('yargs');yargs.epilog('Copyight github.com/tecfu 2017'),yargs.option('csv-delimiter',{describe:'Set the field delimiter. One character only.',default:','}),yargs.option('csv-escape',{describe:'Set the escape character. One character only.'}),yargs.option('csv-rowDelimiter',{describe:'String used to delimit record rows. You can also use a special constant: "auto","unix","max","windows","unicode".',default:'\n'}),yargs.option('format',{describe:'Set input data format',choices:['json','csv'],default:'csv'}),yargs.option('options\u2010*',{describe:'Specify an optional setting where * is the setting name. See README.md for a complete list.'}),yargs.version(function(){var a=require('fs'),b=__dirname+'/../package.json',c=a.readFileSync(b,'utf-8'),d=JSON.parse(c);return d.version});var Chalk=require('chalk'),sendError=function(a){a='\ntty-table error: '+a+'\n',console.log(a),process.exit(1)},alreadyRendered=!1,previousHeight=0,dataFormat='csv';switch(!0){case'undefined'==typeof yargs.argv.format:break;case null!==yargs.argv.format.toString().match(/json/i):dataFormat='json';break;default:}var options={};Object.keys(yargs.argv).forEach(function(a){var b=a.split('-');'options'===b[0]&&(options[b[1]]=yargs.argv[a])});var runTable=function(a){var d=require('./public.js'),f=d.setup([],a,options);console.log('\x1B[?25l'),alreadyRendered?(console.log('\x1B['+(previousHeight+3)+'A'),console.log('\x1B[0J')):alreadyRendered=!0,console.log(f.render()),previousHeight=f.height};if(process.stdin.resume(),process.stdin.setEncoding('utf8'),process.stdin.on('data',function(a){switch(!0){case'json'==dataFormat:var b,c;try{b=JSON.parse(a)}catch(f){c=Chalk.bgRed.white(c),c+='\n\nPlease check to make sure that your input data consists of JSON or specify a different format with the --format flag.',sendError(c)}runTable(b);break;default:var d={};Object.keys(yargs.argv).forEach(function(f){'csv-'===f.slice(0,4)&&'undefined'!=typeof yargs.argv[f]&&(d[f.slice(4)]=yargs.argv[f])}),csv.parse(a,d,function(f,g){if('undefined'==typeof g){var h='CSV parse error.';h=Chalk.bgRed.white(h),h=h+'\n\n'+f,h=h+'\n\nPlease check to make sure that your input data consists of valid comma separated values or specify a different format with the --format flag.',sendError(h)}runTable(g)});}}),'win32'===process.platform){var a=require('readline').createInterface({input:process.stdin,output:process.stdout});a.on('SIGINT',function(){process.emit('SIGINT')})}process.on('SIGINT',function(){process.exit()}),process.on('exit',function(){console.log('\x1B[?25h')}),yargs.argv=yargs.help('h').argv;

}).call(this,require('_process'),"/src")

},{"./public.js":57,"_process":12,"chalk":36,"csv":41,"fs":1,"readline":1,"yargs":1}]},{},[])("/src/main.js")
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjguMS4zL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92OC4xLjMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIuLi8uLi8uLi9ob21lL2Jhc2UvLm52bS92ZXJzaW9ucy9ub2RlL3Y4LjEuMy9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9pbmRleC5qcyIsIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjguMS4zL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92OC4xLjMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9jb3JlLXV0aWwtaXMvbGliL3V0aWwuanMiLCIuLi8uLi8uLi9ob21lL2Jhc2UvLm52bS92ZXJzaW9ucy9ub2RlL3Y4LjEuMy9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCIuLi8uLi8uLi9ob21lL2Jhc2UvLm52bS92ZXJzaW9ucy9ub2RlL3Y4LjEuMy9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanMiLCIuLi8uLi8uLi9ob21lL2Jhc2UvLm52bS92ZXJzaW9ucy9ub2RlL3Y4LjEuMy9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIuLi8uLi8uLi9ob21lL2Jhc2UvLm52bS92ZXJzaW9ucy9ub2RlL3Y4LjEuMy9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2lzLWJ1ZmZlci9pbmRleC5qcyIsIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjguMS4zL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjguMS4zL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy1uZXh0aWNrLWFyZ3MvaW5kZXguanMiLCIuLi8uLi8uLi9ob21lL2Jhc2UvLm52bS92ZXJzaW9ucy9ub2RlL3Y4LjEuMy9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjguMS4zL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2R1cGxleC1icm93c2VyLmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92OC4xLjMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL19zdHJlYW1fZHVwbGV4LmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92OC4xLjMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL19zdHJlYW1fcGFzc3Rocm91Z2guanMiLCIuLi8uLi8uLi9ob21lL2Jhc2UvLm52bS92ZXJzaW9ucy9ub2RlL3Y4LjEuMy9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9saWIvX3N0cmVhbV9yZWFkYWJsZS5qcyIsIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjguMS4zL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2xpYi9fc3RyZWFtX3RyYW5zZm9ybS5qcyIsIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjguMS4zL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2xpYi9fc3RyZWFtX3dyaXRhYmxlLmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92OC4xLjMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL2ludGVybmFsL3N0cmVhbXMvQnVmZmVyTGlzdC5qcyIsIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjguMS4zL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2xpYi9pbnRlcm5hbC9zdHJlYW1zL2Rlc3Ryb3kuanMiLCIuLi8uLi8uLi9ob21lL2Jhc2UvLm52bS92ZXJzaW9ucy9ub2RlL3Y4LjEuMy9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9saWIvaW50ZXJuYWwvc3RyZWFtcy9zdHJlYW0tYnJvd3Nlci5qcyIsIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjguMS4zL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL3Bhc3N0aHJvdWdoLmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92OC4xLjMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vcmVhZGFibGUtYnJvd3Nlci5qcyIsIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjguMS4zL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL3RyYW5zZm9ybS5qcyIsIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjguMS4zL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL3dyaXRhYmxlLWJyb3dzZXIuanMiLCIuLi8uLi8uLi9ob21lL2Jhc2UvLm52bS92ZXJzaW9ucy9ub2RlL3Y4LjEuMy9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3NhZmUtYnVmZmVyL2luZGV4LmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92OC4xLjMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9zdHJlYW0tYnJvd3NlcmlmeS9pbmRleC5qcyIsIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjguMS4zL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvc3RyaW5nX2RlY29kZXIvbGliL3N0cmluZ19kZWNvZGVyLmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92OC4xLjMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsLWRlcHJlY2F0ZS9icm93c2VyLmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92OC4xLjMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92OC4xLjMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJzcmMvbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9hbnNpLXJlZ2V4L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Fuc2ktc3R5bGVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JyZWFrd29yZC9kaXN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Nsb25lL2Nsb25lLmpzIiwibm9kZV9tb2R1bGVzL2Nzdi1nZW5lcmF0ZS9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY3N2LXBhcnNlL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jc3Ytc3RyaW5naWZ5L2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jc3YvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlZmF1bHRzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzY2FwZS1zdHJpbmctcmVnZXhwL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2hhcy1hbnNpL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5nZXQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyZ2UvbWVyZ2UuanMiLCJub2RlX21vZHVsZXMvc21hcnR3cmFwL3NyYy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL3N0cmVhbS10cmFuc2Zvcm0vbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N0cmlwLWFuc2kvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3VwcG9ydHMtY29sb3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdXNlLXN0cmljdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy93Y3dpZHRoL2NvbWJpbmluZy5qcyIsIm5vZGVfbW9kdWxlcy93Y3dpZHRoL2luZGV4LmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9kZWZhdWx0LWFkYXB0ZXIuanMiLCJzcmMvZm9ybWF0LmpzIiwic3JjL3B1YmxpYy5qcyIsInNyYy9yZW5kZXIuanMiLCJzcmMvc3R5bGUuanMiLCJzcmMvdGVybWluYWwtYWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMXFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOStCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdnBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O2FDMWtCQSxRQUFRLFlBQVIsQyxDQUVHLFFBQVEsSUFBUixHQUFpQixNLENBRWxCLFFBQVEsdUJBQVIsQyxDQUlBLE9BQU8sT0FBUCxDQUFpQixRQUFRLHNCQUFSLEM7OztBQ1JuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzlmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuNkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzthQ25HQSxHQUFJLFFBQVMsQ0FDWCxpQkFBbUIsQ0FDakIsQ0FDRSxDQUFDLEVBQUcsR0FBSixDQUFTLEVBQUcsR0FBWixDQUFpQixFQUFHLEdBQXBCLENBQXlCLEVBQUcsR0FBNUIsQ0FBaUMsRUFBRyxHQUFwQyxDQURGLENBRUUsQ0FBQyxFQUFHLEdBQUosQ0FBUyxFQUFHLEdBQVosQ0FBaUIsRUFBRyxHQUFwQixDQUF5QixFQUFHLEdBQTVCLENBQWlDLEVBQUcsR0FBcEMsQ0FGRixDQUdFLENBQUMsRUFBRyxHQUFKLENBQVMsRUFBRyxHQUFaLENBQWlCLEVBQUcsR0FBcEIsQ0FBeUIsRUFBRyxHQUE1QixDQUFpQyxFQUFHLEdBQXBDLENBSEYsQ0FEaUIsQ0FNakIsQ0FDRSxDQUFDLEVBQUcsUUFBSixDQUFTLEVBQUcsUUFBWixDQUFpQixFQUFHLFFBQXBCLENBQXlCLEVBQUcsUUFBNUIsQ0FBaUMsRUFBRyxRQUFwQyxDQURGLENBRUUsQ0FBQyxFQUFHLFFBQUosQ0FBUyxFQUFHLFFBQVosQ0FBaUIsRUFBRyxRQUFwQixDQUF5QixFQUFHLFFBQTVCLENBQWlDLEVBQUcsUUFBcEMsQ0FGRixDQUdFLENBQUMsRUFBRyxRQUFKLENBQVMsRUFBRyxRQUFaLENBQWlCLEVBQUcsUUFBcEIsQ0FBeUIsRUFBRyxRQUE1QixDQUFpQyxFQUFHLFFBQXBDLENBSEYsQ0FOaUIsQ0FXakIsQ0FDRSxDQUFDLEVBQUcsR0FBSixDQUFTLEVBQUcsR0FBWixDQUFpQixFQUFHLEdBQXBCLENBQXlCLEVBQUcsR0FBNUIsQ0FBaUMsRUFBRyxHQUFwQyxDQURGLENBRUUsQ0FBQyxFQUFHLEdBQUosQ0FBUyxFQUFHLEdBQVosQ0FBaUIsRUFBRyxHQUFwQixDQUF5QixFQUFHLEdBQTVCLENBQWlDLEVBQUcsR0FBcEMsQ0FGRixDQUdFLENBQUMsRUFBRyxHQUFKLENBQVMsRUFBRyxHQUFaLENBQWlCLEVBQUcsR0FBcEIsQ0FBeUIsRUFBRyxHQUE1QixDQUFpQyxFQUFHLEdBQXBDLENBSEYsQ0FYaUIsQ0FEUixDQWtCWCxNQUFRLFFBbEJHLENBbUJYLFlBQWMsSUFuQkgsQ0FvQlgsWUFBYyxDQXBCSCxDQXFCWCxRQXJCVyxDQXNCWCxVQXRCVyxDQXVCWCxrQkFBb0IsMkRBdkJULENBd0JYLGFBQWUsc0RBeEJKLENBeUJYLGNBekJXLENBMEJYLFlBQWMsUUExQkgsQ0EyQlgsY0EzQlcsQ0E0QlgsVUFBWSxJQTVCRCxDQTZCWCxZQUFjLFFBN0JILENBOEJYLFlBQWMsUUE5QkgsQ0ErQlgsV0FBYSxDQS9CRixDQWdDWCxVQUFZLENBaENELENBaUNYLGNBQWdCLENBakNMLENBa0NYLFlBQWMsQ0FsQ0gsQ0FtQ1gsYUFBZSxDQW5DSixDQW9DWCxXQUFhLENBcENGLENBcUNYLFVBQVksSUFyQ0QsQ0FzQ1gsV0F0Q1csQ0F1Q1gsTUFBUSxFQXZDRyxDQUFiLENBMENBLE9BQU8sTUFBUCxDQUFnQixDLENBRWhCLE9BQU8sY0FBUCxHLENBQ0EsT0FBTyxXQUFQLEcsQ0FDQSxPQUFPLEtBQVAsQ0FBZSxDQUNiLEtBQU8sRUFETSxDQUViLG9CQUZhLENBR2IsZUFIYSxDQUliLFVBSmEsQ0FLYixPQUFTLEVBTEksQ0FNYixPQUFTLEVBTkksQ0FPYixPQUFTLENBUEksQ0FRYixhQVJhLEMsQ0FXZixPQUFPLE9BQVAsQ0FBaUIsTTs7O2FDekRqQixHQUFJLFFBQVMsUUFBUSxhQUFSLENBQWIsQ0FDQSxPQUFPLE9BQVAsQ0FBa0IsVUFBVSxDQUMxQixNQUFPLFFBQU8sS0FDZixDQUZnQixFOzs7OzRCQ3lHTyxLQUFLLEssbU5BeEd6QixLQUFPLFFBQVEsV0FBUixDLENBQ1AsUUFBVSxRQUFRLFNBQVIsQyxDQUNWLFMsQ0FFSixPQUFPLGVBQVAsQ0FBeUIsV0FBZSxDQUV0QyxNQUFPLFNBQVEsQ0FBUixDQUNSLEMsQ0FFRCxPQUFPLGVBQVAsQ0FBeUIsbUJBTXhCLENBR0MsR0FBSSxHQUFTLEVBQVUsUUFBVixFQUFiLENBR0ksRUFBa0Isb0JBSHRCLENBTUksRUFBZSxFQUFPLEtBQVAsQ0FBYSxDQUFiLE9BTm5CLENBU0EsRUFBUyxFQUFPLE9BQVAsQ0FBZSxDQUFmLENBQStCLEVBQS9CLENBWlYsQ0FlQyxHQUFJLEdBQWdCLG9CQUFwQixDQUdJLEVBQWEsRUFBTyxLQUFQLENBQWEsQ0FBYixPQUhqQixDQU1BLEVBQVMsRUFBTyxPQUFQLENBQWUsQ0FBZixDQUE2QixFQUE3QixDQXJCVixDQXVCQyxHQUFJLEdBR0csUUFISCxHQUVHLENBRkgsQ0FJVyxhQUpYLENBTUcsTUFOSCxHQUVHLENBRkgsQ0FPVyxPQVBYLENBVVcsYUFWZixDQWU2QixRQUExQixLQUFZLENBQVosQ0F0Q0osR0F1Q0csRUFBWSxXQUFaLENBQTBCLEVBQVksWUFBWixDQUN4QixLQUFLLEdBQUwsQ0FBUyxFQUFZLFlBQXJCLENBQWtDLEVBQVksV0FBOUMsQ0FBMEQsQ0FBMUQsQ0F4Q0wsRUEyQ0MsR0FBSSxHQUFjLEVBQU8sS0FBUCxDQUFhLFlBQWIsQ0FBMEIsQ0FBMUIsQ0FBbEIsQ0FHSSxFQUFhLEVBQ2hCLEVBQVksV0FESSxDQUVoQixFQUFZLFlBRkksQ0FHaEIsRUFBTyxNQU5SLENBUUEsV0FFRSxJQUFnQyxRQUEzQixRQUFPLEdBQU8sUUFBZCxFQUFnRSxDQUF6QixHQUFPLFFBQVAsQ0FBZ0IsTUFBNUQsQ0FDRSxFQUFTLE9BQU8sb0JBQVAsQ0FDUCxDQURPLENBRVAsQ0FGTyxDQUdQLENBSE8sQ0FEWCxDQU1FLE1BRUYsSUFBSyxHQUFPLE1BQVAsQ0FBZ0IsT0FBTyxlQUFQLENBQXVCLENBQXZCLENBQXJCLENBQ0UsRUFBUyxPQUFPLGdCQUFQLENBQ1AsQ0FETyxDQUVQLENBRk8sQ0FHUCxDQUhPLENBRFgsQ0FNRSxNQUVGLFFBQ0UsRUFBUyxPQUFPLGdCQUFQLENBQXdCLENBQXhCLENBQStCLENBQS9CLENBQTJDLENBQTNDLENBRFgsQ0FsQkYsQ0F1QkEsR0FBSSxHQUFTLEVBQU8sS0FBUCxDQUFhLElBQWIsQ0FBYixDQXVDQSxNQXBDQSxHQUFTLEVBQU8sR0FBUCxDQUFXLFdBQWMsQ0FFaEMsRUFBTyxFQUFLLElBQUwsRUFGeUIsQ0FJaEMsR0FBSSxHQUFhLE9BQU8sZUFBUCxDQUF1QixDQUF2QixDQUFqQixDQUdBLEdBQUcsRUFBYSxDQUFoQixDQUE0QixDQUMxQixHQUFJLEdBQWEsRUFBYyxDQUEvQixDQUNBLFdBQ0UsSUFBK0IsUUFBMUIsS0FBWSxDQUFaLENBQUwsQ0FDRSxHQURGLENBRUUsR0FBSSxHQUFVLFdBQVcsRUFBYSxDQUF4QixDQUFkLENBQ0ksRUFBZSxFQUFhLENBRGhDLENBRUEsRUFBTyxNQUFNLEVBQVUsQ0FBaEIsRUFBbUIsSUFBbkIsQ0FBd0IsR0FBeEIsRUFDTCxDQURLLENBRUwsTUFBTSxFQUFVLENBQVYsQ0FBYyxDQUFwQixFQUFrQyxJQUFsQyxDQUF1QyxHQUF2QyxDQU5KLENBT0UsTUFDRixJQUErQixPQUExQixLQUFZLENBQVosQ0FBTCxDQUNFLEVBQU8sTUFBTSxFQUFhLEVBQVksWUFBL0IsRUFBNkMsSUFBN0MsQ0FBa0QsR0FBbEQsRUFDQSxDQURBLENBRUEsTUFBTSxFQUFZLFlBQVosQ0FBMkIsQ0FBakMsRUFBb0MsSUFBcEMsQ0FBeUMsR0FBekMsQ0FIVCxDQUlFLE1BQ0YsUUFDRSxFQUFPLE1BQU0sRUFBWSxXQUFaLENBQTBCLENBQWhDLEVBQW1DLElBQW5DLENBQXdDLEdBQXhDLEVBQ0EsQ0FEQSxDQUNPLE1BQU0sRUFBYSxFQUFZLFdBQS9CLEVBQTRDLElBQTVDLENBQWlELEdBQWpELENBRmhCLENBZEYsQ0FrQkQsQ0FNRCxNQUhBLEdBQU8sRUFBYSxDQUFiLEVBQWtCLENBR3pCLElBRmMsRUFBVyxDQUFYLENBRWQsQ0FBTyxDQUNSLENBbENRLENBb0NULENBQU8sQ0FDTCxPQUFTLENBREosQ0FFTCxNQUFRLENBRkgsQ0FJUixDLENBRUQsT0FBTyxvQkFBUCxDQUE4QixlQUF1QyxDQUNuRSxHQUFJLEdBQVksQ0FBaEIsQ0FLQSxNQUpHLEdBQWEsRUFBVSxNQUkxQixHQUhFLEVBQVksRUFBVSxTQUFWLENBQW9CLENBQXBCLENBQXNCLEVBQWEsRUFBWSxRQUFaLENBQXFCLE1BQXhELENBR2QsSUFGMEIsRUFBWSxRQUV0QyxFQUFPLENBQ1IsQyxDQUVELE9BQU8sZ0JBQVAsQ0FBMEIsZUFBdUMsQ0FDL0QsR0FBSSxHQUFRLENBQVosQ0FDSSxFQUFRLENBRFosQ0FFSSxFQUFhLEVBQU8sS0FBUCxDQUFhLEVBQWIsQ0FGakIsQ0FJSSxFQUFZLEVBQVcsTUFBWCxDQUFrQixlQUE4QixDQVM5RCxNQVJBLElBQVMsT0FBTyxlQUFQLENBQXVCLENBQXZCLENBUVQsQ0FQSSxFQUFRLENBT1osRUFORSxFQUFLLElBQUwsQ0FBVSxFQUFPLEtBQVAsQ0FBYSxDQUFiLENBQW9CLENBQXBCLENBQVYsQ0FNRixDQUxFLEVBQVEsQ0FLVixDQUpFLEVBQVEsQ0FJVixFQUhXLEVBQVcsTUFBWCxHQUFzQixFQUFJLENBR3JDLEVBRkUsRUFBSyxJQUFMLENBQVUsRUFBTyxLQUFQLENBQWEsQ0FBYixDQUFWLENBRUYsQ0FBTyxDQUNSLENBVmUsS0FVVCxJQVZTLENBVUosSUFWSSxDQUpoQixDQWdCQSxNQUFPLEVBQ1IsQyxDQUVELE9BQU8sZ0JBQVAsQ0FBMEIsZUFBdUMsQ0FDL0QsR0FBSSxHQUFrQixFQUNBLEVBQVksV0FEWixDQUVBLEVBQVksWUFGbEMsQ0FHSSxFQUFZLEtBQUssQ0FBTCxDQUFZLENBQzFCLE1BQVEsQ0FEa0IsQ0FFMUIsT0FGMEIsQ0FBWixDQUhoQixDQVVBLE1BQU8sRUFDUixDLENBRUQsT0FBTyxlQUFQLENBQXlCLGFBQXFCLENBRTVDLEdBQ0ksRUFESixDQUFJLElBQUosQ0FJQSxHQUFHLEVBQU8sS0FBUCxDQUFhLE1BQWIsQ0FBb0IsQ0FBcEIsR0FBMEQsQ0FBaEMsR0FBTyxLQUFQLENBQWEsTUFBYixDQUFvQixDQUFwQixFQUF1QixNQUFwRCxDQUNFLEVBQVMsRUFBTyxLQUFQLENBQWEsTUFBYixDQUFvQixDQUFwQixDQURYLEtBR0ssSUFBaUIsQ0FBZCxHQUFLLE1BQVIsQ0FDSCxFQUFTLEVBQUssQ0FBTCxDQUROLEtBSUgsVUFHRixFQUFTLEVBQU8sR0FBUCxDQUFXLFdBQWMsT0FDYixRQUFoQix1QkFBTyxFQUFQLHFCQUFPLENBQVAsSUFBaUQsV0FBckIsUUFBTyxHQUFLLEtBRFgsQ0FFdkIsRUFBSyxLQUZrQixDQUt2QixFQUFPLEtBRWpCLENBUFEsQ0FoQm1DLENBMEI1QyxHQUFJLEdBQWEsRUFBTyxNQUFQLENBQWMsYUFBbUIsQ0FDaEQsTUFBTyxHQUFPLENBQ2YsQ0FGZ0IsQ0FBakIsQ0FRQSxHQUhBLEdBQWMsRUFBTyxVQUdyQixDQUFHLFNBQVcsUUFBUSxNQUFuQixFQUE2QixFQUFhLFFBQVEsTUFBUixDQUFlLE9BQTVELENBQW9FLENBRWxFLEdBQUksR0FBTyxRQUFRLE1BQVIsQ0FBZSxPQUFmLENBQXlCLENBQXBDLENBRUEsRUFBTyxFQUFLLE9BQUwsQ0FBYSxDQUFiLEVBQWdCLElBSjJDLENBTWxFLEVBQVMsRUFBTyxHQUFQLENBQVcsV0FBZSxDQUNqQyxNQUFPLFlBQVcsRUFBSyxDQUFoQixDQUNSLENBRlEsQ0FHVixDQUVELE1BQU8sRUFDUixDLENBRUQsT0FBTyxPQUFQLENBQWlCLE07Ozs7O21PQ25PYixNQUFRLFFBQVEsT0FBUixDLENBQ1IsT0FBUyxRQUFRLGFBQVIsQyxDQUdULElBQU0sT0FBTyxNQUFQLENBQWMsTUFBTSxTQUFwQixDLENBR04sYSxDQTJFSixJQUFJLEtBQUosQ0FBWSxVQUFVLENBR3BCLEdBQXFDLENBQWxDLFVBQU8sSUFBUCxDQUFZLFNBQVosRUFBdUIsTUFBdkIsRUFDd0IsUUFBeEIsUUFBTyxXQUFVLENBQVYsQ0FEVixDQUVFLE1BQU8sU0FBUSxNQUFNLFVBQVUsQ0FBVixDQUFkLENBQVAsQ0FHRixPQUFTLFFBQVEsYUFBUixDQVJXLENBVXBCLEdBQUssR0FBbUMsUUFBeEIsV0FBTyxVQUFVLENBQVYsQ0FBUCxDQUFELENBQXFDLFVBQVUsQ0FBVixDQUFyQyxDQUNjLFFBQXhCLFdBQU8sVUFBVSxDQUFWLENBQVAsQ0FBRCxDQUFxQyxVQUFVLENBQVYsQ0FBckMsR0FESixDQXNCQSxHQW5CQSxPQUFTLFNBQVcsTUFBWCxDQUFrQixDQUFsQixDQW1CVCxDQWhCQSxPQUFPLEtBQVAsQ0FBZSxPQUFPLFNBQVAsRUFBb0IsT0FBTyxLQWdCMUMsQ0FkQSxPQUFPLFdBQVAsQ0FBcUIsT0FBTyxlQUFQLEVBQTBCLE9BQU8sV0FjdEQsQ0FaRyxVQUFVLENBQVYsR0FBZ0IsVUFBVSxDQUFWLFdBQXdCLE1BQXhDLEVBQWlELFVBQVUsQ0FBVixFQUFhLE1BWWpFLENBWEUsT0FBTyxLQUFQLENBQWEsTUFBYixDQUFzQixVQUFVLENBQVYsQ0FXeEIsRUFSRSxPQUFPLEtBQVAsQ0FBYSxNQUFiLEdBUUYsQ0FQRSxPQUFPLFdBQVAsR0FPRixFQUhBLE9BQU8sY0FBUCxDQUF3QixPQUFPLEtBQVAsQ0FBYSxNQUFiLENBQW9CLEtBQXBCLENBQTBCLENBQTFCLENBR3hCLENBQTBCLElBQXZCLFVBQU8sV0FBVixDQUErQixDQUM3QixHQUFJLEdBQVEsUUFBUSxPQUFSLENBQVosQ0FFQSxPQUFPLGdCQUFQLENBQXdCLE9BQU8sV0FBL0IsRUFDRSxPQUFPLGdCQUFQLENBQXdCLE9BQU8sV0FBL0IsRUFBNEMsR0FBNUMsQ0FBZ0QsV0FBYSxDQUkzRCxNQUhBLFFBQU8sSUFBUCxDQUFZLENBQVosRUFBaUIsT0FBakIsQ0FBeUIsV0FBYSxDQUNuQyxFQUFJLENBQUosRUFBVyxFQUFNLE9BQU8sV0FBYixFQUEwQixFQUFJLENBQUosQ0FBMUIsQ0FDYixDQUZELENBR0EsQ0FBTyxDQUNSLENBTEQsQ0FNSCxDQWNELE1BWEEsUUFBTyxLQUFQLENBQWEsTUFBYixDQUFzQixDQUFDLE9BQU8sS0FBUCxDQUFhLE1BQWQsQ0FXdEIsQ0FSRyxVQUFVLENBQVYsR0FBZ0IsVUFBVSxDQUFWLFdBQXdCLE1BUTNDLEVBUEUsVUFBVSxDQUFWLEVBQWEsT0FBYixDQUFxQixXQUFhLENBQ2hDLElBQUksSUFBSixDQUFTLENBQVQsQ0FDRCxDQUZELENBT0YsQ0FGQSxPQUFPLEtBQVAsQ0FBYSxNQUFiLENBQXVCLFVBQVUsQ0FBVixXQUF3QixNQUF6QixDQUFrQyxVQUFVLENBQVYsQ0FBbEMsR0FFdEIsQ0FBTyxHQUNSLEMsQ0FhRCxJQUFJLE1BQUosQ0FBYSxVQUFVLENBR3JCLEdBQUksR0FBUyxPQUFPLGFBQVAsQ0FBcUIsSUFBckIsQ0FBMEIsSUFBMUIsQ0FBK0IsTUFBL0IsQ0FBc0MsSUFBdEMsQ0FBYixDQUVBLE1BQU8sRUFDUixDLENBRUQsT0FBTyxPQUFQLENBQWlCLEc7OzttT0NoS2IsTUFBUSxRQUFRLE9BQVIsQyxDQUNSLE1BQVEsUUFBUSxZQUFSLEMsQ0FDUixPQUFTLFFBQVEsYUFBUixDLENBQ1QsUyxDQUtKLE9BQU8sYUFBUCxDQUF1QixhQUFxQixDQUUxQyxHQUFJLEdBQVcsQ0FDVCxTQURTLENBRVQsT0FGUyxDQUdULFNBSFMsQ0FBZixDQUtJLEVBQVMsRUFMYixDQU1JLEVBQWEsTUFBTSxFQUFPLFVBQVAsQ0FBb0IsQ0FBMUIsRUFBNkIsSUFBN0IsQ0FBa0MsR0FBbEMsQ0FOakIsQ0FPSSxFQUFjLEVBQU8sZ0JBQVAsQ0FBd0IsRUFBTyxXQUEvQixDQVBsQixDQVFJLElBUkosQ0FZQSxFQUFPLFNBQVAsQ0FBbUIsT0FBTyxZQUFQLENBQW9CLEVBQUssQ0FBTCxLQUFwQixDQWR1QixDQWlCMUMsRUFBTyxPQUFPLGFBQVAsQ0FBcUIsQ0FBckIsQ0FBNEIsQ0FBNUIsQ0FqQm1DLENBbUIxQyxFQUFPLEtBQVAsQ0FBYSxZQUFiLENBQTRCLE9BQU8sZUFBUCxDQUF1QixDQUF2QixDQUE4QixDQUE5QixDQW5CYyxDQTRCeEMsRUFBUyxNQTVCK0IsQ0FzQnRDLEVBQU8sV0F0QitCLElBdUJ0QixFQUFPLEtBQVAsQ0FBYSxNQUFiLENBQW9CLEdBQXBCLENBQXdCLFdBQWEsQ0FDckQsTUFBTyxRQUFPLFFBQVAsQ0FBZ0IsQ0FBaEIsQ0FBdUIsQ0FBdkIsQ0FBMkIsUUFBM0IsQ0FDUixDQUZpQixDQXZCc0IsQ0FnQzFDLEVBQVMsSUFBVCxDQUFnQixFQUFLLEdBQUwsQ0FBUyxXQUFhLENBQ3BDLE1BQU8sUUFBTyxRQUFQLENBQWdCLENBQWhCLENBQXVCLENBQXZCLENBQTJCLE1BQTNCLENBQ1IsQ0FGZSxDQWhDMEIsQ0FxQzFDLEVBQVMsTUFBVCxDQUFtQixFQUFPLEtBQVAsQ0FBYSxNQUFiLFdBQStCLE1BQS9CLEVBQXFFLENBQTdCLEdBQU8sS0FBUCxDQUFhLE1BQWIsQ0FBb0IsTUFBN0QsQ0FBMkUsQ0FBQyxFQUFPLEtBQVAsQ0FBYSxNQUFkLENBQTNFLEdBckN3QixDQXVDMUMsRUFBUyxNQUFULENBQWtCLEVBQVMsTUFBVCxDQUFnQixHQUFoQixDQUFvQixXQUFhLENBQ2pELE1BQU8sUUFBTyxRQUFQLENBQWdCLENBQWhCLENBQXVCLENBQXZCLENBQTJCLFFBQTNCLENBQ1IsQ0FGaUIsQ0F2Q3dCLENBNkMxQyxJQUFJLHdCQUNGLEVBQVEsSUFBUixDQUFhLEVBQWIsQ0FERSxDQUVGLEVBQU8sS0FBUCxDQUFhLFlBQWIsQ0FBMEIsT0FBMUIsQ0FBa0MsZUFBaUIsQ0FDakQsRUFBUSxDQUFSLEdBQWMsTUFBTSxDQUFOLEVBQVMsSUFBVCxDQUFjLEVBQVksQ0FBWixFQUFlLENBQTdCLEdBQ1YsRUFBRSxDQUFGLEdBQVEsRUFBSSxNQUFiLENBQTBDLEVBQVksQ0FBWixFQUFlLENBQXpELENBQXVCLEVBQVksQ0FBWixFQUFlLENBRDNCLENBRWYsQ0FIRCxDQUZFLENBTUYsRUFBUSxDQUFSLEVBQWEsRUFBWSxDQUFaLEVBQWUsQ0FBZixDQUFtQixFQUFRLENBQVIsQ0FOOUIsQ0FPRixFQUFRLENBQVIsRUFBYSxFQUFRLENBQVIsRUFBVyxLQUFYLENBQWlCLEVBQWpCLENBUFgsQ0FRRixFQUFRLENBQVIsRUFBVyxFQUFRLENBQVIsRUFBVyxPQUF0QixFQUFpQyxFQUFZLENBQVosRUFBZSxDQVI5QyxDQVNGLEVBQVEsQ0FBUixFQUFhLEVBQVEsQ0FBUixFQUFXLElBQVgsQ0FBZ0IsRUFBaEIsQ0FUWCxDQVdGLEVBQVEsQ0FBUixFQUFnQixDQUFGLEVBQUQsQ0FBUSxFQUFhLEVBQVEsQ0FBUixDQUFiLENBQTBCLElBQWxDLENBQXlDLEVBQWEsRUFBUSxDQUFSLENBWGpFLEVBQUksRUFBRSxDQUFWLENBQWUsQ0FBRixFQUFiLENBQWtCLEdBQWxCLEdBQVEsQ0FBUixFQWVBLEdBQVUsRUFBUSxDQUFSLENBNURnQyxDQStEMUMsR0FBSSxFQUFKLENBR0EsT0FBTyxJQUFQLENBQVksQ0FBWixFQUFzQixPQUF0QixDQUE4QixhQUFhLE1BR25DLEVBQVMsQ0FBVCxFQUFZLE1BSHVCLEVBd0J2QyxPQW5CQSxFQUFNLEVBQVMsQ0FBVCxFQUFZLEtBQVosRUFtQk4sQ0FmQSxFQUFJLE9BQUosQ0FBWSxXQUFjLENBRXhCLEVBQVMsRUFDTCxDQURLLENBR0wsRUFBWSxDQUFaLEVBQWUsQ0FIVixDQUtKLEVBQUssSUFBTCxDQUFVLEVBQVksQ0FBWixFQUFlLENBQXpCLENBTEksQ0FPTCxFQUFZLENBQVosRUFBZSxDQVBWLENBU0wsSUFDTCxDQVpELENBZUEsS0FFRSxJQUE0QixFQUF2QixLQUFTLENBQVQsRUFBWSxNQUFaLEVBQ1MsQ0FBTixJQURILEVBRThCLENBQTNCLEtBQVMsTUFBVCxDQUFnQixNQUZ4QixDQUdFLE1BRUYsSUFBNEIsRUFBdkIsS0FBUyxDQUFULEVBQVksTUFBWixFQUNTLENBQU4sSUFEUixDQUVFLE1BRUYsSUFBSyxHQUFPLE9BQVAsRUFBd0IsTUFBTixJQUFsQixFQUFrQyxDQUFDLEVBQUksS0FBNUMsQ0FDRSxNQUNGLFFBQ0UsR0FBVSxFQUFRLENBQVIsQ0FEWixDQWJGLENBaUJILENBekNELENBbEUwQyxDQThHMUMsR0FBVSxFQUFRLENBQVIsQ0E5R2dDLENBaUgxQyxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQWMsS0FBSyxNQUFuQixDQWpIMEMsQ0FtSDFDLEdBQUksR0FBYyxNQUFNLEVBQU8sU0FBUCxDQUFtQixDQUF6QixFQUE0QixJQUE1QixDQUFpQyxJQUFqQyxFQUF5QyxDQUEzRCxDQUtBLE1BRkEsTUFBSyxNQUFMLENBQWMsRUFBWSxLQUFaLENBQWtCLFlBQWxCLEVBQWdDLE1BRTlDLENBQU8sQ0FDUixDLENBRUQsT0FBTyxRQUFQLENBQWtCLGVBQTRCLENBRTVDLEdBQUksR0FBZSxDQUFuQixDQUlBLEdBQWtCLENBQWYsS0FBSSxNQUFKLEVBQW9CLEVBQU8sT0FBOUIsQ0FFRSxNQURBLEdBQUksS0FBSixHQUNBLENBQU8sQ0FBUCxDQUlGLEdBQUksR0FBTyxFQUFPLEtBQVAsQ0FBYSxZQUFiLENBQTBCLE1BQTFCLENBQW1DLEVBQUksTUFBbEQsQ0FFVSxDQUFQLEVBZHlDLENBZ0IxQyxFQUFNLEVBQUksTUFBSixDQUFXLE1BQU0sS0FBTixDQUFZLElBQVosQ0FBc0IsS0FBdEIsQ0FBNEIsQ0FBNUIsR0FDTSxHQUROLENBQ1UsVUFBVSxDQUFDLE1BQU8sS0FBSyxDQURqQyxDQUFYLENBaEJvQyxDQW9CN0IsQ0FBUCxFQXBCb0MsR0FzQjFDLEVBQUksTUFBSixDQUFhLEVBQU8sS0FBUCxDQUFhLFlBQWIsQ0FBMEIsTUF0QkcsRUErQjVDLElBQUksR0FIQSxLQUdBLENBRkEsRUFBWSxFQUFJLE1BRWhCLENBQUksRUFBTSxDQUFkLENBQWlCLEVBQU0sQ0FBdkIsQ0FBa0MsR0FBbEMsQ0FBMEMsQ0FFeEMsR0FBSSxHQUFJLE9BQU8sU0FBUCxDQUFpQixDQUFqQixDQUF3QixFQUFJLENBQUosQ0FBeEIsQ0FBbUMsQ0FBbkMsQ0FBeUMsQ0FBekMsQ0FBUixDQUNJLEVBQVUsRUFBRSxPQURoQixDQUdlLFFBQVosSUFMcUMsRUFNdEMsRUFBTyxLQUFQLENBQWEsaUJBQWIsQ0FBK0IsSUFBL0IsQ0FBb0MsRUFBRSxLQUF0QyxDQU5zQyxDQVN4QyxFQUFnQixFQUFlLEVBQVEsTUFBeEIsQ0FDYixFQUFRLE1BREssQ0FDSSxDQVZxQixDQVl4QyxFQUFNLElBQU4sQ0FBVyxDQUFYLENBQ0QsQ0FHRCxFQUE0QixRQUFaLElBQUQsQ0FBeUIsQ0FBekIsQ0FDYixHQUFnQixFQUFPLGFBQVAsQ0FBdUIsRUFBTyxVQUE5QyxDQWhEMEMsQ0FtRDVDLEdBQUksR0FBUSxNQUFNLEtBQU4sQ0FBWSxJQUFaLENBQWlCLENBQUMsT0FBTyxDQUFSLENBQWpCLEVBQ00sR0FETixDQUNVLFNBQVMsSUFEbkIsQ0FDd0IsVUFBVSxDQUFDLFFBQVUsQ0FEN0MsQ0FBWixDQXNCQSxNQXBCQSxHQUFNLE9BQU4sQ0FBYyxhQUFtQixDQUMvQixHQUFJLEdBQVksTUFBTSxFQUFPLEtBQVAsQ0FBYSxZQUFiLENBQTBCLENBQTFCLENBQU4sRUFBb0MsSUFBcEMsQ0FBeUMsR0FBekMsQ0FBaEIsQ0FFQSxHQUFjLE1BQVgsSUFBSCxDQUFxQixDQUVuQixJQUFJLEdBQUksR0FBRSxDQUFWLENBQWEsRUFBRSxFQUFPLFVBQXRCLENBQWtDLEdBQWxDLENBQ0UsRUFBUSxPQUFSLENBQWdCLENBQWhCLEVBSUYsSUFBSSxHQUFJLEdBQUUsQ0FBVixDQUFhLEVBQUUsRUFBTyxhQUF0QixDQUFxQyxHQUFyQyxDQUNFLEVBQVEsSUFBUixDQUFhLENBQWIsQ0FFSCxDQUNELElBQUksR0FBSSxHQUFFLENBQVYsQ0FBYSxFQUFFLENBQWYsQ0FBNkIsR0FBN0IsQ0FDRSxFQUFNLENBQU4sRUFBUyxJQUFULENBQXFDLFdBQXRCLFFBQU8sR0FBUSxDQUFSLENBQVIsQ0FDYSxDQURiLENBQ0EsRUFBUSxDQUFSLENBRGQsQ0FHSCxDQWxCRCxDQW9CQSxDQUFPLENBQ1IsQyxDQUVELE9BQU8sU0FBUCxDQUFtQixpQkFBeUMsQ0FDMUQsR0FBSSxFQUFKLENBQ0ksRUFBYyxTQUFXLENBQVgsQ0FDbUIsTUFBWixJQUFELENBQ0EsRUFBTyxjQUFQLENBQXNCLENBQXRCLENBREEsR0FETixDQUdNLENBSE4sQ0FEbEIsQ0FNQSxHQUFlLFFBQVosSUFBSCxDQUNFLEVBQU8sS0FBUCxDQUFhLE9BQWIsQ0FBcUIsSUFBckIsQ0FBMEIsQ0FBMUIsQ0FERixDQUVFLEVBQVksRUFBWSxLQUFaLEVBQXFCLEVBQVksS0FBakMsRUFBMEMsRUFGeEQsS0FJSSxDQUVGLFdBQ0UsSUFBcUIsV0FBaEIsUUFBTyxFQUFQLEVBQXdDLElBQVQsSUFBcEMsQ0FFRSxFQUFhLEVBQU8sV0FBUixDQUF1QixFQUFPLGlCQUE5QixDQUFrRCxFQUFPLFlBRnZFLENBR0UsTUFDRixJQUFxQixRQUFoQix1QkFBTyxFQUFQLHFCQUFPLENBQVAsSUFBa0QsV0FBdEIsUUFBTyxHQUFLLEtBQTdDLENBQ0UsRUFBWSxFQUFLLEtBRG5CLENBRUUsTUFDRixRQUVFLEVBQVksQ0FGZCxDQVJGLENBY29DLFVBQWpDLFFBQU8sR0FBWSxTQWhCcEIsR0FpQkEsRUFBWSxFQUFZLFNBQVosQ0FBc0IsQ0FBdEIsQ0FqQlosQ0FtQkgsQ0FHRCxFQUFZLE1BQU0sWUFBTixDQUFtQixDQUFuQixDQUE2QixDQUE3QixDQUF5QyxDQUF6QyxDQWpDOEMsQ0FvQzFELEdBQUksR0FBVyxPQUFPLGVBQVAsQ0FBdUIsQ0FBdkIsQ0FBK0IsQ0FBL0IsQ0FBMEMsQ0FBMUMsQ0FBdUQsQ0FBdkQsQ0FBb0UsQ0FBcEUsQ0FBZixDQUlBLE1BQU8sQ0FDTCxRQUFVLEVBQVEsTUFEYixDQUVMLE1BQVEsRUFBUSxLQUZYLENBSVIsQyxDQUVELE9BQU8sWUFBUCxDQUFzQixXQUFhLENBQ2pDLEdBQUksRUFBSixDQUdBLEdBQWtCLFFBQWYsdUJBQU8sRUFBUCxxQkFBTyxDQUFQLElBQTJCLEVBQUUsWUFBZSxNQUFqQixDQUE5QixDQUFzRCxDQUNwRCxHQUFJLEdBQU8sT0FBTyxJQUFQLENBQVksQ0FBWixDQUFYLENBQ0EsR0FBbUIsQ0FBaEIsS0FBSyxNQUFSLENBQXFCLENBRW5CLEdBQUksR0FBTSxFQUFLLENBQUwsQ0FBVixDQUZtQixFQUdoQixFQUFJLENBQUosV0FBb0IsTUFISixDQUlWLGtCQUpVLENBUVYscUJBRVYsQ0FWRCxJQWFFLEdBQU8sY0FFVixDQWpCRCxJQW9CRSxHQUFPLGNBcEJULENBdUJBLE1BQU8sRUFDUixDLENBSUQsT0FBTyxpQkFBUCxDQUEyQixhQUEyQixDQUdwRCxHQUFJLEtBQUosQ0FDSSxFQUFVLEVBQU8sS0FBUCxDQUFhLE9BRDNCLENBZUEsTUFWQSxHQUFRLE9BQVIsQ0FBZ0IsV0FBYyxDQUM1QixFQUFZLElBQVosQ0FBaUIsQ0FBQyxDQUFELENBQWpCLENBQ0QsQ0FGRCxDQVVBLENBTkEsRUFBVyxPQUFYLENBQW1CLFdBQWEsQ0FDOUIsRUFBSSxPQUFKLENBQVksYUFBdUIsQ0FDakMsRUFBWSxDQUFaLEVBQW1CLElBQW5CLENBQXdCLENBQXhCLENBQ0QsQ0FGRCxDQUdELENBSkQsQ0FNQSxDQUFPLENBQ1IsQyxDQUtELE9BQU8sYUFBUCxDQUF1QixhQUFxQixDQUUxQyxHQUFJLEtBQUosQ0FDQSxPQUFPLEVBQU8sU0FBZCxFQUNFLElBQUssa0JBQUwsQ0FFRSxFQUFPLGNBQVAsQ0FBc0IsQ0FBdEIsRUFBMkIsRUFBTyxjQUFQLENBQXNCLENBQXRCLEtBRjdCLENBR0UsRUFBTyxjQUFQLENBQXNCLENBQXRCLEVBQXlCLEtBQXpCLENBQWlDLEVBQU8sV0FIMUMsQ0FLRSxFQUFTLEVBQUssR0FBTCxDQUFTLFdBQWEsQ0FDN0IsR0FBSSxLQUFKLENBQ0ksRUFBTSxPQUFPLElBQVAsQ0FBWSxDQUFaLEVBQWlCLENBQWpCLENBRFYsQ0FHQSxNQURBLEdBQUksSUFBSixDQUFTLENBQVQsQ0FDQSxDQUFPLEVBQUksTUFBSixDQUFXLEVBQUksQ0FBSixDQUFYLENBQ1IsQ0FMUSxDQUxYLENBV0UsTUFDRixJQUFLLHFCQUFMLENBRUUsRUFBTyxjQUFQLENBQXNCLENBQXRCLEVBQTJCLEVBQU8sY0FBUCxDQUFzQixDQUF0QixLQUY3QixDQUdFLEVBQU8sY0FBUCxDQUFzQixDQUF0QixFQUF5QixLQUF6QixDQUFpQyxFQUFPLFdBSDFDLENBS0UsRUFBUyxFQUFLLEdBQUwsQ0FBUyxXQUFlLENBQy9CLEdBQUksR0FBTSxPQUFPLElBQVAsQ0FBWSxDQUFaLEVBQW1CLENBQW5CLENBQVYsQ0FDQSxNQUFPLENBQUMsQ0FBRCxDQUFLLEVBQU0sQ0FBTixDQUFMLENBQ1IsQ0FIUSxDQUxYLENBU0UsTUFDRixJQUFLLGNBQUwsQ0FDRSxFQUFTLEVBQUssR0FBTCxDQUFTLFdBQWEsQ0FFN0IsTUFBTyxHQUFPLEtBQVAsQ0FBYSxNQUFiLENBQW9CLENBQXBCLEVBQXVCLEdBQXZCLENBQTJCLFdBQWdCLENBQ2hELE1BQU8sR0FBSSxFQUFPLEtBQVgsR0FBcUIsSUFDN0IsQ0FGTSxDQUdSLENBTFEsQ0FEWCxDQU9FLE1BQ0YsSUFBSyxjQUFMLENBQ0UsRUFBUyxDQURYLENBRUUsTUFDRixRQWxDRixDQXFDQSxNQUFPLEVBQ1IsQyxDQUVELE9BQU8sT0FBUCxDQUFpQixNOzs7YUNoV2pCLEdBQUksT0FBUSxRQUFRLE9BQVIsQ0FBWixDQUVBLFFBQVEsWUFBUixDQUF1QixlQUFpQyxDQUV0RCxHQUFJLEtBQUosQ0FFQSxXQUNFLElBQWlCLE1BQVosSUFBTCxDQUNFLEVBQVEsRUFBWSxLQUFaLEVBQXFCLENBRC9CLENBRUUsTUFDRixJQUFpQixRQUFaLElBQUwsQ0FDRSxFQUFRLEVBQVksV0FBWixFQUEyQixDQURyQyxDQUVFLE1BQ0YsUUFDRSxFQUFRLEVBQVksV0FBWixFQUEyQixDQURyQyxDQVBGLENBZUEsTUFKSSxFQUlKLEdBSEUsRUFBTSxNQUFNLENBQU4sRUFBYSxDQUFiLENBR1IsRUFBTyxDQUNSLEM7Ozs7YUNyQkQsR0FBSSxLQUFNLFFBQVEsS0FBUixDQUFWLENBQ0ksTUFBUSxRQUFRLE9BQVIsQ0FEWixDQUVBLE1BQU0sTUFBTixDQUFhLGdDQUFiLEMsQ0FDQSxNQUFNLE1BQU4sQ0FBYSxlQUFiLENBQTZCLENBQzNCLFNBQVMsOENBRGtCLENBRTNCLFFBQVEsR0FGbUIsQ0FBN0IsQyxDQUlBLE1BQU0sTUFBTixDQUFhLFlBQWIsQ0FBMEIsQ0FDeEIsU0FBUywrQ0FEZSxDQUExQixDLENBR0EsTUFBTSxNQUFOLENBQWEsa0JBQWIsQ0FBZ0MsQ0FDOUIsU0FBUyxtSEFEcUIsQ0FFOUIsUUFBUyxJQUZxQixDQUFoQyxDLENBSUEsTUFBTSxNQUFOLENBQWEsUUFBYixDQUFzQixDQUNwQixTQUFTLHVCQURXLENBRXBCLHNCQUZvQixDQUdwQixRQUFRLEtBSFksQ0FBdEIsQyxDQUtBLE1BQU0sTUFBTixDQUFhLGdCQUFiLENBQW1DLENBQ2pDLFNBQVMsNkZBRHdCLENBQW5DLEMsQ0FHQSxNQUFNLE9BQU4sQ0FBYyxVQUFVLENBQ3RCLEdBQUksR0FBSyxRQUFRLElBQVIsQ0FBVCxDQUNJLEVBQU0sVUFBVSxrQkFEcEIsQ0FFSSxFQUFXLEVBQUcsWUFBSCxDQUFnQixDQUFoQixDQUFxQixPQUFyQixDQUZmLENBR0ksRUFBTyxLQUFLLEtBQUwsQ0FBVyxDQUFYLENBSFgsQ0FJQSxNQUFPLEdBQUssT0FDYixDQU5ELEMsQ0FRQSxHQUFJLE9BQVEsUUFBUSxPQUFSLENBQVosQ0FDSSxVQUFZLFdBQWEsQ0FDM0IsRUFBTSxzQkFBd0IsQ0FBeEIsQ0FBOEIsSUFEVCxDQUUzQixRQUFRLEdBQVIsQ0FBWSxDQUFaLENBRjJCLENBRzNCLFFBQVEsSUFBUixDQUFhLENBQWIsQ0FDRCxDQUxELENBUUksa0JBUkosQ0FTSSxlQUFpQixDQVRyQixDQVdJLFdBQWEsS0FYakIsQ0FZQSxXQUNFLElBQWtDLFdBQTdCLFFBQU8sT0FBTSxJQUFOLENBQVcsTUFBdkIsQ0FDRSxNQUNGLElBQXFELEtBQWhELFNBQU0sSUFBTixDQUFXLE1BQVgsQ0FBa0IsUUFBbEIsR0FBNkIsS0FBN0IsQ0FBbUMsT0FBbkMsQ0FBTCxDQUNFLFdBQWEsTUFEZixDQUVFLE1BQ0YsUUFORixDQVVBLEdBQUksV0FBSixDQUNBLE9BQU8sSUFBUCxDQUFZLE1BQU0sSUFBbEIsRUFBd0IsT0FBeEIsQ0FBZ0MsV0FBYSxDQUMzQyxHQUFJLEdBQVcsRUFBSSxLQUFKLENBQVUsR0FBVixDQUFmLENBQ2lCLFNBQWQsS0FBUyxDQUFULENBRndDLEdBR3pDLFFBQVEsRUFBUyxDQUFULENBQVIsRUFBcUIsTUFBTSxJQUFOLENBQVcsQ0FBWCxDQUhvQixDQUs1QyxDQUxELEMsQ0F3QkEsR0FBSSxVQUFXLFdBQWUsQ0FFNUIsR0FJSSxHQUFRLFFBQVEsYUFBUixDQUpaLENBS0ksRUFBSyxFQUFNLEtBQU4sSUFKRixDQUlFLENBQXdCLE9BQXhCLENBTFQsQ0FRQSxRQUFRLEdBQVIsQ0FBWSxXQUFaLENBVjRCLENBYXpCLGVBYnlCLEVBaUIxQixRQUFRLEdBQVIsQ0FBWSxTQUFXLGVBQWUsQ0FBMUIsRUFBNkIsR0FBekMsQ0FqQjBCLENBb0IxQixRQUFRLEdBQVIsQ0FBWSxTQUFaLENBcEIwQixFQXVCMUIsa0JBdkIwQixDQTBCNUIsUUFBUSxHQUFSLENBQVksRUFBRyxNQUFILEVBQVosQ0ExQjRCLENBOEI1QixlQUFpQixFQUFHLE1BRXJCLENBaENELENBMEVBLEdBeENBLFFBQVEsS0FBUixDQUFjLE1BQWQsRUF3Q0EsQ0F2Q0EsUUFBUSxLQUFSLENBQWMsV0FBZCxDQUEwQixNQUExQixDQXVDQSxDQXRDQSxRQUFRLEtBQVIsQ0FBYyxFQUFkLENBQWlCLE1BQWpCLENBQXlCLFdBQWdCLENBR3ZDLFdBQ0UsSUFBa0IsTUFBYixZQUFMLENBQ0UsR0FBSSxFQUFKLENBQVMsQ0FBVCxDQUNBLEdBQUksQ0FDRixFQUFPLEtBQUssS0FBTCxDQUFXLENBQVgsQ0FDUixDQUNELFFBQVEsQ0FDTixFQUFNLE1BQU0sS0FBTixDQUFZLEtBQVosQ0FBa0IsQ0FBbEIsQ0FEQSxJQUVNLDJIQUZOLENBR04sVUFBVSxDQUFWLENBQ0QsQ0FDRCxTQUFTLENBQVQsQ0FWRixDQVdFLE1BQ0YsUUFDRSxHQUFJLEtBQUosQ0FDQSxPQUFPLElBQVAsQ0FBWSxNQUFNLElBQWxCLEVBQXdCLE9BQXhCLENBQWdDLFdBQWEsQ0FDckIsTUFBbkIsS0FBSSxLQUFKLENBQVUsQ0FBVixDQUFZLENBQVosR0FBeUQsV0FBNUIsUUFBTyxPQUFNLElBQU4sQ0FBVyxDQUFYLENBREksR0FFekMsRUFBaUIsRUFBSSxLQUFKLENBQVUsQ0FBVixDQUFqQixFQUFpQyxNQUFNLElBQU4sQ0FBVyxDQUFYLENBRlEsQ0FJNUMsQ0FKRCxDQUZGLENBUUUsSUFBSSxLQUFKLENBQVUsQ0FBVixDQUFnQixDQUFoQixDQUFpQyxhQUFtQixDQUVsRCxHQUFtQixXQUFoQixRQUFPLEVBQVYsQ0FBK0IsQ0FDN0IsR0FBSSxHQUFNLGtCQUFWLENBQ0EsRUFBTSxNQUFNLEtBQU4sQ0FBWSxLQUFaLENBQWtCLENBQWxCLENBRnVCLENBRzdCLEVBQU0sRUFBTSxNQUFOLENBQWUsQ0FIUSxDQUk3QixFQUFNLHFKQUp1QixDQUs3QixVQUFVLENBQVYsQ0FDRCxDQUNELFNBQVMsQ0FBVCxDQUNELENBVkQsQ0FSRixDQWJGLENBaUNELENBcENELENBc0NBLENBQXlCLE9BQXJCLFdBQVEsUUFBWixDQUFrQyxDQUNoQyxHQUFJLEdBQUssUUFBUSxVQUFSLEVBQW9CLGVBQXBCLENBQW9DLENBQzNDLE1BQU8sUUFBUSxLQUQ0QixDQUUzQyxPQUFRLFFBQVEsTUFGMkIsQ0FBcEMsQ0FBVCxDQUtBLEVBQUcsRUFBSCxDQUFNLFFBQU4sQ0FBZ0IsVUFBWSxDQUMxQixRQUFRLElBQVIsQ0FBYSxRQUFiLENBQ0QsQ0FGRCxDQUdELENBRUQsUUFBUSxFQUFSLENBQVcsUUFBWCxDQUFxQixVQUFZLENBRS9CLFFBQVEsSUFBUixFQUNELENBSEQsQyxDQUtBLFFBQVEsRUFBUixDQUFXLE1BQVgsQ0FBbUIsVUFBVyxDQUU1QixRQUFRLEdBQVIsQ0FBWSxXQUFaLENBQ0QsQ0FIRCxDLENBTUEsTUFBTSxJQUFOLENBQWEsTUFBTSxJQUFOLENBQVcsR0FBWCxFQUFnQixJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5leHBvcnRzLnRvQnl0ZUFycmF5ID0gdG9CeXRlQXJyYXlcbmV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXlcblxudmFyIGxvb2t1cCA9IFtdXG52YXIgcmV2TG9va3VwID0gW11cbnZhciBBcnIgPSB0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBVaW50OEFycmF5IDogQXJyYXlcblxudmFyIGNvZGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLydcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gIGxvb2t1cFtpXSA9IGNvZGVbaV1cbiAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpXG59XG5cbnJldkxvb2t1cFsnLScuY2hhckNvZGVBdCgwKV0gPSA2MlxucmV2TG9va3VwWydfJy5jaGFyQ29kZUF0KDApXSA9IDYzXG5cbmZ1bmN0aW9uIHBsYWNlSG9sZGVyc0NvdW50IChiNjQpIHtcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0JylcbiAgfVxuXG4gIC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG4gIC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcbiAgLy8gcmVwcmVzZW50IG9uZSBieXRlXG4gIC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuICAvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG4gIHJldHVybiBiNjRbbGVuIC0gMl0gPT09ICc9JyA/IDIgOiBiNjRbbGVuIC0gMV0gPT09ICc9JyA/IDEgOiAwXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKGI2NCkge1xuICAvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcbiAgcmV0dXJuIChiNjQubGVuZ3RoICogMyAvIDQpIC0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxufVxuXG5mdW5jdGlvbiB0b0J5dGVBcnJheSAoYjY0KSB7XG4gIHZhciBpLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG4gIHBsYWNlSG9sZGVycyA9IHBsYWNlSG9sZGVyc0NvdW50KGI2NClcblxuICBhcnIgPSBuZXcgQXJyKChsZW4gKiAzIC8gNCkgLSBwbGFjZUhvbGRlcnMpXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICBsID0gcGxhY2VIb2xkZXJzID4gMCA/IGxlbiAtIDQgOiBsZW5cblxuICB2YXIgTCA9IDBcblxuICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSA0KSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTgpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA8PCA2KSB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMyldXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDE2KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPj4gNClcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxMCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPj4gMilcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG4gIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDYgJiAweDNGXSArIGxvb2t1cFtudW0gJiAweDNGXVxufVxuXG5mdW5jdGlvbiBlbmNvZGVDaHVuayAodWludDgsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHRtcFxuICB2YXIgb3V0cHV0ID0gW11cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICB0bXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG4gICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpXG4gIH1cbiAgcmV0dXJuIG91dHB1dC5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBmcm9tQnl0ZUFycmF5ICh1aW50OCkge1xuICB2YXIgdG1wXG4gIHZhciBsZW4gPSB1aW50OC5sZW5ndGhcbiAgdmFyIGV4dHJhQnl0ZXMgPSBsZW4gJSAzIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG4gIHZhciBvdXRwdXQgPSAnJ1xuICB2YXIgcGFydHMgPSBbXVxuICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MyAvLyBtdXN0IGJlIG11bHRpcGxlIG9mIDNcblxuICAvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4yID0gbGVuIC0gZXh0cmFCeXRlczsgaSA8IGxlbjI7IGkgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKHVpbnQ4LCBpLCAoaSArIG1heENodW5rTGVuZ3RoKSA+IGxlbjIgPyBsZW4yIDogKGkgKyBtYXhDaHVua0xlbmd0aCkpKVxuICB9XG5cbiAgLy8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuICBpZiAoZXh0cmFCeXRlcyA9PT0gMSkge1xuICAgIHRtcCA9IHVpbnQ4W2xlbiAtIDFdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFt0bXAgPj4gMl1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPDwgNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSAnPT0nXG4gIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgIHRtcCA9ICh1aW50OFtsZW4gLSAyXSA8PCA4KSArICh1aW50OFtsZW4gLSAxXSlcbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAxMF1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9J1xuICB9XG5cbiAgcGFydHMucHVzaChvdXRwdXQpXG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJycpXG59XG4iLCIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gU2xvd0J1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5cbnZhciBLX01BWF9MRU5HVEggPSAweDdmZmZmZmZmXG5leHBvcnRzLmtNYXhMZW5ndGggPSBLX01BWF9MRU5HVEhcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgUHJpbnQgd2FybmluZyBhbmQgcmVjb21tZW5kIHVzaW5nIGBidWZmZXJgIHY0Lnggd2hpY2ggaGFzIGFuIE9iamVjdFxuICogICAgICAgICAgICAgICBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogV2UgcmVwb3J0IHRoYXQgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0eXBlZCBhcnJheXMgaWYgdGhlIGFyZSBub3Qgc3ViY2xhc3NhYmxlXG4gKiB1c2luZyBfX3Byb3RvX18uIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgXG4gKiAoU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzgpLiBJRSAxMCBsYWNrcyBzdXBwb3J0XG4gKiBmb3IgX19wcm90b19fIGFuZCBoYXMgYSBidWdneSB0eXBlZCBhcnJheSBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbmlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgY29uc29sZS5lcnJvcihcbiAgICAnVGhpcyBicm93c2VyIGxhY2tzIHR5cGVkIGFycmF5IChVaW50OEFycmF5KSBzdXBwb3J0IHdoaWNoIGlzIHJlcXVpcmVkIGJ5ICcgK1xuICAgICdgYnVmZmVyYCB2NS54LiBVc2UgYGJ1ZmZlcmAgdjQueCBpZiB5b3UgcmVxdWlyZSBvbGQgYnJvd3NlciBzdXBwb3J0LidcbiAgKVxufVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIC8vIENhbiB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZD9cbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMSlcbiAgICBhcnIuX19wcm90b19fID0ge19fcHJvdG9fXzogVWludDhBcnJheS5wcm90b3R5cGUsIGZvbzogZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfX1cbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MlxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKGxlbmd0aCA+IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHR5cGVkIGFycmF5IGxlbmd0aCcpXG4gIH1cbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgYnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGJ1ZlxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0lmIGVuY29kaW5nIGlzIHNwZWNpZmllZCB0aGVuIHRoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJ1xuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gYWxsb2NVbnNhZmUoYXJnKVxuICB9XG4gIHJldHVybiBmcm9tKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBGaXggc3ViYXJyYXkoKSBpbiBFUzIwMTYuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC85N1xuaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC5zcGVjaWVzICYmXG4gICAgQnVmZmVyW1N5bWJvbC5zcGVjaWVzXSA9PT0gQnVmZmVyKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIsIFN5bWJvbC5zcGVjaWVzLCB7XG4gICAgdmFsdWU6IG51bGwsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiBmYWxzZVxuICB9KVxufVxuXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxuZnVuY3Rpb24gZnJvbSAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBhIG51bWJlcicpXG4gIH1cblxuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQpXG4gIH1cblxuICByZXR1cm4gZnJvbU9iamVjdCh2YWx1ZSlcbn1cblxuLyoqXG4gKiBGdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB0byBCdWZmZXIoYXJnLCBlbmNvZGluZykgYnV0IHRocm93cyBhIFR5cGVFcnJvclxuICogaWYgdmFsdWUgaXMgYSBudW1iZXIuXG4gKiBCdWZmZXIuZnJvbShzdHJbLCBlbmNvZGluZ10pXG4gKiBCdWZmZXIuZnJvbShhcnJheSlcbiAqIEJ1ZmZlci5mcm9tKGJ1ZmZlcilcbiAqIEJ1ZmZlci5mcm9tKGFycmF5QnVmZmVyWywgYnl0ZU9mZnNldFssIGxlbmd0aF1dKVxuICoqL1xuQnVmZmVyLmZyb20gPSBmdW5jdGlvbiAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gZnJvbSh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBOb3RlOiBDaGFuZ2UgcHJvdG90eXBlICphZnRlciogQnVmZmVyLmZyb20gaXMgZGVmaW5lZCB0byB3b3JrYXJvdW5kIENocm9tZSBidWc6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzE0OFxuQnVmZmVyLnByb3RvdHlwZS5fX3Byb3RvX18gPSBVaW50OEFycmF5LnByb3RvdHlwZVxuQnVmZmVyLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXlcblxuZnVuY3Rpb24gYXNzZXJ0U2l6ZSAoc2l6ZSkge1xuICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBiZSBhIG51bWJlcicpXG4gIH0gZWxzZSBpZiAoc2l6ZSA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgbmVnYXRpdmUnKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldHRlZCBhcyBhIHN0YXJ0IG9mZnNldC5cbiAgICByZXR1cm4gdHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJ1xuICAgICAgPyBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICAgIDogY3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbClcbiAgfVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBmaWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogYWxsb2Moc2l6ZVssIGZpbGxbLCBlbmNvZGluZ11dKVxuICoqL1xuQnVmZmVyLmFsbG9jID0gZnVuY3Rpb24gKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIHJldHVybiBhbGxvYyhzaXplLCBmaWxsLCBlbmNvZGluZylcbn1cblxuZnVuY3Rpb24gYWxsb2NVbnNhZmUgKHNpemUpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUgPCAwID8gMCA6IGNoZWNrZWQoc2l6ZSkgfCAwKVxufVxuXG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gQnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gU2xvd0J1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICovXG5CdWZmZXIuYWxsb2NVbnNhZmVTbG93ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgfVxuXG4gIGlmICghQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJlbmNvZGluZ1wiIG11c3QgYmUgYSB2YWxpZCBzdHJpbmcgZW5jb2RpbmcnKVxuICB9XG5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuXG4gIHZhciBhY3R1YWwgPSBidWYud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIGJ1ZiA9IGJ1Zi5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggPCAwID8gMCA6IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICBidWZbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyIChhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdvZmZzZXRcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQgKyAobGVuZ3RoIHx8IDApKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ2xlbmd0aFxcJyBpcyBvdXQgb2YgYm91bmRzJylcbiAgfVxuXG4gIHZhciBidWZcbiAgaWYgKGJ5dGVPZmZzZXQgPT09IHVuZGVmaW5lZCAmJiBsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5KVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIGJ1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAob2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIHZhciBsZW4gPSBjaGVja2VkKG9iai5sZW5ndGgpIHwgMFxuICAgIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuKVxuXG4gICAgaWYgKGJ1Zi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBidWZcbiAgICB9XG5cbiAgICBvYmouY29weShidWYsIDAsIDAsIGxlbilcbiAgICByZXR1cm4gYnVmXG4gIH1cblxuICBpZiAob2JqKSB7XG4gICAgaWYgKGlzQXJyYXlCdWZmZXJWaWV3KG9iaikgfHwgJ2xlbmd0aCcgaW4gb2JqKSB7XG4gICAgICBpZiAodHlwZW9mIG9iai5sZW5ndGggIT09ICdudW1iZXInIHx8IG51bWJlcklzTmFOKG9iai5sZW5ndGgpKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVCdWZmZXIoMClcbiAgICAgIH1cbiAgICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKG9iailcbiAgICB9XG5cbiAgICBpZiAob2JqLnR5cGUgPT09ICdCdWZmZXInICYmIEFycmF5LmlzQXJyYXkob2JqLmRhdGEpKSB7XG4gICAgICByZXR1cm4gZnJvbUFycmF5TGlrZShvYmouZGF0YSlcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgb3IgYXJyYXktbGlrZSBvYmplY3QuJylcbn1cblxuZnVuY3Rpb24gY2hlY2tlZCAobGVuZ3RoKSB7XG4gIC8vIE5vdGU6IGNhbm5vdCB1c2UgYGxlbmd0aCA8IEtfTUFYX0xFTkdUSGAgaGVyZSBiZWNhdXNlIHRoYXQgZmFpbHMgd2hlblxuICAvLyBsZW5ndGggaXMgTmFOICh3aGljaCBpcyBvdGhlcndpc2UgY29lcmNlZCB0byB6ZXJvLilcbiAgaWYgKGxlbmd0aCA+PSBLX01BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnc2l6ZTogMHgnICsgS19NQVhfTEVOR1RILnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuICB9XG4gIHJldHVybiBsZW5ndGggfCAwXG59XG5cbmZ1bmN0aW9uIFNsb3dCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAoK2xlbmd0aCAhPSBsZW5ndGgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICBsZW5ndGggPSAwXG4gIH1cbiAgcmV0dXJuIEJ1ZmZlci5hbGxvYygrbGVuZ3RoKVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlciAoYikge1xuICByZXR1cm4gYiAhPSBudWxsICYmIGIuX2lzQnVmZmVyID09PSB0cnVlXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAoYSwgYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIG11c3QgYmUgQnVmZmVycycpXG4gIH1cblxuICBpZiAoYSA9PT0gYikgcmV0dXJuIDBcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gTWF0aC5taW4oeCwgeSk7IGkgPCBsZW47ICsraSkge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICB4ID0gYVtpXVxuICAgICAgeSA9IGJbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIGlzRW5jb2RpbmcgKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gY29uY2F0IChsaXN0LCBsZW5ndGgpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBCdWZmZXIuYWxsb2MoMClcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGxlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgbGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShsZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGJ1ZiA9IGxpc3RbaV1cbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICAgIH1cbiAgICBidWYuY29weShidWZmZXIsIHBvcylcbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmIChpc0FycmF5QnVmZmVyVmlldyhzdHJpbmcpIHx8IHN0cmluZyBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmdcbiAgfVxuXG4gIHZhciBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChsZW4gPT09IDApIHJldHVybiAwXG5cbiAgLy8gVXNlIGEgZm9yIGxvb3AgdG8gYXZvaWQgcmVjdXJzaW9uXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxlblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gbGVuICogMlxuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGxlbiA+Pj4gMVxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoIC8vIGFzc3VtZSB1dGY4XG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcblxuZnVuY3Rpb24gc2xvd1RvU3RyaW5nIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuXG4gIC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoYXQgXCJ0aGlzLmxlbmd0aCA8PSBNQVhfVUlOVDMyXCIgc2luY2UgaXQncyBhIHJlYWQtb25seVxuICAvLyBwcm9wZXJ0eSBvZiBhIHR5cGVkIGFycmF5LlxuXG4gIC8vIFRoaXMgYmVoYXZlcyBuZWl0aGVyIGxpa2UgU3RyaW5nIG5vciBVaW50OEFycmF5IGluIHRoYXQgd2Ugc2V0IHN0YXJ0L2VuZFxuICAvLyB0byB0aGVpciB1cHBlci9sb3dlciBib3VuZHMgaWYgdGhlIHZhbHVlIHBhc3NlZCBpcyBvdXQgb2YgcmFuZ2UuXG4gIC8vIHVuZGVmaW5lZCBpcyBoYW5kbGVkIHNwZWNpYWxseSBhcyBwZXIgRUNNQS0yNjIgNnRoIEVkaXRpb24sXG4gIC8vIFNlY3Rpb24gMTMuMy4zLjcgUnVudGltZSBTZW1hbnRpY3M6IEtleWVkQmluZGluZ0luaXRpYWxpemF0aW9uLlxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCB8fCBzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICAvLyBSZXR1cm4gZWFybHkgaWYgc3RhcnQgPiB0aGlzLmxlbmd0aC4gRG9uZSBoZXJlIHRvIHByZXZlbnQgcG90ZW50aWFsIHVpbnQzMlxuICAvLyBjb2VyY2lvbiBmYWlsIGJlbG93LlxuICBpZiAoc3RhcnQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChlbmQgPD0gMCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgLy8gRm9yY2UgY29lcnNpb24gdG8gdWludDMyLiBUaGlzIHdpbGwgYWxzbyBjb2VyY2UgZmFsc2V5L05hTiB2YWx1ZXMgdG8gMC5cbiAgZW5kID4+Pj0gMFxuICBzdGFydCA+Pj49IDBcblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHV0ZjE2bGVTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoZW5jb2RpbmcgKyAnJykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuLy8gVGhpcyBwcm9wZXJ0eSBpcyB1c2VkIGJ5IGBCdWZmZXIuaXNCdWZmZXJgIChhbmQgdGhlIGBpcy1idWZmZXJgIG5wbSBwYWNrYWdlKVxuLy8gdG8gZGV0ZWN0IGEgQnVmZmVyIGluc3RhbmNlLiBJdCdzIG5vdCBwb3NzaWJsZSB0byB1c2UgYGluc3RhbmNlb2YgQnVmZmVyYFxuLy8gcmVsaWFibHkgaW4gYSBicm93c2VyaWZ5IGNvbnRleHQgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBtdWx0aXBsZSBkaWZmZXJlbnRcbi8vIGNvcGllcyBvZiB0aGUgJ2J1ZmZlcicgcGFja2FnZSBpbiB1c2UuIFRoaXMgbWV0aG9kIHdvcmtzIGV2ZW4gZm9yIEJ1ZmZlclxuLy8gaW5zdGFuY2VzIHRoYXQgd2VyZSBjcmVhdGVkIGZyb20gYW5vdGhlciBjb3B5IG9mIHRoZSBgYnVmZmVyYCBwYWNrYWdlLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMTU0XG5CdWZmZXIucHJvdG90eXBlLl9pc0J1ZmZlciA9IHRydWVcblxuZnVuY3Rpb24gc3dhcCAoYiwgbiwgbSkge1xuICB2YXIgaSA9IGJbbl1cbiAgYltuXSA9IGJbbV1cbiAgYlttXSA9IGlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMTYgPSBmdW5jdGlvbiBzd2FwMTYgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDIgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDE2LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAxKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDMyID0gZnVuY3Rpb24gc3dhcDMyICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA0ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAzMi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgMilcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXA2NCA9IGZ1bmN0aW9uIHN3YXA2NCAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgOCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gOCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDcpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDYpXG4gICAgc3dhcCh0aGlzLCBpICsgMiwgaSArIDUpXG4gICAgc3dhcCh0aGlzLCBpICsgMywgaSArIDQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW5ndGggPT09IDApIHJldHVybiAnJ1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCAwLCBsZW5ndGgpXG4gIHJldHVybiBzbG93VG9TdHJpbmcuYXBwbHkodGhpcywgYXJndW1lbnRzKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyAoYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIGlmICh0aGlzID09PSBiKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcywgYikgPT09IDBcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5tYXRjaCgvLnsyfS9nKS5qb2luKCcgJylcbiAgICBpZiAodGhpcy5sZW5ndGggPiBtYXgpIHN0ciArPSAnIC4uLiAnXG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBzdHIgKyAnPidcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAodGFyZ2V0LCBzdGFydCwgZW5kLCB0aGlzU3RhcnQsIHRoaXNFbmQpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICB9XG5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICBpZiAoZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmQgPSB0YXJnZXQgPyB0YXJnZXQubGVuZ3RoIDogMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNTdGFydCA9IDBcbiAgfVxuICBpZiAodGhpc0VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc0VuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoc3RhcnQgPCAwIHx8IGVuZCA+IHRhcmdldC5sZW5ndGggfHwgdGhpc1N0YXJ0IDwgMCB8fCB0aGlzRW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCAmJiBzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCkge1xuICAgIHJldHVybiAtMVxuICB9XG4gIGlmIChzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMVxuICB9XG5cbiAgc3RhcnQgPj4+PSAwXG4gIGVuZCA+Pj49IDBcbiAgdGhpc1N0YXJ0ID4+Pj0gMFxuICB0aGlzRW5kID4+Pj0gMFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQpIHJldHVybiAwXG5cbiAgdmFyIHggPSB0aGlzRW5kIC0gdGhpc1N0YXJ0XG4gIHZhciB5ID0gZW5kIC0gc3RhcnRcbiAgdmFyIGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgdmFyIHRoaXNDb3B5ID0gdGhpcy5zbGljZSh0aGlzU3RhcnQsIHRoaXNFbmQpXG4gIHZhciB0YXJnZXRDb3B5ID0gdGFyZ2V0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIGlmICh0aGlzQ29weVtpXSAhPT0gdGFyZ2V0Q29weVtpXSkge1xuICAgICAgeCA9IHRoaXNDb3B5W2ldXG4gICAgICB5ID0gdGFyZ2V0Q29weVtpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbi8vIEZpbmRzIGVpdGhlciB0aGUgZmlyc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0ID49IGBieXRlT2Zmc2V0YCxcbi8vIE9SIHRoZSBsYXN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA8PSBgYnl0ZU9mZnNldGAuXG4vL1xuLy8gQXJndW1lbnRzOlxuLy8gLSBidWZmZXIgLSBhIEJ1ZmZlciB0byBzZWFyY2hcbi8vIC0gdmFsIC0gYSBzdHJpbmcsIEJ1ZmZlciwgb3IgbnVtYmVyXG4vLyAtIGJ5dGVPZmZzZXQgLSBhbiBpbmRleCBpbnRvIGBidWZmZXJgOyB3aWxsIGJlIGNsYW1wZWQgdG8gYW4gaW50MzJcbi8vIC0gZW5jb2RpbmcgLSBhbiBvcHRpb25hbCBlbmNvZGluZywgcmVsZXZhbnQgaXMgdmFsIGlzIGEgc3RyaW5nXG4vLyAtIGRpciAtIHRydWUgZm9yIGluZGV4T2YsIGZhbHNlIGZvciBsYXN0SW5kZXhPZlxuZnVuY3Rpb24gYmlkaXJlY3Rpb25hbEluZGV4T2YgKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIC8vIEVtcHR5IGJ1ZmZlciBtZWFucyBubyBtYXRjaFxuICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xXG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXRcbiAgaWYgKHR5cGVvZiBieXRlT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gYnl0ZU9mZnNldFxuICAgIGJ5dGVPZmZzZXQgPSAwXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA+IDB4N2ZmZmZmZmYpIHtcbiAgICBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAtMHg4MDAwMDAwMCkge1xuICAgIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICB9XG4gIGJ5dGVPZmZzZXQgPSArYnl0ZU9mZnNldCAgLy8gQ29lcmNlIHRvIE51bWJlci5cbiAgaWYgKG51bWJlcklzTmFOKGJ5dGVPZmZzZXQpKSB7XG4gICAgLy8gYnl0ZU9mZnNldDogaXQgaXQncyB1bmRlZmluZWQsIG51bGwsIE5hTiwgXCJmb29cIiwgZXRjLCBzZWFyY2ggd2hvbGUgYnVmZmVyXG4gICAgYnl0ZU9mZnNldCA9IGRpciA/IDAgOiAoYnVmZmVyLmxlbmd0aCAtIDEpXG4gIH1cblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldDogbmVnYXRpdmUgb2Zmc2V0cyBzdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICBpZiAoYnl0ZU9mZnNldCA8IDApIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoICsgYnl0ZU9mZnNldFxuICBpZiAoYnl0ZU9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgaWYgKGRpcikgcmV0dXJuIC0xXG4gICAgZWxzZSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCAtIDFcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgMCkge1xuICAgIGlmIChkaXIpIGJ5dGVPZmZzZXQgPSAwXG4gICAgZWxzZSByZXR1cm4gLTFcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB2YWxcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsID0gQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgfVxuXG4gIC8vIEZpbmFsbHksIHNlYXJjaCBlaXRoZXIgaW5kZXhPZiAoaWYgZGlyIGlzIHRydWUpIG9yIGxhc3RJbmRleE9mXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogbG9va2luZyBmb3IgZW1wdHkgc3RyaW5nL2J1ZmZlciBhbHdheXMgZmFpbHNcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAweEZGIC8vIFNlYXJjaCBmb3IgYSBieXRlIHZhbHVlIFswLTI1NV1cbiAgICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgWyB2YWwgXSwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbCBtdXN0IGJlIHN0cmluZywgbnVtYmVyIG9yIEJ1ZmZlcicpXG59XG5cbmZ1bmN0aW9uIGFycmF5SW5kZXhPZiAoYXJyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgdmFyIGluZGV4U2l6ZSA9IDFcbiAgdmFyIGFyckxlbmd0aCA9IGFyci5sZW5ndGhcbiAgdmFyIHZhbExlbmd0aCA9IHZhbC5sZW5ndGhcblxuICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKGVuY29kaW5nID09PSAndWNzMicgfHwgZW5jb2RpbmcgPT09ICd1Y3MtMicgfHxcbiAgICAgICAgZW5jb2RpbmcgPT09ICd1dGYxNmxlJyB8fCBlbmNvZGluZyA9PT0gJ3V0Zi0xNmxlJykge1xuICAgICAgaWYgKGFyci5sZW5ndGggPCAyIHx8IHZhbC5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuICAgICAgaW5kZXhTaXplID0gMlxuICAgICAgYXJyTGVuZ3RoIC89IDJcbiAgICAgIHZhbExlbmd0aCAvPSAyXG4gICAgICBieXRlT2Zmc2V0IC89IDJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWFkIChidWYsIGkpIHtcbiAgICBpZiAoaW5kZXhTaXplID09PSAxKSB7XG4gICAgICByZXR1cm4gYnVmW2ldXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBidWYucmVhZFVJbnQxNkJFKGkgKiBpbmRleFNpemUpXG4gICAgfVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGRpcikge1xuICAgIHZhciBmb3VuZEluZGV4ID0gLTFcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpIDwgYXJyTGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChyZWFkKGFyciwgaSkgPT09IHJlYWQodmFsLCBmb3VuZEluZGV4ID09PSAtMSA/IDAgOiBpIC0gZm91bmRJbmRleCkpIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSBmb3VuZEluZGV4ID0gaVxuICAgICAgICBpZiAoaSAtIGZvdW5kSW5kZXggKyAxID09PSB2YWxMZW5ndGgpIHJldHVybiBmb3VuZEluZGV4ICogaW5kZXhTaXplXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZm91bmRJbmRleCAhPT0gLTEpIGkgLT0gaSAtIGZvdW5kSW5kZXhcbiAgICAgICAgZm91bmRJbmRleCA9IC0xXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChieXRlT2Zmc2V0ICsgdmFsTGVuZ3RoID4gYXJyTGVuZ3RoKSBieXRlT2Zmc2V0ID0gYXJyTGVuZ3RoIC0gdmFsTGVuZ3RoXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBmb3VuZCA9IHRydWVcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKHJlYWQoYXJyLCBpICsgaikgIT09IHJlYWQodmFsLCBqKSkge1xuICAgICAgICAgIGZvdW5kID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZm91bmQpIHJldHVybiBpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlcyAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gdGhpcy5pbmRleE9mKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpICE9PSAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCB0cnVlKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmxhc3RJbmRleE9mID0gZnVuY3Rpb24gbGFzdEluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiBoZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChzdHJMZW4gJSAyICE9PSAwKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgcGFyc2VkID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChudW1iZXJJc05hTihwYXJzZWQpKSByZXR1cm4gaVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gbGF0aW4xV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB1Y3MyV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgb2Zmc2V0WywgbGVuZ3RoXVssIGVuY29kaW5nXSlcbiAgfSBlbHNlIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gICAgaWYgKGlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCA+Pj4gMFxuICAgICAgaWYgKGVuY29kaW5nID09PSB1bmRlZmluZWQpIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgfSBlbHNlIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0J1ZmZlci53cml0ZShzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXRbLCBsZW5ndGhdKSBpcyBubyBsb25nZXIgc3VwcG9ydGVkJ1xuICAgIClcbiAgfVxuXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoID4gcmVtYWluaW5nKSBsZW5ndGggPSByZW1haW5pbmdcblxuICBpZiAoKHN0cmluZy5sZW5ndGggPiAwICYmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDApKSB8fCBvZmZzZXQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgdmFyIHJlcyA9IFtdXG5cbiAgdmFyIGkgPSBzdGFydFxuICB3aGlsZSAoaSA8IGVuZCkge1xuICAgIHZhciBmaXJzdEJ5dGUgPSBidWZbaV1cbiAgICB2YXIgY29kZVBvaW50ID0gbnVsbFxuICAgIHZhciBieXRlc1BlclNlcXVlbmNlID0gKGZpcnN0Qnl0ZSA+IDB4RUYpID8gNFxuICAgICAgOiAoZmlyc3RCeXRlID4gMHhERikgPyAzXG4gICAgICA6IChmaXJzdEJ5dGUgPiAweEJGKSA/IDJcbiAgICAgIDogMVxuXG4gICAgaWYgKGkgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgdmFyIHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludFxuXG4gICAgICBzd2l0Y2ggKGJ5dGVzUGVyU2VxdWVuY2UpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChmaXJzdEJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSBmaXJzdEJ5dGVcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHgxRikgPDwgMHg2IHwgKHNlY29uZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4QyB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKHRoaXJkQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0ZGICYmICh0ZW1wQ29kZVBvaW50IDwgMHhEODAwIHx8IHRlbXBDb2RlUG9pbnQgPiAweERGRkYpKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGZvdXJ0aEJ5dGUgPSBidWZbaSArIDNdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwICYmIChmb3VydGhCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweDEyIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweEMgfCAodGhpcmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKGZvdXJ0aEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweEZGRkYgJiYgdGVtcENvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhGRkZEXG4gICAgICBieXRlc1BlclNlcXVlbmNlID0gMVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG4gICAgICAvLyBlbmNvZGUgdG8gdXRmMTYgKHN1cnJvZ2F0ZSBwYWlyIGRhbmNlKVxuICAgICAgY29kZVBvaW50IC09IDB4MTAwMDBcbiAgICAgIHJlcy5wdXNoKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMClcbiAgICAgIGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGXG4gICAgfVxuXG4gICAgcmVzLnB1c2goY29kZVBvaW50KVxuICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZUNvZGVQb2ludHNBcnJheShyZXMpXG59XG5cbi8vIEJhc2VkIG9uIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyNzQ3MjcyLzY4MDc0MiwgdGhlIGJyb3dzZXIgd2l0aFxuLy8gdGhlIGxvd2VzdCBsaW1pdCBpcyBDaHJvbWUsIHdpdGggMHgxMDAwMCBhcmdzLlxuLy8gV2UgZ28gMSBtYWduaXR1ZGUgbGVzcywgZm9yIHNhZmV0eVxudmFyIE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICB2YXIgbGVuID0gY29kZVBvaW50cy5sZW5ndGhcbiAgaWYgKGxlbiA8PSBNQVhfQVJHVU1FTlRTX0xFTkdUSCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVBvaW50cykgLy8gYXZvaWQgZXh0cmEgc2xpY2UoKVxuICB9XG5cbiAgLy8gRGVjb2RlIGluIGNodW5rcyB0byBhdm9pZCBcImNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLlxuICB2YXIgcmVzID0gJydcbiAgdmFyIGkgPSAwXG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoXG4gICAgICBTdHJpbmcsXG4gICAgICBjb2RlUG9pbnRzLnNsaWNlKGksIGkgKz0gTUFYX0FSR1VNRU5UU19MRU5HVEgpXG4gICAgKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0gJiAweDdGKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gbGF0aW4xU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIChieXRlc1tpICsgMV0gKiAyNTYpKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIHNsaWNlIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IH5+c3RhcnRcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB+fmVuZFxuXG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCArPSBsZW5cbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMCkgZW5kID0gMFxuICB9IGVsc2UgaWYgKGVuZCA+IGxlbikge1xuICAgIGVuZCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIHZhciBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIG5ld0J1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBuZXdCdWZcbn1cblxuLypcbiAqIE5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYnVmZmVyIGlzbid0IHRyeWluZyB0byB3cml0ZSBvdXQgb2YgYm91bmRzLlxuICovXG5mdW5jdGlvbiBjaGVja09mZnNldCAob2Zmc2V0LCBleHQsIGxlbmd0aCkge1xuICBpZiAoKG9mZnNldCAlIDEpICE9PSAwIHx8IG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVHJ5aW5nIHRvIGFjY2VzcyBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50QkUgPSBmdW5jdGlvbiByZWFkVUludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF1cbiAgdmFyIG11bCA9IDFcbiAgd2hpbGUgKGJ5dGVMZW5ndGggPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiByZWFkVUludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICgodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikpICtcbiAgICAgICh0aGlzW29mZnNldCArIDNdICogMHgxMDAwMDAwKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSAqIDB4MTAwMDAwMCkgK1xuICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICB0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRMRSA9IGZ1bmN0aW9uIHJlYWRJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkUgPSBmdW5jdGlvbiByZWFkSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoXG4gIHZhciBtdWwgPSAxXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0taV1cbiAgd2hpbGUgKGkgPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1pXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiByZWFkSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpIHJldHVybiAodGhpc1tvZmZzZXRdKVxuICByZXR1cm4gKCgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gcmVhZEludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdExFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiByZWFkRmxvYXRCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiByZWFkRG91YmxlTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiByZWFkRG91YmxlQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgNTIsIDgpXG59XG5cbmZ1bmN0aW9uIGNoZWNrSW50IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJidWZmZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludEJFID0gZnVuY3Rpb24gd3JpdGVVSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVVSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4ZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgKDggKiBieXRlTGVuZ3RoKSAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gMFxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgLSAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50QkUgPSBmdW5jdGlvbiB3cml0ZUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsICg4ICogYnl0ZUxlbmd0aCkgLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpICsgMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiB3cml0ZUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweDdmLCAtMHg4MClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gd3JpdGVGbG9hdExFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDgsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gY29weSAodGFyZ2V0LCB0YXJnZXRTdGFydCwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0U3RhcnQgPj0gdGFyZ2V0Lmxlbmd0aCkgdGFyZ2V0U3RhcnQgPSB0YXJnZXQubGVuZ3RoXG4gIGlmICghdGFyZ2V0U3RhcnQpIHRhcmdldFN0YXJ0ID0gMFxuICBpZiAoZW5kID4gMCAmJiBlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiAwXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKHRhcmdldFN0YXJ0IDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgfVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChlbmQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCA8IGVuZCAtIHN0YXJ0KSB7XG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0ICsgc3RhcnRcbiAgfVxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuICB2YXIgaVxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgc3RhcnQgPCB0YXJnZXRTdGFydCAmJiB0YXJnZXRTdGFydCA8IGVuZCkge1xuICAgIC8vIGRlc2NlbmRpbmcgY29weSBmcm9tIGVuZFxuICAgIGZvciAoaSA9IGxlbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIGlmIChsZW4gPCAxMDAwKSB7XG4gICAgLy8gYXNjZW5kaW5nIGNvcHkgZnJvbSBzdGFydFxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgVWludDhBcnJheS5wcm90b3R5cGUuc2V0LmNhbGwoXG4gICAgICB0YXJnZXQsXG4gICAgICB0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksXG4gICAgICB0YXJnZXRTdGFydFxuICAgIClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gVXNhZ2U6XG4vLyAgICBidWZmZXIuZmlsbChudW1iZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKGJ1ZmZlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoc3RyaW5nWywgb2Zmc2V0WywgZW5kXV1bLCBlbmNvZGluZ10pXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWwsIHN0YXJ0LCBlbmQsIGVuY29kaW5nKSB7XG4gIC8vIEhhbmRsZSBzdHJpbmcgY2FzZXM6XG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IHN0YXJ0XG4gICAgICBzdGFydCA9IDBcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5kID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBlbmRcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfVxuICAgIGlmICh2YWwubGVuZ3RoID09PSAxKSB7XG4gICAgICB2YXIgY29kZSA9IHZhbC5jaGFyQ29kZUF0KDApXG4gICAgICBpZiAoY29kZSA8IDI1Nikge1xuICAgICAgICB2YWwgPSBjb2RlXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuY29kaW5nIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMjU1XG4gIH1cblxuICAvLyBJbnZhbGlkIHJhbmdlcyBhcmUgbm90IHNldCB0byBhIGRlZmF1bHQsIHNvIGNhbiByYW5nZSBjaGVjayBlYXJseS5cbiAgaWYgKHN0YXJ0IDwgMCB8fCB0aGlzLmxlbmd0aCA8IHN0YXJ0IHx8IHRoaXMubGVuZ3RoIDwgZW5kKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ091dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHN0YXJ0ID0gc3RhcnQgPj4+IDBcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghdmFsKSB2YWwgPSAwXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpc1tpXSA9IHZhbFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogbmV3IEJ1ZmZlcih2YWwsIGVuY29kaW5nKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBmb3IgKGkgPSAwOyBpIDwgZW5kIC0gc3RhcnQ7ICsraSkge1xuICAgICAgdGhpc1tpICsgc3RhcnRdID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXisvMC05QS1aYS16LV9dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyLnRyaW0oKS5yZXBsYWNlKElOVkFMSURfQkFTRTY0X1JFLCAnJylcbiAgLy8gTm9kZSBjb252ZXJ0cyBzdHJpbmdzIHdpdGggbGVuZ3RoIDwgMiB0byAnJ1xuICBpZiAoc3RyLmxlbmd0aCA8IDIpIHJldHVybiAnJ1xuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgdmFyIGNvZGVQb2ludFxuICB2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgdmFyIGJ5dGVzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICghbGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMiBsZWFkcyBpbiBhIHJvd1xuICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgY29kZVBvaW50ID0gKGxlYWRTdXJyb2dhdGUgLSAweEQ4MDAgPDwgMTAgfCBjb2RlUG9pbnQgLSAweERDMDApICsgMHgxMDAwMFxuICAgIH0gZWxzZSBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgLy8gdmFsaWQgYm1wIGNoYXIsIGJ1dCBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgfVxuXG4gICAgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDgwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2IHwgMHhDMCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyB8IDB4RTAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDEyIHwgMHhGMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb2RlIHBvaW50JylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcblxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KGJhc2U2NGNsZWFuKHN0cikpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbi8vIE5vZGUgMC4xMCBzdXBwb3J0cyBgQXJyYXlCdWZmZXJgIGJ1dCBsYWNrcyBgQXJyYXlCdWZmZXIuaXNWaWV3YFxuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcgKG9iaikge1xuICByZXR1cm4gKHR5cGVvZiBBcnJheUJ1ZmZlci5pc1ZpZXcgPT09ICdmdW5jdGlvbicpICYmIEFycmF5QnVmZmVyLmlzVmlldyhvYmopXG59XG5cbmZ1bmN0aW9uIG51bWJlcklzTmFOIChvYmopIHtcbiAgcmV0dXJuIG9iaiAhPT0gb2JqIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cblxuZnVuY3Rpb24gaXNBcnJheShhcmcpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhcmcpO1xuICB9XG4gIHJldHVybiBvYmplY3RUb1N0cmluZyhhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gQnVmZmVyLmlzQnVmZmVyO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLyohXG4gKiBEZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgQnVmZmVyXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxuLy8gVGhlIF9pc0J1ZmZlciBjaGVjayBpcyBmb3IgU2FmYXJpIDUtNyBzdXBwb3J0LCBiZWNhdXNlIGl0J3MgbWlzc2luZ1xuLy8gT2JqZWN0LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogIT0gbnVsbCAmJiAoaXNCdWZmZXIob2JqKSB8fCBpc1Nsb3dCdWZmZXIob2JqKSB8fCAhIW9iai5faXNCdWZmZXIpXG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyIChvYmopIHtcbiAgcmV0dXJuICEhb2JqLmNvbnN0cnVjdG9yICYmIHR5cGVvZiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyKG9iailcbn1cblxuLy8gRm9yIE5vZGUgdjAuMTAgc3VwcG9ydC4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseS5cbmZ1bmN0aW9uIGlzU2xvd0J1ZmZlciAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqLnJlYWRGbG9hdExFID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvYmouc2xpY2UgPT09ICdmdW5jdGlvbicgJiYgaXNCdWZmZXIob2JqLnNsaWNlKDAsIDApKVxufVxuIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYXJyKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmlmICghcHJvY2Vzcy52ZXJzaW9uIHx8XG4gICAgcHJvY2Vzcy52ZXJzaW9uLmluZGV4T2YoJ3YwLicpID09PSAwIHx8XG4gICAgcHJvY2Vzcy52ZXJzaW9uLmluZGV4T2YoJ3YxLicpID09PSAwICYmIHByb2Nlc3MudmVyc2lvbi5pbmRleE9mKCd2MS44LicpICE9PSAwKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gbmV4dFRpY2s7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHByb2Nlc3MubmV4dFRpY2s7XG59XG5cbmZ1bmN0aW9uIG5leHRUaWNrKGZuLCBhcmcxLCBhcmcyLCBhcmczKSB7XG4gIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImNhbGxiYWNrXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIH1cbiAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHZhciBhcmdzLCBpO1xuICBzd2l0Y2ggKGxlbikge1xuICBjYXNlIDA6XG4gIGNhc2UgMTpcbiAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmbik7XG4gIGNhc2UgMjpcbiAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiBhZnRlclRpY2tPbmUoKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIGFyZzEpO1xuICAgIH0pO1xuICBjYXNlIDM6XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gYWZ0ZXJUaWNrVHdvKCkge1xuICAgICAgZm4uY2FsbChudWxsLCBhcmcxLCBhcmcyKTtcbiAgICB9KTtcbiAgY2FzZSA0OlxuICAgIHJldHVybiBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uIGFmdGVyVGlja1RocmVlKCkge1xuICAgICAgZm4uY2FsbChudWxsLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgICB9KTtcbiAgZGVmYXVsdDpcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgYXJncy5sZW5ndGgpIHtcbiAgICAgIGFyZ3NbaSsrXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gYWZ0ZXJUaWNrKCkge1xuICAgICAgZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfSk7XG4gIH1cbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL19zdHJlYW1fZHVwbGV4LmpzJyk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gYSBkdXBsZXggc3RyZWFtIGlzIGp1c3QgYSBzdHJlYW0gdGhhdCBpcyBib3RoIHJlYWRhYmxlIGFuZCB3cml0YWJsZS5cbi8vIFNpbmNlIEpTIGRvZXNuJ3QgaGF2ZSBtdWx0aXBsZSBwcm90b3R5cGFsIGluaGVyaXRhbmNlLCB0aGlzIGNsYXNzXG4vLyBwcm90b3R5cGFsbHkgaW5oZXJpdHMgZnJvbSBSZWFkYWJsZSwgYW5kIHRoZW4gcGFyYXNpdGljYWxseSBmcm9tXG4vLyBXcml0YWJsZS5cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xuXG52YXIgcHJvY2Vzc05leHRUaWNrID0gcmVxdWlyZSgncHJvY2Vzcy1uZXh0aWNrLWFyZ3MnKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBrZXlzLnB1c2goa2V5KTtcbiAgfXJldHVybiBrZXlzO1xufTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG5tb2R1bGUuZXhwb3J0cyA9IER1cGxleDtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciB1dGlsID0gcmVxdWlyZSgnY29yZS11dGlsLWlzJyk7XG51dGlsLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG52YXIgUmVhZGFibGUgPSByZXF1aXJlKCcuL19zdHJlYW1fcmVhZGFibGUnKTtcbnZhciBXcml0YWJsZSA9IHJlcXVpcmUoJy4vX3N0cmVhbV93cml0YWJsZScpO1xuXG51dGlsLmluaGVyaXRzKER1cGxleCwgUmVhZGFibGUpO1xuXG52YXIga2V5cyA9IG9iamVjdEtleXMoV3JpdGFibGUucHJvdG90eXBlKTtcbmZvciAodmFyIHYgPSAwOyB2IDwga2V5cy5sZW5ndGg7IHYrKykge1xuICB2YXIgbWV0aG9kID0ga2V5c1t2XTtcbiAgaWYgKCFEdXBsZXgucHJvdG90eXBlW21ldGhvZF0pIER1cGxleC5wcm90b3R5cGVbbWV0aG9kXSA9IFdyaXRhYmxlLnByb3RvdHlwZVttZXRob2RdO1xufVxuXG5mdW5jdGlvbiBEdXBsZXgob3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRHVwbGV4KSkgcmV0dXJuIG5ldyBEdXBsZXgob3B0aW9ucyk7XG5cbiAgUmVhZGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgV3JpdGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJlYWRhYmxlID09PSBmYWxzZSkgdGhpcy5yZWFkYWJsZSA9IGZhbHNlO1xuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMud3JpdGFibGUgPT09IGZhbHNlKSB0aGlzLndyaXRhYmxlID0gZmFsc2U7XG5cbiAgdGhpcy5hbGxvd0hhbGZPcGVuID0gdHJ1ZTtcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5hbGxvd0hhbGZPcGVuID09PSBmYWxzZSkgdGhpcy5hbGxvd0hhbGZPcGVuID0gZmFsc2U7XG5cbiAgdGhpcy5vbmNlKCdlbmQnLCBvbmVuZCk7XG59XG5cbi8vIHRoZSBuby1oYWxmLW9wZW4gZW5mb3JjZXJcbmZ1bmN0aW9uIG9uZW5kKCkge1xuICAvLyBpZiB3ZSBhbGxvdyBoYWxmLW9wZW4gc3RhdGUsIG9yIGlmIHRoZSB3cml0YWJsZSBzaWRlIGVuZGVkLFxuICAvLyB0aGVuIHdlJ3JlIG9rLlxuICBpZiAodGhpcy5hbGxvd0hhbGZPcGVuIHx8IHRoaXMuX3dyaXRhYmxlU3RhdGUuZW5kZWQpIHJldHVybjtcblxuICAvLyBubyBtb3JlIGRhdGEgY2FuIGJlIHdyaXR0ZW4uXG4gIC8vIEJ1dCBhbGxvdyBtb3JlIHdyaXRlcyB0byBoYXBwZW4gaW4gdGhpcyB0aWNrLlxuICBwcm9jZXNzTmV4dFRpY2sob25FbmROVCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uRW5kTlQoc2VsZikge1xuICBzZWxmLmVuZCgpO1xufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoRHVwbGV4LnByb3RvdHlwZSwgJ2Rlc3Ryb3llZCcsIHtcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX3JlYWRhYmxlU3RhdGUgPT09IHVuZGVmaW5lZCB8fCB0aGlzLl93cml0YWJsZVN0YXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3JlYWRhYmxlU3RhdGUuZGVzdHJveWVkICYmIHRoaXMuX3dyaXRhYmxlU3RhdGUuZGVzdHJveWVkO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIHdlIGlnbm9yZSB0aGUgdmFsdWUgaWYgdGhlIHN0cmVhbVxuICAgIC8vIGhhcyBub3QgYmVlbiBpbml0aWFsaXplZCB5ZXRcbiAgICBpZiAodGhpcy5fcmVhZGFibGVTdGF0ZSA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuX3dyaXRhYmxlU3RhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGJhY2t3YXJkIGNvbXBhdGliaWxpdHksIHRoZSB1c2VyIGlzIGV4cGxpY2l0bHlcbiAgICAvLyBtYW5hZ2luZyBkZXN0cm95ZWRcbiAgICB0aGlzLl9yZWFkYWJsZVN0YXRlLmRlc3Ryb3llZCA9IHZhbHVlO1xuICAgIHRoaXMuX3dyaXRhYmxlU3RhdGUuZGVzdHJveWVkID0gdmFsdWU7XG4gIH1cbn0pO1xuXG5EdXBsZXgucHJvdG90eXBlLl9kZXN0cm95ID0gZnVuY3Rpb24gKGVyciwgY2IpIHtcbiAgdGhpcy5wdXNoKG51bGwpO1xuICB0aGlzLmVuZCgpO1xuXG4gIHByb2Nlc3NOZXh0VGljayhjYiwgZXJyKTtcbn07XG5cbmZ1bmN0aW9uIGZvckVhY2goeHMsIGYpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB4cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmKHhzW2ldLCBpKTtcbiAgfVxufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBhIHBhc3N0aHJvdWdoIHN0cmVhbS5cbi8vIGJhc2ljYWxseSBqdXN0IHRoZSBtb3N0IG1pbmltYWwgc29ydCBvZiBUcmFuc2Zvcm0gc3RyZWFtLlxuLy8gRXZlcnkgd3JpdHRlbiBjaHVuayBnZXRzIG91dHB1dCBhcy1pcy5cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBhc3NUaHJvdWdoO1xuXG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnLi9fc3RyZWFtX3RyYW5zZm9ybScpO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHV0aWwgPSByZXF1aXJlKCdjb3JlLXV0aWwtaXMnKTtcbnV0aWwuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbnV0aWwuaW5oZXJpdHMoUGFzc1Rocm91Z2gsIFRyYW5zZm9ybSk7XG5cbmZ1bmN0aW9uIFBhc3NUaHJvdWdoKG9wdGlvbnMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFBhc3NUaHJvdWdoKSkgcmV0dXJuIG5ldyBQYXNzVGhyb3VnaChvcHRpb25zKTtcblxuICBUcmFuc2Zvcm0uY2FsbCh0aGlzLCBvcHRpb25zKTtcbn1cblxuUGFzc1Rocm91Z2gucHJvdG90eXBlLl90cmFuc2Zvcm0gPSBmdW5jdGlvbiAoY2h1bmssIGVuY29kaW5nLCBjYikge1xuICBjYihudWxsLCBjaHVuayk7XG59OyIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8qPHJlcGxhY2VtZW50PiovXG5cbnZhciBwcm9jZXNzTmV4dFRpY2sgPSByZXF1aXJlKCdwcm9jZXNzLW5leHRpY2stYXJncycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbm1vZHVsZS5leHBvcnRzID0gUmVhZGFibGU7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzYXJyYXknKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIER1cGxleDtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG5SZWFkYWJsZS5SZWFkYWJsZVN0YXRlID0gUmVhZGFibGVTdGF0ZTtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBFRSA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcblxudmFyIEVFbGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uIChlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVycyh0eXBlKS5sZW5ndGg7XG59O1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgU3RyZWFtID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9zdHJlYW1zL3N0cmVhbScpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbi8vIFRPRE8oYm1ldXJlcik6IENoYW5nZSB0aGlzIGJhY2sgdG8gY29uc3Qgb25jZSBob2xlIGNoZWNrcyBhcmVcbi8vIHByb3Blcmx5IG9wdGltaXplZCBhd2F5IGVhcmx5IGluIElnbml0aW9uK1R1cmJvRmFuLlxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBCdWZmZXIgPSByZXF1aXJlKCdzYWZlLWJ1ZmZlcicpLkJ1ZmZlcjtcbnZhciBPdXJVaW50OEFycmF5ID0gZ2xvYmFsLlVpbnQ4QXJyYXkgfHwgZnVuY3Rpb24gKCkge307XG5mdW5jdGlvbiBfdWludDhBcnJheVRvQnVmZmVyKGNodW5rKSB7XG4gIHJldHVybiBCdWZmZXIuZnJvbShjaHVuayk7XG59XG5mdW5jdGlvbiBfaXNVaW50OEFycmF5KG9iaikge1xuICByZXR1cm4gQnVmZmVyLmlzQnVmZmVyKG9iaikgfHwgb2JqIGluc3RhbmNlb2YgT3VyVWludDhBcnJheTtcbn1cbi8qPC9yZXBsYWNlbWVudD4qL1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHV0aWwgPSByZXF1aXJlKCdjb3JlLXV0aWwtaXMnKTtcbnV0aWwuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgZGVidWdVdGlsID0gcmVxdWlyZSgndXRpbCcpO1xudmFyIGRlYnVnID0gdm9pZCAwO1xuaWYgKGRlYnVnVXRpbCAmJiBkZWJ1Z1V0aWwuZGVidWdsb2cpIHtcbiAgZGVidWcgPSBkZWJ1Z1V0aWwuZGVidWdsb2coJ3N0cmVhbScpO1xufSBlbHNlIHtcbiAgZGVidWcgPSBmdW5jdGlvbiAoKSB7fTtcbn1cbi8qPC9yZXBsYWNlbWVudD4qL1xuXG52YXIgQnVmZmVyTGlzdCA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvc3RyZWFtcy9CdWZmZXJMaXN0Jyk7XG52YXIgZGVzdHJveUltcGwgPSByZXF1aXJlKCcuL2ludGVybmFsL3N0cmVhbXMvZGVzdHJveScpO1xudmFyIFN0cmluZ0RlY29kZXI7XG5cbnV0aWwuaW5oZXJpdHMoUmVhZGFibGUsIFN0cmVhbSk7XG5cbnZhciBrUHJveHlFdmVudHMgPSBbJ2Vycm9yJywgJ2Nsb3NlJywgJ2Rlc3Ryb3knLCAncGF1c2UnLCAncmVzdW1lJ107XG5cbmZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcihlbWl0dGVyLCBldmVudCwgZm4pIHtcbiAgLy8gU2FkbHkgdGhpcyBpcyBub3QgY2FjaGVhYmxlIGFzIHNvbWUgbGlicmFyaWVzIGJ1bmRsZSB0aGVpciBvd25cbiAgLy8gZXZlbnQgZW1pdHRlciBpbXBsZW1lbnRhdGlvbiB3aXRoIHRoZW0uXG4gIGlmICh0eXBlb2YgZW1pdHRlci5wcmVwZW5kTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5wcmVwZW5kTGlzdGVuZXIoZXZlbnQsIGZuKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGlzIGlzIGEgaGFjayB0byBtYWtlIHN1cmUgdGhhdCBvdXIgZXJyb3IgaGFuZGxlciBpcyBhdHRhY2hlZCBiZWZvcmUgYW55XG4gICAgLy8gdXNlcmxhbmQgb25lcy4gIE5FVkVSIERPIFRISVMuIFRoaXMgaXMgaGVyZSBvbmx5IGJlY2F1c2UgdGhpcyBjb2RlIG5lZWRzXG4gICAgLy8gdG8gY29udGludWUgdG8gd29yayB3aXRoIG9sZGVyIHZlcnNpb25zIG9mIE5vZGUuanMgdGhhdCBkbyBub3QgaW5jbHVkZVxuICAgIC8vIHRoZSBwcmVwZW5kTGlzdGVuZXIoKSBtZXRob2QuIFRoZSBnb2FsIGlzIHRvIGV2ZW50dWFsbHkgcmVtb3ZlIHRoaXMgaGFjay5cbiAgICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW2V2ZW50XSkgZW1pdHRlci5vbihldmVudCwgZm4pO2Vsc2UgaWYgKGlzQXJyYXkoZW1pdHRlci5fZXZlbnRzW2V2ZW50XSkpIGVtaXR0ZXIuX2V2ZW50c1tldmVudF0udW5zaGlmdChmbik7ZWxzZSBlbWl0dGVyLl9ldmVudHNbZXZlbnRdID0gW2ZuLCBlbWl0dGVyLl9ldmVudHNbZXZlbnRdXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBSZWFkYWJsZVN0YXRlKG9wdGlvbnMsIHN0cmVhbSkge1xuICBEdXBsZXggPSBEdXBsZXggfHwgcmVxdWlyZSgnLi9fc3RyZWFtX2R1cGxleCcpO1xuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIC8vIG9iamVjdCBzdHJlYW0gZmxhZy4gVXNlZCB0byBtYWtlIHJlYWQobikgaWdub3JlIG4gYW5kIHRvXG4gIC8vIG1ha2UgYWxsIHRoZSBidWZmZXIgbWVyZ2luZyBhbmQgbGVuZ3RoIGNoZWNrcyBnbyBhd2F5XG4gIHRoaXMub2JqZWN0TW9kZSA9ICEhb3B0aW9ucy5vYmplY3RNb2RlO1xuXG4gIGlmIChzdHJlYW0gaW5zdGFuY2VvZiBEdXBsZXgpIHRoaXMub2JqZWN0TW9kZSA9IHRoaXMub2JqZWN0TW9kZSB8fCAhIW9wdGlvbnMucmVhZGFibGVPYmplY3RNb2RlO1xuXG4gIC8vIHRoZSBwb2ludCBhdCB3aGljaCBpdCBzdG9wcyBjYWxsaW5nIF9yZWFkKCkgdG8gZmlsbCB0aGUgYnVmZmVyXG4gIC8vIE5vdGU6IDAgaXMgYSB2YWxpZCB2YWx1ZSwgbWVhbnMgXCJkb24ndCBjYWxsIF9yZWFkIHByZWVtcHRpdmVseSBldmVyXCJcbiAgdmFyIGh3bSA9IG9wdGlvbnMuaGlnaFdhdGVyTWFyaztcbiAgdmFyIGRlZmF1bHRId20gPSB0aGlzLm9iamVjdE1vZGUgPyAxNiA6IDE2ICogMTAyNDtcbiAgdGhpcy5oaWdoV2F0ZXJNYXJrID0gaHdtIHx8IGh3bSA9PT0gMCA/IGh3bSA6IGRlZmF1bHRId207XG5cbiAgLy8gY2FzdCB0byBpbnRzLlxuICB0aGlzLmhpZ2hXYXRlck1hcmsgPSBNYXRoLmZsb29yKHRoaXMuaGlnaFdhdGVyTWFyayk7XG5cbiAgLy8gQSBsaW5rZWQgbGlzdCBpcyB1c2VkIHRvIHN0b3JlIGRhdGEgY2h1bmtzIGluc3RlYWQgb2YgYW4gYXJyYXkgYmVjYXVzZSB0aGVcbiAgLy8gbGlua2VkIGxpc3QgY2FuIHJlbW92ZSBlbGVtZW50cyBmcm9tIHRoZSBiZWdpbm5pbmcgZmFzdGVyIHRoYW5cbiAgLy8gYXJyYXkuc2hpZnQoKVxuICB0aGlzLmJ1ZmZlciA9IG5ldyBCdWZmZXJMaXN0KCk7XG4gIHRoaXMubGVuZ3RoID0gMDtcbiAgdGhpcy5waXBlcyA9IG51bGw7XG4gIHRoaXMucGlwZXNDb3VudCA9IDA7XG4gIHRoaXMuZmxvd2luZyA9IG51bGw7XG4gIHRoaXMuZW5kZWQgPSBmYWxzZTtcbiAgdGhpcy5lbmRFbWl0dGVkID0gZmFsc2U7XG4gIHRoaXMucmVhZGluZyA9IGZhbHNlO1xuXG4gIC8vIGEgZmxhZyB0byBiZSBhYmxlIHRvIHRlbGwgaWYgdGhlIGV2ZW50ICdyZWFkYWJsZScvJ2RhdGEnIGlzIGVtaXR0ZWRcbiAgLy8gaW1tZWRpYXRlbHksIG9yIG9uIGEgbGF0ZXIgdGljay4gIFdlIHNldCB0aGlzIHRvIHRydWUgYXQgZmlyc3QsIGJlY2F1c2VcbiAgLy8gYW55IGFjdGlvbnMgdGhhdCBzaG91bGRuJ3QgaGFwcGVuIHVudGlsIFwibGF0ZXJcIiBzaG91bGQgZ2VuZXJhbGx5IGFsc29cbiAgLy8gbm90IGhhcHBlbiBiZWZvcmUgdGhlIGZpcnN0IHJlYWQgY2FsbC5cbiAgdGhpcy5zeW5jID0gdHJ1ZTtcblxuICAvLyB3aGVuZXZlciB3ZSByZXR1cm4gbnVsbCwgdGhlbiB3ZSBzZXQgYSBmbGFnIHRvIHNheVxuICAvLyB0aGF0IHdlJ3JlIGF3YWl0aW5nIGEgJ3JlYWRhYmxlJyBldmVudCBlbWlzc2lvbi5cbiAgdGhpcy5uZWVkUmVhZGFibGUgPSBmYWxzZTtcbiAgdGhpcy5lbWl0dGVkUmVhZGFibGUgPSBmYWxzZTtcbiAgdGhpcy5yZWFkYWJsZUxpc3RlbmluZyA9IGZhbHNlO1xuICB0aGlzLnJlc3VtZVNjaGVkdWxlZCA9IGZhbHNlO1xuXG4gIC8vIGhhcyBpdCBiZWVuIGRlc3Ryb3llZFxuICB0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xuXG4gIC8vIENyeXB0byBpcyBraW5kIG9mIG9sZCBhbmQgY3J1c3R5LiAgSGlzdG9yaWNhbGx5LCBpdHMgZGVmYXVsdCBzdHJpbmdcbiAgLy8gZW5jb2RpbmcgaXMgJ2JpbmFyeScgc28gd2UgaGF2ZSB0byBtYWtlIHRoaXMgY29uZmlndXJhYmxlLlxuICAvLyBFdmVyeXRoaW5nIGVsc2UgaW4gdGhlIHVuaXZlcnNlIHVzZXMgJ3V0ZjgnLCB0aG91Z2guXG4gIHRoaXMuZGVmYXVsdEVuY29kaW5nID0gb3B0aW9ucy5kZWZhdWx0RW5jb2RpbmcgfHwgJ3V0ZjgnO1xuXG4gIC8vIHRoZSBudW1iZXIgb2Ygd3JpdGVycyB0aGF0IGFyZSBhd2FpdGluZyBhIGRyYWluIGV2ZW50IGluIC5waXBlKClzXG4gIHRoaXMuYXdhaXREcmFpbiA9IDA7XG5cbiAgLy8gaWYgdHJ1ZSwgYSBtYXliZVJlYWRNb3JlIGhhcyBiZWVuIHNjaGVkdWxlZFxuICB0aGlzLnJlYWRpbmdNb3JlID0gZmFsc2U7XG5cbiAgdGhpcy5kZWNvZGVyID0gbnVsbDtcbiAgdGhpcy5lbmNvZGluZyA9IG51bGw7XG4gIGlmIChvcHRpb25zLmVuY29kaW5nKSB7XG4gICAgaWYgKCFTdHJpbmdEZWNvZGVyKSBTdHJpbmdEZWNvZGVyID0gcmVxdWlyZSgnc3RyaW5nX2RlY29kZXIvJykuU3RyaW5nRGVjb2RlcjtcbiAgICB0aGlzLmRlY29kZXIgPSBuZXcgU3RyaW5nRGVjb2RlcihvcHRpb25zLmVuY29kaW5nKTtcbiAgICB0aGlzLmVuY29kaW5nID0gb3B0aW9ucy5lbmNvZGluZztcbiAgfVxufVxuXG5mdW5jdGlvbiBSZWFkYWJsZShvcHRpb25zKSB7XG4gIER1cGxleCA9IER1cGxleCB8fCByZXF1aXJlKCcuL19zdHJlYW1fZHVwbGV4Jyk7XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJlYWRhYmxlKSkgcmV0dXJuIG5ldyBSZWFkYWJsZShvcHRpb25zKTtcblxuICB0aGlzLl9yZWFkYWJsZVN0YXRlID0gbmV3IFJlYWRhYmxlU3RhdGUob3B0aW9ucywgdGhpcyk7XG5cbiAgLy8gbGVnYWN5XG4gIHRoaXMucmVhZGFibGUgPSB0cnVlO1xuXG4gIGlmIChvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLnJlYWQgPT09ICdmdW5jdGlvbicpIHRoaXMuX3JlYWQgPSBvcHRpb25zLnJlYWQ7XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5fZGVzdHJveSA9IG9wdGlvbnMuZGVzdHJveTtcbiAgfVxuXG4gIFN0cmVhbS5jYWxsKHRoaXMpO1xufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUmVhZGFibGUucHJvdG90eXBlLCAnZGVzdHJveWVkJywge1xuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fcmVhZGFibGVTdGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZWFkYWJsZVN0YXRlLmRlc3Ryb3llZDtcbiAgfSxcbiAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyB3ZSBpZ25vcmUgdGhlIHZhbHVlIGlmIHRoZSBzdHJlYW1cbiAgICAvLyBoYXMgbm90IGJlZW4gaW5pdGlhbGl6ZWQgeWV0XG4gICAgaWYgKCF0aGlzLl9yZWFkYWJsZVN0YXRlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gYmFja3dhcmQgY29tcGF0aWJpbGl0eSwgdGhlIHVzZXIgaXMgZXhwbGljaXRseVxuICAgIC8vIG1hbmFnaW5nIGRlc3Ryb3llZFxuICAgIHRoaXMuX3JlYWRhYmxlU3RhdGUuZGVzdHJveWVkID0gdmFsdWU7XG4gIH1cbn0pO1xuXG5SZWFkYWJsZS5wcm90b3R5cGUuZGVzdHJveSA9IGRlc3Ryb3lJbXBsLmRlc3Ryb3k7XG5SZWFkYWJsZS5wcm90b3R5cGUuX3VuZGVzdHJveSA9IGRlc3Ryb3lJbXBsLnVuZGVzdHJveTtcblJlYWRhYmxlLnByb3RvdHlwZS5fZGVzdHJveSA9IGZ1bmN0aW9uIChlcnIsIGNiKSB7XG4gIHRoaXMucHVzaChudWxsKTtcbiAgY2IoZXJyKTtcbn07XG5cbi8vIE1hbnVhbGx5IHNob3ZlIHNvbWV0aGluZyBpbnRvIHRoZSByZWFkKCkgYnVmZmVyLlxuLy8gVGhpcyByZXR1cm5zIHRydWUgaWYgdGhlIGhpZ2hXYXRlck1hcmsgaGFzIG5vdCBiZWVuIGhpdCB5ZXQsXG4vLyBzaW1pbGFyIHRvIGhvdyBXcml0YWJsZS53cml0ZSgpIHJldHVybnMgdHJ1ZSBpZiB5b3Ugc2hvdWxkXG4vLyB3cml0ZSgpIHNvbWUgbW9yZS5cblJlYWRhYmxlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBlbmNvZGluZykge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZWFkYWJsZVN0YXRlO1xuICB2YXIgc2tpcENodW5rQ2hlY2s7XG5cbiAgaWYgKCFzdGF0ZS5vYmplY3RNb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBjaHVuayA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gZW5jb2RpbmcgfHwgc3RhdGUuZGVmYXVsdEVuY29kaW5nO1xuICAgICAgaWYgKGVuY29kaW5nICE9PSBzdGF0ZS5lbmNvZGluZykge1xuICAgICAgICBjaHVuayA9IEJ1ZmZlci5mcm9tKGNodW5rLCBlbmNvZGluZyk7XG4gICAgICAgIGVuY29kaW5nID0gJyc7XG4gICAgICB9XG4gICAgICBza2lwQ2h1bmtDaGVjayA9IHRydWU7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHNraXBDaHVua0NoZWNrID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiByZWFkYWJsZUFkZENodW5rKHRoaXMsIGNodW5rLCBlbmNvZGluZywgZmFsc2UsIHNraXBDaHVua0NoZWNrKTtcbn07XG5cbi8vIFVuc2hpZnQgc2hvdWxkICphbHdheXMqIGJlIHNvbWV0aGluZyBkaXJlY3RseSBvdXQgb2YgcmVhZCgpXG5SZWFkYWJsZS5wcm90b3R5cGUudW5zaGlmdCA9IGZ1bmN0aW9uIChjaHVuaykge1xuICByZXR1cm4gcmVhZGFibGVBZGRDaHVuayh0aGlzLCBjaHVuaywgbnVsbCwgdHJ1ZSwgZmFsc2UpO1xufTtcblxuZnVuY3Rpb24gcmVhZGFibGVBZGRDaHVuayhzdHJlYW0sIGNodW5rLCBlbmNvZGluZywgYWRkVG9Gcm9udCwgc2tpcENodW5rQ2hlY2spIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuICBpZiAoY2h1bmsgPT09IG51bGwpIHtcbiAgICBzdGF0ZS5yZWFkaW5nID0gZmFsc2U7XG4gICAgb25Fb2ZDaHVuayhzdHJlYW0sIHN0YXRlKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZXI7XG4gICAgaWYgKCFza2lwQ2h1bmtDaGVjaykgZXIgPSBjaHVua0ludmFsaWQoc3RhdGUsIGNodW5rKTtcbiAgICBpZiAoZXIpIHtcbiAgICAgIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcbiAgICB9IGVsc2UgaWYgKHN0YXRlLm9iamVjdE1vZGUgfHwgY2h1bmsgJiYgY2h1bmsubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKHR5cGVvZiBjaHVuayAhPT0gJ3N0cmluZycgJiYgIXN0YXRlLm9iamVjdE1vZGUgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKGNodW5rKSAhPT0gQnVmZmVyLnByb3RvdHlwZSkge1xuICAgICAgICBjaHVuayA9IF91aW50OEFycmF5VG9CdWZmZXIoY2h1bmspO1xuICAgICAgfVxuXG4gICAgICBpZiAoYWRkVG9Gcm9udCkge1xuICAgICAgICBpZiAoc3RhdGUuZW5kRW1pdHRlZCkgc3RyZWFtLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdzdHJlYW0udW5zaGlmdCgpIGFmdGVyIGVuZCBldmVudCcpKTtlbHNlIGFkZENodW5rKHN0cmVhbSwgc3RhdGUsIGNodW5rLCB0cnVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUuZW5kZWQpIHtcbiAgICAgICAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdzdHJlYW0ucHVzaCgpIGFmdGVyIEVPRicpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlLnJlYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKHN0YXRlLmRlY29kZXIgJiYgIWVuY29kaW5nKSB7XG4gICAgICAgICAgY2h1bmsgPSBzdGF0ZS5kZWNvZGVyLndyaXRlKGNodW5rKTtcbiAgICAgICAgICBpZiAoc3RhdGUub2JqZWN0TW9kZSB8fCBjaHVuay5sZW5ndGggIT09IDApIGFkZENodW5rKHN0cmVhbSwgc3RhdGUsIGNodW5rLCBmYWxzZSk7ZWxzZSBtYXliZVJlYWRNb3JlKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFkZENodW5rKHN0cmVhbSwgc3RhdGUsIGNodW5rLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFhZGRUb0Zyb250KSB7XG4gICAgICBzdGF0ZS5yZWFkaW5nID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5lZWRNb3JlRGF0YShzdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIGFkZENodW5rKHN0cmVhbSwgc3RhdGUsIGNodW5rLCBhZGRUb0Zyb250KSB7XG4gIGlmIChzdGF0ZS5mbG93aW5nICYmIHN0YXRlLmxlbmd0aCA9PT0gMCAmJiAhc3RhdGUuc3luYykge1xuICAgIHN0cmVhbS5lbWl0KCdkYXRhJywgY2h1bmspO1xuICAgIHN0cmVhbS5yZWFkKDApO1xuICB9IGVsc2Uge1xuICAgIC8vIHVwZGF0ZSB0aGUgYnVmZmVyIGluZm8uXG4gICAgc3RhdGUubGVuZ3RoICs9IHN0YXRlLm9iamVjdE1vZGUgPyAxIDogY2h1bmsubGVuZ3RoO1xuICAgIGlmIChhZGRUb0Zyb250KSBzdGF0ZS5idWZmZXIudW5zaGlmdChjaHVuayk7ZWxzZSBzdGF0ZS5idWZmZXIucHVzaChjaHVuayk7XG5cbiAgICBpZiAoc3RhdGUubmVlZFJlYWRhYmxlKSBlbWl0UmVhZGFibGUoc3RyZWFtKTtcbiAgfVxuICBtYXliZVJlYWRNb3JlKHN0cmVhbSwgc3RhdGUpO1xufVxuXG5mdW5jdGlvbiBjaHVua0ludmFsaWQoc3RhdGUsIGNodW5rKSB7XG4gIHZhciBlcjtcbiAgaWYgKCFfaXNVaW50OEFycmF5KGNodW5rKSAmJiB0eXBlb2YgY2h1bmsgIT09ICdzdHJpbmcnICYmIGNodW5rICE9PSB1bmRlZmluZWQgJiYgIXN0YXRlLm9iamVjdE1vZGUpIHtcbiAgICBlciA9IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbm9uLXN0cmluZy9idWZmZXIgY2h1bmsnKTtcbiAgfVxuICByZXR1cm4gZXI7XG59XG5cbi8vIGlmIGl0J3MgcGFzdCB0aGUgaGlnaCB3YXRlciBtYXJrLCB3ZSBjYW4gcHVzaCBpbiBzb21lIG1vcmUuXG4vLyBBbHNvLCBpZiB3ZSBoYXZlIG5vIGRhdGEgeWV0LCB3ZSBjYW4gc3RhbmQgc29tZVxuLy8gbW9yZSBieXRlcy4gIFRoaXMgaXMgdG8gd29yayBhcm91bmQgY2FzZXMgd2hlcmUgaHdtPTAsXG4vLyBzdWNoIGFzIHRoZSByZXBsLiAgQWxzbywgaWYgdGhlIHB1c2goKSB0cmlnZ2VyZWQgYVxuLy8gcmVhZGFibGUgZXZlbnQsIGFuZCB0aGUgdXNlciBjYWxsZWQgcmVhZChsYXJnZU51bWJlcikgc3VjaCB0aGF0XG4vLyBuZWVkUmVhZGFibGUgd2FzIHNldCwgdGhlbiB3ZSBvdWdodCB0byBwdXNoIG1vcmUsIHNvIHRoYXQgYW5vdGhlclxuLy8gJ3JlYWRhYmxlJyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZC5cbmZ1bmN0aW9uIG5lZWRNb3JlRGF0YShzdGF0ZSkge1xuICByZXR1cm4gIXN0YXRlLmVuZGVkICYmIChzdGF0ZS5uZWVkUmVhZGFibGUgfHwgc3RhdGUubGVuZ3RoIDwgc3RhdGUuaGlnaFdhdGVyTWFyayB8fCBzdGF0ZS5sZW5ndGggPT09IDApO1xufVxuXG5SZWFkYWJsZS5wcm90b3R5cGUuaXNQYXVzZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcgPT09IGZhbHNlO1xufTtcblxuLy8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG5SZWFkYWJsZS5wcm90b3R5cGUuc2V0RW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jKSB7XG4gIGlmICghU3RyaW5nRGVjb2RlcikgU3RyaW5nRGVjb2RlciA9IHJlcXVpcmUoJ3N0cmluZ19kZWNvZGVyLycpLlN0cmluZ0RlY29kZXI7XG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUuZGVjb2RlciA9IG5ldyBTdHJpbmdEZWNvZGVyKGVuYyk7XG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUuZW5jb2RpbmcgPSBlbmM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gRG9uJ3QgcmFpc2UgdGhlIGh3bSA+IDhNQlxudmFyIE1BWF9IV00gPSAweDgwMDAwMDtcbmZ1bmN0aW9uIGNvbXB1dGVOZXdIaWdoV2F0ZXJNYXJrKG4pIHtcbiAgaWYgKG4gPj0gTUFYX0hXTSkge1xuICAgIG4gPSBNQVhfSFdNO1xuICB9IGVsc2Uge1xuICAgIC8vIEdldCB0aGUgbmV4dCBoaWdoZXN0IHBvd2VyIG9mIDIgdG8gcHJldmVudCBpbmNyZWFzaW5nIGh3bSBleGNlc3NpdmVseSBpblxuICAgIC8vIHRpbnkgYW1vdW50c1xuICAgIG4tLTtcbiAgICBuIHw9IG4gPj4+IDE7XG4gICAgbiB8PSBuID4+PiAyO1xuICAgIG4gfD0gbiA+Pj4gNDtcbiAgICBuIHw9IG4gPj4+IDg7XG4gICAgbiB8PSBuID4+PiAxNjtcbiAgICBuKys7XG4gIH1cbiAgcmV0dXJuIG47XG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gYmUgaW5saW5hYmxlLCBzbyBwbGVhc2UgdGFrZSBjYXJlIHdoZW4gbWFraW5nXG4vLyBjaGFuZ2VzIHRvIHRoZSBmdW5jdGlvbiBib2R5LlxuZnVuY3Rpb24gaG93TXVjaFRvUmVhZChuLCBzdGF0ZSkge1xuICBpZiAobiA8PSAwIHx8IHN0YXRlLmxlbmd0aCA9PT0gMCAmJiBzdGF0ZS5lbmRlZCkgcmV0dXJuIDA7XG4gIGlmIChzdGF0ZS5vYmplY3RNb2RlKSByZXR1cm4gMTtcbiAgaWYgKG4gIT09IG4pIHtcbiAgICAvLyBPbmx5IGZsb3cgb25lIGJ1ZmZlciBhdCBhIHRpbWVcbiAgICBpZiAoc3RhdGUuZmxvd2luZyAmJiBzdGF0ZS5sZW5ndGgpIHJldHVybiBzdGF0ZS5idWZmZXIuaGVhZC5kYXRhLmxlbmd0aDtlbHNlIHJldHVybiBzdGF0ZS5sZW5ndGg7XG4gIH1cbiAgLy8gSWYgd2UncmUgYXNraW5nIGZvciBtb3JlIHRoYW4gdGhlIGN1cnJlbnQgaHdtLCB0aGVuIHJhaXNlIHRoZSBod20uXG4gIGlmIChuID4gc3RhdGUuaGlnaFdhdGVyTWFyaykgc3RhdGUuaGlnaFdhdGVyTWFyayA9IGNvbXB1dGVOZXdIaWdoV2F0ZXJNYXJrKG4pO1xuICBpZiAobiA8PSBzdGF0ZS5sZW5ndGgpIHJldHVybiBuO1xuICAvLyBEb24ndCBoYXZlIGVub3VnaFxuICBpZiAoIXN0YXRlLmVuZGVkKSB7XG4gICAgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICByZXR1cm4gMDtcbiAgfVxuICByZXR1cm4gc3RhdGUubGVuZ3RoO1xufVxuXG4vLyB5b3UgY2FuIG92ZXJyaWRlIGVpdGhlciB0aGlzIG1ldGhvZCwgb3IgdGhlIGFzeW5jIF9yZWFkKG4pIGJlbG93LlxuUmVhZGFibGUucHJvdG90eXBlLnJlYWQgPSBmdW5jdGlvbiAobikge1xuICBkZWJ1ZygncmVhZCcsIG4pO1xuICBuID0gcGFyc2VJbnQobiwgMTApO1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZWFkYWJsZVN0YXRlO1xuICB2YXIgbk9yaWcgPSBuO1xuXG4gIGlmIChuICE9PSAwKSBzdGF0ZS5lbWl0dGVkUmVhZGFibGUgPSBmYWxzZTtcblxuICAvLyBpZiB3ZSdyZSBkb2luZyByZWFkKDApIHRvIHRyaWdnZXIgYSByZWFkYWJsZSBldmVudCwgYnV0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhIGJ1bmNoIG9mIGRhdGEgaW4gdGhlIGJ1ZmZlciwgdGhlbiBqdXN0IHRyaWdnZXJcbiAgLy8gdGhlICdyZWFkYWJsZScgZXZlbnQgYW5kIG1vdmUgb24uXG4gIGlmIChuID09PSAwICYmIHN0YXRlLm5lZWRSZWFkYWJsZSAmJiAoc3RhdGUubGVuZ3RoID49IHN0YXRlLmhpZ2hXYXRlck1hcmsgfHwgc3RhdGUuZW5kZWQpKSB7XG4gICAgZGVidWcoJ3JlYWQ6IGVtaXRSZWFkYWJsZScsIHN0YXRlLmxlbmd0aCwgc3RhdGUuZW5kZWQpO1xuICAgIGlmIChzdGF0ZS5sZW5ndGggPT09IDAgJiYgc3RhdGUuZW5kZWQpIGVuZFJlYWRhYmxlKHRoaXMpO2Vsc2UgZW1pdFJlYWRhYmxlKHRoaXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgbiA9IGhvd011Y2hUb1JlYWQobiwgc3RhdGUpO1xuXG4gIC8vIGlmIHdlJ3ZlIGVuZGVkLCBhbmQgd2UncmUgbm93IGNsZWFyLCB0aGVuIGZpbmlzaCBpdCB1cC5cbiAgaWYgKG4gPT09IDAgJiYgc3RhdGUuZW5kZWQpIHtcbiAgICBpZiAoc3RhdGUubGVuZ3RoID09PSAwKSBlbmRSZWFkYWJsZSh0aGlzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIEFsbCB0aGUgYWN0dWFsIGNodW5rIGdlbmVyYXRpb24gbG9naWMgbmVlZHMgdG8gYmVcbiAgLy8gKmJlbG93KiB0aGUgY2FsbCB0byBfcmVhZC4gIFRoZSByZWFzb24gaXMgdGhhdCBpbiBjZXJ0YWluXG4gIC8vIHN5bnRoZXRpYyBzdHJlYW0gY2FzZXMsIHN1Y2ggYXMgcGFzc3Rocm91Z2ggc3RyZWFtcywgX3JlYWRcbiAgLy8gbWF5IGJlIGEgY29tcGxldGVseSBzeW5jaHJvbm91cyBvcGVyYXRpb24gd2hpY2ggbWF5IGNoYW5nZVxuICAvLyB0aGUgc3RhdGUgb2YgdGhlIHJlYWQgYnVmZmVyLCBwcm92aWRpbmcgZW5vdWdoIGRhdGEgd2hlblxuICAvLyBiZWZvcmUgdGhlcmUgd2FzICpub3QqIGVub3VnaC5cbiAgLy9cbiAgLy8gU28sIHRoZSBzdGVwcyBhcmU6XG4gIC8vIDEuIEZpZ3VyZSBvdXQgd2hhdCB0aGUgc3RhdGUgb2YgdGhpbmdzIHdpbGwgYmUgYWZ0ZXIgd2UgZG9cbiAgLy8gYSByZWFkIGZyb20gdGhlIGJ1ZmZlci5cbiAgLy9cbiAgLy8gMi4gSWYgdGhhdCByZXN1bHRpbmcgc3RhdGUgd2lsbCB0cmlnZ2VyIGEgX3JlYWQsIHRoZW4gY2FsbCBfcmVhZC5cbiAgLy8gTm90ZSB0aGF0IHRoaXMgbWF5IGJlIGFzeW5jaHJvbm91cywgb3Igc3luY2hyb25vdXMuICBZZXMsIGl0IGlzXG4gIC8vIGRlZXBseSB1Z2x5IHRvIHdyaXRlIEFQSXMgdGhpcyB3YXksIGJ1dCB0aGF0IHN0aWxsIGRvZXNuJ3QgbWVhblxuICAvLyB0aGF0IHRoZSBSZWFkYWJsZSBjbGFzcyBzaG91bGQgYmVoYXZlIGltcHJvcGVybHksIGFzIHN0cmVhbXMgYXJlXG4gIC8vIGRlc2lnbmVkIHRvIGJlIHN5bmMvYXN5bmMgYWdub3N0aWMuXG4gIC8vIFRha2Ugbm90ZSBpZiB0aGUgX3JlYWQgY2FsbCBpcyBzeW5jIG9yIGFzeW5jIChpZSwgaWYgdGhlIHJlYWQgY2FsbFxuICAvLyBoYXMgcmV0dXJuZWQgeWV0KSwgc28gdGhhdCB3ZSBrbm93IHdoZXRoZXIgb3Igbm90IGl0J3Mgc2FmZSB0byBlbWl0XG4gIC8vICdyZWFkYWJsZScgZXRjLlxuICAvL1xuICAvLyAzLiBBY3R1YWxseSBwdWxsIHRoZSByZXF1ZXN0ZWQgY2h1bmtzIG91dCBvZiB0aGUgYnVmZmVyIGFuZCByZXR1cm4uXG5cbiAgLy8gaWYgd2UgbmVlZCBhIHJlYWRhYmxlIGV2ZW50LCB0aGVuIHdlIG5lZWQgdG8gZG8gc29tZSByZWFkaW5nLlxuICB2YXIgZG9SZWFkID0gc3RhdGUubmVlZFJlYWRhYmxlO1xuICBkZWJ1ZygnbmVlZCByZWFkYWJsZScsIGRvUmVhZCk7XG5cbiAgLy8gaWYgd2UgY3VycmVudGx5IGhhdmUgbGVzcyB0aGFuIHRoZSBoaWdoV2F0ZXJNYXJrLCB0aGVuIGFsc28gcmVhZCBzb21lXG4gIGlmIChzdGF0ZS5sZW5ndGggPT09IDAgfHwgc3RhdGUubGVuZ3RoIC0gbiA8IHN0YXRlLmhpZ2hXYXRlck1hcmspIHtcbiAgICBkb1JlYWQgPSB0cnVlO1xuICAgIGRlYnVnKCdsZW5ndGggbGVzcyB0aGFuIHdhdGVybWFyaycsIGRvUmVhZCk7XG4gIH1cblxuICAvLyBob3dldmVyLCBpZiB3ZSd2ZSBlbmRlZCwgdGhlbiB0aGVyZSdzIG5vIHBvaW50LCBhbmQgaWYgd2UncmUgYWxyZWFkeVxuICAvLyByZWFkaW5nLCB0aGVuIGl0J3MgdW5uZWNlc3NhcnkuXG4gIGlmIChzdGF0ZS5lbmRlZCB8fCBzdGF0ZS5yZWFkaW5nKSB7XG4gICAgZG9SZWFkID0gZmFsc2U7XG4gICAgZGVidWcoJ3JlYWRpbmcgb3IgZW5kZWQnLCBkb1JlYWQpO1xuICB9IGVsc2UgaWYgKGRvUmVhZCkge1xuICAgIGRlYnVnKCdkbyByZWFkJyk7XG4gICAgc3RhdGUucmVhZGluZyA9IHRydWU7XG4gICAgc3RhdGUuc3luYyA9IHRydWU7XG4gICAgLy8gaWYgdGhlIGxlbmd0aCBpcyBjdXJyZW50bHkgemVybywgdGhlbiB3ZSAqbmVlZCogYSByZWFkYWJsZSBldmVudC5cbiAgICBpZiAoc3RhdGUubGVuZ3RoID09PSAwKSBzdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuICAgIC8vIGNhbGwgaW50ZXJuYWwgcmVhZCBtZXRob2RcbiAgICB0aGlzLl9yZWFkKHN0YXRlLmhpZ2hXYXRlck1hcmspO1xuICAgIHN0YXRlLnN5bmMgPSBmYWxzZTtcbiAgICAvLyBJZiBfcmVhZCBwdXNoZWQgZGF0YSBzeW5jaHJvbm91c2x5LCB0aGVuIGByZWFkaW5nYCB3aWxsIGJlIGZhbHNlLFxuICAgIC8vIGFuZCB3ZSBuZWVkIHRvIHJlLWV2YWx1YXRlIGhvdyBtdWNoIGRhdGEgd2UgY2FuIHJldHVybiB0byB0aGUgdXNlci5cbiAgICBpZiAoIXN0YXRlLnJlYWRpbmcpIG4gPSBob3dNdWNoVG9SZWFkKG5PcmlnLCBzdGF0ZSk7XG4gIH1cblxuICB2YXIgcmV0O1xuICBpZiAobiA+IDApIHJldCA9IGZyb21MaXN0KG4sIHN0YXRlKTtlbHNlIHJldCA9IG51bGw7XG5cbiAgaWYgKHJldCA9PT0gbnVsbCkge1xuICAgIHN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG4gICAgbiA9IDA7XG4gIH0gZWxzZSB7XG4gICAgc3RhdGUubGVuZ3RoIC09IG47XG4gIH1cblxuICBpZiAoc3RhdGUubGVuZ3RoID09PSAwKSB7XG4gICAgLy8gSWYgd2UgaGF2ZSBub3RoaW5nIGluIHRoZSBidWZmZXIsIHRoZW4gd2Ugd2FudCB0byBrbm93XG4gICAgLy8gYXMgc29vbiBhcyB3ZSAqZG8qIGdldCBzb21ldGhpbmcgaW50byB0aGUgYnVmZmVyLlxuICAgIGlmICghc3RhdGUuZW5kZWQpIHN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG5cbiAgICAvLyBJZiB3ZSB0cmllZCB0byByZWFkKCkgcGFzdCB0aGUgRU9GLCB0aGVuIGVtaXQgZW5kIG9uIHRoZSBuZXh0IHRpY2suXG4gICAgaWYgKG5PcmlnICE9PSBuICYmIHN0YXRlLmVuZGVkKSBlbmRSZWFkYWJsZSh0aGlzKTtcbiAgfVxuXG4gIGlmIChyZXQgIT09IG51bGwpIHRoaXMuZW1pdCgnZGF0YScsIHJldCk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIG9uRW9mQ2h1bmsoc3RyZWFtLCBzdGF0ZSkge1xuICBpZiAoc3RhdGUuZW5kZWQpIHJldHVybjtcbiAgaWYgKHN0YXRlLmRlY29kZXIpIHtcbiAgICB2YXIgY2h1bmsgPSBzdGF0ZS5kZWNvZGVyLmVuZCgpO1xuICAgIGlmIChjaHVuayAmJiBjaHVuay5sZW5ndGgpIHtcbiAgICAgIHN0YXRlLmJ1ZmZlci5wdXNoKGNodW5rKTtcbiAgICAgIHN0YXRlLmxlbmd0aCArPSBzdGF0ZS5vYmplY3RNb2RlID8gMSA6IGNodW5rLmxlbmd0aDtcbiAgICB9XG4gIH1cbiAgc3RhdGUuZW5kZWQgPSB0cnVlO1xuXG4gIC8vIGVtaXQgJ3JlYWRhYmxlJyBub3cgdG8gbWFrZSBzdXJlIGl0IGdldHMgcGlja2VkIHVwLlxuICBlbWl0UmVhZGFibGUoc3RyZWFtKTtcbn1cblxuLy8gRG9uJ3QgZW1pdCByZWFkYWJsZSByaWdodCBhd2F5IGluIHN5bmMgbW9kZSwgYmVjYXVzZSB0aGlzIGNhbiB0cmlnZ2VyXG4vLyBhbm90aGVyIHJlYWQoKSBjYWxsID0+IHN0YWNrIG92ZXJmbG93LiAgVGhpcyB3YXksIGl0IG1pZ2h0IHRyaWdnZXJcbi8vIGEgbmV4dFRpY2sgcmVjdXJzaW9uIHdhcm5pbmcsIGJ1dCB0aGF0J3Mgbm90IHNvIGJhZC5cbmZ1bmN0aW9uIGVtaXRSZWFkYWJsZShzdHJlYW0pIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuICBzdGF0ZS5uZWVkUmVhZGFibGUgPSBmYWxzZTtcbiAgaWYgKCFzdGF0ZS5lbWl0dGVkUmVhZGFibGUpIHtcbiAgICBkZWJ1ZygnZW1pdFJlYWRhYmxlJywgc3RhdGUuZmxvd2luZyk7XG4gICAgc3RhdGUuZW1pdHRlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICBpZiAoc3RhdGUuc3luYykgcHJvY2Vzc05leHRUaWNrKGVtaXRSZWFkYWJsZV8sIHN0cmVhbSk7ZWxzZSBlbWl0UmVhZGFibGVfKHN0cmVhbSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW1pdFJlYWRhYmxlXyhzdHJlYW0pIHtcbiAgZGVidWcoJ2VtaXQgcmVhZGFibGUnKTtcbiAgc3RyZWFtLmVtaXQoJ3JlYWRhYmxlJyk7XG4gIGZsb3coc3RyZWFtKTtcbn1cblxuLy8gYXQgdGhpcyBwb2ludCwgdGhlIHVzZXIgaGFzIHByZXN1bWFibHkgc2VlbiB0aGUgJ3JlYWRhYmxlJyBldmVudCxcbi8vIGFuZCBjYWxsZWQgcmVhZCgpIHRvIGNvbnN1bWUgc29tZSBkYXRhLiAgdGhhdCBtYXkgaGF2ZSB0cmlnZ2VyZWRcbi8vIGluIHR1cm4gYW5vdGhlciBfcmVhZChuKSBjYWxsLCBpbiB3aGljaCBjYXNlIHJlYWRpbmcgPSB0cnVlIGlmXG4vLyBpdCdzIGluIHByb2dyZXNzLlxuLy8gSG93ZXZlciwgaWYgd2UncmUgbm90IGVuZGVkLCBvciByZWFkaW5nLCBhbmQgdGhlIGxlbmd0aCA8IGh3bSxcbi8vIHRoZW4gZ28gYWhlYWQgYW5kIHRyeSB0byByZWFkIHNvbWUgbW9yZSBwcmVlbXB0aXZlbHkuXG5mdW5jdGlvbiBtYXliZVJlYWRNb3JlKHN0cmVhbSwgc3RhdGUpIHtcbiAgaWYgKCFzdGF0ZS5yZWFkaW5nTW9yZSkge1xuICAgIHN0YXRlLnJlYWRpbmdNb3JlID0gdHJ1ZTtcbiAgICBwcm9jZXNzTmV4dFRpY2sobWF5YmVSZWFkTW9yZV8sIHN0cmVhbSwgc3RhdGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1heWJlUmVhZE1vcmVfKHN0cmVhbSwgc3RhdGUpIHtcbiAgdmFyIGxlbiA9IHN0YXRlLmxlbmd0aDtcbiAgd2hpbGUgKCFzdGF0ZS5yZWFkaW5nICYmICFzdGF0ZS5mbG93aW5nICYmICFzdGF0ZS5lbmRlZCAmJiBzdGF0ZS5sZW5ndGggPCBzdGF0ZS5oaWdoV2F0ZXJNYXJrKSB7XG4gICAgZGVidWcoJ21heWJlUmVhZE1vcmUgcmVhZCAwJyk7XG4gICAgc3RyZWFtLnJlYWQoMCk7XG4gICAgaWYgKGxlbiA9PT0gc3RhdGUubGVuZ3RoKVxuICAgICAgLy8gZGlkbid0IGdldCBhbnkgZGF0YSwgc3RvcCBzcGlubmluZy5cbiAgICAgIGJyZWFrO2Vsc2UgbGVuID0gc3RhdGUubGVuZ3RoO1xuICB9XG4gIHN0YXRlLnJlYWRpbmdNb3JlID0gZmFsc2U7XG59XG5cbi8vIGFic3RyYWN0IG1ldGhvZC4gIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gY2xhc3Nlcy5cbi8vIGNhbGwgY2IoZXIsIGRhdGEpIHdoZXJlIGRhdGEgaXMgPD0gbiBpbiBsZW5ndGguXG4vLyBmb3IgdmlydHVhbCAobm9uLXN0cmluZywgbm9uLWJ1ZmZlcikgc3RyZWFtcywgXCJsZW5ndGhcIiBpcyBzb21ld2hhdFxuLy8gYXJiaXRyYXJ5LCBhbmQgcGVyaGFwcyBub3QgdmVyeSBtZWFuaW5nZnVsLlxuUmVhZGFibGUucHJvdG90eXBlLl9yZWFkID0gZnVuY3Rpb24gKG4pIHtcbiAgdGhpcy5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignX3JlYWQoKSBpcyBub3QgaW1wbGVtZW50ZWQnKSk7XG59O1xuXG5SZWFkYWJsZS5wcm90b3R5cGUucGlwZSA9IGZ1bmN0aW9uIChkZXN0LCBwaXBlT3B0cykge1xuICB2YXIgc3JjID0gdGhpcztcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcblxuICBzd2l0Y2ggKHN0YXRlLnBpcGVzQ291bnQpIHtcbiAgICBjYXNlIDA6XG4gICAgICBzdGF0ZS5waXBlcyA9IGRlc3Q7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDE6XG4gICAgICBzdGF0ZS5waXBlcyA9IFtzdGF0ZS5waXBlcywgZGVzdF07XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgc3RhdGUucGlwZXMucHVzaChkZXN0KTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHN0YXRlLnBpcGVzQ291bnQgKz0gMTtcbiAgZGVidWcoJ3BpcGUgY291bnQ9JWQgb3B0cz0laicsIHN0YXRlLnBpcGVzQ291bnQsIHBpcGVPcHRzKTtcblxuICB2YXIgZG9FbmQgPSAoIXBpcGVPcHRzIHx8IHBpcGVPcHRzLmVuZCAhPT0gZmFsc2UpICYmIGRlc3QgIT09IHByb2Nlc3Muc3Rkb3V0ICYmIGRlc3QgIT09IHByb2Nlc3Muc3RkZXJyO1xuXG4gIHZhciBlbmRGbiA9IGRvRW5kID8gb25lbmQgOiB1bnBpcGU7XG4gIGlmIChzdGF0ZS5lbmRFbWl0dGVkKSBwcm9jZXNzTmV4dFRpY2soZW5kRm4pO2Vsc2Ugc3JjLm9uY2UoJ2VuZCcsIGVuZEZuKTtcblxuICBkZXN0Lm9uKCd1bnBpcGUnLCBvbnVucGlwZSk7XG4gIGZ1bmN0aW9uIG9udW5waXBlKHJlYWRhYmxlLCB1bnBpcGVJbmZvKSB7XG4gICAgZGVidWcoJ29udW5waXBlJyk7XG4gICAgaWYgKHJlYWRhYmxlID09PSBzcmMpIHtcbiAgICAgIGlmICh1bnBpcGVJbmZvICYmIHVucGlwZUluZm8uaGFzVW5waXBlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgdW5waXBlSW5mby5oYXNVbnBpcGVkID0gdHJ1ZTtcbiAgICAgICAgY2xlYW51cCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uZW5kKCkge1xuICAgIGRlYnVnKCdvbmVuZCcpO1xuICAgIGRlc3QuZW5kKCk7XG4gIH1cblxuICAvLyB3aGVuIHRoZSBkZXN0IGRyYWlucywgaXQgcmVkdWNlcyB0aGUgYXdhaXREcmFpbiBjb3VudGVyXG4gIC8vIG9uIHRoZSBzb3VyY2UuICBUaGlzIHdvdWxkIGJlIG1vcmUgZWxlZ2FudCB3aXRoIGEgLm9uY2UoKVxuICAvLyBoYW5kbGVyIGluIGZsb3coKSwgYnV0IGFkZGluZyBhbmQgcmVtb3ZpbmcgcmVwZWF0ZWRseSBpc1xuICAvLyB0b28gc2xvdy5cbiAgdmFyIG9uZHJhaW4gPSBwaXBlT25EcmFpbihzcmMpO1xuICBkZXN0Lm9uKCdkcmFpbicsIG9uZHJhaW4pO1xuXG4gIHZhciBjbGVhbmVkVXAgPSBmYWxzZTtcbiAgZnVuY3Rpb24gY2xlYW51cCgpIHtcbiAgICBkZWJ1ZygnY2xlYW51cCcpO1xuICAgIC8vIGNsZWFudXAgZXZlbnQgaGFuZGxlcnMgb25jZSB0aGUgcGlwZSBpcyBicm9rZW5cbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2ZpbmlzaCcsIG9uZmluaXNoKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdkcmFpbicsIG9uZHJhaW4pO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcigndW5waXBlJywgb251bnBpcGUpO1xuICAgIHNyYy5yZW1vdmVMaXN0ZW5lcignZW5kJywgb25lbmQpO1xuICAgIHNyYy5yZW1vdmVMaXN0ZW5lcignZW5kJywgdW5waXBlKTtcbiAgICBzcmMucmVtb3ZlTGlzdGVuZXIoJ2RhdGEnLCBvbmRhdGEpO1xuXG4gICAgY2xlYW5lZFVwID0gdHJ1ZTtcblxuICAgIC8vIGlmIHRoZSByZWFkZXIgaXMgd2FpdGluZyBmb3IgYSBkcmFpbiBldmVudCBmcm9tIHRoaXNcbiAgICAvLyBzcGVjaWZpYyB3cml0ZXIsIHRoZW4gaXQgd291bGQgY2F1c2UgaXQgdG8gbmV2ZXIgc3RhcnRcbiAgICAvLyBmbG93aW5nIGFnYWluLlxuICAgIC8vIFNvLCBpZiB0aGlzIGlzIGF3YWl0aW5nIGEgZHJhaW4sIHRoZW4gd2UganVzdCBjYWxsIGl0IG5vdy5cbiAgICAvLyBJZiB3ZSBkb24ndCBrbm93LCB0aGVuIGFzc3VtZSB0aGF0IHdlIGFyZSB3YWl0aW5nIGZvciBvbmUuXG4gICAgaWYgKHN0YXRlLmF3YWl0RHJhaW4gJiYgKCFkZXN0Ll93cml0YWJsZVN0YXRlIHx8IGRlc3QuX3dyaXRhYmxlU3RhdGUubmVlZERyYWluKSkgb25kcmFpbigpO1xuICB9XG5cbiAgLy8gSWYgdGhlIHVzZXIgcHVzaGVzIG1vcmUgZGF0YSB3aGlsZSB3ZSdyZSB3cml0aW5nIHRvIGRlc3QgdGhlbiB3ZSdsbCBlbmQgdXBcbiAgLy8gaW4gb25kYXRhIGFnYWluLiBIb3dldmVyLCB3ZSBvbmx5IHdhbnQgdG8gaW5jcmVhc2UgYXdhaXREcmFpbiBvbmNlIGJlY2F1c2VcbiAgLy8gZGVzdCB3aWxsIG9ubHkgZW1pdCBvbmUgJ2RyYWluJyBldmVudCBmb3IgdGhlIG11bHRpcGxlIHdyaXRlcy5cbiAgLy8gPT4gSW50cm9kdWNlIGEgZ3VhcmQgb24gaW5jcmVhc2luZyBhd2FpdERyYWluLlxuICB2YXIgaW5jcmVhc2VkQXdhaXREcmFpbiA9IGZhbHNlO1xuICBzcmMub24oJ2RhdGEnLCBvbmRhdGEpO1xuICBmdW5jdGlvbiBvbmRhdGEoY2h1bmspIHtcbiAgICBkZWJ1Zygnb25kYXRhJyk7XG4gICAgaW5jcmVhc2VkQXdhaXREcmFpbiA9IGZhbHNlO1xuICAgIHZhciByZXQgPSBkZXN0LndyaXRlKGNodW5rKTtcbiAgICBpZiAoZmFsc2UgPT09IHJldCAmJiAhaW5jcmVhc2VkQXdhaXREcmFpbikge1xuICAgICAgLy8gSWYgdGhlIHVzZXIgdW5waXBlZCBkdXJpbmcgYGRlc3Qud3JpdGUoKWAsIGl0IGlzIHBvc3NpYmxlXG4gICAgICAvLyB0byBnZXQgc3R1Y2sgaW4gYSBwZXJtYW5lbnRseSBwYXVzZWQgc3RhdGUgaWYgdGhhdCB3cml0ZVxuICAgICAgLy8gYWxzbyByZXR1cm5lZCBmYWxzZS5cbiAgICAgIC8vID0+IENoZWNrIHdoZXRoZXIgYGRlc3RgIGlzIHN0aWxsIGEgcGlwaW5nIGRlc3RpbmF0aW9uLlxuICAgICAgaWYgKChzdGF0ZS5waXBlc0NvdW50ID09PSAxICYmIHN0YXRlLnBpcGVzID09PSBkZXN0IHx8IHN0YXRlLnBpcGVzQ291bnQgPiAxICYmIGluZGV4T2Yoc3RhdGUucGlwZXMsIGRlc3QpICE9PSAtMSkgJiYgIWNsZWFuZWRVcCkge1xuICAgICAgICBkZWJ1ZygnZmFsc2Ugd3JpdGUgcmVzcG9uc2UsIHBhdXNlJywgc3JjLl9yZWFkYWJsZVN0YXRlLmF3YWl0RHJhaW4pO1xuICAgICAgICBzcmMuX3JlYWRhYmxlU3RhdGUuYXdhaXREcmFpbisrO1xuICAgICAgICBpbmNyZWFzZWRBd2FpdERyYWluID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHNyYy5wYXVzZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBkZXN0IGhhcyBhbiBlcnJvciwgdGhlbiBzdG9wIHBpcGluZyBpbnRvIGl0LlxuICAvLyBob3dldmVyLCBkb24ndCBzdXBwcmVzcyB0aGUgdGhyb3dpbmcgYmVoYXZpb3IgZm9yIHRoaXMuXG4gIGZ1bmN0aW9uIG9uZXJyb3IoZXIpIHtcbiAgICBkZWJ1Zygnb25lcnJvcicsIGVyKTtcbiAgICB1bnBpcGUoKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIG9uZXJyb3IpO1xuICAgIGlmIChFRWxpc3RlbmVyQ291bnQoZGVzdCwgJ2Vycm9yJykgPT09IDApIGRlc3QuZW1pdCgnZXJyb3InLCBlcik7XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgb3VyIGVycm9yIGhhbmRsZXIgaXMgYXR0YWNoZWQgYmVmb3JlIHVzZXJsYW5kIG9uZXMuXG4gIHByZXBlbmRMaXN0ZW5lcihkZXN0LCAnZXJyb3InLCBvbmVycm9yKTtcblxuICAvLyBCb3RoIGNsb3NlIGFuZCBmaW5pc2ggc2hvdWxkIHRyaWdnZXIgdW5waXBlLCBidXQgb25seSBvbmNlLlxuICBmdW5jdGlvbiBvbmNsb3NlKCkge1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2ZpbmlzaCcsIG9uZmluaXNoKTtcbiAgICB1bnBpcGUoKTtcbiAgfVxuICBkZXN0Lm9uY2UoJ2Nsb3NlJywgb25jbG9zZSk7XG4gIGZ1bmN0aW9uIG9uZmluaXNoKCkge1xuICAgIGRlYnVnKCdvbmZpbmlzaCcpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgb25jbG9zZSk7XG4gICAgdW5waXBlKCk7XG4gIH1cbiAgZGVzdC5vbmNlKCdmaW5pc2gnLCBvbmZpbmlzaCk7XG5cbiAgZnVuY3Rpb24gdW5waXBlKCkge1xuICAgIGRlYnVnKCd1bnBpcGUnKTtcbiAgICBzcmMudW5waXBlKGRlc3QpO1xuICB9XG5cbiAgLy8gdGVsbCB0aGUgZGVzdCB0aGF0IGl0J3MgYmVpbmcgcGlwZWQgdG9cbiAgZGVzdC5lbWl0KCdwaXBlJywgc3JjKTtcblxuICAvLyBzdGFydCB0aGUgZmxvdyBpZiBpdCBoYXNuJ3QgYmVlbiBzdGFydGVkIGFscmVhZHkuXG4gIGlmICghc3RhdGUuZmxvd2luZykge1xuICAgIGRlYnVnKCdwaXBlIHJlc3VtZScpO1xuICAgIHNyYy5yZXN1bWUoKTtcbiAgfVxuXG4gIHJldHVybiBkZXN0O1xufTtcblxuZnVuY3Rpb24gcGlwZU9uRHJhaW4oc3JjKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0YXRlID0gc3JjLl9yZWFkYWJsZVN0YXRlO1xuICAgIGRlYnVnKCdwaXBlT25EcmFpbicsIHN0YXRlLmF3YWl0RHJhaW4pO1xuICAgIGlmIChzdGF0ZS5hd2FpdERyYWluKSBzdGF0ZS5hd2FpdERyYWluLS07XG4gICAgaWYgKHN0YXRlLmF3YWl0RHJhaW4gPT09IDAgJiYgRUVsaXN0ZW5lckNvdW50KHNyYywgJ2RhdGEnKSkge1xuICAgICAgc3RhdGUuZmxvd2luZyA9IHRydWU7XG4gICAgICBmbG93KHNyYyk7XG4gICAgfVxuICB9O1xufVxuXG5SZWFkYWJsZS5wcm90b3R5cGUudW5waXBlID0gZnVuY3Rpb24gKGRlc3QpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgdmFyIHVucGlwZUluZm8gPSB7IGhhc1VucGlwZWQ6IGZhbHNlIH07XG5cbiAgLy8gaWYgd2UncmUgbm90IHBpcGluZyBhbnl3aGVyZSwgdGhlbiBkbyBub3RoaW5nLlxuICBpZiAoc3RhdGUucGlwZXNDb3VudCA9PT0gMCkgcmV0dXJuIHRoaXM7XG5cbiAgLy8ganVzdCBvbmUgZGVzdGluYXRpb24uICBtb3N0IGNvbW1vbiBjYXNlLlxuICBpZiAoc3RhdGUucGlwZXNDb3VudCA9PT0gMSkge1xuICAgIC8vIHBhc3NlZCBpbiBvbmUsIGJ1dCBpdCdzIG5vdCB0aGUgcmlnaHQgb25lLlxuICAgIGlmIChkZXN0ICYmIGRlc3QgIT09IHN0YXRlLnBpcGVzKSByZXR1cm4gdGhpcztcblxuICAgIGlmICghZGVzdCkgZGVzdCA9IHN0YXRlLnBpcGVzO1xuXG4gICAgLy8gZ290IGEgbWF0Y2guXG4gICAgc3RhdGUucGlwZXMgPSBudWxsO1xuICAgIHN0YXRlLnBpcGVzQ291bnQgPSAwO1xuICAgIHN0YXRlLmZsb3dpbmcgPSBmYWxzZTtcbiAgICBpZiAoZGVzdCkgZGVzdC5lbWl0KCd1bnBpcGUnLCB0aGlzLCB1bnBpcGVJbmZvKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNsb3cgY2FzZS4gbXVsdGlwbGUgcGlwZSBkZXN0aW5hdGlvbnMuXG5cbiAgaWYgKCFkZXN0KSB7XG4gICAgLy8gcmVtb3ZlIGFsbC5cbiAgICB2YXIgZGVzdHMgPSBzdGF0ZS5waXBlcztcbiAgICB2YXIgbGVuID0gc3RhdGUucGlwZXNDb3VudDtcbiAgICBzdGF0ZS5waXBlcyA9IG51bGw7XG4gICAgc3RhdGUucGlwZXNDb3VudCA9IDA7XG4gICAgc3RhdGUuZmxvd2luZyA9IGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgZGVzdHNbaV0uZW1pdCgndW5waXBlJywgdGhpcywgdW5waXBlSW5mbyk7XG4gICAgfXJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gdHJ5IHRvIGZpbmQgdGhlIHJpZ2h0IG9uZS5cbiAgdmFyIGluZGV4ID0gaW5kZXhPZihzdGF0ZS5waXBlcywgZGVzdCk7XG4gIGlmIChpbmRleCA9PT0gLTEpIHJldHVybiB0aGlzO1xuXG4gIHN0YXRlLnBpcGVzLnNwbGljZShpbmRleCwgMSk7XG4gIHN0YXRlLnBpcGVzQ291bnQgLT0gMTtcbiAgaWYgKHN0YXRlLnBpcGVzQ291bnQgPT09IDEpIHN0YXRlLnBpcGVzID0gc3RhdGUucGlwZXNbMF07XG5cbiAgZGVzdC5lbWl0KCd1bnBpcGUnLCB0aGlzLCB1bnBpcGVJbmZvKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIHNldCB1cCBkYXRhIGV2ZW50cyBpZiB0aGV5IGFyZSBhc2tlZCBmb3Jcbi8vIEVuc3VyZSByZWFkYWJsZSBsaXN0ZW5lcnMgZXZlbnR1YWxseSBnZXQgc29tZXRoaW5nXG5SZWFkYWJsZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXYsIGZuKSB7XG4gIHZhciByZXMgPSBTdHJlYW0ucHJvdG90eXBlLm9uLmNhbGwodGhpcywgZXYsIGZuKTtcblxuICBpZiAoZXYgPT09ICdkYXRhJykge1xuICAgIC8vIFN0YXJ0IGZsb3dpbmcgb24gbmV4dCB0aWNrIGlmIHN0cmVhbSBpc24ndCBleHBsaWNpdGx5IHBhdXNlZFxuICAgIGlmICh0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcgIT09IGZhbHNlKSB0aGlzLnJlc3VtZSgpO1xuICB9IGVsc2UgaWYgKGV2ID09PSAncmVhZGFibGUnKSB7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgICBpZiAoIXN0YXRlLmVuZEVtaXR0ZWQgJiYgIXN0YXRlLnJlYWRhYmxlTGlzdGVuaW5nKSB7XG4gICAgICBzdGF0ZS5yZWFkYWJsZUxpc3RlbmluZyA9IHN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG4gICAgICBzdGF0ZS5lbWl0dGVkUmVhZGFibGUgPSBmYWxzZTtcbiAgICAgIGlmICghc3RhdGUucmVhZGluZykge1xuICAgICAgICBwcm9jZXNzTmV4dFRpY2soblJlYWRpbmdOZXh0VGljaywgdGhpcyk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmxlbmd0aCkge1xuICAgICAgICBlbWl0UmVhZGFibGUodGhpcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcztcbn07XG5SZWFkYWJsZS5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBSZWFkYWJsZS5wcm90b3R5cGUub247XG5cbmZ1bmN0aW9uIG5SZWFkaW5nTmV4dFRpY2soc2VsZikge1xuICBkZWJ1ZygncmVhZGFibGUgbmV4dHRpY2sgcmVhZCAwJyk7XG4gIHNlbGYucmVhZCgwKTtcbn1cblxuLy8gcGF1c2UoKSBhbmQgcmVzdW1lKCkgYXJlIHJlbW5hbnRzIG9mIHRoZSBsZWdhY3kgcmVhZGFibGUgc3RyZWFtIEFQSVxuLy8gSWYgdGhlIHVzZXIgdXNlcyB0aGVtLCB0aGVuIHN3aXRjaCBpbnRvIG9sZCBtb2RlLlxuUmVhZGFibGUucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgaWYgKCFzdGF0ZS5mbG93aW5nKSB7XG4gICAgZGVidWcoJ3Jlc3VtZScpO1xuICAgIHN0YXRlLmZsb3dpbmcgPSB0cnVlO1xuICAgIHJlc3VtZSh0aGlzLCBzdGF0ZSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiByZXN1bWUoc3RyZWFtLCBzdGF0ZSkge1xuICBpZiAoIXN0YXRlLnJlc3VtZVNjaGVkdWxlZCkge1xuICAgIHN0YXRlLnJlc3VtZVNjaGVkdWxlZCA9IHRydWU7XG4gICAgcHJvY2Vzc05leHRUaWNrKHJlc3VtZV8sIHN0cmVhbSwgc3RhdGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlc3VtZV8oc3RyZWFtLCBzdGF0ZSkge1xuICBpZiAoIXN0YXRlLnJlYWRpbmcpIHtcbiAgICBkZWJ1ZygncmVzdW1lIHJlYWQgMCcpO1xuICAgIHN0cmVhbS5yZWFkKDApO1xuICB9XG5cbiAgc3RhdGUucmVzdW1lU2NoZWR1bGVkID0gZmFsc2U7XG4gIHN0YXRlLmF3YWl0RHJhaW4gPSAwO1xuICBzdHJlYW0uZW1pdCgncmVzdW1lJyk7XG4gIGZsb3coc3RyZWFtKTtcbiAgaWYgKHN0YXRlLmZsb3dpbmcgJiYgIXN0YXRlLnJlYWRpbmcpIHN0cmVhbS5yZWFkKDApO1xufVxuXG5SZWFkYWJsZS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gIGRlYnVnKCdjYWxsIHBhdXNlIGZsb3dpbmc9JWonLCB0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcpO1xuICBpZiAoZmFsc2UgIT09IHRoaXMuX3JlYWRhYmxlU3RhdGUuZmxvd2luZykge1xuICAgIGRlYnVnKCdwYXVzZScpO1xuICAgIHRoaXMuX3JlYWRhYmxlU3RhdGUuZmxvd2luZyA9IGZhbHNlO1xuICAgIHRoaXMuZW1pdCgncGF1c2UnKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIGZsb3coc3RyZWFtKSB7XG4gIHZhciBzdGF0ZSA9IHN0cmVhbS5fcmVhZGFibGVTdGF0ZTtcbiAgZGVidWcoJ2Zsb3cnLCBzdGF0ZS5mbG93aW5nKTtcbiAgd2hpbGUgKHN0YXRlLmZsb3dpbmcgJiYgc3RyZWFtLnJlYWQoKSAhPT0gbnVsbCkge31cbn1cblxuLy8gd3JhcCBhbiBvbGQtc3R5bGUgc3RyZWFtIGFzIHRoZSBhc3luYyBkYXRhIHNvdXJjZS5cbi8vIFRoaXMgaXMgKm5vdCogcGFydCBvZiB0aGUgcmVhZGFibGUgc3RyZWFtIGludGVyZmFjZS5cbi8vIEl0IGlzIGFuIHVnbHkgdW5mb3J0dW5hdGUgbWVzcyBvZiBoaXN0b3J5LlxuUmVhZGFibGUucHJvdG90eXBlLndyYXAgPSBmdW5jdGlvbiAoc3RyZWFtKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gIHZhciBwYXVzZWQgPSBmYWxzZTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHN0cmVhbS5vbignZW5kJywgZnVuY3Rpb24gKCkge1xuICAgIGRlYnVnKCd3cmFwcGVkIGVuZCcpO1xuICAgIGlmIChzdGF0ZS5kZWNvZGVyICYmICFzdGF0ZS5lbmRlZCkge1xuICAgICAgdmFyIGNodW5rID0gc3RhdGUuZGVjb2Rlci5lbmQoKTtcbiAgICAgIGlmIChjaHVuayAmJiBjaHVuay5sZW5ndGgpIHNlbGYucHVzaChjaHVuayk7XG4gICAgfVxuXG4gICAgc2VsZi5wdXNoKG51bGwpO1xuICB9KTtcblxuICBzdHJlYW0ub24oJ2RhdGEnLCBmdW5jdGlvbiAoY2h1bmspIHtcbiAgICBkZWJ1Zygnd3JhcHBlZCBkYXRhJyk7XG4gICAgaWYgKHN0YXRlLmRlY29kZXIpIGNodW5rID0gc3RhdGUuZGVjb2Rlci53cml0ZShjaHVuayk7XG5cbiAgICAvLyBkb24ndCBza2lwIG92ZXIgZmFsc3kgdmFsdWVzIGluIG9iamVjdE1vZGVcbiAgICBpZiAoc3RhdGUub2JqZWN0TW9kZSAmJiAoY2h1bmsgPT09IG51bGwgfHwgY2h1bmsgPT09IHVuZGVmaW5lZCkpIHJldHVybjtlbHNlIGlmICghc3RhdGUub2JqZWN0TW9kZSAmJiAoIWNodW5rIHx8ICFjaHVuay5sZW5ndGgpKSByZXR1cm47XG5cbiAgICB2YXIgcmV0ID0gc2VsZi5wdXNoKGNodW5rKTtcbiAgICBpZiAoIXJldCkge1xuICAgICAgcGF1c2VkID0gdHJ1ZTtcbiAgICAgIHN0cmVhbS5wYXVzZSgpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gcHJveHkgYWxsIHRoZSBvdGhlciBtZXRob2RzLlxuICAvLyBpbXBvcnRhbnQgd2hlbiB3cmFwcGluZyBmaWx0ZXJzIGFuZCBkdXBsZXhlcy5cbiAgZm9yICh2YXIgaSBpbiBzdHJlYW0pIHtcbiAgICBpZiAodGhpc1tpXSA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBzdHJlYW1baV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXNbaV0gPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHN0cmVhbVttZXRob2RdLmFwcGx5KHN0cmVhbSwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH0oaSk7XG4gICAgfVxuICB9XG5cbiAgLy8gcHJveHkgY2VydGFpbiBpbXBvcnRhbnQgZXZlbnRzLlxuICBmb3IgKHZhciBuID0gMDsgbiA8IGtQcm94eUV2ZW50cy5sZW5ndGg7IG4rKykge1xuICAgIHN0cmVhbS5vbihrUHJveHlFdmVudHNbbl0sIHNlbGYuZW1pdC5iaW5kKHNlbGYsIGtQcm94eUV2ZW50c1tuXSkpO1xuICB9XG5cbiAgLy8gd2hlbiB3ZSB0cnkgdG8gY29uc3VtZSBzb21lIG1vcmUgYnl0ZXMsIHNpbXBseSB1bnBhdXNlIHRoZVxuICAvLyB1bmRlcmx5aW5nIHN0cmVhbS5cbiAgc2VsZi5fcmVhZCA9IGZ1bmN0aW9uIChuKSB7XG4gICAgZGVidWcoJ3dyYXBwZWQgX3JlYWQnLCBuKTtcbiAgICBpZiAocGF1c2VkKSB7XG4gICAgICBwYXVzZWQgPSBmYWxzZTtcbiAgICAgIHN0cmVhbS5yZXN1bWUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG4vLyBleHBvc2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzIG9ubHkuXG5SZWFkYWJsZS5fZnJvbUxpc3QgPSBmcm9tTGlzdDtcblxuLy8gUGx1Y2sgb2ZmIG4gYnl0ZXMgZnJvbSBhbiBhcnJheSBvZiBidWZmZXJzLlxuLy8gTGVuZ3RoIGlzIHRoZSBjb21iaW5lZCBsZW5ndGhzIG9mIGFsbCB0aGUgYnVmZmVycyBpbiB0aGUgbGlzdC5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gYmUgaW5saW5hYmxlLCBzbyBwbGVhc2UgdGFrZSBjYXJlIHdoZW4gbWFraW5nXG4vLyBjaGFuZ2VzIHRvIHRoZSBmdW5jdGlvbiBib2R5LlxuZnVuY3Rpb24gZnJvbUxpc3Qobiwgc3RhdGUpIHtcbiAgLy8gbm90aGluZyBidWZmZXJlZFxuICBpZiAoc3RhdGUubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICB2YXIgcmV0O1xuICBpZiAoc3RhdGUub2JqZWN0TW9kZSkgcmV0ID0gc3RhdGUuYnVmZmVyLnNoaWZ0KCk7ZWxzZSBpZiAoIW4gfHwgbiA+PSBzdGF0ZS5sZW5ndGgpIHtcbiAgICAvLyByZWFkIGl0IGFsbCwgdHJ1bmNhdGUgdGhlIGxpc3RcbiAgICBpZiAoc3RhdGUuZGVjb2RlcikgcmV0ID0gc3RhdGUuYnVmZmVyLmpvaW4oJycpO2Vsc2UgaWYgKHN0YXRlLmJ1ZmZlci5sZW5ndGggPT09IDEpIHJldCA9IHN0YXRlLmJ1ZmZlci5oZWFkLmRhdGE7ZWxzZSByZXQgPSBzdGF0ZS5idWZmZXIuY29uY2F0KHN0YXRlLmxlbmd0aCk7XG4gICAgc3RhdGUuYnVmZmVyLmNsZWFyKCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gcmVhZCBwYXJ0IG9mIGxpc3RcbiAgICByZXQgPSBmcm9tTGlzdFBhcnRpYWwobiwgc3RhdGUuYnVmZmVyLCBzdGF0ZS5kZWNvZGVyKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbi8vIEV4dHJhY3RzIG9ubHkgZW5vdWdoIGJ1ZmZlcmVkIGRhdGEgdG8gc2F0aXNmeSB0aGUgYW1vdW50IHJlcXVlc3RlZC5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gYmUgaW5saW5hYmxlLCBzbyBwbGVhc2UgdGFrZSBjYXJlIHdoZW4gbWFraW5nXG4vLyBjaGFuZ2VzIHRvIHRoZSBmdW5jdGlvbiBib2R5LlxuZnVuY3Rpb24gZnJvbUxpc3RQYXJ0aWFsKG4sIGxpc3QsIGhhc1N0cmluZ3MpIHtcbiAgdmFyIHJldDtcbiAgaWYgKG4gPCBsaXN0LmhlYWQuZGF0YS5sZW5ndGgpIHtcbiAgICAvLyBzbGljZSBpcyB0aGUgc2FtZSBmb3IgYnVmZmVycyBhbmQgc3RyaW5nc1xuICAgIHJldCA9IGxpc3QuaGVhZC5kYXRhLnNsaWNlKDAsIG4pO1xuICAgIGxpc3QuaGVhZC5kYXRhID0gbGlzdC5oZWFkLmRhdGEuc2xpY2Uobik7XG4gIH0gZWxzZSBpZiAobiA9PT0gbGlzdC5oZWFkLmRhdGEubGVuZ3RoKSB7XG4gICAgLy8gZmlyc3QgY2h1bmsgaXMgYSBwZXJmZWN0IG1hdGNoXG4gICAgcmV0ID0gbGlzdC5zaGlmdCgpO1xuICB9IGVsc2Uge1xuICAgIC8vIHJlc3VsdCBzcGFucyBtb3JlIHRoYW4gb25lIGJ1ZmZlclxuICAgIHJldCA9IGhhc1N0cmluZ3MgPyBjb3B5RnJvbUJ1ZmZlclN0cmluZyhuLCBsaXN0KSA6IGNvcHlGcm9tQnVmZmVyKG4sIGxpc3QpO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8vIENvcGllcyBhIHNwZWNpZmllZCBhbW91bnQgb2YgY2hhcmFjdGVycyBmcm9tIHRoZSBsaXN0IG9mIGJ1ZmZlcmVkIGRhdGFcbi8vIGNodW5rcy5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gYmUgaW5saW5hYmxlLCBzbyBwbGVhc2UgdGFrZSBjYXJlIHdoZW4gbWFraW5nXG4vLyBjaGFuZ2VzIHRvIHRoZSBmdW5jdGlvbiBib2R5LlxuZnVuY3Rpb24gY29weUZyb21CdWZmZXJTdHJpbmcobiwgbGlzdCkge1xuICB2YXIgcCA9IGxpc3QuaGVhZDtcbiAgdmFyIGMgPSAxO1xuICB2YXIgcmV0ID0gcC5kYXRhO1xuICBuIC09IHJldC5sZW5ndGg7XG4gIHdoaWxlIChwID0gcC5uZXh0KSB7XG4gICAgdmFyIHN0ciA9IHAuZGF0YTtcbiAgICB2YXIgbmIgPSBuID4gc3RyLmxlbmd0aCA/IHN0ci5sZW5ndGggOiBuO1xuICAgIGlmIChuYiA9PT0gc3RyLmxlbmd0aCkgcmV0ICs9IHN0cjtlbHNlIHJldCArPSBzdHIuc2xpY2UoMCwgbik7XG4gICAgbiAtPSBuYjtcbiAgICBpZiAobiA9PT0gMCkge1xuICAgICAgaWYgKG5iID09PSBzdHIubGVuZ3RoKSB7XG4gICAgICAgICsrYztcbiAgICAgICAgaWYgKHAubmV4dCkgbGlzdC5oZWFkID0gcC5uZXh0O2Vsc2UgbGlzdC5oZWFkID0gbGlzdC50YWlsID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3QuaGVhZCA9IHA7XG4gICAgICAgIHAuZGF0YSA9IHN0ci5zbGljZShuYik7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgKytjO1xuICB9XG4gIGxpc3QubGVuZ3RoIC09IGM7XG4gIHJldHVybiByZXQ7XG59XG5cbi8vIENvcGllcyBhIHNwZWNpZmllZCBhbW91bnQgb2YgYnl0ZXMgZnJvbSB0aGUgbGlzdCBvZiBidWZmZXJlZCBkYXRhIGNodW5rcy5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gYmUgaW5saW5hYmxlLCBzbyBwbGVhc2UgdGFrZSBjYXJlIHdoZW4gbWFraW5nXG4vLyBjaGFuZ2VzIHRvIHRoZSBmdW5jdGlvbiBib2R5LlxuZnVuY3Rpb24gY29weUZyb21CdWZmZXIobiwgbGlzdCkge1xuICB2YXIgcmV0ID0gQnVmZmVyLmFsbG9jVW5zYWZlKG4pO1xuICB2YXIgcCA9IGxpc3QuaGVhZDtcbiAgdmFyIGMgPSAxO1xuICBwLmRhdGEuY29weShyZXQpO1xuICBuIC09IHAuZGF0YS5sZW5ndGg7XG4gIHdoaWxlIChwID0gcC5uZXh0KSB7XG4gICAgdmFyIGJ1ZiA9IHAuZGF0YTtcbiAgICB2YXIgbmIgPSBuID4gYnVmLmxlbmd0aCA/IGJ1Zi5sZW5ndGggOiBuO1xuICAgIGJ1Zi5jb3B5KHJldCwgcmV0Lmxlbmd0aCAtIG4sIDAsIG5iKTtcbiAgICBuIC09IG5iO1xuICAgIGlmIChuID09PSAwKSB7XG4gICAgICBpZiAobmIgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICAgICAgKytjO1xuICAgICAgICBpZiAocC5uZXh0KSBsaXN0LmhlYWQgPSBwLm5leHQ7ZWxzZSBsaXN0LmhlYWQgPSBsaXN0LnRhaWwgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdC5oZWFkID0gcDtcbiAgICAgICAgcC5kYXRhID0gYnVmLnNsaWNlKG5iKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICArK2M7XG4gIH1cbiAgbGlzdC5sZW5ndGggLT0gYztcbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gZW5kUmVhZGFibGUoc3RyZWFtKSB7XG4gIHZhciBzdGF0ZSA9IHN0cmVhbS5fcmVhZGFibGVTdGF0ZTtcblxuICAvLyBJZiB3ZSBnZXQgaGVyZSBiZWZvcmUgY29uc3VtaW5nIGFsbCB0aGUgYnl0ZXMsIHRoZW4gdGhhdCBpcyBhXG4gIC8vIGJ1ZyBpbiBub2RlLiAgU2hvdWxkIG5ldmVyIGhhcHBlbi5cbiAgaWYgKHN0YXRlLmxlbmd0aCA+IDApIHRocm93IG5ldyBFcnJvcignXCJlbmRSZWFkYWJsZSgpXCIgY2FsbGVkIG9uIG5vbi1lbXB0eSBzdHJlYW0nKTtcblxuICBpZiAoIXN0YXRlLmVuZEVtaXR0ZWQpIHtcbiAgICBzdGF0ZS5lbmRlZCA9IHRydWU7XG4gICAgcHJvY2Vzc05leHRUaWNrKGVuZFJlYWRhYmxlTlQsIHN0YXRlLCBzdHJlYW0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVuZFJlYWRhYmxlTlQoc3RhdGUsIHN0cmVhbSkge1xuICAvLyBDaGVjayB0aGF0IHdlIGRpZG4ndCBnZXQgb25lIGxhc3QgdW5zaGlmdC5cbiAgaWYgKCFzdGF0ZS5lbmRFbWl0dGVkICYmIHN0YXRlLmxlbmd0aCA9PT0gMCkge1xuICAgIHN0YXRlLmVuZEVtaXR0ZWQgPSB0cnVlO1xuICAgIHN0cmVhbS5yZWFkYWJsZSA9IGZhbHNlO1xuICAgIHN0cmVhbS5lbWl0KCdlbmQnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoKHhzLCBmKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsID0geHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZih4c1tpXSwgaSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5kZXhPZih4cywgeCkge1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHhzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGlmICh4c1tpXSA9PT0geCkgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBhIHRyYW5zZm9ybSBzdHJlYW0gaXMgYSByZWFkYWJsZS93cml0YWJsZSBzdHJlYW0gd2hlcmUgeW91IGRvXG4vLyBzb21ldGhpbmcgd2l0aCB0aGUgZGF0YS4gIFNvbWV0aW1lcyBpdCdzIGNhbGxlZCBhIFwiZmlsdGVyXCIsXG4vLyBidXQgdGhhdCdzIG5vdCBhIGdyZWF0IG5hbWUgZm9yIGl0LCBzaW5jZSB0aGF0IGltcGxpZXMgYSB0aGluZyB3aGVyZVxuLy8gc29tZSBiaXRzIHBhc3MgdGhyb3VnaCwgYW5kIG90aGVycyBhcmUgc2ltcGx5IGlnbm9yZWQuICAoVGhhdCB3b3VsZFxuLy8gYmUgYSB2YWxpZCBleGFtcGxlIG9mIGEgdHJhbnNmb3JtLCBvZiBjb3Vyc2UuKVxuLy9cbi8vIFdoaWxlIHRoZSBvdXRwdXQgaXMgY2F1c2FsbHkgcmVsYXRlZCB0byB0aGUgaW5wdXQsIGl0J3Mgbm90IGFcbi8vIG5lY2Vzc2FyaWx5IHN5bW1ldHJpYyBvciBzeW5jaHJvbm91cyB0cmFuc2Zvcm1hdGlvbi4gIEZvciBleGFtcGxlLFxuLy8gYSB6bGliIHN0cmVhbSBtaWdodCB0YWtlIG11bHRpcGxlIHBsYWluLXRleHQgd3JpdGVzKCksIGFuZCB0aGVuXG4vLyBlbWl0IGEgc2luZ2xlIGNvbXByZXNzZWQgY2h1bmsgc29tZSB0aW1lIGluIHRoZSBmdXR1cmUuXG4vL1xuLy8gSGVyZSdzIGhvdyB0aGlzIHdvcmtzOlxuLy9cbi8vIFRoZSBUcmFuc2Zvcm0gc3RyZWFtIGhhcyBhbGwgdGhlIGFzcGVjdHMgb2YgdGhlIHJlYWRhYmxlIGFuZCB3cml0YWJsZVxuLy8gc3RyZWFtIGNsYXNzZXMuICBXaGVuIHlvdSB3cml0ZShjaHVuayksIHRoYXQgY2FsbHMgX3dyaXRlKGNodW5rLGNiKVxuLy8gaW50ZXJuYWxseSwgYW5kIHJldHVybnMgZmFsc2UgaWYgdGhlcmUncyBhIGxvdCBvZiBwZW5kaW5nIHdyaXRlc1xuLy8gYnVmZmVyZWQgdXAuICBXaGVuIHlvdSBjYWxsIHJlYWQoKSwgdGhhdCBjYWxscyBfcmVhZChuKSB1bnRpbFxuLy8gdGhlcmUncyBlbm91Z2ggcGVuZGluZyByZWFkYWJsZSBkYXRhIGJ1ZmZlcmVkIHVwLlxuLy9cbi8vIEluIGEgdHJhbnNmb3JtIHN0cmVhbSwgdGhlIHdyaXR0ZW4gZGF0YSBpcyBwbGFjZWQgaW4gYSBidWZmZXIuICBXaGVuXG4vLyBfcmVhZChuKSBpcyBjYWxsZWQsIGl0IHRyYW5zZm9ybXMgdGhlIHF1ZXVlZCB1cCBkYXRhLCBjYWxsaW5nIHRoZVxuLy8gYnVmZmVyZWQgX3dyaXRlIGNiJ3MgYXMgaXQgY29uc3VtZXMgY2h1bmtzLiAgSWYgY29uc3VtaW5nIGEgc2luZ2xlXG4vLyB3cml0dGVuIGNodW5rIHdvdWxkIHJlc3VsdCBpbiBtdWx0aXBsZSBvdXRwdXQgY2h1bmtzLCB0aGVuIHRoZSBmaXJzdFxuLy8gb3V0cHV0dGVkIGJpdCBjYWxscyB0aGUgcmVhZGNiLCBhbmQgc3Vic2VxdWVudCBjaHVua3MganVzdCBnbyBpbnRvXG4vLyB0aGUgcmVhZCBidWZmZXIsIGFuZCB3aWxsIGNhdXNlIGl0IHRvIGVtaXQgJ3JlYWRhYmxlJyBpZiBuZWNlc3NhcnkuXG4vL1xuLy8gVGhpcyB3YXksIGJhY2stcHJlc3N1cmUgaXMgYWN0dWFsbHkgZGV0ZXJtaW5lZCBieSB0aGUgcmVhZGluZyBzaWRlLFxuLy8gc2luY2UgX3JlYWQgaGFzIHRvIGJlIGNhbGxlZCB0byBzdGFydCBwcm9jZXNzaW5nIGEgbmV3IGNodW5rLiAgSG93ZXZlcixcbi8vIGEgcGF0aG9sb2dpY2FsIGluZmxhdGUgdHlwZSBvZiB0cmFuc2Zvcm0gY2FuIGNhdXNlIGV4Y2Vzc2l2ZSBidWZmZXJpbmdcbi8vIGhlcmUuICBGb3IgZXhhbXBsZSwgaW1hZ2luZSBhIHN0cmVhbSB3aGVyZSBldmVyeSBieXRlIG9mIGlucHV0IGlzXG4vLyBpbnRlcnByZXRlZCBhcyBhbiBpbnRlZ2VyIGZyb20gMC0yNTUsIGFuZCB0aGVuIHJlc3VsdHMgaW4gdGhhdCBtYW55XG4vLyBieXRlcyBvZiBvdXRwdXQuICBXcml0aW5nIHRoZSA0IGJ5dGVzIHtmZixmZixmZixmZn0gd291bGQgcmVzdWx0IGluXG4vLyAxa2Igb2YgZGF0YSBiZWluZyBvdXRwdXQuICBJbiB0aGlzIGNhc2UsIHlvdSBjb3VsZCB3cml0ZSBhIHZlcnkgc21hbGxcbi8vIGFtb3VudCBvZiBpbnB1dCwgYW5kIGVuZCB1cCB3aXRoIGEgdmVyeSBsYXJnZSBhbW91bnQgb2Ygb3V0cHV0LiAgSW5cbi8vIHN1Y2ggYSBwYXRob2xvZ2ljYWwgaW5mbGF0aW5nIG1lY2hhbmlzbSwgdGhlcmUnZCBiZSBubyB3YXkgdG8gdGVsbFxuLy8gdGhlIHN5c3RlbSB0byBzdG9wIGRvaW5nIHRoZSB0cmFuc2Zvcm0uICBBIHNpbmdsZSA0TUIgd3JpdGUgY291bGRcbi8vIGNhdXNlIHRoZSBzeXN0ZW0gdG8gcnVuIG91dCBvZiBtZW1vcnkuXG4vL1xuLy8gSG93ZXZlciwgZXZlbiBpbiBzdWNoIGEgcGF0aG9sb2dpY2FsIGNhc2UsIG9ubHkgYSBzaW5nbGUgd3JpdHRlbiBjaHVua1xuLy8gd291bGQgYmUgY29uc3VtZWQsIGFuZCB0aGVuIHRoZSByZXN0IHdvdWxkIHdhaXQgKHVuLXRyYW5zZm9ybWVkKSB1bnRpbFxuLy8gdGhlIHJlc3VsdHMgb2YgdGhlIHByZXZpb3VzIHRyYW5zZm9ybWVkIGNodW5rIHdlcmUgY29uc3VtZWQuXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2Zvcm07XG5cbnZhciBEdXBsZXggPSByZXF1aXJlKCcuL19zdHJlYW1fZHVwbGV4Jyk7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgdXRpbCA9IHJlcXVpcmUoJ2NvcmUtdXRpbC1pcycpO1xudXRpbC5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudXRpbC5pbmhlcml0cyhUcmFuc2Zvcm0sIER1cGxleCk7XG5cbmZ1bmN0aW9uIFRyYW5zZm9ybVN0YXRlKHN0cmVhbSkge1xuICB0aGlzLmFmdGVyVHJhbnNmb3JtID0gZnVuY3Rpb24gKGVyLCBkYXRhKSB7XG4gICAgcmV0dXJuIGFmdGVyVHJhbnNmb3JtKHN0cmVhbSwgZXIsIGRhdGEpO1xuICB9O1xuXG4gIHRoaXMubmVlZFRyYW5zZm9ybSA9IGZhbHNlO1xuICB0aGlzLnRyYW5zZm9ybWluZyA9IGZhbHNlO1xuICB0aGlzLndyaXRlY2IgPSBudWxsO1xuICB0aGlzLndyaXRlY2h1bmsgPSBudWxsO1xuICB0aGlzLndyaXRlZW5jb2RpbmcgPSBudWxsO1xufVxuXG5mdW5jdGlvbiBhZnRlclRyYW5zZm9ybShzdHJlYW0sIGVyLCBkYXRhKSB7XG4gIHZhciB0cyA9IHN0cmVhbS5fdHJhbnNmb3JtU3RhdGU7XG4gIHRzLnRyYW5zZm9ybWluZyA9IGZhbHNlO1xuXG4gIHZhciBjYiA9IHRzLndyaXRlY2I7XG5cbiAgaWYgKCFjYikge1xuICAgIHJldHVybiBzdHJlYW0uZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ3dyaXRlIGNhbGxiYWNrIGNhbGxlZCBtdWx0aXBsZSB0aW1lcycpKTtcbiAgfVxuXG4gIHRzLndyaXRlY2h1bmsgPSBudWxsO1xuICB0cy53cml0ZWNiID0gbnVsbDtcblxuICBpZiAoZGF0YSAhPT0gbnVsbCAmJiBkYXRhICE9PSB1bmRlZmluZWQpIHN0cmVhbS5wdXNoKGRhdGEpO1xuXG4gIGNiKGVyKTtcblxuICB2YXIgcnMgPSBzdHJlYW0uX3JlYWRhYmxlU3RhdGU7XG4gIHJzLnJlYWRpbmcgPSBmYWxzZTtcbiAgaWYgKHJzLm5lZWRSZWFkYWJsZSB8fCBycy5sZW5ndGggPCBycy5oaWdoV2F0ZXJNYXJrKSB7XG4gICAgc3RyZWFtLl9yZWFkKHJzLmhpZ2hXYXRlck1hcmspO1xuICB9XG59XG5cbmZ1bmN0aW9uIFRyYW5zZm9ybShvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBUcmFuc2Zvcm0pKSByZXR1cm4gbmV3IFRyYW5zZm9ybShvcHRpb25zKTtcblxuICBEdXBsZXguY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICB0aGlzLl90cmFuc2Zvcm1TdGF0ZSA9IG5ldyBUcmFuc2Zvcm1TdGF0ZSh0aGlzKTtcblxuICB2YXIgc3RyZWFtID0gdGhpcztcblxuICAvLyBzdGFydCBvdXQgYXNraW5nIGZvciBhIHJlYWRhYmxlIGV2ZW50IG9uY2UgZGF0YSBpcyB0cmFuc2Zvcm1lZC5cbiAgdGhpcy5fcmVhZGFibGVTdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuXG4gIC8vIHdlIGhhdmUgaW1wbGVtZW50ZWQgdGhlIF9yZWFkIG1ldGhvZCwgYW5kIGRvbmUgdGhlIG90aGVyIHRoaW5nc1xuICAvLyB0aGF0IFJlYWRhYmxlIHdhbnRzIGJlZm9yZSB0aGUgZmlyc3QgX3JlYWQgY2FsbCwgc28gdW5zZXQgdGhlXG4gIC8vIHN5bmMgZ3VhcmQgZmxhZy5cbiAgdGhpcy5fcmVhZGFibGVTdGF0ZS5zeW5jID0gZmFsc2U7XG5cbiAgaWYgKG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMudHJhbnNmb3JtID09PSAnZnVuY3Rpb24nKSB0aGlzLl90cmFuc2Zvcm0gPSBvcHRpb25zLnRyYW5zZm9ybTtcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5mbHVzaCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5fZmx1c2ggPSBvcHRpb25zLmZsdXNoO1xuICB9XG5cbiAgLy8gV2hlbiB0aGUgd3JpdGFibGUgc2lkZSBmaW5pc2hlcywgdGhlbiBmbHVzaCBvdXQgYW55dGhpbmcgcmVtYWluaW5nLlxuICB0aGlzLm9uY2UoJ3ByZWZpbmlzaCcsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX2ZsdXNoID09PSAnZnVuY3Rpb24nKSB0aGlzLl9mbHVzaChmdW5jdGlvbiAoZXIsIGRhdGEpIHtcbiAgICAgIGRvbmUoc3RyZWFtLCBlciwgZGF0YSk7XG4gICAgfSk7ZWxzZSBkb25lKHN0cmVhbSk7XG4gIH0pO1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGVuY29kaW5nKSB7XG4gIHRoaXMuX3RyYW5zZm9ybVN0YXRlLm5lZWRUcmFuc2Zvcm0gPSBmYWxzZTtcbiAgcmV0dXJuIER1cGxleC5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBlbmNvZGluZyk7XG59O1xuXG4vLyBUaGlzIGlzIHRoZSBwYXJ0IHdoZXJlIHlvdSBkbyBzdHVmZiFcbi8vIG92ZXJyaWRlIHRoaXMgZnVuY3Rpb24gaW4gaW1wbGVtZW50YXRpb24gY2xhc3Nlcy5cbi8vICdjaHVuaycgaXMgYW4gaW5wdXQgY2h1bmsuXG4vL1xuLy8gQ2FsbCBgcHVzaChuZXdDaHVuaylgIHRvIHBhc3MgYWxvbmcgdHJhbnNmb3JtZWQgb3V0cHV0XG4vLyB0byB0aGUgcmVhZGFibGUgc2lkZS4gIFlvdSBtYXkgY2FsbCAncHVzaCcgemVybyBvciBtb3JlIHRpbWVzLlxuLy9cbi8vIENhbGwgYGNiKGVycilgIHdoZW4geW91IGFyZSBkb25lIHdpdGggdGhpcyBjaHVuay4gIElmIHlvdSBwYXNzXG4vLyBhbiBlcnJvciwgdGhlbiB0aGF0J2xsIHB1dCB0aGUgaHVydCBvbiB0aGUgd2hvbGUgb3BlcmF0aW9uLiAgSWYgeW91XG4vLyBuZXZlciBjYWxsIGNiKCksIHRoZW4geW91J2xsIG5ldmVyIGdldCBhbm90aGVyIGNodW5rLlxuVHJhbnNmb3JtLnByb3RvdHlwZS5fdHJhbnNmb3JtID0gZnVuY3Rpb24gKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdfdHJhbnNmb3JtKCkgaXMgbm90IGltcGxlbWVudGVkJyk7XG59O1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLl93cml0ZSA9IGZ1bmN0aW9uIChjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHZhciB0cyA9IHRoaXMuX3RyYW5zZm9ybVN0YXRlO1xuICB0cy53cml0ZWNiID0gY2I7XG4gIHRzLndyaXRlY2h1bmsgPSBjaHVuaztcbiAgdHMud3JpdGVlbmNvZGluZyA9IGVuY29kaW5nO1xuICBpZiAoIXRzLnRyYW5zZm9ybWluZykge1xuICAgIHZhciBycyA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gICAgaWYgKHRzLm5lZWRUcmFuc2Zvcm0gfHwgcnMubmVlZFJlYWRhYmxlIHx8IHJzLmxlbmd0aCA8IHJzLmhpZ2hXYXRlck1hcmspIHRoaXMuX3JlYWQocnMuaGlnaFdhdGVyTWFyayk7XG4gIH1cbn07XG5cbi8vIERvZXNuJ3QgbWF0dGVyIHdoYXQgdGhlIGFyZ3MgYXJlIGhlcmUuXG4vLyBfdHJhbnNmb3JtIGRvZXMgYWxsIHRoZSB3b3JrLlxuLy8gVGhhdCB3ZSBnb3QgaGVyZSBtZWFucyB0aGF0IHRoZSByZWFkYWJsZSBzaWRlIHdhbnRzIG1vcmUgZGF0YS5cblRyYW5zZm9ybS5wcm90b3R5cGUuX3JlYWQgPSBmdW5jdGlvbiAobikge1xuICB2YXIgdHMgPSB0aGlzLl90cmFuc2Zvcm1TdGF0ZTtcblxuICBpZiAodHMud3JpdGVjaHVuayAhPT0gbnVsbCAmJiB0cy53cml0ZWNiICYmICF0cy50cmFuc2Zvcm1pbmcpIHtcbiAgICB0cy50cmFuc2Zvcm1pbmcgPSB0cnVlO1xuICAgIHRoaXMuX3RyYW5zZm9ybSh0cy53cml0ZWNodW5rLCB0cy53cml0ZWVuY29kaW5nLCB0cy5hZnRlclRyYW5zZm9ybSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gbWFyayB0aGF0IHdlIG5lZWQgYSB0cmFuc2Zvcm0sIHNvIHRoYXQgYW55IGRhdGEgdGhhdCBjb21lcyBpblxuICAgIC8vIHdpbGwgZ2V0IHByb2Nlc3NlZCwgbm93IHRoYXQgd2UndmUgYXNrZWQgZm9yIGl0LlxuICAgIHRzLm5lZWRUcmFuc2Zvcm0gPSB0cnVlO1xuICB9XG59O1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLl9kZXN0cm95ID0gZnVuY3Rpb24gKGVyciwgY2IpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICBEdXBsZXgucHJvdG90eXBlLl9kZXN0cm95LmNhbGwodGhpcywgZXJyLCBmdW5jdGlvbiAoZXJyMikge1xuICAgIGNiKGVycjIpO1xuICAgIF90aGlzLmVtaXQoJ2Nsb3NlJyk7XG4gIH0pO1xufTtcblxuZnVuY3Rpb24gZG9uZShzdHJlYW0sIGVyLCBkYXRhKSB7XG4gIGlmIChlcikgcmV0dXJuIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcblxuICBpZiAoZGF0YSAhPT0gbnVsbCAmJiBkYXRhICE9PSB1bmRlZmluZWQpIHN0cmVhbS5wdXNoKGRhdGEpO1xuXG4gIC8vIGlmIHRoZXJlJ3Mgbm90aGluZyBpbiB0aGUgd3JpdGUgYnVmZmVyLCB0aGVuIHRoYXQgbWVhbnNcbiAgLy8gdGhhdCBub3RoaW5nIG1vcmUgd2lsbCBldmVyIGJlIHByb3ZpZGVkXG4gIHZhciB3cyA9IHN0cmVhbS5fd3JpdGFibGVTdGF0ZTtcbiAgdmFyIHRzID0gc3RyZWFtLl90cmFuc2Zvcm1TdGF0ZTtcblxuICBpZiAod3MubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0NhbGxpbmcgdHJhbnNmb3JtIGRvbmUgd2hlbiB3cy5sZW5ndGggIT0gMCcpO1xuXG4gIGlmICh0cy50cmFuc2Zvcm1pbmcpIHRocm93IG5ldyBFcnJvcignQ2FsbGluZyB0cmFuc2Zvcm0gZG9uZSB3aGVuIHN0aWxsIHRyYW5zZm9ybWluZycpO1xuXG4gIHJldHVybiBzdHJlYW0ucHVzaChudWxsKTtcbn0iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gQSBiaXQgc2ltcGxlciB0aGFuIHJlYWRhYmxlIHN0cmVhbXMuXG4vLyBJbXBsZW1lbnQgYW4gYXN5bmMgLl93cml0ZShjaHVuaywgZW5jb2RpbmcsIGNiKSwgYW5kIGl0J2xsIGhhbmRsZSBhbGxcbi8vIHRoZSBkcmFpbiBldmVudCBlbWlzc2lvbiBhbmQgYnVmZmVyaW5nLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8qPHJlcGxhY2VtZW50PiovXG5cbnZhciBwcm9jZXNzTmV4dFRpY2sgPSByZXF1aXJlKCdwcm9jZXNzLW5leHRpY2stYXJncycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbm1vZHVsZS5leHBvcnRzID0gV3JpdGFibGU7XG5cbi8qIDxyZXBsYWNlbWVudD4gKi9cbmZ1bmN0aW9uIFdyaXRlUmVxKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgdGhpcy5jaHVuayA9IGNodW5rO1xuICB0aGlzLmVuY29kaW5nID0gZW5jb2Rpbmc7XG4gIHRoaXMuY2FsbGJhY2sgPSBjYjtcbiAgdGhpcy5uZXh0ID0gbnVsbDtcbn1cblxuLy8gSXQgc2VlbXMgYSBsaW5rZWQgbGlzdCBidXQgaXQgaXMgbm90XG4vLyB0aGVyZSB3aWxsIGJlIG9ubHkgMiBvZiB0aGVzZSBmb3IgZWFjaCBzdHJlYW1cbmZ1bmN0aW9uIENvcmtlZFJlcXVlc3Qoc3RhdGUpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICB0aGlzLm5leHQgPSBudWxsO1xuICB0aGlzLmVudHJ5ID0gbnVsbDtcbiAgdGhpcy5maW5pc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgb25Db3JrZWRGaW5pc2goX3RoaXMsIHN0YXRlKTtcbiAgfTtcbn1cbi8qIDwvcmVwbGFjZW1lbnQ+ICovXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgYXN5bmNXcml0ZSA9ICFwcm9jZXNzLmJyb3dzZXIgJiYgWyd2MC4xMCcsICd2MC45LiddLmluZGV4T2YocHJvY2Vzcy52ZXJzaW9uLnNsaWNlKDAsIDUpKSA+IC0xID8gc2V0SW1tZWRpYXRlIDogcHJvY2Vzc05leHRUaWNrO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgRHVwbGV4O1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbldyaXRhYmxlLldyaXRhYmxlU3RhdGUgPSBXcml0YWJsZVN0YXRlO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHV0aWwgPSByZXF1aXJlKCdjb3JlLXV0aWwtaXMnKTtcbnV0aWwuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgaW50ZXJuYWxVdGlsID0ge1xuICBkZXByZWNhdGU6IHJlcXVpcmUoJ3V0aWwtZGVwcmVjYXRlJylcbn07XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBTdHJlYW0gPSByZXF1aXJlKCcuL2ludGVybmFsL3N0cmVhbXMvc3RyZWFtJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBCdWZmZXIgPSByZXF1aXJlKCdzYWZlLWJ1ZmZlcicpLkJ1ZmZlcjtcbnZhciBPdXJVaW50OEFycmF5ID0gZ2xvYmFsLlVpbnQ4QXJyYXkgfHwgZnVuY3Rpb24gKCkge307XG5mdW5jdGlvbiBfdWludDhBcnJheVRvQnVmZmVyKGNodW5rKSB7XG4gIHJldHVybiBCdWZmZXIuZnJvbShjaHVuayk7XG59XG5mdW5jdGlvbiBfaXNVaW50OEFycmF5KG9iaikge1xuICByZXR1cm4gQnVmZmVyLmlzQnVmZmVyKG9iaikgfHwgb2JqIGluc3RhbmNlb2YgT3VyVWludDhBcnJheTtcbn1cbi8qPC9yZXBsYWNlbWVudD4qL1xuXG52YXIgZGVzdHJveUltcGwgPSByZXF1aXJlKCcuL2ludGVybmFsL3N0cmVhbXMvZGVzdHJveScpO1xuXG51dGlsLmluaGVyaXRzKFdyaXRhYmxlLCBTdHJlYW0pO1xuXG5mdW5jdGlvbiBub3AoKSB7fVxuXG5mdW5jdGlvbiBXcml0YWJsZVN0YXRlKG9wdGlvbnMsIHN0cmVhbSkge1xuICBEdXBsZXggPSBEdXBsZXggfHwgcmVxdWlyZSgnLi9fc3RyZWFtX2R1cGxleCcpO1xuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIC8vIG9iamVjdCBzdHJlYW0gZmxhZyB0byBpbmRpY2F0ZSB3aGV0aGVyIG9yIG5vdCB0aGlzIHN0cmVhbVxuICAvLyBjb250YWlucyBidWZmZXJzIG9yIG9iamVjdHMuXG4gIHRoaXMub2JqZWN0TW9kZSA9ICEhb3B0aW9ucy5vYmplY3RNb2RlO1xuXG4gIGlmIChzdHJlYW0gaW5zdGFuY2VvZiBEdXBsZXgpIHRoaXMub2JqZWN0TW9kZSA9IHRoaXMub2JqZWN0TW9kZSB8fCAhIW9wdGlvbnMud3JpdGFibGVPYmplY3RNb2RlO1xuXG4gIC8vIHRoZSBwb2ludCBhdCB3aGljaCB3cml0ZSgpIHN0YXJ0cyByZXR1cm5pbmcgZmFsc2VcbiAgLy8gTm90ZTogMCBpcyBhIHZhbGlkIHZhbHVlLCBtZWFucyB0aGF0IHdlIGFsd2F5cyByZXR1cm4gZmFsc2UgaWZcbiAgLy8gdGhlIGVudGlyZSBidWZmZXIgaXMgbm90IGZsdXNoZWQgaW1tZWRpYXRlbHkgb24gd3JpdGUoKVxuICB2YXIgaHdtID0gb3B0aW9ucy5oaWdoV2F0ZXJNYXJrO1xuICB2YXIgZGVmYXVsdEh3bSA9IHRoaXMub2JqZWN0TW9kZSA/IDE2IDogMTYgKiAxMDI0O1xuICB0aGlzLmhpZ2hXYXRlck1hcmsgPSBod20gfHwgaHdtID09PSAwID8gaHdtIDogZGVmYXVsdEh3bTtcblxuICAvLyBjYXN0IHRvIGludHMuXG4gIHRoaXMuaGlnaFdhdGVyTWFyayA9IE1hdGguZmxvb3IodGhpcy5oaWdoV2F0ZXJNYXJrKTtcblxuICAvLyBpZiBfZmluYWwgaGFzIGJlZW4gY2FsbGVkXG4gIHRoaXMuZmluYWxDYWxsZWQgPSBmYWxzZTtcblxuICAvLyBkcmFpbiBldmVudCBmbGFnLlxuICB0aGlzLm5lZWREcmFpbiA9IGZhbHNlO1xuICAvLyBhdCB0aGUgc3RhcnQgb2YgY2FsbGluZyBlbmQoKVxuICB0aGlzLmVuZGluZyA9IGZhbHNlO1xuICAvLyB3aGVuIGVuZCgpIGhhcyBiZWVuIGNhbGxlZCwgYW5kIHJldHVybmVkXG4gIHRoaXMuZW5kZWQgPSBmYWxzZTtcbiAgLy8gd2hlbiAnZmluaXNoJyBpcyBlbWl0dGVkXG4gIHRoaXMuZmluaXNoZWQgPSBmYWxzZTtcblxuICAvLyBoYXMgaXQgYmVlbiBkZXN0cm95ZWRcbiAgdGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcblxuICAvLyBzaG91bGQgd2UgZGVjb2RlIHN0cmluZ3MgaW50byBidWZmZXJzIGJlZm9yZSBwYXNzaW5nIHRvIF93cml0ZT9cbiAgLy8gdGhpcyBpcyBoZXJlIHNvIHRoYXQgc29tZSBub2RlLWNvcmUgc3RyZWFtcyBjYW4gb3B0aW1pemUgc3RyaW5nXG4gIC8vIGhhbmRsaW5nIGF0IGEgbG93ZXIgbGV2ZWwuXG4gIHZhciBub0RlY29kZSA9IG9wdGlvbnMuZGVjb2RlU3RyaW5ncyA9PT0gZmFsc2U7XG4gIHRoaXMuZGVjb2RlU3RyaW5ncyA9ICFub0RlY29kZTtcblxuICAvLyBDcnlwdG8gaXMga2luZCBvZiBvbGQgYW5kIGNydXN0eS4gIEhpc3RvcmljYWxseSwgaXRzIGRlZmF1bHQgc3RyaW5nXG4gIC8vIGVuY29kaW5nIGlzICdiaW5hcnknIHNvIHdlIGhhdmUgdG8gbWFrZSB0aGlzIGNvbmZpZ3VyYWJsZS5cbiAgLy8gRXZlcnl0aGluZyBlbHNlIGluIHRoZSB1bml2ZXJzZSB1c2VzICd1dGY4JywgdGhvdWdoLlxuICB0aGlzLmRlZmF1bHRFbmNvZGluZyA9IG9wdGlvbnMuZGVmYXVsdEVuY29kaW5nIHx8ICd1dGY4JztcblxuICAvLyBub3QgYW4gYWN0dWFsIGJ1ZmZlciB3ZSBrZWVwIHRyYWNrIG9mLCBidXQgYSBtZWFzdXJlbWVudFxuICAvLyBvZiBob3cgbXVjaCB3ZSdyZSB3YWl0aW5nIHRvIGdldCBwdXNoZWQgdG8gc29tZSB1bmRlcmx5aW5nXG4gIC8vIHNvY2tldCBvciBmaWxlLlxuICB0aGlzLmxlbmd0aCA9IDA7XG5cbiAgLy8gYSBmbGFnIHRvIHNlZSB3aGVuIHdlJ3JlIGluIHRoZSBtaWRkbGUgb2YgYSB3cml0ZS5cbiAgdGhpcy53cml0aW5nID0gZmFsc2U7XG5cbiAgLy8gd2hlbiB0cnVlIGFsbCB3cml0ZXMgd2lsbCBiZSBidWZmZXJlZCB1bnRpbCAudW5jb3JrKCkgY2FsbFxuICB0aGlzLmNvcmtlZCA9IDA7XG5cbiAgLy8gYSBmbGFnIHRvIGJlIGFibGUgdG8gdGVsbCBpZiB0aGUgb253cml0ZSBjYiBpcyBjYWxsZWQgaW1tZWRpYXRlbHksXG4gIC8vIG9yIG9uIGEgbGF0ZXIgdGljay4gIFdlIHNldCB0aGlzIHRvIHRydWUgYXQgZmlyc3QsIGJlY2F1c2UgYW55XG4gIC8vIGFjdGlvbnMgdGhhdCBzaG91bGRuJ3QgaGFwcGVuIHVudGlsIFwibGF0ZXJcIiBzaG91bGQgZ2VuZXJhbGx5IGFsc29cbiAgLy8gbm90IGhhcHBlbiBiZWZvcmUgdGhlIGZpcnN0IHdyaXRlIGNhbGwuXG4gIHRoaXMuc3luYyA9IHRydWU7XG5cbiAgLy8gYSBmbGFnIHRvIGtub3cgaWYgd2UncmUgcHJvY2Vzc2luZyBwcmV2aW91c2x5IGJ1ZmZlcmVkIGl0ZW1zLCB3aGljaFxuICAvLyBtYXkgY2FsbCB0aGUgX3dyaXRlKCkgY2FsbGJhY2sgaW4gdGhlIHNhbWUgdGljaywgc28gdGhhdCB3ZSBkb24ndFxuICAvLyBlbmQgdXAgaW4gYW4gb3ZlcmxhcHBlZCBvbndyaXRlIHNpdHVhdGlvbi5cbiAgdGhpcy5idWZmZXJQcm9jZXNzaW5nID0gZmFsc2U7XG5cbiAgLy8gdGhlIGNhbGxiYWNrIHRoYXQncyBwYXNzZWQgdG8gX3dyaXRlKGNodW5rLGNiKVxuICB0aGlzLm9ud3JpdGUgPSBmdW5jdGlvbiAoZXIpIHtcbiAgICBvbndyaXRlKHN0cmVhbSwgZXIpO1xuICB9O1xuXG4gIC8vIHRoZSBjYWxsYmFjayB0aGF0IHRoZSB1c2VyIHN1cHBsaWVzIHRvIHdyaXRlKGNodW5rLGVuY29kaW5nLGNiKVxuICB0aGlzLndyaXRlY2IgPSBudWxsO1xuXG4gIC8vIHRoZSBhbW91bnQgdGhhdCBpcyBiZWluZyB3cml0dGVuIHdoZW4gX3dyaXRlIGlzIGNhbGxlZC5cbiAgdGhpcy53cml0ZWxlbiA9IDA7XG5cbiAgdGhpcy5idWZmZXJlZFJlcXVlc3QgPSBudWxsO1xuICB0aGlzLmxhc3RCdWZmZXJlZFJlcXVlc3QgPSBudWxsO1xuXG4gIC8vIG51bWJlciBvZiBwZW5kaW5nIHVzZXItc3VwcGxpZWQgd3JpdGUgY2FsbGJhY2tzXG4gIC8vIHRoaXMgbXVzdCBiZSAwIGJlZm9yZSAnZmluaXNoJyBjYW4gYmUgZW1pdHRlZFxuICB0aGlzLnBlbmRpbmdjYiA9IDA7XG5cbiAgLy8gZW1pdCBwcmVmaW5pc2ggaWYgdGhlIG9ubHkgdGhpbmcgd2UncmUgd2FpdGluZyBmb3IgaXMgX3dyaXRlIGNic1xuICAvLyBUaGlzIGlzIHJlbGV2YW50IGZvciBzeW5jaHJvbm91cyBUcmFuc2Zvcm0gc3RyZWFtc1xuICB0aGlzLnByZWZpbmlzaGVkID0gZmFsc2U7XG5cbiAgLy8gVHJ1ZSBpZiB0aGUgZXJyb3Igd2FzIGFscmVhZHkgZW1pdHRlZCBhbmQgc2hvdWxkIG5vdCBiZSB0aHJvd24gYWdhaW5cbiAgdGhpcy5lcnJvckVtaXR0ZWQgPSBmYWxzZTtcblxuICAvLyBjb3VudCBidWZmZXJlZCByZXF1ZXN0c1xuICB0aGlzLmJ1ZmZlcmVkUmVxdWVzdENvdW50ID0gMDtcblxuICAvLyBhbGxvY2F0ZSB0aGUgZmlyc3QgQ29ya2VkUmVxdWVzdCwgdGhlcmUgaXMgYWx3YXlzXG4gIC8vIG9uZSBhbGxvY2F0ZWQgYW5kIGZyZWUgdG8gdXNlLCBhbmQgd2UgbWFpbnRhaW4gYXQgbW9zdCB0d29cbiAgdGhpcy5jb3JrZWRSZXF1ZXN0c0ZyZWUgPSBuZXcgQ29ya2VkUmVxdWVzdCh0aGlzKTtcbn1cblxuV3JpdGFibGVTdGF0ZS5wcm90b3R5cGUuZ2V0QnVmZmVyID0gZnVuY3Rpb24gZ2V0QnVmZmVyKCkge1xuICB2YXIgY3VycmVudCA9IHRoaXMuYnVmZmVyZWRSZXF1ZXN0O1xuICB2YXIgb3V0ID0gW107XG4gIHdoaWxlIChjdXJyZW50KSB7XG4gICAgb3V0LnB1c2goY3VycmVudCk7XG4gICAgY3VycmVudCA9IGN1cnJlbnQubmV4dDtcbiAgfVxuICByZXR1cm4gb3V0O1xufTtcblxuKGZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoV3JpdGFibGVTdGF0ZS5wcm90b3R5cGUsICdidWZmZXInLCB7XG4gICAgICBnZXQ6IGludGVybmFsVXRpbC5kZXByZWNhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRCdWZmZXIoKTtcbiAgICAgIH0sICdfd3JpdGFibGVTdGF0ZS5idWZmZXIgaXMgZGVwcmVjYXRlZC4gVXNlIF93cml0YWJsZVN0YXRlLmdldEJ1ZmZlciAnICsgJ2luc3RlYWQuJywgJ0RFUDAwMDMnKVxuICAgIH0pO1xuICB9IGNhdGNoIChfKSB7fVxufSkoKTtcblxuLy8gVGVzdCBfd3JpdGFibGVTdGF0ZSBmb3IgaW5oZXJpdGFuY2UgdG8gYWNjb3VudCBmb3IgRHVwbGV4IHN0cmVhbXMsXG4vLyB3aG9zZSBwcm90b3R5cGUgY2hhaW4gb25seSBwb2ludHMgdG8gUmVhZGFibGUuXG52YXIgcmVhbEhhc0luc3RhbmNlO1xuaWYgKHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgU3ltYm9sLmhhc0luc3RhbmNlICYmIHR5cGVvZiBGdW5jdGlvbi5wcm90b3R5cGVbU3ltYm9sLmhhc0luc3RhbmNlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICByZWFsSGFzSW5zdGFuY2UgPSBGdW5jdGlvbi5wcm90b3R5cGVbU3ltYm9sLmhhc0luc3RhbmNlXTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFdyaXRhYmxlLCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgaWYgKHJlYWxIYXNJbnN0YW5jZS5jYWxsKHRoaXMsIG9iamVjdCkpIHJldHVybiB0cnVlO1xuXG4gICAgICByZXR1cm4gb2JqZWN0ICYmIG9iamVjdC5fd3JpdGFibGVTdGF0ZSBpbnN0YW5jZW9mIFdyaXRhYmxlU3RhdGU7XG4gICAgfVxuICB9KTtcbn0gZWxzZSB7XG4gIHJlYWxIYXNJbnN0YW5jZSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gb2JqZWN0IGluc3RhbmNlb2YgdGhpcztcbiAgfTtcbn1cblxuZnVuY3Rpb24gV3JpdGFibGUob3B0aW9ucykge1xuICBEdXBsZXggPSBEdXBsZXggfHwgcmVxdWlyZSgnLi9fc3RyZWFtX2R1cGxleCcpO1xuXG4gIC8vIFdyaXRhYmxlIGN0b3IgaXMgYXBwbGllZCB0byBEdXBsZXhlcywgdG9vLlxuICAvLyBgcmVhbEhhc0luc3RhbmNlYCBpcyBuZWNlc3NhcnkgYmVjYXVzZSB1c2luZyBwbGFpbiBgaW5zdGFuY2VvZmBcbiAgLy8gd291bGQgcmV0dXJuIGZhbHNlLCBhcyBubyBgX3dyaXRhYmxlU3RhdGVgIHByb3BlcnR5IGlzIGF0dGFjaGVkLlxuXG4gIC8vIFRyeWluZyB0byB1c2UgdGhlIGN1c3RvbSBgaW5zdGFuY2VvZmAgZm9yIFdyaXRhYmxlIGhlcmUgd2lsbCBhbHNvIGJyZWFrIHRoZVxuICAvLyBOb2RlLmpzIExhenlUcmFuc2Zvcm0gaW1wbGVtZW50YXRpb24sIHdoaWNoIGhhcyBhIG5vbi10cml2aWFsIGdldHRlciBmb3JcbiAgLy8gYF93cml0YWJsZVN0YXRlYCB0aGF0IHdvdWxkIGxlYWQgdG8gaW5maW5pdGUgcmVjdXJzaW9uLlxuICBpZiAoIXJlYWxIYXNJbnN0YW5jZS5jYWxsKFdyaXRhYmxlLCB0aGlzKSAmJiAhKHRoaXMgaW5zdGFuY2VvZiBEdXBsZXgpKSB7XG4gICAgcmV0dXJuIG5ldyBXcml0YWJsZShvcHRpb25zKTtcbiAgfVxuXG4gIHRoaXMuX3dyaXRhYmxlU3RhdGUgPSBuZXcgV3JpdGFibGVTdGF0ZShvcHRpb25zLCB0aGlzKTtcblxuICAvLyBsZWdhY3kuXG4gIHRoaXMud3JpdGFibGUgPSB0cnVlO1xuXG4gIGlmIChvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLndyaXRlID09PSAnZnVuY3Rpb24nKSB0aGlzLl93cml0ZSA9IG9wdGlvbnMud3JpdGU7XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMud3JpdGV2ID09PSAnZnVuY3Rpb24nKSB0aGlzLl93cml0ZXYgPSBvcHRpb25zLndyaXRldjtcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5kZXN0cm95ID09PSAnZnVuY3Rpb24nKSB0aGlzLl9kZXN0cm95ID0gb3B0aW9ucy5kZXN0cm95O1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLmZpbmFsID09PSAnZnVuY3Rpb24nKSB0aGlzLl9maW5hbCA9IG9wdGlvbnMuZmluYWw7XG4gIH1cblxuICBTdHJlYW0uY2FsbCh0aGlzKTtcbn1cblxuLy8gT3RoZXJ3aXNlIHBlb3BsZSBjYW4gcGlwZSBXcml0YWJsZSBzdHJlYW1zLCB3aGljaCBpcyBqdXN0IHdyb25nLlxuV3JpdGFibGUucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ0Nhbm5vdCBwaXBlLCBub3QgcmVhZGFibGUnKSk7XG59O1xuXG5mdW5jdGlvbiB3cml0ZUFmdGVyRW5kKHN0cmVhbSwgY2IpIHtcbiAgdmFyIGVyID0gbmV3IEVycm9yKCd3cml0ZSBhZnRlciBlbmQnKTtcbiAgLy8gVE9ETzogZGVmZXIgZXJyb3IgZXZlbnRzIGNvbnNpc3RlbnRseSBldmVyeXdoZXJlLCBub3QganVzdCB0aGUgY2JcbiAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXIpO1xuICBwcm9jZXNzTmV4dFRpY2soY2IsIGVyKTtcbn1cblxuLy8gQ2hlY2tzIHRoYXQgYSB1c2VyLXN1cHBsaWVkIGNodW5rIGlzIHZhbGlkLCBlc3BlY2lhbGx5IGZvciB0aGUgcGFydGljdWxhclxuLy8gbW9kZSB0aGUgc3RyZWFtIGlzIGluLiBDdXJyZW50bHkgdGhpcyBtZWFucyB0aGF0IGBudWxsYCBpcyBuZXZlciBhY2NlcHRlZFxuLy8gYW5kIHVuZGVmaW5lZC9ub24tc3RyaW5nIHZhbHVlcyBhcmUgb25seSBhbGxvd2VkIGluIG9iamVjdCBtb2RlLlxuZnVuY3Rpb24gdmFsaWRDaHVuayhzdHJlYW0sIHN0YXRlLCBjaHVuaywgY2IpIHtcbiAgdmFyIHZhbGlkID0gdHJ1ZTtcbiAgdmFyIGVyID0gZmFsc2U7XG5cbiAgaWYgKGNodW5rID09PSBudWxsKSB7XG4gICAgZXIgPSBuZXcgVHlwZUVycm9yKCdNYXkgbm90IHdyaXRlIG51bGwgdmFsdWVzIHRvIHN0cmVhbScpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBjaHVuayAhPT0gJ3N0cmluZycgJiYgY2h1bmsgIT09IHVuZGVmaW5lZCAmJiAhc3RhdGUub2JqZWN0TW9kZSkge1xuICAgIGVyID0gbmV3IFR5cGVFcnJvcignSW52YWxpZCBub24tc3RyaW5nL2J1ZmZlciBjaHVuaycpO1xuICB9XG4gIGlmIChlcikge1xuICAgIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcbiAgICBwcm9jZXNzTmV4dFRpY2soY2IsIGVyKTtcbiAgICB2YWxpZCA9IGZhbHNlO1xuICB9XG4gIHJldHVybiB2YWxpZDtcbn1cblxuV3JpdGFibGUucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fd3JpdGFibGVTdGF0ZTtcbiAgdmFyIHJldCA9IGZhbHNlO1xuICB2YXIgaXNCdWYgPSBfaXNVaW50OEFycmF5KGNodW5rKSAmJiAhc3RhdGUub2JqZWN0TW9kZTtcblxuICBpZiAoaXNCdWYgJiYgIUJ1ZmZlci5pc0J1ZmZlcihjaHVuaykpIHtcbiAgICBjaHVuayA9IF91aW50OEFycmF5VG9CdWZmZXIoY2h1bmspO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBlbmNvZGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gZW5jb2Rpbmc7XG4gICAgZW5jb2RpbmcgPSBudWxsO1xuICB9XG5cbiAgaWYgKGlzQnVmKSBlbmNvZGluZyA9ICdidWZmZXInO2Vsc2UgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSBzdGF0ZS5kZWZhdWx0RW5jb2Rpbmc7XG5cbiAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgY2IgPSBub3A7XG5cbiAgaWYgKHN0YXRlLmVuZGVkKSB3cml0ZUFmdGVyRW5kKHRoaXMsIGNiKTtlbHNlIGlmIChpc0J1ZiB8fCB2YWxpZENodW5rKHRoaXMsIHN0YXRlLCBjaHVuaywgY2IpKSB7XG4gICAgc3RhdGUucGVuZGluZ2NiKys7XG4gICAgcmV0ID0gd3JpdGVPckJ1ZmZlcih0aGlzLCBzdGF0ZSwgaXNCdWYsIGNodW5rLCBlbmNvZGluZywgY2IpO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbldyaXRhYmxlLnByb3RvdHlwZS5jb3JrID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl93cml0YWJsZVN0YXRlO1xuXG4gIHN0YXRlLmNvcmtlZCsrO1xufTtcblxuV3JpdGFibGUucHJvdG90eXBlLnVuY29yayA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fd3JpdGFibGVTdGF0ZTtcblxuICBpZiAoc3RhdGUuY29ya2VkKSB7XG4gICAgc3RhdGUuY29ya2VkLS07XG5cbiAgICBpZiAoIXN0YXRlLndyaXRpbmcgJiYgIXN0YXRlLmNvcmtlZCAmJiAhc3RhdGUuZmluaXNoZWQgJiYgIXN0YXRlLmJ1ZmZlclByb2Nlc3NpbmcgJiYgc3RhdGUuYnVmZmVyZWRSZXF1ZXN0KSBjbGVhckJ1ZmZlcih0aGlzLCBzdGF0ZSk7XG4gIH1cbn07XG5cbldyaXRhYmxlLnByb3RvdHlwZS5zZXREZWZhdWx0RW5jb2RpbmcgPSBmdW5jdGlvbiBzZXREZWZhdWx0RW5jb2RpbmcoZW5jb2RpbmcpIHtcbiAgLy8gbm9kZTo6UGFyc2VFbmNvZGluZygpIHJlcXVpcmVzIGxvd2VyIGNhc2UuXG4gIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnKSBlbmNvZGluZyA9IGVuY29kaW5nLnRvTG93ZXJDYXNlKCk7XG4gIGlmICghKFsnaGV4JywgJ3V0ZjgnLCAndXRmLTgnLCAnYXNjaWknLCAnYmluYXJ5JywgJ2Jhc2U2NCcsICd1Y3MyJywgJ3Vjcy0yJywgJ3V0ZjE2bGUnLCAndXRmLTE2bGUnLCAncmF3J10uaW5kZXhPZigoZW5jb2RpbmcgKyAnJykudG9Mb3dlckNhc2UoKSkgPiAtMSkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZyk7XG4gIHRoaXMuX3dyaXRhYmxlU3RhdGUuZGVmYXVsdEVuY29kaW5nID0gZW5jb2Rpbmc7XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gZGVjb2RlQ2h1bmsoc3RhdGUsIGNodW5rLCBlbmNvZGluZykge1xuICBpZiAoIXN0YXRlLm9iamVjdE1vZGUgJiYgc3RhdGUuZGVjb2RlU3RyaW5ncyAhPT0gZmFsc2UgJiYgdHlwZW9mIGNodW5rID09PSAnc3RyaW5nJykge1xuICAgIGNodW5rID0gQnVmZmVyLmZyb20oY2h1bmssIGVuY29kaW5nKTtcbiAgfVxuICByZXR1cm4gY2h1bms7XG59XG5cbi8vIGlmIHdlJ3JlIGFscmVhZHkgd3JpdGluZyBzb21ldGhpbmcsIHRoZW4ganVzdCBwdXQgdGhpc1xuLy8gaW4gdGhlIHF1ZXVlLCBhbmQgd2FpdCBvdXIgdHVybi4gIE90aGVyd2lzZSwgY2FsbCBfd3JpdGVcbi8vIElmIHdlIHJldHVybiBmYWxzZSwgdGhlbiB3ZSBuZWVkIGEgZHJhaW4gZXZlbnQsIHNvIHNldCB0aGF0IGZsYWcuXG5mdW5jdGlvbiB3cml0ZU9yQnVmZmVyKHN0cmVhbSwgc3RhdGUsIGlzQnVmLCBjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIGlmICghaXNCdWYpIHtcbiAgICB2YXIgbmV3Q2h1bmsgPSBkZWNvZGVDaHVuayhzdGF0ZSwgY2h1bmssIGVuY29kaW5nKTtcbiAgICBpZiAoY2h1bmsgIT09IG5ld0NodW5rKSB7XG4gICAgICBpc0J1ZiA9IHRydWU7XG4gICAgICBlbmNvZGluZyA9ICdidWZmZXInO1xuICAgICAgY2h1bmsgPSBuZXdDaHVuaztcbiAgICB9XG4gIH1cbiAgdmFyIGxlbiA9IHN0YXRlLm9iamVjdE1vZGUgPyAxIDogY2h1bmsubGVuZ3RoO1xuXG4gIHN0YXRlLmxlbmd0aCArPSBsZW47XG5cbiAgdmFyIHJldCA9IHN0YXRlLmxlbmd0aCA8IHN0YXRlLmhpZ2hXYXRlck1hcms7XG4gIC8vIHdlIG11c3QgZW5zdXJlIHRoYXQgcHJldmlvdXMgbmVlZERyYWluIHdpbGwgbm90IGJlIHJlc2V0IHRvIGZhbHNlLlxuICBpZiAoIXJldCkgc3RhdGUubmVlZERyYWluID0gdHJ1ZTtcblxuICBpZiAoc3RhdGUud3JpdGluZyB8fCBzdGF0ZS5jb3JrZWQpIHtcbiAgICB2YXIgbGFzdCA9IHN0YXRlLmxhc3RCdWZmZXJlZFJlcXVlc3Q7XG4gICAgc3RhdGUubGFzdEJ1ZmZlcmVkUmVxdWVzdCA9IHtcbiAgICAgIGNodW5rOiBjaHVuayxcbiAgICAgIGVuY29kaW5nOiBlbmNvZGluZyxcbiAgICAgIGlzQnVmOiBpc0J1ZixcbiAgICAgIGNhbGxiYWNrOiBjYixcbiAgICAgIG5leHQ6IG51bGxcbiAgICB9O1xuICAgIGlmIChsYXN0KSB7XG4gICAgICBsYXN0Lm5leHQgPSBzdGF0ZS5sYXN0QnVmZmVyZWRSZXF1ZXN0O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5idWZmZXJlZFJlcXVlc3QgPSBzdGF0ZS5sYXN0QnVmZmVyZWRSZXF1ZXN0O1xuICAgIH1cbiAgICBzdGF0ZS5idWZmZXJlZFJlcXVlc3RDb3VudCArPSAxO1xuICB9IGVsc2Uge1xuICAgIGRvV3JpdGUoc3RyZWFtLCBzdGF0ZSwgZmFsc2UsIGxlbiwgY2h1bmssIGVuY29kaW5nLCBjYik7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBkb1dyaXRlKHN0cmVhbSwgc3RhdGUsIHdyaXRldiwgbGVuLCBjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHN0YXRlLndyaXRlbGVuID0gbGVuO1xuICBzdGF0ZS53cml0ZWNiID0gY2I7XG4gIHN0YXRlLndyaXRpbmcgPSB0cnVlO1xuICBzdGF0ZS5zeW5jID0gdHJ1ZTtcbiAgaWYgKHdyaXRldikgc3RyZWFtLl93cml0ZXYoY2h1bmssIHN0YXRlLm9ud3JpdGUpO2Vsc2Ugc3RyZWFtLl93cml0ZShjaHVuaywgZW5jb2RpbmcsIHN0YXRlLm9ud3JpdGUpO1xuICBzdGF0ZS5zeW5jID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG9ud3JpdGVFcnJvcihzdHJlYW0sIHN0YXRlLCBzeW5jLCBlciwgY2IpIHtcbiAgLS1zdGF0ZS5wZW5kaW5nY2I7XG5cbiAgaWYgKHN5bmMpIHtcbiAgICAvLyBkZWZlciB0aGUgY2FsbGJhY2sgaWYgd2UgYXJlIGJlaW5nIGNhbGxlZCBzeW5jaHJvbm91c2x5XG4gICAgLy8gdG8gYXZvaWQgcGlsaW5nIHVwIHRoaW5ncyBvbiB0aGUgc3RhY2tcbiAgICBwcm9jZXNzTmV4dFRpY2soY2IsIGVyKTtcbiAgICAvLyB0aGlzIGNhbiBlbWl0IGZpbmlzaCwgYW5kIGl0IHdpbGwgYWx3YXlzIGhhcHBlblxuICAgIC8vIGFmdGVyIGVycm9yXG4gICAgcHJvY2Vzc05leHRUaWNrKGZpbmlzaE1heWJlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICBzdHJlYW0uX3dyaXRhYmxlU3RhdGUuZXJyb3JFbWl0dGVkID0gdHJ1ZTtcbiAgICBzdHJlYW0uZW1pdCgnZXJyb3InLCBlcik7XG4gIH0gZWxzZSB7XG4gICAgLy8gdGhlIGNhbGxlciBleHBlY3QgdGhpcyB0byBoYXBwZW4gYmVmb3JlIGlmXG4gICAgLy8gaXQgaXMgYXN5bmNcbiAgICBjYihlcik7XG4gICAgc3RyZWFtLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZCA9IHRydWU7XG4gICAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXIpO1xuICAgIC8vIHRoaXMgY2FuIGVtaXQgZmluaXNoLCBidXQgZmluaXNoIG11c3RcbiAgICAvLyBhbHdheXMgZm9sbG93IGVycm9yXG4gICAgZmluaXNoTWF5YmUoc3RyZWFtLCBzdGF0ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gb253cml0ZVN0YXRlVXBkYXRlKHN0YXRlKSB7XG4gIHN0YXRlLndyaXRpbmcgPSBmYWxzZTtcbiAgc3RhdGUud3JpdGVjYiA9IG51bGw7XG4gIHN0YXRlLmxlbmd0aCAtPSBzdGF0ZS53cml0ZWxlbjtcbiAgc3RhdGUud3JpdGVsZW4gPSAwO1xufVxuXG5mdW5jdGlvbiBvbndyaXRlKHN0cmVhbSwgZXIpIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl93cml0YWJsZVN0YXRlO1xuICB2YXIgc3luYyA9IHN0YXRlLnN5bmM7XG4gIHZhciBjYiA9IHN0YXRlLndyaXRlY2I7XG5cbiAgb253cml0ZVN0YXRlVXBkYXRlKHN0YXRlKTtcblxuICBpZiAoZXIpIG9ud3JpdGVFcnJvcihzdHJlYW0sIHN0YXRlLCBzeW5jLCBlciwgY2IpO2Vsc2Uge1xuICAgIC8vIENoZWNrIGlmIHdlJ3JlIGFjdHVhbGx5IHJlYWR5IHRvIGZpbmlzaCwgYnV0IGRvbid0IGVtaXQgeWV0XG4gICAgdmFyIGZpbmlzaGVkID0gbmVlZEZpbmlzaChzdGF0ZSk7XG5cbiAgICBpZiAoIWZpbmlzaGVkICYmICFzdGF0ZS5jb3JrZWQgJiYgIXN0YXRlLmJ1ZmZlclByb2Nlc3NpbmcgJiYgc3RhdGUuYnVmZmVyZWRSZXF1ZXN0KSB7XG4gICAgICBjbGVhckJ1ZmZlcihzdHJlYW0sIHN0YXRlKTtcbiAgICB9XG5cbiAgICBpZiAoc3luYykge1xuICAgICAgLyo8cmVwbGFjZW1lbnQ+Ki9cbiAgICAgIGFzeW5jV3JpdGUoYWZ0ZXJXcml0ZSwgc3RyZWFtLCBzdGF0ZSwgZmluaXNoZWQsIGNiKTtcbiAgICAgIC8qPC9yZXBsYWNlbWVudD4qL1xuICAgIH0gZWxzZSB7XG4gICAgICBhZnRlcldyaXRlKHN0cmVhbSwgc3RhdGUsIGZpbmlzaGVkLCBjYik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFmdGVyV3JpdGUoc3RyZWFtLCBzdGF0ZSwgZmluaXNoZWQsIGNiKSB7XG4gIGlmICghZmluaXNoZWQpIG9ud3JpdGVEcmFpbihzdHJlYW0sIHN0YXRlKTtcbiAgc3RhdGUucGVuZGluZ2NiLS07XG4gIGNiKCk7XG4gIGZpbmlzaE1heWJlKHN0cmVhbSwgc3RhdGUpO1xufVxuXG4vLyBNdXN0IGZvcmNlIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBvbiBuZXh0VGljaywgc28gdGhhdCB3ZSBkb24ndFxuLy8gZW1pdCAnZHJhaW4nIGJlZm9yZSB0aGUgd3JpdGUoKSBjb25zdW1lciBnZXRzIHRoZSAnZmFsc2UnIHJldHVyblxuLy8gdmFsdWUsIGFuZCBoYXMgYSBjaGFuY2UgdG8gYXR0YWNoIGEgJ2RyYWluJyBsaXN0ZW5lci5cbmZ1bmN0aW9uIG9ud3JpdGVEcmFpbihzdHJlYW0sIHN0YXRlKSB7XG4gIGlmIChzdGF0ZS5sZW5ndGggPT09IDAgJiYgc3RhdGUubmVlZERyYWluKSB7XG4gICAgc3RhdGUubmVlZERyYWluID0gZmFsc2U7XG4gICAgc3RyZWFtLmVtaXQoJ2RyYWluJyk7XG4gIH1cbn1cblxuLy8gaWYgdGhlcmUncyBzb21ldGhpbmcgaW4gdGhlIGJ1ZmZlciB3YWl0aW5nLCB0aGVuIHByb2Nlc3MgaXRcbmZ1bmN0aW9uIGNsZWFyQnVmZmVyKHN0cmVhbSwgc3RhdGUpIHtcbiAgc3RhdGUuYnVmZmVyUHJvY2Vzc2luZyA9IHRydWU7XG4gIHZhciBlbnRyeSA9IHN0YXRlLmJ1ZmZlcmVkUmVxdWVzdDtcblxuICBpZiAoc3RyZWFtLl93cml0ZXYgJiYgZW50cnkgJiYgZW50cnkubmV4dCkge1xuICAgIC8vIEZhc3QgY2FzZSwgd3JpdGUgZXZlcnl0aGluZyB1c2luZyBfd3JpdGV2KClcbiAgICB2YXIgbCA9IHN0YXRlLmJ1ZmZlcmVkUmVxdWVzdENvdW50O1xuICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXkobCk7XG4gICAgdmFyIGhvbGRlciA9IHN0YXRlLmNvcmtlZFJlcXVlc3RzRnJlZTtcbiAgICBob2xkZXIuZW50cnkgPSBlbnRyeTtcblxuICAgIHZhciBjb3VudCA9IDA7XG4gICAgdmFyIGFsbEJ1ZmZlcnMgPSB0cnVlO1xuICAgIHdoaWxlIChlbnRyeSkge1xuICAgICAgYnVmZmVyW2NvdW50XSA9IGVudHJ5O1xuICAgICAgaWYgKCFlbnRyeS5pc0J1ZikgYWxsQnVmZmVycyA9IGZhbHNlO1xuICAgICAgZW50cnkgPSBlbnRyeS5uZXh0O1xuICAgICAgY291bnQgKz0gMTtcbiAgICB9XG4gICAgYnVmZmVyLmFsbEJ1ZmZlcnMgPSBhbGxCdWZmZXJzO1xuXG4gICAgZG9Xcml0ZShzdHJlYW0sIHN0YXRlLCB0cnVlLCBzdGF0ZS5sZW5ndGgsIGJ1ZmZlciwgJycsIGhvbGRlci5maW5pc2gpO1xuXG4gICAgLy8gZG9Xcml0ZSBpcyBhbG1vc3QgYWx3YXlzIGFzeW5jLCBkZWZlciB0aGVzZSB0byBzYXZlIGEgYml0IG9mIHRpbWVcbiAgICAvLyBhcyB0aGUgaG90IHBhdGggZW5kcyB3aXRoIGRvV3JpdGVcbiAgICBzdGF0ZS5wZW5kaW5nY2IrKztcbiAgICBzdGF0ZS5sYXN0QnVmZmVyZWRSZXF1ZXN0ID0gbnVsbDtcbiAgICBpZiAoaG9sZGVyLm5leHQpIHtcbiAgICAgIHN0YXRlLmNvcmtlZFJlcXVlc3RzRnJlZSA9IGhvbGRlci5uZXh0O1xuICAgICAgaG9sZGVyLm5leHQgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5jb3JrZWRSZXF1ZXN0c0ZyZWUgPSBuZXcgQ29ya2VkUmVxdWVzdChzdGF0ZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIFNsb3cgY2FzZSwgd3JpdGUgY2h1bmtzIG9uZS1ieS1vbmVcbiAgICB3aGlsZSAoZW50cnkpIHtcbiAgICAgIHZhciBjaHVuayA9IGVudHJ5LmNodW5rO1xuICAgICAgdmFyIGVuY29kaW5nID0gZW50cnkuZW5jb2Rpbmc7XG4gICAgICB2YXIgY2IgPSBlbnRyeS5jYWxsYmFjaztcbiAgICAgIHZhciBsZW4gPSBzdGF0ZS5vYmplY3RNb2RlID8gMSA6IGNodW5rLmxlbmd0aDtcblxuICAgICAgZG9Xcml0ZShzdHJlYW0sIHN0YXRlLCBmYWxzZSwgbGVuLCBjaHVuaywgZW5jb2RpbmcsIGNiKTtcbiAgICAgIGVudHJ5ID0gZW50cnkubmV4dDtcbiAgICAgIC8vIGlmIHdlIGRpZG4ndCBjYWxsIHRoZSBvbndyaXRlIGltbWVkaWF0ZWx5LCB0aGVuXG4gICAgICAvLyBpdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gd2FpdCB1bnRpbCBpdCBkb2VzLlxuICAgICAgLy8gYWxzbywgdGhhdCBtZWFucyB0aGF0IHRoZSBjaHVuayBhbmQgY2IgYXJlIGN1cnJlbnRseVxuICAgICAgLy8gYmVpbmcgcHJvY2Vzc2VkLCBzbyBtb3ZlIHRoZSBidWZmZXIgY291bnRlciBwYXN0IHRoZW0uXG4gICAgICBpZiAoc3RhdGUud3JpdGluZykge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW50cnkgPT09IG51bGwpIHN0YXRlLmxhc3RCdWZmZXJlZFJlcXVlc3QgPSBudWxsO1xuICB9XG5cbiAgc3RhdGUuYnVmZmVyZWRSZXF1ZXN0Q291bnQgPSAwO1xuICBzdGF0ZS5idWZmZXJlZFJlcXVlc3QgPSBlbnRyeTtcbiAgc3RhdGUuYnVmZmVyUHJvY2Vzc2luZyA9IGZhbHNlO1xufVxuXG5Xcml0YWJsZS5wcm90b3R5cGUuX3dyaXRlID0gZnVuY3Rpb24gKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgY2IobmV3IEVycm9yKCdfd3JpdGUoKSBpcyBub3QgaW1wbGVtZW50ZWQnKSk7XG59O1xuXG5Xcml0YWJsZS5wcm90b3R5cGUuX3dyaXRldiA9IG51bGw7XG5cbldyaXRhYmxlLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoY2h1bmssIGVuY29kaW5nLCBjYikge1xuICB2YXIgc3RhdGUgPSB0aGlzLl93cml0YWJsZVN0YXRlO1xuXG4gIGlmICh0eXBlb2YgY2h1bmsgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IGNodW5rO1xuICAgIGNodW5rID0gbnVsbDtcbiAgICBlbmNvZGluZyA9IG51bGw7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBlbmNvZGluZztcbiAgICBlbmNvZGluZyA9IG51bGw7XG4gIH1cblxuICBpZiAoY2h1bmsgIT09IG51bGwgJiYgY2h1bmsgIT09IHVuZGVmaW5lZCkgdGhpcy53cml0ZShjaHVuaywgZW5jb2RpbmcpO1xuXG4gIC8vIC5lbmQoKSBmdWxseSB1bmNvcmtzXG4gIGlmIChzdGF0ZS5jb3JrZWQpIHtcbiAgICBzdGF0ZS5jb3JrZWQgPSAxO1xuICAgIHRoaXMudW5jb3JrKCk7XG4gIH1cblxuICAvLyBpZ25vcmUgdW5uZWNlc3NhcnkgZW5kKCkgY2FsbHMuXG4gIGlmICghc3RhdGUuZW5kaW5nICYmICFzdGF0ZS5maW5pc2hlZCkgZW5kV3JpdGFibGUodGhpcywgc3RhdGUsIGNiKTtcbn07XG5cbmZ1bmN0aW9uIG5lZWRGaW5pc2goc3RhdGUpIHtcbiAgcmV0dXJuIHN0YXRlLmVuZGluZyAmJiBzdGF0ZS5sZW5ndGggPT09IDAgJiYgc3RhdGUuYnVmZmVyZWRSZXF1ZXN0ID09PSBudWxsICYmICFzdGF0ZS5maW5pc2hlZCAmJiAhc3RhdGUud3JpdGluZztcbn1cbmZ1bmN0aW9uIGNhbGxGaW5hbChzdHJlYW0sIHN0YXRlKSB7XG4gIHN0cmVhbS5fZmluYWwoZnVuY3Rpb24gKGVycikge1xuICAgIHN0YXRlLnBlbmRpbmdjYi0tO1xuICAgIGlmIChlcnIpIHtcbiAgICAgIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgfVxuICAgIHN0YXRlLnByZWZpbmlzaGVkID0gdHJ1ZTtcbiAgICBzdHJlYW0uZW1pdCgncHJlZmluaXNoJyk7XG4gICAgZmluaXNoTWF5YmUoc3RyZWFtLCBzdGF0ZSk7XG4gIH0pO1xufVxuZnVuY3Rpb24gcHJlZmluaXNoKHN0cmVhbSwgc3RhdGUpIHtcbiAgaWYgKCFzdGF0ZS5wcmVmaW5pc2hlZCAmJiAhc3RhdGUuZmluYWxDYWxsZWQpIHtcbiAgICBpZiAodHlwZW9mIHN0cmVhbS5fZmluYWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHN0YXRlLnBlbmRpbmdjYisrO1xuICAgICAgc3RhdGUuZmluYWxDYWxsZWQgPSB0cnVlO1xuICAgICAgcHJvY2Vzc05leHRUaWNrKGNhbGxGaW5hbCwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlLnByZWZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIHN0cmVhbS5lbWl0KCdwcmVmaW5pc2gnKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluaXNoTWF5YmUoc3RyZWFtLCBzdGF0ZSkge1xuICB2YXIgbmVlZCA9IG5lZWRGaW5pc2goc3RhdGUpO1xuICBpZiAobmVlZCkge1xuICAgIHByZWZpbmlzaChzdHJlYW0sIHN0YXRlKTtcbiAgICBpZiAoc3RhdGUucGVuZGluZ2NiID09PSAwKSB7XG4gICAgICBzdGF0ZS5maW5pc2hlZCA9IHRydWU7XG4gICAgICBzdHJlYW0uZW1pdCgnZmluaXNoJyk7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZWVkO1xufVxuXG5mdW5jdGlvbiBlbmRXcml0YWJsZShzdHJlYW0sIHN0YXRlLCBjYikge1xuICBzdGF0ZS5lbmRpbmcgPSB0cnVlO1xuICBmaW5pc2hNYXliZShzdHJlYW0sIHN0YXRlKTtcbiAgaWYgKGNiKSB7XG4gICAgaWYgKHN0YXRlLmZpbmlzaGVkKSBwcm9jZXNzTmV4dFRpY2soY2IpO2Vsc2Ugc3RyZWFtLm9uY2UoJ2ZpbmlzaCcsIGNiKTtcbiAgfVxuICBzdGF0ZS5lbmRlZCA9IHRydWU7XG4gIHN0cmVhbS53cml0YWJsZSA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBvbkNvcmtlZEZpbmlzaChjb3JrUmVxLCBzdGF0ZSwgZXJyKSB7XG4gIHZhciBlbnRyeSA9IGNvcmtSZXEuZW50cnk7XG4gIGNvcmtSZXEuZW50cnkgPSBudWxsO1xuICB3aGlsZSAoZW50cnkpIHtcbiAgICB2YXIgY2IgPSBlbnRyeS5jYWxsYmFjaztcbiAgICBzdGF0ZS5wZW5kaW5nY2ItLTtcbiAgICBjYihlcnIpO1xuICAgIGVudHJ5ID0gZW50cnkubmV4dDtcbiAgfVxuICBpZiAoc3RhdGUuY29ya2VkUmVxdWVzdHNGcmVlKSB7XG4gICAgc3RhdGUuY29ya2VkUmVxdWVzdHNGcmVlLm5leHQgPSBjb3JrUmVxO1xuICB9IGVsc2Uge1xuICAgIHN0YXRlLmNvcmtlZFJlcXVlc3RzRnJlZSA9IGNvcmtSZXE7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFdyaXRhYmxlLnByb3RvdHlwZSwgJ2Rlc3Ryb3llZCcsIHtcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX3dyaXRhYmxlU3RhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fd3JpdGFibGVTdGF0ZS5kZXN0cm95ZWQ7XG4gIH0sXG4gIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8gd2UgaWdub3JlIHRoZSB2YWx1ZSBpZiB0aGUgc3RyZWFtXG4gICAgLy8gaGFzIG5vdCBiZWVuIGluaXRpYWxpemVkIHlldFxuICAgIGlmICghdGhpcy5fd3JpdGFibGVTdGF0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGJhY2t3YXJkIGNvbXBhdGliaWxpdHksIHRoZSB1c2VyIGlzIGV4cGxpY2l0bHlcbiAgICAvLyBtYW5hZ2luZyBkZXN0cm95ZWRcbiAgICB0aGlzLl93cml0YWJsZVN0YXRlLmRlc3Ryb3llZCA9IHZhbHVlO1xuICB9XG59KTtcblxuV3JpdGFibGUucHJvdG90eXBlLmRlc3Ryb3kgPSBkZXN0cm95SW1wbC5kZXN0cm95O1xuV3JpdGFibGUucHJvdG90eXBlLl91bmRlc3Ryb3kgPSBkZXN0cm95SW1wbC51bmRlc3Ryb3k7XG5Xcml0YWJsZS5wcm90b3R5cGUuX2Rlc3Ryb3kgPSBmdW5jdGlvbiAoZXJyLCBjYikge1xuICB0aGlzLmVuZCgpO1xuICBjYihlcnIpO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbi8qPHJlcGxhY2VtZW50PiovXG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBCdWZmZXIgPSByZXF1aXJlKCdzYWZlLWJ1ZmZlcicpLkJ1ZmZlcjtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG5mdW5jdGlvbiBjb3B5QnVmZmVyKHNyYywgdGFyZ2V0LCBvZmZzZXQpIHtcbiAgc3JjLmNvcHkodGFyZ2V0LCBvZmZzZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gQnVmZmVyTGlzdCgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQnVmZmVyTGlzdCk7XG5cbiAgICB0aGlzLmhlYWQgPSBudWxsO1xuICAgIHRoaXMudGFpbCA9IG51bGw7XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuICB9XG5cbiAgQnVmZmVyTGlzdC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIHB1c2godikge1xuICAgIHZhciBlbnRyeSA9IHsgZGF0YTogdiwgbmV4dDogbnVsbCB9O1xuICAgIGlmICh0aGlzLmxlbmd0aCA+IDApIHRoaXMudGFpbC5uZXh0ID0gZW50cnk7ZWxzZSB0aGlzLmhlYWQgPSBlbnRyeTtcbiAgICB0aGlzLnRhaWwgPSBlbnRyeTtcbiAgICArK3RoaXMubGVuZ3RoO1xuICB9O1xuXG4gIEJ1ZmZlckxpc3QucHJvdG90eXBlLnVuc2hpZnQgPSBmdW5jdGlvbiB1bnNoaWZ0KHYpIHtcbiAgICB2YXIgZW50cnkgPSB7IGRhdGE6IHYsIG5leHQ6IHRoaXMuaGVhZCB9O1xuICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgdGhpcy50YWlsID0gZW50cnk7XG4gICAgdGhpcy5oZWFkID0gZW50cnk7XG4gICAgKyt0aGlzLmxlbmd0aDtcbiAgfTtcblxuICBCdWZmZXJMaXN0LnByb3RvdHlwZS5zaGlmdCA9IGZ1bmN0aW9uIHNoaWZ0KCkge1xuICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgIHZhciByZXQgPSB0aGlzLmhlYWQuZGF0YTtcbiAgICBpZiAodGhpcy5sZW5ndGggPT09IDEpIHRoaXMuaGVhZCA9IHRoaXMudGFpbCA9IG51bGw7ZWxzZSB0aGlzLmhlYWQgPSB0aGlzLmhlYWQubmV4dDtcbiAgICAtLXRoaXMubGVuZ3RoO1xuICAgIHJldHVybiByZXQ7XG4gIH07XG5cbiAgQnVmZmVyTGlzdC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICB0aGlzLmhlYWQgPSB0aGlzLnRhaWwgPSBudWxsO1xuICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgfTtcblxuICBCdWZmZXJMaXN0LnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24gam9pbihzKSB7XG4gICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gJyc7XG4gICAgdmFyIHAgPSB0aGlzLmhlYWQ7XG4gICAgdmFyIHJldCA9ICcnICsgcC5kYXRhO1xuICAgIHdoaWxlIChwID0gcC5uZXh0KSB7XG4gICAgICByZXQgKz0gcyArIHAuZGF0YTtcbiAgICB9cmV0dXJuIHJldDtcbiAgfTtcblxuICBCdWZmZXJMaXN0LnByb3RvdHlwZS5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQobikge1xuICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIEJ1ZmZlci5hbGxvYygwKTtcbiAgICBpZiAodGhpcy5sZW5ndGggPT09IDEpIHJldHVybiB0aGlzLmhlYWQuZGF0YTtcbiAgICB2YXIgcmV0ID0gQnVmZmVyLmFsbG9jVW5zYWZlKG4gPj4+IDApO1xuICAgIHZhciBwID0gdGhpcy5oZWFkO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAocCkge1xuICAgICAgY29weUJ1ZmZlcihwLmRhdGEsIHJldCwgaSk7XG4gICAgICBpICs9IHAuZGF0YS5sZW5ndGg7XG4gICAgICBwID0gcC5uZXh0O1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9O1xuXG4gIHJldHVybiBCdWZmZXJMaXN0O1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cblxudmFyIHByb2Nlc3NOZXh0VGljayA9IHJlcXVpcmUoJ3Byb2Nlc3MtbmV4dGljay1hcmdzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuLy8gdW5kb2N1bWVudGVkIGNiKCkgQVBJLCBuZWVkZWQgZm9yIGNvcmUsIG5vdCBmb3IgcHVibGljIEFQSVxuZnVuY3Rpb24gZGVzdHJveShlcnIsIGNiKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdmFyIHJlYWRhYmxlRGVzdHJveWVkID0gdGhpcy5fcmVhZGFibGVTdGF0ZSAmJiB0aGlzLl9yZWFkYWJsZVN0YXRlLmRlc3Ryb3llZDtcbiAgdmFyIHdyaXRhYmxlRGVzdHJveWVkID0gdGhpcy5fd3JpdGFibGVTdGF0ZSAmJiB0aGlzLl93cml0YWJsZVN0YXRlLmRlc3Ryb3llZDtcblxuICBpZiAocmVhZGFibGVEZXN0cm95ZWQgfHwgd3JpdGFibGVEZXN0cm95ZWQpIHtcbiAgICBpZiAoY2IpIHtcbiAgICAgIGNiKGVycik7XG4gICAgfSBlbHNlIGlmIChlcnIgJiYgKCF0aGlzLl93cml0YWJsZVN0YXRlIHx8ICF0aGlzLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZCkpIHtcbiAgICAgIHByb2Nlc3NOZXh0VGljayhlbWl0RXJyb3JOVCwgdGhpcywgZXJyKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gd2Ugc2V0IGRlc3Ryb3llZCB0byB0cnVlIGJlZm9yZSBmaXJpbmcgZXJyb3IgY2FsbGJhY2tzIGluIG9yZGVyXG4gIC8vIHRvIG1ha2UgaXQgcmUtZW50cmFuY2Ugc2FmZSBpbiBjYXNlIGRlc3Ryb3koKSBpcyBjYWxsZWQgd2l0aGluIGNhbGxiYWNrc1xuXG4gIGlmICh0aGlzLl9yZWFkYWJsZVN0YXRlKSB7XG4gICAgdGhpcy5fcmVhZGFibGVTdGF0ZS5kZXN0cm95ZWQgPSB0cnVlO1xuICB9XG5cbiAgLy8gaWYgdGhpcyBpcyBhIGR1cGxleCBzdHJlYW0gbWFyayB0aGUgd3JpdGFibGUgcGFydCBhcyBkZXN0cm95ZWQgYXMgd2VsbFxuICBpZiAodGhpcy5fd3JpdGFibGVTdGF0ZSkge1xuICAgIHRoaXMuX3dyaXRhYmxlU3RhdGUuZGVzdHJveWVkID0gdHJ1ZTtcbiAgfVxuXG4gIHRoaXMuX2Rlc3Ryb3koZXJyIHx8IG51bGwsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICBpZiAoIWNiICYmIGVycikge1xuICAgICAgcHJvY2Vzc05leHRUaWNrKGVtaXRFcnJvck5ULCBfdGhpcywgZXJyKTtcbiAgICAgIGlmIChfdGhpcy5fd3JpdGFibGVTdGF0ZSkge1xuICAgICAgICBfdGhpcy5fd3JpdGFibGVTdGF0ZS5lcnJvckVtaXR0ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2IpIHtcbiAgICAgIGNiKGVycik7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gdW5kZXN0cm95KCkge1xuICBpZiAodGhpcy5fcmVhZGFibGVTdGF0ZSkge1xuICAgIHRoaXMuX3JlYWRhYmxlU3RhdGUuZGVzdHJveWVkID0gZmFsc2U7XG4gICAgdGhpcy5fcmVhZGFibGVTdGF0ZS5yZWFkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5fcmVhZGFibGVTdGF0ZS5lbmRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3JlYWRhYmxlU3RhdGUuZW5kRW1pdHRlZCA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKHRoaXMuX3dyaXRhYmxlU3RhdGUpIHtcbiAgICB0aGlzLl93cml0YWJsZVN0YXRlLmRlc3Ryb3llZCA9IGZhbHNlO1xuICAgIHRoaXMuX3dyaXRhYmxlU3RhdGUuZW5kZWQgPSBmYWxzZTtcbiAgICB0aGlzLl93cml0YWJsZVN0YXRlLmVuZGluZyA9IGZhbHNlO1xuICAgIHRoaXMuX3dyaXRhYmxlU3RhdGUuZmluaXNoZWQgPSBmYWxzZTtcbiAgICB0aGlzLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZCA9IGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVtaXRFcnJvck5UKHNlbGYsIGVycikge1xuICBzZWxmLmVtaXQoJ2Vycm9yJywgZXJyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRlc3Ryb3k6IGRlc3Ryb3ksXG4gIHVuZGVzdHJveTogdW5kZXN0cm95XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3JlYWRhYmxlJykuUGFzc1Rocm91Z2hcbiIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL19zdHJlYW1fcmVhZGFibGUuanMnKTtcbmV4cG9ydHMuU3RyZWFtID0gZXhwb3J0cztcbmV4cG9ydHMuUmVhZGFibGUgPSBleHBvcnRzO1xuZXhwb3J0cy5Xcml0YWJsZSA9IHJlcXVpcmUoJy4vbGliL19zdHJlYW1fd3JpdGFibGUuanMnKTtcbmV4cG9ydHMuRHVwbGV4ID0gcmVxdWlyZSgnLi9saWIvX3N0cmVhbV9kdXBsZXguanMnKTtcbmV4cG9ydHMuVHJhbnNmb3JtID0gcmVxdWlyZSgnLi9saWIvX3N0cmVhbV90cmFuc2Zvcm0uanMnKTtcbmV4cG9ydHMuUGFzc1Rocm91Z2ggPSByZXF1aXJlKCcuL2xpYi9fc3RyZWFtX3Bhc3N0aHJvdWdoLmpzJyk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vcmVhZGFibGUnKS5UcmFuc2Zvcm1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvX3N0cmVhbV93cml0YWJsZS5qcycpO1xuIiwiLyogZXNsaW50LWRpc2FibGUgbm9kZS9uby1kZXByZWNhdGVkLWFwaSAqL1xudmFyIGJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpXG52YXIgQnVmZmVyID0gYnVmZmVyLkJ1ZmZlclxuXG4vLyBhbHRlcm5hdGl2ZSB0byB1c2luZyBPYmplY3Qua2V5cyBmb3Igb2xkIGJyb3dzZXJzXG5mdW5jdGlvbiBjb3B5UHJvcHMgKHNyYywgZHN0KSB7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIHtcbiAgICBkc3Rba2V5XSA9IHNyY1trZXldXG4gIH1cbn1cbmlmIChCdWZmZXIuZnJvbSAmJiBCdWZmZXIuYWxsb2MgJiYgQnVmZmVyLmFsbG9jVW5zYWZlICYmIEJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBidWZmZXJcbn0gZWxzZSB7XG4gIC8vIENvcHkgcHJvcGVydGllcyBmcm9tIHJlcXVpcmUoJ2J1ZmZlcicpXG4gIGNvcHlQcm9wcyhidWZmZXIsIGV4cG9ydHMpXG4gIGV4cG9ydHMuQnVmZmVyID0gU2FmZUJ1ZmZlclxufVxuXG5mdW5jdGlvbiBTYWZlQnVmZmVyIChhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gQnVmZmVyKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBDb3B5IHN0YXRpYyBtZXRob2RzIGZyb20gQnVmZmVyXG5jb3B5UHJvcHMoQnVmZmVyLCBTYWZlQnVmZmVyKVxuXG5TYWZlQnVmZmVyLmZyb20gPSBmdW5jdGlvbiAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiBhcmcgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBub3QgYmUgYSBudW1iZXInKVxuICB9XG4gIHJldHVybiBCdWZmZXIoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cblNhZmVCdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBzaXplICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBudW1iZXInKVxuICB9XG4gIHZhciBidWYgPSBCdWZmZXIoc2l6ZSlcbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnKSB7XG4gICAgICBidWYuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmLmZpbGwoZmlsbClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYnVmLmZpbGwoMClcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cblNhZmVCdWZmZXIuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIG51bWJlcicpXG4gIH1cbiAgcmV0dXJuIEJ1ZmZlcihzaXplKVxufVxuXG5TYWZlQnVmZmVyLmFsbG9jVW5zYWZlU2xvdyA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgbnVtYmVyJylcbiAgfVxuICByZXR1cm4gYnVmZmVyLlNsb3dCdWZmZXIoc2l6ZSlcbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0cmVhbTtcblxudmFyIEVFID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuaW5oZXJpdHMoU3RyZWFtLCBFRSk7XG5TdHJlYW0uUmVhZGFibGUgPSByZXF1aXJlKCdyZWFkYWJsZS1zdHJlYW0vcmVhZGFibGUuanMnKTtcblN0cmVhbS5Xcml0YWJsZSA9IHJlcXVpcmUoJ3JlYWRhYmxlLXN0cmVhbS93cml0YWJsZS5qcycpO1xuU3RyZWFtLkR1cGxleCA9IHJlcXVpcmUoJ3JlYWRhYmxlLXN0cmVhbS9kdXBsZXguanMnKTtcblN0cmVhbS5UcmFuc2Zvcm0gPSByZXF1aXJlKCdyZWFkYWJsZS1zdHJlYW0vdHJhbnNmb3JtLmpzJyk7XG5TdHJlYW0uUGFzc1Rocm91Z2ggPSByZXF1aXJlKCdyZWFkYWJsZS1zdHJlYW0vcGFzc3Rocm91Z2guanMnKTtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC40LnhcblN0cmVhbS5TdHJlYW0gPSBTdHJlYW07XG5cblxuXG4vLyBvbGQtc3R5bGUgc3RyZWFtcy4gIE5vdGUgdGhhdCB0aGUgcGlwZSBtZXRob2QgKHRoZSBvbmx5IHJlbGV2YW50XG4vLyBwYXJ0IG9mIHRoaXMgY2xhc3MpIGlzIG92ZXJyaWRkZW4gaW4gdGhlIFJlYWRhYmxlIGNsYXNzLlxuXG5mdW5jdGlvbiBTdHJlYW0oKSB7XG4gIEVFLmNhbGwodGhpcyk7XG59XG5cblN0cmVhbS5wcm90b3R5cGUucGlwZSA9IGZ1bmN0aW9uKGRlc3QsIG9wdGlvbnMpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXM7XG5cbiAgZnVuY3Rpb24gb25kYXRhKGNodW5rKSB7XG4gICAgaWYgKGRlc3Qud3JpdGFibGUpIHtcbiAgICAgIGlmIChmYWxzZSA9PT0gZGVzdC53cml0ZShjaHVuaykgJiYgc291cmNlLnBhdXNlKSB7XG4gICAgICAgIHNvdXJjZS5wYXVzZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNvdXJjZS5vbignZGF0YScsIG9uZGF0YSk7XG5cbiAgZnVuY3Rpb24gb25kcmFpbigpIHtcbiAgICBpZiAoc291cmNlLnJlYWRhYmxlICYmIHNvdXJjZS5yZXN1bWUpIHtcbiAgICAgIHNvdXJjZS5yZXN1bWUoKTtcbiAgICB9XG4gIH1cblxuICBkZXN0Lm9uKCdkcmFpbicsIG9uZHJhaW4pO1xuXG4gIC8vIElmIHRoZSAnZW5kJyBvcHRpb24gaXMgbm90IHN1cHBsaWVkLCBkZXN0LmVuZCgpIHdpbGwgYmUgY2FsbGVkIHdoZW5cbiAgLy8gc291cmNlIGdldHMgdGhlICdlbmQnIG9yICdjbG9zZScgZXZlbnRzLiAgT25seSBkZXN0LmVuZCgpIG9uY2UuXG4gIGlmICghZGVzdC5faXNTdGRpbyAmJiAoIW9wdGlvbnMgfHwgb3B0aW9ucy5lbmQgIT09IGZhbHNlKSkge1xuICAgIHNvdXJjZS5vbignZW5kJywgb25lbmQpO1xuICAgIHNvdXJjZS5vbignY2xvc2UnLCBvbmNsb3NlKTtcbiAgfVxuXG4gIHZhciBkaWRPbkVuZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBvbmVuZCgpIHtcbiAgICBpZiAoZGlkT25FbmQpIHJldHVybjtcbiAgICBkaWRPbkVuZCA9IHRydWU7XG5cbiAgICBkZXN0LmVuZCgpO1xuICB9XG5cblxuICBmdW5jdGlvbiBvbmNsb3NlKCkge1xuICAgIGlmIChkaWRPbkVuZCkgcmV0dXJuO1xuICAgIGRpZE9uRW5kID0gdHJ1ZTtcblxuICAgIGlmICh0eXBlb2YgZGVzdC5kZXN0cm95ID09PSAnZnVuY3Rpb24nKSBkZXN0LmRlc3Ryb3koKTtcbiAgfVxuXG4gIC8vIGRvbid0IGxlYXZlIGRhbmdsaW5nIHBpcGVzIHdoZW4gdGhlcmUgYXJlIGVycm9ycy5cbiAgZnVuY3Rpb24gb25lcnJvcihlcikge1xuICAgIGNsZWFudXAoKTtcbiAgICBpZiAoRUUubGlzdGVuZXJDb3VudCh0aGlzLCAnZXJyb3InKSA9PT0gMCkge1xuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCBzdHJlYW0gZXJyb3IgaW4gcGlwZS5cbiAgICB9XG4gIH1cblxuICBzb3VyY2Uub24oJ2Vycm9yJywgb25lcnJvcik7XG4gIGRlc3Qub24oJ2Vycm9yJywgb25lcnJvcik7XG5cbiAgLy8gcmVtb3ZlIGFsbCB0aGUgZXZlbnQgbGlzdGVuZXJzIHRoYXQgd2VyZSBhZGRlZC5cbiAgZnVuY3Rpb24gY2xlYW51cCgpIHtcbiAgICBzb3VyY2UucmVtb3ZlTGlzdGVuZXIoJ2RhdGEnLCBvbmRhdGEpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2RyYWluJywgb25kcmFpbik7XG5cbiAgICBzb3VyY2UucmVtb3ZlTGlzdGVuZXIoJ2VuZCcsIG9uZW5kKTtcbiAgICBzb3VyY2UucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgb25jbG9zZSk7XG5cbiAgICBzb3VyY2UucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbmVycm9yKTtcblxuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignZW5kJywgY2xlYW51cCk7XG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIGNsZWFudXApO1xuXG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGVhbnVwKTtcbiAgfVxuXG4gIHNvdXJjZS5vbignZW5kJywgY2xlYW51cCk7XG4gIHNvdXJjZS5vbignY2xvc2UnLCBjbGVhbnVwKTtcblxuICBkZXN0Lm9uKCdjbG9zZScsIGNsZWFudXApO1xuXG4gIGRlc3QuZW1pdCgncGlwZScsIHNvdXJjZSk7XG5cbiAgLy8gQWxsb3cgZm9yIHVuaXgtbGlrZSB1c2FnZTogQS5waXBlKEIpLnBpcGUoQylcbiAgcmV0dXJuIGRlc3Q7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQnVmZmVyID0gcmVxdWlyZSgnc2FmZS1idWZmZXInKS5CdWZmZXI7XG5cbnZhciBpc0VuY29kaW5nID0gQnVmZmVyLmlzRW5jb2RpbmcgfHwgZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIGVuY29kaW5nID0gJycgKyBlbmNvZGluZztcbiAgc3dpdGNoIChlbmNvZGluZyAmJiBlbmNvZGluZy50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpjYXNlICd1dGY4JzpjYXNlICd1dGYtOCc6Y2FzZSAnYXNjaWknOmNhc2UgJ2JpbmFyeSc6Y2FzZSAnYmFzZTY0JzpjYXNlICd1Y3MyJzpjYXNlICd1Y3MtMic6Y2FzZSAndXRmMTZsZSc6Y2FzZSAndXRmLTE2bGUnOmNhc2UgJ3Jhdyc6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5mdW5jdGlvbiBfbm9ybWFsaXplRW5jb2RpbmcoZW5jKSB7XG4gIGlmICghZW5jKSByZXR1cm4gJ3V0ZjgnO1xuICB2YXIgcmV0cmllZDtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuYykge1xuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiAndXRmOCc7XG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gJ3V0ZjE2bGUnO1xuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiAnbGF0aW4xJztcbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gZW5jO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKHJldHJpZWQpIHJldHVybjsgLy8gdW5kZWZpbmVkXG4gICAgICAgIGVuYyA9ICgnJyArIGVuYykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0cmllZCA9IHRydWU7XG4gICAgfVxuICB9XG59O1xuXG4vLyBEbyBub3QgY2FjaGUgYEJ1ZmZlci5pc0VuY29kaW5nYCB3aGVuIGNoZWNraW5nIGVuY29kaW5nIG5hbWVzIGFzIHNvbWVcbi8vIG1vZHVsZXMgbW9ua2V5LXBhdGNoIGl0IHRvIHN1cHBvcnQgYWRkaXRpb25hbCBlbmNvZGluZ3NcbmZ1bmN0aW9uIG5vcm1hbGl6ZUVuY29kaW5nKGVuYykge1xuICB2YXIgbmVuYyA9IF9ub3JtYWxpemVFbmNvZGluZyhlbmMpO1xuICBpZiAodHlwZW9mIG5lbmMgIT09ICdzdHJpbmcnICYmIChCdWZmZXIuaXNFbmNvZGluZyA9PT0gaXNFbmNvZGluZyB8fCAhaXNFbmNvZGluZyhlbmMpKSkgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jKTtcbiAgcmV0dXJuIG5lbmMgfHwgZW5jO1xufVxuXG4vLyBTdHJpbmdEZWNvZGVyIHByb3ZpZGVzIGFuIGludGVyZmFjZSBmb3IgZWZmaWNpZW50bHkgc3BsaXR0aW5nIGEgc2VyaWVzIG9mXG4vLyBidWZmZXJzIGludG8gYSBzZXJpZXMgb2YgSlMgc3RyaW5ncyB3aXRob3V0IGJyZWFraW5nIGFwYXJ0IG11bHRpLWJ5dGVcbi8vIGNoYXJhY3RlcnMuXG5leHBvcnRzLlN0cmluZ0RlY29kZXIgPSBTdHJpbmdEZWNvZGVyO1xuZnVuY3Rpb24gU3RyaW5nRGVjb2RlcihlbmNvZGluZykge1xuICB0aGlzLmVuY29kaW5nID0gbm9ybWFsaXplRW5jb2RpbmcoZW5jb2RpbmcpO1xuICB2YXIgbmI7XG4gIHN3aXRjaCAodGhpcy5lbmNvZGluZykge1xuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgdGhpcy50ZXh0ID0gdXRmMTZUZXh0O1xuICAgICAgdGhpcy5lbmQgPSB1dGYxNkVuZDtcbiAgICAgIG5iID0gNDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgdGhpcy5maWxsTGFzdCA9IHV0ZjhGaWxsTGFzdDtcbiAgICAgIG5iID0gNDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICB0aGlzLnRleHQgPSBiYXNlNjRUZXh0O1xuICAgICAgdGhpcy5lbmQgPSBiYXNlNjRFbmQ7XG4gICAgICBuYiA9IDM7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhpcy53cml0ZSA9IHNpbXBsZVdyaXRlO1xuICAgICAgdGhpcy5lbmQgPSBzaW1wbGVFbmQ7XG4gICAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5sYXN0TmVlZCA9IDA7XG4gIHRoaXMubGFzdFRvdGFsID0gMDtcbiAgdGhpcy5sYXN0Q2hhciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShuYik7XG59XG5cblN0cmluZ0RlY29kZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKGJ1Zikge1xuICBpZiAoYnVmLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnO1xuICB2YXIgcjtcbiAgdmFyIGk7XG4gIGlmICh0aGlzLmxhc3ROZWVkKSB7XG4gICAgciA9IHRoaXMuZmlsbExhc3QoYnVmKTtcbiAgICBpZiAociA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJyc7XG4gICAgaSA9IHRoaXMubGFzdE5lZWQ7XG4gICAgdGhpcy5sYXN0TmVlZCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgaSA9IDA7XG4gIH1cbiAgaWYgKGkgPCBidWYubGVuZ3RoKSByZXR1cm4gciA/IHIgKyB0aGlzLnRleHQoYnVmLCBpKSA6IHRoaXMudGV4dChidWYsIGkpO1xuICByZXR1cm4gciB8fCAnJztcbn07XG5cblN0cmluZ0RlY29kZXIucHJvdG90eXBlLmVuZCA9IHV0ZjhFbmQ7XG5cbi8vIFJldHVybnMgb25seSBjb21wbGV0ZSBjaGFyYWN0ZXJzIGluIGEgQnVmZmVyXG5TdHJpbmdEZWNvZGVyLnByb3RvdHlwZS50ZXh0ID0gdXRmOFRleHQ7XG5cbi8vIEF0dGVtcHRzIHRvIGNvbXBsZXRlIGEgcGFydGlhbCBub24tVVRGLTggY2hhcmFjdGVyIHVzaW5nIGJ5dGVzIGZyb20gYSBCdWZmZXJcblN0cmluZ0RlY29kZXIucHJvdG90eXBlLmZpbGxMYXN0ID0gZnVuY3Rpb24gKGJ1Zikge1xuICBpZiAodGhpcy5sYXN0TmVlZCA8PSBidWYubGVuZ3RoKSB7XG4gICAgYnVmLmNvcHkodGhpcy5sYXN0Q2hhciwgdGhpcy5sYXN0VG90YWwgLSB0aGlzLmxhc3ROZWVkLCAwLCB0aGlzLmxhc3ROZWVkKTtcbiAgICByZXR1cm4gdGhpcy5sYXN0Q2hhci50b1N0cmluZyh0aGlzLmVuY29kaW5nLCAwLCB0aGlzLmxhc3RUb3RhbCk7XG4gIH1cbiAgYnVmLmNvcHkodGhpcy5sYXN0Q2hhciwgdGhpcy5sYXN0VG90YWwgLSB0aGlzLmxhc3ROZWVkLCAwLCBidWYubGVuZ3RoKTtcbiAgdGhpcy5sYXN0TmVlZCAtPSBidWYubGVuZ3RoO1xufTtcblxuLy8gQ2hlY2tzIHRoZSB0eXBlIG9mIGEgVVRGLTggYnl0ZSwgd2hldGhlciBpdCdzIEFTQ0lJLCBhIGxlYWRpbmcgYnl0ZSwgb3IgYVxuLy8gY29udGludWF0aW9uIGJ5dGUuXG5mdW5jdGlvbiB1dGY4Q2hlY2tCeXRlKGJ5dGUpIHtcbiAgaWYgKGJ5dGUgPD0gMHg3RikgcmV0dXJuIDA7ZWxzZSBpZiAoYnl0ZSA+PiA1ID09PSAweDA2KSByZXR1cm4gMjtlbHNlIGlmIChieXRlID4+IDQgPT09IDB4MEUpIHJldHVybiAzO2Vsc2UgaWYgKGJ5dGUgPj4gMyA9PT0gMHgxRSkgcmV0dXJuIDQ7XG4gIHJldHVybiAtMTtcbn1cblxuLy8gQ2hlY2tzIGF0IG1vc3QgMyBieXRlcyBhdCB0aGUgZW5kIG9mIGEgQnVmZmVyIGluIG9yZGVyIHRvIGRldGVjdCBhblxuLy8gaW5jb21wbGV0ZSBtdWx0aS1ieXRlIFVURi04IGNoYXJhY3Rlci4gVGhlIHRvdGFsIG51bWJlciBvZiBieXRlcyAoMiwgMywgb3IgNClcbi8vIG5lZWRlZCB0byBjb21wbGV0ZSB0aGUgVVRGLTggY2hhcmFjdGVyIChpZiBhcHBsaWNhYmxlKSBhcmUgcmV0dXJuZWQuXG5mdW5jdGlvbiB1dGY4Q2hlY2tJbmNvbXBsZXRlKHNlbGYsIGJ1ZiwgaSkge1xuICB2YXIgaiA9IGJ1Zi5sZW5ndGggLSAxO1xuICBpZiAoaiA8IGkpIHJldHVybiAwO1xuICB2YXIgbmIgPSB1dGY4Q2hlY2tCeXRlKGJ1ZltqXSk7XG4gIGlmIChuYiA+PSAwKSB7XG4gICAgaWYgKG5iID4gMCkgc2VsZi5sYXN0TmVlZCA9IG5iIC0gMTtcbiAgICByZXR1cm4gbmI7XG4gIH1cbiAgaWYgKC0taiA8IGkpIHJldHVybiAwO1xuICBuYiA9IHV0ZjhDaGVja0J5dGUoYnVmW2pdKTtcbiAgaWYgKG5iID49IDApIHtcbiAgICBpZiAobmIgPiAwKSBzZWxmLmxhc3ROZWVkID0gbmIgLSAyO1xuICAgIHJldHVybiBuYjtcbiAgfVxuICBpZiAoLS1qIDwgaSkgcmV0dXJuIDA7XG4gIG5iID0gdXRmOENoZWNrQnl0ZShidWZbal0pO1xuICBpZiAobmIgPj0gMCkge1xuICAgIGlmIChuYiA+IDApIHtcbiAgICAgIGlmIChuYiA9PT0gMikgbmIgPSAwO2Vsc2Ugc2VsZi5sYXN0TmVlZCA9IG5iIC0gMztcbiAgICB9XG4gICAgcmV0dXJuIG5iO1xuICB9XG4gIHJldHVybiAwO1xufVxuXG4vLyBWYWxpZGF0ZXMgYXMgbWFueSBjb250aW51YXRpb24gYnl0ZXMgZm9yIGEgbXVsdGktYnl0ZSBVVEYtOCBjaGFyYWN0ZXIgYXNcbi8vIG5lZWRlZCBvciBhcmUgYXZhaWxhYmxlLiBJZiB3ZSBzZWUgYSBub24tY29udGludWF0aW9uIGJ5dGUgd2hlcmUgd2UgZXhwZWN0XG4vLyBvbmUsIHdlIFwicmVwbGFjZVwiIHRoZSB2YWxpZGF0ZWQgY29udGludWF0aW9uIGJ5dGVzIHdlJ3ZlIHNlZW4gc28gZmFyIHdpdGhcbi8vIFVURi04IHJlcGxhY2VtZW50IGNoYXJhY3RlcnMgKCdcXHVmZmZkJyksIHRvIG1hdGNoIHY4J3MgVVRGLTggZGVjb2Rpbmdcbi8vIGJlaGF2aW9yLiBUaGUgY29udGludWF0aW9uIGJ5dGUgY2hlY2sgaXMgaW5jbHVkZWQgdGhyZWUgdGltZXMgaW4gdGhlIGNhc2Vcbi8vIHdoZXJlIGFsbCBvZiB0aGUgY29udGludWF0aW9uIGJ5dGVzIGZvciBhIGNoYXJhY3RlciBleGlzdCBpbiB0aGUgc2FtZSBidWZmZXIuXG4vLyBJdCBpcyBhbHNvIGRvbmUgdGhpcyB3YXkgYXMgYSBzbGlnaHQgcGVyZm9ybWFuY2UgaW5jcmVhc2UgaW5zdGVhZCBvZiB1c2luZyBhXG4vLyBsb29wLlxuZnVuY3Rpb24gdXRmOENoZWNrRXh0cmFCeXRlcyhzZWxmLCBidWYsIHApIHtcbiAgaWYgKChidWZbMF0gJiAweEMwKSAhPT0gMHg4MCkge1xuICAgIHNlbGYubGFzdE5lZWQgPSAwO1xuICAgIHJldHVybiAnXFx1ZmZmZCcucmVwZWF0KHApO1xuICB9XG4gIGlmIChzZWxmLmxhc3ROZWVkID4gMSAmJiBidWYubGVuZ3RoID4gMSkge1xuICAgIGlmICgoYnVmWzFdICYgMHhDMCkgIT09IDB4ODApIHtcbiAgICAgIHNlbGYubGFzdE5lZWQgPSAxO1xuICAgICAgcmV0dXJuICdcXHVmZmZkJy5yZXBlYXQocCArIDEpO1xuICAgIH1cbiAgICBpZiAoc2VsZi5sYXN0TmVlZCA+IDIgJiYgYnVmLmxlbmd0aCA+IDIpIHtcbiAgICAgIGlmICgoYnVmWzJdICYgMHhDMCkgIT09IDB4ODApIHtcbiAgICAgICAgc2VsZi5sYXN0TmVlZCA9IDI7XG4gICAgICAgIHJldHVybiAnXFx1ZmZmZCcucmVwZWF0KHAgKyAyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gQXR0ZW1wdHMgdG8gY29tcGxldGUgYSBtdWx0aS1ieXRlIFVURi04IGNoYXJhY3RlciB1c2luZyBieXRlcyBmcm9tIGEgQnVmZmVyLlxuZnVuY3Rpb24gdXRmOEZpbGxMYXN0KGJ1Zikge1xuICB2YXIgcCA9IHRoaXMubGFzdFRvdGFsIC0gdGhpcy5sYXN0TmVlZDtcbiAgdmFyIHIgPSB1dGY4Q2hlY2tFeHRyYUJ5dGVzKHRoaXMsIGJ1ZiwgcCk7XG4gIGlmIChyICE9PSB1bmRlZmluZWQpIHJldHVybiByO1xuICBpZiAodGhpcy5sYXN0TmVlZCA8PSBidWYubGVuZ3RoKSB7XG4gICAgYnVmLmNvcHkodGhpcy5sYXN0Q2hhciwgcCwgMCwgdGhpcy5sYXN0TmVlZCk7XG4gICAgcmV0dXJuIHRoaXMubGFzdENoYXIudG9TdHJpbmcodGhpcy5lbmNvZGluZywgMCwgdGhpcy5sYXN0VG90YWwpO1xuICB9XG4gIGJ1Zi5jb3B5KHRoaXMubGFzdENoYXIsIHAsIDAsIGJ1Zi5sZW5ndGgpO1xuICB0aGlzLmxhc3ROZWVkIC09IGJ1Zi5sZW5ndGg7XG59XG5cbi8vIFJldHVybnMgYWxsIGNvbXBsZXRlIFVURi04IGNoYXJhY3RlcnMgaW4gYSBCdWZmZXIuIElmIHRoZSBCdWZmZXIgZW5kZWQgb24gYVxuLy8gcGFydGlhbCBjaGFyYWN0ZXIsIHRoZSBjaGFyYWN0ZXIncyBieXRlcyBhcmUgYnVmZmVyZWQgdW50aWwgdGhlIHJlcXVpcmVkXG4vLyBudW1iZXIgb2YgYnl0ZXMgYXJlIGF2YWlsYWJsZS5cbmZ1bmN0aW9uIHV0ZjhUZXh0KGJ1ZiwgaSkge1xuICB2YXIgdG90YWwgPSB1dGY4Q2hlY2tJbmNvbXBsZXRlKHRoaXMsIGJ1ZiwgaSk7XG4gIGlmICghdGhpcy5sYXN0TmVlZCkgcmV0dXJuIGJ1Zi50b1N0cmluZygndXRmOCcsIGkpO1xuICB0aGlzLmxhc3RUb3RhbCA9IHRvdGFsO1xuICB2YXIgZW5kID0gYnVmLmxlbmd0aCAtICh0b3RhbCAtIHRoaXMubGFzdE5lZWQpO1xuICBidWYuY29weSh0aGlzLmxhc3RDaGFyLCAwLCBlbmQpO1xuICByZXR1cm4gYnVmLnRvU3RyaW5nKCd1dGY4JywgaSwgZW5kKTtcbn1cblxuLy8gRm9yIFVURi04LCBhIHJlcGxhY2VtZW50IGNoYXJhY3RlciBmb3IgZWFjaCBidWZmZXJlZCBieXRlIG9mIGEgKHBhcnRpYWwpXG4vLyBjaGFyYWN0ZXIgbmVlZHMgdG8gYmUgYWRkZWQgdG8gdGhlIG91dHB1dC5cbmZ1bmN0aW9uIHV0ZjhFbmQoYnVmKSB7XG4gIHZhciByID0gYnVmICYmIGJ1Zi5sZW5ndGggPyB0aGlzLndyaXRlKGJ1ZikgOiAnJztcbiAgaWYgKHRoaXMubGFzdE5lZWQpIHJldHVybiByICsgJ1xcdWZmZmQnLnJlcGVhdCh0aGlzLmxhc3RUb3RhbCAtIHRoaXMubGFzdE5lZWQpO1xuICByZXR1cm4gcjtcbn1cblxuLy8gVVRGLTE2TEUgdHlwaWNhbGx5IG5lZWRzIHR3byBieXRlcyBwZXIgY2hhcmFjdGVyLCBidXQgZXZlbiBpZiB3ZSBoYXZlIGFuIGV2ZW5cbi8vIG51bWJlciBvZiBieXRlcyBhdmFpbGFibGUsIHdlIG5lZWQgdG8gY2hlY2sgaWYgd2UgZW5kIG9uIGEgbGVhZGluZy9oaWdoXG4vLyBzdXJyb2dhdGUuIEluIHRoYXQgY2FzZSwgd2UgbmVlZCB0byB3YWl0IGZvciB0aGUgbmV4dCB0d28gYnl0ZXMgaW4gb3JkZXIgdG9cbi8vIGRlY29kZSB0aGUgbGFzdCBjaGFyYWN0ZXIgcHJvcGVybHkuXG5mdW5jdGlvbiB1dGYxNlRleHQoYnVmLCBpKSB7XG4gIGlmICgoYnVmLmxlbmd0aCAtIGkpICUgMiA9PT0gMCkge1xuICAgIHZhciByID0gYnVmLnRvU3RyaW5nKCd1dGYxNmxlJywgaSk7XG4gICAgaWYgKHIpIHtcbiAgICAgIHZhciBjID0gci5jaGFyQ29kZUF0KHIubGVuZ3RoIC0gMSk7XG4gICAgICBpZiAoYyA+PSAweEQ4MDAgJiYgYyA8PSAweERCRkYpIHtcbiAgICAgICAgdGhpcy5sYXN0TmVlZCA9IDI7XG4gICAgICAgIHRoaXMubGFzdFRvdGFsID0gNDtcbiAgICAgICAgdGhpcy5sYXN0Q2hhclswXSA9IGJ1ZltidWYubGVuZ3RoIC0gMl07XG4gICAgICAgIHRoaXMubGFzdENoYXJbMV0gPSBidWZbYnVmLmxlbmd0aCAtIDFdO1xuICAgICAgICByZXR1cm4gci5zbGljZSgwLCAtMSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9XG4gIHRoaXMubGFzdE5lZWQgPSAxO1xuICB0aGlzLmxhc3RUb3RhbCA9IDI7XG4gIHRoaXMubGFzdENoYXJbMF0gPSBidWZbYnVmLmxlbmd0aCAtIDFdO1xuICByZXR1cm4gYnVmLnRvU3RyaW5nKCd1dGYxNmxlJywgaSwgYnVmLmxlbmd0aCAtIDEpO1xufVxuXG4vLyBGb3IgVVRGLTE2TEUgd2UgZG8gbm90IGV4cGxpY2l0bHkgYXBwZW5kIHNwZWNpYWwgcmVwbGFjZW1lbnQgY2hhcmFjdGVycyBpZiB3ZVxuLy8gZW5kIG9uIGEgcGFydGlhbCBjaGFyYWN0ZXIsIHdlIHNpbXBseSBsZXQgdjggaGFuZGxlIHRoYXQuXG5mdW5jdGlvbiB1dGYxNkVuZChidWYpIHtcbiAgdmFyIHIgPSBidWYgJiYgYnVmLmxlbmd0aCA/IHRoaXMud3JpdGUoYnVmKSA6ICcnO1xuICBpZiAodGhpcy5sYXN0TmVlZCkge1xuICAgIHZhciBlbmQgPSB0aGlzLmxhc3RUb3RhbCAtIHRoaXMubGFzdE5lZWQ7XG4gICAgcmV0dXJuIHIgKyB0aGlzLmxhc3RDaGFyLnRvU3RyaW5nKCd1dGYxNmxlJywgMCwgZW5kKTtcbiAgfVxuICByZXR1cm4gcjtcbn1cblxuZnVuY3Rpb24gYmFzZTY0VGV4dChidWYsIGkpIHtcbiAgdmFyIG4gPSAoYnVmLmxlbmd0aCAtIGkpICUgMztcbiAgaWYgKG4gPT09IDApIHJldHVybiBidWYudG9TdHJpbmcoJ2Jhc2U2NCcsIGkpO1xuICB0aGlzLmxhc3ROZWVkID0gMyAtIG47XG4gIHRoaXMubGFzdFRvdGFsID0gMztcbiAgaWYgKG4gPT09IDEpIHtcbiAgICB0aGlzLmxhc3RDaGFyWzBdID0gYnVmW2J1Zi5sZW5ndGggLSAxXTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmxhc3RDaGFyWzBdID0gYnVmW2J1Zi5sZW5ndGggLSAyXTtcbiAgICB0aGlzLmxhc3RDaGFyWzFdID0gYnVmW2J1Zi5sZW5ndGggLSAxXTtcbiAgfVxuICByZXR1cm4gYnVmLnRvU3RyaW5nKCdiYXNlNjQnLCBpLCBidWYubGVuZ3RoIC0gbik7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NEVuZChidWYpIHtcbiAgdmFyIHIgPSBidWYgJiYgYnVmLmxlbmd0aCA/IHRoaXMud3JpdGUoYnVmKSA6ICcnO1xuICBpZiAodGhpcy5sYXN0TmVlZCkgcmV0dXJuIHIgKyB0aGlzLmxhc3RDaGFyLnRvU3RyaW5nKCdiYXNlNjQnLCAwLCAzIC0gdGhpcy5sYXN0TmVlZCk7XG4gIHJldHVybiByO1xufVxuXG4vLyBQYXNzIGJ5dGVzIG9uIHRocm91Z2ggZm9yIHNpbmdsZS1ieXRlIGVuY29kaW5ncyAoZS5nLiBhc2NpaSwgbGF0aW4xLCBoZXgpXG5mdW5jdGlvbiBzaW1wbGVXcml0ZShidWYpIHtcbiAgcmV0dXJuIGJ1Zi50b1N0cmluZyh0aGlzLmVuY29kaW5nKTtcbn1cblxuZnVuY3Rpb24gc2ltcGxlRW5kKGJ1Zikge1xuICByZXR1cm4gYnVmICYmIGJ1Zi5sZW5ndGggPyB0aGlzLndyaXRlKGJ1ZikgOiAnJztcbn0iLCJcbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBkZXByZWNhdGU7XG5cbi8qKlxuICogTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbiAqIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4gKlxuICogSWYgYGxvY2FsU3RvcmFnZS5ub0RlcHJlY2F0aW9uID0gdHJ1ZWAgaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG4gKlxuICogSWYgYGxvY2FsU3RvcmFnZS50aHJvd0RlcHJlY2F0aW9uID0gdHJ1ZWAgaXMgc2V0LCB0aGVuIGRlcHJlY2F0ZWQgZnVuY3Rpb25zXG4gKiB3aWxsIHRocm93IGFuIEVycm9yIHdoZW4gaW52b2tlZC5cbiAqXG4gKiBJZiBgbG9jYWxTdG9yYWdlLnRyYWNlRGVwcmVjYXRpb24gPSB0cnVlYCBpcyBzZXQsIHRoZW4gZGVwcmVjYXRlZCBmdW5jdGlvbnNcbiAqIHdpbGwgaW52b2tlIGBjb25zb2xlLnRyYWNlKClgIGluc3RlYWQgb2YgYGNvbnNvbGUuZXJyb3IoKWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gLSB0aGUgZnVuY3Rpb24gdG8gZGVwcmVjYXRlXG4gKiBAcGFyYW0ge1N0cmluZ30gbXNnIC0gdGhlIHN0cmluZyB0byBwcmludCB0byB0aGUgY29uc29sZSB3aGVuIGBmbmAgaXMgaW52b2tlZFxuICogQHJldHVybnMge0Z1bmN0aW9ufSBhIG5ldyBcImRlcHJlY2F0ZWRcIiB2ZXJzaW9uIG9mIGBmbmBcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGVwcmVjYXRlIChmbiwgbXNnKSB7XG4gIGlmIChjb25maWcoJ25vRGVwcmVjYXRpb24nKSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKGNvbmZpZygndGhyb3dEZXByZWNhdGlvbicpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChjb25maWcoJ3RyYWNlRGVwcmVjYXRpb24nKSkge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4obXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59XG5cbi8qKlxuICogQ2hlY2tzIGBsb2NhbFN0b3JhZ2VgIGZvciBib29sZWFuIHZhbHVlcyBmb3IgdGhlIGdpdmVuIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybnMge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb25maWcgKG5hbWUpIHtcbiAgLy8gYWNjZXNzaW5nIGdsb2JhbC5sb2NhbFN0b3JhZ2UgY2FuIHRyaWdnZXIgYSBET01FeGNlcHRpb24gaW4gc2FuZGJveGVkIGlmcmFtZXNcbiAgdHJ5IHtcbiAgICBpZiAoIWdsb2JhbC5sb2NhbFN0b3JhZ2UpIHJldHVybiBmYWxzZTtcbiAgfSBjYXRjaCAoXykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdmFsID0gZ2xvYmFsLmxvY2FsU3RvcmFnZVtuYW1lXTtcbiAgaWYgKG51bGwgPT0gdmFsKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBTdHJpbmcodmFsKS50b0xvd2VyQ2FzZSgpID09PSAndHJ1ZSc7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwicmVxdWlyZSgndXNlLXN0cmljdCcpO1xuXG5pZihyZXF1aXJlLm1haW4gPT09IG1vZHVsZSl7XG4gIC8vY2FsbGVkIGRpcmVjdGx5IGluIHRlcm1pbmFsXG4gIHJlcXVpcmUoJy4vdGVybWluYWwtYWRhcHRlci5qcycpO1xufVxuZWxzZXtcbiAgLy9jYWxsZWQgYXMgYSBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlZmF1bHQtYWRhcHRlci5qcycpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiAvW1xcdTAwMWJcXHUwMDliXVtbKCkjOz9dKig/OlswLTldezEsNH0oPzo7WzAtOV17MCw0fSkqKT9bMC05QS1QUlpjZi1ucXJ5PT48XS9nO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gYXNzZW1ibGVTdHlsZXMgKCkge1xuXHR2YXIgc3R5bGVzID0ge1xuXHRcdG1vZGlmaWVyczoge1xuXHRcdFx0cmVzZXQ6IFswLCAwXSxcblx0XHRcdGJvbGQ6IFsxLCAyMl0sIC8vIDIxIGlzbid0IHdpZGVseSBzdXBwb3J0ZWQgYW5kIDIyIGRvZXMgdGhlIHNhbWUgdGhpbmdcblx0XHRcdGRpbTogWzIsIDIyXSxcblx0XHRcdGl0YWxpYzogWzMsIDIzXSxcblx0XHRcdHVuZGVybGluZTogWzQsIDI0XSxcblx0XHRcdGludmVyc2U6IFs3LCAyN10sXG5cdFx0XHRoaWRkZW46IFs4LCAyOF0sXG5cdFx0XHRzdHJpa2V0aHJvdWdoOiBbOSwgMjldXG5cdFx0fSxcblx0XHRjb2xvcnM6IHtcblx0XHRcdGJsYWNrOiBbMzAsIDM5XSxcblx0XHRcdHJlZDogWzMxLCAzOV0sXG5cdFx0XHRncmVlbjogWzMyLCAzOV0sXG5cdFx0XHR5ZWxsb3c6IFszMywgMzldLFxuXHRcdFx0Ymx1ZTogWzM0LCAzOV0sXG5cdFx0XHRtYWdlbnRhOiBbMzUsIDM5XSxcblx0XHRcdGN5YW46IFszNiwgMzldLFxuXHRcdFx0d2hpdGU6IFszNywgMzldLFxuXHRcdFx0Z3JheTogWzkwLCAzOV1cblx0XHR9LFxuXHRcdGJnQ29sb3JzOiB7XG5cdFx0XHRiZ0JsYWNrOiBbNDAsIDQ5XSxcblx0XHRcdGJnUmVkOiBbNDEsIDQ5XSxcblx0XHRcdGJnR3JlZW46IFs0MiwgNDldLFxuXHRcdFx0YmdZZWxsb3c6IFs0MywgNDldLFxuXHRcdFx0YmdCbHVlOiBbNDQsIDQ5XSxcblx0XHRcdGJnTWFnZW50YTogWzQ1LCA0OV0sXG5cdFx0XHRiZ0N5YW46IFs0NiwgNDldLFxuXHRcdFx0YmdXaGl0ZTogWzQ3LCA0OV1cblx0XHR9XG5cdH07XG5cblx0Ly8gZml4IGh1bWFuc1xuXHRzdHlsZXMuY29sb3JzLmdyZXkgPSBzdHlsZXMuY29sb3JzLmdyYXk7XG5cblx0T2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChncm91cE5hbWUpIHtcblx0XHR2YXIgZ3JvdXAgPSBzdHlsZXNbZ3JvdXBOYW1lXTtcblxuXHRcdE9iamVjdC5rZXlzKGdyb3VwKS5mb3JFYWNoKGZ1bmN0aW9uIChzdHlsZU5hbWUpIHtcblx0XHRcdHZhciBzdHlsZSA9IGdyb3VwW3N0eWxlTmFtZV07XG5cblx0XHRcdHN0eWxlc1tzdHlsZU5hbWVdID0gZ3JvdXBbc3R5bGVOYW1lXSA9IHtcblx0XHRcdFx0b3BlbjogJ1xcdTAwMWJbJyArIHN0eWxlWzBdICsgJ20nLFxuXHRcdFx0XHRjbG9zZTogJ1xcdTAwMWJbJyArIHN0eWxlWzFdICsgJ20nXG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHN0eWxlcywgZ3JvdXBOYW1lLCB7XG5cdFx0XHR2YWx1ZTogZ3JvdXAsXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZVxuXHRcdH0pO1xuXHR9KTtcblxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCAnZXhwb3J0cycsIHtcblx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0Z2V0OiBhc3NlbWJsZVN0eWxlc1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG52YXIgV2N3aWR0aCA9IHJlcXVpcmUoJ3djd2lkdGgnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHdvcmQsIGJyZWFrQXRMZW5ndGgpIHtcblx0dmFyIGNoYXJBcnIgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHdvcmQpKTtcblx0dmFyIGluZGV4ID0gMDtcblx0dmFyIGluZGV4T2ZMYXN0Rml0Q2hhciA9IDA7XG5cdHZhciBmaXR0YWJsZUxlbmd0aCA9IDA7XG5cdHdoaWxlIChjaGFyQXJyLmxlbmd0aCA+IDApIHtcblx0XHR2YXIgY2hhciA9IGNoYXJBcnIuc2hpZnQoKTtcblx0XHR2YXIgY3VycmVudExlbmd0aCA9IGZpdHRhYmxlTGVuZ3RoICsgV2N3aWR0aChjaGFyKTtcblx0XHRpZiAoY3VycmVudExlbmd0aCA8PSBicmVha0F0TGVuZ3RoKSB7XG5cdFx0XHRpbmRleE9mTGFzdEZpdENoYXIgPSBpbmRleDtcblx0XHRcdGZpdHRhYmxlTGVuZ3RoID0gY3VycmVudExlbmd0aDtcblx0XHRcdGluZGV4Kys7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXHQvL2JyZWFrIGFmdGVyIHRoaXMgY2hhcmFjdGVyXG5cdHJldHVybiBpbmRleE9mTGFzdEZpdENoYXI7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwXG4iLCIndXNlIHN0cmljdCc7XG52YXIgZXNjYXBlU3RyaW5nUmVnZXhwID0gcmVxdWlyZSgnZXNjYXBlLXN0cmluZy1yZWdleHAnKTtcbnZhciBhbnNpU3R5bGVzID0gcmVxdWlyZSgnYW5zaS1zdHlsZXMnKTtcbnZhciBzdHJpcEFuc2kgPSByZXF1aXJlKCdzdHJpcC1hbnNpJyk7XG52YXIgaGFzQW5zaSA9IHJlcXVpcmUoJ2hhcy1hbnNpJyk7XG52YXIgc3VwcG9ydHNDb2xvciA9IHJlcXVpcmUoJ3N1cHBvcnRzLWNvbG9yJyk7XG52YXIgZGVmaW5lUHJvcHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcztcbnZhciBpc1NpbXBsZVdpbmRvd3NUZXJtID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyAmJiAhL154dGVybS9pLnRlc3QocHJvY2Vzcy5lbnYuVEVSTSk7XG5cbmZ1bmN0aW9uIENoYWxrKG9wdGlvbnMpIHtcblx0Ly8gZGV0ZWN0IG1vZGUgaWYgbm90IHNldCBtYW51YWxseVxuXHR0aGlzLmVuYWJsZWQgPSAhb3B0aW9ucyB8fCBvcHRpb25zLmVuYWJsZWQgPT09IHVuZGVmaW5lZCA/IHN1cHBvcnRzQ29sb3IgOiBvcHRpb25zLmVuYWJsZWQ7XG59XG5cbi8vIHVzZSBicmlnaHQgYmx1ZSBvbiBXaW5kb3dzIGFzIHRoZSBub3JtYWwgYmx1ZSBjb2xvciBpcyBpbGxlZ2libGVcbmlmIChpc1NpbXBsZVdpbmRvd3NUZXJtKSB7XG5cdGFuc2lTdHlsZXMuYmx1ZS5vcGVuID0gJ1xcdTAwMWJbOTRtJztcbn1cblxudmFyIHN0eWxlcyA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciByZXQgPSB7fTtcblxuXHRPYmplY3Qua2V5cyhhbnNpU3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRhbnNpU3R5bGVzW2tleV0uY2xvc2VSZSA9IG5ldyBSZWdFeHAoZXNjYXBlU3RyaW5nUmVnZXhwKGFuc2lTdHlsZXNba2V5XS5jbG9zZSksICdnJyk7XG5cblx0XHRyZXRba2V5XSA9IHtcblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gYnVpbGQuY2FsbCh0aGlzLCB0aGlzLl9zdHlsZXMuY29uY2F0KGtleSkpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xuXG5cdHJldHVybiByZXQ7XG59KSgpO1xuXG52YXIgcHJvdG8gPSBkZWZpbmVQcm9wcyhmdW5jdGlvbiBjaGFsaygpIHt9LCBzdHlsZXMpO1xuXG5mdW5jdGlvbiBidWlsZChfc3R5bGVzKSB7XG5cdHZhciBidWlsZGVyID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBhcHBseVN0eWxlLmFwcGx5KGJ1aWxkZXIsIGFyZ3VtZW50cyk7XG5cdH07XG5cblx0YnVpbGRlci5fc3R5bGVzID0gX3N0eWxlcztcblx0YnVpbGRlci5lbmFibGVkID0gdGhpcy5lbmFibGVkO1xuXHQvLyBfX3Byb3RvX18gaXMgdXNlZCBiZWNhdXNlIHdlIG11c3QgcmV0dXJuIGEgZnVuY3Rpb24sIGJ1dCB0aGVyZSBpc1xuXHQvLyBubyB3YXkgdG8gY3JlYXRlIGEgZnVuY3Rpb24gd2l0aCBhIGRpZmZlcmVudCBwcm90b3R5cGUuXG5cdC8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG5cdGJ1aWxkZXIuX19wcm90b19fID0gcHJvdG87XG5cblx0cmV0dXJuIGJ1aWxkZXI7XG59XG5cbmZ1bmN0aW9uIGFwcGx5U3R5bGUoKSB7XG5cdC8vIHN1cHBvcnQgdmFyYWdzLCBidXQgc2ltcGx5IGNhc3QgdG8gc3RyaW5nIGluIGNhc2UgdGhlcmUncyBvbmx5IG9uZSBhcmdcblx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdHZhciBhcmdzTGVuID0gYXJncy5sZW5ndGg7XG5cdHZhciBzdHIgPSBhcmdzTGVuICE9PSAwICYmIFN0cmluZyhhcmd1bWVudHNbMF0pO1xuXG5cdGlmIChhcmdzTGVuID4gMSkge1xuXHRcdC8vIGRvbid0IHNsaWNlIGBhcmd1bWVudHNgLCBpdCBwcmV2ZW50cyB2OCBvcHRpbWl6YXRpb25zXG5cdFx0Zm9yICh2YXIgYSA9IDE7IGEgPCBhcmdzTGVuOyBhKyspIHtcblx0XHRcdHN0ciArPSAnICcgKyBhcmdzW2FdO1xuXHRcdH1cblx0fVxuXG5cdGlmICghdGhpcy5lbmFibGVkIHx8ICFzdHIpIHtcblx0XHRyZXR1cm4gc3RyO1xuXHR9XG5cblx0dmFyIG5lc3RlZFN0eWxlcyA9IHRoaXMuX3N0eWxlcztcblx0dmFyIGkgPSBuZXN0ZWRTdHlsZXMubGVuZ3RoO1xuXG5cdC8vIFR1cm5zIG91dCB0aGF0IG9uIFdpbmRvd3MgZGltbWVkIGdyYXkgdGV4dCBiZWNvbWVzIGludmlzaWJsZSBpbiBjbWQuZXhlLFxuXHQvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2NoYWxrL2NoYWxrL2lzc3Vlcy81OFxuXHQvLyBJZiB3ZSdyZSBvbiBXaW5kb3dzIGFuZCB3ZSdyZSBkZWFsaW5nIHdpdGggYSBncmF5IGNvbG9yLCB0ZW1wb3JhcmlseSBtYWtlICdkaW0nIGEgbm9vcC5cblx0dmFyIG9yaWdpbmFsRGltID0gYW5zaVN0eWxlcy5kaW0ub3Blbjtcblx0aWYgKGlzU2ltcGxlV2luZG93c1Rlcm0gJiYgKG5lc3RlZFN0eWxlcy5pbmRleE9mKCdncmF5JykgIT09IC0xIHx8IG5lc3RlZFN0eWxlcy5pbmRleE9mKCdncmV5JykgIT09IC0xKSkge1xuXHRcdGFuc2lTdHlsZXMuZGltLm9wZW4gPSAnJztcblx0fVxuXG5cdHdoaWxlIChpLS0pIHtcblx0XHR2YXIgY29kZSA9IGFuc2lTdHlsZXNbbmVzdGVkU3R5bGVzW2ldXTtcblxuXHRcdC8vIFJlcGxhY2UgYW55IGluc3RhbmNlcyBhbHJlYWR5IHByZXNlbnQgd2l0aCBhIHJlLW9wZW5pbmcgY29kZVxuXHRcdC8vIG90aGVyd2lzZSBvbmx5IHRoZSBwYXJ0IG9mIHRoZSBzdHJpbmcgdW50aWwgc2FpZCBjbG9zaW5nIGNvZGVcblx0XHQvLyB3aWxsIGJlIGNvbG9yZWQsIGFuZCB0aGUgcmVzdCB3aWxsIHNpbXBseSBiZSAncGxhaW4nLlxuXHRcdHN0ciA9IGNvZGUub3BlbiArIHN0ci5yZXBsYWNlKGNvZGUuY2xvc2VSZSwgY29kZS5vcGVuKSArIGNvZGUuY2xvc2U7XG5cdH1cblxuXHQvLyBSZXNldCB0aGUgb3JpZ2luYWwgJ2RpbScgaWYgd2UgY2hhbmdlZCBpdCB0byB3b3JrIGFyb3VuZCB0aGUgV2luZG93cyBkaW1tZWQgZ3JheSBpc3N1ZS5cblx0YW5zaVN0eWxlcy5kaW0ub3BlbiA9IG9yaWdpbmFsRGltO1xuXG5cdHJldHVybiBzdHI7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG5cdHZhciByZXQgPSB7fTtcblxuXHRPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcblx0XHRyZXRbbmFtZV0gPSB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIGJ1aWxkLmNhbGwodGhpcywgW25hbWVdKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcblxuXHRyZXR1cm4gcmV0O1xufVxuXG5kZWZpbmVQcm9wcyhDaGFsay5wcm90b3R5cGUsIGluaXQoKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IENoYWxrKCk7XG5tb2R1bGUuZXhwb3J0cy5zdHlsZXMgPSBhbnNpU3R5bGVzO1xubW9kdWxlLmV4cG9ydHMuaGFzQ29sb3IgPSBoYXNBbnNpO1xubW9kdWxlLmV4cG9ydHMuc3RyaXBDb2xvciA9IHN0cmlwQW5zaTtcbm1vZHVsZS5leHBvcnRzLnN1cHBvcnRzQ29sb3IgPSBzdXBwb3J0c0NvbG9yO1xuIiwidmFyIGNsb25lID0gKGZ1bmN0aW9uKCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENsb25lcyAoY29waWVzKSBhbiBPYmplY3QgdXNpbmcgZGVlcCBjb3B5aW5nLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gc3VwcG9ydHMgY2lyY3VsYXIgcmVmZXJlbmNlcyBieSBkZWZhdWx0LCBidXQgaWYgeW91IGFyZSBjZXJ0YWluXG4gKiB0aGVyZSBhcmUgbm8gY2lyY3VsYXIgcmVmZXJlbmNlcyBpbiB5b3VyIG9iamVjdCwgeW91IGNhbiBzYXZlIHNvbWUgQ1BVIHRpbWVcbiAqIGJ5IGNhbGxpbmcgY2xvbmUob2JqLCBmYWxzZSkuXG4gKlxuICogQ2F1dGlvbjogaWYgYGNpcmN1bGFyYCBpcyBmYWxzZSBhbmQgYHBhcmVudGAgY29udGFpbnMgY2lyY3VsYXIgcmVmZXJlbmNlcyxcbiAqIHlvdXIgcHJvZ3JhbSBtYXkgZW50ZXIgYW4gaW5maW5pdGUgbG9vcCBhbmQgY3Jhc2guXG4gKlxuICogQHBhcmFtIGBwYXJlbnRgIC0gdGhlIG9iamVjdCB0byBiZSBjbG9uZWRcbiAqIEBwYXJhbSBgY2lyY3VsYXJgIC0gc2V0IHRvIHRydWUgaWYgdGhlIG9iamVjdCB0byBiZSBjbG9uZWQgbWF5IGNvbnRhaW5cbiAqICAgIGNpcmN1bGFyIHJlZmVyZW5jZXMuIChvcHRpb25hbCAtIHRydWUgYnkgZGVmYXVsdClcbiAqIEBwYXJhbSBgZGVwdGhgIC0gc2V0IHRvIGEgbnVtYmVyIGlmIHRoZSBvYmplY3QgaXMgb25seSB0byBiZSBjbG9uZWQgdG9cbiAqICAgIGEgcGFydGljdWxhciBkZXB0aC4gKG9wdGlvbmFsIC0gZGVmYXVsdHMgdG8gSW5maW5pdHkpXG4gKiBAcGFyYW0gYHByb3RvdHlwZWAgLSBzZXRzIHRoZSBwcm90b3R5cGUgdG8gYmUgdXNlZCB3aGVuIGNsb25pbmcgYW4gb2JqZWN0LlxuICogICAgKG9wdGlvbmFsIC0gZGVmYXVsdHMgdG8gcGFyZW50IHByb3RvdHlwZSkuXG4qL1xuZnVuY3Rpb24gY2xvbmUocGFyZW50LCBjaXJjdWxhciwgZGVwdGgsIHByb3RvdHlwZSkge1xuICB2YXIgZmlsdGVyO1xuICBpZiAodHlwZW9mIGNpcmN1bGFyID09PSAnb2JqZWN0Jykge1xuICAgIGRlcHRoID0gY2lyY3VsYXIuZGVwdGg7XG4gICAgcHJvdG90eXBlID0gY2lyY3VsYXIucHJvdG90eXBlO1xuICAgIGZpbHRlciA9IGNpcmN1bGFyLmZpbHRlcjtcbiAgICBjaXJjdWxhciA9IGNpcmN1bGFyLmNpcmN1bGFyXG4gIH1cbiAgLy8gbWFpbnRhaW4gdHdvIGFycmF5cyBmb3IgY2lyY3VsYXIgcmVmZXJlbmNlcywgd2hlcmUgY29ycmVzcG9uZGluZyBwYXJlbnRzXG4gIC8vIGFuZCBjaGlsZHJlbiBoYXZlIHRoZSBzYW1lIGluZGV4XG4gIHZhciBhbGxQYXJlbnRzID0gW107XG4gIHZhciBhbGxDaGlsZHJlbiA9IFtdO1xuXG4gIHZhciB1c2VCdWZmZXIgPSB0eXBlb2YgQnVmZmVyICE9ICd1bmRlZmluZWQnO1xuXG4gIGlmICh0eXBlb2YgY2lyY3VsYXIgPT0gJ3VuZGVmaW5lZCcpXG4gICAgY2lyY3VsYXIgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZGVwdGggPT0gJ3VuZGVmaW5lZCcpXG4gICAgZGVwdGggPSBJbmZpbml0eTtcblxuICAvLyByZWN1cnNlIHRoaXMgZnVuY3Rpb24gc28gd2UgZG9uJ3QgcmVzZXQgYWxsUGFyZW50cyBhbmQgYWxsQ2hpbGRyZW5cbiAgZnVuY3Rpb24gX2Nsb25lKHBhcmVudCwgZGVwdGgpIHtcbiAgICAvLyBjbG9uaW5nIG51bGwgYWx3YXlzIHJldHVybnMgbnVsbFxuICAgIGlmIChwYXJlbnQgPT09IG51bGwpXG4gICAgICByZXR1cm4gbnVsbDtcblxuICAgIGlmIChkZXB0aCA9PSAwKVxuICAgICAgcmV0dXJuIHBhcmVudDtcblxuICAgIHZhciBjaGlsZDtcbiAgICB2YXIgcHJvdG87XG4gICAgaWYgKHR5cGVvZiBwYXJlbnQgIT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgfVxuXG4gICAgaWYgKGNsb25lLl9faXNBcnJheShwYXJlbnQpKSB7XG4gICAgICBjaGlsZCA9IFtdO1xuICAgIH0gZWxzZSBpZiAoY2xvbmUuX19pc1JlZ0V4cChwYXJlbnQpKSB7XG4gICAgICBjaGlsZCA9IG5ldyBSZWdFeHAocGFyZW50LnNvdXJjZSwgX19nZXRSZWdFeHBGbGFncyhwYXJlbnQpKTtcbiAgICAgIGlmIChwYXJlbnQubGFzdEluZGV4KSBjaGlsZC5sYXN0SW5kZXggPSBwYXJlbnQubGFzdEluZGV4O1xuICAgIH0gZWxzZSBpZiAoY2xvbmUuX19pc0RhdGUocGFyZW50KSkge1xuICAgICAgY2hpbGQgPSBuZXcgRGF0ZShwYXJlbnQuZ2V0VGltZSgpKTtcbiAgICB9IGVsc2UgaWYgKHVzZUJ1ZmZlciAmJiBCdWZmZXIuaXNCdWZmZXIocGFyZW50KSkge1xuICAgICAgY2hpbGQgPSBuZXcgQnVmZmVyKHBhcmVudC5sZW5ndGgpO1xuICAgICAgcGFyZW50LmNvcHkoY2hpbGQpO1xuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHByb3RvdHlwZSA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwYXJlbnQpO1xuICAgICAgICBjaGlsZCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNoaWxkID0gT2JqZWN0LmNyZWF0ZShwcm90b3R5cGUpO1xuICAgICAgICBwcm90byA9IHByb3RvdHlwZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2lyY3VsYXIpIHtcbiAgICAgIHZhciBpbmRleCA9IGFsbFBhcmVudHMuaW5kZXhPZihwYXJlbnQpO1xuXG4gICAgICBpZiAoaW5kZXggIT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIGFsbENoaWxkcmVuW2luZGV4XTtcbiAgICAgIH1cbiAgICAgIGFsbFBhcmVudHMucHVzaChwYXJlbnQpO1xuICAgICAgYWxsQ2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSBpbiBwYXJlbnQpIHtcbiAgICAgIHZhciBhdHRycztcbiAgICAgIGlmIChwcm90bykge1xuICAgICAgICBhdHRycyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG8sIGkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXR0cnMgJiYgYXR0cnMuc2V0ID09IG51bGwpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjaGlsZFtpXSA9IF9jbG9uZShwYXJlbnRbaV0sIGRlcHRoIC0gMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoaWxkO1xuICB9XG5cbiAgcmV0dXJuIF9jbG9uZShwYXJlbnQsIGRlcHRoKTtcbn1cblxuLyoqXG4gKiBTaW1wbGUgZmxhdCBjbG9uZSB1c2luZyBwcm90b3R5cGUsIGFjY2VwdHMgb25seSBvYmplY3RzLCB1c2VmdWxsIGZvciBwcm9wZXJ0eVxuICogb3ZlcnJpZGUgb24gRkxBVCBjb25maWd1cmF0aW9uIG9iamVjdCAobm8gbmVzdGVkIHByb3BzKS5cbiAqXG4gKiBVU0UgV0lUSCBDQVVUSU9OISBUaGlzIG1heSBub3QgYmVoYXZlIGFzIHlvdSB3aXNoIGlmIHlvdSBkbyBub3Qga25vdyBob3cgdGhpc1xuICogd29ya3MuXG4gKi9cbmNsb25lLmNsb25lUHJvdG90eXBlID0gZnVuY3Rpb24gY2xvbmVQcm90b3R5cGUocGFyZW50KSB7XG4gIGlmIChwYXJlbnQgPT09IG51bGwpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgdmFyIGMgPSBmdW5jdGlvbiAoKSB7fTtcbiAgYy5wcm90b3R5cGUgPSBwYXJlbnQ7XG4gIHJldHVybiBuZXcgYygpO1xufTtcblxuLy8gcHJpdmF0ZSB1dGlsaXR5IGZ1bmN0aW9uc1xuXG5mdW5jdGlvbiBfX29ialRvU3RyKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn07XG5jbG9uZS5fX29ialRvU3RyID0gX19vYmpUb1N0cjtcblxuZnVuY3Rpb24gX19pc0RhdGUobykge1xuICByZXR1cm4gdHlwZW9mIG8gPT09ICdvYmplY3QnICYmIF9fb2JqVG9TdHIobykgPT09ICdbb2JqZWN0IERhdGVdJztcbn07XG5jbG9uZS5fX2lzRGF0ZSA9IF9faXNEYXRlO1xuXG5mdW5jdGlvbiBfX2lzQXJyYXkobykge1xuICByZXR1cm4gdHlwZW9mIG8gPT09ICdvYmplY3QnICYmIF9fb2JqVG9TdHIobykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuY2xvbmUuX19pc0FycmF5ID0gX19pc0FycmF5O1xuXG5mdW5jdGlvbiBfX2lzUmVnRXhwKG8pIHtcbiAgcmV0dXJuIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiBfX29ialRvU3RyKG8pID09PSAnW29iamVjdCBSZWdFeHBdJztcbn07XG5jbG9uZS5fX2lzUmVnRXhwID0gX19pc1JlZ0V4cDtcblxuZnVuY3Rpb24gX19nZXRSZWdFeHBGbGFncyhyZSkge1xuICB2YXIgZmxhZ3MgPSAnJztcbiAgaWYgKHJlLmdsb2JhbCkgZmxhZ3MgKz0gJ2cnO1xuICBpZiAocmUuaWdub3JlQ2FzZSkgZmxhZ3MgKz0gJ2knO1xuICBpZiAocmUubXVsdGlsaW5lKSBmbGFncyArPSAnbSc7XG4gIHJldHVybiBmbGFncztcbn07XG5jbG9uZS5fX2dldFJlZ0V4cEZsYWdzID0gX19nZXRSZWdFeHBGbGFncztcblxucmV0dXJuIGNsb25lO1xufSkoKTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gY2xvbmU7XG59XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuMTAuMFxudmFyIEdlbmVyYXRvciwgc3RyZWFtLCB1dGlsO1xuXG5zdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcblxudXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNhbGxiYWNrLCBkYXRhLCBnZW5lcmF0b3IsIG9wdGlvbnM7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgb3B0aW9ucyA9IGFyZ3VtZW50c1swXTtcbiAgICBjYWxsYmFjayA9IGFyZ3VtZW50c1sxXTtcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIGNhbGxiYWNrID0gYXJndW1lbnRzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zID0gYXJndW1lbnRzWzBdO1xuICAgIH1cbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG4gIGdlbmVyYXRvciA9IG5ldyBHZW5lcmF0b3Iob3B0aW9ucyk7XG4gIGlmIChjYWxsYmFjaykge1xuICAgIGRhdGEgPSBbXTtcbiAgICBnZW5lcmF0b3Iub24oJ3JlYWRhYmxlJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZCwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIHdoaWxlIChkID0gZ2VuZXJhdG9yLnJlYWQoKSkge1xuICAgICAgICByZXN1bHRzLnB1c2goZGF0YS5wdXNoKG9wdGlvbnMub2JqZWN0TW9kZSA/IGQgOiBkLnRvU3RyaW5nKCkpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0pO1xuICAgIGdlbmVyYXRvci5vbignZXJyb3InLCBjYWxsYmFjayk7XG4gICAgZ2VuZXJhdG9yLm9uKCdlbmQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBvcHRpb25zLm9iamVjdE1vZGUgPyBkYXRhIDogZGF0YS5qb2luKCcnKSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGdlbmVyYXRvcjtcbn07XG5cbkdlbmVyYXRvciA9IGZ1bmN0aW9uKG9wdGlvbnMxKSB7XG4gIHZhciBiYXNlLCBiYXNlMSwgYmFzZTIsIGJhc2UzLCBiYXNlNCwgYmFzZTUsIGJhc2U2LCBiYXNlNywgYmFzZTgsIGksIGosIGxlbiwgcmVmLCB2O1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zMSAhPSBudWxsID8gb3B0aW9uczEgOiB7fTtcbiAgc3RyZWFtLlJlYWRhYmxlLmNhbGwodGhpcywgdGhpcy5vcHRpb25zKTtcbiAgdGhpcy5vcHRpb25zLmNvdW50ID0gMDtcbiAgaWYgKChiYXNlID0gdGhpcy5vcHRpb25zKS5kdXJhdGlvbiA9PSBudWxsKSB7XG4gICAgYmFzZS5kdXJhdGlvbiA9IDQgKiA2MCAqIDEwMDA7XG4gIH1cbiAgaWYgKChiYXNlMSA9IHRoaXMub3B0aW9ucykuY29sdW1ucyA9PSBudWxsKSB7XG4gICAgYmFzZTEuY29sdW1ucyA9IDg7XG4gIH1cbiAgaWYgKChiYXNlMiA9IHRoaXMub3B0aW9ucykubWF4X3dvcmRfbGVuZ3RoID09IG51bGwpIHtcbiAgICBiYXNlMi5tYXhfd29yZF9sZW5ndGggPSAxNjtcbiAgfVxuICBpZiAoKGJhc2UzID0gdGhpcy5vcHRpb25zKS5maXhlZF9zaXplID09IG51bGwpIHtcbiAgICBiYXNlMy5maXhlZF9zaXplID0gZmFsc2U7XG4gIH1cbiAgaWYgKHRoaXMuZml4ZWRfc2l6ZV9idWZmZXIgPT0gbnVsbCkge1xuICAgIHRoaXMuZml4ZWRfc2l6ZV9idWZmZXIgPSAnJztcbiAgfVxuICBpZiAoKGJhc2U0ID0gdGhpcy5vcHRpb25zKS5zdGFydCA9PSBudWxsKSB7XG4gICAgYmFzZTQuc3RhcnQgPSBEYXRlLm5vdygpO1xuICB9XG4gIGlmICgoYmFzZTUgPSB0aGlzLm9wdGlvbnMpLmVuZCA9PSBudWxsKSB7XG4gICAgYmFzZTUuZW5kID0gbnVsbDtcbiAgfVxuICBpZiAoKGJhc2U2ID0gdGhpcy5vcHRpb25zKS5zZWVkID09IG51bGwpIHtcbiAgICBiYXNlNi5zZWVkID0gZmFsc2U7XG4gIH1cbiAgaWYgKChiYXNlNyA9IHRoaXMub3B0aW9ucykubGVuZ3RoID09IG51bGwpIHtcbiAgICBiYXNlNy5sZW5ndGggPSAtMTtcbiAgfVxuICBpZiAoKGJhc2U4ID0gdGhpcy5vcHRpb25zKS5kZWxpbWl0ZXIgPT0gbnVsbCkge1xuICAgIGJhc2U4LmRlbGltaXRlciA9ICcsJztcbiAgfVxuICB0aGlzLmNvdW50X3dyaXR0ZW4gPSAwO1xuICB0aGlzLmNvdW50X2NyZWF0ZWQgPSAwO1xuICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5jb2x1bW5zID09PSAnbnVtYmVyJykge1xuICAgIHRoaXMub3B0aW9ucy5jb2x1bW5zID0gbmV3IEFycmF5KHRoaXMub3B0aW9ucy5jb2x1bW5zKTtcbiAgfVxuICByZWYgPSB0aGlzLm9wdGlvbnMuY29sdW1ucztcbiAgZm9yIChpID0gaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGkgPSArK2opIHtcbiAgICB2ID0gcmVmW2ldO1xuICAgIGlmICh2ID09IG51bGwpIHtcbiAgICAgIHYgPSAnYXNjaWknO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHYgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuY29sdW1uc1tpXSA9IEdlbmVyYXRvclt2XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG51dGlsLmluaGVyaXRzKEdlbmVyYXRvciwgc3RyZWFtLlJlYWRhYmxlKTtcblxubW9kdWxlLmV4cG9ydHMuR2VuZXJhdG9yID0gR2VuZXJhdG9yO1xuXG5HZW5lcmF0b3IucHJvdG90eXBlLnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5vcHRpb25zLnNlZWQpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnNlZWQgPSB0aGlzLm9wdGlvbnMuc2VlZCAqIE1hdGguUEkgKiAxMDAgJSAxMDAgLyAxMDA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCk7XG4gIH1cbn07XG5cbkdlbmVyYXRvci5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnB1c2gobnVsbCk7XG59O1xuXG5HZW5lcmF0b3IucHJvdG90eXBlLl9yZWFkID0gZnVuY3Rpb24oc2l6ZSkge1xuICB2YXIgY29sdW1uLCBkYXRhLCBoZWFkZXIsIGosIGssIGwsIGxlbiwgbGVuMSwgbGVuMiwgbGVuMywgbGVuZ3RoLCBsaW5lLCBsaW5lTGVuZ3RoLCBtLCByZWY7XG4gIGRhdGEgPSBbXTtcbiAgbGVuZ3RoID0gdGhpcy5maXhlZF9zaXplX2J1ZmZlci5sZW5ndGg7XG4gIGlmIChsZW5ndGgpIHtcbiAgICBkYXRhLnB1c2godGhpcy5maXhlZF9zaXplX2J1ZmZlcik7XG4gIH1cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBpZiAoKHRoaXMuY291bnRfY3JlYXRlZCA9PT0gdGhpcy5vcHRpb25zLmxlbmd0aCkgfHwgKHRoaXMub3B0aW9ucy5lbmQgJiYgRGF0ZS5ub3coKSA+IHRoaXMub3B0aW9ucy5lbmQpKSB7XG4gICAgICBpZiAoZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5vYmplY3RNb2RlKSB7XG4gICAgICAgICAgZm9yIChqID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgbGluZSA9IGRhdGFbal07XG4gICAgICAgICAgICB0aGlzLmNvdW50X3dyaXR0ZW4rKztcbiAgICAgICAgICAgIHRoaXMucHVzaChsaW5lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5jb3VudF93cml0dGVuKys7XG4gICAgICAgICAgdGhpcy5wdXNoKGRhdGEuam9pbignJykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKG51bGwpO1xuICAgIH1cbiAgICBsaW5lID0gW107XG4gICAgcmVmID0gdGhpcy5vcHRpb25zLmNvbHVtbnM7XG4gICAgZm9yIChrID0gMCwgbGVuMSA9IHJlZi5sZW5ndGg7IGsgPCBsZW4xOyBrKyspIHtcbiAgICAgIGhlYWRlciA9IHJlZltrXTtcbiAgICAgIGxpbmUucHVzaChcIlwiICsgKGhlYWRlcih0aGlzKSkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLm9iamVjdE1vZGUpIHtcbiAgICAgIGxpbmVMZW5ndGggPSAwO1xuICAgICAgZm9yIChsID0gMCwgbGVuMiA9IGxpbmUubGVuZ3RoOyBsIDwgbGVuMjsgbCsrKSB7XG4gICAgICAgIGNvbHVtbiA9IGxpbmVbbF07XG4gICAgICAgIGxpbmVMZW5ndGggKz0gY29sdW1uLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGluZSA9IFwiXCIgKyAodGhpcy5jb3VudF9jcmVhdGVkID09PSAwID8gJycgOiAnXFxuJykgKyAobGluZS5qb2luKHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIpKTtcbiAgICAgIGxpbmVMZW5ndGggPSBsaW5lLmxlbmd0aDtcbiAgICB9XG4gICAgdGhpcy5jb3VudF9jcmVhdGVkKys7XG4gICAgaWYgKGxlbmd0aCArIGxpbmVMZW5ndGggPiBzaXplKSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLm9iamVjdE1vZGUpIHtcbiAgICAgICAgZGF0YS5wdXNoKGxpbmUpO1xuICAgICAgICBmb3IgKG0gPSAwLCBsZW4zID0gZGF0YS5sZW5ndGg7IG0gPCBsZW4zOyBtKyspIHtcbiAgICAgICAgICBsaW5lID0gZGF0YVttXTtcbiAgICAgICAgICB0aGlzLmNvdW50X3dyaXR0ZW4rKztcbiAgICAgICAgICB0aGlzLnB1c2gobGluZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZml4ZWRfc2l6ZSkge1xuICAgICAgICAgIHRoaXMuZml4ZWRfc2l6ZV9idWZmZXIgPSBsaW5lLnN1YnN0cihzaXplIC0gbGVuZ3RoKTtcbiAgICAgICAgICBkYXRhLnB1c2gobGluZS5zdWJzdHIoMCwgc2l6ZSAtIGxlbmd0aCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRhdGEucHVzaChsaW5lKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvdW50X3dyaXR0ZW4rKztcbiAgICAgICAgdGhpcy5wdXNoKGRhdGEuam9pbignJykpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGxlbmd0aCArPSBsaW5lTGVuZ3RoO1xuICAgIGRhdGEucHVzaChsaW5lKTtcbiAgfVxufTtcblxuR2VuZXJhdG9yLmFzY2lpID0gZnVuY3Rpb24oZ2VuKSB7XG4gIHZhciBjaGFyLCBjb2x1bW4sIGosIG5iX2NoYXJzLCByZWY7XG4gIGNvbHVtbiA9IFtdO1xuICBmb3IgKG5iX2NoYXJzID0gaiA9IDAsIHJlZiA9IE1hdGguY2VpbChnZW4ucmFuZG9tKCkgKiBnZW4ub3B0aW9ucy5tYXhfd29yZF9sZW5ndGgpOyAwIDw9IHJlZiA/IGogPCByZWYgOiBqID4gcmVmOyBuYl9jaGFycyA9IDAgPD0gcmVmID8gKytqIDogLS1qKSB7XG4gICAgY2hhciA9IE1hdGguZmxvb3IoZ2VuLnJhbmRvbSgpICogMzIpO1xuICAgIGNvbHVtbi5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhciArIChjaGFyIDwgMTYgPyA2NSA6IDk3IC0gMTYpKSk7XG4gIH1cbiAgcmV0dXJuIGNvbHVtbi5qb2luKCcnKTtcbn07XG5cbkdlbmVyYXRvci5pbnQgPSBmdW5jdGlvbihnZW4pIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoZ2VuLnJhbmRvbSgpICogTWF0aC5wb3coMiwgNTIpKTtcbn07XG5cbkdlbmVyYXRvci5ib29sID0gZnVuY3Rpb24oZ2VuKSB7XG4gIHJldHVybiBNYXRoLmZsb29yKGdlbi5yYW5kb20oKSAqIDIpO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS4xMC4wXG52YXIgUGFyc2VyLCBTdHJpbmdEZWNvZGVyLCBzdHJlYW0sIHV0aWw7XG5cbnN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG51dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5TdHJpbmdEZWNvZGVyID0gcmVxdWlyZSgnc3RyaW5nX2RlY29kZXInKS5TdHJpbmdEZWNvZGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY2FsbGJhY2ssIGNhbGxlZCwgY2h1bmtzLCBkYXRhLCBvcHRpb25zLCBwYXJzZXI7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgZGF0YSA9IGFyZ3VtZW50c1swXTtcbiAgICBvcHRpb25zID0gYXJndW1lbnRzWzFdO1xuICAgIGNhbGxiYWNrID0gYXJndW1lbnRzWzJdO1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IEVycm9yKFwiSW52YWxpZCBjYWxsYmFjayBhcmd1bWVudDogXCIgKyAoSlNPTi5zdHJpbmdpZnkoY2FsbGJhY2spKSk7XG4gICAgfVxuICAgIGlmICghKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJyB8fCBCdWZmZXIuaXNCdWZmZXIoYXJndW1lbnRzWzBdKSkpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhFcnJvcihcIkludmFsaWQgZGF0YSBhcmd1bWVudDogXCIgKyAoSlNPTi5zdHJpbmdpZnkoZGF0YSkpKSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ3N0cmluZycgfHwgQnVmZmVyLmlzQnVmZmVyKGFyZ3VtZW50c1swXSkpIHtcbiAgICAgIGRhdGEgPSBhcmd1bWVudHNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMgPSBhcmd1bWVudHNbMF07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IGFyZ3VtZW50c1sxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmICh0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IGFyZ3VtZW50c1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IGFyZ3VtZW50c1swXTtcbiAgICB9XG4gIH1cbiAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuICBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMpO1xuICBpZiAoZGF0YSAhPSBudWxsKSB7XG4gICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgIHBhcnNlci53cml0ZShkYXRhKTtcbiAgICAgIHJldHVybiBwYXJzZXIuZW5kKCk7XG4gICAgfSk7XG4gIH1cbiAgaWYgKGNhbGxiYWNrKSB7XG4gICAgY2FsbGVkID0gZmFsc2U7XG4gICAgY2h1bmtzID0gb3B0aW9ucy5vYmpuYW1lID8ge30gOiBbXTtcbiAgICBwYXJzZXIub24oJ3JlYWRhYmxlJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2h1bmssIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICB3aGlsZSAoY2h1bmsgPSBwYXJzZXIucmVhZCgpKSB7XG4gICAgICAgIGlmIChvcHRpb25zLm9iam5hbWUpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goY2h1bmtzW2NodW5rWzBdXSA9IGNodW5rWzFdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goY2h1bmtzLnB1c2goY2h1bmspKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSk7XG4gICAgcGFyc2VyLm9uKCdlcnJvcicsIGZ1bmN0aW9uKGVycikge1xuICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgIH0pO1xuICAgIHBhcnNlci5vbignZW5kJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgY2h1bmtzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gcGFyc2VyO1xufTtcblxuUGFyc2VyID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB2YXIgYmFzZSwgYmFzZTEsIGJhc2UxMCwgYmFzZTExLCBiYXNlMTIsIGJhc2UxMywgYmFzZTE0LCBiYXNlMTUsIGJhc2UxNiwgYmFzZTIsIGJhc2UzLCBiYXNlNCwgYmFzZTUsIGJhc2U2LCBiYXNlNywgYmFzZTgsIGJhc2U5LCBrLCB2O1xuICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG4gIG9wdGlvbnMub2JqZWN0TW9kZSA9IHRydWU7XG4gIHRoaXMub3B0aW9ucyA9IHt9O1xuICBmb3IgKGsgaW4gb3B0aW9ucykge1xuICAgIHYgPSBvcHRpb25zW2tdO1xuICAgIHRoaXMub3B0aW9uc1trXSA9IHY7XG4gIH1cbiAgc3RyZWFtLlRyYW5zZm9ybS5jYWxsKHRoaXMsIHRoaXMub3B0aW9ucyk7XG4gIGlmICgoYmFzZSA9IHRoaXMub3B0aW9ucykucm93RGVsaW1pdGVyID09IG51bGwpIHtcbiAgICBiYXNlLnJvd0RlbGltaXRlciA9IG51bGw7XG4gIH1cbiAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMucm93RGVsaW1pdGVyID09PSAnc3RyaW5nJykge1xuICAgIHRoaXMub3B0aW9ucy5yb3dEZWxpbWl0ZXIgPSBbdGhpcy5vcHRpb25zLnJvd0RlbGltaXRlcl07XG4gIH1cbiAgaWYgKChiYXNlMSA9IHRoaXMub3B0aW9ucykuZGVsaW1pdGVyID09IG51bGwpIHtcbiAgICBiYXNlMS5kZWxpbWl0ZXIgPSAnLCc7XG4gIH1cbiAgaWYgKChiYXNlMiA9IHRoaXMub3B0aW9ucykucXVvdGUgPT0gbnVsbCkge1xuICAgIGJhc2UyLnF1b3RlID0gJ1wiJztcbiAgfVxuICBpZiAoKGJhc2UzID0gdGhpcy5vcHRpb25zKS5lc2NhcGUgPT0gbnVsbCkge1xuICAgIGJhc2UzLmVzY2FwZSA9ICdcIic7XG4gIH1cbiAgaWYgKChiYXNlNCA9IHRoaXMub3B0aW9ucykuY29sdW1ucyA9PSBudWxsKSB7XG4gICAgYmFzZTQuY29sdW1ucyA9IG51bGw7XG4gIH1cbiAgaWYgKChiYXNlNSA9IHRoaXMub3B0aW9ucykuY29tbWVudCA9PSBudWxsKSB7XG4gICAgYmFzZTUuY29tbWVudCA9ICcnO1xuICB9XG4gIGlmICgoYmFzZTYgPSB0aGlzLm9wdGlvbnMpLm9iam5hbWUgPT0gbnVsbCkge1xuICAgIGJhc2U2Lm9iam5hbWUgPSBmYWxzZTtcbiAgfVxuICBpZiAoKGJhc2U3ID0gdGhpcy5vcHRpb25zKS50cmltID09IG51bGwpIHtcbiAgICBiYXNlNy50cmltID0gZmFsc2U7XG4gIH1cbiAgaWYgKChiYXNlOCA9IHRoaXMub3B0aW9ucykubHRyaW0gPT0gbnVsbCkge1xuICAgIGJhc2U4Lmx0cmltID0gZmFsc2U7XG4gIH1cbiAgaWYgKChiYXNlOSA9IHRoaXMub3B0aW9ucykucnRyaW0gPT0gbnVsbCkge1xuICAgIGJhc2U5LnJ0cmltID0gZmFsc2U7XG4gIH1cbiAgaWYgKChiYXNlMTAgPSB0aGlzLm9wdGlvbnMpLmF1dG9fcGFyc2UgPT0gbnVsbCkge1xuICAgIGJhc2UxMC5hdXRvX3BhcnNlID0gZmFsc2U7XG4gIH1cbiAgaWYgKChiYXNlMTEgPSB0aGlzLm9wdGlvbnMpLmF1dG9fcGFyc2VfZGF0ZSA9PSBudWxsKSB7XG4gICAgYmFzZTExLmF1dG9fcGFyc2VfZGF0ZSA9IGZhbHNlO1xuICB9XG4gIGlmICgoYmFzZTEyID0gdGhpcy5vcHRpb25zKS5yZWxheCA9PSBudWxsKSB7XG4gICAgYmFzZTEyLnJlbGF4ID0gZmFsc2U7XG4gIH1cbiAgaWYgKChiYXNlMTMgPSB0aGlzLm9wdGlvbnMpLnJlbGF4X2NvbHVtbl9jb3VudCA9PSBudWxsKSB7XG4gICAgYmFzZTEzLnJlbGF4X2NvbHVtbl9jb3VudCA9IGZhbHNlO1xuICB9XG4gIGlmICgoYmFzZTE0ID0gdGhpcy5vcHRpb25zKS5za2lwX2VtcHR5X2xpbmVzID09IG51bGwpIHtcbiAgICBiYXNlMTQuc2tpcF9lbXB0eV9saW5lcyA9IGZhbHNlO1xuICB9XG4gIGlmICgoYmFzZTE1ID0gdGhpcy5vcHRpb25zKS5tYXhfbGltaXRfb25fZGF0YV9yZWFkID09IG51bGwpIHtcbiAgICBiYXNlMTUubWF4X2xpbWl0X29uX2RhdGFfcmVhZCA9IDEyODAwMDtcbiAgfVxuICBpZiAoKGJhc2UxNiA9IHRoaXMub3B0aW9ucykuc2tpcF9saW5lc193aXRoX2VtcHR5X3ZhbHVlcyA9PSBudWxsKSB7XG4gICAgYmFzZTE2LnNraXBfbGluZXNfd2l0aF9lbXB0eV92YWx1ZXMgPSBmYWxzZTtcbiAgfVxuICB0aGlzLmxpbmVzID0gMDtcbiAgdGhpcy5jb3VudCA9IDA7XG4gIHRoaXMuc2tpcHBlZF9saW5lX2NvdW50ID0gMDtcbiAgdGhpcy5lbXB0eV9saW5lX2NvdW50ID0gMDtcbiAgdGhpcy5pc19pbnQgPSAvXihcXC18XFwrKT8oWzEtOV0rWzAtOV0qKSQvO1xuICB0aGlzLmlzX2Zsb2F0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlIC0gcGFyc2VGbG9hdCh2YWx1ZSkgKyAxKSA+PSAwO1xuICB9O1xuICB0aGlzLl8gPSB7fTtcbiAgdGhpcy5fLmRlY29kZXIgPSBuZXcgU3RyaW5nRGVjb2RlcigpO1xuICB0aGlzLl8ucXVvdGluZyA9IGZhbHNlO1xuICB0aGlzLl8uY29tbWVudGluZyA9IGZhbHNlO1xuICB0aGlzLl8uZmllbGQgPSBudWxsO1xuICB0aGlzLl8ubmV4dENoYXIgPSBudWxsO1xuICB0aGlzLl8uY2xvc2luZ1F1b3RlID0gMDtcbiAgdGhpcy5fLmxpbmUgPSBbXTtcbiAgdGhpcy5fLmNodW5rcyA9IFtdO1xuICB0aGlzLl8ucmF3QnVmID0gJyc7XG4gIHRoaXMuXy5idWYgPSAnJztcbiAgaWYgKHRoaXMub3B0aW9ucy5yb3dEZWxpbWl0ZXIpIHtcbiAgICB0aGlzLl8ucm93RGVsaW1pdGVyTGVuZ3RoID0gTWF0aC5tYXguYXBwbHkoTWF0aCwgdGhpcy5vcHRpb25zLnJvd0RlbGltaXRlci5tYXAoZnVuY3Rpb24odikge1xuICAgICAgcmV0dXJuIHYubGVuZ3RoO1xuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbnV0aWwuaW5oZXJpdHMoUGFyc2VyLCBzdHJlYW0uVHJhbnNmb3JtKTtcblxubW9kdWxlLmV4cG9ydHMuUGFyc2VyID0gUGFyc2VyO1xuXG5QYXJzZXIucHJvdG90eXBlLl90cmFuc2Zvcm0gPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNhbGxiYWNrKSB7XG4gIHZhciBlcnIsIGVycm9yO1xuICBpZiAoY2h1bmsgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICBjaHVuayA9IHRoaXMuXy5kZWNvZGVyLndyaXRlKGNodW5rKTtcbiAgfVxuICB0cnkge1xuICAgIHRoaXMuX193cml0ZShjaHVuaywgZmFsc2UpO1xuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGVyciA9IGVycm9yO1xuICAgIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgfVxufTtcblxuUGFyc2VyLnByb3RvdHlwZS5fZmx1c2ggPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICB2YXIgZXJyLCBlcnJvcjtcbiAgdHJ5IHtcbiAgICB0aGlzLl9fd3JpdGUodGhpcy5fLmRlY29kZXIuZW5kKCksIHRydWUpO1xuICAgIGlmICh0aGlzLl8ucXVvdGluZykge1xuICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcihcIlF1b3RlZCBmaWVsZCBub3QgdGVybWluYXRlZCBhdCBsaW5lIFwiICsgKHRoaXMubGluZXMgKyAxKSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fLmxpbmUubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fX3B1c2godGhpcy5fLmxpbmUpO1xuICAgIH1cbiAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBlcnIgPSBlcnJvcjtcbiAgICByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gIH1cbn07XG5cblBhcnNlci5wcm90b3R5cGUuX19wdXNoID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgZmllbGQsIGksIGosIGxlbiwgbGluZUFzQ29sdW1ucywgcmF3QnVmLCByb3c7XG4gIGlmICh0aGlzLm9wdGlvbnMuc2tpcF9saW5lc193aXRoX2VtcHR5X3ZhbHVlcyAmJiBsaW5lLmpvaW4oJycpLnRyaW0oKSA9PT0gJycpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgcm93ID0gbnVsbDtcbiAgaWYgKHRoaXMub3B0aW9ucy5jb2x1bW5zID09PSB0cnVlKSB7XG4gICAgdGhpcy5vcHRpb25zLmNvbHVtbnMgPSBsaW5lO1xuICAgIHJhd0J1ZiA9ICcnO1xuICAgIHJldHVybjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNvbHVtbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0aGlzLm9wdGlvbnMuY29sdW1ucyA9IHRoaXMub3B0aW9ucy5jb2x1bW5zKGxpbmUpO1xuICAgIHJhd0J1ZiA9ICcnO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoIXRoaXMuXy5saW5lX2xlbmd0aCAmJiBsaW5lLmxlbmd0aCA+IDApIHtcbiAgICB0aGlzLl8ubGluZV9sZW5ndGggPSB0aGlzLm9wdGlvbnMuY29sdW1ucyA/IHRoaXMub3B0aW9ucy5jb2x1bW5zLmxlbmd0aCA6IGxpbmUubGVuZ3RoO1xuICB9XG4gIGlmIChsaW5lLmxlbmd0aCA9PT0gMSAmJiBsaW5lWzBdID09PSAnJykge1xuICAgIHRoaXMuZW1wdHlfbGluZV9jb3VudCsrO1xuICB9IGVsc2UgaWYgKGxpbmUubGVuZ3RoICE9PSB0aGlzLl8ubGluZV9sZW5ndGgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnJlbGF4X2NvbHVtbl9jb3VudCkge1xuICAgICAgdGhpcy5za2lwcGVkX2xpbmVfY291bnQrKztcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5jb2x1bW5zICE9IG51bGwpIHtcbiAgICAgIHRocm93IEVycm9yKFwiTnVtYmVyIG9mIGNvbHVtbnMgb24gbGluZSBcIiArIHRoaXMubGluZXMgKyBcIiBkb2VzIG5vdCBtYXRjaCBoZWFkZXJcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKFwiTnVtYmVyIG9mIGNvbHVtbnMgaXMgaW5jb25zaXN0ZW50IG9uIGxpbmUgXCIgKyB0aGlzLmxpbmVzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jb3VudCsrO1xuICB9XG4gIGlmICh0aGlzLm9wdGlvbnMuY29sdW1ucyAhPSBudWxsKSB7XG4gICAgbGluZUFzQ29sdW1ucyA9IHt9O1xuICAgIGZvciAoaSA9IGogPSAwLCBsZW4gPSBsaW5lLmxlbmd0aDsgaiA8IGxlbjsgaSA9ICsraikge1xuICAgICAgZmllbGQgPSBsaW5lW2ldO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb2x1bW5zW2ldID09PSBmYWxzZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGxpbmVBc0NvbHVtbnNbdGhpcy5vcHRpb25zLmNvbHVtbnNbaV1dID0gZmllbGQ7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMub2JqbmFtZSkge1xuICAgICAgcm93ID0gW2xpbmVBc0NvbHVtbnNbdGhpcy5vcHRpb25zLm9iam5hbWVdLCBsaW5lQXNDb2x1bW5zXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcm93ID0gbGluZUFzQ29sdW1ucztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcm93ID0gbGluZTtcbiAgfVxuICBpZiAodGhpcy5jb3VudCA8IHRoaXMub3B0aW9ucy5mcm9tKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0aGlzLmNvdW50ID4gdGhpcy5vcHRpb25zLnRvKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0aGlzLm9wdGlvbnMucmF3KSB7XG4gICAgdGhpcy5wdXNoKHtcbiAgICAgIHJhdzogdGhpcy5fLnJhd0J1ZixcbiAgICAgIHJvdzogcm93XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuXy5yYXdCdWYgPSAnJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5wdXNoKHJvdyk7XG4gIH1cbn07XG5cblBhcnNlci5wcm90b3R5cGUuX193cml0ZSA9IGZ1bmN0aW9uKGNoYXJzLCBlbmQpIHtcbiAgdmFyIGFyZU5leHRDaGFyc0RlbGltaXRlciwgYXJlTmV4dENoYXJzUm93RGVsaW1pdGVycywgYXV0b19wYXJzZSwgY2hhciwgZXNjYXBlSXNRdW90ZSwgaSwgaXNEZWxpbWl0ZXIsIGlzRXNjYXBlLCBpc05leHRDaGFyQUNvbW1lbnQsIGlzUXVvdGUsIGlzUm93RGVsaW1pdGVyLCBpc1Jvd0RlbGltaXRlckxlbmd0aCwgaXNfZmxvYXQsIGlzX2ludCwgbCwgbHRyaW0sIG5leHRDaGFyUG9zLCByZWYsIHJlZjEsIHJlZjIsIHJlZjMsIHJlZjQsIHJlbWFpbmluZ0J1ZmZlciwgcmVzdWx0cywgcm93RGVsaW1pdGVyLCBydHJpbSwgd2FzQ29tbWVudGluZztcbiAgaXNfaW50ID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAodHlwZW9mIF90aGlzLmlzX2ludCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gX3RoaXMuaXNfaW50KHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5pc19pbnQudGVzdCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkodGhpcyk7XG4gIGlzX2Zsb2F0ID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAodHlwZW9mIF90aGlzLmlzX2Zsb2F0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5pc19mbG9hdCh2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gX3RoaXMuaXNfZmxvYXQudGVzdCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkodGhpcyk7XG4gIGF1dG9fcGFyc2UgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhciBtO1xuICAgICAgaWYgKCFfdGhpcy5vcHRpb25zLmF1dG9fcGFyc2UpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKGlzX2ludCh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzX2Zsb2F0KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChfdGhpcy5vcHRpb25zLmF1dG9fcGFyc2VfZGF0ZSkge1xuICAgICAgICBtID0gRGF0ZS5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIGlmICghaXNOYU4obSkpIHtcbiAgICAgICAgICB2YWx1ZSA9IG5ldyBEYXRlKG0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgfSkodGhpcyk7XG4gIGx0cmltID0gdGhpcy5vcHRpb25zLnRyaW0gfHwgdGhpcy5vcHRpb25zLmx0cmltO1xuICBydHJpbSA9IHRoaXMub3B0aW9ucy50cmltIHx8IHRoaXMub3B0aW9ucy5ydHJpbTtcbiAgY2hhcnMgPSB0aGlzLl8uYnVmICsgY2hhcnM7XG4gIGwgPSBjaGFycy5sZW5ndGg7XG4gIGkgPSAwO1xuICBpZiAodGhpcy5saW5lcyA9PT0gMCAmJiAweEZFRkYgPT09IGNoYXJzLmNoYXJDb2RlQXQoMCkpIHtcbiAgICBpKys7XG4gIH1cbiAgd2hpbGUgKGkgPCBsKSB7XG4gICAgaWYgKCFlbmQpIHtcbiAgICAgIHJlbWFpbmluZ0J1ZmZlciA9IGNoYXJzLnN1YnN0cihpLCBsIC0gaSk7XG4gICAgICBpZiAoKCF0aGlzLm9wdGlvbnMucm93RGVsaW1pdGVyICYmIGkgKyAzID4gbCkgfHwgKCF0aGlzLl8uY29tbWVudGluZyAmJiBsIC0gaSA8IHRoaXMub3B0aW9ucy5jb21tZW50Lmxlbmd0aCAmJiB0aGlzLm9wdGlvbnMuY29tbWVudC5zdWJzdHIoMCwgbCAtIGkpID09PSByZW1haW5pbmdCdWZmZXIpIHx8ICh0aGlzLm9wdGlvbnMucm93RGVsaW1pdGVyICYmIGwgLSBpIDwgdGhpcy5fLnJvd0RlbGltaXRlckxlbmd0aCAmJiB0aGlzLm9wdGlvbnMucm93RGVsaW1pdGVyLnNvbWUoZnVuY3Rpb24ocmQpIHtcbiAgICAgICAgcmV0dXJuIHJkLnN1YnN0cigwLCBsIC0gaSkgPT09IHJlbWFpbmluZ0J1ZmZlcjtcbiAgICAgIH0pKSB8fCAodGhpcy5vcHRpb25zLnJvd0RlbGltaXRlciAmJiB0aGlzLl8ucXVvdGluZyAmJiBsIC0gaSA8ICh0aGlzLm9wdGlvbnMucXVvdGUubGVuZ3RoICsgdGhpcy5fLnJvd0RlbGltaXRlckxlbmd0aCkgJiYgdGhpcy5vcHRpb25zLnJvd0RlbGltaXRlci5zb21lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmQpIHtcbiAgICAgICAgICByZXR1cm4gKF90aGlzLm9wdGlvbnMucXVvdGUgKyByZCkuc3Vic3RyKDAsIGwgLSBpKSA9PT0gcmVtYWluaW5nQnVmZmVyO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpKSB8fCAobCAtIGkgPD0gdGhpcy5vcHRpb25zLmRlbGltaXRlci5sZW5ndGggJiYgdGhpcy5vcHRpb25zLmRlbGltaXRlci5zdWJzdHIoMCwgbCAtIGkpID09PSByZW1haW5pbmdCdWZmZXIpIHx8IChsIC0gaSA8PSB0aGlzLm9wdGlvbnMuZXNjYXBlLmxlbmd0aCAmJiB0aGlzLm9wdGlvbnMuZXNjYXBlLnN1YnN0cigwLCBsIC0gaSkgPT09IHJlbWFpbmluZ0J1ZmZlcikpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGNoYXIgPSB0aGlzLl8ubmV4dENoYXIgPyB0aGlzLl8ubmV4dENoYXIgOiBjaGFycy5jaGFyQXQoaSk7XG4gICAgdGhpcy5fLm5leHRDaGFyID0gbCA+IGkgKyAxID8gY2hhcnMuY2hhckF0KGkgKyAxKSA6ICcnO1xuICAgIGlmICh0aGlzLm9wdGlvbnMucmF3KSB7XG4gICAgICB0aGlzLl8ucmF3QnVmICs9IGNoYXI7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMucm93RGVsaW1pdGVyID09IG51bGwpIHtcbiAgICAgIG5leHRDaGFyUG9zID0gaTtcbiAgICAgIHJvd0RlbGltaXRlciA9IG51bGw7XG4gICAgICBpZiAoIXRoaXMuXy5xdW90aW5nICYmIChjaGFyID09PSAnXFxuJyB8fCBjaGFyID09PSAnXFxyJykpIHtcbiAgICAgICAgcm93RGVsaW1pdGVyID0gY2hhcjtcbiAgICAgICAgbmV4dENoYXJQb3MgKz0gMTtcbiAgICAgIH0gZWxzZSBpZiAoISghdGhpcy5fLnF1b3RpbmcgJiYgY2hhciA9PT0gdGhpcy5vcHRpb25zLnF1b3RlKSAmJiAodGhpcy5fLm5leHRDaGFyID09PSAnXFxuJyB8fCB0aGlzLl8ubmV4dENoYXIgPT09ICdcXHInKSkge1xuICAgICAgICByb3dEZWxpbWl0ZXIgPSB0aGlzLl8ubmV4dENoYXI7XG4gICAgICAgIG5leHRDaGFyUG9zICs9IDI7XG4gICAgICAgIGlmICh0aGlzLnJhdykge1xuICAgICAgICAgIHJhd0J1ZiArPSB0aGlzLl8ubmV4dENoYXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChyb3dEZWxpbWl0ZXIpIHtcbiAgICAgICAgaWYgKHJvd0RlbGltaXRlciA9PT0gJ1xccicgJiYgY2hhcnMuY2hhckF0KG5leHRDaGFyUG9zKSA9PT0gJ1xcbicpIHtcbiAgICAgICAgICByb3dEZWxpbWl0ZXIgKz0gJ1xcbic7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vcHRpb25zLnJvd0RlbGltaXRlciA9IFtyb3dEZWxpbWl0ZXJdO1xuICAgICAgICB0aGlzLl8ucm93RGVsaW1pdGVyTGVuZ3RoID0gcm93RGVsaW1pdGVyLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCF0aGlzLl8uY29tbWVudGluZyAmJiBjaGFyID09PSB0aGlzLm9wdGlvbnMuZXNjYXBlKSB7XG4gICAgICBlc2NhcGVJc1F1b3RlID0gdGhpcy5vcHRpb25zLmVzY2FwZSA9PT0gdGhpcy5vcHRpb25zLnF1b3RlO1xuICAgICAgaXNFc2NhcGUgPSB0aGlzLl8ubmV4dENoYXIgPT09IHRoaXMub3B0aW9ucy5lc2NhcGU7XG4gICAgICBpc1F1b3RlID0gdGhpcy5fLm5leHRDaGFyID09PSB0aGlzLm9wdGlvbnMucXVvdGU7XG4gICAgICBpZiAoIShlc2NhcGVJc1F1b3RlICYmICh0aGlzLl8uZmllbGQgPT0gbnVsbCkgJiYgIXRoaXMuXy5xdW90aW5nKSAmJiAoaXNFc2NhcGUgfHwgaXNRdW90ZSkpIHtcbiAgICAgICAgaSsrO1xuICAgICAgICBjaGFyID0gdGhpcy5fLm5leHRDaGFyO1xuICAgICAgICB0aGlzLl8ubmV4dENoYXIgPSBjaGFycy5jaGFyQXQoaSArIDEpO1xuICAgICAgICBpZiAodGhpcy5fLmZpZWxkID09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl8uZmllbGQgPSAnJztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl8uZmllbGQgKz0gY2hhcjtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYXcpIHtcbiAgICAgICAgICB0aGlzLl8ucmF3QnVmICs9IGNoYXI7XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCF0aGlzLl8uY29tbWVudGluZyAmJiBjaGFyID09PSB0aGlzLm9wdGlvbnMucXVvdGUpIHtcbiAgICAgIGlmICh0aGlzLl8ucXVvdGluZykge1xuICAgICAgICBhcmVOZXh0Q2hhcnNSb3dEZWxpbWl0ZXJzID0gdGhpcy5vcHRpb25zLnJvd0RlbGltaXRlciAmJiB0aGlzLm9wdGlvbnMucm93RGVsaW1pdGVyLnNvbWUoZnVuY3Rpb24ocmQpIHtcbiAgICAgICAgICByZXR1cm4gY2hhcnMuc3Vic3RyKGkgKyAxLCByZC5sZW5ndGgpID09PSByZDtcbiAgICAgICAgfSk7XG4gICAgICAgIGFyZU5leHRDaGFyc0RlbGltaXRlciA9IGNoYXJzLnN1YnN0cihpICsgMSwgdGhpcy5vcHRpb25zLmRlbGltaXRlci5sZW5ndGgpID09PSB0aGlzLm9wdGlvbnMuZGVsaW1pdGVyO1xuICAgICAgICBpc05leHRDaGFyQUNvbW1lbnQgPSB0aGlzLl8ubmV4dENoYXIgPT09IHRoaXMub3B0aW9ucy5jb21tZW50O1xuICAgICAgICBpZiAodGhpcy5fLm5leHRDaGFyICYmICFhcmVOZXh0Q2hhcnNSb3dEZWxpbWl0ZXJzICYmICFhcmVOZXh0Q2hhcnNEZWxpbWl0ZXIgJiYgIWlzTmV4dENoYXJBQ29tbWVudCkge1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmVsYXgpIHtcbiAgICAgICAgICAgIHRoaXMuXy5xdW90aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl8uZmllbGQgPSBcIlwiICsgdGhpcy5vcHRpb25zLnF1b3RlICsgdGhpcy5fLmZpZWxkO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcIkludmFsaWQgY2xvc2luZyBxdW90ZSBhdCBsaW5lIFwiICsgKHRoaXMubGluZXMgKyAxKSArIFwiOyBmb3VuZCBcIiArIChKU09OLnN0cmluZ2lmeSh0aGlzLl8ubmV4dENoYXIpKSArIFwiIGluc3RlYWQgb2YgZGVsaW1pdGVyIFwiICsgKEpTT04uc3RyaW5naWZ5KHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIpKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuXy5xdW90aW5nID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5fLmNsb3NpbmdRdW90ZSA9IHRoaXMub3B0aW9ucy5xdW90ZS5sZW5ndGg7XG4gICAgICAgICAgaSsrO1xuICAgICAgICAgIGlmIChlbmQgJiYgaSA9PT0gbCkge1xuICAgICAgICAgICAgdGhpcy5fLmxpbmUucHVzaChhdXRvX3BhcnNlKHRoaXMuXy5maWVsZCB8fCAnJykpO1xuICAgICAgICAgICAgdGhpcy5fLmZpZWxkID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuXy5maWVsZCkge1xuICAgICAgICB0aGlzLl8ucXVvdGluZyA9IHRydWU7XG4gICAgICAgIGkrKztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKCh0aGlzLl8uZmllbGQgIT0gbnVsbCkgJiYgIXRoaXMub3B0aW9ucy5yZWxheCkge1xuICAgICAgICB0aHJvdyBFcnJvcihcIkludmFsaWQgb3BlbmluZyBxdW90ZSBhdCBsaW5lIFwiICsgKHRoaXMubGluZXMgKyAxKSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlzUm93RGVsaW1pdGVyID0gdGhpcy5vcHRpb25zLnJvd0RlbGltaXRlciAmJiB0aGlzLm9wdGlvbnMucm93RGVsaW1pdGVyLnNvbWUoZnVuY3Rpb24ocmQpIHtcbiAgICAgIHJldHVybiBjaGFycy5zdWJzdHIoaSwgcmQubGVuZ3RoKSA9PT0gcmQ7XG4gICAgfSk7XG4gICAgaWYgKGlzUm93RGVsaW1pdGVyKSB7XG4gICAgICBpc1Jvd0RlbGltaXRlckxlbmd0aCA9IHRoaXMub3B0aW9ucy5yb3dEZWxpbWl0ZXIuZmlsdGVyKGZ1bmN0aW9uKHJkKSB7XG4gICAgICAgIHJldHVybiBjaGFycy5zdWJzdHIoaSwgcmQubGVuZ3RoKSA9PT0gcmQ7XG4gICAgICB9KVswXS5sZW5ndGg7XG4gICAgfVxuICAgIGlmIChpc1Jvd0RlbGltaXRlciB8fCAoZW5kICYmIGkgPT09IGwgLSAxKSkge1xuICAgICAgdGhpcy5saW5lcysrO1xuICAgIH1cbiAgICB3YXNDb21tZW50aW5nID0gZmFsc2U7XG4gICAgaWYgKCF0aGlzLl8uY29tbWVudGluZyAmJiAhdGhpcy5fLnF1b3RpbmcgJiYgdGhpcy5vcHRpb25zLmNvbW1lbnQgJiYgY2hhcnMuc3Vic3RyKGksIHRoaXMub3B0aW9ucy5jb21tZW50Lmxlbmd0aCkgPT09IHRoaXMub3B0aW9ucy5jb21tZW50KSB7XG4gICAgICB0aGlzLl8uY29tbWVudGluZyA9IHRydWU7XG4gICAgfSBlbHNlIGlmICh0aGlzLl8uY29tbWVudGluZyAmJiBpc1Jvd0RlbGltaXRlcikge1xuICAgICAgd2FzQ29tbWVudGluZyA9IHRydWU7XG4gICAgICB0aGlzLl8uY29tbWVudGluZyA9IGZhbHNlO1xuICAgIH1cbiAgICBpc0RlbGltaXRlciA9IGNoYXJzLnN1YnN0cihpLCB0aGlzLm9wdGlvbnMuZGVsaW1pdGVyLmxlbmd0aCkgPT09IHRoaXMub3B0aW9ucy5kZWxpbWl0ZXI7XG4gICAgaWYgKCF0aGlzLl8uY29tbWVudGluZyAmJiAhdGhpcy5fLnF1b3RpbmcgJiYgKGlzRGVsaW1pdGVyIHx8IGlzUm93RGVsaW1pdGVyKSkge1xuICAgICAgaWYgKGlzUm93RGVsaW1pdGVyICYmIHRoaXMuXy5saW5lLmxlbmd0aCA9PT0gMCAmJiAodGhpcy5fLmZpZWxkID09IG51bGwpKSB7XG4gICAgICAgIGlmICh3YXNDb21tZW50aW5nIHx8IHRoaXMub3B0aW9ucy5za2lwX2VtcHR5X2xpbmVzKSB7XG4gICAgICAgICAgaSArPSBpc1Jvd0RlbGltaXRlckxlbmd0aDtcbiAgICAgICAgICB0aGlzLl8ubmV4dENoYXIgPSBjaGFycy5jaGFyQXQoaSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChydHJpbSkge1xuICAgICAgICBpZiAoIXRoaXMuXy5jbG9zaW5nUXVvdGUpIHtcbiAgICAgICAgICB0aGlzLl8uZmllbGQgPSAocmVmID0gdGhpcy5fLmZpZWxkKSAhPSBudWxsID8gcmVmLnRyaW1SaWdodCgpIDogdm9pZCAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl8ubGluZS5wdXNoKGF1dG9fcGFyc2UodGhpcy5fLmZpZWxkIHx8ICcnKSk7XG4gICAgICB0aGlzLl8uY2xvc2luZ1F1b3RlID0gMDtcbiAgICAgIHRoaXMuXy5maWVsZCA9IG51bGw7XG4gICAgICBpZiAoaXNEZWxpbWl0ZXIpIHtcbiAgICAgICAgaSArPSB0aGlzLm9wdGlvbnMuZGVsaW1pdGVyLmxlbmd0aDtcbiAgICAgICAgdGhpcy5fLm5leHRDaGFyID0gY2hhcnMuY2hhckF0KGkpO1xuICAgICAgICBpZiAoZW5kICYmICF0aGlzLl8ubmV4dENoYXIpIHtcbiAgICAgICAgICBpc1Jvd0RlbGltaXRlciA9IHRydWU7XG4gICAgICAgICAgdGhpcy5fLmxpbmUucHVzaCgnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpc1Jvd0RlbGltaXRlcikge1xuICAgICAgICB0aGlzLl9fcHVzaCh0aGlzLl8ubGluZSk7XG4gICAgICAgIHRoaXMuXy5saW5lID0gW107XG4gICAgICAgIGkgKz0gaXNSb3dEZWxpbWl0ZXJMZW5ndGg7XG4gICAgICAgIHRoaXMuXy5uZXh0Q2hhciA9IGNoYXJzLmNoYXJBdChpKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghdGhpcy5fLmNvbW1lbnRpbmcgJiYgIXRoaXMuXy5xdW90aW5nICYmIChjaGFyID09PSAnICcgfHwgY2hhciA9PT0gJ1xcdCcpKSB7XG4gICAgICBpZiAodGhpcy5fLmZpZWxkID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fLmZpZWxkID0gJyc7XG4gICAgICB9XG4gICAgICBpZiAoIShsdHJpbSAmJiAhdGhpcy5fLmZpZWxkKSkge1xuICAgICAgICB0aGlzLl8uZmllbGQgKz0gY2hhcjtcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl8uY29tbWVudGluZykge1xuICAgICAgaWYgKHRoaXMuXy5maWVsZCA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuXy5maWVsZCA9ICcnO1xuICAgICAgfVxuICAgICAgdGhpcy5fLmZpZWxkICs9IGNoYXI7XG4gICAgICBpKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGkrKztcbiAgICB9XG4gICAgaWYgKCF0aGlzLl8uY29tbWVudGluZyAmJiAoKHJlZjEgPSB0aGlzLl8uZmllbGQpICE9IG51bGwgPyByZWYxLmxlbmd0aCA6IHZvaWQgMCkgPiB0aGlzLm9wdGlvbnMubWF4X2xpbWl0X29uX2RhdGFfcmVhZCkge1xuICAgICAgdGhyb3cgRXJyb3IoXCJEZWxpbWl0ZXIgbm90IGZvdW5kIGluIHRoZSBmaWxlIFwiICsgKEpTT04uc3RyaW5naWZ5KHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIpKSk7XG4gICAgfVxuICAgIGlmICghdGhpcy5fLmNvbW1lbnRpbmcgJiYgKChyZWYyID0gdGhpcy5fLmxpbmUpICE9IG51bGwgPyByZWYyLmxlbmd0aCA6IHZvaWQgMCkgPiB0aGlzLm9wdGlvbnMubWF4X2xpbWl0X29uX2RhdGFfcmVhZCkge1xuICAgICAgdGhyb3cgRXJyb3IoXCJSb3cgZGVsaW1pdGVyIG5vdCBmb3VuZCBpbiB0aGUgZmlsZSBcIiArIChKU09OLnN0cmluZ2lmeSh0aGlzLm9wdGlvbnMucm93RGVsaW1pdGVyKSkpO1xuICAgIH1cbiAgfVxuICBpZiAoZW5kKSB7XG4gICAgaWYgKHRoaXMuXy5maWVsZCAhPSBudWxsKSB7XG4gICAgICBpZiAocnRyaW0pIHtcbiAgICAgICAgaWYgKCF0aGlzLl8uY2xvc2luZ1F1b3RlKSB7XG4gICAgICAgICAgdGhpcy5fLmZpZWxkID0gKHJlZjMgPSB0aGlzLl8uZmllbGQpICE9IG51bGwgPyByZWYzLnRyaW1SaWdodCgpIDogdm9pZCAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl8ubGluZS5wdXNoKGF1dG9fcGFyc2UodGhpcy5fLmZpZWxkIHx8ICcnKSk7XG4gICAgICB0aGlzLl8uZmllbGQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoKChyZWY0ID0gdGhpcy5fLmZpZWxkKSAhPSBudWxsID8gcmVmNC5sZW5ndGggOiB2b2lkIDApID4gdGhpcy5vcHRpb25zLm1heF9saW1pdF9vbl9kYXRhX3JlYWQpIHtcbiAgICAgIHRocm93IEVycm9yKFwiRGVsaW1pdGVyIG5vdCBmb3VuZCBpbiB0aGUgZmlsZSBcIiArIChKU09OLnN0cmluZ2lmeSh0aGlzLm9wdGlvbnMuZGVsaW1pdGVyKSkpO1xuICAgIH1cbiAgICBpZiAobCA9PT0gMCkge1xuICAgICAgdGhpcy5saW5lcysrO1xuICAgIH1cbiAgICBpZiAodGhpcy5fLmxpbmUubGVuZ3RoID4gdGhpcy5vcHRpb25zLm1heF9saW1pdF9vbl9kYXRhX3JlYWQpIHtcbiAgICAgIHRocm93IEVycm9yKFwiUm93IGRlbGltaXRlciBub3QgZm91bmQgaW4gdGhlIGZpbGUgXCIgKyAoSlNPTi5zdHJpbmdpZnkodGhpcy5vcHRpb25zLnJvd0RlbGltaXRlcikpKTtcbiAgICB9XG4gIH1cbiAgdGhpcy5fLmJ1ZiA9ICcnO1xuICByZXN1bHRzID0gW107XG4gIHdoaWxlIChpIDwgbCkge1xuICAgIHRoaXMuXy5idWYgKz0gY2hhcnMuY2hhckF0KGkpO1xuICAgIHJlc3VsdHMucHVzaChpKyspO1xuICB9XG4gIHJldHVybiByZXN1bHRzO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS4xMC4wXG52YXIgU3RyaW5naWZpZXIsIGdldCwgc3RyZWFtLCB1dGlsO1xuXG5zdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcblxudXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuZ2V0ID0gcmVxdWlyZSgnbG9kYXNoLmdldCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY2FsbGJhY2ssIGNodW5rcywgZGF0YSwgb3B0aW9ucywgc3RyaW5naWZpZXI7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgZGF0YSA9IGFyZ3VtZW50c1swXTtcbiAgICBvcHRpb25zID0gYXJndW1lbnRzWzFdO1xuICAgIGNhbGxiYWNrID0gYXJndW1lbnRzWzJdO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcmd1bWVudHNbMF0pKSB7XG4gICAgICBkYXRhID0gYXJndW1lbnRzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zID0gYXJndW1lbnRzWzBdO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBhcmd1bWVudHNbMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMgPSBhcmd1bWVudHNbMV07XG4gICAgfVxuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBhcmd1bWVudHNbMF07XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgIGRhdGEgPSBhcmd1bWVudHNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMgPSBhcmd1bWVudHNbMF07XG4gICAgfVxuICB9XG4gIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICBvcHRpb25zID0ge307XG4gIH1cbiAgc3RyaW5naWZpZXIgPSBuZXcgU3RyaW5naWZpZXIob3B0aW9ucyk7XG4gIGlmIChkYXRhKSB7XG4gICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkLCBqLCBsZW47XG4gICAgICBmb3IgKGogPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgIGQgPSBkYXRhW2pdO1xuICAgICAgICBzdHJpbmdpZmllci53cml0ZShkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHJpbmdpZmllci5lbmQoKTtcbiAgICB9KTtcbiAgfVxuICBpZiAoY2FsbGJhY2spIHtcbiAgICBjaHVua3MgPSBbXTtcbiAgICBzdHJpbmdpZmllci5vbigncmVhZGFibGUnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjaHVuaywgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIHdoaWxlIChjaHVuayA9IHN0cmluZ2lmaWVyLnJlYWQoKSkge1xuICAgICAgICByZXN1bHRzLnB1c2goY2h1bmtzLnB1c2goY2h1bmspKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0pO1xuICAgIHN0cmluZ2lmaWVyLm9uKCdlcnJvcicsIGZ1bmN0aW9uKGVycikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgfSk7XG4gICAgc3RyaW5naWZpZXIub24oJ2VuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIGNodW5rcy5qb2luKCcnKSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHN0cmluZ2lmaWVyO1xufTtcblxuU3RyaW5naWZpZXIgPSBmdW5jdGlvbihvcHRzKSB7XG4gIHZhciBiYXNlLCBiYXNlMSwgYmFzZTEwLCBiYXNlMTEsIGJhc2UxMiwgYmFzZTIsIGJhc2UzLCBiYXNlNCwgYmFzZTUsIGJhc2U2LCBiYXNlNywgYmFzZTgsIGJhc2U5LCBrLCBvcHRpb25zLCB2O1xuICBpZiAob3B0cyA9PSBudWxsKSB7XG4gICAgb3B0cyA9IHt9O1xuICB9XG4gIG9wdGlvbnMgPSB7fTtcbiAgZm9yIChrIGluIG9wdHMpIHtcbiAgICB2ID0gb3B0c1trXTtcbiAgICBvcHRpb25zW2tdID0gdjtcbiAgfVxuICBzdHJlYW0uVHJhbnNmb3JtLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIGlmICgoYmFzZSA9IHRoaXMub3B0aW9ucykuZGVsaW1pdGVyID09IG51bGwpIHtcbiAgICBiYXNlLmRlbGltaXRlciA9ICcsJztcbiAgfVxuICBpZiAoKGJhc2UxID0gdGhpcy5vcHRpb25zKS5xdW90ZSA9PSBudWxsKSB7XG4gICAgYmFzZTEucXVvdGUgPSAnXCInO1xuICB9XG4gIGlmICgoYmFzZTIgPSB0aGlzLm9wdGlvbnMpLnF1b3RlZCA9PSBudWxsKSB7XG4gICAgYmFzZTIucXVvdGVkID0gZmFsc2U7XG4gIH1cbiAgaWYgKChiYXNlMyA9IHRoaXMub3B0aW9ucykucXVvdGVkU3RyaW5nID09IG51bGwpIHtcbiAgICBiYXNlMy5xdW90ZWRTdHJpbmcgPSBmYWxzZTtcbiAgfVxuICBpZiAoKGJhc2U0ID0gdGhpcy5vcHRpb25zKS5lb2YgPT0gbnVsbCkge1xuICAgIGJhc2U0LmVvZiA9IHRydWU7XG4gIH1cbiAgaWYgKChiYXNlNSA9IHRoaXMub3B0aW9ucykuZXNjYXBlID09IG51bGwpIHtcbiAgICBiYXNlNS5lc2NhcGUgPSAnXCInO1xuICB9XG4gIGlmICgoYmFzZTYgPSB0aGlzLm9wdGlvbnMpLmNvbHVtbnMgPT0gbnVsbCkge1xuICAgIGJhc2U2LmNvbHVtbnMgPSBudWxsO1xuICB9XG4gIGlmICgoYmFzZTcgPSB0aGlzLm9wdGlvbnMpLmhlYWRlciA9PSBudWxsKSB7XG4gICAgYmFzZTcuaGVhZGVyID0gZmFsc2U7XG4gIH1cbiAgaWYgKChiYXNlOCA9IHRoaXMub3B0aW9ucykuZm9ybWF0dGVycyA9PSBudWxsKSB7XG4gICAgYmFzZTguZm9ybWF0dGVycyA9IHt9O1xuICB9XG4gIGlmICgoYmFzZTkgPSB0aGlzLm9wdGlvbnMuZm9ybWF0dGVycykuZGF0ZSA9PSBudWxsKSB7XG4gICAgYmFzZTkuZGF0ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gJycgKyB2YWx1ZS5nZXRUaW1lKCk7XG4gICAgfTtcbiAgfVxuICBpZiAoKGJhc2UxMCA9IHRoaXMub3B0aW9ucy5mb3JtYXR0ZXJzKS5ib29sID09IG51bGwpIHtcbiAgICBiYXNlMTAuYm9vbCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuICcxJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGlmICgoYmFzZTExID0gdGhpcy5vcHRpb25zLmZvcm1hdHRlcnMpLm9iamVjdCA9PSBudWxsKSB7XG4gICAgYmFzZTExLm9iamVjdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIH07XG4gIH1cbiAgaWYgKChiYXNlMTIgPSB0aGlzLm9wdGlvbnMpLnJvd0RlbGltaXRlciA9PSBudWxsKSB7XG4gICAgYmFzZTEyLnJvd0RlbGltaXRlciA9ICdcXG4nO1xuICB9XG4gIGlmICh0aGlzLmNvdW50V3JpdGVuID09IG51bGwpIHtcbiAgICB0aGlzLmNvdW50V3JpdGVuID0gMDtcbiAgfVxuICBzd2l0Y2ggKHRoaXMub3B0aW9ucy5yb3dEZWxpbWl0ZXIpIHtcbiAgICBjYXNlICdhdXRvJzpcbiAgICAgIHRoaXMub3B0aW9ucy5yb3dEZWxpbWl0ZXIgPSBudWxsO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndW5peCc6XG4gICAgICB0aGlzLm9wdGlvbnMucm93RGVsaW1pdGVyID0gXCJcXG5cIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21hYyc6XG4gICAgICB0aGlzLm9wdGlvbnMucm93RGVsaW1pdGVyID0gXCJcXHJcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3dpbmRvd3MnOlxuICAgICAgdGhpcy5vcHRpb25zLnJvd0RlbGltaXRlciA9IFwiXFxyXFxuXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd1bmljb2RlJzpcbiAgICAgIHRoaXMub3B0aW9ucy5yb3dEZWxpbWl0ZXIgPSBcIlxcdTIwMjhcIjtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbnV0aWwuaW5oZXJpdHMoU3RyaW5naWZpZXIsIHN0cmVhbS5UcmFuc2Zvcm0pO1xuXG5tb2R1bGUuZXhwb3J0cy5TdHJpbmdpZmllciA9IFN0cmluZ2lmaWVyO1xuXG5TdHJpbmdpZmllci5wcm90b3R5cGUuaGVhZGVycyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaywgbGFiZWwsIGxhYmVscztcbiAgaWYgKCF0aGlzLm9wdGlvbnMuaGVhZGVyKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICghdGhpcy5vcHRpb25zLmNvbHVtbnMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGFiZWxzID0gdGhpcy5vcHRpb25zLmNvbHVtbnM7XG4gIGlmICh0eXBlb2YgbGFiZWxzID09PSAnb2JqZWN0Jykge1xuICAgIGxhYmVscyA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChrIGluIGxhYmVscykge1xuICAgICAgICBsYWJlbCA9IGxhYmVsc1trXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0pKCk7XG4gIH1cbiAgaWYgKHRoaXMub3B0aW9ucy5lb2YpIHtcbiAgICBsYWJlbHMgPSB0aGlzLnN0cmluZ2lmeShsYWJlbHMpICsgdGhpcy5vcHRpb25zLnJvd0RlbGltaXRlcjtcbiAgfSBlbHNlIHtcbiAgICBsYWJlbHMgPSB0aGlzLnN0cmluZ2lmeShsYWJlbHMpO1xuICB9XG4gIHJldHVybiBzdHJlYW0uVHJhbnNmb3JtLnByb3RvdHlwZS53cml0ZS5jYWxsKHRoaXMsIGxhYmVscyk7XG59O1xuXG5TdHJpbmdpZmllci5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nLCBjYWxsYmFjaykge1xuICBpZiAodGhpcy5jb3VudFdyaXRlbiA9PT0gMCkge1xuICAgIHRoaXMuaGVhZGVycygpO1xuICB9XG4gIHJldHVybiBzdHJlYW0uVHJhbnNmb3JtLnByb3RvdHlwZS5lbmQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cblN0cmluZ2lmaWVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKGNodW5rLCBlbmNvZGluZywgY2FsbGJhY2spIHtcbiAgdmFyIGJhc2UsIGUsIGVycm9yLCBwcmVzZXJ2ZTtcbiAgaWYgKGNodW5rID09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgcHJlc2VydmUgPSB0eXBlb2YgY2h1bmsgIT09ICdvYmplY3QnO1xuICBpZiAoIXByZXNlcnZlKSB7XG4gICAgaWYgKHRoaXMuY291bnRXcml0ZW4gPT09IDAgJiYgIUFycmF5LmlzQXJyYXkoY2h1bmspKSB7XG4gICAgICBpZiAoKGJhc2UgPSB0aGlzLm9wdGlvbnMpLmNvbHVtbnMgPT0gbnVsbCkge1xuICAgICAgICBiYXNlLmNvbHVtbnMgPSBPYmplY3Qua2V5cyhjaHVuayk7XG4gICAgICB9XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmVtaXQoJ3JlY29yZCcsIGNodW5rLCB0aGlzLmNvdW50V3JpdGVuKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZSA9IGVycm9yO1xuICAgICAgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlKTtcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lb2YpIHtcbiAgICAgIGNodW5rID0gdGhpcy5zdHJpbmdpZnkoY2h1bmspICsgdGhpcy5vcHRpb25zLnJvd0RlbGltaXRlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgY2h1bmsgPSB0aGlzLnN0cmluZ2lmeShjaHVuayk7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmhlYWRlciB8fCB0aGlzLmNvdW50V3JpdGVuKSB7XG4gICAgICAgIGNodW5rID0gdGhpcy5vcHRpb25zLnJvd0RlbGltaXRlciArIGNodW5rO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAodHlwZW9mIGNodW5rID09PSAnbnVtYmVyJykge1xuICAgIGNodW5rID0gXCJcIiArIGNodW5rO1xuICB9XG4gIGlmICh0aGlzLmNvdW50V3JpdGVuID09PSAwKSB7XG4gICAgdGhpcy5oZWFkZXJzKCk7XG4gIH1cbiAgaWYgKCFwcmVzZXJ2ZSkge1xuICAgIHRoaXMuY291bnRXcml0ZW4rKztcbiAgfVxuICByZXR1cm4gc3RyZWFtLlRyYW5zZm9ybS5wcm90b3R5cGUud3JpdGUuY2FsbCh0aGlzLCBjaHVuaywgZW5jb2RpbmcsIGNhbGxiYWNrKTtcbn07XG5cblN0cmluZ2lmaWVyLnByb3RvdHlwZS5fdHJhbnNmb3JtID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nLCBjYWxsYmFjaykge1xuICB0aGlzLnB1c2goY2h1bmspO1xuICByZXR1cm4gY2FsbGJhY2soKTtcbn07XG5cblN0cmluZ2lmaWVyLnByb3RvdHlwZS5zdHJpbmdpZnkgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBfbGluZSwgY29sdW1uLCBjb2x1bW5zLCBjb250YWluc0VzY2FwZSwgY29udGFpbnNMaW5lYnJlYWssIGNvbnRhaW5zUXVvdGUsIGNvbnRhaW5zZGVsaW1pdGVyLCBkZWxpbWl0ZXIsIGVzY2FwZSwgZmllbGQsIGksIGosIGwsIG5ld0xpbmUsIHF1b3RlLCByZWYsIHJlZjEsIHJlZ2V4cCwgc2hvdWxkUXVvdGUsIHZhbHVlO1xuICBpZiAodHlwZW9mIGxpbmUgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGxpbmU7XG4gIH1cbiAgY29sdW1ucyA9IHRoaXMub3B0aW9ucy5jb2x1bW5zO1xuICBpZiAodHlwZW9mIGNvbHVtbnMgPT09ICdvYmplY3QnICYmIGNvbHVtbnMgIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkoY29sdW1ucykpIHtcbiAgICBjb2x1bW5zID0gT2JqZWN0LmtleXMoY29sdW1ucyk7XG4gIH1cbiAgZGVsaW1pdGVyID0gdGhpcy5vcHRpb25zLmRlbGltaXRlcjtcbiAgcXVvdGUgPSB0aGlzLm9wdGlvbnMucXVvdGU7XG4gIGVzY2FwZSA9IHRoaXMub3B0aW9ucy5lc2NhcGU7XG4gIGlmICghQXJyYXkuaXNBcnJheShsaW5lKSkge1xuICAgIF9saW5lID0gW107XG4gICAgaWYgKGNvbHVtbnMpIHtcbiAgICAgIGZvciAoaSA9IGogPSAwLCByZWYgPSBjb2x1bW5zLmxlbmd0aDsgMCA8PSByZWYgPyBqIDwgcmVmIDogaiA+IHJlZjsgaSA9IDAgPD0gcmVmID8gKytqIDogLS1qKSB7XG4gICAgICAgIGNvbHVtbiA9IGNvbHVtbnNbaV07XG4gICAgICAgIHZhbHVlID0gZ2V0KGxpbmUsIGNvbHVtbik7XG4gICAgICAgIF9saW5lW2ldID0gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJyB8fCB2YWx1ZSA9PT0gbnVsbCA/ICcnIDogdmFsdWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29sdW1uIGluIGxpbmUpIHtcbiAgICAgICAgX2xpbmUucHVzaChsaW5lW2NvbHVtbl0pO1xuICAgICAgfVxuICAgIH1cbiAgICBsaW5lID0gX2xpbmU7XG4gICAgX2xpbmUgPSBudWxsO1xuICB9IGVsc2UgaWYgKGNvbHVtbnMpIHtcbiAgICBsaW5lLnNwbGljZShjb2x1bW5zLmxlbmd0aCk7XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkobGluZSkpIHtcbiAgICBuZXdMaW5lID0gJyc7XG4gICAgZm9yIChpID0gbCA9IDAsIHJlZjEgPSBsaW5lLmxlbmd0aDsgMCA8PSByZWYxID8gbCA8IHJlZjEgOiBsID4gcmVmMTsgaSA9IDAgPD0gcmVmMSA/ICsrbCA6IC0tbCkge1xuICAgICAgZmllbGQgPSBsaW5lW2ldO1xuICAgICAgaWYgKHR5cGVvZiBmaWVsZCA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZmllbGQgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGZpZWxkID0gJycgKyBmaWVsZDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGZpZWxkID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgZmllbGQgPSB0aGlzLm9wdGlvbnMuZm9ybWF0dGVycy5ib29sKGZpZWxkKTtcbiAgICAgIH0gZWxzZSBpZiAoZmllbGQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIGZpZWxkID0gdGhpcy5vcHRpb25zLmZvcm1hdHRlcnMuZGF0ZShmaWVsZCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBmaWVsZCA9PT0gJ29iamVjdCcgJiYgZmllbGQgIT09IG51bGwpIHtcbiAgICAgICAgZmllbGQgPSB0aGlzLm9wdGlvbnMuZm9ybWF0dGVycy5vYmplY3QoZmllbGQpO1xuICAgICAgfVxuICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgIGNvbnRhaW5zZGVsaW1pdGVyID0gZmllbGQuaW5kZXhPZihkZWxpbWl0ZXIpID49IDA7XG4gICAgICAgIGNvbnRhaW5zUXVvdGUgPSBmaWVsZC5pbmRleE9mKHF1b3RlKSA+PSAwO1xuICAgICAgICBjb250YWluc0VzY2FwZSA9IGZpZWxkLmluZGV4T2YoZXNjYXBlKSA+PSAwICYmIChlc2NhcGUgIT09IHF1b3RlKTtcbiAgICAgICAgY29udGFpbnNMaW5lYnJlYWsgPSBmaWVsZC5pbmRleE9mKCdcXHInKSA+PSAwIHx8IGZpZWxkLmluZGV4T2YoJ1xcbicpID49IDA7XG4gICAgICAgIHNob3VsZFF1b3RlID0gY29udGFpbnNRdW90ZSB8fCBjb250YWluc2RlbGltaXRlciB8fCBjb250YWluc0xpbmVicmVhayB8fCB0aGlzLm9wdGlvbnMucXVvdGVkIHx8ICh0aGlzLm9wdGlvbnMucXVvdGVkU3RyaW5nICYmIHR5cGVvZiBsaW5lW2ldID09PSAnc3RyaW5nJyk7XG4gICAgICAgIGlmIChzaG91bGRRdW90ZSAmJiBjb250YWluc0VzY2FwZSkge1xuICAgICAgICAgIHJlZ2V4cCA9IGVzY2FwZSA9PT0gJ1xcXFwnID8gbmV3IFJlZ0V4cChlc2NhcGUgKyBlc2NhcGUsICdnJykgOiBuZXcgUmVnRXhwKGVzY2FwZSwgJ2cnKTtcbiAgICAgICAgICBmaWVsZCA9IGZpZWxkLnJlcGxhY2UocmVnZXhwLCBlc2NhcGUgKyBlc2NhcGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb250YWluc1F1b3RlKSB7XG4gICAgICAgICAgcmVnZXhwID0gbmV3IFJlZ0V4cChxdW90ZSwgJ2cnKTtcbiAgICAgICAgICBmaWVsZCA9IGZpZWxkLnJlcGxhY2UocmVnZXhwLCBlc2NhcGUgKyBxdW90ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNob3VsZFF1b3RlKSB7XG4gICAgICAgICAgZmllbGQgPSBxdW90ZSArIGZpZWxkICsgcXVvdGU7XG4gICAgICAgIH1cbiAgICAgICAgbmV3TGluZSArPSBmaWVsZDtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnF1b3RlZEVtcHR5IHx8ICgodGhpcy5vcHRpb25zLnF1b3RlZEVtcHR5ID09IG51bGwpICYmIGxpbmVbaV0gPT09ICcnICYmIHRoaXMub3B0aW9ucy5xdW90ZWRTdHJpbmcpKSB7XG4gICAgICAgIG5ld0xpbmUgKz0gcXVvdGUgKyBxdW90ZTtcbiAgICAgIH1cbiAgICAgIGlmIChpICE9PSBsaW5lLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgbmV3TGluZSArPSBkZWxpbWl0ZXI7XG4gICAgICB9XG4gICAgfVxuICAgIGxpbmUgPSBuZXdMaW5lO1xuICB9XG4gIHJldHVybiBsaW5lO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS43LjFcbnZhciBnZW5lcmF0ZSwgcGFyc2UsIHN0cmluZ2lmeSwgdHJhbnNmb3JtO1xuXG5nZW5lcmF0ZSA9IHJlcXVpcmUoJ2Nzdi1nZW5lcmF0ZScpO1xuXG5wYXJzZSA9IHJlcXVpcmUoJ2Nzdi1wYXJzZScpO1xuXG50cmFuc2Zvcm0gPSByZXF1aXJlKCdzdHJlYW0tdHJhbnNmb3JtJyk7XG5cbnN0cmluZ2lmeSA9IHJlcXVpcmUoJ2Nzdi1zdHJpbmdpZnknKTtcblxubW9kdWxlLmV4cG9ydHMuZ2VuZXJhdGUgPSBnZW5lcmF0ZTtcblxubW9kdWxlLmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcblxubW9kdWxlLmV4cG9ydHMudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuXG5tb2R1bGUuZXhwb3J0cy5zdHJpbmdpZnkgPSBzdHJpbmdpZnk7XG4iLCJ2YXIgY2xvbmUgPSByZXF1aXJlKCdjbG9uZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMsIGRlZmF1bHRzKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIE9iamVjdC5rZXlzKGRlZmF1bHRzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9uc1trZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgb3B0aW9uc1trZXldID0gY2xvbmUoZGVmYXVsdHNba2V5XSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gb3B0aW9ucztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWF0Y2hPcGVyYXRvcnNSZSA9IC9bfFxcXFx7fSgpW1xcXV4kKyo/Ll0vZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgc3RyaW5nJyk7XG5cdH1cblxuXHRyZXR1cm4gc3RyLnJlcGxhY2UobWF0Y2hPcGVyYXRvcnNSZSwgJ1xcXFwkJicpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhbnNpUmVnZXggPSByZXF1aXJlKCdhbnNpLXJlZ2V4Jyk7XG52YXIgcmUgPSBuZXcgUmVnRXhwKGFuc2lSZWdleCgpLnNvdXJjZSk7IC8vIHJlbW92ZSB0aGUgYGdgIGZsYWdcbm1vZHVsZS5leHBvcnRzID0gcmUudGVzdC5iaW5kKHJlKTtcbiIsIi8qKlxuICogbG9kYXNoIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS44LjMgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqL1xuXG4vKiogVXNlZCBhcyB0aGUgYFR5cGVFcnJvcmAgbWVzc2FnZSBmb3IgXCJGdW5jdGlvbnNcIiBtZXRob2RzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBJTkZJTklUWSA9IDEgLyAwO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggcHJvcGVydHkgbmFtZXMgd2l0aGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHJlSXNEZWVwUHJvcCA9IC9cXC58XFxbKD86W15bXFxdXSp8KFtcIiddKSg/Oig/IVxcMSlbXlxcXFxdfFxcXFwuKSo/XFwxKVxcXS8sXG4gICAgcmVJc1BsYWluUHJvcCA9IC9eXFx3KiQvLFxuICAgIHJlTGVhZGluZ0RvdCA9IC9eXFwuLyxcbiAgICByZVByb3BOYW1lID0gL1teLltcXF1dK3xcXFsoPzooLT9cXGQrKD86XFwuXFxkKyk/KXwoW1wiJ10pKCg/Oig/IVxcMilbXlxcXFxdfFxcXFwuKSo/KVxcMilcXF18KD89KD86XFwufFxcW1xcXSkoPzpcXC58XFxbXFxdfCQpKS9nO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGBcbiAqIFtzeW50YXggY2hhcmFjdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtcGF0dGVybnMpLlxuICovXG52YXIgcmVSZWdFeHBDaGFyID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nO1xuXG4vKiogVXNlZCB0byBtYXRjaCBiYWNrc2xhc2hlcyBpbiBwcm9wZXJ0eSBwYXRocy4gKi9cbnZhciByZUVzY2FwZUNoYXIgPSAvXFxcXChcXFxcKT8vZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFsdWUob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCBpbiBJRSA8IDkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0hvc3RPYmplY3QodmFsdWUpIHtcbiAgLy8gTWFueSBob3N0IG9iamVjdHMgYXJlIGBPYmplY3RgIG9iamVjdHMgdGhhdCBjYW4gY29lcmNlIHRvIHN0cmluZ3NcbiAgLy8gZGVzcGl0ZSBoYXZpbmcgaW1wcm9wZXJseSBkZWZpbmVkIGB0b1N0cmluZ2AgbWV0aG9kcy5cbiAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICBpZiAodmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUudG9TdHJpbmcgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSAhISh2YWx1ZSArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBhcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLFxuICAgIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvdmVycmVhY2hpbmcgY29yZS1qcyBzaGltcy4gKi9cbnZhciBjb3JlSnNEYXRhID0gcm9vdFsnX19jb3JlLWpzX3NoYXJlZF9fJ107XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUuICovXG52YXIgcmVJc05hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBmdW5jVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkucmVwbGFjZShyZVJlZ0V4cENoYXIsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sLFxuICAgIHNwbGljZSA9IGFycmF5UHJvdG8uc3BsaWNlO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdNYXAnKSxcbiAgICBuYXRpdmVDcmVhdGUgPSBnZXROYXRpdmUoT2JqZWN0LCAnY3JlYXRlJyk7XG5cbi8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xUb1N0cmluZyA9IHN5bWJvbFByb3RvID8gc3ltYm9sUHJvdG8udG9TdHJpbmcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGhhc2ggb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBIYXNoKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID8gZW50cmllcy5sZW5ndGggOiAwO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgaGFzaC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKi9cbmZ1bmN0aW9uIGhhc2hDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IG5hdGl2ZUNyZWF0ZSA/IG5hdGl2ZUNyZWF0ZShudWxsKSA6IHt9O1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBoYXNoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge09iamVjdH0gaGFzaCBUaGUgaGFzaCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzaERlbGV0ZShrZXkpIHtcbiAgcmV0dXJuIHRoaXMuaGFzKGtleSkgJiYgZGVsZXRlIHRoaXMuX19kYXRhX19ba2V5XTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBoYXNoIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGhhc2hHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgaWYgKG5hdGl2ZUNyZWF0ZSkge1xuICAgIHZhciByZXN1bHQgPSBkYXRhW2tleV07XG4gICAgcmV0dXJuIHJlc3VsdCA9PT0gSEFTSF9VTkRFRklORUQgPyB1bmRlZmluZWQgOiByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KSA/IGRhdGFba2V5XSA6IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBoYXNoIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoSGFzKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHJldHVybiBuYXRpdmVDcmVhdGUgPyBkYXRhW2tleV0gIT09IHVuZGVmaW5lZCA6IGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBoYXNoIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgaGFzaCBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gaGFzaFNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgZGF0YVtrZXldID0gKG5hdGl2ZUNyZWF0ZSAmJiB2YWx1ZSA9PT0gdW5kZWZpbmVkKSA/IEhBU0hfVU5ERUZJTkVEIDogdmFsdWU7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgSGFzaGAuXG5IYXNoLnByb3RvdHlwZS5jbGVhciA9IGhhc2hDbGVhcjtcbkhhc2gucHJvdG90eXBlWydkZWxldGUnXSA9IGhhc2hEZWxldGU7XG5IYXNoLnByb3RvdHlwZS5nZXQgPSBoYXNoR2V0O1xuSGFzaC5wcm90b3R5cGUuaGFzID0gaGFzaEhhcztcbkhhc2gucHJvdG90eXBlLnNldCA9IGhhc2hTZXQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBsaXN0IGNhY2hlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTGlzdENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID8gZW50cmllcy5sZW5ndGggOiAwO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBbXTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlRGVsZXRlKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGxhc3RJbmRleCA9IGRhdGEubGVuZ3RoIC0gMTtcbiAgaWYgKGluZGV4ID09IGxhc3RJbmRleCkge1xuICAgIGRhdGEucG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgc3BsaWNlLmNhbGwoZGF0YSwgaW5kZXgsIDEpO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgcmV0dXJuIGluZGV4IDwgMCA/IHVuZGVmaW5lZCA6IGRhdGFbaW5kZXhdWzFdO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlSGFzKGtleSkge1xuICByZXR1cm4gYXNzb2NJbmRleE9mKHRoaXMuX19kYXRhX18sIGtleSkgPiAtMTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBsaXN0IGNhY2hlIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBsaXN0IGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICBkYXRhLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgfSBlbHNlIHtcbiAgICBkYXRhW2luZGV4XVsxXSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTGlzdENhY2hlYC5cbkxpc3RDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBsaXN0Q2FjaGVDbGVhcjtcbkxpc3RDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbGlzdENhY2hlRGVsZXRlO1xuTGlzdENhY2hlLnByb3RvdHlwZS5nZXQgPSBsaXN0Q2FjaGVHZXQ7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmhhcyA9IGxpc3RDYWNoZUhhcztcbkxpc3RDYWNoZS5wcm90b3R5cGUuc2V0ID0gbGlzdENhY2hlU2V0O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXAgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTWFwQ2FjaGUoZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPyBlbnRyaWVzLmxlbmd0aCA6IDA7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IHtcbiAgICAnaGFzaCc6IG5ldyBIYXNoLFxuICAgICdtYXAnOiBuZXcgKE1hcCB8fCBMaXN0Q2FjaGUpLFxuICAgICdzdHJpbmcnOiBuZXcgSGFzaFxuICB9O1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVEZWxldGUoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSlbJ2RlbGV0ZSddKGtleSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgbWFwIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUdldChrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5nZXQoa2V5KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBtYXAgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUhhcyhrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5oYXMoa2V5KTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBtYXAgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbWFwIGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZVNldChrZXksIHZhbHVlKSB7XG4gIGdldE1hcERhdGEodGhpcywga2V5KS5zZXQoa2V5LCB2YWx1ZSk7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTWFwQ2FjaGVgLlxuTWFwQ2FjaGUucHJvdG90eXBlLmNsZWFyID0gbWFwQ2FjaGVDbGVhcjtcbk1hcENhY2hlLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBtYXBDYWNoZURlbGV0ZTtcbk1hcENhY2hlLnByb3RvdHlwZS5nZXQgPSBtYXBDYWNoZUdldDtcbk1hcENhY2hlLnByb3RvdHlwZS5oYXMgPSBtYXBDYWNoZUhhcztcbk1hcENhY2hlLnByb3RvdHlwZS5zZXQgPSBtYXBDYWNoZVNldDtcblxuLyoqXG4gKiBHZXRzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgYGtleWAgaXMgZm91bmQgaW4gYGFycmF5YCBvZiBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHsqfSBrZXkgVGhlIGtleSB0byBzZWFyY2ggZm9yLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgdmFsdWUsIGVsc2UgYC0xYC5cbiAqL1xuZnVuY3Rpb24gYXNzb2NJbmRleE9mKGFycmF5LCBrZXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgaWYgKGVxKGFycmF5W2xlbmd0aF1bMF0sIGtleSkpIHtcbiAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5nZXRgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVmYXVsdCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXQob2JqZWN0LCBwYXRoKSB7XG4gIHBhdGggPSBpc0tleShwYXRoLCBvYmplY3QpID8gW3BhdGhdIDogY2FzdFBhdGgocGF0aCk7XG5cbiAgdmFyIGluZGV4ID0gMCxcbiAgICAgIGxlbmd0aCA9IHBhdGgubGVuZ3RoO1xuXG4gIHdoaWxlIChvYmplY3QgIT0gbnVsbCAmJiBpbmRleCA8IGxlbmd0aCkge1xuICAgIG9iamVjdCA9IG9iamVjdFt0b0tleShwYXRoW2luZGV4KytdKV07XG4gIH1cbiAgcmV0dXJuIChpbmRleCAmJiBpbmRleCA9PSBsZW5ndGgpID8gb2JqZWN0IDogdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzTmF0aXZlYCB3aXRob3V0IGJhZCBzaGltIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSB8fCBpc01hc2tlZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSAoaXNGdW5jdGlvbih2YWx1ZSkgfHwgaXNIb3N0T2JqZWN0KHZhbHVlKSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udG9TdHJpbmdgIHdoaWNoIGRvZXNuJ3QgY29udmVydCBudWxsaXNoXG4gKiB2YWx1ZXMgdG8gZW1wdHkgc3RyaW5ncy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRvU3RyaW5nKHZhbHVlKSB7XG4gIC8vIEV4aXQgZWFybHkgZm9yIHN0cmluZ3MgdG8gYXZvaWQgYSBwZXJmb3JtYW5jZSBoaXQgaW4gc29tZSBlbnZpcm9ubWVudHMuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBzeW1ib2xUb1N0cmluZyA/IHN5bWJvbFRvU3RyaW5nLmNhbGwodmFsdWUpIDogJyc7XG4gIH1cbiAgdmFyIHJlc3VsdCA9ICh2YWx1ZSArICcnKTtcbiAgcmV0dXJuIChyZXN1bHQgPT0gJzAnICYmICgxIC8gdmFsdWUpID09IC1JTkZJTklUWSkgPyAnLTAnIDogcmVzdWx0O1xufVxuXG4vKipcbiAqIENhc3RzIGB2YWx1ZWAgdG8gYSBwYXRoIGFycmF5IGlmIGl0J3Mgbm90IG9uZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgY2FzdCBwcm9wZXJ0eSBwYXRoIGFycmF5LlxuICovXG5mdW5jdGlvbiBjYXN0UGF0aCh2YWx1ZSkge1xuICByZXR1cm4gaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IHN0cmluZ1RvUGF0aCh2YWx1ZSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgZGF0YSBmb3IgYG1hcGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIHJlZmVyZW5jZSBrZXkuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbWFwIGRhdGEuXG4gKi9cbmZ1bmN0aW9uIGdldE1hcERhdGEobWFwLCBrZXkpIHtcbiAgdmFyIGRhdGEgPSBtYXAuX19kYXRhX187XG4gIHJldHVybiBpc0tleWFibGUoa2V5KVxuICAgID8gZGF0YVt0eXBlb2Yga2V5ID09ICdzdHJpbmcnID8gJ3N0cmluZycgOiAnaGFzaCddXG4gICAgOiBkYXRhLm1hcDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IGdldFZhbHVlKG9iamVjdCwga2V5KTtcbiAgcmV0dXJuIGJhc2VJc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHByb3BlcnR5IG5hbWUgYW5kIG5vdCBhIHByb3BlcnR5IHBhdGguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkga2V5cyBvbi5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvcGVydHkgbmFtZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0tleSh2YWx1ZSwgb2JqZWN0KSB7XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgaWYgKHR5cGUgPT0gJ251bWJlcicgfHwgdHlwZSA9PSAnc3ltYm9sJyB8fCB0eXBlID09ICdib29sZWFuJyB8fFxuICAgICAgdmFsdWUgPT0gbnVsbCB8fCBpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcmVJc1BsYWluUHJvcC50ZXN0KHZhbHVlKSB8fCAhcmVJc0RlZXBQcm9wLnRlc3QodmFsdWUpIHx8XG4gICAgKG9iamVjdCAhPSBudWxsICYmIHZhbHVlIGluIE9iamVjdChvYmplY3QpKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSBmb3IgdXNlIGFzIHVuaXF1ZSBvYmplY3Qga2V5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzS2V5YWJsZSh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICh0eXBlID09ICdzdHJpbmcnIHx8IHR5cGUgPT0gJ251bWJlcicgfHwgdHlwZSA9PSAnc3ltYm9sJyB8fCB0eXBlID09ICdib29sZWFuJylcbiAgICA/ICh2YWx1ZSAhPT0gJ19fcHJvdG9fXycpXG4gICAgOiAodmFsdWUgPT09IG51bGwpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgZnVuY2AgaGFzIGl0cyBzb3VyY2UgbWFza2VkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgZnVuY2AgaXMgbWFza2VkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTWFza2VkKGZ1bmMpIHtcbiAgcmV0dXJuICEhbWFza1NyY0tleSAmJiAobWFza1NyY0tleSBpbiBmdW5jKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgc3RyaW5nYCB0byBhIHByb3BlcnR5IHBhdGggYXJyYXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSBwYXRoIGFycmF5LlxuICovXG52YXIgc3RyaW5nVG9QYXRoID0gbWVtb2l6ZShmdW5jdGlvbihzdHJpbmcpIHtcbiAgc3RyaW5nID0gdG9TdHJpbmcoc3RyaW5nKTtcblxuICB2YXIgcmVzdWx0ID0gW107XG4gIGlmIChyZUxlYWRpbmdEb3QudGVzdChzdHJpbmcpKSB7XG4gICAgcmVzdWx0LnB1c2goJycpO1xuICB9XG4gIHN0cmluZy5yZXBsYWNlKHJlUHJvcE5hbWUsIGZ1bmN0aW9uKG1hdGNoLCBudW1iZXIsIHF1b3RlLCBzdHJpbmcpIHtcbiAgICByZXN1bHQucHVzaChxdW90ZSA/IHN0cmluZy5yZXBsYWNlKHJlRXNjYXBlQ2hhciwgJyQxJykgOiAobnVtYmVyIHx8IG1hdGNoKSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufSk7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyBrZXkgaWYgaXQncyBub3QgYSBzdHJpbmcgb3Igc3ltYm9sLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBpbnNwZWN0LlxuICogQHJldHVybnMge3N0cmluZ3xzeW1ib2x9IFJldHVybnMgdGhlIGtleS5cbiAqL1xuZnVuY3Rpb24gdG9LZXkodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJyB8fCBpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgdmFyIHJlc3VsdCA9ICh2YWx1ZSArICcnKTtcbiAgcmV0dXJuIChyZXN1bHQgPT0gJzAnICYmICgxIC8gdmFsdWUpID09IC1JTkZJTklUWSkgPyAnLTAnIDogcmVzdWx0O1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGBmdW5jYCB0byBpdHMgc291cmNlIGNvZGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzb3VyY2UgY29kZS5cbiAqL1xuZnVuY3Rpb24gdG9Tb3VyY2UoZnVuYykge1xuICBpZiAoZnVuYyAhPSBudWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmdW5jVG9TdHJpbmcuY2FsbChmdW5jKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGZ1bmMgKyAnJyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgbWVtb2l6ZXMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuIElmIGByZXNvbHZlcmAgaXNcbiAqIHByb3ZpZGVkLCBpdCBkZXRlcm1pbmVzIHRoZSBjYWNoZSBrZXkgZm9yIHN0b3JpbmcgdGhlIHJlc3VsdCBiYXNlZCBvbiB0aGVcbiAqIGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24uIEJ5IGRlZmF1bHQsIHRoZSBmaXJzdCBhcmd1bWVudFxuICogcHJvdmlkZWQgdG8gdGhlIG1lbW9pemVkIGZ1bmN0aW9uIGlzIHVzZWQgYXMgdGhlIG1hcCBjYWNoZSBrZXkuIFRoZSBgZnVuY2BcbiAqIGlzIGludm9rZWQgd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlIG1lbW9pemVkIGZ1bmN0aW9uLlxuICpcbiAqICoqTm90ZToqKiBUaGUgY2FjaGUgaXMgZXhwb3NlZCBhcyB0aGUgYGNhY2hlYCBwcm9wZXJ0eSBvbiB0aGUgbWVtb2l6ZWRcbiAqIGZ1bmN0aW9uLiBJdHMgY3JlYXRpb24gbWF5IGJlIGN1c3RvbWl6ZWQgYnkgcmVwbGFjaW5nIHRoZSBgXy5tZW1vaXplLkNhY2hlYFxuICogY29uc3RydWN0b3Igd2l0aCBvbmUgd2hvc2UgaW5zdGFuY2VzIGltcGxlbWVudCB0aGVcbiAqIFtgTWFwYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtcHJvcGVydGllcy1vZi10aGUtbWFwLXByb3RvdHlwZS1vYmplY3QpXG4gKiBtZXRob2QgaW50ZXJmYWNlIG9mIGBkZWxldGVgLCBgZ2V0YCwgYGhhc2AsIGFuZCBgc2V0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGhhdmUgaXRzIG91dHB1dCBtZW1vaXplZC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtyZXNvbHZlcl0gVGhlIGZ1bmN0aW9uIHRvIHJlc29sdmUgdGhlIGNhY2hlIGtleS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IG1lbW9pemVkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEsICdiJzogMiB9O1xuICogdmFyIG90aGVyID0geyAnYyc6IDMsICdkJzogNCB9O1xuICpcbiAqIHZhciB2YWx1ZXMgPSBfLm1lbW9pemUoXy52YWx1ZXMpO1xuICogdmFsdWVzKG9iamVjdCk7XG4gKiAvLyA9PiBbMSwgMl1cbiAqXG4gKiB2YWx1ZXMob3RoZXIpO1xuICogLy8gPT4gWzMsIDRdXG4gKlxuICogb2JqZWN0LmEgPSAyO1xuICogdmFsdWVzKG9iamVjdCk7XG4gKiAvLyA9PiBbMSwgMl1cbiAqXG4gKiAvLyBNb2RpZnkgdGhlIHJlc3VsdCBjYWNoZS5cbiAqIHZhbHVlcy5jYWNoZS5zZXQob2JqZWN0LCBbJ2EnLCAnYiddKTtcbiAqIHZhbHVlcyhvYmplY3QpO1xuICogLy8gPT4gWydhJywgJ2InXVxuICpcbiAqIC8vIFJlcGxhY2UgYF8ubWVtb2l6ZS5DYWNoZWAuXG4gKiBfLm1lbW9pemUuQ2FjaGUgPSBXZWFrTWFwO1xuICovXG5mdW5jdGlvbiBtZW1vaXplKGZ1bmMsIHJlc29sdmVyKSB7XG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nIHx8IChyZXNvbHZlciAmJiB0eXBlb2YgcmVzb2x2ZXIgIT0gJ2Z1bmN0aW9uJykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgdmFyIG1lbW9pemVkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgIGtleSA9IHJlc29sdmVyID8gcmVzb2x2ZXIuYXBwbHkodGhpcywgYXJncykgOiBhcmdzWzBdLFxuICAgICAgICBjYWNoZSA9IG1lbW9pemVkLmNhY2hlO1xuXG4gICAgaWYgKGNhY2hlLmhhcyhrZXkpKSB7XG4gICAgICByZXR1cm4gY2FjaGUuZ2V0KGtleSk7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIG1lbW9pemVkLmNhY2hlID0gY2FjaGUuc2V0KGtleSwgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBtZW1vaXplZC5jYWNoZSA9IG5ldyAobWVtb2l6ZS5DYWNoZSB8fCBNYXBDYWNoZSk7XG4gIHJldHVybiBtZW1vaXplZDtcbn1cblxuLy8gQXNzaWduIGNhY2hlIHRvIGBfLm1lbW9pemVgLlxubWVtb2l6ZS5DYWNoZSA9IE1hcENhY2hlO1xuXG4vKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2EnOiAxIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOC05IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5IGFuZCBvdGhlciBjb25zdHJ1Y3RvcnMuXG4gIHZhciB0YWcgPSBpc09iamVjdCh2YWx1ZSkgPyBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcuIEFuIGVtcHR5IHN0cmluZyBpcyByZXR1cm5lZCBmb3IgYG51bGxgXG4gKiBhbmQgYHVuZGVmaW5lZGAgdmFsdWVzLiBUaGUgc2lnbiBvZiBgLTBgIGlzIHByZXNlcnZlZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b1N0cmluZyhudWxsKTtcbiAqIC8vID0+ICcnXG4gKlxuICogXy50b1N0cmluZygtMCk7XG4gKiAvLyA9PiAnLTAnXG4gKlxuICogXy50b1N0cmluZyhbMSwgMiwgM10pO1xuICogLy8gPT4gJzEsMiwzJ1xuICovXG5mdW5jdGlvbiB0b1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogYmFzZVRvU3RyaW5nKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBgcGF0aGAgb2YgYG9iamVjdGAuIElmIHRoZSByZXNvbHZlZCB2YWx1ZSBpc1xuICogYHVuZGVmaW5lZGAsIHRoZSBgZGVmYXVsdFZhbHVlYCBpcyByZXR1cm5lZCBpbiBpdHMgcGxhY2UuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjcuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEBwYXJhbSB7Kn0gW2RlZmF1bHRWYWx1ZV0gVGhlIHZhbHVlIHJldHVybmVkIGZvciBgdW5kZWZpbmVkYCByZXNvbHZlZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogW3sgJ2InOiB7ICdjJzogMyB9IH1dIH07XG4gKlxuICogXy5nZXQob2JqZWN0LCAnYVswXS5iLmMnKTtcbiAqIC8vID0+IDNcbiAqXG4gKiBfLmdldChvYmplY3QsIFsnYScsICcwJywgJ2InLCAnYyddKTtcbiAqIC8vID0+IDNcbiAqXG4gKiBfLmdldChvYmplY3QsICdhLmIuYycsICdkZWZhdWx0Jyk7XG4gKiAvLyA9PiAnZGVmYXVsdCdcbiAqL1xuZnVuY3Rpb24gZ2V0KG9iamVjdCwgcGF0aCwgZGVmYXVsdFZhbHVlKSB7XG4gIHZhciByZXN1bHQgPSBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IGJhc2VHZXQob2JqZWN0LCBwYXRoKTtcbiAgcmV0dXJuIHJlc3VsdCA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbHVlIDogcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldDtcbiIsIi8qIVxyXG4gKiBAbmFtZSBKYXZhU2NyaXB0L05vZGVKUyBNZXJnZSB2MS4yLjBcclxuICogQGF1dGhvciB5ZWlrb3NcclxuICogQHJlcG9zaXRvcnkgaHR0cHM6Ly9naXRodWIuY29tL3llaWtvcy9qcy5tZXJnZVxyXG5cclxuICogQ29weXJpZ2h0IDIwMTQgeWVpa29zIC0gTUlUIGxpY2Vuc2VcclxuICogaHR0cHM6Ly9yYXcuZ2l0aHViLmNvbS95ZWlrb3MvanMubWVyZ2UvbWFzdGVyL0xJQ0VOU0VcclxuICovXHJcblxyXG47KGZ1bmN0aW9uKGlzTm9kZSkge1xyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZSBvbmUgb3IgbW9yZSBvYmplY3RzIFxyXG5cdCAqIEBwYXJhbSBib29sPyBjbG9uZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCwuLi4gYXJndW1lbnRzXHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHJcblx0dmFyIFB1YmxpYyA9IGZ1bmN0aW9uKGNsb25lKSB7XHJcblxyXG5cdFx0cmV0dXJuIG1lcmdlKGNsb25lID09PSB0cnVlLCBmYWxzZSwgYXJndW1lbnRzKTtcclxuXHJcblx0fSwgcHVibGljTmFtZSA9ICdtZXJnZSc7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIHR3byBvciBtb3JlIG9iamVjdHMgcmVjdXJzaXZlbHkgXHJcblx0ICogQHBhcmFtIGJvb2w/IGNsb25lXHJcblx0ICogQHBhcmFtIG1peGVkLC4uLiBhcmd1bWVudHNcclxuXHQgKiBAcmV0dXJuIG9iamVjdFxyXG5cdCAqL1xyXG5cclxuXHRQdWJsaWMucmVjdXJzaXZlID0gZnVuY3Rpb24oY2xvbmUpIHtcclxuXHJcblx0XHRyZXR1cm4gbWVyZ2UoY2xvbmUgPT09IHRydWUsIHRydWUsIGFyZ3VtZW50cyk7XHJcblxyXG5cdH07XHJcblxyXG5cdC8qKlxyXG5cdCAqIENsb25lIHRoZSBpbnB1dCByZW1vdmluZyBhbnkgcmVmZXJlbmNlXHJcblx0ICogQHBhcmFtIG1peGVkIGlucHV0XHJcblx0ICogQHJldHVybiBtaXhlZFxyXG5cdCAqL1xyXG5cclxuXHRQdWJsaWMuY2xvbmUgPSBmdW5jdGlvbihpbnB1dCkge1xyXG5cclxuXHRcdHZhciBvdXRwdXQgPSBpbnB1dCxcclxuXHRcdFx0dHlwZSA9IHR5cGVPZihpbnB1dCksXHJcblx0XHRcdGluZGV4LCBzaXplO1xyXG5cclxuXHRcdGlmICh0eXBlID09PSAnYXJyYXknKSB7XHJcblxyXG5cdFx0XHRvdXRwdXQgPSBbXTtcclxuXHRcdFx0c2l6ZSA9IGlucHV0Lmxlbmd0aDtcclxuXHJcblx0XHRcdGZvciAoaW5kZXg9MDtpbmRleDxzaXplOysraW5kZXgpXHJcblxyXG5cdFx0XHRcdG91dHB1dFtpbmRleF0gPSBQdWJsaWMuY2xvbmUoaW5wdXRbaW5kZXhdKTtcclxuXHJcblx0XHR9IGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XHJcblxyXG5cdFx0XHRvdXRwdXQgPSB7fTtcclxuXHJcblx0XHRcdGZvciAoaW5kZXggaW4gaW5wdXQpXHJcblxyXG5cdFx0XHRcdG91dHB1dFtpbmRleF0gPSBQdWJsaWMuY2xvbmUoaW5wdXRbaW5kZXhdKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dHB1dDtcclxuXHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2UgdHdvIG9iamVjdHMgcmVjdXJzaXZlbHlcclxuXHQgKiBAcGFyYW0gbWl4ZWQgaW5wdXRcclxuXHQgKiBAcGFyYW0gbWl4ZWQgZXh0ZW5kXHJcblx0ICogQHJldHVybiBtaXhlZFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtZXJnZV9yZWN1cnNpdmUoYmFzZSwgZXh0ZW5kKSB7XHJcblxyXG5cdFx0aWYgKHR5cGVPZihiYXNlKSAhPT0gJ29iamVjdCcpXHJcblxyXG5cdFx0XHRyZXR1cm4gZXh0ZW5kO1xyXG5cclxuXHRcdGZvciAodmFyIGtleSBpbiBleHRlbmQpIHtcclxuXHJcblx0XHRcdGlmICh0eXBlT2YoYmFzZVtrZXldKSA9PT0gJ29iamVjdCcgJiYgdHlwZU9mKGV4dGVuZFtrZXldKSA9PT0gJ29iamVjdCcpIHtcclxuXHJcblx0XHRcdFx0YmFzZVtrZXldID0gbWVyZ2VfcmVjdXJzaXZlKGJhc2Vba2V5XSwgZXh0ZW5kW2tleV0pO1xyXG5cclxuXHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0YmFzZVtrZXldID0gZXh0ZW5kW2tleV07XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBiYXNlO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIHR3byBvciBtb3JlIG9iamVjdHNcclxuXHQgKiBAcGFyYW0gYm9vbCBjbG9uZVxyXG5cdCAqIEBwYXJhbSBib29sIHJlY3Vyc2l2ZVxyXG5cdCAqIEBwYXJhbSBhcnJheSBhcmd2XHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWVyZ2UoY2xvbmUsIHJlY3Vyc2l2ZSwgYXJndikge1xyXG5cclxuXHRcdHZhciByZXN1bHQgPSBhcmd2WzBdLFxyXG5cdFx0XHRzaXplID0gYXJndi5sZW5ndGg7XHJcblxyXG5cdFx0aWYgKGNsb25lIHx8IHR5cGVPZihyZXN1bHQpICE9PSAnb2JqZWN0JylcclxuXHJcblx0XHRcdHJlc3VsdCA9IHt9O1xyXG5cclxuXHRcdGZvciAodmFyIGluZGV4PTA7aW5kZXg8c2l6ZTsrK2luZGV4KSB7XHJcblxyXG5cdFx0XHR2YXIgaXRlbSA9IGFyZ3ZbaW5kZXhdLFxyXG5cclxuXHRcdFx0XHR0eXBlID0gdHlwZU9mKGl0ZW0pO1xyXG5cclxuXHRcdFx0aWYgKHR5cGUgIT09ICdvYmplY3QnKSBjb250aW51ZTtcclxuXHJcblx0XHRcdGZvciAodmFyIGtleSBpbiBpdGVtKSB7XHJcblxyXG5cdFx0XHRcdHZhciBzaXRlbSA9IGNsb25lID8gUHVibGljLmNsb25lKGl0ZW1ba2V5XSkgOiBpdGVtW2tleV07XHJcblxyXG5cdFx0XHRcdGlmIChyZWN1cnNpdmUpIHtcclxuXHJcblx0XHRcdFx0XHRyZXN1bHRba2V5XSA9IG1lcmdlX3JlY3Vyc2l2ZShyZXN1bHRba2V5XSwgc2l0ZW0pO1xyXG5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRcdHJlc3VsdFtrZXldID0gc2l0ZW07XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdHlwZSBvZiB2YXJpYWJsZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCBpbnB1dFxyXG5cdCAqIEByZXR1cm4gc3RyaW5nXHJcblx0ICpcclxuXHQgKiBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL3R5cGVvZnZhclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0eXBlT2YoaW5wdXQpIHtcclxuXHJcblx0XHRyZXR1cm4gKHt9KS50b1N0cmluZy5jYWxsKGlucHV0KS5zbGljZSg4LCAtMSkudG9Mb3dlckNhc2UoKTtcclxuXHJcblx0fVxyXG5cclxuXHRpZiAoaXNOb2RlKSB7XHJcblxyXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBQdWJsaWM7XHJcblxyXG5cdH0gZWxzZSB7XHJcblxyXG5cdFx0d2luZG93W3B1YmxpY05hbWVdID0gUHVibGljO1xyXG5cclxuXHR9XHJcblxyXG59KSh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBzbWFydFdyYXAodGV4dCxvcHRpb25zKXtcblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGV0IE1lcmdlID0gcmVxdWlyZSgnbWVyZ2UnKTtcbiAgbGV0IFdjd2lkdGggPSByZXF1aXJlKCd3Y3dpZHRoJyk7XG4gIGxldCBCcmVha3dvcmQgPSByZXF1aXJlKCdicmVha3dvcmQnKTtcbiAgXG4gIGxldCBkZWZhdWx0cyA9IHt9O1xuICBkZWZhdWx0cy5jYWxjdWxhdGVTcGFjZVJlbWFpbmluZyA9IGZ1bmN0aW9uKG9iaixpKXsvL2kgaXMgaW4gY2FzZSBzb21lb25lIHdhbnRzIHRvIGN1c3RvbWl6ZSBiYXNlZCBvbiBsaW5lIGluZGV4XG4gICAgcmV0dXJuIE1hdGgubWF4KG9iai5saW5lTGVuZ3RoIC0gb2JqLnNwYWNlc1VzZWQgLSBvYmoucGFkZGluZ0xlZnQgLSBvYmoucGFkZGluZ1JpZ2h0LDApO1xuICB9OyAvL2Z1bmN0aW9uIHRvIHNldCBzdGFydGluZyBsaW5lIGxlbmd0aFxuICBkZWZhdWx0cy5jdXJyZW50TGluZSA9IDA7IC8vaW5kZXggb2YgY3VycmVudCBsaW5lIGluICdsaW5lc1tdJ1xuICBkZWZhdWx0cy5pbnB1dCA9IFtdOyAvL2lucHV0IHN0cmluZyBzcGxpdCBieSB3aGl0ZXNwYWNlIFxuICBkZWZhdWx0cy5saW5lcyA9IFtcbiAgICBbXVxuICBdOyAvL2Fzc3VtZSBhdCBsZWFzdCBvbmUgbGluZVxuICBkZWZhdWx0cy5taW5XaWR0aCA9IDI7IC8vZmFsbGJhY2sgdG8gaWYgd2lkdGggc2V0IHRvbyBuYXJyb3dcbiAgZGVmYXVsdHMucGFkZGluZ0xlZnQgPSAwO1xuICBkZWZhdWx0cy5wYWRkaW5nUmlnaHQgPSAwO1xuICBkZWZhdWx0cy5yZXR1cm5Gb3JtYXQgPSAnc3RyaW5nJzsgLy9vciAnYXJyYXknXG4gIGRlZmF1bHRzLnNraXBQYWRkaW5nID0gZmFsc2U7IC8vc2V0IHRvIHRydWUgd2hlbiBwYWRkaW5nIHNldCB0b28gd2lkZSBmb3IgbGluZSBsZW5ndGhcbiAgZGVmYXVsdHMuc3BhY2VzVXNlZCA9IDA7IC8vc3BhY2VzIHVzZWQgc28gZmFyIG9uIGN1cnJlbnQgbGluZVxuICBkZWZhdWx0cy5zcGxpdEF0ID0gW1wiIFwiLFwiXFx0XCJdO1xuICBkZWZhdWx0cy50cmltID0gdHJ1ZTtcbiAgZGVmYXVsdHMud2lkdGggPSAxMDsgXG4gIGRlZmF1bHRzLndvcmRzID0gW107XG4gIFxuICBsZXQgd3JhcE9iaiA9IE1lcmdlKHt9LGRlZmF1bHRzLG9wdGlvbnMpO1xuXG4gIC8vbWFrZSBzdXJlIGNvcnJlY3Qgc2lnbiBvbiBwYWRkaW5nXG4gIHdyYXBPYmoucGFkZGluZ0xlZnQgPSBNYXRoLmFicyh3cmFwT2JqLnBhZGRpbmdMZWZ0KTtcbiAgd3JhcE9iai5wYWRkaW5nUmlnaHQgPSBNYXRoLmFicyh3cmFwT2JqLnBhZGRpbmdSaWdodCk7XG5cbiAgd3JhcE9iai5saW5lTGVuZ3RoID0gd3JhcE9iai53aWR0aCAtXG4gICB3cmFwT2JqLnBhZGRpbmdMZWZ0IC1cbiAgIHdyYXBPYmoucGFkZGluZ1JpZ2h0O1xuICBcbiAgaWYod3JhcE9iai5saW5lTGVuZ3RoIDwgd3JhcE9iai5taW5XaWR0aCl7XG4gICAgLy9za2lwIHBhZGRpbmcgaWYgbGluZUxlbmd0aCB0b28gbmFycm93XG4gICAgd3JhcE9iai5za2lwUGFkZGluZyA9IHRydWU7XG4gICAgd3JhcE9iai5saW5lTGVuZ3RoID0gd3JhcE9iai5taW5XaWR0aDtcbiAgfVxuICBlbHNle1xuICAgIC8vcmVzaXplIGxpbmUgbGVuZ3RoIHRvIGluY2x1ZGUgcGFkZGluZ1xuICAgIHdyYXBPYmoubGluZUxlbmd0aCA9IHdyYXBPYmoubGluZUxlbmd0aDtcbiAgfVxuICAvL0JyZWFrIGlucHV0IGludG8gYXJyYXkgb2YgY2hhcmFjdGVycyBzcGxpdCBieSB3aGl0ZXNwYWNlIGFuZC9vciB0YWJzXG4gIGxldCB1bmZpbHRlcmVkV29yZHMgPSBbXTtcblxuICAvL3RvIHRyaW0gb3Igbm90IHRvIHRyaW0uLi5cbiAgbGV0IG1vZGlmaWVkVGV4dCA9IHRleHQudG9TdHJpbmcoKTtcbiAgaWYod3JhcE9iai50cmltKXtcbiAgICBtb2RpZmllZFRleHQgPSBtb2RpZmllZFRleHQudHJpbSgpO1xuICB9XG4gIFxuICBpZih3cmFwT2JqLnNwbGl0QXQuaW5kZXhPZignXFx0JykhPT0tMSl7XG4gICAgLy9zcGxpdCBhdCBib3RoIHNwYWNlcyBhbmQgdGFic1xuICAgIHVuZmlsdGVyZWRXb3JkcyA9IG1vZGlmaWVkVGV4dC5zcGxpdCgvIHxcXHQvaSk7XG4gIH1cbiAgZWxzZXtcbiAgICAvL3NwbGl0IGF0IHdoaXRlc3BhY2VcbiAgICB1bmZpbHRlcmVkV29yZHMgPSBtb2RpZmllZFRleHQuc3BsaXQoJyAnKTtcbiAgfVxuICBcbiAgLy9yZW1vdmUgZW1wdHkgYXJyYXkgZWxlbWVudHNcbiAgdW5maWx0ZXJlZFdvcmRzLmZvckVhY2goZnVuY3Rpb24odmFsKXtcbiAgICBpZiAodmFsLmxlbmd0aCA+IDApe1xuICAgICAgd3JhcE9iai53b3Jkcy5wdXNoKHZhbCk7XG4gICAgfVxuICB9KTtcblxuICBsZXQgaSxcbiAgICAgIHNwYWNlUmVtYWluaW5nLFxuICAgICAgc3BsaXRJbmRleCxcbiAgICAgIHdvcmQsXG4gICAgICB3b3JkbGVuZ3RoO1xuXG4gIHdoaWxlKHdyYXBPYmoud29yZHMubGVuZ3RoID4gMCl7XG4gICAgc3BhY2VSZW1haW5pbmcgPSB3cmFwT2JqLmNhbGN1bGF0ZVNwYWNlUmVtYWluaW5nKHdyYXBPYmopO1xuICAgIHdvcmQgPSB3cmFwT2JqLndvcmRzLnNoaWZ0KCk7XG4gICAgd29yZGxlbmd0aCA9IFdjd2lkdGgod29yZCk7XG4gICAgXG4gICAgc3dpdGNoKHRydWUpe1xuICAgICAgLy8xLSBXb3JkIGlzIHRvbyBsb25nIGZvciBhbiBlbXB0eSBsaW5lIGFuZCBtdXN0IGJlIGJyb2tlblxuICAgICAgY2FzZSh3cmFwT2JqLmxpbmVMZW5ndGggPCB3b3JkbGVuZ3RoKTpcbiAgICAgICAgLy9CcmVhayBpdCwgdGhlbiByZS1pbnNlcnQgaXRzIHBhcnRzIGludG8gd3JhcE9iai53b3Jkc1xuICAgICAgICAvL3NvIGNhbiBsb29wIGJhY2sgdG8gcmUtaGFuZGxlIGVhY2ggd29yZFxuICAgICAgICBzcGxpdEluZGV4ID0gQnJlYWt3b3JkKHdvcmQsd3JhcE9iai5saW5lTGVuZ3RoKTtcbiAgICAgICAgd3JhcE9iai53b3Jkcy51bnNoaWZ0KHdvcmQuc3Vic3RyKDAsc3BsaXRJbmRleCArIDEpKTsgLy8rMSBmb3Igc3Vic3RyIGZuXG4gICAgICAgIHdyYXBPYmoud29yZHMuc3BsaWNlKDEsMCx3b3JkLnN1YnN0cihzcGxpdEluZGV4ICsgMSkpOy8vKzEgZm9yIHN1YnN0ciBmblxuICAgICAgICBicmVhaztcblxuICAgICAgLy8yLSBXb3JkIGlzIHRvbyBsb25nIGZvciBjdXJyZW50IGxpbmUgYW5kIG11c3QgYmUgd3JhcHBlZFxuICAgICAgY2FzZShzcGFjZVJlbWFpbmluZyA8IHdvcmRsZW5ndGgpOlxuICAgICAgICAvL2FkZCBhIG5ldyBsaW5lIHRvIG91ciBhcnJheSBvZiBsaW5lc1xuICAgICAgICB3cmFwT2JqLmxpbmVzLnB1c2goW10pO1xuICAgICAgICAvL25vdGUgY2FycmlhZ2UgdG8gbmV3IGxpbmUgaW4gY291bnRlclxuICAgICAgICB3cmFwT2JqLmN1cnJlbnRMaW5lKys7XG4gICAgICAgIC8vcmVzZXQgdGhlIHNwYWNlc1VzZWQgdG8gMFxuICAgICAgICB3cmFwT2JqLnNwYWNlc1VzZWQgPSAwO1xuICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG5cbiAgICAgIC8vMy0gV29yZCBmaXRzIG9uIGN1cnJlbnQgbGluZVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy9hZGQgd29yZCB0byBsaW5lXG4gICAgICAgIHdyYXBPYmoubGluZXNbd3JhcE9iai5jdXJyZW50TGluZV0ucHVzaCh3b3JkKTtcbiAgICAgICAgLy9yZWR1Y2Ugc3BhY2UgcmVtYWluaW5nIChhZGQgYSBzcGFjZSBiZXR3ZWVuIHdvcmRzKVxuICAgICAgICB3cmFwT2JqLnNwYWNlc1VzZWQgKz0gd29yZGxlbmd0aCArIDE7XG4gICAgICAgIC8vaW5jcmVtZW50IGl0ZXJhdG9yXG4gICAgICAgIGkrKztcbiAgICB9XG4gIH1cblxuICBpZih3cmFwT2JqLnJldHVybkZvcm1hdCA9PT0gJ2FycmF5Jyl7XG4gICAgcmV0dXJuIHdyYXBPYmoubGluZXM7XG4gIH1cbiAgZWxzZXtcbiAgICBsZXQgbGluZXMgPSB3cmFwT2JqLmxpbmVzLm1hcChmdW5jdGlvbihsaW5lKXtcbiAgICAgIC8vcmVzdG9yZSBzcGFjZXMgdG8gbGluZVxuICAgICAgbGluZSA9IGxpbmUuam9pbignXFwgJyk7XG4gICAgICAvL2FkZCBwYWRkaW5nIHRvIGVuZHMgb2YgbGluZVxuICAgICAgaWYoIXdyYXBPYmouc2tpcFBhZGRpbmcpe1xuICAgICAgICBsaW5lID0gQXJyYXkod3JhcE9iai5wYWRkaW5nTGVmdCsxKS5qb2luKCdcXCAnKSArXG4gICAgICAgICAgICAgbGluZSArXG4gICAgICAgICAgICAgQXJyYXkod3JhcE9iai5wYWRkaW5nUmlnaHQrMSkuam9pbignXFwgJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGluZTtcbiAgICB9KTtcbiAgICAvL3JldHVybiBhcyBzdHJpbmdcbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7ICBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNtYXJ0V3JhcDtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjJcbnZhciBUcmFuc2Zvcm1lciwgc3RyZWFtLCB1dGlsLFxuICBzbGljZSA9IFtdLnNsaWNlO1xuXG5zdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcblxudXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGFyZ3VtZW50LCBjYWxsYmFjaywgZGF0YSwgZXJyb3IsIGhhbmRsZXIsIGksIGosIGssIGxlbiwgb3B0aW9ucywgcmVzdWx0LCB0cmFuc2Zvcm0sIHR5cGUsIHY7XG4gIG9wdGlvbnMgPSB7fTtcbiAgZm9yIChpID0gaiA9IDAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGogPCBsZW47IGkgPSArK2opIHtcbiAgICBhcmd1bWVudCA9IGFyZ3VtZW50c1tpXTtcbiAgICB0eXBlID0gdHlwZW9mIGFyZ3VtZW50O1xuICAgIGlmIChhcmd1bWVudCA9PT0gbnVsbCkge1xuICAgICAgdHlwZSA9ICdudWxsJztcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnICYmIEFycmF5LmlzQXJyYXkoYXJndW1lbnQpKSB7XG4gICAgICB0eXBlID0gJ2FycmF5JztcbiAgICB9XG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIGlmICh0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGhhbmRsZXIgPSBhcmd1bWVudDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSAhPT0gbnVsbCkge1xuICAgICAgICBkYXRhID0gYXJndW1lbnQ7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKGsgaW4gYXJndW1lbnQpIHtcbiAgICAgICAgdiA9IGFyZ3VtZW50W2tdO1xuICAgICAgICBvcHRpb25zW2tdID0gdjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChoYW5kbGVyICYmIGkgPT09IGFyZ3VtZW50cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGNhbGxiYWNrID0gYXJndW1lbnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoYW5kbGVyID0gYXJndW1lbnQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlICE9PSAnbnVsbCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcmd1bWVudHMnKTtcbiAgICB9XG4gIH1cbiAgdHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybWVyKG9wdGlvbnMsIGhhbmRsZXIpO1xuICBlcnJvciA9IGZhbHNlO1xuICBpZiAoZGF0YSkge1xuICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVuMSwgbSwgcm93O1xuICAgICAgZm9yIChtID0gMCwgbGVuMSA9IGRhdGEubGVuZ3RoOyBtIDwgbGVuMTsgbSsrKSB7XG4gICAgICAgIHJvdyA9IGRhdGFbbV07XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zZm9ybS53cml0ZShyb3cpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRyYW5zZm9ybS5lbmQoKTtcbiAgICB9KTtcbiAgfVxuICBpZiAoY2FsbGJhY2sgfHwgb3B0aW9ucy5jb25zdW1lKSB7XG4gICAgcmVzdWx0ID0gW107XG4gICAgdHJhbnNmb3JtLm9uKCdyZWFkYWJsZScsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHIsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICB3aGlsZSAoKHIgPSB0cmFuc2Zvcm0ucmVhZCgpKSkge1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0LnB1c2gocikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9KTtcbiAgICB0cmFuc2Zvcm0ub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBlcnJvciA9IHRydWU7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdHJhbnNmb3JtLm9uKCdlbmQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChjYWxsYmFjayAmJiAhZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHRyYW5zZm9ybTtcbn07XG5cblRyYW5zZm9ybWVyID0gZnVuY3Rpb24ob3B0aW9uczEsIHRyYW5zZm9ybTEpIHtcbiAgdmFyIGJhc2U7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMxICE9IG51bGwgPyBvcHRpb25zMSA6IHt9O1xuICB0aGlzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybTE7XG4gIHRoaXMub3B0aW9ucy5vYmplY3RNb2RlID0gdHJ1ZTtcbiAgaWYgKChiYXNlID0gdGhpcy5vcHRpb25zKS5wYXJhbGxlbCA9PSBudWxsKSB7XG4gICAgYmFzZS5wYXJhbGxlbCA9IDEwMDtcbiAgfVxuICBzdHJlYW0uVHJhbnNmb3JtLmNhbGwodGhpcywgdGhpcy5vcHRpb25zKTtcbiAgdGhpcy5ydW5uaW5nID0gMDtcbiAgdGhpcy5zdGFydGVkID0gMDtcbiAgdGhpcy5maW5pc2hlZCA9IDA7XG4gIHJldHVybiB0aGlzO1xufTtcblxudXRpbC5pbmhlcml0cyhUcmFuc2Zvcm1lciwgc3RyZWFtLlRyYW5zZm9ybSk7XG5cbm1vZHVsZS5leHBvcnRzLlRyYW5zZm9ybWVyID0gVHJhbnNmb3JtZXI7XG5cblRyYW5zZm9ybWVyLnByb3RvdHlwZS5fdHJhbnNmb3JtID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nLCBjYikge1xuICB2YXIgY2FsbGJhY2ssIGVyciwgbDtcbiAgdGhpcy5zdGFydGVkKys7XG4gIHRoaXMucnVubmluZysrO1xuICBpZiAodGhpcy5ydW5uaW5nIDwgdGhpcy5vcHRpb25zLnBhcmFsbGVsKSB7XG4gICAgY2IoKTtcbiAgICBjYiA9IG51bGw7XG4gIH1cbiAgdHJ5IHtcbiAgICBsID0gdGhpcy50cmFuc2Zvcm0ubGVuZ3RoO1xuICAgIGlmICh0aGlzLm9wdGlvbnMucGFyYW1zICE9IG51bGwpIHtcbiAgICAgIGwtLTtcbiAgICB9XG4gICAgaWYgKGwgPT09IDEpIHtcbiAgICAgIHRoaXMuX2RvbmUobnVsbCwgW3RoaXMudHJhbnNmb3JtLmNhbGwobnVsbCwgY2h1bmssIHRoaXMub3B0aW9ucy5wYXJhbXMpXSwgY2IpO1xuICAgIH0gZWxzZSBpZiAobCA9PT0gMikge1xuICAgICAgY2FsbGJhY2sgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBjaHVua3MsIGVycjtcbiAgICAgICAgICBlcnIgPSBhcmd1bWVudHNbMF0sIGNodW5rcyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5fZG9uZShlcnIsIGNodW5rcywgY2IpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICB0aGlzLnRyYW5zZm9ybS5jYWxsKG51bGwsIGNodW5rLCBjYWxsYmFjaywgdGhpcy5vcHRpb25zLnBhcmFtcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKFwiSW52YWxpZCBoYW5kbGVyIGFyZ3VtZW50c1wiKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICBlcnIgPSBfZXJyb3I7XG4gICAgcmV0dXJuIHRoaXMuX2RvbmUoZXJyKTtcbiAgfVxufTtcblxuVHJhbnNmb3JtZXIucHJvdG90eXBlLl9mbHVzaCA9IGZ1bmN0aW9uKGNiKSB7XG4gIHRoaXMuX2VuZGluZyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnJ1bm5pbmcgPT09IDApIHtcbiAgICAgIHJldHVybiBjYigpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHRoaXMuX2VuZGluZygpO1xufTtcblxuVHJhbnNmb3JtZXIucHJvdG90eXBlLl9kb25lID0gZnVuY3Rpb24oZXJyLCBjaHVua3MsIGNiKSB7XG4gIHZhciBjaHVuaywgaiwgbGVuO1xuICB0aGlzLnJ1bm5pbmctLTtcbiAgaWYgKGVycikge1xuICAgIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgfVxuICB0aGlzLmZpbmlzaGVkKys7XG4gIGZvciAoaiA9IDAsIGxlbiA9IGNodW5rcy5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgIGNodW5rID0gY2h1bmtzW2pdO1xuICAgIGlmICh0eXBlb2YgY2h1bmsgPT09ICdudW1iZXInKSB7XG4gICAgICBjaHVuayA9IFwiXCIgKyBjaHVuaztcbiAgICB9XG4gICAgaWYgKGNodW5rICE9IG51bGwpIHtcbiAgICAgIHRoaXMucHVzaChjaHVuayk7XG4gICAgfVxuICB9XG4gIGlmIChjYikge1xuICAgIGNiKCk7XG4gIH1cbiAgaWYgKHRoaXMuX2VuZGluZykge1xuICAgIHJldHVybiB0aGlzLl9lbmRpbmcoKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhbnNpUmVnZXggPSByZXF1aXJlKCdhbnNpLXJlZ2V4JykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdHJldHVybiB0eXBlb2Ygc3RyID09PSAnc3RyaW5nJyA/IHN0ci5yZXBsYWNlKGFuc2lSZWdleCwgJycpIDogc3RyO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhcmd2ID0gcHJvY2Vzcy5hcmd2O1xuXG52YXIgdGVybWluYXRvciA9IGFyZ3YuaW5kZXhPZignLS0nKTtcbnZhciBoYXNGbGFnID0gZnVuY3Rpb24gKGZsYWcpIHtcblx0ZmxhZyA9ICctLScgKyBmbGFnO1xuXHR2YXIgcG9zID0gYXJndi5pbmRleE9mKGZsYWcpO1xuXHRyZXR1cm4gcG9zICE9PSAtMSAmJiAodGVybWluYXRvciAhPT0gLTEgPyBwb3MgPCB0ZXJtaW5hdG9yIDogdHJ1ZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG5cdGlmICgnRk9SQ0VfQ09MT1InIGluIHByb2Nlc3MuZW52KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoaGFzRmxhZygnbm8tY29sb3InKSB8fFxuXHRcdGhhc0ZsYWcoJ25vLWNvbG9ycycpIHx8XG5cdFx0aGFzRmxhZygnY29sb3I9ZmFsc2UnKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmIChoYXNGbGFnKCdjb2xvcicpIHx8XG5cdFx0aGFzRmxhZygnY29sb3JzJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcj10cnVlJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcj1hbHdheXMnKSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKHByb2Nlc3Muc3Rkb3V0ICYmICFwcm9jZXNzLnN0ZG91dC5pc1RUWSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoJ0NPTE9SVEVSTScgaW4gcHJvY2Vzcy5lbnYpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmIChwcm9jZXNzLmVudi5URVJNID09PSAnZHVtYicpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAoL15zY3JlZW58Xnh0ZXJtfF52dDEwMHxjb2xvcnxhbnNpfGN5Z3dpbnxsaW51eC9pLnRlc3QocHJvY2Vzcy5lbnYuVEVSTSkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdHJldHVybiBmYWxzZTtcbn0pKCk7XG4iLCJ2YXIgbW9kdWxlID0gcmVxdWlyZSgnbW9kdWxlJylcbm1vZHVsZS53cmFwcGVyWzBdICs9ICdcInVzZSBzdHJpY3RcIjsnXG5PYmplY3QuZnJlZXplKG1vZHVsZS53cmFwKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBbXG4gICAgWyAweDAzMDAsIDB4MDM2RiBdLCBbIDB4MDQ4MywgMHgwNDg2IF0sIFsgMHgwNDg4LCAweDA0ODkgXSxcbiAgICBbIDB4MDU5MSwgMHgwNUJEIF0sIFsgMHgwNUJGLCAweDA1QkYgXSwgWyAweDA1QzEsIDB4MDVDMiBdLFxuICAgIFsgMHgwNUM0LCAweDA1QzUgXSwgWyAweDA1QzcsIDB4MDVDNyBdLCBbIDB4MDYwMCwgMHgwNjAzIF0sXG4gICAgWyAweDA2MTAsIDB4MDYxNSBdLCBbIDB4MDY0QiwgMHgwNjVFIF0sIFsgMHgwNjcwLCAweDA2NzAgXSxcbiAgICBbIDB4MDZENiwgMHgwNkU0IF0sIFsgMHgwNkU3LCAweDA2RTggXSwgWyAweDA2RUEsIDB4MDZFRCBdLFxuICAgIFsgMHgwNzBGLCAweDA3MEYgXSwgWyAweDA3MTEsIDB4MDcxMSBdLCBbIDB4MDczMCwgMHgwNzRBIF0sXG4gICAgWyAweDA3QTYsIDB4MDdCMCBdLCBbIDB4MDdFQiwgMHgwN0YzIF0sIFsgMHgwOTAxLCAweDA5MDIgXSxcbiAgICBbIDB4MDkzQywgMHgwOTNDIF0sIFsgMHgwOTQxLCAweDA5NDggXSwgWyAweDA5NEQsIDB4MDk0RCBdLFxuICAgIFsgMHgwOTUxLCAweDA5NTQgXSwgWyAweDA5NjIsIDB4MDk2MyBdLCBbIDB4MDk4MSwgMHgwOTgxIF0sXG4gICAgWyAweDA5QkMsIDB4MDlCQyBdLCBbIDB4MDlDMSwgMHgwOUM0IF0sIFsgMHgwOUNELCAweDA5Q0QgXSxcbiAgICBbIDB4MDlFMiwgMHgwOUUzIF0sIFsgMHgwQTAxLCAweDBBMDIgXSwgWyAweDBBM0MsIDB4MEEzQyBdLFxuICAgIFsgMHgwQTQxLCAweDBBNDIgXSwgWyAweDBBNDcsIDB4MEE0OCBdLCBbIDB4MEE0QiwgMHgwQTREIF0sXG4gICAgWyAweDBBNzAsIDB4MEE3MSBdLCBbIDB4MEE4MSwgMHgwQTgyIF0sIFsgMHgwQUJDLCAweDBBQkMgXSxcbiAgICBbIDB4MEFDMSwgMHgwQUM1IF0sIFsgMHgwQUM3LCAweDBBQzggXSwgWyAweDBBQ0QsIDB4MEFDRCBdLFxuICAgIFsgMHgwQUUyLCAweDBBRTMgXSwgWyAweDBCMDEsIDB4MEIwMSBdLCBbIDB4MEIzQywgMHgwQjNDIF0sXG4gICAgWyAweDBCM0YsIDB4MEIzRiBdLCBbIDB4MEI0MSwgMHgwQjQzIF0sIFsgMHgwQjRELCAweDBCNEQgXSxcbiAgICBbIDB4MEI1NiwgMHgwQjU2IF0sIFsgMHgwQjgyLCAweDBCODIgXSwgWyAweDBCQzAsIDB4MEJDMCBdLFxuICAgIFsgMHgwQkNELCAweDBCQ0QgXSwgWyAweDBDM0UsIDB4MEM0MCBdLCBbIDB4MEM0NiwgMHgwQzQ4IF0sXG4gICAgWyAweDBDNEEsIDB4MEM0RCBdLCBbIDB4MEM1NSwgMHgwQzU2IF0sIFsgMHgwQ0JDLCAweDBDQkMgXSxcbiAgICBbIDB4MENCRiwgMHgwQ0JGIF0sIFsgMHgwQ0M2LCAweDBDQzYgXSwgWyAweDBDQ0MsIDB4MENDRCBdLFxuICAgIFsgMHgwQ0UyLCAweDBDRTMgXSwgWyAweDBENDEsIDB4MEQ0MyBdLCBbIDB4MEQ0RCwgMHgwRDREIF0sXG4gICAgWyAweDBEQ0EsIDB4MERDQSBdLCBbIDB4MEREMiwgMHgwREQ0IF0sIFsgMHgwREQ2LCAweDBERDYgXSxcbiAgICBbIDB4MEUzMSwgMHgwRTMxIF0sIFsgMHgwRTM0LCAweDBFM0EgXSwgWyAweDBFNDcsIDB4MEU0RSBdLFxuICAgIFsgMHgwRUIxLCAweDBFQjEgXSwgWyAweDBFQjQsIDB4MEVCOSBdLCBbIDB4MEVCQiwgMHgwRUJDIF0sXG4gICAgWyAweDBFQzgsIDB4MEVDRCBdLCBbIDB4MEYxOCwgMHgwRjE5IF0sIFsgMHgwRjM1LCAweDBGMzUgXSxcbiAgICBbIDB4MEYzNywgMHgwRjM3IF0sIFsgMHgwRjM5LCAweDBGMzkgXSwgWyAweDBGNzEsIDB4MEY3RSBdLFxuICAgIFsgMHgwRjgwLCAweDBGODQgXSwgWyAweDBGODYsIDB4MEY4NyBdLCBbIDB4MEY5MCwgMHgwRjk3IF0sXG4gICAgWyAweDBGOTksIDB4MEZCQyBdLCBbIDB4MEZDNiwgMHgwRkM2IF0sIFsgMHgxMDJELCAweDEwMzAgXSxcbiAgICBbIDB4MTAzMiwgMHgxMDMyIF0sIFsgMHgxMDM2LCAweDEwMzcgXSwgWyAweDEwMzksIDB4MTAzOSBdLFxuICAgIFsgMHgxMDU4LCAweDEwNTkgXSwgWyAweDExNjAsIDB4MTFGRiBdLCBbIDB4MTM1RiwgMHgxMzVGIF0sXG4gICAgWyAweDE3MTIsIDB4MTcxNCBdLCBbIDB4MTczMiwgMHgxNzM0IF0sIFsgMHgxNzUyLCAweDE3NTMgXSxcbiAgICBbIDB4MTc3MiwgMHgxNzczIF0sIFsgMHgxN0I0LCAweDE3QjUgXSwgWyAweDE3QjcsIDB4MTdCRCBdLFxuICAgIFsgMHgxN0M2LCAweDE3QzYgXSwgWyAweDE3QzksIDB4MTdEMyBdLCBbIDB4MTdERCwgMHgxN0REIF0sXG4gICAgWyAweDE4MEIsIDB4MTgwRCBdLCBbIDB4MThBOSwgMHgxOEE5IF0sIFsgMHgxOTIwLCAweDE5MjIgXSxcbiAgICBbIDB4MTkyNywgMHgxOTI4IF0sIFsgMHgxOTMyLCAweDE5MzIgXSwgWyAweDE5MzksIDB4MTkzQiBdLFxuICAgIFsgMHgxQTE3LCAweDFBMTggXSwgWyAweDFCMDAsIDB4MUIwMyBdLCBbIDB4MUIzNCwgMHgxQjM0IF0sXG4gICAgWyAweDFCMzYsIDB4MUIzQSBdLCBbIDB4MUIzQywgMHgxQjNDIF0sIFsgMHgxQjQyLCAweDFCNDIgXSxcbiAgICBbIDB4MUI2QiwgMHgxQjczIF0sIFsgMHgxREMwLCAweDFEQ0EgXSwgWyAweDFERkUsIDB4MURGRiBdLFxuICAgIFsgMHgyMDBCLCAweDIwMEYgXSwgWyAweDIwMkEsIDB4MjAyRSBdLCBbIDB4MjA2MCwgMHgyMDYzIF0sXG4gICAgWyAweDIwNkEsIDB4MjA2RiBdLCBbIDB4MjBEMCwgMHgyMEVGIF0sIFsgMHgzMDJBLCAweDMwMkYgXSxcbiAgICBbIDB4MzA5OSwgMHgzMDlBIF0sIFsgMHhBODA2LCAweEE4MDYgXSwgWyAweEE4MEIsIDB4QTgwQiBdLFxuICAgIFsgMHhBODI1LCAweEE4MjYgXSwgWyAweEZCMUUsIDB4RkIxRSBdLCBbIDB4RkUwMCwgMHhGRTBGIF0sXG4gICAgWyAweEZFMjAsIDB4RkUyMyBdLCBbIDB4RkVGRiwgMHhGRUZGIF0sIFsgMHhGRkY5LCAweEZGRkIgXSxcbiAgICBbIDB4MTBBMDEsIDB4MTBBMDMgXSwgWyAweDEwQTA1LCAweDEwQTA2IF0sIFsgMHgxMEEwQywgMHgxMEEwRiBdLFxuICAgIFsgMHgxMEEzOCwgMHgxMEEzQSBdLCBbIDB4MTBBM0YsIDB4MTBBM0YgXSwgWyAweDFEMTY3LCAweDFEMTY5IF0sXG4gICAgWyAweDFEMTczLCAweDFEMTgyIF0sIFsgMHgxRDE4NSwgMHgxRDE4QiBdLCBbIDB4MUQxQUEsIDB4MUQxQUQgXSxcbiAgICBbIDB4MUQyNDIsIDB4MUQyNDQgXSwgWyAweEUwMDAxLCAweEUwMDAxIF0sIFsgMHhFMDAyMCwgMHhFMDA3RiBdLFxuICAgIFsgMHhFMDEwMCwgMHhFMDFFRiBdXG5dXG4iLCJcInVzZSBzdHJpY3RcIlxuXG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCdkZWZhdWx0cycpXG52YXIgY29tYmluaW5nID0gcmVxdWlyZSgnLi9jb21iaW5pbmcnKVxuXG52YXIgREVGQVVMVFMgPSB7XG4gIG51bDogMCxcbiAgY29udHJvbDogMFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHdjd2lkdGgoc3RyKSB7XG4gIHJldHVybiB3Y3N3aWR0aChzdHIsIERFRkFVTFRTKVxufVxuXG5tb2R1bGUuZXhwb3J0cy5jb25maWcgPSBmdW5jdGlvbihvcHRzKSB7XG4gIG9wdHMgPSBkZWZhdWx0cyhvcHRzIHx8IHt9LCBERUZBVUxUUylcbiAgcmV0dXJuIGZ1bmN0aW9uIHdjd2lkdGgoc3RyKSB7XG4gICAgcmV0dXJuIHdjc3dpZHRoKHN0ciwgb3B0cylcbiAgfVxufVxuXG4vKlxuICogIFRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIGRlZmluZSB0aGUgY29sdW1uIHdpZHRoIG9mIGFuIElTTyAxMDY0NlxuICogIGNoYXJhY3RlciBhcyBmb2xsb3dzOlxuICogIC0gVGhlIG51bGwgY2hhcmFjdGVyIChVKzAwMDApIGhhcyBhIGNvbHVtbiB3aWR0aCBvZiAwLlxuICogIC0gT3RoZXIgQzAvQzEgY29udHJvbCBjaGFyYWN0ZXJzIGFuZCBERUwgd2lsbCBsZWFkIHRvIGEgcmV0dXJuIHZhbHVlXG4gKiAgICBvZiAtMS5cbiAqICAtIE5vbi1zcGFjaW5nIGFuZCBlbmNsb3NpbmcgY29tYmluaW5nIGNoYXJhY3RlcnMgKGdlbmVyYWwgY2F0ZWdvcnlcbiAqICAgIGNvZGUgTW4gb3IgTWUgaW4gdGhlXG4gKiAgICBVbmljb2RlIGRhdGFiYXNlKSBoYXZlIGEgY29sdW1uIHdpZHRoIG9mIDAuXG4gKiAgLSBTT0ZUIEhZUEhFTiAoVSswMEFEKSBoYXMgYSBjb2x1bW4gd2lkdGggb2YgMS5cbiAqICAtIE90aGVyIGZvcm1hdCBjaGFyYWN0ZXJzIChnZW5lcmFsIGNhdGVnb3J5IGNvZGUgQ2YgaW4gdGhlIFVuaWNvZGVcbiAqICAgIGRhdGFiYXNlKSBhbmQgWkVSTyBXSURUSFxuICogICAgU1BBQ0UgKFUrMjAwQikgaGF2ZSBhIGNvbHVtbiB3aWR0aCBvZiAwLlxuICogIC0gSGFuZ3VsIEphbW8gbWVkaWFsIHZvd2VscyBhbmQgZmluYWwgY29uc29uYW50cyAoVSsxMTYwLVUrMTFGRilcbiAqICAgIGhhdmUgYSBjb2x1bW4gd2lkdGggb2YgMC5cbiAqICAtIFNwYWNpbmcgY2hhcmFjdGVycyBpbiB0aGUgRWFzdCBBc2lhbiBXaWRlIChXKSBvciBFYXN0IEFzaWFuXG4gKiAgICBGdWxsLXdpZHRoIChGKSBjYXRlZ29yeSBhc1xuICogICAgZGVmaW5lZCBpbiBVbmljb2RlIFRlY2huaWNhbCBSZXBvcnQgIzExIGhhdmUgYSBjb2x1bW4gd2lkdGggb2YgMi5cbiAqICAtIEFsbCByZW1haW5pbmcgY2hhcmFjdGVycyAoaW5jbHVkaW5nIGFsbCBwcmludGFibGUgSVNPIDg4NTktMSBhbmRcbiAqICAgIFdHTDQgY2hhcmFjdGVycywgVW5pY29kZSBjb250cm9sIGNoYXJhY3RlcnMsIGV0Yy4pIGhhdmUgYSBjb2x1bW5cbiAqICAgIHdpZHRoIG9mIDEuXG4gKiAgVGhpcyBpbXBsZW1lbnRhdGlvbiBhc3N1bWVzIHRoYXQgY2hhcmFjdGVycyBhcmUgZW5jb2RlZCBpbiBJU08gMTA2NDYuXG4qL1xuXG5mdW5jdGlvbiB3Y3N3aWR0aChzdHIsIG9wdHMpIHtcbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSByZXR1cm4gd2N3aWR0aChzdHIsIG9wdHMpXG5cbiAgdmFyIHMgPSAwXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG4gPSB3Y3dpZHRoKHN0ci5jaGFyQ29kZUF0KGkpLCBvcHRzKVxuICAgIGlmIChuIDwgMCkgcmV0dXJuIC0xXG4gICAgcyArPSBuXG4gIH1cblxuICByZXR1cm4gc1xufVxuXG5mdW5jdGlvbiB3Y3dpZHRoKHVjcywgb3B0cykge1xuICAvLyB0ZXN0IGZvciA4LWJpdCBjb250cm9sIGNoYXJhY3RlcnNcbiAgaWYgKHVjcyA9PT0gMCkgcmV0dXJuIG9wdHMubnVsXG4gIGlmICh1Y3MgPCAzMiB8fCAodWNzID49IDB4N2YgJiYgdWNzIDwgMHhhMCkpIHJldHVybiBvcHRzLmNvbnRyb2xcblxuICAvLyBiaW5hcnkgc2VhcmNoIGluIHRhYmxlIG9mIG5vbi1zcGFjaW5nIGNoYXJhY3RlcnNcbiAgaWYgKGJpc2VhcmNoKHVjcykpIHJldHVybiAwXG5cbiAgLy8gaWYgd2UgYXJyaXZlIGhlcmUsIHVjcyBpcyBub3QgYSBjb21iaW5pbmcgb3IgQzAvQzEgY29udHJvbCBjaGFyYWN0ZXJcbiAgcmV0dXJuIDEgK1xuICAgICAgKHVjcyA+PSAweDExMDAgJiZcbiAgICAgICAodWNzIDw9IDB4MTE1ZiB8fCAgICAgICAgICAgICAgICAgICAgICAgLy8gSGFuZ3VsIEphbW8gaW5pdC4gY29uc29uYW50c1xuICAgICAgICB1Y3MgPT0gMHgyMzI5IHx8IHVjcyA9PSAweDIzMmEgfHxcbiAgICAgICAgKHVjcyA+PSAweDJlODAgJiYgdWNzIDw9IDB4YTRjZiAmJlxuICAgICAgICAgdWNzICE9IDB4MzAzZikgfHwgICAgICAgICAgICAgICAgICAgICAvLyBDSksgLi4uIFlpXG4gICAgICAgICh1Y3MgPj0gMHhhYzAwICYmIHVjcyA8PSAweGQ3YTMpIHx8ICAgIC8vIEhhbmd1bCBTeWxsYWJsZXNcbiAgICAgICAgKHVjcyA+PSAweGY5MDAgJiYgdWNzIDw9IDB4ZmFmZikgfHwgICAgLy8gQ0pLIENvbXBhdGliaWxpdHkgSWRlb2dyYXBoc1xuICAgICAgICAodWNzID49IDB4ZmUxMCAmJiB1Y3MgPD0gMHhmZTE5KSB8fCAgICAvLyBWZXJ0aWNhbCBmb3Jtc1xuICAgICAgICAodWNzID49IDB4ZmUzMCAmJiB1Y3MgPD0gMHhmZTZmKSB8fCAgICAvLyBDSksgQ29tcGF0aWJpbGl0eSBGb3Jtc1xuICAgICAgICAodWNzID49IDB4ZmYwMCAmJiB1Y3MgPD0gMHhmZjYwKSB8fCAgICAvLyBGdWxsd2lkdGggRm9ybXNcbiAgICAgICAgKHVjcyA+PSAweGZmZTAgJiYgdWNzIDw9IDB4ZmZlNikgfHxcbiAgICAgICAgKHVjcyA+PSAweDIwMDAwICYmIHVjcyA8PSAweDJmZmZkKSB8fFxuICAgICAgICAodWNzID49IDB4MzAwMDAgJiYgdWNzIDw9IDB4M2ZmZmQpKSk7XG59XG5cbmZ1bmN0aW9uIGJpc2VhcmNoKHVjcykge1xuICB2YXIgbWluID0gMFxuICB2YXIgbWF4ID0gY29tYmluaW5nLmxlbmd0aCAtIDFcbiAgdmFyIG1pZFxuXG4gIGlmICh1Y3MgPCBjb21iaW5pbmdbMF1bMF0gfHwgdWNzID4gY29tYmluaW5nW21heF1bMV0pIHJldHVybiBmYWxzZVxuXG4gIHdoaWxlIChtYXggPj0gbWluKSB7XG4gICAgbWlkID0gTWF0aC5mbG9vcigobWluICsgbWF4KSAvIDIpXG4gICAgaWYgKHVjcyA+IGNvbWJpbmluZ1ttaWRdWzFdKSBtaW4gPSBtaWQgKyAxXG4gICAgZWxzZSBpZiAodWNzIDwgY29tYmluaW5nW21pZF1bMF0pIG1heCA9IG1pZCAtIDFcbiAgICBlbHNlIHJldHVybiB0cnVlXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cbiIsImxldCBDb25maWcgPSB7XG4gIGJvcmRlckNoYXJhY3RlcnMgOiBbXG4gICAgW1xuICAgICAge3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn0sXG4gICAgICB7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifSxcbiAgICAgIHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9XG4gICAgXSxcbiAgICBbXG4gICAgICB7djogXCLilIJcIiwgbDogXCLilIxcIiwgajogXCLilKxcIiwgaDogXCLilIBcIiwgcjogXCLilJBcIn0sXG4gICAgICB7djogXCLilIJcIiwgbDogXCLilJxcIiwgajogXCLilLxcIiwgaDogXCLilIBcIiwgcjogXCLilKRcIn0sXG4gICAgICB7djogXCLilIJcIiwgbDogXCLilJRcIiwgajogXCLilLRcIiwgaDogXCLilIBcIiwgcjogXCLilJhcIn1cbiAgICBdLFxuICAgIFtcbiAgICAgIHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9LFxuICAgICAge3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn0sXG4gICAgICB7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifVxuICAgIF1cbiAgXSxcbiAgYWxpZ24gOiBcImNlbnRlclwiLFxuICBib3JkZXJDb2xvciA6IG51bGwsXG4gIGJvcmRlclN0eWxlIDogMSxcbiAgY29sb3IgOiBmYWxzZSxcbiAgY29tcGFjdCA6IGZhbHNlLFxuICBkZWZhdWx0RXJyb3JWYWx1ZSA6IFwiXHUwMDFiWzMybVx1MDAxYlszN21cdTAwMWJbNDFtIEVSUk9SISAgXHUwMDFiWzQ5bVx1MDAxYlszMm1cdTAwMWJbMzltXCIsXG4gIGRlZmF1bHRWYWx1ZSA6IFwiXHUwMDFiWzMybVx1MDAxYlszN21cdTAwMWJbNDFtID8gIFx1MDAxYls0OW1cdTAwMWJbMzJtXHUwMDFiWzM5bVwiLFxuICBlcnJvck9uTnVsbCA6IGZhbHNlLFxuICBmb290ZXJBbGlnbiA6IFwiY2VudGVyXCIsXG4gIGZvb3RlckNvbG9yIDogZmFsc2UsXG4gIGZvcm1hdHRlciA6IG51bGwsXG4gIGhlYWRlckFsaWduIDogXCJjZW50ZXJcIixcbiAgaGVhZGVyQ29sb3IgOiBcInllbGxvd1wiLFxuICBtYXJnaW5MZWZ0IDogMixcbiAgbWFyZ2luVG9wIDogMSxcbiAgcGFkZGluZ0JvdHRvbSA6IDAsXG4gIHBhZGRpbmdMZWZ0IDogMCxcbiAgcGFkZGluZ1JpZ2h0IDogMCxcbiAgcGFkZGluZ1RvcCA6IDAsXG4gIHRhYmxlVHlwZSA6IG51bGwsXG4gIHRydW5jYXRlOiBmYWxzZSxcbiAgd2lkdGggOiAyMCxcbn07XG5cbkNvbmZpZy5HVVRURVIgPSAxO1xuLy9zYXZlIHNvIGNlbGwgb3B0aW9ucyBjYW4gYmUgbWVyZ2VkIGludG8gY29sdW1uIG9wdGlvbnNcbkNvbmZpZy5jb2x1bW5TZXR0aW5ncyA9IFtdO1xuQ29uZmlnLmhlYWRlckVtcHR5ID0gZmFsc2U7XG5Db25maWcudGFibGUgPSB7XG4gIGJvZHkgOiAnJyxcbiAgY29sdW1uSW5uZXJXaWR0aHMgOiBbXSxcbiAgY29sdW1uV2lkdGhzIDogW10sXG4gIGNvbHVtbnMgOiBbXSxcbiAgZm9vdGVyIDogJycsXG4gIGhlYWRlciA6ICcnLCAvL3Bvc3QtcmVuZGVyZWQgc3RyaW5ncy5cbiAgaGVpZ2h0IDogMCxcbiAgdHlwZUxvY2tlZCA6IGZhbHNlIC8vb25jZSBhIHRhYmxlIHR5cGUgaXMgc2VsZWN0ZWQgY2FuJ3Qgc3dpdGNoXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpZztcbiIsImxldCBQdWJsaWMgPSByZXF1aXJlKCcuL3B1YmxpYy5qcycpO1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIFB1YmxpYy5zZXR1cDtcbn0pKClcbiIsIi8vbGV0IFN0cmlwQW5zaSA9IHJlcXVpcmUoXCJzdHJpcC1hbnNpXCIpO1xuLy9sZXQgV3JhcCA9IHJlcXVpcmUoXCJ3b3JkLXdyYXBcIik7XG5sZXQgV3JhcCA9IHJlcXVpcmUoXCJzbWFydHdyYXBcIik7XG5sZXQgV2N3aWR0aCA9IHJlcXVpcmUoXCJ3Y3dpZHRoXCIpO1xubGV0IEZvcm1hdCA9IHt9O1xuXG5Gb3JtYXQuY2FsY3VsYXRlTGVuZ3RoID0gZnVuY3Rpb24obGluZSkge1xuICAvL3JldHVybiBTdHJpcEFuc2kobGluZS5yZXBsYWNlKC9bXlxceDAwLVxceGZmXS9nLCdYWCcpKS5sZW5ndGg7XG4gIHJldHVybiBXY3dpZHRoKGxpbmUpO1xufVxuXG5Gb3JtYXQud3JhcENlbGxDb250ZW50ID0gZnVuY3Rpb24oXG4gIGNvbmZpZyxcbiAgY2VsbFZhbHVlLFxuICBjb2x1bW5JbmRleCxcbiAgY2VsbE9wdGlvbnMsXG4gIHJvd1R5cGVcbil7XG4gIFxuICAvL2NvZXJjZSBjZWxsIHZhbHVlIHRvIHN0cmluZ1xuICBsZXQgc3RyaW5nID0gY2VsbFZhbHVlLnRvU3RyaW5nKCk7IFxuXG4gIC8vQU5TSSBjaGFyYXJhY3RlcnMgdGhhdCBkZW1hcmNhdGUgdGhlIHN0YXJ0IG9mIGEgbGluZVxuICBsZXQgc3RhcnRBbnNpUmVnZXhwID0gL14oXFwwMzNcXFtbMC05O10qbSkrLztcblxuICAvL3N0b3JlIG1hdGNoaW5nIEFOU0kgY2hhcmFjdGVyc1xuICBsZXQgc3RhcnRNYXRjaGVzID0gc3RyaW5nLm1hdGNoKHN0YXJ0QW5zaVJlZ2V4cCkgfHwgWycnXTtcblxuICAvL3JlbW92ZSBBTlNJIHN0YXJ0LW9mLWxpbmUgY2hhcnMgXG4gIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHN0YXJ0QW5zaVJlZ2V4cCwnJyk7XG5cbiAgLy9BTlNJIGNoYXJhcmFjdGVycyB0aGF0IGRlbWFyY2F0ZSB0aGUgZW5kIG9mIGEgbGluZVxuICBsZXQgZW5kQW5zaVJlZ2V4cCA9IC8oXFwwMzNcXFtbMC05O10qbSkrJC87XG5cbiAgLy9zdG9yZSBtYXRjaGluZyBBTlNJIGNoYXJhY3RlcnMgc28gY2FuIGJlIGxhdGVyIHJlLWF0dGFjaGVkXG4gIGxldCBlbmRNYXRjaGVzID0gc3RyaW5nLm1hdGNoKGVuZEFuc2lSZWdleHApIHx8IFsnJ107XG5cbiAgLy9yZW1vdmUgQU5TSSBlbmQtb2YtbGluZSBjaGFycyBcbiAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoZW5kQW5zaVJlZ2V4cCwnJyk7XG5cbiAgbGV0IGFsaWduVGd0O1xuXG4gIHN3aXRjaChyb3dUeXBlKXtcbiAgICBjYXNlKCdoZWFkZXInKTpcbiAgICAgIGFsaWduVGd0ID0gXCJoZWFkZXJBbGlnblwiXG4gICAgICBicmVhaztcbiAgICBjYXNlKCdib2R5Jyk6XG4gICAgICBhbGlnblRndCA9IFwiYWxpZ25cIlxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGFsaWduVGd0ID0gXCJmb290ZXJBbGlnblwiXG4gICAgICBicmVhaztcbiAgfVxuXG4gIC8vZXF1YWxpemUgcGFkZGluZyBmb3IgY2VudGVyZWQgbGluZXMgXG4gIGlmKGNlbGxPcHRpb25zW2FsaWduVGd0XSA9PT0gJ2NlbnRlcicpeyAgXG4gICAgY2VsbE9wdGlvbnMucGFkZGluZ0xlZnQgPSBjZWxsT3B0aW9ucy5wYWRkaW5nUmlnaHQgPVxuICAgICAgTWF0aC5tYXgoY2VsbE9wdGlvbnMucGFkZGluZ1JpZ2h0LGNlbGxPcHRpb25zLnBhZGRpbmdMZWZ0LDApO1xuICB9XG5cbiAgbGV0IGNvbHVtbldpZHRoID0gY29uZmlnLnRhYmxlLmNvbHVtbldpZHRoc1tjb2x1bW5JbmRleF07XG4gIFxuICAvL2lubmVyV2lkdGggaXMgdGhlIHdpZHRoIGF2YWlsYWJsZSBmb3IgdGV4dCB3aXRoaW4gdGhlIGNlbGxcbiAgbGV0IGlubmVyV2lkdGggPSBjb2x1bW5XaWR0aCAtXG4gICBjZWxsT3B0aW9ucy5wYWRkaW5nTGVmdCAtXG4gICBjZWxsT3B0aW9ucy5wYWRkaW5nUmlnaHQgLVxuICAgY29uZmlnLkdVVFRFUjsgXG4gIFxuICBzd2l0Y2godHJ1ZSl7XG4gICAgLy9ubyB3cmFwLCB0cnVuY2F0ZVxuICAgIGNhc2UodHlwZW9mIGNvbmZpZy50cnVuY2F0ZSA9PT0gJ3N0cmluZycgJiYgY29uZmlnLnRydW5jYXRlLmxlbmd0aCA+IDApOlxuICAgICAgc3RyaW5nID0gRm9ybWF0LmhhbmRsZVRydW5jYXRlZFZhbHVlKFxuICAgICAgICBzdHJpbmcsXG4gICAgICAgIGNlbGxPcHRpb25zLFxuICAgICAgICBpbm5lcldpZHRoXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgLy9hc2lhbiBjaGFyYWN0ZXJzXG4gICAgY2FzZShzdHJpbmcubGVuZ3RoIDwgRm9ybWF0LmNhbGN1bGF0ZUxlbmd0aChzdHJpbmcpKTpcbiAgICAgIHN0cmluZyA9IEZvcm1hdC5oYW5kbGVBc2lhbkNoYXJzKFxuICAgICAgICBzdHJpbmcsXG4gICAgICAgIGNlbGxPcHRpb25zLFxuICAgICAgICBpbm5lcldpZHRoXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgLy9sYXRpbiBjaGFyYWN0ZXJzXG4gICAgZGVmYXVsdDpcbiAgICAgIHN0cmluZyA9IEZvcm1hdC5oYW5kbGVMYXRpbkNoYXJzKHN0cmluZyxjZWxsT3B0aW9ucyxpbm5lcldpZHRoKTtcbiAgfVxuXG4gIC8vYnJlYWsgc3RyaW5nIGludG8gYXJyYXkgb2YgbGluZXNcbiAgbGV0IHN0ckFyciA9IHN0cmluZy5zcGxpdCgnXFxuJyk7XG5cbiAgLy9mb3JtYXQgZWFjaCBsaW5lXG4gIHN0ckFyciA9IHN0ckFyci5tYXAoZnVuY3Rpb24obGluZSl7XG5cbiAgICBsaW5lID0gbGluZS50cmltKCk7ICBcbiAgXG4gICAgbGV0IGxpbmVMZW5ndGggPSBGb3JtYXQuY2FsY3VsYXRlTGVuZ3RoKGxpbmUpO1xuXG4gICAgLy9hbGlnbm1lbnQgXG4gICAgaWYobGluZUxlbmd0aCA8IGNvbHVtbldpZHRoKXtcbiAgICAgIGxldCBlbXB0eVNwYWNlID0gY29sdW1uV2lkdGggLSBsaW5lTGVuZ3RoOyBcbiAgICAgIHN3aXRjaCh0cnVlKXtcbiAgICAgICAgY2FzZShjZWxsT3B0aW9uc1thbGlnblRndF0gPT09ICdjZW50ZXInKTpcbiAgICAgICAgICBlbXB0eVNwYWNlIC0tO1xuICAgICAgICAgIGxldCBwYWRCb3RoID0gTWF0aC5mbG9vcihlbXB0eVNwYWNlIC8gMiksIFxuICAgICAgICAgICAgICBwYWRSZW1haW5kZXIgPSBlbXB0eVNwYWNlICUgMjtcbiAgICAgICAgICBsaW5lID0gQXJyYXkocGFkQm90aCArIDEpLmpvaW4oJyAnKSArIFxuICAgICAgICAgICAgbGluZSArXG4gICAgICAgICAgICBBcnJheShwYWRCb3RoICsgMSArIHBhZFJlbWFpbmRlcikuam9pbignICcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlKGNlbGxPcHRpb25zW2FsaWduVGd0XSA9PT0gJ3JpZ2h0Jyk6XG4gICAgICAgICAgbGluZSA9IEFycmF5KGVtcHR5U3BhY2UgLSBjZWxsT3B0aW9ucy5wYWRkaW5nUmlnaHQpLmpvaW4oJyAnKSArIFxuICAgICAgICAgICAgICAgICBsaW5lICsgXG4gICAgICAgICAgICAgICAgIEFycmF5KGNlbGxPcHRpb25zLnBhZGRpbmdSaWdodCArIDEpLmpvaW4oJyAnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBsaW5lID0gQXJyYXkoY2VsbE9wdGlvbnMucGFkZGluZ0xlZnQgKyAxKS5qb2luKCcgJykgK1xuICAgICAgICAgICAgICAgICBsaW5lICsgQXJyYXkoZW1wdHlTcGFjZSAtIGNlbGxPcHRpb25zLnBhZGRpbmdMZWZ0KS5qb2luKCcgJyk7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vcHV0IEFOU0kgY29sb3IgY29kZXMgQkFDSyBvbiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2Ygc3RyaW5nXG4gICAgbGluZSA9IHN0YXJ0TWF0Y2hlc1swXSArIGxpbmU7XG4gICAgbGluZSA9IGxpbmUgKyBlbmRNYXRjaGVzWzBdO1xuXG4gICAgcmV0dXJuIGxpbmU7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgb3V0cHV0IDogc3RyQXJyLFxuICAgIHdpZHRoIDogaW5uZXJXaWR0aFxuICB9O1xufVxuXG5Gb3JtYXQuaGFuZGxlVHJ1bmNhdGVkVmFsdWUgPSBmdW5jdGlvbihzdHJpbmcsY2VsbE9wdGlvbnMsaW5uZXJXaWR0aCl7XG4gIGxldCBvdXRzdHJpbmcgPSBzdHJpbmc7XG4gIGlmKGlubmVyV2lkdGggPCBvdXRzdHJpbmcubGVuZ3RoKXtcbiAgICBvdXRzdHJpbmcgPSBvdXRzdHJpbmcuc3Vic3RyaW5nKDAsaW5uZXJXaWR0aCAtIGNlbGxPcHRpb25zLnRydW5jYXRlLmxlbmd0aCk7XG4gICAgb3V0c3RyaW5nID0gb3V0c3RyaW5nICsgY2VsbE9wdGlvbnMudHJ1bmNhdGU7XG4gIH1cbiAgcmV0dXJuIG91dHN0cmluZztcbn1cblxuRm9ybWF0LmhhbmRsZUFzaWFuQ2hhcnMgPSBmdW5jdGlvbihzdHJpbmcsY2VsbE9wdGlvbnMsaW5uZXJXaWR0aCl7XG4gIGxldCBjb3VudCA9IDA7XG4gIGxldCBzdGFydCA9IDA7XG4gIGxldCBjaGFyYWN0ZXJzID0gc3RyaW5nLnNwbGl0KCcnKTtcblxuICBsZXQgb3V0c3RyaW5nID0gY2hhcmFjdGVycy5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGNlbGxWYWx1ZSwgaSkge1xuICAgIGNvdW50ICs9IEZvcm1hdC5jYWxjdWxhdGVMZW5ndGgoY2VsbFZhbHVlKTtcbiAgICBpZiAoY291bnQgPiBpbm5lcldpZHRoKSB7XG4gICAgICBwcmV2LnB1c2goc3RyaW5nLnNsaWNlKHN0YXJ0LCBpKSk7XG4gICAgICBzdGFydCA9IGk7XG4gICAgICBjb3VudCA9IDA7XG4gICAgfSBlbHNlIGlmIChjaGFyYWN0ZXJzLmxlbmd0aCA9PT0gaSArIDEpIHtcbiAgICAgIHByZXYucHVzaChzdHJpbmcuc2xpY2Uoc3RhcnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHByZXY7XG4gIH0sIFtdKS5qb2luKCdcXG4nKTtcblxuICByZXR1cm4gb3V0c3RyaW5nO1xufVxuXG5Gb3JtYXQuaGFuZGxlTGF0aW5DaGFycyA9IGZ1bmN0aW9uKHN0cmluZyxjZWxsT3B0aW9ucyxpbm5lcldpZHRoKXtcbiAgbGV0IGNhbGN1bGF0ZWRXaWR0aCA9IGlubmVyV2lkdGggLSBcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxPcHRpb25zLnBhZGRpbmdMZWZ0IC1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxPcHRpb25zLnBhZGRpbmdSaWdodDtcbiAgbGV0IG91dHN0cmluZyA9IFdyYXAoc3RyaW5nLHtcbiAgICB3aWR0aCA6IGNhbGN1bGF0ZWRXaWR0aCxcbiAgICB0cmltIDogdHJ1ZS8vLFxuICAgIC8vaW5kZW50IDogJycsXG4gICAgLy9jdXQgOiB0cnVlXG4gIH0pO1xuXG4gIHJldHVybiBvdXRzdHJpbmc7XG59XG5cbkZvcm1hdC5nZXRDb2x1bW5XaWR0aHMgPSBmdW5jdGlvbihjb25maWcscm93cyl7XG4gIFxuICBsZXQgd2lkdGhzID0gW107XG4gIGxldCBzb3VyY2U7IC8vc291cmNlIG9mIGNvbHVtbnMgIFxuICBcbiAgLy9jaGVjayB3aWR0aHMgb24gaGVhZGVyIHNldHRpbmdzIGlmIGV4aXN0c1xuICBpZihjb25maWcudGFibGUuaGVhZGVyWzBdICYmIGNvbmZpZy50YWJsZS5oZWFkZXJbMF0ubGVuZ3RoID4gMCl7XG4gICAgc291cmNlID0gY29uZmlnLnRhYmxlLmhlYWRlclswXTtcbiAgfVxuICBlbHNlIGlmKHJvd3MubGVuZ3RoID4gMCl7XG4gICAgc291cmNlID0gcm93c1swXTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgXG4gIHdpZHRocyA9IHNvdXJjZS5tYXAoZnVuY3Rpb24oY2VsbCl7XG4gICAgaWYodHlwZW9mIGNlbGwgPT09ICdvYmplY3QnICYmIHR5cGVvZiBjZWxsLndpZHRoICE9PSd1bmRlZmluZWQnKXtcbiAgICAgIHJldHVybiBjZWxsLndpZHRoO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgcmV0dXJuIGNvbmZpZy53aWR0aDtcbiAgICB9XG4gIH0pO1xuXG4gIC8vY2hlY2sgdG8gbWFrZSBzdXJlIHdpZHRocyB3aWxsIGZpdCB0aGUgY3VycmVudCBkaXNwbGF5LCBvciByZXNpemUuXG4gIGxldCB0b3RhbFdpZHRoID0gd2lkdGhzLnJlZHVjZShmdW5jdGlvbihwcmV2LGN1cnIpe1xuICAgIHJldHVybiBwcmV2ICsgY3VycjtcbiAgfSk7XG4gIFxuICAvL2FkZCBtYXJnaW5MZWZ0IHRvIHRvdGFsV2lkdGhcbiAgdG90YWxXaWR0aCArPSBjb25maWcubWFyZ2luTGVmdDtcblxuICAvL2NoZWNrIHByb2Nlc3MgZXhpc3RzIGluIGNhc2Ugd2UgYXJlIGluIGJyb3dzZXJcbiAgaWYocHJvY2VzcyAmJiBwcm9jZXNzLnN0ZG91dCAmJiB0b3RhbFdpZHRoID4gcHJvY2Vzcy5zdGRvdXQuY29sdW1ucyl7XG4gICAgLy9yZWNhbGN1bGF0ZSBwcm9wb3J0aW9uYXRlbHkgdG8gZml0IHNpemVcbiAgICBsZXQgcHJvcCA9IHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnMgLyB0b3RhbFdpZHRoO1xuICBcbiAgICBwcm9wID0gcHJvcC50b0ZpeGVkKDIpLTAuMDE7XG4gIFxuICAgIHdpZHRocyA9IHdpZHRocy5tYXAoZnVuY3Rpb24odmFsdWUpe1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IocHJvcCp2YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gd2lkdGhzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm1hdDtcbiIsImxldCBNZXJnZSA9IHJlcXVpcmUoXCJtZXJnZVwiKTtcbmxldCBSZW5kZXIgPSByZXF1aXJlKCcuL3JlbmRlci5qcycpO1xuXG4vL3RhYmxlIGJvZHkgaW5oZXJpdHMgZnJvbSBBcnJheVxubGV0IENscyA9IE9iamVjdC5jcmVhdGUoQXJyYXkucHJvdG90eXBlKTtcblxuLy9tYWtlIHN1cmUgY29uZmlnIGlzIHVuaXF1ZSBmb3IgZWFjaCBleHBvcnRcbmxldCBDb25maWc7IFxuXG4vKipcbiogQGNsYXNzIFRhYmxlXG4qIEBwYXJhbSB7YXJyYXl9IGhlYWRlciAgICAgICAgICAgICAgICAgICAgICAgICAgLSBbU2VlIGV4YW1wbGVdKCNleGFtcGxlLXVzYWdlKVxuKiBAcGFyYW0ge29iamVjdH0gaGVhZGVyLmNvbHVtbiAgICAgICAgICAgICAgICAgIC0gQ29sdW1uIG9wdGlvbnNcbiogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uYWxpYXMgICAgICAgICAgICAtIEFsZXJuYXRlIGhlYWRlciBjb2x1bW4gbmFtZVxuKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5hbGlnbiAgICAgICAgICAgIC0gZGVmYXVsdDogXCJjZW50ZXJcIlxuKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5jb2xvciAgICAgICAgICAgIC0gZGVmYXVsdDogdGVybWluYWwgZGVmYXVsdCBjb2xvclxuKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5mb290ZXJBbGlnbiAgICAgIC0gZGVmYXVsdDogXCJjZW50ZXJcIiBcbiogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uZm9vdGVyQ29sb3IgICAgICAtIGRlZmF1bHQ6IHRlcm1pbmFsIGRlZmF1bHQgY29sb3JcbiogQHBhcmFtIHtmdW5jdGlvbn0gaGVhZGVyLmNvbHVtbi5mb3JtYXR0ZXIgICAgICAtIFJ1bnMgYSBjYWxsYmFjayBvbiBlYWNoIGNlbGwgdmFsdWUgaW4gdGhlIHBhcmVudCBjb2x1bW5cbiogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uaGVhZGVyQWxpZ24gICAgICAtIGRlZmF1bHQ6IFwiY2VudGVyXCIgXG4qIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXIuY29sdW1uLmhlYWRlckNvbG9yICAgICAgLSBkZWZhdWx0OiB0ZXJtaW5hbCdzIGRlZmF1bHQgY29sb3JcbiogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ubWFyZ2luTGVmdCAgICAgIC0gZGVmYXVsdDogMFxuKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5tYXJnaW5Ub3AgICAgICAgIC0gZGVmYXVsdDogMCAgICAgIFxuKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5tYXhXaWR0aCAgICAgICAgLSBkZWZhdWx0OiAyMCBcbiogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ucGFkZGluZ0JvdHRvbSAgICAtIGRlZmF1bHQ6IDBcbiogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ucGFkZGluZ0xlZnQgICAgICAtIGRlZmF1bHQ6IDBcbiogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ucGFkZGluZ1JpZ2h0ICAgIC0gZGVmYXVsdDogMFxuKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5wYWRkaW5nVG9wICAgICAgLSBkZWZhdWx0OiAwICBcbipcbiogQHBhcmFtIHthcnJheX0gcm93cyAgICAgICAgICAgICAgICAgICAgICAtIFtTZWUgZXhhbXBsZV0oI2V4YW1wbGUtdXNhZ2UpXG4qXG4qIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zICAgICAgICAgICAgICAgICAgLSBUYWJsZSBvcHRpb25zIFxuKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5ib3JkZXJTdHlsZSAgICAgIC0gZGVmYXVsdDogMSAoMCA9IG5vIGJvcmRlcikgXG4qIFJlZmVycyB0byB0aGUgaW5kZXggb2YgdGhlIGRlc2lyZWQgY2hhcmFjdGVyIHNldC4gXG4qIEBwYXJhbSB7YXJyYXl9IG9wdGlvbnMuYm9yZGVyQ2hhcmFjdGVycyAgLSBbU2VlIEBub3RlXSgjbm90ZSkgXG4qIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmJvcmRlckNvbG9yICAgICAgLSBkZWZhdWx0OiB0ZXJtaW5hbCdzIGRlZmF1bHQgY29sb3JcbiogQHBhcmFtIHtib29sZWFufSBvcHRpb25zLmNvbXBhY3QgICAgICAtIGRlZmF1bHQ6IGZhbHNlXG4qIFJlbW92ZXMgaG9yaXpvbnRhbCBsaW5lcyB3aGVuIHRydWUuXG4qIEBwYXJhbSB7bWl4ZWR9IG9wdGlvbnMuZGVmYXVsdEVycm9yVmFsdWUgLSBkZWZhdWx0OiAnRVJST1IhJ1xuKiBAcGFyYW0ge21peGVkfSBvcHRpb25zLmRlZmF1bHRWYWx1ZSAtIGRlZmF1bHQ6ICc/J1xuKiBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuZXJyb3JPbk51bGwgICAgLSBkZWZhdWx0OiBmYWxzZVxuKiBAcGFyYW0ge21peGVkfSBvcHRpb25zLnRydW5jYXRlIC0gZGVmYXVsdDogZmFsc2UgXG4qIDxici8+XG4qIFdoZW4gdGhpcyBwcm9wZXJ0eSBpcyBzZXQgdG8gYSBzdHJpbmcsIGNlbGwgY29udGVudHMgd2lsbCBiZSB0cnVuY2F0ZWQgYnkgdGhhdCBzdHJpbmcgaW5zdGVhZCBvZiB3cmFwcGVkIHdoZW4gdGhleSBleHRlbmQgYmV5b25kIG9mIHRoZSB3aWR0aCBvZiB0aGUgY2VsbC4gXG4qIDxici8+XG4qIEZvciBleGFtcGxlIGlmOiBcbiogPGJyLz5cbiogPGNvZGU+XCJ0cnVuY2F0ZVwiOlwiLi4uXCI8L2NvZGU+XG4qIDxici8+XG4qIHRoZSBjZWxsIHdpbGwgYmUgdHJ1bmNhdGVkIHdpdGggXCIuLi5cIlxuXG4qIEByZXR1cm5zIHtUYWJsZX1cbiogQG5vdGVcbiogPGEgbmFtZT1cIm5vdGVcIi8+XG4qIERlZmF1bHQgYm9yZGVyIGNoYXJhY3RlciBzZXRzOlxuKiBgYGBqc1xuKltcbiogW1xuKiAge3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn0sXG4qICB7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifSxcbiogIHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9XG4qIF0sXG4qIFtcbiogIHt2OiBcIuKUglwiLCBsOiBcIuKUjFwiLCBqOiBcIuKUrFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUkFwifSxcbiogIHt2OiBcIuKUglwiLCBsOiBcIuKUnFwiLCBqOiBcIuKUvFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUpFwifSxcbiogIHt2OiBcIuKUglwiLCBsOiBcIuKUlFwiLCBqOiBcIuKUtFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUmFwifVxuKiBdLFxuKiBbXG4qICB7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifSxcbiogIHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9LFxuKiAge3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn1cbiogXVxuKl1cbiogYGBgXG4qIEBleGFtcGxlXG4qIGBgYGpzXG4qIGxldCBUYWJsZSA9IHJlcXVpcmUoJ3R0eS10YWJsZScpO1xuKiBsZXQgdDEgPSBUYWJsZShoZWFkZXIscm93cyxvcHRpb25zKTtcbiogY29uc29sZS5sb2codDEucmVuZGVyKCkpOyBcbiogYGBgXG4qXG4qL1xuQ2xzLnNldHVwID0gZnVuY3Rpb24oKXtcblxuICAvL2NoZWNrIGlmIHN5bnRheCBhZGFwdGVyIGNhbGxlZCwgaS5lLiBnaXRodWIuY29tL0F1dG9tYXR0aWMvY2xpLXRhYmxlXG4gIGlmKE9iamVjdC5rZXlzKGFyZ3VtZW50cykubGVuZ3RoID09PSAxICYmXG4gICAgIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdzdHJpbmcnKXtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi4vJythcmd1bWVudHNbMF0pO1xuICB9XG5cbiAgQ29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcuanMnKTtcblxuICBsZXQgIG9wdGlvbnMgPSAodHlwZW9mIGFyZ3VtZW50c1szXSA9PT0gJ29iamVjdCcpID8gYXJndW1lbnRzWzNdIDogXG4gICAgICAodHlwZW9mIGFyZ3VtZW50c1syXSA9PT0gJ29iamVjdCcpID8gYXJndW1lbnRzWzJdIDoge307XG5cbiAgQ29uZmlnID0gTWVyZ2UodHJ1ZSxDb25maWcsb3B0aW9ucyk7XG5cbiAgLy9iYWNrZml4ZXMgZm9yIHNob3J0ZW5lZCBvcHRpb24gbmFtZXNcbiAgQ29uZmlnLmFsaWduID0gQ29uZmlnLmFsaWdubWVudCB8fCBDb25maWcuYWxpZ247XG4gIFxuICBDb25maWcuaGVhZGVyQWxpZ24gPSBDb25maWcuaGVhZGVyQWxpZ25tZW50IHx8IENvbmZpZy5oZWFkZXJBbGlnbjtcblxuICBpZihhcmd1bWVudHNbMF0gJiYgYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgQXJyYXkgJiYgYXJndW1lbnRzWzBdLmxlbmd0aCl7XG4gICAgQ29uZmlnLnRhYmxlLmhlYWRlciA9IGFyZ3VtZW50c1swXTsgXG4gIH1cbiAgZWxzZXtcbiAgICBDb25maWcudGFibGUuaGVhZGVyID0gW107IFxuICAgIENvbmZpZy5oZWFkZXJFbXB0eSA9IHRydWU7XG4gIH1cblxuICAvL3NhdmUgYSBjb3B5IGZvciBtZXJnaW5nIGNvbHVtblNldHRpbmdzIGludG8gY2VsbCBvcHRpb25zXG4gIENvbmZpZy5jb2x1bW5TZXR0aW5ncyA9IENvbmZpZy50YWJsZS5oZWFkZXIuc2xpY2UoMCk7IFxuXG4gIC8vaWYgYm9yZGVyQ29sb3IgaXMgY2FsbGVkLCBsZXRzIGRvIGl0IG5vd1xuICBpZihDb25maWcuYm9yZGVyQ29sb3IgIT09IG51bGwpe1xuICAgIGxldCBDaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbiAgICBcbiAgICBDb25maWcuYm9yZGVyQ2hhcmFjdGVyc1tDb25maWcuYm9yZGVyU3R5bGVdID0gXG4gICAgICBDb25maWcuYm9yZGVyQ2hhcmFjdGVyc1tDb25maWcuYm9yZGVyU3R5bGVdLm1hcChmdW5jdGlvbihvYmope1xuICAgICAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgICAgb2JqW2tleV0gPSBDaGFsa1tDb25maWcuYm9yZGVyQ29sb3JdKG9ialtrZXldKTtcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH0pO1xuICB9XG5cbiAgLy9tYXRjaCBoZWFkZXIgZ2VvbWV0cnkgd2l0aCBib2R5IGFycmF5ICBcbiAgQ29uZmlnLnRhYmxlLmhlYWRlciA9IFtDb25maWcudGFibGUuaGVhZGVyXTtcbiAgXG4gIC8vcHVzaGVkIGJvZHkgZGF0YSBpbnRvIGluc3RhbmNlIHByb3RvdHlwZVxuICBpZihhcmd1bWVudHNbMV0gJiYgYXJndW1lbnRzWzFdIGluc3RhbmNlb2YgQXJyYXkpe1xuICAgIGFyZ3VtZW50c1sxXS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCl7XG4gICAgICBDbHMucHVzaCh2YWwpO1xuICAgIH0pO1xuICB9ICBcblxuICBDb25maWcudGFibGUuZm9vdGVyID0gKGFyZ3VtZW50c1syXSBpbnN0YW5jZW9mIEFycmF5KSA/IGFyZ3VtZW50c1syXSA6IFtdO1xuICBcbiAgcmV0dXJuIENscztcbn1cblxuXG4vKipcbiAqIFJlbmRlcnMgYSB0YWJsZSB0byBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ31cbiAqIEBtZW1iZXJvZiBUYWJsZSBcbiAqIEBleGFtcGxlIFxuICogYGBganNcbiAqIGxldCBzdHIgPSB0MS5yZW5kZXIoKTsgXG4gKiBjb25zb2xlLmxvZyhzdHIpOyAvL291dHB1dHMgdGFibGVcbiAqIGBgYFxuKi9cbkNscy5yZW5kZXIgPSBmdW5jdGlvbigpe1xuICBcbiAgLy9nZXQgc3Jpbmcgb3V0cHV0XG4gIGxldCBvdXRwdXQgPSBSZW5kZXIuc3RyaW5naWZ5RGF0YS5jYWxsKHRoaXMsQ29uZmlnLHRoaXMpO1xuXG4gIHJldHVybiBvdXRwdXQ7XG59ICBcblxubW9kdWxlLmV4cG9ydHMgPSBDbHM7XG4iLCJsZXQgTWVyZ2UgPSByZXF1aXJlKFwibWVyZ2VcIik7XG5sZXQgU3R5bGUgPSByZXF1aXJlKFwiLi9zdHlsZS5qc1wiKTtcbmxldCBGb3JtYXQgPSByZXF1aXJlKFwiLi9mb3JtYXQuanNcIik7XG5sZXQgUmVuZGVyID0ge307XG5cbi8qKlxuICogQ29udmVydHMgYXJyYXlzIG9mIGRhdGEgaW50byBhcnJheXMgb2YgY2VsbCBzdHJpbmdzXG4gKi9cblJlbmRlci5zdHJpbmdpZnlEYXRhID0gZnVuY3Rpb24oQ29uZmlnLGRhdGEpe1xuICBcbiAgbGV0IHNlY3Rpb25zID0ge1xuICAgICAgICBoZWFkZXIgOiBbXSxcbiAgICAgICAgYm9keSA6IFtdLFxuICAgICAgICBmb290ZXIgOiBbXVxuICAgICAgfSxcbiAgICAgIG91dHB1dCA9ICcnLFxuICAgICAgbWFyZ2luTGVmdCA9IEFycmF5KENvbmZpZy5tYXJnaW5MZWZ0ICsgMSkuam9pbignXFwgJyksXG4gICAgICBib3JkZXJTdHlsZSA9IENvbmZpZy5ib3JkZXJDaGFyYWN0ZXJzW0NvbmZpZy5ib3JkZXJTdHlsZV0sXG4gICAgICBib3JkZXJzID0gW107XG5cbiAgLy9iZWNhdXNlIGF1dG9tYXR0aWMvY2xpLXRhYmxlIHN5bnRheCBpbmZlcnMgdGFibGUgdHlwZSBiYXNlZCBvbiBcbiAgLy9ob3cgcm93cyBhcmUgcGFzc2VkIChhcnJheSBvZiBhcnJheXMsIG9iamVjdHMsIGV0YylcbiAgQ29uZmlnLnJvd0Zvcm1hdCA9IFJlbmRlci5nZXRSb3dGb3JtYXQoZGF0YVswXSB8fCBbXSk7XG4gIFxuICAvL25vdyB0cmFuc2xhdGUgdGhlbVxuICBkYXRhID0gUmVuZGVyLnRyYW5zZm9ybVJvd3MoQ29uZmlnLGRhdGEpO1xuICAgIFxuICBDb25maWcudGFibGUuY29sdW1uV2lkdGhzID0gRm9ybWF0LmdldENvbHVtbldpZHRocyhDb25maWcsZGF0YSk7XG4gIFxuICAvL3N0cmluZ2lmeSBoZWFkZXIgY2VsbHNcbiAgaWYoIUNvbmZpZy5oZWFkZXJFbXB0eSl7XG4gICAgc2VjdGlvbnMuaGVhZGVyID0gQ29uZmlnLnRhYmxlLmhlYWRlci5tYXAoZnVuY3Rpb24ocm93KXtcbiAgICAgIHJldHVybiBSZW5kZXIuYnVpbGRSb3coQ29uZmlnLHJvdywnaGVhZGVyJyk7XG4gICAgfSk7XG4gIH1cbiAgZWxzZXtcbiAgICBzZWN0aW9ucy5oZWFkZXIgPSBbXTtcbiAgfVxuXG4gIC8vc3RyaW5naWZ5IGJvZHkgY2VsbHNcbiAgc2VjdGlvbnMuYm9keSA9IGRhdGEubWFwKGZ1bmN0aW9uKHJvdyl7XG4gICAgcmV0dXJuIFJlbmRlci5idWlsZFJvdyhDb25maWcscm93LCdib2R5Jyk7XG4gIH0pO1xuXG4gIC8vc3RyaW5naWZ5IGZvb3RlciBjZWxsc1xuICBzZWN0aW9ucy5mb290ZXIgPSAoQ29uZmlnLnRhYmxlLmZvb3RlciBpbnN0YW5jZW9mIEFycmF5ICYmIENvbmZpZy50YWJsZS5mb290ZXIubGVuZ3RoID4gMCkgPyBbQ29uZmlnLnRhYmxlLmZvb3Rlcl0gOiBbXTtcbiAgXG4gIHNlY3Rpb25zLmZvb3RlciA9IHNlY3Rpb25zLmZvb3Rlci5tYXAoZnVuY3Rpb24ocm93KXtcbiAgICByZXR1cm4gUmVuZGVyLmJ1aWxkUm93KENvbmZpZyxyb3csJ2Zvb3RlcicpO1xuICB9KTtcblxuICAvL2FkZCBib3JkZXJzXG4gIC8vMD1oZWFkZXIsIDE9Ym9keSwgMj1mb290ZXJcbiAgZm9yKGxldCBhPTA7IGE8MzsgYSsrKXtcbiAgICBib3JkZXJzLnB1c2goJycpO1xuICAgIENvbmZpZy50YWJsZS5jb2x1bW5XaWR0aHMuZm9yRWFjaChmdW5jdGlvbih3LGksYXJyKXtcbiAgICAgIGJvcmRlcnNbYV0gKz0gQXJyYXkodykuam9pbihib3JkZXJTdHlsZVthXS5oKSArXG4gICAgICAgICgoaSsxICE9PSBhcnIubGVuZ3RoKSA/IGJvcmRlclN0eWxlW2FdLmogOiBib3JkZXJTdHlsZVthXS5yKTtcbiAgICB9KTtcbiAgICBib3JkZXJzW2FdID0gYm9yZGVyU3R5bGVbYV0ubCArIGJvcmRlcnNbYV07XG4gICAgYm9yZGVyc1thXSA9IGJvcmRlcnNbYV0uc3BsaXQoJycpO1xuICAgIGJvcmRlcnNbYV1bYm9yZGVyc1thXS5sZW5ndGgxXSA9IGJvcmRlclN0eWxlW2FdLnI7XG4gICAgYm9yZGVyc1thXSA9IGJvcmRlcnNbYV0uam9pbignJyk7XG4gICAgLy9ubyB0cmFpbGluZyBzcGFjZSBvbiBmb290ZXJcbiAgICBib3JkZXJzW2FdID0gKGE8MikgPyBtYXJnaW5MZWZ0ICsgYm9yZGVyc1thXSArICdcXG4nIDogbWFyZ2luTGVmdCArIGJvcmRlcnNbYV07XG4gIH1cbiAgXG4gIC8vdG9wIGhvcml6b250YWwgYm9yZGVyXG4gIG91dHB1dCArPSBib3JkZXJzWzBdO1xuXG4gIC8vcm93c1xuICBsZXQgcm93O1xuXG4gIC8vZm9yIGVhY2ggc2VjdGlvbiAoaGVhZGVyLGJvZHksZm9vdGVyKVxuICBPYmplY3Qua2V5cyhzZWN0aW9ucykuZm9yRWFjaChmdW5jdGlvbihwLGkpe1xuICAgIFxuICAgIC8vZm9yIGVhY2ggcm93IGluIHRoZSBzZWN0aW9uXG4gICAgd2hpbGUoc2VjdGlvbnNbcF0ubGVuZ3RoKXtcbiAgICAgIFxuICAgICAgcm93ID0gc2VjdGlvbnNbcF0uc2hpZnQoKTtcbiAgICAgIFxuICAgICAgLy9pZihyb3cubGVuZ3RoID09PSAwKSB7YnJlYWt9XG5cbiAgICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpe1xuICAgICAgICAvL3ZlcnRpY2FsIHJvdyBib3JkZXJzXG4gICAgICAgIG91dHB1dCA9IG91dHB1dCBcbiAgICAgICAgICArIG1hcmdpbkxlZnQgXG4gICAgICAgICAgLy9sZWZ0IHZlcnRpY2FsIGJvcmRlclxuICAgICAgICAgICsgYm9yZGVyU3R5bGVbMV0udiBcbiAgICAgICAgICAvL2pvaW4gY2VsbHMgb24gdmVydGljYWwgYm9yZGVyXG4gICAgICAgICAgKyAgbGluZS5qb2luKGJvcmRlclN0eWxlWzFdLnYpIFxuICAgICAgICAgIC8vcmlnaHQgdmVydGljYWwgYm9yZGVyXG4gICAgICAgICAgKyBib3JkZXJTdHlsZVsxXS52XG4gICAgICAgICAgLy9lbmQgb2YgbGluZVxuICAgICAgICAgICsgJ1xcbic7XG4gICAgICB9KTtcbiAgICBcbiAgICAgIC8vYm90dG9tIGhvcml6b250YWwgcm93IGJvcmRlclxuICAgICAgc3dpdGNoKHRydWUpe1xuICAgICAgICAvL3NraXAgaWYgZW5kIG9mIGJvZHkgYW5kIG5vIGZvb3RlclxuICAgICAgICBjYXNlKHNlY3Rpb25zW3BdLmxlbmd0aCA9PT0gMCBcbiAgICAgICAgICAgICAmJiBpID09PSAxIFxuICAgICAgICAgICAgICYmIHNlY3Rpb25zLmZvb3Rlci5sZW5ndGggPT09IDApOlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvL3NraXAgaWYgZW5kIG9mIGZvb3RlclxuICAgICAgICBjYXNlKHNlY3Rpb25zW3BdLmxlbmd0aCA9PT0gMCBcbiAgICAgICAgICAgICAmJiBpID09PSAyKTpcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy9za2lwIGlmIGNvbXBhY3RcbiAgICAgICAgY2FzZShDb25maWcuY29tcGFjdCAmJiBwID09PSAnYm9keScgJiYgIXJvdy5lbXB0eSk6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgb3V0cHV0ICs9IGJvcmRlcnNbMV07XG4gICAgICB9ICBcbiAgICB9XG4gIH0pO1xuICBcbiAgLy9ib3R0b20gaG9yaXpvbnRhbCBib3JkZXJcbiAgb3V0cHV0ICs9IGJvcmRlcnNbMl07XG4gIFxuICAvL3JlbW92ZSBhbGwgcm93cyBpbiBwcm90b3R5cGUgYXJyYXlcbiAgdGhpcy5zcGxpY2UoMCx0aGlzLmxlbmd0aCk7XG4gIFxuICBsZXQgZmluYWxPdXRwdXQgPSBBcnJheShDb25maWcubWFyZ2luVG9wICsgMSkuam9pbignXFxuJykgKyBvdXRwdXQ7XG5cbiAgLy9yZWNvcmQgdGhlIGhlaWdodCBvZiB0aGUgb3V0cHV0XG4gIHRoaXMuaGVpZ2h0ID0gZmluYWxPdXRwdXQuc3BsaXQoL1xcclxcbnxcXHJ8XFxuLykubGVuZ3RoO1xuICBcbiAgcmV0dXJuIGZpbmFsT3V0cHV0O1xufTtcblxuUmVuZGVyLmJ1aWxkUm93ID0gZnVuY3Rpb24oY29uZmlnLHJvdyxyb3dUeXBlKXtcblxuICBsZXQgbWluUm93SGVpZ2h0ID0gMDtcbiAgXG4gIC8vdGFnIHJvdyBhcyBlbXB0eSBpZiBlbXB0eVxuICAvLyh1c2VkKSBmb3IgY29tcGFjdCB0YWJsZXNcbiAgaWYocm93Lmxlbmd0aCA9PT0gMCAmJiBjb25maWcuY29tcGFjdCl7XG4gICAgcm93LmVtcHR5ID0gdHJ1ZTtcbiAgICByZXR1cm4gcm93O1xuICB9XG5cbiAgLy9jaGVjayBmb3IgZGlmZmVlcmVuY2VzIGluIGxpbmUgbGVuZ3RoXG4gIGxldCBkaWZMID0gY29uZmlnLnRhYmxlLmNvbHVtbldpZHRocy5sZW5ndGggLSByb3cubGVuZ3RoO1xuXG4gIGlmKGRpZkwgPiAwKXtcbiAgICAvL2FkZCBlbXB0eSBlbGVtZW50IHRvIGFycmF5XG4gICAgcm93ID0gcm93LmNvbmNhdChBcnJheS5hcHBseShudWxsLCBuZXcgQXJyYXkoZGlmTCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oKXtyZXR1cm4gbnVsbH0pKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vLm1hcChmdW5jdGlvbigpe3JldHVybiAnJ30pKTsgXG4gIH1cbiAgZWxzZSBpZihkaWZMIDwgMCl7XG4gICAgLy90cnVuY2F0ZSBhcnJheVxuICAgIHJvdy5sZW5ndGggPSBjb25maWcudGFibGUuY29sdW1uV2lkdGhzLmxlbmd0aDtcbiAgfVxuICBcbiAgLy9nZXQgcm93IGFzIGFycmF5IG9mIGNlbGwgYXJyYXlzXG4gIC8vY2FuJ3QgdXNlIGVzNSByb3cgZnVuY3Rpb25zIChtYXAsIGZvckVhY2ggYmVjYXVzZSBvZiBcbiAgLy9wb3RlbnRpYWwgZWxsaXNpb247IGJ5IHdoaWNoIFsxLCwzXSB3aWxsIG9ubHkgaXRlcmF0ZSAxLDNcbiAgbGV0IGNBcnJzID0gW107XG4gIGxldCByb3dMZW5ndGggPSByb3cubGVuZ3RoO1xuICBcbiAgZm9yKGxldCBpbmRleD0wOyBpbmRleDxyb3dMZW5ndGg7IGluZGV4Kyspe1xuICAgIFxuICAgIGxldCBjID0gUmVuZGVyLmJ1aWxkQ2VsbChjb25maWcscm93W2luZGV4XSxpbmRleCxyb3dUeXBlKTtcbiAgICBsZXQgY2VsbEFyciA9IGMuY2VsbEFycjtcbiAgICBcbiAgICBpZihyb3dUeXBlID09PSAnaGVhZGVyJyl7XG4gICAgICBjb25maWcudGFibGUuY29sdW1uSW5uZXJXaWR0aHMucHVzaChjLndpZHRoKTtcbiAgICB9XG4gIFxuICAgIG1pblJvd0hlaWdodCA9IChtaW5Sb3dIZWlnaHQgPCBjZWxsQXJyLmxlbmd0aCkgPyBcbiAgICAgIGNlbGxBcnIubGVuZ3RoIDogbWluUm93SGVpZ2h0O1xuICBcbiAgICBjQXJycy5wdXNoKGNlbGxBcnIpO1xuICB9XG4gIFxuICAvL2FkanVzdCBtaW5Sb3dIZWlnaHQgdG8gcmVmbGVjdCB2ZXJ0aWNhbCByb3cgcGFkZGluZ1xuICBtaW5Sb3dIZWlnaHQgPSAocm93VHlwZSA9PT0gJ2hlYWRlcicpID8gbWluUm93SGVpZ2h0IDpcbiAgICBtaW5Sb3dIZWlnaHQgKyAoY29uZmlnLnBhZGRpbmdCb3R0b20gKyBjb25maWcucGFkZGluZ1RvcCk7XG5cbiAgLy9jb252ZXJ0IGFycmF5IG9mIGNlbGwgYXJyYXlzIHRvIGFycmF5IG9mIGxpbmVzXG4gIGxldCBsaW5lcyA9IEFycmF5LmFwcGx5KG51bGwse2xlbmd0aDptaW5Sb3dIZWlnaHR9KVxuICAgICAgICAgICAgICAgICAgIC5tYXAoRnVuY3Rpb24uY2FsbCxmdW5jdGlvbigpe3JldHVybiBbXX0pO1xuICBjQXJycy5mb3JFYWNoKGZ1bmN0aW9uKGNlbGxBcnIsYSl7XG4gICAgbGV0IHdoaXRlbGluZSA9IEFycmF5KGNvbmZpZy50YWJsZS5jb2x1bW5XaWR0aHNbYV0pLmpvaW4oJ1xcICcpO1xuICAgIFxuICAgIGlmKHJvd1R5cGUgPT09J2JvZHknKXtcbiAgICAgIC8vYWRkIHdoaXRlc3BhY2UgZm9yIHRvcCBwYWRkaW5nXG4gICAgICBmb3IobGV0IGk9MDsgaTxjb25maWcucGFkZGluZ1RvcDsgaSsrKXtcbiAgICAgICAgY2VsbEFyci51bnNoaWZ0KHdoaXRlbGluZSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vYWRkIHdoaXRlc3BhY2UgZm9yIGJvdHRvbSBwYWRkaW5nXG4gICAgICBmb3IobGV0IGk9MDsgaTxjb25maWcucGFkZGluZ0JvdHRvbTsgaSsrKXtcbiAgICAgICAgY2VsbEFyci5wdXNoKHdoaXRlbGluZSk7XG4gICAgICB9XG4gICAgfSAgXG4gICAgZm9yKGxldCBiPTA7IGI8bWluUm93SGVpZ2h0OyBiKyspeyAgXG4gICAgICBsaW5lc1tiXS5wdXNoKCh0eXBlb2YgY2VsbEFycltiXSAhPT0gJ3VuZGVmaW5lZCcpID8gXG4gICAgICAgICAgICAgICAgICAgIGNlbGxBcnJbYl0gOiB3aGl0ZWxpbmUpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGxpbmVzO1xufVxuXG5SZW5kZXIuYnVpbGRDZWxsID0gZnVuY3Rpb24oY29uZmlnLGNlbGwsY29sdW1uSW5kZXgscm93VHlwZSl7XG4gIGxldCBjZWxsVmFsdWUsIFxuICAgICAgY2VsbE9wdGlvbnMgPSBNZXJnZSh0cnVlLGNvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKHJvd1R5cGUgPT09ICdib2R5JykgPyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLmNvbHVtblNldHRpbmdzW2NvbHVtbkluZGV4XSA6IHt9LCAvL2lnbm9yZSBjb2x1bW5TZXR0aW5ncyBmb3IgZm9vdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGwpOyAgICBcbiAgXG4gIGlmKHJvd1R5cGUgPT09ICdoZWFkZXInKXtcbiAgICBjb25maWcudGFibGUuY29sdW1ucy5wdXNoKGNlbGxPcHRpb25zKTtcbiAgICBjZWxsVmFsdWUgPSBjZWxsT3B0aW9ucy5hbGlhcyB8fCBjZWxsT3B0aW9ucy52YWx1ZSB8fCAnJztcbiAgfSAgXG4gIGVsc2V7XG4gICAgLy9zZXQgY2VsbFZhbHVlXG4gICAgc3dpdGNoKHRydWUpeyAgXG4gICAgICBjYXNlKHR5cGVvZiBjZWxsID09PSAndW5kZWZpbmVkJyB8fCBjZWxsID09PSBudWxsKTpcbiAgICAgICAgLy9yZXBsYWNlIHVuZGVmaW5lZC9udWxsIGNlbGwgdmFsdWVzIHdpdGggcGxhY2Vob2xkZXJcbiAgICAgICAgY2VsbFZhbHVlID0gKGNvbmZpZy5lcnJvck9uTnVsbCkgPyBjb25maWcuZGVmYXVsdEVycm9yVmFsdWUgOiBjb25maWcuZGVmYXVsdFZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UodHlwZW9mIGNlbGwgPT09ICdvYmplY3QnICYmIHR5cGVvZiBjZWxsLnZhbHVlICE9PSAndW5kZWZpbmVkJyk6ICBcbiAgICAgICAgY2VsbFZhbHVlID0gY2VsbC52YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvL2NlbGwgaXMgYXNzdW1lZCB0byBiZSBhIHNjYWxhclxuICAgICAgICBjZWxsVmFsdWUgPSBjZWxsO1xuICAgIH1cbiAgICBcbiAgICAvL3J1biBmb3JtYXR0ZXJcbiAgICBpZih0eXBlb2YgY2VsbE9wdGlvbnMuZm9ybWF0dGVyID09PSAnZnVuY3Rpb24nKXtcbiAgICAgIGNlbGxWYWx1ZSA9IGNlbGxPcHRpb25zLmZvcm1hdHRlcihjZWxsVmFsdWUpO1xuICAgIH1cbiAgfVxuICBcbiAgLy9jb2xvcml6ZSBjZWxsVmFsdWVcbiAgY2VsbFZhbHVlID0gU3R5bGUuY29sb3JpemVDZWxsKGNlbGxWYWx1ZSxjZWxsT3B0aW9ucyxyb3dUeXBlKTsgIFxuXG4gIC8vdGV4dHdyYXAgY2VsbFZhbHVlXG4gIGxldCBXcmFwT2JqICA9IEZvcm1hdC53cmFwQ2VsbENvbnRlbnQoY29uZmlnLCBjZWxsVmFsdWUsIGNvbHVtbkluZGV4LCBjZWxsT3B0aW9ucywgcm93VHlwZSk7XG4gIC8vY2VsbFZhbHVlID0gV3JhcE9iai5vdXRwdXQuam9pbignXFxuJyk7XG5cbiAgLy9yZXR1cm4gYXMgYXJyYXkgb2YgbGluZXNcbiAgcmV0dXJuIHtcbiAgICBjZWxsQXJyIDogV3JhcE9iai5vdXRwdXQsXG4gICAgd2lkdGggOiBXcmFwT2JqLndpZHRoXG4gIH07XG59O1xuXG5SZW5kZXIuZ2V0Um93Rm9ybWF0ID0gZnVuY3Rpb24ocm93KXtcbiAgbGV0IHR5cGU7XG4gIFxuICAvL3Jvd3MgcGFzc2VkIGFzIGFuIG9iamVjdFxuICBpZih0eXBlb2Ygcm93ID09PSAnb2JqZWN0JyAmJiAhKHJvdyBpbnN0YW5jZW9mIEFycmF5KSl7XG4gICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhyb3cpO1xuICAgIGlmKGtleXMubGVuZ3RoID09PSAxKXtcbiAgICAgIC8vZGV0ZWN0ZWQgY3Jvc3MgdGFibGVcbiAgICAgIGxldCBrZXkgPSBrZXlzWzBdO1xuICAgICAgaWYocm93W2tleV0gaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgIHR5cGUgPSAnYXV0b21hdHRpYy1jcm9zcyc7XG4gICAgICB9XG4gICAgICAvL2RldGVjdGVkIHZlcnRpY2FsIHRhYmxlXG4gICAgICBlbHNle1xuICAgICAgICB0eXBlID0gJ2F1dG9tYXR0aWMtdmVydGljYWwnOyAgXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy9kZXRlY3RlZCBob3Jpem9udGFsIHRhYmxlXG4gICAgICB0eXBlID0gJ28taG9yaXpvbnRhbCc7XG4gICAgfVxuICB9XG4gIC8vcm93cyBwYXNzZWQgYXMgYW4gYXJyYXlcbiAgZWxzZXtcbiAgICB0eXBlID0gJ2EtaG9yaXpvbnRhbCc7ICBcbiAgfVxuXG4gIHJldHVybiB0eXBlO1xufTtcblxuLy9AdG9kbyBGb3Igcm90YXRpbmcgaG9yaXpvbnRhbCBkYXRhIGludG8gYSB2ZXJ0aWNhbCB0YWJsZVxuLy9hc3N1bWVzIGFsbCByb3dzIGFyZSBzYW1lIGxlbmd0aFxuUmVuZGVyLnZlcnRpY2FsaXplTWF0cml4ID0gZnVuY3Rpb24oY29uZmlnLGlucHV0QXJyYXkpe1xuXG4gIC8vZ3JvdyB0byAjIGFycmF5cyBlcXVhbCB0byBudW1iZXIgb2YgY29sdW1ucyBpbiBpbnB1dCBhcnJheVxuICBsZXQgb3V0cHV0QXJyYXkgPSBbXTtcbiAgbGV0IGhlYWRlcnMgPSBjb25maWcudGFibGUuY29sdW1ucztcblxuICAvL2NyZWF0ZSBhIHJvdyBmb3IgZWFjaCBoZWFkaW5nLCBhbmQgcHJlcGVuZCB0aGUgcm93XG4gIC8vd2l0aCB0aGUgaGVhZGluZyBuYW1lXG4gIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihuYW1lKXtcbiAgICBvdXRwdXRBcnJheS5wdXNoKFtuYW1lXSk7XG4gIH0pO1xuXG4gIGlucHV0QXJyYXkuZm9yRWFjaChmdW5jdGlvbihyb3cpe1xuICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsaW5kZXgpe1xuICAgICAgb3V0cHV0QXJyYXlbaW5kZXhdLnB1c2goZWxlbWVudCk7ICBcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIG91dHB1dEFycmF5O1xufSBcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGlucHV0IGRhdGEgYXJyYXlzIHRvIGJhc2UgcmVuZGVyaW5nIHN0cnVjdHVyZS5cbiAqL1xuUmVuZGVyLnRyYW5zZm9ybVJvd3MgPSBmdW5jdGlvbihjb25maWcscm93cyl7XG5cbiAgbGV0IG91dHB1dCA9IFtdO1xuICBzd2l0Y2goY29uZmlnLnJvd0Zvcm1hdCl7XG4gICAgY2FzZSgnYXV0b21hdHRpYy1jcm9zcycpOlxuICAgICAgLy9hc3NpZ24gaGVhZGVyIHN0eWxlcyB0byBmaXJzdCBjb2x1bW5cbiAgICAgIGNvbmZpZy5jb2x1bW5TZXR0aW5nc1swXSA9IGNvbmZpZy5jb2x1bW5TZXR0aW5nc1swXSB8fCB7fTtcbiAgICAgIGNvbmZpZy5jb2x1bW5TZXR0aW5nc1swXS5jb2xvciA9IGNvbmZpZy5oZWFkZXJDb2xvcjtcbiAgICAgIFxuICAgICAgb3V0cHV0ID0gcm93cy5tYXAoZnVuY3Rpb24ob2JqKXtcbiAgICAgICAgbGV0IGFyciA9IFtdO1xuICAgICAgICBsZXQga2V5ID0gT2JqZWN0LmtleXMob2JqKVswXTtcbiAgICAgICAgYXJyLnB1c2goa2V5KTtcbiAgICAgICAgcmV0dXJuIGFyci5jb25jYXQob2JqW2tleV0pO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlKCdhdXRvbWF0dGljLXZlcnRpY2FsJyk6ICBcbiAgICAgIC8vYXNzaWduIGhlYWRlciBzdHlsZXMgdG8gZmlyc3QgY29sdW1uXG4gICAgICBjb25maWcuY29sdW1uU2V0dGluZ3NbMF0gPSBjb25maWcuY29sdW1uU2V0dGluZ3NbMF0gfHwge307XG4gICAgICBjb25maWcuY29sdW1uU2V0dGluZ3NbMF0uY29sb3IgPSBjb25maWcuaGVhZGVyQ29sb3I7XG4gICAgXG4gICAgICBvdXRwdXQgPSByb3dzLm1hcChmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgIGxldCBrZXkgPSBPYmplY3Qua2V5cyh2YWx1ZSlbMF07XG4gICAgICAgIHJldHVybiBba2V5LHZhbHVlW2tleV1dO1xuICAgICAgfSk7IFxuICAgICAgYnJlYWs7XG4gICAgY2FzZSgnby1ob3Jpem9udGFsJyk6XG4gICAgICBvdXRwdXQgPSByb3dzLm1hcChmdW5jdGlvbihyb3cpeyAgXG4gICAgICAgIC8vcmVxdWlyZXMgdGhhdCBjb2x1bW4gbmFtZXMgYXJlIHNwZWNpZmllZCBpbiBoZWFkZXJcbiAgICAgICAgcmV0dXJuIGNvbmZpZy50YWJsZS5oZWFkZXJbMF0ubWFwKGZ1bmN0aW9uKG9iamVjdCl7XG4gICAgICAgICAgcmV0dXJuIHJvd1tvYmplY3QudmFsdWVdIHx8IG51bGw7ICAgIFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSgnYS1ob3Jpem9udGFsJyk6XG4gICAgICBvdXRwdXQgPSByb3dzO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyO1xuIiwibGV0IENoYWxrID0gcmVxdWlyZShcImNoYWxrXCIpO1xuXG5leHBvcnRzLmNvbG9yaXplQ2VsbCA9IGZ1bmN0aW9uKHN0cixjZWxsT3B0aW9ucyxyb3dUeXBlKXtcbiAgXG4gIGxldCBjb2xvciA9IGZhbHNlOyAvL2ZhbHNlIHdpbGwga2VlcCB0ZXJtaW5hbCBkZWZhdWx0XG4gIFxuICBzd2l0Y2godHJ1ZSl7XG4gICAgY2FzZShyb3dUeXBlID09PSAnYm9keScpOlxuICAgICAgY29sb3IgPSBjZWxsT3B0aW9ucy5jb2xvciB8fCBjb2xvcjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2Uocm93VHlwZSA9PT0gJ2hlYWRlcicpOlxuICAgICAgY29sb3IgPSBjZWxsT3B0aW9ucy5oZWFkZXJDb2xvciB8fCBjb2xvcjsgIFxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbG9yID0gY2VsbE9wdGlvbnMuZm9vdGVyQ29sb3IgfHwgY29sb3I7XG4gIH1cbiAgXG4gIGlmIChjb2xvcil7XG4gICAgc3RyID0gQ2hhbGtbY29sb3JdKHN0cik7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuXG4vKlxuZXhwb3J0cy5jb2xvcml6ZUFsbFdvcmRzID0gZnVuY3Rpb24oY29sb3Isc3RyKXtcbiAgLy9jb2xvciBlYWNoIHdvcmQgaW4gdGhlIGNlbGwgc28gdGhhdCBsaW5lIGJyZWFrcyBkb24ndCBicmVhayBjb2xvciBcbiAgbGV0IGFyciA9IHN0ci5yZXBsYWNlKC8oXFxTKykvZ2ksZnVuY3Rpb24obWF0Y2gpe1xuICAgIHJldHVybiBDaGFsa1tjb2xvcl0obWF0Y2gpKydcXCAnO1xuICB9KTtcbiAgcmV0dXJuIGFycjtcbn1cbiovXG5cblxuIiwiXG5sZXQgY3N2ID0gcmVxdWlyZSgnY3N2Jyk7XG5sZXQgeWFyZ3MgPSByZXF1aXJlKCd5YXJncycpO1xueWFyZ3MuZXBpbG9nKCdDb3B5aWdodCBnaXRodWIuY29tL3RlY2Z1IDIwMTcnKTtcbnlhcmdzLm9wdGlvbignY3N2LWRlbGltaXRlcicse1xuICBkZXNjcmliZTonU2V0IHRoZSBmaWVsZCBkZWxpbWl0ZXIuIE9uZSBjaGFyYWN0ZXIgb25seS4nLFxuICBkZWZhdWx0OicsJ1xufSk7XG55YXJncy5vcHRpb24oJ2Nzdi1lc2NhcGUnLHtcbiAgZGVzY3JpYmU6J1NldCB0aGUgZXNjYXBlIGNoYXJhY3Rlci4gT25lIGNoYXJhY3RlciBvbmx5Lidcbn0pO1xueWFyZ3Mub3B0aW9uKCdjc3Ytcm93RGVsaW1pdGVyJyx7XG4gIGRlc2NyaWJlOidTdHJpbmcgdXNlZCB0byBkZWxpbWl0IHJlY29yZCByb3dzLiBZb3UgY2FuIGFsc28gdXNlIGEgc3BlY2lhbCBjb25zdGFudDogXCJhdXRvXCIsXCJ1bml4XCIsXCJtYXhcIixcIndpbmRvd3NcIixcInVuaWNvZGVcIi4nLFxuICBkZWZhdWx0OiAnXFxuJ1xufSk7XG55YXJncy5vcHRpb24oJ2Zvcm1hdCcse1xuICBkZXNjcmliZTonU2V0IGlucHV0IGRhdGEgZm9ybWF0JyxcbiAgY2hvaWNlczpbJ2pzb24nLCdjc3YnXSxcbiAgZGVmYXVsdDonY3N2J1xufSk7XG55YXJncy5vcHRpb24oJ29wdGlvbnNcXHUyMDEwXFx1MDAyQScse1xuICBkZXNjcmliZTonU3BlY2lmeSBhbiBvcHRpb25hbCBzZXR0aW5nIHdoZXJlICogaXMgdGhlIHNldHRpbmcgbmFtZS4gU2VlIFJFQURNRS5tZCBmb3IgYSBjb21wbGV0ZSBsaXN0Lidcbn0pO1xueWFyZ3MudmVyc2lvbihmdW5jdGlvbigpe1xuICBsZXQgZnMgPSByZXF1aXJlKCdmcycpO1xuICBsZXQgcGF0aCA9X19kaXJuYW1lKycvLi4vcGFja2FnZS5qc29uJztcbiAgbGV0IGNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKHBhdGgsJ3V0Zi04Jyk7XG4gIGxldCBqc29uID0gSlNPTi5wYXJzZShjb250ZW50cyk7XG4gIHJldHVybiBqc29uLnZlcnNpb247XG59KTtcblxubGV0IENoYWxrID0gcmVxdWlyZSgnY2hhbGsnKTtcbmxldCBzZW5kRXJyb3IgPSBmdW5jdGlvbihtc2cpe1xuICBtc2cgPSAnXFxudHR5LXRhYmxlIGVycm9yOiAnICsgbXNnICsgJ1xcbic7XG4gIGNvbnNvbGUubG9nKG1zZyk7XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn07XG5cbi8vbm90ZSB0aGF0IHRoaXMgaXMgdGhlIGZpcnN0IHJ1blxubGV0IGFscmVhZHlSZW5kZXJlZCA9IGZhbHNlO1xubGV0IHByZXZpb3VzSGVpZ2h0ID0gMDtcblxubGV0IGRhdGFGb3JtYXQgPSAnY3N2JztcbnN3aXRjaCh0cnVlKXtcbiAgY2FzZSh0eXBlb2YgeWFyZ3MuYXJndi5mb3JtYXQgPT09ICd1bmRlZmluZWQnKTpcbiAgICBicmVhaztcbiAgY2FzZSh5YXJncy5hcmd2LmZvcm1hdC50b1N0cmluZygpLm1hdGNoKC9qc29uL2kpICE9PSBudWxsKTpcbiAgICBkYXRhRm9ybWF0ID0gJ2pzb24nO1xuICAgIGJyZWFrO1xuICBkZWZhdWx0OlxufVxuXG4vL2xvb2sgZm9yIG9wdGlvbnMtKiBcbmxldCBvcHRpb25zID0ge307XG5PYmplY3Qua2V5cyh5YXJncy5hcmd2KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gIGxldCBrZXlQYXJ0cyA9IGtleS5zcGxpdCgnLScpO1xuICBpZihrZXlQYXJ0c1swXT09PSdvcHRpb25zJyl7XG4gICAgb3B0aW9uc1trZXlQYXJ0c1sxXV09eWFyZ3MuYXJndltrZXldO1xuICB9XG59KTtcblxuLy9sb29rIGZvciBoZWFkZXItbi0qXG4vL09iamVjdC5rZXlzKHlhcmdzLmFyZ3YpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbi8vICBsZXQga2V5UGFydHMgPSBrZXkuc3BsaXQoJy0nKTtcbi8vICBpZihrZXlQYXJ0c1swXSA9PT0gJ2hlYWRlcicpe1xuLy8gICAgLy9maW5kIG91dCB3aGljaCBjb2x1bW4gd2UncmUgc2V0dGluZyBhbiBvcHRpb24gb25cbi8vICAgIGxldCBjb2x1bW4gPSBrZXlQYXJ0c1sxXTtcbi8vICAgIGlmKHR5cGVvZiBoZWFkZXJbY29sdW1uXSA9PT0gJ3VuZGVmaW5lZCcpe1xuLy8gICAgICBoZWFkZXJbY29sdW1uXSA9IHt9XG4vLyAgICB9XG4vLyAgICBoZWFkZXJbY29sdW1uXVtrZXlQYXJ0c1syXV0gPSB5YXJncy5hcmd2W2tleV07XG4vLyAgfVxuLy99KTtcblxuLy9pZiBoZWFkZXIgaXMgc3BlY2lmaWVkLCB3ZSdsbCBuZWVkIHRvIGhhdmUgYSBzaXplIG9uIGl0XG5cblxuLy9iZWNhdXNlIGRpZmZlbnQgZGF0YUZvcm1hdHMgXG5sZXQgcnVuVGFibGUgPSBmdW5jdGlvbihpbnB1dCl7XG4gIFxuICBsZXQgaGVhZGVyID0gW10sIFxuICBib2R5ID0gaW5wdXQ7IFxuICAvL2Zvb3RlciA9IFtdLCBcblxuICBsZXQgVGFibGUgPSByZXF1aXJlKCcuL3B1YmxpYy5qcycpO1xuICBsZXQgdDEgPSBUYWJsZS5zZXR1cChoZWFkZXIsYm9keSxvcHRpb25zKTtcbiAgXG4gIC8vaGlkZSBjdXJzb3JcbiAgY29uc29sZS5sb2coJ1xcdTAwMWJbPzI1bCcpO1xuICBcbiAgLy93aXBlIGV4aXN0aW5nIGlmIGFscmVhZHkgcmVuZGVyZWRcbiAgaWYoYWxyZWFkeVJlbmRlcmVkKXtcblxuICAgIC8vbW92ZSBjdXJzb3IgdXAgbnVtYmVyIHRvIHRoZSB0b3Agb2YgdGhlIHByZXZpb3VzIHByaW50XG4gICAgLy9iZWZvcmUgZGVsZXRpbmdcbiAgICBjb25zb2xlLmxvZygnXFx1MDAxYlsnKyhwcmV2aW91c0hlaWdodCszKSsnQScpO1xuICAgIFxuICAgIC8vZGVsZXRlIHRvIGVuZCBvZiB0ZXJtaW5hbFxuICAgIGNvbnNvbGUubG9nKCdcXHUwMDFiWzBKJyk7XG4gIH1cbiAgZWxzZXtcbiAgICBhbHJlYWR5UmVuZGVyZWQgPSB0cnVlO1xuICB9XG4gIFxuICBjb25zb2xlLmxvZyh0MS5yZW5kZXIoKSk7XG4gIFxuICAvL3Jlc2V0IHRoZSBwcmV2aW91cyBoZWlnaHQgdG8gdGhlIGhlaWdodCBvZiB0aGlzIG91dHB1dFxuICAvL2ZvciB3aGVuIHdlIG5leHQgY2xlYXIgdGhlIHByaW50XG4gIHByZXZpb3VzSGVpZ2h0ID0gdDEuaGVpZ2h0O1xuXG59O1xuXG5wcm9jZXNzLnN0ZGluLnJlc3VtZSgpO1xucHJvY2Vzcy5zdGRpbi5zZXRFbmNvZGluZygndXRmOCcpO1xucHJvY2Vzcy5zdGRpbi5vbignZGF0YScsIGZ1bmN0aW9uKGNodW5rKSB7XG5cbiAgLy9oYW5kbGUgZGF0YUZvcm1hdHNcbiAgc3dpdGNoKHRydWUpe1xuICAgIGNhc2UoZGF0YUZvcm1hdD09PSdqc29uJyk6ICBcbiAgICAgIGxldCBkYXRhLG1zZztcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGNodW5rKTtcbiAgICAgIH1cbiAgICAgIGNhdGNoKGUpe1xuICAgICAgICBtc2cgPSBDaGFsay5iZ1JlZC53aGl0ZShtc2cpO1xuICAgICAgICBtc2cgPSBtc2cgKyBcIlxcblxcblBsZWFzZSBjaGVjayB0byBtYWtlIHN1cmUgdGhhdCB5b3VyIGlucHV0IGRhdGEgY29uc2lzdHMgb2YgSlNPTiBvciBzcGVjaWZ5IGEgZGlmZmVyZW50IGZvcm1hdCB3aXRoIHRoZSAtLWZvcm1hdCBmbGFnLlwiO1xuICAgICAgICBzZW5kRXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHJ1blRhYmxlKGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGxldCBmb3JtYXR0ZXJPcHRpb25zID0ge307XG4gICAgICBPYmplY3Qua2V5cyh5YXJncy5hcmd2KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIGlmKGtleS5zbGljZSgwLDQpID09PSAnY3N2LScgJiYgdHlwZW9mKHlhcmdzLmFyZ3Zba2V5XSkgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICBmb3JtYXR0ZXJPcHRpb25zW2tleS5zbGljZSg0KV0gPSB5YXJncy5hcmd2W2tleV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBjc3YucGFyc2UoY2h1bmssZm9ybWF0dGVyT3B0aW9ucyxmdW5jdGlvbihlcnIsIGRhdGEpe1xuICAgICAgICAvL3ZhbGlkYXRlIGNzdiAgXG4gICAgICAgIGlmKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgbGV0IG1zZyA9IFwiQ1NWIHBhcnNlIGVycm9yLlwiO1xuICAgICAgICAgIG1zZyA9IENoYWxrLmJnUmVkLndoaXRlKG1zZyk7XG4gICAgICAgICAgbXNnID0gbXNnICsgJ1xcblxcbicgKyBlcnI7XG4gICAgICAgICAgbXNnID0gbXNnICsgJ1xcblxcbicgKyAnUGxlYXNlIGNoZWNrIHRvIG1ha2Ugc3VyZSB0aGF0IHlvdXIgaW5wdXQgZGF0YSBjb25zaXN0cyBvZiB2YWxpZCBjb21tYSBzZXBhcmF0ZWQgdmFsdWVzIG9yIHNwZWNpZnkgYSBkaWZmZXJlbnQgZm9ybWF0IHdpdGggdGhlIC0tZm9ybWF0IGZsYWcuJztcbiAgICAgICAgICBzZW5kRXJyb3IobXNnKTtcbiAgICAgICAgfVxuICAgICAgICBydW5UYWJsZShkYXRhKTtcbiAgICAgIH0pO1xuICB9XG59KTtcblxuaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIikge1xuICBsZXQgcmwgPSByZXF1aXJlKFwicmVhZGxpbmVcIikuY3JlYXRlSW50ZXJmYWNlKHtcbiAgICBpbnB1dDogcHJvY2Vzcy5zdGRpbixcbiAgICBvdXRwdXQ6IHByb2Nlc3Muc3Rkb3V0XG4gIH0pO1xuXG4gIHJsLm9uKFwiU0lHSU5UXCIsIGZ1bmN0aW9uICgpIHtcbiAgICBwcm9jZXNzLmVtaXQoXCJTSUdJTlRcIik7XG4gIH0pO1xufVxuXG5wcm9jZXNzLm9uKFwiU0lHSU5UXCIsIGZ1bmN0aW9uICgpIHtcbiAgLy9ncmFjZWZ1bCBzaHV0ZG93blxuICBwcm9jZXNzLmV4aXQoKTtcbn0pO1xuXG5wcm9jZXNzLm9uKCdleGl0JywgZnVuY3Rpb24oKSB7XG4gIC8vc2hvdyBjdXJzb3JcbiAgY29uc29sZS5sb2coJ1xcdTAwMWJbPzI1aCcpO1xufSk7XG5cbi8vcnVuIGhlbHAgb25seSBhdCB0aGUgZW5kXG55YXJncy5hcmd2ID0geWFyZ3MuaGVscCgnaCcpLmFyZ3Y7XG4iXX0=
