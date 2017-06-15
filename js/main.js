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
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_b833cb.js","/")
},{"buffer":2,"e/U+97":4}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxQcm9qZWN0c1xca3VwZWNoZXNraXlkb21cXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkM6L1Byb2plY3RzL2t1cGVjaGVza2l5ZG9tL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIkM6L1Byb2plY3RzL2t1cGVjaGVza2l5ZG9tL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCJDOi9Qcm9qZWN0cy9rdXBlY2hlc2tpeWRvbS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIkM6L1Byb2plY3RzL2t1cGVjaGVza2l5ZG9tL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJDOi9Qcm9qZWN0cy9rdXBlY2hlc2tpeWRvbS9zcmMvanMvZmFrZV9iODMzY2IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYmFzZTY0LWpzXFxcXGxpYlxcXFxiNjQuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYmFzZTY0LWpzXFxcXGxpYlwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJ1ZmZlclxcXFxpbmRleC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxidWZmZXJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcaWVlZTc1NFxcXFxpbmRleC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxpZWVlNzU0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXHByb2Nlc3NcXFxcYnJvd3Nlci5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5zdGFuY2VzID0ge307XG5cbi8vPSBfZnVuY3Rpb25zLmpzXG4vLz0gX3N0b3JlLmNsYXNzLmpzXG4vLz0gX21vZGFsLmNsYXNzLmpzXG4vLz0gX3Byb2R1Y3QuY2xhc3MuanNcbi8vPSBfYmFza2V0LmNsYXNzLmpzXG4vLz0gX2ZpbHRlci5jbGFzcy5qc1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcHJvZHVjdHMgPSBuZXcgU3RvcmUoJ3N0YXRpYy9wcm9kdWN0cy5qc29uJywgJyNwcm9kdWN0cyAuY29udGVudCcpO1xuICBwcm9kdWN0cy5vbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5hdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ25hdicpLFxuICAgICAgICBhc2lkZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FzaWRlJyksXG4gICAgICAgIHNsaWRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYXNpZGUgLnNsaWRlJyk7XG4gICAgd2luZG93Lm9uc2Nyb2xsID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciBjb3JyZWN0U2Nyb2xsID0gZS50YXJnZXQuc2Nyb2xsaW5nRWxlbWVudC5zY3JvbGxUb3AgLSBhc2lkZS5vZmZzZXRUb3AgKyBuYXYub2Zmc2V0SGVpZ2h0O1xuICAgICAgaWYgKGNvcnJlY3RTY3JvbGwgPCAwKSBzbGlkZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgwcHgpJztlbHNlIGlmIChjb3JyZWN0U2Nyb2xsID4gYXNpZGUub2Zmc2V0SGVpZ2h0IC0gc2xpZGUub2Zmc2V0SGVpZ2h0KSBzbGlkZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgnICsgKGFzaWRlLm9mZnNldEhlaWdodCAtIHNsaWRlLm9mZnNldEhlaWdodCkgKyAncHgpJztlbHNlIGlmIChjb3JyZWN0U2Nyb2xsID4gMCAmJiBjb3JyZWN0U2Nyb2xsIDwgYXNpZGUub2Zmc2V0SGVpZ2h0IC0gc2xpZGUub2Zmc2V0SGVpZ2h0KSBzbGlkZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgnICsgY29ycmVjdFNjcm9sbCArICdweCknO1xuICAgIH07XG4gIH07XG59O1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlX2I4MzNjYi5qc1wiLFwiL1wiKSJdfQ==
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xyXG4oZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XHJcbnZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XHJcblxyXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcclxuICAgID8gVWludDhBcnJheVxyXG4gICAgOiBBcnJheVxyXG5cclxuXHR2YXIgUExVUyAgID0gJysnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgTE9XRVIgID0gJ2EnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXHJcblx0dmFyIFNMQVNIX1VSTF9TQUZFID0gJ18nLmNoYXJDb2RlQXQoMClcclxuXHJcblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcclxuXHRcdHZhciBjb2RlID0gZWx0LmNoYXJDb2RlQXQoMClcclxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XHJcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcclxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xyXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XHJcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXHJcblx0XHRcdHJldHVybiA2MyAvLyAnLydcclxuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxyXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxyXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcclxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XHJcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXHJcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcclxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcclxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XHJcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxyXG5cclxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0JylcclxuXHRcdH1cclxuXHJcblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxyXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxyXG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXHJcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcclxuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2VcclxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXHJcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcclxuXHJcblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcclxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxyXG5cclxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcclxuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXHJcblxyXG5cdFx0dmFyIEwgPSAwXHJcblxyXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xyXG5cdFx0XHRhcnJbTCsrXSA9IHZcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XHJcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXHJcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcclxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxyXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xyXG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcclxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxyXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcclxuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXHJcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXHJcblx0XHRcdHB1c2godG1wICYgMHhGRilcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYXJyXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xyXG5cdFx0dmFyIGksXHJcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xyXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxyXG5cdFx0XHR0ZW1wLCBsZW5ndGhcclxuXHJcblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xyXG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcclxuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XHJcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXHJcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcclxuXHRcdH1cclxuXHJcblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXHJcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcclxuXHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxyXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXHJcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxyXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRwdXRcclxuXHR9XHJcblxyXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxyXG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcclxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxyXG5cclxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYmFzZTY0LWpzXFxcXGxpYlxcXFxiNjQuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYmFzZTY0LWpzXFxcXGxpYlwiKVxyXG59LHtcImJ1ZmZlclwiOjIsXCJlL1UrOTdcIjo0fV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcclxuLyohXHJcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxyXG4gKlxyXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cclxuICogQGxpY2Vuc2UgIE1JVFxyXG4gKi9cclxuXHJcbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxyXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxyXG5cclxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXHJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxyXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXHJcblxyXG4vKipcclxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxyXG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxyXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXHJcbiAqL1xyXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcclxuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxyXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcclxuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XHJcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcclxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XHJcbiAgdHJ5IHtcclxuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcclxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXHJcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxyXG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcclxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufSkoKVxyXG5cclxuLyoqXHJcbiAqIENsYXNzOiBCdWZmZXJcclxuICogPT09PT09PT09PT09PVxyXG4gKlxyXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcclxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXHJcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcclxuICogYSBzaW5nbGUgb2N0ZXQuXHJcbiAqXHJcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXHJcbiAqIHByb3RvdHlwZS5cclxuICovXHJcbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xyXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxyXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcclxuXHJcbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxyXG5cclxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXHJcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxyXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXHJcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XHJcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBGaW5kIHRoZSBsZW5ndGhcclxuICB2YXIgbGVuZ3RoXHJcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxyXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXHJcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXHJcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcclxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcclxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcclxuICBlbHNlXHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcclxuXHJcbiAgdmFyIGJ1ZlxyXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XHJcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXHJcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcclxuICAgIGJ1ZiA9IHRoaXNcclxuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcclxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXHJcbiAgfVxyXG5cclxuICB2YXIgaVxyXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XHJcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxyXG4gICAgYnVmLl9zZXQoc3ViamVjdClcclxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcclxuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxyXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXHJcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cclxuICAgIH1cclxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXHJcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgYnVmW2ldID0gMFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ1ZlxyXG59XHJcblxyXG4vLyBTVEFUSUMgTUVUSE9EU1xyXG4vLyA9PT09PT09PT09PT09PVxyXG5cclxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcclxuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgY2FzZSAnaGV4JzpcclxuICAgIGNhc2UgJ3V0ZjgnOlxyXG4gICAgY2FzZSAndXRmLTgnOlxyXG4gICAgY2FzZSAnYXNjaWknOlxyXG4gICAgY2FzZSAnYmluYXJ5JzpcclxuICAgIGNhc2UgJ2Jhc2U2NCc6XHJcbiAgICBjYXNlICdyYXcnOlxyXG4gICAgY2FzZSAndWNzMic6XHJcbiAgICBjYXNlICd1Y3MtMic6XHJcbiAgICBjYXNlICd1dGYxNmxlJzpcclxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcclxuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXHJcbn1cclxuXHJcbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcclxuICB2YXIgcmV0XHJcbiAgc3RyID0gc3RyICsgJydcclxuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xyXG4gICAgY2FzZSAnaGV4JzpcclxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3V0ZjgnOlxyXG4gICAgY2FzZSAndXRmLTgnOlxyXG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYXNjaWknOlxyXG4gICAgY2FzZSAnYmluYXJ5JzpcclxuICAgIGNhc2UgJ3Jhdyc6XHJcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2Jhc2U2NCc6XHJcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3VjczInOlxyXG4gICAgY2FzZSAndWNzLTInOlxyXG4gICAgY2FzZSAndXRmMTZsZSc6XHJcbiAgICBjYXNlICd1dGYtMTZsZSc6XHJcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxyXG4gIH1cclxuICByZXR1cm4gcmV0XHJcbn1cclxuXHJcbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcclxuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXHJcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxyXG5cclxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXHJcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xyXG4gICAgcmV0dXJuIGxpc3RbMF1cclxuICB9XHJcblxyXG4gIHZhciBpXHJcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcclxuICAgIHRvdGFsTGVuZ3RoID0gMFxyXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxyXG4gIHZhciBwb3MgPSAwXHJcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBpdGVtID0gbGlzdFtpXVxyXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxyXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXHJcbiAgfVxyXG4gIHJldHVybiBidWZcclxufVxyXG5cclxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxyXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XHJcbiAgaWYgKCFsZW5ndGgpIHtcclxuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxyXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xyXG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXHJcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcclxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXHJcblxyXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XHJcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXHJcbiAgfVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxyXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXHJcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXHJcbiAgfVxyXG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcclxuICByZXR1cm4gaVxyXG59XHJcblxyXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxyXG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxyXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cclxufVxyXG5cclxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XHJcbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxyXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cclxufVxyXG5cclxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG59XHJcblxyXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XHJcbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcclxuICByZXR1cm4gY2hhcnNXcml0dGVuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XHJcbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XHJcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcclxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcclxuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xyXG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxyXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcclxuICAgIH1cclxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XHJcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXHJcbiAgICBlbmNvZGluZyA9IG9mZnNldFxyXG4gICAgb2Zmc2V0ID0gbGVuZ3RoXHJcbiAgICBsZW5ndGggPSBzd2FwXHJcbiAgfVxyXG5cclxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXHJcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XHJcbiAgaWYgKCFsZW5ndGgpIHtcclxuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxyXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xyXG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcclxuICAgIH1cclxuICB9XHJcbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXHJcblxyXG4gIHZhciByZXRcclxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XHJcbiAgICBjYXNlICdoZXgnOlxyXG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3V0ZjgnOlxyXG4gICAgY2FzZSAndXRmLTgnOlxyXG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdhc2NpaSc6XHJcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdiaW5hcnknOlxyXG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2Jhc2U2NCc6XHJcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndWNzMic6XHJcbiAgICBjYXNlICd1Y3MtMic6XHJcbiAgICBjYXNlICd1dGYxNmxlJzpcclxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcclxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gICAgICBicmVha1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcclxuICB9XHJcbiAgcmV0dXJuIHJldFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XHJcbiAgdmFyIHNlbGYgPSB0aGlzXHJcblxyXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxyXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXHJcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgPyBOdW1iZXIoZW5kKVxyXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxyXG5cclxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXHJcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXHJcbiAgICByZXR1cm4gJydcclxuXHJcbiAgdmFyIHJldFxyXG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcclxuICAgIGNhc2UgJ2hleCc6XHJcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndXRmOCc6XHJcbiAgICBjYXNlICd1dGYtOCc6XHJcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2FzY2lpJzpcclxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2JpbmFyeSc6XHJcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYmFzZTY0JzpcclxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd1Y3MyJzpcclxuICAgIGNhc2UgJ3Vjcy0yJzpcclxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxyXG4gICAgY2FzZSAndXRmLTE2bGUnOlxyXG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxyXG4gIH1cclxuICByZXR1cm4gcmV0XHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0eXBlOiAnQnVmZmVyJyxcclxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxyXG4gIH1cclxufVxyXG5cclxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxyXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgc291cmNlID0gdGhpc1xyXG5cclxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcclxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXHJcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcclxuXHJcbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXHJcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxyXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxyXG5cclxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXHJcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcclxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcclxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxyXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxyXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcclxuXHJcbiAgLy8gQXJlIHdlIG9vYj9cclxuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXHJcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxyXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXHJcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcclxuXHJcbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XHJcblxyXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXHJcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxyXG4gIH0gZWxzZSB7XHJcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XHJcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xyXG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciByZXMgPSAnJ1xyXG4gIHZhciB0bXAgPSAnJ1xyXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcclxuXHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcclxuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xyXG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxyXG4gICAgICB0bXAgPSAnJ1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgcmV0ID0gJydcclxuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXHJcblxyXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxyXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxyXG4gIHJldHVybiByZXRcclxufVxyXG5cclxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcclxuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxyXG59XHJcblxyXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcblxyXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcclxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXHJcblxyXG4gIHZhciBvdXQgPSAnJ1xyXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XHJcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxyXG4gIH1cclxuICByZXR1cm4gb3V0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxyXG4gIHZhciByZXMgPSAnJ1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcclxuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcclxuICB9XHJcbiAgcmV0dXJuIHJlc1xyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcclxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXHJcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcclxuXHJcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcclxuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcclxuICB9IGVsc2Uge1xyXG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcclxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcclxuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3QnVmXHJcbiAgfVxyXG59XHJcblxyXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xyXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcclxuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcclxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxyXG59XHJcblxyXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xyXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcclxuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcclxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHJldHVybiB0aGlzW29mZnNldF1cclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdmFyIHZhbFxyXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcclxuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXHJcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcclxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcclxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxyXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXHJcbiAgfVxyXG4gIHJldHVybiB2YWxcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICB2YXIgdmFsXHJcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xyXG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXHJcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxyXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXHJcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxyXG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXHJcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcclxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXHJcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxyXG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXHJcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxyXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXHJcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cclxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcclxuICB9XHJcbiAgcmV0dXJuIHZhbFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXHJcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcclxuICBpZiAobmVnKVxyXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxyXG4gIGVsc2VcclxuICAgIHJldHVybiB0aGlzW29mZnNldF1cclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcclxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXHJcbiAgaWYgKG5lZylcclxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxyXG4gIGVsc2VcclxuICAgIHJldHVybiB2YWxcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXHJcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcclxuICBpZiAobmVnKVxyXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxyXG4gIGVsc2VcclxuICAgIHJldHVybiB2YWxcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxyXG4gIH1cclxuXHJcbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXHJcblxyXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xyXG4gICAgYnVmW29mZnNldCArIGldID1cclxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxyXG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcclxuICB9XHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xyXG4gICAgYnVmW29mZnNldCArIGldID1cclxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXHJcbiAgfVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcclxuICB9XHJcblxyXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgKHZhbHVlID49IDApXHJcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXHJcbiAgZWxzZVxyXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgKHZhbHVlID49IDApXHJcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxyXG4gIGVsc2VcclxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmICh2YWx1ZSA+PSAwKVxyXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcclxuICBlbHNlXHJcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxyXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcclxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XHJcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXHJcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXHJcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXHJcblxyXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcclxuICB9XHJcblxyXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxyXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXHJcblxyXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxyXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cclxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxyXG5cclxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXHJcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcclxuXHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcclxuICAgIHRoaXNbaV0gPSB2YWx1ZVxyXG4gIH1cclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBvdXQgPSBbXVxyXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXHJcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xyXG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcclxuICAgICAgYnJlYWtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXHJcbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxyXG4gKi9cclxuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xyXG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XHJcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXHJcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxyXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcclxuICB9XHJcbn1cclxuXHJcbi8vIEhFTFBFUiBGVU5DVElPTlNcclxuLy8gPT09PT09PT09PT09PT09PVxyXG5cclxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XHJcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxyXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXHJcbn1cclxuXHJcbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcclxuXHJcbi8qKlxyXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXHJcbiAqL1xyXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XHJcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcclxuXHJcbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXHJcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XHJcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XHJcblxyXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXHJcbiAgYXJyLmdldCA9IEJQLmdldFxyXG4gIGFyci5zZXQgPSBCUC5zZXRcclxuXHJcbiAgYXJyLndyaXRlID0gQlAud3JpdGVcclxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xyXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXHJcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxyXG4gIGFyci5jb3B5ID0gQlAuY29weVxyXG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXHJcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxyXG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcclxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXHJcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxyXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcclxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxyXG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXHJcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcclxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxyXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXHJcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcclxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxyXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcclxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXHJcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XHJcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXHJcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXHJcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXHJcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXHJcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxyXG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcclxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXHJcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxyXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcclxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXHJcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxyXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxyXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxyXG4gIGFyci5maWxsID0gQlAuZmlsbFxyXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxyXG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxyXG5cclxuICByZXR1cm4gYXJyXHJcbn1cclxuXHJcbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXHJcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcclxuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxyXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxyXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cclxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XHJcbiAgaW5kZXggKz0gbGVuXHJcbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxyXG4gIHJldHVybiAwXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XHJcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcclxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcclxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cclxuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxyXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxyXG59XHJcblxyXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XHJcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXHJcbiAgfSkoc3ViamVjdClcclxufVxyXG5cclxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xyXG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxyXG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxyXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvSGV4IChuKSB7XHJcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXHJcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcclxuICB2YXIgYnl0ZUFycmF5ID0gW11cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxyXG4gICAgaWYgKGIgPD0gMHg3RilcclxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXHJcbiAgICBlbHNlIHtcclxuICAgICAgdmFyIHN0YXJ0ID0gaVxyXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xyXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcclxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBieXRlQXJyYXlcclxufVxyXG5cclxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcclxuICB2YXIgYnl0ZUFycmF5ID0gW11cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xyXG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXHJcbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXHJcbiAgfVxyXG4gIHJldHVybiBieXRlQXJyYXlcclxufVxyXG5cclxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xyXG4gIHZhciBjLCBoaSwgbG9cclxuICB2YXIgYnl0ZUFycmF5ID0gW11cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xyXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXHJcbiAgICBoaSA9IGMgPj4gOFxyXG4gICAgbG8gPSBjICUgMjU2XHJcbiAgICBieXRlQXJyYXkucHVzaChsbylcclxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ5dGVBcnJheVxyXG59XHJcblxyXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcclxuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcclxufVxyXG5cclxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgdmFyIHBvc1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcclxuICAgICAgYnJlYWtcclxuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxyXG4gIH1cclxuICByZXR1cm4gaVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcclxuICB9XHJcbn1cclxuXHJcbi8qXHJcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XHJcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XHJcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxyXG4gKi9cclxuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XHJcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcclxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcclxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXHJcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50JylcclxufVxyXG5cclxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcclxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxyXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxyXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcclxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxyXG59XHJcblxyXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xyXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXHJcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXHJcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxyXG59XHJcblxyXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcclxuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcclxufVxyXG5cclxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYnVmZmVyXFxcXGluZGV4LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJ1ZmZlclwiKVxyXG59LHtcImJhc2U2NC1qc1wiOjEsXCJidWZmZXJcIjoyLFwiZS9VKzk3XCI6NCxcImllZWU3NTRcIjozfV0sMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcclxuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcclxuICB2YXIgZSwgbVxyXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXHJcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcclxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcclxuICB2YXIgbkJpdHMgPSAtN1xyXG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcclxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcclxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxyXG5cclxuICBpICs9IGRcclxuXHJcbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcclxuICBzID4+PSAoLW5CaXRzKVxyXG4gIG5CaXRzICs9IGVMZW5cclxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxyXG5cclxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxyXG4gIGUgPj49ICgtbkJpdHMpXHJcbiAgbkJpdHMgKz0gbUxlblxyXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XHJcblxyXG4gIGlmIChlID09PSAwKSB7XHJcbiAgICBlID0gMSAtIGVCaWFzXHJcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XHJcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcclxuICB9IGVsc2Uge1xyXG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxyXG4gICAgZSA9IGUgLSBlQmlhc1xyXG4gIH1cclxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxyXG59XHJcblxyXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XHJcbiAgdmFyIGUsIG0sIGNcclxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxyXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXHJcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXHJcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxyXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcclxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcclxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxyXG5cclxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxyXG5cclxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xyXG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXHJcbiAgICBlID0gZU1heFxyXG4gIH0gZWxzZSB7XHJcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcclxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcclxuICAgICAgZS0tXHJcbiAgICAgIGMgKj0gMlxyXG4gICAgfVxyXG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XHJcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcclxuICAgICAgZSsrXHJcbiAgICAgIGMgLz0gMlxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xyXG4gICAgICBtID0gMFxyXG4gICAgICBlID0gZU1heFxyXG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xyXG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcclxuICAgICAgZSA9IGUgKyBlQmlhc1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXHJcbiAgICAgIGUgPSAwXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxyXG5cclxuICBlID0gKGUgPDwgbUxlbikgfCBtXHJcbiAgZUxlbiArPSBtTGVuXHJcbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxyXG5cclxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcclxufVxyXG5cclxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcaWVlZTc1NFxcXFxpbmRleC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxpZWVlNzU0XCIpXHJcbn0se1wiYnVmZmVyXCI6MixcImUvVSs5N1wiOjR9XSw0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcclxuKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xyXG4vLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcclxuXHJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcclxuXHJcbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXHJcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xyXG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xyXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXHJcbiAgICA7XHJcblxyXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjYW5Qb3N0KSB7XHJcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcclxuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcclxuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XHJcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBmbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xyXG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcclxuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5cclxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcclxucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcclxucHJvY2Vzcy5lbnYgPSB7fTtcclxucHJvY2Vzcy5hcmd2ID0gW107XHJcblxyXG5mdW5jdGlvbiBub29wKCkge31cclxuXHJcbnByb2Nlc3Mub24gPSBub29wO1xyXG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcclxucHJvY2Vzcy5vbmNlID0gbm9vcDtcclxucHJvY2Vzcy5vZmYgPSBub29wO1xyXG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcclxucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xyXG5wcm9jZXNzLmVtaXQgPSBub29wO1xyXG5cclxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcclxufVxyXG5cclxuLy8gVE9ETyhzaHR5bG1hbilcclxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcclxucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XHJcbn07XHJcblxyXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXFxcXGJyb3dzZXIuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxccHJvY2Vzc1wiKVxyXG59LHtcImJ1ZmZlclwiOjIsXCJlL1UrOTdcIjo0fV0sNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGluc3RhbmNlcyA9IHt9O1xyXG5cclxuSFRNTEVsZW1lbnQucHJvdG90eXBlLnVwZGF0ZVRvID0gZnVuY3Rpb24oY29udGVudCkge1xyXG4gIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIHRoaXMuaW5uZXJIVE1MID0gY29udGVudDtcclxuICBlbHNlIGlmIChjb250ZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcclxuICAgIHRoaXMuaW5uZXJIVE1MID0gJyc7XHJcbiAgICB0aGlzLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBzZXJpYWxpemVGb3JtKGZvcm0pIHtcclxuICByZXR1cm4gQXJyYXkuZnJvbShmb3JtKS5yZWR1Y2UoKHJlc3VsdCwgaW5wdXQpID0+IHtcclxuICAgIGlmIChpbnB1dC50eXBlICE9PSAnc3VibWl0JykgcmVzdWx0W2lucHV0Lm5hbWVdID0gaW5wdXQudmFsdWU7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sIHt9KTtcclxufVxyXG5mdW5jdGlvbiBzZWN1cmVOdW1JbnB1dChtYXgsIG1pbiwgc3RlcCA9IDEpIHtcclxuICByZXR1cm4gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKChlLmtleUNvZGUgPCA0OCB8fCBlLmtleUNvZGUgPiA1NykgJiYgIShbOCwgNDYsIDM3LCAzOSwgMTNdLmluZGV4T2YoZS5rZXlDb2RlKSArIDEpKSB7XHJcbiAgICAgIGlmIChlLmtleUNvZGUgPT0gMzggJiYgZS50YXJnZXQudmFsdWUgPCBtYXggLSBzdGVwKVxyXG4gICAgICAgIGUudGFyZ2V0LnZhbHVlID0gK2UudGFyZ2V0LnZhbHVlICsgc3RlcDtcclxuICAgICAgaWYgKGUua2V5Q29kZSA9PSA0MCAmJiBlLnRhcmdldC52YWx1ZSA+IG1pbiArIHN0ZXApXHJcbiAgICAgICAgZS50YXJnZXQudmFsdWUgPSArZS50YXJnZXQudmFsdWUgLSBzdGVwO1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbmNsYXNzIFN0b3JlIHtcclxuICBjb25zdHJ1Y3Rvcih1cmxUb0pTT04gPSBmYWxzZSwgY29udGFpbmVyUXVlcnkgPSBmYWxzZSkge1xyXG4gICAgaW5zdGFuY2VzLnN0b3JlID0gdGhpcztcclxuICAgIHRoaXMudXJsVG9TdWJtaXQgPSAnLyc7XHJcbiAgICB0aGlzLmNvbnRhaW5lciA9IHtcclxuICAgICAgYmFza2V0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lclF1ZXJ5ICsgJyBhc2lkZSAuYmFza2V0LWNvbnRhaW5lcicpLFxyXG4gICAgICBmaWx0ZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyUXVlcnkgKyAnIGFzaWRlIC5maWx0ZXItY29udGFpbmVyJyksXHJcbiAgICAgIGFydGljbGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyUXVlcnkgKyAnIGFydGljbGUnKVxyXG4gICAgfTtcclxuICAgIHRoaXMuZmlsdGVyID0gZmFsc2U7XHJcbiAgICB0aGlzLmJhc2tldCA9IGZhbHNlO1xyXG4gICAgdGhpcy5tb2RhbCAgPSBuZXcgTW9kYWwoJyNtb2RhbGJveCcpO1xyXG5cclxuICAgIC8vIEdldHRpbmcgSlNPTiB3aXRoIHByb2R1Y3RzXHJcbiAgICBmZXRjaCh1cmxUb0pTT04pXHJcbiAgICAgIC50aGVuKGRhdGEgPT4gZGF0YS5qc29uKCkpXHJcbiAgICAgIC50aGVuKGpzb24gPT4ge1xyXG4gICAgICAgIHRoaXMucHJvZHVjdHMgPSBqc29uLnByb2R1Y3RzLm1hcCgocHJvZHVjdCwgaW5kZXgpID0+IG5ldyBQcm9kdWN0KHByb2R1Y3QsIGluZGV4KSk7XHJcbiAgICAgICAgdGhpcy5leGNoYW5nZUNvdXJzZSA9IGpzb24uZXhjaGFuZ2VDb3Vyc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKCgpID0+IHRoaXMuYnVpbGQoKSk7XHJcbiAgfVxyXG4gIGJ1aWxkKCkge1xyXG4gICAgLy8gc2Vzc2lvblN0b3JhZ2VcclxuICAgIGxldCBhY3RpdmVTaGlwbWVudHMgPSB0aGlzLnByb2R1Y3RzLmZpbHRlcihpdGVtID0+ICEhaXRlbS5hbW1vdW50KTsgLy8ucmVkdWNlKGl0ZW0gPT4ge3JldHVybntpZDppdGVtLnByb3BzLmlkLCBhbW1vdW50OiBpdGVtLmFtbW91bnR9fSkgfHwgW107XHJcbiAgICBpZiAoYWN0aXZlU2hpcG1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIGFjdGl2ZVNoaXBtZW50cyA9IEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnc2VsZWN0ZWQnKSkgfHwgW107XHJcbiAgICAgICAgaWYgKGFjdGl2ZVNoaXBtZW50cy5sZW5ndGggIT0gMCkgYWN0aXZlU2hpcG1lbnRzLm1hcChpdGVtID0+IHRoaXMucHJvZHVjdHNbaXRlbS5pZF0uYW1tb3VudCA9IGl0ZW0uYW1tb3VudCApO1xyXG4gICAgfSBlbHNlIHtzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdzZWxlY3RlZCcsIEpTT04uc3RyaW5naWZ5KHRoaXMucHJvZHVjdHMuZmlsdGVyKGl0ZW0gPT4gISFpdGVtLmFtbW91bnQpLnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe2lkOml0ZW0ucHJvcHMuaWQsIGFtbW91bnQ6IGl0ZW0uYW1tb3VudH0pO1xyXG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH0sW10pKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9Jbml0aWFsaXppbmcgZmlsdGVyICYgYmFza2V0XHJcbiAgICBpZiAoIXRoaXMuZmlsdGVyKSB0aGlzLmZpbHRlciA9IG5ldyBGaWx0ZXIodGhpcy5jb250YWluZXIuZmlsdGVyLCB0aGlzLnByb2R1Y3RzLCB0aGlzLmJ1aWxkLmJpbmQodGhpcykpO1xyXG4gICAgaWYgKCF0aGlzLmJhc2tldCkgdGhpcy5iYXNrZXQgPSBuZXcgQmFza2V0KHRoaXMuY29udGFpbmVyLmJhc2tldCk7XHJcblxyXG4gICAgdGhpcy5jb250YWluZXIuYXJ0aWNsZS5pbm5lckhUTUwgPSAnJztcclxuICAgIHRoaXMuZmlsdGVyLnNvcnQodGhpcy5wcm9kdWN0cykubWFwKGl0ZW0gPT4gdGhpcy5jb250YWluZXIuYXJ0aWNsZS5hcHBlbmRDaGlsZChpdGVtLnJlbmRlcigpKSk7XHJcbiAgICBpZiAodGhpcy5jb250YWluZXIuYXJ0aWNsZS5jaGlsZHJlbi5sZW5ndGggPT0gMCkgdGhpcy5jb250YWluZXIuYXJ0aWNsZS5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJuby1kYXRhXCI+0J/QviDQtNCw0L3QvdC+0LzRgyDRhNC40LvRjNGC0YDRgyDRgtC+0LLQsNGA0L7QsiDQvdC10YI8L3A+JztcclxuXHJcblxyXG4gICAgLy8gY2FsbGJhY2tcclxuICAgIGlmICh0aGlzLm9uTG9hZCkgdGhpcy5vbkxvYWQoKTtcclxuICB9XHJcbiAgc2VuZChkYXRhKSB7XHJcbiAgICB0aGlzLm1vZGFsLnRvZ2dsZSgpO1xyXG4gICAgZGF0YS5zaGlwbWVudHMgPSB0aGlzLnByb2R1Y3RzLmZpbHRlcihpdGVtID0+ICEhaXRlbS5hbW1vdW50KS5yZWR1Y2UoKHN1bSwgaXRlbSkgPT4ge1xyXG4gICAgICAgIHN1bS5wdXNoKHtuYW1lOml0ZW0ucHJvcHMubmFtZSwgYW1tb3VudDogaXRlbS5hbW1vdW50fSlcclxuICAgICAgICBpdGVtLmFtbW91bnQgPSAwO1xyXG4gICAgICAgIHJldHVybiBzdW07XHJcbiAgICAgIH0sW10pO1xyXG4gICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgnc2VsZWN0ZWQnKTtcclxuICAgIHRoaXMuYnVpbGQoKTtcclxuICAgIGluc3RhbmNlcy5iYXNrZXQucmVuZGVyKCk7XHJcbiAgICAvLyBmZXRjaCh0aGlzLnVybFRvU3VibWl0LCB7XHJcbiAgICAvLyAgIG1ldGhvZDogJ3Bvc3QnLFxyXG4gICAgLy8gICBoZWFkZXJzOiB7XHJcbiAgICAvLyAgICAgXCJDb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLThcIlxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKVxyXG4gICAgLy8gfSlcclxuICAgIC8vIC50aGVuKGRhdGEgPT4gZGF0YS5qc29uKCkpXHJcbiAgICAvLyAudGhlbihkYXRhID0+IHtcclxuICAgIC8vICAgY29uc29sZS5sb2coJ1JlcXVlc3Qgc3VjY2VlZGVkIHdpdGggSlNPTiByZXNwb25zZScsIGRhdGEpO1xyXG4gICAgLy8gfSlcclxuICAgIC8vIC5jYXRjaChlcnJvciA9PiB7XHJcbiAgICAvLyAgIGNvbnNvbGUubG9nKCdSZXF1ZXN0IGZhaWxlZCcsIGVycm9yKTtcclxuICAgIC8vIH0pO1xyXG5cclxuICB9XHJcblxyXG59XHJcbmNsYXNzIE1vZGFsIHtcclxuICBjb25zdHJ1Y3Rvcihjb250YWluZXJRdWVyeSkge1xyXG4gICAgaW5zdGFuY2VzLm1vZGFsID0gdGhpcztcclxuICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJRdWVyeSk7XHJcbiAgICB0aGlzLmNvbnRlbnQgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY29udGVudCcpO1xyXG4gICAgdGhpcy5jYXB0aW9uID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLmNhcHRpb24nKTtcclxuICAgIHRoaXMub3BlbiA9IGZhbHNlO1xyXG4gICAgLy8gRE9NIHByZXByYXJ0aW9uc1xyXG4gICAgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLmNsb3NlJykub25jbGljayA9IHRoaXMudG9nZ2xlLmJpbmQodGhpcyk7XHJcblxyXG4gICAgLy8gY2FsbGJhY2tzXHJcbiAgICB0aGlzLm9uT3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5vbkNsb3NlID0gZmFsc2U7XHJcbiAgICB0aGlzLm9uUmVuZGVyID0gZmFsc2U7XHJcbiAgfVxyXG4gIHRvZ2dsZSgpIHtcclxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSgnbW9kYWxtb2RlJyk7XHJcbiAgICB0aGlzLm9wZW4gPSAhdGhpcy5vcGVuO1xyXG4gICAgaWYgKHRoaXMub3BlbiAmJiB0aGlzLm9uT3BlbikgdGhpcy5vbk9wZW4oKTtcclxuICAgIGVsc2UgaWYodGhpcy5vbkNsb3NlKSB0aGlzLm9uQ2xvc2UoKTtcclxuICB9XHJcbiAgcmVuZGVyKHBhZ2VOYW1lLCBpbm5lckhUTUwpIHtcclxuICAgIHRoaXMuY29udGVudC51cGRhdGVUbyhpbm5lckhUTUwpO1xyXG4gICAgdGhpcy5jYXB0aW9uLnVwZGF0ZVRvKHBhZ2VOYW1lKTtcclxuICAgIGlmICh0aGlzLm9uUmVuZGVyKSB0aGlzLm9uUmVuZGVyKCk7XHJcbiAgICBpZiAoIXRoaXMub3BlbikgdGhpcy50b2dnbGUoKTtcclxuICB9XHJcbn1cclxuY2xhc3MgUHJvZHVjdCB7XHJcbiAgY29uc3RydWN0b3IoZGF0YSwgaWQpIHtcclxuICAgIHRoaXMuYW1tb3VudCA9IDA7XHJcbiAgICB0aGlzLnByb3BzID0gZGF0YTtcclxuICAgIHRoaXMucHJvcHMuaWQgPSBpZDtcclxuICAgIHRoaXMuY3VycmVuY3lDb2RlID0ge1xyXG4gICAgICByOiAnODM4MScsXHJcbiAgICAgIGc6ICc4MzcyJyxcclxuICAgICAgZDogJzM2J1xyXG4gICAgfVxyXG4gIH1cclxuICBnZXRDdXJyZW5jeSgpIHtcclxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHRoaXMuY3VycmVuY3lDb2RlW3RoaXMucHJvcHMuY3VycmVuY3ldKVxyXG4gIH1cclxuICByZW5kZXIobW9kZSA9IGZhbHNlKSB7XHJcbiAgICBsZXQgY3VycmVuY3kgPSB0aGlzLmdldEN1cnJlbmN5KCksXHJcbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuICAgICAgICBpbkJhc2tldCA9ICEhdGhpcy5hbW1vdW50ID8gJ2luLWJhc2tldCcgOiAnJyxcclxuICAgICAgICBidXR0b25UZXh0ID0gISF0aGlzLmFtbW91bnQgPyBg0JIg0LrQvtGA0LfQuNC90LUgKCR7dGhpcy5hbW1vdW50fSlgIDogJ9Ca0YPQv9C40YLRjCc7XHJcblxyXG4gICAgaWYgKG1vZGUgPT09ICdiYXNrZXQnKSB7XHJcblxyXG4gICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIml0ZW1cIj5cclxuICAgICAgICAgIDxpbWcgc3JjPVwiJHt0aGlzLnByb3BzLmltYWdlfVwiIGFsdD1cIiR7dGhpcy5wcm9wcy5uYW1lfVwiIC8+XHJcbiAgICAgICAgICA8cD4ke3RoaXMucHJvcHMubmFtZX08L3A+XHJcbiAgICAgICAgICAgIDxwPlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHJpY2VcIj4ke3RoaXMucHJvcHMucHJpY2V9ICR7Y3VycmVuY3l9PC9zcGFuPiB4XHJcbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiYW1tb3VudFwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIke3RoaXMuYW1tb3VudH1cIiAvPiA9XHJcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJyZXN1bHQtcHJpY2VcIj4ke3RoaXMucHJvcHMucHJpY2UgKiB0aGlzLmFtbW91bnR9ICR7Y3VycmVuY3l9PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJyZW1vdmVcIj7Qo9C00LDQu9C40YLRjDwvYnV0dG9uPlxyXG5cclxuICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICBgO1xyXG5cclxuICAgICAgLy8gQUNUSU9OU1xyXG4gICAgICBsZXQgYW1tb3VudCA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5hbW1vdW50JyksXHJcbiAgICAgICAgICByZXN1bHRQcmljZSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5yZXN1bHQtcHJpY2UnKSxcclxuICAgICAgICAgIHJlbW92ZSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5yZW1vdmUnKTtcclxuXHJcbiAgICAgIGFtbW91bnQub25rZXlkb3duID0gc2VjdXJlTnVtSW5wdXQoMTAwLCAwLCAxKTtcclxuICAgICAgYW1tb3VudC5vbmtleXVwID0gZSA9PiB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHJlc3VsdFByaWNlLmlubmVySFRNTCA9ICh0aGlzLmFtbW91bnQgPSArYW1tb3VudC52YWx1ZSkgKiB0aGlzLnByb3BzLnByaWNlICsgJyAnICsgY3VycmVuY3k7XHJcbiAgICAgICAgaW5zdGFuY2VzLmJhc2tldC5yZW5kZXIoKTtcclxuICAgICAgICBpbnN0YW5jZXMuc3RvcmUuYnVpbGQoKTtcclxuICAgICAgICBpbnN0YW5jZXMuYmFza2V0LnJlY291bnQoKTtcclxuICAgICAgfVxyXG4gICAgICByZW1vdmUub25jbGljayA9IGUgPT4ge1xyXG4gICAgICAgIHRoaXMuYW1tb3VudCA9IDA7XHJcbiAgICAgICAgaW5zdGFuY2VzLmJhc2tldC5yZW5kZXIoKTtcclxuICAgICAgICBpbnN0YW5jZXMuYmFza2V0LmNoZWNrb3V0KCk7XHJcbiAgICAgICAgaW5zdGFuY2VzLnN0b3JlLmJ1aWxkKCk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IGBcclxuICAgICAgICA8ZmlndXJlIGNsYXNzPVwicHJvZHVjdCAke2luQmFza2V0fVwiPlxyXG4gICAgICAgICAgPGltZyBzcmM9XCIke3RoaXMucHJvcHMuaW1hZ2V9XCIgYWx0PVwiJHt0aGlzLnByb3BzLm5hbWV9XCIgLz5cclxuICAgICAgICAgIDxoMz4ke3RoaXMucHJvcHMubmFtZX08L2gzPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsXCI+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHJpY2VcIj4ke3RoaXMucHJvcHMucHJpY2V9ICR7Y3VycmVuY3l9PC9zcGFuPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnV5XCI+JHtidXR0b25UZXh0fTwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9maWd1cmU+XHJcbiAgICAgIGA7XHJcblxyXG4gICAgICAvLyBBQ1RJT05TXHJcbiAgICAgIGxldCBjb250YWluZXIgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdCcpLFxyXG4gICAgICAgICAgYnV5ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmJ1eScpO1xyXG5cclxuICAgICAgYnV5Lm9uY2xpY2sgPSBlID0+IHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgaW5zdGFuY2VzLmJhc2tldC5zaG93KHRoaXMpO1xyXG4gICAgICAgIGluc3RhbmNlcy5iYXNrZXQucmVuZGVyKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgcmV0dXJuIHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkO1xyXG4gIH1cclxufVxyXG5jbGFzcyBCYXNrZXQge1xyXG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lcikge1xyXG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XHJcbiAgICBpbnN0YW5jZXMuYmFza2V0ID0gdGhpcztcclxuICAgIHRoaXMucmVuZGVyKCk7XHJcblxyXG4gIH1cclxuICBzaG93KHByb2R1Y3QpIHtcclxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG4gICAgICAgIGN1cnJlbmN5ID0gU3RyaW5nLmZyb21DaGFyQ29kZShwcm9kdWN0LmN1cnJlbmN5Q29kZVtwcm9kdWN0LnByb3BzLmN1cnJlbmN5XSksXHJcbiAgICAgICAgZGVsZXRlUHJvZHVjdCA9ICEhcHJvZHVjdC5hbW1vdW50ID8gJzxidXR0b24gY2xhc3M9XCJyZW1vdmVcIj7Qo9C00LDQu9C40YLRjDwvYnV0dG9uPicgOiAnJyxcclxuICAgICAgICBidXlQcm9kdWN0ID0gISFwcm9kdWN0LmFtbW91bnQgPyAn0JjQt9C80LXQvdC40YLRjCcgOiAn0JIg0LrQvtGA0LfQuNC90YMnO1xyXG5cclxuICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJiYXNrZXQtcHJvZHVjdFwiPlxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8cCBjbGFzcz1cImRlc2NyaXB0aW9uXCI+XHJcbiAgICAgICAgICAgICR7cHJvZHVjdC5wcm9wcy5kZXNjcmlwdGlvbiB8fCBgPGRpdiBjbGFzcz1cIm5vLWRhdGFcIj7QndC10YIg0L7Qv9C40YHQsNC90LjRjzwvZGl2PmB9XHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxpbWcgc3JjPVwiJHtwcm9kdWN0LnByb3BzLmltYWdlfVwiIGFsdD1cIiR7cHJvZHVjdC5wcm9wcy5uYW1lfVwiIHRpdGxlPVwi0JrRg9C/0LjRgtGMICR7cHJvZHVjdC5wcm9wcy5uYW1lfSFcIiAvPlxyXG4gICAgICAgICAgPHA+PHNwYW4gY2xhc3M9XCJwcmljZVwiPiR7cHJvZHVjdC5wcm9wcy5wcmljZX0gJHtjdXJyZW5jeX08L3NwYW4+PC9wPlxyXG4gICAgICAgICAgPHA+PGZvcm0+PGlucHV0IGNsYXNzPVwiYW1tb3VudFwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIke3Byb2R1Y3QuYW1tb3VudCB8fCAxfVwiIG1heGxlbmd0aD1cIjJcIiAvPjwvZm9ybT48L3A+XHJcbiAgICAgICAgICA8cD48YnV0dG9uIGNsYXNzPVwiYnV5XCI+JHtidXlQcm9kdWN0fTwvYnV0dG9uPiR7ZGVsZXRlUHJvZHVjdH08L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXY+XHJcbiAgICBgO1xyXG5cclxuICAgIC8vIEFDVElPTlNcclxuICAgIGxldCBhbW1vdW50ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmFtbW91bnQnKSxcclxuICAgICAgICBmb3JtID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignZm9ybScpLFxyXG4gICAgICAgIGJ1eSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5idXknKSxcclxuICAgICAgICByZW1vdmUgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcucmVtb3ZlJykgfHwgZmFsc2UsXHJcbiAgICAgICAgY2hhbmdlQW1tb3VudCA9ICh2YWx1ZSA9IGZhbHNlKSA9PiBlID0+IHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIHByb2R1Y3QuYW1tb3VudCA9ICh2YWx1ZSAhPT0gZmFsc2UpID8gdmFsdWUgOiArYW1tb3VudC52YWx1ZTtcclxuICAgICAgICAgIGluc3RhbmNlcy5tb2RhbC50b2dnbGUoKTtcclxuICAgICAgICAgIGluc3RhbmNlcy5zdG9yZS5idWlsZCgpO1xyXG4gICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIGFtbW91bnQub25rZXlkb3duID0gc2VjdXJlTnVtSW5wdXQoMTAwLCAwLCAxKTtcclxuICAgIGJ1eS5vbmNsaWNrID0gZm9ybS5vbnN1Ym1pdCA9IGNoYW5nZUFtbW91bnQoKTtcclxuICAgIGlmIChyZW1vdmUpIHJlbW92ZS5vbmNsaWNrID0gY2hhbmdlQW1tb3VudCgwKTtcclxuXHJcbiAgICBpbnN0YW5jZXMubW9kYWwucmVuZGVyKCfQodGC0YDQsNC90LjRhtCwINGC0L7QstCw0YDQsCcsIHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkKTtcclxuICAgIGFtbW91bnQuZm9jdXMoKTtcclxuICB9XHJcbiAgY2hlY2tvdXQoKSB7XHJcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuICAgICAgICBwcm9kdWN0cyA9IGluc3RhbmNlcy5zdG9yZS5wcm9kdWN0cy5maWx0ZXIoaXRlbSA9PiAhIWl0ZW0uYW1tb3VudCksXHJcbiAgICAgICAgcHJvZHVjdENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuICAgIC8vIElmIGJhc2tldCBlbXB0eSwgY2xvc2VpbmcgaXRcclxuICAgIGlmIChwcm9kdWN0cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgaW5zdGFuY2VzLm1vZGFsLnRvZ2dsZSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcHJvZHVjdHMubWFwKGl0ZW0gPT4gcHJvZHVjdENvbnRhaW5lci5hcHBlbmRDaGlsZChpdGVtLnJlbmRlcignYmFza2V0JykpKTtcclxuXHJcbiAgICBsZXQgdG90YWxQcmljZSA9IHByb2R1Y3RzLnJlZHVjZSgoc3VtLCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICBpZiAoISFpdGVtLmFtbW91bnQpIHN1bSArPSBpdGVtLmFtbW91bnQgKiBpdGVtLnByb3BzLnByaWNlO1xyXG4gICAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgICAgICB9LCAwKSxcclxuICAgICAgICBjdXJyZW5jeSA9IHByb2R1Y3RzWzBdLmdldEN1cnJlbmN5KCk7XHJcblxyXG4gICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwiYmFza2V0LWNoZWNrb3V0XCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImxpc3RcIj5cclxuXHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0b3RhbC1wcmljZVwiPlxyXG4gICAgICAgICAgICDQntCx0YnQsNGPINGB0YPQvNC80LBcclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2YWx1ZVwiPiR7dG90YWxQcmljZX0gJHtjdXJyZW5jeX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGZvcm0+XHJcbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cIm5hbWVcIiBwbGFjZWhvbGRlcj1cIiog0JjQvNGPLi4uXCIgcmVxdWlyZWQgLz5cclxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwicGhvbmVcIiBwbGFjZWhvbGRlcj1cIiog0KLQtdC70LXRhNC+0L0uLi5cIiByZXF1aXJlZCAvPlxyXG4gICAgICAgICAgICAgIDx0ZXh0YXJlYSBuYW1lPVwiY29tbWVudFwiIHBsYWNlaG9sZGVyPVwi0JrQvtC80LXQvdGC0LDRgNC40Lkg0Log0LfQsNC60LDQt9GDLi4uXCI+PC90ZXh0YXJlYT5cclxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwi0J7RgtC/0YDQsNCy0LjRgtGMXCIgLz5cclxuICAgICAgICAgICAgPC9mb3JtPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcblxyXG4gICAgLy8gQUNUSU9OU1xyXG4gICAgbGV0IGxpc3QgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcubGlzdCcpLFxyXG4gICAgICAgIGZvcm0gPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XHJcblxyXG4gICAgbGlzdC5hcHBlbmRDaGlsZChwcm9kdWN0Q29udGFpbmVyKTtcclxuICAgIGZvcm0ub25zdWJtaXQgPSBlID0+IHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBpbnN0YW5jZXMuc3RvcmUuc2VuZChzZXJpYWxpemVGb3JtKGUuY3VycmVudFRhcmdldC5lbGVtZW50cykpO1xyXG4gICAgfVxyXG5cclxuICAgIGluc3RhbmNlcy5tb2RhbC5yZW5kZXIoJ9Ce0YTQvtGA0LzQu9C10L3QuNC1INC30LDQutCw0LfQsCcsIHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkKTtcclxuICB9XHJcbiAgcmVjb3VudCgpIHtcclxuICAgIGxldCBjdXJyZW5jeSA9IGluc3RhbmNlcy5zdG9yZS5wcm9kdWN0c1swXS5nZXRDdXJyZW5jeSgpLFxyXG4gICAgICAgIHRvdGFsUHJpY2UgPSBpbnN0YW5jZXMuc3RvcmUucHJvZHVjdHMucmVkdWNlKChzdW0sIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICBpZiAoISFpdGVtLmFtbW91bnQpIHN1bSArPSBpdGVtLmFtbW91bnQgKiBpdGVtLnByb3BzLnByaWNlO1xyXG4gICAgICAgICAgICAgIHJldHVybiBzdW07XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvdGFsLXByaWNlIC52YWx1ZScpLmlubmVySFRNTCA9IHRvdGFsUHJpY2UgKyAnICcgKyBjdXJyZW5jeTtcclxuXHJcblxyXG4gIH1cclxuICByZW5kZXIoKSB7XHJcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuICAgICAgICBhbW1vdW50ID0gaW5zdGFuY2VzLnN0b3JlLnByb2R1Y3RzLnJlZHVjZSgoc3VtLCBpdGVtKSA9PiAgc3VtICsgaXRlbS5hbW1vdW50ICogaXRlbS5wcm9wcy5wcmljZSwgMCksXHJcbiAgICAgICAgY291bnQgPSBpbnN0YW5jZXMuc3RvcmUucHJvZHVjdHMucmVkdWNlKChzdW0sIGl0ZW0pID0+ICBzdW0gKyBpdGVtLmFtbW91bnQsIDApLFxyXG4gICAgICAgIHJlc3BvbnNlID0gISFhbW1vdW50ID8gYDxwPiR7Y291bnR9INGC0L7QstCw0YAo0L7Qsikg0L3QsCDRgdGD0LzQvNGDOjxiciAvPjxzcGFuIGNsYXNzPVwicHJpY2VcIj4gJHthbW1vdW50fSDRgNGD0LHQu9C10Lk8L3NwYW4+PC9wPjxidXR0b24gY2xhc3M9XCJhY3Rpb25cIj7QntGE0L7RgNC80LjRgtGMPC9idXR0b24+YCA6ICc8ZGl2IGNsYXNzPVwibm8tZGF0YVwiPtCf0YPRgdGC0L48L2Rpdj4nXHJcblxyXG4gICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IGlkPVwiYmFza2V0XCI+XHJcbiAgICAgICAgPGgzPtCa0L7RgNC30LjQvdCwPC9oMz5cclxuICAgICAgICAke3Jlc3BvbnNlfVxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcblxyXG4gICAgLy8gQUNUSU9OU1xyXG4gICAgbGV0IGFjdGlvbiA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5hY3Rpb24nKTtcclxuXHJcbiAgICBpZiAoYWN0aW9uKSBhY3Rpb24ub25jbGljayA9IHRoaXMuY2hlY2tvdXQuYmluZCh0aGlzKTtcclxuXHJcblxyXG4gICAgdGhpcy5jb250YWluZXIudXBkYXRlVG8odGVtcGxhdGUuZmlyc3RFbGVtZW50Q2hpbGQpO1xyXG4gIH1cclxufVxyXG5jbGFzcyBGaWx0ZXIge1xyXG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lciwgcHJvZHVjdHMsIGNhbGxiYWNrKSB7XHJcbiAgICB0aGlzLnByb2R1Y3RzID0gcHJvZHVjdHM7XHJcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICB0aGlzLnNvcnRGdW5jdGlvbiA9IHtcclxuICAgICAgc2VhcmNoOiBpdGVtID0+IGl0ZW0ucHJvcHMubmFtZS5pbmNsdWRlcyh0aGlzLmZpbHRlckNvbmRpdGlvbnMuc2VhcmNoKSxcclxuICAgICAgY2F0ZWdvcnk6IGl0ZW0gPT4gaXRlbS5wcm9wcy5jYXRlZ29yeSA9PT0gdGhpcy5maWx0ZXJDb25kaXRpb25zLmNhdGVnb3J5LFxyXG4gICAgICBtaW46IGl0ZW0gPT4gaXRlbS5wcm9wcy5wcmljZSA+IHRoaXMuZmlsdGVyQ29uZGl0aW9ucy5taW4sXHJcbiAgICAgIG1heDogaXRlbSA9PiBpdGVtLnByb3BzLnByaWNlIDwgdGhpcy5maWx0ZXJDb25kaXRpb25zLm1heFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbmRlcmluZyBhc2lkZVxyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucmVuZGVyKCkpO1xyXG5cclxuICB9XHJcbiAgc29ydChwcm9kdWN0cykge1xyXG4gICAgaWYodGhpcy5maWx0ZXJDb25kaXRpb25zKSB7XHJcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuZmlsdGVyQ29uZGl0aW9ucykubWFwKGNvbmRpdGlvbiA9PiB7XHJcbiAgICAgICAgaWYodGhpcy5maWx0ZXJDb25kaXRpb25zW2NvbmRpdGlvbl0gIT09ICcnKSBwcm9kdWN0cyA9IHByb2R1Y3RzLmZpbHRlcih0aGlzLnNvcnRGdW5jdGlvbltjb25kaXRpb25dKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJvZHVjdHM7XHJcbiAgfVxyXG4gIHJlbmRlcigpIHtcclxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG4gICAgICAgIGNhdGVnb3JpZXMgPSB0aGlzLnByb2R1Y3RzLnJlZHVjZSgoYXJyYXksIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgaWYgKCEoYXJyYXkuaW5kZXhPZihpdGVtLnByb3BzLmNhdGVnb3J5KSArIDEpKSBhcnJheS5wdXNoKGl0ZW0ucHJvcHMuY2F0ZWdvcnkpO1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICAgICAgICB9LCBbXSksXHJcbiAgICAgICAgc2VsZWN0T3B0aW9ucyA9IGNhdGVnb3JpZXMucmVkdWNlKChyb3csIGl0ZW0pID0+IHJvdyArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7aXRlbX1cIj4ke2l0ZW19PC9vcHRpb24+YCwgJzxvcHRpb24gdmFsdWU9XCJcIj7QstGB0LU8L29wdGlvbj4nKTtcclxuXHJcbiAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxmb3JtIGlkPVwiZmlsdGVyXCI+XHJcbiAgICAgICAgPGxhYmVsPlxyXG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInNlYXJjaFwiIHBsYWNlaG9sZGVyPVwi0L/QvtC40YHQui4uLlwiPlxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgPGhyIC8+XHJcbiAgICAgICAgPHNwYW4+0JrQsNGC0LXQs9C+0YDQuNGPPC9zcGFuPlxyXG4gICAgICAgIDxsYWJlbD5cclxuICAgICAgICAgIDxzZWxlY3QgbmFtZT1cImNhdGVnb3J5XCI+XHJcbiAgICAgICAgICAgICR7c2VsZWN0T3B0aW9uc31cclxuICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgPGhyIC8+XHJcbiAgICAgICAgPHNwYW4+0KbQtdC90LA8L3NwYW4+XHJcbiAgICAgICAgPGxhYmVsIGNsYXNzPVwiaW5saW5lXCI+XHJcbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInByaWNlXCIgbmFtZT1cIm1pblwiIHBsYWNlaG9sZGVyPVwi0L7Rgi4uLlwiPlxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgPGxhYmVsIGNsYXNzPVwiaW5saW5lXCI+XHJcbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInByaWNlXCIgbmFtZT1cIm1heFwiIHBsYWNlaG9sZGVyPVwi0LTQvi4uLlwiPlxyXG4gICAgICAgIDwvbGFiZWw+XHJcbiAgICAgIDwvZm9ybT5cclxuICAgIGA7XHJcblxyXG4gICAgLy8gQUNUSU9OU1xyXG4gICAgdGhpcy5mb3JtID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignZm9ybScpO1xyXG4gICAgbGV0IG51bUlucHV0cyA9IEFycmF5LmZyb20odGVtcGxhdGUucXVlcnlTZWxlY3RvckFsbCgnLnByaWNlJykpO1xyXG5cclxuICAgIHRoaXMuZm9ybS5vbmNoYW5nZSA9IHRoaXMuZm9ybS5vbnN1Ym1pdCA9IChlKSA9PiB7XHJcbiAgICAgIHRoaXMuZmlsdGVyQ29uZGl0aW9ucyA9IHNlcmlhbGl6ZUZvcm0oZS5jdXJyZW50VGFyZ2V0LmVsZW1lbnRzKTtcclxuICAgICAgdGhpcy5jYWxsYmFjaygpO1xyXG4gICAgfVxyXG4gICAgbnVtSW5wdXRzLm1hcChpdGVtID0+IGl0ZW0ub25rZXlkb3duID0gc2VjdXJlTnVtSW5wdXQoMjAwMCwgMCwgMTAwKSlcclxuXHJcblxyXG4gICAgcmV0dXJuIHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkO1xyXG4gIH1cclxufVxyXG5cclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgcHJvZHVjdHMgPSBuZXcgU3RvcmUoJ3N0YXRpYy9wcm9kdWN0cy5qc29uJywgJyNwcm9kdWN0cyAuY29udGVudCcpO1xyXG4gIHByb2R1Y3RzLm9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBuYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCduYXYnKSxcclxuICAgICAgICBhc2lkZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FzaWRlJyksXHJcbiAgICAgICAgc2xpZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhc2lkZSAuc2xpZGUnKTtcclxuICAgIHdpbmRvdy5vbnNjcm9sbCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHZhciBjb3JyZWN0U2Nyb2xsID0gZS50YXJnZXQuc2Nyb2xsaW5nRWxlbWVudC5zY3JvbGxUb3AgLSBhc2lkZS5vZmZzZXRUb3AgKyBuYXYub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICBpZiAoY29ycmVjdFNjcm9sbCA8IDApIHNsaWRlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKDBweCknO2Vsc2UgaWYgKGNvcnJlY3RTY3JvbGwgPiBhc2lkZS5vZmZzZXRIZWlnaHQgLSBzbGlkZS5vZmZzZXRIZWlnaHQpIHNsaWRlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKCcgKyAoYXNpZGUub2Zmc2V0SGVpZ2h0IC0gc2xpZGUub2Zmc2V0SGVpZ2h0KSArICdweCknO2Vsc2UgaWYgKGNvcnJlY3RTY3JvbGwgPiAwICYmIGNvcnJlY3RTY3JvbGwgPCBhc2lkZS5vZmZzZXRIZWlnaHQgLSBzbGlkZS5vZmZzZXRIZWlnaHQpIHNsaWRlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKCcgKyBjb3JyZWN0U2Nyb2xsICsgJ3B4KSc7XHJcbiAgICB9O1xyXG4gIH07XHJcbn07XHJcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZmFrZV9iODMzY2IuanNcIixcIi9cIilcclxufSx7XCJidWZmZXJcIjoyLFwiZS9VKzk3XCI6NH1dfSx7fSxbNV0pXHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJa002WEZ4UWNtOXFaV04wYzF4Y2EzVndaV05vWlhOcmFYbGtiMjFjWEc1dlpHVmZiVzlrZFd4bGMxeGNZbkp2ZDNObGNpMXdZV05yWEZ4ZmNISmxiSFZrWlM1cWN5SXNJa002TDFCeWIycGxZM1J6TDJ0MWNHVmphR1Z6YTJsNVpHOXRMMjV2WkdWZmJXOWtkV3hsY3k5aVlYTmxOalF0YW5NdmJHbGlMMkkyTkM1cWN5SXNJa002TDFCeWIycGxZM1J6TDJ0MWNHVmphR1Z6YTJsNVpHOXRMMjV2WkdWZmJXOWtkV3hsY3k5aWRXWm1aWEl2YVc1a1pYZ3Vhbk1pTENKRE9pOVFjbTlxWldOMGN5OXJkWEJsWTJobGMydHBlV1J2YlM5dWIyUmxYMjF2WkhWc1pYTXZhV1ZsWlRjMU5DOXBibVJsZUM1cWN5SXNJa002TDFCeWIycGxZM1J6TDJ0MWNHVmphR1Z6YTJsNVpHOXRMMjV2WkdWZmJXOWtkV3hsY3k5d2NtOWpaWE56TDJKeWIzZHpaWEl1YW5NaUxDSkRPaTlRY205cVpXTjBjeTlyZFhCbFkyaGxjMnRwZVdSdmJTOXpjbU12YW5NdlptRnJaVjlpT0RNelkySXVhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFN1FVTkJRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVNNVNFRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOMmJFTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVU4wUmtFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRMnBGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFTSXNJbVpwYkdVaU9pSm5aVzVsY21GMFpXUXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpS0daMWJtTjBhVzl1SUdVb2RDeHVMSElwZTJaMWJtTjBhVzl1SUhNb2J5eDFLWHRwWmlnaGJsdHZYU2w3YVdZb0lYUmJiMTBwZTNaaGNpQmhQWFI1Y0dWdlppQnlaWEYxYVhKbFBUMWNJbVoxYm1OMGFXOXVYQ0ltSm5KbGNYVnBjbVU3YVdZb0lYVW1KbUVwY21WMGRYSnVJR0VvYnl3aE1DazdhV1lvYVNseVpYUjFjbTRnYVNodkxDRXdLVHQwYUhKdmR5QnVaWGNnUlhKeWIzSW9YQ0pEWVc1dWIzUWdabWx1WkNCdGIyUjFiR1VnSjF3aUsyOHJYQ0luWENJcGZYWmhjaUJtUFc1YmIxMDllMlY0Y0c5eWRITTZlMzE5TzNSYmIxMWJNRjB1WTJGc2JDaG1MbVY0Y0c5eWRITXNablZ1WTNScGIyNG9aU2w3ZG1GeUlHNDlkRnR2WFZzeFhWdGxYVHR5WlhSMWNtNGdjeWh1UDI0NlpTbDlMR1lzWmk1bGVIQnZjblJ6TEdVc2RDeHVMSElwZlhKbGRIVnliaUJ1VzI5ZExtVjRjRzl5ZEhOOWRtRnlJR2s5ZEhsd1pXOW1JSEpsY1hWcGNtVTlQVndpWm5WdVkzUnBiMjVjSWlZbWNtVnhkV2x5WlR0bWIzSW9kbUZ5SUc4OU1EdHZQSEl1YkdWdVozUm9PMjhyS3lsektISmJiMTBwTzNKbGRIVnliaUJ6ZlNraUxDSW9ablZ1WTNScGIyNGdLSEJ5YjJObGMzTXNaMnh2WW1Gc0xFSjFabVpsY2l4ZlgyRnlaM1Z0Wlc1ME1DeGZYMkZ5WjNWdFpXNTBNU3hmWDJGeVozVnRaVzUwTWl4ZlgyRnlaM1Z0Wlc1ME15eGZYMlpwYkdWdVlXMWxMRjlmWkdseWJtRnRaU2w3WEc1MllYSWdiRzl2YTNWd0lEMGdKMEZDUTBSRlJrZElTVXBMVEUxT1QxQlJVbE5VVlZaWFdGbGFZV0pqWkdWbVoyaHBhbXRzYlc1dmNIRnljM1IxZG5kNGVYb3dNVEl6TkRVMk56ZzVLeThuTzF4dVhHNDdLR1oxYm1OMGFXOXVJQ2hsZUhCdmNuUnpLU0I3WEc1Y2RDZDFjMlVnYzNSeWFXTjBKenRjYmx4dUlDQjJZWElnUVhKeUlEMGdLSFI1Y0dWdlppQlZhVzUwT0VGeWNtRjVJQ0U5UFNBbmRXNWtaV1pwYm1Wa0p5bGNiaUFnSUNBL0lGVnBiblE0UVhKeVlYbGNiaUFnSUNBNklFRnljbUY1WEc1Y2JseDBkbUZ5SUZCTVZWTWdJQ0E5SUNjckp5NWphR0Z5UTI5a1pVRjBLREFwWEc1Y2RIWmhjaUJUVEVGVFNDQWdQU0FuTHljdVkyaGhja052WkdWQmRDZ3dLVnh1WEhSMllYSWdUbFZOUWtWU0lEMGdKekFuTG1Ob1lYSkRiMlJsUVhRb01DbGNibHgwZG1GeUlFeFBWMFZTSUNBOUlDZGhKeTVqYUdGeVEyOWtaVUYwS0RBcFhHNWNkSFpoY2lCVlVGQkZVaUFnUFNBblFTY3VZMmhoY2tOdlpHVkJkQ2d3S1Z4dVhIUjJZWElnVUV4VlUxOVZVa3hmVTBGR1JTQTlJQ2N0Snk1amFHRnlRMjlrWlVGMEtEQXBYRzVjZEhaaGNpQlRURUZUU0Y5VlVreGZVMEZHUlNBOUlDZGZKeTVqYUdGeVEyOWtaVUYwS0RBcFhHNWNibHgwWm5WdVkzUnBiMjRnWkdWamIyUmxJQ2hsYkhRcElIdGNibHgwWEhSMllYSWdZMjlrWlNBOUlHVnNkQzVqYUdGeVEyOWtaVUYwS0RBcFhHNWNkRngwYVdZZ0tHTnZaR1VnUFQwOUlGQk1WVk1nZkh4Y2JseDBYSFFnSUNBZ1kyOWtaU0E5UFQwZ1VFeFZVMTlWVWt4ZlUwRkdSU2xjYmx4MFhIUmNkSEpsZEhWeWJpQTJNaUF2THlBbkt5ZGNibHgwWEhScFppQW9ZMjlrWlNBOVBUMGdVMHhCVTBnZ2ZIeGNibHgwWEhRZ0lDQWdZMjlrWlNBOVBUMGdVMHhCVTBoZlZWSk1YMU5CUmtVcFhHNWNkRngwWEhSeVpYUjFjbTRnTmpNZ0x5OGdKeThuWEc1Y2RGeDBhV1lnS0dOdlpHVWdQQ0JPVlUxQ1JWSXBYRzVjZEZ4MFhIUnlaWFIxY200Z0xURWdMeTl1YnlCdFlYUmphRnh1WEhSY2RHbG1JQ2hqYjJSbElEd2dUbFZOUWtWU0lDc2dNVEFwWEc1Y2RGeDBYSFJ5WlhSMWNtNGdZMjlrWlNBdElFNVZUVUpGVWlBcklESTJJQ3NnTWpaY2JseDBYSFJwWmlBb1kyOWtaU0E4SUZWUVVFVlNJQ3NnTWpZcFhHNWNkRngwWEhSeVpYUjFjbTRnWTI5a1pTQXRJRlZRVUVWU1hHNWNkRngwYVdZZ0tHTnZaR1VnUENCTVQxZEZVaUFySURJMktWeHVYSFJjZEZ4MGNtVjBkWEp1SUdOdlpHVWdMU0JNVDFkRlVpQXJJREkyWEc1Y2RIMWNibHh1WEhSbWRXNWpkR2x2YmlCaU5qUlViMEo1ZEdWQmNuSmhlU0FvWWpZMEtTQjdYRzVjZEZ4MGRtRnlJR2tzSUdvc0lHd3NJSFJ0Y0N3Z2NHeGhZMlZJYjJ4a1pYSnpMQ0JoY25KY2JseHVYSFJjZEdsbUlDaGlOalF1YkdWdVozUm9JQ1VnTkNBK0lEQXBJSHRjYmx4MFhIUmNkSFJvY205M0lHNWxkeUJGY25KdmNpZ25TVzUyWVd4cFpDQnpkSEpwYm1jdUlFeGxibWQwYUNCdGRYTjBJR0psSUdFZ2JYVnNkR2x3YkdVZ2IyWWdOQ2NwWEc1Y2RGeDBmVnh1WEc1Y2RGeDBMeThnZEdobElHNTFiV0psY2lCdlppQmxjWFZoYkNCemFXZHVjeUFvY0d4aFkyVWdhRzlzWkdWeWN5bGNibHgwWEhRdkx5QnBaaUIwYUdWeVpTQmhjbVVnZEhkdklIQnNZV05sYUc5c1pHVnljeXdnZEdoaGJpQjBhR1VnZEhkdklHTm9ZWEpoWTNSbGNuTWdZbVZtYjNKbElHbDBYRzVjZEZ4MEx5OGdjbVZ3Y21WelpXNTBJRzl1WlNCaWVYUmxYRzVjZEZ4MEx5OGdhV1lnZEdobGNtVWdhWE1nYjI1c2VTQnZibVVzSUhSb1pXNGdkR2hsSUhSb2NtVmxJR05vWVhKaFkzUmxjbk1nWW1WbWIzSmxJR2wwSUhKbGNISmxjMlZ1ZENBeUlHSjVkR1Z6WEc1Y2RGeDBMeThnZEdocGN5QnBjeUJxZFhOMElHRWdZMmhsWVhBZ2FHRmpheUIwYnlCdWIzUWdaRzhnYVc1a1pYaFBaaUIwZDJsalpWeHVYSFJjZEhaaGNpQnNaVzRnUFNCaU5qUXViR1Z1WjNSb1hHNWNkRngwY0d4aFkyVkliMnhrWlhKeklEMGdKejBuSUQwOVBTQmlOalF1WTJoaGNrRjBLR3hsYmlBdElESXBJRDhnTWlBNklDYzlKeUE5UFQwZ1lqWTBMbU5vWVhKQmRDaHNaVzRnTFNBeEtTQS9JREVnT2lBd1hHNWNibHgwWEhRdkx5QmlZWE5sTmpRZ2FYTWdOQzh6SUNzZ2RYQWdkRzhnZEhkdklHTm9ZWEpoWTNSbGNuTWdiMllnZEdobElHOXlhV2RwYm1Gc0lHUmhkR0ZjYmx4MFhIUmhjbklnUFNCdVpYY2dRWEp5S0dJMk5DNXNaVzVuZEdnZ0tpQXpJQzhnTkNBdElIQnNZV05sU0c5c1pHVnljeWxjYmx4dVhIUmNkQzh2SUdsbUlIUm9aWEpsSUdGeVpTQndiR0ZqWldodmJHUmxjbk1zSUc5dWJIa2daMlYwSUhWd0lIUnZJSFJvWlNCc1lYTjBJR052YlhCc1pYUmxJRFFnWTJoaGNuTmNibHgwWEhSc0lEMGdjR3hoWTJWSWIyeGtaWEp6SUQ0Z01DQS9JR0kyTkM1c1pXNW5kR2dnTFNBMElEb2dZalkwTG14bGJtZDBhRnh1WEc1Y2RGeDBkbUZ5SUV3Z1BTQXdYRzVjYmx4MFhIUm1kVzVqZEdsdmJpQndkWE5vSUNoMktTQjdYRzVjZEZ4MFhIUmhjbkpiVENzclhTQTlJSFpjYmx4MFhIUjlYRzVjYmx4MFhIUm1iM0lnS0drZ1BTQXdMQ0JxSUQwZ01Ec2dhU0E4SUd3N0lHa2dLejBnTkN3Z2FpQXJQU0F6S1NCN1hHNWNkRngwWEhSMGJYQWdQU0FvWkdWamIyUmxLR0kyTkM1amFHRnlRWFFvYVNrcElEdzhJREU0S1NCOElDaGtaV052WkdVb1lqWTBMbU5vWVhKQmRDaHBJQ3NnTVNrcElEdzhJREV5S1NCOElDaGtaV052WkdVb1lqWTBMbU5vWVhKQmRDaHBJQ3NnTWlrcElEdzhJRFlwSUh3Z1pHVmpiMlJsS0dJMk5DNWphR0Z5UVhRb2FTQXJJRE1wS1Z4dVhIUmNkRngwY0hWemFDZ29kRzF3SUNZZ01IaEdSakF3TURBcElENCtJREUyS1Z4dVhIUmNkRngwY0hWemFDZ29kRzF3SUNZZ01IaEdSakF3S1NBK1BpQTRLVnh1WEhSY2RGeDBjSFZ6YUNoMGJYQWdKaUF3ZUVaR0tWeHVYSFJjZEgxY2JseHVYSFJjZEdsbUlDaHdiR0ZqWlVodmJHUmxjbk1nUFQwOUlESXBJSHRjYmx4MFhIUmNkSFJ0Y0NBOUlDaGtaV052WkdVb1lqWTBMbU5vWVhKQmRDaHBLU2tnUER3Z01pa2dmQ0FvWkdWamIyUmxLR0kyTkM1amFHRnlRWFFvYVNBcklERXBLU0ErUGlBMEtWeHVYSFJjZEZ4MGNIVnphQ2gwYlhBZ0ppQXdlRVpHS1Z4dVhIUmNkSDBnWld4elpTQnBaaUFvY0d4aFkyVkliMnhrWlhKeklEMDlQU0F4S1NCN1hHNWNkRngwWEhSMGJYQWdQU0FvWkdWamIyUmxLR0kyTkM1amFHRnlRWFFvYVNrcElEdzhJREV3S1NCOElDaGtaV052WkdVb1lqWTBMbU5vWVhKQmRDaHBJQ3NnTVNrcElEdzhJRFFwSUh3Z0tHUmxZMjlrWlNoaU5qUXVZMmhoY2tGMEtHa2dLeUF5S1NrZ1BqNGdNaWxjYmx4MFhIUmNkSEIxYzJnb0tIUnRjQ0ErUGlBNEtTQW1JREI0UmtZcFhHNWNkRngwWEhSd2RYTm9LSFJ0Y0NBbUlEQjRSa1lwWEc1Y2RGeDBmVnh1WEc1Y2RGeDBjbVYwZFhKdUlHRnljbHh1WEhSOVhHNWNibHgwWm5WdVkzUnBiMjRnZFdsdWREaFViMEpoYzJVMk5DQW9kV2x1ZERncElIdGNibHgwWEhSMllYSWdhU3hjYmx4MFhIUmNkR1Y0ZEhKaFFubDBaWE1nUFNCMWFXNTBPQzVzWlc1bmRHZ2dKU0F6TENBdkx5QnBaaUIzWlNCb1lYWmxJREVnWW5sMFpTQnNaV1owTENCd1lXUWdNaUJpZVhSbGMxeHVYSFJjZEZ4MGIzVjBjSFYwSUQwZ1hDSmNJaXhjYmx4MFhIUmNkSFJsYlhBc0lHeGxibWQwYUZ4dVhHNWNkRngwWm5WdVkzUnBiMjRnWlc1amIyUmxJQ2h1ZFcwcElIdGNibHgwWEhSY2RISmxkSFZ5YmlCc2IyOXJkWEF1WTJoaGNrRjBLRzUxYlNsY2JseDBYSFI5WEc1Y2JseDBYSFJtZFc1amRHbHZiaUIwY21sd2JHVjBWRzlDWVhObE5qUWdLRzUxYlNrZ2UxeHVYSFJjZEZ4MGNtVjBkWEp1SUdWdVkyOWtaU2h1ZFcwZ1BqNGdNVGdnSmlBd2VETkdLU0FySUdWdVkyOWtaU2h1ZFcwZ1BqNGdNVElnSmlBd2VETkdLU0FySUdWdVkyOWtaU2h1ZFcwZ1BqNGdOaUFtSURCNE0wWXBJQ3NnWlc1amIyUmxLRzUxYlNBbUlEQjRNMFlwWEc1Y2RGeDBmVnh1WEc1Y2RGeDBMeThnWjI4Z2RHaHliM1ZuYUNCMGFHVWdZWEp5WVhrZ1pYWmxjbmtnZEdoeVpXVWdZbmwwWlhNc0lIZGxKMnhzSUdSbFlXd2dkMmwwYUNCMGNtRnBiR2x1WnlCemRIVm1aaUJzWVhSbGNseHVYSFJjZEdadmNpQW9hU0E5SURBc0lHeGxibWQwYUNBOUlIVnBiblE0TG14bGJtZDBhQ0F0SUdWNGRISmhRbmwwWlhNN0lHa2dQQ0JzWlc1bmRHZzdJR2tnS3owZ015a2dlMXh1WEhSY2RGeDBkR1Z0Y0NBOUlDaDFhVzUwT0Z0cFhTQThQQ0F4TmlrZ0t5QW9kV2x1ZERoYmFTQXJJREZkSUR3OElEZ3BJQ3NnS0hWcGJuUTRXMmtnS3lBeVhTbGNibHgwWEhSY2RHOTFkSEIxZENBclBTQjBjbWx3YkdWMFZHOUNZWE5sTmpRb2RHVnRjQ2xjYmx4MFhIUjlYRzVjYmx4MFhIUXZMeUJ3WVdRZ2RHaGxJR1Z1WkNCM2FYUm9JSHBsY205ekxDQmlkWFFnYldGclpTQnpkWEpsSUhSdklHNXZkQ0JtYjNKblpYUWdkR2hsSUdWNGRISmhJR0o1ZEdWelhHNWNkRngwYzNkcGRHTm9JQ2hsZUhSeVlVSjVkR1Z6S1NCN1hHNWNkRngwWEhSallYTmxJREU2WEc1Y2RGeDBYSFJjZEhSbGJYQWdQU0IxYVc1ME9GdDFhVzUwT0M1c1pXNW5kR2dnTFNBeFhWeHVYSFJjZEZ4MFhIUnZkWFJ3ZFhRZ0t6MGdaVzVqYjJSbEtIUmxiWEFnUGo0Z01pbGNibHgwWEhSY2RGeDBiM1YwY0hWMElDczlJR1Z1WTI5a1pTZ29kR1Z0Y0NBOFBDQTBLU0FtSURCNE0wWXBYRzVjZEZ4MFhIUmNkRzkxZEhCMWRDQXJQU0FuUFQwblhHNWNkRngwWEhSY2RHSnlaV0ZyWEc1Y2RGeDBYSFJqWVhObElESTZYRzVjZEZ4MFhIUmNkSFJsYlhBZ1BTQW9kV2x1ZERoYmRXbHVkRGd1YkdWdVozUm9JQzBnTWwwZ1BEd2dPQ2tnS3lBb2RXbHVkRGhiZFdsdWREZ3ViR1Z1WjNSb0lDMGdNVjBwWEc1Y2RGeDBYSFJjZEc5MWRIQjFkQ0FyUFNCbGJtTnZaR1VvZEdWdGNDQStQaUF4TUNsY2JseDBYSFJjZEZ4MGIzVjBjSFYwSUNzOUlHVnVZMjlrWlNnb2RHVnRjQ0ErUGlBMEtTQW1JREI0TTBZcFhHNWNkRngwWEhSY2RHOTFkSEIxZENBclBTQmxibU52WkdVb0tIUmxiWEFnUER3Z01pa2dKaUF3ZUROR0tWeHVYSFJjZEZ4MFhIUnZkWFJ3ZFhRZ0t6MGdKejBuWEc1Y2RGeDBYSFJjZEdKeVpXRnJYRzVjZEZ4MGZWeHVYRzVjZEZ4MGNtVjBkWEp1SUc5MWRIQjFkRnh1WEhSOVhHNWNibHgwWlhod2IzSjBjeTUwYjBKNWRHVkJjbkpoZVNBOUlHSTJORlJ2UW5sMFpVRnljbUY1WEc1Y2RHVjRjRzl5ZEhNdVpuSnZiVUo1ZEdWQmNuSmhlU0E5SUhWcGJuUTRWRzlDWVhObE5qUmNibjBvZEhsd1pXOW1JR1Y0Y0c5eWRITWdQVDA5SUNkMWJtUmxabWx1WldRbklEOGdLSFJvYVhNdVltRnpaVFkwYW5NZ1BTQjdmU2tnT2lCbGVIQnZjblJ6S1NsY2JseHVmU2t1WTJGc2JDaDBhR2x6TEhKbGNYVnBjbVVvWENKbEwxVXJPVGRjSWlrc2RIbHdaVzltSUhObGJHWWdJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSWdQeUJ6Wld4bUlEb2dkSGx3Wlc5bUlIZHBibVJ2ZHlBaFBUMGdYQ0oxYm1SbFptbHVaV1JjSWlBL0lIZHBibVJ2ZHlBNklIdDlMSEpsY1hWcGNtVW9YQ0ppZFdabVpYSmNJaWt1UW5WbVptVnlMR0Z5WjNWdFpXNTBjMXN6WFN4aGNtZDFiV1Z1ZEhOYk5GMHNZWEpuZFcxbGJuUnpXelZkTEdGeVozVnRaVzUwYzFzMlhTeGNJaTh1TGx4Y1hGd3VMbHhjWEZ4dWIyUmxYMjF2WkhWc1pYTmNYRnhjWW1GelpUWTBMV3B6WEZ4Y1hHeHBZbHhjWEZ4aU5qUXVhbk5jSWl4Y0lpOHVMbHhjWEZ3dUxseGNYRnh1YjJSbFgyMXZaSFZzWlhOY1hGeGNZbUZ6WlRZMExXcHpYRnhjWEd4cFlsd2lLU0lzSWlobWRXNWpkR2x2YmlBb2NISnZZMlZ6Y3l4bmJHOWlZV3dzUW5WbVptVnlMRjlmWVhKbmRXMWxiblF3TEY5ZllYSm5kVzFsYm5ReExGOWZZWEpuZFcxbGJuUXlMRjlmWVhKbmRXMWxiblF6TEY5ZlptbHNaVzVoYldVc1gxOWthWEp1WVcxbEtYdGNiaThxSVZ4dUlDb2dWR2hsSUdKMVptWmxjaUJ0YjJSMWJHVWdabkp2YlNCdWIyUmxMbXB6TENCbWIzSWdkR2hsSUdKeWIzZHpaWEl1WEc0Z0tseHVJQ29nUUdGMWRHaHZjaUFnSUVabGNtOXpjeUJCWW05MWEyaGhaR2xxWldnZ1BHWmxjbTl6YzBCbVpYSnZjM011YjNKblBpQThhSFIwY0RvdkwyWmxjbTl6Y3k1dmNtYytYRzRnS2lCQWJHbGpaVzV6WlNBZ1RVbFVYRzRnS2k5Y2JseHVkbUZ5SUdKaGMyVTJOQ0E5SUhKbGNYVnBjbVVvSjJKaGMyVTJOQzFxY3ljcFhHNTJZWElnYVdWbFpUYzFOQ0E5SUhKbGNYVnBjbVVvSjJsbFpXVTNOVFFuS1Z4dVhHNWxlSEJ2Y25SekxrSjFabVpsY2lBOUlFSjFabVpsY2x4dVpYaHdiM0owY3k1VGJHOTNRblZtWm1WeUlEMGdRblZtWm1WeVhHNWxlSEJ2Y25SekxrbE9VMUJGUTFSZlRVRllYMEpaVkVWVElEMGdOVEJjYmtKMVptWmxjaTV3YjI5c1UybDZaU0E5SURneE9USmNibHh1THlvcVhHNGdLaUJKWmlCZ1FuVm1abVZ5TGw5MWMyVlVlWEJsWkVGeWNtRjVjMkE2WEc0Z0tpQWdJRDA5UFNCMGNuVmxJQ0FnSUZWelpTQlZhVzUwT0VGeWNtRjVJR2x0Y0d4bGJXVnVkR0YwYVc5dUlDaG1ZWE4wWlhOMEtWeHVJQ29nSUNBOVBUMGdabUZzYzJVZ0lDQlZjMlVnVDJKcVpXTjBJR2x0Y0d4bGJXVnVkR0YwYVc5dUlDaGpiMjF3WVhScFlteGxJR1J2ZDI0Z2RHOGdTVVUyS1Z4dUlDb3ZYRzVDZFdabVpYSXVYM1Z6WlZSNWNHVmtRWEp5WVhseklEMGdLR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdMeThnUkdWMFpXTjBJR2xtSUdKeWIzZHpaWElnYzNWd2NHOXlkSE1nVkhsd1pXUWdRWEp5WVhsekxpQlRkWEJ3YjNKMFpXUWdZbkp2ZDNObGNuTWdZWEpsSUVsRklERXdLeXdnUm1seVpXWnZlQ0EwS3l4Y2JpQWdMeThnUTJoeWIyMWxJRGNyTENCVFlXWmhjbWtnTlM0eEt5d2dUM0JsY21FZ01URXVOaXNzSUdsUFV5QTBMaklyTGlCSlppQjBhR1VnWW5KdmQzTmxjaUJrYjJWeklHNXZkQ0J6ZFhCd2IzSjBJR0ZrWkdsdVoxeHVJQ0F2THlCd2NtOXdaWEowYVdWeklIUnZJR0JWYVc1ME9FRnljbUY1WUNCcGJuTjBZVzVqWlhNc0lIUm9aVzRnZEdoaGRDZHpJSFJvWlNCellXMWxJR0Z6SUc1dklHQlZhVzUwT0VGeWNtRjVZQ0J6ZFhCd2IzSjBYRzRnSUM4dklHSmxZMkYxYzJVZ2QyVWdibVZsWkNCMGJ5QmlaU0JoWW14bElIUnZJR0ZrWkNCaGJHd2dkR2hsSUc1dlpHVWdRblZtWm1WeUlFRlFTU0J0WlhSb2IyUnpMaUJVYUdseklHbHpJR0Z1SUdsemMzVmxYRzRnSUM4dklHbHVJRVpwY21WbWIzZ2dOQzB5T1M0Z1RtOTNJR1pwZUdWa09pQm9kSFJ3Y3pvdkwySjFaM3BwYkd4aExtMXZlbWxzYkdFdWIzSm5MM05vYjNkZlluVm5MbU5uYVQ5cFpEMDJPVFUwTXpoY2JpQWdkSEo1SUh0Y2JpQWdJQ0IyWVhJZ1luVm1JRDBnYm1WM0lFRnljbUY1UW5WbVptVnlLREFwWEc0Z0lDQWdkbUZ5SUdGeWNpQTlJRzVsZHlCVmFXNTBPRUZ5Y21GNUtHSjFaaWxjYmlBZ0lDQmhjbkl1Wm05dklEMGdablZ1WTNScGIyNGdLQ2tnZXlCeVpYUjFjbTRnTkRJZ2ZWeHVJQ0FnSUhKbGRIVnliaUEwTWlBOVBUMGdZWEp5TG1admJ5Z3BJQ1ltWEc0Z0lDQWdJQ0FnSUhSNWNHVnZaaUJoY25JdWMzVmlZWEp5WVhrZ1BUMDlJQ2RtZFc1amRHbHZiaWNnTHk4Z1EyaHliMjFsSURrdE1UQWdiR0ZqYXlCZ2MzVmlZWEp5WVhsZ1hHNGdJSDBnWTJGMFkyZ2dLR1VwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdabUZzYzJWY2JpQWdmVnh1ZlNrb0tWeHVYRzR2S2lwY2JpQXFJRU5zWVhOek9pQkNkV1ptWlhKY2JpQXFJRDA5UFQwOVBUMDlQVDA5UFQxY2JpQXFYRzRnS2lCVWFHVWdRblZtWm1WeUlHTnZibk4wY25WamRHOXlJSEpsZEhWeWJuTWdhVzV6ZEdGdVkyVnpJRzltSUdCVmFXNTBPRUZ5Y21GNVlDQjBhR0YwSUdGeVpTQmhkV2R0Wlc1MFpXUmNiaUFxSUhkcGRHZ2dablZ1WTNScGIyNGdjSEp2Y0dWeWRHbGxjeUJtYjNJZ1lXeHNJSFJvWlNCdWIyUmxJR0JDZFdabVpYSmdJRUZRU1NCbWRXNWpkR2x2Ym5NdUlGZGxJSFZ6WlZ4dUlDb2dZRlZwYm5RNFFYSnlZWGxnSUhOdklIUm9ZWFFnYzNGMVlYSmxJR0p5WVdOclpYUWdibTkwWVhScGIyNGdkMjl5YTNNZ1lYTWdaWGh3WldOMFpXUWdMUzBnYVhRZ2NtVjBkWEp1YzF4dUlDb2dZU0J6YVc1bmJHVWdiMk4wWlhRdVhHNGdLbHh1SUNvZ1Fua2dZWFZuYldWdWRHbHVaeUIwYUdVZ2FXNXpkR0Z1WTJWekxDQjNaU0JqWVc0Z1lYWnZhV1FnYlc5a2FXWjVhVzVuSUhSb1pTQmdWV2x1ZERoQmNuSmhlV0JjYmlBcUlIQnliM1J2ZEhsd1pTNWNiaUFxTDF4dVpuVnVZM1JwYjI0Z1FuVm1abVZ5SUNoemRXSnFaV04wTENCbGJtTnZaR2x1Wnl3Z2JtOWFaWEp2S1NCN1hHNGdJR2xtSUNnaEtIUm9hWE1nYVc1emRHRnVZMlZ2WmlCQ2RXWm1aWElwS1Z4dUlDQWdJSEpsZEhWeWJpQnVaWGNnUW5WbVptVnlLSE4xWW1wbFkzUXNJR1Z1WTI5a2FXNW5MQ0J1YjFwbGNtOHBYRzVjYmlBZ2RtRnlJSFI1Y0dVZ1BTQjBlWEJsYjJZZ2MzVmlhbVZqZEZ4dVhHNGdJQzh2SUZkdmNtdGhjbTkxYm1RNklHNXZaR1VuY3lCaVlYTmxOalFnYVcxd2JHVnRaVzUwWVhScGIyNGdZV3hzYjNkeklHWnZjaUJ1YjI0dGNHRmtaR1ZrSUhOMGNtbHVaM05jYmlBZ0x5OGdkMmhwYkdVZ1ltRnpaVFkwTFdweklHUnZaWE1nYm05MExseHVJQ0JwWmlBb1pXNWpiMlJwYm1jZ1BUMDlJQ2RpWVhObE5qUW5JQ1ltSUhSNWNHVWdQVDA5SUNkemRISnBibWNuS1NCN1hHNGdJQ0FnYzNWaWFtVmpkQ0E5SUhOMGNtbHVaM1J5YVcwb2MzVmlhbVZqZENsY2JpQWdJQ0IzYUdsc1pTQW9jM1ZpYW1WamRDNXNaVzVuZEdnZ0pTQTBJQ0U5UFNBd0tTQjdYRzRnSUNBZ0lDQnpkV0pxWldOMElEMGdjM1ZpYW1WamRDQXJJQ2M5SjF4dUlDQWdJSDFjYmlBZ2ZWeHVYRzRnSUM4dklFWnBibVFnZEdobElHeGxibWQwYUZ4dUlDQjJZWElnYkdWdVozUm9YRzRnSUdsbUlDaDBlWEJsSUQwOVBTQW5iblZ0WW1WeUp5bGNiaUFnSUNCc1pXNW5kR2dnUFNCamIyVnlZMlVvYzNWaWFtVmpkQ2xjYmlBZ1pXeHpaU0JwWmlBb2RIbHdaU0E5UFQwZ0ozTjBjbWx1WnljcFhHNGdJQ0FnYkdWdVozUm9JRDBnUW5WbVptVnlMbUo1ZEdWTVpXNW5kR2dvYzNWaWFtVmpkQ3dnWlc1amIyUnBibWNwWEc0Z0lHVnNjMlVnYVdZZ0tIUjVjR1VnUFQwOUlDZHZZbXBsWTNRbktWeHVJQ0FnSUd4bGJtZDBhQ0E5SUdOdlpYSmpaU2h6ZFdKcVpXTjBMbXhsYm1kMGFDa2dMeThnWVhOemRXMWxJSFJvWVhRZ2IySnFaV04wSUdseklHRnljbUY1TFd4cGEyVmNiaUFnWld4elpWeHVJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduUm1seWMzUWdZWEpuZFcxbGJuUWdibVZsWkhNZ2RHOGdZbVVnWVNCdWRXMWlaWElzSUdGeWNtRjVJRzl5SUhOMGNtbHVaeTRuS1Z4dVhHNGdJSFpoY2lCaWRXWmNiaUFnYVdZZ0tFSjFabVpsY2k1ZmRYTmxWSGx3WldSQmNuSmhlWE1wSUh0Y2JpQWdJQ0F2THlCUWNtVm1aWEp5WldRNklGSmxkSFZ5YmlCaGJpQmhkV2R0Wlc1MFpXUWdZRlZwYm5RNFFYSnlZWGxnSUdsdWMzUmhibU5sSUdadmNpQmlaWE4wSUhCbGNtWnZjbTFoYm1ObFhHNGdJQ0FnWW5WbUlEMGdRblZtWm1WeUxsOWhkV2R0Wlc1MEtHNWxkeUJWYVc1ME9FRnljbUY1S0d4bGJtZDBhQ2twWEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnTHk4Z1JtRnNiR0poWTJzNklGSmxkSFZ5YmlCVVNFbFRJR2x1YzNSaGJtTmxJRzltSUVKMVptWmxjaUFvWTNKbFlYUmxaQ0JpZVNCZ2JtVjNZQ2xjYmlBZ0lDQmlkV1lnUFNCMGFHbHpYRzRnSUNBZ1luVm1MbXhsYm1kMGFDQTlJR3hsYm1kMGFGeHVJQ0FnSUdKMVppNWZhWE5DZFdabVpYSWdQU0IwY25WbFhHNGdJSDFjYmx4dUlDQjJZWElnYVZ4dUlDQnBaaUFvUW5WbVptVnlMbDkxYzJWVWVYQmxaRUZ5Y21GNWN5QW1KaUIwZVhCbGIyWWdjM1ZpYW1WamRDNWllWFJsVEdWdVozUm9JRDA5UFNBbmJuVnRZbVZ5SnlrZ2UxeHVJQ0FnSUM4dklGTndaV1ZrSUc5d2RHbHRhWHBoZEdsdmJpQXRMU0IxYzJVZ2MyVjBJR2xtSUhkbEozSmxJR052Y0hscGJtY2dabkp2YlNCaElIUjVjR1ZrSUdGeWNtRjVYRzRnSUNBZ1luVm1MbDl6WlhRb2MzVmlhbVZqZENsY2JpQWdmU0JsYkhObElHbG1JQ2hwYzBGeWNtRjVhWE5vS0hOMVltcGxZM1FwS1NCN1hHNGdJQ0FnTHk4Z1ZISmxZWFFnWVhKeVlYa3RhWE5vSUc5aWFtVmpkSE1nWVhNZ1lTQmllWFJsSUdGeWNtRjVYRzRnSUNBZ1ptOXlJQ2hwSUQwZ01Ec2dhU0E4SUd4bGJtZDBhRHNnYVNzcktTQjdYRzRnSUNBZ0lDQnBaaUFvUW5WbVptVnlMbWx6UW5WbVptVnlLSE4xWW1wbFkzUXBLVnh1SUNBZ0lDQWdJQ0JpZFdaYmFWMGdQU0J6ZFdKcVpXTjBMbkpsWVdSVlNXNTBPQ2hwS1Z4dUlDQWdJQ0FnWld4elpWeHVJQ0FnSUNBZ0lDQmlkV1piYVYwZ1BTQnpkV0pxWldOMFcybGRYRzRnSUNBZ2ZWeHVJQ0I5SUdWc2MyVWdhV1lnS0hSNWNHVWdQVDA5SUNkemRISnBibWNuS1NCN1hHNGdJQ0FnWW5WbUxuZHlhWFJsS0hOMVltcGxZM1FzSURBc0lHVnVZMjlrYVc1bktWeHVJQ0I5SUdWc2MyVWdhV1lnS0hSNWNHVWdQVDA5SUNkdWRXMWlaWEluSUNZbUlDRkNkV1ptWlhJdVgzVnpaVlI1Y0dWa1FYSnlZWGx6SUNZbUlDRnViMXBsY204cElIdGNiaUFnSUNCbWIzSWdLR2tnUFNBd095QnBJRHdnYkdWdVozUm9PeUJwS3lzcElIdGNiaUFnSUNBZ0lHSjFabHRwWFNBOUlEQmNiaUFnSUNCOVhHNGdJSDFjYmx4dUlDQnlaWFIxY200Z1luVm1YRzU5WEc1Y2JpOHZJRk5VUVZSSlF5Qk5SVlJJVDBSVFhHNHZMeUE5UFQwOVBUMDlQVDA5UFQwOVBWeHVYRzVDZFdabVpYSXVhWE5GYm1OdlpHbHVaeUE5SUdaMWJtTjBhVzl1SUNobGJtTnZaR2x1WnlrZ2UxeHVJQ0J6ZDJsMFkyZ2dLRk4wY21sdVp5aGxibU52WkdsdVp5a3VkRzlNYjNkbGNrTmhjMlVvS1NrZ2UxeHVJQ0FnSUdOaGMyVWdKMmhsZUNjNlhHNGdJQ0FnWTJGelpTQW5kWFJtT0NjNlhHNGdJQ0FnWTJGelpTQW5kWFJtTFRnbk9seHVJQ0FnSUdOaGMyVWdKMkZ6WTJscEp6cGNiaUFnSUNCallYTmxJQ2RpYVc1aGNua25PbHh1SUNBZ0lHTmhjMlVnSjJKaGMyVTJOQ2M2WEc0Z0lDQWdZMkZ6WlNBbmNtRjNKenBjYmlBZ0lDQmpZWE5sSUNkMVkzTXlKenBjYmlBZ0lDQmpZWE5sSUNkMVkzTXRNaWM2WEc0Z0lDQWdZMkZ6WlNBbmRYUm1NVFpzWlNjNlhHNGdJQ0FnWTJGelpTQW5kWFJtTFRFMmJHVW5PbHh1SUNBZ0lDQWdjbVYwZFhKdUlIUnlkV1ZjYmlBZ0lDQmtaV1poZFd4ME9seHVJQ0FnSUNBZ2NtVjBkWEp1SUdaaGJITmxYRzRnSUgxY2JuMWNibHh1UW5WbVptVnlMbWx6UW5WbVptVnlJRDBnWm5WdVkzUnBiMjRnS0dJcElIdGNiaUFnY21WMGRYSnVJQ0VoS0dJZ0lUMDlJRzUxYkd3Z0ppWWdZaUFoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JR0l1WDJselFuVm1abVZ5S1Z4dWZWeHVYRzVDZFdabVpYSXVZbmwwWlV4bGJtZDBhQ0E5SUdaMWJtTjBhVzl1SUNoemRISXNJR1Z1WTI5a2FXNW5LU0I3WEc0Z0lIWmhjaUJ5WlhSY2JpQWdjM1J5SUQwZ2MzUnlJQ3NnSnlkY2JpQWdjM2RwZEdOb0lDaGxibU52WkdsdVp5QjhmQ0FuZFhSbU9DY3BJSHRjYmlBZ0lDQmpZWE5sSUNkb1pYZ25PbHh1SUNBZ0lDQWdjbVYwSUQwZ2MzUnlMbXhsYm1kMGFDQXZJREpjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWTJGelpTQW5kWFJtT0NjNlhHNGdJQ0FnWTJGelpTQW5kWFJtTFRnbk9seHVJQ0FnSUNBZ2NtVjBJRDBnZFhSbU9GUnZRbmwwWlhNb2MzUnlLUzVzWlc1bmRHaGNiaUFnSUNBZ0lHSnlaV0ZyWEc0Z0lDQWdZMkZ6WlNBbllYTmphV2tuT2x4dUlDQWdJR05oYzJVZ0oySnBibUZ5ZVNjNlhHNGdJQ0FnWTJGelpTQW5jbUYzSnpwY2JpQWdJQ0FnSUhKbGRDQTlJSE4wY2k1c1pXNW5kR2hjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWTJGelpTQW5ZbUZ6WlRZMEp6cGNiaUFnSUNBZ0lISmxkQ0E5SUdKaGMyVTJORlJ2UW5sMFpYTW9jM1J5S1M1c1pXNW5kR2hjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWTJGelpTQW5kV056TWljNlhHNGdJQ0FnWTJGelpTQW5kV056TFRJbk9seHVJQ0FnSUdOaGMyVWdKM1YwWmpFMmJHVW5PbHh1SUNBZ0lHTmhjMlVnSjNWMFppMHhObXhsSnpwY2JpQWdJQ0FnSUhKbGRDQTlJSE4wY2k1c1pXNW5kR2dnS2lBeVhHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHUmxabUYxYkhRNlhHNGdJQ0FnSUNCMGFISnZkeUJ1WlhjZ1JYSnliM0lvSjFWdWEyNXZkMjRnWlc1amIyUnBibWNuS1Z4dUlDQjlYRzRnSUhKbGRIVnliaUJ5WlhSY2JuMWNibHh1UW5WbVptVnlMbU52Ym1OaGRDQTlJR1oxYm1OMGFXOXVJQ2hzYVhOMExDQjBiM1JoYkV4bGJtZDBhQ2tnZTF4dUlDQmhjM05sY25Rb2FYTkJjbkpoZVNoc2FYTjBLU3dnSjFWellXZGxPaUJDZFdabVpYSXVZMjl1WTJGMEtHeHBjM1FzSUZ0MGIzUmhiRXhsYm1kMGFGMHBYRnh1SnlBclhHNGdJQ0FnSUNBbmJHbHpkQ0J6YUc5MWJHUWdZbVVnWVc0Z1FYSnlZWGt1SnlsY2JseHVJQ0JwWmlBb2JHbHpkQzVzWlc1bmRHZ2dQVDA5SURBcElIdGNiaUFnSUNCeVpYUjFjbTRnYm1WM0lFSjFabVpsY2lnd0tWeHVJQ0I5SUdWc2MyVWdhV1lnS0d4cGMzUXViR1Z1WjNSb0lEMDlQU0F4S1NCN1hHNGdJQ0FnY21WMGRYSnVJR3hwYzNSYk1GMWNiaUFnZlZ4dVhHNGdJSFpoY2lCcFhHNGdJR2xtSUNoMGVYQmxiMllnZEc5MFlXeE1aVzVuZEdnZ0lUMDlJQ2R1ZFcxaVpYSW5LU0I3WEc0Z0lDQWdkRzkwWVd4TVpXNW5kR2dnUFNBd1hHNGdJQ0FnWm05eUlDaHBJRDBnTURzZ2FTQThJR3hwYzNRdWJHVnVaM1JvT3lCcEt5c3BJSHRjYmlBZ0lDQWdJSFJ2ZEdGc1RHVnVaM1JvSUNzOUlHeHBjM1JiYVYwdWJHVnVaM1JvWEc0Z0lDQWdmVnh1SUNCOVhHNWNiaUFnZG1GeUlHSjFaaUE5SUc1bGR5QkNkV1ptWlhJb2RHOTBZV3hNWlc1bmRHZ3BYRzRnSUhaaGNpQndiM01nUFNBd1hHNGdJR1p2Y2lBb2FTQTlJREE3SUdrZ1BDQnNhWE4wTG14bGJtZDBhRHNnYVNzcktTQjdYRzRnSUNBZ2RtRnlJR2wwWlcwZ1BTQnNhWE4wVzJsZFhHNGdJQ0FnYVhSbGJTNWpiM0I1S0dKMVppd2djRzl6S1Z4dUlDQWdJSEJ2Y3lBclBTQnBkR1Z0TG14bGJtZDBhRnh1SUNCOVhHNGdJSEpsZEhWeWJpQmlkV1pjYm4xY2JseHVMeThnUWxWR1JrVlNJRWxPVTFSQlRrTkZJRTFGVkVoUFJGTmNiaTh2SUQwOVBUMDlQVDA5UFQwOVBUMDlQVDA5UFQwOVBUMDlYRzVjYm1aMWJtTjBhVzl1SUY5b1pYaFhjbWwwWlNBb1luVm1MQ0J6ZEhKcGJtY3NJRzltWm5ObGRDd2diR1Z1WjNSb0tTQjdYRzRnSUc5bVpuTmxkQ0E5SUU1MWJXSmxjaWh2Wm1aelpYUXBJSHg4SURCY2JpQWdkbUZ5SUhKbGJXRnBibWx1WnlBOUlHSjFaaTVzWlc1bmRHZ2dMU0J2Wm1aelpYUmNiaUFnYVdZZ0tDRnNaVzVuZEdncElIdGNiaUFnSUNCc1pXNW5kR2dnUFNCeVpXMWhhVzVwYm1kY2JpQWdmU0JsYkhObElIdGNiaUFnSUNCc1pXNW5kR2dnUFNCT2RXMWlaWElvYkdWdVozUm9LVnh1SUNBZ0lHbG1JQ2hzWlc1bmRHZ2dQaUJ5WlcxaGFXNXBibWNwSUh0Y2JpQWdJQ0FnSUd4bGJtZDBhQ0E5SUhKbGJXRnBibWx1WjF4dUlDQWdJSDFjYmlBZ2ZWeHVYRzRnSUM4dklHMTFjM1FnWW1VZ1lXNGdaWFpsYmlCdWRXMWlaWElnYjJZZ1pHbG5hWFJ6WEc0Z0lIWmhjaUJ6ZEhKTVpXNGdQU0J6ZEhKcGJtY3ViR1Z1WjNSb1hHNGdJR0Z6YzJWeWRDaHpkSEpNWlc0Z0pTQXlJRDA5UFNBd0xDQW5TVzUyWVd4cFpDQm9aWGdnYzNSeWFXNW5KeWxjYmx4dUlDQnBaaUFvYkdWdVozUm9JRDRnYzNSeVRHVnVJQzhnTWlrZ2UxeHVJQ0FnSUd4bGJtZDBhQ0E5SUhOMGNreGxiaUF2SURKY2JpQWdmVnh1SUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHeGxibWQwYURzZ2FTc3JLU0I3WEc0Z0lDQWdkbUZ5SUdKNWRHVWdQU0J3WVhKelpVbHVkQ2h6ZEhKcGJtY3VjM1ZpYzNSeUtHa2dLaUF5TENBeUtTd2dNVFlwWEc0Z0lDQWdZWE56WlhKMEtDRnBjMDVoVGloaWVYUmxLU3dnSjBsdWRtRnNhV1FnYUdWNElITjBjbWx1WnljcFhHNGdJQ0FnWW5WbVcyOW1abk5sZENBcklHbGRJRDBnWW5sMFpWeHVJQ0I5WEc0Z0lFSjFabVpsY2k1ZlkyaGhjbk5YY21sMGRHVnVJRDBnYVNBcUlESmNiaUFnY21WMGRYSnVJR2xjYm4xY2JseHVablZ1WTNScGIyNGdYM1YwWmpoWGNtbDBaU0FvWW5WbUxDQnpkSEpwYm1jc0lHOW1abk5sZEN3Z2JHVnVaM1JvS1NCN1hHNGdJSFpoY2lCamFHRnljMWR5YVhSMFpXNGdQU0JDZFdabVpYSXVYMk5vWVhKelYzSnBkSFJsYmlBOVhHNGdJQ0FnWW14cGRFSjFabVpsY2loMWRHWTRWRzlDZVhSbGN5aHpkSEpwYm1jcExDQmlkV1lzSUc5bVpuTmxkQ3dnYkdWdVozUm9LVnh1SUNCeVpYUjFjbTRnWTJoaGNuTlhjbWwwZEdWdVhHNTlYRzVjYm1aMWJtTjBhVzl1SUY5aGMyTnBhVmR5YVhSbElDaGlkV1lzSUhOMGNtbHVaeXdnYjJabWMyVjBMQ0JzWlc1bmRHZ3BJSHRjYmlBZ2RtRnlJR05vWVhKelYzSnBkSFJsYmlBOUlFSjFabVpsY2k1ZlkyaGhjbk5YY21sMGRHVnVJRDFjYmlBZ0lDQmliR2wwUW5WbVptVnlLR0Z6WTJscFZHOUNlWFJsY3loemRISnBibWNwTENCaWRXWXNJRzltWm5ObGRDd2diR1Z1WjNSb0tWeHVJQ0J5WlhSMWNtNGdZMmhoY25OWGNtbDBkR1Z1WEc1OVhHNWNibVoxYm1OMGFXOXVJRjlpYVc1aGNubFhjbWwwWlNBb1luVm1MQ0J6ZEhKcGJtY3NJRzltWm5ObGRDd2diR1Z1WjNSb0tTQjdYRzRnSUhKbGRIVnliaUJmWVhOamFXbFhjbWwwWlNoaWRXWXNJSE4wY21sdVp5d2diMlptYzJWMExDQnNaVzVuZEdncFhHNTlYRzVjYm1aMWJtTjBhVzl1SUY5aVlYTmxOalJYY21sMFpTQW9ZblZtTENCemRISnBibWNzSUc5bVpuTmxkQ3dnYkdWdVozUm9LU0I3WEc0Z0lIWmhjaUJqYUdGeWMxZHlhWFIwWlc0Z1BTQkNkV1ptWlhJdVgyTm9ZWEp6VjNKcGRIUmxiaUE5WEc0Z0lDQWdZbXhwZEVKMVptWmxjaWhpWVhObE5qUlViMEo1ZEdWektITjBjbWx1Wnlrc0lHSjFaaXdnYjJabWMyVjBMQ0JzWlc1bmRHZ3BYRzRnSUhKbGRIVnliaUJqYUdGeWMxZHlhWFIwWlc1Y2JuMWNibHh1Wm5WdVkzUnBiMjRnWDNWMFpqRTJiR1ZYY21sMFpTQW9ZblZtTENCemRISnBibWNzSUc5bVpuTmxkQ3dnYkdWdVozUm9LU0I3WEc0Z0lIWmhjaUJqYUdGeWMxZHlhWFIwWlc0Z1BTQkNkV1ptWlhJdVgyTm9ZWEp6VjNKcGRIUmxiaUE5WEc0Z0lDQWdZbXhwZEVKMVptWmxjaWgxZEdZeE5teGxWRzlDZVhSbGN5aHpkSEpwYm1jcExDQmlkV1lzSUc5bVpuTmxkQ3dnYkdWdVozUm9LVnh1SUNCeVpYUjFjbTRnWTJoaGNuTlhjbWwwZEdWdVhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1ZDNKcGRHVWdQU0JtZFc1amRHbHZiaUFvYzNSeWFXNW5MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDd2daVzVqYjJScGJtY3BJSHRjYmlBZ0x5OGdVM1Z3Y0c5eWRDQmliM1JvSUNoemRISnBibWNzSUc5bVpuTmxkQ3dnYkdWdVozUm9MQ0JsYm1OdlpHbHVaeWxjYmlBZ0x5OGdZVzVrSUhSb1pTQnNaV2RoWTNrZ0tITjBjbWx1Wnl3Z1pXNWpiMlJwYm1jc0lHOW1abk5sZEN3Z2JHVnVaM1JvS1Z4dUlDQnBaaUFvYVhOR2FXNXBkR1VvYjJabWMyVjBLU2tnZTF4dUlDQWdJR2xtSUNnaGFYTkdhVzVwZEdVb2JHVnVaM1JvS1NrZ2UxeHVJQ0FnSUNBZ1pXNWpiMlJwYm1jZ1BTQnNaVzVuZEdoY2JpQWdJQ0FnSUd4bGJtZDBhQ0E5SUhWdVpHVm1hVzVsWkZ4dUlDQWdJSDFjYmlBZ2ZTQmxiSE5sSUhzZ0lDOHZJR3hsWjJGamVWeHVJQ0FnSUhaaGNpQnpkMkZ3SUQwZ1pXNWpiMlJwYm1kY2JpQWdJQ0JsYm1OdlpHbHVaeUE5SUc5bVpuTmxkRnh1SUNBZ0lHOW1abk5sZENBOUlHeGxibWQwYUZ4dUlDQWdJR3hsYm1kMGFDQTlJSE4zWVhCY2JpQWdmVnh1WEc0Z0lHOW1abk5sZENBOUlFNTFiV0psY2lodlptWnpaWFFwSUh4OElEQmNiaUFnZG1GeUlISmxiV0ZwYm1sdVp5QTlJSFJvYVhNdWJHVnVaM1JvSUMwZ2IyWm1jMlYwWEc0Z0lHbG1JQ2doYkdWdVozUm9LU0I3WEc0Z0lDQWdiR1Z1WjNSb0lEMGdjbVZ0WVdsdWFXNW5YRzRnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdiR1Z1WjNSb0lEMGdUblZ0WW1WeUtHeGxibWQwYUNsY2JpQWdJQ0JwWmlBb2JHVnVaM1JvSUQ0Z2NtVnRZV2x1YVc1bktTQjdYRzRnSUNBZ0lDQnNaVzVuZEdnZ1BTQnlaVzFoYVc1cGJtZGNiaUFnSUNCOVhHNGdJSDFjYmlBZ1pXNWpiMlJwYm1jZ1BTQlRkSEpwYm1jb1pXNWpiMlJwYm1jZ2ZId2dKM1YwWmpnbktTNTBiMHh2ZDJWeVEyRnpaU2dwWEc1Y2JpQWdkbUZ5SUhKbGRGeHVJQ0J6ZDJsMFkyZ2dLR1Z1WTI5a2FXNW5LU0I3WEc0Z0lDQWdZMkZ6WlNBbmFHVjRKenBjYmlBZ0lDQWdJSEpsZENBOUlGOW9aWGhYY21sMFpTaDBhR2x6TENCemRISnBibWNzSUc5bVpuTmxkQ3dnYkdWdVozUm9LVnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZDFkR1k0SnpwY2JpQWdJQ0JqWVhObElDZDFkR1l0T0NjNlhHNGdJQ0FnSUNCeVpYUWdQU0JmZFhSbU9GZHlhWFJsS0hSb2FYTXNJSE4wY21sdVp5d2diMlptYzJWMExDQnNaVzVuZEdncFhHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjJGelkybHBKenBjYmlBZ0lDQWdJSEpsZENBOUlGOWhjMk5wYVZkeWFYUmxLSFJvYVhNc0lITjBjbWx1Wnl3Z2IyWm1jMlYwTENCc1pXNW5kR2dwWEc0Z0lDQWdJQ0JpY21WaGExeHVJQ0FnSUdOaGMyVWdKMkpwYm1GeWVTYzZYRzRnSUNBZ0lDQnlaWFFnUFNCZlltbHVZWEo1VjNKcGRHVW9kR2hwY3l3Z2MzUnlhVzVuTENCdlptWnpaWFFzSUd4bGJtZDBhQ2xjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWTJGelpTQW5ZbUZ6WlRZMEp6cGNiaUFnSUNBZ0lISmxkQ0E5SUY5aVlYTmxOalJYY21sMFpTaDBhR2x6TENCemRISnBibWNzSUc5bVpuTmxkQ3dnYkdWdVozUm9LVnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZDFZM015SnpwY2JpQWdJQ0JqWVhObElDZDFZM010TWljNlhHNGdJQ0FnWTJGelpTQW5kWFJtTVRac1pTYzZYRzRnSUNBZ1kyRnpaU0FuZFhSbUxURTJiR1VuT2x4dUlDQWdJQ0FnY21WMElEMGdYM1YwWmpFMmJHVlhjbWwwWlNoMGFHbHpMQ0J6ZEhKcGJtY3NJRzltWm5ObGRDd2diR1Z1WjNSb0tWeHVJQ0FnSUNBZ1luSmxZV3RjYmlBZ0lDQmtaV1poZFd4ME9seHVJQ0FnSUNBZ2RHaHliM2NnYm1WM0lFVnljbTl5S0NkVmJtdHViM2R1SUdWdVkyOWthVzVuSnlsY2JpQWdmVnh1SUNCeVpYUjFjbTRnY21WMFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1ZEc5VGRISnBibWNnUFNCbWRXNWpkR2x2YmlBb1pXNWpiMlJwYm1jc0lITjBZWEowTENCbGJtUXBJSHRjYmlBZ2RtRnlJSE5sYkdZZ1BTQjBhR2x6WEc1Y2JpQWdaVzVqYjJScGJtY2dQU0JUZEhKcGJtY29aVzVqYjJScGJtY2dmSHdnSjNWMFpqZ25LUzUwYjB4dmQyVnlRMkZ6WlNncFhHNGdJSE4wWVhKMElEMGdUblZ0WW1WeUtITjBZWEowS1NCOGZDQXdYRzRnSUdWdVpDQTlJQ2hsYm1RZ0lUMDlJSFZ1WkdWbWFXNWxaQ2xjYmlBZ0lDQS9JRTUxYldKbGNpaGxibVFwWEc0Z0lDQWdPaUJsYm1RZ1BTQnpaV3htTG14bGJtZDBhRnh1WEc0Z0lDOHZJRVpoYzNSd1lYUm9JR1Z0Y0hSNUlITjBjbWx1WjNOY2JpQWdhV1lnS0dWdVpDQTlQVDBnYzNSaGNuUXBYRzRnSUNBZ2NtVjBkWEp1SUNjblhHNWNiaUFnZG1GeUlISmxkRnh1SUNCemQybDBZMmdnS0dWdVkyOWthVzVuS1NCN1hHNGdJQ0FnWTJGelpTQW5hR1Y0SnpwY2JpQWdJQ0FnSUhKbGRDQTlJRjlvWlhoVGJHbGpaU2h6Wld4bUxDQnpkR0Z5ZEN3Z1pXNWtLVnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZDFkR1k0SnpwY2JpQWdJQ0JqWVhObElDZDFkR1l0T0NjNlhHNGdJQ0FnSUNCeVpYUWdQU0JmZFhSbU9GTnNhV05sS0hObGJHWXNJSE4wWVhKMExDQmxibVFwWEc0Z0lDQWdJQ0JpY21WaGExeHVJQ0FnSUdOaGMyVWdKMkZ6WTJscEp6cGNiaUFnSUNBZ0lISmxkQ0E5SUY5aGMyTnBhVk5zYVdObEtITmxiR1lzSUhOMFlYSjBMQ0JsYm1RcFhHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjJKcGJtRnllU2M2WEc0Z0lDQWdJQ0J5WlhRZ1BTQmZZbWx1WVhKNVUyeHBZMlVvYzJWc1ppd2djM1JoY25Rc0lHVnVaQ2xjYmlBZ0lDQWdJR0p5WldGclhHNGdJQ0FnWTJGelpTQW5ZbUZ6WlRZMEp6cGNiaUFnSUNBZ0lISmxkQ0E5SUY5aVlYTmxOalJUYkdsalpTaHpaV3htTENCemRHRnlkQ3dnWlc1a0tWeHVJQ0FnSUNBZ1luSmxZV3RjYmlBZ0lDQmpZWE5sSUNkMVkzTXlKenBjYmlBZ0lDQmpZWE5sSUNkMVkzTXRNaWM2WEc0Z0lDQWdZMkZ6WlNBbmRYUm1NVFpzWlNjNlhHNGdJQ0FnWTJGelpTQW5kWFJtTFRFMmJHVW5PbHh1SUNBZ0lDQWdjbVYwSUQwZ1gzVjBaakUyYkdWVGJHbGpaU2h6Wld4bUxDQnpkR0Z5ZEN3Z1pXNWtLVnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JrWldaaGRXeDBPbHh1SUNBZ0lDQWdkR2h5YjNjZ2JtVjNJRVZ5Y205eUtDZFZibXR1YjNkdUlHVnVZMjlrYVc1bkp5bGNiaUFnZlZ4dUlDQnlaWFIxY200Z2NtVjBYRzU5WEc1Y2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdWRHOUtVMDlPSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNCeVpYUjFjbTRnZTF4dUlDQWdJSFI1Y0dVNklDZENkV1ptWlhJbkxGeHVJQ0FnSUdSaGRHRTZJRUZ5Y21GNUxuQnliM1J2ZEhsd1pTNXpiR2xqWlM1allXeHNLSFJvYVhNdVgyRnljaUI4ZkNCMGFHbHpMQ0F3S1Z4dUlDQjlYRzU5WEc1Y2JpOHZJR052Y0hrb2RHRnlaMlYwUW5WbVptVnlMQ0IwWVhKblpYUlRkR0Z5ZEQwd0xDQnpiM1Z5WTJWVGRHRnlkRDB3TENCemIzVnlZMlZGYm1ROVluVm1abVZ5TG14bGJtZDBhQ2xjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1WTI5d2VTQTlJR1oxYm1OMGFXOXVJQ2gwWVhKblpYUXNJSFJoY21kbGRGOXpkR0Z5ZEN3Z2MzUmhjblFzSUdWdVpDa2dlMXh1SUNCMllYSWdjMjkxY21ObElEMGdkR2hwYzF4dVhHNGdJR2xtSUNnaGMzUmhjblFwSUhOMFlYSjBJRDBnTUZ4dUlDQnBaaUFvSVdWdVpDQW1KaUJsYm1RZ0lUMDlJREFwSUdWdVpDQTlJSFJvYVhNdWJHVnVaM1JvWEc0Z0lHbG1JQ2doZEdGeVoyVjBYM04wWVhKMEtTQjBZWEpuWlhSZmMzUmhjblFnUFNBd1hHNWNiaUFnTHk4Z1EyOXdlU0F3SUdKNWRHVnpPeUIzWlNkeVpTQmtiMjVsWEc0Z0lHbG1JQ2hsYm1RZ1BUMDlJSE4wWVhKMEtTQnlaWFIxY201Y2JpQWdhV1lnS0hSaGNtZGxkQzVzWlc1bmRHZ2dQVDA5SURBZ2ZId2djMjkxY21ObExteGxibWQwYUNBOVBUMGdNQ2tnY21WMGRYSnVYRzVjYmlBZ0x5OGdSbUYwWVd3Z1pYSnliM0lnWTI5dVpHbDBhVzl1YzF4dUlDQmhjM05sY25Rb1pXNWtJRDQ5SUhOMFlYSjBMQ0FuYzI5MWNtTmxSVzVrSUR3Z2MyOTFjbU5sVTNSaGNuUW5LVnh1SUNCaGMzTmxjblFvZEdGeVoyVjBYM04wWVhKMElENDlJREFnSmlZZ2RHRnlaMlYwWDNOMFlYSjBJRHdnZEdGeVoyVjBMbXhsYm1kMGFDeGNiaUFnSUNBZ0lDZDBZWEpuWlhSVGRHRnlkQ0J2ZFhRZ2IyWWdZbTkxYm1Sekp5bGNiaUFnWVhOelpYSjBLSE4wWVhKMElENDlJREFnSmlZZ2MzUmhjblFnUENCemIzVnlZMlV1YkdWdVozUm9MQ0FuYzI5MWNtTmxVM1JoY25RZ2IzVjBJRzltSUdKdmRXNWtjeWNwWEc0Z0lHRnpjMlZ5ZENobGJtUWdQajBnTUNBbUppQmxibVFnUEQwZ2MyOTFjbU5sTG14bGJtZDBhQ3dnSjNOdmRYSmpaVVZ1WkNCdmRYUWdiMllnWW05MWJtUnpKeWxjYmx4dUlDQXZMeUJCY21VZ2QyVWdiMjlpUDF4dUlDQnBaaUFvWlc1a0lENGdkR2hwY3k1c1pXNW5kR2dwWEc0Z0lDQWdaVzVrSUQwZ2RHaHBjeTVzWlc1bmRHaGNiaUFnYVdZZ0tIUmhjbWRsZEM1c1pXNW5kR2dnTFNCMFlYSm5aWFJmYzNSaGNuUWdQQ0JsYm1RZ0xTQnpkR0Z5ZENsY2JpQWdJQ0JsYm1RZ1BTQjBZWEpuWlhRdWJHVnVaM1JvSUMwZ2RHRnlaMlYwWDNOMFlYSjBJQ3NnYzNSaGNuUmNibHh1SUNCMllYSWdiR1Z1SUQwZ1pXNWtJQzBnYzNSaGNuUmNibHh1SUNCcFppQW9iR1Z1SUR3Z01UQXdJSHg4SUNGQ2RXWm1aWEl1WDNWelpWUjVjR1ZrUVhKeVlYbHpLU0I3WEc0Z0lDQWdabTl5SUNoMllYSWdhU0E5SURBN0lHa2dQQ0JzWlc0N0lHa3JLeWxjYmlBZ0lDQWdJSFJoY21kbGRGdHBJQ3NnZEdGeVoyVjBYM04wWVhKMFhTQTlJSFJvYVhOYmFTQXJJSE4wWVhKMFhWeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lIUmhjbWRsZEM1ZmMyVjBLSFJvYVhNdWMzVmlZWEp5WVhrb2MzUmhjblFzSUhOMFlYSjBJQ3NnYkdWdUtTd2dkR0Z5WjJWMFgzTjBZWEowS1Z4dUlDQjlYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOWlZWE5sTmpSVGJHbGpaU0FvWW5WbUxDQnpkR0Z5ZEN3Z1pXNWtLU0I3WEc0Z0lHbG1JQ2h6ZEdGeWRDQTlQVDBnTUNBbUppQmxibVFnUFQwOUlHSjFaaTVzWlc1bmRHZ3BJSHRjYmlBZ0lDQnlaWFIxY200Z1ltRnpaVFkwTG1aeWIyMUNlWFJsUVhKeVlYa29ZblZtS1Z4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUhKbGRIVnliaUJpWVhObE5qUXVabkp2YlVKNWRHVkJjbkpoZVNoaWRXWXVjMnhwWTJVb2MzUmhjblFzSUdWdVpDa3BYRzRnSUgxY2JuMWNibHh1Wm5WdVkzUnBiMjRnWDNWMFpqaFRiR2xqWlNBb1luVm1MQ0J6ZEdGeWRDd2daVzVrS1NCN1hHNGdJSFpoY2lCeVpYTWdQU0FuSjF4dUlDQjJZWElnZEcxd0lEMGdKeWRjYmlBZ1pXNWtJRDBnVFdGMGFDNXRhVzRvWW5WbUxteGxibWQwYUN3Z1pXNWtLVnh1WEc0Z0lHWnZjaUFvZG1GeUlHa2dQU0J6ZEdGeWREc2dhU0E4SUdWdVpEc2dhU3NyS1NCN1hHNGdJQ0FnYVdZZ0tHSjFabHRwWFNBOFBTQXdlRGRHS1NCN1hHNGdJQ0FnSUNCeVpYTWdLejBnWkdWamIyUmxWWFJtT0VOb1lYSW9kRzF3S1NBcklGTjBjbWx1Wnk1bWNtOXRRMmhoY2tOdlpHVW9ZblZtVzJsZEtWeHVJQ0FnSUNBZ2RHMXdJRDBnSnlkY2JpQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdkRzF3SUNzOUlDY2xKeUFySUdKMVpsdHBYUzUwYjFOMGNtbHVaeWd4TmlsY2JpQWdJQ0I5WEc0Z0lIMWNibHh1SUNCeVpYUjFjbTRnY21WeklDc2daR1ZqYjJSbFZYUm1PRU5vWVhJb2RHMXdLVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZZWE5qYVdsVGJHbGpaU0FvWW5WbUxDQnpkR0Z5ZEN3Z1pXNWtLU0I3WEc0Z0lIWmhjaUJ5WlhRZ1BTQW5KMXh1SUNCbGJtUWdQU0JOWVhSb0xtMXBiaWhpZFdZdWJHVnVaM1JvTENCbGJtUXBYRzVjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJSE4wWVhKME95QnBJRHdnWlc1a095QnBLeXNwWEc0Z0lDQWdjbVYwSUNzOUlGTjBjbWx1Wnk1bWNtOXRRMmhoY2tOdlpHVW9ZblZtVzJsZEtWeHVJQ0J5WlhSMWNtNGdjbVYwWEc1OVhHNWNibVoxYm1OMGFXOXVJRjlpYVc1aGNubFRiR2xqWlNBb1luVm1MQ0J6ZEdGeWRDd2daVzVrS1NCN1hHNGdJSEpsZEhWeWJpQmZZWE5qYVdsVGJHbGpaU2hpZFdZc0lITjBZWEowTENCbGJtUXBYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOW9aWGhUYkdsalpTQW9ZblZtTENCemRHRnlkQ3dnWlc1a0tTQjdYRzRnSUhaaGNpQnNaVzRnUFNCaWRXWXViR1Z1WjNSb1hHNWNiaUFnYVdZZ0tDRnpkR0Z5ZENCOGZDQnpkR0Z5ZENBOElEQXBJSE4wWVhKMElEMGdNRnh1SUNCcFppQW9JV1Z1WkNCOGZDQmxibVFnUENBd0lIeDhJR1Z1WkNBK0lHeGxiaWtnWlc1a0lEMGdiR1Z1WEc1Y2JpQWdkbUZ5SUc5MWRDQTlJQ2NuWEc0Z0lHWnZjaUFvZG1GeUlHa2dQU0J6ZEdGeWREc2dhU0E4SUdWdVpEc2dhU3NyS1NCN1hHNGdJQ0FnYjNWMElDczlJSFJ2U0dWNEtHSjFabHRwWFNsY2JpQWdmVnh1SUNCeVpYUjFjbTRnYjNWMFhHNTlYRzVjYm1aMWJtTjBhVzl1SUY5MWRHWXhObXhsVTJ4cFkyVWdLR0oxWml3Z2MzUmhjblFzSUdWdVpDa2dlMXh1SUNCMllYSWdZbmwwWlhNZ1BTQmlkV1l1YzJ4cFkyVW9jM1JoY25Rc0lHVnVaQ2xjYmlBZ2RtRnlJSEpsY3lBOUlDY25YRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z1lubDBaWE11YkdWdVozUm9PeUJwSUNzOUlESXBJSHRjYmlBZ0lDQnlaWE1nS3owZ1UzUnlhVzVuTG1aeWIyMURhR0Z5UTI5a1pTaGllWFJsYzF0cFhTQXJJR0o1ZEdWelcya3JNVjBnS2lBeU5UWXBYRzRnSUgxY2JpQWdjbVYwZFhKdUlISmxjMXh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuTnNhV05sSUQwZ1puVnVZM1JwYjI0Z0tITjBZWEowTENCbGJtUXBJSHRjYmlBZ2RtRnlJR3hsYmlBOUlIUm9hWE11YkdWdVozUm9YRzRnSUhOMFlYSjBJRDBnWTJ4aGJYQW9jM1JoY25Rc0lHeGxiaXdnTUNsY2JpQWdaVzVrSUQwZ1kyeGhiWEFvWlc1a0xDQnNaVzRzSUd4bGJpbGNibHh1SUNCcFppQW9RblZtWm1WeUxsOTFjMlZVZVhCbFpFRnljbUY1Y3lrZ2UxeHVJQ0FnSUhKbGRIVnliaUJDZFdabVpYSXVYMkYxWjIxbGJuUW9kR2hwY3k1emRXSmhjbkpoZVNoemRHRnlkQ3dnWlc1a0tTbGNiaUFnZlNCbGJITmxJSHRjYmlBZ0lDQjJZWElnYzJ4cFkyVk1aVzRnUFNCbGJtUWdMU0J6ZEdGeWRGeHVJQ0FnSUhaaGNpQnVaWGRDZFdZZ1BTQnVaWGNnUW5WbVptVnlLSE5zYVdObFRHVnVMQ0IxYm1SbFptbHVaV1FzSUhSeWRXVXBYRzRnSUNBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQnpiR2xqWlV4bGJqc2dhU3NyS1NCN1hHNGdJQ0FnSUNCdVpYZENkV1piYVYwZ1BTQjBhR2x6VzJrZ0t5QnpkR0Z5ZEYxY2JpQWdJQ0I5WEc0Z0lDQWdjbVYwZFhKdUlHNWxkMEoxWmx4dUlDQjlYRzU5WEc1Y2JpOHZJR0JuWlhSZ0lIZHBiR3dnWW1VZ2NtVnRiM1psWkNCcGJpQk9iMlJsSURBdU1UTXJYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbWRsZENBOUlHWjFibU4wYVc5dUlDaHZabVp6WlhRcElIdGNiaUFnWTI5dWMyOXNaUzVzYjJjb0p5NW5aWFFvS1NCcGN5QmtaWEJ5WldOaGRHVmtMaUJCWTJObGMzTWdkWE5wYm1jZ1lYSnlZWGtnYVc1a1pYaGxjeUJwYm5OMFpXRmtMaWNwWEc0Z0lISmxkSFZ5YmlCMGFHbHpMbkpsWVdSVlNXNTBPQ2h2Wm1aelpYUXBYRzU5WEc1Y2JpOHZJR0J6WlhSZ0lIZHBiR3dnWW1VZ2NtVnRiM1psWkNCcGJpQk9iMlJsSURBdU1UTXJYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbk5sZENBOUlHWjFibU4wYVc5dUlDaDJMQ0J2Wm1aelpYUXBJSHRjYmlBZ1kyOXVjMjlzWlM1c2IyY29KeTV6WlhRb0tTQnBjeUJrWlhCeVpXTmhkR1ZrTGlCQlkyTmxjM01nZFhOcGJtY2dZWEp5WVhrZ2FXNWtaWGhsY3lCcGJuTjBaV0ZrTGljcFhHNGdJSEpsZEhWeWJpQjBhR2x6TG5keWFYUmxWVWx1ZERnb2Rpd2diMlptYzJWMEtWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5KbFlXUlZTVzUwT0NBOUlHWjFibU4wYVc5dUlDaHZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUdsbUlDZ2hibTlCYzNObGNuUXBJSHRjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnYjJabWMyVjBJQ0U5UFNCdWRXeHNMQ0FuYldsemMybHVaeUJ2Wm1aelpYUW5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnUENCMGFHbHpMbXhsYm1kMGFDd2dKMVJ5ZVdsdVp5QjBieUJ5WldGa0lHSmxlVzl1WkNCaWRXWm1aWElnYkdWdVozUm9KeWxjYmlBZ2ZWeHVYRzRnSUdsbUlDaHZabVp6WlhRZ1BqMGdkR2hwY3k1c1pXNW5kR2dwWEc0Z0lDQWdjbVYwZFhKdVhHNWNiaUFnY21WMGRYSnVJSFJvYVhOYmIyWm1jMlYwWFZ4dWZWeHVYRzVtZFc1amRHbHZiaUJmY21WaFpGVkpiblF4TmlBb1luVm1MQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENoMGVYQmxiMllnYkdsMGRHeGxSVzVrYVdGdUlEMDlQU0FuWW05dmJHVmhiaWNzSUNkdGFYTnphVzVuSUc5eUlHbHVkbUZzYVdRZ1pXNWthV0Z1SnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDRTlQU0IxYm1SbFptbHVaV1FnSmlZZ2IyWm1jMlYwSUNFOVBTQnVkV3hzTENBbmJXbHpjMmx1WnlCdlptWnpaWFFuS1Z4dUlDQWdJR0Z6YzJWeWRDaHZabVp6WlhRZ0t5QXhJRHdnWW5WbUxteGxibWQwYUN3Z0oxUnllV2x1WnlCMGJ5QnlaV0ZrSUdKbGVXOXVaQ0JpZFdabVpYSWdiR1Z1WjNSb0p5bGNiaUFnZlZ4dVhHNGdJSFpoY2lCc1pXNGdQU0JpZFdZdWJHVnVaM1JvWEc0Z0lHbG1JQ2h2Wm1aelpYUWdQajBnYkdWdUtWeHVJQ0FnSUhKbGRIVnlibHh1WEc0Z0lIWmhjaUIyWVd4Y2JpQWdhV1lnS0d4cGRIUnNaVVZ1WkdsaGJpa2dlMXh1SUNBZ0lIWmhiQ0E5SUdKMVpsdHZabVp6WlhSZFhHNGdJQ0FnYVdZZ0tHOW1abk5sZENBcklERWdQQ0JzWlc0cFhHNGdJQ0FnSUNCMllXd2dmRDBnWW5WbVcyOW1abk5sZENBcklERmRJRHc4SURoY2JpQWdmU0JsYkhObElIdGNiaUFnSUNCMllXd2dQU0JpZFdaYmIyWm1jMlYwWFNBOFBDQTRYRzRnSUNBZ2FXWWdLRzltWm5ObGRDQXJJREVnUENCc1pXNHBYRzRnSUNBZ0lDQjJZV3dnZkQwZ1luVm1XMjltWm5ObGRDQXJJREZkWEc0Z0lIMWNiaUFnY21WMGRYSnVJSFpoYkZ4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbkpsWVdSVlNXNTBNVFpNUlNBOUlHWjFibU4wYVc5dUlDaHZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUhKbGRIVnliaUJmY21WaFpGVkpiblF4TmloMGFHbHpMQ0J2Wm1aelpYUXNJSFJ5ZFdVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5KbFlXUlZTVzUwTVRaQ1JTQTlJR1oxYm1OMGFXOXVJQ2h2Wm1aelpYUXNJRzV2UVhOelpYSjBLU0I3WEc0Z0lISmxkSFZ5YmlCZmNtVmhaRlZKYm5ReE5paDBhR2x6TENCdlptWnpaWFFzSUdaaGJITmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVablZ1WTNScGIyNGdYM0psWVdSVlNXNTBNeklnS0dKMVppd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSUc1dlFYTnpaWEowS1NCN1hHNGdJR2xtSUNnaGJtOUJjM05sY25RcElIdGNiaUFnSUNCaGMzTmxjblFvZEhsd1pXOW1JR3hwZEhSc1pVVnVaR2xoYmlBOVBUMGdKMkp2YjJ4bFlXNG5MQ0FuYldsemMybHVaeUJ2Y2lCcGJuWmhiR2xrSUdWdVpHbGhiaWNwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUc5bVpuTmxkQ0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnYjJabWMyVjBKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNzZ015QThJR0oxWmk1c1pXNW5kR2dzSUNkVWNubHBibWNnZEc4Z2NtVmhaQ0JpWlhsdmJtUWdZblZtWm1WeUlHeGxibWQwYUNjcFhHNGdJSDFjYmx4dUlDQjJZWElnYkdWdUlEMGdZblZtTG14bGJtZDBhRnh1SUNCcFppQW9iMlptYzJWMElENDlJR3hsYmlsY2JpQWdJQ0J5WlhSMWNtNWNibHh1SUNCMllYSWdkbUZzWEc0Z0lHbG1JQ2hzYVhSMGJHVkZibVJwWVc0cElIdGNiaUFnSUNCcFppQW9iMlptYzJWMElDc2dNaUE4SUd4bGJpbGNiaUFnSUNBZ0lIWmhiQ0E5SUdKMVpsdHZabVp6WlhRZ0t5QXlYU0E4UENBeE5seHVJQ0FnSUdsbUlDaHZabVp6WlhRZ0t5QXhJRHdnYkdWdUtWeHVJQ0FnSUNBZ2RtRnNJSHc5SUdKMVpsdHZabVp6WlhRZ0t5QXhYU0E4UENBNFhHNGdJQ0FnZG1Gc0lIdzlJR0oxWmx0dlptWnpaWFJkWEc0Z0lDQWdhV1lnS0c5bVpuTmxkQ0FySURNZ1BDQnNaVzRwWEc0Z0lDQWdJQ0IyWVd3Z1BTQjJZV3dnS3lBb1luVm1XMjltWm5ObGRDQXJJRE5kSUR3OElESTBJRDQrUGlBd0tWeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lHbG1JQ2h2Wm1aelpYUWdLeUF4SUR3Z2JHVnVLVnh1SUNBZ0lDQWdkbUZzSUQwZ1luVm1XMjltWm5ObGRDQXJJREZkSUR3OElERTJYRzRnSUNBZ2FXWWdLRzltWm5ObGRDQXJJRElnUENCc1pXNHBYRzRnSUNBZ0lDQjJZV3dnZkQwZ1luVm1XMjltWm5ObGRDQXJJREpkSUR3OElEaGNiaUFnSUNCcFppQW9iMlptYzJWMElDc2dNeUE4SUd4bGJpbGNiaUFnSUNBZ0lIWmhiQ0I4UFNCaWRXWmJiMlptYzJWMElDc2dNMTFjYmlBZ0lDQjJZV3dnUFNCMllXd2dLeUFvWW5WbVcyOW1abk5sZEYwZ1BEd2dNalFnUGo0K0lEQXBYRzRnSUgxY2JpQWdjbVYwZFhKdUlIWmhiRnh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuSmxZV1JWU1c1ME16Sk1SU0E5SUdaMWJtTjBhVzl1SUNodlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJSEpsZEhWeWJpQmZjbVZoWkZWSmJuUXpNaWgwYUdsekxDQnZabVp6WlhRc0lIUnlkV1VzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbkpsWVdSVlNXNTBNekpDUlNBOUlHWjFibU4wYVc5dUlDaHZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUhKbGRIVnliaUJmY21WaFpGVkpiblF6TWloMGFHbHpMQ0J2Wm1aelpYUXNJR1poYkhObExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1eVpXRmtTVzUwT0NBOUlHWjFibU4wYVc5dUlDaHZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUdsbUlDZ2hibTlCYzNObGNuUXBJSHRjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnYjJabWMyVjBJQ0U5UFNCdWRXeHNMRnh1SUNBZ0lDQWdJQ0FuYldsemMybHVaeUJ2Wm1aelpYUW5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnUENCMGFHbHpMbXhsYm1kMGFDd2dKMVJ5ZVdsdVp5QjBieUJ5WldGa0lHSmxlVzl1WkNCaWRXWm1aWElnYkdWdVozUm9KeWxjYmlBZ2ZWeHVYRzRnSUdsbUlDaHZabVp6WlhRZ1BqMGdkR2hwY3k1c1pXNW5kR2dwWEc0Z0lDQWdjbVYwZFhKdVhHNWNiaUFnZG1GeUlHNWxaeUE5SUhSb2FYTmJiMlptYzJWMFhTQW1JREI0T0RCY2JpQWdhV1lnS0c1bFp5bGNiaUFnSUNCeVpYUjFjbTRnS0RCNFptWWdMU0IwYUdselcyOW1abk5sZEYwZ0t5QXhLU0FxSUMweFhHNGdJR1ZzYzJWY2JpQWdJQ0J5WlhSMWNtNGdkR2hwYzF0dlptWnpaWFJkWEc1OVhHNWNibVoxYm1OMGFXOXVJRjl5WldGa1NXNTBNVFlnS0dKMVppd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSUc1dlFYTnpaWEowS1NCN1hHNGdJR2xtSUNnaGJtOUJjM05sY25RcElIdGNiaUFnSUNCaGMzTmxjblFvZEhsd1pXOW1JR3hwZEhSc1pVVnVaR2xoYmlBOVBUMGdKMkp2YjJ4bFlXNG5MQ0FuYldsemMybHVaeUJ2Y2lCcGJuWmhiR2xrSUdWdVpHbGhiaWNwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUc5bVpuTmxkQ0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnYjJabWMyVjBKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNzZ01TQThJR0oxWmk1c1pXNW5kR2dzSUNkVWNubHBibWNnZEc4Z2NtVmhaQ0JpWlhsdmJtUWdZblZtWm1WeUlHeGxibWQwYUNjcFhHNGdJSDFjYmx4dUlDQjJZWElnYkdWdUlEMGdZblZtTG14bGJtZDBhRnh1SUNCcFppQW9iMlptYzJWMElENDlJR3hsYmlsY2JpQWdJQ0J5WlhSMWNtNWNibHh1SUNCMllYSWdkbUZzSUQwZ1gzSmxZV1JWU1c1ME1UWW9ZblZtTENCdlptWnpaWFFzSUd4cGRIUnNaVVZ1WkdsaGJpd2dkSEoxWlNsY2JpQWdkbUZ5SUc1bFp5QTlJSFpoYkNBbUlEQjRPREF3TUZ4dUlDQnBaaUFvYm1WbktWeHVJQ0FnSUhKbGRIVnliaUFvTUhobVptWm1JQzBnZG1Gc0lDc2dNU2tnS2lBdE1WeHVJQ0JsYkhObFhHNGdJQ0FnY21WMGRYSnVJSFpoYkZ4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbkpsWVdSSmJuUXhOa3hGSUQwZ1puVnVZM1JwYjI0Z0tHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnY21WMGRYSnVJRjl5WldGa1NXNTBNVFlvZEdocGN5d2diMlptYzJWMExDQjBjblZsTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzV5WldGa1NXNTBNVFpDUlNBOUlHWjFibU4wYVc5dUlDaHZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUhKbGRIVnliaUJmY21WaFpFbHVkREUyS0hSb2FYTXNJRzltWm5ObGRDd2dabUZzYzJVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1bWRXNWpkR2x2YmlCZmNtVmhaRWx1ZERNeUlDaGlkV1lzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDa2dlMXh1SUNCcFppQW9JVzV2UVhOelpYSjBLU0I3WEc0Z0lDQWdZWE56WlhKMEtIUjVjR1Z2WmlCc2FYUjBiR1ZGYm1ScFlXNGdQVDA5SUNkaWIyOXNaV0Z1Snl3Z0oyMXBjM05wYm1jZ2IzSWdhVzUyWVd4cFpDQmxibVJwWVc0bktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQnZabVp6WlhRZ0lUMDlJRzUxYkd3c0lDZHRhWE56YVc1bklHOW1abk5sZENjcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQXJJRE1nUENCaWRXWXViR1Z1WjNSb0xDQW5WSEo1YVc1bklIUnZJSEpsWVdRZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNCOVhHNWNiaUFnZG1GeUlHeGxiaUE5SUdKMVppNXNaVzVuZEdoY2JpQWdhV1lnS0c5bVpuTmxkQ0ErUFNCc1pXNHBYRzRnSUNBZ2NtVjBkWEp1WEc1Y2JpQWdkbUZ5SUhaaGJDQTlJRjl5WldGa1ZVbHVkRE15S0dKMVppd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSUhSeWRXVXBYRzRnSUhaaGNpQnVaV2NnUFNCMllXd2dKaUF3ZURnd01EQXdNREF3WEc0Z0lHbG1JQ2h1WldjcFhHNGdJQ0FnY21WMGRYSnVJQ2d3ZUdabVptWm1abVptSUMwZ2RtRnNJQ3NnTVNrZ0tpQXRNVnh1SUNCbGJITmxYRzRnSUNBZ2NtVjBkWEp1SUhaaGJGeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5KbFlXUkpiblF6TWt4RklEMGdablZ1WTNScGIyNGdLRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ2NtVjBkWEp1SUY5eVpXRmtTVzUwTXpJb2RHaHBjeXdnYjJabWMyVjBMQ0IwY25WbExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1eVpXRmtTVzUwTXpKQ1JTQTlJR1oxYm1OMGFXOXVJQ2h2Wm1aelpYUXNJRzV2UVhOelpYSjBLU0I3WEc0Z0lISmxkSFZ5YmlCZmNtVmhaRWx1ZERNeUtIUm9hWE1zSUc5bVpuTmxkQ3dnWm1Gc2MyVXNJRzV2UVhOelpYSjBLVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZjbVZoWkVac2IyRjBJQ2hpZFdZc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLSFI1Y0dWdlppQnNhWFIwYkdWRmJtUnBZVzRnUFQwOUlDZGliMjlzWldGdUp5d2dKMjFwYzNOcGJtY2diM0lnYVc1MllXeHBaQ0JsYm1ScFlXNG5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnS3lBeklEd2dZblZtTG14bGJtZDBhQ3dnSjFSeWVXbHVaeUIwYnlCeVpXRmtJR0psZVc5dVpDQmlkV1ptWlhJZ2JHVnVaM1JvSnlsY2JpQWdmVnh1WEc0Z0lISmxkSFZ5YmlCcFpXVmxOelUwTG5KbFlXUW9ZblZtTENCdlptWnpaWFFzSUd4cGRIUnNaVVZ1WkdsaGJpd2dNak1zSURRcFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1Y21WaFpFWnNiMkYwVEVVZ1BTQm1kVzVqZEdsdmJpQW9iMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCeVpYUjFjbTRnWDNKbFlXUkdiRzloZENoMGFHbHpMQ0J2Wm1aelpYUXNJSFJ5ZFdVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5KbFlXUkdiRzloZEVKRklEMGdablZ1WTNScGIyNGdLRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ2NtVjBkWEp1SUY5eVpXRmtSbXh2WVhRb2RHaHBjeXdnYjJabWMyVjBMQ0JtWVd4elpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOXlaV0ZrUkc5MVlteGxJQ2hpZFdZc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLSFI1Y0dWdlppQnNhWFIwYkdWRmJtUnBZVzRnUFQwOUlDZGliMjlzWldGdUp5d2dKMjFwYzNOcGJtY2diM0lnYVc1MllXeHBaQ0JsYm1ScFlXNG5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnS3lBM0lEd2dZblZtTG14bGJtZDBhQ3dnSjFSeWVXbHVaeUIwYnlCeVpXRmtJR0psZVc5dVpDQmlkV1ptWlhJZ2JHVnVaM1JvSnlsY2JpQWdmVnh1WEc0Z0lISmxkSFZ5YmlCcFpXVmxOelUwTG5KbFlXUW9ZblZtTENCdlptWnpaWFFzSUd4cGRIUnNaVVZ1WkdsaGJpd2dOVElzSURncFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1Y21WaFpFUnZkV0pzWlV4RklEMGdablZ1WTNScGIyNGdLRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ2NtVjBkWEp1SUY5eVpXRmtSRzkxWW14bEtIUm9hWE1zSUc5bVpuTmxkQ3dnZEhKMVpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdWNtVmhaRVJ2ZFdKc1pVSkZJRDBnWm5WdVkzUnBiMjRnS0c5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdjbVYwZFhKdUlGOXlaV0ZrUkc5MVlteGxLSFJvYVhNc0lHOW1abk5sZEN3Z1ptRnNjMlVzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbmR5YVhSbFZVbHVkRGdnUFNCbWRXNWpkR2x2YmlBb2RtRnNkV1VzSUc5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdhV1lnS0NGdWIwRnpjMlZ5ZENrZ2UxeHVJQ0FnSUdGemMyVnlkQ2gyWVd4MVpTQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlIWmhiSFZsSUNFOVBTQnVkV3hzTENBbmJXbHpjMmx1WnlCMllXeDFaU2NwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUc5bVpuTmxkQ0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnYjJabWMyVjBKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUR3Z2RHaHBjeTVzWlc1bmRHZ3NJQ2QwY25scGJtY2dkRzhnZDNKcGRHVWdZbVY1YjI1a0lHSjFabVpsY2lCc1pXNW5kR2duS1Z4dUlDQWdJSFpsY21sbWRXbHVkQ2gyWVd4MVpTd2dNSGhtWmlsY2JpQWdmVnh1WEc0Z0lHbG1JQ2h2Wm1aelpYUWdQajBnZEdocGN5NXNaVzVuZEdncElISmxkSFZ5Ymx4dVhHNGdJSFJvYVhOYmIyWm1jMlYwWFNBOUlIWmhiSFZsWEc1OVhHNWNibVoxYm1OMGFXOXVJRjkzY21sMFpWVkpiblF4TmlBb1luVm1MQ0IyWVd4MVpTd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSUc1dlFYTnpaWEowS1NCN1hHNGdJR2xtSUNnaGJtOUJjM05sY25RcElIdGNiaUFnSUNCaGMzTmxjblFvZG1Gc2RXVWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQjJZV3gxWlNBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2RtRnNkV1VuS1Z4dUlDQWdJR0Z6YzJWeWRDaDBlWEJsYjJZZ2JHbDBkR3hsUlc1a2FXRnVJRDA5UFNBblltOXZiR1ZoYmljc0lDZHRhWE56YVc1bklHOXlJR2x1ZG1Gc2FXUWdaVzVrYVdGdUp5bGNiaUFnSUNCaGMzTmxjblFvYjJabWMyVjBJQ0U5UFNCMWJtUmxabWx1WldRZ0ppWWdiMlptYzJWMElDRTlQU0J1ZFd4c0xDQW5iV2x6YzJsdVp5QnZabVp6WlhRbktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdLeUF4SUR3Z1luVm1MbXhsYm1kMGFDd2dKM1J5ZVdsdVp5QjBieUIzY21sMFpTQmlaWGx2Ym1RZ1luVm1abVZ5SUd4bGJtZDBhQ2NwWEc0Z0lDQWdkbVZ5YVdaMWFXNTBLSFpoYkhWbExDQXdlR1ptWm1ZcFhHNGdJSDFjYmx4dUlDQjJZWElnYkdWdUlEMGdZblZtTG14bGJtZDBhRnh1SUNCcFppQW9iMlptYzJWMElENDlJR3hsYmlsY2JpQWdJQ0J5WlhSMWNtNWNibHh1SUNCbWIzSWdLSFpoY2lCcElEMGdNQ3dnYWlBOUlFMWhkR2d1YldsdUtHeGxiaUF0SUc5bVpuTmxkQ3dnTWlrN0lHa2dQQ0JxT3lCcEt5c3BJSHRjYmlBZ0lDQmlkV1piYjJabWMyVjBJQ3NnYVYwZ1BWeHVJQ0FnSUNBZ0lDQW9kbUZzZFdVZ0ppQW9NSGhtWmlBOFBDQW9PQ0FxSUNoc2FYUjBiR1ZGYm1ScFlXNGdQeUJwSURvZ01TQXRJR2twS1NrcElENCtQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0tHeHBkSFJzWlVWdVpHbGhiaUEvSUdrZ09pQXhJQzBnYVNrZ0tpQTRYRzRnSUgxY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzUzY21sMFpWVkpiblF4Tmt4RklEMGdablZ1WTNScGIyNGdLSFpoYkhWbExDQnZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUY5M2NtbDBaVlZKYm5ReE5paDBhR2x6TENCMllXeDFaU3dnYjJabWMyVjBMQ0IwY25WbExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1M2NtbDBaVlZKYm5ReE5rSkZJRDBnWm5WdVkzUnBiMjRnS0haaGJIVmxMQ0J2Wm1aelpYUXNJRzV2UVhOelpYSjBLU0I3WEc0Z0lGOTNjbWwwWlZWSmJuUXhOaWgwYUdsekxDQjJZV3gxWlN3Z2IyWm1jMlYwTENCbVlXeHpaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNibVoxYm1OMGFXOXVJRjkzY21sMFpWVkpiblF6TWlBb1luVm1MQ0IyWVd4MVpTd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSUc1dlFYTnpaWEowS1NCN1hHNGdJR2xtSUNnaGJtOUJjM05sY25RcElIdGNiaUFnSUNCaGMzTmxjblFvZG1Gc2RXVWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQjJZV3gxWlNBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2RtRnNkV1VuS1Z4dUlDQWdJR0Z6YzJWeWRDaDBlWEJsYjJZZ2JHbDBkR3hsUlc1a2FXRnVJRDA5UFNBblltOXZiR1ZoYmljc0lDZHRhWE56YVc1bklHOXlJR2x1ZG1Gc2FXUWdaVzVrYVdGdUp5bGNiaUFnSUNCaGMzTmxjblFvYjJabWMyVjBJQ0U5UFNCMWJtUmxabWx1WldRZ0ppWWdiMlptYzJWMElDRTlQU0J1ZFd4c0xDQW5iV2x6YzJsdVp5QnZabVp6WlhRbktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdLeUF6SUR3Z1luVm1MbXhsYm1kMGFDd2dKM1J5ZVdsdVp5QjBieUIzY21sMFpTQmlaWGx2Ym1RZ1luVm1abVZ5SUd4bGJtZDBhQ2NwWEc0Z0lDQWdkbVZ5YVdaMWFXNTBLSFpoYkhWbExDQXdlR1ptWm1abVptWm1LVnh1SUNCOVhHNWNiaUFnZG1GeUlHeGxiaUE5SUdKMVppNXNaVzVuZEdoY2JpQWdhV1lnS0c5bVpuTmxkQ0ErUFNCc1pXNHBYRzRnSUNBZ2NtVjBkWEp1WEc1Y2JpQWdabTl5SUNoMllYSWdhU0E5SURBc0lHb2dQU0JOWVhSb0xtMXBiaWhzWlc0Z0xTQnZabVp6WlhRc0lEUXBPeUJwSUR3Z2Fqc2dhU3NyS1NCN1hHNGdJQ0FnWW5WbVcyOW1abk5sZENBcklHbGRJRDFjYmlBZ0lDQWdJQ0FnS0haaGJIVmxJRDQrUGlBb2JHbDBkR3hsUlc1a2FXRnVJRDhnYVNBNklETWdMU0JwS1NBcUlEZ3BJQ1lnTUhobVpseHVJQ0I5WEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkM0pwZEdWVlNXNTBNekpNUlNBOUlHWjFibU4wYVc5dUlDaDJZV3gxWlN3Z2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JmZDNKcGRHVlZTVzUwTXpJb2RHaHBjeXdnZG1Gc2RXVXNJRzltWm5ObGRDd2dkSEoxWlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1ZDNKcGRHVlZTVzUwTXpKQ1JTQTlJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2diMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCZmQzSnBkR1ZWU1c1ME16SW9kR2hwY3l3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnWm1Gc2MyVXNJRzV2UVhOelpYSjBLVnh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuZHlhWFJsU1c1ME9DQTlJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2diMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCcFppQW9JVzV2UVhOelpYSjBLU0I3WEc0Z0lDQWdZWE56WlhKMEtIWmhiSFZsSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnZG1Gc2RXVWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JSFpoYkhWbEp5bGNiaUFnSUNCaGMzTmxjblFvYjJabWMyVjBJQ0U5UFNCMWJtUmxabWx1WldRZ0ppWWdiMlptYzJWMElDRTlQU0J1ZFd4c0xDQW5iV2x6YzJsdVp5QnZabVp6WlhRbktWeHVJQ0FnSUdGemMyVnlkQ2h2Wm1aelpYUWdQQ0IwYUdsekxteGxibWQwYUN3Z0oxUnllV2x1WnlCMGJ5QjNjbWwwWlNCaVpYbHZibVFnWW5WbVptVnlJR3hsYm1kMGFDY3BYRzRnSUNBZ2RtVnlhV1p6YVc1MEtIWmhiSFZsTENBd2VEZG1MQ0F0TUhnNE1DbGNiaUFnZlZ4dVhHNGdJR2xtSUNodlptWnpaWFFnUGowZ2RHaHBjeTVzWlc1bmRHZ3BYRzRnSUNBZ2NtVjBkWEp1WEc1Y2JpQWdhV1lnS0haaGJIVmxJRDQ5SURBcFhHNGdJQ0FnZEdocGN5NTNjbWwwWlZWSmJuUTRLSFpoYkhWbExDQnZabVp6WlhRc0lHNXZRWE56WlhKMEtWeHVJQ0JsYkhObFhHNGdJQ0FnZEdocGN5NTNjbWwwWlZWSmJuUTRLREI0Wm1ZZ0t5QjJZV3gxWlNBcklERXNJRzltWm5ObGRDd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOTNjbWwwWlVsdWRERTJJQ2hpZFdZc0lIWmhiSFZsTENCdlptWnpaWFFzSUd4cGRIUnNaVVZ1WkdsaGJpd2dibTlCYzNObGNuUXBJSHRjYmlBZ2FXWWdLQ0Z1YjBGemMyVnlkQ2tnZTF4dUlDQWdJR0Z6YzJWeWRDaDJZV3gxWlNBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUhaaGJIVmxJQ0U5UFNCdWRXeHNMQ0FuYldsemMybHVaeUIyWVd4MVpTY3BYRzRnSUNBZ1lYTnpaWEowS0hSNWNHVnZaaUJzYVhSMGJHVkZibVJwWVc0Z1BUMDlJQ2RpYjI5c1pXRnVKeXdnSjIxcGMzTnBibWNnYjNJZ2FXNTJZV3hwWkNCbGJtUnBZVzRuS1Z4dUlDQWdJR0Z6YzJWeWRDaHZabVp6WlhRZ0lUMDlJSFZ1WkdWbWFXNWxaQ0FtSmlCdlptWnpaWFFnSVQwOUlHNTFiR3dzSUNkdGFYTnphVzVuSUc5bVpuTmxkQ2NwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBcklERWdQQ0JpZFdZdWJHVnVaM1JvTENBblZISjVhVzVuSUhSdklIZHlhWFJsSUdKbGVXOXVaQ0JpZFdabVpYSWdiR1Z1WjNSb0p5bGNiaUFnSUNCMlpYSnBabk5wYm5Rb2RtRnNkV1VzSURCNE4yWm1aaXdnTFRCNE9EQXdNQ2xjYmlBZ2ZWeHVYRzRnSUhaaGNpQnNaVzRnUFNCaWRXWXViR1Z1WjNSb1hHNGdJR2xtSUNodlptWnpaWFFnUGowZ2JHVnVLVnh1SUNBZ0lISmxkSFZ5Ymx4dVhHNGdJR2xtSUNoMllXeDFaU0ErUFNBd0tWeHVJQ0FnSUY5M2NtbDBaVlZKYm5ReE5paGlkV1lzSUhaaGJIVmxMQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcFhHNGdJR1ZzYzJWY2JpQWdJQ0JmZDNKcGRHVlZTVzUwTVRZb1luVm1MQ0F3ZUdabVptWWdLeUIyWVd4MVpTQXJJREVzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1M2NtbDBaVWx1ZERFMlRFVWdQU0JtZFc1amRHbHZiaUFvZG1Gc2RXVXNJRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ1gzZHlhWFJsU1c1ME1UWW9kR2hwY3l3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnZEhKMVpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JrSjFabVpsY2k1d2NtOTBiM1I1Y0dVdWQzSnBkR1ZKYm5ReE5rSkZJRDBnWm5WdVkzUnBiMjRnS0haaGJIVmxMQ0J2Wm1aelpYUXNJRzV2UVhOelpYSjBLU0I3WEc0Z0lGOTNjbWwwWlVsdWRERTJLSFJvYVhNc0lIWmhiSFZsTENCdlptWnpaWFFzSUdaaGJITmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVablZ1WTNScGIyNGdYM2R5YVhSbFNXNTBNeklnS0dKMVppd2dkbUZzZFdVc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLSFpoYkhWbElDRTlQU0IxYm1SbFptbHVaV1FnSmlZZ2RtRnNkV1VnSVQwOUlHNTFiR3dzSUNkdGFYTnphVzVuSUhaaGJIVmxKeWxjYmlBZ0lDQmhjM05sY25Rb2RIbHdaVzltSUd4cGRIUnNaVVZ1WkdsaGJpQTlQVDBnSjJKdmIyeGxZVzRuTENBbmJXbHpjMmx1WnlCdmNpQnBiblpoYkdsa0lHVnVaR2xoYmljcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlHOW1abk5sZENBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2IyWm1jMlYwSnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDc2dNeUE4SUdKMVppNXNaVzVuZEdnc0lDZFVjbmxwYm1jZ2RHOGdkM0pwZEdVZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNBZ0lIWmxjbWxtYzJsdWRDaDJZV3gxWlN3Z01IZzNabVptWm1abVppd2dMVEI0T0RBd01EQXdNREFwWEc0Z0lIMWNibHh1SUNCMllYSWdiR1Z1SUQwZ1luVm1MbXhsYm1kMGFGeHVJQ0JwWmlBb2IyWm1jMlYwSUQ0OUlHeGxiaWxjYmlBZ0lDQnlaWFIxY201Y2JseHVJQ0JwWmlBb2RtRnNkV1VnUGowZ01DbGNiaUFnSUNCZmQzSnBkR1ZWU1c1ME16SW9ZblZtTENCMllXeDFaU3dnYjJabWMyVjBMQ0JzYVhSMGJHVkZibVJwWVc0c0lHNXZRWE56WlhKMEtWeHVJQ0JsYkhObFhHNGdJQ0FnWDNkeWFYUmxWVWx1ZERNeUtHSjFaaXdnTUhobVptWm1abVptWmlBcklIWmhiSFZsSUNzZ01Td2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbmR5YVhSbFNXNTBNekpNUlNBOUlHWjFibU4wYVc5dUlDaDJZV3gxWlN3Z2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JmZDNKcGRHVkpiblF6TWloMGFHbHpMQ0IyWVd4MVpTd2diMlptYzJWMExDQjBjblZsTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzUzY21sMFpVbHVkRE15UWtVZ1BTQm1kVzVqZEdsdmJpQW9kbUZzZFdVc0lHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnWDNkeWFYUmxTVzUwTXpJb2RHaHBjeXdnZG1Gc2RXVXNJRzltWm5ObGRDd2dabUZzYzJVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1bWRXNWpkR2x2YmlCZmQzSnBkR1ZHYkc5aGRDQW9ZblZtTENCMllXeDFaU3dnYjJabWMyVjBMQ0JzYVhSMGJHVkZibVJwWVc0c0lHNXZRWE56WlhKMEtTQjdYRzRnSUdsbUlDZ2hibTlCYzNObGNuUXBJSHRjYmlBZ0lDQmhjM05sY25Rb2RtRnNkV1VnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUIyWVd4MVpTQWhQVDBnYm5Wc2JDd2dKMjFwYzNOcGJtY2dkbUZzZFdVbktWeHVJQ0FnSUdGemMyVnlkQ2gwZVhCbGIyWWdiR2wwZEd4bFJXNWthV0Z1SUQwOVBTQW5ZbTl2YkdWaGJpY3NJQ2R0YVhOemFXNW5JRzl5SUdsdWRtRnNhV1FnWlc1a2FXRnVKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnYjJabWMyVjBJQ0U5UFNCdWRXeHNMQ0FuYldsemMybHVaeUJ2Wm1aelpYUW5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnS3lBeklEd2dZblZtTG14bGJtZDBhQ3dnSjFSeWVXbHVaeUIwYnlCM2NtbDBaU0JpWlhsdmJtUWdZblZtWm1WeUlHeGxibWQwYUNjcFhHNGdJQ0FnZG1WeWFXWkpSVVZGTnpVMEtIWmhiSFZsTENBekxqUXdNamd5TXpRMk5qTTROVEk0T0RabEt6TTRMQ0F0TXk0ME1ESTRNak0wTmpZek9EVXlPRGcyWlNzek9DbGNiaUFnZlZ4dVhHNGdJSFpoY2lCc1pXNGdQU0JpZFdZdWJHVnVaM1JvWEc0Z0lHbG1JQ2h2Wm1aelpYUWdQajBnYkdWdUtWeHVJQ0FnSUhKbGRIVnlibHh1WEc0Z0lHbGxaV1UzTlRRdWQzSnBkR1VvWW5WbUxDQjJZV3gxWlN3Z2IyWm1jMlYwTENCc2FYUjBiR1ZGYm1ScFlXNHNJREl6TENBMEtWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5keWFYUmxSbXh2WVhSTVJTQTlJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2diMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCZmQzSnBkR1ZHYkc5aGRDaDBhR2x6TENCMllXeDFaU3dnYjJabWMyVjBMQ0IwY25WbExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1M2NtbDBaVVpzYjJGMFFrVWdQU0JtZFc1amRHbHZiaUFvZG1Gc2RXVXNJRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ1gzZHlhWFJsUm14dllYUW9kR2hwY3l3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnWm1Gc2MyVXNJRzV2UVhOelpYSjBLVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZkM0pwZEdWRWIzVmliR1VnS0dKMVppd2dkbUZzZFdVc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLSFpoYkhWbElDRTlQU0IxYm1SbFptbHVaV1FnSmlZZ2RtRnNkV1VnSVQwOUlHNTFiR3dzSUNkdGFYTnphVzVuSUhaaGJIVmxKeWxjYmlBZ0lDQmhjM05sY25Rb2RIbHdaVzltSUd4cGRIUnNaVVZ1WkdsaGJpQTlQVDBnSjJKdmIyeGxZVzRuTENBbmJXbHpjMmx1WnlCdmNpQnBiblpoYkdsa0lHVnVaR2xoYmljcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlHOW1abk5sZENBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2IyWm1jMlYwSnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDc2dOeUE4SUdKMVppNXNaVzVuZEdnc1hHNGdJQ0FnSUNBZ0lDZFVjbmxwYm1jZ2RHOGdkM0pwZEdVZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNBZ0lIWmxjbWxtU1VWRlJUYzFOQ2gyWVd4MVpTd2dNUzQzT1RjMk9UTXhNelE0TmpJek1UVTNSU3N6TURnc0lDMHhMamM1TnpZNU16RXpORGcyTWpNeE5UZEZLek13T0NsY2JpQWdmVnh1WEc0Z0lIWmhjaUJzWlc0Z1BTQmlkV1l1YkdWdVozUm9YRzRnSUdsbUlDaHZabVp6WlhRZ1BqMGdiR1Z1S1Z4dUlDQWdJSEpsZEhWeWJseHVYRzRnSUdsbFpXVTNOVFF1ZDNKcGRHVW9ZblZtTENCMllXeDFaU3dnYjJabWMyVjBMQ0JzYVhSMGJHVkZibVJwWVc0c0lEVXlMQ0E0S1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbmR5YVhSbFJHOTFZbXhsVEVVZ1BTQm1kVzVqZEdsdmJpQW9kbUZzZFdVc0lHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnWDNkeWFYUmxSRzkxWW14bEtIUm9hWE1zSUhaaGJIVmxMQ0J2Wm1aelpYUXNJSFJ5ZFdVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5keWFYUmxSRzkxWW14bFFrVWdQU0JtZFc1amRHbHZiaUFvZG1Gc2RXVXNJRzltWm5ObGRDd2dibTlCYzNObGNuUXBJSHRjYmlBZ1gzZHlhWFJsUkc5MVlteGxLSFJvYVhNc0lIWmhiSFZsTENCdlptWnpaWFFzSUdaaGJITmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVMeThnWm1sc2JDaDJZV3gxWlN3Z2MzUmhjblE5TUN3Z1pXNWtQV0oxWm1abGNpNXNaVzVuZEdncFhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExtWnBiR3dnUFNCbWRXNWpkR2x2YmlBb2RtRnNkV1VzSUhOMFlYSjBMQ0JsYm1RcElIdGNiaUFnYVdZZ0tDRjJZV3gxWlNrZ2RtRnNkV1VnUFNBd1hHNGdJR2xtSUNnaGMzUmhjblFwSUhOMFlYSjBJRDBnTUZ4dUlDQnBaaUFvSVdWdVpDa2daVzVrSUQwZ2RHaHBjeTVzWlc1bmRHaGNibHh1SUNCcFppQW9kSGx3Wlc5bUlIWmhiSFZsSUQwOVBTQW5jM1J5YVc1bkp5a2dlMXh1SUNBZ0lIWmhiSFZsSUQwZ2RtRnNkV1V1WTJoaGNrTnZaR1ZCZENnd0tWeHVJQ0I5WEc1Y2JpQWdZWE56WlhKMEtIUjVjR1Z2WmlCMllXeDFaU0E5UFQwZ0oyNTFiV0psY2ljZ0ppWWdJV2x6VG1GT0tIWmhiSFZsS1N3Z0ozWmhiSFZsSUdseklHNXZkQ0JoSUc1MWJXSmxjaWNwWEc0Z0lHRnpjMlZ5ZENobGJtUWdQajBnYzNSaGNuUXNJQ2RsYm1RZ1BDQnpkR0Z5ZENjcFhHNWNiaUFnTHk4Z1JtbHNiQ0F3SUdKNWRHVnpPeUIzWlNkeVpTQmtiMjVsWEc0Z0lHbG1JQ2hsYm1RZ1BUMDlJSE4wWVhKMEtTQnlaWFIxY201Y2JpQWdhV1lnS0hSb2FYTXViR1Z1WjNSb0lEMDlQU0F3S1NCeVpYUjFjbTVjYmx4dUlDQmhjM05sY25Rb2MzUmhjblFnUGowZ01DQW1KaUJ6ZEdGeWRDQThJSFJvYVhNdWJHVnVaM1JvTENBbmMzUmhjblFnYjNWMElHOW1JR0p2ZFc1a2N5Y3BYRzRnSUdGemMyVnlkQ2hsYm1RZ1BqMGdNQ0FtSmlCbGJtUWdQRDBnZEdocGN5NXNaVzVuZEdnc0lDZGxibVFnYjNWMElHOW1JR0p2ZFc1a2N5Y3BYRzVjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJSE4wWVhKME95QnBJRHdnWlc1a095QnBLeXNwSUh0Y2JpQWdJQ0IwYUdselcybGRJRDBnZG1Gc2RXVmNiaUFnZlZ4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbWx1YzNCbFkzUWdQU0JtZFc1amRHbHZiaUFvS1NCN1hHNGdJSFpoY2lCdmRYUWdQU0JiWFZ4dUlDQjJZWElnYkdWdUlEMGdkR2hwY3k1c1pXNW5kR2hjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQnNaVzQ3SUdrckt5a2dlMXh1SUNBZ0lHOTFkRnRwWFNBOUlIUnZTR1Y0S0hSb2FYTmJhVjBwWEc0Z0lDQWdhV1lnS0drZ1BUMDlJR1Y0Y0c5eWRITXVTVTVUVUVWRFZGOU5RVmhmUWxsVVJWTXBJSHRjYmlBZ0lDQWdJRzkxZEZ0cElDc2dNVjBnUFNBbkxpNHVKMXh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0I5WEc0Z0lIMWNiaUFnY21WMGRYSnVJQ2M4UW5WbVptVnlJQ2NnS3lCdmRYUXVhbTlwYmlnbklDY3BJQ3NnSno0blhHNTlYRzVjYmk4cUtseHVJQ29nUTNKbFlYUmxjeUJoSUc1bGR5QmdRWEp5WVhsQ2RXWm1aWEpnSUhkcGRHZ2dkR2hsSUNwamIzQnBaV1FxSUcxbGJXOXllU0J2WmlCMGFHVWdZblZtWm1WeUlHbHVjM1JoYm1ObExseHVJQ29nUVdSa1pXUWdhVzRnVG05a1pTQXdMakV5TGlCUGJteDVJR0YyWVdsc1lXSnNaU0JwYmlCaWNtOTNjMlZ5Y3lCMGFHRjBJSE4xY0hCdmNuUWdRWEp5WVhsQ2RXWm1aWEl1WEc0Z0tpOWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkRzlCY25KaGVVSjFabVpsY2lBOUlHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ2FXWWdLSFI1Y0dWdlppQlZhVzUwT0VGeWNtRjVJQ0U5UFNBbmRXNWtaV1pwYm1Wa0p5a2dlMXh1SUNBZ0lHbG1JQ2hDZFdabVpYSXVYM1Z6WlZSNWNHVmtRWEp5WVhsektTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z0tHNWxkeUJDZFdabVpYSW9kR2hwY3lrcExtSjFabVpsY2x4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQjJZWElnWW5WbUlEMGdibVYzSUZWcGJuUTRRWEp5WVhrb2RHaHBjeTVzWlc1bmRHZ3BYRzRnSUNBZ0lDQm1iM0lnS0haaGNpQnBJRDBnTUN3Z2JHVnVJRDBnWW5WbUxteGxibWQwYURzZ2FTQThJR3hsYmpzZ2FTQXJQU0F4S1Z4dUlDQWdJQ0FnSUNCaWRXWmJhVjBnUFNCMGFHbHpXMmxkWEc0Z0lDQWdJQ0J5WlhSMWNtNGdZblZtTG1KMVptWmxjbHh1SUNBZ0lIMWNiaUFnZlNCbGJITmxJSHRjYmlBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0owSjFabVpsY2k1MGIwRnljbUY1UW5WbVptVnlJRzV2ZENCemRYQndiM0owWldRZ2FXNGdkR2hwY3lCaWNtOTNjMlZ5SnlsY2JpQWdmVnh1ZlZ4dVhHNHZMeUJJUlV4UVJWSWdSbFZPUTFSSlQwNVRYRzR2THlBOVBUMDlQVDA5UFQwOVBUMDlQVDA5WEc1Y2JtWjFibU4wYVc5dUlITjBjbWx1WjNSeWFXMGdLSE4wY2lrZ2UxeHVJQ0JwWmlBb2MzUnlMblJ5YVcwcElISmxkSFZ5YmlCemRISXVkSEpwYlNncFhHNGdJSEpsZEhWeWJpQnpkSEl1Y21Wd2JHRmpaU2d2WGx4Y2N5dDhYRnh6S3lRdlp5d2dKeWNwWEc1OVhHNWNiblpoY2lCQ1VDQTlJRUoxWm1abGNpNXdjbTkwYjNSNWNHVmNibHh1THlvcVhHNGdLaUJCZFdkdFpXNTBJR0VnVldsdWREaEJjbkpoZVNBcWFXNXpkR0Z1WTJVcUlDaHViM1FnZEdobElGVnBiblE0UVhKeVlYa2dZMnhoYzNNaEtTQjNhWFJvSUVKMVptWmxjaUJ0WlhSb2IyUnpYRzRnS2k5Y2JrSjFabVpsY2k1ZllYVm5iV1Z1ZENBOUlHWjFibU4wYVc5dUlDaGhjbklwSUh0Y2JpQWdZWEp5TGw5cGMwSjFabVpsY2lBOUlIUnlkV1ZjYmx4dUlDQXZMeUJ6WVhabElISmxabVZ5Wlc1alpTQjBieUJ2Y21sbmFXNWhiQ0JWYVc1ME9FRnljbUY1SUdkbGRDOXpaWFFnYldWMGFHOWtjeUJpWldadmNtVWdiM1psY25keWFYUnBibWRjYmlBZ1lYSnlMbDluWlhRZ1BTQmhjbkl1WjJWMFhHNGdJR0Z5Y2k1ZmMyVjBJRDBnWVhKeUxuTmxkRnh1WEc0Z0lDOHZJR1JsY0hKbFkyRjBaV1FzSUhkcGJHd2dZbVVnY21WdGIzWmxaQ0JwYmlCdWIyUmxJREF1TVRNclhHNGdJR0Z5Y2k1blpYUWdQU0JDVUM1blpYUmNiaUFnWVhKeUxuTmxkQ0E5SUVKUUxuTmxkRnh1WEc0Z0lHRnljaTUzY21sMFpTQTlJRUpRTG5keWFYUmxYRzRnSUdGeWNpNTBiMU4wY21sdVp5QTlJRUpRTG5SdlUzUnlhVzVuWEc0Z0lHRnljaTUwYjB4dlkyRnNaVk4wY21sdVp5QTlJRUpRTG5SdlUzUnlhVzVuWEc0Z0lHRnljaTUwYjBwVFQwNGdQU0JDVUM1MGIwcFRUMDVjYmlBZ1lYSnlMbU52Y0hrZ1BTQkNVQzVqYjNCNVhHNGdJR0Z5Y2k1emJHbGpaU0E5SUVKUUxuTnNhV05sWEc0Z0lHRnljaTV5WldGa1ZVbHVkRGdnUFNCQ1VDNXlaV0ZrVlVsdWREaGNiaUFnWVhKeUxuSmxZV1JWU1c1ME1UWk1SU0E5SUVKUUxuSmxZV1JWU1c1ME1UWk1SVnh1SUNCaGNuSXVjbVZoWkZWSmJuUXhOa0pGSUQwZ1FsQXVjbVZoWkZWSmJuUXhOa0pGWEc0Z0lHRnljaTV5WldGa1ZVbHVkRE15VEVVZ1BTQkNVQzV5WldGa1ZVbHVkRE15VEVWY2JpQWdZWEp5TG5KbFlXUlZTVzUwTXpKQ1JTQTlJRUpRTG5KbFlXUlZTVzUwTXpKQ1JWeHVJQ0JoY25JdWNtVmhaRWx1ZERnZ1BTQkNVQzV5WldGa1NXNTBPRnh1SUNCaGNuSXVjbVZoWkVsdWRERTJURVVnUFNCQ1VDNXlaV0ZrU1c1ME1UWk1SVnh1SUNCaGNuSXVjbVZoWkVsdWRERTJRa1VnUFNCQ1VDNXlaV0ZrU1c1ME1UWkNSVnh1SUNCaGNuSXVjbVZoWkVsdWRETXlURVVnUFNCQ1VDNXlaV0ZrU1c1ME16Sk1SVnh1SUNCaGNuSXVjbVZoWkVsdWRETXlRa1VnUFNCQ1VDNXlaV0ZrU1c1ME16SkNSVnh1SUNCaGNuSXVjbVZoWkVac2IyRjBURVVnUFNCQ1VDNXlaV0ZrUm14dllYUk1SVnh1SUNCaGNuSXVjbVZoWkVac2IyRjBRa1VnUFNCQ1VDNXlaV0ZrUm14dllYUkNSVnh1SUNCaGNuSXVjbVZoWkVSdmRXSnNaVXhGSUQwZ1FsQXVjbVZoWkVSdmRXSnNaVXhGWEc0Z0lHRnljaTV5WldGa1JHOTFZbXhsUWtVZ1BTQkNVQzV5WldGa1JHOTFZbXhsUWtWY2JpQWdZWEp5TG5keWFYUmxWVWx1ZERnZ1BTQkNVQzUzY21sMFpWVkpiblE0WEc0Z0lHRnljaTUzY21sMFpWVkpiblF4Tmt4RklEMGdRbEF1ZDNKcGRHVlZTVzUwTVRaTVJWeHVJQ0JoY25JdWQzSnBkR1ZWU1c1ME1UWkNSU0E5SUVKUUxuZHlhWFJsVlVsdWRERTJRa1ZjYmlBZ1lYSnlMbmR5YVhSbFZVbHVkRE15VEVVZ1BTQkNVQzUzY21sMFpWVkpiblF6TWt4RlhHNGdJR0Z5Y2k1M2NtbDBaVlZKYm5Rek1rSkZJRDBnUWxBdWQzSnBkR1ZWU1c1ME16SkNSVnh1SUNCaGNuSXVkM0pwZEdWSmJuUTRJRDBnUWxBdWQzSnBkR1ZKYm5RNFhHNGdJR0Z5Y2k1M2NtbDBaVWx1ZERFMlRFVWdQU0JDVUM1M2NtbDBaVWx1ZERFMlRFVmNiaUFnWVhKeUxuZHlhWFJsU1c1ME1UWkNSU0E5SUVKUUxuZHlhWFJsU1c1ME1UWkNSVnh1SUNCaGNuSXVkM0pwZEdWSmJuUXpNa3hGSUQwZ1FsQXVkM0pwZEdWSmJuUXpNa3hGWEc0Z0lHRnljaTUzY21sMFpVbHVkRE15UWtVZ1BTQkNVQzUzY21sMFpVbHVkRE15UWtWY2JpQWdZWEp5TG5keWFYUmxSbXh2WVhSTVJTQTlJRUpRTG5keWFYUmxSbXh2WVhSTVJWeHVJQ0JoY25JdWQzSnBkR1ZHYkc5aGRFSkZJRDBnUWxBdWQzSnBkR1ZHYkc5aGRFSkZYRzRnSUdGeWNpNTNjbWwwWlVSdmRXSnNaVXhGSUQwZ1FsQXVkM0pwZEdWRWIzVmliR1ZNUlZ4dUlDQmhjbkl1ZDNKcGRHVkViM1ZpYkdWQ1JTQTlJRUpRTG5keWFYUmxSRzkxWW14bFFrVmNiaUFnWVhKeUxtWnBiR3dnUFNCQ1VDNW1hV3hzWEc0Z0lHRnljaTVwYm5Od1pXTjBJRDBnUWxBdWFXNXpjR1ZqZEZ4dUlDQmhjbkl1ZEc5QmNuSmhlVUoxWm1abGNpQTlJRUpRTG5SdlFYSnlZWGxDZFdabVpYSmNibHh1SUNCeVpYUjFjbTRnWVhKeVhHNTlYRzVjYmk4dklITnNhV05sS0hOMFlYSjBMQ0JsYm1RcFhHNW1kVzVqZEdsdmJpQmpiR0Z0Y0NBb2FXNWtaWGdzSUd4bGJpd2daR1ZtWVhWc2RGWmhiSFZsS1NCN1hHNGdJR2xtSUNoMGVYQmxiMllnYVc1a1pYZ2dJVDA5SUNkdWRXMWlaWEluS1NCeVpYUjFjbTRnWkdWbVlYVnNkRlpoYkhWbFhHNGdJR2x1WkdWNElEMGdmbjVwYm1SbGVEc2dJQzh2SUVOdlpYSmpaU0IwYnlCcGJuUmxaMlZ5TGx4dUlDQnBaaUFvYVc1a1pYZ2dQajBnYkdWdUtTQnlaWFIxY200Z2JHVnVYRzRnSUdsbUlDaHBibVJsZUNBK1BTQXdLU0J5WlhSMWNtNGdhVzVrWlhoY2JpQWdhVzVrWlhnZ0t6MGdiR1Z1WEc0Z0lHbG1JQ2hwYm1SbGVDQStQU0F3S1NCeVpYUjFjbTRnYVc1a1pYaGNiaUFnY21WMGRYSnVJREJjYm4xY2JseHVablZ1WTNScGIyNGdZMjlsY21ObElDaHNaVzVuZEdncElIdGNiaUFnTHk4Z1EyOWxjbU5sSUd4bGJtZDBhQ0IwYnlCaElHNTFiV0psY2lBb2NHOXpjMmxpYkhrZ1RtRk9LU3dnY205MWJtUWdkWEJjYmlBZ0x5OGdhVzRnWTJGelpTQnBkQ2R6SUdaeVlXTjBhVzl1WVd3Z0tHVXVaeTRnTVRJekxqUTFOaWtnZEdobGJpQmtieUJoWEc0Z0lDOHZJR1J2ZFdKc1pTQnVaV2RoZEdVZ2RHOGdZMjlsY21ObElHRWdUbUZPSUhSdklEQXVJRVZoYzNrc0lISnBaMmgwUDF4dUlDQnNaVzVuZEdnZ1BTQitmazFoZEdndVkyVnBiQ2dyYkdWdVozUm9LVnh1SUNCeVpYUjFjbTRnYkdWdVozUm9JRHdnTUNBL0lEQWdPaUJzWlc1bmRHaGNibjFjYmx4dVpuVnVZM1JwYjI0Z2FYTkJjbkpoZVNBb2MzVmlhbVZqZENrZ2UxeHVJQ0J5WlhSMWNtNGdLRUZ5Y21GNUxtbHpRWEp5WVhrZ2ZId2dablZ1WTNScGIyNGdLSE4xWW1wbFkzUXBJSHRjYmlBZ0lDQnlaWFIxY200Z1QySnFaV04wTG5CeWIzUnZkSGx3WlM1MGIxTjBjbWx1Wnk1allXeHNLSE4xWW1wbFkzUXBJRDA5UFNBblcyOWlhbVZqZENCQmNuSmhlVjBuWEc0Z0lIMHBLSE4xWW1wbFkzUXBYRzU5WEc1Y2JtWjFibU4wYVc5dUlHbHpRWEp5WVhscGMyZ2dLSE4xWW1wbFkzUXBJSHRjYmlBZ2NtVjBkWEp1SUdselFYSnlZWGtvYzNWaWFtVmpkQ2tnZkh3Z1FuVm1abVZ5TG1selFuVm1abVZ5S0hOMVltcGxZM1FwSUh4OFhHNGdJQ0FnSUNCemRXSnFaV04wSUNZbUlIUjVjR1Z2WmlCemRXSnFaV04wSUQwOVBTQW5iMkpxWldOMEp5QW1KbHh1SUNBZ0lDQWdkSGx3Wlc5bUlITjFZbXBsWTNRdWJHVnVaM1JvSUQwOVBTQW5iblZ0WW1WeUoxeHVmVnh1WEc1bWRXNWpkR2x2YmlCMGIwaGxlQ0FvYmlrZ2UxeHVJQ0JwWmlBb2JpQThJREUyS1NCeVpYUjFjbTRnSnpBbklDc2diaTUwYjFOMGNtbHVaeWd4TmlsY2JpQWdjbVYwZFhKdUlHNHVkRzlUZEhKcGJtY29NVFlwWEc1OVhHNWNibVoxYm1OMGFXOXVJSFYwWmpoVWIwSjVkR1Z6SUNoemRISXBJSHRjYmlBZ2RtRnlJR0o1ZEdWQmNuSmhlU0E5SUZ0ZFhHNGdJR1p2Y2lBb2RtRnlJR2tnUFNBd095QnBJRHdnYzNSeUxteGxibWQwYURzZ2FTc3JLU0I3WEc0Z0lDQWdkbUZ5SUdJZ1BTQnpkSEl1WTJoaGNrTnZaR1ZCZENocEtWeHVJQ0FnSUdsbUlDaGlJRHc5SURCNE4wWXBYRzRnSUNBZ0lDQmllWFJsUVhKeVlYa3VjSFZ6YUNoemRISXVZMmhoY2tOdlpHVkJkQ2hwS1NsY2JpQWdJQ0JsYkhObElIdGNiaUFnSUNBZ0lIWmhjaUJ6ZEdGeWRDQTlJR2xjYmlBZ0lDQWdJR2xtSUNoaUlENDlJREI0UkRnd01DQW1KaUJpSUR3OUlEQjRSRVpHUmlrZ2FTc3JYRzRnSUNBZ0lDQjJZWElnYUNBOUlHVnVZMjlrWlZWU1NVTnZiWEJ2Ym1WdWRDaHpkSEl1YzJ4cFkyVW9jM1JoY25Rc0lHa3JNU2twTG5OMVluTjBjaWd4S1M1emNHeHBkQ2duSlNjcFhHNGdJQ0FnSUNCbWIzSWdLSFpoY2lCcUlEMGdNRHNnYWlBOElHZ3ViR1Z1WjNSb095QnFLeXNwWEc0Z0lDQWdJQ0FnSUdKNWRHVkJjbkpoZVM1d2RYTm9LSEJoY25ObFNXNTBLR2hiYWwwc0lERTJLU2xjYmlBZ0lDQjlYRzRnSUgxY2JpQWdjbVYwZFhKdUlHSjVkR1ZCY25KaGVWeHVmVnh1WEc1bWRXNWpkR2x2YmlCaGMyTnBhVlJ2UW5sMFpYTWdLSE4wY2lrZ2UxeHVJQ0IyWVhJZ1lubDBaVUZ5Y21GNUlEMGdXMTFjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQnpkSEl1YkdWdVozUm9PeUJwS3lzcElIdGNiaUFnSUNBdkx5Qk9iMlJsSjNNZ1kyOWtaU0J6WldWdGN5QjBieUJpWlNCa2IybHVaeUIwYUdseklHRnVaQ0J1YjNRZ0ppQXdlRGRHTGk1Y2JpQWdJQ0JpZVhSbFFYSnlZWGt1Y0hWemFDaHpkSEl1WTJoaGNrTnZaR1ZCZENocEtTQW1JREI0UmtZcFhHNGdJSDFjYmlBZ2NtVjBkWEp1SUdKNWRHVkJjbkpoZVZ4dWZWeHVYRzVtZFc1amRHbHZiaUIxZEdZeE5teGxWRzlDZVhSbGN5QW9jM1J5S1NCN1hHNGdJSFpoY2lCakxDQm9hU3dnYkc5Y2JpQWdkbUZ5SUdKNWRHVkJjbkpoZVNBOUlGdGRYRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2MzUnlMbXhsYm1kMGFEc2dhU3NyS1NCN1hHNGdJQ0FnWXlBOUlITjBjaTVqYUdGeVEyOWtaVUYwS0drcFhHNGdJQ0FnYUdrZ1BTQmpJRDQrSURoY2JpQWdJQ0JzYnlBOUlHTWdKU0F5TlRaY2JpQWdJQ0JpZVhSbFFYSnlZWGt1Y0hWemFDaHNieWxjYmlBZ0lDQmllWFJsUVhKeVlYa3VjSFZ6YUNob2FTbGNiaUFnZlZ4dVhHNGdJSEpsZEhWeWJpQmllWFJsUVhKeVlYbGNibjFjYmx4dVpuVnVZM1JwYjI0Z1ltRnpaVFkwVkc5Q2VYUmxjeUFvYzNSeUtTQjdYRzRnSUhKbGRIVnliaUJpWVhObE5qUXVkRzlDZVhSbFFYSnlZWGtvYzNSeUtWeHVmVnh1WEc1bWRXNWpkR2x2YmlCaWJHbDBRblZtWm1WeUlDaHpjbU1zSUdSemRDd2diMlptYzJWMExDQnNaVzVuZEdncElIdGNiaUFnZG1GeUlIQnZjMXh1SUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHeGxibWQwYURzZ2FTc3JLU0I3WEc0Z0lDQWdhV1lnS0NocElDc2diMlptYzJWMElENDlJR1J6ZEM1c1pXNW5kR2dwSUh4OElDaHBJRDQ5SUhOeVl5NXNaVzVuZEdncEtWeHVJQ0FnSUNBZ1luSmxZV3RjYmlBZ0lDQmtjM1JiYVNBcklHOW1abk5sZEYwZ1BTQnpjbU5iYVYxY2JpQWdmVnh1SUNCeVpYUjFjbTRnYVZ4dWZWeHVYRzVtZFc1amRHbHZiaUJrWldOdlpHVlZkR1k0UTJoaGNpQW9jM1J5S1NCN1hHNGdJSFJ5ZVNCN1hHNGdJQ0FnY21WMGRYSnVJR1JsWTI5a1pWVlNTVU52YlhCdmJtVnVkQ2h6ZEhJcFhHNGdJSDBnWTJGMFkyZ2dLR1Z5Y2lrZ2UxeHVJQ0FnSUhKbGRIVnliaUJUZEhKcGJtY3Vabkp2YlVOb1lYSkRiMlJsS0RCNFJrWkdSQ2tnTHk4Z1ZWUkdJRGdnYVc1MllXeHBaQ0JqYUdGeVhHNGdJSDFjYm4xY2JseHVMeXBjYmlBcUlGZGxJR2hoZG1VZ2RHOGdiV0ZyWlNCemRYSmxJSFJvWVhRZ2RHaGxJSFpoYkhWbElHbHpJR0VnZG1Gc2FXUWdhVzUwWldkbGNpNGdWR2hwY3lCdFpXRnVjeUIwYUdGMElHbDBYRzRnS2lCcGN5QnViMjR0Ym1WbllYUnBkbVV1SUVsMElHaGhjeUJ1YnlCbWNtRmpkR2x2Ym1Gc0lHTnZiWEJ2Ym1WdWRDQmhibVFnZEdoaGRDQnBkQ0JrYjJWeklHNXZkRnh1SUNvZ1pYaGpaV1ZrSUhSb1pTQnRZWGhwYlhWdElHRnNiRzkzWldRZ2RtRnNkV1V1WEc0Z0tpOWNibVoxYm1OMGFXOXVJSFpsY21sbWRXbHVkQ0FvZG1Gc2RXVXNJRzFoZUNrZ2UxeHVJQ0JoYzNObGNuUW9kSGx3Wlc5bUlIWmhiSFZsSUQwOVBTQW5iblZ0WW1WeUp5d2dKMk5oYm01dmRDQjNjbWwwWlNCaElHNXZiaTF1ZFcxaVpYSWdZWE1nWVNCdWRXMWlaWEluS1Z4dUlDQmhjM05sY25Rb2RtRnNkV1VnUGowZ01Dd2dKM053WldOcFptbGxaQ0JoSUc1bFoyRjBhWFpsSUhaaGJIVmxJR1p2Y2lCM2NtbDBhVzVuSUdGdUlIVnVjMmxuYm1Wa0lIWmhiSFZsSnlsY2JpQWdZWE56WlhKMEtIWmhiSFZsSUR3OUlHMWhlQ3dnSjNaaGJIVmxJR2x6SUd4aGNtZGxjaUIwYUdGdUlHMWhlR2x0ZFcwZ2RtRnNkV1VnWm05eUlIUjVjR1VuS1Z4dUlDQmhjM05sY25Rb1RXRjBhQzVtYkc5dmNpaDJZV3gxWlNrZ1BUMDlJSFpoYkhWbExDQW5kbUZzZFdVZ2FHRnpJR0VnWm5KaFkzUnBiMjVoYkNCamIyMXdiMjVsYm5RbktWeHVmVnh1WEc1bWRXNWpkR2x2YmlCMlpYSnBabk5wYm5RZ0tIWmhiSFZsTENCdFlYZ3NJRzFwYmlrZ2UxeHVJQ0JoYzNObGNuUW9kSGx3Wlc5bUlIWmhiSFZsSUQwOVBTQW5iblZ0WW1WeUp5d2dKMk5oYm01dmRDQjNjbWwwWlNCaElHNXZiaTF1ZFcxaVpYSWdZWE1nWVNCdWRXMWlaWEluS1Z4dUlDQmhjM05sY25Rb2RtRnNkV1VnUEQwZ2JXRjRMQ0FuZG1Gc2RXVWdiR0Z5WjJWeUlIUm9ZVzRnYldGNGFXMTFiU0JoYkd4dmQyVmtJSFpoYkhWbEp5bGNiaUFnWVhOelpYSjBLSFpoYkhWbElENDlJRzFwYml3Z0ozWmhiSFZsSUhOdFlXeHNaWElnZEdoaGJpQnRhVzVwYlhWdElHRnNiRzkzWldRZ2RtRnNkV1VuS1Z4dUlDQmhjM05sY25Rb1RXRjBhQzVtYkc5dmNpaDJZV3gxWlNrZ1BUMDlJSFpoYkhWbExDQW5kbUZzZFdVZ2FHRnpJR0VnWm5KaFkzUnBiMjVoYkNCamIyMXdiMjVsYm5RbktWeHVmVnh1WEc1bWRXNWpkR2x2YmlCMlpYSnBaa2xGUlVVM05UUWdLSFpoYkhWbExDQnRZWGdzSUcxcGJpa2dlMXh1SUNCaGMzTmxjblFvZEhsd1pXOW1JSFpoYkhWbElEMDlQU0FuYm5WdFltVnlKeXdnSjJOaGJtNXZkQ0IzY21sMFpTQmhJRzV2YmkxdWRXMWlaWElnWVhNZ1lTQnVkVzFpWlhJbktWeHVJQ0JoYzNObGNuUW9kbUZzZFdVZ1BEMGdiV0Y0TENBbmRtRnNkV1VnYkdGeVoyVnlJSFJvWVc0Z2JXRjRhVzExYlNCaGJHeHZkMlZrSUhaaGJIVmxKeWxjYmlBZ1lYTnpaWEowS0haaGJIVmxJRDQ5SUcxcGJpd2dKM1poYkhWbElITnRZV3hzWlhJZ2RHaGhiaUJ0YVc1cGJYVnRJR0ZzYkc5M1pXUWdkbUZzZFdVbktWeHVmVnh1WEc1bWRXNWpkR2x2YmlCaGMzTmxjblFnS0hSbGMzUXNJRzFsYzNOaFoyVXBJSHRjYmlBZ2FXWWdLQ0YwWlhOMEtTQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb2JXVnpjMkZuWlNCOGZDQW5SbUZwYkdWa0lHRnpjMlZ5ZEdsdmJpY3BYRzU5WEc1Y2JuMHBMbU5oYkd3b2RHaHBjeXh5WlhGMWFYSmxLRndpWlM5Vkt6azNYQ0lwTEhSNWNHVnZaaUJ6Wld4bUlDRTlQU0JjSW5WdVpHVm1hVzVsWkZ3aUlEOGdjMlZzWmlBNklIUjVjR1Z2WmlCM2FXNWtiM2NnSVQwOUlGd2lkVzVrWldacGJtVmtYQ0lnUHlCM2FXNWtiM2NnT2lCN2ZTeHlaWEYxYVhKbEtGd2lZblZtWm1WeVhDSXBMa0oxWm1abGNpeGhjbWQxYldWdWRITmJNMTBzWVhKbmRXMWxiblJ6V3pSZExHRnlaM1Z0Wlc1MGMxczFYU3hoY21kMWJXVnVkSE5iTmwwc1hDSXZMaTVjWEZ4Y0xpNWNYRnhjYm05a1pWOXRiMlIxYkdWelhGeGNYR0oxWm1abGNseGNYRnhwYm1SbGVDNXFjMXdpTEZ3aUx5NHVYRnhjWEM0dVhGeGNYRzV2WkdWZmJXOWtkV3hsYzF4Y1hGeGlkV1ptWlhKY0lpa2lMQ0lvWm5WdVkzUnBiMjRnS0hCeWIyTmxjM01zWjJ4dlltRnNMRUoxWm1abGNpeGZYMkZ5WjNWdFpXNTBNQ3hmWDJGeVozVnRaVzUwTVN4ZlgyRnlaM1Z0Wlc1ME1peGZYMkZ5WjNWdFpXNTBNeXhmWDJacGJHVnVZVzFsTEY5ZlpHbHlibUZ0WlNsN1hHNWxlSEJ2Y25SekxuSmxZV1FnUFNCbWRXNWpkR2x2YmlBb1luVm1abVZ5TENCdlptWnpaWFFzSUdselRFVXNJRzFNWlc0c0lHNUNlWFJsY3lrZ2UxeHVJQ0IyWVhJZ1pTd2diVnh1SUNCMllYSWdaVXhsYmlBOUlHNUNlWFJsY3lBcUlEZ2dMU0J0VEdWdUlDMGdNVnh1SUNCMllYSWdaVTFoZUNBOUlDZ3hJRHc4SUdWTVpXNHBJQzBnTVZ4dUlDQjJZWElnWlVKcFlYTWdQU0JsVFdGNElENCtJREZjYmlBZ2RtRnlJRzVDYVhSeklEMGdMVGRjYmlBZ2RtRnlJR2tnUFNCcGMweEZJRDhnS0c1Q2VYUmxjeUF0SURFcElEb2dNRnh1SUNCMllYSWdaQ0E5SUdselRFVWdQeUF0TVNBNklERmNiaUFnZG1GeUlITWdQU0JpZFdabVpYSmJiMlptYzJWMElDc2dhVjFjYmx4dUlDQnBJQ3M5SUdSY2JseHVJQ0JsSUQwZ2N5QW1JQ2dvTVNBOFBDQW9MVzVDYVhSektTa2dMU0F4S1Z4dUlDQnpJRDQrUFNBb0xXNUNhWFJ6S1Z4dUlDQnVRbWwwY3lBclBTQmxUR1Z1WEc0Z0lHWnZjaUFvT3lCdVFtbDBjeUErSURBN0lHVWdQU0JsSUNvZ01qVTJJQ3NnWW5WbVptVnlXMjltWm5ObGRDQXJJR2xkTENCcElDczlJR1FzSUc1Q2FYUnpJQzA5SURncElIdDlYRzVjYmlBZ2JTQTlJR1VnSmlBb0tERWdQRHdnS0MxdVFtbDBjeWtwSUMwZ01TbGNiaUFnWlNBK1BqMGdLQzF1UW1sMGN5bGNiaUFnYmtKcGRITWdLejBnYlV4bGJseHVJQ0JtYjNJZ0tEc2dia0pwZEhNZ1BpQXdPeUJ0SUQwZ2JTQXFJREkxTmlBcklHSjFabVpsY2x0dlptWnpaWFFnS3lCcFhTd2dhU0FyUFNCa0xDQnVRbWwwY3lBdFBTQTRLU0I3ZlZ4dVhHNGdJR2xtSUNobElEMDlQU0F3S1NCN1hHNGdJQ0FnWlNBOUlERWdMU0JsUW1saGMxeHVJQ0I5SUdWc2MyVWdhV1lnS0dVZ1BUMDlJR1ZOWVhncElIdGNiaUFnSUNCeVpYUjFjbTRnYlNBL0lFNWhUaUE2SUNnb2N5QS9JQzB4SURvZ01Ta2dLaUJKYm1acGJtbDBlU2xjYmlBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0J0SUQwZ2JTQXJJRTFoZEdndWNHOTNLRElzSUcxTVpXNHBYRzRnSUNBZ1pTQTlJR1VnTFNCbFFtbGhjMXh1SUNCOVhHNGdJSEpsZEhWeWJpQW9jeUEvSUMweElEb2dNU2tnS2lCdElDb2dUV0YwYUM1d2IzY29NaXdnWlNBdElHMU1aVzRwWEc1OVhHNWNibVY0Y0c5eWRITXVkM0pwZEdVZ1BTQm1kVzVqZEdsdmJpQW9ZblZtWm1WeUxDQjJZV3gxWlN3Z2IyWm1jMlYwTENCcGMweEZMQ0J0VEdWdUxDQnVRbmwwWlhNcElIdGNiaUFnZG1GeUlHVXNJRzBzSUdOY2JpQWdkbUZ5SUdWTVpXNGdQU0J1UW5sMFpYTWdLaUE0SUMwZ2JVeGxiaUF0SURGY2JpQWdkbUZ5SUdWTllYZ2dQU0FvTVNBOFBDQmxUR1Z1S1NBdElERmNiaUFnZG1GeUlHVkNhV0Z6SUQwZ1pVMWhlQ0ErUGlBeFhHNGdJSFpoY2lCeWRDQTlJQ2h0VEdWdUlEMDlQU0F5TXlBL0lFMWhkR2d1Y0c5M0tESXNJQzB5TkNrZ0xTQk5ZWFJvTG5CdmR5Z3lMQ0F0TnpjcElEb2dNQ2xjYmlBZ2RtRnlJR2tnUFNCcGMweEZJRDhnTUNBNklDaHVRbmwwWlhNZ0xTQXhLVnh1SUNCMllYSWdaQ0E5SUdselRFVWdQeUF4SURvZ0xURmNiaUFnZG1GeUlITWdQU0IyWVd4MVpTQThJREFnZkh3Z0tIWmhiSFZsSUQwOVBTQXdJQ1ltSURFZ0x5QjJZV3gxWlNBOElEQXBJRDhnTVNBNklEQmNibHh1SUNCMllXeDFaU0E5SUUxaGRHZ3VZV0p6S0haaGJIVmxLVnh1WEc0Z0lHbG1JQ2hwYzA1aFRpaDJZV3gxWlNrZ2ZId2dkbUZzZFdVZ1BUMDlJRWx1Wm1sdWFYUjVLU0I3WEc0Z0lDQWdiU0E5SUdselRtRk9LSFpoYkhWbEtTQS9JREVnT2lBd1hHNGdJQ0FnWlNBOUlHVk5ZWGhjYmlBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0JsSUQwZ1RXRjBhQzVtYkc5dmNpaE5ZWFJvTG14dlp5aDJZV3gxWlNrZ0x5Qk5ZWFJvTGt4T01pbGNiaUFnSUNCcFppQW9kbUZzZFdVZ0tpQW9ZeUE5SUUxaGRHZ3VjRzkzS0RJc0lDMWxLU2tnUENBeEtTQjdYRzRnSUNBZ0lDQmxMUzFjYmlBZ0lDQWdJR01nS2owZ01seHVJQ0FnSUgxY2JpQWdJQ0JwWmlBb1pTQXJJR1ZDYVdGeklENDlJREVwSUh0Y2JpQWdJQ0FnSUhaaGJIVmxJQ3M5SUhKMElDOGdZMXh1SUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNCMllXeDFaU0FyUFNCeWRDQXFJRTFoZEdndWNHOTNLRElzSURFZ0xTQmxRbWxoY3lsY2JpQWdJQ0I5WEc0Z0lDQWdhV1lnS0haaGJIVmxJQ29nWXlBK1BTQXlLU0I3WEc0Z0lDQWdJQ0JsS3l0Y2JpQWdJQ0FnSUdNZ0x6MGdNbHh1SUNBZ0lIMWNibHh1SUNBZ0lHbG1JQ2hsSUNzZ1pVSnBZWE1nUGowZ1pVMWhlQ2tnZTF4dUlDQWdJQ0FnYlNBOUlEQmNiaUFnSUNBZ0lHVWdQU0JsVFdGNFhHNGdJQ0FnZlNCbGJITmxJR2xtSUNobElDc2daVUpwWVhNZ1BqMGdNU2tnZTF4dUlDQWdJQ0FnYlNBOUlDaDJZV3gxWlNBcUlHTWdMU0F4S1NBcUlFMWhkR2d1Y0c5M0tESXNJRzFNWlc0cFhHNGdJQ0FnSUNCbElEMGdaU0FySUdWQ2FXRnpYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUcwZ1BTQjJZV3gxWlNBcUlFMWhkR2d1Y0c5M0tESXNJR1ZDYVdGeklDMGdNU2tnS2lCTllYUm9MbkJ2ZHlneUxDQnRUR1Z1S1Z4dUlDQWdJQ0FnWlNBOUlEQmNiaUFnSUNCOVhHNGdJSDFjYmx4dUlDQm1iM0lnS0RzZ2JVeGxiaUErUFNBNE95QmlkV1ptWlhKYmIyWm1jMlYwSUNzZ2FWMGdQU0J0SUNZZ01IaG1aaXdnYVNBclBTQmtMQ0J0SUM4OUlESTFOaXdnYlV4bGJpQXRQU0E0S1NCN2ZWeHVYRzRnSUdVZ1BTQW9aU0E4UENCdFRHVnVLU0I4SUcxY2JpQWdaVXhsYmlBclBTQnRUR1Z1WEc0Z0lHWnZjaUFvT3lCbFRHVnVJRDRnTURzZ1luVm1abVZ5VzI5bVpuTmxkQ0FySUdsZElEMGdaU0FtSURCNFptWXNJR2tnS3owZ1pDd2daU0F2UFNBeU5UWXNJR1ZNWlc0Z0xUMGdPQ2tnZTMxY2JseHVJQ0JpZFdabVpYSmJiMlptYzJWMElDc2dhU0F0SUdSZElIdzlJSE1nS2lBeE1qaGNibjFjYmx4dWZTa3VZMkZzYkNoMGFHbHpMSEpsY1hWcGNtVW9YQ0psTDFVck9UZGNJaWtzZEhsd1pXOW1JSE5sYkdZZ0lUMDlJRndpZFc1a1pXWnBibVZrWENJZ1B5QnpaV3htSURvZ2RIbHdaVzltSUhkcGJtUnZkeUFoUFQwZ1hDSjFibVJsWm1sdVpXUmNJaUEvSUhkcGJtUnZkeUE2SUh0OUxISmxjWFZwY21Vb1hDSmlkV1ptWlhKY0lpa3VRblZtWm1WeUxHRnlaM1Z0Wlc1MGMxc3pYU3hoY21kMWJXVnVkSE5iTkYwc1lYSm5kVzFsYm5Seld6VmRMR0Z5WjNWdFpXNTBjMXMyWFN4Y0lpOHVMbHhjWEZ3dUxseGNYRnh1YjJSbFgyMXZaSFZzWlhOY1hGeGNhV1ZsWlRjMU5GeGNYRnhwYm1SbGVDNXFjMXdpTEZ3aUx5NHVYRnhjWEM0dVhGeGNYRzV2WkdWZmJXOWtkV3hsYzF4Y1hGeHBaV1ZsTnpVMFhDSXBJaXdpS0daMWJtTjBhVzl1SUNod2NtOWpaWE56TEdkc2IySmhiQ3hDZFdabVpYSXNYMTloY21kMWJXVnVkREFzWDE5aGNtZDFiV1Z1ZERFc1gxOWhjbWQxYldWdWRESXNYMTloY21kMWJXVnVkRE1zWDE5bWFXeGxibUZ0WlN4ZlgyUnBjbTVoYldVcGUxeHVMeThnYzJocGJTQm1iM0lnZFhOcGJtY2djSEp2WTJWemN5QnBiaUJpY205M2MyVnlYRzVjYm5aaGNpQndjbTlqWlhOeklEMGdiVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQjdmVHRjYmx4dWNISnZZMlZ6Y3k1dVpYaDBWR2xqYXlBOUlDaG1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdkbUZ5SUdOaGJsTmxkRWx0YldWa2FXRjBaU0E5SUhSNWNHVnZaaUIzYVc1a2IzY2dJVDA5SUNkMWJtUmxabWx1WldRblhHNGdJQ0FnSmlZZ2QybHVaRzkzTG5ObGRFbHRiV1ZrYVdGMFpUdGNiaUFnSUNCMllYSWdZMkZ1VUc5emRDQTlJSFI1Y0dWdlppQjNhVzVrYjNjZ0lUMDlJQ2QxYm1SbFptbHVaV1FuWEc0Z0lDQWdKaVlnZDJsdVpHOTNMbkJ2YzNSTlpYTnpZV2RsSUNZbUlIZHBibVJ2ZHk1aFpHUkZkbVZ1ZEV4cGMzUmxibVZ5WEc0Z0lDQWdPMXh1WEc0Z0lDQWdhV1lnS0dOaGJsTmxkRWx0YldWa2FXRjBaU2tnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWm5WdVkzUnBiMjRnS0dZcElIc2djbVYwZFhKdUlIZHBibVJ2ZHk1elpYUkpiVzFsWkdsaGRHVW9aaWtnZlR0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JwWmlBb1kyRnVVRzl6ZENrZ2UxeHVJQ0FnSUNBZ0lDQjJZWElnY1hWbGRXVWdQU0JiWFR0Y2JpQWdJQ0FnSUNBZ2QybHVaRzkzTG1Ga1pFVjJaVzUwVEdsemRHVnVaWElvSjIxbGMzTmhaMlVuTENCbWRXNWpkR2x2YmlBb1pYWXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJ6YjNWeVkyVWdQU0JsZGk1emIzVnlZMlU3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvS0hOdmRYSmpaU0E5UFQwZ2QybHVaRzkzSUh4OElITnZkWEpqWlNBOVBUMGdiblZzYkNrZ0ppWWdaWFl1WkdGMFlTQTlQVDBnSjNCeWIyTmxjM010ZEdsamF5Y3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JsZGk1emRHOXdVSEp2Y0dGbllYUnBiMjRvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9jWFZsZFdVdWJHVnVaM1JvSUQ0Z01Da2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdabTRnUFNCeGRXVjFaUzV6YUdsbWRDZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbWJpZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmU3dnZEhKMVpTazdYRzVjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJRzVsZUhSVWFXTnJLR1p1S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J4ZFdWMVpTNXdkWE5vS0dadUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhkcGJtUnZkeTV3YjNOMFRXVnpjMkZuWlNnbmNISnZZMlZ6Y3kxMGFXTnJKeXdnSnlvbktUdGNiaUFnSUNBZ0lDQWdmVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQnlaWFIxY200Z1puVnVZM1JwYjI0Z2JtVjRkRlJwWTJzb1ptNHBJSHRjYmlBZ0lDQWdJQ0FnYzJWMFZHbHRaVzkxZENobWJpd2dNQ2s3WEc0Z0lDQWdmVHRjYm4wcEtDazdYRzVjYm5CeWIyTmxjM011ZEdsMGJHVWdQU0FuWW5KdmQzTmxjaWM3WEc1d2NtOWpaWE56TG1KeWIzZHpaWElnUFNCMGNuVmxPMXh1Y0hKdlkyVnpjeTVsYm5ZZ1BTQjdmVHRjYm5CeWIyTmxjM011WVhKbmRpQTlJRnRkTzF4dVhHNW1kVzVqZEdsdmJpQnViMjl3S0NrZ2UzMWNibHh1Y0hKdlkyVnpjeTV2YmlBOUlHNXZiM0E3WEc1d2NtOWpaWE56TG1Ga1pFeHBjM1JsYm1WeUlEMGdibTl2Y0R0Y2JuQnliMk5sYzNNdWIyNWpaU0E5SUc1dmIzQTdYRzV3Y205alpYTnpMbTltWmlBOUlHNXZiM0E3WEc1d2NtOWpaWE56TG5KbGJXOTJaVXhwYzNSbGJtVnlJRDBnYm05dmNEdGNibkJ5YjJObGMzTXVjbVZ0YjNabFFXeHNUR2x6ZEdWdVpYSnpJRDBnYm05dmNEdGNibkJ5YjJObGMzTXVaVzFwZENBOUlHNXZiM0E3WEc1Y2JuQnliMk5sYzNNdVltbHVaR2x1WnlBOUlHWjFibU4wYVc5dUlDaHVZVzFsS1NCN1hHNGdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2R3Y205alpYTnpMbUpwYm1ScGJtY2dhWE1nYm05MElITjFjSEJ2Y25SbFpDY3BPMXh1ZlZ4dVhHNHZMeUJVVDBSUEtITm9kSGxzYldGdUtWeHVjSEp2WTJWemN5NWpkMlFnUFNCbWRXNWpkR2x2YmlBb0tTQjdJSEpsZEhWeWJpQW5MeWNnZlR0Y2JuQnliMk5sYzNNdVkyaGthWElnUFNCbWRXNWpkR2x2YmlBb1pHbHlLU0I3WEc0Z0lDQWdkR2h5YjNjZ2JtVjNJRVZ5Y205eUtDZHdjbTlqWlhOekxtTm9aR2x5SUdseklHNXZkQ0J6ZFhCd2IzSjBaV1FuS1R0Y2JuMDdYRzVjYm4wcExtTmhiR3dvZEdocGN5eHlaWEYxYVhKbEtGd2laUzlWS3prM1hDSXBMSFI1Y0dWdlppQnpaV3htSUNFOVBTQmNJblZ1WkdWbWFXNWxaRndpSUQ4Z2MyVnNaaUE2SUhSNWNHVnZaaUIzYVc1a2IzY2dJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSWdQeUIzYVc1a2IzY2dPaUI3ZlN4eVpYRjFhWEpsS0Z3aVluVm1abVZ5WENJcExrSjFabVpsY2l4aGNtZDFiV1Z1ZEhOYk0xMHNZWEpuZFcxbGJuUnpXelJkTEdGeVozVnRaVzUwYzFzMVhTeGhjbWQxYldWdWRITmJObDBzWENJdkxpNWNYRnhjTGk1Y1hGeGNibTlrWlY5dGIyUjFiR1Z6WEZ4Y1hIQnliMk5sYzNOY1hGeGNZbkp2ZDNObGNpNXFjMXdpTEZ3aUx5NHVYRnhjWEM0dVhGeGNYRzV2WkdWZmJXOWtkV3hsYzF4Y1hGeHdjbTlqWlhOelhDSXBJaXdpS0daMWJtTjBhVzl1SUNod2NtOWpaWE56TEdkc2IySmhiQ3hDZFdabVpYSXNYMTloY21kMWJXVnVkREFzWDE5aGNtZDFiV1Z1ZERFc1gxOWhjbWQxYldWdWRESXNYMTloY21kMWJXVnVkRE1zWDE5bWFXeGxibUZ0WlN4ZlgyUnBjbTVoYldVcGUxeHVKM1Z6WlNCemRISnBZM1FuTzF4dVhHNTJZWElnYVc1emRHRnVZMlZ6SUQwZ2UzMDdYRzVjYmk4dlBTQmZablZ1WTNScGIyNXpMbXB6WEc0dkx6MGdYM04wYjNKbExtTnNZWE56TG1welhHNHZMejBnWDIxdlpHRnNMbU5zWVhOekxtcHpYRzR2THowZ1gzQnliMlIxWTNRdVkyeGhjM011YW5OY2JpOHZQU0JmWW1GemEyVjBMbU5zWVhOekxtcHpYRzR2THowZ1gyWnBiSFJsY2k1amJHRnpjeTVxYzF4dVhHNTNhVzVrYjNjdWIyNXNiMkZrSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNCMllYSWdjSEp2WkhWamRITWdQU0J1WlhjZ1UzUnZjbVVvSjNOMFlYUnBZeTl3Y205a2RXTjBjeTVxYzI5dUp5d2dKeU53Y205a2RXTjBjeUF1WTI5dWRHVnVkQ2NwTzF4dUlDQndjbTlrZFdOMGN5NXZia3h2WVdRZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdkbUZ5SUc1aGRpQTlJR1J2WTNWdFpXNTBMbkYxWlhKNVUyVnNaV04wYjNJb0oyNWhkaWNwTEZ4dUlDQWdJQ0FnSUNCaGMybGtaU0E5SUdSdlkzVnRaVzUwTG5GMVpYSjVVMlZzWldOMGIzSW9KMkZ6YVdSbEp5a3NYRzRnSUNBZ0lDQWdJSE5zYVdSbElEMGdaRzlqZFcxbGJuUXVjWFZsY25sVFpXeGxZM1J2Y2lnbllYTnBaR1VnTG5Oc2FXUmxKeWs3WEc0Z0lDQWdkMmx1Wkc5M0xtOXVjMk55YjJ4c0lEMGdablZ1WTNScGIyNGdLR1VwSUh0Y2JpQWdJQ0FnSUhaaGNpQmpiM0p5WldOMFUyTnliMnhzSUQwZ1pTNTBZWEpuWlhRdWMyTnliMnhzYVc1blJXeGxiV1Z1ZEM1elkzSnZiR3hVYjNBZ0xTQmhjMmxrWlM1dlptWnpaWFJVYjNBZ0t5QnVZWFl1YjJabWMyVjBTR1ZwWjJoME8xeHVJQ0FnSUNBZ2FXWWdLR052Y25KbFkzUlRZM0p2Ykd3Z1BDQXdLU0J6Ykdsa1pTNXpkSGxzWlM1MGNtRnVjMlp2Y20wZ1BTQW5kSEpoYm5Oc1lYUmxXU2d3Y0hncEp6dGxiSE5sSUdsbUlDaGpiM0p5WldOMFUyTnliMnhzSUQ0Z1lYTnBaR1V1YjJabWMyVjBTR1ZwWjJoMElDMGdjMnhwWkdVdWIyWm1jMlYwU0dWcFoyaDBLU0J6Ykdsa1pTNXpkSGxzWlM1MGNtRnVjMlp2Y20wZ1BTQW5kSEpoYm5Oc1lYUmxXU2duSUNzZ0tHRnphV1JsTG05bVpuTmxkRWhsYVdkb2RDQXRJSE5zYVdSbExtOW1abk5sZEVobGFXZG9kQ2tnS3lBbmNIZ3BKenRsYkhObElHbG1JQ2hqYjNKeVpXTjBVMk55YjJ4c0lENGdNQ0FtSmlCamIzSnlaV04wVTJOeWIyeHNJRHdnWVhOcFpHVXViMlptYzJWMFNHVnBaMmgwSUMwZ2MyeHBaR1V1YjJabWMyVjBTR1ZwWjJoMEtTQnpiR2xrWlM1emRIbHNaUzUwY21GdWMyWnZjbTBnUFNBbmRISmhibk5zWVhSbFdTZ25JQ3NnWTI5eWNtVmpkRk5qY205c2JDQXJJQ2R3ZUNrbk8xeHVJQ0FnSUgwN1hHNGdJSDA3WEc1OU8xeHVmU2t1WTJGc2JDaDBhR2x6TEhKbGNYVnBjbVVvWENKbEwxVXJPVGRjSWlrc2RIbHdaVzltSUhObGJHWWdJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSWdQeUJ6Wld4bUlEb2dkSGx3Wlc5bUlIZHBibVJ2ZHlBaFBUMGdYQ0oxYm1SbFptbHVaV1JjSWlBL0lIZHBibVJ2ZHlBNklIdDlMSEpsY1hWcGNtVW9YQ0ppZFdabVpYSmNJaWt1UW5WbVptVnlMR0Z5WjNWdFpXNTBjMXN6WFN4aGNtZDFiV1Z1ZEhOYk5GMHNZWEpuZFcxbGJuUnpXelZkTEdGeVozVnRaVzUwYzFzMlhTeGNJaTltWVd0bFgySTRNek5qWWk1cWMxd2lMRndpTDF3aUtTSmRmUT09Il19
