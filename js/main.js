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
    let activeShipments = this.products.filter(item => !!item.ammount); //.reduce(item => {return{id:item.props.id, ammount: item.ammount}}) || [];
    if (activeShipments.length === 0) {
        activeShipments = JSON.parse(sessionStorage.getItem('selected')) || [];
        if (activeShipments.length != 0) activeShipments.map(item => this.products[item.id].ammount = item.ammount );
    } else {sessionStorage.setItem('selected', JSON.stringify(this.products.filter(item => !!item.ammount).reduce((result, item) => {
              result.push({id:item.props.id, ammount: item.ammount});
              return result;
            },[])));
    }

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
};
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_54c7fede.js","/")
},{"buffer":2,"e/U+97":4}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxQcm9qZWN0c1xca3VwZWNoZXNraXlkb21cXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkM6L1Byb2plY3RzL2t1cGVjaGVza2l5ZG9tL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIkM6L1Byb2plY3RzL2t1cGVjaGVza2l5ZG9tL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCJDOi9Qcm9qZWN0cy9rdXBlY2hlc2tpeWRvbS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIkM6L1Byb2plY3RzL2t1cGVjaGVza2l5ZG9tL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJDOi9Qcm9qZWN0cy9rdXBlY2hlc2tpeWRvbS9zcmMvanMvZmFrZV81NGM3ZmVkZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cbjsoZnVuY3Rpb24gKGV4cG9ydHMpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG4gIHZhciBBcnIgPSAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKVxuICAgID8gVWludDhBcnJheVxuICAgIDogQXJyYXlcblxuXHR2YXIgUExVUyAgID0gJysnLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIICA9ICcvJy5jaGFyQ29kZUF0KDApXG5cdHZhciBOVU1CRVIgPSAnMCcuY2hhckNvZGVBdCgwKVxuXHR2YXIgTE9XRVIgID0gJ2EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFVQUEVSICA9ICdBJy5jaGFyQ29kZUF0KDApXG5cdHZhciBQTFVTX1VSTF9TQUZFID0gJy0nLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIX1VSTF9TQUZFID0gJ18nLmNoYXJDb2RlQXQoMClcblxuXHRmdW5jdGlvbiBkZWNvZGUgKGVsdCkge1xuXHRcdHZhciBjb2RlID0gZWx0LmNoYXJDb2RlQXQoMClcblx0XHRpZiAoY29kZSA9PT0gUExVUyB8fFxuXHRcdCAgICBjb2RlID09PSBQTFVTX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xuXHRcdGlmIChjb2RlID09PSBTTEFTSCB8fFxuXHRcdCAgICBjb2RlID09PSBTTEFTSF9VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MyAvLyAnLydcblx0XHRpZiAoY29kZSA8IE5VTUJFUilcblx0XHRcdHJldHVybiAtMSAvL25vIG1hdGNoXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcblx0XHRcdHJldHVybiBjb2RlIC0gTlVNQkVSICsgMjYgKyAyNlxuXHRcdGlmIChjb2RlIDwgVVBQRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcblx0XHRpZiAoY29kZSA8IExPV0VSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIExPV0VSICsgMjZcblx0fVxuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5IChiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuXG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0Jylcblx0XHR9XG5cblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG5cdFx0dmFyIGxlbiA9IGI2NC5sZW5ndGhcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXG5cblx0XHR2YXIgTCA9IDBcblxuXHRcdGZ1bmN0aW9uIHB1c2ggKHYpIHtcblx0XHRcdGFycltMKytdID0gdlxuXHRcdH1cblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDApID4+IDgpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpID4+IDQpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTApIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgNCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA+PiAyKVxuXHRcdFx0cHVzaCgodG1wID4+IDgpICYgMHhGRilcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyXG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoXG5cblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cC5jaGFyQXQobnVtKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKG51bSA+PiAxOCAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiAxMiAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiA2ICYgMHgzRikgKyBlbmNvZGUobnVtICYgMHgzRilcblx0XHR9XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKVxuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSlcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wID4+IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCAyKSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0XG5cdH1cblxuXHRleHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXlcblx0ZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NFxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxiYXNlNjQtanNcXFxcbGliXFxcXGI2NC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxiYXNlNjQtanNcXFxcbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MlxuXG4vKipcbiAqIElmIGBCdWZmZXIuX3VzZVR5cGVkQXJyYXlzYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXG4gKi9cbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxuICAvLyBDaHJvbWUgNyssIFNhZmFyaSA1LjErLCBPcGVyYSAxMS42KywgaU9TIDQuMisuIElmIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkaW5nXG4gIC8vIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcywgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnRcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcbiAgLy8gaW4gRmlyZWZveCA0LTI5LiBOb3cgZml4ZWQ6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOFxuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAvLyBDaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59KSgpXG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcblxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XG5cbiAgLy8gV29ya2Fyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvbiBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5nc1xuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KVxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgbGVuZ3RoXG4gIHZhciBsZW5ndGhcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KVxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBhc3N1bWUgdGhhdCBvYmplY3QgaXMgYXJyYXktbGlrZVxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgYXJyYXkgb3Igc3RyaW5nLicpXG5cbiAgdmFyIGJ1ZlxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxuICAgIGJ1ZiA9IHRoaXNcbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgICBlbHNlXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgIW5vWmVybykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgYnVmW2ldID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuLy8gU1RBVElDIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcbiAgdmFyIHJldFxuICBzdHIgPSBzdHIgKyAnJ1xuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICB0b3RhbExlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXG4gIH1cbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIF9hc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxuICAgID8gTnVtYmVyKGVuZClcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXG5cbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xuICBpZiAoZW5kID09PSBzdGFydClcbiAgICByZXR1cm4gJydcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzXG5cbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KVxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRfc3RhcnQpXG4gIH1cbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBfdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKylcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIF9hc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gX2hleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKVxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxuXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgICByZXR1cm4gbmV3QnVmXG4gIH1cbn1cblxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgdmFsID0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICB9IGVsc2Uge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApXG4gIH0gZWxzZSB7XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMV0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXG5cbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQzMihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApXG4gIH1cblxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpLCAndmFsdWUgaXMgbm90IGEgbnVtYmVyJylcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHRoaXNbaV0gPSB2YWx1ZVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cbiAgICAgIHJldHVybiBidWYuYnVmZmVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xuICBhcnIuX2dldCA9IGFyci5nZXRcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICBpbmRleCArPSBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBjb2VyY2UgKGxlbmd0aCkge1xuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxufVxuXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSkoc3ViamVjdClcbn1cblxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaWYgKGIgPD0gMHg3RilcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0ID0gaVxuICAgICAgaWYgKGIgPj0gMHhEODAwICYmIGIgPD0gMHhERkZGKSBpKytcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShzdHIpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgcG9zXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXG4gICAgICBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuXG4vKlxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XG4gKiBleGNlZWQgdGhlIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA+PSAwLCAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmc2ludCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG59XG5cbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYnVmZmVyXFxcXGluZGV4LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJ1ZmZlclwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbmV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxpZWVlNzU0XFxcXGluZGV4LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGllZWU3NTRcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxccHJvY2Vzc1xcXFxicm93c2VyLmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXHByb2Nlc3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBpbnN0YW5jZXMgPSB7fTtcblxuLy89IF9mdW5jdGlvbnMuanNcbi8vPSBfc3RvcmUuY2xhc3MuanNcbi8vPSBfbW9kYWwuY2xhc3MuanNcbi8vPSBfcHJvZHVjdC5jbGFzcy5qc1xuLy89IF9iYXNrZXQuY2xhc3MuanNcbi8vPSBfZmlsdGVyLmNsYXNzLmpzXG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBwcm9kdWN0cyA9IG5ldyBTdG9yZSgnc3RhdGljL3Byb2R1Y3RzLmpzb24nLCAnI3Byb2R1Y3RzIC5jb250ZW50Jyk7XG4gIHByb2R1Y3RzLm9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbmF2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbmF2JyksXG4gICAgICAgIGFzaWRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYXNpZGUnKSxcbiAgICAgICAgc2xpZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhc2lkZSAuc2xpZGUnKTtcbiAgICB3aW5kb3cub25zY3JvbGwgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIGNvcnJlY3RTY3JvbGwgPSBlLnRhcmdldC5zY3JvbGxpbmdFbGVtZW50LnNjcm9sbFRvcCAtIGFzaWRlLm9mZnNldFRvcCArIG5hdi5vZmZzZXRIZWlnaHQ7XG4gICAgICBpZiAoY29ycmVjdFNjcm9sbCA8IDApIHNsaWRlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKDBweCknO2Vsc2UgaWYgKGNvcnJlY3RTY3JvbGwgPiBhc2lkZS5vZmZzZXRIZWlnaHQgLSBzbGlkZS5vZmZzZXRIZWlnaHQpIHNsaWRlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKCcgKyAoYXNpZGUub2Zmc2V0SGVpZ2h0IC0gc2xpZGUub2Zmc2V0SGVpZ2h0KSArICdweCknO2Vsc2UgaWYgKGNvcnJlY3RTY3JvbGwgPiAwICYmIGNvcnJlY3RTY3JvbGwgPCBhc2lkZS5vZmZzZXRIZWlnaHQgLSBzbGlkZS5vZmZzZXRIZWlnaHQpIHNsaWRlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKCcgKyBjb3JyZWN0U2Nyb2xsICsgJ3B4KSc7XG4gICAgfTtcbiAgfTtcbn07XG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zha2VfNTRjN2ZlZGUuanNcIixcIi9cIikiXX0=
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xyXG4oZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XHJcbnZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XHJcblxyXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcclxuICAgID8gVWludDhBcnJheVxyXG4gICAgOiBBcnJheVxyXG5cclxuXHR2YXIgUExVUyAgID0gJysnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgTE9XRVIgID0gJ2EnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXHJcblx0dmFyIFNMQVNIX1VSTF9TQUZFID0gJ18nLmNoYXJDb2RlQXQoMClcclxuXHJcblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcclxuXHRcdHZhciBjb2RlID0gZWx0LmNoYXJDb2RlQXQoMClcclxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XHJcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcclxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xyXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XHJcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXHJcblx0XHRcdHJldHVybiA2MyAvLyAnLydcclxuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxyXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxyXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcclxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XHJcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXHJcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcclxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcclxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XHJcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxyXG5cclxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0JylcclxuXHRcdH1cclxuXHJcblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxyXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxyXG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXHJcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcclxuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2VcclxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXHJcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcclxuXHJcblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcclxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxyXG5cclxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcclxuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXHJcblxyXG5cdFx0dmFyIEwgPSAwXHJcblxyXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xyXG5cdFx0XHRhcnJbTCsrXSA9IHZcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XHJcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXHJcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcclxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxyXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xyXG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcclxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxyXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcclxuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXHJcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXHJcblx0XHRcdHB1c2godG1wICYgMHhGRilcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYXJyXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xyXG5cdFx0dmFyIGksXHJcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xyXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxyXG5cdFx0XHR0ZW1wLCBsZW5ndGhcclxuXHJcblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xyXG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcclxuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XHJcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXHJcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcclxuXHRcdH1cclxuXHJcblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXHJcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcclxuXHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxyXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXHJcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxyXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRwdXRcclxuXHR9XHJcblxyXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxyXG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcclxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxyXG5cclxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYmFzZTY0LWpzXFxcXGxpYlxcXFxiNjQuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYmFzZTY0LWpzXFxcXGxpYlwiKVxyXG59LHtcImJ1ZmZlclwiOjIsXCJlL1UrOTdcIjo0fV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcclxuLyohXHJcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxyXG4gKlxyXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cclxuICogQGxpY2Vuc2UgIE1JVFxyXG4gKi9cclxuXHJcbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxyXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxyXG5cclxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXHJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxyXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXHJcblxyXG4vKipcclxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxyXG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxyXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXHJcbiAqL1xyXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcclxuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxyXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcclxuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XHJcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcclxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XHJcbiAgdHJ5IHtcclxuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcclxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXHJcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxyXG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcclxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufSkoKVxyXG5cclxuLyoqXHJcbiAqIENsYXNzOiBCdWZmZXJcclxuICogPT09PT09PT09PT09PVxyXG4gKlxyXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcclxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXHJcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcclxuICogYSBzaW5nbGUgb2N0ZXQuXHJcbiAqXHJcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXHJcbiAqIHByb3RvdHlwZS5cclxuICovXHJcbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xyXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxyXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcclxuXHJcbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxyXG5cclxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXHJcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxyXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXHJcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XHJcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBGaW5kIHRoZSBsZW5ndGhcclxuICB2YXIgbGVuZ3RoXHJcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxyXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXHJcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXHJcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcclxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcclxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcclxuICBlbHNlXHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcclxuXHJcbiAgdmFyIGJ1ZlxyXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XHJcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXHJcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcclxuICAgIGJ1ZiA9IHRoaXNcclxuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcclxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXHJcbiAgfVxyXG5cclxuICB2YXIgaVxyXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XHJcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxyXG4gICAgYnVmLl9zZXQoc3ViamVjdClcclxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcclxuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxyXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXHJcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cclxuICAgIH1cclxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXHJcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgYnVmW2ldID0gMFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ1ZlxyXG59XHJcblxyXG4vLyBTVEFUSUMgTUVUSE9EU1xyXG4vLyA9PT09PT09PT09PT09PVxyXG5cclxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcclxuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgY2FzZSAnaGV4JzpcclxuICAgIGNhc2UgJ3V0ZjgnOlxyXG4gICAgY2FzZSAndXRmLTgnOlxyXG4gICAgY2FzZSAnYXNjaWknOlxyXG4gICAgY2FzZSAnYmluYXJ5JzpcclxuICAgIGNhc2UgJ2Jhc2U2NCc6XHJcbiAgICBjYXNlICdyYXcnOlxyXG4gICAgY2FzZSAndWNzMic6XHJcbiAgICBjYXNlICd1Y3MtMic6XHJcbiAgICBjYXNlICd1dGYxNmxlJzpcclxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcclxuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXHJcbn1cclxuXHJcbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcclxuICB2YXIgcmV0XHJcbiAgc3RyID0gc3RyICsgJydcclxuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xyXG4gICAgY2FzZSAnaGV4JzpcclxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3V0ZjgnOlxyXG4gICAgY2FzZSAndXRmLTgnOlxyXG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYXNjaWknOlxyXG4gICAgY2FzZSAnYmluYXJ5JzpcclxuICAgIGNhc2UgJ3Jhdyc6XHJcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2Jhc2U2NCc6XHJcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3VjczInOlxyXG4gICAgY2FzZSAndWNzLTInOlxyXG4gICAgY2FzZSAndXRmMTZsZSc6XHJcbiAgICBjYXNlICd1dGYtMTZsZSc6XHJcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxyXG4gIH1cclxuICByZXR1cm4gcmV0XHJcbn1cclxuXHJcbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcclxuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXHJcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxyXG5cclxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXHJcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xyXG4gICAgcmV0dXJuIGxpc3RbMF1cclxuICB9XHJcblxyXG4gIHZhciBpXHJcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcclxuICAgIHRvdGFsTGVuZ3RoID0gMFxyXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxyXG4gIHZhciBwb3MgPSAwXHJcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBpdGVtID0gbGlzdFtpXVxyXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxyXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXHJcbiAgfVxyXG4gIHJldHVybiBidWZcclxufVxyXG5cclxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxyXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XHJcbiAgaWYgKCFsZW5ndGgpIHtcclxuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxyXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xyXG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXHJcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcclxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXHJcblxyXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XHJcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXHJcbiAgfVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxyXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXHJcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXHJcbiAgfVxyXG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcclxuICByZXR1cm4gaVxyXG59XHJcblxyXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxyXG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxyXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cclxufVxyXG5cclxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XHJcbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxyXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cclxufVxyXG5cclxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG59XHJcblxyXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XHJcbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcclxuICByZXR1cm4gY2hhcnNXcml0dGVuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XHJcbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XHJcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcclxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcclxuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xyXG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxyXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcclxuICAgIH1cclxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XHJcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXHJcbiAgICBlbmNvZGluZyA9IG9mZnNldFxyXG4gICAgb2Zmc2V0ID0gbGVuZ3RoXHJcbiAgICBsZW5ndGggPSBzd2FwXHJcbiAgfVxyXG5cclxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXHJcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XHJcbiAgaWYgKCFsZW5ndGgpIHtcclxuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxyXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xyXG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcclxuICAgIH1cclxuICB9XHJcbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXHJcblxyXG4gIHZhciByZXRcclxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XHJcbiAgICBjYXNlICdoZXgnOlxyXG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3V0ZjgnOlxyXG4gICAgY2FzZSAndXRmLTgnOlxyXG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdhc2NpaSc6XHJcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdiaW5hcnknOlxyXG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2Jhc2U2NCc6XHJcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndWNzMic6XHJcbiAgICBjYXNlICd1Y3MtMic6XHJcbiAgICBjYXNlICd1dGYxNmxlJzpcclxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcclxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gICAgICBicmVha1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcclxuICB9XHJcbiAgcmV0dXJuIHJldFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XHJcbiAgdmFyIHNlbGYgPSB0aGlzXHJcblxyXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxyXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXHJcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgPyBOdW1iZXIoZW5kKVxyXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxyXG5cclxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXHJcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXHJcbiAgICByZXR1cm4gJydcclxuXHJcbiAgdmFyIHJldFxyXG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcclxuICAgIGNhc2UgJ2hleCc6XHJcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndXRmOCc6XHJcbiAgICBjYXNlICd1dGYtOCc6XHJcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2FzY2lpJzpcclxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2JpbmFyeSc6XHJcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYmFzZTY0JzpcclxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd1Y3MyJzpcclxuICAgIGNhc2UgJ3Vjcy0yJzpcclxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxyXG4gICAgY2FzZSAndXRmLTE2bGUnOlxyXG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxyXG4gIH1cclxuICByZXR1cm4gcmV0XHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0eXBlOiAnQnVmZmVyJyxcclxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxyXG4gIH1cclxufVxyXG5cclxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxyXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgc291cmNlID0gdGhpc1xyXG5cclxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcclxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXHJcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcclxuXHJcbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXHJcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxyXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxyXG5cclxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXHJcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcclxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcclxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxyXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxyXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcclxuXHJcbiAgLy8gQXJlIHdlIG9vYj9cclxuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXHJcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxyXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXHJcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcclxuXHJcbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XHJcblxyXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXHJcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxyXG4gIH0gZWxzZSB7XHJcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XHJcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xyXG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciByZXMgPSAnJ1xyXG4gIHZhciB0bXAgPSAnJ1xyXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcclxuXHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcclxuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xyXG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxyXG4gICAgICB0bXAgPSAnJ1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgcmV0ID0gJydcclxuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXHJcblxyXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxyXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxyXG4gIHJldHVybiByZXRcclxufVxyXG5cclxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcclxuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxyXG59XHJcblxyXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcblxyXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcclxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXHJcblxyXG4gIHZhciBvdXQgPSAnJ1xyXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XHJcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxyXG4gIH1cclxuICByZXR1cm4gb3V0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxyXG4gIHZhciByZXMgPSAnJ1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcclxuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcclxuICB9XHJcbiAgcmV0dXJuIHJlc1xyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcclxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXHJcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcclxuXHJcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcclxuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcclxuICB9IGVsc2Uge1xyXG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcclxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcclxuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3QnVmXHJcbiAgfVxyXG59XHJcblxyXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xyXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcclxuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcclxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxyXG59XHJcblxyXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xyXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcclxuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcclxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHJldHVybiB0aGlzW29mZnNldF1cclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdmFyIHZhbFxyXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcclxuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXHJcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcclxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcclxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxyXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXHJcbiAgfVxyXG4gIHJldHVybiB2YWxcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICB2YXIgdmFsXHJcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xyXG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXHJcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxyXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXHJcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxyXG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXHJcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcclxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXHJcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxyXG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXHJcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxyXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXHJcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cclxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcclxuICB9XHJcbiAgcmV0dXJuIHZhbFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXHJcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcclxuICBpZiAobmVnKVxyXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxyXG4gIGVsc2VcclxuICAgIHJldHVybiB0aGlzW29mZnNldF1cclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcclxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXHJcbiAgaWYgKG5lZylcclxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxyXG4gIGVsc2VcclxuICAgIHJldHVybiB2YWxcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXHJcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcclxuICBpZiAobmVnKVxyXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxyXG4gIGVsc2VcclxuICAgIHJldHVybiB2YWxcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxyXG4gIH1cclxuXHJcbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXHJcblxyXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xyXG4gICAgYnVmW29mZnNldCArIGldID1cclxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxyXG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcclxuICB9XHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xyXG4gICAgYnVmW29mZnNldCArIGldID1cclxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXHJcbiAgfVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcclxuICB9XHJcblxyXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgKHZhbHVlID49IDApXHJcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXHJcbiAgZWxzZVxyXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgKHZhbHVlID49IDApXHJcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxyXG4gIGVsc2VcclxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmICh2YWx1ZSA+PSAwKVxyXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcclxuICBlbHNlXHJcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxyXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcclxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XHJcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXHJcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXHJcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXHJcblxyXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcclxuICB9XHJcblxyXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxyXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXHJcblxyXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxyXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cclxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxyXG5cclxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXHJcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcclxuXHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcclxuICAgIHRoaXNbaV0gPSB2YWx1ZVxyXG4gIH1cclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBvdXQgPSBbXVxyXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXHJcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xyXG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcclxuICAgICAgYnJlYWtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXHJcbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxyXG4gKi9cclxuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xyXG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XHJcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXHJcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxyXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcclxuICB9XHJcbn1cclxuXHJcbi8vIEhFTFBFUiBGVU5DVElPTlNcclxuLy8gPT09PT09PT09PT09PT09PVxyXG5cclxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XHJcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxyXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXHJcbn1cclxuXHJcbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcclxuXHJcbi8qKlxyXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXHJcbiAqL1xyXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XHJcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcclxuXHJcbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXHJcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XHJcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XHJcblxyXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXHJcbiAgYXJyLmdldCA9IEJQLmdldFxyXG4gIGFyci5zZXQgPSBCUC5zZXRcclxuXHJcbiAgYXJyLndyaXRlID0gQlAud3JpdGVcclxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xyXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXHJcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxyXG4gIGFyci5jb3B5ID0gQlAuY29weVxyXG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXHJcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxyXG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcclxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXHJcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxyXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcclxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxyXG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXHJcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcclxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxyXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXHJcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcclxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxyXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcclxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXHJcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XHJcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXHJcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXHJcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXHJcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXHJcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxyXG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcclxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXHJcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxyXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcclxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXHJcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxyXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxyXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxyXG4gIGFyci5maWxsID0gQlAuZmlsbFxyXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxyXG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxyXG5cclxuICByZXR1cm4gYXJyXHJcbn1cclxuXHJcbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXHJcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcclxuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxyXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxyXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cclxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XHJcbiAgaW5kZXggKz0gbGVuXHJcbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxyXG4gIHJldHVybiAwXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XHJcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcclxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcclxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cclxuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxyXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxyXG59XHJcblxyXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XHJcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXHJcbiAgfSkoc3ViamVjdClcclxufVxyXG5cclxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xyXG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxyXG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxyXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvSGV4IChuKSB7XHJcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXHJcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcclxuICB2YXIgYnl0ZUFycmF5ID0gW11cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxyXG4gICAgaWYgKGIgPD0gMHg3RilcclxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXHJcbiAgICBlbHNlIHtcclxuICAgICAgdmFyIHN0YXJ0ID0gaVxyXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xyXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcclxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBieXRlQXJyYXlcclxufVxyXG5cclxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcclxuICB2YXIgYnl0ZUFycmF5ID0gW11cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xyXG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXHJcbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXHJcbiAgfVxyXG4gIHJldHVybiBieXRlQXJyYXlcclxufVxyXG5cclxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xyXG4gIHZhciBjLCBoaSwgbG9cclxuICB2YXIgYnl0ZUFycmF5ID0gW11cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xyXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXHJcbiAgICBoaSA9IGMgPj4gOFxyXG4gICAgbG8gPSBjICUgMjU2XHJcbiAgICBieXRlQXJyYXkucHVzaChsbylcclxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ5dGVBcnJheVxyXG59XHJcblxyXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcclxuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcclxufVxyXG5cclxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgdmFyIHBvc1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcclxuICAgICAgYnJlYWtcclxuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxyXG4gIH1cclxuICByZXR1cm4gaVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcclxuICB9XHJcbn1cclxuXHJcbi8qXHJcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XHJcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XHJcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxyXG4gKi9cclxuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XHJcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcclxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcclxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXHJcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50JylcclxufVxyXG5cclxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcclxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxyXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxyXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcclxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxyXG59XHJcblxyXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xyXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXHJcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXHJcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxyXG59XHJcblxyXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcclxuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcclxufVxyXG5cclxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYnVmZmVyXFxcXGluZGV4LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJ1ZmZlclwiKVxyXG59LHtcImJhc2U2NC1qc1wiOjEsXCJidWZmZXJcIjoyLFwiZS9VKzk3XCI6NCxcImllZWU3NTRcIjozfV0sMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcclxuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcclxuICB2YXIgZSwgbVxyXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXHJcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcclxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcclxuICB2YXIgbkJpdHMgPSAtN1xyXG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcclxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcclxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxyXG5cclxuICBpICs9IGRcclxuXHJcbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcclxuICBzID4+PSAoLW5CaXRzKVxyXG4gIG5CaXRzICs9IGVMZW5cclxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxyXG5cclxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxyXG4gIGUgPj49ICgtbkJpdHMpXHJcbiAgbkJpdHMgKz0gbUxlblxyXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XHJcblxyXG4gIGlmIChlID09PSAwKSB7XHJcbiAgICBlID0gMSAtIGVCaWFzXHJcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XHJcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcclxuICB9IGVsc2Uge1xyXG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxyXG4gICAgZSA9IGUgLSBlQmlhc1xyXG4gIH1cclxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxyXG59XHJcblxyXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XHJcbiAgdmFyIGUsIG0sIGNcclxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxyXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXHJcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXHJcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxyXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcclxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcclxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxyXG5cclxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxyXG5cclxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xyXG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXHJcbiAgICBlID0gZU1heFxyXG4gIH0gZWxzZSB7XHJcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcclxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcclxuICAgICAgZS0tXHJcbiAgICAgIGMgKj0gMlxyXG4gICAgfVxyXG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XHJcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcclxuICAgICAgZSsrXHJcbiAgICAgIGMgLz0gMlxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xyXG4gICAgICBtID0gMFxyXG4gICAgICBlID0gZU1heFxyXG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xyXG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcclxuICAgICAgZSA9IGUgKyBlQmlhc1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXHJcbiAgICAgIGUgPSAwXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxyXG5cclxuICBlID0gKGUgPDwgbUxlbikgfCBtXHJcbiAgZUxlbiArPSBtTGVuXHJcbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxyXG5cclxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcclxufVxyXG5cclxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcaWVlZTc1NFxcXFxpbmRleC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxpZWVlNzU0XCIpXHJcbn0se1wiYnVmZmVyXCI6MixcImUvVSs5N1wiOjR9XSw0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcclxuKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xyXG4vLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcclxuXHJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcclxuXHJcbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXHJcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xyXG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xyXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXHJcbiAgICA7XHJcblxyXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjYW5Qb3N0KSB7XHJcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcclxuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcclxuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XHJcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBmbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xyXG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcclxuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5cclxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcclxucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcclxucHJvY2Vzcy5lbnYgPSB7fTtcclxucHJvY2Vzcy5hcmd2ID0gW107XHJcblxyXG5mdW5jdGlvbiBub29wKCkge31cclxuXHJcbnByb2Nlc3Mub24gPSBub29wO1xyXG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcclxucHJvY2Vzcy5vbmNlID0gbm9vcDtcclxucHJvY2Vzcy5vZmYgPSBub29wO1xyXG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcclxucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xyXG5wcm9jZXNzLmVtaXQgPSBub29wO1xyXG5cclxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcclxufVxyXG5cclxuLy8gVE9ETyhzaHR5bG1hbilcclxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcclxucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XHJcbn07XHJcblxyXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXFxcXGJyb3dzZXIuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxccHJvY2Vzc1wiKVxyXG59LHtcImJ1ZmZlclwiOjIsXCJlL1UrOTdcIjo0fV0sNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGluc3RhbmNlcyA9IHt9O1xyXG5cclxuSFRNTEVsZW1lbnQucHJvdG90eXBlLnVwZGF0ZVRvID0gZnVuY3Rpb24oY29udGVudCkge1xyXG4gIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIHRoaXMuaW5uZXJIVE1MID0gY29udGVudDtcclxuICBlbHNlIGlmIChjb250ZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcclxuICAgIHRoaXMuaW5uZXJIVE1MID0gJyc7XHJcbiAgICB0aGlzLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBzZXJpYWxpemVGb3JtKGZvcm0pIHtcclxuICByZXR1cm4gQXJyYXkuZnJvbShmb3JtKS5yZWR1Y2UoKHJlc3VsdCwgaW5wdXQpID0+IHtcclxuICAgIGlmIChpbnB1dC50eXBlICE9PSAnc3VibWl0JykgcmVzdWx0W2lucHV0Lm5hbWVdID0gaW5wdXQudmFsdWU7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sIHt9KTtcclxufVxyXG5mdW5jdGlvbiBzZWN1cmVOdW1JbnB1dChtYXgsIG1pbiwgc3RlcCA9IDEpIHtcclxuICByZXR1cm4gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKChlLmtleUNvZGUgPCA0OCB8fCBlLmtleUNvZGUgPiA1NykgJiYgIShbOCwgNDYsIDM3LCAzOSwgMTNdLmluZGV4T2YoZS5rZXlDb2RlKSArIDEpKSB7XHJcbiAgICAgIGlmIChlLmtleUNvZGUgPT0gMzggJiYgZS50YXJnZXQudmFsdWUgPCBtYXggLSBzdGVwKVxyXG4gICAgICAgIGUudGFyZ2V0LnZhbHVlID0gK2UudGFyZ2V0LnZhbHVlICsgc3RlcDtcclxuICAgICAgaWYgKGUua2V5Q29kZSA9PSA0MCAmJiBlLnRhcmdldC52YWx1ZSA+IG1pbiArIHN0ZXApXHJcbiAgICAgICAgZS50YXJnZXQudmFsdWUgPSArZS50YXJnZXQudmFsdWUgLSBzdGVwO1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbmNsYXNzIFN0b3JlIHtcclxuICBjb25zdHJ1Y3Rvcih1cmxUb0pTT04gPSBmYWxzZSwgY29udGFpbmVyUXVlcnkgPSBmYWxzZSkge1xyXG4gICAgaW5zdGFuY2VzLnN0b3JlID0gdGhpcztcclxuICAgIHRoaXMudXJsVG9TdWJtaXQgPSAnLyc7XHJcbiAgICB0aGlzLmNvbnRhaW5lciA9IHtcclxuICAgICAgYmFza2V0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lclF1ZXJ5ICsgJyBhc2lkZSAuYmFza2V0LWNvbnRhaW5lcicpLFxyXG4gICAgICBmaWx0ZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyUXVlcnkgKyAnIGFzaWRlIC5maWx0ZXItY29udGFpbmVyJyksXHJcbiAgICAgIGFydGljbGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyUXVlcnkgKyAnIGFydGljbGUnKVxyXG4gICAgfTtcclxuICAgIHRoaXMuZmlsdGVyID0gZmFsc2U7XHJcbiAgICB0aGlzLmJhc2tldCA9IGZhbHNlO1xyXG4gICAgdGhpcy5tb2RhbCAgPSBuZXcgTW9kYWwoJyNtb2RhbGJveCcpO1xyXG5cclxuICAgIC8vIEdldHRpbmcgSlNPTiB3aXRoIHByb2R1Y3RzXHJcbiAgICBmZXRjaCh1cmxUb0pTT04pXHJcbiAgICAgIC50aGVuKGRhdGEgPT4gZGF0YS5qc29uKCkpXHJcbiAgICAgIC50aGVuKGpzb24gPT4ge1xyXG4gICAgICAgIHRoaXMucHJvZHVjdHMgPSBqc29uLnByb2R1Y3RzLm1hcCgocHJvZHVjdCwgaW5kZXgpID0+IG5ldyBQcm9kdWN0KHByb2R1Y3QsIGluZGV4KSk7XHJcbiAgICAgICAgdGhpcy5leGNoYW5nZUNvdXJzZSA9IGpzb24uZXhjaGFuZ2VDb3Vyc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKCgpID0+IHRoaXMuYnVpbGQoKSk7XHJcbiAgfVxyXG4gIGJ1aWxkKCkge1xyXG4gICAgLy8gc2Vzc2lvblN0b3JhZ2VcclxuICAgIGxldCBhY3RpdmVTaGlwbWVudHMgPSB0aGlzLnByb2R1Y3RzLmZpbHRlcihpdGVtID0+ICEhaXRlbS5hbW1vdW50KTsgLy8ucmVkdWNlKGl0ZW0gPT4ge3JldHVybntpZDppdGVtLnByb3BzLmlkLCBhbW1vdW50OiBpdGVtLmFtbW91bnR9fSkgfHwgW107XHJcbiAgICBpZiAoYWN0aXZlU2hpcG1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIGFjdGl2ZVNoaXBtZW50cyA9IEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnc2VsZWN0ZWQnKSkgfHwgW107XHJcbiAgICAgICAgaWYgKGFjdGl2ZVNoaXBtZW50cy5sZW5ndGggIT0gMCkgYWN0aXZlU2hpcG1lbnRzLm1hcChpdGVtID0+IHRoaXMucHJvZHVjdHNbaXRlbS5pZF0uYW1tb3VudCA9IGl0ZW0uYW1tb3VudCApO1xyXG4gICAgfSBlbHNlIHtzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdzZWxlY3RlZCcsIEpTT04uc3RyaW5naWZ5KHRoaXMucHJvZHVjdHMuZmlsdGVyKGl0ZW0gPT4gISFpdGVtLmFtbW91bnQpLnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe2lkOml0ZW0ucHJvcHMuaWQsIGFtbW91bnQ6IGl0ZW0uYW1tb3VudH0pO1xyXG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH0sW10pKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9Jbml0aWFsaXppbmcgZmlsdGVyICYgYmFza2V0XHJcbiAgICBpZiAoIXRoaXMuZmlsdGVyKSB0aGlzLmZpbHRlciA9IG5ldyBGaWx0ZXIodGhpcy5jb250YWluZXIuZmlsdGVyLCB0aGlzLnByb2R1Y3RzLCB0aGlzLmJ1aWxkLmJpbmQodGhpcykpO1xyXG4gICAgaWYgKCF0aGlzLmJhc2tldCkgdGhpcy5iYXNrZXQgPSBuZXcgQmFza2V0KHRoaXMuY29udGFpbmVyLmJhc2tldCk7XHJcblxyXG4gICAgdGhpcy5jb250YWluZXIuYXJ0aWNsZS5pbm5lckhUTUwgPSAnJztcclxuICAgIHRoaXMuZmlsdGVyLnNvcnQodGhpcy5wcm9kdWN0cykubWFwKGl0ZW0gPT4gdGhpcy5jb250YWluZXIuYXJ0aWNsZS5hcHBlbmRDaGlsZChpdGVtLnJlbmRlcigpKSk7XHJcbiAgICBpZiAodGhpcy5jb250YWluZXIuYXJ0aWNsZS5jaGlsZHJlbi5sZW5ndGggPT0gMCkgdGhpcy5jb250YWluZXIuYXJ0aWNsZS5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJuby1kYXRhXCI+0J/QviDQtNCw0L3QvdC+0LzRgyDRhNC40LvRjNGC0YDRgyDRgtC+0LLQsNGA0L7QsiDQvdC10YI8L3A+JztcclxuXHJcblxyXG4gICAgLy8gY2FsbGJhY2tcclxuICAgIGlmICh0aGlzLm9uTG9hZCkgdGhpcy5vbkxvYWQoKTtcclxuICB9XHJcbiAgc2VuZChkYXRhKSB7XHJcbiAgICB0aGlzLm1vZGFsLnRvZ2dsZSgpO1xyXG4gICAgZGF0YS5zaGlwbWVudHMgPSB0aGlzLnByb2R1Y3RzLmZpbHRlcihpdGVtID0+ICEhaXRlbS5hbW1vdW50KS5yZWR1Y2UoKHN1bSwgaXRlbSkgPT4ge1xyXG4gICAgICAgIHN1bS5wdXNoKHtuYW1lOml0ZW0ucHJvcHMubmFtZSwgYW1tb3VudDogaXRlbS5hbW1vdW50fSlcclxuICAgICAgICBpdGVtLmFtbW91bnQgPSAwO1xyXG4gICAgICAgIHJldHVybiBzdW07XHJcbiAgICAgIH0sW10pO1xyXG4gICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgnc2VsZWN0ZWQnKTtcclxuICAgIHRoaXMuYnVpbGQoKTtcclxuICAgIGluc3RhbmNlcy5iYXNrZXQucmVuZGVyKCk7XHJcbiAgICAvLyBmZXRjaCh0aGlzLnVybFRvU3VibWl0LCB7XHJcbiAgICAvLyAgIG1ldGhvZDogJ3Bvc3QnLFxyXG4gICAgLy8gICBoZWFkZXJzOiB7XHJcbiAgICAvLyAgICAgXCJDb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLThcIlxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKVxyXG4gICAgLy8gfSlcclxuICAgIC8vIC50aGVuKGRhdGEgPT4gZGF0YS5qc29uKCkpXHJcbiAgICAvLyAudGhlbihkYXRhID0+IHtcclxuICAgIC8vICAgY29uc29sZS5sb2coJ1JlcXVlc3Qgc3VjY2VlZGVkIHdpdGggSlNPTiByZXNwb25zZScsIGRhdGEpO1xyXG4gICAgLy8gfSlcclxuICAgIC8vIC5jYXRjaChlcnJvciA9PiB7XHJcbiAgICAvLyAgIGNvbnNvbGUubG9nKCdSZXF1ZXN0IGZhaWxlZCcsIGVycm9yKTtcclxuICAgIC8vIH0pO1xyXG5cclxuICB9XHJcblxyXG59XHJcbmNsYXNzIE1vZGFsIHtcclxuICBjb25zdHJ1Y3Rvcihjb250YWluZXJRdWVyeSkge1xyXG4gICAgaW5zdGFuY2VzLm1vZGFsID0gdGhpcztcclxuICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJRdWVyeSk7XHJcbiAgICB0aGlzLmNvbnRlbnQgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY29udGVudCcpO1xyXG4gICAgdGhpcy5jYXB0aW9uID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLmNhcHRpb24nKTtcclxuICAgIHRoaXMub3BlbiA9IGZhbHNlO1xyXG4gICAgLy8gRE9NIHByZXByYXJ0aW9uc1xyXG4gICAgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLmNsb3NlJykub25jbGljayA9IHRoaXMudG9nZ2xlLmJpbmQodGhpcyk7XHJcblxyXG4gICAgLy8gY2FsbGJhY2tzXHJcbiAgICB0aGlzLm9uT3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5vbkNsb3NlID0gZmFsc2U7XHJcbiAgICB0aGlzLm9uUmVuZGVyID0gZmFsc2U7XHJcbiAgfVxyXG4gIHRvZ2dsZSgpIHtcclxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSgnbW9kYWxtb2RlJyk7XHJcbiAgICB0aGlzLm9wZW4gPSAhdGhpcy5vcGVuO1xyXG4gICAgaWYgKHRoaXMub3BlbiAmJiB0aGlzLm9uT3BlbikgdGhpcy5vbk9wZW4oKTtcclxuICAgIGVsc2UgaWYodGhpcy5vbkNsb3NlKSB0aGlzLm9uQ2xvc2UoKTtcclxuICB9XHJcbiAgcmVuZGVyKHBhZ2VOYW1lLCBpbm5lckhUTUwpIHtcclxuICAgIHRoaXMuY29udGVudC51cGRhdGVUbyhpbm5lckhUTUwpO1xyXG4gICAgdGhpcy5jYXB0aW9uLnVwZGF0ZVRvKHBhZ2VOYW1lKTtcclxuICAgIGlmICh0aGlzLm9uUmVuZGVyKSB0aGlzLm9uUmVuZGVyKCk7XHJcbiAgICBpZiAoIXRoaXMub3BlbikgdGhpcy50b2dnbGUoKTtcclxuICB9XHJcbn1cclxuY2xhc3MgUHJvZHVjdCB7XHJcbiAgY29uc3RydWN0b3IoZGF0YSwgaWQpIHtcclxuICAgIHRoaXMuYW1tb3VudCA9IDA7XHJcbiAgICB0aGlzLnByb3BzID0gZGF0YTtcclxuICAgIHRoaXMucHJvcHMuaWQgPSBpZDtcclxuICAgIHRoaXMuY3VycmVuY3lDb2RlID0ge1xyXG4gICAgICByOiAnODM4MScsXHJcbiAgICAgIGc6ICc4MzcyJyxcclxuICAgICAgZDogJzM2J1xyXG4gICAgfVxyXG4gIH1cclxuICBnZXRDdXJyZW5jeSgpIHtcclxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHRoaXMuY3VycmVuY3lDb2RlW3RoaXMucHJvcHMuY3VycmVuY3ldKVxyXG4gIH1cclxuICByZW5kZXIobW9kZSA9IGZhbHNlKSB7XHJcbiAgICBsZXQgY3VycmVuY3kgPSB0aGlzLmdldEN1cnJlbmN5KCksXHJcbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuICAgICAgICBpbkJhc2tldCA9ICEhdGhpcy5hbW1vdW50ID8gJ2luLWJhc2tldCcgOiAnJyxcclxuICAgICAgICBidXR0b25UZXh0ID0gISF0aGlzLmFtbW91bnQgPyBg0JIg0LrQvtGA0LfQuNC90LUgKCR7dGhpcy5hbW1vdW50fSlgIDogJ9Ca0YPQv9C40YLRjCc7XHJcblxyXG4gICAgaWYgKG1vZGUgPT09ICdiYXNrZXQnKSB7XHJcblxyXG4gICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIml0ZW1cIj5cclxuICAgICAgICAgIDxpbWcgc3JjPVwiJHt0aGlzLnByb3BzLmltYWdlfVwiIGFsdD1cIiR7dGhpcy5wcm9wcy5uYW1lfVwiIC8+XHJcbiAgICAgICAgICA8cD4ke3RoaXMucHJvcHMubmFtZX08L3A+XHJcbiAgICAgICAgICAgIDxwPlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHJpY2VcIj4ke3RoaXMucHJvcHMucHJpY2V9ICR7Y3VycmVuY3l9PC9zcGFuPiB4XHJcbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiYW1tb3VudFwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIke3RoaXMuYW1tb3VudH1cIiAvPiA9XHJcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJyZXN1bHQtcHJpY2VcIj4ke3RoaXMucHJvcHMucHJpY2UgKiB0aGlzLmFtbW91bnR9ICR7Y3VycmVuY3l9PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJyZW1vdmVcIj7Qo9C00LDQu9C40YLRjDwvYnV0dG9uPlxyXG5cclxuICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICBgO1xyXG5cclxuICAgICAgLy8gQUNUSU9OU1xyXG4gICAgICBsZXQgYW1tb3VudCA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5hbW1vdW50JyksXHJcbiAgICAgICAgICByZXN1bHRQcmljZSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5yZXN1bHQtcHJpY2UnKSxcclxuICAgICAgICAgIHJlbW92ZSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5yZW1vdmUnKTtcclxuXHJcbiAgICAgIGFtbW91bnQub25rZXlkb3duID0gc2VjdXJlTnVtSW5wdXQoMTAwLCAwLCAxKTtcclxuICAgICAgYW1tb3VudC5vbmtleXVwID0gZSA9PiB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHJlc3VsdFByaWNlLmlubmVySFRNTCA9ICh0aGlzLmFtbW91bnQgPSArYW1tb3VudC52YWx1ZSkgKiB0aGlzLnByb3BzLnByaWNlICsgJyAnICsgY3VycmVuY3k7XHJcbiAgICAgICAgaW5zdGFuY2VzLmJhc2tldC5yZW5kZXIoKTtcclxuICAgICAgICBpbnN0YW5jZXMuc3RvcmUuYnVpbGQoKTtcclxuICAgICAgICBpbnN0YW5jZXMuYmFza2V0LnJlY291bnQoKTtcclxuICAgICAgfVxyXG4gICAgICByZW1vdmUub25jbGljayA9IGUgPT4ge1xyXG4gICAgICAgIHRoaXMuYW1tb3VudCA9IDA7XHJcbiAgICAgICAgaW5zdGFuY2VzLmJhc2tldC5yZW5kZXIoKTtcclxuICAgICAgICBpbnN0YW5jZXMuYmFza2V0LmNoZWNrb3V0KCk7XHJcbiAgICAgICAgaW5zdGFuY2VzLnN0b3JlLmJ1aWxkKCk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IGBcclxuICAgICAgICA8ZmlndXJlIGNsYXNzPVwicHJvZHVjdCAke2luQmFza2V0fVwiPlxyXG4gICAgICAgICAgPGltZyBzcmM9XCIke3RoaXMucHJvcHMuaW1hZ2V9XCIgYWx0PVwiJHt0aGlzLnByb3BzLm5hbWV9XCIgLz5cclxuICAgICAgICAgIDxoMz4ke3RoaXMucHJvcHMubmFtZX08L2gzPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsXCI+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHJpY2VcIj4ke3RoaXMucHJvcHMucHJpY2V9ICR7Y3VycmVuY3l9PC9zcGFuPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnV5XCI+JHtidXR0b25UZXh0fTwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9maWd1cmU+XHJcbiAgICAgIGA7XHJcblxyXG4gICAgICAvLyBBQ1RJT05TXHJcbiAgICAgIGxldCBjb250YWluZXIgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdCcpLFxyXG4gICAgICAgICAgYnV5ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmJ1eScpO1xyXG5cclxuICAgICAgYnV5Lm9uY2xpY2sgPSBlID0+IHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgaW5zdGFuY2VzLmJhc2tldC5zaG93KHRoaXMpO1xyXG4gICAgICAgIGluc3RhbmNlcy5iYXNrZXQucmVuZGVyKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgcmV0dXJuIHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkO1xyXG4gIH1cclxufVxyXG5jbGFzcyBCYXNrZXQge1xyXG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lcikge1xyXG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XHJcbiAgICBpbnN0YW5jZXMuYmFza2V0ID0gdGhpcztcclxuICAgIHRoaXMucmVuZGVyKCk7XHJcblxyXG4gIH1cclxuICBzaG93KHByb2R1Y3QpIHtcclxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG4gICAgICAgIGN1cnJlbmN5ID0gU3RyaW5nLmZyb21DaGFyQ29kZShwcm9kdWN0LmN1cnJlbmN5Q29kZVtwcm9kdWN0LnByb3BzLmN1cnJlbmN5XSksXHJcbiAgICAgICAgZGVsZXRlUHJvZHVjdCA9ICEhcHJvZHVjdC5hbW1vdW50ID8gJzxidXR0b24gY2xhc3M9XCJyZW1vdmVcIj7Qo9C00LDQu9C40YLRjDwvYnV0dG9uPicgOiAnJyxcclxuICAgICAgICBidXlQcm9kdWN0ID0gISFwcm9kdWN0LmFtbW91bnQgPyAn0JjQt9C80LXQvdC40YLRjCcgOiAn0JIg0LrQvtGA0LfQuNC90YMnO1xyXG5cclxuICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJiYXNrZXQtcHJvZHVjdFwiPlxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cImRlc2NyaXB0aW9uXCI+XHJcbiAgICAgICAgICAgICR7cHJvZHVjdC5wcm9wcy5kZXNjcmlwdGlvbiB8fCBgPGRpdiBjbGFzcz1cIm5vLWRhdGFcIj7QndC10YIg0L7Qv9C40YHQsNC90LjRjzwvZGl2PmB9XHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxpbWcgc3JjPVwiJHtwcm9kdWN0LnByb3BzLmltYWdlfVwiIGFsdD1cIiR7cHJvZHVjdC5wcm9wcy5uYW1lfVwiIHRpdGxlPVwi0JrRg9C/0LjRgtGMICR7cHJvZHVjdC5wcm9wcy5uYW1lfSFcIiAvPlxyXG4gICAgICAgICAgPHA+PHNwYW4gY2xhc3M9XCJwcmljZVwiPiR7cHJvZHVjdC5wcm9wcy5wcmljZX0gJHtjdXJyZW5jeX08L3NwYW4+PC9wPlxyXG4gICAgICAgICAgPHA+PGZvcm0+PGlucHV0IGNsYXNzPVwiYW1tb3VudFwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIke3Byb2R1Y3QuYW1tb3VudCB8fCAxfVwiIG1heGxlbmd0aD1cIjJcIiAvPjwvZm9ybT48L3A+XHJcbiAgICAgICAgICA8cD48YnV0dG9uIGNsYXNzPVwiYnV5XCI+JHtidXlQcm9kdWN0fTwvYnV0dG9uPiR7ZGVsZXRlUHJvZHVjdH08L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXY+XHJcbiAgICBgO1xyXG5cclxuICAgIC8vIEFDVElPTlNcclxuICAgIGxldCBhbW1vdW50ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmFtbW91bnQnKSxcclxuICAgICAgICBmb3JtID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignZm9ybScpLFxyXG4gICAgICAgIGJ1eSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5idXknKSxcclxuICAgICAgICByZW1vdmUgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcucmVtb3ZlJykgfHwgZmFsc2UsXHJcbiAgICAgICAgY2hhbmdlQW1tb3VudCA9ICh2YWx1ZSA9IGZhbHNlKSA9PiBlID0+IHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIHByb2R1Y3QuYW1tb3VudCA9ICh2YWx1ZSAhPT0gZmFsc2UpID8gdmFsdWUgOiArYW1tb3VudC52YWx1ZTtcclxuICAgICAgICAgIGluc3RhbmNlcy5tb2RhbC50b2dnbGUoKTtcclxuICAgICAgICAgIGluc3RhbmNlcy5zdG9yZS5idWlsZCgpO1xyXG4gICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIGFtbW91bnQub25rZXlkb3duID0gc2VjdXJlTnVtSW5wdXQoMTAwLCAwLCAxKTtcclxuICAgIGJ1eS5vbmNsaWNrID0gZm9ybS5vbnN1Ym1pdCA9IGNoYW5nZUFtbW91bnQoKTtcclxuICAgIGlmIChyZW1vdmUpIHJlbW92ZS5vbmNsaWNrID0gY2hhbmdlQW1tb3VudCgwKTtcclxuXHJcbiAgICBpbnN0YW5jZXMubW9kYWwucmVuZGVyKCfQodGC0YDQsNC90LjRhtCwINGC0L7QstCw0YDQsCcsIHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkKTtcclxuICAgIGFtbW91bnQuZm9jdXMoKTtcclxuICB9XHJcbiAgY2hlY2tvdXQoKSB7XHJcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuICAgICAgICBwcm9kdWN0cyA9IGluc3RhbmNlcy5zdG9yZS5wcm9kdWN0cy5maWx0ZXIoaXRlbSA9PiAhIWl0ZW0uYW1tb3VudCksXHJcbiAgICAgICAgcHJvZHVjdENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuICAgIC8vIElmIGJhc2tldCBlbXB0eSwgY2xvc2VpbmcgaXRcclxuICAgIGlmIChwcm9kdWN0cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgaW5zdGFuY2VzLm1vZGFsLnRvZ2dsZSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcHJvZHVjdHMubWFwKGl0ZW0gPT4gcHJvZHVjdENvbnRhaW5lci5hcHBlbmRDaGlsZChpdGVtLnJlbmRlcignYmFza2V0JykpKTtcclxuXHJcbiAgICBsZXQgdG90YWxQcmljZSA9IHByb2R1Y3RzLnJlZHVjZSgoc3VtLCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICBpZiAoISFpdGVtLmFtbW91bnQpIHN1bSArPSBpdGVtLmFtbW91bnQgKiBpdGVtLnByb3BzLnByaWNlO1xyXG4gICAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgICAgICB9LCAwKSxcclxuICAgICAgICBjdXJyZW5jeSA9IHByb2R1Y3RzWzBdLmdldEN1cnJlbmN5KCk7XHJcblxyXG4gICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwiYmFza2V0LWNoZWNrb3V0XCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImxpc3RcIj5cclxuXHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0b3RhbC1wcmljZVwiPlxyXG4gICAgICAgICAgICDQntCx0YnQsNGPINGB0YPQvNC80LBcclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2YWx1ZVwiPiR7dG90YWxQcmljZX0gJHtjdXJyZW5jeX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGZvcm0+XHJcbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cIm5hbWVcIiBwbGFjZWhvbGRlcj1cIiog0JjQvNGPLi4uXCIgcmVxdWlyZWQgLz5cclxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwicGhvbmVcIiBwbGFjZWhvbGRlcj1cIiog0KLQtdC70LXRhNC+0L0uLi5cIiByZXF1aXJlZCAvPlxyXG4gICAgICAgICAgICAgIDx0ZXh0YXJlYSBuYW1lPVwiY29tbWVudFwiIHBsYWNlaG9sZGVyPVwi0JrQvtC80LXQvdGC0LDRgNC40Lkg0Log0LfQsNC60LDQt9GDLi4uXCI+PC90ZXh0YXJlYT5cclxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwi0J7RgtC/0YDQsNCy0LjRgtGMXCIgLz5cclxuICAgICAgICAgICAgPC9mb3JtPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcblxyXG4gICAgLy8gQUNUSU9OU1xyXG4gICAgbGV0IGxpc3QgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcubGlzdCcpLFxyXG4gICAgICAgIGZvcm0gPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XHJcblxyXG4gICAgbGlzdC5hcHBlbmRDaGlsZChwcm9kdWN0Q29udGFpbmVyKTtcclxuICAgIGZvcm0ub25zdWJtaXQgPSBlID0+IHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBpbnN0YW5jZXMuc3RvcmUuc2VuZChzZXJpYWxpemVGb3JtKGUuY3VycmVudFRhcmdldC5lbGVtZW50cykpO1xyXG4gICAgfVxyXG5cclxuICAgIGluc3RhbmNlcy5tb2RhbC5yZW5kZXIoJ9Ce0YTQvtGA0LzQu9C10L3QuNC1INC30LDQutCw0LfQsCcsIHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkKTtcclxuICB9XHJcbiAgcmVjb3VudCgpIHtcclxuICAgIGxldCBjdXJyZW5jeSA9IGluc3RhbmNlcy5zdG9yZS5wcm9kdWN0c1swXS5nZXRDdXJyZW5jeSgpLFxyXG4gICAgICAgIHRvdGFsUHJpY2UgPSBpbnN0YW5jZXMuc3RvcmUucHJvZHVjdHMucmVkdWNlKChzdW0sIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICBpZiAoISFpdGVtLmFtbW91bnQpIHN1bSArPSBpdGVtLmFtbW91bnQgKiBpdGVtLnByb3BzLnByaWNlO1xyXG4gICAgICAgICAgICAgIHJldHVybiBzdW07XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvdGFsLXByaWNlIC52YWx1ZScpLmlubmVySFRNTCA9IHRvdGFsUHJpY2UgKyAnICcgKyBjdXJyZW5jeTtcclxuXHJcblxyXG4gIH1cclxuICByZW5kZXIoKSB7XHJcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuICAgICAgICBhbW1vdW50ID0gaW5zdGFuY2VzLnN0b3JlLnByb2R1Y3RzLnJlZHVjZSgoc3VtLCBpdGVtKSA9PiAgc3VtICsgaXRlbS5hbW1vdW50ICogaXRlbS5wcm9wcy5wcmljZSwgMCksXHJcbiAgICAgICAgY291bnQgPSBpbnN0YW5jZXMuc3RvcmUucHJvZHVjdHMucmVkdWNlKChzdW0sIGl0ZW0pID0+ICBzdW0gKyBpdGVtLmFtbW91bnQsIDApLFxyXG4gICAgICAgIHJlc3BvbnNlID0gISFhbW1vdW50ID8gYDxwPiR7Y291bnR9INGC0L7QstCw0YAo0L7Qsikg0L3QsCDRgdGD0LzQvNGDOjxiciAvPjxzcGFuIGNsYXNzPVwicHJpY2VcIj4gJHthbW1vdW50fSDRgNGD0LHQu9C10Lk8L3NwYW4+PC9wPjxidXR0b24gY2xhc3M9XCJhY3Rpb25cIj7QntGE0L7RgNC80LjRgtGMPC9idXR0b24+YCA6ICc8ZGl2IGNsYXNzPVwibm8tZGF0YVwiPtCf0YPRgdGC0L48L2Rpdj4nXHJcblxyXG4gICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IGlkPVwiYmFza2V0XCI+XHJcbiAgICAgICAgPGgzPtCa0L7RgNC30LjQvdCwPC9oMz5cclxuICAgICAgICAke3Jlc3BvbnNlfVxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcblxyXG4gICAgLy8gQUNUSU9OU1xyXG4gICAgbGV0IGFjdGlvbiA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5hY3Rpb24nKTtcclxuXHJcbiAgICBpZiAoYWN0aW9uKSBhY3Rpb24ub25jbGljayA9IHRoaXMuY2hlY2tvdXQuYmluZCh0aGlzKTtcclxuXHJcblxyXG4gICAgdGhpcy5jb250YWluZXIudXBkYXRlVG8odGVtcGxhdGUuZmlyc3RFbGVtZW50Q2hpbGQpO1xyXG4gIH1cclxufVxyXG5jbGFzcyBGaWx0ZXIge1xyXG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lciwgcHJvZHVjdHMsIGNhbGxiYWNrKSB7XHJcbiAgICB0aGlzLnByb2R1Y3RzID0gcHJvZHVjdHM7XHJcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICB0aGlzLnNvcnRGdW5jdGlvbiA9IHtcclxuICAgICAgc2VhcmNoOiBpdGVtID0+IGl0ZW0ucHJvcHMubmFtZS5pbmNsdWRlcyh0aGlzLmZpbHRlckNvbmRpdGlvbnMuc2VhcmNoKSxcclxuICAgICAgY2F0ZWdvcnk6IGl0ZW0gPT4gaXRlbS5wcm9wcy5jYXRlZ29yeSA9PT0gdGhpcy5maWx0ZXJDb25kaXRpb25zLmNhdGVnb3J5LFxyXG4gICAgICBtaW46IGl0ZW0gPT4gaXRlbS5wcm9wcy5wcmljZSA+IHRoaXMuZmlsdGVyQ29uZGl0aW9ucy5taW4sXHJcbiAgICAgIG1heDogaXRlbSA9PiBpdGVtLnByb3BzLnByaWNlIDwgdGhpcy5maWx0ZXJDb25kaXRpb25zLm1heFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbmRlcmluZyBhc2lkZVxyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucmVuZGVyKCkpO1xyXG5cclxuICB9XHJcbiAgc29ydChwcm9kdWN0cykge1xyXG4gICAgaWYodGhpcy5maWx0ZXJDb25kaXRpb25zKSB7XHJcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuZmlsdGVyQ29uZGl0aW9ucykubWFwKGNvbmRpdGlvbiA9PiB7XHJcbiAgICAgICAgaWYodGhpcy5maWx0ZXJDb25kaXRpb25zW2NvbmRpdGlvbl0gIT09ICcnKSBwcm9kdWN0cyA9IHByb2R1Y3RzLmZpbHRlcih0aGlzLnNvcnRGdW5jdGlvbltjb25kaXRpb25dKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJvZHVjdHM7XHJcbiAgfVxyXG4gIHJlbmRlcigpIHtcclxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG4gICAgICAgIGNhdGVnb3JpZXMgPSB0aGlzLnByb2R1Y3RzLnJlZHVjZSgoYXJyYXksIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgaWYgKCEoYXJyYXkuaW5kZXhPZihpdGVtLnByb3BzLmNhdGVnb3J5KSArIDEpKSBhcnJheS5wdXNoKGl0ZW0ucHJvcHMuY2F0ZWdvcnkpO1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICAgICAgICB9LCBbXSksXHJcbiAgICAgICAgc2VsZWN0T3B0aW9ucyA9IGNhdGVnb3JpZXMucmVkdWNlKChyb3csIGl0ZW0pID0+IHJvdyArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7aXRlbX1cIj4ke2l0ZW19PC9vcHRpb24+YCwgJzxvcHRpb24gdmFsdWU9XCJcIj7QstGB0LU8L29wdGlvbj4nKTtcclxuXHJcbiAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxmb3JtIGlkPVwiZmlsdGVyXCI+XHJcbiAgICAgICAgPGxhYmVsPlxyXG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInNlYXJjaFwiIHBsYWNlaG9sZGVyPVwi0L/QvtC40YHQui4uLlwiPlxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgPGhyIC8+XHJcbiAgICAgICAgPHNwYW4+0JrQsNGC0LXQs9C+0YDQuNGPPC9zcGFuPlxyXG4gICAgICAgIDxsYWJlbD5cclxuICAgICAgICAgIDxzZWxlY3QgbmFtZT1cImNhdGVnb3J5XCI+XHJcbiAgICAgICAgICAgICR7c2VsZWN0T3B0aW9uc31cclxuICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgPGhyIC8+XHJcbiAgICAgICAgPHNwYW4+0KbQtdC90LA8L3NwYW4+XHJcbiAgICAgICAgPGxhYmVsIGNsYXNzPVwiaW5saW5lXCI+XHJcbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInByaWNlXCIgbmFtZT1cIm1pblwiIHBsYWNlaG9sZGVyPVwi0L7Rgi4uLlwiPlxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgPGxhYmVsIGNsYXNzPVwiaW5saW5lXCI+XHJcbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInByaWNlXCIgbmFtZT1cIm1heFwiIHBsYWNlaG9sZGVyPVwi0LTQvi4uLlwiPlxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgIDwvZm9ybT5cclxuICAgIGA7XHJcblxyXG4gICAgLy8gQUNUSU9OU1xyXG4gICAgdGhpcy5mb3JtID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignZm9ybScpO1xyXG4gICAgbGV0IG51bUlucHV0cyA9IEFycmF5LmZyb20odGVtcGxhdGUucXVlcnlTZWxlY3RvckFsbCgnLnByaWNlJykpO1xyXG5cclxuICAgIHRoaXMuZm9ybS5vbmNoYW5nZSA9IHRoaXMuZm9ybS5vbnN1Ym1pdCA9IChlKSA9PiB7XHJcbiAgICAgIHRoaXMuZmlsdGVyQ29uZGl0aW9ucyA9IHNlcmlhbGl6ZUZvcm0oZS5jdXJyZW50VGFyZ2V0LmVsZW1lbnRzKTtcclxuICAgICAgdGhpcy5jYWxsYmFjaygpO1xyXG4gICAgfVxyXG4gICAgbnVtSW5wdXRzLm1hcChpdGVtID0+IGl0ZW0ub25rZXlkb3duID0gc2VjdXJlTnVtSW5wdXQoMjAwMCwgMCwgMTAwKSlcclxuXHJcblxyXG4gICAgcmV0dXJuIHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkO1xyXG4gIH1cclxufVxyXG5cclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgcHJvZHVjdHMgPSBuZXcgU3RvcmUoJ3N0YXRpYy9wcm9kdWN0cy5qc29uJywgJyNwcm9kdWN0cyAuY29udGVudCcpO1xyXG4gIHByb2R1Y3RzLm9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBuYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCduYXYnKSxcclxuICAgICAgICBhc2lkZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FzaWRlJyksXHJcbiAgICAgICAgc2xpZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhc2lkZSAuc2xpZGUnKTtcclxuICAgIHdpbmRvdy5vbnNjcm9sbCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHZhciBjb3JyZWN0U2Nyb2xsID0gZS50YXJnZXQuc2Nyb2xsaW5nRWxlbWVudC5zY3JvbGxUb3AgLSBhc2lkZS5vZmZzZXRUb3AgKyBuYXYub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICBpZiAoY29ycmVjdFNjcm9sbCA8IDApIHNsaWRlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKDBweCknO2Vsc2UgaWYgKGNvcnJlY3RTY3JvbGwgPiBhc2lkZS5vZmZzZXRIZWlnaHQgLSBzbGlkZS5vZmZzZXRIZWlnaHQpIHNsaWRlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKCcgKyAoYXNpZGUub2Zmc2V0SGVpZ2h0IC0gc2xpZGUub2Zmc2V0SGVpZ2h0KSArICdweCknO2Vsc2UgaWYgKGNvcnJlY3RTY3JvbGwgPiAwICYmIGNvcnJlY3RTY3JvbGwgPCBhc2lkZS5vZmZzZXRIZWlnaHQgLSBzbGlkZS5vZmZzZXRIZWlnaHQpIHNsaWRlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKCcgKyBjb3JyZWN0U2Nyb2xsICsgJ3B4KSc7XHJcbiAgICB9O1xyXG4gIH07XHJcbn07XHJcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZmFrZV81NGM3ZmVkZS5qc1wiLFwiL1wiKVxyXG59LHtcImJ1ZmZlclwiOjIsXCJlL1UrOTdcIjo0fV19LHt9LFs1XSlcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklrTTZYRnhRY205cVpXTjBjMXhjYTNWd1pXTm9aWE5yYVhsa2IyMWNYRzV2WkdWZmJXOWtkV3hsYzF4Y1luSnZkM05sY2kxd1lXTnJYRnhmY0hKbGJIVmtaUzVxY3lJc0lrTTZMMUJ5YjJwbFkzUnpMMnQxY0dWamFHVnphMmw1Wkc5dEwyNXZaR1ZmYlc5a2RXeGxjeTlpWVhObE5qUXRhbk12YkdsaUwySTJOQzVxY3lJc0lrTTZMMUJ5YjJwbFkzUnpMMnQxY0dWamFHVnphMmw1Wkc5dEwyNXZaR1ZmYlc5a2RXeGxjeTlpZFdabVpYSXZhVzVrWlhndWFuTWlMQ0pET2k5UWNtOXFaV04wY3k5cmRYQmxZMmhsYzJ0cGVXUnZiUzl1YjJSbFgyMXZaSFZzWlhNdmFXVmxaVGMxTkM5cGJtUmxlQzVxY3lJc0lrTTZMMUJ5YjJwbFkzUnpMMnQxY0dWamFHVnphMmw1Wkc5dEwyNXZaR1ZmYlc5a2RXeGxjeTl3Y205alpYTnpMMkp5YjNkelpYSXVhbk1pTENKRE9pOVFjbTlxWldOMGN5OXJkWEJsWTJobGMydHBlV1J2YlM5emNtTXZhbk12Wm1GclpWODFOR00zWm1Wa1pTNXFjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVR0QlEwRkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUXpsSVFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUTNac1EwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRM1JHUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkRha1ZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQklpd2labWxzWlNJNkltZGxibVZ5WVhSbFpDNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUlvWm5WdVkzUnBiMjRnWlNoMExHNHNjaWw3Wm5WdVkzUnBiMjRnY3lodkxIVXBlMmxtS0NGdVcyOWRLWHRwWmlnaGRGdHZYU2w3ZG1GeUlHRTlkSGx3Wlc5bUlISmxjWFZwY21VOVBWd2lablZ1WTNScGIyNWNJaVltY21WeGRXbHlaVHRwWmlnaGRTWW1ZU2x5WlhSMWNtNGdZU2h2TENFd0tUdHBaaWhwS1hKbGRIVnliaUJwS0c4c0lUQXBPM1JvY205M0lHNWxkeUJGY25KdmNpaGNJa05oYm01dmRDQm1hVzVrSUcxdlpIVnNaU0FuWENJcmJ5dGNJaWRjSWlsOWRtRnlJR1k5Ymx0dlhUMTdaWGh3YjNKMGN6cDdmWDA3ZEZ0dlhWc3dYUzVqWVd4c0tHWXVaWGh3YjNKMGN5eG1kVzVqZEdsdmJpaGxLWHQyWVhJZ2JqMTBXMjlkV3pGZFcyVmRPM0psZEhWeWJpQnpLRzQvYmpwbEtYMHNaaXhtTG1WNGNHOXlkSE1zWlN4MExHNHNjaWw5Y21WMGRYSnVJRzViYjEwdVpYaHdiM0owYzMxMllYSWdhVDEwZVhCbGIyWWdjbVZ4ZFdseVpUMDlYQ0ptZFc1amRHbHZibHdpSmlaeVpYRjFhWEpsTzJadmNpaDJZWElnYnowd08yODhjaTVzWlc1bmRHZzdieXNyS1hNb2NsdHZYU2s3Y21WMGRYSnVJSE45S1NJc0lpaG1kVzVqZEdsdmJpQW9jSEp2WTJWemN5eG5iRzlpWVd3c1FuVm1abVZ5TEY5ZllYSm5kVzFsYm5Rd0xGOWZZWEpuZFcxbGJuUXhMRjlmWVhKbmRXMWxiblF5TEY5ZllYSm5kVzFsYm5RekxGOWZabWxzWlc1aGJXVXNYMTlrYVhKdVlXMWxLWHRjYm5aaGNpQnNiMjlyZFhBZ1BTQW5RVUpEUkVWR1IwaEpTa3RNVFU1UFVGRlNVMVJWVmxkWVdWcGhZbU5rWldabmFHbHFhMnh0Ym05d2NYSnpkSFYyZDNoNWVqQXhNak0wTlRZM09Ea3JMeWM3WEc1Y2Jqc29ablZ1WTNScGIyNGdLR1Y0Y0c5eWRITXBJSHRjYmx4MEozVnpaU0J6ZEhKcFkzUW5PMXh1WEc0Z0lIWmhjaUJCY25JZ1BTQW9kSGx3Wlc5bUlGVnBiblE0UVhKeVlYa2dJVDA5SUNkMWJtUmxabWx1WldRbktWeHVJQ0FnSUQ4Z1ZXbHVkRGhCY25KaGVWeHVJQ0FnSURvZ1FYSnlZWGxjYmx4dVhIUjJZWElnVUV4VlV5QWdJRDBnSnlzbkxtTm9ZWEpEYjJSbFFYUW9NQ2xjYmx4MGRtRnlJRk5NUVZOSUlDQTlJQ2N2Snk1amFHRnlRMjlrWlVGMEtEQXBYRzVjZEhaaGNpQk9WVTFDUlZJZ1BTQW5NQ2N1WTJoaGNrTnZaR1ZCZENnd0tWeHVYSFIyWVhJZ1RFOVhSVklnSUQwZ0oyRW5MbU5vWVhKRGIyUmxRWFFvTUNsY2JseDBkbUZ5SUZWUVVFVlNJQ0E5SUNkQkp5NWphR0Z5UTI5a1pVRjBLREFwWEc1Y2RIWmhjaUJRVEZWVFgxVlNURjlUUVVaRklEMGdKeTBuTG1Ob1lYSkRiMlJsUVhRb01DbGNibHgwZG1GeUlGTk1RVk5JWDFWU1RGOVRRVVpGSUQwZ0oxOG5MbU5vWVhKRGIyUmxRWFFvTUNsY2JseHVYSFJtZFc1amRHbHZiaUJrWldOdlpHVWdLR1ZzZENrZ2UxeHVYSFJjZEhaaGNpQmpiMlJsSUQwZ1pXeDBMbU5vWVhKRGIyUmxRWFFvTUNsY2JseDBYSFJwWmlBb1kyOWtaU0E5UFQwZ1VFeFZVeUI4ZkZ4dVhIUmNkQ0FnSUNCamIyUmxJRDA5UFNCUVRGVlRYMVZTVEY5VFFVWkZLVnh1WEhSY2RGeDBjbVYwZFhKdUlEWXlJQzh2SUNjckoxeHVYSFJjZEdsbUlDaGpiMlJsSUQwOVBTQlRURUZUU0NCOGZGeHVYSFJjZENBZ0lDQmpiMlJsSUQwOVBTQlRURUZUU0Y5VlVreGZVMEZHUlNsY2JseDBYSFJjZEhKbGRIVnliaUEyTXlBdkx5QW5MeWRjYmx4MFhIUnBaaUFvWTI5a1pTQThJRTVWVFVKRlVpbGNibHgwWEhSY2RISmxkSFZ5YmlBdE1TQXZMMjV2SUcxaGRHTm9YRzVjZEZ4MGFXWWdLR052WkdVZ1BDQk9WVTFDUlZJZ0t5QXhNQ2xjYmx4MFhIUmNkSEpsZEhWeWJpQmpiMlJsSUMwZ1RsVk5Ra1ZTSUNzZ01qWWdLeUF5Tmx4dVhIUmNkR2xtSUNoamIyUmxJRHdnVlZCUVJWSWdLeUF5TmlsY2JseDBYSFJjZEhKbGRIVnliaUJqYjJSbElDMGdWVkJRUlZKY2JseDBYSFJwWmlBb1kyOWtaU0E4SUV4UFYwVlNJQ3NnTWpZcFhHNWNkRngwWEhSeVpYUjFjbTRnWTI5a1pTQXRJRXhQVjBWU0lDc2dNalpjYmx4MGZWeHVYRzVjZEdaMWJtTjBhVzl1SUdJMk5GUnZRbmwwWlVGeWNtRjVJQ2hpTmpRcElIdGNibHgwWEhSMllYSWdhU3dnYWl3Z2JDd2dkRzF3TENCd2JHRmpaVWh2YkdSbGNuTXNJR0Z5Y2x4dVhHNWNkRngwYVdZZ0tHSTJOQzVzWlc1bmRHZ2dKU0EwSUQ0Z01Da2dlMXh1WEhSY2RGeDBkR2h5YjNjZ2JtVjNJRVZ5Y205eUtDZEpiblpoYkdsa0lITjBjbWx1Wnk0Z1RHVnVaM1JvSUcxMWMzUWdZbVVnWVNCdGRXeDBhWEJzWlNCdlppQTBKeWxjYmx4MFhIUjlYRzVjYmx4MFhIUXZMeUIwYUdVZ2JuVnRZbVZ5SUc5bUlHVnhkV0ZzSUhOcFoyNXpJQ2h3YkdGalpTQm9iMnhrWlhKektWeHVYSFJjZEM4dklHbG1JSFJvWlhKbElHRnlaU0IwZDI4Z2NHeGhZMlZvYjJ4a1pYSnpMQ0IwYUdGdUlIUm9aU0IwZDI4Z1kyaGhjbUZqZEdWeWN5QmlaV1p2Y21VZ2FYUmNibHgwWEhRdkx5QnlaWEJ5WlhObGJuUWdiMjVsSUdKNWRHVmNibHgwWEhRdkx5QnBaaUIwYUdWeVpTQnBjeUJ2Ym14NUlHOXVaU3dnZEdobGJpQjBhR1VnZEdoeVpXVWdZMmhoY21GamRHVnljeUJpWldadmNtVWdhWFFnY21Wd2NtVnpaVzUwSURJZ1lubDBaWE5jYmx4MFhIUXZMeUIwYUdseklHbHpJR3AxYzNRZ1lTQmphR1ZoY0NCb1lXTnJJSFJ2SUc1dmRDQmtieUJwYm1SbGVFOW1JSFIzYVdObFhHNWNkRngwZG1GeUlHeGxiaUE5SUdJMk5DNXNaVzVuZEdoY2JseDBYSFJ3YkdGalpVaHZiR1JsY25NZ1BTQW5QU2NnUFQwOUlHSTJOQzVqYUdGeVFYUW9iR1Z1SUMwZ01pa2dQeUF5SURvZ0p6MG5JRDA5UFNCaU5qUXVZMmhoY2tGMEtHeGxiaUF0SURFcElEOGdNU0E2SURCY2JseHVYSFJjZEM4dklHSmhjMlUyTkNCcGN5QTBMek1nS3lCMWNDQjBieUIwZDI4Z1kyaGhjbUZqZEdWeWN5QnZaaUIwYUdVZ2IzSnBaMmx1WVd3Z1pHRjBZVnh1WEhSY2RHRnljaUE5SUc1bGR5QkJjbklvWWpZMExteGxibWQwYUNBcUlETWdMeUEwSUMwZ2NHeGhZMlZJYjJ4a1pYSnpLVnh1WEc1Y2RGeDBMeThnYVdZZ2RHaGxjbVVnWVhKbElIQnNZV05sYUc5c1pHVnljeXdnYjI1c2VTQm5aWFFnZFhBZ2RHOGdkR2hsSUd4aGMzUWdZMjl0Y0d4bGRHVWdOQ0JqYUdGeWMxeHVYSFJjZEd3Z1BTQndiR0ZqWlVodmJHUmxjbk1nUGlBd0lEOGdZalkwTG14bGJtZDBhQ0F0SURRZ09pQmlOalF1YkdWdVozUm9YRzVjYmx4MFhIUjJZWElnVENBOUlEQmNibHh1WEhSY2RHWjFibU4wYVc5dUlIQjFjMmdnS0hZcElIdGNibHgwWEhSY2RHRnljbHRNS3l0ZElEMGdkbHh1WEhSY2RIMWNibHh1WEhSY2RHWnZjaUFvYVNBOUlEQXNJR29nUFNBd095QnBJRHdnYkRzZ2FTQXJQU0EwTENCcUlDczlJRE1wSUh0Y2JseDBYSFJjZEhSdGNDQTlJQ2hrWldOdlpHVW9ZalkwTG1Ob1lYSkJkQ2hwS1NrZ1BEd2dNVGdwSUh3Z0tHUmxZMjlrWlNoaU5qUXVZMmhoY2tGMEtHa2dLeUF4S1NrZ1BEd2dNVElwSUh3Z0tHUmxZMjlrWlNoaU5qUXVZMmhoY2tGMEtHa2dLeUF5S1NrZ1BEd2dOaWtnZkNCa1pXTnZaR1VvWWpZMExtTm9ZWEpCZENocElDc2dNeWtwWEc1Y2RGeDBYSFJ3ZFhOb0tDaDBiWEFnSmlBd2VFWkdNREF3TUNrZ1BqNGdNVFlwWEc1Y2RGeDBYSFJ3ZFhOb0tDaDBiWEFnSmlBd2VFWkdNREFwSUQ0K0lEZ3BYRzVjZEZ4MFhIUndkWE5vS0hSdGNDQW1JREI0UmtZcFhHNWNkRngwZlZ4dVhHNWNkRngwYVdZZ0tIQnNZV05sU0c5c1pHVnljeUE5UFQwZ01pa2dlMXh1WEhSY2RGeDBkRzF3SUQwZ0tHUmxZMjlrWlNoaU5qUXVZMmhoY2tGMEtHa3BLU0E4UENBeUtTQjhJQ2hrWldOdlpHVW9ZalkwTG1Ob1lYSkJkQ2hwSUNzZ01Ta3BJRDQrSURRcFhHNWNkRngwWEhSd2RYTm9LSFJ0Y0NBbUlEQjRSa1lwWEc1Y2RGeDBmU0JsYkhObElHbG1JQ2h3YkdGalpVaHZiR1JsY25NZ1BUMDlJREVwSUh0Y2JseDBYSFJjZEhSdGNDQTlJQ2hrWldOdlpHVW9ZalkwTG1Ob1lYSkJkQ2hwS1NrZ1BEd2dNVEFwSUh3Z0tHUmxZMjlrWlNoaU5qUXVZMmhoY2tGMEtHa2dLeUF4S1NrZ1BEd2dOQ2tnZkNBb1pHVmpiMlJsS0dJMk5DNWphR0Z5UVhRb2FTQXJJRElwS1NBK1BpQXlLVnh1WEhSY2RGeDBjSFZ6YUNnb2RHMXdJRDQrSURncElDWWdNSGhHUmlsY2JseDBYSFJjZEhCMWMyZ29kRzF3SUNZZ01IaEdSaWxjYmx4MFhIUjlYRzVjYmx4MFhIUnlaWFIxY200Z1lYSnlYRzVjZEgxY2JseHVYSFJtZFc1amRHbHZiaUIxYVc1ME9GUnZRbUZ6WlRZMElDaDFhVzUwT0NrZ2UxeHVYSFJjZEhaaGNpQnBMRnh1WEhSY2RGeDBaWGgwY21GQ2VYUmxjeUE5SUhWcGJuUTRMbXhsYm1kMGFDQWxJRE1zSUM4dklHbG1JSGRsSUdoaGRtVWdNU0JpZVhSbElHeGxablFzSUhCaFpDQXlJR0o1ZEdWelhHNWNkRngwWEhSdmRYUndkWFFnUFNCY0lsd2lMRnh1WEhSY2RGeDBkR1Z0Y0N3Z2JHVnVaM1JvWEc1Y2JseDBYSFJtZFc1amRHbHZiaUJsYm1OdlpHVWdLRzUxYlNrZ2UxeHVYSFJjZEZ4MGNtVjBkWEp1SUd4dmIydDFjQzVqYUdGeVFYUW9iblZ0S1Z4dVhIUmNkSDFjYmx4dVhIUmNkR1oxYm1OMGFXOXVJSFJ5YVhCc1pYUlViMEpoYzJVMk5DQW9iblZ0S1NCN1hHNWNkRngwWEhSeVpYUjFjbTRnWlc1amIyUmxLRzUxYlNBK1BpQXhPQ0FtSURCNE0wWXBJQ3NnWlc1amIyUmxLRzUxYlNBK1BpQXhNaUFtSURCNE0wWXBJQ3NnWlc1amIyUmxLRzUxYlNBK1BpQTJJQ1lnTUhnelJpa2dLeUJsYm1OdlpHVW9iblZ0SUNZZ01IZ3pSaWxjYmx4MFhIUjlYRzVjYmx4MFhIUXZMeUJuYnlCMGFISnZkV2RvSUhSb1pTQmhjbkpoZVNCbGRtVnllU0IwYUhKbFpTQmllWFJsY3l3Z2QyVW5iR3dnWkdWaGJDQjNhWFJvSUhSeVlXbHNhVzVuSUhOMGRXWm1JR3hoZEdWeVhHNWNkRngwWm05eUlDaHBJRDBnTUN3Z2JHVnVaM1JvSUQwZ2RXbHVkRGd1YkdWdVozUm9JQzBnWlhoMGNtRkNlWFJsY3pzZ2FTQThJR3hsYm1kMGFEc2dhU0FyUFNBektTQjdYRzVjZEZ4MFhIUjBaVzF3SUQwZ0tIVnBiblE0VzJsZElEdzhJREUyS1NBcklDaDFhVzUwT0Z0cElDc2dNVjBnUER3Z09Da2dLeUFvZFdsdWREaGJhU0FySURKZEtWeHVYSFJjZEZ4MGIzVjBjSFYwSUNzOUlIUnlhWEJzWlhSVWIwSmhjMlUyTkNoMFpXMXdLVnh1WEhSY2RIMWNibHh1WEhSY2RDOHZJSEJoWkNCMGFHVWdaVzVrSUhkcGRHZ2dlbVZ5YjNNc0lHSjFkQ0J0WVd0bElITjFjbVVnZEc4Z2JtOTBJR1p2Y21kbGRDQjBhR1VnWlhoMGNtRWdZbmwwWlhOY2JseDBYSFJ6ZDJsMFkyZ2dLR1Y0ZEhKaFFubDBaWE1wSUh0Y2JseDBYSFJjZEdOaGMyVWdNVHBjYmx4MFhIUmNkRngwZEdWdGNDQTlJSFZwYm5RNFczVnBiblE0TG14bGJtZDBhQ0F0SURGZFhHNWNkRngwWEhSY2RHOTFkSEIxZENBclBTQmxibU52WkdVb2RHVnRjQ0ErUGlBeUtWeHVYSFJjZEZ4MFhIUnZkWFJ3ZFhRZ0t6MGdaVzVqYjJSbEtDaDBaVzF3SUR3OElEUXBJQ1lnTUhnelJpbGNibHgwWEhSY2RGeDBiM1YwY0hWMElDczlJQ2M5UFNkY2JseDBYSFJjZEZ4MFluSmxZV3RjYmx4MFhIUmNkR05oYzJVZ01qcGNibHgwWEhSY2RGeDBkR1Z0Y0NBOUlDaDFhVzUwT0Z0MWFXNTBPQzVzWlc1bmRHZ2dMU0F5WFNBOFBDQTRLU0FySUNoMWFXNTBPRnQxYVc1ME9DNXNaVzVuZEdnZ0xTQXhYU2xjYmx4MFhIUmNkRngwYjNWMGNIVjBJQ3M5SUdWdVkyOWtaU2gwWlcxd0lENCtJREV3S1Z4dVhIUmNkRngwWEhSdmRYUndkWFFnS3owZ1pXNWpiMlJsS0NoMFpXMXdJRDQrSURRcElDWWdNSGd6UmlsY2JseDBYSFJjZEZ4MGIzVjBjSFYwSUNzOUlHVnVZMjlrWlNnb2RHVnRjQ0E4UENBeUtTQW1JREI0TTBZcFhHNWNkRngwWEhSY2RHOTFkSEIxZENBclBTQW5QU2RjYmx4MFhIUmNkRngwWW5KbFlXdGNibHgwWEhSOVhHNWNibHgwWEhSeVpYUjFjbTRnYjNWMGNIVjBYRzVjZEgxY2JseHVYSFJsZUhCdmNuUnpMblJ2UW5sMFpVRnljbUY1SUQwZ1lqWTBWRzlDZVhSbFFYSnlZWGxjYmx4MFpYaHdiM0owY3k1bWNtOXRRbmwwWlVGeWNtRjVJRDBnZFdsdWREaFViMEpoYzJVMk5GeHVmU2gwZVhCbGIyWWdaWGh3YjNKMGN5QTlQVDBnSjNWdVpHVm1hVzVsWkNjZ1B5QW9kR2hwY3k1aVlYTmxOalJxY3lBOUlIdDlLU0E2SUdWNGNHOXlkSE1wS1Z4dVhHNTlLUzVqWVd4c0tIUm9hWE1zY21WeGRXbHlaU2hjSW1VdlZTczVOMXdpS1N4MGVYQmxiMllnYzJWc1ppQWhQVDBnWENKMWJtUmxabWx1WldSY0lpQS9JSE5sYkdZZ09pQjBlWEJsYjJZZ2QybHVaRzkzSUNFOVBTQmNJblZ1WkdWbWFXNWxaRndpSUQ4Z2QybHVaRzkzSURvZ2UzMHNjbVZ4ZFdseVpTaGNJbUoxWm1abGNsd2lLUzVDZFdabVpYSXNZWEpuZFcxbGJuUnpXek5kTEdGeVozVnRaVzUwYzFzMFhTeGhjbWQxYldWdWRITmJOVjBzWVhKbmRXMWxiblJ6V3paZExGd2lMeTR1WEZ4Y1hDNHVYRnhjWEc1dlpHVmZiVzlrZFd4bGMxeGNYRnhpWVhObE5qUXRhbk5jWEZ4Y2JHbGlYRnhjWEdJMk5DNXFjMXdpTEZ3aUx5NHVYRnhjWEM0dVhGeGNYRzV2WkdWZmJXOWtkV3hsYzF4Y1hGeGlZWE5sTmpRdGFuTmNYRnhjYkdsaVhDSXBJaXdpS0daMWJtTjBhVzl1SUNod2NtOWpaWE56TEdkc2IySmhiQ3hDZFdabVpYSXNYMTloY21kMWJXVnVkREFzWDE5aGNtZDFiV1Z1ZERFc1gxOWhjbWQxYldWdWRESXNYMTloY21kMWJXVnVkRE1zWDE5bWFXeGxibUZ0WlN4ZlgyUnBjbTVoYldVcGUxeHVMeW9oWEc0Z0tpQlVhR1VnWW5WbVptVnlJRzF2WkhWc1pTQm1jbTl0SUc1dlpHVXVhbk1zSUdadmNpQjBhR1VnWW5KdmQzTmxjaTVjYmlBcVhHNGdLaUJBWVhWMGFHOXlJQ0FnUm1WeWIzTnpJRUZpYjNWcmFHRmthV3BsYUNBOFptVnliM056UUdabGNtOXpjeTV2Y21jK0lEeG9kSFJ3T2k4dlptVnliM056TG05eVp6NWNiaUFxSUVCc2FXTmxibk5sSUNCTlNWUmNiaUFxTDF4dVhHNTJZWElnWW1GelpUWTBJRDBnY21WeGRXbHlaU2duWW1GelpUWTBMV3B6SnlsY2JuWmhjaUJwWldWbE56VTBJRDBnY21WeGRXbHlaU2duYVdWbFpUYzFOQ2NwWEc1Y2JtVjRjRzl5ZEhNdVFuVm1abVZ5SUQwZ1FuVm1abVZ5WEc1bGVIQnZjblJ6TGxOc2IzZENkV1ptWlhJZ1BTQkNkV1ptWlhKY2JtVjRjRzl5ZEhNdVNVNVRVRVZEVkY5TlFWaGZRbGxVUlZNZ1BTQTFNRnh1UW5WbVptVnlMbkJ2YjJ4VGFYcGxJRDBnT0RFNU1seHVYRzR2S2lwY2JpQXFJRWxtSUdCQ2RXWm1aWEl1WDNWelpWUjVjR1ZrUVhKeVlYbHpZRHBjYmlBcUlDQWdQVDA5SUhSeWRXVWdJQ0FnVlhObElGVnBiblE0UVhKeVlYa2dhVzF3YkdWdFpXNTBZWFJwYjI0Z0tHWmhjM1JsYzNRcFhHNGdLaUFnSUQwOVBTQm1ZV3h6WlNBZ0lGVnpaU0JQWW1wbFkzUWdhVzF3YkdWdFpXNTBZWFJwYjI0Z0tHTnZiWEJoZEdsaWJHVWdaRzkzYmlCMGJ5QkpSVFlwWEc0Z0tpOWNia0oxWm1abGNpNWZkWE5sVkhsd1pXUkJjbkpoZVhNZ1BTQW9ablZ1WTNScGIyNGdLQ2tnZTF4dUlDQXZMeUJFWlhSbFkzUWdhV1lnWW5KdmQzTmxjaUJ6ZFhCd2IzSjBjeUJVZVhCbFpDQkJjbkpoZVhNdUlGTjFjSEJ2Y25SbFpDQmljbTkzYzJWeWN5QmhjbVVnU1VVZ01UQXJMQ0JHYVhKbFptOTRJRFFyTEZ4dUlDQXZMeUJEYUhKdmJXVWdOeXNzSUZOaFptRnlhU0ExTGpFckxDQlBjR1Z5WVNBeE1TNDJLeXdnYVU5VElEUXVNaXN1SUVsbUlIUm9aU0JpY205M2MyVnlJR1J2WlhNZ2JtOTBJSE4xY0hCdmNuUWdZV1JrYVc1blhHNGdJQzh2SUhCeWIzQmxjblJwWlhNZ2RHOGdZRlZwYm5RNFFYSnlZWGxnSUdsdWMzUmhibU5sY3l3Z2RHaGxiaUIwYUdGMEozTWdkR2hsSUhOaGJXVWdZWE1nYm04Z1lGVnBiblE0UVhKeVlYbGdJSE4xY0hCdmNuUmNiaUFnTHk4Z1ltVmpZWFZ6WlNCM1pTQnVaV1ZrSUhSdklHSmxJR0ZpYkdVZ2RHOGdZV1JrSUdGc2JDQjBhR1VnYm05a1pTQkNkV1ptWlhJZ1FWQkpJRzFsZEdodlpITXVJRlJvYVhNZ2FYTWdZVzRnYVhOemRXVmNiaUFnTHk4Z2FXNGdSbWx5WldadmVDQTBMVEk1TGlCT2IzY2dabWw0WldRNklHaDBkSEJ6T2k4dlluVm5lbWxzYkdFdWJXOTZhV3hzWVM1dmNtY3ZjMmh2ZDE5aWRXY3VZMmRwUDJsa1BUWTVOVFF6T0Z4dUlDQjBjbmtnZTF4dUlDQWdJSFpoY2lCaWRXWWdQU0J1WlhjZ1FYSnlZWGxDZFdabVpYSW9NQ2xjYmlBZ0lDQjJZWElnWVhKeUlEMGdibVYzSUZWcGJuUTRRWEp5WVhrb1luVm1LVnh1SUNBZ0lHRnljaTVtYjI4Z1BTQm1kVzVqZEdsdmJpQW9LU0I3SUhKbGRIVnliaUEwTWlCOVhHNGdJQ0FnY21WMGRYSnVJRFF5SUQwOVBTQmhjbkl1Wm05dktDa2dKaVpjYmlBZ0lDQWdJQ0FnZEhsd1pXOW1JR0Z5Y2k1emRXSmhjbkpoZVNBOVBUMGdKMloxYm1OMGFXOXVKeUF2THlCRGFISnZiV1VnT1MweE1DQnNZV05ySUdCemRXSmhjbkpoZVdCY2JpQWdmU0JqWVhSamFDQW9aU2tnZTF4dUlDQWdJSEpsZEhWeWJpQm1ZV3h6WlZ4dUlDQjlYRzU5S1NncFhHNWNiaThxS2x4dUlDb2dRMnhoYzNNNklFSjFabVpsY2x4dUlDb2dQVDA5UFQwOVBUMDlQVDA5UFZ4dUlDcGNiaUFxSUZSb1pTQkNkV1ptWlhJZ1kyOXVjM1J5ZFdOMGIzSWdjbVYwZFhKdWN5QnBibk4wWVc1alpYTWdiMllnWUZWcGJuUTRRWEp5WVhsZ0lIUm9ZWFFnWVhKbElHRjFaMjFsYm5SbFpGeHVJQ29nZDJsMGFDQm1kVzVqZEdsdmJpQndjbTl3WlhKMGFXVnpJR1p2Y2lCaGJHd2dkR2hsSUc1dlpHVWdZRUoxWm1abGNtQWdRVkJKSUdaMWJtTjBhVzl1Y3k0Z1YyVWdkWE5sWEc0Z0tpQmdWV2x1ZERoQmNuSmhlV0FnYzI4Z2RHaGhkQ0J6Y1hWaGNtVWdZbkpoWTJ0bGRDQnViM1JoZEdsdmJpQjNiM0pyY3lCaGN5QmxlSEJsWTNSbFpDQXRMU0JwZENCeVpYUjFjbTV6WEc0Z0tpQmhJSE5wYm1kc1pTQnZZM1JsZEM1Y2JpQXFYRzRnS2lCQ2VTQmhkV2R0Wlc1MGFXNW5JSFJvWlNCcGJuTjBZVzVqWlhNc0lIZGxJR05oYmlCaGRtOXBaQ0J0YjJScFpubHBibWNnZEdobElHQlZhVzUwT0VGeWNtRjVZRnh1SUNvZ2NISnZkRzkwZVhCbExseHVJQ292WEc1bWRXNWpkR2x2YmlCQ2RXWm1aWElnS0hOMVltcGxZM1FzSUdWdVkyOWthVzVuTENCdWIxcGxjbThwSUh0Y2JpQWdhV1lnS0NFb2RHaHBjeUJwYm5OMFlXNWpaVzltSUVKMVptWmxjaWtwWEc0Z0lDQWdjbVYwZFhKdUlHNWxkeUJDZFdabVpYSW9jM1ZpYW1WamRDd2daVzVqYjJScGJtY3NJRzV2V21WeWJ5bGNibHh1SUNCMllYSWdkSGx3WlNBOUlIUjVjR1Z2WmlCemRXSnFaV04wWEc1Y2JpQWdMeThnVjI5eWEyRnliM1Z1WkRvZ2JtOWtaU2R6SUdKaGMyVTJOQ0JwYlhCc1pXMWxiblJoZEdsdmJpQmhiR3h2ZDNNZ1ptOXlJRzV2Ymkxd1lXUmtaV1FnYzNSeWFXNW5jMXh1SUNBdkx5QjNhR2xzWlNCaVlYTmxOalF0YW5NZ1pHOWxjeUJ1YjNRdVhHNGdJR2xtSUNobGJtTnZaR2x1WnlBOVBUMGdKMkpoYzJVMk5DY2dKaVlnZEhsd1pTQTlQVDBnSjNOMGNtbHVaeWNwSUh0Y2JpQWdJQ0J6ZFdKcVpXTjBJRDBnYzNSeWFXNW5kSEpwYlNoemRXSnFaV04wS1Z4dUlDQWdJSGRvYVd4bElDaHpkV0pxWldOMExteGxibWQwYUNBbElEUWdJVDA5SURBcElIdGNiaUFnSUNBZ0lITjFZbXBsWTNRZ1BTQnpkV0pxWldOMElDc2dKejBuWEc0Z0lDQWdmVnh1SUNCOVhHNWNiaUFnTHk4Z1JtbHVaQ0IwYUdVZ2JHVnVaM1JvWEc0Z0lIWmhjaUJzWlc1bmRHaGNiaUFnYVdZZ0tIUjVjR1VnUFQwOUlDZHVkVzFpWlhJbktWeHVJQ0FnSUd4bGJtZDBhQ0E5SUdOdlpYSmpaU2h6ZFdKcVpXTjBLVnh1SUNCbGJITmxJR2xtSUNoMGVYQmxJRDA5UFNBbmMzUnlhVzVuSnlsY2JpQWdJQ0JzWlc1bmRHZ2dQU0JDZFdabVpYSXVZbmwwWlV4bGJtZDBhQ2h6ZFdKcVpXTjBMQ0JsYm1OdlpHbHVaeWxjYmlBZ1pXeHpaU0JwWmlBb2RIbHdaU0E5UFQwZ0oyOWlhbVZqZENjcFhHNGdJQ0FnYkdWdVozUm9JRDBnWTI5bGNtTmxLSE4xWW1wbFkzUXViR1Z1WjNSb0tTQXZMeUJoYzNOMWJXVWdkR2hoZENCdlltcGxZM1FnYVhNZ1lYSnlZWGt0YkdsclpWeHVJQ0JsYkhObFhHNGdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RHYVhKemRDQmhjbWQxYldWdWRDQnVaV1ZrY3lCMGJ5QmlaU0JoSUc1MWJXSmxjaXdnWVhKeVlYa2diM0lnYzNSeWFXNW5MaWNwWEc1Y2JpQWdkbUZ5SUdKMVpseHVJQ0JwWmlBb1FuVm1abVZ5TGw5MWMyVlVlWEJsWkVGeWNtRjVjeWtnZTF4dUlDQWdJQzh2SUZCeVpXWmxjbkpsWkRvZ1VtVjBkWEp1SUdGdUlHRjFaMjFsYm5SbFpDQmdWV2x1ZERoQmNuSmhlV0FnYVc1emRHRnVZMlVnWm05eUlHSmxjM1FnY0dWeVptOXliV0Z1WTJWY2JpQWdJQ0JpZFdZZ1BTQkNkV1ptWlhJdVgyRjFaMjFsYm5Rb2JtVjNJRlZwYm5RNFFYSnlZWGtvYkdWdVozUm9LU2xjYmlBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0F2THlCR1lXeHNZbUZqYXpvZ1VtVjBkWEp1SUZSSVNWTWdhVzV6ZEdGdVkyVWdiMllnUW5WbVptVnlJQ2hqY21WaGRHVmtJR0o1SUdCdVpYZGdLVnh1SUNBZ0lHSjFaaUE5SUhSb2FYTmNiaUFnSUNCaWRXWXViR1Z1WjNSb0lEMGdiR1Z1WjNSb1hHNGdJQ0FnWW5WbUxsOXBjMEoxWm1abGNpQTlJSFJ5ZFdWY2JpQWdmVnh1WEc0Z0lIWmhjaUJwWEc0Z0lHbG1JQ2hDZFdabVpYSXVYM1Z6WlZSNWNHVmtRWEp5WVhseklDWW1JSFI1Y0dWdlppQnpkV0pxWldOMExtSjVkR1ZNWlc1bmRHZ2dQVDA5SUNkdWRXMWlaWEluS1NCN1hHNGdJQ0FnTHk4Z1UzQmxaV1FnYjNCMGFXMXBlbUYwYVc5dUlDMHRJSFZ6WlNCelpYUWdhV1lnZDJVbmNtVWdZMjl3ZVdsdVp5Qm1jbTl0SUdFZ2RIbHdaV1FnWVhKeVlYbGNiaUFnSUNCaWRXWXVYM05sZENoemRXSnFaV04wS1Z4dUlDQjlJR1ZzYzJVZ2FXWWdLR2x6UVhKeVlYbHBjMmdvYzNWaWFtVmpkQ2twSUh0Y2JpQWdJQ0F2THlCVWNtVmhkQ0JoY25KaGVTMXBjMmdnYjJKcVpXTjBjeUJoY3lCaElHSjVkR1VnWVhKeVlYbGNiaUFnSUNCbWIzSWdLR2tnUFNBd095QnBJRHdnYkdWdVozUm9PeUJwS3lzcElIdGNiaUFnSUNBZ0lHbG1JQ2hDZFdabVpYSXVhWE5DZFdabVpYSW9jM1ZpYW1WamRDa3BYRzRnSUNBZ0lDQWdJR0oxWmx0cFhTQTlJSE4xWW1wbFkzUXVjbVZoWkZWSmJuUTRLR2twWEc0Z0lDQWdJQ0JsYkhObFhHNGdJQ0FnSUNBZ0lHSjFabHRwWFNBOUlITjFZbXBsWTNSYmFWMWNiaUFnSUNCOVhHNGdJSDBnWld4elpTQnBaaUFvZEhsd1pTQTlQVDBnSjNOMGNtbHVaeWNwSUh0Y2JpQWdJQ0JpZFdZdWQzSnBkR1VvYzNWaWFtVmpkQ3dnTUN3Z1pXNWpiMlJwYm1jcFhHNGdJSDBnWld4elpTQnBaaUFvZEhsd1pTQTlQVDBnSjI1MWJXSmxjaWNnSmlZZ0lVSjFabVpsY2k1ZmRYTmxWSGx3WldSQmNuSmhlWE1nSmlZZ0lXNXZXbVZ5YnlrZ2UxeHVJQ0FnSUdadmNpQW9hU0E5SURBN0lHa2dQQ0JzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUNBZ1luVm1XMmxkSUQwZ01GeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lISmxkSFZ5YmlCaWRXWmNibjFjYmx4dUx5OGdVMVJCVkVsRElFMUZWRWhQUkZOY2JpOHZJRDA5UFQwOVBUMDlQVDA5UFQwOVhHNWNia0oxWm1abGNpNXBjMFZ1WTI5a2FXNW5JRDBnWm5WdVkzUnBiMjRnS0dWdVkyOWthVzVuS1NCN1hHNGdJSE4zYVhSamFDQW9VM1J5YVc1bktHVnVZMjlrYVc1bktTNTBiMHh2ZDJWeVEyRnpaU2dwS1NCN1hHNGdJQ0FnWTJGelpTQW5hR1Y0SnpwY2JpQWdJQ0JqWVhObElDZDFkR1k0SnpwY2JpQWdJQ0JqWVhObElDZDFkR1l0T0NjNlhHNGdJQ0FnWTJGelpTQW5ZWE5qYVdrbk9seHVJQ0FnSUdOaGMyVWdKMkpwYm1GeWVTYzZYRzRnSUNBZ1kyRnpaU0FuWW1GelpUWTBKenBjYmlBZ0lDQmpZWE5sSUNkeVlYY25PbHh1SUNBZ0lHTmhjMlVnSjNWamN6SW5PbHh1SUNBZ0lHTmhjMlVnSjNWamN5MHlKenBjYmlBZ0lDQmpZWE5sSUNkMWRHWXhObXhsSnpwY2JpQWdJQ0JqWVhObElDZDFkR1l0TVRac1pTYzZYRzRnSUNBZ0lDQnlaWFIxY200Z2RISjFaVnh1SUNBZ0lHUmxabUYxYkhRNlhHNGdJQ0FnSUNCeVpYUjFjbTRnWm1Gc2MyVmNiaUFnZlZ4dWZWeHVYRzVDZFdabVpYSXVhWE5DZFdabVpYSWdQU0JtZFc1amRHbHZiaUFvWWlrZ2UxeHVJQ0J5WlhSMWNtNGdJU0VvWWlBaFBUMGdiblZzYkNBbUppQmlJQ0U5UFNCMWJtUmxabWx1WldRZ0ppWWdZaTVmYVhOQ2RXWm1aWElwWEc1OVhHNWNia0oxWm1abGNpNWllWFJsVEdWdVozUm9JRDBnWm5WdVkzUnBiMjRnS0hOMGNpd2daVzVqYjJScGJtY3BJSHRjYmlBZ2RtRnlJSEpsZEZ4dUlDQnpkSElnUFNCemRISWdLeUFuSjF4dUlDQnpkMmwwWTJnZ0tHVnVZMjlrYVc1bklIeDhJQ2QxZEdZNEp5a2dlMXh1SUNBZ0lHTmhjMlVnSjJobGVDYzZYRzRnSUNBZ0lDQnlaWFFnUFNCemRISXViR1Z1WjNSb0lDOGdNbHh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZDFkR1k0SnpwY2JpQWdJQ0JqWVhObElDZDFkR1l0T0NjNlhHNGdJQ0FnSUNCeVpYUWdQU0IxZEdZNFZHOUNlWFJsY3loemRISXBMbXhsYm1kMGFGeHVJQ0FnSUNBZ1luSmxZV3RjYmlBZ0lDQmpZWE5sSUNkaGMyTnBhU2M2WEc0Z0lDQWdZMkZ6WlNBblltbHVZWEo1SnpwY2JpQWdJQ0JqWVhObElDZHlZWGNuT2x4dUlDQWdJQ0FnY21WMElEMGdjM1J5TG14bGJtZDBhRnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZGlZWE5sTmpRbk9seHVJQ0FnSUNBZ2NtVjBJRDBnWW1GelpUWTBWRzlDZVhSbGN5aHpkSElwTG14bGJtZDBhRnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZDFZM015SnpwY2JpQWdJQ0JqWVhObElDZDFZM010TWljNlhHNGdJQ0FnWTJGelpTQW5kWFJtTVRac1pTYzZYRzRnSUNBZ1kyRnpaU0FuZFhSbUxURTJiR1VuT2x4dUlDQWdJQ0FnY21WMElEMGdjM1J5TG14bGJtZDBhQ0FxSURKY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1pHVm1ZWFZzZERwY2JpQWdJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduVlc1cmJtOTNiaUJsYm1OdlpHbHVaeWNwWEc0Z0lIMWNiaUFnY21WMGRYSnVJSEpsZEZ4dWZWeHVYRzVDZFdabVpYSXVZMjl1WTJGMElEMGdablZ1WTNScGIyNGdLR3hwYzNRc0lIUnZkR0ZzVEdWdVozUm9LU0I3WEc0Z0lHRnpjMlZ5ZENocGMwRnljbUY1S0d4cGMzUXBMQ0FuVlhOaFoyVTZJRUoxWm1abGNpNWpiMjVqWVhRb2JHbHpkQ3dnVzNSdmRHRnNUR1Z1WjNSb1hTbGNYRzRuSUN0Y2JpQWdJQ0FnSUNkc2FYTjBJSE5vYjNWc1pDQmlaU0JoYmlCQmNuSmhlUzRuS1Z4dVhHNGdJR2xtSUNoc2FYTjBMbXhsYm1kMGFDQTlQVDBnTUNrZ2UxeHVJQ0FnSUhKbGRIVnliaUJ1WlhjZ1FuVm1abVZ5S0RBcFhHNGdJSDBnWld4elpTQnBaaUFvYkdsemRDNXNaVzVuZEdnZ1BUMDlJREVwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdiR2x6ZEZzd1hWeHVJQ0I5WEc1Y2JpQWdkbUZ5SUdsY2JpQWdhV1lnS0hSNWNHVnZaaUIwYjNSaGJFeGxibWQwYUNBaFBUMGdKMjUxYldKbGNpY3BJSHRjYmlBZ0lDQjBiM1JoYkV4bGJtZDBhQ0E5SURCY2JpQWdJQ0JtYjNJZ0tHa2dQU0F3T3lCcElEd2diR2x6ZEM1c1pXNW5kR2c3SUdrckt5a2dlMXh1SUNBZ0lDQWdkRzkwWVd4TVpXNW5kR2dnS3owZ2JHbHpkRnRwWFM1c1pXNW5kR2hjYmlBZ0lDQjlYRzRnSUgxY2JseHVJQ0IyWVhJZ1luVm1JRDBnYm1WM0lFSjFabVpsY2loMGIzUmhiRXhsYm1kMGFDbGNiaUFnZG1GeUlIQnZjeUE5SURCY2JpQWdabTl5SUNocElEMGdNRHNnYVNBOElHeHBjM1F1YkdWdVozUm9PeUJwS3lzcElIdGNiaUFnSUNCMllYSWdhWFJsYlNBOUlHeHBjM1JiYVYxY2JpQWdJQ0JwZEdWdExtTnZjSGtvWW5WbUxDQndiM01wWEc0Z0lDQWdjRzl6SUNzOUlHbDBaVzB1YkdWdVozUm9YRzRnSUgxY2JpQWdjbVYwZFhKdUlHSjFabHh1ZlZ4dVhHNHZMeUJDVlVaR1JWSWdTVTVUVkVGT1EwVWdUVVZVU0U5RVUxeHVMeThnUFQwOVBUMDlQVDA5UFQwOVBUMDlQVDA5UFQwOVBUMWNibHh1Wm5WdVkzUnBiMjRnWDJobGVGZHlhWFJsSUNoaWRXWXNJSE4wY21sdVp5d2diMlptYzJWMExDQnNaVzVuZEdncElIdGNiaUFnYjJabWMyVjBJRDBnVG5WdFltVnlLRzltWm5ObGRDa2dmSHdnTUZ4dUlDQjJZWElnY21WdFlXbHVhVzVuSUQwZ1luVm1MbXhsYm1kMGFDQXRJRzltWm5ObGRGeHVJQ0JwWmlBb0lXeGxibWQwYUNrZ2UxeHVJQ0FnSUd4bGJtZDBhQ0E5SUhKbGJXRnBibWx1WjF4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUd4bGJtZDBhQ0E5SUU1MWJXSmxjaWhzWlc1bmRHZ3BYRzRnSUNBZ2FXWWdLR3hsYm1kMGFDQStJSEpsYldGcGJtbHVaeWtnZTF4dUlDQWdJQ0FnYkdWdVozUm9JRDBnY21WdFlXbHVhVzVuWEc0Z0lDQWdmVnh1SUNCOVhHNWNiaUFnTHk4Z2JYVnpkQ0JpWlNCaGJpQmxkbVZ1SUc1MWJXSmxjaUJ2WmlCa2FXZHBkSE5jYmlBZ2RtRnlJSE4wY2t4bGJpQTlJSE4wY21sdVp5NXNaVzVuZEdoY2JpQWdZWE56WlhKMEtITjBja3hsYmlBbElESWdQVDA5SURBc0lDZEpiblpoYkdsa0lHaGxlQ0J6ZEhKcGJtY25LVnh1WEc0Z0lHbG1JQ2hzWlc1bmRHZ2dQaUJ6ZEhKTVpXNGdMeUF5S1NCN1hHNGdJQ0FnYkdWdVozUm9JRDBnYzNSeVRHVnVJQzhnTWx4dUlDQjlYRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2JHVnVaM1JvT3lCcEt5c3BJSHRjYmlBZ0lDQjJZWElnWW5sMFpTQTlJSEJoY25ObFNXNTBLSE4wY21sdVp5NXpkV0p6ZEhJb2FTQXFJRElzSURJcExDQXhOaWxjYmlBZ0lDQmhjM05sY25Rb0lXbHpUbUZPS0dKNWRHVXBMQ0FuU1c1MllXeHBaQ0JvWlhnZ2MzUnlhVzVuSnlsY2JpQWdJQ0JpZFdaYmIyWm1jMlYwSUNzZ2FWMGdQU0JpZVhSbFhHNGdJSDFjYmlBZ1FuVm1abVZ5TGw5amFHRnljMWR5YVhSMFpXNGdQU0JwSUNvZ01seHVJQ0J5WlhSMWNtNGdhVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZkWFJtT0ZkeWFYUmxJQ2hpZFdZc0lITjBjbWx1Wnl3Z2IyWm1jMlYwTENCc1pXNW5kR2dwSUh0Y2JpQWdkbUZ5SUdOb1lYSnpWM0pwZEhSbGJpQTlJRUoxWm1abGNpNWZZMmhoY25OWGNtbDBkR1Z1SUQxY2JpQWdJQ0JpYkdsMFFuVm1abVZ5S0hWMFpqaFViMEo1ZEdWektITjBjbWx1Wnlrc0lHSjFaaXdnYjJabWMyVjBMQ0JzWlc1bmRHZ3BYRzRnSUhKbGRIVnliaUJqYUdGeWMxZHlhWFIwWlc1Y2JuMWNibHh1Wm5WdVkzUnBiMjRnWDJGelkybHBWM0pwZEdVZ0tHSjFaaXdnYzNSeWFXNW5MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDa2dlMXh1SUNCMllYSWdZMmhoY25OWGNtbDBkR1Z1SUQwZ1FuVm1abVZ5TGw5amFHRnljMWR5YVhSMFpXNGdQVnh1SUNBZ0lHSnNhWFJDZFdabVpYSW9ZWE5qYVdsVWIwSjVkR1Z6S0hOMGNtbHVaeWtzSUdKMVppd2diMlptYzJWMExDQnNaVzVuZEdncFhHNGdJSEpsZEhWeWJpQmphR0Z5YzFkeWFYUjBaVzVjYm4xY2JseHVablZ1WTNScGIyNGdYMkpwYm1GeWVWZHlhWFJsSUNoaWRXWXNJSE4wY21sdVp5d2diMlptYzJWMExDQnNaVzVuZEdncElIdGNiaUFnY21WMGRYSnVJRjloYzJOcGFWZHlhWFJsS0dKMVppd2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWDJKaGMyVTJORmR5YVhSbElDaGlkV1lzSUhOMGNtbHVaeXdnYjJabWMyVjBMQ0JzWlc1bmRHZ3BJSHRjYmlBZ2RtRnlJR05vWVhKelYzSnBkSFJsYmlBOUlFSjFabVpsY2k1ZlkyaGhjbk5YY21sMGRHVnVJRDFjYmlBZ0lDQmliR2wwUW5WbVptVnlLR0poYzJVMk5GUnZRbmwwWlhNb2MzUnlhVzVuS1N3Z1luVm1MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDbGNiaUFnY21WMGRYSnVJR05vWVhKelYzSnBkSFJsYmx4dWZWeHVYRzVtZFc1amRHbHZiaUJmZFhSbU1UWnNaVmR5YVhSbElDaGlkV1lzSUhOMGNtbHVaeXdnYjJabWMyVjBMQ0JzWlc1bmRHZ3BJSHRjYmlBZ2RtRnlJR05vWVhKelYzSnBkSFJsYmlBOUlFSjFabVpsY2k1ZlkyaGhjbk5YY21sMGRHVnVJRDFjYmlBZ0lDQmliR2wwUW5WbVptVnlLSFYwWmpFMmJHVlViMEo1ZEdWektITjBjbWx1Wnlrc0lHSjFaaXdnYjJabWMyVjBMQ0JzWlc1bmRHZ3BYRzRnSUhKbGRIVnliaUJqYUdGeWMxZHlhWFIwWlc1Y2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzUzY21sMFpTQTlJR1oxYm1OMGFXOXVJQ2h6ZEhKcGJtY3NJRzltWm5ObGRDd2diR1Z1WjNSb0xDQmxibU52WkdsdVp5a2dlMXh1SUNBdkx5QlRkWEJ3YjNKMElHSnZkR2dnS0hOMGNtbHVaeXdnYjJabWMyVjBMQ0JzWlc1bmRHZ3NJR1Z1WTI5a2FXNW5LVnh1SUNBdkx5QmhibVFnZEdobElHeGxaMkZqZVNBb2MzUnlhVzVuTENCbGJtTnZaR2x1Wnl3Z2IyWm1jMlYwTENCc1pXNW5kR2dwWEc0Z0lHbG1JQ2hwYzBacGJtbDBaU2h2Wm1aelpYUXBLU0I3WEc0Z0lDQWdhV1lnS0NGcGMwWnBibWwwWlNoc1pXNW5kR2dwS1NCN1hHNGdJQ0FnSUNCbGJtTnZaR2x1WnlBOUlHeGxibWQwYUZ4dUlDQWdJQ0FnYkdWdVozUm9JRDBnZFc1a1pXWnBibVZrWEc0Z0lDQWdmVnh1SUNCOUlHVnNjMlVnZXlBZ0x5OGdiR1ZuWVdONVhHNGdJQ0FnZG1GeUlITjNZWEFnUFNCbGJtTnZaR2x1WjF4dUlDQWdJR1Z1WTI5a2FXNW5JRDBnYjJabWMyVjBYRzRnSUNBZ2IyWm1jMlYwSUQwZ2JHVnVaM1JvWEc0Z0lDQWdiR1Z1WjNSb0lEMGdjM2RoY0Z4dUlDQjlYRzVjYmlBZ2IyWm1jMlYwSUQwZ1RuVnRZbVZ5S0c5bVpuTmxkQ2tnZkh3Z01GeHVJQ0IyWVhJZ2NtVnRZV2x1YVc1bklEMGdkR2hwY3k1c1pXNW5kR2dnTFNCdlptWnpaWFJjYmlBZ2FXWWdLQ0ZzWlc1bmRHZ3BJSHRjYmlBZ0lDQnNaVzVuZEdnZ1BTQnlaVzFoYVc1cGJtZGNiaUFnZlNCbGJITmxJSHRjYmlBZ0lDQnNaVzVuZEdnZ1BTQk9kVzFpWlhJb2JHVnVaM1JvS1Z4dUlDQWdJR2xtSUNoc1pXNW5kR2dnUGlCeVpXMWhhVzVwYm1jcElIdGNiaUFnSUNBZ0lHeGxibWQwYUNBOUlISmxiV0ZwYm1sdVoxeHVJQ0FnSUgxY2JpQWdmVnh1SUNCbGJtTnZaR2x1WnlBOUlGTjBjbWx1WnlobGJtTnZaR2x1WnlCOGZDQW5kWFJtT0NjcExuUnZURzkzWlhKRFlYTmxLQ2xjYmx4dUlDQjJZWElnY21WMFhHNGdJSE4zYVhSamFDQW9aVzVqYjJScGJtY3BJSHRjYmlBZ0lDQmpZWE5sSUNkb1pYZ25PbHh1SUNBZ0lDQWdjbVYwSUQwZ1gyaGxlRmR5YVhSbEtIUm9hWE1zSUhOMGNtbHVaeXdnYjJabWMyVjBMQ0JzWlc1bmRHZ3BYRzRnSUNBZ0lDQmljbVZoYTF4dUlDQWdJR05oYzJVZ0ozVjBaamduT2x4dUlDQWdJR05oYzJVZ0ozVjBaaTA0SnpwY2JpQWdJQ0FnSUhKbGRDQTlJRjkxZEdZNFYzSnBkR1VvZEdocGN5d2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1kyRnpaU0FuWVhOamFXa25PbHh1SUNBZ0lDQWdjbVYwSUQwZ1gyRnpZMmxwVjNKcGRHVW9kR2hwY3l3Z2MzUnlhVzVuTENCdlptWnpaWFFzSUd4bGJtZDBhQ2xjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWTJGelpTQW5ZbWx1WVhKNUp6cGNiaUFnSUNBZ0lISmxkQ0E5SUY5aWFXNWhjbmxYY21sMFpTaDBhR2x6TENCemRISnBibWNzSUc5bVpuTmxkQ3dnYkdWdVozUm9LVnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZGlZWE5sTmpRbk9seHVJQ0FnSUNBZ2NtVjBJRDBnWDJKaGMyVTJORmR5YVhSbEtIUm9hWE1zSUhOMGNtbHVaeXdnYjJabWMyVjBMQ0JzWlc1bmRHZ3BYRzRnSUNBZ0lDQmljbVZoYTF4dUlDQWdJR05oYzJVZ0ozVmpjekluT2x4dUlDQWdJR05oYzJVZ0ozVmpjeTB5SnpwY2JpQWdJQ0JqWVhObElDZDFkR1l4Tm14bEp6cGNiaUFnSUNCallYTmxJQ2QxZEdZdE1UWnNaU2M2WEc0Z0lDQWdJQ0J5WlhRZ1BTQmZkWFJtTVRac1pWZHlhWFJsS0hSb2FYTXNJSE4wY21sdVp5d2diMlptYzJWMExDQnNaVzVuZEdncFhHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHUmxabUYxYkhRNlhHNGdJQ0FnSUNCMGFISnZkeUJ1WlhjZ1JYSnliM0lvSjFWdWEyNXZkMjRnWlc1amIyUnBibWNuS1Z4dUlDQjlYRzRnSUhKbGRIVnliaUJ5WlhSY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzUwYjFOMGNtbHVaeUE5SUdaMWJtTjBhVzl1SUNobGJtTnZaR2x1Wnl3Z2MzUmhjblFzSUdWdVpDa2dlMXh1SUNCMllYSWdjMlZzWmlBOUlIUm9hWE5jYmx4dUlDQmxibU52WkdsdVp5QTlJRk4wY21sdVp5aGxibU52WkdsdVp5QjhmQ0FuZFhSbU9DY3BMblJ2VEc5M1pYSkRZWE5sS0NsY2JpQWdjM1JoY25RZ1BTQk9kVzFpWlhJb2MzUmhjblFwSUh4OElEQmNiaUFnWlc1a0lEMGdLR1Z1WkNBaFBUMGdkVzVrWldacGJtVmtLVnh1SUNBZ0lEOGdUblZ0WW1WeUtHVnVaQ2xjYmlBZ0lDQTZJR1Z1WkNBOUlITmxiR1l1YkdWdVozUm9YRzVjYmlBZ0x5OGdSbUZ6ZEhCaGRHZ2daVzF3ZEhrZ2MzUnlhVzVuYzF4dUlDQnBaaUFvWlc1a0lEMDlQU0J6ZEdGeWRDbGNiaUFnSUNCeVpYUjFjbTRnSnlkY2JseHVJQ0IyWVhJZ2NtVjBYRzRnSUhOM2FYUmphQ0FvWlc1amIyUnBibWNwSUh0Y2JpQWdJQ0JqWVhObElDZG9aWGduT2x4dUlDQWdJQ0FnY21WMElEMGdYMmhsZUZOc2FXTmxLSE5sYkdZc0lITjBZWEowTENCbGJtUXBYRzRnSUNBZ0lDQmljbVZoYTF4dUlDQWdJR05oYzJVZ0ozVjBaamduT2x4dUlDQWdJR05oYzJVZ0ozVjBaaTA0SnpwY2JpQWdJQ0FnSUhKbGRDQTlJRjkxZEdZNFUyeHBZMlVvYzJWc1ppd2djM1JoY25Rc0lHVnVaQ2xjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWTJGelpTQW5ZWE5qYVdrbk9seHVJQ0FnSUNBZ2NtVjBJRDBnWDJGelkybHBVMnhwWTJVb2MyVnNaaXdnYzNSaGNuUXNJR1Z1WkNsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1kyRnpaU0FuWW1sdVlYSjVKenBjYmlBZ0lDQWdJSEpsZENBOUlGOWlhVzVoY25sVGJHbGpaU2h6Wld4bUxDQnpkR0Z5ZEN3Z1pXNWtLVnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZGlZWE5sTmpRbk9seHVJQ0FnSUNBZ2NtVjBJRDBnWDJKaGMyVTJORk5zYVdObEtITmxiR1lzSUhOMFlYSjBMQ0JsYm1RcFhHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjNWamN6SW5PbHh1SUNBZ0lHTmhjMlVnSjNWamN5MHlKenBjYmlBZ0lDQmpZWE5sSUNkMWRHWXhObXhsSnpwY2JpQWdJQ0JqWVhObElDZDFkR1l0TVRac1pTYzZYRzRnSUNBZ0lDQnlaWFFnUFNCZmRYUm1NVFpzWlZOc2FXTmxLSE5sYkdZc0lITjBZWEowTENCbGJtUXBYRzRnSUNBZ0lDQmljbVZoYTF4dUlDQWdJR1JsWm1GMWJIUTZYRzRnSUNBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0oxVnVhMjV2ZDI0Z1pXNWpiMlJwYm1jbktWeHVJQ0I5WEc0Z0lISmxkSFZ5YmlCeVpYUmNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1MGIwcFRUMDRnUFNCbWRXNWpkR2x2YmlBb0tTQjdYRzRnSUhKbGRIVnliaUI3WEc0Z0lDQWdkSGx3WlRvZ0owSjFabVpsY2ljc1hHNGdJQ0FnWkdGMFlUb2dRWEp5WVhrdWNISnZkRzkwZVhCbExuTnNhV05sTG1OaGJHd29kR2hwY3k1ZllYSnlJSHg4SUhSb2FYTXNJREFwWEc0Z0lIMWNibjFjYmx4dUx5OGdZMjl3ZVNoMFlYSm5aWFJDZFdabVpYSXNJSFJoY21kbGRGTjBZWEowUFRBc0lITnZkWEpqWlZOMFlYSjBQVEFzSUhOdmRYSmpaVVZ1WkQxaWRXWm1aWEl1YkdWdVozUm9LVnh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzVqYjNCNUlEMGdablZ1WTNScGIyNGdLSFJoY21kbGRDd2dkR0Z5WjJWMFgzTjBZWEowTENCemRHRnlkQ3dnWlc1a0tTQjdYRzRnSUhaaGNpQnpiM1Z5WTJVZ1BTQjBhR2x6WEc1Y2JpQWdhV1lnS0NGemRHRnlkQ2tnYzNSaGNuUWdQU0F3WEc0Z0lHbG1JQ2doWlc1a0lDWW1JR1Z1WkNBaFBUMGdNQ2tnWlc1a0lEMGdkR2hwY3k1c1pXNW5kR2hjYmlBZ2FXWWdLQ0YwWVhKblpYUmZjM1JoY25RcElIUmhjbWRsZEY5emRHRnlkQ0E5SURCY2JseHVJQ0F2THlCRGIzQjVJREFnWW5sMFpYTTdJSGRsSjNKbElHUnZibVZjYmlBZ2FXWWdLR1Z1WkNBOVBUMGdjM1JoY25RcElISmxkSFZ5Ymx4dUlDQnBaaUFvZEdGeVoyVjBMbXhsYm1kMGFDQTlQVDBnTUNCOGZDQnpiM1Z5WTJVdWJHVnVaM1JvSUQwOVBTQXdLU0J5WlhSMWNtNWNibHh1SUNBdkx5QkdZWFJoYkNCbGNuSnZjaUJqYjI1a2FYUnBiMjV6WEc0Z0lHRnpjMlZ5ZENobGJtUWdQajBnYzNSaGNuUXNJQ2R6YjNWeVkyVkZibVFnUENCemIzVnlZMlZUZEdGeWRDY3BYRzRnSUdGemMyVnlkQ2gwWVhKblpYUmZjM1JoY25RZ1BqMGdNQ0FtSmlCMFlYSm5aWFJmYzNSaGNuUWdQQ0IwWVhKblpYUXViR1Z1WjNSb0xGeHVJQ0FnSUNBZ0ozUmhjbWRsZEZOMFlYSjBJRzkxZENCdlppQmliM1Z1WkhNbktWeHVJQ0JoYzNObGNuUW9jM1JoY25RZ1BqMGdNQ0FtSmlCemRHRnlkQ0E4SUhOdmRYSmpaUzVzWlc1bmRHZ3NJQ2R6YjNWeVkyVlRkR0Z5ZENCdmRYUWdiMllnWW05MWJtUnpKeWxjYmlBZ1lYTnpaWEowS0dWdVpDQStQU0F3SUNZbUlHVnVaQ0E4UFNCemIzVnlZMlV1YkdWdVozUm9MQ0FuYzI5MWNtTmxSVzVrSUc5MWRDQnZaaUJpYjNWdVpITW5LVnh1WEc0Z0lDOHZJRUZ5WlNCM1pTQnZiMkkvWEc0Z0lHbG1JQ2hsYm1RZ1BpQjBhR2x6TG14bGJtZDBhQ2xjYmlBZ0lDQmxibVFnUFNCMGFHbHpMbXhsYm1kMGFGeHVJQ0JwWmlBb2RHRnlaMlYwTG14bGJtZDBhQ0F0SUhSaGNtZGxkRjl6ZEdGeWRDQThJR1Z1WkNBdElITjBZWEowS1Z4dUlDQWdJR1Z1WkNBOUlIUmhjbWRsZEM1c1pXNW5kR2dnTFNCMFlYSm5aWFJmYzNSaGNuUWdLeUJ6ZEdGeWRGeHVYRzRnSUhaaGNpQnNaVzRnUFNCbGJtUWdMU0J6ZEdGeWRGeHVYRzRnSUdsbUlDaHNaVzRnUENBeE1EQWdmSHdnSVVKMVptWmxjaTVmZFhObFZIbHdaV1JCY25KaGVYTXBJSHRjYmlBZ0lDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJR3hsYmpzZ2FTc3JLVnh1SUNBZ0lDQWdkR0Z5WjJWMFcya2dLeUIwWVhKblpYUmZjM1JoY25SZElEMGdkR2hwYzF0cElDc2djM1JoY25SZFhHNGdJSDBnWld4elpTQjdYRzRnSUNBZ2RHRnlaMlYwTGw5elpYUW9kR2hwY3k1emRXSmhjbkpoZVNoemRHRnlkQ3dnYzNSaGNuUWdLeUJzWlc0cExDQjBZWEpuWlhSZmMzUmhjblFwWEc0Z0lIMWNibjFjYmx4dVpuVnVZM1JwYjI0Z1gySmhjMlUyTkZOc2FXTmxJQ2hpZFdZc0lITjBZWEowTENCbGJtUXBJSHRjYmlBZ2FXWWdLSE4wWVhKMElEMDlQU0F3SUNZbUlHVnVaQ0E5UFQwZ1luVm1MbXhsYm1kMGFDa2dlMXh1SUNBZ0lISmxkSFZ5YmlCaVlYTmxOalF1Wm5KdmJVSjVkR1ZCY25KaGVTaGlkV1lwWEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnY21WMGRYSnVJR0poYzJVMk5DNW1jbTl0UW5sMFpVRnljbUY1S0dKMVppNXpiR2xqWlNoemRHRnlkQ3dnWlc1a0tTbGNiaUFnZlZ4dWZWeHVYRzVtZFc1amRHbHZiaUJmZFhSbU9GTnNhV05sSUNoaWRXWXNJSE4wWVhKMExDQmxibVFwSUh0Y2JpQWdkbUZ5SUhKbGN5QTlJQ2NuWEc0Z0lIWmhjaUIwYlhBZ1BTQW5KMXh1SUNCbGJtUWdQU0JOWVhSb0xtMXBiaWhpZFdZdWJHVnVaM1JvTENCbGJtUXBYRzVjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJSE4wWVhKME95QnBJRHdnWlc1a095QnBLeXNwSUh0Y2JpQWdJQ0JwWmlBb1luVm1XMmxkSUR3OUlEQjROMFlwSUh0Y2JpQWdJQ0FnSUhKbGN5QXJQU0JrWldOdlpHVlZkR1k0UTJoaGNpaDBiWEFwSUNzZ1UzUnlhVzVuTG1aeWIyMURhR0Z5UTI5a1pTaGlkV1piYVYwcFhHNGdJQ0FnSUNCMGJYQWdQU0FuSjF4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQjBiWEFnS3owZ0p5VW5JQ3NnWW5WbVcybGRMblJ2VTNSeWFXNW5LREUyS1Z4dUlDQWdJSDFjYmlBZ2ZWeHVYRzRnSUhKbGRIVnliaUJ5WlhNZ0t5QmtaV052WkdWVmRHWTRRMmhoY2loMGJYQXBYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOWhjMk5wYVZOc2FXTmxJQ2hpZFdZc0lITjBZWEowTENCbGJtUXBJSHRjYmlBZ2RtRnlJSEpsZENBOUlDY25YRzRnSUdWdVpDQTlJRTFoZEdndWJXbHVLR0oxWmk1c1pXNW5kR2dzSUdWdVpDbGNibHh1SUNCbWIzSWdLSFpoY2lCcElEMGdjM1JoY25RN0lHa2dQQ0JsYm1RN0lHa3JLeWxjYmlBZ0lDQnlaWFFnS3owZ1UzUnlhVzVuTG1aeWIyMURhR0Z5UTI5a1pTaGlkV1piYVYwcFhHNGdJSEpsZEhWeWJpQnlaWFJjYm4xY2JseHVablZ1WTNScGIyNGdYMkpwYm1GeWVWTnNhV05sSUNoaWRXWXNJSE4wWVhKMExDQmxibVFwSUh0Y2JpQWdjbVYwZFhKdUlGOWhjMk5wYVZOc2FXTmxLR0oxWml3Z2MzUmhjblFzSUdWdVpDbGNibjFjYmx4dVpuVnVZM1JwYjI0Z1gyaGxlRk5zYVdObElDaGlkV1lzSUhOMFlYSjBMQ0JsYm1RcElIdGNiaUFnZG1GeUlHeGxiaUE5SUdKMVppNXNaVzVuZEdoY2JseHVJQ0JwWmlBb0lYTjBZWEowSUh4OElITjBZWEowSUR3Z01Da2djM1JoY25RZ1BTQXdYRzRnSUdsbUlDZ2haVzVrSUh4OElHVnVaQ0E4SURBZ2ZId2daVzVrSUQ0Z2JHVnVLU0JsYm1RZ1BTQnNaVzVjYmx4dUlDQjJZWElnYjNWMElEMGdKeWRjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJSE4wWVhKME95QnBJRHdnWlc1a095QnBLeXNwSUh0Y2JpQWdJQ0J2ZFhRZ0t6MGdkRzlJWlhnb1luVm1XMmxkS1Z4dUlDQjlYRzRnSUhKbGRIVnliaUJ2ZFhSY2JuMWNibHh1Wm5WdVkzUnBiMjRnWDNWMFpqRTJiR1ZUYkdsalpTQW9ZblZtTENCemRHRnlkQ3dnWlc1a0tTQjdYRzRnSUhaaGNpQmllWFJsY3lBOUlHSjFaaTV6YkdsalpTaHpkR0Z5ZEN3Z1pXNWtLVnh1SUNCMllYSWdjbVZ6SUQwZ0p5ZGNiaUFnWm05eUlDaDJZWElnYVNBOUlEQTdJR2tnUENCaWVYUmxjeTVzWlc1bmRHZzdJR2tnS3owZ01pa2dlMXh1SUNBZ0lISmxjeUFyUFNCVGRISnBibWN1Wm5KdmJVTm9ZWEpEYjJSbEtHSjVkR1Z6VzJsZElDc2dZbmwwWlhOYmFTc3hYU0FxSURJMU5pbGNiaUFnZlZ4dUlDQnlaWFIxY200Z2NtVnpYRzU5WEc1Y2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdWMyeHBZMlVnUFNCbWRXNWpkR2x2YmlBb2MzUmhjblFzSUdWdVpDa2dlMXh1SUNCMllYSWdiR1Z1SUQwZ2RHaHBjeTVzWlc1bmRHaGNiaUFnYzNSaGNuUWdQU0JqYkdGdGNDaHpkR0Z5ZEN3Z2JHVnVMQ0F3S1Z4dUlDQmxibVFnUFNCamJHRnRjQ2hsYm1Rc0lHeGxiaXdnYkdWdUtWeHVYRzRnSUdsbUlDaENkV1ptWlhJdVgzVnpaVlI1Y0dWa1FYSnlZWGx6S1NCN1hHNGdJQ0FnY21WMGRYSnVJRUoxWm1abGNpNWZZWFZuYldWdWRDaDBhR2x6TG5OMVltRnljbUY1S0hOMFlYSjBMQ0JsYm1RcEtWeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lIWmhjaUJ6YkdsalpVeGxiaUE5SUdWdVpDQXRJSE4wWVhKMFhHNGdJQ0FnZG1GeUlHNWxkMEoxWmlBOUlHNWxkeUJDZFdabVpYSW9jMnhwWTJWTVpXNHNJSFZ1WkdWbWFXNWxaQ3dnZEhKMVpTbGNiaUFnSUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElITnNhV05sVEdWdU95QnBLeXNwSUh0Y2JpQWdJQ0FnSUc1bGQwSjFabHRwWFNBOUlIUm9hWE5iYVNBcklITjBZWEowWFZ4dUlDQWdJSDFjYmlBZ0lDQnlaWFIxY200Z2JtVjNRblZtWEc0Z0lIMWNibjFjYmx4dUx5OGdZR2RsZEdBZ2QybHNiQ0JpWlNCeVpXMXZkbVZrSUdsdUlFNXZaR1VnTUM0eE15dGNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVaMlYwSUQwZ1puVnVZM1JwYjI0Z0tHOW1abk5sZENrZ2UxeHVJQ0JqYjI1emIyeGxMbXh2WnlnbkxtZGxkQ2dwSUdseklHUmxjSEpsWTJGMFpXUXVJRUZqWTJWemN5QjFjMmx1WnlCaGNuSmhlU0JwYm1SbGVHVnpJR2x1YzNSbFlXUXVKeWxjYmlBZ2NtVjBkWEp1SUhSb2FYTXVjbVZoWkZWSmJuUTRLRzltWm5ObGRDbGNibjFjYmx4dUx5OGdZSE5sZEdBZ2QybHNiQ0JpWlNCeVpXMXZkbVZrSUdsdUlFNXZaR1VnTUM0eE15dGNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVjMlYwSUQwZ1puVnVZM1JwYjI0Z0tIWXNJRzltWm5ObGRDa2dlMXh1SUNCamIyNXpiMnhsTG14dlp5Z25Mbk5sZENncElHbHpJR1JsY0hKbFkyRjBaV1F1SUVGalkyVnpjeUIxYzJsdVp5QmhjbkpoZVNCcGJtUmxlR1Z6SUdsdWMzUmxZV1F1SnlsY2JpQWdjbVYwZFhKdUlIUm9hWE11ZDNKcGRHVlZTVzUwT0NoMkxDQnZabVp6WlhRcFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1Y21WaFpGVkpiblE0SUQwZ1puVnVZM1JwYjI0Z0tHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUJ2Wm1aelpYUWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JRzltWm5ObGRDY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0E4SUhSb2FYTXViR1Z1WjNSb0xDQW5WSEo1YVc1bklIUnZJSEpsWVdRZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNCOVhHNWNiaUFnYVdZZ0tHOW1abk5sZENBK1BTQjBhR2x6TG14bGJtZDBhQ2xjYmlBZ0lDQnlaWFIxY201Y2JseHVJQ0J5WlhSMWNtNGdkR2hwYzF0dlptWnpaWFJkWEc1OVhHNWNibVoxYm1OMGFXOXVJRjl5WldGa1ZVbHVkREUySUNoaWRXWXNJRzltWm5ObGRDd2diR2wwZEd4bFJXNWthV0Z1TENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JwWmlBb0lXNXZRWE56WlhKMEtTQjdYRzRnSUNBZ1lYTnpaWEowS0hSNWNHVnZaaUJzYVhSMGJHVkZibVJwWVc0Z1BUMDlJQ2RpYjI5c1pXRnVKeXdnSjIxcGMzTnBibWNnYjNJZ2FXNTJZV3hwWkNCbGJtUnBZVzRuS1Z4dUlDQWdJR0Z6YzJWeWRDaHZabVp6WlhRZ0lUMDlJSFZ1WkdWbWFXNWxaQ0FtSmlCdlptWnpaWFFnSVQwOUlHNTFiR3dzSUNkdGFYTnphVzVuSUc5bVpuTmxkQ2NwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBcklERWdQQ0JpZFdZdWJHVnVaM1JvTENBblZISjVhVzVuSUhSdklISmxZV1FnWW1WNWIyNWtJR0oxWm1abGNpQnNaVzVuZEdnbktWeHVJQ0I5WEc1Y2JpQWdkbUZ5SUd4bGJpQTlJR0oxWmk1c1pXNW5kR2hjYmlBZ2FXWWdLRzltWm5ObGRDQStQU0JzWlc0cFhHNGdJQ0FnY21WMGRYSnVYRzVjYmlBZ2RtRnlJSFpoYkZ4dUlDQnBaaUFvYkdsMGRHeGxSVzVrYVdGdUtTQjdYRzRnSUNBZ2RtRnNJRDBnWW5WbVcyOW1abk5sZEYxY2JpQWdJQ0JwWmlBb2IyWm1jMlYwSUNzZ01TQThJR3hsYmlsY2JpQWdJQ0FnSUhaaGJDQjhQU0JpZFdaYmIyWm1jMlYwSUNzZ01WMGdQRHdnT0Z4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUhaaGJDQTlJR0oxWmx0dlptWnpaWFJkSUR3OElEaGNiaUFnSUNCcFppQW9iMlptYzJWMElDc2dNU0E4SUd4bGJpbGNiaUFnSUNBZ0lIWmhiQ0I4UFNCaWRXWmJiMlptYzJWMElDc2dNVjFjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdkbUZzWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVjbVZoWkZWSmJuUXhOa3hGSUQwZ1puVnVZM1JwYjI0Z0tHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnY21WMGRYSnVJRjl5WldGa1ZVbHVkREUyS0hSb2FYTXNJRzltWm5ObGRDd2dkSEoxWlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1Y21WaFpGVkpiblF4TmtKRklEMGdablZ1WTNScGIyNGdLRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ2NtVjBkWEp1SUY5eVpXRmtWVWx1ZERFMktIUm9hWE1zSUc5bVpuTmxkQ3dnWm1Gc2MyVXNJRzV2UVhOelpYSjBLVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZjbVZoWkZWSmJuUXpNaUFvWW5WbUxDQnZabVp6WlhRc0lHeHBkSFJzWlVWdVpHbGhiaXdnYm05QmMzTmxjblFwSUh0Y2JpQWdhV1lnS0NGdWIwRnpjMlZ5ZENrZ2UxeHVJQ0FnSUdGemMyVnlkQ2gwZVhCbGIyWWdiR2wwZEd4bFJXNWthV0Z1SUQwOVBTQW5ZbTl2YkdWaGJpY3NJQ2R0YVhOemFXNW5JRzl5SUdsdWRtRnNhV1FnWlc1a2FXRnVKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnYjJabWMyVjBJQ0U5UFNCdWRXeHNMQ0FuYldsemMybHVaeUJ2Wm1aelpYUW5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnS3lBeklEd2dZblZtTG14bGJtZDBhQ3dnSjFSeWVXbHVaeUIwYnlCeVpXRmtJR0psZVc5dVpDQmlkV1ptWlhJZ2JHVnVaM1JvSnlsY2JpQWdmVnh1WEc0Z0lIWmhjaUJzWlc0Z1BTQmlkV1l1YkdWdVozUm9YRzRnSUdsbUlDaHZabVp6WlhRZ1BqMGdiR1Z1S1Z4dUlDQWdJSEpsZEhWeWJseHVYRzRnSUhaaGNpQjJZV3hjYmlBZ2FXWWdLR3hwZEhSc1pVVnVaR2xoYmlrZ2UxeHVJQ0FnSUdsbUlDaHZabVp6WlhRZ0t5QXlJRHdnYkdWdUtWeHVJQ0FnSUNBZ2RtRnNJRDBnWW5WbVcyOW1abk5sZENBcklESmRJRHc4SURFMlhHNGdJQ0FnYVdZZ0tHOW1abk5sZENBcklERWdQQ0JzWlc0cFhHNGdJQ0FnSUNCMllXd2dmRDBnWW5WbVcyOW1abk5sZENBcklERmRJRHc4SURoY2JpQWdJQ0IyWVd3Z2ZEMGdZblZtVzI5bVpuTmxkRjFjYmlBZ0lDQnBaaUFvYjJabWMyVjBJQ3NnTXlBOElHeGxiaWxjYmlBZ0lDQWdJSFpoYkNBOUlIWmhiQ0FySUNoaWRXWmJiMlptYzJWMElDc2dNMTBnUER3Z01qUWdQajQrSURBcFhHNGdJSDBnWld4elpTQjdYRzRnSUNBZ2FXWWdLRzltWm5ObGRDQXJJREVnUENCc1pXNHBYRzRnSUNBZ0lDQjJZV3dnUFNCaWRXWmJiMlptYzJWMElDc2dNVjBnUER3Z01UWmNiaUFnSUNCcFppQW9iMlptYzJWMElDc2dNaUE4SUd4bGJpbGNiaUFnSUNBZ0lIWmhiQ0I4UFNCaWRXWmJiMlptYzJWMElDc2dNbDBnUER3Z09GeHVJQ0FnSUdsbUlDaHZabVp6WlhRZ0t5QXpJRHdnYkdWdUtWeHVJQ0FnSUNBZ2RtRnNJSHc5SUdKMVpsdHZabVp6WlhRZ0t5QXpYVnh1SUNBZ0lIWmhiQ0E5SUhaaGJDQXJJQ2hpZFdaYmIyWm1jMlYwWFNBOFBDQXlOQ0ErUGo0Z01DbGNiaUFnZlZ4dUlDQnlaWFIxY200Z2RtRnNYRzU5WEc1Y2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdWNtVmhaRlZKYm5Rek1reEZJRDBnWm5WdVkzUnBiMjRnS0c5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdjbVYwZFhKdUlGOXlaV0ZrVlVsdWRETXlLSFJvYVhNc0lHOW1abk5sZEN3Z2RISjFaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVjbVZoWkZWSmJuUXpNa0pGSUQwZ1puVnVZM1JwYjI0Z0tHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnY21WMGRYSnVJRjl5WldGa1ZVbHVkRE15S0hSb2FYTXNJRzltWm5ObGRDd2dabUZzYzJVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5KbFlXUkpiblE0SUQwZ1puVnVZM1JwYjI0Z0tHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUJ2Wm1aelpYUWdJVDA5SUc1MWJHd3NYRzRnSUNBZ0lDQWdJQ2R0YVhOemFXNW5JRzltWm5ObGRDY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0E4SUhSb2FYTXViR1Z1WjNSb0xDQW5WSEo1YVc1bklIUnZJSEpsWVdRZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNCOVhHNWNiaUFnYVdZZ0tHOW1abk5sZENBK1BTQjBhR2x6TG14bGJtZDBhQ2xjYmlBZ0lDQnlaWFIxY201Y2JseHVJQ0IyWVhJZ2JtVm5JRDBnZEdocGMxdHZabVp6WlhSZElDWWdNSGc0TUZ4dUlDQnBaaUFvYm1WbktWeHVJQ0FnSUhKbGRIVnliaUFvTUhobVppQXRJSFJvYVhOYmIyWm1jMlYwWFNBcklERXBJQ29nTFRGY2JpQWdaV3h6WlZ4dUlDQWdJSEpsZEhWeWJpQjBhR2x6VzI5bVpuTmxkRjFjYm4xY2JseHVablZ1WTNScGIyNGdYM0psWVdSSmJuUXhOaUFvWW5WbUxDQnZabVp6WlhRc0lHeHBkSFJzWlVWdVpHbGhiaXdnYm05QmMzTmxjblFwSUh0Y2JpQWdhV1lnS0NGdWIwRnpjMlZ5ZENrZ2UxeHVJQ0FnSUdGemMyVnlkQ2gwZVhCbGIyWWdiR2wwZEd4bFJXNWthV0Z1SUQwOVBTQW5ZbTl2YkdWaGJpY3NJQ2R0YVhOemFXNW5JRzl5SUdsdWRtRnNhV1FnWlc1a2FXRnVKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnYjJabWMyVjBJQ0U5UFNCdWRXeHNMQ0FuYldsemMybHVaeUJ2Wm1aelpYUW5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnS3lBeElEd2dZblZtTG14bGJtZDBhQ3dnSjFSeWVXbHVaeUIwYnlCeVpXRmtJR0psZVc5dVpDQmlkV1ptWlhJZ2JHVnVaM1JvSnlsY2JpQWdmVnh1WEc0Z0lIWmhjaUJzWlc0Z1BTQmlkV1l1YkdWdVozUm9YRzRnSUdsbUlDaHZabVp6WlhRZ1BqMGdiR1Z1S1Z4dUlDQWdJSEpsZEhWeWJseHVYRzRnSUhaaGNpQjJZV3dnUFNCZmNtVmhaRlZKYm5ReE5paGlkV1lzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQjBjblZsS1Z4dUlDQjJZWElnYm1WbklEMGdkbUZzSUNZZ01IZzRNREF3WEc0Z0lHbG1JQ2h1WldjcFhHNGdJQ0FnY21WMGRYSnVJQ2d3ZUdabVptWWdMU0IyWVd3Z0t5QXhLU0FxSUMweFhHNGdJR1ZzYzJWY2JpQWdJQ0J5WlhSMWNtNGdkbUZzWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVjbVZoWkVsdWRERTJURVVnUFNCbWRXNWpkR2x2YmlBb2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0J5WlhSMWNtNGdYM0psWVdSSmJuUXhOaWgwYUdsekxDQnZabVp6WlhRc0lIUnlkV1VzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbkpsWVdSSmJuUXhOa0pGSUQwZ1puVnVZM1JwYjI0Z0tHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnY21WMGRYSnVJRjl5WldGa1NXNTBNVFlvZEdocGN5d2diMlptYzJWMExDQm1ZV3h6WlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYm1aMWJtTjBhVzl1SUY5eVpXRmtTVzUwTXpJZ0tHSjFaaXdnYjJabWMyVjBMQ0JzYVhSMGJHVkZibVJwWVc0c0lHNXZRWE56WlhKMEtTQjdYRzRnSUdsbUlDZ2hibTlCYzNObGNuUXBJSHRjYmlBZ0lDQmhjM05sY25Rb2RIbHdaVzltSUd4cGRIUnNaVVZ1WkdsaGJpQTlQVDBnSjJKdmIyeGxZVzRuTENBbmJXbHpjMmx1WnlCdmNpQnBiblpoYkdsa0lHVnVaR2xoYmljcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlHOW1abk5sZENBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2IyWm1jMlYwSnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDc2dNeUE4SUdKMVppNXNaVzVuZEdnc0lDZFVjbmxwYm1jZ2RHOGdjbVZoWkNCaVpYbHZibVFnWW5WbVptVnlJR3hsYm1kMGFDY3BYRzRnSUgxY2JseHVJQ0IyWVhJZ2JHVnVJRDBnWW5WbUxteGxibWQwYUZ4dUlDQnBaaUFvYjJabWMyVjBJRDQ5SUd4bGJpbGNiaUFnSUNCeVpYUjFjbTVjYmx4dUlDQjJZWElnZG1Gc0lEMGdYM0psWVdSVlNXNTBNeklvWW5WbUxDQnZabVp6WlhRc0lHeHBkSFJzWlVWdVpHbGhiaXdnZEhKMVpTbGNiaUFnZG1GeUlHNWxaeUE5SUhaaGJDQW1JREI0T0RBd01EQXdNREJjYmlBZ2FXWWdLRzVsWnlsY2JpQWdJQ0J5WlhSMWNtNGdLREI0Wm1abVptWm1abVlnTFNCMllXd2dLeUF4S1NBcUlDMHhYRzRnSUdWc2MyVmNiaUFnSUNCeVpYUjFjbTRnZG1Gc1hHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1Y21WaFpFbHVkRE15VEVVZ1BTQm1kVzVqZEdsdmJpQW9iMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCeVpYUjFjbTRnWDNKbFlXUkpiblF6TWloMGFHbHpMQ0J2Wm1aelpYUXNJSFJ5ZFdVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5KbFlXUkpiblF6TWtKRklEMGdablZ1WTNScGIyNGdLRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ2NtVjBkWEp1SUY5eVpXRmtTVzUwTXpJb2RHaHBjeXdnYjJabWMyVjBMQ0JtWVd4elpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOXlaV0ZrUm14dllYUWdLR0oxWml3Z2IyWm1jMlYwTENCc2FYUjBiR1ZGYm1ScFlXNHNJRzV2UVhOelpYSjBLU0I3WEc0Z0lHbG1JQ2doYm05QmMzTmxjblFwSUh0Y2JpQWdJQ0JoYzNObGNuUW9kSGx3Wlc5bUlHeHBkSFJzWlVWdVpHbGhiaUE5UFQwZ0oySnZiMnhsWVc0bkxDQW5iV2x6YzJsdVp5QnZjaUJwYm5aaGJHbGtJR1Z1WkdsaGJpY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FySURNZ1BDQmlkV1l1YkdWdVozUm9MQ0FuVkhKNWFXNW5JSFJ2SUhKbFlXUWdZbVY1YjI1a0lHSjFabVpsY2lCc1pXNW5kR2duS1Z4dUlDQjlYRzVjYmlBZ2NtVjBkWEp1SUdsbFpXVTNOVFF1Y21WaFpDaGlkV1lzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQXlNeXdnTkNsY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzV5WldGa1JteHZZWFJNUlNBOUlHWjFibU4wYVc5dUlDaHZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUhKbGRIVnliaUJmY21WaFpFWnNiMkYwS0hSb2FYTXNJRzltWm5ObGRDd2dkSEoxWlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1Y21WaFpFWnNiMkYwUWtVZ1BTQm1kVzVqZEdsdmJpQW9iMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCeVpYUjFjbTRnWDNKbFlXUkdiRzloZENoMGFHbHpMQ0J2Wm1aelpYUXNJR1poYkhObExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVpuVnVZM1JwYjI0Z1gzSmxZV1JFYjNWaWJHVWdLR0oxWml3Z2IyWm1jMlYwTENCc2FYUjBiR1ZGYm1ScFlXNHNJRzV2UVhOelpYSjBLU0I3WEc0Z0lHbG1JQ2doYm05QmMzTmxjblFwSUh0Y2JpQWdJQ0JoYzNObGNuUW9kSGx3Wlc5bUlHeHBkSFJzWlVWdVpHbGhiaUE5UFQwZ0oySnZiMnhsWVc0bkxDQW5iV2x6YzJsdVp5QnZjaUJwYm5aaGJHbGtJR1Z1WkdsaGJpY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FySURjZ1BDQmlkV1l1YkdWdVozUm9MQ0FuVkhKNWFXNW5JSFJ2SUhKbFlXUWdZbVY1YjI1a0lHSjFabVpsY2lCc1pXNW5kR2duS1Z4dUlDQjlYRzVjYmlBZ2NtVjBkWEp1SUdsbFpXVTNOVFF1Y21WaFpDaGlkV1lzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQTFNaXdnT0NsY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzV5WldGa1JHOTFZbXhsVEVVZ1BTQm1kVzVqZEdsdmJpQW9iMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCeVpYUjFjbTRnWDNKbFlXUkViM1ZpYkdVb2RHaHBjeXdnYjJabWMyVjBMQ0IwY25WbExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1eVpXRmtSRzkxWW14bFFrVWdQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnlaWFIxY200Z1gzSmxZV1JFYjNWaWJHVW9kR2hwY3l3Z2IyWm1jMlYwTENCbVlXeHpaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkM0pwZEdWVlNXNTBPQ0E5SUdaMWJtTjBhVzl1SUNoMllXeDFaU3dnYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLSFpoYkhWbElDRTlQU0IxYm1SbFptbHVaV1FnSmlZZ2RtRnNkV1VnSVQwOUlHNTFiR3dzSUNkdGFYTnphVzVuSUhaaGJIVmxKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnYjJabWMyVjBJQ0U5UFNCdWRXeHNMQ0FuYldsemMybHVaeUJ2Wm1aelpYUW5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnUENCMGFHbHpMbXhsYm1kMGFDd2dKM1J5ZVdsdVp5QjBieUIzY21sMFpTQmlaWGx2Ym1RZ1luVm1abVZ5SUd4bGJtZDBhQ2NwWEc0Z0lDQWdkbVZ5YVdaMWFXNTBLSFpoYkhWbExDQXdlR1ptS1Z4dUlDQjlYRzVjYmlBZ2FXWWdLRzltWm5ObGRDQStQU0IwYUdsekxteGxibWQwYUNrZ2NtVjBkWEp1WEc1Y2JpQWdkR2hwYzF0dlptWnpaWFJkSUQwZ2RtRnNkV1ZjYm4xY2JseHVablZ1WTNScGIyNGdYM2R5YVhSbFZVbHVkREUySUNoaWRXWXNJSFpoYkhWbExDQnZabVp6WlhRc0lHeHBkSFJzWlVWdVpHbGhiaXdnYm05QmMzTmxjblFwSUh0Y2JpQWdhV1lnS0NGdWIwRnpjMlZ5ZENrZ2UxeHVJQ0FnSUdGemMyVnlkQ2gyWVd4MVpTQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlIWmhiSFZsSUNFOVBTQnVkV3hzTENBbmJXbHpjMmx1WnlCMllXeDFaU2NwWEc0Z0lDQWdZWE56WlhKMEtIUjVjR1Z2WmlCc2FYUjBiR1ZGYm1ScFlXNGdQVDA5SUNkaWIyOXNaV0Z1Snl3Z0oyMXBjM05wYm1jZ2IzSWdhVzUyWVd4cFpDQmxibVJwWVc0bktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQnZabVp6WlhRZ0lUMDlJRzUxYkd3c0lDZHRhWE56YVc1bklHOW1abk5sZENjcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQXJJREVnUENCaWRXWXViR1Z1WjNSb0xDQW5kSEo1YVc1bklIUnZJSGR5YVhSbElHSmxlVzl1WkNCaWRXWm1aWElnYkdWdVozUm9KeWxjYmlBZ0lDQjJaWEpwWm5WcGJuUW9kbUZzZFdVc0lEQjRabVptWmlsY2JpQWdmVnh1WEc0Z0lIWmhjaUJzWlc0Z1BTQmlkV1l1YkdWdVozUm9YRzRnSUdsbUlDaHZabVp6WlhRZ1BqMGdiR1Z1S1Z4dUlDQWdJSEpsZEhWeWJseHVYRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQXdMQ0JxSUQwZ1RXRjBhQzV0YVc0b2JHVnVJQzBnYjJabWMyVjBMQ0F5S1RzZ2FTQThJR283SUdrckt5a2dlMXh1SUNBZ0lHSjFabHR2Wm1aelpYUWdLeUJwWFNBOVhHNGdJQ0FnSUNBZ0lDaDJZV3gxWlNBbUlDZ3dlR1ptSUR3OElDZzRJQ29nS0d4cGRIUnNaVVZ1WkdsaGJpQS9JR2tnT2lBeElDMGdhU2twS1NrZ1BqNCtYRzRnSUNBZ0lDQWdJQ0FnSUNBb2JHbDBkR3hsUlc1a2FXRnVJRDhnYVNBNklERWdMU0JwS1NBcUlEaGNiaUFnZlZ4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbmR5YVhSbFZVbHVkREUyVEVVZ1BTQm1kVzVqZEdsdmJpQW9kbUZzZFdVc0lHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnWDNkeWFYUmxWVWx1ZERFMktIUm9hWE1zSUhaaGJIVmxMQ0J2Wm1aelpYUXNJSFJ5ZFdVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5keWFYUmxWVWx1ZERFMlFrVWdQU0JtZFc1amRHbHZiaUFvZG1Gc2RXVXNJRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ1gzZHlhWFJsVlVsdWRERTJLSFJvYVhNc0lIWmhiSFZsTENCdlptWnpaWFFzSUdaaGJITmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVablZ1WTNScGIyNGdYM2R5YVhSbFZVbHVkRE15SUNoaWRXWXNJSFpoYkhWbExDQnZabVp6WlhRc0lHeHBkSFJzWlVWdVpHbGhiaXdnYm05QmMzTmxjblFwSUh0Y2JpQWdhV1lnS0NGdWIwRnpjMlZ5ZENrZ2UxeHVJQ0FnSUdGemMyVnlkQ2gyWVd4MVpTQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlIWmhiSFZsSUNFOVBTQnVkV3hzTENBbmJXbHpjMmx1WnlCMllXeDFaU2NwWEc0Z0lDQWdZWE56WlhKMEtIUjVjR1Z2WmlCc2FYUjBiR1ZGYm1ScFlXNGdQVDA5SUNkaWIyOXNaV0Z1Snl3Z0oyMXBjM05wYm1jZ2IzSWdhVzUyWVd4cFpDQmxibVJwWVc0bktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQnZabVp6WlhRZ0lUMDlJRzUxYkd3c0lDZHRhWE56YVc1bklHOW1abk5sZENjcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQXJJRE1nUENCaWRXWXViR1Z1WjNSb0xDQW5kSEo1YVc1bklIUnZJSGR5YVhSbElHSmxlVzl1WkNCaWRXWm1aWElnYkdWdVozUm9KeWxjYmlBZ0lDQjJaWEpwWm5WcGJuUW9kbUZzZFdVc0lEQjRabVptWm1abVptWXBYRzRnSUgxY2JseHVJQ0IyWVhJZ2JHVnVJRDBnWW5WbUxteGxibWQwYUZ4dUlDQnBaaUFvYjJabWMyVjBJRDQ5SUd4bGJpbGNiaUFnSUNCeVpYUjFjbTVjYmx4dUlDQm1iM0lnS0haaGNpQnBJRDBnTUN3Z2FpQTlJRTFoZEdndWJXbHVLR3hsYmlBdElHOW1abk5sZEN3Z05DazdJR2tnUENCcU95QnBLeXNwSUh0Y2JpQWdJQ0JpZFdaYmIyWm1jMlYwSUNzZ2FWMGdQVnh1SUNBZ0lDQWdJQ0FvZG1Gc2RXVWdQajQrSUNoc2FYUjBiR1ZGYm1ScFlXNGdQeUJwSURvZ015QXRJR2twSUNvZ09Da2dKaUF3ZUdabVhHNGdJSDFjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNTNjbWwwWlZWSmJuUXpNa3hGSUQwZ1puVnVZM1JwYjI0Z0tIWmhiSFZsTENCdlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJRjkzY21sMFpWVkpiblF6TWloMGFHbHpMQ0IyWVd4MVpTd2diMlptYzJWMExDQjBjblZsTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzUzY21sMFpWVkpiblF6TWtKRklEMGdablZ1WTNScGIyNGdLSFpoYkhWbExDQnZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUY5M2NtbDBaVlZKYm5Rek1paDBhR2x6TENCMllXeDFaU3dnYjJabWMyVjBMQ0JtWVd4elpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdWQzSnBkR1ZKYm5RNElEMGdablZ1WTNScGIyNGdLSFpoYkhWbExDQnZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUdsbUlDZ2hibTlCYzNObGNuUXBJSHRjYmlBZ0lDQmhjM05sY25Rb2RtRnNkV1VnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUIyWVd4MVpTQWhQVDBnYm5Wc2JDd2dKMjFwYzNOcGJtY2dkbUZzZFdVbktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQnZabVp6WlhRZ0lUMDlJRzUxYkd3c0lDZHRhWE56YVc1bklHOW1abk5sZENjcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQThJSFJvYVhNdWJHVnVaM1JvTENBblZISjVhVzVuSUhSdklIZHlhWFJsSUdKbGVXOXVaQ0JpZFdabVpYSWdiR1Z1WjNSb0p5bGNiaUFnSUNCMlpYSnBabk5wYm5Rb2RtRnNkV1VzSURCNE4yWXNJQzB3ZURnd0tWeHVJQ0I5WEc1Y2JpQWdhV1lnS0c5bVpuTmxkQ0ErUFNCMGFHbHpMbXhsYm1kMGFDbGNiaUFnSUNCeVpYUjFjbTVjYmx4dUlDQnBaaUFvZG1Gc2RXVWdQajBnTUNsY2JpQWdJQ0IwYUdsekxuZHlhWFJsVlVsdWREZ29kbUZzZFdVc0lHOW1abk5sZEN3Z2JtOUJjM05sY25RcFhHNGdJR1ZzYzJWY2JpQWdJQ0IwYUdsekxuZHlhWFJsVlVsdWREZ29NSGhtWmlBcklIWmhiSFZsSUNzZ01Td2diMlptYzJWMExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVpuVnVZM1JwYjI0Z1gzZHlhWFJsU1c1ME1UWWdLR0oxWml3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDa2dlMXh1SUNCcFppQW9JVzV2UVhOelpYSjBLU0I3WEc0Z0lDQWdZWE56WlhKMEtIWmhiSFZsSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnZG1Gc2RXVWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JSFpoYkhWbEp5bGNiaUFnSUNCaGMzTmxjblFvZEhsd1pXOW1JR3hwZEhSc1pVVnVaR2xoYmlBOVBUMGdKMkp2YjJ4bFlXNG5MQ0FuYldsemMybHVaeUJ2Y2lCcGJuWmhiR2xrSUdWdVpHbGhiaWNwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUc5bVpuTmxkQ0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnYjJabWMyVjBKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNzZ01TQThJR0oxWmk1c1pXNW5kR2dzSUNkVWNubHBibWNnZEc4Z2QzSnBkR1VnWW1WNWIyNWtJR0oxWm1abGNpQnNaVzVuZEdnbktWeHVJQ0FnSUhabGNtbG1jMmx1ZENoMllXeDFaU3dnTUhnM1ptWm1MQ0F0TUhnNE1EQXdLVnh1SUNCOVhHNWNiaUFnZG1GeUlHeGxiaUE5SUdKMVppNXNaVzVuZEdoY2JpQWdhV1lnS0c5bVpuTmxkQ0ErUFNCc1pXNHBYRzRnSUNBZ2NtVjBkWEp1WEc1Y2JpQWdhV1lnS0haaGJIVmxJRDQ5SURBcFhHNGdJQ0FnWDNkeWFYUmxWVWx1ZERFMktHSjFaaXdnZG1Gc2RXVXNJRzltWm5ObGRDd2diR2wwZEd4bFJXNWthV0Z1TENCdWIwRnpjMlZ5ZENsY2JpQWdaV3h6WlZ4dUlDQWdJRjkzY21sMFpWVkpiblF4TmloaWRXWXNJREI0Wm1abVppQXJJSFpoYkhWbElDc2dNU3dnYjJabWMyVjBMQ0JzYVhSMGJHVkZibVJwWVc0c0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5keWFYUmxTVzUwTVRaTVJTQTlJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2diMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCZmQzSnBkR1ZKYm5ReE5paDBhR2x6TENCMllXeDFaU3dnYjJabWMyVjBMQ0IwY25WbExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1M2NtbDBaVWx1ZERFMlFrVWdQU0JtZFc1amRHbHZiaUFvZG1Gc2RXVXNJRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ1gzZHlhWFJsU1c1ME1UWW9kR2hwY3l3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnWm1Gc2MyVXNJRzV2UVhOelpYSjBLVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZkM0pwZEdWSmJuUXpNaUFvWW5WbUxDQjJZV3gxWlN3Z2IyWm1jMlYwTENCc2FYUjBiR1ZGYm1ScFlXNHNJRzV2UVhOelpYSjBLU0I3WEc0Z0lHbG1JQ2doYm05QmMzTmxjblFwSUh0Y2JpQWdJQ0JoYzNObGNuUW9kbUZzZFdVZ0lUMDlJSFZ1WkdWbWFXNWxaQ0FtSmlCMllXeDFaU0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnZG1Gc2RXVW5LVnh1SUNBZ0lHRnpjMlZ5ZENoMGVYQmxiMllnYkdsMGRHeGxSVzVrYVdGdUlEMDlQU0FuWW05dmJHVmhiaWNzSUNkdGFYTnphVzVuSUc5eUlHbHVkbUZzYVdRZ1pXNWthV0Z1SnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDRTlQU0IxYm1SbFptbHVaV1FnSmlZZ2IyWm1jMlYwSUNFOVBTQnVkV3hzTENBbmJXbHpjMmx1WnlCdlptWnpaWFFuS1Z4dUlDQWdJR0Z6YzJWeWRDaHZabVp6WlhRZ0t5QXpJRHdnWW5WbUxteGxibWQwYUN3Z0oxUnllV2x1WnlCMGJ5QjNjbWwwWlNCaVpYbHZibVFnWW5WbVptVnlJR3hsYm1kMGFDY3BYRzRnSUNBZ2RtVnlhV1p6YVc1MEtIWmhiSFZsTENBd2VEZG1abVptWm1abUxDQXRNSGc0TURBd01EQXdNQ2xjYmlBZ2ZWeHVYRzRnSUhaaGNpQnNaVzRnUFNCaWRXWXViR1Z1WjNSb1hHNGdJR2xtSUNodlptWnpaWFFnUGowZ2JHVnVLVnh1SUNBZ0lISmxkSFZ5Ymx4dVhHNGdJR2xtSUNoMllXeDFaU0ErUFNBd0tWeHVJQ0FnSUY5M2NtbDBaVlZKYm5Rek1paGlkV1lzSUhaaGJIVmxMQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcFhHNGdJR1ZzYzJWY2JpQWdJQ0JmZDNKcGRHVlZTVzUwTXpJb1luVm1MQ0F3ZUdabVptWm1abVptSUNzZ2RtRnNkV1VnS3lBeExDQnZabVp6WlhRc0lHeHBkSFJzWlVWdVpHbGhiaXdnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkM0pwZEdWSmJuUXpNa3hGSUQwZ1puVnVZM1JwYjI0Z0tIWmhiSFZsTENCdlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJRjkzY21sMFpVbHVkRE15S0hSb2FYTXNJSFpoYkhWbExDQnZabVp6WlhRc0lIUnlkV1VzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbmR5YVhSbFNXNTBNekpDUlNBOUlHWjFibU4wYVc5dUlDaDJZV3gxWlN3Z2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JmZDNKcGRHVkpiblF6TWloMGFHbHpMQ0IyWVd4MVpTd2diMlptYzJWMExDQm1ZV3h6WlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYm1aMWJtTjBhVzl1SUY5M2NtbDBaVVpzYjJGMElDaGlkV1lzSUhaaGJIVmxMQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENoMllXeDFaU0FoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JSFpoYkhWbElDRTlQU0J1ZFd4c0xDQW5iV2x6YzJsdVp5QjJZV3gxWlNjcFhHNGdJQ0FnWVhOelpYSjBLSFI1Y0dWdlppQnNhWFIwYkdWRmJtUnBZVzRnUFQwOUlDZGliMjlzWldGdUp5d2dKMjFwYzNOcGJtY2diM0lnYVc1MllXeHBaQ0JsYm1ScFlXNG5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUJ2Wm1aelpYUWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JRzltWm5ObGRDY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FySURNZ1BDQmlkV1l1YkdWdVozUm9MQ0FuVkhKNWFXNW5JSFJ2SUhkeWFYUmxJR0psZVc5dVpDQmlkV1ptWlhJZ2JHVnVaM1JvSnlsY2JpQWdJQ0IyWlhKcFprbEZSVVUzTlRRb2RtRnNkV1VzSURNdU5EQXlPREl6TkRZMk16ZzFNamc0Tm1Vck16Z3NJQzB6TGpRd01qZ3lNelEyTmpNNE5USTRPRFpsS3pNNEtWeHVJQ0I5WEc1Y2JpQWdkbUZ5SUd4bGJpQTlJR0oxWmk1c1pXNW5kR2hjYmlBZ2FXWWdLRzltWm5ObGRDQStQU0JzWlc0cFhHNGdJQ0FnY21WMGRYSnVYRzVjYmlBZ2FXVmxaVGMxTkM1M2NtbDBaU2hpZFdZc0lIWmhiSFZsTENCdlptWnpaWFFzSUd4cGRIUnNaVVZ1WkdsaGJpd2dNak1zSURRcFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1ZDNKcGRHVkdiRzloZEV4RklEMGdablZ1WTNScGIyNGdLSFpoYkhWbExDQnZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUY5M2NtbDBaVVpzYjJGMEtIUm9hWE1zSUhaaGJIVmxMQ0J2Wm1aelpYUXNJSFJ5ZFdVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5keWFYUmxSbXh2WVhSQ1JTQTlJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2diMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCZmQzSnBkR1ZHYkc5aGRDaDBhR2x6TENCMllXeDFaU3dnYjJabWMyVjBMQ0JtWVd4elpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOTNjbWwwWlVSdmRXSnNaU0FvWW5WbUxDQjJZV3gxWlN3Z2IyWm1jMlYwTENCc2FYUjBiR1ZGYm1ScFlXNHNJRzV2UVhOelpYSjBLU0I3WEc0Z0lHbG1JQ2doYm05QmMzTmxjblFwSUh0Y2JpQWdJQ0JoYzNObGNuUW9kbUZzZFdVZ0lUMDlJSFZ1WkdWbWFXNWxaQ0FtSmlCMllXeDFaU0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnZG1Gc2RXVW5LVnh1SUNBZ0lHRnpjMlZ5ZENoMGVYQmxiMllnYkdsMGRHeGxSVzVrYVdGdUlEMDlQU0FuWW05dmJHVmhiaWNzSUNkdGFYTnphVzVuSUc5eUlHbHVkbUZzYVdRZ1pXNWthV0Z1SnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDRTlQU0IxYm1SbFptbHVaV1FnSmlZZ2IyWm1jMlYwSUNFOVBTQnVkV3hzTENBbmJXbHpjMmx1WnlCdlptWnpaWFFuS1Z4dUlDQWdJR0Z6YzJWeWRDaHZabVp6WlhRZ0t5QTNJRHdnWW5WbUxteGxibWQwYUN4Y2JpQWdJQ0FnSUNBZ0oxUnllV2x1WnlCMGJ5QjNjbWwwWlNCaVpYbHZibVFnWW5WbVptVnlJR3hsYm1kMGFDY3BYRzRnSUNBZ2RtVnlhV1pKUlVWRk56VTBLSFpoYkhWbExDQXhMamM1TnpZNU16RXpORGcyTWpNeE5UZEZLek13T0N3Z0xURXVOemszTmprek1UTTBPRFl5TXpFMU4wVXJNekE0S1Z4dUlDQjlYRzVjYmlBZ2RtRnlJR3hsYmlBOUlHSjFaaTVzWlc1bmRHaGNiaUFnYVdZZ0tHOW1abk5sZENBK1BTQnNaVzRwWEc0Z0lDQWdjbVYwZFhKdVhHNWNiaUFnYVdWbFpUYzFOQzUzY21sMFpTaGlkV1lzSUhaaGJIVmxMQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z05USXNJRGdwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkM0pwZEdWRWIzVmliR1ZNUlNBOUlHWjFibU4wYVc5dUlDaDJZV3gxWlN3Z2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JmZDNKcGRHVkViM1ZpYkdVb2RHaHBjeXdnZG1Gc2RXVXNJRzltWm5ObGRDd2dkSEoxWlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1ZDNKcGRHVkViM1ZpYkdWQ1JTQTlJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2diMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCZmQzSnBkR1ZFYjNWaWJHVW9kR2hwY3l3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnWm1Gc2MyVXNJRzV2UVhOelpYSjBLVnh1ZlZ4dVhHNHZMeUJtYVd4c0tIWmhiSFZsTENCemRHRnlkRDB3TENCbGJtUTlZblZtWm1WeUxteGxibWQwYUNsY2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdVptbHNiQ0E5SUdaMWJtTjBhVzl1SUNoMllXeDFaU3dnYzNSaGNuUXNJR1Z1WkNrZ2UxeHVJQ0JwWmlBb0lYWmhiSFZsS1NCMllXeDFaU0E5SURCY2JpQWdhV1lnS0NGemRHRnlkQ2tnYzNSaGNuUWdQU0F3WEc0Z0lHbG1JQ2doWlc1a0tTQmxibVFnUFNCMGFHbHpMbXhsYm1kMGFGeHVYRzRnSUdsbUlDaDBlWEJsYjJZZ2RtRnNkV1VnUFQwOUlDZHpkSEpwYm1jbktTQjdYRzRnSUNBZ2RtRnNkV1VnUFNCMllXeDFaUzVqYUdGeVEyOWtaVUYwS0RBcFhHNGdJSDFjYmx4dUlDQmhjM05sY25Rb2RIbHdaVzltSUhaaGJIVmxJRDA5UFNBbmJuVnRZbVZ5SnlBbUppQWhhWE5PWVU0b2RtRnNkV1VwTENBbmRtRnNkV1VnYVhNZ2JtOTBJR0VnYm5WdFltVnlKeWxjYmlBZ1lYTnpaWEowS0dWdVpDQStQU0J6ZEdGeWRDd2dKMlZ1WkNBOElITjBZWEowSnlsY2JseHVJQ0F2THlCR2FXeHNJREFnWW5sMFpYTTdJSGRsSjNKbElHUnZibVZjYmlBZ2FXWWdLR1Z1WkNBOVBUMGdjM1JoY25RcElISmxkSFZ5Ymx4dUlDQnBaaUFvZEdocGN5NXNaVzVuZEdnZ1BUMDlJREFwSUhKbGRIVnlibHh1WEc0Z0lHRnpjMlZ5ZENoemRHRnlkQ0ErUFNBd0lDWW1JSE4wWVhKMElEd2dkR2hwY3k1c1pXNW5kR2dzSUNkemRHRnlkQ0J2ZFhRZ2IyWWdZbTkxYm1Sekp5bGNiaUFnWVhOelpYSjBLR1Z1WkNBK1BTQXdJQ1ltSUdWdVpDQThQU0IwYUdsekxteGxibWQwYUN3Z0oyVnVaQ0J2ZFhRZ2IyWWdZbTkxYm1Sekp5bGNibHh1SUNCbWIzSWdLSFpoY2lCcElEMGdjM1JoY25RN0lHa2dQQ0JsYm1RN0lHa3JLeWtnZTF4dUlDQWdJSFJvYVhOYmFWMGdQU0IyWVd4MVpWeHVJQ0I5WEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVhVzV6Y0dWamRDQTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdkbUZ5SUc5MWRDQTlJRnRkWEc0Z0lIWmhjaUJzWlc0Z1BTQjBhR2x6TG14bGJtZDBhRnh1SUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHeGxianNnYVNzcktTQjdYRzRnSUNBZ2IzVjBXMmxkSUQwZ2RHOUlaWGdvZEdocGMxdHBYU2xjYmlBZ0lDQnBaaUFvYVNBOVBUMGdaWGh3YjNKMGN5NUpUbE5RUlVOVVgwMUJXRjlDV1ZSRlV5a2dlMXh1SUNBZ0lDQWdiM1YwVzJrZ0t5QXhYU0E5SUNjdUxpNG5YRzRnSUNBZ0lDQmljbVZoYTF4dUlDQWdJSDFjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdKenhDZFdabVpYSWdKeUFySUc5MWRDNXFiMmx1S0NjZ0p5a2dLeUFuUGlkY2JuMWNibHh1THlvcVhHNGdLaUJEY21WaGRHVnpJR0VnYm1WM0lHQkJjbkpoZVVKMVptWmxjbUFnZDJsMGFDQjBhR1VnS21OdmNHbGxaQ29nYldWdGIzSjVJRzltSUhSb1pTQmlkV1ptWlhJZ2FXNXpkR0Z1WTJVdVhHNGdLaUJCWkdSbFpDQnBiaUJPYjJSbElEQXVNVEl1SUU5dWJIa2dZWFpoYVd4aFlteGxJR2x1SUdKeWIzZHpaWEp6SUhSb1lYUWdjM1Z3Y0c5eWRDQkJjbkpoZVVKMVptWmxjaTVjYmlBcUwxeHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNTBiMEZ5Y21GNVFuVm1abVZ5SUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNCcFppQW9kSGx3Wlc5bUlGVnBiblE0UVhKeVlYa2dJVDA5SUNkMWJtUmxabWx1WldRbktTQjdYRzRnSUNBZ2FXWWdLRUoxWm1abGNpNWZkWE5sVkhsd1pXUkJjbkpoZVhNcElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlBb2JtVjNJRUoxWm1abGNpaDBhR2x6S1NrdVluVm1abVZ5WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lIWmhjaUJpZFdZZ1BTQnVaWGNnVldsdWREaEJjbkpoZVNoMGFHbHpMbXhsYm1kMGFDbGNiaUFnSUNBZ0lHWnZjaUFvZG1GeUlHa2dQU0F3TENCc1pXNGdQU0JpZFdZdWJHVnVaM1JvT3lCcElEd2diR1Z1T3lCcElDczlJREVwWEc0Z0lDQWdJQ0FnSUdKMVpsdHBYU0E5SUhSb2FYTmJhVjFjYmlBZ0lDQWdJSEpsZEhWeWJpQmlkV1l1WW5WbVptVnlYRzRnSUNBZ2ZWeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lnblFuVm1abVZ5TG5SdlFYSnlZWGxDZFdabVpYSWdibTkwSUhOMWNIQnZjblJsWkNCcGJpQjBhR2x6SUdKeWIzZHpaWEluS1Z4dUlDQjlYRzU5WEc1Y2JpOHZJRWhGVEZCRlVpQkdWVTVEVkVsUFRsTmNiaTh2SUQwOVBUMDlQVDA5UFQwOVBUMDlQVDFjYmx4dVpuVnVZM1JwYjI0Z2MzUnlhVzVuZEhKcGJTQW9jM1J5S1NCN1hHNGdJR2xtSUNoemRISXVkSEpwYlNrZ2NtVjBkWEp1SUhOMGNpNTBjbWx0S0NsY2JpQWdjbVYwZFhKdUlITjBjaTV5WlhCc1lXTmxLQzllWEZ4ekszeGNYSE1ySkM5bkxDQW5KeWxjYm4xY2JseHVkbUZ5SUVKUUlEMGdRblZtWm1WeUxuQnliM1J2ZEhsd1pWeHVYRzR2S2lwY2JpQXFJRUYxWjIxbGJuUWdZU0JWYVc1ME9FRnljbUY1SUNwcGJuTjBZVzVqWlNvZ0tHNXZkQ0IwYUdVZ1ZXbHVkRGhCY25KaGVTQmpiR0Z6Y3lFcElIZHBkR2dnUW5WbVptVnlJRzFsZEdodlpITmNiaUFxTDF4dVFuVm1abVZ5TGw5aGRXZHRaVzUwSUQwZ1puVnVZM1JwYjI0Z0tHRnljaWtnZTF4dUlDQmhjbkl1WDJselFuVm1abVZ5SUQwZ2RISjFaVnh1WEc0Z0lDOHZJSE5oZG1VZ2NtVm1aWEpsYm1ObElIUnZJRzl5YVdkcGJtRnNJRlZwYm5RNFFYSnlZWGtnWjJWMEwzTmxkQ0J0WlhSb2IyUnpJR0psWm05eVpTQnZkbVZ5ZDNKcGRHbHVaMXh1SUNCaGNuSXVYMmRsZENBOUlHRnljaTVuWlhSY2JpQWdZWEp5TGw5elpYUWdQU0JoY25JdWMyVjBYRzVjYmlBZ0x5OGdaR1Z3Y21WallYUmxaQ3dnZDJsc2JDQmlaU0J5WlcxdmRtVmtJR2x1SUc1dlpHVWdNQzR4TXl0Y2JpQWdZWEp5TG1kbGRDQTlJRUpRTG1kbGRGeHVJQ0JoY25JdWMyVjBJRDBnUWxBdWMyVjBYRzVjYmlBZ1lYSnlMbmR5YVhSbElEMGdRbEF1ZDNKcGRHVmNiaUFnWVhKeUxuUnZVM1J5YVc1bklEMGdRbEF1ZEc5VGRISnBibWRjYmlBZ1lYSnlMblJ2VEc5allXeGxVM1J5YVc1bklEMGdRbEF1ZEc5VGRISnBibWRjYmlBZ1lYSnlMblJ2U2xOUFRpQTlJRUpRTG5SdlNsTlBUbHh1SUNCaGNuSXVZMjl3ZVNBOUlFSlFMbU52Y0hsY2JpQWdZWEp5TG5Oc2FXTmxJRDBnUWxBdWMyeHBZMlZjYmlBZ1lYSnlMbkpsWVdSVlNXNTBPQ0E5SUVKUUxuSmxZV1JWU1c1ME9GeHVJQ0JoY25JdWNtVmhaRlZKYm5ReE5reEZJRDBnUWxBdWNtVmhaRlZKYm5ReE5reEZYRzRnSUdGeWNpNXlaV0ZrVlVsdWRERTJRa1VnUFNCQ1VDNXlaV0ZrVlVsdWRERTJRa1ZjYmlBZ1lYSnlMbkpsWVdSVlNXNTBNekpNUlNBOUlFSlFMbkpsWVdSVlNXNTBNekpNUlZ4dUlDQmhjbkl1Y21WaFpGVkpiblF6TWtKRklEMGdRbEF1Y21WaFpGVkpiblF6TWtKRlhHNGdJR0Z5Y2k1eVpXRmtTVzUwT0NBOUlFSlFMbkpsWVdSSmJuUTRYRzRnSUdGeWNpNXlaV0ZrU1c1ME1UWk1SU0E5SUVKUUxuSmxZV1JKYm5ReE5reEZYRzRnSUdGeWNpNXlaV0ZrU1c1ME1UWkNSU0E5SUVKUUxuSmxZV1JKYm5ReE5rSkZYRzRnSUdGeWNpNXlaV0ZrU1c1ME16Sk1SU0E5SUVKUUxuSmxZV1JKYm5Rek1reEZYRzRnSUdGeWNpNXlaV0ZrU1c1ME16SkNSU0E5SUVKUUxuSmxZV1JKYm5Rek1rSkZYRzRnSUdGeWNpNXlaV0ZrUm14dllYUk1SU0E5SUVKUUxuSmxZV1JHYkc5aGRFeEZYRzRnSUdGeWNpNXlaV0ZrUm14dllYUkNSU0E5SUVKUUxuSmxZV1JHYkc5aGRFSkZYRzRnSUdGeWNpNXlaV0ZrUkc5MVlteGxURVVnUFNCQ1VDNXlaV0ZrUkc5MVlteGxURVZjYmlBZ1lYSnlMbkpsWVdSRWIzVmliR1ZDUlNBOUlFSlFMbkpsWVdSRWIzVmliR1ZDUlZ4dUlDQmhjbkl1ZDNKcGRHVlZTVzUwT0NBOUlFSlFMbmR5YVhSbFZVbHVkRGhjYmlBZ1lYSnlMbmR5YVhSbFZVbHVkREUyVEVVZ1BTQkNVQzUzY21sMFpWVkpiblF4Tmt4RlhHNGdJR0Z5Y2k1M2NtbDBaVlZKYm5ReE5rSkZJRDBnUWxBdWQzSnBkR1ZWU1c1ME1UWkNSVnh1SUNCaGNuSXVkM0pwZEdWVlNXNTBNekpNUlNBOUlFSlFMbmR5YVhSbFZVbHVkRE15VEVWY2JpQWdZWEp5TG5keWFYUmxWVWx1ZERNeVFrVWdQU0JDVUM1M2NtbDBaVlZKYm5Rek1rSkZYRzRnSUdGeWNpNTNjbWwwWlVsdWREZ2dQU0JDVUM1M2NtbDBaVWx1ZERoY2JpQWdZWEp5TG5keWFYUmxTVzUwTVRaTVJTQTlJRUpRTG5keWFYUmxTVzUwTVRaTVJWeHVJQ0JoY25JdWQzSnBkR1ZKYm5ReE5rSkZJRDBnUWxBdWQzSnBkR1ZKYm5ReE5rSkZYRzRnSUdGeWNpNTNjbWwwWlVsdWRETXlURVVnUFNCQ1VDNTNjbWwwWlVsdWRETXlURVZjYmlBZ1lYSnlMbmR5YVhSbFNXNTBNekpDUlNBOUlFSlFMbmR5YVhSbFNXNTBNekpDUlZ4dUlDQmhjbkl1ZDNKcGRHVkdiRzloZEV4RklEMGdRbEF1ZDNKcGRHVkdiRzloZEV4RlhHNGdJR0Z5Y2k1M2NtbDBaVVpzYjJGMFFrVWdQU0JDVUM1M2NtbDBaVVpzYjJGMFFrVmNiaUFnWVhKeUxuZHlhWFJsUkc5MVlteGxURVVnUFNCQ1VDNTNjbWwwWlVSdmRXSnNaVXhGWEc0Z0lHRnljaTUzY21sMFpVUnZkV0pzWlVKRklEMGdRbEF1ZDNKcGRHVkViM1ZpYkdWQ1JWeHVJQ0JoY25JdVptbHNiQ0E5SUVKUUxtWnBiR3hjYmlBZ1lYSnlMbWx1YzNCbFkzUWdQU0JDVUM1cGJuTndaV04wWEc0Z0lHRnljaTUwYjBGeWNtRjVRblZtWm1WeUlEMGdRbEF1ZEc5QmNuSmhlVUoxWm1abGNseHVYRzRnSUhKbGRIVnliaUJoY25KY2JuMWNibHh1THk4Z2MyeHBZMlVvYzNSaGNuUXNJR1Z1WkNsY2JtWjFibU4wYVc5dUlHTnNZVzF3SUNocGJtUmxlQ3dnYkdWdUxDQmtaV1poZFd4MFZtRnNkV1VwSUh0Y2JpQWdhV1lnS0hSNWNHVnZaaUJwYm1SbGVDQWhQVDBnSjI1MWJXSmxjaWNwSUhKbGRIVnliaUJrWldaaGRXeDBWbUZzZFdWY2JpQWdhVzVrWlhnZ1BTQitmbWx1WkdWNE95QWdMeThnUTI5bGNtTmxJSFJ2SUdsdWRHVm5aWEl1WEc0Z0lHbG1JQ2hwYm1SbGVDQStQU0JzWlc0cElISmxkSFZ5YmlCc1pXNWNiaUFnYVdZZ0tHbHVaR1Y0SUQ0OUlEQXBJSEpsZEhWeWJpQnBibVJsZUZ4dUlDQnBibVJsZUNBclBTQnNaVzVjYmlBZ2FXWWdLR2x1WkdWNElENDlJREFwSUhKbGRIVnliaUJwYm1SbGVGeHVJQ0J5WlhSMWNtNGdNRnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmpiMlZ5WTJVZ0tHeGxibWQwYUNrZ2UxeHVJQ0F2THlCRGIyVnlZMlVnYkdWdVozUm9JSFJ2SUdFZ2JuVnRZbVZ5SUNod2IzTnphV0pzZVNCT1lVNHBMQ0J5YjNWdVpDQjFjRnh1SUNBdkx5QnBiaUJqWVhObElHbDBKM01nWm5KaFkzUnBiMjVoYkNBb1pTNW5MaUF4TWpNdU5EVTJLU0IwYUdWdUlHUnZJR0ZjYmlBZ0x5OGdaRzkxWW14bElHNWxaMkYwWlNCMGJ5QmpiMlZ5WTJVZ1lTQk9ZVTRnZEc4Z01DNGdSV0Z6ZVN3Z2NtbG5hSFEvWEc0Z0lHeGxibWQwYUNBOUlINStUV0YwYUM1alpXbHNLQ3RzWlc1bmRHZ3BYRzRnSUhKbGRIVnliaUJzWlc1bmRHZ2dQQ0F3SUQ4Z01DQTZJR3hsYm1kMGFGeHVmVnh1WEc1bWRXNWpkR2x2YmlCcGMwRnljbUY1SUNoemRXSnFaV04wS1NCN1hHNGdJSEpsZEhWeWJpQW9RWEp5WVhrdWFYTkJjbkpoZVNCOGZDQm1kVzVqZEdsdmJpQW9jM1ZpYW1WamRDa2dlMXh1SUNBZ0lISmxkSFZ5YmlCUFltcGxZM1F1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29jM1ZpYW1WamRDa2dQVDA5SUNkYmIySnFaV04wSUVGeWNtRjVYU2RjYmlBZ2ZTa29jM1ZpYW1WamRDbGNibjFjYmx4dVpuVnVZM1JwYjI0Z2FYTkJjbkpoZVdsemFDQW9jM1ZpYW1WamRDa2dlMXh1SUNCeVpYUjFjbTRnYVhOQmNuSmhlU2h6ZFdKcVpXTjBLU0I4ZkNCQ2RXWm1aWEl1YVhOQ2RXWm1aWElvYzNWaWFtVmpkQ2tnZkh4Y2JpQWdJQ0FnSUhOMVltcGxZM1FnSmlZZ2RIbHdaVzltSUhOMVltcGxZM1FnUFQwOUlDZHZZbXBsWTNRbklDWW1YRzRnSUNBZ0lDQjBlWEJsYjJZZ2MzVmlhbVZqZEM1c1pXNW5kR2dnUFQwOUlDZHVkVzFpWlhJblhHNTlYRzVjYm1aMWJtTjBhVzl1SUhSdlNHVjRJQ2h1S1NCN1hHNGdJR2xtSUNodUlEd2dNVFlwSUhKbGRIVnliaUFuTUNjZ0t5QnVMblJ2VTNSeWFXNW5LREUyS1Z4dUlDQnlaWFIxY200Z2JpNTBiMU4wY21sdVp5Z3hOaWxjYm4xY2JseHVablZ1WTNScGIyNGdkWFJtT0ZSdlFubDBaWE1nS0hOMGNpa2dlMXh1SUNCMllYSWdZbmwwWlVGeWNtRjVJRDBnVzExY2JpQWdabTl5SUNoMllYSWdhU0E5SURBN0lHa2dQQ0J6ZEhJdWJHVnVaM1JvT3lCcEt5c3BJSHRjYmlBZ0lDQjJZWElnWWlBOUlITjBjaTVqYUdGeVEyOWtaVUYwS0drcFhHNGdJQ0FnYVdZZ0tHSWdQRDBnTUhnM1JpbGNiaUFnSUNBZ0lHSjVkR1ZCY25KaGVTNXdkWE5vS0hOMGNpNWphR0Z5UTI5a1pVRjBLR2twS1Z4dUlDQWdJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ2RtRnlJSE4wWVhKMElEMGdhVnh1SUNBZ0lDQWdhV1lnS0dJZ1BqMGdNSGhFT0RBd0lDWW1JR0lnUEQwZ01IaEVSa1pHS1NCcEt5dGNiaUFnSUNBZ0lIWmhjaUJvSUQwZ1pXNWpiMlJsVlZKSlEyOXRjRzl1Wlc1MEtITjBjaTV6YkdsalpTaHpkR0Z5ZEN3Z2FTc3hLU2t1YzNWaWMzUnlLREVwTG5Od2JHbDBLQ2NsSnlsY2JpQWdJQ0FnSUdadmNpQW9kbUZ5SUdvZ1BTQXdPeUJxSUR3Z2FDNXNaVzVuZEdnN0lHb3JLeWxjYmlBZ0lDQWdJQ0FnWW5sMFpVRnljbUY1TG5CMWMyZ29jR0Z5YzJWSmJuUW9hRnRxWFN3Z01UWXBLVnh1SUNBZ0lIMWNiaUFnZlZ4dUlDQnlaWFIxY200Z1lubDBaVUZ5Y21GNVhHNTlYRzVjYm1aMWJtTjBhVzl1SUdGelkybHBWRzlDZVhSbGN5QW9jM1J5S1NCN1hHNGdJSFpoY2lCaWVYUmxRWEp5WVhrZ1BTQmJYVnh1SUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElITjBjaTVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUM4dklFNXZaR1VuY3lCamIyUmxJSE5sWlcxeklIUnZJR0psSUdSdmFXNW5JSFJvYVhNZ1lXNWtJRzV2ZENBbUlEQjROMFl1TGx4dUlDQWdJR0o1ZEdWQmNuSmhlUzV3ZFhOb0tITjBjaTVqYUdGeVEyOWtaVUYwS0drcElDWWdNSGhHUmlsY2JpQWdmVnh1SUNCeVpYUjFjbTRnWW5sMFpVRnljbUY1WEc1OVhHNWNibVoxYm1OMGFXOXVJSFYwWmpFMmJHVlViMEo1ZEdWeklDaHpkSElwSUh0Y2JpQWdkbUZ5SUdNc0lHaHBMQ0JzYjF4dUlDQjJZWElnWW5sMFpVRnljbUY1SUQwZ1cxMWNiaUFnWm05eUlDaDJZWElnYVNBOUlEQTdJR2tnUENCemRISXViR1Z1WjNSb095QnBLeXNwSUh0Y2JpQWdJQ0JqSUQwZ2MzUnlMbU5vWVhKRGIyUmxRWFFvYVNsY2JpQWdJQ0JvYVNBOUlHTWdQajRnT0Z4dUlDQWdJR3h2SUQwZ1l5QWxJREkxTmx4dUlDQWdJR0o1ZEdWQmNuSmhlUzV3ZFhOb0tHeHZLVnh1SUNBZ0lHSjVkR1ZCY25KaGVTNXdkWE5vS0docEtWeHVJQ0I5WEc1Y2JpQWdjbVYwZFhKdUlHSjVkR1ZCY25KaGVWeHVmVnh1WEc1bWRXNWpkR2x2YmlCaVlYTmxOalJVYjBKNWRHVnpJQ2h6ZEhJcElIdGNiaUFnY21WMGRYSnVJR0poYzJVMk5DNTBiMEo1ZEdWQmNuSmhlU2h6ZEhJcFhHNTlYRzVjYm1aMWJtTjBhVzl1SUdKc2FYUkNkV1ptWlhJZ0tITnlZeXdnWkhOMExDQnZabVp6WlhRc0lHeGxibWQwYUNrZ2UxeHVJQ0IyWVhJZ2NHOXpYRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2JHVnVaM1JvT3lCcEt5c3BJSHRjYmlBZ0lDQnBaaUFvS0drZ0t5QnZabVp6WlhRZ1BqMGdaSE4wTG14bGJtZDBhQ2tnZkh3Z0tHa2dQajBnYzNKakxteGxibWQwYUNrcFhHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHUnpkRnRwSUNzZ2IyWm1jMlYwWFNBOUlITnlZMXRwWFZ4dUlDQjlYRzRnSUhKbGRIVnliaUJwWEc1OVhHNWNibVoxYm1OMGFXOXVJR1JsWTI5a1pWVjBaamhEYUdGeUlDaHpkSElwSUh0Y2JpQWdkSEo1SUh0Y2JpQWdJQ0J5WlhSMWNtNGdaR1ZqYjJSbFZWSkpRMjl0Y0c5dVpXNTBLSE4wY2lsY2JpQWdmU0JqWVhSamFDQW9aWEp5S1NCN1hHNGdJQ0FnY21WMGRYSnVJRk4wY21sdVp5NW1jbTl0UTJoaGNrTnZaR1VvTUhoR1JrWkVLU0F2THlCVlZFWWdPQ0JwYm5aaGJHbGtJR05vWVhKY2JpQWdmVnh1ZlZ4dVhHNHZLbHh1SUNvZ1YyVWdhR0YyWlNCMGJ5QnRZV3RsSUhOMWNtVWdkR2hoZENCMGFHVWdkbUZzZFdVZ2FYTWdZU0IyWVd4cFpDQnBiblJsWjJWeUxpQlVhR2x6SUcxbFlXNXpJSFJvWVhRZ2FYUmNiaUFxSUdseklHNXZiaTF1WldkaGRHbDJaUzRnU1hRZ2FHRnpJRzV2SUdaeVlXTjBhVzl1WVd3Z1kyOXRjRzl1Wlc1MElHRnVaQ0IwYUdGMElHbDBJR1J2WlhNZ2JtOTBYRzRnS2lCbGVHTmxaV1FnZEdobElHMWhlR2x0ZFcwZ1lXeHNiM2RsWkNCMllXeDFaUzVjYmlBcUwxeHVablZ1WTNScGIyNGdkbVZ5YVdaMWFXNTBJQ2gyWVd4MVpTd2diV0Y0S1NCN1hHNGdJR0Z6YzJWeWRDaDBlWEJsYjJZZ2RtRnNkV1VnUFQwOUlDZHVkVzFpWlhJbkxDQW5ZMkZ1Ym05MElIZHlhWFJsSUdFZ2JtOXVMVzUxYldKbGNpQmhjeUJoSUc1MWJXSmxjaWNwWEc0Z0lHRnpjMlZ5ZENoMllXeDFaU0ErUFNBd0xDQW5jM0JsWTJsbWFXVmtJR0VnYm1WbllYUnBkbVVnZG1Gc2RXVWdabTl5SUhkeWFYUnBibWNnWVc0Z2RXNXphV2R1WldRZ2RtRnNkV1VuS1Z4dUlDQmhjM05sY25Rb2RtRnNkV1VnUEQwZ2JXRjRMQ0FuZG1Gc2RXVWdhWE1nYkdGeVoyVnlJSFJvWVc0Z2JXRjRhVzExYlNCMllXeDFaU0JtYjNJZ2RIbHdaU2NwWEc0Z0lHRnpjMlZ5ZENoTllYUm9MbVpzYjI5eUtIWmhiSFZsS1NBOVBUMGdkbUZzZFdVc0lDZDJZV3gxWlNCb1lYTWdZU0JtY21GamRHbHZibUZzSUdOdmJYQnZibVZ1ZENjcFhHNTlYRzVjYm1aMWJtTjBhVzl1SUhabGNtbG1jMmx1ZENBb2RtRnNkV1VzSUcxaGVDd2diV2x1S1NCN1hHNGdJR0Z6YzJWeWRDaDBlWEJsYjJZZ2RtRnNkV1VnUFQwOUlDZHVkVzFpWlhJbkxDQW5ZMkZ1Ym05MElIZHlhWFJsSUdFZ2JtOXVMVzUxYldKbGNpQmhjeUJoSUc1MWJXSmxjaWNwWEc0Z0lHRnpjMlZ5ZENoMllXeDFaU0E4UFNCdFlYZ3NJQ2QyWVd4MVpTQnNZWEpuWlhJZ2RHaGhiaUJ0WVhocGJYVnRJR0ZzYkc5M1pXUWdkbUZzZFdVbktWeHVJQ0JoYzNObGNuUW9kbUZzZFdVZ1BqMGdiV2x1TENBbmRtRnNkV1VnYzIxaGJHeGxjaUIwYUdGdUlHMXBibWx0ZFcwZ1lXeHNiM2RsWkNCMllXeDFaU2NwWEc0Z0lHRnpjMlZ5ZENoTllYUm9MbVpzYjI5eUtIWmhiSFZsS1NBOVBUMGdkbUZzZFdVc0lDZDJZV3gxWlNCb1lYTWdZU0JtY21GamRHbHZibUZzSUdOdmJYQnZibVZ1ZENjcFhHNTlYRzVjYm1aMWJtTjBhVzl1SUhabGNtbG1TVVZGUlRjMU5DQW9kbUZzZFdVc0lHMWhlQ3dnYldsdUtTQjdYRzRnSUdGemMyVnlkQ2gwZVhCbGIyWWdkbUZzZFdVZ1BUMDlJQ2R1ZFcxaVpYSW5MQ0FuWTJGdWJtOTBJSGR5YVhSbElHRWdibTl1TFc1MWJXSmxjaUJoY3lCaElHNTFiV0psY2ljcFhHNGdJR0Z6YzJWeWRDaDJZV3gxWlNBOFBTQnRZWGdzSUNkMllXeDFaU0JzWVhKblpYSWdkR2hoYmlCdFlYaHBiWFZ0SUdGc2JHOTNaV1FnZG1Gc2RXVW5LVnh1SUNCaGMzTmxjblFvZG1Gc2RXVWdQajBnYldsdUxDQW5kbUZzZFdVZ2MyMWhiR3hsY2lCMGFHRnVJRzFwYm1sdGRXMGdZV3hzYjNkbFpDQjJZV3gxWlNjcFhHNTlYRzVjYm1aMWJtTjBhVzl1SUdGemMyVnlkQ0FvZEdWemRDd2diV1Z6YzJGblpTa2dlMXh1SUNCcFppQW9JWFJsYzNRcElIUm9jbTkzSUc1bGR5QkZjbkp2Y2lodFpYTnpZV2RsSUh4OElDZEdZV2xzWldRZ1lYTnpaWEowYVc5dUp5bGNibjFjYmx4dWZTa3VZMkZzYkNoMGFHbHpMSEpsY1hWcGNtVW9YQ0psTDFVck9UZGNJaWtzZEhsd1pXOW1JSE5sYkdZZ0lUMDlJRndpZFc1a1pXWnBibVZrWENJZ1B5QnpaV3htSURvZ2RIbHdaVzltSUhkcGJtUnZkeUFoUFQwZ1hDSjFibVJsWm1sdVpXUmNJaUEvSUhkcGJtUnZkeUE2SUh0OUxISmxjWFZwY21Vb1hDSmlkV1ptWlhKY0lpa3VRblZtWm1WeUxHRnlaM1Z0Wlc1MGMxc3pYU3hoY21kMWJXVnVkSE5iTkYwc1lYSm5kVzFsYm5Seld6VmRMR0Z5WjNWdFpXNTBjMXMyWFN4Y0lpOHVMbHhjWEZ3dUxseGNYRnh1YjJSbFgyMXZaSFZzWlhOY1hGeGNZblZtWm1WeVhGeGNYR2x1WkdWNExtcHpYQ0lzWENJdkxpNWNYRnhjTGk1Y1hGeGNibTlrWlY5dGIyUjFiR1Z6WEZ4Y1hHSjFabVpsY2x3aUtTSXNJaWhtZFc1amRHbHZiaUFvY0hKdlkyVnpjeXhuYkc5aVlXd3NRblZtWm1WeUxGOWZZWEpuZFcxbGJuUXdMRjlmWVhKbmRXMWxiblF4TEY5ZllYSm5kVzFsYm5ReUxGOWZZWEpuZFcxbGJuUXpMRjlmWm1sc1pXNWhiV1VzWDE5a2FYSnVZVzFsS1h0Y2JtVjRjRzl5ZEhNdWNtVmhaQ0E5SUdaMWJtTjBhVzl1SUNoaWRXWm1aWElzSUc5bVpuTmxkQ3dnYVhOTVJTd2diVXhsYml3Z2JrSjVkR1Z6S1NCN1hHNGdJSFpoY2lCbExDQnRYRzRnSUhaaGNpQmxUR1Z1SUQwZ2JrSjVkR1Z6SUNvZ09DQXRJRzFNWlc0Z0xTQXhYRzRnSUhaaGNpQmxUV0Y0SUQwZ0tERWdQRHdnWlV4bGJpa2dMU0F4WEc0Z0lIWmhjaUJsUW1saGN5QTlJR1ZOWVhnZ1BqNGdNVnh1SUNCMllYSWdia0pwZEhNZ1BTQXROMXh1SUNCMllYSWdhU0E5SUdselRFVWdQeUFvYmtKNWRHVnpJQzBnTVNrZ09pQXdYRzRnSUhaaGNpQmtJRDBnYVhOTVJTQS9JQzB4SURvZ01WeHVJQ0IyWVhJZ2N5QTlJR0oxWm1abGNsdHZabVp6WlhRZ0t5QnBYVnh1WEc0Z0lHa2dLejBnWkZ4dVhHNGdJR1VnUFNCeklDWWdLQ2d4SUR3OElDZ3Ria0pwZEhNcEtTQXRJREVwWEc0Z0lITWdQajQ5SUNndGJrSnBkSE1wWEc0Z0lHNUNhWFJ6SUNzOUlHVk1aVzVjYmlBZ1ptOXlJQ2c3SUc1Q2FYUnpJRDRnTURzZ1pTQTlJR1VnS2lBeU5UWWdLeUJpZFdabVpYSmJiMlptYzJWMElDc2dhVjBzSUdrZ0t6MGdaQ3dnYmtKcGRITWdMVDBnT0NrZ2UzMWNibHh1SUNCdElEMGdaU0FtSUNnb01TQThQQ0FvTFc1Q2FYUnpLU2tnTFNBeEtWeHVJQ0JsSUQ0K1BTQW9MVzVDYVhSektWeHVJQ0J1UW1sMGN5QXJQU0J0VEdWdVhHNGdJR1p2Y2lBb095QnVRbWwwY3lBK0lEQTdJRzBnUFNCdElDb2dNalUySUNzZ1luVm1abVZ5VzI5bVpuTmxkQ0FySUdsZExDQnBJQ3M5SUdRc0lHNUNhWFJ6SUMwOUlEZ3BJSHQ5WEc1Y2JpQWdhV1lnS0dVZ1BUMDlJREFwSUh0Y2JpQWdJQ0JsSUQwZ01TQXRJR1ZDYVdGelhHNGdJSDBnWld4elpTQnBaaUFvWlNBOVBUMGdaVTFoZUNrZ2UxeHVJQ0FnSUhKbGRIVnliaUJ0SUQ4Z1RtRk9JRG9nS0NoeklEOGdMVEVnT2lBeEtTQXFJRWx1Wm1sdWFYUjVLVnh1SUNCOUlHVnNjMlVnZTF4dUlDQWdJRzBnUFNCdElDc2dUV0YwYUM1d2IzY29NaXdnYlV4bGJpbGNiaUFnSUNCbElEMGdaU0F0SUdWQ2FXRnpYRzRnSUgxY2JpQWdjbVYwZFhKdUlDaHpJRDhnTFRFZ09pQXhLU0FxSUcwZ0tpQk5ZWFJvTG5CdmR5Z3lMQ0JsSUMwZ2JVeGxiaWxjYm4xY2JseHVaWGh3YjNKMGN5NTNjbWwwWlNBOUlHWjFibU4wYVc5dUlDaGlkV1ptWlhJc0lIWmhiSFZsTENCdlptWnpaWFFzSUdselRFVXNJRzFNWlc0c0lHNUNlWFJsY3lrZ2UxeHVJQ0IyWVhJZ1pTd2diU3dnWTF4dUlDQjJZWElnWlV4bGJpQTlJRzVDZVhSbGN5QXFJRGdnTFNCdFRHVnVJQzBnTVZ4dUlDQjJZWElnWlUxaGVDQTlJQ2d4SUR3OElHVk1aVzRwSUMwZ01WeHVJQ0IyWVhJZ1pVSnBZWE1nUFNCbFRXRjRJRDQrSURGY2JpQWdkbUZ5SUhKMElEMGdLRzFNWlc0Z1BUMDlJREl6SUQ4Z1RXRjBhQzV3YjNjb01pd2dMVEkwS1NBdElFMWhkR2d1Y0c5M0tESXNJQzAzTnlrZ09pQXdLVnh1SUNCMllYSWdhU0E5SUdselRFVWdQeUF3SURvZ0tHNUNlWFJsY3lBdElERXBYRzRnSUhaaGNpQmtJRDBnYVhOTVJTQS9JREVnT2lBdE1WeHVJQ0IyWVhJZ2N5QTlJSFpoYkhWbElEd2dNQ0I4ZkNBb2RtRnNkV1VnUFQwOUlEQWdKaVlnTVNBdklIWmhiSFZsSUR3Z01Da2dQeUF4SURvZ01GeHVYRzRnSUhaaGJIVmxJRDBnVFdGMGFDNWhZbk1vZG1Gc2RXVXBYRzVjYmlBZ2FXWWdLR2x6VG1GT0tIWmhiSFZsS1NCOGZDQjJZV3gxWlNBOVBUMGdTVzVtYVc1cGRIa3BJSHRjYmlBZ0lDQnRJRDBnYVhOT1lVNG9kbUZzZFdVcElEOGdNU0E2SURCY2JpQWdJQ0JsSUQwZ1pVMWhlRnh1SUNCOUlHVnNjMlVnZTF4dUlDQWdJR1VnUFNCTllYUm9MbVpzYjI5eUtFMWhkR2d1Ykc5bktIWmhiSFZsS1NBdklFMWhkR2d1VEU0eUtWeHVJQ0FnSUdsbUlDaDJZV3gxWlNBcUlDaGpJRDBnVFdGMGFDNXdiM2NvTWl3Z0xXVXBLU0E4SURFcElIdGNiaUFnSUNBZ0lHVXRMVnh1SUNBZ0lDQWdZeUFxUFNBeVhHNGdJQ0FnZlZ4dUlDQWdJR2xtSUNobElDc2daVUpwWVhNZ1BqMGdNU2tnZTF4dUlDQWdJQ0FnZG1Gc2RXVWdLejBnY25RZ0x5QmpYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUhaaGJIVmxJQ3M5SUhKMElDb2dUV0YwYUM1d2IzY29NaXdnTVNBdElHVkNhV0Z6S1Z4dUlDQWdJSDFjYmlBZ0lDQnBaaUFvZG1Gc2RXVWdLaUJqSUQ0OUlESXBJSHRjYmlBZ0lDQWdJR1VySzF4dUlDQWdJQ0FnWXlBdlBTQXlYRzRnSUNBZ2ZWeHVYRzRnSUNBZ2FXWWdLR1VnS3lCbFFtbGhjeUErUFNCbFRXRjRLU0I3WEc0Z0lDQWdJQ0J0SUQwZ01GeHVJQ0FnSUNBZ1pTQTlJR1ZOWVhoY2JpQWdJQ0I5SUdWc2MyVWdhV1lnS0dVZ0t5QmxRbWxoY3lBK1BTQXhLU0I3WEc0Z0lDQWdJQ0J0SUQwZ0tIWmhiSFZsSUNvZ1l5QXRJREVwSUNvZ1RXRjBhQzV3YjNjb01pd2diVXhsYmlsY2JpQWdJQ0FnSUdVZ1BTQmxJQ3NnWlVKcFlYTmNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnYlNBOUlIWmhiSFZsSUNvZ1RXRjBhQzV3YjNjb01pd2daVUpwWVhNZ0xTQXhLU0FxSUUxaGRHZ3VjRzkzS0RJc0lHMU1aVzRwWEc0Z0lDQWdJQ0JsSUQwZ01GeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lHWnZjaUFvT3lCdFRHVnVJRDQ5SURnN0lHSjFabVpsY2x0dlptWnpaWFFnS3lCcFhTQTlJRzBnSmlBd2VHWm1MQ0JwSUNzOUlHUXNJRzBnTHowZ01qVTJMQ0J0VEdWdUlDMDlJRGdwSUh0OVhHNWNiaUFnWlNBOUlDaGxJRHc4SUcxTVpXNHBJSHdnYlZ4dUlDQmxUR1Z1SUNzOUlHMU1aVzVjYmlBZ1ptOXlJQ2c3SUdWTVpXNGdQaUF3T3lCaWRXWm1aWEpiYjJabWMyVjBJQ3NnYVYwZ1BTQmxJQ1lnTUhobVppd2dhU0FyUFNCa0xDQmxJQzg5SURJMU5pd2daVXhsYmlBdFBTQTRLU0I3ZlZ4dVhHNGdJR0oxWm1abGNsdHZabVp6WlhRZ0t5QnBJQzBnWkYwZ2ZEMGdjeUFxSURFeU9GeHVmVnh1WEc1OUtTNWpZV3hzS0hSb2FYTXNjbVZ4ZFdseVpTaGNJbVV2VlNzNU4xd2lLU3gwZVhCbGIyWWdjMlZzWmlBaFBUMGdYQ0oxYm1SbFptbHVaV1JjSWlBL0lITmxiR1lnT2lCMGVYQmxiMllnZDJsdVpHOTNJQ0U5UFNCY0luVnVaR1ZtYVc1bFpGd2lJRDhnZDJsdVpHOTNJRG9nZTMwc2NtVnhkV2x5WlNoY0ltSjFabVpsY2x3aUtTNUNkV1ptWlhJc1lYSm5kVzFsYm5Seld6TmRMR0Z5WjNWdFpXNTBjMXMwWFN4aGNtZDFiV1Z1ZEhOYk5WMHNZWEpuZFcxbGJuUnpXelpkTEZ3aUx5NHVYRnhjWEM0dVhGeGNYRzV2WkdWZmJXOWtkV3hsYzF4Y1hGeHBaV1ZsTnpVMFhGeGNYR2x1WkdWNExtcHpYQ0lzWENJdkxpNWNYRnhjTGk1Y1hGeGNibTlrWlY5dGIyUjFiR1Z6WEZ4Y1hHbGxaV1UzTlRSY0lpa2lMQ0lvWm5WdVkzUnBiMjRnS0hCeWIyTmxjM01zWjJ4dlltRnNMRUoxWm1abGNpeGZYMkZ5WjNWdFpXNTBNQ3hmWDJGeVozVnRaVzUwTVN4ZlgyRnlaM1Z0Wlc1ME1peGZYMkZ5WjNWdFpXNTBNeXhmWDJacGJHVnVZVzFsTEY5ZlpHbHlibUZ0WlNsN1hHNHZMeUJ6YUdsdElHWnZjaUIxYzJsdVp5QndjbTlqWlhOeklHbHVJR0p5YjNkelpYSmNibHh1ZG1GeUlIQnliMk5sYzNNZ1BTQnRiMlIxYkdVdVpYaHdiM0owY3lBOUlIdDlPMXh1WEc1d2NtOWpaWE56TG01bGVIUlVhV05ySUQwZ0tHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQjJZWElnWTJGdVUyVjBTVzF0WldScFlYUmxJRDBnZEhsd1pXOW1JSGRwYm1SdmR5QWhQVDBnSjNWdVpHVm1hVzVsWkNkY2JpQWdJQ0FtSmlCM2FXNWtiM2N1YzJWMFNXMXRaV1JwWVhSbE8xeHVJQ0FnSUhaaGNpQmpZVzVRYjNOMElEMGdkSGx3Wlc5bUlIZHBibVJ2ZHlBaFBUMGdKM1Z1WkdWbWFXNWxaQ2RjYmlBZ0lDQW1KaUIzYVc1a2IzY3VjRzl6ZEUxbGMzTmhaMlVnSmlZZ2QybHVaRzkzTG1Ga1pFVjJaVzUwVEdsemRHVnVaWEpjYmlBZ0lDQTdYRzVjYmlBZ0lDQnBaaUFvWTJGdVUyVjBTVzF0WldScFlYUmxLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJtZFc1amRHbHZiaUFvWmlrZ2V5QnlaWFIxY200Z2QybHVaRzkzTG5ObGRFbHRiV1ZrYVdGMFpTaG1LU0I5TzF4dUlDQWdJSDFjYmx4dUlDQWdJR2xtSUNoallXNVFiM04wS1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJ4ZFdWMVpTQTlJRnRkTzF4dUlDQWdJQ0FnSUNCM2FXNWtiM2N1WVdSa1JYWmxiblJNYVhOMFpXNWxjaWduYldWemMyRm5aU2NzSUdaMWJtTjBhVzl1SUNobGRpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJSE52ZFhKalpTQTlJR1YyTG5OdmRYSmpaVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2dvYzI5MWNtTmxJRDA5UFNCM2FXNWtiM2NnZkh3Z2MyOTFjbU5sSUQwOVBTQnVkV3hzS1NBbUppQmxkaTVrWVhSaElEMDlQU0FuY0hKdlkyVnpjeTEwYVdOckp5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1YyTG5OMGIzQlFjbTl3WVdkaGRHbHZiaWdwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaHhkV1YxWlM1c1pXNW5kR2dnUGlBd0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQm1iaUE5SUhGMVpYVmxMbk5vYVdaMEtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdadUtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlMQ0IwY25WbEtUdGNibHh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdablZ1WTNScGIyNGdibVY0ZEZScFkyc29abTRwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEYxWlhWbExuQjFjMmdvWm00cE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZDJsdVpHOTNMbkJ2YzNSTlpYTnpZV2RsS0Nkd2NtOWpaWE56TFhScFkyc25MQ0FuS2ljcE8xeHVJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lIMWNibHh1SUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlCdVpYaDBWR2xqYXlobWJpa2dlMXh1SUNBZ0lDQWdJQ0J6WlhSVWFXMWxiM1YwS0dadUxDQXdLVHRjYmlBZ0lDQjlPMXh1ZlNrb0tUdGNibHh1Y0hKdlkyVnpjeTUwYVhSc1pTQTlJQ2RpY205M2MyVnlKenRjYm5CeWIyTmxjM011WW5KdmQzTmxjaUE5SUhSeWRXVTdYRzV3Y205alpYTnpMbVZ1ZGlBOUlIdDlPMXh1Y0hKdlkyVnpjeTVoY21kMklEMGdXMTA3WEc1Y2JtWjFibU4wYVc5dUlHNXZiM0FvS1NCN2ZWeHVYRzV3Y205alpYTnpMbTl1SUQwZ2JtOXZjRHRjYm5CeWIyTmxjM011WVdSa1RHbHpkR1Z1WlhJZ1BTQnViMjl3TzF4dWNISnZZMlZ6Y3k1dmJtTmxJRDBnYm05dmNEdGNibkJ5YjJObGMzTXViMlptSUQwZ2JtOXZjRHRjYm5CeWIyTmxjM011Y21WdGIzWmxUR2x6ZEdWdVpYSWdQU0J1YjI5d08xeHVjSEp2WTJWemN5NXlaVzF2ZG1WQmJHeE1hWE4wWlc1bGNuTWdQU0J1YjI5d08xeHVjSEp2WTJWemN5NWxiV2wwSUQwZ2JtOXZjRHRjYmx4dWNISnZZMlZ6Y3k1aWFXNWthVzVuSUQwZ1puVnVZM1JwYjI0Z0tHNWhiV1VwSUh0Y2JpQWdJQ0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9KM0J5YjJObGMzTXVZbWx1WkdsdVp5QnBjeUJ1YjNRZ2MzVndjRzl5ZEdWa0p5azdYRzU5WEc1Y2JpOHZJRlJQUkU4b2MyaDBlV3h0WVc0cFhHNXdjbTlqWlhOekxtTjNaQ0E5SUdaMWJtTjBhVzl1SUNncElIc2djbVYwZFhKdUlDY3ZKeUI5TzF4dWNISnZZMlZ6Y3k1amFHUnBjaUE5SUdaMWJtTjBhVzl1SUNoa2FYSXBJSHRjYmlBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0ozQnliMk5sYzNNdVkyaGthWElnYVhNZ2JtOTBJSE4xY0hCdmNuUmxaQ2NwTzF4dWZUdGNibHh1ZlNrdVkyRnNiQ2gwYUdsekxISmxjWFZwY21Vb1hDSmxMMVVyT1RkY0lpa3NkSGx3Wlc5bUlITmxiR1lnSVQwOUlGd2lkVzVrWldacGJtVmtYQ0lnUHlCelpXeG1JRG9nZEhsd1pXOW1JSGRwYm1SdmR5QWhQVDBnWENKMWJtUmxabWx1WldSY0lpQS9JSGRwYm1SdmR5QTZJSHQ5TEhKbGNYVnBjbVVvWENKaWRXWm1aWEpjSWlrdVFuVm1abVZ5TEdGeVozVnRaVzUwYzFzelhTeGhjbWQxYldWdWRITmJORjBzWVhKbmRXMWxiblJ6V3pWZExHRnlaM1Z0Wlc1MGMxczJYU3hjSWk4dUxseGNYRnd1TGx4Y1hGeHViMlJsWDIxdlpIVnNaWE5jWEZ4Y2NISnZZMlZ6YzF4Y1hGeGljbTkzYzJWeUxtcHpYQ0lzWENJdkxpNWNYRnhjTGk1Y1hGeGNibTlrWlY5dGIyUjFiR1Z6WEZ4Y1hIQnliMk5sYzNOY0lpa2lMQ0lvWm5WdVkzUnBiMjRnS0hCeWIyTmxjM01zWjJ4dlltRnNMRUoxWm1abGNpeGZYMkZ5WjNWdFpXNTBNQ3hmWDJGeVozVnRaVzUwTVN4ZlgyRnlaM1Z0Wlc1ME1peGZYMkZ5WjNWdFpXNTBNeXhmWDJacGJHVnVZVzFsTEY5ZlpHbHlibUZ0WlNsN1hHNG5kWE5sSUhOMGNtbGpkQ2M3WEc1Y2JuWmhjaUJwYm5OMFlXNWpaWE1nUFNCN2ZUdGNibHh1THk4OUlGOW1kVzVqZEdsdmJuTXVhbk5jYmk4dlBTQmZjM1J2Y21VdVkyeGhjM011YW5OY2JpOHZQU0JmYlc5a1lXd3VZMnhoYzNNdWFuTmNiaTh2UFNCZmNISnZaSFZqZEM1amJHRnpjeTVxYzF4dUx5ODlJRjlpWVhOclpYUXVZMnhoYzNNdWFuTmNiaTh2UFNCZlptbHNkR1Z5TG1Oc1lYTnpMbXB6WEc1Y2JuZHBibVJ2ZHk1dmJteHZZV1FnUFNCbWRXNWpkR2x2YmlBb0tTQjdYRzRnSUhaaGNpQndjbTlrZFdOMGN5QTlJRzVsZHlCVGRHOXlaU2duYzNSaGRHbGpMM0J5YjJSMVkzUnpMbXB6YjI0bkxDQW5JM0J5YjJSMVkzUnpJQzVqYjI1MFpXNTBKeWs3WEc0Z0lIQnliMlIxWTNSekxtOXVURzloWkNBOUlHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQjJZWElnYm1GMklEMGdaRzlqZFcxbGJuUXVjWFZsY25sVFpXeGxZM1J2Y2lnbmJtRjJKeWtzWEc0Z0lDQWdJQ0FnSUdGemFXUmxJRDBnWkc5amRXMWxiblF1Y1hWbGNubFRaV3hsWTNSdmNpZ25ZWE5wWkdVbktTeGNiaUFnSUNBZ0lDQWdjMnhwWkdVZ1BTQmtiMk4xYldWdWRDNXhkV1Z5ZVZObGJHVmpkRzl5S0NkaGMybGtaU0F1YzJ4cFpHVW5LVHRjYmlBZ0lDQjNhVzVrYjNjdWIyNXpZM0p2Ykd3Z1BTQm1kVzVqZEdsdmJpQW9aU2tnZTF4dUlDQWdJQ0FnZG1GeUlHTnZjbkpsWTNSVFkzSnZiR3dnUFNCbExuUmhjbWRsZEM1elkzSnZiR3hwYm1kRmJHVnRaVzUwTG5OamNtOXNiRlJ2Y0NBdElHRnphV1JsTG05bVpuTmxkRlJ2Y0NBcklHNWhkaTV2Wm1aelpYUklaV2xuYUhRN1hHNGdJQ0FnSUNCcFppQW9ZMjl5Y21WamRGTmpjbTlzYkNBOElEQXBJSE5zYVdSbExuTjBlV3hsTG5SeVlXNXpabTl5YlNBOUlDZDBjbUZ1YzJ4aGRHVlpLREJ3ZUNrbk8yVnNjMlVnYVdZZ0tHTnZjbkpsWTNSVFkzSnZiR3dnUGlCaGMybGtaUzV2Wm1aelpYUklaV2xuYUhRZ0xTQnpiR2xrWlM1dlptWnpaWFJJWldsbmFIUXBJSE5zYVdSbExuTjBlV3hsTG5SeVlXNXpabTl5YlNBOUlDZDBjbUZ1YzJ4aGRHVlpLQ2NnS3lBb1lYTnBaR1V1YjJabWMyVjBTR1ZwWjJoMElDMGdjMnhwWkdVdWIyWm1jMlYwU0dWcFoyaDBLU0FySUNkd2VDa25PMlZzYzJVZ2FXWWdLR052Y25KbFkzUlRZM0p2Ykd3Z1BpQXdJQ1ltSUdOdmNuSmxZM1JUWTNKdmJHd2dQQ0JoYzJsa1pTNXZabVp6WlhSSVpXbG5hSFFnTFNCemJHbGtaUzV2Wm1aelpYUklaV2xuYUhRcElITnNhV1JsTG5OMGVXeGxMblJ5WVc1elptOXliU0E5SUNkMGNtRnVjMnhoZEdWWktDY2dLeUJqYjNKeVpXTjBVMk55YjJ4c0lDc2dKM0I0S1NjN1hHNGdJQ0FnZlR0Y2JpQWdmVHRjYm4wN1hHNTlLUzVqWVd4c0tIUm9hWE1zY21WeGRXbHlaU2hjSW1VdlZTczVOMXdpS1N4MGVYQmxiMllnYzJWc1ppQWhQVDBnWENKMWJtUmxabWx1WldSY0lpQS9JSE5sYkdZZ09pQjBlWEJsYjJZZ2QybHVaRzkzSUNFOVBTQmNJblZ1WkdWbWFXNWxaRndpSUQ4Z2QybHVaRzkzSURvZ2UzMHNjbVZ4ZFdseVpTaGNJbUoxWm1abGNsd2lLUzVDZFdabVpYSXNZWEpuZFcxbGJuUnpXek5kTEdGeVozVnRaVzUwYzFzMFhTeGhjbWQxYldWdWRITmJOVjBzWVhKbmRXMWxiblJ6V3paZExGd2lMMlpoYTJWZk5UUmpOMlpsWkdVdWFuTmNJaXhjSWk5Y0lpa2lYWDA9Il19
