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
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_4bb553f.js","/")
},{"buffer":2,"e/U+97":4}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxQcm9qZWN0c1xca3VwZWNoZXNraXlkb21cXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkM6L1Byb2plY3RzL2t1cGVjaGVza2l5ZG9tL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIkM6L1Byb2plY3RzL2t1cGVjaGVza2l5ZG9tL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCJDOi9Qcm9qZWN0cy9rdXBlY2hlc2tpeWRvbS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIkM6L1Byb2plY3RzL2t1cGVjaGVza2l5ZG9tL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJDOi9Qcm9qZWN0cy9rdXBlY2hlc2tpeWRvbS9zcmMvanMvZmFrZV80YmI1NTNmLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcXFxcYjY0LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxidWZmZXJcXFxcaW5kZXguanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGllZWU3NTRcXFxcaW5kZXguanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcaWVlZTc1NFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXFxcXGJyb3dzZXIuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxccHJvY2Vzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGluc3RhbmNlcyA9IHt9O1xuXG4vLz0gX2Z1bmN0aW9ucy5qc1xuLy89IF9zdG9yZS5jbGFzcy5qc1xuLy89IF9tb2RhbC5jbGFzcy5qc1xuLy89IF9wcm9kdWN0LmNsYXNzLmpzXG4vLz0gX2Jhc2tldC5jbGFzcy5qc1xuLy89IF9maWx0ZXIuY2xhc3MuanNcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHByb2R1Y3RzID0gbmV3IFN0b3JlKCdzdGF0aWMvcHJvZHVjdHMuanNvbicsICcjcHJvZHVjdHMgLmNvbnRlbnQnKTtcbiAgcHJvZHVjdHMub25Mb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBuYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCduYXYnKSxcbiAgICAgICAgYXNpZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhc2lkZScpLFxuICAgICAgICBzbGlkZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FzaWRlIC5zbGlkZScpO1xuICAgIHdpbmRvdy5vbnNjcm9sbCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgY29ycmVjdFNjcm9sbCA9IGUudGFyZ2V0LnNjcm9sbGluZ0VsZW1lbnQuc2Nyb2xsVG9wIC0gYXNpZGUub2Zmc2V0VG9wICsgbmF2Lm9mZnNldEhlaWdodDtcbiAgICAgIGlmIChjb3JyZWN0U2Nyb2xsIDwgMCkgc2xpZGUuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMHB4KSc7ZWxzZSBpZiAoY29ycmVjdFNjcm9sbCA+IGFzaWRlLm9mZnNldEhlaWdodCAtIHNsaWRlLm9mZnNldEhlaWdodCkgc2xpZGUuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoJyArIChhc2lkZS5vZmZzZXRIZWlnaHQgLSBzbGlkZS5vZmZzZXRIZWlnaHQpICsgJ3B4KSc7ZWxzZSBpZiAoY29ycmVjdFNjcm9sbCA+IDAgJiYgY29ycmVjdFNjcm9sbCA8IGFzaWRlLm9mZnNldEhlaWdodCAtIHNsaWRlLm9mZnNldEhlaWdodCkgc2xpZGUuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoJyArIGNvcnJlY3RTY3JvbGwgKyAncHgpJztcbiAgICB9O1xuICB9O1xufTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZmFrZV80YmI1NTNmLmpzXCIsXCIvXCIpIl19
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xyXG4oZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XHJcbnZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XHJcblxyXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcclxuICAgID8gVWludDhBcnJheVxyXG4gICAgOiBBcnJheVxyXG5cclxuXHR2YXIgUExVUyAgID0gJysnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgTE9XRVIgID0gJ2EnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXHJcblx0dmFyIFNMQVNIX1VSTF9TQUZFID0gJ18nLmNoYXJDb2RlQXQoMClcclxuXHJcblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcclxuXHRcdHZhciBjb2RlID0gZWx0LmNoYXJDb2RlQXQoMClcclxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XHJcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcclxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xyXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XHJcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXHJcblx0XHRcdHJldHVybiA2MyAvLyAnLydcclxuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxyXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxyXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcclxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XHJcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXHJcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcclxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcclxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XHJcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxyXG5cclxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0JylcclxuXHRcdH1cclxuXHJcblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxyXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxyXG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXHJcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcclxuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2VcclxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXHJcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcclxuXHJcblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcclxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxyXG5cclxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcclxuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXHJcblxyXG5cdFx0dmFyIEwgPSAwXHJcblxyXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xyXG5cdFx0XHRhcnJbTCsrXSA9IHZcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XHJcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXHJcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcclxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxyXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xyXG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcclxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxyXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcclxuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXHJcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXHJcblx0XHRcdHB1c2godG1wICYgMHhGRilcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYXJyXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xyXG5cdFx0dmFyIGksXHJcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xyXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxyXG5cdFx0XHR0ZW1wLCBsZW5ndGhcclxuXHJcblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xyXG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcclxuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XHJcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXHJcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcclxuXHRcdH1cclxuXHJcblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXHJcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcclxuXHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxyXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXHJcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxyXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRwdXRcclxuXHR9XHJcblxyXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxyXG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcclxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxyXG5cclxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYmFzZTY0LWpzXFxcXGxpYlxcXFxiNjQuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYmFzZTY0LWpzXFxcXGxpYlwiKVxyXG59LHtcImJ1ZmZlclwiOjIsXCJlL1UrOTdcIjo0fV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcclxuLyohXHJcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxyXG4gKlxyXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cclxuICogQGxpY2Vuc2UgIE1JVFxyXG4gKi9cclxuXHJcbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxyXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxyXG5cclxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXHJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxyXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXHJcblxyXG4vKipcclxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxyXG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxyXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXHJcbiAqL1xyXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcclxuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxyXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcclxuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XHJcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcclxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XHJcbiAgdHJ5IHtcclxuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcclxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXHJcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxyXG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcclxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufSkoKVxyXG5cclxuLyoqXHJcbiAqIENsYXNzOiBCdWZmZXJcclxuICogPT09PT09PT09PT09PVxyXG4gKlxyXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcclxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXHJcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcclxuICogYSBzaW5nbGUgb2N0ZXQuXHJcbiAqXHJcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXHJcbiAqIHByb3RvdHlwZS5cclxuICovXHJcbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xyXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxyXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcclxuXHJcbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxyXG5cclxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXHJcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxyXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXHJcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XHJcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBGaW5kIHRoZSBsZW5ndGhcclxuICB2YXIgbGVuZ3RoXHJcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxyXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXHJcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXHJcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcclxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcclxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcclxuICBlbHNlXHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcclxuXHJcbiAgdmFyIGJ1ZlxyXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XHJcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXHJcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcclxuICAgIGJ1ZiA9IHRoaXNcclxuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcclxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXHJcbiAgfVxyXG5cclxuICB2YXIgaVxyXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XHJcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxyXG4gICAgYnVmLl9zZXQoc3ViamVjdClcclxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcclxuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxyXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXHJcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cclxuICAgIH1cclxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXHJcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgYnVmW2ldID0gMFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ1ZlxyXG59XHJcblxyXG4vLyBTVEFUSUMgTUVUSE9EU1xyXG4vLyA9PT09PT09PT09PT09PVxyXG5cclxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcclxuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgY2FzZSAnaGV4JzpcclxuICAgIGNhc2UgJ3V0ZjgnOlxyXG4gICAgY2FzZSAndXRmLTgnOlxyXG4gICAgY2FzZSAnYXNjaWknOlxyXG4gICAgY2FzZSAnYmluYXJ5JzpcclxuICAgIGNhc2UgJ2Jhc2U2NCc6XHJcbiAgICBjYXNlICdyYXcnOlxyXG4gICAgY2FzZSAndWNzMic6XHJcbiAgICBjYXNlICd1Y3MtMic6XHJcbiAgICBjYXNlICd1dGYxNmxlJzpcclxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcclxuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXHJcbn1cclxuXHJcbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcclxuICB2YXIgcmV0XHJcbiAgc3RyID0gc3RyICsgJydcclxuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xyXG4gICAgY2FzZSAnaGV4JzpcclxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3V0ZjgnOlxyXG4gICAgY2FzZSAndXRmLTgnOlxyXG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYXNjaWknOlxyXG4gICAgY2FzZSAnYmluYXJ5JzpcclxuICAgIGNhc2UgJ3Jhdyc6XHJcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2Jhc2U2NCc6XHJcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3VjczInOlxyXG4gICAgY2FzZSAndWNzLTInOlxyXG4gICAgY2FzZSAndXRmMTZsZSc6XHJcbiAgICBjYXNlICd1dGYtMTZsZSc6XHJcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxyXG4gIH1cclxuICByZXR1cm4gcmV0XHJcbn1cclxuXHJcbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcclxuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXHJcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxyXG5cclxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXHJcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xyXG4gICAgcmV0dXJuIGxpc3RbMF1cclxuICB9XHJcblxyXG4gIHZhciBpXHJcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcclxuICAgIHRvdGFsTGVuZ3RoID0gMFxyXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxyXG4gIHZhciBwb3MgPSAwXHJcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBpdGVtID0gbGlzdFtpXVxyXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxyXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXHJcbiAgfVxyXG4gIHJldHVybiBidWZcclxufVxyXG5cclxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxyXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XHJcbiAgaWYgKCFsZW5ndGgpIHtcclxuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxyXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xyXG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXHJcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcclxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXHJcblxyXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XHJcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXHJcbiAgfVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxyXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXHJcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXHJcbiAgfVxyXG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcclxuICByZXR1cm4gaVxyXG59XHJcblxyXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxyXG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxyXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cclxufVxyXG5cclxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XHJcbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxyXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cclxufVxyXG5cclxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG59XHJcblxyXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XHJcbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcclxuICByZXR1cm4gY2hhcnNXcml0dGVuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XHJcbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XHJcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcclxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcclxuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xyXG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxyXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcclxuICAgIH1cclxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XHJcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXHJcbiAgICBlbmNvZGluZyA9IG9mZnNldFxyXG4gICAgb2Zmc2V0ID0gbGVuZ3RoXHJcbiAgICBsZW5ndGggPSBzd2FwXHJcbiAgfVxyXG5cclxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXHJcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XHJcbiAgaWYgKCFsZW5ndGgpIHtcclxuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxyXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xyXG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcclxuICAgIH1cclxuICB9XHJcbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXHJcblxyXG4gIHZhciByZXRcclxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XHJcbiAgICBjYXNlICdoZXgnOlxyXG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3V0ZjgnOlxyXG4gICAgY2FzZSAndXRmLTgnOlxyXG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdhc2NpaSc6XHJcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdiaW5hcnknOlxyXG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2Jhc2U2NCc6XHJcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndWNzMic6XHJcbiAgICBjYXNlICd1Y3MtMic6XHJcbiAgICBjYXNlICd1dGYxNmxlJzpcclxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcclxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gICAgICBicmVha1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcclxuICB9XHJcbiAgcmV0dXJuIHJldFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XHJcbiAgdmFyIHNlbGYgPSB0aGlzXHJcblxyXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxyXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXHJcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgPyBOdW1iZXIoZW5kKVxyXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxyXG5cclxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXHJcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXHJcbiAgICByZXR1cm4gJydcclxuXHJcbiAgdmFyIHJldFxyXG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcclxuICAgIGNhc2UgJ2hleCc6XHJcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndXRmOCc6XHJcbiAgICBjYXNlICd1dGYtOCc6XHJcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2FzY2lpJzpcclxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2JpbmFyeSc6XHJcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYmFzZTY0JzpcclxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd1Y3MyJzpcclxuICAgIGNhc2UgJ3Vjcy0yJzpcclxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxyXG4gICAgY2FzZSAndXRmLTE2bGUnOlxyXG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxyXG4gIH1cclxuICByZXR1cm4gcmV0XHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0eXBlOiAnQnVmZmVyJyxcclxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxyXG4gIH1cclxufVxyXG5cclxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxyXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgc291cmNlID0gdGhpc1xyXG5cclxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcclxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXHJcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcclxuXHJcbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXHJcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxyXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxyXG5cclxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXHJcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcclxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcclxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxyXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxyXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcclxuXHJcbiAgLy8gQXJlIHdlIG9vYj9cclxuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXHJcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxyXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXHJcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcclxuXHJcbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XHJcblxyXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXHJcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxyXG4gIH0gZWxzZSB7XHJcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XHJcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xyXG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciByZXMgPSAnJ1xyXG4gIHZhciB0bXAgPSAnJ1xyXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcclxuXHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcclxuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xyXG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxyXG4gICAgICB0bXAgPSAnJ1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgcmV0ID0gJydcclxuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXHJcblxyXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxyXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxyXG4gIHJldHVybiByZXRcclxufVxyXG5cclxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcclxuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxyXG59XHJcblxyXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcblxyXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcclxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXHJcblxyXG4gIHZhciBvdXQgPSAnJ1xyXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XHJcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxyXG4gIH1cclxuICByZXR1cm4gb3V0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxyXG4gIHZhciByZXMgPSAnJ1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcclxuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcclxuICB9XHJcbiAgcmV0dXJuIHJlc1xyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcclxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXHJcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcclxuXHJcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcclxuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcclxuICB9IGVsc2Uge1xyXG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcclxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcclxuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3QnVmXHJcbiAgfVxyXG59XHJcblxyXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xyXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcclxuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcclxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxyXG59XHJcblxyXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xyXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcclxuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcclxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHJldHVybiB0aGlzW29mZnNldF1cclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdmFyIHZhbFxyXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcclxuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXHJcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcclxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcclxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxyXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXHJcbiAgfVxyXG4gIHJldHVybiB2YWxcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICB2YXIgdmFsXHJcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xyXG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXHJcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxyXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXHJcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxyXG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXHJcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcclxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXHJcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxyXG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXHJcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxyXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXHJcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cclxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcclxuICB9XHJcbiAgcmV0dXJuIHZhbFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXHJcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcclxuICBpZiAobmVnKVxyXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxyXG4gIGVsc2VcclxuICAgIHJldHVybiB0aGlzW29mZnNldF1cclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcclxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXHJcbiAgaWYgKG5lZylcclxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxyXG4gIGVsc2VcclxuICAgIHJldHVybiB2YWxcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXHJcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcclxuICBpZiAobmVnKVxyXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxyXG4gIGVsc2VcclxuICAgIHJldHVybiB2YWxcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxyXG4gIH1cclxuXHJcbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXHJcblxyXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xyXG4gICAgYnVmW29mZnNldCArIGldID1cclxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxyXG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcclxuICB9XHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xyXG4gICAgYnVmW29mZnNldCArIGldID1cclxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXHJcbiAgfVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcclxuICB9XHJcblxyXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgKHZhbHVlID49IDApXHJcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXHJcbiAgZWxzZVxyXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgKHZhbHVlID49IDApXHJcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxyXG4gIGVsc2VcclxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmICh2YWx1ZSA+PSAwKVxyXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcclxuICBlbHNlXHJcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxyXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcclxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XHJcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXHJcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXHJcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXHJcblxyXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcclxuICB9XHJcblxyXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxyXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXHJcblxyXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxyXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cclxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxyXG5cclxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXHJcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcclxuXHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcclxuICAgIHRoaXNbaV0gPSB2YWx1ZVxyXG4gIH1cclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBvdXQgPSBbXVxyXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXHJcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xyXG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcclxuICAgICAgYnJlYWtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXHJcbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxyXG4gKi9cclxuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xyXG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XHJcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXHJcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxyXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcclxuICB9XHJcbn1cclxuXHJcbi8vIEhFTFBFUiBGVU5DVElPTlNcclxuLy8gPT09PT09PT09PT09PT09PVxyXG5cclxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XHJcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxyXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXHJcbn1cclxuXHJcbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcclxuXHJcbi8qKlxyXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXHJcbiAqL1xyXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XHJcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcclxuXHJcbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXHJcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XHJcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XHJcblxyXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXHJcbiAgYXJyLmdldCA9IEJQLmdldFxyXG4gIGFyci5zZXQgPSBCUC5zZXRcclxuXHJcbiAgYXJyLndyaXRlID0gQlAud3JpdGVcclxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xyXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXHJcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxyXG4gIGFyci5jb3B5ID0gQlAuY29weVxyXG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXHJcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxyXG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcclxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXHJcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxyXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcclxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxyXG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXHJcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcclxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxyXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXHJcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcclxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxyXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcclxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXHJcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XHJcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXHJcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXHJcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXHJcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXHJcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxyXG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcclxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXHJcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxyXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcclxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXHJcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxyXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxyXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxyXG4gIGFyci5maWxsID0gQlAuZmlsbFxyXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxyXG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxyXG5cclxuICByZXR1cm4gYXJyXHJcbn1cclxuXHJcbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXHJcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcclxuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxyXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxyXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cclxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XHJcbiAgaW5kZXggKz0gbGVuXHJcbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxyXG4gIHJldHVybiAwXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XHJcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcclxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcclxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cclxuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxyXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxyXG59XHJcblxyXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XHJcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXHJcbiAgfSkoc3ViamVjdClcclxufVxyXG5cclxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xyXG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxyXG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxyXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvSGV4IChuKSB7XHJcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXHJcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcclxuICB2YXIgYnl0ZUFycmF5ID0gW11cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxyXG4gICAgaWYgKGIgPD0gMHg3RilcclxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXHJcbiAgICBlbHNlIHtcclxuICAgICAgdmFyIHN0YXJ0ID0gaVxyXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xyXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcclxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBieXRlQXJyYXlcclxufVxyXG5cclxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcclxuICB2YXIgYnl0ZUFycmF5ID0gW11cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xyXG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXHJcbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXHJcbiAgfVxyXG4gIHJldHVybiBieXRlQXJyYXlcclxufVxyXG5cclxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xyXG4gIHZhciBjLCBoaSwgbG9cclxuICB2YXIgYnl0ZUFycmF5ID0gW11cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xyXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXHJcbiAgICBoaSA9IGMgPj4gOFxyXG4gICAgbG8gPSBjICUgMjU2XHJcbiAgICBieXRlQXJyYXkucHVzaChsbylcclxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ5dGVBcnJheVxyXG59XHJcblxyXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcclxuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcclxufVxyXG5cclxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgdmFyIHBvc1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcclxuICAgICAgYnJlYWtcclxuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxyXG4gIH1cclxuICByZXR1cm4gaVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcclxuICB9XHJcbn1cclxuXHJcbi8qXHJcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XHJcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XHJcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxyXG4gKi9cclxuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XHJcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcclxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcclxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXHJcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50JylcclxufVxyXG5cclxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcclxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxyXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxyXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcclxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxyXG59XHJcblxyXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xyXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXHJcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXHJcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxyXG59XHJcblxyXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcclxuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcclxufVxyXG5cclxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYnVmZmVyXFxcXGluZGV4LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJ1ZmZlclwiKVxyXG59LHtcImJhc2U2NC1qc1wiOjEsXCJidWZmZXJcIjoyLFwiZS9VKzk3XCI6NCxcImllZWU3NTRcIjozfV0sMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcclxuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcclxuICB2YXIgZSwgbVxyXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXHJcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcclxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcclxuICB2YXIgbkJpdHMgPSAtN1xyXG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcclxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcclxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxyXG5cclxuICBpICs9IGRcclxuXHJcbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcclxuICBzID4+PSAoLW5CaXRzKVxyXG4gIG5CaXRzICs9IGVMZW5cclxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxyXG5cclxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxyXG4gIGUgPj49ICgtbkJpdHMpXHJcbiAgbkJpdHMgKz0gbUxlblxyXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XHJcblxyXG4gIGlmIChlID09PSAwKSB7XHJcbiAgICBlID0gMSAtIGVCaWFzXHJcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XHJcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcclxuICB9IGVsc2Uge1xyXG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxyXG4gICAgZSA9IGUgLSBlQmlhc1xyXG4gIH1cclxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxyXG59XHJcblxyXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XHJcbiAgdmFyIGUsIG0sIGNcclxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxyXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXHJcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXHJcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxyXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcclxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcclxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxyXG5cclxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxyXG5cclxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xyXG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXHJcbiAgICBlID0gZU1heFxyXG4gIH0gZWxzZSB7XHJcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcclxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcclxuICAgICAgZS0tXHJcbiAgICAgIGMgKj0gMlxyXG4gICAgfVxyXG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XHJcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcclxuICAgICAgZSsrXHJcbiAgICAgIGMgLz0gMlxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xyXG4gICAgICBtID0gMFxyXG4gICAgICBlID0gZU1heFxyXG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xyXG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcclxuICAgICAgZSA9IGUgKyBlQmlhc1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXHJcbiAgICAgIGUgPSAwXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxyXG5cclxuICBlID0gKGUgPDwgbUxlbikgfCBtXHJcbiAgZUxlbiArPSBtTGVuXHJcbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxyXG5cclxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcclxufVxyXG5cclxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcaWVlZTc1NFxcXFxpbmRleC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxpZWVlNzU0XCIpXHJcbn0se1wiYnVmZmVyXCI6MixcImUvVSs5N1wiOjR9XSw0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcclxuKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xyXG4vLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcclxuXHJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcclxuXHJcbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXHJcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xyXG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xyXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXHJcbiAgICA7XHJcblxyXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjYW5Qb3N0KSB7XHJcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcclxuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcclxuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XHJcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBmbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xyXG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcclxuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5cclxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcclxucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcclxucHJvY2Vzcy5lbnYgPSB7fTtcclxucHJvY2Vzcy5hcmd2ID0gW107XHJcblxyXG5mdW5jdGlvbiBub29wKCkge31cclxuXHJcbnByb2Nlc3Mub24gPSBub29wO1xyXG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcclxucHJvY2Vzcy5vbmNlID0gbm9vcDtcclxucHJvY2Vzcy5vZmYgPSBub29wO1xyXG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcclxucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xyXG5wcm9jZXNzLmVtaXQgPSBub29wO1xyXG5cclxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcclxufVxyXG5cclxuLy8gVE9ETyhzaHR5bG1hbilcclxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcclxucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XHJcbn07XHJcblxyXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXFxcXGJyb3dzZXIuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxccHJvY2Vzc1wiKVxyXG59LHtcImJ1ZmZlclwiOjIsXCJlL1UrOTdcIjo0fV0sNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGluc3RhbmNlcyA9IHt9O1xyXG5cclxuSFRNTEVsZW1lbnQucHJvdG90eXBlLnVwZGF0ZVRvID0gZnVuY3Rpb24oY29udGVudCkge1xyXG4gIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIHRoaXMuaW5uZXJIVE1MID0gY29udGVudDtcclxuICBlbHNlIGlmIChjb250ZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcclxuICAgIHRoaXMuaW5uZXJIVE1MID0gJyc7XHJcbiAgICB0aGlzLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBzZXJpYWxpemVGb3JtKGZvcm0pIHtcclxuICByZXR1cm4gQXJyYXkuZnJvbShmb3JtKS5yZWR1Y2UoKHJlc3VsdCwgaW5wdXQpID0+IHtcclxuICAgIGlmIChpbnB1dC50eXBlICE9PSAnc3VibWl0JykgcmVzdWx0W2lucHV0Lm5hbWVdID0gaW5wdXQudmFsdWU7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sIHt9KTtcclxufVxyXG5mdW5jdGlvbiBzZWN1cmVOdW1JbnB1dChtYXgsIG1pbiwgc3RlcCA9IDEpIHtcclxuICByZXR1cm4gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKChlLmtleUNvZGUgPCA0OCB8fCBlLmtleUNvZGUgPiA1NykgJiYgIShbOCwgNDYsIDM3LCAzOSwgMTNdLmluZGV4T2YoZS5rZXlDb2RlKSArIDEpKSB7XHJcbiAgICAgIGlmIChlLmtleUNvZGUgPT0gMzggJiYgZS50YXJnZXQudmFsdWUgPCBtYXggLSBzdGVwKVxyXG4gICAgICAgIGUudGFyZ2V0LnZhbHVlID0gK2UudGFyZ2V0LnZhbHVlICsgc3RlcDtcclxuICAgICAgaWYgKGUua2V5Q29kZSA9PSA0MCAmJiBlLnRhcmdldC52YWx1ZSA+IG1pbiArIHN0ZXApXHJcbiAgICAgICAgZS50YXJnZXQudmFsdWUgPSArZS50YXJnZXQudmFsdWUgLSBzdGVwO1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbmNsYXNzIFN0b3JlIHtcclxuICBjb25zdHJ1Y3Rvcih1cmxUb0pTT04gPSBmYWxzZSwgY29udGFpbmVyUXVlcnkgPSBmYWxzZSkge1xyXG4gICAgaW5zdGFuY2VzLnN0b3JlID0gdGhpcztcclxuICAgIHRoaXMudXJsVG9TdWJtaXQgPSAnLyc7XHJcbiAgICB0aGlzLmNvbnRhaW5lciA9IHtcclxuICAgICAgYmFza2V0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lclF1ZXJ5ICsgJyBhc2lkZSAuYmFza2V0LWNvbnRhaW5lcicpLFxyXG4gICAgICBmaWx0ZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyUXVlcnkgKyAnIGFzaWRlIC5maWx0ZXItY29udGFpbmVyJyksXHJcbiAgICAgIGFydGljbGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyUXVlcnkgKyAnIGFydGljbGUnKVxyXG4gICAgfTtcclxuICAgIHRoaXMuZmlsdGVyID0gZmFsc2U7XHJcbiAgICB0aGlzLmJhc2tldCA9IGZhbHNlO1xyXG4gICAgdGhpcy5tb2RhbCAgPSBuZXcgTW9kYWwoJyNtb2RhbGJveCcpO1xyXG5cclxuICAgIC8vIEdldHRpbmcgSlNPTiB3aXRoIHByb2R1Y3RzXHJcbiAgICBmZXRjaCh1cmxUb0pTT04pXHJcbiAgICAgIC50aGVuKGRhdGEgPT4gZGF0YS5qc29uKCkpXHJcbiAgICAgIC50aGVuKGpzb24gPT4ge1xyXG4gICAgICAgIHRoaXMucHJvZHVjdHMgPSBqc29uLnByb2R1Y3RzLm1hcCgocHJvZHVjdCwgaW5kZXgpID0+IG5ldyBQcm9kdWN0KHByb2R1Y3QsIGluZGV4KSk7XHJcbiAgICAgICAgdGhpcy5leGNoYW5nZUNvdXJzZSA9IGpzb24uZXhjaGFuZ2VDb3Vyc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKCgpID0+IHRoaXMuYnVpbGQoKSk7XHJcbiAgfVxyXG4gIGJ1aWxkKCkge1xyXG4gICAgLy8gc2Vzc2lvblN0b3JhZ2VcclxuICAgIGxldCBhY3RpdmVTaGlwbWVudHMgPSB0aGlzLnByb2R1Y3RzLmZpbHRlcihpdGVtID0+ICEhaXRlbS5hbW1vdW50KTsgLy8ucmVkdWNlKGl0ZW0gPT4ge3JldHVybntpZDppdGVtLnByb3BzLmlkLCBhbW1vdW50OiBpdGVtLmFtbW91bnR9fSkgfHwgW107XHJcbiAgICBpZiAoYWN0aXZlU2hpcG1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIGFjdGl2ZVNoaXBtZW50cyA9IEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnc2VsZWN0ZWQnKSkgfHwgW107XHJcbiAgICAgICAgaWYgKGFjdGl2ZVNoaXBtZW50cy5sZW5ndGggIT0gMCkgYWN0aXZlU2hpcG1lbnRzLm1hcChpdGVtID0+IHRoaXMucHJvZHVjdHNbaXRlbS5pZF0uYW1tb3VudCA9IGl0ZW0uYW1tb3VudCApO1xyXG4gICAgfSBlbHNlIHtzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdzZWxlY3RlZCcsIEpTT04uc3RyaW5naWZ5KHRoaXMucHJvZHVjdHMuZmlsdGVyKGl0ZW0gPT4gISFpdGVtLmFtbW91bnQpLnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe2lkOml0ZW0ucHJvcHMuaWQsIGFtbW91bnQ6IGl0ZW0uYW1tb3VudH0pO1xyXG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH0sW10pKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9Jbml0aWFsaXppbmcgZmlsdGVyICYgYmFza2V0XHJcbiAgICBpZiAoIXRoaXMuZmlsdGVyKSB0aGlzLmZpbHRlciA9IG5ldyBGaWx0ZXIodGhpcy5jb250YWluZXIuZmlsdGVyLCB0aGlzLnByb2R1Y3RzLCB0aGlzLmJ1aWxkLmJpbmQodGhpcykpO1xyXG4gICAgaWYgKCF0aGlzLmJhc2tldCkgdGhpcy5iYXNrZXQgPSBuZXcgQmFza2V0KHRoaXMuY29udGFpbmVyLmJhc2tldCk7XHJcblxyXG4gICAgdGhpcy5jb250YWluZXIuYXJ0aWNsZS5pbm5lckhUTUwgPSAnJztcclxuICAgIHRoaXMuZmlsdGVyLnNvcnQodGhpcy5wcm9kdWN0cykubWFwKGl0ZW0gPT4gdGhpcy5jb250YWluZXIuYXJ0aWNsZS5hcHBlbmRDaGlsZChpdGVtLnJlbmRlcigpKSk7XHJcbiAgICBpZiAodGhpcy5jb250YWluZXIuYXJ0aWNsZS5jaGlsZHJlbi5sZW5ndGggPT0gMCkgdGhpcy5jb250YWluZXIuYXJ0aWNsZS5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJuby1kYXRhXCI+0J/QviDQtNCw0L3QvdC+0LzRgyDRhNC40LvRjNGC0YDRgyDRgtC+0LLQsNGA0L7QsiDQvdC10YI8L3A+JztcclxuXHJcblxyXG4gICAgLy8gY2FsbGJhY2tcclxuICAgIGlmICh0aGlzLm9uTG9hZCkgdGhpcy5vbkxvYWQoKTtcclxuICB9XHJcbiAgc2VuZChkYXRhKSB7XHJcbiAgICB0aGlzLm1vZGFsLnRvZ2dsZSgpO1xyXG4gICAgZGF0YS5zaGlwbWVudHMgPSB0aGlzLnByb2R1Y3RzLmZpbHRlcihpdGVtID0+ICEhaXRlbS5hbW1vdW50KS5yZWR1Y2UoKHN1bSwgaXRlbSkgPT4ge1xyXG4gICAgICAgIHN1bS5wdXNoKHtuYW1lOml0ZW0ucHJvcHMubmFtZSwgYW1tb3VudDogaXRlbS5hbW1vdW50fSlcclxuICAgICAgICBpdGVtLmFtbW91bnQgPSAwO1xyXG4gICAgICAgIHJldHVybiBzdW07XHJcbiAgICAgIH0sW10pO1xyXG4gICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgnc2VsZWN0ZWQnKTtcclxuICAgIHRoaXMuYnVpbGQoKTtcclxuICAgIGluc3RhbmNlcy5iYXNrZXQucmVuZGVyKCk7XHJcbiAgICAvLyBmZXRjaCh0aGlzLnVybFRvU3VibWl0LCB7XHJcbiAgICAvLyAgIG1ldGhvZDogJ3Bvc3QnLFxyXG4gICAgLy8gICBoZWFkZXJzOiB7XHJcbiAgICAvLyAgICAgXCJDb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLThcIlxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKVxyXG4gICAgLy8gfSlcclxuICAgIC8vIC50aGVuKGRhdGEgPT4gZGF0YS5qc29uKCkpXHJcbiAgICAvLyAudGhlbihkYXRhID0+IHtcclxuICAgIC8vICAgY29uc29sZS5sb2coJ1JlcXVlc3Qgc3VjY2VlZGVkIHdpdGggSlNPTiByZXNwb25zZScsIGRhdGEpO1xyXG4gICAgLy8gfSlcclxuICAgIC8vIC5jYXRjaChlcnJvciA9PiB7XHJcbiAgICAvLyAgIGNvbnNvbGUubG9nKCdSZXF1ZXN0IGZhaWxlZCcsIGVycm9yKTtcclxuICAgIC8vIH0pO1xyXG5cclxuICB9XHJcblxyXG59XHJcbmNsYXNzIE1vZGFsIHtcclxuICBjb25zdHJ1Y3Rvcihjb250YWluZXJRdWVyeSkge1xyXG4gICAgaW5zdGFuY2VzLm1vZGFsID0gdGhpcztcclxuICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJRdWVyeSk7XHJcbiAgICB0aGlzLmNvbnRlbnQgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY29udGVudCcpO1xyXG4gICAgdGhpcy5jYXB0aW9uID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLmNhcHRpb24nKTtcclxuICAgIHRoaXMub3BlbiA9IGZhbHNlO1xyXG4gICAgLy8gRE9NIHByZXByYXJ0aW9uc1xyXG4gICAgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLmNsb3NlJykub25jbGljayA9IHRoaXMudG9nZ2xlLmJpbmQodGhpcyk7XHJcblxyXG4gICAgLy8gY2FsbGJhY2tzXHJcbiAgICB0aGlzLm9uT3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5vbkNsb3NlID0gZmFsc2U7XHJcbiAgICB0aGlzLm9uUmVuZGVyID0gZmFsc2U7XHJcbiAgfVxyXG4gIHRvZ2dsZSgpIHtcclxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSgnbW9kYWxtb2RlJyk7XHJcbiAgICB0aGlzLm9wZW4gPSAhdGhpcy5vcGVuO1xyXG4gICAgaWYgKHRoaXMub3BlbiAmJiB0aGlzLm9uT3BlbikgdGhpcy5vbk9wZW4oKTtcclxuICAgIGVsc2UgaWYodGhpcy5vbkNsb3NlKSB0aGlzLm9uQ2xvc2UoKTtcclxuICB9XHJcbiAgcmVuZGVyKHBhZ2VOYW1lLCBpbm5lckhUTUwpIHtcclxuICAgIHRoaXMuY29udGVudC51cGRhdGVUbyhpbm5lckhUTUwpO1xyXG4gICAgdGhpcy5jYXB0aW9uLnVwZGF0ZVRvKHBhZ2VOYW1lKTtcclxuICAgIGlmICh0aGlzLm9uUmVuZGVyKSB0aGlzLm9uUmVuZGVyKCk7XHJcbiAgICBpZiAoIXRoaXMub3BlbikgdGhpcy50b2dnbGUoKTtcclxuICB9XHJcbn1cclxuY2xhc3MgUHJvZHVjdCB7XHJcbiAgY29uc3RydWN0b3IoZGF0YSwgaWQpIHtcclxuICAgIHRoaXMuYW1tb3VudCA9IDA7XHJcbiAgICB0aGlzLnByb3BzID0gZGF0YTtcclxuICAgIHRoaXMucHJvcHMuaWQgPSBpZDtcclxuICAgIHRoaXMuY3VycmVuY3lDb2RlID0ge1xyXG4gICAgICByOiAnODM4MScsXHJcbiAgICAgIGc6ICc4MzcyJyxcclxuICAgICAgZDogJzM2J1xyXG4gICAgfVxyXG4gIH1cclxuICBnZXRDdXJyZW5jeSgpIHtcclxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHRoaXMuY3VycmVuY3lDb2RlW3RoaXMucHJvcHMuY3VycmVuY3ldKVxyXG4gIH1cclxuICByZW5kZXIobW9kZSA9IGZhbHNlKSB7XHJcbiAgICBsZXQgY3VycmVuY3kgPSB0aGlzLmdldEN1cnJlbmN5KCksXHJcbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuICAgICAgICBpbkJhc2tldCA9ICEhdGhpcy5hbW1vdW50ID8gJ2luLWJhc2tldCcgOiAnJyxcclxuICAgICAgICBidXR0b25UZXh0ID0gISF0aGlzLmFtbW91bnQgPyBg0JIg0LrQvtGA0LfQuNC90LUgKCR7dGhpcy5hbW1vdW50fSlgIDogJ9Ca0YPQv9C40YLRjCc7XHJcblxyXG4gICAgaWYgKG1vZGUgPT09ICdiYXNrZXQnKSB7XHJcblxyXG4gICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIml0ZW1cIj5cclxuICAgICAgICAgIDxpbWcgc3JjPVwiJHt0aGlzLnByb3BzLmltYWdlfVwiIGFsdD1cIiR7dGhpcy5wcm9wcy5uYW1lfVwiIC8+XHJcbiAgICAgICAgICA8cD4ke3RoaXMucHJvcHMubmFtZX08L3A+XHJcbiAgICAgICAgICAgIDxwPlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHJpY2VcIj4ke3RoaXMucHJvcHMucHJpY2V9ICR7Y3VycmVuY3l9PC9zcGFuPiB4XHJcbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiYW1tb3VudFwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIke3RoaXMuYW1tb3VudH1cIiAvPiA9XHJcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJyZXN1bHQtcHJpY2VcIj4ke3RoaXMucHJvcHMucHJpY2UgKiB0aGlzLmFtbW91bnR9ICR7Y3VycmVuY3l9PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJyZW1vdmVcIj7Qo9C00LDQu9C40YLRjDwvYnV0dG9uPlxyXG5cclxuICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICBgO1xyXG5cclxuICAgICAgLy8gQUNUSU9OU1xyXG4gICAgICBsZXQgYW1tb3VudCA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5hbW1vdW50JyksXHJcbiAgICAgICAgICByZXN1bHRQcmljZSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5yZXN1bHQtcHJpY2UnKSxcclxuICAgICAgICAgIHJlbW92ZSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5yZW1vdmUnKTtcclxuXHJcbiAgICAgIGFtbW91bnQub25rZXlkb3duID0gc2VjdXJlTnVtSW5wdXQoMTAwLCAwLCAxKTtcclxuICAgICAgYW1tb3VudC5vbmtleXVwID0gZSA9PiB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHJlc3VsdFByaWNlLmlubmVySFRNTCA9ICh0aGlzLmFtbW91bnQgPSArYW1tb3VudC52YWx1ZSkgKiB0aGlzLnByb3BzLnByaWNlICsgJyAnICsgY3VycmVuY3k7XHJcbiAgICAgICAgaW5zdGFuY2VzLmJhc2tldC5yZW5kZXIoKTtcclxuICAgICAgICBpbnN0YW5jZXMuc3RvcmUuYnVpbGQoKTtcclxuICAgICAgICBpbnN0YW5jZXMuYmFza2V0LnJlY291bnQoKTtcclxuICAgICAgfVxyXG4gICAgICByZW1vdmUub25jbGljayA9IGUgPT4ge1xyXG4gICAgICAgIHRoaXMuYW1tb3VudCA9IDA7XHJcbiAgICAgICAgaW5zdGFuY2VzLmJhc2tldC5yZW5kZXIoKTtcclxuICAgICAgICBpbnN0YW5jZXMuYmFza2V0LmNoZWNrb3V0KCk7XHJcbiAgICAgICAgaW5zdGFuY2VzLnN0b3JlLmJ1aWxkKCk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IGBcclxuICAgICAgICA8ZmlndXJlIGNsYXNzPVwicHJvZHVjdCAke2luQmFza2V0fVwiPlxyXG4gICAgICAgICAgPGltZyBzcmM9XCIke3RoaXMucHJvcHMuaW1hZ2V9XCIgYWx0PVwiJHt0aGlzLnByb3BzLm5hbWV9XCIgLz5cclxuICAgICAgICAgIDxoMz4ke3RoaXMucHJvcHMubmFtZX08L2gzPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsXCI+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHJpY2VcIj4ke3RoaXMucHJvcHMucHJpY2V9ICR7Y3VycmVuY3l9PC9zcGFuPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnV5XCI+JHtidXR0b25UZXh0fTwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9maWd1cmU+XHJcbiAgICAgIGA7XHJcblxyXG4gICAgICAvLyBBQ1RJT05TXHJcbiAgICAgIGxldCBjb250YWluZXIgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdCcpLFxyXG4gICAgICAgICAgYnV5ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmJ1eScpO1xyXG5cclxuICAgICAgYnV5Lm9uY2xpY2sgPSBlID0+IHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgaW5zdGFuY2VzLmJhc2tldC5zaG93KHRoaXMpO1xyXG4gICAgICAgIGluc3RhbmNlcy5iYXNrZXQucmVuZGVyKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgcmV0dXJuIHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkO1xyXG4gIH1cclxufVxyXG5jbGFzcyBCYXNrZXQge1xyXG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lcikge1xyXG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XHJcbiAgICBpbnN0YW5jZXMuYmFza2V0ID0gdGhpcztcclxuICAgIHRoaXMucmVuZGVyKCk7XHJcblxyXG4gIH1cclxuICBzaG93KHByb2R1Y3QpIHtcclxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG4gICAgICAgIGN1cnJlbmN5ID0gU3RyaW5nLmZyb21DaGFyQ29kZShwcm9kdWN0LmN1cnJlbmN5Q29kZVtwcm9kdWN0LnByb3BzLmN1cnJlbmN5XSksXHJcbiAgICAgICAgZGVsZXRlUHJvZHVjdCA9ICEhcHJvZHVjdC5hbW1vdW50ID8gJzxidXR0b24gY2xhc3M9XCJyZW1vdmVcIj7Qo9C00LDQu9C40YLRjDwvYnV0dG9uPicgOiAnJyxcclxuICAgICAgICBidXlQcm9kdWN0ID0gISFwcm9kdWN0LmFtbW91bnQgPyAn0JjQt9C80LXQvdC40YLRjCcgOiAn0JIg0LrQvtGA0LfQuNC90YMnO1xyXG5cclxuICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJiYXNrZXQtcHJvZHVjdFwiPlxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cImRlc2NyaXB0aW9uXCI+XHJcbiAgICAgICAgICAgICR7cHJvZHVjdC5wcm9wcy5kZXNjcmlwdGlvbiB8fCBgPGRpdiBjbGFzcz1cIm5vLWRhdGFcIj7QndC10YIg0L7Qv9C40YHQsNC90LjRjzwvZGl2PmB9XHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxpbWcgc3JjPVwiJHtwcm9kdWN0LnByb3BzLmltYWdlfVwiIGFsdD1cIiR7cHJvZHVjdC5wcm9wcy5uYW1lfVwiIHRpdGxlPVwi0JrRg9C/0LjRgtGMICR7cHJvZHVjdC5wcm9wcy5uYW1lfSFcIiAvPlxyXG4gICAgICAgICAgPHA+PHNwYW4gY2xhc3M9XCJwcmljZVwiPiR7cHJvZHVjdC5wcm9wcy5wcmljZX0gJHtjdXJyZW5jeX08L3NwYW4+PC9wPlxyXG4gICAgICAgICAgPHA+PGZvcm0+PGlucHV0IGNsYXNzPVwiYW1tb3VudFwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIke3Byb2R1Y3QuYW1tb3VudCB8fCAxfVwiIG1heGxlbmd0aD1cIjJcIiAvPjwvZm9ybT48L3A+XHJcbiAgICAgICAgICA8cD48YnV0dG9uIGNsYXNzPVwiYnV5XCI+JHtidXlQcm9kdWN0fTwvYnV0dG9uPiR7ZGVsZXRlUHJvZHVjdH08L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXY+XHJcbiAgICBgO1xyXG5cclxuICAgIC8vIEFDVElPTlNcclxuICAgIGxldCBhbW1vdW50ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmFtbW91bnQnKSxcclxuICAgICAgICBmb3JtID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignZm9ybScpLFxyXG4gICAgICAgIGJ1eSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5idXknKSxcclxuICAgICAgICByZW1vdmUgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcucmVtb3ZlJykgfHwgZmFsc2UsXHJcbiAgICAgICAgY2hhbmdlQW1tb3VudCA9ICh2YWx1ZSA9IGZhbHNlKSA9PiBlID0+IHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIHByb2R1Y3QuYW1tb3VudCA9ICh2YWx1ZSAhPT0gZmFsc2UpID8gdmFsdWUgOiArYW1tb3VudC52YWx1ZTtcclxuICAgICAgICAgIGluc3RhbmNlcy5tb2RhbC50b2dnbGUoKTtcclxuICAgICAgICAgIGluc3RhbmNlcy5zdG9yZS5idWlsZCgpO1xyXG4gICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIGFtbW91bnQub25rZXlkb3duID0gc2VjdXJlTnVtSW5wdXQoMTAwLCAwLCAxKTtcclxuICAgIGJ1eS5vbmNsaWNrID0gZm9ybS5vbnN1Ym1pdCA9IGNoYW5nZUFtbW91bnQoKTtcclxuICAgIGlmIChyZW1vdmUpIHJlbW92ZS5vbmNsaWNrID0gY2hhbmdlQW1tb3VudCgwKTtcclxuXHJcbiAgICBpbnN0YW5jZXMubW9kYWwucmVuZGVyKCfQodGC0YDQsNC90LjRhtCwINGC0L7QstCw0YDQsCcsIHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkKTtcclxuICAgIGFtbW91bnQuZm9jdXMoKTtcclxuICB9XHJcbiAgY2hlY2tvdXQoKSB7XHJcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuICAgICAgICBwcm9kdWN0cyA9IGluc3RhbmNlcy5zdG9yZS5wcm9kdWN0cy5maWx0ZXIoaXRlbSA9PiAhIWl0ZW0uYW1tb3VudCksXHJcbiAgICAgICAgcHJvZHVjdENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuICAgIC8vIElmIGJhc2tldCBlbXB0eSwgY2xvc2VpbmcgaXRcclxuICAgIGlmIChwcm9kdWN0cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgaW5zdGFuY2VzLm1vZGFsLnRvZ2dsZSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcHJvZHVjdHMubWFwKGl0ZW0gPT4gcHJvZHVjdENvbnRhaW5lci5hcHBlbmRDaGlsZChpdGVtLnJlbmRlcignYmFza2V0JykpKTtcclxuXHJcbiAgICBsZXQgdG90YWxQcmljZSA9IHByb2R1Y3RzLnJlZHVjZSgoc3VtLCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICBpZiAoISFpdGVtLmFtbW91bnQpIHN1bSArPSBpdGVtLmFtbW91bnQgKiBpdGVtLnByb3BzLnByaWNlO1xyXG4gICAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgICAgICB9LCAwKSxcclxuICAgICAgICBjdXJyZW5jeSA9IHByb2R1Y3RzWzBdLmdldEN1cnJlbmN5KCk7XHJcblxyXG4gICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwiYmFza2V0LWNoZWNrb3V0XCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImxpc3RcIj5cclxuXHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0b3RhbC1wcmljZVwiPlxyXG4gICAgICAgICAgICDQntCx0YnQsNGPINGB0YPQvNC80LBcclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2YWx1ZVwiPiR7dG90YWxQcmljZX0gJHtjdXJyZW5jeX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGZvcm0+XHJcbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cIm5hbWVcIiBwbGFjZWhvbGRlcj1cIiog0JjQvNGPLi4uXCIgcmVxdWlyZWQgLz5cclxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwicGhvbmVcIiBwbGFjZWhvbGRlcj1cIiog0KLQtdC70LXRhNC+0L0uLi5cIiByZXF1aXJlZCAvPlxyXG4gICAgICAgICAgICAgIDx0ZXh0YXJlYSBuYW1lPVwiY29tbWVudFwiIHBsYWNlaG9sZGVyPVwi0JrQvtC80LXQvdGC0LDRgNC40Lkg0Log0LfQsNC60LDQt9GDLi4uXCI+PC90ZXh0YXJlYT5cclxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwi0J7RgtC/0YDQsNCy0LjRgtGMXCIgLz5cclxuICAgICAgICAgICAgPC9mb3JtPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcblxyXG4gICAgLy8gQUNUSU9OU1xyXG4gICAgbGV0IGxpc3QgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcubGlzdCcpLFxyXG4gICAgICAgIGZvcm0gPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XHJcblxyXG4gICAgbGlzdC5hcHBlbmRDaGlsZChwcm9kdWN0Q29udGFpbmVyKTtcclxuICAgIGZvcm0ub25zdWJtaXQgPSBlID0+IHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBpbnN0YW5jZXMuc3RvcmUuc2VuZChzZXJpYWxpemVGb3JtKGUuY3VycmVudFRhcmdldC5lbGVtZW50cykpO1xyXG4gICAgfVxyXG5cclxuICAgIGluc3RhbmNlcy5tb2RhbC5yZW5kZXIoJ9Ce0YTQvtGA0LzQu9C10L3QuNC1INC30LDQutCw0LfQsCcsIHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkKTtcclxuICB9XHJcbiAgcmVjb3VudCgpIHtcclxuICAgIGxldCBjdXJyZW5jeSA9IGluc3RhbmNlcy5zdG9yZS5wcm9kdWN0c1swXS5nZXRDdXJyZW5jeSgpLFxyXG4gICAgICAgIHRvdGFsUHJpY2UgPSBpbnN0YW5jZXMuc3RvcmUucHJvZHVjdHMucmVkdWNlKChzdW0sIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICBpZiAoISFpdGVtLmFtbW91bnQpIHN1bSArPSBpdGVtLmFtbW91bnQgKiBpdGVtLnByb3BzLnByaWNlO1xyXG4gICAgICAgICAgICAgIHJldHVybiBzdW07XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvdGFsLXByaWNlIC52YWx1ZScpLmlubmVySFRNTCA9IHRvdGFsUHJpY2UgKyAnICcgKyBjdXJyZW5jeTtcclxuXHJcblxyXG4gIH1cclxuICByZW5kZXIoKSB7XHJcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuICAgICAgICBhbW1vdW50ID0gaW5zdGFuY2VzLnN0b3JlLnByb2R1Y3RzLnJlZHVjZSgoc3VtLCBpdGVtKSA9PiAgc3VtICsgaXRlbS5hbW1vdW50ICogaXRlbS5wcm9wcy5wcmljZSwgMCksXHJcbiAgICAgICAgY291bnQgPSBpbnN0YW5jZXMuc3RvcmUucHJvZHVjdHMucmVkdWNlKChzdW0sIGl0ZW0pID0+ICBzdW0gKyBpdGVtLmFtbW91bnQsIDApLFxyXG4gICAgICAgIHJlc3BvbnNlID0gISFhbW1vdW50ID8gYDxwPiR7Y291bnR9INGC0L7QstCw0YAo0L7Qsikg0L3QsCDRgdGD0LzQvNGDOjxiciAvPjxzcGFuIGNsYXNzPVwicHJpY2VcIj4gJHthbW1vdW50fSDRgNGD0LHQu9C10Lk8L3NwYW4+PC9wPjxidXR0b24gY2xhc3M9XCJhY3Rpb25cIj7QntGE0L7RgNC80LjRgtGMPC9idXR0b24+YCA6ICc8ZGl2IGNsYXNzPVwibm8tZGF0YVwiPtCf0YPRgdGC0L48L2Rpdj4nXHJcblxyXG4gICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IGlkPVwiYmFza2V0XCI+XHJcbiAgICAgICAgPGgzPtCa0L7RgNC30LjQvdCwPC9oMz5cclxuICAgICAgICAke3Jlc3BvbnNlfVxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcblxyXG4gICAgLy8gQUNUSU9OU1xyXG4gICAgbGV0IGFjdGlvbiA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5hY3Rpb24nKTtcclxuXHJcbiAgICBpZiAoYWN0aW9uKSBhY3Rpb24ub25jbGljayA9IHRoaXMuY2hlY2tvdXQuYmluZCh0aGlzKTtcclxuXHJcblxyXG4gICAgdGhpcy5jb250YWluZXIudXBkYXRlVG8odGVtcGxhdGUuZmlyc3RFbGVtZW50Q2hpbGQpO1xyXG4gIH1cclxufVxyXG5jbGFzcyBGaWx0ZXIge1xyXG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lciwgcHJvZHVjdHMsIGNhbGxiYWNrKSB7XHJcbiAgICB0aGlzLnByb2R1Y3RzID0gcHJvZHVjdHM7XHJcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICB0aGlzLnNvcnRGdW5jdGlvbiA9IHtcclxuICAgICAgc2VhcmNoOiBpdGVtID0+IGl0ZW0ucHJvcHMubmFtZS5pbmNsdWRlcyh0aGlzLmZpbHRlckNvbmRpdGlvbnMuc2VhcmNoKSxcclxuICAgICAgY2F0ZWdvcnk6IGl0ZW0gPT4gaXRlbS5wcm9wcy5jYXRlZ29yeSA9PT0gdGhpcy5maWx0ZXJDb25kaXRpb25zLmNhdGVnb3J5LFxyXG4gICAgICBtaW46IGl0ZW0gPT4gaXRlbS5wcm9wcy5wcmljZSA+IHRoaXMuZmlsdGVyQ29uZGl0aW9ucy5taW4sXHJcbiAgICAgIG1heDogaXRlbSA9PiBpdGVtLnByb3BzLnByaWNlIDwgdGhpcy5maWx0ZXJDb25kaXRpb25zLm1heFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbmRlcmluZyBhc2lkZVxyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucmVuZGVyKCkpO1xyXG5cclxuICB9XHJcbiAgc29ydChwcm9kdWN0cykge1xyXG4gICAgaWYodGhpcy5maWx0ZXJDb25kaXRpb25zKSB7XHJcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuZmlsdGVyQ29uZGl0aW9ucykubWFwKGNvbmRpdGlvbiA9PiB7XHJcbiAgICAgICAgaWYodGhpcy5maWx0ZXJDb25kaXRpb25zW2NvbmRpdGlvbl0gIT09ICcnKSBwcm9kdWN0cyA9IHByb2R1Y3RzLmZpbHRlcih0aGlzLnNvcnRGdW5jdGlvbltjb25kaXRpb25dKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJvZHVjdHM7XHJcbiAgfVxyXG4gIHJlbmRlcigpIHtcclxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG4gICAgICAgIGNhdGVnb3JpZXMgPSB0aGlzLnByb2R1Y3RzLnJlZHVjZSgoYXJyYXksIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgaWYgKCEoYXJyYXkuaW5kZXhPZihpdGVtLnByb3BzLmNhdGVnb3J5KSArIDEpKSBhcnJheS5wdXNoKGl0ZW0ucHJvcHMuY2F0ZWdvcnkpO1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICAgICAgICB9LCBbXSksXHJcbiAgICAgICAgc2VsZWN0T3B0aW9ucyA9IGNhdGVnb3JpZXMucmVkdWNlKChyb3csIGl0ZW0pID0+IHJvdyArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7aXRlbX1cIj4ke2l0ZW19PC9vcHRpb24+YCwgJzxvcHRpb24gdmFsdWU9XCJcIj7QstGB0LU8L29wdGlvbj4nKTtcclxuXHJcbiAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxmb3JtIGlkPVwiZmlsdGVyXCI+XHJcbiAgICAgICAgPGxhYmVsPlxyXG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInNlYXJjaFwiIHBsYWNlaG9sZGVyPVwi0L/QvtC40YHQui4uLlwiPlxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgPGhyIC8+XHJcbiAgICAgICAgPHNwYW4+0JrQsNGC0LXQs9C+0YDQuNGPPC9zcGFuPlxyXG4gICAgICAgIDxsYWJlbD5cclxuICAgICAgICAgIDxzZWxlY3QgbmFtZT1cImNhdGVnb3J5XCI+XHJcbiAgICAgICAgICAgICR7c2VsZWN0T3B0aW9uc31cclxuICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgPGhyIC8+XHJcbiAgICAgICAgPHNwYW4+0KbQtdC90LA8L3NwYW4+XHJcbiAgICAgICAgPGxhYmVsIGNsYXNzPVwiaW5saW5lXCI+XHJcbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInByaWNlXCIgbmFtZT1cIm1pblwiIHBsYWNlaG9sZGVyPVwi0L7Rgi4uLlwiPlxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgPGxhYmVsIGNsYXNzPVwiaW5saW5lXCI+XHJcbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInByaWNlXCIgbmFtZT1cIm1heFwiIHBsYWNlaG9sZGVyPVwi0LTQvi4uLlwiPlxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgIDwvZm9ybT5cclxuICAgIGA7XHJcblxyXG4gICAgLy8gQUNUSU9OU1xyXG4gICAgdGhpcy5mb3JtID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignZm9ybScpO1xyXG4gICAgbGV0IG51bUlucHV0cyA9IEFycmF5LmZyb20odGVtcGxhdGUucXVlcnlTZWxlY3RvckFsbCgnLnByaWNlJykpO1xyXG5cclxuICAgIHRoaXMuZm9ybS5vbmNoYW5nZSA9IHRoaXMuZm9ybS5vbnN1Ym1pdCA9IChlKSA9PiB7XHJcbiAgICAgIHRoaXMuZmlsdGVyQ29uZGl0aW9ucyA9IHNlcmlhbGl6ZUZvcm0oZS5jdXJyZW50VGFyZ2V0LmVsZW1lbnRzKTtcclxuICAgICAgdGhpcy5jYWxsYmFjaygpO1xyXG4gICAgfVxyXG4gICAgbnVtSW5wdXRzLm1hcChpdGVtID0+IGl0ZW0ub25rZXlkb3duID0gc2VjdXJlTnVtSW5wdXQoMjAwMCwgMCwgMTAwKSlcclxuXHJcblxyXG4gICAgcmV0dXJuIHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkO1xyXG4gIH1cclxufVxyXG5cclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgcHJvZHVjdHMgPSBuZXcgU3RvcmUoJ3N0YXRpYy9wcm9kdWN0cy5qc29uJywgJyNwcm9kdWN0cyAuY29udGVudCcpO1xyXG4gIHByb2R1Y3RzLm9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBuYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCduYXYnKSxcclxuICAgICAgICBhc2lkZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FzaWRlJyksXHJcbiAgICAgICAgc2xpZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhc2lkZSAuc2xpZGUnKTtcclxuICAgIHdpbmRvdy5vbnNjcm9sbCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHZhciBjb3JyZWN0U2Nyb2xsID0gZS50YXJnZXQuc2Nyb2xsaW5nRWxlbWVudC5zY3JvbGxUb3AgLSBhc2lkZS5vZmZzZXRUb3AgKyBuYXYub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICBpZiAoY29ycmVjdFNjcm9sbCA8IDApIHNsaWRlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKDBweCknO2Vsc2UgaWYgKGNvcnJlY3RTY3JvbGwgPiBhc2lkZS5vZmZzZXRIZWlnaHQgLSBzbGlkZS5vZmZzZXRIZWlnaHQpIHNsaWRlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKCcgKyAoYXNpZGUub2Zmc2V0SGVpZ2h0IC0gc2xpZGUub2Zmc2V0SGVpZ2h0KSArICdweCknO2Vsc2UgaWYgKGNvcnJlY3RTY3JvbGwgPiAwICYmIGNvcnJlY3RTY3JvbGwgPCBhc2lkZS5vZmZzZXRIZWlnaHQgLSBzbGlkZS5vZmZzZXRIZWlnaHQpIHNsaWRlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKCcgKyBjb3JyZWN0U2Nyb2xsICsgJ3B4KSc7XHJcbiAgICB9O1xyXG4gIH07XHJcbn07XHJcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZmFrZV80YmI1NTNmLmpzXCIsXCIvXCIpXHJcbn0se1wiYnVmZmVyXCI6MixcImUvVSs5N1wiOjR9XX0se30sWzVdKVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWtNNlhGeFFjbTlxWldOMGMxeGNhM1Z3WldOb1pYTnJhWGxrYjIxY1hHNXZaR1ZmYlc5a2RXeGxjMXhjWW5KdmQzTmxjaTF3WVdOclhGeGZjSEpsYkhWa1pTNXFjeUlzSWtNNkwxQnliMnBsWTNSekwydDFjR1ZqYUdWemEybDVaRzl0TDI1dlpHVmZiVzlrZFd4bGN5OWlZWE5sTmpRdGFuTXZiR2xpTDJJMk5DNXFjeUlzSWtNNkwxQnliMnBsWTNSekwydDFjR1ZqYUdWemEybDVaRzl0TDI1dlpHVmZiVzlrZFd4bGN5OWlkV1ptWlhJdmFXNWtaWGd1YW5NaUxDSkRPaTlRY205cVpXTjBjeTlyZFhCbFkyaGxjMnRwZVdSdmJTOXViMlJsWDIxdlpIVnNaWE12YVdWbFpUYzFOQzlwYm1SbGVDNXFjeUlzSWtNNkwxQnliMnBsWTNSekwydDFjR1ZqYUdWemEybDVaRzl0TDI1dlpHVmZiVzlrZFd4bGN5OXdjbTlqWlhOekwySnliM2R6WlhJdWFuTWlMQ0pET2k5UWNtOXFaV04wY3k5cmRYQmxZMmhsYzJ0cGVXUnZiUzl6Y21NdmFuTXZabUZyWlY4MFltSTFOVE5tTG1weklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJPMEZEUVVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkRPVWhCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkRkbXhEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGRGRFWkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOcVJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVpTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpaG1kVzVqZEdsdmJpQmxLSFFzYml4eUtYdG1kVzVqZEdsdmJpQnpLRzhzZFNsN2FXWW9JVzViYjEwcGUybG1LQ0YwVzI5ZEtYdDJZWElnWVQxMGVYQmxiMllnY21WeGRXbHlaVDA5WENKbWRXNWpkR2x2Ymx3aUppWnlaWEYxYVhKbE8ybG1LQ0YxSmlaaEtYSmxkSFZ5YmlCaEtHOHNJVEFwTzJsbUtHa3BjbVYwZFhKdUlHa29ieXdoTUNrN2RHaHliM2NnYm1WM0lFVnljbTl5S0Z3aVEyRnVibTkwSUdacGJtUWdiVzlrZFd4bElDZGNJaXR2SzF3aUoxd2lLWDEyWVhJZ1pqMXVXMjlkUFh0bGVIQnZjblJ6T250OWZUdDBXMjlkV3pCZExtTmhiR3dvWmk1bGVIQnZjblJ6TEdaMWJtTjBhVzl1S0dVcGUzWmhjaUJ1UFhSYmIxMWJNVjFiWlYwN2NtVjBkWEp1SUhNb2JqOXVPbVVwZlN4bUxHWXVaWGh3YjNKMGN5eGxMSFFzYml4eUtYMXlaWFIxY200Z2JsdHZYUzVsZUhCdmNuUnpmWFpoY2lCcFBYUjVjR1Z2WmlCeVpYRjFhWEpsUFQxY0ltWjFibU4wYVc5dVhDSW1KbkpsY1hWcGNtVTdabTl5S0haaGNpQnZQVEE3Ynp4eUxteGxibWQwYUR0dkt5c3BjeWh5VzI5ZEtUdHlaWFIxY200Z2MzMHBJaXdpS0daMWJtTjBhVzl1SUNod2NtOWpaWE56TEdkc2IySmhiQ3hDZFdabVpYSXNYMTloY21kMWJXVnVkREFzWDE5aGNtZDFiV1Z1ZERFc1gxOWhjbWQxYldWdWRESXNYMTloY21kMWJXVnVkRE1zWDE5bWFXeGxibUZ0WlN4ZlgyUnBjbTVoYldVcGUxeHVkbUZ5SUd4dmIydDFjQ0E5SUNkQlFrTkVSVVpIU0VsS1MweE5UazlRVVZKVFZGVldWMWhaV21GaVkyUmxabWRvYVdwcmJHMXViM0J4Y25OMGRYWjNlSGw2TURFeU16UTFOamM0T1Nzdkp6dGNibHh1T3lobWRXNWpkR2x2YmlBb1pYaHdiM0owY3lrZ2UxeHVYSFFuZFhObElITjBjbWxqZENjN1hHNWNiaUFnZG1GeUlFRnljaUE5SUNoMGVYQmxiMllnVldsdWREaEJjbkpoZVNBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NwWEc0Z0lDQWdQeUJWYVc1ME9FRnljbUY1WEc0Z0lDQWdPaUJCY25KaGVWeHVYRzVjZEhaaGNpQlFURlZUSUNBZ1BTQW5LeWN1WTJoaGNrTnZaR1ZCZENnd0tWeHVYSFIyWVhJZ1UweEJVMGdnSUQwZ0p5OG5MbU5vWVhKRGIyUmxRWFFvTUNsY2JseDBkbUZ5SUU1VlRVSkZVaUE5SUNjd0p5NWphR0Z5UTI5a1pVRjBLREFwWEc1Y2RIWmhjaUJNVDFkRlVpQWdQU0FuWVNjdVkyaGhja052WkdWQmRDZ3dLVnh1WEhSMllYSWdWVkJRUlZJZ0lEMGdKMEVuTG1Ob1lYSkRiMlJsUVhRb01DbGNibHgwZG1GeUlGQk1WVk5mVlZKTVgxTkJSa1VnUFNBbkxTY3VZMmhoY2tOdlpHVkJkQ2d3S1Z4dVhIUjJZWElnVTB4QlUwaGZWVkpNWDFOQlJrVWdQU0FuWHljdVkyaGhja052WkdWQmRDZ3dLVnh1WEc1Y2RHWjFibU4wYVc5dUlHUmxZMjlrWlNBb1pXeDBLU0I3WEc1Y2RGeDBkbUZ5SUdOdlpHVWdQU0JsYkhRdVkyaGhja052WkdWQmRDZ3dLVnh1WEhSY2RHbG1JQ2hqYjJSbElEMDlQU0JRVEZWVElIeDhYRzVjZEZ4MElDQWdJR052WkdVZ1BUMDlJRkJNVlZOZlZWSk1YMU5CUmtVcFhHNWNkRngwWEhSeVpYUjFjbTRnTmpJZ0x5OGdKeXNuWEc1Y2RGeDBhV1lnS0dOdlpHVWdQVDA5SUZOTVFWTklJSHg4WEc1Y2RGeDBJQ0FnSUdOdlpHVWdQVDA5SUZOTVFWTklYMVZTVEY5VFFVWkZLVnh1WEhSY2RGeDBjbVYwZFhKdUlEWXpJQzh2SUNjdkoxeHVYSFJjZEdsbUlDaGpiMlJsSUR3Z1RsVk5Ra1ZTS1Z4dVhIUmNkRngwY21WMGRYSnVJQzB4SUM4dmJtOGdiV0YwWTJoY2JseDBYSFJwWmlBb1kyOWtaU0E4SUU1VlRVSkZVaUFySURFd0tWeHVYSFJjZEZ4MGNtVjBkWEp1SUdOdlpHVWdMU0JPVlUxQ1JWSWdLeUF5TmlBcklESTJYRzVjZEZ4MGFXWWdLR052WkdVZ1BDQlZVRkJGVWlBcklESTJLVnh1WEhSY2RGeDBjbVYwZFhKdUlHTnZaR1VnTFNCVlVGQkZVbHh1WEhSY2RHbG1JQ2hqYjJSbElEd2dURTlYUlZJZ0t5QXlOaWxjYmx4MFhIUmNkSEpsZEhWeWJpQmpiMlJsSUMwZ1RFOVhSVklnS3lBeU5seHVYSFI5WEc1Y2JseDBablZ1WTNScGIyNGdZalkwVkc5Q2VYUmxRWEp5WVhrZ0tHSTJOQ2tnZTF4dVhIUmNkSFpoY2lCcExDQnFMQ0JzTENCMGJYQXNJSEJzWVdObFNHOXNaR1Z5Y3l3Z1lYSnlYRzVjYmx4MFhIUnBaaUFvWWpZMExteGxibWQwYUNBbElEUWdQaUF3S1NCN1hHNWNkRngwWEhSMGFISnZkeUJ1WlhjZ1JYSnliM0lvSjBsdWRtRnNhV1FnYzNSeWFXNW5MaUJNWlc1bmRHZ2diWFZ6ZENCaVpTQmhJRzExYkhScGNHeGxJRzltSURRbktWeHVYSFJjZEgxY2JseHVYSFJjZEM4dklIUm9aU0J1ZFcxaVpYSWdiMllnWlhGMVlXd2djMmxuYm5NZ0tIQnNZV05sSUdodmJHUmxjbk1wWEc1Y2RGeDBMeThnYVdZZ2RHaGxjbVVnWVhKbElIUjNieUJ3YkdGalpXaHZiR1JsY25Nc0lIUm9ZVzRnZEdobElIUjNieUJqYUdGeVlXTjBaWEp6SUdKbFptOXlaU0JwZEZ4dVhIUmNkQzh2SUhKbGNISmxjMlZ1ZENCdmJtVWdZbmwwWlZ4dVhIUmNkQzh2SUdsbUlIUm9aWEpsSUdseklHOXViSGtnYjI1bExDQjBhR1Z1SUhSb1pTQjBhSEpsWlNCamFHRnlZV04wWlhKeklHSmxabTl5WlNCcGRDQnlaWEJ5WlhObGJuUWdNaUJpZVhSbGMxeHVYSFJjZEM4dklIUm9hWE1nYVhNZ2FuVnpkQ0JoSUdOb1pXRndJR2hoWTJzZ2RHOGdibTkwSUdSdklHbHVaR1Y0VDJZZ2RIZHBZMlZjYmx4MFhIUjJZWElnYkdWdUlEMGdZalkwTG14bGJtZDBhRnh1WEhSY2RIQnNZV05sU0c5c1pHVnljeUE5SUNjOUp5QTlQVDBnWWpZMExtTm9ZWEpCZENoc1pXNGdMU0F5S1NBL0lESWdPaUFuUFNjZ1BUMDlJR0kyTkM1amFHRnlRWFFvYkdWdUlDMGdNU2tnUHlBeElEb2dNRnh1WEc1Y2RGeDBMeThnWW1GelpUWTBJR2x6SURRdk15QXJJSFZ3SUhSdklIUjNieUJqYUdGeVlXTjBaWEp6SUc5bUlIUm9aU0J2Y21sbmFXNWhiQ0JrWVhSaFhHNWNkRngwWVhKeUlEMGdibVYzSUVGeWNpaGlOalF1YkdWdVozUm9JQ29nTXlBdklEUWdMU0J3YkdGalpVaHZiR1JsY25NcFhHNWNibHgwWEhRdkx5QnBaaUIwYUdWeVpTQmhjbVVnY0d4aFkyVm9iMnhrWlhKekxDQnZibXg1SUdkbGRDQjFjQ0IwYnlCMGFHVWdiR0Z6ZENCamIyMXdiR1YwWlNBMElHTm9ZWEp6WEc1Y2RGeDBiQ0E5SUhCc1lXTmxTRzlzWkdWeWN5QStJREFnUHlCaU5qUXViR1Z1WjNSb0lDMGdOQ0E2SUdJMk5DNXNaVzVuZEdoY2JseHVYSFJjZEhaaGNpQk1JRDBnTUZ4dVhHNWNkRngwWm5WdVkzUnBiMjRnY0hWemFDQW9kaWtnZTF4dVhIUmNkRngwWVhKeVcwd3JLMTBnUFNCMlhHNWNkRngwZlZ4dVhHNWNkRngwWm05eUlDaHBJRDBnTUN3Z2FpQTlJREE3SUdrZ1BDQnNPeUJwSUNzOUlEUXNJR29nS3owZ015a2dlMXh1WEhSY2RGeDBkRzF3SUQwZ0tHUmxZMjlrWlNoaU5qUXVZMmhoY2tGMEtHa3BLU0E4UENBeE9Da2dmQ0FvWkdWamIyUmxLR0kyTkM1amFHRnlRWFFvYVNBcklERXBLU0E4UENBeE1pa2dmQ0FvWkdWamIyUmxLR0kyTkM1amFHRnlRWFFvYVNBcklESXBLU0E4UENBMktTQjhJR1JsWTI5a1pTaGlOalF1WTJoaGNrRjBLR2tnS3lBektTbGNibHgwWEhSY2RIQjFjMmdvS0hSdGNDQW1JREI0UmtZd01EQXdLU0ErUGlBeE5pbGNibHgwWEhSY2RIQjFjMmdvS0hSdGNDQW1JREI0UmtZd01Da2dQajRnT0NsY2JseDBYSFJjZEhCMWMyZ29kRzF3SUNZZ01IaEdSaWxjYmx4MFhIUjlYRzVjYmx4MFhIUnBaaUFvY0d4aFkyVkliMnhrWlhKeklEMDlQU0F5S1NCN1hHNWNkRngwWEhSMGJYQWdQU0FvWkdWamIyUmxLR0kyTkM1amFHRnlRWFFvYVNrcElEdzhJRElwSUh3Z0tHUmxZMjlrWlNoaU5qUXVZMmhoY2tGMEtHa2dLeUF4S1NrZ1BqNGdOQ2xjYmx4MFhIUmNkSEIxYzJnb2RHMXdJQ1lnTUhoR1JpbGNibHgwWEhSOUlHVnNjMlVnYVdZZ0tIQnNZV05sU0c5c1pHVnljeUE5UFQwZ01Ta2dlMXh1WEhSY2RGeDBkRzF3SUQwZ0tHUmxZMjlrWlNoaU5qUXVZMmhoY2tGMEtHa3BLU0E4UENBeE1Da2dmQ0FvWkdWamIyUmxLR0kyTkM1amFHRnlRWFFvYVNBcklERXBLU0E4UENBMEtTQjhJQ2hrWldOdlpHVW9ZalkwTG1Ob1lYSkJkQ2hwSUNzZ01pa3BJRDQrSURJcFhHNWNkRngwWEhSd2RYTm9LQ2gwYlhBZ1BqNGdPQ2tnSmlBd2VFWkdLVnh1WEhSY2RGeDBjSFZ6YUNoMGJYQWdKaUF3ZUVaR0tWeHVYSFJjZEgxY2JseHVYSFJjZEhKbGRIVnliaUJoY25KY2JseDBmVnh1WEc1Y2RHWjFibU4wYVc5dUlIVnBiblE0Vkc5Q1lYTmxOalFnS0hWcGJuUTRLU0I3WEc1Y2RGeDBkbUZ5SUdrc1hHNWNkRngwWEhSbGVIUnlZVUo1ZEdWeklEMGdkV2x1ZERndWJHVnVaM1JvSUNVZ015d2dMeThnYVdZZ2QyVWdhR0YyWlNBeElHSjVkR1VnYkdWbWRDd2djR0ZrSURJZ1lubDBaWE5jYmx4MFhIUmNkRzkxZEhCMWRDQTlJRndpWENJc1hHNWNkRngwWEhSMFpXMXdMQ0JzWlc1bmRHaGNibHh1WEhSY2RHWjFibU4wYVc5dUlHVnVZMjlrWlNBb2JuVnRLU0I3WEc1Y2RGeDBYSFJ5WlhSMWNtNGdiRzl2YTNWd0xtTm9ZWEpCZENodWRXMHBYRzVjZEZ4MGZWeHVYRzVjZEZ4MFpuVnVZM1JwYjI0Z2RISnBjR3hsZEZSdlFtRnpaVFkwSUNodWRXMHBJSHRjYmx4MFhIUmNkSEpsZEhWeWJpQmxibU52WkdVb2JuVnRJRDQrSURFNElDWWdNSGd6UmlrZ0t5QmxibU52WkdVb2JuVnRJRDQrSURFeUlDWWdNSGd6UmlrZ0t5QmxibU52WkdVb2JuVnRJRDQrSURZZ0ppQXdlRE5HS1NBcklHVnVZMjlrWlNodWRXMGdKaUF3ZUROR0tWeHVYSFJjZEgxY2JseHVYSFJjZEM4dklHZHZJSFJvY205MVoyZ2dkR2hsSUdGeWNtRjVJR1YyWlhKNUlIUm9jbVZsSUdKNWRHVnpMQ0IzWlNkc2JDQmtaV0ZzSUhkcGRHZ2dkSEpoYVd4cGJtY2djM1IxWm1ZZ2JHRjBaWEpjYmx4MFhIUm1iM0lnS0drZ1BTQXdMQ0JzWlc1bmRHZ2dQU0IxYVc1ME9DNXNaVzVuZEdnZ0xTQmxlSFJ5WVVKNWRHVnpPeUJwSUR3Z2JHVnVaM1JvT3lCcElDczlJRE1wSUh0Y2JseDBYSFJjZEhSbGJYQWdQU0FvZFdsdWREaGJhVjBnUER3Z01UWXBJQ3NnS0hWcGJuUTRXMmtnS3lBeFhTQThQQ0E0S1NBcklDaDFhVzUwT0Z0cElDc2dNbDBwWEc1Y2RGeDBYSFJ2ZFhSd2RYUWdLejBnZEhKcGNHeGxkRlJ2UW1GelpUWTBLSFJsYlhBcFhHNWNkRngwZlZ4dVhHNWNkRngwTHk4Z2NHRmtJSFJvWlNCbGJtUWdkMmwwYUNCNlpYSnZjeXdnWW5WMElHMWhhMlVnYzNWeVpTQjBieUJ1YjNRZ1ptOXlaMlYwSUhSb1pTQmxlSFJ5WVNCaWVYUmxjMXh1WEhSY2RITjNhWFJqYUNBb1pYaDBjbUZDZVhSbGN5a2dlMXh1WEhSY2RGeDBZMkZ6WlNBeE9seHVYSFJjZEZ4MFhIUjBaVzF3SUQwZ2RXbHVkRGhiZFdsdWREZ3ViR1Z1WjNSb0lDMGdNVjFjYmx4MFhIUmNkRngwYjNWMGNIVjBJQ3M5SUdWdVkyOWtaU2gwWlcxd0lENCtJRElwWEc1Y2RGeDBYSFJjZEc5MWRIQjFkQ0FyUFNCbGJtTnZaR1VvS0hSbGJYQWdQRHdnTkNrZ0ppQXdlRE5HS1Z4dVhIUmNkRngwWEhSdmRYUndkWFFnS3owZ0p6MDlKMXh1WEhSY2RGeDBYSFJpY21WaGExeHVYSFJjZEZ4MFkyRnpaU0F5T2x4dVhIUmNkRngwWEhSMFpXMXdJRDBnS0hWcGJuUTRXM1ZwYm5RNExteGxibWQwYUNBdElESmRJRHc4SURncElDc2dLSFZwYm5RNFczVnBiblE0TG14bGJtZDBhQ0F0SURGZEtWeHVYSFJjZEZ4MFhIUnZkWFJ3ZFhRZ0t6MGdaVzVqYjJSbEtIUmxiWEFnUGo0Z01UQXBYRzVjZEZ4MFhIUmNkRzkxZEhCMWRDQXJQU0JsYm1OdlpHVW9LSFJsYlhBZ1BqNGdOQ2tnSmlBd2VETkdLVnh1WEhSY2RGeDBYSFJ2ZFhSd2RYUWdLejBnWlc1amIyUmxLQ2gwWlcxd0lEdzhJRElwSUNZZ01IZ3pSaWxjYmx4MFhIUmNkRngwYjNWMGNIVjBJQ3M5SUNjOUoxeHVYSFJjZEZ4MFhIUmljbVZoYTF4dVhIUmNkSDFjYmx4dVhIUmNkSEpsZEhWeWJpQnZkWFJ3ZFhSY2JseDBmVnh1WEc1Y2RHVjRjRzl5ZEhNdWRHOUNlWFJsUVhKeVlYa2dQU0JpTmpSVWIwSjVkR1ZCY25KaGVWeHVYSFJsZUhCdmNuUnpMbVp5YjIxQ2VYUmxRWEp5WVhrZ1BTQjFhVzUwT0ZSdlFtRnpaVFkwWEc1OUtIUjVjR1Z2WmlCbGVIQnZjblJ6SUQwOVBTQW5kVzVrWldacGJtVmtKeUEvSUNoMGFHbHpMbUpoYzJVMk5HcHpJRDBnZTMwcElEb2daWGh3YjNKMGN5a3BYRzVjYm4wcExtTmhiR3dvZEdocGN5eHlaWEYxYVhKbEtGd2laUzlWS3prM1hDSXBMSFI1Y0dWdlppQnpaV3htSUNFOVBTQmNJblZ1WkdWbWFXNWxaRndpSUQ4Z2MyVnNaaUE2SUhSNWNHVnZaaUIzYVc1a2IzY2dJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSWdQeUIzYVc1a2IzY2dPaUI3ZlN4eVpYRjFhWEpsS0Z3aVluVm1abVZ5WENJcExrSjFabVpsY2l4aGNtZDFiV1Z1ZEhOYk0xMHNZWEpuZFcxbGJuUnpXelJkTEdGeVozVnRaVzUwYzFzMVhTeGhjbWQxYldWdWRITmJObDBzWENJdkxpNWNYRnhjTGk1Y1hGeGNibTlrWlY5dGIyUjFiR1Z6WEZ4Y1hHSmhjMlUyTkMxcWMxeGNYRnhzYVdKY1hGeGNZalkwTG1welhDSXNYQ0l2TGk1Y1hGeGNMaTVjWEZ4Y2JtOWtaVjl0YjJSMWJHVnpYRnhjWEdKaGMyVTJOQzFxYzF4Y1hGeHNhV0pjSWlraUxDSW9ablZ1WTNScGIyNGdLSEJ5YjJObGMzTXNaMnh2WW1Gc0xFSjFabVpsY2l4ZlgyRnlaM1Z0Wlc1ME1DeGZYMkZ5WjNWdFpXNTBNU3hmWDJGeVozVnRaVzUwTWl4ZlgyRnlaM1Z0Wlc1ME15eGZYMlpwYkdWdVlXMWxMRjlmWkdseWJtRnRaU2w3WEc0dktpRmNiaUFxSUZSb1pTQmlkV1ptWlhJZ2JXOWtkV3hsSUdaeWIyMGdibTlrWlM1cWN5d2dabTl5SUhSb1pTQmljbTkzYzJWeUxseHVJQ3BjYmlBcUlFQmhkWFJvYjNJZ0lDQkdaWEp2YzNNZ1FXSnZkV3RvWVdScGFtVm9JRHhtWlhKdmMzTkFabVZ5YjNOekxtOXlaejRnUEdoMGRIQTZMeTltWlhKdmMzTXViM0puUGx4dUlDb2dRR3hwWTJWdWMyVWdJRTFKVkZ4dUlDb3ZYRzVjYm5aaGNpQmlZWE5sTmpRZ1BTQnlaWEYxYVhKbEtDZGlZWE5sTmpRdGFuTW5LVnh1ZG1GeUlHbGxaV1UzTlRRZ1BTQnlaWEYxYVhKbEtDZHBaV1ZsTnpVMEp5bGNibHh1Wlhod2IzSjBjeTVDZFdabVpYSWdQU0JDZFdabVpYSmNibVY0Y0c5eWRITXVVMnh2ZDBKMVptWmxjaUE5SUVKMVptWmxjbHh1Wlhod2IzSjBjeTVKVGxOUVJVTlVYMDFCV0Y5Q1dWUkZVeUE5SURVd1hHNUNkV1ptWlhJdWNHOXZiRk5wZW1VZ1BTQTRNVGt5WEc1Y2JpOHFLbHh1SUNvZ1NXWWdZRUoxWm1abGNpNWZkWE5sVkhsd1pXUkJjbkpoZVhOZ09seHVJQ29nSUNBOVBUMGdkSEoxWlNBZ0lDQlZjMlVnVldsdWREaEJjbkpoZVNCcGJYQnNaVzFsYm5SaGRHbHZiaUFvWm1GemRHVnpkQ2xjYmlBcUlDQWdQVDA5SUdaaGJITmxJQ0FnVlhObElFOWlhbVZqZENCcGJYQnNaVzFsYm5SaGRHbHZiaUFvWTI5dGNHRjBhV0pzWlNCa2IzZHVJSFJ2SUVsRk5pbGNiaUFxTDF4dVFuVm1abVZ5TGw5MWMyVlVlWEJsWkVGeWNtRjVjeUE5SUNobWRXNWpkR2x2YmlBb0tTQjdYRzRnSUM4dklFUmxkR1ZqZENCcFppQmljbTkzYzJWeUlITjFjSEJ2Y25SeklGUjVjR1ZrSUVGeWNtRjVjeTRnVTNWd2NHOXlkR1ZrSUdKeWIzZHpaWEp6SUdGeVpTQkpSU0F4TUNzc0lFWnBjbVZtYjNnZ05Dc3NYRzRnSUM4dklFTm9jbTl0WlNBM0t5d2dVMkZtWVhKcElEVXVNU3NzSUU5d1pYSmhJREV4TGpZckxDQnBUMU1nTkM0eUt5NGdTV1lnZEdobElHSnliM2R6WlhJZ1pHOWxjeUJ1YjNRZ2MzVndjRzl5ZENCaFpHUnBibWRjYmlBZ0x5OGdjSEp2Y0dWeWRHbGxjeUIwYnlCZ1ZXbHVkRGhCY25KaGVXQWdhVzV6ZEdGdVkyVnpMQ0IwYUdWdUlIUm9ZWFFuY3lCMGFHVWdjMkZ0WlNCaGN5QnVieUJnVldsdWREaEJjbkpoZVdBZ2MzVndjRzl5ZEZ4dUlDQXZMeUJpWldOaGRYTmxJSGRsSUc1bFpXUWdkRzhnWW1VZ1lXSnNaU0IwYnlCaFpHUWdZV3hzSUhSb1pTQnViMlJsSUVKMVptWmxjaUJCVUVrZ2JXVjBhRzlrY3k0Z1ZHaHBjeUJwY3lCaGJpQnBjM04xWlZ4dUlDQXZMeUJwYmlCR2FYSmxabTk0SURRdE1qa3VJRTV2ZHlCbWFYaGxaRG9nYUhSMGNITTZMeTlpZFdkNmFXeHNZUzV0YjNwcGJHeGhMbTl5Wnk5emFHOTNYMkoxWnk1aloyay9hV1E5TmprMU5ETTRYRzRnSUhSeWVTQjdYRzRnSUNBZ2RtRnlJR0oxWmlBOUlHNWxkeUJCY25KaGVVSjFabVpsY2lnd0tWeHVJQ0FnSUhaaGNpQmhjbklnUFNCdVpYY2dWV2x1ZERoQmNuSmhlU2hpZFdZcFhHNGdJQ0FnWVhKeUxtWnZieUE5SUdaMWJtTjBhVzl1SUNncElIc2djbVYwZFhKdUlEUXlJSDFjYmlBZ0lDQnlaWFIxY200Z05ESWdQVDA5SUdGeWNpNW1iMjhvS1NBbUpseHVJQ0FnSUNBZ0lDQjBlWEJsYjJZZ1lYSnlMbk4xWW1GeWNtRjVJRDA5UFNBblpuVnVZM1JwYjI0bklDOHZJRU5vY205dFpTQTVMVEV3SUd4aFkyc2dZSE4xWW1GeWNtRjVZRnh1SUNCOUlHTmhkR05vSUNobEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUdaaGJITmxYRzRnSUgxY2JuMHBLQ2xjYmx4dUx5b3FYRzRnS2lCRGJHRnpjem9nUW5WbVptVnlYRzRnS2lBOVBUMDlQVDA5UFQwOVBUMDlYRzRnS2x4dUlDb2dWR2hsSUVKMVptWmxjaUJqYjI1emRISjFZM1J2Y2lCeVpYUjFjbTV6SUdsdWMzUmhibU5sY3lCdlppQmdWV2x1ZERoQmNuSmhlV0FnZEdoaGRDQmhjbVVnWVhWbmJXVnVkR1ZrWEc0Z0tpQjNhWFJvSUdaMWJtTjBhVzl1SUhCeWIzQmxjblJwWlhNZ1ptOXlJR0ZzYkNCMGFHVWdibTlrWlNCZ1FuVm1abVZ5WUNCQlVFa2dablZ1WTNScGIyNXpMaUJYWlNCMWMyVmNiaUFxSUdCVmFXNTBPRUZ5Y21GNVlDQnpieUIwYUdGMElITnhkV0Z5WlNCaWNtRmphMlYwSUc1dmRHRjBhVzl1SUhkdmNtdHpJR0Z6SUdWNGNHVmpkR1ZrSUMwdElHbDBJSEpsZEhWeWJuTmNiaUFxSUdFZ2MybHVaMnhsSUc5amRHVjBMbHh1SUNwY2JpQXFJRUo1SUdGMVoyMWxiblJwYm1jZ2RHaGxJR2x1YzNSaGJtTmxjeXdnZDJVZ1kyRnVJR0YyYjJsa0lHMXZaR2xtZVdsdVp5QjBhR1VnWUZWcGJuUTRRWEp5WVhsZ1hHNGdLaUJ3Y205MGIzUjVjR1V1WEc0Z0tpOWNibVoxYm1OMGFXOXVJRUoxWm1abGNpQW9jM1ZpYW1WamRDd2daVzVqYjJScGJtY3NJRzV2V21WeWJ5a2dlMXh1SUNCcFppQW9JU2gwYUdseklHbHVjM1JoYm1ObGIyWWdRblZtWm1WeUtTbGNiaUFnSUNCeVpYUjFjbTRnYm1WM0lFSjFabVpsY2loemRXSnFaV04wTENCbGJtTnZaR2x1Wnl3Z2JtOWFaWEp2S1Z4dVhHNGdJSFpoY2lCMGVYQmxJRDBnZEhsd1pXOW1JSE4xWW1wbFkzUmNibHh1SUNBdkx5QlhiM0pyWVhKdmRXNWtPaUJ1YjJSbEozTWdZbUZ6WlRZMElHbHRjR3hsYldWdWRHRjBhVzl1SUdGc2JHOTNjeUJtYjNJZ2JtOXVMWEJoWkdSbFpDQnpkSEpwYm1kelhHNGdJQzh2SUhkb2FXeGxJR0poYzJVMk5DMXFjeUJrYjJWeklHNXZkQzVjYmlBZ2FXWWdLR1Z1WTI5a2FXNW5JRDA5UFNBblltRnpaVFkwSnlBbUppQjBlWEJsSUQwOVBTQW5jM1J5YVc1bkp5a2dlMXh1SUNBZ0lITjFZbXBsWTNRZ1BTQnpkSEpwYm1kMGNtbHRLSE4xWW1wbFkzUXBYRzRnSUNBZ2QyaHBiR1VnS0hOMVltcGxZM1F1YkdWdVozUm9JQ1VnTkNBaFBUMGdNQ2tnZTF4dUlDQWdJQ0FnYzNWaWFtVmpkQ0E5SUhOMVltcGxZM1FnS3lBblBTZGNiaUFnSUNCOVhHNGdJSDFjYmx4dUlDQXZMeUJHYVc1a0lIUm9aU0JzWlc1bmRHaGNiaUFnZG1GeUlHeGxibWQwYUZ4dUlDQnBaaUFvZEhsd1pTQTlQVDBnSjI1MWJXSmxjaWNwWEc0Z0lDQWdiR1Z1WjNSb0lEMGdZMjlsY21ObEtITjFZbXBsWTNRcFhHNGdJR1ZzYzJVZ2FXWWdLSFI1Y0dVZ1BUMDlJQ2R6ZEhKcGJtY25LVnh1SUNBZ0lHeGxibWQwYUNBOUlFSjFabVpsY2k1aWVYUmxUR1Z1WjNSb0tITjFZbXBsWTNRc0lHVnVZMjlrYVc1bktWeHVJQ0JsYkhObElHbG1JQ2gwZVhCbElEMDlQU0FuYjJKcVpXTjBKeWxjYmlBZ0lDQnNaVzVuZEdnZ1BTQmpiMlZ5WTJVb2MzVmlhbVZqZEM1c1pXNW5kR2dwSUM4dklHRnpjM1Z0WlNCMGFHRjBJRzlpYW1WamRDQnBjeUJoY25KaGVTMXNhV3RsWEc0Z0lHVnNjMlZjYmlBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0owWnBjbk4wSUdGeVozVnRaVzUwSUc1bFpXUnpJSFJ2SUdKbElHRWdiblZ0WW1WeUxDQmhjbkpoZVNCdmNpQnpkSEpwYm1jdUp5bGNibHh1SUNCMllYSWdZblZtWEc0Z0lHbG1JQ2hDZFdabVpYSXVYM1Z6WlZSNWNHVmtRWEp5WVhsektTQjdYRzRnSUNBZ0x5OGdVSEpsWm1WeWNtVmtPaUJTWlhSMWNtNGdZVzRnWVhWbmJXVnVkR1ZrSUdCVmFXNTBPRUZ5Y21GNVlDQnBibk4wWVc1alpTQm1iM0lnWW1WemRDQndaWEptYjNKdFlXNWpaVnh1SUNBZ0lHSjFaaUE5SUVKMVptWmxjaTVmWVhWbmJXVnVkQ2h1WlhjZ1ZXbHVkRGhCY25KaGVTaHNaVzVuZEdncEtWeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDOHZJRVpoYkd4aVlXTnJPaUJTWlhSMWNtNGdWRWhKVXlCcGJuTjBZVzVqWlNCdlppQkNkV1ptWlhJZ0tHTnlaV0YwWldRZ1lua2dZRzVsZDJBcFhHNGdJQ0FnWW5WbUlEMGdkR2hwYzF4dUlDQWdJR0oxWmk1c1pXNW5kR2dnUFNCc1pXNW5kR2hjYmlBZ0lDQmlkV1l1WDJselFuVm1abVZ5SUQwZ2RISjFaVnh1SUNCOVhHNWNiaUFnZG1GeUlHbGNiaUFnYVdZZ0tFSjFabVpsY2k1ZmRYTmxWSGx3WldSQmNuSmhlWE1nSmlZZ2RIbHdaVzltSUhOMVltcGxZM1F1WW5sMFpVeGxibWQwYUNBOVBUMGdKMjUxYldKbGNpY3BJSHRjYmlBZ0lDQXZMeUJUY0dWbFpDQnZjSFJwYldsNllYUnBiMjRnTFMwZ2RYTmxJSE5sZENCcFppQjNaU2R5WlNCamIzQjVhVzVuSUdaeWIyMGdZU0IwZVhCbFpDQmhjbkpoZVZ4dUlDQWdJR0oxWmk1ZmMyVjBLSE4xWW1wbFkzUXBYRzRnSUgwZ1pXeHpaU0JwWmlBb2FYTkJjbkpoZVdsemFDaHpkV0pxWldOMEtTa2dlMXh1SUNBZ0lDOHZJRlJ5WldGMElHRnljbUY1TFdsemFDQnZZbXBsWTNSeklHRnpJR0VnWW5sMFpTQmhjbkpoZVZ4dUlDQWdJR1p2Y2lBb2FTQTlJREE3SUdrZ1BDQnNaVzVuZEdnN0lHa3JLeWtnZTF4dUlDQWdJQ0FnYVdZZ0tFSjFabVpsY2k1cGMwSjFabVpsY2loemRXSnFaV04wS1NsY2JpQWdJQ0FnSUNBZ1luVm1XMmxkSUQwZ2MzVmlhbVZqZEM1eVpXRmtWVWx1ZERnb2FTbGNiaUFnSUNBZ0lHVnNjMlZjYmlBZ0lDQWdJQ0FnWW5WbVcybGRJRDBnYzNWaWFtVmpkRnRwWFZ4dUlDQWdJSDFjYmlBZ2ZTQmxiSE5sSUdsbUlDaDBlWEJsSUQwOVBTQW5jM1J5YVc1bkp5a2dlMXh1SUNBZ0lHSjFaaTUzY21sMFpTaHpkV0pxWldOMExDQXdMQ0JsYm1OdlpHbHVaeWxjYmlBZ2ZTQmxiSE5sSUdsbUlDaDBlWEJsSUQwOVBTQW5iblZ0WW1WeUp5QW1KaUFoUW5WbVptVnlMbDkxYzJWVWVYQmxaRUZ5Y21GNWN5QW1KaUFoYm05YVpYSnZLU0I3WEc0Z0lDQWdabTl5SUNocElEMGdNRHNnYVNBOElHeGxibWQwYURzZ2FTc3JLU0I3WEc0Z0lDQWdJQ0JpZFdaYmFWMGdQU0F3WEc0Z0lDQWdmVnh1SUNCOVhHNWNiaUFnY21WMGRYSnVJR0oxWmx4dWZWeHVYRzR2THlCVFZFRlVTVU1nVFVWVVNFOUVVMXh1THk4Z1BUMDlQVDA5UFQwOVBUMDlQVDFjYmx4dVFuVm1abVZ5TG1selJXNWpiMlJwYm1jZ1BTQm1kVzVqZEdsdmJpQW9aVzVqYjJScGJtY3BJSHRjYmlBZ2MzZHBkR05vSUNoVGRISnBibWNvWlc1amIyUnBibWNwTG5SdlRHOTNaWEpEWVhObEtDa3BJSHRjYmlBZ0lDQmpZWE5sSUNkb1pYZ25PbHh1SUNBZ0lHTmhjMlVnSjNWMFpqZ25PbHh1SUNBZ0lHTmhjMlVnSjNWMFppMDRKenBjYmlBZ0lDQmpZWE5sSUNkaGMyTnBhU2M2WEc0Z0lDQWdZMkZ6WlNBblltbHVZWEo1SnpwY2JpQWdJQ0JqWVhObElDZGlZWE5sTmpRbk9seHVJQ0FnSUdOaGMyVWdKM0poZHljNlhHNGdJQ0FnWTJGelpTQW5kV056TWljNlhHNGdJQ0FnWTJGelpTQW5kV056TFRJbk9seHVJQ0FnSUdOaGMyVWdKM1YwWmpFMmJHVW5PbHh1SUNBZ0lHTmhjMlVnSjNWMFppMHhObXhsSnpwY2JpQWdJQ0FnSUhKbGRIVnliaUIwY25WbFhHNGdJQ0FnWkdWbVlYVnNkRHBjYmlBZ0lDQWdJSEpsZEhWeWJpQm1ZV3h6WlZ4dUlDQjlYRzU5WEc1Y2JrSjFabVpsY2k1cGMwSjFabVpsY2lBOUlHWjFibU4wYVc5dUlDaGlLU0I3WEc0Z0lISmxkSFZ5YmlBaElTaGlJQ0U5UFNCdWRXeHNJQ1ltSUdJZ0lUMDlJSFZ1WkdWbWFXNWxaQ0FtSmlCaUxsOXBjMEoxWm1abGNpbGNibjFjYmx4dVFuVm1abVZ5TG1KNWRHVk1aVzVuZEdnZ1BTQm1kVzVqZEdsdmJpQW9jM1J5TENCbGJtTnZaR2x1WnlrZ2UxeHVJQ0IyWVhJZ2NtVjBYRzRnSUhOMGNpQTlJSE4wY2lBcklDY25YRzRnSUhOM2FYUmphQ0FvWlc1amIyUnBibWNnZkh3Z0ozVjBaamduS1NCN1hHNGdJQ0FnWTJGelpTQW5hR1Y0SnpwY2JpQWdJQ0FnSUhKbGRDQTlJSE4wY2k1c1pXNW5kR2dnTHlBeVhHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjNWMFpqZ25PbHh1SUNBZ0lHTmhjMlVnSjNWMFppMDRKenBjYmlBZ0lDQWdJSEpsZENBOUlIVjBaamhVYjBKNWRHVnpLSE4wY2lrdWJHVnVaM1JvWEc0Z0lDQWdJQ0JpY21WaGExeHVJQ0FnSUdOaGMyVWdKMkZ6WTJscEp6cGNiaUFnSUNCallYTmxJQ2RpYVc1aGNua25PbHh1SUNBZ0lHTmhjMlVnSjNKaGR5YzZYRzRnSUNBZ0lDQnlaWFFnUFNCemRISXViR1Z1WjNSb1hHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjJKaGMyVTJOQ2M2WEc0Z0lDQWdJQ0J5WlhRZ1BTQmlZWE5sTmpSVWIwSjVkR1Z6S0hOMGNpa3ViR1Z1WjNSb1hHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjNWamN6SW5PbHh1SUNBZ0lHTmhjMlVnSjNWamN5MHlKenBjYmlBZ0lDQmpZWE5sSUNkMWRHWXhObXhsSnpwY2JpQWdJQ0JqWVhObElDZDFkR1l0TVRac1pTYzZYRzRnSUNBZ0lDQnlaWFFnUFNCemRISXViR1Z1WjNSb0lDb2dNbHh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JrWldaaGRXeDBPbHh1SUNBZ0lDQWdkR2h5YjNjZ2JtVjNJRVZ5Y205eUtDZFZibXR1YjNkdUlHVnVZMjlrYVc1bkp5bGNiaUFnZlZ4dUlDQnlaWFIxY200Z2NtVjBYRzU5WEc1Y2JrSjFabVpsY2k1amIyNWpZWFFnUFNCbWRXNWpkR2x2YmlBb2JHbHpkQ3dnZEc5MFlXeE1aVzVuZEdncElIdGNiaUFnWVhOelpYSjBLR2x6UVhKeVlYa29iR2x6ZENrc0lDZFZjMkZuWlRvZ1FuVm1abVZ5TG1OdmJtTmhkQ2hzYVhOMExDQmJkRzkwWVd4TVpXNW5kR2hkS1Z4Y2JpY2dLMXh1SUNBZ0lDQWdKMnhwYzNRZ2MyaHZkV3hrSUdKbElHRnVJRUZ5Y21GNUxpY3BYRzVjYmlBZ2FXWWdLR3hwYzNRdWJHVnVaM1JvSUQwOVBTQXdLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHNWxkeUJDZFdabVpYSW9NQ2xjYmlBZ2ZTQmxiSE5sSUdsbUlDaHNhWE4wTG14bGJtZDBhQ0E5UFQwZ01Ta2dlMXh1SUNBZ0lISmxkSFZ5YmlCc2FYTjBXekJkWEc0Z0lIMWNibHh1SUNCMllYSWdhVnh1SUNCcFppQW9kSGx3Wlc5bUlIUnZkR0ZzVEdWdVozUm9JQ0U5UFNBbmJuVnRZbVZ5SnlrZ2UxeHVJQ0FnSUhSdmRHRnNUR1Z1WjNSb0lEMGdNRnh1SUNBZ0lHWnZjaUFvYVNBOUlEQTdJR2tnUENCc2FYTjBMbXhsYm1kMGFEc2dhU3NyS1NCN1hHNGdJQ0FnSUNCMGIzUmhiRXhsYm1kMGFDQXJQU0JzYVhOMFcybGRMbXhsYm1kMGFGeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lIWmhjaUJpZFdZZ1BTQnVaWGNnUW5WbVptVnlLSFJ2ZEdGc1RHVnVaM1JvS1Z4dUlDQjJZWElnY0c5eklEMGdNRnh1SUNCbWIzSWdLR2tnUFNBd095QnBJRHdnYkdsemRDNXNaVzVuZEdnN0lHa3JLeWtnZTF4dUlDQWdJSFpoY2lCcGRHVnRJRDBnYkdsemRGdHBYVnh1SUNBZ0lHbDBaVzB1WTI5d2VTaGlkV1lzSUhCdmN5bGNiaUFnSUNCd2IzTWdLejBnYVhSbGJTNXNaVzVuZEdoY2JpQWdmVnh1SUNCeVpYUjFjbTRnWW5WbVhHNTlYRzVjYmk4dklFSlZSa1pGVWlCSlRsTlVRVTVEUlNCTlJWUklUMFJUWEc0dkx5QTlQVDA5UFQwOVBUMDlQVDA5UFQwOVBUMDlQVDA5UFZ4dVhHNW1kVzVqZEdsdmJpQmZhR1Y0VjNKcGRHVWdLR0oxWml3Z2MzUnlhVzVuTENCdlptWnpaWFFzSUd4bGJtZDBhQ2tnZTF4dUlDQnZabVp6WlhRZ1BTQk9kVzFpWlhJb2IyWm1jMlYwS1NCOGZDQXdYRzRnSUhaaGNpQnlaVzFoYVc1cGJtY2dQU0JpZFdZdWJHVnVaM1JvSUMwZ2IyWm1jMlYwWEc0Z0lHbG1JQ2doYkdWdVozUm9LU0I3WEc0Z0lDQWdiR1Z1WjNSb0lEMGdjbVZ0WVdsdWFXNW5YRzRnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdiR1Z1WjNSb0lEMGdUblZ0WW1WeUtHeGxibWQwYUNsY2JpQWdJQ0JwWmlBb2JHVnVaM1JvSUQ0Z2NtVnRZV2x1YVc1bktTQjdYRzRnSUNBZ0lDQnNaVzVuZEdnZ1BTQnlaVzFoYVc1cGJtZGNiaUFnSUNCOVhHNGdJSDFjYmx4dUlDQXZMeUJ0ZFhOMElHSmxJR0Z1SUdWMlpXNGdiblZ0WW1WeUlHOW1JR1JwWjJsMGMxeHVJQ0IyWVhJZ2MzUnlUR1Z1SUQwZ2MzUnlhVzVuTG14bGJtZDBhRnh1SUNCaGMzTmxjblFvYzNSeVRHVnVJQ1VnTWlBOVBUMGdNQ3dnSjBsdWRtRnNhV1FnYUdWNElITjBjbWx1WnljcFhHNWNiaUFnYVdZZ0tHeGxibWQwYUNBK0lITjBja3hsYmlBdklESXBJSHRjYmlBZ0lDQnNaVzVuZEdnZ1BTQnpkSEpNWlc0Z0x5QXlYRzRnSUgxY2JpQWdabTl5SUNoMllYSWdhU0E5SURBN0lHa2dQQ0JzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUhaaGNpQmllWFJsSUQwZ2NHRnljMlZKYm5Rb2MzUnlhVzVuTG5OMVluTjBjaWhwSUNvZ01pd2dNaWtzSURFMktWeHVJQ0FnSUdGemMyVnlkQ2doYVhOT1lVNG9ZbmwwWlNrc0lDZEpiblpoYkdsa0lHaGxlQ0J6ZEhKcGJtY25LVnh1SUNBZ0lHSjFabHR2Wm1aelpYUWdLeUJwWFNBOUlHSjVkR1ZjYmlBZ2ZWeHVJQ0JDZFdabVpYSXVYMk5vWVhKelYzSnBkSFJsYmlBOUlHa2dLaUF5WEc0Z0lISmxkSFZ5YmlCcFhHNTlYRzVjYm1aMWJtTjBhVzl1SUY5MWRHWTRWM0pwZEdVZ0tHSjFaaXdnYzNSeWFXNW5MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDa2dlMXh1SUNCMllYSWdZMmhoY25OWGNtbDBkR1Z1SUQwZ1FuVm1abVZ5TGw5amFHRnljMWR5YVhSMFpXNGdQVnh1SUNBZ0lHSnNhWFJDZFdabVpYSW9kWFJtT0ZSdlFubDBaWE1vYzNSeWFXNW5LU3dnWW5WbUxDQnZabVp6WlhRc0lHeGxibWQwYUNsY2JpQWdjbVYwZFhKdUlHTm9ZWEp6VjNKcGRIUmxibHh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZZWE5qYVdsWGNtbDBaU0FvWW5WbUxDQnpkSEpwYm1jc0lHOW1abk5sZEN3Z2JHVnVaM1JvS1NCN1hHNGdJSFpoY2lCamFHRnljMWR5YVhSMFpXNGdQU0JDZFdabVpYSXVYMk5vWVhKelYzSnBkSFJsYmlBOVhHNGdJQ0FnWW14cGRFSjFabVpsY2loaGMyTnBhVlJ2UW5sMFpYTW9jM1J5YVc1bktTd2dZblZtTENCdlptWnpaWFFzSUd4bGJtZDBhQ2xjYmlBZ2NtVjBkWEp1SUdOb1lYSnpWM0pwZEhSbGJseHVmVnh1WEc1bWRXNWpkR2x2YmlCZlltbHVZWEo1VjNKcGRHVWdLR0oxWml3Z2MzUnlhVzVuTENCdlptWnpaWFFzSUd4bGJtZDBhQ2tnZTF4dUlDQnlaWFIxY200Z1gyRnpZMmxwVjNKcGRHVW9ZblZtTENCemRISnBibWNzSUc5bVpuTmxkQ3dnYkdWdVozUm9LVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZZbUZ6WlRZMFYzSnBkR1VnS0dKMVppd2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNrZ2UxeHVJQ0IyWVhJZ1kyaGhjbk5YY21sMGRHVnVJRDBnUW5WbVptVnlMbDlqYUdGeWMxZHlhWFIwWlc0Z1BWeHVJQ0FnSUdKc2FYUkNkV1ptWlhJb1ltRnpaVFkwVkc5Q2VYUmxjeWh6ZEhKcGJtY3BMQ0JpZFdZc0lHOW1abk5sZEN3Z2JHVnVaM1JvS1Z4dUlDQnlaWFIxY200Z1kyaGhjbk5YY21sMGRHVnVYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOTFkR1l4Tm14bFYzSnBkR1VnS0dKMVppd2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNrZ2UxeHVJQ0IyWVhJZ1kyaGhjbk5YY21sMGRHVnVJRDBnUW5WbVptVnlMbDlqYUdGeWMxZHlhWFIwWlc0Z1BWeHVJQ0FnSUdKc2FYUkNkV1ptWlhJb2RYUm1NVFpzWlZSdlFubDBaWE1vYzNSeWFXNW5LU3dnWW5WbUxDQnZabVp6WlhRc0lHeGxibWQwYUNsY2JpQWdjbVYwZFhKdUlHTm9ZWEp6VjNKcGRIUmxibHh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuZHlhWFJsSUQwZ1puVnVZM1JwYjI0Z0tITjBjbWx1Wnl3Z2IyWm1jMlYwTENCc1pXNW5kR2dzSUdWdVkyOWthVzVuS1NCN1hHNGdJQzh2SUZOMWNIQnZjblFnWW05MGFDQW9jM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUN3Z1pXNWpiMlJwYm1jcFhHNGdJQzh2SUdGdVpDQjBhR1VnYkdWbllXTjVJQ2h6ZEhKcGJtY3NJR1Z1WTI5a2FXNW5MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDbGNiaUFnYVdZZ0tHbHpSbWx1YVhSbEtHOW1abk5sZENrcElIdGNiaUFnSUNCcFppQW9JV2x6Um1sdWFYUmxLR3hsYm1kMGFDa3BJSHRjYmlBZ0lDQWdJR1Z1WTI5a2FXNW5JRDBnYkdWdVozUm9YRzRnSUNBZ0lDQnNaVzVuZEdnZ1BTQjFibVJsWm1sdVpXUmNiaUFnSUNCOVhHNGdJSDBnWld4elpTQjdJQ0F2THlCc1pXZGhZM2xjYmlBZ0lDQjJZWElnYzNkaGNDQTlJR1Z1WTI5a2FXNW5YRzRnSUNBZ1pXNWpiMlJwYm1jZ1BTQnZabVp6WlhSY2JpQWdJQ0J2Wm1aelpYUWdQU0JzWlc1bmRHaGNiaUFnSUNCc1pXNW5kR2dnUFNCemQyRndYRzRnSUgxY2JseHVJQ0J2Wm1aelpYUWdQU0JPZFcxaVpYSW9iMlptYzJWMEtTQjhmQ0F3WEc0Z0lIWmhjaUJ5WlcxaGFXNXBibWNnUFNCMGFHbHpMbXhsYm1kMGFDQXRJRzltWm5ObGRGeHVJQ0JwWmlBb0lXeGxibWQwYUNrZ2UxeHVJQ0FnSUd4bGJtZDBhQ0E5SUhKbGJXRnBibWx1WjF4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUd4bGJtZDBhQ0E5SUU1MWJXSmxjaWhzWlc1bmRHZ3BYRzRnSUNBZ2FXWWdLR3hsYm1kMGFDQStJSEpsYldGcGJtbHVaeWtnZTF4dUlDQWdJQ0FnYkdWdVozUm9JRDBnY21WdFlXbHVhVzVuWEc0Z0lDQWdmVnh1SUNCOVhHNGdJR1Z1WTI5a2FXNW5JRDBnVTNSeWFXNW5LR1Z1WTI5a2FXNW5JSHg4SUNkMWRHWTRKeWt1ZEc5TWIzZGxja05oYzJVb0tWeHVYRzRnSUhaaGNpQnlaWFJjYmlBZ2MzZHBkR05vSUNobGJtTnZaR2x1WnlrZ2UxeHVJQ0FnSUdOaGMyVWdKMmhsZUNjNlhHNGdJQ0FnSUNCeVpYUWdQU0JmYUdWNFYzSnBkR1VvZEdocGN5d2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1kyRnpaU0FuZFhSbU9DYzZYRzRnSUNBZ1kyRnpaU0FuZFhSbUxUZ25PbHh1SUNBZ0lDQWdjbVYwSUQwZ1gzVjBaamhYY21sMFpTaDBhR2x6TENCemRISnBibWNzSUc5bVpuTmxkQ3dnYkdWdVozUm9LVnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZGhjMk5wYVNjNlhHNGdJQ0FnSUNCeVpYUWdQU0JmWVhOamFXbFhjbWwwWlNoMGFHbHpMQ0J6ZEhKcGJtY3NJRzltWm5ObGRDd2diR1Z1WjNSb0tWeHVJQ0FnSUNBZ1luSmxZV3RjYmlBZ0lDQmpZWE5sSUNkaWFXNWhjbmtuT2x4dUlDQWdJQ0FnY21WMElEMGdYMkpwYm1GeWVWZHlhWFJsS0hSb2FYTXNJSE4wY21sdVp5d2diMlptYzJWMExDQnNaVzVuZEdncFhHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjJKaGMyVTJOQ2M2WEc0Z0lDQWdJQ0J5WlhRZ1BTQmZZbUZ6WlRZMFYzSnBkR1VvZEdocGN5d2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1kyRnpaU0FuZFdOek1pYzZYRzRnSUNBZ1kyRnpaU0FuZFdOekxUSW5PbHh1SUNBZ0lHTmhjMlVnSjNWMFpqRTJiR1VuT2x4dUlDQWdJR05oYzJVZ0ozVjBaaTB4Tm14bEp6cGNiaUFnSUNBZ0lISmxkQ0E5SUY5MWRHWXhObXhsVjNKcGRHVW9kR2hwY3l3Z2MzUnlhVzVuTENCdlptWnpaWFFzSUd4bGJtZDBhQ2xjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWkdWbVlYVnNkRHBjYmlBZ0lDQWdJSFJvY205M0lHNWxkeUJGY25KdmNpZ25WVzVyYm05M2JpQmxibU52WkdsdVp5Y3BYRzRnSUgxY2JpQWdjbVYwZFhKdUlISmxkRnh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bklEMGdablZ1WTNScGIyNGdLR1Z1WTI5a2FXNW5MQ0J6ZEdGeWRDd2daVzVrS1NCN1hHNGdJSFpoY2lCelpXeG1JRDBnZEdocGMxeHVYRzRnSUdWdVkyOWthVzVuSUQwZ1UzUnlhVzVuS0dWdVkyOWthVzVuSUh4OElDZDFkR1k0SnlrdWRHOU1iM2RsY2tOaGMyVW9LVnh1SUNCemRHRnlkQ0E5SUU1MWJXSmxjaWh6ZEdGeWRDa2dmSHdnTUZ4dUlDQmxibVFnUFNBb1pXNWtJQ0U5UFNCMWJtUmxabWx1WldRcFhHNGdJQ0FnUHlCT2RXMWlaWElvWlc1a0tWeHVJQ0FnSURvZ1pXNWtJRDBnYzJWc1ppNXNaVzVuZEdoY2JseHVJQ0F2THlCR1lYTjBjR0YwYUNCbGJYQjBlU0J6ZEhKcGJtZHpYRzRnSUdsbUlDaGxibVFnUFQwOUlITjBZWEowS1Z4dUlDQWdJSEpsZEhWeWJpQW5KMXh1WEc0Z0lIWmhjaUJ5WlhSY2JpQWdjM2RwZEdOb0lDaGxibU52WkdsdVp5a2dlMXh1SUNBZ0lHTmhjMlVnSjJobGVDYzZYRzRnSUNBZ0lDQnlaWFFnUFNCZmFHVjRVMnhwWTJVb2MyVnNaaXdnYzNSaGNuUXNJR1Z1WkNsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1kyRnpaU0FuZFhSbU9DYzZYRzRnSUNBZ1kyRnpaU0FuZFhSbUxUZ25PbHh1SUNBZ0lDQWdjbVYwSUQwZ1gzVjBaamhUYkdsalpTaHpaV3htTENCemRHRnlkQ3dnWlc1a0tWeHVJQ0FnSUNBZ1luSmxZV3RjYmlBZ0lDQmpZWE5sSUNkaGMyTnBhU2M2WEc0Z0lDQWdJQ0J5WlhRZ1BTQmZZWE5qYVdsVGJHbGpaU2h6Wld4bUxDQnpkR0Z5ZEN3Z1pXNWtLVnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZGlhVzVoY25rbk9seHVJQ0FnSUNBZ2NtVjBJRDBnWDJKcGJtRnllVk5zYVdObEtITmxiR1lzSUhOMFlYSjBMQ0JsYm1RcFhHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjJKaGMyVTJOQ2M2WEc0Z0lDQWdJQ0J5WlhRZ1BTQmZZbUZ6WlRZMFUyeHBZMlVvYzJWc1ppd2djM1JoY25Rc0lHVnVaQ2xjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWTJGelpTQW5kV056TWljNlhHNGdJQ0FnWTJGelpTQW5kV056TFRJbk9seHVJQ0FnSUdOaGMyVWdKM1YwWmpFMmJHVW5PbHh1SUNBZ0lHTmhjMlVnSjNWMFppMHhObXhsSnpwY2JpQWdJQ0FnSUhKbGRDQTlJRjkxZEdZeE5teGxVMnhwWTJVb2MyVnNaaXdnYzNSaGNuUXNJR1Z1WkNsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1pHVm1ZWFZzZERwY2JpQWdJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduVlc1cmJtOTNiaUJsYm1OdlpHbHVaeWNwWEc0Z0lIMWNiaUFnY21WMGRYSnVJSEpsZEZ4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMblJ2U2xOUFRpQTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdjbVYwZFhKdUlIdGNiaUFnSUNCMGVYQmxPaUFuUW5WbVptVnlKeXhjYmlBZ0lDQmtZWFJoT2lCQmNuSmhlUzV3Y205MGIzUjVjR1V1YzJ4cFkyVXVZMkZzYkNoMGFHbHpMbDloY25JZ2ZId2dkR2hwY3l3Z01DbGNiaUFnZlZ4dWZWeHVYRzR2THlCamIzQjVLSFJoY21kbGRFSjFabVpsY2l3Z2RHRnlaMlYwVTNSaGNuUTlNQ3dnYzI5MWNtTmxVM1JoY25ROU1Dd2djMjkxY21ObFJXNWtQV0oxWm1abGNpNXNaVzVuZEdncFhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExtTnZjSGtnUFNCbWRXNWpkR2x2YmlBb2RHRnlaMlYwTENCMFlYSm5aWFJmYzNSaGNuUXNJSE4wWVhKMExDQmxibVFwSUh0Y2JpQWdkbUZ5SUhOdmRYSmpaU0E5SUhSb2FYTmNibHh1SUNCcFppQW9JWE4wWVhKMEtTQnpkR0Z5ZENBOUlEQmNiaUFnYVdZZ0tDRmxibVFnSmlZZ1pXNWtJQ0U5UFNBd0tTQmxibVFnUFNCMGFHbHpMbXhsYm1kMGFGeHVJQ0JwWmlBb0lYUmhjbWRsZEY5emRHRnlkQ2tnZEdGeVoyVjBYM04wWVhKMElEMGdNRnh1WEc0Z0lDOHZJRU52Y0hrZ01DQmllWFJsY3pzZ2QyVW5jbVVnWkc5dVpWeHVJQ0JwWmlBb1pXNWtJRDA5UFNCemRHRnlkQ2tnY21WMGRYSnVYRzRnSUdsbUlDaDBZWEpuWlhRdWJHVnVaM1JvSUQwOVBTQXdJSHg4SUhOdmRYSmpaUzVzWlc1bmRHZ2dQVDA5SURBcElISmxkSFZ5Ymx4dVhHNGdJQzh2SUVaaGRHRnNJR1Z5Y205eUlHTnZibVJwZEdsdmJuTmNiaUFnWVhOelpYSjBLR1Z1WkNBK1BTQnpkR0Z5ZEN3Z0ozTnZkWEpqWlVWdVpDQThJSE52ZFhKalpWTjBZWEowSnlsY2JpQWdZWE56WlhKMEtIUmhjbWRsZEY5emRHRnlkQ0ErUFNBd0lDWW1JSFJoY21kbGRGOXpkR0Z5ZENBOElIUmhjbWRsZEM1c1pXNW5kR2dzWEc0Z0lDQWdJQ0FuZEdGeVoyVjBVM1JoY25RZ2IzVjBJRzltSUdKdmRXNWtjeWNwWEc0Z0lHRnpjMlZ5ZENoemRHRnlkQ0ErUFNBd0lDWW1JSE4wWVhKMElEd2djMjkxY21ObExteGxibWQwYUN3Z0ozTnZkWEpqWlZOMFlYSjBJRzkxZENCdlppQmliM1Z1WkhNbktWeHVJQ0JoYzNObGNuUW9aVzVrSUQ0OUlEQWdKaVlnWlc1a0lEdzlJSE52ZFhKalpTNXNaVzVuZEdnc0lDZHpiM1Z5WTJWRmJtUWdiM1YwSUc5bUlHSnZkVzVrY3ljcFhHNWNiaUFnTHk4Z1FYSmxJSGRsSUc5dllqOWNiaUFnYVdZZ0tHVnVaQ0ErSUhSb2FYTXViR1Z1WjNSb0tWeHVJQ0FnSUdWdVpDQTlJSFJvYVhNdWJHVnVaM1JvWEc0Z0lHbG1JQ2gwWVhKblpYUXViR1Z1WjNSb0lDMGdkR0Z5WjJWMFgzTjBZWEowSUR3Z1pXNWtJQzBnYzNSaGNuUXBYRzRnSUNBZ1pXNWtJRDBnZEdGeVoyVjBMbXhsYm1kMGFDQXRJSFJoY21kbGRGOXpkR0Z5ZENBcklITjBZWEowWEc1Y2JpQWdkbUZ5SUd4bGJpQTlJR1Z1WkNBdElITjBZWEowWEc1Y2JpQWdhV1lnS0d4bGJpQThJREV3TUNCOGZDQWhRblZtWm1WeUxsOTFjMlZVZVhCbFpFRnljbUY1Y3lrZ2UxeHVJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2JHVnVPeUJwS3lzcFhHNGdJQ0FnSUNCMFlYSm5aWFJiYVNBcklIUmhjbWRsZEY5emRHRnlkRjBnUFNCMGFHbHpXMmtnS3lCemRHRnlkRjFjYmlBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0IwWVhKblpYUXVYM05sZENoMGFHbHpMbk4xWW1GeWNtRjVLSE4wWVhKMExDQnpkR0Z5ZENBcklHeGxiaWtzSUhSaGNtZGxkRjl6ZEdGeWRDbGNiaUFnZlZ4dWZWeHVYRzVtZFc1amRHbHZiaUJmWW1GelpUWTBVMnhwWTJVZ0tHSjFaaXdnYzNSaGNuUXNJR1Z1WkNrZ2UxeHVJQ0JwWmlBb2MzUmhjblFnUFQwOUlEQWdKaVlnWlc1a0lEMDlQU0JpZFdZdWJHVnVaM1JvS1NCN1hHNGdJQ0FnY21WMGRYSnVJR0poYzJVMk5DNW1jbTl0UW5sMFpVRnljbUY1S0dKMVppbGNiaUFnZlNCbGJITmxJSHRjYmlBZ0lDQnlaWFIxY200Z1ltRnpaVFkwTG1aeWIyMUNlWFJsUVhKeVlYa29ZblZtTG5Oc2FXTmxLSE4wWVhKMExDQmxibVFwS1Z4dUlDQjlYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOTFkR1k0VTJ4cFkyVWdLR0oxWml3Z2MzUmhjblFzSUdWdVpDa2dlMXh1SUNCMllYSWdjbVZ6SUQwZ0p5ZGNiaUFnZG1GeUlIUnRjQ0E5SUNjblhHNGdJR1Z1WkNBOUlFMWhkR2d1YldsdUtHSjFaaTVzWlc1bmRHZ3NJR1Z1WkNsY2JseHVJQ0JtYjNJZ0tIWmhjaUJwSUQwZ2MzUmhjblE3SUdrZ1BDQmxibVE3SUdrckt5a2dlMXh1SUNBZ0lHbG1JQ2hpZFdaYmFWMGdQRDBnTUhnM1Jpa2dlMXh1SUNBZ0lDQWdjbVZ6SUNzOUlHUmxZMjlrWlZWMFpqaERhR0Z5S0hSdGNDa2dLeUJUZEhKcGJtY3Vabkp2YlVOb1lYSkRiMlJsS0dKMVpsdHBYU2xjYmlBZ0lDQWdJSFJ0Y0NBOUlDY25YRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUhSdGNDQXJQU0FuSlNjZ0t5QmlkV1piYVYwdWRHOVRkSEpwYm1jb01UWXBYRzRnSUNBZ2ZWeHVJQ0I5WEc1Y2JpQWdjbVYwZFhKdUlISmxjeUFySUdSbFkyOWtaVlYwWmpoRGFHRnlLSFJ0Y0NsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWDJGelkybHBVMnhwWTJVZ0tHSjFaaXdnYzNSaGNuUXNJR1Z1WkNrZ2UxeHVJQ0IyWVhJZ2NtVjBJRDBnSnlkY2JpQWdaVzVrSUQwZ1RXRjBhQzV0YVc0b1luVm1MbXhsYm1kMGFDd2daVzVrS1Z4dVhHNGdJR1p2Y2lBb2RtRnlJR2tnUFNCemRHRnlkRHNnYVNBOElHVnVaRHNnYVNzcktWeHVJQ0FnSUhKbGRDQXJQU0JUZEhKcGJtY3Vabkp2YlVOb1lYSkRiMlJsS0dKMVpsdHBYU2xjYmlBZ2NtVjBkWEp1SUhKbGRGeHVmVnh1WEc1bWRXNWpkR2x2YmlCZlltbHVZWEo1VTJ4cFkyVWdLR0oxWml3Z2MzUmhjblFzSUdWdVpDa2dlMXh1SUNCeVpYUjFjbTRnWDJGelkybHBVMnhwWTJVb1luVm1MQ0J6ZEdGeWRDd2daVzVrS1Z4dWZWeHVYRzVtZFc1amRHbHZiaUJmYUdWNFUyeHBZMlVnS0dKMVppd2djM1JoY25Rc0lHVnVaQ2tnZTF4dUlDQjJZWElnYkdWdUlEMGdZblZtTG14bGJtZDBhRnh1WEc0Z0lHbG1JQ2doYzNSaGNuUWdmSHdnYzNSaGNuUWdQQ0F3S1NCemRHRnlkQ0E5SURCY2JpQWdhV1lnS0NGbGJtUWdmSHdnWlc1a0lEd2dNQ0I4ZkNCbGJtUWdQaUJzWlc0cElHVnVaQ0E5SUd4bGJseHVYRzRnSUhaaGNpQnZkWFFnUFNBbkoxeHVJQ0JtYjNJZ0tIWmhjaUJwSUQwZ2MzUmhjblE3SUdrZ1BDQmxibVE3SUdrckt5a2dlMXh1SUNBZ0lHOTFkQ0FyUFNCMGIwaGxlQ2hpZFdaYmFWMHBYRzRnSUgxY2JpQWdjbVYwZFhKdUlHOTFkRnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZkWFJtTVRac1pWTnNhV05sSUNoaWRXWXNJSE4wWVhKMExDQmxibVFwSUh0Y2JpQWdkbUZ5SUdKNWRHVnpJRDBnWW5WbUxuTnNhV05sS0hOMFlYSjBMQ0JsYm1RcFhHNGdJSFpoY2lCeVpYTWdQU0FuSjF4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJR0o1ZEdWekxteGxibWQwYURzZ2FTQXJQU0F5S1NCN1hHNGdJQ0FnY21WeklDczlJRk4wY21sdVp5NW1jbTl0UTJoaGNrTnZaR1VvWW5sMFpYTmJhVjBnS3lCaWVYUmxjMXRwS3pGZElDb2dNalUyS1Z4dUlDQjlYRzRnSUhKbGRIVnliaUJ5WlhOY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzV6YkdsalpTQTlJR1oxYm1OMGFXOXVJQ2h6ZEdGeWRDd2daVzVrS1NCN1hHNGdJSFpoY2lCc1pXNGdQU0IwYUdsekxteGxibWQwYUZ4dUlDQnpkR0Z5ZENBOUlHTnNZVzF3S0hOMFlYSjBMQ0JzWlc0c0lEQXBYRzRnSUdWdVpDQTlJR05zWVcxd0tHVnVaQ3dnYkdWdUxDQnNaVzRwWEc1Y2JpQWdhV1lnS0VKMVptWmxjaTVmZFhObFZIbHdaV1JCY25KaGVYTXBJSHRjYmlBZ0lDQnlaWFIxY200Z1FuVm1abVZ5TGw5aGRXZHRaVzUwS0hSb2FYTXVjM1ZpWVhKeVlYa29jM1JoY25Rc0lHVnVaQ2twWEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnZG1GeUlITnNhV05sVEdWdUlEMGdaVzVrSUMwZ2MzUmhjblJjYmlBZ0lDQjJZWElnYm1WM1FuVm1JRDBnYm1WM0lFSjFabVpsY2loemJHbGpaVXhsYml3Z2RXNWtaV1pwYm1Wa0xDQjBjblZsS1Z4dUlDQWdJR1p2Y2lBb2RtRnlJR2tnUFNBd095QnBJRHdnYzJ4cFkyVk1aVzQ3SUdrckt5a2dlMXh1SUNBZ0lDQWdibVYzUW5WbVcybGRJRDBnZEdocGMxdHBJQ3NnYzNSaGNuUmRYRzRnSUNBZ2ZWeHVJQ0FnSUhKbGRIVnliaUJ1WlhkQ2RXWmNiaUFnZlZ4dWZWeHVYRzR2THlCZ1oyVjBZQ0IzYVd4c0lHSmxJSEpsYlc5MlpXUWdhVzRnVG05a1pTQXdMakV6SzF4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1blpYUWdQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBLU0I3WEc0Z0lHTnZibk52YkdVdWJHOW5LQ2N1WjJWMEtDa2dhWE1nWkdWd2NtVmpZWFJsWkM0Z1FXTmpaWE56SUhWemFXNW5JR0Z5Y21GNUlHbHVaR1Y0WlhNZ2FXNXpkR1ZoWkM0bktWeHVJQ0J5WlhSMWNtNGdkR2hwY3k1eVpXRmtWVWx1ZERnb2IyWm1jMlYwS1Z4dWZWeHVYRzR2THlCZ2MyVjBZQ0IzYVd4c0lHSmxJSEpsYlc5MlpXUWdhVzRnVG05a1pTQXdMakV6SzF4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1elpYUWdQU0JtZFc1amRHbHZiaUFvZGl3Z2IyWm1jMlYwS1NCN1hHNGdJR052Ym5OdmJHVXViRzluS0NjdWMyVjBLQ2tnYVhNZ1pHVndjbVZqWVhSbFpDNGdRV05qWlhOeklIVnphVzVuSUdGeWNtRjVJR2x1WkdWNFpYTWdhVzV6ZEdWaFpDNG5LVnh1SUNCeVpYUjFjbTRnZEdocGN5NTNjbWwwWlZWSmJuUTRLSFlzSUc5bVpuTmxkQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXlaV0ZrVlVsdWREZ2dQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlHOW1abk5sZENBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2IyWm1jMlYwSnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElEd2dkR2hwY3k1c1pXNW5kR2dzSUNkVWNubHBibWNnZEc4Z2NtVmhaQ0JpWlhsdmJtUWdZblZtWm1WeUlHeGxibWQwYUNjcFhHNGdJSDFjYmx4dUlDQnBaaUFvYjJabWMyVjBJRDQ5SUhSb2FYTXViR1Z1WjNSb0tWeHVJQ0FnSUhKbGRIVnlibHh1WEc0Z0lISmxkSFZ5YmlCMGFHbHpXMjltWm5ObGRGMWNibjFjYmx4dVpuVnVZM1JwYjI0Z1gzSmxZV1JWU1c1ME1UWWdLR0oxWml3Z2IyWm1jMlYwTENCc2FYUjBiR1ZGYm1ScFlXNHNJRzV2UVhOelpYSjBLU0I3WEc0Z0lHbG1JQ2doYm05QmMzTmxjblFwSUh0Y2JpQWdJQ0JoYzNObGNuUW9kSGx3Wlc5bUlHeHBkSFJzWlVWdVpHbGhiaUE5UFQwZ0oySnZiMnhsWVc0bkxDQW5iV2x6YzJsdVp5QnZjaUJwYm5aaGJHbGtJR1Z1WkdsaGJpY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JRzltWm5ObGRDQWhQVDBnYm5Wc2JDd2dKMjFwYzNOcGJtY2diMlptYzJWMEp5bGNiaUFnSUNCaGMzTmxjblFvYjJabWMyVjBJQ3NnTVNBOElHSjFaaTVzWlc1bmRHZ3NJQ2RVY25scGJtY2dkRzhnY21WaFpDQmlaWGx2Ym1RZ1luVm1abVZ5SUd4bGJtZDBhQ2NwWEc0Z0lIMWNibHh1SUNCMllYSWdiR1Z1SUQwZ1luVm1MbXhsYm1kMGFGeHVJQ0JwWmlBb2IyWm1jMlYwSUQ0OUlHeGxiaWxjYmlBZ0lDQnlaWFIxY201Y2JseHVJQ0IyWVhJZ2RtRnNYRzRnSUdsbUlDaHNhWFIwYkdWRmJtUnBZVzRwSUh0Y2JpQWdJQ0IyWVd3Z1BTQmlkV1piYjJabWMyVjBYVnh1SUNBZ0lHbG1JQ2h2Wm1aelpYUWdLeUF4SUR3Z2JHVnVLVnh1SUNBZ0lDQWdkbUZzSUh3OUlHSjFabHR2Wm1aelpYUWdLeUF4WFNBOFBDQTRYRzRnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdkbUZzSUQwZ1luVm1XMjltWm5ObGRGMGdQRHdnT0Z4dUlDQWdJR2xtSUNodlptWnpaWFFnS3lBeElEd2diR1Z1S1Z4dUlDQWdJQ0FnZG1Gc0lIdzlJR0oxWmx0dlptWnpaWFFnS3lBeFhWeHVJQ0I5WEc0Z0lISmxkSFZ5YmlCMllXeGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1eVpXRmtWVWx1ZERFMlRFVWdQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnlaWFIxY200Z1gzSmxZV1JWU1c1ME1UWW9kR2hwY3l3Z2IyWm1jMlYwTENCMGNuVmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXlaV0ZrVlVsdWRERTJRa1VnUFNCbWRXNWpkR2x2YmlBb2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0J5WlhSMWNtNGdYM0psWVdSVlNXNTBNVFlvZEdocGN5d2diMlptYzJWMExDQm1ZV3h6WlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYm1aMWJtTjBhVzl1SUY5eVpXRmtWVWx1ZERNeUlDaGlkV1lzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDa2dlMXh1SUNCcFppQW9JVzV2UVhOelpYSjBLU0I3WEc0Z0lDQWdZWE56WlhKMEtIUjVjR1Z2WmlCc2FYUjBiR1ZGYm1ScFlXNGdQVDA5SUNkaWIyOXNaV0Z1Snl3Z0oyMXBjM05wYm1jZ2IzSWdhVzUyWVd4cFpDQmxibVJwWVc0bktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQnZabVp6WlhRZ0lUMDlJRzUxYkd3c0lDZHRhWE56YVc1bklHOW1abk5sZENjcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQXJJRE1nUENCaWRXWXViR1Z1WjNSb0xDQW5WSEo1YVc1bklIUnZJSEpsWVdRZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNCOVhHNWNiaUFnZG1GeUlHeGxiaUE5SUdKMVppNXNaVzVuZEdoY2JpQWdhV1lnS0c5bVpuTmxkQ0ErUFNCc1pXNHBYRzRnSUNBZ2NtVjBkWEp1WEc1Y2JpQWdkbUZ5SUhaaGJGeHVJQ0JwWmlBb2JHbDBkR3hsUlc1a2FXRnVLU0I3WEc0Z0lDQWdhV1lnS0c5bVpuTmxkQ0FySURJZ1BDQnNaVzRwWEc0Z0lDQWdJQ0IyWVd3Z1BTQmlkV1piYjJabWMyVjBJQ3NnTWwwZ1BEd2dNVFpjYmlBZ0lDQnBaaUFvYjJabWMyVjBJQ3NnTVNBOElHeGxiaWxjYmlBZ0lDQWdJSFpoYkNCOFBTQmlkV1piYjJabWMyVjBJQ3NnTVYwZ1BEd2dPRnh1SUNBZ0lIWmhiQ0I4UFNCaWRXWmJiMlptYzJWMFhWeHVJQ0FnSUdsbUlDaHZabVp6WlhRZ0t5QXpJRHdnYkdWdUtWeHVJQ0FnSUNBZ2RtRnNJRDBnZG1Gc0lDc2dLR0oxWmx0dlptWnpaWFFnS3lBelhTQThQQ0F5TkNBK1BqNGdNQ2xjYmlBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0JwWmlBb2IyWm1jMlYwSUNzZ01TQThJR3hsYmlsY2JpQWdJQ0FnSUhaaGJDQTlJR0oxWmx0dlptWnpaWFFnS3lBeFhTQThQQ0F4Tmx4dUlDQWdJR2xtSUNodlptWnpaWFFnS3lBeUlEd2diR1Z1S1Z4dUlDQWdJQ0FnZG1Gc0lIdzlJR0oxWmx0dlptWnpaWFFnS3lBeVhTQThQQ0E0WEc0Z0lDQWdhV1lnS0c5bVpuTmxkQ0FySURNZ1BDQnNaVzRwWEc0Z0lDQWdJQ0IyWVd3Z2ZEMGdZblZtVzI5bVpuTmxkQ0FySUROZFhHNGdJQ0FnZG1Gc0lEMGdkbUZzSUNzZ0tHSjFabHR2Wm1aelpYUmRJRHc4SURJMElENCtQaUF3S1Z4dUlDQjlYRzRnSUhKbGRIVnliaUIyWVd4Y2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzV5WldGa1ZVbHVkRE15VEVVZ1BTQm1kVzVqZEdsdmJpQW9iMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCeVpYUjFjbTRnWDNKbFlXUlZTVzUwTXpJb2RHaHBjeXdnYjJabWMyVjBMQ0IwY25WbExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1eVpXRmtWVWx1ZERNeVFrVWdQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnlaWFIxY200Z1gzSmxZV1JWU1c1ME16SW9kR2hwY3l3Z2IyWm1jMlYwTENCbVlXeHpaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVjbVZoWkVsdWREZ2dQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlHOW1abk5sZENBaFBUMGdiblZzYkN4Y2JpQWdJQ0FnSUNBZ0oyMXBjM05wYm1jZ2IyWm1jMlYwSnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElEd2dkR2hwY3k1c1pXNW5kR2dzSUNkVWNubHBibWNnZEc4Z2NtVmhaQ0JpWlhsdmJtUWdZblZtWm1WeUlHeGxibWQwYUNjcFhHNGdJSDFjYmx4dUlDQnBaaUFvYjJabWMyVjBJRDQ5SUhSb2FYTXViR1Z1WjNSb0tWeHVJQ0FnSUhKbGRIVnlibHh1WEc0Z0lIWmhjaUJ1WldjZ1BTQjBhR2x6VzI5bVpuTmxkRjBnSmlBd2VEZ3dYRzRnSUdsbUlDaHVaV2NwWEc0Z0lDQWdjbVYwZFhKdUlDZ3dlR1ptSUMwZ2RHaHBjMXR2Wm1aelpYUmRJQ3NnTVNrZ0tpQXRNVnh1SUNCbGJITmxYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTmJiMlptYzJWMFhWeHVmVnh1WEc1bWRXNWpkR2x2YmlCZmNtVmhaRWx1ZERFMklDaGlkV1lzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDa2dlMXh1SUNCcFppQW9JVzV2UVhOelpYSjBLU0I3WEc0Z0lDQWdZWE56WlhKMEtIUjVjR1Z2WmlCc2FYUjBiR1ZGYm1ScFlXNGdQVDA5SUNkaWIyOXNaV0Z1Snl3Z0oyMXBjM05wYm1jZ2IzSWdhVzUyWVd4cFpDQmxibVJwWVc0bktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQnZabVp6WlhRZ0lUMDlJRzUxYkd3c0lDZHRhWE56YVc1bklHOW1abk5sZENjcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQXJJREVnUENCaWRXWXViR1Z1WjNSb0xDQW5WSEo1YVc1bklIUnZJSEpsWVdRZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNCOVhHNWNiaUFnZG1GeUlHeGxiaUE5SUdKMVppNXNaVzVuZEdoY2JpQWdhV1lnS0c5bVpuTmxkQ0ErUFNCc1pXNHBYRzRnSUNBZ2NtVjBkWEp1WEc1Y2JpQWdkbUZ5SUhaaGJDQTlJRjl5WldGa1ZVbHVkREUyS0dKMVppd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSUhSeWRXVXBYRzRnSUhaaGNpQnVaV2NnUFNCMllXd2dKaUF3ZURnd01EQmNiaUFnYVdZZ0tHNWxaeWxjYmlBZ0lDQnlaWFIxY200Z0tEQjRabVptWmlBdElIWmhiQ0FySURFcElDb2dMVEZjYmlBZ1pXeHpaVnh1SUNBZ0lISmxkSFZ5YmlCMllXeGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1eVpXRmtTVzUwTVRaTVJTQTlJR1oxYm1OMGFXOXVJQ2h2Wm1aelpYUXNJRzV2UVhOelpYSjBLU0I3WEc0Z0lISmxkSFZ5YmlCZmNtVmhaRWx1ZERFMktIUm9hWE1zSUc5bVpuTmxkQ3dnZEhKMVpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdWNtVmhaRWx1ZERFMlFrVWdQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnlaWFIxY200Z1gzSmxZV1JKYm5ReE5paDBhR2x6TENCdlptWnpaWFFzSUdaaGJITmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVablZ1WTNScGIyNGdYM0psWVdSSmJuUXpNaUFvWW5WbUxDQnZabVp6WlhRc0lHeHBkSFJzWlVWdVpHbGhiaXdnYm05QmMzTmxjblFwSUh0Y2JpQWdhV1lnS0NGdWIwRnpjMlZ5ZENrZ2UxeHVJQ0FnSUdGemMyVnlkQ2gwZVhCbGIyWWdiR2wwZEd4bFJXNWthV0Z1SUQwOVBTQW5ZbTl2YkdWaGJpY3NJQ2R0YVhOemFXNW5JRzl5SUdsdWRtRnNhV1FnWlc1a2FXRnVKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnYjJabWMyVjBJQ0U5UFNCdWRXeHNMQ0FuYldsemMybHVaeUJ2Wm1aelpYUW5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnS3lBeklEd2dZblZtTG14bGJtZDBhQ3dnSjFSeWVXbHVaeUIwYnlCeVpXRmtJR0psZVc5dVpDQmlkV1ptWlhJZ2JHVnVaM1JvSnlsY2JpQWdmVnh1WEc0Z0lIWmhjaUJzWlc0Z1BTQmlkV1l1YkdWdVozUm9YRzRnSUdsbUlDaHZabVp6WlhRZ1BqMGdiR1Z1S1Z4dUlDQWdJSEpsZEhWeWJseHVYRzRnSUhaaGNpQjJZV3dnUFNCZmNtVmhaRlZKYm5Rek1paGlkV1lzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQjBjblZsS1Z4dUlDQjJZWElnYm1WbklEMGdkbUZzSUNZZ01IZzRNREF3TURBd01GeHVJQ0JwWmlBb2JtVm5LVnh1SUNBZ0lISmxkSFZ5YmlBb01IaG1abVptWm1abVppQXRJSFpoYkNBcklERXBJQ29nTFRGY2JpQWdaV3h6WlZ4dUlDQWdJSEpsZEhWeWJpQjJZV3hjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXlaV0ZrU1c1ME16Sk1SU0E5SUdaMWJtTjBhVzl1SUNodlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJSEpsZEhWeWJpQmZjbVZoWkVsdWRETXlLSFJvYVhNc0lHOW1abk5sZEN3Z2RISjFaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVjbVZoWkVsdWRETXlRa1VnUFNCbWRXNWpkR2x2YmlBb2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0J5WlhSMWNtNGdYM0psWVdSSmJuUXpNaWgwYUdsekxDQnZabVp6WlhRc0lHWmhiSE5sTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWDNKbFlXUkdiRzloZENBb1luVm1MQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENoMGVYQmxiMllnYkdsMGRHeGxSVzVrYVdGdUlEMDlQU0FuWW05dmJHVmhiaWNzSUNkdGFYTnphVzVuSUc5eUlHbHVkbUZzYVdRZ1pXNWthV0Z1SnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDc2dNeUE4SUdKMVppNXNaVzVuZEdnc0lDZFVjbmxwYm1jZ2RHOGdjbVZoWkNCaVpYbHZibVFnWW5WbVptVnlJR3hsYm1kMGFDY3BYRzRnSUgxY2JseHVJQ0J5WlhSMWNtNGdhV1ZsWlRjMU5DNXlaV0ZrS0dKMVppd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSURJekxDQTBLVnh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuSmxZV1JHYkc5aGRFeEZJRDBnWm5WdVkzUnBiMjRnS0c5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdjbVYwZFhKdUlGOXlaV0ZrUm14dllYUW9kR2hwY3l3Z2IyWm1jMlYwTENCMGNuVmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXlaV0ZrUm14dllYUkNSU0E5SUdaMWJtTjBhVzl1SUNodlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJSEpsZEhWeWJpQmZjbVZoWkVac2IyRjBLSFJvYVhNc0lHOW1abk5sZEN3Z1ptRnNjMlVzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVtZFc1amRHbHZiaUJmY21WaFpFUnZkV0pzWlNBb1luVm1MQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENoMGVYQmxiMllnYkdsMGRHeGxSVzVrYVdGdUlEMDlQU0FuWW05dmJHVmhiaWNzSUNkdGFYTnphVzVuSUc5eUlHbHVkbUZzYVdRZ1pXNWthV0Z1SnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDc2dOeUE4SUdKMVppNXNaVzVuZEdnc0lDZFVjbmxwYm1jZ2RHOGdjbVZoWkNCaVpYbHZibVFnWW5WbVptVnlJR3hsYm1kMGFDY3BYRzRnSUgxY2JseHVJQ0J5WlhSMWNtNGdhV1ZsWlRjMU5DNXlaV0ZrS0dKMVppd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSURVeUxDQTRLVnh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuSmxZV1JFYjNWaWJHVk1SU0E5SUdaMWJtTjBhVzl1SUNodlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJSEpsZEhWeWJpQmZjbVZoWkVSdmRXSnNaU2gwYUdsekxDQnZabVp6WlhRc0lIUnlkV1VzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbkpsWVdSRWIzVmliR1ZDUlNBOUlHWjFibU4wYVc5dUlDaHZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUhKbGRIVnliaUJmY21WaFpFUnZkV0pzWlNoMGFHbHpMQ0J2Wm1aelpYUXNJR1poYkhObExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1M2NtbDBaVlZKYm5RNElEMGdablZ1WTNScGIyNGdLSFpoYkhWbExDQnZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUdsbUlDZ2hibTlCYzNObGNuUXBJSHRjYmlBZ0lDQmhjM05sY25Rb2RtRnNkV1VnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUIyWVd4MVpTQWhQVDBnYm5Wc2JDd2dKMjFwYzNOcGJtY2dkbUZzZFdVbktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQnZabVp6WlhRZ0lUMDlJRzUxYkd3c0lDZHRhWE56YVc1bklHOW1abk5sZENjcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQThJSFJvYVhNdWJHVnVaM1JvTENBbmRISjVhVzVuSUhSdklIZHlhWFJsSUdKbGVXOXVaQ0JpZFdabVpYSWdiR1Z1WjNSb0p5bGNiaUFnSUNCMlpYSnBablZwYm5Rb2RtRnNkV1VzSURCNFptWXBYRzRnSUgxY2JseHVJQ0JwWmlBb2IyWm1jMlYwSUQ0OUlIUm9hWE11YkdWdVozUm9LU0J5WlhSMWNtNWNibHh1SUNCMGFHbHpXMjltWm5ObGRGMGdQU0IyWVd4MVpWeHVmVnh1WEc1bWRXNWpkR2x2YmlCZmQzSnBkR1ZWU1c1ME1UWWdLR0oxWml3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDa2dlMXh1SUNCcFppQW9JVzV2UVhOelpYSjBLU0I3WEc0Z0lDQWdZWE56WlhKMEtIWmhiSFZsSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnZG1Gc2RXVWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JSFpoYkhWbEp5bGNiaUFnSUNCaGMzTmxjblFvZEhsd1pXOW1JR3hwZEhSc1pVVnVaR2xoYmlBOVBUMGdKMkp2YjJ4bFlXNG5MQ0FuYldsemMybHVaeUJ2Y2lCcGJuWmhiR2xrSUdWdVpHbGhiaWNwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUc5bVpuTmxkQ0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnYjJabWMyVjBKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNzZ01TQThJR0oxWmk1c1pXNW5kR2dzSUNkMGNubHBibWNnZEc4Z2QzSnBkR1VnWW1WNWIyNWtJR0oxWm1abGNpQnNaVzVuZEdnbktWeHVJQ0FnSUhabGNtbG1kV2x1ZENoMllXeDFaU3dnTUhobVptWm1LVnh1SUNCOVhHNWNiaUFnZG1GeUlHeGxiaUE5SUdKMVppNXNaVzVuZEdoY2JpQWdhV1lnS0c5bVpuTmxkQ0ErUFNCc1pXNHBYRzRnSUNBZ2NtVjBkWEp1WEc1Y2JpQWdabTl5SUNoMllYSWdhU0E5SURBc0lHb2dQU0JOWVhSb0xtMXBiaWhzWlc0Z0xTQnZabVp6WlhRc0lESXBPeUJwSUR3Z2Fqc2dhU3NyS1NCN1hHNGdJQ0FnWW5WbVcyOW1abk5sZENBcklHbGRJRDFjYmlBZ0lDQWdJQ0FnS0haaGJIVmxJQ1lnS0RCNFptWWdQRHdnS0RnZ0tpQW9iR2wwZEd4bFJXNWthV0Z1SUQ4Z2FTQTZJREVnTFNCcEtTa3BLU0ErUGo1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ2hzYVhSMGJHVkZibVJwWVc0Z1B5QnBJRG9nTVNBdElHa3BJQ29nT0Z4dUlDQjlYRzU5WEc1Y2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdWQzSnBkR1ZWU1c1ME1UWk1SU0E5SUdaMWJtTjBhVzl1SUNoMllXeDFaU3dnYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQmZkM0pwZEdWVlNXNTBNVFlvZEdocGN5d2dkbUZzZFdVc0lHOW1abk5sZEN3Z2RISjFaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkM0pwZEdWVlNXNTBNVFpDUlNBOUlHWjFibU4wYVc5dUlDaDJZV3gxWlN3Z2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JmZDNKcGRHVlZTVzUwTVRZb2RHaHBjeXdnZG1Gc2RXVXNJRzltWm5ObGRDd2dabUZzYzJVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1bWRXNWpkR2x2YmlCZmQzSnBkR1ZWU1c1ME16SWdLR0oxWml3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDa2dlMXh1SUNCcFppQW9JVzV2UVhOelpYSjBLU0I3WEc0Z0lDQWdZWE56WlhKMEtIWmhiSFZsSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnZG1Gc2RXVWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JSFpoYkhWbEp5bGNiaUFnSUNCaGMzTmxjblFvZEhsd1pXOW1JR3hwZEhSc1pVVnVaR2xoYmlBOVBUMGdKMkp2YjJ4bFlXNG5MQ0FuYldsemMybHVaeUJ2Y2lCcGJuWmhiR2xrSUdWdVpHbGhiaWNwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUc5bVpuTmxkQ0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnYjJabWMyVjBKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNzZ015QThJR0oxWmk1c1pXNW5kR2dzSUNkMGNubHBibWNnZEc4Z2QzSnBkR1VnWW1WNWIyNWtJR0oxWm1abGNpQnNaVzVuZEdnbktWeHVJQ0FnSUhabGNtbG1kV2x1ZENoMllXeDFaU3dnTUhobVptWm1abVptWmlsY2JpQWdmVnh1WEc0Z0lIWmhjaUJzWlc0Z1BTQmlkV1l1YkdWdVozUm9YRzRnSUdsbUlDaHZabVp6WlhRZ1BqMGdiR1Z1S1Z4dUlDQWdJSEpsZEhWeWJseHVYRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQXdMQ0JxSUQwZ1RXRjBhQzV0YVc0b2JHVnVJQzBnYjJabWMyVjBMQ0EwS1RzZ2FTQThJR283SUdrckt5a2dlMXh1SUNBZ0lHSjFabHR2Wm1aelpYUWdLeUJwWFNBOVhHNGdJQ0FnSUNBZ0lDaDJZV3gxWlNBK1BqNGdLR3hwZEhSc1pVVnVaR2xoYmlBL0lHa2dPaUF6SUMwZ2FTa2dLaUE0S1NBbUlEQjRabVpjYmlBZ2ZWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5keWFYUmxWVWx1ZERNeVRFVWdQU0JtZFc1amRHbHZiaUFvZG1Gc2RXVXNJRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ1gzZHlhWFJsVlVsdWRETXlLSFJvYVhNc0lIWmhiSFZsTENCdlptWnpaWFFzSUhSeWRXVXNJRzV2UVhOelpYSjBLVnh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuZHlhWFJsVlVsdWRETXlRa1VnUFNCbWRXNWpkR2x2YmlBb2RtRnNkV1VzSUc5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdYM2R5YVhSbFZVbHVkRE15S0hSb2FYTXNJSFpoYkhWbExDQnZabVp6WlhRc0lHWmhiSE5sTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzUzY21sMFpVbHVkRGdnUFNCbWRXNWpkR2x2YmlBb2RtRnNkV1VzSUc5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdhV1lnS0NGdWIwRnpjMlZ5ZENrZ2UxeHVJQ0FnSUdGemMyVnlkQ2gyWVd4MVpTQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlIWmhiSFZsSUNFOVBTQnVkV3hzTENBbmJXbHpjMmx1WnlCMllXeDFaU2NwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUc5bVpuTmxkQ0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnYjJabWMyVjBKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUR3Z2RHaHBjeTVzWlc1bmRHZ3NJQ2RVY25scGJtY2dkRzhnZDNKcGRHVWdZbVY1YjI1a0lHSjFabVpsY2lCc1pXNW5kR2duS1Z4dUlDQWdJSFpsY21sbWMybHVkQ2gyWVd4MVpTd2dNSGczWml3Z0xUQjRPREFwWEc0Z0lIMWNibHh1SUNCcFppQW9iMlptYzJWMElENDlJSFJvYVhNdWJHVnVaM1JvS1Z4dUlDQWdJSEpsZEhWeWJseHVYRzRnSUdsbUlDaDJZV3gxWlNBK1BTQXdLVnh1SUNBZ0lIUm9hWE11ZDNKcGRHVlZTVzUwT0NoMllXeDFaU3dnYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2xjYmlBZ1pXeHpaVnh1SUNBZ0lIUm9hWE11ZDNKcGRHVlZTVzUwT0Nnd2VHWm1JQ3NnZG1Gc2RXVWdLeUF4TENCdlptWnpaWFFzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVtZFc1amRHbHZiaUJmZDNKcGRHVkpiblF4TmlBb1luVm1MQ0IyWVd4MVpTd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSUc1dlFYTnpaWEowS1NCN1hHNGdJR2xtSUNnaGJtOUJjM05sY25RcElIdGNiaUFnSUNCaGMzTmxjblFvZG1Gc2RXVWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQjJZV3gxWlNBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2RtRnNkV1VuS1Z4dUlDQWdJR0Z6YzJWeWRDaDBlWEJsYjJZZ2JHbDBkR3hsUlc1a2FXRnVJRDA5UFNBblltOXZiR1ZoYmljc0lDZHRhWE56YVc1bklHOXlJR2x1ZG1Gc2FXUWdaVzVrYVdGdUp5bGNiaUFnSUNCaGMzTmxjblFvYjJabWMyVjBJQ0U5UFNCMWJtUmxabWx1WldRZ0ppWWdiMlptYzJWMElDRTlQU0J1ZFd4c0xDQW5iV2x6YzJsdVp5QnZabVp6WlhRbktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdLeUF4SUR3Z1luVm1MbXhsYm1kMGFDd2dKMVJ5ZVdsdVp5QjBieUIzY21sMFpTQmlaWGx2Ym1RZ1luVm1abVZ5SUd4bGJtZDBhQ2NwWEc0Z0lDQWdkbVZ5YVdaemFXNTBLSFpoYkhWbExDQXdlRGRtWm1Zc0lDMHdlRGd3TURBcFhHNGdJSDFjYmx4dUlDQjJZWElnYkdWdUlEMGdZblZtTG14bGJtZDBhRnh1SUNCcFppQW9iMlptYzJWMElENDlJR3hsYmlsY2JpQWdJQ0J5WlhSMWNtNWNibHh1SUNCcFppQW9kbUZzZFdVZ1BqMGdNQ2xjYmlBZ0lDQmZkM0pwZEdWVlNXNTBNVFlvWW5WbUxDQjJZV3gxWlN3Z2IyWm1jMlYwTENCc2FYUjBiR1ZGYm1ScFlXNHNJRzV2UVhOelpYSjBLVnh1SUNCbGJITmxYRzRnSUNBZ1gzZHlhWFJsVlVsdWRERTJLR0oxWml3Z01IaG1abVptSUNzZ2RtRnNkV1VnS3lBeExDQnZabVp6WlhRc0lHeHBkSFJzWlVWdVpHbGhiaXdnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkM0pwZEdWSmJuUXhOa3hGSUQwZ1puVnVZM1JwYjI0Z0tIWmhiSFZsTENCdlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJRjkzY21sMFpVbHVkREUyS0hSb2FYTXNJSFpoYkhWbExDQnZabVp6WlhRc0lIUnlkV1VzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbmR5YVhSbFNXNTBNVFpDUlNBOUlHWjFibU4wYVc5dUlDaDJZV3gxWlN3Z2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JmZDNKcGRHVkpiblF4TmloMGFHbHpMQ0IyWVd4MVpTd2diMlptYzJWMExDQm1ZV3h6WlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYm1aMWJtTjBhVzl1SUY5M2NtbDBaVWx1ZERNeUlDaGlkV1lzSUhaaGJIVmxMQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENoMllXeDFaU0FoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JSFpoYkhWbElDRTlQU0J1ZFd4c0xDQW5iV2x6YzJsdVp5QjJZV3gxWlNjcFhHNGdJQ0FnWVhOelpYSjBLSFI1Y0dWdlppQnNhWFIwYkdWRmJtUnBZVzRnUFQwOUlDZGliMjlzWldGdUp5d2dKMjFwYzNOcGJtY2diM0lnYVc1MllXeHBaQ0JsYm1ScFlXNG5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUJ2Wm1aelpYUWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JRzltWm5ObGRDY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FySURNZ1BDQmlkV1l1YkdWdVozUm9MQ0FuVkhKNWFXNW5JSFJ2SUhkeWFYUmxJR0psZVc5dVpDQmlkV1ptWlhJZ2JHVnVaM1JvSnlsY2JpQWdJQ0IyWlhKcFpuTnBiblFvZG1Gc2RXVXNJREI0TjJabVptWm1abVlzSUMwd2VEZ3dNREF3TURBd0tWeHVJQ0I5WEc1Y2JpQWdkbUZ5SUd4bGJpQTlJR0oxWmk1c1pXNW5kR2hjYmlBZ2FXWWdLRzltWm5ObGRDQStQU0JzWlc0cFhHNGdJQ0FnY21WMGRYSnVYRzVjYmlBZ2FXWWdLSFpoYkhWbElENDlJREFwWEc0Z0lDQWdYM2R5YVhSbFZVbHVkRE15S0dKMVppd2dkbUZzZFdVc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2xjYmlBZ1pXeHpaVnh1SUNBZ0lGOTNjbWwwWlZWSmJuUXpNaWhpZFdZc0lEQjRabVptWm1abVptWWdLeUIyWVd4MVpTQXJJREVzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1M2NtbDBaVWx1ZERNeVRFVWdQU0JtZFc1amRHbHZiaUFvZG1Gc2RXVXNJRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ1gzZHlhWFJsU1c1ME16SW9kR2hwY3l3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnZEhKMVpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdWQzSnBkR1ZKYm5Rek1rSkZJRDBnWm5WdVkzUnBiMjRnS0haaGJIVmxMQ0J2Wm1aelpYUXNJRzV2UVhOelpYSjBLU0I3WEc0Z0lGOTNjbWwwWlVsdWRETXlLSFJvYVhNc0lIWmhiSFZsTENCdlptWnpaWFFzSUdaaGJITmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVablZ1WTNScGIyNGdYM2R5YVhSbFJteHZZWFFnS0dKMVppd2dkbUZzZFdVc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLSFpoYkhWbElDRTlQU0IxYm1SbFptbHVaV1FnSmlZZ2RtRnNkV1VnSVQwOUlHNTFiR3dzSUNkdGFYTnphVzVuSUhaaGJIVmxKeWxjYmlBZ0lDQmhjM05sY25Rb2RIbHdaVzltSUd4cGRIUnNaVVZ1WkdsaGJpQTlQVDBnSjJKdmIyeGxZVzRuTENBbmJXbHpjMmx1WnlCdmNpQnBiblpoYkdsa0lHVnVaR2xoYmljcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlHOW1abk5sZENBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2IyWm1jMlYwSnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDc2dNeUE4SUdKMVppNXNaVzVuZEdnc0lDZFVjbmxwYm1jZ2RHOGdkM0pwZEdVZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNBZ0lIWmxjbWxtU1VWRlJUYzFOQ2gyWVd4MVpTd2dNeTQwTURJNE1qTTBOall6T0RVeU9EZzJaU3N6T0N3Z0xUTXVOREF5T0RJek5EWTJNemcxTWpnNE5tVXJNemdwWEc0Z0lIMWNibHh1SUNCMllYSWdiR1Z1SUQwZ1luVm1MbXhsYm1kMGFGeHVJQ0JwWmlBb2IyWm1jMlYwSUQ0OUlHeGxiaWxjYmlBZ0lDQnlaWFIxY201Y2JseHVJQ0JwWldWbE56VTBMbmR5YVhSbEtHSjFaaXdnZG1Gc2RXVXNJRzltWm5ObGRDd2diR2wwZEd4bFJXNWthV0Z1TENBeU15d2dOQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNTNjbWwwWlVac2IyRjBURVVnUFNCbWRXNWpkR2x2YmlBb2RtRnNkV1VzSUc5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdYM2R5YVhSbFJteHZZWFFvZEdocGN5d2dkbUZzZFdVc0lHOW1abk5sZEN3Z2RISjFaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkM0pwZEdWR2JHOWhkRUpGSUQwZ1puVnVZM1JwYjI0Z0tIWmhiSFZsTENCdlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJRjkzY21sMFpVWnNiMkYwS0hSb2FYTXNJSFpoYkhWbExDQnZabVp6WlhRc0lHWmhiSE5sTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWDNkeWFYUmxSRzkxWW14bElDaGlkV1lzSUhaaGJIVmxMQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENoMllXeDFaU0FoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JSFpoYkhWbElDRTlQU0J1ZFd4c0xDQW5iV2x6YzJsdVp5QjJZV3gxWlNjcFhHNGdJQ0FnWVhOelpYSjBLSFI1Y0dWdlppQnNhWFIwYkdWRmJtUnBZVzRnUFQwOUlDZGliMjlzWldGdUp5d2dKMjFwYzNOcGJtY2diM0lnYVc1MllXeHBaQ0JsYm1ScFlXNG5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUJ2Wm1aelpYUWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JRzltWm5ObGRDY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FySURjZ1BDQmlkV1l1YkdWdVozUm9MRnh1SUNBZ0lDQWdJQ0FuVkhKNWFXNW5JSFJ2SUhkeWFYUmxJR0psZVc5dVpDQmlkV1ptWlhJZ2JHVnVaM1JvSnlsY2JpQWdJQ0IyWlhKcFprbEZSVVUzTlRRb2RtRnNkV1VzSURFdU56azNOamt6TVRNME9EWXlNekUxTjBVck16QTRMQ0F0TVM0M09UYzJPVE14TXpRNE5qSXpNVFUzUlNzek1EZ3BYRzRnSUgxY2JseHVJQ0IyWVhJZ2JHVnVJRDBnWW5WbUxteGxibWQwYUZ4dUlDQnBaaUFvYjJabWMyVjBJRDQ5SUd4bGJpbGNiaUFnSUNCeVpYUjFjbTVjYmx4dUlDQnBaV1ZsTnpVMExuZHlhWFJsS0dKMVppd2dkbUZzZFdVc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0ExTWl3Z09DbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1M2NtbDBaVVJ2ZFdKc1pVeEZJRDBnWm5WdVkzUnBiMjRnS0haaGJIVmxMQ0J2Wm1aelpYUXNJRzV2UVhOelpYSjBLU0I3WEc0Z0lGOTNjbWwwWlVSdmRXSnNaU2gwYUdsekxDQjJZV3gxWlN3Z2IyWm1jMlYwTENCMGNuVmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNTNjbWwwWlVSdmRXSnNaVUpGSUQwZ1puVnVZM1JwYjI0Z0tIWmhiSFZsTENCdlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJRjkzY21sMFpVUnZkV0pzWlNoMGFHbHpMQ0IyWVd4MVpTd2diMlptYzJWMExDQm1ZV3h6WlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYmk4dklHWnBiR3dvZG1Gc2RXVXNJSE4wWVhKMFBUQXNJR1Z1WkQxaWRXWm1aWEl1YkdWdVozUm9LVnh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzVtYVd4c0lEMGdablZ1WTNScGIyNGdLSFpoYkhWbExDQnpkR0Z5ZEN3Z1pXNWtLU0I3WEc0Z0lHbG1JQ2doZG1Gc2RXVXBJSFpoYkhWbElEMGdNRnh1SUNCcFppQW9JWE4wWVhKMEtTQnpkR0Z5ZENBOUlEQmNiaUFnYVdZZ0tDRmxibVFwSUdWdVpDQTlJSFJvYVhNdWJHVnVaM1JvWEc1Y2JpQWdhV1lnS0hSNWNHVnZaaUIyWVd4MVpTQTlQVDBnSjNOMGNtbHVaeWNwSUh0Y2JpQWdJQ0IyWVd4MVpTQTlJSFpoYkhWbExtTm9ZWEpEYjJSbFFYUW9NQ2xjYmlBZ2ZWeHVYRzRnSUdGemMyVnlkQ2gwZVhCbGIyWWdkbUZzZFdVZ1BUMDlJQ2R1ZFcxaVpYSW5JQ1ltSUNGcGMwNWhUaWgyWVd4MVpTa3NJQ2QyWVd4MVpTQnBjeUJ1YjNRZ1lTQnVkVzFpWlhJbktWeHVJQ0JoYzNObGNuUW9aVzVrSUQ0OUlITjBZWEowTENBblpXNWtJRHdnYzNSaGNuUW5LVnh1WEc0Z0lDOHZJRVpwYkd3Z01DQmllWFJsY3pzZ2QyVW5jbVVnWkc5dVpWeHVJQ0JwWmlBb1pXNWtJRDA5UFNCemRHRnlkQ2tnY21WMGRYSnVYRzRnSUdsbUlDaDBhR2x6TG14bGJtZDBhQ0E5UFQwZ01Da2djbVYwZFhKdVhHNWNiaUFnWVhOelpYSjBLSE4wWVhKMElENDlJREFnSmlZZ2MzUmhjblFnUENCMGFHbHpMbXhsYm1kMGFDd2dKM04wWVhKMElHOTFkQ0J2WmlCaWIzVnVaSE1uS1Z4dUlDQmhjM05sY25Rb1pXNWtJRDQ5SURBZ0ppWWdaVzVrSUR3OUlIUm9hWE11YkdWdVozUm9MQ0FuWlc1a0lHOTFkQ0J2WmlCaWIzVnVaSE1uS1Z4dVhHNGdJR1p2Y2lBb2RtRnlJR2tnUFNCemRHRnlkRHNnYVNBOElHVnVaRHNnYVNzcktTQjdYRzRnSUNBZ2RHaHBjMXRwWFNBOUlIWmhiSFZsWEc0Z0lIMWNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1cGJuTndaV04wSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNCMllYSWdiM1YwSUQwZ1cxMWNiaUFnZG1GeUlHeGxiaUE5SUhSb2FYTXViR1Z1WjNSb1hHNGdJR1p2Y2lBb2RtRnlJR2tnUFNBd095QnBJRHdnYkdWdU95QnBLeXNwSUh0Y2JpQWdJQ0J2ZFhSYmFWMGdQU0IwYjBobGVDaDBhR2x6VzJsZEtWeHVJQ0FnSUdsbUlDaHBJRDA5UFNCbGVIQnZjblJ6TGtsT1UxQkZRMVJmVFVGWVgwSlpWRVZUS1NCN1hHNGdJQ0FnSUNCdmRYUmJhU0FySURGZElEMGdKeTR1TGlkY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ2ZWeHVJQ0I5WEc0Z0lISmxkSFZ5YmlBblBFSjFabVpsY2lBbklDc2diM1YwTG1wdmFXNG9KeUFuS1NBcklDYytKMXh1ZlZ4dVhHNHZLaXBjYmlBcUlFTnlaV0YwWlhNZ1lTQnVaWGNnWUVGeWNtRjVRblZtWm1WeVlDQjNhWFJvSUhSb1pTQXFZMjl3YVdWa0tpQnRaVzF2Y25rZ2IyWWdkR2hsSUdKMVptWmxjaUJwYm5OMFlXNWpaUzVjYmlBcUlFRmtaR1ZrSUdsdUlFNXZaR1VnTUM0eE1pNGdUMjVzZVNCaGRtRnBiR0ZpYkdVZ2FXNGdZbkp2ZDNObGNuTWdkR2hoZENCemRYQndiM0owSUVGeWNtRjVRblZtWm1WeUxseHVJQ292WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5SdlFYSnlZWGxDZFdabVpYSWdQU0JtZFc1amRHbHZiaUFvS1NCN1hHNGdJR2xtSUNoMGVYQmxiMllnVldsdWREaEJjbkpoZVNBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NwSUh0Y2JpQWdJQ0JwWmlBb1FuVm1abVZ5TGw5MWMyVlVlWEJsWkVGeWNtRjVjeWtnZTF4dUlDQWdJQ0FnY21WMGRYSnVJQ2h1WlhjZ1FuVm1abVZ5S0hSb2FYTXBLUzVpZFdabVpYSmNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnZG1GeUlHSjFaaUE5SUc1bGR5QlZhVzUwT0VGeWNtRjVLSFJvYVhNdWJHVnVaM1JvS1Z4dUlDQWdJQ0FnWm05eUlDaDJZWElnYVNBOUlEQXNJR3hsYmlBOUlHSjFaaTVzWlc1bmRHZzdJR2tnUENCc1pXNDdJR2tnS3owZ01TbGNiaUFnSUNBZ0lDQWdZblZtVzJsZElEMGdkR2hwYzF0cFhWeHVJQ0FnSUNBZ2NtVjBkWEp1SUdKMVppNWlkV1ptWlhKY2JpQWdJQ0I5WEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RDZFdabVpYSXVkRzlCY25KaGVVSjFabVpsY2lCdWIzUWdjM1Z3Y0c5eWRHVmtJR2x1SUhSb2FYTWdZbkp2ZDNObGNpY3BYRzRnSUgxY2JuMWNibHh1THk4Z1NFVk1VRVZTSUVaVlRrTlVTVTlPVTF4dUx5OGdQVDA5UFQwOVBUMDlQVDA5UFQwOVBWeHVYRzVtZFc1amRHbHZiaUJ6ZEhKcGJtZDBjbWx0SUNoemRISXBJSHRjYmlBZ2FXWWdLSE4wY2k1MGNtbHRLU0J5WlhSMWNtNGdjM1J5TG5SeWFXMG9LVnh1SUNCeVpYUjFjbTRnYzNSeUxuSmxjR3hoWTJVb0wxNWNYSE1yZkZ4Y2N5c2tMMmNzSUNjbktWeHVmVnh1WEc1MllYSWdRbEFnUFNCQ2RXWm1aWEl1Y0hKdmRHOTBlWEJsWEc1Y2JpOHFLbHh1SUNvZ1FYVm5iV1Z1ZENCaElGVnBiblE0UVhKeVlYa2dLbWx1YzNSaGJtTmxLaUFvYm05MElIUm9aU0JWYVc1ME9FRnljbUY1SUdOc1lYTnpJU2tnZDJsMGFDQkNkV1ptWlhJZ2JXVjBhRzlrYzF4dUlDb3ZYRzVDZFdabVpYSXVYMkYxWjIxbGJuUWdQU0JtZFc1amRHbHZiaUFvWVhKeUtTQjdYRzRnSUdGeWNpNWZhWE5DZFdabVpYSWdQU0IwY25WbFhHNWNiaUFnTHk4Z2MyRjJaU0J5WldabGNtVnVZMlVnZEc4Z2IzSnBaMmx1WVd3Z1ZXbHVkRGhCY25KaGVTQm5aWFF2YzJWMElHMWxkR2h2WkhNZ1ltVm1iM0psSUc5MlpYSjNjbWwwYVc1blhHNGdJR0Z5Y2k1ZloyVjBJRDBnWVhKeUxtZGxkRnh1SUNCaGNuSXVYM05sZENBOUlHRnljaTV6WlhSY2JseHVJQ0F2THlCa1pYQnlaV05oZEdWa0xDQjNhV3hzSUdKbElISmxiVzkyWldRZ2FXNGdibTlrWlNBd0xqRXpLMXh1SUNCaGNuSXVaMlYwSUQwZ1FsQXVaMlYwWEc0Z0lHRnljaTV6WlhRZ1BTQkNVQzV6WlhSY2JseHVJQ0JoY25JdWQzSnBkR1VnUFNCQ1VDNTNjbWwwWlZ4dUlDQmhjbkl1ZEc5VGRISnBibWNnUFNCQ1VDNTBiMU4wY21sdVoxeHVJQ0JoY25JdWRHOU1iMk5oYkdWVGRISnBibWNnUFNCQ1VDNTBiMU4wY21sdVoxeHVJQ0JoY25JdWRHOUtVMDlPSUQwZ1FsQXVkRzlLVTA5T1hHNGdJR0Z5Y2k1amIzQjVJRDBnUWxBdVkyOXdlVnh1SUNCaGNuSXVjMnhwWTJVZ1BTQkNVQzV6YkdsalpWeHVJQ0JoY25JdWNtVmhaRlZKYm5RNElEMGdRbEF1Y21WaFpGVkpiblE0WEc0Z0lHRnljaTV5WldGa1ZVbHVkREUyVEVVZ1BTQkNVQzV5WldGa1ZVbHVkREUyVEVWY2JpQWdZWEp5TG5KbFlXUlZTVzUwTVRaQ1JTQTlJRUpRTG5KbFlXUlZTVzUwTVRaQ1JWeHVJQ0JoY25JdWNtVmhaRlZKYm5Rek1reEZJRDBnUWxBdWNtVmhaRlZKYm5Rek1reEZYRzRnSUdGeWNpNXlaV0ZrVlVsdWRETXlRa1VnUFNCQ1VDNXlaV0ZrVlVsdWRETXlRa1ZjYmlBZ1lYSnlMbkpsWVdSSmJuUTRJRDBnUWxBdWNtVmhaRWx1ZERoY2JpQWdZWEp5TG5KbFlXUkpiblF4Tmt4RklEMGdRbEF1Y21WaFpFbHVkREUyVEVWY2JpQWdZWEp5TG5KbFlXUkpiblF4TmtKRklEMGdRbEF1Y21WaFpFbHVkREUyUWtWY2JpQWdZWEp5TG5KbFlXUkpiblF6TWt4RklEMGdRbEF1Y21WaFpFbHVkRE15VEVWY2JpQWdZWEp5TG5KbFlXUkpiblF6TWtKRklEMGdRbEF1Y21WaFpFbHVkRE15UWtWY2JpQWdZWEp5TG5KbFlXUkdiRzloZEV4RklEMGdRbEF1Y21WaFpFWnNiMkYwVEVWY2JpQWdZWEp5TG5KbFlXUkdiRzloZEVKRklEMGdRbEF1Y21WaFpFWnNiMkYwUWtWY2JpQWdZWEp5TG5KbFlXUkViM1ZpYkdWTVJTQTlJRUpRTG5KbFlXUkViM1ZpYkdWTVJWeHVJQ0JoY25JdWNtVmhaRVJ2ZFdKc1pVSkZJRDBnUWxBdWNtVmhaRVJ2ZFdKc1pVSkZYRzRnSUdGeWNpNTNjbWwwWlZWSmJuUTRJRDBnUWxBdWQzSnBkR1ZWU1c1ME9GeHVJQ0JoY25JdWQzSnBkR1ZWU1c1ME1UWk1SU0E5SUVKUUxuZHlhWFJsVlVsdWRERTJURVZjYmlBZ1lYSnlMbmR5YVhSbFZVbHVkREUyUWtVZ1BTQkNVQzUzY21sMFpWVkpiblF4TmtKRlhHNGdJR0Z5Y2k1M2NtbDBaVlZKYm5Rek1reEZJRDBnUWxBdWQzSnBkR1ZWU1c1ME16Sk1SVnh1SUNCaGNuSXVkM0pwZEdWVlNXNTBNekpDUlNBOUlFSlFMbmR5YVhSbFZVbHVkRE15UWtWY2JpQWdZWEp5TG5keWFYUmxTVzUwT0NBOUlFSlFMbmR5YVhSbFNXNTBPRnh1SUNCaGNuSXVkM0pwZEdWSmJuUXhOa3hGSUQwZ1FsQXVkM0pwZEdWSmJuUXhOa3hGWEc0Z0lHRnljaTUzY21sMFpVbHVkREUyUWtVZ1BTQkNVQzUzY21sMFpVbHVkREUyUWtWY2JpQWdZWEp5TG5keWFYUmxTVzUwTXpKTVJTQTlJRUpRTG5keWFYUmxTVzUwTXpKTVJWeHVJQ0JoY25JdWQzSnBkR1ZKYm5Rek1rSkZJRDBnUWxBdWQzSnBkR1ZKYm5Rek1rSkZYRzRnSUdGeWNpNTNjbWwwWlVac2IyRjBURVVnUFNCQ1VDNTNjbWwwWlVac2IyRjBURVZjYmlBZ1lYSnlMbmR5YVhSbFJteHZZWFJDUlNBOUlFSlFMbmR5YVhSbFJteHZZWFJDUlZ4dUlDQmhjbkl1ZDNKcGRHVkViM1ZpYkdWTVJTQTlJRUpRTG5keWFYUmxSRzkxWW14bFRFVmNiaUFnWVhKeUxuZHlhWFJsUkc5MVlteGxRa1VnUFNCQ1VDNTNjbWwwWlVSdmRXSnNaVUpGWEc0Z0lHRnljaTVtYVd4c0lEMGdRbEF1Wm1sc2JGeHVJQ0JoY25JdWFXNXpjR1ZqZENBOUlFSlFMbWx1YzNCbFkzUmNiaUFnWVhKeUxuUnZRWEp5WVhsQ2RXWm1aWElnUFNCQ1VDNTBiMEZ5Y21GNVFuVm1abVZ5WEc1Y2JpQWdjbVYwZFhKdUlHRnljbHh1ZlZ4dVhHNHZMeUJ6YkdsalpTaHpkR0Z5ZEN3Z1pXNWtLVnh1Wm5WdVkzUnBiMjRnWTJ4aGJYQWdLR2x1WkdWNExDQnNaVzRzSUdSbFptRjFiSFJXWVd4MVpTa2dlMXh1SUNCcFppQW9kSGx3Wlc5bUlHbHVaR1Y0SUNFOVBTQW5iblZ0WW1WeUp5a2djbVYwZFhKdUlHUmxabUYxYkhSV1lXeDFaVnh1SUNCcGJtUmxlQ0E5SUg1K2FXNWtaWGc3SUNBdkx5QkRiMlZ5WTJVZ2RHOGdhVzUwWldkbGNpNWNiaUFnYVdZZ0tHbHVaR1Y0SUQ0OUlHeGxiaWtnY21WMGRYSnVJR3hsYmx4dUlDQnBaaUFvYVc1a1pYZ2dQajBnTUNrZ2NtVjBkWEp1SUdsdVpHVjRYRzRnSUdsdVpHVjRJQ3M5SUd4bGJseHVJQ0JwWmlBb2FXNWtaWGdnUGowZ01Da2djbVYwZFhKdUlHbHVaR1Y0WEc0Z0lISmxkSFZ5YmlBd1hHNTlYRzVjYm1aMWJtTjBhVzl1SUdOdlpYSmpaU0FvYkdWdVozUm9LU0I3WEc0Z0lDOHZJRU52WlhKalpTQnNaVzVuZEdnZ2RHOGdZU0J1ZFcxaVpYSWdLSEJ2YzNOcFlteDVJRTVoVGlrc0lISnZkVzVrSUhWd1hHNGdJQzh2SUdsdUlHTmhjMlVnYVhRbmN5Qm1jbUZqZEdsdmJtRnNJQ2hsTG1jdUlERXlNeTQwTlRZcElIUm9aVzRnWkc4Z1lWeHVJQ0F2THlCa2IzVmliR1VnYm1WbllYUmxJSFJ2SUdOdlpYSmpaU0JoSUU1aFRpQjBieUF3TGlCRllYTjVMQ0J5YVdkb2REOWNiaUFnYkdWdVozUm9JRDBnZm41TllYUm9MbU5sYVd3b0syeGxibWQwYUNsY2JpQWdjbVYwZFhKdUlHeGxibWQwYUNBOElEQWdQeUF3SURvZ2JHVnVaM1JvWEc1OVhHNWNibVoxYm1OMGFXOXVJR2x6UVhKeVlYa2dLSE4xWW1wbFkzUXBJSHRjYmlBZ2NtVjBkWEp1SUNoQmNuSmhlUzVwYzBGeWNtRjVJSHg4SUdaMWJtTjBhVzl1SUNoemRXSnFaV04wS1NCN1hHNGdJQ0FnY21WMGRYSnVJRTlpYW1WamRDNXdjbTkwYjNSNWNHVXVkRzlUZEhKcGJtY3VZMkZzYkNoemRXSnFaV04wS1NBOVBUMGdKMXR2WW1wbFkzUWdRWEp5WVhsZEoxeHVJQ0I5S1NoemRXSnFaV04wS1Z4dWZWeHVYRzVtZFc1amRHbHZiaUJwYzBGeWNtRjVhWE5vSUNoemRXSnFaV04wS1NCN1hHNGdJSEpsZEhWeWJpQnBjMEZ5Y21GNUtITjFZbXBsWTNRcElIeDhJRUoxWm1abGNpNXBjMEoxWm1abGNpaHpkV0pxWldOMEtTQjhmRnh1SUNBZ0lDQWdjM1ZpYW1WamRDQW1KaUIwZVhCbGIyWWdjM1ZpYW1WamRDQTlQVDBnSjI5aWFtVmpkQ2NnSmlaY2JpQWdJQ0FnSUhSNWNHVnZaaUJ6ZFdKcVpXTjBMbXhsYm1kMGFDQTlQVDBnSjI1MWJXSmxjaWRjYm4xY2JseHVablZ1WTNScGIyNGdkRzlJWlhnZ0tHNHBJSHRjYmlBZ2FXWWdLRzRnUENBeE5pa2djbVYwZFhKdUlDY3dKeUFySUc0dWRHOVRkSEpwYm1jb01UWXBYRzRnSUhKbGRIVnliaUJ1TG5SdlUzUnlhVzVuS0RFMktWeHVmVnh1WEc1bWRXNWpkR2x2YmlCMWRHWTRWRzlDZVhSbGN5QW9jM1J5S1NCN1hHNGdJSFpoY2lCaWVYUmxRWEp5WVhrZ1BTQmJYVnh1SUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElITjBjaTVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUhaaGNpQmlJRDBnYzNSeUxtTm9ZWEpEYjJSbFFYUW9hU2xjYmlBZ0lDQnBaaUFvWWlBOFBTQXdlRGRHS1Z4dUlDQWdJQ0FnWW5sMFpVRnljbUY1TG5CMWMyZ29jM1J5TG1Ob1lYSkRiMlJsUVhRb2FTa3BYRzRnSUNBZ1pXeHpaU0I3WEc0Z0lDQWdJQ0IyWVhJZ2MzUmhjblFnUFNCcFhHNGdJQ0FnSUNCcFppQW9ZaUErUFNBd2VFUTRNREFnSmlZZ1lpQThQU0F3ZUVSR1JrWXBJR2tySzF4dUlDQWdJQ0FnZG1GeUlHZ2dQU0JsYm1OdlpHVlZVa2xEYjIxd2IyNWxiblFvYzNSeUxuTnNhV05sS0hOMFlYSjBMQ0JwS3pFcEtTNXpkV0p6ZEhJb01Ta3VjM0JzYVhRb0p5VW5LVnh1SUNBZ0lDQWdabTl5SUNoMllYSWdhaUE5SURBN0lHb2dQQ0JvTG14bGJtZDBhRHNnYWlzcktWeHVJQ0FnSUNBZ0lDQmllWFJsUVhKeVlYa3VjSFZ6YUNod1lYSnpaVWx1ZENob1cycGRMQ0F4TmlrcFhHNGdJQ0FnZlZ4dUlDQjlYRzRnSUhKbGRIVnliaUJpZVhSbFFYSnlZWGxjYm4xY2JseHVablZ1WTNScGIyNGdZWE5qYVdsVWIwSjVkR1Z6SUNoemRISXBJSHRjYmlBZ2RtRnlJR0o1ZEdWQmNuSmhlU0E5SUZ0ZFhHNGdJR1p2Y2lBb2RtRnlJR2tnUFNBd095QnBJRHdnYzNSeUxteGxibWQwYURzZ2FTc3JLU0I3WEc0Z0lDQWdMeThnVG05a1pTZHpJR052WkdVZ2MyVmxiWE1nZEc4Z1ltVWdaRzlwYm1jZ2RHaHBjeUJoYm1RZ2JtOTBJQ1lnTUhnM1JpNHVYRzRnSUNBZ1lubDBaVUZ5Y21GNUxuQjFjMmdvYzNSeUxtTm9ZWEpEYjJSbFFYUW9hU2tnSmlBd2VFWkdLVnh1SUNCOVhHNGdJSEpsZEhWeWJpQmllWFJsUVhKeVlYbGNibjFjYmx4dVpuVnVZM1JwYjI0Z2RYUm1NVFpzWlZSdlFubDBaWE1nS0hOMGNpa2dlMXh1SUNCMllYSWdZeXdnYUdrc0lHeHZYRzRnSUhaaGNpQmllWFJsUVhKeVlYa2dQU0JiWFZ4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJSE4wY2k1c1pXNW5kR2c3SUdrckt5a2dlMXh1SUNBZ0lHTWdQU0J6ZEhJdVkyaGhja052WkdWQmRDaHBLVnh1SUNBZ0lHaHBJRDBnWXlBK1BpQTRYRzRnSUNBZ2JHOGdQU0JqSUNVZ01qVTJYRzRnSUNBZ1lubDBaVUZ5Y21GNUxuQjFjMmdvYkc4cFhHNGdJQ0FnWW5sMFpVRnljbUY1TG5CMWMyZ29hR2twWEc0Z0lIMWNibHh1SUNCeVpYUjFjbTRnWW5sMFpVRnljbUY1WEc1OVhHNWNibVoxYm1OMGFXOXVJR0poYzJVMk5GUnZRbmwwWlhNZ0tITjBjaWtnZTF4dUlDQnlaWFIxY200Z1ltRnpaVFkwTG5SdlFubDBaVUZ5Y21GNUtITjBjaWxjYm4xY2JseHVablZ1WTNScGIyNGdZbXhwZEVKMVptWmxjaUFvYzNKakxDQmtjM1FzSUc5bVpuTmxkQ3dnYkdWdVozUm9LU0I3WEc0Z0lIWmhjaUJ3YjNOY2JpQWdabTl5SUNoMllYSWdhU0E5SURBN0lHa2dQQ0JzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUdsbUlDZ29hU0FySUc5bVpuTmxkQ0ErUFNCa2MzUXViR1Z1WjNSb0tTQjhmQ0FvYVNBK1BTQnpjbU11YkdWdVozUm9LU2xjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWkhOMFcya2dLeUJ2Wm1aelpYUmRJRDBnYzNKalcybGRYRzRnSUgxY2JpQWdjbVYwZFhKdUlHbGNibjFjYmx4dVpuVnVZM1JwYjI0Z1pHVmpiMlJsVlhSbU9FTm9ZWElnS0hOMGNpa2dlMXh1SUNCMGNua2dlMXh1SUNBZ0lISmxkSFZ5YmlCa1pXTnZaR1ZWVWtsRGIyMXdiMjVsYm5Rb2MzUnlLVnh1SUNCOUlHTmhkR05vSUNobGNuSXBJSHRjYmlBZ0lDQnlaWFIxY200Z1UzUnlhVzVuTG1aeWIyMURhR0Z5UTI5a1pTZ3dlRVpHUmtRcElDOHZJRlZVUmlBNElHbHVkbUZzYVdRZ1kyaGhjbHh1SUNCOVhHNTlYRzVjYmk4cVhHNGdLaUJYWlNCb1lYWmxJSFJ2SUcxaGEyVWdjM1Z5WlNCMGFHRjBJSFJvWlNCMllXeDFaU0JwY3lCaElIWmhiR2xrSUdsdWRHVm5aWEl1SUZSb2FYTWdiV1ZoYm5NZ2RHaGhkQ0JwZEZ4dUlDb2dhWE1nYm05dUxXNWxaMkYwYVhabExpQkpkQ0JvWVhNZ2JtOGdabkpoWTNScGIyNWhiQ0JqYjIxd2IyNWxiblFnWVc1a0lIUm9ZWFFnYVhRZ1pHOWxjeUJ1YjNSY2JpQXFJR1Y0WTJWbFpDQjBhR1VnYldGNGFXMTFiU0JoYkd4dmQyVmtJSFpoYkhWbExseHVJQ292WEc1bWRXNWpkR2x2YmlCMlpYSnBablZwYm5RZ0tIWmhiSFZsTENCdFlYZ3BJSHRjYmlBZ1lYTnpaWEowS0hSNWNHVnZaaUIyWVd4MVpTQTlQVDBnSjI1MWJXSmxjaWNzSUNkallXNXViM1FnZDNKcGRHVWdZU0J1YjI0dGJuVnRZbVZ5SUdGeklHRWdiblZ0WW1WeUp5bGNiaUFnWVhOelpYSjBLSFpoYkhWbElENDlJREFzSUNkemNHVmphV1pwWldRZ1lTQnVaV2RoZEdsMlpTQjJZV3gxWlNCbWIzSWdkM0pwZEdsdVp5QmhiaUIxYm5OcFoyNWxaQ0IyWVd4MVpTY3BYRzRnSUdGemMyVnlkQ2gyWVd4MVpTQThQU0J0WVhnc0lDZDJZV3gxWlNCcGN5QnNZWEpuWlhJZ2RHaGhiaUJ0WVhocGJYVnRJSFpoYkhWbElHWnZjaUIwZVhCbEp5bGNiaUFnWVhOelpYSjBLRTFoZEdndVpteHZiM0lvZG1Gc2RXVXBJRDA5UFNCMllXeDFaU3dnSjNaaGJIVmxJR2hoY3lCaElHWnlZV04wYVc5dVlXd2dZMjl0Y0c5dVpXNTBKeWxjYm4xY2JseHVablZ1WTNScGIyNGdkbVZ5YVdaemFXNTBJQ2gyWVd4MVpTd2diV0Y0TENCdGFXNHBJSHRjYmlBZ1lYTnpaWEowS0hSNWNHVnZaaUIyWVd4MVpTQTlQVDBnSjI1MWJXSmxjaWNzSUNkallXNXViM1FnZDNKcGRHVWdZU0J1YjI0dGJuVnRZbVZ5SUdGeklHRWdiblZ0WW1WeUp5bGNiaUFnWVhOelpYSjBLSFpoYkhWbElEdzlJRzFoZUN3Z0ozWmhiSFZsSUd4aGNtZGxjaUIwYUdGdUlHMWhlR2x0ZFcwZ1lXeHNiM2RsWkNCMllXeDFaU2NwWEc0Z0lHRnpjMlZ5ZENoMllXeDFaU0ErUFNCdGFXNHNJQ2QyWVd4MVpTQnpiV0ZzYkdWeUlIUm9ZVzRnYldsdWFXMTFiU0JoYkd4dmQyVmtJSFpoYkhWbEp5bGNiaUFnWVhOelpYSjBLRTFoZEdndVpteHZiM0lvZG1Gc2RXVXBJRDA5UFNCMllXeDFaU3dnSjNaaGJIVmxJR2hoY3lCaElHWnlZV04wYVc5dVlXd2dZMjl0Y0c5dVpXNTBKeWxjYm4xY2JseHVablZ1WTNScGIyNGdkbVZ5YVdaSlJVVkZOelUwSUNoMllXeDFaU3dnYldGNExDQnRhVzRwSUh0Y2JpQWdZWE56WlhKMEtIUjVjR1Z2WmlCMllXeDFaU0E5UFQwZ0oyNTFiV0psY2ljc0lDZGpZVzV1YjNRZ2QzSnBkR1VnWVNCdWIyNHRiblZ0WW1WeUlHRnpJR0VnYm5WdFltVnlKeWxjYmlBZ1lYTnpaWEowS0haaGJIVmxJRHc5SUcxaGVDd2dKM1poYkhWbElHeGhjbWRsY2lCMGFHRnVJRzFoZUdsdGRXMGdZV3hzYjNkbFpDQjJZV3gxWlNjcFhHNGdJR0Z6YzJWeWRDaDJZV3gxWlNBK1BTQnRhVzRzSUNkMllXeDFaU0J6YldGc2JHVnlJSFJvWVc0Z2JXbHVhVzExYlNCaGJHeHZkMlZrSUhaaGJIVmxKeWxjYm4xY2JseHVablZ1WTNScGIyNGdZWE56WlhKMElDaDBaWE4wTENCdFpYTnpZV2RsS1NCN1hHNGdJR2xtSUNnaGRHVnpkQ2tnZEdoeWIzY2dibVYzSUVWeWNtOXlLRzFsYzNOaFoyVWdmSHdnSjBaaGFXeGxaQ0JoYzNObGNuUnBiMjRuS1Z4dWZWeHVYRzU5S1M1allXeHNLSFJvYVhNc2NtVnhkV2x5WlNoY0ltVXZWU3M1TjF3aUtTeDBlWEJsYjJZZ2MyVnNaaUFoUFQwZ1hDSjFibVJsWm1sdVpXUmNJaUEvSUhObGJHWWdPaUIwZVhCbGIyWWdkMmx1Wkc5M0lDRTlQU0JjSW5WdVpHVm1hVzVsWkZ3aUlEOGdkMmx1Wkc5M0lEb2dlMzBzY21WeGRXbHlaU2hjSW1KMVptWmxjbHdpS1M1Q2RXWm1aWElzWVhKbmRXMWxiblJ6V3pOZExHRnlaM1Z0Wlc1MGMxczBYU3hoY21kMWJXVnVkSE5iTlYwc1lYSm5kVzFsYm5Seld6WmRMRndpTHk0dVhGeGNYQzR1WEZ4Y1hHNXZaR1ZmYlc5a2RXeGxjMXhjWEZ4aWRXWm1aWEpjWEZ4Y2FXNWtaWGd1YW5OY0lpeGNJaTh1TGx4Y1hGd3VMbHhjWEZ4dWIyUmxYMjF2WkhWc1pYTmNYRnhjWW5WbVptVnlYQ0lwSWl3aUtHWjFibU4wYVc5dUlDaHdjbTlqWlhOekxHZHNiMkpoYkN4Q2RXWm1aWElzWDE5aGNtZDFiV1Z1ZERBc1gxOWhjbWQxYldWdWRERXNYMTloY21kMWJXVnVkRElzWDE5aGNtZDFiV1Z1ZERNc1gxOW1hV3hsYm1GdFpTeGZYMlJwY201aGJXVXBlMXh1Wlhod2IzSjBjeTV5WldGa0lEMGdablZ1WTNScGIyNGdLR0oxWm1abGNpd2diMlptYzJWMExDQnBjMHhGTENCdFRHVnVMQ0J1UW5sMFpYTXBJSHRjYmlBZ2RtRnlJR1VzSUcxY2JpQWdkbUZ5SUdWTVpXNGdQU0J1UW5sMFpYTWdLaUE0SUMwZ2JVeGxiaUF0SURGY2JpQWdkbUZ5SUdWTllYZ2dQU0FvTVNBOFBDQmxUR1Z1S1NBdElERmNiaUFnZG1GeUlHVkNhV0Z6SUQwZ1pVMWhlQ0ErUGlBeFhHNGdJSFpoY2lCdVFtbDBjeUE5SUMwM1hHNGdJSFpoY2lCcElEMGdhWE5NUlNBL0lDaHVRbmwwWlhNZ0xTQXhLU0E2SURCY2JpQWdkbUZ5SUdRZ1BTQnBjMHhGSUQ4Z0xURWdPaUF4WEc0Z0lIWmhjaUJ6SUQwZ1luVm1abVZ5VzI5bVpuTmxkQ0FySUdsZFhHNWNiaUFnYVNBclBTQmtYRzVjYmlBZ1pTQTlJSE1nSmlBb0tERWdQRHdnS0MxdVFtbDBjeWtwSUMwZ01TbGNiaUFnY3lBK1BqMGdLQzF1UW1sMGN5bGNiaUFnYmtKcGRITWdLejBnWlV4bGJseHVJQ0JtYjNJZ0tEc2dia0pwZEhNZ1BpQXdPeUJsSUQwZ1pTQXFJREkxTmlBcklHSjFabVpsY2x0dlptWnpaWFFnS3lCcFhTd2dhU0FyUFNCa0xDQnVRbWwwY3lBdFBTQTRLU0I3ZlZ4dVhHNGdJRzBnUFNCbElDWWdLQ2d4SUR3OElDZ3Ria0pwZEhNcEtTQXRJREVwWEc0Z0lHVWdQajQ5SUNndGJrSnBkSE1wWEc0Z0lHNUNhWFJ6SUNzOUlHMU1aVzVjYmlBZ1ptOXlJQ2c3SUc1Q2FYUnpJRDRnTURzZ2JTQTlJRzBnS2lBeU5UWWdLeUJpZFdabVpYSmJiMlptYzJWMElDc2dhVjBzSUdrZ0t6MGdaQ3dnYmtKcGRITWdMVDBnT0NrZ2UzMWNibHh1SUNCcFppQW9aU0E5UFQwZ01Da2dlMXh1SUNBZ0lHVWdQU0F4SUMwZ1pVSnBZWE5jYmlBZ2ZTQmxiSE5sSUdsbUlDaGxJRDA5UFNCbFRXRjRLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHMGdQeUJPWVU0Z09pQW9LSE1nUHlBdE1TQTZJREVwSUNvZ1NXNW1hVzVwZEhrcFhHNGdJSDBnWld4elpTQjdYRzRnSUNBZ2JTQTlJRzBnS3lCTllYUm9MbkJ2ZHlneUxDQnRUR1Z1S1Z4dUlDQWdJR1VnUFNCbElDMGdaVUpwWVhOY2JpQWdmVnh1SUNCeVpYUjFjbTRnS0hNZ1B5QXRNU0E2SURFcElDb2diU0FxSUUxaGRHZ3VjRzkzS0RJc0lHVWdMU0J0VEdWdUtWeHVmVnh1WEc1bGVIQnZjblJ6TG5keWFYUmxJRDBnWm5WdVkzUnBiMjRnS0dKMVptWmxjaXdnZG1Gc2RXVXNJRzltWm5ObGRDd2dhWE5NUlN3Z2JVeGxiaXdnYmtKNWRHVnpLU0I3WEc0Z0lIWmhjaUJsTENCdExDQmpYRzRnSUhaaGNpQmxUR1Z1SUQwZ2JrSjVkR1Z6SUNvZ09DQXRJRzFNWlc0Z0xTQXhYRzRnSUhaaGNpQmxUV0Y0SUQwZ0tERWdQRHdnWlV4bGJpa2dMU0F4WEc0Z0lIWmhjaUJsUW1saGN5QTlJR1ZOWVhnZ1BqNGdNVnh1SUNCMllYSWdjblFnUFNBb2JVeGxiaUE5UFQwZ01qTWdQeUJOWVhSb0xuQnZkeWd5TENBdE1qUXBJQzBnVFdGMGFDNXdiM2NvTWl3Z0xUYzNLU0E2SURBcFhHNGdJSFpoY2lCcElEMGdhWE5NUlNBL0lEQWdPaUFvYmtKNWRHVnpJQzBnTVNsY2JpQWdkbUZ5SUdRZ1BTQnBjMHhGSUQ4Z01TQTZJQzB4WEc0Z0lIWmhjaUJ6SUQwZ2RtRnNkV1VnUENBd0lIeDhJQ2gyWVd4MVpTQTlQVDBnTUNBbUppQXhJQzhnZG1Gc2RXVWdQQ0F3S1NBL0lERWdPaUF3WEc1Y2JpQWdkbUZzZFdVZ1BTQk5ZWFJvTG1GaWN5aDJZV3gxWlNsY2JseHVJQ0JwWmlBb2FYTk9ZVTRvZG1Gc2RXVXBJSHg4SUhaaGJIVmxJRDA5UFNCSmJtWnBibWwwZVNrZ2UxeHVJQ0FnSUcwZ1BTQnBjMDVoVGloMllXeDFaU2tnUHlBeElEb2dNRnh1SUNBZ0lHVWdQU0JsVFdGNFhHNGdJSDBnWld4elpTQjdYRzRnSUNBZ1pTQTlJRTFoZEdndVpteHZiM0lvVFdGMGFDNXNiMmNvZG1Gc2RXVXBJQzhnVFdGMGFDNU1UaklwWEc0Z0lDQWdhV1lnS0haaGJIVmxJQ29nS0dNZ1BTQk5ZWFJvTG5CdmR5Z3lMQ0F0WlNrcElEd2dNU2tnZTF4dUlDQWdJQ0FnWlMwdFhHNGdJQ0FnSUNCaklDbzlJREpjYmlBZ0lDQjlYRzRnSUNBZ2FXWWdLR1VnS3lCbFFtbGhjeUErUFNBeEtTQjdYRzRnSUNBZ0lDQjJZV3gxWlNBclBTQnlkQ0F2SUdOY2JpQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdkbUZzZFdVZ0t6MGdjblFnS2lCTllYUm9MbkJ2ZHlneUxDQXhJQzBnWlVKcFlYTXBYRzRnSUNBZ2ZWeHVJQ0FnSUdsbUlDaDJZV3gxWlNBcUlHTWdQajBnTWlrZ2UxeHVJQ0FnSUNBZ1pTc3JYRzRnSUNBZ0lDQmpJQzg5SURKY2JpQWdJQ0I5WEc1Y2JpQWdJQ0JwWmlBb1pTQXJJR1ZDYVdGeklENDlJR1ZOWVhncElIdGNiaUFnSUNBZ0lHMGdQU0F3WEc0Z0lDQWdJQ0JsSUQwZ1pVMWhlRnh1SUNBZ0lIMGdaV3h6WlNCcFppQW9aU0FySUdWQ2FXRnpJRDQ5SURFcElIdGNiaUFnSUNBZ0lHMGdQU0FvZG1Gc2RXVWdLaUJqSUMwZ01Ta2dLaUJOWVhSb0xuQnZkeWd5TENCdFRHVnVLVnh1SUNBZ0lDQWdaU0E5SUdVZ0t5QmxRbWxoYzF4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQnRJRDBnZG1Gc2RXVWdLaUJOWVhSb0xuQnZkeWd5TENCbFFtbGhjeUF0SURFcElDb2dUV0YwYUM1d2IzY29NaXdnYlV4bGJpbGNiaUFnSUNBZ0lHVWdQU0F3WEc0Z0lDQWdmVnh1SUNCOVhHNWNiaUFnWm05eUlDZzdJRzFNWlc0Z1BqMGdPRHNnWW5WbVptVnlXMjltWm5ObGRDQXJJR2xkSUQwZ2JTQW1JREI0Wm1Zc0lHa2dLejBnWkN3Z2JTQXZQU0F5TlRZc0lHMU1aVzRnTFQwZ09Da2dlMzFjYmx4dUlDQmxJRDBnS0dVZ1BEd2diVXhsYmlrZ2ZDQnRYRzRnSUdWTVpXNGdLejBnYlV4bGJseHVJQ0JtYjNJZ0tEc2daVXhsYmlBK0lEQTdJR0oxWm1abGNsdHZabVp6WlhRZ0t5QnBYU0E5SUdVZ0ppQXdlR1ptTENCcElDczlJR1FzSUdVZ0x6MGdNalUyTENCbFRHVnVJQzA5SURncElIdDlYRzVjYmlBZ1luVm1abVZ5VzI5bVpuTmxkQ0FySUdrZ0xTQmtYU0I4UFNCeklDb2dNVEk0WEc1OVhHNWNibjBwTG1OaGJHd29kR2hwY3l4eVpYRjFhWEpsS0Z3aVpTOVZLemszWENJcExIUjVjR1Z2WmlCelpXeG1JQ0U5UFNCY0luVnVaR1ZtYVc1bFpGd2lJRDhnYzJWc1ppQTZJSFI1Y0dWdlppQjNhVzVrYjNjZ0lUMDlJRndpZFc1a1pXWnBibVZrWENJZ1B5QjNhVzVrYjNjZ09pQjdmU3h5WlhGMWFYSmxLRndpWW5WbVptVnlYQ0lwTGtKMVptWmxjaXhoY21kMWJXVnVkSE5iTTEwc1lYSm5kVzFsYm5Seld6UmRMR0Z5WjNWdFpXNTBjMXMxWFN4aGNtZDFiV1Z1ZEhOYk5sMHNYQ0l2TGk1Y1hGeGNMaTVjWEZ4Y2JtOWtaVjl0YjJSMWJHVnpYRnhjWEdsbFpXVTNOVFJjWEZ4Y2FXNWtaWGd1YW5OY0lpeGNJaTh1TGx4Y1hGd3VMbHhjWEZ4dWIyUmxYMjF2WkhWc1pYTmNYRnhjYVdWbFpUYzFORndpS1NJc0lpaG1kVzVqZEdsdmJpQW9jSEp2WTJWemN5eG5iRzlpWVd3c1FuVm1abVZ5TEY5ZllYSm5kVzFsYm5Rd0xGOWZZWEpuZFcxbGJuUXhMRjlmWVhKbmRXMWxiblF5TEY5ZllYSm5kVzFsYm5RekxGOWZabWxzWlc1aGJXVXNYMTlrYVhKdVlXMWxLWHRjYmk4dklITm9hVzBnWm05eUlIVnphVzVuSUhCeWIyTmxjM01nYVc0Z1luSnZkM05sY2x4dVhHNTJZWElnY0hKdlkyVnpjeUE5SUcxdlpIVnNaUzVsZUhCdmNuUnpJRDBnZTMwN1hHNWNibkJ5YjJObGMzTXVibVY0ZEZScFkyc2dQU0FvWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUhaaGNpQmpZVzVUWlhSSmJXMWxaR2xoZEdVZ1BTQjBlWEJsYjJZZ2QybHVaRzkzSUNFOVBTQW5kVzVrWldacGJtVmtKMXh1SUNBZ0lDWW1JSGRwYm1SdmR5NXpaWFJKYlcxbFpHbGhkR1U3WEc0Z0lDQWdkbUZ5SUdOaGJsQnZjM1FnUFNCMGVYQmxiMllnZDJsdVpHOTNJQ0U5UFNBbmRXNWtaV1pwYm1Wa0oxeHVJQ0FnSUNZbUlIZHBibVJ2ZHk1d2IzTjBUV1Z6YzJGblpTQW1KaUIzYVc1a2IzY3VZV1JrUlhabGJuUk1hWE4wWlc1bGNseHVJQ0FnSUR0Y2JseHVJQ0FnSUdsbUlDaGpZVzVUWlhSSmJXMWxaR2xoZEdVcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUlDaG1LU0I3SUhKbGRIVnliaUIzYVc1a2IzY3VjMlYwU1cxdFpXUnBZWFJsS0dZcElIMDdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ2FXWWdLR05oYmxCdmMzUXBJSHRjYmlBZ0lDQWdJQ0FnZG1GeUlIRjFaWFZsSUQwZ1cxMDdYRzRnSUNBZ0lDQWdJSGRwYm1SdmR5NWhaR1JGZG1WdWRFeHBjM1JsYm1WeUtDZHRaWE56WVdkbEp5d2dablZ1WTNScGIyNGdLR1YyS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2MyOTFjbU5sSUQwZ1pYWXVjMjkxY21ObE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tDaHpiM1Z5WTJVZ1BUMDlJSGRwYm1SdmR5QjhmQ0J6YjNWeVkyVWdQVDA5SUc1MWJHd3BJQ1ltSUdWMkxtUmhkR0VnUFQwOUlDZHdjbTlqWlhOekxYUnBZMnNuS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pYWXVjM1J2Y0ZCeWIzQmhaMkYwYVc5dUtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hGMVpYVmxMbXhsYm1kMGFDQStJREFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdadUlEMGdjWFZsZFdVdWMyaHBablFvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdabTRvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwc0lIUnlkV1VwTzF4dVhHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlCdVpYaDBWR2xqYXlobWJpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NYVmxkV1V1Y0hWemFDaG1iaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjNhVzVrYjNjdWNHOXpkRTFsYzNOaFoyVW9KM0J5YjJObGMzTXRkR2xqYXljc0lDY3FKeWs3WEc0Z0lDQWdJQ0FnSUgwN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJRzVsZUhSVWFXTnJLR1p1S1NCN1hHNGdJQ0FnSUNBZ0lITmxkRlJwYldWdmRYUW9abTRzSURBcE8xeHVJQ0FnSUgwN1hHNTlLU2dwTzF4dVhHNXdjbTlqWlhOekxuUnBkR3hsSUQwZ0oySnliM2R6WlhJbk8xeHVjSEp2WTJWemN5NWljbTkzYzJWeUlEMGdkSEoxWlR0Y2JuQnliMk5sYzNNdVpXNTJJRDBnZTMwN1hHNXdjbTlqWlhOekxtRnlaM1lnUFNCYlhUdGNibHh1Wm5WdVkzUnBiMjRnYm05dmNDZ3BJSHQ5WEc1Y2JuQnliMk5sYzNNdWIyNGdQU0J1YjI5d08xeHVjSEp2WTJWemN5NWhaR1JNYVhOMFpXNWxjaUE5SUc1dmIzQTdYRzV3Y205alpYTnpMbTl1WTJVZ1BTQnViMjl3TzF4dWNISnZZMlZ6Y3k1dlptWWdQU0J1YjI5d08xeHVjSEp2WTJWemN5NXlaVzF2ZG1WTWFYTjBaVzVsY2lBOUlHNXZiM0E3WEc1d2NtOWpaWE56TG5KbGJXOTJaVUZzYkV4cGMzUmxibVZ5Y3lBOUlHNXZiM0E3WEc1d2NtOWpaWE56TG1WdGFYUWdQU0J1YjI5d08xeHVYRzV3Y205alpYTnpMbUpwYm1ScGJtY2dQU0JtZFc1amRHbHZiaUFvYm1GdFpTa2dlMXh1SUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lnbmNISnZZMlZ6Y3k1aWFXNWthVzVuSUdseklHNXZkQ0J6ZFhCd2IzSjBaV1FuS1R0Y2JuMWNibHh1THk4Z1ZFOUVUeWh6YUhSNWJHMWhiaWxjYm5CeWIyTmxjM011WTNka0lEMGdablZ1WTNScGIyNGdLQ2tnZXlCeVpYUjFjbTRnSnk4bklIMDdYRzV3Y205alpYTnpMbU5vWkdseUlEMGdablZ1WTNScGIyNGdLR1JwY2lrZ2UxeHVJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduY0hKdlkyVnpjeTVqYUdScGNpQnBjeUJ1YjNRZ2MzVndjRzl5ZEdWa0p5azdYRzU5TzF4dVhHNTlLUzVqWVd4c0tIUm9hWE1zY21WeGRXbHlaU2hjSW1VdlZTczVOMXdpS1N4MGVYQmxiMllnYzJWc1ppQWhQVDBnWENKMWJtUmxabWx1WldSY0lpQS9JSE5sYkdZZ09pQjBlWEJsYjJZZ2QybHVaRzkzSUNFOVBTQmNJblZ1WkdWbWFXNWxaRndpSUQ4Z2QybHVaRzkzSURvZ2UzMHNjbVZ4ZFdseVpTaGNJbUoxWm1abGNsd2lLUzVDZFdabVpYSXNZWEpuZFcxbGJuUnpXek5kTEdGeVozVnRaVzUwYzFzMFhTeGhjbWQxYldWdWRITmJOVjBzWVhKbmRXMWxiblJ6V3paZExGd2lMeTR1WEZ4Y1hDNHVYRnhjWEc1dlpHVmZiVzlrZFd4bGMxeGNYRnh3Y205alpYTnpYRnhjWEdKeWIzZHpaWEl1YW5OY0lpeGNJaTh1TGx4Y1hGd3VMbHhjWEZ4dWIyUmxYMjF2WkhWc1pYTmNYRnhjY0hKdlkyVnpjMXdpS1NJc0lpaG1kVzVqZEdsdmJpQW9jSEp2WTJWemN5eG5iRzlpWVd3c1FuVm1abVZ5TEY5ZllYSm5kVzFsYm5Rd0xGOWZZWEpuZFcxbGJuUXhMRjlmWVhKbmRXMWxiblF5TEY5ZllYSm5kVzFsYm5RekxGOWZabWxzWlc1aGJXVXNYMTlrYVhKdVlXMWxLWHRjYmlkMWMyVWdjM1J5YVdOMEp6dGNibHh1ZG1GeUlHbHVjM1JoYm1ObGN5QTlJSHQ5TzF4dVhHNHZMejBnWDJaMWJtTjBhVzl1Y3k1cWMxeHVMeTg5SUY5emRHOXlaUzVqYkdGemN5NXFjMXh1THk4OUlGOXRiMlJoYkM1amJHRnpjeTVxYzF4dUx5ODlJRjl3Y205a2RXTjBMbU5zWVhOekxtcHpYRzR2THowZ1gySmhjMnRsZEM1amJHRnpjeTVxYzF4dUx5ODlJRjltYVd4MFpYSXVZMnhoYzNNdWFuTmNibHh1ZDJsdVpHOTNMbTl1Ykc5aFpDQTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdkbUZ5SUhCeWIyUjFZM1J6SUQwZ2JtVjNJRk4wYjNKbEtDZHpkR0YwYVdNdmNISnZaSFZqZEhNdWFuTnZiaWNzSUNjamNISnZaSFZqZEhNZ0xtTnZiblJsYm5RbktUdGNiaUFnY0hKdlpIVmpkSE11YjI1TWIyRmtJRDBnWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUhaaGNpQnVZWFlnUFNCa2IyTjFiV1Z1ZEM1eGRXVnllVk5sYkdWamRHOXlLQ2R1WVhZbktTeGNiaUFnSUNBZ0lDQWdZWE5wWkdVZ1BTQmtiMk4xYldWdWRDNXhkV1Z5ZVZObGJHVmpkRzl5S0NkaGMybGtaU2NwTEZ4dUlDQWdJQ0FnSUNCemJHbGtaU0E5SUdSdlkzVnRaVzUwTG5GMVpYSjVVMlZzWldOMGIzSW9KMkZ6YVdSbElDNXpiR2xrWlNjcE8xeHVJQ0FnSUhkcGJtUnZkeTV2Ym5OamNtOXNiQ0E5SUdaMWJtTjBhVzl1SUNobEtTQjdYRzRnSUNBZ0lDQjJZWElnWTI5eWNtVmpkRk5qY205c2JDQTlJR1V1ZEdGeVoyVjBMbk5qY205c2JHbHVaMFZzWlcxbGJuUXVjMk55YjJ4c1ZHOXdJQzBnWVhOcFpHVXViMlptYzJWMFZHOXdJQ3NnYm1GMkxtOW1abk5sZEVobGFXZG9kRHRjYmlBZ0lDQWdJR2xtSUNoamIzSnlaV04wVTJOeWIyeHNJRHdnTUNrZ2MyeHBaR1V1YzNSNWJHVXVkSEpoYm5ObWIzSnRJRDBnSjNSeVlXNXpiR0YwWlZrb01IQjRLU2M3Wld4elpTQnBaaUFvWTI5eWNtVmpkRk5qY205c2JDQStJR0Z6YVdSbExtOW1abk5sZEVobGFXZG9kQ0F0SUhOc2FXUmxMbTltWm5ObGRFaGxhV2RvZENrZ2MyeHBaR1V1YzNSNWJHVXVkSEpoYm5ObWIzSnRJRDBnSjNSeVlXNXpiR0YwWlZrb0p5QXJJQ2hoYzJsa1pTNXZabVp6WlhSSVpXbG5hSFFnTFNCemJHbGtaUzV2Wm1aelpYUklaV2xuYUhRcElDc2dKM0I0S1NjN1pXeHpaU0JwWmlBb1kyOXljbVZqZEZOamNtOXNiQ0ErSURBZ0ppWWdZMjl5Y21WamRGTmpjbTlzYkNBOElHRnphV1JsTG05bVpuTmxkRWhsYVdkb2RDQXRJSE5zYVdSbExtOW1abk5sZEVobGFXZG9kQ2tnYzJ4cFpHVXVjM1I1YkdVdWRISmhibk5tYjNKdElEMGdKM1J5WVc1emJHRjBaVmtvSnlBcklHTnZjbkpsWTNSVFkzSnZiR3dnS3lBbmNIZ3BKenRjYmlBZ0lDQjlPMXh1SUNCOU8xeHVmVHRjYm4wcExtTmhiR3dvZEdocGN5eHlaWEYxYVhKbEtGd2laUzlWS3prM1hDSXBMSFI1Y0dWdlppQnpaV3htSUNFOVBTQmNJblZ1WkdWbWFXNWxaRndpSUQ4Z2MyVnNaaUE2SUhSNWNHVnZaaUIzYVc1a2IzY2dJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSWdQeUIzYVc1a2IzY2dPaUI3ZlN4eVpYRjFhWEpsS0Z3aVluVm1abVZ5WENJcExrSjFabVpsY2l4aGNtZDFiV1Z1ZEhOYk0xMHNZWEpuZFcxbGJuUnpXelJkTEdGeVozVnRaVzUwYzFzMVhTeGhjbWQxYldWdWRITmJObDBzWENJdlptRnJaVjgwWW1JMU5UTm1MbXB6WENJc1hDSXZYQ0lwSWwxOSJdfQ==
