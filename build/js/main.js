(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\base64-js\\lib\\b64.js","/..\\..\\node_modules\\base64-js\\lib")
},{"buffer":2,"e/U+97":4}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
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
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\buffer\\index.js","/..\\..\\node_modules\\buffer")
},{"base64-js":1,"buffer":2,"e/U+97":4,"ieee754":3}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\ieee754\\index.js","/..\\..\\node_modules\\ieee754")
},{"buffer":2,"e/U+97":4}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\process\\browser.js","/..\\..\\node_modules\\process")
},{"buffer":2,"e/U+97":4}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var instances = {};

HTMLElement.prototype.updateTo = function(content) {
  if (typeof content === 'string') this.innerHTML = content;
  else if (content instanceof HTMLElement) {
    this.innerHTML = '';
    this.appendChild(content);
  }
}
function serializeForm(form) {
  return Array.from(form).reduce((result, input) => {
    if (input.type !== 'submit') result[input.name] = input.value;
    return result;
  }, {});
}
function secureNumInput(max, min, step = 1) {
  return function(e) {
    if ((e.keyCode < 48 || e.keyCode > 57) && !([8, 46, 37, 39, 13].indexOf(e.keyCode) + 1)) {
      if (e.keyCode == 38 && e.target.value < max - step)
        e.target.value = +e.target.value + step;
      if (e.keyCode == 40 && e.target.value > min + step)
        e.target.value = +e.target.value - step;
      e.preventDefault();
    }
  }
}
const EasingFunctions = {
  linear: function (t) { return t },
  easeInQuad: function (t) { return t*t },
  easeOutQuad: function (t) { return t*(2-t) },
  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  easeInCubic: function (t) { return t*t*t },
  easeOutCubic: function (t) { return (--t)*t*t+1 },
  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  easeInQuart: function (t) { return t*t*t*t },
  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  easeInQuint: function (t) { return t*t*t*t*t },
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}
function scrollTo(e) {
  e.preventDefault();
  let scrollTo = document.getElementById(this.href.match(/[a-zA-Z]+$/i)[0]).offsetTop,
      fora = document.getElementById('lazyscroll').offsetHeight,
      scrollFrom = window.pageYOffset,
      scrollDifference = scrollTo - scrollFrom,
      duration = 400,
      fps = 120,
      timestamp = performance.now(),
      ease = 'linear',
      timer = setInterval(() => {
        let animationTime = performance.now() - timestamp;
        if (animationTime >= duration) clearInterval(timer);
        window.scrollTo(0, scrollFrom + (EasingFunctions[ease](animationTime / duration) * scrollDifference) - fora);
      }, 1000 / fps)
}
class Store {
  constructor(urlToJSON = false, containerQuery = false) {
    instances.store = this;
    this.urlToSubmit = '/';
    this.container = {
      basket: document.querySelector(containerQuery + ' aside .basket-container'),
      filter: document.querySelector(containerQuery + ' aside .filter-container'),
      article: document.querySelector(containerQuery + ' article')
    };
    this.filter = false;
    this.basket = false;
    this.modal  = new Modal('#modalbox');
    this.init = false;

    // Getting JSON with products
    fetch(urlToJSON)
      .then(data => data.json())
      .then(json => {
        this.products = json.products.map((product, index) => new Product(product, index));
        this.exchangeCourse = json.exchangeCourse;
      })
      .then(() => this.build());
  }
  build() {
    // sessionStorage
    let activeShipments = this.products.filter(item => !!item.ammount);
    if (!this.init) {
        activeShipments = JSON.parse(sessionStorage.getItem('selected')) || [];
        if (activeShipments.length != 0) activeShipments.map(item => this.products[item.id].ammount = item.ammount );
    } else {sessionStorage.setItem('selected', JSON.stringify(this.products.filter(item => !!item.ammount).reduce((result, item) => {
              result.push({id: item.props.id, ammount: item.ammount});
              return result;
            },[])));
    }
    this.init = true;

    //Initializing filter & basket
    if (!this.filter) this.filter = new Filter(this.container.filter, this.products, this.build.bind(this));
    if (!this.basket) this.basket = new Basket(this.container.basket);

    this.container.article.innerHTML = '';
    this.filter.sort(this.products).map(item => this.container.article.appendChild(item.render()));
    if (this.container.article.children.length == 0) this.container.article.innerHTML = '<p class="no-data">По данному фильтру товаров нет</p>';


    // callback
    if (this.onLoad) this.onLoad();
  }
  send(data) {
    this.modal.toggle();
    data.shipments = this.products.filter(item => !!item.ammount).reduce((sum, item) => {
        sum.push({name:item.props.name, ammount: item.ammount})
        item.ammount = 0;
        return sum;
      },[]);
    sessionStorage.removeItem('selected');
    this.build();
    instances.basket.render();
    // fetch(this.urlToSubmit, {
    //   method: 'post',
    //   headers: {
    //     "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    //   },
    //   body: JSON.stringify(data)
    // })
    // .then(data => data.json())
    // .then(data => {
    //   console.log('Request succeeded with JSON response', data);
    // })
    // .catch(error => {
    //   console.log('Request failed', error);
    // });

  }

}
class Modal {
  constructor(containerQuery) {
    instances.modal = this;
    this.container = document.querySelector(containerQuery);
    this.content = this.container.querySelector('.content');
    this.caption = this.container.querySelector('.caption');
    this.open = false;
    // DOM preprartions
    this.container.querySelector('.close').onclick = this.toggle.bind(this);

    // callbacks
    this.onOpen = false;
    this.onClose = false;
    this.onRender = false;
  }
  toggle() {
    document.body.classList.toggle('modalmode');
    this.open = !this.open;
    if (this.open && this.onOpen) this.onOpen();
    else if(this.onClose) this.onClose();
  }
  render(pageName, innerHTML) {
    this.content.updateTo(innerHTML);
    this.caption.updateTo(pageName);
    if (this.onRender) this.onRender();
    if (!this.open) this.toggle();
  }
}
class Product {
  constructor(data, id) {
    this.ammount = 0;
    this.props = data;
    this.props.id = id;
    this.currencyCode = {
      r: '8381',
      g: '8372',
      d: '36'
    }
  }
  getCurrency() {
    return String.fromCharCode(this.currencyCode[this.props.currency])
  }
  render(mode = false) {
    let currency = this.getCurrency(),
        template = document.createElement('div'),
        inBasket = !!this.ammount ? 'in-basket' : '',
        buttonText = !!this.ammount ? `В корзине (${this.ammount})` : 'Купить';

    if (mode === 'basket') {

      template.innerHTML = `
        <div class="item">
          <img src="${this.props.image}" alt="${this.props.name}" />
          <p>${this.props.name}</p>
            <p>
              <span class="price">${this.props.price} ${currency}</span> x
              <input class="ammount" type="text" value="${this.ammount}" /> =
              <span class="result-price">${this.props.price * this.ammount} ${currency}</span>
              <button class="remove">Удалить</button>

            </p>
        </div>
      `;

      // ACTIONS
      let ammount = template.querySelector('.ammount'),
          resultPrice = template.querySelector('.result-price'),
          remove = template.querySelector('.remove');

      ammount.onkeydown = secureNumInput(100, 0, 1);
      ammount.onkeyup = e => {
        e.preventDefault();
        resultPrice.innerHTML = (this.ammount = +ammount.value) * this.props.price + ' ' + currency;
        instances.basket.render();
        instances.store.build();
        instances.basket.recount();
      }
      remove.onclick = e => {
        this.ammount = 0;
        instances.basket.render();
        instances.basket.checkout();
        instances.store.build();
      }


    } else {

      template.innerHTML = `
        <figure class="product ${inBasket}">
          <img src="${this.props.image}" alt="${this.props.name}" />
          <h3>${this.props.name}</h3>
          <div class="panel">
            <span class="price">${this.props.price} ${currency}</span>
            <button class="buy">${buttonText}</button>
          </div>
        </figure>
      `;

      // ACTIONS
      let container = template.querySelector('.product'),
          buy = template.querySelector('.buy');

      buy.onclick = e => {
        e.preventDefault();
        instances.basket.show(this);
        instances.basket.render();
      }
    }


    return template.firstElementChild;
  }
}
class Basket {
  constructor(container) {
    this.container = container;
    instances.basket = this;
    this.render();

  }
  show(product) {
    let template = document.createElement('div'),
        currency = String.fromCharCode(product.currencyCode[product.props.currency]),
        deleteProduct = !!product.ammount ? '<button class="remove">Удалить</button>' : '',
        buyProduct = !!product.ammount ? 'Изменить' : 'В корзину';

     template.innerHTML = `
      <div class="basket-product">
        <div>
          <p class="description">
            ${product.props.description || `<div class="no-data">Нет описания</div>`}
          </p>
        </div>
        <div>
          <img src="${product.props.image}" alt="${product.props.name}" title="Купить ${product.props.name}!" />
          <p><span class="price">${product.props.price} ${currency}</span></p>
          <p><form><input class="ammount" type="text" value="${product.ammount || 1}" maxlength="2" /></form></p>
          <p><button class="buy">${buyProduct}</button>${deleteProduct}</p>
        </div>
      <div>
    `;

    // ACTIONS
    let ammount = template.querySelector('.ammount'),
        form = template.querySelector('form'),
        buy = template.querySelector('.buy'),
        remove = template.querySelector('.remove') || false,
        changeAmmount = (value = false) => e => {
          e.preventDefault();
          product.ammount = (value !== false) ? value : +ammount.value;
          instances.modal.toggle();
          instances.store.build();
          this.render();
        };

    ammount.onkeydown = secureNumInput(100, 0, 1);
    buy.onclick = form.onsubmit = changeAmmount();
    if (remove) remove.onclick = changeAmmount(0);

    instances.modal.render('Страница товара', template.firstElementChild);
    ammount.focus();
  }
  checkout() {
    let template = document.createElement('div'),
        products = instances.store.products.filter(item => !!item.ammount),
        productContainer = document.createElement('div');

    // If basket empty, closeing it
    if (products.length === 0) {
      instances.modal.toggle();
      return;
    }

    products.map(item => productContainer.appendChild(item.render('basket')));

    let totalPrice = products.reduce((sum, item) => {
          if (!!item.ammount) sum += item.ammount * item.props.price;
          return sum;
        }, 0),
        currency = products[0].getCurrency();

    template.innerHTML = `
      <div class="basket-checkout">
        <div class="list">

        </div>
        <div>
          <div class="total-price">
            Общая сумма
            <span class="value">${totalPrice} ${currency}</span>
          </div>
            <form>
              <input type="text" name="name" placeholder="* Имя..." required />
              <input type="text" name="phone" placeholder="* Телефон..." required />
              <textarea name="comment" placeholder="Коментарий к заказу..."></textarea>
              <input type="submit" value="Отправить" />
            </form>
          </div>
        </div>
      </div>
    `;


    // ACTIONS
    let list = template.querySelector('.list'),
        form = template.querySelector('form');

    list.appendChild(productContainer);
    form.onsubmit = e => {
      e.preventDefault();
      instances.store.send(serializeForm(e.currentTarget.elements));
    }

    instances.modal.render('Оформление заказа', template.firstElementChild);
  }
  recount() {
    let currency = instances.store.products[0].getCurrency(),
        totalPrice = instances.store.products.reduce((sum, item) => {
              if (!!item.ammount) sum += item.ammount * item.props.price;
              return sum;
            }, 0);
    document.querySelector('.total-price .value').innerHTML = totalPrice + ' ' + currency;


  }
  render() {
    let template = document.createElement('div'),
        ammount = instances.store.products.reduce((sum, item) =>  sum + item.ammount * item.props.price, 0),
        count = instances.store.products.reduce((sum, item) =>  sum + item.ammount, 0),
        response = !!ammount ? `<p>${count} товар(ов) на сумму:<br /><span class="price"> ${ammount} рублей</span></p><button class="action">Оформить</button>` : '<div class="no-data">Пусто</div>'

    template.innerHTML = `
      <div id="basket">
        <h3>Корзина</h3>
        ${response}
      </div>
    `;

    // ACTIONS
    let action = template.querySelector('.action');

    if (action) action.onclick = this.checkout.bind(this);


    this.container.updateTo(template.firstElementChild);
  }
}
class Filter {
  constructor(container, products, callback) {
    this.products = products;
    this.callback = callback;
    this.sortFunction = {
      search: item => item.props.name.includes(this.filterConditions.search),
      category: item => item.props.category === this.filterConditions.category,
      min: item => item.props.price > this.filterConditions.min,
      max: item => item.props.price < this.filterConditions.max
    }

    // Rendering aside
    container.appendChild(this.render());

  }
  sort(products) {
    if(this.filterConditions) {
      Object.keys(this.filterConditions).map(condition => {
        if(this.filterConditions[condition] !== '') products = products.filter(this.sortFunction[condition]);
      });
    }
    return products;
  }
  render() {
    let template = document.createElement('div'),
        categories = this.products.reduce((array, item) => {
            if (!(array.indexOf(item.props.category) + 1)) array.push(item.props.category);
            return array;
          }, []),
        selectOptions = categories.reduce((row, item) => row += `<option value="${item}">${item}</option>`, '<option value="">все</option>');

    template.innerHTML = `
      <form id="filter">
        <label>
          <input type="text" name="search" placeholder="поиск...">
        </label>
        <hr />
        <span>Категория</span>
        <label>
          <select name="category">
            ${selectOptions}
          </select>
        </label>
        <hr />
        <span>Цена</span>
        <label class="inline">
          <input type="text" class="price" name="min" placeholder="от...">
        </label>
        <label class="inline">
          <input type="text" class="price" name="max" placeholder="до...">
        </label>
      </form>
    `;

    // ACTIONS
    this.form = template.querySelector('form');
    let numInputs = Array.from(template.querySelectorAll('.price'));

    this.form.onchange = this.form.onsubmit = (e) => {
      this.filterConditions = serializeForm(e.currentTarget.elements);
      this.callback();
    }
    numInputs.map(item => item.onkeydown = secureNumInput(2000, 0, 100))


    return template.firstElementChild;
  }
}

window.onload = function () {

  // Store
  var products = new Store('static/products.json', '#products .content');
  products.onLoad = function () {
    var nav = document.querySelector('nav'),
        aside = document.querySelector('aside'),
        slide = document.querySelector('aside .slide');
    window.onscroll = function (e) {
      var correctScroll = e.target.scrollingElement.scrollTop - aside.offsetTop + nav.offsetHeight;
      if (correctScroll < 0) slide.style.transform = 'translateY(0px)';else if (correctScroll > aside.offsetHeight - slide.offsetHeight) slide.style.transform = 'translateY(' + (aside.offsetHeight - slide.offsetHeight) + 'px)';else if (correctScroll > 0 && correctScroll < aside.offsetHeight - slide.offsetHeight) slide.style.transform = 'translateY(' + correctScroll + 'px)';
    };
  };

  // Scroll
  Array.from(document.querySelectorAll('a[href^="#"]')).map(function (item) {
    return item.onclick = scrollTo;
  });
};
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_c5ccc465.js","/")
},{"buffer":2,"e/U+97":4}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxQcm9qZWN0c1xca3VwZWNoZXNraXlkb21cXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkM6L1Byb2plY3RzL2t1cGVjaGVza2l5ZG9tL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIkM6L1Byb2plY3RzL2t1cGVjaGVza2l5ZG9tL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCJDOi9Qcm9qZWN0cy9rdXBlY2hlc2tpeWRvbS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIkM6L1Byb2plY3RzL2t1cGVjaGVza2l5ZG9tL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJDOi9Qcm9qZWN0cy9rdXBlY2hlc2tpeWRvbS9zcmMvanMvZmFrZV9jNWNjYzQ2NS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcXFxcYjY0LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxidWZmZXJcXFxcaW5kZXguanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGllZWU3NTRcXFxcaW5kZXguanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcaWVlZTc1NFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXFxcXGJyb3dzZXIuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxccHJvY2Vzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGluc3RhbmNlcyA9IHt9O1xuXG4vLz0gX2Z1bmN0aW9ucy5qc1xuLy89IF9zdG9yZS5jbGFzcy5qc1xuLy89IF9tb2RhbC5jbGFzcy5qc1xuLy89IF9wcm9kdWN0LmNsYXNzLmpzXG4vLz0gX2Jhc2tldC5jbGFzcy5qc1xuLy89IF9maWx0ZXIuY2xhc3MuanNcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcblxuICAvLyBTdG9yZVxuICB2YXIgcHJvZHVjdHMgPSBuZXcgU3RvcmUoJ3N0YXRpYy9wcm9kdWN0cy5qc29uJywgJyNwcm9kdWN0cyAuY29udGVudCcpO1xuICBwcm9kdWN0cy5vbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5hdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ25hdicpLFxuICAgICAgICBhc2lkZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FzaWRlJyksXG4gICAgICAgIHNsaWRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYXNpZGUgLnNsaWRlJyk7XG4gICAgd2luZG93Lm9uc2Nyb2xsID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciBjb3JyZWN0U2Nyb2xsID0gZS50YXJnZXQuc2Nyb2xsaW5nRWxlbWVudC5zY3JvbGxUb3AgLSBhc2lkZS5vZmZzZXRUb3AgKyBuYXYub2Zmc2V0SGVpZ2h0O1xuICAgICAgaWYgKGNvcnJlY3RTY3JvbGwgPCAwKSBzbGlkZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgwcHgpJztlbHNlIGlmIChjb3JyZWN0U2Nyb2xsID4gYXNpZGUub2Zmc2V0SGVpZ2h0IC0gc2xpZGUub2Zmc2V0SGVpZ2h0KSBzbGlkZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgnICsgKGFzaWRlLm9mZnNldEhlaWdodCAtIHNsaWRlLm9mZnNldEhlaWdodCkgKyAncHgpJztlbHNlIGlmIChjb3JyZWN0U2Nyb2xsID4gMCAmJiBjb3JyZWN0U2Nyb2xsIDwgYXNpZGUub2Zmc2V0SGVpZ2h0IC0gc2xpZGUub2Zmc2V0SGVpZ2h0KSBzbGlkZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgnICsgY29ycmVjdFNjcm9sbCArICdweCknO1xuICAgIH07XG4gIH07XG5cbiAgLy8gU2Nyb2xsXG4gIEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYVtocmVmXj1cIiNcIl0nKSkubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0ub25jbGljayA9IHNjcm9sbFRvO1xuICB9KTtcbn07XG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zha2VfYzVjY2M0NjUuanNcIixcIi9cIikiXX0=
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcclxudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcclxuXHJcbjsoZnVuY3Rpb24gKGV4cG9ydHMpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBBcnIgPSAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKVxyXG4gICAgPyBVaW50OEFycmF5XHJcbiAgICA6IEFycmF5XHJcblxyXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxyXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxyXG5cdHZhciBOVU1CRVIgPSAnMCcuY2hhckNvZGVBdCgwKVxyXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxyXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxyXG5cdHZhciBQTFVTX1VSTF9TQUZFID0gJy0nLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxyXG5cclxuXHRmdW5jdGlvbiBkZWNvZGUgKGVsdCkge1xyXG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxyXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcclxuXHRcdCAgICBjb2RlID09PSBQTFVTX1VSTF9TQUZFKVxyXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXHJcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcclxuXHRcdCAgICBjb2RlID09PSBTTEFTSF9VUkxfU0FGRSlcclxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xyXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXHJcblx0XHRcdHJldHVybiAtMSAvL25vIG1hdGNoXHJcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxyXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcclxuXHRcdGlmIChjb2RlIDwgVVBQRVIgKyAyNilcclxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxyXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxyXG5cdFx0XHRyZXR1cm4gY29kZSAtIExPV0VSICsgMjZcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5IChiNjQpIHtcclxuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXHJcblxyXG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXHJcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XHJcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcclxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xyXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxyXG5cdFx0dmFyIGxlbiA9IGI2NC5sZW5ndGhcclxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxyXG5cclxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxyXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXHJcblxyXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xyXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcclxuXHJcblx0XHR2YXIgTCA9IDBcclxuXHJcblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XHJcblx0XHRcdGFycltMKytdID0gdlxyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcclxuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcclxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxyXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDApID4+IDgpXHJcblx0XHRcdHB1c2godG1wICYgMHhGRilcclxuXHRcdH1cclxuXHJcblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XHJcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxyXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXHJcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xyXG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcclxuXHRcdFx0cHVzaCgodG1wID4+IDgpICYgMHhGRilcclxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhcnJcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XHJcblx0XHR2YXIgaSxcclxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXHJcblx0XHRcdG91dHB1dCA9IFwiXCIsXHJcblx0XHRcdHRlbXAsIGxlbmd0aFxyXG5cclxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XHJcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xyXG5cdFx0XHRyZXR1cm4gZW5jb2RlKG51bSA+PiAxOCAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiAxMiAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiA2ICYgMHgzRikgKyBlbmNvZGUobnVtICYgMHgzRilcclxuXHRcdH1cclxuXHJcblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXHJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcclxuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcclxuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcclxuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xyXG5cdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdXHJcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXHJcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXHJcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSdcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIDI6XHJcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSlcclxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXHJcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXHJcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCAyKSAmIDB4M0YpXHJcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dHB1dFxyXG5cdH1cclxuXHJcblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XHJcblx0ZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NFxyXG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXHJcblxyXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxiYXNlNjQtanNcXFxcbGliXFxcXGI2NC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxiYXNlNjQtanNcXFxcbGliXCIpXHJcbn0se1wiYnVmZmVyXCI6MixcImUvVSs5N1wiOjR9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcclxuKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xyXG4vKiFcclxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxyXG4gKiBAbGljZW5zZSAgTUlUXHJcbiAqL1xyXG5cclxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXHJcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXHJcblxyXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXHJcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcclxuXHJcbi8qKlxyXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XHJcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXHJcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcclxuICovXHJcbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXHJcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xyXG4gIC8vIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcywgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnRcclxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxyXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcclxuICB0cnkge1xyXG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxyXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcclxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XHJcbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxyXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59KSgpXHJcblxyXG4vKipcclxuICogQ2xhc3M6IEJ1ZmZlclxyXG4gKiA9PT09PT09PT09PT09XHJcbiAqXHJcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxyXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcclxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xyXG4gKiBhIHNpbmdsZSBvY3RldC5cclxuICpcclxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcclxuICogcHJvdG90eXBlLlxyXG4gKi9cclxuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XHJcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXHJcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxyXG5cclxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XHJcblxyXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcclxuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXHJcbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xyXG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcclxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcclxuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxyXG4gIHZhciBsZW5ndGhcclxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXHJcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcclxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcclxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxyXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxyXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBhc3N1bWUgdGhhdCBvYmplY3QgaXMgYXJyYXktbGlrZVxyXG4gIGVsc2VcclxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxyXG5cclxuICB2YXIgYnVmXHJcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcclxuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcclxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxyXG4gICAgYnVmID0gdGhpc1xyXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxyXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcclxuICB9XHJcblxyXG4gIHZhciBpXHJcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcclxuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XHJcbiAgICBidWYuX3NldChzdWJqZWN0KVxyXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xyXG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcclxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcclxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcclxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICBidWZbaV0gPSAwXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYnVmXHJcbn1cclxuXHJcbi8vIFNUQVRJQyBNRVRIT0RTXHJcbi8vID09PT09PT09PT09PT09XHJcblxyXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xyXG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICBjYXNlICdoZXgnOlxyXG4gICAgY2FzZSAndXRmOCc6XHJcbiAgICBjYXNlICd1dGYtOCc6XHJcbiAgICBjYXNlICdhc2NpaSc6XHJcbiAgICBjYXNlICdiaW5hcnknOlxyXG4gICAgY2FzZSAnYmFzZTY0JzpcclxuICAgIGNhc2UgJ3Jhdyc6XHJcbiAgICBjYXNlICd1Y3MyJzpcclxuICAgIGNhc2UgJ3Vjcy0yJzpcclxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxyXG4gICAgY2FzZSAndXRmLTE2bGUnOlxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xyXG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcclxufVxyXG5cclxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xyXG4gIHZhciByZXRcclxuICBzdHIgPSBzdHIgKyAnJ1xyXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XHJcbiAgICBjYXNlICdoZXgnOlxyXG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndXRmOCc6XHJcbiAgICBjYXNlICd1dGYtOCc6XHJcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdhc2NpaSc6XHJcbiAgICBjYXNlICdiaW5hcnknOlxyXG4gICAgY2FzZSAncmF3JzpcclxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYmFzZTY0JzpcclxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndWNzMic6XHJcbiAgICBjYXNlICd1Y3MtMic6XHJcbiAgICBjYXNlICd1dGYxNmxlJzpcclxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcclxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXHJcbiAgfVxyXG4gIHJldHVybiByZXRcclxufVxyXG5cclxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xyXG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcclxuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXHJcblxyXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcclxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XHJcbiAgICByZXR1cm4gbGlzdFswXVxyXG4gIH1cclxuXHJcbiAgdmFyIGlcclxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xyXG4gICAgdG90YWxMZW5ndGggPSAwXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXHJcbiAgdmFyIHBvcyA9IDBcclxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXHJcbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXHJcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcclxuICB9XHJcbiAgcmV0dXJuIGJ1ZlxyXG59XHJcblxyXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXHJcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcclxuICBpZiAoIWxlbmd0aCkge1xyXG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXHJcbiAgfSBlbHNlIHtcclxuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXHJcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XHJcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcclxuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxyXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcclxuXHJcbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcclxuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcclxuICB9XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXHJcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcclxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcclxuICB9XHJcbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxyXG4gIHJldHVybiBpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XHJcbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxyXG59XHJcblxyXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cclxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxyXG59XHJcblxyXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cclxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxyXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cclxufVxyXG5cclxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cclxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcclxuICByZXR1cm4gY2hhcnNXcml0dGVuXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcclxuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxyXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xyXG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XHJcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXHJcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxyXG4gICAgfVxyXG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcclxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcclxuICAgIGVuY29kaW5nID0gb2Zmc2V0XHJcbiAgICBvZmZzZXQgPSBsZW5ndGhcclxuICAgIGxlbmd0aCA9IHN3YXBcclxuICB9XHJcblxyXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcclxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcclxuICBpZiAoIWxlbmd0aCkge1xyXG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXHJcbiAgfSBlbHNlIHtcclxuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXHJcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XHJcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xyXG4gICAgfVxyXG4gIH1cclxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcclxuXHJcbiAgdmFyIHJldFxyXG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcclxuICAgIGNhc2UgJ2hleCc6XHJcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndXRmOCc6XHJcbiAgICBjYXNlICd1dGYtOCc6XHJcbiAgICAgIHJldCA9IF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2FzY2lpJzpcclxuICAgICAgcmV0ID0gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2JpbmFyeSc6XHJcbiAgICAgIHJldCA9IF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYmFzZTY0JzpcclxuICAgICAgcmV0ID0gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd1Y3MyJzpcclxuICAgIGNhc2UgJ3Vjcy0yJzpcclxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxyXG4gICAgY2FzZSAndXRmLTE2bGUnOlxyXG4gICAgICByZXQgPSBfdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxyXG4gIH1cclxuICByZXR1cm4gcmV0XHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgc2VsZiA9IHRoaXNcclxuXHJcbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXHJcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcclxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXHJcbiAgICA/IE51bWJlcihlbmQpXHJcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXHJcblxyXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcclxuICBpZiAoZW5kID09PSBzdGFydClcclxuICAgIHJldHVybiAnJ1xyXG5cclxuICB2YXIgcmV0XHJcbiAgc3dpdGNoIChlbmNvZGluZykge1xyXG4gICAgY2FzZSAnaGV4JzpcclxuICAgICAgcmV0ID0gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd1dGY4JzpcclxuICAgIGNhc2UgJ3V0Zi04JzpcclxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYXNjaWknOlxyXG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYmluYXJ5JzpcclxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdiYXNlNjQnOlxyXG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3VjczInOlxyXG4gICAgY2FzZSAndWNzLTInOlxyXG4gICAgY2FzZSAndXRmMTZsZSc6XHJcbiAgICBjYXNlICd1dGYtMTZsZSc6XHJcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXHJcbiAgfVxyXG4gIHJldHVybiByZXRcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHR5cGU6ICdCdWZmZXInLFxyXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXHJcbiAgfVxyXG59XHJcblxyXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXHJcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciBzb3VyY2UgPSB0aGlzXHJcblxyXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxyXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcclxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxyXG5cclxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcclxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXHJcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXHJcblxyXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcclxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxyXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxyXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXHJcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXHJcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxyXG5cclxuICAvLyBBcmUgd2Ugb29iP1xyXG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcclxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXHJcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcclxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxyXG5cclxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcclxuXHJcbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcclxuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXHJcbiAgfSBlbHNlIHtcclxuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcclxuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XHJcbiAgdmFyIHJlcyA9ICcnXHJcbiAgdmFyIHRtcCA9ICcnXHJcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxyXG5cclxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xyXG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XHJcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXHJcbiAgICAgIHRtcCA9ICcnXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcclxufVxyXG5cclxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciByZXQgPSAnJ1xyXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcclxuXHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXHJcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXHJcbiAgcmV0dXJuIHJldFxyXG59XHJcblxyXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuXHJcbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxyXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cclxuXHJcbiAgdmFyIG91dCA9ICcnXHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcclxuICAgIG91dCArPSB0b0hleChidWZbaV0pXHJcbiAgfVxyXG4gIHJldHVybiBvdXRcclxufVxyXG5cclxuZnVuY3Rpb24gX3V0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XHJcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXHJcbiAgdmFyIHJlcyA9ICcnXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xyXG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxyXG4gIH1cclxuICByZXR1cm4gcmVzXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xyXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxyXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcclxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxyXG5cclxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xyXG4gICAgcmV0dXJuIEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxyXG4gIH0gZWxzZSB7XHJcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxyXG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xyXG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cclxuICAgIH1cclxuICAgIHJldHVybiBuZXdCdWZcclxuICB9XHJcbn1cclxuXHJcbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXHJcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xyXG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxyXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXHJcbn1cclxuXHJcbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXHJcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xyXG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxyXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxyXG59XHJcblxyXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICB2YXIgdmFsXHJcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xyXG4gICAgdmFsID0gYnVmW29mZnNldF1cclxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxyXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcclxuICB9IGVsc2Uge1xyXG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxyXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXHJcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cclxuICB9XHJcbiAgcmV0dXJuIHZhbFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHZhciB2YWxcclxuICBpZiAobGl0dGxlRW5kaWFuKSB7XHJcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcclxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XHJcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcclxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XHJcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cclxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxyXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxyXG4gIH0gZWxzZSB7XHJcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcclxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XHJcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcclxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XHJcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcclxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxyXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxyXG4gIH1cclxuICByZXR1cm4gdmFsXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcclxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcclxuICAgIHJldHVyblxyXG5cclxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxyXG4gIGlmIChuZWcpXHJcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXHJcbiAgZWxzZVxyXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxyXG59XHJcblxyXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxyXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcclxuICBpZiAobmVnKVxyXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXHJcbiAgZWxzZVxyXG4gICAgcmV0dXJuIHZhbFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcclxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxyXG4gIGlmIChuZWcpXHJcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXHJcbiAgZWxzZVxyXG4gICAgcmV0dXJuIHZhbFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXHJcbiAgfVxyXG5cclxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cclxuXHJcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XHJcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxyXG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XHJcbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxyXG4gIH1cclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XHJcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxyXG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcclxuICB9XHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxyXG4gIH1cclxuXHJcbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcclxuICAgIHJldHVyblxyXG5cclxuICBpZiAodmFsdWUgPj0gMClcclxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcclxuICBlbHNlXHJcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICBpZiAodmFsdWUgPj0gMClcclxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXHJcbiAgZWxzZVxyXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgKHZhbHVlID49IDApXHJcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxyXG4gIGVsc2VcclxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXHJcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxyXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcclxuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcclxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcclxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcclxuXHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxyXG4gIH1cclxuXHJcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXHJcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcclxuXHJcbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXHJcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxyXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXHJcblxyXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcclxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxyXG5cclxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xyXG4gICAgdGhpc1tpXSA9IHZhbHVlXHJcbiAgfVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIG91dCA9IFtdXHJcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcclxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XHJcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xyXG4gICAgICBicmVha1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cclxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXHJcbiAqL1xyXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcclxuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcclxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXHJcbiAgICAgIHJldHVybiBidWYuYnVmZmVyXHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxyXG4gIH1cclxufVxyXG5cclxuLy8gSEVMUEVSIEZVTkNUSU9OU1xyXG4vLyA9PT09PT09PT09PT09PT09XHJcblxyXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcclxuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXHJcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcclxufVxyXG5cclxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxyXG5cclxuLyoqXHJcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcclxuICovXHJcbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcclxuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxyXG5cclxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcclxuICBhcnIuX2dldCA9IGFyci5nZXRcclxuICBhcnIuX3NldCA9IGFyci5zZXRcclxuXHJcbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcclxuICBhcnIuZ2V0ID0gQlAuZ2V0XHJcbiAgYXJyLnNldCA9IEJQLnNldFxyXG5cclxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxyXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXHJcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcclxuICBhcnIudG9KU09OID0gQlAudG9KU09OXHJcbiAgYXJyLmNvcHkgPSBCUC5jb3B5XHJcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcclxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XHJcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxyXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcclxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXHJcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxyXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XHJcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcclxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxyXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXHJcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcclxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxyXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXHJcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxyXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcclxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcclxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcclxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcclxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcclxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcclxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XHJcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxyXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcclxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXHJcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxyXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcclxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXHJcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXHJcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXHJcbiAgYXJyLmZpbGwgPSBCUC5maWxsXHJcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XHJcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXHJcblxyXG4gIHJldHVybiBhcnJcclxufVxyXG5cclxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcclxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXHJcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXHJcbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxyXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcclxuICBpbmRleCArPSBsZW5cclxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XHJcbiAgcmV0dXJuIDBcclxufVxyXG5cclxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcclxuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxyXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxyXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xyXG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXHJcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcclxuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcclxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcclxuICB9KShzdWJqZWN0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XHJcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XHJcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXHJcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcclxufVxyXG5cclxuZnVuY3Rpb24gdG9IZXggKG4pIHtcclxuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcclxuICByZXR1cm4gbi50b1N0cmluZygxNilcclxufVxyXG5cclxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xyXG4gIHZhciBieXRlQXJyYXkgPSBbXVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXHJcbiAgICBpZiAoYiA8PSAweDdGKVxyXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcclxuICAgIGVsc2Uge1xyXG4gICAgICB2YXIgc3RhcnQgPSBpXHJcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXHJcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxyXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGJ5dGVBcnJheVxyXG59XHJcblxyXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xyXG4gIHZhciBieXRlQXJyYXkgPSBbXVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cclxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcclxuICB9XHJcbiAgcmV0dXJuIGJ5dGVBcnJheVxyXG59XHJcblxyXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XHJcbiAgdmFyIGMsIGhpLCBsb1xyXG4gIHZhciBieXRlQXJyYXkgPSBbXVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcclxuICAgIGhpID0gYyA+PiA4XHJcbiAgICBsbyA9IGMgJSAyNTZcclxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxyXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gYnl0ZUFycmF5XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xyXG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxyXG59XHJcblxyXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICB2YXIgcG9zXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxyXG4gICAgICBicmVha1xyXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXHJcbiAgfVxyXG4gIHJldHVybiBpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxyXG4gIH1cclxufVxyXG5cclxuLypcclxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcclxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcclxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXHJcbiAqL1xyXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcclxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxyXG4gIGFzc2VydCh2YWx1ZSA+PSAwLCAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxyXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcclxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxyXG59XHJcblxyXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xyXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXHJcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXHJcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxyXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCAodmFsdWUsIG1heCwgbWluKSB7XHJcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcclxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcclxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xyXG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxyXG59XHJcblxyXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxidWZmZXJcXFxcaW5kZXguanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYnVmZmVyXCIpXHJcbn0se1wiYmFzZTY0LWpzXCI6MSxcImJ1ZmZlclwiOjIsXCJlL1UrOTdcIjo0LFwiaWVlZTc1NFwiOjN9XSwzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcclxuKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xyXG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xyXG4gIHZhciBlLCBtXHJcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcclxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxyXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxyXG4gIHZhciBuQml0cyA9IC03XHJcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxyXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxyXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXHJcblxyXG4gIGkgKz0gZFxyXG5cclxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxyXG4gIHMgPj49ICgtbkJpdHMpXHJcbiAgbkJpdHMgKz0gZUxlblxyXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XHJcblxyXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXHJcbiAgZSA+Pj0gKC1uQml0cylcclxuICBuQml0cyArPSBtTGVuXHJcbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cclxuXHJcbiAgaWYgKGUgPT09IDApIHtcclxuICAgIGUgPSAxIC0gZUJpYXNcclxuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcclxuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxyXG4gIH0gZWxzZSB7XHJcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXHJcbiAgICBlID0gZSAtIGVCaWFzXHJcbiAgfVxyXG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXHJcbn1cclxuXHJcbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcclxuICB2YXIgZSwgbSwgY1xyXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXHJcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcclxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcclxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXHJcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxyXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxyXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXHJcblxyXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXHJcblxyXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XHJcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcclxuICAgIGUgPSBlTWF4XHJcbiAgfSBlbHNlIHtcclxuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxyXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xyXG4gICAgICBlLS1cclxuICAgICAgYyAqPSAyXHJcbiAgICB9XHJcbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcclxuICAgICAgdmFsdWUgKz0gcnQgLyBjXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcclxuICAgIH1cclxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xyXG4gICAgICBlKytcclxuICAgICAgYyAvPSAyXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XHJcbiAgICAgIG0gPSAwXHJcbiAgICAgIGUgPSBlTWF4XHJcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XHJcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxyXG4gICAgICBlID0gZSArIGVCaWFzXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcclxuICAgICAgZSA9IDBcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XHJcblxyXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cclxuICBlTGVuICs9IG1MZW5cclxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XHJcblxyXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxyXG59XHJcblxyXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxpZWVlNzU0XFxcXGluZGV4LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGllZWU3NTRcIilcclxufSx7XCJidWZmZXJcIjoyLFwiZS9VKzk3XCI6NH1dLDQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xyXG4oZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XHJcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxyXG5cclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xyXG5cclxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcclxuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XHJcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXHJcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcclxuICAgIDtcclxuXHJcbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNhblBvc3QpIHtcclxuICAgICAgICB2YXIgcXVldWUgPSBbXTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xyXG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xyXG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcclxuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XHJcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xyXG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcclxuICAgIH07XHJcbn0pKCk7XHJcblxyXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xyXG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xyXG5wcm9jZXNzLmVudiA9IHt9O1xyXG5wcm9jZXNzLmFyZ3YgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIG5vb3AoKSB7fVxyXG5cclxucHJvY2Vzcy5vbiA9IG5vb3A7XHJcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xyXG5wcm9jZXNzLm9uY2UgPSBub29wO1xyXG5wcm9jZXNzLm9mZiA9IG5vb3A7XHJcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xyXG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XHJcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XHJcblxyXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xyXG59XHJcblxyXG4vLyBUT0RPKHNodHlsbWFuKVxyXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xyXG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcclxufTtcclxuXHJcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXHByb2Nlc3NcXFxcYnJvd3Nlci5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXCIpXHJcbn0se1wiYnVmZmVyXCI6MixcImUvVSs5N1wiOjR9XSw1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcclxuKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgaW5zdGFuY2VzID0ge307XHJcblxyXG5IVE1MRWxlbWVudC5wcm90b3R5cGUudXBkYXRlVG8gPSBmdW5jdGlvbihjb250ZW50KSB7XHJcbiAgaWYgKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgdGhpcy5pbm5lckhUTUwgPSBjb250ZW50O1xyXG4gIGVsc2UgaWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xyXG4gICAgdGhpcy5pbm5lckhUTUwgPSAnJztcclxuICAgIHRoaXMuYXBwZW5kQ2hpbGQoY29udGVudCk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIHNlcmlhbGl6ZUZvcm0oZm9ybSkge1xyXG4gIHJldHVybiBBcnJheS5mcm9tKGZvcm0pLnJlZHVjZSgocmVzdWx0LCBpbnB1dCkgPT4ge1xyXG4gICAgaWYgKGlucHV0LnR5cGUgIT09ICdzdWJtaXQnKSByZXN1bHRbaW5wdXQubmFtZV0gPSBpbnB1dC52YWx1ZTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfSwge30pO1xyXG59XHJcbmZ1bmN0aW9uIHNlY3VyZU51bUlucHV0KG1heCwgbWluLCBzdGVwID0gMSkge1xyXG4gIHJldHVybiBmdW5jdGlvbihlKSB7XHJcbiAgICBpZiAoKGUua2V5Q29kZSA8IDQ4IHx8IGUua2V5Q29kZSA+IDU3KSAmJiAhKFs4LCA0NiwgMzcsIDM5LCAxM10uaW5kZXhPZihlLmtleUNvZGUpICsgMSkpIHtcclxuICAgICAgaWYgKGUua2V5Q29kZSA9PSAzOCAmJiBlLnRhcmdldC52YWx1ZSA8IG1heCAtIHN0ZXApXHJcbiAgICAgICAgZS50YXJnZXQudmFsdWUgPSArZS50YXJnZXQudmFsdWUgKyBzdGVwO1xyXG4gICAgICBpZiAoZS5rZXlDb2RlID09IDQwICYmIGUudGFyZ2V0LnZhbHVlID4gbWluICsgc3RlcClcclxuICAgICAgICBlLnRhcmdldC52YWx1ZSA9ICtlLnRhcmdldC52YWx1ZSAtIHN0ZXA7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuY29uc3QgRWFzaW5nRnVuY3Rpb25zID0ge1xyXG4gIGxpbmVhcjogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQgfSxcclxuICBlYXNlSW5RdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0IH0sXHJcbiAgZWFzZU91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KigyLXQpIH0sXHJcbiAgZWFzZUluT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8LjUgPyAyKnQqdCA6IC0xKyg0LTIqdCkqdCB9LFxyXG4gIGVhc2VJbkN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQgfSxcclxuICBlYXNlT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAoLS10KSp0KnQrMSB9LFxyXG4gIGVhc2VJbk91dEN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwuNSA/IDQqdCp0KnQgOiAodC0xKSooMip0LTIpKigyKnQtMikrMSB9LFxyXG4gIGVhc2VJblF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdCB9LFxyXG4gIGVhc2VPdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDEtKC0tdCkqdCp0KnQgfSxcclxuICBlYXNlSW5PdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8LjUgPyA4KnQqdCp0KnQgOiAxLTgqKC0tdCkqdCp0KnQgfSxcclxuICBlYXNlSW5RdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0KnQqdCB9LFxyXG4gIGVhc2VPdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDErKC0tdCkqdCp0KnQqdCB9LFxyXG4gIGVhc2VJbk91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwuNSA/IDE2KnQqdCp0KnQqdCA6IDErMTYqKC0tdCkqdCp0KnQqdCB9XHJcbn1cclxuZnVuY3Rpb24gc2Nyb2xsVG8oZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICBsZXQgc2Nyb2xsVG8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmhyZWYubWF0Y2goL1thLXpBLVpdKyQvaSlbMF0pLm9mZnNldFRvcCxcclxuICAgICAgZm9yYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsYXp5c2Nyb2xsJykub2Zmc2V0SGVpZ2h0LFxyXG4gICAgICBzY3JvbGxGcm9tID0gd2luZG93LnBhZ2VZT2Zmc2V0LFxyXG4gICAgICBzY3JvbGxEaWZmZXJlbmNlID0gc2Nyb2xsVG8gLSBzY3JvbGxGcm9tLFxyXG4gICAgICBkdXJhdGlvbiA9IDQwMCxcclxuICAgICAgZnBzID0gMTIwLFxyXG4gICAgICB0aW1lc3RhbXAgPSBwZXJmb3JtYW5jZS5ub3coKSxcclxuICAgICAgZWFzZSA9ICdsaW5lYXInLFxyXG4gICAgICB0aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICBsZXQgYW5pbWF0aW9uVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpIC0gdGltZXN0YW1wO1xyXG4gICAgICAgIGlmIChhbmltYXRpb25UaW1lID49IGR1cmF0aW9uKSBjbGVhckludGVydmFsKHRpbWVyKTtcclxuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgc2Nyb2xsRnJvbSArIChFYXNpbmdGdW5jdGlvbnNbZWFzZV0oYW5pbWF0aW9uVGltZSAvIGR1cmF0aW9uKSAqIHNjcm9sbERpZmZlcmVuY2UpIC0gZm9yYSk7XHJcbiAgICAgIH0sIDEwMDAgLyBmcHMpXHJcbn1cclxuY2xhc3MgU3RvcmUge1xyXG4gIGNvbnN0cnVjdG9yKHVybFRvSlNPTiA9IGZhbHNlLCBjb250YWluZXJRdWVyeSA9IGZhbHNlKSB7XHJcbiAgICBpbnN0YW5jZXMuc3RvcmUgPSB0aGlzO1xyXG4gICAgdGhpcy51cmxUb1N1Ym1pdCA9ICcvJztcclxuICAgIHRoaXMuY29udGFpbmVyID0ge1xyXG4gICAgICBiYXNrZXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyUXVlcnkgKyAnIGFzaWRlIC5iYXNrZXQtY29udGFpbmVyJyksXHJcbiAgICAgIGZpbHRlcjogZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJRdWVyeSArICcgYXNpZGUgLmZpbHRlci1jb250YWluZXInKSxcclxuICAgICAgYXJ0aWNsZTogZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJRdWVyeSArICcgYXJ0aWNsZScpXHJcbiAgICB9O1xyXG4gICAgdGhpcy5maWx0ZXIgPSBmYWxzZTtcclxuICAgIHRoaXMuYmFza2V0ID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vZGFsICA9IG5ldyBNb2RhbCgnI21vZGFsYm94Jyk7XHJcbiAgICB0aGlzLmluaXQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBHZXR0aW5nIEpTT04gd2l0aCBwcm9kdWN0c1xyXG4gICAgZmV0Y2godXJsVG9KU09OKVxyXG4gICAgICAudGhlbihkYXRhID0+IGRhdGEuanNvbigpKVxyXG4gICAgICAudGhlbihqc29uID0+IHtcclxuICAgICAgICB0aGlzLnByb2R1Y3RzID0ganNvbi5wcm9kdWN0cy5tYXAoKHByb2R1Y3QsIGluZGV4KSA9PiBuZXcgUHJvZHVjdChwcm9kdWN0LCBpbmRleCkpO1xyXG4gICAgICAgIHRoaXMuZXhjaGFuZ2VDb3Vyc2UgPSBqc29uLmV4Y2hhbmdlQ291cnNlO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbigoKSA9PiB0aGlzLmJ1aWxkKCkpO1xyXG4gIH1cclxuICBidWlsZCgpIHtcclxuICAgIC8vIHNlc3Npb25TdG9yYWdlXHJcbiAgICBsZXQgYWN0aXZlU2hpcG1lbnRzID0gdGhpcy5wcm9kdWN0cy5maWx0ZXIoaXRlbSA9PiAhIWl0ZW0uYW1tb3VudCk7XHJcbiAgICBpZiAoIXRoaXMuaW5pdCkge1xyXG4gICAgICAgIGFjdGl2ZVNoaXBtZW50cyA9IEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnc2VsZWN0ZWQnKSkgfHwgW107XHJcbiAgICAgICAgaWYgKGFjdGl2ZVNoaXBtZW50cy5sZW5ndGggIT0gMCkgYWN0aXZlU2hpcG1lbnRzLm1hcChpdGVtID0+IHRoaXMucHJvZHVjdHNbaXRlbS5pZF0uYW1tb3VudCA9IGl0ZW0uYW1tb3VudCApO1xyXG4gICAgfSBlbHNlIHtzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdzZWxlY3RlZCcsIEpTT04uc3RyaW5naWZ5KHRoaXMucHJvZHVjdHMuZmlsdGVyKGl0ZW0gPT4gISFpdGVtLmFtbW91bnQpLnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe2lkOiBpdGVtLnByb3BzLmlkLCBhbW1vdW50OiBpdGVtLmFtbW91bnR9KTtcclxuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9LFtdKSkpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5pbml0ID0gdHJ1ZTtcclxuXHJcbiAgICAvL0luaXRpYWxpemluZyBmaWx0ZXIgJiBiYXNrZXRcclxuICAgIGlmICghdGhpcy5maWx0ZXIpIHRoaXMuZmlsdGVyID0gbmV3IEZpbHRlcih0aGlzLmNvbnRhaW5lci5maWx0ZXIsIHRoaXMucHJvZHVjdHMsIHRoaXMuYnVpbGQuYmluZCh0aGlzKSk7XHJcbiAgICBpZiAoIXRoaXMuYmFza2V0KSB0aGlzLmJhc2tldCA9IG5ldyBCYXNrZXQodGhpcy5jb250YWluZXIuYmFza2V0KTtcclxuXHJcbiAgICB0aGlzLmNvbnRhaW5lci5hcnRpY2xlLmlubmVySFRNTCA9ICcnO1xyXG4gICAgdGhpcy5maWx0ZXIuc29ydCh0aGlzLnByb2R1Y3RzKS5tYXAoaXRlbSA9PiB0aGlzLmNvbnRhaW5lci5hcnRpY2xlLmFwcGVuZENoaWxkKGl0ZW0ucmVuZGVyKCkpKTtcclxuICAgIGlmICh0aGlzLmNvbnRhaW5lci5hcnRpY2xlLmNoaWxkcmVuLmxlbmd0aCA9PSAwKSB0aGlzLmNvbnRhaW5lci5hcnRpY2xlLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cIm5vLWRhdGFcIj7Qn9C+INC00LDQvdC90L7QvNGDINGE0LjQu9GM0YLRgNGDINGC0L7QstCw0YDQvtCyINC90LXRgjwvcD4nO1xyXG5cclxuXHJcbiAgICAvLyBjYWxsYmFja1xyXG4gICAgaWYgKHRoaXMub25Mb2FkKSB0aGlzLm9uTG9hZCgpO1xyXG4gIH1cclxuICBzZW5kKGRhdGEpIHtcclxuICAgIHRoaXMubW9kYWwudG9nZ2xlKCk7XHJcbiAgICBkYXRhLnNoaXBtZW50cyA9IHRoaXMucHJvZHVjdHMuZmlsdGVyKGl0ZW0gPT4gISFpdGVtLmFtbW91bnQpLnJlZHVjZSgoc3VtLCBpdGVtKSA9PiB7XHJcbiAgICAgICAgc3VtLnB1c2goe25hbWU6aXRlbS5wcm9wcy5uYW1lLCBhbW1vdW50OiBpdGVtLmFtbW91bnR9KVxyXG4gICAgICAgIGl0ZW0uYW1tb3VudCA9IDA7XHJcbiAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgICAgfSxbXSk7XHJcbiAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKCdzZWxlY3RlZCcpO1xyXG4gICAgdGhpcy5idWlsZCgpO1xyXG4gICAgaW5zdGFuY2VzLmJhc2tldC5yZW5kZXIoKTtcclxuICAgIC8vIGZldGNoKHRoaXMudXJsVG9TdWJtaXQsIHtcclxuICAgIC8vICAgbWV0aG9kOiAncG9zdCcsXHJcbiAgICAvLyAgIGhlYWRlcnM6IHtcclxuICAgIC8vICAgICBcIkNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOFwiXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpXHJcbiAgICAvLyB9KVxyXG4gICAgLy8gLnRoZW4oZGF0YSA9PiBkYXRhLmpzb24oKSlcclxuICAgIC8vIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgLy8gICBjb25zb2xlLmxvZygnUmVxdWVzdCBzdWNjZWVkZWQgd2l0aCBKU09OIHJlc3BvbnNlJywgZGF0YSk7XHJcbiAgICAvLyB9KVxyXG4gICAgLy8gLmNhdGNoKGVycm9yID0+IHtcclxuICAgIC8vICAgY29uc29sZS5sb2coJ1JlcXVlc3QgZmFpbGVkJywgZXJyb3IpO1xyXG4gICAgLy8gfSk7XHJcblxyXG4gIH1cclxuXHJcbn1cclxuY2xhc3MgTW9kYWwge1xyXG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lclF1ZXJ5KSB7XHJcbiAgICBpbnN0YW5jZXMubW9kYWwgPSB0aGlzO1xyXG4gICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lclF1ZXJ5KTtcclxuICAgIHRoaXMuY29udGVudCA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50Jyk7XHJcbiAgICB0aGlzLmNhcHRpb24gPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY2FwdGlvbicpO1xyXG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XHJcbiAgICAvLyBET00gcHJlcHJhcnRpb25zXHJcbiAgICB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY2xvc2UnKS5vbmNsaWNrID0gdGhpcy50b2dnbGUuYmluZCh0aGlzKTtcclxuXHJcbiAgICAvLyBjYWxsYmFja3NcclxuICAgIHRoaXMub25PcGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLm9uQ2xvc2UgPSBmYWxzZTtcclxuICAgIHRoaXMub25SZW5kZXIgPSBmYWxzZTtcclxuICB9XHJcbiAgdG9nZ2xlKCkge1xyXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCdtb2RhbG1vZGUnKTtcclxuICAgIHRoaXMub3BlbiA9ICF0aGlzLm9wZW47XHJcbiAgICBpZiAodGhpcy5vcGVuICYmIHRoaXMub25PcGVuKSB0aGlzLm9uT3BlbigpO1xyXG4gICAgZWxzZSBpZih0aGlzLm9uQ2xvc2UpIHRoaXMub25DbG9zZSgpO1xyXG4gIH1cclxuICByZW5kZXIocGFnZU5hbWUsIGlubmVySFRNTCkge1xyXG4gICAgdGhpcy5jb250ZW50LnVwZGF0ZVRvKGlubmVySFRNTCk7XHJcbiAgICB0aGlzLmNhcHRpb24udXBkYXRlVG8ocGFnZU5hbWUpO1xyXG4gICAgaWYgKHRoaXMub25SZW5kZXIpIHRoaXMub25SZW5kZXIoKTtcclxuICAgIGlmICghdGhpcy5vcGVuKSB0aGlzLnRvZ2dsZSgpO1xyXG4gIH1cclxufVxyXG5jbGFzcyBQcm9kdWN0IHtcclxuICBjb25zdHJ1Y3RvcihkYXRhLCBpZCkge1xyXG4gICAgdGhpcy5hbW1vdW50ID0gMDtcclxuICAgIHRoaXMucHJvcHMgPSBkYXRhO1xyXG4gICAgdGhpcy5wcm9wcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5jdXJyZW5jeUNvZGUgPSB7XHJcbiAgICAgIHI6ICc4MzgxJyxcclxuICAgICAgZzogJzgzNzInLFxyXG4gICAgICBkOiAnMzYnXHJcbiAgICB9XHJcbiAgfVxyXG4gIGdldEN1cnJlbmN5KCkge1xyXG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy5jdXJyZW5jeUNvZGVbdGhpcy5wcm9wcy5jdXJyZW5jeV0pXHJcbiAgfVxyXG4gIHJlbmRlcihtb2RlID0gZmFsc2UpIHtcclxuICAgIGxldCBjdXJyZW5jeSA9IHRoaXMuZ2V0Q3VycmVuY3koKSxcclxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG4gICAgICAgIGluQmFza2V0ID0gISF0aGlzLmFtbW91bnQgPyAnaW4tYmFza2V0JyA6ICcnLFxyXG4gICAgICAgIGJ1dHRvblRleHQgPSAhIXRoaXMuYW1tb3VudCA/IGDQkiDQutC+0YDQt9C40L3QtSAoJHt0aGlzLmFtbW91bnR9KWAgOiAn0JrRg9C/0LjRgtGMJztcclxuXHJcbiAgICBpZiAobW9kZSA9PT0gJ2Jhc2tldCcpIHtcclxuXHJcbiAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbVwiPlxyXG4gICAgICAgICAgPGltZyBzcmM9XCIke3RoaXMucHJvcHMuaW1hZ2V9XCIgYWx0PVwiJHt0aGlzLnByb3BzLm5hbWV9XCIgLz5cclxuICAgICAgICAgIDxwPiR7dGhpcy5wcm9wcy5uYW1lfTwvcD5cclxuICAgICAgICAgICAgPHA+XHJcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwcmljZVwiPiR7dGhpcy5wcm9wcy5wcmljZX0gJHtjdXJyZW5jeX08L3NwYW4+IHhcclxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJhbW1vdW50XCIgdHlwZT1cInRleHRcIiB2YWx1ZT1cIiR7dGhpcy5hbW1vdW50fVwiIC8+ID1cclxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInJlc3VsdC1wcmljZVwiPiR7dGhpcy5wcm9wcy5wcmljZSAqIHRoaXMuYW1tb3VudH0gJHtjdXJyZW5jeX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInJlbW92ZVwiPtCj0LTQsNC70LjRgtGMPC9idXR0b24+XHJcblxyXG4gICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcblxyXG4gICAgICAvLyBBQ1RJT05TXHJcbiAgICAgIGxldCBhbW1vdW50ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmFtbW91bnQnKSxcclxuICAgICAgICAgIHJlc3VsdFByaWNlID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignLnJlc3VsdC1wcmljZScpLFxyXG4gICAgICAgICAgcmVtb3ZlID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignLnJlbW92ZScpO1xyXG5cclxuICAgICAgYW1tb3VudC5vbmtleWRvd24gPSBzZWN1cmVOdW1JbnB1dCgxMDAsIDAsIDEpO1xyXG4gICAgICBhbW1vdW50Lm9ua2V5dXAgPSBlID0+IHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgcmVzdWx0UHJpY2UuaW5uZXJIVE1MID0gKHRoaXMuYW1tb3VudCA9ICthbW1vdW50LnZhbHVlKSAqIHRoaXMucHJvcHMucHJpY2UgKyAnICcgKyBjdXJyZW5jeTtcclxuICAgICAgICBpbnN0YW5jZXMuYmFza2V0LnJlbmRlcigpO1xyXG4gICAgICAgIGluc3RhbmNlcy5zdG9yZS5idWlsZCgpO1xyXG4gICAgICAgIGluc3RhbmNlcy5iYXNrZXQucmVjb3VudCgpO1xyXG4gICAgICB9XHJcbiAgICAgIHJlbW92ZS5vbmNsaWNrID0gZSA9PiB7XHJcbiAgICAgICAgdGhpcy5hbW1vdW50ID0gMDtcclxuICAgICAgICBpbnN0YW5jZXMuYmFza2V0LnJlbmRlcigpO1xyXG4gICAgICAgIGluc3RhbmNlcy5iYXNrZXQuY2hlY2tvdXQoKTtcclxuICAgICAgICBpbnN0YW5jZXMuc3RvcmUuYnVpbGQoKTtcclxuICAgICAgfVxyXG5cclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgIDxmaWd1cmUgY2xhc3M9XCJwcm9kdWN0ICR7aW5CYXNrZXR9XCI+XHJcbiAgICAgICAgICA8aW1nIHNyYz1cIiR7dGhpcy5wcm9wcy5pbWFnZX1cIiBhbHQ9XCIke3RoaXMucHJvcHMubmFtZX1cIiAvPlxyXG4gICAgICAgICAgPGgzPiR7dGhpcy5wcm9wcy5uYW1lfTwvaDM+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFuZWxcIj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwcmljZVwiPiR7dGhpcy5wcm9wcy5wcmljZX0gJHtjdXJyZW5jeX08L3NwYW4+XHJcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidXlcIj4ke2J1dHRvblRleHR9PC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2ZpZ3VyZT5cclxuICAgICAgYDtcclxuXHJcbiAgICAgIC8vIEFDVElPTlNcclxuICAgICAgbGV0IGNvbnRhaW5lciA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0JyksXHJcbiAgICAgICAgICBidXkgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcuYnV5Jyk7XHJcblxyXG4gICAgICBidXkub25jbGljayA9IGUgPT4ge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBpbnN0YW5jZXMuYmFza2V0LnNob3codGhpcyk7XHJcbiAgICAgICAgaW5zdGFuY2VzLmJhc2tldC5yZW5kZXIoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICByZXR1cm4gdGVtcGxhdGUuZmlyc3RFbGVtZW50Q2hpbGQ7XHJcbiAgfVxyXG59XHJcbmNsYXNzIEJhc2tldCB7XHJcbiAgY29uc3RydWN0b3IoY29udGFpbmVyKSB7XHJcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcclxuICAgIGluc3RhbmNlcy5iYXNrZXQgPSB0aGlzO1xyXG4gICAgdGhpcy5yZW5kZXIoKTtcclxuXHJcbiAgfVxyXG4gIHNob3cocHJvZHVjdCkge1xyXG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcbiAgICAgICAgY3VycmVuY3kgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHByb2R1Y3QuY3VycmVuY3lDb2RlW3Byb2R1Y3QucHJvcHMuY3VycmVuY3ldKSxcclxuICAgICAgICBkZWxldGVQcm9kdWN0ID0gISFwcm9kdWN0LmFtbW91bnQgPyAnPGJ1dHRvbiBjbGFzcz1cInJlbW92ZVwiPtCj0LTQsNC70LjRgtGMPC9idXR0b24+JyA6ICcnLFxyXG4gICAgICAgIGJ1eVByb2R1Y3QgPSAhIXByb2R1Y3QuYW1tb3VudCA/ICfQmNC30LzQtdC90LjRgtGMJyA6ICfQkiDQutC+0YDQt9C40L3Rgyc7XHJcblxyXG4gICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cImJhc2tldC1wcm9kdWN0XCI+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxwIGNsYXNzPVwiZGVzY3JpcHRpb25cIj5cclxuICAgICAgICAgICAgJHtwcm9kdWN0LnByb3BzLmRlc2NyaXB0aW9uIHx8IGA8ZGl2IGNsYXNzPVwibm8tZGF0YVwiPtCd0LXRgiDQvtC/0LjRgdCw0L3QuNGPPC9kaXY+YH1cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgPGltZyBzcmM9XCIke3Byb2R1Y3QucHJvcHMuaW1hZ2V9XCIgYWx0PVwiJHtwcm9kdWN0LnByb3BzLm5hbWV9XCIgdGl0bGU9XCLQmtGD0L/QuNGC0YwgJHtwcm9kdWN0LnByb3BzLm5hbWV9IVwiIC8+XHJcbiAgICAgICAgICA8cD48c3BhbiBjbGFzcz1cInByaWNlXCI+JHtwcm9kdWN0LnByb3BzLnByaWNlfSAke2N1cnJlbmN5fTwvc3Bhbj48L3A+XHJcbiAgICAgICAgICA8cD48Zm9ybT48aW5wdXQgY2xhc3M9XCJhbW1vdW50XCIgdHlwZT1cInRleHRcIiB2YWx1ZT1cIiR7cHJvZHVjdC5hbW1vdW50IHx8IDF9XCIgbWF4bGVuZ3RoPVwiMlwiIC8+PC9mb3JtPjwvcD5cclxuICAgICAgICAgIDxwPjxidXR0b24gY2xhc3M9XCJidXlcIj4ke2J1eVByb2R1Y3R9PC9idXR0b24+JHtkZWxldGVQcm9kdWN0fTwvcD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPGRpdj5cclxuICAgIGA7XHJcblxyXG4gICAgLy8gQUNUSU9OU1xyXG4gICAgbGV0IGFtbW91bnQgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcuYW1tb3VudCcpLFxyXG4gICAgICAgIGZvcm0gPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCdmb3JtJyksXHJcbiAgICAgICAgYnV5ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmJ1eScpLFxyXG4gICAgICAgIHJlbW92ZSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5yZW1vdmUnKSB8fCBmYWxzZSxcclxuICAgICAgICBjaGFuZ2VBbW1vdW50ID0gKHZhbHVlID0gZmFsc2UpID0+IGUgPT4ge1xyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgcHJvZHVjdC5hbW1vdW50ID0gKHZhbHVlICE9PSBmYWxzZSkgPyB2YWx1ZSA6ICthbW1vdW50LnZhbHVlO1xyXG4gICAgICAgICAgaW5zdGFuY2VzLm1vZGFsLnRvZ2dsZSgpO1xyXG4gICAgICAgICAgaW5zdGFuY2VzLnN0b3JlLmJ1aWxkKCk7XHJcbiAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgYW1tb3VudC5vbmtleWRvd24gPSBzZWN1cmVOdW1JbnB1dCgxMDAsIDAsIDEpO1xyXG4gICAgYnV5Lm9uY2xpY2sgPSBmb3JtLm9uc3VibWl0ID0gY2hhbmdlQW1tb3VudCgpO1xyXG4gICAgaWYgKHJlbW92ZSkgcmVtb3ZlLm9uY2xpY2sgPSBjaGFuZ2VBbW1vdW50KDApO1xyXG5cclxuICAgIGluc3RhbmNlcy5tb2RhbC5yZW5kZXIoJ9Ch0YLRgNCw0L3QuNGG0LAg0YLQvtCy0LDRgNCwJywgdGVtcGxhdGUuZmlyc3RFbGVtZW50Q2hpbGQpO1xyXG4gICAgYW1tb3VudC5mb2N1cygpO1xyXG4gIH1cclxuICBjaGVja291dCgpIHtcclxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG4gICAgICAgIHByb2R1Y3RzID0gaW5zdGFuY2VzLnN0b3JlLnByb2R1Y3RzLmZpbHRlcihpdGVtID0+ICEhaXRlbS5hbW1vdW50KSxcclxuICAgICAgICBwcm9kdWN0Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG4gICAgLy8gSWYgYmFza2V0IGVtcHR5LCBjbG9zZWluZyBpdFxyXG4gICAgaWYgKHByb2R1Y3RzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBpbnN0YW5jZXMubW9kYWwudG9nZ2xlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBwcm9kdWN0cy5tYXAoaXRlbSA9PiBwcm9kdWN0Q29udGFpbmVyLmFwcGVuZENoaWxkKGl0ZW0ucmVuZGVyKCdiYXNrZXQnKSkpO1xyXG5cclxuICAgIGxldCB0b3RhbFByaWNlID0gcHJvZHVjdHMucmVkdWNlKChzdW0sIGl0ZW0pID0+IHtcclxuICAgICAgICAgIGlmICghIWl0ZW0uYW1tb3VudCkgc3VtICs9IGl0ZW0uYW1tb3VudCAqIGl0ZW0ucHJvcHMucHJpY2U7XHJcbiAgICAgICAgICByZXR1cm4gc3VtO1xyXG4gICAgICAgIH0sIDApLFxyXG4gICAgICAgIGN1cnJlbmN5ID0gcHJvZHVjdHNbMF0uZ2V0Q3VycmVuY3koKTtcclxuXHJcbiAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJiYXNrZXQtY2hlY2tvdXRcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwibGlzdFwiPlxyXG5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRvdGFsLXByaWNlXCI+XHJcbiAgICAgICAgICAgINCe0LHRidCw0Y8g0YHRg9C80LzQsFxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZhbHVlXCI+JHt0b3RhbFByaWNlfSAke2N1cnJlbmN5fTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8Zm9ybT5cclxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwibmFtZVwiIHBsYWNlaG9sZGVyPVwiKiDQmNC80Y8uLi5cIiByZXF1aXJlZCAvPlxyXG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJwaG9uZVwiIHBsYWNlaG9sZGVyPVwiKiDQotC10LvQtdGE0L7QvS4uLlwiIHJlcXVpcmVkIC8+XHJcbiAgICAgICAgICAgICAgPHRleHRhcmVhIG5hbWU9XCJjb21tZW50XCIgcGxhY2Vob2xkZXI9XCLQmtC+0LzQtdC90YLQsNGA0LjQuSDQuiDQt9Cw0LrQsNC30YMuLi5cIj48L3RleHRhcmVhPlxyXG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwic3VibWl0XCIgdmFsdWU9XCLQntGC0L/RgNCw0LLQuNGC0YxcIiAvPlxyXG4gICAgICAgICAgICA8L2Zvcm0+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG5cclxuXHJcbiAgICAvLyBBQ1RJT05TXHJcbiAgICBsZXQgbGlzdCA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5saXN0JyksXHJcbiAgICAgICAgZm9ybSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKTtcclxuXHJcbiAgICBsaXN0LmFwcGVuZENoaWxkKHByb2R1Y3RDb250YWluZXIpO1xyXG4gICAgZm9ybS5vbnN1Ym1pdCA9IGUgPT4ge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGluc3RhbmNlcy5zdG9yZS5zZW5kKHNlcmlhbGl6ZUZvcm0oZS5jdXJyZW50VGFyZ2V0LmVsZW1lbnRzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5zdGFuY2VzLm1vZGFsLnJlbmRlcign0J7RhNC+0YDQvNC70LXQvdC40LUg0LfQsNC60LDQt9CwJywgdGVtcGxhdGUuZmlyc3RFbGVtZW50Q2hpbGQpO1xyXG4gIH1cclxuICByZWNvdW50KCkge1xyXG4gICAgbGV0IGN1cnJlbmN5ID0gaW5zdGFuY2VzLnN0b3JlLnByb2R1Y3RzWzBdLmdldEN1cnJlbmN5KCksXHJcbiAgICAgICAgdG90YWxQcmljZSA9IGluc3RhbmNlcy5zdG9yZS5wcm9kdWN0cy5yZWR1Y2UoKHN1bSwgaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgIGlmICghIWl0ZW0uYW1tb3VudCkgc3VtICs9IGl0ZW0uYW1tb3VudCAqIGl0ZW0ucHJvcHMucHJpY2U7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG90YWwtcHJpY2UgLnZhbHVlJykuaW5uZXJIVE1MID0gdG90YWxQcmljZSArICcgJyArIGN1cnJlbmN5O1xyXG5cclxuXHJcbiAgfVxyXG4gIHJlbmRlcigpIHtcclxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG4gICAgICAgIGFtbW91bnQgPSBpbnN0YW5jZXMuc3RvcmUucHJvZHVjdHMucmVkdWNlKChzdW0sIGl0ZW0pID0+ICBzdW0gKyBpdGVtLmFtbW91bnQgKiBpdGVtLnByb3BzLnByaWNlLCAwKSxcclxuICAgICAgICBjb3VudCA9IGluc3RhbmNlcy5zdG9yZS5wcm9kdWN0cy5yZWR1Y2UoKHN1bSwgaXRlbSkgPT4gIHN1bSArIGl0ZW0uYW1tb3VudCwgMCksXHJcbiAgICAgICAgcmVzcG9uc2UgPSAhIWFtbW91bnQgPyBgPHA+JHtjb3VudH0g0YLQvtCy0LDRgCjQvtCyKSDQvdCwINGB0YPQvNC80YM6PGJyIC8+PHNwYW4gY2xhc3M9XCJwcmljZVwiPiAke2FtbW91bnR9INGA0YPQsdC70LXQuTwvc3Bhbj48L3A+PGJ1dHRvbiBjbGFzcz1cImFjdGlvblwiPtCe0YTQvtGA0LzQuNGC0Yw8L2J1dHRvbj5gIDogJzxkaXYgY2xhc3M9XCJuby1kYXRhXCI+0J/Rg9GB0YLQvjwvZGl2PidcclxuXHJcbiAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgaWQ9XCJiYXNrZXRcIj5cclxuICAgICAgICA8aDM+0JrQvtGA0LfQuNC90LA8L2gzPlxyXG4gICAgICAgICR7cmVzcG9uc2V9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgICAvLyBBQ1RJT05TXHJcbiAgICBsZXQgYWN0aW9uID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmFjdGlvbicpO1xyXG5cclxuICAgIGlmIChhY3Rpb24pIGFjdGlvbi5vbmNsaWNrID0gdGhpcy5jaGVja291dC5iaW5kKHRoaXMpO1xyXG5cclxuXHJcbiAgICB0aGlzLmNvbnRhaW5lci51cGRhdGVUbyh0ZW1wbGF0ZS5maXJzdEVsZW1lbnRDaGlsZCk7XHJcbiAgfVxyXG59XHJcbmNsYXNzIEZpbHRlciB7XHJcbiAgY29uc3RydWN0b3IoY29udGFpbmVyLCBwcm9kdWN0cywgY2FsbGJhY2spIHtcclxuICAgIHRoaXMucHJvZHVjdHMgPSBwcm9kdWN0cztcclxuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgIHRoaXMuc29ydEZ1bmN0aW9uID0ge1xyXG4gICAgICBzZWFyY2g6IGl0ZW0gPT4gaXRlbS5wcm9wcy5uYW1lLmluY2x1ZGVzKHRoaXMuZmlsdGVyQ29uZGl0aW9ucy5zZWFyY2gpLFxyXG4gICAgICBjYXRlZ29yeTogaXRlbSA9PiBpdGVtLnByb3BzLmNhdGVnb3J5ID09PSB0aGlzLmZpbHRlckNvbmRpdGlvbnMuY2F0ZWdvcnksXHJcbiAgICAgIG1pbjogaXRlbSA9PiBpdGVtLnByb3BzLnByaWNlID4gdGhpcy5maWx0ZXJDb25kaXRpb25zLm1pbixcclxuICAgICAgbWF4OiBpdGVtID0+IGl0ZW0ucHJvcHMucHJpY2UgPCB0aGlzLmZpbHRlckNvbmRpdGlvbnMubWF4XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVuZGVyaW5nIGFzaWRlXHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5yZW5kZXIoKSk7XHJcblxyXG4gIH1cclxuICBzb3J0KHByb2R1Y3RzKSB7XHJcbiAgICBpZih0aGlzLmZpbHRlckNvbmRpdGlvbnMpIHtcclxuICAgICAgT2JqZWN0LmtleXModGhpcy5maWx0ZXJDb25kaXRpb25zKS5tYXAoY29uZGl0aW9uID0+IHtcclxuICAgICAgICBpZih0aGlzLmZpbHRlckNvbmRpdGlvbnNbY29uZGl0aW9uXSAhPT0gJycpIHByb2R1Y3RzID0gcHJvZHVjdHMuZmlsdGVyKHRoaXMuc29ydEZ1bmN0aW9uW2NvbmRpdGlvbl0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBwcm9kdWN0cztcclxuICB9XHJcbiAgcmVuZGVyKCkge1xyXG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcbiAgICAgICAgY2F0ZWdvcmllcyA9IHRoaXMucHJvZHVjdHMucmVkdWNlKChhcnJheSwgaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIShhcnJheS5pbmRleE9mKGl0ZW0ucHJvcHMuY2F0ZWdvcnkpICsgMSkpIGFycmF5LnB1c2goaXRlbS5wcm9wcy5jYXRlZ29yeSk7XHJcbiAgICAgICAgICAgIHJldHVybiBhcnJheTtcclxuICAgICAgICAgIH0sIFtdKSxcclxuICAgICAgICBzZWxlY3RPcHRpb25zID0gY2F0ZWdvcmllcy5yZWR1Y2UoKHJvdywgaXRlbSkgPT4gcm93ICs9IGA8b3B0aW9uIHZhbHVlPVwiJHtpdGVtfVwiPiR7aXRlbX08L29wdGlvbj5gLCAnPG9wdGlvbiB2YWx1ZT1cIlwiPtCy0YHQtTwvb3B0aW9uPicpO1xyXG5cclxuICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IGBcclxuICAgICAgPGZvcm0gaWQ9XCJmaWx0ZXJcIj5cclxuICAgICAgICA8bGFiZWw+XHJcbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwic2VhcmNoXCIgcGxhY2Vob2xkZXI9XCLQv9C+0LjRgdC6Li4uXCI+XHJcbiAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICA8aHIgLz5cclxuICAgICAgICA8c3Bhbj7QmtCw0YLQtdCz0L7RgNC40Y88L3NwYW4+XHJcbiAgICAgICAgPGxhYmVsPlxyXG4gICAgICAgICAgPHNlbGVjdCBuYW1lPVwiY2F0ZWdvcnlcIj5cclxuICAgICAgICAgICAgJHtzZWxlY3RPcHRpb25zfVxyXG4gICAgICAgICAgPC9zZWxlY3Q+XHJcbiAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICA8aHIgLz5cclxuICAgICAgICA8c3Bhbj7QptC10L3QsDwvc3Bhbj5cclxuICAgICAgICA8bGFiZWwgY2xhc3M9XCJpbmxpbmVcIj5cclxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwicHJpY2VcIiBuYW1lPVwibWluXCIgcGxhY2Vob2xkZXI9XCLQvtGCLi4uXCI+XHJcbiAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICA8bGFiZWwgY2xhc3M9XCJpbmxpbmVcIj5cclxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwicHJpY2VcIiBuYW1lPVwibWF4XCIgcGxhY2Vob2xkZXI9XCLQtNC+Li4uXCI+XHJcbiAgICAgICAgPC9sYWJlbD5cclxuICAgICAgPC9mb3JtPlxyXG4gICAgYDtcclxuXHJcbiAgICAvLyBBQ1RJT05TXHJcbiAgICB0aGlzLmZvcm0gPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XHJcbiAgICBsZXQgbnVtSW5wdXRzID0gQXJyYXkuZnJvbSh0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yQWxsKCcucHJpY2UnKSk7XHJcblxyXG4gICAgdGhpcy5mb3JtLm9uY2hhbmdlID0gdGhpcy5mb3JtLm9uc3VibWl0ID0gKGUpID0+IHtcclxuICAgICAgdGhpcy5maWx0ZXJDb25kaXRpb25zID0gc2VyaWFsaXplRm9ybShlLmN1cnJlbnRUYXJnZXQuZWxlbWVudHMpO1xyXG4gICAgICB0aGlzLmNhbGxiYWNrKCk7XHJcbiAgICB9XHJcbiAgICBudW1JbnB1dHMubWFwKGl0ZW0gPT4gaXRlbS5vbmtleWRvd24gPSBzZWN1cmVOdW1JbnB1dCgyMDAwLCAwLCAxMDApKVxyXG5cclxuXHJcbiAgICByZXR1cm4gdGVtcGxhdGUuZmlyc3RFbGVtZW50Q2hpbGQ7XHJcbiAgfVxyXG59XHJcblxyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG5cclxuICAvLyBTdG9yZVxyXG4gIHZhciBwcm9kdWN0cyA9IG5ldyBTdG9yZSgnc3RhdGljL3Byb2R1Y3RzLmpzb24nLCAnI3Byb2R1Y3RzIC5jb250ZW50Jyk7XHJcbiAgcHJvZHVjdHMub25Mb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG5hdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ25hdicpLFxyXG4gICAgICAgIGFzaWRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYXNpZGUnKSxcclxuICAgICAgICBzbGlkZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FzaWRlIC5zbGlkZScpO1xyXG4gICAgd2luZG93Lm9uc2Nyb2xsID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgdmFyIGNvcnJlY3RTY3JvbGwgPSBlLnRhcmdldC5zY3JvbGxpbmdFbGVtZW50LnNjcm9sbFRvcCAtIGFzaWRlLm9mZnNldFRvcCArIG5hdi5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgIGlmIChjb3JyZWN0U2Nyb2xsIDwgMCkgc2xpZGUuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMHB4KSc7ZWxzZSBpZiAoY29ycmVjdFNjcm9sbCA+IGFzaWRlLm9mZnNldEhlaWdodCAtIHNsaWRlLm9mZnNldEhlaWdodCkgc2xpZGUuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoJyArIChhc2lkZS5vZmZzZXRIZWlnaHQgLSBzbGlkZS5vZmZzZXRIZWlnaHQpICsgJ3B4KSc7ZWxzZSBpZiAoY29ycmVjdFNjcm9sbCA+IDAgJiYgY29ycmVjdFNjcm9sbCA8IGFzaWRlLm9mZnNldEhlaWdodCAtIHNsaWRlLm9mZnNldEhlaWdodCkgc2xpZGUuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoJyArIGNvcnJlY3RTY3JvbGwgKyAncHgpJztcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgLy8gU2Nyb2xsXHJcbiAgQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdhW2hyZWZePVwiI1wiXScpKS5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgIHJldHVybiBpdGVtLm9uY2xpY2sgPSBzY3JvbGxUbztcclxuICB9KTtcclxufTtcclxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlX2M1Y2NjNDY1LmpzXCIsXCIvXCIpXHJcbn0se1wiYnVmZmVyXCI6MixcImUvVSs5N1wiOjR9XX0se30sWzVdKVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWtNNlhGeFFjbTlxWldOMGMxeGNhM1Z3WldOb1pYTnJhWGxrYjIxY1hHNXZaR1ZmYlc5a2RXeGxjMXhjWW5KdmQzTmxjaTF3WVdOclhGeGZjSEpsYkhWa1pTNXFjeUlzSWtNNkwxQnliMnBsWTNSekwydDFjR1ZqYUdWemEybDVaRzl0TDI1dlpHVmZiVzlrZFd4bGN5OWlZWE5sTmpRdGFuTXZiR2xpTDJJMk5DNXFjeUlzSWtNNkwxQnliMnBsWTNSekwydDFjR1ZqYUdWemEybDVaRzl0TDI1dlpHVmZiVzlrZFd4bGN5OWlkV1ptWlhJdmFXNWtaWGd1YW5NaUxDSkRPaTlRY205cVpXTjBjeTlyZFhCbFkyaGxjMnRwZVdSdmJTOXViMlJsWDIxdlpIVnNaWE12YVdWbFpUYzFOQzlwYm1SbGVDNXFjeUlzSWtNNkwxQnliMnBsWTNSekwydDFjR1ZqYUdWemEybDVaRzl0TDI1dlpHVmZiVzlrZFd4bGN5OXdjbTlqWlhOekwySnliM2R6WlhJdWFuTWlMQ0pET2k5UWNtOXFaV04wY3k5cmRYQmxZMmhsYzJ0cGVXUnZiUzl6Y21NdmFuTXZabUZyWlY5ak5XTmpZelEyTlM1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRVHRCUTBGQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRemxJUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRM1pzUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlEzUkdRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGRGFrVkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVpTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpaG1kVzVqZEdsdmJpQmxLSFFzYml4eUtYdG1kVzVqZEdsdmJpQnpLRzhzZFNsN2FXWW9JVzViYjEwcGUybG1LQ0YwVzI5ZEtYdDJZWElnWVQxMGVYQmxiMllnY21WeGRXbHlaVDA5WENKbWRXNWpkR2x2Ymx3aUppWnlaWEYxYVhKbE8ybG1LQ0YxSmlaaEtYSmxkSFZ5YmlCaEtHOHNJVEFwTzJsbUtHa3BjbVYwZFhKdUlHa29ieXdoTUNrN2RHaHliM2NnYm1WM0lFVnljbTl5S0Z3aVEyRnVibTkwSUdacGJtUWdiVzlrZFd4bElDZGNJaXR2SzF3aUoxd2lLWDEyWVhJZ1pqMXVXMjlkUFh0bGVIQnZjblJ6T250OWZUdDBXMjlkV3pCZExtTmhiR3dvWmk1bGVIQnZjblJ6TEdaMWJtTjBhVzl1S0dVcGUzWmhjaUJ1UFhSYmIxMWJNVjFiWlYwN2NtVjBkWEp1SUhNb2JqOXVPbVVwZlN4bUxHWXVaWGh3YjNKMGN5eGxMSFFzYml4eUtYMXlaWFIxY200Z2JsdHZYUzVsZUhCdmNuUnpmWFpoY2lCcFBYUjVjR1Z2WmlCeVpYRjFhWEpsUFQxY0ltWjFibU4wYVc5dVhDSW1KbkpsY1hWcGNtVTdabTl5S0haaGNpQnZQVEE3Ynp4eUxteGxibWQwYUR0dkt5c3BjeWh5VzI5ZEtUdHlaWFIxY200Z2MzMHBJaXdpS0daMWJtTjBhVzl1SUNod2NtOWpaWE56TEdkc2IySmhiQ3hDZFdabVpYSXNYMTloY21kMWJXVnVkREFzWDE5aGNtZDFiV1Z1ZERFc1gxOWhjbWQxYldWdWRESXNYMTloY21kMWJXVnVkRE1zWDE5bWFXeGxibUZ0WlN4ZlgyUnBjbTVoYldVcGUxeHVkbUZ5SUd4dmIydDFjQ0E5SUNkQlFrTkVSVVpIU0VsS1MweE5UazlRVVZKVFZGVldWMWhaV21GaVkyUmxabWRvYVdwcmJHMXViM0J4Y25OMGRYWjNlSGw2TURFeU16UTFOamM0T1Nzdkp6dGNibHh1T3lobWRXNWpkR2x2YmlBb1pYaHdiM0owY3lrZ2UxeHVYSFFuZFhObElITjBjbWxqZENjN1hHNWNiaUFnZG1GeUlFRnljaUE5SUNoMGVYQmxiMllnVldsdWREaEJjbkpoZVNBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NwWEc0Z0lDQWdQeUJWYVc1ME9FRnljbUY1WEc0Z0lDQWdPaUJCY25KaGVWeHVYRzVjZEhaaGNpQlFURlZUSUNBZ1BTQW5LeWN1WTJoaGNrTnZaR1ZCZENnd0tWeHVYSFIyWVhJZ1UweEJVMGdnSUQwZ0p5OG5MbU5vWVhKRGIyUmxRWFFvTUNsY2JseDBkbUZ5SUU1VlRVSkZVaUE5SUNjd0p5NWphR0Z5UTI5a1pVRjBLREFwWEc1Y2RIWmhjaUJNVDFkRlVpQWdQU0FuWVNjdVkyaGhja052WkdWQmRDZ3dLVnh1WEhSMllYSWdWVkJRUlZJZ0lEMGdKMEVuTG1Ob1lYSkRiMlJsUVhRb01DbGNibHgwZG1GeUlGQk1WVk5mVlZKTVgxTkJSa1VnUFNBbkxTY3VZMmhoY2tOdlpHVkJkQ2d3S1Z4dVhIUjJZWElnVTB4QlUwaGZWVkpNWDFOQlJrVWdQU0FuWHljdVkyaGhja052WkdWQmRDZ3dLVnh1WEc1Y2RHWjFibU4wYVc5dUlHUmxZMjlrWlNBb1pXeDBLU0I3WEc1Y2RGeDBkbUZ5SUdOdlpHVWdQU0JsYkhRdVkyaGhja052WkdWQmRDZ3dLVnh1WEhSY2RHbG1JQ2hqYjJSbElEMDlQU0JRVEZWVElIeDhYRzVjZEZ4MElDQWdJR052WkdVZ1BUMDlJRkJNVlZOZlZWSk1YMU5CUmtVcFhHNWNkRngwWEhSeVpYUjFjbTRnTmpJZ0x5OGdKeXNuWEc1Y2RGeDBhV1lnS0dOdlpHVWdQVDA5SUZOTVFWTklJSHg4WEc1Y2RGeDBJQ0FnSUdOdlpHVWdQVDA5SUZOTVFWTklYMVZTVEY5VFFVWkZLVnh1WEhSY2RGeDBjbVYwZFhKdUlEWXpJQzh2SUNjdkoxeHVYSFJjZEdsbUlDaGpiMlJsSUR3Z1RsVk5Ra1ZTS1Z4dVhIUmNkRngwY21WMGRYSnVJQzB4SUM4dmJtOGdiV0YwWTJoY2JseDBYSFJwWmlBb1kyOWtaU0E4SUU1VlRVSkZVaUFySURFd0tWeHVYSFJjZEZ4MGNtVjBkWEp1SUdOdlpHVWdMU0JPVlUxQ1JWSWdLeUF5TmlBcklESTJYRzVjZEZ4MGFXWWdLR052WkdVZ1BDQlZVRkJGVWlBcklESTJLVnh1WEhSY2RGeDBjbVYwZFhKdUlHTnZaR1VnTFNCVlVGQkZVbHh1WEhSY2RHbG1JQ2hqYjJSbElEd2dURTlYUlZJZ0t5QXlOaWxjYmx4MFhIUmNkSEpsZEhWeWJpQmpiMlJsSUMwZ1RFOVhSVklnS3lBeU5seHVYSFI5WEc1Y2JseDBablZ1WTNScGIyNGdZalkwVkc5Q2VYUmxRWEp5WVhrZ0tHSTJOQ2tnZTF4dVhIUmNkSFpoY2lCcExDQnFMQ0JzTENCMGJYQXNJSEJzWVdObFNHOXNaR1Z5Y3l3Z1lYSnlYRzVjYmx4MFhIUnBaaUFvWWpZMExteGxibWQwYUNBbElEUWdQaUF3S1NCN1hHNWNkRngwWEhSMGFISnZkeUJ1WlhjZ1JYSnliM0lvSjBsdWRtRnNhV1FnYzNSeWFXNW5MaUJNWlc1bmRHZ2diWFZ6ZENCaVpTQmhJRzExYkhScGNHeGxJRzltSURRbktWeHVYSFJjZEgxY2JseHVYSFJjZEM4dklIUm9aU0J1ZFcxaVpYSWdiMllnWlhGMVlXd2djMmxuYm5NZ0tIQnNZV05sSUdodmJHUmxjbk1wWEc1Y2RGeDBMeThnYVdZZ2RHaGxjbVVnWVhKbElIUjNieUJ3YkdGalpXaHZiR1JsY25Nc0lIUm9ZVzRnZEdobElIUjNieUJqYUdGeVlXTjBaWEp6SUdKbFptOXlaU0JwZEZ4dVhIUmNkQzh2SUhKbGNISmxjMlZ1ZENCdmJtVWdZbmwwWlZ4dVhIUmNkQzh2SUdsbUlIUm9aWEpsSUdseklHOXViSGtnYjI1bExDQjBhR1Z1SUhSb1pTQjBhSEpsWlNCamFHRnlZV04wWlhKeklHSmxabTl5WlNCcGRDQnlaWEJ5WlhObGJuUWdNaUJpZVhSbGMxeHVYSFJjZEM4dklIUm9hWE1nYVhNZ2FuVnpkQ0JoSUdOb1pXRndJR2hoWTJzZ2RHOGdibTkwSUdSdklHbHVaR1Y0VDJZZ2RIZHBZMlZjYmx4MFhIUjJZWElnYkdWdUlEMGdZalkwTG14bGJtZDBhRnh1WEhSY2RIQnNZV05sU0c5c1pHVnljeUE5SUNjOUp5QTlQVDBnWWpZMExtTm9ZWEpCZENoc1pXNGdMU0F5S1NBL0lESWdPaUFuUFNjZ1BUMDlJR0kyTkM1amFHRnlRWFFvYkdWdUlDMGdNU2tnUHlBeElEb2dNRnh1WEc1Y2RGeDBMeThnWW1GelpUWTBJR2x6SURRdk15QXJJSFZ3SUhSdklIUjNieUJqYUdGeVlXTjBaWEp6SUc5bUlIUm9aU0J2Y21sbmFXNWhiQ0JrWVhSaFhHNWNkRngwWVhKeUlEMGdibVYzSUVGeWNpaGlOalF1YkdWdVozUm9JQ29nTXlBdklEUWdMU0J3YkdGalpVaHZiR1JsY25NcFhHNWNibHgwWEhRdkx5QnBaaUIwYUdWeVpTQmhjbVVnY0d4aFkyVm9iMnhrWlhKekxDQnZibXg1SUdkbGRDQjFjQ0IwYnlCMGFHVWdiR0Z6ZENCamIyMXdiR1YwWlNBMElHTm9ZWEp6WEc1Y2RGeDBiQ0E5SUhCc1lXTmxTRzlzWkdWeWN5QStJREFnUHlCaU5qUXViR1Z1WjNSb0lDMGdOQ0E2SUdJMk5DNXNaVzVuZEdoY2JseHVYSFJjZEhaaGNpQk1JRDBnTUZ4dVhHNWNkRngwWm5WdVkzUnBiMjRnY0hWemFDQW9kaWtnZTF4dVhIUmNkRngwWVhKeVcwd3JLMTBnUFNCMlhHNWNkRngwZlZ4dVhHNWNkRngwWm05eUlDaHBJRDBnTUN3Z2FpQTlJREE3SUdrZ1BDQnNPeUJwSUNzOUlEUXNJR29nS3owZ015a2dlMXh1WEhSY2RGeDBkRzF3SUQwZ0tHUmxZMjlrWlNoaU5qUXVZMmhoY2tGMEtHa3BLU0E4UENBeE9Da2dmQ0FvWkdWamIyUmxLR0kyTkM1amFHRnlRWFFvYVNBcklERXBLU0E4UENBeE1pa2dmQ0FvWkdWamIyUmxLR0kyTkM1amFHRnlRWFFvYVNBcklESXBLU0E4UENBMktTQjhJR1JsWTI5a1pTaGlOalF1WTJoaGNrRjBLR2tnS3lBektTbGNibHgwWEhSY2RIQjFjMmdvS0hSdGNDQW1JREI0UmtZd01EQXdLU0ErUGlBeE5pbGNibHgwWEhSY2RIQjFjMmdvS0hSdGNDQW1JREI0UmtZd01Da2dQajRnT0NsY2JseDBYSFJjZEhCMWMyZ29kRzF3SUNZZ01IaEdSaWxjYmx4MFhIUjlYRzVjYmx4MFhIUnBaaUFvY0d4aFkyVkliMnhrWlhKeklEMDlQU0F5S1NCN1hHNWNkRngwWEhSMGJYQWdQU0FvWkdWamIyUmxLR0kyTkM1amFHRnlRWFFvYVNrcElEdzhJRElwSUh3Z0tHUmxZMjlrWlNoaU5qUXVZMmhoY2tGMEtHa2dLeUF4S1NrZ1BqNGdOQ2xjYmx4MFhIUmNkSEIxYzJnb2RHMXdJQ1lnTUhoR1JpbGNibHgwWEhSOUlHVnNjMlVnYVdZZ0tIQnNZV05sU0c5c1pHVnljeUE5UFQwZ01Ta2dlMXh1WEhSY2RGeDBkRzF3SUQwZ0tHUmxZMjlrWlNoaU5qUXVZMmhoY2tGMEtHa3BLU0E4UENBeE1Da2dmQ0FvWkdWamIyUmxLR0kyTkM1amFHRnlRWFFvYVNBcklERXBLU0E4UENBMEtTQjhJQ2hrWldOdlpHVW9ZalkwTG1Ob1lYSkJkQ2hwSUNzZ01pa3BJRDQrSURJcFhHNWNkRngwWEhSd2RYTm9LQ2gwYlhBZ1BqNGdPQ2tnSmlBd2VFWkdLVnh1WEhSY2RGeDBjSFZ6YUNoMGJYQWdKaUF3ZUVaR0tWeHVYSFJjZEgxY2JseHVYSFJjZEhKbGRIVnliaUJoY25KY2JseDBmVnh1WEc1Y2RHWjFibU4wYVc5dUlIVnBiblE0Vkc5Q1lYTmxOalFnS0hWcGJuUTRLU0I3WEc1Y2RGeDBkbUZ5SUdrc1hHNWNkRngwWEhSbGVIUnlZVUo1ZEdWeklEMGdkV2x1ZERndWJHVnVaM1JvSUNVZ015d2dMeThnYVdZZ2QyVWdhR0YyWlNBeElHSjVkR1VnYkdWbWRDd2djR0ZrSURJZ1lubDBaWE5jYmx4MFhIUmNkRzkxZEhCMWRDQTlJRndpWENJc1hHNWNkRngwWEhSMFpXMXdMQ0JzWlc1bmRHaGNibHh1WEhSY2RHWjFibU4wYVc5dUlHVnVZMjlrWlNBb2JuVnRLU0I3WEc1Y2RGeDBYSFJ5WlhSMWNtNGdiRzl2YTNWd0xtTm9ZWEpCZENodWRXMHBYRzVjZEZ4MGZWeHVYRzVjZEZ4MFpuVnVZM1JwYjI0Z2RISnBjR3hsZEZSdlFtRnpaVFkwSUNodWRXMHBJSHRjYmx4MFhIUmNkSEpsZEhWeWJpQmxibU52WkdVb2JuVnRJRDQrSURFNElDWWdNSGd6UmlrZ0t5QmxibU52WkdVb2JuVnRJRDQrSURFeUlDWWdNSGd6UmlrZ0t5QmxibU52WkdVb2JuVnRJRDQrSURZZ0ppQXdlRE5HS1NBcklHVnVZMjlrWlNodWRXMGdKaUF3ZUROR0tWeHVYSFJjZEgxY2JseHVYSFJjZEM4dklHZHZJSFJvY205MVoyZ2dkR2hsSUdGeWNtRjVJR1YyWlhKNUlIUm9jbVZsSUdKNWRHVnpMQ0IzWlNkc2JDQmtaV0ZzSUhkcGRHZ2dkSEpoYVd4cGJtY2djM1IxWm1ZZ2JHRjBaWEpjYmx4MFhIUm1iM0lnS0drZ1BTQXdMQ0JzWlc1bmRHZ2dQU0IxYVc1ME9DNXNaVzVuZEdnZ0xTQmxlSFJ5WVVKNWRHVnpPeUJwSUR3Z2JHVnVaM1JvT3lCcElDczlJRE1wSUh0Y2JseDBYSFJjZEhSbGJYQWdQU0FvZFdsdWREaGJhVjBnUER3Z01UWXBJQ3NnS0hWcGJuUTRXMmtnS3lBeFhTQThQQ0E0S1NBcklDaDFhVzUwT0Z0cElDc2dNbDBwWEc1Y2RGeDBYSFJ2ZFhSd2RYUWdLejBnZEhKcGNHeGxkRlJ2UW1GelpUWTBLSFJsYlhBcFhHNWNkRngwZlZ4dVhHNWNkRngwTHk4Z2NHRmtJSFJvWlNCbGJtUWdkMmwwYUNCNlpYSnZjeXdnWW5WMElHMWhhMlVnYzNWeVpTQjBieUJ1YjNRZ1ptOXlaMlYwSUhSb1pTQmxlSFJ5WVNCaWVYUmxjMXh1WEhSY2RITjNhWFJqYUNBb1pYaDBjbUZDZVhSbGN5a2dlMXh1WEhSY2RGeDBZMkZ6WlNBeE9seHVYSFJjZEZ4MFhIUjBaVzF3SUQwZ2RXbHVkRGhiZFdsdWREZ3ViR1Z1WjNSb0lDMGdNVjFjYmx4MFhIUmNkRngwYjNWMGNIVjBJQ3M5SUdWdVkyOWtaU2gwWlcxd0lENCtJRElwWEc1Y2RGeDBYSFJjZEc5MWRIQjFkQ0FyUFNCbGJtTnZaR1VvS0hSbGJYQWdQRHdnTkNrZ0ppQXdlRE5HS1Z4dVhIUmNkRngwWEhSdmRYUndkWFFnS3owZ0p6MDlKMXh1WEhSY2RGeDBYSFJpY21WaGExeHVYSFJjZEZ4MFkyRnpaU0F5T2x4dVhIUmNkRngwWEhSMFpXMXdJRDBnS0hWcGJuUTRXM1ZwYm5RNExteGxibWQwYUNBdElESmRJRHc4SURncElDc2dLSFZwYm5RNFczVnBiblE0TG14bGJtZDBhQ0F0SURGZEtWeHVYSFJjZEZ4MFhIUnZkWFJ3ZFhRZ0t6MGdaVzVqYjJSbEtIUmxiWEFnUGo0Z01UQXBYRzVjZEZ4MFhIUmNkRzkxZEhCMWRDQXJQU0JsYm1OdlpHVW9LSFJsYlhBZ1BqNGdOQ2tnSmlBd2VETkdLVnh1WEhSY2RGeDBYSFJ2ZFhSd2RYUWdLejBnWlc1amIyUmxLQ2gwWlcxd0lEdzhJRElwSUNZZ01IZ3pSaWxjYmx4MFhIUmNkRngwYjNWMGNIVjBJQ3M5SUNjOUoxeHVYSFJjZEZ4MFhIUmljbVZoYTF4dVhIUmNkSDFjYmx4dVhIUmNkSEpsZEhWeWJpQnZkWFJ3ZFhSY2JseDBmVnh1WEc1Y2RHVjRjRzl5ZEhNdWRHOUNlWFJsUVhKeVlYa2dQU0JpTmpSVWIwSjVkR1ZCY25KaGVWeHVYSFJsZUhCdmNuUnpMbVp5YjIxQ2VYUmxRWEp5WVhrZ1BTQjFhVzUwT0ZSdlFtRnpaVFkwWEc1OUtIUjVjR1Z2WmlCbGVIQnZjblJ6SUQwOVBTQW5kVzVrWldacGJtVmtKeUEvSUNoMGFHbHpMbUpoYzJVMk5HcHpJRDBnZTMwcElEb2daWGh3YjNKMGN5a3BYRzVjYm4wcExtTmhiR3dvZEdocGN5eHlaWEYxYVhKbEtGd2laUzlWS3prM1hDSXBMSFI1Y0dWdlppQnpaV3htSUNFOVBTQmNJblZ1WkdWbWFXNWxaRndpSUQ4Z2MyVnNaaUE2SUhSNWNHVnZaaUIzYVc1a2IzY2dJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSWdQeUIzYVc1a2IzY2dPaUI3ZlN4eVpYRjFhWEpsS0Z3aVluVm1abVZ5WENJcExrSjFabVpsY2l4aGNtZDFiV1Z1ZEhOYk0xMHNZWEpuZFcxbGJuUnpXelJkTEdGeVozVnRaVzUwYzFzMVhTeGhjbWQxYldWdWRITmJObDBzWENJdkxpNWNYRnhjTGk1Y1hGeGNibTlrWlY5dGIyUjFiR1Z6WEZ4Y1hHSmhjMlUyTkMxcWMxeGNYRnhzYVdKY1hGeGNZalkwTG1welhDSXNYQ0l2TGk1Y1hGeGNMaTVjWEZ4Y2JtOWtaVjl0YjJSMWJHVnpYRnhjWEdKaGMyVTJOQzFxYzF4Y1hGeHNhV0pjSWlraUxDSW9ablZ1WTNScGIyNGdLSEJ5YjJObGMzTXNaMnh2WW1Gc0xFSjFabVpsY2l4ZlgyRnlaM1Z0Wlc1ME1DeGZYMkZ5WjNWdFpXNTBNU3hmWDJGeVozVnRaVzUwTWl4ZlgyRnlaM1Z0Wlc1ME15eGZYMlpwYkdWdVlXMWxMRjlmWkdseWJtRnRaU2w3WEc0dktpRmNiaUFxSUZSb1pTQmlkV1ptWlhJZ2JXOWtkV3hsSUdaeWIyMGdibTlrWlM1cWN5d2dabTl5SUhSb1pTQmljbTkzYzJWeUxseHVJQ3BjYmlBcUlFQmhkWFJvYjNJZ0lDQkdaWEp2YzNNZ1FXSnZkV3RvWVdScGFtVm9JRHhtWlhKdmMzTkFabVZ5YjNOekxtOXlaejRnUEdoMGRIQTZMeTltWlhKdmMzTXViM0puUGx4dUlDb2dRR3hwWTJWdWMyVWdJRTFKVkZ4dUlDb3ZYRzVjYm5aaGNpQmlZWE5sTmpRZ1BTQnlaWEYxYVhKbEtDZGlZWE5sTmpRdGFuTW5LVnh1ZG1GeUlHbGxaV1UzTlRRZ1BTQnlaWEYxYVhKbEtDZHBaV1ZsTnpVMEp5bGNibHh1Wlhod2IzSjBjeTVDZFdabVpYSWdQU0JDZFdabVpYSmNibVY0Y0c5eWRITXVVMnh2ZDBKMVptWmxjaUE5SUVKMVptWmxjbHh1Wlhod2IzSjBjeTVKVGxOUVJVTlVYMDFCV0Y5Q1dWUkZVeUE5SURVd1hHNUNkV1ptWlhJdWNHOXZiRk5wZW1VZ1BTQTRNVGt5WEc1Y2JpOHFLbHh1SUNvZ1NXWWdZRUoxWm1abGNpNWZkWE5sVkhsd1pXUkJjbkpoZVhOZ09seHVJQ29nSUNBOVBUMGdkSEoxWlNBZ0lDQlZjMlVnVldsdWREaEJjbkpoZVNCcGJYQnNaVzFsYm5SaGRHbHZiaUFvWm1GemRHVnpkQ2xjYmlBcUlDQWdQVDA5SUdaaGJITmxJQ0FnVlhObElFOWlhbVZqZENCcGJYQnNaVzFsYm5SaGRHbHZiaUFvWTI5dGNHRjBhV0pzWlNCa2IzZHVJSFJ2SUVsRk5pbGNiaUFxTDF4dVFuVm1abVZ5TGw5MWMyVlVlWEJsWkVGeWNtRjVjeUE5SUNobWRXNWpkR2x2YmlBb0tTQjdYRzRnSUM4dklFUmxkR1ZqZENCcFppQmljbTkzYzJWeUlITjFjSEJ2Y25SeklGUjVjR1ZrSUVGeWNtRjVjeTRnVTNWd2NHOXlkR1ZrSUdKeWIzZHpaWEp6SUdGeVpTQkpSU0F4TUNzc0lFWnBjbVZtYjNnZ05Dc3NYRzRnSUM4dklFTm9jbTl0WlNBM0t5d2dVMkZtWVhKcElEVXVNU3NzSUU5d1pYSmhJREV4TGpZckxDQnBUMU1nTkM0eUt5NGdTV1lnZEdobElHSnliM2R6WlhJZ1pHOWxjeUJ1YjNRZ2MzVndjRzl5ZENCaFpHUnBibWRjYmlBZ0x5OGdjSEp2Y0dWeWRHbGxjeUIwYnlCZ1ZXbHVkRGhCY25KaGVXQWdhVzV6ZEdGdVkyVnpMQ0IwYUdWdUlIUm9ZWFFuY3lCMGFHVWdjMkZ0WlNCaGN5QnVieUJnVldsdWREaEJjbkpoZVdBZ2MzVndjRzl5ZEZ4dUlDQXZMeUJpWldOaGRYTmxJSGRsSUc1bFpXUWdkRzhnWW1VZ1lXSnNaU0IwYnlCaFpHUWdZV3hzSUhSb1pTQnViMlJsSUVKMVptWmxjaUJCVUVrZ2JXVjBhRzlrY3k0Z1ZHaHBjeUJwY3lCaGJpQnBjM04xWlZ4dUlDQXZMeUJwYmlCR2FYSmxabTk0SURRdE1qa3VJRTV2ZHlCbWFYaGxaRG9nYUhSMGNITTZMeTlpZFdkNmFXeHNZUzV0YjNwcGJHeGhMbTl5Wnk5emFHOTNYMkoxWnk1aloyay9hV1E5TmprMU5ETTRYRzRnSUhSeWVTQjdYRzRnSUNBZ2RtRnlJR0oxWmlBOUlHNWxkeUJCY25KaGVVSjFabVpsY2lnd0tWeHVJQ0FnSUhaaGNpQmhjbklnUFNCdVpYY2dWV2x1ZERoQmNuSmhlU2hpZFdZcFhHNGdJQ0FnWVhKeUxtWnZieUE5SUdaMWJtTjBhVzl1SUNncElIc2djbVYwZFhKdUlEUXlJSDFjYmlBZ0lDQnlaWFIxY200Z05ESWdQVDA5SUdGeWNpNW1iMjhvS1NBbUpseHVJQ0FnSUNBZ0lDQjBlWEJsYjJZZ1lYSnlMbk4xWW1GeWNtRjVJRDA5UFNBblpuVnVZM1JwYjI0bklDOHZJRU5vY205dFpTQTVMVEV3SUd4aFkyc2dZSE4xWW1GeWNtRjVZRnh1SUNCOUlHTmhkR05vSUNobEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUdaaGJITmxYRzRnSUgxY2JuMHBLQ2xjYmx4dUx5b3FYRzRnS2lCRGJHRnpjem9nUW5WbVptVnlYRzRnS2lBOVBUMDlQVDA5UFQwOVBUMDlYRzRnS2x4dUlDb2dWR2hsSUVKMVptWmxjaUJqYjI1emRISjFZM1J2Y2lCeVpYUjFjbTV6SUdsdWMzUmhibU5sY3lCdlppQmdWV2x1ZERoQmNuSmhlV0FnZEdoaGRDQmhjbVVnWVhWbmJXVnVkR1ZrWEc0Z0tpQjNhWFJvSUdaMWJtTjBhVzl1SUhCeWIzQmxjblJwWlhNZ1ptOXlJR0ZzYkNCMGFHVWdibTlrWlNCZ1FuVm1abVZ5WUNCQlVFa2dablZ1WTNScGIyNXpMaUJYWlNCMWMyVmNiaUFxSUdCVmFXNTBPRUZ5Y21GNVlDQnpieUIwYUdGMElITnhkV0Z5WlNCaWNtRmphMlYwSUc1dmRHRjBhVzl1SUhkdmNtdHpJR0Z6SUdWNGNHVmpkR1ZrSUMwdElHbDBJSEpsZEhWeWJuTmNiaUFxSUdFZ2MybHVaMnhsSUc5amRHVjBMbHh1SUNwY2JpQXFJRUo1SUdGMVoyMWxiblJwYm1jZ2RHaGxJR2x1YzNSaGJtTmxjeXdnZDJVZ1kyRnVJR0YyYjJsa0lHMXZaR2xtZVdsdVp5QjBhR1VnWUZWcGJuUTRRWEp5WVhsZ1hHNGdLaUJ3Y205MGIzUjVjR1V1WEc0Z0tpOWNibVoxYm1OMGFXOXVJRUoxWm1abGNpQW9jM1ZpYW1WamRDd2daVzVqYjJScGJtY3NJRzV2V21WeWJ5a2dlMXh1SUNCcFppQW9JU2gwYUdseklHbHVjM1JoYm1ObGIyWWdRblZtWm1WeUtTbGNiaUFnSUNCeVpYUjFjbTRnYm1WM0lFSjFabVpsY2loemRXSnFaV04wTENCbGJtTnZaR2x1Wnl3Z2JtOWFaWEp2S1Z4dVhHNGdJSFpoY2lCMGVYQmxJRDBnZEhsd1pXOW1JSE4xWW1wbFkzUmNibHh1SUNBdkx5QlhiM0pyWVhKdmRXNWtPaUJ1YjJSbEozTWdZbUZ6WlRZMElHbHRjR3hsYldWdWRHRjBhVzl1SUdGc2JHOTNjeUJtYjNJZ2JtOXVMWEJoWkdSbFpDQnpkSEpwYm1kelhHNGdJQzh2SUhkb2FXeGxJR0poYzJVMk5DMXFjeUJrYjJWeklHNXZkQzVjYmlBZ2FXWWdLR1Z1WTI5a2FXNW5JRDA5UFNBblltRnpaVFkwSnlBbUppQjBlWEJsSUQwOVBTQW5jM1J5YVc1bkp5a2dlMXh1SUNBZ0lITjFZbXBsWTNRZ1BTQnpkSEpwYm1kMGNtbHRLSE4xWW1wbFkzUXBYRzRnSUNBZ2QyaHBiR1VnS0hOMVltcGxZM1F1YkdWdVozUm9JQ1VnTkNBaFBUMGdNQ2tnZTF4dUlDQWdJQ0FnYzNWaWFtVmpkQ0E5SUhOMVltcGxZM1FnS3lBblBTZGNiaUFnSUNCOVhHNGdJSDFjYmx4dUlDQXZMeUJHYVc1a0lIUm9aU0JzWlc1bmRHaGNiaUFnZG1GeUlHeGxibWQwYUZ4dUlDQnBaaUFvZEhsd1pTQTlQVDBnSjI1MWJXSmxjaWNwWEc0Z0lDQWdiR1Z1WjNSb0lEMGdZMjlsY21ObEtITjFZbXBsWTNRcFhHNGdJR1ZzYzJVZ2FXWWdLSFI1Y0dVZ1BUMDlJQ2R6ZEhKcGJtY25LVnh1SUNBZ0lHeGxibWQwYUNBOUlFSjFabVpsY2k1aWVYUmxUR1Z1WjNSb0tITjFZbXBsWTNRc0lHVnVZMjlrYVc1bktWeHVJQ0JsYkhObElHbG1JQ2gwZVhCbElEMDlQU0FuYjJKcVpXTjBKeWxjYmlBZ0lDQnNaVzVuZEdnZ1BTQmpiMlZ5WTJVb2MzVmlhbVZqZEM1c1pXNW5kR2dwSUM4dklHRnpjM1Z0WlNCMGFHRjBJRzlpYW1WamRDQnBjeUJoY25KaGVTMXNhV3RsWEc0Z0lHVnNjMlZjYmlBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0owWnBjbk4wSUdGeVozVnRaVzUwSUc1bFpXUnpJSFJ2SUdKbElHRWdiblZ0WW1WeUxDQmhjbkpoZVNCdmNpQnpkSEpwYm1jdUp5bGNibHh1SUNCMllYSWdZblZtWEc0Z0lHbG1JQ2hDZFdabVpYSXVYM1Z6WlZSNWNHVmtRWEp5WVhsektTQjdYRzRnSUNBZ0x5OGdVSEpsWm1WeWNtVmtPaUJTWlhSMWNtNGdZVzRnWVhWbmJXVnVkR1ZrSUdCVmFXNTBPRUZ5Y21GNVlDQnBibk4wWVc1alpTQm1iM0lnWW1WemRDQndaWEptYjNKdFlXNWpaVnh1SUNBZ0lHSjFaaUE5SUVKMVptWmxjaTVmWVhWbmJXVnVkQ2h1WlhjZ1ZXbHVkRGhCY25KaGVTaHNaVzVuZEdncEtWeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDOHZJRVpoYkd4aVlXTnJPaUJTWlhSMWNtNGdWRWhKVXlCcGJuTjBZVzVqWlNCdlppQkNkV1ptWlhJZ0tHTnlaV0YwWldRZ1lua2dZRzVsZDJBcFhHNGdJQ0FnWW5WbUlEMGdkR2hwYzF4dUlDQWdJR0oxWmk1c1pXNW5kR2dnUFNCc1pXNW5kR2hjYmlBZ0lDQmlkV1l1WDJselFuVm1abVZ5SUQwZ2RISjFaVnh1SUNCOVhHNWNiaUFnZG1GeUlHbGNiaUFnYVdZZ0tFSjFabVpsY2k1ZmRYTmxWSGx3WldSQmNuSmhlWE1nSmlZZ2RIbHdaVzltSUhOMVltcGxZM1F1WW5sMFpVeGxibWQwYUNBOVBUMGdKMjUxYldKbGNpY3BJSHRjYmlBZ0lDQXZMeUJUY0dWbFpDQnZjSFJwYldsNllYUnBiMjRnTFMwZ2RYTmxJSE5sZENCcFppQjNaU2R5WlNCamIzQjVhVzVuSUdaeWIyMGdZU0IwZVhCbFpDQmhjbkpoZVZ4dUlDQWdJR0oxWmk1ZmMyVjBLSE4xWW1wbFkzUXBYRzRnSUgwZ1pXeHpaU0JwWmlBb2FYTkJjbkpoZVdsemFDaHpkV0pxWldOMEtTa2dlMXh1SUNBZ0lDOHZJRlJ5WldGMElHRnljbUY1TFdsemFDQnZZbXBsWTNSeklHRnpJR0VnWW5sMFpTQmhjbkpoZVZ4dUlDQWdJR1p2Y2lBb2FTQTlJREE3SUdrZ1BDQnNaVzVuZEdnN0lHa3JLeWtnZTF4dUlDQWdJQ0FnYVdZZ0tFSjFabVpsY2k1cGMwSjFabVpsY2loemRXSnFaV04wS1NsY2JpQWdJQ0FnSUNBZ1luVm1XMmxkSUQwZ2MzVmlhbVZqZEM1eVpXRmtWVWx1ZERnb2FTbGNiaUFnSUNBZ0lHVnNjMlZjYmlBZ0lDQWdJQ0FnWW5WbVcybGRJRDBnYzNWaWFtVmpkRnRwWFZ4dUlDQWdJSDFjYmlBZ2ZTQmxiSE5sSUdsbUlDaDBlWEJsSUQwOVBTQW5jM1J5YVc1bkp5a2dlMXh1SUNBZ0lHSjFaaTUzY21sMFpTaHpkV0pxWldOMExDQXdMQ0JsYm1OdlpHbHVaeWxjYmlBZ2ZTQmxiSE5sSUdsbUlDaDBlWEJsSUQwOVBTQW5iblZ0WW1WeUp5QW1KaUFoUW5WbVptVnlMbDkxYzJWVWVYQmxaRUZ5Y21GNWN5QW1KaUFoYm05YVpYSnZLU0I3WEc0Z0lDQWdabTl5SUNocElEMGdNRHNnYVNBOElHeGxibWQwYURzZ2FTc3JLU0I3WEc0Z0lDQWdJQ0JpZFdaYmFWMGdQU0F3WEc0Z0lDQWdmVnh1SUNCOVhHNWNiaUFnY21WMGRYSnVJR0oxWmx4dWZWeHVYRzR2THlCVFZFRlVTVU1nVFVWVVNFOUVVMXh1THk4Z1BUMDlQVDA5UFQwOVBUMDlQVDFjYmx4dVFuVm1abVZ5TG1selJXNWpiMlJwYm1jZ1BTQm1kVzVqZEdsdmJpQW9aVzVqYjJScGJtY3BJSHRjYmlBZ2MzZHBkR05vSUNoVGRISnBibWNvWlc1amIyUnBibWNwTG5SdlRHOTNaWEpEWVhObEtDa3BJSHRjYmlBZ0lDQmpZWE5sSUNkb1pYZ25PbHh1SUNBZ0lHTmhjMlVnSjNWMFpqZ25PbHh1SUNBZ0lHTmhjMlVnSjNWMFppMDRKenBjYmlBZ0lDQmpZWE5sSUNkaGMyTnBhU2M2WEc0Z0lDQWdZMkZ6WlNBblltbHVZWEo1SnpwY2JpQWdJQ0JqWVhObElDZGlZWE5sTmpRbk9seHVJQ0FnSUdOaGMyVWdKM0poZHljNlhHNGdJQ0FnWTJGelpTQW5kV056TWljNlhHNGdJQ0FnWTJGelpTQW5kV056TFRJbk9seHVJQ0FnSUdOaGMyVWdKM1YwWmpFMmJHVW5PbHh1SUNBZ0lHTmhjMlVnSjNWMFppMHhObXhsSnpwY2JpQWdJQ0FnSUhKbGRIVnliaUIwY25WbFhHNGdJQ0FnWkdWbVlYVnNkRHBjYmlBZ0lDQWdJSEpsZEhWeWJpQm1ZV3h6WlZ4dUlDQjlYRzU5WEc1Y2JrSjFabVpsY2k1cGMwSjFabVpsY2lBOUlHWjFibU4wYVc5dUlDaGlLU0I3WEc0Z0lISmxkSFZ5YmlBaElTaGlJQ0U5UFNCdWRXeHNJQ1ltSUdJZ0lUMDlJSFZ1WkdWbWFXNWxaQ0FtSmlCaUxsOXBjMEoxWm1abGNpbGNibjFjYmx4dVFuVm1abVZ5TG1KNWRHVk1aVzVuZEdnZ1BTQm1kVzVqZEdsdmJpQW9jM1J5TENCbGJtTnZaR2x1WnlrZ2UxeHVJQ0IyWVhJZ2NtVjBYRzRnSUhOMGNpQTlJSE4wY2lBcklDY25YRzRnSUhOM2FYUmphQ0FvWlc1amIyUnBibWNnZkh3Z0ozVjBaamduS1NCN1hHNGdJQ0FnWTJGelpTQW5hR1Y0SnpwY2JpQWdJQ0FnSUhKbGRDQTlJSE4wY2k1c1pXNW5kR2dnTHlBeVhHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjNWMFpqZ25PbHh1SUNBZ0lHTmhjMlVnSjNWMFppMDRKenBjYmlBZ0lDQWdJSEpsZENBOUlIVjBaamhVYjBKNWRHVnpLSE4wY2lrdWJHVnVaM1JvWEc0Z0lDQWdJQ0JpY21WaGExeHVJQ0FnSUdOaGMyVWdKMkZ6WTJscEp6cGNiaUFnSUNCallYTmxJQ2RpYVc1aGNua25PbHh1SUNBZ0lHTmhjMlVnSjNKaGR5YzZYRzRnSUNBZ0lDQnlaWFFnUFNCemRISXViR1Z1WjNSb1hHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjJKaGMyVTJOQ2M2WEc0Z0lDQWdJQ0J5WlhRZ1BTQmlZWE5sTmpSVWIwSjVkR1Z6S0hOMGNpa3ViR1Z1WjNSb1hHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjNWamN6SW5PbHh1SUNBZ0lHTmhjMlVnSjNWamN5MHlKenBjYmlBZ0lDQmpZWE5sSUNkMWRHWXhObXhsSnpwY2JpQWdJQ0JqWVhObElDZDFkR1l0TVRac1pTYzZYRzRnSUNBZ0lDQnlaWFFnUFNCemRISXViR1Z1WjNSb0lDb2dNbHh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JrWldaaGRXeDBPbHh1SUNBZ0lDQWdkR2h5YjNjZ2JtVjNJRVZ5Y205eUtDZFZibXR1YjNkdUlHVnVZMjlrYVc1bkp5bGNiaUFnZlZ4dUlDQnlaWFIxY200Z2NtVjBYRzU5WEc1Y2JrSjFabVpsY2k1amIyNWpZWFFnUFNCbWRXNWpkR2x2YmlBb2JHbHpkQ3dnZEc5MFlXeE1aVzVuZEdncElIdGNiaUFnWVhOelpYSjBLR2x6UVhKeVlYa29iR2x6ZENrc0lDZFZjMkZuWlRvZ1FuVm1abVZ5TG1OdmJtTmhkQ2hzYVhOMExDQmJkRzkwWVd4TVpXNW5kR2hkS1Z4Y2JpY2dLMXh1SUNBZ0lDQWdKMnhwYzNRZ2MyaHZkV3hrSUdKbElHRnVJRUZ5Y21GNUxpY3BYRzVjYmlBZ2FXWWdLR3hwYzNRdWJHVnVaM1JvSUQwOVBTQXdLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHNWxkeUJDZFdabVpYSW9NQ2xjYmlBZ2ZTQmxiSE5sSUdsbUlDaHNhWE4wTG14bGJtZDBhQ0E5UFQwZ01Ta2dlMXh1SUNBZ0lISmxkSFZ5YmlCc2FYTjBXekJkWEc0Z0lIMWNibHh1SUNCMllYSWdhVnh1SUNCcFppQW9kSGx3Wlc5bUlIUnZkR0ZzVEdWdVozUm9JQ0U5UFNBbmJuVnRZbVZ5SnlrZ2UxeHVJQ0FnSUhSdmRHRnNUR1Z1WjNSb0lEMGdNRnh1SUNBZ0lHWnZjaUFvYVNBOUlEQTdJR2tnUENCc2FYTjBMbXhsYm1kMGFEc2dhU3NyS1NCN1hHNGdJQ0FnSUNCMGIzUmhiRXhsYm1kMGFDQXJQU0JzYVhOMFcybGRMbXhsYm1kMGFGeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lIWmhjaUJpZFdZZ1BTQnVaWGNnUW5WbVptVnlLSFJ2ZEdGc1RHVnVaM1JvS1Z4dUlDQjJZWElnY0c5eklEMGdNRnh1SUNCbWIzSWdLR2tnUFNBd095QnBJRHdnYkdsemRDNXNaVzVuZEdnN0lHa3JLeWtnZTF4dUlDQWdJSFpoY2lCcGRHVnRJRDBnYkdsemRGdHBYVnh1SUNBZ0lHbDBaVzB1WTI5d2VTaGlkV1lzSUhCdmN5bGNiaUFnSUNCd2IzTWdLejBnYVhSbGJTNXNaVzVuZEdoY2JpQWdmVnh1SUNCeVpYUjFjbTRnWW5WbVhHNTlYRzVjYmk4dklFSlZSa1pGVWlCSlRsTlVRVTVEUlNCTlJWUklUMFJUWEc0dkx5QTlQVDA5UFQwOVBUMDlQVDA5UFQwOVBUMDlQVDA5UFZ4dVhHNW1kVzVqZEdsdmJpQmZhR1Y0VjNKcGRHVWdLR0oxWml3Z2MzUnlhVzVuTENCdlptWnpaWFFzSUd4bGJtZDBhQ2tnZTF4dUlDQnZabVp6WlhRZ1BTQk9kVzFpWlhJb2IyWm1jMlYwS1NCOGZDQXdYRzRnSUhaaGNpQnlaVzFoYVc1cGJtY2dQU0JpZFdZdWJHVnVaM1JvSUMwZ2IyWm1jMlYwWEc0Z0lHbG1JQ2doYkdWdVozUm9LU0I3WEc0Z0lDQWdiR1Z1WjNSb0lEMGdjbVZ0WVdsdWFXNW5YRzRnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdiR1Z1WjNSb0lEMGdUblZ0WW1WeUtHeGxibWQwYUNsY2JpQWdJQ0JwWmlBb2JHVnVaM1JvSUQ0Z2NtVnRZV2x1YVc1bktTQjdYRzRnSUNBZ0lDQnNaVzVuZEdnZ1BTQnlaVzFoYVc1cGJtZGNiaUFnSUNCOVhHNGdJSDFjYmx4dUlDQXZMeUJ0ZFhOMElHSmxJR0Z1SUdWMlpXNGdiblZ0WW1WeUlHOW1JR1JwWjJsMGMxeHVJQ0IyWVhJZ2MzUnlUR1Z1SUQwZ2MzUnlhVzVuTG14bGJtZDBhRnh1SUNCaGMzTmxjblFvYzNSeVRHVnVJQ1VnTWlBOVBUMGdNQ3dnSjBsdWRtRnNhV1FnYUdWNElITjBjbWx1WnljcFhHNWNiaUFnYVdZZ0tHeGxibWQwYUNBK0lITjBja3hsYmlBdklESXBJSHRjYmlBZ0lDQnNaVzVuZEdnZ1BTQnpkSEpNWlc0Z0x5QXlYRzRnSUgxY2JpQWdabTl5SUNoMllYSWdhU0E5SURBN0lHa2dQQ0JzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUhaaGNpQmllWFJsSUQwZ2NHRnljMlZKYm5Rb2MzUnlhVzVuTG5OMVluTjBjaWhwSUNvZ01pd2dNaWtzSURFMktWeHVJQ0FnSUdGemMyVnlkQ2doYVhOT1lVNG9ZbmwwWlNrc0lDZEpiblpoYkdsa0lHaGxlQ0J6ZEhKcGJtY25LVnh1SUNBZ0lHSjFabHR2Wm1aelpYUWdLeUJwWFNBOUlHSjVkR1ZjYmlBZ2ZWeHVJQ0JDZFdabVpYSXVYMk5vWVhKelYzSnBkSFJsYmlBOUlHa2dLaUF5WEc0Z0lISmxkSFZ5YmlCcFhHNTlYRzVjYm1aMWJtTjBhVzl1SUY5MWRHWTRWM0pwZEdVZ0tHSjFaaXdnYzNSeWFXNW5MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDa2dlMXh1SUNCMllYSWdZMmhoY25OWGNtbDBkR1Z1SUQwZ1FuVm1abVZ5TGw5amFHRnljMWR5YVhSMFpXNGdQVnh1SUNBZ0lHSnNhWFJDZFdabVpYSW9kWFJtT0ZSdlFubDBaWE1vYzNSeWFXNW5LU3dnWW5WbUxDQnZabVp6WlhRc0lHeGxibWQwYUNsY2JpQWdjbVYwZFhKdUlHTm9ZWEp6VjNKcGRIUmxibHh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZZWE5qYVdsWGNtbDBaU0FvWW5WbUxDQnpkSEpwYm1jc0lHOW1abk5sZEN3Z2JHVnVaM1JvS1NCN1hHNGdJSFpoY2lCamFHRnljMWR5YVhSMFpXNGdQU0JDZFdabVpYSXVYMk5vWVhKelYzSnBkSFJsYmlBOVhHNGdJQ0FnWW14cGRFSjFabVpsY2loaGMyTnBhVlJ2UW5sMFpYTW9jM1J5YVc1bktTd2dZblZtTENCdlptWnpaWFFzSUd4bGJtZDBhQ2xjYmlBZ2NtVjBkWEp1SUdOb1lYSnpWM0pwZEhSbGJseHVmVnh1WEc1bWRXNWpkR2x2YmlCZlltbHVZWEo1VjNKcGRHVWdLR0oxWml3Z2MzUnlhVzVuTENCdlptWnpaWFFzSUd4bGJtZDBhQ2tnZTF4dUlDQnlaWFIxY200Z1gyRnpZMmxwVjNKcGRHVW9ZblZtTENCemRISnBibWNzSUc5bVpuTmxkQ3dnYkdWdVozUm9LVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZZbUZ6WlRZMFYzSnBkR1VnS0dKMVppd2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNrZ2UxeHVJQ0IyWVhJZ1kyaGhjbk5YY21sMGRHVnVJRDBnUW5WbVptVnlMbDlqYUdGeWMxZHlhWFIwWlc0Z1BWeHVJQ0FnSUdKc2FYUkNkV1ptWlhJb1ltRnpaVFkwVkc5Q2VYUmxjeWh6ZEhKcGJtY3BMQ0JpZFdZc0lHOW1abk5sZEN3Z2JHVnVaM1JvS1Z4dUlDQnlaWFIxY200Z1kyaGhjbk5YY21sMGRHVnVYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOTFkR1l4Tm14bFYzSnBkR1VnS0dKMVppd2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNrZ2UxeHVJQ0IyWVhJZ1kyaGhjbk5YY21sMGRHVnVJRDBnUW5WbVptVnlMbDlqYUdGeWMxZHlhWFIwWlc0Z1BWeHVJQ0FnSUdKc2FYUkNkV1ptWlhJb2RYUm1NVFpzWlZSdlFubDBaWE1vYzNSeWFXNW5LU3dnWW5WbUxDQnZabVp6WlhRc0lHeGxibWQwYUNsY2JpQWdjbVYwZFhKdUlHTm9ZWEp6VjNKcGRIUmxibHh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuZHlhWFJsSUQwZ1puVnVZM1JwYjI0Z0tITjBjbWx1Wnl3Z2IyWm1jMlYwTENCc1pXNW5kR2dzSUdWdVkyOWthVzVuS1NCN1hHNGdJQzh2SUZOMWNIQnZjblFnWW05MGFDQW9jM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUN3Z1pXNWpiMlJwYm1jcFhHNGdJQzh2SUdGdVpDQjBhR1VnYkdWbllXTjVJQ2h6ZEhKcGJtY3NJR1Z1WTI5a2FXNW5MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDbGNiaUFnYVdZZ0tHbHpSbWx1YVhSbEtHOW1abk5sZENrcElIdGNiaUFnSUNCcFppQW9JV2x6Um1sdWFYUmxLR3hsYm1kMGFDa3BJSHRjYmlBZ0lDQWdJR1Z1WTI5a2FXNW5JRDBnYkdWdVozUm9YRzRnSUNBZ0lDQnNaVzVuZEdnZ1BTQjFibVJsWm1sdVpXUmNiaUFnSUNCOVhHNGdJSDBnWld4elpTQjdJQ0F2THlCc1pXZGhZM2xjYmlBZ0lDQjJZWElnYzNkaGNDQTlJR1Z1WTI5a2FXNW5YRzRnSUNBZ1pXNWpiMlJwYm1jZ1BTQnZabVp6WlhSY2JpQWdJQ0J2Wm1aelpYUWdQU0JzWlc1bmRHaGNiaUFnSUNCc1pXNW5kR2dnUFNCemQyRndYRzRnSUgxY2JseHVJQ0J2Wm1aelpYUWdQU0JPZFcxaVpYSW9iMlptYzJWMEtTQjhmQ0F3WEc0Z0lIWmhjaUJ5WlcxaGFXNXBibWNnUFNCMGFHbHpMbXhsYm1kMGFDQXRJRzltWm5ObGRGeHVJQ0JwWmlBb0lXeGxibWQwYUNrZ2UxeHVJQ0FnSUd4bGJtZDBhQ0E5SUhKbGJXRnBibWx1WjF4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUd4bGJtZDBhQ0E5SUU1MWJXSmxjaWhzWlc1bmRHZ3BYRzRnSUNBZ2FXWWdLR3hsYm1kMGFDQStJSEpsYldGcGJtbHVaeWtnZTF4dUlDQWdJQ0FnYkdWdVozUm9JRDBnY21WdFlXbHVhVzVuWEc0Z0lDQWdmVnh1SUNCOVhHNGdJR1Z1WTI5a2FXNW5JRDBnVTNSeWFXNW5LR1Z1WTI5a2FXNW5JSHg4SUNkMWRHWTRKeWt1ZEc5TWIzZGxja05oYzJVb0tWeHVYRzRnSUhaaGNpQnlaWFJjYmlBZ2MzZHBkR05vSUNobGJtTnZaR2x1WnlrZ2UxeHVJQ0FnSUdOaGMyVWdKMmhsZUNjNlhHNGdJQ0FnSUNCeVpYUWdQU0JmYUdWNFYzSnBkR1VvZEdocGN5d2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1kyRnpaU0FuZFhSbU9DYzZYRzRnSUNBZ1kyRnpaU0FuZFhSbUxUZ25PbHh1SUNBZ0lDQWdjbVYwSUQwZ1gzVjBaamhYY21sMFpTaDBhR2x6TENCemRISnBibWNzSUc5bVpuTmxkQ3dnYkdWdVozUm9LVnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZGhjMk5wYVNjNlhHNGdJQ0FnSUNCeVpYUWdQU0JmWVhOamFXbFhjbWwwWlNoMGFHbHpMQ0J6ZEhKcGJtY3NJRzltWm5ObGRDd2diR1Z1WjNSb0tWeHVJQ0FnSUNBZ1luSmxZV3RjYmlBZ0lDQmpZWE5sSUNkaWFXNWhjbmtuT2x4dUlDQWdJQ0FnY21WMElEMGdYMkpwYm1GeWVWZHlhWFJsS0hSb2FYTXNJSE4wY21sdVp5d2diMlptYzJWMExDQnNaVzVuZEdncFhHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjJKaGMyVTJOQ2M2WEc0Z0lDQWdJQ0J5WlhRZ1BTQmZZbUZ6WlRZMFYzSnBkR1VvZEdocGN5d2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1kyRnpaU0FuZFdOek1pYzZYRzRnSUNBZ1kyRnpaU0FuZFdOekxUSW5PbHh1SUNBZ0lHTmhjMlVnSjNWMFpqRTJiR1VuT2x4dUlDQWdJR05oYzJVZ0ozVjBaaTB4Tm14bEp6cGNiaUFnSUNBZ0lISmxkQ0E5SUY5MWRHWXhObXhsVjNKcGRHVW9kR2hwY3l3Z2MzUnlhVzVuTENCdlptWnpaWFFzSUd4bGJtZDBhQ2xjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWkdWbVlYVnNkRHBjYmlBZ0lDQWdJSFJvY205M0lHNWxkeUJGY25KdmNpZ25WVzVyYm05M2JpQmxibU52WkdsdVp5Y3BYRzRnSUgxY2JpQWdjbVYwZFhKdUlISmxkRnh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bklEMGdablZ1WTNScGIyNGdLR1Z1WTI5a2FXNW5MQ0J6ZEdGeWRDd2daVzVrS1NCN1hHNGdJSFpoY2lCelpXeG1JRDBnZEdocGMxeHVYRzRnSUdWdVkyOWthVzVuSUQwZ1UzUnlhVzVuS0dWdVkyOWthVzVuSUh4OElDZDFkR1k0SnlrdWRHOU1iM2RsY2tOaGMyVW9LVnh1SUNCemRHRnlkQ0E5SUU1MWJXSmxjaWh6ZEdGeWRDa2dmSHdnTUZ4dUlDQmxibVFnUFNBb1pXNWtJQ0U5UFNCMWJtUmxabWx1WldRcFhHNGdJQ0FnUHlCT2RXMWlaWElvWlc1a0tWeHVJQ0FnSURvZ1pXNWtJRDBnYzJWc1ppNXNaVzVuZEdoY2JseHVJQ0F2THlCR1lYTjBjR0YwYUNCbGJYQjBlU0J6ZEhKcGJtZHpYRzRnSUdsbUlDaGxibVFnUFQwOUlITjBZWEowS1Z4dUlDQWdJSEpsZEhWeWJpQW5KMXh1WEc0Z0lIWmhjaUJ5WlhSY2JpQWdjM2RwZEdOb0lDaGxibU52WkdsdVp5a2dlMXh1SUNBZ0lHTmhjMlVnSjJobGVDYzZYRzRnSUNBZ0lDQnlaWFFnUFNCZmFHVjRVMnhwWTJVb2MyVnNaaXdnYzNSaGNuUXNJR1Z1WkNsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1kyRnpaU0FuZFhSbU9DYzZYRzRnSUNBZ1kyRnpaU0FuZFhSbUxUZ25PbHh1SUNBZ0lDQWdjbVYwSUQwZ1gzVjBaamhUYkdsalpTaHpaV3htTENCemRHRnlkQ3dnWlc1a0tWeHVJQ0FnSUNBZ1luSmxZV3RjYmlBZ0lDQmpZWE5sSUNkaGMyTnBhU2M2WEc0Z0lDQWdJQ0J5WlhRZ1BTQmZZWE5qYVdsVGJHbGpaU2h6Wld4bUxDQnpkR0Z5ZEN3Z1pXNWtLVnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZGlhVzVoY25rbk9seHVJQ0FnSUNBZ2NtVjBJRDBnWDJKcGJtRnllVk5zYVdObEtITmxiR1lzSUhOMFlYSjBMQ0JsYm1RcFhHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjJKaGMyVTJOQ2M2WEc0Z0lDQWdJQ0J5WlhRZ1BTQmZZbUZ6WlRZMFUyeHBZMlVvYzJWc1ppd2djM1JoY25Rc0lHVnVaQ2xjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWTJGelpTQW5kV056TWljNlhHNGdJQ0FnWTJGelpTQW5kV056TFRJbk9seHVJQ0FnSUdOaGMyVWdKM1YwWmpFMmJHVW5PbHh1SUNBZ0lHTmhjMlVnSjNWMFppMHhObXhsSnpwY2JpQWdJQ0FnSUhKbGRDQTlJRjkxZEdZeE5teGxVMnhwWTJVb2MyVnNaaXdnYzNSaGNuUXNJR1Z1WkNsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1pHVm1ZWFZzZERwY2JpQWdJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduVlc1cmJtOTNiaUJsYm1OdlpHbHVaeWNwWEc0Z0lIMWNiaUFnY21WMGRYSnVJSEpsZEZ4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMblJ2U2xOUFRpQTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdjbVYwZFhKdUlIdGNiaUFnSUNCMGVYQmxPaUFuUW5WbVptVnlKeXhjYmlBZ0lDQmtZWFJoT2lCQmNuSmhlUzV3Y205MGIzUjVjR1V1YzJ4cFkyVXVZMkZzYkNoMGFHbHpMbDloY25JZ2ZId2dkR2hwY3l3Z01DbGNiaUFnZlZ4dWZWeHVYRzR2THlCamIzQjVLSFJoY21kbGRFSjFabVpsY2l3Z2RHRnlaMlYwVTNSaGNuUTlNQ3dnYzI5MWNtTmxVM1JoY25ROU1Dd2djMjkxY21ObFJXNWtQV0oxWm1abGNpNXNaVzVuZEdncFhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExtTnZjSGtnUFNCbWRXNWpkR2x2YmlBb2RHRnlaMlYwTENCMFlYSm5aWFJmYzNSaGNuUXNJSE4wWVhKMExDQmxibVFwSUh0Y2JpQWdkbUZ5SUhOdmRYSmpaU0E5SUhSb2FYTmNibHh1SUNCcFppQW9JWE4wWVhKMEtTQnpkR0Z5ZENBOUlEQmNiaUFnYVdZZ0tDRmxibVFnSmlZZ1pXNWtJQ0U5UFNBd0tTQmxibVFnUFNCMGFHbHpMbXhsYm1kMGFGeHVJQ0JwWmlBb0lYUmhjbWRsZEY5emRHRnlkQ2tnZEdGeVoyVjBYM04wWVhKMElEMGdNRnh1WEc0Z0lDOHZJRU52Y0hrZ01DQmllWFJsY3pzZ2QyVW5jbVVnWkc5dVpWeHVJQ0JwWmlBb1pXNWtJRDA5UFNCemRHRnlkQ2tnY21WMGRYSnVYRzRnSUdsbUlDaDBZWEpuWlhRdWJHVnVaM1JvSUQwOVBTQXdJSHg4SUhOdmRYSmpaUzVzWlc1bmRHZ2dQVDA5SURBcElISmxkSFZ5Ymx4dVhHNGdJQzh2SUVaaGRHRnNJR1Z5Y205eUlHTnZibVJwZEdsdmJuTmNiaUFnWVhOelpYSjBLR1Z1WkNBK1BTQnpkR0Z5ZEN3Z0ozTnZkWEpqWlVWdVpDQThJSE52ZFhKalpWTjBZWEowSnlsY2JpQWdZWE56WlhKMEtIUmhjbWRsZEY5emRHRnlkQ0ErUFNBd0lDWW1JSFJoY21kbGRGOXpkR0Z5ZENBOElIUmhjbWRsZEM1c1pXNW5kR2dzWEc0Z0lDQWdJQ0FuZEdGeVoyVjBVM1JoY25RZ2IzVjBJRzltSUdKdmRXNWtjeWNwWEc0Z0lHRnpjMlZ5ZENoemRHRnlkQ0ErUFNBd0lDWW1JSE4wWVhKMElEd2djMjkxY21ObExteGxibWQwYUN3Z0ozTnZkWEpqWlZOMFlYSjBJRzkxZENCdlppQmliM1Z1WkhNbktWeHVJQ0JoYzNObGNuUW9aVzVrSUQ0OUlEQWdKaVlnWlc1a0lEdzlJSE52ZFhKalpTNXNaVzVuZEdnc0lDZHpiM1Z5WTJWRmJtUWdiM1YwSUc5bUlHSnZkVzVrY3ljcFhHNWNiaUFnTHk4Z1FYSmxJSGRsSUc5dllqOWNiaUFnYVdZZ0tHVnVaQ0ErSUhSb2FYTXViR1Z1WjNSb0tWeHVJQ0FnSUdWdVpDQTlJSFJvYVhNdWJHVnVaM1JvWEc0Z0lHbG1JQ2gwWVhKblpYUXViR1Z1WjNSb0lDMGdkR0Z5WjJWMFgzTjBZWEowSUR3Z1pXNWtJQzBnYzNSaGNuUXBYRzRnSUNBZ1pXNWtJRDBnZEdGeVoyVjBMbXhsYm1kMGFDQXRJSFJoY21kbGRGOXpkR0Z5ZENBcklITjBZWEowWEc1Y2JpQWdkbUZ5SUd4bGJpQTlJR1Z1WkNBdElITjBZWEowWEc1Y2JpQWdhV1lnS0d4bGJpQThJREV3TUNCOGZDQWhRblZtWm1WeUxsOTFjMlZVZVhCbFpFRnljbUY1Y3lrZ2UxeHVJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2JHVnVPeUJwS3lzcFhHNGdJQ0FnSUNCMFlYSm5aWFJiYVNBcklIUmhjbWRsZEY5emRHRnlkRjBnUFNCMGFHbHpXMmtnS3lCemRHRnlkRjFjYmlBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0IwWVhKblpYUXVYM05sZENoMGFHbHpMbk4xWW1GeWNtRjVLSE4wWVhKMExDQnpkR0Z5ZENBcklHeGxiaWtzSUhSaGNtZGxkRjl6ZEdGeWRDbGNiaUFnZlZ4dWZWeHVYRzVtZFc1amRHbHZiaUJmWW1GelpUWTBVMnhwWTJVZ0tHSjFaaXdnYzNSaGNuUXNJR1Z1WkNrZ2UxeHVJQ0JwWmlBb2MzUmhjblFnUFQwOUlEQWdKaVlnWlc1a0lEMDlQU0JpZFdZdWJHVnVaM1JvS1NCN1hHNGdJQ0FnY21WMGRYSnVJR0poYzJVMk5DNW1jbTl0UW5sMFpVRnljbUY1S0dKMVppbGNiaUFnZlNCbGJITmxJSHRjYmlBZ0lDQnlaWFIxY200Z1ltRnpaVFkwTG1aeWIyMUNlWFJsUVhKeVlYa29ZblZtTG5Oc2FXTmxLSE4wWVhKMExDQmxibVFwS1Z4dUlDQjlYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOTFkR1k0VTJ4cFkyVWdLR0oxWml3Z2MzUmhjblFzSUdWdVpDa2dlMXh1SUNCMllYSWdjbVZ6SUQwZ0p5ZGNiaUFnZG1GeUlIUnRjQ0E5SUNjblhHNGdJR1Z1WkNBOUlFMWhkR2d1YldsdUtHSjFaaTVzWlc1bmRHZ3NJR1Z1WkNsY2JseHVJQ0JtYjNJZ0tIWmhjaUJwSUQwZ2MzUmhjblE3SUdrZ1BDQmxibVE3SUdrckt5a2dlMXh1SUNBZ0lHbG1JQ2hpZFdaYmFWMGdQRDBnTUhnM1Jpa2dlMXh1SUNBZ0lDQWdjbVZ6SUNzOUlHUmxZMjlrWlZWMFpqaERhR0Z5S0hSdGNDa2dLeUJUZEhKcGJtY3Vabkp2YlVOb1lYSkRiMlJsS0dKMVpsdHBYU2xjYmlBZ0lDQWdJSFJ0Y0NBOUlDY25YRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUhSdGNDQXJQU0FuSlNjZ0t5QmlkV1piYVYwdWRHOVRkSEpwYm1jb01UWXBYRzRnSUNBZ2ZWeHVJQ0I5WEc1Y2JpQWdjbVYwZFhKdUlISmxjeUFySUdSbFkyOWtaVlYwWmpoRGFHRnlLSFJ0Y0NsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWDJGelkybHBVMnhwWTJVZ0tHSjFaaXdnYzNSaGNuUXNJR1Z1WkNrZ2UxeHVJQ0IyWVhJZ2NtVjBJRDBnSnlkY2JpQWdaVzVrSUQwZ1RXRjBhQzV0YVc0b1luVm1MbXhsYm1kMGFDd2daVzVrS1Z4dVhHNGdJR1p2Y2lBb2RtRnlJR2tnUFNCemRHRnlkRHNnYVNBOElHVnVaRHNnYVNzcktWeHVJQ0FnSUhKbGRDQXJQU0JUZEhKcGJtY3Vabkp2YlVOb1lYSkRiMlJsS0dKMVpsdHBYU2xjYmlBZ2NtVjBkWEp1SUhKbGRGeHVmVnh1WEc1bWRXNWpkR2x2YmlCZlltbHVZWEo1VTJ4cFkyVWdLR0oxWml3Z2MzUmhjblFzSUdWdVpDa2dlMXh1SUNCeVpYUjFjbTRnWDJGelkybHBVMnhwWTJVb1luVm1MQ0J6ZEdGeWRDd2daVzVrS1Z4dWZWeHVYRzVtZFc1amRHbHZiaUJmYUdWNFUyeHBZMlVnS0dKMVppd2djM1JoY25Rc0lHVnVaQ2tnZTF4dUlDQjJZWElnYkdWdUlEMGdZblZtTG14bGJtZDBhRnh1WEc0Z0lHbG1JQ2doYzNSaGNuUWdmSHdnYzNSaGNuUWdQQ0F3S1NCemRHRnlkQ0E5SURCY2JpQWdhV1lnS0NGbGJtUWdmSHdnWlc1a0lEd2dNQ0I4ZkNCbGJtUWdQaUJzWlc0cElHVnVaQ0E5SUd4bGJseHVYRzRnSUhaaGNpQnZkWFFnUFNBbkoxeHVJQ0JtYjNJZ0tIWmhjaUJwSUQwZ2MzUmhjblE3SUdrZ1BDQmxibVE3SUdrckt5a2dlMXh1SUNBZ0lHOTFkQ0FyUFNCMGIwaGxlQ2hpZFdaYmFWMHBYRzRnSUgxY2JpQWdjbVYwZFhKdUlHOTFkRnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZkWFJtTVRac1pWTnNhV05sSUNoaWRXWXNJSE4wWVhKMExDQmxibVFwSUh0Y2JpQWdkbUZ5SUdKNWRHVnpJRDBnWW5WbUxuTnNhV05sS0hOMFlYSjBMQ0JsYm1RcFhHNGdJSFpoY2lCeVpYTWdQU0FuSjF4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJR0o1ZEdWekxteGxibWQwYURzZ2FTQXJQU0F5S1NCN1hHNGdJQ0FnY21WeklDczlJRk4wY21sdVp5NW1jbTl0UTJoaGNrTnZaR1VvWW5sMFpYTmJhVjBnS3lCaWVYUmxjMXRwS3pGZElDb2dNalUyS1Z4dUlDQjlYRzRnSUhKbGRIVnliaUJ5WlhOY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzV6YkdsalpTQTlJR1oxYm1OMGFXOXVJQ2h6ZEdGeWRDd2daVzVrS1NCN1hHNGdJSFpoY2lCc1pXNGdQU0IwYUdsekxteGxibWQwYUZ4dUlDQnpkR0Z5ZENBOUlHTnNZVzF3S0hOMFlYSjBMQ0JzWlc0c0lEQXBYRzRnSUdWdVpDQTlJR05zWVcxd0tHVnVaQ3dnYkdWdUxDQnNaVzRwWEc1Y2JpQWdhV1lnS0VKMVptWmxjaTVmZFhObFZIbHdaV1JCY25KaGVYTXBJSHRjYmlBZ0lDQnlaWFIxY200Z1FuVm1abVZ5TGw5aGRXZHRaVzUwS0hSb2FYTXVjM1ZpWVhKeVlYa29jM1JoY25Rc0lHVnVaQ2twWEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnZG1GeUlITnNhV05sVEdWdUlEMGdaVzVrSUMwZ2MzUmhjblJjYmlBZ0lDQjJZWElnYm1WM1FuVm1JRDBnYm1WM0lFSjFabVpsY2loemJHbGpaVXhsYml3Z2RXNWtaV1pwYm1Wa0xDQjBjblZsS1Z4dUlDQWdJR1p2Y2lBb2RtRnlJR2tnUFNBd095QnBJRHdnYzJ4cFkyVk1aVzQ3SUdrckt5a2dlMXh1SUNBZ0lDQWdibVYzUW5WbVcybGRJRDBnZEdocGMxdHBJQ3NnYzNSaGNuUmRYRzRnSUNBZ2ZWeHVJQ0FnSUhKbGRIVnliaUJ1WlhkQ2RXWmNiaUFnZlZ4dWZWeHVYRzR2THlCZ1oyVjBZQ0IzYVd4c0lHSmxJSEpsYlc5MlpXUWdhVzRnVG05a1pTQXdMakV6SzF4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1blpYUWdQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBLU0I3WEc0Z0lHTnZibk52YkdVdWJHOW5LQ2N1WjJWMEtDa2dhWE1nWkdWd2NtVmpZWFJsWkM0Z1FXTmpaWE56SUhWemFXNW5JR0Z5Y21GNUlHbHVaR1Y0WlhNZ2FXNXpkR1ZoWkM0bktWeHVJQ0J5WlhSMWNtNGdkR2hwY3k1eVpXRmtWVWx1ZERnb2IyWm1jMlYwS1Z4dWZWeHVYRzR2THlCZ2MyVjBZQ0IzYVd4c0lHSmxJSEpsYlc5MlpXUWdhVzRnVG05a1pTQXdMakV6SzF4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1elpYUWdQU0JtZFc1amRHbHZiaUFvZGl3Z2IyWm1jMlYwS1NCN1hHNGdJR052Ym5OdmJHVXViRzluS0NjdWMyVjBLQ2tnYVhNZ1pHVndjbVZqWVhSbFpDNGdRV05qWlhOeklIVnphVzVuSUdGeWNtRjVJR2x1WkdWNFpYTWdhVzV6ZEdWaFpDNG5LVnh1SUNCeVpYUjFjbTRnZEdocGN5NTNjbWwwWlZWSmJuUTRLSFlzSUc5bVpuTmxkQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXlaV0ZrVlVsdWREZ2dQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlHOW1abk5sZENBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2IyWm1jMlYwSnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElEd2dkR2hwY3k1c1pXNW5kR2dzSUNkVWNubHBibWNnZEc4Z2NtVmhaQ0JpWlhsdmJtUWdZblZtWm1WeUlHeGxibWQwYUNjcFhHNGdJSDFjYmx4dUlDQnBaaUFvYjJabWMyVjBJRDQ5SUhSb2FYTXViR1Z1WjNSb0tWeHVJQ0FnSUhKbGRIVnlibHh1WEc0Z0lISmxkSFZ5YmlCMGFHbHpXMjltWm5ObGRGMWNibjFjYmx4dVpuVnVZM1JwYjI0Z1gzSmxZV1JWU1c1ME1UWWdLR0oxWml3Z2IyWm1jMlYwTENCc2FYUjBiR1ZGYm1ScFlXNHNJRzV2UVhOelpYSjBLU0I3WEc0Z0lHbG1JQ2doYm05QmMzTmxjblFwSUh0Y2JpQWdJQ0JoYzNObGNuUW9kSGx3Wlc5bUlHeHBkSFJzWlVWdVpHbGhiaUE5UFQwZ0oySnZiMnhsWVc0bkxDQW5iV2x6YzJsdVp5QnZjaUJwYm5aaGJHbGtJR1Z1WkdsaGJpY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JRzltWm5ObGRDQWhQVDBnYm5Wc2JDd2dKMjFwYzNOcGJtY2diMlptYzJWMEp5bGNiaUFnSUNCaGMzTmxjblFvYjJabWMyVjBJQ3NnTVNBOElHSjFaaTVzWlc1bmRHZ3NJQ2RVY25scGJtY2dkRzhnY21WaFpDQmlaWGx2Ym1RZ1luVm1abVZ5SUd4bGJtZDBhQ2NwWEc0Z0lIMWNibHh1SUNCMllYSWdiR1Z1SUQwZ1luVm1MbXhsYm1kMGFGeHVJQ0JwWmlBb2IyWm1jMlYwSUQ0OUlHeGxiaWxjYmlBZ0lDQnlaWFIxY201Y2JseHVJQ0IyWVhJZ2RtRnNYRzRnSUdsbUlDaHNhWFIwYkdWRmJtUnBZVzRwSUh0Y2JpQWdJQ0IyWVd3Z1BTQmlkV1piYjJabWMyVjBYVnh1SUNBZ0lHbG1JQ2h2Wm1aelpYUWdLeUF4SUR3Z2JHVnVLVnh1SUNBZ0lDQWdkbUZzSUh3OUlHSjFabHR2Wm1aelpYUWdLeUF4WFNBOFBDQTRYRzRnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdkbUZzSUQwZ1luVm1XMjltWm5ObGRGMGdQRHdnT0Z4dUlDQWdJR2xtSUNodlptWnpaWFFnS3lBeElEd2diR1Z1S1Z4dUlDQWdJQ0FnZG1Gc0lIdzlJR0oxWmx0dlptWnpaWFFnS3lBeFhWeHVJQ0I5WEc0Z0lISmxkSFZ5YmlCMllXeGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1eVpXRmtWVWx1ZERFMlRFVWdQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnlaWFIxY200Z1gzSmxZV1JWU1c1ME1UWW9kR2hwY3l3Z2IyWm1jMlYwTENCMGNuVmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXlaV0ZrVlVsdWRERTJRa1VnUFNCbWRXNWpkR2x2YmlBb2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0J5WlhSMWNtNGdYM0psWVdSVlNXNTBNVFlvZEdocGN5d2diMlptYzJWMExDQm1ZV3h6WlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYm1aMWJtTjBhVzl1SUY5eVpXRmtWVWx1ZERNeUlDaGlkV1lzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDa2dlMXh1SUNCcFppQW9JVzV2UVhOelpYSjBLU0I3WEc0Z0lDQWdZWE56WlhKMEtIUjVjR1Z2WmlCc2FYUjBiR1ZGYm1ScFlXNGdQVDA5SUNkaWIyOXNaV0Z1Snl3Z0oyMXBjM05wYm1jZ2IzSWdhVzUyWVd4cFpDQmxibVJwWVc0bktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQnZabVp6WlhRZ0lUMDlJRzUxYkd3c0lDZHRhWE56YVc1bklHOW1abk5sZENjcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQXJJRE1nUENCaWRXWXViR1Z1WjNSb0xDQW5WSEo1YVc1bklIUnZJSEpsWVdRZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNCOVhHNWNiaUFnZG1GeUlHeGxiaUE5SUdKMVppNXNaVzVuZEdoY2JpQWdhV1lnS0c5bVpuTmxkQ0ErUFNCc1pXNHBYRzRnSUNBZ2NtVjBkWEp1WEc1Y2JpQWdkbUZ5SUhaaGJGeHVJQ0JwWmlBb2JHbDBkR3hsUlc1a2FXRnVLU0I3WEc0Z0lDQWdhV1lnS0c5bVpuTmxkQ0FySURJZ1BDQnNaVzRwWEc0Z0lDQWdJQ0IyWVd3Z1BTQmlkV1piYjJabWMyVjBJQ3NnTWwwZ1BEd2dNVFpjYmlBZ0lDQnBaaUFvYjJabWMyVjBJQ3NnTVNBOElHeGxiaWxjYmlBZ0lDQWdJSFpoYkNCOFBTQmlkV1piYjJabWMyVjBJQ3NnTVYwZ1BEd2dPRnh1SUNBZ0lIWmhiQ0I4UFNCaWRXWmJiMlptYzJWMFhWeHVJQ0FnSUdsbUlDaHZabVp6WlhRZ0t5QXpJRHdnYkdWdUtWeHVJQ0FnSUNBZ2RtRnNJRDBnZG1Gc0lDc2dLR0oxWmx0dlptWnpaWFFnS3lBelhTQThQQ0F5TkNBK1BqNGdNQ2xjYmlBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0JwWmlBb2IyWm1jMlYwSUNzZ01TQThJR3hsYmlsY2JpQWdJQ0FnSUhaaGJDQTlJR0oxWmx0dlptWnpaWFFnS3lBeFhTQThQQ0F4Tmx4dUlDQWdJR2xtSUNodlptWnpaWFFnS3lBeUlEd2diR1Z1S1Z4dUlDQWdJQ0FnZG1Gc0lIdzlJR0oxWmx0dlptWnpaWFFnS3lBeVhTQThQQ0E0WEc0Z0lDQWdhV1lnS0c5bVpuTmxkQ0FySURNZ1BDQnNaVzRwWEc0Z0lDQWdJQ0IyWVd3Z2ZEMGdZblZtVzI5bVpuTmxkQ0FySUROZFhHNGdJQ0FnZG1Gc0lEMGdkbUZzSUNzZ0tHSjFabHR2Wm1aelpYUmRJRHc4SURJMElENCtQaUF3S1Z4dUlDQjlYRzRnSUhKbGRIVnliaUIyWVd4Y2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzV5WldGa1ZVbHVkRE15VEVVZ1BTQm1kVzVqZEdsdmJpQW9iMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCeVpYUjFjbTRnWDNKbFlXUlZTVzUwTXpJb2RHaHBjeXdnYjJabWMyVjBMQ0IwY25WbExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1eVpXRmtWVWx1ZERNeVFrVWdQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnlaWFIxY200Z1gzSmxZV1JWU1c1ME16SW9kR2hwY3l3Z2IyWm1jMlYwTENCbVlXeHpaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVjbVZoWkVsdWREZ2dQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlHOW1abk5sZENBaFBUMGdiblZzYkN4Y2JpQWdJQ0FnSUNBZ0oyMXBjM05wYm1jZ2IyWm1jMlYwSnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElEd2dkR2hwY3k1c1pXNW5kR2dzSUNkVWNubHBibWNnZEc4Z2NtVmhaQ0JpWlhsdmJtUWdZblZtWm1WeUlHeGxibWQwYUNjcFhHNGdJSDFjYmx4dUlDQnBaaUFvYjJabWMyVjBJRDQ5SUhSb2FYTXViR1Z1WjNSb0tWeHVJQ0FnSUhKbGRIVnlibHh1WEc0Z0lIWmhjaUJ1WldjZ1BTQjBhR2x6VzI5bVpuTmxkRjBnSmlBd2VEZ3dYRzRnSUdsbUlDaHVaV2NwWEc0Z0lDQWdjbVYwZFhKdUlDZ3dlR1ptSUMwZ2RHaHBjMXR2Wm1aelpYUmRJQ3NnTVNrZ0tpQXRNVnh1SUNCbGJITmxYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTmJiMlptYzJWMFhWeHVmVnh1WEc1bWRXNWpkR2x2YmlCZmNtVmhaRWx1ZERFMklDaGlkV1lzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDa2dlMXh1SUNCcFppQW9JVzV2UVhOelpYSjBLU0I3WEc0Z0lDQWdZWE56WlhKMEtIUjVjR1Z2WmlCc2FYUjBiR1ZGYm1ScFlXNGdQVDA5SUNkaWIyOXNaV0Z1Snl3Z0oyMXBjM05wYm1jZ2IzSWdhVzUyWVd4cFpDQmxibVJwWVc0bktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQnZabVp6WlhRZ0lUMDlJRzUxYkd3c0lDZHRhWE56YVc1bklHOW1abk5sZENjcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQXJJREVnUENCaWRXWXViR1Z1WjNSb0xDQW5WSEo1YVc1bklIUnZJSEpsWVdRZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNCOVhHNWNiaUFnZG1GeUlHeGxiaUE5SUdKMVppNXNaVzVuZEdoY2JpQWdhV1lnS0c5bVpuTmxkQ0ErUFNCc1pXNHBYRzRnSUNBZ2NtVjBkWEp1WEc1Y2JpQWdkbUZ5SUhaaGJDQTlJRjl5WldGa1ZVbHVkREUyS0dKMVppd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSUhSeWRXVXBYRzRnSUhaaGNpQnVaV2NnUFNCMllXd2dKaUF3ZURnd01EQmNiaUFnYVdZZ0tHNWxaeWxjYmlBZ0lDQnlaWFIxY200Z0tEQjRabVptWmlBdElIWmhiQ0FySURFcElDb2dMVEZjYmlBZ1pXeHpaVnh1SUNBZ0lISmxkSFZ5YmlCMllXeGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1eVpXRmtTVzUwTVRaTVJTQTlJR1oxYm1OMGFXOXVJQ2h2Wm1aelpYUXNJRzV2UVhOelpYSjBLU0I3WEc0Z0lISmxkSFZ5YmlCZmNtVmhaRWx1ZERFMktIUm9hWE1zSUc5bVpuTmxkQ3dnZEhKMVpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdWNtVmhaRWx1ZERFMlFrVWdQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnlaWFIxY200Z1gzSmxZV1JKYm5ReE5paDBhR2x6TENCdlptWnpaWFFzSUdaaGJITmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVablZ1WTNScGIyNGdYM0psWVdSSmJuUXpNaUFvWW5WbUxDQnZabVp6WlhRc0lHeHBkSFJzWlVWdVpHbGhiaXdnYm05QmMzTmxjblFwSUh0Y2JpQWdhV1lnS0NGdWIwRnpjMlZ5ZENrZ2UxeHVJQ0FnSUdGemMyVnlkQ2gwZVhCbGIyWWdiR2wwZEd4bFJXNWthV0Z1SUQwOVBTQW5ZbTl2YkdWaGJpY3NJQ2R0YVhOemFXNW5JRzl5SUdsdWRtRnNhV1FnWlc1a2FXRnVKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnYjJabWMyVjBJQ0U5UFNCdWRXeHNMQ0FuYldsemMybHVaeUJ2Wm1aelpYUW5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnS3lBeklEd2dZblZtTG14bGJtZDBhQ3dnSjFSeWVXbHVaeUIwYnlCeVpXRmtJR0psZVc5dVpDQmlkV1ptWlhJZ2JHVnVaM1JvSnlsY2JpQWdmVnh1WEc0Z0lIWmhjaUJzWlc0Z1BTQmlkV1l1YkdWdVozUm9YRzRnSUdsbUlDaHZabVp6WlhRZ1BqMGdiR1Z1S1Z4dUlDQWdJSEpsZEhWeWJseHVYRzRnSUhaaGNpQjJZV3dnUFNCZmNtVmhaRlZKYm5Rek1paGlkV1lzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQjBjblZsS1Z4dUlDQjJZWElnYm1WbklEMGdkbUZzSUNZZ01IZzRNREF3TURBd01GeHVJQ0JwWmlBb2JtVm5LVnh1SUNBZ0lISmxkSFZ5YmlBb01IaG1abVptWm1abVppQXRJSFpoYkNBcklERXBJQ29nTFRGY2JpQWdaV3h6WlZ4dUlDQWdJSEpsZEhWeWJpQjJZV3hjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXlaV0ZrU1c1ME16Sk1SU0E5SUdaMWJtTjBhVzl1SUNodlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJSEpsZEhWeWJpQmZjbVZoWkVsdWRETXlLSFJvYVhNc0lHOW1abk5sZEN3Z2RISjFaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVjbVZoWkVsdWRETXlRa1VnUFNCbWRXNWpkR2x2YmlBb2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0J5WlhSMWNtNGdYM0psWVdSSmJuUXpNaWgwYUdsekxDQnZabVp6WlhRc0lHWmhiSE5sTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWDNKbFlXUkdiRzloZENBb1luVm1MQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENoMGVYQmxiMllnYkdsMGRHeGxSVzVrYVdGdUlEMDlQU0FuWW05dmJHVmhiaWNzSUNkdGFYTnphVzVuSUc5eUlHbHVkbUZzYVdRZ1pXNWthV0Z1SnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDc2dNeUE4SUdKMVppNXNaVzVuZEdnc0lDZFVjbmxwYm1jZ2RHOGdjbVZoWkNCaVpYbHZibVFnWW5WbVptVnlJR3hsYm1kMGFDY3BYRzRnSUgxY2JseHVJQ0J5WlhSMWNtNGdhV1ZsWlRjMU5DNXlaV0ZrS0dKMVppd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSURJekxDQTBLVnh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuSmxZV1JHYkc5aGRFeEZJRDBnWm5WdVkzUnBiMjRnS0c5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdjbVYwZFhKdUlGOXlaV0ZrUm14dllYUW9kR2hwY3l3Z2IyWm1jMlYwTENCMGNuVmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXlaV0ZrUm14dllYUkNSU0E5SUdaMWJtTjBhVzl1SUNodlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJSEpsZEhWeWJpQmZjbVZoWkVac2IyRjBLSFJvYVhNc0lHOW1abk5sZEN3Z1ptRnNjMlVzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVtZFc1amRHbHZiaUJmY21WaFpFUnZkV0pzWlNBb1luVm1MQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENoMGVYQmxiMllnYkdsMGRHeGxSVzVrYVdGdUlEMDlQU0FuWW05dmJHVmhiaWNzSUNkdGFYTnphVzVuSUc5eUlHbHVkbUZzYVdRZ1pXNWthV0Z1SnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDc2dOeUE4SUdKMVppNXNaVzVuZEdnc0lDZFVjbmxwYm1jZ2RHOGdjbVZoWkNCaVpYbHZibVFnWW5WbVptVnlJR3hsYm1kMGFDY3BYRzRnSUgxY2JseHVJQ0J5WlhSMWNtNGdhV1ZsWlRjMU5DNXlaV0ZrS0dKMVppd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSURVeUxDQTRLVnh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuSmxZV1JFYjNWaWJHVk1SU0E5SUdaMWJtTjBhVzl1SUNodlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJSEpsZEhWeWJpQmZjbVZoWkVSdmRXSnNaU2gwYUdsekxDQnZabVp6WlhRc0lIUnlkV1VzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbkpsWVdSRWIzVmliR1ZDUlNBOUlHWjFibU4wYVc5dUlDaHZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUhKbGRIVnliaUJmY21WaFpFUnZkV0pzWlNoMGFHbHpMQ0J2Wm1aelpYUXNJR1poYkhObExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1M2NtbDBaVlZKYm5RNElEMGdablZ1WTNScGIyNGdLSFpoYkhWbExDQnZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUdsbUlDZ2hibTlCYzNObGNuUXBJSHRjYmlBZ0lDQmhjM05sY25Rb2RtRnNkV1VnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUIyWVd4MVpTQWhQVDBnYm5Wc2JDd2dKMjFwYzNOcGJtY2dkbUZzZFdVbktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQnZabVp6WlhRZ0lUMDlJRzUxYkd3c0lDZHRhWE56YVc1bklHOW1abk5sZENjcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQThJSFJvYVhNdWJHVnVaM1JvTENBbmRISjVhVzVuSUhSdklIZHlhWFJsSUdKbGVXOXVaQ0JpZFdabVpYSWdiR1Z1WjNSb0p5bGNiaUFnSUNCMlpYSnBablZwYm5Rb2RtRnNkV1VzSURCNFptWXBYRzRnSUgxY2JseHVJQ0JwWmlBb2IyWm1jMlYwSUQ0OUlIUm9hWE11YkdWdVozUm9LU0J5WlhSMWNtNWNibHh1SUNCMGFHbHpXMjltWm5ObGRGMGdQU0IyWVd4MVpWeHVmVnh1WEc1bWRXNWpkR2x2YmlCZmQzSnBkR1ZWU1c1ME1UWWdLR0oxWml3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDa2dlMXh1SUNCcFppQW9JVzV2UVhOelpYSjBLU0I3WEc0Z0lDQWdZWE56WlhKMEtIWmhiSFZsSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnZG1Gc2RXVWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JSFpoYkhWbEp5bGNiaUFnSUNCaGMzTmxjblFvZEhsd1pXOW1JR3hwZEhSc1pVVnVaR2xoYmlBOVBUMGdKMkp2YjJ4bFlXNG5MQ0FuYldsemMybHVaeUJ2Y2lCcGJuWmhiR2xrSUdWdVpHbGhiaWNwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUc5bVpuTmxkQ0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnYjJabWMyVjBKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNzZ01TQThJR0oxWmk1c1pXNW5kR2dzSUNkMGNubHBibWNnZEc4Z2QzSnBkR1VnWW1WNWIyNWtJR0oxWm1abGNpQnNaVzVuZEdnbktWeHVJQ0FnSUhabGNtbG1kV2x1ZENoMllXeDFaU3dnTUhobVptWm1LVnh1SUNCOVhHNWNiaUFnZG1GeUlHeGxiaUE5SUdKMVppNXNaVzVuZEdoY2JpQWdhV1lnS0c5bVpuTmxkQ0ErUFNCc1pXNHBYRzRnSUNBZ2NtVjBkWEp1WEc1Y2JpQWdabTl5SUNoMllYSWdhU0E5SURBc0lHb2dQU0JOWVhSb0xtMXBiaWhzWlc0Z0xTQnZabVp6WlhRc0lESXBPeUJwSUR3Z2Fqc2dhU3NyS1NCN1hHNGdJQ0FnWW5WbVcyOW1abk5sZENBcklHbGRJRDFjYmlBZ0lDQWdJQ0FnS0haaGJIVmxJQ1lnS0RCNFptWWdQRHdnS0RnZ0tpQW9iR2wwZEd4bFJXNWthV0Z1SUQ4Z2FTQTZJREVnTFNCcEtTa3BLU0ErUGo1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ2hzYVhSMGJHVkZibVJwWVc0Z1B5QnBJRG9nTVNBdElHa3BJQ29nT0Z4dUlDQjlYRzU5WEc1Y2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdWQzSnBkR1ZWU1c1ME1UWk1SU0E5SUdaMWJtTjBhVzl1SUNoMllXeDFaU3dnYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQmZkM0pwZEdWVlNXNTBNVFlvZEdocGN5d2dkbUZzZFdVc0lHOW1abk5sZEN3Z2RISjFaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkM0pwZEdWVlNXNTBNVFpDUlNBOUlHWjFibU4wYVc5dUlDaDJZV3gxWlN3Z2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JmZDNKcGRHVlZTVzUwTVRZb2RHaHBjeXdnZG1Gc2RXVXNJRzltWm5ObGRDd2dabUZzYzJVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1bWRXNWpkR2x2YmlCZmQzSnBkR1ZWU1c1ME16SWdLR0oxWml3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDa2dlMXh1SUNCcFppQW9JVzV2UVhOelpYSjBLU0I3WEc0Z0lDQWdZWE56WlhKMEtIWmhiSFZsSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnZG1Gc2RXVWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JSFpoYkhWbEp5bGNiaUFnSUNCaGMzTmxjblFvZEhsd1pXOW1JR3hwZEhSc1pVVnVaR2xoYmlBOVBUMGdKMkp2YjJ4bFlXNG5MQ0FuYldsemMybHVaeUJ2Y2lCcGJuWmhiR2xrSUdWdVpHbGhiaWNwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUc5bVpuTmxkQ0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnYjJabWMyVjBKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNzZ015QThJR0oxWmk1c1pXNW5kR2dzSUNkMGNubHBibWNnZEc4Z2QzSnBkR1VnWW1WNWIyNWtJR0oxWm1abGNpQnNaVzVuZEdnbktWeHVJQ0FnSUhabGNtbG1kV2x1ZENoMllXeDFaU3dnTUhobVptWm1abVptWmlsY2JpQWdmVnh1WEc0Z0lIWmhjaUJzWlc0Z1BTQmlkV1l1YkdWdVozUm9YRzRnSUdsbUlDaHZabVp6WlhRZ1BqMGdiR1Z1S1Z4dUlDQWdJSEpsZEhWeWJseHVYRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQXdMQ0JxSUQwZ1RXRjBhQzV0YVc0b2JHVnVJQzBnYjJabWMyVjBMQ0EwS1RzZ2FTQThJR283SUdrckt5a2dlMXh1SUNBZ0lHSjFabHR2Wm1aelpYUWdLeUJwWFNBOVhHNGdJQ0FnSUNBZ0lDaDJZV3gxWlNBK1BqNGdLR3hwZEhSc1pVVnVaR2xoYmlBL0lHa2dPaUF6SUMwZ2FTa2dLaUE0S1NBbUlEQjRabVpjYmlBZ2ZWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5keWFYUmxWVWx1ZERNeVRFVWdQU0JtZFc1amRHbHZiaUFvZG1Gc2RXVXNJRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ1gzZHlhWFJsVlVsdWRETXlLSFJvYVhNc0lIWmhiSFZsTENCdlptWnpaWFFzSUhSeWRXVXNJRzV2UVhOelpYSjBLVnh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuZHlhWFJsVlVsdWRETXlRa1VnUFNCbWRXNWpkR2x2YmlBb2RtRnNkV1VzSUc5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdYM2R5YVhSbFZVbHVkRE15S0hSb2FYTXNJSFpoYkhWbExDQnZabVp6WlhRc0lHWmhiSE5sTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzUzY21sMFpVbHVkRGdnUFNCbWRXNWpkR2x2YmlBb2RtRnNkV1VzSUc5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdhV1lnS0NGdWIwRnpjMlZ5ZENrZ2UxeHVJQ0FnSUdGemMyVnlkQ2gyWVd4MVpTQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlIWmhiSFZsSUNFOVBTQnVkV3hzTENBbmJXbHpjMmx1WnlCMllXeDFaU2NwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUc5bVpuTmxkQ0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnYjJabWMyVjBKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUR3Z2RHaHBjeTVzWlc1bmRHZ3NJQ2RVY25scGJtY2dkRzhnZDNKcGRHVWdZbVY1YjI1a0lHSjFabVpsY2lCc1pXNW5kR2duS1Z4dUlDQWdJSFpsY21sbWMybHVkQ2gyWVd4MVpTd2dNSGczWml3Z0xUQjRPREFwWEc0Z0lIMWNibHh1SUNCcFppQW9iMlptYzJWMElENDlJSFJvYVhNdWJHVnVaM1JvS1Z4dUlDQWdJSEpsZEhWeWJseHVYRzRnSUdsbUlDaDJZV3gxWlNBK1BTQXdLVnh1SUNBZ0lIUm9hWE11ZDNKcGRHVlZTVzUwT0NoMllXeDFaU3dnYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2xjYmlBZ1pXeHpaVnh1SUNBZ0lIUm9hWE11ZDNKcGRHVlZTVzUwT0Nnd2VHWm1JQ3NnZG1Gc2RXVWdLeUF4TENCdlptWnpaWFFzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVtZFc1amRHbHZiaUJmZDNKcGRHVkpiblF4TmlBb1luVm1MQ0IyWVd4MVpTd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSUc1dlFYTnpaWEowS1NCN1hHNGdJR2xtSUNnaGJtOUJjM05sY25RcElIdGNiaUFnSUNCaGMzTmxjblFvZG1Gc2RXVWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQjJZV3gxWlNBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2RtRnNkV1VuS1Z4dUlDQWdJR0Z6YzJWeWRDaDBlWEJsYjJZZ2JHbDBkR3hsUlc1a2FXRnVJRDA5UFNBblltOXZiR1ZoYmljc0lDZHRhWE56YVc1bklHOXlJR2x1ZG1Gc2FXUWdaVzVrYVdGdUp5bGNiaUFnSUNCaGMzTmxjblFvYjJabWMyVjBJQ0U5UFNCMWJtUmxabWx1WldRZ0ppWWdiMlptYzJWMElDRTlQU0J1ZFd4c0xDQW5iV2x6YzJsdVp5QnZabVp6WlhRbktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdLeUF4SUR3Z1luVm1MbXhsYm1kMGFDd2dKMVJ5ZVdsdVp5QjBieUIzY21sMFpTQmlaWGx2Ym1RZ1luVm1abVZ5SUd4bGJtZDBhQ2NwWEc0Z0lDQWdkbVZ5YVdaemFXNTBLSFpoYkhWbExDQXdlRGRtWm1Zc0lDMHdlRGd3TURBcFhHNGdJSDFjYmx4dUlDQjJZWElnYkdWdUlEMGdZblZtTG14bGJtZDBhRnh1SUNCcFppQW9iMlptYzJWMElENDlJR3hsYmlsY2JpQWdJQ0J5WlhSMWNtNWNibHh1SUNCcFppQW9kbUZzZFdVZ1BqMGdNQ2xjYmlBZ0lDQmZkM0pwZEdWVlNXNTBNVFlvWW5WbUxDQjJZV3gxWlN3Z2IyWm1jMlYwTENCc2FYUjBiR1ZGYm1ScFlXNHNJRzV2UVhOelpYSjBLVnh1SUNCbGJITmxYRzRnSUNBZ1gzZHlhWFJsVlVsdWRERTJLR0oxWml3Z01IaG1abVptSUNzZ2RtRnNkV1VnS3lBeExDQnZabVp6WlhRc0lHeHBkSFJzWlVWdVpHbGhiaXdnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkM0pwZEdWSmJuUXhOa3hGSUQwZ1puVnVZM1JwYjI0Z0tIWmhiSFZsTENCdlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJRjkzY21sMFpVbHVkREUyS0hSb2FYTXNJSFpoYkhWbExDQnZabVp6WlhRc0lIUnlkV1VzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbmR5YVhSbFNXNTBNVFpDUlNBOUlHWjFibU4wYVc5dUlDaDJZV3gxWlN3Z2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JmZDNKcGRHVkpiblF4TmloMGFHbHpMQ0IyWVd4MVpTd2diMlptYzJWMExDQm1ZV3h6WlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYm1aMWJtTjBhVzl1SUY5M2NtbDBaVWx1ZERNeUlDaGlkV1lzSUhaaGJIVmxMQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENoMllXeDFaU0FoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JSFpoYkhWbElDRTlQU0J1ZFd4c0xDQW5iV2x6YzJsdVp5QjJZV3gxWlNjcFhHNGdJQ0FnWVhOelpYSjBLSFI1Y0dWdlppQnNhWFIwYkdWRmJtUnBZVzRnUFQwOUlDZGliMjlzWldGdUp5d2dKMjFwYzNOcGJtY2diM0lnYVc1MllXeHBaQ0JsYm1ScFlXNG5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUJ2Wm1aelpYUWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JRzltWm5ObGRDY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FySURNZ1BDQmlkV1l1YkdWdVozUm9MQ0FuVkhKNWFXNW5JSFJ2SUhkeWFYUmxJR0psZVc5dVpDQmlkV1ptWlhJZ2JHVnVaM1JvSnlsY2JpQWdJQ0IyWlhKcFpuTnBiblFvZG1Gc2RXVXNJREI0TjJabVptWm1abVlzSUMwd2VEZ3dNREF3TURBd0tWeHVJQ0I5WEc1Y2JpQWdkbUZ5SUd4bGJpQTlJR0oxWmk1c1pXNW5kR2hjYmlBZ2FXWWdLRzltWm5ObGRDQStQU0JzWlc0cFhHNGdJQ0FnY21WMGRYSnVYRzVjYmlBZ2FXWWdLSFpoYkhWbElENDlJREFwWEc0Z0lDQWdYM2R5YVhSbFZVbHVkRE15S0dKMVppd2dkbUZzZFdVc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2xjYmlBZ1pXeHpaVnh1SUNBZ0lGOTNjbWwwWlZWSmJuUXpNaWhpZFdZc0lEQjRabVptWm1abVptWWdLeUIyWVd4MVpTQXJJREVzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1M2NtbDBaVWx1ZERNeVRFVWdQU0JtZFc1amRHbHZiaUFvZG1Gc2RXVXNJRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ1gzZHlhWFJsU1c1ME16SW9kR2hwY3l3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnZEhKMVpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdWQzSnBkR1ZKYm5Rek1rSkZJRDBnWm5WdVkzUnBiMjRnS0haaGJIVmxMQ0J2Wm1aelpYUXNJRzV2UVhOelpYSjBLU0I3WEc0Z0lGOTNjbWwwWlVsdWRETXlLSFJvYVhNc0lIWmhiSFZsTENCdlptWnpaWFFzSUdaaGJITmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVablZ1WTNScGIyNGdYM2R5YVhSbFJteHZZWFFnS0dKMVppd2dkbUZzZFdVc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLSFpoYkhWbElDRTlQU0IxYm1SbFptbHVaV1FnSmlZZ2RtRnNkV1VnSVQwOUlHNTFiR3dzSUNkdGFYTnphVzVuSUhaaGJIVmxKeWxjYmlBZ0lDQmhjM05sY25Rb2RIbHdaVzltSUd4cGRIUnNaVVZ1WkdsaGJpQTlQVDBnSjJKdmIyeGxZVzRuTENBbmJXbHpjMmx1WnlCdmNpQnBiblpoYkdsa0lHVnVaR2xoYmljcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlHOW1abk5sZENBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2IyWm1jMlYwSnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDc2dNeUE4SUdKMVppNXNaVzVuZEdnc0lDZFVjbmxwYm1jZ2RHOGdkM0pwZEdVZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNBZ0lIWmxjbWxtU1VWRlJUYzFOQ2gyWVd4MVpTd2dNeTQwTURJNE1qTTBOall6T0RVeU9EZzJaU3N6T0N3Z0xUTXVOREF5T0RJek5EWTJNemcxTWpnNE5tVXJNemdwWEc0Z0lIMWNibHh1SUNCMllYSWdiR1Z1SUQwZ1luVm1MbXhsYm1kMGFGeHVJQ0JwWmlBb2IyWm1jMlYwSUQ0OUlHeGxiaWxjYmlBZ0lDQnlaWFIxY201Y2JseHVJQ0JwWldWbE56VTBMbmR5YVhSbEtHSjFaaXdnZG1Gc2RXVXNJRzltWm5ObGRDd2diR2wwZEd4bFJXNWthV0Z1TENBeU15d2dOQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNTNjbWwwWlVac2IyRjBURVVnUFNCbWRXNWpkR2x2YmlBb2RtRnNkV1VzSUc5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdYM2R5YVhSbFJteHZZWFFvZEdocGN5d2dkbUZzZFdVc0lHOW1abk5sZEN3Z2RISjFaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkM0pwZEdWR2JHOWhkRUpGSUQwZ1puVnVZM1JwYjI0Z0tIWmhiSFZsTENCdlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJRjkzY21sMFpVWnNiMkYwS0hSb2FYTXNJSFpoYkhWbExDQnZabVp6WlhRc0lHWmhiSE5sTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWDNkeWFYUmxSRzkxWW14bElDaGlkV1lzSUhaaGJIVmxMQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENoMllXeDFaU0FoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JSFpoYkhWbElDRTlQU0J1ZFd4c0xDQW5iV2x6YzJsdVp5QjJZV3gxWlNjcFhHNGdJQ0FnWVhOelpYSjBLSFI1Y0dWdlppQnNhWFIwYkdWRmJtUnBZVzRnUFQwOUlDZGliMjlzWldGdUp5d2dKMjFwYzNOcGJtY2diM0lnYVc1MllXeHBaQ0JsYm1ScFlXNG5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUJ2Wm1aelpYUWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JRzltWm5ObGRDY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FySURjZ1BDQmlkV1l1YkdWdVozUm9MRnh1SUNBZ0lDQWdJQ0FuVkhKNWFXNW5JSFJ2SUhkeWFYUmxJR0psZVc5dVpDQmlkV1ptWlhJZ2JHVnVaM1JvSnlsY2JpQWdJQ0IyWlhKcFprbEZSVVUzTlRRb2RtRnNkV1VzSURFdU56azNOamt6TVRNME9EWXlNekUxTjBVck16QTRMQ0F0TVM0M09UYzJPVE14TXpRNE5qSXpNVFUzUlNzek1EZ3BYRzRnSUgxY2JseHVJQ0IyWVhJZ2JHVnVJRDBnWW5WbUxteGxibWQwYUZ4dUlDQnBaaUFvYjJabWMyVjBJRDQ5SUd4bGJpbGNiaUFnSUNCeVpYUjFjbTVjYmx4dUlDQnBaV1ZsTnpVMExuZHlhWFJsS0dKMVppd2dkbUZzZFdVc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0ExTWl3Z09DbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1M2NtbDBaVVJ2ZFdKc1pVeEZJRDBnWm5WdVkzUnBiMjRnS0haaGJIVmxMQ0J2Wm1aelpYUXNJRzV2UVhOelpYSjBLU0I3WEc0Z0lGOTNjbWwwWlVSdmRXSnNaU2gwYUdsekxDQjJZV3gxWlN3Z2IyWm1jMlYwTENCMGNuVmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNTNjbWwwWlVSdmRXSnNaVUpGSUQwZ1puVnVZM1JwYjI0Z0tIWmhiSFZsTENCdlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJRjkzY21sMFpVUnZkV0pzWlNoMGFHbHpMQ0IyWVd4MVpTd2diMlptYzJWMExDQm1ZV3h6WlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYmk4dklHWnBiR3dvZG1Gc2RXVXNJSE4wWVhKMFBUQXNJR1Z1WkQxaWRXWm1aWEl1YkdWdVozUm9LVnh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzVtYVd4c0lEMGdablZ1WTNScGIyNGdLSFpoYkhWbExDQnpkR0Z5ZEN3Z1pXNWtLU0I3WEc0Z0lHbG1JQ2doZG1Gc2RXVXBJSFpoYkhWbElEMGdNRnh1SUNCcFppQW9JWE4wWVhKMEtTQnpkR0Z5ZENBOUlEQmNiaUFnYVdZZ0tDRmxibVFwSUdWdVpDQTlJSFJvYVhNdWJHVnVaM1JvWEc1Y2JpQWdhV1lnS0hSNWNHVnZaaUIyWVd4MVpTQTlQVDBnSjNOMGNtbHVaeWNwSUh0Y2JpQWdJQ0IyWVd4MVpTQTlJSFpoYkhWbExtTm9ZWEpEYjJSbFFYUW9NQ2xjYmlBZ2ZWeHVYRzRnSUdGemMyVnlkQ2gwZVhCbGIyWWdkbUZzZFdVZ1BUMDlJQ2R1ZFcxaVpYSW5JQ1ltSUNGcGMwNWhUaWgyWVd4MVpTa3NJQ2QyWVd4MVpTQnBjeUJ1YjNRZ1lTQnVkVzFpWlhJbktWeHVJQ0JoYzNObGNuUW9aVzVrSUQ0OUlITjBZWEowTENBblpXNWtJRHdnYzNSaGNuUW5LVnh1WEc0Z0lDOHZJRVpwYkd3Z01DQmllWFJsY3pzZ2QyVW5jbVVnWkc5dVpWeHVJQ0JwWmlBb1pXNWtJRDA5UFNCemRHRnlkQ2tnY21WMGRYSnVYRzRnSUdsbUlDaDBhR2x6TG14bGJtZDBhQ0E5UFQwZ01Da2djbVYwZFhKdVhHNWNiaUFnWVhOelpYSjBLSE4wWVhKMElENDlJREFnSmlZZ2MzUmhjblFnUENCMGFHbHpMbXhsYm1kMGFDd2dKM04wWVhKMElHOTFkQ0J2WmlCaWIzVnVaSE1uS1Z4dUlDQmhjM05sY25Rb1pXNWtJRDQ5SURBZ0ppWWdaVzVrSUR3OUlIUm9hWE11YkdWdVozUm9MQ0FuWlc1a0lHOTFkQ0J2WmlCaWIzVnVaSE1uS1Z4dVhHNGdJR1p2Y2lBb2RtRnlJR2tnUFNCemRHRnlkRHNnYVNBOElHVnVaRHNnYVNzcktTQjdYRzRnSUNBZ2RHaHBjMXRwWFNBOUlIWmhiSFZsWEc0Z0lIMWNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1cGJuTndaV04wSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNCMllYSWdiM1YwSUQwZ1cxMWNiaUFnZG1GeUlHeGxiaUE5SUhSb2FYTXViR1Z1WjNSb1hHNGdJR1p2Y2lBb2RtRnlJR2tnUFNBd095QnBJRHdnYkdWdU95QnBLeXNwSUh0Y2JpQWdJQ0J2ZFhSYmFWMGdQU0IwYjBobGVDaDBhR2x6VzJsZEtWeHVJQ0FnSUdsbUlDaHBJRDA5UFNCbGVIQnZjblJ6TGtsT1UxQkZRMVJmVFVGWVgwSlpWRVZUS1NCN1hHNGdJQ0FnSUNCdmRYUmJhU0FySURGZElEMGdKeTR1TGlkY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ2ZWeHVJQ0I5WEc0Z0lISmxkSFZ5YmlBblBFSjFabVpsY2lBbklDc2diM1YwTG1wdmFXNG9KeUFuS1NBcklDYytKMXh1ZlZ4dVhHNHZLaXBjYmlBcUlFTnlaV0YwWlhNZ1lTQnVaWGNnWUVGeWNtRjVRblZtWm1WeVlDQjNhWFJvSUhSb1pTQXFZMjl3YVdWa0tpQnRaVzF2Y25rZ2IyWWdkR2hsSUdKMVptWmxjaUJwYm5OMFlXNWpaUzVjYmlBcUlFRmtaR1ZrSUdsdUlFNXZaR1VnTUM0eE1pNGdUMjVzZVNCaGRtRnBiR0ZpYkdVZ2FXNGdZbkp2ZDNObGNuTWdkR2hoZENCemRYQndiM0owSUVGeWNtRjVRblZtWm1WeUxseHVJQ292WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5SdlFYSnlZWGxDZFdabVpYSWdQU0JtZFc1amRHbHZiaUFvS1NCN1hHNGdJR2xtSUNoMGVYQmxiMllnVldsdWREaEJjbkpoZVNBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NwSUh0Y2JpQWdJQ0JwWmlBb1FuVm1abVZ5TGw5MWMyVlVlWEJsWkVGeWNtRjVjeWtnZTF4dUlDQWdJQ0FnY21WMGRYSnVJQ2h1WlhjZ1FuVm1abVZ5S0hSb2FYTXBLUzVpZFdabVpYSmNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnZG1GeUlHSjFaaUE5SUc1bGR5QlZhVzUwT0VGeWNtRjVLSFJvYVhNdWJHVnVaM1JvS1Z4dUlDQWdJQ0FnWm05eUlDaDJZWElnYVNBOUlEQXNJR3hsYmlBOUlHSjFaaTVzWlc1bmRHZzdJR2tnUENCc1pXNDdJR2tnS3owZ01TbGNiaUFnSUNBZ0lDQWdZblZtVzJsZElEMGdkR2hwYzF0cFhWeHVJQ0FnSUNBZ2NtVjBkWEp1SUdKMVppNWlkV1ptWlhKY2JpQWdJQ0I5WEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RDZFdabVpYSXVkRzlCY25KaGVVSjFabVpsY2lCdWIzUWdjM1Z3Y0c5eWRHVmtJR2x1SUhSb2FYTWdZbkp2ZDNObGNpY3BYRzRnSUgxY2JuMWNibHh1THk4Z1NFVk1VRVZTSUVaVlRrTlVTVTlPVTF4dUx5OGdQVDA5UFQwOVBUMDlQVDA5UFQwOVBWeHVYRzVtZFc1amRHbHZiaUJ6ZEhKcGJtZDBjbWx0SUNoemRISXBJSHRjYmlBZ2FXWWdLSE4wY2k1MGNtbHRLU0J5WlhSMWNtNGdjM1J5TG5SeWFXMG9LVnh1SUNCeVpYUjFjbTRnYzNSeUxuSmxjR3hoWTJVb0wxNWNYSE1yZkZ4Y2N5c2tMMmNzSUNjbktWeHVmVnh1WEc1MllYSWdRbEFnUFNCQ2RXWm1aWEl1Y0hKdmRHOTBlWEJsWEc1Y2JpOHFLbHh1SUNvZ1FYVm5iV1Z1ZENCaElGVnBiblE0UVhKeVlYa2dLbWx1YzNSaGJtTmxLaUFvYm05MElIUm9aU0JWYVc1ME9FRnljbUY1SUdOc1lYTnpJU2tnZDJsMGFDQkNkV1ptWlhJZ2JXVjBhRzlrYzF4dUlDb3ZYRzVDZFdabVpYSXVYMkYxWjIxbGJuUWdQU0JtZFc1amRHbHZiaUFvWVhKeUtTQjdYRzRnSUdGeWNpNWZhWE5DZFdabVpYSWdQU0IwY25WbFhHNWNiaUFnTHk4Z2MyRjJaU0J5WldabGNtVnVZMlVnZEc4Z2IzSnBaMmx1WVd3Z1ZXbHVkRGhCY25KaGVTQm5aWFF2YzJWMElHMWxkR2h2WkhNZ1ltVm1iM0psSUc5MlpYSjNjbWwwYVc1blhHNGdJR0Z5Y2k1ZloyVjBJRDBnWVhKeUxtZGxkRnh1SUNCaGNuSXVYM05sZENBOUlHRnljaTV6WlhSY2JseHVJQ0F2THlCa1pYQnlaV05oZEdWa0xDQjNhV3hzSUdKbElISmxiVzkyWldRZ2FXNGdibTlrWlNBd0xqRXpLMXh1SUNCaGNuSXVaMlYwSUQwZ1FsQXVaMlYwWEc0Z0lHRnljaTV6WlhRZ1BTQkNVQzV6WlhSY2JseHVJQ0JoY25JdWQzSnBkR1VnUFNCQ1VDNTNjbWwwWlZ4dUlDQmhjbkl1ZEc5VGRISnBibWNnUFNCQ1VDNTBiMU4wY21sdVoxeHVJQ0JoY25JdWRHOU1iMk5oYkdWVGRISnBibWNnUFNCQ1VDNTBiMU4wY21sdVoxeHVJQ0JoY25JdWRHOUtVMDlPSUQwZ1FsQXVkRzlLVTA5T1hHNGdJR0Z5Y2k1amIzQjVJRDBnUWxBdVkyOXdlVnh1SUNCaGNuSXVjMnhwWTJVZ1BTQkNVQzV6YkdsalpWeHVJQ0JoY25JdWNtVmhaRlZKYm5RNElEMGdRbEF1Y21WaFpGVkpiblE0WEc0Z0lHRnljaTV5WldGa1ZVbHVkREUyVEVVZ1BTQkNVQzV5WldGa1ZVbHVkREUyVEVWY2JpQWdZWEp5TG5KbFlXUlZTVzUwTVRaQ1JTQTlJRUpRTG5KbFlXUlZTVzUwTVRaQ1JWeHVJQ0JoY25JdWNtVmhaRlZKYm5Rek1reEZJRDBnUWxBdWNtVmhaRlZKYm5Rek1reEZYRzRnSUdGeWNpNXlaV0ZrVlVsdWRETXlRa1VnUFNCQ1VDNXlaV0ZrVlVsdWRETXlRa1ZjYmlBZ1lYSnlMbkpsWVdSSmJuUTRJRDBnUWxBdWNtVmhaRWx1ZERoY2JpQWdZWEp5TG5KbFlXUkpiblF4Tmt4RklEMGdRbEF1Y21WaFpFbHVkREUyVEVWY2JpQWdZWEp5TG5KbFlXUkpiblF4TmtKRklEMGdRbEF1Y21WaFpFbHVkREUyUWtWY2JpQWdZWEp5TG5KbFlXUkpiblF6TWt4RklEMGdRbEF1Y21WaFpFbHVkRE15VEVWY2JpQWdZWEp5TG5KbFlXUkpiblF6TWtKRklEMGdRbEF1Y21WaFpFbHVkRE15UWtWY2JpQWdZWEp5TG5KbFlXUkdiRzloZEV4RklEMGdRbEF1Y21WaFpFWnNiMkYwVEVWY2JpQWdZWEp5TG5KbFlXUkdiRzloZEVKRklEMGdRbEF1Y21WaFpFWnNiMkYwUWtWY2JpQWdZWEp5TG5KbFlXUkViM1ZpYkdWTVJTQTlJRUpRTG5KbFlXUkViM1ZpYkdWTVJWeHVJQ0JoY25JdWNtVmhaRVJ2ZFdKc1pVSkZJRDBnUWxBdWNtVmhaRVJ2ZFdKc1pVSkZYRzRnSUdGeWNpNTNjbWwwWlZWSmJuUTRJRDBnUWxBdWQzSnBkR1ZWU1c1ME9GeHVJQ0JoY25JdWQzSnBkR1ZWU1c1ME1UWk1SU0E5SUVKUUxuZHlhWFJsVlVsdWRERTJURVZjYmlBZ1lYSnlMbmR5YVhSbFZVbHVkREUyUWtVZ1BTQkNVQzUzY21sMFpWVkpiblF4TmtKRlhHNGdJR0Z5Y2k1M2NtbDBaVlZKYm5Rek1reEZJRDBnUWxBdWQzSnBkR1ZWU1c1ME16Sk1SVnh1SUNCaGNuSXVkM0pwZEdWVlNXNTBNekpDUlNBOUlFSlFMbmR5YVhSbFZVbHVkRE15UWtWY2JpQWdZWEp5TG5keWFYUmxTVzUwT0NBOUlFSlFMbmR5YVhSbFNXNTBPRnh1SUNCaGNuSXVkM0pwZEdWSmJuUXhOa3hGSUQwZ1FsQXVkM0pwZEdWSmJuUXhOa3hGWEc0Z0lHRnljaTUzY21sMFpVbHVkREUyUWtVZ1BTQkNVQzUzY21sMFpVbHVkREUyUWtWY2JpQWdZWEp5TG5keWFYUmxTVzUwTXpKTVJTQTlJRUpRTG5keWFYUmxTVzUwTXpKTVJWeHVJQ0JoY25JdWQzSnBkR1ZKYm5Rek1rSkZJRDBnUWxBdWQzSnBkR1ZKYm5Rek1rSkZYRzRnSUdGeWNpNTNjbWwwWlVac2IyRjBURVVnUFNCQ1VDNTNjbWwwWlVac2IyRjBURVZjYmlBZ1lYSnlMbmR5YVhSbFJteHZZWFJDUlNBOUlFSlFMbmR5YVhSbFJteHZZWFJDUlZ4dUlDQmhjbkl1ZDNKcGRHVkViM1ZpYkdWTVJTQTlJRUpRTG5keWFYUmxSRzkxWW14bFRFVmNiaUFnWVhKeUxuZHlhWFJsUkc5MVlteGxRa1VnUFNCQ1VDNTNjbWwwWlVSdmRXSnNaVUpGWEc0Z0lHRnljaTVtYVd4c0lEMGdRbEF1Wm1sc2JGeHVJQ0JoY25JdWFXNXpjR1ZqZENBOUlFSlFMbWx1YzNCbFkzUmNiaUFnWVhKeUxuUnZRWEp5WVhsQ2RXWm1aWElnUFNCQ1VDNTBiMEZ5Y21GNVFuVm1abVZ5WEc1Y2JpQWdjbVYwZFhKdUlHRnljbHh1ZlZ4dVhHNHZMeUJ6YkdsalpTaHpkR0Z5ZEN3Z1pXNWtLVnh1Wm5WdVkzUnBiMjRnWTJ4aGJYQWdLR2x1WkdWNExDQnNaVzRzSUdSbFptRjFiSFJXWVd4MVpTa2dlMXh1SUNCcFppQW9kSGx3Wlc5bUlHbHVaR1Y0SUNFOVBTQW5iblZ0WW1WeUp5a2djbVYwZFhKdUlHUmxabUYxYkhSV1lXeDFaVnh1SUNCcGJtUmxlQ0E5SUg1K2FXNWtaWGc3SUNBdkx5QkRiMlZ5WTJVZ2RHOGdhVzUwWldkbGNpNWNiaUFnYVdZZ0tHbHVaR1Y0SUQ0OUlHeGxiaWtnY21WMGRYSnVJR3hsYmx4dUlDQnBaaUFvYVc1a1pYZ2dQajBnTUNrZ2NtVjBkWEp1SUdsdVpHVjRYRzRnSUdsdVpHVjRJQ3M5SUd4bGJseHVJQ0JwWmlBb2FXNWtaWGdnUGowZ01Da2djbVYwZFhKdUlHbHVaR1Y0WEc0Z0lISmxkSFZ5YmlBd1hHNTlYRzVjYm1aMWJtTjBhVzl1SUdOdlpYSmpaU0FvYkdWdVozUm9LU0I3WEc0Z0lDOHZJRU52WlhKalpTQnNaVzVuZEdnZ2RHOGdZU0J1ZFcxaVpYSWdLSEJ2YzNOcFlteDVJRTVoVGlrc0lISnZkVzVrSUhWd1hHNGdJQzh2SUdsdUlHTmhjMlVnYVhRbmN5Qm1jbUZqZEdsdmJtRnNJQ2hsTG1jdUlERXlNeTQwTlRZcElIUm9aVzRnWkc4Z1lWeHVJQ0F2THlCa2IzVmliR1VnYm1WbllYUmxJSFJ2SUdOdlpYSmpaU0JoSUU1aFRpQjBieUF3TGlCRllYTjVMQ0J5YVdkb2REOWNiaUFnYkdWdVozUm9JRDBnZm41TllYUm9MbU5sYVd3b0syeGxibWQwYUNsY2JpQWdjbVYwZFhKdUlHeGxibWQwYUNBOElEQWdQeUF3SURvZ2JHVnVaM1JvWEc1OVhHNWNibVoxYm1OMGFXOXVJR2x6UVhKeVlYa2dLSE4xWW1wbFkzUXBJSHRjYmlBZ2NtVjBkWEp1SUNoQmNuSmhlUzVwYzBGeWNtRjVJSHg4SUdaMWJtTjBhVzl1SUNoemRXSnFaV04wS1NCN1hHNGdJQ0FnY21WMGRYSnVJRTlpYW1WamRDNXdjbTkwYjNSNWNHVXVkRzlUZEhKcGJtY3VZMkZzYkNoemRXSnFaV04wS1NBOVBUMGdKMXR2WW1wbFkzUWdRWEp5WVhsZEoxeHVJQ0I5S1NoemRXSnFaV04wS1Z4dWZWeHVYRzVtZFc1amRHbHZiaUJwYzBGeWNtRjVhWE5vSUNoemRXSnFaV04wS1NCN1hHNGdJSEpsZEhWeWJpQnBjMEZ5Y21GNUtITjFZbXBsWTNRcElIeDhJRUoxWm1abGNpNXBjMEoxWm1abGNpaHpkV0pxWldOMEtTQjhmRnh1SUNBZ0lDQWdjM1ZpYW1WamRDQW1KaUIwZVhCbGIyWWdjM1ZpYW1WamRDQTlQVDBnSjI5aWFtVmpkQ2NnSmlaY2JpQWdJQ0FnSUhSNWNHVnZaaUJ6ZFdKcVpXTjBMbXhsYm1kMGFDQTlQVDBnSjI1MWJXSmxjaWRjYm4xY2JseHVablZ1WTNScGIyNGdkRzlJWlhnZ0tHNHBJSHRjYmlBZ2FXWWdLRzRnUENBeE5pa2djbVYwZFhKdUlDY3dKeUFySUc0dWRHOVRkSEpwYm1jb01UWXBYRzRnSUhKbGRIVnliaUJ1TG5SdlUzUnlhVzVuS0RFMktWeHVmVnh1WEc1bWRXNWpkR2x2YmlCMWRHWTRWRzlDZVhSbGN5QW9jM1J5S1NCN1hHNGdJSFpoY2lCaWVYUmxRWEp5WVhrZ1BTQmJYVnh1SUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElITjBjaTVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUhaaGNpQmlJRDBnYzNSeUxtTm9ZWEpEYjJSbFFYUW9hU2xjYmlBZ0lDQnBaaUFvWWlBOFBTQXdlRGRHS1Z4dUlDQWdJQ0FnWW5sMFpVRnljbUY1TG5CMWMyZ29jM1J5TG1Ob1lYSkRiMlJsUVhRb2FTa3BYRzRnSUNBZ1pXeHpaU0I3WEc0Z0lDQWdJQ0IyWVhJZ2MzUmhjblFnUFNCcFhHNGdJQ0FnSUNCcFppQW9ZaUErUFNBd2VFUTRNREFnSmlZZ1lpQThQU0F3ZUVSR1JrWXBJR2tySzF4dUlDQWdJQ0FnZG1GeUlHZ2dQU0JsYm1OdlpHVlZVa2xEYjIxd2IyNWxiblFvYzNSeUxuTnNhV05sS0hOMFlYSjBMQ0JwS3pFcEtTNXpkV0p6ZEhJb01Ta3VjM0JzYVhRb0p5VW5LVnh1SUNBZ0lDQWdabTl5SUNoMllYSWdhaUE5SURBN0lHb2dQQ0JvTG14bGJtZDBhRHNnYWlzcktWeHVJQ0FnSUNBZ0lDQmllWFJsUVhKeVlYa3VjSFZ6YUNod1lYSnpaVWx1ZENob1cycGRMQ0F4TmlrcFhHNGdJQ0FnZlZ4dUlDQjlYRzRnSUhKbGRIVnliaUJpZVhSbFFYSnlZWGxjYm4xY2JseHVablZ1WTNScGIyNGdZWE5qYVdsVWIwSjVkR1Z6SUNoemRISXBJSHRjYmlBZ2RtRnlJR0o1ZEdWQmNuSmhlU0E5SUZ0ZFhHNGdJR1p2Y2lBb2RtRnlJR2tnUFNBd095QnBJRHdnYzNSeUxteGxibWQwYURzZ2FTc3JLU0I3WEc0Z0lDQWdMeThnVG05a1pTZHpJR052WkdVZ2MyVmxiWE1nZEc4Z1ltVWdaRzlwYm1jZ2RHaHBjeUJoYm1RZ2JtOTBJQ1lnTUhnM1JpNHVYRzRnSUNBZ1lubDBaVUZ5Y21GNUxuQjFjMmdvYzNSeUxtTm9ZWEpEYjJSbFFYUW9hU2tnSmlBd2VFWkdLVnh1SUNCOVhHNGdJSEpsZEhWeWJpQmllWFJsUVhKeVlYbGNibjFjYmx4dVpuVnVZM1JwYjI0Z2RYUm1NVFpzWlZSdlFubDBaWE1nS0hOMGNpa2dlMXh1SUNCMllYSWdZeXdnYUdrc0lHeHZYRzRnSUhaaGNpQmllWFJsUVhKeVlYa2dQU0JiWFZ4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJSE4wY2k1c1pXNW5kR2c3SUdrckt5a2dlMXh1SUNBZ0lHTWdQU0J6ZEhJdVkyaGhja052WkdWQmRDaHBLVnh1SUNBZ0lHaHBJRDBnWXlBK1BpQTRYRzRnSUNBZ2JHOGdQU0JqSUNVZ01qVTJYRzRnSUNBZ1lubDBaVUZ5Y21GNUxuQjFjMmdvYkc4cFhHNGdJQ0FnWW5sMFpVRnljbUY1TG5CMWMyZ29hR2twWEc0Z0lIMWNibHh1SUNCeVpYUjFjbTRnWW5sMFpVRnljbUY1WEc1OVhHNWNibVoxYm1OMGFXOXVJR0poYzJVMk5GUnZRbmwwWlhNZ0tITjBjaWtnZTF4dUlDQnlaWFIxY200Z1ltRnpaVFkwTG5SdlFubDBaVUZ5Y21GNUtITjBjaWxjYm4xY2JseHVablZ1WTNScGIyNGdZbXhwZEVKMVptWmxjaUFvYzNKakxDQmtjM1FzSUc5bVpuTmxkQ3dnYkdWdVozUm9LU0I3WEc0Z0lIWmhjaUJ3YjNOY2JpQWdabTl5SUNoMllYSWdhU0E5SURBN0lHa2dQQ0JzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUdsbUlDZ29hU0FySUc5bVpuTmxkQ0ErUFNCa2MzUXViR1Z1WjNSb0tTQjhmQ0FvYVNBK1BTQnpjbU11YkdWdVozUm9LU2xjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWkhOMFcya2dLeUJ2Wm1aelpYUmRJRDBnYzNKalcybGRYRzRnSUgxY2JpQWdjbVYwZFhKdUlHbGNibjFjYmx4dVpuVnVZM1JwYjI0Z1pHVmpiMlJsVlhSbU9FTm9ZWElnS0hOMGNpa2dlMXh1SUNCMGNua2dlMXh1SUNBZ0lISmxkSFZ5YmlCa1pXTnZaR1ZWVWtsRGIyMXdiMjVsYm5Rb2MzUnlLVnh1SUNCOUlHTmhkR05vSUNobGNuSXBJSHRjYmlBZ0lDQnlaWFIxY200Z1UzUnlhVzVuTG1aeWIyMURhR0Z5UTI5a1pTZ3dlRVpHUmtRcElDOHZJRlZVUmlBNElHbHVkbUZzYVdRZ1kyaGhjbHh1SUNCOVhHNTlYRzVjYmk4cVhHNGdLaUJYWlNCb1lYWmxJSFJ2SUcxaGEyVWdjM1Z5WlNCMGFHRjBJSFJvWlNCMllXeDFaU0JwY3lCaElIWmhiR2xrSUdsdWRHVm5aWEl1SUZSb2FYTWdiV1ZoYm5NZ2RHaGhkQ0JwZEZ4dUlDb2dhWE1nYm05dUxXNWxaMkYwYVhabExpQkpkQ0JvWVhNZ2JtOGdabkpoWTNScGIyNWhiQ0JqYjIxd2IyNWxiblFnWVc1a0lIUm9ZWFFnYVhRZ1pHOWxjeUJ1YjNSY2JpQXFJR1Y0WTJWbFpDQjBhR1VnYldGNGFXMTFiU0JoYkd4dmQyVmtJSFpoYkhWbExseHVJQ292WEc1bWRXNWpkR2x2YmlCMlpYSnBablZwYm5RZ0tIWmhiSFZsTENCdFlYZ3BJSHRjYmlBZ1lYTnpaWEowS0hSNWNHVnZaaUIyWVd4MVpTQTlQVDBnSjI1MWJXSmxjaWNzSUNkallXNXViM1FnZDNKcGRHVWdZU0J1YjI0dGJuVnRZbVZ5SUdGeklHRWdiblZ0WW1WeUp5bGNiaUFnWVhOelpYSjBLSFpoYkhWbElENDlJREFzSUNkemNHVmphV1pwWldRZ1lTQnVaV2RoZEdsMlpTQjJZV3gxWlNCbWIzSWdkM0pwZEdsdVp5QmhiaUIxYm5OcFoyNWxaQ0IyWVd4MVpTY3BYRzRnSUdGemMyVnlkQ2gyWVd4MVpTQThQU0J0WVhnc0lDZDJZV3gxWlNCcGN5QnNZWEpuWlhJZ2RHaGhiaUJ0WVhocGJYVnRJSFpoYkhWbElHWnZjaUIwZVhCbEp5bGNiaUFnWVhOelpYSjBLRTFoZEdndVpteHZiM0lvZG1Gc2RXVXBJRDA5UFNCMllXeDFaU3dnSjNaaGJIVmxJR2hoY3lCaElHWnlZV04wYVc5dVlXd2dZMjl0Y0c5dVpXNTBKeWxjYm4xY2JseHVablZ1WTNScGIyNGdkbVZ5YVdaemFXNTBJQ2gyWVd4MVpTd2diV0Y0TENCdGFXNHBJSHRjYmlBZ1lYTnpaWEowS0hSNWNHVnZaaUIyWVd4MVpTQTlQVDBnSjI1MWJXSmxjaWNzSUNkallXNXViM1FnZDNKcGRHVWdZU0J1YjI0dGJuVnRZbVZ5SUdGeklHRWdiblZ0WW1WeUp5bGNiaUFnWVhOelpYSjBLSFpoYkhWbElEdzlJRzFoZUN3Z0ozWmhiSFZsSUd4aGNtZGxjaUIwYUdGdUlHMWhlR2x0ZFcwZ1lXeHNiM2RsWkNCMllXeDFaU2NwWEc0Z0lHRnpjMlZ5ZENoMllXeDFaU0ErUFNCdGFXNHNJQ2QyWVd4MVpTQnpiV0ZzYkdWeUlIUm9ZVzRnYldsdWFXMTFiU0JoYkd4dmQyVmtJSFpoYkhWbEp5bGNiaUFnWVhOelpYSjBLRTFoZEdndVpteHZiM0lvZG1Gc2RXVXBJRDA5UFNCMllXeDFaU3dnSjNaaGJIVmxJR2hoY3lCaElHWnlZV04wYVc5dVlXd2dZMjl0Y0c5dVpXNTBKeWxjYm4xY2JseHVablZ1WTNScGIyNGdkbVZ5YVdaSlJVVkZOelUwSUNoMllXeDFaU3dnYldGNExDQnRhVzRwSUh0Y2JpQWdZWE56WlhKMEtIUjVjR1Z2WmlCMllXeDFaU0E5UFQwZ0oyNTFiV0psY2ljc0lDZGpZVzV1YjNRZ2QzSnBkR1VnWVNCdWIyNHRiblZ0WW1WeUlHRnpJR0VnYm5WdFltVnlKeWxjYmlBZ1lYTnpaWEowS0haaGJIVmxJRHc5SUcxaGVDd2dKM1poYkhWbElHeGhjbWRsY2lCMGFHRnVJRzFoZUdsdGRXMGdZV3hzYjNkbFpDQjJZV3gxWlNjcFhHNGdJR0Z6YzJWeWRDaDJZV3gxWlNBK1BTQnRhVzRzSUNkMllXeDFaU0J6YldGc2JHVnlJSFJvWVc0Z2JXbHVhVzExYlNCaGJHeHZkMlZrSUhaaGJIVmxKeWxjYm4xY2JseHVablZ1WTNScGIyNGdZWE56WlhKMElDaDBaWE4wTENCdFpYTnpZV2RsS1NCN1hHNGdJR2xtSUNnaGRHVnpkQ2tnZEdoeWIzY2dibVYzSUVWeWNtOXlLRzFsYzNOaFoyVWdmSHdnSjBaaGFXeGxaQ0JoYzNObGNuUnBiMjRuS1Z4dWZWeHVYRzU5S1M1allXeHNLSFJvYVhNc2NtVnhkV2x5WlNoY0ltVXZWU3M1TjF3aUtTeDBlWEJsYjJZZ2MyVnNaaUFoUFQwZ1hDSjFibVJsWm1sdVpXUmNJaUEvSUhObGJHWWdPaUIwZVhCbGIyWWdkMmx1Wkc5M0lDRTlQU0JjSW5WdVpHVm1hVzVsWkZ3aUlEOGdkMmx1Wkc5M0lEb2dlMzBzY21WeGRXbHlaU2hjSW1KMVptWmxjbHdpS1M1Q2RXWm1aWElzWVhKbmRXMWxiblJ6V3pOZExHRnlaM1Z0Wlc1MGMxczBYU3hoY21kMWJXVnVkSE5iTlYwc1lYSm5kVzFsYm5Seld6WmRMRndpTHk0dVhGeGNYQzR1WEZ4Y1hHNXZaR1ZmYlc5a2RXeGxjMXhjWEZ4aWRXWm1aWEpjWEZ4Y2FXNWtaWGd1YW5OY0lpeGNJaTh1TGx4Y1hGd3VMbHhjWEZ4dWIyUmxYMjF2WkhWc1pYTmNYRnhjWW5WbVptVnlYQ0lwSWl3aUtHWjFibU4wYVc5dUlDaHdjbTlqWlhOekxHZHNiMkpoYkN4Q2RXWm1aWElzWDE5aGNtZDFiV1Z1ZERBc1gxOWhjbWQxYldWdWRERXNYMTloY21kMWJXVnVkRElzWDE5aGNtZDFiV1Z1ZERNc1gxOW1hV3hsYm1GdFpTeGZYMlJwY201aGJXVXBlMXh1Wlhod2IzSjBjeTV5WldGa0lEMGdablZ1WTNScGIyNGdLR0oxWm1abGNpd2diMlptYzJWMExDQnBjMHhGTENCdFRHVnVMQ0J1UW5sMFpYTXBJSHRjYmlBZ2RtRnlJR1VzSUcxY2JpQWdkbUZ5SUdWTVpXNGdQU0J1UW5sMFpYTWdLaUE0SUMwZ2JVeGxiaUF0SURGY2JpQWdkbUZ5SUdWTllYZ2dQU0FvTVNBOFBDQmxUR1Z1S1NBdElERmNiaUFnZG1GeUlHVkNhV0Z6SUQwZ1pVMWhlQ0ErUGlBeFhHNGdJSFpoY2lCdVFtbDBjeUE5SUMwM1hHNGdJSFpoY2lCcElEMGdhWE5NUlNBL0lDaHVRbmwwWlhNZ0xTQXhLU0E2SURCY2JpQWdkbUZ5SUdRZ1BTQnBjMHhGSUQ4Z0xURWdPaUF4WEc0Z0lIWmhjaUJ6SUQwZ1luVm1abVZ5VzI5bVpuTmxkQ0FySUdsZFhHNWNiaUFnYVNBclBTQmtYRzVjYmlBZ1pTQTlJSE1nSmlBb0tERWdQRHdnS0MxdVFtbDBjeWtwSUMwZ01TbGNiaUFnY3lBK1BqMGdLQzF1UW1sMGN5bGNiaUFnYmtKcGRITWdLejBnWlV4bGJseHVJQ0JtYjNJZ0tEc2dia0pwZEhNZ1BpQXdPeUJsSUQwZ1pTQXFJREkxTmlBcklHSjFabVpsY2x0dlptWnpaWFFnS3lCcFhTd2dhU0FyUFNCa0xDQnVRbWwwY3lBdFBTQTRLU0I3ZlZ4dVhHNGdJRzBnUFNCbElDWWdLQ2d4SUR3OElDZ3Ria0pwZEhNcEtTQXRJREVwWEc0Z0lHVWdQajQ5SUNndGJrSnBkSE1wWEc0Z0lHNUNhWFJ6SUNzOUlHMU1aVzVjYmlBZ1ptOXlJQ2c3SUc1Q2FYUnpJRDRnTURzZ2JTQTlJRzBnS2lBeU5UWWdLeUJpZFdabVpYSmJiMlptYzJWMElDc2dhVjBzSUdrZ0t6MGdaQ3dnYmtKcGRITWdMVDBnT0NrZ2UzMWNibHh1SUNCcFppQW9aU0E5UFQwZ01Da2dlMXh1SUNBZ0lHVWdQU0F4SUMwZ1pVSnBZWE5jYmlBZ2ZTQmxiSE5sSUdsbUlDaGxJRDA5UFNCbFRXRjRLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHMGdQeUJPWVU0Z09pQW9LSE1nUHlBdE1TQTZJREVwSUNvZ1NXNW1hVzVwZEhrcFhHNGdJSDBnWld4elpTQjdYRzRnSUNBZ2JTQTlJRzBnS3lCTllYUm9MbkJ2ZHlneUxDQnRUR1Z1S1Z4dUlDQWdJR1VnUFNCbElDMGdaVUpwWVhOY2JpQWdmVnh1SUNCeVpYUjFjbTRnS0hNZ1B5QXRNU0E2SURFcElDb2diU0FxSUUxaGRHZ3VjRzkzS0RJc0lHVWdMU0J0VEdWdUtWeHVmVnh1WEc1bGVIQnZjblJ6TG5keWFYUmxJRDBnWm5WdVkzUnBiMjRnS0dKMVptWmxjaXdnZG1Gc2RXVXNJRzltWm5ObGRDd2dhWE5NUlN3Z2JVeGxiaXdnYmtKNWRHVnpLU0I3WEc0Z0lIWmhjaUJsTENCdExDQmpYRzRnSUhaaGNpQmxUR1Z1SUQwZ2JrSjVkR1Z6SUNvZ09DQXRJRzFNWlc0Z0xTQXhYRzRnSUhaaGNpQmxUV0Y0SUQwZ0tERWdQRHdnWlV4bGJpa2dMU0F4WEc0Z0lIWmhjaUJsUW1saGN5QTlJR1ZOWVhnZ1BqNGdNVnh1SUNCMllYSWdjblFnUFNBb2JVeGxiaUE5UFQwZ01qTWdQeUJOWVhSb0xuQnZkeWd5TENBdE1qUXBJQzBnVFdGMGFDNXdiM2NvTWl3Z0xUYzNLU0E2SURBcFhHNGdJSFpoY2lCcElEMGdhWE5NUlNBL0lEQWdPaUFvYmtKNWRHVnpJQzBnTVNsY2JpQWdkbUZ5SUdRZ1BTQnBjMHhGSUQ4Z01TQTZJQzB4WEc0Z0lIWmhjaUJ6SUQwZ2RtRnNkV1VnUENBd0lIeDhJQ2gyWVd4MVpTQTlQVDBnTUNBbUppQXhJQzhnZG1Gc2RXVWdQQ0F3S1NBL0lERWdPaUF3WEc1Y2JpQWdkbUZzZFdVZ1BTQk5ZWFJvTG1GaWN5aDJZV3gxWlNsY2JseHVJQ0JwWmlBb2FYTk9ZVTRvZG1Gc2RXVXBJSHg4SUhaaGJIVmxJRDA5UFNCSmJtWnBibWwwZVNrZ2UxeHVJQ0FnSUcwZ1BTQnBjMDVoVGloMllXeDFaU2tnUHlBeElEb2dNRnh1SUNBZ0lHVWdQU0JsVFdGNFhHNGdJSDBnWld4elpTQjdYRzRnSUNBZ1pTQTlJRTFoZEdndVpteHZiM0lvVFdGMGFDNXNiMmNvZG1Gc2RXVXBJQzhnVFdGMGFDNU1UaklwWEc0Z0lDQWdhV1lnS0haaGJIVmxJQ29nS0dNZ1BTQk5ZWFJvTG5CdmR5Z3lMQ0F0WlNrcElEd2dNU2tnZTF4dUlDQWdJQ0FnWlMwdFhHNGdJQ0FnSUNCaklDbzlJREpjYmlBZ0lDQjlYRzRnSUNBZ2FXWWdLR1VnS3lCbFFtbGhjeUErUFNBeEtTQjdYRzRnSUNBZ0lDQjJZV3gxWlNBclBTQnlkQ0F2SUdOY2JpQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdkbUZzZFdVZ0t6MGdjblFnS2lCTllYUm9MbkJ2ZHlneUxDQXhJQzBnWlVKcFlYTXBYRzRnSUNBZ2ZWeHVJQ0FnSUdsbUlDaDJZV3gxWlNBcUlHTWdQajBnTWlrZ2UxeHVJQ0FnSUNBZ1pTc3JYRzRnSUNBZ0lDQmpJQzg5SURKY2JpQWdJQ0I5WEc1Y2JpQWdJQ0JwWmlBb1pTQXJJR1ZDYVdGeklENDlJR1ZOWVhncElIdGNiaUFnSUNBZ0lHMGdQU0F3WEc0Z0lDQWdJQ0JsSUQwZ1pVMWhlRnh1SUNBZ0lIMGdaV3h6WlNCcFppQW9aU0FySUdWQ2FXRnpJRDQ5SURFcElIdGNiaUFnSUNBZ0lHMGdQU0FvZG1Gc2RXVWdLaUJqSUMwZ01Ta2dLaUJOWVhSb0xuQnZkeWd5TENCdFRHVnVLVnh1SUNBZ0lDQWdaU0E5SUdVZ0t5QmxRbWxoYzF4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQnRJRDBnZG1Gc2RXVWdLaUJOWVhSb0xuQnZkeWd5TENCbFFtbGhjeUF0SURFcElDb2dUV0YwYUM1d2IzY29NaXdnYlV4bGJpbGNiaUFnSUNBZ0lHVWdQU0F3WEc0Z0lDQWdmVnh1SUNCOVhHNWNiaUFnWm05eUlDZzdJRzFNWlc0Z1BqMGdPRHNnWW5WbVptVnlXMjltWm5ObGRDQXJJR2xkSUQwZ2JTQW1JREI0Wm1Zc0lHa2dLejBnWkN3Z2JTQXZQU0F5TlRZc0lHMU1aVzRnTFQwZ09Da2dlMzFjYmx4dUlDQmxJRDBnS0dVZ1BEd2diVXhsYmlrZ2ZDQnRYRzRnSUdWTVpXNGdLejBnYlV4bGJseHVJQ0JtYjNJZ0tEc2daVXhsYmlBK0lEQTdJR0oxWm1abGNsdHZabVp6WlhRZ0t5QnBYU0E5SUdVZ0ppQXdlR1ptTENCcElDczlJR1FzSUdVZ0x6MGdNalUyTENCbFRHVnVJQzA5SURncElIdDlYRzVjYmlBZ1luVm1abVZ5VzI5bVpuTmxkQ0FySUdrZ0xTQmtYU0I4UFNCeklDb2dNVEk0WEc1OVhHNWNibjBwTG1OaGJHd29kR2hwY3l4eVpYRjFhWEpsS0Z3aVpTOVZLemszWENJcExIUjVjR1Z2WmlCelpXeG1JQ0U5UFNCY0luVnVaR1ZtYVc1bFpGd2lJRDhnYzJWc1ppQTZJSFI1Y0dWdlppQjNhVzVrYjNjZ0lUMDlJRndpZFc1a1pXWnBibVZrWENJZ1B5QjNhVzVrYjNjZ09pQjdmU3h5WlhGMWFYSmxLRndpWW5WbVptVnlYQ0lwTGtKMVptWmxjaXhoY21kMWJXVnVkSE5iTTEwc1lYSm5kVzFsYm5Seld6UmRMR0Z5WjNWdFpXNTBjMXMxWFN4aGNtZDFiV1Z1ZEhOYk5sMHNYQ0l2TGk1Y1hGeGNMaTVjWEZ4Y2JtOWtaVjl0YjJSMWJHVnpYRnhjWEdsbFpXVTNOVFJjWEZ4Y2FXNWtaWGd1YW5OY0lpeGNJaTh1TGx4Y1hGd3VMbHhjWEZ4dWIyUmxYMjF2WkhWc1pYTmNYRnhjYVdWbFpUYzFORndpS1NJc0lpaG1kVzVqZEdsdmJpQW9jSEp2WTJWemN5eG5iRzlpWVd3c1FuVm1abVZ5TEY5ZllYSm5kVzFsYm5Rd0xGOWZZWEpuZFcxbGJuUXhMRjlmWVhKbmRXMWxiblF5TEY5ZllYSm5kVzFsYm5RekxGOWZabWxzWlc1aGJXVXNYMTlrYVhKdVlXMWxLWHRjYmk4dklITm9hVzBnWm05eUlIVnphVzVuSUhCeWIyTmxjM01nYVc0Z1luSnZkM05sY2x4dVhHNTJZWElnY0hKdlkyVnpjeUE5SUcxdlpIVnNaUzVsZUhCdmNuUnpJRDBnZTMwN1hHNWNibkJ5YjJObGMzTXVibVY0ZEZScFkyc2dQU0FvWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUhaaGNpQmpZVzVUWlhSSmJXMWxaR2xoZEdVZ1BTQjBlWEJsYjJZZ2QybHVaRzkzSUNFOVBTQW5kVzVrWldacGJtVmtKMXh1SUNBZ0lDWW1JSGRwYm1SdmR5NXpaWFJKYlcxbFpHbGhkR1U3WEc0Z0lDQWdkbUZ5SUdOaGJsQnZjM1FnUFNCMGVYQmxiMllnZDJsdVpHOTNJQ0U5UFNBbmRXNWtaV1pwYm1Wa0oxeHVJQ0FnSUNZbUlIZHBibVJ2ZHk1d2IzTjBUV1Z6YzJGblpTQW1KaUIzYVc1a2IzY3VZV1JrUlhabGJuUk1hWE4wWlc1bGNseHVJQ0FnSUR0Y2JseHVJQ0FnSUdsbUlDaGpZVzVUWlhSSmJXMWxaR2xoZEdVcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUlDaG1LU0I3SUhKbGRIVnliaUIzYVc1a2IzY3VjMlYwU1cxdFpXUnBZWFJsS0dZcElIMDdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ2FXWWdLR05oYmxCdmMzUXBJSHRjYmlBZ0lDQWdJQ0FnZG1GeUlIRjFaWFZsSUQwZ1cxMDdYRzRnSUNBZ0lDQWdJSGRwYm1SdmR5NWhaR1JGZG1WdWRFeHBjM1JsYm1WeUtDZHRaWE56WVdkbEp5d2dablZ1WTNScGIyNGdLR1YyS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2MyOTFjbU5sSUQwZ1pYWXVjMjkxY21ObE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tDaHpiM1Z5WTJVZ1BUMDlJSGRwYm1SdmR5QjhmQ0J6YjNWeVkyVWdQVDA5SUc1MWJHd3BJQ1ltSUdWMkxtUmhkR0VnUFQwOUlDZHdjbTlqWlhOekxYUnBZMnNuS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pYWXVjM1J2Y0ZCeWIzQmhaMkYwYVc5dUtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hGMVpYVmxMbXhsYm1kMGFDQStJREFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdadUlEMGdjWFZsZFdVdWMyaHBablFvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdabTRvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwc0lIUnlkV1VwTzF4dVhHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlCdVpYaDBWR2xqYXlobWJpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NYVmxkV1V1Y0hWemFDaG1iaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjNhVzVrYjNjdWNHOXpkRTFsYzNOaFoyVW9KM0J5YjJObGMzTXRkR2xqYXljc0lDY3FKeWs3WEc0Z0lDQWdJQ0FnSUgwN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJRzVsZUhSVWFXTnJLR1p1S1NCN1hHNGdJQ0FnSUNBZ0lITmxkRlJwYldWdmRYUW9abTRzSURBcE8xeHVJQ0FnSUgwN1hHNTlLU2dwTzF4dVhHNXdjbTlqWlhOekxuUnBkR3hsSUQwZ0oySnliM2R6WlhJbk8xeHVjSEp2WTJWemN5NWljbTkzYzJWeUlEMGdkSEoxWlR0Y2JuQnliMk5sYzNNdVpXNTJJRDBnZTMwN1hHNXdjbTlqWlhOekxtRnlaM1lnUFNCYlhUdGNibHh1Wm5WdVkzUnBiMjRnYm05dmNDZ3BJSHQ5WEc1Y2JuQnliMk5sYzNNdWIyNGdQU0J1YjI5d08xeHVjSEp2WTJWemN5NWhaR1JNYVhOMFpXNWxjaUE5SUc1dmIzQTdYRzV3Y205alpYTnpMbTl1WTJVZ1BTQnViMjl3TzF4dWNISnZZMlZ6Y3k1dlptWWdQU0J1YjI5d08xeHVjSEp2WTJWemN5NXlaVzF2ZG1WTWFYTjBaVzVsY2lBOUlHNXZiM0E3WEc1d2NtOWpaWE56TG5KbGJXOTJaVUZzYkV4cGMzUmxibVZ5Y3lBOUlHNXZiM0E3WEc1d2NtOWpaWE56TG1WdGFYUWdQU0J1YjI5d08xeHVYRzV3Y205alpYTnpMbUpwYm1ScGJtY2dQU0JtZFc1amRHbHZiaUFvYm1GdFpTa2dlMXh1SUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lnbmNISnZZMlZ6Y3k1aWFXNWthVzVuSUdseklHNXZkQ0J6ZFhCd2IzSjBaV1FuS1R0Y2JuMWNibHh1THk4Z1ZFOUVUeWh6YUhSNWJHMWhiaWxjYm5CeWIyTmxjM011WTNka0lEMGdablZ1WTNScGIyNGdLQ2tnZXlCeVpYUjFjbTRnSnk4bklIMDdYRzV3Y205alpYTnpMbU5vWkdseUlEMGdablZ1WTNScGIyNGdLR1JwY2lrZ2UxeHVJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduY0hKdlkyVnpjeTVqYUdScGNpQnBjeUJ1YjNRZ2MzVndjRzl5ZEdWa0p5azdYRzU5TzF4dVhHNTlLUzVqWVd4c0tIUm9hWE1zY21WeGRXbHlaU2hjSW1VdlZTczVOMXdpS1N4MGVYQmxiMllnYzJWc1ppQWhQVDBnWENKMWJtUmxabWx1WldSY0lpQS9JSE5sYkdZZ09pQjBlWEJsYjJZZ2QybHVaRzkzSUNFOVBTQmNJblZ1WkdWbWFXNWxaRndpSUQ4Z2QybHVaRzkzSURvZ2UzMHNjbVZ4ZFdseVpTaGNJbUoxWm1abGNsd2lLUzVDZFdabVpYSXNZWEpuZFcxbGJuUnpXek5kTEdGeVozVnRaVzUwYzFzMFhTeGhjbWQxYldWdWRITmJOVjBzWVhKbmRXMWxiblJ6V3paZExGd2lMeTR1WEZ4Y1hDNHVYRnhjWEc1dlpHVmZiVzlrZFd4bGMxeGNYRnh3Y205alpYTnpYRnhjWEdKeWIzZHpaWEl1YW5OY0lpeGNJaTh1TGx4Y1hGd3VMbHhjWEZ4dWIyUmxYMjF2WkhWc1pYTmNYRnhjY0hKdlkyVnpjMXdpS1NJc0lpaG1kVzVqZEdsdmJpQW9jSEp2WTJWemN5eG5iRzlpWVd3c1FuVm1abVZ5TEY5ZllYSm5kVzFsYm5Rd0xGOWZZWEpuZFcxbGJuUXhMRjlmWVhKbmRXMWxiblF5TEY5ZllYSm5kVzFsYm5RekxGOWZabWxzWlc1aGJXVXNYMTlrYVhKdVlXMWxLWHRjYmlkMWMyVWdjM1J5YVdOMEp6dGNibHh1ZG1GeUlHbHVjM1JoYm1ObGN5QTlJSHQ5TzF4dVhHNHZMejBnWDJaMWJtTjBhVzl1Y3k1cWMxeHVMeTg5SUY5emRHOXlaUzVqYkdGemN5NXFjMXh1THk4OUlGOXRiMlJoYkM1amJHRnpjeTVxYzF4dUx5ODlJRjl3Y205a2RXTjBMbU5zWVhOekxtcHpYRzR2THowZ1gySmhjMnRsZEM1amJHRnpjeTVxYzF4dUx5ODlJRjltYVd4MFpYSXVZMnhoYzNNdWFuTmNibHh1ZDJsdVpHOTNMbTl1Ykc5aFpDQTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JseHVJQ0F2THlCVGRHOXlaVnh1SUNCMllYSWdjSEp2WkhWamRITWdQU0J1WlhjZ1UzUnZjbVVvSjNOMFlYUnBZeTl3Y205a2RXTjBjeTVxYzI5dUp5d2dKeU53Y205a2RXTjBjeUF1WTI5dWRHVnVkQ2NwTzF4dUlDQndjbTlrZFdOMGN5NXZia3h2WVdRZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdkbUZ5SUc1aGRpQTlJR1J2WTNWdFpXNTBMbkYxWlhKNVUyVnNaV04wYjNJb0oyNWhkaWNwTEZ4dUlDQWdJQ0FnSUNCaGMybGtaU0E5SUdSdlkzVnRaVzUwTG5GMVpYSjVVMlZzWldOMGIzSW9KMkZ6YVdSbEp5a3NYRzRnSUNBZ0lDQWdJSE5zYVdSbElEMGdaRzlqZFcxbGJuUXVjWFZsY25sVFpXeGxZM1J2Y2lnbllYTnBaR1VnTG5Oc2FXUmxKeWs3WEc0Z0lDQWdkMmx1Wkc5M0xtOXVjMk55YjJ4c0lEMGdablZ1WTNScGIyNGdLR1VwSUh0Y2JpQWdJQ0FnSUhaaGNpQmpiM0p5WldOMFUyTnliMnhzSUQwZ1pTNTBZWEpuWlhRdWMyTnliMnhzYVc1blJXeGxiV1Z1ZEM1elkzSnZiR3hVYjNBZ0xTQmhjMmxrWlM1dlptWnpaWFJVYjNBZ0t5QnVZWFl1YjJabWMyVjBTR1ZwWjJoME8xeHVJQ0FnSUNBZ2FXWWdLR052Y25KbFkzUlRZM0p2Ykd3Z1BDQXdLU0J6Ykdsa1pTNXpkSGxzWlM1MGNtRnVjMlp2Y20wZ1BTQW5kSEpoYm5Oc1lYUmxXU2d3Y0hncEp6dGxiSE5sSUdsbUlDaGpiM0p5WldOMFUyTnliMnhzSUQ0Z1lYTnBaR1V1YjJabWMyVjBTR1ZwWjJoMElDMGdjMnhwWkdVdWIyWm1jMlYwU0dWcFoyaDBLU0J6Ykdsa1pTNXpkSGxzWlM1MGNtRnVjMlp2Y20wZ1BTQW5kSEpoYm5Oc1lYUmxXU2duSUNzZ0tHRnphV1JsTG05bVpuTmxkRWhsYVdkb2RDQXRJSE5zYVdSbExtOW1abk5sZEVobGFXZG9kQ2tnS3lBbmNIZ3BKenRsYkhObElHbG1JQ2hqYjNKeVpXTjBVMk55YjJ4c0lENGdNQ0FtSmlCamIzSnlaV04wVTJOeWIyeHNJRHdnWVhOcFpHVXViMlptYzJWMFNHVnBaMmgwSUMwZ2MyeHBaR1V1YjJabWMyVjBTR1ZwWjJoMEtTQnpiR2xrWlM1emRIbHNaUzUwY21GdWMyWnZjbTBnUFNBbmRISmhibk5zWVhSbFdTZ25JQ3NnWTI5eWNtVmpkRk5qY205c2JDQXJJQ2R3ZUNrbk8xeHVJQ0FnSUgwN1hHNGdJSDA3WEc1Y2JpQWdMeThnVTJOeWIyeHNYRzRnSUVGeWNtRjVMbVp5YjIwb1pHOWpkVzFsYm5RdWNYVmxjbmxUWld4bFkzUnZja0ZzYkNnbllWdG9jbVZtWGoxY0lpTmNJbDBuS1NrdWJXRndLR1oxYm1OMGFXOXVJQ2hwZEdWdEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUdsMFpXMHViMjVqYkdsamF5QTlJSE5qY205c2JGUnZPMXh1SUNCOUtUdGNibjA3WEc1OUtTNWpZV3hzS0hSb2FYTXNjbVZ4ZFdseVpTaGNJbVV2VlNzNU4xd2lLU3gwZVhCbGIyWWdjMlZzWmlBaFBUMGdYQ0oxYm1SbFptbHVaV1JjSWlBL0lITmxiR1lnT2lCMGVYQmxiMllnZDJsdVpHOTNJQ0U5UFNCY0luVnVaR1ZtYVc1bFpGd2lJRDhnZDJsdVpHOTNJRG9nZTMwc2NtVnhkV2x5WlNoY0ltSjFabVpsY2x3aUtTNUNkV1ptWlhJc1lYSm5kVzFsYm5Seld6TmRMR0Z5WjNWdFpXNTBjMXMwWFN4aGNtZDFiV1Z1ZEhOYk5WMHNZWEpuZFcxbGJuUnpXelpkTEZ3aUwyWmhhMlZmWXpWalkyTTBOalV1YW5OY0lpeGNJaTljSWlraVhYMD0iXX0=
